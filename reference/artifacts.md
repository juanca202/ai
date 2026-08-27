# Artefactos: rutas, identificadores y archivado (compartida)

Referencia transversal del plugin **SDD Devkit**. Es la **fuente única** del layout del harness: dónde
vive cada artefacto, cómo se numera y qué pasa cuando se archiva. Cada `SKILL.md` apunta aquí en lugar
de repetir la tabla completa, y solo lista **las filas que él escribe o lee** cuando aporta algo
específico (una salida propia, una excepción de ruta).

> **Notación de placeholders.** `[nombre-corto]`, `[kebab-case]`, `[slug]`, `[capability]`, `XXX`.
> En documentos antiguos aparece la forma equivalente `{slug}` / `{nombre}`; significan lo mismo.
> `XXX` es un secuencial de **tres dígitos** (`001`, `002`, …). **Excepción:** cuando el artefacto se crea
> en un tracker externo, `XXX` es el `id` que asigna ese sistema, **sin padding de ceros** — ver
> [`alm/azure-devops.md`](alm/azure-devops.md).

## Layout del harness

| Artefacto | Ruta | Skill propietario |
|-----------|------|-------------------|
| Memoria del harness | `.agents/MEMORY.md` | `arch-init` |
| Configuración del plugin (incluye el idioma) | `.sdd-devkit/settings.json` | `arch-init` |
| Instrucciones para agentes | `AGENTS.md` (+ `CLAUDE.md` como puntero) | `arch-init` |
| ADR | `docs/adr/ADR-XXX-[slug].md` | `arch-manage` · índice `docs/adr/README.md`: lo crea `arch-init`, lo mantiene `arch-manage` |
| Estándar de dominio | `docs/standards/[slug].md` (o `docs/standards/[slug]/README.md`) | `arch-manage` · índice `docs/standards/README.md`: lo crea `arch-init`, lo mantiene `arch-manage` |
| Fitness functions | `scripts/arch/verify.<ext>` + `scripts/arch/checks/[slug-estándar].<ext>` | `arch-manage` |
| Definition of Done | `docs/policies/definition-of-done.md` | **Ninguno — lo escribe y lo mantiene el equipo.** Los skills lo leen; ningún skill del plugin lo genera ni ofrece generarlo. |
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` | `work-define` |
| Tarea técnica de una US | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` | `work-plan` |
| Tarea de mantenimiento | `docs/specs/work-items/WI-XXX-[kebab-case]/README.md` | `work-plan` |
| Feature ya implementada | `docs/specs/features/FT-XXX-[slug]/README.md` | `work-research` (flujo *Analizar legado*) |
| Casos de prueba | `test-cases/TC-XXX-[slug].md` **dentro de la carpeta del artefacto padre**, con índice `test-cases/README.md` | `test-define` |
| Documento técnico | `docs/specs/technical-docs/[capability].md`, apoyo en `docs/specs/technical-docs/assets/[capability]/` | `design-define` |
| Glosario | `docs/specs/glossary.md` (opcional) | `design-define` |
| Investigación | `research/RS-XXX-[slug]/README.md` **dentro de la carpeta del artefacto vinculado**; suelta: `docs/specs/research/RS-XXX-[slug]/README.md` | `work-research` |
| Progreso de un trabajo | `progress.md` dentro de la carpeta del trabajo (US / WI / FT) | `work-implement` |
| Archivos de apoyo | `assets/` dentro de la carpeta del artefacto; enlazar con rutas relativas | — |
| Reporte de trazabilidad | `trace-report.md` dentro de la carpeta del artefacto | `trace-validate` |
| Informe de calidad | `docs/audits/quality-check.md` (+ histórico `docs/audits/quality-check-<YYYYMMDD-HHMMSS>.md`) | `quality-check` |
| Informe de code review | `docs/audits/code-review.md` (+ histórico `docs/audits/code-review-<YYYYMMDD-HHMMSS>.md`) | `code-review` |
| Informe de auditoría de arquitectura | `docs/audits/arch-audit-YYYY-MM-DD.md` | `arch-audit` |
| Caché de corrida de pruebas | `.sdd-devkit/test-run.json` (**ubicación fija**, no por unidad) | `quality-check` |
| Estado de iteración para specTracking | `.sdd-devkit/current-iteration.json` (**ubicación fija**, vive mientras dura la unidad o corrección en curso) | `work-implement` |

