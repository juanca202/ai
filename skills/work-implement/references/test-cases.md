# Tipo de implementacion: Automatizacion de casos de prueba

Flujo para **ejecutar en codigo** los casos de prueba ya documentados por `test-define`. Cubre **dos puntos de entrada**:

- **`TC-XXX`** — el usuario indica uno o varios casos de prueba concretos; se automatizan esos TC.
- **`FT-XXX`** — el usuario indica un feature (funcionalidad ya implementada, `docs/specs/features/`); se automatizan **todos los `TC-XXX` asociados a los `AC-XXX` que contiene**.

Esta referencia se carga desde `SKILL.md` cuando la seleccion de tipo resuelve a cualquiera de esos dos casos. Asume ya resueltos el mecanismo de preguntas, el idioma, la validacion de repositorio y el ritmo de confirmacion (ver `SKILL.md`).

> **Un `FT-XXX` NO es un plan de implementacion.** Es el **registro de funcionalidad que ya existe en el codigo**: describe lo que el sistema hace hoy, no algo por construir. No tiene plan de implementacion, ni subtareas `IT-XX`, ni nada que "desarrollar". Lo unico que este skill produce a partir de el son **las pruebas que cubren sus `TC-XXX`**. Si alguien espera funcionalidad nueva de un `FT-XXX`, el artefacto esta mal entendido o mal clasificado: **parar y avisar** — la funcionalidad nueva se especifica como `US-XXX` (via `work-define`/`work-plan`) o como `WI-XXX`, nunca como feature.
>
> **Naturaleza del trabajo:** el entregable son **pruebas automatizadas**, no funcionalidad nueva. El `TC-XXX` es la especificacion de la prueba (precondiciones, datos, pasos, resultado esperado) y se traduce 1:1 a codigo de prueba. El comportamiento bajo prueba **ya esta implementado** — por eso el ciclo no arranca en rojo por diseno (ver *Prueba en rojo* en el Paso 3).
>
> **El codigo de produccion solo se toca de forma correctiva.** No se escribe funcionalidad nueva, no se anaden capacidades, no se "completa" lo que el feature describe. La unica modificacion admisible de codigo de produccion es la **correccion puntual** que hace falta para que una prueba ya escrita —y fiel a su `TC-XXX`— refleje el comportamiento correcto, cuando la discrepancia resulta ser un defecto real del codigo. Y aun asi: **nunca por iniciativa propia**, siempre con la evidencia sobre la mesa y la decision explicita del usuario (ver Paso 3.4), registrada en `Decisiones adicionales` del `progress.md`. Si la correccion deja de ser puntual y se convierte en desarrollo, **parar** y escalar a `work-plan` como `WI-XXX` de tipo bug.
>
> **Unidad de confirmacion:**
> - Entrada `FT-XXX` => **el `FT-XXX` completo** (todos sus TC automatizables). Se implementa el feature entero como una unidad; al terminarlo se actualiza `progress.md` y se pide confirmacion antes de pasar al siguiente FT (si el alcance incluye varios).
> - Entrada `TC-XXX` => **un `TC-XXX` por turno.** Al terminar cada TC, detenerse y preguntar si continuar con el siguiente.
>
> **Excepcion:** si el alcance tiene varias unidades y el usuario pide ejecutar **sin confirmacion**, se activa el **modo de ejecucion paralela** del `SKILL.md` (analisis de dependencias, subagentes con worktree — max 3 — y merge secuencial), que omite estas pausas.
>
> **Subagente:** si el proyecto define el subagente **`quality-specialist`**, ejecutar la escritura de las pruebas bajo ese subagente (es el autor de pruebas del harness). Si no existe, escribir las pruebas directamente.

---

## Ubicacion de archivos

El `TC-XXX` siempre vive en la carpeta `test-cases/` de un **artefacto padre**. La ubicacion depende de cual sea:

| Artefacto padre | Especificacion | Test cases | Progreso |
| --------------- | -------------- | ---------- | -------- |
| **Feature** | `docs/specs/features/FT-XXX-[slug]/README.md` | `docs/specs/features/FT-XXX-[slug]/test-cases/` | `docs/specs/features/FT-XXX-[slug]/progress.md` |
| **Historia de usuario** | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` | `.../test-cases/` | `.../progress.md` |
| **Tarea de mantenimiento** | `docs/specs/work-items/WI-XXX-[kebab-case]/README.md` | `.../test-cases/` | `.../progress.md` |

| Otros artefactos | Ruta |
| ---------------- | ---- |
| Indice de test cases | `[carpeta del padre]/test-cases/README.md` |
| Reporte de trazabilidad | `[carpeta del padre]/trace-report.md` (lo produce `trace-validate`, no este skill) |
| ADR | `docs/adr/` |
| Glosario | `docs/specs/glossary.md` |

**Rama de trabajo:** `test/[ID del artefacto padre]-[slug]` — p. ej. `test/FT-003-carga-masiva`, `test/US-042-login`, `test/WI-018-migracion-logs`. **Una rama por artefacto padre**, aunque se automaticen varios TC de el. No asumir la rama base; acordarla con el usuario.

> Cuando el repo esta vinculado a un tracker externo, el numero del TC es el ID del work item; sin tracker es un secuencial local. Respetar el numero tal cual aparece en el archivo.

---

## Informacion requerida antes de implementar

| Dato | Como obtenerlo | Si no esta disponible |
| ---- | -------------- | --------------------- |
| **Punto de entrada** | Del mensaje: `FT-XXX` (feature completo) o lista de `TC-XXX` | Preguntar si hay ambiguedad; no asumir |
| **Artefacto padre** | Para `FT-XXX` es el propio feature; para un `TC-XXX` suelto, la carpeta que lo contiene | Preguntar a que artefacto pertenece (ver *Flujo: TC indicado sin artefacto padre*) |
| **Alcance** | Todos los TC del padre, los TC de un `AC-XXX` concreto, o una lista explicita | Por defecto: todos los TC `Ready` y automatizables del padre |
| **Repositorio** | Campo `Repositorio` del artefacto padre, si lo tiene | Leer del archivo; si no existe, preguntar |
| **Rama** | `test/[ID del padre]-[slug]` | Crear desde la rama base acordada |
| **Stack de pruebas** | Descubrimiento del repo: manifest, configs del runner, tests vecinos, `.agents/MEMORY.md` | No inventar runner, helpers ni imports; adaptarse al stack real |

---

## Validacion especifica

Ademas de la validacion de repositorio transversal (`SKILL.md`):

- **Artefacto padre existente y en `Ready`:** su `README.md` tiene `Estado: Ready`. Un `FT-XXX` en `Draft` **no** es ejecutable — devolver al flujo «Analizar legado» de `work-research` (o a quien lo registro) para completarlo.
- **El `FT-XXX` no se lee como plan:** de su `README.md` solo interesan los **`AC-XXX`** y su linea `Casos de prueba:`. Si el feature contuviera algo con aspecto de plan de implementacion, subtareas o trabajo pendiente, **ignorarlo y avisar al usuario**: ese contenido no pertenece a un feature y no se ejecuta desde aqui.
- **Criterios de aceptacion presentes:** el padre tiene `AC-XXX` verificables. Sin ellos no hay nada que automatizar; parar.
- **Carpeta `test-cases/` con contenido:** debe existir con al menos un `TC-XXX-*.md`. Si no existe o esta vacia, **preguntar al usuario** (herramienta estructurada) antes de continuar:

  > "Este artefacto no tiene test cases definidos. ¿Como quieres continuar?"
  > Opciones: [Definir test cases primero] / [No, detener aqui]

  - **Definir test cases primero** => handoff a `test-define` sobre el artefacto padre; al completarse, retomar esta verificacion.
  - **Detener** => parar y sugerir ejecutar `test-define` primero.

  A diferencia de los tipos `TK`/`WI`, aqui **no existe la opcion «continuar sin test cases»**: sin TC no hay unidad que implementar.

- **Indice de test cases:** leer `test-cases/README.md` (columnas `TC · Perspectiva · Tipo de prueba · Prioridad · Criterio de aceptacion`). Es la fuente para construir el alcance. Si el indice no existe pero hay archivos `TC-XXX-*.md`, leer los propios test cases.
- **Estado de cada TC:** solo se automatizan los TC en `Estado: Ready`. Los `Draft` se excluyen (devolver a `test-define`); los `Obsolete` se excluyen sin mas.
- **`Tipo de prueba` del TC:** un TC con `Tipo de prueba: Manual` **no es automatizable por diseno** — se excluye del alcance y se registra en `Cobertura de test cases` del `progress.md`. Para el resto, el campo (`Unit`, `Integration`, `API Test`, `Visual Test`, `E2E`, o una combinacion) determina **que nivel de prueba escribir**.
- **AC sin TC:** si algun `AC-XXX` del padre no tiene ningun `TC-XXX` que lo cubra, **avisar al usuario** antes de continuar y ofrecer handoff a `test-define` para completar la cobertura, o continuar dejando constancia del hueco en `progress.md`. Este skill **no inventa** casos de prueba que `test-define` no documento.

---

## Flujo de implementacion

### Paso 1 - Preparar repositorio y rama

1. Verificar working tree limpio; si no, parar y avisar.
2. Resolver nombre de rama: `test/[ID del artefacto padre]-[slug]`. `git checkout` si existe; si no, `git checkout -b` desde la rama base acordada (no asumir `main`/`develop`).
3. Leer o crear `progress.md` en la carpeta del artefacto padre (desde `assets/progress-template.md`). Al crearlo, anadir **una entrada por unidad**: una sola entrada `FT-XXX` si la entrada es un feature, o una entrada por cada `TC-XXX` del alcance si la entrada son test cases sueltos.
4. **Descubrir el stack de pruebas** del repositorio antes de escribir nada: runner y scripts de test del manifest, configs, convenciones de los tests vecinos y reglas de testing en `.agents/MEMORY.md`. No inventar infraestructura que el repo no tenga.

### Paso 2 - Presentar alcance

1. Leer **completo** el `README.md` del artefacto padre (criterios de aceptacion con su linea `Casos de prueba:`) y cada `TC-XXX-*.md` del alcance.
2. Construir la **matriz de alcance** y mostrarla:

   | AC | TC | Tipo de prueba | Estado | ¿Automatizable? |
   |----|----|----------------|--------|-----------------|
   | AC-001 | TC-001 | Unit | Ready | Si |
   | AC-001 | TC-002 | Manual | Ready | No — manual por diseno |
   | AC-002 | — | — | — | Sin TC: hueco de cobertura |

3. Construir dos listas explicitas:
   - **Automatizables:** TC `Ready` con `Tipo de prueba` distinto de `Manual`, no marcados como `Done` en `progress.md`.
   - **Excluidos:** el resto, con su motivo entre parentesis — p. ej. `TC-007 (Manual)`, `TC-009 (Draft)`, `TC-011 (Obsolete)`, `TC-004 (ya Done)`.
4. **No ejecutar codigo en este turno.** Preguntar si continuar y **esperar confirmacion**.

### Paso 3 - Implementar la unidad

> IMPORTANTE **Una unidad por turno.** Con entrada `FT-XXX`, la unidad es el feature completo; con entrada `TC-XXX`, la unidad es cada TC. Al terminar la unidad, detenerse y preguntar antes de la siguiente.

Por cada `TC-XXX` automatizable de la unidad, en el orden del indice:

1. **Leer el TC completo:** Perspectiva, Tipo de prueba, Criterio de aceptacion, Precondiciones, Datos de prueba, Pasos de ejecucion, Resultado esperado final y Observaciones.
2. **Elegir el nivel de prueba** segun el campo `Tipo de prueba`. Si se decide escribir un nivel distinto al que sugiere el TC (p. ej. cubrir con integracion un TC pensado como unit), **registrarlo en `Cobertura de test cases`** del `progress.md` — no editar el TC.
3. **Escribir la prueba como traduccion fiel del TC**, alineada a las convenciones de los tests vecinos:
   - `Precondiciones` + `Datos de prueba` => *arrange* (fixtures, factories, mocks del stack real).
   - `Pasos de ejecucion` => *act*.
   - `Resultado esperado del paso` y `Resultado esperado final` => *assert* sobre **comportamiento observable**, nunca sobre detalle de implementacion interna.
   - **Trazabilidad obligatoria:** el nombre del bloque o del caso incluye el ID del TC (p. ej. `TC-004: should reject login when password is invalid`), o la anotacion/tag equivalente del framework. Sin ese identificador la prueba no es trazable al TC.
   - Un `TC-XXX` => al menos una prueba; si el TC lista varios tipos (`Unit, E2E`), escribir una prueba por nivel.
4. **Ejecutar la prueba.**
   - **Verde a la primera** => la prueba confirma el comportamiento documentado. Continuar con el siguiente TC. Esto es lo **esperado**, no una senal de error: el comportamiento ya estaba implementado.
   - **Rojo** => hay una discrepancia real entre el TC y el codigo. **Antes de tocar nada**, revisar si la prueba es fiel al TC; si lo es, **parar y preguntar al usuario** (herramienta estructurada) con la evidencia (que se esperaba, que ocurrio):

     > "TC-XXX falla contra la implementacion actual. [evidencia]. ¿Que corrijo?"
     > Opciones: [Corregir el codigo de produccion] / [Corregir la prueba] / [El TC esta mal: parar] / [Registrar como hallazgo y continuar]

     - **Corregir el codigo de produccion** => la prueba en rojo *es* el paso Red: corregir con el **minimo codigo necesario** para que el comportamiento coincida con el TC (Green), refactorizar respetando Clean Architecture y la documentacion de codigo que exija el ADR vigente, y registrar la correccion en `Decisiones adicionales` y `Notas` del `progress.md`. Todo dentro de la misma unidad. **Es una correccion, no un desarrollo:** si arreglarlo implica funcionalidad nueva, cambios de diseno o tocar mas alla del defecto puntual, **parar** y escalar a `work-plan` como `WI-XXX` de tipo bug en vez de seguir aqui.
     - **Corregir la prueba** => solo cuando el fallo es de la prueba (fixture mal montado, selector, dato de entorno). **Nunca relajar la asercion** para que pase.
     - **El TC esta mal** => handoff a `test-define` para corregir la especificacion; este skill **no edita el TC**. La unidad queda con ese TC pendiente y el motivo en `progress.md`.
     - **Registrar como hallazgo y continuar** => dejar el TC sin cubrir, anotarlo en `Cobertura de test cases` con la evidencia, y seguir con el resto. La unidad no se cierra como `Done` si quedan pruebas en rojo en el arbol: la prueba fallida se retira o se marca como pendiente segun la convencion del repo (`skip`/`todo`), dejando constancia.
5. Al terminar todos los TC de la unidad, ejecutar lint/typecheck/build y las **pruebas unitarias** del paquete/archivos afectados — nunca la bateria completa del repo. Correr **integracion solo si la unidad la produjo** y **diferir e2e al cierre** (Paso 4). Ver [Uso escalonado de pruebas](../SKILL.md#uso-escalonado-de-pruebas-optimizacion) en `SKILL.md`.
6. Actualizar el artefacto y el progreso:
   - **Al iniciar la unidad:** cambiar su estado en `progress.md` a `In Progress` y **poblar la lista de to-dos del agente**: la **primera entrada es el titulo de la unidad** (`FT-XXX` o `TC-XXX` + su titulo), seguida de **una entrada por cada `TC-XXX` automatizable**, en el orden del indice. Cada entrada muestra solo `TC-XXX` + su titulo corto, no el detalle del caso.
   - **Al iniciar cada TC:** marcar su entrada de to-do como `in_progress`. Solo un TC en curso a la vez.
   - **Por cada TC cubierto:** marcar su entrada de to-do como `completed`.
   - **Al cerrar la unidad:** estado `Done` en `progress.md`, con todos los TC `completed` y la primera entrada tambien `completed`; registrar `Decisiones adicionales` si hubo decisiones nuevas en la sesion. Completar `Cobertura de test cases` **solo con observaciones puntuales**: TC no automatizados (con motivo: `Manual`, `Draft`, TC erroneo, hallazgo abierto), TC cubiertos con un nivel de prueba distinto al del campo `Tipo de prueba`, y AC sin TC. Si todo se automatizo como se esperaba, dejar el campo sin comentarios.

   > **No se marcan checkboxes:** un `TC-XXX` no tiene subtareas. La *excepcion de checkboxes* del `SKILL.md` no aplica a este tipo; el `TC-XXX-*.md`, el indice `test-cases/README.md` y el `README.md` del padre **no se modifican** desde aqui.

7. **Detenerse y preguntar** (herramienta estructurada), **sin commitear todavia**: "FT-XXX completado. Continuo con FT-YYY - [titulo]?" (o el TC siguiente). Opciones: [Si, continuar] / [No, detener aqui]. Aunque el alcance sea una sola unidad, confirmar antes del cierre. Esta pausa, con el working tree sin commitear, es la ventana para que el usuario revise las pruebas escritas antes de que queden commiteadas.
8. Solo si confirma: **invocar `/git-commit`** sobre los cambios de la unidad, delegando en ese skill la agrupacion, el mensaje, el staging y la deteccion de secretos. Recien despues, pasar a la siguiente unidad. Si detiene, registrar nota y pasar al Paso 4 — la invocacion a `/git-commit` se hace ahi.

### Paso 4 - Cierre

1. Si la ultima unidad quedo sin commitear, **invocar `/git-commit` sobre sus cambios ahora**. Verificar que las pruebas **de los archivos afectados** pasen limpias (unitarias y las de integracion que apliquen) y, **una sola vez sobre el codigo consolidado, correr las pruebas e2e** escritas en esta ejecucion si el repo las soporta. **La bateria completa no se corre aqui:** la ejecuta `code-review` al integrar (`work-integrate`) o crear el PR (`pr-create`).
2. **Validar cobertura:** con las pruebas ya escritas, **ofrecer handoff a `/trace-validate`** sobre el artefacto padre para generar la matriz de trazabilidad `AC-XXX` => `TC-XXX` => artefacto de prueba y obtener el veredicto de cobertura. Es el cierre natural de este tipo de implementacion.
3. **Handoff:** preguntar al usuario (herramienta estructurada) como continuar:

   > "Automatizacion completada. ¿Que quieres hacer ahora?"
   > Opciones: [Validar cobertura] / [Integrar el trabajo] / [Crear un PR] / [Terminar aqui]

   - **Validar cobertura** => **invocar `/trace-validate`** sobre el artefacto padre.
   - **Integrar el trabajo** => **invocar `/work-integrate`** (no hacer el merge a la rama base directamente).
   - **Crear un PR** => **invocar `/pr-create`** (no crear el PR directamente).
   - **Terminar aqui** => cerrar sin handoff; el trabajo queda commiteado en la rama.

   Si quedan unidades pendientes, indicar que falta cerrar antes de ofrecer estas opciones.

---

## Flujo: TC indicado sin artefacto padre

Un `TC-XXX` siempre vive bajo la carpeta `test-cases/` de una US, un WI o un FT. Si el usuario indica solo el numero del caso:

1. **Buscar** el archivo `TC-XXX-*.md` en las carpetas `test-cases/` de `docs/specs/`. Si aparece en una sola, resolver el padre por la ruta y confirmarlo con el usuario.
2. Si aparece en **varias** (numeracion local repetida entre artefactos) o en **ninguna**, **preguntar** a que artefacto pertenece antes de continuar.
3. Si no se encuentra, **parar** e informar:

```
WARNING No es posible continuar con la implementacion:
- TC-XXX no se encontro en ninguna carpeta test-cases/ de docs/specs/.
- Verificar el numero del caso y el artefacto padre antes de continuar.
```

4. **No** automatizar hasta confirmar la relacion TC => artefacto padre: sin el padre no hay `AC-XXX` de referencia, ni rama, ni `progress.md`.

---

## Checklist

**Repositorio:** working tree limpio; rama `test/[ID del padre]-[slug]` activa o creada; `progress.md` leido o creado; stack de pruebas descubierto del repo real.

**Alcance:** `README.md` del padre e indice `test-cases/README.md` leidos; cada `TC-XXX-*.md` del alcance leido completo; matriz AC => TC presentada con automatizables y excluidos; confirmacion recibida antes de escribir la primera prueba.

**Por cada unidad:** padre `Ready` con `AC-XXX`; TC `Ready` y no `Manual`; prueba fiel al TC (precondiciones/datos => arrange, pasos => act, resultado esperado => assert) con el ID del TC en el nombre; nivel de prueba segun `Tipo de prueba` o desviacion registrada; pruebas en verde (o hallazgo acordado con el usuario y documentado); `quality-specialist` usado si el proyecto lo define; lint/typecheck/build en verde; `progress.md` a `Done` con `Cobertura de test cases`; especificacion (TC, indice, README del padre) **sin modificar**; **confirmacion explicita antes de la siguiente unidad**; `/git-commit` invocado recien al confirmar el avance.

**Cierre:** pruebas de los archivos afectados en verde y e2e corridas una vez sobre el codigo consolidado; working tree limpio; handoff ofrecido a `trace-validate`, `pr-create` o `work-integrate`.

---

## Ejemplos

**Ejemplo 1 - Feature completo**
- *Entrada:* "Implementa las pruebas del FT-003."
- *Salida:* checkout a `test/FT-003-[slug]`; lee el README del feature y su `test-cases/README.md`; presenta la matriz AC => TC con automatizables y excluidos; tras confirmacion escribe las pruebas de todos los TC `Ready` no manuales bajo `quality-specialist`; lint/build/tests en verde; `progress.md` a `Done` con la cobertura anotada; ofrece `trace-validate`.

**Ejemplo 2 - TC sueltos**
- *Entrada:* "Automatiza TC-004 y TC-007 de la US-042."
- *Comportamiento:* rama `test/US-042-[nombre-corto]`; una entrada por TC en `progress.md`; implementa TC-004, ejecuta, **pausa y pregunta** si continuar con TC-007.

**Ejemplo 3 - TC manual en el alcance**
- *Entrada:* "Implementa las pruebas del FT-005" y TC-012 tiene `Tipo de prueba: Manual`.
- *Comportamiento:* `TC-012 (Manual)` aparece en excluidos; no se automatiza; queda registrado en `Cobertura de test cases` del `progress.md` con el motivo.

**Ejemplo 4 - Prueba en rojo sobre codigo ya implementado**
- *Entrada:* "Implementa las pruebas del FT-002"; TC-006 falla contra la implementacion actual.
- *Comportamiento:* verificar que la prueba es fiel al TC; parar y presentar la evidencia al usuario con las opciones (corregir produccion / corregir la prueba / el TC esta mal / registrar hallazgo). Si el usuario elige corregir produccion, el rojo actua como paso Red y la correccion se hace dentro de la unidad, registrada en `Decisiones adicionales`.

**Ejemplo 5 - AC sin test cases**
- *Entrada:* "Implementa las pruebas del FT-007" y AC-004 no tiene ningun TC.
- *Comportamiento:* avisar del hueco antes de continuar y ofrecer handoff a `test-define`; nunca inventar el caso faltante desde este skill.

**Ejemplo 6 - Feature en Draft**
- *Entrada:* "Implementa las pruebas del FT-009" y el feature esta en `Draft`.
- *Salida:* `FT-009 (Draft)` en excluidos; no se implementa; devolver al flujo «Analizar legado» de `work-research` para completarlo a `Ready`.

---

## Anti-patterns (especificos del tipo)

- Tratar el `FT-XXX` como un plan de implementacion y construir funcionalidad a partir de el: el feature documenta codigo que **ya existe**; lo unico que se implementa son sus pruebas.
- Escribir codigo de produccion nuevo (funcionalidad, capacidades, "completar" lo que el feature describe) en vez de limitarse a la correccion puntual que exige una prueba en rojo ya acordada con el usuario.
- Convertir una correccion puntual en un desarrollo (rediseno, funcionalidad adicional) sin escalar a `work-plan` como `WI-XXX` de tipo bug.
- Inventar casos de prueba que `test-define` no documento, o ampliar el alcance de un TC mas alla de lo que su archivo describe.
- Modificar el `TC-XXX-*.md`, el indice `test-cases/README.md` o el `README.md` del artefacto padre desde este skill; la especificacion de prueba es de `test-define`.
- Automatizar un TC con `Tipo de prueba: Manual`, o uno en `Draft`/`Obsolete`.
- Relajar o vaciar una asercion para que una prueba en rojo pase.
- Corregir el codigo de produccion por iniciativa propia cuando una prueba falla, sin presentar la evidencia y sin la decision explicita del usuario.
- Escribir la prueba sin el ID del `TC-XXX` en su nombre o anotacion: rompe la trazabilidad que `trace-validate` necesita.
- Asertar sobre detalle de implementacion interna en vez de comportamiento observable.
- Inventar runner, helpers, factories o infraestructura de prueba que el repositorio no tiene.
- Interpretar el verde a la primera como error del proceso: el comportamiento **ya esta implementado**, ese es el resultado esperado.
- Automatizar TC de mas de un artefacto padre en la misma rama.
- Cerrar la unidad como `Done` con pruebas en rojo en el arbol, o con TC no cubiertos sin registrarlos en `Cobertura de test cases`.
- Escribir las pruebas en el hilo principal cuando el proyecto define `quality-specialist` y la delegacion via Task esta disponible.

---

## Handoffs del ciclo

Posicion: **implementacion de pruebas** - entre `test-define` y `trace-validate`.

| | |
|--|--|
| **Entrada** | Artefacto padre (`FT-XXX`, `US-XXX` o `WI-XXX`) en `Estado: Ready` con `AC-XXX`, y su carpeta `test-cases/` poblada por `test-define` con TC en `Ready`. |
| **Salida** | Pruebas automatizadas commiteadas y en verde; `progress.md` con cada unidad en `Done` y su `Cobertura de test cases`; working tree limpio. |
| **Siguiente paso** | `trace-validate` sobre el artefacto padre (matriz de cobertura y veredicto) => `pr-create` (opcional) => `work-integrate`. Nota: `work-integrate` ejecutara `code-review` y exigira veredicto Aprobado antes de integrar. |
| **Regreso a definicion** | TC ambiguo, erroneo o AC sin cobertura => volver a `test-define`. Si el hueco es del propio artefacto (criterio no testeable o mal definido), volver a quien lo registro: `work-define`/`work-plan` para US/WI, el flujo «Analizar legado» de `work-research` para un `FT-XXX`. |
| **Bug detectado** | Discrepancia real entre TC y codigo que el usuario no quiere corregir en el momento => flujo «Analizar issue» de `work-research` y, desde ahi, un `WI-XXX` de tipo bug via `work-plan`. |
