---
name: pr-create
description: >-
  Crear Pull Request (PR) o Merge Request (MR) desde la rama actual hacia una rama destino preguntada al usuario, con puertas de calidad obligatorias y bloqueantes antes de crearlo: ejecuta quality-check, code-review y trace-validate (los tres deben dar veredicto aprobado) y, si existe docs/policies/definition-of-done.md, verifica el código contra esa Definition of Done. Funciona sobre cualquier repositorio git con remoto: auto-detecta la plataforma (GitHub, GitLab, Bitbucket, Gitea, Azure Repos, etc.) desde el remoto y usa el CLI disponible. Auto-genera título y descripción a partir de los commits y crea el PR en una sola pasada. Usar siempre que el usuario pida crear, abrir, generar, levantar o subir un PR, MR, pull request o merge request, incluso si solo dice "crea el PR" o "súbelo a develop" sin nombrar la plataforma.
license: MIT
---

# Skill: Crear Pull Request (PR / MR)

Crear un PR o MR desde la **rama actual** hacia una **rama destino preguntada al usuario**, sobre cualquier repo git con remoto configurado.

> **Origen = rama actual**, sin excepción, y debe ser una **rama de implementación** con prefijo reconocido (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`, u otro equivalente del repo). Si está en `main`, `master`, `develop`, `trunk`, o no tiene un prefijo de implementación reconocible: parar y avisar.
>
> **Working tree sucio no detiene el flujo:** si hay cambios sin commitear, el skill invoca automáticamente el flujo del skill **`git-commit`** (sin preguntar al usuario si desea commitear — la decisión de invocarlo es automática) y, una vez el working tree queda limpio, continúa con el resto del pre-flight. Nota: `git-commit` no tiene modo silencioso — normalmente pausa mostrando su propia propuesta y pidiendo confirmación antes de comitear (y puede detenerse del todo si detecta secretos); ese paso no se suprime al invocarlo desde aquí.
>
> **Plataforma se auto-detecta** del remoto `origin`. No preguntar.
>
> **Puertas de calidad obligatorias y bloqueantes:** antes de crear el PR se ejecutan **siempre** `quality-check`, `code-review` y `trace-validate`, y —si existe— se verifica la **Definition of Done** (`docs/policies/definition-of-done.md`). Todas las que apliquen deben quedar en **aprobado** (la Definition of Done solo cuenta si el archivo existe); si alguna no lo está, **no** se crea el PR. No hay flujo "crear como draft" ni "ignorar y continuar".
>
> **No incluye:** modificar código por iniciativa propia, merges, rebases, resolver conflictos, asignar reviewers/labels/milestones, editar PRs existentes. (Las correcciones solo se aplican si el usuario las autoriza explícitamente — ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad).)

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

Si en el contexto de la sesión de chat existe un **idioma de preferencia del usuario**, redactar el título y la descripción en ese idioma. Si no consta, usar el **idioma de la conversación**; y si tampoco es determinable, el idioma predominante de los commits del rango `origin/<destino>..HEAD`. Un título/descripción explícitos del usuario en su mensaje **siempre** tienen prioridad y se respetan literalmente.

Cuando el idioma resuelto obliga a traducir el título, el prefijo de ticket (`[US-042]`, `[TK-007]`) se mantiene intacto. Los subjects de commits en la lista de la descripción **no** se traducen — se citan literales para preservar trazabilidad. Los reportes de `quality-check`, `code-review` y `trace-validate` siguen su propia resolución de idioma.

---

## Flujo

### Paso 1 — Pre-flight (obligatorio antes de cualquier acción)

1. `git rev-parse --is-inside-work-tree` — confirmar repo git.
2. `git rev-parse --abbrev-ref HEAD` — obtener rama actual.
3. Validar que la rama actual es una **rama de implementación**: debe comenzar con un prefijo reconocido (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`, u otro prefijo de implementación equivalente que use el repo) y no puede ser `main`, `master`, `develop` ni `trunk`. Si no cumple: **parar** y avisar indicando la convención de rama esperada.
4. `git status --porcelain` — si no está vacío, **invocar automáticamente el flujo del skill `git-commit`** sobre los cambios pendientes (sin preguntar al usuario si desea commitear) y esperar a que termine. La invocación delega en `git-commit` **todo** su criterio operativo (agrupación por cambio lógico, inferencia de tipo/scope/mensaje, staging, detección de secretos, confirmación de la propuesta) — `pr-create` no decide un mensaje de commit ni qué stagear por su cuenta; solo dispara el flujo y espera su resultado. **`git-commit` no tiene modo silencioso**: normalmente pausa mostrando su propuesta y pidiendo confirmación al usuario antes de comitear. «Sin preguntar al usuario» se refiere solo a que `pr-create` no pide permiso para *invocar* `git-commit`, no a que `git-commit` deje de confirmar su propio commit.
   - **Si `git-commit` no está disponible** (skill no instalado o no localizable en el entorno): **parar** y avisar, mostrando los archivos pendientes y sugiriendo al usuario commitear manualmente antes de reintentar — no ejecutar `git add`/`git commit` directos como sustituto.
   - **Si `git-commit` deja el working tree completamente limpio**, continuar con el resto del pre-flight.
   - **Si `git-commit` termina dejando el working tree parcialmente limpio por una decisión de alcance suya** (p. ej. agrupó y commiteó unos archivos pero dejó otros fuera deliberadamente, o el usuario excluyó algunos de un commit propuesto): no es un error de `pr-create`. Volver a comprobar `git status --porcelain`; si sigue habiendo cambios, invocar `git-commit` de nuevo sobre el remanente (mismo criterio, sin preguntar) hasta que quede limpio o `git-commit` se detenga por un motivo real (secretos, o una decisión que no puede resolver solo).
   - Si se detiene sin commitear (p. ej. por detección de secretos, o porque requiere una decisión del usuario que el propio `git-commit` no puede resolver solo), **parar** y avisar con el motivo que reportó `git-commit`.

