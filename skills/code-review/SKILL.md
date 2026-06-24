---
name: code-review
description: Revisar código antes de aceptarlo para merge en dos planos: (1) verificaciones automatizadas según el stack (tipado, linter, unit tests, coverage, build, e2e, sonar) y (2) revisión cualitativa estilo ingeniero senior — intención del cambio, arquitectura y diseño (SOLID, Clean Architecture, acoplamiento, duplicación) y feedback accionable que explica el PORQUÉ y propone cambios concretos. Devuelve un informe con estado por check, hallazgos con severidad, veredicto unificado (apto/no apto/incompleto) y próximas acciones. Usar SOLO cuando se invoca explícitamente: el usuario pide una revisión de código ("code review", "revisión de código", "revisa antes de PR/merge") o nombra el skill, o lo llama otro skill (p. ej. work-integrate, pr-create). Proceso posterior a la implementación: NO activarlo de forma proactiva ni durante el desarrollo. Nunca corrige por iniciativa propia: solo aplica cambios si el usuario lo autoriza, y tras corregir vuelve a ejecutar las pruebas.
license: MIT
---

# Skill: Revisión de código

Revisar una implementación antes de aceptarla como apta para merge combinando **dos planos complementarios**:

1. **Verificaciones automatizadas** — la batería de checks que el stack exige (tipado, linter, tests, coverage, build, e2e, sonar), adaptada al **stack detectado**.
2. **Revisión cualitativa estilo senior** — razonar sobre la **intención** del cambio, su **diseño y arquitectura**, y dar **feedback accionable** como lo haría un ingeniero senior revisando un PR. Ver [Revisión cualitativa](#revisión-cualitativa-análisis-senior).

Ambos planos alimentan **un único veredicto** de aceptación.

> **NO te comportes como una herramienta de CI.** Ejecutar los scripts y reportar violaciones de reglas es solo la mitad del trabajo. La otra mitad es razonar sobre la intención del diseño y el impacto en el sistema. Un informe que solo lista exit codes y conteos de errores está incompleto.
>
> **Alcance:** audita, razona y **propone**. **Nunca corrige por iniciativa propia.** Puede aplicar correcciones **solo si el usuario lo autoriza explícitamente** (ver [Flujo de ejecución](#flujo-de-ejecución)); en ese caso, tras corregir **vuelve a ejecutar** la evaluación. No edita configuración, no instala dependencias ni hace commit/push/merge sin instrucción explícita.
>
> **Proceso iterativo:** el code review se ejecuta en dos etapas con puertas. Toda corrección reinicia la etapa afectada (o el review completo) y se vuelve a evaluar, hasta llegar a un veredicto estable.
>
> **Entrada mínima:** estar en la raíz de un repositorio reconocible (ver [`references/stacks.md`](references/stacks.md)). Si no se detecta ningún stack, parar y avisar.

---

## Modelo de aplicabilidad y veredicto

Todo check pertenece a **una** de estas tres categorías. No hay solape.

| Categoría | Cuándo se ejecuta | Si FALLA | Si no se puede ejecutar |
|-----------|-------------------|----------|--------------------------|
| **Bloqueante** | Siempre (el stack lo exige). | `❌ No apto` | Herramienta/config ausente → `SKIPPED` → `⚠️ Incompleto` |
| **Condicional** | Solo si hay config o herramienta del check presente. | `❌ No apto` | Config presente pero binario/tarea rota → `SKIPPED` → `⚠️ Incompleto`. Sin config **ni** herramienta → `N/A` (no afecta veredicto). |
| **Informativo** | Si hay config presente. | No afecta veredicto (FAIL informativo). | `N/A` o `SKIPPED` → no afecta veredicto. |

### SKIPPED vs N/A (definición tajante)

- **`N/A`** = el check **no corresponde** a este repo: ni aplica al stack, ni existe config, ni existe herramienta, ni script asociado. No se cuenta para el veredicto y se omite (o se marca `— N/A`).
- **`SKIPPED`** = el check **sí correspondía** (es Bloqueante, o es Condicional con config presente) pero **no pudo ejecutarse** porque la herramienta o la config está ausente o rota. Cuenta como `⚠️ Incompleto`.

> Regla mnemónica: si el proyecto **declara** que algo debe correr y no corre → `SKIPPED` (Incompleto). Si el proyecto **nunca pidió** ese check → `N/A` (irrelevante).

### Veredicto

El veredicto unifica **los dos planos**: los checks automatizados (esta sección) y los hallazgos de la [revisión cualitativa](#severidad-y-puerta-de-aceptación). Un hallazgo cualitativo **bloqueante** (severidad 🔴 Crítico o 🟠 Mayor) que **no** ha sido corregido ni justificado-y-aceptado cuenta igual que un FAIL para el veredicto.

| Veredicto | Condición exacta |
|-----------|------------------|
| `✅ Apto` | **Cero** FAIL en checks Bloqueantes y Condicionales-presentes, **cero** `SKIPPED`, **y cero** hallazgos cualitativos bloqueantes sin resolver. Informativos / hallazgos menores en cualquier estado. |
| `❌ No apto` | **Al menos un** Bloqueante o Condicional-presente en FAIL, **o** al menos un hallazgo cualitativo bloqueante (🔴/🟠) sin corregir ni justificar. (Tiene prioridad sobre Incompleto.) |
| `⚠️ Incompleto` | **Cero** FAIL y cero hallazgos bloqueantes sin resolver, pero **al menos un** `SKIPPED` (Bloqueante, o Condicional con config rota). |

Orden de precedencia: `❌ No apto` > `⚠️ Incompleto` > `✅ Apto`.

> Un hallazgo bloqueante **justificado por el usuario y aceptado** deja de bloquear, pero se **registra** la justificación (ver [Registro y salida](#paso-5--registro-y-salida)). Justificar no es ignorar: queda trazado quién decidió aceptar el estado actual y por qué.

---

## Catálogo de checks

Checks canónicos en **orden de ejecución**. La categoría real (Bloqueante / Condicional / Informativo) depende del stack — ver [`references/stacks.md`](references/stacks.md#aplicabilidad-por-stack).

| # | Check | Categoría base | Política |
|---|-------|----------------|----------|
| 1 | Tipado | Bloqueante o Condicional según stack | **Fail-fast**: si aplica y falla, no se ejecuta nada más. |
| 2 | Linter | Bloqueante o Condicional según stack | Bloquea solo si hay severidad `error`. `warning` = informativo (salvo `include-linter-warnings`). |
| 3 | Unit tests | Bloqueante | FAIL si exit ≠ 0 o algún test falla. |
| 4 | Coverage | Bloqueante | PASS si exit 0 **y** (sin umbrales configurados **o** umbrales cumplidos). FAIL si exit ≠ 0 **o** umbral configurado incumplido. |
| 5 | Build | Bloqueante (Condicional en Python sin empaquetado) | FAIL si exit ≠ 0. En stacks compilados (Java, Go, Rust, .NET) cubre la compilación. Prerrequisito habitual de e2e. |
| 6 | E2E | Condicional | Se ejecuta sobre el artefacto ya compilado. |
| 7 | Sonar | Informativo | Nunca bloquea. |

**Por qué este orden** — pirámide de tests, criterio *rápido → lento*, *dependencias antes que consumidores*:

1. **Estático** (tipado, linter): barato; el fail-fast del tipado evita ruido en cascada.
2. **Unit + coverage**: mismo estrato; coverage justo después de unit.
3. **Build**: artefacto de integración; en Java/Go/Rust/.NET valida también la compilación.
4. **E2E**: el más lento; suele requerir build previo.
5. **Sonar**: informativo, al final.

**Por qué fail-fast solo en tipado:** en TypeScript, si los tipos no compilan, linter, tests y build fallan masivamente y el ruido no aporta señal. En stacks sin check de tipado separado (Java, Go, .NET), no hay fail-fast: tipado y compilación se validan en **build**.

---

## Revisión cualitativa (análisis senior)

Los checks automatizados verifican que el código **corre y cumple reglas**. No dicen si el código **resuelve el problema correcto, está bien diseñado, o es mantenible**. Eso lo aporta esta fase. **Es obligatoria** (salvo el modificador `checks-only`): un informe sin ella está incompleto.

> **Comportamiento exigido:** razona como un ingeniero senior revisando un PR de un compañero. **No** te limites a listar violaciones de reglas. Para cada hallazgo explica **por qué** es un problema y **qué impacto** tiene en el sistema, y propón una mejora concreta. Si el cambio está bien, dilo y explica por qué — el silencio no es feedback.

### Las tres dimensiones

Evalúa el diff (no todo el repo) contra estas tres dimensiones. El detalle de cada rúbrica y ejemplos de buen/mal feedback están en **[`references/qualitative-review.md`](references/qualitative-review.md)** — léelo antes de redactar los hallazgos.

**1. Análisis semántico (intención).** Entender *qué* intenta lograr el cambio y *qué problema* resuelve, y detectar desajustes entre la intención declarada (título de la US/TK, nombre de la rama, mensaje de commit, descripción) y lo que el código realmente hace. Banderas: código que resuelve un problema distinto al pedido, casos del criterio de aceptación sin cubrir, efectos colaterales no buscados, lógica que contradice su propio nombre.

**2. Arquitectura y diseño.** Evaluar adherencia a **SOLID**, respeto de los **límites de Clean Architecture / capas** (dominio no depende de infraestructura, etc.), y detectar **acoplamiento**, **duplicación** y **abstracción innecesaria** (capas o genericidad que no pagan su coste). Contrastar contra los **patrones ya existentes en el proyecto**: una solución correcta pero ajena al estilo del repo es deuda. Banderas: una clase con múltiples responsabilidades, dependencias que apuntan hacia adentro→afuera, un `if` por tipo que pide polimorfismo, lógica duplicada que debió extraerse, un wrapper que no añade valor.

**3. Feedback estilo senior.** Cada hallazgo debe ser **accionable y contextual**: explicar el **PORQUÉ** (qué se rompe o encarece a futuro), proponer una **mejora concreta** (idealmente con un esbozo de cómo quedaría) y mantener el tono de un par que ayuda, no de un linter que regaña. Prioriza por impacto; no abrumes con nitpicks.

### Severidad y puerta de aceptación

Clasifica cada hallazgo. Solo los dos primeros niveles **bloquean** el veredicto.

| Severidad | Qué califica | Efecto en veredicto |
|-----------|--------------|---------------------|
| 🔴 **Crítico** | Desajuste intención↔implementación, violación grave de límites arquitectónicos, acoplamiento que impide el cambio, defecto de diseño que romperá el sistema o lo desvía del objetivo. | **Bloquea** salvo justificación aceptada. |
| 🟠 **Mayor** | Violación SOLID con impacto real, duplicación significativa, abstracción innecesaria costosa, divergencia fuerte de los patrones del proyecto. | **Bloquea** salvo justificación aceptada. |
| 🟡 **Menor** | Mejoras recomendables sin riesgo sistémico (naming, legibilidad, duplicación pequeña). | No bloquea. |
| 💡 **Sugerencia** | Ideas opcionales, alternativas de estilo. | No bloquea. |

**Ante un hallazgo bloqueante (🔴/🟠), siempre se ofrecen DOS caminos al usuario:**

1. **Corregir** — el skill presenta el cambio concreto sugerido. La corrección puede ocurrir de dos formas; en **ambas**, primero se **verifica que el arreglo funciona** (re-ejecutando el check/prueba afectado) y solo entonces se **reinicia el code review completo** (los cambios pueden afectar checks y otras dimensiones):
   - El usuario **pide expresamente corrección automática** → el skill aplica el cambio, lo verifica y reinicia desde el [Paso 1](#paso-1--detectar-entorno).
   - El usuario **corrige manualmente** e indica que ya lo hizo → el skill verifica y reinicia desde el [Paso 1](#paso-1--detectar-entorno).
2. **Justificar** — el usuario explica por qué el estado actual es aceptable. Si la justificación se acepta, el hallazgo deja de bloquear y la justificación **se registra**.

> El skill **nunca** aplica una corrección sin que el usuario la pida expresamente. Si el usuario no autoriza ni justifica, el hallazgo sigue bloqueando.

Mientras existan hallazgos bloqueantes sin resolver por ninguna de las dos vías, el veredicto es `❌ No apto`. Tras presentarlos, **pausa y pide al usuario** que para cada uno elija corregir o justificar antes de finalizar el veredicto.

---

## Detección de stack y resolución por stack

El **detalle por ecosistema** (matriz de manifiestos, categoría de cada check, comando concreto y parseo de salida) vive en [`references/stacks.md`](references/stacks.md) y se carga **solo cuando hace falta**, durante el [Paso 1](#paso-1--detectar-entorno):

1. Inspeccionar la raíz del repo e identificar el ecosistema por manifiesto (`package.json`, `pom.xml`, `build.gradle`, `pyproject.toml`/`requirements.txt`, `go.mod`, `Cargo.toml`, `*.sln`/`*.csproj`, `composer.json`).
2. **Una vez identificado el stack**, abrir `references/stacks.md` y usar únicamente lo relativo a ese stack: la **categoría** de cada check (Bloqueante / Condicional / N/A), el **comando** a ejecutar y el **parseo** de su salida.
3. **Monorepo** (varios manifiestos) o **stack no detectable**: parar y preguntar (ver `references/stacks.md`).

> No cargues `references/stacks.md` antes de saber el ecosistema: la idea es traer a contexto solo la columna del stack en juego.

---

## Modificadores de invocación

Las **claves** de los modificadores son siempre en inglés (estándar). Si el usuario no especifica ninguno, asumir `default`. El usuario puede nombrarlos en español; mapéalos a la clave en inglés.

| Modifier | Efecto exacto |
|----------|----------------|
| `default` | Ejecutar todos los checks Bloqueantes, los Condicionales-presentes y el Informativo (Sonar) si hay config, **más** la revisión cualitativa. |
| `blocking-only` | Omitir los checks **Informativos** (hoy solo Sonar). No altera Bloqueantes ni Condicionales. *Coincide con `no-sonar` mientras Sonar sea el único informativo.* |
| `no-sonar` | Omitir Sonar específicamente. |
| `include-linter-warnings` | Tratar los `warning` del linter como `error` (p. ej. `eslint --max-warnings=0`). |
| `include-eslint-warnings` | Alias de `include-linter-warnings` para proyectos Node. |
| `no-tests` | Omitir unit tests, e2e y coverage. Los omitidos se marcan `N/A` (no `SKIPPED`): el usuario lo pidió, no afecta veredicto. |
| `no-unit-tests` | Omitir solo unit tests (→ `N/A`). |
| `no-e2e` | Omitir solo e2e (→ `N/A`). |
| `no-coverage` | Omitir solo coverage (→ `N/A`). |
| `no-typecheck` | Omitir tipado aunque aplique al stack (→ `N/A`). |
| `only <check>` | Ejecutar únicamente ese check (p. ej. `only typecheck`, `only build`, `only e2e`). El resto se omite como `N/A`. |
| `save-report` | Persistir el informe en `docs/code-review/<YYYYMMDD-HHMMSS>.md`. |
| `checks-only` | Ejecutar solo el plano automatizado; omitir la revisión cualitativa. El veredicto no considera hallazgos cualitativos. |
| `qualitative-only` | Ejecutar solo la revisión cualitativa senior; omitir los checks automatizados. |

> Todo check omitido **por modificador del usuario** es `N/A`, nunca `SKIPPED`: una omisión solicitada no convierte el veredicto en Incompleto.

---

## Flujo de ejecución

> **Principio rector:** dos etapas con puertas. (A) Etapa automatizada → debe quedar **sin FAIL** para avanzar. (B) Revisión cualitativa. **Ninguna corrección se aplica sin autorización explícita del usuario.** Tras aplicar una corrección, primero **verifica que el arreglo funciona** re-ejecutando solo el check o la prueba que fallaba; **únicamente si ese check puntual pasa**, dispara el **reinicio** (de la etapa o del review completo) para re-evaluar sobre el código ya corregido. Si el arreglo no resuelve el fallo, sigue iterando la corrección — no reinicies con algo que aún no funciona. Para ahorrar vueltas, si el usuario autoriza varias correcciones, aplícalas juntas, verifícalas y reinicia **una sola vez**.

### Paso 1 — Detectar entorno

1. Identificar el ecosistema y cargar lo relativo a ese stack desde [`references/stacks.md`](references/stacks.md) (categoría por check, comando, parseo). Si no se detecta stack o el monorepo es ambiguo, parar y preguntar.
2. Resolver el comando concreto de cada check (scripts del manifiesto + *fallback* canónico).
3. Capturar metadata: stack detectado, rama (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`), working tree (`git status --porcelain`), y la **intención** del cambio (US/TK, rama, commits) para el Paso 3.

### Paso 2 — Etapa automatizada (puerta dura)

Con `qualitative-only`, saltar este paso. En otro caso, ejecutar **secuencialmente** (no en paralelo) los checks Bloqueantes y Condicionales-con-config-presente, midiendo la duración:

1. **tipado** — solo si Bloqueante (TS) o Condicional con config. Si **FAIL** → **fail-fast**: marcar el resto `— (no ejecutado)` y pasar a la evaluación de la etapa.
2. **linter** — parsear `error` vs `warning` según la herramienta.
3. **unit tests** — comando del stack; *fallback* canónico.
4. **coverage** — PASS/FAIL según la regla del [catálogo](#catálogo-de-checks).
5. **build** — en Java/Go/Rust/.NET cubre la compilación.
6. **e2e** — solo si hay script/tarea/perfil e2e o config Playwright/Cypress.
7. **sonar** — si falta `sonar-project.properties` → `N/A`. Si hay config y red falla → FAIL informativo.

> Al **ejecutar** un check, nunca uses `--fix`, `--write`, `--force` ni equivalentes: falsearían el resultado. La corrección autorizada (abajo) es un paso aparte y deliberado.

**Puerta de la etapa automatizada** — evaluar el conjunto de resultados:

- **Hay al menos un FAIL** (Bloqueante o Condicional-presente): **mostrar el reporte de la etapa al usuario** y **preguntar si quiere que se corrijan** los errores. **No corregir sin autorización.**
  - Si **autoriza la corrección automática** → aplicar los cambios mínimos para resolver los FAIL (sin tocar más de lo necesario), **re-ejecutar el check/prueba que fallaba para confirmar que ya pasa**, y solo entonces **re-ejecutar TODO el set automatizado** (reiniciar el Paso 2). Si el check puntual sigue en FAIL, iterar la corrección antes de reiniciar.
  - Si **corrige manualmente** e indica que ya está → **re-ejecutar el check/prueba que fallaba**; si pasa, **re-ejecutar TODO el set automatizado**; si no, avisar y volver a la corrección.
  - Si **no desea corregir ahora** → terminar con veredicto `❌ No apto`. **No** se ejecuta la revisión cualitativa.
  - Repetir hasta que la etapa quede sin FAIL o el usuario detenga.
- **Solo SKIPPED, sin FAIL** (`⚠️ Incompleto`): reportar el motivo y **preguntar** si resolver el tooling primero o continuar a la cualitativa asumiendo el Incompleto. No avanzar en silencio.
- **Sin FAIL ni SKIPPED**: etapa superada → continuar al Paso 3.

> Con `checks-only`, terminar aquí (no hay Paso 3): construir informe y veredicto solo con la etapa automatizada.

### Paso 3 — Revisión cualitativa senior

Ejecutar solo si la etapa automatizada se superó (o si el modo es `qualitative-only`). Ver [Revisión cualitativa](#revisión-cualitativa-análisis-senior):

1. Obtener el diff bajo revisión (`git diff` contra la rama base acordada, o los archivos que el usuario indique). No revisar todo el repo.
2. Recuperar la **intención** capturada en el Paso 1.
3. Leer [`references/qualitative-review.md`](references/qualitative-review.md) y evaluar las tres dimensiones (semántica, arquitectura/diseño, feedback senior).
4. Emitir hallazgos con severidad (🔴/🟠/🟡/💡). Para cada uno: el porqué, el impacto y una mejora concreta.
5. **Puerta cualitativa** — si hay hallazgos bloqueantes (🔴/🟠), **pausar y pedir** al usuario, por cada uno, **corregir** o **justificar** (ver [Severidad y puerta de aceptación](#severidad-y-puerta-de-aceptación)):
   - **Justificar** → registrar la justificación; el hallazgo deja de bloquear.
   - **Corregir con autorización expresa de corrección automática** → aplicar el cambio, **verificar que funciona** re-ejecutando el check/prueba directamente afectado, y solo si pasa **reiniciar TODO el code review desde el Paso 1**.
   - **Corregir manualmente** (el usuario indica que ya lo hizo) → **verificar** re-ejecutando el check/prueba afectado y, si pasa, **reiniciar TODO el code review desde el Paso 1**.
   - Repetir hasta que no queden bloqueantes sin resolver o el usuario detenga.

### Paso 4 — Construir informe

Rellenar la plantilla [`assets/code-review-template.md`](assets/code-review-template.md) (ver [Formato del informe](#formato-del-informe)):

1. Calcular el veredicto unificado con la tabla de [Veredicto](#veredicto): considera Bloqueantes/Condicionales-presentes (las filas `N/A` no cuentan) **y** los hallazgos cualitativos bloqueantes sin resolver.
2. Tabla resumen de checks: una fila por check ejecutado, `SKIPPED` o `N/A`.
3. Sección de revisión cualitativa: hallazgos por dimensión y severidad, con porqué + sugerencia concreta; si no hay hallazgos en una dimensión, decir explícitamente que está conforme.
4. Detalle de checks **solo** para FAIL o `SKIPPED`; truncar a 10 errores por check (`… y N más`).
5. "Próximas acciones": hallazgos cualitativos 🔴/🟠 sin resolver → FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → `SKIPPED` por config ausente/rota → hallazgos 🟡/💡.

### Paso 5 — Registro y salida

Decidir **dónde** queda el informe según el contexto:

- **La revisión corresponde a una historia de usuario** (rama `feature/US-XXX-*` activa, o el usuario referencia una US, o se trabaja bajo `docs/specs/user-stories/US-XXX-*/`): **escribir** `docs/specs/user-stories/US-XXX-[nombre-corto]/code-review.md` rellenando la plantilla [`assets/code-review-template.md`](assets/code-review-template.md) (checks + revisión cualitativa + veredicto). Si el usuario dio **justificaciones** para hallazgos de las tres dimensiones, completarlas en la sección "Justificaciones aceptadas". Sobrescribir el archivo en re-ejecuciones (es el estado vigente). Mostrar también un resumen en el chat.
- **La revisión no corresponde a ninguna historia de usuario:** **no** escribir archivo; mostrar el informe completo en el chat. (Salvo que el usuario pase `save-report`, que lo persiste en `docs/code-review/<YYYYMMDD-HHMMSS>.md`.)

### Paso 6 — Presentar resultado

Devolver el informe completo (y la ruta del `code-review.md` si se escribió). **No** continuar con `git commit`, push ni merge aunque el veredicto sea `✅ Apto` — salvo instrucción explícita del usuario.

---

## Formato del informe

La estructura canónica del informe está en la plantilla [`assets/code-review-template.md`](assets/code-review-template.md). **Rellénala** (no la reescribas desde cero) para todo informe, tanto el que se muestra en chat como el `code-review.md` que se escribe en la carpeta de una US.

La plantilla incluye: encabezado con metadata y veredicto, **Resumen**, **1. Verificaciones automatizadas** (tabla + detalle de fallidos), **2. Revisión cualitativa (senior)** (intención + las tres dimensiones), **Veredicto** con su justificación de una línea, **Próximas acciones** y **Justificaciones aceptadas**.

Símbolos a usar (exactamente estos):
- Estado de checks: `✅` PASS · `❌` FAIL · `⏭️` SKIPPED · `—` N/A · `ℹ️` informativo (Sonar).
- Severidad cualitativa: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` dimensión conforme.

Reglas al rellenar:
- Incluir solo las filas de checks que aplican; el detalle de checks va **solo** para FAIL o SKIPPED (truncar a 10 errores por check con `… y N más`).
- Si la etapa automatizada no se superó, la sección 2 dice *"No ejecutada — la etapa automatizada no se superó."*
- Si no hubo justificaciones, la sección final dice «Ninguna».

---

## Manejo de errores

| Situación | Cómo actuar |
|-----------|-------------|
| Stack no detectable | Parar antes de ejecutar nada; preguntar al usuario. |
| Monorepo ambiguo | Parar y preguntar qué módulo auditar. |
| Tipado **Bloqueante** (TS) pero falta `tsconfig.json` | `SKIPPED` → `⚠️ Incompleto`. |
| Tipado **Condicional** (Python/Rust) sin config ni herramienta | `N/A`. No afecta veredicto. |
| Tipado **N/A** para el stack (Java, Go, JS, .NET) | No ejecutar; no listar como `SKIPPED`. |
| Tipado **FAIL** (cuando aplica) | **STOP fail-fast.** Resto `— (no ejecutado)`. |
| Runner/build tool ausente del PATH | Parar y preguntar al usuario. |
| Script/tarea definida pero binario inexistente (config rota) | `❌ FAIL` si el comando se intentó y rompió; `⏭️ SKIPPED` si no se pudo ni invocar. Nunca `N/A`. |
| Unit tests sin script ni comando canónico | `SKIPPED` → `⚠️ Incompleto` (unit es Bloqueante). |
| Coverage sin herramienta configurada | `SKIPPED` → `⚠️ Incompleto` (coverage es Bloqueante). |
| Coverage bajo umbral configurado | `❌ FAIL`. |
| Coverage sin umbrales configurados y exit 0 | `✅ PASS`. |
| E2E **Condicional** con config presente pero tool ausente/rota | `SKIPPED` → `⚠️ Incompleto`. |
| E2E sin config ni script de e2e | `N/A`. No afecta veredicto. |
| Build **N/A** (Python sin empaquetado) | Omitir fila; no afecta veredicto. |
| `sonar-scanner` no disponible o falta `sonar-project.properties` | `N/A`. No afecta veredicto. |
| Sonar con config presente y error de red | FAIL informativo. No bloquea veredicto. |
| Ejecución > 10 min en un check | Continuar; avisar al usuario. |
| Working tree sucio | No bloquear; nota en encabezado. |
| No se puede inferir la intención (sin US/TK, rama genérica, commits opacos) | Pedir al usuario una frase con el objetivo del cambio; no inventar intención. |
| Usuario justifica un hallazgo 🔴/🟠 | Registrar la justificación; el hallazgo deja de bloquear. En una US, incluirla en `code-review.md`. |
| Diff vacío o sin cambios de código | No hay nada que revisar cualitativamente; reportarlo y ejecutar solo los checks aplicables. |
| FAIL en la etapa automatizada | Mostrar reporte y **preguntar** si corregir. Nunca corregir sin autorización. Tras corregir (auto autorizada o manual), **re-ejecutar el check que fallaba**; si pasa, **re-ejecutar todo el set automatizado**. |
| Usuario no quiere corregir los FAIL automatizados | Terminar en `❌ No apto`; **no** ejecutar la revisión cualitativa. |
| Corrección de un hallazgo cualitativo 🔴/🟠 (auto autorizada o manual) | Verificar que funciona (re-ejecutar el check/prueba afectado); solo si pasa, reiniciar **todo el code review desde el Paso 1**. |
| Corrección aplicada que **no** resuelve el fallo (el check puntual sigue en FAIL) | **No reiniciar.** Iterar la corrección hasta que el check puntual pase; recién entonces disparar el reinicio. |
| Usuario pide "corrige tú" sin más contexto | Confirmar el alcance exacto a corregir antes de tocar nada; aplicar solo lo mínimo; luego re-ejecutar. |
| Varias correcciones autorizadas a la vez | Aplicarlas juntas y reiniciar **una sola vez** para no encadenar pasadas innecesarias. |
| Bucle de correcciones que no converge | Tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder. |

---

## Anti-patterns

- Asumir TypeScript/Node si el repo es Java, Python u otro stack.
- Ejecutar `tsc --noEmit` en un proyecto Java — la compilación va en **build**.
- Marcar `⚠️ Incompleto` un check Condicional que simplemente **no aplica** (debe ser `N/A`).
- Marcar `N/A` un check cuya config **sí existe** pero falló al ejecutarse (debe ser `SKIPPED` o `FAIL`).
- **Corregir código sin autorización explícita** del usuario — por defecto solo se audita y propone.
- Usar `--fix` / `--write` / `--force` **al ejecutar un check** (falsea el resultado); la corrección autorizada es un paso aparte y deliberado.
- Modificar manifiestos para añadir scripts faltantes.
- Declarar `✅ Apto` con algún Bloqueante o Condicional-presente en `SKIPPED` — es `⚠️ Incompleto`.
- **Avanzar a la revisión cualitativa con algún FAIL automatizado sin resolver** — la etapa automatizada es puerta dura.
- **Corregir y no volver a ejecutar** las pruebas, o no reiniciar el review tras una corrección cualitativa.
- **Reiniciar el review con un arreglo sin verificar** — primero confirma que el check/prueba que fallaba ya pasa, y solo entonces reinicia.
- Aplicar una corrección **automáticamente sin que el usuario la pida expresamente**.
- Cargar `references/stacks.md` antes de detectar el ecosistema, o arrastrar a contexto columnas de stacks que no aplican.
- Continuar tras FAIL de tipado cuando aplica fail-fast.
- Contar filas `N/A` para el veredicto.
- Truncar errores sin `… y N más`.
- Ejecutar checks en paralelo salvo petición explícita.
- Instalar dependencias — reportar `SKIPPED` y dejar al usuario.
- Continuar a commit/push/merge tras `✅ Apto` sin instrucción explícita.
- **Comportarse como una herramienta de CI:** entregar solo la tabla de checks y omitir la revisión cualitativa.
- **Solo reportar violaciones de reglas** sin razonar sobre la intención del diseño ni el impacto en el sistema.
- Dar un hallazgo sin explicar el **porqué** o sin **sugerencia concreta** (un "esto está mal" pelado no es feedback senior).
- Marcar 🔴/🟠 algo que es 🟡/💡 (inflar severidad) o al revés (minimizar un defecto real de diseño).
- Declarar `✅ Apto` con un hallazgo bloqueante sin corregir **ni** justificar.
- Aceptar una justificación y **no registrarla** en el `code-review.md` de la US.
- Escribir `code-review.md` fuera de la carpeta de la US, o no escribirlo estando dentro de una US.
- Revisar todo el repo en lugar del diff bajo revisión.

---

## Notas

### Parseo por herramienta

El detalle de cómo interpretar la salida de cada herramienta (qué cuenta como FAIL, dónde leer el conteo de tests y la cobertura) está junto a cada stack en [`references/stacks.md`](references/stacks.md#parseo-por-herramienta). Consultarlo al evaluar el resultado de un check.

### Relación con otros skills

Usar este skill **solo cuando se le invoca explícitamente**. Fuera de estos dos casos, **no** ejecutarlo (ni de forma proactiva, ni "por si acaso", ni al detectar que se terminó código):

- **El usuario lo pide explícitamente** — solicita una revisión de código, pide validar antes de PR/merge, o nombra este skill.
- **Otro skill lo invoca explícitamente**, por ejemplo:
  - `work-integrate`, que requiere veredicto `✅ Apto` (con los hallazgos cualitativos resueltos o justificados) antes de integrar.
  - `pr-create`, que puede invocarlo de forma bloqueante antes de crear el PR.

Es un proceso **posterior a la implementación**: no forma parte de `work-implement` ni se ejecuta durante el desarrollo de las tareas. Si no hay una invocación explícita —del usuario o de otro skill—, no corresponde usarlo.

### Idioma del informe

Si en el contexto de la sesión de chat existe un **idioma de preferencia del usuario**, redactar el informe en ese idioma. Si no consta, usar el idioma de la conversación. Los mensajes de error de las herramientas no se traducen.