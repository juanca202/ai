---
name: arch-manage
description: >
  Crear o actualizar la arquitectura documentada del proyecto: Architecture Decision Records
  (ADR, en docs/adr/) y estándares de arquitectura por dominio (en docs/standards/). Un ADR registra
  una decisión (el "por qué", histórico e inmutable); un estándar es un documento normativo de dominio
  (p. ej. "Testing Standards") que agrupa varios requisitos verificables — el "qué hay que cumplir hoy".
  Cada decisión que establece una regla añade o actualiza un requisito dentro del estándar de dominio
  que corresponda (no crea un estándar por decisión). Activar siempre que el usuario quiera documentar,
  registrar, actualizar o cambiar el estado de una decisión arquitectónica o de una norma/convención del
  proyecto — incluso si no usa las palabras "ADR" o "estándar".
  Frases que activan este skill: "registrar decisión", "documentar por qué usamos X",
  "dejar constancia de esta elección técnica", "decision record", "cambiar ADR a Accepted",
  "marcar como Superseded", "crear ADR", "actualizar ADR", "nuevo ADR", "ADR-XXX",
  "definir un estándar", "documentar la convención de X", "actualizar el estándar de testing", "añadir un requisito".
  Usar también cuando el usuario describa una tensión arquitectónica que deba quedar documentada.
license: MIT
---

# Skill: arch-manage

Crea y actualiza los dos artefactos de arquitectura del proyecto — **ADRs** y **estándares de dominio** —
siguiendo el flujo de este documento.

## Concepto: ADR ≠ estándar (y el estándar es más amplio)

Este skill mantiene separados dos artefactos que suelen confundirse. La distinción es la razón de ser
de esta versión: **el ADR es la decisión; el estándar es la norma de dominio que la decisión alimenta.**

| | **ADR** (`docs/adr/`) | **Estándar** (`docs/standards/`) |
|---|---|---|
| Qué es | El registro de **una decisión** arquitectónica en un punto del tiempo | Un documento normativo de **dominio** (p. ej. *Testing Standards*) que **agrupa varios requisitos** |
| Granularidad | Fino: una decisión | **Amplio: un dominio** entero, alimentado por muchas decisiones |
| Pregunta que responde | *¿Por qué* elegimos X sobre Y? | *¿Qué* debe cumplir el proyecto hoy en este dominio, y *cómo* se verifica |
| Naturaleza | Histórico, narrativo, **inmutable** una vez `Accepted` | **Vivo y prescriptivo**; crece y se actualiza a medida que llegan nuevas decisiones |
| Contenido | Contexto, drivers, decisión, alternativas, consecuencias | Requisitos redactados con **RFC 2119 / RFC 8174** (MUST/SHOULD/MAY…), cada uno con su alcance, excepciones y verificación |
| Verificación | No se audita en sí mismo (es historia) | **Es lo que audita `arch-audit`**: cada requisito con su fitness function |
| Relación | **Emite/actualiza** requisitos (`emits`) dentro de un estándar de dominio | **Nace de** los ADR que aportaron sus requisitos (`source_adrs`) |

### El estándar es de dominio, no de decisión

La clave de esta versión: **un estándar no es "usar PHPUnit para unit tests".** Ese es un *requisito*.
El estándar es **"Testing Standards"**, el documento de dominio (identificado por su **nombre**, sin
código) que contiene ese requisito («Unit testing») y todos los demás del mismo dominio.

- Decides *"unit tests con PHPUnit"* → no creas el estándar "usar PHPUnit"; creas (o actualizas) el
  estándar de dominio **`Testing Standards`** (`docs/standards/testing.md`) y añades dentro el requisito
  **Unit testing**: *"Las pruebas unitarias **MUST** implementarse con PHPUnit."*
- Después decides *"e2e con Playwright"* → **no** creas un estándar nuevo: **añades** al mismo
  `Testing Standards` el requisito **E2E testing**: *"Las pruebas end-to-end **MUST** implementarse con
  Playwright."*

Así el estándar de dominio va agregando requisitos, cada uno trazable a su ADR de origen.

