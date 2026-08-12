# Ejemplos, anti-patrones y notas

Referencias del skill **work-integrate**. Cubren los dos tipos de trabajo (`US-XXX`, `WI-XXX`).

---

## Ejemplos

**Ejemplo 1 — Historia de usuario (camino feliz)**

- *Entrada:* Rama `feature/US-042-exportacion-csv`, working tree limpio, `progress.md` con tres TK todas en `Done`, reflog indica `Created from develop`.
- *Salida:* `quality-check` → **✅ Aprobado** (persiste `docs/specs/test-run.json`); `code-review` → **✅ Aprobado**; `trace-validate` → **✅ Aprobado** (reutiliza ese `test-run.json`, sin re-ejecutar pruebas); `git checkout develop` → `git merge --no-ff feature/US-042-exportacion-csv -m "Merge US-042: exportacion-csv"` → reporte: «Merged 7 commits de `feature/US-042-exportacion-csv` → `develop`. Commit de merge: `a1b2c3d`. HEAD en `develop`, working tree limpio. La rama no fue borrada ni se hizo push.»

**Ejemplo 2 — Work item (progress.md por carpeta del WI)**

- *Entrada:* Rama `fix/WI-007-fuga-memoria`, working tree limpio, `docs/specs/work-items/WI-007-fuga-memoria/progress.md` con todas las unidades del WI en `Done`, reflog indica `Created from main`.
- *Salida:* `git checkout main` → `git merge --no-ff fix/WI-007-fuga-memoria -m "Merge WI-007: fuga-memoria"` → reporte con commits integrados y hash de merge.

**Ejemplo 3 — Unidad pendiente**

- *Entrada:* Rama `feature/US-013-ajuste-permisos`, working tree limpio, `progress.md` con TK-001 en `Done` y TK-002 en `In Progress`.
- *Salida:* Sin operaciones git. Mensaje:
  ```
  ⚠️ No es posible mergear todavía:
  - progress.md tiene unidades no Done:
    - TK-001: Done
    - TK-002: In Progress
  - Completa o marca explícitamente cada unidad como Done antes de reintentar.
  ```

**Ejemplo 4 — Rama base ambigua**

- *Entrada:* Rama `feature/US-077-...`, reflog sin entrada `Created from`, sin upstream local; existen `main`, `develop` y `release/2026.q2` como ancestros plausibles.
- *Comportamiento:* El agente lista los candidatos y pregunta cuál es la rama base correcta. No asume `main` ni `develop`. No mergea hasta tener respuesta.

**Ejemplo 5 — Working tree sucio**

- *Entrada:* Rama `feature/US-051-...`, dos archivos modificados sin commitear, `progress.md` íntegro en `Done`.
- *Salida:* El skill invoca automáticamente el flujo de `git-commit` sobre esos cambios (sin preguntar si conviene invocarlo) — `git-commit` sí muestra su propia propuesta y pausa a confirmarla con el usuario, como es su comportamiento normal — y, una vez el working tree queda limpio, continúa con el resto de la validación y el merge con normalidad.

**Ejemplo 6 — Conflicto en el merge**

- *Entrada:* Verificaciones OK, rama base `main`, `git merge --no-ff` produce conflictos en `src/app/Module.java`.
- *Comportamiento:* El agente ejecuta `git merge --abort`, deja el repo en el estado previo, lista los archivos en conflicto y pide al usuario resolverlos manualmente. No reintenta.

**Ejemplo 7 — Rama con prefijo inválido**

- *Entrada:* Rama `hotfix-cache` (sin identificador de trabajo reconocible), `progress.md` íntegro en `Done`.
- *Salida:* Sin operaciones git. Mensaje: «La rama actual `hotfix-cache` no corresponde a ningún trabajo (`US-XXX`/`WI-XXX`) ni cumple un patrón de rama válido. Renombra la rama al formato de su tipo (p. ej. `git branch -m fix/WI-012-cache-ttl`) antes de reintentar el submit.»

