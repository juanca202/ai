# Flujo paso a paso, ejecución automática y checklist

Referencia detallada del skill `trace-validate`. El `SKILL.md` mantiene el resumen; aquí está el flujo íntegro.

---

## Flujo

### Paso 0 — Comprobar frescura del reporte (idempotencia)

Antes de trabajar, evitar regenerar si nada cambió (ver [Reutilización del reporte](../SKILL.md) en `SKILL.md`).

1. Resolver la ubicación del trabajo y su `trace-report.md` (`…/US-XXX-*/trace-report.md`, `…/WI-XXX-*/trace-report.md` o `docs/features/FEAT-XXX-*/trace-report.md`).
2. Si **no existe** → no hay caché; continuar en el Paso 1.
3. Si **existe**, leer su marca de pie `<!-- trace-validate:fingerprint=<hash> · generado=YYYY-MM-DD -->` y calcular el **fingerprint canónico** de la tubería (excluye los tres artefactos generados; es el mismo de `code-review`):
   ```bash
   FP=$( { git rev-parse HEAD; \
           git status --porcelain -- ':(exclude,glob)**/trace-report.md' ':(exclude,glob)**/code-review.md' ':(exclude,glob)**/test-run.json'; \
           git diff HEAD        -- ':(exclude,glob)**/trace-report.md' ':(exclude,glob)**/code-review.md' ':(exclude,glob)**/test-run.json'; \
         } | git hash-object --stdin )
   ```
   - **`FP` == fingerprint guardado** y el usuario **no** pidió revalidar/forzar → **no regenerar**: devolver el veredicto y el resumen del reporte existente, indicando que no hubo cambios desde `{{generado}}`. No reescribir el archivo ni delegar en `code-review`. Fin.
   - **Difieren**, no hay fingerprint guardado (reporte antiguo), o el usuario pide revalidar/forzar → continuar el flujo completo (Pasos 1-7).

> Es válido computar `FP` una sola vez y reutilizarlo en el Paso 4 (delegación) y en el Paso 7 (guardado).

### Paso 1 — Localizar y leer el trabajo

