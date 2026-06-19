---
name: code-review
description: Ejecutar la batería de verificaciones automatizadas de un proyecto de software antes de aceptar una implementación como apta para merge — checks condicionales según stack detectado (tipado, linter, unit tests, coverage, build, e2e, sonar). Usar siempre que el usuario pida "revisión de código", "code review", "valida el código", "ejecuta los checks", "revisa antes de PR/merge", o tras terminar una historia o TK que toque código. Devolver un informe Markdown con estado por check, errores agrupados, veredicto (apto / no apto / incompleto) y próximas acciones priorizadas. No corrige código ni modifica configuración.
license: MIT
---

# Skill: Revisión de código

Ejecutar la batería de verificaciones automatizadas que debe pasar un proyecto antes de aceptar una implementación como apta para merge, adaptando checks y herramientas al **stack detectado**, y devolver un informe estructurado y accionable.

> **Alcance:** solo audita y reporta. No corrige código, no modifica configuración, no instala dependencias.
>
> **Entrada mínima:** estar en la raíz de un repositorio reconocible (ver [Detección de stack](#detección-de-stack)). Si no se detecta ningún stack, parar y avisar.

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

| Veredicto | Condición exacta |
|-----------|------------------|
| `✅ Apto` | **Cero** FAIL en checks Bloqueantes y Condicionales-presentes, y **cero** `SKIPPED`. Informativos en cualquier estado. |
| `❌ No apto` | **Al menos un** Bloqueante o Condicional-presente en FAIL. (Tiene prioridad sobre Incompleto.) |
| `⚠️ Incompleto` | **Cero** FAIL, pero **al menos un** `SKIPPED` (Bloqueante, o Condicional con config rota). |

Orden de precedencia: `❌ No apto` > `⚠️ Incompleto` > `✅ Apto`.

---

## Catálogo de checks

Checks canónicos en **orden de ejecución**. La categoría real (Bloqueante / Condicional / Informativo) depende del stack — ver [Aplicabilidad por stack](#aplicabilidad-por-stack).

| # | Check | Categoría base | Política |
|---|-------|----------------|----------|
| 1 | Tipado | Bloqueante o Condicional según stack | **Fail-fast**: si aplica y falla, no se ejecuta nada más. |
| 2 | Linter | Bloqueante o Condicional según stack | Bloquea solo si hay severidad `error`. `warning` = informativo (salvo `incluir-warnings-linter`). |
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

## Detección de stack

### Paso 0 — Identificar ecosistema

Inspeccionar la raíz del repo. Prioridad de detección por manifiesto:

| Señal (archivo en raíz) | Stack | Gestor de deps / runner |
|-------------------------|-------|-------------------------|
| `package.json` | Node.js / frontend JS | `npm` / `yarn` / `pnpm` (por lockfile) |
| `pom.xml` | Java (Maven) | `mvn` / `mvnw` |
| `build.gradle` / `build.gradle.kts` | Java/Kotlin (Gradle) | `gradle` / `gradlew` |
| `pyproject.toml` / `setup.py` / `requirements.txt` | Python | `poetry` / `pip` / `uv` (por lockfile o config) |
| `go.mod` | Go | `go` |
| `Cargo.toml` | Rust | `cargo` |
| `*.sln` / `*.csproj` | .NET | `dotnet` |
| `composer.json` | PHP | `composer` |

**Tipo Node (TS vs JS):** es Node + TS si existe `tsconfig.json`; en caso contrario, Node JS.

**Monorepo (varios manifiestos):** elegir el módulo según, en este orden: (1) directorio que el usuario indique explícitamente; (2) ruta del diff `git diff --name-only`; (3) si sigue habiendo ambigüedad, **parar y preguntar**. No auditar todos los módulos salvo petición explícita.

### Aplicabilidad por stack

| Check | Node + TS | Node JS | Java/Kotlin | Python | Go | Rust | .NET |
|-------|-----------|---------|-------------|--------|----|------|------|
| Tipado | **Bloqueante** (`tsc --noEmit`) | N/A | N/A¹ | Condicional (`mypy`/`pyright`) | N/A² | Condicional (`cargo check`) | N/A |
| Linter | **Bloqueante** (`eslint`) | **Bloqueante** | Condicional (Checkstyle/SpotBugs/PMD) | Condicional (`ruff`/`flake8`) | Condicional (`golangci-lint`) | Condicional (`clippy`) | Condicional (`dotnet format`/analyzers) |
| Unit tests | **Bloqueante** | **Bloqueante** | **Bloqueante** | **Bloqueante** | **Bloqueante** | **Bloqueante** | **Bloqueante** |
| Coverage | **Bloqueante** | **Bloqueante** | **Bloqueante** (JaCoCo) | **Bloqueante** | **Bloqueante** | **Bloqueante** | **Bloqueante** |
| Build | **Bloqueante** | **Bloqueante** | **Bloqueante** | Condicional³ | **Bloqueante** | **Bloqueante** | **Bloqueante** |
| E2E | Condicional | Condicional | Condicional | Condicional | Condicional | Condicional | Condicional |
| Sonar | Informativo | Informativo | Informativo | Informativo | Informativo | Informativo | Informativo |

¹ En Java/Kotlin la compilación estática ocurre en **build** (`mvn compile`, `gradle build`). No ejecutar un check de tipado separado.
² Go valida tipos en `go build` / `go test`; no añadir paso de tipado duplicado.
³ Python: si hay script/tarea de build → ejecutar (FAIL si exit ≠ 0). Si no hay ninguno → `N/A`.

> **Consecuencia clave del modelo:** un check **Condicional** sin config ni herramienta es `N/A`, **no** `⚠️ Incompleto`. Ej.: Python sin `mypy` → tipado `N/A`; proyecto sin nada de e2e → e2e `N/A`. Solo es `SKIPPED` (Incompleto) cuando la config existe pero la ejecución no es posible.

### Resolución de comandos por stack

Resolver el comando concreto leyendo scripts/tareas del manifiesto; *fallback* al comando canónico del ecosistema.

| Check | Node | Maven | Gradle | Python | Go | Rust | .NET |
|-------|------|-------|--------|--------|----|------|------|
| Tipado | `tsc --noEmit` | — | — | `mypy .` / `pyright` | — | `cargo check` | — |
| Linter | script `lint` → `eslint` | `mvn checkstyle:check` / plugin | `gradle checkstyleMain` / `lint` | `ruff check` / script `lint` | `golangci-lint run` | `cargo clippy` | `dotnet format --verify-no-changes` |
| Unit | script `test` | `mvn test` | `gradle test` | `pytest` / script `test` | `go test ./...` | `cargo test` | `dotnet test` |
| Coverage | `test:coverage` → `coverage` | JaCoCo en `mvn verify` / `jacoco:report` | `gradle jacocoTestReport` | `pytest --cov` | `go test -coverprofile=...` | `cargo llvm-cov` / tarpaulin | `dotnet test /p:CollectCoverage=true` |
| Build | script `build` | `mvn package -DskipTests` | `gradle build -x test` | script `build` si existe | `go build ./...` | `cargo build` | `dotnet build` |
| E2E | `test:e2e` → `e2e` | `mvn verify` (Failsafe) / perfil e2e | `gradle e2e` / task custom | script e2e / Playwright | script e2e | script e2e | script e2e |

**Node:** detectar runner por lockfile (`package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm). Leer `package.json.scripts` **antes** de invocar `npx`.

---

## Modificadores de invocación

Si el usuario no especifica modificador, asumir `default`.

| Modificador | Efecto exacto |
|-------------|----------------|
| `default` | Ejecutar todos los checks Bloqueantes, los Condicionales-presentes y el Informativo (Sonar) si hay config. |
| `solo-bloqueantes` | Omitir los checks **Informativos** (hoy solo Sonar). No altera Bloqueantes ni Condicionales. *Coincide con `sin-sonar` mientras Sonar sea el único informativo.* |
| `sin-sonar` | Omitir Sonar específicamente. |
| `incluir-warnings-linter` | Tratar los `warning` del linter como `error` (p. ej. `eslint --max-warnings=0`). |
| `incluir-warnings-eslint` | Alias de `incluir-warnings-linter` para proyectos Node. |
| `sin-tests` | Omitir unit tests, e2e y coverage. Los omitidos se marcan `N/A` (no `SKIPPED`): el usuario lo pidió, no afecta veredicto. |
| `sin-unit-tests` | Omitir solo unit tests (→ `N/A`). |
| `sin-e2e` | Omitir solo e2e (→ `N/A`). |
| `sin-coverage` | Omitir solo coverage (→ `N/A`). |
| `sin-tipado` | Omitir tipado aunque aplique al stack (→ `N/A`). |
| `solo <check>` | Ejecutar únicamente ese check (p. ej. `solo tipado`, `solo build`, `solo e2e`). El resto se omite como `N/A`. |
| `guardar-informe` | Persistir el informe en `docs/code-review/<YYYYMMDD-HHMMSS>.md`. |

> Todo check omitido **por modificador del usuario** es `N/A`, nunca `SKIPPED`: una omisión solicitada no convierte el veredicto en Incompleto.

---

## Flujo de ejecución

### Paso 1 — Detectar entorno

1. Ejecutar [detección de stack](#paso-0--identificar-ecosistema); si falla, parar y preguntar.
2. Determinar la categoría de cada check (tabla de [aplicabilidad](#aplicabilidad-por-stack)) y resolver el comando concreto (scripts del manifiesto + *fallback* canónico).
3. Capturar metadata: stack detectado, rama (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`), working tree (`git status --porcelain`).

### Paso 2 — Ejecutar checks en orden

Ejecutar **secuencialmente** (no en paralelo) los checks Bloqueantes y los Condicionales-con-config-presente. Medir la duración de cada uno (reloj de pared: inicio/fin).

1. **tipado** — solo si Bloqueante (TS) o Condicional con config. Si **FAIL** → **fail-fast**: marcar el resto `— (no ejecutado)` y saltar al Paso 3.
2. **linter** — solo si aplica y hay herramienta/config. Parsear `error` vs `warning` según la herramienta.
3. **unit tests** — comando del stack; *fallback* canónico.
4. **coverage** — comando del stack. PASS/FAIL según la regla del [catálogo](#catálogo-de-checks).
5. **build** — comando del stack; en Java/Go/Rust/.NET cubre la compilación.
6. **e2e** — solo si hay script/tarea/perfil e2e o config Playwright/Cypress.
7. **sonar** — si falta `sonar-project.properties` → `N/A`. Si hay config y red falla → FAIL informativo.

> Nunca usar `--fix`, `--write`, `--force` ni equivalentes en ninguna herramienta.

### Paso 3 — Construir informe

1. Calcular veredicto con la tabla de [Veredicto](#veredicto), considerando solo Bloqueantes y Condicionales-presentes (las filas `N/A` no cuentan).
2. Tabla resumen: una fila por check ejecutado, `SKIPPED` o `N/A`.
3. Detalle **solo** para FAIL o `SKIPPED`; truncar a 10 errores por check (`… y N más`).
4. "Próximas acciones": FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → `SKIPPED` por config ausente/rota.
5. Si `guardar-informe`, escribir en `docs/code-review/<YYYYMMDD-HHMMSS>.md`.

### Paso 4 — Presentar resultado

Devolver el informe completo. **No** continuar con `git commit`, push ni merge aunque el veredicto sea `✅ Apto` — salvo instrucción explícita del usuario.

---

## Formato del informe

Símbolos de estado (usar exactamente estos): `✅` PASS · `❌` FAIL · `⏭️` SKIPPED · `—` N/A · `ℹ️` informativo (Sonar).

```
## Revisión de Código — <YYYY-MM-DD HH:MM>

- **Repositorio:** <nombre o ruta>
- **Stack:** <p. ej. Node/TypeScript, Java/Maven, Python>
- **Rama:** <rama> · **Commit:** <sha-corto>
- **Working tree:** limpio | sucio (N archivos modificados)
- **Modo:** default | solo-bloqueantes | …

### Resumen

| # | Check      | Comando            | Categoría     | Estado | Detalle               | Duración |
|---|------------|--------------------|---------------|--------|-----------------------|----------|
| 1 | tipado     | tsc --noEmit       | Bloqueante    | ✅      | 0 errores             | 4.1s     |
| 2 | linter     | eslint             | Bloqueante    | ❌      | 3 errors, 5 warnings  | 2.3s     |
| 3 | unit tests | vitest             | Bloqueante    | ✅      | 142 passed, 0 failed  | 18.7s    |
| 4 | coverage   | vitest --coverage  | Bloqueante    | ✅      | 87% (umbral 80%)      | 19.0s    |
| 5 | build      | npm run build      | Bloqueante    | ✅      | OK                    | 12.4s    |
| 6 | e2e        | playwright test    | Condicional   | ⏭️      | config rota           | —        |
| 7 | sonar      | sonar-scanner      | Informativo   | —      | N/A (sin config)      | —        |

### Veredicto: ❌ No apto

### Detalle de checks fallidos
(solo FAIL o SKIPPED)

### Próximas acciones
1. …
```

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

---

## Anti-patterns

- Asumir TypeScript/Node si el repo es Java, Python u otro stack.
- Ejecutar `tsc --noEmit` en un proyecto Java — la compilación va en **build**.
- Marcar `⚠️ Incompleto` un check Condicional que simplemente **no aplica** (debe ser `N/A`).
- Marcar `N/A` un check cuya config **sí existe** pero falló al ejecutarse (debe ser `SKIPPED` o `FAIL`).
- Corregir el código reportado — el skill solo audita.
- Ejecutar herramientas con `--fix` o `--write`.
- Modificar manifiestos para añadir scripts faltantes.
- Declarar `✅ Apto` con algún Bloqueante o Condicional-presente en `SKIPPED` — es `⚠️ Incompleto`.
- Continuar tras FAIL de tipado cuando aplica fail-fast.
- Contar filas `N/A` para el veredicto.
- Truncar errores sin `… y N más`.
- Ejecutar checks en paralelo salvo petición explícita.
- Instalar dependencias — reportar `SKIPPED` y dejar al usuario.
- Continuar a commit/push/merge tras `✅ Apto` sin instrucción explícita.

---

## Notas

### Parseo por herramienta

**TypeScript (`tsc`)** — `<archivo>(<línea>,<columna>): error TS<código>: <mensaje>`. Conteo: líneas con `: error TS`.
**ESLint** — `--format json` en *fallback*. Línea final: `X problems (Y errors, Z warnings)`. `errors > 0` → FAIL.
**Maven/Gradle** — `[ERROR]`, `BUILD FAILURE`; tests: `Tests run: X, Failures: Y`. JaCoCo: tabla de cobertura al final del log.
**pytest / coverage.py** — `X passed`, `Y failed`; cobertura: `TOTAL ... XX%`.
**Vitest/Jest** — Vitest: `Tests P passed | F failed`. Jest: `Tests: P passed, F failed, T total`.
**Go** — `go test`: `ok` / `FAIL`; cobertura: `coverage: X.X% of statements`.
**Cargo** — `test result: ok` / `FAILED`; clippy: `error:` en stderr.
**dotnet** — `Build succeeded` / `Failed`; tests: `Passed!` / `Failed!`.
**Playwright/Cypress (e2e)** — Playwright: `X passed` / `Y failed`. Cypress: `X passing` / `Y failing`.
**Sonar** — código 0 y `EXECUTION SUCCESS`; capturar URL del dashboard si aparece.

### Relación con otros skills

- **work-implement** ejecuta validaciones por TK según el stack. Este skill amplía a la batería completa pre-merge.
- **work-integrate** requiere veredicto `✅ Apto`.
- **pr-create** puede invocar este skill de forma bloqueante antes de crear un PR.

### Idioma del informe

Orden: (1) `preferred language` en `.agents/MEMORY.md`; (2) idioma del turno; (3) preguntar y persistir. Los mensajes de error de las herramientas no se traducen.