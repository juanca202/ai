---
name: work-define
description: Crear o actualizar una Historia de Usuario. Usar cuando se necesite crear, documentar, actualizar o estandarizar historias de usuario. Activar cuando el usuario solicite una nueva historia de usuario, describa una necesidad funcional, pida refinar requisitos, estructurar funcionalidades o alinear historias existentes a las convenciones del proyecto. El ID de una US archivada en docs/archive/ sigue ocupado, y una US archivada no se actualiza sin desarchivarla antes.
license: MIT
---

# Skill: Historia de usuario

Guía para **crear o actualizar** historias de usuario en el repo del producto.

> **Alcance de una US:** El `README.md` es un documento **funcional**. Registra el valor para el usuario, los **criterios de aceptación** (lista plana con ids `AC-XXX`, categoría entre paréntesis y enunciado RFC 2119) y el estado de avance. El detalle de implementación (DTOs, endpoints, esquemas) va en `docs/specs/technical-docs/` — creado y mantenido por el skill **`design-define`**, nunca directamente desde aquí — o en tareas `TK-XXX`, nunca en la narrativa de la historia. Los documentos técnicos **no son parte de la descripción funcional**; se enlazan desde la sección Referencias de la US y pueden citarse para justificar criterios de INVEST o condiciones del DoR.

La plantilla canónica está en `assets/user-story-template.md` (léela antes de escribir cualquier US).

## Mapa de referencias

Carga el archivo correspondiente cuando vayas a ejecutar la tarea; el detalle íntegro vive en `references/`.

