---
name: story-integrate
description: Cerrar e integrar el trabajo de una historia de usuario haciendo merge de la rama feature/US-XXX hacia la rama desde la que se creó, previa verificación de que progress.md tenga todas las tareas en done. Activar cuando el usuario pida cerrar, entregar, mergear, integrar, finalizar o hacer submit del trabajo de una historia, una US o de la rama actual.
license: MIT
---

# Skill: Integración de historia de usuario

Guía para **cerrar e integrar** el trabajo de una historia de usuario `US-XXX`: verificar que la carpeta de la US tenga su `progress.md` con todas las tareas en `done`, y luego hacer **merge** de la rama actual hacia la rama desde la que se creó.

> **Alcance del submit:** El skill **cierra** localmente lo ya implementado. Verifica condiciones y ejecuta `git merge --no-ff`. No hace push, no borra ramas, no crea MRs/PRs, no resuelve conflictos, no modifica `progress.md`. Lo que no esté en `done` bloquea el merge — el usuario decide cómo proceder, nunca se fuerza.

Encaja al final del ciclo iniciado por **story-define** → **story-plan** → **story-implement**.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Carpeta de la US | `docs/specs/user-stories/US-XXX-[nombre-corto]/` |
| Progreso de la US | `docs/specs/user-stories/US-XXX-[nombre-corto]/progress.md` |
| Tareas referenciadas | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` |

---

## Convenciones de rama

- Formato canónico: `feature/US-XXX-[nombre-corto]` con prefijo **`feature/` obligatorio**, `US-XXX` en mayúsculas y nombre en kebab-case.
- `XXX`: tres dígitos con cero a la izquierda; coincide con el número de la carpeta de la US.
- La carpeta de la US se deriva descontando el prefijo `feature/`: `feature/US-042-exportacion-csv` → `docs/specs/user-stories/US-042-exportacion-csv/`.
- Una rama sin `feature/` o sin formato `US-XXX-...` **no** es submiteable por este skill.
- Ejemplos: `feature/US-042-exportacion-csv`, `feature/US-013-ajuste-permisos`.

---

## Información requerida antes de mergear

Antes de tocar git, el agente debe tener clara la siguiente información. **No asumir nada** — si algún dato no se resuelve, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Rama actual** | `git branch --show-current` | Si no encaja con el patrón `feature/US-XXX-[nombre-corto]`: preguntar a qué US corresponde antes de continuar |
| **Carpeta de la US** | Derivar del nombre de rama descontando el prefijo `feature/` | Si la carpeta no existe: parar e informar; si hay varias coincidentes: preguntar cuál |
| **Estado de `progress.md`** | Leer el archivo en la carpeta de la US | Si no existe: parar e informar; el merge requiere `progress.md` poblado |
| **Working tree** | `git status --porcelain` | Si hay salida: parar e informar; no se mergea con cambios pendientes |
| **Rama base** | (1) `git reflog show <branch>` → línea «Created from»; (2) `git config --get branch.<branch>.merge`; (3) preguntar al usuario | No asumir `main`, `master` ni `develop` por defecto |
| **Idioma de preferencia** | (1) idioma del turno del usuario; (2) `.agent/MEMORY.md` → `preferred language: <ISO>` | Preguntar y crear/actualizar `.agent/MEMORY.md` con `preferred language: <código>` |

> Leer `progress.md` **completo** antes de iniciar cualquier operación git. Las tres condiciones (rama, working tree, estados) se evalúan antes de cambiar de rama o invocar `git merge`.

---

## Validación antes de mergear

Antes de cambiar de rama o ejecutar el merge, verificar las siguientes condiciones. Si alguna falla, **no mergear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **Rama actual con formato válido:** `feature/US-XXX-[nombre-corto]`. Sin el prefijo `feature/` o sin el segmento `US-XXX-...` no se puede derivar la carpeta de la US.
- **Working tree limpio:** `git status --porcelain` sin salida. Cualquier cambio sin commitear bloquea el merge.
- **Carpeta de la US existe:** `docs/specs/user-stories/US-XXX-[nombre-corto]/` presente con `progress.md` dentro.
- **Todas las tareas en `done`:** parsear `progress.md` y confirmar que **cada** entrada tiene estado `done` (case-insensitive, sin espacios extra). Estados como `pending`, `in-progress`, `skipped`, `blocked` o vacío bloquean el merge.
- **Rama base resoluble:** identificada por reflog, por config, o confirmada explícitamente por el usuario. Si hay varios candidatos plausibles y ninguno definitivo, preguntar.

**Si hay conflicto:**
```
⚠️ No es posible mergear todavía:
- <razón concreta>
- [TK-XXX: estado-actual] — <detalle si aplica>
```

Ejemplos de razón concreta: `Rama actual no cumple feature/US-XXX-...: rama es 'fix/hotfix-cache'`, `Working tree sucio: 3 archivos modificados`, `progress.md: TK-002 en in-progress, TK-005 en pending`, `Rama base ambigua: candidatos main, develop, release/2026.q2`.

---

## Flujo: Submit estándar

Camino feliz cuando todas las verificaciones pasan.

1. **Detectar rama actual** con `git branch --show-current` y validar el patrón `feature/US-XXX-[nombre-corto]`. Si no encaja, parar y preguntar.
2. **Verificar working tree limpio** con `git status --porcelain`. Si hay salida, parar e informar.
3. **Localizar la carpeta de la US** descontando el prefijo `feature/` del nombre de rama: `feature/US-XXX-[nombre-corto]` → `docs/specs/user-stories/US-XXX-[nombre-corto]/`. Si la carpeta no existe o hay varias coincidentes, parar.
4. **Leer `progress.md`** y validar que **todas** las tareas tienen estado `done`. Si alguna no lo está, parar mostrando la lista completa de tareas no-`done` con su estado actual.
5. **Resolver la rama base:**
   - `git reflog show <branch>` → buscar la entrada inicial con «Created from <ref>» o «branch: Created from <ref>».
   - Fallback: `git config --get branch.<branch>.merge` y derivar la rama base local correspondiente.
   - Si ninguno concluye o hay ambigüedad: preguntar al usuario sin proponer un default.
6. **Calcular delta** con `git rev-list --count <base>..HEAD` para reportar cuántos commits se van a integrar.
7. **Cambiar a la rama base** con `git checkout <base>`. Si falla, parar y reportar.
8. **Ejecutar el merge** con `git merge --no-ff <feature-branch> -m "Merge US-XXX: <nombre-corto>"`. El mensaje de merge usa solo `US-XXX: <nombre-corto>` (sin el prefijo `feature/`). Si surge conflicto, ir al flujo de conflictos.
9. **Reportar resultado** al usuario: rama origen (con prefijo `feature/`), rama destino, número de commits integrados, hash del commit de merge, estado del HEAD y nota explícita de que **no** se hizo push ni se borró la rama de la US.

---

## Flujo: Manejo de conflictos

Cuando `git merge` produce conflictos.

1. **Abortar inmediatamente** con `git merge --abort` para restaurar el repo al estado previo al merge. No intentar resolución automática ni usar `--strategy=ours` / `--strategy=theirs`.
2. **Identificar archivos en conflicto** parseando la salida del intento de merge.
3. **Reportar al usuario** la lista de archivos en conflicto y dejar claro que el repo quedó como estaba. Indicar que el siguiente paso (rebase, merge manual, decisión de alcance) está fuera del skill.
4. **Parar.** No reintentar; no encadenar otra acción git sin nueva instrucción del usuario.

---

## Flujo: Rama base ambigua

Cuando reflog y config no concluyen, o existen varios candidatos plausibles.

1. **Listar los candidatos** detectados (p. ej. `main`, `develop`, ramas de release con commits ancestros del HEAD actual).
2. **Preguntar al usuario** cuál es la rama base correcta. No proponer un default ni inferir por convención del proyecto sin confirmación.
3. **Esperar respuesta** antes de continuar al paso 7 del flujo estándar. Sin respuesta clara, no hay merge.

---

## Checklist antes de mergear

**Información:**
- [ ] Rama actual detectada y validada contra `feature/US-XXX-[nombre-corto]`
- [ ] Carpeta de la US localizada en `docs/specs/user-stories/US-XXX-[nombre-corto]/`
- [ ] Rama base resuelta (reflog, config o confirmación del usuario)
- [ ] Idioma de preferencia determinado y `.agent/MEMORY.md` actualizado si fue necesario

**Validación:**
- [ ] `git status --porcelain` sin salida (working tree limpio)
- [ ] `progress.md` existe en la carpeta de la US
- [ ] **Todas** las tareas de `progress.md` en estado `done`
- [ ] Sin commits sin commitear ni stash sin aplicar relevante al alcance

**Ejecución:**
- [ ] `git checkout <base>` exitoso
- [ ] `git merge --no-ff` exitoso, sin conflictos
- [ ] Hash del commit de merge capturado para el reporte
- [ ] Número de commits integrados calculado antes del checkout

**Cierre:**
- [ ] Reporte al usuario con rama origen, rama destino, commits integrados y hash de merge
- [ ] Sin push ejecutado
- [ ] Sin borrado de rama ejecutado
- [ ] `progress.md` no fue modificado por el skill

---

## Ejemplos

**Ejemplo 1 — Camino feliz**

- *Entrada:* Rama `feature/US-042-exportacion-csv`, working tree limpio, `progress.md` con tres tareas todas en `done`, reflog indica `Created from develop`.
- *Salida:* `git checkout develop` → `git merge --no-ff feature/US-042-exportacion-csv -m "Merge US-042: exportacion-csv"` → reporte: «Merged 7 commits de `feature/US-042-exportacion-csv` → `develop`. Commit de merge: `a1b2c3d`. HEAD en `develop`, working tree limpio. La rama de US no fue borrada ni se hizo push.»

**Ejemplo 2 — Tarea pendiente**

- *Entrada:* Rama `feature/US-013-ajuste-permisos`, working tree limpio, `progress.md` con TK-001 en `done` y TK-002 en `in-progress`.
- *Salida:* Sin operaciones git. Mensaje:
  ```
  ⚠️ No es posible mergear todavía:
  - progress.md tiene tareas no-done:
    - TK-001: done
    - TK-002: in-progress
  - Completa o marca explícitamente cada tarea como done antes de reintentar.
  ```

**Ejemplo 3 — Rama base ambigua**

- *Entrada:* Rama `feature/US-077-...`, reflog sin entrada «Created from», sin upstream local; existen `main`, `develop` y `release/2026.q2` como ancestros plausibles.
- *Comportamiento:* El agente lista los candidatos y pregunta cuál es la rama base correcta. No asume `main` ni `develop`. No mergea hasta tener respuesta.

**Ejemplo 4 — Working tree sucio**

- *Entrada:* Rama `feature/US-051-...`, dos archivos modificados sin commitear, `progress.md` íntegro en `done`.
- *Salida:* Sin operaciones git. Mensaje listando los archivos pendientes y pidiendo commit, stash o descarte antes de reintentar.

**Ejemplo 5 — Conflicto en el merge**

- *Entrada:* Verificaciones OK, rama base `main`, `git merge --no-ff` produce conflictos en `src/app/Module.java`.
- *Comportamiento:* El agente ejecuta `git merge --abort`, deja el repo en el estado previo, lista los archivos en conflicto y pide al usuario resolverlos manualmente. No reintenta.

**Ejemplo 6 — Rama sin prefijo `feature/`**

- *Entrada:* Rama `US-099-cleanup-logs` (sin el prefijo `feature/`), `progress.md` íntegro en `done`.
- *Salida:* Sin operaciones git. Mensaje: «La rama actual `US-099-cleanup-logs` no cumple el patrón `feature/US-XXX-[nombre-corto]`. Renombra la rama con `git branch -m feature/US-099-cleanup-logs` antes de reintentar el submit.»

---

## Anti-patterns

- Hacer merge sin verificar `progress.md` o ignorando tareas no-`done`.
- Modificar `progress.md` para «forzar» que aparezcan en `done` sin que el trabajo esté completo.
- Aceptar ramas sin prefijo `feature/` o con prefijos alternativos (`feat/`, `bugfix/`, `hotfix/`) como rama de submit.
- Asumir `main`, `master` o `develop` como rama base sin confirmarlo por reflog, config o usuario.
- Resolver conflictos automáticamente o usar `--strategy=ours` / `--strategy=theirs` para «hacerlo pasar».
- Usar merge fast-forward por defecto cuando el historial de la rama de US se perdería; preservar con `--no-ff` salvo petición explícita del usuario.
- Hacer push de la rama base o borrar la rama de la US sin que el usuario lo pida explícitamente fuera del skill.
- Mergear con working tree sucio o desde una rama que no encaja con `feature/US-XXX-[nombre-corto]`.
- Cerrar varias US en una sola pasada del skill; este flujo cubre una US por ejecución.
- Reintentar el merge tras un conflicto sin nueva instrucción del usuario.
- Narrar el trabajo realizado en el mensaje al usuario («leí progress.md», «detecté la rama»); solo reportar resultados y pendientes.

---

## Notas

### progress.md

El skill **lee** `progress.md` para verificar estados, pero no lo modifica. La actualización de estados durante la implementación es responsabilidad de **story-implement**. Si al revisar el archivo aparecen tareas en `in-progress` que sí están terminadas en código, el usuario debe corregir el archivo antes de reintentar el submit — no es papel del submit ajustar progreso.

### `done` como estado terminal

Solo `done` (case-insensitive, sin espacios extra) cierra una tarea. `skipped` no se acepta como terminal por defecto: indica una decisión que debe quedar registrada explícitamente y, si el alcance de la US se redujo, esa reducción debería reflejarse en el `README.md` de la US antes de mergear. Si el equipo decide aceptar `skipped` como terminal, ese acuerdo debe documentarse y el skill ajustarse en consecuencia.

### Detección de rama base

`git reflog show <branch>` es la fuente más fiable, pero solo funciona localmente y se pierde si la rama se clonó fresh o si `gc.reflogExpire` ya pasó. El fallback a `git config --get branch.<branch>.merge` cubre el caso de upstream local. Cuando ambos fallan, la pregunta al usuario es **por diseño**, no por descuido: el skill no debe adivinar la rama de integración.

### Sin push intencional

La decisión de cuándo publicar el merge en el remoto queda fuera del skill, para preservar el control del usuario sobre integración con CI/CD, MRs/PRs y revisión. El mensaje final al usuario debe dejar explícito que el merge es **solo local** y que push y limpieza de ramas son pasos manuales posteriores.

### Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno, cadenas de pensamiento ni narración del trabajo en curso. Si hay condiciones que bloquean el merge, listarlas en viñetas con detalle suficiente para que el usuario pueda actuar (qué archivos, qué tareas, qué estados).