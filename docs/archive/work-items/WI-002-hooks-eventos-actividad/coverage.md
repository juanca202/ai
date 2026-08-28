# Reporte de trazabilidad — WI-002-hooks-eventos-actividad

**Fecha:** 2026-08-28 00:50
**Rama:** chore/WI-002-hooks-eventos-actividad
**Commit:** 743c076
**Trabajo:** [WI-002](./README.md)
**Veredicto:** ⚠️ APPROVED_WITH_NOTES — ningún criterio sin cubrir; tres quedan `PARTIAL` porque cubren el gate de nivel `main()` (settings/stdin) solo por inspección manual, sin test automatizado propio.

## Resumen

WI-002 no tiene carpeta `test-cases/` (confirmado con el usuario durante la implementación); el mapeo criterio↔prueba se infirió directamente de `hooks/events/activity-events.test.js`, sin `TC-XXX` documentados. 8 de los 11 criterios de aceptación están `COVERED` por las 26 pruebas unitarias del hook. Los 3 restantes (AC-009, AC-010, AC-011) están `PARTIAL`: su comportamiento existe en `main()` pero ese punto de entrada no está exportado ni cubierto por un test automatizado — solo se verificó manualmente durante la implementación (smoke test no persistido).

**Pruebas:** resultados tomados de la caché fresca de `quality-check` (commit 743c076, 2026-08-28). unit `PASS` (66 passed, incluye los 40 de `scripts/validate-skills.test.js` ajenos a este WI) · coverage `N/A` · e2e `N/A`.

**Cobertura de criterios de aceptación**

| Total | `COVERED` | `PARTIAL` | `UNCOVERED` |
| ----- | --------- | --------- | ------------ |
| 11    | 8         | 3         | 0            |

## Cobertura por criterio

| Criterio | Descripción | Estado | Observaciones |
| -------- | ----------- | ------ | -------------- |
| AC-001 | `tool.called`/`tool.completed` solo para comandos `git` (PreToolUse/PostToolUse Bash) | `COVERED` | Mapeo inferido (sin `TC-XXX`); incluye el caso "no genera ruido" para comandos ajenos |
| AC-002 | Heurística de detección de comandos de prueba por stack | `COVERED` | Mapeo inferido; los 16 patrones del AC están cubiertos en un solo test parametrizado |
| AC-003 | Payload de `tool.called` (command, category, cwd, campos comunes) | `COVERED` | Mapeo inferido |
| AC-004 | Payload de `tool.completed` con resultado de ejecución | `COVERED` | Mapeo inferido; cubre los dos caminos (`PostToolUse` éxito y `PostToolUseFailure`, este último por la ampliación de alcance aprobada por el usuario) |
| AC-005 | `question.asked`/`question.answered` para `AskUserQuestion` | `COVERED` | Mapeo inferido |
| AC-006 | Degradación con gracia ante campos ausentes | `COVERED` | Mapeo inferido; cubre `AskUserQuestion` sin `options` y sin `answers`/`response` |
| AC-007 | `implementation.started`/`completed` inferidos de `current-iteration.json` | `COVERED` | Mapeo inferido; las 5 transiciones (aparece, se repite, cambia sin desaparecer, desaparece, ninguno) están probadas |
| AC-008 | Payload de `implementation.started`/`completed` (`iterationId`, `key`) | `COVERED` | Mapeo inferido, mismos tests que AC-007 |
| AC-009 | Respeta `specification.trackingEnabled`/`trackingUrl` | `PARTIAL` | El gate vive en `main()`, que no está exportado ni tiene test propio en `activity-events.test.js`; solo se verificó manualmente (smoke test con `echo ... \| node hooks/events/activity-events.js` sobre un repo sin `settings.json`, sin persistir como test) |
| AC-010 | Sin dependencias npm (solo módulos nativos) | `PARTIAL` | No hay test que lo haga cumplir; verificado por inspección del código (`require('fs')`, `path`, `http`, `https`, `child_process`) y por la ausencia de `package.json` en el repo — sin guardia de regresión si alguien agrega una dependencia externa después |
| AC-011 | Falla en silencio ante condición ambigua/error | `PARTIAL` | Los helpers internos (`readIterationFile`, `readActivityState`, `buildEvents` ante combinación no reconocida) sí tienen test de tolerancia a error; el `try/catch` externo de `main()` (JSON de stdin inválido, `settings.json` ausente) no tiene test automatizado — solo verificado manualmente |

