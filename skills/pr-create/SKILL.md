---
name: pr-create
description: >-
  Crear Pull Request (PR) o Merge Request (MR) desde la rama actual hacia una rama destino preguntada al usuario, con puertas de calidad obligatorias y bloqueantes antes de crearlo: ejecuta code-review y trace-validate (ambos deben dar veredicto aprobado) y, si existe docs/policies/definition-of-done.md, verifica el código contra esa Definition of Done. Funciona sobre cualquier repositorio git con remoto: auto-detecta la plataforma (GitHub, GitLab, Bitbucket, Gitea, Azure Repos, etc.) desde el remoto y usa el CLI disponible. Auto-genera título y descripción a partir de los commits y crea el PR en una sola pasada. Usar siempre que el usuario pida crear, abrir, generar, levantar o subir un PR, MR, pull request o merge request, incluso si solo dice "crea el PR" o "súbelo a develop" sin nombrar la plataforma.
license: MIT
---

# Skill: Crear Pull Request (PR / MR)

Crear un PR o MR desde la **rama actual** hacia una **rama destino preguntada al usuario**, sobre cualquier repo git con remoto configurado.

> **Origen = rama actual**, sin excepción. Debe ser una **rama de implementación** con prefijo reconocido (`feature/`, `fix/`, `chore/`, `refactor/`) y no estar en `main`, `master`, `develop` ni `trunk`; si no cumple ambas condiciones, parar y avisar.
>
> **Plataforma se auto-detecta** del remoto `origin`. No preguntar.
>
> **Working tree sucio no detiene el flujo ni se pregunta al usuario:** si hay cambios sin commitear, se invoca automáticamente el flujo de **`git-commit`** sobre ellos (con su propia detección de secretos y confirmación del mensaje) y, una vez commiteados, se continúa. Solo bloquea si `git-commit` no logra completar el commit.
>
> **Puertas de calidad obligatorias y bloqueantes:** antes de crear el PR se ejecutan **siempre** `code-review` y `trace-validate`, y —si existe— se verifica la **Definition of Done** (`docs/policies/definition-of-done.md`). Las tres deben quedar en **aprobado**; si alguna no lo está, **no** se crea el PR. No hay flujo "crear como draft" ni "ignorar y continuar".
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

Cuando el idioma resuelto obliga a traducir el título, el prefijo de ticket (`[US-042]`, `[TK-007]`) se mantiene intacto. Los subjects de commits en la lista de la descripción **no** se traducen — se citan literales para preservar trazabilidad. Los reportes de `code-review` y `trace-validate` siguen su propia resolución de idioma.

---

## Flujo

### Paso 1 — Pre-flight (obligatorio antes de cualquier acción)

1. `git rev-parse --is-inside-work-tree` — confirmar repo git.
2. `git rev-parse --abbrev-ref HEAD` — obtener rama actual.
3. **Validar rama de implementación:** la rama actual debe empezar por un prefijo reconocido (`feature/`, `fix/`, `chore/`, `refactor/`) **y** no estar en `{main, master, develop, trunk}`. Si falla cualquiera de las dos condiciones: **parar** y avisar (rama protegida, o rama sin prefijo de implementación reconocido).
4. `git status --porcelain` — si hay salida (cambios sin commitear): **no preguntar al usuario si debe commitear**; invocar automáticamente el flujo de **`git-commit`** sobre esos cambios (aplica su propia detección de secretos y muestra su propia confirmación del mensaje) y, una vez completado el commit, continuar con el resto del pre-flight. Si `git-commit` no logra completar el commit (p. ej. detecta un secreto y queda bloqueado), **parar** y reportar ese bloqueo tal cual lo devuelve `git-commit`.

### Paso 2 — Detectar plataforma y CLI

Aplicar la tabla de detección. Si ya existe un PR para `<rama-actual> → <destino>`, capturar su URL y devolvérsela al usuario sin crear uno nuevo.

### Paso 3 — Preguntar destino

- **Rama destino** (pregunta única): validar que existe en `origin` (`git ls-remote --heads origin <destino>`) y que no coincide con la rama actual.

`code-review` y `trace-validate` **no se preguntan**: son obligatorios (ver Paso 4). No hay opción de saltarlos.

### Paso 4 — Puertas de calidad (obligatorias, bloqueantes)

Antes de cualquier push o creación de PR se ejecutan **las tres** puertas en este orden. Una puerta que no quede en **aprobado** detiene el flujo: **no** se hace push ni se crea el PR. Ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad) para qué hacer ante un fallo.

**4.1 — `code-review` (siempre).** Invocar el flujo de `code-review` sobre el diff `origin/<destino>..HEAD`.
- Aprobado = veredicto **`✅ Aprobado`** → continuar (aunque haya warnings o recomendaciones informativas).
- Rechazado = **`❌ Rechazado`** o **`⚠️ Incompleto`** → detener.

