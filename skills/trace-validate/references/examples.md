# Ejemplos y anti-patrones

Referencia del skill `trace-validate`. Casos de uso y errores a evitar.

---

## Ejemplos

**Ejemplo 1 — US completa con tests**
- *Entrada:* «Valida la trazabilidad de US-042.»
- *Comportamiento:* lee `US-042/README.md`, extrae BR/SC, inventaria tests (unit/integracion/e2e), mapea cada criterio, ejecuta `npm test` acotado a la US, construye la matriz, guarda `trace-report.md` y reporta el veredicto.

**Ejemplo 2 — Work item con Criterios de aceptacion**
- *Entrada:* «Valida la cobertura de WI-007.»
- *Comportamiento:* lee `docs/specs/work-items/WI-007-*.md`, extrae los ítems de **## Criterios de aceptacion** (los referencia `AC-1`, `AC-2`…), mapea tests, ejecuta lo que pueda, guarda `WI-007-*-trace-report.md` y emite el veredicto.

**Ejemplo 3 — Migración por Golden Master**
- *Entrada:* «Genera la matriz de cobertura de MG-003.»
- *Comportamiento:* lee `MG-003-*/validation.md`, extrae los casos `GM-XXX`, mapea cada caso a su arnes/insumos en `validation/`, ejecuta el Golden Master si el entorno lo permite, guarda `trace-report.md` en la carpeta de la migración y emite el veredicto.

**Ejemplo 4 — Trabajo sin criterios**
- *Entrada:* «Genera la matriz de cobertura de US-009» y el README no tiene `AC-XXX` (o el WI no tiene Criterios de aceptacion).
- *Comportamiento:* bloquea, no genera reporte; informa que faltan criterios de aceptacion y sugiere definirlos antes de validar.

**Ejemplo 5 — No se puede ejecutar**
- *Entrada:* «Valida US-015» en un entorno sin runner instalado / sin red.
- *Comportamiento:* genera la matriz de cobertura con los artefactos hallados, marca ejecucion automatica = `No` con la razon, resultados como `No ejecutado`, y emite el veredicto segun la cobertura documentada (tipicamente ⚠️ Aprobado con observaciones o ❌ Rechazado si falta cobertura).

**Ejemplo 6 — Criterio sin prueba**
- *Entrada:* «Valida US-031.»
- *Comportamiento:* un `SC-03` no tiene ningun test asociado -> estado `No cubierto`, Observacion indicando el hueco -> veredicto **❌ Rechazado** listando `SC-03`.

---

## Anti-patrones

- Inventar cobertura, casos de prueba o vinculos criterio-test que no se desprenden del repo.
- Reportar `Paso`/`Fallo` sin haber ejecutado realmente la prueba.
- Marcar `Cubierto` un criterio cuya prueba fallo (es `No cubierto`).
- Escribir o modificar tests o codigo de aplicacion desde este skill (eso es `quality-specialist` via `work-implement`).
- Modificar la especificacion de producto (README de la US, `TK-XXX`, `WI-XXX`, `validation.md`, ADRs) durante la validacion.
- Generar un reporte parcial cuando el trabajo no tiene criterios de aceptacion; debe bloquear.
- Asumir un runner por defecto sin detectarlo en el repo.
- Forzar el mapeo de un test a un criterio cuando el vinculo es incierto, en lugar de dejarlo en Observaciones.
- Narrar el trabajo realizado al usuario; solo reportar veredicto, cobertura y pendientes.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
