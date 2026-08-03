# Integración con Azure DevOps (ADO)

Referencia específica del sistema **Azure DevOps**. Se activa cuando `.agents/MEMORY.md` contiene `work_item_tracking: azure_devops` (ver «Integración con un sistema de seguimiento externo» en `SKILL.md`). Todo el detalle propio de ADO —herramienta MCP, campos, tipo de work item, configuración de conexión, límites de formato— vive únicamente en este archivo; `SKILL.md` no debe contener nada específico de ADO. Aplica de forma transversal a los TCs generados en el Paso 3 de `SKILL.md`; cuando este documento dice «TC» se refiere al caso de prueba en curso.

> **Jerarquía de Azure Test Plans:** en ADO, un Test Case no vive suelto — cuelga de un **Test Suite**, que a su vez cuelga de un **Test Plan**. Esta jerarquía (`Test Plan → Test Suite → Test Case`) es independiente de la jerarquía genérica de work items (padre/hijo) y **debe respetarse** siempre que se cree un Test Case vía MCP: ver Paso 2.

## Configuración (`.agents/MEMORY.md`)

Además de `work_item_tracking: azure_devops`, esta integración lee de `.agents/MEMORY.md`:

| Clave | Uso |
|-------|-----|
| `azure_devops_org:` / `ado_org:` | Organización de ADO; usada para construir la URL del work item (Paso 4). |
| `azure_devops_project:` / `ado_project:` | Proyecto de ADO; también es el **nombre del Test Plan** (Paso 2) y se usa para construir la URL del work item (Paso 4). |
| `ado_area_path:` | Area Path a asignar al crear el Test Case (Paso 3). |
| `ado_iteration:` | Iteración a asignar al crear el Test Case (Paso 3). |

Si `azure_devops_org` / `azure_devops_project` no están definidos, intentar resolver la URL a partir de lo que devuelva el MCP al crear el work item.

## Paso 1 — Verificar disponibilidad del MCP de ADO

Comprobar si existe una herramienta MCP de Azure DevOps disponible en el cliente actual (p. ej. `mcp_azure-devops_*` o similar).

- **MCP disponible** → continuar con el Paso 2.
- **MCP no disponible** → notificar al usuario y continuar con el flujo normal de numeración local secuencial (ver `SKILL.md` § Numeración y nombres de archivo):
  ```
  ⚠️ El repo está vinculado a Azure DevOps pero el MCP no está conectado.
  Los TC se crearán solo en local con ID secuencial.
  Para habilitar la sincronización, conecta el MCP de ADO desde el menú de herramientas.
  ```

## Paso 2 — Resolver la jerarquía de Test Plans (Test Plan → Test Suite)

Antes de crear el Test Case, resolver los dos niveles superiores de la jerarquía. Ninguno se crea si ya existe uno con el nombre correcto — reutilizar siempre el existente.

1. **Test Plan**: su nombre es el del **proyecto de Azure DevOps** al que está vinculado el repo (`azure_devops_project:` / `ado_project:` en `.agents/MEMORY.md`).
   - Buscar vía MCP si ya existe un Test Plan con ese nombre en el proyecto.
   - **Si no existe, crearlo** antes de continuar.
2. **Test Suite**: su nombre es el de la **historia de usuario o work item padre** del artefacto origen — el título completo tal como aparece en su `README.md` (p. ej. `US-003: Endpoint de autenticación`, o el título del `WI-XXX`/`FEAT-XXX` correspondiente).
   - Buscar vía MCP, dentro del Test Plan resuelto en el paso anterior, si ya existe un Test Suite con ese nombre.
   - **Si no existe, crearlo** dentro de ese Test Plan antes de continuar.

Extraer los identificadores del Test Plan y del Test Suite resueltos (creados o reutilizados); se usan en el Paso 3 para anclar el Test Case en el lugar correcto de la jerarquía.

## Paso 3 — Crear el Test Case en Azure DevOps (dentro del Test Suite)

Antes de generar cada archivo local `TC-XXX-{slug}.md`, usar el MCP para crear el work item en ADO **dentro del Test Suite resuelto en el Paso 2** (nunca como work item aislado):

1. **Título**: el título GWT del TC (`Dado…, Cuando…, Entonces…`). **No debe superar los 255 caracteres** (límite del campo Título en ADO); si el título GWT completo lo supera, usar una versión abreviada que conserve el sentido del escenario — el título completo permanece de todos modos en el encabezado del archivo local (`# TC-{{XXX}} — ...`).
2. **Tipo de work item**: `Test Case` (o el tipo equivalente configurado en el proyecto ADO).
3. **Pasos de ejecución** (campo Steps): si el tipo de work item expone un campo dedicado para pasos (p. ej. `Microsoft.VSTS.TCM.Steps` en ADO), volcar ahí la tabla **Pasos de ejecución** del TC, un paso del work item por cada fila (acción del actor + resultado esperado de ese paso). Si el MCP no expone ese campo, inclúyelos también dentro de **Descripción** (punto 4) en lugar de omitirlos.
4. **Descripción / Resumen**: el resto del documento completo, serializado de forma estructurada con los mismos encabezados que el `.md` local: Perspectiva, Criterio de aceptación, Artefacto padre, Precondiciones, Datos de prueba, Resultado esperado final, Observaciones (y Pasos de ejecución si el punto 3 no tuvo campo dedicado). El objetivo es que el TC pueda **reconstruirse íntegro** a partir del work item si el archivo local se pierde: no omitir ninguna sección del `.md` en la sincronización.
5. **Iteración / Area Path**: leer de `.agents/MEMORY.md` si está definido (`ado_area_path:`, `ado_iteration:`); si no, omitir (ADO usará los defaults del proyecto).
6. **Test Suite**: agregar el Test Case al Test Suite resuelto en el Paso 2 (mecanismo que provea el MCP para asociar Test Cases a un Suite existente).
7. **Padre** (trazabilidad adicional, best-effort): si el artefacto origen (US/WI/FEAT) tiene un `Work Item (ADO)` registrado en su propio encabezado, vincular además el Test Case a ese work item usando la relación que provea el MCP (p. ej. «Tests» / «Tested By»). Si no hay forma de resolverlo, omitir la vinculación sin bloquear.

