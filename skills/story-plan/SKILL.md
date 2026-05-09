---
name: story-plan
description: Crea o actualiza tareas técnicas asociadas a una historia de usuario existente. Activar cuando el usuario solicite planificar implementación, descomponer trabajo, definir alcance técnico, estructurar subtareas o documentar especificaciones técnicas sin generar código ni pruebas.
license: MIT
---

# Skill: Planificar tarea de historia de usuario
 
Guía para **crear o actualizar** tareas `TK-XXX` bajo una historia de usuario existente.
 
> **Alcance de un TK:** La tarea es un documento de **especificación técnica**. Describe qué lograr, cómo implementarlo y sus dependencias dentro de la unidad de trabajo. No implementa código, no ejecuta pruebas, no crea ADRs. Lo que no está acordado va en **Observaciones** o se pregunta al usuario — nunca se inventa.
 
La plantilla canónica está en `references/task-template.md` (léela antes de escribir cualquier TK).
 
---
 
## Subagente requerido
 
**Este skill debe ejecutarse obligatoriamente bajo el subagente `docs-specialist`.** No ejecutar directamente sin delegar a ese subagente.
 
---
 
## Ubicación de archivos
 
| Artefacto | Ruta |
|-----------|------|
| Tarea | `docs/product/user-stories/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` |
| Unidades de trabajo | `docs/product/work-units.md` |
| ADR | `docs/adr/` |
| Documentación técnica | `docs/product/technical-docs/` |
| Glosario | `docs/product/glossary.md` |
 
---
 
## Convenciones del nombre de archivo
 
- Formato: `TK-XXX-[nombre-descriptivo].md` con `TK-XXX` en mayúsculas.
- `XXX`: número secuencial **por historia** (no global); tres dígitos con cero a la izquierda.
- Nombre descriptivo: minúsculas, kebab-case, corto y descriptivo.
- Ejemplos: `TK-001-modelo-dominio-receta.md`, `TK-002-endpoint-crear-receta.md`.
---
 
## Información requerida antes de redactar
 
Antes de crear o editar cualquier TK, el agente debe tener clara la siguiente información. **No inventar nada** — si algún dato no es explícito, preguntar al usuario.
 
| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **US padre** | Indicada por el usuario | Sin `README.md` de US existente no se puede crear el TK |
| **Intención** | Del mensaje del usuario | Preguntar: ¿solo anclaje (stub) o TK completa lista para Ready? |
| **Objetivo del TK** | Del mensaje del usuario | Para stub: basta un objetivo breve. Para TK completa: preguntar hasta tener contexto suficiente |
| **Unidad de trabajo** | Inferir del repo o indicada por el usuario | Stub: puede quedar `Por definir`. TK completa: obligatoria; sin ella el estado no puede ser `Ready` |
| **Contexto técnico** (solo TK completa) | ADRs existentes, technical-docs, descripción del usuario | Si falta decisión técnica relevante: sugerir ADR al usuario, no crearlo |
| **Referencia de UI** (solo TK de interfaz) | Figma, wireframe o imagen de alta fidelidad aportados por el usuario | Obligatoria para `Ready`; sin ella el TK de UI no puede salir de `Draft` |
| **Idioma de preferencia** | (1) idioma del turno del usuario; (2) `.agent/MEMORY.md` → `preferred language: <ISO>` | Preguntar y crear/actualizar `.agent/MEMORY.md` con `preferred language: <código>` |
 
> Leer siempre el `README.md` de la US y **todas** las `TK-*.md` existentes en la carpeta antes de crear o editar cualquier tarea. Detectar solapamientos y resolverlos con el usuario antes de continuar.
 
---
 
## Validación antes de crear
 
Antes de crear archivos, verificar las siguientes condiciones. Si alguna falla, **no crear** — informar al usuario y resolver primero.
 
**¿Qué verificar?**
- **US padre existe y está Ready:** la carpeta `US-XXX-[nombre-corto]/` tiene `README.md` con `Estado: Ready`. No se pueden crear TKs sobre una US en Draft.
- **ID disponible:** el número `TK-XXX` propuesto no existe ya en la carpeta.
- **Solapamiento de alcance:** leer todas las `TK-*.md` de la carpeta de la US padre y comparar su objetivo con el de la nueva tarea. Si alguna ya cubre el mismo alcance: informar al usuario indicando cuál es el conflicto y preguntar si prefiere actualizar la existente o ajustar el alcance de la nueva.
- **Unidad definida (solo TK completa):** si la unidad sigue siendo `Por definir` tras preguntar, publicar como stub en Draft, no como TK completa.
**Si hay conflicto:**
```
⚠️ No es posible crear la tarea todavía:
- <razón concreta>
- [TK-XXX: Título](TK-XXX-nombre.md) — <razón del solapamiento, si aplica>
```
 
