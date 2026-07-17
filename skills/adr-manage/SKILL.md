---
name: adr-manage
description: >
  Crear o actualizar Architecture Decision Records (ADRs) en docs/adr/.
  Activar siempre que el usuario quiera documentar, registrar, actualizar o cambiar
  el estado de una decisión arquitectónica — incluso si no usa la palabra "ADR".
  Frases que activan este skill: "registrar decisión", "documentar por qué usamos X",
  "dejar constancia de esta elección técnica", "decision record", "cambiar ADR a Accepted",
  "marcar como Superseded", "crear ADR", "actualizar ADR", "nuevo ADR", "ADR-XXX".
  Usar también cuando el usuario describa una tensión arquitectónica que deba quedar documentada.
license: MIT
---

# Skill: adr-manage

Crea y actualiza Architecture Decision Records siguiendo el flujo de este documento.

> **Alcance de un ADR:** registrar la decisión y su justificación — no la implementación. Puede incluir ejemplos, diagramas y referencias externas de apoyo.
>
> **Narrativa general, no puntual:** un ADR documenta una decisión que afecta a **todo el proyecto**. Por eso el `## Contexto` y la `## Decision` deben redactarse de forma general (una regla, driver o lineamiento arquitectónico transversal), no como la resolución de un problema específico o aislado. Los ejemplos son bienvenidos para ilustrar, pero no deben convertir al ADR en la solución de un caso particular.

La plantilla canónica está en `assets/adr-template.md`. Leerla antes de redactar cualquier ADR.

---

## Resolución de idioma

El idioma del ADR y de los mensajes al usuario se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si hay una preferencia registrada en la memoria del proyecto, usarla.
3. Si no, usar el idioma del mensaje del usuario y **preguntar si desea persistir esa preferencia en la memoria del proyecto**.
4. Si no se puede inferir, **preguntar** qué idioma prefiere; no decidir el idioma por cuenta propia.

---

## Información requerida antes de redactar

Recopilar en **una sola tanda de preguntas** al inicio usando la herramienta de opciones tappables del cliente (máx. 3 preguntas por bloque; opciones cortas y mutuamente excluyentes). No inventar datos — si no están en contexto, preguntar.

| Dato | Fuente preferida | Si no está |
|------|-----------------|------------|
| Problema / tensión arquitectónica | Descripción del usuario | Preguntar |
| Decisión concreta | Descripción del usuario | Preguntar |
| Decisores | Indicado por el usuario | Preguntar siempre |
| Stack tecnológico | `package.json`, `pom.xml`, etc. | Preguntar |
| Alternativas consideradas | Solo si el usuario las mencionó | Omitir la sección si no las mencionó |
| ADRs o docs relacionados | `docs/adr/` + contexto | Preguntar si hay referencias a citar |

> ADRs en estado **Draft** o **Proposed** también requieren problema y decisión tentativa.

---

## Validación de conflictos (solo al crear)

Antes de redactar un ADR nuevo:

1. Leer títulos y sección `## Decision` de todos los ADRs existentes en `docs/adr/`
2. Si hay conflicto (misma tecnología/componente ya `Accepted`, contradicción directa, o duplicación de alcance):
   - **No redactar**; informar al usuario con enlace(s) al ADR en conflicto
   - Sugerir: (a) actualizar el existente, (b) crear nuevo marcando el anterior como `Superseded`, o (c) ajustar el alcance

---

## Flujo: Crear ADR nuevo

1. **Número secuencial** — listar `docs/adr/ADR-*.md`, tomar el más alto + 1; si no hay ninguno, empezar en `001`. Nunca pedir el número al usuario. Si se crean varios ADR en una misma tanda (p. ej. invocado por `adr-discover` para varios candidatos), recalcular el número releyendo los archivos ya escritos antes de cada nuevo ADR, para evitar colisiones de numeración.
2. **Nombre de archivo** — `ADR-XXX-<slug>.md` (minúsculas, kebab-case, corto)
3. **Recopilar información faltante** (ver tabla anterior)
4. **Escribir el ADR** desde `assets/adr-template.md`:
   - `Fecha de creación` = hoy; `Última actualización` = hoy
   - Estado por defecto: `Draft`
