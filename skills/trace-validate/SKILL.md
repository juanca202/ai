---
name: trace-validate
description: "Genera un reporte de trazabilidad que valida la cobertura de los criterios de aceptacion de una historia de usuario (US-XXX) — sus reglas de negocio (BR-XX) y escenarios (SC-XX) — contra los casos de prueba y los artefactos de prueba del repositorio (unit, integracion, e2e). Para cada criterio indica los casos de prueba y artefactos que lo cubren, un estado (Cubierto / Parcial / No cubierto), observaciones cuando hace falta aclaracion, si la prueba se pudo ejecutar automaticamente y su resultado, y finalmente un veredicto sobre si todos los criterios de aceptacion quedan cubiertos. Activar siempre que el usuario pida validar cobertura, generar una matriz o reporte de trazabilidad, verificar que los criterios de aceptacion / escenarios / reglas de negocio estan probados, comprobar que una US esta cubierta por pruebas, o mencione «trace-validate», «trazabilidad», «matriz de cobertura» o «validar criterios de aceptacion», aunque no nombre el formato exacto."
license: MIT
---

# Skill: Validar trazabilidad de una historia de usuario

Genera un **reporte de trazabilidad** que cruza los **criterios de aceptacion** de una historia de usuario (`US-XXX`) —sus **reglas de negocio `BR-XX`** y **escenarios `SC-XX`**— contra los **casos de prueba** y los **artefactos de prueba automatizada** (unit, integracion, e2e) presentes en el repositorio, y emite un **veredicto** sobre si toda la US queda cubierta.

> **Que hace:** lee, mapea, intenta ejecutar las pruebas existentes y reporta. Es una actividad de **verificacion**, no de desarrollo.
>
> **Que NO hace:** no escribe ni modifica codigo de aplicacion, no escribe nuevos tests (eso es de `quality-specialist` via `work-implement`), no edita la especificacion de producto (README de la US, `TK-XXX`, ADRs). Lo unico que produce es el **reporte de trazabilidad**. Lo que no se puede determinar de las fuentes va a **Observaciones** o se pregunta al usuario — nunca se inventa cobertura ni resultados.

---

## Subagente requerido

**Este skill debe ejecutarse bajo el subagente `quality-specialist`** del proyecto cuando exista (es el mismo agente que escribe los tests en el cierre de `work-implement`, por lo que es el contexto natural para validarlos). No ejecutar el flujo normativo sin ese contexto si el proyecto lo define.

---

## Como preguntar al usuario

Cuando este skill indique **preguntar, pedir, confirmar o validar** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (opciones tappables o selector) en lugar de prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2-4 por pregunta) cuando la respuesta admita categorias.
- **No repreguntar** lo que ya este respondido en el contexto, en `.agents/MEMORY.md`, o en los documentos del repo.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3...).

---

## Resolucion de idioma

Orden canonico compartido con el resto del ciclo de trabajo. Detenerse en el primer paso que aplique:

1. **`.agents/MEMORY.md`** (raiz del repo) -> linea `preferred language: <ISO 639-1>` (p. ej. `es`, `en`). Si no existe pero hay claves legacy (`language:`, `idioma:`, `Project language:`), usarlas solo como fallback.
2. **Idioma del turno del usuario** (mensaje actual).
3. **Preguntar al usuario** y persistir la respuesta en `.agents/MEMORY.md` con `preferred language: <codigo>`.

El reporte se redacta en el idioma resuelto.

---

## Informacion requerida antes de generar el reporte

No inventar nada. Si un dato no es explicito, obtenerlo del repo o preguntar al usuario.

| Dato | Como obtenerlo | Si no esta disponible |
|------|----------------|-----------------------|
| **US a validar** | Indicada por el usuario o inferida de la ruta de trabajo | Preguntar que `US-XXX` validar; sin ella no se puede generar el reporte |
| **Criterios de aceptacion** | Seccion **Criterios de aceptacion** del `README.md` de la US (subsecciones *Reglas de negocio* `BR-XX` y *Escenarios* `SC-XX`) | Si faltan `BR-XX`/`SC-XX` explicitos: **bloquear** y reportar — sin criterios no hay nada que trazar |
| **Casos de prueba** | Casos de prueba documentados (si el proyecto los tiene) y/o los tests del repo | Si no hay casos documentados, derivar la cobertura desde los artefactos de prueba del repo |
| **Artefactos de prueba** | Buscar en el repo archivos de test unit / integracion / e2e relacionados con la US (ver «Inventario de artefactos») | Si no se encuentran, marcar criterios sin artefacto como `No cubierto` y dejar Observacion |
| **Runner de pruebas** | Detectar del proyecto (ver «Ejecucion automatica») | Si no se puede determinar el runner: ejecucion automatica = `No`, con Observacion |
| **Alcance** | Toda la US por defecto; el usuario puede acotar a ciertos `SC-XX`/`BR-XX` | Si es ambiguo, preguntar |