**Ejemplo 8 — Trazabilidad rechaza**

- *Entrada:* Rama `feature/US-088-...`, working tree limpio, todas las TK en `Done`, `quality-check` y `code-review` → **✅ Aprobado**.
- *Comportamiento:* `trace-validate` devuelve **❌ Rechazado** (criterio `AC-003` sin prueba que lo cubra). Sin operaciones git: se reporta el criterio faltante y se pide cubrirlo (vía `work-implement`) antes de reintentar el submit. No se mergea.

---

## Anti-patterns

- Hacer merge sin verificar `progress.md` o ignorando unidades no `Done`.
- Buscar el `progress.md` de un WI en un archivo compartido `docs/specs/work-items/progress.md`; cada WI tiene su propio `progress.md` dentro de su carpeta `WI-XXX-[kebab-case]/`.
- Hacer merge sin haber ejecutado las **tres** puertas de cierre (`quality-check`, `code-review`, `trace-validate`). En particular, `quality-check` y `code-review` son independientes: un **❌ Rechazado** o **⚠️ Incompleto** en cualquiera de los dos bloquea el merge, que solo procede con **✅ Aprobado** en ambos.
- Unificar ambas puertas en una sola invocación o dar por hecha una a partir del veredicto de la otra — son skills independientes con veredictos propios.
- Hacer merge sin haber ejecutado `trace-validate`, con veredicto **❌ Rechazado**, o corriéndolo **antes** de `quality-check` (perdería la reutilización de `test-run.json`) — va después de `quality-check` y solo procede con **✅ Aprobado** / **⚠️ Aprobado con observaciones**.
- Modificar `progress.md` para «forzar» que aparezcan en `Done` sin que el trabajo esté completo.
- Aceptar ramas sin un identificador de trabajo reconocible o con prefijos no válidos para su tipo (p. ej. `bugfix/`, `hotfix/`, o `fix/` aplicado a una US).
- Asumir `main`, `master` o `develop` como rama base sin confirmarlo por reflog, config o usuario.
- Resolver conflictos automáticamente o usar `--strategy=ours` / `--strategy=theirs` para **hacerlo pasar**.
- Usar merge fast-forward por defecto cuando el historial de la rama se perdería; preservar con `--no-ff` salvo petición explícita del usuario.
- Hacer push de la rama base o borrar la rama del trabajo sin que el usuario lo pida explícitamente fuera del skill.
- Mergear desde una rama que no encaja con el patrón de su tipo.
- Parar a preguntarle al usuario si desea commitear los cambios pendientes en vez de invocar directamente el flujo de `git-commit`; el working tree sucio no detiene el submit — la invocación es automática (aunque `git-commit` pueda a su vez pedir su propia confirmación antes de comitear).
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
| **Entrada** | Rama del trabajo (`feature/US-XXX-...`, o `feature/`\|`fix/`\|`chore/`\|`refactor/` + `WI-XXX-...`); working tree con cambios pendientes se resuelve automáticamente invocando **`git-commit`** (sin preguntar si conviene invocarlo — `git-commit` sí puede pedir su propia confirmación antes de comitear); `progress.md` con cada unidad del trabajo en `Done`; puertas de cierre en aprobado: `quality-check` **✅ Aprobado**, `code-review` **✅ Aprobado** y `trace-validate` **✅ Aprobado**. |
| **Salida** | Merge `--no-ff` a la rama base local; reporte con hash de merge. Sin push ni borrado de rama. |
| **Siguiente paso (fuera del skill)** | Push de la rama base y CI — decisión del usuario. |
| **PR/MR (`pr-create`)** | Abrir **antes** de este skill, estando en la rama del trabajo (o con la feature ya publicada en remoto). Tras el merge local, la rama activa es la **base**; `pr-create` bloquea en `main`/`master`/`develop`/`trunk`. |
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