> Este es el punto de cierre donde `code-review` ejecuta la batería completa de pruebas y persiste `test-run.json`. El orden importa: `4.1` antes de `4.2` permite que `trace-validate` **reutilice** esa corrida sin re-ejecutar las pruebas.

**4.2 — `trace-validate` (siempre).** Resolver el **trabajo** a validar (`US-XXX` o `WI-XXX`) del patrón de la rama, del prefijo de los commits, o de la ruta de trabajo. `trace-validate` traza los **criterios de aceptación** `AC-XXX` del trabajo (mismo formato en US y WI). Si no se puede determinar el trabajo, preguntar al usuario cuál validar; si no lo provee, la puerta **no** puede quedar aprobada → detener. Invocar `trace-validate` sobre ese trabajo. Reutiliza el `test-run.json` recién producido por `4.1` (misma rama, sin cambios) y, si el `trace-report.md` ya estaba fresco, lo devuelve sin regenerarlo.
- Aprobado = **`✅ Aprobado`** → continuar. **`⚠️ Aprobado con observaciones`** también se considera aprobado, pero se **muestran las observaciones al usuario** antes de seguir.
- Rechazado = **`❌ Rechazado`** → detener.

**4.3 — Definition of Done (solo si existe el archivo).** Comprobar si existe `docs/policies/definition-of-done.md` en la raíz del repo (`test -f docs/policies/definition-of-done.md`).
- Si **no** existe → omitir esta puerta (no afecta el resultado).
- Si **existe** → leerla y verificar el código/cambio del rango `origin/<destino>..HEAD` contra cada política/ítem de esa Definition of Done. **Formato esperado de `docs/policies/definition-of-done.md`:** un documento de política con ítems/checklist verificables (cada ítem una condición concreta de cierre). El skill solo evalúa automáticamente los ítems comprobables desde el repo o el diff; para el resto, pregunta.
  - **Ítems comprobables desde el repo/diff** → evaluarlos directamente: cumplido / incumplido.
  - **Ítems no comprobables automáticamente** → **presentarlos al usuario y preguntarle** si se cumplen (no inventar su cumplimiento). Si el usuario **confirma** que se cumplen → cuentan como cumplidos. Si **no los confirma** o los marca incumplidos → cuentan como incumplidos.
  - Aprobado = todos los ítems aplicables se cumplen (los comprobables verificados + los no comprobables confirmados por el usuario) → continuar.
  - Rechazado = al menos un ítem incumplido, o algún ítem no comprobable que el usuario no confirma → la puerta **no** queda aprobada → detener, listando qué ítem(s) de la DoD no se cumplen o quedan sin confirmar.

Solo si **las tres** puertas quedan en aprobado se avanza al Paso 5.

### Paso 5 — Push de la rama actual

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
✗ PR NO creado: la puerta <code-review | trace-validate | definition-of-done> no quedó en aprobado.
  Veredicto: <❌ Rechazado (code-review) | ⚠️ Incompleto (code-review) | ❌ Rechazado (trace-validate) | DoD incumplida>

<reporte literal del skill, o lista de ítems de la DoD incumplidos>

Acciones para reintentar:
  <pasos concretos que debe tomar el usuario para dejar la puerta en aprobado>
```
Si la corrección está al alcance de este skill, ofrecer aplicarla antes de pedir acción manual (ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad)).

---

## Manejo de fallos en las puertas de calidad

Cuando una de las tres puertas del Paso 4 no queda en aprobado, **detener** el flujo (sin push ni PR) y, en este orden:

1. **Informar** al usuario qué puerta falló, con su veredicto/motivo y el reporte literal del skill (o la lista de ítems de DoD incumplidos).
2. **Indicar las acciones concretas** que debe tomar para dejar la puerta en aprobado y poder reintentar la creación del PR (p. ej. «corregir los tests fallidos de `X`», «cubrir el criterio `AC-003` con un test», «cumplir el ítem "changelog actualizado" de la DoD»).
3. **Si la corrección está al alcance de este skill**, no aplicarla en automático: **preguntar al usuario** si desea que se aplique. Solo con su autorización explícita, aplicar la corrección mínima y **reintentar** la puerta que falló; si esa puerta vuelve a quedar aprobada, continuar con el resto del flujo (re-ejecutando las puertas posteriores que correspondan). Si el usuario no autoriza, terminar dejando las acciones indicadas.

Notas:
- Las correcciones dentro de `code-review` y `trace-validate` se gobiernan por el flujo propio de cada skill (que también exige autorización del usuario). No re-implementar esa lógica aquí.
- Tras cualquier corrección autorizada, **re-ejecutar** la puerta afectada antes de avanzar; no asumir que quedó aprobada.

---

## Ejemplos

**Ejemplo 1 — Camino feliz (GitLab self-managed)**
Usuario: «Crea el PR de esta rama.»
Skill: pre-flight OK (rama `feature/US-042-auth-refresh-token`). Detecta GitLab (`ns.bayteq.com:3311`). Pregunta destino → `develop`. Puertas: `code-review` sobre `origin/develop..HEAD` → `✅ Aprobado`; resuelve `US-042`, `trace-validate` → `✅ Aprobado`; existe `docs/policies/definition-of-done.md` → todos los ítems cumplidos. Push. Auto-genera título `[US-042] feat(auth): refresh token con expiración 15min`. Ejecuta `glab mr create`. Devuelve URL.

**Ejemplo 2 — code-review bloquea**
`code-review` devuelve `❌ Rechazado` (tests fallidos + eslint errors). El skill no crea el PR, no hace push, muestra el reporte, lista las acciones para reintentar y —al estar a su alcance— pregunta si aplica la corrección. Si el usuario no autoriza, termina.

**Ejemplo 3 — trace-validate bloquea**
`code-review` → `✅ Aprobado`, pero `trace-validate` de `US-042` devuelve `RECHAZADO` (criterio `AC-003` sin test). El skill no crea el PR; informa que falta cubrir `AC-003` y pregunta si desea que se intente la corrección (delegando al flujo correspondiente). Sin autorización, termina con las acciones indicadas.

**Ejemplo 4 — Definition of Done incumplida**
Ambos skills en aprobado, pero `docs/policies/definition-of-done.md` exige «CHANGELOG.md actualizado» y el diff no lo toca. El skill detiene la creación, lista ese ítem como incumplido e indica la acción; si el usuario autoriza y la corrección está a su alcance, la aplica y reintenta la puerta.

**Ejemplo 5 — Sin Definition of Done**
No existe `docs/policies/definition-of-done.md`. Esa puerta se omite; el PR se crea si `code-review` y `trace-validate` quedaron en aprobado.

**Ejemplo 6 — Azure Repos**
`origin` apunta a `https://dev.azure.com/<org>/<proyecto>/_git/<repo>`. Detecta Azure Repos, verifica `az repos`, pregunta destino, ejecuta las puertas, push, crea PR con `az repos pr create`.