> Leer **siempre** el `README.md` completo de la US antes de generar el reporte. No asumir criterios que no esten escritos.

---

## Flujo

### Paso 1 — Localizar y leer la historia de usuario

1. Resolver la carpeta de la US: `docs/specs/user-stories/US-XXX-[nombre-corto]/`.
2. Leer el `README.md` y extraer de **Criterios de aceptacion** todos los identificadores `BR-XX` (reglas de negocio) y `SC-XX` (escenarios) con su texto.
3. Si la seccion no existe o no hay `BR-XX`/`SC-XX` explicitos, **parar** y reportar (ver «Cuando bloquear»). No continuar con supuestos.

### Paso 2 — Inventariar casos de prueba y artefactos de prueba automatizada

1. Recopilar los **casos de prueba** documentados del proyecto que apliquen a la US, si existen.
2. Buscar en el repo los **artefactos de prueba** relacionados y clasificarlos por **tipo**:
   - **unit** — pruebas unitarias (p. ej. `*.test.*`, `*.spec.*`, `*_test.*`, carpetas `__tests__/`, `tests/unit/`).
   - **integracion** — pruebas de integracion (carpetas/sufijos `integration`, `it`, `*.integration.*`).
   - **e2e** — pruebas end-to-end (carpetas/sufijos `e2e`, `cypress/`, `playwright/`, `*.e2e.*`).
3. Para cada artefacto, registrar su **ruta** y a que `BR-XX`/`SC-XX` apunta (por nombre del test, describe/it, comentarios o vinculo explicito al criterio).

> El mapeo se infiere del contenido y nombres de los tests, no se inventa. Si un test no puede vincularse con certeza a un criterio, dejarlo en Observaciones en lugar de forzar el mapeo.

### Paso 3 — Mapear cobertura criterio a criterio

Para **cada** `BR-XX` y `SC-XX`, determinar:

- **Caso(s) de prueba** que lo validan (documentados o derivados de los tests).
- **Artefacto(s)** de prueba que lo cubren, con su tipo (unit / integracion / e2e / manual).
- **Estado de cobertura** segun la tabla de «Estados».
- **Observaciones** si hace falta aclaracion (cobertura parcial, ambiguedad, supuesto a confirmar, solo manual, etc.).

### Paso 4 — Intentar ejecucion automatica

1. Detectar el runner del proyecto (ver «Ejecucion automatica»).
2. Si es posible, **ejecutar las pruebas** asociadas a la US y registrar por artefacto/criterio: si **se pudo ejecutar automaticamente** (`Si` / `No` / `N/A` para pruebas manuales) y el **resultado** (`Paso` / `Fallo` / `No ejecutado`).
3. Si no se puede ejecutar (sin runner, dependencias faltantes, entorno sin red, comando desconocido), registrar ejecucion automatica = `No` con la razon en Observaciones. **No** fabricar resultados.

> Nunca reportar `Paso`/`Fallo` sin haber ejecutado realmente la prueba. Si no se ejecuto, el resultado es `No ejecutado`.

### Paso 5 — Construir la matriz de trazabilidad

Usar la plantilla `assets/trace-report-template.md` (leerla antes de redactar). La matriz tiene una fila por cada `BR-XX` y `SC-XX` con: criterio, descripcion, casos de prueba, artefactos (con tipo), estado, ejecucion automatica, resultado y observaciones. Incluir ademas el resumen de artefactos de prueba automatizada disponibles (unit / integracion / e2e).

### Paso 6 — Emitir el veredicto

Aplicar la tabla de «Veredicto» sobre el conjunto de criterios. El veredicto responde la pregunta central: **¿todos los criterios de aceptacion quedan cubiertos?**

