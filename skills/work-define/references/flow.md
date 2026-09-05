# Flujo detallado, ejemplos y anti-patrones

Procedimiento paso a paso para **crear** y **actualizar** Historias de Usuario, más ejemplos y anti-patrones. Las anclas de calidad (`#rfc-2119`, `#iso-25010`, `#invest`, `#definition-of-ready-dor`) viven en `[quality-criteria.md](quality-criteria.md)`. La entrada habitual es una necesidad funcional descrita por el usuario; también puede originarse en un `SRS-XXX` de `/requirement-refine` (ver [Flujo: Descomponer un SRS-XXX en historias](#flujo-descomponer-un-srs-xxx-en-historias)) o en una migración investigada por `work-research`.

---

## Cómo preguntar al usuario

Cuando se indique **preguntar, pedir, confirmar, validar o sugerir** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas**, en lugar de redactar la pregunta como prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2–4 por pregunta) cuando la respuesta admita categorías; usar entrada libre solo si no hay forma razonable de enumerar opciones (p. ej. el texto del valor de negocio).
- **No repreguntar** lo que ya está respondido en el contexto, en `.agents/MEMORY.md` o en el `README.md` que se está editando.
- **Recopilación inicial (antes de redactar):** el límite de **tres preguntas por bloque** es solo el tamaño de cada tanda, **no un tope al total de preguntas**. El agente debe preguntar **todo lo que necesite** hasta tener el contexto del requerimiento claro y libre de lagunas antes de redactar; si hacen falta más de tres preguntas, **encadenar tantas tandas como sea necesario** (no conformarse con una sola). La regla es agrupar los huecos en tandas —no ir descubriendo turno a turno— pero nunca omitir una pregunta necesaria por respetar el límite por bloque.
- **Confirmaciones de flujo (después de redactar o en cierre Draft):** **una pregunta por turno** cuando sea posible; si hay más de tres lagunas, encadenar tandas como en el paso 5 del flujo de creación.
- **Fallback**: si el agente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3…).

Cada sección que diga *preguntar al usuario*, *validar con el usuario* o *sugerir al usuario* asume este mecanismo.

---



## Validación antes de crear

Antes de crear archivos, verificar las siguientes condiciones. Si alguna falla, **no crear** — informar al usuario y resolver primero. La verificación de **rama de trabajo** es la excepción: no bloquea por sí sola, se resuelve preguntando al usuario (ver más abajo).

**¿Qué verificar?**

- **Duplicado de ID:** si el usuario proporciona `US-XXX`, confirmar que esa carpeta no existe **ni en `docs/specs/user-stories/` ni en `docs/archive/user-stories/`**. Un ID archivado sigue ocupado: reutilizarlo dejaría dos historias distintas bajo el mismo identificador y volvería ambiguo todo lo que las referencia (ramas, commits, work items del tracker). Ver [`work-integrate/references/archive.md`](../../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).
- **Solapamiento de alcance:** revisar los títulos y descripciones de otras US —las de `docs/specs/user-stories/` **y las de `docs/archive/user-stories/`**— para detectar si el actor + valor + alcance ya está cubierto por una historia existente. Una US archivada es trabajo **ya entregado**: si el alcance coincide, redefinirlo es duplicarlo, y hay que decírselo al usuario.
- **INVEST parcialmente valorable:** si la información recibida no permite valorar todas las dimensiones, la historia **sí puede crearse** pero con `Estado: Draft` y las lagunas documentadas en Observaciones. Solo es un bloqueante si el actor o el valor de negocio son completamente desconocidos.
- **Rama de trabajo actual:** determinar la rama git activa (`git branch --show-current`). Si coincide con el patrón de rama de implementación de una US, un WI o una automatización de pruebas (`feature/US-XXX-*`, `feature/WI-XXX-*`, `fix/WI-XXX-*`, `chore/WI-XXX-*`, `refactor/WI-XXX-*`, `test/*`), crear la historia nueva ahí la mezclaría con ese trabajo en curso. No bloquea automáticamente — ver manejo específico abajo.

**Si hay conflicto de ID o solapamiento de alcance:**

```
⚠️ No es posible crear la historia todavía:
- <razón concreta>
- [US-XXX: Título](docs/specs/user-stories/US-XXX-nombre/README.md) — <razón del solapamiento, si aplica>
```

Sugerir al usuario: (a) ajustar el alcance, (b) actualizar la US existente, o (c) proporcionar la información faltante.

**Si la rama actual es de implementación de una US o WI:**

No bloquear la creación automáticamente. Advertir al usuario mediante la **herramienta de preguntas estructuradas**:

```
⚠️ Estás en la rama `<rama-detectada>`, que parece ser la rama de implementación de <US-XXX/WI-XXX>.
Crear una historia nueva aquí puede mezclar sus archivos con ese trabajo en curso.
```

Preguntar `Continuar en esta rama` / `Detenerme aquí`. Si el usuario elige **Detenerme aquí**, no crear ningún archivo hasta que cambie a la rama base (u otra rama neutral) y lo confirme. Si elige **Continuar**, proceder con el resto del flujo normalmente.

---



## Flujo: Descomponer un SRS-XXX en historias

