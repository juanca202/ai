---
name: pr-create
description: >-
  Crear Pull Request (PR) o Merge Request (MR) desde la rama actual hacia una rama destino preguntada al usuario, con puertas de calidad obligatorias y bloqueantes antes de crearlo: ejecuta code-review y trace-validate (ambos deben dar veredicto apto) y, si existe docs/policies/definition-of-done.md, verifica el código contra esa Definition of Done. Funciona sobre cualquier repositorio git con remoto: auto-detecta la plataforma (GitHub, GitLab, Bitbucket, Gitea, Azure Repos, etc.) desde el remoto y usa el CLI disponible. Auto-genera título y descripción a partir de los commits y crea el PR en una sola pasada. Usar siempre que el usuario pida crear, abrir, generar, levantar o subir un PR, MR, pull request o merge request, incluso si solo dice "crea el PR" o "súbelo a develop" sin nombrar la plataforma.
license: MIT
---

# Skill: Crear Pull Request (PR / MR)

Crear un PR o MR desde la **rama actual** hacia una **rama destino preguntada al usuario**, sobre cualquier repo git con remoto configurado.

> **Origen = rama actual**, sin excepción. Si está en `main`, `master`, `develop` o `trunk`: parar y avisar.
>
> **Plataforma se auto-detecta** del remoto `origin`. No preguntar.
>
> **Puertas de calidad obligatorias y bloqueantes:** antes de crear el PR se ejecutan **siempre** `code-review` y `trace-validate`, y —si existe— se verifica la **Definition of Done** (`docs/policies/definition-of-done.md`). Las tres deben quedar en **apto**; si alguna no lo está, **no** se crea el PR. No hay flujo "crear como draft" ni "ignorar y continuar".
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
3. Si la rama actual ∈ {`main`, `master`, `develop`, `trunk`}: **parar** y avisar.
4. `git status --porcelain` — debe estar vacío; si no, **parar** y avisar. No ejecutar `git add` ni `git commit` automáticos.

### Paso 2 — Detectar plataforma y CLI

Aplicar la tabla de detección. Si ya existe un PR para `<rama-actual> → <destino>`, capturar su URL y devolvérsela al usuario sin crear uno nuevo.

### Paso 3 — Preguntar destino

- **Rama destino** (pregunta única): validar que existe en `origin` (`git ls-remote --heads origin <destino>`) y que no coincide con la rama actual.

`code-review` y `trace-validate` **no se preguntan**: son obligatorios (ver Paso 4). No hay opción de saltarlos.

### Paso 4 — Puertas de calidad (obligatorias, bloqueantes)

Antes de cualquier push o creación de PR se ejecutan **las tres** puertas en este orden. Una puerta que no quede en **apto** detiene el flujo: **no** se hace push ni se crea el PR. Ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad) para qué hacer ante un fallo.

**4.1 — `code-review` (siempre).** Invocar el flujo de `code-review` sobre el diff `origin/<destino>..HEAD`.
- Apto = veredicto **`✅ Apto`** → continuar (aunque haya warnings o recomendaciones informativas).
- No apto = **`❌ No apto`** o **`⚠️ Incompleto`** → detener.

**4.2 — `trace-validate` (siempre).** Resolver el **trabajo** a validar (`US-XXX`, `WI-XXX` o `MG-XXX`) del patrón de la rama, del prefijo de los commits, o de la ruta de trabajo. `trace-validate` traza los **criterios de aceptacion del tipo**: `AC-XXX` (US), los Criterios de aceptación del WI (`AC-N`), o los casos Golden Master `GM-XXX` (MG). Si no se puede determinar el trabajo, preguntar al usuario cuál validar; si no lo provee, la puerta **no** puede quedar apta → detener. Invocar `trace-validate` sobre ese trabajo.
- Apto = **`✅ Aprobado`** → continuar. **`⚠️ Aprobado con observaciones`** también se considera apto, pero se **muestran las observaciones al usuario** antes de seguir.
- No apto = **`❌ Rechazado`** → detener.