> **Requisitos en lenguaje normativo (RFC 2119 / RFC 8174).** Cada requisito del estándar se redacta
> con las palabras clave **MUST / MUST NOT / REQUIRED / SHALL / SHALL NOT / SHOULD / SHOULD NOT /
> RECOMMENDED / MAY / OPTIONAL**, en MAYÚSCULAS (solo en mayúsculas tienen el significado normativo,
> según RFC 8174). El estándar incluye el aviso BCP 14 al inicio (ya está en la plantilla).

> **Regla práctica:** toda decisión se registra como **ADR**. Si además establece una regla continua,
> esa regla entra como **un requisito** en el estándar de su dominio (creándolo si el dominio aún no
> tiene estándar, o ampliándolo si ya existe). Una decisión puntual e histórica (p. ej. "en 2026
> migramos de MySQL a Postgres") es un ADR sin requisito: no hay norma continua que cumplir.

Las plantillas canónicas están en `assets/adr-template.md` y `assets/standard-template.md`.
**Leer la que corresponda antes de redactar.**

---

## Resolución de idioma

El idioma de los artefactos y de los mensajes al usuario se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si hay una preferencia registrada en la memoria del proyecto, usarla.
3. Si no, usar el idioma del mensaje del usuario y **preguntar si desea persistir esa preferencia en la memoria del proyecto**.
4. Si no se puede inferir, **preguntar** qué idioma prefiere; no decidir el idioma por cuenta propia.

Las claves de frontmatter, los identificadores (`ADR-XXX`, referencias de requisito `<estándar>/<requisito>`), las palabras clave normativas de RFC 2119 (MUST, SHOULD…), las rutas y las salidas de comandos **no se traducen**.

---

## Convenciones de identidad y numeración

| | ADR | Estándar (dominio) | Requisito (dentro de un estándar) |
|---|---|---|---|
| Vive en | `docs/adr/` | `docs/standards/` | Una sección dentro del `.md` del estándar |
| Ubicación | `ADR-XXX-<slug>.md` (prefijo + 3 dígitos; p. ej. `ADR-002-vitest-testing-library.md`) | **Sin código, por nombre.** Simple: `docs/standards/<slug>.md` (p. ej. `testing.md`). Con documentos adicionales: carpeta `docs/standards/<slug>/` con el estándar en `README.md` + los archivos extra dentro | — |
| Identidad | `id: ADR-XXX` (p. ej. `ADR-002`) | `name` (p. ej. `Testing Standards`) + `<slug>` de dominio (`testing`) = nombre del archivo/carpeta. **No lleva código.** | `ID` = slug del requisito (p. ej. `unit-testing`); referencia global `<slug-estándar>/<slug-requisito>` (p. ej. `testing/unit-testing`) |
| Cómo se numera/nombra | Correlativo en `docs/adr/` + 1; empezar en `001` | El `<slug>` del dominio (kebab-case), único en `docs/standards/`. Hay **pocos** (uno por dominio); no hay correlativo | El `<slug>` del requisito (kebab-case), único dentro de su estándar |

- Los `slug` son kebab-case, minúsculas y cortos. El número del ADR es zero-padded a 3 dígitos.
- **Nunca pedir el número del ADR al usuario**: se calcula listando `docs/adr/`.
- La **referencia global del requisito** (`<slug-estándar>/<slug-requisito>`) es lo que un ADR referencia en `emits`; el wrapper de su fitness function es `scripts/arch/checks/<slug-estándar>-<slug-requisito>.sh` (la `/` se sustituye por `-`, p. ej. `testing-unit-testing.sh`).
- Si se crean varios ADR en una tanda (p. ej. desde `arch-discover`), **recalcular** el número releyendo `docs/adr/` antes de cada nuevo ADR.

---

## Información requerida antes de redactar

Recopilar en **una sola tanda de preguntas** al inicio usando la herramienta de opciones tappables del cliente (máx. 3 preguntas por bloque; opciones cortas y mutuamente excluyentes). No inventar datos — si no están en contexto, preguntar.

| Dato | Fuente preferida | Si no está |
|------|-----------------|------------|
| Problema / tensión arquitectónica | Descripción del usuario | Preguntar |
| Decisión concreta | Descripción del usuario | Preguntar |
| ¿Establece una regla continua? (→ requisito de estándar) y ¿de qué **dominio**? | Inferir del alcance; confirmar con el usuario | Preguntar si es ambiguo |
| Decisores | Indicado por el usuario | Preguntar siempre |
| Stack tecnológico | `package.json`, `pom.xml`, etc. | Preguntar |
| Alternativas consideradas | Solo si el usuario las mencionó | Omitir la sección si no las mencionó |
| ADRs / estándares relacionados | `docs/adr/` + `docs/standards/` + contexto | Preguntar si hay referencias a citar |

> ADRs en estado **Draft** o **Proposed** también requieren problema y decisión tentativa.

---

## Validación de conflictos (solo al crear)

Antes de redactar un ADR nuevo o de añadir un requisito:

1. Leer títulos y la sección clave (`## Decisión` de los ADR; los requisitos de los estándares de `docs/standards/`).
2. Si hay conflicto (misma tecnología/componente ya cubierto por un ADR `Accepted` o por un requisito `Active`, contradicción directa, o duplicación):
   - **No redactar**; informar al usuario con enlace(s) al artefacto en conflicto.
   - Sugerir: (a) actualizar el existente, (b) crear ADR nuevo marcando el anterior como `Superseded`, o (c) ajustar el alcance/requisito.

---

## Flujo: Crear una decisión (ADR) y su requisito de estándar

1. **Número y archivo del ADR** — correlativo en `docs/adr/`; archivo `docs/adr/ADR-XXX-<slug>.md`.
2. **Recopilar información faltante** (ver tabla anterior).
3. **Escribir el ADR** desde `assets/adr-template.md`:
   - Frontmatter YAML: `id: ADR-XXX`, `status: Draft` (por defecto), `date` = hoy, `deciders`, `tags`, `supersedes: null`, `superseded_by: null`, `emits: []`.
   - Cuerpo: `## Contexto`, `## Decisión`, `## Alternativas consideradas` (opcional), `## Consecuencias`, `## Referencias`.
4. **Decidir si la decisión establece una regla continua.** Preguntarse: *¿esta decisión fija una regla
   que el equipo deberá cumplir de forma continua?*
   - **No** (decisión puntual o histórica) → `emits: []`. No toca estándares. Fin del bloque de estándares.
   - **Sí** → identificar el **dominio** (testing, api, persistence, security, frontend, observability, ci, modularity…) y continuar al paso 5.
5. **Ubicar o crear el estándar de dominio** en `docs/standards/` (identificado por su **nombre**, sin código):
   - **Si ya existe** un estándar para ese dominio (p. ej. `docs/standards/testing.md` o `docs/standards/testing/README.md`) → **actualizarlo**: añadir (o modificar) el **requisito** correspondiente, sin reescribir los requisitos existentes.
   - **Si no existe** → **crearlo** desde `assets/standard-template.md` con `name` (p. ej. `Testing Standards`), `domain` (slug), `status: Draft` (o `Active` si ya rige), `date` = hoy, `source_adrs`, y el aviso RFC 2119/8174 (ya incluido en la plantilla).
     - **Forma simple:** `docs/standards/<slug>.md`.
     - **Forma con documentos adicionales:** si el estándar necesita archivos de apoyo (guías, ejemplos, matrices), crear la carpeta `docs/standards/<slug>/`, escribir el estándar en `docs/standards/<slug>/README.md` y colocar los documentos adicionales dentro de esa carpeta (enlazados con rutas relativas desde el estándar). Si un estándar simple pasa a necesitar extras, migrarlo de `<slug>.md` a `<slug>/README.md`.
6. **Redactar el requisito** dentro del estándar:
   - Un bloque `## <Nombre del requisito>` con: `**ID:** <slug-requisito>`, `**Origen:** ADR-XXX`, el **enunciado normativo con RFC 2119** (MUST/SHOULD/MAY… en mayúsculas), `Alcance`, `Excepciones` y el bloque `Cumplimiento (fitness function)`.
   - **Enlazar en ambos sentidos:** añadir la referencia global del requisito (`<slug-estándar>/<slug-requisito>`, p. ej. `testing/unit-testing`) al `emits` del ADR, y el `ADR-XXX` a `source_adrs` del estándar (a nivel de documento) además de en `**Origen:**` del requisito.
7. **Evaluar y (opcionalmente) crear la fitness function del requisito** — ver [Fitness function del requisito](#fitness-function-del-requisito). La verificación cuelga de **cada requisito**, no del ADR ni del estándar entero. Al crearla, **registrarla en el agrupador** — ver [Agrupador de validaciones de arquitectura](#agrupador-de-validaciones-de-arquitectura).
8. **Ofrecer instalar dependencias referenciadas ausentes** — ver [Dependencias referenciadas](#dependencias-referenciadas-por-la-decisión).
9. **Actualizar los índices `README.md`**:
   - `docs/adr/README.md`: añadir `- [ADR-XXX: Título](ADR-XXX-slug.md)` en orden ascendente.
   - `docs/standards/README.md`: si el estándar de dominio es nuevo, añadir `- [Nombre del estándar](<slug>.md)` (forma simple) o `- [Nombre del estándar](<slug>/README.md)` (forma carpeta); si ya existía, no duplicar.
   - Crearlos con encabezado y lista si no existen. Nunca reordenar ni eliminar entradas.
10. **Confirmar** mostrando: ruta del ADR, estándar de dominio y requisito(s) añadido(s)/actualizado(s), líneas de índice, y —si aplica— la fitness function creada, el comando agrupador `sh scripts/arch/verify-architecture.sh` y las dependencias instaladas.

---

## Fitness function del requisito

Cada **requisito** de un estándar es una regla **verificable**. Al crear (o actualizar) un requisito,
evaluar si es **apto** para una fitness function y completar el bloque `Cumplimiento (fitness function)`
de ese requisito.

1. **Evaluar aptitud.** ¿El cumplimiento es objetivo y automatizable con una prueba/regla determinista?
   - **No apto** (depende de criterio humano o evidencia externa, p. ej. "el código debe ser legible", "TLS en producción"): `apto: false`, `status: N/A`; explicar en el requisito cómo se verifica manualmente. **No** preguntar nada más. Fin.
   - **Apto**: continuar al paso 2.

2. **Preguntar explícitamente al usuario** con la herramienta de preguntas estructuradas si quiere crear la fitness function ahora:

   > "Este requisito es apto para una fitness function (chequeo automatizado). ¿Quieres que la cree ahora?"
   > Opciones: [Sí, crearla ahora] / [No, dejarla como pendiente]

   Una sola pregunta, opciones mutuamente excluyentes. No crear nada sin la aprobación explícita del usuario.

3. **Según la respuesta:**
   - **No** → `apto: true`, `status: Pending`, y dejar `tool`/`location`/`command` como `TODO`. `arch-audit` lo reportará como sugerencia.
   - **Sí** → crear la fitness function (paso 4) y referenciarla en el requisito (paso 5).

4. **Crear la fitness function:**
   - Detectar el stack (manifiestos: `package.json`, `pom.xml`, `pyproject.toml`, `*.csproj`, `go.mod`, etc.) y elegir la herramienta idónea: dependency-cruiser / ESLint boundaries (JS/TS), ArchUnit (JVM), import-linter (Python), NetArchTest (.NET), un runner del propio framework (p. ej. cobertura de PHPUnit), o un script de CI genérico si no hay una herramienta natural.
   - Si ya existe configuración de esa herramienta en el repo, **añadir la nueva regla** ahí en vez de duplicar setup. Si no, crear el archivo mínimo (test/script + config) en una ubicación convencional (`tests/arch/`, `arch/`, `scripts/`, etc.).
   - Escribir el chequeo que corresponde al **enunciado del requisito** (p. ej. prohibir imports que violen la capa; fallar si hay tests unit fuera de PHPUnit; fallar si no hay specs de Playwright para los flujos marcados).
   - Confirmar con el usuario el comando acotado para ejecutarla. No ejecutar build ni suites completas por iniciativa propia; si hace falta instalar dependencias, avisar al usuario.

5. **Registrar la fitness function en el agrupador** — engancharla al entrypoint único. Ver [Agrupador de validaciones de arquitectura](#agrupador-de-validaciones-de-arquitectura). En resumen: crear (si no existe) `scripts/arch/verify-architecture.sh` y añadir el wrapper `scripts/arch/checks/<slug-estándar>-<slug-requisito>.sh` (p. ej. `testing-unit-testing.sh`) que invoca el comando acotado del paso 4.

6. **Referenciar en el requisito:** completar el bloque `Cumplimiento (fitness function)` con `apto: true`, `status: Created`, `tool`, `location` (ruta real del test/script o del wrapper) y `command` (el comando acotado individual). Así `arch-audit` lo descubre y ejecuta directamente desde el requisito, y además queda incluido en el agrupador.

> En invocación en lote (p. ej. desde `arch-discover`), hacer esta evaluación por cada requisito apto, pero agrupar para no abrumar: preguntar una vez si el usuario quiere crear fitness functions para todos los requisitos aptos del lote, o elegir cuáles. Cada una se registra con su wrapper `checks/<slug-estándar>-<slug-requisito>.sh`.

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
    ├── testing-unit-testing.sh   # Un wrapper por REQUISITO (nombre = <slug-estándar>-<slug-requisito>)
    └── testing-e2e-testing.sh
```

- **`scripts/arch/verify-architecture.sh`** — corre cada `checks/*.sh`, imprime `PASS`/`FAIL` por
  requisito y un resumen, y sale con código `0` solo si todas pasan (distinto de `0` si alguna falla,
  apto como gate de CI o local). **Se descubre por convención: no se edita al añadir validaciones.**
- **`scripts/arch/checks/<slug-estándar>-<slug-requisito>.sh`** — un wrapper delgado por **requisito**
  que invoca la fitness function real (dependency-cruiser, ArchUnit, import-linter, NetArchTest, runner
  del framework o un script propio). El nombre (la referencia global del requisito con `/`→`-`) permite
  mapear cada resultado a su requisito y estándar. Si el chequeo real vive en otra herramienta, el
  wrapper solo lo invoca.

Los archivos de referencia de esta convención están en `assets/arch-fitness/`
(`verify-architecture.sh`, `checks/example.sh.template` y un `README.md`). **Leerlos antes de
crear o modificar el agrupador** y copiarlos al repo respetando las rutas.

### Cómo registrar una fitness function

Al crear una fitness function apta (paso 4 anterior), engancharla al agrupador:

1. **Asegurar el agrupador.** Si `scripts/arch/verify-architecture.sh` no existe, crearlo copiando
   `assets/arch-fitness/verify-architecture.sh` (y el `README.md` de esa carpeta) tal cual. Crear el
   directorio `scripts/arch/checks/` si falta. Si ya existe el agrupador, no tocarlo — descubre los checks solo.
2. **Añadir el wrapper del requisito.** Crear `scripts/arch/checks/<slug-estándar>-<slug-requisito>.sh`
   (p. ej. `testing-unit-testing.sh`) a partir de `assets/arch-fitness/checks/example.sh.template`,
   reemplazando el comando por el chequeo acotado del paso 4. El wrapper debe salir `0` si el requisito se cumple y distinto de `0` si se viola.
3. **Cablear el atajo nativo (opcional, según stack).** Si el repo tiene un mecanismo natural, añadir un
   alias que llame al agrupador sin duplicar lógica: script `arch` en `package.json`
   (`"arch": "sh scripts/arch/verify-architecture.sh"`), un target de `Makefile`, un job de CI, etc.
4. **No ejecutar** el agrupador ni el check por iniciativa propia si requiere instalar dependencias o
   correr suites pesadas; ofrecer el comando acotado y dejar que el usuario decida.

> **Stacks sin `sh` (p. ej. Windows puro).** Mantener el mismo contrato con el equivalente idóneo
> (un `verify-architecture.ps1`, o un runner en el lenguaje del repo). Lo esencial es que exista **un**
> comando que ejecute todas las validaciones y devuelva un código de salida agregado.

---

## Dependencias referenciadas por la decisión

Una decisión suele implicar tecnologías concretas (una librería, framework o herramienta). Si el ADR o
el requisito referencia una dependencia que **aún no está en el proyecto**, ofrecer instalarla y
configurarla — pero solo **después de haber creado los artefactos** y con aprobación explícita del usuario.

1. **Extraer las dependencias concretas** que la decisión implica, del `## Decisión` del ADR y del
   enunciado del requisito. Contar solo dependencias reales e instalables (p. ej. `PHPUnit`, `Playwright`,
   `GraphQL → @apollo/server`, `Prisma`), no conceptos abstractos ("arquitectura hexagonal" no es una
   dependencia). No inventar nombres de paquete: si el exacto no es claro, preguntarlo.
2. **Comprobar si ya existen** en el proyecto, leyendo el manifiesto del ecosistema y su lockfile:
   `package.json`, `pom.xml`/`build.gradle`, `pyproject.toml`/`requirements.txt`, `composer.json`,
   `*.csproj`, `go.mod`, `Cargo.toml`, etc. Si todas están presentes, no hay nada que ofrecer — fin.
3. **Si falta una o más, preguntar explícitamente** con la herramienta de preguntas estructuradas:

   > "La decisión referencia dependencias que no están en el proyecto: `<lista>`. ¿Quieres que las instale y configure ahora?"
   > Opciones: [Sí, instalar y configurar] / [No, solo dejar constancia]

   Una sola pregunta, opciones mutuamente excluyentes. Como un ADR nuevo nace en `Draft`, mencionar ese
   matiz si es relevante. **No instalar nada sin la aprobación explícita del usuario.**
4. **Si acepta:**
   - Instalar con el gestor del ecosistema detectado (`npm`/`pnpm`/`yarn`, `composer`, `pip`/`poetry`/`uv`,
     Maven/Gradle, `dotnet add package`, `go get`, `cargo add`, etc.), respetando el que ya use el repo.
     Preferir dependencias de desarrollo cuando sean herramientas de build/test.
   - Aplicar la **configuración mínima** necesaria para que quede operativa, sin construir la feature
     completa: eso es implementación, no alcance de un ADR ni de un estándar.
   - Mostrar los comandos ejecutados y los archivos tocados. No correr build ni despliegues por iniciativa
     propia; si la instalación requiere pasos con efectos amplios, avisar antes.
5. **Si rechaza:** dejar constancia (p. ej. en `## Consecuencias` del ADR o en el `Cumplimiento` del
   requisito) de que la dependencia queda pendiente, para que sea visible en una futura auditoría.

> En invocación en lote (desde `arch-discover`), agrupar: preguntar una vez por el conjunto de dependencias ausentes de todos los artefactos creados.

---

## Flujo: Actualizar un ADR existente

Recordar que un ADR es **histórico**: se actualiza su estado o se corrigen datos, pero no se reescribe
la decisión ya tomada — para cambiar de rumbo se crea un ADR nuevo que supersede al anterior.

1. Identificar el archivo por número, slug o título.
2. Leer el contenido completo antes de editar.
3. Aplicar los cambios; actualizar `date` a hoy si el cambio es sustantivo. **Nunca** reescribir una decisión `Accepted`; para eso, superseder.
4. Si el nuevo estado es `Superseded`:
   - Marcar `status: Superseded` y `superseded_by: ADR-XXX`. Si el usuario no lo indicó, preguntar antes de guardar.
   - En el ADR reemplazante, fijar `supersedes: ADR-<anterior>`.
   - **Revisar los requisitos emitidos** (`emits`): si la decisión superseded había fijado requisitos que ya no rigen, actualizarlos o marcarlos `Deprecated`/`Superseded` en su estándar de dominio, y enlazar el requisito reemplazante si lo hay. Un ADR obsoleto no debe dejar requisitos vivos huérfanos.
   Si el nuevo estado es `Deprecated`: `status: Deprecated`, actualizar `date`, registrar el motivo en `## Referencias` y aplicar el mismo repaso a sus requisitos.
5. Actualizar `docs/adr/README.md` si el título cambió.
6. **Confirmar** mostrando los campos modificados y el impacto en requisitos emitidos.

---

## Flujo: Crear o actualizar un estándar / requisito directamente

A veces se refina una regla sin una decisión nueva (afinar un umbral, ampliar el alcance, aclarar una
excepción, añadir un requisito a un dominio existente). El estándar es **vivo**: se edita.

1. **Todo requisito debería trazar a un ADR** (`Origen` + `source_adrs`). Si se pide añadir un requisito
   sin decisión registrada, ofrecer crear primero el ADR de origen (flujo de arriba). Si el usuario
   prefiere no crearlo, permitir el requisito dejando constancia de que su decisión de origen está
   pendiente de documentar (lo señalará `arch-audit`).
2. Identificar el estándar de dominio (o crearlo, `docs/standards/<slug>.md` o `docs/standards/<slug>/README.md` si lleva documentos adicionales).
3. Añadir o editar el bloque de requisito: enunciado con RFC 2119, `ID`, `Origen`, `Alcance`, `Excepciones`. Actualizar `date` a hoy.
4. Reevaluar la fitness function del requisito: si cambió el enunciado, ajustar el chequeo y su wrapper en el agrupador.
5. Si el nuevo estado del estándar o de un requisito es `Deprecated`/`Superseded`, enlazar el reemplazo y actualizar `docs/standards/README.md`.
6. **Confirmar** los cambios.

---

## Convenciones de frontmatter

### ADR

| Campo | Regla |
|-------|-------|
| `id` | `ADR-XXX` (prefijo + 3 dígitos) |
| `status` | `Draft` · `Proposed` · `Accepted` · `Deprecated` · `Superseded` |
| `date` | Fecha de hoy en cada escritura sustantiva |
| `deciders` | Lista de nombres o roles |
| `tags` | Lista de palabras clave (tecnología, dominio) |
| `supersedes` / `superseded_by` | `null` o `ADR-XXX` |
| `emits` | Lista de **referencias de requisito** que fija, p. ej. `[testing/unit-testing]` (o `[]`) |

### Estándar (documento de dominio)

| Campo | Regla |
|-------|-------|
| `name` | Nombre del estándar, p. ej. `Testing Standards`. **El estándar se identifica por su nombre, no lleva código.** |
| `domain` | Slug del dominio (`testing`, `api`, `persistence`, `security`, `frontend`, `observability`, `ci`, `modularity`…) = nombre del archivo `<slug>.md` o de la carpeta `<slug>/` |
| `status` | `Draft` · `Active` · `Deprecated` |
| `date` | Fecha de hoy en cada escritura |
| `source_adrs` | Lista de **todos** los ADR que aportaron requisitos (recíproco de `emits`) |
| `tags` | Lista de palabras clave |

### Requisito (bloque dentro del estándar)

| Campo | Regla |
|-------|-------|
| `ID` | Slug del requisito (p. ej. `unit-testing`), único en su estándar. Referencia global: `<slug-estándar>/<slug-requisito>` (p. ej. `testing/unit-testing`) |
| `Origen` | El `ADR-XXX` que lo fijó |
| Enunciado | Redactado con RFC 2119 / RFC 8174 (MUST/SHOULD/MAY… en mayúsculas) |
| `Cumplimiento` | `apto` (bool), `status` (`Created`/`Pending`/`N/A`), `tool`, `location` (`scripts/arch/checks/<slug-estándar>-<slug-requisito>.sh`), `command` |

---

## Referencias

- [Architecture Decision Records](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions — Cognitect](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) · [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) (BCP 14) — palabras clave normativas.
- *Building Evolutionary Architectures* (Ford, Parsons, Kua) — concepto de fitness functions.
