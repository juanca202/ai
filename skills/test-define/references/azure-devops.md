# Integración con Azure DevOps — `test-define`

> **Base común obligatoria:** [`${CLAUDE_PLUGIN_ROOT}/reference/alm/azure-devops.md`](../../../reference/alm/azure-devops.md)
> — activación (`work_item_tracking: azure_devops`), claves de `.agents/MEMORY.md`, verificación del MCP
> y su degradación, construcción de la URL, campo `Work Item (ADO)`, uso del `id` de ADO como número
> local, límite de 255 caracteres del título, contrato de reconstrucción íntegra y anti-patrones
> comunes. **Leerla antes que este archivo.**

Este archivo contiene **solo el delta de `test-define`**. Se activa desde «Integración con un sistema de
seguimiento externo» en `SKILL.md` y aplica a los TC generados en su Paso 3.

## Jerarquía de Azure Test Plans

En ADO, un Test Case **no vive suelto**: cuelga de un **Test Suite**, que a su vez cuelga de un **Test
Plan**. Esta jerarquía (`Test Plan → Test Suite → Test Case`) es independiente de la jerarquía genérica
de work items (padre/hijo) y **debe respetarse siempre**. A diferencia de la vinculación al padre, que
es best-effort, **la pertenencia al Test Suite no es opcional**.

## Paso 1 — Resolver la jerarquía (antes de crear el TC)

Ninguno de los dos niveles se crea si ya existe uno con el nombre correcto — **reutilizar siempre el
existente**.

1. **Test Plan** — su nombre es el del **proyecto de Azure DevOps** al que está vinculado el repo
   (`azure_devops_project:` / `ado_project:` en `.agents/MEMORY.md`).
   Buscarlo vía MCP en el proyecto; **si no existe, crearlo** antes de continuar.
2. **Test Suite** — su nombre es el de la **historia de usuario o work item padre** del artefacto
   origen: el título completo tal como aparece en su `README.md` (p. ej.
   `US-003: Endpoint de autenticación`, o el título del `WI-XXX` / `FT-XXX` correspondiente).
   Buscarlo vía MCP **dentro del Test Plan resuelto**; si no existe, crearlo ahí.

Extraer los identificadores de ambos (creados o reutilizados): anclan el Test Case en el lugar correcto.

## Paso 2 — Crear el Test Case dentro del Test Suite

Antes de generar cada archivo local `TC-XXX-[slug].md`, crear el work item vía MCP **dentro del Test
Suite resuelto**, nunca como work item aislado:

| Campo | Valor |
|-------|-------|
| **Título** | El título GWT del TC (`Dado…, Cuando…, Entonces…`). Si supera 255 caracteres, abreviar conservando el sentido del escenario; el título completo permanece en el encabezado del archivo local (`# TC-{{XXX}} — …`). |
| **Tipo de work item** | `Test Case` (o el equivalente configurado en el proyecto). |
| **Pasos de ejecución** | Campo dedicado `Microsoft.VSTS.TCM.Steps` si existe: un paso del work item por cada fila de la tabla **Pasos de ejecución** (acción del actor + resultado esperado). Si el MCP no lo expone, incluirlos dentro de Descripción. |
| **Descripción** | El resto del documento completo, con los mismos encabezados que el `.md`: Perspectiva, Criterio de aceptación, Artefacto padre, Precondiciones, Datos de prueba, Resultado esperado final, Observaciones. |
| **Iteración / Area Path** | De `.agents/MEMORY.md` si está definido; si no, omitir. |
| **Test Suite** | Agregar el TC al Test Suite resuelto en el Paso 1 (mecanismo que provea el MCP). **Obligatorio.** |
| **Padre** | Trazabilidad adicional, best-effort: si el artefacto origen (US/WI/FT) tiene un `Work Item (ADO)` en su encabezado, vincular el TC a ese work item con la relación «Tests» / «Tested By». |

Tras la llamada, extraer el `id` numérico y usarlo como número del TC: `TC-<ado_id>-[slug].md`.
Verificar que no exista ya `TC-<ado_id>-*.md` en el `test-cases/` del artefacto antes de crear.

## Anti-patrones específicos

- Crear el Test Case como work item aislado sin resolver ni asignar su Test Plan y Test Suite.
- Crear un Test Plan o Test Suite nuevo cuando ya existe uno con el nombre correcto.
- Nombrar el Test Suite con un texto distinto al título de la US/WI/FT padre (p. ej. una descripción
  libre), rompiendo la trazabilidad de la jerarquía.
- Omitir los Pasos de ejecución **tanto** del campo `Steps` **como** de la Descripción cuando el MCP no
  expone un campo dedicado — deben quedar registrados en algún lugar del work item.

## Ejemplo — Repo vinculado a ADO con MCP disponible

- *Contexto:* `.agents/MEMORY.md` contiene `azure_devops_project: MyProject`. MCP de ADO disponible. La
  US padre (`US-003: Endpoint de autenticación`) tiene `Work Item (ADO): [#1500](https://dev.azure.com/…)`
  en su encabezado.
- *Entrada:* generar TCs para `AC-001` de `US-003`.
- *Comportamiento:* El agente detecta ADO (en `SKILL.md`), lee la base común y este archivo, y verifica
  el MCP. Resuelve la jerarquía: busca el Test Plan `MyProject` — no existe, lo crea; busca dentro de él
  el Test Suite `US-003: Endpoint de autenticación` — no existe, lo crea. Con el Suite resuelto, crea el
  work item `Test Case` dentro de él: título GWT (abreviado si supera 255 caracteres), Pasos de
  ejecución en el campo `Steps`, Descripción con el resto del documento serializado por secciones, y
  vinculado además a `#1500` si el MCP lo permite. Extrae `id: 2210` y genera
  `TC-2210-login-credenciales-validas-happy.md` con `Work Item (ADO): [#2210](…)` en el encabezado. El
  resto del flujo de `test-define` (Pasos 4 y 5) continúa normalmente. Para el siguiente TC del mismo
  `AC-001` (u otro AC de `US-003`), reutiliza el mismo Test Plan y Test Suite sin volver a crearlos.
