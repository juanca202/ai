# Ejemplos, anti-patrones y notas

Referencias del skill **work-integrate**. Cubren los dos tipos de trabajo (`US-XXX`, `WI-XXX`).

---

## Ejemplos

**Ejemplo 1 — Historia de usuario (camino feliz)**

- *Entrada:* Rama `feature/US-042-exportacion-csv`, working tree limpio, `progress.md` con tres TK todas en `Done`, reflog indica `Created from develop`.
- *Salida:* `quality-check` → `APPROVED` (persiste `.sdd-devkit/test-run.json`); `code-review` → `APPROVED`; `trace-validate` → `APPROVED` (reutiliza ese `test-run.json`, sin re-ejecutar pruebas); se **pregunta si archivar**, mostrando `docs/specs/user-stories/US-042-exportacion-csv/` → `docs/archive/user-stories/` más `RS-003-formatos-csv` (suelta, sin referencias activas) → el usuario confirma → `git mv` de ambas y `git-commit` recoge el renombrado junto con los artefactos de las puertas; `git checkout develop` → `git merge --no-ff --no-commit feature/US-042-exportacion-csv` → `git rm` de `docs/audits/quality-check.md` y `docs/audits/code-review.md` → `git commit -m "Merge US-042: exportacion-csv"` → reporte: «Merged 7 commits de `feature/US-042-exportacion-csv` → `develop`. Commit de merge: `a1b2c3d`. HEAD en `develop`, working tree limpio. Los informes de las puertas quedaron en la rama del trabajo, no se integraron. La rama no fue borrada ni se hizo push.»

**Ejemplo 2 — Work item (progress.md por carpeta del WI)**

- *Entrada:* Rama `fix/WI-007-fuga-memoria`, working tree limpio, `docs/specs/work-items/WI-007-fuga-memoria/progress.md` con todas las unidades del WI en `Done`, reflog indica `Created from main`.
- *Salida:* Puertas aprobadas → se pregunta si archivar y el usuario confirma → `docs/archive/work-items/WI-007-fuga-memoria/` (el `RS-011` que enlaza se queda: `US-051`, aún activa, también lo referencia) → `git checkout main` → `git merge --no-ff --no-commit fix/WI-007-fuga-memoria` → `git rm` de los dos informes de `docs/audits/` → `git commit -m "Merge WI-007: fuga-memoria"` → reporte con commits integrados y hash de merge.

**Ejemplo 3 — Unidad pendiente**

- *Entrada:* Rama `feature/US-013-ajuste-permisos`, working tree limpio, `progress.md` con TK-001 en `Done` y TK-002 en `In Progress`.
- *Salida:* Sin operaciones git. Mensaje:
  `
  ⚠️ No es posible mergear todavía:
  - progress.md tiene unidades no Done:
    - TK-001: Done
    - TK-002: In Progress
  - Completa o marca explícitamente cada unidad como Done antes de reintentar.
  `

**Ejemplo 4 — Rama base ambigua**

- *Entrada:* Rama `feature/US-077-...`, reflog sin entrada `Created from`, sin upstream local; existen `main`, `develop` y `release/2026.q2` como ancestros plausibles.
- *Comportamiento:* El agente lista los candidatos y pregunta cuál es la rama base correcta. No asume `main` ni `develop`. No mergea hasta tener respuesta.

**Ejemplo 5 — Working tree sucio**

- *Entrada:* Rama `feature/US-051-...`, dos archivos modificados sin commitear, `progress.md` íntegro en `Done`.
- *Salida:* El skill invoca automáticamente el flujo de `git-commit` sobre esos cambios (sin preguntar si conviene invocarlo) — `git-commit` solo pausaría si propusiera una división en varios commits; un commit único lo ejecuta sin confirmar — y, una vez el working tree queda limpio, continúa con el resto de la validación y el merge con normalidad.

**Ejemplo 6 — Conflicto en el merge**

