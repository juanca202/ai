# Fitness functions y agrupador de validaciones de arquitectura

Leer cuando un criterio de cumplimiento (CR) es **apto para automatizar** y hay que crear/registrar su
fitness function, o cuando hay que crear/tocar el agrupador. Cubre dos cosas: (1) la fitness function
del CR y (2) el agrupador que las orquesta.

## Fitness function del criterio (CR)

Cada **criterio de cumplimiento** (`CR-XXX`) de un estándar es una regla **verificable**. Al crear (o
actualizar) un CR, evaluar si es **apto** para una fitness function y completar las columnas `Automatable`,
`Enfoque` y `Verificación` de esa fila. El **Enfoque** define cómo pesa el resultado en el gate:
`bloqueante` (por defecto) hace fallar el agrupador si el CR se viola; `warning` solo lo reporta sin
tumbar el gate.

1. **Evaluar aptitud.** ¿El cumplimiento del CR es objetivo y automatizable con una prueba/regla determinista?
   - **No apto** (depende de criterio humano o evidencia externa, p. ej. "el código debe ser legible", "TLS en producción"): `Automatable: no`, `Verificación: N/A` (o la evidencia externa: archivo, job CI…); explicar en el requisito cómo se verifica manualmente. **No** preguntar nada más. Fin.
   - **Apto**: continuar al paso 2.

2. **Preguntar explícitamente al usuario** con la herramienta de preguntas estructuradas si quiere crear la fitness function ahora:

   > "Este criterio de cumplimiento es apto para una fitness function (chequeo automatizado). ¿Quieres que la cree ahora?"
   > Opciones: [Sí, crearla ahora] / [No, dejarla como pendiente]

   Una sola pregunta, opciones mutuamente excluyentes. No crear nada sin la aprobación explícita del usuario.

3. **Según la respuesta:**
   - **No** → `Automatable: yes`, `Verificación: TODO` (pendiente). `arch-audit` lo reportará como sugerencia.
   - **Sí** → crear la fitness function (paso 4) y referenciarla en la fila del CR (paso 6).

4. **Crear la fitness function**, en tres sub-pasos. El objetivo es usar la forma **más común, robusta y
   de menor mantenimiento** de verificar ese criterio en ese stack — nunca improvisar un script propio
   cuando ya existe una manera establecida de hacerlo:

   4.1. **Investigar la forma idónea antes de elegir.** Detectar el stack (manifiestos: `package.json`,
   `pom.xml`, `pyproject.toml`, `*.csproj`, `go.mod`, etc.).
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

   4.2. **Instalar y configurar la herramienta elegida, si hace falta.** Si la herramienta del 4.1 no
   está instalada, resolverlo **aquí mismo** — no dejarlo pendiente ni delegarlo al paso 8 del flujo
   principal (ese paso cubre las dependencias que la *decisión* referencia en general; esta es la
   herramienta de *verificación* del criterio, y se resuelve al crear su fitness function). Preguntar
   explícitamente con la herramienta de preguntas estructuradas:

      > "Para verificar este criterio de la forma más eficiente hace falta instalar `<herramienta>`. ¿Quieres que la instale y configure ahora?"
      > Opciones: [Sí, instalar y configurar] / [Prefiero otra forma] (texto libre, vuelve al 4.1) / [No, dejar el criterio pendiente]

      Si acepta: instalar con el gestor de paquetes del ecosistema detectado (`npm`/`pnpm`/`yarn`,
      `pip`/`poetry`/`uv`, Maven/Gradle, `dotnet add package`, `go get`, `cargo add`, etc.), como
      dependencia de desarrollo, y aplicar la **configuración mínima** para que quede operativa (mismo
      criterio que [`references/dependencies.md`](references/dependencies.md), pero resuelto en este
      paso — no repetir la pregunta en el paso 8 para esta misma herramienta). Si rechaza instalar pero
      quiere seguir, volver al 4.1 con la alternativa que proponga; si no hay ninguna viable sin instalar
      nada, tratar el criterio como no automatizable por ahora (`Verificación: TODO`, ver paso 3).

   4.3. **Escribir el chequeo.** Si ya existe configuración de la herramienta en el repo, **añadir la
   nueva regla** ahí en vez de duplicar setup; si no, crear el archivo mínimo (test/script + config) en
   una ubicación convencional (`tests/arch/`, `arch/`, `scripts/`, etc.). Escribir el chequeo que
   corresponde a la **descripción del CR** (p. ej. cobertura ≥ 80%; prohibir imports que violen la capa;
   fallar si hay tests unit fuera de PHPUnit; fallar si no hay specs de Playwright para los flujos
   marcados) invocando la herramienta elegida — no reimplementar en un script propio una regla que la
   herramienta ya sabe expresar de forma nativa.

