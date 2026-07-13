---
name: trace-validate
description: "Genera un reporte de trazabilidad que valida la cobertura de los criterios de aceptación de un trabajo —una historia de usuario (US-XXX) con sus criterios de aceptación (AC-XXX), un work item de mantenimiento (WI-XXX) con sus criterios de aceptación (AC-XXX), o una migración (MG-XXX) con sus casos de Golden Master (GM-XXX)— contra los casos de prueba y los artefactos de prueba del repositorio (unit, integración, e2e). Para cada criterio indica los casos de prueba y artefactos que lo cubren, un estado (Cubierto / Parcial / No cubierto), observaciones cuando hace falta aclaración, si la prueba se pudo ejecutar automáticamente y su resultado, y finalmente un veredicto sobre si todos los criterios de aceptación quedan cubiertos. Activar siempre que el usuario pida validar cobertura, generar una matriz o reporte de trazabilidad, verificar que los criterios de aceptación están probados, comprobar que un trabajo está cubierto por pruebas, o mencione «trace-validate», «trazabilidad», «matriz de cobertura» o «validar criterios de aceptación», aunque no nombre el formato exacto."
license: MIT
---

# Skill: Validar trazabilidad de un trabajo

Genera un **reporte de trazabilidad** que cruza los **criterios de aceptación** de un trabajo contra los **casos de prueba** y los **artefactos de prueba automatizada** (unit, integración, e2e) presentes en el repositorio, y emite un **veredicto** sobre si el trabajo queda cubierto.

El trazado primario es para **historias de usuario** (`US-XXX`) con sus **criterios de aceptación `AC-XXX`**. Si el trabajo es de otro tipo y **tiene criterios de aceptación**, el trazado se hace con los códigos correspondientes (ver [Tipos de trabajo y criterios](#tipos-de-trabajo-y-criterios)).

> **Qué hace:** lee, mapea, intenta ejecutar las pruebas existentes y reporta. Es una actividad de **verificación**, no de desarrollo.
>
> **Qué NO hace:** no escribe ni modifica código de aplicación, no escribe nuevos tests (eso es de `quality-specialist` vía `work-implement`), no edita la especificación de producto (README de la US, `TK-XXX`, `WI-XXX`, `validation.md`, ADRs). Lo único que produce es el **reporte de trazabilidad**. Lo que no se puede determinar de las fuentes va a **Observaciones** o se pregunta al usuario — nunca se inventa cobertura ni resultados.

---

## Subagente

**Si el proyecto define el subagente `quality-specialist`, ejecutar este skill bajo ese subagente** (es el mismo agente que escribe los tests en el cierre de `work-implement`, por lo que es el contexto natural para validarlos). Si no existe en el proyecto, ejecutar el flujo normalmente.

---

## Tipos de trabajo y criterios

El tipo se determina por el identificador que indique el usuario o por la ruta de trabajo. Cada tipo fija de dónde se leen los criterios de aceptación y con qué códigos se traza.

| Tipo | Identificador | Dónde viven los criterios | Códigos a trazar |
|------|---------------|---------------------------|------------------|
| **Historia de usuario** | `US-XXX` | Sección **Criterios de aceptación** del `README.md` de la US (lista plana `AC-XXX`) | `AC-XXX` en el orden en que aparecen |
| **Work item de mantenimiento** | `WI-XXX` | Sección **## Criterios de aceptación** del `README.md` del WI (`WI-XXX-[kebab]/README.md`) | `AC-XXX` en el orden en que aparecen |
| **Migración** | `MG-XXX` | Casos de **Golden Master** definidos en `validation.md` de la migración | `GM-XXX` (o las variantes `GM-API-XXX` / `GM-UI-XXX` tal como estén en `validation.md`) |
> En todo el flujo, «criterio» se refiere al código del tipo en curso: `AC-XXX` para US y WI, `GM-XXX` para MG. Si el trabajo **no tiene criterios de aceptación**, no hay nada que trazar → **bloquear** (ver «Cuándo bloquear»).

---

## Cómo preguntar al usuario

Cuando este skill indique **preguntar, pedir, confirmar o validar** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (opciones tappables o selector) en lugar de prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2-4 por pregunta) cuando la respuesta admita categorías.
- **No repreguntar** lo que ya esté respondido en el contexto de la sesión o en los documentos del repo.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3...).

