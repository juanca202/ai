---
name: work-integrate
description: Cerrar e integrar el trabajo de una historia de usuario (US-XXX) o un work item de mantenimiento (WI-XXX) haciendo merge de la rama feature hacia la rama desde la que se creó, previa verificación de que progress.md tenga todas las unidades del trabajo en Done y de que pasen las puertas de calidad de cierre (code-review y trace-validate). Activar cuando el usuario pida cerrar, entregar, mergear, integrar, finalizar o hacer submit del trabajo de una historia, un WI o de la rama actual.
license: MIT
---

# Skill: Integración de trabajo

Guía para **cerrar e integrar** el trabajo ya implementado —una historia de usuario `US-XXX` o un work item de mantenimiento `WI-XXX`— verificando que su `progress.md` tenga todas las unidades del trabajo en `Done`, que pasen las **puertas de calidad de cierre** (`code-review` y `trace-validate`, en ese orden), y luego hacer **merge** de la rama actual hacia la rama desde la que se creó.

> **Alcance del submit:** El skill **cierra** localmente lo ya implementado. Verifica condiciones y ejecuta `git merge --no-ff`. No hace push, no borra ramas, no crea MRs/PRs, no resuelve conflictos, no modifica `progress.md`. Lo que no esté en `Done` bloquea el merge — el usuario decide cómo proceder, nunca se fuerza.

Encaja al final de los ciclos **work-define** → **work-plan** → **work-implement** (historias y work items). Ver Handoffs del ciclo en [references/examples.md](references/examples.md).

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
| **Work item de mantenimiento** | `WI-XXX` | `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` (por carpeta del WI) | **todas** las unidades del `WI-XXX` en su propio `progress.md` |

> **Una rama = un trabajo.** El skill cierra el trabajo asociado a la rama actual. Cada tipo tiene su `progress.md` **dentro de la carpeta del trabajo** (la US o el WI) y contiene únicamente ese trabajo; se verifican **todas** sus unidades.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Carpeta / documento del trabajo | US: `docs/specs/user-stories/US-XXX-[nombre-corto]/` · WI: `docs/specs/work-items/WI-XXX-[kebab-case]/` |
| Progreso del trabajo | US: `…/US-XXX-[nombre-corto]/progress.md` · WI: `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` |
| Unidades referenciadas | US: `…/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` · WI: el propio `…/WI-XXX-[kebab-case]/README.md` |

---

## Convenciones de rama

- **Historia de usuario:** `feature/US-XXX-[nombre-corto]` con prefijo **`feature/` obligatorio**.
- **Work item:** `feature/WI-XXX-[kebab-case]` por defecto; se aceptan además los prefijos por tipo que usa `work-implement`: `fix/WI-XXX-...`, `chore/WI-XXX-...`, `refactor/WI-XXX-...`.
- `XXX`: tres dígitos con cero a la izquierda (sin ADO); coincide con el identificador del trabajo.
- La carpeta/documento del trabajo se deriva descontando el prefijo de rama y leyendo el identificador: `feature/US-042-exportacion-csv` → `docs/specs/user-stories/US-042-exportacion-csv/`; `fix/WI-007-cache-ttl` → `docs/specs/work-items/WI-007-cache-ttl/` (con su propio `progress.md`).
- Una rama sin un prefijo válido para su tipo o sin un identificador `US-XXX` / `WI-XXX` reconocible **no** es submiteable por este skill.
- Ejemplos: `feature/US-042-exportacion-csv`, `fix/WI-013-fuga-memoria`.

---

## Información requerida antes de mergear