5. **Evaluar y (opcionalmente) crear la fitness function** — ver sección [Fitness function al crear un ADR](#fitness-function-al-crear-un-adr). Al crearla, **registrarla en el agrupador de validaciones de arquitectura** — ver sección [Agrupador de validaciones de arquitectura](#agrupador-de-validaciones-de-arquitectura).
6. **Ofrecer instalar dependencias referenciadas ausentes** — ver sección [Dependencias referenciadas por el ADR](#dependencias-referenciadas-por-el-adr).
7. **Actualizar `docs/adr/README.md`**:
   - Si no existe, crearlo con encabezado y lista vacía
   - Añadir `- [ADR-XXX: Título](ADR-XXX-slug.md)` en orden ascendente
   - Nunca reordenar ni eliminar entradas existentes
8. **Confirmar** mostrando ruta del ADR y la línea añadida al README (y, si aplica, la fitness function, el comando agrupador `sh scripts/arch/verify-architecture.sh` que la incluye, y las dependencias instaladas)

---

## Fitness function al crear un ADR

Toda decisión arquitectónica debería poder verificarse de forma continua. Al crear un ADR, evaluar
si es **apto** para una fitness function (un chequeo automatizado que valida su cumplimiento) y
completar en consecuencia la sección `## Fitness function` del documento.

1. **Evaluar aptitud.** ¿El cumplimiento es objetivo y automatizable con una prueba/regla determinista?
   - **No apto** (depende de criterio humano o evidencia externa, p. ej. "el código debe ser legible", "TLS en producción"): registrar `Apto: No`, `Estado: No aplica` y explicar brevemente por qué. **No** preguntar nada más. Fin.
   - **Apto**: continuar al paso 2.

2. **Preguntar explícitamente al usuario** con la herramienta de preguntas estructuradas si quiere crear la fitness function ahora:

   > "Esta decisión es apta para una fitness function (chequeo automatizado). ¿Quieres que la cree ahora?"
   > Opciones: [Sí, crearla ahora] / [No, dejarla como pendiente]

   Una sola pregunta, opciones mutuamente excluyentes. No crear nada sin la aprobación explícita del usuario.

3. **Según la respuesta:**
   - **No** → registrar `Apto: Sí`, `Estado: Pendiente` y dejar `Herramienta`/`Ubicación`/`Comando` como `TODO`. `adr-audit` la reportará como sugerencia.
   - **Sí** → crear la fitness function (paso 4) y luego referenciarla en el ADR (paso 5).

4. **Crear la fitness function:**
   - Detectar el stack (manifiestos: `package.json`, `pom.xml`, `pyproject.toml`, `*.csproj`, `go.mod`, etc.) y elegir la herramienta idónea: dependency-cruiser / ESLint boundaries (JS/TS), ArchUnit (JVM), import-linter (Python), NetArchTest (.NET), o un script de CI genérico si no hay una herramienta natural.
   - Si ya existe configuración de esa herramienta en el repo, **añadir la nueva regla** ahí en vez de duplicar setup. Si no existe, crear el archivo mínimo (test/script + config) en una ubicación convencional (`tests/arch/`, `arch/`, `scripts/`, etc.).
   - Escribir el chequeo que corresponde a la `## Decision` del ADR (p. ej. prohibir imports que violen la capa, o endpoints REST cuando la decisión es GraphQL).
   - Confirmar con el usuario el comando acotado para ejecutarla. No ejecutar build ni suites completas por iniciativa propia; si hace falta instalar dependencias, avisar al usuario.

5. **Registrar la fitness function en el agrupador** — dejarla enganchada al punto de entrada único que ejecuta *todas* las validaciones de arquitectura del proyecto. Ver [Agrupador de validaciones de arquitectura](#agrupador-de-validaciones-de-arquitectura). En resumen: crear (si no existe) `scripts/arch/verify-architecture.sh` y añadir el wrapper `scripts/arch/checks/ADR-XXX-<slug>.sh` que invoca el comando acotado del paso 4.

6. **Referenciar en el ADR:** completar la sección `## Fitness function` con `Apto: Sí`, `Estado: Creada`, `Herramienta`, `Ubicación` (ruta real del test/script creado o del wrapper en `scripts/arch/checks/`) y `Comando` (el comando acotado individual). Así `adr-audit` la descubre y ejecuta directamente desde el ADR, y además queda incluida en el agrupador `scripts/arch/verify-architecture.sh`.

> Cuando `adr-manage` es invocado en lote (p. ej. por `adr-discover`), hacer esta evaluación por cada ADR apto, pero agrupar de forma razonable para no abrumar: se puede preguntar una vez si el usuario quiere crear fitness functions para todos los ADR aptos del lote, o elegir cuáles. Cada fitness function creada en el lote se registra en el mismo agrupador (un wrapper por ADR en `scripts/arch/checks/`).

---

## Agrupador de validaciones de arquitectura

Las fitness functions individuales tienden a quedar dispersas (una en `tests/arch/`, otra en un
`.dependency-cruiser.js`, otra en un script suelto), y entonces no hay un único comando que las
ejecute todas. Por eso el proyecto mantiene **un punto de entrada único** que corre *todas* las
validaciones de arquitectura registradas. La fitness function individual puede seguir existiendo en
su ubicación natural; el agrupador no la reemplaza, la **orquesta**.

### Convención

```
scripts/arch/
├── verify-architecture.sh   # Agrupador: descubre y ejecuta TODOS los checks
└── checks/
    ├── ADR-012-graphql.sh    # Un wrapper por ADR (nombre = ADR-XXX-<slug>.sh)
    └── ADR-018-layers.sh
```

- **`scripts/arch/verify-architecture.sh`** — corre cada `checks/*.sh`, imprime `PASS`/`FAIL` por
  ADR y un resumen, y sale con código `0` solo si todas pasan (distinto de `0` si alguna falla, apto
  como gate de CI o local). **Se descubre por convención: no se edita al añadir validaciones.**
- **`scripts/arch/checks/ADR-XXX-<slug>.sh`** — un wrapper delgado por ADR que invoca la fitness
  function real (dependency-cruiser, ArchUnit, import-linter, NetArchTest o un script propio). El
  nombre `ADR-XXX-<slug>.sh` permite mapear cada resultado a su ADR. Si el chequeo real vive en otra
  herramienta (p. ej. un test JVM en `tests/arch/`), el wrapper solo lo invoca — no se duplica la lógica.

Los archivos de referencia de esta convención están en `assets/arch-fitness/`
(`verify-architecture.sh`, `checks/ADR-XXX-example.sh.template` y un `README.md`). **Leerlos antes de
crear o modificar el agrupador** y copiarlos al repo respetando las rutas.

### Cómo registrar una fitness function

Al crear una fitness function apta (paso 4 anterior), engancharla al agrupador:

1. **Asegurar el agrupador.** Si `scripts/arch/verify-architecture.sh` no existe, crearlo copiando
   `assets/arch-fitness/verify-architecture.sh` (y el `README.md` de esa carpeta) tal cual. Crear el
   directorio `scripts/arch/checks/` si falta. Si ya existe el agrupador, no tocarlo — descubre los
   checks solo.
2. **Añadir el wrapper del ADR.** Crear `scripts/arch/checks/ADR-XXX-<slug>.sh` a partir de
   `assets/arch-fitness/checks/ADR-XXX-example.sh.template`, reemplazando el comando por el chequeo
   acotado del paso 4 (p. ej. `exec npx depcruise --config .dependency-cruiser.js src`). El wrapper
   debe salir `0` si la decisión se cumple y distinto de `0` si se viola.
3. **Cablear el atajo nativo (opcional, según stack).** Si el repo tiene un mecanismo natural,
   añadir un alias que llame al agrupador sin duplicar lógica: script `arch` en `package.json`
   (`"arch": "sh scripts/arch/verify-architecture.sh"`), un target de `Makefile`, un job de CI, etc.
   No inventar setup pesado; es solo un alias al mismo entrypoint.
4. **No ejecutar** el agrupador ni el check por iniciativa propia si requiere instalar dependencias o
   correr suites pesadas; ofrecer el comando acotado y dejar que el usuario decida (igual que con la
   fitness function individual).

> **Stacks sin `sh` (p. ej. Windows puro).** Mantener el mismo contrato con el equivalente idóneo
> (un `verify-architecture.ps1`, o un runner en el lenguaje del repo que descubra y ejecute los
> checks). Lo esencial es que exista **un** comando que ejecute todas las validaciones y devuelva un
> código de salida agregado.

---

## Dependencias referenciadas por el ADR

Una decisión suele implicar tecnologías concretas (una librería, framework o herramienta). Si el ADR
referencia una dependencia que **aún no está en el proyecto**, ofrecer instalarla y configurarla —
pero solo **después de haber creado el ADR** y con aprobación explícita del usuario.

1. **Extraer las dependencias concretas** que la decisión implica, de `## Decision` (y `## Contexto`).
   Contar solo dependencias reales e instalables (p. ej. `GraphQL → @apollo/server`, `Prisma`,
   `Spring Web`), no conceptos abstractos ("arquitectura hexagonal" no es una dependencia). No inventar
   nombres de paquete: si el paquete exacto no es claro, preguntarlo en lugar de asumirlo.

2. **Comprobar si ya existen** en el proyecto, leyendo el manifiesto del ecosistema y su lockfile:
   `package.json`, `pom.xml`/`build.gradle`, `pyproject.toml`/`requirements.txt`, `*.csproj`,
   `go.mod`, `Cargo.toml`, etc. Si todas están presentes, no hay nada que ofrecer — fin.

3. **Si falta una o más, preguntar explícitamente** con la herramienta de preguntas estructuradas:

   > "El ADR referencia dependencias que no están en el proyecto: `<lista>`. ¿Quieres que las instale y configure ahora?"
   > Opciones: [Sí, instalar y configurar] / [No, solo dejar constancia en el ADR]

   Una sola pregunta, opciones mutuamente excluyentes. Como un ADR nuevo nace en estado `Draft` (la
   decisión aún puede no ser final), mencionar ese matiz si es relevante. **No instalar nada sin la
   aprobación explícita del usuario.**

4. **Si acepta:**
   - Instalar con el gestor del ecosistema detectado (`npm`/`pnpm`/`yarn`, `pip`/`poetry`/`uv`,
     Maven/Gradle, `dotnet add package`, `go get`, `cargo add`, etc.), respetando el que ya use el repo.
     Preferir dependencias de desarrollo (`--save-dev`, `--dev`) cuando sean herramientas de build/test.
   - Aplicar la **configuración mínima** necesaria para que quede operativa (archivo de config, entrada
     en el manifiesto, wiring básico), sin construir la feature completa: eso es implementación, no
     alcance del ADR.
   - Mostrar los comandos ejecutados y los archivos tocados. No correr build ni despliegues por
     iniciativa propia; si la instalación requiere pasos con efectos amplios, avisar antes.

5. **Si rechaza:** dejar constancia en el ADR (p. ej. en `## Consecuencias` o `## Referencias`) de que
   la dependencia queda pendiente de instalar, para que sea visible en una futura auditoría.

> En invocación en lote (desde `adr-discover`), agrupar: preguntar una vez por el conjunto de dependencias ausentes de todos los ADR creados, no una vez por ADR.

---

## Flujo: Actualizar ADR existente

1. Identificar el archivo por número, slug o título
2. Leer el contenido completo antes de editar
3. Aplicar los cambios; actualizar `Última actualización` a hoy; **nunca** tocar `Fecha de creación`
4. Si el nuevo estado es `Superseded`: agregar en `## Referencias`:
   ```
   - Superseded by: [ADR-XXX: Título](ADR-XXX-slug.md)
   ```
   Si el usuario no indicó el ADR reemplazante, preguntar antes de guardar.
   Si el nuevo estado es `Deprecated`: marcar `Estado: Deprecated`, actualizar `Última actualización` a hoy y registrar en `## Referencias` el motivo de la obsolescencia; si otro ADR lo reemplaza, enlazarlo con ruta relativa `[ADR-XXX: Título](ADR-XXX-slug.md)`.
5. Actualizar `docs/adr/README.md` si el título cambió
6. **Confirmar** mostrando los campos modificados

---

## Convenciones de metadatos

| Campo | Regla |
|-------|-------|
| `Estado` | `Draft` · `Proposed` · `Accepted` · `Deprecated` · `Superseded` |
| `Fecha de creación` | Fecha real de creación — nunca modificar |
| `Última actualización` | Fecha de hoy en cada escritura |
| `Decisores` | Nombres o roles |
| `Etiquetas` | Palabras clave (tecnología, dominio) |

---

## Referencias

- [Architecture Decision Records](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions — Cognitect](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)