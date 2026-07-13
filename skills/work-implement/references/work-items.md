# Tipo de implementacion: Work item de mantenimiento

Flujo para **ejecutar en codigo** un work item de mantenimiento `WI-XXX` bajo `docs/specs/work-items/`: bugs, refactor, deuda tecnica, actualizacion de dependencias, tareas operativas o de infraestructura. Esta referencia se carga desde `SKILL.md` cuando la seleccion de tipo resuelve a este caso. Asume ya resueltos el mecanismo de preguntas, el idioma, la validacion de repositorio y el ritmo de confirmacion (ver `SKILL.md`).

> **Naturaleza del WI:** documento **unico y combinado** - el requerimiento, los criterios de aceptacion y el plan de implementacion conviven en `WI-XXX-[kebab-case]/README.md`, que mapea 1:1 con un work item de ADO. **No se descompone en sub-tareas** (modelo plano). Un esfuerzo grande son varios `WI-` hermanos, nunca un WI con hijos.
>
> **Unidad de confirmacion:** **el `WI-XXX` completo.** Se implementa el plan del WI como una unidad; al terminarlo se actualiza `progress.md` y se pide confirmacion antes de pasar al siguiente WI (si el alcance incluye varios). **Excepcion:** si el alcance tiene varios WI y el usuario pide ejecutar **sin confirmacion**, se activa el **modo de ejecucion paralela** del `SKILL.md` (analisis de dependencias, subagentes con worktree — max 3 — y merge secuencial), que omite estas pausas.

---

## Ubicacion de archivos

| Artefacto | Ruta |
| --------- | ---- |
| Work item | `docs/specs/work-items/WI-XXX-[kebab-case]/README.md` |
| Progreso | `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` |
| ADR | `docs/adr/` |
| Documentacion tecnica | `docs/specs/technical-docs/` |
| Glosario | `docs/specs/glossary.md` |

**Rama de trabajo:** `feature/WI-XXX-[kebab-case]` por defecto. Si el equipo usa prefijos por tipo, el prefijo puede seguir el `Tipo` del WI (`bug` => `fix/`, refactor/deuda/dependencias/operativa => `chore/` o `refactor/`). No asumir la rama base; acordarla con el usuario.

> Con ADO, el numero del WI es el ID del work item (`WI-1847`); sin ADO es un secuencial local (`WI-001`). Respetar el numero tal cual aparece en el archivo.

---

## Informacion requerida antes de implementar

| Dato | Como obtenerlo | Si no esta disponible |
| ---- | -------------- | --------------------- |
| **WI a implementar** | Indicado por el usuario (numero o nombre) | Preguntar cual; no asumir |
| **Alcance** | Un WI concreto o una lista de `WI-` hermanos | Preguntar si hay ambiguedad |
| **Tipo** | Campo `Tipo` del WI (bug / refactor / deuda-tecnica / dependencias / operativa) | Leer del archivo; condiciona la rama y el cierre |
| **Repositorio** | Campo `Repositorio` del WI (nombre del repositorio git al que afecta) | Leer del archivo; para `Ready` es obligatorio |
| **Rama** | Derivada del WI segun convencion del equipo | Crear desde la rama base acordada |

---

## Validacion especifica

Ademas de la validacion de repositorio transversal (`SKILL.md`):

- **WI existente y en `Ready`:** la carpeta `WI-XXX-[kebab-case]/` existe en `docs/specs/work-items/` y su `README.md` tiene `Estado: Ready`. Un `WI` en `Draft` (stub o incompleto) **no** es ejecutable - devolver a `work-plan` para completarlo.
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
2. Resolver y hacer checkout de la rama del WI (crear desde la rama base acordada si no existe).
3. Leer o crear `progress.md` dentro de la carpeta del WI (`docs/specs/work-items/WI-XXX-[kebab-case]/progress.md`) desde `assets/progress-template.md`. El `progress.md` es específico de este WI — contiene únicamente las entradas del plan de implementación del `README.md`.

### Paso 2 - Presentar alcance

1. Leer **completo** cada `WI-*.md` del alcance: Requerimiento, Criterios de aceptacion, Dependencias, Referencias y Plan de implementacion.
2. Construir dos listas:
   - **Implementables:** WI `Ready` con criterios de aceptacion, no marcados como `Done`.
   - **Excluidos:** el resto, con su estado entre parentesis - p. ej. `WI-007 - Limpieza de reportes (Draft)`.
3. Mostrar ambas listas. **No ejecutar codigo en este turno.**
4. Preguntar si continuar y **esperar confirmacion**.

### Paso 3 - Implementar WI a WI

> IMPORTANTE **Una unidad = un WI completo.** Se implementa todo el plan del WI; al terminarlo, detenerse y preguntar antes del siguiente WI del alcance (si hay varios). No avanzar sin confirmacion.

Por cada WI aprobado:

1. Aplicar el ciclo **TDD (Red → Green → Refactor)** por cada comportamiento del plan del WI:
   - **Red:** escribir el test que describe el comportamiento esperado, basandose en los insumos de comportamiento del WI: sus criterios de aceptacion (`AC-XXX`) y —cuando existan— las reglas de negocio (`BR-XX`) o los casos de prueba (`TC-XXX`) disponibles. Cuando el WI tenga test cases, tomar del `test-cases/README.md` los `TC-XXX` automatizables que apliquen y crear su prueba correspondiente. El test debe fallar antes de escribir codigo de produccion.
   - **Green:** escribir el minimo codigo de produccion para que el test pase.
   - **Refactor:** limpiar codigo de produccion y test sin romper los tests. Aplicar principios de Clean Architecture (ver `SKILL.md`).