| Necesitas… | Archivo |
| ---------- | ------- |
| Flujo paso a paso de **crear** y **actualizar**, cómo preguntar al usuario, validación antes de crear, checklist completo, ejemplos, anti-patrones y handoffs del ciclo | [`references/flow.md`](references/flow.md) |
| Cómo ordenar y encadenar IDs al proponer **varias historias en una misma invocación** (migración descompuesta, o varias funcionalidades relacionadas pedidas juntas) | [`references/flow.md`](references/flow.md#flujo-proponer-varias-historias-en-una-misma-invocación) |
| Detalle de **RFC 2119** (tabla de modalidades), **ISO 25010** (categorías de criterios de aceptación no funcionales), rúbrica **INVEST** y **DoR** ampliado | [`references/quality-criteria.md`](references/quality-criteria.md) |
| Estructura del `README.md` de una US | [`assets/user-story-template.md`](assets/user-story-template.md) |


### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`../../reference/language.md`](../../reference/language.md): **Idioma** — resolución obligatoria del idioma de artefactos y mensajes. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*
- [`../../reference/planning.md`](../../reference/planning.md): **Política de planificación** — si se pregunta, se invoca automáticamente o nunca se sugiere `test-define` al dejar la US en Ready. *Lectura obligatoria antes de ejecutar el skill.*

---

## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

---

## Política de planificación

Antes de ejecutar este skill, DEBES leer [`../../reference/planning.md`](../../reference/planning.md).

Las reglas de `planning.md` son obligatorias y determinan, vía `specification.testCases.mode`, si al dejar la US en `Ready` se pregunta si definir los casos de prueba (`ask`, comportamiento por defecto), se invoca `/test-define` automáticamente sin preguntar (`always`), o nunca se sugiere ni se invoca (`never`). La otra clave del objeto, `askDetails`, **no la consume este skill**: la lee `test-define`. Ver [Flujo (resumen)](#flujo-resumen).

No continúes hasta haber leído y aplicado `planning.md`.

---

## Ubicación de archivos

Layout completo del harness, identificadores y contrato de archivado: [`../../reference/artifacts.md`](../../reference/artifacts.md).

Lo propio de este skill:

| Artefacto | Ruta |
| --------- | ---- |
| Historia de usuario (**salida**) | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Archivos de apoyo | `docs/specs/user-stories/US-XXX-[nombre-corto]/assets/` |
| Documentación técnica (solo lectura) | `docs/specs/technical-docs/[capability].md` — propiedad de `design-define`; este skill la referencia, nunca la crea ni la edita |
| Glosario (opcional) | `docs/specs/glossary.md` |

> **Las US archivadas siguen contando.** El siguiente `US-XXX` libre se calcula sobre la ruta activa **y** sobre `docs/archive/user-stories/`, y el flujo *Actualizar* busca ahí la historia cuando no está en la activa.

### Convenciones del nombre de carpeta

> Reglas comunes de slug e identificadores: [`../../reference/artifacts.md`](../../reference/artifacts.md). Lo específico de las US:

- Formato: `US-XXX-[nombre-corto]` con `US-XXX` en mayúsculas y número de 3 dígitos.
- Nombre corto: minúsculas, kebab-case, sin artículos ni palabras vacías.
- Si esta historia se vincula manualmente a un work item de un sistema de seguimiento externo (ver `Work Item (<sistema>)` en la plantilla), el nombre completo `US-XXX-[nombre-corto]` debe respetar el límite de longitud de título que imponga ese sistema; si el nombre corto propuesto lo supera, acortarlo antes de crear la carpeta.
- Ejemplos: `US-001-seleccion-item-sdp-desde-receta`, `US-004-resumen-costos-receta`.
- Archivos de apoyo en `assets/`; enlazarlos desde Referencias con rutas relativas, p. ej. `![Descripción](assets/nombre.png)`.

---

## Información requerida antes de redactar

Antes de crear o editar cualquier US, el agente debe tener clara la siguiente información. **No inventar nada** — si algún dato no es explícito, preguntar al usuario.


| Dato                                            | Cómo obtenerlo                                                                           | Si no está disponible                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Actor y valor de negocio**                    | Del contexto o descripción del usuario                                                   | Preguntar al usuario                                                                  |
| **Criterios de aceptación (AC-XXX)**            | Del contexto o descripción del usuario                                                   | Preguntar; sin al menos un `AC-XXX` INVEST no es valorable y la historia solo puede crearse en Draft |
| **Referencias de diseño** (solo US de UI)       | Figma, prototipos u otros enlaces aportados por el usuario                               | Sin ellas la historia no puede declararse Ready                                       |
| **Dependencias con otras US o sistemas**        | Indicadas por el usuario o inferibles del contexto                                       | Preguntar; afectan las dimensiones I y E de INVEST                                    |
| **ID de la US**                                 | Proporcionado por el usuario                                                             | Inferir el siguiente libre revisando carpetas `US-`* en `docs/specs/user-stories/` **y en `docs/archive/user-stories/`** (archivar no libera el ID) |
| **Repositorios afectados**                      | Proporcionados por el usuario o inferibles del repo                                      | Sin ellos la historia no puede declararse Ready                                       |


> El único dato estrictamente obligatorio para crear la historia es tener identificado el actor y el valor de negocio. Si INVEST no es completamente valorable con la información disponible, la historia se crea con `Estado: Draft` y las lagunas documentadas en Observaciones. El estado **Ready** requiere todos los datos sin excepción.

---

## Flujo (resumen)

El procedimiento completo —cómo preguntar al usuario, validación antes de crear, los pasos de **Crear** y **Actualizar**, el checklist y los ejemplos/anti-patrones— está en [`references/flow.md`](references/flow.md). Síntesis:

- **Varias historias en una misma invocación:** si la migración investigada se descompuso en varias US, o el usuario pide crear de una vez varias historias relacionadas, primero detectar dependencias entre ellas y ordenarlas — la infraestructura y las que no dependen de ninguna otra de la tanda van primero — y confirmar ese orden con el usuario antes de fijar IDs; con una sola historia, saltar directo a Crear. Ver [`references/flow.md`](references/flow.md#flujo-proponer-varias-historias-en-una-misma-invocación).
- **Crear:** fijar ID y carpeta `US-XXX-[nombre-corto]/` → redactar el `README.md` con la plantilla (Descripción RFC 2119, Referencias, Criterios `AC-XXX` con categoría y enunciado RFC 2119, Repositorios, Complejidad Fibonacci, INVEST, DoR, Observaciones) → si el requerimiento define modelos, APIs o flujos, **delegar la documentación técnica a `/design-define` mediante subagente** y agregar las referencias devueltas a la sección Referencias → glosario si aplica → cierre.
- **Actualizar:** identificar y leer el `README.md` → aplicar cambios conservando **siempre** los ids `AC-XXX` existentes (son inmutables: los nuevos toman el siguiente libre) → revalidar → confirmar. Ante conflicto `TK-XXX` ↔ US, **la US prevalece**.
- **Cierre:** si queda **Draft**, cerrar lagunas con preguntas estructuradas (una por laguna, máx. tres por bloque); si queda **Ready**, resolver la definición de casos de prueba según `specification.testCases.mode` (`ask` pregunta, `always` invoca `/test-define` directo, `never` no la ofrece — ver [Política de planificación](#política-de-planificación)) y sugerir crear las `TK-XXX` con `/work-plan` (nunca crear TCs ni tareas directamente desde este skill).

Las modalidades **RFC 2119**, las **categorías de AC-XXX** (funcionales e ISO 25010) y las rúbricas **INVEST** y **DoR** detalladas están en [`references/quality-criteria.md`](references/quality-criteria.md).

---

## Criterios para `Estado: Ready` (resumen)

Promover a **Ready** solo si se cumplen todos; el detalle de cada criterio está en [`references/quality-criteria.md`](references/quality-criteria.md#definition-of-ready-dor).

- Sección **Criterios de aceptación** completa: al menos un `AC-XXX` con categoría entre paréntesis y enunciado RFC 2119 en MAYÚSCULAS.
- **DoR** completado según la plantilla (Dependencias listas, Inputs/outputs claros, Repositorios definidos, sin decisiones técnicas pendientes, Referencias de UI cuando aplique, sin aclaraciones pendientes).
- **INVEST** sin dimensiones en `No cumple`.
- **Repositorios afectados** identificados.
- **Observaciones** sin aclaraciones ni pendientes abiertos.

Si falta cualquiera, mantener `Estado: Draft` con las lagunas documentadas en Observaciones.
