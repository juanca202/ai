# Tipo de plan: Tarea de mantenimiento

Definición del tipo de plan **tarea de mantenimiento (`WI-XXX`)**: trabajo **sin historia de usuario asociada** — corrección de bugs, refactor, deuda técnica, actualización de dependencias, tareas operativas o de infraestructura. Esta referencia se carga desde `SKILL.md` cuando la selección de tipo de plan resuelve a este caso. Asume ya resueltos el subagente, el mecanismo de preguntas y el idioma (ver `SKILL.md`).

> **Alcance de un WI:** documento **único y combinado** de especificación. A diferencia de una historia de usuario —donde el requerimiento (`README.md`) y la especificación técnica (`TK-XXX`) viven en archivos separados porque la historia es un artefacto con dueño y fase propios—, un work item de mantenimiento no tiene fase funcional separada ni se descompone en sub-tareas: el requerimiento, los criterios de aceptación y la especificación técnica conviven en **un solo `WI-XXX.md`**, que mapea 1:1 con un único work item de ADO (`Bug`/`Task`). No implementa código, no ejecuta pruebas, no crea ADRs. Lo no acordado va en **Observaciones** o se pregunta — nunca se inventa.

La plantilla canónica está en `assets/work-item-template.md` (léela antes de escribir cualquier WI).

## Contenido

