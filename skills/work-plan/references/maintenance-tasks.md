# Tipo de plan: Tarea de mantenimiento

Definición del tipo de plan **tarea de mantenimiento (`WI-XXX`)**: trabajo **sin historia de usuario asociada** — corrección de bugs, refactor, deuda técnica, actualización de dependencias, tareas operativas o de infraestructura. Esta referencia se carga desde `SKILL.md` cuando la selección de tipo de plan resuelve a este caso. Asume ya resueltos el subagente, el mecanismo de preguntas y el idioma (ver `SKILL.md`).

> **Alcance de un WI:** documento **único y combinado** de especificación. A diferencia de una historia de usuario —donde el requerimiento (`README.md`) y la especificación técnica (`TK-XXX`) viven en archivos separados porque la historia es un artefacto con dueño y fase propios—, una tarea de mantenimiento no tiene fase funcional separada ni se descompone en sub-tareas: el requerimiento, los criterios de aceptación y la especificación técnica conviven en **un solo documento** (`WI-XXX-[kebab-case]/README.md`), que mapea 1:1 con un único work item del tracker externo cuando hay uno vinculado (su tipo exacto lo define el archivo de referencia del sistema). No implementa código, no ejecuta pruebas, no crea ADRs. Lo no acordado va en **Observaciones** o se pregunta — nunca se inventa.

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
| **B. Descomposición de un esfuerzo grande** | El usuario describe un esfuerzo de mantenimiento amplio que no cabe en un único WI autocontenido (varios repositorios o alcances técnicos independientes). | *Flujo: Proponer varios WI desde un esfuerzo grande* — proponer un conjunto de `WI-` autocontenidos, uno por repositorio/alcance independiente. |

No existe aquí el modo «stubs desde una historia»: no hay US que descomponer. Mantener el modelo **plano** — un esfuerzo grande se parte en varios `WI-` hermanos, nunca en un `WI` con sub-tareas. En caso de duda entre A y B: preguntar al usuario antes de continuar.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Work item | `docs/specs/work-items/WI-XXX-[kebab-case]/README.md` |
| Progreso | `docs/specs/work-items/WI-XXX-[kebab-case]/progress.md` |
| ADR | `docs/adr/` |
| Documentación técnica | `docs/specs/technical-docs/[capability].md` (propiedad de `design-define`; aquí solo se referencia) |
| Glosario | `docs/specs/glossary.md` |

---

## Convenciones del nombre de archivo

- Formato de carpeta: `WI-<número>-[nombre-descriptivo]/` con `WI-<número>` en mayúsculas. Dentro, siempre un `README.md` como documento principal del WI.
- **Sin tracker externo vinculado**: `<número>` es un secuencial **global dentro de `docs/specs/work-items/`** (no hay historia padre que reinicie la cuenta); tres dígitos con cero a la izquierda → `WI-001`, `WI-002`, …
- **Con tracker externo vinculado**: `<número>` es el identificador que asigna ese sistema al work item creado; su formato exacto (numérico, con o sin padding, etc.) lo define el archivo de referencia del sistema — ver la sección «Integración con un sistema de seguimiento externo» en `SKILL.md`.
- Nombre descriptivo: minúsculas, kebab-case, corto y descriptivo.
- El nombre completo de la carpeta (`WI-<número>-[nombre-descriptivo]/`) y, si hay un tracker externo vinculado, el título usado al crear el work item deben respetar cualquier límite de longitud propio de ese sistema (ver su archivo de referencia).
- Ejemplos sin tracker: `WI-001-fix-timeout-login/README.md`, `WI-002-upgrade-spring-boot/README.md`.

---

## Información requerida antes de redactar

