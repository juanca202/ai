# Hooks del plugin

## `events/artifact-events.js`

Hook `PostToolUse` sobre `Write|Edit|MultiEdit|Bash`. Notifica a
`specification.trackingUrl` los eventos `artifact.created`, `artifact.updated` y
`artifact.deleted` sobre artefactos dentro de `specification.basePath`. Ver
`.sdd-devkit/settings.json` (bloque `specification`) para activarlo/
configurarlo; si `trackingEnabled` es `false` o falta `trackingUrl`, el hook no hace nada.

### Cómo se clasifica cada evento

No existe en el hook de Claude Code un campo nativo que distinga creación de
edición de borrado. Se infiere así:

- **`Write` / `Edit` / `MultiEdit`** sobre un archivo dentro de `basePath`:
  se consulta `git status --porcelain` sobre ese archivo. `??` (untracked) →
  `artifact.created`. Cualquier otro estado no vacío (trackeado, con diff) →
  `artifact.updated`. Sin diff (`status` vacío) → no se notifica nada. En
  ambos casos se lee el encabezado del archivo para completar el payload
  (`code`, `name`, `status`...).
- **`Bash`**: no existe una tool nativa de "borrar archivo" — `rm`,
  `git rm` y `mv` fuera del árbol pasan siempre por `Bash`. Por eso, cuando
  el comando de `Bash` matchea `rm|rmdir|git rm|mv` (`DELETE_COMMAND_RE`),
  se escanea `git status --porcelain` sobre todo `basePath` buscando
  entradas de borrado (columna de índice o de working tree en `D`). Ese
  filtro por patrón de comando existe porque, mientras el borrado siga sin
  commitear, `git status` lo sigue reportando: sin filtrar por comando,
  **cualquier** `Bash` posterior (lint, build, test) re-dispararía el mismo
  `artifact.deleted` una y otra vez hasta el commit. El archivo ya no
  existe, así que **no** se puede
  leer su encabezado: el código del artefacto se deriva de la ruta (nombre
  de archivo para `TK-XXX-*.md`/`RS-XXX-*.md`/etc., o nombre de la carpeta
  padre para un `README.md` de `US-XXX-*/`/`WI-XXX-*/`). El payload de
  `artifact.deleted` es más liviano que el de `created`/`updated`: no trae
  `name`, `status` ni `parentId`, porque no hay archivo del que leerlos.

### Qué archivos reconoce

**`created`/`updated`:** solo artefactos con encabezado `# CODE-XXX: título`
(US, TK, WI, FT, TC, RS). Archivos sin ese patrón (`progress.md`,
`glossary.md`, `technical-docs/`, índices `README.md` de carpeta) se ignoran
silenciosamente.

**`deleted`:** al no poder leer el encabezado, se reconoce por convención de
nombre — el mismo patrón `[A-Za-z]{2,6}-\d+` al inicio del nombre de archivo
o de la carpeta padre. Esto es una aproximación: un archivo dentro de
`assets/` o `test-cases/` que por coincidencia empezara con ese patrón se
notificaría igual. Riesgo bajo en la práctica, porque la convención del
harness no nombra así los archivos de soporte.

`docs/adr/` y `docs/standards/` quedan fuera de alcance en los tres eventos
porque viven fuera de `docs/specs/`.

### Campos que son mejor esfuerzo, no garantía

- `sessionId` viene del hook (`session_id`).
- `processId` viene de `prompt_id`: el UUID del turno actual, que Claude Code
  mantiene igual entre varias tool calls del mismo turno. Si el hook no lo
  recibe, cae a `sessionId`.
- `iterationId` se lee de `.sdd-devkit/current-iteration.json`, en la raíz
  del proyecto, si `work-implement` lo dejó escrito — ver la sección
  *Estado de iteración para el seguimiento de especificaciones* de su
  `SKILL.md`. Ese archivo persiste el mismo id mientras se reintenta la
  unidad en curso (o una corrección delegada por `quality-check`) y se
  elimina al cerrarla, así que
  varios eventos de un mismo reintento comparten `iterationId`. Si el
  archivo no existe (no hubo implementación en curso, o el proyecto no usa
  ese skill), queda vacío.
