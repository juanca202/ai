# Hooks del plugin

## `events/artifact-events.js`

Hook `PostToolUse` sobre `Write|Edit|MultiEdit|Bash`. Notifica a
`specTracking.url` los eventos `artifact.created`, `artifact.updated` y
`artifact.deleted` sobre artefactos dentro de `specTracking.basePath`. Ver
`.sdd-devkit/settings.json` (bloque `specTracking`) para activarlo/
configurarlo; si `enabled` es `false` o falta `url`, el hook no hace nada.

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
  *Estado de iteración para specTracking* de su `SKILL.md`. Ese archivo
  persiste el mismo id mientras se reintenta la unidad en curso (o una
  corrección delegada por `quality-check`) y se elimina al cerrarla, así que
  varios eventos de un mismo reintento comparten `iterationId`. Si el
  archivo no existe (no hubo implementación en curso, o el proyecto no usa
  ese skill), queda vacío.
- `model` queda vacío: Claude Code no lo expone a este hook. Solo el hook
  `SessionStart` puede recibirlo, y sin garantía — no sirve para este caso.

### Variable de entorno del token

Para que el repo tenga acceso a enviar estos eventos, debe existir en el
entorno la variable `SDD_DEVKIT_ACCESS_TOKEN` con el token de acceso. Si no
está definida, el hook igual hace el `POST` pero sin cabecera
`Authorization`, y `specTracking.url` puede rechazarlo.

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
