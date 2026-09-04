# Artefactos: rutas, identificadores y archivado (compartida)

Referencia transversal del plugin **SDD Devkit**. Es la **fuente única** del layout del harness: dónde
vive cada artefacto, cómo se numera y qué pasa cuando se archiva. Cada `SKILL.md` apunta aquí en lugar
de repetir la tabla completa, y solo lista **las filas que él escribe o lee** cuando aporta algo
específico (una salida propia, una excepción de ruta).

> **Notación de placeholders.** `[nombre-corto]`, `[kebab-case]`, `[slug]`, `[capability]`, `XXX`.
> En documentos antiguos aparece la forma equivalente `{slug}` / `{nombre}`; significan lo mismo.
> `XXX` es un secuencial de **tres dígitos** (`001`, `002`, …). **Excepción:** cuando el artefacto se crea
> en un tracker externo, `XXX` es el `id` que asigna ese sistema, **sin padding de ceros** — ver
> [`project-managers/azure-devops.md`](project-managers/azure-devops.md).

> **Resolución de la raíz.** Las rutas de esta tabla son **relativas a una raíz**, no al directorio desde
> el que se invoca el skill. Cuál es esa raíz depende de la familia del artefacto: los de **arquitectura**
> (ADR, estándares, fitness functions, informe de `arch-audit`) cuelgan de la **raíz de arquitectura** —
> ver [Raíz de arquitectura](#raíz-de-arquitectura-adr-estándares-y-fitness-functions); los de
> **especificación** (`docs/specs/…`) cuelgan de la raíz del repositorio principal según
> `specification.basePath`, y **no** se ven afectados por la resolución de arquitectura.

> **Resolución de `docs/archive/`.** Es el valor por defecto de `specification.archivePath`
> (`.sdd-devkit/settings.json`), y así aparece escrito —literal— en esta tabla, en
> [`work-integrate/references/archive.md`](../skills/work-integrate/references/archive.md) y en el
> resto del catálogo. **Antes de resolver cualquier ruta de archivado** (destino de un `git mv`,
> fallback de lectura, o escaneo de IDs bajo el archivo), leer `specification.archivePath`: si el
> repo declaró un valor distinto del default, sustituirlo por ese valor en lugar de
> `docs/archive/`. Si no hay `settings.json`, o la clave falta, aplica el default. `basePath`
> (`docs/specs/` en esta tabla) es puramente convencional hoy — solo lo resuelve el hook de
> seguimiento de especificaciones (ver [`../hooks/README.md`](../hooks/README.md)) — y no se
> sustituye en el resto del catálogo.

## Layout del harness

| Artefacto | Ruta | Skill propietario |
|-----------|------|-------------------|
| Memoria del harness | `.agents/MEMORY.md` | `arch-init` |
| Configuración del plugin (incluye el idioma) | `.sdd-devkit/settings.json` | `arch-init` |
| Instrucciones para agentes | `AGENTS.md` (+ `CLAUDE.md` como puntero) | `arch-init` |
| ADR | `<raíz-arq>/docs/adr/ADR-XXX-[slug].md` | `arch-manage` · índice `<raíz-arq>/docs/adr/README.md`: lo crea `arch-init`, lo mantiene `arch-manage` |
| Estándar de dominio | `<raíz-arq>/docs/standards/[slug].md` (o `<raíz-arq>/docs/standards/[slug]/README.md`) | `arch-manage` · índice `<raíz-arq>/docs/standards/README.md`: lo crea `arch-init`, lo mantiene `arch-manage` |
| Fitness functions | `<raíz-arq>/scripts/arch/verify.<ext>` + `<raíz-arq>/scripts/arch/checks/[slug-estándar].<ext>` | `arch-manage` |
| Definition of Done | `docs/policies/definition-of-done.md` | **Ninguno — lo escribe y lo mantiene el equipo.** Los skills lo leen; ningún skill del plugin lo genera ni ofrece generarlo. |
| Especificación de requisitos (SRS) | `docs/specs/requirements/SRS-XXX-[nombre-corto]/README.md` | `requirement-refine` |
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
| Reporte de trazabilidad | `coverage.md` dentro de la carpeta del artefacto | `trace-validate` |
| Informe de calidad | `docs/audits/quality-check.md` (+ histórico `docs/audits/quality-check-<YYYYMMDD-HHMMSS>.md`) | `quality-check` |
| Informe de code review | `docs/audits/code-review.md` (+ histórico `docs/audits/code-review-<YYYYMMDD-HHMMSS>.md`) | `code-review` |
| Informe de auditoría de arquitectura | `<raíz-arq>/docs/audits/arch-audit-YYYY-MM-DD.md` (con sufijo `-HHMM` si ya hay uno de ese día) | `arch-audit` |
| Caché de corrida de pruebas | `.sdd-devkit/test-run.json` (**ubicación fija**, no por unidad) | `quality-check` |
| Estado de iteración para el seguimiento de especificaciones | `.sdd-devkit/current-iteration.json` (**ubicación fija**, vive mientras dura la unidad o corrección en curso) | `work-implement` |

## Raíz de arquitectura (ADR, estándares y fitness functions)

Los artefactos de arquitectura describen **el código de un repositorio concreto**: sus decisiones, sus
normas y los chequeos que las verifican. Por eso **no viven siempre en la raíz del repo principal**, sino
en la raíz del repositorio al que pertenece el código del que trata la decisión — el **`<raíz-arq>`** de la
tabla de arriba. Un submódulo con su propio stack tiene sus propios ADR, sus propios estándares y su propio
runner de fitness functions, versionados junto a su código.

> **Esto no afecta a las especificaciones.** `docs/specs/…` (US, WI, FT, TC, investigaciones, documentos
> técnicos, glosario) se resuelve siempre contra `specification.basePath` de `.sdd-devkit/settings.json`,
> sobre el repositorio principal. Un skill de arquitectura que escriba en un submódulo **no** mueve ni
> duplica nada bajo `docs/specs/`.

### Cómo se resuelve

1. **Detectar los repositorios candidatos** desde la raíz del repo principal:
   - `git submodule status` (o leer `.gitmodules`) lista los submódulos declarados.
   - Adicionalmente, un directorio con su propio `.git` que no esté declarado como submódulo también es
     un repositorio anidado válido.
   - Si no hay ninguno, la raíz de arquitectura **es la raíz del repo principal**: `docs/adr/`,
     `docs/standards/`, `scripts/arch/`. Fin — no se pregunta nada.
2. **Si hay uno o más repositorios anidados**, resolver el destino **preguntando al usuario** con la
   herramienta de preguntas estructuradas del cliente: presentar la raíz principal y cada submódulo
   detectado (ruta relativa + stack detectado, si se conoce) y dejar que elija dónde vive el artefacto.
   No inferirlo en silencio: un mismo ADR puede pertenecer legítimamente a la raíz (decisión transversal)
   o a un submódulo (decisión de ese componente).
3. **Preguntar una sola vez por invocación.** Resuelta la raíz, todos los artefactos de esa corrida
   —ADR, estándar, checks, runner, índices— se escriben bajo ella. En invocaciones en lote (p. ej.
   `arch-discover` generando varios ADR) se resuelve una vez para todo el lote, salvo que el propio lote
   abarque explícitamente varios repositorios.
4. **Todo se resuelve relativo a esa raíz**, sin excepción: los índices (`README.md` de `docs/adr/` y
   `docs/standards/`), la numeración y el runner.

### Consecuencias sobre numeración y auditoría

- **Los secuenciales `ADR-XXX` son globales por raíz de arquitectura**, no por workspace. El repo
  principal y cada submódulo llevan su propia serie: puede existir `ADR-001` en ambos y no es un
  conflicto. Al calcular el siguiente número, leer **solo** el `docs/adr/` de la raíz resuelta.
- Lo mismo vale para los `CR-XXX`: su alcance es el estándar, y el estándar vive en una raíz concreta.
- **`arch-audit` audita una raíz de arquitectura a la vez.** Lee los estándares de esa raíz y ejecuta su
  runner (`<raíz-arq>/scripts/arch/verify.<ext>`), escribiendo el informe en el `docs/audits/` de la
  misma raíz. Auditar varias raíces implica varias corridas.
- **Referencias entre raíces:** un ADR de un submódulo puede citar un ADR de la raíz principal (o al
  revés). Como el mismo número existe en ambas series, el identificador solo no basta: citar **el nombre
  de la raíz** junto al ID (p. ej. `ADR-004 de la raíz principal`) y, si se añade ruta, contarla desde el
  archivo que la escribe hasta la otra raíz (`../../../docs/adr/ADR-004-….md` desde un submódulo de
  primer nivel; un nivel más por cada carpeta intermedia). Ese enlace **no navega en GitHub** —cruza el
  límite entre dos repositorios—, así que el nombre de la raíz es lo que hace legible la referencia.

> **Excepción: `arch-init`.** Al bootstrapear el harness puede crear los índices de **varias** raíces en
> una sola corrida (los que el usuario elija). Si el proyecto es multi-repo, esas raíces pueden no existir
> todavía: `arch-init` también puede crear el propio repositorio de especificaciones (la raíz principal) y
> los submódulos que originan el resto de raíces, no solo detectar los ya existentes — ver
> `skills/arch-init/references/multi-repo.md`. El resto de skills de arquitectura —`arch-manage`,
> `arch-discover`, `arch-audit`— operan siempre sobre **una** raíz por invocación.

## Identificadores y numeración

| Prefijo | Artefacto | Alcance del secuencial |
|---------|-----------|------------------------|
| `ADR-XXX` | Architecture Decision Record | Global, sobre el `docs/adr/` **de su raíz de arquitectura** |
| `SRS-XXX` | Especificación de requisitos de software | Global, sobre `docs/specs/requirements/` |
| `US-XXX` | Historia de usuario | Global, sobre `docs/specs/user-stories/` **+ el archivo** |
| `TK-XXX` | Tarea técnica | Por historia de usuario padre |
| `WI-XXX` | Tarea de mantenimiento | Global, sobre `docs/specs/work-items/` **+ el archivo** |
| `FT-XXX` | Feature ya implementada | Global, sobre `docs/specs/features/` |
| `TC-XXX` | Caso de prueba | Por artefacto padre, sobre su `test-cases/` |
| `RS-XXX` | Informe de investigación | Por carpeta base de destino, **+ el archivo** cuando la base es `docs/specs/research/` |
| `CR-XXX` | Criterio de cumplimiento de un estándar | Por estándar (y por tanto por raíz de arquitectura); se referencia como `<estándar>/CR-XXX` |

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
  completo en el encabezado del documento. Ver [`project-managers/azure-devops.md`](project-managers/azure-devops.md).

## Archivado

`work-integrate` y `pr-create` pueden mover la carpeta de un trabajo cerrado bajo `docs/archive/`,
si el usuario lo confirma:

| Origen | Destino de archivado |
|--------|----------------------|
| `docs/specs/user-stories/US-XXX-[nombre-corto]/` | `docs/archive/user-stories/US-XXX-[nombre-corto]/` |
| `docs/specs/work-items/WI-XXX-[kebab-case]/` | `docs/archive/work-items/WI-XXX-[kebab-case]/` |
| `docs/specs/research/RS-XXX-[slug]/` (investigación suelta huérfana) | `docs/archive/research/RS-XXX-[slug]/` |

**Contrato para el resto del catálogo** — archivar **no** libera el identificador ni hace invisible el
trabajo:

1. **El ID sigue ocupado.** El siguiente secuencial libre se calcula sobre la ruta activa **y** sobre
   `docs/archive/`.
2. **La carpeta se busca en ambas rutas.** Antes de reportar que un artefacto no existe, buscarlo bajo
   `docs/archive/`. **No** recrear la carpeta en la ruta activa.
3. **La estructura interna se conserva** intacta (`README.md`, `TK-XXX-*.md`, `test-cases/`,
   `research/`, `progress.md`, `assets/`), así que todo se resuelve relativo a la carpeta encontrada.
4. **Solo `trace-validate` escribe dentro de un artefacto archivado**, y solo su propio
   `coverage.md`: es un derivado del artefacto, no trabajo nuevo.

Detalle del flujo de archivado: [`skills/work-integrate/references/archive.md`](../skills/work-integrate/references/archive.md).
