---
name: create-pr
description: Crear Pull Request (PR) o Merge Request (MR) desde la rama actual hacia una rama destino preguntada al usuario, con opción bloqueante de ejecutar /code-review antes. Funciona sobre cualquier repositorio git con remoto: auto-detecta la plataforma (GitHub, GitLab, Bitbucket, Gitea, Azure Repos, etc.) desde el remoto y usa el CLI disponible. Auto-genera título y descripción a partir de los commits y crea el PR en una sola pasada. Usar siempre que el usuario pida crear, abrir, generar, levantar o subir un PR, MR, pull request o merge request, incluso si solo dice "crea el PR" o "súbelo a develop" sin nombrar la plataforma.
license: MIT
---

# Crear Pull Request (PR / MR)

## Purpose

Crear un Pull Request o Merge Request desde la **rama actual** hacia una **rama destino preguntada al usuario**, sobre **cualquier repositorio git** con remoto configurado, con opción de ejecutar un **code-review previo bloqueante**.

El skill **auto-detecta** la plataforma a partir del remoto `origin` (GitHub, GitLab, Bitbucket, Gitea, Azure Repos…), elige el CLI adecuado, **auto-genera** título y descripción a partir de los commits de la rama (sin pedir confirmación) y **bloquea** la creación del PR si el code-review previo reporta hallazgos.

Usar cuando el usuario pida **crear, abrir, generar, levantar o subir** un PR, MR, pull request o merge request, aunque solo diga "crea el PR" o "súbelo a develop" sin nombrar plataforma.

---

## Scope

**Incluye:**

- Detección automática de plataforma a partir de `git remote get-url origin`: GitHub, GitLab (SaaS o self-managed), Bitbucket Cloud, Bitbucket Server, Gitea, Azure Repos y otros proveedores con CLI dedicado.
- Selección del CLI correspondiente según la plataforma detectada (`gh`, `glab`, `tea`, `az repos`, etc.).
- Pre-flight de estado: estar en repo git, rama actual ≠ rama protegida por defecto, working tree limpio, commits propios pendientes respecto a `origin/<destino>`.
- Pregunta única al usuario para la **rama destino**.
- Pregunta única al usuario para ejecutar **/code-review** previo (sí/no).
- Invocación del flujo `/code-review` sobre el diff `origin/<destino>..HEAD` cuando el usuario lo solicita, y **bloqueo total** de la creación del PR si reporta hallazgos.
- `git push -u origin <rama-actual>` si la rama no existe en remoto o tiene commits no publicados.
- Auto-generación **no interactiva** de título y descripción del PR a partir de los commits y del nombre de la rama.
- Lectura de `.agents/MEMORY.md` en la raíz del repo (si existe) para detectar **preferencia de idioma** del proyecto y aplicarla al título y descripción.
- Invocación del CLI correspondiente para crear el PR/MR y devolución de la URL del PR creado.

**No incluye:**

- Modificar código, hacer merges, rebases ni resolver conflictos.
- Crear, renombrar ni cambiar de rama (la rama origen es **siempre** la actual; cambiar de rama corresponde al usuario).
- Asignar reviewers, labels, milestones, projects ni configurar reglas del repo.
- Crear el PR si `/code-review` reportó hallazgos (no hay flujo "crear como draft" ni "ignorar y continuar").
- Editar PRs existentes (este skill solo **crea**).
- Re-implementar la lógica de `/code-review`: el skill **invoca** el flujo existente, no lo duplica.

---

## Inputs

**Obligatorios:**

- **Working directory:** repositorio git con `origin` configurado y rama actual con commits propios pendientes hacia la rama destino.
- **Rama destino:** se pregunta al usuario (ver `Rules`).

**Opcionales:**

- **Decisión de code-review previo** (sí/no): se pregunta al usuario en cada ejecución, salvo que ya lo haya indicado en el mensaje inicial.
- **Override de título o descripción**: si el usuario los pasa explícitamente en el mismo mensaje, se respetan y se omite la auto-generación de esa parte.

---

## Outputs

Tras éxito:

