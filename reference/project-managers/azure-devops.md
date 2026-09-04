# Integración con Azure DevOps — base común (compartida)

Referencia transversal del plugin **SDD Devkit**. Contiene todo lo que es **igual para cualquier skill**
que hable con Azure DevOps: activación, configuración, verificación del MCP, construcción de la URL,
límites de formato y el contrato de sincronización.

Cada skill que integra con ADO conserva su propia `references/azure-devops.md` con **solo su delta**:
qué tipo de work item crea, en qué jerarquía lo ancla y qué campos usa.

| Skill | Delta |
|-------|-------|
| `work-plan` | Crea `Task` / `Bug` para `TK-XXX` y `WI-XXX` — [`skills/work-plan/references/azure-devops.md`](../../skills/work-plan/references/azure-devops.md) |
| `test-define` | Crea `Test Case` dentro de la jerarquía Test Plan → Test Suite — [`skills/test-define/references/azure-devops.md`](../../skills/test-define/references/azure-devops.md) |
| `work-research` | **Solo lee**: obtiene, enruta y propaga — [`skills/work-research/references/azure-devops.md`](../../skills/work-research/references/azure-devops.md) |

## Activación y configuración

Esta referencia se lee **únicamente** cuando [`../project-management.md`](../project-management.md)
resolvió la integración como **activada** con `provider: azure-devops`. Ese archivo es la única fuente
de la activación y de los datos de conexión; aquí no se vuelve a resolver nada ni se pregunta al usuario.

| Valor resuelto | Uso en ADO |
|----------------|------------|
| `workspace` | **Organización** de ADO. Construye la URL del work item. |
| `project` | **Proyecto** de ADO. Construye la URL del work item y, en `test-define`, es además el **nombre del Test Plan**. |
| `host` | URL base de la instancia (p. ej. `https://dev.azure.com/mi-organizacion`). Se usa para las llamadas y para construir la URL cuando el MCP no devuelve una. |

**Area Path e Iteración** no son configurables: omitirlos al crear el work item y dejar que ADO aplique
los valores por defecto del proyecto.

Todo el detalle propio de ADO —herramienta MCP, nombres de campos, tipos de work item, límites de
formato— vive en archivos de referencia de ADO; **ni los `SKILL.md` ni sus archivos de flujo o de tipo
de plan deben contener nada específico de ADO**.

## Paso común — Verificar disponibilidad del MCP

Comprobar si existe una herramienta MCP de Azure DevOps disponible en el cliente actual
(p. ej. `mcp_azure-devops_*` o similar).

- **MCP disponible** → continuar con el flujo específico del skill.
- **MCP no disponible** → **notificar al usuario y continuar**; nunca detener el flujo. El mensaje
  declara qué se pierde y cómo habilitarlo:

  ```
  ⚠️ El repo está vinculado a Azure DevOps pero el MCP no está conectado.
  <qué ocurre en su lugar: se usará ID secuencial local / no puedo leer el work item #<id>>.
  Para habilitar la sincronización, conecta el MCP de ADO desde el menú de herramientas.
  ```

  - Los skills que **crean** artefactos (`work-plan`, `test-define`) continúan con **ID secuencial
    local** (ver [`../artifacts.md`](../artifacts.md#identificadores-y-numeración)).
  - Los skills que **leen** (`work-research`) piden al usuario que aporte el contenido manualmente.

## Vínculo con el work item

Cuando el artefacto se sincroniza con ADO, registrar el vínculo en el campo `Work Item (ADO)` del
encabezado del documento local:

```
Work Item (ADO): [#<ado_id>](<url-al-work-item>)
```

Usar la URL que devuelva el MCP, o construirla como:

```
<host>/<project>/_workitems/edit/<ado_id>
```

donde `<host>` y `<project>` son los valores resueltos en `project-management.md`.

## El ID de ADO manda sobre el secuencial local

Cuando el MCP está disponible, el work item **se crea primero en ADO** y su `id` numérico (campo `id` de
la respuesta) sustituye al secuencial calculado de los archivos locales:

- Formato del nombre: `<PREFIJO>-<ado_id>-[slug].md` — **sin padding de ceros**.
  Ejemplo: `id: 1847` → `TK-1847-modelo-dominio.md`, `WI-1847-upgrade-spring-boot.md`,
  `TC-1847-login-credenciales-validas-happy.md`.
- **El check de ID disponible se hace igualmente:** verificar que no exista ya
  `<PREFIJO>-<ado_id>-*.md` en la carpeta destino antes de crear el archivo. El alcance del escaneo
  (incluido o no `docs/archive/`) es el mismo que define
  [`../artifacts.md`](../artifacts.md#identificadores-y-numeración) para ese prefijo.

## Límites de formato

- **Título: máximo 255 caracteres** (límite del campo Título en ADO). Si el título natural del
  artefacto lo supera, usar una versión abreviada que conserve el sentido y **mantener el título
  completo en el documento local**.
- **Descripción HTML:** ADO devuelve `System.Description` en HTML. Al leerlo, normalizar a markdown sin
  perder listas numeradas ni bloques de código.

## Contrato de sincronización: reconstrucción íntegra

El documento local debe poder **reconstruirse completo** a partir del work item si el archivo se pierde.
Por tanto, al crear o actualizar un work item:

1. **Campo dedicado primero.** Si el tipo de work item expone un campo específico para una sección
   (`Microsoft.VSTS.Common.AcceptanceCriteria` para criterios de aceptación,
   `Microsoft.VSTS.TCM.Steps` para pasos de ejecución, `Microsoft.VSTS.TCM.ReproSteps` para pasos de
   reproducción), volcar ahí esa sección.
2. **Descripción como respaldo.** Si el campo dedicado no existe en ese proyecto, incluir la sección
   **dentro de Descripción** en lugar de omitirla.
3. **Nunca omitir secciones.** El resto del documento va en Descripción, serializado con los **mismos
   encabezados** que el `.md` local, aunque el resultado sea una Descripción larga.
4. **Vinculación al padre: best-effort.** Si no se puede resolver el work item padre, omitir la
   vinculación **sin bloquear** la creación. *(Excepción: en `test-define`, la pertenencia al Test Suite
   no es opcional.)*

## Los nombres de tipo dependen del proceso del proyecto

El proceso de ADO (Agile, Scrum, CMMI, Basic) cambia los nombres de los tipos de work item. Si el tipo
devuelto o requerido no encaja con lo esperado, **no adivinar**: mostrárselo al usuario y preguntar.

## Anti-patrones comunes

- Crear el archivo local con ID secuencial cuando el repo está vinculado a ADO **y** el MCP está
  disponible — siempre crear en ADO primero y usar su `id`.
- Omitir el campo `Work Item (ADO)` en el encabezado cuando el artefacto fue creado o leído vía MCP.
- Bloquear la creación porque no se pudo vincular el padre — es best-effort.
- Usar un Título de más de 255 caracteres en lugar de una versión abreviada.
- Enviar a ADO solo un resumen y omitir el resto de las secciones del `.md` — rompe la reconstrucción
  íntegra.
- Detener el flujo porque el MCP no está conectado, en vez de degradar a ID secuencial local o a insumos
  aportados por el usuario.
- Poner detalle específico de ADO dentro de un `SKILL.md`.
- Perder el `ado_id` en un *handoff* entre skills y provocar un work item duplicado.
