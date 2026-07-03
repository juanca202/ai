---
name: work-implement
description: 'Usar al pedir implementar, desarrollar o ejecutar en codigo trabajo ya especificado, de distintos tipos. Tres tipos de implementacion: (1) tareas tecnicas (TK-XXX) bajo una historia de usuario (US-XXX); (2) work items de mantenimiento (WI-XXX) sin historia asociada — bugs, refactor, deuda tecnica, dependencias, operativas; (3) migraciones tecnologicas (MG-XXX) entre proyectos. Activar siempre que el usuario pida "implementar", "desarrollar", "ejecutar tareas", "codificar", "trabajar en el TK/WI", "ejecutar la migracion" o cualquier variante que implique escribir codigo a partir de una especificacion ya redactada, aunque no nombre el tipo. Selecciona el tipo segun el artefacto referenciado y carga su flujo desde references/. Solo se implementa trabajo en estado Ready.'
license: MIT
---

# Skill: Implementar trabajo

Guia general para **ejecutar en codigo** trabajo ya especificado, de **distintos tipos**. Cada tipo de implementacion tiene su propio flujo (ubicaciones, validaciones, unidad de confirmacion, cierre) en `references/`. El cuerpo de este `SKILL.md` contiene solo lo **transversal** a todos los tipos; el detalle de cada tipo se carga unicamente cuando se necesita.

> **Alcance (cualquier tipo):** consume especificaciones ya redactadas por los skills de planificacion (`work-plan`, `project-migrate`). **No reescribe ni reestructura** la especificacion - solo la implementa. Correcciones menores acordadas con el usuario son la unica excepcion.
>
> **Solo implementacion:** no modifica documentacion de producto (README de US, `TK-XXX`, `WI-XXX`, `discovery.md`, `validation.md`, `plan.md`, ADRs, technical-docs) - solo el `progress.md`. **Excepcion de checkboxes:** marcar `[ ]` como `[x]` en las subtareas del artefacto en ejecucion **a medida que se completan** es la unica modificacion permitida en archivos de especificacion; no se toca ninguna otra seccion del artefacto. El archivo a editar depende del tipo: `TK-XXX.md` para tareas de historia de usuario, `WI-XXX.md` para work items, `plan.md` para fases de migracion. Si se detecta un conflicto en la documentacion que pueda afectar el resultado, **parar inmediatamente y notificar al usuario** antes de continuar.
>
> **Ritmo obligatorio - una unidad por confirmacion:** implementar una unidad, actualizar `progress.md` **y la lista de tareas (to-dos) del agente**, ejecutar lint/build, y **esperar confirmacion explicita del usuario antes de arrancar la siguiente**. Sin excepcion. La **unidad** depende del tipo (ver tabla de seleccion).

---

## Como preguntar al usuario

Cuando este skill (o cualquiera de sus referencias) indique **preguntar, pedir, confirmar o validar** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (la que renderiza opciones tappables o un selector) en lugar de redactar la pregunta como prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2-4 por pregunta) cuando la respuesta admita categorias.
- **No repreguntar** lo que ya esta respondido en el contexto de la sesion o en los documentos del repo.
- **Confirmaciones entre unidades:** una pregunta por turno con opciones claras (p. ej. Opciones: [Si, continuar] / [No, detener aqui]). No avanzar antes de la respuesta.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3...).

Cada vez que una referencia diga *preguntar al usuario*, *validar con el usuario* o *confirmar* asume este mecanismo; no se repite alli.

---

## Resolucion de idioma

El idioma de los mensajes al usuario y de las notas de `progress.md` se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesion existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** que idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

El idioma resuelto aplica a los mensajes al usuario y a las notas de `progress.md`. La salida y los mensajes de error de las herramientas (lint, build, tests) no se traducen; el codigo, los identificadores y los nombres de artefacto tampoco.

---

## Seleccion del tipo de implementacion

**Antes de cualquier otra cosa**, identificar que tipo de implementacion corresponde y cargar su flujo. No mezclar tipos en una misma ejecucion.