2. Si genera o modifica UI: ejecutar bajo `ui-specialist`. Si la referencia de diseno es Figma: usar el MCP de Figma.
3. Al terminar todos los comportamientos del WI, ejecutar lint/typecheck/build y la suite de tests del paquete afectado. Si algo falla, corregir antes de continuar.
4. **Verificar los criterios de aceptacion** del WI contra los tests; si algun criterio no tiene cobertura, completar el ciclo TDD para ese criterio antes de marcar `Done`.
5. Actualizar el artefacto y el progreso:
   - **Al iniciar el WI:** cambiar su estado en `progress.md` a `In Progress` y **poblar la lista de to-dos del agente**: la **primera entrada es el titulo del WI** (`WI-XXX` + titulo), para tener siempre presente el artefacto en ejecucion, seguida de **las tareas del `Plan de implementacion` del `WI-XXX.md`** (una entrada por tarea `IT-XX`, en el orden del plan). Cada entrada de tarea muestra solo la descripcion corta (`IT-XX` + linea corta), no el detalle completo.
   - **Por cada tarea del plan completada:** marcar `[ ]` => `[x]` en la seccion del plan de implementacion del `WI-XXX.md` correspondiente y marcar su entrada en la lista de to-dos del agente como `completed`.
   - **Al cerrar el WI:** cambiar su estado en `progress.md` a `Done`, con todas las tareas de su plan ya `completed` en la lista de to-dos del agente; marcar tambien la **primera entrada (titulo del WI) como `completed`** una vez que todas las tareas del plan hayan finalizado; registrar `Decisiones adicionales` si hubo decisiones nuevas en la sesion. Si el WI tenia test cases, completar el campo `Cobertura de test cases` del WI: que `TC-XXX` se automatizaron y, sobre todo, **cuales no se pudieron crear** (con motivo) o **para cuales se decidio otro tipo de prueba** distinto al del test case.
6. **Detenerse y preguntar** (herramienta estructurada): "WI-XXX completado. Continuo con WI-YYY - [titulo]?" Opciones: [Si, continuar] / [No, detener aqui]. Si el alcance es un unico WI, igualmente confirmar antes de pasar al cierre.
7. Solo si confirma: siguiente WI. Si detiene, registrar nota y pasar al Paso 4.

### Paso 4 - Cierre

1. Verificar que la suite de tests pase limpia y el working tree este limpio con commits hechos.
2. **Handoff:** si el alcance esta en `Done`, **preguntar al usuario** (herramienta estructurada) como continuar:

   > "Implementacion completada. ¿Que quieres hacer ahora?"
   > Opciones: [Integrar el trabajo] / [Crear un PR] / [Terminar aqui]

   - **Integrar el trabajo** => **invocar `/work-integrate`** (no hacer el merge a la rama base directamente).
   - **Crear un PR** => **invocar `/pr-create`** (no crear el PR directamente).
   - **Terminar aqui** => cerrar sin handoff; el trabajo queda commiteado en la rama.

   Si quedan WI pendientes, indicar que falta cerrar antes de ofrecer estas opciones.

---

## Checklist

**Repositorio:** working tree limpio; rama del WI activa o creada; `progress.md` leido o creado.

**Alcance:** cada `WI-*.md` leido completo; listas presentadas; confirmacion recibida antes del primer cambio de codigo.

**Por cada WI:** `Ready` con criterios de aceptacion; no `Done`; ciclo TDD (Red→Green→Refactor) por cada comportamiento; test cases automatizables del `test-cases/README.md` cubiertos; UI bajo `ui-specialist`; Figma via MCP; plan completo implementado; criterios de aceptacion cubiertos por tests; lint/typecheck/build/tests en verde; `progress.md` a `Done` con `Cobertura de test cases` (TC no automatizados o con otro tipo de prueba documentados); decisiones de sesion registradas; **confirmacion explicita antes del siguiente WI**.

**Cierre:** suite de tests en verde; working tree limpio; handoff a `pr-create` o `work-integrate`.

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
- *Comportamiento:* varios WI + peticion explicita de no confirmar => **modo de ejecucion paralela** (ver `SKILL.md`). Analisis de dependencias primero: si son independientes, corren en subagentes con worktree (max 3 en paralelo); si un WI depende de otro fuera del alcance, avisar para excluir o detener. Merge secuencial a la rama del artefacto, con lint/build/tests tras cada merge.

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
- Marcar `Done` sin que los tests de los criterios de aceptacion existan y pasen en verde.
- Buscar los insumos de comportamiento en una US padre: el WI no proviene de una US; los tests se basan en los insumos del propio WI (`AC-XXX` y, si existen, `BR-XX` / `TC-XXX`).
- Implementar un WI en `Draft` (stub) como si estuviera listo.
- Escribir codigo de produccion antes del test (romper el ciclo Red→Green→Refactor).
- Implementar UI sin `ui-specialist`, o UI con referencia Figma sin el MCP de Figma.

---

## Handoffs del ciclo

Posicion: **implementacion** - un WI es autocontenido (no proviene de `work-define`).

| | |
|--|--|
| **Entrada** | `WI-XXX` en `Estado: Ready` (Requerimiento, Criterios de aceptacion, Dependencias, Referencias y Plan). Stubs en `Draft` **no** habilitan la implementacion. |
| **Salida** | Codigo commiteado; `progress.md` con el WI en `Done`; working tree limpio. |
| **Siguiente paso** | `git-commit` => `pr-create` (opcional) => `work-integrate`. Nota: `work-integrate` ejecutara `code-review` y exigira veredicto Apto antes de integrar. |
| **Regreso desde plan** | Ambiguedad tecnica, criterios faltantes o alcance incorrecto => volver a `work-plan` para ajustar el WI. |
