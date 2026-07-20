---
# Convención: sustituir manualmente cada {{texto}}. No es un motor de plantillas.
# Un ADR registra UNA decisión arquitectónica en un punto del tiempo: es histórico e
# inmutable una vez Accepted. Para cambiar de rumbo se crea un ADR nuevo que lo supersede.
# La REGLA viva y verificable que esta decisión pone en vigor vive aparte, como estándar en
# docs/standards/ (ver campo `emits`). No mezclar aquí el enunciado normativo del estándar.
id: ADR-{{XXX}}
status: {{Draft | Proposed | Accepted | Deprecated | Superseded}}
date: {{YYYY-MM-DD}}
deciders: [{{nombres o roles}}]
tags: [{{nextjs, app-router, performance, security, etc.}}]
supersedes: {{null | ADR-XXX}}
superseded_by: {{null | ADR-XXX}}
# Requisitos de estándar que esta decisión fija — referencia `<estándar>/<requisito>` dentro del
# estándar de dominio correspondiente (p. ej. testing/unit-testing). Vacío si la decisión es
# puntual/histórica y no establece una norma continua que cumplir.
emits: [{{testing/unit-testing}}]
---

# ADR-{{XXX}}: {{título}}

## Contexto

<!--
General, no puntual: describir el driver, la restricción o la tensión arquitectónica de forma
transversal, no un caso aislado. Puede apoyarse en ejemplos para ilustrar.
-->
{{problema, restricciones, drivers técnicos o de negocio — planteados a nivel de proyecto}}

## Decisión

<!--
La decisión tomada y su alcance, a nivel de proyecto. Este es el "por qué se eligió X".
Si esta decisión establece una regla continua que el equipo deberá cumplir, esa regla se
redacta como ESTÁNDAR en docs/standards/ y se enlaza en `emits` — no se detalla aquí como norma.
-->
{{decisión concreta y alcance — qué se eligió y frente a qué}}

## Alternativas consideradas (opcional)

- Opción A: {{pros/contras}}
- Opción B: {{pros/contras}}

## Consecuencias

### Positivas

- {{impacto esperado}}

### Negativas / trade-offs

- {{costos o riesgos asumidos}}

## Referencias

<!--
Las referencias NO deben apuntar a archivos de docs/specs (las specs siguen a los ADR, no al
revés). Referenciar aquí: otros ADR, los estándares emitidos (docs/standards/), documentación
general del proyecto y fuentes externas.
-->
- {{otros ADR, estándares emitidos, docs generales o fuentes externas; nunca docs/specs}}
