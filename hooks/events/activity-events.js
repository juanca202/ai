#!/usr/bin/env node
'use strict';

// Hooks PreToolUse / PostToolUse / PostToolUseFailure: notifica seis eventos de
// actividad de sesión a specification.trackingUrl — mismo endpoint, mismo estilo
// y mismas garantías que ../events/artifact-events.js (sin dependencias externas,
// falla en silencio, respeta specification.trackingEnabled):
//
// - tool.called / tool.completed — Bash que invoca git o un runner de pruebas
//   reconocido por patrón heurístico.
// - question.asked / question.answered — AskUserQuestion.
// - implementation.started / implementation.completed — se infieren comparando,
//   en cada PostToolUse, si .sdd-devkit/current-iteration.json (que mantiene
//   work-implement) apareció, desapareció o cambió de iterationId respecto de la
//   última corrida conocida, persistida en .sdd-devkit/activity-iteration-state.json.
//
// PostToolUse SOLO se dispara cuando la tool call tiene éxito (Bash: exit 0). Un
// comando git/test que falla (exit != 0) dispara PostToolUseFailure en su lugar,
// con un payload distinto (`error`: string que empieza con "Exit code N", no
// `tool_response`) — por eso tool.completed se construye desde dos hooks
// distintos según el resultado. Ver hooks/README.md para el detalle empírico
// (payloads no confirmados por la documentación pública al planificar el WI).

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFileSync } = require('child_process');

const SETTINGS_RELATIVE_PATH = '.sdd-devkit/settings.json';
const ITERATION_RELATIVE_PATH = '.sdd-devkit/current-iteration.json';
const ITERATION_STATE_RELATIVE_PATH = '.sdd-devkit/activity-iteration-state.json';
const HTTP_TIMEOUT_MS = 5000;

// Heurísticas de mejor esfuerzo (mismo espíritu que DELETE_COMMAND_RE en
// artifact-events.js): no resuelven el stack exacto del repo, solo reconocen el
// patrón textual del comando. Fuente de los patrones de test:
// skills/quality-check/references/stacks.md (filas Unit/E2E).
const GIT_COMMAND_RE = /\bgit\b/i;
const TEST_COMMAND_RE =
  /\b(?:npm|yarn|pnpm)\s+(?:run\s+)?[\w:.-]*(?:test|e2e)[\w:.-]*\b|\bmvn\s+(?:test|verify)\b|\bgradle\s+test\b|\bpytest\b|\bgo\s+test\b|\bcargo\s+test\b|\bdotnet\s+test\b|\bjest\b|\bvitest\b|\bmocha\b|\bplaywright\s+test\b|\bcypress\s+run\b/i;
const EXIT_CODE_RE = /^Exit code (-?\d+)/;

function classifyCommand(command) {
  if (typeof command !== 'string' || !command) return null;
  if (GIT_COMMAND_RE.test(command)) return 'git';
  if (TEST_COMMAND_RE.test(command)) return 'test';
  return null;
}

function runGit(repoRoot, args) {
  try {
    return execFileSync('git', ['-C', repoRoot, ...args], {
      encoding: 'utf-8',
      timeout: 10000,
    }).replace(/\r?\n+$/, '');
  } catch {
    return '';
  }
}

function readJsonFile(absPath) {
  try {
    return JSON.parse(fs.readFileSync(absPath, 'utf-8'));
  } catch {
    return null;
  }
}

function readIterationFile(repoRoot) {
  const data = readJsonFile(path.join(repoRoot, ITERATION_RELATIVE_PATH));
  if (!data || typeof data.iterationId !== 'string') return null;
  return { iterationId: data.iterationId, key: typeof data.key === 'string' ? data.key : '' };
}

function readIterationId(repoRoot) {
  const current = readIterationFile(repoRoot);
  return current ? current.iterationId : '';
}

function readActivityState(repoRoot) {
  const data = readJsonFile(path.join(repoRoot, ITERATION_STATE_RELATIVE_PATH));
  return { lastIterationId: data && typeof data.lastIterationId === 'string' ? data.lastIterationId : null };
}

function writeActivityState(repoRoot, state) {
  try {
    fs.writeFileSync(path.join(repoRoot, ITERATION_STATE_RELATIVE_PATH), JSON.stringify(state));
  } catch {
    // Best effort: si no se puede persistir, el próximo hook simplemente
    // reintentará la comparación con el estado anterior conocido.
  }
}