- *Entrada:* Verificaciones OK, rama base `main`, `git merge --no-ff --no-commit` produce conflictos en `src/app/Module.java`.
- *Comportamiento:* El agente ejecuta `git merge --abort`, deja el repo en el estado previo **al merge**, lista los archivos en conflicto y pide al usuario resolverlos manualmente. No reintenta. El commit del paso 7 —artefactos de las puertas, más el archivado si se confirmó— sigue en la rama del trabajo y **no se revierte**: es parte de ella y se integrará cuando el merge prospere. Se menciona en el reporte.

**Ejemplo 7 — Rama con prefijo inválido**

- *Entrada:* Rama `hotfix-cache` (sin identificador de trabajo reconocible), `progress.md` íntegro en `Done`.
- *Salida:* Sin operaciones git. Mensaje: «La rama actual `hotfix-cache` no corresponde a ningún trabajo (`US-XXX`/`WI-XXX`) ni cumple un patrón de rama válido. Renombra la rama al formato de su tipo (p. ej. `git branch -m fix/WI-012-cache-ttl`) antes de reintentar el submit.»

**Ejemplo 8 — Trazabilidad rechaza**

- *Entrada:* Rama `feature/US-088-...`, working tree limpio, todas las TK en `Done`, `quality-check` y `code-review` → `APPROVED`.
- *Comportamiento:* `trace-validate` devuelve `REJECTED` (criterio `AC-003` sin prueba que lo cubra). Sin operaciones git: se reporta el criterio faltante y se pide cubrirlo (vía `work-implement`) antes de reintentar el submit. No se mergea.

**Ejemplo 9 — El usuario declina el archivado**

- *Entrada:* Rama `feature/US-061-…`, todo en `Done`, las tres puertas en `APPROVED`, delta contra `develop` = 4.
- *Comportamiento:* El paso 8 muestra `docs/specs/user-stories/US-061-…/` → `docs/archive/user-stories/` y pregunta. El usuario responde **No archivar** (prefiere dejarlo visible hasta cerrar el épico). No se ejecuta ningún `git mv`: el paso 7 commitea solo los artefactos de las puertas y el merge continúa con normalidad. El reporte final incluye «📦 Archivado: omitido — `US-061` se queda en `docs/specs/user-stories/` (no confirmado por el usuario).» **Ni se bloquea el merge ni se vuelve a preguntar.**

**Ejemplo 10 — Cierre desatendido, sin nadie que confirme**

- *Entrada:* La misma situación, en una ejecución programada sin canal de respuesta.
- *Comportamiento:* No se puede preguntar, así que **no se archiva** — ante la ausencia de respuesta se toma la opción que no mueve nada. El merge se completa igual y el reporte lo dice: «📦 Archivado: omitido — sin canal de respuesta para confirmar.» El archivado queda pendiente para una corrida interactiva.

---

## Anti-patterns

