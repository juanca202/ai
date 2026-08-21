# Instalación

Este repositorio publica dos plugins de Claude Code desde el mismo marketplace (`juanca202`):

| Plugin | Contenido |
|--------|-----------|
| **SDD Devkit** (`sdd-devkit`) | Skills y agentes de Spec-Driven Development en [`skills/`](skills/) y [`agents/`](agents/) |
| **Utils** (`utils`) | Skills de utilidad en [`others/utils/skills/`](others/utils/skills/) |

> **Instálalo como plugin, no copies skills sueltos.** Los skills de SDD Devkit comparten reglas
> transversales en [`reference/`](reference/) y las resuelven vía `${CLAUDE_PLUGIN_ROOT}`, que solo
> existe cuando el plugin está instalado. Un skill copiado por su cuenta pierde esas referencias.

## Instalación en Cursor

Cada plugin se instala por separado, apuntando a su propia carpeta de skills — la raíz del repo mezcla
los dos:

```bash
npx skills add juanca202/ai/skills          # SDD Devkit
npx skills add juanca202/ai/others/utils/skills  # Utils
```

El asistente te guiará paso a paso: dónde instalar (proyecto o global) y qué agente usar. **Instala el
plugin completo**: seleccionar un subconjunto de skills deja fuera la carpeta `reference/` compartida.

## Instalación en Claude Code

Manifiestos: [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) (marketplace), [.claude-plugin/plugin.json](.claude-plugin/plugin.json) (SDD Devkit) y [others/utils/.claude-plugin/plugin.json](others/utils/.claude-plugin/plugin.json) (Utils).

Agrega el marketplace y luego instala el plugin que necesites:

```
/plugin marketplace add juanca202/ai
/plugin install sdd-devkit@juanca202
/plugin install utils@juanca202
```

Los skills quedan disponibles con prefijo de namespace (por ejemplo `/sdd-devkit:git-commit` o `/utils:alm-install`) y también se invocan automáticamente según el contexto de la tarea. Los agentes de `agents/` (plugin SDD Devkit) aparecen en `/context` bajo Custom Agents.