## Identificadores y numeración

| Prefijo | Artefacto | Alcance del secuencial |
|---------|-----------|------------------------|
| `ADR-XXX` | Architecture Decision Record | Global, sobre `docs/adr/` |
| `US-XXX` | Historia de usuario | Global, sobre `docs/specs/user-stories/` **+ el archivo** |
| `TK-XXX` | Tarea técnica | Por historia de usuario padre |
| `WI-XXX` | Tarea de mantenimiento | Global, sobre `docs/specs/work-items/` **+ el archivo** |
| `FT-XXX` | Feature ya implementada | Global, sobre `docs/specs/features/` |
| `TC-XXX` | Caso de prueba | Por artefacto padre, sobre su `test-cases/` |
| `RS-XXX` | Informe de investigación | Por carpeta base de destino, **+ el archivo** cuando la base es `docs/specs/research/` |
| `CR-XXX` | Criterio de cumplimiento de un estándar | Por estándar; se referencia como `<estándar>/CR-XXX` |

Reglas comunes:

- **Prefijo en MAYÚSCULAS**, secuencial de tres dígitos.
- **Slug / nombre corto:** minúsculas, kebab-case, sin artículos ni palabras vacías; máximo ~5 palabras.
- **Nunca reutilizar un secuencial** ya existente en el alcance correspondiente: leer las carpetas o
  archivos presentes, tomar el número más alto y continuar desde el siguiente.
- **No renumerar ni sustituir** un identificador ya emitido al corregir el artefacto: rompe los índices,
  las líneas de trazabilidad y los reportes que lo citaban. Se edita conservando el ID.
- **No borrar** un artefacto que dejó de aplicar: marcarlo `Obsolete` / `Superseded` / `Deprecated`
  según su ciclo, y conservar la fila por trazabilidad.
- **Límite de longitud del tracker externo:** si el artefacto se vincula a un work item de un sistema
  externo, el nombre completo (`US-XXX-[nombre-corto]`, `TC-XXX-[slug]`…) debe respetar el límite de
  título de ese sistema; si lo supera, acortar el slug antes de crear la carpeta y conservar el título
  completo en el encabezado del documento. Ver [`alm/azure-devops.md`](alm/azure-devops.md).

## Archivado

`work-integrate` y `pr-create` pueden mover la carpeta de un trabajo cerrado bajo `docs/specs/archive/`,
si el usuario lo confirma:

| Origen | Destino de archivado |
|--------|----------------------|
| `docs/specs/user-stories/US-XXX-[nombre-corto]/` | `docs/specs/archive/user-stories/US-XXX-[nombre-corto]/` |
| `docs/specs/work-items/WI-XXX-[kebab-case]/` | `docs/specs/archive/work-items/WI-XXX-[kebab-case]/` |
| `docs/specs/research/RS-XXX-[slug]/` (investigación suelta huérfana) | `docs/specs/archive/research/RS-XXX-[slug]/` |

**Contrato para el resto del catálogo** — archivar **no** libera el identificador ni hace invisible el
trabajo:

1. **El ID sigue ocupado.** El siguiente secuencial libre se calcula sobre la ruta activa **y** sobre
   `docs/specs/archive/`.
2. **La carpeta se busca en ambas rutas.** Antes de reportar que un artefacto no existe, buscarlo bajo
   `docs/specs/archive/`. **No** recrear la carpeta en la ruta activa.
3. **La estructura interna se conserva** intacta (`README.md`, `TK-XXX-*.md`, `test-cases/`,
   `research/`, `progress.md`, `assets/`), así que todo se resuelve relativo a la carpeta encontrada.
4. **Solo `trace-validate` escribe dentro de un artefacto archivado**, y solo su propio
   `trace-report.md`: es un derivado del artefacto, no trabajo nuevo.

Detalle del flujo de archivado: [`skills/work-integrate/references/archive.md`](../skills/work-integrate/references/archive.md).
