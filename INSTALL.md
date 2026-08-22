# Instalación

Este repositorio publica dos plugins de Claude Code desde el mismo marketplace (`juanca202`):

| Plugin | Contenido |
|--------|-----------|
| **SDD Devkit** (`sdd-devkit`) | Skills y agentes de Spec-Driven Development en [`skills/`](skills/) y [`agents/`](agents/) |
| **Utils** (`utils`) | Skills de utilidad en [`others/utils/skills/`](others/utils/skills/) |

## Instalación en Cursor

```bash
npx skills add https://github.com/juanca202/sdd-devkit
```

El asistente te guiará paso a paso: dónde instalar (proyecto o global), qué agente usar y qué skills incluir.

## Instalación en Claude Code

Manifiestos: [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) (marketplace), [.claude-plugin/plugin.json](.claude-plugin/plugin.json) (SDD Devkit) y [others/utils/.claude-plugin/plugin.json](others/utils/.claude-plugin/plugin.json) (Utils).

Agrega el marketplace y luego instala el plugin que necesites:

```
/plugin marketplace add juanca202/sdd-devkit
/plugin install sdd-devkit@juanca202
/plugin install utils@juanca202
```

Los skills quedan disponibles con prefijo de namespace (por ejemplo `/sdd-devkit:git-commit` o `/utils:alm-install`) y también se invocan automáticamente según el contexto de la tarea. Los agentes de `agents/` (plugin SDD Devkit) aparecen en `/context` bajo Custom Agents.
