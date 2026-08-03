# Integración con Azure DevOps (ADO)

Referencia específica del sistema **Azure DevOps**. Se activa cuando `.agents/MEMORY.md` contiene `work_item_tracking: azure_devops` (ver «Integración con un sistema de seguimiento externo» en `SKILL.md`). Todo el detalle propio de ADO —herramienta MCP, campos, tipos de work item, configuración de conexión, límites de formato— vive únicamente en este archivo; `SKILL.md` y las referencias de tipo de plan (`user-story-tasks.md`, `maintenance-tasks.md`) no deben contener nada específico de ADO. Aplica de forma transversal a cualquier tipo de plan que cree work items; cuando este documento dice «tarea» se refiere al artefacto del tipo de plan en curso (p. ej. un `TK-XXX` de historia de usuario).

## Configuración (`.agents/MEMORY.md`)

Además de `work_item_tracking: azure_devops`, esta integración lee de `.agents/MEMORY.md`:

| Clave | Uso |
|-------|-----|
| `azure_devops_org:` / `ado_org:` | Organización de ADO; usada para construir la URL del work item (Paso 3). |
| `azure_devops_project:` / `ado_project:` | Proyecto de ADO; usada para construir la URL del work item (Paso 3). |
| `ado_area_path:` | Area Path a asignar al crear el work item (Paso 2). |
| `ado_iteration:` | Iteración a asignar al crear el work item (Paso 2). |

Si `azure_devops_org` / `azure_devops_project` no están definidos, intentar resolver la URL a partir de lo que devuelva el MCP al crear el work item.

## Paso 1 — Verificar disponibilidad del MCP de ADO

Comprobar si existe una herramienta MCP de Azure DevOps disponible en el cliente actual (p. ej. `mcp_azure-devops_*` o similar).

- **MCP disponible** → continuar con el Paso 2.
- **MCP no disponible** → notificar al usuario y continuar con el flujo normal del tipo de plan usando **ID secuencial local**:
  ```
  ⚠️ El repo está vinculado a Azure DevOps pero el MCP no está conectado.
  La tarea se creará solo en local con ID secuencial.
  Para habilitar la sincronización, conecta el MCP de ADO desde el menú de herramientas.
  ```

## Paso 2 — Crear primero en Azure DevOps (cuando MCP disponible)

Antes de generar el archivo local, usar el MCP para crear el work item en ADO:

1. **Título**: el nombre descriptivo de la tarea (el mismo que iría en el nombre de archivo). **No debe superar los 255 caracteres** (límite del campo Título en ADO); si el nombre descriptivo lo supera, usar una versión abreviada que conserve el sentido y mantener el nombre completo en el documento local.
2. **Tipo de work item**, según el tipo de plan:
   - **Tarea de historia de usuario (`TK-`)**: `Task` (o el tipo equivalente configurado en el proyecto ADO).
   - **Tarea de mantenimiento (`WI-`)**: según el `Tipo` del WI — `bug` → `Bug`; el resto (`refactor`, `deuda-técnica`, `dependencias`, `operativa`) → `Task`. Si hay duda, confirmar con el usuario.
3. **Criterios de aceptación** (solo si el artefacto tiene esa sección — un `WI-XXX` puede tenerla, un `TK-XXX` no): si el tipo de work item de ADO expone un campo dedicado (p. ej. `Microsoft.VSTS.Common.AcceptanceCriteria`), volcar ahí esa sección tal como aparece en el `.md`. Si el tipo de work item no expone ese campo, inclúyela también dentro de **Descripción** (punto 4) en lugar de omitirla.
4. **Descripción**: el resto del documento completo, serializado de forma estructurada con los mismos encabezados que el `.md` local — para un `TK-XXX`: Descripción, Dependencias, Referencias, Plan de implementación (`IT-XX`), Observaciones; para un `WI-XXX`: Descripción, Contexto, Fuera de alcance, Reglas de negocio, Dependencias, Referencias, Plan de implementación, Observaciones (y Criterios de aceptación si el punto 3 no tuvo campo dedicado). El objetivo es que el documento pueda **reconstruirse íntegro** a partir del work item si el archivo local se pierde: no omitir ninguna sección del `.md` en la sincronización, aunque el resultado sea una Descripción larga.
5. **Iteración / Area Path**: leer de `.agents/MEMORY.md` si está definido (`ado_area_path:`, `ado_iteration:`); si no, omitir (ADO usará los defaults del proyecto).
6. **Padre**: si aplica (p. ej. una US vinculada en ADO), intentar vincular al work item padre correspondiente. Si no hay forma de resolverlo, omitir la vinculación sin bloquear.

