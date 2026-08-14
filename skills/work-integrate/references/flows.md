# Flujos secundarios y checklist

Referencias del skill **work-integrate**. Aplican a los dos tipos de trabajo (`US-XXX`, `WI-XXX`).

---

## Flujo: Manejo de conflictos

Cuando `git merge` produce conflictos.

1. **Clasificar el conflicto antes de tocar nada.** Listar los archivos en conflicto y su tipo (`git status --porcelain`: `DU`/`UD` es `modify/delete`, `UU` es conflicto de contenido).
   - **Si los únicos archivos en conflicto son `docs/audits/quality-check.md` y/o `docs/audits/code-review.md`, y el tipo es `modify/delete`** → no es un conflicto de código: saltar al apartado «Conflicto esperado» de abajo y **continuar el merge**. No abortar.
   - **En cualquier otro caso** → seguir con el punto 2.
2. **Abortar** con `git merge --abort` para restaurar el repo al estado previo al merge. No intentar resolución automática ni usar `--strategy=ours` / `--strategy=theirs`.
3. **Reportar al usuario** la lista de archivos en conflicto y dejar claro que el repo quedó como estaba. Indicar que el siguiente paso (rebase, merge manual, decisión de alcance) está fuera del skill.
4. **Parar.** No reintentar; no encadenar otra acción git sin nueva instrucción del usuario.

### Conflicto esperado: `modify/delete` sobre los informes de las puertas

Si la rama ya se integró antes, la base tiene `docs/audits/quality-check.md` y `code-review.md` **borrados**
por aquel commit de merge; si después se volvieron a correr las puertas en la rama, ahora aparecen
**modificados** allí y git levanta un `modify/delete` sobre exactamente esos dos archivos. Es el desenlace que
el paso 12 buscaba de todos modos, así que se resuelve por el lado del borrado y el merge continúa:

```bash
git rm -q -f --ignore-unmatch ':(top)docs/audits/quality-check.md' ':(top)docs/audits/code-review.md'
test -z "$(git ls-files --cached -- ':(top)docs/audits/quality-check.md' ':(top)docs/audits/code-review.md')" \
  || { echo "los informes siguen en el índice"; exit 1; }
git commit -m "Merge <ID>: <nombre-corto>"
```

Es la misma secuencia del paso 12, guard incluido: la resolución del conflicto no es motivo para saltárselo.

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
- [ ] Idioma de preferencia determinado y `.agents/MEMORY.md` actualizado si fue necesario

**Validación:**
- [ ] `git status --porcelain` sin salida (working tree limpio); si había cambios pendientes, se resolvieron invocando automáticamente `git-commit` (sin preguntar al usuario si convenía invocarlo — `git-commit` sí pudo pedir su propia confirmación antes de comitear)
- [ ] `progress.md` existe en la ubicación del tipo
- [ ] **Todas** las unidades del trabajo de la rama en estado `Done` (leídas del `progress.md` en la carpeta del trabajo)
- [ ] **`quality-check`** ejecutado con veredicto **✅ Aprobado**
- [ ] **`code-review`** ejecutado con veredicto **✅ Aprobado**
- [ ] **`trace-validate`** ejecutado (después de `quality-check`) con veredicto **✅ Aprobado** (o **⚠️ Aprobado con observaciones**)
- [ ] **Working tree limpio de nuevo tras las puertas** (las correcciones aplicadas durante ellas ya commiteadas vía `git-commit`)
- [ ] Sin commits sin commitear ni stash sin aplicar relevante al alcance

**Ejecución:**
- [ ] Delta `<base>..HEAD` > 0 verificado **antes** del checkout (si es 0, la rama ya está integrada: parar)
- [ ] `git checkout <base>` exitoso
- [ ] `git merge --no-ff --no-commit` exitoso: sin conflictos, **o** con un conflicto exclusivamente `modify/delete` sobre los dos informes, resuelto por el lado del borrado
- [ ] `MERGE_HEAD` presente antes de tocar el índice (descarta el caso *Already up to date*)
- [ ] `docs/audits/quality-check.md` y `docs/audits/code-review.md` retirados del índice con rutas `:(top)` y **verificado** con `git ls-files --cached` (no con `git diff --cached`, que también lista los borrados) (y **solo** esos dos: `arch-audit-*.md` y las copias de `save-report` intactas)
- [ ] `git commit -m "Merge <ID>: <nombre-corto>"` cerrado sobre el índice ya limpio
- [ ] Hash del commit de merge capturado para el reporte

**Cierre:**
- [ ] Reporte al usuario con rama origen, rama destino, commits integrados y hash de merge
- [ ] Sin push ejecutado
- [ ] Sin borrado de rama ejecutado
- [ ] `progress.md` no fue modificado por el skill
