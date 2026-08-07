# Flujo · Analizar decisiones pendientes

Procedimiento del flujo **Analizar decisiones pendientes** de `work-research`: la
entrada es un **artefacto de trabajo** —`US-XXX`, `TK-XXX` o `WI-XXX`, local o
referenciado en el gestor de proyectos— y el objetivo es **cerrar lo que impide
planificarlo o implementarlo**: lagunas de especificación y disyuntivas que el
artefacto deja sin resolver.

```text
US-XXX / TK-XXX / WI-XXX
    │
    ▼
Cargar el artefacto y sus investigaciones previas
    │
    ▼
Inventariar lagunas ────────┐
    │                       │  Diagnóstico
    ▼                       │
Inventariar decisiones      │
pendientes por tomar ───────┘
    │
    ▼
Investigar opciones y trade-offs de cada decisión
    │
    ▼
Recomendar una opción por decisión, con justificación
    │
    ▼
RS-XXX dentro de la carpeta del artefacto
```

**Entregable:** un `RS-XXX` en la carpeta `research/` **del propio artefacto**,
redactado con `[assets/research-template.md](../../assets/research-template.md)`:

- `US-XXX` / `TK-XXX` → `docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}/`
- `WI-XXX` → `docs/specs/work-items/WI-XXX-{kebab-case}/research/RS-XXX-{slug}/`

**Pregunta de investigación:** «¿Qué falta decidir o aclarar en  para poder
planificarlo o implementarlo?». Confirmarla con el usuario antes de investigar.

## Principios rectores

1. **No se modifica el artefacto.** Este flujo produce hallazgos y recomendaciones; el
  `README.md` de la US/WI y los `TK-XXX` los edita su skill dueño (`work-define`,
   `work-plan`). La sección **Impacto en el artefacto** del RS dice qué habría que
   cambiar, pero no lo cambia.
2. **Toda decisión termina en una recomendación.** Enumerar opciones sin
  pronunciarse deja el artefacto igual de bloqueado que antes.
3. **Solo lo que bloquea.** Una laguna que no impide planificar ni implementar no es
  objeto de este flujo: se anota y se sigue. El criterio es «¿puede alguien empezar a
   trabajar sin resolver esto?».



## Paso 1 — Cargar el artefacto

Leer el artefacto **antes** de investigar:


| Tipo     | Archivo a leer                                        | Qué extraer                                                                   |
| -------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `US-XXX` | `docs/specs/user-stories/US-XXX-{nombre}/README.md`   | Objetivo, criterios `AC-XXX`, reglas de negocio, restricciones, Observaciones |
| `TK-XXX` | El `TK-XXX-{kebab}.md` bajo la carpeta de su `US-XXX` | Objetivo técnico, dependencias, decisiones abiertas                           |
| `WI-XXX` | `docs/specs/work-items/WI-XXX-{kebab-case}/README.md` | Descripción, criterios, plan de implementación actual, Observaciones          |


Además:

- Revisar `research/` del artefacto: si ya hay investigaciones previas, **mostrarlas al
usuario** y no duplicarlas; la nueva parte de donde aquellas quedaron.
- Si el artefacto tiene casos de prueba (`test-cases/`), leerlos: acotan el
comportamiento esperado y suelen revelar criterios ambiguos.
- Si el artefacto vive en el gestor de proyectos, leerlo por MCP (ver «Entrada desde
el gestor de proyectos» en `SKILL.md`): comentarios y discusión suelen contener
decisiones ya tomadas que no llegaron al documento.



## Paso 2 — Inventariar lagunas y decisiones

Separar dos cosas que se confunden con facilidad:


|                | **Laguna**                                                                                     | **Decisión pendiente**                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Qué es         | Falta información que **alguien ya tiene** o que el documento omite                            | Hay que **elegir** entre opciones y nadie ha elegido                                       |
| Cómo se cierra | Preguntando (al usuario, al negocio, al documento fuente)                                      | Investigando opciones y **recomendando** una                                               |
| Ejemplos       | Criterio ambiguo, regla de negocio sin definir, dependencia no confirmada, Observación abierta | Qué librería, qué patrón, qué enfoque de integración, qué estrategia de migración de datos |


Listar ambas explícitamente antes de investigar. Las **lagunas** que el usuario puede
responder se preguntan con la herramienta estructurada — no se investigan.

## Paso 3 — Investigar cada decisión

Para cada decisión pendiente:

1. **Opciones reales**, acotadas al stack y las restricciones del repo (verificarlas
  contra los manifiestos, no de memoria). Descartar de entrada las inviables y decir
   por qué.
2. **Trade-offs** en los ejes que importan a este artefacto: encaje con lo existente,
  coste de adopción, rendimiento, mantenimiento, licencia, reversibilidad.
3. **Recomendación** con justificación explícita y, si aplica, condición de
  reevaluación («si X cambia, reconsiderar»).

Contrastar todos los hallazgos contra los criterios de aceptación (`AC-XXX`) y —si
existen— los casos de prueba del artefacto: una recomendación que no permite cumplir un
`AC-XXX` no es válida.

## Paso 4 — Concluir

El RS debe dejar, en su sección **Impacto en el artefacto**, qué se ve afectado y qué
tendría que hacer el skill dueño: qué criterio reescribir, qué regla añadir, qué
dependencia registrar, qué decisión anotar en Observaciones.

## Handoffs


| Artefacto investigado                     | Skill siguiente                | Cómo pasar el contexto                                     |
| ----------------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| `US-XXX`                                  | `work-define`                  | El RS se referencia y el skill dueño actualiza la historia |
| `TK-XXX` / `WI-XXX`                       | `work-plan` → `work-implement` | El RS se referencia en el TK o WI                          |
| Cualquiera, si la decisión es estructural | `arch-manage`                  | El RS alimenta la sección «Contexto» del ADR               |




## Anti-patrones

- Editar el `README.md` de la US/WI o un `TK-XXX` desde este flujo.
- Guardar el RS en `docs/specs/research/` en vez de en la carpeta del artefacto.
- Investigar lagunas que el usuario podía responder en una pregunta.
- Cerrar una decisión con «depende» sin una recomendación condicionada a criterios
verificables.
- Duplicar una investigación previa que ya vive en el `research/` del artefacto.
- Recomendar una opción que impide cumplir alguno de sus `AC-XXX`.

