# Flujo · Investigación libre

Procedimiento del flujo **Investigación libre** de `work-research`: la entrada es un
**tema**, sin artefacto, sin código concreto y sin defecto reportado. Es el flujo por
defecto: se elige cuando ningún otro aplica.

```text
Tema a investigar
    │
    ▼
Clasificar en dominio(s)        ← Producto / Arquitectura / Técnica / Cambio
    │
    ▼
Formular y confirmar la pregunta de investigación
    │
    ▼
Investigar según el dominio
    │
    ▼
Sintetizar hallazgos + recomendación
    │
    ▼
RS-XXX en docs/specs/research/RS-XXX-{slug}/README.md
```

**Entregable:** un `RS-XXX` en `docs/specs/research/RS-XXX-{slug}/README.md`, redactado
con [`assets/research-template.md`](../../assets/research-template.md). Sin archivos
adicionales; la sección **Impacto en el artefacto** se marca
`N/A — investigación independiente`.

**Pregunta de investigación:** el tema, acotado a un dominio y a una decisión concreta.
Confirmarla con el usuario antes de investigar.

## Principios rectores

1. **Un dominio, un foco.** Si el tema abarca varios dominios, confirmar cuál manda:
   determina qué se busca y qué forma tiene la conclusión. Los temas inconexos van en
   RS separados.
2. **Recomendar, no solo describir.** Un informe que enumera opciones sin
   pronunciarse no cierra la decisión. Siempre hay una recomendación con su
   justificación, o una declaración explícita de por qué no se puede recomendar aún.
3. **La incertidumbre se declara.** Información contradictoria, desactualizada o de
   fuente débil se marca como tal; no se sintetiza como consenso.
4. **Inspeccionar código no cambia de flujo.** Responder «¿cómo funciona X?» leyendo el
   repo es parte de este flujo. Solo se pasa a *Analizar legado* si el objetivo es
   **documentar** ese código como features y cubrirlo con pruebas.

## Paso 1 — Clasificar el dominio

Clasificar el tema en uno o más dominios. Si encaja en varios, **confirmar el foco
principal** con el usuario antes de investigar: el dominio determina qué se busca y
qué forma tiene la conclusión.

| Dominio | Señales típicas | Qué produce |
|---------|-----------------|-------------|
| **Producto** | "¿qué construir?", "benchmarking", "¿qué features tiene X?", viabilidad de negocio | Hallazgos sobre requisitos, mercado o usuarios |
| **Arquitectura** | "¿cómo estructurarlo?", "¿qué patrón?", "¿monolito o microservicio?", "ADR" | Comparativa de patrones, recomendación de diseño |
| **Técnica** | "¿es viable?", "¿cómo funciona X?", "¿qué librería?", "¿rendimiento?" | Evaluación técnica, comparativa de herramientas |
| **Cambio** | "¿qué impacto?", "¿qué se rompe si?", "refactor de", "¿compatibilidad?" | Análisis de impacto, riesgos, enfoque de cambio a alto nivel |

## Paso 2 — Investigar según el dominio

**Producto.** Benchmarking de soluciones comparables, análisis de necesidades del
usuario, restricciones de negocio o regulatorias, coste y modelo de licencia.

**Arquitectura.** Patrones aplicables y sus trade-offs, ejemplos reales de uso,
compatibilidad con lo que ya existe en el repo, y una recomendación de diseño. Si la
conclusión es una decisión estructural, el *handoff* natural es
`arch-manage` (ADR).

**Técnica.** Viabilidad con el stack actual (verificarlo contra los manifiestos del
repo, no de memoria), comparativa de opciones (rendimiento, madurez, mantenimiento
activo, licencia, comunidad, tamaño), limitaciones conocidas y coste de adopción.

**Cambio.** Superficie de impacto (qué módulos, contratos y consumidores se ven
afectados), riesgos y *breaking changes*, enfoque de cambio a alto nivel y criterio de
*rollback*. **No** el plan de implementación: eso es `work-define` o `work-plan`.

## Paso 3 — Concluir

La conclusión responde **directamente** a la pregunta de investigación y es
accionable: qué hacer, qué evitar, qué decidir. Si la investigación resulta
inconclusa, decir qué información adicional se necesita y de dónde saldría.

## Handoffs

| Si la conclusión es… | Skill siguiente |
|----------------------|-----------------|
| Una decisión de arquitectura que conviene documentar | `arch-manage` (ADR) — el RS alimenta su sección «Contexto» |
| Una necesidad funcional que hay que especificar | `work-define` (US) |
| Un trabajo técnico concreto y acotado | `work-plan` (WI o TK) |
| Que el código existente hay que **documentar** y cubrir con pruebas | Flujo **Analizar legado** de este mismo skill |

## Anti-patrones

Además de los transversales de `SKILL.md`:

- Elegir este flujo **por descarte**, sin comprobar antes si la entrada era un
  artefacto, un issue, un test case, código legado o una migración.
- Investigar sin haber clasificado el dominio, o cambiar de dominio a mitad sin
  reformular la pregunta.
- Entregar una comparativa sin recomendación.
- Escalar a *Analizar legado* solo porque hizo falta leer código.
