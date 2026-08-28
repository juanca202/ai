#!/usr/bin/env node
'use strict';

// Pruebas del validador de formato de skills (WI-001). Node built-in test
// runner + assert, sin dependencias externas (AC-010). Ejecutar con:
//   node --test scripts/validate-skills.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  parseFrontmatter,
  checkNaming,
  checkDescription,
  checkLicense,
  checkLineCount,
  slugifyHeading,
  extractHeadingSlugs,
  extractLinks,
  checkLinksAndAnchors,
  validateSkill,
} = require('./validate-skills.js');

// --- parseFrontmatter -------------------------------------------------

test('parseFrontmatter: bloque en una sola linea', () => {
  const content = '---\nname: foo\ndescription: hola\nlicense: MIT\n---\n# Body\n';
  const fm = parseFrontmatter(content);
  assert.equal(fm.name, 'foo');
  assert.equal(fm.description, 'hola');
  assert.equal(fm.license, 'MIT');
});

test('parseFrontmatter: description en bloque ">"', () => {
  const content = [
    '---',
    'name: foo',
    'description: >',
    '  primera linea',
    '  segunda linea',
    'license: MIT',
    '---',
    '# Body',
    '',
  ].join('\n');
  const fm = parseFrontmatter(content);
  assert.equal(fm.description, 'primera linea segunda linea');
});

test('parseFrontmatter: description en bloque ">-"', () => {
  const content = [
    '---',
    'name: foo',
    'description: >-',
    '  una linea',
    '  mas',
    'license: MIT',
    '---',
    '',
  ].join('\n');
  const fm = parseFrontmatter(content);
  assert.equal(fm.description, 'una linea mas');
});

test('parseFrontmatter: sin delimitador de apertura devuelve null', () => {
  assert.equal(parseFrontmatter('name: foo\n---\n'), null);
});

test('parseFrontmatter: sin delimitador de cierre devuelve null', () => {
  assert.equal(parseFrontmatter('---\nname: foo\n'), null);
});

// --- checkNaming --------------------------------------------------------

test('checkNaming: ok cuando coincide con la carpeta y es kebab-case', () => {
  const findings = checkNaming({ name: 'work-plan' }, 'work-plan');
  assert.deepEqual(findings, []);
});

test('checkNaming: ERROR si no coincide con el nombre de carpeta', () => {
  const findings = checkNaming({ name: 'work-plan' }, 'work-plan-2');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
  assert.match(findings[0].message, /carpeta/);
});

test('checkNaming: ERROR si no es kebab-case', () => {
  const findings = checkNaming({ name: 'Work_Plan' }, 'Work_Plan');
  assert.ok(findings.some((f) => f.severity === 'ERROR' && /kebab-case/.test(f.message)));
});

test('checkNaming: ERROR si tiene 64 caracteres o mas', () => {
  const longName = 'a'.repeat(64);
  const findings = checkNaming({ name: longName }, longName);
  assert.ok(findings.some((f) => f.severity === 'ERROR' && /64/.test(f.message)));
});

test('checkNaming: ERROR si falta el campo name', () => {
  const findings = checkNaming({}, 'work-plan');
  assert.ok(findings.some((f) => f.severity === 'ERROR' && /name/.test(f.message)));
});

// --- checkDescription -----------------------------------------------------

test('checkDescription: sin hallazgos si tiene 1000 caracteres o menos', () => {
  const findings = checkDescription({ description: 'x'.repeat(1000) });
  assert.deepEqual(findings, []);
});

test('checkDescription: WARNING entre 1001 y 1536', () => {
  const findings = checkDescription({ description: 'x'.repeat(1200) });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'WARNING');
});

test('checkDescription: ERROR con mas de 1536', () => {
  const findings = checkDescription({ description: 'x'.repeat(1537) });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
});

test('checkDescription: ERROR si falta', () => {
  const findings = checkDescription({});
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
});