5. **Confirmar con el usuario el comando acotado** para ejecutar el chequeo. No ejecutar build ni suites
   completas por iniciativa propia.

6. **Registrar la fitness function en el agrupador** — engancharla al entrypoint único (ver más abajo),
   creando el **par** de wrappers (`.sh` y `.ps1`) para que el criterio se verifique igual en
   macOS/Linux y en Windows: `scripts/arch/checks/<slug-estándar>-CR-XXX.sh` **+**
   `scripts/arch/checks/<slug-estándar>-CR-XXX.ps1` si el `Enfoque` es `bloqueante` (p. ej.
   `testing-CR-001.sh` / `testing-CR-001.ps1`), o con sufijo `.warn.sh` / `.warn.ps1` si es `warning`
   (p. ej. `testing-CR-002.warn.sh` / `testing-CR-002.warn.ps1`). Ambos wrappers invocan el **mismo
   comando** del paso 4.3 — solo cambia la sintaxis del script; la lógica nunca diverge entre plataformas.

7. **Referenciar en la fila del CR:** poner `Automatable: yes`, el `Enfoque` (`bloqueante`/`warning`) y
   en `Verificación` la ruta del wrapper `.sh` como referencia canónica (`…-CR-XXX.sh` o
   `…-CR-XXX.warn.sh` según el Enfoque — su par `.ps1` vive junto a él, mismo nombre, otra extensión; o
   la ruta del test/script si el CR apunta directo a él). Así `arch-audit` lo descubre y lo ejecuta desde
   la fila del criterio, y además queda incluido en ambos agrupadores.

> En invocación en lote (p. ej. desde `arch-discover`), hacer esta evaluación por cada CR apto, pero
> agrupar para no abrumar: preguntar una vez si el usuario quiere crear fitness functions para todos los
> CR aptos del lote, o elegir cuáles; y agrupar también, si aplica, la pregunta de instalar herramientas
> de verificación ausentes (4.2) del lote completo. Cada una se registra con su par de wrappers
> `checks/<slug-estándar>-CR-XXX.sh` / `.ps1` (o `.warn.sh` / `.warn.ps1`).

## Agrupador de validaciones de arquitectura

Las fitness functions individuales tienden a quedar dispersas (una en `tests/arch/`, otra en un
`.dependency-cruiser.js`, otra en un script suelto), y entonces no hay un único comando que las
ejecute todas. Por eso el proyecto mantiene **un punto de entrada único por plataforma** que corre
*todas* las validaciones de arquitectura registradas — uno para macOS/Linux (`verify.sh`) y uno para
Windows (`verify.ps1`), con el mismo contrato y el mismo resultado, porque el equipo (o los agentes)
pueden ejecutarlo indistintamente desde cualquiera de los dos sistemas. La fitness function individual
puede seguir existiendo en su ubicación natural; el agrupador no la reemplaza, la **orquesta**.

### Convención

```
scripts/arch/
├── verify.sh                  # Agrupador macOS/Linux (también Git Bash en Windows): descubre y ejecuta checks/*.sh
├── verify.ps1                 # Agrupador Windows/PowerShell: descubre y ejecuta checks/*.ps1
└── checks/
    ├── testing-CR-001.sh        # CR bloqueante — par macOS/Linux (nombre = <slug-estándar>-CR-XXX)
    ├── testing-CR-001.ps1       # CR bloqueante — par Windows, mismo comando que el .sh
    ├── testing-CR-002.warn.sh   # CR warning (sufijo .warn.* → no tumba el gate)
    ├── testing-CR-002.warn.ps1
    └── testing-CR-003.sh / testing-CR-003.ps1
```

