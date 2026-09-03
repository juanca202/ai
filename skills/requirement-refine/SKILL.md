---
name: requirement-refine
description: "Tomar un requerimiento en bruto (idea, ticket, correo, transcripción, diseño, wireframes) y estructurarlo como una Especificación de Requisitos de Software (SRS-XXX) siguiendo ISO/IEC/IEEE 29148: alcance, FR-XXX y NFR-XXX priorizados y verificables, interfaces externas, datos, cumplimiento normativo, riesgos, stack (investigar con /work-research o ya decidido), repositorios y proyecto base, equipo. Lee y entiende imágenes y diagramas adjuntos, como /work-define. Guarda el requerimiento original en references/; si tiene UI, genera wireframes SVG enlazados para revisión y usa las observaciones para cerrar el SRS. Cierra lagunas con preguntas estructuradas como /work-define o /work-plan. Activar con «refina este requerimiento», «crea un SRS», «especificación de requisitos», «/requirement-refine», o al describir una necesidad cruda antes de historias de usuario. No crea US ni AC-XXX (handoff a /work-define en Ready) ni documentación técnica de modelos/APIs (eso es /design-define)."
license: MIT
---

# Skill: Especificación de requisitos (SRS)

Guía para **crear o actualizar** una Especificación de Requisitos de Software (`SRS-XXX`) a partir de un **requerimiento en bruto**: una idea, un ticket, un correo, una conversación, una transcripción de reunión, un diseño o wireframes existentes, documentación técnica, o cualquier combinación de estos — todo insumo que dé contexto para definir el alcance sirve, y no hace falta un único formato. Si el insumo incluye imágenes o gráficas, se leen y se interpretan antes de continuar. El objetivo es dejar el requerimiento en una forma estándar, sin lagunas, lista para descomponerse en historias de usuario.

> **Alcance de un SRS:** el `README.md` fija el **contexto de implementación** de un requerimiento antes de dividirlo en trabajo: qué stack tecnológico se va a usar (y con qué respaldo), en qué repositorios se materializa y si hay un proyecto base del que partir, y los requisitos funcionales y no funcionales de alto nivel. **No** contiene historias de usuario, `AC-XXX` ni tareas — eso lo produce `work-define` (y, para las tareas, `work-plan`) a partir de este documento. Tampoco contiene modelos de datos, contratos de API ni diagramas técnicos — eso es `design-define`. Este skill es el **paso previo, opcional pero recomendado**, cuando el requerimiento llega crudo o ambiguo; si ya está claro (stack, repos y alcance conocidos, sin decisiones pendientes), se puede ir directo a `/work-define`.

La plantilla canónica está en `assets/srs-template.md` (léela antes de escribir cualquier SRS).

## Mapa de referencias

Carga el archivo correspondiente cuando vayas a ejecutar la tarea; el detalle íntegro vive en `references/`.

| Necesitas… | Archivo |
| ---------- | ------- |
| Flujo paso a paso de **crear** y **actualizar**: cierre de lagunas funcionales (incluidas interfaces externas, datos y cumplimiento normativo), supuestos de funcionalidad transversal reutilizable, **wireframes de UI en SVG enlazado** (tipo de solución, mockup visual), **verificación y trazabilidad**, **riesgos**, la pregunta sobre el stack (investigar vs. ya decidido) y su delegación a `/work-research`, repositorios/proyecto base, equipo de desarrollo, checklist, ejemplos y anti-patrones | [`references/flow.md`](references/flow.md) |
| Detalle de **RFC 2119**, categorías de **FR-XXX** (funcionales) y **NFR-XXX** (ISO 25010), **prioridad**, **estado por requisito**, **métodos de verificación**, **verificabilidad**, y la **Definition of Ready (DoR)** del SRS | [`references/quality-criteria.md`](references/quality-criteria.md) |
| Estructura del `README.md` de un SRS | [`assets/srs-template.md`](assets/srs-template.md) |
| Estructura de un wireframe de pantalla | [`assets/wireframe-template.md`](assets/wireframe-template.md) |

### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`../../reference/language.md`](../../reference/language.md): **Idioma** — resolución obligatoria del idioma de artefactos y mensajes. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*
- [`../../reference/asking.md`](../../reference/asking.md): **Preguntas** — mecanismo estructurado, ritmo, fallback. *Antes de la primera pregunta.* Este skill declara una excepción de ritmo (cierre de lagunas por tandas de hasta 3) — ver la tabla de excepciones en ese archivo.

---

## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

---

## Ubicación de archivos

Layout completo del harness, identificadores y contrato de archivado: [`../../reference/artifacts.md`](../../reference/artifacts.md).

Lo propio de este skill:

| Artefacto | Ruta |
| --------- | ---- |
| Especificación de requisitos (**salida**) | `docs/specs/requirements/SRS-XXX-[nombre-corto]/README.md` |
| Requerimiento en bruto (**entrada, conservada tal cual**) | `docs/specs/requirements/SRS-XXX-[nombre-corto]/references/` |
| Wireframes de pantalla (si el requerimiento tiene UI) | `docs/specs/requirements/SRS-XXX-[nombre-corto]/assets/wireframes/[pantalla-slug].md` (documento) y `[pantalla-slug].svg` (SVG enlazado) |
| Otros archivos de apoyo | `docs/specs/requirements/SRS-XXX-[nombre-corto]/assets/` |
| Investigación de stack delegada (si se investigó) | `docs/specs/requirements/SRS-XXX-[nombre-corto]/research/RS-XXX-[slug]/README.md` — la crea `/work-research`, este skill solo la referencia |
| Glosario (opcional) | `docs/specs/glossary.md` |

> **`references/` vs. `assets/`.** `references/` guarda el **insumo tal como llegó** (el ticket, el correo, la transcripción de reunión, diseños, wireframes ya existentes, capturas o documentación técnica) para trazabilidad — nunca se edita ni se reescribe, solo se añade. `assets/` guarda lo que **este skill produce** como apoyo del documento (wireframes, y cualquier otro archivo derivado); eso sí se actualiza cuando cambia.

### Convenciones del nombre de carpeta

> Reglas comunes de slug e identificadores: [`../../reference/artifacts.md`](../../reference/artifacts.md). Lo específico del SRS:

- Formato: `SRS-XXX-[nombre-corto]` con `SRS-XXX` en mayúsculas y número de 3 dígitos.
- Nombre corto: minúsculas, kebab-case, sin artículos ni palabras vacías.
- El secuencial es global sobre `docs/specs/requirements/`; este skill no tiene todavía contrato de archivado — no lo mueve `work-integrate` — así que la carpeta permanece en la ruta activa como referencia histórica del requerimiento que originó las historias.
- Ejemplos: `SRS-001-portal-de-proveedores`, `SRS-004-migracion-facturacion-electronica`.

---

## Información requerida antes de redactar

Antes de crear o editar cualquier SRS, el agente debe tener clara la siguiente información. **No inventar nada** — si algún dato no es explícito, preguntar al usuario.

