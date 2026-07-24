<!--
Convención: sustituir manualmente cada {{texto}}. No es un motor de plantillas.

Un ESTÁNDAR es un documento normativo de DOMINIO. "Dominio" aquí = un **dominio técnico o funcional**
del proyecto: un área o aspecto transversal (testing, API, persistencia, seguridad, frontend,
observabilidad, CI, modularidad…). NO es un dominio de negocio/DDD (bounded context) ni un dominio de
internet. Ej.: "Testing Standards", "API Standards". Es más AMPLIO que un ADR y AGREGA varios requisitos.
No se crea un estándar por decisión; cada decisión (ADR) añade o actualiza UN REQUISITO dentro del
estándar de dominio que corresponda.
Ej.: "usar PHPUnit para unit tests" NO es un estándar — es el requisito «Unit testing» del estándar
"Testing Standards"; si luego se decide Playwright para e2e, se AÑADE el requisito «E2E testing» al
MISMO estándar, no se crea uno nuevo.

El estándar se identifica por su NOMBRE. Cada requisito describe qué es / cómo se usa /
cómo se implementa, y su **Alcance** se redacta como un enunciado con palabra clave RFC 2119 / RFC 8174
en MAYÚSCULAS en el idioma de preferencia (MUST/DEBE, SHOULD/DEBERÍA, MAY/PUEDE…). La unidad
verificable es el **criterio de cumplimiento** (`CR-XXX`) dentro de
cada requisito: es lo que audita `arch-audit` y lo que traza a su ADR de origen. El estándar
es vivo (se actualiza); el ADR es historia inmutable.

Ubicación (dos formas):
  - Simple:        docs/standards/<slug>.md              (este archivo)
  - Con extras:    docs/standards/<slug>/README.md       (este archivo, dentro de la carpeta del
                   estándar) + los documentos adicionales junto a él en docs/standards/<slug>/
  El <slug> es el nombre del estándar en kebab-case (p. ej. testing, api, frontend) y es el nombre
  del archivo o de la carpeta.

`domain`: slug del dominio técnico o funcional (testing, api, persistence…) = nombre del archivo
<slug>.md o de la carpeta <slug>/.
`source_adrs`: contiene todos los ADR que originan al menos un criterio de cumplimiento
de este estándar (recíproco de `emits`).
-->
---
name: {{Título del estandar}}
domain: {{slug}}
status: {{Draft | Active | Deprecated}}
last_update: {{YYYY-MM-DD}}
source_adrs: [{{ADR-XXX}}]
tags: [{{testing}}]
---

# {{Título del estandar}}

{{qué dominio cubre este estándar y a qué partes del proyecto aplica; un párrafo corto}}

<!--
Un bloque `## <Requisito>` por cada requisito del dominio. Al documentar una decisión nueva del MISMO
dominio, se AÑADE otro bloque de requisito aquí (o se actualiza uno existente) — no se crea un
estándar nuevo. Cada requisito tiene un slug estable (`ID`) único dentro de este estándar; agrupa
uno o varios **criterios de cumplimiento** y sirve de referencia legible (`<slug-del-estándar>/<slug-del-requisito>`,
p. ej. testing/unit-testing).

La unidad verificable y trazable NO es el requisito, sino cada **criterio de cumplimiento** (`CR-XXX`):
`### Criterios de cumplimiento` lista una o varias filas de criterios medibles (p. ej. cobertura ≥ 80%),
cada una con ID `CR-XXX` (único en el estándar), Origen (el ADR que lo fijó), si es Automatable (fitness
function) y la evidencia de Verificación. Un CR es lo que un ADR referencia en `emits` mediante su
referencia global `<slug-del-estándar>/CR-XXX` (p. ej. testing/CR-001), y de esa referencia se deriva
el nombre del wrapper de su fitness function sustituyendo `/` por `-`
(scripts/arch/checks/<slug-del-estándar>-CR-XXX.sh, p. ej. testing-CR-001.sh).

Rutas relativas a los ADR en la columna Origen: dependen de la forma del estándar. Forma simple
(docs/standards/<slug>.md) → `../adr/`. Forma con carpeta (docs/standards/<slug>/README.md) →
`../../adr/`. Ajustar la profundidad según corresponda.

