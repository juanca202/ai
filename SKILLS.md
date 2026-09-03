# Uso de los skills

Guía práctica de cuándo y cómo usar cada skill de **SDD Devkit**. Para el flujo completo del harness, ver el [README](README.md).

Invocación típica: `/nombre-skill` o una frase que active la descripción del skill. Donde el skill admite contexto (artefacto, alcance, tema), pásalo en el mismo mensaje.

---

## Reglas transversales

Estas reglas aplican a **todos los skills**. Cuando un skill se aparta de alguna, lo declara como excepción en su propia sección:

| Regla | Detalle | Qué fija |
|-------|-----------|----------|
| **Resolución de idioma** | [`reference/language.md`](reference/language.md) | Todo skill y agente resuelve el idioma antes de ejecutarse. Declaran excepción: `arch-init`, `test-define`, `design-define`, `git-commit`, `pr-create`, `work-research`, `code-review`, `quality-check`, `trace-validate`, `work-implement`, y los agentes `quality-specialist` y `ui-specialist`. |
| **Política de planificación** | [`reference/planning.md`](reference/planning.md) | Para `work-define` y `work-plan`: al cerrar la planificación —US en Ready, o tareas en Ready— se pregunta si definir los casos de prueba (`ask`, por defecto), se invoca `test-define` directo (`always`) o no se ofrece (`never`), resuelto desde `.sdd-devkit/settings.json` (`specification.testCases.mode`). Los `TC-XXX` cuelgan del artefacto padre: el segundo skill en llegar no repite la oferta. |
| **Política de implementación** | [`reference/implementation.md`](reference/implementation.md) | Para `work-implement`: ritmo de confirmación por unidad (`confirmByUnit`), qué hacer con cambios sin commitear al iniciar (`uncommittedChanges`), worktrees y su ruta (`workTree`, `workTreePath`), concurrencia máxima (`maxParallel`) y si el cierre pasa al siguiente skill sin preguntar (`handoff`), resueltos desde `.sdd-devkit/settings.json`. |
| **Política de commit y push** | [`reference/git.md`](reference/git.md) | Para `git-commit`: si se muestra la propuesta de división en varios commits y se espera confirmación (`commitConfirmation` — un commit único nunca se confirma) y si se hace push tras commitear (`push`, solo en invocación directa), resueltos desde `.sdd-devkit/settings.json`. Las gates de seguridad no son configurables. |
| **Política de verificación** | [`reference/verification.md`](reference/verification.md) | Para `quality-check`, `code-review` y `work-integrate`: por puerta (`qualityCheck`, `codeReview`, `requirementCoverage`), si corre antes del merge (`enabled`, lo resuelve `work-integrate`) y si pide confirmación antes de corregir lo que encuentre (`confirmFix`, lo resuelve `quality-check`/`code-review`; no aplica a `trace-validate`); y si, dentro de `work-integrate`, el cierre continúa con el archivado y el merge sin preguntar (`handoff`). Resuelto desde `.sdd-devkit/settings.json` (`verification.*`). Una puerta omitida no bloquea el merge pero tampoco cuenta como aprobada. |
| **Cómo preguntar al usuario** | [`reference/asking.md`](reference/asking.md) | Herramienta de preguntas estructuradas, opciones cortas y excluyentes, una tanda al inicio, fallback en prosa enumerada. |
| **Veredictos y estados** | [`reference/verdicts.md`](reference/verdicts.md) | Para `quality-check`, `code-review`, `trace-validate` y `arch-audit`: valor canónico + símbolo estables, **etiqueta siempre en el idioma resuelto**. Los consumidores leen el **símbolo**, nunca la palabra. |
| **Artefactos** | [`reference/artifacts.md`](reference/artifacts.md) | Ruta de cada artefacto, identificadores y numeración, y el contrato de archivado (archivar no libera el ID). |
| **Gestor de proyectos** | [`reference/project-management.md`](reference/project-management.md) | Para `work-plan`, `test-define` y `work-research`: si la integración está activa, con qué proveedor y con qué `host`/`workspace`/`project`, resueltos desde `.sdd-devkit/settings.json`. Desactivada ⇒ ID secuencial local. |

---

## Convención: enlace al gestor de proyectos

Cualquier artefacto que enlace a su work item en un sistema de seguimiento externo (Azure DevOps, Jira u otro) lo hace **en la cabecera de metadatos** con esta etiqueta única, sin variantes por tipo de artefacto:

```markdown
**Work Item ({{Sistema}}):** {{enlace markdown al work item — omitir la línea si no aplica}}
```

- `{{Sistema}}` es el nombre corto del sistema de seguimiento (p. ej. `Work Item (ADO):` para Azure DevOps).
- Aplica a `US-XXX`, `TK-XXX`, `WI-XXX`, `TC-XXX`, `FT-XXX` y a los artefactos de investigación (`RS-XXX`, diagnóstico de bug, análisis de test case). **No** se usan etiquetas propias por tipo (`Bug (gestor de proyectos):`, `Test Case (ADO):`, etc.).
- La línea se **omite** si el artefacto no tiene work item; nunca se deja con `N/A`.
- Fuera de la cabecera —listas de referencias, tablas, prosa— el enlace se escribe como cualquier otro enlace markdown; esta convención rige solo la etiqueta de cabecera.

