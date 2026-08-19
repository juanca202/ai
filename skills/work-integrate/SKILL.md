---
name: work-integrate
description: Cerrar e integrar el trabajo de una historia de usuario (US-XXX), una tarea de mantenimiento (WI-XXX) o una automatización de pruebas (rama test/ sobre un US-XXX, WI-XXX o FT-XXX) haciendo merge de la rama hacia la rama desde la que se creó, previa verificación de que progress.md tenga todas las unidades del trabajo en Done y de que pasen las puertas de calidad de cierre (quality-check, code-review y trace-validate). Cuando el trabajo es un US o WI en su rama funcional, pasadas las puertas archiva automáticamente su carpeta (y las investigaciones RS sueltas que quedan huérfanas) bajo docs/specs/archive/ antes del merge; en ramas test/ no archiva. Activar cuando el usuario pida cerrar, entregar, mergear, integrar, finalizar o hacer submit del trabajo de una historia, un WI, un feature o de la rama actual.
license: MIT
---

# Skill: Integración de trabajo

Guía para **cerrar e integrar** el trabajo ya implementado —una historia de usuario `US-XXX` o una tarea de mantenimiento `WI-XXX`— verificando que su `progress.md` tenga todas las unidades del trabajo en `Done`, que pasen las **puertas de calidad de cierre** (`quality-check`, `code-review` y `trace-validate`, en ese orden), y luego hacer **merge** de la rama actual hacia la rama desde la que se creó.

> **Alcance del submit:** El skill **cierra** localmente lo ya implementado. Verifica condiciones, **archiva el artefacto** (mueve su carpeta a `docs/specs/archive/`) y ejecuta `git merge --no-ff`. No hace push, no borra ramas, no crea MRs/PRs, no modifica el **contenido** de `progress.md`, y no resuelve conflictos —con la única salida declarada del `modify/delete` sobre los dos informes de `docs/audits/`, que se resuelve por el lado del borrado (ver [references/flows.md](references/flows.md)). Lo que no esté en `Done` bloquea el merge — el usuario decide cómo proceder, nunca se fuerza.

Encaja al final de los ciclos **work-define** → **work-plan** → **work-implement** (historias y tareas de mantenimiento). Ver Handoffs del ciclo en [references/examples.md](references/examples.md).

---

## Cómo preguntar al usuario

Cuando este skill indique **preguntar, pedir, confirmar, validar o sugerir** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** que ofrezca el cliente (la que renderiza opciones tappables o un selector de respuesta) en lugar de redactar la pregunta como prosa libre. Reglas:

- **Una pregunta por turno** cuando sea posible; máximo tres preguntas en un mismo bloque.
- **Opciones cortas y mutuamente excluyentes** (2–4 por pregunta) cuando la respuesta admita categorías; usar entrada libre solo si no hay forma razonable de enumerar opciones.
- **No repreguntar** lo que ya está respondido en el contexto, en `.agents/MEMORY.md` o en el `progress.md` del trabajo.
- **Una sola tanda al inicio** para resolver lagunas antes de cualquier operación git (trabajo asociado a la rama, carpeta ambigua, rama base); no ir descubriendo huecos turno a turno. **Rama base ambigua:** listar los candidatos detectados como opciones tappables (p. ej. `develop`, `main`, `release/2026.q2`); no proponer un default implícito.
- **Fallback**: si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3…).

Cada sección posterior que diga *preguntar al usuario*, *validar con el usuario*, *confirmar* o *sugerir al usuario* asume este mecanismo; no se vuelve a repetir.

---

## Resolución de idioma

Orden canónico compartido con el resto del ciclo de trabajo. Detenerse en el primer paso que aplique:

1. **`.agents/MEMORY.md`** (raíz del repo) → línea `preferred language: <ISO 639-1>` (p. ej. `es`, `en`). Si no existe esa línea pero hay claves legacy (`language:`, `idioma:`, `Project language:`), usarlas solo como fallback al leer MEMORY antiguo.
2. **Idioma del turno del usuario** (mensaje actual).
3. **Preguntar al usuario** qué idioma prefiere y persistir la respuesta en `.agents/MEMORY.md` con `preferred language: <código>`.

---

## Tipos de trabajo

El tipo se determina por el **identificador presente en el nombre de rama**. Cada tipo fija de dónde se deriva la carpeta, dónde vive el `progress.md` y qué se considera una **unidad** a cerrar.

| Tipo | Identificador en la rama | `progress.md` | Unidad a verificar en `Done` |
|------|--------------------------|---------------|------------------------------|
| **Historia de usuario** | `US-XXX` | `docs/specs/user-stories/US-XXX-[nombre-corto]/progress.md` (por carpeta de la US) | **todas** las `TK-XXX` de la US |
| **Tarea de mantenimiento** | `WI-XXX` | `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` (por carpeta del WI) | **todas** las unidades del `WI-XXX` en su propio `progress.md` |
| **Automatización de pruebas** | rama con prefijo `test/` + `FT-XXX`, `US-XXX` o `WI-XXX` | En la carpeta del artefacto padre: `docs/specs/features/FT-XXX-[slug]/progress.md`, o la de la US/WI correspondiente | **todas** las unidades de esa ejecución (el `FT-XXX` completo, o cada `TC-XXX` del alcance) |

> **Una rama = un trabajo.** El skill cierra el trabajo asociado a la rama actual. Cada tipo tiene su `progress.md` **dentro de la carpeta del trabajo** (la US, el WI o el feature) y contiene únicamente ese trabajo; se verifican **todas** sus unidades.
>
> **Ramas `test/`:** el entregable son pruebas automatizadas de los `TC-XXX` documentados por `test-define` (ver `work-implement`, `references/test-cases.md`). El `progress.md` de la US o el WI puede contener unidades de otras ramas (`TK-XXX`, el propio `WI-XXX`): en ese caso se verifican en `Done` **solo las unidades `TC-XXX`/`FT-XXX` de esta ejecución**, no las del trabajo funcional.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Carpeta / documento del trabajo | US: `docs/specs/user-stories/US-XXX-[nombre-corto]/` · WI: `docs/specs/work-items/WI-XXX-[kebab-case]/` · FT: `docs/specs/features/FT-XXX-[slug]/` |
| Progreso del trabajo | US: `…/US-XXX-[nombre-corto]/progress.md` · WI: `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` · FT: `docs/specs/features/FT-XXX-[slug]/progress.md` |
| Unidades referenciadas | US: `…/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` · WI: el propio `…/WI-XXX-[kebab-case]/README.md` · pruebas: `…/test-cases/TC-XXX-[slug].md` |
| Destino del archivado (paso 10) | US: `docs/specs/archive/user-stories/US-XXX-[nombre-corto]/` · WI: `docs/specs/archive/work-items/WI-XXX-[kebab-case]/` · investigaciones sueltas huérfanas: `docs/specs/archive/research/RS-XXX-[slug]/` |

---

## Convenciones de rama

- **Historia de usuario:** `feature/US-XXX-[nombre-corto]` con prefijo **`feature/` obligatorio**.
- **Work item:** `feature/WI-XXX-[kebab-case]` por defecto; se aceptan además los prefijos por tipo que usa `work-implement`: `fix/WI-XXX-...`, `chore/WI-XXX-...`, `refactor/WI-XXX-...`.
- **Automatización de pruebas:** prefijo **`test/`** + el identificador del artefacto padre: `test/FT-XXX-[slug]`, `test/US-XXX-[nombre-corto]`, `test/WI-XXX-[kebab-case]`.
- `XXX`: tres dígitos con cero a la izquierda (sin ADO); coincide con el identificador del trabajo.
- La carpeta/documento del trabajo se deriva descontando el prefijo de rama y leyendo el identificador: `feature/US-042-exportacion-csv` → `docs/specs/user-stories/US-042-exportacion-csv/`; `fix/WI-007-cache-ttl` → `docs/specs/work-items/WI-007-cache-ttl/`; `test/FT-003-carga-masiva` → `docs/specs/features/FT-003-carga-masiva/` (cada uno con su propio `progress.md`).
- Una rama sin un prefijo válido para su tipo o sin un identificador `US-XXX` / `WI-XXX` / `FT-XXX` reconocible **no** es submiteable por este skill.
- Ejemplos: `feature/US-042-exportacion-csv`, `fix/WI-013-fuga-memoria`, `test/FT-003-carga-masiva`.

