# Guía de contribución

¡Gracias por tu interés en contribuir a **SDD Devkit**! Este documento resume cómo proponer cambios, reportar problemas y qué se espera de un Pull Request.

## Código de conducta

Al participar en este proyecto te comprometes a mantener un trato respetuoso y constructivo con el resto de colaboradores. No se tolera acoso, lenguaje ofensivo ni ataques personales.

## ¿Cómo puedo contribuir?

### Reportar un bug o proponer una mejora

Abre un [issue](https://github.com/juanca202/ai/issues) describiendo:

- **Contexto:** qué skill o agente afecta (`skills/<nombre>` o `agents/<nombre>`).
- **Comportamiento actual vs. esperado.**
- **Pasos para reproducirlo** (si aplica) o ejemplo concreto de uso.

Antes de abrir uno nuevo, revisa que no exista ya un issue similar.

### Proponer un cambio (Pull Request)

1. Haz un **fork** del repositorio y crea una rama descriptiva a partir de `main`:
   - `feature/<slug>` para un skill o agente nuevo.
   - `fix/<slug>` para una corrección.
   - `docs/<slug>` para cambios de documentación.
2. Sigue las convenciones existentes del repo:
   - Cada skill vive en `skills/<nombre>/SKILL.md` con frontmatter `name`, `description` y `license: MIT`; referencias adicionales en `references/` y plantillas en `assets/`, cargadas solo cuando el flujo las necesita.
   - Cada agente vive en `agents/<nombre>.md` (o `.mdc` según el cliente).
   - Redacta la documentación en español, salvo identificadores, nombres de artefacto y claves de modificadores (siempre en inglés).
3. Prueba tu cambio localmente antes de abrir el PR:
   - Cursor: `npx skills add <ruta-o-url-de-tu-fork>`.
   - Claude Code: `claude --plugin-dir .` desde la raíz del repo.
4. Usa [Conventional Commits](https://www.conventionalcommits.org/) en tus mensajes de commit (`feat:`, `fix:`, `docs:`, `refactor:`, etc.) — puedes apoyarte en el skill `git-commit` del propio repo.
5. Abre el Pull Request contra `main` con:
   - Descripción clara del **qué** y el **por qué** del cambio.
   - Referencia al issue relacionado, si existe (`Closes #123`).
   - Confirmación de que probaste el skill/agente modificado.
6. Un mantenedor revisará el PR y puede pedir ajustes antes de aprobarlo y mergearlo.

## Estructura del repositorio

| Carpeta | Contenido |
|---------|-----------|
| `skills/` | Skills del plugin SDD Devkit (Cursor y Claude Code). |
| `agents/` | Agentes reutilizables invocables con la herramienta Task o referenciados desde reglas. |
| `other-skills/` | Skills adicionales fuera del plugin principal. |
| `.claude-plugin/` | Manifiesto (`plugin.json`) y marketplace (`marketplace.json`) del plugin. |

## Preguntas

Si tienes dudas sobre por dónde empezar, abre un issue con la etiqueta `question` o inicia una discusión antes de invertir tiempo en un cambio grande.
