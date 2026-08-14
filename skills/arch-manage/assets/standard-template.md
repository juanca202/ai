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
cómo se implementa, incluyendo el enunciado normativo con palabra clave RFC 2119 / RFC 8174
en MAYÚSCULAS en el idioma de preferencia (MUST/DEBE, SHOULD/DEBERÍA, MAY/PUEDE…). La unidad
verificable es el **criterio de cumplimiento** (`CR-XXX`): pertenece a un requisito, pero **no vive
dentro de su bloque** — todos los criterios de cumplimiento del estándar, de todos sus requisitos, se
listan juntos en la sección `## Criterios de cumplimiento`, al final del documento, antes de
`## Referencias`. Es lo que audita `arch-audit` y lo que traza a su ADR de origen. El estándar
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
`status`: `Superseded` cuando otro estándar lo reemplaza por completo; en ese caso añadir
`superseded_by: <slug>`. Un estándar entero rara vez muere: lo habitual es que muera un
requisito suelto, y para eso está el `**Estado:**` de cada bloque `## <Requisito>` — un
requisito `Deprecated` o `Superseded` deja de contar en la auditoría, pero se conserva en el
documento para no perder el rastro de por qué existió.
-->
---
name: {{Título del estandar}}
domain: {{slug}}
status: {{Draft | Active | Deprecated | Superseded}}
last_update: {{YYYY-MM-DD}}
source_adrs: [{{ADR-XXX}}]
superseded_by: {{slug del estándar que lo reemplaza — omitir la clave salvo status: Superseded}}
tags: [{{testing}}]
---

# {{Título del estandar}}

{{qué dominio cubre este estándar y a qué partes del proyecto aplica; un párrafo corto}}

<!--
Un bloque `## <Requisito>` por cada requisito del dominio. Al documentar una decisión nueva del MISMO
dominio, se AÑADE otro bloque de requisito aquí (o se actualiza uno existente) — no se crea un
estándar nuevo. Cada requisito tiene un slug estable (`ID`) único dentro de este estándar; agrupa
uno o varios **criterios de cumplimiento** y sirve de referencia legible (`<slug-del-estándar>/<slug-del-requisito>`,
p. ej. testing/unit-testing). El bloque del requisito solo trae la descripción normativa y `### Excepciones` — sus
criterios de cumplimiento se redactan más abajo, en la tabla única `## Criterios de cumplimiento`.

La unidad verificable y trazable NO es el requisito, sino cada **criterio de cumplimiento** (`CR-XXX`).
La sección `## Criterios de cumplimiento`, al final del documento (antes de `## Referencias`), reúne en
una sola tabla los criterios medibles de TODOS los requisitos de arriba (p. ej. cobertura ≥ 80%), cada
uno con ID `CR-XXX` (único en el estándar, correlativo a través de todos los requisitos), Requisito (el
`ID` del requisito al que pertenece), Origen (el ADR que lo fijó), si es Automatizable (fitness function)
y si su Verificación ya existe (yes/no). Un CR es lo que un ADR referencia en `emits` mediante su referencia global
`<slug-del-estándar>/CR-XXX` (p. ej. testing/CR-001). Su fitness function vive en el archivo de checks
del ESTÁNDAR — scripts/arch/checks/<slug-del-estándar>.<ext> (p. ej. checks/testing.mjs en un repo
Node), un archivo por estándar escrito en el lenguaje del stack del repo — donde el chequeo del CR se
localiza por su referencia CR-XXX en comentarios y líneas de salida. El runner
scripts/arch/verify.<ext> los ejecuta todos, o solo el de un estándar pasando su slug como argumento.

Rutas relativas a los ADR en la columna Origen: dependen de la forma del estándar. Forma simple
(docs/standards/<slug>.md) → `../adr/`. Forma con carpeta (docs/standards/<slug>/README.md) →
`../../adr/`. Ajustar la profundidad según corresponda.

Si un requisito necesita documentos de apoyo (guías, ejemplos, matrices), usar la forma de carpeta
(docs/standards/<slug>/) y enlazarlos con rutas relativas desde el requisito.
-->

