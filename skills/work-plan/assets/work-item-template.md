# WI-XXX: <título corto del work item>

- Estado: Draft | Ready
- Tipo: bug | refactor | deuda-técnica | dependencias | operativa
- Unidad de trabajo: <obligatorio para Ready: paquete / módulo / servicio / etc.; inferido del proyecto o indicado por el usuario>
- Asignado a: <opcional: priorizar lo indicado por el usuario; si no, inferir con `git config user.name`; omitir línea si no aplica>
- ADO Work Item: <[#<ado_id>](<url>) solo si se creó en ADO; omitir línea si no aplica>

## Requerimiento

<qué motiva el work item: el problema, la necesidad o el comportamiento esperado — el *qué*, no el cómo. Para un bug: qué falla y cómo se reproduce. Para un refactor / deuda técnica: qué situación se quiere mejorar y por qué. Sin diseño técnico aquí>

## Criterios de aceptación

<cómo se verifica que el work item quedó resuelto; lista clara y verificable. Más ligero que los BR/SC de una historia, pero suficiente para saber cuándo está «hecho». Ejemplos: «el error ya no se reproduce con los pasos descritos», «sin regresión en <flujo>», «dependencia actualizada a vX con la suite verde»>

- <criterio verificable>

## Dependencias

<inventario de lo que el work item usa o necesita dentro de la unidad de trabajo: componentes de UI, servicios o APIs internas, modelos / entidades / DTOs, librerías de terceros. No incluir aquí ADRs, technical-docs ni referencias de diseño — eso va en Referencias>

- <nombre o identificador del componente, servicio, modelo, librería> — <opcional: descripción breve del uso>

## Referencias

- **Arquitectura:** <enlace a ADR en `docs/adr/` si el work item depende de decisiones ya registradas; no inventar ADRs nuevos>
- **Documentación técnica:** <enlace a `docs/specs/technical-docs/` si aplica>
- **Diseño:** <enlace a Figma, wireframe o imagen de alta fidelidad; obligatorio si el work item toca UI>

## Plan de implementación

<pasos concretos acordados o derivados de fuentes citadas en Referencias. Si no se conocen aún, omitir esta sección e indicar en Observaciones qué falta para poder redactarlos>

## Observaciones

<usar solo si hay ítems reales: prerrequisitos no cumplidos, información pendiente, bloqueos, decisiones por tomar. Si no hay pendientes, omitir esta sección o dejar una línea: Sin pendientes documentados>

- <pendiente o prerrequisito concreto>