1. Resolver el tipo y la ubicación del trabajo:
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]/README.md`.
   - **FEAT:** `docs/features/FEAT-XXX-[slug]/README.md` (registro de funcionalidad ya implementada —inferida de código legacy o documentada como existente—; su cobertura responde si esa funcionalidad ya existente tiene pruebas).
2. Leer el documento y extraer **todos los criterios de aceptación** con su texto, usando los códigos del tipo (`AC-XXX` para US, WI y FEAT). Si el artefacto usa otro formato de código (`AC-1`, `CA-1`, `BR-01`…), normalizarlo a `AC-XXX` al referenciarlo en el reporte.
3. Si no existe la sección de criterios o no hay criterios explícitos, **parar** y reportar (ver «Cuándo bloquear» en `SKILL.md`). No continuar con supuestos.

### Paso 2 — Inventariar casos de prueba y artefactos de prueba automatizada

1. Recopilar los **casos de prueba** documentados del proyecto que apliquen al trabajo, si existen. Para cada TC leer su campo **`Automatización`** (`Manual` / `Automatizable`) del encabezado: declara la **intención de diseño** del caso (el TC se escribe antes de implementar, por eso no existe un valor "Automatizada"). Esa intención es la fuente para decidir la columna `Automática` de la matriz (ver Paso 4): el **estado real** —si ya está automatizada y con qué resultado— lo determina este skill al validar, no el TC. Si el TC no trae el campo, inferir la naturaleza desde los artefactos hallados y dejar constancia en Observaciones. Si la etiqueta trae entre paréntesis un **tipo de prueba sugerido** (`Unit` / `Integration` / `E2E` / `API Test` / `Visual Test`), usarlo como pista del tipo de artefacto esperado al buscar y clasificar; si el artefacto hallado no coincide con el tipo sugerido, anotarlo en Observaciones sin forzar el mapeo.
2. Buscar en el repo los **artefactos de prueba** relacionados y clasificarlos por **tipo**:
   - **unit** — pruebas unitarias (p. ej. `*.test.*`, `*.spec.*`, `*_test.*`, carpetas `__tests__/`, `tests/unit/`).
   - **integración** — pruebas de integración (carpetas/sufijos `integration`, `it`, `*.integration.*`).
   - **e2e** — pruebas end-to-end (carpetas/sufijos `e2e`, `cypress/`, `playwright/`, `*.e2e.*`).
3. Para cada artefacto, registrar su **ruta** y a qué criterio apunta (por nombre del test, describe/it, comentarios o vínculo explícito al criterio).

> El mapeo se infiere del contenido y nombres de los tests, no se inventa. Si un test no puede vincularse con certeza a un criterio, dejarlo en Observaciones en lugar de forzar el mapeo.

### Paso 3 — Mapear cobertura criterio a criterio

Para **cada** criterio del trabajo, determinar:

- **Caso(s) de prueba** que lo validan (documentados o derivados de los tests).
- **Artefacto(s)** de prueba que lo cubren, con su tipo (unit / integración / e2e / manual).
- **Estado de cobertura** según la tabla de «Estados de cobertura» en `SKILL.md`.
- **Observaciones** si hace falta aclaración (cobertura parcial, ambigüedad, supuesto a confirmar, solo manual, etc.).

### Paso 4 — Obtener resultados de pruebas (delegando en code-review)

`trace-validate` **no ejecuta la suite**. Obtiene los resultados de `code-review` (única autoridad de
ejecución) y los mapea a los criterios.

1. **Reusar el `FP` canónico** ya calculado en el Paso 0 (mismo valor; no recalcular).
2. **Buscar la caché** en la ubicación fija `docs/specs/test-run.json` (no por unidad; es la corrida completa de la rama):
   - **Existe y `git.fingerprint` coincide** → caché **fresca** (sin cambios desde la corrida de
     `code-review`): **reutilizar** sus `suites[]` sin ejecutar. Registrar la procedencia en Observaciones.
   - **No existe o el fingerprint difiere** → **delegar en `code-review` modo `tests-only`**, que ejecuta
     solo los checks de pruebas, escribe/actualiza `test-run.json` y devuelve los resultados; luego
     consumir esa caché fresca.
3. **Mapear a la matriz.** La columna `Automática` combina la intención del TC (Paso 2) con lo hallado; el
   **resultado** viene de las `suites[]` de `test-run.json` (`PASS`→`Paso`, `FAIL`→`Fallo`,
   `SKIPPED`/no ejecutado→`No ejecutado`):
   - TC `Manual` → `Automática = N/A` (manual por diseño; no se espera artefacto automatizado).
   - TC `Automatizable` **sin** artefacto todavía → `Automática = No` (pendiente de automatizar; distinguirlo del manual en Observaciones).
   - TC `Automatizable` **con** artefacto automatizado → `Automática = Sí` si `code-review` lo ejecutó (registrar `Resultado` de la suite correspondiente); `No` si existe pero no se pudo ejecutar (con la razón en Observaciones).
4. **Si `code-review` no puede ejecutarlas** (stack no detectable, entorno sin poder correr, dependencias
   faltantes, usuario declina, o `code-review` no disponible en la sesión), registrar ejecución automática
   = `No` con la razón en Observaciones y entregar igualmente la cobertura estática. **No** fabricar
   resultados ni reintroducir un runner propio en `trace-validate`.

> Nunca reportar `Paso`/`Fallo` sin que la prueba se haya ejecutado realmente (en la corrida de
> `code-review` reflejada en `test-run.json`). Si no se ejecutó, el resultado es `No ejecutado`.

### Paso 5 — Construir la matriz de trazabilidad

Usar la plantilla `assets/trace-report-template.md` (leerla antes de redactar). Sustituir cada `{{…}}` por datos verificables; el reporte publicado no debe conservar placeholders ni el bloque de comentario inicial (pero **sí** conserva la marca de pie con el fingerprint, ver Paso 7). La matriz tiene una fila por cada criterio del trabajo con: criterio, descripción, casos de prueba, artefactos (con tipo), estado, ejecución automática, resultado y observaciones. Incluir además el resumen de artefactos de prueba automatizada disponibles (unit / integración / e2e).

### Paso 6 — Emitir el veredicto

Aplicar la tabla de «Veredicto» (en `SKILL.md`) sobre el conjunto de criterios. El veredicto responde la pregunta central: **¿todos los criterios de aceptación quedan cubiertos?**

### Paso 7 — Entregar y guardar el reporte

1. Guardar el reporte (sobrescribir si ya existe, salvo que el usuario pida conservar histórico):
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]/trace-report.md` (dentro de la carpeta del WI).
   - **FEAT:** `docs/features/FEAT-XXX-[slug]/trace-report.md` (dentro de la carpeta del feature).
