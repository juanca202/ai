# Uso de los skills

Guía práctica de cuándo y cómo usar cada skill de **SDD Devkit**. Para el flujo completo, ver el [README](README.md).

Invocación típica: `/nombre-skill` o una frase que describa lo que quieres hacer. Si tienes un artefacto de referencia (una historia, una tarea, un caso de prueba), pásalo en el mismo mensaje.

---

## Harness

Skills que preparan y mantienen la base del proyecto — arquitectura y control de versiones —, independientes del requerimiento en el que estés trabajando.



### arch-init

**Cuándo:** preparar un proyecto (nuevo o existente, uno o varios repositorios) para trabajar con el plugin.

**Produce:** los archivos base del proyecto (`AGENTS.md`, `CLAUDE.md`, memoria, configuración, índices de arquitectura) y una compuerta de calidad mínima. Al terminar sugiere continuar con `work-define` o `work-plan`.

**Según el punto de partida:**


| Situación              | Qué hace                                                              |
| ----------------------- | ----------------------------------------------------------------------- |
| **Sin código**         | Te ayuda a definir el stack tecnológico.                                |
| **Con código base**    | Detecta el stack directamente del scaffold.                             |
| **Con implementación** | Además propone decisiones de arquitectura ya implícitas en el código.   |
| **Solo specs**         | Repositorio de solo documentación: no pasa por stack ni arquitectura propia. |

**Si tu solución tiene varios repositorios**, crea uno de especificaciones que agrupa a los demás como submódulos, y repite la preparación en cada uno.

**Ejemplos de invocación:**

```text
/arch-init
/arch-init este repo ya tiene código; completa lo que falte
/arch-init la solución tendrá un backend y un frontend en repos separados
```

- «Inicializa el proyecto para agentes»
- «Prepara este repo: AGENTS.md, MEMORY y arquitectura»
- «Bootstrapea el harness; queremos una API en NestJS con Postgres»

---



### arch-manage

**Cuándo:** documentar o cambiar una decisión de arquitectura (ADR) o una norma del proyecto (estándar).

**Produce:** un documento de decisión (`docs/adr/`) y/o un criterio de cumplimiento en un estándar del dominio correspondiente (`docs/standards/`, p. ej. *Testing Standards*).

**Según el caso:**


| Caso                  | Cuándo aplica                                 | Resultado                                                     |
| --------------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| **Solo decisión**     | Elección puntual, sin regla que verificar      | Documento de decisión                                          |
| **Decisión + norma**  | La decisión fija una regla verificable         | Documento de decisión + criterio en el estándar del dominio    |
| **Solo norma**        | Regla nueva sin una decisión detrás            | Criterio en un estándar existente (o uno nuevo)                |

**Ejemplos de invocación:**

```text
/arch-manage
/arch-manage documenta que usamos GraphQL y cobertura unitaria ≥ 80%
/arch-manage marca ADR-003 como superada por ADR-012
/arch-manage añade al Testing Standards: e2e obligatorio con Playwright
```

- «Registra la decisión de migrar de MySQL a Postgres»
- «Documenta por qué las APIs son GraphQL y la norma que lo exige»
- «Cambia ADR-007 a Aceptado»

---



### arch-discover

**Cuándo:** ya tienes código y quieres identificar qué decisiones y normas de arquitectura ya están implícitas en él, para documentarlas.

**Produce:** una lista de candidatos a decisión/estándar; al aprobarlos, los documenta con `arch-manage`.

**Ejemplos de invocación:**

```text
/arch-discover
/arch-discover enfócate en testing y api
/arch-discover solo el módulo src/payments
```

- «¿Qué decisiones arquitectónicas tiene este proyecto?»
- «Descubre decisiones y estándares implícitos en el repo»
- «Analiza la arquitectura; prioriza seguridad y persistencia»

---



### arch-audit

**Cuándo:** comprobar si el código cumple los estándares y reglas ya documentados del proyecto.

**Produce:** un informe con hallazgos priorizados y un veredicto (`docs/audits/`).

**Si ya existe una auditoría previa**, puedes revalidarla (solo revisa los hallazgos anteriores) o pedir una nueva desde cero.

