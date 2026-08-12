---
name: work-implement
description: >-
  Implementar en código trabajo ya especificado, de cuatro tipos: (1) tareas técnicas (TK-XXX) bajo una historia de usuario; (2) tareas de mantenimiento (WI-XXX) sin historia — bugs, refactor, deuda técnica, dependencias, operativas; (3) casos de prueba (TC-XXX) — automatizar las pruebas ya documentadas por test-define; (4) features (FT-XXX) — automatizar los TC de sus criterios. Selecciona el tipo según el artefacto referenciado. Solo implementa trabajo en Estado: Ready; acepta además un modo corrección acotado, delegado por quality-check, sobre cualquier artefacto de la rama (US-XXX, WI-XXX, FT-XXX, TC-XXX en rama test/, o un artefacto externo al plugin), para arreglar un check o una prueba en rojo. Activar siempre que el usuario pida "implementar", "desarrollar", "ejecutar tareas", "codificar", "automatizar las pruebas", "implementa los test cases", "trabaja en el TK/WI/TC/FT" o variantes que impliquen escribir código desde una especificación ya redactada.
license: MIT
---

# Skill: Implementar trabajo

Guia general para **ejecutar en codigo** trabajo ya especificado, de **distintos tipos**. Cada tipo de implementacion tiene su propio flujo (ubicaciones, validaciones, unidad de confirmacion, cierre) en `references/`. El cuerpo de este `SKILL.md` contiene solo lo **transversal** a todos los tipos; el detalle de cada tipo se carga unicamente cuando se necesita.

> **Alcance (cualquier tipo):** consume especificaciones ya redactadas por los skills de planificacion (`work-define`, `work-plan`). **No reescribe ni reestructura** la especificacion - solo la implementa. Correcciones menores acordadas con el usuario son la unica excepcion.
>
> **Solo implementacion:** no modifica documentacion de producto (README de US, `TK-XXX`, `WI-XXX`, `TC-XXX`, `FT-XXX`, ADRs, technical-docs) - solo el `progress.md`. **Excepcion de checkboxes:** marcar `[ ]` como `[x]` en las subtareas del artefacto en ejecucion **a medida que se completan** es la unica modificacion permitida en archivos de especificacion; no se toca ninguna otra seccion del artefacto. El archivo a editar depende del tipo: `TK-XXX.md` para tareas de historia de usuario, el `README.md` del WI para tareas de mantenimiento. **En los tipos de automatizacion de pruebas (`TC-XXX` / `FT-XXX`) no aplica**: los test cases no tienen subtareas y su especificacion no se toca en absoluto. Si se detecta un conflicto en la documentacion que pueda afectar el resultado, **parar inmediatamente y notificar al usuario** antes de continuar.
>
> **Ritmo obligatorio - una unidad por confirmacion (modo por defecto):** implementar una unidad, actualizar `progress.md` **y la lista de tareas (to-dos) del agente**, ejecutar lint/build, y **esperar confirmacion explicita del usuario antes de arrancar la siguiente**. La **unidad** depende del tipo (ver tabla de seleccion). **El commit de la unidad terminada no se hace al completarla:** queda pendiente durante la pausa de confirmacion, dejando una ventana para que el usuario revise el resultado, aplique correcciones manuales o le indique ajustes al agente antes de que el cambio quede commiteado. El commit se hace **al confirmar el avance**, como primer paso antes de arrancar la siguiente unidad (o, si el usuario detiene el flujo ahi, en el cierre — ver Paso 4 de cada referencia).
>
> **Unica excepcion - modo de ejecucion paralela:** si el alcance incluye **mas de una unidad** y el usuario pide **explicitamente ejecutar sin confirmacion entre unidades** (p. ej. "sin preguntar", "de corrido", "todas a la vez"), se activa el modo de ejecucion paralela (ver seccion *Ejecucion paralela con subagentes y worktrees*), que corre las unidades independientes en subagentes con worktree y omite las pausas intermedias. Si falta cualquiera de las dos condiciones, se mantiene el modo secuencial.
>
> **Alcance de las pruebas - solo archivos afectados:** este skill ejecuta las pruebas (y `lint`/`typecheck`/`build`) **unicamente sobre los archivos o el paquete afectados** por la unidad implementada — tanto por unidad (Paso 3) como en el cierre (Paso 4) y tras cada merge en modo paralelo. **Nunca corre la bateria completa de pruebas del repositorio.** Ejecutar **toda la bateria de pruebas** (regresion de todo el repo) es responsabilidad **exclusiva de `quality-check`**, que corre en `work-integrate` / `pr-create` antes de integrar o crear el PR; este skill no la sustituye ni la anticipa.

---

## Como preguntar al usuario

Cuando este skill (o cualquiera de sus referencias) indique **preguntar, pedir, confirmar o validar** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (la que renderiza opciones tappables o un selector) en lugar de redactar la pregunta como prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2-4 por pregunta) cuando la respuesta admita categorias.
- **No repreguntar** lo que ya esta respondido en el contexto de la sesion o en los documentos del repo.
- **Confirmaciones entre unidades:** una pregunta por turno con opciones claras (p. ej. Opciones: [Si, continuar] / [No, detener aqui]). No avanzar antes de la respuesta.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3...).

Cada vez que una referencia diga *preguntar al usuario*, *validar con el usuario* o *confirmar* asume este mecanismo; no se repite alli.

---

## Resolucion de idioma

El idioma de los mensajes al usuario y de las notas de `progress.md` se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesion existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** que idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

El idioma resuelto aplica a los mensajes al usuario y a las notas de `progress.md`. La salida y los mensajes de error de las herramientas (lint, build, tests) no se traducen; el codigo, los identificadores y los nombres de artefacto tampoco.

---

## Seleccion del tipo de implementacion

**Antes de cualquier otra cosa**, identificar que tipo de implementacion corresponde y cargar su flujo. No mezclar tipos en una misma ejecucion.