### Paso 2 — Detectar plataforma y CLI

Aplicar la tabla de detección. Si ya existe un PR para `<rama-actual> → <destino>`, capturar su URL y devolvérsela al usuario sin crear uno nuevo.

### Paso 3 — Preguntar destino

- **Rama destino** (pregunta única): validar que existe en `origin` (`git ls-remote --heads origin <destino>`) y que no coincide con la rama actual.

`quality-check`, `code-review` y `trace-validate` **no se preguntan**: son obligatorios (ver Paso 4). No hay opción de saltarlos.

### Paso 4 — Puertas de calidad (obligatorias, bloqueantes)

Antes de cualquier push o creación de PR se ejecutan **las cuatro** puertas en este orden (la cuarta solo si existe el archivo de Definition of Done). Una puerta que no quede en **aprobado** detiene el flujo: **no** se hace push ni se crea el PR. Ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad) para qué hacer ante un fallo.

**4.1 — `quality-check` (siempre).** Invocar el flujo de `quality-check` (verificaciones automatizadas: tipado, linter, unit, coverage, integración, build, e2e, sonar) sobre la rama.
- Aprobado = veredicto **`✅ Aprobado`** → continuar (aunque haya warnings o resultados informativos).
- Rechazado = **`❌ Rechazado`** o **`⚠️ Incompleto`** → detener.

> Este es el punto de cierre donde `quality-check` ejecuta la batería completa de pruebas y persiste `test-run.json`. El orden importa: `4.1` antes de `4.3` permite que `trace-validate` **reutilice** esa corrida sin re-ejecutar las pruebas.

**4.2 — `code-review` (siempre).** Invocar el flujo de `code-review` (revisión cualitativa: intención, arquitectura y diseño) con `base origin/<destino>`, su alcance por defecto (todo lo que la rama difiere de esa base, incluidas las correcciones que `4.1` haya podido dejar sin commitear). Emite un veredicto **propio e independiente** del de `4.1`; ninguno sustituye al otro.
- Aprobado = veredicto **`✅ Aprobado`** → continuar.
- Rechazado = **`❌ Rechazado`** o **`⚠️ Incompleto`** → detener.

