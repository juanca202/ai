# Criterios de calidad: RFC 2119 / categorías / prioridad / verificación / Definition of Ready

Referencia detallada para redactar y validar Especificaciones de Requisitos de Software (SRS), alineada a **ISO/IEC/IEEE 29148:2018** (proceso de especificación de requisitos de software). Las secciones del `SKILL.md` y de `references/flow.md` apuntan aquí mediante anclas (`#rfc-2119`, `#categorías-de-fr-xxx`, `#categorías-de-nfr-xxx`, `#prioridad`, `#estado-por-requisito`, `#métodos-de-verificación`, `#verificabilidad`, `#definition-of-ready-dor-del-srs`).

---

## RFC 2119

Mismo vocabulario normativo que usa `work-define` para sus `AC-XXX` — no se duplica aquí. Ver la tabla completa en [`../../work-define/references/quality-criteria.md#rfc-2119`](../../work-define/references/quality-criteria.md#rfc-2119).

Aplica igual a `FR-XXX`, `NFR-XXX` y `BR-XX`: elegir una forma por nivel y mantenerla consistente en todo el SRS. Un enunciado que no admite una palabra clave RFC 2119 clara suele ser un síntoma de que todavía no es **verificable** — ver [Verificabilidad](#verificabilidad).

---

## Categorías de FR-XXX

Cada **FR-XXX** declara su categoría. Son las mismas siete categorías funcionales que usa `work-define` para sus `AC-XXX` — ver [`../../work-define/references/quality-criteria.md#categorías-de-criterios-de-aceptación`](../../work-define/references/quality-criteria.md#categorías-de-criterios-de-aceptación):

Reglas de negocio · Casos de uso · Flujos de proceso · Procesamiento de datos · Integraciones · Interacción de usuario · Salidas del sistema

Usar la categoría de **primer nivel** que mejor encaje. Un `FR-XXX` no tiene por qué mapear 1:1 a un futuro `AC-XXX`: al descomponerse en `work-define`, un `FR-XXX` amplio puede dar lugar a varios criterios de aceptación en una o más historias, y varios `FR-XXX` relacionados pueden terminar en la misma historia. La tabla **Historias de usuario derivadas** del SRS registra esa relación después del handoff, no antes.

---

## Categorías de NFR-XXX

Cada **NFR-XXX** usa las características **ISO/IEC 25010** — mismo catálogo que las categorías no funcionales de `AC-XXX` en `work-define`, ver [`../../work-define/references/quality-criteria.md#categorías-de-criterios-de-aceptación`](../../work-define/references/quality-criteria.md#categorías-de-criterios-de-aceptación):

Idoneidad funcional · Eficiencia de rendimiento · Compatibilidad · Usabilidad · Fiabilidad · Seguridad · Mantenibilidad · Portabilidad

«No aplica» es una respuesta válida para una característica si se justifica brevemente por qué no es relevante para este requerimiento — no dejarla en blanco sin nota.

**Disponibilidad** no es una categoría aparte: ISO/IEC 25010 la trata como subcaracterística de **Fiabilidad** — un `NFR-XXX` sobre tiempo de actividad, recuperación o tolerancia a fallos va bajo esa categoría.

**Seguridad no se dispersa.** Cualquier requisito de seguridad —autenticación, autorización, cifrado, protección de datos, auditoría de accesos— se redacta como `NFR-XXX` de categoría **Seguridad**, aunque haya salido de una conversación sobre restricciones (sección 2.3), interfaces (sección 9) o cumplimiento normativo (sección 11). Esas otras secciones pueden **mencionar** que existe una implicación de seguridad y enlazar el `NFR-XXX` correspondiente, pero el enunciado verificable vive en uno solo lugar.

---

## Prioridad

Cada `FR-XXX` y `NFR-XXX` lleva una prioridad, en la misma tabla que su enunciado. Cuatro niveles:

| Prioridad | Significado | Equivalente MoSCoW |
| ---------- | ------------- | --------------------- |
| **Esencial** | Sin este requisito, el requerimiento no cumple su propósito — bloquea el release. | Must have |
| **Alta** | Se espera en esta versión; su ausencia degrada seriamente el valor entregado. | Should have |
| **Media** | Aporta valor pero es negociable dentro del alcance de esta versión. | Could have |
| **Baja** | Deferible sin afectar el objetivo de esta versión — candidato a la sección **2.6 Requisitos diferidos a futuras versiones**. | Won't have (por ahora) |

**Cómo se asigna:** no se pregunta requisito por requisito. Una vez cerrados todos los `FR-XXX`/`NFR-XXX` de una tanda, se presenta la lista completa y se pide clasificarlos en un solo paso (p. ej. selección múltiple de cuáles son `Esencial`) — mismo mecanismo de lote que la revisión de wireframes. Por defecto, sin indicación del usuario, un requisito nuevo se registra como **Alta** hasta que se reclasifique.

---

## Estado por requisito

Distinto del `Estado: Draft/Ready` del documento completo (ver [Definition of Ready (DoR) del SRS](#definition-of-ready-dor-del-srs)). Cada `FR-XXX`/`NFR-XXX` lleva su propio estado:

| Valor | Cuándo aplica |
| ------ | -------------- |
| **Propuesto** | El agente lo redactó a partir de una inferencia o un valor por defecto que el usuario todavía no confirmó explícitamente. |
| **Aprobado** | El usuario confirmó el enunciado — al responder la pregunta que lo originó, ya lo está aprobando; no hace falta una confirmación aparte. |

Un SRS puede llegar a `Estado: Ready` con requisitos en `Propuesto` **solo si** esa laguna quedó documentada y aceptada en Observaciones; en general, `Ready` implica que todos los `FR-XXX`/`NFR-XXX` relevantes están `Aprobado`.

---

## Métodos de verificación

Los cuatro métodos canónicos de ISO/IEC/IEEE 29148 para declarar cómo se comprobará que un requisito se cumplió. Van en la sección **13. Verificación y trazabilidad** del SRS, una fila por `FR-XXX`/`NFR-XXX`:

| Método | Cuándo usarlo | Heurística de inferencia |
| ------- | -------------- | --------------------------- |
| **Inspección** | Se comprueba revisando el artefacto (documento, pantalla, configuración) sin ejecutarlo. | Requisitos sobre formato, contenido de un documento/reporte, o presencia de un elemento. |
| **Análisis** | Se comprueba con cálculo, modelado o revisión técnica, sin necesidad de ejecutar el sistema completo. | Requisitos de capacidad, arquitectura o restricciones de diseño que se validan por razonamiento o simulación. |
| **Demostración** | Se comprueba mostrando el comportamiento en un entorno controlado, sin instrumentación rigurosa. | Flujos de usuario visibles, integraciones que se muestran funcionando end-to-end sin medir con precisión. |
| **Prueba** | Se comprueba ejecutando un caso de prueba con resultado medible y reproducible. | La mayoría de los `FR-XXX` de comportamiento observable y los `NFR-XXX` de rendimiento/fiabilidad con un umbral numérico. Es el método que más tarde formaliza `test-define` en `TC-XXX`. |

**Cómo se asigna:** igual que la inferencia de UI (ver `flow.md`, paso 4) — el agente **propone** el método según la naturaleza del requisito, presenta la tabla completa a la vez y pregunta **una sola vez** si algo necesita ajustarse, en vez de preguntar método por método.

**Criterio de verificación:** además del método, cada fila declara la condición observable que demuestra el cumplimiento (p. ej. «se sube una factura válida y aparece en el listado en menos de 2 s»). Un requisito al que no se le puede escribir un criterio de verificación concreto no está listo — es la señal de [verificabilidad](#verificabilidad) insuficiente y debe volver a la sección 6/7 para precisarse antes de continuar.

---

## Verificabilidad

Un requisito es verificable cuando puede escribirse una condición objetiva que confirme si se cumplió o no — el mismo criterio que exige ISO/IEC/IEEE 29148 para toda especificación. Señales de que un `FR-XXX`/`NFR-XXX` **no** es verificable todavía:

- Usa adjetivos sin umbral («rápido», «fácil de usar», «seguro») en vez de una condición medible o observable.
- No admite una palabra clave RFC 2119 sin ambigüedad (si hace falta «y/o» para describirlo, probablemente son dos requisitos).
- No se le puede asignar ninguno de los cuatro [métodos de verificación](#métodos-de-verificación) con un criterio concreto.

Si aparece cualquiera de estas señales al redactar la sección 13, no forzar un método: volver a la tanda de preguntas del paso 3 y precisar el enunciado antes de continuar.

---

## Modo de resolución del stack tecnológico

La marca oculta `srs:stack-mode` (ver `assets/srs-template.md`) refleja cómo se resolvió la sección **Stack tecnológico**, y condiciona qué contenido lleva esa sección:

| Valor | Cuándo aplica | Qué debe contener la sección |
| ----- | -------------- | ------------------------------ |
| `researched` | El usuario eligió investigar en la pregunta inicial del flujo | Enlace al `RS-XXX` producido por `/work-research` (vía subagente) + resumen de la recomendación (opción y razón principal), sin duplicar el detalle completo del informe |
| `decided` | El usuario ya tenía el stack decidido | Tabla de decisiones por capa (frontend, backend, base de datos, infraestructura…), con justificación solo si el usuario la dio |

Ambos modos pueden dejar **Decisiones pendientes** si alguna capa queda sin resolver — eso no cambia el modo, solo mantiene el SRS en Draft hasta cerrarse.

---

## Definition of Ready (DoR) del SRS

Tabla con los doce criterios de la plantilla. Para cada uno: `Cumple` / `No cumple` / `Parcial` (los criterios marcados abajo admiten además `No aplica`, en las condiciones que se indican).

| Criterio DoR | Qué exige |
| ------------ | --------- |
| Stack tecnológico resuelto | `srs:stack-mode` fijado y sin decisiones pendientes: investigado con `RS-XXX` enlazado, o decidido explícitamente por el usuario en todas las capas relevantes. |
| Repositorios y proyecto base definidos | Al menos un repositorio identificado; cada uno con su **tipo** resuelto (`Nuevo` / `Existente (con cambios)`) y su proyecto base resuelto cuando aplica (uno concreto o «desde cero» si es nuevo; «No aplica» si es existente). |
| Requisitos funcionales completos y priorizados | Al menos un `FR-XXX` con categoría, prioridad, estado `Aprobado` y enunciado RFC 2119; cubren el alcance descrito en la Introducción sin huecos evidentes. |
| Requisitos no funcionales revisados y priorizados (`No aplica` si ninguna característica ISO 25010 aplica, justificado) | Cada característica ISO 25010 relevante tiene un `NFR-XXX` con prioridad y estado, o quedó marcada «No aplica» con justificación — cubre explícitamente Seguridad, Rendimiento (Eficiencia de rendimiento), Fiabilidad y su subcaracterística Disponibilidad. |
| Interfaces externas revisadas (`No aplica` por subsección si esa interfaz no existe) | Las cuatro subsecciones (usuario, hardware, software, comunicaciones) fueron consideradas; las que no aplican lo declaran explícitamente en vez de omitirse en silencio. |
| Requisitos de datos formalizados (`No aplica` si el requerimiento no maneja datos propios) | Las entidades de datos relevantes están identificadas con retención/privacidad y volumen, o la sección se marcó «No aplica». |
| Cumplimiento normativo trazado (`No aplica` si no hay normativa identificada) | Cada normativa aplicable enlaza al `FR-XXX`/`NFR-XXX` que la satisface; ninguna fila queda sin ese enlace. |
| Diseño de interfaz revisado (`No aplica` si `srs:ui-required=false`) | Si `srs:ui-required=true`: el **tipo de solución** y si debe ser **responsiva** están definidos, y cada fila de la tabla de pantallas está en `Aprobado`, con sus observaciones ya reflejadas en los `FR-XXX` afectados. Ninguna pantalla puede quedar `Pendiente` o `Revisado con cambios` sin resolver. |
| Verificación y trazabilidad completas | Todo `FR-XXX`/`NFR-XXX` tiene fila en la sección 13 con origen, método de verificación y criterio de verificación concretos — ver [Verificabilidad](#verificabilidad). |
| Riesgos identificados | La sección 14 existe con al menos una fila, o se dejó explícitamente «Ninguno identificado» — no se omite sin más. |
| Alcance y fuera de alcance claros | La sección 1.2 delimita qué cubre el requerimiento y qué queda explícitamente fuera. |
| Sin aclaraciones pendientes | Observaciones vacías o «Ninguna»; nada pendiente con usuario/producto. |

El estado **Ready** requiere todos los criterios sin excepción (los marcados `No aplica` cuentan como satisfechos cuando la condición de exclusión aplica y está declarada). Si falta cualquiera, el SRS permanece en `Estado: Draft` con las lagunas documentadas en Observaciones — nunca se declara Ready «con reservas».
