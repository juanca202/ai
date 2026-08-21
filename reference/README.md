# `reference/` — recursos compartidos del plugin

Contenido **transversal a varios skills** de SDD Devkit. Vive aquí, y no duplicado en cada
`SKILL.md`, para que exista una sola fuente de verdad por regla.

Los skills lo referencian con la variable del plugin:

```
${CLAUDE_PLUGIN_ROOT}/reference/<archivo>.md
```

`${CLAUDE_PLUGIN_ROOT}` es la ruta absoluta a la raíz del plugin instalado y está disponible en el
cuerpo de un `SKILL.md`. **Este contenido solo resuelve con el plugin instalado**
(`/plugin install sdd-devkit@juanca202`); los skills de este repositorio no están pensados para
copiarse sueltos.

## Catálogo

| Archivo | Qué contiene | Skills que lo consumen |
|---------|--------------|------------------------|
| [`language.md`](language.md) | Orden canónico de resolución de idioma, qué nunca se traduce, palabras clave RFC 2119 y las excepciones declaradas del catálogo | `arch-audit`, `arch-discover`, `arch-init`, `arch-manage`, `code-review`, `design-define`, `git-commit`, `pr-create`, `quality-check`, `test-define`, `trace-validate`, `work-define`, `work-implement`, `work-integrate`, `work-plan`, `work-research` |
| [`asking.md`](asking.md) | Mecanismo de preguntas estructuradas, ritmo de las tandas, fallback en prosa y qué hacer si falta una herramienta | `arch-init`, `design-define`, `git-commit`, `quality-check`, `test-define`, `trace-validate`, `work-implement`, `work-integrate`, `work-plan`, `work-research` |
| [`artifacts.md`](artifacts.md) | Layout del harness (rutas de cada artefacto), identificadores y numeración, y el contrato de archivado | Todo el ciclo de trabajo y de arquitectura |
| [`alm/azure-devops.md`](alm/azure-devops.md) | Base común de la integración con Azure DevOps: activación, claves de `MEMORY.md`, verificación del MCP, URL, límites y contrato de sincronización | `work-plan`, `test-define`, `work-research` |

## Cómo referenciarlo desde un `SKILL.md`

Un puntero, no una copia. El `SKILL.md` declara **solo su delta** — a qué aplica la regla en ese skill y
qué excepción tiene, si la tiene:

```markdown
## Resolución de idioma

Orden canónico: [`${CLAUDE_PLUGIN_ROOT}/reference/language.md`](../../reference/language.md).

El idioma resuelto aplica al informe y a los mensajes al usuario. Los mensajes de error de las
herramientas no se traducen.
```

El enlace relativo entre paréntesis existe para que la navegación funcione al leer el repositorio en
GitHub o en un editor; en ejecución, la ruta que importa es la de `${CLAUDE_PLUGIN_ROOT}`.

## Cuándo añadir algo aquí

Cuando una regla aplique a **tres o más skills** y su redacción sea sustancialmente la misma. Si aplica
a uno o dos, vive en el `SKILL.md` o en su `references/`. Al añadir un archivo, registrarlo en la tabla
de arriba y en [`AGENTS.md`](../AGENTS.md).