- `model` queda vacío: Claude Code no lo expone a este hook. Solo el hook
  `SessionStart` puede recibirlo, y sin garantía — no sirve para este caso.

### Variable de entorno del token

Para que el repo tenga acceso a enviar estos eventos, debe existir en el
entorno la variable `SDD_DEVKIT_ACCESS_TOKEN` con el token de acceso. Si no
está definida, el hook igual hace el `POST` pero sin cabecera
`Authorization`, y `specification.trackingUrl` puede rechazarlo.

### Limitaciones conocidas

- Si en el mismo turno se escribe dos veces el mismo archivo nuevo antes de
  que git lo indexe, `artifact.created` se dispara dos veces (ambas llamadas
  lo ven `??`). No hay deduplicación por sesión implementada.
- Cada `Edit`/`MultiEdit`/`Write` sobre un archivo ya trackeado dispara su
  propio `artifact.updated`: varios checkboxes marcados uno por uno en la
  misma sesión producen varios eventos, no uno solo agregado.
- Si el borrado queda sin commitear y se corre **otro comando que también
  matchea** `DELETE_COMMAND_RE` (otro `rm`, otro `git rm`) antes de
  commitearlo, `artifact.deleted` se dispara de nuevo para el mismo
  artefacto — mismo tipo de duplicado que el de `created` arriba, sin
  deduplicación por sesión.
- Un borrado real por fuera de `Bash` (por ejemplo, si algún día existiera
  una tool nativa de borrado de archivos) no se detectaría: hoy no hay tal
  tool en Claude Code, así que no está cubierto.
- El filtro `DELETE_COMMAND_RE` es léxico, no semántico: un comando que
  contenga la palabra `mv` sin mover nada fuera de `basePath` (p. ej. un
  rename dentro de la misma carpeta) igual dispara el escaneo — inofensivo
  (el escaneo no encuentra ninguna entrada `D` y no postea nada), pero es
  trabajo de más.

## `events/activity-events.js`

Hooks `PreToolUse` (`Bash|AskUserQuestion`), `PostToolUse`
(`Write|Edit|MultiEdit|Bash|AskUserQuestion`) y `PostToolUseFailure` (`Bash`).
Notifica a `specification.trackingUrl` seis eventos de actividad de sesión —
distintos de los `artifact.*` de `artifact-events.js`, que solo cubren
creación/edición/borrado de artefactos en `docs/specs/`. Mismo interruptor:
si `specification.trackingEnabled` es `false` o falta `trackingUrl`, el hook
no hace nada.

### Los seis eventos

- **`tool.called`** (`PreToolUse`, `Bash`) / **`tool.completed`**
  (`PostToolUse` o `PostToolUseFailure`, `Bash`) — únicamente cuando el
  comando invoca `git` o un runner de pruebas reconocido por patrón
  heurístico. Payload: `command` (el comando completo), `category` (`"git"`
  o `"test"`, según qué patrón lo disparó), `cwd`, y en `tool.completed`
  además `result` con el desenlace de la ejecución.
- **`question.asked`** / **`question.answered`** (`PreToolUse`/`PostToolUse`,
  `AskUserQuestion`) — la pregunta, las opciones ofrecidas y la respuesta del
  usuario. Los skills preguntan con la tool nativa del cliente
  (`reference/asking.md`); el hook solo observa, no pregunta.
