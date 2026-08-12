---
name: code-review
description: >-
  Revisión cualitativa de código estilo ingeniero senior sobre el diff de una rama contra su base, incluido lo no commiteado: intención (¿resuelve el problema pedido?), arquitectura y diseño según ISO/IEC 25010 (SOLID, Clean Architecture, acoplamiento, duplicación, fiabilidad, seguridad, desempeño) y feedback accionable que explica el PORQUÉ y propone cambios. Devuelve hallazgos con severidad, veredicto (aprobado/rechazado/incompleto) y próximas acciones. No exige artefactos de este plugin: la intención puede venir de una US-XXX/WI-XXX/FT-XXX, de un ticket o spec externo, o de la rama y sus commits. Activar cuando el usuario pida "revisa este código", "code review", "revisión de código", "¿está bien resuelto esto?", "revisa el diseño antes del PR/merge", "revisa lo que llevo antes de commitear", o cuando lo invoque otro skill (work-integrate, pr-create). Proceso de cierre, no proactivo. NO ejecuta pruebas, linter ni build — eso es de quality-check. Nunca corrige sin autorización.
license: MIT
---

# Skill: Revisión de código (cualitativa)

Revisar el **diff** de una implementación como lo haría un **ingeniero senior** revisando el PR de un compañero: razonar sobre la **intención** del cambio, su **diseño y arquitectura**, y entregar **feedback accionable**.

