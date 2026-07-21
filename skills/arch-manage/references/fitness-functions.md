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
   - **Sí** → crear la fitness function (paso 4) y referenciarla en la fila del CR (paso 5).

4. **Crear la fitness function:**
   - Detectar el stack (manifiestos: `package.json`, `pom.xml`, `pyproject.toml`, `*.csproj`, `go.mod`, etc.) y elegir la herramienta idónea: dependency-cruiser / ESLint boundaries (JS/TS), ArchUnit (JVM), import-linter (Python), NetArchTest (.NET), un runner del propio framework (p. ej. cobertura de PHPUnit), o un script de CI genérico si no hay una herramienta natural.
   - Si ya existe configuración de esa herramienta en el repo, **añadir la nueva regla** ahí en vez de duplicar setup. Si no, crear el archivo mínimo (test/script + config) en una ubicación convencional (`tests/arch/`, `arch/`, `scripts/`, etc.).
   - Escribir el chequeo que corresponde a la **descripción del CR** (p. ej. cobertura ≥ 80%; prohibir imports que violen la capa; fallar si hay tests unit fuera de PHPUnit; fallar si no hay specs de Playwright para los flujos marcados).
   - Confirmar con el usuario el comando acotado para ejecutarla. No ejecutar build ni suites completas por iniciativa propia; si hace falta instalar dependencias, avisar al usuario.

5. **Registrar la fitness function en el agrupador** — engancharla al entrypoint único (ver más abajo). En resumen: crear (si no existe) `scripts/arch/verify-architecture.sh` y añadir el wrapper del CR: `scripts/arch/checks/<slug-estándar>-CR-XXX.sh` si el `Enfoque` es `bloqueante` (p. ej. `testing-CR-001.sh`), o `scripts/arch/checks/<slug-estándar>-CR-XXX.warn.sh` si es `warning` (p. ej. `testing-CR-002.warn.sh`). El sufijo `.warn.sh` es lo que el agrupador reconoce para no tumbar el gate.

6. **Referenciar en la fila del CR:** poner `Automatable: yes`, el `Enfoque` (`bloqueante`/`warning`) y en `Verificación` la ruta real del wrapper (`…-CR-XXX.sh` o `…-CR-XXX.warn.sh` según el Enfoque; o del test/script si el CR apunta directo a él). Así `arch-audit` lo descubre y lo ejecuta desde la fila del criterio, y además queda incluido en el agrupador.

> En invocación en lote (p. ej. desde `arch-discover`), hacer esta evaluación por cada CR apto, pero agrupar para no abrumar: preguntar una vez si el usuario quiere crear fitness functions para todos los CR aptos del lote, o elegir cuáles. Cada una se registra con su wrapper `checks/<slug-estándar>-CR-XXX.sh` (o `.warn.sh`).

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
    ├── testing-CR-001.sh        # CR bloqueante (nombre = <slug-estándar>-CR-XXX)
    ├── testing-CR-002.warn.sh   # CR warning (sufijo .warn.sh → no tumba el gate)
    └── testing-CR-003.sh
```

- **`scripts/arch/verify-architecture.sh`** — corre cada `checks/*.sh`, imprime `PASS`/`FAIL`/`WARN` por
  criterio (CR) y un resumen, y sale con código `0` salvo que falle algún CR **bloqueante** (distinto de
  `0` en ese caso; los CR `warning` que fallan se reportan como `WARN` pero no cambian el código de
  salida). Apto como gate de CI o local. **Se descubre por convención: no se edita al añadir validaciones.**
- **`scripts/arch/checks/<slug-estándar>-CR-XXX.sh`** (bloqueante) o **`…-CR-XXX.warn.sh`** (warning) —
  un wrapper delgado por **criterio de cumplimiento** que invoca la fitness function real
  (dependency-cruiser, ArchUnit, import-linter, NetArchTest, runner del framework o un script propio). El
  nombre (la referencia global del CR con `/`→`-`) permite mapear cada resultado a su criterio, requisito
  y estándar; el sufijo `.warn.sh` marca su `Enfoque`. Si el chequeo real vive en otra herramienta, el
  wrapper solo lo invoca.

Los archivos de referencia de esta convención están en `assets/arch-fitness/`
(`verify-architecture.sh`, `checks/example.sh.template` y un `README.md`). **Leerlos antes de
crear o modificar el agrupador** y copiarlos al repo respetando las rutas.

### Cómo registrar una fitness function

Al crear una fitness function apta (paso 4 anterior), engancharla al agrupador:

1. **Asegurar el agrupador.** Si `scripts/arch/verify-architecture.sh` no existe, crearlo copiando
   `assets/arch-fitness/verify-architecture.sh` (y el `README.md` de esa carpeta) tal cual. Crear el
   directorio `scripts/arch/checks/` si falta. Si ya existe el agrupador, no tocarlo — descubre los checks solo.
2. **Añadir el wrapper del criterio.** Crear `scripts/arch/checks/<slug-estándar>-CR-XXX.sh` (Enfoque
   `bloqueante`; p. ej. `testing-CR-001.sh`) o `scripts/arch/checks/<slug-estándar>-CR-XXX.warn.sh`
   (Enfoque `warning`; p. ej. `testing-CR-002.warn.sh`) a partir de `assets/arch-fitness/checks/example.sh.template`,
   reemplazando el comando por el chequeo acotado del paso 4. El wrapper debe salir `0` si el criterio se cumple y distinto de `0` si se viola; el sufijo `.warn.sh` es lo que evita que su fallo tumbe el gate.
3. **Cablear el atajo nativo (opcional, según stack).** Si el repo tiene un mecanismo natural, añadir un
   alias que llame al agrupador sin duplicar lógica: script `arch` en `package.json`
   (`"arch": "sh scripts/arch/verify-architecture.sh"`), un target de `Makefile`, un job de CI, etc.
4. **No ejecutar** el agrupador ni el check por iniciativa propia si requiere instalar dependencias o
   correr suites pesadas; ofrecer el comando acotado y dejar que el usuario decida.

> **Stacks sin `sh` (p. ej. Windows puro).** Mantener el mismo contrato con el equivalente idóneo
> (un `verify-architecture.ps1`, o un runner en el lenguaje del repo). Lo esencial es que exista **un**
> comando que ejecute todas las validaciones y devuelva un código de salida agregado.