- **`scripts/arch/verify.sh`** y **`scripts/arch/verify.ps1`** — mismo contrato en las dos plataformas:
  cada uno corre los checks de su propia extensión (`*.sh` / `*.ps1`), imprime `PASS`/`FAIL`/`WARN` por
  criterio (CR) y un resumen, y sale con código `0` salvo que falle algún CR **bloqueante** (distinto de
  `0` en ese caso; los CR `warning` que fallan se reportan como `WARN` pero no cambian el código de
  salida). Aptos como gate de CI o local. **Un proyecto siempre tiene los dos** — no es opcional según
  el stack: cualquiera puede desarrollar desde macOS, Linux o Windows. **Se descubren por convención: no
  se editan al añadir validaciones.**
- **`scripts/arch/checks/<slug-estándar>-CR-XXX.sh`** + **`…CR-XXX.ps1`** (bloqueante) o con sufijo
  **`.warn.sh`** / **`.warn.ps1`** (warning) — el **par** de wrappers de un mismo criterio de
  cumplimiento, uno por plataforma, que invocan el **mismo** comando real de la fitness function
  (dependency-cruiser, ArchUnit, import-linter, NetArchTest, runner del framework o un script propio). El
  nombre (la referencia global del CR con `/`→`-`) permite mapear cada resultado a su criterio, requisito
  y estándar; el sufijo `.warn.*` marca su `Enfoque`. Si el chequeo real vive en otra herramienta, ambos
  wrappers solo la invocan — la lógica nunca diverge entre los dos.

Los archivos de referencia de esta convención están en `assets/arch-fitness/`
(`verify.sh`, `verify.ps1`, `checks/example.sh.template`, `checks/example.ps1.template` y un
`README.md`). **Leerlos antes de crear o modificar el agrupador** y copiarlos al repo respetando las
rutas.

### Cómo registrar una fitness function

Al crear una fitness function apta (paso 4 anterior), engancharla a ambos agrupadores:

1. **Asegurar los dos agrupadores.** Si `scripts/arch/verify.sh` o `scripts/arch/verify.ps1` no existen,
   crear los que falten copiando `assets/arch-fitness/verify.sh` y `assets/arch-fitness/verify.ps1` (y el
   `README.md` de esa carpeta) tal cual — se crean **juntos**, aunque el proyecto hoy solo se desarrolle
   desde una plataforma. Crear el directorio `scripts/arch/checks/` si falta. Si ya existen, no
   tocarlos — descubren los checks solos.
2. **Añadir el par de wrappers del criterio.** Crear `scripts/arch/checks/<slug-estándar>-CR-XXX.sh` y
   `scripts/arch/checks/<slug-estándar>-CR-XXX.ps1` (Enfoque `bloqueante`; p. ej. `testing-CR-001.sh` /
   `testing-CR-001.ps1`) o con sufijo `.warn.sh` / `.warn.ps1` (Enfoque `warning`; p. ej.
   `testing-CR-002.warn.sh` / `testing-CR-002.warn.ps1`) a partir de
   `assets/arch-fitness/checks/example.sh.template` y `assets/arch-fitness/checks/example.ps1.template`,
   reemplazando el comando por el chequeo acotado del paso 4 en **ambos** — el mismo comando, solo cambia
   la sintaxis del wrapper. Cada wrapper debe salir con código `0` si el criterio se cumple y distinto de
   `0` si se viola; el sufijo `.warn.*` es lo que evita que su fallo tumbe el gate.
3. **Cablear el atajo nativo (opcional, según stack).** Si el repo tiene un mecanismo natural, añadir
   alias que llamen a cada agrupador sin duplicar lógica: scripts en `package.json`
   (`"arch": "sh scripts/arch/verify.sh"`, `"arch:win": "powershell -File scripts/arch/verify.ps1"`), un
   target de `Makefile`, o un job de CI que use el runner del sistema operativo correspondiente. No es
   obligatorio: los dos agrupadores ya son, cada uno, el comando único de su plataforma.
4. **No ejecutar** los agrupadores ni el check por iniciativa propia si requiere instalar dependencias o
   correr suites pesadas; ofrecer el comando acotado y dejar que el usuario decida.

> **macOS y Windows, siempre.** El par `verify.sh` / `verify.ps1` (y el par de wrappers por CR) es cómo
> este skill garantiza que la compuerta de arquitectura se pueda ejecutar igual sin importar el sistema
> operativo desde el que la corra cada agente o desarrollador — no se omite ninguno de los dos por
> conveniencia, ni siquiera si el proyecto hoy solo se desarrolla desde una plataforma.
