---
name: story-define
description: Crear o actualizar una Historia de Usuario. Usar cuando se necesite crear, documentar, actualizar o estandarizar historias de usuario. Activar cuando el usuario solicite una nueva historia de usuario, describa una necesidad funcional, pida refinar requisitos, estructurar funcionalidades o alinear historias existentes a las convenciones del proyecto.
license: MIT
---

# Skill: Historia de usuario

Guía para **crear o actualizar** historias de usuario en el repo del producto.

> **Alcance de una US:** El `README.md` es un documento **funcional**. Registra el valor para el usuario, las reglas de negocio, los criterios de aceptación y el estado de avance. El detalle de implementación (DTOs, endpoints, esquemas) va en `docs/specs/technical-docs/` o en tareas `TK-XXX`, nunca en la narrativa de la historia. Los documentos técnicos **no son parte de la descripción funcional**; pueden referenciarse únicamente para justificar criterios de INVEST o condiciones del DoR.

La plantilla canónica está en `references/user-story-template.md` (léela antes de escribir cualquier US).

## Subagente requerido

**Este skill debe ejecutarse obligatoriamente bajo el subagente `docs-specialist`.** No ejecutar directamente sin delegar a ese subagente.

---

## Ubicación de archivos


| Artefacto             | Ruta                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Historia de usuario   | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md`                                                            |
| Archivos de apoyo     | `docs/specs/user-stories/US-XXX-[nombre-corto]/assets/`                                                              |
| Documentación técnica | `docs/specs/technical-docs/` (no parte de la descripción funcional; referenciable solo para justificar INVEST o DoR) |
| Glosario              | `docs/specs/glossary.md` (opcional)                                                                                  |


---

## Convenciones del nombre de carpeta

- Formato: `US-XXX-[nombre-corto]` con `US-XXX` en mayúsculas y número de 3 dígitos.
- Nombre corto: minúsculas, kebab-case, sin artículos ni palabras vacías.
- Ejemplos: `US-001-seleccion-item-sdp-desde-receta`, `US-004-resumen-costos-receta`.
- Archivos de apoyo en `assets/`; enlazarlos desde Referencias con rutas relativas, p. ej. `![Descripción](assets/nombre.png)`.

---

## Información requerida antes de redactar

Antes de crear o editar cualquier US, el agente debe tener clara la siguiente información. **No inventar nada** — si algún dato no es explícito, preguntar al usuario.


| Dato                                            | Cómo obtenerlo                                                                           | Si no está disponible                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Actor y valor de negocio**                    | Del contexto o descripción del usuario                                                   | Preguntar al usuario                                                                  |
| **Reglas de negocio y criterios de aceptación** | Del contexto o descripción del usuario                                                   | Preguntar; sin ellos INVEST no es valorable y la historia solo puede crearse en Draft |
| **Idioma de preferencia**                       | (1) `.agent/MEMORY.md` → `preferred language: <ISO>`; (2) idioma del mensaje del usuario | Preguntar y crear `.agent/MEMORY.md` con `preferred language: <código>`               |
| **Referencias de diseño** (solo US de UI)       | Figma, prototipos u otros enlaces aportados por el usuario                               | Sin ellas la historia no puede declararse Ready                                       |
| **Dependencias con otras US o sistemas**        | Indicadas por el usuario o inferibles del contexto                                       | Preguntar; afectan las dimensiones I y E de INVEST                                    |
| **ID de la US**                                 | Proporcionado por el usuario                                                             | Inferir el siguiente libre revisando carpetas `US-`* en `docs/specs/user-stories/`  |
| **Unidades de trabajo**                         | Proporcionadas por el usuario o inferibles del repo                                      | Sin ellas la historia no puede declararse Ready                                       |


> El único dato estrictamente obligatorio para crear la historia es tener identificado el actor y el valor de negocio. Si INVEST no es completamente valorable con la información disponible, la historia se crea con `Estado: Draft` y las lagunas documentadas en Observaciones. El estado **Ready** requiere todos los datos sin excepción.

---

## Validación antes de crear

Antes de crear archivos, verificar las siguientes condiciones. Si alguna falla, **no crear** — informar al usuario y resolver primero.

**¿Qué verificar?**

- **Duplicado de ID:** si el usuario proporciona `US-XXX`, confirmar que esa carpeta no existe en `docs/specs/user-stories/`.
- **Solapamiento de alcance:** revisar los títulos y descripciones de otras US para detectar si el actor + valor + alcance ya está cubierto por una historia existente.
- **INVEST parcialmente valorable:** si la información recibida no permite valorar todas las dimensiones, la historia **sí puede crearse** pero con `Estado: Draft` y las lagunas documentadas en Observaciones. Solo es un bloqueante si el actor o el valor de negocio son completamente desconocidos.
**Si hay conflicto de ID o solapamiento de alcance:**

```
⚠️ No es posible crear la historia todavía:
- <razón concreta>
- [US-XXX: Título](docs/specs/user-stories/US-XXX-nombre/README.md) — <razón del solapamiento, si aplica>
```

Sugerir al usuario: (a) ajustar el alcance, (b) actualizar la US existente, o (c) proporcionar la información faltante.

---

## Flujo: Crear una historia nueva

1. **Fijar el ID y nombre de carpeta**
  - Usar el `US-XXX` indicado por el usuario o inferir el siguiente libre listando carpetas `US-*` en `docs/specs/user-stories/`.
  - Proponer el `nombre-corto` en kebab-case; validar con el usuario si hay ambigüedad.
  - Crear la carpeta `US-XXX-[nombre-corto]/` y `assets/` si habrá archivos vinculados.
2. **Escribir el `README.md`** usando `references/user-story-template.md` como molde:
  - **Descripción:** Como/Quiero/Para con modalidad normativa RFC 2119 (ver [Notas — RFC 2119](#rfc-2119)) en el idioma de preferencia.
  - **Reglas de negocio:** cada regla con id secuencial **RN-01**, **RN-02**, … y palabra clave normativa en MAYÚSCULAS (**DEBE**, **NO DEBE**, **DEBERÍA**, etc.). Los ids son únicos en el ámbito de la US; renumerar si se reordenan o eliminan reglas.
  - **Referencias:** enlaces de diseño y archivos en `assets/`; los archivos aportados no deben quedar solo en el chat.
  - **Criterios de aceptación:** redactar todos los criterios en formato Gherkin utilizando la palabra clave de cada paso en **TODO MAYÚSCULAS** en el idioma de preferencia (**DADO / CUANDO / ENTONCES / Y / PERO** en español; **GIVEN / WHEN / THEN / AND / BUT** en inglés). Los criterios no deben contradecir ninguna obligación (**DEBE**) ni prohibición (**NO DEBE**) de las reglas de negocio.
  - **Unidades de trabajo:** al nivel de granularidad del repo (p. ej. `frontend`, `backend`, o `micro-autenticacion`, `micro-catalogo`).
  - **Complejidad sugerida:** story points solo en valores Fibonacci 1, 2, 3, 5, 8, 13 con justificación breve de alcance, riesgo e incertidumbre.
  - **Validación — INVEST:** tabla con las seis dimensiones (I, N, V, E, S, T); valor de cada una: `Cumple` / `No cumple` / `Parcial` con nota. Si alguna dimensión falla, documentarlo sin disimular.
  - **Validación — Definition of Ready (DoR):** tabla con los seis criterios de la plantilla. Para cada uno: `Cumple` / `No cumple` / `Parcial` (el criterio **Referencias de UI** admite además `No aplica`). Ver criterios exactos en el checklist de Ready.
  - **Observaciones:** (1) prerrequisitos o dependencias aún no listas; (2) datos o aclaraciones pendientes del usuario o producto; (3) decisiones pendientes; (4) otras notas. Si no hay nada que reportar en algún ítem, dejarlo vacío.
3. **Documentación técnica** (solo si el usuario la pide explícitamente)
  - Crear o actualizar documentos en `docs/specs/technical-docs/`.
  - **No integrarla en la descripción funcional** de la US. Solo puede referenciarse desde las secciones INVEST u Observaciones del DoR para justificar complejidad, dependencias o restricciones técnicas que condicionan algún criterio (p. ej. *«Ver `technical-docs/contrato-api.md` — justifica la estimación de la dimensión E»*).
4. **Glosario** (si aplica)
  - Si aparecen términos de dominio nuevos, crear o reutilizar entrada en `docs/specs/glossary.md` con definición breve en contexto producto/dominio.
5. **Cierre**
  - Si la US queda en **Ready**, sugerir explícitamente al usuario que ejecute `/story-plan` para crear las tareas `TK-XXX`.
  - Si el usuario pide crearlas en continuidad o en el mismo turno: **invocar `/story-plan` obligatoriamente**; no crear tareas directamente desde este skill. El conocimiento y las reglas de formato de los `TK-XXX` residen en ese skill.

---

## Flujo: Actualizar una historia existente

1. **Identificar el archivo** — por ID, nombre-corto o título.
2. **Leer el `README.md` actual** completo antes de editar.
3. **Aplicar los cambios** solicitados por el usuario. Reglas invariantes:
  - Si el cambio afecta reglas de negocio: mantener los ids RN-XX existentes; renumerar solo si se reordenan o eliminan reglas.
  - Si hay conflicto entre el texto de un `TK-XXX` y el `README.md` de la US: **la US prevalece**. Corregir las tareas, no la historia.
  - Si el usuario cambia el estado a **Ready**: verificar todas las condiciones del checklist de Ready antes de guardar.
4. **Criterios de aceptación:** si se añaden o modifican, aplicar las mismas reglas de formato del flujo de creación (paso 2).
5. **Confirmar** mostrando las secciones modificadas.

---

## Checklist antes de redactar

**Información:**

- Actor y valor de negocio claros
- Reglas de negocio con suficiente detalle para valorar INVEST
- Idioma de preferencia determinado y `.agent/MEMORY.md` actualizado si fue necesario
- Si es US de UI: referencias de diseño presentes o acordadas
- Dependencias con otras US o sistemas identificadas
**Validación:**
- ID `US-XXX` sin carpeta existente (creación) o carpeta identificada (actualización)
- Sin solapamiento de alcance con US existentes
- Actor y valor de negocio identificados (mínimo para crear); si INVEST no es completamente valorable → `Estado: Draft` con lagunas en Observaciones
**Condiciones para `Estado: Ready`:**
- Bloque de criterios de aceptación completo en formato Gherkin, utilizando las palabras clave en MAYÚSCULAS y en el idioma de preferencia del documento
- DoR completado según la plantilla
- Unidades de trabajo identificadas
- Observaciones sin aclaraciones ni pendientes abiertos
**Formato:**
- Plantilla `references/user-story-template.md` leída
- Reglas de negocio con identificadores RN-01, RN-02, … sin saltos
- Palabras clave normativas en MAYÚSCULAS en el idioma de preferencia (DEBE, NO DEBE, DEBERÍA…)
- Archivos del usuario guardados en `assets/` y enlazados con ruta relativa
- Detalle técnico en `technical-docs/` o `TK-XXX`, no en el `README.md`

---

## Ejemplos

**Ejemplo 1 — Entrada mínima viable**

- *Entrada:* «US nueva: como farmacéutico quiero ver alertas de interacción al añadir un medicamento a la receta, para evitar recetas inseguras. Reglas: mostrar alerta antes de guardar; permitir continuar con justificación.»
- *Salida:* Carpeta `US-0XX-alertas-interaccion-receta/` con `README.md` completo (Como/Quiero/Para, RN-01 y RN-02 con modalidad RFC 2119, Gherkin con caso feliz y excepción, INVEST y DoR completados, story points con justificación).
**Ejemplo 2 — Falta información**
- *Entrada:* «Historia de exportar informes.»
- *Comportamiento:* El agente no crea carpetas; responde con preguntas concretas (quién exporta, formatos, permisos, qué es "informe", criterios verificables) hasta poder completar INVEST y Gherkin.
**Ejemplo 3 — Historia con UI**
- *Entrada:* Historia con enlace a Figma y capturas en `assets/`.
- *Salida:* `README.md` con sección Referencias completa; fila Referencias de UI en DoR en `Cumple` o `Parcial` con notas; `Estado: Ready` solo si Gherkin y DoR lo permiten.
**Ejemplo 4 — Ready y tareas**
- *Entrada:* Historia cerrada en Ready; el usuario dice: «crea las tareas para implementarla».
- *Salida:* El agente no crea tareas directamente; invoca `/story-plan` pasando el contexto de la US. Toda la lógica de creación de `TK-XXX` (stubs, plantilla, work-units) es responsabilidad de ese skill.

---

## Anti-patterns

- Inventar reglas de negocio o exclusiones que el usuario no dio.
- Poner detalle técnico (clases, endpoints, esquemas) en el `README.md` en lugar de remitirlo a `technical-docs/` o `TK-XXX`.
- Declarar `Estado: Ready` sin Criterios de aceptación completo o sin referencias de diseño cuando la historia involucra UI.
- Declarar `Estado: Ready` con Observaciones que aún listen aclaraciones o pendientes sin resolver.
- Resolver un conflicto entre `TK-XXX` y el `README.md` de la US degradando la US; la US prevalece.
- Crear tareas `TK-XXX` directamente desde este skill sin invocar `/story-plan`; la creación de tareas siempre se delega a ese skill.
- Copiar `references/user-story-template.md` al repo del producto como artefacto en lugar de usarlo como molde.

---

## Notas

### RFC 2119

Tabla de equivalencias para palabras clave normativas (en MAYÚSCULAS en el idioma de preferencia):


| Nivel (semántica RFC 2119) | Inglés (`en`)                | Español (`es`)                          |
| -------------------------- | ---------------------------- | --------------------------------------- |
| Obligación absoluta        | **MUST** / **REQUIRED**      | **DEBE** / **ES OBLIGATORIO**           |
| Prohibición absoluta       | **MUST NOT** / **SHALL NOT** | **NO DEBE** / **ESTÁ PROHIBIDO**        |
| Recomendación fuerte       | **SHOULD** / **RECOMMENDED** | **DEBERÍA** / **ES RECOMENDABLE**       |
| Desaconsejado salvo causa  | **SHOULD NOT**               | **NO DEBERÍA** / **NO ES RECOMENDABLE** |
| Permiso u opcionalidad     | **MAY** / **OPTIONAL**       | **PUEDE** / **OPCIONAL**                |


Elegir una forma por nivel y mantenerla consistente en toda la US. Si el usuario pide no usar RFC 2119, documentarlo en Observaciones; el formato Gherkin en MAYÚSCULAS se mantiene salvo petición explícita en contra.