Tras la llamada al MCP, **extraer el `id` numérico** del work item creado (campo `id` en la respuesta).

## Paso 4 — Usar el ID de ADO como número de TC local

En lugar del número secuencial calculado de los archivos existentes en `test-cases/`, usar el **ID del work item ADO** como número del TC:

- Formato: `TC-<ado_id>-{slug}.md`. Ejemplo: si ADO devuelve `id: 1847`, el archivo será `TC-1847-login-credenciales-validas-happy.md`. Sin padding de ceros.
- Registrar el vínculo al work item en el campo `Work Item (ADO)` del encabezado:
  ```
  **Work Item (ADO):** [#<ado_id>](<url-al-work-item>)
  ```
  Usar la URL que devuelva el MCP, o construirla como `https://dev.azure.com/<org>/<project>/_workitems/edit/<ado_id>` (con `<org>` y `<project>` de la configuración anterior).

> **Nota de solapamiento:** al usar IDs de ADO, verificar igualmente que no exista ya `TC-<ado_id>-*.md` en la carpeta `test-cases/` del artefacto antes de crear el archivo.

## Anti-patrones específicos de ADO

- Crear el archivo TC local con ID secuencial cuando el repo está vinculado a ADO y el MCP está disponible — siempre crear el work item «Test Case» en ADO primero y usar su `id`.
- Crear el Test Case como work item aislado sin resolver y asignarlo a su Test Plan y Test Suite correspondientes (Paso 2).
- Crear un Test Plan o Test Suite nuevo cuando ya existe uno con el nombre correcto — siempre reutilizar el existente.
- Nombrar el Test Suite con un texto distinto al título de la US/WI/FEAT padre (p. ej. una descripción libre), rompiendo la trazabilidad de la jerarquía.
- Omitir el campo `Work Item (ADO)` en el encabezado del TC cuando fue creado vía MCP.
- Bloquear la creación porque no se pudo vincular el padre (relación «Tests»/«Tested By») — esa vinculación es best-effort; omitir sin bloquear. (La pertenencia al Test Suite, en cambio, no es opcional.)
- Usar un Título de más de 255 caracteres al crear el work item en ADO en lugar de una versión abreviada.
- Escribir solo el resultado esperado final (o cualquier otro resumen parcial) en Descripción y omitir el resto de las secciones del `.md` (Precondiciones, Datos de prueba, Observaciones, etc.) — el TC debe poder reconstruirse íntegro desde el work item.
- Omitir los Pasos de ejecución tanto del campo Steps como de la Descripción cuando el MCP no expone un campo dedicado — deben quedar registrados en algún lugar del work item.

## Ejemplo — Repo vinculado a ADO con MCP disponible

- *Contexto:* `.agents/MEMORY.md` contiene `azure_devops_project: MyProject`. MCP de ADO disponible. La US padre (`US-003: Endpoint de autenticación`) tiene `Work Item (ADO): [#1500](https://dev.azure.com/…)` en su encabezado.
- *Entrada:* generar TCs para `AC-001` de `US-003`.
- *Comportamiento:* El agente detecta ADO (en `SKILL.md`), lee esta referencia, verifica que el MCP está disponible. Resuelve la jerarquía (Paso 2): busca el Test Plan `MyProject` — no existe, lo crea; busca dentro de él el Test Suite `US-003: Endpoint de autenticación` — no existe, lo crea. Con el Test Suite resuelto, crea el work item «Test Case» en ADO dentro de ese Suite: título GWT (o abreviado si supera 255 caracteres); Pasos de ejecución volcados al campo `Steps`; Descripción con el resto del documento completo (Perspectiva, Criterio de aceptación, Precondiciones, Datos de prueba, Resultado esperado final, Observaciones) serializado por secciones; vinculado además a `#1500` si el MCP lo permite. Extrae `id: 2210`. Genera el archivo local `TC-2210-login-credenciales-validas-happy.md` con `Work Item (ADO): [#2210](https://dev.azure.com/…)` en el encabezado. El resto del flujo de `test-define` (Paso 4 y Paso 5) continúa normalmente. Para el siguiente TC del mismo `AC-001` (u otro AC de `US-003`), el agente reutiliza el mismo Test Plan y Test Suite ya resueltos, sin volver a crearlos.
