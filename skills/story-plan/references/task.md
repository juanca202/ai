# Plantilla de tarea (TK-XXX)

Referencia para crear `TK-XXX-[nombre-descriptivo].md` dentro de `docs/product/user-stories/US-XXX-[nombre-corto]/`. Sustituir marcadores `TK-XXX`, `US-XXX` y el texto entre corchetes por valores reales; en **Referencias**, ajustar rutas relativas según la profundidad del repo.

**Al publicar el archivo en el repo:** en cada sección incluir **solo** lo **confirmado** por el usuario o **comprobable** en el repo (p. ej. código, docs existentes). **No** supuestos, **no** texto genérico de «lo que debería ir», **no** marcadores tipo `[…]` ni bullets de ejemplo sin sustancia. **No** copiar al TK los párrafos **Qué va aquí** / **Qué no va aquí** de esta referencia: son guía para quien redacta, no parte del documento entregable. Prerrequisitos sin cumplir, datos faltantes, decisiones pendientes o aclaraciones necesarias → **Observaciones** (lista explícita). Si una sección no tiene contenido real aún, **dejarla vacía** u **omitir** subapartados en lugar de rellenar; lo que falte, constar en **Observaciones**.

**Estado en cabecera:** **Ready** solo cuando **Observaciones** no documente aclaraciones ni pendientes sin resolver (o la sección se omita / quede explícitamente sin ítems abiertos). Mientras exista cualquier pendiente en **Observaciones**, el **Estado** debe ser **Draft**.

---

# TK-XXX: Título corto de la tarea

- **ID:** [TK-XXX]
- **Estado:** [Draft / Ready / In Progress / Done]
- **Historia:** [Obligatorio: referencia a la historia de usuario a la que pertenece la tarea]
- **Unidad de trabajo:** [Obligatorio: paquete/módulo/servicio/etc.; inferido del proyecto o indicado por el usuario]
- **Asignado a:** [Opcional: priorizar lo indicado por el usuario; si no, inferir con `git config user.name`; omitir línea si no aplica]

## Descripción

[**Qué va aquí:** el **objetivo** de la tarea — **qué** debe quedar hecho o disponible para cumplir la historia (resultado observable o entregable), en pocas frases. **Qué no va aquí:** cómo se implementa (tecnologías, pasos, clases, endpoints, capas); eso corresponde a **Plan de implementación** y a **Referencias**.]

[Texto **corto y concreto**: basta para que cualquier implementador entienda *qué* hay que lograr, sin confundir objetivo con diseño técnico]

## Dependencias

[**Qué va aquí:** inventario de lo que la tarea **usa o necesita** dentro de la **unidad de trabajo** donde se ejecuta — piezas que **ya existen** en ese paquete/módulo/servicio o que la tarea **debe tener disponibles** para poder implementarse (p. ej. **componentes** de UI, **servicios** o APIs internas, **modelos** / entidades / DTOs del código, **librerías de terceros**). Cada ítem puede llevar **una línea de contexto** (para qué se usa o qué rol cumple).]

[**Qué no va aquí:** documentación técnica extensa, contratos en `technical-docs/`, decisiones de **arquitectura** (ADRs), enlaces a diseño u otros tipos de referencia externa — eso va solo en **Referencias**. Tampoco sustituye al **Plan de implementación** (el orden y los pasos para completar la tarea).]

- [**Nombre o identificador del componente, servicio, modelo, librería, …]** — [opcional: descripción breve del uso en esta tarea]
- **…**

## Referencias

- **Arquitectura:** enlaces a `docs/adr/...` (proyecto base / transversales) o `docs/product/adr/...` (específicos del producto bajo `docs/product/`, no del proyecto base) cuando la tarea dependa de decisiones ya registradas; no inventar ADRs nuevos
- **Documentación técnica:** [título](../../technical-docs/archivo.md) — DTOs, ER, flujos, endpoints en `docs/product/technical-docs/` si aplica
- **Diseño:** [Figma - ...](URL)

## Plan de implementación

[Solo pasos **concretos** acordados o derivados de fuentes citadas en **Referencias**; si aún no se conocen, **no** inventar una lista genérica — indicar en **Observaciones** qué falta para poder redactarlos.]

## Observaciones

[Usar **solo** si hay ítems reales: prerrequisitos **no cumplidos**, información **pendiente**, bloqueos, decisiones por tomar o aclaraciones necesarias antes de **Ready** o de implementar. Lista clara; **no** repetir lo ya cubierto en otras secciones. Si no hay pendientes, **omitir** esta sección (o una sola línea *Sin pendientes documentados* si el equipo lo exige).]

- [pendiente o prerrequisito concreto]