Tras la llamada al MCP, **extraer el `id` numérico** del work item creado (campo `id` en la respuesta).

## Paso 3 — Usar el ID de ADO como número de tarea local

En lugar del número secuencial calculado de los archivos existentes, usar el **ID del work item ADO** como número de la tarea. El prefijo es el del tipo de plan en curso (`TK-` para historias de usuario, `WI-` para mantenimiento):

- Formato: `<PREFIJO>-<ado_id>-[nombre-descriptivo].md`.
  Ejemplos: si ADO devuelve `id: 1847`, el archivo será `TK-1847-modelo-dominio.md` (US) o `WI-1847-upgrade-spring-boot.md` (mantenimiento). Sin padding de ceros.
- Registrar el vínculo al work item en el campo `Work Item (ADO)` de la plantilla:
  ```
  Work Item (ADO): [#<ado_id>](<url-al-work-item>)
  ```
  Usar la URL que devuelva el MCP, o construirla como `https://dev.azure.com/<org>/<project>/_workitems/edit/<ado_id>` (con `<org>` y `<project>` de la configuración anterior).

> **Nota de solapamiento:** al usar IDs de ADO, el check «ID disponible» se realiza igualmente — verificar que no exista ya `<PREFIJO>-<ado_id>-*.md` en la carpeta destino del tipo de plan (carpeta de la US para `TK-`, `docs/specs/work-items/` para `WI-`) antes de crear el archivo.

## Anti-patrones específicos de ADO

- Crear el archivo local con ID secuencial cuando el repo está vinculado a ADO y el MCP está disponible — siempre crear en ADO primero y usar su `id`.
- Omitir el campo `Work Item (ADO)` en los metadatos cuando la tarea fue creada vía MCP.
- Bloquear la creación porque no se pudo vincular el padre — la vinculación es best-effort; omitir sin bloquear.
- Usar un Título de más de 255 caracteres al crear el work item en ADO en lugar de una versión abreviada.
- Enviar a ADO solo un resumen u objetivo breve en Descripción y omitir el resto de las secciones del `.md` (Dependencias, Referencias, Plan de implementación, Observaciones, Criterios de aceptación, etc.) — el documento debe poder reconstruirse íntegro desde el work item.

## Ejemplo — Repo vinculado a ADO con MCP disponible

- *Contexto:* `.agents/MEMORY.md` contiene `azure_devops_project: MyProject`. MCP de ADO disponible.
- *Entrada:* «TK para el endpoint de autenticación en US-003.»
- *Comportamiento:* El agente detecta ADO (en `SKILL.md`), lee esta referencia, verifica MCP disponible, crea el work item en ADO (`Task`, título "Endpoint de autenticación", Descripción con el documento completo del TK — Descripción, Dependencias, Referencias, Plan de implementación, Observaciones — serializado por secciones, US-003 como padre si hay vinculación), extrae `id: 2031`. Genera el archivo local `TK-2031-endpoint-autenticacion.md` con el campo `Work Item (ADO): [#2031](https://dev.azure.com/…)`. El flujo del tipo de plan (stub o TK completa) continúa según la intención del usuario.
