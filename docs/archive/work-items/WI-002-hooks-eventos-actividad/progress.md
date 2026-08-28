# Progreso

## WI-002
**Estado:** Done

<!-- work:id=WI-002 · status=Done -->
**Tipo:** tarea de mantenimiento
**Fecha de creación:** 2026-08-28 00:00
**Ultima actualizacion:** 2026-08-28 01:30

## Unidades

### WI-002: Hooks de eventos de actividad (git, tests, preguntas e implementación)
**Estado:** Done

<!-- unit:id=WI-002 · status=Done -->
**Iniciado:** 2026-08-28 00:00
**Finalizado:** 2026-08-28 01:30
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
```
+ hooks/events/activity-events.js
+ hooks/events/activity-events.test.js
~ hooks/hooks.json
~ hooks/README.md
~ .gitignore
~ docs/specs/work-items/WI-002-hooks-eventos-actividad/README.md
```

**Notas:**
- Sin `test-cases/` para este WI; el usuario confirmó continuar sin TC-XXX previos, basando el ciclo TDD directamente en los AC-XXX.
- IT-01 (verificación empírica) no pudo hacerse con un hook temporal de solo-logging: el sandbox bloqueó escribir `.claude/settings.local.json` (clasificador de auto-mode, cambios a configuración de hooks). Se sustituyó por investigación documental directa contra `https://code.claude.com/docs/en/hooks.md` (fetch crudo, no resumido) — un primer research vía subagente afirmó un schema de `tool_response` para `Bash` con campos `exit_code`/`timeout`/`run_in_background` "confirmado por documentación oficial"; se verificó independientemente contra el documento crudo y resultó ser una alucinación (el schema real es `{stdout, stderr, interrupted, isImage}`, sin `exit_code`). Se descartó ese hallazgo y se usó solo lo verificado en el fetch directo.
- Los tests se escribieron junto con la implementación final (no estrictamente antes), porque el shape exacto del payload dependía del resultado de IT-01 y solo pudo fijarse una vez verificado empíricamente; los 26 tests pasaron en la primera corrida (`node --test hooks/events/activity-events.test.js`).

**Decisiones adicionales:**
- Commit del spec de WI-002 (sin trackear al iniciar sesión) antes de crear la rama del WI, con confirmación del usuario.
- `feature/v2` se trató como rama base/integración de este esfuerzo (no como rama de otro trabajo); se creó `chore/WI-002-hooks-eventos-actividad` desde ahí, según el prefijo `chore/` que le toca al tipo `operational-change`.
- Se descubrió que `PostToolUse` solo se dispara cuando la tool call tiene éxito: un comando `git`/test que falla (exit != 0) dispara `PostToolUseFailure` en su lugar, con un payload distinto (`error`, no `tool_response`). AC-001 tal como está escrito solo pedía registrar `PreToolUse`/`PostToolUse`, lo que habría dejado sin `tool.completed` a todo comando de test en rojo o comando git fallido — el caso más accionable. Se consultó al usuario y se amplió el alcance de IT-02/IT-05 para registrar también `PostToolUseFailure` (matcher `Bash`), documentado en `hooks/README.md`.
- Se agregó un guard `require.main === module` y `module.exports` a `activity-events.js` (patrón ya usado en `scripts/validate-skills.js`) para hacerlo testeable con `node --test`; `artifact-events.js` no se tocó (fuera de alcance de este WI).
- Se creó `.sdd-devkit/activity-iteration-state.json` como caché local (gitignored) para poder detectar transiciones de `current-iteration.json` entre invocaciones de hook independientes (cada invocación es un proceso nuevo sin memoria compartida).
