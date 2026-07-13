---
name: work-integrate
description: Cerrar e integrar el trabajo de una historia de usuario (US-XXX), un work item de mantenimiento (WI-XXX) o una migracion (MG-XXX) haciendo merge de la rama feature hacia la rama desde la que se creó, previa verificación de que progress.md tenga todas las unidades del trabajo en Done. Activar cuando el usuario pida cerrar, entregar, mergear, integrar, finalizar o hacer submit del trabajo de una historia, un WI, una migración o de la rama actual.
license: MIT
---

# Skill: Integración de trabajo

Guía para **cerrar e integrar** el trabajo ya implementado —una historia de usuario `US-XXX`, un work item de mantenimiento `WI-XXX` o una migración `MG-XXX`— verificando que su `progress.md` tenga todas las unidades del trabajo en `Done`, y luego hacer **merge** de la rama actual hacia la rama desde la que se creó.

> **Alcance del submit:** El skill **cierra** localmente lo ya implementado. Verifica condiciones y ejecuta `git merge --no-ff`. No hace push, no borra ramas, no crea MRs/PRs, no resuelve conflictos, no modifica `progress.md`. Lo que no esté en `Done` bloquea el merge — el usuario decide cómo proceder, nunca se fuerza.

Encaja al final de los ciclos **work-define** → **work-plan** → **work-implement** (historias y work items) y **project-migrate** → **work-implement** (migraciones). Ver Handoffs del ciclo en [references/examples.md](references/examples.md).

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
| **Migración** | `MG-XXX` | `docs/specs/migrations/MG-XXX-{slug}/progress.md` (por carpeta de la migración) | **todas** las `Fase N` del plan de ese destino |

> **Una rama = un trabajo.** El skill cierra el trabajo asociado a la rama actual. Cada tipo tiene su `progress.md` **dentro de la carpeta del trabajo** (la US, el WI o la migración) y contiene únicamente ese trabajo; se verifican **todas** sus unidades.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Carpeta / documento del trabajo | US: `docs/specs/user-stories/US-XXX-[nombre-corto]/` · WI: `docs/specs/work-items/WI-XXX-[kebab-case]/` · MG: `docs/specs/migrations/MG-XXX-{slug}/` |
| Progreso del trabajo | US: `…/US-XXX-[nombre-corto]/progress.md` · WI: `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` · MG: `…/MG-XXX-{slug}/progress.md` |
| Unidades referenciadas | US: `…/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` · WI: el propio `…/WI-XXX-[kebab-case]/README.md` · MG: las `Fase N` listadas en `plan.md` |

---

## Convenciones de rama

- **Historia de usuario:** `feature/US-XXX-[nombre-corto]` con prefijo **`feature/` obligatorio**.
- **Migración:** `feature/MG-XXX-{slug}` con prefijo **`feature/` obligatorio**.
- **Work item:** `feature/WI-XXX-[kebab-case]` por defecto; se aceptan además los prefijos por tipo que usa `work-implement`: `fix/WI-XXX-...`, `chore/WI-XXX-...`, `refactor/WI-XXX-...`.
- `XXX`: tres dígitos con cero a la izquierda (sin ADO); coincide con el identificador del trabajo.
- La carpeta/documento del trabajo se deriva descontando el prefijo de rama y leyendo el identificador: `feature/US-042-exportacion-csv` → `docs/specs/user-stories/US-042-exportacion-csv/`; `fix/WI-007-cache-ttl` → `docs/specs/work-items/WI-007-cache-ttl/` (con su propio `progress.md`); `feature/MG-003-orm-a-prisma` → `docs/specs/migrations/MG-003-orm-a-prisma/`.
- Una rama sin un prefijo válido para su tipo o sin un identificador `US-XXX` / `WI-XXX` / `MG-XXX` reconocible **no** es submiteable por este skill.
- Ejemplos: `feature/US-042-exportacion-csv`, `fix/WI-013-fuga-memoria`, `feature/MG-008-auth-passportjs-authjs`.

---

## Información requerida antes de mergear

