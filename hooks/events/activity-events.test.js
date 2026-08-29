#!/usr/bin/env node
'use strict';

// Pruebas de hooks/events/activity-events.js (WI-002). Node built-in test
// runner + assert, sin dependencias externas (AC-010). Ejecutar con:
//   node --test hooks/events/activity-events.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
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
} = require('./activity-events.js');

function makeRepoRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'activity-events-'));
}

function baseHookInput(overrides) {
  return {
    session_id: 'sess-1',
    prompt_id: 'prompt-1',
    cwd: '/repo',
    ...overrides,
  };
}

// --- classifyCommand (AC-001, AC-002) ----------------------------------

test('classifyCommand: reconoce comandos git', () => {
  assert.equal(classifyCommand('git status'), 'git');
  assert.equal(classifyCommand('git commit -m "x"'), 'git');
});

test('classifyCommand: reconoce runners de test por stack', () => {
  assert.equal(classifyCommand('npm test'), 'test');
  assert.equal(classifyCommand('npm run test:unit'), 'test');
  assert.equal(classifyCommand('npm run e2e'), 'test');
  assert.equal(classifyCommand('yarn test'), 'test');
  assert.equal(classifyCommand('pnpm test'), 'test');
  assert.equal(classifyCommand('mvn test'), 'test');
  assert.equal(classifyCommand('mvn verify'), 'test');
  assert.equal(classifyCommand('gradle test'), 'test');
  assert.equal(classifyCommand('pytest'), 'test');
  assert.equal(classifyCommand('go test ./...'), 'test');
  assert.equal(classifyCommand('cargo test'), 'test');
  assert.equal(classifyCommand('dotnet test'), 'test');
  assert.equal(classifyCommand('npx jest'), 'test');
  assert.equal(classifyCommand('npx vitest run'), 'test');
  assert.equal(classifyCommand('npx mocha'), 'test');
  assert.equal(classifyCommand('npx playwright test'), 'test');
  assert.equal(classifyCommand('npx cypress run'), 'test');
});

test('classifyCommand: no matchea comandos ajenos a git/test (AC-001, no ruido)', () => {
  assert.equal(classifyCommand('ls -la'), null);
  assert.equal(classifyCommand('npm run build'), null);
  assert.equal(classifyCommand('cat package.json'), null);
  assert.equal(classifyCommand(undefined), null);
});

// --- tool.called / tool.completed (AC-001, AC-002, AC-003, AC-004) -----

test('buildToolCalledEvent: null si el comando no matchea', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'ls' } });
  assert.equal(buildToolCalledEvent(hookInput, root, '2026-01-01T00:00:00.000Z'), null);
});

test('buildToolCalledEvent: payload con command/category/cwd para git', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_input: { command: 'git push' } });
  const event = buildToolCalledEvent(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.name, 'tool.called');
  assert.equal(event.payload.command, 'git push');
  assert.equal(event.payload.category, 'git');
  assert.equal(event.payload.cwd, '/repo');
  assert.equal(event.sessionId, 'sess-1');
  assert.equal(event.processId, 'prompt-1');
});

test('buildToolCompletedEventFromSuccess: exitCode 0 implicito y stdout/stderr del tool_response', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    tool_input: { command: 'npm test' },
    tool_response: { stdout: 'ok', stderr: '', interrupted: false },
  });
  const event = buildToolCompletedEventFromSuccess(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.payload.category, 'test');
  assert.deepEqual(event.payload.result, { exitCode: 0, stdout: 'ok', stderr: '', interrupted: false });
});

test('buildToolCompletedEventFromSuccess: null si el comando no matchea', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_input: { command: 'ls' }, tool_response: { stdout: '' } });
  assert.equal(buildToolCompletedEventFromSuccess(hookInput, root, '2026-01-01T00:00:00.000Z'), null);
});

test('buildToolCompletedEventFromFailure: parsea el exit code del campo error (PostToolUseFailure)', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    tool_input: { command: 'npm test' },
    error: "Exit code 1\nError: expected true to be false",
    is_interrupt: false,
  });
  const event = buildToolCompletedEventFromFailure(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.name, 'tool.completed');
  assert.equal(event.payload.category, 'test');
  assert.equal(event.payload.result.exitCode, 1);
  assert.equal(event.payload.result.output, "Exit code 1\nError: expected true to be false");
  assert.equal(event.payload.result.interrupted, false);
});

test('buildToolCompletedEventFromFailure: exitCode null si el error no trae "Exit code N"', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_input: { command: 'git push' }, error: 'network unreachable' });
  const event = buildToolCompletedEventFromFailure(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.payload.result.exitCode, null);
});

