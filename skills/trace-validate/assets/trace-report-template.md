` (idempotencia, Paso 0/7).

-->

# Reporte de trazabilidad — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Trabajo:** [{{US-XXX | WI-XXX | FT-XXX | identificador del artefacto}}]({{./README.md | ruta relativa al artefacto}})
**Veredicto:** {{✅ Aprobado | ❌ Rechazado | ⚠️ Aprobado con observaciones}}

## Resumen

{{1-3 frases: estado general de la cobertura, criterios faltantes/fallidos si los hay, y si se pudo ejecutar automáticamente.}}

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                | Estado      | Observaciones                                                |
| -------- | -------------------------- | ----------- | ------------------------------------------------------------ |
| AC-001   | {{Criterio de aceptación}} | Cubierto    | —                                                            |
| AC-002   | {{Criterio de aceptación}} | Parcial     | {{E2E declarado en TC-002 sin automatizar}}                  |
| AC-003   | {{Criterio de aceptación}} | No cubierto | {{Hueco: sin caso de prueba ni artefacto asociado}}          |
| AC-004   | {{Criterio de aceptación}} | No cubierto | {{`ruta/al/test.integration.ext` falla — aislado a su test}} |

## Matriz de trazabilidad

Vista auditable: **una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado**. Si un TC declara `Unit, E2E`, genera **dos** filas — así se ve de un vistazo qué parte de la intención de prueba está realmente materializada y cuál no.

| Criterio | TC     | Tipo        | Evidencia                       | Ejecución                           | Resultado   |
| -------- | ------ | ----------- | ------------------------------- | ----------------------------------- | ----------- |
| AC-001   | TC-001 | Unit        | `ruta/al/test.ext`              | quality-check (suite `unit`)        | Paso        |
| AC-001   | TC-005 | Manual      | `test-cases/TC-005-{{slug}}.md` | Manual                              | N/A         |
| AC-002   | TC-002 | Unit        | `ruta/al/test.ext`              | quality-check (suite `unit`)        | Paso        |
| AC-002   | TC-002 | E2E         | —                               | —                                   | No cubierto |
| AC-003   | —      | —           | —                               | —                                   | No cubierto |
| AC-004   | TC-004 | Integration | `ruta/al/test.integration.ext`  | quality-check (suite `integration`) | Fallo       |

## Observaciones y pendientes

- {{Criterio: aclaración, supuesto a confirmar o acción sugerida. Omitir la sección si no hay pendientes.}}