---

## Información requerida antes de mergear

Antes de tocar git, el agente debe tener clara la siguiente información. **No asumir nada** — si algún dato no se resuelve, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Rama actual y tipo** | `git branch --show-current`; el tipo se infiere del identificador (`US-`/`WI-`/`FT-`) y del prefijo (`test/` ⇒ automatización de pruebas) | Si no encaja con un patrón válido: preguntar a qué trabajo corresponde antes de continuar |
| **Carpeta/documento del trabajo** | Derivar del nombre de rama según el tipo (ver [Tipos de trabajo](#tipos-de-trabajo)); si no está en la ruta activa, buscarla bajo `docs/specs/archive/` (el trabajo pudo archivarse en una corrida anterior) | Si no existe en ninguna de las dos: parar e informar; si hay varias coincidentes: preguntar cuál |
| **Estado de `progress.md`** | Leer el archivo en la ubicación correspondiente al tipo; si el trabajo ya está archivado, en su ruta bajo `docs/specs/archive/` | Si no existe en ninguna de las dos: parar e informar; el merge requiere `progress.md` poblado |
| **Working tree** | `git status --porcelain` | Si hay salida: invocar automáticamente el flujo del skill **`git-commit`** sobre los cambios pendientes (sin preguntar al usuario si conviene invocarlo — la decisión de invocar es automática; `git-commit` sí puede pausar con su propia propuesta y pedir confirmación antes de comitear, eso no lo decide `work-integrate`) y continuar una vez quede limpio; si `git-commit` no logra dejarlo limpio, parar e informar el motivo. Detalle operativo (fallback sin `git-commit`, working tree parcialmente limpio): ver [Validación antes de mergear](#validación-antes-de-mergear) |
| **Rama base** | (1) `git reflog show <branch>` → línea `Created from`; (2) `git config --get branch.<branch>.merge`; (3) preguntar al usuario | No asumir `main`, `master` ni `develop` por defecto |
| **Idioma de preferencia** | Ver [Resolución de idioma](#resolución-de-idioma) | Preguntar y persistir en `.agents/MEMORY.md` con `preferred language: <código>` |

> Leer el `progress.md` **completo** antes de iniciar cualquier operación git. Las tres condiciones (rama, working tree, estados) se evalúan antes de cambiar de rama o invocar `git merge`.

---

## Validación antes de mergear

Antes de cambiar de rama o ejecutar el merge, verificar las siguientes condiciones. Si alguna falla, **no mergear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **Rama actual con formato válido para su tipo:** `feature/US-XXX-...`; `feature/`|`fix/`|`chore/`|`refactor/` + `WI-XXX-...`; o `test/` + `FT-XXX-...`|`US-XXX-...`|`WI-XXX-...`. Sin un identificador reconocible no se puede derivar la carpeta/documento del trabajo.
- **Working tree limpio:** `git status --porcelain` sin salida. Si hay cambios sin commitear, **invocar automáticamente el flujo del skill `git-commit`** sobre ellos (sin preguntar al usuario si conviene invocarlo — la decisión de invocar es automática, no requiere permiso previo) y continuar una vez el working tree quede limpio. La invocación delega en `git-commit` todo su criterio operativo (agrupación por cambio lógico, inferencia de tipo/scope/mensaje, staging, detección de secretos, confirmación de la propuesta) — `work-integrate` no decide un mensaje de commit ni qué stagear por su cuenta. **`git-commit` no tiene modo silencioso**: normalmente pausa mostrando su propuesta y pidiendo confirmación al usuario antes de comitear (y puede detenerse del todo si detecta secretos); ese comportamiento no se suprime ni se evita al invocarlo desde aquí — «sin preguntar al usuario» se refiere solo a que `work-integrate` no pide permiso para *invocar* `git-commit`, no a que `git-commit` deje de confirmar su propio commit.
  - **Si `git-commit` no está disponible** (skill no instalado o no localizable en el entorno): parar y avisar, mostrando los archivos pendientes y sugiriendo al usuario commitear manualmente antes de reintentar — no ejecutar `git add`/`git commit` directos como sustituto.
  - **Si `git-commit` deja el working tree parcialmente limpio por una decisión de alcance suya** (p. ej. commiteó unos archivos pero dejó otros fuera deliberadamente): no es un error — volver a comprobar `git status --porcelain` e invocar `git-commit` de nuevo sobre el remanente (mismo criterio, sin preguntar) hasta que quede limpio o se detenga por un motivo real.
  - Si `git-commit` se detiene sin dejarlo limpio (p. ej. por secretos detectados, o por una decisión que el propio `git-commit` no puede resolver solo), eso sí bloquea el merge — informar el motivo reportado.
- **Carpeta/documento del trabajo existe:** la ubicación correspondiente al tipo, con su `progress.md`.
- **Unidades del trabajo en `Done`:** parsear `progress.md` y confirmar que **cada unidad del trabajo de la rama** tiene estado `Done` (case-insensitive, sin espacios extra). El `progress.md` vive en la carpeta del trabajo (la US o el WI) y contiene solo ese trabajo: para US son sus `TK`, para WI las unidades de su propio `progress.md`. Estados como `Pending`, `In Progress` o vacío bloquean el merge.
- **Rama base resoluble (antes de las puertas):** identificada por reflog, por config, o confirmada explícitamente por el usuario. Si hay varios candidatos plausibles y ninguno definitivo, preguntar. Se resuelve **antes** de invocar las puertas porque `code-review` la necesita para acotar su diff.
- **Verificaciones automatizadas con veredicto Aprobado:** ejecutar **`quality-check`** (modificador `default`) antes del merge — es la **compuerta de cierre** que corre la batería completa de pruebas sobre la rama consolidada y persiste `.sdd-devkit/test-run.json`. Solo un veredicto **✅ Aprobado** permite continuar. **❌ Rechazado** e **⚠️ Incompleto** bloquean el merge hasta que el usuario corrija los problemas y la corrida se repita con resultado Aprobado.
- **Code review con veredicto Aprobado:** ejecutar **`code-review`** después de `quality-check`, pasándole la **rama base ya resuelta** (`base <rama>`) — es la revisión cualitativa (intención, arquitectura y diseño) sobre el diff de la rama contra esa base, **incluidos los cambios sin commitear** que `quality-check` haya podido dejar al corregir. Emite su **propio** veredicto, independiente del anterior: solo **✅ Aprobado** permite continuar; **❌ Rechazado** e **⚠️ Incompleto** bloquean el merge hasta que los hallazgos se corrijan o se justifiquen y la revisión se repita con resultado Aprobado.
- **Trazabilidad con veredicto aprobado:** ejecutar **`trace-validate`** sobre el trabajo de la rama (`US-XXX`/`WI-XXX`), **después** de `quality-check` para que reutilice su `test-run.json` sin re-ejecutar pruebas. Solo **✅ Aprobado** (o **⚠️ Aprobado con observaciones**, mostrando las observaciones) permite continuar; **❌ Rechazado** (algún criterio de aceptación sin cubrir o con prueba fallida) bloquea el merge.
- **Artefacto archivado (no es una condición, es una consecuencia):** superadas las tres puertas, la carpeta del trabajo se mueve a `docs/specs/archive/` en la rama antes del merge. No bloquea nada por sí misma; lo que sí bloquea es que el `git mv` falle (destino ya ocupado) — ver [references/archive.md](references/archive.md).
- **Working tree limpio otra vez, ya pasadas las puertas:** las puertas pueden dejar cambios sin commitear (correcciones aplicadas por `quality-check`, o por `work-implement` en su modo corrección) **y sus propios artefactos versionados**: `docs/audits/quality-check.md`, `docs/audits/code-review.md` y el `trace-report.md` del trabajo, que se escriben siempre; más el **renombrado stageado** del archivado. (`.sdd-devkit/test-run.json` no aparece: está en el `.gitignore` por ser una caché local.) Antes del merge, re-comprobar `git status --porcelain` e invocar de nuevo `git-commit` si hay salida — el **código** que se integra debe ser exactamente el que verificaron las puertas, con sus artefactos. El renombrado del archivado es la única salvedad: mueve documentación bajo `docs/specs/`, no toca código ni fuentes de prueba, así que no invalida los veredictos de `quality-check` ni de `code-review`. Sí desplaza el `SPEC_FINGERPRINT` de `trace-validate` (se calcula sobre la carpeta del artefacto, cuyas rutas cambian): su `trace-report.md` se regenerará una vez en la siguiente validación, sin más consecuencia.

**Si hay conflicto:**
```
⚠️ No es posible mergear todavía:
- <razón concreta>
- [<TK-XXX | WI-XXX>: estado-actual] — <detalle si aplica>
```

Ejemplos de razón concreta: `Rama actual no cumple un patrón válido: rama es 'hotfix-cache'`, `Working tree sucio: 3 archivos modificados`, `progress.md: TK-002 en In Progress, TK-005 en Pending`, `progress.md: WI-007 en In Progress`, `Rama base ambigua: candidatos main, develop, release/2026.q2`.

---

## Flujo: Submit estándar

Camino feliz cuando todas las verificaciones pasan.

1. **Detectar rama actual** con `git branch --show-current`, identificar el **tipo** por el identificador (`US-`/`WI-`) y validar el patrón de rama de ese tipo. Si no encaja, parar y preguntar.
2. **Verificar working tree limpio** con `git status --porcelain`. Si hay salida, **invocar automáticamente el flujo del skill `git-commit`** sobre los cambios pendientes (sin preguntar al usuario si conviene invocarlo) y esperar a que termine; con el working tree limpio, continuar al siguiente paso. Si `git-commit` no logra dejarlo limpio (incluido el caso de quedar parcialmente limpio, o de no estar disponible), aplicar el criterio de [Validación antes de mergear](#validación-antes-de-mergear) — reintentar sobre el remanente o parar e informar el motivo, según corresponda.
3. **Localizar la carpeta/documento del trabajo** según el tipo (ver [Tipos de trabajo](#tipos-de-trabajo)). Si no está en la ruta activa, buscarla bajo `docs/specs/archive/` antes de rendirse: si aparece ahí, el trabajo **ya estaba archivado** — continuar el flujo leyendo su `progress.md` desde esa ruta y saltar luego el paso 10. Si no está en ninguna de las dos, o hay varias coincidentes, parar.
4. **Leer `progress.md`** (en la carpeta del trabajo) y validar que **todas las unidades del trabajo de la rama** tienen estado `Done`. Si alguna no lo está, parar mostrando la lista completa de unidades no `Done` con su estado actual.
5. **Resolver la rama base** — antes de las puertas, porque `code-review` la necesita para acotar su diff:
   - `git reflog show <branch>` → buscar la entrada inicial con `Created from <ref>` o `branch: Created from <ref>`.
   - Fallback: `git config --get branch.<branch>.merge` y derivar la rama base local correspondiente.
   - Si ninguno concluye o hay ambigüedad: preguntar al usuario sin proponer un default.
6. **Ejecutar `quality-check`** (modificador `default`) sobre la rama actual. Si el veredicto es **❌ Rechazado** o **⚠️ Incompleto**, parar y reportar el informe al usuario — no continuar con el merge hasta obtener veredicto **✅ Aprobado** en una nueva ejecución.
7. **Ejecutar `code-review`** con `base <rama-base>` (la del paso 5). Su alcance incluye los cambios sin commitear, así que también revisa las correcciones que `quality-check` haya podido aplicar. Si su informe existente ya estaba fresco **y aprobado** (mismo fingerprint, misma base y mismo modo, sin correcciones en el paso 6), lo devuelve sin volver a revisar; no forzar `revalidate` desde aquí. Un `❌`/`⚠️` previo lo revisa de nuevo por su cuenta. Si el veredicto es **❌ Rechazado** o **⚠️ Incompleto**, parar y reportar los hallazgos — no continuar hasta obtener **✅ Aprobado** con los hallazgos bloqueantes corregidos o justificados.
8. **Ejecutar `trace-validate`** sobre el trabajo de la rama (después de `quality-check`, para reutilizar su `test-run.json`). Si el veredicto es **❌ Rechazado**, parar y reportar los criterios faltantes/fallidos — no mergear hasta obtener **✅ Aprobado** (o **⚠️ Aprobado con observaciones**, mostrando las observaciones al usuario).
9. **Calcular delta** con `git rev-list --count <base>..HEAD`. Es una **puerta, no solo un dato para el reporte**: si el resultado es `0`, la rama ya está integrada (típicamente porque el PR se mergeó en la plataforma) — parar y avisar, **sin tocar nada**. Seguir adelante produciría un commit que no es un merge y que solo borra archivos, con un mensaje que miente. **Va antes del archivado a propósito:** archivar primero dejaría un commit nuevo en una rama que solo había que dejar en paz.
10. **Archivar el artefacto del trabajo.** Con las tres puertas en aprobado y el `progress.md` en `Done`, el trabajo está cerrado: mover su carpeta a `docs/specs/archive/` **en la rama del trabajo**, para que el archivado se integre en el mismo merge que el código. Solo aplica a `US-XXX` y `WI-XXX` **en su rama funcional**; una rama `test/` —sea sobre un `FT-XXX`, un `US-XXX` o un `WI-XXX`— no archiva nada, porque su paso 4 solo verificó las unidades `TC-XXX` de esa ejecución, no el trabajo completo. Si la carpeta ya está bajo `docs/specs/archive/` (paso 3), el trabajo ya estaba archivado: informarlo y saltar este paso. Es **automático**: no se pregunta al usuario. El `git mv` queda stageado y lo recoge el paso 11; no commitear aquí. Procedimiento completo (destinos, investigaciones `RS-XXX` sueltas que quedan huérfanas, reparación de enlaces, guards) en [references/archive.md](references/archive.md).
11. **Re-comprobar el working tree tras las puertas.** Las puertas dejan cambios sin commitear de dos clases: **correcciones** (aplicadas por `quality-check` o por `work-implement` en su modo corrección) y **sus propios artefactos** —`docs/audits/quality-check.md`, `docs/audits/code-review.md` y el `trace-report.md` del trabajo, que se escriben siempre—; a eso se suma el **archivado stageado** del paso 10. Todo se commitea: la rama debe conservar su evidencia (el paso 13 es quien decide qué **no** pasa a la base). Volver a ejecutar `git status --porcelain` y, si hay salida, **invocar de nuevo `git-commit`** con el mismo criterio del paso 2. **El merge solo procede con el árbol limpio:** el **código** que se integra es exactamente el que verificaron las puertas — el archivado del paso 10 es la única salvedad, y es deliberada: mueve documentación bajo `docs/specs/`, no toca código ni fuentes de prueba, así que ningún veredicto queda invalidado por él.
12. **Cambiar a la rama base** con `git checkout <base>`. Si falla, parar y reportar.
13. **Ejecutar el merge en tres tiempos**, para que los informes de las puertas no lleguen a la rama base (ver [Los informes de las puertas no se integran](#los-informes-de-las-puertas-no-se-integran)):

    ```bash
    git merge --no-ff --no-commit <feature-branch>
    test -f "$(git rev-parse --git-dir)/MERGE_HEAD" || { echo "no hay merge en curso"; exit 1; }
    git rm -q -f --ignore-unmatch ':(top,glob)**/docs/audits/quality-check.md' ':(top,glob)**/docs/audits/code-review.md'
    test -z "$(git ls-files --cached -- ':(top,glob)**/docs/audits/quality-check.md' ':(top,glob)**/docs/audits/code-review.md')" \
      || { echo "los informes siguen en el índice"; exit 1; }
    git commit -m "Merge <ID>: <nombre-corto>"
    ```

    `<ID>` es el identificador del trabajo (`US-XXX` o `WI-XXX`) y `<nombre-corto>` su nombre/slug sin el prefijo de rama.

    Las dos comprobaciones no son adorno:

    - **`MERGE_HEAD`** confirma que el merge quedó realmente en curso. Si git respondió *Already up to date*, no hay merge, y ejecutar el `git rm` + `git commit` de todos modos crearía un commit normal que borra dos archivos de la base. Parar ahí.
    - **`:(top,glob)**/…` en las rutas** hace dos cosas, y las dos hacen falta. `:(top)` las ancla a la raíz del repositorio: `git rm` interpreta las rutas **relativas al cwd**, así que sin ese ancla, lanzado desde `packages/api/`, no casarían, `--ignore-unmatch` devolvería `0` sin borrar nada, y los informes se integrarían en la base **en silencio** mientras el paso 14 reporta lo contrario. Y el **`glob` con `**/` inicial** las hace casar a cualquier profundidad, que es lo que exige el monorepo por el otro lado: `quality-check` audita **el módulo elegido**, no el repo entero, y escribe su informe en el `docs/audits/` de ese módulo (`packages/api/docs/audits/quality-check.md`). Con `:(top)docs/audits/…` a secas —anclado pero literal— solo casaría el `docs/` de la raíz, y el informe del módulo se colaría en la base con el mismo silencio. Es la misma razón por la que el `FINGERPRINT` de `quality-check` excluye `**/docs/**` y no `docs/`. `**/` casa también cero directorios, así que el caso de repo simple sigue cubierto. El `git ls-files --cached` posterior es el cinturón: verifica el resultado en vez de confiar en el código de salida. **Tiene que ser `ls-files`, no `git diff --cached`:** el diff lista también los **borrados** stageados, así que cuando la base ya trackeaba el informe —y el `git rm` funcionó— la ruta aparecería igual y el guard cortaría un merge correcto. `ls-files --cached` responde la pregunta que importa: ¿queda algo de esos dos archivos en el índice?

    `--ignore-unmatch` está para el caso legítimo de que un informe no se haya commiteado en la rama, no para tapar rutas mal resueltas. **Borrar exactamente esos dos archivos, ni uno más:** las copias de `save-report` y los `arch-audit-*.md` se quedan. Si surge conflicto, ir al flujo de conflictos.
14. **Reportar resultado** al usuario: rama origen (con su prefijo), rama destino, número de commits integrados, hash del commit de merge, estado del HEAD y nota explícita de que **no** se hizo push ni se borró la rama del trabajo. Si el paso 10 movió algo, incluir su **bloque de archivado** (origen → destino y qué pasó con las investigaciones sueltas; formato en [references/archive.md](references/archive.md)). Si no archivó —rama `test/`, o trabajo que ya estaba archivado—, decirlo en una línea en vez de omitirlo en silencio. Mencionar también que los informes de las puertas quedaron en la rama del trabajo y no se integraron.

---

### Los informes de las puertas no se integran

`docs/audits/quality-check.md` y `docs/audits/code-review.md` son **fotos de una rama concreta**: su encabezado lleva la rama y el commit sobre los que se corrieron las puertas. Se **versionan en la rama del trabajo** —ahí valen: quedan junto a los commits que verifican, y el revisor los ve en el PR— pero **no deben llegar a la rama base**, por dos razones:

- **En `develop` serían mentira.** Nadie corrió las puertas sobre `develop`; ese archivo diría «✅ Aprobado» sobre una rama que ni siquiera es la suya. Y con cada integración lo pisaría la última feature en entrar.
- **Viven en una ruta fija**, así que toda rama escribe el mismo archivo: dejarlos integrarse convierte cada merge en un conflicto seguro sobre un artefacto generado.

Por eso el paso 13 parte el merge: `--no-commit` deja el resultado en el índice, se retiran los dos informes y el commit de merge se cierra ya sin ellos. La rama del trabajo **conserva los suyos intactos** — no se reescribe su historia, solo se decide qué entra en la base.

**Qué NO se toca:**

| Artefacto | Por qué se queda |
|-----------|------------------|
| `docs/audits/arch-audit-*.md` | Auditorías de arquitectura del **repositorio**, no de una rama. Su sitio es la rama base. |
| `docs/audits/quality-check-<timestamp>.md` · `code-review-<timestamp>.md` | Copias de `save-report`: el usuario las pidió **para conservar histórico**. Llevan marca de tiempo, así que no colisionan ni pisan nada. |
| `trace-report.md` del trabajo | Vive junto a su artefacto en `docs/specs/`, es del **trabajo** y no de la rama, y se integra con él. |
| La carpeta del trabajo movida a `docs/specs/archive/` | El archivado del paso 10 **sí** debe llegar a la base: es el estado final del artefacto, no una foto de la rama. Se integra como un *rename*, junto con el `trace-report.md` que lleva dentro. |
| `.sdd-devkit/test-run.json` | Ni aparece: está en el `.gitignore`. |

> **Esta limpieza solo cubre los merges que hace este skill.** Un merge desde la UI de GitHub/GitLab —el camino de `pr-create`— sí propaga los informes: ahí la limpieza hay que hacerla en la rama base después de integrar. Ver [`pr-create`](../pr-create/SKILL.md).

---

> **Conflictos y rama base ambigua:** si el `git merge` produce conflictos, seguir el **Flujo de manejo de conflictos**, que **clasifica antes de abortar**: un `modify/delete` sobre los dos informes de `docs/audits/` se resuelve por el lado del borrado y el merge continúa; cualquier otro conflicto se aborta con `git merge --abort`, se reporta y se para. Si la rama base no se resuelve por reflog ni config, seguir el **Flujo de rama base ambigua** (listar candidatos, preguntar, no asumir default). Ambos flujos íntegros y el **checklist detallado** están en [references/flows.md](references/flows.md).

---

## Mapa de referencias

Cargar bajo demanda; el contenido íntegro vive en estos archivos:

| Necesitas… | Archivo |
|------------|---------|
| Flujo de manejo de conflictos, flujo de rama base ambigua, checklist detallado antes de mergear | [references/flows.md](references/flows.md) |
| Archivado del artefacto (paso 10): cuándo aplica y cuándo no, destinos, `git mv` y guards, investigaciones `RS-XXX` sueltas huérfanas, reparación de enlaces, formato del reporte, anti-patrones | [references/archive.md](references/archive.md) |
| Ejemplos por tipo (US/WI: camino feliz, unidad pendiente, base ambigua, working tree sucio, conflicto, prefijo inválido), anti-patrones, y notas (handoffs del ciclo, `progress.md`, estados, detección de rama base, sin push intencional, mensaje al usuario) | [references/examples.md](references/examples.md) |