---
 
## Flujo: Crear stub (anclaje de ID)
 
Un stub reserva el ID y el vínculo a la US. No requiere contexto técnico completo.
 
1. Inferir el siguiente `TK-XXX` libre listando archivos `TK-*.md` en la carpeta de la US.
2. Crear `TK-XXX-[nombre-descriptivo].md` con:
   - `Estado: Draft`
   - `Historia`: enlace a la US `[US-XXX](./README.md)`.
   - `Unidad de trabajo`: la conocida o `Por definir`.
   - `Asignado a`: indicado por el usuario; si no, inferir con `git config user.name`; omitir la línea si no aplica.
   - **Descripción**: objetivo breve acordado — el *qué*, sin el cómo.
   - **Plan de implementación**: vacío o ausente si no hay pasos definidos.
   - **Observaciones**: pendientes reales; no rellenar con texto genérico.
3. Actualizar `work-units.md` **solo si** la unidad del stub no es `Por definir` (ver paso 2 del flujo de TK completa).
4. **Parar aquí.** No continuar con los pasos de TK completa.
---
 
## Flujo: Crear TK completa
 
Una TK completa puede alcanzar `Estado: Ready` si cumple todas las condiciones del checklist.
 
1. **Inferir el siguiente `TK-XXX`** libre en la carpeta de la US.
2. **Gestionar `work-units.md`:**
   - Crear desde `references/work-units-template.md` si el archivo no existe.
   - Si la unidad es nueva: añadir sección `## <nombre-unidad>` con párrafo de alcance. Si el alcance no está claro, preguntar antes de añadirla.
   - No listar TKs, DTOs ni technical-docs dentro de `work-units.md`; solo nombre de unidad y párrafo de alcance.
3. **Redactar el TK** siguiendo `references/task-template.md`:
   - **Metadatos**: `Historia` con enlace `[US-XXX](./README.md)`; `Asignado a` indicado por el usuario, o inferido con `git config user.name`, u omitido si no aplica.
   - **Descripción**: qué lograr — objetivo claro, tono imperativo y verificable; sin «podría», «quizá», «tal vez».
   - **Dependencias**: solo piezas *dentro de la unidad de trabajo* — componentes, servicios, modelos, librerías. No incluir aquí ADRs, technical-docs, contratos ni referencias de diseño; esos van exclusivamente en **Referencias**.
   - **Referencias**: ADRs existentes, technical-docs, diseño. No crear ADRs; si falta una decisión, sugerirlo al usuario en Observaciones.
   - **Plan de implementación**: pasos concretos acordados o derivados de fuentes citadas en Referencias. Si los pasos no se conocen aún, **no inventar** — indicar en Observaciones qué información falta para poder redactarlos.
   - **Observaciones**: solo si hay pendientes reales (prerrequisitos no cumplidos, información pendiente, decisiones por tomar). Si no hay nada pendiente, **omitir la sección**. Si el equipo lo exige, una línea *Sin pendientes documentados*. Con pendientes reales: `Estado: Draft`.
4. **Actualizar** technical-docs y glossary si aplica (entradas breves; glossary no es sustituto de ADR ni technical-doc).
5. **Verificar el checklist** antes de asignar `Estado: Ready`.
---
 
## Flujo: Actualizar una TK existente
 
1. **Identificar el archivo** — por número, nombre o título.
2. **Leer el contenido actual** completo antes de editar.
3. **Leer el `README.md` de la US y las demás TKs** para detectar solapamientos con los cambios propuestos.
4. **Aplicar los cambios** solicitados por el usuario. Reglas invariantes:
   - Si hay conflicto entre el TK y el `README.md` de la US: **la US prevalece**. Corregir el TK, no la historia.
   - Si el usuario cambia el estado a **Ready**: verificar todas las condiciones del checklist antes de guardar.
   - Si se añaden pasos al Plan: mantener tono imperativo y verificable; sin supuestos no acordados.
5. **Confirmar** mostrando las secciones modificadas.
---
 
## Checklist antes de redactar
 
