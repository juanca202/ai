# Flujo paso a paso, delegación de la ejecución y checklist

Referencia detallada del skill `trace-validate`. El `SKILL.md` mantiene el resumen; aquí está el flujo íntegro.

---

## Flujo

### Paso 0 — Comprobar frescura del reporte (idempotencia)

Antes de trabajar, evitar regenerar si nada cambió (ver [Reutilización del reporte](../SKILL.md#reutilización-del-reporte-idempotencia)).

1. Resolver la ubicación del trabajo, su carpeta (`$ARTEFACTO`) y su `trace-report.md` (`…/US-XXX-*/trace-report.md`, `…/WI-XXX-*/trace-report.md`, `docs/specs/features/FT-XXX-*/trace-report.md` o, para cualquier otro artefacto, `trace-report.md` junto al artefacto).
2. **Calcular las dos claves. Siempre**, exista o no reporte previo: el Paso 7 las necesita para grabar la marca de pie, también en la primera validación.
   ```bash
   ROOT=$( git rev-parse --show-toplevel )
   EXC=( ':(top,exclude,glob)**/.*/**' ':(top,exclude,glob)**/docs/**' ':(top,exclude,glob)**/trace-report.md' )
   FINGERPRINT=$( { git -C "$ROOT" ls-files -s              -- "${EXC[@]}"; \
                    git -C "$ROOT" status --porcelain -uall -- "${EXC[@]}"; \
                    git -C "$ROOT" diff                     -- "${EXC[@]}"; \
                  } | git hash-object --stdin )
   SPEC_FINGERPRINT=$( { git -C "$ROOT" ls-files -s              -- "$ARTEFACTO"; \
                         git -C "$ROOT" status --porcelain -uall -- "$ARTEFACTO"; \
                         git -C "$ROOT" diff                     -- "$ARTEFACTO"; \
                       } | git hash-object --stdin )
   ```
   El primero cubre **código y tests** (excluye toda carpeta oculta, cualquier `docs/` y los `trace-report.md`; es el mismo de `quality-check` y `code-review`). El segundo cubre **los criterios y los `TC-XXX`** de este artefacto, que el primero deja fuera por vivir bajo `docs/specs/`.
3. Si el `trace-report.md` **no existe** → no hay caché; continuar en el Paso 1.
4. Si **existe**, leer su marca de pie `<!-- trace-validate:fingerprint=<hash> · spec=<hash> · generado=YYYY-MM-DD -->` y decidir:
   - **Coinciden los dos hashes**, el reporte **no** registra ejecución fallida, y el usuario **no** pasó `revalidate` → **no regenerar**: devolver el veredicto y el resumen del reporte existente, indicando que no hubo cambios desde `{{generado}}`. No reescribir el archivo ni delegar en `quality-check`. Fin.
   - **Difiere alguno**, falta la marca o el campo `spec=` (reporte anterior a esta convención), el reporte trae filas en `No ejecutado` por una delegación que no se pudo hacer, o el usuario pide `revalidate` → continuar el flujo completo (Pasos 1-7).

> Computar ambos hashes **una sola vez**: el `FINGERPRINT` se reutiliza en el Paso 4 (delegación) y los dos en el Paso 7 (guardado). La delegación en modo `tests-only` no abre ciclo de corrección, pero **sí** puede normalizar el `.gitignore` la primera vez que corre en un repo (ver `quality-check`, Paso 1), y eso mueve el `FINGERPRINT`. Por eso: **si se delegó, recalcularlo antes de guardar**; el `SPEC_FINGERPRINT` no se ve afectado.

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
   - **El índice `test-cases/README.md`**: tabla con TC · Perspectiva · Tipo de prueba · **Estado** · Prioridad · Criterio de aceptación. Permite construir el esqueleto de la matriz sin abrir cada TC.
   - **Cada `TC-XXX-{slug}.md`** para el detalle (campo `Criterio de aceptación`, `Tipo de prueba`, `Estado`, `Perspectiva`).

   Si no existe `test-cases/`, o el artefacto no trae la línea `Casos de prueba:`, recurrir a la inferencia desde los tests del repo (ítems 4-5 de este paso) y dejar constancia en Observaciones de que el mapeo es inferido, no declarado.

2. **Filtrar por `Estado` del TC** —leyéndolo de la columna `Estado` del índice; solo abrir cada `TC-XXX-*.md` si el índice no la trae— según la regla de «Estados de cobertura» en `SKILL.md`: `Obsolete` no cuenta como cobertura, `Draft` cuenta como **Parcial**, `Ready` (o sin campo) cuenta pleno. Dejar Observación en los dos primeros casos.

3. **Leer el `Tipo de prueba` de cada TC.** Para cada TC leer su campo **`Tipo de prueba`** del encabezado: declara la **intención de diseño** del caso (el TC se escribe antes de implementar, por eso no existe un valor "Automatizada"). El valor es `Manual` (no se automatiza, requiere ejecución humana por diseño) **o** uno o varios de `Unit` / `Integration` / `API Test` / `Visual Test` / `E2E`, separados por coma. **Cada tipo declarado genera una fila de la matriz** (columna `Tipo`, ver Paso 3): la declaración fija *qué debería existir*; el **estado real** —si ya está automatizada (`Evidencia`) y con qué resultado (`Ejecución`/`Resultado`, Paso 4)— lo determina este skill al validar, no el TC. Si el TC no trae el campo, inferir la naturaleza desde los artefactos hallados y dejar constancia en Observaciones. Cuando el campo liste uno o varios tipos concretos (`Unit`, `Integration`, etc.), usarlos como pista del tipo de artefacto esperado al buscar y clasificar; si el artefacto hallado no coincide con ninguno de los tipos listados, anotarlo en Observaciones sin forzar el mapeo.
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

> **Orden de precedencia del mapeo:** (1) la línea `Casos de prueba:` del artefacto; (2) el campo `Criterio de aceptación` de cada TC; (3) el índice `test-cases/README.md`; (4) inferencia desde el contenido y los nombres de los tests. Los tres primeros son declarados; el cuarto se infiere y **no se inventa**: si un test no puede vincularse con certeza a un criterio, dejarlo en «Observaciones y pendientes» en lugar de forzar el mapeo.

### Paso 3 — Mapear cobertura criterio a criterio

El mapeo se hace **por fila de la matriz**, no por criterio: la unidad es la combinación **criterio × TC × tipo de prueba declarado** (ver [Vistas del reporte](../SKILL.md#vistas-del-reporte-cobertura-por-criterio-y-matriz)).

1. **Expandir cada criterio en sus filas.** Para cada criterio, listar sus TCs; para cada TC, **una fila por cada tipo declarado** en su campo `Tipo de prueba`. Un TC que declara `Unit, E2E` produce dos filas. Si el criterio **no tiene TC documentado** pero el fallback del Paso 2 halló un test que lo cubre, la fila se escribe con `TC = —` y el **tipo del artefacto hallado** (Observación: mapeo inferido). Solo el criterio sin TC **y** sin artefacto produce la fila vacía `— | — | — | — | No cubierto`.
2. **Rellenar `Evidencia` fila a fila.** Buscar el artefacto que materializa *ese tipo concreto* para *ese TC*: ruta del test automatizado, o la ruta del propio `TC-XXX-{slug}.md` en las filas `Manual`. Si ese tipo declarado no tiene artefacto en el repo, `Evidencia = —` (y la fila irá a `No cubierto` en el Paso 4). Un TC `API Test` o `Visual Test` se registra con la ruta del artefacto que realmente lo implementa (ver la tabla de correspondencia del Paso 2), anotando el tipo declarado en Observaciones.
3. **Derivar el `Estado` del criterio** para la tabla de cobertura, a partir del conjunto de sus filas, según «Estados de cobertura» y la tabla de derivación en `SKILL.md`. Regla clave: **basta una fila en `No cubierto` para que el criterio deje de ser `Cubierto`** — un TC con `Unit, E2E` del que solo existe el unitario deja el criterio en `Parcial`.
4. **Observaciones** si hace falta aclaración (tipo declarado sin automatizar, ambigüedad, supuesto a confirmar, TC en `Draft`/`Obsolete`, suite efectiva distinta de la esperada, etc.). Las Observaciones viven en la tabla de **cobertura por criterio**, no en la matriz — así la matriz se mantiene legible.

> No forzar filas: si un test no puede vincularse con certeza a un criterio, no inventar la fila; dejarlo en «Observaciones y pendientes» (ver el orden de precedencia del Paso 2).

### Paso 4 — Obtener resultados de pruebas (delegando en quality-check)

`trace-validate` **no ejecuta la suite**. Obtiene los resultados de `quality-check` (única autoridad de
ejecución) y los mapea a los criterios.

1. **Reusar el `FINGERPRINT` canónico** ya calculado en el Paso 0.
2. **Buscar la caché** en la ubicación fija `.sdd-devkit/test-run.json` (no por unidad; es la corrida completa de la rama):
   - **Existe y `git.fingerprint` coincide** → caché **fresca** (sin cambios desde la corrida de
     `quality-check`): **reutilizar** sus `suites[]` sin ejecutar. Registrar la procedencia en la prosa del Resumen.
   - **No existe o el fingerprint difiere** → **delegar en `quality-check` modo `tests-only`**, que ejecuta
     solo los checks de pruebas, escribe/actualiza `test-run.json` y devuelve los resultados; luego
     consumir esa caché fresca.
3. **Rellenar `Ejecución` y `Resultado` en cada fila** de la matriz construida en el Paso 3. El resultado
   viene de las `suites[]` de `test-run.json` (`PASS`→`Paso`, `FAIL`→`Fallo`, `SKIPPED`→`No ejecutado`,
   `N/A` (el repo no tiene esa suite)→`No ejecutado`, con la constancia en «Observaciones y pendientes»):

   | Situación de la fila | Evidencia | Ejecución | Resultado |
   |----------------------|-----------|-----------|-----------|
   | Fila `Manual` (manual por diseño) | ruta del TC | `Manual` | `N/A` |
   | Tipo declarado **sin** artefacto (pendiente de automatizar) | `—` | `—` | `No cubierto` |
   | Artefacto hallado y su suite dio `PASS` | ruta | `quality-check` | `Paso` |
   | Artefacto hallado y su test dio `FAIL` (aislable) | ruta | `quality-check` | `Fallo` |
   | Artefacto hallado, suite en `FAIL` **sin** poder aislar el test | ruta | `quality-check` | `Fallo` (Observación «no aislable» → criterio `Parcial`) |
   | Artefacto hallado, suite `SKIPPED`/ausente/no ejecutable | ruta | `—` | `No ejecutado` (razón en «Observaciones y pendientes») |

   `Ejecución` identifica **quién** produjo el resultado (`quality-check` / `Manual` / `—`), no la clase de
   prueba: eso ya lo dicen `Tipo` y `Evidencia`. **No** anotar la suite entre paréntesis. Si la suite efectiva
   que corrió el test no coincide con el tipo declarado (un `API Test` que vive en `unit`), decirlo en
   Observaciones.

   - **Granularidad suite vs. criterio:** `result` es por **suite completa** (p. ej. toda la suite `unit`), no por test individual. Cuando **varios criterios** mapean a tests dentro de la **misma suite** y esa suite da `FAIL`, no propagar automáticamente `Fallo`/`No cubierto` a todos ellos por igual: revisar si el `summary` (u otro detalle que `quality-check` haya incluido) identifica qué test(s) específico(s) fallaron y cotejarlo contra el archivo/nombre de test que el Paso 2 vinculó a cada criterio. Si se puede aislar, marcar `Fallo`/`No cubierto` solo en el/los criterio(s) cuyo test efectivamente falló; el resto de la suite se reporta `Paso`. Si el `summary` **no** trae detalle por test (solo un conteo agregado, p. ej. `"47 passed, 1 failed"` sin decir cuál), no asumir cuál criterio es el afectado: marcar esos criterios como `Parcial` (no `No cubierto`) con una Observación explicando que la suite falló pero no se pudo aislar el test específico, y sugerir revisar el log completo de `quality-check` o re-ejecutar el test de forma aislada.
4. **Si `quality-check` no puede ejecutarlas** (stack no detectable, entorno sin poder correr, dependencias
   faltantes, `quality-check` no disponible en la sesión, o el usuario declina la delegación), dejar las filas con
   artefacto en `Ejecución = —` y `Resultado = No ejecutado`, con la razón en «Observaciones y pendientes», y entregar
   igualmente la cobertura estática (las filas sin artefacto siguen siendo `No cubierto`: ese hueco no
   depende de la ejecución). **No** fabricar resultados ni reintroducir un runner propio en `trace-validate`.

> Nunca reportar `Paso`/`Fallo` sin que la prueba se haya ejecutado realmente (en la corrida de
> `quality-check` reflejada en `test-run.json`). Si no se ejecutó, el resultado es `No ejecutado`.

### Paso 5 — Redactar el reporte

Usar la plantilla `assets/trace-report-template.md` (leerla antes de redactar). Sustituir cada `{{…}}` por datos verificables; el reporte publicado no debe conservar placeholders ni **ninguno** de los bloques de comentario de instrucciones (pero **sí** conserva la marca de pie con el fingerprint, ver Paso 7).

La plantilla tiene cinco partes más la marca de pie del fingerprint (Paso 7). Ninguna es opcional salvo «Observaciones y pendientes»:

| Parte | Contenido |
|-------|-----------|
| **Cabecera** | `Fecha` (fecha y hora de la corrida), `Rama` y `Commit` (`git rev-parse --abbrev-ref HEAD` y `git rev-parse --short HEAD`, capturados al redactar; son metadata del reporte y **no** entran en ninguna de las dos claves), `Trabajo` (enlace relativo al artefacto) y `Veredicto` (Paso 6) |
| **Resumen** | 1-3 frases de estado + la línea **Pruebas**: procedencia (caché fresca de `quality-check` del commit X, corrida `tests-only` disparada ahora, o el motivo de no haberlos podido ejecutar) y el `result` **por suite** tomado de `test-run.json` + la tabla de indicadores |
| **Cobertura por criterio** | Tabla 1 |
| **Matriz de trazabilidad** | Tabla 2 |
| **Observaciones y pendientes** | Caveats **globales** de la corrida (ver abajo). **Omitir la sección entera** si no hay ninguno |

Las **dos tablas** (definición completa en [Vistas del reporte](../SKILL.md#vistas-del-reporte-cobertura-por-criterio-y-matriz)):

1. **Cobertura por criterio** — una fila por criterio: `Criterio · Descripción · Estado · Observaciones`. Es la vista de veredicto.
2. **Matriz de trazabilidad** — una fila por criterio × TC × tipo declarado: `Criterio · TC · Tipo · Evidencia · Ejecución · Resultado`. Es la vista auditable; sin Observaciones, para que se lea de un vistazo.

Reglas de redacción de la matriz:

- El identificador del criterio **se repite** en cada fila suya (no dejar celdas vacías por agrupación visual: rompe el grep y la lectura en diffs).
- Ordenar por criterio y, dentro de cada criterio, por TC y luego por tipo.
- Las rutas de `Evidencia` van en `código` y son relativas a la raíz del repo.
- Nunca omitir una fila `No cubierto`: **es la información más valiosa de la tabla**.

**Tabla de indicadores del Resumen** — un título («Cobertura de criterios de aceptación») seguido de una tabla horizontal de **exactamente cuatro columnas y una sola fila de cifras**, todas de criterios (`Total | Cubiertos | Parciales | No Cubiertos` sobre una fila `M | N | P | Q`); copiarla de la plantilla, no reconstruirla en vertical:

| Columna | Qué cuenta |
|-----------|------------|
| Total | Total de criterios del artefacto (**M**) |
| Cubiertos | Criterios con `Estado = Cubierto` |
| Parciales | Criterios con `Estado = Parcial` |
| No Cubiertos | Criterios con `Estado = No cubierto` |

Cifras siempre numéricas (`0`, no `—`). Las tres últimas **deben sumar M**: comprobarlo antes de publicar; si no cuadra, hay filas mal derivadas. No añadir indicadores de pruebas (fallidas, no ejecutadas): esa granularidad ya está en la matriz, y mezclarla aquí confunde los dos ejes.

**Dónde va cada observación.** Hay dos destinos y no son intercambiables:

La prueba para elegir: *¿se puede atribuir a un criterio concreto?*

| Destino | Qué recibe |
|---------|------------|
| **Columna `Observaciones`** de «Cobertura por criterio» | Todo lo **de un criterio**: tipo declarado sin automatizar · TC en `Draft`/`Obsolete` · `Fallo` no aislable · suite efectiva distinta del tipo declarado · mapeo inferido en vez de declarado · **cobertura apoyada en TCs `Manual`** (aunque sea por diseño: justifica el `⚠️`) · límite de la cobertura |
| **Sección «Observaciones y pendientes»** | Todo lo **de la corrida**: suite `coverage` en `FAIL` · `workingTreeClean: false` (árbol sucio) · clases de prueba que el repo no tiene · ejecución no delegable y su motivo · tests no vinculables con certeza a ningún criterio · tests o fallos ajenos al artefacto |

La matriz **no lleva** columna de observaciones, para que se lea de un vistazo. Cuando un paso diga «dejar Observación» sin especificar destino, aplicar la prueba de atribución.

### Paso 6 — Emitir el veredicto

Aplicar la tabla de «Veredicto» (en `SKILL.md`) sobre el conjunto de criterios. El veredicto responde la pregunta central: **¿todos los criterios de aceptación quedan cubiertos?**

### Paso 7 — Entregar y guardar el reporte

1. Guardar el reporte (sobrescribir si ya existe, salvo que el usuario pida conservar histórico):
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]/trace-report.md` (dentro de la carpeta del WI).
   - **FT:** `docs/specs/features/FT-XXX-[slug]/trace-report.md` (dentro de la carpeta del feature).
   - **Cualquier otro artefacto:** `trace-report.md` **junto al artefacto** (en su carpeta, o al lado del archivo si es suelto). Confirmar la ruta con el usuario antes de escribir; si el artefacto es de solo lectura o externo al repo, no escribir y entregar el reporte en el chat.
2. **Grabar las dos claves** para la próxima comprobación de frescura (Paso 0): escribir al pie del reporte
   la marca `<!-- trace-validate:fingerprint=<FINGERPRINT> · spec=<SPEC_FINGERPRINT> · generado=YYYY-MM-DD -->`
   con los valores vigentes (los del Paso 0; el `FINGERPRINT` recalculado si hubo delegación). Esta marca se
   **conserva** en el documento publicado.
3. Presentar al usuario el **veredicto** y el reporte. No modificar ningún otro artefacto del repo.

---

## Ejecución de pruebas: delegación en quality-check

`trace-validate` **no detecta runners ni ejecuta pruebas**. La ejecución la realiza `quality-check`, que
persiste el resultado en `.sdd-devkit/test-run.json` (esquema `test-run/v1`; ubicación fija, no por unidad).
`trace-validate` solo **consume** ese artefacto.

**Fuente de resultados (orden):**

1. **Caché fresca** — `test-run.json` cuyo `git.fingerprint` coincide con el `FINGERPRINT` canónico (Paso 0) **y** cuyo `generatedBy` es `quality-check` (si no lo es, descartarla). Se
   reutiliza tal cual: es el caso «no hubo cambios desde la última corrida de pruebas».
2. **Delegación `tests-only`** — si no hay caché o está obsoleta, invocar `quality-check` en modo
   `tests-only`; genera/actualiza `test-run.json` y trace-validate lo consume.
3. **No ejecutable** — si `quality-check` no puede correr (sin stack, entorno sin red/dependencias, skill no
   disponible) o el usuario declina la delegación: filas con artefacto en `Ejecución = —` /
   `Resultado = No ejecutado` con la razón; entregar la cobertura estática.

**Esquema `test-run.json`.** La definición canónica —campos, semántica y valores permitidos— vive en
[`quality-check` → Caché de corrida de pruebas](../../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate).
**No** se replica aquí para que no diverja. Lo que este skill necesita de ella:

- `generatedBy` debe ser `"quality-check"`; cualquier otro valor → descartar la caché.
- `git.fingerprint` es la única clave de frescura.
- `suites[]` trae **siempre las cuatro** entradas (`unit`, `coverage`, `integration`, `e2e`); las que el repo no tiene vienen con `result: "N/A"`.
- `invokedFrom` es informativo: **no** filtrar resultados por él ni descartar la caché porque nombre otro trabajo — la corrida es de la rama, no de la unidad.

Reglas:

- Registrar en la línea **Pruebas** del Resumen la **procedencia** (caché fresca del commit X, o corrida
  `tests-only` disparada ahora) y el `result` **por suite** tomado de `test-run.json`, sin volver a ejecutar.
  `test-run.json` **no trae un agregado global**: no inventarlo. La suite `coverage` no se lista ahí; si dio
  `FAIL`, va a «Observaciones y pendientes». Si no hubo corrida, la línea dice «no ejecutable» y el motivo.
- `result` por suite → `Resultado` **de la fila** (no del criterio; el `Estado` del criterio se deriva después de todas sus filas): `PASS`→`Paso`, `FAIL`→`Fallo`, `SKIPPED`→`No ejecutado`, `N/A` (el repo no tiene esa suite)→`No ejecutado`, con la constancia en «Observaciones y pendientes». **Excepción:** cuando varios criterios comparten suite y esta da `FAIL`, no basta con propagar `Fallo` a todos — ver «Granularidad suite vs. criterio» en el Paso 4 más arriba; si no se puede aislar el test que falló, la fila queda en `Fallo` con la Observación «no aislable» y el **`Estado` del criterio** es `Parcial`, no `No cubierto`.
- Filas de TCs marcados `Manual` (manual por diseño): `Ejecución = Manual`, `Resultado = N/A`. No confundir con filas de tipos automatizables (`Unit`/`Integration`/`API Test`/`Visual Test`/`E2E`) aún sin artefacto, que van `Evidencia = —`, `Ejecución = —`, `Resultado = No cubierto` (pendiente de automatizar).
- Si `workingTreeClean` es `false` en la caché, anotarlo como caveat en **«Observaciones y pendientes»**
  (resultado sobre un árbol sucio).

---

## Checklist

- [ ] Frescura comprobada (Paso 0): `FINGERPRINT` y `SPEC_FINGERPRINT` calculados; si ambos coinciden con los del `trace-report.md` existente, el reporte no traía filas `No ejecutado` y no se pidió `revalidate`, se devolvió sin regenerar
- [ ] Idioma resuelto (preferencia del usuario en la sesión, o idioma de la conversación)
- [ ] Tipo de trabajo determinado y documento de criterios leído; criterios extraídos con su identificador **verbatim**, sin normalizar
- [ ] Casos de prueba y artefactos (unit / integración / e2e) inventariados con su ruta y criterio
- [ ] Cada criterio con estado (Cubierto / Parcial / No cubierto) y observaciones cuando aplica
- [ ] Matriz expandida a una fila por criterio × TC × **tipo declarado** (un TC con `Unit, E2E` ocupa dos filas), sin omitir las filas `No cubierto`
- [ ] Resultados de pruebas obtenidos de `quality-check` (caché fresca `test-run.json` o delegación `tests-only`); sin ejecutar la suite en `trace-validate` ni inventar resultados
- [ ] `Ejecución` y `Resultado` rellenados fila a fila (`Ejecución` sin la suite entre paréntesis); ninguna fila con `Evidencia = —` reporta `Paso`/`Fallo`
- [ ] Cabecera completa (Fecha · Rama · Commit · Trabajo · Veredicto) y las dos tablas construidas desde `assets/trace-report-template.md`
- [ ] Resumen con la tabla de indicadores (4 columnas, 1 fila de cifras) cuadrada —cubiertos + parciales + no cubiertos = total de criterios— y la línea **Pruebas** con la procedencia y el resultado por suite (sin agregado inventado)
- [ ] Caveats globales (suite `coverage` en `FAIL`, árbol sucio, suites ausentes, ejecución no delegable) en «Observaciones y pendientes»; sección omitida si no hay ninguno
- [ ] Veredicto emitido respondiendo si **todos** los criterios quedan cubiertos
- [ ] `trace-report.md` guardado en la ubicación del tipo, sin bloques de comentario de la plantilla y con la marca de pie de **ambas** claves; ningún otro artefacto modificado
