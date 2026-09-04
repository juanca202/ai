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

Para cada manifiesto encontrado, extraer también framework(s) principal(es) y su versión cuando esté disponible (p. ej. leer `dependencies`/`devDependencies` de `package.json`, secciones `[project.dependencies]` de `pyproject.toml`, etc.). Esto alimenta directamente la sección `# Stack tecnológico` de `AGENTS.md` en el cierre (Paso 5).

**Resultado:**

- **Se detectó al menos un manifiesto** → el stack ya existe; no se pregunta ni se investiga (situación "con código base" o "con implementación", ver § 2 — se salta el Paso 2). El detalle recolectado aquí es el que se usa para redactar el stack definitivo en el cierre.
- **No se detectó ningún manifiesto** (carpeta vacía o solo con documentación/config genérica como `.gitignore`, `README.md`) → situación "sin código"; el Paso 2 es obligatorio.

## 2. Las cuatro situaciones (sin código / con código base / con implementación / solo specs)

Esta es la clasificación que aplica el Paso 1.2 de `SKILL.md`. Las primeras tres son una escala de una sola dimensión — no dos preguntas independientes ("¿hay stack?" + "¿hay features?") sino un único diagnóstico que las combina, porque en la práctica "con implementación" siempre implica stack detectado. **Solo specs** es distinta: no es un punto más avanzado o menos avanzado de esa escala, es un eje aparte — un repositorio que **nunca** va a tener código de aplicación, porque su único propósito es contener documentación o especificaciones. Un repositorio "sin código" todavía va a tener código (más adelante, vía el Paso 2); uno "solo specs" no.

### Señales de "sin código"

- No hay ningún manifiesto de los listados en § 1.
- El repo (si existe) está vacío o solo tiene archivos genéricos: `.gitignore`, `README.md` sin contenido específico, licencia.

### Señales de "solo specs"

La ausencia de manifiestos por sí sola **no** distingue "sin código" de "solo specs" — un proyecto greenfield normal también empieza vacío. Lo que sí distingue:

- **En modo multi-repo, el repositorio de especificaciones es siempre "solo specs"** — no se evalúa por señales ni se pregunta: es automático por definición (`references/multi-repo.md § 8`). Esta regla no aplica a los submódulos, que sí pasan por esta clasificación como cualquier repo único.
- Para cualquier otro repositorio (único, o un submódulo), inferir de lo que el usuario ya dijo: si al describir el repositorio (Paso 1.0 § 2.3 de `multi-repo.md`, o la necesidad del Paso 2.1) señaló explícitamente que es un repositorio de documentación/especificaciones y no va a tener código propio, tratarlo como "solo specs" sin volver a preguntar.
- Si no hay evidencia en ninguna dirección y el repositorio no tiene manifiestos ni código, **no asumir "sin código" por defecto**: preguntar explícitamente (ver "Si la señal es ambigua" más abajo) — la diferencia cambia si el Paso 2, el Paso 4 y los índices de arquitectura aplican o no.

### Señales de "con código base"

- Hay al menos un manifiesto de § 1 (el stack ya está decidido), pero el código fuente que trae —excluyendo config, lockfiles, `node_modules`/`vendor`/`.venv`, `dist`/`build`, `.git`— se reduce a lo que genera el scaffold del framework por defecto (p. ej. `App.tsx`/`App.jsx` de ejemplo, endpoint "hello world", controlador de muestra).
- El historial de git (si existe) tiene solo el commit inicial o commits de scaffold (`chore: initial commit`, `feat: project setup`, etc.), sin commits de funcionalidades de negocio.
- `docs/specs/` no existe o está vacío (sin `user-stories/`, `work-items/` con contenido).
- El `README.md`, si existe, describe el stack/setup pero no funcionalidades específicas del dominio.

### Señales de "con implementación"

- Hay módulos, rutas/endpoints, modelos de dominio o componentes con nombres propios del negocio (no genéricos de ejemplo).
- Existen tests que verifican lógica de negocio (no solo el test de ejemplo del scaffold).
- `docs/specs/user-stories/`, `docs/specs/work-items/` o sus equivalentes bajo `docs/archive/` ya tienen contenido (un repo cuyo trabajo esté todo archivado **no** es greenfield).
- El historial de git tiene múltiples commits de features a lo largo del tiempo.

### Si la señal es ambigua

No asumir: preguntar al usuario con la herramienta estructurada — *"¿Cómo describirías el punto de partida de este proyecto?"* con opciones `Sin código (carpeta vacía o casi, pero va a tener código)` / `Con código base (scaffold, sin funcionalidades propias)` / `Con implementación (ya tiene funcionalidades)` / `Solo especificaciones o documentación (nunca va a tener código de aplicación)`.

### Por qué importa

- **Sin código** → el Paso 2 (conseguir el stack) es obligatorio completo: capturar la necesidad, sugerir o investigar, instalar.
- **Con código base** → se salta el Paso 2; el stack ya está decidido por el scaffold. El Paso 4.1 usa esa decisión de stack (sin alternativas registradas, salvo que el usuario las mencione) como candidato de arquitectura **si aplica** — sigue sujeto al mismo criterio de exclusión de candidatos triviales de `references/adr-candidates.md` § 2 (punto 1): si es la elección obvia y sin comparación real de un scaffold, se puede dejar pasar sin proponerlo, o documentarlo igual como ADR con `emits: []` solo si el usuario lo pide.
- **Con implementación** → se salta el Paso 2 igual que "con código base". Además, el Paso 4.1 delega en un subagente de `arch-discover` para minar las decisiones y reglas ya implícitas en el código — no se asume que la única decisión relevante sea el stack. La compuerta de calidad (Paso 4.2) debe partir de lo que **ya existe** (tests actuales) en vez de proponer un set desde cero.
- **Solo specs** → se salta el Paso 2 (no hay stack que conseguir) **y** el Paso 4 completo (no hay código que genere candidatos de arquitectura ni que necesite compuerta de calidad). El Paso 3 tampoco crea `docs/adr/README.md` ni `docs/standards/README.md` para este repositorio, bajo ninguna circunstancia — no es una pregunta de opt-in/opt-out como la de submódulos con código, es automático. Detalle completo en `SKILL.md` § Paso 3 punto 4-5 y, para el caso multi-repo, `references/multi-repo.md § 6`.