## Matriz de trazabilidad

| Criterio | TC | Tipo | Evidencia | Ejecución | Resultado |
| -------- | -- | ---- | --------- | --------- | --------- |
| AC-001 | — | Unit | `hooks/events/activity-events.test.js` (`classifyCommand: reconoce comandos git`, `classifyCommand: no matchea comandos ajenos a git/test`, `buildToolCalledEvent: payload con command/category/cwd para git`, `buildEvents: PreToolUse + Bash con git produce tool.called`) | quality-check | `PASS` |
| AC-002 | — | Unit | `hooks/events/activity-events.test.js` (`classifyCommand: reconoce runners de test por stack`) | quality-check | `PASS` |
| AC-003 | — | Unit | `hooks/events/activity-events.test.js` (`buildToolCalledEvent: payload con command/category/cwd para git`) | quality-check | `PASS` |
| AC-004 | — | Unit | `hooks/events/activity-events.test.js` (`buildToolCompletedEventFromSuccess: exitCode 0 implicito y stdout/stderr del tool_response`, `buildToolCompletedEventFromFailure: parsea el exit code del campo error`, `buildToolCompletedEventFromFailure: exitCode null si el error no trae "Exit code N"`) | quality-check | `PASS` |
| AC-005 | — | Unit | `hooks/events/activity-events.test.js` (`buildQuestionAskedEvent: extrae preguntas y opciones`, `buildQuestionAnsweredEvent: incluye answers cuando estan presentes`) | quality-check | `PASS` |
| AC-006 | — | Unit | `hooks/events/activity-events.test.js` (`buildQuestionAskedEvent: degrada con gracia si faltan options`, `buildQuestionAnsweredEvent: null si no hay answers ni response`) | quality-check | `PASS` |
| AC-007 | — | Unit | `hooks/events/activity-events.test.js` (`buildImplementationEvents: emite started...`, `...no repite started...`, `...emite started de nuevo si el iterationId cambia...`, `...emite completed cuando el archivo desaparece`, `...sin archivo y sin estado previo, no emite nada`) | quality-check | `PASS` |
| AC-008 | — | Unit | `hooks/events/activity-events.test.js` (mismos tests que AC-007, aserciones de `payload`) | quality-check | `PASS` |
| AC-009 | — | — | — | — | `UNCOVERED` |
| AC-010 | — | — | — | — | `UNCOVERED` |
| AC-011 | — | Unit | `hooks/events/activity-events.test.js` (`readIterationFile / writeActivityState: tolera JSON invalido sin lanzar`, `buildEvents: combinacion no reconocida devuelve array vacio sin lanzar`) | quality-check | `PASS` |

## Observaciones y pendientes

- AC-009 / AC-010 / AC-011: si se quiere cerrar el `PARTIAL`, agregar pruebas que invoquen `main()` directamente (hoy no exportado) simulando `stdin` — p. ej. con un subproceso `node hooks/events/activity-events.js` alimentado por `child_process.execFileSync`, verificando que no postea nada sin `settings.json`/`trackingEnabled`, que tolera un JSON de stdin inválido, y que no requiere ninguna dependencia fuera de `node:*`. No es bloqueante para este cierre.
- El repo no tiene `docs/standards/testing.md`: la corrida de `quality-check` fue solo las tres suites fijas (unit/coverage/e2e), sin suites configuradas.

<!-- trace-validate:verdict=APPROVED_WITH_NOTES · fingerprint=c017c87db487567908a5a6ad11b7cacb4175a0db · spec=c66eeaa7ecff46fb56cc60738ab8edb0ee428226 · generated=2026-08-28 -->