Antes de crear o editar cualquier WI, tener clara esta información. **No inventar nada** — si un dato no es explícito, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Modo de invocación** | Inferir del mensaje: ¿work item concreto (A) o esfuerzo grande a descomponer (B)? | Si es ambiguo, preguntar al usuario |
| **Intención** (modo A) | Del mensaje del usuario | Preguntar: ¿solo anclaje (stub) o WI completo listo para Ready? |
| **Requerimiento** | Del mensaje del usuario: qué problema/necesidad motiva el trabajo | Para stub: basta un objetivo breve. Para WI completo: preguntar hasta entender el problema |
| **Criterios de aceptación** (WI completo) | Del usuario o derivados del requerimiento: cómo se verifica que quedó hecho | Si no se pueden formular criterios verificables: publicar como stub en Draft y pedirlos |
| **Repositorio** | Nombre del repositorio git al que afecta el work item; inferir del repo (git remote / carpeta) o indicado por el usuario | Stub: puede quedar `Por definir`. WI completo: obligatorio; sin él el estado no puede ser `Ready` |
| **Contexto técnico** (WI completo) | ADRs existentes, technical-docs, descripción del usuario | Si falta decisión técnica relevante: sugerir ADR al usuario, no crearlo. Si un modelo, API o flujo mencionado no tiene especificación en `technical-docs/` y el usuario pide detallarlo: delegar a `/design-define` vía subagente y enlazar la referencia devuelta |
| **Referencia de UI** (solo si toca UI) | Figma, wireframe o imagen de alta fidelidad aportados por el usuario | Obligatoria para `Ready`; sin ella el WI de UI no puede salir de `Draft` |
| **Tipo** | Del usuario o inferido del requerimiento (bug-fix / refactor / dependency-update / optimization / security-update / test-improvement / documentation-update / operational-change) | Si es ambiguo, preguntar; si hay un tracker externo vinculado, condiciona el tipo de work item que se crea allí (mapeo exacto en su archivo de referencia) |
| **Vinculación con tracker externo** | Ver sección «Integración con un sistema de seguimiento externo» de `SKILL.md` | Si se detecta vinculación, seguir el archivo de referencia del sistema correspondiente antes de crear archivos |

> Leer siempre **todos** los `WI-*.md` existentes en `docs/specs/work-items/` antes de crear o editar. Detectar solapamientos y resolverlos con el usuario antes de continuar.

---

## Validación antes de crear

Antes de crear archivos, verificar estas condiciones. Si alguna falla, **no crear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **ID disponible:** el número `WI-XXX` propuesto no existe ya como carpeta en `docs/specs/work-items/`. (Aplica también con el identificador de un tracker externo: verificar que no exista ya un `WI-<id>-*/` con ese identificador — ver el archivo de referencia del sistema.)
- **Solapamiento de alcance:** leer los `WI-*.md` existentes y comparar su requerimiento con el del nuevo. Si alguno ya cubre el mismo alcance: informar el conflicto y preguntar si prefiere actualizar el existente o ajustar el alcance del nuevo.
- **Repositorio definido (solo WI completo):** si el repositorio sigue siendo `Por definir` tras preguntar, publicar como stub en Draft, no como WI completo.
- **Rama de trabajo actual:** determinar la rama git activa (`git branch --show-current`). Si coincide con el patrón de rama de implementación de una US o WI (`feature/US-XXX-*`, `feature/WI-XXX-*`, `fix/WI-XXX-*`, `chore/WI-XXX-*`, `refactor/WI-XXX-*`), crear el work item nuevo ahí lo mezclaría con ese trabajo en curso. No bloquea automáticamente — ver manejo específico abajo.

**Si hay conflicto:**
```
⚠️ No es posible crear el work item todavía:
- <razón concreta>
- [WI-XXX: Título](WI-XXX-nombre.md) — <razón del solapamiento, si aplica>
```

**Si la rama actual es de implementación de una US o WI:**

No bloquear la creación automáticamente. Advertir al usuario mediante la **herramienta de preguntas estructuradas**:
```
⚠️ Estás en la rama `<rama-detectada>`, que parece ser la rama de implementación de <US-XXX/WI-XXX>.
Crear un work item nuevo aquí puede mezclar sus archivos con ese trabajo en curso.
```
Preguntar `Continuar en esta rama` / `Detenerme aquí`. Si el usuario elige **Detenerme aquí**, no crear ningún archivo hasta que cambie a la rama base (u otra rama neutral) y lo confirme. Si elige **Continuar**, proceder con el resto del flujo normalmente.

---

## Flujo: Crear stub (anclaje de ID)

Un stub reserva el ID. No requiere requerimiento detallado ni contexto técnico completo.

