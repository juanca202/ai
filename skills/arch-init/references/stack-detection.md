# Detección de stack y diagnóstico del proyecto

Leer esta referencia en el **Paso 1** de `SKILL.md`, antes de decidir si hace falta el Paso 2 (conseguir el stack).

## 1. Manifiestos por ecosistema

Buscar en la raíz del proyecto (y un nivel de subcarpetas si el repo es un monorepo) los siguientes archivos. La presencia de **cualquiera** de ellos cuenta como "stack detectado" para ese lenguaje/ecosistema.

| Ecosistema | Manifiestos / pistas |
| ---------- | --------------------- |
| Node / JS / TS | `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `tsconfig.json` |
| Python | `pyproject.toml`, `requirements.txt`, `Pipfile`, `setup.py`, `setup.cfg` |
| Java / Kotlin | `pom.xml`, `build.gradle`, `build.gradle.kts` |
| Go | `go.mod` |
| Ruby | `Gemfile`, `Gemfile.lock` |
| PHP | `composer.json` |
| .NET | `*.csproj`, `*.sln`, `*.fsproj` |
| Rust | `Cargo.toml` |
| Elixir | `mix.exs` |
| Móvil nativo | `Podfile`/`*.xcodeproj` (iOS), `build.gradle` + `AndroidManifest.xml` (Android), `pubspec.yaml` (Flutter) |
| Infra / contenedores | `Dockerfile`, `docker-compose.yml`, `*.tf`, manifiestos de Kubernetes (no determinan el stack de aplicación por sí solos, pero suman contexto) |

Para cada manifiesto encontrado, extraer también framework(s) principal(es) y su versión cuando esté disponible (p. ej. leer `dependencies`/`devDependencies` de `package.json`, secciones `[project.dependencies]` de `pyproject.toml`, etc.). Esto alimenta directamente la sección `## Stack tecnológico` de `AGENTS.md` en el cierre (Paso 5).

**Resultado:**

- **Se detectó al menos un manifiesto** → el stack ya existe; no se pregunta ni se investiga (situación "con código base" o "con implementación", ver § 2 — se salta el Paso 2). El detalle recolectado aquí es el que se usa para redactar el stack definitivo en el cierre.
- **No se detectó ningún manifiesto** (carpeta vacía o solo con documentación/config genérica como `.gitignore`, `README.md`) → situación "sin código"; el Paso 2 es obligatorio.

## 2. Las tres situaciones (sin código / con código base / con implementación)

Esta es la clasificación que aplica el Paso 1.2 de `SKILL.md`. Es una escala de una sola dimensión — no dos preguntas independientes ("¿hay stack?" + "¿hay features?") sino un único diagnóstico que las combina, porque en la práctica "con implementación" siempre implica stack detectado.

### Señales de "sin código"

- No hay ningún manifiesto de los listados en § 1.
- El repo (si existe) está vacío o solo tiene archivos genéricos: `.gitignore`, `README.md` sin contenido específico, licencia.

### Señales de "con código base"

- Hay al menos un manifiesto de § 1 (el stack ya está decidido), pero el código fuente que trae —excluyendo config, lockfiles, `node_modules`/`vendor`/`.venv`, `dist`/`build`, `.git`— se reduce a lo que genera el scaffold del framework por defecto (p. ej. `App.tsx`/`App.jsx` de ejemplo, endpoint "hello world", controlador de muestra).
- El historial de git (si existe) tiene solo el commit inicial o commits de scaffold (`chore: initial commit`, `feat: project setup`, etc.), sin commits de funcionalidades de negocio.
- `docs/specs/` no existe o está vacío (sin `user-stories/`, `work-items/` con contenido).
- El `README.md`, si existe, describe el stack/setup pero no funcionalidades específicas del dominio.

### Señales de "con implementación"

- Hay módulos, rutas/endpoints, modelos de dominio o componentes con nombres propios del negocio (no genéricos de ejemplo).
- Existen tests que verifican lógica de negocio (no solo el test de ejemplo del scaffold).
- `docs/specs/user-stories/` o `docs/specs/work-items/` ya tienen contenido.
- El historial de git tiene múltiples commits de features a lo largo del tiempo.

### Si la señal es ambigua

No asumir: preguntar al usuario con la herramienta estructurada — *"¿Cómo describirías el punto de partida de este proyecto?"* con opciones `Sin código (carpeta vacía o casi)` / `Con código base (scaffold, sin funcionalidades propias)` / `Con implementación (ya tiene funcionalidades)` / `No estoy seguro, revísalo tú y decide`.

### Por qué importa

- **Sin código** → el Paso 2 (conseguir el stack) es obligatorio completo: capturar la necesidad, sugerir o investigar, instalar.
- **Con código base** → se salta el Paso 2; el stack ya está decidido por el scaffold. El Paso 4.1 usa esa decisión de stack (sin alternativas registradas, salvo que el usuario las mencione) como candidato de arquitectura **si aplica** — sigue sujeto al mismo criterio de exclusión de candidatos triviales de `references/adr-candidates.md` § 2 (punto 1): si es la elección obvia y sin comparación real de un scaffold, se puede dejar pasar sin proponerlo, o documentarlo igual como ADR con `emits: []` solo si el usuario lo pide.
- **Con implementación** → se salta el Paso 2 igual que "con código base". Además, el Paso 4.1 delega en un subagente de `arch-discover` para minar las decisiones y reglas ya implícitas en el código — no se asume que la única decisión relevante sea el stack. La compuerta de calidad (Paso 4.2) debe partir de lo que **ya existe** (tests actuales) en vez de proponer un set desde cero.
