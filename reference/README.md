# `reference/` — recursos compartidos del plugin

Contenido **transversal a varios skills** de SDD Devkit. Vive aquí, y no duplicado en cada
`SKILL.md`, para que exista una sola fuente de verdad por regla.

Los skills y los agentes lo referencian con una **ruta relativa al archivo que la escribe**:

```
../../reference/<archivo>.md   # desde skills/<nombre>/SKILL.md
../reference/<archivo>.md      # desde agents/<nombre>.md
```

La ruta relativa es deliberada: funciona igual al leer el repositorio en GitHub o en un editor, al
ejecutar el skill dentro del plugin y en cualquier agente que no expanda variables propias de un
host. **No usar `${CLAUDE_PLUGIN_ROOT}` ni ninguna otra variable** para citar estos archivos.
Lo que sí exige el plugin instalado es que la carpeta `reference/` viaje junto a `skills/` y
`agents/`: un skill copiado suelto pierde sus referencias.

## Catálogo

| Archivo | Qué contiene | Skills que lo consumen |
|---------|--------------|------------------------|
| [`language.md`](language.md) | Regla única de resolución del idioma de artefactos y mensajes: lectura obligatoria antes de ejecutar cualquier skill o agente | **Los 16 skills y los 3 agentes** | `arch-audit`, `arch-discover`, `arch-init`, `arch-manage`, `code-review`, `design-define`, `git-commit`, `pr-create`, `quality-check`, `test-define`, `trace-validate`, `work-define`, `work-implement`, `work-integrate`, `work-plan`, `work-research` |
| [`implementation.md`](implementation.md) | Política de implementación resuelta desde `.sdd-devkit/settings.json`: ritmo de confirmación por unidad, worktrees y su ubicación, concurrencia máxima y modo de archivado | `work-implement` |
| [`git.md`](git.md) | Política de commit y push resuelta desde `.sdd-devkit/settings.json`: si se confirma la propuesta de commit y si se hace push tras completarlo (no aplica en invocación delegada) | `git-commit` |
| [`quality-gates.md`](quality-gates.md) | Política de corrección resuelta desde `.sdd-devkit/settings.json`: si se pregunta antes de corregir un fallo/hallazgo o se corrige directamente sin preguntar | `quality-check`, `code-review` |
| [`asking.md`](asking.md) | Mecanismo de preguntas estructuradas, ritmo de las tandas, fallback en prosa y qué hacer si falta una herramienta | `arch-init`, `design-define`, `git-commit`, `quality-check`, `test-define`, `trace-validate`, `work-implement`, `work-integrate`, `work-plan`, `work-research` |
| [`verdicts.md`](verdicts.md) | Vocabulario de veredictos y estados de los informes: valor canónico, símbolo y etiqueta en el idioma resuelto; cómo los lee un consumidor | `quality-check`, `code-review`, `trace-validate`, `arch-audit`, `work-integrate`, `pr-create` |
| [`artifacts.md`](artifacts.md) | Layout del harness (rutas de cada artefacto), identificadores y numeración, y el contrato de archivado | Todo el ciclo de trabajo y de arquitectura |
| [`project-management.md`](project-management.md) | Integración con el gestor de proyectos resuelta desde `.sdd-devkit/settings.json`: si está activada, con qué proveedor y con qué datos de conexión (`host`, `workspace`, `project`) | `work-plan`, `test-define`, `work-research` |
| [`alm/azure-devops.md`](alm/azure-devops.md) | Delta del proveedor Azure DevOps: verificación del MCP, URL del work item, el ID de ADO sobre el secuencial local, límites de formato y contrato de sincronización | `work-plan`, `test-define`, `work-research` |

## Cómo referenciarlo desde un `SKILL.md`

Un puntero, no una copia. La sección **Resolución de idioma** es la **única regla de idioma vigente**
en todo artefacto — `SKILL.md` o agente — y se escribe **literalmente así**, sin variantes. Solo si el
skill o el agente tiene una **excepción explícita**, se añade **dentro de esa misma sección**; no puede
existir ninguna otra regla de idioma en el resto del archivo ni en sus `references/`:

```markdown
## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada:** <solo si existe; describir aquí y en ningún otro lugar>.
```

En un archivo de `agents/`, la ruta relativa es `../reference/language.md` y el texto dice
«este agente» en vez de «este skill».

La ruta se escribe **igual en el texto del enlace y en su destino**, para que el archivo se pueda
localizar tanto leyendo el markdown como siguiendo el enlace.

## Cuándo añadir algo aquí

Cuando una regla aplique a **tres o más skills** y su redacción sea sustancialmente la misma. Si aplica
a uno o dos, vive en el `SKILL.md` o en su `references/`. Al añadir un archivo, registrarlo en la tabla
de arriba y en [`AGENTS.md`](../AGENTS.md).
