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

> **Principio rector:** ejecutar, reportar y **proponer**. **Ninguna corrección se aplica sin autorización** —explícita del usuario, o de antemano vía `verification.qualityCheck.confirmFix: "never"` (ver [`SKILL.md` → Política de corrección](../SKILL.md#política-de-corrección))—. Tras aplicar una corrección, primero **verifica que el arreglo funciona** re-ejecutando solo el check o la prueba que fallaba; **únicamente si ese check puntual pasa**, dispara el **reinicio** de la corrida completa para re-evaluar sobre el código ya corregido. Si el arreglo no resuelve el fallo, sigue iterando la corrección — no reinicies con algo que aún no funciona. Para ahorrar vueltas, si hay varias correcciones autorizadas, aplícalas juntas, verifícalas y reinicia **una sola vez**.

### Paso 1 — Detectar entorno

1. Identificar el ecosistema y cargar lo relativo a ese stack desde [`stacks.md`](stacks.md) (categoría por check, comando, parseo). Si no se detecta stack o el monorepo es ambiguo, parar y preguntar.
2. **Resolver el conjunto de pruebas de la corrida:** las tres **fijas** (unit, coverage, e2e) más las **configuradas** en el estándar de testing — leer `docs/standards/testing.md` o, si el estándar usa la forma con carpeta, `docs/standards/testing/README.md`; tomar un bloque `## <Requisito>` por clase de prueba, con su `ID`, su `**Estado:**` (solo `Active` cuenta) y su enunciado RFC 2119 para fijar la categoría (DEBE → Bloqueante; DEBERÍA/PUEDE → Condicional). **Si no existe estándar de testing, la corrida son solo las tres fijas** — no es error ni se avisa. Detalle en [`SKILL.md` → Suites de prueba](../SKILL.md#suites-de-prueba-fijas-y-configuradas).
3. Resolver el comando concreto de cada check (scripts del manifiesto + *fallback* canónico); para una suite configurada, usar como pista lo que su requisito diga sobre herramienta y ubicación, y **preguntar** si no se resuelve con certeza.
4. Capturar metadata: stack detectado, rama (`git rev-parse --abbrev-ref HEAD`), commit corto (`git rev-parse --short HEAD`) y working tree. **`workingTreeClean` se evalúa con los mismos pathspecs del fingerprint** (`git status --porcelain -uall -- "${EXC[@]}"` vacío), no con un `git status` pelado: si no, el árbol saldría «sucio» por los propios artefactos de la tubería —el informe que esta corrida está a punto de escribir— y `trace-validate` publicaría un caveat falso en cada reporte.
5. **Normalizar el `.gitignore`** (ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas)): comprobar con `git check-ignore -q .sdd-devkit/test-run.json` si la caché ya está ignorada y, solo si no lo está, añadir la línea `.sdd-devkit/test-run.json` (creando el archivo si no existe). **Va aquí, antes del paso 6, y no en la escritura de la caché:** el `.gitignore` es un archivo oculto de la **raíz**, que la receta **no** excluye, así que tocarlo desplaza la clave. Hacerlo después significaría persistir un `test-run.json` cuyo fingerprint ya no corresponde al árbol — y la caché no volvería a darse por fresca **nunca**.
6. Calcular el **fingerprint canónico del estado del código** (recipe exacto en [Fingerprint canónico](#fingerprint-canónico); es el mismo que usan `code-review` y `trace-validate`). Clave de frescura de la caché de pruebas (ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas)).

### Paso 2 — Ejecutar los checks

**Con `tests-only`** (objetivo de delegación de `trace-validate`): ejecutar únicamente los checks de
**pruebas** (las tres fijas —unit, coverage, e2e— más las suites configuradas en el estándar de testing;
build solo si es prerrequisito de alguna de ellas), omitiendo
tipado, linter y sonar. Antes de ejecutar, comprobar la **caché**: si existe `.sdd-devkit/test-run.json`
con `git.fingerprint` == `FINGERPRINT` (Paso 1), **reutilizar** esos resultados sin
re-ejecutar y saltar a la salida. Si no hay caché o está obsoleta, ejecutar las suites, **escribir/
actualizar `test-run.json`** (ver [Caché de corrida de pruebas](#caché-de-corrida-de-pruebas)) y devolver
los resultados por suite. **`tests-only` es no interactivo:** no hace ninguna de las preguntas del Paso 3 —ni la de corregir un FAIL ni la de resolver el tooling ante un SKIPPED—, no emite veredicto y no escribe `quality-check.md`; su único artefacto es `test-run.json`. Las suites en FAIL se devuelven como tales.

En otro caso, ejecutar **secuencialmente** (no en paralelo) los checks Bloqueantes y Condicionales-con-config-presente, midiendo la duración:

1. **tipado** — solo si Bloqueante (TS) o Condicional con config. Si **FAIL** → **fail-fast**: marcar el resto `⏸️` (en el informe, **Pendiente**) y pasar a la evaluación. **No** marcarlos `N/A` (sí correspondían) ni `SKIPPED` (no hay problema de tooling).
2. **linter** — parsear `error` vs `warning` según la herramienta.
3. **unit tests** — comando del stack; *fallback* canónico.
4. **coverage** — PASS/FAIL según la regla del catálogo de checks (`SKILL.md`). Sin ninguna herramienta ni config de cobertura en el repo → `N/A` con nota en Próximas acciones, no `SKIPPED`.
5. **suites configuradas** — una por cada requisito vigente del estándar de testing (integración, contrato, mutación…), en el **orden en que el estándar las declara**. Si el estándar no declara ninguna, este punto no existe: **no inventar una suite** ni partir la unitaria para simular una. Una suite configurada que necesite el artefacto compilado (rendimiento, carga, accesibilidad sobre la app desplegada) se ejecuta **después de build**, junto a e2e.
6. **build** — en Java/Go/Rust/.NET cubre la compilación.
7. **e2e** — solo si hay script/tarea/perfil e2e o config Playwright/Cypress. La fila **siempre se lista** en el informe, aunque sea `N/A`.
8. **sonar** — si falta `sonar-project.properties` → `N/A`. Si hay config y red falla → FAIL informativo.

> **Las tres fijas (unit, coverage, e2e) siempre se listan** en el informe y en `test-run.json`, aunque su resultado sea `N/A`. Las configuradas existen solo si el estándar de testing las declara. Ver [`SKILL.md` → Suites de prueba](../SKILL.md#suites-de-prueba-fijas-y-configuradas).

> Al **ejecutar** un check, nunca uses `--fix`, `--write`, `--force` ni equivalentes: falsearían el resultado. La corrección autorizada (abajo) es un paso aparte y deliberado.

**Por qué este orden** — pirámide de tests, criterio *rápido → lento*, *dependencias antes que consumidores*:

1. **Estático** (tipado, linter): barato; el fail-fast del tipado evita ruido en cascada.
2. **Unit + coverage**: mismo estrato; coverage justo después de unit.
3. **Suites configuradas** (integración, contrato…): por encima de unit, por debajo de e2e; solo las que declare el estándar de testing, y las que dependen del artefacto compilado, después de build.
4. **Build**: artefacto de integración; en Java/Go/Rust/.NET valida también la compilación.
5. **E2E**: el más lento; suele requerir build previo.
6. **Sonar**: informativo, al final.

**Por qué fail-fast solo en tipado:** en TypeScript, si los tipos no compilan, linter, tests y build fallan masivamente y el ruido no aporta señal. En stacks sin check de tipado separado (Java, Go, .NET), no hay fail-fast: tipado y compilación se validan en **build**.

### Paso 3 — Evaluar el resultado

- **Hay al menos un FAIL** (Bloqueante o Condicional-presente): **mostrar el reporte completo al usuario** y resolver si se corrige según `verification.qualityCheck.confirmFix` (ver [`SKILL.md` → Política de corrección](../SKILL.md#política-de-corrección) y [Corrección de fallos](../SKILL.md#corrección-de-fallos)).
  - **`never`** → saltar la pregunta: ir directo a «autoriza la corrección» más abajo.
  - **`always`** (o sin `settings.json`) → **preguntar qué hacer**. **No corregir sin autorización**, y **no dar por hecho que hay que corregir**. Si la corrida está **dentro de una implementación** (hay un trabajo en curso al que atribuir la rama: `US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin (ticket, spec suelto, doc de otra herramienta)), preguntar si se corrigen los fallos. Si está **fuera de una implementación** (rama suelta sin artefacto de ningún tipo, auditoría, revisión puntual), ofrecer explícitamente las dos salidas: **[Corregir los hallazgos]** / **[Solo el informe, detener aquí]**.
  - Si el usuario elige **solo el informe** → ir al Paso 4 con el veredicto que corresponda y **terminar**: no tocar código, no reiniciar la corrida, no volver a ofrecer la corrección. Dejar lo pendiente en Próximas acciones.
  - Si **autoriza la corrección** → resolver **quién la aplica** según [Corrección de fallos](../SKILL.md#corrección-de-fallos): si la rama tiene un artefacto identificable (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin — ticket, spec suelto, doc de otra herramienta), **delegar en `work-implement`** sobre ese artefacto, pasándole el check fallido, el comando, la salida de error y los archivos implicados; solo si no hay artefacto de ningún tipo, aplicar aquí los cambios mínimos (sin tocar más de lo necesario). En ambos casos: **re-ejecutar el check/prueba que fallaba para confirmar que ya pasa**, **recalcular el `FINGERPRINT`** y solo entonces **re-ejecutar TODA la corrida** (reiniciar el Paso 2). Si el check puntual sigue en FAIL, iterar la corrección antes de reiniciar. **Excepción — si `work-implement` devuelve «corrección no aplicada»** (escalado a `work-plan`/`test-define`, o fallo preexistente): no reintentar ni corregir aquí, no reiniciar la corrida — pasar al informe con el motivo y emitir `REJECTED`.
  - Si **corrige manualmente** e indica que ya está → **re-ejecutar el check/prueba que fallaba**; si pasa, **recalcular el `FINGERPRINT`** y **re-ejecutar TODA la corrida**; si no, avisar y volver a la corrección.
  - Si **no desea corregir ahora** → continuar al informe con veredicto `REJECTED`, dejando registrado qué falló y qué falta para llegar a `APPROVED`.
  - Repetir el ciclo de corrección hasta quedar sin FAIL, hasta que el usuario detenga, o hasta que `work-implement` devuelva **«corrección no aplicada»** — ese resultado cierra el ciclo, no lo reinicia.
- **Solo SKIPPED, sin FAIL** (`INCOMPLETE`): reportar el motivo y **preguntar** si resolver el tooling primero o cerrar asumiendo el `INCOMPLETE`. No avanzar en silencio. **En `tests-only` no se pregunta:** devolver las suites con su `result` (incluidos los `SKIPPED`) y terminar.
- **Sin FAIL ni SKIPPED**: `APPROVED`.

> Aplica la **cota de 3 reinicios** (ver [Manejo de errores](#manejo-de-errores)): tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder.

### Paso 4 — Construir informe

Rellenar la plantilla [`../assets/quality-check-template.md`](../assets/quality-check-template.md) (ver [Formato del informe](#formato-del-informe)):

1. Calcular el veredicto con la tabla de Veredicto (`SKILL.md`): considera Bloqueantes/Condicionales-presentes (las filas `N/A` no cuentan).
2. Tabla resumen de checks: una fila por check ejecutado, `SKIPPED`, `N/A` o `⏸️` (cortado por el fail-fast), con la **etiqueta en el idioma resuelto** de la tabla de [Formato del informe](#formato-del-informe). Las tres **suites fijas** (unit, coverage, e2e) llevan fila siempre; las **configuradas**, una por requisito vigente del estándar de testing. Rellenar además la línea **Estándar de testing** del encabezado (ruta y requisitos vigentes, o «sin estándar de testing»).
3. Detalle de checks **solo** para FAIL o `SKIPPED`; truncar a 10 errores por check (`… y N más`).
4. "Próximas acciones": FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → `SKIPPED` por config ausente/rota → recomendaciones (cobertura sin tooling; **suite presente en el repo pero no declarada en el estándar de testing**, con la sugerencia de declararla vía `arch-manage`).

### Paso 5 — Registro y salida

Decidir **dónde** queda el informe según el contexto. La corrida es **completa** sobre la rama,
no de una unidad, así que su informe reside en una **ubicación fija**, no en la carpeta de la US/WI:

- **Informe vigente de la rama:** **escribir siempre** `docs/audits/quality-check.md` rellenando la plantilla [`../assets/quality-check-template.md`](../assets/quality-check-template.md), sin importar desde qué `US`/`WI` se invocó ni si el repo es spec-driven. Crear `docs/audits/` si no existe. **Sobrescribir** en re-ejecuciones: representa el estado vigente de la rama, no un histórico. Mostrar también un resumen en el chat.
  > **Es una foto de esta rama, no del repositorio.** Se versiona para que viaje en el PR y el revisor lo lea junto al cambio, pero **no debe integrarse en la rama base**: allí afirmaría un veredicto que nadie corrió. Al integrar, `work-integrate` lo retira dentro del propio merge; en un merge hecho en la plataforma hay que borrarlo en la base a mano. No es asunto de este skill —aquí solo se escribe—, pero sí explica por qué el encabezado lleva siempre la rama y el commit.
- **`save-report`:** además del informe vigente, guardar una copia con marca de tiempo en `docs/audits/quality-check-<YYYYMMDD-HHMMSS>.md`. Es el modo para conservar histórico puntual; **no** sustituye ni omite el `quality-check.md` vigente.

**Escribir la caché de corrida de pruebas.** Solo si esta corrida ejecutó el **conjunto de pruebas completo**:
las tres fijas (unit/coverage/e2e) **y** todas las suites configuradas en el estándar de testing. En corridas
**parciales** no se escribe ni se sobrescribe — ver
[Caché de corrida de pruebas](#caché-de-corrida-de-pruebas). Cuando sí toca,
escribir/actualizar `.sdd-devkit/test-run.json` en la **raíz del repo** con el `FINGERPRINT` **vigente** (el del Paso 1 si no hubo correcciones; el recalculado tras la última corrección si las hubo) y el resultado por suite. Crear `.sdd-devkit/` si no existe. Ver
[Caché de corrida de pruebas](#caché-de-corrida-de-pruebas). En modo `tests-only` este es el artefacto de salida.

Devolver el informe completo y la ruta del `quality-check.md` escrito (en `tests-only` no hay informe: devolver los resultados por suite y la ruta de `test-run.json`). **No** continuar con `git commit`, push ni merge aunque el veredicto sea `APPROVED` — salvo instrucción explícita del usuario. Si el cierre requiere también la revisión cualitativa, **sugerir** invocar `code-review`; no ejecutarlo desde aquí.

---

## Formato del informe

La estructura canónica del informe está en la plantilla [`../assets/quality-check-template.md`](../assets/quality-check-template.md). **Rellénala** (no la reescribas desde cero) para todo informe, tanto el resumen que se muestra en chat como el `docs/audits/quality-check.md` que se escribe siempre.

> **La marca de pie se escribe siempre y se conserva:** `<!-- quality-check:verdict=<canónico> · fingerprint=<FINGERPRINT> · generated=YYYY-MM-DD -->`. Es lo que leen `work-integrate` y `pr-create` para decidir si la puerta deja pasar — no la línea visible del veredicto, que va en el idioma resuelto.

La plantilla incluye: encabezado con metadata (donde vive el **Veredicto**, con su justificación de una línea; no hay sección propia), **Resumen**, **Verificaciones** (tabla + detalle de fallidos) y **Próximas acciones**.

**Tres formas por estado, no dos.** Contrato completo en [`../../../reference/verdicts.md`](../../../reference/verdicts.md):
el **valor canónico** (`PASS`, `BLOCKING`, `APPROVED`…) es el vocabulario de este documento, de
`stacks.md`, de la tabla de veredicto del `SKILL.md` y del `result` de `test-run.json`; el **símbolo** es
estable y es lo que leen las otras puertas; la **etiqueta** —la palabra que ve la persona— se redacta al
escribir el informe **en el idioma resuelto**, nunca fijada a un idioma concreto. Traducir solo al
escribir el informe, **nunca** al revés.

| Estado (canónico) | Símbolo | Qué significa |
|-------------------|---------|---------------|
| `PASS` | `✅` | El check se ejecutó y salió limpio. No confundir con el **veredicto** `APPROVED`, que es del informe entero y lleva el mismo símbolo en otra línea. |
| `FAIL` | `❌` | El check se ejecutó y no pasó. |
| `SKIPPED` | `⏭️` | Correspondía (`BLOCKING`, o `CONDITIONAL` con config presente) pero la herramienta o la config está ausente o rota → `INCOMPLETE`. |
| `PENDING` | `⏸️` | Correspondía y no llegó a ejecutarse porque el **fail-fast** del tipado cortó la corrida. Ni `SKIPPED` (no hay problema de tooling) ni `N/A` (sí correspondía); no altera el veredicto, que ya lo fijó el `FAIL` del tipado. Si hace falta desambiguar en el detalle, añadir «(fail-fast)» a la etiqueta. |
| `N/A` | `—` | El repo nunca pidió ese check: no aplica al stack, no hay config/herramienta/script, o el usuario lo omitió por modificador. No cuenta para el veredicto. |
| `INFORMATIVE` | `ℹ️` | **No es un estado, es una categoría**: vive en la columna Categoría, no en Estado. Un check informativo que falla se reporta como `FAIL` con su símbolo `❌` como cualquier otro; lo que lo distingue es que no mueve el veredicto. Hoy solo Sonar. |

> **La leyenda del informe se redacta en el idioma resuelto**, en el orden de esta tabla y con estos
> mismos símbolos. Es lo que permite que un lector entienda las celdas sin conocer el vocabulario
> canónico.

> **`result` de `test-run.json` no se traduce:** ahí van siempre `PASS` / `FAIL` / `SKIPPED` / `N/A`, porque
> lo consume una máquina (`trace-validate`), no una persona. Escribir ahí una etiqueta traducida rompe el esquema.

Reglas al rellenar:
- Sustituir cada `{{…}}` de la plantilla por el valor real; el informe publicado no debe conservar placeholders ni el bloque de comentario inicial.
- Incluir solo las filas de checks que aplican, **con una excepción**: las tres suites fijas (unit, coverage, e2e) se listan siempre, aunque estén en `N/A`.
- Las filas de **suites configuradas** salen del estándar de testing, una por requisito vigente y en su orden de declaración. Ninguna otra: no añadir una suite por haberla detectado en el repo.
- El detalle de checks va **solo** para FAIL o SKIPPED (truncar a 10 errores por check con `… y N más`).

---

## Caché de corrida de pruebas

Artefacto reutilizable que evita que `trace-validate` vuelva a ejecutar las pruebas. Esta sección es la
**definición canónica y única** —los consumidores (`trace-validate`, `code-review`) la referencian, no la
copian—; `SKILL.md` solo la resume.

> **Contexto de ejecución.** Este skill es una **compuerta de cierre**: corre al integrar (`work-integrate`)
> o antes del PR (`pr-create`), sobre la rama **consolidada**, no por tarea ni durante la implementación.
> La caché se computa y se lee en ese checkout de cierre. Las pruebas acotadas que `work-implement` corre
> durante el desarrollo (a veces en **worktrees** aislados por subagente) son **otra cosa**: no producen
> este `test-run.json` ni sirven como caché. La **corrida completa y autoritativa** de la batería de
> pruebas ocurre aquí, en el cierre; este skill es el único productor de `test-run.json`.

### Fingerprint canónico

Clave de frescura compartida entre las **tres puertas del cierre**, cada una sobre su propio artefacto:
`test-run.json` aquí, el `trace-report.md` de
[`trace-validate`](../../trace-validate/SKILL.md#reutilización-del-reporte-idempotencia) y el
`docs/audits/code-review.md` de
[`code-review`](../../code-review/SKILL.md#reutilización-del-informe-idempotencia). (`code-review` le
añade además el commit de la rama base, porque su unidad es un diff con dos lados; el `FINGERPRINT` en sí
es idéntico en las tres.) Hash reproducible del commit + working tree + cambios sin commitear **del
código y de la configuración visible**, excluyendo tres cosas para que escribirlas no desplace la clave:
**toda carpeta oculta** (empieza por `.`, en la raíz o anidada), **todo `docs/`** y los
**`trace-report.md`** que vivan fuera de `docs/`:

```bash
ROOT=$( git rev-parse --show-toplevel )
EXC=( ':(top,exclude,glob)**/.*/**' ':(top,exclude,glob)**/docs/**' ':(top,exclude,glob)**/trace-report.md' )
FINGERPRINT=$( { git -C "$ROOT" ls-files -s              -- "${EXC[@]}"; \
                 git -C "$ROOT" status --porcelain -uall -- "${EXC[@]}"; \
                 git -C "$ROOT" diff                     -- "${EXC[@]}"; \
} | git hash-object --stdin )
```

Las tres piezas se reparten el estado: `ls-files -s` da el contenido **trackeado** (el SHA de cada blob del índice), `diff` los cambios **sin stagear** del árbol, y `status -uall` las rutas **sin trackear**. Juntas cubren el estado del código sin referenciar `HEAD` ni una sola vez, que es lo que hace la clave utilizable (ver la nota de abajo).

Cubre **código fuente, tests y manifiestos** — todo aquello de lo que dependen los resultados de las
herramientas. La caché es **fresca** si el `fingerprint` guardado coincide con el recalculado ahora; si
difiere, hubo cambios y es **obsoleta** (re-ejecutar).

> **Qué queda deliberadamente fuera, y qué implica.** La exclusión de `docs/` mantiene la clave estable
> frente a la documentación, pero también deja fuera **los criterios de aceptación** (`docs/specs/**/README.md`).
> Para este skill da igual —una prueba no cambia de resultado porque se reescriba un criterio—, pero **sí
> importa en `trace-validate` y en `code-review`**, cuyo veredicto depende de esos criterios: si se editan
> sin tocar el código, el informe se dará por fresco y hay que **revalidar a mano** (ver la nota de cada uno).
> Tampoco se cubren los cambios de **entorno** (dependencias instaladas, red, servicios) que no tocan el árbol.

> **Nombre único de la clave.** En todo el repo esta variable se llama `FINGERPRINT` y su valor persistido
> es `git.fingerprint`. No usar alias (`FP`, `HASH`) en ningún skill: el mismo valor debe ser reconocible
> a simple vista cuando un skill delega en otro.
>
> **La exclusión es por directorio, no por nombre de archivo.** Los tres pathspecs, uno a uno:
>
> | Pathspec | Qué saca de la clave |
> |----------|----------------------|
> | `':(top,exclude,glob)**/.*/**'` | El contenido de **cualquier carpeta oculta**, en la raíz o anidada: `.sdd-devkit/` (donde vive `test-run.json`), y de paso `.git/`, `.github/`, `.venv/`, `.cache/`, `.idea/`… El `**/` inicial cubre los dos niveles con un solo patrón. **Los archivos ocultos de la raíz (`.gitignore`, `.eslintrc.json`, `.env`) NO se excluyen**: son configuración que sí puede cambiar el resultado de un check. |
> | `':(top,exclude,glob)**/docs/**'` | **Cualquier `docs/`, en la raíz o dentro de un módulo**: el informe vigente (`quality-check.md`, `code-review.md`), las copias con marca de tiempo de `save-report`, los informes de `arch-audit`, los `trace-report.md` que viven junto a su artefacto y el resto de documentación. El `**/` inicial es lo que cubre el caso monorepo: `:(top,exclude)docs` a secas excluiría **solo** el `docs/` de la raíz, y en una corrida lanzada desde `packages/api/` el informe se escribe en `packages/api/docs/audits/` — que seguiría dentro de la clave y la desplazaría en cada corrida. |
> | `':(top,exclude,glob)**/trace-report.md'` | Los `trace-report.md` de artefactos que viven **fuera** de `docs/` — `trace-validate` acepta artefactos externos al plugin y escribe el reporte junto a ellos. Sin este patrón, ese caso quedaría dentro de la clave. |
>
> Así ningún artefacto que produce la propia tubería puede desplazar la clave de frescura: correr
> `arch-audit` no invalida un `trace-report.md`, ni escribir un informe invalida el `test-run.json`.
>
> **Nada de `HEAD` — y es deliberado.** La receta **no** referencia `HEAD` en ningún punto, porque `HEAD` no
> admite pathspec: cualquier commit lo mueve, incluidos los que solo tocan rutas excluidas. Con `git rev-parse HEAD`
> en la receta, el commit de los propios artefactos que hace el cierre (`work-integrate` paso 11, `pr-create`
> paso 6) caducaba **las tres claves a la vez** y obligaba a re-ejecutar toda la batería de pruebas — la
> idempotencia no sobrevivía al flujo que la usa. `ls-files -s` da la misma señal (el SHA de cada blob
> trackeado) **respetando los pathspecs**, y de paso funciona en un repo **sin ningún commit**, donde
> `git rev-parse HEAD` aborta con `fatal: bad revision`.
>
> **`git -C "$ROOT"` no es cosmético.** `status` y `diff` imprimen rutas **relativas al directorio de trabajo**:
> el mismo árbol da hashes distintos según desde dónde se lance la corrida. Anclando los tres comandos a la raíz,
> el `FINGERPRINT` es idéntico desde la raíz o desde `packages/api/`, que es lo que permite compararlo entre
> corridas y entre skills.
>
> **La magia `top` tampoco es opcional.** `:(top,…)` ancla el pathspec a la **raíz del repositorio**; sin ella,
> git lo resolvería relativo al directorio de trabajo y las exclusiones se desplazarían con el cwd.
>
> **`-uall` tampoco es opcional.** Sin él, `git status --porcelain` **colapsa** los directorios sin trackear a
> una sola entrada (`?? docs/`) y las exclusiones de dentro no llegan a aplicarse — el caso típico es la
> primera corrida en un repo, donde nada de esto está aún versionado. Con `-uall` git lista archivo por
> archivo y los pathspecs filtran de verdad. Aun así, el contenido de un archivo que **permanezca** sin
> trackear no entra en la clave: solo su ruta. Si el resultado pudiera depender de un archivo nuevo aún sin
> añadir a git, tratar la caché como no concluyente.
>
> **La clave es conservadora, nunca laxa.** Commitear cambios de **código** sí la mueve, aunque el árbol
> resultante sea idéntico al que se probó: `status` distingue un cambio stageado de uno ya commiteado. Eso
> provoca alguna revalidación de más, que es el error barato; el caro —dar por fresca una caché que ya no
> corresponde— no puede ocurrir por esta vía.

### Esquema `test-run.json`

`schema: test-run/v2` — **esta es la definición canónica y única**; los consumidores la referencian, no
la copian:

```json
{
  "schema": "test-run/v2",
  "generatedBy": "quality-check",
  "timestamp": "2026-07-17T10:20:00-05:00",
  "invokedFrom": "US-004-checkout",
  "testingStandard": "docs/standards/testing.md",
  "git": { "branch": "feature/US-004-checkout", "commit": "abc1234", "workingTreeClean": true,
           "fingerprint": "<hash>" },
  "suites": [
    { "type": "unit",        "command": "npm test",            "result": "PASS", "summary": "48 passed" },
    { "type": "coverage",    "command": "npm run coverage",    "result": "PASS", "summary": "line 82%" },
    { "type": "e2e",         "command": "npx playwright test", "result": "FAIL", "summary": "2 failed" },
    { "type": "integration-testing", "command": "npm run test:it",   "result": "PASS", "summary": "18 passed",
      "standard": "testing/integration-testing" },
    { "type": "contract-testing",    "command": "npm run test:pact", "result": "SKIPPED", "summary": "config rota",
      "standard": "testing/contract-testing" }
  ]
}
```

Semántica de los campos:

- **`generatedBy`** — siempre `"quality-check"`. Un consumidor que lea otro valor debe **descartar la caché** y no reutilizarla: este skill es el único productor autorizado.
- **`timestamp`** — momento de la corrida, para reportar procedencia al usuario. No es clave de frescura (esa es `git.fingerprint`).
- **`invokedFrom`** — trabajo desde el que se invocó la corrida (`US-XXX-slug`, `WI-XXX-slug`) o `null` si no aplica. Es **informativo**: la corrida es de la **rama consolidada**, que puede incluir varios trabajos, así que **no** debe usarse para filtrar resultados ni para decidir si la caché aplica a otro trabajo.
- **`testingStandard`** — ruta del estándar de testing del que salieron las suites configuradas, o `null` si el repo no tiene ninguno (en cuyo caso `suites[]` trae solo las tres fijas). Informativo: permite al consumidor distinguir «este repo no declara integración» de «no se leyó el estándar».
- **`git.fingerprint`** — única clave de frescura. Debe corresponder al estado del código **realmente probado** (recalcular tras cualquier corrección).
- **`suites[].type`** — para las **fijas**, uno de `unit` · `coverage` · `e2e` (slugs canónicos de este skill): **siempre se emiten las tres**, y la que el repo no tiene va con `result: "N/A"`. Para las **configuradas**, el `ID` **tal cual lo declara el requisito** en el estándar de testing (`integration-testing`, `contract-testing`, `performance-testing`…): se emite **una entrada por requisito vigente**, y ninguna si el estándar no declara más. **No** emitir una entrada por una suite que el estándar no declara.
- **`suites[].standard`** — solo en las configuradas: referencia global al requisito del estándar, `<slug-del-estándar>/<ID-del-requisito>` (p. ej. `testing/integration-testing`). Ausente en las fijas.
- **`suites[].result`** — `PASS` · `FAIL` · `SKIPPED` (correspondía pero no se pudo ejecutar) · `N/A` (no aplica al repo).

> **Cambio respecto de `test-run/v1`:** las entradas fijas pasan de cuatro a **tres** (`unit`, `coverage`, `e2e`). `integration` ya no está garantizada: aparece **solo si el estándar de testing la declara**, junto al resto de suites configuradas. Un consumidor no puede asumir su presencia — debe buscarla en `suites[]` y, si no está, tratarla como una clase de prueba que el repo no declara.

### Cuándo se escribe y se reutiliza

**Cuándo se escribe.** Al final de toda corrida que ejecutó el **conjunto de pruebas completo** —las tres fijas
más todas las configuradas— (Paso 5), sea o no spec-driven el repo. En corridas parciales, no — ver «Cuándo NO se escribe» más abajo. Ruta **fija**: `.sdd-devkit/test-run.json` en la **raíz del repositorio**, no por
unidad y fuera de `docs/` (es un artefacto de máquina, no documentación). Se **sobrescribe** en cada
corrida (es el estado vigente de la rama) y **no se versiona**.

**El `.gitignore` se normaliza en el Paso 1**, no aquí: `git check-ignore -q .sdd-devkit/test-run.json` y,
solo si devuelve distinto de 0, añadir esa línea (creando el archivo si hace falta), en silencio. Es la única
edición de configuración que este skill hace por iniciativa propia y no se reporta al usuario. **Usar
`check-ignore`, no un grep de la línea:** en un repo que ya ignora `.sdd-devkit/` entero, el grep no
encontraría el patrón exacto y añadiría una línea redundante que no cambia nada.

**Cuándo NO se escribe la caché.** Solo se escribe si la corrida ejecutó el **conjunto de pruebas completo**.
En una corrida **parcial** —`no-tests`, `no-unit-tests`/`no-e2e`/`no-coverage`, un `no-<suite>` configurada, un
`only <check>`, o cualquier corrida cortada por el **fail-fast** del tipado— **no** escribir ni sobrescribir
`test-run.json`: dejar intacta la que hubiera. El motivo es que el consumidor no puede distinguir un `N/A`
«el repo no tiene esa suite» de un `N/A` «el usuario la omitió», y `trace-validate` traduce el primero
publicando que esa clase de prueba no existe en el repo — un artefacto falso. Una caché parcial es peor que
ninguna.

**No comentar la caché al usuario.** Que exista y se reutilice, o que no exista y haya que generarla, son
los dos caminos normales; ninguno es una incidencia. Solo si el usuario pide explícitamente no crear el
directorio, devolver los resultados en la respuesta y advertir que no habrá reutilización entre corridas.

**Qué se guarda.** El `FINGERPRINT` vigente en `git.fingerprint`, la ruta del estándar de testing en
`testingStandard` (o `null`), y las entradas de suite con su `command`, `result`
(`PASS`/`FAIL`/`SKIPPED`/`N/A`) y un `summary` corto — el esquema completo y la semántica de cada campo están
en [Esquema `test-run.json`](#esquema-test-runjson). Mapeo check → suite: `unit tests` → `unit`, `coverage` → `coverage`, `e2e` → `e2e`, y cada
suite configurada → el `ID` de su requisito en el estándar (p. ej. `integration-testing`), con su referencia
global en `standard` (p. ej. `testing/integration-testing`). Las **tres fijas se emiten siempre**, con `result: "N/A"` si el repo no las
tiene, para que el consumidor no tenga que distinguir «ausente» de «no aplica». Las **configuradas** se emiten
solo si el estándar las declara: no inventar suites que el estándar no declara.

**Cómo se reutiliza (`tests-only`).** Recalcular el `FINGERPRINT` (Paso 1) y compararlo con
`git.fingerprint` del `test-run.json` existente:
- **Coincide** y su `suites[]` cubre exactamente el **conjunto vigente** (tres fijas + configuradas del
  estándar) → caché **fresca**: devolver esos resultados sin ejecutar nada. Es el camino que hace que,
  si no hubo cambios desde la última corrida de pruebas, no se repita el trabajo.
- **Diferente, no existe, o su `suites[]` no cubre el conjunto vigente** (el estándar cambió) → caché
  **obsoleta/ausente**: ejecutar las suites, sobrescribir `test-run.json` y devolver los nuevos resultados.

**Validez.** El fingerprint canónico (ver [Fingerprint canónico](#fingerprint-canónico)) cubre código, tests y manifiestos, y excluye
las carpetas ocultas, `docs/` y los `trace-report.md` sueltos; no detecta la edición de **contenido** de un
archivo que permanezca sin trackear, ni cambios de entorno (dependencias instaladas, red, servicios) — si el
resultado pudiera depender de eso, tratar la caché como no concluyente. Si el árbol
estaba sucio, `workingTreeClean: false` queda registrado como señal para el consumidor.

> **El estándar de testing vive en `docs/`, que el fingerprint excluye.** Añadir, retirar o desactivar un
> requisito de pruebas **no** invalida la caché: un `test-run.json` con el conjunto de suites anterior se
> dará por fresco. Al leer la caché en `tests-only`, comparar su `suites[]` con el conjunto vigente resuelto
> en el Paso 1 y, **si no coinciden, tratarla como obsoleta** y re-ejecutar. Es la única comprobación de
> frescura que no depende del `FINGERPRINT`, y hace falta justamente porque el estándar es documentación.

---

## Manejo de errores

| Situación | Cómo actuar |
|-----------|-------------|
| Stack no detectable | Parar antes de ejecutar nada; preguntar al usuario. |
| Monorepo ambiguo | Parar y preguntar qué módulo auditar. |
| Tipado **Bloqueante** (TS) pero falta `tsconfig.json` | `SKIPPED` → `INCOMPLETE`. |
| Tipado **Condicional** (Python/Rust) sin config ni herramienta | `N/A`. No afecta veredicto. |
| Tipado **N/A** para el stack (Java, Go, JS, .NET) | No ejecutar; no listar como `SKIPPED`. |
| Tipado **FAIL** (cuando aplica) | **STOP fail-fast.** Resto `⏸️` / **Pendiente** — ni `N/A` ni `SKIPPED`. |
| Runner/build tool ausente del PATH | Parar y preguntar al usuario. |
| Script/tarea definida pero binario inexistente (config rota) | `FAIL` (`❌`) si el comando se intentó y rompió; `SKIPPED` (`⏭️`) si no se pudo ni invocar. Nunca `N/A`. |
| Unit tests sin script ni comando canónico | `SKIPPED` → `INCOMPLETE` (unit es Bloqueante). |
| Coverage con config o herramienta presente pero que no se pudo ejecutar | `SKIPPED` → `INCOMPLETE` (coverage es Bloqueante). |
| Coverage sin herramienta **ni** configuración alguna en el repo | `N/A` + recomendación en Próximas acciones. No condenar el veredicto a `INCOMPLETE` permanente por un check que el proyecto nunca declaró. |
| Repo **sin estándar de testing** (`docs/standards/testing.md` no existe) | Corrida de **solo las tres fijas**. No es error ni `SKIPPED`: no hay suites configuradas que ejecutar. Opcionalmente, recomendar en Próximas acciones crear el estándar vía `arch-manage`. |
| Suite **declarada en el estándar** que no se puede ejecutar (sin script, tarea o herramienta) | `SKIPPED` → `INCOMPLETE`. El estándar es la declaración de que ese check debe correr. |
| Suite declarada cuyo comando **no se resuelve con certeza** | Preguntar al usuario; no adivinar un comando ni partir la suite unitaria para simularla. |
| Requisito del estándar con `**Estado:** Deprecated` o `Superseded` | No ejecutar ni listar: dejó de ser exigible. |
| Suite **presente en el repo pero no declarada** en el estándar (p. ej. script `test:it` sin requisito) | No ejecutarla y no bloquear. Anotarla en Próximas acciones como recomendación de declararla en el estándar (`arch-manage`). |
| Suite de integración no distinguible de la unitaria, con el estándar declarándola | `SKIPPED` → `INCOMPLETE`. No contar la suite unitaria como integración ni inventar un comando. |
| Coverage bajo umbral configurado | `FAIL` (`❌`). |
| Coverage sin umbrales configurados y exit 0 | `PASS` (`✅`). |
| E2E **Condicional** con config presente pero tool ausente/rota | `SKIPPED` → `INCOMPLETE`. |
| E2E sin config ni script de e2e | `N/A`. No afecta veredicto. |
| Build **N/A** (Python sin empaquetado) | Omitir fila; no afecta veredicto. |
| `sonar-scanner` no disponible o falta `sonar-project.properties` | `N/A`. No afecta veredicto. |
| Sonar con config presente y error de red | FAIL informativo. No bloquea veredicto. |
| Ejecución > 10 min en un check | Continuar; avisar al usuario. |
| Working tree sucio | No bloquear; nota en encabezado. |
| FAIL en algún check | Mostrar reporte y **preguntar** si corregir. Nunca corregir sin autorización. Con autorización, delegar en `work-implement` si hay un artefacto en curso (`US-XXX`, `WI-XXX`, `FT-XXX`/`TC-XXX` en rama `test/`, o un artefacto externo al plugin); si no hay ninguno, corregir aquí. Tras corregir, **re-ejecutar el check que fallaba**; si pasa, **recalcular el fingerprint** y **re-ejecutar toda la corrida**. |
| Autorización de corrección pero el artefacto de trabajo es ambiguo (varios candidatos) | Preguntar cuál antes de delegar; no delegar sobre un artefacto adivinado. |
| FAIL o SKIPPED durante una corrida `tests-only` | **No preguntar nada** — el modo es no interactivo: devolver los resultados por suite (con su `result`) y la ruta de `test-run.json`. Corregir o resolver el tooling es decisión del flujo que invocó. |
| Stack no detectable, monorepo ambiguo o runner ausente **en modo `tests-only`** | **Tampoco preguntar**, pese a lo que dicen las filas de arriba: el modo es no interactivo de principio a fin. Devolver «no ejecutable» con el motivo concreto y sin `test-run.json`. Es el retorno que `trace-validate` espera para reportar sus filas como `NOT_RUN`; una pregunta ahí colgaría una delegación que nadie está mirando. |
| Usuario no quiere corregir los FAIL, o pide solo el informe | Cerrar en `REJECTED` con el detalle de lo pendiente en Próximas acciones; no maquillar el veredicto ni volver a insistir con la corrección. |
| Corrida **fuera de una implementación** (rama sin artefacto derivable) con hallazgos que exigen tocar código | Preguntar explícitamente **[Corregir]** / **[Solo el informe]** antes de nada. Entregar solo el informe es un resultado legítimo, no un flujo incompleto. |
| El usuario acota qué corregir («el linter sí, el test no») | Respetarlo: corregir solo lo autorizado y tratar el resto como *solo informe*, dejándolo en Próximas acciones. |
| Corrección aplicada que **no** resuelve el fallo (el check puntual sigue en FAIL) | **No reiniciar.** Iterar la corrección hasta que el check puntual pase; recién entonces disparar el reinicio. |
| `work-implement` devuelve **«corrección no aplicada»** (fuera de alcance → `work-plan`; discrepancia `TC-XXX`↔código → `test-define`; fallo preexistente) | **Detener el ciclo.** No reintentar la delegación sobre ese fallo ni corregirlo aquí. Recoger el motivo y el skill escalado en **Próximas acciones**, emitir `REJECTED` y terminar. Ver [Corrección de fallos](../SKILL.md#corrección-de-fallos). |
| Usuario pide "corrige tú" sin más contexto | Confirmar el alcance exacto a corregir antes de tocar nada; resolver quién corrige según [Corrección de fallos](../SKILL.md#corrección-de-fallos); aplicar solo lo mínimo; luego re-ejecutar. |
| Varias correcciones autorizadas a la vez | Aplicarlas juntas y reiniciar **una sola vez** para no encadenar pasadas innecesarias. |
| Bucle de correcciones que no converge | Tras 3 reinicios sin llegar a `✅`, resumir lo pendiente y preguntar al usuario cómo proceder. |
| El usuario pide además opinión sobre el diseño del código | Fuera de alcance: sugerir invocar `code-review`. No improvisar una revisión cualitativa aquí. |

---

## Anti-patterns

- Asumir TypeScript/Node si el repo es Java, Python u otro stack.
- Ejecutar `tsc --noEmit` en un proyecto Java — la compilación va en **build**.
- Marcar `INCOMPLETE` un check Condicional que simplemente **no aplica** (debe ser `N/A`).
- Marcar `N/A` un check cuya config **sí existe** pero falló al ejecutarse (debe ser `SKIPPED` o `FAIL`).
- **Corregir código sin autorización** — explícita del usuario, o de antemano vía `verification.qualityCheck.confirmFix: "never"` — con `always` (el default) solo se ejecuta y se reporta.
- **Dar por hecho que el usuario quiere corregir** cuando la corrida ocurre fuera de un ciclo de implementación y `verification.qualityCheck.confirmFix = "always"`: ahí hay que ofrecer explícitamente la salida «solo el informe».
- Insistir con la corrección después de que el usuario haya pedido solo el informe.
- Usar `--fix` / `--write` / `--force` **al ejecutar un check** (falsea el resultado); la corrección autorizada es un paso aparte y deliberado.
- Modificar manifiestos para añadir scripts faltantes.
- Declarar `APPROVED` con algún Bloqueante o Condicional-presente en `SKIPPED` — es `INCOMPLETE`.
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
- Continuar a commit/push/merge tras `APPROVED` sin instrucción explícita.
- **Invadir el terreno de `code-review`:** emitir juicios sobre arquitectura, SOLID, acoplamiento o intención del cambio. Este skill reporta resultados de herramientas; la revisión cualitativa es otro skill.
- **Invadir el terreno de `trace-validate`:** concluir que un criterio de aceptación está o no cubierto a partir del porcentaje de cobertura. La cobertura de este skill es cuantitativa (líneas/ramas); la funcional (criterio ↔ prueba) la juzga `trace-validate`.
- Invocar `code-review` desde aquí, o unificar ambos veredictos en un solo informe — son skills independientes.
- Escribir `quality-check.md` en la carpeta de una US/WI, o en `docs/specs/`, en vez de en `docs/audits/`; o no escribirlo porque el repo no sea spec-driven.
- Dejar `test-run.json` en `docs/` (o dentro de una US/WI) en vez de en `.sdd-devkit/` de la raíz.
- Escribir `quality-check.md` o emitir veredicto en modo `tests-only` — ahí el único artefacto es `test-run.json`.
- **Omitir alguna de las tres suites fijas** (unit, coverage, e2e) del informe o de `suites[]`: si no aplican, van con `result: "N/A"` y `—` en el informe, pero se listan.
- **Ejecutar o reportar una suite que el estándar de testing no declara** — integración incluida: dejó de ser una fila fija. Si el repo la tiene y el estándar no la declara, va a Próximas acciones como recomendación, no a la tabla de verificaciones.
- **Inferir el conjunto de pruebas del repo en lugar de leerlo del estándar** (deducirlo de carpetas o scripts). El estándar es la única fuente de las suites no fijas.
- Dar por fresca una caché cuyo `suites[]` no coincide con el conjunto vigente porque el `FINGERPRINT` sí coincide — el estándar vive en `docs/`, que el fingerprint excluye.
