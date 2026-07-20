# SDD Devkit

Skills y agentes del equipo para Cursor, Claude Code y otros asistentes de código.

Este repositorio es el plugin **SDD Devkit** (`sdd-devkit`): utilidades para Spec-Driven Development — ADRs y estándares de arquitectura por dominio (RFC 2119), historias de usuario, planificación e implementación de tareas y work items, definición y trazabilidad de pruebas, investigación (incluida la migración entre proyectos) y code review. Reutiliza los directorios `skills/` y `agents/` de la raíz para Cursor y para Claude Code.

[![skills.sh](https://skills.sh/b/juanca202/ai)](https://skills.sh/juanca202/ai)

## Instalación en Cursor

```bash
npx skills add https://github.com/juanca202/ai
```

El asistente te guiará paso a paso: dónde instalar (proyecto o global), qué agente usar y qué skills incluir.

## Instalación en Claude Code

Se distribuye como el mismo plugin **SDD Devkit** (manifiesto en [.claude-plugin/plugin.json](.claude-plugin/plugin.json) y marketplace en [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json)).

Agrega el marketplace y luego instala el plugin:

```
/plugin marketplace add juanca202/ai
/plugin install sdd-devkit@juanca202
```

Los skills quedan disponibles con prefijo de namespace (por ejemplo `/sdd-devkit:git-commit`) y también se invocan automáticamente según el contexto de la tarea. Los agentes de `agents/` aparecen en `/context` bajo Custom Agents.

Para probar cambios locales antes de publicar, desde la raíz del repo:

```bash
claude --plugin-dir .
```

## Skills incluidos

Los skills viven en [`skills/`](skills/).

| Skill | Uso |
|-------|-----|
| `arch-manage` | Crear o actualizar ADRs (decisiones, en `docs/adr/`) y estándares de arquitectura **por dominio** (en `docs/standards/`, p. ej. *Testing Standards*). Cada decisión añade un **requisito** — redactado con RFC 2119/8174 (MUST/SHOULD/MAY) — al estándar del dominio que corresponda; el ADR lo referencia (`emits`) y el estándar traza a sus decisiones (`source_adrs`). Las fitness functions cuelgan de cada requisito |
| `arch-discover` | Analizar un repositorio y proponer ADRs y requisitos candidatos, agrupados por estándar de dominio, a partir de decisiones y reglas implícitas |
| `arch-audit` | Auditar el cumplimiento de los **requisitos** de los estándares (`docs/standards/`) y de `AGENTS.md` contra el estado real del repo — requisito por requisito, según su término RFC 2119, citando el ADR de origen — y generar un informe priorizado en `docs/audits/` con revalidaciones incrementales |
| `code-review` | Revisión de código pre-merge: verificaciones automatizadas según el stack + revisión cualitativa (arquitectura, diseño, SOLID), con veredicto apto/no apto/incompleto |
| `git-commit` | Preparar commits con mensajes Conventional Commits inferidos del diff |
| `pr-create` | Crear PR o MR desde la rama actual (GitHub, GitLab, Azure Repos, etc.) con puertas de calidad obligatorias: code-review, trace-validate y Definition of Done |
| `test-define` | Crear casos de prueba (TC-XXX) desde los criterios de aceptación de una US o WI (IEEE 29119-4) |
| `trace-validate` | Reporte de trazabilidad: criterios de aceptación de US/WI ↔ casos y artefactos de prueba, con veredicto de cobertura |
| `work-research` | Investigar y sintetizar en un informe (RS-XXX). Genérico con tres flujos: artefacto (US/TK/WI → lagunas y decisiones pendientes), migración (origen→destino → discovery y validación, con handoff a `work-define` o `work-plan`) e investigación libre (producto, arquitectura, técnica o cambio) |
| `work-define` | Crear o actualizar historias de usuario (US-XXX) |
| `work-plan` | Planificar tareas técnicas (TK-XXX) o work items de mantenimiento (WI-XXX) |
| `work-implement` | Implementar tareas (TK-XXX) o work items (WI-XXX) a partir de specs en estado Ready |
| `work-integrate` | Cerrar e integrar el trabajo de una US o WI (merge de la rama feature previa verificación en `progress.md`) |

## Agentes incluidos

Los agentes viven en `agents/` y se pueden referenciar desde reglas de Cursor o invocar con la herramienta Task.

| Agente | Uso |
|--------|-----|
| `docs-specialist` | Especificación Markdown: US, TK, ADR, estándares, technical-docs, glosario y trazabilidad en `docs/specs` |
| `quality-specialist` | Autor senior de pruebas automatizadas; deriva casos de criterios de aceptación (SC/BR) |
| `ui-specialist` | UI agnóstica de framework; descubre stack, aplica `DESIGN.md` y convenciones del repo |

## Contribuir

Las contribuciones son bienvenidas. Antes de abrir un issue o un Pull Request, lee la [guía de contribución](CONTRIBUTING.md).

## Licencia

Este proyecto es de código abierto y se distribuye bajo la licencia [MIT](LICENSE).
