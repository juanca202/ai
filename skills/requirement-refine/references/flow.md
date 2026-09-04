# Flujo detallado, ejemplos y anti-patrones

Procedimiento paso a paso para **crear** y **actualizar** una Especificación de Requisitos de Software (`SRS-XXX`), más ejemplos y anti-patrones. Las anclas de calidad (`#rfc-2119`, `#categorías-de-fr-xxx`, `#categorías-de-nfr-xxx`, `#prioridad`, `#estado-por-requisito`, `#métodos-de-verificación`, `#verificabilidad`, `#definition-of-ready-dor-del-srs`) viven en [`quality-criteria.md`](quality-criteria.md).

---

## Cómo preguntar al usuario

Mecanismo, ritmo y fallback compartidos: [`../../../reference/asking.md`](../../../reference/asking.md).

**Excepción de ritmo de este skill** (ya registrada en la tabla de excepciones de `asking.md`): el **cierre de lagunas funcionales** (paso 3 del flujo de creación) se hace en **tandas de hasta 3 preguntas**, encadenando tantas como haga falta hasta agotarlas o hasta que el usuario indique que lo restante quede como Observación — igual mecánica que `work-define` al cerrar un Draft. La **pregunta inicial sobre el stack** (investigar vs. ya decidido, paso 7) es aparte: una sola pregunta de confirmación.

**Clasificación por lote, no pregunta por pregunta.** Tres pasos de este flujo evalúan **todo un conjunto ya cerrado** de una vez, en vez de preguntar elemento por elemento: la prioridad de los `FR-XXX`/`NFR-XXX` (al final del paso 3), la revisión de wireframes (paso 4) y el método de verificación de cada requisito (paso 5). En los tres casos: generar/proponer todo primero, presentarlo junto, y preguntar **una sola vez** si algo necesita ajuste.

**Inferir primero, preguntar solo si queda duda.** Varios puntos de este flujo no son preguntas obligatorias por defecto, sino inferencias que solo se convierten en pregunta cuando la inferencia es ambigua: si el requerimiento necesita UI (paso 4), si una capacidad transversal común —autenticación, roles, notificaciones, etc.— ya existe o está en el alcance de este SRS (paso 3), y el tipo de solución —web, app nativa, híbrida, responsiva— cuando sí hay UI (paso 4). En los tres casos, una inferencia razonablemente clara se registra sin preguntar (dejando constancia breve del motivo); solo la ambigüedad real dispara la pregunta estructurada.

**Orden funcional primero, técnico al final.** Salvo la excepción de abajo, las tandas de lo funcional (paso 3: alcance, actores, `FR-XXX`, `NFR-XXX`, reglas de negocio, interfaces externas, datos, cumplimiento normativo), UI (paso 4: wireframes), verificación/trazabilidad (paso 5) y riesgos (paso 6) van **antes** que las preguntas técnicas (pasos 7-10: stack, repositorios, proyecto base, equipo). El requerimiento se entiende primero en términos de qué debe hacer; el cómo se construye se resuelve después. **Excepción:** si una laguna funcional **no se puede cerrar sin una decisión técnica puntual** (p. ej. «¿la sincronización debe ser en tiempo real?» depende de si la infraestructura lo soporta), esa decisión técnica se adelanta y se pregunta ahí mismo, dentro de la tanda funcional que la necesita — no se espera al paso 7. El resto del stack, no relacionado con esa duda puntual, se sigue resolviendo en su paso correspondiente.

---

## Validación antes de crear

Antes de crear archivos, verificar:

- **Duplicado de ID:** si el usuario proporciona `SRS-XXX`, confirmar que esa carpeta no existe ya en `docs/specs/requirements/`.
- **Solapamiento de alcance:** revisar los títulos de otros SRS existentes para detectar si el mismo requerimiento ya tiene una especificación en curso. Si coincide, sugerir actualizar la existente en vez de crear una nueva.
- **Requerimiento demasiado vago:** si no hay ni siquiera un objetivo funcional identificable (una frase de qué se quiere lograr y para quién), no crear el archivo todavía — preguntar primero. Con un objetivo funcional mínimo, sí se puede crear en Draft.

Si hay conflicto de ID o solapamiento, informar al usuario y ofrecer: (a) ajustar el alcance, (b) actualizar el SRS existente, o (c) proporcionar la información faltante.

---

## Flujo: Crear un SRS nuevo

1. **Fijar el ID y nombre de carpeta**
   - Usar el `SRS-XXX` indicado por el usuario o inferir el siguiente libre listando carpetas `SRS-*` en `docs/specs/requirements/`.
   - Proponer el `nombre-corto` en kebab-case; validar con el usuario si hay ambigüedad.
   - Crear la carpeta `SRS-XXX-[nombre-corto]/` y `assets/` si habrá archivos vinculados.

