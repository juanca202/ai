#!/usr/bin/env node
'use strict';

// Hook PostToolUse(Write|Edit|MultiEdit|Bash): notifica artifact.created /
// artifact.updated / artifact.deleted a trackingUrl (raíz del settings).
//
// - Write/Edit/MultiEdit sobre un archivo dentro de specification.basePath:
//   se clasifica con `git status --porcelain` — "??" (untracked) es
//   artifact.created, cualquier otro estado no vacío (tracked, con diff) es
//   artifact.updated. Se lee el encabezado del archivo para construir el
//   payload completo (code, name, status...).
// - Bash: no hay tool nativa de borrado, así que rm/git rm/mv pasan por
//   Bash. Tras CUALQUIER Bash se escanea `git status --porcelain` sobre
//   basePath buscando entradas de borrado (columna de índice o de working
//   tree en "D"). El archivo ya no existe, así que el código del artefacto
//   se deriva de la ruta (nombre de archivo o carpeta padre), no de su
//   encabezado — payload más liviano que created/updated.
//
// Lee la config del proyecto en <repo>/.sdd-devkit/settings.json y hace un
// POST a trackingUrl (raíz del settings).
//
// Falla silenciosamente ante cualquier condición ambigua o error: este hook
// nunca debe bloquear ni ensuciar la sesión de Claude Code (PostToolUse
// tampoco puede bloquear la tool, que ya se ejecutó).

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFileSync } = require('child_process');

const SETTINGS_RELATIVE_PATH = '.sdd-devkit/settings.json';
const ITERATION_RELATIVE_PATH = '.sdd-devkit/current-iteration.json';
const HTTP_TIMEOUT_MS = 5000;
const FILE_PATH_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);

// Prefijo de código -> tipo de artefacto para el payload del evento.
const TYPE_BY_PREFIX = {
  US: 'user-story',
  TK: 'technical-task',
  WI: 'work-item',
  FT: 'feature',
  TC: 'test-case',
  RS: 'research',
};

const HEADING_RE = /^#\s+([A-Za-z]{2,6}-\d+)\s*[:—–-]*\s*(.*?)\s*$/;
const STATUS_RE = /^\*\*Estado:\*\*\s*(.+?)\s*$/;
const ANCESTOR_CODE_RE = /^([A-Za-z]{2,6}-\d+)/;
// Heurística para no escanear basePath en cada Bash de la sesión: mientras
// un borrado sigue sin commitear (staged o no), git status lo sigue
// reportando, así que sin este filtro CUALQUIER Bash posterior (lint,
// build, test) re-dispararía el mismo artifact.deleted. Se acota el
// escaneo a comandos que parecen borrar o mover archivos.
const DELETE_COMMAND_RE = /\b(rm|rmdir|git\s+rm|mv)\b/i;

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

function runGit(repoRoot, args) {
  try {
    // No usar String#trim(): `git status --porcelain` es de columnas fijas
    // y una línea de un solo carácter de estado empieza con un espacio
    // (p. ej. " D archivo" = borrado sin stagear). trim() se lo comería y
    // correría el resto del parseo. Solo se recorta el salto de línea
    // final, que es lo único que sobra en salidas de una sola línea
    // (rev-parse, config --get).
    return execFileSync('git', ['-C', repoRoot, ...args], {
      encoding: 'utf-8',
      timeout: 10000,
    }).replace(/\r?\n+$/, '');
  } catch {
    return '';
  }
}

function resolveRepositoryName(repoRoot) {
  const remoteUrl = runGit(repoRoot, ['config', '--get', 'remote.origin.url']);
  if (remoteUrl) {
    const name = remoteUrl.replace(/\/+$/, '').split('/').pop();
    return name.replace(/\.git$/, '');
  }
  return path.basename(repoRoot.replace(/\/+$/, ''));
}

function parseArtifact(absPath) {
  const content = fs.readFileSync(absPath, 'utf-8');
  let code = null;
  let name = null;
  let status = null;
  for (const line of content.split('\n')) {
    if (code === null) {
      const headingMatch = HEADING_RE.exec(line);
      if (headingMatch) {
        code = headingMatch[1].toUpperCase();
        name = headingMatch[2];
        continue;
      }
    }
    const statusMatch = STATUS_RE.exec(line);
    if (statusMatch) {
      status = slugify(statusMatch[1]);
    }
  }
  if (!code || !name) return null;
  return { code, name, status: status || '' };
}

function resolveParentId(relPath, ownCode) {
  const parts = relPath.split('/').slice(0, -1);
  for (const part of parts) {
    const match = ANCESTOR_CODE_RE.exec(part);
    if (match && match[1].toUpperCase() !== ownCode) {
      return match[1].toUpperCase();
    }
  }
  return '';
}

function buildArtifactPath(relPath) {
  const withoutExt = relPath.replace(/\.md$/, '');
  if (path.basename(withoutExt) === 'README') {
    return path.dirname(withoutExt);
  }
  return withoutExt;
}

// El archivo borrado ya no existe: no se puede leer su encabezado. Se
// deriva el código desde el nombre de archivo (TK-XXX-slug.md, RS-XXX-*)
// o, si es un README.md, desde el nombre de su carpeta padre (US-XXX-*/,
// WI-XXX-*/). Devuelve null si la ruta no matchea ningún patrón de código.
function deriveCodeFromPath(relPath) {
  const base = path.basename(relPath, '.md');
  if (base === 'README') {
    const parent = path.basename(path.dirname(relPath));
    const match = ANCESTOR_CODE_RE.exec(parent);
    return match ? match[1].toUpperCase() : null;
  }
  const match = ANCESTOR_CODE_RE.exec(base);
  return match ? match[1].toUpperCase() : null;
}

