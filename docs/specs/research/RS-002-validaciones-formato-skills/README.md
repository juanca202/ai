# RS-002 — Validaciones deterministas de formato para agent skills

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-08-27

## Pregunta de investigación

¿Qué validaciones deterministas de formato existen para los agent skills (frontmatter `name`/`description`, tamaño/líneas del archivo, estructura de carpetas) y qué script de verificación se puede construir a partir de ellas para comprobar los skills de este repo?

## Contexto

SDD Devkit es un catálogo de 16 skills empaquetados como plugin de Claude Code (`.claude-plugin/plugin.json`). `AGENTS.md` ya documenta convenciones de formato para `SKILL.md` (frontmatter obligatorio, `name` en kebab-case < 64 caracteres, `description` ≤ 1000 caracteres, `license: MIT`, tamaño orientativo de ~500 líneas), pero hoy se verifican **manualmente** — no hay ningún script ni CI que las compruebe. Esta investigación separa qué de eso es un requisito de la **plataforma** (Claude Code), qué es una **convención de este proyecto** documentada en `AGENTS.md`, y qué es deuda de verificación real y ya presente en el repo.

## Hallazgos

### 1. Requisitos de plataforma (Claude Code) — fuente: [`code.claude.com/docs/en/skills.md`](https://code.claude.com/docs/en/skills.md#frontmatter-reference)

| Constraint | Regla | Tipo |
|---|---|---|
| Delimitadores del frontmatter | Bloque YAML entre `---` al inicio y `---` de cierre | **Duro** — si no parsea, el skill carga sin metadata |
| Sintaxis YAML | Debe parsear como YAML válido (sin tabs, bloques `>`/`>-`/`|`/`|-` bien formados) | **Duro** |
| `description` + `when_to_use` combinados | Máximo **1536 caracteres** — el listado de skills trunca a partir de ahí | **Duro** (límite de plataforma) |
| `name` | Sin regla de plataforma sobre formato/longitud — en skills de proyecto/personales el nombre de la **carpeta** es lo que manda; en skills de plugin, el campo `name` del frontmatter fija el sufijo del comando (`/plugin:name`) | Blando (plataforma no impone kebab-case ni longitud) |
| `license` | Campo opcional, sin valor exigido por la plataforma | Blando |
| Tamaño de `SKILL.md` | Recomendación oficial: **mantenerlo bajo ~500 líneas**, moviendo detalle a `references/` (cargado solo bajo demanda) | Blando — recomendación, no error |
| Otros campos de frontmatter reconocidos | `when_to_use`, `allowed-tools`, `disallowed-tools`, `disable-model-invocation`, `user-invocable`, `model`, `effort`, `context`, `agent`, `background`, `paths`, `shell`, `argument-hint`, `arguments`, `metadata`, `hooks`, `compatibility` (≤ 500 caracteres) | Todos opcionales; ninguno lo usa este catálogo salvo `name`/`description`/`license` |

**Validador oficial existente:** `claude plugin validate` (Claude Code ≥ v2.1.233) comprueba sintaxis JSON/YAML de `plugin.json` y de cada `SKILL.md`, nombres de plugin duplicados en un marketplace y path traversal en las rutas declaradas. **No comprueba** longitud de `name`/`description`, kebab-case, líneas del archivo, ni presencia de campos exigidos por convención de proyecto — todo eso queda fuera de su alcance por diseño. No existe un JSON Schema público para el frontmatter de `SKILL.md`; lo anterior surge de la documentación en prosa, no de un schema formal.

### 2. Convenciones propias del proyecto — fuente: `AGENTS.md` (líneas 39–48 de este repo)

Más estrictas que la plataforma en dos puntos:

- `name`: **debe coincidir exactamente con el nombre de la carpeta**, minúsculas, kebab-case, **menos de 64 caracteres**.
- `description`: **máximo 1000 caracteres** (la plataforma permite hasta 1536 combinados con `when_to_use`, que este catálogo no usa).
- `license: MIT` obligatorio en todos los skills del catálogo.
- Bloque de frontmatter debe ser YAML válido, sin tabs.
- Señal blanda: si `SKILL.md` se acerca a las ~500 líneas, es indicio de que hace falta mover contenido a `references/`.

### 3. Estado real del catálogo (medido directamente sobre los 16 `SKILL.md`, no de memoria)

Parseando el frontmatter real de cada skill (manejando tanto `description: texto en una línea` como `description: >`/`>-` en bloque multilínea — un parseo ingenuo por regex/grep falla silenciosamente sobre el segundo formato, que usan 6 de los 16 skills):

| Skill | Líneas | `name` == carpeta | `description` (caracteres) | `license` |
|---|---|---|---|---|
| arch-audit | 540 | ✅ | **1111** ⚠️ | MIT |
| arch-discover | 203 | ✅ | 911 | MIT |
| arch-init | 343 | ✅ | 1002 ⚠️ | MIT |
| arch-manage | 345 | ✅ | **1054** ⚠️ | MIT |
| code-review | 258 | ✅ | **1148** ⚠️ | MIT |
| design-define | 131 | ✅ | 900 | MIT |
| git-commit | 286 | ✅ | 628 | MIT |
| pr-create | 391 | ✅ | 1040 ⚠️ | MIT |
| quality-check | 503 ⚠️ | ✅ | **1133** ⚠️ | MIT |
| test-define | 327 | ✅ | 926 | MIT |
| trace-validate | 477 | ✅ | 995 | MIT |
| work-define | 125 | ✅ | 469 | MIT |
| work-implement | 447 | ✅ | 971 | MIT |
| work-integrate | 245 | ✅ | 870 | MIT |
| work-plan | 132 | ✅ | 1088 ⚠️ | MIT |
| work-research | 558 ⚠️ | ✅ | 969 | MIT |