**4.3 — Definition of Done (solo si existe el archivo).** Comprobar si existe `docs/policies/definition-of-done.md` en la raíz del repo (`test -f docs/policies/definition-of-done.md`).
- Si **no** existe → omitir esta puerta (no afecta el resultado).
- Si **existe** → leerla y verificar el código/cambio del rango `origin/<destino>..HEAD` contra cada política/ítem de esa Definition of Done. **Formato esperado de `docs/policies/definition-of-done.md`:** un documento de política con ítems/checklist verificables (cada ítem una condición concreta de cierre). El skill solo evalúa automáticamente los ítems comprobables desde el repo o el diff; para el resto, pregunta.
  - **Ítems comprobables desde el repo/diff** → evaluarlos directamente: cumplido / incumplido.
  - **Ítems no comprobables automáticamente** → **presentarlos al usuario y preguntarle** si se cumplen (no inventar su cumplimiento). Si el usuario **confirma** que se cumplen → cuentan como cumplidos. Si **no los confirma** o los marca incumplidos → cuentan como incumplidos.
  - Apto = todos los ítems aplicables se cumplen (los comprobables verificados + los no comprobables confirmados por el usuario) → continuar.
  - No apto = al menos un ítem incumplido, o algún ítem no comprobable que el usuario no confirma → la puerta **no** queda apta → detener, listando qué ítem(s) de la DoD no se cumplen o quedan sin confirmar.

Solo si **las tres** puertas quedan en apto se avanza al Paso 5.

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
✗ PR NO creado: la puerta <code-review | trace-validate | definition-of-done> no quedó en apto.
  Veredicto: <❌ No apto | ⚠️ Incompleto | ❌ Rechazado | DoD incumplida>

<reporte literal del skill, o lista de ítems de la DoD incumplidos>

Acciones para reintentar:
  <pasos concretos que debe tomar el usuario para dejar la puerta en apto>
