---
name: quality-check
description: 'Ejecutar las verificaciones automatizadas de calidad que exige el stack del repositorio —tipado, linter, pruebas unitarias, cobertura, pruebas de integración, compilación, e2e y análisis estático (Sonar)— con categoría por check (Bloqueante/Condicional/Informativo), veredicto (aprobado/rechazado/incompleto) e informe con estado, detalle de fallos y próximas acciones. Produce además la caché de corrida de pruebas `test-run.json` que consume `trace-validate`. Usar SOLO cuando se invoca explícitamente: el usuario pide correr las pruebas o las verificaciones ("ejecuta los checks", "corre las pruebas", "quality check", "valida antes de PR/merge"), nombra el skill, o lo llama otro skill (p. ej. work-integrate, pr-create, trace-validate). Proceso posterior a la implementación: NO activarlo de forma proactiva ni durante el desarrollo. Nunca corrige por iniciativa propia: ante hallazgos que impliquen tocar código pregunta al usuario si corregir o entregar solo el informe —fuera de un ciclo de implementación, quedarse en el informe es un resultado válido—, y tras corregir vuelve a ejecutar. Para la revisión cualitativa de diseño y arquitectura, el skill es `code-review`.'
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
> **Entrada mínima:** la raíz de un repositorio reconocible (ver [`references/stacks.md`](references/stacks.md)). Si no se detecta stack, parar y avisar.

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
| `save-report` | Persistir el informe en `docs/quality-check/<YYYYMMDD-HHMMSS>.md`. |
| `tests-only` | Ejecutar **solo los checks de ejecución de pruebas** (unit, coverage, integración y e2e; build solo si es prerrequisito de e2e); omitir tipado/linter/sonar. Pensado como **objetivo de delegación de `trace-validate`**: honra la caché de corrida de pruebas — si existe un `test-run.json` **fresco** (fingerprint coincide, ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate)) **reutiliza** ese resultado sin re-ejecutar; si no, ejecuta y escribe/actualiza la caché. **Modo no interactivo:** devuelve los resultados por suite y la ruta de `test-run.json` **sin** entrar al ciclo de corrección, **sin** emitir veredicto y **sin** escribir `quality-check.md` — su único artefacto es `test-run.json`. Si hay suites en FAIL, se reportan como tales; corregirlas es decisión del flujo que invocó, no de esta corrida. |

> Todo check omitido **por modificador del usuario** es `N/A`, nunca `SKIPPED`: una omisión solicitada no convierte el veredicto en Incompleto.

---

## Flujo de ejecución (resumen)

**Ninguna corrección se aplica sin autorización explícita del usuario**; tras corregir, verifica el arreglo y reinicia. El detalle paso a paso, el formato del informe, el manejo de errores y los anti-patterns están en **[`references/execution.md`](references/execution.md)** — léelo al iniciar la ejecución.