La senal que distingue los tipos es **el artefacto que el usuario referencia**.

| Tipo | Como se identifica | Unidad de confirmacion | Flujo a leer |
|------|--------------------|------------------------|--------------|
| **Tarea de historia de usuario** | El trabajo referencia una historia `US-XXX` o una tarea `TK-XXX` que cuelga de ella; el artefacto vive bajo `docs/specs/user-stories/`. | **Una `TK-XXX`** | `references/user-story-tasks.md` — **leer antes de implementar.** |
| **Work item de mantenimiento** | El trabajo referencia un `WI-XXX` (bug, refactor, deuda tecnica, dependencias, operativa) **sin historia asociada**; vive bajo `docs/specs/work-items/`. | **El `WI-XXX` completo** | `references/work-items.md` — **leer antes de implementar.** |
| **Migracion entre proyectos** | El trabajo referencia una migracion `MG-XXX` o pide ejecutar/implementar una migracion; vive bajo `docs/specs/migrations/`. | **Una fase del plan** | `references/migrations.md` — **leer antes de implementar.** |

Reglas de seleccion:

- **Identificar el artefacto -> leer su referencia -> seguir unicamente su flujo.**
- Si la referencia del usuario es ambigua (p. ej. un numero sin prefijo, o no esta claro si hay historia asociada), **preguntar al usuario** antes de continuar; no asumir el tipo ni inventar artefactos.
- Solo se implementa trabajo en **`Estado: Ready`** (la US/TK, el WI o el `plan.md` de la migracion). Si esta en `Draft`, parar y devolver a planificacion.

---

## Validacion de repositorio (transversal)

Verificar estas condiciones antes de implementar, sea cual sea el tipo. Si alguna falla, **parar** - informar al usuario y resolver primero.

- **No iniciar en la rama de otro trabajo (primera verificacion):** obtener la rama actual con `git branch --show-current`. Si ya tiene un prefijo de implementacion (`feature/`, `fix/`, `chore/`, `refactor/`) y **no** corresponde al artefacto que se va a implementar, **parar** e indicar al usuario que no se puede iniciar la implementacion desde la rama de otro trabajo; debe situarse en la rama base acordada (p. ej. `develop`/`main`) para que el skill cree o cambie a la rama del artefacto. **Excepcion - reanudar:** si la rama actual es precisamente la del artefacto pedido, continuar normalmente.
- **Working tree limpio:** `git status --porcelain` sin cambios pendientes no resueltos.
- **Rama correcta:** estar en (o crear) la rama de trabajo del artefacto. No implementar en `main` ni en ramas de otro trabajo sin instruccion explicita. El nombre de rama lo define cada referencia segun el tipo.
- **Solo trabajo de la rama actual:** solo se implementan unidades (TK / WI / Fase) que pertenezcan a la historia, work item o migracion asociada a la rama de implementacion actual. No implementar tareas de otro artefacto o de otra rama: si la unidad pedida no corresponde a la rama actual, **parar** y cambiar a su rama correspondiente (o pedir al usuario que lo haga) antes de continuar; nunca mezclar trabajo de distintos artefactos en una misma rama.
- **Artefacto en `Ready`:** el artefacto a implementar existe y esta en `Estado: Ready` (lo verifica cada referencia con su regla propia).
- **Solapamiento de progreso:** leer `progress.md` si existe; respetar unidades ya en `Done`; si hay alguna `In Progress`, revisar notas y estado real antes de continuar.

Si hay conflicto:

```
WARNING No es posible continuar:
- <razon concreta>
```

---

## progress.md (transversal)

Cada tipo mantiene un `progress.md` como **unica bitacora** que este skill puede modificar (nunca la especificacion de producto). Estados validos por unidad: **`Pending`**, **`In Progress`**, **`Done`**. No usar `Skipped` ni otros valores.

