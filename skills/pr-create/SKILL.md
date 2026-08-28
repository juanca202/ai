---
name: pr-create
description: >-
  Crear Pull Request (PR) o Merge Request (MR) desde la rama actual hacia una rama destino preguntada al usuario, en dos modos: implementación (feature/fix/chore/refactor/test hacia su rama de integración) y promoción (develop hacia master/main/release, consolidando trabajos ya integrados). Puertas obligatorias y bloqueantes: en implementación, quality-check, code-review y trace-validate; en promoción solo quality-check. En ambos se verifica docs/policies/definition-of-done.md si existe. En implementación sobre un US/WI resuelve el archivado en docs/archive/ según implementation.archiveMode; si no se archiva, el PR se crea igual. Funciona sobre cualquier repositorio git con remoto: auto-detecta la plataforma (GitHub, GitLab, Bitbucket, Gitea, Azure Repos) y su CLI, y genera título y descripción. Usar siempre que el usuario pida crear, abrir o subir un PR, MR, pull request o merge request, o promover develop a master, incluso si solo dice "crea el PR" o "súbelo a develop".
license: MIT
---

# Skill: Crear Pull Request (PR / MR)

Crear un PR o MR desde la **rama actual** hacia una **rama destino preguntada al usuario**, sobre cualquier repo git con remoto configurado.