test('buildToolCompletedEventFromFailure: null si el comando no matchea git/test', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_input: { command: 'npm run build' }, error: 'Exit code 1\nboom' });
  assert.equal(buildToolCompletedEventFromFailure(hookInput, root, '2026-01-01T00:00:00.000Z'), null);
});

// --- question.asked / question.answered (AC-005, AC-006) ----------------

test('buildQuestionAskedEvent: extrae preguntas y opciones', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    tool_input: {
      questions: [
        { question: '¿Continuo?', header: 'Confirmar', options: [{ label: 'Si', description: 'seguir' }], multiSelect: false },
      ],
    },
  });
  const event = buildQuestionAskedEvent(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.name, 'question.asked');
  assert.equal(event.payload.questions.length, 1);
  assert.equal(event.payload.questions[0].question, '¿Continuo?');
  assert.equal(event.payload.questions[0].options[0].label, 'Si');
});

test('buildQuestionAskedEvent: degrada con gracia si faltan options (AC-006)', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_input: { questions: [{ question: '¿Ok?' }] } });
  const event = buildQuestionAskedEvent(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.deepEqual(event.payload.questions[0].options, []);
  assert.equal(event.payload.questions[0].header, '');
});

test('buildQuestionAskedEvent: null si tool_input no trae questions', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_input: {} });
  assert.equal(buildQuestionAskedEvent(hookInput, root, '2026-01-01T00:00:00.000Z'), null);
});

test('buildQuestionAnsweredEvent: incluye answers cuando estan presentes', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_response: { answers: { '¿Continuo?': 'Si' } } });
  const event = buildQuestionAnsweredEvent(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.name, 'question.answered');
  assert.deepEqual(event.payload.answers, { '¿Continuo?': 'Si' });
});

test('buildQuestionAnsweredEvent: null si no hay answers ni response (AC-006)', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ tool_response: {} });
  assert.equal(buildQuestionAnsweredEvent(hookInput, root, '2026-01-01T00:00:00.000Z'), null);
});

test('buildQuestionAskedEvent: mapea el schema de AskQuestion de Cursor (prompt/id/allow_multiple)', () => {
  const root = makeRepoRoot();
  const hookInput = {
    hook_event_name: 'preToolUse',
    tool_name: 'AskQuestion',
    cursor_version: '1.0.0',
    model_id: 'claude-opus-4-7',
    conversation_id: 'conv-1',
    generation_id: 'gen-1',
    cwd: '/repo',
    tool_input: {
      questions: [
        {
          id: 'continuar',
          prompt: '¿Continuo?',
          options: [{ id: 'si', label: 'Si' }, { id: 'no', label: 'No' }],
          allow_multiple: true,
        },
      ],
    },
  };
  const event = buildQuestionAskedEvent(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.name, 'question.asked');
  assert.equal(event.agent, 'cursor');
  assert.equal(event.model, 'claude-opus-4-7');
  assert.equal(event.sessionId, 'conv-1');
  assert.equal(event.processId, 'gen-1');
  assert.equal(event.payload.questions[0].question, '¿Continuo?');
  assert.equal(event.payload.questions[0].header, 'continuar');
  assert.equal(event.payload.questions[0].multiSelect, true);
  assert.equal(event.payload.questions[0].options[0].label, 'Si');
});

test('buildQuestionAnsweredEvent: lee tool_output JSON de Cursor', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    hook_event_name: 'postToolUse',
    tool_name: 'AskQuestion',
    cursor_version: '1.0.0',
    tool_output: JSON.stringify({ continuar: 'si' }),
  });
  const event = buildQuestionAnsweredEvent(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(event.name, 'question.answered');
  assert.equal(event.agent, 'cursor');
  assert.deepEqual(event.payload.answers, { continuar: 'si' });
});

// --- implementation.started / implementation.completed (AC-007, AC-008) -

function writeIterationFile(root, data) {
  fs.mkdirSync(path.join(root, '.sdd-devkit'), { recursive: true });
  fs.writeFileSync(path.join(root, '.sdd-devkit', 'current-iteration.json'), JSON.stringify(data));
}

function removeIterationFile(root) {
  fs.rmSync(path.join(root, '.sdd-devkit', 'current-iteration.json'), { force: true });
}

test('buildImplementationEvents: emite started cuando el archivo aparece por primera vez', () => {
  const root = makeRepoRoot();
  writeIterationFile(root, { iterationId: 'iter-1', key: 'WI-002' });
  const hookInput = baseHookInput({});
  const events = buildImplementationEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'implementation.started');
  assert.deepEqual(events[0].payload, { iterationId: 'iter-1', key: 'WI-002' });
  assert.deepEqual(readActivityState(root), { lastIterationId: 'iter-1' });
});

