---
name: story-implement
description: Usar al pedir implementar, desarrollar o ejecutar trabajo referenciado por historia de usuario o tarea.
license: MIT
---

# Implementar según historia y tareas

## Purpose

Guiar al agente para **implementar código** y cambios concretos descritos en documentación de producto: historias **US-XXX** y tareas **TK-XXX** bajo `docs/product/user-stories/`, respetando rama dedicada, `progress.md`, filtros por **Ready**, unidad de trabajo e usuario asignado, y un ritmo **una tarea por confirmación**.

Usar este skill cuando el usuario pida **implementar**, **desarrollar** o **ejecutar** trabajo referenciado por **US-XXX**, **TK-XXX**, o rutas a `docs/product/user-stories/US-.../` o a un `TK-....md` concreto. Las especificaciones de las TK siguen las convenciones de **story-define** y **story-plan** (`README.md` + `TK-XXX-....md` en la carpeta de la US).

## Scope

**Incluye:**

- Flujo **repositorio y rama** antes de tocar código: árbol git limpio; rama alineada con el nombre de carpeta `US-XXX-[nombre-corto]` (más prefijo del proyecto si aplica de forma consistente); exclusividad de esa rama para todo el trabajo de la US en la sesión.
- Lectura y mantenimiento de `**docs/product/user-stories/US-XXX-.../progress.md`** (crear desde `**references/progress.md`** si falta; actualizar estados y notas).
- Implementación **solo** de tareas cuyo metadato **Estado** en el TK sea **Ready**, con mensaje previo de cola (implementables + excluidas con estado entre paréntesis) y **confirmación explícita** antes de codificar.
- Filtros por **unidad de trabajo** e **usuario asignado** cuando la entrada es solo la US (salvo instrucción explícita contraria del usuario).
- Consulta a `**docs/product/work-units.md`** cuando el alcance de la unidad en el TK no esté claro.
- Validación con **lint**, **typecheck** o **build** del paquete/unidad afectada cuando exista en el proyecto.
- Fase opcional de **tests** al cierre, **solo** si el usuario acepta.
- Lectura de `**docs/product/glossary.md`** cuando aparezcan términos de dominio que requieran definición breve (no sustituto de technical-docs).

**No incluye:**

- Arrancar implementación sobre tareas **Draft**, **In Progress** o **Done** sin instrucción explícita y acotada del usuario (y en ese caso dejar nota en `progress.md`).
- **Codificar en el mismo turno** en que solo se presenta el listado de tareas: el orden es listado → pregunta → confirmación → implementación.
- Escribir o ejecutar **pruebas unitarias ni E2E** durante el ciclo por tareas (hasta la fase final acordada).
- Cambiar de rama o mezclar trabajo de **otras historias** sin instrucción explícita del usuario.
- Sustituir el flujo de **especificación** de TK: redactar o reestructurar tareas nuevas corresponde a **story-plan**; aquí solo **consumir** TK salvo correcciones menores acordadas.

## Inputs

Para ejecutar bien el skill, el agente necesita:

- **Identificador o ruta** entre: `US-001` / `US-123` (carpeta `docs/product/user-stories/US-XXX-*`), `TK-001` (con regla especial si viene **solo** TK: ver **Notes**), o ruta a carpeta de historia / archivo `TK-*.md`.
- **Repositorio** con posibilidad de cumplir: working tree **limpio** antes de implementar (`git status` sin cambios pendientes no resueltos); si no, **parar** y avisar al usuario.
- Para entrada **solo US-XXX**: capacidad de inferir **unidad de trabajo** (p. ej. `name` de `package.json` del workspace / paquete abierto) o **preguntar** al usuario; `**git config user.name`** para filtrar **usuario asignado** en los TK cuando aplique.
- Si hay **ambigüedad** (varias carpetas con el mismo US, varios TK coincidentes), **preguntar** antes de implementar.

## Outputs

Tras aplicar el skill, el agente debe:

- **En el repo:** cambios de código y archivos tocados según cada TK **Ready** ejecutada; `**progress.md`** actualizado (`pending` → `in-progress` → `done`, o `skipped` si se acuerda); identificadores de tarea como `**TK-XXX`** coherentes con los archivos TK.
- **Respuesta al usuario:** antes de la primera implementación, un mensaje con **tareas a implementar** (solo Ready que pasen filtros) y **tareas no incluidas** con **(Estado)** al final del nombre/título, p. ej. `TK-002 — Ajuste de permisos (Draft)`, `TK-004 — Exportación CSV (Skipped)`; tras cada tarea, **preguntar si continúa** con la siguiente.
- **Al cierre del alcance:** ofrecer implementación de tests; si el usuario rechaza, **nota** en `progress.md`.

## Rules

- **Árbol limpio y rama de la US:** no leer/actualizar `progress.md`, listar tareas ni cambiar código hasta cumplir working tree limpio y estar en la rama derivada de `**US-XXX-[nombre-corto]`** (`checkout` o `checkout -b` desde la base acordada). Toda la implementación en esa rama salvo instrucción explícita en contrario.
- **Solo Ready** en la cola por defecto; en `progress.md`, entradas `**skipped`** se tratan como no ejecutables en esa pasada igual que las no Ready.
- **Listado y confirmación obligatorios** antes del primer cambio de código: mostrar implementables + excluidas con estado entre paréntesis; **preguntar explícitamente** si se desea continuar; **esperar** respuesta afirmativa.
- **Una tarea por vez:** completar → lint/build del alcance → actualizar `progress.md` → **preguntar** antes de la siguiente.
- **Sin tests durante el ciclo:** permitido linters, typecheck, build; **no** suites unitarias ni E2E hasta fase final si el usuario acepta.
- **Orden:** respetar orden numérico `TK-001`, `TK-002`, … salvo dependencias obvias en el texto; si hay conflicto, **preguntar**.
- **Alcance de unidad:** si el TK no deja claro qué cubre la **Unidad de trabajo**, revisar la sección titulada igual en `**docs/product/work-units.md`** antes de asumir límites.
- **Excepciones por usuario** (todas las tareas, lista concreta de TK, otro implementador) **priorizan** sobre filtros automáticos de unidad / git cuando el usuario lo diga explícitamente.
- **UI con referencia Figma (obligatorio):** si la implementación incluye UI y existe referencia a Figma (archivo, selección o URL), se debe usar obligatoriamente el skill `figma-implement-design` ejecutado con el agente `ui-specialist` antes y durante la implementación de esa UI.

## Steps

1. **Resolver alcance TK solo:** si el usuario indica **solo** `TK-XXX` sin US ni ruta que fije la historia, **preguntar** a qué `**US-XXX`** pertenece y **no** buscar ni implementar hasta tenerla (no aplica si en el mismo mensaje vienen US+TK, hay ruta a `TK-....md` bajo una US, o el contexto fija la carpeta y el usuario confirma).
2. **Resolver carpeta US y TK afectados:** localizar `docs/product/user-stories/US-XXX-[nombre-corto]/`, lista de `TK-*.md` según la entrada (todos si es solo US; uno o los indicados si es TK / lista).
3. **Repositorio y rama (obligatorio antes de código):**
  - Comprobar working tree limpio (`git status` / `--porcelain`); si no, **parar** y avisar.
  - Nombre de rama = segmento de carpeta `US-XXX-[nombre-corto]` (más prefijo del repo si es convención establecida).
  - Si la rama existe → `git checkout`; si no → `git checkout -b` desde la base acordada.
