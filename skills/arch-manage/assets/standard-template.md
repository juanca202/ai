

---

## name: {{Título del estandar}}
domain: {{slug}}
status: {{Draft | Active | Deprecated}}
last_update: {{YYYY-MM-DD}}
source_adrs: [{{ADR-XXX}}]
tags: [{{testing}}]

# {{Título del estandar}}

{{qué dominio cubre este estándar y a qué partes del proyecto aplica; un párrafo corto}}



## {{Título del requisito}}

**ID:** {{slug}}

{{Cuál es el requisito, cómo se usa en el proyecto y cómo se implementa (herramientas, convenciones, ubicación típica).}}

### Alcance

{{Enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia: dónde aplica, qué **MUST**/**DEBE**, **SHOULD**/**DEBERÍA**, **MAY**/**PUEDE** cumplirse y dónde no aplica. Ej.: "Las pruebas unitarias **DEBEN** implementarse con PHPUnit; no **DEBE** introducirse otro framework de unit testing en `tests/unit/`."}}

### Excepciones

{{casos permitidos, o "Ninguna"}}

## {{E2E testing}}

**ID:** {{slug}}

{{Qué es, cómo se usa y cómo se implementa (p. ej. Playwright, convención de specs, flujos críticos).}}

### Alcance

{{Enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia. Ej.: "Las pruebas end-to-end **DEBEN** implementarse con Playwright; los flujos críticos definidos por producto **DEBERÍAN** tener cobertura e2e."}}

### Excepciones

{{…}}

## Criterios de cumplimiento




| ID         | Requisito        | Descripción                                                                             | Origen                                        | Automatizable | Enfoque                  | Verificación                              |
| ---------- | ---------------- | --------------------------------------------------------------------------------------- | --------------------------------------------- | ------------- | ------------------------ | ----------------------------------------- |
| CR-{{001}} | {{unit-testing}} | Cobertura de pruebas unitarias **DEBE** ser ≥ {{80%}}                                   | [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md) | {{yes | no}}  | {{bloqueante | warning}} | {{scripts/arch/checks/testing-CR-001.sh}} |
| CR-{{002}} | {{unit-testing}} | {{…otro criterio del mismo requisito, si aplica}}                                       | [ADR-{{XXX}}](../adr/ADR-{{XXX}}-{{slug}}.md) | {{yes | no}}  | {{bloqueante | warning}} | {{N/A}}                                   |
| CR-{{003}} | {{e2e-testing}}  | Los flujos críticos definidos por producto **DEBEN** tener cobertura e2e con Playwright | [ADR-{{YYY}}](../adr/ADR-{{YYY}}-{{slug}}.md) | {{yes | no}}  | {{bloqueante | warning}} | {{scripts/arch/checks/testing-CR-003.sh}} |


## Referencias

- ADR de origen de cada criterio de cumplimiento (ver columna `Origen` y `source_adrs`) y otros estándares relacionados
- {{documentos de apoyo del estándar, si usa la forma de carpeta — rutas relativas dentro de docs/standards//}}

