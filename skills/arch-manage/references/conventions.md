# Convenciones de identidad, numeración y frontmatter

Referencia de consulta al **escribir el frontmatter y los identificadores** de un ADR, un estándar, un
requisito o un criterio (CR). Leer al redactar/editar cualquiera de estos artefactos.

## Identidad y numeración

| | ADR | Estándar (dominio) | Requisito (dentro de un estándar) | Criterio de cumplimiento (dentro de un requisito) |
|---|---|---|---|---|
| Vive en | `docs/adr/` | `docs/standards/` | Una sección `## <Requisito>` dentro del `.md` del estándar | Una fila `CR-XXX` en la tabla `### Criterios de cumplimiento` del requisito |
| Ubicación | `ADR-XXX-<slug>.md` (prefijo + 3 dígitos; p. ej. `ADR-002-vitest-testing-library.md`) | **Sin código, por nombre.** Simple: `docs/standards/<slug>.md` (p. ej. `testing.md`). Con documentos adicionales: carpeta `docs/standards/<slug>/` con el estándar en `README.md` + los archivos extra dentro | — | — |
| Identidad | `id: ADR-XXX` (p. ej. `ADR-002`) | `name` (p. ej. `Testing Standards`) + `<slug>` de dominio (`testing`) = nombre del archivo/carpeta. **No lleva código.** | `ID` = slug del requisito (p. ej. `unit-testing`); referencia legible `<slug-estándar>/<slug-requisito>` (p. ej. `testing/unit-testing`) | `CR-XXX` (prefijo + 3 dígitos), **único en el estándar**; referencia global `<slug-estándar>/CR-XXX` (p. ej. `testing/CR-001`) |
| Cómo se numera/nombra | Correlativo en `docs/adr/` + 1; empezar en `001` | El `<slug>` del dominio (kebab-case), único en `docs/standards/`. Hay **pocos** (uno por dominio); no hay correlativo | El `<slug>` del requisito (kebab-case), único dentro de su estándar | Correlativo dentro del estándar (a través de **todos** sus requisitos); empezar en `001` |

- Los `slug` son kebab-case, minúsculas y cortos. El número del ADR y el número de CR son zero-padded a 3 dígitos.
- **Nunca pedir el número del ADR al usuario**: se calcula listando `docs/adr/`. El número del CR se calcula releyendo los `CR-XXX` ya usados en el estándar.
- La **unidad verificable y trazable es el criterio de cumplimiento (CR)**, no el requisito. La **referencia global del CR** (`<slug-estándar>/CR-XXX`, p. ej. `testing/CR-001`) es lo que un ADR referencia en `emits`; el wrapper de su fitness function es `scripts/arch/checks/<slug-estándar>-CR-XXX.sh` (la `/` se sustituye por `-`, p. ej. `testing-CR-001.sh`). El requisito es la agrupación legible que da contexto a sus CR.
- Si se crean varios ADR en una tanda (p. ej. desde `arch-discover`), **recalcular** el número releyendo `docs/adr/` antes de cada nuevo ADR.

## Frontmatter

### ADR

| Campo | Regla |
|-------|-------|
| `id` | `ADR-XXX` (prefijo + 3 dígitos) |
| `status` | `Draft` · `Proposed` · `Accepted` · `Deprecated` · `Superseded` |
| `last_update` | Fecha de hoy en cada escritura sustantiva |
| `deciders` | Lista de nombres o roles |
| `tags` | Lista de palabras clave (tecnología, dominio) |
| `supersedes` / `superseded_by` | `null` o `ADR-XXX` |
| `emits` | Lista de **referencias de criterio (CR)** que fija, p. ej. `[testing/CR-001]` (o `[]`) |

### Estándar (documento de dominio)

| Campo | Regla |
|-------|-------|
| `name` | Nombre del estándar, p. ej. `Testing Standards`. **El estándar se identifica por su nombre, no lleva código.** |
| `domain` | Slug del dominio **técnico o funcional**, del catálogo canónico (`functional-domains.md`, en esta misma carpeta): `testing`, `architecture`, `api`, `security`, `coding-style`, `frontend`, `persistence`, `devops`, `observability`; otro solo si no encaja = nombre del archivo `<slug>.md` o de la carpeta `<slug>/`. Un aspecto de arquitectura, no un dominio de negocio/DDD ni de internet |
| `status` | `Draft` · `Active` · `Deprecated` |
| `last_update` | Fecha de hoy en cada escritura |
| `source_adrs` | Lista de **todos** los ADR que aportaron ≥ 1 criterio de cumplimiento (recíproco de `emits`) |
| `tags` | Lista de palabras clave |

### Requisito (bloque dentro del estándar)

| Campo | Regla |
|-------|-------|
| `ID` | Slug del requisito (p. ej. `unit-testing`), único en su estándar. Referencia legible: `<slug-estándar>/<slug-requisito>` (p. ej. `testing/unit-testing`) |
| Descripción | Párrafo de qué es / cómo se usa / cómo se implementa. **Sin** RFC 2119 |
| `Alcance` | Enunciado normativo redactado con RFC 2119 / RFC 8174 (MUST/SHOULD/MAY… en mayúsculas) |
| `Excepciones` | Casos permitidos, o «Ninguna» |
| `Criterios de cumplimiento` | Tabla de filas `CR-XXX` — ver siguiente |

### Criterio de cumplimiento (fila `CR-XXX` dentro de un requisito)

| Columna | Regla |
|-------|-------|
| `ID` | `CR-XXX` (prefijo + 3 dígitos), **único en el estándar** (correlativo a través de todos sus requisitos). Referencia global: `<slug-estándar>/CR-XXX` (p. ej. `testing/CR-001`) |
| `Descripción` | Qué se mide (umbral, check, evidencia); usar RFC 2119 si es normativa |
| `Origen` | El `ADR-XXX` que fijó este criterio (traza CR → ADR) |
| `Automatable` | `yes` = objetivo/automatizable como fitness function; `no` = criterio humano/evidencia externa |
| `Enfoque` | `bloqueante` (por defecto) = su incumplimiento hace fallar el gate; `warning` = se reporta sin tumbar el gate. Un CR `warning` automatizable usa el wrapper con sufijo `.warn.sh` |
| `Verificación` | Para un CR automatizable, el wrapper `scripts/arch/checks/<slug-estándar>-CR-XXX.sh` (o `…-CR-XXX.warn.sh` si `Enfoque: warning`); si no, la evidencia externa (archivo, job CI…). `TODO` si apto pero pendiente; `N/A` si no aplica |
