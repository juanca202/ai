# Memory

Memoria persistente del proyecto: contexto rápido de idioma y preferencias/reglas **operativas** — no arquitectónicas (esas viven en `docs/adr/` y `docs/standards/`, ver `AGENTS.md`). El stack tecnológico **no** se duplica aquí: vive solo en `## Stack tecnológico` de `AGENTS.md`; otros skills del harness (p. ej. `arch-audit`) lo leen de ahí. Cualquier agente puede leer y actualizar este archivo directamente. Ante conflicto con un ADR o un requisito de estándar, esos tienen prioridad.

## Preferencias

- preferred language: <código>

## Reglas operativas

<!-- Convenciones de equipo que no son arquitectónicas: formato de commits, nombres de rama, horarios de release, etc. Agregar aquí a medida que surjan. -->

## Notas

<!-- Contexto puntual que un agente necesite recordar entre sesiones. -->