**4.3 — `trace-validate` (siempre).** Resolver el **trabajo** a validar (`US-XXX` o `WI-XXX`) del patrón de la rama, del prefijo de los commits, o de la ruta de trabajo. `trace-validate` traza los **criterios de aceptación** `AC-XXX` del trabajo (mismo formato en US y WI). Si no se puede determinar el trabajo, preguntar al usuario cuál validar; si no lo provee, la puerta **no** puede quedar aprobada → detener. Invocar `trace-validate` sobre ese trabajo. Reutiliza el `test-run.json` producido por `4.1` (misma rama, sin cambios) y, si el `trace-report.md` ya estaba fresco, lo devuelve sin regenerarlo.
- Aprobado = **`✅ Aprobado`** → continuar. **`⚠️ Aprobado con observaciones`** también se considera aprobado, pero se **muestran las observaciones al usuario** antes de seguir.
- Rechazado = **`❌ Rechazado`** → detener.

**4.4 — Definition of Done (solo si existe el archivo).** Comprobar si existe `docs/policies/definition-of-done.md` en la raíz del repo (`test -f docs/policies/definition-of-done.md`).
- Si **no** existe → omitir esta puerta (no afecta el resultado).
- Si **existe** → leerla y verificar el código/cambio contra cada política/ítem de esa Definition of Done, sobre el **mismo alcance que `4.2`**: `origin/<destino>` contra el estado actual del árbol, de modo que incluya las correcciones que las puertas anteriores hayan podido dejar sin commitear. **Formato esperado de `docs/policies/definition-of-done.md`:** un documento de política con ítems/checklist verificables (cada ítem una condición concreta de cierre). El skill solo evalúa automáticamente los ítems comprobables desde el repo o el diff; para el resto, pregunta.
  - **Ítems comprobables desde el repo/diff** → evaluarlos directamente: cumplido / incumplido.
  - **Ítems no comprobables automáticamente** → **presentarlos al usuario y preguntarle** si se cumplen (no inventar su cumplimiento). Si el usuario **confirma** que se cumplen → cuentan como cumplidos. Si **no los confirma** o los marca incumplidos → cuentan como incumplidos.
  - Aprobado = todos los ítems aplicables se cumplen (los comprobables verificados + los no comprobables confirmados por el usuario) → continuar.
  - Rechazado = al menos un ítem incumplido, o algún ítem no comprobable que el usuario no confirma → la puerta **no** queda aprobada → detener, listando qué ítem(s) de la DoD no se cumplen o quedan sin confirmar.

Solo si **todas las puertas aplicables** quedan en aprobado se avanza al Paso 5.

### Paso 5 — Push de la rama actual

**Antes del push, re-comprobar el working tree.** Las puertas del Paso 4 pueden haber dejado cambios sin commitear (correcciones aplicadas por `quality-check` o delegadas en `work-implement`). Ejecutar `git status --porcelain` y, si hay salida, **invocar de nuevo `git-commit`** con el mismo criterio del pre-flight: lo que se sube debe ser exactamente lo que las puertas verificaron.

> **Los artefactos de las puertas viajan en el PR.** Las puertas escriben siempre `docs/audits/quality-check.md`, `docs/audits/code-review.md`, `.sdd-devkit/test-run.json` y el `trace-report.md` del trabajo. Ese commit los incluye a propósito: el revisor ve el veredicto junto al cambio, y `test-run.json` permite que una corrida posterior reutilice la caché sin re-ejecutar pruebas. Son artefactos generados, así que **no** desplazan el fingerprint de frescura (están excluidos).

Si la rama no existe en `origin` o tiene commits no publicados (`git rev-list origin/<rama>..HEAD` no vacío): ejecutar `git push -u origin <rama-actual>`. Nunca `--force` ni `--force-with-lease`. Si el push falla por divergencia: parar y avisar — el usuario decide cómo resolver.

### Paso 6 — Generar título y descripción

Sin pedir confirmación (salvo override explícito del usuario):