**Este flujo es una entrada alternativa, no la única.** La mayoría de las invocaciones de este skill siguen partiendo directo de una necesidad funcional descrita por el usuario — sin SRS de por medio — y van directo al [flujo de creación](#flujo-crear-una-historia-nueva) o al [flujo de varias historias](#flujo-proponer-varias-historias-en-una-misma-invocación). Este flujo aplica **solo** cuando la entrada es explícitamente una Especificación de Requisitos de Software (`SRS-XXX`) ya existente, producida por `/requirement-refine`: el usuario pide «arma las historias» a partir de un SRS, o invoca este skill señalando directamente su ruta. No asumir que un SRS existe ni buscarlo por cuenta propia cuando el usuario simplemente describe una necesidad — eso sigue siendo el caso por defecto.

1. **Leer el `README.md` del SRS completo** antes de proponer nada — nunca decidir el agrupamiento a partir de un resumen o de lo que el usuario recuerda del SRS. Si el SRS no está en `Estado: Ready`, avisar al usuario: se puede igual trabajar sobre un SRS en `Draft`, pero las lagunas documentadas en sus Observaciones probablemente se trasladen a las US resultantes — confirmar si prefiere cerrar el SRS primero (volviendo a `/requirement-refine`) o continuar igual.
2. **Agrupar los `FR-XXX`/`NFR-XXX` en historias candidatas.** No hay mapeo 1:1 obligatorio: varios `FR-XXX` relacionados (mismo actor, misma pantalla, mismo flujo) pueden componer una sola historia, y un `FR-XXX` amplio puede dar lugar a varios `AC-XXX` dentro de una misma historia. Usar como guía la categoría de cada `FR-XXX`/`NFR-XXX` (ver [Categorías de criterios de aceptación](quality-criteria.md#categorías-de-criterios-de-aceptación) — el SRS ya usa el mismo catálogo) y las pantallas de la sección **12. Diseño de interfaz** del SRS, si las hay: una pantalla suele ser una buena frontera de historia. Los `NFR-XXX` casi nunca forman su propia historia — se distribuyen como `AC-XXX` no funcionales dentro de la historia funcional que califican, salvo que el propio SRS ya los trate como una capacidad transversal independiente (p. ej. un `NFR-XXX` de auditoría que aplica a todo el módulo).
3. **Excluir los requisitos diferidos.** Los `FR-XXX`/`NFR-XXX` que el SRS ya registró en su sección **2.6 Requisitos diferidos a futuras versiones** no generan historia en esta pasada — anotarlo brevemente si el usuario podría esperar verlos.
4. **Si el agrupamiento produce una sola historia**, saltar directo al [flujo de creación](#flujo-crear-una-historia-nueva), aplicando el paso 5 de abajo para poblar cada campo desde el SRS. **Si produce más de una**, presentar las historias candidatas al usuario (agrupamiento propuesto + qué `FR-XXX`/`NFR-XXX` cubre cada una) con la herramienta de preguntas estructuradas antes de crear nada, y continuar con el [flujo de varias historias](#flujo-proponer-varias-historias-en-una-misma-invocación) desde su paso 2 (detección de dependencias) — el paso 1 de ese flujo (identificar candidatas) ya quedó resuelto aquí.
5. **Al redactar cada historia, heredar del SRS en lugar de volver a preguntar lo que ya resolvió:**
   - **Criterios de aceptación:** cada `FR-XXX`/`NFR-XXX` asignado a esta historia se convierte en uno o más `AC-XXX`, conservando su categoría (el catálogo es el mismo). El **criterio de verificación** de la sección 13 del SRS (Verificación y trazabilidad) es el punto de partida del enunciado del `AC-XXX` — ya describe una condición observable; solo falta darle la forma RFC 2119 si el SRS no la trae ya en esa forma. No repreguntar la condición de cumplimiento al usuario si ya está en el SRS.
   - **Reglas de negocio:** cada `BR-XX` del SRS que aplique a esta historia se copia con su mismo id y enunciado; sigue necesitando quedar verificada por al menos un `AC-XXX` de esta historia (misma regla que el flujo de creación).
   - **Referencias:** si el SRS tiene wireframes aprobados en su sección 12 relevantes a esta historia, enlazarlos directamente (documento `.md` y su SVG) en vez de preguntar por referencias de diseño — la fila **Referencias de UI** del DoR puede marcarse `Cumple` de inmediato. Enlazar también el `README.md` del propio SRS como origen del requerimiento.
   - **Repositorios:** copiar directamente de la sección **4. Repositorios e implementación** del SRS los repositorios relevantes a los `FR-XXX` de esta historia — no volver a preguntar cuáles son, salvo que el SRS deje alguno ambiguo.
   - **Contexto/Observaciones:** si el SRS trae stack ya resuelto (sección 3), equipo de desarrollo (sección 5), interfaces externas (sección 9), requisitos de datos (sección 10) o cumplimiento normativo (sección 11) relevantes a esta historia, resumirlos en **Contexto** o citarlos para justificar dimensiones de INVEST o filas del DoR — no se repiten como secciones nuevas, la US no duplica la estructura del SRS.
   - **Documentación técnica:** si algún `FR-XXX`/`NFR-XXX` de esta historia implica flujos, modelos de datos o APIs (a menudo señalado por las secciones 9-11 del SRS), aplica igual la delegación a `/design-define` del paso 3 del [flujo de creación](#flujo-crear-una-historia-nueva).
6. **Al terminar de crear todas las historias del lote, actualizar la tabla de la sección 16 (`Historias de usuario derivadas`) del `README.md` del SRS** — una fila por historia creada, con su `US-XXX`, título y los `FR-XXX` que cubre. Esta es la única escritura que este skill hace sobre un `SRS-XXX`; el resto del documento es de solo lectura para este flujo. Si no es posible editar el SRS, informar al usuario qué fila habría que agregar en vez de omitirlo en silencio.

---



## Flujo: Proponer varias historias en una misma invocación

Aplica cuando una sola invocación va a producir **más de una** US: la descomposición de un `SRS-XXX` (ver flujo anterior), la migración investigada por `work-research` (ver plantilla, sección **Migración**), o el usuario describe de una vez varias funcionalidades relacionadas y pide crearlas todas. Con una sola historia, saltar directo al [flujo de creación](#flujo-crear-una-historia-nueva).

1. **Identificar las historias candidatas** a partir de la necesidad descrita (o de la descomposición que ya trae `work-research`), cada una con su actor, valor y alcance diferenciado — sin fijar todavía IDs ni carpetas.
2. **Detectar dependencias entre ellas.** Para cada candidata: ¿necesita que otra de la misma tanda ya exista o esté definida para poder redactar sus criterios de aceptación o su DoR? Casos típicos: una historia de infraestructura o modelo de datos compartido que las demás dan por sentado; autenticación/autorización de la que depende toda historia que exponga funcionalidad protegida; una historia que expone una API que otra consume.
3. **Ordenar la propuesta:** primero las historias **sin dependencias dentro de la tanda** — incluida toda historia de infraestructura o base (configuración, modelos compartidos, autenticación, integraciones transversales) —, después las que dependen de alguna anterior, en el orden que sus dependencias permitan (orden topológico). Entre historias mutuamente independientes, el orden no importa.
4. **Presentar la lista ordenada al usuario** —con la dependencia detectada de cada una, si tiene— mediante la herramienta de preguntas estructuradas, antes de crear ningún archivo. Confirmar el orden o aplicar el ajuste que pida y volver a mostrarlo.
5. **Asignar los `US-XXX` en el orden ya confirmado**, no en el orden en que el usuario las mencionó: así cada historia dependiente cita el `US-XXX` real —ya creado— de su prerrequisito, en vez de una referencia provisional.
6. **Crear cada historia siguiendo el [flujo de creación](#flujo-crear-una-historia-nueva)**, en el orden confirmado. En la fila **Dependencias listas** del DoR y en Observaciones, cada historia dependiente enlaza el `US-XXX` de su prerrequisito (`[US-0XX: Título](../US-0XX-slug/README.md)`) en vez de describir la dependencia en prosa suelta.
7. **Cerrar los Draft del lote en conjunto.** Terminada la creación, si **más de una** historia quedó en `Estado: Draft`, no cerrar sus lagunas historia por historia: reunir las preguntas de **todas** las historias Draft del lote en tandas de **hasta 3 preguntas** —el mismo límite por bloque del [paso 5 del flujo de creación](#flujo-crear-una-historia-nueva)—, agrupadas por historia para que quede claro a cuál pertenece cada una, y presentarlas con la herramienta de preguntas estructuradas. Encadenar tantas tandas como haga falta mientras sigan quedando lagunas relevantes. Al agotar la batería —el usuario respondió todo lo que iba a responder, o indicó que prefiere dejar el resto pendiente—: revalidar INVEST y DoR de **cada** historia por separado y promover a `Estado: Ready` las que queden completas; las que conserven lagunas se quedan en `Draft` con el residual en Observaciones. Es normal que el lote quede mixto.

> **Por qué el orden importa aquí y no en `work-plan`.** Ahí la agrupación de `TK-XXX` es por repositorio, no por dependencia entre historias — cada tarea vive dentro de su propia US ya definida. Aquí, en cambio, una US completa puede depender de que otra ya exista con su alcance cerrado: escribir primero la de infraestructura o la que no depende de nada le da a las siguientes un `US-XXX` real que citar, en vez de una promesa.

---



## Flujo: Crear una historia nueva

1. **Fijar el ID y nombre de carpeta**
  - Usar el `US-XXX` indicado por el usuario o inferir el siguiente libre listando carpetas `US-*` **en `docs/specs/user-stories/` y en `docs/archive/user-stories/`**, tomando el mayor de las dos: archivar no libera el número.
  - Proponer el `nombre-corto` en kebab-case; validar con el usuario si hay ambigüedad.
  - Crear la carpeta `US-XXX-[nombre-corto]/` y `assets/` si habrá archivos vinculados.
2. **Escribir el** `README.md` usando `assets/user-story-template.md` como molde:
  - **Descripción:** Como/Quiero/Para con modalidad normativa RFC 2119 (ver [RFC 2119](quality-criteria.md#rfc-2119)) en el idioma de preferencia.
  - **Reglas de negocio** (sección opcional — incluir solo si el dominio impone restricciones, obligaciones o prohibiciones explícitas; omitir si no aplica): cada regla lleva id secuencial `BR-01`, `BR-02`, … con enunciado RFC 2119 en MAYÚSCULAS. **Excepción:** las `BR-XX` heredadas de un `SRS-XXX` conservan su id de origen para no romper la trazabilidad con el SRS — en una US derivada pueden quedar saltos en la numeración, y las reglas nuevas propias de la US toman el siguiente id libre que no colisione con las heredadas. **Cada `BR-XX` declarada debe quedar verificada por al menos un `AC-XXX`** de la sección Criterios de aceptación (anotar `→ verificado por AC-XXX` junto a la regla); si al redactar los criterios alguna `BR-XX` queda sin ningún `AC-XXX` que la verifique, es una laguna — cerrarla con una pregunta o registrarla en Observaciones, nunca dejarla sin verificar.
  - **Migración** (sección opcional — incluir solo si esta US materializa (total o parcialmente) una migración entre proyectos investigada por `work-research` y dimensionada como cambio grande; omitir si no aplica): enlazar la investigación (`research/RS-XXX-{slug}/README.md`), origen y destino. La sección completa —incluida la referencia a `discovery.md`/`validation.md`— vive en la plantilla; el mapeo `AC-XXX` → `GM-XXX` (Golden Master) se detalla a nivel de `TK-XXX` en `work-plan`, no aquí.
  - **Referencias:** enlaces de diseño y archivos en `assets/`; los archivos aportados no deben quedar solo en el chat. Si el requerimiento trae imágenes, enlaces a Figma o archivos `.md` con diagramas, wireframes o prototipos, **leerlos primero** para incorporarlos al contexto; ante lagunas, conflictos o falta de claridad detectados en ellos, trasladar esas dudas a la tanda de preguntas estructuradas antes de redactar (ver [Checklist antes de redactar](#checklist-antes-de-redactar)).
  - **Criterios de aceptación** (lista plana con ids `AC-XXX`):
    - Cada criterio usa id secuencial **AC-001**, **AC-002**, … único en el ámbito de la US. **El id es inmutable una vez publicado:** no se renumera al reordenar ni al eliminar criterios — se asigna el siguiente libre a los nuevos y se marca el eliminado como obsoleto en su propio enunciado. El id es un **contrato de enlace**: `test-define` lo cita verbatim en cada `TC-XXX`, la línea `Casos de prueba:` cuelga de él y todos los `coverage.md` lo cruzan literalmente; renumerar rompe esas tres cosas en silencio. Es la misma doctrina que aplica `design-define` a los ids de sus elementos.
    - La categoría va entre paréntesis inmediatamente después del id (ver [Categorías de criterios de aceptación](quality-criteria.md#categorías-de-criterios-de-aceptación)): categorías funcionales (Reglas de negocio, Casos de uso, Flujos de proceso, Procesamiento de datos, Integraciones, Interacción de usuario, Salidas del sistema) o una característica ISO/IEC 25010 para criterios no funcionales.
    - El enunciado usa palabra clave normativa RFC 2119 en MAYÚSCULAS en el idioma de preferencia (**DEBE**, **NO DEBE**, **DEBERÍA**, etc.). Ver [RFC 2119](quality-criteria.md#rfc-2119).
  - **Repositorios:** nombre(s) del/los repositorio(s) git al/los que afecta la historia (p. ej. `frontend-web`, `api-catalogo`, o `micro-autenticacion`, `micro-catalogo`). Es la referencia de dónde se materializará el trabajo; `work-plan` la usa para agrupar las tareas por repositorio. Aquí solo se nombran; no se detalla el alcance de cada uno.
  - **Complejidad sugerida:** story points solo en valores Fibonacci 1, 2, 3, 5, 8, 13 con justificación breve de alcance, riesgo e incertidumbre.
  - **Validación — INVEST:** tabla con las seis dimensiones (I, N, V, E, S, T); valor de cada una: `Cumple` / `No cumple` / `Parcial` con nota. Si alguna dimensión falla, documentarlo sin disimular (ver [INVEST](quality-criteria.md#invest)).
  - **Validación — Definition of Ready (DoR):** tabla con los seis criterios de la plantilla. Para cada uno: `Cumple` / `No cumple` / `Parcial` (el criterio **Referencias de UI** admite además `No aplica`). Ver criterios exactos en [Definition of Ready (DoR)](quality-criteria.md#definition-of-ready-dor).
  - **Observaciones:** (1) prerrequisitos o dependencias aún no listas; (2) datos o aclaraciones pendientes del usuario o producto; (3) decisiones pendientes; (4) otras notas. Si no hay nada que reportar en algún ítem, dejarlo vacío.
3. **Documentación técnica** (delegada a `design-define`)
  - **Detectar la necesidad:** si el requerimiento define o modifica **flujos, modelos de datos o APIs** (nuevos o existentes), la especificación técnica de esos elementos debe existir en `docs/specs/technical-docs/`. También aplica si el usuario la pide explícitamente.
  - **Nunca crear ni editar documentos técnicos desde este skill.** Delegar mediante un **subagente que invoque `/design-define`**, pasándole: el texto relevante de la US (descripción, reglas, criterios), la capability inferida si se conoce, la ruta del `README.md` de la US y el idioma resuelto. El grilling técnico (tipos, contratos, ramas de flujo) es responsabilidad de `design-define`.
  - **Enlazar las referencias devueltas:** el subagente responde con la lista de elementos creados/actualizados (ruta + ancla, p. ej. `docs/specs/technical-docs/facturacion.md#api-01`). Agregarlas a la sección **Referencias** del `README.md` de la US **copiando el ancla tal cual**: es siempre `#<id en minúsculas>`, la que `design-define` emite de forma explícita en el documento. No recomponerla a partir del nombre del elemento (`#api-01-crear-factura` no existe) ni «mejorarla». Si el subagente reporta lagunas técnicas pendientes, reflejarlas en Observaciones de la US.
  - **No integrarla en la descripción funcional** de la US. Además de Referencias, solo puede citarse desde las secciones INVEST u Observaciones del DoR para justificar complejidad, dependencias o restricciones técnicas que condicionan algún criterio (p. ej. *«Ver* `technical-docs/facturacion.md#api-01` *— justifica la estimación de la dimensión E»*).
4. **Glosario** (si aplica)
  - Si aparecen términos de dominio nuevos, crear o reutilizar entrada en `docs/specs/glossary.md` con definición breve en contexto producto/dominio.
5. **Cierre**
  - Si la US queda en **Draft**, identificar las lagunas documentadas en Observaciones (datos faltantes, dependencias sin confirmar, dimensiones de INVEST en `Parcial` o `No cumple`, criterios del DoR sin satisfacer) y ofrecer al usuario, mediante la **herramienta de preguntas estructuradas**, las preguntas concretas que cerrarían cada laguna. Reglas:
    - Una pregunta por laguna, con opciones cuando la respuesta admita categorías (formato, prioridad, dependencias enumerables, story points Fibonacci); entrada libre solo para campos narrativos (refinamiento del valor, reglas nuevas, criterios verificables).
    - Respetar el máximo de tres preguntas por bloque; si hay más lagunas, encadenar tandas hasta agotarlas o hasta que el usuario indique que prefiere mantener el resto como Draft.
    - Tras recibir respuestas, actualizar las secciones afectadas del `README.md`, revalidar los checklists de INVEST y DoR, y promover a `Estado: Ready` solo si quedan completos. Si alguna laguna sigue abierta, mantener `Draft` y reflejar el residual en Observaciones.
  - Si la US queda en **Ready**, resolver los casos de prueba según `specification.testCases.mode` (ver [`../../../reference/planning.md`](../../../reference/planning.md)) y sugerir planificar tareas:
    - **`ask`** (o sin `settings.json`, comportamiento por defecto): sugerir explícitamente al usuario dos próximos pasos posibles: **[Definir casos de prueba]** o **[Planificar tareas]**. Si el usuario acepta definir los casos de prueba: **invocar** `/test-define` pasando el contexto de la US; no crear los `TC-XXX` directamente desde este skill. Su formato y reglas residen en ese skill.
    - **`always`**: **invocar** `/test-define` directamente, sin preguntar, pasando el contexto de la US. Ofrecer igual el paso de planificar tareas.
    - **`never`**: no sugerir ni invocar `/test-define`. Ofrecer solo el paso de planificar tareas.
    - En cualquiera de los tres casos, si el usuario pide crear las tareas en continuidad o en el mismo turno: **invocar** `/work-plan` **obligatoriamente**; no crear tareas directamente desde este skill. El conocimiento y las reglas de formato de los `TK-XXX` residen en ese skill.
    - **Repositorios sin harness:** por cada repositorio de la sección **Repositorios**, verificar si tiene `AGENTS.md`, `CLAUDE.md` y `.sdd-devkit/settings.json` en su raíz — un repositorio nuevo (sin código todavía) nunca los tiene; uno existente se verifica si es accesible localmente, y si no lo es, preguntar directamente al usuario. Si **alguno** carece del harness, agregar **`/arch-init`** como opción adicional en la misma pregunta de próximos pasos (junto a `/test-define`/`/work-plan`, cualquiera sea la rama de `testCases.mode` aplicada) — no es excluyente ni bloquea el handoff habitual, es una sugerencia más.

---



## Flujo: Actualizar una historia existente

1. **Identificar el archivo** — por ID, nombre-corto o título. Si no aparece en `docs/specs/user-stories/`, buscarlo bajo `docs/archive/user-stories/` antes de darlo por inexistente. **Si está archivado, parar y avisar:** la historia ya se cerró e integró, y modificarla exige desarchivarla primero —mover su carpeta de vuelta—, decisión que es del usuario. **Nunca** crear una carpeta nueva en la ruta activa por no haber encontrado la historia.
2. **Leer el** `README.md` **actual** completo antes de editar.
3. **Aplicar los cambios** solicitados por el usuario. Reglas invariantes:
  - Si el cambio afecta criterios de aceptación: **mantener siempre los ids `AC-XXX` existentes**, también al reordenar o eliminar (ver la regla de inmutabilidad arriba); los nuevos toman el siguiente secuencial libre. Conservar o corregir la categoría entre paréntesis.
  - **Si se modifica el enunciado de un criterio que ya tiene TCs** (tiene una línea `Casos de prueba:` debajo), avisar al usuario de que esos TCs quedan desalineados y sugerir pasar por `test-define` en su [flujo de actualización](../../test-define/SKILL.md#flujo-actualizar-tcs-existentes). No editar los TCs desde aquí.
  - Si hay conflicto entre el texto de un `TK-XXX` y el `README.md` de la US: **la US prevalece**. Corregir las tareas, no la historia.
  - Si el usuario cambia el estado a **Ready**: verificar todas las condiciones del checklist de Ready antes de guardar.
4. **Criterios de aceptación:** si se añaden o modifican, aplicar las mismas reglas de formato del flujo de creación (paso 2).
5. **Si la US queda en** `Estado: Draft` tras los cambios (sea porque ya lo estaba, sea porque los cambios la degradaron desde Ready), ofrecer al usuario las preguntas que cerrarían las lagunas residuales mediante la **herramienta de preguntas estructuradas**, aplicando las mismas reglas del paso 5 del flujo de creación (una pregunta por laguna, opciones cuando la respuesta admita categorías, máximo tres por bloque, encadenar tandas si hace falta). Si las respuestas completan los checklists de INVEST y DoR, promover a `Estado: Ready`. Si el usuario prefiere mantener Draft o salta preguntas, respetarlo y reflejar el residual en Observaciones.
6. **Confirmar** mostrando las secciones modificadas.

---



## Checklist antes de redactar

**Información:**

- Actor y valor de negocio claros
- Reglas de negocio con suficiente detalle para valorar INVEST
- Idioma resuelto según la sección «Resolución de idioma» de `SKILL.md`
- Si es US de UI: referencias de diseño presentes o acordadas
- Dependencias con otras US o sistemas identificadas
- **Artefactos visuales del requerimiento leídos:** si el requerimiento incluye imágenes, enlaces a Figma, o archivos `.md` con diagramas, wireframes o prototipos, **leerlos y cargarlos en el contexto antes de redactar** (no asumir su contenido). Si al revisarlos aparecen lagunas, conflictos con el texto del requerimiento, o algo no queda del todo claro, **incluir esas dudas en las preguntas estructuradas** (recopilación inicial, en tandas de máximo tres por bloque pero **sin limitar el total**: encadenar tandas hasta resolver toda laguna) en lugar de inventar o inferir
- **Si el origen es un `SRS-XXX`** (ver [Flujo: Descomponer un SRS-XXX en historias](#flujo-descomponer-un-srs-xxx-en-historias)): `README.md` del SRS leído completo, agrupamiento de `FR-XXX`/`NFR-XXX` en historias candidatas resuelto, y repositorios/referencias de diseño/criterios de verificación heredados del SRS en vez de repreguntados

**Validación:**

- ID `US-XXX` sin carpeta existente (creación) o carpeta identificada (actualización)
- Sin solapamiento de alcance con US existentes
- Actor y valor de negocio identificados (mínimo para crear); si INVEST no es completamente valorable → `Estado: Draft` con lagunas en Observaciones
- Rama de trabajo actual verificada; si es una rama de implementación de otra US o WI, se advirtió al usuario y se preguntó `Continuar` / `Detenerme aquí` antes de crear

**Condiciones para** `Estado: Ready`**:**

- Sección **Criterios de aceptación** completa: al menos un `AC-XXX` con categoría entre paréntesis y enunciado RFC 2119 en MAYÚSCULAS
- Si hay **Reglas de negocio** (`BR-XX`) declaradas: cada una verificada por al menos un `AC-XXX` — ninguna `BR-XX` sin su `AC-XXX` correspondiente
- DoR completado según la plantilla
- Repositorios afectados identificados
- Observaciones sin aclaraciones ni pendientes abiertos

**Formato:**

- Plantilla `assets/user-story-template.md` leída
- Criterios de aceptación con identificadores `AC-001`, `AC-002`, … sin saltos; categoría entre paréntesis (funcional o ISO 25010); enunciado con palabra clave RFC 2119 en MAYÚSCULAS
- Palabras clave normativas en MAYÚSCULAS en el idioma de preferencia (DEBE, NO DEBE, DEBERÍA…)
- Archivos del usuario guardados en `assets/` y enlazados con ruta relativa
- Detalle técnico en `technical-docs/` o `TK-XXX`, no en el `README.md`

---



## Ejemplos

**Ejemplo 1 — Entrada mínima viable**

- *Entrada:* «US nueva: como farmacéutico quiero ver alertas de interacción al añadir un medicamento a la receta, para evitar recetas inseguras. Reglas: mostrar alerta antes de guardar; permitir continuar con justificación.»
- *Salida:* Carpeta `US-0XX-alertas-interaccion-receta/` con `README.md` completo (Como/Quiero/Para, AC-001 y AC-002 con categoría y enunciado RFC 2119, INVEST y DoR completados, story points con justificación).

**Ejemplo 2 — Falta información**

- *Entrada:* «Historia de exportar informes.»
- *Comportamiento:* El agente no crea carpetas; lanza una tanda de preguntas mediante la **herramienta de preguntas estructuradas** (quién exporta, formatos admitidos, permisos, qué se entiende por "informe", criterios verificables) con opciones cuando aplique. Solo procede a redactar cuando puede valorar INVEST y tiene al menos un `AC-XXX` verificable.

**Ejemplo 3 — Historia con UI**

- *Entrada:* Historia con enlace a Figma y capturas en `assets/`.
- *Salida:* `README.md` con sección Referencias completa; fila Referencias de UI en DoR en `Cumple` o `Parcial` con notas; `Estado: Ready` solo si los criterios `AC-XXX` y el DoR lo permiten.

**Ejemplo 4 — Descomposición de un `SRS-XXX`**

- *Entrada:* SRS cerrado en Ready (`SRS-003-portal-de-proveedores`) con 5 `FR-XXX` (carga de facturas, consulta de estado, notificación por email, exportar historial, gestión de usuarios del portal) y 2 pantallas aprobadas; el usuario dice «ya, arma las historias».
- *Comportamiento:* El agente lee el `README.md` completo del SRS → agrupa los `FR-XXX` en tres historias candidatas por pantalla/actor (carga y consulta de facturas — pantalla 1; notificaciones — capacidad transversal a la anterior; gestión de usuarios — pantalla 2, sin dependencias) → detecta que «notificaciones» depende de que exista «carga y consulta» → presenta el agrupamiento y el orden al usuario, quien lo confirma → crea las tres US en ese orden, heredando de cada `FR-XXX` su criterio de verificación (sección 13 del SRS) como base del `AC-XXX`, los repositorios de la sección 4, y los wireframes aprobados de la sección 12 como Referencias (DoR **Referencias de UI** en `Cumple` de inmediato) → al terminar, actualiza la tabla **Historias de usuario derivadas** (sección 16) del SRS con las tres `US-XXX` y qué `FR-XXX` cubre cada una.
- *Salida:* Tres carpetas `US-XXX-.../README.md`, todas con `AC-XXX` trazables a su `FR-XXX` de origen; el SRS actualizado registrando la descomposición.

**Ejemplo 5 — Ready y tareas**

- *Entrada:* Historia cerrada en Ready; el usuario dice: «crea las tareas para implementarla».
- *Salida:* El agente no crea tareas directamente; invoca `/work-plan` pasando el contexto de la US. Toda la lógica de creación de `TK-XXX` (propuesta, elección entre planes completos o stubs, plantilla, agrupación por repositorio) es responsabilidad de ese skill.

**Ejemplo 6 — Draft con cierre asistido**

- *Entrada:* «US nueva: como analista quiero descargar el reporte mensual de ventas en CSV para procesarlo localmente.» Hay actor y valor, pero no se conocen story points, dependencias ni si existen referencias de UI.
- *Comportamiento:* El agente crea `US-0XX-descarga-reporte-mensual-csv/` con `Estado: Draft`, documenta las lagunas en Observaciones, y en el cierre lanza una tanda de preguntas estructuradas:
  - "¿Story points (Fibonacci)?" → Opciones: [1] / [2] / [3] / [5] (con `8`/`13` accesibles si pide más).
  - "¿Hay dependencias con otra US o sistema?" → Opciones: [Ninguna] / [Otra US del backlog] / [Sistema externo].
  - "¿La historia involucra UI propia?" → Opciones: [Sí, tengo Figma] / [Sí, sin referencias aún] / [No, solo backend].
- *Resultado:* Con las respuestas, el agente actualiza el `README.md`, revalida INVEST y DoR, y promueve a `Estado: Ready` si los checklists quedan completos. Si el usuario salta una pregunta o queda residual, la US permanece en Draft con la nota correspondiente.

---



## Anti-patterns

- **Narrar el flujo interno**: anunciar que se resuelve el idioma o la política, que se lee `settings.json`, que se carga una referencia, o ir enumerando los pasos en voz alta. Al usuario se le comunica el resultado, las preguntas que el flujo exija y lo que quede pendiente — no la maquinaria.
- Inventar reglas de negocio o exclusiones que el usuario no dio.
- Poner detalle técnico (clases, endpoints, esquemas) en el `README.md` en lugar de remitirlo a `technical-docs/` o `TK-XXX`.
- Declarar `Estado: Ready` sin Criterios de aceptación completo o sin referencias de diseño cuando la historia involucra UI.
- Declarar `Estado: Ready` con Observaciones que aún listen aclaraciones o pendientes sin resolver.
- Resolver un conflicto entre `TK-XXX` y el `README.md` de la US degradando la US; la US prevalece.
- Crear tareas `TK-XXX` directamente desde este skill sin invocar `/work-plan`; la creación de tareas siempre se delega a ese skill.
- Crear o editar documentos en `docs/specs/technical-docs/` directamente desde este skill; la documentación técnica siempre se delega a `/design-define` vía subagente, y aquí solo se enlazan las referencias devueltas.
- Redactar la US sin delegar a `/design-define` cuando el requerimiento define flujos, modelos o APIs; la US quedaría sin su referencia técnica de implementación.
- Copiar `assets/user-story-template.md` al repo del producto como artefacto en lugar de usarlo como molde.
- Lanzar preguntas al usuario como prosa libre cuando el cliente expone una herramienta de preguntas estructuradas; o ir descubriendo huecos turno a turno en lugar de agruparlos en tandas al inicio. (Encadenar **varias** tandas sí es correcto cuando hay más de tres lagunas — el límite es por bloque, no un tope al total.)
- Crear una historia nueva estando en la rama de implementación de otra US o WI sin advertir al usuario y preguntar `Continuar` / `Detenerme aquí` primero.
- Al proponer **varias** historias en la misma invocación, crearlas en el orden en que el usuario las mencionó (o el que resulte más cómodo) en vez de detectar sus dependencias y anteponer la infraestructura y las que no dependen de ninguna otra de la tanda.
- Asignar los `US-XXX` de un lote antes de confirmar el orden, o dejar que una historia dependiente cite una referencia provisional a otra que todavía no tiene id, en vez de crear primero el prerrequisito.
- Cerrar los Draft de un lote de varias historias historia por historia, con una tanda separada para cada una, en vez de agrupar las preguntas de todas las historias Draft del lote en las mismas tandas de hasta 3.
- Asumir que existe un `SRS-XXX` y buscarlo por cuenta propia cuando el usuario simplemente describe una necesidad sin mencionar uno — el flujo de descomposición de SRS es una entrada alternativa, no el camino por defecto.
- Al descomponer un `SRS-XXX`, mapear cada `FR-XXX` 1:1 a una historia sin evaluar si varios `FR-XXX` relacionados (mismo actor, misma pantalla) deberían agruparse en una sola.
- Volver a preguntar por repositorios, referencias de diseño o el enunciado del criterio de aceptación cuando el SRS de origen ya los trae resueltos — heredarlos, no repreguntarlos.
- Terminar de crear las historias derivadas de un `SRS-XXX` sin actualizar su tabla de **Historias de usuario derivadas** (sección 16), dejando el SRS desactualizado sobre qué ya se descompuso.
- Ofrecer `/arch-init` sin verificar antes si el repositorio realmente carece del harness, o al revés, no ofrecerlo cuando un repositorio nuevo (que por definición no tiene `AGENTS.md`/`CLAUDE.md`/`.sdd-devkit/settings.json`) lo necesita.
- Bloquear el handoff a `/test-define`/`/work-plan` hasta que el usuario corra `/arch-init`, o presentarlo como paso obligatorio en vez de una opción adicional en la misma pregunta de cierre.

---



## Handoffs del ciclo

Posición: **inicio** del pipeline `work-define` → `work-plan` → `work-implement` → `work-integrate`.


|                              |                                                                                                                                                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entrada**                  | Necesidad funcional del usuario (caso por defecto). No requiere US previa. También puede originarse en un `SRS-XXX` de `/requirement-refine` — preferentemente en `Estado: Ready`; uno en `Draft` se acepta con aviso y sus lagunas tienden a trasladarse a las US (ver el paso 1 del [Flujo: Descomponer un SRS-XXX en historias](#flujo-descomponer-un-srs-xxx-en-historias)) — o en una investigación de migración (`RS-XXX` de `work-research`, flujo «Analizar migración») dimensionada como cambio grande y descompuesta en varias US — ver sección **Migración** de la plantilla y el [flujo de varias historias](#flujo-proponer-varias-historias-en-una-misma-invocación) para su orden de creación.                          |
| **Origen: requirement-refine** | Si el lote proviene de un `SRS-XXX`, al terminar de crear las US se actualiza la tabla **Historias de usuario derivadas** (sección 16) del `README.md` del SRS con cada `US-XXX`, su título y los `FR-XXX` que cubre — es la única escritura de este skill sobre un SRS; el resto del documento queda de solo lectura. |
| **Salida mínima (creación)** | Carpeta `US-XXX-[nombre-corto]/README.md` con actor y valor de negocio; puede quedar en `Estado: Draft` con lagunas en Observaciones.                                                                                                                                                        |
| **Salida para continuar**    | `Estado: Ready` en el `README.md`; INVEST y DoR completos; al menos un `AC-XXX`; Observaciones sin pendientes abiertos.                                                                                                                                                                      |
| **Siguiente paso**           | Con la US en `Ready`: `test-define` — según `specification.testCases.mode`, invocar `/test-define` directo (`always`), solo si el usuario acepta (`ask`, por defecto) o no ofrecerlo (`never`) — no crear `TC-XXX` desde este skill; y `work-plan` — invocar `/work-plan` para las tareas (o continuidad explícita del usuario), sin condicionar a `specification.testCases.mode`. No crear `TK-XXX` desde este skill. |
| **Repositorios sin harness**  | Si algún repositorio de la sección **Repositorios** (nuevo, o existente sin `AGENTS.md`/`CLAUDE.md`/`.sdd-devkit/settings.json`) todavía no tiene el harness inicializado, ofrecer también **`/arch-init`** junto a `/test-define`/`/work-plan` en la misma pregunta de cierre — opción adicional, no bloquea ni reemplaza el handoff habitual. |
| **Si queda en Draft**        | No handoff a plan ni implement. Cerrar lagunas con preguntas estructuradas o mantener Draft documentado.                                                                                                                                                                                     |
| **Regreso a requirement-refine** | Si al descomponer un `SRS-XXX` aparece una laguna funcional que el SRS no cubría, el usuario decide dónde cerrarla: actualizar el SRS (volviendo a `/requirement-refine`) o resolverla directamente en la US con las preguntas de este skill — este skill no impone cuál, pero nunca la resuelve inventando; si se cierra solo en la US, anotarlo en sus Observaciones para que el SRS no parezca la fuente completa. |
| **Regreso desde plan**       | Conflicto US ↔ TK detectado en `work-plan` → actualizar la US aquí; `work-plan` corrige el TK. La US prevalece sobre el TK.                                                                                                                                                                  |
| **Regreso desde integrate**  | Alcance reducido o `progress.md` incompleto detectado en `work-integrate` → ajustar la US aquí y alinear TKs con `work-plan` antes de reintentar el merge.                                                                                                                                   |
| **Delegación a design-define** | Requerimiento que define flujos, modelos o APIs → subagente con `/design-define` crea/actualiza `docs/specs/technical-docs/[capability].md` y devuelve las referencias (ruta + ancla) que este skill agrega a Referencias de la US. `design-define` **no** tiene, en modo delegado, ningún canal para reportar de vuelta inconsistencias detectadas en la US — su contrato de retorno es solo la lista de referencias. Si el grilling de `design-define` (dirigido al usuario incluso en modo delegado) revela una inconsistencia, es el usuario quien la trae de vuelta aquí para corregirla; el documento técnico nunca redefine la historia por su cuenta.                                                                                                                                   |


