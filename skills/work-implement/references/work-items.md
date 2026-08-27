# Tipo de implementacion: Tarea de mantenimiento

Flujo para **ejecutar en codigo** una tarea de mantenimiento `WI-XXX` bajo `docs/specs/work-items/`: bugs, refactor, deuda tecnica, actualizacion de dependencias, tareas operativas o de infraestructura. Esta referencia se carga desde `SKILL.md` cuando la seleccion de tipo resuelve a este caso. Asume ya resueltos el mecanismo de preguntas, el idioma, la validacion de repositorio y el ritmo de confirmacion (ver `SKILL.md`).

> **Naturaleza del WI:** documento **unico y combinado** - el requerimiento, los criterios de aceptacion y el plan de implementacion conviven en `WI-XXX-[kebab-case]/README.md`, que mapea 1:1 con un work item del tracker externo, si el repo usa uno. **No se descompone en sub-tareas** (modelo plano). Un esfuerzo grande son varios `WI-` hermanos, nunca un WI con hijos.
>
> **Unidad de confirmacion:** **el `WI-XXX` completo.** Se implementa el plan del WI como una unidad; al terminarlo se actualiza `progress.md` y se pide confirmacion antes de pasar al siguiente WI (si el alcance incluye varios). **Excepcion:** si el alcance tiene varios WI y la politica resuelta no exige pausar entre ellos (`confirmByUnit: never`, o peticion explicita del usuario en el turno), se activa el **modo de ejecucion paralela** del `SKILL.md` (analisis de dependencias, subagentes con worktree — hasta `maxParallel` — y merge secuencial), que omite estas pausas.

---

## Ubicacion de archivos

| Artefacto | Ruta |
| --------- | ---- |
| Work item | `docs/specs/work-items/WI-XXX-[kebab-case]/README.md` |
| Progreso | `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` |
| ADR | `docs/adr/` |
| Documentacion tecnica | `docs/specs/technical-docs/` |
| Glosario | `docs/specs/glossary.md` |

**Rama de trabajo:** `feature/WI-XXX-[kebab-case]` por defecto. Si el equipo usa prefijos por tipo, derivarlo del campo `Tipo` del WI segun esta tabla — son los ocho valores canonicos de la plantilla (`work-plan/assets/work-item-template.md`), sin abreviar ni traducir:

| `Tipo` del WI | Rama |
| ------------- | ---- |
| `bug-fix` | **Sin rama propia — directo en la rama de integracion** (ver excepcion abajo) |
| `security-update` | **Sin rama propia — directo en la rama de integracion** (ver excepcion abajo) |
| `refactor` | `refactor/` |
| `optimization` | `refactor/` |
| `dependency-update` | `chore/` |
| `test-improvement` | `chore/` |
| `documentation-update` | `chore/` |
| `operational-change` | `chore/` |

No asumir la rama base ni la de integracion; acordarla con el usuario.

> **Por que `test-improvement` va a `chore/` y no a `test/`.** El prefijo `test/` esta reservado para la **automatizacion de `TC-XXX`/`FT-XXX`**: `work-integrate` lo usa para inferir el tipo de trabajo y, a partir de ahi, exige en `Done` unicamente las unidades `TC-XXX`/`FT-XXX` de esa ejecucion. Un WI de mejora de pruebas no tiene esas unidades —su `progress.md` tiene una sola entrada, la del propio `WI-XXX`—, asi que con `test/` el cierre no encontraria nada que verificar y el WI se integraria sin comprobar su estado. `work-integrate` acepta `feature/`, `fix/`, `chore/` y `refactor/` para un WI; de esos, este skill solo **crea** `feature/`, `chore/` y `refactor/` — `fix/` queda para ramas creadas fuera de este flujo.

### Excepcion: `bug-fix` y `security-update` no crean rama

Un WI de tipo **`bug-fix`** o **`security-update`** se implementa **directamente sobre la rama de integracion** (la que el equipo use como tal: `develop`, `main`, `trunk`…). **No se crea ni se cambia a una rama `fix/`.**

