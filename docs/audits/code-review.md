# Code Review — WI-002-hooks-eventos-actividad

**Fecha:** 2026-08-28 00:45
**Rama:** chore/WI-002-hooks-eventos-actividad
**Commit:** 743c076
**Alcance del diff:** rama vs base, incluidos los cambios sin commitear — 7 archivos, +839/−7 líneas
**Modo:** default
**Base del diff:** feature/v2 @ bfc27ad
**Veredicto:** ✅ APPROVED — sin hallazgos bloqueantes; tres notas no bloqueantes documentadas abajo.

## Resumen

El cambio añade `hooks/events/activity-events.js`, un hook nuevo que notifica seis eventos de actividad de sesión (comandos git/test, preguntas estructuradas, inicio/fin de unidad de implementación), registrado en `hooks/hooks.json` y documentado en `hooks/README.md`, con 26 pruebas unitarias propias. Sigue fielmente el estilo y las garantías de `artifact-events.js` (sin dependencias externas, falla en silencio, respeta el interruptor de `specification`). No hay hallazgos que bloqueen el merge.

## Intención detectada

`WI-002-hooks-eventos-actividad` (`docs/specs/work-items/WI-002-hooks-eventos-actividad/README.md`): agregar visibilidad sobre actividad de sesión no cubierta por `artifact-events.js` — invocaciones de `git`/comandos de prueba por Bash, preguntas estructuradas al usuario y unidades de implementación — con las mismas garantías que el hook existente.

## Hallazgos

Leyenda: `🔴` CRITICAL · `🟠` MAJOR · `🟡` MINOR · `💡` SUGGESTION · `✅` COMPLIANT.

### Análisis semántico (intención)

`✅` COMPLIANT — el código cubre los 11 criterios de aceptación del WI. La única desviación del texto literal (registrar también `PostToolUseFailure` para `Bash`, no solo `PreToolUse`/`PostToolUse` como dice AC-001) es una decisión consultada y aprobada explícitamente por el usuario durante la implementación (documentada en `progress.md`), necesaria para que `tool.completed` no ignore silenciosamente todo comando git/test que falla — el caso más accionable de los dos.

### Arquitectura y diseño

`✅` COMPLIANT con notas no bloqueantes.

- 💡 `[ISO-25010: Seguridad]` Reenvío de stdout/stderr sin redactar — **Qué:** `buildToolCompletedEventFromSuccess`/`buildToolCompletedEventFromFailure` reenvían el `stdout`/`stderr`/`error` crudo del comando `git`/test a `specification.trackingUrl`. **Por qué:** un test en rojo que imprime una variable de entorno, o un `git remote -v` con credenciales embebidas en la URL, viajaría tal cual al endpoint de tracking. **Impacto:** bajo en la práctica — es una función opt-in (`specification.trackingEnabled`), gated por el mismo interruptor que ya usa `artifact-events.js`, y el WI lo pide explícitamente en AC-004. **Sugerencia:** si en el futuro se usa en entornos con secretos en la salida de tests/git, considerar un truncado o redacción básica (p. ej. patrones tipo `://user:pass@`) antes de enviar; no es necesario para este cierre.
- 💡 `[ISO-25010: Mantenibilidad]` Duplicación de `postEvent`/`readStdin`/`runGit` con `artifact-events.js` — **Qué:** ~40 líneas idénticas entre los dos hooks. **Por qué:** un cambio futuro en la lógica de POST (p. ej. reintentos) tendría que aplicarse dos veces. **Impacto:** bajo — es el mismo patrón que ya usa el repo (cada hook es un archivo autocontenido, sin módulo compartido) y `AC-010` pide cero dependencias, no cero duplicación. **Sugerencia:** si aparece un tercer hook de eventos, valdría la pena extraer un `hooks/events/lib/http.js` compartido; prematuro con solo dos archivos.
- 💡 `[ISO-25010: Fiabilidad]` `TEST_COMMAND_RE` puede dar falsos positivos — **Qué:** matchea cualquier script `npm run <algo-que-contenga-test-o-e2e>`, p. ej. `npm run build:test-fixtures` se clasificaría como `category: "test"` aunque no ejecute pruebas. **Por qué:** es una heurística léxica, no semántica. **Impacto:** bajo — mismo criterio ya aceptado y documentado para `DELETE_COMMAND_RE` en `artifact-events.js`, y `hooks/README.md` ya deja constancia de esta limitación. **Sugerencia:** ninguna acción necesaria; ya está documentado como limitación conocida.

### Dimensiones no evaluadas

Ninguna — las tres dimensiones se evaluaron sobre el diff completo.

### Feedback adicional

Buen uso de `require.main === module` + `module.exports` (patrón ya establecido en `scripts/validate-skills.js`) para hacer el hook testeable sin depender de mocks de `stdin`. Las 26 pruebas cubren bien los bordes reales: degradación ante campos ausentes (AC-006), parseo del `exitCode` desde `error`, y las cuatro transiciones de `implementation.*` (aparece, se repite, cambia sin desaparecer, desaparece) — esta última es la parte más fácil de dejar mal y está bien probada.

## Próximas acciones

Sin acciones pendientes.

## Justificaciones aceptadas

Ninguna.

<!-- code-review:verdict=APPROVED · mode=default · fingerprint=c017c87db487567908a5a6ad11b7cacb4175a0db · base=bfc27ad · generated=2026-08-28 -->
