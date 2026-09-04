# Opciones de `.sdd-devkit/settings.json`

Referencia completa de cada opción de `.sdd-devkit/settings.json`: para qué sirve y qué skill o regla transversal la resuelve. `arch-init` crea este archivo en la raíz de **cada proyecto** que adopta el harness (no en el plugin); ver la introducción y el ejemplo completo en el [README](README.md#configuración-del-proyecto-sdd-devkitsettingsjson). El schema formal —tipos, enums y campos obligatorios— vive en [schemas/settings.schema.json](schemas/settings.schema.json); la plantilla mínima que genera `arch-init` en [skills/arch-init/assets/settings-template.json](skills/arch-init/assets/settings-template.json).

---

## `language`

| Campo | Valores | Para qué sirve |
|-------|---------|-----------------|
| `language` | `es` · `en` · `fr` · `de` · `it` | Idioma en el que cada skill redacta artefactos y mensajes al usuario. Sin este valor, el skill lo infiere del contexto o pregunta — ver [reference/language.md](reference/language.md). |

## `specification`

Rutas de las especificaciones y política de casos de prueba al planificar.

| Campo | Valores | Para qué sirve |
|-------|---------|-----------------|
| `basePath` | ruta relativa (ej. `docs/specs/`) | Dónde viven las especificaciones (`US-XXX`, `WI-XXX`, `TK-XXX`, `TC-XXX`, `RS-XXX`...). |
| `archivePath` | ruta relativa (ej. `docs/archive/`) | Dónde se archiva el trabajo cerrado. Ver el contrato de archivado en [reference/artifacts.md](reference/artifacts.md). |
| `trackingEnabled` | `true` · `false` | Activa o desactiva el envío de eventos de seguimiento de especificaciones. |
| `trackingUrl` | URL | Endpoint de eventos. Obligatorio cuando `trackingEnabled: true`. |
| `artifactRoot` | código (ej. `US-001`) | Artefacto raíz que el CLI de tracking consulta por defecto cuando la invocación no trae `--requirement <code>`. |
| `testCases.mode` | `ask` · `always` · `never` | Si `work-define`/`work-plan` ofrecen `test-define` al dejar una historia o sus tareas en `Ready`: preguntando, invocándolo directo o sin ofrecerlo. Detalle en [reference/planning.md](reference/planning.md). |
| `testCases.askDetails` | `true` · `false` | Si `test-define` entrevista al usuario (entorno, roles, datos, escenarios de error) antes de generar los `TC-XXX`, o aplica valores por defecto documentados y anota los supuestos. No cambia el alcance: siempre cubre todos los criterios de aceptación. |

## `implementation`

Ritmo de confirmación y control de flujo durante `work-implement`. Detalle en [reference/implementation.md](reference/implementation.md).

| Campo | Valores | Para qué sirve |
|-------|---------|-----------------|
| `confirmByUnit` | `always` · `never` | Si se pide confirmación del usuario por cada unidad de trabajo implementada. |
| `uncommittedChanges` | `commit` · `stash` · `ask` | Qué hacer con cambios sin commitear al iniciar o reanudar una sesión de implementación. |
| `workTree` | `ask` · `always` · `never` | Si el trabajo se aísla en un git worktree temporal. |
| `workTreePath` | ruta (ej. `../worktrees`) | Dónde crear esos worktrees temporales. |
| `maxParallel` | entero, `-1` = sin límite | Máximo de tareas ejecutándose en paralelo. |
| `archiveMode` | `ask` · `always` · `never` | Al cerrar un trabajo, si `work-integrate`/`pr-create` mueven su carpeta a `archivePath`: preguntando (mostrando origen/destino), siempre o nunca. |
| `handoff` | `always` · `ask` | Al cerrar el alcance implementado, si se invoca directo el siguiente skill del ciclo o se presentan las opciones y se espera la elección del usuario. |

## `verification`

Puertas de cierre que ejecuta `work-integrate` antes del merge. Detalle en [reference/verification.md](reference/verification.md).

| Campo | Valores | Para qué sirve |
|-------|---------|-----------------|
| `qualityCheck.enabled` | `true` · `false` | Si la puerta `quality-check` corre antes del merge. |
| `qualityCheck.confirmFix` | `always` · `never` | Si `quality-check` pide confirmación antes de corregir un fallo, o corrige directo. |
| `codeReview.enabled` | `true` · `false` | Si la puerta `code-review` corre antes del merge. |
| `codeReview.confirmFix` | `always` · `never` | Si `code-review` pide confirmación antes de aplicar la corrección de un hallazgo bloqueante, o la aplica directo. |
| `requirementCoverage.enabled` | `true` · `false` | Si la puerta `trace-validate` corre antes del merge. |
| `requirementCoverage.confirmFix` | `always` · `never` | Reservado por consistencia con las otras puertas — `trace-validate` no corrige por sí mismo (solo reporta y delega la ejecución en `quality-check`), así que hoy no tiene efecto. |
| `handoff` | `always` · `ask` | Dentro de `work-integrate`, tras un veredicto de cierre que deja pasar (puertas activas en `APPROVED`/`APPROVED_WITH_NOTES`): continuar con archivado y merge sin preguntar, o pedir confirmación. |

Una puerta con `enabled: false` no bloquea el merge, pero tampoco cuenta como aprobada.

## `git`

Comportamiento del skill `git-commit`. Detalle en [reference/git.md](reference/git.md).

| Campo | Valores | Para qué sirve |
|-------|---------|-----------------|
| `commitConfirmation` | `always` · `never` | Si se muestra la propuesta de división en varios commits y se espera confirmación antes de ejecutar el lote. Un commit único nunca se confirma: el mensaje se infiere y se ejecuta tras la validación. |
| `push` | `ask` · `always` · `never` | Política de push tras completar el/los commits. Solo aplica en invocación directa del usuario, nunca cuando `git-commit` es invocado por otro skill (`work-integrate`, `pr-create`). |
| `integrationBranches` | lista de `{ name, commitPolicy }` | Ramas de integración o despliegue del repositorio. Vacía o ausente ⇒ ningún skill asume `main`/`develop`: pregunta cuando necesite resolver una. `commitPolicy: merge` admite commit y merge en local sin confirmación extra; `commitPolicy: pull_request` no admite commit ni merge en local — solo entra trabajo vía pull request. |

Las gates de seguridad de `git-commit` (detección de secretos, archivos sensibles) no son configurables.

## `projectManagement`

Integración opcional con un sistema de tickets externo, usada por `work-plan`, `test-define` y `work-research`. Detalle en [reference/project-management.md](reference/project-management.md).

| Campo | Valores | Para qué sirve |
|-------|---------|-----------------|
| `enabled` | `true` · `false` | Activa o desactiva la integración. Desactivada ⇒ los artefactos usan ID secuencial local. |
| `provider` | `jira` · `azure-devops` | Proveedor del sistema de tickets. Obligatorio cuando `enabled: true`. |
| `host` | URL | URL base de la instancia (ej. `https://tu-organizacion.atlassian.net`). Obligatorio cuando `enabled: true`. |
| `workspace` | texto | Organización o subdominio en el servicio externo. Obligatorio cuando `enabled: true`. |
| `project` | texto | Clave del proyecto (Jira) o nombre del proyecto (Azure DevOps). Obligatorio cuando `enabled: true`. |

---

Cuando el seguimiento de specs está activo (`specification.trackingEnabled: true`), el token `SDD_DEVKIT_ACCESS_TOKEN` vive en `.sdd-devkit/.env` (no versionado, `arch-init` lo deja en `.gitignore`) — no en `settings.json`.
