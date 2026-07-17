# Validaciones de arquitectura (fitness functions)

Este directorio agrupa las **fitness functions** de arquitectura del proyecto:
chequeos automatizados que validan que el código respeta las decisiones
registradas en los ADR (`docs/adr/`).

## Estructura

```
scripts/arch/
├── verify-architecture.sh   # Agrupador: ejecuta TODAS las validaciones
└── checks/
    ├── ADR-012-graphql.sh    # Una fitness function por ADR (o wrapper)
    └── ADR-018-layers.sh
```

- **`verify-architecture.sh`** — punto de entrada único. Descubre y ejecuta cada
  `checks/*.sh`, imprime PASS/FAIL por ADR y un resumen, y sale con código
  distinto de 0 si alguna falla. No hay que editarlo al añadir validaciones.
- **`checks/ADR-XXX-<slug>.sh`** — una fitness function por decisión. Si la
  validación real vive en otra herramienta (ArchUnit, dependency-cruiser,
  import-linter, NetArchTest…), este archivo es un wrapper delgado que la invoca.

## Ejecutar todas las validaciones

```bash
sh scripts/arch/verify-architecture.sh
```

O, si el repo lo cablea, mediante el mecanismo nativo del stack
(`npm run arch`, un target de `Makefile`, un job de CI, etc.).

## Añadir una validación

El skill `adr-manage` crea el wrapper en `checks/` al aprobar una fitness
function para un ADR. Manualmente: copia `checks/ADR-XXX-example.sh.template`,
renómbralo a `ADR-XXX-<slug>.sh` y reemplaza el comando por el chequeo real.
