# Uso de los skills

Guía práctica de cuándo y cómo usar cada skill de **SDD Devkit**. Para el flujo completo del harness, ver el [README](README.md).

Invocación típica: `/nombre-skill` o una frase que active la descripción del skill. Donde el skill admite contexto (artefacto, alcance, tema), pásalo en el mismo mensaje.

---

## Convención: enlace al gestor de proyectos

Cualquier artefacto que enlace a su work item en un sistema de seguimiento externo (Azure DevOps, Jira u otro) lo hace **en la cabecera de metadatos** con esta etiqueta única, sin variantes por tipo de artefacto:

```markdown
**Work Item ({{Sistema}}):** {{enlace markdown al work item — omitir la línea si no aplica}}
```

- `{{Sistema}}` es el nombre corto que define el archivo de referencia del sistema (p. ej. `Work Item (ADO):` para `references/azure-devops.md`).
- Aplica a `US-XXX`, `TK-XXX`, `WI-XXX`, `TC-XXX`, `FT-XXX` y a los artefactos de investigación (`RS-XXX`, diagnóstico de bug, análisis de test case). **No** se usan etiquetas propias por tipo (`Bug (gestor de proyectos):`, `Test Case (ADO):`, etc.).
- La línea se **omite** si el artefacto no tiene work item; nunca se deja con `N/A`.
- Fuera de la cabecera —listas de referencias, tablas, prosa— el enlace se escribe como cualquier otro enlace markdown; esta convención rige solo la etiqueta de cabecera.

---

## Harness

### arch-init

**Cuándo:** bootstrapear un proyecto para agentes (nuevo o existente): git, `AGENTS.md` / `CLAUDE.md` / `.agents/MEMORY.md`, índices de ADR/estándares, stack y compuerta de calidad.

**Produce:** archivos base del harness; al cerrar sugiere continuar con `work-define` o `work-plan`.

**Opciones — punto de partida** (decide el camino, no el resultado final):

| Situación | Qué implica |
|-----------|-------------|
| **Sin código** | Obliga a definir stack (Paso 2); no hay descubrimiento desde código. |
| **Con código base** | Stack detectable; sin lógica de negocio propia aún. |
| **Con implementación** | Invoca `arch-discover` completo para candidatos de ADR/estándares. |

**Handoffs:** `arch-discover` (brownfield), `arch-manage` (candidatos aceptados), consulta a `quality-check` (qué validar por stack). Reejecutable: solo completa lo que falte.

**Ejemplos de invocación:**

```text
/arch-init
/arch-init este repo ya tiene código; completa lo que falte del harness
```

- «Inicializa el harness del proyecto»
- «Prepara este repo para agentes: AGENTS.md, MEMORY y docs/adr»
- «Bootstrapea el harness; queremos una API en NestJS con Postgres» (sin código → define stack con ese contexto)

---

### arch-manage

**Cuándo:** documentar o cambiar una decisión arquitectónica (ADR) o una norma de dominio (estándar / criterio de cumplimiento).

**Produce:** `docs/adr/ADR-XXX-*.md` y/o criterios de cumplimiento (`CR-XXX`) en `docs/standards/` (p. ej. *Testing Standards*), con fitness functions cuando apliquen.

**Opciones — qué se produce:**

| Caso | Input | Resultado |
|------|-------|-----------|
| **A. Solo ADR** | Decisión puntual/histórica sin regla continua | ADR con `emits: []`; no toca estándares |
| **B. ADR + estándar** | Decisión que fija una regla verificable | ADR + criterio(s) de cumplimiento en el estándar del dominio |
| **C. Solo estándar** | Regla sin decisión nueva | Criterio(s) de cumplimiento en un estándar existente (o nuevo) |

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

**Produce:** lista de candidatos; tras aprobación del usuario, crea los artefactos vía `arch-manage`.

**Opciones — clasificación de cada candidato:**

| Tipo | Qué proponer |
|------|----------------|
| **Solo ADR** | Elección histórica/puntual sin regla continua |
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

**Cuándo:** comprobar si el repo cumple los criterios de cumplimiento de `docs/standards/` y las reglas de `AGENTS.md`.

**Produce:** `docs/audits/arch-audit-YYYY-MM-DD.md` con hallazgos priorizados y veredicto.

**Opciones — si ya hay auditoría previa:**

