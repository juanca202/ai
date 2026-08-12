---
name: trace-validate
description: "Genera un reporte de trazabilidad que valida la cobertura de los criterios de aceptación de un trabajo —una historia de usuario (US-XXX), una tarea de mantenimiento (WI-XXX) o un feature de funcionalidad ya implementada (FT-XXX), cada uno con sus criterios de aceptación— o cualquier otro artefacto de especificación cuyos criterios tengan un identificador codificado (AC-XXX, 1.1, R-3…) contra los casos de prueba y los artefactos de prueba del repositorio (unit, integración, e2e). Para cada criterio indica los casos de prueba y artefactos que lo cubren, un estado (Cubierto / Parcial / No cubierto), observaciones cuando hace falta aclaración, si la prueba se pudo ejecutar automáticamente y su resultado, y finalmente un veredicto sobre si todos los criterios de aceptación quedan cubiertos. Activar siempre que el usuario pida validar cobertura, generar una matriz o reporte de trazabilidad, verificar que los criterios de aceptación están probados, comprobar que un trabajo o un feature está cubierto por pruebas, o mencione «trace-validate», «trazabilidad», «matriz de cobertura» o «validar criterios de aceptación», aunque no nombre el formato exacto."
license: MIT
---

# Skill: Validar trazabilidad de un trabajo

Genera un **reporte de trazabilidad** que cruza los **criterios de aceptación** de un trabajo contra los **casos de prueba** y los **artefactos de prueba automatizada** (unit, integración, e2e) presentes en el repositorio, y emite un **veredicto** sobre si el trabajo queda cubierto.