```
✓ PR creado en <plataforma>
  Origen:  <rama-actual>
  Destino: <rama-destino>
  Título:  <título-generado>
  URL:     <url>
```

Tras bloqueo por code-review:

```
✗ PR NO creado: /code-review reportó hallazgos.

<reporte literal de /code-review>

Corrige los hallazgos y vuelve a ejecutar el skill.
```

Tras parada en pre-flight (rama protegida, working tree sucio, plataforma desconocida, etc.): mensaje breve indicando la causa y la acción que debe tomar el usuario, **sin** crear PR ni hacer push.

---

## Rules

- **Origen = rama actual**, sin excepción. No preguntar. Si la rama actual ∈ {`main`, `master`, `develop`, `trunk`}, **parar** y avisar.
- **Destino = pregunta al usuario** siempre. No asumir `main` ni leerlo de configuración del repo.
- **Plataforma se auto-detecta** desde `origin`. No preguntar. Heurística por host de la URL del remoto:
  - `github.com` o subdominios de GitHub Enterprise → GitHub, CLI = `gh`.
  - `gitlab.com` o host self-managed cuyo path/segmento típico sea de GitLab (p. ej. `ns.bayteq.com`) → GitLab, CLI = `glab`.
  - `bitbucket.org` → Bitbucket Cloud (sin CLI oficial estable: usar API REST con curl + token, o el CLI que el usuario tenga instalado, p. ej. `bb`).
  - Host con segmento `/scm/` o que responda como Bitbucket Server → Bitbucket Server (API REST con curl + token).
  - `dev.azure.com` o `*.visualstudio.com` → Azure Repos, CLI = `az repos`.
  - Hosts con marcadores típicos de Gitea/Forgejo o configurados explícitamente → Gitea, CLI = `tea`.
  - **Cualquier otro proveedor**: si existe un CLI conocido en el sistema, intentar con él; si no, **parar** y avisar indicando que no se reconoce la plataforma. Nunca adivinar el endpoint.
- **Working tree limpio antes de crear el PR**: si `git status --porcelain` devuelve cambios, **parar** y avisar; **no** ejecutar `git add` ni `git commit` automáticos.
- **Push si aplica, sin preguntar**: si la rama actual no existe en `origin` o tiene commits no publicados, ejecutar `git push -u origin <rama-actual>` antes de crear el PR. **Nunca** `--force` ni `--force-with-lease`.
- **Pregunta única de code-review**: una sola interacción sí/no antes de crear el PR. Si el usuario ya respondió en el mensaje inicial, no volver a preguntar.
- **Code-review bloqueante**: si el usuario aceptó code-review y `/code-review` reportó **cualquier** hallazgo, **no crear el PR**. Mostrar el reporte y terminar. Es un flujo de un solo intento; el usuario corrige y vuelve a invocar el skill.
- **Título y descripción no interactivos**: generar sin pedir confirmación. Excepción: si el usuario los pasó explícitamente en el mismo mensaje, respetarlos.
- **Idioma de título y descripción**: si existe `.agents/MEMORY.md` en la raíz del repo y declara una preferencia de idioma (p. ej. `language: es`, `idioma: español`, `Project language: English`), **respetarla** para el título y la descripción. Si no existe el archivo o no hay declaración explícita, usar el idioma de los commits. El override del usuario en el mensaje (título/descripción literales) tiene prioridad sobre ambos.
- **No reabrir, no editar, no forzar**: si ya existe un PR para `<rama-actual> → <destino>`, devolver su URL y **no** intentar recrearlo.

---

## Steps

1. **Pre-flight obligatorio antes de cualquier acción:**
   - `git rev-parse --is-inside-work-tree` para confirmar repo git.
   - `git rev-parse --abbrev-ref HEAD` → rama actual.
   - Si la rama actual ∈ {`main`, `master`, `develop`, `trunk`}, **parar** y avisar.
   - `git status --porcelain` debe estar vacío; si no, **parar** y avisar.

