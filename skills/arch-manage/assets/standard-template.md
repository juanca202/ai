---
# Convención: sustituir manualmente cada {{texto}}. No es un motor de plantillas.
#
# Un ESTÁNDAR es un documento normativo de DOMINIO (p. ej. "Testing Standards", "API Standards"):
# es más AMPLIO que un ADR y AGREGA varios requisitos. No se crea un estándar por decisión; cada
# decisión (ADR) añade o actualiza UN REQUISITO dentro del estándar de dominio que corresponda.
# Ej.: "usar PHPUnit para unit tests" NO es un estándar — es el requisito «Unit testing» del estándar
# "Testing Standards"; si luego se decide Playwright para e2e, se AÑADE el requisito «E2E testing» al
# MISMO estándar, no se crea uno nuevo.
#
# El estándar se identifica por su NOMBRE (no lleva código). Cada requisito se redacta con los términos
# normativos de RFC 2119 / RFC 8174 (MUST, SHOULD, MAY…), es lo que audita `arch-audit`, y traza a su
# ADR de origen. El estándar es vivo (se actualiza); el ADR es historia inmutable.
#
# Ubicación (dos formas):
#   - Simple:        docs/standards/<slug>.md              (este archivo)
#   - Con extras:    docs/standards/<slug>/README.md       (este archivo, dentro de la carpeta del
#                    estándar) + los documentos adicionales junto a él en docs/standards/<slug>/
#   El <slug> es el nombre del estándar en kebab-case (p. ej. testing, api, frontend) y es el nombre
#   del archivo o de la carpeta.
name: {{Testing Standards}}
domain: {{testing}}                 # slug del dominio = nombre del archivo <slug>.md o de la carpeta <slug>/
status: {{Draft | Active | Deprecated}}
date: {{YYYY-MM-DD}}
source_adrs: [{{ADR-XXX}}]          # TODOS los ADR que han aportado requisitos a este estándar (recíproco de `emits`)
tags: [{{testing}}]
---

# {{Testing Standards}}

> Las palabras clave **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**,
> **SHOULD NOT**, **RECOMMENDED**, **MAY** y **OPTIONAL** de este documento se interpretan como se
> describe en BCP 14 ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) ·
> [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)) cuando, y solo cuando, aparecen en MAYÚSCULAS.

## Propósito y alcance

{{qué dominio cubre este estándar y a qué partes del proyecto aplica; una o dos frases}}

<!--
Un bloque `## <Requisito>` por cada regla del dominio. Al documentar una decisión nueva del MISMO
dominio, se AÑADE otro bloque de requisito aquí (o se actualiza uno existente) — no se crea un
estándar nuevo. Cada requisito tiene un slug estable (`ID`) único dentro de este estándar; su
referencia global es `<slug-del-estándar>/<slug-del-requisito>` (p. ej. testing/unit-testing), que es
lo que un ADR referencia en `emits` y de donde se deriva el nombre del wrapper de su fitness function
(scripts/arch/checks/<slug-del-estándar>-<slug-del-requisito>.sh).

Si un requisito necesita documentos de apoyo (guías, ejemplos, matrices), usar la forma de carpeta
(docs/standards/<slug>/) y enlazarlos con rutas relativas desde el requisito.
-->

## {{Unit testing}}

**ID:** {{unit-testing}}   <!-- referencia global: {{testing}}/{{unit-testing}} -->
**Origen:** [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md)

{{Enunciado normativo con RFC 2119. Ej.: "Las pruebas unitarias **MUST** implementarse con PHPUnit; no **SHALL** introducirse otro framework de unit testing en `tests/unit/`."}}

- **Alcance:** {{dónde aplica y dónde no}}
- **Excepciones:** {{casos permitidos, o "Ninguna"}}
- **Cumplimiento (fitness function):**
  - `apto`: {{true | false}}          <!-- true = objetivo/automatizable; false = criterio humano/evidencia externa -->
  - `status`: {{Created | Pending | N/A}}
  - `tool`: {{PHPUnit coverage | dependency-cruiser | ArchUnit | import-linter | NetArchTest | script CI | N/A}}
  - `location`: {{scripts/arch/checks/testing-unit-testing.sh}}
  - `command`: {{sh scripts/arch/verify-architecture.sh | TODO | N/A}}

## {{E2E testing}}

**ID:** {{e2e-testing}}   <!-- referencia global: {{testing}}/{{e2e-testing}} -->
**Origen:** [ADR-{{YYY}}](../adr/ADR-{{YYY}}-{{slug}}.md)

{{Ej.: "Las pruebas end-to-end **MUST** implementarse con Playwright; los flujos críticos definidos por producto **SHOULD** tener cobertura e2e."}}

- **Alcance:** {{…}}
- **Excepciones:** {{…}}
- **Cumplimiento (fitness function):**
  - `apto`: {{true | false}}
  - `status`: {{Created | Pending | N/A}}
  - `tool`: {{…}}
  - `location`: {{scripts/arch/checks/testing-e2e-testing.sh}}
  - `command`: {{…}}

## Referencias

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) · [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) (BCP 14)
- ADR de origen de cada requisito (ver `source_adrs`) y otros estándares relacionados
- {{documentos de apoyo del estándar, si usa la forma de carpeta — rutas relativas dentro de docs/standards/<slug>/}}
