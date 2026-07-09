# Flujo paso a paso, ejecucion automatica y checklist

Referencia detallada del skill `trace-validate`. El `SKILL.md` mantiene el resumen; aqui esta el flujo integro.

---

## Flujo

### Paso 1 — Localizar y leer el trabajo

1. Resolver el tipo y la ubicación del trabajo:
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab].md`.
   - **MG:** `docs/specs/migrations/MG-XXX-{slug}/validation.md` (criterios = casos de Golden Master).
2. Leer el documento y extraer **todos los criterios de aceptacion** con su texto, usando los códigos del tipo (`AC-XXX` para US, `AC-N` para WI, `GM-XXX` para MG).
3. Si no existe la sección de criterios o no hay criterios explicitos, **parar** y reportar (ver «Cuando bloquear» en `SKILL.md`). No continuar con supuestos.

### Paso 2 — Inventariar casos de prueba y artefactos de prueba automatizada

1. Recopilar los **casos de prueba** documentados del proyecto que apliquen al trabajo, si existen. Para cada TC leer su campo **`Automatización`** (`Manual` / `Automatizable` / `Automatizada`) del encabezado: es la fuente declarada de la naturaleza del caso y determina la columna `Automatica` de la matriz (ver Paso 4). Si el TC no trae el campo, inferir la naturaleza desde los artefactos hallados y dejar constancia en Observaciones.
2. Buscar en el repo los **artefactos de prueba** relacionados y clasificarlos por **tipo**:
   - **unit** — pruebas unitarias (p. ej. `*.test.*`, `*.spec.*`, `*_test.*`, carpetas `__tests__/`, `tests/unit/`).
   - **integracion** — pruebas de integracion (carpetas/sufijos `integration`, `it`, `*.integration.*`).
   - **e2e** — pruebas end-to-end (carpetas/sufijos `e2e`, `cypress/`, `playwright/`, `*.e2e.*`).
   - **migracion (Golden Master)** — para `MG-XXX`, los arneses y datos de referencia en `validation/` que comparan salida del destino contra el golden master.
3. Para cada artefacto, registrar su **ruta** y a qué criterio apunta (por nombre del test, describe/it, comentarios o vinculo explicito al criterio).

> El mapeo se infiere del contenido y nombres de los tests, no se inventa. Si un test no puede vincularse con certeza a un criterio, dejarlo en Observaciones en lugar de forzar el mapeo.

### Paso 3 — Mapear cobertura criterio a criterio

Para **cada** criterio del trabajo, determinar:

- **Caso(s) de prueba** que lo validan (documentados o derivados de los tests).
- **Artefacto(s)** de prueba que lo cubren, con su tipo (unit / integracion / e2e / golden master / manual).
- **Estado de cobertura** segun la tabla de «Estados de cobertura» en `SKILL.md`.
- **Observaciones** si hace falta aclaracion (cobertura parcial, ambiguedad, supuesto a confirmar, solo manual, etc.).

### Paso 4 — Intentar ejecucion automatica

1. Detectar el runner del proyecto (ver «Ejecucion automatica» mas abajo).
2. Si es posible, **ejecutar las pruebas** asociadas al trabajo y registrar por artefacto/criterio: si **se pudo ejecutar automaticamente** (`Si` / `No` / `N/A`) y el **resultado** (`Paso` / `Fallo` / `No ejecutado`). La columna `Automatica` se decide por el campo `Automatización` del TC (Paso 2), no solo por si se halló un artefacto:
   - TC `Manual` → `Automatica = N/A` (manual por diseño; no se espera artefacto automatizado).
   - TC `Automatizable` sin artefacto todavía → `Automatica = No` (pendiente de automatizar; distinguirlo del manual en Observaciones).
   - TC `Automatizada` (o con artefacto automatizado hallado) → `Automatica = Si` si el runner permitió ejecutarlo; `No` si existe pero no se pudo ejecutar (con la razón en Observaciones).
3. Si no se puede ejecutar (sin runner, dependencias faltantes, entorno sin red, comando desconocido), registrar ejecucion automatica = `No` con la razon en Observaciones. **No** fabricar resultados.

> Nunca reportar `Paso`/`Fallo` sin haber ejecutado realmente la prueba. Si no se ejecuto, el resultado es `No ejecutado`.

### Paso 5 — Construir la matriz de trazabilidad

Usar la plantilla `assets/trace-report-template.md` (leerla antes de redactar). Sustituir cada `{{…}}` por datos verificables; el reporte publicado no debe conservar placeholders ni el bloque de comentario inicial. La matriz tiene una fila por cada criterio del trabajo con: criterio, descripcion, casos de prueba, artefactos (con tipo), estado, ejecucion automatica, resultado y observaciones. Incluir ademas el resumen de artefactos de prueba automatizada disponibles (unit / integracion / e2e / golden master).

### Paso 6 — Emitir el veredicto

Aplicar la tabla de «Veredicto» (en `SKILL.md`) sobre el conjunto de criterios. El veredicto responde la pregunta central: **¿todos los criterios de aceptacion quedan cubiertos?**

### Paso 7 — Entregar y guardar el reporte

1. Guardar el reporte (sobrescribir si ya existe, salvo que el usuario pida conservar historico):
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]-trace-report.md` (la carpeta de work items es compartida; el nombre lleva el `WI-XXX` para no colisionar).
   - **MG:** `docs/specs/migrations/MG-XXX-{slug}/trace-report.md`.
