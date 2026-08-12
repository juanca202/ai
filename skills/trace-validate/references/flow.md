# Flujo paso a paso, ejecución automática y checklist

Referencia detallada del skill `trace-validate`. El `SKILL.md` mantiene el resumen; aquí está el flujo íntegro.

---

## Flujo

### Paso 0 — Comprobar frescura del reporte (idempotencia)

Antes de trabajar, evitar regenerar si nada cambió (ver [Reutilización del reporte](../SKILL.md#reutilización-del-reporte-idempotencia)).

1. Resolver la ubicación del trabajo y su `trace-report.md` (`…/US-XXX-*/trace-report.md`, `…/WI-XXX-*/trace-report.md`, `docs/specs/features/FT-XXX-*/trace-report.md` o, para cualquier otro artefacto, `trace-report.md` junto al artefacto).
2. Si **no existe** → no hay caché; continuar en el Paso 1.
3. Si **existe**, leer su marca de pie `<!-- trace-validate:fingerprint=<hash> · generado=YYYY-MM-DD -->` y calcular el **fingerprint canónico** de la tubería (excluye los artefactos generados; es el mismo de `quality-check`):
   ```bash
   FINGERPRINT=$( { git rev-parse HEAD; \
           git status --porcelain -- ':(exclude,glob)**/trace-report.md' ':(exclude,glob)**/quality-check.md' ':(exclude,glob)**/code-review.md' ':(exclude,glob)**/test-run.json'; \
           git diff HEAD        -- ':(exclude,glob)**/trace-report.md' ':(exclude,glob)**/quality-check.md' ':(exclude,glob)**/code-review.md' ':(exclude,glob)**/test-run.json'; \
         } | git hash-object --stdin )
   ```
   - **`FINGERPRINT` == fingerprint guardado** y el usuario **no** pidió revalidar/forzar → **no regenerar**: devolver el veredicto y el resumen del reporte existente, indicando que no hubo cambios desde `{{generado}}`. No reescribir el archivo ni delegar en `quality-check`. Fin.
   - **Difieren**, no hay fingerprint guardado (reporte antiguo), o el usuario pide revalidar/forzar → continuar el flujo completo (Pasos 1-7).

> Computar el `FINGERPRINT` **una sola vez** y reutilizarlo en el Paso 4 (delegación) y en el Paso 7 (guardado). La delegación en modo `tests-only` **no** modifica código (es no interactiva y no abre ciclo de corrección), así que el valor sigue siendo válido al guardar. Si el código cambiara por cualquier otra vía durante la corrida, recalcularlo antes de guardar.

### Paso 1 — Localizar y leer el trabajo

1. Resolver el tipo y la ubicación del trabajo:
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]/README.md`.
   - **FT:** `docs/specs/features/FT-XXX-[slug]/README.md` (registro de funcionalidad ya implementada —inferida de código legacy o documentada como existente—; su cobertura responde si esa funcionalidad ya existente tiene pruebas).
   - **Cualquier otro artefacto:** la ruta que indique el usuario (buscarla en el repo si solo da un nombre). Si hay varios candidatos o la ruta no es clara, **preguntar**; no adivinar.
2. Leer el documento y extraer **todos los criterios de aceptación** con su texto y su **identificador verbatim** — el formato es el que use el artefacto (`AC-012`, `AC-1`, `1.3`, `R-3`, `CA-07`…). **Nunca normalizarlo**: el identificador debe poder buscarse literalmente en el artefacto y en los TCs. Si algún criterio no tiene identificador, bloquear (ver «Cuándo bloquear» en `SKILL.md`).
3. Si no existe la sección de criterios o no hay criterios explícitos, **parar** y reportar (ver «Cuándo bloquear» en `SKILL.md`). No continuar con supuestos.

### Paso 2 — Inventariar casos de prueba y artefactos de prueba automatizada

1. **Fuente primaria de casos de prueba — la carpeta del artefacto.** `test-define` deja los TCs en `test-cases/` **dentro de la carpeta del artefacto**, con tres insumos que hay que aprovechar antes de recurrir a heurística:
   - **La línea `Casos de prueba:`** que `test-define` añade bajo cada criterio en el propio artefacto: da el mapeo criterio → TCs **ya resuelto por quien escribió los casos**. Tomarla como vínculo autoritativo.
   - **El índice `test-cases/README.md`**: tabla con TC · Perspectiva · Tipo de prueba · Prioridad · Criterio de aceptación. Permite construir el esqueleto de la matriz sin abrir cada TC.
   - **Cada `TC-XXX-{slug}.md`** para el detalle (campo `Criterio de aceptación`, `Tipo de prueba`, `Estado`, `Perspectiva`).

   Si no existe `test-cases/`, o el artefacto no trae la línea `Casos de prueba:`, recurrir a la inferencia desde los tests del repo (ítems 4-5 de este paso) y dejar constancia en Observaciones de que el mapeo es inferido, no declarado.

2. **Filtrar por `Estado` del TC** según la regla de «Estados de cobertura» en `SKILL.md`: `Obsolete` no cuenta como cobertura, `Draft` cuenta como **Parcial**, `Ready` (o sin campo) cuenta pleno. Dejar Observación en los dos primeros casos.

3. **Leer el `Tipo de prueba` de cada TC.** Para cada TC leer su campo **`Tipo de prueba`** del encabezado: declara la **intención de diseño** del caso (el TC se escribe antes de implementar, por eso no existe un valor "Automatizada"). El valor es `Manual` (no se automatiza, requiere ejecución humana por diseño) **o** uno o varios de `Unit` / `Integration` / `API Test` / `Visual Test` / `E2E`, separados por coma. Esa intención es la fuente para decidir la columna `Automática` de la matriz (ver Paso 4): el **estado real** —si ya está automatizada y con qué resultado— lo determina este skill al validar, no el TC. Si el TC no trae el campo, inferir la naturaleza desde los artefactos hallados y dejar constancia en Observaciones. Cuando el campo liste uno o varios tipos concretos (`Unit`, `Integration`, etc.), usarlos como pista del tipo de artefacto esperado al buscar y clasificar; si el artefacto hallado no coincide con ninguno de los tipos listados, anotarlo en Observaciones sin forzar el mapeo.
4. Buscar en el repo los **artefactos de prueba** relacionados y clasificarlos por **tipo**:
   - **unit** — pruebas unitarias (p. ej. `*.test.*`, `*.spec.*`, `*_test.*`, carpetas `__tests__/`, `tests/unit/`).
   - **integración** — pruebas de integración (carpetas/sufijos `integration`, `it`, `*.integration.*`).
   - **e2e** — pruebas end-to-end (carpetas/sufijos `e2e`, `cypress/`, `playwright/`, `*.e2e.*`).

   **Los cinco `Tipo de prueba` del TC no son cinco clases de artefacto.** Correspondencia al clasificar y al buscar la suite que da el resultado:

   | `Tipo de prueba` del TC | Artefacto esperado | Suite de `test-run.json` |
   |-------------------------|--------------------|--------------------------|
   | `Unit` | unit | `unit` |
   | `Integration` | integración | `integration` (o `unit` si el repo no distingue) |
   | `API Test` | integración (prueba de contrato del endpoint) | `integration`, o `unit`/`e2e` según dónde viva en el repo |
   | `Visual Test` | e2e (snapshot/visual regression) o unit según la herramienta | la suite que realmente lo ejecuta |
   | `E2E` | e2e | `e2e` |

   Si el repo ubica una de estas pruebas en otra suite, mandar **dónde está realmente**, no la tabla: registrar la suite efectiva en Observaciones. No dejar un criterio en `Parcial` solo porque su tipo no tenga una suite homónima.

5. Para cada artefacto, registrar su **ruta** y a qué criterio apunta (por vínculo declarado en el TC o, en su defecto, por nombre del test, describe/it o comentarios).

> **Orden de precedencia del mapeo:** (1) la línea `Casos de prueba:` del artefacto; (2) el campo `Criterio de aceptación` de cada TC; (3) el índice `test-cases/README.md`; (4) inferencia desde el contenido y los nombres de los tests. Los tres primeros son declarados; el cuarto se infiere y **no se inventa**: si un test no puede vincularse con certeza a un criterio, dejarlo en Observaciones en lugar de forzar el mapeo.

### Paso 3 — Mapear cobertura criterio a criterio

Para **cada** criterio del trabajo, determinar:

- **Caso(s) de prueba** que lo validan (documentados o derivados de los tests).
- **Artefacto(s)** de prueba que lo cubren, con su tipo (unit / integración / e2e / manual). Un TC `API Test` o `Visual Test` se registra con el tipo del artefacto que realmente lo implementa (ver la tabla de correspondencia del Paso 2), anotando el tipo declarado en Observaciones.
- **Estado de cobertura** según la tabla de «Estados de cobertura» en `SKILL.md`.
- **Observaciones** si hace falta aclaración (cobertura parcial, ambigüedad, supuesto a confirmar, solo manual, etc.).

### Paso 4 — Obtener resultados de pruebas (delegando en quality-check)

`trace-validate` **no ejecuta la suite**. Obtiene los resultados de `quality-check` (única autoridad de
ejecución) y los mapea a los criterios.

1. **Reusar el `FINGERPRINT` canónico** ya calculado en el Paso 0 (mismo valor; la delegación `tests-only` no altera el código, así que no hay que recalcularlo).
2. **Buscar la caché** en la ubicación fija `docs/specs/test-run.json` (no por unidad; es la corrida completa de la rama):
   - **Existe y `git.fingerprint` coincide** → caché **fresca** (sin cambios desde la corrida de
     `quality-check`): **reutilizar** sus `suites[]` sin ejecutar. Registrar la procedencia en Observaciones.
   - **No existe o el fingerprint difiere** → **delegar en `quality-check` modo `tests-only`**, que ejecuta
     solo los checks de pruebas, escribe/actualiza `test-run.json` y devuelve los resultados; luego
     consumir esa caché fresca.
3. **Mapear a la matriz.** La columna `Automática` combina la intención del TC (Paso 2) con lo hallado; el
   **resultado** viene de las `suites[]` de `test-run.json` (`PASS`→`Paso`, `FAIL`→`Fallo`,
   `SKIPPED`→`No ejecutado`, `N/A` (el repo no tiene esa suite)→`No ejecutado` con Observación):
   - TC `Manual` → `Automática = N/A` (manual por diseño; no se espera artefacto automatizado).
   - TC con uno o varios tipos (`Unit`/`Integration`/`API Test`/`Visual Test`/`E2E`) **sin** artefacto todavía → `Automática = No` (pendiente de automatizar; distinguirlo del manual en Observaciones).
   - TC con uno o varios tipos **con** artefacto automatizado → `Automática = Sí` si `quality-check` lo ejecutó (registrar `Resultado` de la suite correspondiente); `No` si existe pero no se pudo ejecutar (con la razón en Observaciones).
   - **Granularidad suite vs. criterio:** `result` es por **suite completa** (p. ej. toda la suite `unit`), no por test individual. Cuando **varios criterios** mapean a tests dentro de la **misma suite** y esa suite da `FAIL`, no propagar automáticamente `Fallo`/`No cubierto` a todos ellos por igual: revisar si el `summary` (u otro detalle que `quality-check` haya incluido) identifica qué test(s) específico(s) fallaron y cotejarlo contra el archivo/nombre de test que el Paso 2 vinculó a cada criterio. Si se puede aislar, marcar `Fallo`/`No cubierto` solo en el/los criterio(s) cuyo test efectivamente falló; el resto de la suite se reporta `Paso`. Si el `summary` **no** trae detalle por test (solo un conteo agregado, p. ej. `"47 passed, 1 failed"` sin decir cuál), no asumir cuál criterio es el afectado: marcar esos criterios como `Parcial` (no `No cubierto`) con una Observación explicando que la suite falló pero no se pudo aislar el test específico, y sugerir revisar el log completo de `quality-check` o re-ejecutar el test de forma aislada.
4. **Si `quality-check` no puede ejecutarlas** (stack no detectable, entorno sin poder correr, dependencias
   faltantes, `quality-check` no disponible en la sesión, o el usuario declina la delegación), registrar ejecución automática
   = `No` con la razón en Observaciones y entregar igualmente la cobertura estática. **No** fabricar
   resultados ni reintroducir un runner propio en `trace-validate`.

> Nunca reportar `Paso`/`Fallo` sin que la prueba se haya ejecutado realmente (en la corrida de
> `quality-check` reflejada en `test-run.json`). Si no se ejecutó, el resultado es `No ejecutado`.

### Paso 5 — Construir la matriz de trazabilidad

Usar la plantilla `assets/trace-report-template.md` (leerla antes de redactar). Sustituir cada `{{…}}` por datos verificables; el reporte publicado no debe conservar placeholders ni el bloque de comentario inicial (pero **sí** conserva la marca de pie con el fingerprint, ver Paso 7). La matriz tiene una fila por cada criterio del trabajo con: criterio, descripción, casos de prueba, artefactos (con tipo), estado, ejecución automática, resultado y observaciones. Incluir además el resumen de artefactos de prueba automatizada disponibles (unit / integración / e2e).

### Paso 6 — Emitir el veredicto

Aplicar la tabla de «Veredicto» (en `SKILL.md`) sobre el conjunto de criterios. El veredicto responde la pregunta central: **¿todos los criterios de aceptación quedan cubiertos?**

### Paso 7 — Entregar y guardar el reporte

1. Guardar el reporte (sobrescribir si ya existe, salvo que el usuario pida conservar histórico):
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]/trace-report.md` (dentro de la carpeta del WI).
   - **FT:** `docs/specs/features/FT-XXX-[slug]/trace-report.md` (dentro de la carpeta del feature).
   - **Cualquier otro artefacto:** `trace-report.md` **junto al artefacto** (en su carpeta, o al lado del archivo si es suelto). Confirmar la ruta con el usuario antes de escribir; si el artefacto es de solo lectura o externo al repo, no escribir y entregar el reporte en el chat.
2. **Grabar el fingerprint** para la próxima comprobación de frescura (Paso 0): escribir al pie del reporte
   la marca `<!-- trace-validate:fingerprint=<FINGERPRINT> · generado=YYYY-MM-DD -->` con el `FINGERPRINT` vigente
   (Paso 0 / Paso 4). Esta marca se **conserva** en el documento publicado.
3. Presentar al usuario el **veredicto** y el reporte. No modificar ningún otro artefacto del repo.

---

## Ejecución de pruebas: delegación en quality-check

`trace-validate` **no detecta runners ni ejecuta pruebas**. La ejecución la realiza `quality-check`, que
persiste el resultado en `docs/specs/test-run.json` (esquema `test-run/v1`; ubicación fija, no por unidad).
`trace-validate` solo **consume** ese artefacto.

**Fuente de resultados (orden):**

1. **Caché fresca** — `test-run.json` cuyo `git.fingerprint` coincide con el `FINGERPRINT` canónico (Paso 0) **y** cuyo `generatedBy` es `quality-check` (si no lo es, descartarla). Se
   reutiliza tal cual: es el caso «no hubo cambios desde la última corrida de pruebas».
2. **Delegación `tests-only`** — si no hay caché o está obsoleta, invocar `quality-check` en modo
   `tests-only`; genera/actualiza `test-run.json` y trace-validate lo consume.
3. **No ejecutable** — si `quality-check` no puede correr (sin stack, entorno sin red/dependencias, skill no
   disponible) o el usuario declina la delegación: ejecución automática = `No` con la razón; entregar la
   cobertura estática.

**Esquema `test-run.json`.** La definición canónica —campos, semántica y valores permitidos— vive en
[`quality-check` → Caché de corrida de pruebas](../../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate).
**No** se replica aquí para que no diverja. Lo que este skill necesita de ella:

- `generatedBy` debe ser `"quality-check"`; cualquier otro valor → descartar la caché.
- `git.fingerprint` es la única clave de frescura.
- `suites[]` trae **siempre las cuatro** entradas (`unit`, `coverage`, `integration`, `e2e`); las que el repo no tiene vienen con `result: "N/A"`.
- `invokedFrom` es informativo: **no** filtrar resultados por él ni descartar la caché porque nombre otro trabajo — la corrida es de la rama, no de la unidad.

Reglas:

- Registrar en el reporte el **comando** y el **resultado global** tomados de `test-run.json` (no volver a
  ejecutar), y la **procedencia** (caché fresca del commit X, o corrida `tests-only` disparada ahora).
- `result` por suite → resultado del criterio: `PASS`→`Paso`, `FAIL`→`Fallo`, `SKIPPED`/no ejecutado→`No ejecutado`. **Excepción:** cuando varios criterios comparten suite y esta da `FAIL`, no basta con propagar `Fallo` a todos — ver «Granularidad suite vs. criterio» en el Paso 4 más arriba; si no se puede aislar el test que falló, el criterio va como `Parcial`, no `Fallo`/`No cubierto`.
- Para criterios cubiertos por TCs marcados `Manual` (manual por diseño), ejecución automática = `N/A`. No confundir con TCs con `Tipo de prueba` (`Unit`/`Integration`/`API Test`/`Visual Test`/`E2E`) aún sin artefacto, que van como `No` (pendiente de automatizar).
- Si `workingTreeClean` es `false` en la caché, anotarlo como caveat (resultado sobre un árbol sucio).

---

## Checklist

- [ ] Frescura comprobada (Paso 0): si el fingerprint coincide con el del `trace-report.md` existente y no se fuerza revalidación, se devolvió el reporte sin regenerar
- [ ] Idioma resuelto (preferencia del usuario en la sesión, o idioma de la conversación)
- [ ] Tipo de trabajo determinado y documento de criterios leído; criterios extraídos con su identificador **verbatim**, sin normalizar
- [ ] Casos de prueba y artefactos (unit / integración / e2e) inventariados con su ruta y criterio
- [ ] Cada criterio con estado (Cubierto / Parcial / No cubierto) y observaciones cuando aplica
- [ ] Resultados de pruebas obtenidos de `quality-check` (caché fresca `test-run.json` o delegación `tests-only`); comando, resultado y procedencia registrados; sin ejecutar la suite en `trace-validate` ni inventar resultados
- [ ] Matriz construida desde `assets/trace-report-template.md`
- [ ] Resumen de artefactos de prueba automatizada incluido
- [ ] Veredicto emitido respondiendo si **todos** los criterios quedan cubiertos
- [ ] `trace-report.md` guardado en la ubicación del tipo con la marca de pie del fingerprint; ningún otro artefacto modificado
