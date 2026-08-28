---
name: code-review
description: >-
  Revisión cualitativa de código, estilo ingeniero senior, sobre el diff de una rama contra su base (incluye lo no commiteado): intención, arquitectura y diseño (SOLID, Clean Architecture, ISO/IEC 25010: acoplamiento, fiabilidad, seguridad, desempeño) y feedback accionable que explica el porqué y propone cambios. Devuelve hallazgos con severidad, veredicto y próximas acciones. No exige artefactos de este plugin: la intención puede venir de una US-XXX/WI-XXX/FT-XXX, un ticket o spec externo, o la rama y sus commits. Activar cuando el usuario pida "revisa este código", "code review", "¿está bien resuelto esto?", "revisa el diseño antes del PR/merge", o cuando lo invoque otro skill (work-integrate, pr-create). Proceso de cierre, no proactivo. NO ejecuta pruebas, linter ni build — eso es de quality-check. Por defecto pide confirmación antes de corregir un hallazgo bloqueante; `.sdd-devkit/settings.json` (`verification.codeReview.confirmFix: "never"`) permite corregir directo sin preguntar.
license: MIT
---

# Skill: Revisión de código (cualitativa)

Revisar el **diff** de una implementación como lo haría un **ingeniero senior** revisando el PR de un compañero: razonar sobre la **intención** del cambio, su **diseño y arquitectura**, y entregar **feedback accionable**.