| Opción | Efecto |
|--------|--------|
| **Revalidar** | Revisa hallazgos previos; añade entrada en `## Revalidaciones` sin reescribir el informe original |
| **Nueva auditoría desde cero** | Audita todas las normas de nuevo |

**Veredicto:** `✅ Conforme` · `❌ No conforme` · `⚠️ Conforme con observaciones`.

Criterios en estándares `Draft` se listan pero no priorizan el veredicto; `Deprecated`/`Superseded` solo si el código sigue dependiendo de ellos.

**Ejemplos de invocación:**

```text
/arch-audit
/arch-audit revalida la última auditoría
/arch-audit nueva auditoría desde cero
/arch-audit solo Testing Standards
```

- «¿El código respeta los estándares?»
- «Audita el cumplimiento de AGENTS.md y docs/standards»
- «Revalida audit-2026-06-30.md»
- «Chequea las reglas del repo; enfócate en API Standards»

---

### git-commit

**Cuándo:** hacer commit(s) con Conventional Commits a partir del diff real.

**Produce:** commit(s) locales (no hace push).

**Opciones — flujo:**

| Condición | Flujo |
|-----------|-------|
| Sin cambios | Informa y no commitea |
| Un solo tema lógico | Commit estándar (propuesta → confirmación → commit) |
| Varios temas mezclados | Propone varios commits y ejecuta en secuencia |
| Falló un pre-commit hook | Corrige, re-stagea y **nuevo** commit (sin `--amend` ni `--no-verify` salvo petición explícita) |

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

| Flujo | Entrada | Salida / handoff |
|-------|---------|------------------|
| **Investigación libre** | Tema sin artefacto | Hallazgos por dominio: Producto, Arquitectura, Técnica o Cambio |
| **Analizar decisiones pendientes** | `US` / `TK` / `WI` en contexto | Lagunas y decisiones pendientes → dueño del artefacto (`work-define` / `work-plan`) |
| **Analizar issue** | Descripción de un defecto o código de un bug | Reproducción, causa raíz y diagnóstico de pruebas → **WI tipo `bug-fix`** vía `work-plan` (ciclo 🔴 TEST FAIL → fix → 🟢 TEST PASS). No genera `RS` |
| **Analizar test case** | `TC-XXX` | Veredicto de auditoría (TC correcto / incorrecto / incompleto / falso negativo…) → `test-define`, *Analizar issue*, `work-plan` o `trace-validate` |
| **Analizar legado** | Código sin requisitos/pruebas suficientes | `FT-XXX` + TCs vía `test-define` → `trace-validate` → `work-implement` tipo feature (solo pruebas, no código funcional) |
| **Analizar migración** | Proyecto origen + destino | Discovery + validación → `work-define` (cambio grande) o `work-plan` / WI (pequeño) |

Si el repo declara `work_item_tracking` en `.agents/MEMORY.md`, cualquier artefacto que se pase por su código se lee vía MCP y enruta al flujo según su tipo (historia/tarea → decisiones pendientes; bug → issue; test case → test case).

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

| Acción | Notas |
|--------|--------|
| **Crear** | ID, carpeta, plantilla, AC-XXX, INVEST, DoR |
| **Actualizar** | Conserva ids `AC-XXX`; ante conflicto TK ↔ US, prevalece la US |

**Estados:** `Draft` (lagunas en Observaciones) · `Ready` (DoR + INVEST + repos + AC completos). En Ready sugiere `test-define` y `work-plan`.

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

**Opciones — modo de invocación:**

| Modo | Quién | Salida |
|------|-------|--------|
| **Directo** | Usuario | Documento + resumen; ofrece enlazar desde US/TK/WI |
| **Delegado** | `work-define` / `work-plan` vía subagente | Documento + lista de referencias (ruta + ancla) para el llamador |

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

| Tipo | TCs en |
|------|--------|
| `US-XXX` | `…/US-XXX-…/test-cases/` |
| `WI-XXX` | `…/WI-XXX-…/test-cases/` |
| `FT-XXX` | `…/FT-XXX-…/test-cases/` |

**Perspectivas por criterio:** Happy path · Error · Límite (se omite la que no aplique).

**Tipo de prueba (intención de diseño):** `Manual` **o** uno/varios de `Unit`, `Integration`, `API Test`, `Visual Test`, `E2E`.

