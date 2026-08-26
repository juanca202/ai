---
name: work-plan
description: "Planifica trabajo de distintos tipos sin generar código ni pruebas. Dos tipos de plan: (1) tareas técnicas (TK-XXX) bajo una historia de usuario existente; (2) tareas de mantenimiento (WI-XXX) sin historia asociada — bugs, refactor, deuda técnica, actualización de dependencias, tareas operativas. Activar siempre que el usuario pida planificar implementación, descomponer trabajo, definir alcance técnico, documentar especificaciones técnicas o planificar mantenimiento / deuda técnica / refactor, aunque no nombre «tarea», «TK» o «WI». Activar también — por defecto — cuando solo entregue una referencia a una historia (p. ej. «US-004», «planifica US-007», «tareas para esta historia»): proponer la descomposición en tareas agrupadas por repositorio que cubra los criterios de aceptacion (AC-XXX) y preguntar si crear los planes completos, crear stubs, ajustar u otro, o cancelar. Selecciona el tipo según haya o no historia asociada y carga su definición desde references/. Cuenta el trabajo archivado en docs/specs/archive/ al asignar IDs y detectar solapamientos; lo archivado no se edita."
license: MIT
---

# Skill: Planificar trabajo

Guía general para **planificar trabajo** produciendo documentos de especificación —no código ni pruebas— de **distintos tipos**. Cada tipo de plan tiene su propia definición (flujos, plantillas, validaciones) en `references/`. El cuerpo de este `SKILL.md` contiene únicamente lo **transversal** a todos los tipos; el detalle de cada tipo se carga solo cuando se necesita.

> **Qué no hace este skill (cualquier tipo):** no implementa código, no ejecuta pruebas, no crea ADRs. Lo que no está acordado va a **Observaciones** o se pregunta al usuario — nunca se inventa.

---

## Regla de handoff (transversal)

Todo paso a otra fase del ciclo se realiza **invocando el skill correspondiente**, nunca ejecutando ese trabajo directamente desde este skill. El ciclo es `work-define` → `work-plan` → `work-implement` → `work-integrate` (con `pr-create` como alternativa de cierre).

- **Si el usuario pide implementar** (escribir código, crear/ejecutar pruebas, "impleméntalo", "hazlo", "desarróllalo") mientras se está en `work-plan`: **invocar `/work-implement`** pasándole el contexto del artefacto. Este skill **no** escribe código ni ejecuta pruebas bajo ninguna circunstancia.
- **Solo se implementa trabajo en `Estado: Ready`.** Si el artefacto sigue en `Draft` (stub o incompleto), no hacer handoff a implementación: completarlo primero en este skill.
- **Si el conflicto es funcional** (contradice el `README.md` de una US), escalar a **`work-define`**; este skill no modifica la US.
- **Si una TK/WI menciona elementos técnicos sin especificación** (un modelo, API o flujo citado que no existe en `docs/specs/technical-docs/`) y el usuario pide más detalle sobre alguno de ellos, **delegar mediante subagente a `/design-define`**: ese skill hace el grilling técnico, crea/actualiza el documento de la capability y devuelve las referencias (ruta + ancla) para agregarlas a la sección **Referencias** de la TK/WI. Este skill **no** crea ni edita documentos en `technical-docs/`.

No sustituir una invocación de skill por "hacer el trabajo aquí". El handoff es explícito y por skill en cada frontera del ciclo.

---

## Subagente

**Si el proyecto define el subagente `docs-specialist`, ejecutar este skill bajo ese subagente**, sea cual sea el tipo de plan. Si no existe, ejecutar el flujo normalmente.

---

## Cómo preguntar al usuario

Mecanismo, ritmo y fallback compartidos: [`${CLAUDE_PLUGIN_ROOT}/reference/asking.md`](../../reference/asking.md).

Cada vez que este skill o sus referencias digan *preguntar*, *pedir*, *confirmar*, *validar* o *sugerir* algo al usuario, asume ese mecanismo; no se repite allí.

**Entrada libre** solo donde no haya opciones razonables que enumerar (p. ej. el objetivo breve de un stub).

---

## Resolución de idioma

Orden canónico compartido por todo el catálogo: [`${CLAUDE_PLUGIN_ROOT}/reference/language.md`](../../reference/language.md).

