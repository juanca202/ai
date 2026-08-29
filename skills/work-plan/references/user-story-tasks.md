# Tipo de plan: Tarea técnica de historia de usuario

Definición del tipo de plan **tarea técnica (`TK-XXX`)** bajo una historia de usuario existente. Esta referencia se carga desde `SKILL.md` cuando la selección de tipo de plan resuelve a este caso. Asume ya resueltos el subagente, el mecanismo de preguntas y el idioma (ver `SKILL.md`).

> **Alcance de un TK:** documento de **especificación técnica**. Describe qué lograr, cómo implementarlo y sus dependencias dentro del alcance de la tarea. No implementa código, no ejecuta pruebas, no crea ADRs. Lo no acordado va en **Observaciones** o se pregunta — nunca se inventa.

La plantilla canónica está en `assets/task-template.md` (léela antes de escribir cualquier TK).

## Contenido

- [Modos de invocación](#modos-de-invocación)
- [Ubicación de archivos](#ubicación-de-archivos)
- [Convenciones del nombre de archivo](#convenciones-del-nombre-de-archivo)
- [Información requerida antes de redactar](#información-requerida-antes-de-redactar)
- [Validación antes de crear](#validación-antes-de-crear)
- [Flujo: Crear stub](#flujo-crear-stub-anclaje-de-id)
- [Flujo: Crear TK completa](#flujo-crear-tk-completa)
- [Flujo: Actualizar una TK existente](#flujo-actualizar-una-tk-existente)
- [Flujo: Planificar desde una US](#flujo-planificar-desde-una-us)
- [Orden y priorización de tareas](#orden-y-priorización-de-tareas)
- [Checklist antes de redactar](#checklist-antes-de-redactar)
- [Ejemplos](#ejemplos)
- [Anti-patrones](#anti-patrones)
- [Notas](#notas)

---

## Modos de invocación

Dentro de este tipo de plan hay **dos modos** según lo que entregue el usuario.

| Modo | Disparador | Flujo a aplicar |
|------|------------|-----------------|
| **A. Tarea específica** | El usuario describe una tarea concreta (objetivo, repositorio, alcance) o pide editar una `TK-XXX` existente. | *Flujo: Crear stub*, *Flujo: Crear TK completa* o *Flujo: Actualizar una TK existente* según corresponda. |
| **B. Planificar desde US** | El usuario entrega **solo una referencia a una historia** (p. ej. «US-004», «crea las tareas para US-007», «planifica esta historia») sin describir tareas específicas. | *Flujo: Planificar desde una US* — proponer la descomposición en tareas agrupadas por repositorio que cubra los criterios de aceptación (`AC-XXX`) de la US, y dejar que el usuario decida si se materializan como **planes completos** o como **stubs**. |

En caso de duda entre A y B: preguntar al usuario antes de continuar. No combinar ambos modos en una misma ejecución.

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Tarea | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[kebab-case].md` |
| ADR | `docs/adr/` |
| Documentación técnica | `docs/specs/technical-docs/[capability].md` (propiedad de `design-define`; aquí solo se referencia) |
| Glosario | `docs/specs/glossary.md` |
| US padre ya archivada (fallback) | `docs/archive/user-stories/US-XXX-[nombre-corto]/` |

> **US padre archivada.** Si la carpeta de la US no está en `docs/specs/user-stories/`, buscarla bajo `docs/archive/user-stories/` antes de darla por inexistente. Si está ahí, la historia **ya se cerró e integró**: **parar y avisar** en vez de añadirle tareas — retomarla exige desarchivarla, y eso lo decide el usuario. **Nunca** crear la carpeta en la ruta activa por no haberla encontrado. Ver [`work-integrate/references/archive.md`](../../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).

---

## Convenciones del nombre de archivo

- Formato: `TK-<número>-[nombre-descriptivo].md` con `TK-<número>` en mayúsculas.
- **Sin tracker externo vinculado**: `<número>` es un secuencial **por historia** (no global); tres dígitos con cero a la izquierda → `TK-001`, `TK-002`, …
  - Al ser por historia, el escaneo se hace sobre la carpeta de la US **realmente resuelta**, no sobre una ruta activa que se dé por vacía sin haberla comprobado: si la US no aparece ahí, la regla de US archivada ya obligó a parar (ver [Ubicación de archivos](#ubicación-de-archivos)). Reiniciar en `001` dentro de una carpeta recién creada porque «no había nada» duplicaría identificadores.
- **Con la integración activa**: `<número>` es el identificador que asigna ese proveedor al work item creado; su formato exacto (numérico, con o sin padding, etc.) lo define el archivo de referencia del proveedor — ver la sección «Resolución de la integración con el gestor de proyectos» en `SKILL.md`.
- Nombre descriptivo: minúsculas, kebab-case, corto y descriptivo.
- El nombre completo del archivo (`TK-<número>-[nombre-descriptivo].md`) y, si hay un tracker externo vinculado, el título usado al crear el work item deben respetar cualquier límite de longitud propio de ese sistema (ver su archivo de referencia).
- Ejemplos sin tracker: `TK-001-modelo-dominio-receta.md`, `TK-002-endpoint-crear-receta.md`.

---

## Información requerida antes de redactar

Antes de crear o editar cualquier TK, tener clara esta información. **No inventar nada** — si un dato no es explícito, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **US padre** | Indicada por el usuario | Sin `README.md` de US existente no se puede crear el TK |
| **Modo de invocación** | Inferir del mensaje: ¿tarea específica (A) o solo referencia a US (B)? | Si es ambiguo, preguntar al usuario |
| **Intención** (solo modo A) | Del mensaje del usuario | Preguntar: ¿solo anclaje (stub) o TK completa lista para Ready? |
| **Objetivo del TK** (solo modo A) | Del mensaje del usuario | Para stub: basta un objetivo breve. Para TK completa: preguntar hasta tener contexto suficiente |
| **AC-XXX de la US** (solo modo B) | Leer la sección **Criterios de aceptación** del `README.md` de la US padre (lista plana `AC-XXX`) | Si no hay `AC-XXX` explícitos: bloquear modo B y reportar — no crear ninguna TK |
| **Profundidad** (solo modo B) | Elección del usuario en el paso 6 del flujo: `Crear los planes` (TK completas) o `Crear stubs` | No asumirla: presentar la propuesta y preguntar |
| **Repositorio** | Nombre del repositorio git al que afecta la tarea; inferir del repo (git remote / carpeta) o indicado por el usuario | Stub: puede quedar `Por definir`. TK completa: obligatorio; sin él el estado no puede ser `Ready` |
| **Contexto técnico** (solo TK completa) | ADRs existentes, technical-docs, descripción del usuario | Si falta decisión técnica relevante: sugerir ADR al usuario, no crearlo. Si un modelo, API o flujo mencionado no tiene especificación en `technical-docs/` y el usuario pide detallarlo: delegar a `/design-define` vía subagente y enlazar la referencia devuelta |
| **Referencia de UI** (solo TK de interfaz) | Figma, wireframe o imagen de alta fidelidad aportados por el usuario | Obligatoria para `Ready`; sin ella el TK de UI no puede salir de `Draft` |
| **Vinculación con el gestor de proyectos** | Ver sección «Resolución de la integración con el gestor de proyectos» de `SKILL.md` | Si la integración está activa, seguir el archivo de referencia del proveedor antes de crear archivos |

> Leer siempre el `README.md` de la US y **todas** las `TK-*.md` existentes en la carpeta antes de crear o editar. Detectar solapamientos y resolverlos con el usuario antes de continuar.

---

## Validación antes de crear

Antes de crear archivos, verificar estas condiciones. Si alguna falla, **no crear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **US padre existe y está Ready:** la carpeta `US-XXX-[nombre-corto]/` tiene `README.md` con `Estado: Ready`. No se pueden crear TKs sobre una US en Draft.
- **ID disponible:** el número `TK-XXX` propuesto no existe ya en la carpeta de la US — la carpeta **realmente resuelta**, no una ruta activa que se dé por vacía sin haber comprobado el archivo (si la US resultó estar archivada, la comprobación anterior ya obligó a parar y no hay TK que numerar). (Aplica también con el identificador de un tracker externo: verificar que no exista ya un `TK-<id>-*.md` con ese identificador — ver el archivo de referencia del sistema.)
- **Solapamiento de alcance:** leer todas las `TK-*.md` de la carpeta y comparar su objetivo con el de la nueva tarea. Si alguna ya cubre el mismo alcance: informar al usuario el conflicto y preguntar si prefiere actualizar la existente o ajustar el alcance de la nueva.
- **Repositorio definido (solo TK completa):** si el repositorio sigue siendo `Por definir` tras preguntar, publicar como stub en Draft, no como TK completa.
- **Rama de trabajo actual:** determinar la rama git activa (`git branch --show-current`). La rama de implementación de la TK es la de su **propia** US padre: `feature/US-XXX-[nombre-corto]` (ver `work-implement`). Si la rama activa es una rama de implementación (`feature/US-*`, `feature/WI-*`, `fix/WI-*`, `chore/WI-*`, `refactor/WI-*`, `test/*`) **distinta** de esa —por ejemplo la de otra US o de un WI—, la TK quedaría documentada en el contexto de otro trabajo. No bloquea automáticamente — ver manejo específico abajo.

**Si hay conflicto:**
```
⚠️ No es posible crear la tarea todavía:
- <razón concreta>
- [TK-XXX: Título](TK-XXX-nombre.md) — <razón del solapamiento, si aplica>
```

**Si la rama actual es una rama de implementación distinta de la propia US padre:**

No bloquear la creación automáticamente. Advertir al usuario mediante la **herramienta de preguntas estructuradas**:
```
⚠️ Estás en la rama `<rama-detectada>`, que parece ser la rama de implementación de <US-XXX/WI-XXX>, distinta de la US padre de esta tarea (`feature/US-XXX-[nombre-corto]`).
Crear esta TK aquí puede mezclarla con ese otro trabajo en curso.
```
Preguntar `Continuar en esta rama` / `Detenerme aquí`. Si el usuario elige **Detenerme aquí**, no crear ningún archivo hasta que cambie a la rama de la US padre (o a la rama base) y lo confirme. Si elige **Continuar**, proceder con el resto del flujo normalmente.

---

## Flujo: Crear stub (anclaje de ID)

Un stub reserva el ID y el vínculo a la US. No requiere contexto técnico completo.

1. **Resolver el ID de la tarea:** si el repo tiene un tracker externo vinculado (ver `SKILL.md`), seguir su archivo de referencia (crea el work item primero y usa su identificador). En cualquier otro caso, inferir el siguiente número secuencial libre listando archivos `TK-*.md` en la carpeta de la US — la carpeta real, resuelta según la [Validación](#validación-antes-de-crear); nunca una ruta activa vacía que se dé por buena sin haber comprobado el archivo.
2. Crear `TK-<número>-[nombre-descriptivo].md` con:
   - `Estado: Draft`
   - `Historia`: enlace a la US `[US-XXX](./README.md)`.
   - `Repositorio`: el conocido o `Por definir`.
   - `Asignado a`: indicado por el usuario; si no, inferir con `git config user.name`; omitir la línea si no aplica.
   - `Work Item (<sistema>)`: enlace markdown al work item — solo si se creó vía el tracker vinculado (etiqueta y formato exactos en su archivo de referencia, p. ej. `Work Item (ADO)`); omitir la línea si no aplica.
   - **Descripción**: objetivo breve acordado — el *qué*, sin el cómo.
   - **Plan de implementación**: vacío o ausente si no hay pasos definidos.
   - **Observaciones**: pendientes reales; no rellenar con texto genérico.
3. **Parar aquí.** No continuar con los pasos de TK completa.
4. **Handoff:** stub en `Draft` — completar a `Ready` con *Flujo: Crear TK completa* (modo A) antes de **`work-implement`**. La implementación, cuando proceda, se hace **invocando `/work-implement`**, no directamente.

---

## Flujo: Crear TK completa

Una TK completa puede alcanzar `Estado: Ready` si cumple todas las condiciones del checklist.

1. **Resolver el ID de la tarea:** si el repo tiene un tracker externo vinculado, seguir su archivo de referencia. En cualquier otro caso, inferir el siguiente secuencial libre en la carpeta de la US — la carpeta real, resuelta según la [Validación](#validación-antes-de-crear); nunca una ruta activa vacía que se dé por buena sin haber comprobado el archivo.
2. **Redactar el TK** siguiendo `assets/task-template.md`:
   - **Metadatos**: `Historia` con enlace `[US-XXX](./README.md)`; `Repositorio` con el nombre del repositorio git afectado; `Asignado a` indicado por el usuario, inferido con `git config user.name`, u omitido; `Work Item (<sistema>)` con el enlace al work item solo si se creó vía el tracker vinculado (etiqueta y formato en su archivo de referencia).
   - **Descripción**: qué lograr — objetivo claro, tono imperativo y verificable; sin «podría», «quizá», «tal vez».
   - **Dependencias**: solo piezas *dentro del alcance de la tarea* — componentes, servicios, modelos, librerías. ADRs, technical-docs, contratos y referencias de diseño van en **Referencias**.
   - **Referencias**: ADRs existentes, technical-docs (con ancla al elemento concreto, p. ej. `technical-docs/facturacion.md#api-01`), diseño. El ancla es **siempre `#<id en minúsculas>`** (`#md-01`, `#api-04`, `#fl-02`, `#dg-01`), nunca derivada del título del elemento: `design-define` la emite explícitamente y la devuelve ya formada, así que se **copia tal cual** — no se recompone a partir del nombre. Un `#api-01-crear-factura` apunta a nada. No crear ADRs; si falta una decisión, sugerirlo al usuario en Observaciones. Si la tarea depende de un modelo, API o flujo **sin especificación** en `technical-docs/`, registrarlo en Observaciones; si el usuario pide detallarlo, **delegar a `/design-define` vía subagente** y agregar aquí la referencia devuelta.
   - **Plan de implementación**: pasos concretos acordados o derivados de fuentes citadas en Referencias. Si no se conocen aún, **no inventar** — indicar en Observaciones qué falta.
   - **Migración** (opcional): si la tarea proviene de una investigación de migración (`research/RS-XXX-{slug}/` de `work-research`), rellenar el bloque **Migración (origen → destino)** de la plantilla enlazando esa investigación (contexto progresivo: `discovery.md` y `validation.md` no se duplican). Los `AC-XXX` viven en la US y se validan con los casos Golden Master (`GM-XXX`). Omitir la sección si no es una migración.
   - **Observaciones**: solo si hay pendientes reales. Si no hay nada, **omitir la sección** (o una línea *Sin pendientes documentados* si el equipo lo exige). Con pendientes reales: `Estado: Draft`.
3. **Documentación técnica y glosario**: si la TK requiere crear o actualizar especificaciones en `technical-docs/`, **delegar a `/design-define` vía subagente** (nunca editarlas desde este skill) y enlazar las referencias devueltas; glossary sí puede actualizarse aquí con entradas breves (no sustituye ADR ni technical-doc).
4. **Verificar el checklist** antes de asignar `Estado: Ready`.
5. **Handoff:** con todas las TK del alcance en `Ready`, aplicar antes `specification.testCases.mode` sobre la US padre (ver [`../../../reference/planning.md`](../../../reference/planning.md)); después, si el usuario quiere implementar, **invocar `/work-implement`** (no implementar directamente desde este skill). Si otras siguen en `Draft`, listar cuáles completar antes.

---

## Flujo: Actualizar una TK existente

1. **Identificar el archivo** — por número, nombre o título, dentro de la carpeta de su US. Si esa carpeta no está en `docs/specs/user-stories/`, buscarla bajo `docs/archive/user-stories/`: si está archivada, la historia y sus tareas ya se cerraron e integraron — **parar y avisar**, editarlas exige desarchivar primero y eso lo decide el usuario.
2. **Leer el contenido actual** completo antes de editar.
3. **Leer el `README.md` de la US y las demás TKs** para detectar solapamientos con los cambios propuestos.
4. **Aplicar los cambios** solicitados. Reglas invariantes:
   - Si hay conflicto entre el TK y el `README.md` de la US: **la US prevalece**. Corregir el TK, no la historia.
   - Si el usuario cambia el estado a **Ready**: verificar todas las condiciones del checklist antes de guardar.
   - Si se añaden pasos al Plan: mantener tono imperativo y verificable; sin supuestos no acordados.
5. **Confirmar** mostrando las secciones modificadas.

---

## Flujo: Planificar desde una US

Aplica cuando el input es **solo una referencia a una historia** (modo B). El propósito es proponer una descomposición coherente en tareas que cubra los criterios de aceptación (`AC-XXX`) y **dejar que el usuario decida en qué profundidad se materializa**: planes completos (TK listas para `Ready`) o stubs (solo anclaje de ID).

**Precondiciones de bloqueo** — si alguna falla, **no crear archivos** e informar al usuario indicando la condición incumplida:
- La carpeta `US-XXX-[nombre-corto]/` existe y su `README.md` tiene `Estado: Ready`.
- El `README.md` contiene la sección **Criterios de aceptación** con al menos un `AC-XXX`.

**Pasos:**

1. **Leer el `README.md` de la US completo** y todas las `TK-*.md` existentes en su carpeta.
2. **Verificar las precondiciones de bloqueo.** Si alguna falla, no continuar: reportar qué falta y sugerir el skill correspondiente (`work-define` para alinear la US, etc.).
3. **Identificar los repositorios afectados** a partir del alcance de la US y sus criterios de aceptación (`AC-XXX`). Un trabajo puede tocar uno o varios repositorios. **No inventar** repositorios no soportados por la US; lo no claro queda `Por definir` o se pregunta.
4. **Cubrir los AC-XXX.** Cada `AC-XXX` debe quedar cubierto por al menos una tarea; agrupar los que comparten repositorio y alcance.
5. **Presentar la propuesta de descomposición** agrupada por repositorio. Por cada tarea: `TK-XXX` tentativo (siguiente libre), nombre de archivo, repositorio (o `Por definir`), objetivo breve y qué `AC-XXX` cubre. No es 1 tarea por `AC-XXX`: varios `AC-XXX` pueden caer en una misma tarea si comparten repositorio y alcance; un `AC-XXX` amplio puede dividirse si abarca varios repositorios. **Ordenar la propuesta** según **[Orden y priorización de tareas](#orden-y-priorización-de-tareas)**: infraestructura compartida primero, luego tareas sin dependencias, y al final las que dependen de otras. **No crear archivos en este turno** — dejarlo explícito al final del mensaje.
6. **Confirmar con el usuario** mediante la herramienta de preguntas estructuradas, con la propuesta ya delante. Opciones, **en este orden**:

   | Opción | Significado | Continuación |
   |--------|-------------|--------------|
   | **Crear los planes** | Materializar la descomposición como **TK completas** (tareas definitivas), no como stubs. | Paso 7a |
   | **Crear stubs** | Materializar solo el anclaje de ID y el vínculo a la US, en `Draft`. | Paso 7b |
   | **Cancelar** | No crear nada. | Terminar sin escribir archivos. |

   **No ofrecer una opción de «Otro» ni de «Ajustar»**: la herramienta de preguntas ya admite respuesta libre, y es ahí donde el usuario pide cambiar el agrupamiento, el alcance o las tareas. Si responde con un ajuste, aplicarlo y **repetir los pasos 5–6**.

   **No continuar sin confirmación explícita**, salvo que el mensaje inicial ya declarara la intención con detalle suficiente (p. ej. «crea las tareas definitivas de US-004») — en ese caso la opción queda determinada, pero la propuesta del paso 5 se presenta igualmente.

7. **Materializar según la opción elegida.**

   **7a. Crear los planes** — por cada tarea confirmada, seguir el *[Flujo: Crear TK completa](#flujo-crear-tk-completa)* íntegro, respetando el orden del paso 5 (las Dependencias solo pueden referenciar TK de igual o mayor prioridad ya creadas):
   - Reunir en **una sola tanda** de preguntas el contexto técnico que falte para el conjunto (ver [Información requerida antes de redactar](#información-requerida-antes-de-redactar)); no ir tarea por tarea preguntando lo mismo.
   - **No inventar** Plan de implementación, Dependencias ni Referencias. Lo que siga sin acordar va a **Observaciones**, y esa TK queda en `Estado: Draft`.
   - Asignar `Estado: Ready` **solo** a las TK que cumplan todas las condiciones de `Estado: Ready` del [checklist](#checklist-antes-de-redactar). Es normal que el lote quede mixto (unas `Ready`, otras `Draft`).
   - Si una TK requiere especificación técnica inexistente en `technical-docs/`, **delegar a `/design-define` vía subagente** y enlazar la referencia devuelta; nunca redactar la especificación aquí.

   **7b. Crear stubs** — por cada tarea confirmada, seguir el *[Flujo: Crear stub](#flujo-crear-stub-anclaje-de-id)*: `Estado: Draft`, descripción breve del objetivo, Plan vacío, sin referenciar `AC-XXX` en el documento.

8. **Reportar al usuario** la lista de TK creadas, agrupadas por repositorio, indicando por cada una su `Estado` y qué `AC-XXX` cubre. Si el lote quedó mixto, listar aparte las que siguen en `Draft` y qué les falta.
9. **Casos de prueba:** aplicar [`../../../reference/planning.md`](../../../reference/planning.md) sobre la **US padre**. Si ya tiene `test-cases/` con algún `TC-XXX`, saltar este paso. Si no: con `always`, invocar `/test-define` sobre la US sin preguntar; con `ask`, ofrecerlo junto al handoff del paso 10; con `never`, no mencionarlo.
10. **Handoff:** las TK en `Ready` habilitan implementación — cuando el usuario quiera implementarlas, **invocar `/work-implement`**; nunca implementar directamente desde este skill. Las que quedaron en `Draft` deben completarse antes con **`work-plan`** (modo A); no sugerir implementación mientras las TK del alcance sigan en Draft.

**Reglas invariantes:**
- **La profundidad la decide el usuario en el paso 6**, no el agente. No degradar a stubs una elección de «Crear los planes» por falta de contexto: preguntar primero y, si aun así falta información, crear la TK con lo acordado y los pendientes en **Observaciones**.
- En stubs (7b): no redactar Plan de implementación, ni Dependencias detalladas, ni Referencias técnicas.
- No incluir identificadores `AC-XXX` dentro de los archivos `TK-XXX.md`. La consideración es del agente, no del documento.
- **No crear archivos `TK-*.md` antes de la confirmación del paso 6.** La traza AC-XXX → tarea vive en la propuesta (paso 5) y en el reporte (paso 8).
- Si la US es ambigua respecto a repositorios: preguntar antes de crear nada; no inferir repositorios por cuenta propia.
- Si dos tareas se solapan: consolidarlas en la propuesta (paso 5) o preguntar antes de confirmar.
- El orden de las tareas propuestas sigue **[Orden y priorización de tareas](#orden-y-priorización-de-tareas)**: infraestructura compartida → sin dependencias → con dependencias; ninguna TK antes de otra de la que depende.

---

## Orden y priorización de tareas

Aplica siempre que se planifiquen o secuencien **varias TK dentro de la misma US** — típicamente en *Flujo: Planificar desde una US* (modo B), pero también al redactar **Dependencias** en *Flujo: Crear TK completa* cuando ya existen otras TK de la historia. El objetivo es liberar cuanto antes la ejecución en paralelo y evitar que una tarea quede bloqueada por otra que se implementa después.

**Criterio de prioridad** (de mayor a menor) al ordenar o secuenciar las TK de una misma US:

1. **Infraestructura compartida** — piezas base que otras tareas del alcance necesitan (modelos de dominio comunes, contratos, configuración base, esquemas, migraciones). Van primero: al completarse, liberan la ejecución en paralelo de las tareas que dependen de ellas.
2. **Tareas sin dependencias** — pueden ejecutarse en paralelo entre sí y con las de infraestructura ya resueltas.
3. **Tareas con dependencias** — al final, y solo referenciando TK de prioridad igual o superior (infraestructura o sin dependencias) ya creadas o ya secuenciadas antes; nunca una TK que se cree o secuencie después.

**Regla de secuencia (sin bloqueos hacia adelante):** la sección **Dependencias** de una TK solo puede referenciar tareas de igual o mayor prioridad en este orden. Si al redactar una TK, su Plan de implementación o sus Dependencias requieren algo que solo entrega una TK posterior en la secuencia propuesta: **reordenar la propuesta** — mover esa pieza a infraestructura compartida o adelantar la tarea de la que depende — en lugar de dejar la implementación bloqueada por una tarea futura. Esto aplica tanto al **orden de presentación** de la propuesta (paso 5 de *Flujo: Planificar desde una US*) como al orden en que se documentan las Dependencias entre TK ya existentes.

**Escenarios E2E:** los escenarios E2E se derivan de los `AC-XXX` de la US durante la especificación (aquí, en `work-plan`), igual que el resto de la cobertura. Por naturaleza dependen de que los componentes del flujo completo estén disponibles, así que la TK que los cubre cae en el grupo 3 (con dependencias) y se secuencia **al final**, después de las tareas que atraviesa (posiblemente en varios repositorios). Su **implementación** (los propios casos/artefactos E2E) se realiza cuando esas dependencias ya están resueltas; su **ejecución**, en cambio, no es un requisito de `Estado: Ready` de esa TK — forma parte del **Quality Gate** previo a integrar o liberar la funcionalidad (ver `quality-check`, que corre en `work-integrate` / `pr-create`).

---

## Checklist antes de redactar

**Información:**
- [ ] `README.md` de la US leído
- [ ] Todas las `TK-*.md` de la carpeta leídas; solapamientos resueltos
- [ ] Modo de invocación identificado (A o B)
- [ ] Modo A: intención clara: stub vs TK completa
- [ ] Modo B: AC-XXX identificados en **Criterios de aceptación** del `README.md`; US en `Estado: Ready`
- [ ] Modo B: propuesta presentada al usuario (paso 5) sin archivos creados
- [ ] Modo B: confirmación estructurada recibida (paso 6) antes del primer `TK-*.md`, con las opciones `Crear los planes` / `Crear stubs` / `Cancelar`
- [ ] Modo B: profundidad elegida por el usuario respetada — «Crear los planes» produce TK completas (7a), no stubs
- [ ] Orden entre TKs de la misma US según [Orden y priorización de tareas](#orden-y-priorización-de-tareas): infraestructura compartida → sin dependencias → con dependencias; ninguna TK depende de otra posterior en la secuencia
- [ ] Si hay escenario E2E: su TK queda secuenciada al final (tras las tareas que atraviesa) y su ejecución no se exige como condición de `Estado: Ready`, sino en el Quality Gate previo a integrar/liberar
- [ ] Idioma resuelto según la sección «Resolución de idioma» de `SKILL.md`
- [ ] **Vinculación con tracker externo**: verificada (ver `SKILL.md`); si está vinculado, seguido su archivo de referencia y el identificador externo extraído antes de crear el archivo local

**Validación:**
- [ ] Carpeta de la US existe con `README.md`
- [ ] ID `TK-XXX` libre en la carpeta de la US realmente resuelta (nunca en una ruta activa dada por vacía sin comprobar `docs/archive/user-stories/`)
- [ ] Sin solapamiento de alcance con TKs existentes
- [ ] Rama de trabajo actual verificada; si es una rama de implementación distinta de la propia US padre, se advirtió al usuario y se preguntó `Continuar` / `Detenerme aquí` antes de crear

**Condiciones para `Estado: Ready`:**
- [ ] Repositorio definido (no `Por definir`) en la cabecera del TK
- [ ] **Descripción** con objetivo claro y verificable
- [ ] Si es TK de UI: referencia a Figma, wireframe o imagen de alta fidelidad en **Referencias**
- [ ] **Dependencias** listadas dentro del alcance de la tarea
- [ ] **Plan de implementación** con pasos concretos
- [ ] **Observaciones** sin pendientes abiertos — sección omitida o con *Sin pendientes documentados*
- [ ] Referencias a ADRs y technical-docs con rutas relativas válidas, y las de technical-docs con ancla `#<id>` (`#md-01`, `#api-04`) tal como las devolvió `design-define` — nunca un slug del título

**Formato:**
- [ ] Plantilla `assets/task-template.md` leída
- [ ] Nombre de archivo en kebab-case, secuencial por historia
- [ ] Sin código de aplicación en el archivo
- [ ] Sin párrafos instructivos de plantilla en el TK publicado
- [ ] `specification.testCases.mode` aplicado sobre la **US padre** al cerrar: invocado, ofrecido o no mencionado según la política — y saltado si la US ya tenía `test-cases/` con algún `TC-XXX`

---

## Ejemplos

**Ejemplo 1 — Stub**
- *Entrada:* «Solo quiero reservar TK-003, sin diseño técnico todavía.»
- *Salida:* `TK-003-[nombre-corto].md` en Draft, repositorio `Por definir`, descripción mínima del objetivo, Plan vacío, Observaciones con los pendientes reales.

**Ejemplo 2 — TK completa**
- *Entrada:* «TK para el diálogo de selección de ítem usando Material; la US tiene criterios; el ADR de UI está en `docs/adr/`.»
- *Salida:* TK con repositorio concreto en la cabecera, Plan con pasos verificables, referencias al ADR con ruta relativa. `Estado: Ready` si Observaciones está limpia; `Draft` si quedan pendientes.

**Ejemplo 3 — Información incompleta**
- *Entrada:* «TK-005 para la API Z.»
- *Comportamiento:* El agente identifica que faltan contratos, endpoints y DTOs para redactar una TK completa. Pregunta al usuario antes de continuar. Si solo quiere reservar el ID: crea un stub en Draft. No redacta TK completa con supuestos.

**Ejemplo 4 — Planificar desde una US, opción stubs (modo B)**
- *Entrada:* «Crea las tareas necesarias para implementar US-004.» (sin describir tareas específicas).
- *Comportamiento — turno 1:* Activa el *Flujo: Planificar desde una US*. Verifica que `US-004/README.md` está en `Ready` y contiene `AC-XXX`. Lee la US completa, identifica los repositorios afectados, y presenta la propuesta agrupada por repositorio (paso 5) con `TK-XXX` tentativo, nombre de archivo, objetivo breve y cobertura de `AC-XXX` por tarea, ordenada según [Orden y priorización de tareas](#orden-y-priorización-de-tareas): primero la infraestructura compartida (p. ej. modelo de dominio común), luego las tareas sin dependencias, y al final las que dependen de otras — el eventual escenario E2E queda último. Pregunta con opciones: [Crear los planes] / [Crear stubs] / [Cancelar]. **No crea archivos.**
- *Comportamiento — turno 2:* El usuario elige **Crear stubs**. Crea cada stub en `Estado: Draft` sin referencias a `AC-XXX` en el archivo (paso 7b) y reporta rutas creadas con cobertura AC (paso 8).
- *Salida:* Stubs `TK-001-...md` a `TK-NNN-...md` en Draft.

**Ejemplo 4b — Planificar desde una US, opción planes completos (modo B)**
- *Entrada:* la misma que el Ejemplo 4; en el paso 6 el usuario elige **Crear los planes**.
- *Comportamiento — turno 2:* Reúne en una sola tanda el contexto técnico faltante para el conjunto (repositorios sin definir, contratos, referencias de UI). Luego redacta cada TK siguiendo el *Flujo: Crear TK completa* en el orden propuesto, con Dependencias que solo referencian TK anteriores de la secuencia. Verifica el checklist por TK: las que lo cumplen salen en `Estado: Ready`; las que conservan pendientes salen en `Draft` con esos pendientes en **Observaciones**. No inventa pasos ni contratos para forzar `Ready`.
- *Salida:* `TK-001-...md` a `TK-NNN-...md`, cada una con su estado real, y un reporte que separa las `Ready` de las `Draft` con lo que a estas les falta.

**Ejemplo 5 — US no Ready o sin AC-XXX**
- *Entrada:* «Tareas para US-009.» — pero `US-009/README.md` está en `Draft` o no tiene `AC-XXX` documentados.
- *Comportamiento:* Bloquea, no crea ningún stub. Reporta qué falta (estado, criterios) y sugiere usar `work-define` para alinear la US antes de planificar.

**Ejemplo 6 — Repo vinculado a un tracker externo** — ver el archivo de referencia del sistema correspondiente (p. ej. `references/azure-devops.md`).

---

## Anti-patrones

- **Narrar el flujo interno**: anunciar que se resuelve el idioma o la política, que se lee `settings.json`, que se carga una referencia, o ir enumerando los pasos en voz alta. Al usuario se le comunica el resultado, las preguntas que el flujo exija y lo que quede pendiente — no la maquinaria.
- Implementar features, migraciones o tests mientras se redacta el TK.
- Crear ADRs sin pedido explícito del usuario; solo referenciar existentes o sugerir su creación.
- Crear o editar documentos en `docs/specs/technical-docs/` directamente desde este skill; la especificación técnica se delega a `/design-define` vía subagente y aquí solo se enlaza la referencia devuelta.
- Redactar en el TK la definición de un modelo, API o flujo (tablas de campos, contratos, diagramas) en lugar de referenciar su elemento en `technical-docs/`.
- Publicar `Estado: Ready` en un stub sin criterios ni contexto técnico.
- Publicar `Estado: Ready` con pendientes en Observaciones.
- Publicar `Estado: Ready` sin el repositorio afectado en la cabecera del TK.
- Ignorar las TKs existentes en la carpeta; duplicar o contradecir su alcance.
- Inventar flujos, entidades o integraciones en lugar de preguntar.
- Usar `glossary.md` como especificación técnica o sustituto de ADR.
- Rellenar secciones con supuestos o ejemplos genéricos; dejar pendientes reales sin listar en Observaciones.
- Narrar el trabajo realizado en el mensaje al usuario; solo reportar resultados y pendientes.
- **Modo B**: crear TK desde una US en `Draft`, o sin `AC-XXX` explícitos en **Criterios de aceptación** — debe bloquear y reportar.
- **Modo B**: incluir identificadores `AC-XXX` dentro del archivo `TK-XXX.md`; la cobertura se reporta al usuario, no se documenta.
- **Modo B**: forzar un mapeo 1 tarea = 1 `AC-XXX`; las tareas se agrupan por repositorio.
- **Modo B**: redactar Plan, Dependencias o Referencias detalladas cuando el usuario eligió **stubs**.
- **Modo B**: ofrecer solo stubs en la confirmación del paso 6, u omitir alguna de las opciones `Crear los planes` / `Crear stubs` / `Cancelar`. Y al revés: añadir una opción «Otro»/«Ajustar», que la respuesta libre ya cubre.
- **Modo B**: crear stubs cuando el usuario eligió **Crear los planes**, en vez de preguntar el contexto faltante y dejar los pendientes en Observaciones.
- **Modo B**: forzar `Estado: Ready` en TK creadas con «Crear los planes» inventando Plan, Dependencias o Referencias que no se acordaron.
- Crear una TK estando en una rama de implementación distinta de la propia US padre sin advertir al usuario y preguntar `Continuar` / `Detenerme aquí` primero.
- **Modo B**: crear cualquier `TK-*.md` sin haber presentado la propuesta (paso 5) y recibido confirmación (paso 6).
- Secuenciar o presentar TKs de modo que una dependa de otra creada o ejecutada después (bloqueo hacia adelante); ver [Orden y priorización de tareas](#orden-y-priorización-de-tareas).
- Postergar la infraestructura compartida en lugar de priorizarla, retrasando la posibilidad de ejecutar tareas en paralelo.
- Exigir la ejecución de escenarios E2E como condición de `Estado: Ready` de una TK individual, en lugar de dejarla al Quality Gate previo a integrar o liberar la funcionalidad.
- Lanzar preguntas como prosa libre cuando el cliente expone una herramienta de preguntas estructuradas.

---

## Notas

### Handoffs del ciclo

Posición: **planificación** — entre `work-define` e `work-implement`.

| | |
|--|--|
| **Entrada** | US con `Estado: Ready` y **Criterios de aceptación** (`AC-XXX`) en su `README.md`. Si la US está en Draft o no tiene `AC-XXX`: **bloquear** y devolver handoff a **`work-define`**. |
| **Salida (modo B)** | Según la opción elegida en el paso 6: **Crear los planes** → `TK-XXX-*.md` completas (`Ready` las que cumplen el checklist, `Draft` las que conservan pendientes); **Crear stubs** → `TK-XXX-*.md` en `Draft`. En ambos casos, cobertura `AC-XXX` reportada al usuario. |
| **Salida para implementar** | Cada TK del alcance acordado en **`Estado: Ready`**. Stubs en Draft **no** habilitan `work-implement`. |
| **Siguiente paso** | Según `specification.testCases.mode`: **`/test-define`** sobre la US si corresponde y aún no tiene `TC-XXX`, y **`/work-implement`** — solo cuando US Ready **y** las TK a ejecutar están Ready. La implementación nunca se hace directamente desde `work-plan`. |
| **Regreso desde define** | Cambio funcional en la US → releer `README.md` y actualizar TKs afectadas antes de continuar. |
| **Regreso desde implement** | TK fuera de alcance o ambigüedad técnica → ajustar el TK aquí; no modificar el `README.md` de la US. Si el conflicto es funcional, escalar a **`work-define`**. |

### Repositorio afectado

Cada TK declara en su cabecera el **repositorio git** al que afecta (campo `Repositorio`). Es el ámbito donde se materializará el trabajo. Se infiere del repo (git remote / carpeta) o lo indica el usuario; para `Estado: Ready` es obligatorio (no `Por definir`). Un stub puede dejarlo `Por definir` hasta que se concrete.
