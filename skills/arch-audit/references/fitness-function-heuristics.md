# Rastreo heurístico de fitness functions existentes

Leer en la Fase 2B, paso 1, **solo cuando** la fila del criterio (`CR-XXX`) no existe o está incompleta
(estándares antiguos, o un ADR sin criterio) — si `Verificación` ya apunta al archivo de checks de su
estándar, o el runner del paso 0 ya cubrió el criterio, no hace falta este rastreo.

## Señales típicas por ecosistema

| Ecosistema | Herramientas / señales típicas |
|---|---|
| JVM (Java/Kotlin) | ArchUnit (`import com.tngtech.archunit`), tests `*ArchTest`, `*ArchitectureTest` |
| JS/TS | `dependency-cruiser` (`.dependency-cruiser.js`), `ts-arch`, reglas ESLint de `import/no-restricted-paths`, `eslint-plugin-boundaries` |
| .NET | `NetArchTest`, `ArchUnitNET` |
| Python | `import-linter` (`.importlinter`), `pytest-arch` |
| Cualquiera | runner `scripts/arch/verify.<ext>` + `scripts/arch/checks/<slug-estándar>.<ext>` en el lenguaje del stack (ver Fase 2B paso 0); otros scripts en `scripts/`, `tools/`, `arch/` con nombres como `check-architecture`, `fitness`, `compliance`; jobs de CI (`.github/workflows/*`, `.gitlab-ci.yml`, `azure-pipelines.yml`) con pasos de arquitectura |

Esta misma tabla es la que respalda la "Herramienta sugerida" del paso 3 de la Fase 2B (criterios aptos
sin fitness function).

## Comandos de rastreo genérico

```bash
grep -rniE "archunit|dependency-cruiser|import-linter|netarchtest|ts-arch|fitness|arch.?test|boundaries" \
  . --include="*.*" -l 2>/dev/null | grep -viE "node_modules|/.git/" | head -40
find . -type f \( -iname "*archtest*" -o -iname "*fitness*" -o -iname ".dependency-cruiser*" -o -iname ".importlinter" \) \
  -not -path "*/node_modules/*" 2>/dev/null
```

Mapear cada fitness function encontrada al criterio que valida: en un archivo de checks
(`checks/<slug-estándar>.<ext>`), por la referencia `CR-XXX` de cada chequeo (en sus comentarios de
trazabilidad y en su línea de salida `PASS|FAIL|WARN <estándar>/CR-XXX — …`); en artefactos sueltos,
por comentarios o por la regla que comprueba. Un criterio puede no tener ninguna, tener una, o varias.
