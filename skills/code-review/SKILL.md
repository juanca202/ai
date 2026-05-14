---
name: code-review
description: Ejecutar la batería de verificaciones automatizadas de un proyecto TypeScript/Node antes de aceptar una implementación como apta para merge - `tsc --noEmit` (crítico, fail-fast), `eslint` (calidad), suite de tests (comportamiento), `build` (integración) y `sonar-scanner` (análisis estático). Usar siempre que el usuario pida "revisión de código", "code review", "valida el código", "ejecuta los checks", "revisa antes de PR/merge", o tras terminar una historia o TK que toque código TS. Devolver un informe Markdown con estado por check, errores agrupados, veredicto (apto / no apto / incompleto) y próximas acciones priorizadas. No corrige código ni modifica configuración.
license: MIT
---

# Skill: Revisión de Código

Ejecutar la batería fija de 5 verificaciones automatizadas que debe pasar un proyecto TypeScript/Node antes de aceptar una implementación como apta para merge, y devolver un informe estructurado y accionable.

El skill **no** corrige código, **no** modifica configuración, **no** instala dependencias. Solo audita y reporta.

---

## Purpose

Validar de forma reproducible que un cambio (working tree, rama, branch) pasa los 5 checks acordados, en este orden:

| # | Check | Categoría | Comando base | Política |
|---|-------|-----------|--------------|----------|
| 1 | Tipado | **Crítico** | `tsc --noEmit` | Bloqueante. **Fail-fast**: si falla, parar y no ejecutar el resto. |
| 2 | Linter | Calidad | `eslint` | Bloqueante solo si hay `error`s. Warnings = informativos. |
| 3 | Tests | Comportamiento | script `test` del proyecto | Bloqueante. |
| 4 | Build | Integración | script `build` del proyecto | Bloqueante. |
| 5 | Sonar | Análisis estático | `sonar-scanner` | **Nunca bloqueante**. Solo informativo. |

**Veredicto final:**

- **✅ Apto** — tsc OK + eslint sin errors + tests OK + build OK. Sonar puede estar OK, FAIL o Skipped.
- **❌ No apto** — cualquier bloqueante (tsc, eslint con errors, tests, build) en FAIL.
- **⚠️ Incompleto** — algún bloqueante quedó SKIPPED por configuración o herramienta ausente.

---

## Scope

**Incluye:**

- Detección automática del runner (`npm`, `yarn`, `pnpm`) leyendo el lockfile presente.
- Resolución del comando real por check leyendo `package.json.scripts`, con fallback a `npx <tool>`.
- Detección de configuración de Sonar: presencia de `sonar-project.properties` o `sonar.properties` en la raíz.
- Ejecución secuencial de los 5 checks, con **fail-fast** únicamente en `tsc`.
- Parseo de salida de cada herramienta: total de errores, total de warnings, primeros N errores con archivo y línea.
- Informe Markdown con tabla resumen + detalle solo de los checks que fallaron + próximas acciones priorizadas.
- Captura de metadata del repo: rama actual, commit corto, working tree limpio/sucio.

**No incluye:**

- **Corregir código**, formato ni los errores reportados. Eso es trabajo de `story-implement` o del usuario.
- **Modificar configuración** (`tsconfig.json`, `.eslintrc.*`, `vitest.config.ts`, `jest.config.ts`, `sonar-project.properties`, scripts de `package.json`).
- **Instalar dependencias** faltantes. Si una herramienta no está disponible, se reporta como SKIPPED, no se instala.
- **Crear** archivos de configuración ausentes (sonar, eslint, tsconfig).
- **Ejecutar herramientas con `--fix` o `--write`** (eslint, prettier). El skill es read-only sobre el código fuente.
- Revisar diffs, mensajes de commit o descripción de PR. Eso lo cubre un skill distinto.
- Análisis de seguridad fuera de Sonar (`npm audit`, `snyk`) salvo petición explícita.
- Proyectos Java/Maven/Gradle. Si no hay `package.json`, parar y avisar.

---

## Triggers

Invocar este skill cuando el usuario:

- Pida explícitamente "revisión de código", "haz revisión de código", "code review", "haz code review", "ejecuta el code review", "revisa el código".
- Pida "valida el código", "ejecuta los checks", "ejecuta las verificaciones", "comprueba antes de merge", "comprueba antes del PR".
- Termine la implementación de una historia o TK con `story-implement` y pida la fase de validación previa al merge.
- Mencione `tsc`, `eslint`, `sonar-scanner` combinados con verbos de ejecución/validación.