La tabla sigue el **orden en que se resuelven**: primero lo funcional, después la UI y al final lo técnico — salvo que una fila funcional dependa de una fila técnica puntual para cerrarse (ver la excepción en [Flujo (resumen)](#flujo-resumen)).

| Dato | Cómo obtenerlo | Si no está disponible |
| ---- | --------------- | ---------------------- |
| **Requerimiento en bruto y su contexto** | Cualquier insumo aportado por el usuario: descripción, ticket, correo, transcripción de reunión, diseño, wireframes, capturas o diagramas, documentación técnica existente. Todo se guarda tal cual en `references/` de la carpeta del SRS. Las **imágenes y gráficas se leen y se interpretan** (no se asume su contenido) antes de continuar — mismo criterio que `/work-define` | Preguntar; sin esto no hay nada que estructurar |
| **Alcance y objetivo funcional** | Del requerimiento en bruto | Preguntar; sin esto el SRS solo puede crearse en Draft |
| **Requisitos funcionales (`FR-XXX`)** | Del requerimiento en bruto | Preguntar; sin al menos un `FR-XXX` el SRS solo puede crearse en Draft |
| **Requisitos no funcionales (`NFR-XXX`)** | Del requerimiento o inferibles del dominio | Preguntar; puede quedar «No aplica» justificado |
| **Supuestos de funcionalidad transversal reutilizable** (autenticación, roles/permisos, notificaciones, auditoría, pagos, almacenamiento, búsqueda, etc.) | Inferido primero (¿ya existe/se reutiliza del proyecto base o una plataforma compartida, o está en el alcance construirla?); se pregunta solo si la inferencia es ambigua | Si es claramente reutilizada, no se pregunta — se registra el supuesto en Supuestos y dependencias y no se crea `FR-XXX`; si está en alcance, se redacta su `FR-XXX` |
| **Interfaces externas** (usuario, hardware, software, comunicaciones) | Del requerimiento, a nivel de existencia y contrato mínimo | Preguntar; omitir las subsecciones que no apliquen |
| **Requisitos de datos** (entidades, retención/privacidad, volumen) | Del requerimiento o del dominio | Preguntar; formalizarlos antes de Ready si el requerimiento maneja datos |
| **Cumplimiento normativo** (normativa aplicable y cómo se cumple) | Del requerimiento o del dominio (p. ej. datos personales, financieros, de salud) | Preguntar solo si el dominio lo exige; «No aplica» es válido |
| **Prioridad** de cada `FR-XXX`/`NFR-XXX` | Propuesta por lote al cerrar los requisitos, confirmada en una sola pregunta (ver [Prioridad](references/quality-criteria.md#prioridad)) | Sin asignar, el SRS no puede declararse Ready |
| **Restricciones, supuestos y fuera de alcance** | Del requerimiento o del usuario | Preguntar |
| **¿Requiere diseño de interfaz (UI)?** | Inferido del objetivo funcional y los `FR-XXX` una vez identificados; se pregunta solo si la inferencia es ambigua | Si es claramente Sí o No, no se pregunta — se registra la conclusión y se continúa; «No» cierra la sección de wireframes sin más |
| **Tipo de solución** (web, app nativa, híbrida, escritorio) y **¿responsiva?** — solo si hay UI | Inferido de menciones explícitas, el actor y su contexto de uso; se pregunta solo si la inferencia es ambigua | Sin resolver, el SRS no puede declararse Ready si hay UI involucrada |
| **Revisión de cada wireframe** (aprobado / con cambios) | Presentar el wireframe generado y preguntar al usuario | Sin resolver, el SRS no puede declararse Ready si hay UI involucrada |
| **Verificación y trazabilidad** (origen, dependencias, estado del requisito) | Por cada `FR-XXX`/`NFR-XXX`, una vez cerrados | Sin resolver, el SRS no puede declararse Ready |
| **Método y criterio de verificación** de cada requisito | Propuesto por lote (ver [Métodos de verificación](references/quality-criteria.md#métodos-de-verificación)), confirmado en una sola pregunta; criterio redactado en términos verificables (ver [Verificabilidad](references/quality-criteria.md#verificabilidad)) | Sin método o criterio, el SRS no puede declararse Ready |
| **Riesgos** (probabilidad, impacto, mitigación) | Propuestos por lote a partir de lo ya cerrado, confirmados en una sola pregunta | Dato informativo; no bloquea `Estado: Ready` salvo que el usuario lo trate como laguna abierta |
| **Modo de resolución del stack** (investigar vs. ya decidido) | Pregunta estructurada, una vez cerrado lo funcional, la UI, la verificación y los riesgos | No aplica — se pregunta siempre en ese momento, salvo que ya se haya adelantado por la excepción de duda funcional |
| **Stack tecnológico resuelto** | Investigación delegada a `/work-research` (dominio Técnica) si el usuario pidió investigar, o respuesta directa si ya lo tiene decidido | Sin resolver, el SRS queda en Draft |
| **Repositorios git** de la implementación | Indicados por el usuario, o candidatos inferidos de submódulos/repos anidados del workspace | Sin ellos el SRS no puede declararse Ready |
| **¿Nuevo o existente?**, por cada repositorio | Pregunta estructurada explícita por cada repositorio identificado — nunca inferida del nombre | Sin resolver, el SRS no puede declararse Ready |
| **Proyecto base** (starter, scaffold, boilerplate) — solo si el repositorio es nuevo | Preguntado por cada repositorio nuevo; «No aplica» si el repositorio es existente | Preguntar; «ninguno, desde cero» es una respuesta válida para un repositorio nuevo |
| **¿Equipo de desarrollo definido?** | Pregunta estructurada, después de repositorios/proyecto base | No aplica — se pregunta siempre; «No» deja la tabla de equipo vacía, sin bloquear Ready |
| **Nombre, email y responsabilidad** de cada integrante | Solo si el equipo ya está definido; entrada libre, uno por uno hasta que el usuario confirme que la lista está completa | Dato informativo, no bloquea `Estado: Ready` |

> El único dato estrictamente obligatorio para crear el documento es tener identificado el alcance funcional del requerimiento. Si algo no es completamente resoluble con la información disponible, el SRS se crea con `Estado: Draft` y las lagunas documentadas en Observaciones. El estado **Ready** requiere todos los datos sin excepción.
>
> **Excepción de orden:** si una fila funcional (`FR-XXX`/`NFR-XXX`) no se puede cerrar sin una decisión técnica puntual, esa decisión se resuelve en ese momento — no se espera a llegar a las filas de Stack/Repositorios.

---

## Flujo (resumen)

El procedimiento completo —cómo preguntar al usuario, la pregunta inicial sobre el stack y su delegación a `/work-research`, la vuelta por repositorios (nuevo o existente) y proyecto base, el cierre de lagunas por tandas, los pasos de **Crear** y **Actualizar**, el checklist y los ejemplos/anti-patrones— está en [`references/flow.md`](references/flow.md). Síntesis:

- **Crear (funcional primero, técnico al final):** fijar ID y carpeta `SRS-XXX-[nombre-corto]/` → capturar el requerimiento en bruto y guardarlo en `references/` → cerrar lo **funcional** con preguntas estructuradas por tandas (alcance, actores, `FR-XXX`, `NFR-XXX`, reglas de negocio, interfaces externas, requisitos de datos, cumplimiento normativo), inferir primero si alguna capacidad transversal común (autenticación, roles, notificaciones, etc.) **ya existe o se reutiliza** en vez de crear un `FR-XXX` para ella, preguntando solo si queda duda, y al final del cierre asignar **prioridad** a cada `FR-XXX`/`NFR-XXX` por lote → si el requerimiento tiene UI propia (inferido, o preguntado solo si es ambiguo), inferir el **tipo de solución** (web, nativa, híbrida, responsiva), generar el **wireframe SVG de todas las pantallas de una vez** (`assets/wireframes/`, enlazado desde su documento `.md`), presentar el lote completo (nombre + enlace de cada una) y preguntar **una sola vez** si hay cambios, trasladando lo que salga a los wireframes y a los `FR-XXX` afectados → completar **verificación y trazabilidad** de cada requisito (origen, dependencias, estado) y asignar **método y criterio de verificación** por lote → identificar **riesgos** y presentarlos como lote → recién entonces resolver lo **técnico**: preguntar si se investiga el stack o ya está decidido, resolverlo (delegando a `/work-research` mediante subagente, o registrando la decisión directa del usuario), identificar repositorios y, por cada uno, si es **nuevo o existente** y, si es nuevo, si hay proyecto base, y preguntar si el **equipo de desarrollo** ya está definido (si lo está, nombre/email/responsabilidad de cada integrante — dato informativo, no bloquea Ready) → redactar el `README.md` con la plantilla (Introducción, Descripción general, Stack tecnológico, Repositorios, Equipo de desarrollo, `FR-XXX`, `NFR-XXX`, Reglas de negocio, Interfaces externas, Requisitos de datos, Cumplimiento normativo, Diseño de interfaz, Verificación y trazabilidad, Riesgos, Enlaces y archivos de apoyo, Observaciones) → glosario si aplica → cierre. **Excepción:** si una laguna funcional no se puede cerrar sin una decisión técnica puntual, esa pieza se adelanta y se pregunta dentro de la misma tanda funcional, sin esperar al bloque técnico.
- **Actualizar:** identificar y leer el `README.md` → aplicar cambios conservando **siempre** los ids `FR-XXX`/`NFR-XXX`/`BR-XX` existentes (son inmutables: los nuevos toman el siguiente libre) → revalidar → confirmar.
- **Cierre:** si queda **Draft**, cerrar lagunas con preguntas estructuradas (tandas de hasta 3, encadenando tantas como haga falta); si queda **Ready**, ofrecer `/work-define` para descomponer el SRS en historias de usuario — nunca crear la US directamente desde este skill.

Las modalidades **RFC 2119** y las categorías de **FR-XXX**/**NFR-XXX** detalladas están en [`references/quality-criteria.md`](references/quality-criteria.md).

---

## Criterios para `Estado: Ready` (resumen)

Promover a **Ready** solo si se cumplen todos; el detalle de cada criterio está en [`references/quality-criteria.md`](references/quality-criteria.md#definition-of-ready-dor-del-srs).

- **Stack tecnológico** resuelto: investigado (con `RS-XXX` enlazado) o decidido explícitamente por el usuario, sin alternativas abiertas.
- **Repositorios** identificados y, por cada uno, su **tipo** resuelto (nuevo o existente) y el **proyecto base** resuelto cuando aplica (uno concreto, «desde cero» si es nuevo, o «No aplica» si es existente).
- Sección **Requisitos funcionales** completa: al menos un `FR-XXX` con categoría, prioridad, estado y enunciado RFC 2119 en MAYÚSCULAS.
- **Requisitos no funcionales** revisados y priorizados (con entradas o «No aplica» justificado).
- **Interfaces externas** revisadas (usuario, hardware, software, comunicaciones); «No aplica» si no corresponde.
- **Requisitos de datos** formalizados si el requerimiento maneja datos.
- **Cumplimiento normativo** trazado si el dominio lo exige; «No aplica» si no corresponde.
- **Diseño de interfaz**: si el requerimiento tiene UI propia, el **tipo de solución** (web, nativa, híbrida, escritorio) y si debe ser **responsiva** están definidos, y cada pantalla tiene su wireframe revisado por el usuario (aprobado, o con los cambios ya trasladados al SRS); «No aplica» si no hay UI.
- **Verificación y trazabilidad** completa: todo `FR-XXX`/`NFR-XXX` con método y criterio de verificación redactado en términos comprobables.
- **Riesgos** identificados, con probabilidad, impacto y mitigación.
- **Alcance y fuera de alcance** declarados sin ambigüedad.
- **Observaciones** sin aclaraciones ni decisiones pendientes abiertas.

Si falta cualquiera, mantener `Estado: Draft` con las lagunas documentadas en Observaciones.

---

## Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno ni narración del trabajo en curso («leí el requerimiento», «creé el archivo»). Si hay pendientes, listarlos agrupados por sección (Stack, Repositorios, `FR-XXX`, `NFR-XXX`, Interfaces externas, Requisitos de datos, Cumplimiento normativo, Wireframes, Verificación y trazabilidad, Riesgos, Equipo de desarrollo). Los wireframes se generan todos (SVG enlazado, no pegado como código) antes de mostrarlos, y se presentan **juntos, en un solo mensaje**: nombre de cada pantalla con el enlace a su documento (`assets/wireframes/[pantalla-slug].md`) y a su SVG (`assets/wireframes/[pantalla-slug].svg`) para revisarla con facilidad — nunca uno por turno. La prioridad, el método de verificación y los riesgos también se proponen como lote y se confirman en una sola pregunta cada uno — nunca requisito por requisito. Al llegar a Ready, ofrecer explícitamente `/work-define` como siguiente paso — nunca crear la historia de usuario desde aquí.