1. **Resolver el ID:** si el repo tiene un tracker externo vinculado (ver `SKILL.md`), seguir su archivo de referencia (crea el work item primero y usa su identificador). En cualquier otro caso, inferir el siguiente secuencial libre listando carpetas `WI-*/` en `docs/specs/work-items/`.
2. Crear la carpeta `WI-<número>-[nombre-descriptivo]/` y dentro el archivo `README.md` con:
   - `Estado: Draft`
   - `Tipo`: el conocido o el más probable (confirmar si hay duda).
   - `Repositorio`: el conocido o `Por definir`.
   - `Asignado a`: indicado por el usuario; si no, inferir con `git config user.name`; omitir si no aplica.
   - `Work Item (<sistema>)`: enlace markdown al work item — solo si se creó vía el tracker vinculado (etiqueta y formato exactos en su archivo de referencia, p. ej. `Work Item (ADO)`); omitir si no aplica.
   - **Requerimiento**: objetivo breve acordado — el *qué*, sin el cómo.
   - **Criterios de aceptación / Plan de implementación**: vacíos o ausentes si aún no están definidos.
   - **Observaciones**: pendientes reales; no rellenar con texto genérico.
3. **Parar aquí.** No continuar con los pasos de WI completo.
4. **Handoff:** stub en `Draft` — completar a `Ready` con *Flujo: Crear WI completo* (modo A) antes de **`work-implement`**. La implementación, cuando proceda, se hace **invocando `/work-implement`**, no directamente.

---

## Flujo: Crear WI completo

Un WI completo puede alcanzar `Estado: Ready` si cumple todas las condiciones del checklist.

1. **Resolver el ID:** si el repo tiene un tracker externo vinculado, seguir su archivo de referencia. En cualquier otro caso, inferir el siguiente secuencial libre listando carpetas `WI-*/` en `docs/specs/work-items/`. Crear la carpeta `WI-<número>-[nombre-descriptivo]/` antes de escribir el `README.md`.
2. **Redactar el WI** siguiendo `assets/work-item-template.md`:
   - **Metadatos**: `Tipo`; `Repositorio` con el nombre del repositorio git afectado; `Asignado a` indicado por el usuario, inferido con `git config user.name`, u omitido; `Work Item (<sistema>)` con el enlace al work item solo si se creó vía el tracker vinculado (etiqueta y formato en su archivo de referencia).
   - **Requerimiento**: qué problema/necesidad motiva el trabajo — claro y concreto; sin diseño técnico.
   - **Reglas de negocio** (opcional — incluir solo si el dominio impone restricciones, obligaciones o prohibiciones explícitas; omitir si no aplica): cada regla lleva id secuencial `BR-01`, `BR-02`, … con enunciado RFC 2119 en MAYÚSCULAS. **Cada `BR-XX` declarada debe quedar verificada por al menos un `AC-XXX`** de la sección Criterios de aceptación (anotar `→ verificado por AC-XXX` junto a la regla); si al redactar los criterios alguna `BR-XX` queda sin ningún `AC-XXX` que la verifique, es una laguna — cerrarla con una pregunta o registrarla en Observaciones, nunca dejarla sin verificar.
   - **Criterios de aceptación**: cómo se verifica que quedó hecho; lista verificable. Tono imperativo; sin «podría», «quizá».
   - **Dependencias**: solo piezas *dentro del alcance del work item*. ADRs, technical-docs y referencias de diseño van en **Referencias**.
   - **Referencias**: ADRs existentes, technical-docs (con ancla al elemento concreto, p. ej. `technical-docs/facturacion.md#api-01-crear-factura`), diseño. No crear ADRs; si falta una decisión, sugerirlo en Observaciones. Si el WI depende de un modelo, API o flujo **sin especificación** en `technical-docs/`, registrarlo en Observaciones; si el usuario pide detallarlo, **delegar a `/design-define` vía subagente** y agregar aquí la referencia devuelta.
   - **Plan de implementación**: pasos concretos acordados o derivados de fuentes citadas en Referencias. Si no se conocen aún, **no inventar** — indicar en Observaciones qué falta.
   - **Migración** (opcional): si el WI proviene de una investigación de migración (`research/RS-XXX-{slug}/` de `work-research`), rellenar el bloque **Migración (origen → destino)** de la plantilla enlazando esa investigación (contexto progresivo: `discovery.md` y `validation.md` no se duplican) y mapear los `AC-XXX` a los casos Golden Master (`GM-XXX`). Omitir la sección si no es una migración.
   - **Observaciones**: solo si hay pendientes reales. Si no hay nada, **omitir la sección**. Con pendientes reales: `Estado: Draft`.