**Ejemplo 7 — Rama protegida**
Usuario en `main`: «crea un PR a develop.» Parar en pre-flight: «Estás en `main`. Cambia a una rama de feature antes de crear el PR.»

**Ejemplo 7b — Rama sin prefijo de implementación**
Usuario en `reportes-2026` (no está en la lista de protegidas, pero tampoco empieza por `feature/`, `fix/`, `chore/` ni `refactor/`): «crea el PR.» Parar en pre-flight: «La rama `reportes-2026` no es una rama de implementación reconocida (`feature/`, `fix/`, `chore/`, `refactor/`). Renombra o cambia de rama antes de crear el PR.»

**Ejemplo 8 — Working tree sucio**
`git status --porcelain` devuelve dos archivos modificados sin commitear en `feature/US-042-...`. El skill no pregunta si debe commitear: invoca automáticamente el flujo de `git-commit` sobre esos archivos (que muestra su propia propuesta de commit y detecta secretos), y tras completarse el commit continúa con el resto del pre-flight y el flujo normal hasta crear el PR.

**Ejemplo 9 — PR ya existente**
La rama ya tiene un PR/MR abierto hacia `develop`. Devolver la URL existente con nota «Ya existe un PR para esta combinación». No crear uno nuevo.

---

## Anti-patterns

- Preguntar la rama origen (siempre es la actual) o asumir la destino.
- Preguntar la plataforma (se detecta del remoto).
- Preguntar si correr `code-review` o `trace-validate`, u ofrecer saltarlos: son obligatorios.
- Pedir confirmación de título o descripción (flujo no interactivo).
- Crear el PR con `code-review` en `❌ Rechazado`/`⚠️ Incompleto`, con `trace-validate` en `RECHAZADO`, o con la Definition of Done incumplida.
- Saltarse `trace-validate` por no encontrar el trabajo (US/WI) en lugar de preguntarlo al usuario.
- Tratar la ausencia de `docs/policies/definition-of-done.md` como un fallo: si no existe, esa puerta simplemente se omite.
- Inventar el cumplimiento de un ítem de la DoD que no se puede determinar desde el repo o el diff.
- Aplicar una corrección sin autorización explícita del usuario, o no re-ejecutar la puerta tras corregir.
- Ejecutar `git add`/`git commit -am` manualmente en lugar de invocar el flujo del skill `git-commit` (se pierde su detección de secretos y su confirmación de mensaje).
- Detener el pre-flight preguntándole al usuario si desea commitear los cambios pendientes, en lugar de invocar `git-commit` automáticamente.
- Crear el PR desde una rama sin prefijo de implementación reconocido (`feature/`, `fix/`, `chore/`, `refactor/`), o saltarse esa validación además de la lista de ramas protegidas.
- Usar `git push --force` o `--force-with-lease`.
- Asignar reviewers, labels o milestones por iniciativa propia.
- Re-implementar la lógica de `code-review` o `trace-validate` en lugar de invocar el flujo existente.
- Referenciar `.agents/MEMORY.md` directamente para el idioma (usar el contexto de la sesión).
- Crear un segundo PR cuando ya existe uno para `<rama-actual> → <destino>`.