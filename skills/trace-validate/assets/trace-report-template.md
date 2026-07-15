<!--
Plantilla canónica del reporte de trazabilidad (trace-validate).
- Rellenar solo con datos verificables del repo y del trabajo. No inventar cobertura ni resultados.
- Una fila de matriz por cada criterio de aceptación del trabajo. Los códigos dependen del tipo:
  AC-XXX (historia de usuario y work item).
- Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
- Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Reporte de trazabilidad — {{US-XXX-nombre-corto | WI-XXX-nombre}}

**Fecha**: {{YYYY-MM-DD HH:MM}}
**Trabajo**: {{US-XXX | WI-XXX}} · **Documento**: {{ruta-al-documento}}
**Tipo**: {{historia de usuario | work item}}
**Rama**: {{rama}}
**Cobertura**: {{N}} de {{M}} criterios cubiertos ({{porcentaje}})
**Veredicto**: {{✅ Aprobado | ❌ Rechazado | ⚠️ Aprobado con observaciones}}

## Resumen

{{1-3 frases: estado general de la cobertura, criterios faltantes/fallidos si los hay, y si se pudo ejecutar automáticamente.}}

## Matriz de trazabilidad

| Criterio | Descripción | Caso(s) de prueba | Artefactos | Estado | Automática | Resultado | Observaciones |
|----------|-------------|-------------------|------------|--------|------------|-----------|---------------|
| AC-001 | {{Criterio de aceptación}} | {{TC-…/derivado}} | `ruta/al/test.ext` (unit) | Cubierto | Sí | Paso | — |
| AC-002 | {{Criterio de aceptación}} | {{TC-…/derivado}} | `ruta/al/test.e2e.ext` (e2e) | Parcial | Sí | Paso | {{Límite de la cobertura}} |
| AC-003 | {{Criterio de aceptación}} | — | — | No cubierto | N/A | No ejecutado | {{Hueco: sin prueba asociada}} |

<!--
Valores permitidos:
- Criterio: AC-XXX (US y WI). Formatos legados (AC-1, CA-1, BR-01) se normalizan a AC-XXX.
- Estado: Cubierto | Parcial | No cubierto
- Ejec. auto (estado real al validar; el TC solo declara Manual/Automatizable): Sí (artefacto automatizado hallado y ejecutado) | No (Automatizable pendiente, o existe pero no se pudo ejecutar) | N/A (Manual por diseño)
- Resultado: Paso | Fallo | No ejecutado
- Tipo de artefacto: unit | integración | e2e | manual
- Celdas sin dato: «—»
-->

## Artefactos de prueba automatizada disponibles

| Tipo | Presente | Artefactos |
|------|----------|------------|
| Unit | {{Sí / No}} | {{rutas o «—»}} |
| Integración | {{Sí / No}} | {{rutas o «—»}} |
| E2E | {{Sí / No}} | {{rutas o «—»}} |

## Ejecución automática

| | |
|--|--|
| **Runner detectado** | {{Jest / Vitest / pytest / … / no detectado}} |
| **Comando ejecutado** | `{{comando exacto o «no ejecutado»}}` |
| **Resultado global** | {{X pasaron, Y fallaron, Z omitidos / no ejecutado: razón}} |

## Observaciones y pendientes

- {{Criterio: aclaración, supuesto a confirmar o acción sugerida. Omitir la sección si no hay pendientes.}}