test('parseFrontmatter: description con tildes cuenta caracteres unicode, no bytes UTF-8', () => {
  // Regresión: skills/code-review/SKILL.md tiene una description con varias
  // vocales acentuadas (á/é/í/ó/ú) y ñ. En UTF-8 cada una ocupa 2 bytes, así
  // que un conteo por bytes infla el resultado (~1013) frente al conteo real
  // de caracteres (998, verificado con `wc -m` y con una reimplementación en
  // Python independiente del parser de este archivo).
  const content = fs.readFileSync(path.join(__dirname, '..', 'skills', 'code-review', 'SKILL.md'), 'utf-8');
  const fm = parseFrontmatter(content);
  assert.equal(fm.description.length, 998);
});

// --- checkLicense ---------------------------------------------------------

test('checkLicense: sin hallazgos si es MIT', () => {
  assert.deepEqual(checkLicense({ license: 'MIT' }), []);
});

test('checkLicense: ERROR si es otro valor', () => {
  const findings = checkLicense({ license: 'Apache-2.0' });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
});

test('checkLicense: ERROR si falta', () => {
  const findings = checkLicense({});
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
});

// --- checkLineCount ---------------------------------------------------------

test('checkLineCount: sin hallazgos con 500 lineas o menos', () => {
  const content = Array(500).fill('x').join('\n');
  assert.deepEqual(checkLineCount(content), []);
});

test('checkLineCount: WARNING con mas de 500 lineas', () => {
  const content = Array(501).fill('x').join('\n');
  const findings = checkLineCount(content);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'WARNING');
});

// --- slugifyHeading ---------------------------------------------------------

test('slugifyHeading: minusculas y espacios a guiones', () => {
  assert.equal(slugifyHeading('Cómo preguntar al usuario'), 'cómo-preguntar-al-usuario');
});

test('slugifyHeading: quita backticks, parentesis y puntuacion', () => {
  assert.equal(slugifyHeading('Política (`implementation.archiveMode`)'), 'política-implementationarchivemode');
});

test('slugifyHeading: quita formato en negrita', () => {
  assert.equal(slugifyHeading('**Contrato** para el resto del catálogo'), 'contrato-para-el-resto-del-catálogo');
});

test('slugifyHeading: un guion largo entre espacios produce guion doble', () => {
  // GitHub no colapsa espacios: cada uno se reemplaza por su propio "-".
  // "Paso 2 — Ejecutar" -> se quita el em dash y quedan dos espacios ->
  // "paso-2--ejecutar" (dos guiones), no "paso-2-ejecutar" (uno).
  assert.equal(slugifyHeading('Paso 2 — Ejecutar los checks'), 'paso-2--ejecutar-los-checks');
});

test('slugifyHeading: guion literal entre espacios produce tres guiones', () => {
  // "Paso 4 - Cierre": el "-" se conserva y cada espacio se reemplaza aparte.
  assert.equal(slugifyHeading('Paso 4 - Cierre'), 'paso-4---cierre');
});

test('slugifyHeading: anclas duplicadas reciben sufijo -1, -2', () => {
  const content = '# Ejemplo\n\ntexto\n\n# Ejemplo\n\nmas texto\n\n# Ejemplo\n';
  const slugs = extractHeadingSlugs(content);
  assert.ok(slugs.has('ejemplo'));
  assert.ok(slugs.has('ejemplo-1'));
  assert.ok(slugs.has('ejemplo-2'));
});

// --- extractLinks ---------------------------------------------------------

test('extractLinks: separa ruta y ancla', () => {
  const content = 'Ver [texto](../../reference/verification.md#política-implementationarchivemode) y algo mas.';
  const links = extractLinks(content);
  assert.equal(links.length, 1);
  assert.equal(links[0].targetPath, '../../reference/verification.md');
  assert.equal(links[0].anchor, 'política-implementationarchivemode');
});

