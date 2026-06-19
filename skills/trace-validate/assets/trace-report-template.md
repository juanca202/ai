<!--
Plantilla canonica del reporte de trazabilidad (trace-validate).
- Rellenar solo con datos verificables del repo y de la US. No inventar cobertura ni resultados.
- Una fila de matriz por cada BR-XX y SC-XX de los Criterios de aceptacion de la US.
- Eliminar estos comentarios y cualquier texto entre corchetes [ ] al publicar.
-->

# Reporte de trazabilidad — [US-XXX] [Titulo de la historia]

| | |
|--|--|
| **Historia** | [US-XXX](./README.md) |
| **Rama** | `feature/US-XXX-[nombre-corto]` |
| **Fecha** | [YYYY-MM-DD] |
| **Veredicto** | **[APROBADO — cobertura completa / APROBADO CON OBSERVACIONES / RECHAZADO — cobertura incompleta]** |
| **Cobertura** | [N] de [M] criterios cubiertos ([%]) |

## Resumen

[1-3 frases: estado general de la cobertura, criterios faltantes/fallidos si los hay, y si se pudo ejecutar automaticamente.]

## Matriz de trazabilidad

| Criterio | Descripcion | Caso(s) de prueba | Artefacto(s) (tipo) | Estado | Ejec. auto | Resultado | Observaciones |
|----------|-------------|-------------------|---------------------|--------|------------|-----------|---------------|
| BR-01 | [Regla de negocio] | [TC-…/derivado] | `ruta/al/test.ext` (unit) | Cubierto | Si | Paso | — |
| SC-01 | [Escenario] | [TC-…/derivado] | `ruta/al/test.e2e.ext` (e2e) | Parcial | Si | Paso | [Limite de la cobertura] |
| SC-02 | [Escenario] | — | — | No cubierto | N/A | No ejecutado | [Hueco: sin prueba asociada] |

<!--
Valores permitidos:
- Estado: Cubierto | Parcial | No cubierto
- Ejec. auto: Si | No | N/A (solo manual)
- Resultado: Paso | Fallo | No ejecutado | Manual
- Tipo de artefacto: unit | integracion | e2e | manual
- Celdas sin dato: «—»
-->

## Artefactos de prueba automatizada disponibles

| Tipo | Presente | Artefactos |
|------|----------|------------|
| Unit | [Si / No] | [rutas o «—»] |
| Integracion | [Si / No] | [rutas o «—»] |
| E2E | [Si / No] | [rutas o «—»] |

## Ejecucion automatica

| | |
|--|--|
| **Runner detectado** | [Jest / Vitest / pytest / … / no detectado] |
| **Comando ejecutado** | `[comando exacto o «no ejecutado»]` |
| **Resultado global** | [X pasaron, Y fallaron, Z omitidos / no ejecutado: <razon>] |

## Observaciones y pendientes

- [Criterio: aclaracion, supuesto a confirmar o accion sugerida. Omitir la seccion si no hay pendientes.]
