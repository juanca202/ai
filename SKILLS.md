# Uso de los skills

Guía práctica de cuándo y cómo usar cada skill de **SDD Devkit**. Para el flujo completo del harness, ver el [README](README.md).

Invocación típica: `/nombre-skill` o una frase que active la descripción del skill (p. ej. «inicializa el harness», «crea el PR»).

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

**Handoffs:** `arch-discover` (brownfield), `arch-manage` (candidatos aceptados), consulta a `code-review` (qué validar por stack). Reejecutable: solo completa lo que falte.

---

### arch-manage

**Cuándo:** documentar o cambiar una decisión arquitectónica (ADR) o una norma de dominio (estándar / requisito).

**Produce:** `docs/adr/ADR-XXX-*.md` y/o requisitos en `docs/standards/` (p. ej. *Testing Standards*), con criterios `CR-XXX` y fitness functions cuando apliquen.

**Opciones — qué se produce:**

| Caso | Input | Resultado |
|------|-------|-----------|
| **A. Solo ADR** | Decisión puntual/histórica sin regla continua | ADR con `emits: []`; no toca estándares |
| **B. ADR + estándar** | Decisión que fija una regla verificable | ADR + criterio(s) en el estándar del dominio |
| **C. Solo estándar** | Regla sin decisión nueva | Requisito/criterio en un estándar existente (o nuevo) |

**Estados habituales:** ADR `Draft` / `Proposed` / `Accepted` / `Superseded` / `Deprecated`; estándar `Draft` / `Active` / `Deprecated` / `Superseded`. Un ADR `Accepted` no se reescribe: se supersede.

**Handoffs:** lo consume `arch-audit`; lo invocan `arch-init` y `arch-discover`.

---

### arch-discover

**Cuándo:** hay código existente y se quieren sacar a la luz decisiones/normas implícitas.

**Produce:** lista de candidatos; tras aprobación del usuario, crea los artefactos vía `arch-manage`.

**Opciones — clasificación de cada candidato:**

| Tipo | Qué proponer |
|------|----------------|
| **Solo ADR** | Elección histórica/puntual sin regla continua |
| **ADR + requisito** | Decisión que además fija una norma verificable en un dominio |

Los candidatos se agrupan por **dominio técnico/funcional** (testing, api, security, etc.; ver catálogo en el skill). No hay modo que se detenga antes de la Fase 5: tras aprobar, se crean los artefactos en la misma ejecución.

**Handoffs:** `arch-manage` (creación); suele invocarlo `arch-init` en brownfield.

---

### arch-audit

**Cuándo:** comprobar si el repo cumple los requisitos de `docs/standards/` y las reglas de `AGENTS.md`.

**Produce:** `docs/audits/audit-YYYY-MM-DD.md` con hallazgos priorizados y veredicto.

**Opciones — si ya hay auditoría previa:**

| Opción | Efecto |
|--------|--------|
| **Revalidar** | Revisa hallazgos previos; añade entrada en `## Revalidaciones` sin reescribir el informe original |
| **Nueva auditoría desde cero** | Audita todas las normas de nuevo |

**Veredicto:** `✅ Conforme` · `❌ No conforme` · `⚠️ Conforme con observaciones`.

Criterios en estándares `Draft` se listan pero no priorizan el veredicto; `Deprecated`/`Superseded` solo si el código sigue dependiendo de ellos.

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

---

## Specs

### work-research

**Cuándo:** investigar antes de especificar, planificar o implementar.

**Produce:** informe `RS-XXX` bajo `docs/specs/research/` (más artefactos según el flujo).

**Opciones — flujo según entrada:**

| Flujo | Entrada | Salida / handoff |
|-------|---------|------------------|
| **A · Artefacto** | `US` / `TK` / `WI` en contexto | Lagunas y decisiones pendientes → dueño del artefacto (`work-define` / `work-plan`) |
| **B · Migración** | Proyecto origen + destino | Discovery + validación → `work-define` (cambio grande) o `work-plan` / WI (pequeño) |
| **C · Libre** | Tema sin artefacto | Hallazgos por dominio: Producto, Arquitectura, Técnica o Cambio |
| **D · Legacy** | Código sin requisitos/pruebas suficientes | `FEAT-XXX` + TCs vía `test-define` → `trace-validate` (solo pruebas, no código funcional) |

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

---

### test-define

**Cuándo:** documentar casos de prueba (`TC-XXX`) desde criterios `AC-XXX` (IEEE 29119-4). No implementa ni ejecuta tests.

**Opciones — artefacto origen:**

| Tipo | TCs en |
|------|--------|
| `US-XXX` | `…/US-XXX-…/test-cases/` |
| `WI-XXX` | `…/WI-XXX-…/test-cases/` |
| `FEAT-XXX` | `…/FEAT-XXX-…/test-cases/` |

**Perspectivas por criterio:** Happy path · Error · Límite (se omite la que no aplique).

**Tipo de prueba (intención de diseño):** `Manual` **o** uno/varios de `Unit`, `Integration`, `API Test`, `Visual Test`, `E2E`.

---

### work-plan

**Cuándo:** planificar sin escribir código ni pruebas.

**Opciones — tipo de plan:**

