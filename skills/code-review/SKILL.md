---
name: code-review
description: Revisar código antes de aceptarlo para merge en dos planos: (1) verificaciones automatizadas según el stack (tipado, linter, unit tests, coverage, build, e2e, sonar) y (2) revisión cualitativa estilo ingeniero senior — intención del cambio, arquitectura y diseño (SOLID, Clean Architecture, acoplamiento, duplicación) y feedback accionable que explica el PORQUÉ y propone cambios concretos. Devuelve un informe con estado por check, hallazgos con severidad, veredicto unificado (apto/no apto/incompleto) y próximas acciones. Usar SOLO cuando se invoca explícitamente: el usuario pide una revisión de código ("code review", "revisión de código", "revisa antes de PR/merge") o nombra el skill, o lo llama otro skill (p. ej. work-integrate, pr-create). Proceso posterior a la implementación: NO activarlo de forma proactiva ni durante el desarrollo. Nunca corrige por iniciativa propia: solo aplica cambios si el usuario lo autoriza, y tras corregir vuelve a ejecutar las pruebas.
license: MIT
---

# Skill: Revisión de código

Revisar una implementación antes de aceptarla para merge combinando **dos planos complementarios**:

1. **Verificaciones automatizadas** — la batería de checks que el stack exige (tipado, linter, tests, coverage, build, e2e, sonar), adaptada al **stack detectado**.
2. **Revisión cualitativa estilo senior** — razonar sobre la **intención** del cambio, su **diseño y arquitectura**, y dar **feedback accionable** como lo haría un ingeniero senior revisando un PR. Ver [Revisión cualitativa](#revisión-cualitativa-análisis-senior).

Ambos planos alimentan **un único veredicto**.

> **NO te comportes como una herramienta de CI.** Listar exit codes y conteos de errores es solo la mitad del trabajo; la otra mitad es razonar sobre la intención del diseño y el impacto en el sistema. Un informe sin eso está incompleto.
>
> **Alcance:** audita, razona y **propone**. **Nunca corrige por iniciativa propia**; aplica correcciones **solo si el usuario lo autoriza explícitamente** y, tras corregir, **vuelve a ejecutar**. No edita configuración, no instala dependencias ni hace commit/push/merge sin instrucción explícita.
>
> **Proceso iterativo:** dos etapas con puertas; toda corrección reinicia la etapa afectada (o el review completo) hasta un veredicto estable.
>
> **Entrada mínima:** la raíz de un repositorio reconocible (ver [`references/stacks.md`](references/stacks.md)). Si no se detecta stack, parar y avisar.

---

## Mapa de referencias

Carga cada archivo **solo cuando lo necesites** (rutas relativas a la raíz del skill):

| Archivo | Qué contiene | Cuándo leerlo |
|---------|--------------|---------------|
| [`references/execution.md`](references/execution.md) | Flujo de ejecución paso a paso (Pasos 1–6), formato del informe, manejo de errores y anti-patterns. | Al **iniciar** la ejecución del review y ante cualquier situación atípica. |
| [`references/stacks.md`](references/stacks.md) | Detección de ecosistema, categoría de cada check por stack, comandos y parseo por herramienta. | En el Paso 1, **una vez identificado** el stack (no antes). |
| [`references/qualitative-review.md`](references/qualitative-review.md) | Detalle de las tres dimensiones, calibración de severidad y ejemplos de buen/mal feedback. | En el Paso 3, antes de redactar hallazgos cualitativos. |
| [`assets/code-review-template.md`](assets/code-review-template.md) | Plantilla canónica del informe. | En el Paso 4 / 5, para rellenar el informe. |

---

## Modelo de aplicabilidad y veredicto

Todo check pertenece a **una** de estas tres categorías (sin solape).

| Categoría | Cuándo se ejecuta | Si FALLA | Si no se puede ejecutar |
|-----------|-------------------|----------|--------------------------|
| **Bloqueante** | Siempre (el stack lo exige). | `❌ No apto` | Herramienta/config ausente → `SKIPPED` → `⚠️ Incompleto` |
| **Condicional** | Solo si hay config o herramienta del check presente. | `❌ No apto` | Config presente pero binario/tarea rota → `SKIPPED` → `⚠️ Incompleto`. Sin config **ni** herramienta → `N/A` (no afecta veredicto). |
| **Informativo** | Si hay config presente. | No afecta veredicto (FAIL informativo). | `N/A` o `SKIPPED` → no afecta veredicto. |

### SKIPPED vs N/A (definición tajante)

- **`N/A`** = el check **no corresponde** a este repo: ni aplica al stack, ni existe config/herramienta/script. No cuenta para el veredicto (se omite o se marca `— N/A`).
- **`SKIPPED`** = el check **sí correspondía** (Bloqueante, o Condicional con config presente) pero **no pudo ejecutarse** porque la herramienta o la config está ausente o rota. Cuenta como `⚠️ Incompleto`.

> Mnemónica: si el proyecto **declara** que algo debe correr y no corre → `SKIPPED` (Incompleto); si **nunca pidió** ese check → `N/A` (irrelevante).

### Veredicto

El veredicto unifica **los dos planos**: los checks automatizados (esta sección) y los hallazgos de la [revisión cualitativa](#severidad-y-puerta-de-aceptación). Un hallazgo cualitativo **bloqueante** (severidad 🔴 Crítico o 🟠 Mayor) que **no** ha sido corregido ni justificado-y-aceptado cuenta igual que un FAIL para el veredicto.

| Veredicto | Condición exacta |
|-----------|------------------|
| `✅ Apto` | **Cero** FAIL en checks Bloqueantes y Condicionales-presentes, **cero** `SKIPPED`, **y cero** hallazgos cualitativos bloqueantes sin resolver. Informativos / hallazgos menores en cualquier estado. |
| `❌ No apto` | **Al menos un** Bloqueante o Condicional-presente en FAIL, **o** al menos un hallazgo cualitativo bloqueante (🔴/🟠) sin corregir ni justificar. (Tiene prioridad sobre Incompleto.) |
| `⚠️ Incompleto` | **Cero** FAIL y cero hallazgos bloqueantes sin resolver, pero **al menos un** `SKIPPED` (Bloqueante, o Condicional con config rota). |

Precedencia: `❌ No apto` > `⚠️ Incompleto` > `✅ Apto`.

> Un hallazgo bloqueante **justificado por el usuario y aceptado** deja de bloquear, pero se **registra** la justificación (ver el Paso 5 en [`references/execution.md`](references/execution.md)): queda trazado quién aceptó el estado actual y por qué. El comportamiento bajo `qualitative-only` y demás modificadores está en [Modificadores de invocación](#modificadores-de-invocación).

---

## Catálogo de checks

Checks canónicos en **orden de ejecución**. La categoría real depende del stack — ver [`references/stacks.md`](references/stacks.md#aplicabilidad-por-stack).

| # | Check | Categoría base | Política |
|---|-------|----------------|----------|
| 1 | Tipado | Bloqueante o Condicional según stack | **Fail-fast**: si aplica y falla, no se ejecuta nada más. |
| 2 | Linter | Bloqueante o Condicional según stack | Bloquea solo si hay severidad `error`. `warning` = informativo (salvo `include-linter-warnings`). |
| 3 | Unit tests | Bloqueante | FAIL si exit ≠ 0 o algún test falla. |
| 4 | Coverage | Bloqueante | PASS si exit 0 **y** (sin umbrales configurados **o** umbrales cumplidos). FAIL si exit ≠ 0 **o** umbral configurado incumplido. |
| 5 | Build | Bloqueante (Condicional en Python sin empaquetado) | FAIL si exit ≠ 0. En stacks compilados (Java, Go, Rust, .NET) cubre la compilación. Prerrequisito habitual de e2e. |
| 6 | E2E | Condicional | Se ejecuta sobre el artefacto ya compilado. |
| 7 | Sonar | Informativo | Nunca bloquea. |

El orden sigue la pirámide de tests (*rápido → lento*, *dependencias antes que consumidores*): estático (tipado/linter) → unit+coverage → build → e2e → sonar. El fail-fast solo aplica al tipado, para evitar ruido en cascada. Justificación detallada en [`references/execution.md`](references/execution.md#paso-2--etapa-automatizada-puerta-dura).

---

## Revisión cualitativa (análisis senior)

Los checks automatizados verifican que el código **corre y cumple reglas**, no si **resuelve el problema correcto, está bien diseñado o es mantenible**. Eso lo aporta esta fase. **Es obligatoria** (salvo `checks-only`): un informe sin ella está incompleto.

> **Comportamiento exigido:** razona como un ingeniero senior revisando el PR de un compañero. **No** listes solo violaciones de reglas: para cada hallazgo explica **por qué** es un problema, **qué impacto** tiene y propón una mejora concreta. Si el cambio está bien, dilo y explica por qué — el silencio no es feedback.

### Las tres dimensiones

Evalúa el diff (no todo el repo) contra estas tres dimensiones. El detalle de cada rúbrica, la calibración de severidad y ejemplos de buen/mal feedback están en **[`references/qualitative-review.md`](references/qualitative-review.md)** — léelo antes de redactar los hallazgos.

**1. Análisis semántico (intención).** Entender *qué* intenta lograr el cambio y *qué problema* resuelve, y detectar desajustes entre la intención declarada (US/TK, rama, commit, descripción) y lo que el código realmente hace. Banderas: código que resuelve un problema distinto al pedido, criterios de aceptación sin cubrir, efectos colaterales no buscados, lógica que contradice su propio nombre.

**2. Arquitectura y diseño.** Evaluar adherencia a **SOLID**, respeto de los **límites de Clean Architecture / capas** (dominio no depende de infraestructura), y detectar **acoplamiento**, **duplicación** y **abstracción innecesaria** (capas o genericidad que no pagan su coste). Contrastar contra los **patrones ya existentes en el proyecto**: una solución correcta pero ajena al estilo del repo es deuda. Banderas: clase con múltiples responsabilidades, dependencias hacia adentro→afuera, un `if` por tipo que pide polimorfismo, duplicación que debió extraerse, un wrapper sin valor.

**3. Feedback estilo senior.** Cada hallazgo debe ser **accionable y contextual**: explicar el **PORQUÉ** (qué se rompe o encarece a futuro), proponer una **mejora concreta** (idealmente con un esbozo) y mantener el tono de un par que ayuda, no de un linter que regaña. Prioriza por impacto; no abrumes con nitpicks.

### Severidad y puerta de aceptación

Clasifica cada hallazgo. Solo los dos primeros niveles **bloquean**.

| Severidad | Qué califica | Efecto en veredicto |
|-----------|--------------|---------------------|
| 🔴 **Crítico** | Desajuste intención↔implementación, violación grave de límites arquitectónicos, acoplamiento que impide el cambio, defecto de diseño que romperá el sistema o lo desvía del objetivo. | **Bloquea** salvo justificación aceptada. |
| 🟠 **Mayor** | Violación SOLID con impacto real, duplicación significativa, abstracción innecesaria costosa, divergencia fuerte de los patrones del proyecto. | **Bloquea** salvo justificación aceptada. |
| 🟡 **Menor** | Mejoras recomendables sin riesgo sistémico (naming, legibilidad, duplicación pequeña). | No bloquea. |
| 💡 **Sugerencia** | Ideas opcionales, alternativas de estilo. | No bloquea. |

**Ante un hallazgo bloqueante (🔴/🟠), siempre se ofrecen DOS caminos al usuario:**

1. **Corregir** — el skill presenta el cambio sugerido. Sea corrección automática autorizada o manual del usuario, primero **verifica que el arreglo funciona** (re-ejecutando el check/prueba afectado) y solo entonces **reinicia el code review completo** desde el Paso 1 (ver [`references/execution.md`](references/execution.md)).
2. **Justificar** — el usuario explica por qué el estado actual es aceptable; si se acepta, el hallazgo deja de bloquear y la justificación **se registra**.

> El skill **nunca** corrige sin que el usuario lo pida expresamente. Si no autoriza ni justifica, el hallazgo sigue bloqueando.

Mientras haya hallazgos bloqueantes sin resolver, el veredicto es `❌ No apto`. Tras presentarlos, **pausa y pide al usuario** elegir corregir o justificar cada uno antes de finalizar.

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
| `default` | Todos los Bloqueantes, los Condicionales-presentes y el Informativo (Sonar) si hay config, **más** la revisión cualitativa. |
| `blocking-only` | Omitir los **Informativos** (hoy solo Sonar). No altera Bloqueantes ni Condicionales. *Coincide con `no-sonar` mientras Sonar sea el único informativo.* |
| `no-sonar` | Omitir Sonar específicamente. |
| `include-linter-warnings` | Tratar los `warning` del linter como `error` (p. ej. `eslint --max-warnings=0`). |
| `include-eslint-warnings` | Alias de `include-linter-warnings` para Node. |
| `no-tests` | Omitir unit tests, e2e y coverage (→ `N/A`, no `SKIPPED`: lo pidió el usuario). |
| `no-unit-tests` / `no-e2e` / `no-coverage` / `no-typecheck` | Omitir solo ese check (→ `N/A`). |
| `only <check>` | Ejecutar ÚNICAMENTE ese check (p. ej. `only build`) y **omitir la revisión cualitativa**; el resto → `N/A`. En el informe, la sección cualitativa: *"No ejecutada — omitida por modificador `only <check>`."* |
| `save-report` | Persistir el informe en `docs/code-review/<YYYYMMDD-HHMMSS>.md`. |
| `checks-only` | Solo el plano automatizado; omitir la cualitativa (el veredicto no la considera). Sección 2: *"No ejecutada — omitida por modificador `checks-only`."* (distinto de *"… la etapa automatizada no se superó."*). |
| `qualitative-only` | Solo la revisión cualitativa; los checks automatizados cuentan como `N/A` (no `⚠️ Incompleto`). Veredicto SOLO con hallazgos cualitativos: `✅ Apto` si no hay 🔴/🟠 sin resolver. |

> Todo check omitido **por modificador del usuario** es `N/A`, nunca `SKIPPED`: una omisión solicitada no convierte el veredicto en Incompleto.

---

## Flujo de ejecución (resumen)

Dos etapas con puertas. **Ninguna corrección se aplica sin autorización explícita del usuario**; tras corregir, verifica el arreglo y reinicia. El detalle paso a paso, el formato del informe, el manejo de errores y los anti-patterns están en **[`references/execution.md`](references/execution.md)** — léelo al iniciar la ejecución.

1. **Detectar entorno:** identificar stack, cargar `references/stacks.md`, resolver comandos, capturar metadata e intención.
2. **Etapa automatizada (puerta dura):** ejecutar los checks secuencialmente. Si hay FAIL, mostrar reporte y preguntar si corregir; sin FAIL ni SKIPPED, avanzar.
3. **Revisión cualitativa senior:** solo si la etapa automatizada se superó; evaluar las tres dimensiones y emitir hallazgos, con puerta para los 🔴/🟠.
4. **Construir informe:** rellenar [`assets/code-review-template.md`](assets/code-review-template.md) con el veredicto unificado.
5. **Registro y salida:** escribir `code-review.md` en la carpeta de la US si aplica; si no, mostrar en chat (o `save-report`).
6. **Presentar resultado:** devolver el informe. **No** hacer commit/push/merge sin instrucción explícita.

---

## Notas

### Relación con otros skills

Usar este skill **solo cuando se le invoca explícitamente** (ni de forma proactiva, ni "por si acaso", ni al detectar que se terminó código):

- **El usuario lo pide explícitamente** — solicita una revisión de código, validar antes de PR/merge, o nombra este skill.
- **Otro skill lo invoca explícitamente**, p. ej. `work-integrate` (requiere `✅ Apto`, con hallazgos cualitativos resueltos o justificados, antes de integrar) o `pr-create` (puede invocarlo de forma bloqueante antes de crear el PR).

Es un proceso **posterior a la implementación**: no forma parte de `work-implement` ni del desarrollo de tareas. Sin invocación explícita, no corresponde usarlo.

### Resolución de idioma

El idioma del informe se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

Los mensajes de error de las herramientas no se traducen.