**Ejemplos de invocación:**

```text
/test-define
/test-define US-005
/test-define WI-003
/test-define FT-002
/test-define US-005 solo criterios AC-001 y AC-003
```

- «Crea casos de prueba para US-009»
- «Genera TCs desde los AC de WI-014»
- «Documenta pruebas para el feature FT-001 (legacy)»

---

### work-plan

**Cuándo:** planificar sin escribir código ni pruebas.

**Opciones — tipo de plan:**

| Tipo | Señal | Artefacto |
|------|-------|-----------|
| **Tarea de historia** | Hay `US-XXX` asociada | `TK-XXX` bajo la carpeta de la US |
| **Mantenimiento** | Sin US (bug, refactor, deuda, deps, operativa) | `WI-XXX` en `docs/specs/work-items/` |

Solo se hace handoff a `work-implement` si el artefacto está en `Ready`. Si hay vinculación ADO en `.agents/MEMORY.md`, sincroniza work items antes de crear archivos locales. Puede delegar detalle técnico a `design-define`.

**Ejemplos de invocación:**

```text
/work-plan
/work-plan US-007
/work-plan planifica tareas para US-004 agrupadas por repo
/work-plan WI: actualizar Spring Boot a 3.3
/work-plan completa TK-002 a Ready
```

- «Planifica US-007» → stubs `TK-XXX` por repositorio / AC
- «Tareas para esta historia» (+ US en contexto)
- «Plan de mantenimiento: refactor del módulo de auth» → `WI-XXX`
- «Descompón el bug de timeouts en un WI»

---

### work-implement

**Cuándo:** codificar trabajo ya especificado en `Estado: Ready`. También recibe el **modo corrección** delegado por `quality-check` en el cierre (arreglar un check o una prueba en rojo sobre un `US-XXX`/`WI-XXX` ya implementado; ahí no aplica `Ready` ni working tree limpio).

**Opciones — tipo:**

| Tipo | Qué se implementa | Unidad de confirmación |
|------|-------------------|------------------------|
| `TK-XXX` (bajo US) | Plan técnico de la TK (código + tests) | Una TK por confirmación |
| `WI-XXX` | Plan del WI (código + tests) | El WI completo |
| `TC-XXX` | Las pruebas automatizadas de esos test cases | Un TC por confirmación |
| `FT-XXX` | Las pruebas de todos los TC asociados a los AC del feature | El FT completo |

Los dos primeros entregan **funcionalidad**; los dos últimos entregan **pruebas** sobre comportamiento ya implementado (rama `test/…`, subagente `quality-specialist`, cierre natural en `trace-validate`).

> Un `FT-XXX` **no es un plan de implementación**: registra funcionalidad que ya existe en el código, así que de él solo salen las pruebas que cubren sus `TC-XXX`, nunca características nuevas. Desde `TC`/`FT` el código de producción se toca **solo como corrección puntual** ante una prueba en rojo, con la evidencia presentada y decisión explícita del usuario; si la corrección crece hasta ser un desarrollo, se escala a `work-plan` como `WI-XXX` de tipo bug.

**Opciones — ritmo:**

| Modo | Cuándo |
|------|--------|
| **Secuencial** (default) | Una unidad → lint/build → pausa → commit al confirmar → siguiente |
| **Paralelo** | Solo si hay **más de una** unidad **y** el usuario pide explícitamente «sin preguntar» / «de corrido»; worktrees + subagentes tras análisis de dependencias |

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

**Produce:** informe de checks (`docs/specs/quality-check.md`) y la caché de pruebas `docs/specs/test-run.json`.

**Checks:** tipado → linter → unit → coverage → integración → build → e2e → sonar, con categoría por stack (Bloqueante / Condicional / Informativo).

**Correcciones:** nunca por iniciativa propia. Ante hallazgos que impliquen tocar código pregunta primero: **dentro** de una implementación, si se corrigen; **fuera** de una implementación (rama suelta, auditoría), ofrece explícitamente [Corregir] / [Solo el informe]. Si se corrige y la rama es de un `US-XXX`/`WI-XXX`, delega el arreglo en `work-implement` (modo corrección); si no hay artefacto, corrige él mismo. Aplica igual a fallos de pruebas.

**Veredicto:** `✅ Aprobado` · `❌ Rechazado` · `⚠️ Incompleto`.