- **Título:** un único commit en el rango → su subject (`git log -1 --pretty=%s`). Varios commits → subject del más antiguo. Si la rama sigue patrón `<prefix>/<TICKET>-<desc>` o `US-XXX-...`, anteponer `[<TICKET>]`. Traducir al idioma resuelto manteniendo el prefijo de ticket intacto.
- **Descripción:** lista de commits (`git log origin/<destino>..HEAD --pretty="- %s"`), resumen de cambios (`git diff --stat origin/<destino>..HEAD`) y referencia a issue/ticket si el nombre de la rama lo contiene (patrón `US-XXX`, `TK-XXX`, `JIRA-XXX`, `#NNN`).

### Paso 7 — Crear PR/MR

| Plataforma | Comando |
|-----------|---------|
| GitHub | `gh pr create --base <destino> --head <rama> --title "<título>" --body "<desc>"` |
| GitLab | `glab mr create --target-branch <destino> --source-branch <rama> --title "<título>" --description "<desc>" --yes` |
| Bitbucket Cloud | `POST https://api.bitbucket.org/2.0/repositories/<workspace>/<repo>/pullrequests` con payload JSON |
| Bitbucket Server | `POST /rest/api/1.0/projects/<key>/repos/<slug>/pull-requests` con payload equivalente |
| Azure Repos | `az repos pr create --source-branch <rama> --target-branch <destino> --title "<título>" --description "<desc>"` |
| Gitea/Forgejo | `tea pr create --base <destino> --head <rama> --title "<título>" --description "<desc>"` |

Si el CLI indica que ya existe un PR: capturar y devolver la URL existente.

### Paso 8 — Reportar

```
✓ PR creado en <plataforma>
  Origen:  <rama-actual>
  Destino: <rama-destino>
  Título:  <título-generado>
  URL:     <url>
```

Bloqueo por una puerta de calidad:
```
✗ PR NO creado: la puerta <quality-check | code-review | trace-validate | definition-of-done> no quedó en aprobado.
  Veredicto: <❌ Rechazado (quality-check) | ⚠️ Incompleto (quality-check) | ❌ Rechazado (code-review) | ⚠️ Incompleto (code-review) | ❌ Rechazado (trace-validate) | DoD incumplida>

<reporte literal del skill, o lista de ítems de la DoD incumplidos>

Acciones para reintentar:
  <pasos concretos que debe tomar el usuario para dejar la puerta en aprobado>
```
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
Skill: pre-flight OK (rama `feature/US-042-auth-refresh-token`). Detecta GitLab (`ns.bayteq.com:3311`). Pregunta destino → `develop`. Puertas: `quality-check` → `✅ Aprobado`; `code-review` con `base origin/develop` → `✅ Aprobado`; resuelve `US-042`, `trace-validate` → `✅ Aprobado`; existe `docs/policies/definition-of-done.md` → todos los ítems cumplidos. Push. Auto-genera título `[US-042] feat(auth): refresh token con expiración 15min`. Ejecuta `glab mr create`. Devuelve URL.

**Ejemplo 2 — quality-check bloquea**
`quality-check` devuelve `❌ Rechazado` (tests fallidos + eslint errors). El skill no crea el PR, no hace push, muestra el reporte, lista las acciones para reintentar y —al estar a su alcance— pregunta si aplica la corrección. Si el usuario no autoriza, termina.

**Ejemplo 3 — trace-validate bloquea**
`quality-check` y `code-review` → `✅ Aprobado`, pero `trace-validate` de `US-042` devuelve `RECHAZADO` (criterio `AC-003` sin test). El skill no crea el PR; informa que falta cubrir `AC-003` y pregunta si desea que se intente la corrección (delegando al flujo correspondiente). Sin autorización, termina con las acciones indicadas.

**Ejemplo 4 — Definition of Done incumplida**
Las tres primeras puertas en aprobado, pero `docs/policies/definition-of-done.md` exige «CHANGELOG.md actualizado» y el diff no lo toca. El skill detiene la creación, lista ese ítem como incumplido e indica la acción; si el usuario autoriza y la corrección está a su alcance, la aplica y reintenta la puerta.