function readIterationId(repoRoot) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(repoRoot, ITERATION_RELATIVE_PATH), 'utf-8'));
    return typeof data.iterationId === 'string' ? data.iterationId : '';
  } catch {
    return '';
  }
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

function baseEventFields(hookInput, repoRoot, name, nowIso) {
  const sessionId = hookInput.session_id || '';
  return {
    name,
    timestamp: nowIso,
    sessionId,
    // processId: prompt_id identifica el turno actual y se mantiene igual
    // entre varias tool calls del mismo turno; si el hook no lo recibe, cae
    // a sessionId. iterationId sale de .sdd-devkit/current-iteration.json
    // si work-implement lo dejó escrito. model queda vacío: Claude Code no
    // lo expone a este hook. Ver hooks/README.md.
    processId: hookInput.prompt_id || sessionId,
    iterationId: readIterationId(repoRoot),
    agent: 'claude-code',
    model: '',
  };
}

// Write / Edit / MultiEdit: clasifica el archivo tocado como created o
// updated (o ninguno, si no matchea alcance/patrón) y devuelve el evento a
// postear, o null.
function buildCreatedOrUpdatedEvent(hookInput, repoRoot, specification, basePathNorm) {
  let filePath = hookInput.tool_input && hookInput.tool_input.file_path;
  const cwd = hookInput.cwd || process.cwd();
  if (!filePath) return null;
  if (!path.isAbsolute(filePath)) filePath = path.join(cwd, filePath);

  const relPath = path.relative(repoRoot, filePath).split(path.sep).join('/');
  if (!relPath.startsWith(basePathNorm)) return null;

  const status = runGit(repoRoot, ['status', '--porcelain', '--', relPath]);
  if (!status) return null; // sin diff contra git: nada que notificar

  const isNew = status.slice(0, 2) === '??';

  let artifact;
  try {
    artifact = parseArtifact(filePath);
  } catch {
    return null;
  }
  if (!artifact) return null;

  const code = artifact.code;
  const prefix = code.split('-')[0].toUpperCase();
  const nowIso = new Date().toISOString();

  return {
    ...baseEventFields(hookInput, repoRoot, isNew ? 'artifact.created' : 'artifact.updated', nowIso),
    artifactId: code.toLowerCase(),
    payload: {
      id: code.toLowerCase(),
      code,
      type: TYPE_BY_PREFIX[prefix] || prefix.toLowerCase(),
      name: artifact.name,
      status: artifact.status,
      parentId: resolveParentId(relPath, code),
      implementable: true,
      repository: resolveRepositoryName(repoRoot),
      path: buildArtifactPath(relPath),
      [isNew ? 'createdAt' : 'updatedAt']: nowIso,
    },
  };
}

// Bash: escanea basePath en busca de artefactos borrados (columna de
// índice o de working tree en "D" en `git status --porcelain`). Devuelve
// un evento por cada ruta cuyo código se puede derivar del path.
function buildDeletedEvents(hookInput, repoRoot, basePath, basePathNorm) {
  const status = runGit(repoRoot, ['status', '--porcelain', '--', basePath]);
  if (!status) return [];

  const events = [];
  const nowIso = new Date().toISOString();
  for (const line of status.split('\n')) {
    if (line.length < 4) continue;
    const indexState = line[0];
    const worktreeState = line[1];
    if (indexState !== 'D' && worktreeState !== 'D') continue;

    const relPath = line.slice(3).trim();
    if (!relPath.startsWith(basePathNorm)) continue;

    const code = deriveCodeFromPath(relPath);
    if (!code) continue;
    const prefix = code.split('-')[0].toUpperCase();

    events.push({
      ...baseEventFields(hookInput, repoRoot, 'artifact.deleted', nowIso),
      artifactId: code.toLowerCase(),
      payload: {
        id: code.toLowerCase(),
        code,
        type: TYPE_BY_PREFIX[prefix] || prefix.toLowerCase(),
        repository: resolveRepositoryName(repoRoot),
        path: buildArtifactPath(relPath),
        deletedAt: nowIso,
      },
    });
  }
  return events;
}

async function main() {
  let hookInput;
  try {
    hookInput = JSON.parse(readStdin());
  } catch {
    return;
  }

  const toolName = hookInput.tool_name;
  const cwd = hookInput.cwd || process.cwd();

  const repoRoot = runGit(cwd, ['rev-parse', '--show-toplevel']);
  if (!repoRoot) return;

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(path.join(repoRoot, SETTINGS_RELATIVE_PATH), 'utf-8'));
  } catch {
    return;
  }

  const specification = settings.specification || {};
  if (!settings.trackingEnabled || !settings.trackingUrl) return;

  const basePath = specification.basePath || 'docs/specs/';
  const basePathNorm = `${basePath.replace(/^\/+|\/+$/g, '')}/`;

  let events;
  if (FILE_PATH_TOOLS.has(toolName)) {
    const event = buildCreatedOrUpdatedEvent(hookInput, repoRoot, specification, basePathNorm);
    events = event ? [event] : [];
  } else if (toolName === 'Bash') {
    const command = (hookInput.tool_input && hookInput.tool_input.command) || '';
    events = DELETE_COMMAND_RE.test(command)
      ? buildDeletedEvents(hookInput, repoRoot, basePath, basePathNorm)
      : [];
  } else {
    return;
  }

  for (const event of events) {
    await postEvent(settings.trackingUrl, event, process.env.SDD_DEVKIT_ACCESS_TOKEN);
  }
}

main().catch((err) => {
  process.stderr.write(`[specification] error inesperado: ${err.message}\n`);
});