function baseEventFields(hookInput, repoRoot, name, nowIso, iterationIdOverride) {
  const sessionId = hookInput.session_id || '';
  return {
    name,
    timestamp: nowIso,
    sessionId,
    processId: hookInput.prompt_id || sessionId,
    iterationId: iterationIdOverride !== undefined ? iterationIdOverride : readIterationId(repoRoot),
    agent: 'claude-code',
    model: '',
  };
}

// tool.called (PreToolUse, Bash) / tool.completed (PostToolUse o
// PostToolUseFailure, Bash) — null si el comando no matchea ninguna categoría.
function buildToolCalledEvent(hookInput, repoRoot, nowIso) {
  const command = hookInput.tool_input && hookInput.tool_input.command;
  const category = classifyCommand(command);
  if (!category) return null;
  return {
    ...baseEventFields(hookInput, repoRoot, 'tool.called', nowIso),
    payload: { command, category, cwd: hookInput.cwd || '' },
  };
}

function buildToolCompletedEventFromSuccess(hookInput, repoRoot, nowIso) {
  const command = hookInput.tool_input && hookInput.tool_input.command;
  const category = classifyCommand(command);
  if (!category) return null;
  const response = hookInput.tool_response || {};
  return {
    ...baseEventFields(hookInput, repoRoot, 'tool.completed', nowIso),
    payload: {
      command,
      category,
      cwd: hookInput.cwd || '',
      result: {
        exitCode: 0, // PostToolUse solo se dispara si el comando tuvo éxito
        stdout: typeof response.stdout === 'string' ? response.stdout : '',
        stderr: typeof response.stderr === 'string' ? response.stderr : '',
        interrupted: !!response.interrupted,
      },
    },
  };
}

function buildToolCompletedEventFromFailure(hookInput, repoRoot, nowIso) {
  const command = hookInput.tool_input && hookInput.tool_input.command;
  const category = classifyCommand(command);
  if (!category) return null;
  const error = typeof hookInput.error === 'string' ? hookInput.error : '';
  const exitMatch = EXIT_CODE_RE.exec(error);
  return {
    ...baseEventFields(hookInput, repoRoot, 'tool.completed', nowIso),
    payload: {
      command,
      category,
      cwd: hookInput.cwd || '',
      result: {
        exitCode: exitMatch ? Number(exitMatch[1]) : null,
        output: error,
        interrupted: !!hookInput.is_interrupt,
      },
    },
  };
}

// question.asked (PreToolUse, AskUserQuestion) / question.answered
// (PostToolUse, AskUserQuestion) — degradan con gracia (AC-006): si falta un
// campo esperado, se omite del evento en vez de fallar.
function buildQuestionAskedEvent(hookInput, repoRoot, nowIso) {
  const questions = hookInput.tool_input && hookInput.tool_input.questions;
  if (!Array.isArray(questions)) return null;
  return {
    ...baseEventFields(hookInput, repoRoot, 'question.asked', nowIso),
    payload: {
      questions: questions.map((q) => ({
        question: q && typeof q.question === 'string' ? q.question : '',
        header: q && typeof q.header === 'string' ? q.header : '',
        options: Array.isArray(q && q.options)
          ? q.options.map((o) => ({
              label: o && typeof o.label === 'string' ? o.label : '',
              description: o && typeof o.description === 'string' ? o.description : '',
            }))
          : [],
        multiSelect: !!(q && q.multiSelect),
      })),
    },
  };
}

function buildQuestionAnsweredEvent(hookInput, repoRoot, nowIso) {
  const response = hookInput.tool_response || {};
  const hasAnswers = !!(response.answers && typeof response.answers === 'object');
  const hasFreeform = typeof response.response === 'string';
  if (!hasAnswers && !hasFreeform) return null;
  const payload = {};
  if (hasAnswers) payload.answers = response.answers;
  if (hasFreeform) payload.response = response.response;
  return { ...baseEventFields(hookInput, repoRoot, 'question.answered', nowIso), payload };
}