2. Presentar al usuario el **veredicto** y el reporte. No modificar ningun otro artefacto del repo.

---

## Ejecucion automatica

Detectar el runner sin asumir uno por defecto. Senales habituales:

- **Node / JS / TS:** `package.json` -> scripts `test`, `test:unit`, `test:e2e`; runners Jest, Vitest, Mocha, Playwright, Cypress.
- **Python:** `pytest`, `tox`, `unittest`; `pyproject.toml` / `pytest.ini` / `setup.cfg`.
- **Java/Kotlin:** Maven (`mvn test`), Gradle (`gradle test`).
- **.NET:** `dotnet test`. **Go:** `go test`. **Otros:** segun el ecosistema del repo.
- **Migracion (Golden Master):** el arnes definido en `validation.md` / `validation/` que ejecuta la comparacion contra la salida de referencia.

Reglas:

- Ejecutar de forma **acotada** al trabajo/criterios cuando el runner lo permita (filtrar por archivo, patron o etiqueta); si no, ejecutar la suite relevante.
- Registrar el **comando exacto** usado y el **resultado global** en el reporte.
- Si el entorno **no permite ejecucion** (sin red para instalar dependencias, sin runner, comando desconocido), reportar ejecucion automatica = `No` y explicar la razon; aun asi entregar la matriz de cobertura con los artefactos hallados.
- Para criterios cubiertos por TCs marcados `Manual` (manual por diseño), ejecucion automatica = `N/A`. No confundir con TCs `Automatizable` aún sin artefacto, que van como `No` (pendiente de automatizar).

---

## Checklist

- [ ] Idioma resuelto (preferencia del usuario en la sesion, o idioma de la conversacion)
- [ ] Tipo de trabajo determinado y documento de criterios leido; criterios extraidos con los códigos del tipo
- [ ] Casos de prueba y artefactos (unit / integracion / e2e / golden master) inventariados con su ruta y criterio
- [ ] Cada criterio con estado (Cubierto / Parcial / No cubierto) y observaciones cuando aplica
- [ ] Ejecucion automatica intentada; comando y resultado registrados; sin resultados inventados
- [ ] Matriz construida desde `assets/trace-report-template.md`
- [ ] Resumen de artefactos de prueba automatizada incluido
- [ ] Veredicto emitido respondiendo si **todos** los criterios quedan cubiertos
- [ ] `trace-report.md` guardado en la ubicación del tipo; ningun otro artefacto modificado
