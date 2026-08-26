# RS-001 — Fuente de `agent` y `model` para los hooks de specTracking

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-08-26

## Pregunta de investigación

¿Cómo puede el hook `artifact-created.js` (u otro hook del plugin) obtener de forma confiable el nombre del **agente** (Claude Code, Cursor u otro cliente que dispare el hook) y el **modelo** activo, para completar los campos `agent` y `model` del evento de specTracking?

## Contexto

`hooks/events/artifact-created.js` construye un evento `artifact.created` con un campo `agent` (hoy hardcodeado a `'claude-code'`) y un campo `model` (hoy siempre `''`). Investigación previa dentro de esta misma sesión ya había establecido, solo para Claude Code, que `PostToolUse` no expone el modelo activo. Esta investigación amplía esa conclusión a **Cursor** — el otro cliente que `AGENTS.md` nombra explícitamente ("Instrucciones para agentes (Claude Code, Cursor, etc.)") — para saber si ahí sí hay una fuente disponible, y para dejar escrita la recomendación de diseño resultante.

## Hallazgos

### Claude Code — `model` no está disponible en `PostToolUse`

Fuente: [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks).

- El JSON por stdin de `PostToolUse` no incluye `model`. **Solo** el hook `SessionStart` puede recibirlo, y ni ahí está garantizado.
- No hay variable de entorno con el modelo activo. Claude Code sí setea `CLAUDECODE=1` en los procesos que lanza (identifica el *producto*, no el modelo) — ver [Environment Variables](https://code.claude.com/docs/en/env-vars). `ANTHROPIC_MODEL`, si existe, viene del shell del usuario y no refleja cambios de modelo hechos con `/model` a mitad de sesión — no es una fuente confiable.
- No hay ningún campo ni variable que identifique "qué agente/producto" disparó el hook más allá de lo implícito: el propio hecho de que `hooks/hooks.json` de este plugin solo se autodescubre y ejecuta **dentro de Claude Code** ya fija esa identidad — no hace falta detectarla en tiempo de ejecución.

### Cursor — `model` y `model_id` sí llegan en (casi) todos los hooks

Fuente: [Cursor Docs — Hooks](https://cursor.com/docs/hooks).

- La documentación define un **set de campos base compartido por todos los hooks**: `conversation_id`, `generation_id`, `model`, `model_id`, `model_params`, `hook_event_name`, `cursor_version`, `workspace_roots`, `user_email`, `transcript_path`.
- `model`/`model_id` están presentes en prácticamente todos los eventos de sesión de agente — incluido `afterFileEdit` (el análogo directo a un `PostToolUse(Write)` de Claude Code) — aunque el ejemplo de payload que muestra la doc para `afterFileEdit` no los liste explícitamente (el ejemplo solo ilustra los campos *específicos* del evento, no repite los base). La única excepción documentada es `workspaceOpen` (hook de ciclo de vida de la app, fuera de cualquier sesión de agente), que la doc dice explícitamente que omite `model`.
- Cursor también setea variables de entorno en el proceso del hook: `CURSOR_PROJECT_DIR`, `CURSOR_VERSION`, `CURSOR_USER_EMAIL` (si hay sesión iniciada), `CURSOR_TRANSCRIPT_PATH`, `CURSOR_CODE_REMOTE` — y, notablemente, también `CLAUDE_PROJECT_DIR` como alias, aparentemente por compatibilidad con scripts pensados para el hook de Claude Code. Ninguna de estas variables trae el modelo; para eso el campo `model`/`model_id` del stdin ya es suficiente y más directo.

### Asimetría entre ambos clientes

| | Claude Code | Cursor |
|---|---|---|
| `model` en el hook que dispara la escritura de un archivo | No (solo `SessionStart`, sin garantía) | Sí (`model` legible + `model_id` canónico, campo base) |
| Variable de entorno con el modelo | No | No (usa el campo del stdin, no hace falta) |
| Identidad del "agente/producto" | Implícita: el hook solo corre bajo Claude Code | Implícita: el hook solo correría bajo Cursor |

## Conclusión y recomendación

**`agent`:** no requiere detección en tiempo de ejecución. Cada hook script vive dentro del mecanismo de hooks de **un solo** cliente (este, `artifact-created.js`, solo se autodescubre y ejecuta bajo Claude Code vía `hooks/hooks.json` del plugin), así que hardcodear el valor por script — como ya hace `'claude-code'` — es correcto y suficiente. Si en el futuro se agrega soporte para Cursor, sería un **script/hook separado** (el formato de `hooks.json` y el payload de stdin son distintos), y ahí correspondería hardcodear `'cursor'` con el mismo criterio.

**`model`:**
- **Claude Code:** dejarlo vacío (`''`) es la decisión correcta hoy — no hay ninguna fuente confiable dentro de un hook `PostToolUse`. No hay taller viable: ni leer `transcript_path` sirve, porque no refleja cambios de modelo a mitad de sesión. Es una limitación de la plataforma, no un vacío de implementación a resolver.
- **Cursor (si se implementa soporte):** el hook equivalente **sí** puede leer `hookInput.model_id` (identificador canónico, p. ej. `claude-opus-4-7`) directamente del stdin, sin workaround — es un campo base garantizado salvo en `workspaceOpen`, que no aplica a un hook de escritura de archivo.

No hay decisión pendiente que bloquee esto: la recomendación es accionable tal cual. Sin cambios de código derivados de este RS por ahora — `hooks/events/artifact-created.js` ya implementa la parte de Claude Code correctamente (`agent: 'claude-code'`, `model: ''`); construir el soporte para Cursor es trabajo nuevo, fuera del alcance de esta investigación.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente. Si se decide dar soporte a Cursor, el siguiente paso natural es `work-plan` (un `WI-XXX` para agregar el hook y su script equivalentes bajo el formato de Cursor), usando este RS como referencia de qué campos leer.

## Fuentes

- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Environment Variables](https://code.claude.com/docs/en/env-vars)
- [Cursor Docs — Hooks](https://cursor.com/docs/hooks)
