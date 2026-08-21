# Integración con Azure DevOps — `work-research`

> **Base común obligatoria:** [`${CLAUDE_PLUGIN_ROOT}/reference/alm/azure-devops.md`](../../../reference/alm/azure-devops.md)
> — activación (`work_item_tracking: azure_devops`), claves de `.agents/MEMORY.md`, verificación del MCP
> y su degradación, construcción de la URL, campo `Work Item (ADO)`, normalización del HTML de
> `System.Description` y anti-patrones comunes. **Leerla antes que este archivo.**

Este archivo contiene **solo el delta de `work-research`**. Se activa desde «Entrada desde el gestor de
proyectos» en `SKILL.md`.

> **Rol de esta integración: leer y enrutar, nunca escribir.** `work-research`
> **investiga**; no crea ni modifica work items. Esta referencia sirve para (1)
> **obtener** cualquier artefacto de ADO que el usuario pase por su ID o URL, (2)
> **enrutarlo** al flujo que corresponde a su tipo, y (3) **propagar** su identificador
> al skill que sí crea work items (`work-define`, `work-plan`, `test-define`).

> **Degradación sin MCP.** Al no crear artefactos, aquí la falta de MCP no se resuelve con ID secuencial
> local sino pidiendo el contenido al usuario:
> ```
> ⚠️ El repo está vinculado a Azure DevOps pero el MCP no está conectado.
> No puedo leer el work item #<id> automáticamente.
> Pégame su contenido, o conecta el MCP de ADO desde el menú de herramientas.
> ```

## Paso 1 — Leer el work item y enrutarlo

Cuando la entrada es un **identificador** (`#4821`, `4821`, una URL de ADO), obtener el
work item vía MCP y leer su campo `System.WorkItemType` para elegir el flujo:

| `System.WorkItemType` | Artefacto equivalente | Flujo de `work-research` |
|-----------------------|-----------------------|--------------------------|
| `User Story` / `Product Backlog Item` / `Feature` / `Epic` | `US-XXX` | **Analizar decisiones pendientes** |
| `Task` | `TK-XXX` (si cuelga de una historia) o `WI-XXX` | **Analizar decisiones pendientes** |
| `Bug` | Defecto | **Analizar issue** |
| `Test Case` | `TC-XXX` | **Analizar test case** |
| `Issue` / `Impediment` / otros | — | Preguntar al usuario qué espera antes de elegir flujo |

> El proceso del proyecto cambia los nombres de los tipos: si el tipo devuelto no está en la tabla,
> **no adivinar** (ver la base común).

Si el work item tiene un documento equivalente en el repo (por su `Work Item (ADO)`
registrado en el encabezado), **leer también el documento local**: la especificación es
el `.md`; el work item aporta estado, comentarios, adjuntos y decisiones que no
llegaron al documento. Si discrepan, registrarlo como hallazgo.

### Campos comunes a cualquier tipo

| Campo de ADO | Uso |
|--------------|-----|
| `System.Title` | Título del artefacto |
| `System.Description` | Cuerpo principal; normalizar el HTML a markdown (ver la base común) |
| `System.State`, `System.AreaPath`, `System.IterationPath` | Contexto de gestión; registrar, no interpretar |
| `System.Tags` | Señales de módulo, entorno o regresión |
| **Comentarios / discusión** | Decisiones ya tomadas, intentos descartados, datos de reproducción — leerlos siempre |
| **Adjuntos** (capturas, logs, HAR) | Evidencia; inspeccionarlos si el MCP permite descargarlos, o pedirlos al usuario |
| **Relaciones** (`Parent`, `Child`, `Related`, `Duplicate of`, `Tests`/`Tested By`) | Artefacto padre, casos de prueba asociados, duplicados |

### Campos por tipo

**`User Story` / `Feature` / `Task`** → flujo *Analizar decisiones pendientes*:

| Campo | Uso |
|-------|-----|
| `Microsoft.VSTS.Common.AcceptanceCriteria` | Criterios `AC-XXX`; la vara para contrastar los hallazgos |
| `Microsoft.VSTS.Scheduling.*` (estimaciones) | Contexto de dimensionamiento |
| Relación `Child` / `Parent` | Tareas asociadas y épica/feature contenedora |

**`Bug`** → flujo *Analizar issue*:

| Campo | Uso en el dossier de bug |
|-------|--------------------------|
| `Microsoft.VSTS.TCM.ReproSteps` (Repro Steps) | Pasos de reproducción y entrada disparadora |
| `Microsoft.VSTS.TCM.SystemInfo` (System Info) | Entorno, versión, configuración |
| `Microsoft.VSTS.Common.Severity` / `Priority` | Severidad e impacto |
| Relación `Parent` | Historia afectada: sus `AC-XXX` definen el comportamiento esperado |

Si el bug está marcado como **duplicado** o ya **cerrado**, informarlo y preguntar si
continuar antes de invertir la investigación.

**`Test Case`** → flujo *Analizar test case*:

| Campo | Uso en el análisis |
|-------|--------------------|
| `Microsoft.VSTS.TCM.Steps` (Steps) | Pasos de ejecución y resultado esperado de cada paso |
| `Microsoft.VSTS.TCM.LocalDataSource` / parámetros | Datos de prueba y variantes |
| `Microsoft.VSTS.TCM.AutomationStatus` | Si el TC está automatizado; un `Not Automated` es ya un hueco de cobertura |
| Relación `Tests` / `Tested By` | El requisito o historia que el TC dice verificar — la traza a auditar |
| Test Suite / Test Plan que lo contienen | Contexto de agrupación; útil para localizar TCs hermanos |

Notas transversales:

- **Nunca inventar lo que el work item no dice.** Si falta información, preguntarla al
  usuario.
- Registrar el `Work Item (ADO)` en el encabezado del informe o del dossier, con el formato que define
  la base común.

## Paso 2 — Propagar el identificador en el *handoff*

`work-research` no crea work items. Al hacer *handoff*, pasar siempre el `ado_id` y la
URL del artefacto leído para que el skill destino lo enlace o lo reutilice:

| Flujo | Qué propagar |
|-------|--------------|
| **Analizar issue** → `work-plan` | El `ado_id` del **bug ya existente** y la indicación de **reutilizarlo**: `work-plan` usa el identificador del gestor como número del WI (`WI-<ado_id>-{kebab-case}/`) y lo registra en `Work Item (ADO)`. Crear un segundo work item para el mismo defecto es un duplicado. Si el usuario prefiere separar el reporte (tipo `Bug`) del trabajo de corrección, preguntárselo y dejar que `work-plan` cree el nuevo work item vinculado al bug como `Related` |
| **Analizar decisiones pendientes** → `work-define` / `work-plan` | El `ado_id` del artefacto investigado, para que las actualizaciones caigan sobre ese mismo work item |
| **Analizar test case** → `test-define` | El `ado_id` del `Test Case` auditado, para que se corrija o amplíe **ese** work item y no se cree uno nuevo |

El detalle de creación y actualización vive en la referencia de ADO de cada skill
destino (`work-plan/references/azure-devops.md`,
`test-define/references/azure-devops.md`).

## Anti-patrones específicos

- Crear o modificar work items desde este skill — `work-research` solo lee.
- Asumir el flujo por el prefijo del identificador en vez de leer
  `System.WorkItemType`; o adivinar el flujo cuando el tipo no está en la tabla.
- Leer el work item y **no** leer su documento equivalente en el repo cuando existe.
- Investigar un artefacto sin haber leído sus **comentarios** y **adjuntos**: suelen
  contener los pasos reales de reproducción o la decisión que falta.
- Copiar la descripción HTML de ADO tal cual al informe sin normalizarla a markdown.
- Completar campos ausentes por inferencia propia en lugar de preguntar.
