# WI-002: Hooks de eventos de actividad (git, tests, preguntas e implementación)

**Estado:** Ready

<!-- wi:status=Ready -->
**Tipo:** operational-change

**Repositorio:** sdd-devkit
**Asignado a:** juanca202

## Descripción

El plugin ya notifica eventos `artifact.*` (creación/actualización/borrado de un artefacto en `docs/specs/`) vía `hooks/events/artifact-events.js`, disparado en `PostToolUse` sobre `Write|Edit|MultiEdit|Bash`. Falta visibilidad sobre otra actividad relevante de la sesión: cuándo se invoca `git` o un comando de pruebas (unit/e2e) por Bash (y con qué resultado), cuándo el agente le pregunta algo al usuario de forma estructurada (y qué responde), y cuándo arranca/termina una unidad de implementación.

Se necesita un hook nuevo, en el mismo estilo y con las mismas garantías que el existente (sin dependencias externas, falla en silencio, respeta el interruptor de `specification`), que reporte seis eventos:

- `tool.called` / `tool.completed` — acotados a invocaciones por Bash de (a) `git`, o (b) un comando de pruebas (unit o e2e) reconocido por patrón — p. ej. `npm test`, `npm run e2e`, `pytest`, `go test`, `mvn test`, `cargo test`, `playwright test`. No se trackean las demás herramientas ni el resto de comandos Bash: decisión explícita para no generar ruido.
- `question.asked` / `question.answered` — vía la herramienta `AskUserQuestion`.
- `implementation.started` / `implementation.completed` — no existe un hook nativo de Claude Code para "empezó/terminó una unidad de trabajo"; se infieren de la creación/borrado de `.sdd-devkit/current-iteration.json`, que `work-implement` ya mantiene con ese propósito (ver `work-implement/SKILL.md` → *Estado de iteración para el seguimiento de especificaciones*).

## Dependencias

- Ninguna librería externa — solo módulos nativos de Node.js, igual que `hooks/events/artifact-events.js`.
- Reutiliza `specification.trackingEnabled` / `specification.trackingUrl` de `.sdd-devkit/settings.json` — mismo interruptor y endpoint que los eventos `artifact.*`. No se crea un interruptor nuevo: con `tool.*` acotado a git + comandos de prueba, el volumen es comparable al de `artifact.*`, no una fuente de ruido aparte.

## Referencias

- **Precedente de diseño:** [`hooks/events/artifact-events.js`](../../../../hooks/events/artifact-events.js) — mismo estilo de payload (`sessionId`, `processId`, `iterationId`, `agent`, `model`, `timestamp`), mismo criterio de "mejor esfuerzo" en campos no garantizados, mismo manejo de errores silencioso, y mismo patrón de detección de un comando Bash por regex (`DELETE_COMMAND_RE`).
- **Catálogo de comandos de prueba por stack:** [`../../../../skills/quality-check/references/stacks.md`](../../../../skills/quality-check/references/stacks.md) — tabla "Resolución de comandos por stack" (filas `Unit` y `E2E`), fuente de los patrones que informan la detección heurística de AC-002. No se resuelve el stack del repo (ese flujo completo es de `quality-check`); solo se reconoce el patrón textual del comando.

## Criterios de aceptación

