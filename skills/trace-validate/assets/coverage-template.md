<!--
Plantilla canónica del reporte de trazabilidad (trace-validate).
- Rellenar solo con datos verificables del repo y del trabajo. No inventar cobertura ni resultados.
- Dos tablas complementarias:
  (1) «Cobertura por criterio»: una fila por criterio de aceptación — vista de veredicto.
  (2) «Matriz de trazabilidad»: una fila por criterio × TC × tipo de prueba declarado — vista auditable.
- Identificador del criterio siempre verbatim (AC-XXX, 1.1, R-3…). Nunca normalizarlo.
- IDIOMA: los títulos de sección, los encabezados de columna y TODA etiqueta de estado, resultado y
  veredicto se redactan en el IDIOMA RESUELTO (ver «Resolución de idioma» en SKILL.md). Esta plantilla
  los muestra en español solo porque el repositorio del plugin está en español: son un ejemplo de
  redacción, no un texto fijo. Lo que NO cambia nunca: la estructura, el orden, los símbolos y los
  valores canónicos. Ver ../../reference/verdicts.md.
- Valores canónicos permitidos (en la celda va SÍMBOLO + ETIQUETA en el idioma resuelto):
  · Estado: `COVERED` (✅) | `PARTIAL` (⚠️) | `UNCOVERED` (❌)
  · Tipo: Manual | Unit | Integration | API Test | Visual Test | E2E | — (sin TC ni artefacto)
  · Evidencia: ruta del artefacto · ruta del TC en filas Manual · — (intención no materializada)
  · Ejecución: quality-check | Manual | — (no se ejecutó)
  · Resultado: `PASS` | `FAIL` | `NOT_RUN` | `UNCOVERED` | `N/A`
  Tipo, Evidencia y Ejecución NO se traducen: son nombres de campo, rutas y nombres de skill.
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
**Veredicto:** {{símbolo + etiqueta en el idioma resuelto: `✅` APPROVED | `❌` REJECTED | `⚠️` APPROVED_WITH_NOTES}}

## Resumen

{{1-3 frases: estado general de la cobertura y criterios faltantes/fallidos si los hay.}}

**Pruebas:** {{procedencia — caché fresca de `quality-check` (commit abc1234, YYYY-MM-DD) | corrida `tests-only` disparada ahora | no ejecutable y por qué}}. {{Resultado por suite, solo las que traiga `suites[]`: unit `PASS` · coverage `PASS` · e2e `FAIL` (solo si el repo ejecuta e2e) · integration-testing `FAIL` (solo si el estándar de testing del repo la declara) — o «no ejecutado» si no hubo corrida}}.

**Cobertura de criterios de aceptación**

| Total | {{COVERED}} | {{PARTIAL}} | {{UNCOVERED}} |
| ----- | --------- | --------- | ------------ |
| {{M}} | {{N}}     | {{P}}     | {{Q}}         |

<!--
- «Total» = M, el total de criterios de aceptación del artefacto. `COVERED` + `PARTIAL` + `UNCOVERED`s DEBE sumar M.
- Cifras siempre numéricas: 0, no «—».
- La línea «Pruebas» se copia de test-run.json: `result` viene por suite —las fijas (unit/coverage), más e2e
  si el repo la ejecuta y las que declare el estándar de testing (integration, contract…)—, no hay agregado global: no
  inventar uno, ni listar una suite que no venga en `suites[]`. Si no hubo corrida, decir «no ejecutable» y
  el motivo, sin suites.
  La suite `coverage` no se lista aquí: si dio FAIL, va a «Observaciones y pendientes».
-->

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                | Estado      | Observaciones                                                |
| -------- | -------------------------- | ----------- | ------------------------------------------------------------ |
| AC-001   | {{Criterio de aceptación}} | {{✅ COVERED}}   | {{Cobertura apoyada en TC-005 `Manual` (por diseño)}}        |
| AC-002   | {{Criterio de aceptación}} | {{⚠️ PARTIAL}}   | {{E2E declarado en TC-002 sin automatizar}}                  |
| AC-003   | {{Criterio de aceptación}} | {{❌ UNCOVERED}} | {{Hueco: sin caso de prueba ni artefacto asociado}}          |
| AC-004   | {{Criterio de aceptación}} | {{❌ UNCOVERED}} | {{`ruta/al/test.integration.ext` falla — aislado a su test}} |

## Matriz de trazabilidad

Vista auditable: **una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado**. Si un TC declara `Unit, E2E`, genera **dos** filas — así se ve de un vistazo qué parte de la intención de prueba está realmente materializada y cuál no.

| Criterio | TC     | Tipo        | Evidencia                       | Ejecución     | Resultado   |
| -------- | ------ | ----------- | ------------------------------- | ------------- | ----------- |
| AC-001   | TC-001 | Unit        | `ruta/al/test.ext`              | quality-check | {{✅ PASS}}      |
| AC-001   | TC-005 | Manual      | `test-cases/TC-005-{{slug}}.md` | Manual        | {{— N/A}}       |
| AC-002   | TC-002 | Unit        | `ruta/al/test.ext`              | quality-check | {{✅ PASS}}      |
| AC-002   | TC-002 | E2E         | —                               | —             | {{❌ UNCOVERED}} |
| AC-003   | —      | —           | —                               | —             | {{❌ UNCOVERED}} |
| AC-004   | TC-004 | Integration | `ruta/al/test.integration.ext`  | quality-check | {{❌ FAIL}}      |

## Observaciones y pendientes

- {{Criterio: aclaración, supuesto a confirmar o acción sugerida. Omitir la sección si no hay pendientes.}}

<!--
Aquí van los caveats **globales** de la corrida, no los de un criterio (esos van en la columna
Observaciones de «Cobertura por criterio»): suite `coverage` en FAIL, árbol de trabajo sucio
(`workingTreeClean: false`), clases de prueba que el repo no tiene, ejecución no delegable.
-->


<!--
Marca de frescura: NO eliminar al publicar. `fingerprint` es el canónico de la tubería (código y tests);
`spec` cubre la carpeta del artefacto (criterios y test-cases). El Paso 0 de la próxima corrida exige que
coincidan LOS DOS para reutilizar el reporte.
-->

<!-- trace-validate:verdict={{APPROVED|APPROVED_WITH_NOTES|REJECTED}} · fingerprint={{hash}} · spec={{hash}} · generated={{YYYY-MM-DD}} -->
