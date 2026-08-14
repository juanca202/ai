# Referencia: Flujo de ejecución y manejo de errores

Detalla **cómo** ejecutar la revisión cualitativa paso a paso y cómo actuar ante cada situación. Se carga desde `SKILL.md` al iniciar la ejecución. La semántica de severidad, veredicto y modificadores vive en `SKILL.md`; las rúbricas de las tres dimensiones en [`qualitative-review.md`](qualitative-review.md).

## Contenido

1. [Flujo de ejecución](#flujo-de-ejecución)
2. [Formato del informe](#formato-del-informe)
3. [Manejo de errores](#manejo-de-errores)
4. [Anti-patterns](#anti-patterns)

---

## Flujo de ejecución

> **Principio rector:** revisar el **diff**, no el repo. **Ninguna corrección se aplica sin autorización explícita del usuario.** Tras aplicar una corrección autorizada (o cuando el usuario indique que corrigió manualmente), **reinicia la revisión desde el Paso 1** sobre el código ya corregido: los hallazgos anteriores pueden haber cambiado de forma o de severidad. Para ahorrar vueltas, si el usuario autoriza varias correcciones, aplícalas juntas y reinicia **una sola vez**.
>
> **Este skill no ejecuta checks.** No corre pruebas, linter, tipado ni build; si la corrección de un hallazgo toca lógica cubierta por pruebas, **sugiere** re-ejecutar `quality-check` y sigue con la revisión.

### Paso 0 — Resolver la base, calcular la clave y comprobar frescura

Este paso hace **tres** cosas, en este orden. Las dos primeras se ejecutan **siempre**, haya caché o no: sus valores los necesita el Paso 5 para grabar la marca de pie, también en la primera corrida de un repo.

**0.1 — Resolver la rama base.** Es aquí, y solo aquí, donde se decide (el Paso 1 la da por resuelta y **no vuelve a preguntar**, tampoco tras un reinicio por corrección):

- Con `base <rama>`, esa. Incompatible con `working-tree`: si llegan los dos, preguntar cuál vale.
- Con `working-tree`, no hay base: el alcance son los cambios sin commitear.
- Sin modificador, inferirla (rama de integración configurada del repo, `origin/HEAD`, o la base del PR si existe) y **confirmarla con el usuario si es ambigua**.

**0.2 — Calcular la clave** (`BASE` es la rama ya resuelta; en `working-tree` no hay `BASE_COMMIT`):

```bash
ROOT=$( git rev-parse --show-toplevel )
EXC=( ':(top,exclude,glob)**/.*/**' ':(top,exclude,glob)**/docs/**' ':(top,exclude,glob)**/trace-report.md' )
FINGERPRINT=$( { git -C "$ROOT" ls-files -s              -- "${EXC[@]}"; \
                 git -C "$ROOT" status --porcelain -uall -- "${EXC[@]}"; \
                 git -C "$ROOT" diff                     -- "${EXC[@]}"; \
               } | git hash-object --stdin )
BASE_COMMIT=$( git rev-parse --short "$BASE" )
```

**0.3 — Comprobar la frescura** (ver [Reutilización del informe](../SKILL.md#reutilización-del-informe-idempotencia)):

1. Si el modo es **acotado** (`working-tree` o `scope`) → no hay caché aplicable: continuar en el Paso 1. Esos modos no escriben el informe vigente, así que ni lo consumen ni lo actualizan.
2. Buscar `docs/audits/code-review.md`. Si **no existe** → no hay caché; continuar en el Paso 1.
3. Si **existe**, comparar contra la clave ya calculada en el 0.2. Leer la marca de pie del informe: `<!-- code-review:fingerprint=<hash> · base=<sha-corto> · generado=YYYY-MM-DD -->`. Hay **cuatro** condiciones y deben cumplirse **todas** para reutilizar:

   | # | Condición | Por qué |
   |---|-----------|---------|
   | 1 | `FINGERPRINT` y `base` coinciden | El código y el otro lado del diff no se movieron. |
   | 2 | El **modo** del encabezado es el pedido | Ver la definición de «modo» abajo. |
   | 3 | El veredicto del informe es **`✅ Aprobado`** | **Un `❌ Rechazado` o `⚠️ Incompleto` nunca se sirve desde caché.** Ambos son estados con puerta abierta: se resuelven **justificando** un hallazgo o **aportando** la intención que faltaba, y ninguna de las dos cosas toca el código, así que la clave no se movería y el veredicto quedaría congelado para siempre — con los orquestadores prohibiendo `revalidate`, el cierre se bloquearía sin salida. Ante un veredicto no aprobado se revisa de nuevo, se leen del informe las justificaciones ya aceptadas y se vuelve a abrir la puerta del Paso 4. |
   | 4 | El usuario **no** pasó `revalidate` | Escotilla manual. |

   Si falla cualquiera, o no hay marca de pie (informe antiguo) → continuar el flujo completo (Pasos 1-5).

> **Qué cuenta como «modo».** Solo los modificadores que **cambian el contenido** del informe; hoy eso es exactamente uno: `blocking-only`. Quedan **fuera** de la comparación `base <rama>` (ya cubierto por `BASE_COMMIT`, que compara commits en vez de nombres de ref — así `base develop` y `base origin/develop` no producen un fallo espurio), `save-report` y `revalidate`. El encabezado registra por tanto `default` o `blocking-only`, nada más.

> Computar el `FINGERPRINT` y el `BASE_COMMIT` **una sola vez** y reutilizarlos en el Paso 5 (guardado). Si durante la revisión se aplica una corrección autorizada, el código cambió: **recalcular ambos** antes de guardar, igual que hace `quality-check` tras corregir. Un informe con el fingerprint previo afirmaría corresponder a un código que ya no existe.

### Paso 1 — Delimitar la revisión

1. **Resolver el diff bajo revisión**, con la base ya resuelta en el Paso 0.1 (ver [Alcance del informe](../SKILL.md#alcance-del-informe)):
   - Con `working-tree`, usar los **cambios sin commitear**: `git diff HEAD` más los archivos sin trackear que sean código del proyecto (`git status --porcelain` filtrando artefactos generados, dependencias y salidas de build). Si no hay ninguno, reportarlo y terminar — **no** caer al diff de la rama por iniciativa propia.
   - Con `scope <ruta…>`, limitarse a esas rutas (se combina con los anteriores).
   - En el resto de casos, el diff es `git diff <base>` —base contra el **working tree**, de modo que incluye los cambios sin commitear— más los archivos sin trackear que sean código del proyecto. No revisar todo el repo.
2. Capturar metadata: rama (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`), working tree (`git status --porcelain`) y volumen del diff (`git diff --stat`).
3. **Reconstruir la intención** del cambio desde, en este orden: criterios de aceptación del artefacto origen (US/WI/FT) si existe; descripción de la tarea; nombre de la rama; mensajes de commit del rango; descripción del PR. Si no se puede inferir, **pedir al usuario una frase con el objetivo del cambio**; no inventarla.
4. Si el diff está **vacío** o no contiene cambios de código, reportarlo y terminar: no hay nada que revisar.

### Paso 2 — Leer el contexto del sistema

Antes de juzgar el diff, entender contra qué se juzga:

1. **Patrones del repo:** estructura de carpetas, convenciones de naming, manejo de errores, inyección de dependencias, librerías ya adoptadas. Leer los vecinos de los archivos tocados, no solo el diff.
2. **Límites arquitectónicos declarados:** si el repo documenta su arquitectura (`docs/architecture/`, ADRs, `.agents/MEMORY.md`), leer lo relevante para saber qué dependencias están permitidas entre capas.
3. **Criterios de aceptación** del artefacto origen, si el trabajo viene de una US/WI/FT: son la vara de la dimensión semántica.

Un hallazgo que ignora el patrón vigente del repo o una decisión ya tomada en un ADR es ruido; este paso lo evita.

### Paso 3 — Evaluar las tres dimensiones

1. Leer [`qualitative-review.md`](qualitative-review.md) y recorrer las tres dimensiones (semántica, arquitectura/diseño según ISO/IEC 25010, feedback senior).
2. Emitir hallazgos con severidad (🔴/🟠/🟡/💡). Para cada uno: **qué** (ubicado en archivo/símbolo), **por qué**, **impacto** y **sugerencia concreta**, con la característica ISO/IEC 25010 correspondiente.
3. Si una dimensión no arroja hallazgos, **decirlo explícitamente** (`✅ Conforme`) y explicar brevemente por qué el cambio está bien en ese plano. El silencio no es feedback.
4. Si una dimensión **no se pudo evaluar** (intención no determinable y el usuario no la aportó, parte del diff inaccesible o generada), marcarla como *No evaluada* con el motivo: es lo que produce el veredicto `⚠️ Incompleto` del Paso 4. No confundir *No evaluada* con `✅ Conforme`.

> **Los puntos 3 y 4 aplican a las dimensiones 1 y 2, no a la 3.** La dimensión 3 (feedback estilo senior) es **transversal**: no es un cubo de hallazgos propio sino la forma de redactar los de las otras dos, más los nitpicks `🟡`/`💡` que van a «Feedback adicional». Por eso no se declara `✅ Conforme`, no puede quedar *No evaluada* y no aporta al veredicto — y por eso `blocking-only` puede omitir esa sección sin dejar cojo el informe. En la tabla de justificaciones sí aparece como dimensión, para poder atribuir un hallazgo `🟡`/`💡` que el usuario haya justificado.
5. No inflar ni minimizar severidades; ante la duda, decidir por el **impacto en el sistema** (ver la calibración en `qualitative-review.md`).

### Paso 4 — Puerta cualitativa e informe

1. **Puerta** — si hay hallazgos bloqueantes (🔴/🟠), **pausar y pedir** al usuario, por cada uno, **corregir** o **justificar**:
   - **Justificar** → registrar la justificación en el informe; el hallazgo deja de bloquear.
   - **Corregir con autorización expresa** → aplicar el cambio y **reiniciar la revisión desde el Paso 1**.
   - **Corregir manualmente** (el usuario indica que ya lo hizo) → **reiniciar la revisión desde el Paso 1**.
   - Repetir hasta que no queden bloqueantes sin resolver o el usuario detenga. Aplica la **cota de 3 reinicios** (ver [Manejo de errores](#manejo-de-errores)): tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder.
2. **Dimensiones no evaluadas** (Paso 3.4): si queda alguna y no hay bloqueantes pendientes, el veredicto es `⚠️ Incompleto`; listarlas en el informe con su motivo y en Próximas acciones con qué haría falta para evaluarlas.
3. Rellenar la plantilla [`../assets/code-review-template.md`](../assets/code-review-template.md) (ver [Formato del informe](#formato-del-informe)) con el veredicto de la tabla de `SKILL.md`, los hallazgos por dimensión, las próximas acciones y las justificaciones aceptadas.

### Paso 5 — Registro y salida

La revisión cubre **la rama contra su base** (incluidos los cambios sin commitear), no una unidad, así que su informe reside en una **ubicación fija**, no en la carpeta de la US/WI:

> **Excepción `working-tree`:** una revisión acotada a los cambios sin commitear **no** es el estado vigente de la rama, así que **no sobrescribe** `docs/audits/code-review.md`. Mostrar el informe en el chat (o persistirlo con `save-report` en `docs/audits/code-review-<YYYYMMDD-HHMMSS>.md`) y decirlo en el Resumen. Lo mismo aplica a `scope`: si la revisión no cubrió la rama entera, no publicar como si lo hubiera hecho.

- **Revisión de la rama completa:** **escribir siempre** `docs/audits/code-review.md` rellenando la plantilla, sin importar desde qué `US`/`WI` se invocó ni si el repo es spec-driven. Crear `docs/audits/` si no existe. **Sobrescribir** en re-ejecuciones: representa el estado vigente de la rama, no un histórico. Mostrar también un resumen en el chat.
  > **Es una foto de esta rama, no del repositorio.** Se versiona para que viaje en el PR y el revisor lo lea junto al cambio, pero **no debe integrarse en la rama base**: allí afirmaría un veredicto sobre un diff que ya no existe. Al integrar, `work-integrate` lo retira dentro del propio merge; en un merge hecho en la plataforma hay que borrarlo en la base a mano. Por eso el encabezado lleva siempre la rama, el commit y la base del diff.
- **`save-report`:** guardar además una copia con marca de tiempo en `docs/audits/code-review-<YYYYMMDD-HHMMSS>.md`. Es el modo para conservar histórico puntual, y **el único destino en disco de una revisión acotada** (`working-tree` o `scope`), que nunca toca el `code-review.md` vigente.

**Grabar la marca de frescura.** Al escribir el `code-review.md` vigente, cerrar el documento con

```
<!-- code-review:fingerprint=<FINGERPRINT> · base=<BASE_COMMIT> · generado=YYYY-MM-DD -->
```

usando los valores **vigentes** (los del Paso 0 si no hubo correcciones; los recalculados tras la última corrección si las hubo). Es lo que lee el Paso 0 de la siguiente invocación (ver [Reutilización del informe](../SKILL.md#reutilización-del-informe-idempotencia)). La marca **se conserva** en el documento publicado, a diferencia de los bloques de comentario de instrucciones de la plantilla. Las copias de `save-report` llevan la marca **solo si la revisión cubrió la rama completa**; una revisión acotada (`working-tree`/`scope`) se guarda **sin** marca, porque esos valores describirían un diff que no revisó. En ningún caso se leen como caché: la caché vive solo en el informe vigente.

Devolver el informe completo (y la ruta del `code-review.md` si se escribió). **No** continuar con `git commit`, push ni merge aunque el veredicto sea `✅ Aprobado` — salvo instrucción explícita del usuario. Si el cierre requiere también las verificaciones automatizadas, **sugerir** invocar `quality-check`; no ejecutarlo desde aquí.

---

## Formato del informe

La estructura canónica está en la plantilla [`../assets/code-review-template.md`](../assets/code-review-template.md). **Rellénala** (no la reescribas desde cero) para todo informe, tanto el resumen que se muestra en chat como el `docs/audits/code-review.md` que se escribe siempre.

La plantilla incluye: encabezado con metadata (donde vive el **Veredicto**, con su justificación de una línea; no hay sección propia), **Resumen**, **Intención detectada**, **Hallazgos** por dimensión (con **Dimensiones no evaluadas**, obligatoria para sostener un `⚠️ Incompleto`), **Próximas acciones** y **Justificaciones aceptadas**, más la marca de pie del fingerprint.

> **El informe no reporta el estado de las otras dos puertas.** Cada una escribe el suyo (`docs/audits/quality-check.md`, el `trace-report.md` del trabajo) y quien las consolida es el orquestador de cierre (`work-integrate`, `pr-create`). Copiar aquí sus veredictos solo produce dos fuentes que se desincronizan: este documento responde por el plano cualitativo y nada más.

Símbolos de severidad (exactamente estos): `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` Conforme.

Reglas al rellenar:
- Sustituir cada `{{…}}` de la plantilla por el valor real; el informe publicado no debe conservar placeholders ni el bloque de comentario inicial — pero **sí** conserva la marca de pie con el fingerprint y la base (Paso 5).
- Cada hallazgo lleva su característica ISO/IEC 25010, el porqué, el impacto y una sugerencia concreta.
- Con `blocking-only`, omitir los hallazgos 🟡/💡 y decirlo en el Resumen.
- Si no hubo justificaciones, la sección final dice «Ninguna».
- No incluir tablas de checks, comandos ni resultados de pruebas: eso pertenece al informe de `quality-check`.

---

## Manejo de errores

| Situación | Cómo actuar |
|-----------|-------------|
| Rama base ambigua o no inferible | Parar y preguntar contra qué rama comparar (Paso 0.1). No adivinar. Sin base no hay `BASE_COMMIT` ni diff. |
| Informe existente fresco pero con veredicto `❌ Rechazado` o `⚠️ Incompleto` | **No es un hit de caché**: revisar de nuevo. Arrastrar del informe anterior las justificaciones ya aceptadas y reabrir la puerta del Paso 4 sobre los hallazgos que sigan sin resolver. Servir ese veredicto desde caché dejaría el cierre sin salida. |
| Informe existente **fresco** (mismo `FINGERPRINT`, misma base, mismo modo) | Devolver su veredicto y su resumen indicando desde cuándo no hay cambios. **No** volver a revisar ni reescribir el archivo. Si el usuario quiere una revisión nueva de todos modos, ofrecerle `revalidate`. |
| Informe existente **sin marca de pie** (generado antes de esta convención) | Tratarlo como caché ausente: revisar de nuevo y grabar la marca al guardar. |
| Marca de pie ilegible, incompleta o con un hash que no parsea | No intentar repararla ni adivinar: tratar la caché como ausente, revisar y regrabarla. |
| Cambia solo una carpeta oculta (`.sdd-devkit/`, `.github/`…), algo de `docs/` o un `trace-report.md` suelto | **No** es un cambio de código: el fingerprint los excluye y la caché sigue fresca. Correr `quality-check`, `trace-validate` o `arch-audit` no invalida esta revisión. |
| Cambian los **criterios de aceptación** del artefacto origen (`docs/specs/…`) sin tocar el código | El fingerprint no se mueve porque `docs/` está excluido, pero la dimensión semántica sí cambia de vara. Avisar al usuario y revisar con `revalidate`; no devolver el informe cacheado. |
| La base se movió (`git fetch`) sin tocar el árbol local | El `FINGERPRINT` no cambia pero `BASE_COMMIT` sí → caché obsoleta: revisar de nuevo. Es justo el caso que justifica guardar la base en la marca. |
| La intención cambió sin cambiar el código (el usuario la aporta, o el ticket se editó fuera del repo) | El fingerprint no lo detecta. Decírselo al usuario y revisar con `revalidate`. |
| Corrección autorizada durante la revisión | El código cambió: **recalcular** `FINGERPRINT` y `BASE_COMMIT` antes de grabar la marca de pie (Paso 5), tras reiniciar desde el Paso 1. |
| Diff vacío o sin cambios de código | Reportarlo y terminar: no hay nada que revisar. |
| `working-tree` con el árbol limpio | Reportar que no hay cambios sin commitear y terminar. **No** revisar el diff de la rama en su lugar: el usuario pidió otro alcance. |
| `working-tree` invocado desde `work-integrate` o `pr-create` | No corresponde: en el cierre hay que revisar **todo** lo que se va a integrar, no solo lo aún sin commitear. Usar el alcance por defecto (rama contra base), que de todos modos incluye los cambios sin commitear — p. ej. las correcciones que `quality-check` haya podido aplicar en la puerta anterior. |
| Diff enorme (cientos de archivos) | Avisar del volumen y proponer acotar con `scope`; si el usuario prefiere seguir, priorizar por impacto y decirlo en el Resumen. |
| Archivos generados o vendorizados en el diff | Excluirlos de la revisión y dejar constancia; no reportar hallazgos sobre código generado. |
| No se puede inferir la intención (sin US/WI/FT, rama genérica, commits opacos) | Pedir al usuario una frase con el objetivo del cambio; no inventar intención. Si no la aporta, la dimensión semántica queda sin evaluar → `⚠️ Incompleto`. |
| El repo no documenta arquitectura ni patrones claros | Revisar contra el estilo predominante en el código vecino; no imponer un patrón ajeno al repo como si fuera regla. |
| Usuario justifica un hallazgo 🔴/🟠 | Registrar la justificación; el hallazgo deja de bloquear. Incluirla en `code-review.md`. |
| Corrección de un hallazgo (auto autorizada o manual) | Reiniciar **toda la revisión desde el Paso 1**. Si tocó lógica cubierta por pruebas, sugerir re-ejecutar `quality-check`. |
| Usuario pide "corrige tú" sin más contexto | Confirmar el alcance exacto a corregir antes de tocar nada; aplicar solo lo mínimo. |
| Varias correcciones autorizadas a la vez | Aplicarlas juntas y reiniciar **una sola vez**. |
| Bucle de correcciones que no converge | Tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder. |
| El usuario pide correr pruebas, linter o build | Fuera de alcance: redirigir a `quality-check`. No ejecutar checks desde aquí. |
| El usuario pasa un modificador de la etapa automatizada (`tests-only`, `no-e2e`, `only build`…) | Explicar que esos modificadores viven en `quality-check` y ofrecer invocarlo. |
| El usuario señala que a un criterio de aceptación le falta prueba | Es competencia de `trace-validate`, no de este skill: anotarlo como observación y remitir a esa puerta. Aquí solo se juzga la **calidad** de las pruebas presentes en el diff. |

---

## Anti-patterns

- **Comportarse como una herramienta de CI:** ejecutar checks, listar exit codes o pegar salidas de herramientas. Eso es `quality-check`.
- Invocar `quality-check` desde aquí o unificar ambos veredictos en un solo informe — son skills independientes.
- Condicionar el veredicto cualitativo al resultado de las pruebas (o al revés): cada skill responde por su plano.
- **Reportar como hallazgo la falta de pruebas de un criterio de aceptación** — esa es la pregunta de `trace-validate`. Aquí se juzga la calidad de las pruebas que el diff sí incluye.
- Cerrar en `✅ Aprobado` con una dimensión sin evaluar: eso es `⚠️ Incompleto`.
- **Solo reportar violaciones de reglas** sin razonar sobre la intención del diseño ni el impacto en el sistema.
- Dar un hallazgo sin explicar el **porqué** o sin **sugerencia concreta** (un "esto está mal" pelado no es feedback senior).
- Marcar 🔴/🟠 algo que es 🟡/💡 (inflar severidad) o al revés (minimizar un defecto real de diseño).
- Reportar hallazgos sin ubicarlos (archivo/símbolo) — un hallazgo que el autor no puede localizar no es accionable.
- Juzgar el diff contra un patrón ajeno al repo, o contradecir una decisión ya documentada en un ADR sin siquiera mencionarla.
- Revisar todo el repo en lugar del diff bajo revisión, o reportar hallazgos sobre código que el diff no tocó (salvo que sea el impacto directo del cambio, y diciéndolo).
- Cambiar de alcance por cuenta propia: si `working-tree` no encuentra cambios, se reporta y se termina; no se sustituye por el diff de la rama.
- Reportar hallazgos sobre archivos generados o vendorizados.
- Declarar `✅ Aprobado` con un hallazgo bloqueante sin corregir **ni** justificar.
- Aceptar una justificación y **no registrarla** en el `code-review.md`.
- Aplicar una corrección **automáticamente sin que el usuario la pida expresamente**.
- Corregir un hallazgo y **no reiniciar** la revisión.
- No decir nada cuando una dimensión está conforme (el silencio no es feedback).
- Escribir `code-review.md` en la carpeta de una US/WI, o en `docs/specs/`, en vez de en `docs/audits/`; o no escribirlo porque el repo no sea spec-driven **cuando la revisión cubrió la rama completa**.
- A la inversa: **sobrescribir `docs/audits/code-review.md` con una revisión acotada** (`working-tree` o `scope`) — ese archivo representa el estado vigente de la rama entera.
- **Rehacer la revisión completa cuando el informe vigente está fresco y aprobado** — devolver el existente (salvo `revalidate`).
- A la inversa: **devolver un informe cacheado con la clave desactualizada** — si difiere el fingerprint, la base o el modo pedido, hay que revisar de nuevo.
- **Consumir o escribir la caché en una revisión acotada** (`working-tree`, `scope`): esos modos no representan el estado vigente de la rama.
- **Grabar la marca de pie con el fingerprint anterior a una corrección** — el informe afirmaría corresponder a un código que ya no existe.
- Eliminar la marca de pie al publicar el informe (sí se eliminan los bloques de instrucciones de la plantilla, no la marca).
- Continuar a commit/push/merge tras `✅ Aprobado` sin instrucción explícita.
