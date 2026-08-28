# Flujo detallado, grilling, ejemplos y anti-patrones

Procedimiento paso a paso para **crear** y **actualizar** documentos técnicos de capability, el detalle del **grilling** por tipo de elemento, el **modo delegado**, checklist, ejemplos y handoffs. Los estándares de contenido por tipo viven en [`element-standards.md`](element-standards.md); la estructura del documento, en `assets/technical-doc-template.md`.

---

## Validación antes de crear o editar

Antes de tocar archivos, verificar. Si algo falla, **no crear** — informar y resolver primero.

- **Capability resuelta:** listar los documentos existentes en `docs/specs/technical-docs/`. Si el elemento pedido encaja en una capability existente, el destino es **ese documento** (actualizar), aunque el usuario no la haya nombrado. Crear una capability nueva solo si ninguna existente cubre el dominio del elemento; ante la duda, preguntar mostrando las capabilities existentes como opciones.
- **Duplicado de elemento:** si el documento de la capability ya define un elemento equivalente (mismo modelo, misma operación, mismo flujo), no crear uno nuevo: proponer **actualizar** el existente conservando su id. Dos ids para la misma cosa rompen las referencias de los consumidores.
- **Conflicto con la fuente:** si lo pedido contradice la US/TK/WI de origen o el código existente del repo, parar y reportarlo (al usuario en modo directo; en la respuesta final en modo delegado). La US prevalece sobre los documentos derivados; el documento técnico no se usa para «corregir» la historia por la puerta de atrás.

---

## Grilling por tipo de elemento

El objetivo del grilling es que el documento sea **referencia de implementación suficiente**: quien implemente la TK no debería tener que adivinar nada que este documento pudo haber fijado. Antes de redactar, contrastar el input recibido con lo que exige el estándar de cada tipo ([`element-standards.md`](element-standards.md)) y preguntar **solo las lagunas reales** — lo que ya está en el input, en el repo o en la US/TK/WI no se repregunta. Mecánica de tandas y formato de preguntas: sección «Cómo preguntar al usuario» del `SKILL.md`.

Lagunas típicas por tipo — usar como lista de contraste, no como cuestionario fijo:

**Modelos (`MD-XX`)**
- Campos mencionados sin tipo concreto, o tipos ambiguos («número» → ¿entero, decimal, precisión?).
- Obligatoriedad no declarada, u obligatoriedad condicional sospechada pero no confirmada.
- Enums sin lista cerrada de valores; identificadores sin formato (¿UUID, secuencial, código de negocio?).
- Relaciones implícitas («la factura tiene líneas») sin cardinalidad ni dirección.
- ¿Entidad persistida o DTO? Si el input no lo aclara y cambia las validaciones, preguntar.

**APIs (`API-XX`)**
- Ruta o método no especificados; versión del API si el proyecto versiona.
- Autenticación/permisos ausentes (nunca asumir «pública» por omisión).
- Errores: ¿qué condiciones de negocio devuelven error y con qué código? ¿Existe estructura de error estándar en el proyecto?
- Paginación, ordenación o filtros en operaciones de listado.
- Idempotencia en operaciones de escritura sensibles (reintentos de pagos, webhooks).

**Flujos (`FL-XX`)**
- Disparador difuso («cuando corresponda») o resultado final no verificable.
- Ramas de decisión mencionadas sin criterio («si procede, se aprueba» → ¿quién decide y con qué regla?).
- Comportamiento ante fallo de cada paso externo (timeout de la pasarela, servicio caído): ¿reintento, compensación, aborto?
- Concurrencia u orden: ¿puede el flujo ejecutarse dos veces sobre la misma entidad?

**Diagramas (`DG-XX`)**
- Tipo no especificado («haz un diagrama» → ¿clases, contexto, contenedores, componentes, estados?).
- Alcance difuso: ¿qué parte de la capability cubre y qué queda explícitamente fuera?
- Sistemas externos o actores mencionados sin la dirección o el propósito de la interacción.
- Tecnologías/protocolos sin confirmar en contenedores o componentes (no asumir el stack).
- Contradicciones con `MD-XX`/`API-XX`/`FL-XX` existentes: ¿el diagrama refleja lo especificado o propone un cambio? Si propone un cambio, confirmarlo antes de dibujar.

Priorizar: preguntar primero lo que **bloquea la implementación** (tipos, contratos, ramas); lo cosmético o diferible puede quedar en Observaciones si el usuario prefiere no detallarlo aún.

---

## Flujo: Crear o actualizar

1. **Resolver capability y destino**
   - Listar `docs/specs/technical-docs/` y aplicar la validación anterior. Resultado: documento existente a actualizar, o nombre kebab-case del documento nuevo (validar el nombre con el usuario si hay ambigüedad).
2. **Leer lo existente**
   - Si el documento existe, leerlo completo: ids ya usados por tipo (los nuevos continúan la secuencia), elementos equivalentes y Observaciones abiertas.
   - Revisar la US/TK/WI de origen (si la hay) y el código del repo cuando el elemento describa algo ya implementado — el código existente es fuente, no se contradice sin avisar.
