# Resolución de idioma (compartida)

Referencia transversal del plugin **SDD Devkit**. Define el **orden canónico** con el que cualquier
skill decide en qué idioma redacta sus artefactos y sus mensajes al usuario. Cada `SKILL.md` apunta
aquí en lugar de repetir el orden, y solo declara **su delta** (a qué aplica el idioma resuelto y qué
excepción tiene, si la tiene).

## Orden canónico

Detenerse en el **primer paso que aplique**:

1. **`.agents/MEMORY.md`** (raíz del repo) → línea `idioma: <ISO 639-1>` (p. ej. `es`, `en`).
   Es la clave canónica que escribe `arch-init`; si existe, **manda**.
2. Si no, la **preferencia de idioma del usuario** que conste en el contexto de la sesión.
3. Si no, usar el **idioma del mensaje del usuario** y **preguntar si desea persistirlo** en
   `.agents/MEMORY.md` con `idioma: <código>`.
4. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta,
   **preguntar si desea persistirlo** en `.agents/MEMORY.md`. **No decidir el idioma por cuenta propia.**

> **Claves legacy.** Si `idioma:` no existe pero hay claves antiguas (`idioma de preferencia:`,
> `preferred language:`, `language:`, `Project language:`), usarlas solo como fallback al leer un `MEMORY.md` viejo, y proponer
> la migración a la clave canónica.

> **Modo delegado.** Cuando el skill se ejecuta invocado por otro skill (subagente), el **paso 2** pasa a
> ser el idioma que transmita el llamador o, en su defecto, el del artefacto de origen. El paso 1
> (`.agents/MEMORY.md`) sigue mandando por encima de ambos.

## Qué NO se traduce nunca

Independientemente del idioma resuelto:

- **Identificadores y nombres de artefacto:** `ADR-XXX`, `US-XXX`, `WI-XXX`, `TK-XXX`, `TC-XXX`,
  `FT-XXX`, `RS-XXX`, referencias de criterio `<estándar>/CR-XXX` y de requisito
  `<estándar>/<slug-requisito>`.
- **Claves de frontmatter** y claves de configuración de `.agents/MEMORY.md`.
- **Rutas de archivo** y nombres de carpeta.
- **Salida y mensajes de error de herramientas** (git, lint, build, tests, Sonar).
- **Código, símbolos e identificadores** del repositorio.
- **Subjects de commits** citados literalmente para preservar trazabilidad.
- **Claves de los modificadores de invocación**, que son siempre en inglés (el usuario puede nombrarlas
  en español y se mapean a la clave en inglés).

## Palabras clave normativas (RFC 2119 / RFC 8174)

Las palabras clave normativas **sí** se redactan en el idioma de preferencia, siempre en **MAYÚSCULAS**:

| Inglés | Español |
|--------|---------|
| MUST / REQUIRED / SHALL | DEBE / OBLIGATORIO |
| MUST NOT / SHALL NOT | NO DEBE |
| SHOULD / RECOMMENDED | DEBERÍA / RECOMENDADO |
| SHOULD NOT | NO DEBERÍA |
| MAY / OPTIONAL | PUEDE / OPCIONAL |

Un estándar en español usa DEBE/DEBERÍA/PUEDE…; uno en inglés usa MUST/SHOULD/MAY…

## Excepciones declaradas del catálogo

Estos skills se apartan del orden canónico **de forma deliberada**. La excepción se documenta también
en su propio `SKILL.md`; esta tabla existe para que el conjunto sea auditable de un vistazo.

| Skill | Excepción |
|-------|-----------|
| `arch-init` | Es quien **crea** `.agents/MEMORY.md`. Si ya existe (reejecución), lee su `idioma:`; si no, usa el idioma del turno del usuario y lo **persiste** al crear el archivo, sin preguntarlo aparte salvo ambigüedad. |
| `test-define` | Redacta los TC **en el idioma del artefacto origen**, no en el del orden canónico: un TC que no hable el idioma de los criterios que traza se lee mal junto a ellos. Ante conflicto o ambigüedad, preguntar antes de generar. |
| `design-define` | El orden canónico rige la **prosa**. Los nombres de campos, rutas y payloads siguen la convención del código existente (ver `references/element-standards.md` de ese skill). |
| `git-commit` · `pr-create` | Operan sobre git, no sobre el harness: no leen `.agents/MEMORY.md`. Orden: preferencia del usuario en sesión → idioma de la conversación → (en `pr-create`) idioma predominante de los commits del rango. Un título o descripción explícitos del usuario se respetan literalmente. |
| `work-research` | Idioma del mensaje de entrada; si hay artefacto o proyecto vinculado, el idioma de ese contexto. Ante conflicto, preguntar. |
