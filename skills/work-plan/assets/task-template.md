# TK-XXX: <título corto de la tarea>

- Estado: Draft | Ready
- Historia: <enlace obligatorio a la historia de usuario; p. ej. [US-XXX: Título](./README.md)>
- Unidad de trabajo: <obligatorio: paquete / módulo / servicio / etc.; inferido del proyecto o indicado por el usuario>
- Asignado a: <opcional: priorizar lo indicado por el usuario; si no, inferir con `git config user.name`; omitir línea si no aplica>

## Descripción

<objetivo de la tarea — qué debe quedar hecho o disponible para cumplir la historia; resultado observable o entregable en pocas frases; sin confundir objetivo con diseño técnico>

## Dependencias

<inventario de lo que la tarea usa o necesita dentro de la unidad de trabajo: componentes de UI, servicios o APIs internas, modelos / entidades / DTOs, librerías de terceros. No incluir aquí ADRs, technical-docs, contratos ni referencias de diseño — eso va en Referencias>

- <nombre o identificador del componente, servicio, modelo, librería> — <opcional: descripción breve del uso en esta tarea>

## Referencias

- **Arquitectura:** <enlace a ADR en `docs/adr/` cuando la tarea dependa de decisiones ya registradas; no inventar ADRs nuevos>
- **Documentación técnica:** <enlace a `docs/specs/technical-docs/` si aplica — DTOs, ER, flujos, endpoints>
- **Diseño:** <enlace a Figma, wireframe o imagen de alta fidelidad; obligatorio si la tarea es de UI>

## Plan de implementación

<pasos concretos acordados o derivados de fuentes citadas en Referencias. Si los pasos no se conocen aún, omitir esta sección e indicar en Observaciones qué falta para poder redactarlos>

## Observaciones

<usar solo si hay ítems reales: prerrequisitos no cumplidos, información pendiente, bloqueos, decisiones por tomar. Lista clara; no repetir lo ya cubierto en otras secciones. Si no hay pendientes, omitir esta sección o dejar una línea: Sin pendientes documentados>

- <pendiente o prerrequisito concreto>