**Información:**
- [ ] `README.md` de la US leído
- [ ] Todas las `TK-*.md` de la carpeta leídas; solapamientos resueltos
- [ ] Intención clara: stub vs TK completa
- [ ] Idioma de preferencia determinado y `.agent/MEMORY.md` actualizado si fue necesario
**Validación:**
- [ ] Carpeta de la US existe con `README.md`
- [ ] ID `TK-XXX` libre en la carpeta
- [ ] Sin solapamiento de alcance con TKs existentes
**Condiciones para `Estado: Ready`:**
- [ ] Unidad de trabajo definida (no `Por definir`) y sección en `work-units.md`
- [ ] **Descripción** con objetivo claro y verificable
- [ ] Si es TK de UI: referencia a Figma, wireframe o imagen de alta fidelidad presente en **Referencias**
- [ ] **Dependencias** listadas dentro del alcance de la unidad
- [ ] **Plan de implementación** con pasos concretos
- [ ] **Observaciones** sin pendientes abiertos — sección omitida o con *Sin pendientes documentados*
- [ ] Referencias a ADRs y technical-docs con rutas relativas válidas
**Formato:**
- [ ] Plantilla `references/task-template.md` leída
- [ ] Nombre de archivo en kebab-case, secuencial por historia
- [ ] Sin código de aplicación en el archivo
- [ ] Sin párrafos instructivos de plantilla en el TK publicado
---
 
## Ejemplos
 
**Ejemplo 1 — Stub**
 
- *Entrada:* «Solo quiero reservar TK-003, sin diseño técnico todavía.»
- *Salida:* `TK-003-[nombre-corto].md` en Draft, unidad `Por definir`, descripción mínima del objetivo, Plan vacío, Observaciones con los pendientes reales. `work-units.md` sin cambios.
**Ejemplo 2 — TK completa**
 
- *Entrada:* «TK para el diálogo de selección de ítem usando Material; la US tiene criterios; el ADR de UI está en `docs/adr/`.»
- *Salida:* TK con unidad concreta, Plan con pasos verificables, referencias al ADR con ruta relativa, `work-units.md` actualizado si la unidad es nueva. `Estado: Ready` si Observaciones está limpia; `Draft` si quedan pendientes.
**Ejemplo 3 — Información incompleta**
 
- *Entrada:* «TK-005 para la API Z.»
- *Comportamiento:* El agente identifica que faltan contratos, endpoints y DTOs para redactar una TK completa. Pregunta al usuario antes de continuar. Si el usuario solo quiere reservar el ID: crea un stub en Draft. No redacta TK completa con supuestos.
**Ejemplo 4 — Crear todas las tareas de una US**
 
- *Entrada:* «Crea las tareas necesarias para implementar US-004.»
- *Salida:* El agente lee el `README.md` de la US, identifica las unidades de trabajo y el alcance, y crea un stub `TK-XXX-[nombre].md` por cada tarea identificada — todas en `Estado: Draft`, con objetivo breve y unidad conocida o `Por definir`. No redacta planes de implementación ni detalle técnico sin contexto explícito del usuario.
---
 
## Anti-patterns
 
- Implementar features, migraciones o tests mientras se redacta el TK.
- Crear ADRs sin pedido explícito del usuario; solo referenciar existentes o sugerir su creación.
- Publicar `Estado: Ready` en un stub sin criterios ni contexto técnico.
- Publicar `Estado: Ready` con pendientes en Observaciones.
- Ignorar las TKs existentes en la carpeta; duplicar o contradecir su alcance.
- Meter listas de TKs, DTOs o technical-docs largos en `work-units.md`.
- Inventar flujos, entidades o integraciones en lugar de preguntar.
- Usar `glossary.md` como especificación técnica o sustituto de ADR.
- Rellenar secciones con supuestos o ejemplos genéricos; dejar pendientes reales sin listar en Observaciones.
- Narrar el trabajo realizado en el mensaje al usuario («leí la US», «creé el TK», «actualicé work-units»); solo reportar resultados y pendientes.
---
 
## Notas
 
### work-units.md
 
Cada sección `## <nombre-unidad>` contiene solo el nombre de la unidad y una descripción **corta** — lo estrictamente necesario para entender su alcance: qué cubre y, si reduce ambigüedad, qué queda fuera. No es un índice de tareas ni un inventario de artefactos técnicos. Cuando la unidad de un stub es `Por definir`, no es obligatorio crear la sección hasta que se concrete.
 
### Mensaje al usuario
 
Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno, cadenas de pensamiento ni narración del trabajo en curso. Si hay pendientes o aclaraciones, listarlos en viñetas agrupadas por TK.