- Crear desde `assets/progress-template.md` si no existe, adaptando el encabezado y las unidades al tipo (TK / WI / Fase) segun indique la referencia.
- Por cada unidad: `Pending` => `In Progress` => `Done`; anadir notas si quedan aspectos parciales.
- Registrar en `Decisiones adicionales` **toda decision tomada durante la sesion de chat** que no este ya documentada en la especificacion. Si no hubo decisiones nuevas, omitir la seccion.

| Situacion | Que hacer |
|-----------|-----------|
| Posponer una unidad | Mantener `Pending` y registrar el motivo en `Notas`. |
| Sacar una unidad del alcance | Parar; alinear con el skill de planificacion correspondiente; eliminar la entrada si ya no aplica. |
| Unidad completada | `Done`. |

---

## Lista de tareas del agente (transversal)

Durante la ejecucion, mantener la **herramienta de lista de tareas (to-dos) del agente** como reflejo vivo del **plan de implementacion en curso**: una entrada por cada tarea del plan. Da visibilidad del progreso en tiempo real y **no sustituye** al `progress.md`, que sigue siendo la bitacora persistente en el repositorio.

- **Al empezar a ejecutar un plan de implementacion:** poblar la lista de to-dos con **una entrada por cada tarea del plan** (`IT-XX`), en el orden en que se van a abordar. **Cada entrada muestra unicamente la descripcion corta de la tarea** (su `IT-XX` + la linea corta), nunca el detalle largo, las referencias a codigo ni el texto completo de la tarea.
- **A medida que se completa cada tarea:** marcar su entrada como `completed`, en el mismo momento en que se marca `[ ]` => `[x]` en el artefacto. **Solo una tarea `in_progress` a la vez.**
- **Al terminar el plan:** todas las tareas quedan `completed`. Al comenzar el siguiente plan de implementacion, reemplazar la lista con sus tareas.
- **Coherencia:** la lista de to-dos, los checkboxes del artefacto y `progress.md` no deben contradecirse.
- **Fallback:** si el cliente no expone la herramienta de to-dos, basta con `progress.md` y los checkboxes del artefacto; no narrar el progreso como prosa paso a paso.

---

## Documentacion de codigo segun ADR (transversal)

Antes de escribir codigo, verificar si el proyecto tiene **algun ADR que defina como documentar el codigo** (estilo de docstrings, comentarios, JSDoc/TSDoc, convenciones de encabezado de archivo, anotaciones, etc.). Los ADR suelen vivir bajo `docs/adr/` o donde el proyecto los registre.

- Si existe un ADR **vigente** sobre documentacion de codigo, **aplicarlo dentro de la misma unidad que se implementa** (la TK, el WI o la fase). La documentacion que el ADR exige es **parte del entregable de esa unidad**, no un paso posterior.
- **No diferir** esa documentacion "para otro momento", un commit aparte o una tarea futura. Una unidad cuyo codigo no cumple la documentacion que su ADR exige **no esta `Done`**.
- Esto **no contradice** la regla de no modificar la especificacion de producto: seguir un ADR significa **obedecerlo al escribir el codigo**, no editar el ADR. El ADR se respeta, no se cambia.
- Si hay varios ADR aplicables, o uno ambiguo respecto al alcance actual, **preguntar al usuario** antes de continuar en lugar de asumir.

---

## Principios de desarrollo (transversal)

Toda implementacion, sea cual sea el tipo de artefacto, sigue estos dos principios. No son opcionales.

### TDD — Test-Driven Development

El ciclo obligatorio por cada unidad de comportamiento es **Red → Green → Refactor**:

1. **Red:** escribir el test que falla antes de escribir el codigo de produccion. El test debe describir el comportamiento esperado segun los **insumos de comportamiento** del artefacto: en US y WI, los criterios de aceptacion (`AC-XXX`) y —cuando existan— las reglas de negocio (`BR-XX`), los escenarios (`SC-XX`) y los casos de prueba (`TC-XXX`); en migraciones, los casos de Golden Master (`GM-XXX`).
2. **Green:** escribir el minimo codigo necesario para que el test pase.
3. **Refactor:** limpiar el codigo (produccion y test) sin romper los tests.