---



## Harness



### arch-init

**Cuándo:** bootstrapear un proyecto para agentes (nuevo o existente, uno o varios repositorios): git — o, si la solución abarca varios repos, un repositorio de especificaciones que los agrega como submódulos —, `AGENTS.md` / `CLAUDE.md` / `.agents/MEMORY.md` / `.sdd-devkit/settings.json`, índices de ADR/estándares, stack y compuerta de calidad.

**Produce:** archivos base del harness; al cerrar sugiere continuar con `work-define` o `work-plan`.

**Opciones — punto de partida** (decide el camino, no el resultado final):


| Situación              | Qué implica                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| **Sin código**         | Obliga a definir stack (Paso 2); no hay descubrimiento desde código. |
| **Con código base**    | Stack detectable; sin lógica de negocio propia aún.                  |
| **Con implementación** | Invoca `arch-discover` completo para candidatos de ADR/estándares.   |

Se clasifica por repositorio: en un proyecto de un solo repo, una sola vez; en multi-repo, una vez por cada submódulo (el repositorio de especificaciones nunca se clasifica — no tiene código propio).

**Opciones — topología** (repo único vs. multi-repo, se resuelve antes de lo anterior):

| Topología      | Qué implica                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Un solo repo** | Comportamiento estándar: el harness vive en ese mismo repositorio.                                              |
| **Varios repos** | Crea (o usa) un repositorio de especificaciones como principal, con cada repo adicional agregado como submódulo en su raíz; el harness vive en el de especificaciones y el resto de pasos se repiten por submódulo. |

**Handoffs:** `arch-discover` (brownfield, por repositorio si es multi-repo), `arch-manage` (candidatos aceptados, por raíz de arquitectura), consulta a `quality-check` (qué validar por stack). Reejecutable: solo completa lo que falte.

**Ejemplos de invocación:**

```text
/arch-init
/arch-init este repo ya tiene código; completa lo que falte del harness
/arch-init la solución tendrá un backend y un frontend en repos separados
```

- «Inicializa el harness del proyecto»
- «Prepara este repo para agentes: AGENTS.md, MEMORY y docs/adr»
- «Bootstrapea el harness; queremos una API en NestJS con Postgres» (sin código → define stack con ese contexto)

---



### arch-manage

**Cuándo:** documentar o cambiar una decisión arquitectónica (ADR) o una norma de dominio (estándar / criterio de cumplimiento).

