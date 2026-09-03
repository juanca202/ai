# Cómo preguntar al usuario (compartida)

Referencia transversal del plugin **SDD Devkit**. Cada vez que un `SKILL.md` o cualquiera de sus
`references/` diga **preguntar, pedir, confirmar, validar o sugerir** algo al usuario, se asume este
mecanismo; no se repite en cada sección.

## Mecanismo

Usar la **herramienta de preguntas estructuradas nativa del cliente** (la que renderiza opciones
tappables o un selector) en lugar de redactar la pregunta como prosa libre. No usar una tool MCP
(`ask-question` ni ninguna otra) para preguntarle al usuario: el seguimiento de esas preguntas, si
está activo, lo hacen los hooks del plugin observando la tool nativa.

| Cliente | Tool |
|---------|------|
| Claude Code | `AskUserQuestion` |
| Cursor | `AskQuestion` |

- **Opciones cortas y mutuamente excluyentes** (2–4 por pregunta) cuando la respuesta admita
  categorías. Entrada libre **solo** si no hay forma razonable de enumerar opciones.
- **No gastar una opción en "ajustar" o "cambiar algo".** La herramienta ya ofrece una respuesta libre
  (`Other`), y ahí es donde el usuario dice qué quiere cambiar y cómo — una opción «Ajustar X» solo
  añade un turno para volver a preguntarle lo mismo. Reservar las opciones enumeradas para las
  decisiones que sí son categorías cerradas (confirmar, elegir entre alternativas concretas, cancelar).
  Vale igual para las variantes desglosadas del mismo ajuste («ajustar tipo / alcance / descripción»).
- **No añadir manualmente una opción "Otro" / "Otro (especificar)"/ "Ninguno de los anteriores".**
  La herramienta nativa ya agrega su propia opción de respuesta libre (`Other`) al final de cada
  pregunta; declarar una opción equivalente en la lista la duplica. Si ninguna de las opciones
  enumeradas encaja, esa es la respuesta libre que la herramienta ya ofrece — no una opción más de
  la lista.
- **Selección múltiple** solo donde el propio paso lo indique explícitamente (p. ej. capas de testing,
  candidatos de ADR, qué correcciones aplicar).
- **No repreguntar** lo que ya esté resuelto en el contexto de la sesión, en `.agents/MEMORY.md`, en los
  documentos o manifiestos del repo, en el artefacto de trabajo o en el work item del tracker externo
  cuando su MCP está disponible.
- **Fallback:** si el cliente no expone `AskUserQuestion` ni `AskQuestion`, formular la pregunta en
  prosa con las opciones **enumeradas** (1, 2, 3…). No sustituir ese fallback por una tool MCP.

## Ritmo

- **Una sola tanda al inicio.** Agrupar las preguntas pendientes de un mismo paso en un solo bloque
  (máximo 2–3 por bloque) en vez de ir descubriendo huecos turno a turno.
- **Confirmaciones: una pregunta por turno**, con opciones claras
  (p. ej. `[Confirmar] / [Cancelar]`, `[Sí, continuar] / [No, detener aquí]`) — el ajuste va por respuesta
  libre, no como opción. **No avanzar ni escribir archivos antes de la respuesta.**
- **Decidir con la información delante:** presentar primero el reporte, la propuesta o la tabla de
  candidatos, y preguntar después.
- **No proponer un default implícito** cuando la respuesta condiciona operaciones destructivas o de
  git: listar los candidatos detectados como opciones.

## Herramienta no disponible

Si una herramienta necesaria para responder no está disponible (el MCP del gestor de proyectos, el MCP
de navegador en una migración), **pedir al usuario que aporte los insumos manualmente** en lugar de
detener el flujo.

## Excepciones al ritmo declaradas del catálogo

Algunos pasos, por su naturaleza, no pueden plantearse en la tanda inicial. Son **excepciones
deliberadas**, una por turno:

| Skill | Excepción |
|-------|-----------|
| `arch-init` | **Una tanda por paso**, no una sola al inicio: el flujo tiene cinco pasos con preguntas en cada uno, y no hay tope fijo de preguntas por bloque. La topología (repo único vs. multi-repo) se pregunta al inicio del Paso 1, antes que la clasificación de situación. En multi-repo, los pasos que se repiten por submódulo (situación, stack, candidatos) agrupan las preguntas de varios submódulos en una sola tanda por paso, no una tanda por submódulo. Selección múltiple explícita en capas de testing y en candidatos de ADR. |
| `design-define` | Si el *grilling* inicial detecta más de tres lagunas, **encadenar tandas** hasta agotarlas o hasta que el usuario indique que lo restante quede como Observación. |
| `git-commit` | **No lee `.agents/MEMORY.md`**: sus fuentes de «no repreguntar» son el contexto de la sesión, el diff y la propuesta ya mostrada. Fuera de tanda, una por turno: propuesta de **división** (una sola por invocación, y **solo** cuando el diff se reparte en varios commits — un commit único se ejecuta sin confirmar), commit en rama protegida, archivo sensible detectado. |
| `quality-check` | Si se corrigen los fallos o se entrega solo el informe: se pregunta con el reporte ya presentado. |
| `requirement-refine` | El cierre de lagunas **funcionales** va primero, en **tandas de hasta 3 preguntas**, encadenando tantas como haga falta hasta agotarlas o hasta que el usuario indique que lo restante quede como Observación — misma mecánica que el cierre de Draft en `work-define`. Las preguntas **técnicas** (stack, repositorios) van al final, no en la tanda inicial: la de stack (investigar con `/work-research` vs. usarlo ya definido) es una **confirmación de una sola pregunta**, aparte de las tandas. **Excepción:** si una laguna funcional no se puede cerrar sin una decisión técnica puntual, esa decisión se adelanta y se pregunta dentro de la misma tanda funcional que la necesita. |
| `work-integrate` | La tanda inicial va **antes de cualquier operación git** (trabajo asociado a la rama, carpeta ambigua, rama base). La confirmación del archivado (paso 10) es la excepción: va después de las puertas, porque hasta entonces no se sabe si el trabajo llega a cerrarse ni qué se movería. |
| `work-define` | Cierre de Draft: **tandas de hasta 3 preguntas**, encadenando tantas como haga falta. Al crear **varias US en la misma invocación**, los Draft del lote no se cierran historia por historia: las preguntas de todas las historias Draft se agrupan en las mismas tandas de hasta 3, cada una etiquetada con la historia a la que pertenece. |
| `work-plan` | Al redactar **varias TK o WI completos en el mismo lote** (Modo B, opción de planes/WI completos), el contexto técnico que falte para el conjunto no se pregunta tarea por tarea: se agrupa en tandas de hasta 3 preguntas etiquetadas por tarea/WI, encadenando tantas como haga falta. |
