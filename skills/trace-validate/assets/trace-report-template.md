<!--
Plantilla canónica del reporte de trazabilidad (trace-validate).
- Rellenar solo con datos verificables del repo y del trabajo. No inventar cobertura ni resultados.
- Dos tablas complementarias:
  (1) «Cobertura por criterio»: una fila por criterio de aceptación — vista de veredicto.
  (2) «Matriz de trazabilidad»: una fila por criterio × TC × tipo de prueba declarado — vista auditable.
- Identificador del criterio siempre verbatim (AC-XXX, 1.1, R-3…). Nunca normalizarlo.
- Valores permitidos:
  · Estado: Cubierto | Parcial | No cubierto
  · Tipo: Manual | Unit | Integration | API Test | Visual Test | E2E | — (sin TC ni artefacto)
  · Evidencia: ruta del artefacto · ruta del TC en filas Manual · — (intención no materializada)
  · Ejecución: quality-check | Manual | — (no se ejecutó)
  · Resultado: Paso | Fallo | No ejecutado | No cubierto | N/A
- Sustituir manualmente cada {{texto}}; no es un motor de plantillas.
- Al publicar: eliminar TODOS los bloques de comentario de instrucciones (este y los intercalados)
  y sustituir todos los {{…}}.
- EXCEPCIÓN: la marca de fingerprint del pie del documento se CONSERVA (idempotencia, Paso 0/7).
-->

# Reporte de trazabilidad — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Trabajo:** [{{US-XXX | WI-XXX | FT-XXX | identificador del artefacto}}]({{./README.md | ruta relativa al artefacto}})
**Veredicto:** {{✅ Aprobado | ❌ Rechazado | ⚠️ Aprobado con observaciones}}

## Resumen

{{1-3 frases: estado general de la cobertura y criterios faltantes/fallidos si los hay.}}

**Pruebas:** {{procedencia — caché fresca de `quality-check` (commit abc1234, YYYY-MM-DD) | corrida `tests-only` disparada ahora | no ejecutable y por qué}}. {{Resultado por suite: unit `PASS` · integration `FAIL` · e2e `N/A` — o «no ejecutado» si no hubo corrida}}.

| Indicador                | Resultado |
| ------------------------ | --------- |
| Criterios de aceptación  | {{M}}     |
| Criterios cubiertos      | {{N}}     |
| Criterios parciales      | {{P}}     |
| Criterios no cubiertos   | {{Q}}     |

<!--
- «Criterios de aceptación» = M, el total del artefacto. Cubiertos + Parciales + No cubiertos DEBE sumar M.
- Cifras siempre numéricas: 0, no «—».
- La línea «Pruebas» se copia de test-run.json: `result` viene por suite (unit/coverage/integration/e2e),
  no hay agregado global — no inventar uno. Si no hubo corrida, decir «no ejecutable» y el motivo, sin suites.
  La suite `coverage` no se lista aquí: si dio FAIL, va a «Observaciones y pendientes».
-->

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                | Estado      | Observaciones                                                |
| -------- | -------------------------- | ----------- | ------------------------------------------------------------ |
| AC-001   | {{Criterio de aceptación}} | Cubierto    | {{Cobertura apoyada en TC-005 `Manual` (por diseño)}}        |
| AC-002   | {{Criterio de aceptación}} | Parcial     | {{E2E declarado en TC-002 sin automatizar}}                  |
| AC-003   | {{Criterio de aceptación}} | No cubierto | {{Hueco: sin caso de prueba ni artefacto asociado}}          |
| AC-004   | {{Criterio de aceptación}} | No cubierto | {{`ruta/al/test.integration.ext` falla — aislado a su test}} |

## Matriz de trazabilidad

Vista auditable: **una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado**. Si un TC declara `Unit, E2E`, genera **dos** filas — así se ve de un vistazo qué parte de la intención de prueba está realmente materializada y cuál no.

| Criterio | TC     | Tipo        | Evidencia                       | Ejecución     | Resultado   |
| -------- | ------ | ----------- | ------------------------------- | ------------- | ----------- |
| AC-001   | TC-001 | Unit        | `ruta/al/test.ext`              | quality-check | Paso        |
| AC-001   | TC-005 | Manual      | `test-cases/TC-005-{{slug}}.md` | Manual        | N/A         |
| AC-002   | TC-002 | Unit        | `ruta/al/test.ext`              | quality-check | Paso        |
| AC-002   | TC-002 | E2E         | —                               | —             | No cubierto |
| AC-003   | —      | —           | —                               | —             | No cubierto |
| AC-004   | TC-004 | Integration | `ruta/al/test.integration.ext`  | quality-check | Fallo       |

## Observaciones y pendientes

- {{Criterio: aclaración, supuesto a confirmar o acción sugerida. Omitir la sección si no hay pendientes.}}

<!--
Aquí van los caveats **globales** de la corrida, no los de un criterio (esos van en la columna
Observaciones de «Cobertura por criterio»): suite `coverage` en FAIL, árbol de trabajo sucio
(`workingTreeClean: false`), clases de prueba que el repo no tiene, ejecución no delegable.
-->


<!-- trace-validate:fingerprint={{hash}} · generado={{YYYY-MM-DD}} -->
