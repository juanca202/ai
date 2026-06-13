# Integración con Azure DevOps (ADO)

Pasos para sincronizar la planificación con Azure DevOps. **Leer esta referencia solo si `SKILL.md` detectó que el repositorio está vinculado a ADO** (señales en `.agents/MEMORY.md`). Aplica de forma transversal a cualquier tipo de plan que cree work items; cuando este documento dice «tarea» se refiere al artefacto del tipo de plan en curso (p. ej. un `TK-XXX` de historia de usuario).

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

1. **Título**: el nombre descriptivo de la tarea (el mismo que iría en el nombre de archivo).
2. **Tipo de work item**, según el tipo de plan:
   - **Tarea de historia de usuario (`TK-`)**: `Task` (o el tipo equivalente configurado en el proyecto ADO).
   - **Tarea de mantenimiento (`WI-`)**: según el `Tipo` del WI — `bug` → `Bug`; el resto (`refactor`, `deuda-técnica`, `dependencias`, `operativa`) → `Task`. Si hay duda, confirmar con el usuario.
3. **Descripción**: el objetivo breve de la tarea.
4. **Iteración / Area Path**: leer de `.agents/MEMORY.md` si está definido (`ado_area_path:`, `ado_iteration:`); si no, omitir (ADO usará los defaults del proyecto).
5. **Padre**: si aplica (p. ej. una US vinculada en ADO), intentar vincular al work item padre correspondiente. Si no hay forma de resolverlo, omitir la vinculación sin bloquear.

Tras la llamada al MCP, **extraer el `id` numérico** del work item creado (campo `id` en la respuesta).

## Paso 3 — Usar el ID de ADO como número de tarea local

En lugar del número secuencial calculado de los archivos existentes, usar el **ID del work item ADO** como número de la tarea. El prefijo es el del tipo de plan en curso (`TK-` para historias de usuario, `WI-` para mantenimiento):

- Formato: `<PREFIJO>-<ado_id>-[nombre-descriptivo].md`.
  Ejemplos: si ADO devuelve `id: 1847`, el archivo será `TK-1847-modelo-dominio.md` (US) o `WI-1847-upgrade-spring-boot.md` (mantenimiento). Sin padding de ceros.
- Registrar en los metadatos del archivo el vínculo al work item:
  ```
  ADO Work Item: [#<ado_id>](<url-al-work-item>)
  ```
  Usar la URL que devuelva el MCP, o construirla como `https://dev.azure.com/<org>/<project>/_workitems/edit/<ado_id>`.

> **Nota de solapamiento:** al usar IDs de ADO, el check «ID disponible» se realiza igualmente — verificar que no exista ya `<PREFIJO>-<ado_id>-*.md` en la carpeta destino del tipo de plan (carpeta de la US para `TK-`, `docs/specs/work-items/` para `WI-`) antes de crear el archivo.

## Anti-patrones específicos de ADO

- Crear el archivo local con ID secuencial cuando el repo está vinculado a ADO y el MCP está disponible — siempre crear en ADO primero y usar su `id`.
- Omitir la línea `ADO Work Item:` en los metadatos cuando la tarea fue creada vía MCP.
- Bloquear la creación porque no se pudo vincular el padre — la vinculación es best-effort; omitir sin bloquear.

## Ejemplo — Repo vinculado a ADO con MCP disponible

- *Contexto:* `.agents/MEMORY.md` contiene `azure_devops_project: MyProject`. MCP de ADO disponible.
- *Entrada:* «TK para el endpoint de autenticación en US-003.»
- *Comportamiento:* El agente detecta ADO (en `SKILL.md`), lee esta referencia, verifica MCP disponible, crea el work item en ADO (`Task`, título "Endpoint de autenticación", US-003 como padre si hay vinculación), extrae `id: 2031`. Genera el archivo local `TK-2031-endpoint-autenticacion.md` con metadato `ADO Work Item: [#2031](https://dev.azure.com/…)`. El flujo del tipo de plan (stub o TK completa) continúa según la intención del usuario.