Si un requisito necesita documentos de apoyo (guías, ejemplos, matrices), usar la forma de carpeta
(docs/standards/<slug>/) y enlazarlos con rutas relativas desde el requisito.
-->

## {{Título del estandar}}
**ID:** {{slug}}

{{Cuál es el requisito, cómo se usa en el proyecto y cómo se implementa (herramientas, convenciones, ubicación típica).}}

### Alcance
{{Enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia: dónde aplica, qué **MUST**/**DEBE**, **SHOULD**/**DEBERÍA**, **MAY**/**PUEDE** cumplirse y dónde no aplica. Ej.: "Las pruebas unitarias **DEBEN** implementarse con PHPUnit; no **DEBE** introducirse otro framework de unit testing en `tests/unit/`."}}

### Excepciones
{{casos permitidos, o "Ninguna"}}

### Criterios de cumplimiento
<!--
Una o varias filas por requisito: los criterios de cumplimiento son la UNIDAD verificable y trazable.
Ej.: el requisito «Unit testing» puede tener el criterio «cobertura ≥ 80%» (CR-001).
Columnas:
  - ID: `CR-XXX` (prefijo + 3 dígitos), único en el estándar. Su referencia global es
    `<estándar>/CR-XXX` (p. ej. testing/CR-001); es lo que el ADR de Origen lista en `emits`.
  - Descripción: qué se mide (umbral, check, evidencia); si el criterio es normativo, usar palabra clave
    RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
  - Origen: el ADR que fijó este criterio de cumplimiento (traza CR → ADR).
  - Automatable: yes = objetivo/automatizable como fitness function; no = criterio humano/evidencia externa.
  - Enfoque: `bloqueante` = su incumplimiento hace fallar el gate (exit ≠ 0 del agrupador); `warning` =
    se reporta pero NO tumba el gate. Por defecto `bloqueante`. Un CR `warning` automatizable usa el
    wrapper con sufijo `.warn.sh` (`scripts/arch/checks/<estándar>-CR-XXX.warn.sh`).
  - Verificación: para un CR automatizable, el wrapper del agrupador
    `scripts/arch/checks/<estándar>-CR-XXX.sh` (bloqueante) o `<estándar>-CR-XXX.warn.sh` (warning);
    si no, la evidencia externa (archivo, job CI, etc.). `N/A` si aún no existe o si Automatable es no
    y no hay artefacto.
-->

| ID | Descripción | Origen | Automatable | Enfoque | Verificación |
|----|-------------|--------|-------------|---------|----------------|
| CR-{{001}} | Cobertura de pruebas unitarias **DEBE** ser ≥ {{80%}} | [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md) | {{yes \| no}} | {{bloqueante \| warning}} | {{scripts/arch/checks/testing-CR-001.sh}} |
| CR-{{002}} | {{…otro criterio del mismo requisito, si aplica}} | [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md) | {{yes \| no}} | {{bloqueante \| warning}} | {{N/A}} |

## {{E2E testing}}
**ID:** {{slug}}

{{Qué es, cómo se usa y cómo se implementa (p. ej. Playwright, convención de specs, flujos críticos).}}

### Alcance
{{Enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia. Ej.: "Las pruebas end-to-end **DEBEN** implementarse con Playwright; los flujos críticos definidos por producto **DEBERÍAN** tener cobertura e2e."}}

### Excepciones
{{…}}

### Criterios de cumplimiento

| ID | Descripción | Origen | Automatable | Enfoque | Verificación |
|----|-------------|--------|-------------|---------|----------------|
| CR-{{003}} | Los flujos críticos definidos por producto **DEBEN** tener cobertura e2e con Playwright | [ADR-{{YYY}}](../adr/ADR-{{YYY}}-{{slug}}.md) | {{yes \| no}} | {{bloqueante \| warning}} | {{scripts/arch/checks/testing-CR-003.sh}} |

## Referencias

- ADR de origen de cada criterio de cumplimiento (ver columna `Origen` y `source_adrs`) y otros estándares relacionados
- {{documentos de apoyo del estándar, si usa la forma de carpeta — rutas relativas dentro de docs/standards/<slug>/}}