**No** invocar si el usuario solo pide ejecutar **uno** de los checks de forma aislada (p. ej. "corre los tests", "haz lint"). En ese caso, ejecutar el comando directamente sin el skill completo.

---

## Inputs

Para ejecutar el skill, el agente necesita:

- **Obligatorio**: estar en la raíz de un repositorio con `package.json`. Si no, parar y avisar.
- **Opcional**:
  - Modificador de invocación (ver [Modificadores](#modificadores-de-invocación)).
  - Ruta de salida: si el usuario pide "guarda el informe", persistirlo en `docs/code-review/<YYYYMMDD-HHMMSS>.md` además de imprimirlo.
  - Subset de checks: el usuario puede pedir "code review pero solo tsc y tests".

---

## Modificadores de invocación

| Modificador | Efecto |
|-------------|--------|
| `default` | Ejecutar los 5 checks con la política descrita arriba. |
| `solo-bloqueantes` | Ejecutar tsc, eslint, tests, build. Omitir sonar. |
| `incluir-warnings-eslint` | Tratar warnings de eslint como errores. Equivalente a `eslint --max-warnings=0`. |
| `sin-sonar` | Omitir sonar-scanner (útil en local sin servidor Sonar). |
| `sin-tests` | Omitir tests (útil para verificar tipado/build rápido). |
| `solo <check>` | Ejecutar únicamente el check indicado (p. ej. `solo tsc`). |
| `guardar-informe` | Persistir el informe en `docs/code-review/<YYYYMMDD-HHMMSS>.md`. |

Si el usuario no especifica modificador, asumir `default`.

**Ejemplos de mapeo:**

- "haz code review" → `default`.
- "code review pero sin sonar, tarda mucho" → `sin-sonar`.
- "ejecuta solo los bloqueantes antes del push" → `solo-bloqueantes`.
- "valida solo el tipado" → `solo tsc`.
- "revisa antes del PR y guárdame el informe" → `default` + `guardar-informe`.
- "code review estricto, los warnings cuentan" → `default` + `incluir-warnings-eslint`.

---

## Outputs

El skill **siempre** devuelve un informe Markdown con esta estructura:

```
## Revisión de Código — <YYYY-MM-DD HH:MM>

- **Repositorio:** <nombre del paquete o ruta>
- **Rama:** <git rev-parse --abbrev-ref HEAD> · **Commit:** <git rev-parse --short HEAD>
- **Working tree:** limpio | sucio (N archivos modificados)
- **Modo:** default | solo-bloqueantes | …

### Resumen

| # | Check         | Categoría        | Estado     | Detalle                  | Duración |
|---|---------------|------------------|------------|--------------------------|----------|
| 1 | tsc --noEmit  | Crítico          | ✅/❌/⚠️    | <N errores>              | <s>      |
| 2 | eslint        | Calidad          | …          | <N errores, M warnings>  | …        |
| 3 | tests         | Comportamiento   | …          | <P passed, F failed>     | …        |
| 4 | build         | Integración      | …          | <ok / N errores>         | …        |
| 5 | sonar-scanner | Análisis estático| …          | <ok / falló / sin cfg.>  | …        |

**Veredicto:** ✅ Apto para merge | ❌ No apto — <lista de bloqueantes fallidos> | ⚠️ Incompleto — <bloqueante SKIPPED>

### Detalle de checks fallidos

#### <N>. <check> — ❌ FAIL
- **Comando:** `<comando real ejecutado>`
- **Código de salida:** <N>
- **Resumen:** <total de errores / tests fallidos / etc.>
- **Primeros errores (máx. 10):**
  - `<archivo>:<línea>:<col>` — `<código>`: <mensaje>
  - …
- **… y <N> más** (si aplica)

[… repetir solo por checks con estado ❌ FAIL o ⚠️ SKIPPED bloqueante …]

### Próximas acciones

1. <acción priorizada — bloqueantes primero, luego calidad, luego sonar>
2. …
```

**Si los 5 checks pasan**, omitir "Detalle de checks fallidos" y devolver el resumen seguido de:

```
### Resultado
Los 5 checks pasaron. Apto para merge.
```

**Si tsc falla (fail-fast)**, devolver solo el detalle de tsc en la tabla y un mensaje claro:

```
**Veredicto:** ❌ No apto — tsc falló y los demás checks se omitieron (fail-fast).

Resolver los errores de tipado y volver a ejecutar la revisión de código.
```

---

## Flujo de ejecución

### Paso 1 — Validar entorno

Antes de ejecutar nada:

1. Verificar `package.json` en el directorio actual. Si no existe, parar:
   ```
   ⚠️ No se encontró package.json. Este skill solo aplica a proyectos TypeScript/Node.
   ```
2. Verificar `tsconfig.json`. Si no existe, el check `tsc` será SKIPPED (motivo: `sin tsconfig.json`) y el veredicto final será **Incompleto**.
3. Detectar runner por lockfile:
   - `pnpm-lock.yaml` → `pnpm`
   - `yarn.lock` → `yarn`
   - `package-lock.json` o ninguno → `npm`
4. Leer `package.json.scripts` y registrar qué scripts existen (`typecheck`, `lint`, `test`, `test:ci`, `build`).
5. Capturar metadata Git:
   - `git rev-parse --abbrev-ref HEAD` → rama
   - `git rev-parse --short HEAD` → commit
   - `git status --porcelain` → working tree limpio/sucio (solo informativo, no bloquea).

### Paso 2 — Resolver comando por check

Para cada check, elegir comando en este orden de preferencia:

| Check | Preferencia 1 (script en package.json) | Fallback (si no hay script) |
|-------|----------------------------------------|------------------------------|
| tsc | `<runner> run typecheck` o `type-check` | `npx tsc --noEmit` |
| eslint | `<runner> run lint` | `npx eslint . --max-warnings=9999` (para no fallar por warnings; el conteo lo hace el skill) |
| tests | `<runner> run test:ci`, si no hay → `<runner> run test`, si no hay → `npx vitest run` o `npx jest` según `devDependencies` | (lo anterior es ya el fallback) |
| build | `<runner> run build` | `npx tsc -p tsconfig.build.json` si existe, sino SKIPPED |
| sonar | `sonar-scanner` (binario en PATH) | `npx sonar-scanner` |

**Adicional para sonar**: si no existe `sonar-project.properties` ni `sonar.properties` en la raíz, marcar SKIPPED con motivo `sin sonar-project.properties` antes incluso de intentar invocarlo.

Para `incluir-warnings-eslint`, añadir `--max-warnings=0` al comando de eslint (o invocar el script con esa env si está parametrizado).

### Paso 3 — Ejecutar checks

Ejecutar en orden estricto: **tsc → eslint → tests → build → sonar**. Razón:

- tsc primero porque es la dependencia conceptual del resto (tests importan tipos, build necesita tsc, eslint TS parsea types).
- eslint segundo porque es rápido y da feedback de calidad mientras los demás corren.
- tests antes que build porque suele ser más rápido y prioriza señal de comportamiento.
- build cuarto porque valida integración end-to-end (bundler, paths, tree-shaking).
- sonar último porque es lento y depende de red.

Por cada check:

1. Imprimir línea de progreso visible al usuario: `▶ Ejecutando <check>: <comando>`.
2. Ejecutar el comando capturando stdout, stderr, código de salida, duración.
3. Parsear la salida según la herramienta (ver [Parseo por herramienta](#parseo-por-herramienta) en Notas).
4. Determinar estado:
   - **OK** — código 0 y 0 errores parseados.
   - **FAIL** — código ≠ 0 o errores parseados > 0.
   - **SKIPPED** — no se ejecutó (configuración o herramienta ausente).
5. **Si el check es `tsc` y el estado es FAIL → STOP**. No ejecutar los demás. Saltar al Paso 4 con los 4 restantes marcados como `— No ejecutado (fail-fast tsc)`.

> No usar `--fix`, `--write`, `--force` ni equivalentes en ninguna herramienta.

### Paso 4 — Construir informe

1. **Calcular veredicto:**
   - **Apto** si los 4 bloqueantes (tsc, eslint sin errors, tests, build) son OK. Sonar puede tener cualquier estado.
   - **No apto** si cualquier bloqueante es FAIL.
   - **Incompleto** si algún bloqueante es SKIPPED por configuración o herramienta ausente (no por fail-fast — eso es No apto).
2. Generar tabla resumen con los 5 checks. Para los no ejecutados por fail-fast, usar `— (no ejecutado)`.
3. Generar sección de detalle **solo** para checks con estado FAIL o SKIPPED bloqueante. Omitir los OK del detalle para no inflar el informe.
4. Truncar errores a los primeros 10 por check, indicando `… y N más` si hay más.
5. Generar "Próximas acciones" priorizando:
   1. Bloqueantes en FAIL en este orden: tsc → tests → build → eslint(errors).
   2. Calidad en WARN: eslint warnings (informativo).
   3. Sonar: solo si tiene findings con severidad mayor o si está SKIPPED por configuración.
   4. Si algún bloqueante quedó SKIPPED por configuración ausente, añadir acción de configurarlo.
6. Si el modificador `guardar-informe` está activo, escribir el informe en `docs/code-review/<YYYYMMDD-HHMMSS>.md` y mencionar la ruta al final del output.

### Paso 5 — Presentar resultado

Devolver el informe completo al usuario. **No** continuar con `git commit`, `git push` ni `git merge` aunque el veredicto sea Apto, salvo que el usuario lo pida explícitamente en una nueva instrucción.

---

## Failure handling

| Situación | Cómo actuar |
|-----------|-------------|
| Falta `package.json` | Parar antes de ejecutar nada. |
| Falta `tsconfig.json` | tsc → SKIPPED. Continuar con eslint, tests, build, sonar. Veredicto final: **Incompleto**. |
| Runner (`npm`/`pnpm`/`yarn`) ausente del PATH | Parar y preguntar al usuario qué runner usa. |
| Script declarado en `package.json` pero binario inexistente | FAIL con código de salida y mensaje. **No** SKIPPED — el proyecto está mal configurado, no ausente. |
| Test runner en `devDependencies` pero sin script ni config | Intentar `npx vitest run` o `npx jest`. Si ambos fallan, SKIPPED. |
| `sonar-scanner` no en PATH y `npx sonar-scanner` falla por no estar instalable | SKIPPED con motivo `sonar-scanner no disponible`. Veredicto **no** se ve afectado (sonar no es bloqueante). |
| Falta `sonar-project.properties` | SKIPPED con motivo `sin sonar-project.properties`. No bloquea veredicto. |
| Errores de red en sonar (servidor inaccesible) | FAIL con motivo de red. No bloquea veredicto. |
| Tiempo de ejecución > 10 min en un check | Continuar pero avisar al usuario: `⚠️ <check> lleva > 10 min, sigue corriendo`. Permitir cancelación. |
| Working tree sucio | No bloquea. Incluir nota en el encabezado del informe: `working tree con N archivos modificados; los checks reflejan el estado actual del filesystem, no el último commit`. |
| `tsc` FAIL | **STOP. Fail-fast.** Marcar los 4 restantes como `— (no ejecutado)`. |

---

## Anti-patterns

Evitar al ejecutar este skill:

- **Corregir el código** que un check reportó como erróneo. El skill audita; no edita.
- **Ejecutar herramientas con `--fix` o `--write`** (eslint, prettier). Es read-only sobre el fuente.
- **Modificar `package.json`** para añadir scripts faltantes. Reportar el fallback usado y dejar al usuario decidir si normaliza.
- **Marcar como SKIPPED un check que falló por error real.** Tsc con errores reales es FAIL, no SKIPPED. SKIPPED solo aplica cuando la herramienta o config genuinamente no existen.
- **Declarar Apto cuando algún bloqueante quedó SKIPPED por configuración ausente.** Esos casos son **Incompleto**.
- **Continuar tras FAIL de tsc.** El fail-fast es deliberado: los demás checks serían ruido.
- **Truncar errores sin avisar.** Si se muestran solo los primeros 10, indicar `… y N más`.
- **Ejecutar los checks en paralelo** salvo petición explícita: muchos comparten cachés (`.tsbuildinfo`, `node_modules/.cache`) y la salida concurrente es ilegible.
- **Asumir el runner**. Detectarlo siempre por el lockfile, no por el sistema del usuario ni por defecto a `npm`.
- **Cambiar de rama, hacer `git stash` o `git clean`** antes de ejecutar. Auditar el estado actual del working tree.
- **Instalar dependencias faltantes** (`npm install eslint`). Reportar SKIPPED y dejar al usuario.
- **Continuar a `git commit`, `git push` o `git merge`** tras un veredicto Apto sin instrucción explícita.
- **Ejecutar el skill en un repo sin `package.json`** (Java/Maven/Python). Parar con mensaje claro.
- **Reformatear el informe** o saltarse secciones del formato definido en Outputs.

---

## Notas

### Parseo por herramienta

Patrones de salida que el skill debe reconocer para extraer conteos y primeros errores:

**tsc**
- Patrón: `<archivo>(<línea>,<columna>): error TS<código>: <mensaje>`
- Conteo: número de líneas que coinciden con `: error TS`.
- Si hay 0 líneas con `error TS` y código de salida 0 → OK.

**eslint**
- Preferir invocar con `--format json` cuando se invoca por fallback (no script). Si se invoca por script y se desconoce el formato, parsear la línea final tipo `X problems (Y errors, Z warnings)`.
- Estado: `error`s > 0 → FAIL. `error`s = 0 y `warning`s > 0 → OK con detalle de warnings.

**tests (Vitest / Jest)**
- Patrón final típico Vitest: `Test Files  X passed (X) | Y failed (Y)` y `Tests  P passed | F failed | S skipped`.
- Patrón final típico Jest: `Tests: P passed, F failed, S skipped, T total`.
- Estado: código 0 → OK. Código ≠ 0 → FAIL con detalle de tests fallidos (primeros 10).

**build**
- Estado por código de salida. Si el build usa `tsc -p tsconfig.build.json`, parsear errores con el mismo patrón de tsc. Si usa Vite/esbuild/Rollup, capturar el bloque final de error (suelen imprimir un resumen).

**sonar-scanner**
- Éxito: código 0 y log final contiene `EXECUTION SUCCESS`.
- Capturar URL del dashboard si aparece en el log (`ANALYSIS SUCCESSFUL, you can find the results at: <url>`). Incluirla en el informe.

### Por qué fail-fast solo en tsc y no en los demás bloqueantes

- **tsc** es el cimiento: si los tipos no compilan, los demás checks importan código roto. Eslint con `@typescript-eslint` puede fallar masivamente por tipos rotos; tests no compilan; build no compila. Continuar produce ruido sin señal nueva.
- **eslint, tests, build** pueden fallar de forma **independiente** y aportan señales distintas: un test fallando no invalida el lint, un lint con errors no invalida la cobertura de tests, un build roto puede coexistir con tipos OK y tests OK (problema solo del bundler/paths). Por eso se ejecutan los cuatro completos para dar un mapa completo en un solo pasaje.

### Por qué eslint cuenta como bloqueante solo si hay errors

Eslint distingue `severity: error` (algo que rompe contrato) y `severity: warning` (mejora opcional). La política por defecto respeta esa distinción: errors bloquean, warnings se reportan como información. Si el equipo del usuario quiere severidad estricta, usar el modificador `incluir-warnings-eslint` (equivalente a `--max-warnings=0`).

### Sobre sonar

Sonar requiere:

- `sonar-project.properties` en la raíz del repo.
- Servidor Sonar accesible (`SONAR_HOST_URL`, por defecto `http://localhost:9000`).
- Token en `SONAR_TOKEN` o `sonar.login` dentro del `.properties`.

Si **falta el .properties** → SKIPPED (configuración no existe).
Si **el .properties existe pero el servidor no responde** → FAIL con motivo de red.

En ningún caso afecta el veredicto: sonar es siempre informativo en este skill.

### Relación con otros skills

- **story-implement** ya ejecuta `lint, typecheck o build del paquete o unidad afectada` por cada TK individual. Este skill amplía esa validación a la batería completa antes del merge final de la US.
- **adr-manage** puede invocarse tras este skill si la revisión de código revela una decisión arquitectónica a documentar (p. ej. desactivar una regla de eslint con justificación, ignorar una clase de warnings de sonar).
- **prompt-validator** no se relaciona: este skill ejecuta comandos, no audita texto.

### Idioma del informe

El informe se devuelve en español por defecto, coherente con el resto de skills del usuario. Si el usuario pide explícitamente el informe en inglés (p. ej. para adjuntar a un PR internacional), traducir los encabezados y veredictos manteniendo los mensajes de error originales de las herramientas en inglés (no traducir lo que devuelve tsc/eslint/etc.).