Antes de tocar git, el agente debe tener clara la siguiente información. **No asumir nada** — si algún dato no se resuelve, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Rama actual y tipo** | `git branch --show-current`; el tipo se infiere del identificador (`US-`/`WI-`/`MG-`) | Si no encaja con un patrón válido: preguntar a qué trabajo corresponde antes de continuar |
| **Carpeta/documento del trabajo** | Derivar del nombre de rama según el tipo (ver [Tipos de trabajo](#tipos-de-trabajo)) | Si no existe: parar e informar; si hay varias coincidentes: preguntar cuál |
| **Estado de `progress.md`** | Leer el archivo en la ubicación correspondiente al tipo | Si no existe: parar e informar; el merge requiere `progress.md` poblado |
| **Working tree** | `git status --porcelain` | Si hay salida: parar e informar; no se mergea con cambios pendientes |
| **Rama base** | (1) `git reflog show <branch>` → línea `Created from`; (2) `git config --get branch.<branch>.merge`; (3) preguntar al usuario | No asumir `main`, `master` ni `develop` por defecto |
| **Idioma de preferencia** | Ver [Resolución de idioma](#resolución-de-idioma) | Preguntar y persistir en `.agents/MEMORY.md` con `preferred language: <código>` |

> Leer el `progress.md` **completo** antes de iniciar cualquier operación git. Las tres condiciones (rama, working tree, estados) se evalúan antes de cambiar de rama o invocar `git merge`.

---

## Validación antes de mergear

Antes de cambiar de rama o ejecutar el merge, verificar las siguientes condiciones. Si alguna falla, **no mergear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **Rama actual con formato válido para su tipo:** `feature/US-XXX-...`, `feature/MG-XXX-...`, o `feature/`|`fix/`|`chore/`|`refactor/` + `WI-XXX-...`. Sin un identificador reconocible no se puede derivar la carpeta/documento del trabajo.
- **Working tree limpio:** `git status --porcelain` sin salida. Cualquier cambio sin commitear bloquea el merge.
- **Carpeta/documento del trabajo existe:** la ubicación correspondiente al tipo, con su `progress.md`.
- **Unidades del trabajo en `Done`:** parsear `progress.md` y confirmar que **cada unidad del trabajo de la rama** tiene estado `Done` (case-insensitive, sin espacios extra). El `progress.md` vive en la carpeta del trabajo (la US, el WI o la migración) y contiene solo ese trabajo: para US son sus `TK`, para MG sus `Fase N`, para WI las unidades de su propio `progress.md`. Estados como `Pending`, `In Progress` o vacío bloquean el merge.
- **Code review con veredicto Apto:** ejecutar **`code-review`** (modificador `default`) antes del merge. Solo un veredicto **✅ Apto** permite continuar. **❌ No apto** e **⚠️ Incompleto** bloquean el merge hasta que el usuario corrija los problemas y el review se repita con resultado Apto.
- **Rama base resoluble:** identificada por reflog, por config, o confirmada explícitamente por el usuario. Si hay varios candidatos plausibles y ninguno definitivo, preguntar.

**Si hay conflicto:**
```
⚠️ No es posible mergear todavía:
- <razón concreta>
- [<TK-XXX | WI-XXX | Fase N>: estado-actual] — <detalle si aplica>
```

Ejemplos de razón concreta: `Rama actual no cumple un patrón válido: rama es 'hotfix-cache'`, `Working tree sucio: 3 archivos modificados`, `progress.md: TK-002 en In Progress, TK-005 en Pending`, `progress.md: WI-007 en In Progress`, `progress.md: Fase 2 en Pending`, `Rama base ambigua: candidatos main, develop, release/2026.q2`.

---

## Flujo: Submit estándar

Camino feliz cuando todas las verificaciones pasan.

1. **Detectar rama actual** con `git branch --show-current`, identificar el **tipo** por el identificador (`US-`/`WI-`/`MG-`) y validar el patrón de rama de ese tipo. Si no encaja, parar y preguntar.
2. **Verificar working tree limpio** con `git status --porcelain`. Si hay salida, parar e informar.
3. **Localizar la carpeta/documento del trabajo** según el tipo (ver [Tipos de trabajo](#tipos-de-trabajo)). Si no existe o hay varias coincidentes, parar.
4. **Leer `progress.md`** (en la carpeta del trabajo) y validar que **todas las unidades del trabajo de la rama** tienen estado `Done`. Si alguna no lo está, parar mostrando la lista completa de unidades no `Done` con su estado actual.
5. **Ejecutar `code-review`** (modificador `default`) sobre la rama actual. Si el veredicto es **❌ No apto** o **⚠️ Incompleto**, parar y reportar el informe al usuario — no continuar con el merge hasta obtener veredicto **✅ Apto** en una nueva ejecución.
6. **Resolver la rama base:**
   - `git reflog show <branch>` → buscar la entrada inicial con `Created from <ref>` o `branch: Created from <ref>`.
   - Fallback: `git config --get branch.<branch>.merge` y derivar la rama base local correspondiente.
   - Si ninguno concluye o hay ambigüedad: preguntar al usuario sin proponer un default.
7. **Calcular delta** con `git rev-list --count <base>..HEAD` para reportar cuántos commits se van a integrar.
8. **Cambiar a la rama base** con `git checkout <base>`. Si falla, parar y reportar.
9. **Ejecutar el merge** con `git merge --no-ff <feature-branch> -m "Merge <ID>: <nombre-corto>"`, donde `<ID>` es el identificador del trabajo (`US-XXX`, `WI-XXX` o `MG-XXX`) y `<nombre-corto>` su nombre/slug sin el prefijo de rama. Si surge conflicto, ir al flujo de conflictos.
10. **Reportar resultado** al usuario: rama origen (con su prefijo), rama destino, número de commits integrados, hash del commit de merge, estado del HEAD y nota explícita de que **no** se hizo push ni se borró la rama del trabajo.

---

> **Conflictos y rama base ambigua:** si el `git merge` produce conflictos, seguir el **Flujo de manejo de conflictos** (abortar con `git merge --abort`, reportar archivos, parar). Si la rama base no se resuelve por reflog ni config, seguir el **Flujo de rama base ambigua** (listar candidatos, preguntar, no asumir default). Ambos flujos íntegros y el **checklist detallado** están en [references/flows.md](references/flows.md).

---

## Mapa de referencias

Cargar bajo demanda; el contenido íntegro vive en estos archivos:

| Necesitas… | Archivo |
|------------|---------|
| Flujo de manejo de conflictos, flujo de rama base ambigua, checklist detallado antes de mergear | [references/flows.md](references/flows.md) |
| Ejemplos por tipo (US/WI/MG: camino feliz, unidad pendiente, base ambigua, working tree sucio, conflicto, prefijo inválido), anti-patrones, y notas (handoffs del ciclo, `progress.md`, estados, detección de rama base, sin push intencional, mensaje al usuario) | [references/examples.md](references/examples.md) |