// implementation.started / implementation.completed — comparan el estado de
// current-iteration.json antes/después contra el último iterationId conocido.
function buildImplementationEvents(hookInput, repoRoot, nowIso) {
  const current = readIterationFile(repoRoot);
  const state = readActivityState(repoRoot);
  const events = [];

  if (current && state.lastIterationId !== current.iterationId) {
    events.push({
      ...baseEventFields(hookInput, repoRoot, 'implementation.started', nowIso, current.iterationId),
      payload: { iterationId: current.iterationId, key: current.key },
    });
    writeActivityState(repoRoot, { lastIterationId: current.iterationId });
  } else if (!current && state.lastIterationId) {
    events.push({
      ...baseEventFields(hookInput, repoRoot, 'implementation.completed', nowIso, state.lastIterationId),
      payload: { iterationId: state.lastIterationId },
    });
    writeActivityState(repoRoot, { lastIterationId: null });
  }

  return events;
}

const IMPLEMENTATION_STATE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'Bash']);

// Despacha por (hook_event_name, tool_name) los eventos a notificar. Devuelve
// siempre un array (posiblemente vacío) — nunca lanza por una combinación no
// reconocida.
function buildEvents(hookInput, repoRoot, nowIso) {
  const eventName = hookInput.hook_event_name;
  const toolName = hookInput.tool_name;
  const events = [];

  if (eventName === 'PreToolUse' && toolName === 'Bash') {
    const event = buildToolCalledEvent(hookInput, repoRoot, nowIso);
    if (event) events.push(event);
  } else if (eventName === 'PreToolUse' && toolName === 'AskUserQuestion') {
    const event = buildQuestionAskedEvent(hookInput, repoRoot, nowIso);
    if (event) events.push(event);
  } else if (eventName === 'PostToolUse' && toolName === 'AskUserQuestion') {
    const event = buildQuestionAnsweredEvent(hookInput, repoRoot, nowIso);
    if (event) events.push(event);
  } else if (eventName === 'PostToolUse' && toolName === 'Bash') {
    const completed = buildToolCompletedEventFromSuccess(hookInput, repoRoot, nowIso);
    if (completed) events.push(completed);
    events.push(...buildImplementationEvents(hookInput, repoRoot, nowIso));
  } else if (eventName === 'PostToolUse' && IMPLEMENTATION_STATE_TOOLS.has(toolName)) {
    events.push(...buildImplementationEvents(hookInput, repoRoot, nowIso));
  } else if (eventName === 'PostToolUseFailure' && toolName === 'Bash') {
    const completed = buildToolCompletedEventFromFailure(hookInput, repoRoot, nowIso);
    if (completed) events.push(completed);
  }

  return events;
}

function postEvent(url, event, token) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve();
      return;
    }
    const client = parsed.protocol === 'http:' ? http : https;
    const body = JSON.stringify(event);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const req = client.request(parsed, { method: 'POST', headers, timeout: HTTP_TIMEOUT_MS }, (res) => {
      res.resume();
      resolve();
    });
    req.on('timeout', () => req.destroy());
    req.on('error', (err) => {
      process.stderr.write(`[specification] no se pudo notificar: ${err.message}\n`);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf-8');
  } catch {
    return '';
  }
}

async function main() {
  let hookInput;
  try {
    hookInput = JSON.parse(readStdin());
  } catch {
    return;
  }

  const cwd = hookInput.cwd || process.cwd();
  const repoRoot = runGit(cwd, ['rev-parse', '--show-toplevel']);
  if (!repoRoot) return;

  const settings = readJsonFile(path.join(repoRoot, SETTINGS_RELATIVE_PATH));
  if (!settings) return;
  const specification = settings.specification || {};
  if (!specification.trackingEnabled || !specification.trackingUrl) return;

  const nowIso = new Date().toISOString();
  const events = buildEvents(hookInput, repoRoot, nowIso);

  for (const event of events) {
    await postEvent(specification.trackingUrl, event, process.env.SDD_DEVKIT_ACCESS_TOKEN);
  }
}

module.exports = {
  classifyCommand,
  readIterationFile,
  readActivityState,
  writeActivityState,
  buildToolCalledEvent,
  buildToolCompletedEventFromSuccess,
  buildToolCompletedEventFromFailure,
  buildQuestionAskedEvent,
  buildQuestionAnsweredEvent,
  buildImplementationEvents,
  buildEvents,
};

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`[specification] error inesperado: ${err.message}\n`);
  });
}
