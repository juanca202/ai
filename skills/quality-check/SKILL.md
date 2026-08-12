---
name: quality-check
description: >-
  Ejecutar sobre todo el repositorio las verificaciones automatizadas que exige el stack —tipado, linter, pruebas unitarias, cobertura, integración, compilación, e2e y análisis estático (Sonar)— y emitir un veredicto (aprobado/rechazado/incompleto) con informe por check, detalle de fallos y próximas acciones. Produce la caché de corrida test-run.json que consume trace-validate. No exige artefactos de este plugin: corre sobre cualquier repositorio y delega las correcciones en work-implement. Activar cuando el usuario pida correr las pruebas o las verificaciones: "ejecuta los checks", "corre los tests", "quality check", "pasa el linter y el build", "valida antes del PR/merge", "¿está verde el repo?", o cuando lo invoque otro skill (work-integrate, pr-create, trace-validate). Proceso de cierre, no proactivo durante el desarrollo. Nunca corrige por iniciativa propia — ante fallos pregunta. La revisión cualitativa de diseño y arquitectura es de code-review.
license: MIT
---

# Skill: Verificaciones automatizadas de calidad

Ejecuta la **batería de checks automatizados** que el stack exige (tipado, linter, unit tests, cobertura, integración, build, e2e, sonar), adaptada al **stack detectado**, y emite un **veredicto** con su informe.