2. **Detectar plataforma:**
   - `git remote get-url origin` → URL del remoto. Extraer el host.
   - Aplicar la heurística por host descrita en `Rules` para resolver `<plataforma, CLI>`:
     - `github.com` o GitHub Enterprise → `gh`.
     - `gitlab.com` o host GitLab self-managed → `glab`.
     - `bitbucket.org` → Bitbucket Cloud (REST + curl, o CLI instalado).
     - Host Bitbucket Server (segmento `/scm/`) → Bitbucket Server (REST + curl).
     - `dev.azure.com` / `*.visualstudio.com` → `az repos`.
     - Marcadores de Gitea/Forgejo → `tea`.
     - Cualquier otro: probar CLI conocido en el sistema; si no hay coincidencia, **parar** y avisar.
   - Verificar que el CLI elegido está instalado (`<cli> --version`); si falta, **parar** y avisar con el nombre del CLI esperado.

3. **Preguntar rama destino** al usuario (pregunta única). Validar:
   - Existe en `origin` (`git ls-remote --heads origin <destino>` no vacío); si no, **parar** y avisar.
   - Destino ≠ rama actual; si coincide, **parar** y avisar.

4. **Preguntar code-review previo** al usuario (sí/no). Si el usuario ya lo indicó en el mensaje original (p. ej. "crea el PR a develop y pásalo por code-review primero"), omitir esta pregunta.

5. **Si el usuario aceptó code-review:**
   - Invocar el flujo de `/code-review` sobre el diff `origin/<destino>..HEAD`.
   - Capturar el reporte completo.
   - Si reporta **cualquier** hallazgo (issue, blocker, warning, comentario de cambio requerido), aplicar el formato de bloqueo definido en `Outputs` y **terminar**. No ejecutar los pasos siguientes.

6. **Push de la rama actual** si aplica:
   - Si `git ls-remote --heads origin <rama-actual>` está vacío, **o**
   - si `git rev-list origin/<rama-actual>..HEAD` no está vacío,
   - ejecutar `git push -u origin <rama-actual>`.

7. **Resolver idioma y auto-generar título y descripción** (sin pedir confirmación):
   - **Idioma:** leer `.agents/MEMORY.md` desde la raíz del repo (`git rev-parse --show-toplevel`/.agents/MEMORY.md). Si existe y contiene una directiva clara de idioma (claves como `language`, `idioma`, `Project language`, o secciones equivalentes en prosa), usar ese idioma para el título y la descripción. Si no existe el archivo o no hay declaración, usar el idioma predominante de los commits del rango `origin/<destino>..HEAD`. Si el usuario pasó título o descripción explícitos, respetar el suyo y omitir esta resolución para esa parte.
   - **Título:** si la rama tiene un único commit en el rango `origin/<destino>..HEAD`, usar su subject (`git log -1 --pretty=%s`). Si tiene varios, preferir el subject del commit más antiguo del rango. Si la rama sigue patrón `<prefix>/<TICKET>-<descripcion>` (p. ej. `feature/US-042-auth-refresh`) o `US-XXX-...`, anteponer `[<TICKET>]` al título. Si el idioma resuelto no coincide con el del subject elegido, **traducir** el título al idioma objetivo manteniendo el prefijo de ticket intacto.
   - **Descripción:** incluir
     - Lista de commits: `git log origin/<destino>..HEAD --pretty="- %s"` (los subjects se mantienen literales, sin traducir; el resto del cuerpo se redacta en el idioma resuelto).
     - Resumen de cambios: `git diff --stat origin/<destino>..HEAD`.
     - Referencia a issue/ticket si el nombre de la rama lo contiene (patrón `US-XXX`, `TK-XXX`, `JIRA-XXX`, `#NNN`).

