---
name: git-pr
description: >-
  Crear Pull Request (PR) o Merge Request (MR) desde la rama actual hacia una rama destino preguntada al usuario, con opción bloqueante de ejecutar /code-review antes. Funciona sobre cualquier repositorio git con remoto: auto-detecta la plataforma (GitHub, GitLab, Bitbucket, Gitea, Azure Repos, etc.) desde el remoto y usa el CLI disponible. Auto-genera título y descripción a partir de los commits y crea el PR en una sola pasada. Usar siempre que el usuario pida crear, abrir, generar, levantar o subir un PR, MR, pull request o merge request, incluso si solo dice "crea el PR" o "súbelo a develop" sin nombrar la plataforma.
license: MIT
---

# Skill: Crear Pull Request (PR / MR)

Crear un PR o MR desde la **rama actual** hacia una **rama destino preguntada al usuario**, sobre cualquier repo git con remoto configurado.

> **Origen = rama actual**, sin excepción. Si está en `main`, `master`, `develop` o `trunk`: parar y avisar.
>
> **Plataforma se auto-detecta** del remoto `origin`. No preguntar.
>
> **Code-review opcional pero bloqueante:** si el usuario lo acepta, veredicto `❌ No apto` o `⚠️ Incompleto` impide la creación del PR. No hay flujo "crear como draft" ni "ignorar y continuar".
>
> **No incluye:** modificar código, merges, rebases, resolver conflictos, asignar reviewers/labels/milestones, editar PRs existentes.

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

Orden de precedencia para título y descripción auto-generados:

1. Título/descripción explícitos del usuario en el mensaje → respetar literalmente.
2. `preferred language` en `.agents/MEMORY.md` (claves legacy como `language:` o `idioma:` como fallback).
3. Idioma del turno del usuario.
4. Idioma predominante de los commits del rango `origin/<destino>..HEAD`.

Cuando el idioma resuelto obliga a traducir el título, el prefijo de ticket (`[US-042]`, `[TK-007]`) se mantiene intacto. Los subjects de commits en la lista de la descripción **no** se traducen — se citan literales para preservar trazabilidad.

---

## Flujo

### Paso 1 — Pre-flight (obligatorio antes de cualquier acción)

1. `git rev-parse --is-inside-work-tree` — confirmar repo git.
2. `git rev-parse --abbrev-ref HEAD` — obtener rama actual.
3. Si la rama actual ∈ {`main`, `master`, `develop`, `trunk`}: **parar** y avisar.
4. `git status --porcelain` — debe estar vacío; si no, **parar** y avisar. No ejecutar `git add` ni `git commit` automáticos.

### Paso 2 — Detectar plataforma y CLI

Aplicar la tabla de detección. Si ya existe un PR para `<rama-actual> → <destino>`, capturar su URL y devolvérsela al usuario sin crear uno nuevo.

### Paso 3 — Preguntar destino y code-review

- **Rama destino** (pregunta única): validar que existe en `origin` (`git ls-remote --heads origin <destino>`) y que no coincide con la rama actual.
- **Code-review previo** (sí/no): si el usuario ya lo indicó en el mensaje inicial, omitir la pregunta.

### Paso 4 — Code-review (si fue solicitado)

Invocar el flujo de `code-review` sobre el diff `origin/<destino>..HEAD`. Si el veredicto es `❌ No apto` o `⚠️ Incompleto`: mostrar el reporte y **terminar** — no hacer push ni crear PR. Si es `✅ Apto`: continuar aunque haya warnings o recomendaciones informativas.

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

Bloqueo por code-review:
```
✗ PR NO creado: code-review devolvió veredicto <❌ No apto | ⚠️ Incompleto>.

<reporte literal de code-review>

Corrige los bloqueantes y vuelve a ejecutar el skill.
```

---

## Ejemplos

**Ejemplo 1 — Con code-review (GitLab self-managed)**
Usuario: «Crea el PR de esta rama, pásalo por code-review primero.»
Skill: pre-flight OK (rama `feature/US-042-auth-refresh-token`). Detecta GitLab (`ns.bayteq.com:3311`). Pregunta destino → `develop`. Ejecuta `code-review` sobre `origin/develop..HEAD` → `✅ Apto`. Push. Auto-genera título `[US-042] feat(auth): refresh token con expiración 15min`. Ejecuta `glab mr create`. Devuelve URL.

**Ejemplo 2 — Code-review bloquea**
`code-review` devuelve `❌ No apto` (tests fallidos + eslint errors). El skill no crea el PR, no hace push, muestra el reporte y termina.

**Ejemplo 3 — Sin code-review**
Usuario: «Crea el PR a develop, sin code review.» Omite el paso 4. Push si aplica, auto-genera título y descripción, ejecuta CLI. Devuelve URL.

**Ejemplo 4 — Azure Repos**
`origin` apunta a `https://dev.azure.com/<org>/<proyecto>/_git/<repo>`. Detecta Azure Repos, verifica `az repos`, pregunta destino, push, crea PR con `az repos pr create`.

**Ejemplo 5 — Rama protegida**
Usuario en `main`: «crea un PR a develop.» Parar en pre-flight: «Estás en `main`. Cambia a una rama de feature antes de crear el PR.»

**Ejemplo 6 — PR ya existente**
La rama ya tiene un PR/MR abierto hacia `develop`. Devolver la URL existente con nota «Ya existe un PR para esta combinación». No crear uno nuevo.

**Ejemplo 7 — Idioma desde MEMORY.md**
`.agents/MEMORY.md` tiene `preferred language: en`. Commits en español (`feat(auth): agrega refresh token`). Título traducido al inglés: `[US-042] feat(auth): add refresh token`. Subjects en la lista de descripción se mantienen literales.

---

## Anti-patterns

- Preguntar la rama origen (siempre es la actual) o asumir la destino.
- Preguntar la plataforma (se detecta del remoto).
- Pedir confirmación de título o descripción (flujo no interactivo).
- Crear el PR cuando `code-review` devolvió `❌ No apto` o `⚠️ Incompleto`.
- Re-ejecutar `code-review` sobre el mismo diff dentro del mismo turno tras un bloqueo.
- Hacer `git add`, `git commit -am` o cualquier mutación de historia si hay cambios sin commitear.
- Usar `git push --force` o `--force-with-lease`.
- Asignar reviewers, labels o milestones por iniciativa propia.
- Re-implementar la lógica de `code-review` en lugar de invocar el flujo existente.
- Crear un segundo PR cuando ya existe uno para `<rama-actual> → <destino>`.