- **Narrar el flujo interno**: anunciar que se resuelve el idioma o la política, que se lee `settings.json`, que se carga una referencia, o ir enumerando los pasos en voz alta. Al usuario se le comunica el resultado, las preguntas que el flujo exija y lo que quede pendiente — no la maquinaria.
- **Correr este skill sobre una rama que ya se integró por un PR en la plataforma.** El delta contra la base es `0`, git responde *Already up to date*, y seguir adelante crea un commit que no es un merge y que solo borra los dos informes. El paso 7 lo corta antes — y por eso va delante del archivado: nada se mueve ni se commitea en una rama que solo había que dejar en paz.
- Encadenar `pr-create` (PR de implementación) **y** este skill sobre el mismo trabajo: son rutas de integración alternativas, no fases sucesivas.
- Hacer merge sin verificar `progress.md` o ignorando unidades no `Done`.
- **Archivar antes de que pasen las tres puertas**, o antes de que `trace-validate` escriba su `coverage.md` dentro de la carpeta del trabajo.
- **Archivar después del merge**, dejando el movimiento en la rama base como un cambio suelto en vez de integrarlo con el resto del trabajo.
- **Archivar en una rama `test/`** —incluidas `test/US-XXX` y `test/WI-XXX`—: la ejecución cierra unos `TC-XXX`, no el artefacto, y el paso 4 ni siquiera verificó las unidades funcionales del `progress.md`.
- **Archivar sin preguntar**, o dar por supuesta la confirmación porque las puertas pasaron: el archivado se confirma explícitamente, mostrando antes qué se movería.
- **Tratar un «no archivar» como un bloqueo del merge**: el trabajo se integra igual y la omisión se anota en el reporte.
- **Archivar un `RS-XXX` suelto** sin comprobar antes que ningún artefacto activo lo referencia; o usar `mv` en vez de `git mv` y perder la detección de *rename*.
- Buscar el `progress.md` de un WI en un archivo compartido `docs/specs/work-items/progress.md`; cada WI tiene su propio `progress.md` dentro de su carpeta `WI-XXX-[kebab-case]/`.
- Hacer merge sin haber ejecutado las **tres** puertas de cierre (`quality-check`, `code-review`, `trace-validate`). En particular, `quality-check` y `code-review` son independientes: un `REJECTED` o `INCOMPLETE` en cualquiera de los dos bloquea el merge, que solo procede con `APPROVED` en ambos.
- Unificar ambas puertas en una sola invocación o dar por hecha una a partir del veredicto de la otra — son skills independientes con veredictos propios.
- Hacer merge sin haber ejecutado `trace-validate`, con veredicto `REJECTED`, o corriéndolo **antes** de `quality-check` (perdería la reutilización de `test-run.json`) — va después de `quality-check` y solo procede con `APPROVED` / `APPROVED_WITH_NOTES`.
- Modificar `progress.md` para «forzar» que aparezcan en `Done` sin que el trabajo esté completo.
- Aceptar ramas sin un identificador de trabajo reconocible o con prefijos no válidos para su tipo (p. ej. `bugfix/`, `hotfix/`, o `fix/` aplicado a una US).
- Asumir `main`, `master` o `develop` como rama base sin confirmarlo por reflog, config o usuario.
- Resolver conflictos automáticamente o usar `--strategy=ours` / `--strategy=theirs` para **hacerlo pasar**.
- **Dejar que `docs/audits/quality-check.md` y `docs/audits/code-review.md` entren en la rama base**: son fotos de la rama del trabajo, y en la base quedarían afirmando un veredicto que nadie corrió allí. Se retiran del índice entre el `--no-commit` y el `git commit` del merge.
- Pasarse de celoso y borrar **todo** `docs/audits/`: los `arch-audit-*.md` y las copias de `save-report` sí pertenecen a la rama base.
- Borrar esos informes **en la rama del trabajo** para «limpiar antes de mergear»: la rama debe conservarlos: son la evidencia junto a los commits que verifican.
- Usar merge fast-forward por defecto cuando el historial de la rama se perdería; preservar con `--no-ff` salvo petición explícita del usuario.
- Hacer push de la rama base o borrar la rama del trabajo sin que el usuario lo pida explícitamente fuera del skill.
- Mergear desde una rama que no encaja con el patrón de su tipo.
- Parar a preguntarle al usuario si desea commitear los cambios pendientes en vez de invocar directamente el flujo de `git-commit`; el working tree sucio no detiene el submit — la invocación es automática (aunque `git-commit` pueda a su vez pausar para confirmar una propuesta de división, o detenerse ante secretos, rama protegida o hook fallido).
- Cerrar varios trabajos en una sola pasada del skill; este flujo cubre un trabajo por ejecución.
- Reintentar el merge tras un conflicto sin nueva instrucción del usuario.
- Narrar el trabajo realizado en el mensaje al usuario («leí progress.md», «detecté la rama»); solo reportar resultados y pendientes.
- Lanzar preguntas al usuario como prosa libre cuando el cliente expone una herramienta de preguntas estructuradas; preguntar la rama base sin listar candidatos como opciones tappables cuando la herramienta está disponible.