El trazado primario es para **historias de usuario** (`US-XXX`) con sus **criterios de aceptación**. Sirve igual para cualquier otro artefacto que tenga criterios con **identificador codificado** — el formato es indiferente (`AC-001`, `1.1`, `R-3`…) y se usa **verbatim**, sin normalizar (ver [Tipos de trabajo y criterios](#tipos-de-trabajo-y-criterios)). Es el mismo contrato que produce `test-define`.

> **Qué hace:** lee, mapea, **obtiene los resultados de pruebas delegando en `quality-check`** y reporta. Es una actividad de **verificación**, no de desarrollo.
>
> **No ejecuta pruebas por sí mismo.** La ejecución de la batería de pruebas se **delega en `quality-check`**: si existe una corrida previa fresca de `quality-check` (sin cambios en el código desde entonces), se **reutilizan** sus resultados; si no, se invoca `quality-check` en modo `tests-only` para producirlos. Ver [Resultados de pruebas: delegación en quality-check](#resultados-de-pruebas-delegación-en-quality-check).
>
> **Reporte idempotente.** Si no hubo **cambios en los archivos** (código, criterios ni pruebas) desde la última vez que se generó el `trace-report.md`, **no se genera un documento nuevo**: se devuelven los mismos resultados del reporte existente. Ver [Reutilización del reporte (idempotencia)](#reutilización-del-reporte-idempotencia).
>
> **Qué NO hace:** no escribe ni modifica código de aplicación, no escribe nuevos tests (eso es de `quality-specialist` vía `work-implement`), no edita la especificación de producto (README de la US, `TK-XXX`, `WI-XXX`, `FT-XXX`, `validation.md`, ADRs), **ni corre la suite de pruebas directamente**. Lo único que produce es el **reporte de trazabilidad**. Lo que no se puede determinar de las fuentes va a **Observaciones** o se pregunta al usuario — nunca se inventa cobertura ni resultados.

---

## Alcance del informe

El informe de este skill cubre **un artefacto concreto y sus criterios de aceptación**. La pregunta es «¿cada criterio de *este* trabajo está probado?», así que el universo lo definen los criterios del artefacto, no los archivos que cambiaron ni el repositorio completo.

Consecuencias prácticas:

- **Se validan todos los criterios del artefacto**, aunque en esta rama no se haya tocado el código de alguno de ellos: un criterio cuya prueba nunca se escribió sigue siendo un hueco.
- **No se reportan pruebas ni código ajenos al artefacto.** Tests de otros trabajos, cobertura global o fallos en módulos que no mapean a ningún criterio de este artefacto no entran en la matriz — a lo sumo van a Observaciones.
- **Si la rama abarca varios trabajos**, se valida uno por corrida, con su propio `trace-report.md` junto a su artefacto. Los resultados de pruebas sí son compartidos (vienen de la corrida de `quality-check`), pero el **mapeo** es por artefacto.
- **La clave de frescura es de rama, no de artefacto.** El fingerprint de la idempotencia cubre todo el árbol, así que un cambio en *otro* trabajo de la misma rama invalida también este `trace-report.md` y fuerza a regenerarlo. Es conservador a propósito: prefiere revalidar de más antes que devolver un reporte que ya no corresponde al código.

---

## Subagente

**Si el proyecto define el subagente `quality-specialist`, ejecutar este skill bajo ese subagente** (es el mismo agente que escribe los tests en el cierre de `work-implement`, por lo que es el contexto natural para validarlos). Si no existe en el proyecto, ejecutar el flujo normalmente.

---

## Tipos de trabajo y criterios

El tipo se determina por el identificador que indique el usuario o por la ruta de trabajo. Cada tipo fija de dónde se leen los criterios de aceptación y con qué códigos se traza.

| Tipo | Identificador | Dónde viven los criterios | Códigos a trazar |
|------|---------------|---------------------------|------------------|
| **Historia de usuario** | `US-XXX` | Sección **Criterios de aceptación** del `README.md` de la US (lista plana, habitualmente `AC-XXX`) | El identificador de cada criterio, en el orden en que aparecen |
| **Tarea de mantenimiento** | `WI-XXX` | Sección **## Criterios de aceptación** del `README.md` del WI (`WI-XXX-[kebab]/README.md`) | El identificador de cada criterio, en el orden en que aparecen |
| **Feature (funcionalidad ya implementada)** | `FT-XXX` | Sección **## Criterios de aceptación** del `README.md` del feature (`docs/specs/features/FT-XXX-[slug]/README.md`) | El identificador de cada criterio, en el orden en que aparecen |
| **Cualquier otro artefacto de especificación** | Ruta o nombre que indique el usuario | La sección de criterios del documento (puede llamarse «Criterios de aceptación», «Requisitos», «Acceptance Criteria»…) | El identificador de cada criterio, tal como aparece |

> **El requisito no es el formato, es que exista identificador.** En todo el flujo, «criterio» se refiere al identificador **tal como está escrito en el artefacto** — `AC-012`, `1.3`, `R-3`, `CA-07` son todos válidos. **Nunca normalizar ni renombrar**: el vínculo de trazabilidad debe ser buscable literalmente tanto en el artefacto como en los TCs que produjo `test-define`. Si el trabajo **no tiene criterios**, o los tiene sin identificador, no hay nada que trazar → **bloquear** (ver «Cuándo bloquear»).

> **FT — validar cobertura de funcionalidad ya implementada.** Un `FT-XXX` es el
> registro de una funcionalidad **ya implementada** (inferida de código legacy por el
> análisis de `work-research`, o simplemente el registro de funcionalidad existente),
> no trabajo por construir. Validarlo responde: *¿esa funcionalidad ya existente está
> cubierta por pruebas?* Un criterio **No cubierto** significa que ese comportamiento
> **carece de pruebas** (un hueco a cerrar escribiendo tests), **no** que falte código
> funcional. Sus casos de prueba documentados viven en
> `docs/specs/features/FT-XXX-[slug]/test-cases/`, igual que en una US o un WI.

---

## Cómo preguntar al usuario

Cuando este skill indique **preguntar, pedir, confirmar o validar** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (opciones tappables o selector) en lugar de prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2-4 por pregunta) cuando la respuesta admita categorías.
- **No repreguntar** lo que ya esté respondido en el contexto de la sesión o en los documentos del repo.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3...).

---

## Resolución de idioma

El idioma del reporte se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

La salida y los mensajes de error de las herramientas de prueba no se traducen.

---

## Información requerida antes de generar el reporte

No inventar nada. Si un dato no es explícito, obtenerlo del repo o preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Trabajo a validar** | Indicado por el usuario o inferido de la ruta de trabajo; determinar el tipo (`US-XXX` / `WI-XXX` / `FT-XXX` / otro artefacto) | Preguntar qué trabajo validar; sin él no se puede generar el reporte |
| **Criterios de aceptación** | Según el tipo (ver [Tipos de trabajo y criterios](#tipos-de-trabajo-y-criterios)) | Si el trabajo no tiene criterios de aceptación: **bloquear** y reportar — sin criterios no hay nada que trazar |
| **Casos de prueba** | **Fuente primaria:** la carpeta `test-cases/` **junto al artefacto** y su índice `test-cases/README.md`, más la línea `Casos de prueba:` que `test-define` deja bajo cada criterio. **Fallback:** inferir desde los tests del repo | Si no hay casos documentados, derivar la cobertura desde los artefactos de prueba del repo |
| **Artefactos de prueba** | Buscar en el repo archivos de test unit / integración / e2e relacionados con el trabajo (ver «Inventariar casos y artefactos» en `references/flow.md`) | Si no se encuentran, marcar criterios sin artefacto como `No cubierto` y dejar Observación |
| **Resultados de pruebas** | **Delegados en `quality-check`**: caché fresca `test-run.json` o invocación `tests-only` (ver [Resultados de pruebas: delegación en quality-check](#resultados-de-pruebas-delegación-en-quality-check)) | Si `quality-check` no puede ejecutarlas (sin stack, entorno sin correr, no disponible en la sesión) o el usuario declina la delegación: ejecución automática = `No`, con Observación |
| **Alcance** | Todo el trabajo por defecto; el usuario puede acotar a ciertos criterios | Si es ambiguo, preguntar |

> Leer **siempre** el documento de criterios completo (el `README.md` del trabajo, o el archivo del artefacto externo) antes de generar el reporte. No asumir criterios que no estén escritos.

---

## Flujo

Resumen de los pasos. El detalle íntegro de cada paso está en **`references/flow.md`** (leerlo antes de ejecutar el flujo).

0. **Comprobar frescura del reporte** — si ya existe `trace-report.md` con un fingerprint guardado y no hubo cambios en los archivos desde entonces, **devolver el reporte existente sin regenerarlo** (ver [Reutilización del reporte (idempotencia)](#reutilización-del-reporte-idempotencia)). Solo si hay cambios (o el usuario pide revalidar) continuar con los pasos siguientes.
1. **Localizar y leer el trabajo** — resolver tipo y ubicación; extraer todos los criterios con su identificador **verbatim**. Sin criterios (o sin identificador) → bloquear (ver «Cuándo bloquear»).
2. **Inventariar casos y artefactos** — leer la carpeta `test-cases/` del artefacto y su índice como fuente primaria, y clasificar los tests del repo por tipo, con ruta y criterio.
3. **Mapear cobertura criterio a criterio** — casos, artefactos, estado (ver «Estados de cobertura») y observaciones. No forzar mapeos inciertos.
4. **Obtener resultados de pruebas (delegando en `quality-check`)** — reutilizar la caché `test-run.json` si está fresca, o invocar `quality-check` en modo `tests-only`; mapear por suite a los criterios y registrar ejecución (`Sí`/`No`/`N/A`) y resultado (`Paso`/`Fallo`/`No ejecutado`). **No** correr pruebas directamente. Nunca fabricar resultados (ver [Resultados de pruebas: delegación en quality-check](#resultados-de-pruebas-delegación-en-quality-check) y `references/flow.md`).
5. **Construir la matriz** desde `assets/trace-report-template.md` (leerla antes de redactar).
6. **Emitir el veredicto** (ver «Veredicto») respondiendo si todos los criterios quedan cubiertos.
7. **Entregar y guardar** el reporte en la ubicación del tipo (ver «Ubicación de archivos»), **grabando el fingerprint** del estado actual para la próxima comprobación de frescura; no modificar otros artefactos.

---

## Estados de cobertura

| Estado | Cuándo aplicarlo |
|--------|------------------|
| **Cubierto** | El criterio tiene al menos un caso de prueba **y** el artefacto que le corresponde, y lo valida de forma completa. Si se ejecutó automáticamente, pasó. **Un criterio cuyos TCs son `Manual` por diseño también es Cubierto** si esos TCs lo validan por entero — ver la nota de abajo. |
| **Parcial** | El criterio está cubierto solo en parte: hay prueba pero no abarca todo el criterio, el artefacto existe pero no se pudo ejecutar, el resultado fue parcial, existe solo validación manual **no declarada como tal** (TC automatizable aún sin automatizar), o la suite que agrupa su test dio `FAIL` pero no se pudo aislar si el test específico del criterio fue el que falló (ver «Mapeo a la matriz» más abajo). Detallar el límite en Observaciones. |
| **No cubierto** | No existe caso de prueba ni artefacto que valide el criterio, o la prueba asociada **falló** y se pudo aislar que fue la suya. |

> **Cobertura ≠ ejecución.** Que exista prueba que valida el criterio es una cosa; que haya corrido y con qué resultado, otra. Un criterio cuya prueba **falló** —y se pudo aislar que fue la suya— se reporta **No cubierto** con el fallo en Observaciones; si la suite falló pero no se puede aislar el test, es **Parcial** (ver «Mapeo a la matriz»).
>
> **El `Estado` del TC filtra la cobertura.** `test-define` guarda cada TC con `Estado: Draft | Ready | Obsolete`. Un TC **`Obsolete`** no cuenta como cobertura (dejar Observación); uno **`Draft`** cuenta como cobertura **Parcial** (aún no está listo para respaldar el criterio); solo los **`Ready`** cuentan como cobertura plena. Si el TC no trae el campo, tratarlo como `Ready`. Esto es distinto del `Estado:` del **artefacto**, que este skill no exige (ver «Cuándo bloquear»).
>
> **Manual por diseño vs. pendiente de automatizar.** `test-define` distingue los dos casos en el campo **Tipo de prueba** del TC: `Manual` significa *no se automatiza por decisión de diseño*; cualquier otro valor (`Unit`, `Integration`, `API Test`, `Visual Test`, `E2E`) significa *debería existir artefacto automatizado*. Respetar esa declaración: un criterio con TCs `Manual` que lo cubren por completo es **Cubierto** (con `Automática = N/A`), no una deuda; un criterio con TCs automatizables **sin** artefacto es **Parcial** o **No cubierto**. No penalizar una decisión de diseño ni disimular una automatización pendiente.

---

## Reutilización del reporte (idempotencia)

Mismo principio de caché que `quality-check`: **si no hubo cambios en los archivos desde la última
generación, no se produce un reporte nuevo** — se devuelven los mismos resultados del `trace-report.md`
existente. Esto evita rehacer el mapeo y volver a delegar la ejecución de pruebas cuando nada cambió.

> **Contexto de ejecución.** Como `quality-check`, este skill es una **compuerta de cierre** (al integrar o
> antes del PR), no corre por tarea ni durante la implementación. La frescura se evalúa sobre la rama
> **consolidada** del cierre. En el pipeline típico de cierre `pr-create` corre `quality-check` **primero**
> (produce `test-run.json` fresco) y luego `trace-validate`, que reutiliza esa corrida — sin doble
> ejecución de pruebas; y si el código tampoco cambió desde el último `trace-report.md`, este Paso 0 lo
> devuelve sin regenerarlo.

**Clave de frescura — el fingerprint canónico de la tubería** (idéntico al de `quality-check`; excluye los
artefactos generados —`trace-report.md`, `quality-check.md`, `code-review.md`, `test-run.json`— para que escribirlos no
invalide la caché). Recipe exacto en `quality-check` → [Caché de corrida de pruebas](../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate).
Cubre el README de criterios de la US/WI, los tests y el código fuente: si no cambia, el reporte sería
idéntico → se reutiliza.

> **Un solo fingerprint por corrida.** Calcularlo una vez y usarlo para las **dos** comprobaciones:
> la frescura del `trace-report.md` (este Paso 0) y la del `test-run.json` (Paso 4, delegación).

**Comportamiento (Paso 0 del flujo):**

1. Resolver la ubicación del trabajo y buscar su `trace-report.md`. Si no existe → generar normal (no hay caché).
2. Si existe, leer el **fingerprint guardado** en su marca de pie
   (`<!-- trace-validate:fingerprint=<hash> · generado=YYYY-MM-DD -->`) y recalcular el `FINGERPRINT`:
   - **Coinciden** → **no regenerar**: devolver el veredicto y el resumen del reporte existente tal cual,
     e indicar al usuario que no hubo cambios desde la última validación ({{fecha guardada}}). No reescribir
     el archivo, no delegar en `quality-check`.
   - **Difieren, no hay fingerprint guardado (reportes antiguos), o el usuario pide revalidar/forzar** →
     ejecutar el flujo completo (Pasos 1-7) y **regrabar** el fingerprint al guardar (Paso 7).
3. La marca de pie con el fingerprint **se conserva** en el documento publicado (no se elimina como el
   bloque de instrucciones de la plantilla).

> Un cambio solo en el `trace-report.md`, `quality-check.md`, `code-review.md` o `test-run.json` **no** cuenta como cambio de
> archivos (están excluidos): el reporte depende del código, los criterios y las pruebas, no de los
> artefactos que él mismo o `quality-check` generan.

---

## Resultados de pruebas: delegación en quality-check

`trace-validate` **no ejecuta la suite de pruebas**. La ejecución es responsabilidad de `quality-check`,
que la persiste en un artefacto reutilizable `test-run.json` (esquema `test-run/v1`). Como el review es
una **corrida completa** de la rama, este artefacto vive en una **ubicación fija**, no por unidad:
**`docs/specs/test-run.json`** (junto a `docs/specs/quality-check.md`).

**Cómo obtener los resultados (Paso 4 del flujo):**

1. **Reusar el fingerprint canónico** ya calculado en el Paso 0 (mismo valor; no recalcular).
2. **Si existe `test-run.json` y su `git.fingerprint` coincide** → caché **fresca**: no hubo cambios
   desde la corrida de `quality-check`. **Reutilizar** los resultados por suite (`unit`/`integration`/`e2e`)
   sin ejecutar nada. Anotar en Observaciones/Ejecución automática la procedencia: «resultados tomados de
   la corrida de `quality-check` del {{commit/fecha}}».
3. **Si no existe o el fingerprint difiere** (hubo cambios, o nunca corrió) → **delegar en `quality-check`
   en modo `tests-only`**, que ejecuta solo los checks de pruebas, escribe `test-run.json` y devuelve los
   resultados. Luego consumir esa caché ya fresca.
4. **Si `quality-check` no puede ejecutarlas** (stack no detectable, entorno sin poder correr, dependencias
   ausentes, o el usuario declina la delegación) → ejecución automática = `No` con la razón en
   Observaciones, y entregar igualmente la matriz de cobertura con los artefactos hallados. **Nunca
   fabricar resultados.**

**Mapeo a la matriz.** Cada entrada `suites[]` de `test-run.json` trae `type` (`unit`/`coverage`/
`integration`/`e2e`) y `result` (`PASS`/`FAIL`/`SKIPPED`/`N/A`). La suite **`coverage` no se mapea a ningún
criterio**: es cobertura de líneas/ramas, una métrica del repo que juzga `quality-check`, no cobertura
funcional; si viene en `FAIL`, mencionarlo en Observaciones generales del reporte y nada más. Traducir al reporte: `PASS`→`Paso`,
`FAIL`→`Fallo`, `SKIPPED`→`No ejecutado`, `N/A` (el repo no tiene esa suite)→`No ejecutado`, dejando en
Observaciones que esa clase de prueba no existe en el repo. Un criterio cuya prueba asociada dio `FAIL` se
reporta **No cubierto** con el fallo en Observaciones (ver «Estados de cobertura»). La columna
`Automática` sigue combinando la intención del TC (Paso 2) con lo hallado; el **resultado** proviene de
`test-run.json`.

> **Granularidad suite vs. criterio:** `result` es por **suite completa**, no por test individual. Si
> varios criterios mapean a tests dentro de la misma suite y esa suite da `FAIL`, no propagar `Fallo`/`No
> cubierto` a todos ellos sin más: si el `summary` u otro detalle de `quality-check` permite aislar qué test
> falló, marcar solo ese criterio; si no hay forma de aislarlo, marcar los criterios afectados como
> `Parcial` (no `No cubierto`) con la ambigüedad explicada en Observaciones. Detalle completo en
> `references/flow.md` (Paso 4).

> Si el proyecto no usa `quality-check` (no está disponible en la sesión), degradar con elegancia: reportar
> ejecución automática = `No` («ejecución delegada no disponible») y entregar la cobertura estática. No
> reintroducir un runner propio en `trace-validate`.

---

## Cuándo bloquear

Parar y reportar (sin generar reporte parcial) cuando:

- El trabajo no existe o no se encuentra su documento de criterios.
- No hay sección de criterios de aceptación, está vacía, o los criterios **no tienen identificador codificado** (el formato es indiferente; lo que no puede faltar es el identificador): no hay nada que trazar de forma trazable; sugerir alinear el trabajo con su skill de definición/planificación antes de validar (para un `FT-XXX`, completar su especificación con el flujo «Analizar legado» de `work-research`).

> **No bloquear** por que el artefacto no siga las convenciones del plugin: identificadores fuera del formato `AC-XXX`, ubicación fuera de `docs/specs/` o ausencia de campo `Estado:` **no** son motivos de bloqueo.

```
WARNING No es posible generar el reporte de trazabilidad:
- <razón concreta>
- <acción sugerida: p. ej. definir los criterios de aceptación del trabajo antes de validar>
```

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Work item | `docs/specs/work-items/WI-XXX-[kebab]/README.md` |
| Feature (funcionalidad ya implementada) | `docs/specs/features/FT-XXX-[slug]/README.md` |
| Cualquier otro artefacto | La ruta que indique el usuario |
| Casos de prueba documentados (entrada, los produce `test-define`) | `test-cases/` **dentro de la carpeta del artefacto**, con su índice `test-cases/README.md` |
| Caché de corrida de pruebas (entrada, la produce `quality-check`) | `docs/specs/test-run.json` (ubicación fija, no por unidad) |
| Reporte de trazabilidad (salida) | US: `…/US-XXX-[nombre-corto]/trace-report.md` · WI: `docs/specs/work-items/WI-XXX-[kebab]/trace-report.md` · FT: `docs/specs/features/FT-XXX-[slug]/trace-report.md` · otro artefacto: `trace-report.md` **junto al artefacto** (confirmar la ruta con el usuario antes de escribir) |

---

## Mensaje al usuario

Solo el veredicto, el resumen de cobertura y lo que el usuario debe saber o decidir (criterios `No cubierto`/`Parcial`, pruebas que fallaron, si no se pudo ejecutar y por qué). No narrar el trabajo en curso («leí el README», «creé el archivo») ni el razonamiento interno. Listar pendientes en viñetas agrupadas por criterio.

---

## Veredicto

| Veredicto | Cuándo aplicarlo |
|-----------|------------------|
| **✅ Aprobado** | **Todos** los criterios del trabajo en estado **Cubierto** y, si se ejecutaron pruebas automáticas, **todas pasaron**. |
| **⚠️ Aprobado con observaciones** | **Ningún** criterio en `No cubierto`, pero hay caveats que el usuario debe conocer: algún criterio en **Parcial**, cobertura apoyada en TCs `Manual` (aunque sea por diseño), o pruebas que **no se pudieron ejecutar** y por tanto no confirman nada. Enumerar cada caveat. |
| **❌ Rechazado** | Al menos un criterio en **No cubierto**, o una prueba asociada **falló** de forma aislable. Listar los criterios faltantes/fallidos. |

Precedencia: `❌ Rechazado` > `⚠️ Aprobado con observaciones` > `✅ Aprobado`. Es decir, `✅ Aprobado` exige **cero caveats**: si hay alguno (criterio `Parcial`, cobertura apoyada en TCs `Manual`, pruebas no ejecutadas), el veredicto es `⚠️`, no `✅`.

> **En el cierre, este `⚠️` no bloquea** (a diferencia del `⚠️ Incompleto` de `quality-check` y `code-review`, que sí): `work-integrate` y `pr-create` continúan mostrando las observaciones al usuario. Por eso cada caveat debe quedar enumerado y ser legible por sí solo — es lo único que el usuario verá antes de integrar.

---

## Handoffs del ciclo

Posición: **validación / cierre de calidad** — después de `work-implement`.

| | |
|--|--|
| **Entrada** | Trabajo (`US-XXX` / `WI-XXX`, u otro artefacto) con **criterios de aceptación identificados**; código implementado; idealmente tests escritos por `quality-specialist` en el cierre de `work-implement`. Resultados de pruebas **vía `quality-check`** (caché `test-run.json` o delegación `tests-only`). **O** un `FT-XXX` (registro de funcionalidad ya implementada — inferida de código legacy o documentada como existente) para comprobar si está cubierta por pruebas. |
| **Salida** | `trace-report.md` en la ubicación del tipo + veredicto sobre la cobertura. |
| **Veredicto ❌ Rechazado (US/WI)** | Volver a `work-implement` (fase de pruebas con `quality-specialist`) para cubrir los criterios faltantes; revalidar después. |
| **Veredicto ❌ Rechazado (FT)** | Hay comportamiento ya implementado **sin pruebas**: escribir los tests faltantes sobre el código existente (no código funcional) con `work-implement` en su tipo **feature** —que automatiza los `TC-XXX` del `FT-XXX`— y revalidar. Formalizar ese trabajo como una tarea de mantenimiento (`WI-XXX`) es opcional y lo decide el usuario. |
| **Falta funcional en el trabajo** | Si la matriz revela que un criterio no es testeable o está mal definido, escalar a la definición/planificación del trabajo — para un `FT`, a quien lo registró (el flujo «Analizar legado» de `work-research` u otra fuente de la funcionalidad); no editar la especificación desde aquí. |

---

## Mapa de referencias

| Archivo | Cuándo leerlo |
|---------|---------------|
| `references/flow.md` | Flujo paso a paso (Pasos 0-7), delegación de la ejecución de pruebas en `quality-check` (caché `test-run.json` / `tests-only`) y checklist completo. Leer antes de ejecutar el flujo. |
| `references/examples.md` | Ejemplos por tipo (US / WI, sin criterios, sin runner, criterio sin prueba) y anti-patrones. Leer ante dudas de comportamiento. |
| `assets/trace-report-template.md` | Plantilla canónica del reporte de trazabilidad. Leer antes de redactar el reporte. |
