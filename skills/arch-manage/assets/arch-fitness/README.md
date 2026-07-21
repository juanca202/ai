# Validaciones de arquitectura (fitness functions)

Este directorio agrupa las **fitness functions** de arquitectura del proyecto:
chequeos automatizados que validan que el código respeta los **criterios de
cumplimiento** (`CR-XXX`) de los estándares de dominio (`docs/standards/`). Cada CR
(p. ej. «cobertura ≥ 80%» dentro del requisito «Unit testing» de *Testing Standards*)
es una regla verificable; los ADR (`docs/adr/`) registran la decisión que lo fijó.

## Estructura

```
scripts/arch/
├── verify-architecture.sh   # Agrupador: ejecuta TODAS las validaciones
└── checks/
    ├── testing-CR-001.sh        # CR bloqueante (nombre = <estándar>-CR-XXX)
    ├── testing-CR-002.warn.sh   # CR warning (sufijo .warn.sh → no tumba el gate)
    └── testing-CR-003.sh
```

- **`verify-architecture.sh`** — punto de entrada único. Descubre y ejecuta cada
  `checks/*.sh`, imprime PASS/FAIL/WARN por criterio y un resumen, y sale con código
  distinto de 0 solo si falla algún CR **bloqueante**. No hay que editarlo al añadir validaciones.
- **`checks/<estándar>-CR-XXX.sh`** (bloqueante) o **`…-CR-XXX.warn.sh`** (warning) — una fitness
  function por **criterio de cumplimiento**, cuyo nombre es la referencia global del CR
  (`<slug-del-estándar>-CR-XXX`, p. ej. `testing-CR-001.sh`). El **Enfoque** del CR se codifica en el
  sufijo: sin sufijo = `bloqueante` (su fallo hace fallar el gate); `.warn.sh` = `warning` (su fallo se
  reporta como WARN pero no cambia el código de salida). Si la validación real vive en otra herramienta
  (ArchUnit, dependency-cruiser, import-linter, NetArchTest, el runner del framework…),
  este archivo es un wrapper delgado que la invoca.

## Ejecutar todas las validaciones

```bash
sh scripts/arch/verify-architecture.sh
```

O, si el repo lo cablea, mediante el mecanismo nativo del stack
(`npm run arch`, un target de `Makefile`, un job de CI, etc.).

## Añadir una validación

El skill `arch-manage` crea el wrapper en `checks/` al aprobar una fitness
function para un criterio de cumplimiento. Manualmente: copia `checks/example.sh.template`,
renómbralo a `<estándar>-CR-XXX.sh` (Enfoque `bloqueante`; p. ej. `testing-CR-001.sh`) o a
`<estándar>-CR-XXX.warn.sh` (Enfoque `warning`; p. ej. `testing-CR-002.warn.sh`) y reemplaza el
comando por el chequeo real.
