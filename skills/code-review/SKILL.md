---
name: code-review
description: Ejecutar la batería de verificaciones automatizadas de un proyecto TypeScript/Node antes de aceptar una implementación como apta para merge - `tsc --noEmit` (crítico, fail-fast), `eslint` (calidad), suite de tests (comportamiento), `build` (integración) y `sonar-scanner` (análisis estático). Usar siempre que el usuario pida "revisión de código", "code review", "valida el código", "ejecuta los checks", "revisa antes de PR/merge", o tras terminar una historia o TK que toque código TS. Devolver un informe Markdown con estado por check, errores agrupados, veredicto (apto / no apto / incompleto) y próximas acciones priorizadas. No corrige código ni modifica configuración.
license: MIT
---

# Skill: Revisión de código

Ejecutar la batería fija de 5 verificaciones automatizadas que debe pasar un proyecto TypeScript/Node antes de aceptar una implementación como apta para merge, y devolver un informe estructurado y accionable.

> **Alcance:** solo audita y reporta. No corrige código, no modifica configuración, no instala dependencias.
>
> **Entrada mínima:** estar en la raíz de un repositorio con `package.json`. Si no hay `package.json`, parar y avisar.
>
> **Veredicto:** `✅ Apto` (4 bloqueantes OK, Sonar cualquier estado) · `❌ No apto` (cualquier bloqueante FAIL) · `⚠️ Incompleto` (algún bloqueante SKIPPED por config o herramienta ausente).

---

## Checks

| # | Check | Categoría | Comando base | Política |
|---|-------|-----------|--------------|----------|
| 1 | Tipado | **Crítico** | `tsc --noEmit` | Bloqueante. **Fail-fast**: si falla, no ejecutar el resto. |
| 2 | Linter | Calidad | `eslint` | Bloqueante solo si hay `error`s. Warnings = informativos. |
| 3 | Tests | Comportamiento | script `test` del proyecto | Bloqueante. |
| 4 | Build | Integración | script `build` del proyecto | Bloqueante. |
| 5 | Sonar | Análisis estático | `sonar-scanner` | Nunca bloqueante. Solo informativo. |

**Por qué fail-fast solo en tsc:** si los tipos no compilan, eslint (`@typescript-eslint`), tests y build fallan masivamente por código roto — el ruido no aporta señal nueva. Eslint, tests y build pueden fallar de forma independiente y sí aportan señales distintas, por eso se ejecutan los cuatro completos.

**Por qué eslint bloquea solo con errors:** eslint distingue `severity: error` (rompe contrato) y `severity: warning` (mejora opcional). Para tratar warnings como errors, usar el modificador `incluir-warnings-eslint`.

---

## Modificadores de invocación

| Modificador | Efecto |
|-------------|--------|
| `default` | Ejecutar los 5 checks con la política descrita. |
| `solo-bloqueantes` | Omitir sonar. |
| `incluir-warnings-eslint` | Tratar warnings de eslint como errors (`--max-warnings=0`). |
| `sin-sonar` | Omitir sonar-scanner. |
| `sin-tests` | Omitir tests. |
| `solo <check>` | Ejecutar únicamente ese check (p. ej. `solo tsc`). |
| `guardar-informe` | Persistir el informe en `docs/code-review/<YYYYMMDD-HHMMSS>.md`. |

Si el usuario no especifica modificador, asumir `default`.

---

## Flujo de ejecución

### Paso 1 — Detectar entorno

