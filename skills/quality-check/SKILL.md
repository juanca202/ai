---
name: quality-check
description: >-
  Ejecutar sobre todo el repositorio las verificaciones automatizadas que exige el stack —tipado, linter, pruebas unitarias, cobertura, compilación, e2e, análisis estático (Sonar) y las suites de prueba que declare el estándar de testing del repo— y emitir un veredicto (aprobado/rechazado/incompleto) con informe por check, detalle de fallos y próximas acciones. Produce la caché de corrida test-run.json que consume trace-validate. No exige artefactos de este plugin: corre sobre cualquier repositorio y delega las correcciones en work-implement. Activar cuando el usuario pida correr las pruebas o las verificaciones: "ejecuta los checks", "corre los tests", "quality check", "pasa el linter y el build", "valida antes del PR/merge", "¿está verde el repo?", o cuando lo invoque otro skill (work-integrate, pr-create, trace-validate). Proceso de cierre, no proactivo durante el desarrollo. Por defecto pide confirmación antes de corregir un fallo; `.sdd-devkit/settings.json` (`verification.qualityCheck.confirmFix: "never"`) permite corregir directo sin preguntar. La revisión cualitativa de diseño y arquitectura es de code-review.
license: MIT
---

# Skill: Verificaciones automatizadas de calidad

