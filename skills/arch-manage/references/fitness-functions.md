# Fitness functions y runner de validaciones de arquitectura

Leer al **proponer los criterios de cumplimiento (CR)** de un requisito nuevo o actualizado, cuando un
CR es **apto para automatizar** y hay que crear/registrar su fitness function, o cuando hay que
crear/tocar el runner. Cubre tres cosas: (1) la **propuesta de criterios** que el usuario selecciona,
(2) la fitness function del CR y (3) el runner que las orquesta.

**El modelo, en una línea:** los scripts de verificación se escriben en el **lenguaje del stack del
repositorio** (Node en un proyecto Angular/React/Vue/Node, Python en uno Python, PHP en uno PHP…), hay
**un archivo de checks por estándar** (no por criterio) en `scripts/arch/checks/<slug-estándar>.<ext>`,
y un **runner** único (`scripts/arch/verify.<ext>`) que ejecuta todos los estándares por defecto o solo
uno pasado por argumento.

## Propuesta de criterios y selección del usuario

Cada **criterio de cumplimiento** (`CR-XXX`) de un estándar es una regla **verificable**. Al añadir un
requisito (o al ampliar uno existente), **no se escriben los CR directamente**: primero se **propone**
al usuario el conjunto de criterios candidatos —cada uno con el **mecanismo concreto** con el que se
verificaría— y el usuario **elige cuáles quiere crear**. Solo lo seleccionado se escribe en el estándar
y se implementa.

> **Ningún criterio se escribe ni se instala nada antes de la selección.** Esta fase es de propuesta:
> el bloque `## <Requisito>` del estándar puede escribirse antes (es la norma, no el criterio), pero
> **ninguna fila `CR-XXX`** de la tabla `## Criterios de cumplimiento`, ni nada en `scripts/arch/`, ni
> ninguna instalación con el gestor de paquetes, hasta que el usuario haya elegido.

### 1. Derivar los criterios candidatos

A partir del requisito, listar los CR candidatos: cada aspecto **medible y comprobable** de forma
independiente. Un requisito casi siempre da más de uno (p. ej. «Unit testing» → cobertura mínima,
framework obligatorio, ubicación/nombrado de los archivos de test). Preferir criterios **atómicos**
(uno mide una sola cosa) frente a uno grande que mezcla varias comprobaciones.

Numerar los candidatos como `C1`, `C2`… **solo para la conversación** — el `CR-XXX` definitivo se asigna
después, al escribir en el estándar, y solo a los criterios que el usuario haya seleccionado (para no
quemar números en criterios descartados).

### 2. Clasificar aptitud e investigar el mecanismo de cada candidato

Para **cada candidato**, y **antes de presentar la propuesta**, resolver dos cosas:

**a) ¿Es apto para automatizar?** ¿Su cumplimiento es objetivo y comprobable con una prueba/regla
determinista?

- **No apto** (depende de criterio humano o evidencia externa, p. ej. "el código debe ser legible",
  "TLS en producción"): `Automatizable: no`. Su "mecanismo" en la propuesta es la **verificación
  manual** (revisión en PR, evidencia en un job de CI, documento…). Sigue apareciendo en la propuesta:
  el usuario también decide si ese criterio entra en el estándar.
- **Apto**: continuar con (b).

**b) ¿Con qué mecanismo se verificaría?** Investigar la forma **más común, robusta y de menor
mantenimiento** de verificar ese criterio en ese stack — nunca improvisar un script propio cuando ya
existe una manera establecida de hacerlo. Esta investigación va **aquí**, antes de preguntar: la
propuesta debe mostrarle al usuario el mecanismo real (herramienta + comando), no un "ya veremos".

- Detectar el stack (manifiestos: `package.json`, `pom.xml`, `pyproject.toml`, `*.csproj`, `go.mod`,
  etc.). El stack detectado determina también el **lenguaje** del runner y de los archivos de checks
  (ver "Runner de validaciones" más abajo).
- **Si no hay ningún manifiesto de dependencias en el repo** (no hay ecosistema de paquetes que
  instalar — p. ej. un repo de scripts sueltos, de infraestructura pura, o de documentación): no
  hay gestor de paquetes con el que instalar una herramienta externa. En ese caso, el **script
  propio** (`grep`/`find`/comando nativo del shell) deja de ser el último recurso y pasa a ser la
  opción por defecto — explicarlo así al usuario en vez de ofrecer instalar una herramienta que no
  tiene dónde vivir. Si el criterio referencia un ecosistema concreto que sí se puede inferir del
  contenido (p. ej. Terraform por `*.tf`, Ansible por `playbooks/`), tratar esa señal como el
  "manifiesto" para el resto de este paso.