3. **Grilling**
   - Contrastar el input con los estándares y lanzar la(s) tanda(s) de preguntas por las lagunas reales. Con las respuestas (o con las lagunas asumidas como pendientes), continuar.
   - **Sin canal de respuesta disponible** (modo directo en una sesión desatendida/programada, o modo delegado cuyo subagente no puede interactuar): no inventar ninguna respuesta — documentar cada laguna en Observaciones citando el elemento afectado y continuar con lo que sí está confirmado. Mismo criterio en ambos modos; solo cambia dónde queda visible (respuesta final del subagente en delegado, resumen al usuario en directo — ver [Modos de invocación](../SKILL.md#modos-de-invocación) en `SKILL.md`).
4. **Redactar**
   - Documento nuevo: usar `assets/technical-doc-template.md` como molde (Propósito, secciones de elementos que apliquen, Observaciones). No copiar la plantilla como artefacto al repo; es un molde.
   - Cada elemento según su estándar en [`element-standards.md`](element-standards.md), con id siguiente de su secuencia, **ancla explícita `<a id="<id-en-minúsculas>"></a>` en la línea anterior** y encabezado `### ID: Nombre`. El ancla es obligatoria: es el contrato de enlace con las US/TK/WI (ver [Por qué el ancla no se deriva del título](element-standards.md#por-qué-el-ancla-no-se-deriva-del-título)).
   - En actualizaciones: no renumerar ids existentes; los elementos obsoletos se marcan `(Obsoleto)`, no se borran mientras tengan consumidores.
   - **Al actualizar un documento cuyos elementos no tienen ancla, añadir la que falte a los que se toquen** (los que se crean o modifican en esta pasada). No hace falta un barrido del documento completo, pero sí dejar anclado todo lo que se edite: un elemento modificado cuya referencia se devuelve al llamador tiene que ser enlazable. Si al hacerlo se detecta que otros elementos del documento siguen sin ancla, mencionarlo en el resumen final para que el usuario decida si completarlos.
   - Lagunas no resueltas → Observaciones, citando el elemento afectado.
5. **Cerrar el documento**
   - Actualizar la fecha de «Última actualización» (y «Fecha de creación» si el documento es nuevo).
   - Glosario (`docs/specs/glossary.md`): entrada breve si aparecen términos de dominio nuevos.
6. **Enlazar y cerrar**
   - **Modo delegado:** devolver al skill llamador la lista de referencias — para cada elemento: id, título y ruta relativa con ancla, que es **siempre `#<id en minúsculas>`** (p. ej. `docs/specs/technical-docs/facturacion.md#api-01`) — más las lagunas que quedaron en Observaciones. El skill llamador decide cómo insertarlas en su artefacto. **Nunca devolver un ancla derivada del título** (`#api-01-crear-factura`): el llamador la copiaría literalmente y el enlace apuntaría a nada.
   - **Modo directo:** mostrar el resumen de elementos creados/actualizados y, si hay una US/TK/WI relacionada en contexto, **ofrecer** agregar las referencias a su sección Referencias (no editarla sin confirmación). Si quedaron Observaciones, ofrecer las preguntas que las cerrarían.

---

## Modo delegado (invocación desde otro skill)

Cuando `work-define` o `work-plan` delegan mediante subagente:

- **Entrada esperada:** capability (o pista para inferirla), elementos a especificar con todo el contexto que el llamador tenga (texto de la US/TK/WI, reglas de negocio, restricciones), ruta del artefacto de origen e idioma resuelto si el llamador ya lo conoce.
- El flujo es el mismo (validar → leer → grilling → redactar → enlazar). El grilling se dirige al usuario a través de la herramienta de preguntas estructuradas; si el entorno del subagente no permite interacción, **no inventar**: documentar cada laguna en Observaciones y reportarla en la respuesta final.
- **Respuesta final del subagente** (es dato para el llamador, no prosa para el humano):

```
capability: facturacion
documento: docs/specs/technical-docs/facturacion.md
elementos:
  - MD-03: Nota de crédito → docs/specs/technical-docs/facturacion.md#md-03
  - API-04: Emitir nota de crédito → docs/specs/technical-docs/facturacion.md#api-04
pendientes:
  - API-04: estructura de error estándar sin confirmar (Observaciones)
```

- Este skill **no edita** la US/TK/WI del llamador: entregar las referencias y que el skill dueño del artefacto las inserte, respetando sus propias reglas de formato.

---

## Checklist antes de dar por terminado

**Ubicación y estructura:**

- Un solo documento para la capability; nombre kebab-case correcto
- Plantilla respetada; solo las secciones de elementos que aplican
- Encabezados `### ID: Nombre`, cada uno precedido de su ancla explícita `<a id="<id>"></a>`; ids secuenciales por tipo sin renumeraciones
- **Ninguna referencia entregada o escrita usa un ancla derivada del título**: todas son `#<id en minúsculas>`
- Si el documento ya existía sin anclas, los elementos tocados en esta pasada las tienen

**Contenido:**

- Cada elemento cumple su estándar (tipos concretos, responses exhaustivas, ramas cubiertas — ver [`element-standards.md`](element-standards.md))
- Referencias cruzadas por id válidas: ancla local `#<id>` dentro de la capability, ruta relativa + `#<id>` entre capabilities
- Nada inventado: todo dato no confirmado está en Observaciones, no camuflado como definición

**Cierre:**

- Fechas de creación y última actualización al día
- Referencias entregadas (modo delegado) u ofrecidas (modo directo)

---

## Ejemplos

**Ejemplo 1 — Delegación desde work-define**

- *Entrada:* `work-define` está creando la US-012 «emitir nota de crédito», que menciona un modelo y un endpoint nuevos; delega vía subagente con el texto de la US.
- *Comportamiento:* design-define detecta que existe `facturacion.md`, continúa las secuencias (MD-03, API-04), hace una tanda de grilling (tipos del modelo, códigos de error), redacta y devuelve las referencias con ancla (`facturacion.md#md-03`, `facturacion.md#api-04`). `work-define` las agrega a Referencias de la US tal cual, sin recomponer nada.

**Ejemplo 2 — Detalle solicitado durante planificación**

- *Entrada:* Durante `work-plan`, la TK-021 menciona «el flujo de conciliación» sin especificación; el usuario pide «dame más detalle de ese flujo».
- *Comportamiento:* design-define (vía subagente) pregunta disparador, ramas y manejo de errores; crea `FL-02` en la capability correspondiente y devuelve la referencia para la sección Referencias de la TK.

**Ejemplo 3 — Pedido directo con capability ambigua**

- *Entrada:* «Documenta el modelo de usuario.»
- *Comportamiento:* Hay `autenticacion.md` y `perfiles.md`; el agente pregunta con opciones a cuál pertenece (o si es una capability nueva) antes de crear nada. Luego grilling de campos y redacción.

**Ejemplo 4 — Elemento ya existente**

- *Entrada:* «Especifica la API de crear factura», pero `facturacion.md` ya tiene `API-01: Crear factura`.
- *Comportamiento:* No crea `API-05` duplicado; muestra el existente y pregunta si desea actualizarlo. Los cambios conservan el id y actualizan la fecha de última actualización.

---

## Anti-patrones

- Inventar tipos, códigos de error, validaciones o ramas de flujo que nadie confirmó, en lugar de preguntar o dejar la laguna en Observaciones.
- Crear un documento por historia de usuario o por tarea: la unidad es la **capability**, precisamente para que varias US/TK/WI consuman los mismos elementos.
- Renumerar o borrar elementos con consumidores; los ids son contratos de enlace.
- Duplicar la tabla de campos de un modelo dentro de una API en vez de referenciar su `MD-XX`.
- Poner valor de negocio, criterios de aceptación o planes de implementación en el documento técnico: eso pertenece a la US (`work-define`) o a la TK/WI (`work-plan`).
- Crear o modificar ADRs desde este skill; si falta una decisión de arquitectura, sugerirla al usuario y registrar la dependencia en Observaciones.
- En modo delegado, editar directamente la US/TK/WI del llamador en lugar de devolver las referencias.
- Copiar `assets/technical-doc-template.md` al repo del producto como artefacto en lugar de usarlo como molde.
- Lanzar preguntas como prosa libre existiendo herramienta de preguntas estructuradas, o descubrir lagunas turno a turno en vez de agruparlas en tandas.

---

## Handoffs del ciclo

Posición: **transversal** al pipeline `work-define` → `work-plan` → `work-implement`; produce la referencia técnica que esos skills consumen.

| | |
|--|--|
| **Entrada** | Pedido directo del usuario, o delegación vía subagente desde `work-define` (US que define modelos/APIs/flujos) o `work-plan` (TK/WI con definiciones técnicas sin especificación). |
| **Salida** | Documento `docs/specs/technical-docs/[capability].md` creado o actualizado, con elementos `MD-XX`/`API-XX`/`FL-XX`/`DG-XX` enlazables por su ancla explícita; lista de referencias (ruta + `#<id>`) entregada al llamador o al usuario. |
| **Hacia work-define / work-plan** | El skill llamador inserta las referencias en la sección Referencias de su artefacto (US, TK o WI). Este skill nunca edita esos artefactos. |
| **Hacia work-implement** | Las TK/WI en Ready referencian los elementos de este documento como fuente de implementación; la fecha de última actualización permite detectar si el documento cambió después de redactada la TK/WI. |
| **Conflicto con la US** | Si al especificar se descubre que la US es inconsistente o incompleta, reportarlo; la corrección de la US se hace con `work-define`, nunca desde aquí. |
