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
- *Comportamiento:* genera las dos tablas con los artefactos hallados; las filas con artefacto van `Ejecución = —` / `Resultado = No ejecutado` con la razón, y las filas sin artefacto siguen en `No cubierto`. Emite el veredicto según la cobertura documentada (típicamente ⚠️ Aprobado con observaciones o ❌ Rechazado si falta cobertura).

**Ejemplo 5 — Criterio sin prueba**
- *Entrada:* «Valida US-031.»
- *Comportamiento:* un `AC-003` no tiene ningún test asociado -> fila única `AC-003 | — | — | — | — | No cubierto`, estado del criterio `No cubierto`, Observación indicando el hueco -> veredicto **❌ Rechazado** listando `AC-003`.

**Ejemplo 6 — TC con dos tipos declarados y solo uno automatizado**
- *Entrada:* «Valida US-058», donde `TC-001` declara `Tipo de prueba: Unit, E2E` y en el repo solo existe el test unitario.
- *Comportamiento:* la matriz produce **dos filas** para el mismo TC:

  | Criterio | TC | Tipo | Evidencia | Ejecución | Resultado |
  |----------|-----|------|-----------|-----------|-----------|
  | AC-2.1 | TC-001 | Unit | `tests/unit/notify.test.ts` | quality-check | Paso |
  | AC-2.1 | TC-001 | E2E | — | — | No cubierto |

  El criterio queda en **Parcial** (no `Cubierto`: la intención E2E no está materializada), con la Observación «E2E declarado en TC-001 sin automatizar» y veredicto **⚠️ Aprobado con observaciones** si no hay ningún criterio en `No cubierto`.

---

## Anti-patrones

- **Regenerar el reporte cuando el existente está fresco** (coinciden los dos hashes, sin filas `No ejecutado` y sin `revalidate`): sería idéntico y obliga a redelegar la ejecución de pruebas. Devolver el existente.
- A la inversa: **devolver un reporte cacheado** cuyo `fingerprint` o `spec` no coincide, uno **sin** marca de pie, o uno que registra una ejecución que no se pudo hacer — ese `⚠️` describe un fallo de entorno, no del código, y congelarlo lo vuelve permanente.
- **Comparar solo el `fingerprint` y olvidar el `spec`**: es justo la mitad que detecta que los criterios de aceptación o los `TC-XXX` cambiaron. Sin ella, una US con criterios reescritos pasaría la puerta con un ✅ que traza criterios que ya no existen.
- **Publicar el reporte sin la marca de pie del fingerprint** (sí se eliminan los bloques de instrucciones de la plantilla, no la marca): sin ella, la próxima corrida no puede reutilizarlo.
- Inventar cobertura, casos de prueba o vínculos criterio-test que no se desprenden del repo.
- Reportar `Paso`/`Fallo` sin que `quality-check` haya ejecutado realmente la prueba (caché fresca o delegación `tests-only`).
- Marcar `Cubierto` un criterio cuya prueba falló: es `No cubierto` si se pudo aislar que el test suyo falló, o `Parcial` si la suite falló sin poder aislarlo (ver «Mapeo a la matriz» en `SKILL.md`).
- Escribir o modificar tests o código de aplicación desde este skill (eso es `quality-specialist` vía `work-implement`).
- Modificar la especificación de producto (README de la US, `TK-XXX`, `WI-XXX`, `validation.md`, ADRs) durante la validación.
- Generar un reporte parcial cuando el trabajo no tiene criterios de aceptación; debe bloquear.
- Ejecutar la suite directamente desde este skill, o asumir un runner: la ejecución se delega **siempre** en `quality-check`.
- Forzar el mapeo de un test a un criterio cuando el vínculo es incierto, en lugar de dejarlo en «Observaciones y pendientes».
- **Confundir los dos destinos de observación:** lo atribuible a un criterio va en la columna `Observaciones` de «Cobertura por criterio»; lo que es de la corrida (suite `coverage` en `FAIL`, árbol sucio, ejecución no delegable, tests no vinculables) va en la sección «Observaciones y pendientes».
- Inventar un resultado global agregado de la corrida: `test-run.json` da `result` **por suite**, no un total.
- **Normalizar o renombrar el identificador de un criterio** (p. ej. escribir `AC-001` donde el artefacto dice `1.1`): rompe el vínculo con los TCs que produjo `test-define`.
- **Bloquear porque el artefacto no sigue las convenciones del plugin** (formato del identificador, ubicación, campo `Estado:` del **artefacto**). El único requisito es que los criterios tengan identificador. El `Estado:` del **TC** sí se lee: filtra la cobertura (ver «Estados de cobertura»).
- Ignorar la carpeta `test-cases/` del artefacto y su índice, reconstruyendo el mapeo solo por heurística de nombres de test.
- Mapear la suite `coverage` a un criterio: es cobertura de líneas, no funcional.
- **Colapsar en una sola fila un TC que declara varios tipos de prueba** (p. ej. `Unit, E2E`): esconde el tipo no automatizado tras el que sí existe. Una fila por tipo declarado.
- **Omitir las filas `No cubierto`** de la matriz porque «no aportan»: son precisamente el hueco que el reporte existe para hacer visible.
- Reportar `Paso`/`Fallo` en una fila cuya `Evidencia` es `—`: sin artefacto no hay nada que ejecutar.
- Dejar el identificador del criterio en blanco en las filas 2..N del mismo criterio para «agrupar» visualmente: rompe la búsqueda literal y la lectura en diffs.
- Narrar el trabajo realizado al usuario; solo reportar veredicto, cobertura y pendientes.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