- Primero comprobar si el repo **ya tiene** configurada una herramienta apta para este tipo de
  chequeo (p. ej. ya usa `dependency-cruiser` para otra regla, o ya hay tests con ArchUnit) — en
  ese caso, **añadir la regla ahí**, no montar una herramienta nueva en paralelo.
- Si no hay nada montado, identificar la herramienta **más común y eficiente** para ese tipo de
  chequeo en ese stack: dependency-cruiser / ESLint boundaries (JS/TS), ArchUnit (JVM),
  import-linter (Python), NetArchTest (.NET), un runner del propio framework (p. ej. cobertura de
  PHPUnit), o el mecanismo nativo equivalente de otros stacks.
- Si el tipo de chequeo no encaja con claridad en ese catálogo, o hay duda real sobre cuál es la
  opción más establecida, **investigar** (documentación oficial de las herramientas candidatas, o
  delegar en un subagente con el mismo criterio que usa `work-research`) antes de decidir — no
  elegir a ciegas.
- Un script propio (`grep`/`find` a medida, chequeo manual en `scripts/`) es el **último recurso**:
  solo cuando de verdad no existe una herramienta o convención establecida para ese chequeo en el
  stack del proyecto. No inventar un script cuando ya hay una forma reconocida de hacerlo.
- Anotar además si la herramienta **ya está instalada** en el repo o **habría que instalarla** — eso se
  muestra en la propuesta para que el usuario decida con el coste a la vista.

También proponer el **Enfoque** de cada candidato: `bloqueante` (por defecto) hace fallar el runner si
el CR se viola; `warning` solo lo reporta sin tumbar el gate — y se implementa **dentro** del script del
estándar, por chequeo (no en el nombre del archivo). Usar `warning` cuando el criterio es deseable pero
su incumplimiento no debería frenar un merge (p. ej. umbrales en adopción progresiva).

### 3. Presentar la tabla de propuesta

Mostrar **todos** los candidatos en una tabla, antes de preguntar nada, para que el usuario vea criterio
y mecanismo juntos:

| # | Requisito | Criterio propuesto | Automatizable | Enfoque | Mecanismo de verificación |
|---|-----------|--------------------|---------------|---------|---------------------------|
| C1 | `unit-testing` | La cobertura de líneas **DEBE** ser ≥ 80% | yes | bloqueante | Vitest `--coverage` con umbral en `vitest.config.ts` → `npx vitest run --coverage` *(ya instalado)* |
| C2 | `unit-testing` | Las pruebas unitarias **DEBEN** implementarse con Vitest | yes | bloqueante | dependency-cruiser: prohibir imports de otros frameworks de test → `npx depcruise src` *(requiere instalar `dependency-cruiser`)* |
| C3 | `unit-testing` | Cada módulo público **DEBERÍA** tener su archivo de test junto al fuente | yes | warning | Script propio en `checks/testing.mjs` (glob `src/**/*.ts` sin `*.spec.ts` hermano) — no hay herramienta establecida |
| C4 | `unit-testing` | Los tests **DEBEN** ser legibles y describir comportamiento, no implementación | no | — | Manual: revisión en pull request (queda como evidencia del requisito) |

Las columnas `Automatizable` y `Enfoque` van en el mismo orden que en la tabla real del estándar, para
que la fila propuesta se pueda trasladar tal cual.

Reglas de la tabla:

- **Una fila por candidato**, redactada ya con RFC 2119 en el idioma del estándar — es el texto que
  acabará en la columna `Descripción` del CR.
- La columna **Mecanismo** nombra la **herramienta concreta y el comando acotado**, e indica entre
  paréntesis si ya está disponible o habría que instalarla. Si el mecanismo es un script propio,
  decir por qué (no hay herramienta establecida). Si no es automatizable, describir la verificación
  manual.
- Si algún candidato es **dudoso** (solape con un CR existente, umbral sin acordar), señalarlo en la
  fila en vez de omitirlo — el usuario decide.

