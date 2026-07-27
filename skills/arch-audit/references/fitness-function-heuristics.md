# Rastreo heurístico de fitness functions existentes

Leer en la Fase 2B, paso 1, **solo cuando** la fila del criterio (`CR-XXX`) no existe o está incompleta
(estándares antiguos, o un ADR sin criterio) — si `Verificación` ya apunta a un wrapper, o el agrupador
del paso 0 ya cubrió el criterio, no hace falta este rastreo.

## Señales típicas por ecosistema

| Ecosistema | Herramientas / señales típicas |
|---|---|
| JVM (Java/Kotlin) | ArchUnit (`import com.tngtech.archunit`), tests `*ArchTest`, `*ArchitectureTest` |
| JS/TS | `dependency-cruiser` (`.dependency-cruiser.js`), `ts-arch`, reglas ESLint de `import/no-restricted-paths`, `eslint-plugin-boundaries` |
| .NET | `NetArchTest`, `ArchUnitNET` |
| Python | `import-linter` (`.importlinter`), `pytest-arch` |
| Cualquiera | agrupador `scripts/arch/verify.sh`/`verify.ps1` + `scripts/arch/checks/*.sh`/`*.ps1` (ver Fase 2B paso 0); otros scripts en `scripts/`, `tools/`, `arch/` con nombres como `check-architecture`, `fitness`, `compliance`; jobs de CI (`.github/workflows/*`, `.gitlab-ci.yml`, `azure-pipelines.yml`) con pasos de arquitectura |

Esta misma tabla es la que respalda la "Herramienta sugerida" del paso 3 de la Fase 2B (criterios aptos
sin fitness function).

## Comandos de rastreo genérico

```bash
grep -rniE "archunit|dependency-cruiser|import-linter|netarchtest|ts-arch|fitness|arch.?test|boundaries" \
  . --include="*.*" -l 2>/dev/null | grep -viE "node_modules|/.git/" | head -40
find . -type f \( -iname "*archtest*" -o -iname "*fitness*" -o -iname ".dependency-cruiser*" -o -iname ".importlinter" \) \
  -not -path "*/node_modules/*" 2>/dev/null
```

Mapear cada fitness function encontrada al criterio que valida (por el nombre `<estándar>-CR-XXX.sh`/`.ps1`,
o `<estándar>-CR-XXX.warn.sh`/`.warn.ps1` para enfoque `warning`; comentarios, o la regla que comprueba).
Un criterio puede no tener ninguna, tener una, o varias.