```
Si la corrección está al alcance de este skill, ofrecer aplicarla antes de pedir acción manual (ver [Manejo de fallos en las puertas](#manejo-de-fallos-en-las-puertas-de-calidad)).

---

## Manejo de fallos en las puertas de calidad

Cuando una de las tres puertas del Paso 4 no queda en apto, **detener** el flujo (sin push ni PR) y, en este orden:

1. **Informar** al usuario qué puerta falló, con su veredicto/motivo y el reporte literal del skill (o la lista de ítems de DoD incumplidos).
2. **Indicar las acciones concretas** que debe tomar para dejar la puerta en apto y poder reintentar la creación del PR (p. ej. «corregir los tests fallidos de `X`», «cubrir el escenario `SC-03` con un test», «cumplir el ítem "changelog actualizado" de la DoD»).
3. **Si la corrección está al alcance de este skill**, no aplicarla en automático: **preguntar al usuario** si desea que se aplique. Solo con su autorización explícita, aplicar la corrección mínima y **reintentar** la puerta que falló; si esa puerta vuelve a quedar apta, continuar con el resto del flujo (re-ejecutando las puertas posteriores que correspondan). Si el usuario no autoriza, terminar dejando las acciones indicadas.

Notas:
- Las correcciones dentro de `code-review` y `trace-validate` se gobiernan por el flujo propio de cada skill (que también exige autorización del usuario). No re-implementar esa lógica aquí.
- Tras cualquier corrección autorizada, **re-ejecutar** la puerta afectada antes de avanzar; no asumir que quedó apta.

---

## Ejemplos

**Ejemplo 1 — Camino feliz (GitLab self-managed)**
Usuario: «Crea el PR de esta rama.»
Skill: pre-flight OK (rama `feature/US-042-auth-refresh-token`). Detecta GitLab (`ns.bayteq.com:3311`). Pregunta destino → `develop`. Puertas: `code-review` sobre `origin/develop..HEAD` → `✅ Apto`; resuelve `US-042`, `trace-validate` → `✅ Aprobado`; existe `docs/policies/definition-of-done.md` → todos los ítems cumplidos. Push. Auto-genera título `[US-042] feat(auth): refresh token con expiración 15min`. Ejecuta `glab mr create`. Devuelve URL.

**Ejemplo 2 — code-review bloquea**
`code-review` devuelve `❌ No apto` (tests fallidos + eslint errors). El skill no crea el PR, no hace push, muestra el reporte, lista las acciones para reintentar y —al estar a su alcance— pregunta si aplica la corrección. Si el usuario no autoriza, termina.

**Ejemplo 3 — trace-validate bloquea**
`code-review` → `✅ Apto`, pero `trace-validate` de `US-042` devuelve `RECHAZADO` (escenario `SC-03` sin test). El skill no crea el PR; informa que falta cubrir `SC-03` y pregunta si desea que se intente la corrección (delegando al flujo correspondiente). Sin autorización, termina con las acciones indicadas.

**Ejemplo 4 — Definition of Done incumplida**
Ambos skills en apto, pero `docs/policies/definition-of-done.md` exige «CHANGELOG.md actualizado» y el diff no lo toca. El skill detiene la creación, lista ese ítem como incumplido e indica la acción; si el usuario autoriza y la corrección está a su alcance, la aplica y reintenta la puerta.

**Ejemplo 5 — Sin Definition of Done**
No existe `docs/policies/definition-of-done.md`. Esa puerta se omite; el PR se crea si `code-review` y `trace-validate` quedaron en apto.

**Ejemplo 6 — Azure Repos**
`origin` apunta a `https://dev.azure.com/<org>/<proyecto>/_git/<repo>`. Detecta Azure Repos, verifica `az repos`, pregunta destino, ejecuta las puertas, push, crea PR con `az repos pr create`.

**Ejemplo 7 — Rama protegida**
Usuario en `main`: «crea un PR a develop.» Parar en pre-flight: «Estás en `main`. Cambia a una rama de feature antes de crear el PR.»

**Ejemplo 8 — PR ya existente**
La rama ya tiene un PR/MR abierto hacia `develop`. Devolver la URL existente con nota «Ya existe un PR para esta combinación». No crear uno nuevo.

---

## Anti-patterns

- Preguntar la rama origen (siempre es la actual) o asumir la destino.
- Preguntar la plataforma (se detecta del remoto).
- Preguntar si correr `code-review` o `trace-validate`, u ofrecer saltarlos: son obligatorios.
- Pedir confirmación de título o descripción (flujo no interactivo).
- Crear el PR con `code-review` en `❌ No apto`/`⚠️ Incompleto`, con `trace-validate` en `RECHAZADO`, o con la Definition of Done incumplida.
- Saltarse `trace-validate` por no encontrar el trabajo (US/WI/MG) en lugar de preguntarlo al usuario.
- Tratar la ausencia de `docs/policies/definition-of-done.md` como un fallo: si no existe, esa puerta simplemente se omite.
- Inventar el cumplimiento de un ítem de la DoD que no se puede determinar desde el repo o el diff.
- Aplicar una corrección sin autorización explícita del usuario, o no re-ejecutar la puerta tras corregir.
- Hacer `git add`, `git commit -am` o cualquier mutación de historia si hay cambios sin commitear.
- Usar `git push --force` o `--force-with-lease`.
- Asignar reviewers, labels o milestones por iniciativa propia.
- Re-implementar la lógica de `code-review` o `trace-validate` en lugar de invocar el flujo existente.
- Referenciar `.agents/MEMORY.md` directamente para el idioma (usar el contexto de la sesión).
- Crear un segundo PR cuando ya existe uno para `<rama-actual> → <destino>`.