| Tipo | Señal | Artefacto |
|------|-------|-----------|
| **Tarea de historia** | Hay `US-XXX` asociada | `TK-XXX` bajo la carpeta de la US |
| **Mantenimiento** | Sin US (bug, refactor, deuda, deps, operativa) | `WI-XXX` en `docs/specs/work-items/` |

Solo se hace handoff a `work-implement` si el artefacto está en `Ready`. Si hay vinculación ADO en `.agents/MEMORY.md`, sincroniza work items antes de crear archivos locales. Puede delegar detalle técnico a `design-define`.

---

### work-implement

**Cuándo:** codificar trabajo ya especificado en `Estado: Ready`.

**Opciones — tipo:**

| Tipo | Unidad de confirmación |
|------|------------------------|
| `TK-XXX` (bajo US) | Una TK por confirmación |
| `WI-XXX` | El WI completo |

**Opciones — ritmo:**

| Modo | Cuándo |
|------|--------|
| **Secuencial** (default) | Una unidad → lint/build → pausa → commit al confirmar → siguiente |
| **Paralelo** | Solo si hay **más de una** unidad **y** el usuario pide explícitamente «sin preguntar» / «de corrido»; worktrees + subagentes tras análisis de dependencias |

Pruebas solo sobre archivos/paquete afectados. Handoff de cierre: `work-integrate` o `pr-create`.

---

### code-review

**Cuándo:** revisión pre-merge (usuario u otro skill: `work-integrate`, `pr-create`). No proactivo durante el desarrollo.

**Produce:** informe con checks automatizados + revisión cualitativa y veredicto unificado.

**Veredicto:** `✅ Aprobado` · `❌ Rechazado` · `⚠️ Incompleto`.

**Modificadores de invocación** (opcionales; claves en inglés; se pueden combinar cuando no se contradicen). Sin ninguno se asume `default`.

| Modifier | Efecto |
|----------|--------|
| `default` | Bloqueantes + condicionales presentes + Sonar si hay config + cualitativa |
| `blocking-only` / `no-sonar` | Omite informativos (Sonar) |
| `include-linter-warnings` | Warnings del linter como error |
| `no-tests` / `no-unit-tests` / `no-e2e` / `no-coverage` / `no-typecheck` | Omite ese check (`N/A`) |
| `only <check>` | Solo ese check; sin cualitativa |
| `checks-only` | Solo plano automatizado |
| `qualitative-only` | Solo cualitativa |
| `tests-only` | Solo suites de prueba (caché `test-run.json`; lo usa `trace-validate`) |
| `save-report` | Guarda en `docs/code-review/<timestamp>.md` |

**Ejemplos de invocación:**

```text
/code-review
/code-review checks-only
/code-review qualitative-only
/code-review only build
/code-review no-tests
/code-review no-e2e include-linter-warnings
/code-review blocking-only save-report
/code-review tests-only
```

En prosa (el skill mapea al modificador en inglés):

- «Haz un code review solo con los checks automatizados» → `checks-only`
- «Revisa solo la arquitectura y el diseño, sin correr tests» → `qualitative-only`
- «Corre solo el build antes del merge» → `only build`
- «Code review sin Sonar y guarda el informe» → `no-sonar` + `save-report`
- «Valida cobertura de US-012» (vía `trace-validate`) → dispara `code-review` en `tests-only` si no hay caché fresca

---

### trace-validate

**Cuándo:** matriz de cobertura criterios ↔ casos/artefactos de prueba + veredicto.

**Opciones — tipo de trabajo:** `US-XXX` · `WI-XXX` · `FEAT-XXX` (misma lógica de `AC-XXX`).

**Estados por criterio:** Cubierto · Parcial · No cubierto.

**Veredicto:** `✅ Aprobado` · `⚠️ Aprobado con observaciones` · `❌ Rechazado`.

No ejecuta pruebas: reutiliza `docs/specs/test-run.json` fresco o invoca `code-review` en `tests-only`. Idempotente: si el fingerprint no cambió, no regenera el reporte.

**Reporte:** `trace-report.md` en la carpeta del artefacto.

---

### work-integrate

**Cuándo:** cerrar e integrar localmente (merge `--no-ff` a la rama base). No push, no PR.

**Opciones — tipo:**

| Tipo | Qué debe estar `Done` en `progress.md` |
|------|----------------------------------------|
| `US-XXX` | Todas las `TK-XXX` |
| `WI-XXX` | Todas las unidades del WI |

**Puertas (obligatorias):** `code-review` → `trace-validate`. Working tree sucio → invoca `git-commit` automáticamente.

---

### pr-create

**Cuándo:** abrir PR/MR hacia una rama destino (preguntada al usuario).

**Plataformas (auto-detectadas):** GitHub (`gh`) · GitLab (`glab`) · Bitbucket · Azure Repos (`az repos`) · Gitea (`tea`).

**Puertas (obligatorias, sin draft ni skip):**

1. `code-review` sobre `origin/<destino>..HEAD`
2. `trace-validate` sobre el `US`/`WI` de la rama
3. Definition of Done (`docs/policies/definition-of-done.md`) — **solo si existe**; si no, se omite

Working tree sucio → `git-commit` automático. Título/descripción se generan sin pedir confirmación. Ante fallo de puerta: informa, propone acciones y solo corrige con autorización explícita.
