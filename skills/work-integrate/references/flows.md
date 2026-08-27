# Flujos secundarios y checklist

Referencias del skill **work-integrate**. Aplican a los dos tipos de trabajo (`US-XXX`, `WI-XXX`).

---

## Flujo: Manejo de conflictos

Cuando `git merge` produce conflictos.

1. **Clasificar el conflicto antes de tocar nada.** Listar los archivos en conflicto y su tipo (`git status --porcelain`: `DU`/`UD` es `modify/delete`, `UU` es conflicto de contenido).
   - **Si los únicos archivos en conflicto son `quality-check.md` y/o `code-review.md` dentro de un `docs/audits/` —el de la raíz o el de un módulo en monorepo— y el tipo es `modify/delete`** → no es un conflicto de código: saltar al apartado «Conflicto esperado» de abajo y **continuar el merge**. No abortar.
   - **En cualquier otro caso** → seguir con el punto 2.
2. **Abortar** con `git merge --abort` para restaurar el repo al estado previo al merge. No intentar resolución automática ni usar `--strategy=ours` / `--strategy=theirs`.
3. **Reportar al usuario** la lista de archivos en conflicto y dejar claro que el repo quedó como estaba **en cuanto al merge**. Matiz obligado: el `git merge --abort` deshace el merge, **no** el commit del paso 11 —que ya llevaba los artefactos de las puertas y, si el usuario lo confirmó, el archivado del paso 10— porque ese commit vive en la rama del trabajo y es parte legítima de ella. No revertirlo ni deshacer lo que contenga: al reintentar el merge se integrará con el resto. Decirlo en el reporte para que el usuario no lo lea como un efecto colateral inesperado. Indicar que el siguiente paso (rebase, merge manual, decisión de alcance) está fuera del skill.
4. **Parar.** No reintentar; no encadenar otra acción git sin nueva instrucción del usuario.

### Conflicto esperado: `modify/delete` sobre los informes de las puertas

Si la rama ya se integró antes, la base tiene `docs/audits/quality-check.md` y `code-review.md` **borrados**
por aquel commit de merge; si después se volvieron a correr las puertas en la rama, ahora aparecen
**modificados** allí y git levanta un `modify/delete` sobre exactamente esos dos archivos. Es el desenlace que
el paso 13 buscaba de todos modos, así que se resuelve por el lado del borrado y el merge continúa:

`bash
git rm -q -f --ignore-unmatch ':(top,glob)**/docs/audits/quality-check.md' ':(top,glob)**/docs/audits/code-review.md'
test -z "$(git ls-files --cached -- ':(top,glob)**/docs/audits/quality-check.md' ':(top,glob)**/docs/audits/code-review.md')" \
  || { echo "los informes siguen en el índice"; exit 1; }
git commit -m "Merge <ID>: <nombre-corto>"
`

Es la misma secuencia del paso 13, guard incluido: la resolución del conflicto no es motivo para saltárselo.

Mencionarlo en el reporte final, sin pedir decisión al usuario. Si además hay **cualquier otro** archivo en
conflicto, o alguno de esos dos conflictúa por **contenido** en vez de `modify/delete`, no aplica esta salida:
volver al punto 2 y abortar.

---

## Flujo: Rama base ambigua

Cuando reflog y config no concluyen, o existen varios candidatos plausibles.

1. **Listar los candidatos** detectados (p. ej. `main`, `develop`, ramas de release con commits ancestros del HEAD actual).
2. **Preguntar al usuario** cuál es la rama base correcta. No proponer un default ni inferir por convención del proyecto sin confirmación.
3. **Esperar respuesta** antes de continuar al paso 6 del flujo estándar (`quality-check`, la primera puerta). Sin respuesta clara, no hay merge: la rama base se necesita tanto para acotar el diff de `code-review` como para el merge final.

---

## Checklist antes de mergear

**Información:**
- [ ] Rama actual detectada, tipo identificado y validada contra el patrón de su tipo
- [ ] Carpeta/documento del trabajo localizado según el tipo
- [ ] Rama base resuelta (reflog, config o confirmación del usuario)
- [ ] Idioma resuelto según la sección «Resolución de idioma» de `SKILL.md`

