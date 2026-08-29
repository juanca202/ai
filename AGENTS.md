# Agents

Instrucciones para agentes (Claude Code, Cursor, etc.) que trabajen en este repositorio. **SDD Devkit** es un repositorio de *skills*: su "código" son los `SKILL.md` y sus recursos, no una aplicación.

## Reglas de creación de skills

### Ubicación y estructura

- Cada skill vive en `skills/<nombre>/SKILL.md`. `<nombre>` en kebab-case, verbo o par verbo-sustantivo corto (`arch-manage`, `work-plan`, `pr-create`), consistente con el resto del catálogo.
- Recursos adicionales solo si el flujo los necesita:
  - `references/` — documentación de consulta puntual (catálogos, convenciones, detalle de un sub-flujo) que se lee **solo cuando aplica**, no de entrada.
  - `assets/` — plantillas y archivos que el skill usa como salida (p. ej. `adr-template.md`, `user-story-template.md`).
  - `scripts/` — código ejecutable para tareas deterministas o repetitivas.
- `SKILL.md` es el **router**: explica el flujo y delega el detalle a `references/`. Si se acerca a las ~500 líneas, es señal de que algo debe moverse a `references/` con un puntero claro desde el cuerpo ("ver `references/x.md` cuando...").

### Recursos compartidos (`reference/` en la raíz del plugin)

Lo **transversal a varios skills** no se duplica: vive en [`reference/`](reference/), en la raíz del plugin, y cada `SKILL.md` lo referencia con una **ruta relativa** (`../../reference/<archivo>.md`; desde `agents/`, `../reference/<archivo>.md`). Índice y catálogo completo en [`reference/README.md`](reference/README.md).

- **Regla de extracción:** si una regla aplica a **tres o más skills** y su redacción es sustancialmente la misma, va a `reference/`. Si aplica a uno o dos, se queda en el `SKILL.md` o en su `references/`.
- **Puntero, no copia.** El `SKILL.md` enlaza la referencia compartida y declara **solo su delta**: a qué aplica la regla en ese skill y qué excepción tiene, si la tiene. Reescribir el contenido común en el skill es el anti-patrón que esta carpeta existe para evitar.
- **Las excepciones viven dentro de la sección del `SKILL.md`** que se aparta de la regla, empezando por `**Excepción deliberada:**`, y en ningún otro lugar del archivo ni de sus `references/`. El archivo compartido de `reference/` no lleva tabla de excepciones; el índice auditable es la tabla de reglas de [`SKILLS.md`](SKILLS.md).
- **Formato del puntero** — ruta relativa idéntica en el texto y en el destino. **No usar variables de host** (las que un cliente expande a la raíz del plugin instalado): la ruta relativa resuelve igual en GitHub, en un editor y en cualquier agente, la variable no.

  ```markdown
  Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).
  ```

- Cada skill lista además las referencias compartidas que consume en una subsección **Referencias compartidas del plugin** dentro de su *Mapa de referencias*.
- **La carpeta `reference/` viaja con el catálogo.** Un skill copiado suelto fuera del plugin deja de resolver sus rutas relativas; el catálogo se distribuye e instala como plugin (ver [INSTALL.md](INSTALL.md)).
- Al añadir un archivo a `reference/`, registrarlo en la tabla de [`reference/README.md`](reference/README.md).

### Frontmatter obligatorio

```yaml
---
name: <mismo nombre que la carpeta>
description: <qué hace + cuándo activarlo>
license: MIT
---
```

- Todo el bloque de frontmatter debe ser **YAML válido** (delimitado por `---`, sin tabs, comillas/bloques `>`/`>-` bien formados si la descripción ocupa varias líneas).
- `name`: debe coincidir exactamente con el nombre de la carpeta, en **minúsculas**, palabras separadas por `-` (kebab-case), **menos de 64 caracteres**.
- `description`: **máximo 1000 caracteres**. Es el mecanismo principal de activación — es lo único que el modelo ve antes de decidir si carga el skill. Debe combinar **qué hace** y **cuándo usarlo**, incluyendo frases gatillo concretas que el usuario podría escribir ("registrar decisión", "crea el PR", "/work-plan"). Toda la lógica de activación va aquí, no en el cuerpo.
- Ante la duda de si el skill va a activarse cuando debería, redactar la descripción de forma un poco "insistente" (mencionar variantes, sinónimos, casos donde el usuario no usa la palabra exacta) — los skills tienden a sub-activarse más que a sobre-activarse.
- Delimitar el alcance en la descripción: qué NO hace y en qué skill delega esa parte (p. ej. `code-review` aclara que no corre tests, eso es de `quality-check`), para evitar solapamiento entre skills del catálogo.

## Recursos relacionados

- [reference/README.md](reference/README.md) — índice de los recursos compartidos del plugin.
- [SKILLS.md](SKILLS.md) — catálogo de skills existentes, con detalle de uso y opciones.
- [CONTRIBUTING.md](CONTRIBUTING.md) — flujo de contribución (ramas, commits, PR).
- [README.md](README.md) — visión general del harness y cómo se conectan los skills.
