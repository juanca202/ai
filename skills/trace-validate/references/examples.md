# Ejemplos y anti-patrones

Referencia del skill `trace-validate`. Casos de uso y errores a evitar.

---

## Ejemplos

**Ejemplo 1 — US completa con tests**
- *Entrada:* «Valida la trazabilidad de US-042.»
- *Comportamiento:* lee `US-042/README.md`, extrae los criterios con su identificador verbatim, lee la carpeta `test-cases/` del artefacto e inventaria tests (unit/integración/e2e), mapea cada criterio, obtiene los resultados de pruebas de `quality-check` (caché `test-run.json` fresca o delegación en modo `tests-only`), construye la matriz, guarda `trace-report.md` y reporta el veredicto.

**Ejemplo 2 — Work item con criterios de aceptación**
- *Entrada:* «Valida la cobertura de WI-007.»
- *Comportamiento:* lee `docs/specs/work-items/WI-007-[kebab-case]/README.md`, extrae los criterios de la sección **## Criterios de aceptación** (con el identificador que use el documento, sin normalizar), mapea tests, obtiene los resultados vía `quality-check`, guarda `docs/specs/work-items/WI-007-[kebab-case]/trace-report.md` y emite el veredicto.

**Ejemplo 3 — Trabajo sin criterios**
- *Entrada:* «Genera la matriz de cobertura de US-009» y el README no tiene criterios de aceptación, o los tiene sin identificador.
- *Comportamiento:* bloquea, no genera reporte; informa que faltan criterios de aceptación y sugiere definirlos antes de validar.

**Ejemplo 4 — No se puede ejecutar**
- *Entrada:* «Valida US-015» en un entorno sin runner instalado / sin red, donde `quality-check` no puede correr las suites.
- *Comportamiento:* genera la matriz de cobertura con los artefactos hallados, marca ejecución automática = `No` con la razón, resultados como `No ejecutado`, y emite el veredicto según la cobertura documentada (típicamente ⚠️ Aprobado con observaciones o ❌ Rechazado si falta cobertura).

**Ejemplo 5 — Criterio sin prueba**
- *Entrada:* «Valida US-031.»
- *Comportamiento:* un `AC-003` no tiene ningún test asociado -> estado `No cubierto`, Observación indicando el hueco -> veredicto **❌ Rechazado** listando `AC-003`.

---

## Anti-patrones

- Inventar cobertura, casos de prueba o vínculos criterio-test que no se desprenden del repo.
- Reportar `Paso`/`Fallo` sin que `quality-check` haya ejecutado realmente la prueba (caché fresca o delegación `tests-only`).
- Marcar `Cubierto` un criterio cuya prueba falló: es `No cubierto` si se pudo aislar que el test suyo falló, o `Parcial` si la suite falló sin poder aislarlo (ver «Mapeo a la matriz» en `SKILL.md`).
- Escribir o modificar tests o código de aplicación desde este skill (eso es `quality-specialist` vía `work-implement`).
- Modificar la especificación de producto (README de la US, `TK-XXX`, `WI-XXX`, `validation.md`, ADRs) durante la validación.
- Generar un reporte parcial cuando el trabajo no tiene criterios de aceptación; debe bloquear.
- Ejecutar la suite directamente desde este skill, o asumir un runner: la ejecución se delega **siempre** en `quality-check`.
- Forzar el mapeo de un test a un criterio cuando el vínculo es incierto, en lugar de dejarlo en Observaciones.
- **Normalizar o renombrar el identificador de un criterio** (p. ej. escribir `AC-001` donde el artefacto dice `1.1`): rompe el vínculo con los TCs que produjo `test-define`.
- **Bloquear porque el artefacto no sigue las convenciones del plugin** (formato del identificador, ubicación, campo `Estado:` del **artefacto**). El único requisito es que los criterios tengan identificador. El `Estado:` del **TC** sí se lee: filtra la cobertura (ver «Estados de cobertura»).
- Ignorar la carpeta `test-cases/` del artefacto y su índice, reconstruyendo el mapeo solo por heurística de nombres de test.
- Mapear la suite `coverage` a un criterio: es cobertura de líneas, no funcional.
- Narrar el trabajo realizado al usuario; solo reportar veredicto, cobertura y pendientes.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