**Ejemplo 5 — Sin Definition of Done**
No existe `docs/policies/definition-of-done.md`. Esa puerta se omite; el PR se crea si `quality-check`, `code-review` y `trace-validate` quedaron en aprobado.

**Ejemplo 6 — Azure Repos**
`origin` apunta a `https://dev.azure.com/<org>/<proyecto>/_git/<repo>`. Detecta Azure Repos, verifica `az repos`, pregunta destino, ejecuta las puertas, push, crea PR con `az repos pr create`.

**Ejemplo 7 — Rama protegida**
Usuario en `main`: «crea un PR a develop.» Parar en pre-flight: «Estás en `main`. Cambia a una rama de feature antes de crear el PR.»

**Ejemplo 7b — Rama sin prefijo de implementación**
Usuario en `hotfix-cache` (no sigue ningún prefijo reconocido): «crea un PR a develop.» Parar en pre-flight: «La rama `hotfix-cache` no sigue una convención de rama de implementación (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`...). Renómbrala o cambia a la rama correcta antes de crear el PR.»

**Ejemplo 8 — Working tree sucio**
`git status --porcelain` devuelve dos archivos modificados sin commitear. El skill invoca automáticamente el flujo de `git-commit` sobre esos cambios (sin preguntar si conviene invocarlo) — `git-commit` sí muestra su propia propuesta y pausa a confirmarla con el usuario, como es su comportamiento normal — y, una vez el working tree queda limpio, continúa el pre-flight con normalidad.

**Ejemplo 9 — PR ya existente**
La rama ya tiene un PR/MR abierto hacia `develop`. Devolver la URL existente con nota «Ya existe un PR para esta combinación». No crear uno nuevo.

---

## Anti-patterns

- Preguntar la rama origen (siempre es la actual) o asumir la destino.
- Preguntar la plataforma (se detecta del remoto).
- Preguntar si correr `quality-check`, `code-review` o `trace-validate`, u ofrecer saltarlos: son obligatorios.
- Dar por cumplida una puerta a partir del veredicto de otra (p. ej. asumir `code-review` aprobado porque `quality-check` lo está): son skills independientes con veredictos propios.
- Pedir confirmación de título o descripción (flujo no interactivo).
- Crear el PR con `quality-check` o `code-review` en `❌ Rechazado`/`⚠️ Incompleto`, con `trace-validate` en `RECHAZADO`, o con la Definition of Done incumplida.
- Saltarse `trace-validate` por no encontrar el trabajo (US/WI) en lugar de preguntarlo al usuario.
- Tratar la ausencia de `docs/policies/definition-of-done.md` como un fallo: si no existe, esa puerta simplemente se omite.
- Inventar el cumplimiento de un ítem de la DoD que no se puede determinar desde el repo o el diff.
- Aplicar una corrección sin autorización explícita del usuario, o no re-ejecutar la puerta tras corregir.
- Ejecutar `git add`/`git commit` directos (fuera del flujo de `git-commit`), o parar a preguntar al usuario si desea commitear los cambios pendientes: ante working tree sucio se invoca automáticamente el flujo de `git-commit` (aunque `git-commit` pueda a su vez pedir su propia confirmación antes de comitear), sin que `pr-create` pida permiso previo para invocarlo.
- Crear el PR desde una rama sin prefijo de implementación reconocido (`feature/`, `fix/`, `chore/`, `refactor/`, `test/`...), o solo validar contra la lista de ramas protegidas sin exigir un prefijo válido.
- Usar `git push --force` o `--force-with-lease`.
- Asignar reviewers, labels o milestones por iniciativa propia.
- Re-implementar la lógica de `quality-check`, `code-review` o `trace-validate` en lugar de invocar el flujo existente.
- Referenciar `.agents/MEMORY.md` directamente para el idioma (usar el contexto de la sesión).
- Crear un segundo PR cuando ya existe uno para `<rama-actual> → <destino>`.