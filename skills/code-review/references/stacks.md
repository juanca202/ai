# Referencia: detección, aplicabilidad, comandos y parseo por stack

Detalle por ecosistema del skill `code-review`. Se carga **solo cuando ya se identificó el stack** (Paso 1 del flujo). Una vez sepas el ecosistema, usa **solo** la columna/sección de ese stack: su categoría por check, su comando y su parseo.

## Contenido

1. [Detección de ecosistema](#detección-de-ecosistema)
2. [Aplicabilidad por stack](#aplicabilidad-por-stack)
3. [Resolución de comandos por stack](#resolución-de-comandos-por-stack)
4. [Parseo por herramienta](#parseo-por-herramienta)

---

## Detección de ecosistema

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

**Stack no detectable:** parar antes de ejecutar nada y preguntar al usuario.

---

## Aplicabilidad por stack

Define la **categoría** de cada check según el stack (Bloqueante / Condicional / N/A / Informativo). La semántica de cada categoría y del veredicto está en `SKILL.md`.

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

(PHP no está tabulado: tratar linter/tests/coverage de forma análoga — `phpstan`/`php-cs-fixer` como Condicional, `phpunit` como Bloqueante — y preguntar si algo no es claro.)

---

## Resolución de comandos por stack

Resolver el comando concreto leyendo scripts/tareas del manifiesto; *fallback* al comando canónico del ecosistema.

| Check | Node | Maven | Gradle | Python | Go | Rust | .NET |
|-------|------|-------|--------|--------|----|------|------|
| Tipado | `tsc --noEmit` | — | — | `mypy .` / `pyright` | — | `cargo check` | — |
| Linter | script `lint` → `eslint` | `mvn checkstyle:check` / plugin | `gradle checkstyleMain` / `lint` | `ruff check` / script `lint` | `golangci-lint run` | `cargo clippy` | `dotnet format --verify-no-changes` |
| Unit | script `test` | `mvn test` | `gradle test` | `pytest` / script `test` | `go test ./...` | `cargo test` | `dotnet test` |
| Coverage | `test:coverage` → `coverage` → *(sin script)* ver nota¹ | JaCoCo en `mvn verify` / `jacoco:report` | `gradle jacocoTestReport` | `pytest --cov` | `go test -coverprofile=...` | `cargo llvm-cov` / tarpaulin | `dotnet test /p:CollectCoverage=true` |
| Build | script `build` → *(sin script)* ver nota² | `mvn package -DskipTests` | `gradle build -x test` | script `build` si existe | `go build ./...` | `cargo build` | `dotnet build` |
| E2E | `test:e2e` → `e2e` | `mvn verify` (Failsafe) / perfil e2e | `gradle e2e` / task custom | script e2e / Playwright | script e2e | script e2e | script e2e |

**Node:** detectar runner por lockfile (`package-lock.json` → npm, `yarn.lock` → yarn, `pnpm-lock.yaml` → pnpm). Leer `package.json.scripts` **antes** de invocar `npx`.

¹ **Coverage/Node sin script `test:coverage` ni `coverage`:** detectar el test runner desde `devDependencies` (`jest`, `vitest`, `mocha`+`nyc`, `ava`, etc.) y usar su bandera nativa de cobertura como comando canónico — `jest --coverage`, `vitest run --coverage`, `nyc mocha`, etc. Si no se puede identificar el runner con certeza, preguntar al usuario en vez de adivinar un comando.

² **Build/Node + TS sin script `build`:** si el repo no tiene bundler propio (Webpack, Vite, esbuild, tsup…) — es decir, un proyecto TS puro que solo transpila — el build canónico es `tsc` (compilación real, **sin** `--noEmit`). Esto es casi el mismo comando que el check de **Tipado** (`tsc --noEmit`), solo que Build sí emite salida. Cuando ambos terminan resolviendo al mismo comando base, ejecutarlos igual como dos checks independientes (siguen siendo señales distintas: Tipado valida tipos, Build valida que el output se genera), pero **señalarlo en el informe** — una nota breve de que Build y Tipado comparten el mismo compilador en este repo — en vez de presentarlos como si fueran verificaciones completamente independientes que por casualidad coinciden.

> Al **ejecutar** un check nunca añadir `--fix`, `--write`, `--force` ni equivalentes: falsearían el resultado. Las correcciones autorizadas por el usuario son un paso aparte y deliberado (ver `SKILL.md` → Flujo de ejecución).

---

## Parseo por herramienta

Cómo interpretar la salida de cada herramienta para decidir PASS/FAIL y extraer conteos.

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