**Veredicto:** Aprobado · Rechazado · Aprobado con observaciones.

**Ejemplos de invocación:**

```text
/arch-audit
/arch-audit revalida la última auditoría
/arch-audit nueva auditoría desde cero
```

- «¿El código respeta los estándares?»
- «Audita el cumplimiento del proyecto»
- «Chequea las reglas del repo»

---



### git-commit

**Cuándo:** comitear cambios pendientes con un mensaje claro.

**Produce:** el o los commits en tu rama actual; hace push solo si el proyecto está configurado para eso.

**Cómo trabaja:** si el cambio es un único tema, comitea directo con un mensaje inferido del diff. Si mezcla varios temas sin relación, te propone dividirlo en varios commits antes de continuar. Si un pre-commit hook falla, corrige y crea un commit nuevo (nunca reescribe uno anterior).

Detiene el commit si detecta un secreto o un archivo sensible, salvo que confirmes explícitamente incluirlo.

**Ejemplos de invocación:**

```text
/git-commit
/commit
/git-commit separa docs y feat en commits distintos
/git-commit Closes #42
```

- «Haz commit de lo pendiente»
- «Separa los cambios en varios commits»
- «Commit con footer Closes #128» (si tienes el número del issue)

---



## Specs

Skills del ciclo de vida de un requerimiento: de la idea a un Pull Request mergeado.



### work-research

**Cuándo:** investigar algo antes de especificarlo, planificarlo o implementarlo.

**Produce:** un informe (`docs/specs/research/`), y a veces artefactos adicionales según lo que investigues.

**Según lo que le pidas:**


| Situación                          | Qué te entrega                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Un tema o pregunta abierta          | Hallazgos de producto, arquitectura, técnica, o el impacto de un cambio                                  |
| Una historia o tarea con lagunas    | Qué falta decidir antes de continuar                                                                     |
| Un bug o defecto                    | Reproducción, causa raíz y una tarea de corrección lista para planificar                                 |
| Un caso de prueba existente         | Un veredicto sobre si está bien planteado                                                                |
| Código legado sin documentación     | Las funcionalidades que descubre, listas para definirles casos de prueba                                 |
| Una migración entre proyectos       | Un plan de qué migrar y cómo validarlo                                                                   |

**Ejemplos de invocación:**

```text
/work-research
/work-research US-004
/work-research TK-012 ¿qué falta por decidir antes de implementar?
/work-research el bug #4821
/work-research revisa TC-001-user-login
/work-research migrar ../legacy-app → este repo
/work-research analiza el módulo src/billing (legacy)
/work-research ¿monolito o microservicios para el catálogo?
```

- «¿Es viable usar Temporal para orquestación?»
- «Investiga las lagunas de US-007»
- «El login falla con contraseñas de más de 64 caracteres»
- «Documenta las funcionalidades del código en src/orders»
- «Migración de proyecto-origen a proyecto-destino»

---



### requirement-refine

**Cuándo:** tienes un requerimiento en bruto (idea, ticket, correo, wireframes) y quieres estructurarlo antes de convertirlo en historias de usuario. Paso opcional: si el requerimiento ya está claro, puedes ir directo a `work-define`.

**Produce:** una especificación de requisitos (`docs/specs/requirements/`) con alcance, requisitos priorizados, wireframes si hay interfaz, stack tecnológico, repositorios y equipo.

**Estados:** `Draft` (quedan cosas por resolver) · `Ready` (listo para convertir en historias con `work-define`).

**Ejemplos de invocación:**

```text
/requirement-refine
/requirement-refine portal de proveedores para subir facturas
/requirement-refine actualiza SRS-002: cambia el stack a Auth0
/requirement-refine estructura este requerimiento: <pegar ticket>
```

- «Refina este requerimiento antes de armar las historias»
- «Necesito una especificación para esta idea, no sé todavía con qué la vamos a construir»

---



### work-define

**Cuándo:** crear o actualizar una historia de usuario. Puede partir de una necesidad descrita por ti, o de una especificación ya resuelta con `requirement-refine`.