El idioma resuelto aplica a los **documentos generados** (`TK-XXX`, `WI-XXX`) y a los mensajes al usuario.

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
- **Una US archivada sigue siendo una US.** Antes de concluir que «no hay historia asociada», buscarla también bajo `docs/specs/archive/user-stories/`: `work-integrate` y `pr-create` mueven ahí la carpeta al cerrar el trabajo. Si aparece ahí, el tipo **es** tarea de historia de usuario y su referencia dirá que hay que parar por estar archivada — degradarla a `WI-XXX` por no encontrarla en la ruta activa crearía un artefacto nuevo para trabajo que ya existe. Ver [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).
- Si no está claro **si existe o no** una historia asociada (p. ej. una referencia ambigua que podría apuntar a una US), **preguntar al usuario** antes de continuar; no asumir la existencia de una US ni inventarla.
- Si el tipo seleccionado aún no tiene su flujo definido, la propia referencia indica cómo proceder (p. ej. confirmar con el usuario en lugar de inventar estructura).

---

## Integración con un sistema de seguimiento externo (condicional)

La sincronización con un sistema de seguimiento de trabajo externo (Azure DevOps, Jira u otro) es transversal a los tipos de plan que crean work items, pero **solo aplica si el repositorio está vinculado a uno**. Este skill solo resuelve **si** hay vinculación y **qué** referencia cargar; todo el detalle propio de cada sistema (herramienta MCP, campos, tipos de work item, configuración de conexión, límites de formato) vive exclusivamente en su archivo de `references/` — nunca aquí ni en las referencias de tipo de plan.

1. **Detectar** la vinculación leyendo `.agents/MEMORY.md` (raíz del repo): buscar la señal `work_item_tracking: <sistema>` con valor no vacío (p. ej. `azure_devops`).
2. **Si NO hay señal** → el repo no usa un tracker externo. Continuar con el flujo del tipo de plan usando ID secuencial local; **no** leer ninguna referencia de tracker.
3. **Si hay señal** → cargar `references/<sistema>.md` (p. ej. `references/azure-devops.md` para `work_item_tracking: azure_devops`) y seguir **únicamente** sus pasos antes de crear cualquier archivo local. Si no existe un archivo de referencia para el sistema indicado, informar al usuario y continuar con ID secuencial local.

**Regla de fidelidad (transversal a cualquier sistema):** toda la información del documento local debe quedar representada en el work item externo — en un campo dedicado si el sistema lo expone (p. ej. un campo de criterios de aceptación), o dentro de la descripción si no lo expone. Ninguna sección del `.md` puede omitirse al sincronizar; el objetivo es poder reconstruir el documento completo a partir del work item si el archivo local se perdiera. Qué campo usa cada sistema para qué sección es detalle de su archivo de referencia.

---

## Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno, cadenas de pensamiento ni narración del trabajo en curso («leí la US», «creé el archivo»). Si hay pendientes o aclaraciones, listarlos en viñetas agrupadas por artefacto.

---

## Mapa de referencias

| Archivo | Cuándo leerlo |
|---------|---------------|
| `references/user-story-tasks.md` | Tipo de plan = tarea técnica de historia de usuario. Contiene modos de invocación, ubicaciones, flujos (stub, TK completa, actualizar, planificar desde US), checklist, ejemplos y anti-patrones. |
| `references/maintenance-tasks.md` | Tipo de plan = tarea de mantenimiento. |
| `references/<sistema>.md` (p. ej. `azure-devops.md`) | Solo si se detecta vinculación a un tracker externo (ver [Integración con un sistema de seguimiento externo](#integración-con-un-sistema-de-seguimiento-externo-condicional)); el archivo concreto depende del valor de `work_item_tracking`. |
| `assets/task-template.md` | Plantilla canónica de una tarea de historia de usuario (`TK-XXX`). Leer antes de redactar el documento. |
| `assets/work-item-template.md` | Plantilla canónica de una tarea de mantenimiento (`WI-XXX`). Leer antes de redactar el documento. |

### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`${CLAUDE_PLUGIN_ROOT}/reference/language.md`](../../reference/language.md): **Idioma** — orden canónico, qué no se traduce, RFC 2119. *Antes de redactar cualquier salida.*
- [`${CLAUDE_PLUGIN_ROOT}/reference/asking.md`](../../reference/asking.md): **Preguntas** — mecanismo estructurado, ritmo, fallback. *Antes de la primera pregunta.*
- [`${CLAUDE_PLUGIN_ROOT}/reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*
- [`${CLAUDE_PLUGIN_ROOT}/reference/alm/azure-devops.md`](../../reference/alm/azure-devops.md): **Azure DevOps** — activación, MCP, URL, límites, sincronización. *Solo si `MEMORY.md` declara `work_item_tracking:`.*