test('extractLinks: ignora enlaces externos', () => {
  const content = '[externo](https://example.com/doc) y [interno](../foo.md)';
  const links = extractLinks(content);
  assert.equal(links.length, 1);
  assert.equal(links[0].targetPath, '../foo.md');
});

test('extractLinks: ignora anclas puras al mismo archivo', () => {
  const content = 'Ver [seccion](#alguna-seccion).';
  assert.deepEqual(extractLinks(content), []);
});

test('extractLinks: enlace sin ancla no trae campo anchor', () => {
  const content = '[archivo](../foo.md)';
  const links = extractLinks(content);
  assert.equal(links[0].anchor, null);
});

// --- checkLinksAndAnchors (integracion sobre un fixture temporal) --------

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-skills-'));
  const skillDir = path.join(root, 'skills', 'demo-skill');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(path.join(root, 'reference'), { recursive: true });
  fs.writeFileSync(path.join(root, 'reference', 'implementation.md'), '# Resolucion\n\n## Handoff\n\ntexto\n');
  return root;
}

test('checkLinksAndAnchors: sin hallazgos cuando ruta y ancla existen', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  const skillMd = [
    '---',
    'name: demo-skill',
    'description: demo',
    'license: MIT',
    '---',
    '',
    'Ver [handoff](../../reference/implementation.md#handoff).',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  const findings = checkLinksAndAnchors(skillDir, root);
  assert.deepEqual(findings, []);
});

test('checkLinksAndAnchors: ERROR si la ruta no existe', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  const skillMd = '[roto](../../reference/no-existe.md)\n';
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  const findings = checkLinksAndAnchors(skillDir, root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
  assert.match(findings[0].message, /no existe/);
});

test('checkLinksAndAnchors: ERROR si el ancla no existe en el destino', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  const skillMd = 'Ver [seccion](../../reference/implementation.md#no-existe).\n';
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  const findings = checkLinksAndAnchors(skillDir, root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, 'ERROR');
  assert.match(findings[0].message, /ancla/);
});

test('checkLinksAndAnchors: revisa tambien references/*.md', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# Demo\n');
  fs.mkdirSync(path.join(skillDir, 'references'));
  fs.writeFileSync(
    path.join(skillDir, 'references', 'flow.md'),
    '[roto](../../../reference/no-existe.md)\n',
  );
  const findings = checkLinksAndAnchors(skillDir, root);
  assert.equal(findings.length, 1);
  assert.match(findings[0].file, /references\/flow\.md/);
});

// --- validateSkill (integracion completa) ---------------------------------

test('validateSkill: agrega ERROR y WARNING segun corresponda', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  const skillMd = [
    '---',
    'name: otro-nombre',
    `description: ${'x'.repeat(1100)}`,
    'license: Apache-2.0',
    '---',
    '',
    '# Demo',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  const result = validateSkill(skillDir, root);
  assert.equal(result.skill, 'demo-skill');
  const severities = result.findings.map((f) => f.severity);
  assert.ok(severities.includes('ERROR')); // name no coincide con carpeta + license invalida
  assert.ok(severities.includes('WARNING')); // description entre 1001 y 1536
});

test('validateSkill: ERROR si la carpeta no tiene SKILL.md', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  // makeFixture crea la carpeta pero no escribe SKILL.md dentro.
  const result = validateSkill(skillDir, root);
  assert.equal(result.skill, 'demo-skill');
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].severity, 'ERROR');
  assert.match(result.findings[0].message, /no existe/);
});

test('validateSkill: sin hallazgos para un skill conforme', () => {
  const root = makeFixture();
  const skillDir = path.join(root, 'skills', 'demo-skill');
  const skillMd = [
    '---',
    'name: demo-skill',
    'description: skill de ejemplo',
    'license: MIT',
    '---',
    '',
    '# Demo',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillMd);
  const result = validateSkill(skillDir, root);
  assert.deepEqual(result.findings, []);
});