### 4. Preguntar qué se crea

Con la herramienta de preguntas estructuradas, en **dos rondas**:

1. **Qué criterios entran en el estándar.** Pregunta `multiSelect` con los candidatos como opciones
   (`C1 · cobertura ≥ 80%`, `C2 · framework Vitest`…). Máx. 4 opciones por pregunta: si hay más
   candidatos, repartirlos en varias preguntas de la misma tanda. Si son muchos (> 8), ofrecer primero
   opciones agregadas (`Todos`, `Solo los bloqueantes`, `Solo los que no requieren instalar nada`,
   `Elegir uno a uno`) y detallar solo si pide elegir uno a uno.
2. **Para cuáles se crea la fitness function ahora.** Solo entre los criterios **seleccionados** en la
   ronda 1 que sean `Automatizable: yes`. Otra pregunta `multiSelect`, con la misma regla de 4 opciones.
   Si en la ronda 1 se seleccionó un solo candidato automatizable, basta una pregunta sí/no.

No crear, escribir ni instalar nada sin esta aprobación explícita.

### 5. Registrar el resultado de la selección

- **Candidato no seleccionado** → no se escribe: no entra en el estándar y no deja rastro. Si el usuario
  lo descartó por desacuerdo de fondo (no por prioridad), vale la pena mencionarlo en `### Excepciones`
  del requisito.
- **Seleccionado, no automatizable** → fila del CR con `Automatizable: no`; `Verificación: yes` si hay
  evidencia externa registrada en el requisito (archivo, job CI…), `no` si no la hay; explicar en el
  requisito cómo se verifica manualmente.
- **Seleccionado y automatizable, sin fitness function ahora** → `Automatizable: yes`,
  `Verificación: no` (pendiente). `arch-audit` lo reportará como sugerencia.
- **Seleccionado y con fitness function** → crear la fitness function (siguiente sección) y registrarla.

Asignar los `CR-XXX` definitivos en este momento, correlativos dentro del estándar, solo a los
seleccionados.

## Crear la fitness function del criterio (CR)

Solo para los criterios que el usuario seleccionó con fitness function en la ronda 2. La herramienta y
el comando ya están decididos (paso 2b de la propuesta) — aquí se instalan y se escriben.

1. **Instalar y configurar la herramienta elegida, si hace falta.** Si la herramienta propuesta no
   está instalada, resolverlo **aquí mismo** — no dejarlo pendiente ni delegarlo al paso 8 del flujo
   principal (ese paso cubre las dependencias que la *decisión* referencia en general; esta es la
   herramienta de *verificación* del criterio, y se resuelve al crear su fitness function). Preguntar
   explícitamente con la herramienta de preguntas estructuradas:

   > "Para verificar este criterio de la forma más eficiente hace falta instalar `<herramienta>`. ¿Quieres que la instale y configure ahora?"
   > Opciones: [Sí, instalar y configurar] / [Prefiero otra forma] (texto libre, revisa el mecanismo) / [No, dejar el criterio pendiente]

   Si el usuario ya aceptó instalarla al seleccionar el criterio (la propuesta indicaba «requiere
   instalar»), no repreguntar. Al instalar: usar el gestor de paquetes del ecosistema detectado
   (`npm`/`pnpm`/`yarn`, `pip`/`poetry`/`uv`, Maven/Gradle, `dotnet add package`, `go get`,
   `cargo add`, etc.), como dependencia de desarrollo, y aplicar la **configuración mínima** para que
   quede operativa (mismo criterio que [`references/dependencies.md`](references/dependencies.md),
   pero resuelto en este paso — no repetir la pregunta en el paso 8 del flujo principal para esta
   misma herramienta). Si rechaza instalar pero quiere seguir, volver al paso 2b de la propuesta con
   la alternativa que proponga y **reproponerle el mecanismo**; si no hay ninguna viable sin instalar
   nada, dejar el criterio con `Verificación: no` (pendiente).

2. **Escribir el chequeo.** Si ya existe configuración de la herramienta en el repo, **añadir la
   nueva regla** ahí en vez de duplicar setup; si no, crear el archivo mínimo (test/script + config) en
   una ubicación convencional (`tests/arch/`, `arch/`, `scripts/`, etc.). Escribir el chequeo que
   corresponde a la **descripción del CR** (p. ej. cobertura ≥ 80%; prohibir imports que violen la capa;
   fallar si hay tests unit fuera de PHPUnit; fallar si no hay specs de Playwright para los flujos
   marcados) invocando la herramienta elegida — no reimplementar en un script propio una regla que la
   herramienta ya sabe expresar de forma nativa.