> **Origen = rama actual**, sin excepción. Hay **dos modos válidos**, que el skill deduce del par origen→destino (ver [Modos: implementación y promoción](#modos-implementación-y-promoción)):
>
> - **PR de implementación** — de una rama de trabajo (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`, `hotfix/`…) a su rama de integración o despliegue. Es el caso por defecto.
> - **PR de promoción** — de una rama de integración a una de despliegue (`develop → master`, `develop → release/x`, `release/x → main`). No trae código nuevo: consolida trabajos que ya pasaron sus puertas al integrarse.
>
> El modo lo decide **una sola tabla de decisión**, evaluada en el Paso 3 con el destino ya conocido; ver [Modos: implementación y promoción](#modos-implementación-y-promoción). Ahí se define también cuándo se para y cuándo se pregunta.
>
> **Working tree sucio no detiene el flujo:** si hay cambios sin commitear, el skill invoca automáticamente el flujo del skill **`git-commit`** (sin preguntar al usuario si desea commitear — la decisión de invocarlo es automática) y, una vez el working tree queda limpio, continúa con el resto del pre-flight. Nota: `git-commit` no tiene modo silencioso — un commit único lo ejecuta sin confirmar, pero puede pausar para confirmar su **propuesta de división** cuando el diff se reparte en varios commits (con `commitConfirmation = always`) y puede detenerse del todo ante secretos, rama protegida o hook fallido; ese comportamiento no se suprime al invocarlo desde aquí.
>
> **Plataforma se auto-detecta** del remoto `origin`. No preguntar.
>
> **Puertas de calidad obligatorias y bloqueantes:** en un PR de **implementación** se ejecutan **siempre** `quality-check`, `code-review` y `trace-validate`; en uno de **promoción**, solo `quality-check`. En ambos modos, si existe la **Definition of Done** (`docs/policies/definition-of-done.md`), se verifica. Todas las que apliquen deben quedar en **aprobado**; si alguna no lo está, **no** se crea el PR. No hay flujo "crear como draft" ni "ignorar y continuar", ni forma de saltarse una puerta que aplica.
>
> **No incluye:** modificar código por iniciativa propia, merges, rebases, resolver conflictos, asignar reviewers/labels/milestones, editar PRs existentes. (Las correcciones solo se aplican si el usuario las autoriza explícitamente — ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad).)

---

## Modos: implementación y promoción

El ciclo normal tiene **dos saltos**, no uno: el trabajo se implementa en una rama, se integra en una rama de integración (`develop`), y desde ahí varios trabajos se promueven juntos a una rama de despliegue (`master`, `main`, `release/*`). Este skill cubre los dos.

| | **PR de implementación** | **PR de promoción** |
|---|---|---|
| Origen | Rama de trabajo: prefijo `feature/`, `fix/`, `chore/`, `refactor/`, `test/`, `hotfix/`, o el equivalente del repo | Rama de integración o de despliegue: `develop`, `release/*`, `main`, `master`, `trunk` |
| Destino | Su rama de integración | **Otra** rama de integración/despliegue, aguas abajo |
| Qué aporta | Código nuevo, aún sin revisar | Nada nuevo: consolida trabajos ya integrados |
| Puertas | `quality-check` + `code-review` + `trace-validate` (+ DoD) | `quality-check` (+ DoD). Ver [Puertas en un PR de promoción](#puertas-en-un-pr-de-promoción) |
| Descripción | Commits del rango + ticket | Trabajos que se promueven (`US-XXX`/`WI-XXX`) + delta de commits |

**Tabla de decisión.** Es la **única** regla de clasificación del skill; se evalúa en el Paso 3, con el destino ya conocido. El Paso 1 no clasifica ni para: solo detecta si el origen tiene prefijo de implementación.

| # | Origen | Destino | Resultado |
|---|--------|---------|-----------|
| 1 | Prefijo de implementación (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`, `hotfix/`, o el equivalente del repo) | Rama de integración/despliegue | **PR de implementación.** Camino por defecto, sin confirmación. |
| 2 | Rama de integración/despliegue | **Otra**, aguas abajo | **PR de promoción**, previa confirmación (ver abajo). |
| 3 | Rama de integración/despliegue | Aguas **arriba**, o la misma | **Parar.** No es una promoción. |
| 4 | Cualquiera | Rama de implementación | **Parar.** Este skill no abre PRs *hacia* una rama de trabajo. |
| 5 | Sin prefijo reconocible **y** que no es rama de integración | Cualquiera | **Preguntar** a qué categoría pertenece la rama (`hotfix-cache`, `PROJ-1234`…). Si el usuario la sitúa, aplicar la fila que corresponda; si no, parar. **No** clasificarla como promoción por descarte. |

**La confirmación de la fila 2 no se omite nunca.** Estar parado en `develop` también es lo que ocurre cuando alguien olvidó cambiar de rama —lo típico justo después de `work-integrate`, que deja HEAD en la base—, y ahí el PR correcto es otro. Es la única defensa contra ese error.

> **Qué cuenta como rama de integración o despliegue.** Por defecto `main`, `master`, `develop`, `trunk` y `release/*`. Si el repo usa otros nombres (`staging`, `uat`, `qa`, `produccion`) y el usuario indica uno como destino, tratarlo como tal: **el destino manda**. No inventar una jerarquía propia ni exigir que el repo siga git-flow.

**Qué es «aguas abajo».** El orden canónico del ciclo es:

`
rama de implementación  →  develop  →  release/*  →  main | master
`

El destino está **aguas abajo** si aparece a la derecha del origen en ese orden. `develop → master` lo está; `master → develop` no, y por eso la fila 3 lo corta. **No usar «la rama de la que nace» como criterio:** en git-flow `develop` nace de `master`, así que esa lectura clasificaría la promoción canónica como marcha atrás y desactivaría el modo entero. Si el repo usa otros nombres, el orden lo fija el usuario al indicar el destino; ante duda sobre la dirección, preguntar en vez de asumir.

Sincronizar una rama hacia atrás (traer `master` a `develop` tras un hotfix) es un merge o un rebase, no un PR de este skill.

---

## Detección de plataforma

Heurística por host de `git remote get-url origin`:

| Host | Plataforma | CLI |
|------|-----------|-----|
| `github.com` o GitHub Enterprise | GitHub | `gh` |
| `gitlab.com` o host GitLab self-managed | GitLab | `glab` |
| `bitbucket.org` | Bitbucket Cloud | REST + curl (o CLI instalado) |
| Host con segmento `/scm/` o Bitbucket Server | Bitbucket Server | REST + curl |
| `dev.azure.com` o `*.visualstudio.com` | Azure Repos | `az repos` |
| Marcadores de Gitea/Forgejo | Gitea | `tea` |
| Cualquier otro | — | Probar CLI conocido instalado; si nada encaja, parar y avisar |

Verificar que el CLI elegido está instalado (`<cli> --version`); si falta, parar y avisar. Las credenciales son responsabilidad del entorno del usuario (variables de entorno, `~/.netrc`, config previa del CLI).

---

## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada:** un título o descripción **explícitos del usuario** se respetan literalmente, en el idioma en que los escribió. Cuando el idioma resuelto obliga a traducir el título, el prefijo de ticket (`[US-042]`, `[TK-007]`) se mantiene intacto; los subjects de commits citados en la descripción **no** se traducen: van literales para preservar la trazabilidad. Si `language.md` llega a su paso de preguntar, ofrecer como opción por defecto el idioma predominante de los commits del rango `origin/<destino>..HEAD` — pero preguntar igual, no decidirlo por cuenta propia.

---

## Flujo

### Paso 1 — Pre-flight (obligatorio antes de cualquier acción)

1. `git rev-parse --is-inside-work-tree` — confirmar repo git.
2. `git rev-parse --abbrev-ref HEAD` — obtener rama actual.
3. **Caracterizar la rama actual** — sin clasificar el modo ni parar: eso es del Paso 3, que ya conoce el destino. Anotar simplemente en cuál de las tres categorías cae:
   - **de implementación** (prefijo `feature/`, `fix/`, `chore/`, `refactor/`, `test/`, `hotfix/`, o el equivalente del repo),
   - **de integración o despliegue** (`develop`, `release/*`, `main`, `master`, `trunk`, o la que el repo use),
   - **ninguna de las dos** (rama suelta como `hotfix-cache` o `PROJ-1234`) → se resolverá preguntando al usuario en el Paso 3, no parando aquí.
4. `git status --porcelain` — si no está vacío, **invocar automáticamente el flujo del skill `git-commit`** sobre los cambios pendientes (sin preguntar al usuario si desea commitear) y esperar a que termine. La invocación delega en `git-commit` **todo** su criterio operativo (agrupación por cambio lógico, inferencia de tipo/scope/mensaje, staging, detección de secretos, confirmación de la propuesta de división) — `pr-create` no decide un mensaje de commit ni qué stagear por su cuenta; solo dispara el flujo y espera su resultado. **`git-commit` no tiene modo silencioso**: un commit único lo ejecuta sin confirmar, pero puede pausar para confirmar su **propuesta de división** cuando el diff se reparte en varios commits (con `commitConfirmation = always`), y puede detenerse ante secretos, rama protegida o hook fallido. «Sin preguntar al usuario» se refiere solo a que `pr-create` no pide permiso para *invocar* `git-commit`, no a que esas pausas y paradas propias de `git-commit` desaparezcan.
   - **Si `git-commit` no está disponible** (skill no instalado o no localizable en el entorno): **parar** y avisar, mostrando los archivos pendientes y sugiriendo al usuario commitear manualmente antes de reintentar — no ejecutar `git add`/`git commit` directos como sustituto.
   - **Si `git-commit` deja el working tree completamente limpio**, continuar con el resto del pre-flight.
   - **Si `git-commit` termina dejando el working tree parcialmente limpio por una decisión de alcance suya** (p. ej. agrupó y commiteó unos archivos pero dejó otros fuera deliberadamente, o el usuario excluyó algunos de un commit propuesto): no es un error de `pr-create`. Volver a comprobar `git status --porcelain`; si sigue habiendo cambios, invocar `git-commit` de nuevo sobre el remanente (mismo criterio, sin preguntar) hasta que quede limpio o `git-commit` se detenga por un motivo real (secretos, o una decisión que no puede resolver solo).
   - Si se detiene sin commitear (p. ej. por detección de secretos, o porque requiere una decisión del usuario que el propio `git-commit` no puede resolver solo), **parar** y avisar con el motivo que reportó `git-commit`.

### Paso 2 — Detectar plataforma y CLI

Aplicar la tabla de detección. (La comprobación de «PR ya existente» necesita el destino, así que se hace al final del Paso 3, no aquí.)

### Paso 3 — Preguntar destino y cerrar el modo

1. **Rama destino** (pregunta única): validar que existe en `origin` (`git ls-remote --heads origin <destino>`) y que no coincide con la rama actual.
2. **Verificar que hay algo que integrar:** `git rev-list --count origin/<destino>..HEAD`. Si es `0`, parar y avisar — el PR saldría vacío. Aplica a los dos modos.
3. **Extraer los trabajos del rango** (ver Paso 7 para el orden de degradación). Hace falta **aquí**, no solo en el Paso 7: el mensaje de confirmación del punto 5 los enumera.
4. **Clasificar el modo** aplicando la tabla de decisión de [Modos: implementación y promoción](#modos-implementación-y-promoción) sobre el par origen→destino. Si la rama actual no encajaba en ninguna categoría (fila 5), preguntar ahora al usuario a cuál pertenece.
5. **Si el resultado es promoción, confirmar la intención** antes de continuar: «Vas a crear un PR de promoción de `<origen>` a `<destino>`: N commits, trabajos X, Y, Z. ¿Es lo que quieres, o te olvidaste de cambiar a tu rama de trabajo?». Sin confirmación no se sigue.
6. **PR ya existente:** con origen y destino resueltos, comprobar si hay un PR abierto para `<rama-actual> → <destino>`; si lo hay, capturar su URL y devolvérsela al usuario sin crear uno nuevo.

Las puertas **que aplican al modo** no se preguntan: son obligatorias (ver Paso 4) y no hay opción de saltarlas. Que en una promoción no corran `code-review` ni `trace-validate` **no** es una excepción concedida al usuario: es que su unidad de análisis no existe en ese modo.

### Paso 4 — Puertas de calidad (obligatorias, bloqueantes)

Antes de cualquier push o creación de PR se ejecutan las puertas **que aplican al modo**, en este orden. Una puerta que aplica y no queda en **aprobado** detiene el flujo: **no** se hace push ni se crea el PR. Ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad) para qué hacer ante un fallo.

| Puerta | PR de implementación | PR de promoción |
|--------|----------------------|-----------------|
| 4.1 `quality-check` | Obligatoria | **Obligatoria** |
| 4.2 `code-review` | Obligatoria | No aplica |
| 4.3 `trace-validate` | Obligatoria | No aplica |
| 4.4 Definition of Done | Si existe el archivo | Si existe el archivo |

**4.1 — `quality-check` (siempre).** Invocar el flujo de `quality-check` (verificaciones automatizadas: tipado, linter, unit, coverage, build, e2e, sonar, más las suites que declare el estándar de testing) sobre la rama.
- Aprobado = `verdict=APPROVED` en la marca de pie → continuar (aunque haya warnings o resultados informativos).
- Rechazado = `verdict=REJECTED` o `verdict=INCOMPLETE` → detener.

> **Cómo se lee un veredicto.** Los informes de las puertas se redactan en el idioma resuelto del repo, así que **ni la palabra ni el símbolo del encabezado son comparables**. Lo que se lee es la **marca oculta del pie** del informe: `<!-- <skill>:verdict=<VALOR> … -->`. `APPROVED` deja pasar; `REJECTED` e `INCOMPLETE` bloquean; `APPROVED_WITH_NOTES` (solo `trace-validate`) **no** bloquea: se muestran las observaciones y se continúa. Contrato completo en [`../../reference/verdicts.md`](../../reference/verdicts.md).

> Este es el punto de cierre donde `quality-check` ejecuta la batería completa de pruebas y persiste `test-run.json`. El orden importa: `4.1` antes de `4.3` permite que `trace-validate` **reutilice** esa corrida sin re-ejecutar las pruebas.

**4.2 — `code-review` (solo en PR de implementación).** Invocar el flujo de `code-review` (revisión cualitativa: intención, arquitectura y diseño) con `base origin/<destino>`, su alcance por defecto (todo lo que la rama difiere de esa base, incluidas las correcciones que `4.1` haya podido dejar sin commitear). Emite un veredicto **propio e independiente** del de `4.1`; ninguno sustituye al otro. Si el `docs/audits/code-review.md` existente ya estaba fresco **y aprobado** (mismo fingerprint, misma base y mismo modo, y `4.1` no aplicó correcciones), lo devuelve sin volver a revisar — **no** forzar `revalidate` desde aquí. Un informe previo en `❌`/`⚠️` nunca se sirve desde caché: `code-review` lo revisa de nuevo por su cuenta.
- Aprobado = `verdict=APPROVED` en la marca de pie → continuar.
- Rechazado = `verdict=REJECTED` o `verdict=INCOMPLETE` → detener.

**4.3 — `trace-validate` (solo en PR de implementación).** Resolver el **trabajo** a validar (`US-XXX` o `WI-XXX`) del patrón de la rama, del prefijo de los commits, o de la ruta de trabajo. `trace-validate` traza los **criterios de aceptación** `AC-XXX` del trabajo (mismo formato en US y WI). Si no se puede determinar el trabajo, preguntar al usuario cuál validar; si no lo provee, la puerta **no** puede quedar aprobada → detener. Invocar `trace-validate` sobre ese trabajo. Reutiliza el `test-run.json` producido por `4.1` (misma rama, sin cambios) y, si el `coverage.md` ya estaba fresco, lo devuelve sin regenerarlo.
- Aprobado = `verdict=APPROVED` en la marca de pie → continuar. El `⚠️` de esta puerta es `APPROVED_WITH_NOTES` y **también** se considera aprobado, pero se **muestran las observaciones al usuario** antes de seguir.
- Rechazado = `verdict=REJECTED` → detener.

**4.4 — Definition of Done (solo si existe el archivo).** Comprobar si existe `docs/policies/definition-of-done.md` en la raíz del repo (`test -f docs/policies/definition-of-done.md`).

> **Ningún skill del plugin genera ese archivo: lo escribe y lo mantiene el equipo.** Es deliberado —una Definition of Done es un acuerdo del equipo, no un artefacto derivable— y por eso la puerta es condicional: en un repo que no lo tenga, simplemente no aplica. Si el usuario pregunta cómo tenerla, indicarle que basta con crear ese archivo con una checklist de condiciones de cierre verificables; no ofrecer generarla por él.
- Si **no** existe → omitir esta puerta (no afecta el resultado).
- Si **existe** → leerla y verificar el código/cambio contra cada política/ítem de esa Definition of Done, sobre el rango `origin/<destino>` contra el estado actual del árbol, de modo que incluya las correcciones que las puertas anteriores hayan podido dejar sin commitear (el mismo alcance que `4.2` en un PR de implementación; en una promoción, donde `4.2` no corre, el rango sigue siendo ese). **Formato esperado de `docs/policies/definition-of-done.md`:** un documento de política con ítems/checklist verificables (cada ítem una condición concreta de cierre). El skill solo evalúa automáticamente los ítems comprobables desde el repo o el diff; para el resto, pregunta.
  - **Ítems comprobables desde el repo/diff** → evaluarlos directamente: cumplido / incumplido.
  - **Ítems no comprobables automáticamente** → **presentarlos al usuario y preguntarle** si se cumplen (no inventar su cumplimiento). Si el usuario **confirma** que se cumplen → cuentan como cumplidos. Si **no los confirma** o los marca incumplidos → cuentan como incumplidos.
  - Aprobado = todos los ítems aplicables se cumplen (los comprobables verificados + los no comprobables confirmados por el usuario) → continuar.
  - Rechazado = al menos un ítem incumplido, o algún ítem no comprobable que el usuario no confirma → la puerta **no** queda aprobada → detener, listando qué ítem(s) de la DoD no se cumplen o quedan sin confirmar.

Solo si **todas las puertas aplicables** quedan en aprobado se avanza al Paso 5 (archivado, solo implementación) y de ahí al push.

#### Puertas en un PR de promoción

Una promoción **no introduce código nuevo**: cada trabajo que viaja en ella ya pasó las tres puertas cuando se integró en la rama de integración. Repetirlas aquí no descubre nada y sale caro. Lo que sí queda por demostrar —y nadie verificó feature por feature— es que la **rama consolidada** está verde: eso es exactamente `quality-check`.

| Puerta | Por qué no aplica |
|--------|-------------------|
| `code-review` | Su unidad es un diff sin revisar. En una promoción, todo el diff `origin/<destino>..HEAD` ya fue revisado y aprobado PR a PR; volver a pasarlo sería revisar diez diffs ya cerrados y produciría hallazgos sobre código que ya se justificó en su momento. |
| `trace-validate` | Valida **un** artefacto contra sus criterios de aceptación. Una promoción abarca varios trabajos, así que no hay un artefacto que validar; y cada uno ya trae su `coverage.md` aprobado. |

Reglas al reportar:

- En el resumen al usuario y en la descripción del PR, esas dos puertas se listan como `N/A` (`—`) con el motivo «PR de promoción». **No** se omiten en silencio ni se marcan como aprobadas: quien lea el PR debe ver que no corrieron y por qué.
- **La Definition of Done sí aplica**, si el archivo existe: sus ítems suelen ser condiciones de despliegue (changelog, versión, migraciones revisadas) que es justo aquí donde toca comprobar. Su alcance es el mismo rango `origin/<destino>..HEAD`.
- Si el usuario **pide expresamente** una revisión adicional, se puede invocar `code-review` o `trace-validate` a mano; no es parte del flujo ni condiciona la creación del PR.

### Paso 5 — Archivar el artefacto de trabajo (solo PR de implementación)

Con **todas** las puertas del Paso 4 en aprobado, el trabajo está listo para integrarse: mover su carpeta de especificación a `docs/archive/` **en la rama actual**, antes del push, para que el archivado viaje dentro del PR y se integre en el mismo merge que el código. Si el archivado no aplica (promoción, rama `test/`, carpeta ya archivada), no se resuelve `archiveMode` ni se pregunta nada — se salta el paso.

Si aplica, resolver `implementation.archiveMode` (ver [`../work-integrate/references/archive.md`](../work-integrate/references/archive.md#política-implementationarchivemode)): con `ask` (por defecto), **ofrecer al usuario** el movimiento y **preguntar primero, mover después** — sin un sí explícito no se mueve nada; con `always`, mover directo sin preguntar; con `never`, no archivar ni preguntar. En los tres casos, no archivar **no impide crear el PR**: se anota como omitido en el Paso 9 (con el motivo: declinado, `never`, o sin canal para preguntar) y el flujo sigue.

**Localizar la carpeta y verificar el `progress.md`.** Buscar primero en la ruta activa (`docs/specs/<user-stories|work-items>/<ID>-<slug>/`) y, si no está ahí, en `docs/archive/`: si aparece en el archivo, el trabajo **ya estaba archivado** — informarlo en el reporte y saltar el resto del paso, no es un error.

En la ruta activa, leer su `progress.md` y comprobar que **todas** las unidades del trabajo están en `Done` — a diferencia de `work-integrate`, este skill no lo valida en su pre-flight, así que se hace **aquí**. Si alguna no lo está, o si el `progress.md` no existe, **no se archiva**: el PR **sí** se crea (las puertas pasaron; no es este el momento de bloquearlo) y se avisa en el reporte del Paso 9 — «No se archivó `US-XXX`: TK-002 en `In Progress`».

| | |
|---|---|
| **Aplica a** | `US-XXX` y `WI-XXX` en un **PR de implementación** |
| **No aplica a** | PR de **promoción** (cada trabajo ya se archivó al integrarse); **cualquier** rama `test/`, sea sobre `FT-XXX`, `US-XXX` o `WI-XXX` (cierra unos `TC-XXX`, no el artefacto); trabajos cuyo `progress.md` no esté completo en `Done` (se avisa, no se bloquea); y trabajos cuya carpeta ya esté bajo `docs/archive/` (ya archivados: se informa y se sigue) |
| **Destino** | `docs/archive/user-stories/US-XXX-{slug}/` · `docs/archive/work-items/WI-XXX-{kebab-case}/` · investigaciones `RS-XXX` sueltas que quedan huérfanas: `docs/archive/research/RS-XXX-{slug}/` |
| **Confirmación** | Según `implementation.archiveMode`. Con `ask` (por defecto), **obligatoria**: se muestra qué se movería (carpeta + investigaciones huérfanas) y se pide confirmación con la herramienta de preguntas estructuradas — sin un **sí** explícito no se mueve nada. Con `always`, se mueve directo. Con `never`, no se mueve nada. En ningún caso archivar (o no hacerlo) **impide crear el PR**. Sin canal de respuesta con `ask`: no se archiva. Se reporta el desenlace en el Paso 9. |

El trabajo a archivar es el mismo que resolvió `4.3` (`trace-validate`); no volver a deducirlo por otra vía. Si `4.3` no corrió porque el modo es promoción, este paso entero se omite. **Que `4.3` resuelva un `US-XXX` desde una rama `test/US-XXX` no habilita el archivado:** ese PR cierra la automatización de unos `TC-XXX`, no la historia.

**El orden importa:** `4.3` escribe el `coverage.md` **dentro** de la carpeta del trabajo, así que archivar antes lo dejaría escribiendo en una ruta que ya no existe. Y archivar **después** del push dejaría el movimiento fuera del PR.

El `git mv` queda **stageado sin commitear**: lo recoge la re-comprobación del working tree del Paso 6. No commitear aquí.

Procedimiento completo —guards de destino, investigaciones `RS-XXX` sueltas que quedan huérfanas, reparación de enlaces relativos, formato del reporte, anti-patrones— en [`work-integrate/references/archive.md`](../work-integrate/references/archive.md). Es el **mismo** procedimiento en los dos skills: no reimplementarlo aquí ni divergir de él.

Si el `git mv` falla (destino ya ocupado, origen inexistente con destino presente), aplicar lo que dice esa referencia: parar e informar en el primer caso, informar y continuar en el segundo. **No** se crea el PR con un archivado a medias.

### Paso 6 — Push de la rama actual

**Antes del push, re-comprobar el working tree.** Las puertas del Paso 4 pueden haber dejado cambios sin commitear (correcciones aplicadas por `quality-check` o delegadas en `work-implement`), y el Paso 5 deja stageado el renombrado del archivado, si el usuario lo confirmó. Ejecutar `git status --porcelain` y, si hay salida, **invocar de nuevo `git-commit`** con el mismo criterio del pre-flight: el **código** que se sube debe ser exactamente el que las puertas verificaron. El archivado del Paso 5 es la única salvedad, y es deliberada: mueve documentación bajo `docs/specs/`, no toca código ni fuentes de prueba, así que no invalida los veredictos de `quality-check` ni de `code-review`. Sí desplaza el `SPEC_FINGERPRINT` de `trace-validate`, cuyo `coverage.md` se regenerará una vez en la siguiente validación. **En modo promoción, borrar antes `docs/audits/quality-check.md` del árbol** y, si `develop` lo traía trackeado, retirarlo del índice — ver la nota siguiente. Solo entonces re-comprobar el estado e invocar `git-commit`.

> **`.sdd-devkit/test-run.json` nunca se commitea**, en ninguno de los dos modos: está en el `.gitignore` porque es una caché local y desechable, y un resultado de pruebas producido en otra máquina no es evidencia aquí. Nada de lo que sigue desplaza el fingerprint de frescura: `.sdd-devkit/` cae bajo la exclusión de **carpetas ocultas** y `docs/` bajo la suya.
>
> **En un PR de implementación, los informes viajan en el PR.** Las puertas escriben `docs/audits/quality-check.md`, `docs/audits/code-review.md` y el `coverage.md` del trabajo; ese commit los incluye a propósito, para que el revisor vea los tres veredictos junto al cambio. **Pero los dos de `docs/audits/` son fotos de esta rama y no deben quedarse en la de destino:** su encabezado lleva la rama y el commit sobre los que se corrieron las puertas, en `develop` afirmarían un veredicto que nadie ejecutó allí, y como viven en una ruta fija, cada rama que se integre los pisaría. `work-integrate` los retira dentro del propio merge, pero **aquí el merge lo hace la plataforma y este skill no lo controla**. De ahí dos cosas:
>
> - **Decirlo en el cuerpo del PR.** La descripción que compone el Paso 7 cierra con esta línea: «`docs/audits/quality-check.md` y `docs/audits/code-review.md` son artefactos de esta rama — eliminarlos al integrar.»
> - **Al reportar al usuario**, recordar que tras el merge en la plataforma conviene borrarlos en la rama de destino (`git rm docs/audits/quality-check.md docs/audits/code-review.md`), o integrar con `work-integrate`, que ya lo hace solo. **Solo esos dos**: los `arch-audit-*.md`, las copias de `save-report` y el `coverage.md` del trabajo sí pertenecen a la rama base.
>
> **En un PR de promoción, el informe no llega a disco.** Aquí la rama de origen **ya es** una rama de integración: commitear `docs/audits/quality-check.md` lo dejaría plantado en `develop` y de ahí viajaría a `master` con la promoción — el problema anterior, pero sin nadie que pueda limpiarlo después. El manejo, en el orden exacto en que ocurre:
>
> 1. Tras leer el veredicto de `4.1`, **borrar el informe del árbol de trabajo** con `rm -f docs/audits/quality-check.md` (`rm`, no `git rm`: en la mayoría de repos ni siquiera está trackeado).
> 2. **Si `develop` ya lo traía trackeado** —lo habitual si antes se integraron PRs de implementación que sí lo commiteaban—, retirarlo también del índice: `git rm -q -f --ignore-unmatch ':(top,glob)**/docs/audits/quality-check.md' ':(top,glob)**/docs/audits/code-review.md'`. Las rutas van **ancladas a la raíz (`:(top)`) y con `**/`**: en un monorepo `quality-check` audita el módulo elegido y escribe en `packages/<mod>/docs/audits/`, que un pathspec literal no alcanzaría. Ese borrado **sí** se commitea: limpia la rama de integración de informes que nunca debieron llegar ahí.
> 3. El **veredicto y el resumen** van en la descripción del PR, que es donde el revisor de una promoción los necesita y que muere con el PR.
>
> **Por qué borrar y no «dejarlo sin commitear».** Este skill no puede excluir un archivo del commit: delega en `git-commit`, al que no se le puede **imponer** un alcance desde fuera (el suyo lo decide él), y el propio flujo manda reinvocarlo hasta que el árbol quede limpio — el remanente sería justo ese informe, así que o entra en bucle o se commitea lo que se quería evitar. Borrarlo deja el árbol limpio, que es la precondición que asumen tanto el push de este flujo como cualquier cambio de rama posterior — un archivo modificado sin commitear haría fallar un `git checkout`.
>
> Si el usuario quiere constancia en disco de esa corrida, `save-report` deja una copia con marca de tiempo que él puede commitear a mano.

Si la rama no existe en `origin` o tiene commits no publicados (`git rev-list origin/<rama>..HEAD` no vacío): ejecutar `git push -u origin <rama-actual>`. Nunca `--force` ni `--force-with-lease`. Si el push falla por divergencia: parar y avisar — el usuario decide cómo resolver.

> **En modo promoción, el push es a una rama protegida: confirmarlo.** La rama actual es `develop`, que tras uno o varios `work-integrate` acumula **merges locales** que nadie ha publicado — y `work-integrate` deja ese push explícitamente como decisión del usuario, fuera de su alcance. Antes de empujar, listar los commits que se van a publicar y pedir confirmación. Es la única operación de todo el flujo que escribe en una rama protegida del remoto; en modo implementación no aplica, porque ahí se empuja la rama de trabajo.

### Paso 7 — Generar título y descripción

Sin pedir confirmación (salvo override explícito del usuario):

**En un PR de implementación:**

- **Título:** un único commit en el rango → su subject (`git log -1 --pretty=%s`). Varios commits → subject del más antiguo. Si la rama sigue patrón `<prefix>/<TICKET>-<desc>` o `US-XXX-...`, anteponer `[<TICKET>]`. Traducir al idioma resuelto manteniendo el prefijo de ticket intacto.
- **Descripción:** lista de commits (`git log origin/<destino>..HEAD --pretty="- %s"`), resumen de cambios (`git diff --stat origin/<destino>..HEAD`) y referencia a issue/ticket si el nombre de la rama lo contiene (patrón `US-XXX`, `TK-XXX`, `JIRA-XXX`, `#NNN`).

**En un PR de promoción**, el rango son commits de merge de varios trabajos y una lista plana de subjects no dice nada útil:

- **Cómo se extraen los trabajos** (también lo usa la confirmación del Paso 3). Probar en este orden y quedarse con el primero que dé resultado:
  1. Commits de merge: `git log origin/<destino>..HEAD --merges --pretty="- %s"`, buscando `US-XXX`/`WI-XXX`.
  2. Identificadores en los subjects de **todos** los commits del rango — necesario cuando la plataforma integró con **squash merge**, que no deja commits de merge.
  3. Nombres de rama presentes en el rango.

  Si ninguno da nada, **no inventar**: el título va sin lista y la confirmación del Paso 3 se formula por delta («N commits») en lugar de enumerar trabajos.
- **Título:** `Promoción <origen> → <destino>`, más los identificadores si se obtuvieron (p. ej. `Promoción develop → master (US-042, US-047, WI-007)`) o `(N commits)` si no. Sin prefijo de ticket: no hay uno solo.
- **Descripción:** los **trabajos que se promueven**, el **delta** (`git rev-list --count origin/<destino>..HEAD` commits) y el resumen de cambios (`git diff --stat origin/<destino>..HEAD`). Si algún commit del rango no mapea a ningún trabajo, listarlo aparte como «commits sueltos»: es información que el revisor de una promoción quiere ver.
- **Veredictos de las puertas:** el de `quality-check` con su resumen —aquí va **el contenido**, no un enlace: el informe no se commitea en este modo— y las otras dos como `N/A` (`—`) con el motivo «PR de promoción», con el motivo en una línea.

**Solo en implementación**, si el commit de las puertas incluyó informes en `docs/audits/`, añadir como última línea: «`docs/audits/quality-check.md` y `docs/audits/code-review.md` son artefactos de esta rama — eliminarlos al integrar.» Ver la nota del Paso 6.

### Paso 8 — Crear PR/MR

| Plataforma | Comando |
|-----------|---------|
| GitHub | `gh pr create --base <destino> --head <rama> --title "<título>" --body "<desc>"` |
| GitLab | `glab mr create --target-branch <destino> --source-branch <rama> --title "<título>" --description "<desc>" --yes` |
| Bitbucket Cloud | `POST https://api.bitbucket.org/2.0/repositories/<workspace>/<repo>/pullrequests` con payload JSON |
| Bitbucket Server | `POST /rest/api/1.0/projects/<key>/repos/<slug>/pull-requests` con payload equivalente |
| Azure Repos | `az repos pr create --source-branch <rama> --target-branch <destino> --title "<título>" --description "<desc>"` |
| Gitea/Forgejo | `tea pr create --base <destino> --head <rama> --title "<título>" --description "<desc>"` |

Si el CLI indica que ya existe un PR: capturar y devolver la URL existente.

### Paso 9 — Reportar

`
✓ PR creado en <plataforma>
  Origen:  <rama-actual>
  Destino: <rama-destino>
  Título:  <título-generado>
  URL:     <url>
`

**En un PR de implementación**, añadir debajo el desenlace del archivado del Paso 5:

- **Si se archivó** — el bloque con origen → destino de la carpeta y qué pasó con las investigaciones sueltas, con el formato de [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#reporte-al-usuario).
- **Si no se archivó** — una línea con el motivo: el usuario lo declinó, no había canal para confirmarlo, el `progress.md` no estaba completo en `Done`, o el trabajo ya estaba archivado. Nunca omitirlo en silencio.

En una promoción no aparece ninguna de las dos: el archivado no aplica a ese modo.

Bloqueo por una puerta de calidad:
`
✗ PR NO creado: la puerta <quality-check | code-review | trace-validate | definition-of-done> no quedó en `APPROVED`.
  (En un PR de promoción solo pueden aparecer aquí quality-check y definition-of-done.)
  Veredicto: <`REJECTED` (quality-check) | `INCOMPLETE` (quality-check) | `REJECTED` (code-review) | `INCOMPLETE` (code-review) | `REJECTED` (trace-validate) | DoD incumplida>

<reporte literal del skill, o lista de ítems de la DoD incumplidos>

Acciones para reintentar:
  <pasos concretos que debe tomar el usuario para dejar la puerta en aprobado>
`
Si la corrección está al alcance de este skill, ofrecer aplicarla antes de pedir acción manual (ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad)).

---

## Manejo de fallos en las puertas de calidad

Cuando una de las puertas del Paso 4 no queda en aprobado, **detener** el flujo (sin push ni PR) y, en este orden:

1. **Informar** al usuario qué puerta falló, con su veredicto/motivo y el reporte literal del skill (o la lista de ítems de DoD incumplidos).
2. **Indicar las acciones concretas** que debe tomar para dejar la puerta en aprobado y poder reintentar la creación del PR (p. ej. «corregir los tests fallidos de `X`», «cubrir el criterio `AC-003` con un test», «cumplir el ítem "changelog actualizado" de la DoD»).
3. **Si la corrección está al alcance de este skill**, no aplicarla en automático: **preguntar al usuario** si desea que se aplique. Solo con su autorización explícita, aplicar la corrección mínima y **reintentar** la puerta que falló; si esa puerta vuelve a quedar aprobada, continuar con el resto del flujo (re-ejecutando las puertas posteriores que correspondan). Si el usuario no autoriza, terminar dejando las acciones indicadas.

Notas:
- Las correcciones dentro de `quality-check`, `code-review` y `trace-validate` se gobiernan por el flujo propio de cada skill (que también exige autorización del usuario). No re-implementar esa lógica aquí.
- Tras cualquier corrección autorizada, **re-ejecutar** la puerta afectada antes de avanzar; no asumir que quedó aprobada.

---

## Ejemplos

**Ejemplo 1 — Camino feliz (GitLab self-managed)**
Usuario: «Crea el PR de esta rama.»
Skill: pre-flight OK (rama `feature/US-042-auth-refresh-token`). Detecta GitLab (`ns.bayteq.com:3311`). Pregunta destino → `develop`. Puertas: `quality-check` → `APPROVED`; `code-review` con `base origin/develop` → `APPROVED`; resuelve `US-042`, `trace-validate` → `APPROVED`; existe `docs/policies/definition-of-done.md` → todos los ítems cumplidos. Pregunta si archivar, mostrando `docs/specs/user-stories/US-042-auth-refresh-token/` → `docs/archive/user-stories/` más `RS-003` (suelto, sin artefactos activos que lo referencien) → `docs/archive/research/`; el usuario confirma y `git-commit` recoge el renombrado. Push. Auto-genera título `[US-042] feat(auth): refresh token con expiración 15min`. Ejecuta `glab mr create`. Devuelve URL.

**Ejemplo 2 — quality-check bloquea**
`quality-check` devuelve `REJECTED` (tests fallidos + eslint errors). El skill no crea el PR, no hace push, muestra el reporte, lista las acciones para reintentar y —al estar a su alcance— pregunta si aplica la corrección. Si el usuario no autoriza, termina.

**Ejemplo 3 — trace-validate bloquea**
`quality-check` y `code-review` → `APPROVED`, pero `trace-validate` de `US-042` devuelve `REJECTED` (criterio `AC-003` sin test). El skill no crea el PR; informa que falta cubrir `AC-003` y pregunta si desea que se intente la corrección (delegando al flujo correspondiente). Sin autorización, termina con las acciones indicadas.

**Ejemplo 4 — Definition of Done incumplida**
Las tres primeras puertas en aprobado, pero `docs/policies/definition-of-done.md` exige «CHANGELOG.md actualizado» y el diff no lo toca. El skill detiene la creación, lista ese ítem como incumplido e indica la acción; si el usuario autoriza y la corrección está a su alcance, la aplica y reintenta la puerta.

**Ejemplo 5 — Sin Definition of Done**
No existe `docs/policies/definition-of-done.md`. Esa puerta se omite; el PR se crea si las puertas del modo quedaron en aprobado — las tres en implementación, solo `quality-check` en promoción.

**Ejemplo 6 — Azure Repos**
`origin` apunta a `https://dev.azure.com/<org>/<proyecto>/_git/<repo>`. Detecta Azure Repos, verifica `az repos`, pregunta destino, ejecuta las puertas, push, crea PR con `az repos pr create`.

**Ejemplo 7 — PR de promoción**
Usuario en `develop`: «crea un PR a master.» El Paso 1 no bloquea: `develop` es rama de integración, así que el modo queda abierto. El Paso 3 ve que el destino es una rama de despliegue y **confirma**: «Vas a crear un PR de promoción de `develop` a `master`: 23 commits, trabajos US-042, US-047 y WI-007. ¿Es lo que quieres, o te olvidaste de cambiar a tu rama de trabajo?». Confirmado, corre `quality-check` (+ DoD si existe), marca `code-review` y `trace-validate` como `N/A` (`—`) con el motivo «PR de promoción», y crea el PR titulado `Promoción develop → master (US-042, US-047, WI-007)`.

**Ejemplo 7b — Promoción hacia atrás**
Usuario en `master`: «crea un PR a develop.» Fila 3 de la tabla de decisión: `develop` está **aguas arriba** de `master` en el orden del ciclo, así que no es una promoción. Parar: «Traer `master` a `develop` es sincronizar, no promover: hazlo con un merge — no con este skill.»

**Ejemplo 7c — Rama sin prefijo ni rol reconocible**
Usuario en `hotfix-cache` (no sigue ningún prefijo reconocido y no es rama de integración): «crea un PR a develop.» Fila 5: **preguntar** a qué categoría pertenece. Si el usuario responde que es una rama de trabajo, se trata como PR de implementación (fila 1); si no lo aclara, parar indicando la convención esperada. **No** se clasifica como promoción por descarte.

**Ejemplo 7d — Olvido de cambiar de rama**
Usuario acaba de correr `work-integrate` (que deja HEAD en `develop`) y pide «crea el PR de mi feature». El Paso 3 pregunta por el destino y detecta el par `develop → develop`: parar y avisar de que el trabajo ya está integrado localmente y que, si quiere el PR de la feature, debe volver a su rama; si quiere promover `develop`, indicar una rama de despliegue como destino.

**Ejemplo 8 — Working tree sucio**
`git status --porcelain` devuelve dos archivos modificados sin commitear. El skill invoca automáticamente el flujo de `git-commit` sobre esos cambios (sin preguntar si conviene invocarlo) — `git-commit` solo pausaría si propusiera una división en varios commits; un commit único lo ejecuta sin confirmar — y, una vez el working tree queda limpio, continúa el pre-flight con normalidad.

**Ejemplo 9 — PR ya existente**
La rama ya tiene un PR/MR abierto hacia `develop`. Devolver la URL existente con nota «Ya existe un PR para esta combinación». No crear uno nuevo.

---

## Anti-patterns

- Preguntar la rama origen (siempre es la actual) o asumir la destino.
- Preguntar la plataforma (se detecta del remoto).
- Preguntar si correr una puerta que **aplica al modo**, u ofrecer saltarla: las que aplican son obligatorias.
- **Tratar toda rama protegida como un error de pre-flight.** Estar en `develop` con destino `master` es una promoción legítima, no un despiste; lo que resuelve la ambigüedad es la confirmación del Paso 3, no un bloqueo.
- **Clasificar el modo en el Paso 1**, antes de conocer el destino: el modo depende del **par** origen→destino, y decidirlo a medias produce reglas que se contradicen entre sí.
- Usar «la rama de la que nace el origen» para detectar una promoción hacia atrás: en git-flow `develop` nace de `master`, así que ese criterio clasificaría `develop → master` como marcha atrás y desactivaría el modo. La dirección la fija el **orden aguas abajo**.
- **Clasificar como promoción una rama que no encaja en nada** (`hotfix-cache`, `PROJ-1234`) por descarte, en lugar de preguntar (fila 5).
- A la inversa: **dar por hecho que es una promoción sin confirmarlo**. El mismo estado se da cuando alguien olvidó cambiar de rama —típicamente justo después de `work-integrate`, que deja HEAD en la base—, y ahí el PR correcto es otro.
- **Marcar `code-review` o `trace-validate` como aprobadas en una promoción**, u omitirlas en silencio: se reportan como `N/A` (`—`) con el motivo «PR de promoción», con el motivo visible en el PR.
- Saltarse `code-review` o `trace-validate` en un PR de **implementación** con el argumento de que «ya se revisó»: ahí sí aplican, sin excepción.
- Dar por cumplida una puerta a partir del veredicto de otra (p. ej. asumir `code-review` aprobado porque `quality-check` lo está): son skills independientes con veredictos propios.
- Pedir confirmación de título o descripción (flujo no interactivo).
- Crear el PR con `quality-check` o `code-review` en `REJECTED`/`INCOMPLETE`, con `trace-validate` en `REJECTED`, o con la Definition of Done incumplida.
- En un PR de implementación, saltarse `trace-validate` por no encontrar el trabajo (US/WI) en lugar de preguntarlo al usuario — o declararlo «promoción» para esquivar la puerta.
- **Archivar el artefacto antes de que pasen las puertas**, o antes de que `4.3` escriba el `coverage.md` dentro de su carpeta.
- **Archivar en un PR de promoción**, en una rama `test/`, o con el `progress.md` incompleto: el Paso 5 no aplica ahí.
- **Archivar después del push o del merge**, dejando el movimiento fuera del PR.
- **Archivar sin confirmación explícita del usuario**, o dar por hecho el sí porque las puertas pasaron.
- **Tratar una negativa como un bloqueo:** el PR se crea igual, con el archivado anotado como omitido.
- Reimplementar el archivado aquí en vez de seguir [`work-integrate/references/archive.md`](../work-integrate/references/archive.md), o divergir de ese procedimiento.
- Commitear `docs/audits/quality-check.md` en un PR de promoción: el origen ya es una rama de integración y ese informe acabaría en la de despliegue sin nadie que lo limpie. Se borra del árbol antes del commit; si la rama ya lo traía trackeado, se retira del índice y ese borrado sí se commitea.
- Intentar «excluir un archivo» del commit delegando en `git-commit`: su alcance lo decide él, no se le impone desde fuera. O se borra antes, o entra.
- Empujar `develop` a `origin` en modo promoción sin confirmarlo: son merges locales que el usuario aún no había publicado.
- Dar por hecho que el rango trae commits de merge con `US-XXX`: con squash merge no los hay. Degradar a los subjects y a los nombres de rama, y si no sale nada, no inventar la lista.
- Tratar la ausencia de `docs/policies/definition-of-done.md` como un fallo: si no existe, esa puerta simplemente se omite.
- Inventar el cumplimiento de un ítem de la DoD que no se puede determinar desde el repo o el diff.
- Aplicar una corrección sin autorización explícita del usuario, o no re-ejecutar la puerta tras corregir.
- Ejecutar `git add`/`git commit` directos (fuera del flujo de `git-commit`), o parar a preguntar al usuario si desea commitear los cambios pendientes: ante working tree sucio se invoca automáticamente el flujo de `git-commit` (aunque `git-commit` pueda a su vez pausar para confirmar una propuesta de división, o detenerse ante secretos, rama protegida o hook fallido), sin que `pr-create` pida permiso previo para invocarlo.
- Crear el PR desde una rama que no es ni de implementación (prefijo reconocido) ni de integración/despliegue.
- Usar `git push --force` o `--force-with-lease`.
- Asignar reviewers, labels o milestones por iniciativa propia.
- Re-implementar la lógica de `quality-check`, `code-review` o `trace-validate` en lugar de invocar el flujo existente.
- Crear un segundo PR cuando ya existe uno para `<rama-actual> → <destino>`.