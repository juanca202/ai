# Validaciones de arquitectura (fitness functions)

Este directorio agrupa las **fitness functions** de arquitectura del proyecto:
chequeos automatizados que validan que el código respeta los **requisitos** de los
estándares de dominio (`docs/standards/`). Cada requisito (p. ej. «Unit testing»
dentro de *Testing Standards*) es una regla verificable; los ADR (`docs/adr/`)
registran la decisión que lo fijó.

## Estructura

```
scripts/arch/
├── verify-architecture.sh   # Agrupador: ejecuta TODAS las validaciones
└── checks/
    ├── testing-unit-testing.sh   # Una fitness function por REQUISITO (nombre = <estándar>-<requisito>)
    └── testing-e2e-testing.sh
```

- **`verify-architecture.sh`** — punto de entrada único. Descubre y ejecuta cada
  `checks/*.sh`, imprime PASS/FAIL por requisito y un resumen, y sale con código
  distinto de 0 si alguna falla. No hay que editarlo al añadir validaciones.
- **`checks/<estándar>-<requisito>.sh`** — una fitness function por **requisito**,
  cuyo nombre es la referencia global del requisito (`<slug-del-estándar>-<slug-del-requisito>`,
  p. ej. `testing-unit-testing.sh`). Si la validación real vive en otra herramienta
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
function para un requisito. Manualmente: copia `checks/example.sh.template`,
renómbralo a `<estándar>-<requisito>.sh` (p. ej. `testing-unit-testing.sh`) y reemplaza el comando por el chequeo real.