2. **Grabar el fingerprint** para la próxima comprobación de frescura (Paso 0): escribir al pie del reporte
   la marca `<!-- trace-validate:fingerprint=<FP> · generado=YYYY-MM-DD -->` con el `FP` calculado
   (Paso 0 / Paso 4). Esta marca se **conserva** en el documento publicado.
3. Presentar al usuario el **veredicto** y el reporte. No modificar ningún otro artefacto del repo.

---

## Ejecución de pruebas: delegación en code-review

`trace-validate` **no detecta runners ni ejecuta pruebas**. La ejecución la realiza `code-review`, que
persiste el resultado en `docs/specs/test-run.json` (esquema `test-run/v1`; ubicación fija, no por unidad).
`trace-validate` solo **consume** ese artefacto.

**Fuente de resultados (orden):**

1. **Caché fresca** — `test-run.json` cuyo `git.fingerprint` coincide con el `FP` canónico (Paso 0). Se
   reutiliza tal cual: es el caso «no hubo cambios desde la última corrida de pruebas».
2. **Delegación `tests-only`** — si no hay caché o está obsoleta, invocar `code-review` en modo
   `tests-only`; genera/actualiza `test-run.json` y trace-validate lo consume.
3. **No ejecutable** — si `code-review` no puede correr (sin stack, entorno sin red/dependencias, usuario
   declina, o skill no disponible): ejecución automática = `No` con la razón; entregar la cobertura estática.

**Esquema `test-run.json` que se consume** (lo escribe `code-review`):

```json
{
  "schema": "test-run/v1",
  "git": { "commit": "abc1234", "workingTreeClean": true, "fingerprint": "<hash>" },
  "suites": [ { "type": "unit", "command": "npm test", "result": "PASS", "summary": "48 passed" } ]
}
```

Reglas:

- Registrar en el reporte el **comando** y el **resultado global** tomados de `test-run.json` (no volver a
  ejecutar), y la **procedencia** (caché fresca del commit X, o corrida `tests-only` disparada ahora).
- `result` por suite → resultado del criterio: `PASS`→`Paso`, `FAIL`→`Fallo`, `SKIPPED`/no ejecutado→`No ejecutado`.
- Para criterios cubiertos por TCs marcados `Manual` (manual por diseño), ejecución automática = `N/A`. No confundir con TCs `Automatizable` aún sin artefacto, que van como `No` (pendiente de automatizar).
- Si `workingTreeClean` es `false` en la caché, anotarlo como caveat (resultado sobre un árbol sucio).

---

## Checklist

- [ ] Frescura comprobada (Paso 0): si el fingerprint coincide con el del `trace-report.md` existente y no se fuerza revalidación, se devolvió el reporte sin regenerar
- [ ] Idioma resuelto (preferencia del usuario en la sesión, o idioma de la conversación)
- [ ] Tipo de trabajo determinado y documento de criterios leído; criterios extraídos con los códigos del tipo, normalizados a `AC-XXX` (US/WI/FEAT)
- [ ] Casos de prueba y artefactos (unit / integración / e2e) inventariados con su ruta y criterio
- [ ] Cada criterio con estado (Cubierto / Parcial / No cubierto) y observaciones cuando aplica
- [ ] Resultados de pruebas obtenidos de `code-review` (caché fresca `test-run.json` o delegación `tests-only`); comando, resultado y procedencia registrados; sin ejecutar la suite en `trace-validate` ni inventar resultados
- [ ] Matriz construida desde `assets/trace-report-template.md`
- [ ] Resumen de artefactos de prueba automatizada incluido
- [ ] Veredicto emitido respondiendo si **todos** los criterios quedan cubiertos
- [ ] `trace-report.md` guardado en la ubicación del tipo con la marca de pie del fingerprint; ningún otro artefacto modificado
