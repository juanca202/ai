# @juanca202/ai

Skills y agentes del equipo para Cursor y otros asistentes de código.

## Instalación

```bash
npx skills add https://github.com/juanca202/ai
```

El asistente te guiará paso a paso: dónde instalar (proyecto o global), qué agente usar y qué skills incluir.

## Skills incluidos

| Skill | Uso |
|-------|-----|
| `ado-install` | Configurar el MCP de Azure DevOps en Cursor (PAT, multi-cuenta, verificación) |
| `adr-discover` | Auditar un repositorio y proponer ADRs candidatos a partir de decisiones implícitas |
| `adr-manage` | Crear o actualizar Architecture Decision Records en `docs/adr/` |
| `code-review` | Batería de verificaciones automatizadas pre-merge según el stack detectado |
| `git-commit` | Preparar commits con mensajes Conventional Commits inferidos del diff |
| `pr-create` | Crear PR o MR desde la rama actual (GitHub, GitLab, Azure Repos, etc.) |
| `project-create` | Crear proyectos nuevos fusionando plantillas del equipo por stack |
| `project-migrate` | Planificar y documentar migraciones tecnológicas entre proyectos (MG-XXX) |
| `prompt-validate` | Validar y mejorar prompts para agentes de IA (efectividad y reescritura) |
| `test-define` | Crear casos de prueba (TC-XXX) desde los criterios de aceptación de una US o WI (IEEE 29119-4) |
| `trace-validate` | Reporte de trazabilidad: criterios de aceptación de US/WI/MG ↔ casos y artefactos de prueba, con veredicto de cobertura |
| `work-research` | Investigar un tema y sintetizarlo en un informe (RS-XXX): producto, arquitectura, técnica o cambio |
| `work-define` | Crear o actualizar historias de usuario (US-XXX) |
| `work-plan` | Planificar tareas técnicas (TK-XXX) o work items de mantenimiento (WI-XXX) |
| `work-implement` | Implementar TK, WI o migraciones (MG-XXX) a partir de specs en estado Ready |
| `work-integrate` | Cerrar e integrar el trabajo de una US, WI o MG (merge de la rama feature previa verificación en `progress.md`) |

## Agentes incluidos

Los agentes viven en `agents/` y se pueden referenciar desde reglas de Cursor o invocar con la herramienta Task.

| Agente | Uso |
|--------|-----|
| `docs-specialist` | Especificación Markdown: US, TK, ADR, technical-docs, glosario y trazabilidad en `docs/specs` |
| `quality-specialist` | Autor senior de pruebas automatizadas; deriva casos de criterios de aceptación (SC/BR) |
| `ui-specialist` | UI agnóstica de framework; descubre stack, aplica `DESIGN.md` y convenciones del repo |