**Validación:**
- [ ] `git status --porcelain` sin salida (working tree limpio); si había cambios pendientes, se resolvieron invocando automáticamente `git-commit` (sin preguntar al usuario si convenía invocarlo — `git-commit` sí pudo pedir su propia confirmación antes de comitear)
- [ ] `progress.md` existe en la ubicación del tipo
- [ ] **Todas** las unidades del trabajo de la rama en estado `Done` (leídas del `progress.md` en la carpeta del trabajo)
- [ ] **`quality-check`** ejecutado con veredicto `APPROVED`
- [ ] **`code-review`** ejecutado con veredicto `APPROVED`
- [ ] **`trace-validate`** ejecutado (después de `quality-check`) con veredicto `APPROVED` (o `APPROVED_WITH_NOTES`)
- [ ] Sin commits sin commitear ni stash sin aplicar relevante al alcance

**Delta (paso 9 — antes de mover o commitear nada):**
- [ ] Delta `<base>..HEAD` > 0 verificado (si es 0, la rama ya está integrada: parar **sin archivar ni commitear**)

**Archivado (paso 10 — solo `US-XXX`/`WI-XXX`; no aplica en ninguna rama `test/`):**
- [ ] Decidido si el archivado **aplica**; si no (rama `test/`, carpeta ya archivada), saltado sin preguntar
- [ ] Si aplica: **confirmación pedida al usuario**, mostrando antes carpeta origen → destino y las investigaciones sueltas que se moverían

*Si el usuario dijo que **no**, o no había con quién confirmar:*
- [ ] Nada movido, flujo continuado con normalidad y motivo anotado para el reporte

*Solo si **confirmó**:*
- [ ] Destino en `docs/specs/archive/<user-stories|work-items>/` libre antes de mover
- [ ] Carpeta del trabajo movida con **`git mv`** (renombrado detectado, no borrado + alta)
- [ ] Investigaciones `RS-XXX` sueltas enlazadas: comprobadas contra `docs/specs/` excluyendo **`docs/specs/archive/` y la propia carpeta del RS** (sin esa segunda exclusión el `README.md` del RS se cuenta a sí mismo y nunca se archivaría ninguna), y archivadas **solo** las que quedaron sin referencias activas
- [ ] Enlaces relativos salientes y entrantes reparados tras el cambio de profundidad
- [ ] El `git mv` quedó stageado, **sin** commit propio (lo recoge el paso 11)

**Cierre del árbol:**
- [ ] **Working tree limpio de nuevo tras las puertas** (correcciones, artefactos de las puertas y —si hubo archivado— el renombrado, ya commiteados vía `git-commit`)

**Ejecución:**
- [ ] `git checkout <base>` exitoso
- [ ] `git merge --no-ff --no-commit` exitoso: sin conflictos, **o** con un conflicto exclusivamente `modify/delete` sobre los dos informes, resuelto por el lado del borrado
- [ ] `MERGE_HEAD` presente antes de tocar el índice (descarta el caso *Already up to date*)
- [ ] `quality-check.md` y `code-review.md` retirados del índice con rutas `':(top,glob)**/docs/audits/…'` —ancladas a la raíz **y** a cualquier profundidad, para cubrir el `docs/audits/` de un módulo en monorepo— y **verificado** con `git ls-files --cached` (no con `git diff --cached`, que también lista los borrados) (y **solo** esos dos: `arch-audit-*.md` y las copias de `save-report` intactas)
- [ ] `git commit -m "Merge <ID>: <nombre-corto>"` cerrado sobre el índice ya limpio
- [ ] Hash del commit de merge capturado para el reporte

**Cierre:**
- [ ] Reporte al usuario con rama origen, rama destino, commits integrados y hash de merge
- [ ] Si el paso 10 movió algo: bloque de archivado en el reporte (origen → destino, y qué pasó con las investigaciones sueltas). Si no archivó —el usuario lo declinó, no había con quién confirmar, rama `test/`, o ya estaba archivado—, dicho en una línea con el motivo.
- [ ] Sin push ejecutado
- [ ] Sin borrado de rama ejecutado
- [ ] El **contenido** de `progress.md` no fue modificado por el skill (a lo sumo se movió con su carpeta, si se archivó)
