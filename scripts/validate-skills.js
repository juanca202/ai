#!/usr/bin/env node
'use strict';

// Valida el formato deterministico de skills/*/SKILL.md (WI-001): sintaxis
// de frontmatter, convenciones de AGENTS.md (name/description/license),
// senales blandas (lineas/description extendido) y enlaces/anclas rotas en
// SKILL.md y sus references/*.md. Sin dependencias externas — solo modulos
// nativos de Node.js, igual que hooks/events/artifact-events.js.
//
// Uso: node scripts/validate-skills.js
// Codigo de salida: 1 si hay algun ERROR, 0 en cualquier otro caso.

const fs = require('node:fs');
const path = require('node:path');

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NAME_MAX_LENGTH = 64;
const DESCRIPTION_PROJECT_MAX = 1000;
const DESCRIPTION_PLATFORM_MAX = 1536;
const LINE_COUNT_SOFT_LIMIT = 500;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

// --- Frontmatter -----------------------------------------------------------

// Extrae el bloque YAML entre --- / --- y lo parsea a un objeto plano.
// Soporta valores en una linea y bloques escalares >, >-, |, |- (multilinea,
// indentados con 2 espacios). Devuelve null si el frontmatter no esta bien
// formado (sin delimitador de apertura o de cierre) — AC-002.
function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0] !== '---') return null;

  let closeIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      closeIndex = i;
      break;
    }
  }
  if (closeIndex === -1) return null;

  const fields = {};
  let i = 1;
  while (i < closeIndex) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const key = kv[1];
    let value = kv[2];

    if (value === '>' || value === '>-' || value === '|' || value === '|-') {
      const isFolded = value.startsWith('>');
      const blockLines = [];
      i++;
      while (i < closeIndex && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        blockLines.push(lines[i].replace(/^ {2}/, ''));
        i++;
      }
      value = blockLines.join(isFolded ? ' ' : '\n').trim();
    } else {
      value = value.replace(/^["'](.*)["']$/, '$1');
      i++;
    }
    fields[key] = value;
  }

  return fields;
}

// --- Capa 2: convenciones del proyecto (AGENTS.md) — severidad ERROR -------

function checkNaming(fields, dirName) {
  const findings = [];
  const name = fields.name;

  if (!name) {
    findings.push({ severity: 'ERROR', message: 'falta el campo `name` en el frontmatter' });
    return findings;
  }
  if (name !== dirName) {
    findings.push({
      severity: 'ERROR',
      message: `\`name: ${name}\` no coincide con el nombre de la carpeta (\`${dirName}\`)`,
    });
  }
  if (!NAME_RE.test(name)) {
    findings.push({ severity: 'ERROR', message: `\`name: ${name}\` no es kebab-case (\`${NAME_RE}\`)` });
  }
  if (name.length >= NAME_MAX_LENGTH) {
    findings.push({
      severity: 'ERROR',
      message: `\`name\` tiene ${name.length} caracteres, debe ser menor a ${NAME_MAX_LENGTH}`,
    });
  }
  return findings;
}

function checkDescription(fields) {
  const description = fields.description;
  if (!description) {
    return [{ severity: 'ERROR', message: 'falta el campo `description` en el frontmatter' }];
  }
  const len = description.length;
  if (len > DESCRIPTION_PLATFORM_MAX) {
    return [{
      severity: 'ERROR',
      message: `\`description\` tiene ${len} caracteres, supera el limite de plataforma (${DESCRIPTION_PLATFORM_MAX})`,
    }];
  }
  if (len > DESCRIPTION_PROJECT_MAX) {
    return [{
      severity: 'WARNING',
      message: `\`description\` tiene ${len} caracteres, supera la convencion del proyecto (${DESCRIPTION_PROJECT_MAX})`,
    }];
  }
  return [];
}

function checkLicense(fields) {
  const license = fields.license;
  if (!license) {
    return [{ severity: 'ERROR', message: 'falta el campo `license` en el frontmatter' }];
  }
  if (license !== 'MIT') {
    return [{ severity: 'ERROR', message: `\`license: ${license}\`, se esperaba \`MIT\`` }];
  }
  return [];
}

// --- Capa 3: senales blandas — severidad WARNING ---------------------------

function checkLineCount(content) {
  const lineCount = content.split('\n').length;
  if (lineCount > LINE_COUNT_SOFT_LIMIT) {
    return [{
      severity: 'WARNING',
      message: `${lineCount} lineas, supera la recomendacion de ${LINE_COUNT_SOFT_LIMIT}`,
    }];
  }
  return [];
}

// --- Capa 4: enlaces y anclas ------------------------------------------------

