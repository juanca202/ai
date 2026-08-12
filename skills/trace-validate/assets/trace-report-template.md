<!--
Plantilla canónica del reporte de trazabilidad (trace-validate).
- Rellenar solo con datos verificables del repo y del trabajo. No inventar cobertura ni resultados.
- Una fila de matriz por cada criterio de aceptación del trabajo, con su identificador **verbatim**
  (el que use el artefacto: AC-XXX, 1.1, R-3…). Nunca normalizarlo.
- Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
- Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
- EXCEPCIÓN: conservar la marca de pie `<!-- trace-validate:fingerprint=… -->` (idempotencia, Paso 0/7).
-->

# Reporte de trazabilidad — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Trabajo:** [{{US-XXX | WI-XXX | FT-XXX | identificador del artefacto}}]({{./README.md | ruta relativa al artefacto}})
**Cobertura:** {{N}} de {{M}} criterios cubiertos ({{porcentaje}})
**Veredicto:** {{✅ Aprobado | ❌ Rechazado | ⚠️ Aprobado con observaciones}}

## Resumen

{{1-3 frases: estado general de la cobertura, criterios faltantes/fallidos si los hay, y si se pudo ejecutar automáticamente.}}

## Matriz de trazabilidad

| Criterio | Descripción | Caso(s) de prueba | Artefactos | Estado | Automática | Resultado | Observaciones |
|----------|-------------|-------------------|------------|--------|------------|-----------|---------------|
| AC-001 | {{Criterio de aceptación}} | {{TC-…/derivado}} | `ruta/al/test.ext` (unit) | Cubierto | Sí | Paso | — |
| AC-002 | {{Criterio de aceptación}} | {{TC-…/derivado}} | `ruta/al/test.e2e.ext` (e2e) | Parcial | Sí | Paso | {{Límite de la cobertura}} |
| AC-003 | {{Criterio de aceptación}} | — | — | No cubierto | No | No ejecutado | {{Hueco: sin prueba asociada}} |

<!--
Valores permitidos:
- Criterio: el identificador tal como aparece en el artefacto (AC-XXX, AC-1, 1.1, R-3, CA-07…). NUNCA normalizarlo.
- Estado: Cubierto | Parcial | No cubierto
- Ejec. auto (estado real al validar; el TC solo declara su `Tipo de prueba`: Manual, o uno o varios tipos): Sí (artefacto automatizado hallado y ejecutado) | No (tipo(s) automatizable(s) pendiente(s), o existe pero no se pudo ejecutar) | N/A (Manual por diseño)
- Resultado: Paso | Fallo | No ejecutado
- Tipo de artefacto: unit | integración | e2e | manual (un TC `API Test` o `Visual Test` se registra con el tipo del artefacto que realmente lo implementa, anotando el tipo declarado en Observaciones)
- Celdas sin dato: «—»
-->

## Artefactos de prueba automatizada disponibles

| Tipo | Presente | Artefactos |
|------|----------|------------|
| Unit | {{Sí / No}} | {{rutas o «—»}} |
| Integración | {{Sí / No}} | {{rutas o «—»}} |
| E2E | {{Sí / No}} | {{rutas o «—»}} |

{{Si el repo tiene pruebas de API o visuales en una suite propia, añadir su fila indicando en qué suite se ejecutan.}}

## Ejecución automática

Los resultados de pruebas los produce `quality-check` (trace-validate no ejecuta la suite).

| | |
|--|--|
| **Procedencia** | {{caché fresca de quality-check (commit abc1234, YYYY-MM-DD) / corrida `tests-only` disparada ahora / no ejecutable: razón}} |
| **Comando(s)** | `{{comando(s) de test-run.json o «no ejecutado»}}` |
| **Resultado global** | {{X pasaron, Y fallaron, Z omitidos / no ejecutado: razón}} |

## Observaciones y pendientes

- {{Criterio: aclaración, supuesto a confirmar o acción sugerida. Omitir la sección si no hay pendientes.}}

<!-- trace-validate:fingerprint={{hash}} · generado={{YYYY-MM-DD}} -->