- [Modos de invocación](#modos-de-invocación)
- [Ubicación de archivos](#ubicación-de-archivos)
- [Convenciones del nombre de archivo](#convenciones-del-nombre-de-archivo)
- [Información requerida antes de redactar](#información-requerida-antes-de-redactar)
- [Validación antes de crear](#validación-antes-de-crear)
- [Flujo: Crear stub](#flujo-crear-stub-anclaje-de-id)
- [Flujo: Crear WI completo](#flujo-crear-wi-completo)
- [Flujo: Actualizar un WI existente](#flujo-actualizar-un-wi-existente)
- [Flujo: Proponer varios WI desde un esfuerzo grande](#flujo-proponer-varios-wi-desde-un-esfuerzo-grande)
- [Checklist antes de redactar](#checklist-antes-de-redactar)
- [Ejemplos](#ejemplos)
- [Anti-patrones](#anti-patrones)
- [Notas](#notas)

---

## Modos de invocación

| Modo | Disparador | Flujo a aplicar |
|------|------------|-----------------|
| **A. Work item específico** | El usuario describe un trabajo de mantenimiento concreto (problema, alcance) o pide editar un `WI-XXX` existente. | *Flujo: Crear stub*, *Flujo: Crear WI completo* o *Flujo: Actualizar un WI existente* según la intención. |
| **B. Descomposición de un esfuerzo grande** | El usuario describe un esfuerzo de mantenimiento amplio que no cabe en un único WI autocontenido (varias unidades técnicas independientes). | *Flujo: Proponer varios WI desde un esfuerzo grande* — proponer un conjunto de `WI-` autocontenidos, uno por unidad/alcance independiente. |

No existe aquí el modo «stubs desde una historia»: no hay US que descomponer. Mantener el modelo **plano** — un esfuerzo grande se parte en varios `WI-` hermanos, nunca en un `WI` con sub-tareas. En caso de duda entre A y B: preguntar al usuario antes de continuar.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Work item | `docs/specs/work-items/WI-XXX-[kebab-case].md` |
| Unidades de trabajo | `docs/specs/work-units.md` (compartido con el resto del repo) |
| ADR | `docs/adr/` |
| Documentación técnica | `docs/specs/technical-docs/` |
| Glosario | `docs/specs/glossary.md` |

---

## Convenciones del nombre de archivo

- Formato: `WI-<número>-[nombre-descriptivo].md` con `WI-<número>` en mayúsculas.
- **Sin ADO**: `<número>` es un secuencial **global dentro de `docs/specs/work-items/`** (no hay historia padre que reinicie la cuenta); tres dígitos con cero a la izquierda → `WI-001`, `WI-002`, …
- **Con ADO (MCP disponible)**: `<número>` es el **ID numérico del work item** creado en Azure DevOps → `WI-1847`, `WI-2031`, … Sin padding de ceros. Ver `references/azure-devops.md`.
- Nombre descriptivo: minúsculas, kebab-case, corto y descriptivo.
- Ejemplos sin ADO: `WI-001-fix-timeout-login.md`, `WI-002-upgrade-spring-boot.md`.

---

## Información requerida antes de redactar

Antes de crear o editar cualquier WI, tener clara esta información. **No inventar nada** — si un dato no es explícito, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Modo de invocación** | Inferir del mensaje: ¿work item concreto (A) o esfuerzo grande a descomponer (B)? | Si es ambiguo, preguntar al usuario |
| **Intención** (modo A) | Del mensaje del usuario | Preguntar: ¿solo anclaje (stub) o WI completo listo para Ready? |
| **Requerimiento** | Del mensaje del usuario: qué problema/necesidad motiva el trabajo | Para stub: basta un objetivo breve. Para WI completo: preguntar hasta entender el problema |
| **Criterios de aceptación** (WI completo) | Del usuario o derivados del requerimiento: cómo se verifica que quedó hecho | Si no se pueden formular criterios verificables: publicar como stub en Draft y pedirlos |
| **Unidad de trabajo** | Inferir del repo o indicada por el usuario | Stub: puede quedar `Por definir`. WI completo: obligatoria; sin ella el estado no puede ser `Ready` |
| **Contexto técnico** (WI completo) | ADRs existentes, technical-docs, descripción del usuario | Si falta decisión técnica relevante: sugerir ADR al usuario, no crearlo |
| **Referencia de UI** (solo si toca UI) | Figma, wireframe o imagen de alta fidelidad aportados por el usuario | Obligatoria para `Ready`; sin ella el WI de UI no puede salir de `Draft` |
| **Tipo** | Del usuario o inferido del requerimiento (bug / refactor / deuda-técnica / dependencias / operativa) | Si es ambiguo, preguntar; condiciona el tipo de work item en ADO |
| **Vinculación ADO** | Ver sección «Integración con Azure DevOps» de `SKILL.md` | Si se detecta vinculación, seguir `references/azure-devops.md` antes de crear archivos |

> Leer siempre **todos** los `WI-*.md` existentes en `docs/specs/work-items/` antes de crear o editar. Detectar solapamientos y resolverlos con el usuario antes de continuar.

---

## Validación antes de crear

Antes de crear archivos, verificar estas condiciones. Si alguna falla, **no crear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **ID disponible:** el número `WI-XXX` propuesto no existe ya en `docs/specs/work-items/`. (Aplica también con IDs de ADO: verificar que no exista `WI-<ado_id>-*.md`.)
- **Solapamiento de alcance:** leer los `WI-*.md` existentes y comparar su requerimiento con el del nuevo. Si alguno ya cubre el mismo alcance: informar el conflicto y preguntar si prefiere actualizar el existente o ajustar el alcance del nuevo.
- **Unidad definida (solo WI completo):** si la unidad sigue siendo `Por definir` tras preguntar, publicar como stub en Draft, no como WI completo.

**Si hay conflicto:**
```
⚠️ No es posible crear el work item todavía:
- <razón concreta>
- [WI-XXX: Título](WI-XXX-nombre.md) — <razón del solapamiento, si aplica>
```

---

## Flujo: Crear stub (anclaje de ID)

Un stub reserva el ID. No requiere requerimiento detallado ni contexto técnico completo.

1. **Resolver el ID:** si el repo usa ADO con MCP disponible, seguir `references/azure-devops.md` (crear el work item primero y usar su `id`). En cualquier otro caso, inferir el siguiente secuencial libre listando archivos `WI-*.md` en `docs/specs/work-items/`.
2. Crear `WI-<número>-[nombre-descriptivo].md` con:
   - `Estado: Draft`
   - `Tipo`: el conocido o el más probable (confirmar si hay duda).
   - `Unidad de trabajo`: la conocida o `Por definir`.
   - `Asignado a`: indicado por el usuario; si no, inferir con `git config user.name`; omitir si no aplica.
   - `ADO Work Item`: `[#<ado_id>](<url>)` — solo si se creó en ADO; omitir si no aplica.
   - **Requerimiento**: objetivo breve acordado — el *qué*, sin el cómo.
   - **Criterios de aceptación / Plan de implementación**: vacíos o ausentes si aún no están definidos.
   - **Observaciones**: pendientes reales; no rellenar con texto genérico.
3. Actualizar `work-units.md` **solo si** la unidad del stub no es `Por definir`.
4. **Parar aquí.** No continuar con los pasos de WI completo.
5. **Handoff:** stub en `Draft` — completar a `Ready` con *Flujo: Crear WI completo* (modo A) antes de **`work-implement`**.

---

## Flujo: Crear WI completo

Un WI completo puede alcanzar `Estado: Ready` si cumple todas las condiciones del checklist.

1. **Resolver el ID:** si el repo usa ADO con MCP disponible, seguir `references/azure-devops.md`. En cualquier otro caso, inferir el siguiente secuencial libre en `docs/specs/work-items/`.
2. **Gestionar `work-units.md`:**
   - Crear desde `assets/work-units-template.md` si el archivo no existe.
   - Si la unidad es nueva: añadir sección `## <nombre-unidad>` con párrafo de alcance. Si el alcance no está claro, preguntar antes de añadirla.
   - No listar work items ni technical-docs dentro de `work-units.md`; solo nombre de unidad y párrafo de alcance.
3. **Redactar el WI** siguiendo `assets/work-item-template.md`:
   - **Metadatos**: `Tipo`; `Unidad de trabajo`; `Asignado a` indicado por el usuario, inferido con `git config user.name`, u omitido; `ADO Work Item: [#<ado_id>](<url>)` solo si se creó en ADO.
   - **Requerimiento**: qué problema/necesidad motiva el trabajo — claro y concreto; sin diseño técnico.
   - **Criterios de aceptación**: cómo se verifica que quedó hecho; lista verificable. Tono imperativo; sin «podría», «quizá».
   - **Dependencias**: solo piezas *dentro de la unidad de trabajo*. ADRs, technical-docs y referencias de diseño van en **Referencias**.
   - **Referencias**: ADRs existentes, technical-docs, diseño. No crear ADRs; si falta una decisión, sugerirlo en Observaciones.
   - **Plan de implementación**: pasos concretos acordados o derivados de fuentes citadas en Referencias. Si no se conocen aún, **no inventar** — indicar en Observaciones qué falta.
   - **Observaciones**: solo si hay pendientes reales. Si no hay nada, **omitir la sección**. Con pendientes reales: `Estado: Draft`.
4. **Actualizar** technical-docs y glossary si aplica (entradas breves; glossary no sustituye ADR ni technical-doc).
5. **Verificar el checklist** antes de asignar `Estado: Ready`.
6. **Handoff:** si el WI está `Ready`, sugerir **`work-implement`**. Si quedó en `Draft`, listar qué falta para completarlo.

---

## Flujo: Actualizar un WI existente

1. **Identificar el archivo** — por número, nombre o título.
2. **Leer el contenido actual** completo antes de editar.
3. **Leer los demás `WI-*.md`** para detectar solapamientos con los cambios propuestos.
4. **Aplicar los cambios** solicitados. Reglas invariantes:
   - Si el usuario cambia el estado a **Ready**: verificar todas las condiciones del checklist antes de guardar.
   - Si se añaden pasos al Plan: mantener tono imperativo y verificable; sin supuestos no acordados.
5. **Confirmar** mostrando las secciones modificadas.

---

## Flujo: Proponer varios WI desde un esfuerzo grande

Aplica cuando el trabajo no cabe en un único WI autocontenido (modo B). El propósito es partirlo en `WI-` hermanos, uno por unidad/alcance técnico independiente — manteniendo el modelo plano.

**Pasos:**

1. **Leer** todos los `WI-*.md` existentes en `docs/specs/work-items/`.
2. **Identificar unidades / alcances independientes** a partir de la descripción del esfuerzo. **No inventar** alcances no soportados por el pedido; lo no claro queda `Por definir` o se pregunta.
3. **Presentar la propuesta** al usuario, un ítem por `WI-` tentativo: `WI-XXX` (siguiente libre), nombre de archivo, tipo, unidad de trabajo (o `Por definir`) y objetivo breve. **No crear archivos en este turno** — dejarlo explícito al final del mensaje.
4. **Confirmar con el usuario** mediante la herramienta de preguntas estructuradas: `Confirmar` / `Ajustar alcance` / `Cancelar`. Si elige ajustar, revisar y repetir pasos 3–4. **No continuar sin confirmación explícita.**
5. **Crear cada WI** confirmado siguiendo el *Flujo: Crear stub* (o *WI completo* si el alcance ya está claro para alguno).
6. **Reportar al usuario** la lista de WI creados con su objetivo breve.
7. **Handoff:** los WI en `Draft` deben completarse a `Ready` (modo A) antes de **`work-implement`**.

**Reglas invariantes:**
- Un esfuerzo grande se parte en varios `WI-` hermanos, **nunca** en un `WI` con sub-tareas.
- No crear archivos antes de la confirmación del paso 4.
- Si el esfuerzo es ambiguo respecto a unidades: preguntar antes de crear; no inferir por cuenta propia.

---

## Checklist antes de redactar

**Información:**
- [ ] Todos los `WI-*.md` de `docs/specs/work-items/` leídos; solapamientos resueltos
- [ ] Modo de invocación identificado (A o B)
- [ ] Modo A: intención clara: stub vs WI completo
- [ ] Modo B: propuesta presentada al usuario sin archivos creados; confirmación recibida antes del primer `WI-*.md`
- [ ] Idioma de preferencia determinado y `.agents/MEMORY.md` actualizado si fue necesario
- [ ] **ADO**: vinculación verificada (ver `SKILL.md`); si está vinculado, seguido `references/azure-devops.md` y `ado_id` extraído antes de crear el archivo local

**Validación:**
- [ ] ID `WI-XXX` libre en `docs/specs/work-items/`
- [ ] Sin solapamiento de alcance con WI existentes

**Condiciones para `Estado: Ready`:**
- [ ] **Requerimiento** con problema/necesidad claros
- [ ] **Criterios de aceptación** verificables
- [ ] Unidad de trabajo definida (no `Por definir`) y sección en `work-units.md`
- [ ] Si toca UI: referencia a Figma, wireframe o imagen de alta fidelidad en **Referencias**
- [ ] **Dependencias** listadas dentro del alcance de la unidad
- [ ] **Plan de implementación** con pasos concretos
- [ ] **Observaciones** sin pendientes abiertos — sección omitida o con *Sin pendientes documentados*
- [ ] Referencias a ADRs y technical-docs con rutas relativas válidas

**Formato:**
- [ ] Plantilla `assets/work-item-template.md` leída
- [ ] Nombre de archivo en kebab-case, secuencial global en `work-items/`
- [ ] Sin código de aplicación en el archivo
- [ ] Sin párrafos instructivos de plantilla en el WI publicado

---

## Ejemplos

**Ejemplo 1 — Stub**
- *Entrada:* «Reserva un WI para el timeout intermitente del login, todavía no sé la causa.»
- *Salida:* `WI-001-timeout-login.md` en Draft, `Tipo: bug`, unidad `Por definir`, Requerimiento breve, Criterios y Plan vacíos, Observaciones con los pendientes reales. `work-units.md` sin cambios.

**Ejemplo 2 — WI completo**
- *Entrada:* «Actualiza Spring Boot a 3.3; el ADR de versiones está en `docs/adr/`; la suite debe quedar verde y sin warnings de deprecación.»
- *Salida:* `WI-002-upgrade-spring-boot.md` con `Tipo: dependencias`, Requerimiento, Criterios de aceptación verificables, unidad concreta, Plan con pasos, referencia al ADR con ruta relativa. `Estado: Ready` si Observaciones está limpia.

**Ejemplo 3 — Información incompleta**
- *Entrada:* «WI para limpiar el módulo de reportes.»
- *Comportamiento:* El agente identifica que falta acotar qué se limpia y cómo se verifica. Pregunta antes de continuar. Si solo quiere reservar el ID: crea un stub en Draft. No redacta WI completo con supuestos.

**Ejemplo 4 — Esfuerzo grande (modo B)**
- *Entrada:* «Hay que migrar todo el logging a structured logging en API, workers y batch.»
- *Comportamiento — turno 1:* Activa el *Flujo: Proponer varios WI*. Presenta `WI-003` (API), `WI-004` (workers), `WI-005` (batch), cada uno con objetivo breve y unidad. Pregunta `Confirmar` / `Ajustar alcance` / `Cancelar`. **No crea archivos.**
- *Comportamiento — turno 2:* Tras confirmación, crea los WI (stub o completo según claridad) y reporta rutas.

**Ejemplo 5 — Repo vinculado a Azure DevOps** — ver `references/azure-devops.md` (el `Tipo` del WI determina el tipo de work item: `bug` → `Bug`, el resto → `Task`).

---

## Anti-patrones

- Implementar el arreglo, la migración o los tests mientras se redacta el WI.
- Separar el requerimiento y la especificación técnica en dos archivos: el WI es **un único documento combinado**.
- Crear un `WI` con sub-tareas hijas; un esfuerzo grande se parte en varios `WI-` hermanos.
- Crear ADRs sin pedido explícito del usuario; solo referenciar existentes o sugerir su creación.
- Publicar `Estado: Ready` sin criterios de aceptación verificables.
- Publicar `Estado: Ready` con pendientes en Observaciones.
- Ignorar los WI existentes; duplicar o contradecir su alcance.
- Inventar el requerimiento, los criterios o el plan en lugar de preguntar.
- Rellenar secciones con supuestos o ejemplos genéricos; dejar pendientes reales sin listar en Observaciones.
- Narrar el trabajo realizado en el mensaje al usuario; solo reportar resultados y pendientes.
- **Modo B**: crear WI sin haber presentado la propuesta y recibido confirmación.
- Lanzar preguntas como prosa libre cuando el cliente expone una herramienta de preguntas estructuradas.

---

## Notas

### Handoffs del ciclo

Posición: **planificación** — un WI de mantenimiento es **autocontenido**, no proviene de `work-define` (no hay historia que definir). El propio WI reúne requerimiento, criterios y especificación técnica.

| | |
|--|--|
| **Entrada** | Petición de mantenimiento del usuario (bug, refactor, deuda técnica, dependencias, operativa). No requiere una US previa. |
| **Salida para implementar** | WI en **`Estado: Ready`** (Requerimiento, Criterios, Plan, Dependencias y Referencias según checklist). Stubs en Draft **no** habilitan `work-implement`. |
| **Siguiente paso** | **`work-implement`** — solo cuando el WI a ejecutar está `Ready`. |
| **Regreso desde implement** | Ambigüedad técnica o alcance incorrecto → ajustar el WI aquí. |

### work-units.md

Compartido con el resto del repo (`docs/specs/work-units.md`). Cada sección `## <nombre-unidad>` contiene solo el nombre de la unidad y una descripción **corta** — qué cubre y, si reduce ambigüedad, qué queda fuera. No es un índice de work items ni un inventario de artefactos técnicos. Cuando la unidad de un stub es `Por definir`, no es obligatorio crear la sección hasta que se concrete.
