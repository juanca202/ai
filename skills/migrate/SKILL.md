---
name: migrate
description: Use this skill whenever the user wants to plan or document a technology migration from a source project to a destination project. Triggers include any mention of "migrar", "migración", "migrate", "migration", moving code/modules/features/dependencies between two projects, or comparing/mapping tech stacks across two codebases. The skill works in two steps: first it infers the technology stack of BOTH projects and generates a discovery.md (stack equivalences); then it generates a plan.md (current state, change proposal, validation tests with parity and Golden Master testing, and a phased implementation plan). Both files go under `docs/migrate/MG-XXX-<slug>/` inside the destination project. Use it even when the user only describes what to migrate without explicitly saying "create a migration doc".
---

# Migrate

Documenta una migración entre dos proyectos en **dos pasos**:

1. **Discovery** (`discovery.md`): infiere el stack tecnológico de ambos
   proyectos y mapea las equivalencias entre origen y destino.
2. **Plan** (`plan.md`): a partir del discovery, define el estado actual, la
   propuesta de cambio, las pruebas de validación y el plan de implementación.

El usuario indica **qué** se va a migrar y de **qué proyecto origen** a **qué
proyecto destino**. Ambos archivos se generan dentro de la carpeta de la
migración en el proyecto destino.

## Entradas que necesitas del usuario

1. **Qué se va a migrar** (un módulo, una feature, dependencias, el proyecto
   completo, etc.).
2. **Proyecto origen** y **proyecto destino**: idealmente las rutas a ambos
   repos/carpetas. Si solo te dan descripciones, trabaja con esa información,
   pero deja constancia de los supuestos.

Si falta alguno de estos datos, pídelo de forma breve antes de continuar. No
inventes rutas ni stacks.

## Paso 1 — Discovery (`discovery.md`)

### 1. Inferir el stack tecnológico de ambos proyectos

Inspecciona los archivos de manifiesto/configuración de cada proyecto para
deducir lenguaje, framework, librerías clave, herramientas de build, base de
datos, etc., **con su versión** cuando esté disponible. Pistas habituales:

- Node/JS/TS: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `tsconfig.json`
- Python: `requirements.txt`, `pyproject.toml`, `Pipfile`, `setup.py`
- Java/Kotlin: `pom.xml`, `build.gradle`, `build.gradle.kts`
- Go: `go.mod`
- Ruby: `Gemfile`, `Gemfile.lock`
- PHP: `composer.json`
- .NET: `*.csproj`, `*.sln`
- Rust: `Cargo.toml`
- Infra/otros: `Dockerfile`, `docker-compose.yml`, archivos de CI, configs de DB

Céntrate en los elementos **relevantes para lo que se va a migrar**, no en todo
el árbol de dependencias. Anota la versión exacta cuando exista (p. ej.
`Express 4.18.2`); si no se puede determinar, indícalo como `sin versión`.

### 2. Calcular el ID secuencial `MG-XXX`

Mira la carpeta `<destino>/docs/migrate/`:

- Si existe, busca carpetas con el patrón `MG-XXX-*`, toma el número más alto y
  súmale 1.
- Si no existe ninguna, empieza en `001`.
- Formatea siempre con **3 dígitos y ceros a la izquierda**: `001`, `002`, `017`…

### 3. Crear la carpeta de la migración

Crea `<destino>/docs/migrate/MG-XXX-<slug>/`, donde `<slug>` es una descripción
corta de la migración en *kebab-case* (minúsculas, palabras separadas por
guiones, sin acentos ni caracteres especiales). Ejemplos:

- "Migrar capa de acceso a datos de Sequelize a Prisma" → `MG-003-acceso-datos-prisma`
- "Mover autenticación de Passport a Auth.js" → `MG-008-auth-passportjs-authjs`

### 4. Construir la tabla de equivalencias

Para cada elemento tecnológico relevante detectado en el **origen**, busca su
equivalente en el **destino**:

- Si el destino ya usa una tecnología que cumple la misma función, esa es la
  equivalencia (con su versión si la tienes).
- Si no encuentras equivalente en el destino, escribe explícitamente una nota,
  p. ej. `⚠️ Sin equivalente identificado`.

La tabla tiene tres columnas: **Elemento tecnológico**, **Origen (con versión)**
y **Destino (equivalente o nota)**.

### 5. Determinar el estado

- **Ready**: *todos* los elementos del origen tienen un equivalente identificado
  en el destino (ninguna fila queda con "Sin equivalente identificado").
- **Draft**: al menos un elemento no tiene equivalente, o la información del
  stack está incompleta.

### 6. Escribir `discovery.md`

Copia la plantilla `assets/discovery-template.md` dentro de la carpeta creada,
**renómbrala a `discovery.md`** y rellénala:

- `ID`: `MG-XXX`.
- `Migración`: qué se va a migrar (en una frase).
- `Fecha`: la fecha de hoy en formato `YYYY-MM-DD`.
- `Estado`: `Draft` o `Ready` según la regla anterior.
- `Proyecto origen` / `Proyecto destino`: nombre o stack principal de cada uno.
- La tabla de equivalencias con una fila por elemento tecnológico.
- `Notas`: supuestos, riesgos y decisiones pendientes (sobre todo si quedó en
  `Draft`, explica qué falta).

La ruta final del documento es:
`<destino>/docs/migrate/MG-XXX-<slug>/discovery.md`

## Paso 2 — Plan de migración (`plan.md`)

Una vez generado el discovery, crea el plan de migración **en la misma carpeta**
`MG-XXX-<slug>/`. Copia la plantilla `assets/plan-template.md`, **renómbrala a
`plan.md`** y rellénala apoyándote en el `discovery.md`. El plan debe contener:

### 1. Estado actual

Cómo está hoy lo que se va a migrar. Incluye un **árbol con las rutas de los
archivos que se van a migrar** en el proyecto origen (bloque de código `text`).

### 2. Propuesta de cambio

El estado objetivo. Incluye un **árbol con las rutas de los archivos
resultantes** en el proyecto destino (nuevos o modificados), de forma que se vea
el mapeo origen → destino.

### 3. Pruebas de validación

Cómo se verifica que el comportamiento se conserva. Debe incluir como mínimo:

- **Pruebas de paridad**: comparan la salida del origen vs. la del destino ante
  las mismas entradas para confirmar equivalencia.
- **Golden Master Testing**: se captura la salida actual del origen como
  referencia ("golden master") y se contrasta contra la del destino para
  detectar regresiones.

### 4. Plan de implementación

Los pasos para ejecutar la migración. Puede agruparse **por fases** (Fase 1,
Fase 2, …), con tareas accionables en cada una.

La ruta final del documento es:
`<destino>/docs/migrate/MG-XXX-<slug>/plan.md`

## Resultado

Al terminar, indica al usuario la carpeta de la migración, el ID asignado y los
archivos generados (`discovery.md` y `plan.md`). Para el discovery, menciona el
estado resultante (`Draft` o `Ready`) y por qué quedó así en una línea.
