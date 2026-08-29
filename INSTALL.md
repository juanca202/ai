# Instalación

Este repositorio publica el plugin **SDD Devkit** (`sdd-devkit`): skills y agentes de Spec-Driven Development en [`skills/`](skills/) y [`agents/`](agents/).

> **Instálalo como plugin, no copies skills sueltos.** Los skills comparten reglas
> transversales en [`reference/`](reference/) y las citan con rutas relativas (`../../reference/…`),
> así que esa carpeta tiene que viajar con ellos. Un skill copiado por su cuenta pierde esas
> referencias.

## Instalación en Cursor

Instala el plugin completo desde la raíz del repositorio — no un subconjunto de skills, o queda
fuera la carpeta `reference/` compartida:

```
/add-plugin https://github.com/juanca202/sdd-devkit
```

El manifiesto es el [`plugin.json`](plugin.json) de la raíz, en el formato del estándar abierto
[Agent Plugins](https://agent-plugins.org/) — no el formato propio de Cursor (`.cursor-plugin/`).
La v1 del estándar solo estandariza **skills** y **servidores MCP**, así que en Cursor llegan los
16 skills con su carpeta `reference/`; los agentes de `agents/` y los hooks de `hooks/` quedan
fuera del estándar y solo los carga Claude Code (ver abajo). Este plugin **no** declara ningún
servidor MCP: las preguntas al usuario van por la tool nativa `AskQuestion`.

## Instalación en Claude Code

Manifiestos: [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) (marketplace) y
[.claude-plugin/plugin.json](.claude-plugin/plugin.json) (plugin).

Agrega el marketplace y luego instala el plugin:

```
/plugin marketplace add juanca202/sdd-devkit
/plugin install sdd-devkit@juanca202
```

Los skills quedan disponibles con prefijo de namespace (por ejemplo `/sdd-devkit:git-commit`) y
también se invocan automáticamente según el contexto de la tarea. Los agentes de `agents/` aparecen
en `/context` bajo Custom Agents. Las preguntas al usuario van por `AskUserQuestion`;
`hooks/hooks.json` observa esas llamadas para el seguimiento. Este plugin **no** declara un
servidor MCP.
