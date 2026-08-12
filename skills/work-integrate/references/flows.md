# Flujos secundarios y checklist

Referencias del skill **work-integrate**. Aplican a los dos tipos de trabajo (`US-XXX`, `WI-XXX`).

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
3. **Esperar respuesta** antes de continuar al paso 9 del flujo estándar (calcular delta). Sin respuesta clara, no hay merge.

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
