# Progreso

## WI-003
**Estado:** Done

<!-- work:id=WI-003 · status=Done -->
**Tipo:** tarea de mantenimiento
**Fecha de creación:** 2026-08-28 13:30
**Ultima actualizacion:** 2026-08-28 13:35

## Unidades

### WI-003: Validador YAML del frontmatter de skills y git-commit inválido
**Estado:** Done

<!-- unit:id=WI-003 · status=Done -->
**Iniciado:** 2026-08-28 13:30
**Finalizado:** 2026-08-28 13:35
**Implementador:** juanca202 / Cursor / Cursor Grok 4.6

**Archivos:**
```
~ scripts/validate-skills.js
~ scripts/validate-skills.test.js
~ skills/git-commit/SKILL.md
+ docs/specs/work-items/WI-003-validador-yaml-frontmatter-skills/progress.md
~ docs/specs/work-items/WI-003-validador-yaml-frontmatter-skills/README.md
```

**Notas:**
- `description` de `git-commit` se plegó con `>` (no comillas) para no tocar el texto y dejar válido el `: ` interior.
- 44/44 tests en verde; Psych carga el frontmatter de `git-commit` sin error; `validateSkill` sobre ese skill queda en 0 hallazgos.

**Decisiones adicionales:**
- Rama de integración: `feature/v2` (indicada por el usuario; no es `develop`).
- Continuar sin `test-cases/` formales: la prueba del bug vive en `scripts/validate-skills.test.js` (IT-01).