> **Alcance: solo el plano automatizado.** Este skill responde a «¿el código corre y cumple las reglas?». La pregunta «¿resuelve el problema correcto y está bien diseñado?» es del skill **[`code-review`](../code-review/SKILL.md)** (revisión cualitativa). Y «¿cada criterio de aceptación está probado?» es de **`trace-validate`**. Son **tres skills independientes**, cada uno con su veredicto e informe; quien los encadena es el orquestador de cierre (`work-integrate`, `pr-create`). Ver [Relación con otros skills](#relación-con-otros-skills).
>
> **Audita, no arregla.** **Nunca corrige por iniciativa propia**; aplica correcciones **solo si el usuario lo autoriza explícitamente** y, tras corregir, **vuelve a ejecutar**. Fuera de un ciclo de implementación, **entregar solo el informe es un resultado válido y frecuente**: se pregunta antes de tocar código (ver [Corrección de fallos](#corrección-de-fallos)). No edita configuración, no instala dependencias ni hace commit/push/merge sin instrucción explícita.
>
> **Proceso iterativo:** toda corrección reinicia la corrida completa hasta un veredicto estable.
>
> **Entrada mínima:** la raíz de un repositorio reconocible (ver [`references/stacks.md`](references/stacks.md)). Si no se detecta stack, parar y avisar. **No se exige ningún artefacto del plugin**: el repo puede no tener `docs/specs/`, ni `US-XXX`, ni convención de ramas — la corrida y el veredicto son idénticos. Ver [Artefactos externos al plugin](#artefactos-externos-al-plugin).

---

## Alcance del informe

La corrida de este skill cubre **todo el repositorio** en el estado actual de la rama. Es inherente a lo que hace: `tsc`, el linter, la suite de pruebas y el build **operan sobre el proyecto completo**, y esa es justamente la señal que se busca. Una regresión provocada por el cambio en un archivo que nadie editó en esta rama solo aparece corriendo la batería entera.

Consecuencias prácticas:

- **Un FAIL puede no venir del trabajo en curso.** Un test que ya estaba roto antes de esta rama saldrá igual. **No atribuirlo automáticamente al cambio reciente.** Si la rama base es resoluble sin esfuerzo, se puede contrastar el archivo del fallo con `git diff --name-only <base>` (rango que incluye lo sin commitear) y anotar en el detalle del check que el fallo **parece preexistente**; si no lo es, no especular. En cualquier caso, la decisión de corregirlo aquí o sacarlo a un `WI-XXX` aparte es del usuario.
- **No acotar la corrida a los archivos que cambiaron.** Filtrar los tests por archivos tocados falsearía el resultado y anularía el valor de la puerta. Los modificadores (`only <check>`, `no-tests`…) acotan **qué checks se ejecutan**, nunca sobre qué parte del código; no existe forma de acotar el universo de archivos, y es deliberado.
- **Excepción monorepo:** si el repo tiene varios módulos, «todo el repositorio» significa **todo el módulo elegido** — la selección del módulo la resuelve el Paso 1 (ver [`references/stacks.md`](references/stacks.md#detección-de-ecosistema)), preguntando si hay ambigüedad. No se auditan todos los módulos salvo petición explícita.
- **El informe vive en `docs/audits/`, no en la carpeta de una US/WI**, porque la corrida es de la rama consolidada y puede abarcar varios trabajos. (En modo `tests-only` no hay informe: el único artefacto es `test-run.json`.) Ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate).

---

## Mapa de referencias

Carga cada archivo **solo cuando lo necesites** (rutas relativas a la raíz del skill):

| Archivo | Qué contiene | Cuándo leerlo |
|---------|--------------|---------------|
| [`references/execution.md`](references/execution.md) | Flujo de ejecución paso a paso (Pasos 1–5), formato del informe, caché de pruebas, manejo de errores y anti-patterns. | Al **iniciar** la ejecución y ante cualquier situación atípica. |
| [`references/stacks.md`](references/stacks.md) | Detección de ecosistema, categoría de cada check por stack, comandos y parseo por herramienta. | En el Paso 1, **una vez identificado** el stack (no antes). |
| [`assets/quality-check-template.md`](assets/quality-check-template.md) | Plantilla canónica del informe. | En el Paso 4, para rellenar el informe. |

---

## Cómo preguntar al usuario

Cuando este skill (o sus referencias) indique **preguntar, pedir o confirmar** algo —de forma señalada, si se corrigen los fallos o se entrega solo el informe— hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (opciones tappables), no como prosa libre. Reglas:

- Opciones cortas y mutuamente excluyentes (2-4 por pregunta).
- No repreguntar lo que ya esté respondido en la conversación.
- Presentar antes el reporte de lo que falló: el usuario decide con la información delante.
- Si el cliente no expone la herramienta, formular en prosa con las opciones enumeradas.

---

## Modelo de aplicabilidad y veredicto

Todo check pertenece a **una** de estas tres categorías (sin solape).

| Categoría | Cuándo se ejecuta | Si FALLA | Si no se puede ejecutar |
|-----------|-------------------|----------|--------------------------|
| **Bloqueante** | Siempre (el stack lo exige). | `❌ Rechazado` | Herramienta/config ausente → `SKIPPED` → `⚠️ Incompleto` |
| **Condicional** | Solo si hay config o herramienta del check presente. | `❌ Rechazado` | Config presente pero binario/tarea rota → `SKIPPED` → `⚠️ Incompleto`. Sin config **ni** herramienta → `N/A` (no afecta veredicto). |
| **Informativo** | Si hay config presente. | No afecta veredicto (FAIL informativo). | `N/A` o `SKIPPED` → no afecta veredicto. |

### SKIPPED vs N/A (definición tajante)

- **`N/A`** = el check **no corresponde** a este repo: ni aplica al stack, ni existe config/herramienta/script. No cuenta para el veredicto (se omite o se marca `— N/A`).
- **`SKIPPED`** = el check **sí correspondía** (Bloqueante, o Condicional con config presente) pero **no pudo ejecutarse** porque la herramienta o la config está ausente o rota. Cuenta como `⚠️ Incompleto`.

> Mnemónica: si el proyecto **declara** que algo debe correr y no corre → `SKIPPED` (Incompleto); si **nunca pidió** ese check → `N/A` (irrelevante).

### Veredicto

| Veredicto | Condición exacta |
|-----------|------------------|
| `✅ Aprobado` | **Cero** FAIL en checks Bloqueantes y Condicionales-presentes y **cero** `SKIPPED`. Informativos en cualquier estado. |
| `❌ Rechazado` | **Al menos un** Bloqueante o Condicional-presente en FAIL. (Tiene prioridad sobre Incompleto.) |
| `⚠️ Incompleto` | **Cero** FAIL, pero **al menos un** `SKIPPED` (Bloqueante, o Condicional con config rota). |

Precedencia: `❌ Rechazado` > `⚠️ Incompleto` > `✅ Aprobado`.

Además de los estados de check, el informe usa `⏸️ No ejecutado` para los checks que **sí correspondían** pero quedaron sin correr por el **fail-fast** del tipado. No es `N/A` (sí correspondían) ni `SKIPPED` (no hay problema de tooling): el veredicto ya está determinado por el FAIL que disparó el fail-fast, así que `⏸️` no lo altera.

> **Este veredicto cubre solo el plano automatizado.** No lo mezcles con el de `code-review` ni con el de `trace-validate`: cada skill emite el suyo y el orquestador (`work-integrate`, `pr-create`) exige **las tres** puertas en aprobado antes de integrar o crear el PR.
>
> **Ojo con el símbolo `⚠️` en el cierre:** aquí (y en `code-review`) `⚠️ Incompleto` **bloquea**; en `trace-validate`, `⚠️ Aprobado con observaciones` **no bloquea** (se muestran las observaciones y se continúa). Mismo símbolo, efecto de compuerta opuesto — no asumir equivalencia al leer los tres informes juntos.

---

## Catálogo de checks

Checks canónicos en **orden de ejecución**. La categoría real depende del stack — ver [`references/stacks.md`](references/stacks.md#aplicabilidad-por-stack).

| # | Check | Categoría base | Política |
|---|-------|----------------|----------|
| 1 | Tipado | Bloqueante o Condicional según stack | **Fail-fast**: si aplica y falla, no se ejecuta nada más. |
| 2 | Linter | Bloqueante o Condicional según stack | Bloquea solo si hay severidad `error`. `warning` = informativo (salvo `include-linter-warnings`). |
| 3 | Pruebas unitarias | Bloqueante | FAIL si exit ≠ 0 o algún test falla. |
| 4 | Cobertura | Bloqueante **si el proyecto tiene tooling de cobertura**; `N/A` si no lo tiene en absoluto | PASS si exit 0 **y** (sin umbrales configurados **o** umbrales cumplidos). FAIL si exit ≠ 0 **o** umbral configurado incumplido. |
| 5 | Pruebas de integración | Condicional | Solo si el stack/repo distingue una suite de integración separada de la unitaria (script, tarea, perfil o carpeta dedicada). Si no la distingue → `N/A`; **no** inventar una suite que el repo no tiene. |
| 6 | Compilación | Bloqueante (Condicional en Python sin empaquetado) | FAIL si exit ≠ 0. En stacks compilados (Java, Go, Rust, .NET) cubre la compilación. Prerrequisito habitual de e2e. |
| 7 | E2E | Condicional | Se ejecuta sobre el artefacto ya compilado. |
| 8 | Análisis estático (Sonar) | Informativo | Nunca bloquea. |

El orden sigue la pirámide de tests (*rápido → lento*, *dependencias antes que consumidores*): estático (tipado/linter) → unit+coverage → integración → build → e2e → sonar. El fail-fast solo aplica al tipado, para evitar ruido en cascada. Justificación detallada en [`references/execution.md`](references/execution.md#paso-2--ejecutar-los-checks).

> **Cobertura sin tooling — no es un callejón sin salida.** Si el repo **no tiene ninguna herramienta ni configuración** de cobertura, el check es `N/A` (el proyecto nunca lo pidió), no `SKIPPED`: aplica la mnemónica de [SKIPPED vs N/A](#skipped-vs-na-definición-tajante) y el veredicto no queda condenado a `⚠️ Incompleto` de forma permanente. En ese caso, **señalarlo en Próximas acciones** como recomendación (configurar cobertura), sin bloquear. En cuanto exista config o herramienta, el check vuelve a ser Bloqueante y su ausencia de ejecución sí es `SKIPPED`.

> **Cuatro de estos checks alimentan la caché de pruebas** (`unit`, `coverage`, `integration`, `e2e`) que consume `trace-validate` — ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate). Tipado, linter, build y sonar no producen suites.

---

## Detección de stack y resolución por stack

El **detalle por ecosistema** vive en [`references/stacks.md`](references/stacks.md), que se carga **solo durante el Paso 1**:

1. Inspeccionar la raíz e identificar el ecosistema por manifiesto (`package.json`, `pom.xml`, `build.gradle`, `pyproject.toml`/`requirements.txt`, `go.mod`, `Cargo.toml`, `*.sln`/`*.csproj`, `composer.json`).
2. **Una vez identificado el stack**, abrir `references/stacks.md` y usar únicamente la **categoría**, el **comando** y el **parseo** de ese stack — no antes (no arrastres columnas que no aplican).
3. **Monorepo** ambiguo o **stack no detectable**: parar y preguntar.

---

## Modificadores de invocación

Las **claves** de los modificadores son siempre en inglés (estándar). Si el usuario no especifica ninguno, asumir `default`. El usuario puede nombrarlos en español; mapéalos a la clave en inglés.

| Modifier | Efecto exacto |
|----------|----------------|
| `default` | Todos los Bloqueantes, los Condicionales-presentes y el Informativo (Sonar) si hay config. |
| `blocking-only` | Omitir los **Informativos** (hoy solo Sonar). No altera Bloqueantes ni Condicionales. *Coincide con `no-sonar` mientras Sonar sea el único informativo; se mantienen separados porque `blocking-only` seguirá aplicando si mañana hay más informativos.* **Ojo:** `code-review` también acepta `blocking-only`, pero allí significa «reportar solo hallazgos 🔴/🟠» — misma intención (quitar el ruido que no bloquea), efecto distinto en cada skill. |
| `no-sonar` | Omitir Sonar específicamente. |
| `include-linter-warnings` | Tratar los `warning` del linter como `error` (p. ej. `eslint --max-warnings=0`). |
| `include-eslint-warnings` | Alias de `include-linter-warnings` para Node. |
| `no-tests` | Omitir **los cuatro checks de pruebas**: unit, coverage, integración y e2e (→ `N/A`, no `SKIPPED`: lo pidió el usuario). |
| `no-unit-tests` / `no-integration` / `no-e2e` / `no-coverage` / `no-typecheck` | Omitir solo ese check (→ `N/A`). |
| `only <check>` | Ejecutar ÚNICAMENTE ese check (p. ej. `only build`); el resto → `N/A`. |
| `save-report` | **Además** del informe vigente `docs/audits/quality-check.md` (que siempre se escribe), guardar una copia con marca de tiempo en `docs/audits/quality-check-<YYYYMMDD-HHMMSS>.md` para conservar histórico. |
| `tests-only` | Ejecutar **solo los checks de ejecución de pruebas** (unit, coverage, integración y e2e; build solo si es prerrequisito de e2e); omitir tipado/linter/sonar. Pensado como **objetivo de delegación de `trace-validate`**: honra la caché de corrida de pruebas — si existe un `test-run.json` **fresco** (fingerprint coincide, ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate)) **reutiliza** ese resultado sin re-ejecutar; si no, ejecuta y escribe/actualiza la caché. **Modo no interactivo:** devuelve los resultados por suite y la ruta de `test-run.json` **sin** entrar al ciclo de corrección, **sin** emitir veredicto y **sin** escribir `quality-check.md` — su único artefacto es `test-run.json`. Si hay suites en FAIL, se reportan como tales; corregirlas es decisión del flujo que invocó, no de esta corrida. |

> Todo check omitido **por modificador del usuario** es `N/A`, nunca `SKIPPED`: una omisión solicitada no convierte el veredicto en Incompleto.

---

## Flujo de ejecución (resumen)

**Ninguna corrección se aplica sin autorización explícita del usuario**; tras corregir, verifica el arreglo y reinicia. El detalle paso a paso, el formato del informe, el manejo de errores y los anti-patterns están en **[`references/execution.md`](references/execution.md)** — léelo al iniciar la ejecución.

1. **Detectar entorno:** identificar stack, cargar `references/stacks.md`, resolver comandos, capturar metadata y calcular el fingerprint.
2. **Ejecutar los checks** secuencialmente según el catálogo.
3. **Evaluar el resultado y el veredicto** con la tabla de [Veredicto](#veredicto). Si hay FAIL, mostrar el reporte y **preguntar** qué hacer; nunca corregir sin autorización. Dentro de una implementación, la pregunta es si se corrige; **fuera de una implementación**, ofrecer además la salida **«solo el informe»**. Si el usuario autoriza corregir y la rama tiene un artefacto identificable (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin), la corrección se **delega en `work-implement`**; solo si no hay artefacto de ningún tipo se aplica aquí — ver [Corrección de fallos](#corrección-de-fallos).
4. **Construir informe:** rellenar [`assets/quality-check-template.md`](assets/quality-check-template.md).
5. **Registro y salida:** escribir siempre el informe en `docs/audits/quality-check.md` y la caché en `.sdd-devkit/test-run.json` (creando los directorios si no existen), más un resumen en el chat. **Excepción `tests-only`:** no hay informe ni veredicto; el único artefacto es `test-run.json`. **No** hacer commit/push/merge sin instrucción explícita.

> **Tras cualquier corrección, el código cambió: recalcular el fingerprint** (Paso 1) antes de escribir la caché. Escribir un `test-run.json` con el fingerprint previo lo vuelve falso — afirmaría corresponder a un estado del código que ya no existe.

---

## Corrección de fallos

Todo hallazgo que implique **modificar código** —un check en FAIL o una prueba en rojo— se **propone**, nunca se aplica por iniciativa propia. Antes de tocar nada hay que resolver dos cosas, en este orden:

### 1. ¿Se corrige o se entrega solo el informe?

Depende del **contexto de ejecución**:

| Contexto | Qué hacer |
|----------|-----------|
| **Dentro de una implementación** — hay un **trabajo en curso** al que atribuir la rama: un artefacto del plugin (`US-XXX`, `WI-XXX`, o `FT-XXX`/`TC-XXX` sobre rama `test/`) **o un artefacto externo** (ticket, spec suelto) que el usuario o la rama señalen. **No se exige carpeta ni `progress.md`** (cierre vía `work-integrate` / `pr-create`) | Mostrar el reporte y **preguntar si se corrige**. Es el flujo normal del cierre: corregir es lo esperado, pero sigue requiriendo autorización. |
| **Fuera de una implementación** — corrida suelta sobre un repo, rama sin artefacto derivable, auditoría puntual, revisión exploratoria | **Preguntar explícitamente qué quiere el usuario**, con dos opciones: **[Corregir los hallazgos]** o **[Solo el informe, detener aquí]**. **No asumir que hay que corregir.** Quien pide una verificación fuera de un ciclo de implementación muchas veces solo quiere el diagnóstico. |

La pregunta va por la **herramienta de preguntas estructuradas** del cliente (opciones tappables); si el cliente no la expone, formularla en prosa con las opciones enumeradas. Reglas:

- **Preguntar una sola vez por corrida**, presentando antes el reporte completo de lo que falló, para que el usuario decida con la información delante.
- Si el usuario elige **Solo el informe** → construir el informe (Paso 4), emitir el veredicto que corresponda (`❌ Rechazado` si hay FAIL) y **terminar**. No tocar código, no reiniciar la corrida, no insistir. Dejar en Próximas acciones qué habría que corregir.
- Si el usuario elige **Corregir** → seguir con el punto 2.
- El usuario puede acotar el alcance («corrige solo el linter, el test lo veo yo»): respetarlo y tratar el resto como *solo informe*.

### 2. ¿Quién aplica la corrección?

Solo si el usuario autorizó corregir. Depende de si hay un **artefacto de trabajo en curso**:

| Situación | Quién corrige |
|-----------|---------------|
| La rama corresponde a un **artefacto de trabajo identificable**: una **historia de usuario (`US-XXX`)**, un **work item (`WI-XXX`)** o una **automatización de pruebas** (`FT-XXX` / `TC-XXX` sobre rama `test/`) | **Delegar en `work-implement`** sobre ese mismo artefacto: es el skill que escribe código y ya conoce el contexto, las convenciones y el `progress.md` del trabajo. |
| El trabajo de la rama está descrito por un **artefacto externo al plugin**: un ticket de un tracker, un spec suelto, un documento de otra herramienta o formato | **Delegar igual en `work-implement`**, pasándole la **ruta o referencia** del artefacto en vez de un ID del plugin. Ver [Artefactos externos al plugin](#artefactos-externos-al-plugin). |
| No hay artefacto de ningún tipo (rama suelta sin prefijo ni ID, sin documento de referencia, o el artefacto no se resuelve con certeza) | **No delegar.** Aplicar aquí la corrección mínima autorizada. |

**Cómo resolver el artefacto:** del **prefijo de rama + identificador** y de la existencia de su carpeta con `progress.md`:

| Rama | Artefacto | Carpeta |
|------|-----------|---------|
| `feature/US-042-…` | `US-042` | `docs/specs/user-stories/US-042-…/` |
| `fix/`\|`chore/`\|`refactor/` + `WI-007-…` | `WI-007` | `docs/specs/work-items/WI-007-…/` |
| `test/FT-003-…` | `FT-003` | `docs/specs/features/FT-003-…/` |
| `test/US-042-…` \| `test/WI-018-…` | los `TC-XXX` de ese padre | la carpeta de la US o el WI |
| Otro prefijo o convención (`PROJ-1234`, `ticket/…`, ruta a un spec) | el artefacto externo | la que indique el usuario, o ninguna |

> **Una rama `test/` NO es una rama suelta.** Nace en `work-implement` (`references/test-cases.md`, Paso 1) siempre asociada a un artefacto padre y con su `progress.md`, y `work-integrate` la trata como trabajo integrable de pleno derecho. Se resuelve con el mismo mecanismo que `feature/` o `fix/`. Ahí el fallo típico es **una prueba en rojo**, y el skill que sabe escribir esa prueba es `work-implement` (tipos `TC-XXX` / `FT-XXX`) — delegar es especialmente importante en este caso, no la excepción.

Si no se resuelve un artefacto del plugin, **comprobar antes si hay uno externo** (ver [Artefactos externos al plugin](#artefactos-externos-al-plugin)); solo si tampoco lo hay, **no hay artefacto**: no delegar ni inventarlo. Si hay ambigüedad (varios candidatos), preguntar al usuario antes de delegar. Esta es también la señal que distingue los dos contextos del punto 1.

**Qué se le pasa a `work-implement`** al delegar: el artefacto en curso (`US-XXX` / `WI-XXX` / `FT-XXX` / `TC-XXX`), el check que falló, el comando exacto, la salida de error relevante y los archivos implicados. La corrección se atribuye a ese artefacto y se anota en su `progress.md` como nota de retrabajo; `work-implement` aplica su propio criterio en su [Modo corrección](../work-implement/SKILL.md#modo-correccion-delegado-desde-quality-check) — un modo acotado, sin ritmo por unidad y sin exigir `Estado: Ready` ni working tree limpio.

**Aplica igual a fallos de pruebas** (unit, integración, e2e) que a fallos de tipado, linter o build: en ambos casos hay que escribir o ajustar código, que es justo lo que hace `work-implement`.

> **En ramas `test/`, no presuponer que el fallo está en la prueba.** Una prueba en rojo ahí puede significar que la prueba está mal **o** que hay una discrepancia real entre el `TC-XXX` y el comportamiento del código. Esa decisión no la toma este skill: se delega en `work-implement`, que aplica su criterio para los tipos `TC-XXX` / `FT-XXX` (parar, presentar la evidencia y decidir con el usuario si se corrige producción, si se corrige la prueba, o si vuelve a `test-define`). **Nunca relajar una aserción para forzar el verde.**

**Tras la delegación**, este skill retoma el control: **verifica que el arreglo funciona** re-ejecutando el check o la prueba que fallaba y, solo si pasa, **recalcula el fingerprint** y **reinicia la corrida completa** (Paso 2). Si el arreglo no resuelve el fallo, seguir iterando antes de reiniciar.

**Si `work-implement` devuelve «corrección no aplicada»**, la iteración **se detiene ahí**. Ese resultado significa que el arreglo excedía su alcance acotado, que hay una discrepancia de especificación, o que el fallo es preexistente — y viene con el motivo y el skill al que se escaló (`work-plan` / `test-define`). En ese caso: **no reintentar la delegación sobre ese mismo fallo** ni corregirlo aquí como sustituto. Construir el informe (Paso 4) recogiendo el motivo y el escalado en **Próximas acciones**, emitir **`❌ Rechazado`** y terminar. El cierre queda bloqueado hasta que el escalado se resuelva — que es el resultado correcto, no un flujo incompleto.

> **Límites.** La delegación **no** convierte a este skill en implementador: no decide el diseño de la corrección ni escribe código por su cuenta cuando delega. Y **nunca** delega sin autorización explícita del usuario — la delegación es *cómo* se corrige, no *si* se corrige.

### Artefactos externos al plugin

**Este skill no exige que el trabajo esté especificado con los artefactos del plugin.** Su entrada mínima es la raíz de un repositorio reconocible: la batería de checks corre igual sobre un repo sin `docs/specs/`, sin `US-XXX`, sin `progress.md` y sin convención de ramas. La ausencia de artefacto **no degrada el veredicto ni el informe** — solo cambia a quién se atribuye una corrección.

Es el mismo contrato que ya aplican [`test-define`](../test-define/SKILL.md) y [`trace-validate`](../trace-validate/SKILL.md): el artefacto puede ser una US/WI/FT del repo **o cualquier otro documento de especificación**, sea cual sea su origen, herramienta o formato — un ticket de un tracker (`PROJ-1234`), un spec suelto en el repo, un documento externo cuya ruta indique el usuario.

Cuando el trabajo está descrito por un artefacto externo y el usuario autoriza corregir:

- **Se delega igual en `work-implement`.** La regla «quien escribe código es `work-implement`» no tiene excepción por el origen del artefacto.
- **Se le pasa la referencia que exista** —ruta del documento, ID del ticket, o la descripción del trabajo si es lo único disponible— en lugar de un identificador del plugin, junto con el check que falló, el comando, la salida de error y los archivos implicados.
- **Sin `progress.md` no hay nota de retrabajo.** `work-implement` no inventa la carpeta ni el archivo: aplica la corrección acotada y **devuelve el resultado por respuesta**. Este skill recoge esa nota en el informe, en el detalle del check corregido.
- **El resto del contrato es idéntico:** alcance mínimo, autorización previa, verificación del arreglo, recálculo del fingerprint y reinicio de la corrida. Y sigue vigente el desenlace de [corrección no aplicada](../work-implement/SKILL.md#cuando-la-correccion-no-se-aplica).

> **Cuándo sí se corrige aquí:** solo cuando **no hay artefacto de ningún tipo** — ni del plugin ni externo — al que atribuir el cambio. No inventar un artefacto para poder delegar, ni tratar como «sin artefacto» un trabajo que el usuario sí puede señalar.

---

## Caché de corrida de pruebas (compartida con trace-validate)

Cuando este skill **ejecuta los checks de pruebas** (unit, coverage, integración, e2e), persiste el
resultado en un artefacto reutilizable `test-run.json`. Así `trace-validate` **no vuelve a correr las
pruebas**: si el código no cambió desde esta corrida, reutiliza estos resultados; si cambió, delega de
nuevo en este skill.

> **Contexto de ejecución.** Este skill es una **compuerta de cierre**: corre al integrar (`work-integrate`)
> o antes del PR (`pr-create`), sobre la rama **consolidada**, no por tarea ni durante la implementación.
> La caché se computa y se lee en ese checkout de cierre. Las pruebas acotadas que `work-implement` corre
> durante el desarrollo (a veces en **worktrees** aislados por subagente) son **otra cosa**: no producen
> este `test-run.json` ni sirven como caché. La **corrida completa y autoritativa** de la batería de
> pruebas ocurre aquí, en el cierre; este skill es el único productor de `test-run.json`.

**Ubicación fija — `.sdd-devkit/test-run.json`**, en la **raíz del repositorio**, **no** por unidad: como la
corrida es siempre **completa** sobre la rama consolidada, su caché no pertenece a ninguna `US`/`WI`. Vive
separada de `docs/` porque no es documentación sino un artefacto de máquina que consume `trace-validate`.
Se **sobrescribe** en cada corrida (es el estado vigente de la rama) y **se versiona** con el repo, para que
viaje en el PR y una corrida posterior pueda reutilizarla.

Se escribe **siempre**, exista o no `docs/specs/`: el consumidor es `trace-validate`, que también opera
sobre artefactos externos al plugin (ver [Artefactos externos al plugin](#artefactos-externos-al-plugin)).
Crear `.sdd-devkit/` si no existe. Solo si el usuario pide explícitamente no crear ese directorio (o el repo
lo tiene ignorado en `.gitignore`, en cuyo caso no viajaría en el PR), entregar los resultados en la
respuesta y advertir que no habrá reutilización entre corridas. La misma excepción aplica a `docs/audits/`.

**Fingerprint canónico del estado del código** — clave de frescura compartida entre los **dos skills que
cachean**: este y `trace-validate`. (`code-review` no calcula fingerprint ni tiene caché: siempre revisa
el diff de nuevo; solo aparece porque su informe está en la lista de exclusiones.) Hash reproducible del commit + working tree + cambios
sin commitear, **excluyendo los artefactos generados** —todo `docs/audits/`, todo `.sdd-devkit/` y los
`trace-report.md` de cada trabajo— para que escribirlos no desplace la clave:

```bash
FINGERPRINT=$( { git rev-parse HEAD; \
  git status --porcelain -- ':(top,exclude)docs/audits' ':(top,exclude).sdd-devkit' ':(exclude,glob)**/trace-report.md'; \
  git diff HEAD          -- ':(top,exclude)docs/audits' ':(top,exclude).sdd-devkit' ':(exclude,glob)**/trace-report.md'; \
} | git hash-object --stdin )
```

Cubre todo lo relevante (código fuente, specs/criterios, tests); no cubre el **contenido** de un archivo
que permanezca sin trackear, ni cambios de **entorno** (dependencias instaladas, red, servicios) que no
tocan el árbol. La caché es **fresca** si el `fingerprint` guardado coincide con el
recalculado ahora; si difiere, hubo cambios y es **obsoleta** (re-ejecutar).

> **Nombre único de la clave.** En todo el repo esta variable se llama `FINGERPRINT` y su valor persistido
> es `git.fingerprint`. No usar alias (`FP`, `HASH`) en ningún skill: el mismo valor debe ser reconocible
> a simple vista cuando un skill delega en otro.
>
> **La exclusión es por directorio, no por nombre de archivo.** `docs/audits` cubre el informe vigente
> (`quality-check.md`, `code-review.md`), las copias con marca de tiempo de `save-report` y **también los
> informes de `arch-audit`**; `.sdd-devkit` cubre `test-run.json`. Así ningún artefacto que produce la propia
> tubería puede desplazar la clave de frescura — correr `arch-audit` ya no invalida un `trace-report.md`. El
> único generado fuera de esos directorios es el `trace-report.md` de cada trabajo, que vive junto a su
> artefacto y por eso lleva su propio patrón.
>
> **La magia `top` no es opcional.** `:(top,exclude)` ancla el pathspec a la **raíz del repositorio**. Sin
> ella, git lo resolvería relativo al directorio de trabajo y, en un monorepo donde la corrida se lanza desde
> el módulo elegido, `docs/audits` se leería como `<módulo>/docs/audits` — el de la raíz dejaría de excluirse
> y escribir el informe invalidaría la caché en cada corrida. Excluir el directorio **sin** `glob` (`docs/audits`,
> no `docs/audits/**`) es igual de deliberado: cubre tanto los archivos de dentro como la entrada del propio
> directorio cuando aún no está trackeado, que es el caso en la primera corrida de un repo.

**Esquema `test-run.json`** (`schema: test-run/v1`) — **esta es la definición canónica y única**; los
consumidores la referencian, no la copian:

```json
{
  "schema": "test-run/v1",
  "generatedBy": "quality-check",
  "timestamp": "2026-07-17T10:20:00-05:00",
  "invokedFrom": "US-004-checkout",
  "git": { "branch": "feature/US-004-checkout", "commit": "abc1234", "workingTreeClean": true,
           "fingerprint": "<hash>" },
  "suites": [
    { "type": "unit",        "command": "npm test",              "result": "PASS", "summary": "48 passed" },
    { "type": "coverage",    "command": "npm run coverage",      "result": "PASS", "summary": "line 82%" },
    { "type": "integration", "command": "npm run test:it",       "result": "N/A",  "summary": "sin suite" },
    { "type": "e2e",         "command": "npx playwright test",   "result": "FAIL", "summary": "2 failed" }
  ]
}
```

Semántica de los campos:

- **`generatedBy`** — siempre `"quality-check"`. Un consumidor que lea otro valor debe **descartar la caché** y no reutilizarla: este skill es el único productor autorizado.
- **`timestamp`** — momento de la corrida, para reportar procedencia al usuario. No es clave de frescura (esa es `git.fingerprint`).
- **`invokedFrom`** — trabajo desde el que se invocó la corrida (`US-XXX-slug`, `WI-XXX-slug`) o `null` si no aplica. Es **informativo**: la corrida es de la **rama consolidada**, que puede incluir varios trabajos, así que **no** debe usarse para filtrar resultados ni para decidir si la caché aplica a otro trabajo.
- **`git.fingerprint`** — única clave de frescura. Debe corresponder al estado del código **realmente probado** (recalcular tras cualquier corrección).
- **`suites[].type`** — uno de `unit` · `coverage` · `integration` · `e2e`. Siempre se emiten las cuatro entradas; las que el repo no tiene van con `result: "N/A"`.
- **`suites[].result`** — `PASS` · `FAIL` · `SKIPPED` (correspondía pero no se pudo ejecutar) · `N/A` (no aplica al repo).

El detalle operativo (cuándo escribirla, cómo reutilizarla en `tests-only`) está en
[`references/execution.md`](references/execution.md#caché-de-corrida-de-pruebas).

---

## Notas

### Relación con otros skills

Usar este skill **solo cuando se le invoca explícitamente** (ni de forma proactiva, ni "por si acaso", ni al detectar que se terminó código):

- **El usuario lo pide explícitamente** — solicita correr las verificaciones o las pruebas, validar antes de PR/merge, o nombra este skill.
- **Otro skill lo invoca explícitamente**, p. ej. `work-integrate` o `pr-create`, que exigen `✅ Aprobado` **aquí y** en `code-review` antes de integrar o crear el PR.
- **`trace-validate` delega en este skill la ejecución de pruebas.** `trace-validate` no corre pruebas por sí mismo: reutiliza el `test-run.json` fresco de una corrida previa de este skill o, si no hay una fresca, invoca este skill en modo `tests-only` para producirlo. Este skill es la **única** autoridad que ejecuta la batería de pruebas del trabajo. Ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate).
- **`work-implement` recibe la delegación de las correcciones** cuando hay un artefacto de trabajo en curso (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin) y el usuario las autoriza. Ver [Corrección de fallos](#corrección-de-fallos).

**Las tres puertas del cierre.** `quality-check`, `code-review` y `trace-validate` son **hermanos e independientes**: ninguno invoca a otro para decidir su veredicto (la única invocación entre ellos es instrumental: `trace-validate` pide una corrida de pruebas a este skill). Cada uno responde una pregunta distinta y emite su propio veredicto:

| Skill | Pregunta | Qué juzga |
|-------|----------|-----------|
| **`quality-check`** | ¿El código corre y cumple las reglas? | Resultado de las herramientas + cobertura **cuantitativa** (líneas/ramas contra umbral). |
| **`code-review`** | ¿Resuelve el problema correcto y está bien diseñado? | Intención, arquitectura y diseño del diff — incluida la **calidad** de las pruebas escritas, no su ejecución. |
| **`trace-validate`** | ¿Cada criterio de aceptación está probado? | Cobertura **funcional**: criterio ↔ caso de prueba ↔ artefacto. |

> **«Cobertura» significa dos cosas distintas en este cierre:** aquí es la métrica de líneas/ramas de un check; en `trace-validate` es el estado de un criterio de aceptación (`Cubierto`/`Parcial`/`No cubierto`). Un repo puede tener 95 % de líneas y un criterio sin probar, o al revés. Ambas bloquean, pero por motivos distintos; no usar una para justificar la otra.

El orden recomendado en el cierre es `quality-check` → `code-review` → `trace-validate`: los dos primeros porque revisar diseño sobre código que ni compila suele ser trabajo perdido; el tercero **después de este skill** para que reutilice el `test-run.json` sin re-ejecutar pruebas. Es una recomendación del orquestador, no una dependencia dura, y el usuario puede pedir solo uno de los tres.

Es un proceso **posterior a la implementación**: no forma parte del desarrollo de tareas. Sin invocación explícita, no corresponde usarlo. (Que `work-implement` reciba una delegación de corrección **desde** este skill no invierte la relación: sigue siendo el cierre quien decide cuándo se ejecuta.)

### Resolución de idioma

El idioma del informe se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

Los mensajes de error de las herramientas no se traducen.