Los tests son parte del entregable de la unidad, no una fase posterior. Una unidad no esta `Done` si sus tests no existen o no pasan.

### Clean Architecture

Organizar el codigo respetando la separacion de responsabilidades:

- **Capas con dependencias hacia adentro:** Entities → Use Cases → Interface Adapters → Frameworks/Drivers. Las capas internas no conocen las externas.
- **Regla de dependencia:** el codigo fuente solo puede apuntar hacia adentro; nunca una capa interna importa de una externa.
- **Use cases primero:** la logica de negocio vive en casos de uso, no en controladores, servicios de infraestructura ni frameworks.
- **Inversión de dependencias:** las abstracciones (interfaces/puertos) se definen en la capa de dominio; las implementaciones concretas (repositorios, clientes HTTP, etc.) viven en la capa de infraestructura.

Si el proyecto ya tiene una estructura establecida que se aparta de Clean Architecture, respetar la convencion existente y registrar la decision en `Decisiones adicionales` del `progress.md`.

---

## Subagentes y MCP condicionales (transversal)

| Condicion | Agente / MCP requerido |
| --------- | ---------------------- |
| La unidad genera o modifica archivos de UI (HTML, CSS, componentes) | Ejecutar bajo el agente `ui-specialist` **si el proyecto lo define** |
| La referencia de diseno es un enlace o archivo de Figma | Usar el **MCP de Figma** para obtener el contexto del diseno antes y durante la implementacion |

El subagente `ui-specialist` solo se usa **si el proyecto lo define**; si no existe, ejecutar el paso directamente. Si la unidad no involucra UI, implementar directamente sin delegar.

---

## Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno ni narracion del trabajo en curso ("lei el TK", "cree la rama"). Las preguntas y confirmaciones van por la herramienta de preguntas estructuradas.

---

## Mapa de referencias

| Archivo | Cuando leerlo |
|---------|---------------|
| `references/user-story-tasks.md` | Tipo = tarea de historia de usuario (`US-XXX` / `TK-XXX`). Ubicaciones, filtros, cola, ciclo TK-a-TK (con TDD), flujo "TK sin US", cierre, ejemplos y anti-patrones. |
| `references/work-items.md` | Tipo = work item de mantenimiento (`WI-XXX`). Documento unico combinado, validacion por criterios de aceptacion, ciclo por WI completo, cierre, ejemplos y anti-patrones. |
| `references/migrations.md` | Tipo = migracion (`MG-XXX`). Pre-requisito `plan.md` en `Ready`, ejecucion por fases, validacion por Golden Master Testing, destino fragmentado, ejemplos y anti-patrones. |
| `assets/progress-template.md` | Plantilla de `progress.md`. Adaptar encabezado y unidades al tipo. |

---

## Anti-patterns (transversales)

- Implementar mas de una unidad por turno sin confirmacion intermedia del usuario.
- Mezclar dos tipos de implementacion en una misma ejecucion.
- Codificar con working tree sucio sin avisar y pausar.
- Implementar en `main` u otra rama que no sea la del artefacto sin instruccion explicita.
- Tratar como ejecutable un artefacto que no esta en `Ready`.
- Modificar la especificacion de producto (US/TK/WI/discovery/validation/plan, ADRs, technical-docs) durante la implementacion, salvo marcar checkboxes de subtareas completadas en el artefacto activo.
- Diferir "para otro momento" la documentacion de codigo que un ADR vigente exige, o cerrar una unidad como `Done` sin esa documentacion.
- Continuar cuando se detecta un conflicto en la documentacion sin notificar al usuario primero.
- Diferir la escritura de tests para despues de la implementacion; el ciclo TDD es Red → Green → Refactor dentro de cada unidad.
- Escribir un estado no definido en `progress.md`; estados validos: `Pending`, `In Progress`, `Done`.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
- Aceptar como confirmacion una respuesta ambigua sin opciones explicitas; si hay duda, repreguntar.