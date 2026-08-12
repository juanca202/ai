# Referencia: Flujo de ejecución y manejo de errores

Detalla **cómo** ejecutar las verificaciones automatizadas paso a paso y cómo actuar ante cada situación. Se carga desde `SKILL.md` al iniciar la ejecución. La semántica de categorías, veredicto y modificadores vive en `SKILL.md`; el detalle por stack en [`stacks.md`](stacks.md).

## Contenido

1. [Flujo de ejecución](#flujo-de-ejecución)
2. [Formato del informe](#formato-del-informe)
3. [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas)
4. [Manejo de errores](#manejo-de-errores)
5. [Anti-patterns](#anti-patterns)

---

## Flujo de ejecución

> **Principio rector:** ejecutar, reportar y **proponer**. **Ninguna corrección se aplica sin autorización explícita del usuario.** Tras aplicar una corrección, primero **verifica que el arreglo funciona** re-ejecutando solo el check o la prueba que fallaba; **únicamente si ese check puntual pasa**, dispara el **reinicio** de la corrida completa para re-evaluar sobre el código ya corregido. Si el arreglo no resuelve el fallo, sigue iterando la corrección — no reinicies con algo que aún no funciona. Para ahorrar vueltas, si el usuario autoriza varias correcciones, aplícalas juntas, verifícalas y reinicia **una sola vez**.

### Paso 1 — Detectar entorno

1. Identificar el ecosistema y cargar lo relativo a ese stack desde [`stacks.md`](stacks.md) (categoría por check, comando, parseo). Si no se detecta stack o el monorepo es ambiguo, parar y preguntar.
2. Resolver el comando concreto de cada check (scripts del manifiesto + *fallback* canónico).
3. Capturar metadata: stack detectado, rama (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`) y working tree (`git status --porcelain`).
4. Calcular el **fingerprint canónico del estado del código** (recipe exacto en [`SKILL.md` → Caché de corrida de pruebas](../SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate); es el mismo que usan `code-review` y `trace-validate`). Clave de frescura de la caché de pruebas (ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas)).

### Paso 2 — Ejecutar los checks

**Con `tests-only`** (objetivo de delegación de `trace-validate`): ejecutar únicamente los checks de
**pruebas** (unit, coverage, integración y e2e; build solo si es prerrequisito de e2e), omitiendo
tipado, linter y sonar. Antes de ejecutar, comprobar la **caché**: si existe `.sdd-devkit/test-run.json`
con `git.fingerprint` == `FINGERPRINT` (Paso 1), **reutilizar** esos resultados sin
re-ejecutar y saltar a la salida. Si no hay caché o está obsoleta, ejecutar las suites, **escribir/
actualizar `test-run.json`** (ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas)) y devolver
los resultados por suite. **`tests-only` es no interactivo:** no hace ninguna de las preguntas del Paso 3 —ni la de corregir un FAIL ni la de resolver el tooling ante un SKIPPED—, no emite veredicto y no escribe `quality-check.md`; su único artefacto es `test-run.json`. Las suites en FAIL se devuelven como tales.

En otro caso, ejecutar **secuencialmente** (no en paralelo) los checks Bloqueantes y Condicionales-con-config-presente, midiendo la duración:

1. **tipado** — solo si Bloqueante (TS) o Condicional con config. Si **FAIL** → **fail-fast**: marcar el resto `⏸️ No ejecutado (fail-fast)` y pasar a la evaluación. **No** marcarlos `N/A` (sí correspondían) ni `SKIPPED` (no hay problema de tooling).
2. **linter** — parsear `error` vs `warning` según la herramienta.
3. **unit tests** — comando del stack; *fallback* canónico.
4. **coverage** — PASS/FAIL según la regla del catálogo de checks (`SKILL.md`). Sin ninguna herramienta ni config de cobertura en el repo → `N/A` con nota en Próximas acciones, no `SKIPPED`.
5. **integración** — solo si el repo distingue una suite separada de la unitaria (script `test:it`/`test:integration`, perfil Failsafe, tarea o carpeta dedicada). Si no la distingue → `N/A`; no inventarla ni contar la suite unitaria como integración.
6. **build** — en Java/Go/Rust/.NET cubre la compilación.
7. **e2e** — solo si hay script/tarea/perfil e2e o config Playwright/Cypress.
8. **sonar** — si falta `sonar-project.properties` → `N/A`. Si hay config y red falla → FAIL informativo.

> Al **ejecutar** un check, nunca uses `--fix`, `--write`, `--force` ni equivalentes: falsearían el resultado. La corrección autorizada (abajo) es un paso aparte y deliberado.

**Por qué este orden** — pirámide de tests, criterio *rápido → lento*, *dependencias antes que consumidores*:

1. **Estático** (tipado, linter): barato; el fail-fast del tipado evita ruido en cascada.
2. **Unit + coverage**: mismo estrato; coverage justo después de unit.
3. **Integración**: por encima de unit, por debajo de e2e; solo si el repo la distingue.
4. **Build**: artefacto de integración; en Java/Go/Rust/.NET valida también la compilación.
5. **E2E**: el más lento; suele requerir build previo.
6. **Sonar**: informativo, al final.

**Por qué fail-fast solo en tipado:** en TypeScript, si los tipos no compilan, linter, tests y build fallan masivamente y el ruido no aporta señal. En stacks sin check de tipado separado (Java, Go, .NET), no hay fail-fast: tipado y compilación se validan en **build**.

### Paso 3 — Evaluar el resultado

- **Hay al menos un FAIL** (Bloqueante o Condicional-presente): **mostrar el reporte completo al usuario** y **preguntar qué hacer**. **No corregir sin autorización**, y **no dar por hecho que hay que corregir**.
  - **Cómo preguntar** (ver [Corrección de fallos](../SKILL.md#corrección-de-fallos)): si la corrida está **dentro de una implementación** (hay un trabajo en curso al que atribuir la rama: `US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin (ticket, spec suelto, doc de otra herramienta)), preguntar si se corrigen los fallos. Si está **fuera de una implementación** (rama suelta sin artefacto de ningún tipo, auditoría, revisión puntual), ofrecer explícitamente las dos salidas: **[Corregir los hallazgos]** / **[Solo el informe, detener aquí]**.
  - Si el usuario elige **solo el informe** → ir al Paso 4 con el veredicto que corresponda y **terminar**: no tocar código, no reiniciar la corrida, no volver a ofrecer la corrección. Dejar lo pendiente en Próximas acciones.
  - Si **autoriza la corrección** → resolver **quién la aplica** según [Corrección de fallos](../SKILL.md#corrección-de-fallos): si la rama tiene un artefacto identificable (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin — ticket, spec suelto, doc de otra herramienta), **delegar en `work-implement`** sobre ese artefacto, pasándole el check fallido, el comando, la salida de error y los archivos implicados; solo si no hay artefacto de ningún tipo, aplicar aquí los cambios mínimos (sin tocar más de lo necesario). En ambos casos: **re-ejecutar el check/prueba que fallaba para confirmar que ya pasa**, **recalcular el `FINGERPRINT`** y solo entonces **re-ejecutar TODA la corrida** (reiniciar el Paso 2). Si el check puntual sigue en FAIL, iterar la corrección antes de reiniciar. **Excepción — si `work-implement` devuelve «corrección no aplicada»** (escalado a `work-plan`/`test-define`, o fallo preexistente): no reintentar ni corregir aquí, no reiniciar la corrida — pasar al informe con el motivo y emitir `❌ Rechazado`.
  - Si **corrige manualmente** e indica que ya está → **re-ejecutar el check/prueba que fallaba**; si pasa, **recalcular el `FINGERPRINT`** y **re-ejecutar TODA la corrida**; si no, avisar y volver a la corrección.
  - Si **no desea corregir ahora** → continuar al informe con veredicto `❌ Rechazado`, dejando registrado qué falló y qué falta para llegar a Aprobado.
  - Repetir el ciclo de corrección hasta quedar sin FAIL, hasta que el usuario detenga, o hasta que `work-implement` devuelva **«corrección no aplicada»** — ese resultado cierra el ciclo, no lo reinicia.
- **Solo SKIPPED, sin FAIL** (`⚠️ Incompleto`): reportar el motivo y **preguntar** si resolver el tooling primero o cerrar asumiendo el Incompleto. No avanzar en silencio. **En `tests-only` no se pregunta:** devolver las suites con su `result` (incluidos los `SKIPPED`) y terminar.
- **Sin FAIL ni SKIPPED**: `✅ Aprobado`.

> Aplica la **cota de 3 reinicios** (ver [Manejo de errores](#manejo-de-errores)): tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder.

### Paso 4 — Construir informe

Rellenar la plantilla [`../assets/quality-check-template.md`](../assets/quality-check-template.md) (ver [Formato del informe](#formato-del-informe)):

1. Calcular el veredicto con la tabla de Veredicto (`SKILL.md`): considera Bloqueantes/Condicionales-presentes (las filas `N/A` no cuentan).
2. Tabla resumen de checks: una fila por check ejecutado, `SKIPPED`, `N/A` o `⏸️` (no ejecutado por fail-fast).
3. Detalle de checks **solo** para FAIL o `SKIPPED`; truncar a 10 errores por check (`… y N más`).
4. "Próximas acciones": FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → `SKIPPED` por config ausente/rota.

### Paso 5 — Registro y salida

Decidir **dónde** queda el informe según el contexto. La corrida es **completa** sobre la rama,
no de una unidad, así que su informe reside en una **ubicación fija**, no en la carpeta de la US/WI:

- **Informe vigente de la rama:** **escribir siempre** `docs/audits/quality-check.md` rellenando la plantilla [`../assets/quality-check-template.md`](../assets/quality-check-template.md), sin importar desde qué `US`/`WI` se invocó ni si el repo es spec-driven. Crear `docs/audits/` si no existe. **Sobrescribir** en re-ejecuciones: representa el estado vigente de la rama, no un histórico. Mostrar también un resumen en el chat.
- **`save-report`:** además del informe vigente, guardar una copia con marca de tiempo en `docs/audits/quality-check-<YYYYMMDD-HHMMSS>.md`. Es el modo para conservar histórico puntual; **no** sustituye ni omite el `quality-check.md` vigente.

**Escribir la caché de corrida de pruebas.** Si en esta corrida **se ejecutaron los checks de pruebas**
(unit/coverage/integración/e2e — es decir, cualquier modo salvo `no-tests` o un `only <check>` que no sea de pruebas),
escribir/actualizar `.sdd-devkit/test-run.json` en la **raíz del repo** con el `FINGERPRINT` **vigente** (el del Paso 1 si no hubo correcciones; el recalculado tras la última corrección si las hubo) y el resultado por suite. Crear `.sdd-devkit/` si no existe. Ver
[Caché de corrida de pruebas](#caché-de-corrida-de-pruebas). En modo `tests-only` este es el artefacto de salida.

Devolver el informe completo y la ruta del `quality-check.md` escrito (en `tests-only` no hay informe: devolver los resultados por suite y la ruta de `test-run.json`). **No** continuar con `git commit`, push ni merge aunque el veredicto sea `✅ Aprobado` — salvo instrucción explícita del usuario. Si el cierre requiere también la revisión cualitativa, **sugerir** invocar `code-review`; no ejecutarlo desde aquí.

---

## Formato del informe

La estructura canónica del informe está en la plantilla [`../assets/quality-check-template.md`](../assets/quality-check-template.md). **Rellénala** (no la reescribas desde cero) para todo informe, tanto el resumen que se muestra en chat como el `docs/audits/quality-check.md` que se escribe siempre.

La plantilla incluye: encabezado con metadata (donde vive el **Veredicto**, con su justificación de una línea; no hay sección propia), **Resumen**, **Verificaciones** (tabla + detalle de fallidos) y **Próximas acciones**.

Símbolos a usar (exactamente estos): `✅` PASS · `❌` FAIL · `⏭️` SKIPPED · `⏸️` no ejecutado por fail-fast · `—` N/A · `ℹ️` informativo (Sonar).

Reglas al rellenar:
- Sustituir cada `{{…}}` de la plantilla por el valor real; el informe publicado no debe conservar placeholders ni el bloque de comentario inicial.
- Incluir solo las filas de checks que aplican; el detalle de checks va **solo** para FAIL o SKIPPED (truncar a 10 errores por check con `… y N más`).

---

## Caché de corrida de pruebas

Artefacto reutilizable que evita que `trace-validate` vuelva a ejecutar las pruebas. La semántica y el
esquema están en `SKILL.md` ([Caché de corrida de pruebas](../SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate)); aquí, lo operativo.

**Cuándo se escribe.** Al final de toda corrida que ejecutó los checks de pruebas (Paso 5), sea o no
spec-driven el repo. Ruta **fija**: `.sdd-devkit/test-run.json` en la **raíz del repositorio**, no por
unidad y fuera de `docs/` (es un artefacto de máquina, no documentación). Se **sobrescribe** en cada
corrida (es el estado vigente de la rama) y **se versiona**, para que viaje en el PR. Crear `.sdd-devkit/`
si no existe; comprobar de paso que el `.gitignore` del repo no lo excluya (si lo hace, avisar: la caché no
viajaría en el PR). Solo si el usuario pide explícitamente no crear el directorio, devolver los resultados
en la respuesta y advertir que no habrá reutilización entre corridas. Ver [Caché de corrida de pruebas](../SKILL.md#caché-de-corrida-de-pruebas-compartida-con-trace-validate).

**Qué se guarda.** El `FINGERPRINT` vigente en `git.fingerprint`, más **las cuatro** entradas de suite
(`unit`, `coverage`, `integration`, `e2e`) con su `command`, `result` (`PASS`/`FAIL`/`SKIPPED`/`N/A`) y un
`summary` corto — el esquema completo y la semántica de cada campo están en `SKILL.md`. Mapeo check → suite:
`unit tests` → `unit`, `coverage` → `coverage`, `integración` → `integration`, `e2e` → `e2e`. Un check que el
repo no tiene se emite igual, con `result: "N/A"`: se emiten siempre las cuatro entradas para que el
consumidor no tenga que distinguir «ausente» de «no aplica». No inventar suites que el repo no tiene.

**Cómo se reutiliza (`tests-only`).** Recalcular el `FINGERPRINT` (Paso 1) y compararlo con
`git.fingerprint` del `test-run.json` existente:
- **Coincide** → caché **fresca**: devolver esos resultados sin ejecutar nada. Es el camino que hace que,
  si no hubo cambios desde la última corrida de pruebas, no se repita el trabajo.
- **Diferente o no existe** → caché **obsoleta/ausente**: ejecutar las suites, sobrescribir `test-run.json`
  y devolver los nuevos resultados.

**Validez.** El fingerprint canónico (recipe en `SKILL.md`) cubre código, specs y tests, y excluye los
artefactos generados; no detecta la edición de **contenido** de un archivo que permanezca sin
trackear, ni cambios de entorno (dependencias instaladas, red, servicios) — si el resultado pudiera
depender de eso, tratar la caché como no concluyente. Si el árbol
estaba sucio, `workingTreeClean: false` queda registrado como señal para el consumidor.

---

## Manejo de errores

| Situación | Cómo actuar |
|-----------|-------------|
| Stack no detectable | Parar antes de ejecutar nada; preguntar al usuario. |
| Monorepo ambiguo | Parar y preguntar qué módulo auditar. |
| Tipado **Bloqueante** (TS) pero falta `tsconfig.json` | `SKIPPED` → `⚠️ Incompleto`. |
| Tipado **Condicional** (Python/Rust) sin config ni herramienta | `N/A`. No afecta veredicto. |
| Tipado **N/A** para el stack (Java, Go, JS, .NET) | No ejecutar; no listar como `SKIPPED`. |
| Tipado **FAIL** (cuando aplica) | **STOP fail-fast.** Resto `⏸️ No ejecutado (fail-fast)` — ni `N/A` ni `SKIPPED`. |
| Runner/build tool ausente del PATH | Parar y preguntar al usuario. |
| Script/tarea definida pero binario inexistente (config rota) | `❌ FAIL` si el comando se intentó y rompió; `⏭️ SKIPPED` si no se pudo ni invocar. Nunca `N/A`. |
| Unit tests sin script ni comando canónico | `SKIPPED` → `⚠️ Incompleto` (unit es Bloqueante). |
| Coverage con config o herramienta presente pero que no se pudo ejecutar | `SKIPPED` → `⚠️ Incompleto` (coverage es Bloqueante). |
| Coverage sin herramienta **ni** configuración alguna en el repo | `N/A` + recomendación en Próximas acciones. No condenar el veredicto a `⚠️ Incompleto` permanente por un check que el proyecto nunca declaró. |
| Suite de integración no distinguible de la unitaria | `N/A`. No contar la suite unitaria como integración ni inventar un comando. |
| Coverage bajo umbral configurado | `❌ FAIL`. |
| Coverage sin umbrales configurados y exit 0 | `✅ PASS`. |
| E2E **Condicional** con config presente pero tool ausente/rota | `SKIPPED` → `⚠️ Incompleto`. |
| E2E sin config ni script de e2e | `N/A`. No afecta veredicto. |
| Build **N/A** (Python sin empaquetado) | Omitir fila; no afecta veredicto. |
| `sonar-scanner` no disponible o falta `sonar-project.properties` | `N/A`. No afecta veredicto. |
| Sonar con config presente y error de red | FAIL informativo. No bloquea veredicto. |
| Ejecución > 10 min en un check | Continuar; avisar al usuario. |
| Working tree sucio | No bloquear; nota en encabezado. |
| FAIL en algún check | Mostrar reporte y **preguntar** si corregir. Nunca corregir sin autorización. Con autorización, delegar en `work-implement` si hay un artefacto en curso (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin); si no hay ninguno, corregir aquí. Tras corregir, **re-ejecutar el check que fallaba**; si pasa, **recalcular el fingerprint** y **re-ejecutar toda la corrida**. |
| Autorización de corrección pero el artefacto de trabajo es ambiguo (varios candidatos) | Preguntar cuál antes de delegar; no delegar sobre un artefacto adivinado. |
| FAIL o SKIPPED durante una corrida `tests-only` | **No preguntar nada** — el modo es no interactivo: devolver los resultados por suite (con su `result`) y la ruta de `test-run.json`. Corregir o resolver el tooling es decisión del flujo que invocó. |
| Usuario no quiere corregir los FAIL, o pide solo el informe | Cerrar en `❌ Rechazado` con el detalle de lo pendiente en Próximas acciones; no maquillar el veredicto ni volver a insistir con la corrección. |
| Corrida **fuera de una implementación** (rama sin artefacto derivable) con hallazgos que exigen tocar código | Preguntar explícitamente **[Corregir]** / **[Solo el informe]** antes de nada. Entregar solo el informe es un resultado legítimo, no un flujo incompleto. |
| El usuario acota qué corregir («el linter sí, el test no») | Respetarlo: corregir solo lo autorizado y tratar el resto como *solo informe*, dejándolo en Próximas acciones. |
| Corrección aplicada que **no** resuelve el fallo (el check puntual sigue en FAIL) | **No reiniciar.** Iterar la corrección hasta que el check puntual pase; recién entonces disparar el reinicio. |
| `work-implement` devuelve **«corrección no aplicada»** (fuera de alcance → `work-plan`; discrepancia `TC-XXX`↔código → `test-define`; fallo preexistente) | **Detener el ciclo.** No reintentar la delegación sobre ese fallo ni corregirlo aquí. Recoger el motivo y el skill escalado en **Próximas acciones**, emitir `❌ Rechazado` y terminar. Ver [Corrección de fallos](../SKILL.md#corrección-de-fallos). |
| Usuario pide "corrige tú" sin más contexto | Confirmar el alcance exacto a corregir antes de tocar nada; resolver quién corrige según [Corrección de fallos](../SKILL.md#corrección-de-fallos); aplicar solo lo mínimo; luego re-ejecutar. |
| Varias correcciones autorizadas a la vez | Aplicarlas juntas y reiniciar **una sola vez** para no encadenar pasadas innecesarias. |
| Bucle de correcciones que no converge | Tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder. |
| El usuario pide además opinión sobre el diseño del código | Fuera de alcance: sugerir invocar `code-review`. No improvisar una revisión cualitativa aquí. |

---

## Anti-patterns

- Asumir TypeScript/Node si el repo es Java, Python u otro stack.
- Ejecutar `tsc --noEmit` en un proyecto Java — la compilación va en **build**.
- Marcar `⚠️ Incompleto` un check Condicional que simplemente **no aplica** (debe ser `N/A`).
- Marcar `N/A` un check cuya config **sí existe** pero falló al ejecutarse (debe ser `SKIPPED` o `FAIL`).
- **Corregir código sin autorización explícita** del usuario — por defecto solo se ejecuta y se reporta.
- **Dar por hecho que el usuario quiere corregir** cuando la corrida ocurre fuera de un ciclo de implementación: ahí hay que ofrecer explícitamente la salida «solo el informe».
- Insistir con la corrección después de que el usuario haya pedido solo el informe.
- Usar `--fix` / `--write` / `--force` **al ejecutar un check** (falsea el resultado); la corrección autorizada es un paso aparte y deliberado.
- Modificar manifiestos para añadir scripts faltantes.
- Declarar `✅ Aprobado` con algún Bloqueante o Condicional-presente en `SKIPPED` — es `⚠️ Incompleto`.
- **Corregir y no volver a ejecutar** los checks.
- **Reiniciar la corrida con un arreglo sin verificar** — primero confirma que el check que fallaba ya pasa.
- Cargar `stacks.md` antes de detectar el ecosistema, o arrastrar a contexto columnas de stacks que no aplican.
- Continuar tras FAIL de tipado cuando aplica fail-fast.
- Contar filas `N/A` para el veredicto.
- Truncar errores sin `… y N más`.
- Ejecutar checks en paralelo salvo petición explícita.
- Instalar dependencias — reportar `SKIPPED` y dejar al usuario.
- **Corregir código directamente cuando hay un artefacto en curso** (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin (ticket, spec suelto, doc de otra herramienta)): esa corrección se delega en `work-implement` (ver `SKILL.md`). A la inversa, **delegar cuando no hay artefacto de ningún tipo** (rama suelta, sin ID ni documento derivable) — ahí se corrige aquí, sin inventar un artefacto al que atribuir el cambio.
- Delegar una corrección **sin autorización explícita** del usuario: delegar es *cómo* se corrige, no *si* se corrige.
- **Escribir `test-run.json` con el fingerprint anterior a una corrección** — el artefacto afirmaría corresponder a un código que ya no existe.
- Continuar a commit/push/merge tras `✅ Aprobado` sin instrucción explícita.
- **Invadir el terreno de `code-review`:** emitir juicios sobre arquitectura, SOLID, acoplamiento o intención del cambio. Este skill reporta resultados de herramientas; la revisión cualitativa es otro skill.
- **Invadir el terreno de `trace-validate`:** concluir que un criterio de aceptación está o no cubierto a partir del porcentaje de cobertura. La cobertura de este skill es cuantitativa (líneas/ramas); la funcional (criterio ↔ prueba) la juzga `trace-validate`.
- Invocar `code-review` desde aquí, o unificar ambos veredictos en un solo informe — son skills independientes.
- Escribir `quality-check.md` en la carpeta de una US/WI, o en `docs/specs/`, en vez de en `docs/audits/`; o no escribirlo porque el repo no sea spec-driven.
- Dejar `test-run.json` en `docs/` (o dentro de una US/WI) en vez de en `.sdd-devkit/` de la raíz.
- Escribir `quality-check.md` o emitir veredicto en modo `tests-only` — ahí el único artefacto es `test-run.json`.
- Emitir menos de las cuatro entradas de `suites[]`: las que no aplican van con `result: "N/A"`, no se omiten.
