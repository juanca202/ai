# Progreso

## WI-001
**Estado:** Done

<!-- work:id=WI-001 · status=Done -->
**Tipo:** tarea de mantenimiento
**Fecha de creación:** 2026-08-27 22:50
**Ultima actualizacion:** 2026-08-27 23:55

## Unidades

### WI-001: Script de validación determinista de formato para agent skills
**Estado:** Done

<!-- unit:id=WI-001 · status=Done -->
**Iniciado:** 2026-08-27 22:50
**Finalizado:** 2026-08-27 23:10
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
```
+ scripts/validate-skills.js
+ scripts/validate-skills.test.js
```

**Notas:**
- IT-06 decía "2 skills con más de 500 líneas"; el script corrido sobre el catálogo real encontró 3 (`arch-audit`, `quality-check`, `work-research`) — el conteo correcto ya estaba en el cuerpo de RS-002, la cifra de IT-06 fue un resumen impreciso al redactar el WI, no un defecto del script.
- El chequeo de enlaces/anclas (AC-006/AC-007) produce falsos positivos sobre enlaces markdown usados como **ejemplo ilustrativo de un patrón de nombre** en prosa (p. ej. `[ADR-XXX: Título](ADR-XXX-slug.md)`, `[TC-001](./TC-001-{slug}.md)`, `![Descripción](assets/nombre.png)`) — el script no puede distinguir determinísticamente un enlace navegable real de uno usado solo para ilustrar una convención de nombres. Limitación conocida y aceptada (igual que otros linters de enlaces markdown); no se intentó heurística de filtrado para no introducir falsos negativos.
- **Corrección posterior (a pedido del usuario, revisando la salida del script):** se encontró un bug real en el propio slugificador — colapsaba espacios consecutivos en un solo guion, cuando GitHub reemplaza cada espacio por su propio guion (evidencia: anclas ya existentes en el repo como `#paso-4---cierre`, `#idempotencia--reejecución`). Corregido en `slugifyHeadingText` (2 tests nuevos, 35/35 en verde). Esto eliminaba un falso ERROR en `quality-check` (`#paso-2--ejecutar-los-checks`).
- **Bugs reales corregidos** (no del script, del contenido): `arch-discover/references/candidate-presentation.md` enlazaba a `references/functional-domains.md` con un segmento `references/` de más (el archivo ya vive en `references/`, el propio); corregido a `functional-domains.md`. Y el hallazgo ya anotado arriba (`work-integrate/references/archive.md` → `artifacts.md#resolución-de-docsspecsarchive`, ancla sobre un blockquote sin encabezado real): corregido quitando el ancla, el enlace apunta al archivo.
- **Confirmado falso positivo, sin corrección:** los 18 ERROR restantes (`ADR-XXX-slug.md`, `<slug>.md`, `TC-001-{slug}.md`, `(…)`, `assets/nombre.png`, `WI-XXX-nombre/README.md`, `TK-XXX-nombre.md`, `./README.md`, `./discovery.md`, etc.) son ejemplos ilustrativos de convención de nombre en prosa, no enlaces navegables reales — limitación conocida del script (ver nota de arriba), no defecto del contenido.
- **Sin corregir, pendiente de decisión del usuario:** las 10 WARNING (7 `description` > 1000 caracteres, 3 archivos > 500 líneas) son violaciones reales de la convención del proyecto, pero acortarlas/reestructurarlas es edición de contenido con criterio editorial, no un fix mecánico — se dejaron fuera de esta corrección puntual. *(Resuelto en la corrección siguiente: las 7 `description` se acortaron y los 3 archivos se redujeron bajo 500 líneas — 0 WARNING.)*
- **Consulta del usuario sobre el conteo de caracteres de `description`:** verificado con tres métodos independientes (parser JS, reimplementación en Python desde cero, `wc -m`) — los tres coinciden exactamente para las 16 skills. No había bug; el `1148` que el usuario citó era el largo original de `code-review` antes de acortarlo. Se agregó un test de regresión sobre el archivo real (con tildes/ñ) para fijar que el conteo es en caracteres unicode, no en bytes UTF-8.
- **AC-011 (a pedido del usuario):** el script omitía en silencio cualquier carpeta de `skills/` sin `SKILL.md` — quedaba invisible en el reporte en vez de señalarse como un problema. Corregido: `main()` ahora recorre todas las carpetas de `skills/`, y `validateSkill()` reporta `ERROR` si falta el archivo. Verificado con un fixture temporal fuera del repo (una carpeta con `SKILL.md` + una vacía) y contra el catálogo real (sin cambios: las 16 carpetas ya tienen `SKILL.md`).
- **AC-012 (a pedido del usuario):** `checkNaming` validaba el formato/tamaño kebab-case solo sobre el campo `name` del frontmatter; si ese campo faltaba, la función cortaba antes de mirar el nombre de la carpeta en sí, dejándolo sin validar. Corregido: la carpeta se valida siempre, primero y de forma independiente; si `name` coincide con la carpeta no se repite el mismo hallazgo dos veces, y si difiere se siguen reportando por separado la discrepancia y el formato/tamaño propio de `name`. 4 tests nuevos (40/40 en verde); sin cambios en el catálogo real.

**Decisiones adicionales:**
- Se usó el test runner nativo de Node (`node --test` + `node:assert/strict`) en vez de un framework externo, para cumplir AC-010 (sin dependencias de npm) también en las pruebas, no solo en el script.
- Se armó un WI-001 dedicado en vez de UI/TDD sobre el propio `work-research`, siguiendo el handoff estándar (`work-plan` → `work-implement`) en lugar de generar el script directamente desde la investigación.