---

## Resolución de idioma

El idioma del reporte se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

La salida y los mensajes de error de las herramientas de prueba no se traducen.

---

## Información requerida antes de generar el reporte

No inventar nada. Si un dato no es explícito, obtenerlo del repo o preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Trabajo a validar** | Indicado por el usuario o inferido de la ruta de trabajo; determinar el tipo (`US-XXX` / `WI-XXX` / `MG-XXX`) | Preguntar qué trabajo validar; sin él no se puede generar el reporte |
| **Criterios de aceptación** | Según el tipo (ver [Tipos de trabajo y criterios](#tipos-de-trabajo-y-criterios)) | Si el trabajo no tiene criterios de aceptación: **bloquear** y reportar — sin criterios no hay nada que trazar |
| **Casos de prueba** | Casos de prueba documentados (si el proyecto los tiene) y/o los tests del repo | Si no hay casos documentados, derivar la cobertura desde los artefactos de prueba del repo |
| **Artefactos de prueba** | Buscar en el repo archivos de test unit / integración / e2e relacionados con el trabajo (ver «Inventariar casos y artefactos» en `references/flow.md`). Para migraciones, también los insumos de Golden Master en `validation/` | Si no se encuentran, marcar criterios sin artefacto como `No cubierto` y dejar Observación |
| **Runner de pruebas** | Detectar del proyecto (ver «Ejecución automática» en `references/flow.md`) | Si no se puede determinar el runner: ejecución automática = `No`, con Observación |
| **Alcance** | Todo el trabajo por defecto; el usuario puede acotar a ciertos criterios | Si es ambiguo, preguntar |

> Leer **siempre** el documento de criterios completo (README de la US / `WI-XXX` / `validation.md`) antes de generar el reporte. No asumir criterios que no estén escritos.

---

## Flujo

Resumen de los 7 pasos. El detalle íntegro de cada paso está en **`references/flow.md`** (leerlo antes de ejecutar el flujo).

1. **Localizar y leer el trabajo** — resolver tipo y ubicación; extraer todos los criterios con sus códigos, normalizados a `AC-XXX` (US/WI) o `GM-XXX` (MG). Sin criterios → bloquear (ver «Cuándo bloquear»).
2. **Inventariar casos y artefactos** — recopilar casos documentados y clasificar tests por tipo (unit / integración / e2e / golden master), con ruta y criterio.
3. **Mapear cobertura criterio a criterio** — casos, artefactos, estado (ver «Estados de cobertura») y observaciones. No forzar mapeos inciertos.
4. **Intentar ejecución automática** — detectar runner y ejecutar acotado; registrar ejecución (`Sí`/`No`/`N/A`) y resultado (`Paso`/`Fallo`/`No ejecutado`). Nunca fabricar resultados (ver «Ejecución automática» en `references/flow.md`).
5. **Construir la matriz** desde `assets/trace-report-template.md` (leerla antes de redactar).
6. **Emitir el veredicto** (ver «Veredicto») respondiendo si todos los criterios quedan cubiertos.
7. **Entregar y guardar** el reporte en la ubicación del tipo (ver «Ubicación de archivos»); no modificar otros artefactos.

---

## Estados de cobertura

| Estado | Cuándo aplicarlo |
|--------|------------------|
| **Cubierto** | El criterio tiene al menos un caso de prueba **y** un artefacto que lo valida de forma completa. Si se ejecutó automáticamente, pasó. |
| **Parcial** | El criterio está cubierto solo en parte: hay prueba pero no abarca todo el criterio, solo existe validación manual, el artefacto existe pero no se pudo ejecutar, o el resultado fue parcial. Detallar el límite en Observaciones. |
| **No cubierto** | No existe caso de prueba ni artefacto que valide el criterio, o la prueba asociada **falló**. |

> La cobertura (existe prueba que valida el criterio) es distinta de la ejecución (la prueba corrió y su resultado). Un criterio con prueba que **falló** se reporta como **No cubierto** con el fallo en Observaciones.

---

## Cuándo bloquear

Parar y reportar (sin generar reporte parcial) cuando:

- El trabajo no existe o no tiene su documento de criterios (README de la US / `WI-XXX` / `validation.md`).
- No hay sección de criterios de aceptación o no hay criterios explícitos del tipo (`AC-XXX` para US y WI, `GM-XXX` para MG): no hay nada que trazar; sugerir alinear el trabajo con su skill de definición/planificación antes de validar.

```
WARNING No es posible generar el reporte de trazabilidad:
- <razón concreta>
- <acción sugerida: p. ej. definir los criterios de aceptación del trabajo antes de validar>
```

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Work item | `docs/specs/work-items/WI-XXX-[kebab]/README.md` |
| Migración (criterios) | `docs/specs/migrations/MG-XXX-{slug}/validation.md` (+ `validation/`) |
| Reporte de trazabilidad (salida) | US: `…/US-XXX-[nombre-corto]/trace-report.md` · WI: `docs/specs/work-items/WI-XXX-[kebab]/trace-report.md` · MG: `…/MG-XXX-{slug}/trace-report.md` |

---

## Mensaje al usuario

Solo el veredicto, el resumen de cobertura y lo que el usuario debe saber o decidir (criterios `No cubierto`/`Parcial`, pruebas que fallaron, si no se pudo ejecutar y por qué). No narrar el trabajo en curso («leí el README», «creé el archivo») ni el razonamiento interno. Listar pendientes en viñetas agrupadas por criterio.

---

## Veredicto

| Veredicto | Cuándo aplicarlo |
|-----------|------------------|
| **✅ Aprobado** | **Todos** los criterios del trabajo en estado **Cubierto** y, si se ejecutaron pruebas automáticas, **todas pasaron**. |
| **⚠️ Aprobado con observaciones** | Todos los criterios cubiertos, pero con caveats que el usuario debe conocer: cobertura solo manual, no se pudo ejecutar automáticamente, o algún criterio quedó **Parcial** sin riesgo funcional pendiente de confirmar. |
| **❌ Rechazado** | Al menos un criterio en **No cubierto**, o una prueba asociada **falló**. Listar los criterios faltantes/fallidos. |

---

## Handoffs del ciclo

Posición: **validación / cierre de calidad** — después de `work-implement`.

| | |
|--|--|
| **Entrada** | Trabajo (`US-XXX` / `WI-XXX` / `MG-XXX`) con **criterios de aceptación** (`AC-XXX` para US y WI, `GM-XXX` para MG); código implementado; idealmente tests escritos por `quality-specialist` en el cierre de `work-implement`. |
| **Salida** | `trace-report.md` en la ubicación del tipo + veredicto sobre la cobertura. |
| **Veredicto ❌ Rechazado** | Volver a `work-implement` (fase de pruebas con `quality-specialist`) para cubrir los criterios faltantes; revalidar después. |
| **Falta funcional en el trabajo** | Si la matriz revela que un criterio no es testeable o está mal definido, escalar a la definición/planificación del trabajo — no editar la especificación desde aquí. |

---

## Mapa de referencias

| Archivo | Cuándo leerlo |
|---------|---------------|
| `references/flow.md` | Flujo paso a paso (Pasos 1-7), detección de runners (ejecución automática) y checklist completo. Leer antes de ejecutar el flujo. |
| `references/examples.md` | Ejemplos por tipo (US / WI / MG, sin criterios, sin runner, criterio sin prueba) y anti-patrones. Leer ante dudas de comportamiento. |
| `assets/trace-report-template.md` | Plantilla canónica del reporte de trazabilidad. Leer antes de redactar el reporte. |
