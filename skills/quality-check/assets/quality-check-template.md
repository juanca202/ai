<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Verificaciones automatizadas — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Modo:** {{default | blocking-only | only nombre-del-check | no-tests | …}}  <!-- `tests-only` no produce este informe: su único artefacto es test-run.json -->
**Estándar de testing:** {{docs/standards/testing.md — requisitos vigentes: integration-testing, contract-testing | sin estándar de testing (solo las suites fijas)}}
**Veredicto:** {{✅ Aprobado | ❌ Rechazado | ⚠️ Incompleto}}

## Resumen

{{2-3 frases: qué se ejecutó, el resultado global y, si algo bloquea, qué falta para llegar a Aprobado. Sin listar aún el detalle.}}

## Verificaciones

Símbolos de estado: `✅` Pasó · `❌` Falló · `⏭️` Omitido · `⏸️` Pendiente · `—` No aplica · `ℹ️` Informativo.

| # | Check      | Comando            | Categoría     | Estado         | Detalle               | Duración |
| - | ---------- | ------------------ | ------------- | -------------- | --------------------- | -------- |
| 1 | tipado     | {{comando}}          | {{Bloqueante}}  | {{✅ Pasó}}       | {{0 errores}}           | {{4.1s}}   |
| 2 | linter     | {{comando}}          | {{Bloqueante}}  | {{❌ Falló}}      | {{3 errors, 5 warnings}}| {{2.3s}}   |
| 3 | unit tests | {{comando}}          | {{Bloqueante}}  | {{✅ Pasó}}       | {{142 passed, 0 failed}}| {{18.7s}}  |
| 4 | coverage   | {{comando}}          | {{Bloqueante}}  | {{✅ Pasó}}       | {{87% (umbral 80%)}}    | {{19.0s}}  |
| 5 | {{integración}} | {{comando}}     | {{Bloqueante}}  | {{✅ Pasó}}       | {{18 passed}}           | {{41.2s}}  |
| 6 | {{contrato}}    | {{comando}}     | {{Condicional}} | {{⏭️ Omitido}}    | {{config rota}}         | {{—}}      |
| 7 | build      | {{comando}}          | {{Bloqueante}}  | {{✅ Pasó}}       | {{OK}}                  | {{12.4s}}  |
| 8 | e2e        | {{comando}}          | {{Condicional}} | {{— No aplica}}  | {{sin config e2e}}      | {{—}}      |
| 9 | sonar      | {{comando}}          | {{Informativo}} | {{— No aplica}}  | {{sin config}}          | {{—}}      |

<!--
FILAS DE PRUEBAS — fijas vs configuradas (ver `SKILL.md` → Suites de prueba: fijas y configuradas):
  - FIJAS, siempre presentes: `unit tests`, `coverage` y `e2e`. Se listan aunque su estado sea
    `— No aplica`; nunca se omiten.
  - CONFIGURADAS (filas 5 y 6 del ejemplo —integración, contrato— que es ilustrativo, no una lista
    cerrada): una fila por cada clase de prueba que declare el estándar de testing del repo
    (`docs/standards/testing.md` o `docs/standards/testing/README.md`), en el orden en que el estándar
    la declara. Sin estándar de testing, o sin más requisitos que los de las fijas, estas filas
    simplemente no existen — NO inventar una suite que el estándar no declara.
El resto de checks (tipado, linter, build, sonar) no son pruebas: se incluyen solo si aplican al stack.
Los `N/A` por modificador del usuario o por no aplicar al stack pueden omitirse o marcarse
`— No aplica`; las tres fijas se listan siempre.
La columna Estado lleva SÍMBOLO + ETIQUETA EN ESPAÑOL, siempre de la leyenda de arriba. Los nombres
canónicos en inglés (PASS/FAIL/SKIPPED/N/A) son vocabulario interno y del test-run.json: no aparecen
en el informe, tampoco en la columna Detalle.
Un check informativo (Sonar) que falla se reporta con el estado normal `❌ Falló`; lo que lo hace
informativo es su Categoría, no su Estado. El símbolo `ℹ️` solo aparece en la leyenda y en Categoría.
-->

### Detalle de checks fallidos

{{Solo para FAIL o SKIPPED. Truncar a 10 errores por check con `… y N más`. Si no hay ninguno: «Sin checks fallidos».}}

- **{{check}}** — {{mensajes de error relevantes, parseados según la herramienta}}

## Próximas acciones

<!-- Esta sección solo aparece si hay acciones pendientes. Orden de prioridad: FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → SKIPPED por config ausente/rota → recomendaciones (cobertura sin tooling; suite de prueba presente en el repo pero NO declarada en el estándar de testing, sugiriendo declararla vía `arch-manage`; ausencia de estándar de testing). Si el veredicto es Aprobado y no hay pendientes: «Sin acciones pendientes». Si el usuario pidió solo el informe, aquí queda todo lo que habría que corregir, con el detalle suficiente para retomarlo después. -->

1. {{acción concreta}}
2. {{…}}