test('buildImplementationEvents: no repite started en llamadas subsiguientes con el mismo iterationId', () => {
  const root = makeRepoRoot();
  writeIterationFile(root, { iterationId: 'iter-1', key: 'WI-002' });
  buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:00:00.000Z');
  const events = buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:05:00.000Z');
  assert.deepEqual(events, []);
});

test('buildImplementationEvents: emite started de nuevo si el iterationId cambia sin que el archivo desaparezca (AC-007)', () => {
  const root = makeRepoRoot();
  writeIterationFile(root, { iterationId: 'iter-1', key: 'WI-002' });
  buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:00:00.000Z');
  writeIterationFile(root, { iterationId: 'iter-2', key: 'WI-002' });
  const events = buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:05:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'implementation.started');
  assert.equal(events[0].payload.iterationId, 'iter-2');
});

test('buildImplementationEvents: emite completed cuando el archivo desaparece', () => {
  const root = makeRepoRoot();
  writeIterationFile(root, { iterationId: 'iter-1', key: 'WI-002' });
  buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:00:00.000Z');
  removeIterationFile(root);
  const events = buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:10:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'implementation.completed');
  assert.deepEqual(events[0].payload, { iterationId: 'iter-1' });
  assert.deepEqual(readActivityState(root), { lastIterationId: null });
});

test('buildImplementationEvents: sin archivo y sin estado previo, no emite nada', () => {
  const root = makeRepoRoot();
  const events = buildImplementationEvents(baseHookInput({}), root, '2026-01-01T00:00:00.000Z');
  assert.deepEqual(events, []);
});

test('readIterationFile / writeActivityState: tolera JSON invalido sin lanzar (AC-011)', () => {
  const root = makeRepoRoot();
  fs.mkdirSync(path.join(root, '.sdd-devkit'), { recursive: true });
  fs.writeFileSync(path.join(root, '.sdd-devkit', 'current-iteration.json'), '{not json');
  assert.equal(readIterationFile(root), null);
  assert.deepEqual(readActivityState(root), { lastIterationId: null });
});

// --- buildEvents: despacho por (hook_event_name, tool_name) -------------

test('buildEvents: PreToolUse + Bash con git produce tool.called', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'git status' } });
  const events = buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'tool.called');
});

test('buildEvents: PostToolUse + Bash exitoso produce tool.completed y, si aplica, implementation.started', () => {
  const root = makeRepoRoot();
  writeIterationFile(root, { iterationId: 'iter-1', key: 'WI-002' });
  const hookInput = baseHookInput({
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'pytest' },
    tool_response: { stdout: '', stderr: '', interrupted: false },
  });
  const events = buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  const names = events.map((e) => e.name).sort();
  assert.deepEqual(names, ['implementation.started', 'tool.completed']);
});

test('buildEvents: PostToolUseFailure + Bash produce tool.completed (no implementation.*)', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    hook_event_name: 'PostToolUseFailure',
    tool_name: 'Bash',
    tool_input: { command: 'pytest' },
    error: 'Exit code 1\nfail',
  });
  const events = buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'tool.completed');
});

test('buildEvents: PostToolUse + Write sin cambios en current-iteration.json no emite nada', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: '/repo/x.md' } });
  assert.deepEqual(buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z'), []);
});

test('buildEvents: PreToolUse + AskUserQuestion produce question.asked', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    hook_event_name: 'PreToolUse',
    tool_name: 'AskUserQuestion',
    tool_input: { questions: [{ question: '¿Ok?', options: [{ label: 'Si' }] }] },
  });
  const events = buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'question.asked');
  assert.equal(events[0].agent, 'claude-code');
});

test('buildEvents: preToolUse + AskQuestion produce question.asked', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    hook_event_name: 'preToolUse',
    tool_name: 'AskQuestion',
    tool_input: { questions: [{ prompt: '¿Ok?', options: [{ id: 'si', label: 'Si' }] }] },
  });
  const events = buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'question.asked');
  assert.equal(events[0].payload.questions[0].question, '¿Ok?');
});

test('buildEvents: postToolUse + AskQuestion produce question.answered', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({
    hook_event_name: 'postToolUse',
    tool_name: 'AskQuestion',
    tool_output: JSON.stringify({ answers: { '¿Ok?': 'Si' } }),
  });
  const events = buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z');
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'question.answered');
  assert.deepEqual(events[0].payload.answers, { '¿Ok?': 'Si' });
});

test('buildEvents: combinacion no reconocida devuelve array vacio sin lanzar', () => {
  const root = makeRepoRoot();
  const hookInput = baseHookInput({ hook_event_name: 'Notification', tool_name: 'Bash' });
  assert.deepEqual(buildEvents(hookInput, root, '2026-01-01T00:00:00.000Z'), []);
});