4. `**progress.md`:** si existe, leerlo y respetar **done**; si hay **in-progress**, revisar notas y archivos para continuar desde el estado real. Si no existe, crearlo con estructura mínima según `**references/progress.md`** (adaptar al producto; no publicar el archivo de referencia tal cual en `docs/product/`).
5. **Filtros (entrada solo US):** leer `README.md` y los TK relevantes + referencias enlazadas. Inferir unidad de trabajo; solo encolar TK cuyo campo **Unidad de trabajo** coincida de forma razonable; si el TK tiene **Implementador previsto**, filtrar por `git config user.name` o nombre indicado por el usuario; aplicar **excepciones explícitas** del usuario si las hay.
6. **Cola y mensaje previo:** determinar TK **Ready** que pasen filtros y no estén **done** / **skipped** en `progress.md` (salvo regla explícita del usuario). **Mostrar** listado ordenado de las que se implementarían y **listado de excluidas** con **(Estado)** al final. **No** ejecutar código en este turno. **Preguntar** si se desea continuar y **esperar** confirmación.
7. **Por cada tarea Ready aprobada (en la rama de la US):** implementar según TK → lint/build del paquete afectado → actualizar `progress.md` (**done** o **in-progress** con notas) → **preguntar** si continúa con la siguiente (no arrancar la siguiente sin confirmación).
8. **Cierre:** cuando no queden pendientes en el alcance acordado (o el usuario detiene), **preguntar** si implementar pruebas unitarias y/o E2E basadas en criterios del `README.md` de la US y de los TK ejecutados; si rechaza, **nota** en `progress.md`.
9. **Glosario:** si al documentar progreso o notas surgen términos o abreviaturas que requieran definición en contexto de producto, añadir o actualizar `**docs/product/glossary.md`** con definiciones **cortas** y **solo terminología** (no detalle técnico largo).

## Examples

**Ejemplo 1 — Input:** «Implementa lo Ready de la US-042; estoy en el paquete `@acme/web-app`.»  
**Output:** Tras rama limpia y checkout a rama `US-042-...`, mensaje con TK Ready del paquete en cola y TK en Draft/Skipped con `(Draft)` / `(Skipped)`; tras «sí, continúa», implementa la primera Ready, actualiza `progress.md`, ejecuta lint/build del paquete, pregunta por la siguiente. Sin tests hasta el cierre salvo que el usuario pida la fase de pruebas.

**Ejemplo 2 — Input:** «Implementa TK-003.» (sin US ni ruta).  
**Output:** El agente **pregunta**: «¿De qué historia `US-XXX` es TK-003?» y **no** modifica código hasta recibir la US o una ruta que vincule la tarea.

**Ejemplo 3 — Input:** «Ejecuta TK-005 en la US-042.» y el TK-005 está en **Draft**.  
**Output:** Listado: «no incluida en esta ejecución: TK-005 — … **(Draft)**»; cola de implementables vacía o sin TK-005; **no** implementa TK-005 hasta Ready o excepción explícita del usuario con nota en `progress.md` si aplica.

## Anti-patterns

- Commitear o codificar con **working tree sucio** sin avisar y pausar.
- **Implementar** en `main` u otra rama que no sea la de la carpeta `US-XXX-[nombre-corto]` sin instrucción explícita.
- **Saltarse** el mensaje de cola + confirmación e ir directo al código.
- Tratar tareas **Draft** como ejecutables por defecto.
- Añadir **tests unitarios o E2E** en mitad del ciclo por tareas cuando el usuario no ha aceptado la fase final de pruebas.
- Arrancar la **siguiente** TK **sin** que el usuario confirme después de terminar la anterior.
- Ignorar `**progress.md`** o usar alias arbitrarios en lugar de `**TK-XXX`** en el progreso.
- Usar `**glossary.md`** como technical-docs o listado de implementación.
- Redactar **TK nuevas de punta a punta** en lugar de remitir a **story-plan** (salvo corrección menor acordada).

## Notes

- **Solo TK sin contexto:** la pregunta por `US-XXX` **no aplica** cuando el vínculo ya es claro (mismo mensaje US+TK, ruta a `docs/product/user-stories/US-.../TK-....md`, archivo abierto bajo la carpeta de la US con confirmación).
- **Plantilla de `progress.md`:** estructura y valores de **status** en `**references/progress.md`** empaquetado con el skill.
- **Relación con otros skills:** **story-plan** define el formato de los TK (metadatos, unidad, implementador previsto); este skill **consume** esas especificaciones para código real.
- **Profundidad del repo:** rutas a `../../technical-docs/`, `docs/adr/`, `docs/product/adr/` según enlacen los TK; ajustar si la estructura difiere.