### Paso 7 — Entregar y guardar el reporte

1. Guardar el reporte en `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md` (sobrescribir si ya existe, salvo que el usuario pida conservar historico).
2. Presentar al usuario el **veredicto** y el reporte. No modificar ningun otro artefacto del repo.

---

## Estados de cobertura

| Estado | Cuando aplicarlo |
|--------|------------------|
| **Cubierto** | El criterio tiene al menos un caso de prueba **y** un artefacto que lo valida de forma completa. Si se ejecuto automaticamente, paso. |
| **Parcial** | El criterio esta cubierto solo en parte: hay prueba pero no abarca todo el criterio, solo existe validacion manual, el artefacto existe pero no se pudo ejecutar, o el resultado fue parcial. Detallar el limite en Observaciones. |
| **No cubierto** | No existe caso de prueba ni artefacto que valide el criterio, o la prueba asociada **fallo**. |

> La cobertura (existe prueba que valida el criterio) es distinta de la ejecucion (la prueba corrio y su resultado). Un criterio con prueba que **fallo** se reporta como **No cubierto** con el fallo en Observaciones.

---

## Ejecucion automatica

Detectar el runner sin asumir uno por defecto. Senales habituales:

- **Node / JS / TS:** `package.json` -> scripts `test`, `test:unit`, `test:e2e`; runners Jest, Vitest, Mocha, Playwright, Cypress.
- **Python:** `pytest`, `tox`, `unittest`; `pyproject.toml` / `pytest.ini` / `setup.cfg`.
- **Java/Kotlin:** Maven (`mvn test`), Gradle (`gradle test`).
- **.NET:** `dotnet test`. **Go:** `go test`. **Otros:** segun el ecosistema del repo.

Reglas:

- Ejecutar de forma **acotada** a la US/criterios cuando el runner lo permita (filtrar por archivo, patron o etiqueta); si no, ejecutar la suite relevante.
- Registrar el **comando exacto** usado y el **resultado global** en el reporte.
- Si el entorno **no permite ejecucion** (sin red para instalar dependencias, sin runner, comando desconocido), reportar ejecucion automatica = `No` y explicar la razon; aun asi entregar la matriz de cobertura con los artefactos hallados.
- Para criterios validados solo manualmente, ejecucion automatica = `N/A`.

---

## Cuando bloquear

Parar y reportar (sin generar reporte parcial) cuando:

- La US no existe o no tiene `README.md`.
- No hay seccion **Criterios de aceptacion** o no hay `BR-XX`/`SC-XX` explicitos: no hay nada que trazar; sugerir alinear la US con el skill de definicion antes de validar.

```
WARNING No es posible generar el reporte de trazabilidad:
- <razon concreta>
- <accion sugerida: p. ej. definir BR/SC en la US antes de validar>
```

---

## Ubicacion de archivos