Antes de tocar git, el agente debe tener clara la siguiente información. **No asumir nada** — si algún dato no se resuelve, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Rama actual y tipo** | `git branch --show-current`; el tipo se infiere del identificador (`US-`/`WI-`) | Si no encaja con un patrón válido: preguntar a qué trabajo corresponde antes de continuar |
| **Carpeta/documento del trabajo** | Derivar del nombre de rama según el tipo (ver [Tipos de trabajo](#tipos-de-trabajo)) | Si no existe: parar e informar; si hay varias coincidentes: preguntar cuál |
| **Estado de `progress.md`** | Leer el archivo en la ubicación correspondiente al tipo | Si no existe: parar e informar; el merge requiere `progress.md` poblado |
| **Working tree** | `git status --porcelain` | Si hay salida: invocar automáticamente el flujo del skill **`git-commit`** sobre los cambios pendientes (sin preguntar al usuario) y continuar una vez quede limpio; si `git-commit` no logra dejarlo limpio, parar e informar el motivo. Detalle operativo (fallback sin `git-commit`, working tree parcialmente limpio): ver [Validación antes de mergear](#validación-antes-de-mergear) |
| **Rama base** | (1) `git reflog show <branch>` → línea `Created from`; (2) `git config --get branch.<branch>.merge`; (3) preguntar al usuario | No asumir `main`, `master` ni `develop` por defecto |
| **Idioma de preferencia** | Ver [Resolución de idioma](#resolución-de-idioma) | Preguntar y persistir en `.agents/MEMORY.md` con `preferred language: <código>` |

> Leer el `progress.md` **completo** antes de iniciar cualquier operación git. Las tres condiciones (rama, working tree, estados) se evalúan antes de cambiar de rama o invocar `git merge`.

---

## Validación antes de mergear

Antes de cambiar de rama o ejecutar el merge, verificar las siguientes condiciones. Si alguna falla, **no mergear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **Rama actual con formato válido para su tipo:** `feature/US-XXX-...`, o `feature/`|`fix/`|`chore/`|`refactor/` + `WI-XXX-...`. Sin un identificador reconocible no se puede derivar la carpeta/documento del trabajo.
- **Working tree limpio:** `git status --porcelain` sin salida. Si hay cambios sin commitear, **invocar automáticamente el flujo del skill `git-commit`** sobre ellos (sin preguntar al usuario) y continuar una vez el working tree quede limpio. La invocación delega en `git-commit` todo su criterio operativo (agrupación por cambio lógico, inferencia de tipo/scope/mensaje, staging, detección de secretos, confirmación de la propuesta) — `work-integrate` no decide un mensaje de commit ni qué stagear por su cuenta.
  - **Si `git-commit` no está disponible** (skill no instalado o no localizable en el entorno): parar y avisar, mostrando los archivos pendientes y sugiriendo al usuario commitear manualmente antes de reintentar — no ejecutar `git add`/`git commit` directos como sustituto.
  - **Si `git-commit` deja el working tree parcialmente limpio por una decisión de alcance suya** (p. ej. commiteó unos archivos pero dejó otros fuera deliberadamente): no es un error — volver a comprobar `git status --porcelain` e invocar `git-commit` de nuevo sobre el remanente (mismo criterio, sin preguntar) hasta que quede limpio o se detenga por un motivo real.
  - Si `git-commit` se detiene sin dejarlo limpio (p. ej. por secretos detectados, o por una decisión que el propio `git-commit` no puede resolver solo), eso sí bloquea el merge — informar el motivo reportado.
- **Carpeta/documento del trabajo existe:** la ubicación correspondiente al tipo, con su `progress.md`.
- **Unidades del trabajo en `Done`:** parsear `progress.md` y confirmar que **cada unidad del trabajo de la rama** tiene estado `Done` (case-insensitive, sin espacios extra). El `progress.md` vive en la carpeta del trabajo (la US o el WI) y contiene solo ese trabajo: para US son sus `TK`, para WI las unidades de su propio `progress.md`. Estados como `Pending`, `In Progress` o vacío bloquean el merge.
- **Code review con veredicto Aprobado:** ejecutar **`code-review`** (modificador `default`) antes del merge — es la **compuerta de cierre** que corre la batería completa de pruebas sobre la rama consolidada y persiste `docs/specs/test-run.json`. Solo un veredicto **✅ Aprobado** permite continuar. **❌ Rechazado** e **⚠️ Incompleto** bloquean el merge hasta que el usuario corrija los problemas y el review se repita con resultado Aprobado.
- **Trazabilidad con veredicto aprobado:** ejecutar **`trace-validate`** sobre el trabajo de la rama (`US-XXX`/`WI-XXX`), **después** de `code-review` para que reutilice su `test-run.json` sin re-ejecutar pruebas. Solo **✅ Aprobado** (o **⚠️ Aprobado con observaciones**, mostrando las observaciones) permite continuar; **❌ Rechazado** (algún criterio de aceptación sin cubrir o con prueba fallida) bloquea el merge.
- **Rama base resoluble:** identificada por reflog, por config, o confirmada explícitamente por el usuario. Si hay varios candidatos plausibles y ninguno definitivo, preguntar.

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
2. **Verificar working tree limpio** con `git status --porcelain`. Si hay salida, **invocar automáticamente el flujo del skill `git-commit`** sobre los cambios pendientes (sin preguntar al usuario) y esperar a que termine; con el working tree limpio, continuar al siguiente paso. Si `git-commit` no logra dejarlo limpio (incluido el caso de quedar parcialmente limpio, o de no estar disponible), aplicar el criterio de [Validación antes de mergear](#validación-antes-de-mergear) — reintentar sobre el remanente o parar e informar el motivo, según corresponda.
3. **Localizar la carpeta/documento del trabajo** según el tipo (ver [Tipos de trabajo](#tipos-de-trabajo)). Si no existe o hay varias coincidentes, parar.
4. **Leer `progress.md`** (en la carpeta del trabajo) y validar que **todas las unidades del trabajo de la rama** tienen estado `Done`. Si alguna no lo está, parar mostrando la lista completa de unidades no `Done` con su estado actual.
5. **Ejecutar `code-review`** (modificador `default`) sobre la rama actual. Si el veredicto es **❌ Rechazado** o **⚠️ Incompleto**, parar y reportar el informe al usuario — no continuar con el merge hasta obtener veredicto **✅ Aprobado** en una nueva ejecución.
6. **Ejecutar `trace-validate`** sobre el trabajo de la rama (después de `code-review`, para reutilizar su `test-run.json`). Si el veredicto es **❌ Rechazado**, parar y reportar los criterios faltantes/fallidos — no mergear hasta obtener **✅ Aprobado** (o **⚠️ Aprobado con observaciones**, mostrando las observaciones al usuario).
7. **Resolver la rama base:**
   - `git reflog show <branch>` → buscar la entrada inicial con `Created from <ref>` o `branch: Created from <ref>`.
   - Fallback: `git config --get branch.<branch>.merge` y derivar la rama base local correspondiente.
   - Si ninguno concluye o hay ambigüedad: preguntar al usuario sin proponer un default.
8. **Calcular delta** con `git rev-list --count <base>..HEAD` para reportar cuántos commits se van a integrar.
9. **Cambiar a la rama base** con `git checkout <base>`. Si falla, parar y reportar.
10. **Ejecutar el merge** con `git merge --no-ff <feature-branch> -m "Merge <ID>: <nombre-corto>"`, donde `<ID>` es el identificador del trabajo (`US-XXX` o `WI-XXX`) y `<nombre-corto>` su nombre/slug sin el prefijo de rama. Si surge conflicto, ir al flujo de conflictos.
11. **Reportar resultado** al usuario: rama origen (con su prefijo), rama destino, número de commits integrados, hash del commit de merge, estado del HEAD y nota explícita de que **no** se hizo push ni se borró la rama del trabajo.

---

> **Conflictos y rama base ambigua:** si el `git merge` produce conflictos, seguir el **Flujo de manejo de conflictos** (abortar con `git merge --abort`, reportar archivos, parar). Si la rama base no se resuelve por reflog ni config, seguir el **Flujo de rama base ambigua** (listar candidatos, preguntar, no asumir default). Ambos flujos íntegros y el **checklist detallado** están en [references/flows.md](references/flows.md).

---

## Mapa de referencias

Cargar bajo demanda; el contenido íntegro vive en estos archivos:

| Necesitas… | Archivo |
|------------|---------|
| Flujo de manejo de conflictos, flujo de rama base ambigua, checklist detallado antes de mergear | [references/flows.md](references/flows.md) |
| Ejemplos por tipo (US/WI: camino feliz, unidad pendiente, base ambigua, working tree sucio, conflicto, prefijo inválido), anti-patrones, y notas (handoffs del ciclo, `progress.md`, estados, detección de rama base, sin push intencional, mensaje al usuario) | [references/examples.md](references/examples.md) |