Ejecuta la **batería de checks automatizados** que el stack exige (tipado, linter, unit tests, cobertura, build, e2e, sonar) más las **suites de prueba que declare el estándar de testing** del repo (integración, contrato, rendimiento…), adaptada al **stack detectado**, y emite un **veredicto** con su informe. Las únicas pruebas fijas son **unit, cobertura y e2e**; el resto del conjunto de pruebas lo define el estándar — ver [Suites de prueba](#suites-de-prueba-fijas-y-configuradas).

> **Alcance: solo el plano automatizado.** Este skill responde a «¿el código corre y cumple las reglas?». La pregunta «¿resuelve el problema correcto y está bien diseñado?» es del skill **[`code-review`](../code-review/SKILL.md)** (revisión cualitativa). Y «¿cada criterio de aceptación está probado?» es de **`trace-validate`**. Son **tres skills independientes**, cada uno con su veredicto e informe; quien los encadena es el orquestador de cierre (`work-integrate`, `pr-create`). Ver [Relación con otros skills](#relación-con-otros-skills).
>
> **Audita, no arregla (por defecto).** Aplica correcciones **solo si el usuario lo autoriza explícitamente** —o si `.sdd-devkit/settings.json` tiene `verification.qualityCheck.confirmFix: "never"` (ver [Política de corrección](#política-de-corrección))— y, tras corregir, **vuelve a ejecutar**. Fuera de un ciclo de implementación, **entregar solo el informe es un resultado válido y frecuente** con la política por defecto (`always`): se pregunta antes de tocar código (ver [Corrección de fallos](#corrección-de-fallos)). No edita configuración, no instala dependencias ni hace commit/push/merge sin instrucción explícita. (**Única excepción:** dejar su propia caché ignorada en el `.gitignore` —añadiendo esa línea, y creando el archivo si no existiera—, ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate).)
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
| [`references/execution.md`](references/execution.md) | Flujo de ejecución paso a paso (Pasos 1–5), formato del informe y correspondencia de etiquetas, caché de pruebas, manejo de errores y anti-patterns. | Al **iniciar** la ejecución y ante cualquier situación atípica. |
| [`references/stacks.md`](references/stacks.md) | Detección de ecosistema, categoría de cada check por stack, comandos y parseo por herramienta. | En el Paso 1, **una vez identificado** el stack (no antes). |
| [`assets/quality-check-template.md`](assets/quality-check-template.md) | Plantilla canónica del informe. | En el Paso 4, para rellenar el informe. |


### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`../../reference/language.md`](../../reference/language.md): **Idioma** — resolución obligatoria del idioma de artefactos y mensajes. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/asking.md`](../../reference/asking.md): **Preguntas** — mecanismo estructurado, ritmo, fallback. *Antes de la primera pregunta.*
- [`../../reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*
- [`../../reference/verification.md`](../../reference/verification.md): **Política de corrección** — si se pregunta antes de corregir un fallo o se corrige directo. *Lectura obligatoria antes de ejecutar el skill.*

---

## Cómo preguntar al usuario

Mecanismo, ritmo y fallback compartidos: [`../../reference/asking.md`](../../reference/asking.md).

Cada vez que este skill o sus referencias digan *preguntar*, *pedir*, *confirmar*, *validar* o *sugerir* algo al usuario, asume ese mecanismo; no se repite allí.

**Excepción al ritmo:** cuando aplica (ver [Política de corrección](#política-de-corrección)), la pregunta señalada de este skill —si se corrigen los fallos o se entrega solo el informe— va **después** de presentar el reporte de lo que falló: el usuario decide con la información delante.

---

## Política de corrección

Antes de ejecutar este skill, DEBES leer [`../../reference/verification.md`](../../reference/verification.md).

Las reglas de `verification.md` son obligatorias y determinan, vía `verification.qualityCheck.confirmFix`, si se pide confirmación antes de corregir un fallo (`always`, comportamiento por defecto) o si se corrige directamente sin preguntar (`never`). Ver [Corrección de fallos](#corrección-de-fallos).

No continúes hasta haber leído y aplicado `verification.md`.

---

## Vocabulario de veredictos y estados

Antes de redactar cualquier informe, DEBES leer [`../../reference/verdicts.md`](../../reference/verdicts.md).

Las reglas de `verdicts.md` son obligatorias: el valor canónico y el símbolo son estables, y la **etiqueta que lee la persona se redacta siempre en el idioma resuelto** por `language.md`. Ninguna etiqueta de este skill se fija en un idioma concreto.

No continúes hasta haber leído y aplicado `verdicts.md`.

---

## Modelo de aplicabilidad y veredicto

Todo check pertenece a **una** de estas tres categorías (sin solape). Los nombres de la columna «Categoría» son **valores canónicos**: en el informe se escribe su etiqueta en el idioma resuelto.

| Categoría (canónica) | Símbolo | Cuándo se ejecuta | Si FALLA | Si no se puede ejecutar |
|----------------------|---------|-------------------|----------|--------------------------|
| `BLOCKING` | — | Siempre (el stack lo exige). | `REJECTED` | Herramienta/config ausente → `SKIPPED` → `INCOMPLETE` |
| `CONDITIONAL` | — | Solo si hay config o herramienta del check presente. | `REJECTED` | Config presente pero binario/tarea rota → `SKIPPED` → `INCOMPLETE`. Sin config **ni** herramienta → `N/A` (no afecta veredicto). |
| `INFORMATIVE` | `ℹ️` | Si hay config presente. | No afecta veredicto (FAIL informativo). | `N/A` o `SKIPPED` → no afecta veredicto. |

### SKIPPED vs N/A (definición tajante)

- **`N/A`** = el check **no corresponde** a este repo: ni aplica al stack, ni existe config/herramienta/script. No cuenta para el veredicto (se omite, o se marca con el símbolo `—` y su etiqueta).
- **`SKIPPED`** = el check **sí correspondía** (Bloqueante, o Condicional con config presente) pero **no pudo ejecutarse** porque la herramienta o la config está ausente o rota. Cuenta como `INCOMPLETE`.

> Mnemónica: si el proyecto **declara** que algo debe correr y no corre → `SKIPPED` (`INCOMPLETE`); si **nunca pidió** ese check → `N/A` (irrelevante).

### Veredicto

| Veredicto (canónico) | Símbolo | Condición exacta |
|----------------------|---------|------------------|
| `APPROVED` | `✅` | **Cero** `FAIL` en checks `BLOCKING` y `CONDITIONAL`-presentes y **cero** `SKIPPED`. Informativos en cualquier estado. |
| `REJECTED` | `❌` | **Al menos un** `BLOCKING` o `CONDITIONAL`-presente en `FAIL`. (Tiene prioridad sobre `INCOMPLETE`.) |
| `INCOMPLETE` | `⚠️` | **Cero** `FAIL`, pero **al menos un** `SKIPPED` (`BLOCKING`, o `CONDITIONAL` con config rota). |

Precedencia: `REJECTED` > `INCOMPLETE` > `APPROVED`.

### Estados de check

| Estado (canónico) | Símbolo | Qué significa |
|-------------------|---------|---------------|
| `PASS` | `✅` | El check se ejecutó y salió limpio. |
| `FAIL` | `❌` | El check se ejecutó y no pasó. |
| `SKIPPED` | `⏭️` | Correspondía pero la herramienta o la config está ausente o rota → `INCOMPLETE`. |
| `PENDING` | `⏸️` | Correspondía y no llegó a ejecutarse porque el **fail-fast** del tipado cortó la corrida. Ni `SKIPPED` (no hay problema de tooling) ni `N/A` (sí correspondía); no altera el veredicto, que ya lo fijó el `FAIL` del tipado. |
| `N/A` | `—` | El repo nunca pidió ese check. No cuenta para el veredicto. |

> **Los valores canónicos no se traducen; las etiquetas del informe sí se redactan en el idioma resuelto.** `PASS`/`FAIL`/`SKIPPED`/`PENDING`/`N/A`, `BLOCKING`/`CONDITIONAL`/`INFORMATIVE` y `APPROVED`/`REJECTED`/`INCOMPLETE` son el vocabulario canónico de este documento, de `stacks.md` y —los cuatro primeros— del `result` de `test-run.json`. El informe lleva **símbolo + etiqueta en el idioma resuelto**, con la leyenda que los ata al inicio; ver [`../../reference/verdicts.md`](../../reference/verdicts.md) y [`references/execution.md` → Formato del informe](references/execution.md#formato-del-informe). Ojo con el solape de símbolos: `✅` como **estado de un check** es `PASS`, mientras que `✅` en la línea `Veredicto:` es `APPROVED`, del informe entero.

> **Este veredicto cubre solo el plano automatizado.** No lo mezcles con el de `code-review` ni con el de `trace-validate`: cada skill emite el suyo y el orquestador (`work-integrate`, `pr-create`) exige **las tres** puertas en aprobado antes de integrar o crear el PR. (Única salvedad: en un **PR de promoción** —`develop → master`—, `pr-create` solo exige esta puerta, porque cada trabajo ya pasó las tres al integrarse; ver [`pr-create`](../pr-create/SKILL.md#puertas-en-un-pr-de-promoción).)
>
> **Ojo con el símbolo `⚠️` en el cierre:** aquí (y en `code-review`) `⚠️` es `INCOMPLETE` y **bloquea**; en `trace-validate` es `APPROVED_WITH_NOTES` y **no bloquea** (se muestran las observaciones y se continúa). Mismo símbolo, efecto de compuerta opuesto — no asumir equivalencia al leer los tres informes juntos.

---

## Catálogo de checks

Checks canónicos en **orden de ejecución**. La categoría real depende del stack — ver [`references/stacks.md`](references/stacks.md#aplicabilidad-por-stack).

| # | Check | Categoría base | Política |
|---|-------|----------------|----------|
| 1 | Tipado | Bloqueante o Condicional según stack | **Fail-fast**: si aplica y falla, no se ejecuta nada más. |
| 2 | Linter | Bloqueante o Condicional según stack | Bloquea solo si hay severidad `error`. `warning` = informativo (salvo `include-linter-warnings`). |
| 3 | Pruebas unitarias — **suite fija** | Bloqueante | FAIL si exit ≠ 0 o algún test falla. |
| 4 | Cobertura — **suite fija** | Bloqueante **si el proyecto tiene tooling de cobertura**; `N/A` si no lo tiene en absoluto | PASS si exit 0 **y** (sin umbrales configurados **o** umbrales cumplidos). FAIL si exit ≠ 0 **o** umbral configurado incumplido. |
| 5 | **Suites configuradas** (integración, contrato, rendimiento, mutación, accesibilidad…) | La que fije el estándar de testing (ver [Suites de prueba](#suites-de-prueba-fijas-y-configuradas)) | Una por cada clase de prueba que **declare el estándar de testing** del repo, en su orden de declaración. Sin estándar, o sin más requisitos que los de las fijas, **no hay ninguna**: no inventar suites. |
| 6 | Compilación | Bloqueante (Condicional en Python sin empaquetado) | FAIL si exit ≠ 0. En stacks compilados (Java, Go, Rust, .NET) cubre la compilación. Prerrequisito habitual de e2e. |
| 7 | E2E — **suite fija** | Condicional (Bloqueante si el estándar de testing la exige) | Se ejecuta sobre el artefacto ya compilado. |
| 8 | Análisis estático (Sonar) | Informativo | Nunca bloquea. |

El orden sigue la pirámide de tests (*rápido → lento*, *dependencias antes que consumidores*): estático (tipado/linter) → unit+coverage → suites configuradas → build → e2e → sonar. Una suite configurada que **requiera el artefacto compilado** (rendimiento, carga, accesibilidad sobre la app desplegada) se ejecuta después de build, junto a e2e. El fail-fast solo aplica al tipado, para evitar ruido en cascada. Justificación detallada en [`references/execution.md`](references/execution.md#paso-2--ejecutar-los-checks).

> **Cobertura sin tooling — no es un callejón sin salida.** Si el repo **no tiene ninguna herramienta ni configuración** de cobertura, el check es `N/A` (el proyecto nunca lo pidió), no `SKIPPED`: aplica la mnemónica de [SKIPPED vs N/A](#skipped-vs-na-definición-tajante) y el veredicto no queda condenado a `INCOMPLETE` de forma permanente. En ese caso, **señalarlo en Próximas acciones** como recomendación (configurar cobertura), sin bloquear. En cuanto exista config o herramienta, el check vuelve a ser Bloqueante y su ausencia de ejecución sí es `SKIPPED`.

> **Los checks de prueba alimentan la caché de pruebas** —las tres fijas (`unit`, `coverage`, `e2e`) más las suites configuradas— que consume `trace-validate` — ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate). Tipado, linter, build y sonar no producen suites.

---

## Suites de prueba: fijas y configuradas

El **conjunto de pruebas** de una corrida tiene dos partes, y solo la primera es fija:

| | Cuáles | De dónde salen | En el informe |
|-|--------|----------------|---------------|
| **Fijas** | `unit` · `coverage` · `e2e` | Del catálogo de checks: son las tres que este skill exige a cualquier repo. | **Siempre** se listan, aunque el estado sea `N/A`. Nunca se omiten. |
| **Configuradas** | Integración, contrato, rendimiento/carga, mutación, accesibilidad, seguridad… **cualquier otra clase** | Del **estándar de testing** del repo: `docs/standards/testing.md` (forma simple) o `docs/standards/testing/README.md` (forma con carpeta), un bloque `## <Requisito>` con su `ID` por clase de prueba. | Una fila por requisito vigente, en el **orden en que el estándar los declara**. |

**Reglas:**

- **El estándar es la única fuente de las suites no fijas.** Si el repo no tiene estándar de testing, o su estándar no declara más clases de prueba que las fijas, la corrida son **solo las tres fijas**. No se añade ninguna suite por haberla detectado en el repo.
- **Solo cuentan los requisitos vigentes.** Un requisito con `**Estado:** Deprecated` o `Superseded` no se ejecuta ni se lista: dejó de ser exigible.
- **La categoría sale del enunciado normativo** del requisito (RFC 2119, ver [`../../reference/language.md`](../../reference/language.md)): **DEBE / MUST → Bloqueante**; **DEBERÍA / PUEDE (SHOULD / MAY) → Condicional**. Si el enunciado no es claro, tratarla como **Condicional** y anotarlo en el detalle del check.
- **El estándar puede endurecer una fija, nunca ablandarla.** Si declara e2e con **DEBE**, e2e pasa de Condicional a Bloqueante. Lo que el stack exige como Bloqueante (unit, coverage) sigue siéndolo aunque el estándar calle o suavice.
- **Suite declarada que no se puede ejecutar → `SKIPPED`** (`INCOMPLETE`), no `N/A`: el estándar es precisamente la declaración de que ese check debe correr — es la mnemónica de [SKIPPED vs N/A](#skipped-vs-na-definición-tajante) aplicada al pie de la letra.
- **Suite presente en el repo pero no declarada en el estándar:** **no se ejecuta y no bloquea**. Anotarla en **Próximas acciones** como recomendación de declararla en el estándar (vía `arch-manage`), igual que se hace con la cobertura sin tooling.
- **El comando se resuelve como el de cualquier otro check:** scripts/tareas del manifiesto según [`references/stacks.md`](references/stacks.md#resolución-de-comandos-por-stack), usando como pista lo que el propio requisito diga sobre herramienta y ubicación. Si no se resuelve con certeza, preguntar en vez de adivinar.

> **Del estándar se toma *qué clases de prueba existen*, no sus umbrales.** Los criterios de cumplimiento `CR-XXX` del estándar (cobertura ≥ 80 %, flujos críticos con e2e…) los audita **`arch-audit`**, no este skill. Aquí el umbral de cobertura que decide PASS/FAIL sigue siendo el **configurado en el tooling** del repo. Que ambos números deban coincidir es asunto de `arch-audit`.

---

## Detección de stack y resolución por stack

El **detalle por ecosistema** vive en [`references/stacks.md`](references/stacks.md), que se carga **solo durante el Paso 1**:

1. Inspeccionar la raíz e identificar el ecosistema por manifiesto (`package.json`, `pom.xml`, `build.gradle`, `pyproject.toml`/`requirements.txt`, `go.mod`, `Cargo.toml`, `*.sln`/`*.csproj`, `composer.json`).
2. **Una vez identificado el stack**, abrir `references/stacks.md` y usar únicamente la **categoría**, el **comando** y el **parseo** de ese stack — no antes (no arrastres columnas que no aplican).
3. **Leer el estándar de testing** (`docs/standards/testing.md` o `docs/standards/testing/README.md`) para resolver las **suites configuradas**. Si no existe, la corrida son solo las tres suites fijas — no es un error ni hay que avisarlo. Ver [Suites de prueba](#suites-de-prueba-fijas-y-configuradas).
4. **Monorepo** ambiguo o **stack no detectable**: parar y preguntar.

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
| `no-tests` | Omitir **todos los checks de pruebas**: las tres fijas (unit, coverage, e2e) y todas las suites configuradas (→ `N/A`, no `SKIPPED`: lo pidió el usuario). |
| `no-unit-tests` / `no-e2e` / `no-coverage` / `no-typecheck` | Omitir solo ese check (→ `N/A`). |
| `no-<suite>` | Omitir una **suite configurada** por su `ID` de requisito en el estándar (p. ej. `no-integration`, `no-contract`) → `N/A`. |
| `only <check>` | Ejecutar ÚNICAMENTE ese check (p. ej. `only build`); el resto → `N/A`. |
| `save-report` | **Además** del informe vigente `docs/audits/quality-check.md` (que siempre se escribe), guardar una copia con marca de tiempo en `docs/audits/quality-check-<YYYYMMDD-HHMMSS>.md` para conservar histórico. |
| `tests-only` | Ejecutar **solo los checks de ejecución de pruebas** (las tres fijas —unit, coverage, e2e— más las suites configuradas; build solo si es prerrequisito de alguna de ellas); omitir tipado/linter/sonar. Pensado como **objetivo de delegación de `trace-validate`**: honra la caché de corrida de pruebas — si existe un `test-run.json` **fresco** (fingerprint coincide, ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate)) **reutiliza** ese resultado sin re-ejecutar; si no, ejecuta y escribe/actualiza la caché. **Modo no interactivo:** devuelve los resultados por suite y la ruta de `test-run.json` **sin** entrar al ciclo de corrección, **sin** emitir veredicto y **sin** escribir `quality-check.md` — su único artefacto es `test-run.json`. Si hay suites en FAIL, se reportan como tales; corregirlas es decisión del flujo que invocó, no de esta corrida. |

> Todo check omitido **por modificador del usuario** es `N/A`, nunca `SKIPPED`: una omisión solicitada no convierte el veredicto en `INCOMPLETE`.

---

## Flujo de ejecución (resumen)

**Ninguna corrección se aplica sin autorización** —explícita del usuario, o de antemano vía `verification.qualityCheck.confirmFix: "never"` (ver [Política de corrección](#política-de-corrección))—; tras corregir, verifica el arreglo y reinicia. El detalle paso a paso, el formato del informe, el manejo de errores y los anti-patterns están en **[`references/execution.md`](references/execution.md)** — léelo al iniciar la ejecución.

1. **Detectar entorno:** identificar stack, cargar `references/stacks.md`, **leer el estándar de testing** para resolver las suites configuradas, resolver comandos, capturar metadata y calcular el fingerprint.
2. **Ejecutar los checks** secuencialmente según el catálogo.
3. **Evaluar el resultado y el veredicto** con la tabla de [Veredicto](#veredicto). Si hay FAIL, mostrar el reporte y resolver si se corrige según `verification.qualityCheck.confirmFix` (ver [Política de corrección](#política-de-corrección)): con `always`, **preguntar** qué hacer — dentro de una implementación la pregunta es si se corrige, **fuera de una implementación** ofrecer además la salida **«solo el informe»**; con `never`, corregir directo sin preguntar. Si corresponde corregir y la rama tiene un artefacto identificable (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin), la corrección se **delega en `work-implement`**; solo si no hay artefacto de ningún tipo se aplica aquí — ver [Corrección de fallos](#corrección-de-fallos).
4. **Construir informe:** rellenar [`assets/quality-check-template.md`](assets/quality-check-template.md).
5. **Registro y salida:** escribir siempre el informe en `docs/audits/quality-check.md` y —**solo si la corrida ejecutó el conjunto de pruebas completo** (las tres fijas más todas las suites configuradas)— la caché en `.sdd-devkit/test-run.json` (creando los directorios si no existen), más un resumen en el chat. **Excepción `tests-only`:** no hay informe ni veredicto; el único artefacto es `test-run.json`. **No** hacer commit/push/merge sin instrucción explícita.

> **Tras cualquier corrección, el código cambió: recalcular el fingerprint** (Paso 1) antes de escribir la caché. Escribir un `test-run.json` con el fingerprint previo lo vuelve falso — afirmaría corresponder a un estado del código que ya no existe.

---

## Corrección de fallos

Todo hallazgo que implique **modificar código** —un check en FAIL o una prueba en rojo— se **propone**, nunca se aplica por iniciativa propia. Antes de tocar nada hay que resolver dos cosas, en este orden:

### 1. ¿Se corrige o se entrega solo el informe?

Se resuelve primero por `verification.qualityCheck.confirmFix` (ver [Política de corrección](#política-de-corrección)):

- **`never`** → corregir directo, sin preguntar, en cuanto haya un check en FAIL o una prueba en rojo. Saltar el resto de este punto y seguir con el punto 2.
- **`always`** (o sin `settings.json`, comportamiento por defecto) → depende del **contexto de ejecución**:

| Contexto | Qué hacer |
|----------|-----------|
| **Dentro de una implementación** — hay un **trabajo en curso** al que atribuir la rama: un artefacto del plugin (`US-XXX`, `WI-XXX`, o `FT-XXX`/`TC-XXX` sobre rama `test/`) **o un artefacto externo** (ticket, spec suelto) que el usuario o la rama señalen. **No se exige carpeta ni `progress.md`** (cierre vía `work-integrate` / `pr-create`) | Mostrar el reporte y **preguntar si se corrige**. Es el flujo normal del cierre: corregir es lo esperado, pero sigue requiriendo autorización. |
| **Fuera de una implementación** — corrida suelta sobre un repo, rama sin artefacto derivable, auditoría puntual, revisión exploratoria | **Preguntar explícitamente qué quiere el usuario**, con dos opciones: **[Corregir los hallazgos]** o **[Solo el informe, detener aquí]**. **No asumir que hay que corregir.** Quien pide una verificación fuera de un ciclo de implementación muchas veces solo quiere el diagnóstico. |

Con `always`, la pregunta va por la **herramienta de preguntas estructuradas** del cliente (opciones tappables); si el cliente no la expone, formularla en prosa con las opciones enumeradas. Reglas:

- **Preguntar una sola vez por corrida**, presentando antes el reporte completo de lo que falló, para que el usuario decida con la información delante.
- Si el usuario elige **Solo el informe** → construir el informe (Paso 4), emitir el veredicto que corresponda (`REJECTED` si hay FAIL) y **terminar**. No tocar código, no reiniciar la corrida, no insistir. Dejar en Próximas acciones qué habría que corregir.
- Si el usuario elige **Corregir** → seguir con el punto 2.
- El usuario puede acotar el alcance («corrige solo el linter, el test lo veo yo»): respetarlo y tratar el resto como *solo informe*.
- **Una petición explícita del usuario gana**, en cualquier sentido («corrige todo sin preguntar», «esta vez solo quiero el informe»): se respeta para esa corrida sin tocar `settings.json`.

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

> **Buscar también en `docs/archive/`.** Al cerrar un trabajo, `work-integrate` y `pr-create` pueden mover su carpeta a `docs/archive/user-stories/` o `docs/archive/work-items/`. Si no está en la ruta activa, mirar ahí antes de concluir que «no hay artefacto» y dejar de delegar en `work-implement` — y **nunca** crear la carpeta en la ruta activa por no haberla encontrado. Este skill **solo lee** la carpeta (para resolver el artefacto y decidir si delega); no escribe nada dentro. Ver [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).
>
> **Cuándo se da.** En el flujo normal el archivado ocurre **después** de esta puerta (`work-integrate` paso 10, `pr-create` Paso 5), así que aquí el artefacto suele estar todavía en la ruta activa. Se lo encuentra archivado al **repetir** el cierre tras una corrección, o al correr `quality-check` sobre trabajo ya integrado — dos situaciones normales, no excepcionales.
>
> **Una rama `test/` NO es una rama suelta.** Nace en `work-implement` (`references/test-cases.md`, Paso 1) siempre asociada a un artefacto padre y con su `progress.md`, y `work-integrate` la trata como trabajo integrable de pleno derecho. Se resuelve con el mismo mecanismo que `feature/` o `fix/`. Ahí el fallo típico es **una prueba en rojo**, y el skill que sabe escribir esa prueba es `work-implement` (tipos `TC-XXX` / `FT-XXX`) — delegar es especialmente importante en este caso, no la excepción.

Si no se resuelve un artefacto del plugin, **comprobar antes si hay uno externo** (ver [Artefactos externos al plugin](#artefactos-externos-al-plugin)); solo si tampoco lo hay, **no hay artefacto**: no delegar ni inventarlo. Si hay ambigüedad (varios candidatos), preguntar al usuario antes de delegar. Esta es también la señal que distingue los dos contextos del punto 1.

**Qué se le pasa a `work-implement`** al delegar: el artefacto en curso (`US-XXX` / `WI-XXX` / `FT-XXX` / `TC-XXX`), el check que falló, el comando exacto, la salida de error relevante y los archivos implicados. La corrección se atribuye a ese artefacto y se anota en su `progress.md` como nota de retrabajo — **salvo que el artefacto esté archivado**, en cuyo caso la nota va en este informe y no se escribe dentro de `docs/archive/` (ver la regla de artefacto archivado en [`work-implement`](../work-implement/SKILL.md#seleccion-del-tipo-de-implementacion)); `work-implement` aplica su propio criterio en su [Modo corrección](../work-implement/SKILL.md#modo-correccion-delegado-desde-quality-check) — un modo acotado, sin ritmo por unidad y sin exigir `Estado: Ready` ni working tree limpio.

**Aplica igual a fallos de pruebas** (las tres fijas y cualquier suite configurada) que a fallos de tipado, linter o build: en ambos casos hay que escribir o ajustar código, que es justo lo que hace `work-implement`.

> **En ramas `test/`, no presuponer que el fallo está en la prueba.** Una prueba en rojo ahí puede significar que la prueba está mal **o** que hay una discrepancia real entre el `TC-XXX` y el comportamiento del código. Esa decisión no la toma este skill: se delega en `work-implement`, que aplica su criterio para los tipos `TC-XXX` / `FT-XXX` (parar, presentar la evidencia y decidir con el usuario si se corrige producción, si se corrige la prueba, o si vuelve a `test-define`). **Nunca relajar una aserción para forzar el verde.**

**Tras la delegación**, este skill retoma el control: **verifica que el arreglo funciona** re-ejecutando el check o la prueba que fallaba y, solo si pasa, **recalcula el fingerprint** y **reinicia la corrida completa** (Paso 2). Si el arreglo no resuelve el fallo, seguir iterando antes de reiniciar.

**Si `work-implement` devuelve «corrección no aplicada»**, la iteración **se detiene ahí**. Ese resultado significa que el arreglo excedía su alcance acotado, que hay una discrepancia de especificación, o que el fallo es preexistente — y viene con el motivo y el skill al que se escaló (`work-plan` / `test-define`). En ese caso: **no reintentar la delegación sobre ese mismo fallo** ni corregirlo aquí como sustituto. Construir el informe (Paso 4) recogiendo el motivo y el escalado en **Próximas acciones**, emitir **`REJECTED`** y terminar. El cierre queda bloqueado hasta que el escalado se resuelva — que es el resultado correcto, no un flujo incompleto.

> **Límites.** La delegación **no** convierte a este skill en implementador: no decide el diseño de la corrección ni escribe código por su cuenta cuando delega. Y **nunca** delega sin la autorización resuelta en el punto 1 (explícita del usuario, o `verification.qualityCheck.confirmFix: "never"`) — la delegación es *cómo* se corrige, no *si* se corrige.

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

Cuando este skill **ejecuta los checks de pruebas** (las fijas —unit, coverage, e2e— más las suites
configuradas en el estándar de testing), persiste el resultado en un artefacto reutilizable `test-run.json`. Así `trace-validate` **no vuelve a correr las
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
Se **sobrescribe** en cada corrida: es el estado vigente de la rama, no un histórico.

> **No se versiona: es una caché local y desechable.** El repositorio destino debe ignorarla con la línea
> `.sdd-devkit/test-run.json` en su `.gitignore` — solo ese archivo, no el directorio, por si el plugin
> llegara a escribir ahí algo que sí convenga versionar. Comprobarlo con `git check-ignore -q` (no con un
> grep de la línea: un repo que ya ignore `.sdd-devkit/` entero ya cumple) y, si no lo está, **añadir esa
> línea es la única edición de configuración que este skill hace sin preguntar**, y no se reporta al
> usuario: es infraestructura del propio artefacto, no una decisión suya.
>
> **Se hace en el Paso 1, antes de calcular el fingerprint.** El `.gitignore` es un archivo oculto de la
> raíz y la receta **no** excluye esos: tocarlo mueve la clave. Normalizarlo después de calcularla dejaría
> un `test-run.json` sellado con un hash que ya no corresponde al árbol, y la caché no volvería a darse por
> fresca nunca.
>
> **Consecuencias que sí importan:** la caché **no viaja en el PR** ni entre máquinas, así que un clon
> limpio, un runner de CI o un compañero que retome la rama **siempre re-ejecutan** las pruebas la primera
> vez. Es el comportamiento correcto: un resultado producido en otra máquina, con otras dependencias
> instaladas, no es evidencia de nada aquí. Y como el fingerprint ya excluye las carpetas ocultas, que el
> archivo esté ignorado no cambia la clave de frescura.
>
> **Presencia y ausencia son ambas normales.** Si existe y está fresco, se reutiliza; si no existe, se
> genera. Ninguno de los dos casos merece un aviso al usuario.

Se escribe en **toda corrida completa de pruebas**, exista o no `docs/specs/` (lo que la condiciona es que se haya ejecutado el conjunto de pruebas completo —las tres fijas y todas las configuradas—, no que el repo sea spec-driven): el consumidor es `trace-validate`, que también opera
sobre artefactos externos al plugin (ver [Artefactos externos al plugin](#artefactos-externos-al-plugin)).
Crear `.sdd-devkit/` si no existe. Solo si el usuario pide explícitamente no crear ese directorio, entregar
los resultados en la respuesta y advertir que no habrá reutilización entre corridas. La misma excepción
aplica a `docs/audits/` — que, ese sí, **se versiona**: el informe es la evidencia que el revisor lee en el PR.

**Fingerprint canónico del estado del código** — clave de frescura compartida entre las **tres puertas del
cierre**, cada una sobre su propio artefacto: `test-run.json` aquí, el `trace-report.md` de
[`trace-validate`](../trace-validate/SKILL.md#reutilización-del-reporte-idempotencia) y el
`docs/audits/code-review.md` de [`code-review`](../code-review/SKILL.md#reutilización-del-informe-idempotencia).
(`code-review` le añade además el commit de la rama base, porque su unidad es un diff con dos lados; el
`FINGERPRINT` en sí es idéntico en las tres.) Hash reproducible del commit + working tree + cambios
sin commitear **del código y de la configuración visible**, excluyendo tres cosas para que escribirlas no
desplace la clave: **toda carpeta oculta** (empieza por `.`, en la raíz o anidada), **todo `docs/`** y los
**`trace-report.md`** que vivan fuera de `docs/`:

```bash
ROOT=$( git rev-parse --show-toplevel )
EXC=( ':(top,exclude,glob)**/.*/**' ':(top,exclude,glob)**/docs/**' ':(top,exclude,glob)**/trace-report.md' )
FINGERPRINT=$( { git -C "$ROOT" ls-files -s              -- "${EXC[@]}"; \
                 git -C "$ROOT" status --porcelain -uall -- "${EXC[@]}"; \
                 git -C "$ROOT" diff                     -- "${EXC[@]}"; \
} | git hash-object --stdin )
```

Las tres piezas se reparten el estado: `ls-files -s` da el contenido **trackeado** (el SHA de cada blob del índice), `diff` los cambios **sin stagear** del árbol, y `status -uall` las rutas **sin trackear**. Juntas cubren el estado del código sin referenciar `HEAD` ni una sola vez, que es lo que hace la clave utilizable (ver la nota de abajo).

Cubre **código fuente, tests y manifiestos** — todo aquello de lo que dependen los resultados de las
herramientas. La caché es **fresca** si el `fingerprint` guardado coincide con el recalculado ahora; si
difiere, hubo cambios y es **obsoleta** (re-ejecutar).

> **Qué queda deliberadamente fuera, y qué implica.** La exclusión de `docs/` mantiene la clave estable
> frente a la documentación, pero también deja fuera **los criterios de aceptación** (`docs/specs/**/README.md`).
> Para este skill da igual —una prueba no cambia de resultado porque se reescriba un criterio—, pero **sí
> importa en `trace-validate` y en `code-review`**, cuyo veredicto depende de esos criterios: si se editan
> sin tocar el código, el informe se dará por fresco y hay que **revalidar a mano** (ver la nota de cada uno).
> Tampoco se cubren los cambios de **entorno** (dependencias instaladas, red, servicios) que no tocan el árbol.

> **Nombre único de la clave.** En todo el repo esta variable se llama `FINGERPRINT` y su valor persistido
> es `git.fingerprint`. No usar alias (`FP`, `HASH`) en ningún skill: el mismo valor debe ser reconocible
> a simple vista cuando un skill delega en otro.
>
> **La exclusión es por directorio, no por nombre de archivo.** Los tres pathspecs, uno a uno:
>
> | Pathspec | Qué saca de la clave |
> |----------|----------------------|
> | `':(top,exclude,glob)**/.*/**'` | El contenido de **cualquier carpeta oculta**, en la raíz o anidada: `.sdd-devkit/` (donde vive `test-run.json`), y de paso `.git/`, `.github/`, `.venv/`, `.cache/`, `.idea/`… El `**/` inicial cubre los dos niveles con un solo patrón. **Los archivos ocultos de la raíz (`.gitignore`, `.eslintrc.json`, `.env`) NO se excluyen**: son configuración que sí puede cambiar el resultado de un check. |
> | `':(top,exclude,glob)**/docs/**'` | **Cualquier `docs/`, en la raíz o dentro de un módulo**: el informe vigente (`quality-check.md`, `code-review.md`), las copias con marca de tiempo de `save-report`, los informes de `arch-audit`, los `trace-report.md` que viven junto a su artefacto y el resto de documentación. El `**/` inicial es lo que cubre el caso monorepo: `:(top,exclude)docs` a secas excluiría **solo** el `docs/` de la raíz, y en una corrida lanzada desde `packages/api/` el informe se escribe en `packages/api/docs/audits/` — que seguiría dentro de la clave y la desplazaría en cada corrida. |
> | `':(top,exclude,glob)**/trace-report.md'` | Los `trace-report.md` de artefactos que viven **fuera** de `docs/` — `trace-validate` acepta artefactos externos al plugin y escribe el reporte junto a ellos. Sin este patrón, ese caso quedaría dentro de la clave. |
>
> Así ningún artefacto que produce la propia tubería puede desplazar la clave de frescura: correr
> `arch-audit` no invalida un `trace-report.md`, ni escribir un informe invalida el `test-run.json`.
>
> **Nada de `HEAD` — y es deliberado.** La receta **no** referencia `HEAD` en ningún punto, porque `HEAD` no
> admite pathspec: cualquier commit lo mueve, incluidos los que solo tocan rutas excluidas. Con `git rev-parse HEAD`
> en la receta, el commit de los propios artefactos que hace el cierre (`work-integrate` paso 11, `pr-create`
> paso 6) caducaba **las tres claves a la vez** y obligaba a re-ejecutar toda la batería de pruebas — la
> idempotencia no sobrevivía al flujo que la usa. `ls-files -s` da la misma señal (el SHA de cada blob
> trackeado) **respetando los pathspecs**, y de paso funciona en un repo **sin ningún commit**, donde
> `git rev-parse HEAD` aborta con `fatal: bad revision`.
>
> **`git -C "$ROOT"` no es cosmético.** `status` y `diff` imprimen rutas **relativas al directorio de trabajo**:
> el mismo árbol da hashes distintos según desde dónde se lance la corrida. Anclando los tres comandos a la raíz,
> el `FINGERPRINT` es idéntico desde la raíz o desde `packages/api/`, que es lo que permite compararlo entre
> corridas y entre skills.
>
> **La magia `top` tampoco es opcional.** `:(top,…)` ancla el pathspec a la **raíz del repositorio**; sin ella,
> git lo resolvería relativo al directorio de trabajo y las exclusiones se desplazarían con el cwd.
>
> **`-uall` tampoco es opcional.** Sin él, `git status --porcelain` **colapsa** los directorios sin trackear a
> una sola entrada (`?? docs/`) y las exclusiones de dentro no llegan a aplicarse — el caso típico es la
> primera corrida en un repo, donde nada de esto está aún versionado. Con `-uall` git lista archivo por
> archivo y los pathspecs filtran de verdad. Aun así, el contenido de un archivo que **permanezca** sin
> trackear no entra en la clave: solo su ruta. Si el resultado pudiera depender de un archivo nuevo aún sin
> añadir a git, tratar la caché como no concluyente.
>
> **La clave es conservadora, nunca laxa.** Commitear cambios de **código** sí la mueve, aunque el árbol
> resultante sea idéntico al que se probó: `status` distingue un cambio stageado de uno ya commiteado. Eso
> provoca alguna revalidación de más, que es el error barato; el caro —dar por fresca una caché que ya no
> corresponde— no puede ocurrir por esta vía.

**Esquema `test-run.json`** (`schema: test-run/v2`) — **esta es la definición canónica y única**; los
consumidores la referencian, no la copian:

```json
{
  "schema": "test-run/v2",
  "generatedBy": "quality-check",
  "timestamp": "2026-07-17T10:20:00-05:00",
  "invokedFrom": "US-004-checkout",
  "testingStandard": "docs/standards/testing.md",
  "git": { "branch": "feature/US-004-checkout", "commit": "abc1234", "workingTreeClean": true,
           "fingerprint": "<hash>" },
  "suites": [
    { "type": "unit",        "command": "npm test",            "result": "PASS", "summary": "48 passed" },
    { "type": "coverage",    "command": "npm run coverage",    "result": "PASS", "summary": "line 82%" },
    { "type": "e2e",         "command": "npx playwright test", "result": "FAIL", "summary": "2 failed" },
    { "type": "integration-testing", "command": "npm run test:it",   "result": "PASS", "summary": "18 passed",
      "standard": "testing/integration-testing" },
    { "type": "contract-testing",    "command": "npm run test:pact", "result": "SKIPPED", "summary": "config rota",
      "standard": "testing/contract-testing" }
  ]
}
```

Semántica de los campos:

- **`generatedBy`** — siempre `"quality-check"`. Un consumidor que lea otro valor debe **descartar la caché** y no reutilizarla: este skill es el único productor autorizado.
- **`timestamp`** — momento de la corrida, para reportar procedencia al usuario. No es clave de frescura (esa es `git.fingerprint`).
- **`invokedFrom`** — trabajo desde el que se invocó la corrida (`US-XXX-slug`, `WI-XXX-slug`) o `null` si no aplica. Es **informativo**: la corrida es de la **rama consolidada**, que puede incluir varios trabajos, así que **no** debe usarse para filtrar resultados ni para decidir si la caché aplica a otro trabajo.
- **`testingStandard`** — ruta del estándar de testing del que salieron las suites configuradas, o `null` si el repo no tiene ninguno (en cuyo caso `suites[]` trae solo las tres fijas). Informativo: permite al consumidor distinguir «este repo no declara integración» de «no se leyó el estándar».
- **`git.fingerprint`** — única clave de frescura. Debe corresponder al estado del código **realmente probado** (recalcular tras cualquier corrección).
- **`suites[].type`** — para las **fijas**, uno de `unit` · `coverage` · `e2e` (slugs canónicos de este skill): **siempre se emiten las tres**, y la que el repo no tiene va con `result: "N/A"`. Para las **configuradas**, el `ID` **tal cual lo declara el requisito** en el estándar de testing (`integration-testing`, `contract-testing`, `performance-testing`…): se emite **una entrada por requisito vigente**, y ninguna si el estándar no declara más. **No** emitir una entrada por una suite que el estándar no declara.
- **`suites[].standard`** — solo en las configuradas: referencia global al requisito del estándar, `<slug-del-estándar>/<ID-del-requisito>` (p. ej. `testing/integration-testing`). Ausente en las fijas.
- **`suites[].result`** — `PASS` · `FAIL` · `SKIPPED` (correspondía pero no se pudo ejecutar) · `N/A` (no aplica al repo).

> **Cambio respecto de `test-run/v1`:** las entradas fijas pasan de cuatro a **tres** (`unit`, `coverage`, `e2e`). `integration` ya no está garantizada: aparece **solo si el estándar de testing la declara**, junto al resto de suites configuradas. Un consumidor no puede asumir su presencia — debe buscarla en `suites[]` y, si no está, tratarla como una clase de prueba que el repo no declara.

El detalle operativo (cuándo escribirla, cómo reutilizarla en `tests-only`) está en
[`references/execution.md`](references/execution.md#caché-de-corrida-de-pruebas).

---

## Notas

### Relación con otros skills

Usar este skill **solo cuando se le invoca explícitamente** (ni de forma proactiva, ni "por si acaso", ni al detectar que se terminó código):

- **El usuario lo pide explícitamente** — solicita correr las verificaciones o las pruebas, validar antes de PR/merge, o nombra este skill.
- **Otro skill lo invoca explícitamente**, p. ej. `work-integrate` o `pr-create`, que exigen `APPROVED` **aquí y** en `code-review` antes de integrar o crear el PR. En un **PR de promoción**, `pr-create` invoca solo esta puerta: es la única que sigue teniendo algo que demostrar sobre la rama consolidada.
- **`trace-validate` delega en este skill la ejecución de pruebas.** `trace-validate` no corre pruebas por sí mismo: reutiliza el `test-run.json` fresco de una corrida previa de este skill o, si no hay una fresca, invoca este skill en modo `tests-only` para producirlo. Este skill es la **única** autoridad que ejecuta la batería de pruebas del trabajo. Ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas-compartida-con-trace-validate).
- **`work-implement` recibe la delegación de las correcciones** cuando hay un artefacto de trabajo en curso (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin) y el usuario las autoriza. Ver [Corrección de fallos](#corrección-de-fallos).

**Las tres puertas del cierre.** `quality-check`, `code-review` y `trace-validate` son **hermanos e independientes**: ninguno invoca a otro para decidir su veredicto (la única invocación entre ellos es instrumental: `trace-validate` pide una corrida de pruebas a este skill). Cada uno responde una pregunta distinta y emite su propio veredicto:

| Skill | Pregunta | Qué juzga |
|-------|----------|-----------|
| **`quality-check`** | ¿El código corre y cumple las reglas? | Resultado de las herramientas + cobertura **cuantitativa** (líneas/ramas contra umbral). |
| **`code-review`** | ¿Resuelve el problema correcto y está bien diseñado? | Intención, arquitectura y diseño del diff — incluida la **calidad** de las pruebas escritas, no su ejecución. |
| **`trace-validate`** | ¿Cada criterio de aceptación está probado? | Cobertura **funcional**: criterio ↔ caso de prueba ↔ artefacto. |

> **«Cobertura» significa dos cosas distintas en este cierre:** aquí es la métrica de líneas/ramas de un check; en `trace-validate` es el estado de un criterio de aceptación (`COVERED`/`PARTIAL`/`UNCOVERED`). Un repo puede tener 95 % de líneas y un criterio sin probar, o al revés. Ambas bloquean, pero por motivos distintos; no usar una para justificar la otra.

El orden recomendado en el cierre es `quality-check` → `code-review` → `trace-validate`: los dos primeros porque revisar diseño sobre código que ni compila suele ser trabajo perdido; el tercero **después de este skill** para que reutilice el `test-run.json` sin re-ejecutar pruebas. Es una recomendación del orquestador, no una dependencia dura, y el usuario puede pedir solo uno de los tres.

Es un proceso **posterior a la implementación**: no forma parte del desarrollo de tareas. Sin invocación explícita, no corresponde usarlo. (Que `work-implement` reciba una delegación de corrección **desde** este skill no invierte la relación: sigue siendo el cierre quien decide cuándo se ejecuta.)

### Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada:** la salida y los mensajes de error de las herramientas no se traducen; se citan literales.