> **NO te comportes como una herramienta de CI.** Aquí no se ejecutan pruebas, linter, tipado ni build. Ese plano —el de «¿el código corre y cumple las reglas?»— pertenece al skill **[`quality-check`](../quality-check/SKILL.md)**. Este skill responde la otra mitad: **¿resuelve el problema correcto, está bien diseñado y será mantenible?**
>
> **Skills independientes.** Las tres puertas del cierre —`quality-check`, `code-review` y `trace-validate`— son **hermanas**: ninguna condiciona el veredicto de otra; cada una emite el suyo y escribe su propio informe. Quien las encadena es el orquestador de cierre (`work-integrate`, `pr-create`). Ver [Relación con otros skills](#relación-con-otros-skills).
>
> **Alcance:** analiza, razona y **propone**. Aplica correcciones **solo si el usuario lo autoriza explícitamente** —o si `.sdd-devkit/settings.json` tiene `verification.codeReview.confirmFix: "never"` (ver [Política de corrección](#política-de-corrección))—. No hace commit/push/merge sin instrucción explícita.
>
> **Informe idempotente.** Si no hubo **cambios en los archivos** (ni en el código de la rama ni en su base) desde la última vez que se generó `docs/audits/code-review.md`, **no se vuelve a revisar**: se devuelven el veredicto y el resumen del informe existente. Ver [Reutilización del informe (idempotencia)](#reutilización-del-informe-idempotencia).
>
> **Entrada mínima:** un **diff** identificable (rama contra su base, o los archivos que el usuario indique) y la **intención** del cambio. Sin diff no hay nada que revisar; sin intención inferible, preguntar al usuario. **No se exige ningún artefacto del plugin:** la intención puede venir de un `US-XXX`/`WI-XXX`/`FT-XXX`, de cualquier otro documento de especificación, o de la rama, los commits y la descripción del PR. Ver [Origen de la intención](#origen-de-la-intención).

---

## Alcance del informe

El informe de este skill cubre **todo lo que la rama difiere de su base — commiteado o no**: el trabajo que se va a integrar o a abrir como PR, más cualquier cambio aún en el working tree. Nunca el repositorio completo.

| Alcance | Cuándo | Cómo se resuelve |
|---------|--------|------------------|
| **Rama contra su base** (por defecto) | Cierre: `work-integrate`, `pr-create`, o revisión previa al PR | `git diff <base>` (base contra el working tree, así que **incluye lo sin commitear**) más los archivos sin trackear que sean código del proyecto. La base se infiere o se fija con `base <rama>`. |
| **Solo cambios sin commitear** (`working-tree`) | Durante el desarrollo: «revisa lo que llevo antes de commitear» | `git diff HEAD` + archivos sin trackear relevantes. Deja fuera lo ya commiteado en la rama. |
| **Rutas concretas** (`scope <ruta…>`) | Revisión acotada a un módulo o carpeta | Solo el diff de esas rutas; se combina con los anteriores. |

> **Por qué el default incluye lo sin commitear.** Porque lo que hay que revisar es **el código que se va a integrar**, no el que ya está commiteado. En el cierre, la puerta anterior puede haber aplicado correcciones que aún no se han commiteado; y fuera del cierre, el usuario suele pedir la revisión con trabajo a medias en el árbol. En ambos casos, mirar solo los commits dejaría fuera parte de lo que se revisa. El modo `working-tree` existe para lo contrario: acotar deliberadamente a lo que aún no se ha commiteado.

---

## Mapa de referencias

Carga cada archivo **solo cuando lo necesites** (rutas relativas a la raíz del skill):

| Archivo | Qué contiene | Cuándo leerlo |
|---------|--------------|---------------|
| [`references/execution.md`](references/execution.md) | Flujo de ejecución paso a paso (Pasos 0–5, incluida la comprobación de frescura), formato del informe, manejo de errores y anti-patterns. | Al **iniciar** la ejecución de la revisión y ante cualquier situación atípica. |
| [`references/qualitative-review.md`](references/qualitative-review.md) | Detalle de las tres dimensiones, modelo ISO/IEC 25010, calibración de severidad y ejemplos de buen/mal feedback. | En el Paso 3, antes de redactar hallazgos. |
| [`assets/code-review-template.md`](assets/code-review-template.md) | Plantilla canónica del informe. | En el Paso 4, para rellenar el informe. |


### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`../../reference/language.md`](../../reference/language.md): **Idioma** — resolución obligatoria del idioma de artefactos y mensajes. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*
- [`../../reference/verification.md`](../../reference/verification.md): **Política de corrección** — si se pregunta antes de corregir un hallazgo bloqueante o se corrige directo. *Lectura obligatoria antes de ejecutar el skill.*

---

## Política de corrección

Antes de ejecutar este skill, DEBES leer [`../../reference/verification.md`](../../reference/verification.md).

Las reglas de `verification.md` son obligatorias y determinan, vía `verification.codeReview.confirmFix`, si se pausa a preguntar «corregir o justificar» ante cada hallazgo bloqueante (`always`, comportamiento por defecto) o si se aplica directamente el cambio sugerido sin preguntar (`never`). Ver [Severidad y veredicto](#severidad-y-veredicto).

No continúes hasta haber leído y aplicado `verification.md`.

---

## Las tres dimensiones

Evalúa el **diff** (no todo el repo) contra estas tres dimensiones. El detalle de cada rúbrica, la calibración de severidad y los ejemplos de buen/mal feedback están en **[`references/qualitative-review.md`](references/qualitative-review.md)** — léelo antes de redactar los hallazgos.

**1. Análisis semántico (intención).** Entender *qué* intenta lograr el cambio y *qué problema* resuelve, y detectar desajustes entre la **intención declarada** y lo que el código realmente hace. La intención puede venir de un artefacto del plugin (`US-XXX` / `WI-XXX` / `FT-XXX`), de **cualquier otro documento de especificación** (ticket de un tracker, spec suelto, doc externo — ver [Origen de la intención](#origen-de-la-intención)), o —si no hay documento— de la rama, los commits y la descripción del PR. Banderas: código que resuelve un problema distinto al pedido, criterios de aceptación sin cubrir, efectos colaterales no buscados, lógica que contradice su propio nombre.

**2. Arquitectura, diseño y calidad del producto.** Evaluar el diff contra las características de calidad de **ISO/IEC 25010** que el cambio toca: **Mantenibilidad** (SOLID, Clean Architecture, acoplamiento, duplicación, abstracción innecesaria, patrones del proyecto y **calidad de las pruebas incluidas en el diff** — si prueban lo que importa, si son legibles y mantenibles, si dependen de detalles frágiles; su **ejecución** es de `quality-check`); **Fiabilidad** (manejo de errores, casos borde, estados inconsistentes); **Seguridad** (validación de entradas, exposición de datos, autenticación/autorización, secretos en código); **Eficiencia en el desempeño** (N+1, complejidad algorítmica, recursos no liberados); **Compatibilidad** (contratos de API/eventos que rompen consumidores). Cada hallazgo se etiqueta con su característica ISO/IEC 25010.

**3. Feedback estilo senior.** Cada hallazgo debe ser **accionable y contextual**: explicar el **PORQUÉ** (qué se rompe o encarece a futuro), proponer una **mejora concreta** (idealmente con un esbozo) y mantener el tono de un par que ayuda, no de un linter que regaña. Prioriza por impacto; no abrumes con nitpicks. Si el cambio está bien, dilo y explica por qué — el silencio no es feedback.

---

## Origen de la intención

La dimensión 1 necesita saber **qué se pidió** para juzgar si el código lo resuelve. Ese contrato **no depende de los artefactos de este plugin**: es el mismo criterio abierto que aplican [`test-define`](../test-define/SKILL.md) y [`trace-validate`](../trace-validate/SKILL.md).

Resolver la intención por este orden, quedándose con la primera fuente disponible:

| Fuente | Cómo obtenerla |
|--------|----------------|
| **Artefacto del plugin** | `US-XXX` / `WI-XXX` / `FT-XXX` derivado del prefijo de rama + ID (`feature/US-042-…`, `fix/WI-007-…`, `test/FT-003-…`); leer su `README.md` y sus criterios de aceptación. Si la carpeta no está en la ruta activa, buscarla bajo `docs/archive/` antes de descartarla (ver la regla siguiente). |
| **Cualquier otro documento de especificación** | La ruta o nombre que indique el usuario, o el que la rama/PR referencie: un spec suelto en el repo, un documento de otra herramienta o formato. Leerlo completo antes de revisar. |
| **Ticket de un tracker externo** | El ID en la rama, el commit o el título del PR (`PROJ-1234`). Si el contenido no es accesible desde aquí, **pedírselo al usuario**; no inventarlo. |
| **Sin documento** | Deducirla de la rama, los mensajes de commit y la descripción del PR. Es una base más débil: decirlo en el informe. |

Reglas:

- **Un artefacto archivado sigue siendo la fuente de intención.** `work-integrate` y `pr-create` pueden mover la carpeta de un trabajo cerrado a `docs/archive/user-stories/` o `docs/archive/work-items/`. Ocurre de forma rutinaria al revisar una rama cuyo archivado ya se commiteó, así que **buscar ahí antes de bajar a la siguiente fuente**: dar por «sin documento» un artefacto que sí existe degradaría la dimensión 1 a `INCOMPLETE` sin motivo. Solo se lee. Ver [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).
- **La ausencia de artefacto no bloquea la revisión.** Las dimensiones 2 y 3 (arquitectura/diseño y feedback) se evalúan igual sobre cualquier diff, en cualquier repo, sin `docs/specs/` ni convención de ramas.
- **Sí condiciona la dimensión 1.** Si la intención no es determinable y el usuario no la aporta, no inventarla ni inferirla del propio código —eso es circular, el código siempre "cumple" consigo mismo—: marcar esa dimensión como `NOT_ASSESSED` y emitir **`INCOMPLETE`**.
- **Los criterios se citan verbatim.** Sea cual sea el formato del identificador (`AC-012`, `1.3`, `R-3`, `CA-07`), se usa **tal como está escrito** en el artefacto, sin normalizar — mismo contrato que `test-define` y `trace-validate`.
- **Qué está probado no es asunto de este skill.** La cobertura criterio a criterio la valida `trace-validate`; aquí los criterios sirven solo para juzgar si el cambio resuelve el problema pedido.

---

## Severidad y veredicto

Clasifica cada hallazgo. Solo los dos primeros niveles **bloquean**.

| Severidad | Qué califica | Efecto en veredicto |
|-----------|--------------|---------------------|
| `CRITICAL` (`🔴`) | Desajuste intención↔implementación, violación grave de límites arquitectónicos, acoplamiento que impide el cambio, vulnerabilidad explotable, defecto de diseño que romperá el sistema o lo desvía del objetivo. | **Bloquea** salvo justificación aceptada. |
| `MAJOR` (`🟠`) | Violación SOLID con impacto real, duplicación significativa, abstracción innecesaria costosa, divergencia fuerte de los patrones del proyecto, cambio de contrato sin versionar. | **Bloquea** salvo justificación aceptada. |
| `MINOR` (`🟡`) | Mejoras recomendables sin riesgo sistémico (naming, legibilidad, duplicación pequeña). | No bloquea. |
| `SUGGESTION` (`💡`) | Ideas opcionales, alternativas de estilo. | No bloquea. |

## Vocabulario de veredictos y estados

Antes de redactar cualquier informe, DEBES leer [`../../reference/verdicts.md`](../../reference/verdicts.md).

Las reglas de `verdicts.md` son obligatorias: el valor canónico y el símbolo son estables, y la **etiqueta que lee la persona se redacta siempre en el idioma resuelto** por `language.md`. Ninguna etiqueta de este skill se fija en un idioma concreto.

No continúes hasta haber leído y aplicado `verdicts.md`.

---

### Veredicto

| Veredicto | Condición exacta |
|-----------|------------------|
| `APPROVED` | **Cero** hallazgos bloqueantes (🔴/🟠) sin resolver — corregidos o justificados-y-aceptados. Hallazgos 🟡/💡 en cualquier estado. |
| `REJECTED` | **Al menos un** hallazgo 🔴/🟠 sin corregir ni justificar. |
| `INCOMPLETE` | Sin bloqueantes pendientes, pero **alguna dimensión no pudo evaluarse** (p. ej. la intención no es determinable y el usuario no la aportó, o parte del diff es inaccesible/generado y no se pudo revisar). |

Precedencia: `REJECTED` > `INCOMPLETE` > `APPROVED`.

> **Este veredicto cubre solo el plano cualitativo.** El del plano automatizado lo emite `quality-check` y el de la cobertura funcional `trace-validate`, cada uno por separado: el cierre de un trabajo exige **las tres** puertas en aprobado. Un `APPROVED` aquí **no** dice nada sobre si las pruebas pasan ni sobre si cada criterio está cubierto. (En un **PR de promoción** —`develop → master`— esta puerta no corre: su unidad es un diff sin revisar, y ahí todo el diff ya se revisó PR a PR. Ver [`pr-create`](../pr-create/SKILL.md#puertas-en-un-pr-de-promoción).)
>
> **Ojo con el símbolo `⚠️` en el cierre:** aquí (y en `quality-check`) `INCOMPLETE` **bloquea**; en `trace-validate`, `APPROVED_WITH_NOTES` **no bloquea**. Mismo símbolo, efecto de compuerta opuesto.

**Ante un hallazgo bloqueante (🔴/🟠)**, lo que sigue depende de `verification.codeReview.confirmFix` (ver [Política de corrección](#política-de-corrección)):

- **`always`** (o sin `settings.json`, comportamiento por defecto) — se ofrecen **DOS caminos** al usuario, y se **pausa** a que elija antes de continuar:
  1. **Corregir** — el skill presenta el cambio sugerido. Sea corrección automática autorizada o manual del usuario, tras aplicarla se **reinicia la revisión desde el Paso 1** sobre el diff ya corregido. Si la corrección toca lógica cubierta por pruebas, **sugerir** re-ejecutar `quality-check`; no ejecutarlo desde aquí.
  2. **Justificar** — el usuario explica por qué el estado actual es aceptable; si se acepta, el hallazgo deja de bloquear y la justificación **se registra** en el informe (queda trazado quién aceptó el estado actual y por qué).

  Si no autoriza ni justifica, el hallazgo sigue bloqueando.
- **`never`** — **no pausar**: aplicar directamente el cambio sugerido para cada hallazgo bloqueante (equivalente a elegir «Corregir» en todos, sin esperar confirmación) y reiniciar la revisión. La vía de **justificar** sigue disponible si el usuario aporta la justificación explícitamente en el turno; sin ella, se corrige.

Mientras haya hallazgos bloqueantes sin resolver, el veredicto es `REJECTED`.

---

## Modificadores de invocación

Las **claves** de los modificadores son siempre en inglés (estándar). Si el usuario no especifica ninguno, asumir `default`. El usuario puede nombrarlos en español; mapéalos a la clave en inglés.

| Modifier | Efecto exacto |
|----------|----------------|
| `default` | Revisar el diff completo de la rama contra su base, en las tres dimensiones. |
| `base <rama>` | Fijar la rama base del diff (p. ej. `base develop`). Sin este modificador, inferirla y confirmarla con el usuario si es ambigua. |
| `working-tree` | Revisar **solo los cambios sin commitear** (`git diff HEAD` más los archivos sin trackear que sean código del proyecto), en lugar del diff completo de la rama. Para revisar durante el desarrollo, antes de commitear. Si el working tree está limpio, decirlo y terminar — no caer al diff de la rama por su cuenta. Incompatible con `base <rama>`. **No sobrescribe `docs/audits/code-review.md`.** |
| `scope <ruta…>` | Limitar la revisión a los archivos o directorios indicados en lugar del diff completo. Combinable con `working-tree`. **No sobrescribe `docs/audits/code-review.md`.** |
| `blocking-only` | Reportar solo hallazgos 🔴/🟠; omitir 🟡/💡 del informe. Útil en revisiones de cierre donde solo interesa lo que bloquea. |
| `revalidate` | **Forzar la revisión** aunque el informe existente esté fresco: ignorar la comprobación de frescura del Paso 0 y ejecutar el flujo completo. Sinónimos aceptados del usuario: «revalidar», «forzar», «revisa de nuevo». Ver [Reutilización del informe (idempotencia)](#reutilización-del-informe-idempotencia). |
| `save-report` | **Además** del informe vigente `docs/audits/code-review.md`, guardar una copia con marca de tiempo en `docs/audits/code-review-<YYYYMMDD-HHMMSS>.md`. En una revisión acotada (`working-tree`/`scope`) es el **único** destino en disco: ahí no se escribe el informe vigente. |

> Los modificadores de la etapa automatizada (`no-tests`, `no-e2e`, `only <check>`, `tests-only`, `include-linter-warnings`…) **no pertenecen a este skill**: viven en [`quality-check`](../quality-check/SKILL.md). Si el usuario los pide aquí, redirigirlo a ese skill.
>
> **`blocking-only` existe en ambos skills con efectos distintos:** aquí filtra el **informe** (solo 🔴/🟠); en `quality-check` omite los checks **informativos** (Sonar). Misma intención —quitar el ruido que no bloquea—, alcance distinto.

---

## Reutilización del informe (idempotencia)

Mismo principio de caché que [`quality-check`](../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate) y `trace-validate`: **si no hubo cambios en los archivos desde la última revisión, no se vuelve a revisar** — se devuelven el veredicto y el resumen del `docs/audits/code-review.md` existente. Revisar de nuevo un diff idéntico produciría el mismo informe y gasta el tiempo del usuario (y el contexto) sin aportar señal nueva.

> **Contexto de ejecución.** Como las otras dos puertas, este skill es una **compuerta de cierre** (al integrar o antes del PR), no corre por tarea ni durante la implementación. La frescura se evalúa sobre la rama **consolidada** del cierre. Si `work-integrate` o `pr-create` invocan las puertas del cierre y el código no cambió desde la corrida anterior, esta devuelve su informe sin rehacer el análisis.

**Clave de frescura — el fingerprint canónico de la tubería + el commit de la base.** Dos datos, porque el diff bajo revisión tiene **dos lados**:

| Componente | Qué cubre | Cómo se obtiene |
|------------|-----------|-----------------|
| `FINGERPRINT` | El lado de la rama: contenido trackeado, cambios sin stagear y rutas sin trackear, **excluyendo toda carpeta oculta, cualquier `docs/` y los `trace-report.md` sueltos**. Es **el mismo valor** que calculan `quality-check` y `trace-validate`; receta exacta en [`quality-check`](../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate). | `git hash-object` sobre `ls-files -s` + `status` + `diff` (ver receta) |
| `BASE_COMMIT` | El otro lado: el commit de la **rama base** contra la que se diffea. Un `git fetch` que mueva la base cambia el diff sin tocar el árbol local, así que el `FINGERPRINT` solo no lo detectaría. Compara **commits**, no nombres de ref: `base develop` y `base origin/develop` apuntando al mismo commit son el mismo valor. | `git rev-parse --short <base>` con la base ya resuelta (Paso 0.1) |

La exclusión de `docs/` es la que hace que **escribir el propio `code-review.md` no invalide su caché**.

**Comportamiento (Paso 0 del flujo):**

1. Resolver la rama base y calcular `FINGERPRINT` y `BASE_COMMIT`. **Siempre**, haya caché o no: el Paso 5 los necesita para grabar la marca de pie, también en la primera corrida de un repo.
2. Buscar `docs/audits/code-review.md`. Si no existe → no hay caché; ejecutar el flujo completo.
3. Si existe, leer su **marca de pie** (`<!-- code-review:verdict=<canónico> · mode=<modo> · fingerprint=<hash> · base=<sha-corto> · generated=YYYY-MM-DD -->`) y reutilizarlo **solo si se cumple todo**: coinciden fingerprint y base, el **modo** es el mismo, el veredicto registrado es **`APPROVED`**, y el usuario no pasó `revalidate`. Entonces → **no revisar**: devolver el veredicto y el resumen del informe existente, indicando que no hubo cambios desde `{{generated}}`. No reescribir el archivo, no releer el diff.
4. Si falla cualquiera de esas condiciones, o no hay marca de pie (informes antiguos) → ejecutar el flujo completo (Pasos 1-5) y **regrabar** la marca de pie al guardar.
5. La marca de pie **se conserva** en el documento publicado (no se elimina como el bloque de instrucciones de la plantilla).

> **Solo se cachea el `APPROVED`.** `REJECTED` y `INCOMPLETE` describen una puerta abierta, y las dos formas de cerrarla —**justificar** un hallazgo bloqueante o **aportar** la intención que faltaba— no tocan el código. Si se sirvieran desde caché, la clave nunca se movería, el veredicto quedaría congelado y, como los orquestadores tienen prohibido forzar `revalidate`, el usuario que justifica en vez de corregir no podría integrar jamás. Ante un veredicto no aprobado se revisa de nuevo, arrastrando del informe anterior las justificaciones ya aceptadas.

**Lo que la caché no cubre:**

- **Revisiones acotadas (`working-tree`, `scope`) no se cachean ni consumen caché.** No escriben `docs/audits/code-review.md`, así que no hay dónde guardar la marca ni informe vigente que devolver: se revisan siempre. Un informe de rama fresco **tampoco** sustituye a una revisión acotada — son alcances distintos.
- **Un cambio de intención sin cambio de código.** La dimensión semántica juzga el diff contra lo que se pidió, y esa fuente **no está en la clave**: `docs/` entero queda excluido, así que reescribir los criterios de aceptación de una `US-XXX` no mueve el fingerprint; tampoco lo hace un ticket editado en un tracker, ni que el usuario aporte a mano una intención que antes no era determinable. En todos esos casos hay que pasar `revalidate`.
- **Un cambio de modificadores.** Un informe generado con `blocking-only` no responde lo mismo que uno `default`. Si el modo pedido difiere del que registra el encabezado del informe existente, tratar la caché como **no aplicable** y revisar de nuevo. **«Modo» son solo los modificadores que cambian el contenido del informe** —hoy únicamente `blocking-only`—: `base`, `save-report` y `revalidate` no cuentan, porque no alteran lo que el informe dice.
- **El contenido de un archivo sin trackear.** El alcance por defecto incluye los archivos nuevos que aún no están en git, pero de esos la clave solo captura la **ruta**, no el contenido: editar un archivo recién creado y no añadido no mueve el fingerprint. Si la revisión depende de uno, pasar `revalidate`.

---

## Flujo de ejecución (resumen)

**Ninguna corrección se aplica sin autorización** —explícita del usuario, o de antemano vía `verification.codeReview.confirmFix: "never"` (ver [Política de corrección](#política-de-corrección))—; tras corregir, se reinicia la revisión. El detalle paso a paso, el formato del informe, el manejo de errores y los anti-patterns están en **[`references/execution.md`](references/execution.md)** — léelo al iniciar la ejecución.

0. **Resolver la base, calcular la clave y comprobar frescura:** si ya existe `docs/audits/code-review.md` con su marca de pie, no hubo cambios (mismo `FINGERPRINT`, misma base y mismo modo) **y su veredicto es `APPROVED`**, **devolver ese informe sin volver a revisar** — ver [Reutilización del informe (idempotencia)](#reutilización-del-informe-idempotencia). Solo si hay cambios, la revisión es acotada, o el usuario pasa `revalidate`, continuar con los pasos siguientes.
1. **Delimitar la revisión:** resolver el diff (rama base o `scope`), capturar metadata (rama, commit, working tree) y la **intención** del cambio.
2. **Leer el contexto del sistema:** patrones del repo, capas, convenciones y, si existen, los criterios de aceptación del artefacto origen.
3. **Evaluar las tres dimensiones** con [`references/qualitative-review.md`](references/qualitative-review.md) y emitir hallazgos con severidad, porqué, impacto y sugerencia concreta.
4. **Puerta cualitativa e informe:** presentar los hallazgos bloqueantes y resolver cada uno según `verification.codeReview.confirmFix` (pedir corregir o justificar con `always`; corregir directo con `never`), y rellenar [`assets/code-review-template.md`](assets/code-review-template.md) con el veredicto.
5. **Registro y salida:** escribir siempre `docs/audits/code-review.md` (creando el directorio si no existe) **con la marca de pie del fingerprint y la base** para la próxima comprobación de frescura, más un resumen en el chat. **Excepción:** una revisión acotada (`working-tree` o `scope`) **no** sobrescribe ese archivo —no es el estado vigente de la rama—: va al chat o a `save-report`. **No** hacer commit/push/merge sin instrucción explícita.

---

## Notas

### Relación con otros skills

Usar este skill **solo cuando se le invoca explícitamente** (ni de forma proactiva, ni "por si acaso", ni al detectar que se terminó código):

- **El usuario lo pide explícitamente** — solicita una revisión de código, revisar el diseño antes de PR/merge, o nombra este skill.
- **Otro skill lo invoca explícitamente**, p. ej. `work-integrate` (requiere `APPROVED`, con hallazgos resueltos o justificados, antes de integrar) o `pr-create` (puede invocarlo de forma bloqueante antes de crear el PR).

**Relación con [`quality-check`](../quality-check/SKILL.md):** son skills **hermanos e independientes**, no uno dentro del otro.

| | `quality-check` | `code-review` | `trace-validate` |
|---|---|---|---|
| Pregunta que responde | ¿El código corre y cumple las reglas? | ¿Resuelve el problema correcto y está bien diseñado? | ¿Cada criterio de aceptación está probado? |
| Qué hace | Ejecuta tipado, linter, unit, coverage, build, e2e, sonar y las suites del estándar de testing | Analiza el diff en intención, arquitectura/diseño y feedback | Cruza criterios ↔ casos de prueba ↔ artefactos |
| Artefactos | `docs/audits/quality-check.md`, `.sdd-devkit/test-run.json` | `docs/audits/code-review.md` | `trace-report.md` del trabajo |
| Veredicto | Propio, solo del plano automatizado | Propio, solo del plano cualitativo | Propio, solo de la cobertura funcional |

Este skill **no ejecuta pruebas ni checks** y **no consume** `test-run.json`: si el usuario pide correr algo, redirigirlo a `quality-check`. El orden recomendado en el cierre es `quality-check` → `code-review` → `trace-validate` (revisar diseño sobre un código que ni compila suele ser trabajo perdido; y `trace-validate` va tras `quality-check` para reutilizar su corrida de pruebas), pero es una recomendación del orquestador, no una dependencia dura.

> **Frontera con `trace-validate` — «criterio sin cubrir» significa dos cosas.** Aquí, en la dimensión semántica, un criterio «sin cubrir» es un criterio que **el código no implementa**. En `trace-validate` es un criterio que **ninguna prueba valida**. Son preguntas distintas y ambas bloquean, pero cada una en su skill: **no** emitir aquí un hallazgo 🔴/🟠 porque a un criterio le falte prueba —eso lo reporta `trace-validate`—, ni dar por implementado un criterio porque exista un test. Si al leer el diff se ve una carencia de pruebas, el encuadre correcto aquí es la **calidad** de las pruebas presentes (Mantenibilidad), no la cobertura de criterios.

Es un proceso **posterior a la implementación**: no forma parte de `work-implement` ni del desarrollo de tareas. Sin invocación explícita, no corresponde usarlo.

### Fingerprint canónico de la tubería

Las **tres** puertas del cierre usan el **mismo** fingerprint canónico como clave de frescura, con el mismo nombre de variable (`FINGERPRINT`) y la misma receta —que vive en [`quality-check`](../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate)—, cada una sobre su propio artefacto: `test-run.json` en `quality-check`, `trace-report.md` en `trace-validate` y `docs/audits/code-review.md` aquí. Este skill le añade un segundo componente, el commit de la **rama base**, porque su unidad de trabajo es un diff con dos lados (ver [Reutilización del informe (idempotencia)](#reutilización-del-informe-idempotencia)); el `FINGERPRINT` en sí **no** cambia de definición.

Que la receta excluya **toda carpeta oculta, todo `docs/` y los `trace-report.md` sueltos** es lo que permite que escribir `code-review.md` no desplace la clave de frescura de ninguna de las tres. La contrapartida —que los criterios de aceptación de `docs/specs/` tampoco cuenten— está en [Reutilización del informe (idempotencia)](#reutilización-del-informe-idempotencia).

### Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada:** la salida y los mensajes de error de las herramientas no se traducen; se citan literales.