**Modificadores de invocación** (opcionales; claves en inglés; se pueden combinar cuando no se contradicen). Sin ninguno se asume `default`.

| Modifier | Efecto |
|----------|--------|
| `default` | Bloqueantes + condicionales presentes + Sonar si hay config |
| `blocking-only` / `no-sonar` | Omite informativos (Sonar) |
| `include-linter-warnings` | Warnings del linter como error |
| `no-tests` / `no-unit-tests` / `no-integration` / `no-e2e` / `no-coverage` / `no-typecheck` | Omite ese check (`N/A`) |
| `only <check>` | Solo ese check |
| `tests-only` | Solo suites de prueba (caché `test-run.json`; lo usa `trace-validate`) |
| `save-report` | Guarda en `docs/quality-check/<timestamp>.md` |

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

**Produce:** informe de hallazgos (`docs/specs/code-review.md`) sobre el diff: intención, arquitectura y diseño (ISO/IEC 25010) y feedback senior.

**Severidad:** `🔴` Crítico · `🟠` Mayor (bloquean) · `🟡` Menor · `💡` Sugerencia.

**Veredicto:** `✅ Aprobado` · `❌ Rechazado` · `⚠️ Incompleto` — **independiente** del de `quality-check`.

**Modificadores de invocación** (opcionales; claves en inglés). Sin ninguno se asume `default`.

| Modifier | Efecto |
|----------|--------|
| `default` | Diff completo de la rama contra su base, en las tres dimensiones |
| `base <rama>` | Fija la rama base del diff |
| `scope <ruta…>` | Limita la revisión a esas rutas |
| `blocking-only` | Solo hallazgos 🔴/🟠 en el informe |
| `save-report` | Guarda en `docs/code-review/<timestamp>.md` |

**Ejemplos de invocación:**

```text
/code-review
/code-review base develop
/code-review scope src/domain
/code-review blocking-only save-report
```

En prosa:

- «Revisa la arquitectura y el diseño del cambio» → `default`
- «Revisa solo lo que bloquea el merge» → `blocking-only`
- «Revisa solo la carpeta de dominio» → `scope src/domain`

---

### trace-validate

**Cuándo:** matriz de cobertura criterios ↔ casos/artefactos de prueba + veredicto.

**Opciones — tipo de trabajo:** `US-XXX` · `WI-XXX` · `FT-XXX` (misma lógica de `AC-XXX`).

**Estados por criterio:** Cubierto · Parcial · No cubierto.

**Veredicto:** `✅ Aprobado` · `⚠️ Aprobado con observaciones` · `❌ Rechazado`.

No ejecuta pruebas: reutiliza `docs/specs/test-run.json` fresco o invoca `quality-check` en `tests-only`. Idempotente: si el fingerprint no cambió, no regenera el reporte.

**Reporte:** `trace-report.md` en la carpeta del artefacto.

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
- «Valida cobertura del feature FT-003 (legacy)»

---

### work-integrate

**Cuándo:** cerrar e integrar localmente (merge `--no-ff` a la rama base). No push, no PR.

**Opciones — tipo:**

| Tipo | Rama | Qué debe estar `Done` en `progress.md` |
|------|------|----------------------------------------|
| `US-XXX` | `feature/US-XXX-…` | Todas las `TK-XXX` |
| `WI-XXX` | `feature/`\|`fix/`\|`chore/`\|`refactor/`+`WI-XXX-…` | Todas las unidades del WI |
| Automatización de pruebas (`TC-XXX`/`FT-XXX`) | `test/` + `FT-XXX-…`\|`US-XXX-…`\|`WI-XXX-…` | Todas las unidades `TC-XXX`/`FT-XXX` de esa ejecución (no las del trabajo funcional del mismo padre) |

**Puertas (obligatorias):** `quality-check` → `code-review` → `trace-validate`. Working tree sucio → invoca `git-commit` automáticamente.

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

**Puertas (obligatorias, sin draft ni skip):**

1. `quality-check` sobre la rama (batería completa; produce `test-run.json`)
2. `code-review` sobre `origin/<destino>..HEAD` (revisión cualitativa; veredicto propio)
3. `trace-validate` sobre el `US`/`WI` de la rama
4. Definition of Done (`docs/policies/definition-of-done.md`) — **solo si existe**; si no, se omite

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