3. **Documentación técnica y glosario**: si el WI requiere crear o actualizar especificaciones en `technical-docs/`, **delegar a `/design-define` vía subagente** (nunca editarlas desde este skill) y enlazar las referencias devueltas; glossary sí puede actualizarse aquí con entradas breves (no sustituye ADR ni technical-doc).
4. **Verificar el checklist** antes de asignar `Estado: Ready`.
5. **Handoff:** si el WI está `Ready` y el usuario quiere implementar, **invocar `/work-implement`** (no implementar directamente desde este skill). Si quedó en `Draft`, listar qué falta para completarlo.

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

Aplica cuando el trabajo no cabe en un único WI autocontenido (modo B). El propósito es partirlo en `WI-` hermanos, uno por repositorio/alcance técnico independiente — manteniendo el modelo plano.

**Pasos:**

1. **Leer** todos los `WI-*.md` existentes en `docs/specs/work-items/`.
2. **Identificar repositorios / alcances independientes** a partir de la descripción del esfuerzo. **No inventar** alcances no soportados por el pedido; lo no claro queda `Por definir` o se pregunta.
3. **Presentar la propuesta** al usuario, un ítem por `WI-` tentativo: `WI-XXX` (siguiente libre), nombre de archivo, tipo, repositorio (o `Por definir`) y objetivo breve. **No crear archivos en este turno** — dejarlo explícito al final del mensaje.
4. **Confirmar con el usuario** mediante la herramienta de preguntas estructuradas. Opciones: [Confirmar] / [Ajustar alcance] / [Cancelar]. Si elige ajustar, revisar y repetir pasos 3–4. **No continuar sin confirmación explícita.**
5. **Crear cada WI** confirmado siguiendo el *Flujo: Crear stub* (o *WI completo* si el alcance ya está claro para alguno).
6. **Reportar al usuario** la lista de WI creados con su objetivo breve.
7. **Handoff:** los WI en `Draft` deben completarse a `Ready` (modo A) antes de **`work-implement`**.

**Reglas invariantes:**
- Un esfuerzo grande se parte en varios `WI-` hermanos, **nunca** en un `WI` con sub-tareas.
- No crear archivos antes de la confirmación del paso 4.
- Si el esfuerzo es ambiguo respecto a repositorios: preguntar antes de crear; no inferir por cuenta propia.

---

## Checklist antes de redactar

**Información:**
- [ ] Todos los `WI-*.md` de `docs/specs/work-items/` leídos; solapamientos resueltos
- [ ] Modo de invocación identificado (A o B)
- [ ] Modo A: intención clara: stub vs WI completo
- [ ] Modo B: propuesta presentada al usuario sin archivos creados; confirmación recibida antes del primer `WI-*.md`
- [ ] Idioma de preferencia determinado (preferencia en contexto, idioma del mensaje, o preguntado al usuario)
- [ ] **Vinculación con tracker externo**: verificada (ver `SKILL.md`); si está vinculado, seguido su archivo de referencia y el identificador externo extraído antes de crear el archivo local

**Validación:**
- [ ] ID `WI-XXX` libre en `docs/specs/work-items/`
- [ ] Sin solapamiento de alcance con WI existentes
- [ ] Rama de trabajo actual verificada; si es una rama de implementación de otra US o WI, se advirtió al usuario y se preguntó `Continuar` / `Detenerme aquí` antes de crear

**Condiciones para `Estado: Ready`:**
- [ ] **Requerimiento** con problema/necesidad claros
- [ ] **Criterios de aceptación** verificables
- [ ] Si hay **Reglas de negocio** (`BR-XX`) declaradas: cada una verificada por al menos un `AC-XXX` — ninguna `BR-XX` sin su `AC-XXX` correspondiente
- [ ] Repositorio definido (no `Por definir`) en la cabecera del WI
- [ ] Si toca UI: referencia a Figma, wireframe o imagen de alta fidelidad en **Referencias**
- [ ] **Dependencias** listadas dentro del alcance del work item
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
- *Salida:* carpeta `WI-001-timeout-login/` con `README.md` en Draft, `Tipo: bug-fix`, repositorio `Por definir`, Requerimiento breve, Criterios y Plan vacíos, Observaciones con los pendientes reales.

**Ejemplo 2 — WI completo**
- *Entrada:* «Actualiza Spring Boot a 3.3; el ADR de versiones está en `docs/adr/`; la suite debe quedar verde y sin warnings de deprecación.»
- *Salida:* carpeta `WI-002-upgrade-spring-boot/` con `README.md`, `Tipo: dependency-update`, Requerimiento, Criterios de aceptación verificables, repositorio concreto en la cabecera, Plan con pasos, referencia al ADR con ruta relativa. `Estado: Ready` si Observaciones está limpia.

