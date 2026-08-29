# Integración con Azure DevOps — `work-plan`

> **Base común obligatoria:** [`../../../reference/project-managers/azure-devops.md`](../../../reference/project-managers/azure-devops.md)
> — activación y datos de conexión resueltos en [`../../../reference/project-management.md`](../../../reference/project-management.md), verificación del MCP
> y su degradación, construcción de la URL, campo `Work Item (ADO)`, uso del `id` de ADO como número
> local, límite de 255 caracteres del título, contrato de reconstrucción íntegra y anti-patrones
> comunes. **Leerla antes que este archivo.**

Este archivo contiene **solo el delta de `work-plan`**. Se activa desde «Resolución de la integración con el
gestor de proyectos» en `SKILL.md`, y aplica de forma transversal a cualquier tipo de plan que cree work
items; cuando dice «tarea» se refiere al artefacto del tipo de plan en curso (p. ej. un `TK-XXX` de
historia de usuario).

## Qué se crea en ADO

Antes de generar el archivo local, crear el work item vía MCP:

| Campo | Valor |
|-------|-------|
| **Título** | El nombre descriptivo de la tarea (el mismo que iría en el nombre de archivo). |
| **Tipo de work item — `TK-`** | `Task` (o el tipo equivalente configurado en el proyecto). |
| **Tipo de work item — `WI-`** | Según el `Tipo` del WI: `bug-fix` → `Bug`; el resto (`refactor`, `dependency-update`, `optimization`, `security-update`, `test-improvement`, `documentation-update`, `operational-change`) → `Task`. Ante duda, confirmar con el usuario. |
| **Criterios de aceptación** | Solo si el artefacto tiene esa sección (un `WI-XXX` puede tenerla, un `TK-XXX` no). Campo dedicado `Microsoft.VSTS.Common.AcceptanceCriteria` si existe; si no, dentro de Descripción. |
| **Descripción** | El documento completo, serializado con los mismos encabezados que el `.md`. `TK-XXX`: Descripción, Dependencias, Referencias, Plan de implementación (`IT-XX`), Observaciones. `WI-XXX`: Descripción, Contexto, Fuera de alcance, Reglas de negocio, Dependencias, Referencias, Plan de implementación, Observaciones. |
| **Iteración / Area Path** | Omitir: no son configurables (ver la base común). ADO aplica los valores por defecto del proyecto. |
| **Padre** | Si aplica (p. ej. una US vinculada en ADO), vincular al work item padre. Best-effort. |

Tras la llamada, extraer el `id` numérico y usarlo como número de la tarea local, con el prefijo del
tipo de plan en curso: `TK-<ado_id>-[nombre-descriptivo].md` o `WI-<ado_id>-[nombre-descriptivo].md`.

## Alcance del check de ID disponible

- **`WI-`**: el escaneo cubre `docs/specs/work-items/` **y** `docs/archive/work-items/`. Un WI
  archivado conserva su ID de ADO, y saltárselo produciría dos carpetas locales para un mismo work item
  del tracker. (`docs/archive/` resuelto desde `specification.archivePath` — ver
  [`../../work-integrate/references/archive.md`](../../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).)
- **`TK-`**: **no** se escanea el archivo. El `TK-` es por historia, y si la US padre estuviera
  archivada el flujo ya habría parado antes de llegar aquí (Regla 1) — lo que se comprueba es la carpeta
  de la US **realmente resuelta**.

## Ejemplo — Repo vinculado a ADO con MCP disponible

- *Contexto:* `project-management.md` resolvió `project: MyProject`. MCP de ADO disponible.
- *Entrada:* «TK para el endpoint de autenticación en US-003.»
- *Comportamiento:* El agente detecta ADO (en `SKILL.md`), lee la base común y este archivo, verifica que
  el MCP está disponible, crea el work item en ADO (`Task`, título "Endpoint de autenticación",
  Descripción con el documento completo del TK serializado por secciones, US-003 como padre si hay
  vinculación) y extrae `id: 2031`. Genera el archivo local `TK-2031-endpoint-autenticacion.md` con el
  campo `Work Item (ADO): [#2031](https://dev.azure.com/…)`. El flujo del tipo de plan (stub o TK
  completa) continúa según la intención del usuario.
