# Rastreo heurístico de fitness functions existentes

Leer en la Fase 2B, paso 1, **solo cuando** la fila del criterio (`CR-XXX`) no existe o está incompleta
(estándares antiguos, o un ADR sin criterio) — si el criterio ya tiene `Verificación: yes`, o el
runner del paso 0 ya lo cubrió, no hace falta este rastreo.

## Preferir el runner de validaciones

Leer en la Fase 2B, paso 0, antes de ejecutar chequeos uno por uno: comprobar si el proyecto tiene un
**runner** que corre todas las validaciones de arquitectura de una vez (lo crea `arch-manage`, escrito
en el lenguaje del stack del repo — Node, Python, PHP…, o shell como último recurso):

```bash
ls scripts/arch/verify.* scripts/arch/checks/* 2>/dev/null
```

- **Si existe**, es la vía preferida: una sola corrida acotada valida todos los criterios con fitness
  function. Ejecutar el runner con el runtime del stack (`node scripts/arch/verify.mjs`,
  `python scripts/arch/verify.py`, etc., o el alias nativo del repo — `npm run arch`, target de
  `Makefile`, etc.) aplicando las mismas cautelas del paso 2 (no correr build/suite completa; si
  requiere instalar dependencias pesadas, preguntar antes). Cada archivo de `checks/` agrupa las
  fitness functions de **un estándar** (`checks/<slug-estándar>.<ext>`, p. ej. `checks/testing.mjs`) e
  imprime una línea de protocolo por criterio — `PASS|FAIL|WARN <estándar>/CR-XXX — detalle`:
  **mapear cada línea a su criterio por esa referencia** y alimentar ese resultado al estado del
  criterio en la Fase 2. Para auditar un solo estándar, el runner acepta su slug como argumento
  (`node scripts/arch/verify.mjs testing`). El resumen final (criterios PASS / WARN / FAIL) y el
  código de salida agregado resumen la salud arquitectónica ejecutable: el runner sale con código ≠ 0
  **solo** si falla algún criterio `bloqueante`; un criterio `warning` que falla se reporta como `WARN`
  pero **no** cambia el código de salida ni el veredicto ejecutable.
- Un criterio con `Verificación: yes` cuyo archivo de checks (`checks/<slug-estándar>.<ext>`) **no**
  existe, o cuya referencia `CR-XXX` no aparece en la salida de la corrida, se ejecuta individualmente
  (pasos 1-2) y además se anota como observación: la fitness function no está registrada en el archivo
  de checks de su estándar (sugerir corregirlo vía `arch-manage`).
- **Si no existe** el runner, continuar con la detección y ejecución individuales (pasos 1-2) y,
  si hay dos o más fitness functions sueltas, **sugerir crear el runner** (`scripts/arch/verify.<ext>`
  en el lenguaje del stack) vía `arch-manage`, para que en adelante todas se ejecuten con un solo
  comando.

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