## {{Título del requisito}}
**ID:** {{slug}}
**Estado:** {{Active | Deprecated | Superseded}}

{{Describe el requisito, su propósito, cuándo y dónde aplica, y cómo debe implementarse en el proyecto. Incluye las herramientas, convenciones, estructura o ubicación habitual cuando corresponda. La descripción PUEDE contener un enunciado normativo utilizando palabras clave RFC 2119 (MUST, SHOULD, MAY o sus equivalentes en el idioma del documento) para indicar las obligaciones, recomendaciones u opciones aplicables.}}

### Excepciones
{{Casos en los que el requisito no aplica o puede incumplirse justificadamente, o "Ninguna".}}

## {{E2E testing}}
**ID:** {{slug}}

{{…}}

### Excepciones
{{…}}

## Criterios de cumplimiento
<!--
Tabla ÚNICA para todo el estándar: reúne los criterios de cumplimiento de TODOS los requisitos de
arriba — no se repite esta sección por requisito. Los criterios de cumplimiento son la UNIDAD
verificable y trazable, no el requisito. Ej.: el requisito «Unit testing» puede tener el criterio
«cobertura ≥ 80%» (CR-001).
Columnas:
  - ID: `CR-XXX` (prefijo + 3 dígitos), único en el estándar, correlativo a través de todos los
    requisitos. Su referencia global es `<estándar>/CR-XXX` (p. ej. testing/CR-001); es lo que el ADR
    de Origen lista en `emits`.
  - Requisito: el `ID` (slug) del requisito al que pertenece este criterio (p. ej. unit-testing),
    para trazar la fila de vuelta a su bloque `## <Requisito>` de arriba.
  - Descripción: qué se mide (umbral, check, evidencia); si el criterio es normativo, usar palabra clave
    RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
  - Origen: el ADR que fijó este criterio de cumplimiento (traza CR → ADR).
  - Automatizable: yes = objetivo/automatizable como fitness function; no = criterio humano/evidencia externa.
  - Enfoque: `bloqueante` = su incumplimiento hace fallar el gate (exit ≠ 0 del runner); `warning` =
    se reporta pero NO tumba el gate. Por defecto `bloqueante`. Se implementa DENTRO del chequeo del CR
    en el archivo de checks de su estándar, no en el nombre del archivo.
  - Verificación: yes = la verificación ya existe (el chequeo del CR está registrado en el archivo de
    checks de su estándar — que se localiza POR CONVENCIÓN en
    scripts/arch/checks/<slug-del-estándar>.<ext>, p. ej. checks/testing.mjs en un repo Node, donde el
    chequeo se identifica por su referencia CR-XXX; la ruta NO se escribe en la tabla — o hay evidencia
    externa registrada en el requisito: archivo, job CI, etc.); no = aún no existe.
-->

| ID | Requisito | Descripción | Origen | Automatizable | Enfoque | Verificación |
|----|-----------|-------------|--------|-------------|---------|----------------|
| CR-{{001}} | {{unit-testing}} | Cobertura de pruebas unitarias **DEBE** ser ≥ {{80%}} | [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md) | {{yes \| no}} | {{bloqueante \| warning}} | {{yes \| no}} |
| CR-{{002}} | {{unit-testing}} | {{…otro criterio del mismo requisito, si aplica}} | [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md) | {{yes \| no}} | {{bloqueante \| warning}} | {{yes \| no}} |
| CR-{{003}} | {{e2e-testing}} | Los flujos críticos definidos por producto **DEBEN** tener cobertura e2e con Playwright | [ADR-{{YYY}}](../adr/ADR-{{YYY}}-{{slug}}.md) | {{yes \| no}} | {{bloqueante \| warning}} | {{yes \| no}} |

## Referencias

- ADR de origen de cada criterio de cumplimiento (ver columna `Origen` y `source_adrs`) y otros estándares relacionados
- {{documentos de apoyo del estándar, si usa la forma de carpeta — rutas relativas dentro de docs/standards/<slug>/}}