// Slugificacion estilo GitHub: quita formato markdown (backticks, negrita,
// cursiva), pasa a minusculas, elimina todo lo que no sea letra/numero
// unicode, espacio o guion, y reemplaza espacios por guiones.
function slugifyHeadingText(text) {
  const stripped = text.replace(/`/g, '').replace(/\*\*?/g, '');
  return stripped
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Devuelve el conjunto de anclas reales de un archivo (una por encabezado),
// con el mismo sufijo -1, -2... que aplica GitHub ante encabezados repetidos.
function extractHeadingSlugs(content) {
  const slugs = new Set();
  const seenCount = new Map();
  for (const line of content.split('\n')) {
    const match = HEADING_RE.exec(line);
    HEADING_RE.lastIndex = 0;
    if (!match) continue;
    const base = slugifyHeadingText(match[2]);
    const count = seenCount.get(base) || 0;
    seenCount.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

// Extrae los enlaces markdown relativos de `content` (ignora externos y
// anclas puras al propio archivo). Cada entrada trae `targetPath` (sin
// ancla) y `anchor` (sin `#`, o null si el enlace no tiene ancla).
function extractLinks(content) {
  const links = [];
  let match;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(content)) !== null) {
    const raw = match[1];
    if (/^[a-z]+:\/\//i.test(raw)) continue; // enlace externo
    if (raw.startsWith('#')) continue; // ancla al propio archivo
    const [targetPath, anchor] = raw.split('#');
    if (!targetPath) continue;
    links.push({ targetPath, anchor: anchor === undefined ? null : anchor });
  }
  return links;
}

// Resuelve enlaces relativos y anclas de un archivo markdown contra el
// repositorio, devolviendo un ERROR por cada ruta o ancla que no exista.
function checkLinksInFile(filePath, content, findingFilePrefix) {
  const findings = [];
  const fileDir = path.dirname(filePath);
  for (const link of extractLinks(content)) {
    const resolvedPath = path.resolve(fileDir, link.targetPath);
    if (!fs.existsSync(resolvedPath)) {
      findings.push({
        severity: 'ERROR',
        file: findingFilePrefix,
        message: `enlace roto: \`${link.targetPath}\` no existe`,
      });
      continue;
    }
    if (link.anchor !== null) {
      let targetContent;
      try {
        targetContent = fs.readFileSync(resolvedPath, 'utf-8');
      } catch {
        continue;
      }
      const slugs = extractHeadingSlugs(targetContent);
      if (!slugs.has(link.anchor)) {
        findings.push({
          severity: 'ERROR',
          file: findingFilePrefix,
          message: `ancla rota: \`${link.targetPath}#${link.anchor}\` no tiene un encabezado que resuelva a esa ancla`,
        });
      }
    }
  }
  return findings;
}

// Aplica checkLinksInFile sobre SKILL.md y cada archivo de su carpeta
// references/ (si existe), devolviendo la lista combinada de hallazgos.
function checkLinksAndAnchors(skillDir, repoRoot) {
  const findings = [];
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const skillMdContent = fs.readFileSync(skillMdPath, 'utf-8');
  findings.push(...checkLinksInFile(skillMdPath, skillMdContent, 'SKILL.md'));

  const referencesDir = path.join(skillDir, 'references');
  if (fs.existsSync(referencesDir)) {
    for (const entry of walkMarkdownFiles(referencesDir)) {
      const content = fs.readFileSync(entry, 'utf-8');
      const relLabel = `references/${path.relative(referencesDir, entry).split(path.sep).join('/')}`;
      findings.push(...checkLinksInFile(entry, content, relLabel));
    }
  }
  return findings;
}

function walkMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// --- Orquestacion por skill --------------------------------------------------

function validateSkill(skillDir, repoRoot) {
  const dirName = path.basename(skillDir);
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  const content = fs.readFileSync(skillMdPath, 'utf-8');

  const fields = parseFrontmatter(content);
  if (fields === null) {
    return {
      skill: dirName,
      findings: [{
        severity: 'ERROR',
        file: 'SKILL.md',
        message: 'el frontmatter no esta bien formado (falta `---` de apertura o de cierre)',
      }],
    };
  }

  const findings = [
    ...checkNaming(fields, dirName).map((f) => ({ ...f, file: 'SKILL.md' })),
    ...checkDescription(fields).map((f) => ({ ...f, file: 'SKILL.md' })),
    ...checkLicense(fields).map((f) => ({ ...f, file: 'SKILL.md' })),
    ...checkLineCount(content).map((f) => ({ ...f, file: 'SKILL.md' })),
    ...checkLinksAndAnchors(skillDir, repoRoot),
  ];

  return { skill: dirName, findings };
}

// --- Reporte y CLI ------------------------------------------------------------

function formatReport(results) {
  const lines = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    if (result.findings.length === 0) continue;
    lines.push(`\n${result.skill}`);
    for (const finding of result.findings) {
      if (finding.severity === 'ERROR') errorCount++;
      else warningCount++;
      lines.push(`  ${finding.severity === 'ERROR' ? '✖' : '⚠'} [${finding.severity}] ${finding.file}: ${finding.message}`);
    }
  }

  const total = results.length;
  const clean = results.filter((r) => r.findings.length === 0).length;
  lines.push(`\n${clean}/${total} skills sin hallazgos — ${errorCount} ERROR, ${warningCount} WARNING`);

  return { report: lines.join('\n'), errorCount, warningCount };
}

function main() {
  const repoRoot = process.cwd();
  const skillsDir = path.join(repoRoot, 'skills');
  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .map((entry) => path.join(skillsDir, entry.name));

  const results = dirs.map((skillDir) => validateSkill(skillDir, repoRoot));
  const { report, errorCount } = formatReport(results);

  console.log(report);
  process.exit(errorCount > 0 ? 1 : 0);
}

module.exports = {
  parseFrontmatter,
  checkNaming,
  checkDescription,
  checkLicense,
  checkLineCount,
  slugifyHeading: slugifyHeadingText,
  extractHeadingSlugs,
  extractLinks,
  checkLinksAndAnchors,
  validateSkill,
  formatReport,
};

if (require.main === module) {
  main();
}