La senal que distingue los tipos es **el artefacto que el usuario referencia** (o, en el modo correccion, el que le pasa `quality-check`).

| Tipo | Como se identifica | Que se implementa | Unidad de confirmacion | Flujo a leer |
|------|--------------------|-------------------|------------------------|--------------|
| **Tarea de historia de usuario** | El trabajo referencia una historia `US-XXX` o una tarea `TK-XXX` que cuelga de ella; el artefacto vive bajo `docs/specs/user-stories/`. | El plan tecnico de la TK (codigo de produccion + sus tests) | **Una `TK-XXX`** | `references/user-story-tasks.md` — **leer antes de implementar.** |
| **Tarea de mantenimiento** | El trabajo referencia un `WI-XXX` (bug, refactor, deuda tecnica, dependencias, operativa) **sin historia asociada**; vive bajo `docs/specs/work-items/`. | El plan del WI (codigo de produccion + sus tests) | **El `WI-XXX` completo** | `references/work-items.md` — **leer antes de implementar.** |
| **Caso de prueba** | El trabajo referencia uno o varios `TC-XXX`; viven en la carpeta `test-cases/` de un artefacto padre (`US-XXX`, `WI-XXX` o `FT-XXX`). | **Las pruebas automatizadas de esos `TC-XXX`** | **Un `TC-XXX`** | `references/test-cases.md` — **leer antes de implementar.** |
| **Feature** | El trabajo referencia un `FT-XXX` — funcionalidad **ya implementada** registrada bajo `docs/specs/features/`. | **Las pruebas de todos los `TC-XXX` asociados a los `AC-XXX` que contiene el feature** — nunca funcionalidad nueva | **El `FT-XXX` completo** | `references/test-cases.md` — **leer antes de implementar.** |