**Produce:** una historia de usuario (`docs/specs/user-stories/`) con criterios de aceptación.

**Estados:** `Draft` (quedan cosas por resolver) · `Ready` (lista para planificar tareas o definir casos de prueba).

**Ejemplos de invocación:**

```text
/work-define
/work-define como comprador quiero guardar favoritos
/work-define actualiza US-003: añade criterio de timeout 3s
/work-define a partir de RS-002
/work-define arma las historias de SRS-003
```

- «Crea una historia de usuario para el checkout con tarjeta»
- «Refina US-011: faltan criterios de accesibilidad»

---



### design-define

**Cuándo:** documentar el diseño técnico de una historia o tarea — modelos de datos, endpoints, flujos o diagramas — como referencia para implementarla.

**Produce:** documentación técnica (`docs/specs/technical-docs/`), enlazable desde la historia o tarea correspondiente.

**Ejemplos de invocación:**

```text
/design-define
/design-define modelo de Factura y API de pagos
/design-define diagrama de contenedores para billing
/design-define detalle técnico de TK-004 (flujo de aprobación)
/design-define enlázalo desde US-008
```

- «Documenta el modelo de datos de Pedido»
- «Especifica los endpoints REST de autenticación»
- «Dame más detalle del flujo de reembolso de la TK-004»

---



### test-define

**Cuándo:** documentar casos de prueba a partir de los criterios de aceptación de una historia, tarea o funcionalidad. No implementa ni ejecuta las pruebas — solo las documenta.

**Produce:** casos de prueba junto al artefacto de origen (historia, tarea de mantenimiento o funcionalidad).

Cada criterio se cubre desde varios ángulos (camino esperado, error, límites — el que aplique) y se marca si la prueba es manual o automatizable.

**Ejemplos de invocación:**

```text
/test-define
/test-define US-005
/test-define WI-003
/test-define FT-002
/test-define US-005 solo criterios AC-001 y AC-003
```

- «Crea casos de prueba para US-009»
- «Genera casos de prueba desde los criterios de WI-014»
- «Documenta pruebas para la funcionalidad legacy FT-001»

---



### work-plan

**Cuándo:** planificar el trabajo técnico antes de implementarlo, sin escribir código ni pruebas todavía.

**Produce:**


| Situación                          | Qué crea                                        |
| ------------------------------------- | ------------------------------------------------- |
| Hay una historia de usuario asociada | Tareas técnicas dentro de esa historia            |
| No hay historia (bug, deuda, mantenimiento) | Una tarea de mantenimiento independiente     |

**Ejemplos de invocación:**

```text
/work-plan
/work-plan US-007
/work-plan planifica tareas para US-004 agrupadas por repo
/work-plan WI: actualizar Spring Boot a 3.3
```

- «Planifica US-007»
- «Tareas para esta historia»
- «Plan de mantenimiento: refactor del módulo de auth»
- «Descompón el bug de timeouts en una tarea»

---



### work-implement

**Cuándo:** codificar trabajo ya planificado y listo (`Ready`).

**Produce:**


| Recibe                          | Entrega                                                    |
| ---------------------------------- | ------------------------------------------------------------ |
| Una tarea técnica de una historia | La funcionalidad de esa tarea (código + pruebas)             |
| Una tarea de mantenimiento         | La funcionalidad completa de esa tarea (código + pruebas)    |
| Casos de prueba ya documentados    | Las pruebas automatizadas de esos casos                      |
| Una funcionalidad legacy (FT)      | Las pruebas automatizadas que la cubren                      |

Por defecto implementa de a una unidad, pausando para tu confirmación entre cada una — puedes pedir que continúe sin pausas si prefieres avanzar de corrido.

**Ejemplos de invocación:**

```text
/work-implement
/work-implement TK-003
/work-implement US-006
/work-implement WI-002
/work-implement TC-004
/work-implement US-006 de corrido (sin preguntar entre tareas)
```

- «Implementa TK-011»
- «Desarrolla las tareas listas de US-006»
- «Automatiza TC-004 y TC-007 de la US-042»

---



### quality-check

