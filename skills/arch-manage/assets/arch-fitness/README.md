# Validaciones de arquitectura (fitness functions)

Este directorio agrupa las **fitness functions** de arquitectura del proyecto:
chequeos automatizados que validan que el código respeta los **criterios de
cumplimiento** (`CR-XXX`) de los estándares de dominio (`docs/standards/`). Cada CR
(p. ej. «cobertura ≥ 80%» dentro del requisito «Unit testing» de *Testing Standards*)
es una regla verificable; los ADR (`docs/adr/`) registran la decisión que lo fijó.

## Estructura

```
scripts/arch/
├── verify.sh                  # Agrupador macOS/Linux: ejecuta TODAS las validaciones (checks/*.sh)
├── verify.ps1                 # Agrupador Windows: ejecuta TODAS las validaciones (checks/*.ps1)
└── checks/
    ├── testing-CR-001.sh        # CR bloqueante — par macOS/Linux (nombre = <estándar>-CR-XXX)
    ├── testing-CR-001.ps1       # CR bloqueante — par Windows, mismo comando que el .sh
    ├── testing-CR-002.warn.sh   # CR warning (sufijo .warn.* → no tumba el gate)
    ├── testing-CR-002.warn.ps1
    └── testing-CR-003.sh / testing-CR-003.ps1
```

Los dos agrupadores (`verify.sh` y `verify.ps1`) siempre existen juntos, y cada
criterio de cumplimiento automatizado tiene siempre su **par** de wrappers
(`.sh` + `.ps1`) — así la compuerta de arquitectura se puede ejecutar igual sin
importar si quien la corre está en macOS, Linux o Windows.

- **`verify.sh`** / **`verify.ps1`** — puntos de entrada único por plataforma. Cada
  uno descubre y ejecuta los checks de su propia extensión, imprime PASS/FAIL/WARN
  por criterio y un resumen, y sale con código distinto de 0 solo si falla algún CR
  **bloqueante**. No hay que editarlos al añadir validaciones.
- **`checks/<estándar>-CR-XXX.sh`** + **`…CR-XXX.ps1`** (bloqueante) o con sufijo
  **`.warn.sh`** / **`.warn.ps1`** (warning) — el par de fitness functions de un
  mismo **criterio de cumplimiento**, uno por plataforma, cuyo nombre es la
  referencia global del CR (`<slug-del-estándar>-CR-XXX`, p. ej. `testing-CR-001`).
  El **Enfoque** del CR se codifica en el sufijo: sin sufijo = `bloqueante` (su
  fallo hace fallar el gate); `.warn.*` = `warning` (su fallo se reporta como WARN
  pero no cambia el código de salida). Ambos wrappers invocan el **mismo** comando
  real (ArchUnit, dependency-cruiser, import-linter, NetArchTest, el runner del
  framework…) — nunca duplican lógica de negocio entre sí, solo la sintaxis cambia.

## Ejecutar todas las validaciones

macOS / Linux (o Git Bash / WSL en Windows):

```bash
sh scripts/arch/verify.sh
```

Windows (PowerShell):

```powershell
powershell -File scripts/arch/verify.ps1
```

O, si el repo lo cablea, mediante el mecanismo nativo del stack
(`npm run arch`, un target de `Makefile`, un job de CI, etc.).

## Añadir una validación

El skill `arch-manage` crea el **par** de wrappers en `checks/` al aprobar una
fitness function para un criterio de cumplimiento — siempre los dos juntos, nunca
solo uno. Manualmente: copia `checks/example.sh.template` y
`checks/example.ps1.template`, renómbralos a `<estándar>-CR-XXX.sh` /
`<estándar>-CR-XXX.ps1` (Enfoque `bloqueante`; p. ej. `testing-CR-001.sh` /
`testing-CR-001.ps1`) o a `<estándar>-CR-XXX.warn.sh` / `<estándar>-CR-XXX.warn.ps1`
(Enfoque `warning`) y reemplaza el comando por el chequeo real — el mismo comando en
ambos, solo cambia la sintaxis del wrapper.
