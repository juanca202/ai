# Cómo preguntar al usuario (compartida)

Referencia transversal del plugin **SDD Devkit**. Cada vez que un `SKILL.md` o cualquiera de sus
`references/` diga **preguntar, pedir, confirmar, validar o sugerir** algo al usuario, se asume este
mecanismo; no se repite en cada sección.

## Mecanismo

Usar la **herramienta de preguntas estructuradas** del cliente (la que renderiza opciones tappables o
un selector) en lugar de redactar la pregunta como prosa libre.

- **Opciones cortas y mutuamente excluyentes** (2–4 por pregunta) cuando la respuesta admita
  categorías. Entrada libre **solo** si no hay forma razonable de enumerar opciones.
- **No gastar una opción en "ajustar" o "cambiar algo".** La herramienta ya ofrece una respuesta libre
  (`Other`), y ahí es donde el usuario dice qué quiere cambiar y cómo — una opción «Ajustar X» solo
  añade un turno para volver a preguntarle lo mismo. Reservar las opciones enumeradas para las
  decisiones que sí son categorías cerradas (confirmar, elegir entre alternativas concretas, cancelar).
  Vale igual para las variantes desglosadas del mismo ajuste («ajustar tipo / alcance / descripción»).
- **Selección múltiple** solo donde el propio paso lo indique explícitamente (p. ej. capas de testing,
  candidatos de ADR, qué correcciones aplicar).
- **No repreguntar** lo que ya esté resuelto en el contexto de la sesión, en `.agents/MEMORY.md`, en los
  documentos o manifiestos del repo, en el artefacto de trabajo o en el work item del tracker externo
  cuando su MCP está disponible.
- **Fallback:** si el cliente no expone la herramienta, formular la pregunta en prosa con las opciones
  **enumeradas** (1, 2, 3…).

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
| `arch-init` | **Una tanda por paso**, no una sola al inicio: el flujo tiene cinco pasos con preguntas en cada uno, y no hay tope fijo de preguntas por bloque. Selección múltiple explícita en capas de testing y en candidatos de ADR. |
| `design-define` | Si el *grilling* inicial detecta más de tres lagunas, **encadenar tandas** hasta agotarlas o hasta que el usuario indique que lo restante quede como Observación. |
| `git-commit` | **No lee `.agents/MEMORY.md`**: sus fuentes de «no repreguntar» son el contexto de la sesión, el diff y la propuesta ya mostrada. Fuera de tanda, una por turno: propuesta de **división** (una sola por invocación, y **solo** cuando el diff se reparte en varios commits — un commit único se ejecuta sin confirmar), commit en rama protegida, archivo sensible detectado. |
| `quality-check` | Si se corrigen los fallos o se entrega solo el informe: se pregunta con el reporte ya presentado. |
| `work-integrate` | La tanda inicial va **antes de cualquier operación git** (trabajo asociado a la rama, carpeta ambigua, rama base). La confirmación del archivado (paso 10) es la excepción: va después de las puertas, porque hasta entonces no se sabe si el trabajo llega a cerrarse ni qué se movería. |