| Artefacto | Ruta |
|-----------|------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Reporte de trazabilidad (salida) | `docs/specs/user-stories/US-XXX-[nombre-corto]/trace-report.md` |
| Tareas | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[nombre].md` |
| Progreso | `docs/specs/user-stories/US-XXX-[nombre-corto]/progress.md` |

---

## Mensaje al usuario

Solo el veredicto, el resumen de cobertura y lo que el usuario debe saber o decidir (criterios `No cubierto`/`Parcial`, pruebas que fallaron, si no se pudo ejecutar y por que). No narrar el trabajo en curso («lei el README», «cree el archivo») ni el razonamiento interno. Listar pendientes en viñetas agrupadas por criterio.

---

## Checklist

- [ ] Idioma resuelto (y `.agents/MEMORY.md` actualizado si hizo falta)
- [ ] `README.md` de la US leido; `BR-XX` y `SC-XX` extraidos de **Criterios de aceptacion**
- [ ] Casos de prueba y artefactos (unit / integracion / e2e) inventariados con su ruta y criterio
- [ ] Cada `BR-XX`/`SC-XX` con estado (Cubierto / Parcial / No cubierto) y observaciones cuando aplica
- [ ] Ejecucion automatica intentada; comando y resultado registrados; sin resultados inventados
- [ ] Matriz construida desde `assets/trace-report-template.md`
- [ ] Resumen de artefactos de prueba automatizada (unit / integracion / e2e) incluido
- [ ] Veredicto emitido respondiendo si **todos** los criterios quedan cubiertos
- [ ] `trace-report.md` guardado en la carpeta de la US; ningun otro artefacto modificado

---

## Veredicto

| Veredicto | Cuando aplicarlo |
|-----------|------------------|
| **APROBADO — cobertura completa** | **Todos** los `BR-XX` y `SC-XX` en estado **Cubierto** y, si se ejecutaron pruebas automaticas, **todas pasaron**. |
| **APROBADO CON OBSERVACIONES** | Todos los criterios cubiertos, pero con caveats que el usuario debe conocer: cobertura solo manual, no se pudo ejecutar automaticamente, o algun criterio quedo **Parcial** sin riesgo funcional pendiente de confirmar. |
| **RECHAZADO — cobertura incompleta** | Al menos un `BR-XX` o `SC-XX` en **No cubierto**, o una prueba asociada **fallo**. Listar los criterios faltantes/fallidos. |

---

## Ejemplos

**Ejemplo 1 — US completa con tests**
- *Entrada:* «Valida la trazabilidad de US-042.»
- *Comportamiento:* lee `US-042/README.md`, extrae BR/SC, inventaria tests (unit/integracion/e2e), mapea cada criterio, ejecuta `npm test` acotado a la US, construye la matriz, guarda `trace-report.md` y reporta el veredicto.

**Ejemplo 2 — US sin criterios**
- *Entrada:* «Genera la matriz de cobertura de US-009» y el README no tiene `BR-XX`/`SC-XX`.
- *Comportamiento:* bloquea, no genera reporte; informa que faltan criterios de aceptacion y sugiere definirlos antes de validar.

**Ejemplo 3 — No se puede ejecutar**
- *Entrada:* «Valida US-015» en un entorno sin runner instalado / sin red.
- *Comportamiento:* genera la matriz de cobertura con los artefactos hallados, marca ejecucion automatica = `No` con la razon, resultados como `No ejecutado`, y emite el veredicto segun la cobertura documentada (tipicamente APROBADO CON OBSERVACIONES o RECHAZADO si falta cobertura).

**Ejemplo 4 — Criterio sin prueba**
- *Entrada:* «Valida US-031.»
- *Comportamiento:* un `SC-03` no tiene ningun test asociado -> estado `No cubierto`, Observacion indicando el hueco -> veredicto **RECHAZADO** listando `SC-03`.

---

## Anti-patrones

- Inventar cobertura, casos de prueba o vinculos criterio-test que no se desprenden del repo.
- Reportar `Paso`/`Fallo` sin haber ejecutado realmente la prueba.
- Marcar `Cubierto` un criterio cuya prueba fallo (es `No cubierto`).
- Escribir o modificar tests o codigo de aplicacion desde este skill (eso es `quality-specialist` via `work-implement`).
- Modificar la especificacion de producto (README de la US, `TK-XXX`, ADRs) durante la validacion.
- Generar un reporte parcial cuando la US no tiene `BR-XX`/`SC-XX`; debe bloquear.
- Asumir un runner por defecto sin detectarlo en el repo.
- Forzar el mapeo de un test a un criterio cuando el vinculo es incierto, en lugar de dejarlo en Observaciones.
- Narrar el trabajo realizado al usuario; solo reportar veredicto, cobertura y pendientes.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.

---

## Handoffs del ciclo

Posicion: **validacion / cierre de calidad** — despues de `work-implement`.

| | |
|--|--|
| **Entrada** | US `Ready` con **Criterios de aceptacion** (`BR-XX`, `SC-XX`); codigo implementado; idealmente tests escritos por `quality-specialist` en el cierre de `work-implement`. |
| **Salida** | `trace-report.md` en la carpeta de la US + veredicto sobre la cobertura. |
| **Veredicto RECHAZADO** | Volver a `work-implement` (fase de pruebas con `quality-specialist`) para cubrir los criterios faltantes; revalidar despues. |
| **Falta funcional en la US** | Si la matriz revela que un criterio no es testeable o esta mal definido, escalar a la definicion de la US — no editar el README desde aqui. |

---

## Mapa de referencias

| Archivo | Cuando leerlo |
|---------|---------------|
| `assets/trace-report-template.md` | Plantilla canonica del reporte de trazabilidad. Leer antes de redactar el reporte. |
