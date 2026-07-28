# Instalación

**SDD Devkit** se distribuye como plugin (`sdd-devkit`) y reutiliza los directorios [`skills/`](skills/) y [`agents/`](agents/) de la raíz tanto para Cursor como para Claude Code.

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