1. Verificar `package.json` en la raíz; si no existe, parar.
2. Detectar runner (`npm`/`yarn`/`pnpm`) leyendo el lockfile presente. No asumir `npm` por defecto.
3. Leer `package.json.scripts` para resolver el comando real por check; fallback a `npx <tool>`.
4. Capturar metadata: rama actual (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`), estado del working tree (`git status --porcelain`).

### Paso 2 — Ejecutar checks en orden

Ejecutar secuencialmente (no en paralelo — comparten caché y la salida concurrente es ilegible):

1. **tsc** — `tsc --noEmit`. Si FAIL: marcar checks 2–5 como `— (no ejecutado)` y saltar al Paso 3.
2. **eslint** — con formato JSON si se invoca por fallback; si por script, parsear línea final `X problems (Y errors, Z warnings)`.
3. **tests** — detectar Vitest o Jest por `devDependencies`; fallback `npx vitest run` / `npx jest`.
4. **build** — por código de salida; si usa `tsc -p tsconfig.build.json`, parsear errores con el mismo patrón de tsc.
5. **sonar** — verificar `sonar-project.properties`; si falta → SKIPPED. Si el servidor no responde → FAIL (no bloquea veredicto).

> No usar `--fix`, `--write`, `--force` ni equivalentes en ninguna herramienta.

### Paso 3 — Construir informe

1. Calcular veredicto según los 4 bloqueantes (tsc, eslint sin errors, tests, build).
2. Generar tabla resumen con los 5 checks.
3. Generar detalle **solo** para checks en FAIL o SKIPPED bloqueante; truncar a los primeros 10 errores por check (`… y N más` si hay más).
4. Generar "Próximas acciones" priorizando: bloqueantes FAIL (tsc → tests → build → eslint errors) → eslint warnings → Sonar findings → checks SKIPPED por config ausente.
5. Si `guardar-informe` está activo, escribir en `docs/code-review/<YYYYMMDD-HHMMSS>.md` y mencionar la ruta.

### Paso 4 — Presentar resultado

Devolver el informe completo. **No** continuar con `git commit`, push ni merge aunque el veredicto sea Apto — salvo instrucción explícita del usuario.

---

## Formato del informe

```
## Revisión de Código — <YYYY-MM-DD HH:MM>

- **Repositorio:** <nombre del paquete o ruta>
- **Rama:** <rama> · **Commit:** <sha-corto>
- **Working tree:** limpio | sucio (N archivos modificados)
- **Modo:** default | solo-bloqueantes | …

### Resumen

| # | Check        | Categoría      | Estado  | Detalle                 | Duración |
|---|--------------|----------------|---------|-------------------------|----------|
| 1 | tsc --noEmit | Crítico        | ✅/❌/⚠️ | <N errores>             | <s>      |
| 2 | eslint       | Calidad        | …       | <N errores, M warnings> | …        |
| 3 | tests        | Comportamiento | …       | <P passed, F failed>    | …        |
| 4 | build        | Integración    | …       | OK | FAIL | SKIPPED    | …        |
| 5 | sonar        | Análisis est.  | …       | <findings> | URL       | …        |

### Veredicto: ✅ Apto | ❌ No apto | ⚠️ Incompleto

### Detalle de checks fallidos
(solo checks en FAIL o SKIPPED bloqueante)

### Próximas acciones
1. …
```

---

## Manejo de errores

| Situación | Cómo actuar |
|-----------|-------------|
| Falta `package.json` | Parar antes de ejecutar nada. |
| Falta `tsconfig.json` | tsc → SKIPPED. Continuar con el resto. Veredicto: **Incompleto**. |
| Runner ausente del PATH | Parar y preguntar al usuario qué runner usa. |
| Script en `package.json` pero binario inexistente | FAIL — no SKIPPED (el proyecto está mal configurado). |
| Test runner sin script ni config | Intentar `npx vitest run` o `npx jest`; si ambos fallan, SKIPPED. |
| `sonar-scanner` no disponible | SKIPPED. No afecta veredicto. |
| Falta `sonar-project.properties` | SKIPPED. No bloquea veredicto. |
| Errores de red en sonar | FAIL con motivo de red. No bloquea veredicto. |
| Ejecución > 10 min en un check | Continuar pero avisar al usuario; permitir cancelación. |
| Working tree sucio | No bloquear. Incluir nota en el encabezado del informe. |
| `tsc` FAIL | **STOP. Fail-fast.** Marcar checks 2–5 como `— (no ejecutado)`. |

---

## Anti-patterns

- Corregir el código reportado como erróneo — el skill solo audita.
- Ejecutar herramientas con `--fix` o `--write`.
- Modificar `package.json` para añadir scripts faltantes.
- Marcar como SKIPPED un check que falló por error real.
- Declarar Apto cuando algún bloqueante quedó SKIPPED por config ausente — esos casos son Incompleto.
- Continuar tras FAIL de tsc.
- Truncar errores sin indicar `… y N más`.
- Ejecutar checks en paralelo salvo petición explícita.
- Asumir el runner sin detectarlo por lockfile.
- Cambiar de rama, hacer `git stash` o `git clean` antes de ejecutar.
- Instalar dependencias faltantes — reportar SKIPPED y dejar al usuario.
- Continuar a `git commit`, push o merge tras un veredicto Apto sin instrucción explícita.
- Ejecutar el skill en un repo sin `package.json`.

---

## Notas

### Parseo por herramienta

**tsc** — patrón: `<archivo>(<línea>,<columna>): error TS<código>: <mensaje>`. Conteo: líneas con `: error TS`. Código 0 y sin líneas con `error TS` → OK.

**eslint** — preferir `--format json` en fallback. Si por script: parsear línea final `X problems (Y errors, Z warnings)`. Errors > 0 → FAIL. Errors = 0 y warnings > 0 → OK con detalle informativo.

**tests (Vitest/Jest)** — Vitest: `Test Files X passed | Y failed` / `Tests P passed | F failed | S skipped`. Jest: `Tests: P passed, F failed, S skipped, T total`. Código 0 → OK.

**build** — estado por código de salida. Si usa `tsc -p tsconfig.build.json`, parsear con el mismo patrón de tsc. Vite/esbuild/Rollup: capturar bloque final de error.

**sonar** — éxito: código 0 y log contiene `EXECUTION SUCCESS`. Capturar URL del dashboard si aparece (`ANALYSIS SUCCESSFUL, you can find the results at: <url>`).

### Relación con otros skills

- **story-implement** ya ejecuta lint/typecheck/build por cada TK individual. Este skill amplía esa validación a la batería completa antes del merge.
- **story-integrate** requiere veredicto **✅ Apto** como precondición del merge.
- **git-pr** puede invocar este skill de forma bloqueante antes de crear un PR.

### Idioma del informe

Aplicar orden canónico: (1) `preferred language` en `.agents/MEMORY.md`; (2) idioma del turno del usuario; (3) preguntar y persistir. Los mensajes de error originales de las herramientas no se traducen.