- **Es el comportamiento por defecto y no se pregunta.** Basta con leer `Tipo` del WI: si es uno de esos dos, no hay eleccion de rama que ofrecer al usuario.
- **La rama de integracion si se confirma**, porque no se asume: si la rama actual no es la de integracion acordada, resolverla con el usuario (opciones tappables con los candidatos detectados) y hacer checkout antes de tocar codigo. No adivinar `main` ni `develop`.
- **El commit avisara.** `git-commit` pide una confirmacion extra al comitear en una rama de integracion o despliegue; es esperado, se responde una sola vez por invocacion y no sustituye la confirmacion de avance del Paso 3.
- **El cierre no hace handoff:** ver [Paso 4](#paso-4---cierre). No hay rama que mergear, asi que no se invoca `work-integrate` ni `pr-create`.
- **Sigue rigiendo todo lo demas:** `Ready` con criterios de aceptacion, ciclo TDD, lint/build, `progress.md`, checkboxes y la pausa de confirmacion antes de comitear.

> Si el repo tiene activada la integracion con un gestor de proyectos (`projectManagement.enabled` en `.sdd-devkit/settings.json`), el numero del WI es el ID del work item en ese sistema (`WI-1847`); si no, es un secuencial local (`WI-001`). Respetar el numero tal cual aparece en el archivo.

---

## Informacion requerida antes de implementar

| Dato | Como obtenerlo | Si no esta disponible |
| ---- | -------------- | --------------------- |
| **WI a implementar** | Indicado por el usuario (numero o nombre) | Preguntar cual; no asumir |
| **Alcance** | Un WI concreto o una lista de `WI-` hermanos | Preguntar si hay ambiguedad |
| **Tipo** | Campo `Tipo` del WI — uno de los ocho canonicos: `bug-fix`, `refactor`, `dependency-update`, `optimization`, `security-update`, `test-improvement`, `documentation-update`, `operational-change` | Leer del archivo; condiciona la rama (ver la tabla de prefijos) y el cierre |
| **Repositorio** | Campo `Repositorio` del WI (nombre del repositorio git al que afecta) | Leer del archivo; para `Ready` es obligatorio |
| **Rama** | Derivada del WI segun convencion del equipo. **`bug-fix` y `security-update` no tienen rama propia:** se trabaja en la rama de integracion | Crear desde la rama base acordada; para `bug-fix`/`security-update`, confirmar cual es la rama de integracion |

---

## Validacion especifica

Ademas de la validacion de repositorio transversal (`SKILL.md`):

- **WI existente y en `Ready`:** la carpeta `WI-XXX-[kebab-case]/` existe en `docs/specs/work-items/` y su `README.md` tiene `Estado: Ready`. Un `WI` en `Draft` (stub o incompleto) **no** es ejecutable - devolver a `work-plan` para completarlo.
- **WI no archivado:** si la carpeta no aparece en `docs/specs/work-items/`, buscarla en `docs/specs/archive/work-items/` antes de darla por inexistente. Si esta ahi, el WI **ya se cerro e integro**: **parar** y avisar — «`WI-007` esta archivado; para retomarlo hay que desarchivarlo primero, y eso lo decide el usuario». **Excepcion:** en [modo correccion](../SKILL.md#modo-correccion-delegado-desde-quality-check) delegado por `quality-check`, un artefacto archivado es esperable —la correccion llega en la fase de cierre, con el archivado ya commiteado—: ahi se continua, pero **sin escribir dentro de la carpeta archivada** (la nota de retrabajo va en el informe de `quality-check`). Importa especialmente en este flujo porque el Paso 1 hace «leer **o crear**» el `progress.md`: sin esta comprobacion crearia una carpeta fantasma en la ruta activa con un identificador ya usado. Ver [`work-integrate/references/archive.md`](../../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).
- **Criterios de aceptacion presentes:** el WI tiene **Criterios de aceptacion** verificables. Si faltan, parar: el WI no estaba realmente `Ready`.
- **Referencia de UI (si toca UI):** si el WI modifica UI, debe tener referencia de diseno en **Referencias** (Figma/wireframe). Sin ella, parar y avisar.
- **Test cases presentes:** verificar si existe la carpeta `docs/specs/work-items/WI-XXX-[kebab-case]/test-cases/` (dentro de la carpeta del WI) con al menos un archivo `TC-XXX-*.md`. Si no existe o esta vacia, **preguntar al usuario** (herramienta estructurada) antes de continuar:

  > "Este WI no tiene test cases definidos para la implementacion. ¿Como quieres continuar?"
  > Opciones: [Definir test cases primero] / [Si, continuar sin test cases] / [No, detener aqui]

  - Si elige **definir test cases con `test-define`**: hacer handoff al skill `test-define` para el WI actual; al completarse, retomar esta verificacion y continuar la implementacion.
  - Si elige **continuar sin test cases**: continuar normalmente.
  - Si elige **detener**: parar y sugerir ejecutar `test-define` primero.

- **README de test cases:** si la carpeta `test-cases/` existe, **leer su `README.md`** (`docs/specs/work-items/WI-XXX-[kebab-case]/test-cases/README.md`) para identificar que `TC-XXX` describen y cuales son **automatizables** (unit, integracion, e2e). Esta lectura alimenta el ciclo TDD del Paso 3 y las notas de cobertura en `progress.md`. Si el `README.md` no existe pero hay archivos `TC-XXX-*.md`, leer los propios test cases como fuente.

---

## Flujo de implementacion

### Paso 1 - Preparar repositorio y rama

1. Verificar working tree limpio; si no, parar y avisar.
2. Resolver la rama segun el `Tipo` del WI:
   - **`bug-fix` / `security-update`:** no crear rama. Confirmar cual es la rama de integracion y hacer checkout de ella si no se esta ya ahi (ver [Excepcion](#excepcion-bug-fix-y-security-update-no-crean-rama)).
   - **Resto de tipos:** hacer checkout de la rama del WI (crear desde la rama base acordada si no existe).
3. Leer o crear `progress.md` dentro de la carpeta del WI (`docs/specs/work-items/WI-XXX-[kebab-case]/progress.md`) desde `assets/progress-template.md`. El `progress.md` es específico de este WI — contiene únicamente las entradas del plan de implementación del `README.md`.

### Paso 2 - Presentar alcance

1. Leer **completo** cada `WI-*/README.md` del alcance: Descripcion, Criterios de aceptacion, Dependencias, Referencias y Plan de implementacion.
2. Construir dos listas:
   - **Implementables:** WI `Ready` con criterios de aceptacion, no marcados como `Done`.
   - **Excluidos:** el resto, con su estado entre parentesis - p. ej. `WI-007 - Limpieza de reportes (Draft)`.
3. Mostrar ambas listas. **No ejecutar codigo en este turno.**
4. Preguntar si continuar y **esperar confirmacion**.

### Paso 3 - Implementar WI a WI

> IMPORTANTE **Una unidad = un WI completo.** Se implementa todo el plan del WI; con `confirmByUnit: always`, al terminarlo detenerse y preguntar antes del siguiente WI del alcance (si hay varios): no avanzar sin confirmacion.

Por cada WI aprobado:

1. Aplicar el ciclo **TDD (Red → Green → Refactor)** por cada comportamiento del plan del WI:
   - **Red:** escribir el test que describe el comportamiento esperado, basandose en los insumos de comportamiento del WI: sus criterios de aceptacion (`AC-XXX`) y —cuando existan— las reglas de negocio (`BR-XX`) o los casos de prueba (`TC-XXX`) disponibles. Cuando el WI tenga test cases, tomar del `test-cases/README.md` los `TC-XXX` automatizables que apliquen y crear su prueba correspondiente. El test debe fallar antes de escribir codigo de produccion. **Excepcion — e2e:** se escriben aqui igual que las demas, pero **no se ejecutan en las iteraciones**, asi que no tienen paso Red (ver [Uso escalonado de pruebas](../SKILL.md#uso-escalonado-de-pruebas-optimizacion)).
   - **Green:** escribir el minimo codigo de produccion para que el test pase.
   - **Refactor:** limpiar codigo de produccion y test sin romper los tests. Aplicar principios de Clean Architecture (ver `SKILL.md`).
2. Si genera o modifica UI: ejecutar bajo `ui-specialist`. Si la referencia de diseno es Figma: usar el MCP de Figma.
3. Al terminar todos los comportamientos del WI, ejecutar lint/typecheck/build y las **pruebas unitarias y de integracion** del paquete/archivos afectados, **acotadas exclusivamente al cambio** — nunca la suite completa de un nivel ni la bateria del repo. **Unit e integracion estan al mismo nivel:** no se decide caso por caso si el cambio «cruza una frontera». **E2E se difiere al cierre** (Paso 4). Ver [Uso escalonado de pruebas](../SKILL.md#uso-escalonado-de-pruebas-optimizacion) en `SKILL.md`. Si algo falla, corregir antes de continuar.
4. **Verificar los criterios de aceptacion** del WI contra los tests; si algun criterio no tiene cobertura, completar el ciclo TDD para ese criterio antes de marcar `Done`.
5. Actualizar el artefacto y el progreso:
   - **Al iniciar el WI:** cambiar su estado en `progress.md` a `In Progress` y **poblar la lista de to-dos del agente**: la **primera entrada es el titulo del WI** (`WI-XXX` + titulo), para tener siempre presente el artefacto en ejecucion, seguida de **las tareas del `Plan de implementacion` del `README.md` del WI** (una entrada por tarea `IT-XX`, en el orden del plan). Cada entrada de tarea muestra solo la descripcion corta (`IT-XX` + linea corta), no el detalle completo.
   - **Al iniciar cada tarea del plan:** marcar `[ ]` => `[~]` (en progreso) en la seccion del plan de implementacion del `README.md` del WI y marcar su entrada en la lista de to-dos del agente como `in_progress`. Solo una tarea puede estar `[~]` a la vez.
   - **Por cada tarea del plan completada:** marcar `[~]` => `[x]` en la seccion del plan de implementacion del `README.md` del WI y marcar su entrada en la lista de to-dos del agente como `completed`.
   - **Al cerrar el WI:** cambiar su estado en `progress.md` a `Done` y rellenar el campo **Archivos** (rutas tocadas, una por linea, sin vineta, prefijadas `+`/`~`/`-`), con todas las tareas de su plan ya `completed` en la lista de to-dos del agente; marcar tambien la **primera entrada (titulo del WI) como `completed`** una vez que todas las tareas del plan hayan finalizado; registrar `Decisiones adicionales` si hubo decisiones nuevas en la sesion. Si el WI tenia test cases, completar el campo `Cobertura de test cases` del WI solo con observaciones puntuales: **cuales `TC-XXX` no se pudieron crear** (con motivo) o **para cuales se decidio otro tipo de prueba** distinto al del test case. Si todos se automatizaron como se esperaba, dejar el campo sin comentarios.
6. **Detenerse y preguntar** (herramienta estructurada), **sin commitear todavia los cambios del WI**: "WI-XXX completado. Continuo con WI-YYY - [titulo]?" Opciones: [Si, continuar] / [No, detener aqui]. Con `confirmByUnit: always`, si el alcance es un unico WI igualmente confirmar antes de pasar al cierre; con `confirmByUnit: never` no hay pausa y se encadena el cierre. Esta pausa, con el working tree aun sin commitear, es la ventana para que el usuario revise el resultado, aplique correcciones manuales o le indique ajustes al agente antes de que el cambio quede commiteado.
7. Solo si confirma: **invocar `/git-commit`** sobre los cambios de WI-XXX, delegando en ese skill la agrupacion, el mensaje, el staging y la deteccion de secretos — este skill no decide un mensaje ni stagea por cuenta propia. `git-commit` puede a su vez mostrar su propia propuesta y pedir confirmacion antes de comitear: es una confirmacion distinta a la del paso anterior (esa es sobre continuar al siguiente WI; esta es sobre el commit en si) y no la sustituye. Recien despues, pasar al siguiente WI. Si detiene, registrar nota y pasar al Paso 4 — la invocacion a `/git-commit` para este WI se hace ahi, en el cierre.

### Paso 4 - Cierre

1. Si el ultimo WI completado quedo sin commitear (el usuario detuvo el flujo en el Paso 3 antes de confirmar el siguiente), **invocar `/git-commit` sobre sus cambios ahora**. Verificar que las pruebas **de los archivos afectados** pasen limpias (unitarias e integracion, acotadas al cambio) y, **una sola vez sobre el codigo consolidado, correr las pruebas e2e** del alcance si el repo las tiene (ver [Uso escalonado de pruebas](../SKILL.md#uso-escalonado-de-pruebas-optimizacion) en `SKILL.md`); el working tree limpio y con todos los commits hechos. **La bateria completa de pruebas no se corre aqui:** la ejecuta `quality-check` al integrar (`work-integrate`) o crear el PR (`pr-create`).
2. **`bug-fix` / `security-update` — cierre sin handoff.** El trabajo ya esta en la rama de integracion: no hay nada que mergear ni PR que crear. Con el WI en `Done` y el working tree limpio, **terminar ahi**: no invocar `work-integrate` ni `pr-create`, ni ofrecer las opciones del punto siguiente. Reportar el WI cerrado, los SHA de los commits y la rama sobre la que quedaron. El push queda a criterio del usuario, fuera de este skill.
3. **Handoff (resto de tipos):** si el alcance esta en `Done`, **preguntar al usuario** (herramienta estructurada) como continuar:

   > "Implementacion completada. ¿Que quieres hacer ahora?"
   > Opciones: [Integrar el trabajo] / [Crear un PR] / [Terminar aqui]

   - **Integrar el trabajo** => **invocar `/work-integrate`** (no hacer el merge a la rama base directamente).
   - **Crear un PR** => **invocar `/pr-create`** (no crear el PR directamente).
   - **Terminar aqui** => cerrar sin handoff; el trabajo queda commiteado en la rama.

   Si quedan WI pendientes, indicar que falta cerrar antes de ofrecer estas opciones.

---

## Checklist

**Repositorio:** working tree limpio; rama del WI activa o creada — **o**, si el `Tipo` es `bug-fix`/`security-update`, rama de integracion confirmada y activa, sin crear rama; `progress.md` leido o creado.

**Alcance:** cada `WI-*/README.md` leido completo; listas presentadas; confirmacion recibida antes del primer cambio de codigo.

**Por cada WI:** `Ready` con criterios de aceptacion; no `Done`; ciclo TDD (Red→Green→Refactor) por cada comportamiento; test cases automatizables del `test-cases/README.md` cubiertos; UI bajo `ui-specialist`; Figma via MCP; plan completo implementado; criterios de aceptacion cubiertos por tests; lint/typecheck/build y tests **unitarios y de integracion** del cambio en verde (las e2e escritas se difieren al cierre y no bloquean el `Done` del WI si quedan registradas); `progress.md` a `Done` con `Cobertura de test cases` (TC no automatizados o con otro tipo de prueba documentados); decisiones de sesion registradas; **confirmacion explicita antes del siguiente WI**; `/git-commit` invocado recien al confirmar el avance (no antes) — o en el cierre, si el usuario detiene ahi.

**Cierre:** pruebas unitarias e integracion de los archivos afectados en verde (acotadas al cambio) y e2e del alcance corridas una vez sobre el codigo consolidado (la bateria completa la corre `quality-check`, no este skill); working tree limpio; handoff a `pr-create` o `work-integrate` — **salvo `bug-fix`/`security-update`, que cierran sin handoff** por estar ya en la rama de integracion.

---

## Ejemplos

**Ejemplo 1 - WI unico completo**
- *Entrada:* "Implementa el WI-002, actualizar Spring Boot a 3.3."
- *Salida:* checkout a la rama del WI; lee el WI completo; presenta el alcance; tras confirmacion aplica ciclo TDD por cada comportamiento del plan; lint/typecheck/build/tests en verde; criterios de aceptacion cubiertos por tests; actualiza `progress.md` a `Done`; handoff a `pr-create` o `work-integrate`.

**Ejemplo 2 - Varios WI hermanos**
- *Entrada:* "Implementa WI-003, WI-004 y WI-005 (structured logging en API, workers y batch)."
- *Comportamiento:* cola con los tres `Ready`; implementa WI-003 completo, lint/build, `progress.md` a `Done`, **pausa y pregunta** si continuar con WI-004. Mismo ciclo por cada WI.

**Ejemplo 2b - Varios WI hermanos sin confirmacion**
- *Entrada:* "Implementa WI-003, WI-004 y WI-005 de corrido, sin preguntar."
- *Comportamiento:* varios WI + peticion explicita de no confirmar => **modo de ejecucion paralela** (ver `SKILL.md`). Analisis de dependencias primero: si son independientes, corren en subagentes con worktree (hasta `maxParallel` en paralelo); si un WI depende de otro fuera del alcance, avisar para excluir o detener. Merge secuencial a la rama del artefacto, con lint/build/tests tras cada merge.

**Ejemplo 2c - WI de tipo `bug-fix`**
- *Entrada:* "Implementa el WI-011, corregir el calculo de impuestos en el carrito" (`Tipo: bug-fix`).
- *Comportamiento:* no se crea rama `fix/`; se confirma cual es la rama de integracion y se trabaja ahi. Mismo ciclo TDD, lint/build, `progress.md` a `Done` y pausa de confirmacion; al confirmar, `/git-commit` (que pedira su confirmacion extra por ser rama de integracion). El cierre **no** ofrece integrar ni crear PR: se reporta el WI cerrado y los SHA.

**Ejemplo 3 - WI en Draft**
- *Entrada:* "Ejecuta WI-007" y esta en Draft (stub sin criterios).
- *Salida:* `WI-007 (Draft)` en excluidos; no se implementa; devolver a `work-plan` para completarlo a `Ready`.

**Ejemplo 4 - WI de UI sin referencia de diseno**
- *Entrada:* "Implementa WI-009" (toca UI) pero el WI no tiene referencia de diseno en Referencias.
- *Comportamiento:* parar y avisar: el WI no estaba listo para implementar; falta la referencia de diseno.

---

## Anti-patterns (especificos del tipo)

- Descomponer un WI en sub-tareas o tratarlo como si tuviera `TK-XXX`; el WI es un documento plano.
- Implementar parte del plan del WI y pasar al siguiente sin completarlo ni verificar criterios.
- Comitear los cambios de un WI inmediatamente al terminarlo, antes de la pausa de confirmacion; el commit se hace al confirmar el avance al siguiente WI (o en el cierre, si el usuario detiene ahi).
- Marcar `Done` sin que los tests de los criterios de aceptacion **existan**. Deben **pasar en verde** los que corresponde ejecutar en la iteracion (unitarios y de integracion); las **e2e escritas y diferidas al cierre** —y, en modo paralelo, la integracion diferida por infra no aislable— no bloquean el `Done` si estan registradas en `progress.md` (ver [Uso escalonado de pruebas](../SKILL.md#uso-escalonado-de-pruebas-optimizacion)).
- Buscar los insumos de comportamiento en una US padre: el WI no proviene de una US; los tests se basan en los insumos del propio WI (`AC-XXX` y, si existen, `BR-XX` / `TC-XXX`).
- Implementar un WI en `Draft` (stub) como si estuviera listo.
- Crear una rama `fix/` para un WI de tipo `bug-fix` o `security-update`: esos van directo en la rama de integracion.
- Preguntar al usuario si quiere rama para un `bug-fix`/`security-update` (no hay eleccion), o dar por supuesta la rama de integracion sin confirmarla (esa si se confirma).
- Ofrecer handoff a `work-integrate` o `pr-create` al cerrar un `bug-fix`/`security-update`: no hay rama que integrar.
- Escribir codigo de produccion antes del test (romper el ciclo Red→Green→Refactor).
- Implementar UI sin `ui-specialist`, o UI con referencia Figma sin el MCP de Figma.

---

## Handoffs del ciclo

Posicion: **implementacion** - un WI es autocontenido (no proviene de `work-define`).

| | |
|--|--|
| **Entrada** | `WI-XXX` en `Estado: Ready` (Descripcion, Criterios de aceptacion, Dependencias, Referencias y Plan). Stubs en `Draft` **no** habilitan la implementacion. |
| **Salida** | Codigo commiteado; `progress.md` con el WI en `Done`; working tree limpio. |
| **Siguiente paso** | El WI ya comiteado via `/git-commit` durante la implementacion => `pr-create` (opcional) => `work-integrate`. Nota: `work-integrate` ejecutara las tres puertas de cierre (`quality-check`, `code-review` y `trace-validate`) y exigira veredicto `APPROVED` en las tres antes de integrar. **Excepcion `bug-fix` / `security-update`:** el trabajo ya esta en la rama de integracion, asi que **no hay siguiente paso** — el ciclo termina con el commit. |
| **Regreso desde plan** | Ambiguedad tecnica, criterios faltantes o alcance incorrecto => volver a `work-plan` para ajustar el WI. |