> **NO te comportes como una herramienta de CI.** Aquí no se ejecutan pruebas, linter, tipado ni build. Ese plano —el de «¿el código corre y cumple las reglas?»— pertenece al skill **[`quality-check`](../quality-check/SKILL.md)**. Este skill responde la otra mitad: **¿resuelve el problema correcto, está bien diseñado y será mantenible?**
>
> **Skills independientes.** Las tres puertas del cierre —`quality-check`, `code-review` y `trace-validate`— son **hermanas**: ninguna condiciona el veredicto de otra; cada una emite el suyo y escribe su propio informe. Quien las encadena es el orquestador de cierre (`work-integrate`, `pr-create`). Ver [Relación con otros skills](#relación-con-otros-skills).
>
> **Alcance:** analiza, razona y **propone**. **Nunca corrige por iniciativa propia**; aplica correcciones **solo si el usuario lo autoriza explícitamente**. No hace commit/push/merge sin instrucción explícita.
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
| [`references/execution.md`](references/execution.md) | Flujo de ejecución paso a paso (Pasos 1–5), formato del informe, manejo de errores y anti-patterns. | Al **iniciar** la ejecución de la revisión y ante cualquier situación atípica. |
| [`references/qualitative-review.md`](references/qualitative-review.md) | Detalle de las tres dimensiones, modelo ISO/IEC 25010, calibración de severidad y ejemplos de buen/mal feedback. | En el Paso 3, antes de redactar hallazgos. |
| [`assets/code-review-template.md`](assets/code-review-template.md) | Plantilla canónica del informe. | En el Paso 4, para rellenar el informe. |

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
| **Artefacto del plugin** | `US-XXX` / `WI-XXX` / `FT-XXX` derivado del prefijo de rama + ID (`feature/US-042-…`, `fix/WI-007-…`, `test/FT-003-…`); leer su `README.md` y sus criterios de aceptación. |
| **Cualquier otro documento de especificación** | La ruta o nombre que indique el usuario, o el que la rama/PR referencie: un spec suelto en el repo, un documento de otra herramienta o formato. Leerlo completo antes de revisar. |
| **Ticket de un tracker externo** | El ID en la rama, el commit o el título del PR (`PROJ-1234`). Si el contenido no es accesible desde aquí, **pedírselo al usuario**; no inventarlo. |
| **Sin documento** | Deducirla de la rama, los mensajes de commit y la descripción del PR. Es una base más débil: decirlo en el informe. |

Reglas:

- **La ausencia de artefacto no bloquea la revisión.** Las dimensiones 2 y 3 (arquitectura/diseño y feedback) se evalúan igual sobre cualquier diff, en cualquier repo, sin `docs/specs/` ni convención de ramas.
- **Sí condiciona la dimensión 1.** Si la intención no es determinable y el usuario no la aporta, no inventarla ni inferirla del propio código —eso es circular, el código siempre "cumple" consigo mismo—: marcar esa dimensión como no evaluada y emitir **`⚠️ Incompleto`**.
- **Los criterios se citan verbatim.** Sea cual sea el formato del identificador (`AC-012`, `1.3`, `R-3`, `CA-07`), se usa **tal como está escrito** en el artefacto, sin normalizar — mismo contrato que `test-define` y `trace-validate`.
- **Qué está probado no es asunto de este skill.** La cobertura criterio a criterio la valida `trace-validate`; aquí los criterios sirven solo para juzgar si el cambio resuelve el problema pedido.

---

## Severidad y veredicto

Clasifica cada hallazgo. Solo los dos primeros niveles **bloquean**.

| Severidad | Qué califica | Efecto en veredicto |
|-----------|--------------|---------------------|
| 🔴 **Crítico** | Desajuste intención↔implementación, violación grave de límites arquitectónicos, acoplamiento que impide el cambio, vulnerabilidad explotable, defecto de diseño que romperá el sistema o lo desvía del objetivo. | **Bloquea** salvo justificación aceptada. |
| 🟠 **Mayor** | Violación SOLID con impacto real, duplicación significativa, abstracción innecesaria costosa, divergencia fuerte de los patrones del proyecto, cambio de contrato sin versionar. | **Bloquea** salvo justificación aceptada. |
| 🟡 **Menor** | Mejoras recomendables sin riesgo sistémico (naming, legibilidad, duplicación pequeña). | No bloquea. |
| 💡 **Sugerencia** | Ideas opcionales, alternativas de estilo. | No bloquea. |

### Veredicto

| Veredicto | Condición exacta |
|-----------|------------------|
| `✅ Aprobado` | **Cero** hallazgos bloqueantes (🔴/🟠) sin resolver — corregidos o justificados-y-aceptados. Hallazgos 🟡/💡 en cualquier estado. |
| `❌ Rechazado` | **Al menos un** hallazgo 🔴/🟠 sin corregir ni justificar. |
| `⚠️ Incompleto` | Sin bloqueantes pendientes, pero **alguna dimensión no pudo evaluarse** (p. ej. la intención no es determinable y el usuario no la aportó, o parte del diff es inaccesible/generado y no se pudo revisar). |

Precedencia: `❌ Rechazado` > `⚠️ Incompleto` > `✅ Aprobado`.

> **Este veredicto cubre solo el plano cualitativo.** El del plano automatizado lo emite `quality-check` y el de la cobertura funcional `trace-validate`, cada uno por separado: el cierre exige **las tres** puertas en aprobado. Un `✅ Aprobado` aquí **no** dice nada sobre si las pruebas pasan ni sobre si cada criterio está cubierto.
>
> **Ojo con el símbolo `⚠️` en el cierre:** aquí (y en `quality-check`) `⚠️ Incompleto` **bloquea**; en `trace-validate`, `⚠️ Aprobado con observaciones` **no bloquea**. Mismo símbolo, efecto de compuerta opuesto.

**Ante un hallazgo bloqueante (🔴/🟠), siempre se ofrecen DOS caminos al usuario:**

1. **Corregir** — el skill presenta el cambio sugerido. Sea corrección automática autorizada o manual del usuario, tras aplicarla se **reinicia la revisión desde el Paso 1** sobre el diff ya corregido. Si la corrección toca lógica cubierta por pruebas, **sugerir** re-ejecutar `quality-check`; no ejecutarlo desde aquí.
2. **Justificar** — el usuario explica por qué el estado actual es aceptable; si se acepta, el hallazgo deja de bloquear y la justificación **se registra** en el informe (queda trazado quién aceptó el estado actual y por qué).

> El skill **nunca** corrige sin que el usuario lo pida expresamente. Si no autoriza ni justifica, el hallazgo sigue bloqueando.

Mientras haya hallazgos bloqueantes sin resolver, el veredicto es `❌ Rechazado`. Tras presentarlos, **pausa y pide al usuario** elegir corregir o justificar cada uno antes de finalizar.

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
| `save-report` | **Además** del informe vigente `docs/audits/code-review.md`, guardar una copia con marca de tiempo en `docs/audits/code-review-<YYYYMMDD-HHMMSS>.md`. En una revisión acotada (`working-tree`/`scope`) es el **único** destino en disco: ahí no se escribe el informe vigente. |

> Los modificadores de la etapa automatizada (`no-tests`, `no-e2e`, `only <check>`, `tests-only`, `include-linter-warnings`…) **no pertenecen a este skill**: viven en [`quality-check`](../quality-check/SKILL.md). Si el usuario los pide aquí, redirigirlo a ese skill.
>
> **`blocking-only` existe en ambos skills con efectos distintos:** aquí filtra el **informe** (solo 🔴/🟠); en `quality-check` omite los checks **informativos** (Sonar). Misma intención —quitar el ruido que no bloquea—, alcance distinto.

---

## Flujo de ejecución (resumen)

**Ninguna corrección se aplica sin autorización explícita del usuario**; tras corregir, se reinicia la revisión. El detalle paso a paso, el formato del informe, el manejo de errores y los anti-patterns están en **[`references/execution.md`](references/execution.md)** — léelo al iniciar la ejecución.

1. **Delimitar la revisión:** resolver el diff (rama base o `scope`), capturar metadata (rama, commit, working tree) y la **intención** del cambio.
2. **Leer el contexto del sistema:** patrones del repo, capas, convenciones y, si existen, los criterios de aceptación del artefacto origen.
3. **Evaluar las tres dimensiones** con [`references/qualitative-review.md`](references/qualitative-review.md) y emitir hallazgos con severidad, porqué, impacto y sugerencia concreta.
4. **Puerta cualitativa e informe:** presentar los hallazgos bloqueantes, pedir corregir o justificar, y rellenar [`assets/code-review-template.md`](assets/code-review-template.md) con el veredicto.
5. **Registro y salida:** escribir siempre `docs/audits/code-review.md` (creando el directorio si no existe), más un resumen en el chat. **Excepción:** una revisión acotada (`working-tree` o `scope`) **no** sobrescribe ese archivo —no es el estado vigente de la rama—: va al chat o a `save-report`. **No** hacer commit/push/merge sin instrucción explícita.

---

## Notas

### Relación con otros skills

Usar este skill **solo cuando se le invoca explícitamente** (ni de forma proactiva, ni "por si acaso", ni al detectar que se terminó código):

- **El usuario lo pide explícitamente** — solicita una revisión de código, revisar el diseño antes de PR/merge, o nombra este skill.
- **Otro skill lo invoca explícitamente**, p. ej. `work-integrate` (requiere `✅ Aprobado`, con hallazgos resueltos o justificados, antes de integrar) o `pr-create` (puede invocarlo de forma bloqueante antes de crear el PR).

**Relación con [`quality-check`](../quality-check/SKILL.md):** son skills **hermanos e independientes**, no uno dentro del otro.

| | `quality-check` | `code-review` | `trace-validate` |
|---|---|---|---|
| Pregunta que responde | ¿El código corre y cumple las reglas? | ¿Resuelve el problema correcto y está bien diseñado? | ¿Cada criterio de aceptación está probado? |
| Qué hace | Ejecuta tipado, linter, unit, coverage, integración, build, e2e, sonar | Analiza el diff en intención, arquitectura/diseño y feedback | Cruza criterios ↔ casos de prueba ↔ artefactos |
| Artefactos | `docs/audits/quality-check.md`, `.sdd-devkit/test-run.json` | `docs/audits/code-review.md` | `trace-report.md` del trabajo |
| Veredicto | Propio, solo del plano automatizado | Propio, solo del plano cualitativo | Propio, solo de la cobertura funcional |

Este skill **no ejecuta pruebas ni checks** y **no consume** `test-run.json`: si el usuario pide correr algo, redirigirlo a `quality-check`. El orden recomendado en el cierre es `quality-check` → `code-review` → `trace-validate` (revisar diseño sobre un código que ni compila suele ser trabajo perdido; y `trace-validate` va tras `quality-check` para reutilizar su corrida de pruebas), pero es una recomendación del orquestador, no una dependencia dura.

> **Frontera con `trace-validate` — «criterio sin cubrir» significa dos cosas.** Aquí, en la dimensión semántica, un criterio «sin cubrir» es un criterio que **el código no implementa**. En `trace-validate` es un criterio que **ninguna prueba valida**. Son preguntas distintas y ambas bloquean, pero cada una en su skill: **no** emitir aquí un hallazgo 🔴/🟠 porque a un criterio le falte prueba —eso lo reporta `trace-validate`—, ni dar por implementado un criterio porque exista un test. Si al leer el diff se ve una carencia de pruebas, el encuadre correcto aquí es la **calidad** de las pruebas presentes (Mantenibilidad), no la cobertura de criterios.

Es un proceso **posterior a la implementación**: no forma parte de `work-implement` ni del desarrollo de tareas. Sin invocación explícita, no corresponde usarlo.

### Fingerprint canónico de la tubería

Cuando este skill escribe `docs/audits/code-review.md`, ese archivo forma parte de los **artefactos generados** que el fingerprint canónico de la tubería excluye —todo `docs/audits/`, todo `.sdd-devkit/` y los `trace-report.md`—, para que escribirlos no desplace la clave de frescura compartida con `quality-check` y `trace-validate`. La receta exacta vive en [`quality-check`](../quality-check/SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate).

### Resolución de idioma

El idioma del informe se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

Los mensajes de error de las herramientas no se traducen.