---

## Notas

### Handoffs del ciclo

Posición: **cierre local** — último paso de los pipelines de trabajo (sin push ni PR).

| | |
|--|--|
| **Entrada** | Rama del trabajo (`feature/US-XXX-...`, o `feature/`\|`fix/`\|`chore/`\|`refactor/` + `WI-XXX-...`); working tree con cambios pendientes se resuelve automáticamente invocando **`git-commit`** (sin preguntar si conviene invocarlo — `git-commit` sí puede pausar para confirmar una propuesta de división, o detenerse ante secretos, rama protegida o hook fallido); `progress.md` con cada unidad del trabajo en `Done`; puertas de cierre en aprobado: `quality-check` `APPROVED`, `code-review` `APPROVED` y `trace-validate` `APPROVED`. |
| **Salida** | Merge `--no-ff` a la rama base local, **sin los informes de las puertas** (`docs/audits/quality-check.md` y `code-review.md` se retiran antes de cerrar el commit de merge); reporte con hash de merge. Sin push ni borrado de rama. |
| **Siguiente paso (fuera del skill)** | Push de la rama base y CI — decisión del usuario. |
| **PR/MR de implementación (`pr-create`)** | **Ruta alternativa a este skill, no complementaria.** Son las dos formas de integrar el mismo trabajo: el PR lo cierra con un merge **en la plataforma**, este skill con un merge **local**. Elegir una. Hacer las dos integra dos veces y, además, el merge de la plataforma propaga a la base los informes que este skill retira. Si se opta por el PR, abrirlo estando en la rama del trabajo, sin correr `work-integrate`. |
| **PR/MR de promoción (`pr-create`)** | **Después** de este skill, y este sí encadena: con HEAD ya en la base, `pr-create` en modo promoción abre el PR de `develop` a la rama de despliegue con los trabajos acumulados. Estar en una rama protegida **no** bloquea; el skill confirma la intención antes de seguir. |
| **Regreso a implement** | Unidad no `Done` o `progress.md` incompleto → completar en **`work-implement`** y actualizar `progress.md` antes de reintentar. |
| **Regreso a define / plan** | Alcance reducido o unidad fuera de entrega → alinear con **`work-define`** / **`work-plan`** (US/WI), corregir `progress.md` y reintentar. |

### progress.md

El skill **lee** `progress.md` para verificar estados, pero no lo modifica. La actualización de estados durante la implementación es responsabilidad de **work-implement**. Si al revisar el archivo aparecen unidades en `In Progress` que sí están terminadas en código, el usuario debe corregir el archivo antes de reintentar el submit — no es papel del submit ajustar progreso.

### Estados de `progress.md`

Estados válidos por unidad: **`Pending`**, **`In Progress`**, **`Done`**. Solo **`Done`** (case-insensitive, sin espacios extra) cierra una unidad para merge.

### Detección de rama base

`git reflog show <branch>` es la fuente más fiable, pero solo funciona localmente y se pierde si la rama se clonó fresh o si `gc.reflogExpire` ya pasó. El fallback a `git config --get branch.<branch>.merge` cubre el caso de upstream local. Cuando ambos fallan, la pregunta al usuario es **por diseño**, no por descuido: el skill no debe adivinar la rama de integración.

### Sin push intencional

La decisión de cuándo publicar el merge en el remoto queda fuera del skill, para preservar el control del usuario sobre integración con CI/CD, MRs/PRs y revisión. El mensaje final al usuario debe dejar explícito que el merge es **solo local** y que push y limpieza de ramas son pasos manuales posteriores.

### Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno, cadenas de pensamiento ni narración del trabajo en curso. Si hay condiciones que bloquean el merge, listarlas en viñetas con detalle suficiente para que el usuario pueda actuar (qué archivos, qué unidades, qué estados).
