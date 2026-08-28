# Progreso

## WI-001
**Estado:** Done

<!-- work:id=WI-001 · status=Done -->
**Tipo:** tarea de mantenimiento
**Fecha de creación:** 2026-08-27 22:50
**Ultima actualizacion:** 2026-08-27 23:10

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
- Corriendo el script se encontró un hallazgo real fuera del alcance de este WI: `work-integrate/references/archive.md` enlaza a `reference/artifacts.md#resolución-de-docsspecsarchive`, pero ese texto vive en un blockquote en negrita, no en un encabezado `#`/`##` — no genera ancla real en GitHub. El enlace estaba roto desde que se escribió (commit `bdeb01a`). No se corrige aquí por quedar fuera del alcance declarado del WI (`scripts/validate-skills.js`); reportado al usuario para decidir aparte.

**Decisiones adicionales:**
- Se usó el test runner nativo de Node (`node --test` + `node:assert/strict`) en vez de un framework externo, para cumplir AC-010 (sin dependencias de npm) también en las pruebas, no solo en el script.
- Se armó un WI-001 dedicado en vez de UI/TDD sobre el propio `work-research`, siguiendo el handoff estándar (`work-plan` → `work-implement`) en lugar de generar el script directamente desde la investigación.
