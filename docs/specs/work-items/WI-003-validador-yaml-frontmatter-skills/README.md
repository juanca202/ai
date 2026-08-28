# WI-003: Validador YAML del frontmatter de skills y git-commit inválido

**Estado:** Ready

<!-- wi:status=Ready -->
**Tipo:** bug-fix

**Repositorio:** sdd-devkit
**Asignado a:** juanca202

## Descripción

Al cargar `skills/git-commit/SKILL.md`, Cursor/Claude parsean el frontmatter con un motor YAML real y fallan con `mapping values are not allowed in this context at line 2 column 208`. El skill queda sin metadata.

El disparador es el `description` en una sola línea, sin citar, que contiene `` (`git.push`: ask/always/never; nunca por defecto) ``: el `: ` tras `` `git.push` `` es un indicador de mapping en un escalar plano YAML. Los backticks markdown no citan YAML.

`node scripts/validate-skills.js` no reporta ningún hallazgo para `git-commit`. El validador extrae el `description` con una regex línea a línea y trata «no parsea» solo como «faltan los `---`», así que este YAML inválido pasa como válido.

## Contexto

**Reproducción verificada.** En la línea `description:` de `skills/git-commit/SKILL.md`, el carácter de la columna 208 (1-based sobre esa línea) es el `:` de `` (`git.push`: ask/always/never ``. Psych (Ruby) lanza el mismo error (línea 3 col 208 por el newline inicial del bloque). `parseFrontmatter` devuelve `name`, `description` (628 caracteres, incluye `git.push`) y `license`. `validateSkill` sobre `skills/git-commit` devuelve `findings: []`. El reporte CLI lista errores de *otros* skills y no menciona `git-commit`.

**Causa raíz.** `scripts/validate-skills.js` › `parseFrontmatter` (aprox. L30–71) usa `/^([A-Za-z0-9_-]+):\s?(.*)$/` y se queda con todo lo que sigue al primer `key:`. Un `: ` interior no invalida el parseo. WI-001 AC-002 («si no parsea, ERROR de sintaxis») quedó implementado solo para delimitadores `---` ausentes. RS-002 y `AGENTS.md` exigen YAML válido como constraint duro de plataforma, sin librería YAML (WI-001 AC-010).

Introducido en `88f1e7b` (`feat(git-commit): add configurable commit confirmation and push policy`, 2026-08-27).

### Situación de las pruebas

- **Unitaria** — `scripts/validate-skills.test.js` › `parseFrontmatter: bloque en una sola linea` y bloques `>`/`>-` → **2 · existe pero no cubre la condición** → ampliar: ningún caso usa `: ` en un valor plano.
- **Unitaria** — `validateSkill: sin hallazgos para un skill conforme` → **2** → el fixture no incluye `: ` sin citar.
- **Integración sobre catálogo** — no hay prueba que exija ERROR de sintaxis ante `: ` sin citar (fixture, no el archivo vivo) → **1 · no existe** → crear.

## Fuera de alcance

- Reescribir el parser como YAML 1.1/1.2 completo (aliases, tags, comentarios `#` en plano, tabs, etc.)
- Los `ERROR` de enlaces rotos que el script ya emite en otros skills
- Reabrir o regenerar WI-001
- Sustituir el script por `claude plugin validate`

## Reglas de negocio

- **BR-01:** El frontmatter de cada `SKILL.md` DEBE ser YAML válido → verificado por AC-004
- **BR-02:** Si el bloque `---`/`---` no está bien formado o no parsea, el script DEBE reportarlo como `ERROR` de sintaxis y continuar con el resto → verificado por AC-001
- **BR-03:** El validador NO DEBE requerir dependencias de npm ni un `package.json` → verificado por AC-003

## Dependencias

- `scripts/validate-skills.js` — parser y reporte actuales (módulos nativos `node:fs` / `node:path`)
- `scripts/validate-skills.test.js` — runner nativo `node --test`

## Referencias

- [WI-001 — Script de validación determinista de formato para agent skills](../WI-001-validacion-formato-skills/README.md) — AC-002, AC-010, IT-01
- [RS-002 — Validaciones deterministas de formato para agent skills](../../research/RS-002-validaciones-formato-skills/README.md) — YAML válido = constraint duro de plataforma
- [`AGENTS.md`](../../../../AGENTS.md) — § Frontmatter obligatorio
- `skills/git-commit/SKILL.md` línea 3; commit `88f1e7b`

## Criterios de aceptación

- **AC-001 (Idoneidad funcional):** Dado un `SKILL.md` cuyo `description` en una línea sin citar contiene `: `, cuando se ejecuta `validateSkill` o `node scripts/validate-skills.js`, el script DEBE reportar `ERROR` de sintaxis YAML para ese skill (mensaje distinto de «falta `---`») y NO DEBE silenciar el hallazgo.
- **AC-002 (Idoneidad funcional):** Dado el mismo texto citado entre `"` / `'` o en bloque `>` / `>-`, cuando se valida, el script NO DEBE reportar `ERROR` de sintaxis por ese `: `.
- **AC-003 (Mantenibilidad):** Dado el cambio en `parseFrontmatter` / `validateSkill`, el script NO DEBE requerir `package.json` ni una librería YAML externa.
- **AC-004 (Idoneidad funcional):** Dado `skills/git-commit/SKILL.md` corregido, cuando un motor YAML real carga el frontmatter, DEBE parsear sin `mapping values are not allowed`.

## Archivos afectados

```text
sdd-devkit/
├── scripts/
│   ├── ~ validate-skills.js        # rechazar `: ` en escalares planos sin citar
│   └── ~ validate-skills.test.js   # rojo (inválido) y control (citado / bloque `>`)
└── skills/git-commit/
    └── ~ SKILL.md                  # citar o plegar `description` sin cambiar el texto
```

## Plan de implementación

- [x] **IT-01** — Añadir pruebas que fallen con el parser actual ante `: ` sin citar
  Fixture mínimo (no el archivo vivo `git-commit`): `description` en una línea con `` (`git.push`: ask/always/never) ``. Esperado: `ERROR` de sintaxis. Obtenido hoy: `findings: []`. Caso de control: el mismo texto entre comillas o en bloque `>` no es ERROR de sintaxis.
- [x] **IT-02** — Rechazar `: ` en valores en una línea no citados y emitir `ERROR` de sintaxis
  En `parseFrontmatter` / `validateSkill`: no reutilizar el mensaje de «faltan `---`». Bloques `>`/`|` y valores `"..."` / `'...'` siguen válidos. Sin añadir dependencias.
- [x] **IT-03** — Citar o plegar el `description` de `skills/git-commit/SKILL.md`
  Mismo contenido semántico. Un motor YAML real (p. ej. Psych) DEBE cargar el frontmatter sin el error de mapping. `node --test scripts/validate-skills.test.js` en verde; revirtiendo el parser, el fixture de IT-01 vuelve a fallar.
