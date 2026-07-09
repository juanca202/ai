<!--
Plantilla canónica del reporte de trazabilidad (trace-validate).
- Rellenar solo con datos verificables del repo y del trabajo. No inventar cobertura ni resultados.
- Una fila de matriz por cada criterio de aceptación del trabajo. Los códigos dependen del tipo:
  AC-XXX (historia de usuario), AC-N (work item), GM-XXX (migración / Golden Master).
- Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
- Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Reporte de trazabilidad — {{US-XXX-nombre-corto | WI-XXX-nombre | MG-XXX-slug}}

Fecha: {{YYYY-MM-DD HH:MM}}
Trabajo: {{US-XXX | WI-XXX | MG-XXX}} · Documento: {{ruta-al-documento}}
Tipo: {{historia de usuario | work item | migracion}}
Rama: {{rama}}
Cobertura: {{N}} de {{M}} criterios cubiertos ({{porcentaje}})
Veredicto: {{✅ Aprobado | ❌ Rechazado | ⚠️ Aprobado con observaciones}}

## Resumen

{{1-3 frases: estado general de la cobertura, criterios faltantes/fallidos si los hay, y si se pudo ejecutar automaticamente.}}

## Matriz de trazabilidad

| Criterio | Descripcion | Caso(s) de prueba | Artefactos | Estado | Automatica | Resultado | Observaciones |
|----------|-------------|-------------------|---------------------|--------|------------|-----------|---------------|
| BR-01 / AC-1 / GM-001 | {{Criterio de aceptacion}} | {{TC-…/derivado}} | `ruta/al/test.ext` (unit) | Cubierto | Si | Paso | — |
| SC-01 | {{Escenario}} | {{TC-…/derivado}} | `ruta/al/test.e2e.ext` (e2e) | Parcial | Si | Paso | {{Limite de la cobertura}} |
| SC-02 | {{Escenario}} | — | — | No cubierto | N/A | No ejecutado | {{Hueco: sin prueba asociada}} |

<!--
Valores permitidos:
- Criterio: AC-XXX (US) · AC-N (WI) · GM-XXX (MG)
- Estado: Cubierto | Parcial | No cubierto
- Ejec. auto (segun campo `Automatización` del TC): Si (Automatizada y ejecutada) | No (Automatizable pendiente, o existe pero no se pudo ejecutar) | N/A (Manual por diseño)
- Resultado: Paso | Fallo | No ejecutado
- Tipo de artefacto: unit | integracion | e2e | golden master | manual
- Celdas sin dato: «—»
-->

## Artefactos de prueba automatizada disponibles

| Tipo | Presente | Artefactos |
|------|----------|------------|
| Unit | {{Si / No}} | {{rutas o «—»}} |
| Integracion | {{Si / No}} | {{rutas o «—»}} |
| E2E | {{Si / No}} | {{rutas o «—»}} |

## Ejecucion automatica

| | |
|--|--|
| **Runner detectado** | {{Jest / Vitest / pytest / arnes Golden Master / … / no detectado}} |
| **Comando ejecutado** | `{{comando exacto o «no ejecutado»}}` |
| **Resultado global** | {{X pasaron, Y fallaron, Z omitidos / no ejecutado: razón}} |

## Observaciones y pendientes

- {{Criterio: aclaracion, supuesto a confirmar o accion sugerida. Omitir la seccion si no hay pendientes.}}