8. **Crear el PR/MR** con el CLI resuelto en el paso 2:
   - **GitHub** (`gh`): `gh pr create --base <destino> --head <rama-actual> --title "<título>" --body "<descripción>"`.
   - **GitLab** (`glab`): `glab mr create --target-branch <destino> --source-branch <rama-actual> --title "<título>" --description "<descripción>" --yes`.
   - **Bitbucket Cloud** (REST): `curl -u <user>:<app-password> -X POST https://api.bitbucket.org/2.0/repositories/<workspace>/<repo>/pullrequests` con payload JSON `{title, description, source.branch.name, destination.branch.name}`.
   - **Bitbucket Server** (REST): `POST` a `/rest/api/1.0/projects/<key>/repos/<slug>/pull-requests` con payload equivalente, usando token o credenciales del usuario.
   - **Azure Repos** (`az repos`): `az repos pr create --source-branch <rama-actual> --target-branch <destino> --title "<título>" --description "<descripción>"`.
   - **Gitea / Forgejo** (`tea`): `tea pr create --base <destino> --head <rama-actual> --title "<título>" --description "<descripción>"`.
   - Si el CLI/API indica que ya existe un PR/MR para la combinación, capturar su URL listando los PR de la rama (`gh pr list --head <rama>`, `glab mr list --source-branch <rama>`, `az repos pr list --source-branch <rama>`, equivalente para Bitbucket/Gitea) y devolverla en lugar de fallar.
   - Si la plataforma requiere credenciales (token, app password) y no están configuradas, **parar** y avisar; no pedirlas por chat ni almacenarlas.

9. **Reportar** al usuario con el formato definido en `Outputs`.

---

## Examples

**Ejemplo 1 — Flujo feliz con code-review:**

Usuario: «Crea el PR de esta rama, pásalo por code-review primero.»

Skill: pre-flight OK (rama `US-042-auth-refresh-token`, working tree limpio). Auto-detecta GitLab (`origin` apunta a `ns.bayteq.com:3311`). Pregunta destino → usuario responde `develop`. Ejecuta `/code-review` sobre `origin/develop..HEAD` → sin hallazgos. Hace `git push -u origin US-042-auth-refresh-token`. Auto-genera título `[US-042] feat(auth): refresh token con expiración 15min` y descripción con commits + diff stat. Ejecuta `glab mr create` y devuelve la URL.

**Ejemplo 2 — Code-review bloquea:**

Usuario: «Sube el PR a main, con code-review.»

Skill ejecuta `/code-review`, que reporta 2 hallazgos (función sin tests, log con credencial). El skill **no** crea el PR, muestra el reporte literal y termina con «Corrige los hallazgos y vuelve a ejecutar el skill». **No** hace push.

**Ejemplo 3 — Sin code-review:**

Usuario: «Crea el PR a develop, sin code review.»

Skill omite el paso 5. Pre-flight OK, push si aplica, auto-genera título desde el primer commit del rango, descripción desde los commits + diff stat, ejecuta el CLI correspondiente y devuelve URL.

**Ejemplo 4 — Plataforma distinta a GitHub/GitLab:**

`origin` apunta a `https://dev.azure.com/<org>/<proyecto>/_git/<repo>`. El skill detecta Azure Repos, verifica que `az repos` está disponible, pregunta destino (`main`), no se pide code-review, hace push si aplica, auto-genera título y descripción, y ejecuta `az repos pr create`. Devuelve la URL del PR.

**Ejemplo 5 — Rama protegida:**

Usuario está en `main` y dice «crea un PR a develop». El skill **para** en el pre-flight: «Estás en `main`. Cambia a una rama de feature antes de crear el PR.»

**Ejemplo 6 — PR ya existente:**

La rama ya tiene un PR/MR abierto hacia `develop`. El skill no crea uno nuevo: devuelve la URL del existente con nota «Ya existe un PR para esta combinación».

**Ejemplo 7 — Preferencia de idioma desde `.agents/MEMORY.md`:**

El repo tiene `.agents/MEMORY.md` con la línea `language: en`. Los commits están en español (`feat(auth): agrega refresh token`). El skill detecta la preferencia y genera el título traducido al inglés (`[US-042] feat(auth): add refresh token`) y la descripción en inglés, pero conserva los subjects de commits literales en la lista («- feat(auth): agrega refresh token»). Si no existiera `.agents/MEMORY.md`, el título y la descripción quedarían en español.

---

## Anti-patterns