1. **Detectar entorno:** identificar stack, cargar `references/stacks.md`, resolver comandos, capturar metadata y calcular el fingerprint.
2. **Ejecutar los checks** secuencialmente según el catálogo.
3. **Evaluar el resultado y el veredicto** con la tabla de [Veredicto](#veredicto). Si hay FAIL, mostrar el reporte y **preguntar** qué hacer; nunca corregir sin autorización. Dentro de una implementación, la pregunta es si se corrige; **fuera de una implementación**, ofrecer además la salida **«solo el informe»**. Si el usuario autoriza corregir y la rama es de un `US-XXX`/`WI-XXX`, la corrección se **delega en `work-implement`**; si no hay artefacto, se aplica aquí — ver [Corrección de fallos](#corrección-de-fallos).
4. **Construir informe:** rellenar [`assets/quality-check-template.md`](assets/quality-check-template.md).
5. **Registro y salida:** en proyectos con `docs/specs/`, escribir `docs/specs/quality-check.md` y la caché `docs/specs/test-run.json`; si no, mostrar en chat (o `save-report`). **Excepción `tests-only`:** no hay informe ni veredicto; el único artefacto es `test-run.json`. **No** hacer commit/push/merge sin instrucción explícita.

> **Tras cualquier corrección, el código cambió: recalcular el fingerprint** (Paso 1) antes de escribir la caché. Escribir un `test-run.json` con el fingerprint previo lo vuelve falso — afirmaría corresponder a un estado del código que ya no existe.

---

## Corrección de fallos

Todo hallazgo que implique **modificar código** —un check en FAIL o una prueba en rojo— se **propone**, nunca se aplica por iniciativa propia. Antes de tocar nada hay que resolver dos cosas, en este orden:

### 1. ¿Se corrige o se entrega solo el informe?

Depende del **contexto de ejecución**:

| Contexto | Qué hacer |
|----------|-----------|
| **Dentro de una implementación** — la rama corresponde a un `US-XXX` o `WI-XXX` en curso (cierre vía `work-integrate` / `pr-create`) | Mostrar el reporte y **preguntar si se corrige**. Es el flujo normal del cierre: corregir es lo esperado, pero sigue requiriendo autorización. |
| **Fuera de una implementación** — corrida suelta sobre un repo, rama sin artefacto, auditoría puntual, revisión exploratoria | **Preguntar explícitamente qué quiere el usuario**, con dos opciones: **[Corregir los hallazgos]** o **[Solo el informe, detener aquí]**. **No asumir que hay que corregir.** Quien pide una verificación fuera de un ciclo de implementación muchas veces solo quiere el diagnóstico. |

La pregunta va por la **herramienta de preguntas estructuradas** del cliente (opciones tappables); si el cliente no la expone, formularla en prosa con las opciones enumeradas. Reglas:

- **Preguntar una sola vez por corrida**, presentando antes el reporte completo de lo que falló, para que el usuario decida con la información delante.
- Si el usuario elige **Solo el informe** → construir el informe (Paso 4), emitir el veredicto que corresponda (`❌ Rechazado` si hay FAIL) y **terminar**. No tocar código, no reiniciar la corrida, no insistir. Dejar en Próximas acciones qué habría que corregir.
- Si el usuario elige **Corregir** → seguir con el punto 2.
- El usuario puede acotar el alcance («corrige solo el linter, el test lo veo yo»): respetarlo y tratar el resto como *solo informe*.

### 2. ¿Quién aplica la corrección?

Solo si el usuario autorizó corregir. Depende de si hay un **artefacto de trabajo en curso**:

| Situación | Quién corrige |
|-----------|---------------|
| La rama corresponde a una **historia de usuario (`US-XXX`)** o a un **work item (`WI-XXX`)** identificable | **Delegar en `work-implement`** sobre ese mismo artefacto: es el skill que escribe código y ya conoce el contexto, las convenciones y el `progress.md` del trabajo. |
| No hay artefacto identificable (rama suelta, `test/`, repo sin `docs/specs/`, o el artefacto no se resuelve con certeza) | **No delegar.** Aplicar aquí la corrección mínima autorizada. |

**Cómo resolver el artefacto:** del nombre de rama (`feature/US-042-…`, `fix/WI-007-…`) y de la existencia de su carpeta con `progress.md`. Si el identificador no aparece o la carpeta no existe, **no hay artefacto**: no delegar ni inventarlo. Si hay ambigüedad (varios candidatos), preguntar al usuario antes de delegar. Esta es también la señal que distingue los dos contextos del punto 1.

**Qué se le pasa a `work-implement`** al delegar: el artefacto en curso (`US-XXX` / `WI-XXX`), el check que falló, el comando exacto, la salida de error relevante y los archivos implicados. La corrección se atribuye a ese artefacto y se anota en su `progress.md` como nota de retrabajo; `work-implement` aplica su propio criterio en su [Modo corrección](../work-implement/SKILL.md#modo-correccion-delegado-desde-quality-check) — un modo acotado, sin ritmo por unidad y sin exigir `Estado: Ready` ni working tree limpio.

**Aplica igual a fallos de pruebas** (unit, integración, e2e) que a fallos de tipado, linter o build: en ambos casos hay que escribir o ajustar código, que es justo lo que hace `work-implement`.

**Tras la delegación**, este skill retoma el control: **verifica que el arreglo funciona** re-ejecutando el check o la prueba que fallaba y, solo si pasa, **recalcula el fingerprint** y **reinicia la corrida completa** (Paso 2). Si el arreglo no resuelve el fallo, seguir iterando antes de reiniciar.

> **Límites.** La delegación **no** convierte a este skill en implementador: no decide el diseño de la corrección ni escribe código por su cuenta cuando delega. Y **nunca** delega sin autorización explícita del usuario — la delegación es *cómo* se corrige, no *si* se corrige.

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

**Ubicación fija — `docs/specs/test-run.json`** (junto a `docs/specs/quality-check.md`), **no** por unidad:
como la corrida es siempre **completa** sobre la rama consolidada, sus artefactos residen
directamente en `docs/specs/`, sin importar desde qué `US`/`WI` se invocó. Se **sobrescribe** en cada
corrida (es el estado vigente de la rama).

Si el proyecto **no** usa `docs/specs/` (repo no spec-driven), no se escribe caché (no hay consumidor).

**Fingerprint canónico del estado del código** — clave de frescura compartida entre los **dos skills que
cachean**: este y `trace-validate`. (`code-review` no calcula fingerprint ni tiene caché: siempre revisa
el diff de nuevo; solo aparece porque su informe está en la lista de exclusiones.) Hash reproducible del commit + working tree + cambios
sin commitear, **excluyendo los artefactos generados** (`trace-report.md`, `quality-check.md`,
`code-review.md`, `test-run.json`) para que escribirlos no desplace la clave:

```bash
FINGERPRINT=$( { git rev-parse HEAD; \
  git status --porcelain -- ':(exclude,glob)**/trace-report.md' ':(exclude,glob)**/quality-check.md' ':(exclude,glob)**/code-review.md' ':(exclude,glob)**/test-run.json'; \
  git diff HEAD          -- ':(exclude,glob)**/trace-report.md' ':(exclude,glob)**/quality-check.md' ':(exclude,glob)**/code-review.md' ':(exclude,glob)**/test-run.json'; \
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
> **Los informes con marca de tiempo no se excluyen.** `save-report` escribe en `docs/quality-check/<timestamp>.md`
> (y `code-review` en `docs/code-review/<timestamp>.md`), rutas que **no** están en la lista de exclusión:
> generarlos desplaza el fingerprint. Es aceptable porque `save-report` es un modo explícito del usuario,
> no parte del cierre estándar — pero conviene saberlo antes de encadenarlo con `trace-validate`.

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
- **`work-implement` recibe la delegación de las correcciones** cuando hay un `US-XXX` o `WI-XXX` en curso y el usuario las autoriza. Ver [Corrección de fallos](#corrección-de-fallos).

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