3. **Confirmar con el usuario el comando acotado** para ejecutar el chequeo. No ejecutar build ni suites
   completas por iniciativa propia.

4. **Registrar la fitness function en el archivo de checks de su estándar** —
   `scripts/arch/checks/<slug-estándar>.<ext>` (p. ej. `checks/testing.mjs` en un repo Node), **un
   archivo por estándar**, no por criterio:
   - **Si el archivo del estándar ya existe**: añadir dentro el chequeo de este CR — un bloque
     `check('CR-XXX', '<enfoque>', '<descripción corta>', …)` que invoca el comando acotado confirmado
     en el paso 3, precedido de un **comentario de trazabilidad** con la referencia del criterio y su
     descripción. No tocar los chequeos de los demás CR.
   - **Si no existe** (primer CR automatizable del estándar): crearlo a partir de la plantilla de
     referencia (`assets/arch-fitness/checks/example.mjs.template` si el stack es Node; en otro stack,
     el equivalente con el mismo contrato) con el nombre `<slug-estándar>.<ext>`.
   - El **Enfoque** del CR (`bloqueante`/`warning`) se implementa **dentro del chequeo**: un chequeo
     `bloqueante` que falla imprime `FAIL` y hace que el script del estándar salga con código ≠ 0; uno
     `warning` imprime `WARN` sin cambiar el código de salida.
   - Asegurar el runner (`scripts/arch/verify.<ext>`) si aún no existe — ver "Runner de validaciones".

5. **Referenciar en la fila del CR:** poner `Automatizable: yes`, el `Enfoque` (`bloqueante`/`warning`) y
   `Verificación: yes` — la columna solo indica **que la verificación existe**, no lleva la ruta: el
   archivo de checks se localiza **por convención** (`scripts/arch/checks/<slug-estándar>.<ext>`, p. ej.
   `checks/testing.mjs`) y dentro el chequeo del CR se identifica por su referencia `CR-XXX`. Así
   `arch-audit` lo descubre y lo ejecuta, y además queda incluido en el runner.

> **En invocación en lote** (p. ej. desde `arch-discover`), acumular los candidatos de todos los
> requisitos del lote y presentar **una sola tabla de propuesta** al final —con una columna extra
> `Estándar`— en vez de una tabla por requisito. Las dos rondas de selección y la pregunta de instalar
> herramientas de verificación ausentes se hacen también **una sola vez** para todo el lote (con las
> opciones agregadas del paso 4). Los chequeos del lote se registran cada uno en el archivo de checks
> de su estándar (`checks/<slug-estándar>.<ext>`).

## Runner de validaciones de arquitectura

Las fitness functions individuales tienden a quedar dispersas (una en `tests/arch/`, otra en un
`.dependency-cruiser.js`, otra en un script suelto), y entonces no hay un único comando que las
ejecute todas. Por eso el proyecto mantiene **un punto de entrada único** — el runner
`scripts/arch/verify.<ext>` — que ejecuta las validaciones de arquitectura registradas: **todas por
defecto**, o **solo las de un estándar** pasando su slug como argumento. La fitness function individual
puede seguir existiendo en su ubicación natural; el runner no la reemplaza, la **orquesta**.

**El runner y los checks se escriben en el lenguaje del stack del repositorio** — no en shell por
defecto: Node (`verify.mjs`) en un proyecto Angular/React/Vue/Node, Python (`verify.py`) en uno Python,
PHP (`verify.php`) en uno PHP, etc. Así el script es multiplataforma por naturaleza (el mismo archivo
corre en macOS, Linux y Windows con el runtime que el equipo ya tiene instalado) y no hay que mantener
pares por sistema operativo. Solo si el repo **no tiene ningún runtime de stack** (p. ej. documentación
o infraestructura pura), usar POSIX shell (`verify.sh` + `checks/<slug>.sh`) como último recurso, con el
mismo contrato.

### Convención