2. **Capturar el requerimiento en bruto y todo su contexto de insumo**, en cualquier combinación en que el usuario lo aporte: texto, ticket, correo, transcripción de reunión, diseño o mockup, wireframes existentes, documentación técnica, diagramas, o capturas/imágenes. No hay un único formato esperado — el objetivo es reunir todo lo que da contexto para definir el alcance correctamente y sirve de insumo para las preguntas de aclaración de los pasos siguientes. **Guardarlo tal cual en `references/`** dentro de la carpeta del SRS, antes de redactar nada:
   - Texto pegado o transcrito (incluidas transcripciones de reunión) → `references/raw-requirement.md`.
   - Un archivo aportado por el usuario (captura, imagen, diagrama, PDF, export de ticket, documento técnico) → copiarlo a `references/` conservando su nombre y extensión originales.
   - Si la captura ocurre en varias vueltas (el usuario amplía o corrige el requerimiento más adelante, en creación o en una actualización posterior), **añadir** un archivo nuevo — `references/raw-requirement-02-{slug breve}.md`, incrementando — en vez de sobrescribir el original: `references/` es un registro de procedencia, nunca se edita ni se reescribe.
   - **Leer y entender cada archivo e imagen aportados antes de continuar — nunca asumir su contenido.** Esto incluye capturas, diagramas, wireframes o mockups: se leen visualmente (igual criterio que `/work-define` con sus artefactos visuales) para extraer actores, pantallas, flujos o reglas que aporten al alcance. Si al leerlos aparece una laguna, un conflicto con el texto del requerimiento, o algo no queda claro, **trasladar esa duda a la tanda de preguntas estructuradas del paso 3** en vez de inferirla o ignorarla (ver [Checklist antes de redactar](#checklist-antes-de-redactar)).
   - Enlazar cada archivo desde la sección **Enlaces y archivos de apoyo** del `README.md` (`Requerimiento original`).

3. **Cierre de lagunas funcionales**
   - Revisar, en este orden de prioridad conceptual, lo funcional del requerimiento: alcance, actores, requisitos funcionales (`FR-XXX`), no funcionales (`NFR-XXX`), reglas de negocio, interfaces externas (usuario, hardware, software, comunicaciones — a nivel de existencia y contrato mínimo, no el detalle técnico completo), requisitos de datos (qué entidades maneja, retención/privacidad, volumen estimado), cumplimiento normativo (qué normativa aplica y cómo se cumple, si el dominio lo exige — p. ej. datos personales, financieros, de salud), restricciones y supuestos. Todavía **no** se toca stack, repositorios ni proyecto base — eso va en los pasos 7-9.
   - **Inferir primero los supuestos sobre funcionalidad transversal reutilizable.** Antes de convertir cada necesidad del requerimiento en un `FR-XXX` nuevo, evaluar si depende de una capacidad común a la mayoría de aplicativos — autenticación, control de roles/permisos, notificaciones, auditoría/logging, procesamiento de pagos, almacenamiento de archivos, búsqueda, multi-tenancy, y cualquier otra capacidad transversal habitual — y si, por el contexto (menciones de un proyecto base, una plataforma compartida, un sistema ya en uso en la organización, un SSO corporativo), esa capacidad **ya existe o se reutiliza** en lugar de construirse desde cero como parte de este requerimiento. Si la inferencia es razonablemente clara, no preguntar: registrar el supuesto (capacidad, origen inferido) en la tabla de **Supuestos y dependencias** (sección 2.5) y no crear un `FR-XXX` para lo que ya está resuelto fuera del alcance de este SRS. **Preguntar solo si queda duda** — p. ej. el requerimiento menciona «login» sin aclarar si es el SSO corporativo existente o un sistema nuevo, o «notificaciones» sin aclarar si usa un servicio de mensajería ya disponible — con la herramienta estructurada, opciones `[Ya existe / se reutiliza]` / `[Está en el alcance de este SRS construirlo]`, agrupando varias capacidades ambiguas en la misma tanda cuando aplique. Si el usuario confirma que está en el alcance, sí se redacta el `FR-XXX` correspondiente como cualquier otro.
   - Formular las preguntas que cierren cada laguna detectada, en **tandas de hasta 3**, encadenando tantas como haga falta (ver [Cómo preguntar al usuario](#cómo-preguntar-al-usuario)). Opciones cortas cuando la respuesta admita categorías (categoría de `FR-XXX`/`NFR-XXX`, modalidad RFC 2119); entrada libre solo para el enunciado narrativo.
   - **Excepción — duda funcional que exige una definición técnica:** si cerrar un `FR-XXX` o `NFR-XXX` depende de una decisión técnica puntual (p. ej. si un reporte puede ser en tiempo real, si dos sistemas pueden integrarse síncronamente), preguntar esa decisión puntual **aquí mismo**, dentro de la misma tanda, en vez de diferirla al paso 8. No convertir esto en una vía para adelantar todo el stack: solo la pieza técnica estrictamente necesaria para resolver la duda funcional en curso: el resto del stack se resuelve en su paso.
   - **Prioridad, por lote al final del paso:** con los `FR-XXX`/`NFR-XXX` ya cerrados, proponer una prioridad para cada uno (ver [Prioridad](quality-criteria.md#prioridad)), presentarlas todas juntas y preguntar **una sola vez** si alguna necesita ajuste — no una pregunta de prioridad por requisito.
   - No repreguntar lo que ya esté resuelto en `references/` o en el contexto de la sesión.

4. **Diseño de interfaz: wireframes (si aplica)**
   - **Inferir primero si el requerimiento necesita interfaz gráfica** (UI): a partir del objetivo funcional, los `FR-XXX` ya cerrados (en particular los de categoría *Interacción de usuario* o *Salidas del sistema* que describan pantallas, formularios o paneles) y el tipo de repositorio/proyecto base. Casos típicos claros sin necesidad de preguntar: un servicio, API, job o integración pura (claramente sin UI); una pantalla, formulario, dashboard o portal mencionado explícitamente (claramente con UI).
   - **Preguntar solo si la inferencia queda ambigua** — p. ej. el requerimiento describe una integración que también podría exponer una pantalla de configuración, o no hay suficiente detalle para decidir — con la herramienta estructurada: *"¿Este requerimiento incluye una interfaz de usuario propia?"* — opciones `[Sí, tiene UI]` / `[No, es backend/servicio sin UI]`. Si la inferencia es clara, no preguntar: registrar la conclusión (y su motivo, brevemente) y continuar.
   - Si el resultado (inferido o preguntado) es **No**: fijar `srs:ui-required=false`, marcar la sección **Diseño de interfaz** como no aplicable (o eliminarla, ver la plantilla) y continuar al paso 5 (Verificación y trazabilidad).
   - Si el resultado (inferido o preguntado) es **Sí**:
     1. **Inferir el tipo de solución** — `Aplicación web` / `App nativa (iOS)` / `App nativa (Android)` / `App híbrida` / `Aplicación de escritorio` — y si debe ser **responsiva**, a partir de lo que el requerimiento ya deja claro: menciones explícitas («app móvil», «sitio web», «panel de administración»), el actor y su contexto de uso (p. ej. repartidores en campo → app nativa/híbrida; equipo interno en oficina → web, no necesariamente responsiva; clientes externos → web responsiva por defecto), y el stack o repositorio ya conocidos si ya se adelantaron por la excepción de duda funcional. **Preguntar solo si la inferencia queda ambigua**, con la herramienta estructurada: *"¿Qué tipo de solución es?"* — opciones `[Aplicación web]` / `[App nativa (móvil)]` / `[App híbrida]` (agregar `[Aplicación de escritorio]` solo si el contexto lo sugiere) —, y si aplica, en la misma tanda: *"¿Debe ser responsiva (adaptarse a distintos tamaños de pantalla)?"* — opciones `[Sí]` / `[No]`. Registrar el resultado en la sección 12 del SRS antes de generar ningún wireframe: el tipo de solución condiciona la navegación esperada (p. ej. tabs/gestos de app nativa vs. menú web) y el `viewBox` del SVG (retrato para móvil, ancho para web/escritorio).
     2. **Identificar todas las pantallas/vistas** necesarias a partir de los `FR-XXX` ya cerrados (en particular los de categoría *Interacción de usuario*) y de lo que el requerimiento describe; si no es evidente, preguntar directamente qué pantallas hacen falta. Resolver la lista completa antes de generar nada — no ir pantalla por pantalla.
     3. **Generar el wireframe SVG de todas las pantallas de una vez**, sin pedir feedback entre una y otra: para cada una, un archivo `assets/wireframes/[pantalla-slug].svg` con un **mockup visual de baja/media fidelidad** — proporciones razonablemente realistas de cada región y componente, contenido de ejemplo, paleta en **escala de grises** para distinguir botones/campos/texto/contenedores, tipografía genérica — **sin colores de marca, tipografía real ni medidas pixel-perfect**, coherente con el tipo de solución ya definido. **Enlazarlo** (nunca pegar el código SVG) desde su documento `assets/wireframes/[pantalla-slug].md` (ver `assets/wireframe-template.md`).
     4. **Presentar el lote completo en una sola respuesta**, no una por wireframe: listar el nombre de cada pantalla con el enlace a su documento (`assets/wireframes/[pantalla-slug].md`) y a su SVG (`assets/wireframes/[pantalla-slug].svg`) para poder abrirlos y revisarlos con facilidad. El SVG se referencia por enlace, no se pega como código en la respuesta; si el entorno donde corre el agente renderiza imágenes en markdown, incluir además la imagen embebida (`![...](ruta)`) junto al enlace.
     5. **Preguntar una sola vez, con todos los wireframes ya generados y listados**, si hay cambios: `[Aprobar todos tal cual]` / `[Hay cambios que hacer]`. Si hay más de una pantalla y el usuario elige que hay cambios, usar **selección múltiple** para que indique en qué pantalla(s) — el propio paso lo justifica, no son mutuamente excluyentes (ver [`../../../reference/asking.md`](../../../reference/asking.md)); con una sola pantalla, saltar directo al siguiente punto.
     6. **Por cada pantalla señalada**, capturar la descripción del cambio (respuesta libre) y aplicarlo: actualizar el SVG, registrar la observación y su resolución en la tabla **Historial de revisión** del propio documento `.md`, y evaluar si implica un requisito nuevo o modificado — si es así, **actualizar o crear el `FR-XXX` correspondiente** antes de continuar (nunca dejar un cambio de wireframe sin su reflejo en Requisitos funcionales).
     7. **Volver a presentar el lote actualizado** (las pantallas que cambiaron, con su SVG embebido si el entorno lo renderiza, o enlazado en caso contrario) y repetir la pregunta de aprobación hasta `[Aprobar todos tal cual]` o hasta que el usuario indique que deja algo pendiente.
     8. **Registrar el resultado** en la tabla de la sección 12 del SRS: pantalla, enlace al wireframe, estado de revisión (`Pendiente` / `Revisado con cambios` / `Aprobado`) y un resumen de qué observaciones quedaron incorporadas a qué `FR-XXX`.
   - Una pantalla que quede `Pendiente` es una laguna como cualquier otra: mantiene el SRS en Draft hasta resolverse.

5. **Verificación y trazabilidad de los requisitos**
   - Con los `FR-XXX`/`NFR-XXX` ya cerrados y priorizados, y las pantallas de UI resueltas (si aplica), completar por cada requisito: **Origen** (de dónde viene: requerimiento en bruto, pregunta al usuario, observación de wireframe), **Depende de** (otro `FR-XXX`/`NFR-XXX` del que depende, si aplica) y **Estado del requisito** (`Propuesto` / `Aprobado`, ver [Estado por requisito](quality-criteria.md#estado-por-requisito) — distinto del `Estado: Draft/Ready` del documento completo).
   - **Método de verificación, por lote:** proponer un método (`Inspección` / `Análisis` / `Demostración` / `Prueba`, ver [Métodos de verificación](quality-criteria.md#métodos-de-verificación)) para cada requisito según su naturaleza, presentarlos todos juntos y preguntar **una sola vez** si alguno necesita ajuste — no uno por uno.
   - Para cada requisito, redactar el **criterio de verificación**: cómo se comprueba que se cumplió, en términos observables y medibles (ver [Verificabilidad](quality-criteria.md#verificabilidad) — evitar términos ambiguos como «rápido», «fácil de usar» o «robusto» sin una medida concreta). Si un requisito no puede formularse de forma verificable con la información disponible, tratarlo como laguna en vez de forzar un criterio vacío o genérico.
   - Registrar todo en la tabla de la sección 13 del SRS (**Verificación y trazabilidad**): `ID`, `Origen`, `Depende de`, `Método de verificación`, `Criterio de verificación`. No duplicar el enunciado del requisito aquí — ya está en las secciones 6/7; esta tabla solo referencia el `ID`.

6. **Riesgos**
   - Identificar riesgos que puedan afectar la implementación o el resultado del requerimiento: técnicos (dependencias externas, integraciones inciertas), de alcance (ambigüedad no resuelta), de datos/privacidad, de cumplimiento normativo, de equipo o capacidad. Partir de lo ya cerrado en los pasos anteriores — no reabrir como riesgo lo que ya quedó resuelto como laguna funcional.
   - Por cada riesgo, proponer probabilidad (`Alta`/`Media`/`Baja`), impacto (`Alto`/`Medio`/`Bajo`), mitigación y, si aplica, a qué `FR-XXX`/`NFR-XXX` se relaciona.
   - **Presentar la lista propuesta y preguntar una sola vez** si falta algún riesgo o si alguno necesita ajuste — mismo patrón de lote que prioridad, wireframes y método de verificación. Ningún riesgo es bloqueante para `Estado: Ready` por sí solo; es informativo, salvo que el propio usuario decida tratarlo como una laguna abierta.
   - Registrar en la tabla de la sección 14 del SRS (**Riesgos**).

7. **Pregunta inicial: ¿investigar el stack o ya está decidido?**
   - Con lo funcional ya cerrado (salvo excepciones pendientes documentadas), lanzar **una sola pregunta** con la herramienta estructurada: *"¿Investigamos el stack tecnológico o ya tienes decidido cómo se va a construir?"* — opciones `[Investigar con /work-research]` / `[Ya lo tengo decidido]`.
   - No inferir la respuesta del tono del requerimiento ni saltarse la pregunta aunque el usuario ya haya mencionado alguna tecnología de pasada: mencionar una tecnología no es lo mismo que confirmar que el stack está cerrado.
   - Si el paso 3 ya adelantó alguna decisión técnica puntual (la excepción de duda funcional), no volver a preguntarla aquí: registrarla ya resuelta y preguntar solo por el resto del stack.

8. **Resolver el stack según la respuesta**
   - **Investigar:** delegar mediante un **subagente que invoque `/work-research`**, flujo *Investigación libre*, dominio Técnica, con el tema «elección de stack tecnológico para {{requerimiento}}» y el idioma ya resuelto (modo delegado — el subagente no vuelve a inferir idioma). Esperar el informe `RS-XXX`, enlazarlo en la sección **Stack tecnológico** con `srs:stack-mode=researched`, y resumir la recomendación (opción elegida + razón principal) sin duplicar el detalle completo del informe.
   - **Ya decidido:** preguntar directamente, por capas (frontend, backend, base de datos, infraestructura/despliegue — solo las que apliquen), qué tecnología usa cada una; registrar en la tabla de decisiones con `srs:stack-mode=decided`. Pedir la justificación solo si el usuario la da espontáneamente — no es obligatoria en modo decidido.
   - Si tras esto queda alguna capa sin resolver, anotarla en **Decisiones pendientes** de la sección Stack tecnológico; el SRS puede seguir en Draft por esto.

9. **Repositorios y proyecto base**
   - Preguntar en qué repositorio(s) git se va a materializar el requerimiento. Si el workspace tiene submódulos o repos anidados (`git submodule status`, o carpetas con su propio `.git`), presentarlos como candidatos junto a la opción de repos nuevos o externos — no inferir en silencio cuál aplica.
   - **Por cada repositorio identificado, preguntar primero si es nuevo o existente**: *"¿Este repositorio es nuevo o es uno existente sobre el que se van a hacer cambios?"* — opciones `[Repositorio nuevo]` / `[Repositorio existente, con cambios]`. No asumirlo por el nombre ni por que ya aparezca como submódulo del workspace — confirmarlo explícitamente. Registrar la respuesta en la columna **Tipo** de la tabla de la sección **Repositorios e implementación**.
   - **Si es nuevo:** preguntar si hay un proyecto base (starter, scaffold, boilerplate, plantilla interna) del que partir para implementar ahí, o si se parte desde cero; «ninguno, desde cero» es una respuesta válida y cierra la fila igual que un proyecto base concreto.
   - **Si es existente:** la columna **Proyecto base** se registra como «No aplica» — el repositorio ya tiene su propia base de código; no preguntar por un starter. Capturar en **Notas** qué módulo o área del repositorio existente se ve afectada, si el requerimiento ya lo deja claro o si el usuario lo aporta espontáneamente (no es un dato bloqueante, a diferencia del tipo de repositorio).
   - Sin al menos un repositorio identificado y con su **Tipo** resuelto, el SRS no puede declararse Ready — puede seguir en Draft.

10. **Equipo de desarrollo**
   - Preguntar con la herramienta estructurada: *"¿Ya se conoce el equipo de desarrollo que va a implementar esto?"* — opciones `[Sí, ya está definido]` / `[No, todavía no]`.
   - Si es **No**: fijar la tabla vacía (o eliminar la sección, ver la plantilla) y continuar al paso 11. No es un dato bloqueante para `Estado: Ready` — a diferencia de stack y repositorios, es informativo.
   - Si es **Sí**: pedir, por cada integrante, **nombre**, **email** y **responsabilidad** (rol dentro del equipo — p. ej. Tech Lead, Backend, Frontend, QA, Diseño); entrada libre, ya que es una lista de datos y no una elección entre opciones. Confirmar con el usuario si hay más integrantes por agregar y repetir hasta que indique que la lista está completa. Registrar cada uno como una fila de la tabla de la sección **Equipo de desarrollo**.

11. **Redactar el** `README.md` usando `assets/srs-template.md` como molde:
    - **Introducción y Descripción general:** propósito, alcance, fuera de alcance, actores, restricciones y supuestos — todo lo que el requerimiento en bruto y las respuestas del usuario ya dejaron claro, incluida la tabla de **funcionalidad transversal reutilizable** (2.5) resultado directo del paso 3.
    - **Stack tecnológico:** resultado directo del paso 8 — modo de resolución (`researched`/`decided`), tabla de decisiones por capa, decisiones pendientes si las hay.
    - **Repositorios e implementación:** resultado directo del paso 9 — un repositorio por fila, con su tipo (nuevo / existente), y su proyecto base o «ninguno, desde cero» cuando es nuevo, o «No aplica» cuando es existente.
    - **Equipo de desarrollo** (omitir la tabla, dejándola vacía, si el usuario indicó que todavía no está definido): nombre, email y responsabilidad de cada integrante, resultado directo del paso 10.
    - **Requisitos funcionales (`FR-XXX`):** tabla con id secuencial, categoría (ver [Categorías de FR-XXX](quality-criteria.md#categorías-de-fr-xxx)), prioridad (ver [Prioridad](quality-criteria.md#prioridad)), estado del requisito (ver [Estado por requisito](quality-criteria.md#estado-por-requisito)) y enunciado con palabra clave RFC 2119 en MAYÚSCULAS (ver [RFC 2119](quality-criteria.md#rfc-2119)) — incluidos los `FR-XXX` nuevos o ajustados que salieron de la revisión de wireframes en el paso 4.
    - **Requisitos no funcionales (`NFR-XXX`):** misma mecánica de tabla, categorías ISO/IEC 25010 (ver [Categorías de NFR-XXX](quality-criteria.md#categorías-de-nfr-xxx)). «No aplica» es válido si se justifica.
    - **Reglas de negocio** (`BR-XX`, opcional): solo si el dominio impone restricciones explícitas independientes de un `FR-XXX` puntual.
    - **Interfaces externas:** resultado directo del paso 3 — de usuario, hardware, software y comunicaciones, cada una en su propia subsección; omitir las que no apliquen.
    - **Requisitos de datos:** resultado directo del paso 3 — entidades de datos, retención/privacidad, volumen estimado.
    - **Cumplimiento normativo:** resultado directo del paso 3 — normativa aplicable, requisito relacionado y cómo se cumple; omitir la sección si el dominio no tiene normativa aplicable.
    - **Diseño de interfaz** (omitir la sección entera si `srs:ui-required=false`): tabla de pantallas con enlace al wireframe, estado de revisión y observaciones ya incorporadas — resultado directo del paso 4.
    - **Verificación y trazabilidad:** resultado directo del paso 5 — tabla `ID`/`Origen`/`Depende de`/`Método de verificación`/`Criterio de verificación`.
    - **Riesgos:** resultado directo del paso 6.
    - **Enlaces y archivos de apoyo:** enlazar cada archivo de `references/` guardado en el paso 2, la investigación de stack si se hizo, y la carpeta `assets/wireframes/` si aplica.
    - **Historias de usuario derivadas:** dejar la tabla vacía; se completa después del handoff a `/work-define`.
    - **Observaciones:** decisiones pendientes de stack, repositorios/proyecto base, wireframes pendientes de revisión, requisitos sin criterio de verificación formulable, lagunas funcionales o no funcionales, aclaraciones pendientes.

12. **Glosario** (si aplica): términos de dominio nuevos van a `docs/specs/glossary.md`, igual criterio que en `work-define`.

13. **Cierre**
    - Si el SRS queda en **Draft**, resumir las lagunas agrupadas por sección (`FR-XXX`, `NFR-XXX`, Interfaces externas, Requisitos de datos, Cumplimiento normativo, Wireframes, Verificación y trazabilidad, Riesgos, Stack, Repositorios, Equipo de desarrollo) y ofrecer, en la siguiente interacción, cerrar cada una con preguntas estructuradas.
    - Si el SRS queda en **Ready** (ver [Definition of Ready (DoR) del SRS](quality-criteria.md#definition-of-ready-dor-del-srs)), ofrecer explícitamente **`/work-define`** para descomponer el requerimiento en historias de usuario, pasándole el contexto completo del SRS (ruta del `README.md`, `FR-XXX` y `NFR-XXX`, repositorios, stack, equipo si está definido, wireframes si los hay). **No crear la US directamente desde este skill.**
    - **Repositorios sin harness:** por cada repositorio de la sección **Repositorios e implementación**, verificar si tiene `AGENTS.md`, `CLAUDE.md` y `.sdd-devkit/settings.json` en su raíz — un repositorio marcado **Nuevo** nunca los tiene todavía; uno **Existente** se verifica si es accesible localmente, y si no lo es, preguntar directamente al usuario. Si **alguno** de los repositorios carece del harness, agregar **`/arch-init`** como opción adicional en la misma pregunta de cierre, junto a `/work-define` — no es excluyente ni bloquea el handoff, es una sugerencia más que el usuario puede tomar antes, después o en vez de continuar con `/work-define`.

---

## Flujo: Actualizar un SRS existente

1. **Identificar el archivo** — por ID, nombre-corto o título, buscándolo en `docs/specs/requirements/`.
2. **Leer el** `README.md` **actual** completo antes de editar.
3. **Aplicar los cambios** solicitados. Reglas invariantes:
   - Mantener siempre los ids `FR-XXX`, `NFR-XXX` y `BR-XX` existentes, también al reordenar o eliminar; los nuevos toman el siguiente secuencial libre.
   - Si el cambio trae información nueva del requerimiento (no una corrección de redacción), guardarla en `references/` como un archivo adicional (ver paso 2 del flujo de creación) en vez de reescribir el original.
   - Si cambia el stack tecnológico o alguno de los repositorios, actualizar la marca oculta `srs:stack-mode` si corresponde y revisar si la tabla de **Historias de usuario derivadas** queda desalineada — avisar al usuario en ese caso en vez de corregirla por cuenta propia (esa tabla la puebla el resultado de `/work-define`, no este skill).
   - Si el usuario pide un cambio de UI sobre un wireframe ya aprobado, tratarlo como una nueva vuelta de revisión (paso 4 del flujo de creación): actualizar el wireframe, registrar la observación en su Historial de revisión y reflejar el impacto en los `FR-XXX` afectados antes de volver a marcarlo `Aprobado`.
   - Si un `FR-XXX`/`NFR-XXX` se agrega, se modifica en su enunciado, o se elimina, revisar y actualizar en consecuencia su fila en **Verificación y trazabilidad** (método y criterio pueden dejar de aplicar) y cualquier **Riesgo** que lo referencie — no dejarlos apuntando a un requisito que ya cambió de fondo.
   - Si el usuario cambia el estado a **Ready**, verificar todas las condiciones del DoR antes de guardar.
4. **Si el SRS queda en** `Estado: Draft` tras los cambios, ofrecer las preguntas que cerrarían las lagunas residuales, mismas reglas del paso 3 del flujo de creación (funcional primero, salvo que una duda funcional exija adelantar una decisión técnica puntual).
5. **Confirmar** mostrando las secciones modificadas.

---

## Checklist antes de redactar

**Información:**

- Objetivo funcional del requerimiento claro
- Requerimiento en bruto guardado en `references/` antes de redactar nada, en cualquier formato aportado (texto, transcripción, diseño, wireframes, documentación técnica, imágenes)
- **Imágenes, capturas, diagramas y wireframes aportados leídos e interpretados** (no asumidos) antes de redactar; lagunas o conflictos detectados en ellos trasladados a la tanda de preguntas del paso 3 — mismo criterio que `/work-define` con sus artefactos visuales
- Lagunas funcionales cerradas (alcance, actores, `FR-XXX`, `NFR-XXX`, reglas de negocio, interfaces externas, requisitos de datos, cumplimiento normativo) antes de tocar stack o repositorios — salvo la excepción de duda funcional que exige una definición técnica puntual
- Supuestos de funcionalidad transversal reutilizable (autenticación, roles, notificaciones, etc.) inferidos primero; preguntados solo si quedó duda; ningún `FR-XXX` creado para una capacidad ya asumida como reutilizada
- Prioridad asignada a cada `FR-XXX`/`NFR-XXX` (por lote, confirmada una sola vez)
- Necesidad de UI inferida (o preguntada si era ambigua); si es Sí: tipo de solución y responsividad inferidos (o preguntados si era ambiguo), y wireframes generados y revisados por pantalla
- Método de verificación y criterio de verificación asignados a cada requisito; verificabilidad revisada (sin términos ambiguos sin medida concreta)
- Riesgos identificados y presentados como lote, con probabilidad/impacto/mitigación
- Pregunta inicial de stack (investigar vs. decidido) ya formulada y respondida
- Repositorios identificados, con su **tipo** (nuevo / existente) resuelto explícitamente por cada uno, y proyecto base resuelto para los nuevos
- Pregunta de equipo de desarrollo («¿ya está definido?») ya formulada; si es Sí, nombre/email/responsabilidad de cada integrante registrados
- Idioma resuelto según la sección «Resolución de idioma» de `SKILL.md`
- Artefactos aportados por el usuario (tickets, correos, archivos) leídos antes de redactar

**Validación:**

- ID `SRS-XXX` sin carpeta existente (creación) o carpeta identificada (actualización)
- Sin solapamiento de alcance con SRS existentes
- Objetivo funcional identificado (mínimo para crear); si el resto no es completamente resoluble → `Estado: Draft` con lagunas en Observaciones

**Condiciones para** `Estado: Ready`**:** ver [Definition of Ready (DoR) del SRS](quality-criteria.md#definition-of-ready-dor-del-srs).

**Formato:**

- Plantilla `assets/srs-template.md` leída
- `FR-XXX`/`NFR-XXX` en tabla, con identificadores secuenciales sin saltos; categoría, prioridad y estado del requisito completos; enunciado RFC 2119 en MAYÚSCULAS
- Requerimiento en bruto en `references/` (nunca en `assets/`), enlazado desde Enlaces y archivos de apoyo
- Wireframes, si los hay, en `assets/wireframes/[pantalla-slug].md` (con `assets/wireframe-template.md`) y su `[pantalla-slug].svg` enlazado, no pegado como código; tabla en la sección Diseño de interfaz sincronizada con el estado real de cada uno
- Verificación y trazabilidad completa: todo `FR-XXX`/`NFR-XXX` con método y criterio de verificación, sin duplicar el enunciado del requisito
- Detalle técnico de modelos/APIs/flujos remitido a `design-define` cuando corresponda (no se redacta aquí; ese detalle llega después, a nivel de US o TK)

---

## Ejemplos

**Ejemplo 1 — Requerimiento crudo, stack a investigar, con UI**

- *Entrada:* «Necesitamos un portal donde nuestros proveedores puedan subir facturas y ver el estado de pago. No tenemos decidido con qué lo construimos.»
- *Comportamiento:* El agente guarda el texto en `references/raw-requirement.md` → cierra primero lo funcional en tandas de hasta 3 (alcance, actores, `FR-XXX` de carga de facturas y consulta de estado, `NFR-XXX`, interfaces externas, requisitos de datos) → **infiere los supuestos de funcionalidad transversal**: el requerimiento no menciona login, pero toda la organización usa un SSO corporativo conocido por el contexto del workspace, así que registra «Autenticación: ya existe / se reutiliza — SSO corporativo» en Supuestos y dependencias sin crear un `FR-XXX` para ello, y sin preguntar por ser una inferencia clara; en cambio, «notificaciones por email al cambiar el estado» sí queda ambiguo (¿usa el servicio de correo transaccional ya contratado, o hay que integrarlo desde cero?), así que lo incluye en la misma tanda de preguntas → asigna prioridad a cada `FR-XXX`/`NFR-XXX` por lote y la confirma en una sola pregunta → infiere que hay UI (menciona «portal» y pantallas explícitas) → **infiere el tipo de solución**: «portal» más el actor «proveedores externos» sugiere aplicación web responsiva, inferencia clara, así que la registra sin preguntar → identifica las dos pantallas (carga de facturas, estado de pago) y genera **ambos wireframes SVG de una vez** (mockup en escala de grises, con el viewBox ancho de una web responsiva) → presenta el lote completo en una sola respuesta: nombre + enlace de cada pantalla (documento y SVG), con la imagen embebida en el entorno del agente → pregunta **una sola vez** si hay cambios; el usuario indica que sí, en la pantalla de estado de pago (selección múltiple con una sola marcada), y pide moverlo a una pestaña separada → el agente actualiza ese wireframe, agrega `FR-00X` para la navegación por pestañas, y vuelve a presentar el lote actualizado hasta que el usuario aprueba ambos → asigna método y criterio de verificación a cada `FR-XXX`/`NFR-XXX` por lote → identifica riesgos (p. ej. dependencia del proveedor de pagos) y los presenta como lote → **recién entonces** pregunta investigar vs. decidido → el usuario elige `[Investigar con /work-research]` → se delega la investigación técnica vía subagente → con el `RS-XXX` devuelto, se completa Stack tecnológico → preguntas de repositorios/proyecto base → pregunta si el equipo de desarrollo ya está definido; el usuario dice que sí y da dos integrantes (nombre, email, responsabilidad) → se registran en la tabla del Equipo de desarrollo.
- *Salida:* `SRS-0XX-portal-de-proveedores/README.md` con `FR-XXX` cubriendo carga de facturas y consulta de estado (priorizados, con método y criterio de verificación), la tabla de Supuestos con la autenticación marcada como reutilizada del SSO corporativo, tipo de solución «Aplicación web, responsiva», la sección Diseño de interfaz con ambas pantallas en `Aprobado`, riesgos identificados, el stack investigado y los repositorios definidos, y el equipo de desarrollo con sus dos integrantes; `references/` y `assets/wireframes/` con sus archivos correspondientes.

**Ejemplo 2 — Duda funcional que exige una definición técnica (excepción de orden)**

- *Entrada:* «Necesitamos poder avisar a los proveedores apenas cambie el estado de su factura.»
- *Comportamiento:* Al redactar el `FR-XXX` de notificación, el agente no puede fijar el enunciado (RFC 2119) sin saber si el aviso es en tiempo real o por lotes, y eso depende de si la infraestructura ya tiene un mecanismo de eventos/colas disponible. En vez de dejar la duda abierta hasta el paso de stack, la pregunta puntual «¿el sistema ya cuenta con mensajería/eventos, o hay que evaluarlo?» se hace ahí mismo, dentro de la misma tanda funcional. Con la respuesta, se cierra el `FR-XXX` («el sistema DEBE notificar al proveedor dentro de los 5 minutos siguientes al cambio de estado») y se anota la pieza técnica ya resuelta para no repreguntarla en el paso 7. El resto del stack (frontend, base de datos, etc.) se sigue preguntando en su paso correspondiente.

**Ejemplo 3 — Stack ya decidido**

- *Entrada:* «Refina este requerimiento: agregar autenticación con SSO al backend en Node/Express que ya tenemos, usando Auth0.»
- *Comportamiento:* El agente cierra primero lo funcional (qué flujos de login, qué roles, criterios de sesión) → luego, en el paso de stack, pregunta inicial → el usuario elige `[Ya lo tengo decidido]` → se pregunta por capa solo lo que falta (ya trae backend y proveedor de auth) → se registra en la tabla de decisiones sin pasar por `/work-research` → en el paso de repositorios, aunque el requerimiento ya deja claro que el backend «ya lo tenemos», el agente **igual pregunta explícitamente** `[Repositorio nuevo]` / `[Repositorio existente, con cambios]`; el usuario confirma que es existente → se registra `Tipo: Existente (con cambios)` y `Proyecto base: No aplica` en la tabla de **Repositorios e implementación**.

**Ejemplo 4 — Falta información**

- *Entrada:* «SRS para mejorar el checkout.»
- *Comportamiento:* El agente no crea la carpeta con contenido vacío; lanza preguntas para identificar el objetivo funcional mínimo (qué problema del checkout, para quién) antes de continuar con el resto de lo funcional, la UI, el stack o los repositorios.

**Ejemplo 5 — Ready y handoff**

- *Entrada:* SRS cerrado en Ready; el usuario dice «ya, arma las historias».
- *Salida:* El agente no crea historias directamente; invoca `/work-define` pasando el contexto del SRS (ruta, `FR-XXX`/`NFR-XXX`, repositorios, stack). Toda la lógica de creación de `US-XXX` es responsabilidad de ese skill.

**Ejemplo 6 — Insumo mixto: transcripción, capturas de pantalla y un documento técnico**

- *Entrada:* El usuario pega la transcripción de una reunión de descubrimiento, adjunta dos capturas de un sistema legado que hay que reemplazar y un PDF con las políticas de retención de datos vigentes.
- *Comportamiento:* El agente guarda los tres insumos en `references/` (transcripción → `raw-requirement.md`; capturas y PDF → copiados con su nombre original) → **lee las capturas** antes de continuar: identifica en ellas las pantallas y campos del sistema legado, y detecta que una de ellas muestra un flujo de aprobación no mencionado en la transcripción → traslada esa discrepancia a la tanda de preguntas del paso 3 («la captura muestra un paso de aprobación de un supervisor que la transcripción no menciona, ¿sigue vigente?») en lugar de asumir cuál de las dos fuentes prevalece → lee el PDF de políticas de retención y lo usa directamente como insumo de la sección Cumplimiento normativo, citando la política concreta.
- *Salida:* `references/` con los tres archivos originales enlazados desde Enlaces y archivos de apoyo; `FR-XXX` que reflejan el flujo de aprobación aclarado por el usuario; sección Cumplimiento normativo con la política del PDF trazada a su `FR-XXX`/`NFR-XXX` correspondiente.

---

## Anti-patterns

- **Narrar el flujo interno**: anunciar que se resuelve el idioma, que se lee la plantilla, o ir enumerando pasos en voz alta. Al usuario se le comunica el resultado y las preguntas que el flujo exija.
- **Asumir el contenido de una imagen, captura, diagrama o wireframe aportado sin leerlo**, en lugar de interpretarlo antes de continuar — igual de grave que inventar el texto de un requerimiento no leído.
- Descartar como «fuera de formato» un insumo que no sea texto plano (transcripción de reunión, diseño, documentación técnica): cualquier insumo que dé contexto de alcance se captura y se lee, no solo el texto pegado directamente.
- Inferir la respuesta a la pregunta de stack (investigar vs. decidido) en lugar de preguntarla explícitamente, aunque el requerimiento mencione alguna tecnología de pasada.
- Investigar el stack por cuenta propia en lugar de delegarlo a `/work-research` vía subagente cuando el usuario eligió investigar.
- Preguntar por repositorio pero omitir la pregunta de proyecto base para alguno de ellos.
- Asumir que un repositorio es nuevo o existente por su nombre, por aparecer como submódulo del workspace, o porque «suena» a un proyecto conocido, en lugar de preguntarlo explícitamente por cada uno.
- Preguntar por proyecto base en un repositorio que el usuario ya declaró **existente**: esa pregunta solo aplica a repositorios nuevos; para uno existente la columna Proyecto base es «No aplica», no una pregunta pendiente.
- Redactar `FR-XXX`/`AC-XXX` de historia de usuario: este skill no crea criterios de aceptación ni US, solo requisitos de alto nivel que `work-define` descompone después.
- Documentar modelos de datos, contratos de API o diagramas en el SRS: eso es `design-define`, y llega después, a nivel de US o TK.
- Guardar el requerimiento en bruto en `assets/` en vez de `references/`, o reescribirlo/sobrescribirlo en una actualización en vez de añadir un archivo nuevo — `references/` es un registro de procedencia, no un borrador editable.
- Preguntar «¿tiene interfaz propia?» cuando ya es evidente por el requerimiento y los `FR-XXX` (gasta un turno de más); o, al revés, dar por sentado un caso ambiguo sin preguntar en lugar de reconocer la ambigüedad y confirmarlo con el usuario.
- Generar un wireframe de alta fidelidad (colores de marca, tipografía real, copy final, medidas pixel-perfect) en lugar de un mockup en escala de grises con contenido de ejemplo: ese nivel de detalle final no es responsabilidad de este skill.
- Pegar el código SVG completo dentro del documento `.md` del wireframe en lugar de guardarlo como archivo `.svg` aparte y enlazarlo — «enlazados», no incrustados como código.
- Dar solo el enlace del SVG sin la imagen embebida cuando el entorno donde corre el agente sí renderiza imágenes en markdown, dejando al usuario sin forma fácil de opinar sin abrir el archivo.
- Generar el SVG sin ajustar el `viewBox` al tipo de solución ya definido (p. ej. proporciones anchas de escritorio para una pantalla de app móvil).
- Preguntar si hay cambios **después de cada wireframe individual** en lugar de generar todas las pantallas primero y preguntar una sola vez con el lote completo ya listado (nombre + enlace de cada una).
- Al presentar el lote, omitir el enlace de alguna pantalla (documento o SVG) o mostrar la imagen sin decir a qué archivo corresponde, dificultando que el usuario la abra para revisarla con detalle.
- Recibir cambios en la revisión de un wireframe y actualizar solo el diagrama sin reflejar el impacto en los `FR-XXX` — o al revés, ajustar un `FR-XXX` por una observación de wireframe sin dejar constancia en el Historial de revisión del wireframe.
- Declarar `Estado: Ready` sin stack resuelto, sin repositorios con su tipo y proyecto base definidos, con alguna pantalla de UI todavía `Pendiente`, o con Observaciones que aún listen pendientes.
- Crear la historia de usuario directamente desde este skill al llegar a Ready, en lugar de invocar `/work-define`.
- Preguntar por stack, repositorios o proyecto base antes de cerrar lo funcional (alcance, actores, `FR-XXX`, `NFR-XXX`), salvo la excepción explícita de una duda funcional que no se puede cerrar sin una definición técnica puntual.
- Usar la excepción de duda funcional como atajo para adelantar todo el stack de una vez: solo se adelanta la pieza técnica puntual que la duda funcional necesita, no el resto.
- Omitir la pregunta de equipo de desarrollo, o pedir nombre/email/responsabilidad cuando el usuario ya indicó que todavía no está definido.
- Bloquear `Estado: Ready` por no tener el equipo de desarrollo definido: es información opcional, no una condición de la DoR.
- Preguntar la prioridad, el método de verificación o los riesgos **uno por uno**, requisito por requisito, en lugar de proponer todo el conjunto y confirmarlo en una sola pregunta.
- Redactar un criterio de verificación con términos ambiguos («debe ser rápido», «fácil de usar», «robusto») sin una medida concreta, en lugar de tratarlo como una laguna de verificabilidad hasta poder formularlo de forma comprobable.
- Duplicar el enunciado completo del `FR-XXX`/`NFR-XXX` dentro de la tabla de Verificación y trazabilidad en lugar de referenciar el `ID` — esa tabla es de seguimiento, no una copia del requisito.
- Declarar `Estado: Ready` con requisitos en Verificación y trazabilidad sin método o sin criterio de verificación, o con `FR-XXX`/`NFR-XXX` sin prioridad asignada.
- Tratar un riesgo identificado como bloqueante de `Estado: Ready` por defecto: es informativo, salvo que el usuario decida dejarlo como laguna abierta explícita.
- Crear un `FR-XXX` para una capacidad transversal común (autenticación, roles/permisos, notificaciones, auditoría, pagos, almacenamiento, búsqueda, etc.) sin antes evaluar si ya existe o se reutiliza del proyecto base o de una plataforma compartida — construir de más lo que ya está resuelto.
- Preguntar explícitamente, una por una, por cada capacidad transversal común en lugar de inferir primero y preguntar solo las que queden ambiguas.
- Asumir que el usuario quiere construir una capacidad común desde cero solo porque la mencionó, sin evaluar si el contexto (proyecto base, plataforma compartida, SSO corporativo) sugiere que ya existe.
- Preguntar el tipo de solución (web, nativa, híbrida) cuando ya es evidente por el requerimiento (gasta un turno de más); o, al revés, generar wireframes sin haberlo definido —ni por inferencia ni por pregunta— cuando el tipo de solución cambia la estructura de navegación esperada.
- Ofrecer `/arch-init` sin verificar antes si el repositorio realmente carece del harness, o al revés, no ofrecerlo cuando un repositorio nuevo (que por definición no tiene `AGENTS.md`/`CLAUDE.md`/`.sdd-devkit/settings.json`) lo necesita.
- Bloquear el handoff a `/work-define` hasta que el usuario corra `/arch-init`, o presentarlo como paso obligatorio en vez de una opción adicional en la misma pregunta.

---

## Handoffs del ciclo

Posición: **antes del inicio** del pipeline `work-define` → `work-plan` → `work-implement` → `work-integrate`. Paso previo **opcional**: un requerimiento claro puede saltar directo a `/work-define`.

|                              |                                                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entrada**                  | Un requerimiento en bruto: idea, ticket, correo o conversación, sin estructurar. No requiere SRS ni US previos.                                                                                                 |
| **Salida mínima (creación)** | Carpeta `SRS-XXX-[nombre-corto]/README.md` con objetivo funcional; puede quedar en `Estado: Draft` con lagunas en Observaciones.                                                                                |
| **Salida para continuar**    | `Estado: Ready`: stack resuelto, repositorios y proyecto base definidos, al menos un `FR-XXX` priorizado y con método/criterio de verificación, `NFR-XXX` igual de completos, interfaces externas y requisitos de datos revisados, wireframes aprobados si el requerimiento tiene UI, riesgos identificados, Observaciones sin pendientes abiertos (ver [Definition of Ready (DoR) del SRS](quality-criteria.md#definition-of-ready-dor-del-srs)). |
| **Siguiente paso**           | Con el SRS en `Ready`: invocar **`/work-define`**, pasándole el contexto completo del SRS (incluidos los wireframes aprobados y la tabla de Verificación y trazabilidad como insumo de los criterios de aceptación de las historias que correspondan), para descomponerlo en una o más historias de usuario. No crear `US-XXX` desde este skill. `work-define` tiene su propio flujo receptor (`Flujo: Descomponer un SRS-XXX en historias`) que hereda repos/wireframes/criterios en vez de repreguntarlos, y al terminar **escribe de vuelta** en la tabla **Historias de usuario derivadas** (sección 16) de este mismo `README.md` — es la única sección del SRS que se puebla después de Ready. |
| **Repositorios sin harness**  | Si algún repositorio de la sección 4 (nuevo, o existente sin `AGENTS.md`/`CLAUDE.md`/`.sdd-devkit/settings.json`) todavía no tiene el harness inicializado, ofrecer también **`/arch-init`** junto a `/work-define` en la misma pregunta de cierre — opción adicional, no bloquea ni reemplaza el handoff habitual. |
| **Si queda en Draft**        | No hay handoff a `work-define`. Cerrar lagunas con preguntas estructuradas o mantener Draft documentado.                                                                                                        |
| **Delegación a work-research** | Si el usuario elige investigar el stack → subagente con `/work-research` (Investigación libre, dominio Técnica) produce el `RS-XXX` que este skill enlaza en la sección Stack tecnológico y resume, sin duplicar su contenido. |
| **Regreso desde work-define** | Si al descomponer el SRS en historias aparece una laguna funcional que el SRS no cubría, el usuario decide si se completa aquí (actualizar el SRS) o directamente en la US — este skill no impone cuál.        |