- **`implementation.started`** / **`implementation.completed`** — se infieren
  de la aparición/desaparición (o cambio de `iterationId`) de
  `.sdd-devkit/current-iteration.json`, que `work-implement` mantiene con ese
  propósito (ver su `SKILL.md` → *Estado de iteración para el seguimiento de
  especificaciones*). No existe una tool nativa de "empezó/terminó una
  unidad de trabajo", así que se comparan en cada `PostToolUse`
  (`Write|Edit|MultiEdit|Bash`, mismos matchers que usa `artifact-events.js`)
  contra el último `iterationId` conocido, persistido en
  `.sdd-devkit/activity-iteration-state.json` (caché local desechable, igual
  que `.sdd-devkit/current-iteration.json` y `.sdd-devkit/test-run.json`: no
  se versiona).

### Por qué `tool.completed` se construye desde dos hooks distintos

`PostToolUse` **solo se dispara cuando la tool call tiene éxito**. Un
comando `Bash` que termina con código de salida distinto de cero —un
`npm test` en rojo, un `git push` rechazado, un merge con conflictos—
dispara en su lugar `PostToolUseFailure`, con un payload diferente:

| | `PostToolUse` (éxito) | `PostToolUseFailure` (falla) |
|---|---|---|
| Campo con el resultado | `tool_response`: `{ stdout, stderr, interrupted, isImage }` | `error`: string que empieza con `"Exit code N"` seguido de la salida combinada; más `is_interrupt` (booleano) |
| `exitCode` en el payload | `0` — se infiere del propio hecho de que `PostToolUse` se disparó, el campo no lo trae | Se parsea de la primera línea de `error` (`/^Exit code (-?\d+)/`); `null` si no matchea (p. ej. Claude Code no pudo arrancar el shell) |

Sin registrar también `PostToolUseFailure`, un hook que solo escuchara
`PostToolUse` jamás emitiría `tool.completed` para un comando de prueba en
rojo — el caso más accionable de los dos. Por eso se registran ambos
eventos para `Bash`, con dos funciones de construcción de payload distintas
que comparten la misma clasificación (`category`) por regex.

Estos payloads (`tool_response` de `Bash`, y el de `AskUserQuestion` /
`AskQuestion` en ambos hooks) **no están confirmados por la documentación
pública de Claude Code consultada durante la planificación del WI que
introdujo este hook** (ver `docs/archive/work-items/WI-002-hooks-eventos-actividad/`
o su ubicación activa). Se verificaron empíricamente antes de escribir la
lógica final para Claude Code. El schema de `AskQuestion` (Cursor) se mapea
desde `prompt`/`id`/`allow_multiple` y `tool_output`. Si una versión futura
cambia esta forma, el hook degrada con gracia (ver más abajo) en vez de fallar.

### Detección de comandos git y de prueba

Heurísticas de mejor esfuerzo, mismo espíritu que `DELETE_COMMAND_RE` en
`artifact-events.js`: no resuelven el stack exacto del repositorio (eso es
tarea completa de `quality-check`), solo reconocen el patrón textual del
comando.

- **`git`**: cualquier comando que contenga la palabra `git`.
- **`test`**: scripts `npm`/`yarn`/`pnpm` cuyo nombre de script contiene
  `test` o `e2e` (`npm test`, `npm run test:unit`, `npm run e2e`), `mvn
  test`/`mvn verify`, `gradle test`, `pytest`, `go test`, `cargo test`,
  `dotnet test`, y los runners directos `jest`, `vitest`, `mocha`,
  `playwright test`, `cypress run`. Catálogo fuente: la tabla "Resolución de
  comandos por stack" (filas `Unit`/`E2E`) de
  [`../skills/quality-check/references/stacks.md`](../skills/quality-check/references/stacks.md).

Un comando `Bash` que no matchea ninguna de las dos categorías no genera
`tool.called` ni `tool.completed` — es una decisión explícita para no
generar ruido con el resto de la actividad de `Bash` (lint, build, edición
de archivos por script, etc.).

### Preguntas estructuradas: campos y degradación

Los skills no invocan MCP para preguntar. El script normaliza al mismo par de
eventos `question.asked` / `question.answered` las dos tools nativas de
preguntas estructuradas, aunque solo la primera lo dispara desde este plugin
(ver *Alcance por cliente*):