⚠️ = excede el límite propio del proyecto (>1000 caracteres en `description`, o >500 líneas).

**Conclusión del muestreo:** `name`, y `license` están 100% conformes hoy. **6 de 16 skills (37%)** superan el tope propio de `description` (1000 caracteres) — ninguno rompe el límite duro de plataforma (1536), pero sí la convención documentada en `AGENTS.md`. **2 de 16 (12%)** superan las ~500 líneas orientativas (`quality-check`, `work-research`; `arch-audit` también las supera). Esto confirma que la verificación manual **no está atrapando** las propias reglas del proyecto — es deuda real, no hipotética.

### 4. Riesgo adicional detectado, fuera del frontmatter: enlaces y anclas rotas

No estaba en el alcance original de la pregunta, pero es la clase de falla determinista más costosa de las vistas en este mismo repo en la sesión reciente (renombrados de `reference/quality-gates.md` → `reference/verification.md`, cambios de encabezado que invalidan anclas `#...` citadas desde otros archivos). `AGENTS.md` exige que cada skill referencie los recursos compartidos con **ruta relativa exacta** (`../../reference/<archivo>.md`) y that las excepciones de idioma vivan solo en su sección — ambas reglas son **100% verificables mecánicamente**: existencia del archivo destino de cada enlace relativo, y existencia del encabezado que corresponde a cada ancla `#slug` citada. No requiere IA ni criterio humano, solo resolver rutas y comparar contra los `##`/`###` reales del archivo destino (con el mismo algoritmo de slugificación que usa GitHub).

## Conclusión y recomendación

Construir un script Node.js **sin dependencias externas** (este repo no tiene `package.json`; los hooks existentes en `hooks/events/artifact-events.js` ya siguen ese mismo patrón zero-dependency), ejecutable con `node scripts/validate-skills.js`, que recorra `skills/*/SKILL.md` y aplique tres capas de chequeos, cada uno con su severidad:

**Capa 1 — Sintaxis (ERROR, plataforma):**
- El archivo empieza con `---` y tiene un `---` de cierre antes del cuerpo.
- El bloque entre ambos parsea como frontmatter válido (clave: valor, con soporte explícito para bloques `>`/`>-`/`|`/`|-` — el parseo debe manejar ambos estilos que ya coexisten en este catálogo).

**Capa 2 — Convenciones del proyecto, `AGENTS.md` (ERROR):**
- `name` presente, `^[a-z0-9]+(-[a-z0-9]+)*$`, < 64 caracteres, **igual al nombre de la carpeta**.
- `description` presente, ≤ 1000 caracteres.
- `license` presente y con valor exacto `MIT`.

**Capa 3 — Señales blandas (WARNING, no bloquea):**
- `SKILL.md` con más de ~500 líneas.
- `description` entre 1000 y 1536 caracteres (todavía válido para la plataforma, pero ya fuera de la convención propia — distinto de un `description` > 1536, que sí sería ERROR incluso a nivel de plataforma).

**Capa 4 — Enlaces y anclas (ERROR), extendida a `SKILL.md` + sus `references/*.md`:**
- Cada enlace relativo `[texto](ruta.md)` o `[texto](ruta.md#ancla)` resuelve a un archivo existente en el repo.
- Cada `#ancla` citada resuelve a un encabezado real del archivo destino (slugificación estilo GitHub: minúsculas, quitar puntuación, espacios → guiones).

**Salida:** listado agrupado por skill, con `ERROR`/`WARNING` por hallazgo; código de salida `1` si hay algún `ERROR`, `0` si solo hay `WARNING` o está todo limpio. Pensado para poder engancharse luego a un hook `PreToolUse`/CI, aunque eso no es parte de este alcance.

**Próximo paso recomendado:** este es un trabajo técnico concreto y acotado (crear un script en un repo existente, sin historia de usuario asociada) → **`work-plan`** para crear el WI (tipo operativo/tooling) con esta especificación como insumo, y de ahí `work-implement` escribe el script. Este skill (`work-research`) no genera el código.

## Fuentes

- [Claude Code — Agent Skills reference](https://code.claude.com/docs/en/skills.md) (frontmatter reference, límites de `description`/`when_to_use`, convención de `references/`, `claude plugin validate`)
- [Claude Code — Plugins](https://code.claude.com/docs/en/plugins.md) y [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces.md) (schema de `plugin.json`, validación de marketplace)
- `AGENTS.md` de este repositorio (reglas propias de `name`/`description`/`license`/tamaño)
- Medición directa sobre los 16 `skills/*/SKILL.md` de este repositorio (líneas, frontmatter parseado, 2026-08-27)