- **AC-001 (Idoneidad funcional):** el hook DEBE registrarse en `hooks/hooks.json` para `PreToolUse` (matcher `Bash`) y `PostToolUse` (matcher `Bash`), emitiendo `tool.called` antes de ejecutar el comando y `tool.completed` después — **únicamente** cuando el comando invoca `git` (detección por regex, mismo patrón que `DELETE_COMMAND_RE` ya usa en `artifact-events.js`). Un comando Bash que no invoca `git` ni un comando de pruebas (AC-002) NO DEBE generar ninguno de los dos eventos.
- **AC-002 (Idoneidad funcional):** además de AC-001, el hook DEBE emitir `tool.called`/`tool.completed` cuando el comando Bash invoca un runner de pruebas reconocido por patrón heurístico — informado por la tabla `Unit`/`E2E` de [`quality-check/references/stacks.md`](../../../../skills/quality-check/references/stacks.md): scripts `npm`/`yarn`/`pnpm` cuyo nombre contiene `test` o `e2e` (p. ej. `npm test`, `npm run test:unit`, `npm run e2e`), `mvn test`/`mvn verify`, `gradle test`, `pytest`, `go test`, `cargo test`, `dotnet test`, y los runners directos `jest`, `vitest`, `mocha`, `playwright test`, `cypress run`. Es una heurística de mejor esfuerzo (igual espíritu que `DELETE_COMMAND_RE`): no DEBE intentar resolver el stack exacto del repo ni cubrir el 100% de los ecosistemas posibles.
- **AC-003 (Idoneidad funcional):** el payload de `tool.called` DEBE incluir el comando completo (`tool_input.command`), una `category` (`"git"` o `"test"`, según qué patrón lo disparó), el `cwd`, y los campos comunes (`sessionId`, `processId`, `iterationId`, `agent`, `model`, `timestamp`) igual que los eventos `artifact.*`.
- **AC-004 (Idoneidad funcional):** el payload de `tool.completed` DEBE incluir, además de lo de AC-003, el resultado de la ejecución (código de salida y/o salida relevante, si el hook de `PostToolUse` lo expone) — el nombre exacto del campo de origen se confirma empíricamente antes de fijar el parseo (ver Plan de implementación, IT-01).
- **AC-005 (Idoneidad funcional):** el hook DEBE registrarse para `PreToolUse` y `PostToolUse` con matcher `AskUserQuestion`, emitiendo `question.asked` (con la pregunta y las opciones ofrecidas, extraídas de `tool_input`) y `question.answered` (con la respuesta del usuario, extraída de la salida de la tool) — los nombres exactos de esos campos se confirman empíricamente antes de fijar el parseo (ver Plan de implementación, IT-01).
- **AC-006 (Fiabilidad):** si el payload real de `AskUserQuestion` no expone algún campo esperado (pregunta, opciones o respuesta), el hook DEBE degradar con gracia — omitir ese campo del evento, nunca fallar ni bloquear la tool call — mismo criterio de "mejor esfuerzo" que ya aplican `processId`/`model` en `artifact-events.js`.
- **AC-007 (Idoneidad funcional):** el hook DEBE emitir `implementation.started` cuando detecta que `.sdd-devkit/current-iteration.json` pasó de no existir a existir (o cambió su `iterationId` respecto de la última corrida conocida), y `implementation.completed` cuando detecta que el archivo pasó de existir a no existir — comparando el estado del archivo antes/después de la tool call, en `PostToolUse` sobre los mismos matchers que ya usa `artifact-events.js` (`Write|Edit|MultiEdit|Bash`).
- **AC-008 (Idoneidad funcional):** el payload de `implementation.started` DEBE incluir el `iterationId` y el `key` (código de la unidad, o `correction:<check>` en modo corrección) leídos de `current-iteration.json`. El de `implementation.completed` DEBE incluir el `iterationId` que tenía el archivo justo antes de borrarse.
- **AC-009 (Idoneidad funcional):** los seis eventos DEBEN respetar `specification.trackingEnabled`/`specification.trackingUrl` de `.sdd-devkit/settings.json` — si `trackingEnabled` es `false` o falta `trackingUrl`, el hook no hace nada, igual que `artifact-events.js`.
- **AC-010 (Mantenibilidad):** el hook NO DEBE requerir dependencias de `npm` ni un `package.json` para ejecutarse — solo módulos nativos de Node.js.
- **AC-011 (Fiabilidad):** el hook DEBE fallar en silencio ante cualquier condición ambigua o error (JSON de entrada inválido, archivo no encontrado, etc.) — nunca debe bloquear la tool call ni ensuciar la sesión, igual criterio que `artifact-events.js`.

## Archivos afectados

```text
sdd-devkit/
├── hooks/
│   ├── ~ hooks.json                    # agrega PreToolUse (Bash, AskUserQuestion) y un PostToolUse mas para el nuevo script
│   ├── ~ README.md                     # documenta los 6 eventos nuevos
│   └── events/
│       └── + activity-events.js        # tool.*, question.*, implementation.*
```

## Plan de implementación

- [ ] **IT-01** — Verificar empíricamente el payload real de `PostToolUse` (campo con el resultado/salida de la tool) y de `AskUserQuestion` en `PreToolUse`/`PostToolUse` (campos de pregunta, opciones y respuesta), con un hook temporal de solo-logging antes de escribir la lógica final.
  Ninguno de los dos está confirmado por la documentación pública de Claude Code consultada durante la planificación (ver AC-004, AC-005).
- [ ] **IT-02** — Implementar la detección de comandos `git` y de comandos de prueba (regex heurística sobre `tool_input.command`, AC-001/AC-002) y construir los eventos `tool.called`/`tool.completed` con su `category` (AC-003, AC-004).
- [ ] **IT-03** — Implementar la detección de `AskUserQuestion` y construir los eventos `question.asked`/`question.answered`, con degradación de campos ausentes (AC-005, AC-006).
- [ ] **IT-04** — Implementar la detección de creación/borrado de `.sdd-devkit/current-iteration.json` (comparando estado antes/después de la tool call) y construir los eventos `implementation.started`/`implementation.completed` (AC-007, AC-008).
- [ ] **IT-05** — Registrar los nuevos matchers de `PreToolUse` y `PostToolUse` en `hooks/hooks.json`, apuntando a `activity-events.js` (AC-009 se resuelve reutilizando la misma lectura de settings que `artifact-events.js`).
- [ ] **IT-06** — Actualizar `hooks/README.md` documentando los seis eventos nuevos, con el mismo nivel de detalle que la sección existente de `artifact.*` (clasificación, campos de mejor esfuerzo, limitaciones conocidas del patrón heurístico de comandos de prueba).