**Ejemplo 3 — Información incompleta**
- *Entrada:* «WI para limpiar el módulo de reportes.»
- *Comportamiento:* El agente identifica que falta acotar qué se limpia y cómo se verifica. Pregunta antes de continuar. Si solo quiere reservar el ID: crea un stub en Draft. No redacta WI completo con supuestos.

**Ejemplo 4 — Esfuerzo grande (modo B)**
- *Entrada:* «Hay que migrar todo el logging a structured logging en API, workers y batch.»
- *Comportamiento — turno 1:* Activa el *Flujo: Proponer varios WI*. Presenta `WI-003` (API), `WI-004` (workers), `WI-005` (batch), cada uno con objetivo breve y repositorio. Pregunta con opciones: [Confirmar] / [Ajustar alcance] / [Cancelar]. **No crea archivos.**
- *Comportamiento — turno 2:* Tras confirmación, crea los WI (stub o completo según claridad) y reporta rutas.

**Ejemplo 5 — Repo vinculado a un tracker externo** — ver el archivo de referencia del sistema correspondiente (p. ej. `references/azure-devops.md`, donde el `Tipo` del WI determina el tipo de work item creado).

---

## Anti-patrones

- Implementar el arreglo, la migración o los tests mientras se redacta el WI.
- Crear el WI como un archivo suelto `WI-XXX-[slug].md` en lugar de una carpeta `WI-XXX-[slug]/README.md`.
- Crear un `WI` con sub-tareas hijas; un esfuerzo grande se parte en varios `WI-` hermanos.
- Crear ADRs sin pedido explícito del usuario; solo referenciar existentes o sugerir su creación.
- Crear o editar documentos en `docs/specs/technical-docs/` directamente desde este skill; la especificación técnica se delega a `/design-define` vía subagente y aquí solo se enlaza la referencia devuelta.
- Redactar en el WI la definición de un modelo, API o flujo (tablas de campos, contratos, diagramas) en lugar de referenciar su elemento en `technical-docs/`.
- Publicar `Estado: Ready` sin criterios de aceptación verificables.
- Publicar `Estado: Ready` con pendientes en Observaciones.
- Publicar `Estado: Ready` sin el repositorio afectado en la cabecera del WI.
- Ignorar los WI existentes; duplicar o contradecir su alcance.
- Inventar el requerimiento, los criterios o el plan en lugar de preguntar.
- Rellenar secciones con supuestos o ejemplos genéricos; dejar pendientes reales sin listar en Observaciones.
- Narrar el trabajo realizado en el mensaje al usuario; solo reportar resultados y pendientes.
- Crear un work item nuevo estando en la rama de implementación de otra US o WI sin advertir al usuario y preguntar `Continuar` / `Detenerme aquí` primero.
- **Modo B**: crear WI sin haber presentado la propuesta y recibido confirmación.
- Lanzar preguntas como prosa libre cuando el cliente expone una herramienta de preguntas estructuradas.

---

## Notas

### Handoffs del ciclo

Posición: **planificación** — una tarea de mantenimiento (`WI`) es **autocontenida**, no proviene de `work-define` (no hay historia que definir). El propio WI reúne requerimiento, criterios y especificación técnica.

| | |
|--|--|
| **Entrada** | Petición de mantenimiento del usuario (bug, refactor, deuda técnica, dependencias, operativa). No requiere una US previa. |
| **Salida para implementar** | WI en **`Estado: Ready`** (Requerimiento, Criterios, Plan, Dependencias y Referencias según checklist). Stubs en Draft **no** habilitan `work-implement`. |
| **Siguiente paso** | **Invocar `/work-implement`** — solo cuando el WI a ejecutar está `Ready`. La implementación nunca se hace directamente desde `work-plan`. |
| **Regreso desde implement** | Ambigüedad técnica o alcance incorrecto → ajustar el WI aquí. |

### Repositorio afectado

Cada WI declara en su cabecera el **repositorio git** al que afecta (campo `Repositorio`). Es el ámbito donde se materializará el trabajo. Se infiere del repo (git remote / carpeta) o lo indica el usuario; para `Estado: Ready` es obligatorio (no `Por definir`). Un stub puede dejarlo `Por definir` hasta que se concrete.