**Produce:** `docs/adr/ADR-XXX-*.md` y/o criterios de cumplimiento (`CR-XXX`) en `docs/standards/` (p. ej. *Testing Standards*), con fitness functions cuando apliquen — **en la raíz del repositorio al que pertenece el código**: la principal, o la del submódulo, si la decisión es suya (ver [`reference/artifacts.md`](reference/artifacts.md#raíz-de-arquitectura-adr-estándares-y-fitness-functions)).

**Opciones — qué se produce:**


| Caso                  | Input                                         | Resultado                                                      |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| **A. Solo ADR**       | Decisión puntual/histórica sin regla continua | ADR con `emits: []`; no toca estándares                        |
| **B. ADR + estándar** | Decisión que fija una regla verificable       | ADR + criterio(s) de cumplimiento en el estándar del dominio   |
| **C. Solo estándar**  | Regla sin decisión nueva                      | Criterio(s) de cumplimiento en un estándar existente (o nuevo) |


**Estados habituales:** ADR `Draft` / `Proposed` / `Accepted` / `Superseded` / `Deprecated`; estándar `Draft` / `Active` / `Deprecated` / `Superseded`. Un ADR `Accepted` no se reescribe: se supersede.

**Handoffs:** lo consume `arch-audit`; lo invocan `arch-init` y `arch-discover`.

**Ejemplos de invocación:**

```text
/arch-manage
/arch-manage documenta que usamos GraphQL y cobertura unitaria ≥ 80%
/arch-manage marca ADR-003 como Superseded por ADR-012
/arch-manage añade al Testing Standards: e2e MUST con Playwright
```

- «Registra la decisión de migrar de MySQL a Postgres en 2026» → caso A (solo ADR)
- «Documenta por qué las APIs son GraphQL y la norma que lo exige» → caso B
- «Aclara la excepción del umbral de cobertura en Testing Standards» → caso C
- «Cambia ADR-007 a Accepted»

---



### arch-discover

**Cuándo:** hay código existente y se quieren sacar a la luz decisiones/normas implícitas.

**Produce:** lista de candidatos; tras aprobación del usuario, crea los artefactos vía `arch-manage`. Cubre **una raíz de arquitectura por corrida** (repo principal o submódulo).

**Opciones — clasificación de cada candidato:**


| Tipo                               | Qué proponer                                                 |
| ---------------------------------- | ------------------------------------------------------------ |
| **Solo ADR**                       | Elección histórica/puntual sin regla continua                |
| **ADR + criterio de cumplimiento** | Decisión que además fija una norma verificable en un dominio |


Los candidatos se agrupan por **dominio técnico/funcional** (testing, api, security, etc.; ver catálogo en el skill). No hay modo que se detenga antes de la Fase 5: tras aprobar, se crean los artefactos en la misma ejecución.

**Handoffs:** `arch-manage` (creación); suele invocarlo `arch-init` en brownfield.

**Ejemplos de invocación:**

```text
/arch-discover
/arch-discover enfócate en testing y api
/arch-discover solo el módulo src/payments
```

- «¿Qué decisiones arquitectónicas tiene este proyecto?»
- «Descubre ADRs y estándares implícitos en el repo»
- «Analiza la arquitectura; prioriza seguridad y persistencia»

---



### arch-audit

**Cuándo:** comprobar si una raíz de arquitectura —el repo principal o un submódulo— cumple los criterios de cumplimiento de su `docs/standards/` y las reglas de `AGENTS.md`. Una raíz por corrida.

**Produce:** `docs/audits/arch-audit-YYYY-MM-DD.md` **en la raíz auditada**, con hallazgos priorizados y veredicto.

**Opciones — si ya hay auditoría previa:**


| Opción                         | Efecto                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Revalidar**                  | Revisa hallazgos previos; añade entrada en `## Revalidaciones` sin reescribir el informe original |
| **Nueva auditoría desde cero** | Audita todas las normas de nuevo                                                                  |


**Veredicto:** `APPROVED` (`✅`) · `REJECTED` (`❌`) · `APPROVED_WITH_NOTES` (`⚠️`) — la etiqueta del informe va en el idioma resuelto.

Criterios en estándares `Draft` se listan pero no priorizan el veredicto; `Deprecated`/`Superseded` solo si el código sigue dependiendo de ellos.

**Ejemplos de invocación:**

```text
/arch-audit
/arch-audit revalida la última auditoría
/arch-audit nueva auditoría desde cero
```

- «¿El código respeta los estándares?»
- «Audita el cumplimiento de AGENTS.md y docs/standards»
- «Revalida arch-audit-2026-06-30.md»
- «Chequea las reglas del repo»

> La auditoría cubre **todos** los estándares del repo; no hay modificador para acotarla a uno. Si el usuario pide enfocarse en un dominio, se audita completo y se le señala dónde mirar.

---



### git-commit

**Cuándo:** hacer commit(s) con Conventional Commits a partir del diff real.

**Produce:** commit(s) locales; push opcional según `.sdd-devkit/settings.json` (`git.push`), solo en invocación directa del usuario.

**Opciones — flujo:**


| Condición                | Flujo                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Sin cambios              | Informa y no commitea                                                                           |
| Un solo tema lógico      | Commit estándar: infiere el mensaje, valida y commitea **sin confirmar** (`commitConfirmation` no aplica aquí) |
| Varios temas mezclados   | Propone varios commits y ejecuta en secuencia (misma excepción con `commitConfirmation: never`)       |
| Falló un pre-commit hook | Corrige, re-stagea y **nuevo** commit (sin `--amend` ni `--no-verify` salvo petición explícita) |

**Configuración (`.sdd-devkit/settings.json` → `git`):** `commitConfirmation` (`always`/`never`) decide si se confirma la propuesta de división en varios commits — un commit único nunca se confirma; `push` (`ask`/`always`/`never`) decide si se hace push tras completar el/los commits — nunca en invocación delegada por `work-integrate`/`pr-create`. Por defecto: `commitConfirmation: "always"`, `push: "never"`.


**Tipos de mensaje:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert` (tipo/scope en inglés). Detiene el commit ante secretos o archivos sensibles salvo confirmación explícita sobre ese archivo.

**Ejemplos de invocación:**

```text
/git-commit
/commit
/git-commit separa docs y feat en commits distintos
/git-commit Closes #42
```

- «Haz commit de lo pendiente»
- «Genera el mensaje Conventional Commits y confirma»
- «Separa los cambios en varios commits lógicos»
- «Commit con footer Closes #128» (solo si aportas el número)

---



## Specs



### work-research

**Cuándo:** investigar antes de especificar, planificar o implementar.

**Produce:** informe `RS-XXX` bajo `docs/specs/research/` (más artefactos según el flujo).

**Opciones — flujo según entrada:**


| Flujo                              | Entrada                                      | Salida / handoff                                                                                                                                    |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Investigación libre**            | Tema sin artefacto                           | Hallazgos por dominio: Producto, Arquitectura, Técnica o Cambio                                                                                     |
| **Analizar decisiones pendientes** | `US` / `TK` / `WI` en contexto               | Lagunas y decisiones pendientes → dueño del artefacto (`work-define` / `work-plan`)                                                                 |
| **Analizar issue**                 | Descripción de un defecto o código de un bug | Reproducción, causa raíz y diagnóstico de pruebas → **WI tipo** `bug-fix` vía `work-plan` (ciclo 🔴 TEST FAIL → fix → 🟢 TEST PASS). No genera `RS` |
| **Analizar test case**             | `TC-XXX`                                     | Veredicto de auditoría (TC correcto / incorrecto / incompleto / falso negativo…) → `test-define`, *Analizar issue*, `work-plan` o `trace-validate`  |
| **Analizar legado**                | Código sin requisitos/pruebas suficientes    | `FT-XXX` + TCs vía `test-define` → `trace-validate` → `work-implement` tipo feature (solo pruebas, no código funcional)                             |
| **Analizar migración**             | Proyecto origen + destino                    | Discovery + validación → `work-define` (cambio grande) o `work-plan` / WI (pequeño)                                                                 |


Si el repo tiene activada la integración con un gestor de proyectos en `.sdd-devkit/settings.json`, cualquier artefacto que se pase por su código se lee vía MCP y enruta al flujo según su tipo (historia/tarea → decisiones pendientes; bug → issue; test case → test case).

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

- «¿Es viable usar Temporal para orquestación?» → investigación libre (técnica)
- «Investiga las lagunas de US-007» → analizar decisiones pendientes
- «El login falla con contraseñas de más de 64 caracteres» → analizar issue
- «¿Este caso de prueba está bien planteado?» → analizar test case
- «Documenta features desde el código de `src/orders`» → analizar legado
- «Migración de proyecto-origen a proyecto-destino» → analizar migración

---



### work-define

**Cuándo:** crear o actualizar una historia de usuario (`US-XXX`).

**Produce:** `docs/specs/user-stories/US-XXX-{slug}/README.md` (documento funcional; no DTOs/endpoints — eso es `design-define`).

**Opciones:**


| Acción         | Notas                                                          |
| -------------- | -------------------------------------------------------------- |
| **Crear**      | ID, carpeta, plantilla, AC-XXX, INVEST, DoR                    |
| **Actualizar** | Conserva ids `AC-XXX`; ante conflicto TK ↔ US, prevalece la US |


**Estados:** `Draft` (lagunas en Observaciones) · `Ready` (DoR + INVEST + repos + AC completos). En Ready sugiere `test-define` y `work-plan`.

**Configuración (`.sdd-devkit/settings.json` → `specification.testCases.mode`):** `ask` (por defecto) pregunta si se definen los casos de prueba al llegar a Ready; `always` invoca `test-define` directo, sin preguntar; `never` no lo ofrece. `work-plan` se sigue ofreciendo igual en los tres casos. La otra clave del objeto, `askDetails`, la consume `test-define`, no la planificación.

**Ejemplos de invocación:**

```text
/work-define
/work-define como comprador quiero guardar favoritos
/work-define actualiza US-003: añade AC de timeout 3s
/work-define a partir de RS-002
```

- «Crea una historia de usuario para el checkout con tarjeta»
- «Refina US-011: faltan criterios de accesibilidad»
- «Estructura esta necesidad en una US Ready» (+ descripción del valor)

---



### design-define

**Cuándo:** documentar modelos, APIs, flujos o diagramas como referencia de implementación.

**Produce:** `docs/specs/technical-docs/[capability].md` (elementos `MD-XX`, `API-XX`, `FL-XX`, `DG-XX`).

**Anclas:** cada elemento va precedido de `<a id="md-01"></a>`, así que la referencia estable es `[capability].md#md-01` — **el id en minúsculas, no el título**. Es lo que consumen US/TK/WI: un ancla derivada del título depende del renderizador (la tilde de «Nota de crédito» se translitera en unos motores y se conserva en otros) y se rompe al renombrar el elemento.

**Opciones — modo de invocación:**


| Modo         | Quién                                     | Salida                                                           |
| ------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| **Directo**  | Usuario                                   | Documento + resumen; ofrece enlazar desde US/TK/WI               |
| **Delegado** | `work-define` / `work-plan` vía subagente | Documento + lista de referencias (ruta + ancla `#<id>`) para el llamador |


**Tipos de elemento:** modelo de datos, API/endpoint, flujo/proceso, diagrama (clases / C4).

**Ejemplos de invocación:**

```text
/design-define
/design-define modelo de Factura y API de pagos
/design-define diagrama C4 de contenedores para billing
/design-define detalle técnico de TK-004 (flujo de aprobación)
/design-define enlázalo desde US-008
```

- «Documenta el modelo de datos de Pedido»
- «Especifica los endpoints REST de autenticación»
- «Dame más detalle del flujo de reembolso de la TK-004»

---



### test-define

**Cuándo:** documentar casos de prueba (`TC-XXX`) desde criterios `AC-XXX` (IEEE 29119-4). No implementa ni ejecuta tests.

**Opciones — artefacto origen:**


| Tipo                                                                                   | TCs en                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `US-XXX`                                                                               | `…/US-XXX-…/test-cases/`                                          |
| `WI-XXX`                                                                               | `…/WI-XXX-…/test-cases/`                                          |
| `FT-XXX`                                                                               | `…/FT-XXX-…/test-cases/`                                          |
| Cualquier otro spec con criterios de aceptación codificados (`AC-001`, `1.1`, `R-3`…) | `test-cases/` junto al documento (confirmar ruta con el usuario) |


**Perspectivas por criterio:** Happy path · Error · Límite (se omite la que no aplique).

**Tipo de prueba (intención de diseño):** `Manual` **o** uno/varios de `Unit`, `Integration`, `API Test`, `Visual Test`, `E2E`.

**Ejemplos de invocación:**

```text
/test-define
/test-define US-005
/test-define WI-003
/test-define FT-002
/test-define US-005 solo criterios AC-001 y AC-003
/test-define docs/specs/api-pagos.md
```

- «Crea casos de prueba para US-009»
- «Genera TCs desde los AC de WI-014»
- «Documenta pruebas para el feature FT-001 (legacy)»

---



### work-plan

**Cuándo:** planificar sin escribir código ni pruebas.

**Opciones — tipo de plan:**


| Tipo                  | Señal                                          | Artefacto                            |
| --------------------- | ---------------------------------------------- | ------------------------------------ |
| **Tarea de historia** | Hay `US-XXX` asociada                          | `TK-XXX` bajo la carpeta de la US    |
| **Mantenimiento**     | Sin US (bug, refactor, deuda, deps, operativa) | `WI-XXX` en `docs/specs/work-items/` |


Solo se hace handoff a `work-implement` si el artefacto está en `Ready`. Si la integración con el gestor de proyectos está activa en `.sdd-devkit/settings.json`, sincroniza work items antes de crear archivos locales. Puede delegar detalle técnico a `design-define`.

**Ejemplos de invocación:**

```text
/work-plan
/work-plan US-007
/work-plan planifica tareas para US-004 agrupadas por repo
/work-plan WI: actualizar Spring Boot a 3.3
/work-plan completa TK-002 a Ready
```

- «Planifica US-007» → propuesta de `TK-XXX` por repositorio / AC, y luego elegir: crear los planes completos, crear stubs, otro o cancelar
- «Tareas para esta historia» (+ US en contexto)
- «Plan de mantenimiento: refactor del módulo de auth» → `WI-XXX`
- «Descompón el bug de timeouts en un WI»

---



### work-implement

**Cuándo:** codificar trabajo ya especificado en `Estado: Ready`. También recibe el **modo corrección** delegado por `quality-check` en el cierre (arreglar un check o una prueba en rojo sobre un `US-XXX`/`WI-XXX` ya implementado; ahí no aplica `Ready` ni working tree limpio).

**Opciones — tipo:**


| Tipo               | Qué se implementa                                          | Unidad de confirmación  |
| ------------------ | ---------------------------------------------------------- | ----------------------- |
| `TK-XXX` (bajo US) | Plan técnico de la TK (código + tests)                     | Una TK por confirmación |
| `WI-XXX`           | Plan del WI (código + tests)                               | El WI completo          |
| `TC-XXX`           | Las pruebas automatizadas de esos test cases               | Un TC por confirmación  |
| `FT-XXX`           | Las pruebas de todos los TC asociados a los AC del feature | El FT completo          |


Los dos primeros entregan **funcionalidad**; los dos últimos entregan **pruebas** sobre comportamiento ya implementado (rama `test/…`, subagente `quality-specialist`, cierre natural en `trace-validate`).

> Un `FT-XXX` **no es un plan de implementación**: registra funcionalidad que ya existe en el código, así que de él solo salen las pruebas que cubren sus `TC-XXX`, nunca características nuevas. Desde `TC`/`FT` el código de producción se toca **solo como corrección puntual** ante una prueba en rojo, con la evidencia presentada y decisión explícita del usuario; si la corrección crece hasta ser un desarrollo, se escala a `work-plan` como `WI-XXX` de tipo bug.

**Opciones — ritmo:**


| Modo                     | Cuándo                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Secuencial** (default) | Una unidad → lint/build → pausa (`confirmByUnit: always`) → commit al confirmar → siguiente                                                                 |
| **Paralelo**             | Solo si hay **más de una** unidad **y** no hay que pausar entre ellas (`confirmByUnit: never`, o petición explícita del usuario en el turno); worktrees + subagentes tras análisis de dependencias |


Pruebas solo sobre archivos/paquete afectados. Handoff de cierre: `work-integrate` o `pr-create` (para `TC`/`FT`, además `trace-validate`).

**Ejemplos de invocación:**

```text
/work-implement
/work-implement TK-003
/work-implement US-006
/work-implement WI-002
/work-implement TC-004
/work-implement FT-003
/work-implement US-006 de corrido (sin preguntar entre TKs)
```

- «Implementa TK-011»
- «Desarrolla las tareas Ready de US-006»
- «Ejecuta WI-005»
- «Automatiza TC-004 y TC-007 de la US-042»
- «Implementa las pruebas del FT-003»
- «Implementa todas las TK de US-008 sin pausas» → modo paralelo (si hay >1 unidad)

---



### quality-check

**Cuándo:** verificaciones automatizadas pre-merge (usuario u otro skill: `work-integrate`, `pr-create`, `trace-validate`). No proactivo durante el desarrollo.

**Produce:** informe de checks (`docs/audits/quality-check.md`, artefacto **de rama**: se versiona en ella y `work-integrate` lo retira al integrar) y la caché de pruebas `.sdd-devkit/test-run.json` (local, gitignorada).

**Alcance:** **todo el repositorio** en el estado actual de la rama (o todo el módulo elegido, en monorepo). No se acota al diff: una regresión en código que nadie tocó también debe salir.

**Checks:** tipado → linter → unit → coverage → suites configuradas → build → e2e → sonar. La categoría (Bloqueante / Condicional / Informativo) la fija el **stack** en todos salvo las suites configuradas, donde la fija el estándar de testing.

**Suites de prueba:** las únicas **fijas** son `unit` y `coverage` (siempre se listan, aunque salgan `N/A`). **Cualquier otro check que quede en `N/A` se omite del informe** — e2e sin config incluido, igual que tipado, linter, build o sonar: la tabla lista solo lo que se ejecutó. El resto del conjunto —e2e, integración, contrato, rendimiento…— sale del **estándar de testing** del repo (`docs/standards/testing.md`) o, en el caso de e2e, de la config del propio repo: una suite por requisito vigente, con la categoría que fije su enunciado RFC 2119 (DEBE → Bloqueante; DEBERÍA/PUEDE → Condicional). Sin estándar, solo las dos fijas más e2e si hay config.

**Correcciones:** gobernadas por `.sdd-devkit/settings.json` → `verification.qualityCheck.confirmFix` (`always` por defecto / `never`). Con `always`, nunca corrige por iniciativa propia — ante hallazgos que impliquen tocar código pregunta primero: **dentro** de una implementación, si se corrigen; **fuera** de una implementación (rama suelta, auditoría), ofrece explícitamente [Corregir] / [Solo el informe]. Con `never`, corrige directo sin preguntar. Si se corrige y la rama es de un `US-XXX`/`WI-XXX`, delega el arreglo en `work-implement` (modo corrección); si no hay artefacto, corrige él mismo. Aplica igual a fallos de pruebas.

**Veredicto:** `APPROVED` (`✅`) · `REJECTED` (`❌`) · `INCOMPLETE` (`⚠️`) — la etiqueta del informe va en el idioma resuelto.

**Modificadores de invocación** (opcionales; claves en inglés; se pueden combinar cuando no se contradicen). Sin ninguno se asume `default`.


| Modifier                                                                                    | Efecto                                                                 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `default`                                                                                   | Bloqueantes + condicionales presentes + Sonar si hay config            |
| `blocking-only` / `no-sonar`                                                                | Omite informativos (Sonar)                                             |
| `include-linter-warnings`                                                                   | Warnings del linter como error                                         |
| `no-tests` / `no-unit-tests` / `no-e2e` / `no-coverage` / `no-typecheck` / `no-<suite>`      | Omite ese check (`N/A`); `no-<suite>` omite una suite configurada por su `ID` (p. ej. `no-integration`) |
| `only <check>`                                                                              | Solo ese check                                                         |
| `tests-only`                                                                                | Solo suites de prueba (caché `test-run.json`; lo usa `trace-validate`) |
| `save-report`                                                                               | Copia con marca de tiempo en `docs/audits/quality-check-<timestamp>.md`, además del informe vigente |


**Ejemplos de invocación:**

```text
/quality-check
/quality-check only build
/quality-check no-tests
/quality-check no-e2e include-linter-warnings
/quality-check blocking-only save-report
/quality-check tests-only
```

En prosa (el skill mapea al modificador en inglés):

- «Corre solo el build antes del merge» → `only build`
- «Ejecuta los checks sin Sonar y guarda el informe» → `no-sonar` + `save-report`
- «Valida cobertura de US-012» (vía `trace-validate`) → dispara `quality-check` en `tests-only` si no hay caché fresca

---



### code-review

**Cuándo:** revisión **cualitativa** pre-merge (usuario u otro skill: `work-integrate`, `pr-create`). No proactivo durante el desarrollo. **No ejecuta pruebas ni checks** — eso es `quality-check`.

**Produce:** informe de hallazgos (`docs/audits/code-review.md`, artefacto **de rama**: se versiona en ella y `work-integrate` lo retira al integrar) sobre el diff: intención, arquitectura y diseño (ISO/IEC 25010) y feedback senior.

**Alcance:** el diff de la rama contra su base, **incluidos los cambios sin commitear**. Con `working-tree` (solo lo sin commitear) o `scope` (rutas concretas) la revisión es acotada y **no** sobrescribe `docs/audits/code-review.md`: va al chat o a `save-report`.

**Severidad:** `🔴` Crítico · `🟠` Mayor (bloquean) · `🟡` Menor · `💡` Sugerencia.

**Correcciones:** gobernadas por `.sdd-devkit/settings.json` → `verification.codeReview.confirmFix` (`always` por defecto / `never`). Ante un hallazgo bloqueante, con `always` pausa y ofrece [Corregir] / [Justificar]; con `never` corrige directo sin preguntar (la justificación sigue disponible si el usuario la aporta).

**Veredicto:** `APPROVED` (`✅`) · `REJECTED` (`❌`) · `INCOMPLETE` (`⚠️`) — **independiente** del de `quality-check`; la etiqueta del informe va en el idioma resuelto.

Idempotente: si ni el fingerprint, ni el commit de la base, ni el modo cambiaron **y el informe existente está en `APPROVED`**, no vuelve a revisar (usar `revalidate` para forzar). Un `❌`/`⚠️` nunca se sirve desde caché: justificar un hallazgo no toca el código y el veredicto quedaría congelado. Las revisiones acotadas (`working-tree`, `scope`) no se cachean.

**Modificadores de invocación** (opcionales; claves en inglés). Sin ninguno se asume `default`.


| Modifier        | Efecto                                                           |
| --------------- | ---------------------------------------------------------------- |
| `default`       | Diff completo de la rama contra su base —**incluidos los cambios sin commitear**—, en las tres dimensiones |
| `base <rama>`   | Fija la rama base del diff                                       |
| `working-tree`  | Solo los cambios sin commitear (revisión durante el desarrollo)  |
| `scope <ruta…>` | Limita la revisión a esas rutas                                  |
| `blocking-only` | Solo hallazgos 🔴/🟠 en el informe                               |
| `save-report`   | Copia con marca de tiempo en `docs/audits/code-review-<timestamp>.md`, además del informe vigente |
| `revalidate`    | Fuerza la revisión aunque el informe existente esté fresco                        |


**Ejemplos de invocación:**

```text
/code-review
/code-review base develop
/code-review working-tree
/code-review scope src/domain
/code-review blocking-only save-report
/code-review revalidate
```

En prosa:

- «Revisa la arquitectura y el diseño del cambio» → `default`
- «Vuelve a revisar aunque no haya cambiado nada» → `revalidate`
- «Revisa solo lo que bloquea el merge» → `blocking-only`
- «Revisa solo la carpeta de dominio» → `scope src/domain`
- «Revisa lo que llevo antes de commitear» → `working-tree`

---



### trace-validate

**Cuándo:** matriz de cobertura criterios ↔ casos/artefactos de prueba + veredicto.

**Opciones — tipo de trabajo:** `US-XXX` · `WI-XXX` · `FT-XXX` · cualquier otro spec con criterios de aceptación codificados (`AC-001`, `1.1`, `R-3`…).

**Estados por criterio:** Cubierto · Parcial · No cubierto.

**Veredicto:** `APPROVED` (`✅`) · `APPROVED_WITH_NOTES` (`⚠️`, no bloquea) · `REJECTED` (`❌`) — la etiqueta del informe va en el idioma resuelto.

No ejecuta pruebas: reutiliza `.sdd-devkit/test-run.json` fresco o invoca `quality-check` en `tests-only`. Idempotente con **dos** claves: el `fingerprint` canónico (código y tests) y un `spec` sobre la carpeta del artefacto (criterios y `TC-XXX`). Si ambos coinciden y la corrida anterior sí pudo ejecutar las pruebas, devuelve el reporte sin regenerarlo; `revalidate` fuerza.

**Alcance:** **un artefacto** y sus criterios de aceptación — ni el repo ni el diff. Si la rama abarca varios trabajos, se valida uno por corrida.

**Reporte:** `coverage.md` en la carpeta del artefacto.

**Ejemplos de invocación:**

```text
/trace-validate
/trace-validate US-012
/trace-validate WI-004
/trace-validate FT-001
/trace-validate US-012 solo AC-002 y AC-005
/trace-validate docs/specs/api-pagos.md
/trace-validate US-012 revalidate
```

- «Genera la matriz de trazabilidad de US-012»
- «¿Los criterios de WI-004 están cubiertos por pruebas?»
- «Valida cobertura del feature FT-003 (legacy)»
- «Valida cobertura de docs/specs/api-pagos.md contra las pruebas del repo»

---



### work-integrate

**Cuándo:** cerrar e integrar localmente (merge `--no-ff` a la rama base). No push, no PR.

El merge se hace en tres tiempos (`--no-commit` → retirar `docs/audits/quality-check.md` y `code-review.md` → `commit`): esos dos informes son fotos de la rama del trabajo y no deben llegar a la base. Los `arch-audit-*.md`, las copias de `save-report` y el `coverage.md` sí se integran.

**Opciones — tipo:**


| Tipo                                          | Rama                                              | Qué debe estar `Done` en `progress.md`                                                               |
| --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `US-XXX`                                      | `feature/US-XXX-…`                                | Todas las `TK-XXX`                                                                                   |
| `WI-XXX`                                      | `feature/`\|`fix/`\|`chore/`\|`refactor/`+`WI-XXX-…` | Todas las unidades del WI                                                                            |
| Automatización de pruebas (`TC-XXX`/`FT-XXX`) | `test/` + `FT-XXX-…`\|`US-XXX-…`\|`WI-XXX-…`        | Todas las unidades `TC-XXX`/`FT-XXX` de esa ejecución (no las del trabajo funcional del mismo padre) |


**Puertas (obligatorias):** `quality-check` → `code-review` → `trace-validate`. Working tree sucio → invoca `git-commit` automáticamente.

**Archivado (paso 8, según `implementation.archiveMode`):** con el `progress.md` en `Done`, las tres puertas aprobadas y el delta contra la base verificado > 0, se resuelve `implementation.archiveMode`: con `ask` (por defecto) **pregunta al usuario** si archivar —mostrando antes qué se movería—, con `always` archiva directo sin preguntar, con `never` no archiva ni pregunta. Cuando archiva, la carpeta del trabajo se mueve con `git mv` a `docs/archive/user-stories/` o `docs/archive/work-items/` **en la rama**, para que se integre en el mismo merge. Las investigaciones sueltas de `docs/specs/research/` que quedan sin referencias activas se archivan también; las internas viajan con la carpeta. No archivar —negativa, `never`, o sin canal para preguntar— no bloquea el merge: se anota y se sigue. No aplica a ramas `test/`. Detalle en [archive.md](skills/work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).

**Ejemplos de invocación:**

```text
/work-integrate
/work-integrate US-006
/work-integrate WI-002
/work-integrate integra la rama test/FT-003
```

- «Cierra e integra US-006»
- «Haz merge de esta rama feature a la base»
- «Finaliza el WI-002 e intégralo»
- «Integra las pruebas automatizadas del FT-003» → rama `test/FT-003-…`
- (Desde la rama `feature/US-…`, `feature/WI-…` o `test/…` el skill infiere el trabajo)

---



### pr-create

**Cuándo:** abrir PR/MR hacia una rama destino (preguntada al usuario).

**Plataformas (auto-detectadas):** GitHub (`gh`) · GitLab (`glab`) · Bitbucket · Azure Repos (`az repos`) · Gitea (`tea`).

**Dos modos**, deducidos del par origen→destino:

| | Origen → destino | Puertas |
|---|---|---|
| **Implementación** | `feature/`\|`fix/`\|`chore/`\|`refactor/`\|`test/` → rama de integración | `quality-check` + `code-review` + `trace-validate` (+ DoD si existe) |
| **Promoción** | `develop` → `master`\|`main`\|`release/*` | `quality-check` (+ DoD si existe) |

En una promoción, `code-review` y `trace-validate` se reportan como `N/A` (`—`): cada trabajo ya pasó las tres puertas al integrarse, y lo que queda por demostrar es que la rama consolidada está verde. Estar en una rama protegida **no** bloquea; el Paso 3 confirma la intención antes de seguir.

**Puertas (obligatorias, sin draft ni skip):**

1. `quality-check` sobre la rama (batería completa; produce `test-run.json`)
2. `code-review` sobre el diff contra `origin/<destino>` (revisión cualitativa; veredicto propio) — solo en implementación
3. `trace-validate` sobre el `US`/`WI` de la rama — solo en implementación
4. Definition of Done (`docs/policies/definition-of-done.md`) — **solo si existe**; si no, se omite

**Archivado (solo implementación, Paso 5, según `implementation.archiveMode`):** pasadas las puertas y **antes del push**, se resuelve la misma política que `work-integrate` — con `ask` (por defecto) se pregunta al usuario si archivar, con `always` archiva directo, con `never` no archiva ni pregunta. Confirmado o forzado por `always`, la carpeta del trabajo se mueve a `docs/archive/` para que el movimiento viaje dentro del PR. Declinarlo (o `never`) no impide crear el PR. Mismo procedimiento que `work-integrate` ([archive.md](skills/work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo)). **No aplica** en promoción ni en ramas `test/`; con el `progress.md` incompleto se omite y se avisa, pero el PR se crea igual.

Working tree sucio → `git-commit` automático. Título/descripción se generan sin pedir confirmación. Ante fallo de puerta: informa, propone acciones y solo corrige con autorización explícita.

**Ejemplos de invocación:**

```text
/pr-create
/pr-create hacia develop
/pr-create base main
```

- «Crea el PR»
- «Abre un MR a develop»
- «Súbelo a main» (el destino se confirma; las puertas no se pueden saltar)
- «Promueve develop a master» (modo promoción, desde `develop`)

