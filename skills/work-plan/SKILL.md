---
name: work-plan
description: "Planifica trabajo de distintos tipos sin generar código ni pruebas. Dos tipos de plan: (1) tareas técnicas (TK-XXX) bajo una historia de usuario existente; (2) work items de mantenimiento (WI-XXX) sin historia asociada — bugs, refactor, deuda técnica, actualización de dependencias, tareas operativas. Activar siempre que el usuario pida planificar implementación, descomponer trabajo, definir alcance técnico, documentar especificaciones técnicas o planificar mantenimiento / deuda técnica / refactor, aunque no nombre «tarea», «TK» o «WI». Activar también — por defecto — cuando solo entregue una referencia a una historia (p. ej. «US-004», «planifica US-007», «tareas para esta historia»): proponer stubs agrupados por unidad de trabajo que cubran los escenarios (SC-XX) y consideren las reglas de negocio (BR-XX). Selecciona el tipo según haya o no historia asociada y carga su definición desde references/."
license: MIT
---

# Skill: Planificar trabajo

Guía general para **planificar trabajo** produciendo documentos de especificación —no código ni pruebas— de **distintos tipos**. Cada tipo de plan tiene su propia definición (flujos, plantillas, validaciones) en `references/`. El cuerpo de este `SKILL.md` contiene únicamente lo **transversal** a todos los tipos; el detalle de cada tipo se carga solo cuando se necesita.

> **Qué no hace este skill (cualquier tipo):** no implementa código, no ejecuta pruebas, no crea ADRs. Lo que no está acordado va a **Observaciones** o se pregunta al usuario — nunca se inventa.

---

## Subagente requerido

**Este skill debe ejecutarse bajo el agente/subagente `docs-specialist`** (`agents/docs-specialist.md`; en el proyecto destino instalar como `.cursor/agents/docs-specialist.md`). No ejecutar ningún flujo normativo sin ese contexto, sea cual sea el tipo de plan.

---

## Cómo preguntar al usuario

Cuando este skill (o cualquiera de sus referencias) indique **preguntar, pedir, confirmar, validar o sugerir** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (la que renderiza opciones tappables o un selector) en lugar de redactar la pregunta como prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2–4 por pregunta) cuando la respuesta admita categorías; usar entrada libre solo si no hay forma razonable de enumerar opciones (p. ej. el objetivo breve de un stub).
- **No repreguntar** lo que ya está respondido en el contexto, en `.agents/MEMORY.md`, o en los documentos existentes del repo.
- **Recopilación inicial:** agrupar las preguntas pendientes en una sola tanda (hasta tres por bloque); no ir descubriendo huecos turno a turno.
- **Confirmaciones de creación:** una pregunta por turno con opciones claras (p. ej. `Confirmar` / `Ajustar` / `Cancelar`); no crear archivos antes de la confirmación.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3…).

Cada vez que una referencia diga *preguntar al usuario*, *validar con el usuario*, *confirmar* o *sugerir al usuario* asume este mecanismo; no se repite allí.

---

## Resolución de idioma

Orden canónico compartido con el resto del ciclo de trabajo. Detenerse en el primer paso que aplique:

1. **`.agents/MEMORY.md`** (raíz del repo) → línea `preferred language: <ISO 639-1>` (p. ej. `es`, `en`). Si no existe esa línea pero hay claves legacy (`language:`, `idioma:`, `Project language:`), usarlas solo como fallback.
2. **Idioma del turno del usuario** (mensaje actual).
3. **Preguntar al usuario** qué idioma prefiere y persistir la respuesta en `.agents/MEMORY.md` con `preferred language: <código>`.

---

## Selección del tipo de plan

**Antes de cualquier otra cosa**, identificar qué tipo de plan corresponde y cargar su definición. No mezclar tipos en una misma ejecución.

La señal que distingue los tipos es **si el trabajo tiene una historia de usuario asociada o no**.

| Tipo de plan | Cómo se identifica | Definición a leer |
|--------------|--------------------|-------------------|
| **Tarea técnica de historia de usuario** | El trabajo **referencia una historia de usuario**: prefijo de historia `US-XXX` (p. ej. «planifica US-007», «tareas para esta historia»), una historia ubicada bajo el árbol de user-stories del repo, o la edición de una `TK-XXX` que cuelga de una US. | `references/user-story-tasks.md` — **leer antes de redactar.** |
| **Tarea de mantenimiento** | El trabajo **no tiene una historia de usuario asociada** (corrección de bug, refactor, deuda técnica, actualización de dependencias, tarea operativa), o el usuario pide explícitamente «plan/tarea de mantenimiento». | `references/maintenance-tasks.md` — **leer antes de redactar.** |

Reglas de selección:

- **Hay historia asociada → tarea de historia de usuario. No la hay → mantenimiento.** Leer la referencia correspondiente y seguir **únicamente** su flujo.
- Si no está claro **si existe o no** una historia asociada (p. ej. una referencia ambigua que podría apuntar a una US), **preguntar al usuario** antes de continuar; no asumir la existencia de una US ni inventarla.
- Si el tipo seleccionado aún no tiene su flujo definido, la propia referencia indica cómo proceder (p. ej. confirmar con el usuario en lugar de inventar estructura).

---

## Integración con Azure DevOps (condicional)

La sincronización con Azure DevOps (ADO) es transversal a los tipos de plan que crean work items, pero **solo aplica si el repositorio está vinculado a ADO**. Para no cargar contexto innecesario:

1. **Detectar** la vinculación leyendo `.agents/MEMORY.md` (raíz del repo) y buscando cualquiera de estas señales con valor no vacío: `azure_devops_org:` / `ado_org:`, `azure_devops_project:` / `ado_project:`, o `work_item_tracking: azure_devops`.
2. **Si NO hay ninguna señal** → el repo no usa ADO. Continuar con el flujo del tipo de plan usando ID secuencial local; **no** leer la referencia de ADO.
3. **Si hay alguna señal** → leer `references/azure-devops.md` y seguir sus pasos (verificación del MCP, creación del work item, uso del `id` como número de tarea) **antes** de crear cualquier archivo local.

---

## Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno, cadenas de pensamiento ni narración del trabajo en curso («leí la US», «creé el archivo», «actualicé work-units»). Si hay pendientes o aclaraciones, listarlos en viñetas agrupadas por artefacto.

---

## Mapa de referencias

| Archivo | Cuándo leerlo |
|---------|---------------|
| `references/user-story-tasks.md` | Tipo de plan = tarea técnica de historia de usuario. Contiene modos de invocación, ubicaciones, flujos (stub, TK completa, actualizar, sugerir stubs desde US), checklist, ejemplos y anti-patrones. |
| `references/maintenance-tasks.md` | Tipo de plan = tarea de mantenimiento. |
| `references/azure-devops.md` | Solo si se detecta vinculación a ADO (ver sección anterior). |
| `assets/task-template.md` | Plantilla canónica de una tarea de historia de usuario (`TK-XXX`). Leer antes de redactar el documento. |
| `assets/work-item-template.md` | Plantilla canónica de un work item de mantenimiento (`WI-XXX`). Leer antes de redactar el documento. |
| `assets/work-units-template.md` | Plantilla de `work-units.md`. |