- **Preguntar la rama origen** o intentar adivinarla: la rama origen es **siempre** la actual.
- **Asumir la rama destino** (p. ej. `main` por defecto): siempre preguntar.
- **Preguntar plataforma**: se detecta del remoto.
- **Pedir confirmación de título o descripción**: el flujo es no interactivo en esa parte.
- **Crear el PR cuando `/code-review` reportó hallazgos**, aunque parezcan menores: el flujo es bloqueante, no consultivo.
- **Re-ejecutar `/code-review`** sobre el mismo diff dentro del mismo turno tras un bloqueo: el skill termina, el usuario corrige y reinvoca.
- **Hacer `git add`, `git commit -am` o cualquier mutación de historia** si hay cambios sin commitear o conflictos. Parar y avisar.
- **`git push --force` o `--force-with-lease`**. Nunca.
- **Asignar reviewers, labels, milestones** por iniciativa propia.
- **Re-implementar la lógica de `/code-review`** dentro del skill en lugar de invocar el flujo existente.
- **Crear un segundo PR** cuando ya existe uno para `<rama-actual> → <destino>`.

---

## Notes

### Sobre `/code-review`

Este skill **no implementa** code-review: invoca el flujo existente del usuario (slash command `/code-review` o el equivalente instalado, p. ej. `glab-code-review`). El alcance del review es el diff `origin/<destino>..HEAD`. Si el slash command no existe en el entorno, **parar** y avisar al usuario; no sustituirlo por un análisis ad-hoc.

### Detección de plataforma

La heurística por host de `origin` cubre los proveedores comunes: GitHub (público y Enterprise), GitLab (SaaS y self-managed, incluido `ns.bayteq.com`), Bitbucket Cloud y Server, Azure Repos y Gitea/Forgejo. Para hosts no reconocidos, el skill intenta con el CLI conocido que esté instalado en el sistema; si nada encaja, **para** y avisa en lugar de adivinar el endpoint o construir URLs a ciegas.

Para cualquier plataforma, las **credenciales son responsabilidad del entorno del usuario** (configuración previa del CLI, variables de entorno como `GITHUB_TOKEN`, `GITLAB_TOKEN`, `AZURE_DEVOPS_EXT_PAT`, archivos `~/.netrc`, etc.). El skill no las pide ni las almacena.

### Sobre el título auto-generado

Convenciones reconocidas para enriquecer el título:

- `feature/<TICKET>-<descripcion>` o `fix/<TICKET>-<descripcion>` → título prefijado con `[TICKET]`.
- `US-XXX-<descripcion>` o `TK-XXX-<descripcion>` → título prefijado con `[US-XXX]` / `[TK-XXX]`.
- Sin patrón reconocible → subject del primer commit del rango.

### Sobre el push

El skill nunca reescribe historia. Si el push falla por divergencia con remoto, **parar** y avisar; corresponde al usuario decidir cómo resolver (rebase, merge, descartar).

### Sobre PRs existentes

`gh pr create`, `glab mr create`, `az repos pr create` y `tea pr create` suelen detectar PR existentes por sí solos. Si una versión del CLI no lo hace, una verificación previa con el comando `list` correspondiente (`gh pr list --head <rama>`, `glab mr list --source-branch <rama>`, `az repos pr list --source-branch <rama>`, etc.) evita el error y permite devolver la URL existente. Para Bitbucket vía REST, consultar el endpoint `pullrequests` con filtro por rama origen.

### Idioma del PR

Orden de precedencia para decidir el idioma del título y la descripción:

1. **Título / descripción explícitos del usuario** en el mensaje inicial → se respetan literalmente.
2. **`.agents/MEMORY.md` en la raíz del repo** con preferencia declarada (`language`, `idioma`, `Project language`, etc.) → se usa ese idioma.
3. **Idioma predominante de los commits** del rango `origin/<destino>..HEAD` → fallback por defecto.

Cuando el idioma resuelto fuerza a traducir el título auto-generado, el prefijo de ticket (`[US-042]`, `[TK-007]`, etc.) se mantiene intacto. Los subjects de commits en la lista de la descripción **no** se traducen: se citan literales para preservar la trazabilidad con la historia git.