**Cuándo:** correr las verificaciones automáticas del proyecto antes de integrar un cambio (tipado, linter, pruebas, cobertura, build, e2e, análisis estático).

**Produce:** un informe con el resultado de cada verificación y un veredicto: Aprobado · Rechazado · Incompleto.

**Alcance:** todo el proyecto en el estado actual de tu rama, no solo lo que cambiaste.

Si algo falla y confirmas corregirlo, aplica el arreglo y vuelve a verificar.

**Puedes acotar qué se ejecuta** al invocarlo:

```text
/quality-check
/quality-check only build
/quality-check no-tests
/quality-check no-e2e include-linter-warnings
/quality-check blocking-only save-report
```

- «Corre solo el build antes del merge»
- «Ejecuta los checks sin el análisis estático y guarda el informe»

---



### code-review

**Cuándo:** revisión de código antes de integrar un cambio — intención, arquitectura y diseño. No ejecuta pruebas ni checks automáticos, eso lo hace `quality-check`.

**Produce:** un informe con hallazgos (`docs/audits/code-review.md`) sobre el diff de tu rama.

**Severidad de los hallazgos:** 🔴 Crítico · 🟠 Mayor (bloquean el merge) · 🟡 Menor · 💡 Sugerencia.

**Veredicto:** Aprobado · Rechazado · Incompleto.

**Puedes acotar la revisión** al invocarlo:

```text
/code-review
/code-review base develop
/code-review working-tree
/code-review scope src/domain
/code-review blocking-only save-report
```

- «Revisa la arquitectura y el diseño del cambio»
- «Revisa solo lo que bloquea el merge»
- «Revisa lo que llevo antes de commitear»

---



### trace-validate

**Cuándo:** verificar que cada criterio de aceptación de una historia, tarea o funcionalidad tenga una prueba que lo cubra.

**Produce:** una matriz de cobertura (`coverage.md`) con el estado de cada criterio: cubierto, parcial o sin cubrir, y un veredicto general.

**Ejemplos de invocación:**

```text
/trace-validate
/trace-validate US-012
/trace-validate WI-004
/trace-validate FT-001
/trace-validate US-012 solo AC-002 y AC-005
```

- «Genera la matriz de trazabilidad de US-012»
- «¿Los criterios de WI-004 están cubiertos por pruebas?»
- «Valida cobertura del feature legacy FT-003»

---



### work-integrate

**Cuándo:** cerrar e integrar tu trabajo directamente a la rama de desarrollo (sin pasar por un Pull Request).

**Produce:** el merge de tu rama, ya verificado.

**Antes de integrar, corre en orden:** `quality-check` → `code-review` → `trace-validate`. Si tienes cambios sin commitear, los comitea primero automáticamente.

**Al terminar**, te pregunta si quieres archivar la historia o tarea ya cerrada (mover su carpeta a `docs/archive/`). Puedes declinar sin que eso bloquee la integración.

**Ejemplos de invocación:**

```text
/work-integrate
/work-integrate US-006
/work-integrate WI-002
/work-integrate integra la rama test/FT-003
```

- «Cierra e integra US-006»
- «Haz merge de esta rama a la base»
- «Finaliza el WI-002 e intégralo»

---



### pr-create

**Cuándo:** abrir un Pull/Merge Request hacia una rama destino (te la pregunta si no la indicas).

**Produce:** el PR/MR creado, con título y descripción generados automáticamente. Detecta la plataforma (GitHub, GitLab, Bitbucket, Azure Repos, Gitea).

**Antes de crear el PR, corre:** `quality-check`, `code-review` y `trace-validate` — salvo que sea una promoción entre ramas de despliegue (por ejemplo `develop` → `main`), donde cada trabajo ya pasó esas puertas al integrarse y solo corre `quality-check`.

**Al terminar**, si corresponde, te pregunta si quieres archivar la historia o tarea ya cerrada. Puedes declinar sin que eso bloquee la creación del PR.

**Ejemplos de invocación:**

```text
/pr-create
/pr-create hacia develop
/pr-create base main
```

- «Crea el PR»
- «Abre un MR a develop»
- «Promueve develop a master»