```
scripts/arch/
├── verify.mjs             # Runner (ext. según stack: .mjs, .py, .php…): ejecuta los checks/<slug>.<ext>
└── checks/
    ├── testing.mjs        # UN archivo por ESTÁNDAR (nombre = slug del estándar en docs/standards/)
    └── frontend.mjs       # Dentro, un chequeo por CR con su trazabilidad (CR-XXX en salida y comentarios)
```

- **`scripts/arch/verify.<ext>`** — el runner. Sin argumentos ejecuta **todos** los estándares
  (`node scripts/arch/verify.mjs`); con argumento, **solo** el estándar indicado
  (`node scripts/arch/verify.mjs testing`) — un slug sin check registrado es un error. Reenvía la
  salida de cada check, imprime un resumen (criterios `PASS`/`WARN`/`FAIL`) y sale con código `0` salvo
  que algún check salga `≠ 0` (es decir, salvo que algún CR **bloqueante** haya fallado; los `WARN` no
  cambian el código de salida). Apto como gate de CI o local. **Descubre los checks por convención: no
  se edita al añadir validaciones.**
- **`scripts/arch/checks/<slug-estándar>.<ext>`** — las fitness functions de **un estándar** completo
  (p. ej. `testing.mjs`), un chequeo por cada CR automatizable. Contrato del check: imprime una línea de
  protocolo por criterio (`PASS|FAIL|WARN <slug-estándar>/CR-XXX — detalle`) y sale con código `0` si
  ningún CR bloqueante falló, `≠ 0` si alguno falló. La **trazabilidad al criterio** va en el propio
  chequeo: su referencia `CR-XXX` en la línea de salida y un comentario junto al chequeo. Cada chequeo
  invoca la herramienta real de la fitness function (dependency-cruiser, ArchUnit, import-linter,
  NetArchTest, runner del framework o un script propio) — si el chequeo real vive en otra herramienta,
  el bloque solo la invoca, no duplica su lógica.

Los archivos de referencia de esta convención están en `assets/arch-fitness/` (`verify.mjs`,
`checks/example.mjs.template` y un `README.md` con el contrato) — son la **implementación de referencia
en Node**. **Leerlos antes de crear o modificar el runner.** En un repo Node se copian tal cual
(respetando las rutas); en otro stack se genera el equivalente en ese lenguaje respetando el mismo
contrato, y se copia igualmente el `README.md` adaptando los comandos.

### Cómo registrar una fitness function

Al crear una fitness function seleccionada (sección anterior), registrarla:

1. **Asegurar el runner.** Si `scripts/arch/verify.<ext>` no existe, crearlo: en un repo Node, copiar
   `assets/arch-fitness/verify.mjs` (y el `README.md` de esa carpeta) tal cual; en otro stack, generar
   el equivalente en el lenguaje del repo con el mismo contrato. Crear el directorio
   `scripts/arch/checks/` si falta. Si ya existe, no tocarlo — descubre los checks solo.
2. **Añadir el chequeo al archivo de su estándar.** Si `scripts/arch/checks/<slug-estándar>.<ext>` ya
   existe, añadir dentro el bloque del CR (comentario de trazabilidad + `check('CR-XXX', …)` con el
   comando acotado confirmado). Si no, crearlo a partir de
   `assets/arch-fitness/checks/example.mjs.template` (o el equivalente del stack), renombrándolo al slug
   del estándar y reemplazando el chequeo de ejemplo por el real. El `Enfoque` del CR se pasa como
   argumento del chequeo (`'bloqueante'` / `'warning'`), no en el nombre del archivo.
3. **Cablear el atajo nativo (opcional, según stack).** Si el repo tiene un mecanismo natural, añadir un
   alias que llame al runner sin duplicar lógica: un script en `package.json`
   (`"arch": "node scripts/arch/verify.mjs"`), un target de `Makefile`, o un job de CI. No es
   obligatorio: el runner ya es el comando único.
4. **No ejecutar** el runner ni el check por iniciativa propia si requiere instalar dependencias o
   correr suites pesadas; ofrecer el comando acotado y dejar que el usuario decida.

> **El stack manda.** El runner y los checks se ejecutan con el runtime que el proyecto ya usa — no se
> introducen pares de scripts por sistema operativo ni un lenguaje ajeno al repo. Un solo archivo por
> estándar y un solo runner: la trazabilidad fina (por criterio) vive dentro del archivo, en las líneas
> de protocolo y los comentarios de cada chequeo.
