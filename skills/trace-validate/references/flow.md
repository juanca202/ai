# Flujo paso a paso, ejecución automática y checklist

Referencia detallada del skill `trace-validate`. El `SKILL.md` mantiene el resumen; aquí está el flujo íntegro.

---

## Flujo

### Paso 1 — Localizar y leer el trabajo

1. Resolver el tipo y la ubicación del trabajo:
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab].md`.
   - **MG:** `docs/specs/migrations/MG-XXX-{slug}/validation.md` (criterios = casos de Golden Master).
2. Leer el documento y extraer **todos los criterios de aceptación** con su texto, usando los códigos del tipo (`AC-XXX` para US y WI, `GM-XXX` para MG). Si el artefacto usa otro formato de código (`AC-1`, `CA-1`, `BR-01`, `SC-01`…), normalizarlo a `AC-XXX` al referenciarlo en el reporte.
3. Si no existe la sección de criterios o no hay criterios explícitos, **parar** y reportar (ver «Cuándo bloquear» en `SKILL.md`). No continuar con supuestos.

### Paso 2 — Inventariar casos de prueba y artefactos de prueba automatizada

1. Recopilar los **casos de prueba** documentados del proyecto que apliquen al trabajo, si existen. Para cada TC leer su campo **`Automatización`** (`Manual` / `Automatizable`) del encabezado: declara la **intención de diseño** del caso (el TC se escribe antes de implementar, por eso no existe un valor "Automatizada"). Esa intención es la fuente para decidir la columna `Automática` de la matriz (ver Paso 4): el **estado real** —si ya está automatizada y con qué resultado— lo determina este skill al validar, no el TC. Si el TC no trae el campo, inferir la naturaleza desde los artefactos hallados y dejar constancia en Observaciones. Si la etiqueta trae entre paréntesis un **tipo de prueba sugerido** (`Unit` / `Integration` / `E2E` / `API Test` / `Visual Test`), usarlo como pista del tipo de artefacto esperado al buscar y clasificar; si el artefacto hallado no coincide con el tipo sugerido, anotarlo en Observaciones sin forzar el mapeo.
2. Buscar en el repo los **artefactos de prueba** relacionados y clasificarlos por **tipo**:
   - **unit** — pruebas unitarias (p. ej. `*.test.*`, `*.spec.*`, `*_test.*`, carpetas `__tests__/`, `tests/unit/`).
   - **integración** — pruebas de integración (carpetas/sufijos `integration`, `it`, `*.integration.*`).
   - **e2e** — pruebas end-to-end (carpetas/sufijos `e2e`, `cypress/`, `playwright/`, `*.e2e.*`).
   - **migración (Golden Master)** — para `MG-XXX`, los arneses y datos de referencia en `validation/` que comparan salida del destino contra el golden master.
3. Para cada artefacto, registrar su **ruta** y a qué criterio apunta (por nombre del test, describe/it, comentarios o vínculo explícito al criterio).

> El mapeo se infiere del contenido y nombres de los tests, no se inventa. Si un test no puede vincularse con certeza a un criterio, dejarlo en Observaciones en lugar de forzar el mapeo.

### Paso 3 — Mapear cobertura criterio a criterio

Para **cada** criterio del trabajo, determinar:

- **Caso(s) de prueba** que lo validan (documentados o derivados de los tests).
- **Artefacto(s)** de prueba que lo cubren, con su tipo (unit / integración / e2e / golden master / manual).
- **Estado de cobertura** según la tabla de «Estados de cobertura» en `SKILL.md`.
- **Observaciones** si hace falta aclaración (cobertura parcial, ambigüedad, supuesto a confirmar, solo manual, etc.).

### Paso 4 — Intentar ejecución automática

1. Detectar el runner del proyecto (ver «Ejecución automática» más abajo).
2. Si es posible, **ejecutar las pruebas** asociadas al trabajo y registrar por artefacto/criterio: si **se pudo ejecutar automáticamente** (`Sí` / `No` / `N/A`) y el **resultado** (`Paso` / `Fallo` / `No ejecutado`). La columna `Automática` combina la intención del TC (Paso 2) con lo hallado/ejecutado en el repo:
   - TC `Manual` → `Automática = N/A` (manual por diseño; no se espera artefacto automatizado).
   - TC `Automatizable` **sin** artefacto todavía → `Automática = No` (pendiente de automatizar; distinguirlo del manual en Observaciones).
   - TC `Automatizable` **con** artefacto automatizado hallado → `Automática = Sí` si el runner permitió ejecutarlo (registrar `Resultado`); `No` si existe pero no se pudo ejecutar (con la razón en Observaciones).
3. Si no se puede ejecutar (sin runner, dependencias faltantes, entorno sin red, comando desconocido), registrar ejecución automática = `No` con la razón en Observaciones. **No** fabricar resultados.

> Nunca reportar `Paso`/`Fallo` sin haber ejecutado realmente la prueba. Si no se ejecutó, el resultado es `No ejecutado`.

### Paso 5 — Construir la matriz de trazabilidad

Usar la plantilla `assets/trace-report-template.md` (leerla antes de redactar). Sustituir cada `{{…}}` por datos verificables; el reporte publicado no debe conservar placeholders ni el bloque de comentario inicial. La matriz tiene una fila por cada criterio del trabajo con: criterio, descripción, casos de prueba, artefactos (con tipo), estado, ejecución automática, resultado y observaciones. Incluir además el resumen de artefactos de prueba automatizada disponibles (unit / integración / e2e / golden master).

### Paso 6 — Emitir el veredicto

Aplicar la tabla de «Veredicto» (en `SKILL.md`) sobre el conjunto de criterios. El veredicto responde la pregunta central: **¿todos los criterios de aceptación quedan cubiertos?**

### Paso 7 — Entregar y guardar el reporte

1. Guardar el reporte (sobrescribir si ya existe, salvo que el usuario pida conservar histórico):
   - **US:** `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md`.
   - **WI:** `docs/specs/work-items/WI-XXX-[kebab]-trace-report.md` (la carpeta de work items es compartida; el nombre lleva el `WI-XXX` para no colisionar).
   - **MG:** `docs/specs/migrations/MG-XXX-{slug}/trace-report.md`.
2. Presentar al usuario el **veredicto** y el reporte. No modificar ningún otro artefacto del repo.

---

## Ejecución automática

Detectar el runner sin asumir uno por defecto. Señales habituales:

- **Node / JS / TS:** `package.json` -> scripts `test`, `test:unit`, `test:e2e`; runners Jest, Vitest, Mocha, Playwright, Cypress.
- **Python:** `pytest`, `tox`, `unittest`; `pyproject.toml` / `pytest.ini` / `setup.cfg`.
- **Java/Kotlin:** Maven (`mvn test`), Gradle (`gradle test`).
- **.NET:** `dotnet test`. **Go:** `go test`. **Otros:** según el ecosistema del repo.
- **Migración (Golden Master):** el arnés definido en `validation.md` / `validation/` que ejecuta la comparación contra la salida de referencia.

Reglas:

- Ejecutar de forma **acotada** al trabajo/criterios cuando el runner lo permita (filtrar por archivo, patrón o etiqueta); si no, ejecutar la suite relevante.
- Registrar el **comando exacto** usado y el **resultado global** en el reporte.
- Si el entorno **no permite ejecución** (sin red para instalar dependencias, sin runner, comando desconocido), reportar ejecución automática = `No` y explicar la razón; aun así entregar la matriz de cobertura con los artefactos hallados.
- Para criterios cubiertos por TCs marcados `Manual` (manual por diseño), ejecución automática = `N/A`. No confundir con TCs `Automatizable` aún sin artefacto, que van como `No` (pendiente de automatizar).

---

## Checklist

- [ ] Idioma resuelto (preferencia del usuario en la sesión, o idioma de la conversación)
- [ ] Tipo de trabajo determinado y documento de criterios leído; criterios extraídos con los códigos del tipo, normalizados a `AC-XXX` (US/WI) o `GM-XXX` (MG)
- [ ] Casos de prueba y artefactos (unit / integración / e2e / golden master) inventariados con su ruta y criterio
- [ ] Cada criterio con estado (Cubierto / Parcial / No cubierto) y observaciones cuando aplica
- [ ] Ejecución automática intentada; comando y resultado registrados; sin resultados inventados
- [ ] Matriz construida desde `assets/trace-report-template.md`
- [ ] Resumen de artefactos de prueba automatizada incluido
- [ ] Veredicto emitido respondiendo si **todos** los criterios quedan cubiertos
- [ ] `trace-report.md` guardado en la ubicación del tipo; ningún otro artefacto modificado
