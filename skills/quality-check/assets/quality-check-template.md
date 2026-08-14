<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Verificaciones automatizadas — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Modo:** {{default | blocking-only | only nombre-del-check | no-tests | …}}  <!-- `tests-only` no produce este informe: su único artefacto es test-run.json -->
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
| 5 | integración| {{comando}}          | {{Condicional}} | {{— No aplica}}  | {{sin suite propia}}    | {{—}}      |
| 6 | build      | {{comando}}          | {{Bloqueante}}  | {{✅ Pasó}}       | {{OK}}                  | {{12.4s}}  |
| 7 | e2e        | {{comando}}          | {{Condicional}} | {{⏭️ Omitido}}    | {{config rota}}         | {{—}}      |
| 8 | sonar      | {{comando}}          | {{Informativo}} | {{— No aplica}}  | {{sin config}}          | {{—}}      |

<!--
Incluir solo las filas de checks que aplican al stack. Los `N/A` por modificador del usuario o por no
aplicar al stack pueden omitirse o marcarse `— No aplica`.
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

<!-- Esta sección solo aparece si hay acciones pendientes. Orden de prioridad: FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → SKIPPED por config ausente/rota. Si el veredicto es Aprobado y no hay pendientes: «Sin acciones pendientes». Si el usuario pidió solo el informe, aquí queda todo lo que habría que corregir, con el detalle suficiente para retomarlo después. -->

1. {{acción concreta}}
2. {{…}}