| | Claude Code (`AskUserQuestion`) | Cursor (`AskQuestion`) |
|---|---|---|
| Eventos | `PreToolUse` / `PostToolUse` | `preToolUse` / `postToolUse` |
| Pregunta | `question`, `header` | `prompt`, `id` (queda en `header`) |
| Opciones | `label` / `description`, `multiSelect` | `id` / `label`, `allow_multiple` |
| Respuesta | `tool_response.answers` y, si hay, `response` | `tool_output` (JSON: `answers` o mapa id→opción) |

Si ninguno de los campos de respuesta aparece, `question.answered` no se
emite — degradación con gracia (AC-006), mismo criterio de "mejor esfuerzo"
que ya aplican `processId`/`model` en `artifact-events.js`.

`agent` y `model`: Claude Code queda `agent: 'claude-code'` y `model` vacío
(el hook no recibe el modelo). Cursor queda `agent: 'cursor'` y `model` de
`model_id` (o `model` si no hay `model_id`). `sessionId`/`processId` en
Cursor se leen de `conversation_id` / `generation_id` cuando no vienen
`session_id` / `prompt_id`.

### Alcance por cliente

Los hooks de esta carpeta los carga **solo Claude Code**, vía
[`hooks.json`](hooks.json) y el manifiesto [`../.claude-plugin/plugin.json`](../.claude-plugin/plugin.json).
El plugin se distribuye además con el `plugin.json` de la raíz, en el formato
del estándar abierto [Agent Plugins](https://agent-plugins.org/), cuya v1 solo
estandariza skills y servidores MCP: los hooks no son un componente portable,
así que en Cursor no se instalan con el plugin.

Que el script entienda el payload de Cursor no es código muerto: sirve a quien
quiera el seguimiento en Cursor conectándolo a mano en el `.cursor/hooks.json`
de su repositorio (`preToolUse`/`postToolUse`), con la ruta absoluta al script.
Eso es configuración del repositorio del usuario, no del plugin.

### Campos que son mejor esfuerzo, no garantía

Mismos campos comunes que `artifact-events.js` (`sessionId`, `processId`,
`iterationId`, `model`) — ver la sección homónima arriba. `iterationId` en
`tool.*` y `question.*` se lee de `.sdd-devkit/current-iteration.json` en el
momento del evento; en `implementation.*` es el `iterationId` explícito del
archivo que apareció, cambió o desapareció, no una relectura posterior.

### Limitaciones conocidas

- El patrón heurístico de comandos de prueba no cubre el 100% de los
  ecosistemas posibles ni intenta resolver el stack exacto del repositorio
  — mismo criterio que `DELETE_COMMAND_RE`.
- `GIT_COMMAND_RE` es léxico: un comando que solo menciona la palabra `git`
  sin invocar el binario (p. ej. `echo "usa git para esto"`) igual se
  clasifica como categoría `git`. Riesgo bajo en la práctica.
- Si `current-iteration.json` se crea y se borra entre dos `PostToolUse`
  consecutivos sin que ninguno de los dos capture el estado intermedio
  (ventana muy estrecha, poco probable en uso normal), esa unidad no emite
  ni `implementation.started` ni `implementation.completed`.
- Igual que en `artifact-events.js`, si `.sdd-devkit/activity-iteration-state.json`
  no se puede escribir (permisos, disco lleno), el hook falla en silencio y
  el próximo `PostToolUse` simplemente reintenta la comparación contra el
  último estado que sí pudo persistirse.
- Aun conectando el script a mano en Cursor, `AskQuestion` **hoy no dispara**
  `preToolUse`/`postToolUse` (bug confirmado en el cliente), así que `question.*`
  solo se observa con fiabilidad en Claude Code. Los skills siguen preguntando
  con `AskQuestion` en Cursor — el hueco es de seguimiento, no de UX.
