# Tipo de implementacion: Tarea de historia de usuario

Flujo para **ejecutar en codigo** las tareas tecnicas `TK-XXX` de una historia de usuario `US-XXX` bajo `docs/specs/user-stories/`. Esta referencia se carga desde `SKILL.md` cuando la seleccion de tipo resuelve a este caso. Asume ya resueltos el mecanismo de preguntas, el idioma, la validacion de repositorio y el ritmo de confirmacion (ver `SKILL.md`).

> **Unidad de confirmacion:** **una `TK-XXX` por turno.** Al terminar cada TK, detenerse y preguntar si continuar con la siguiente, aunque el usuario haya aprobado la cola completa. **Excepcion:** si el alcance tiene varias TK y el usuario pide ejecutar **sin confirmacion**, se activa el **modo de ejecucion paralela** del `SKILL.md` (analisis de dependencias, subagentes con worktree — max 3 — y merge secuencial), que omite estas pausas.

---

## Ubicacion de archivos

| Artefacto | Ruta |
| --------- | ---- |
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Tareas | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[nombre].md` |
| Progreso | `docs/specs/user-stories/US-XXX-[nombre-corto]/progress.md` |
| Glosario | `docs/specs/glossary.md` |

**Rama de trabajo:** `feature/US-XXX-[nombre-corto]` (el segmento tras `feature/` coincide con la carpeta de la US).

---

## Informacion requerida antes de implementar

| Dato | Como obtenerlo | Si no esta disponible |
| ---- | -------------- | --------------------- |
| **US padre** | Indicada por el usuario o inferida de la ruta | Preguntar a que `US-XXX` pertenece; no implementar hasta tenerla |
| **Alcance** | Del mensaje: toda la US, una lista de TK, o un TK concreto | Preguntar si hay ambiguedad |
| **Repositorio** | Campo `Repositorio` de cada TK (nombre del repositorio git al que afecta) | Leer del archivo; para `Ready` es obligatorio |
| **Rama de la US** | `feature/US-XXX-[nombre-corto]` | Crear con `git checkout -b ...` desde la rama base acordada |
| **Usuario asignado** | Campo `Asignado a` del TK; si no: `git config user.name` | Aplicar como filtro salvo instruccion explicita |

> Si el usuario indica una lista concreta de TK, un implementador distinto o pide implementar sin filtro, esa instruccion explicita prevalece sobre los filtros automaticos.

---

## Validacion especifica

Ademas de la validacion de repositorio transversal (`SKILL.md`):

- **US padre con README.md:** la carpeta de la US existe y tiene `README.md` con metadato `Estado: Ready`.
- **TK en estado Ready:** solo encolar tareas con `Estado: Ready`. Las `Draft` o `Done` en `progress.md` no son ejecutables por defecto.
- **Test cases presentes:** verificar si existe la carpeta `docs/specs/user-stories/US-XXX-[nombre-corto]/test-cases/` con al menos un archivo `TC-XXX-*.md`. Si no existe o esta vacia, **preguntar al usuario** (herramienta estructurada) antes de continuar:

  > "Esta US no tiene test cases definidos para la implementacion. ¿Como quieres continuar?"
  > Opciones: [Definir test cases primero] / [Si, continuar sin test cases] / [No, detener aqui]

  - Si elige **definir test cases con `test-define`**: hacer handoff al skill `test-define` para la US actual; al completarse, retomar esta verificacion y continuar la implementacion.
  - Si elige **continuar sin test cases**: continuar normalmente.
  - Si elige **detener**: parar y sugerir ejecutar `test-define` primero.

- **README de test cases:** si la carpeta `test-cases/` existe, **leer su `README.md`** (`docs/specs/user-stories/US-XXX-[nombre-corto]/test-cases/README.md`) para identificar que `TC-XXX` describen y cuales son **automatizables** (unit, integracion, e2e). Esta lectura alimenta el ciclo TDD del Paso 3 y las notas de cobertura en `progress.md`. Si el `README.md` no existe pero hay archivos `TC-XXX-*.md`, leer los propios test cases como fuente.

---

## Flujo de implementacion

### Paso 1 - Preparar repositorio y rama

1. Verificar working tree limpio; si no, parar y avisar.
2. Resolver nombre de rama: `feature/US-XXX-[nombre-corto]`.
3. `git checkout feature/US-XXX-[nombre-corto]` si existe; si no, `git checkout -b feature/US-XXX-[nombre-corto]` desde la rama base acordada (no asumir `main`/`develop`).
4. Leer o crear `progress.md` (desde `assets/progress-template.md`). Al crearlo, anadir **una entrada por cada TK del alcance** con `Estado: Pending` salvo las ya `Done`.

### Paso 2 - Filtrar y presentar cola

1. Leer `README.md` de la US y todos los `TK-*.md` del alcance indicado.
2. Construir dos listas:
   - **Implementables:** TK `Ready` que pasen los filtros de repositorio y usuario asignado, no marcadas como `Done` en `progress.md`.
   - **Excluidas:** el resto, con su estado entre parentesis - p. ej. `TK-002 - Ajuste de permisos (Draft)`.
3. Mostrar ambas listas en orden numerico. **No ejecutar codigo en este turno.**
4. Preguntar si continuar y **esperar confirmacion** antes de implementar.

### Paso 3 - Implementar tarea a tarea

> IMPORTANTE **Regla de oro - una TK por turno.** Al terminar cada TK, detenerse y preguntar si continuar. Esta regla no tiene excepciones, aunque el usuario haya aprobado la cola completa en el Paso 2.

Por cada tarea aprobada, en orden numerico salvo dependencias obvias en el texto:

1. Aplicar el ciclo **TDD (Red → Green → Refactor)** por cada unidad de comportamiento de la TK:
   - **Red:** escribir el test que describe el comportamiento esperado, basandose en los insumos de comportamiento de la US: los criterios de aceptacion (`AC-XXX`) del `README.md` y —cuando existan— las reglas de negocio (`BR-XX`) o los casos de prueba (`TC-XXX`) disponibles. Cuando la US tenga test cases, tomar del `test-cases/README.md` los `TC-XXX` automatizables que apliquen a la TK y crear su prueba correspondiente. El test debe fallar antes de escribir codigo de produccion.
   - **Green:** escribir el minimo codigo de produccion para que el test pase.
   - **Refactor:** limpiar codigo de produccion y test sin romper los tests. Aplicar principios de Clean Architecture (ver `SKILL.md`).
2. Si genera o modifica UI: ejecutar bajo `ui-specialist`. Si la referencia de diseno es Figma: usar el MCP de Figma.
3. Al terminar todos los comportamientos de la TK, ejecutar lint/typecheck/build y las **pruebas unitarias** del paquete/archivos afectados — nunca la bateria completa del repo. Correr **integracion solo si la TK cruza esa frontera** (BD, modulos, servicio externo, wiring) y **diferir e2e al cierre** (Paso 4). Ver [Uso escalonado de pruebas](../SKILL.md) en `SKILL.md`. Si algo falla, corregir antes de continuar.
4. Actualizar el artefacto y el progreso:
   - **Al iniciar la TK:** cambiar su estado en `progress.md` a `In Progress` y **poblar la lista de to-dos del agente**: la **primera entrada es el titulo de la TK** (`TK-XXX` + titulo), para tener siempre presente el artefacto en ejecucion, seguida de **las tareas del `Plan de implementacion` del `TK-XXX.md`** (una entrada por tarea `IT-XX`, en el orden del plan). Cada entrada de tarea muestra solo la descripcion corta (`IT-XX` + linea corta), no el detalle completo.
   - **Por cada subtarea completada:** marcar `[ ]` => `[x]` en la seccion de subtareas del `TK-XXX.md` correspondiente y marcar su entrada en la lista de to-dos del agente como `completed`.
   - **Al cerrar la TK:** cambiar su estado en `progress.md` a `Done`, con todas las subtareas de su plan ya `completed` en la lista de to-dos del agente; marcar tambien la **primera entrada (titulo de la TK) como `completed`** una vez que todas las tareas del plan hayan finalizado; registrar `Decisiones adicionales` si hubo decisiones nuevas en la sesion. Si la US tenia test cases, completar el campo `Cobertura de test cases` de la TK solo con observaciones puntuales: **cuales `TC-XXX` no se pudieron crear** (con motivo) o **para cuales se decidio otro tipo de prueba** distinto al del test case. Si todos se automatizaron como se esperaba, dejar el campo sin comentarios.
5. **Detenerse y preguntar** (herramienta estructurada), **sin commitear todavia los cambios de la TK**: "TK-XXX completada. Continuo con TK-YYY - [titulo]?" Opciones: [Si, continuar] / [No, detener aqui]. Esta pausa, con el working tree aun sin commitear, es la ventana para que el usuario revise el resultado, aplique correcciones manuales o le indique ajustes al agente antes de que el cambio quede commiteado.
6. Solo si el usuario confirma: **invocar `/git-commit`** sobre los cambios de TK-XXX, delegando en ese skill la agrupacion, el mensaje, el staging y la deteccion de secretos — este skill no decide un mensaje ni stagea por cuenta propia. `git-commit` puede a su vez mostrar su propia propuesta y pedir confirmacion antes de comitear: es una confirmacion distinta a la del paso anterior (esa es sobre continuar a la siguiente TK; esta es sobre el commit en si) y no la sustituye. Recien despues, pasar a la siguiente TK. Si detiene, registrar nota y pasar al Paso 4 — la invocacion a `/git-commit` para esta TK se hace ahi, en el cierre.

### Paso 4 - Cierre

1. Si la ultima TK completada quedo sin commitear (el usuario detuvo el flujo en el Paso 3 antes de confirmar la siguiente), **invocar `/git-commit` sobre sus cambios ahora**. Cuando no queden tareas pendientes (o el usuario detenga), verificar que las pruebas **de los archivos afectados** pasen limpias (unitarias y las de integracion que apliquen) y, **una sola vez sobre el codigo consolidado, correr las pruebas e2e** del alcance si el repo las tiene (ver [Uso escalonado de pruebas](../SKILL.md) en `SKILL.md`); el working tree limpio y con todos los commits hechos. **La bateria completa de pruebas no se corre aqui:** la ejecuta `code-review` al integrar (`work-integrate`) o crear el PR (`pr-create`).
2. **Handoff:** si todo el alcance esta en `Done`, **preguntar al usuario** (herramienta estructurada) como continuar:

   > "Implementacion completada. ¿Que quieres hacer ahora?"
   > Opciones: [Integrar el trabajo] / [Crear un PR] / [Terminar aqui]

   - **Integrar el trabajo** => **invocar `/work-integrate`** (no hacer el merge a la rama base directamente).
   - **Crear un PR** => **invocar `/pr-create`** (no crear el PR directamente).
   - **Terminar aqui** => cerrar sin handoff; el trabajo queda commiteado en la rama.

   Si quedan TK pendientes, indicar que falta cerrar antes de ofrecer estas opciones.

---

## Flujo: TK indicada sin US explicita

Un `TK-XXX` siempre vive bajo la carpeta de una US. Si el usuario indica solo el numero de tarea:

1. **Preguntar** a que `US-XXX` pertenece antes de continuar.
2. **Validar** que `TK-XXX-[nombre].md` existe dentro de `docs/specs/user-stories/US-XXX-[nombre-corto]/`.
3. Si no pertenece o no se encuentra, **parar** e informar:

```
WARNING No es posible continuar con la implementacion:
- TK-XXX no pertenece a US-XXX o no se encontro en su carpeta.
- Verificar el numero de tarea y la historia indicada antes de continuar.
```

4. **No** implementar hasta confirmar la relacion TK => US.

---

## Checklist

**Repositorio:** working tree limpio; rama `feature/US-XXX-[nombre-corto]` activa o creada; `progress.md` leido o creado.

**Cola:** `README.md` y todos los `TK-*.md` del alcance leidos; listas presentadas; confirmacion recibida antes del primer cambio de codigo.

**Por cada tarea:** TK `Ready`; no `Done` en `progress.md`; ciclo TDD (Red→Green→Refactor) por cada comportamiento; test cases automatizables del `test-cases/README.md` cubiertos; UI bajo `ui-specialist`; Figma via MCP; lint/typecheck/build/tests ejecutados y en verde; `progress.md` a `Done` con `Cobertura de test cases` (TC no automatizados o con otro tipo de prueba documentados); decisiones de sesion registradas; **confirmacion explicita antes de la siguiente TK**; `/git-commit` invocado recien al confirmar el avance (no antes) — o en el cierre, si el usuario detiene ahi.

**Cierre:** pruebas unitarias (e integracion aplicable) de los archivos afectados en verde y e2e del alcance corridas una vez sobre el codigo consolidado (la bateria completa la corre `code-review`, no este skill); working tree limpio; handoff a `pr-create` o `work-integrate`.

---

## Ejemplos

**Ejemplo 1 - US completa con filtro de repositorio**
- *Entrada:* "Implementa lo Ready de la US-042; estoy en el paquete `@acme/web-app`."
- *Salida:* checkout a `feature/US-042-*`; cola de Ready y excluidas; tras confirmacion, implementa **solo la primera TK Ready**, lint/build, actualiza `progress.md`, y **pausa para preguntar si continuar**.

**Ejemplo 2 - TK sin US**
- *Entrada:* "Implementa TK-003."
- *Comportamiento:* Preguntar a que US pertenece; validar el archivo; continuar o parar con error.

**Ejemplo 3 - TK en Draft**
- *Entrada:* "Ejecuta TK-005 de la US-042" y TK-005 esta en Draft.
- *Salida:* `TK-005 (Draft)` en excluidas; no se implementa hasta que este Ready.

**Ejemplo 4 - "implementar todo de corrido"**
- *Entrada:* "Implementa todas las tareas Ready de la US-042 de una vez, sin preguntar."
- *Comportamiento:* varias TK + peticion explicita de no confirmar => **modo de ejecucion paralela** (ver `SKILL.md`). Primero el analisis de dependencias (Paso 0): ordenar por olas y, si alguna TK depende de trabajo fuera del alcance, avisar para excluirla o detener. Tras confirmar el plan una vez, ejecutar las TK independientes en subagentes con worktree (max 3 en paralelo) e integrarlas por merge secuencial a `feature/US-042-*`. Si el alcance fuera una sola TK o no se pidiera "sin preguntar", se mantiene el flujo estandar con una TK por confirmacion.

---

## Anti-patterns (especificos del tipo)

- Arrancar la siguiente TK sin confirmacion explicita (aunque la cola este aprobada), salvo cuando el usuario haya pedido el **modo de ejecucion paralela**.
- Comitear los cambios de una TK inmediatamente al terminarla, antes de la pausa de confirmacion; el commit se hace al confirmar el avance a la siguiente TK (o en el cierre, si el usuario detiene ahi).
- Omitir el mensaje de cola e ir directo al codigo.
- Tratar tareas en Draft como ejecutables.
- Escribir codigo de produccion antes del test (romper el ciclo Red→Green→Refactor).
- Ignorar `progress.md` o usar identificadores distintos a `TK-XXX`.
- Implementar UI sin `ui-specialist`, o UI con referencia Figma sin el MCP de Figma.

---

## Handoffs del ciclo

Posicion: **implementacion** - entre `work-plan` e `work-integrate`.

| | |
|--|--|
| **Entrada** | US `Ready`; TK del alcance `Ready`; rama `feature/US-XXX-*` activa o creada desde la rama base. |
| **Salida** | Codigo commiteado; `progress.md` con cada TK del alcance en `Done`; working tree limpio. |
| **Siguiente paso** | Cada TK ya comiteada via `/git-commit` durante la implementacion => `pr-create` (opcional) => `work-integrate`. Nota: `work-integrate` ejecutara `code-review` y exigira veredicto Aprobado antes de integrar. |
| **Regreso desde plan** | TK en Draft o conflicto tecnico => volver a `work-plan`. |