> **Modo correccion (entrada delegada desde [`quality-check`](../quality-check/SKILL.md#corrección-de-fallos)).** Ademas de los cuatro tipos, este skill acepta una **correccion puntual delegada** por `quality-check` cuando un check falla en el cierre y el usuario autoriza el arreglo. No es un tipo nuevo: es un modo acotado sobre el **artefacto que ya se implemento en esta rama** — `US-XXX`, `WI-XXX`, una automatizacion de pruebas (`FT-XXX` / `TC-XXX` en rama `test/`), o un artefacto externo al plugin. Ver [Modo correccion](#modo-correccion-delegado-desde-quality-check).

Reglas de seleccion:

- **Identificar el artefacto -> leer su referencia -> seguir unicamente su flujo.**
- Si la referencia del usuario es ambigua (p. ej. un numero sin prefijo, o no esta claro si hay historia asociada), **preguntar al usuario** antes de continuar; no asumir el tipo ni inventar artefactos.
- Solo se implementa trabajo en **`Estado: Ready`** (la US/TK, el WI, el TC o el FT). Si esta en `Draft`, parar y devolver a la fase que lo produce (`work-plan` / `work-define` para US/TK/WI, `test-define` para un TC, el flujo «Analizar legado» de `work-research` para un FT).
- **Codigo de produccion vs. pruebas.** Los tipos `TK-XXX` y `WI-XXX` implementan funcionalidad nueva con sus tests. Los tipos `TC-XXX` y `FT-XXX` **entregan pruebas**: el comportamiento ya existe, asi que las pruebas confirman lo documentado.
- **Un `FT-XXX` no es un plan de implementacion.** Es el registro de funcionalidad **que ya existe en el codigo** — no tiene plan, ni subtareas, ni nada que desarrollar. De el solo salen **las pruebas que cubren sus `TC-XXX`**. En los tipos `TC-XXX` y `FT-XXX`, tocar codigo de produccion se admite **unicamente como correccion puntual** derivada de una prueba en rojo, con la evidencia presentada y la decision explicita del usuario; nunca para escribir funcionalidad nueva (ver `references/test-cases.md`). Si el usuario espera funcionalidad de un `FT-XXX`, **parar y avisar**: eso se especifica como `US-XXX` o `WI-XXX`.

---

## Validacion de repositorio (transversal)

Verificar estas condiciones antes de implementar, sea cual sea el tipo. Si alguna falla, **parar** - informar al usuario y resolver primero.

> **Excepcion — modo correccion.** En la correccion delegada desde `quality-check` (ver [Modo correccion](#modo-correccion-delegado-desde-quality-check)) **no aplican** ni «Working tree limpio» ni «Artefacto en `Ready`»: el cierre corre sobre la rama consolidada, con el artefacto ya implementado y posiblemente con cambios sin commitear. El resto de condiciones (rama del artefacto, solo trabajo de la rama actual) siguen vigentes.

- **No iniciar en la rama de otro trabajo (primera verificacion):** obtener la rama actual con `git branch --show-current`. Si ya tiene un prefijo de implementacion (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`) y **no** corresponde al artefacto que se va a implementar, **parar** e indicar al usuario que no se puede iniciar la implementacion desde la rama de otro trabajo; debe situarse en la rama base acordada (p. ej. `develop`/`main`) para que el skill cree o cambie a la rama del artefacto. **Excepcion - reanudar:** si la rama actual es precisamente la del artefacto pedido, continuar normalmente.
- **Working tree limpio:** `git status --porcelain` sin cambios pendientes no resueltos **al iniciar la sesion de implementacion** (o al reanudarla). No aplica durante la pausa de confirmacion entre unidades: los cambios de la unidad recien terminada quedan sin commitear ahi a proposito (ver *Ritmo obligatorio*), hasta que el usuario confirma avanzar.
- **Rama correcta:** estar en (o crear) la rama de trabajo del artefacto. No implementar en `main` ni en ramas de otro trabajo sin instruccion explicita. El nombre de rama lo define cada referencia segun el tipo.
- **Solo trabajo de la rama actual:** solo se implementan unidades (TK / WI / TC / FT) que pertenezcan al artefacto asociado a la rama de implementacion actual. No implementar tareas de otro artefacto o de otra rama: si la unidad pedida no corresponde a la rama actual, **parar** y cambiar a su rama correspondiente (o pedir al usuario que lo haga) antes de continuar; nunca mezclar trabajo de distintos artefactos en una misma rama.
- **Artefacto en `Ready`:** el artefacto a implementar existe y esta en `Estado: Ready` (lo verifica cada referencia con su regla propia).
- **Solapamiento de progreso:** leer `progress.md` si existe; respetar unidades ya en `Done`; si hay alguna `In Progress`, revisar notas y estado real antes de continuar.

Si hay conflicto:

```
WARNING No es posible continuar:
- <razon concreta>
```

---

## progress.md (transversal)

Cada tipo mantiene un `progress.md` como **unica bitacora** que este skill puede modificar (nunca la especificacion de producto). Estados validos por unidad: **`Pending`**, **`In Progress`**, **`Done`**. No usar `Skipped` ni otros valores.

- Crear desde `assets/progress-template.md` si no existe, adaptando el encabezado y las unidades al tipo (TK / WI / TC / FT) segun indique la referencia.
- Por cada unidad: `Pending` => `In Progress` => `Done`; anadir notas si quedan aspectos parciales.
- **Implementador:** registrar `{{usuario}} / {{agente}}`, donde el usuario se infiere de `git config user.name` y el agente es el que ejecuta la implementacion (p. ej. `juanca202 / Claude`, `juanca202 / Cursor`). Si el agente no puede identificarse, dejar solo el usuario.
- Registrar en `Decisiones adicionales` **toda decision tomada durante la sesion de chat** que no este ya documentada en la especificacion. Si no hubo decisiones nuevas, omitir la seccion.
- **Cobertura de test cases:** cuando el artefacto tiene test cases, el campo `Cobertura de test cases` de la unidad **no es un detalle exhaustivo de cada `TC-XXX`**: registrar solo observaciones puntuales -- **todo `TC-XXX` que no se pudo automatizar** (con el motivo) y **toda decision de crear un tipo de prueba distinto** al que sugiere el test case (p. ej. cubrir con integracion un TC pensado como unit). Si la implementacion fue como se esperaba (todos los `TC-XXX` se automatizaron tal cual), **no es necesario comentar nada** en el campo; si el artefacto no tiene test cases, omitirlo. En los tipos `TC-XXX` / `FT-XXX` este campo es **obligatorio** (los test cases son el objeto mismo de la unidad) y suma dos observaciones propias: **`AC-XXX` sin ningun TC que lo cubra** y **discrepancias entre el TC y el codigo** con la decision tomada.

| Situacion | Que hacer |
|-----------|-----------|
| Posponer una unidad | Mantener `Pending` y registrar el motivo en `Notas`. |
| Sacar una unidad del alcance | Parar; alinear con el skill de planificacion correspondiente; eliminar la entrada si ya no aplica. |
| Unidad completada | `Done`. |

---

## Lista de tareas del agente (transversal)

Durante la ejecucion, mantener la **herramienta de lista de tareas (to-dos) del agente** como reflejo vivo del **plan de implementacion en curso**: una entrada por cada tarea del plan. Da visibilidad del progreso en tiempo real y **no sustituye** al `progress.md`, que sigue siendo la bitacora persistente en el repositorio.

- **Al empezar a ejecutar un plan de implementacion:** poblar la lista de to-dos con, **como primera entrada, el titulo del artefacto en ejecucion** (`TK-XXX`/`WI-XXX` + su titulo) para tener siempre presente que se esta ejecutando, seguida de **una entrada por cada tarea del plan** (`IT-XX`), en el orden en que se van a abordar. **Cada entrada de tarea muestra unicamente la descripcion corta** (su `IT-XX` + la linea corta), nunca el detalle largo, las referencias a codigo ni el texto completo de la tarea.
- **Al iniciar cada tarea:** marcar su entrada como `in_progress`, en el mismo momento en que se marca `[ ]` => `[~]` (en progreso) en el artefacto. **Solo una tarea `in_progress` / `[~]` a la vez.**
- **A medida que se completa cada tarea:** marcar su entrada como `completed`, en el mismo momento en que se marca `[~]` => `[x]` en el artefacto.
- **La primera entrada (titulo del `TK`/`WI`)** se marca como `completed` **solo cuando todas las tareas del plan de implementacion hayan finalizado**; hasta entonces permanece como recordatorio del artefacto en curso.
- **Al terminar el plan:** todas las tareas quedan `completed`, incluida la primera entrada del titulo. Al comenzar el siguiente plan de implementacion, reemplazar la lista con el titulo del nuevo artefacto y sus tareas.
- **Coherencia:** la lista de to-dos, los checkboxes del artefacto y `progress.md` no deben contradecirse.
- **Fallback:** si el cliente no expone la herramienta de to-dos, basta con `progress.md` y los checkboxes del artefacto; no narrar el progreso como prosa paso a paso.

---

## Documentacion de codigo segun ADR (transversal)

Antes de escribir codigo, verificar si el proyecto tiene **algun ADR que defina como documentar el codigo** (estilo de docstrings, comentarios, JSDoc/TSDoc, convenciones de encabezado de archivo, anotaciones, etc.). Los ADR suelen vivir bajo `docs/adr/` o donde el proyecto los registre.

- Si existe un ADR **vigente** sobre documentacion de codigo, **aplicarlo dentro de la misma unidad que se implementa** (la TK o el WI). La documentacion que el ADR exige es **parte del entregable de esa unidad**, no un paso posterior.
- **No diferir** esa documentacion "para otro momento", un commit aparte o una tarea futura. Una unidad cuyo codigo no cumple la documentacion que su ADR exige **no esta `Done`**.
- Esto **no contradice** la regla de no modificar la especificacion de producto: seguir un ADR significa **obedecerlo al escribir el codigo**, no editar el ADR. El ADR se respeta, no se cambia.
- Si hay varios ADR aplicables, o uno ambiguo respecto al alcance actual, **preguntar al usuario** antes de continuar en lugar de asumir.

---

## Principios de desarrollo (transversal)

Toda implementacion, sea cual sea el tipo de artefacto, sigue estos dos principios. No son opcionales.

### TDD — Test-Driven Development

El ciclo obligatorio por cada unidad de comportamiento es **Red → Green → Refactor**:

1. **Red:** escribir el test que falla antes de escribir el codigo de produccion. El test debe describir el comportamiento esperado segun los **insumos de comportamiento** del artefacto: los criterios de aceptacion (`AC-XXX`) y —cuando existan— las reglas de negocio (`BR-XX`) y los casos de prueba (`TC-XXX`). **Nota:** si el artefacto (US o WI) referencia una investigacion de migracion con casos de Golden Master en su `validation.md`, esos casos forman parte de las pruebas de la unidad.

> **Test cases como insumo de las pruebas automatizadas:** si el artefacto tiene test cases (carpeta `test-cases/` en la US o el WI), **leer su `README.md` antes de escribir codigo** para identificar que `TC-XXX` describen y cuales pueden convertirse en pruebas automatizadas (unit, integracion, e2e) dentro del ciclo TDD. Cada `TC-XXX` que sea automatizable se cubre con su prueba en la unidad correspondiente. Cuando un `TC-XXX` **no se pueda automatizar** (p. ej. es manual o exploratorio) o se **decida crear otro tipo de prueba** distinto al que sugiere el test case, **registrarlo en `progress.md`** (ver seccion `progress.md`). Escribir la prueba en el ciclo TDD es una cosa; **ejecutarla** sigue el [Uso escalonado de pruebas](#uso-escalonado-de-pruebas-optimizacion) (unit e integracion en cada iteracion y acotadas al cambio, e2e solo al final de la implementacion).
2. **Green:** escribir el minimo codigo necesario para que el test pase.
3. **Refactor:** limpiar el codigo (produccion y test) sin romper los tests.

> **El paso Red no aplica a las pruebas e2e.** Se **escriben** dentro del ciclo TDD como cualquier otra
> prueba, pero **no se ejecutan durante las iteraciones** (ver [Uso escalonado de pruebas](#uso-escalonado-de-pruebas-optimizacion)),
> asi que no hay rojo que observar. Su primer y unico rojo/verde en este skill ocurre en el cierre de la
> implementacion. Unitarias e integracion si cumplen Red→Green→Refactor completo en cada iteracion.

Los tests son parte del entregable de la unidad, no una fase posterior. Una unidad no esta `Done` si sus tests **no existen**, o si los que **corresponde ejecutar en la iteracion** (unitarias e integracion) no pasan. Las pruebas **e2e escritas pero diferidas al cierre** —y, en modo paralelo, las de integracion diferidas por infra no aislable— **no bloquean el `Done` de la unidad**, siempre que esten escritas y su diferimiento quede registrado en `progress.md`; su verificacion es condicion del **cierre de la implementacion**, no de la unidad.

> **Variante para los tipos `TC-XXX` / `FT-XXX`:** ahi el entregable **son** las pruebas y el comportamiento **ya esta implementado**, asi que **no hay paso Red por diseno**: lo esperado es que la prueba pase en verde a la primera y confirme el comportamiento documentado. Si la prueba falla, hay una discrepancia real entre el `TC-XXX` y el codigo: se para, se presenta la evidencia al usuario y se decide con el si se corrige produccion (y ahi el rojo si actua como paso Red), si se corrige la prueba, o si vuelve a `test-define`. Nunca se relaja una asercion para forzar el verde. Detalle en `references/test-cases.md`.

### Uso escalonado de pruebas (optimizacion)

El ciclo TDD siempre **define** las pruebas de la unidad (unit / integracion / e2e segun corresponda),
pero **ejecutarlas todas y completas en cada iteracion es caro**. Escalonar la *ejecucion* — esto cambia
*cuando y cuantas veces* se corren, no *que* se escribe ni la definicion de `Done`:

- **Unitarias e integracion — ambas en cada iteracion, al mismo nivel.** Las dos son la red de seguridad
  primaria del ciclo Red→Green→Refactor y se corren en **cada** iteracion de la unidad. No hay juicio
  previo sobre si el cambio "cruza una frontera": si la unidad tiene pruebas de integracion, se ejecutan.
- **Siempre acotadas exclusivamente al cambio.** Lo que abarata la corrida no es saltarse un nivel, es el
  **alcance**: ejecutar unicamente el archivo, la suite o el paquete de lo que se acaba de tocar —
  **nunca la suite completa del nivel** ni la del repositorio. Usar los filtros del runner (patron de
  ruta, nombre de test, proyecto/paquete). La corrida completa es tarea exclusiva de `quality-check`.
- **E2E — se escriben durante, se ejecutan solo al final.** Se definen dentro del ciclo TDD como
  cualquier otra prueba, pero **no se ejecutan en las iteraciones** (son lentas y fragiles). Su unica
  corrida en este skill es en el **cierre de la implementacion** (Paso 4 de la referencia del tipo, o el
  paso de Integracion en modo paralelo), una sola vez sobre el codigo consolidado. La corrida exhaustiva
  como **puerta formal** la realiza `quality-check` en `work-integrate` / `pr-create`.

**En modo paralelo (worktrees):** el subagente ejecuta la integracion de su unidad **cuando puede aislar
la infraestructura** (base de datos por worktree, contenedor efimero, testcontainers, esquema o namespace
propio). Si la infra es compartida y no aislable —hasta 3 worktrees concurrentes colisionarian en
migraciones, fixtures o estado—, **difiere esas pruebas**, lo registra en `progress.md` y lo reporta al
orquestador, que las ejecuta en el paso de Integracion tras el merge de la unidad. Un fallo por colision
de infra no es un defecto del codigo: no se corrige, se aisla o se difiere.

Registrar en `progress.md` cuando una prueba se **difiera** o se **decida no ejecutar** en una iteracion
(e2e por diseno; integracion solo por infra no aislable en modo paralelo), para que la decision quede
trazada y el cierre sepa que debe ejecutarla.

### Clean Architecture

Organizar el codigo respetando la separacion de responsabilidades:

- **Capas con dependencias hacia adentro:** Entities → Use Cases → Interface Adapters → Frameworks/Drivers. Las capas internas no conocen las externas.
- **Regla de dependencia:** el codigo fuente solo puede apuntar hacia adentro; nunca una capa interna importa de una externa.
- **Use cases primero:** la logica de negocio vive en casos de uso, no en controladores, servicios de infraestructura ni frameworks.
- **Inversión de dependencias:** las abstracciones (interfaces/puertos) se definen en la capa de dominio; las implementaciones concretas (repositorios, clientes HTTP, etc.) viven en la capa de infraestructura.

Si el proyecto ya tiene una estructura establecida que se aparta de Clean Architecture, respetar la convencion existente y registrar la decision en `Decisiones adicionales` del `progress.md`.

---

## Subagentes y MCP condicionales (transversal)

| Condicion | Agente / MCP requerido |
| --------- | ---------------------- |
| La unidad genera o modifica archivos de UI (HTML, CSS, componentes) | Ejecutar bajo el agente `ui-specialist` **si el proyecto lo define** |
| La unidad consiste en automatizar test cases (tipos `TC-XXX` / `FT-XXX`) | Ejecutar la escritura de las pruebas bajo el agente `quality-specialist` **si el proyecto lo define**, delegando via la herramienta Task |
| La referencia de diseno es un enlace o archivo de Figma | Usar el **MCP de Figma** para obtener el contexto del diseno antes y durante la implementacion |

Los subagentes `ui-specialist` y `quality-specialist` solo se usan **si el proyecto los define**; si no existen, ejecutar el paso directamente. Si la unidad no involucra UI ni automatizacion de pruebas, implementar directamente sin delegar.

---

## Ejecucion paralela con subagentes y worktrees (transversal)

Modo alternativo al ritmo secuencial por defecto. Aplica a los cuatro tipos (`TK-XXX`, `WI-XXX`, `TC-XXX` y `FT-XXX`). **Se activa unicamente cuando se cumplen las dos condiciones a la vez:**

1. El alcance incluye **mas de una unidad** (varias `TK`, varios `WI`, varios `TC` o varios `FT`).
2. El usuario **pide explicitamente ejecutar sin confirmacion entre unidades** (p. ej. "sin preguntar", "de corrido", "todas a la vez", "sin pausas").

Si falta cualquiera de las dos, se mantiene el **modo secuencial** con una unidad por confirmacion (comportamiento por defecto de cada referencia). El modo paralelo **no** cambia *como* se implementa cada unidad — ciclo TDD, Clean Architecture, lint/build, checkboxes del artefacto, cobertura de test cases, validacion por criterios de aceptacion siguen igual —: solo cambia **cuantas** unidades avanzan a la vez y como se integran.

### Paso 0 - Analisis de dependencias (obligatorio, antes de ejecutar nada)

Es el **primer paso** y condiciona todo lo demas. No lanzar ningun subagente antes de completarlo.

1. Leer cada unidad del alcance y su relacion de dependencias: el campo **`Dependencias`** del artefacto (TK/WI), las **`Observaciones`** del `TC-XXX` (donde se declaran dependencias con otros TC) y las dependencias obvias descritas en el texto.
2. Clasificar cada unidad:
   - **Independiente:** sin dependencias, o cuyas dependencias ya estan en `Done`.
   - **Dependiente dentro del alcance:** depende de otra unidad que **si** esta en esta ejecucion.
   - **Dependiente fuera del alcance:** depende de una unidad que **no** esta en esta ejecucion **ni** en `Done`.
3. **Dependencia fuera del alcance => parar y preguntar.** Si alguna unidad depende de trabajo que no forma parte de esta ejecucion, **detenerse antes de ejecutar** e informar al usuario (herramienta de preguntas estructuradas) para que decida por cada caso:

   > "La unidad X depende de Y, que no esta en esta ejecucion ni completada. ¿Como continuo?"
   > Opciones: [Excluir X y continuar] / [Detener aqui]

   No ejecutar hasta resolver todos estos casos.
4. **Ordenar por olas (niveles topologicos).** Con las dependencias internas al alcance, agrupar las unidades en **olas**: cada ola contiene unidades que **no dependen entre si** y cuyas dependencias ya quedaron integradas en olas anteriores. Las unidades de una misma ola son candidatas a correr en paralelo; las olas se ejecutan **en secuencia**. Si se detecta un **ciclo** de dependencias (A depende de B y B de A), parar e informar: no es paralelizable; devolver a `work-plan` / `work-define` para revisar el alcance.
5. Presentar el **plan de ejecucion** (olas, que corre en paralelo, que se excluye y por que) y confirmarlo **una sola vez**. Como el usuario ya pidio ejecutar sin confirmacion, no habra mas pausas entre unidades una vez aprobado este plan (salvo que un paso obligue a parar: dependencia externa, conflicto de merge no trivial o suite en rojo).

### Concurrencia y worktrees

- **Maximo 3 subagentes en paralelo.** Si una ola tiene mas de 3 unidades independientes, despacharlas en lotes de hasta 3; al liberarse un cupo, entra la siguiente unidad pendiente de la ola.
- **Un worktree por unidad.** Cada subagente trabaja en su propio `git worktree`, en una rama derivada de la rama del artefacto:
  - Rama base = la rama del artefacto de esta ejecucion (`feature/US-XXX-*` o la rama del `WI`).
  - Crear el worktree en una ruta temporal fuera del arbol principal con `git worktree add <ruta-temporal> -b wt/<unidad> <rama-base>` (p. ej. rama `wt/TK-003`). El worktree parte del estado de la rama base **ya integrado con las olas anteriores**.
- Cada subagente **ejecuta el flujo completo de su unidad** segun la referencia del tipo (Paso 3 de la referencia correspondiente): ciclo TDD, lint/typecheck/build, validacion, checkboxes del artefacto, cobertura de test cases y commits dentro de su worktree. **Excepcion a la delegacion en `/git-commit` del Paso 3:** dentro del worktree el commit se hace de forma **directa** (`git commit`), sin invocar `/git-commit` — ese skill siempre pausa a confirmar su propuesta con el usuario (no tiene modo silencioso ni delegado), algo incompatible con el modo paralelo, que existe precisamente para no pausar. Como compensacion, el subagente debe aplicar antes de cada commit directo la misma deteccion de secretos que usa `git-commit` (patrones de nombre de archivo sensibles y `grep` sobre el diff staged) y, si encuentra alguno, **abortar la unidad sin comitear** y escalar el hallazgo al orquestador en vez de comitear. El subagente **no** integra ni mergea a la rama base ni ofrece handoffs; al terminar devuelve al orquestador el resultado (unidad, rama, estado, notas, resultado de tests/validacion).
- El orquestador arranca una **nueva ola solo cuando la anterior este completamente integrada** en la rama base, para que las unidades dependientes vean el codigo de sus predecesoras.

### Integracion (merge secuencial a la rama del artefacto)

La hace **el orquestador, una unidad a la vez** (nunca merges concurrentes), a medida que los subagentes terminan:

1. Sobre la rama del artefacto, hacer merge de la rama de la unidad: `git merge wt/<unidad>`.
2. **Resolver conflictos** si los hay; si el conflicto no es trivial o el resultado queda ambiguo, **parar e informar al usuario** antes de continuar con el resto.
3. Ejecutar **lint/typecheck/build y las pruebas unitarias y de integracion** de los archivos/paquete afectados por las unidades integradas, en la rama del artefacto tras el merge (acotadas al cambio, no la bateria completa; esa la corre `quality-check`). **Incluir aqui las pruebas de integracion que el subagente difirio por infra no aislable** (las registradas en `progress.md`): en la rama del artefacto ya no hay concurrencia entre worktrees, asi que este es su punto de ejecucion. **E2E no se corre por merge:** se difiere al cierre (paso 6). Ver [Uso escalonado de pruebas](#uso-escalonado-de-pruebas-optimizacion). Si algo falla, **intentar corregirlo**; solo si el error **persiste tras varios intentos** (p. ej. 2-3), **parar** y avisar. No seguir integrando sobre una base rota.
4. Marcar `progress.md` de esa unidad a `Done` (y su `Cobertura de test cases`) solo **despues** de un merge y una validacion en verde.
5. Al integrar todas las unidades, **limpiar los worktrees y ramas temporales** (`git worktree remove <ruta-temporal>` y borrar la rama `wt/<unidad>`).
6. **Cierre de la implementacion:** con todas las unidades integradas, correr **una sola vez** las pruebas **e2e** que apliquen al alcance sobre el codigo consolidado (si el repo las tiene). La corrida exhaustiva como puerta formal la hara luego `quality-check`.

`progress.md` y la lista de to-dos siguen siendo la bitacora: el orquestador refleja el avance global (una entrada por unidad + la ola en curso) y cada subagente mantiene los checkboxes de su propia unidad; la coherencia entre ambos se mantiene igual que en el modo secuencial. Al cerrar, el handoff es identico al del modo secuencial (`work-integrate` / `pr-create` / terminar).

---

## Modo correccion (delegado desde quality-check)

[`quality-check`](../quality-check/SKILL.md#corrección-de-fallos) corre la bateria completa en el cierre (`work-integrate` / `pr-create`). Cuando un check
falla —tipado, linter, build o **pruebas**— y el usuario **autoriza** la correccion, `quality-check`
**delega en este skill** la escritura del arreglo, porque es el skill que escribe codigo. La delegacion
ocurre si la rama corresponde a un **artefacto de trabajo identificable** — `US-XXX`, `WI-XXX`, una
**automatizacion de pruebas** (`FT-XXX` / `TC-XXX` sobre rama `test/`), **o un artefacto externo al
plugin** (ticket de un tracker, spec suelto, documento de otra herramienta) —; solo cuando no hay
artefacto de ningun tipo, `quality-check` corrige por su cuenta y este skill no interviene.

**Que llega en la delegacion:** el artefacto en curso (`US-XXX` / `WI-XXX` / `FT-XXX` / `TC-XXX`, o la
**ruta o referencia** del artefacto externo), el check que fallo, el comando exacto, la salida de error
relevante y los archivos implicados.

> **Artefacto externo al plugin.** El modo correccion **no exige** que el trabajo este especificado con
> los artefactos de este plugin. Si lo que llega es la ruta de un spec, un ID de tracker o solo la
> descripcion del trabajo, se corrige igual: leer lo que exista como referencia de comportamiento y
> aplicar el mismo alcance minimo. **No inventar la carpeta `docs/specs/` ni un `progress.md`** para poder
> anotar el retrabajo: si no hay `progress.md`, la nota de la correccion **se devuelve en la respuesta** a
> `quality-check`, que la recoge en su informe. Todo lo demas del modo es identico.

> **Correccion sobre una rama `test/`.** La rama `test/` la crea este mismo skill (Paso 1 de
> [`references/test-cases.md`](references/test-cases.md)) y siempre cuelga de un artefacto padre con su
> `progress.md`: no es una rama suelta. Si lo que falla es una **prueba** que este skill escribio, aplica
> el criterio de los tipos `TC-XXX` / `FT-XXX`: **no se asume que el error esta en la prueba**. Puede ser
> una discrepancia real entre el `TC-XXX` y el codigo — parar, presentar la evidencia al usuario y decidir
> con el si se corrige produccion, si se corrige la prueba, o si vuelve a `test-define`. **Nunca relajar
> una asercion para forzar el verde.** Si la decision es escalar a `test-define`, la correccion no se
> aplica: devolver el control a `quality-check` informando el motivo (ver [Cuando la correccion no se aplica](#cuando-la-correccion-no-se-aplica)).

**Como se ejecuta — es un modo acotado, no una implementacion normal:**

- **El estado `Ready` no aplica.** El artefacto ya se implemento; en el cierre suele estar en `Done`. La
  regla «solo se implementa trabajo en `Estado: Ready`» rige para **iniciar** la implementacion de un
  artefacto, no para corregir uno ya implementado. No devolver la delegacion a `work-plan` por esto.
- **El working tree puede estar sucio.** El cierre corre sobre la rama consolidada y `quality-check`
  tolera cambios sin commitear. No exigir arbol limpio para arrancar la correccion.
- **Sin ritmo por unidad ni confirmacion intermedia:** la correccion es una sola intervencion acotada. No
  se abren unidades nuevas ni se pausa entre archivos.
- **Alcance minimo:** solo lo necesario para que el check pase. Si el arreglo crece hasta ser un
  desarrollo (funcionalidad nueva, cambio de diseño, refactor amplio), **parar y escalar** a `work-plan`
  como `WI-XXX` en vez de seguir dentro de la correccion.
- **Vale igual para un test en rojo que para un error de compilacion:** en ambos casos hay que escribir o
  ajustar codigo. Si el test falla porque el test esta mal (no el codigo), corregir el test; si falla
  porque el comportamiento no es el esperado, corregir el codigo — y decirlo explicitamente al reportar.
- **Registro en `progress.md`:** anotar la correccion como **nota** de la unidad afectada (o del artefacto,
  si no se puede atribuir a una unidad), indicando el check que fallo y que fue retrabajo de cierre. **No**
  se inventan estados: los validos siguen siendo `Pending`, `In Progress`, `Done`, y una unidad ya en
  `Done` permanece en `Done`. **Si el artefacto es externo y no hay `progress.md`**, no crearlo: devolver
  esa misma nota en la respuesta a `quality-check`.
- **Sin commit automatico ni handoff:** al terminar, devolver el control a `quality-check`, que verifica el
  arreglo re-ejecutando el check, recalcula el fingerprint y reinicia su corrida. Este skill no re-ejecuta
  la bateria completa ni decide si el cierre continua.

### Cuando la correccion no se aplica

La delegacion puede terminar **sin arreglo**, y eso es un desenlace valido — no un fallo del modo. Ocurre
cuando el arreglo **excede el alcance acotado** (crece hasta ser un desarrollo => escalar a `work-plan`
como `WI-XXX`), cuando el fallo revela una **discrepancia entre el `TC-XXX` y el codigo** que el usuario
decide resolver en la especificacion (=> escalar a `test-define`), o cuando el fallo es **preexistente** y
ajeno al trabajo de la rama.

En esos casos, **no seguir intentando ni improvisar un arreglo parcial**. Devolver el control a
`quality-check` con un resultado explicito de **correccion no aplicada**, indicando: el check que seguia
fallando, **el motivo** (fuera de alcance / discrepancia de especificacion / preexistente) y **a que skill
se escalo**. `quality-check` no debe reintentar la delegacion sobre ese mismo fallo: le corresponde
reportarlo al usuario en su informe y emitir el veredicto que aplique (`❌ Rechazado`), dejando el cierre
bloqueado hasta que el escalado se resuelva. Anotar tambien la decision como **nota** en `progress.md`.

---

## Regla de handoff (transversal)

Todo paso a otra fase del ciclo se realiza **invocando el skill correspondiente**, nunca ejecutando ese trabajo directamente desde este skill. Este skill implementa; **no planifica, no integra ni crea PRs por su cuenta**.

- **Para integrar/cerrar el trabajo** (merge a la rama base): **invocar `/work-integrate`**. Este skill no hace el `git merge` a la rama base ni borra ramas por iniciativa propia. (El merge secuencial de worktrees a la rama del artefacto dentro del *modo de ejecucion paralela* es interno a la implementacion, no el cierre del trabajo.)
- **Para crear un PR/MR:** **invocar `/pr-create`**. Este skill no crea PRs directamente.
- **Si el artefacto necesita replanificarse** (TK/WI fuera de alcance, ambiguedad tecnica, criterios faltantes): escalar a **`/work-plan`** (o **`/work-define`** si el conflicto es funcional de la US); no reescribir la especificacion aqui.
- **Si un `TC-XXX` es ambiguo o erroneo, o un `AC-XXX` se quedo sin test cases:** escalar a **`/test-define`**; este skill no crea ni edita casos de prueba.
- **Para validar la cobertura** de los criterios de aceptacion tras automatizar las pruebas (tipos `TC-XXX` / `FT-XXX`): **invocar `/trace-validate`**. Este skill no genera la matriz de trazabilidad.
- **`quality-check` es el unico origen entrante:** ademas de los handoffs salientes de arriba, este skill **recibe** correcciones delegadas desde [`quality-check`](../quality-check/SKILL.md#corrección-de-fallos) en el cierre (ver [Modo correccion](#modo-correccion-delegado-desde-quality-check)). Es la unica entrada que no viene de una especificacion recien planificada.

Las opciones de cierre se ofrecen con la herramienta de preguntas estructuradas (ver el Paso 4 de cada referencia) y cada una hace handoff **invocando** el skill dueño de esa fase.

---

## Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno ni narracion del trabajo en curso ("lei el TK", "cree la rama"). Las preguntas y confirmaciones van por la herramienta de preguntas estructuradas.

---

## Mapa de referencias

| Archivo | Cuando leerlo |
|---------|---------------|
| `references/user-story-tasks.md` | Tipo = tarea de historia de usuario (`US-XXX` / `TK-XXX`). Ubicaciones, filtros, cola, ciclo TK-a-TK (con TDD), flujo "TK sin US", cierre, ejemplos y anti-patrones. |
| `references/work-items.md` | Tipo = tarea de mantenimiento (`WI-XXX`). Documento unico combinado, validacion por criterios de aceptacion, ciclo por WI completo, cierre, ejemplos y anti-patrones. |
| `references/test-cases.md` | Tipo = caso de prueba (`TC-XXX`) o feature (`FT-XXX`). Automatizacion de las pruebas documentadas por `test-define`: ubicaciones por artefacto padre, rama `test/`, matriz AC=>TC, traduccion del TC a codigo de prueba, que hacer ante una prueba en rojo, cierre con `trace-validate`, ejemplos y anti-patrones. |
| `assets/progress-template.md` | Plantilla de `progress.md`. Adaptar encabezado y unidades al tipo. |

---

## Anti-patterns (transversales)

- Implementar mas de una unidad por turno sin confirmacion intermedia del usuario **en modo secuencial** (el modo por defecto); solo el modo de ejecucion paralela, pedido explicitamente, omite las pausas.
- Activar el modo de ejecucion paralela sin que el usuario lo haya pedido explicitamente, o sin completar antes el analisis de dependencias (Paso 0).
- Lanzar mas de 3 subagentes en paralelo, o integrar (mergear) varias unidades a la vez en la rama del artefacto.
- Ejecutar una unidad que depende de trabajo fuera del alcance de la ejecucion sin avisar al usuario para excluirla o detener.
- Arrancar una nueva ola antes de integrar la anterior en la rama del artefacto.
- Mezclar dos tipos de implementacion en una misma ejecucion.
- Codificar con working tree sucio sin avisar y pausar — **salvo** en el modo correccion delegado desde `quality-check`, donde el arbol sucio del cierre es lo esperado.
- Implementar en `main` u otra rama que no sea la del artefacto sin instruccion explicita.
- Tratar como ejecutable un artefacto que no esta en `Ready` — **salvo** en el modo correccion delegado desde `quality-check`, donde el artefacto ya esta implementado y el estado `Ready` no aplica.
- Modificar la especificacion de producto (US/TK/WI/TC/FT, ADRs, technical-docs) durante la implementacion, salvo marcar checkboxes de subtareas completadas en el artefacto activo.
- En los tipos `TC-XXX` / `FT-XXX`: inventar casos de prueba que `test-define` no documento, automatizar un TC `Manual`, relajar una asercion para forzar el verde, o corregir codigo de produccion por iniciativa propia sin la decision explicita del usuario.
- Leer un `FT-XXX` como plan de implementacion o tratarlo como funcionalidad por construir: documenta codigo **ya implementado**; lo unico que se implementa son sus pruebas.
- Escribir funcionalidad nueva desde los tipos `TC-XXX` / `FT-XXX`: el codigo de produccion solo se toca como **correccion puntual** de un defecto revelado por una prueba; si crece hasta ser un desarrollo, escalar a `work-plan` como `WI-XXX` de tipo bug.
- Diferir "para otro momento" la documentacion de codigo que un ADR vigente exige, o cerrar una unidad como `Done` sin esa documentacion.
- Continuar cuando se detecta un conflicto en la documentacion sin notificar al usuario primero.
- Diferir la escritura de tests para despues de la implementacion; el ciclo TDD es Red → Green → Refactor dentro de cada unidad.
- Correr la **bateria completa de pruebas** del repositorio desde este skill: solo se ejecutan las pruebas de los archivos/paquete afectados; la bateria completa es tarea exclusiva de `quality-check` (en `work-integrate` / `pr-create`).
- Correr **la suite completa de un nivel** (todas las unitarias o todas las de integracion del repo) cuando solo cambio una unidad: la ejecucion se acota **exclusivamente al cambio** con los filtros del runner (ver [Uso escalonado de pruebas](#uso-escalonado-de-pruebas-optimizacion)).
- Correr **e2e en cada ciclo TDD o por cada merge**: se escriben durante la implementacion pero se ejecutan **solo al final**, una vez sobre el codigo consolidado.
- **Saltarse las pruebas de integracion de la unidad** por considerar que "el cambio no cruza esa frontera": unitarias e integracion estan al mismo nivel y se ejecutan ambas en cada iteracion. La unica excepcion es la infra no aislable en modo paralelo, que se **difiere y se registra** — nunca se omite en silencio.
- Escribir un estado no definido en `progress.md`; estados validos: `Pending`, `In Progress`, `Done`. En el modo correccion, la correccion se anota como **nota**, sin inventar un estado de retrabajo ni reabrir una unidad ya en `Done`.
- En el modo correccion: abrir unidades nuevas, exigir arbol limpio, pedir confirmacion entre archivos, o dejar que el arreglo crezca hasta ser un desarrollo en vez de escalar a `work-plan`.
- En el modo correccion: re-ejecutar la bateria completa o decidir si el cierre continua — eso vuelve a `quality-check`.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
- Aceptar como confirmacion una respuesta ambigua sin opciones explicitas; si hay duda, repreguntar.
- Comitear los cambios de una unidad inmediatamente al terminarla, antes de la pausa de confirmacion; el commit corresponde al momento de confirmar el avance a la siguiente unidad (o al cierre, si el usuario detiene ahi).
- Arrancar la siguiente unidad sin haber commiteado antes los cambios de la unidad ya confirmada.