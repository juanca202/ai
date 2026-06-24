# Referencia: Flujo de ejecución y manejo de errores

Detalla **cómo** ejecutar el code review paso a paso y cómo actuar ante cada situación. Se carga desde `SKILL.md` al iniciar la ejecución. La semántica de categorías, veredicto y modificadores vive en `SKILL.md`; el detalle por stack en [`stacks.md`](stacks.md); la revisión cualitativa en [`qualitative-review.md`](qualitative-review.md).

## Contenido

1. [Flujo de ejecución](#flujo-de-ejecución)
2. [Manejo de errores](#manejo-de-errores)
3. [Anti-patterns](#anti-patterns)

---

## Flujo de ejecución

> **Principio rector:** dos etapas con puertas. (A) Etapa automatizada → debe quedar **sin FAIL** para avanzar. (B) Revisión cualitativa. **Ninguna corrección se aplica sin autorización explícita del usuario.** Tras aplicar una corrección, primero **verifica que el arreglo funciona** re-ejecutando solo el check o la prueba que fallaba; **únicamente si ese check puntual pasa**, dispara el **reinicio** (de la etapa o del review completo) para re-evaluar sobre el código ya corregido. Si el arreglo no resuelve el fallo, sigue iterando la corrección — no reinicies con algo que aún no funciona. Para ahorrar vueltas, si el usuario autoriza varias correcciones, aplícalas juntas, verifícalas y reinicia **una sola vez**.

### Paso 1 — Detectar entorno

1. Identificar el ecosistema y cargar lo relativo a ese stack desde [`stacks.md`](stacks.md) (categoría por check, comando, parseo). Si no se detecta stack o el monorepo es ambiguo, parar y preguntar.
2. Resolver el comando concreto de cada check (scripts del manifiesto + *fallback* canónico).
3. Capturar metadata: stack detectado, rama (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`), working tree (`git status --porcelain`), y la **intención** del cambio (US/TK, rama, commits) para el Paso 3.

### Paso 2 — Etapa automatizada (puerta dura)

Con `qualitative-only`, saltar este paso. En otro caso, ejecutar **secuencialmente** (no en paralelo) los checks Bloqueantes y Condicionales-con-config-presente, midiendo la duración:

1. **tipado** — solo si Bloqueante (TS) o Condicional con config. Si **FAIL** → **fail-fast**: marcar el resto `— (no ejecutado)` y pasar a la evaluación de la etapa.
2. **linter** — parsear `error` vs `warning` según la herramienta.
3. **unit tests** — comando del stack; *fallback* canónico.
4. **coverage** — PASS/FAIL según la regla del catálogo de checks (`SKILL.md`).
5. **build** — en Java/Go/Rust/.NET cubre la compilación.
6. **e2e** — solo si hay script/tarea/perfil e2e o config Playwright/Cypress.
7. **sonar** — si falta `sonar-project.properties` → `N/A`. Si hay config y red falla → FAIL informativo.

> Al **ejecutar** un check, nunca uses `--fix`, `--write`, `--force` ni equivalentes: falsearían el resultado. La corrección autorizada (abajo) es un paso aparte y deliberado.

**Por qué este orden** — pirámide de tests, criterio *rápido → lento*, *dependencias antes que consumidores*:

1. **Estático** (tipado, linter): barato; el fail-fast del tipado evita ruido en cascada.
2. **Unit + coverage**: mismo estrato; coverage justo después de unit.
3. **Build**: artefacto de integración; en Java/Go/Rust/.NET valida también la compilación.
4. **E2E**: el más lento; suele requerir build previo.
5. **Sonar**: informativo, al final.

**Por qué fail-fast solo en tipado:** en TypeScript, si los tipos no compilan, linter, tests y build fallan masivamente y el ruido no aporta señal. En stacks sin check de tipado separado (Java, Go, .NET), no hay fail-fast: tipado y compilación se validan en **build**.

**Puerta de la etapa automatizada** — evaluar el conjunto de resultados:

- **Hay al menos un FAIL** (Bloqueante o Condicional-presente): **mostrar el reporte de la etapa al usuario** y **preguntar si quiere que se corrijan** los errores. **No corregir sin autorización.**
  - Si **autoriza la corrección automática** → aplicar los cambios mínimos para resolver los FAIL (sin tocar más de lo necesario), **re-ejecutar el check/prueba que fallaba para confirmar que ya pasa**, y solo entonces **re-ejecutar TODO el set automatizado** (reiniciar el Paso 2). Si el check puntual sigue en FAIL, iterar la corrección antes de reiniciar.
  - Si **corrige manualmente** e indica que ya está → **re-ejecutar el check/prueba que fallaba**; si pasa, **re-ejecutar TODO el set automatizado**; si no, avisar y volver a la corrección.
  - Si **no desea corregir ahora** → terminar con veredicto `❌ No apto`. **No** se ejecuta la revisión cualitativa.
  - Repetir hasta que la etapa quede sin FAIL o el usuario detenga.
- **Solo SKIPPED, sin FAIL** (`⚠️ Incompleto`): reportar el motivo y **preguntar** si resolver el tooling primero o continuar a la cualitativa asumiendo el Incompleto. No avanzar en silencio.
- **Sin FAIL ni SKIPPED**: etapa superada → continuar al Paso 3.

> Con `checks-only`, terminar aquí (no hay Paso 3): construir informe y veredicto solo con la etapa automatizada.

### Paso 3 — Revisión cualitativa senior

Ejecutar solo si la etapa automatizada se superó (o si el modo es `qualitative-only`). Ver la sección "Revisión cualitativa (análisis senior)" en `SKILL.md` y el detalle en [`qualitative-review.md`](qualitative-review.md):

1. Obtener el diff bajo revisión (`git diff` contra la rama base acordada, o los archivos que el usuario indique). No revisar todo el repo.
2. Recuperar la **intención** capturada en el Paso 1.
3. Leer [`qualitative-review.md`](qualitative-review.md) y evaluar las tres dimensiones (semántica, arquitectura/diseño, feedback senior).
4. Emitir hallazgos con severidad (🔴/🟠/🟡/💡). Para cada uno: el porqué, el impacto y una mejora concreta.
5. **Puerta cualitativa** — si hay hallazgos bloqueantes (🔴/🟠), **pausar y pedir** al usuario, por cada uno, **corregir** o **justificar** (ver "Severidad y puerta de aceptación" en `SKILL.md`):
   - **Justificar** → registrar la justificación; el hallazgo deja de bloquear.
   - **Corregir con autorización expresa de corrección automática** → aplicar el cambio, **verificar que funciona** re-ejecutando el check/prueba directamente afectado, y solo si pasa **reiniciar TODO el code review desde el Paso 1**.
   - **Corregir manualmente** (el usuario indica que ya lo hizo) → **verificar** re-ejecutando el check/prueba afectado y, si pasa, **reiniciar TODO el code review desde el Paso 1**.
   - Repetir hasta que no queden bloqueantes sin resolver o el usuario detenga. Aplica la **cota de 3 reinicios** (ver [Manejo de errores](#manejo-de-errores)): tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder.

### Paso 4 — Construir informe

Rellenar la plantilla [`../assets/code-review-template.md`](../assets/code-review-template.md) (ver [Formato del informe](#formato-del-informe)):

1. Calcular el veredicto unificado con la tabla de Veredicto (`SKILL.md`): considera Bloqueantes/Condicionales-presentes (las filas `N/A` no cuentan) **y** los hallazgos cualitativos bloqueantes sin resolver.
2. Tabla resumen de checks: una fila por check ejecutado, `SKIPPED` o `N/A`.
3. Sección de revisión cualitativa: hallazgos por dimensión y severidad, con porqué + sugerencia concreta; si no hay hallazgos en una dimensión, decir explícitamente que está conforme.
4. Detalle de checks **solo** para FAIL o `SKIPPED`; truncar a 10 errores por check (`… y N más`).
5. "Próximas acciones": hallazgos cualitativos 🔴/🟠 sin resolver → FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → `SKIPPED` por config ausente/rota → hallazgos 🟡/💡.

### Paso 5 — Registro y salida

Decidir **dónde** queda el informe según el contexto:

- **La revisión corresponde a una historia de usuario** (rama `feature/US-XXX-*` activa, o el usuario referencia una US, o se trabaja bajo `docs/specs/user-stories/US-XXX-*/`): **escribir** `docs/specs/user-stories/US-XXX-[nombre-corto]/code-review.md` rellenando la plantilla [`../assets/code-review-template.md`](../assets/code-review-template.md) (checks + revisión cualitativa + veredicto). Si el usuario dio **justificaciones** para hallazgos de las tres dimensiones, completarlas en la sección "Justificaciones aceptadas". Sobrescribir el archivo en re-ejecuciones (es el estado vigente). Mostrar también un resumen en el chat.
- **La revisión no corresponde a ninguna historia de usuario:** **no** escribir archivo; mostrar el informe completo en el chat. (Salvo que el usuario pase `save-report`, que lo persiste en `docs/code-review/<YYYYMMDD-HHMMSS>.md`.)

### Paso 6 — Presentar resultado

Devolver el informe completo (y la ruta del `code-review.md` si se escribió). **No** continuar con `git commit`, push ni merge aunque el veredicto sea `✅ Apto` — salvo instrucción explícita del usuario.

---

## Formato del informe

La estructura canónica del informe está en la plantilla [`../assets/code-review-template.md`](../assets/code-review-template.md). **Rellénala** (no la reescribas desde cero) para todo informe, tanto el que se muestra en chat como el `code-review.md` que se escribe en la carpeta de una US.

La plantilla incluye: encabezado con metadata y veredicto, **Resumen**, **1. Verificaciones automatizadas** (tabla + detalle de fallidos), **2. Revisión cualitativa (senior)** (intención + las tres dimensiones), **Veredicto** con su justificación de una línea, **Próximas acciones** y **Justificaciones aceptadas**.

Símbolos a usar (exactamente estos):
- Estado de checks: `✅` PASS · `❌` FAIL · `⏭️` SKIPPED · `—` N/A · `ℹ️` informativo (Sonar).
- Severidad cualitativa: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` dimensión conforme.

Reglas al rellenar:
- Sustituir cada `{{…}}` de la plantilla por el valor real; el informe publicado no debe conservar placeholders ni el bloque de comentario inicial.
- Incluir solo las filas de checks que aplican; el detalle de checks va **solo** para FAIL o SKIPPED (truncar a 10 errores por check con `… y N más`).
- Si la etapa automatizada no se superó, la sección 2 dice *"No ejecutada — la etapa automatizada no se superó."*
- Si la revisión cualitativa se omitió por modificador (`checks-only` u `only nombre-del-check`), la sección 2 dice *"No ejecutada — omitida por modificador `checks-only`"* (o *"… `only nombre-del-check`"*) — motivo distinto al fallo de la etapa automatizada.
- Si no hubo justificaciones, la sección final dice «Ninguna».

---

## Manejo de errores

| Situación | Cómo actuar |
|-----------|-------------|
| Stack no detectable | Parar antes de ejecutar nada; preguntar al usuario. |
| Monorepo ambiguo | Parar y preguntar qué módulo auditar. |
| Tipado **Bloqueante** (TS) pero falta `tsconfig.json` | `SKIPPED` → `⚠️ Incompleto`. |
| Tipado **Condicional** (Python/Rust) sin config ni herramienta | `N/A`. No afecta veredicto. |
| Tipado **N/A** para el stack (Java, Go, JS, .NET) | No ejecutar; no listar como `SKIPPED`. |
| Tipado **FAIL** (cuando aplica) | **STOP fail-fast.** Resto `— (no ejecutado)`. |
| Runner/build tool ausente del PATH | Parar y preguntar al usuario. |
| Script/tarea definida pero binario inexistente (config rota) | `❌ FAIL` si el comando se intentó y rompió; `⏭️ SKIPPED` si no se pudo ni invocar. Nunca `N/A`. |
| Unit tests sin script ni comando canónico | `SKIPPED` → `⚠️ Incompleto` (unit es Bloqueante). |
| Coverage sin herramienta configurada | `SKIPPED` → `⚠️ Incompleto` (coverage es Bloqueante). |
| Coverage bajo umbral configurado | `❌ FAIL`. |
| Coverage sin umbrales configurados y exit 0 | `✅ PASS`. |
| E2E **Condicional** con config presente pero tool ausente/rota | `SKIPPED` → `⚠️ Incompleto`. |
| E2E sin config ni script de e2e | `N/A`. No afecta veredicto. |
| Build **N/A** (Python sin empaquetado) | Omitir fila; no afecta veredicto. |
| `sonar-scanner` no disponible o falta `sonar-project.properties` | `N/A`. No afecta veredicto. |
| Sonar con config presente y error de red | FAIL informativo. No bloquea veredicto. |
| Ejecución > 10 min en un check | Continuar; avisar al usuario. |
| Working tree sucio | No bloquear; nota en encabezado. |
| No se puede inferir la intención (sin US/TK, rama genérica, commits opacos) | Pedir al usuario una frase con el objetivo del cambio; no inventar intención. |
| Usuario justifica un hallazgo 🔴/🟠 | Registrar la justificación; el hallazgo deja de bloquear. En una US, incluirla en `code-review.md`. |
| Diff vacío o sin cambios de código | No hay nada que revisar cualitativamente; reportarlo y ejecutar solo los checks aplicables. |
| FAIL en la etapa automatizada | Mostrar reporte y **preguntar** si corregir. Nunca corregir sin autorización. Tras corregir (auto autorizada o manual), **re-ejecutar el check que fallaba**; si pasa, **re-ejecutar todo el set automatizado**. |
| Usuario no quiere corregir los FAIL automatizados | Terminar en `❌ No apto`; **no** ejecutar la revisión cualitativa. |
| Corrección de un hallazgo cualitativo 🔴/🟠 (auto autorizada o manual) | Verificar que funciona (re-ejecutar el check/prueba afectado); solo si pasa, reiniciar **todo el code review desde el Paso 1**. |
| Corrección aplicada que **no** resuelve el fallo (el check puntual sigue en FAIL) | **No reiniciar.** Iterar la corrección hasta que el check puntual pase; recién entonces disparar el reinicio. |
| Usuario pide "corrige tú" sin más contexto | Confirmar el alcance exacto a corregir antes de tocar nada; aplicar solo lo mínimo; luego re-ejecutar. |
| Varias correcciones autorizadas a la vez | Aplicarlas juntas y reiniciar **una sola vez** para no encadenar pasadas innecesarias. |
| Bucle de correcciones que no converge | Tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder. |

---

## Anti-patterns

- Asumir TypeScript/Node si el repo es Java, Python u otro stack.
- Ejecutar `tsc --noEmit` en un proyecto Java — la compilación va en **build**.
- Marcar `⚠️ Incompleto` un check Condicional que simplemente **no aplica** (debe ser `N/A`).
- Marcar `N/A` un check cuya config **sí existe** pero falló al ejecutarse (debe ser `SKIPPED` o `FAIL`).
- **Corregir código sin autorización explícita** del usuario — por defecto solo se audita y propone.
- Usar `--fix` / `--write` / `--force` **al ejecutar un check** (falsea el resultado); la corrección autorizada es un paso aparte y deliberado.
- Modificar manifiestos para añadir scripts faltantes.
- Declarar `✅ Apto` con algún Bloqueante o Condicional-presente en `SKIPPED` — es `⚠️ Incompleto`.
- **Avanzar a la revisión cualitativa con algún FAIL automatizado sin resolver** — la etapa automatizada es puerta dura.
- **Corregir y no volver a ejecutar** las pruebas, o no reiniciar el review tras una corrección cualitativa.
- **Reiniciar el review con un arreglo sin verificar** — primero confirma que el check/prueba que fallaba ya pasa, y solo entonces reinicia.
- Aplicar una corrección **automáticamente sin que el usuario la pida expresamente**.
- Cargar `stacks.md` antes de detectar el ecosistema, o arrastrar a contexto columnas de stacks que no aplican.
- Continuar tras FAIL de tipado cuando aplica fail-fast.
- Contar filas `N/A` para el veredicto.
- Truncar errores sin `… y N más`.
- Ejecutar checks en paralelo salvo petición explícita.
- Instalar dependencias — reportar `SKIPPED` y dejar al usuario.
- Continuar a commit/push/merge tras `✅ Apto` sin instrucción explícita.
- **Comportarse como una herramienta de CI:** entregar solo la tabla de checks y omitir la revisión cualitativa.
- **Solo reportar violaciones de reglas** sin razonar sobre la intención del diseño ni el impacto en el sistema.
- Dar un hallazgo sin explicar el **porqué** o sin **sugerencia concreta** (un "esto está mal" pelado no es feedback senior).
- Marcar 🔴/🟠 algo que es 🟡/💡 (inflar severidad) o al revés (minimizar un defecto real de diseño).
- Declarar `✅ Apto` con un hallazgo bloqueante sin corregir **ni** justificar.
- Aceptar una justificación y **no registrarla** en el `code-review.md` de la US.
- Escribir `code-review.md` fuera de la carpeta de la US, o no escribirlo estando dentro de una US.
- Revisar todo el repo en lugar del diff bajo revisión.
