<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
Estructura alineada a ISO/IEC/IEEE 29148:2018 (outline de Software Requirements Specification), con las
secciones propias del harness (Stack tecnológico, Repositorios, Equipo de desarrollo, Diseño de interfaz)
insertadas donde corresponde al flujo de este skill. Ver references/flow.md para el procedimiento
completo y references/quality-criteria.md para los criterios normativos de cada campo.
-->

# SRS-XXX: {{título corto del requerimiento}}

**Estado:** {{Draft | Ready}}

<!-- srs:status={{Draft|Ready}} -->
<!--
Esta marca se CONSERVA al publicar. Sus claves y sus valores van en inglés SIEMPRE, aunque el resto del
documento esté en otro idioma: es el ancla que otros skills parsean, no contenido. La etiqueta visible
de arriba sí se redacta en el idioma resuelto. Ver ../../reference/verdicts.md.
-->
**Fecha de creación:** {{YYYY-MM-DD}}
**Última actualización:** {{YYYY-MM-DD}}

## 1. Introducción

### 1.1 Propósito

{{qué problema resuelve este requerimiento y para quién; una a tres frases}}

### 1.2 Alcance del producto

{{qué cubre este requerimiento: producto o módulo afectado, límites del sistema}}

**Fuera de alcance:**

- {{funcionalidad, caso o decisión que queda explícitamente fuera; indicar dónde se aborda si aplica}}

### 1.3 Definiciones, acrónimos y abreviaturas

<!-- Sección opcional. Términos ambiguos o específicos del dominio van al glosario compartido; enlazarlo aquí en vez de redefinir. Eliminar si no aplica. -->

- **Glosario:** {{enlace a `docs/specs/glossary.md`, si existe}}
- {{término o acrónimo}}: {{definición breve, solo si no está en el glosario}}

### 1.4 Referencias

<!--
Documentos o estándares EXTERNOS a los que este SRS remite (guías de estilo, contratos, normativa,
otras especificaciones) — no confundir con la sección 15 (Enlaces y archivos de apoyo), que enlaza los
archivos propios de esta carpeta (requerimiento original, investigación, wireframes).
Sección opcional. Eliminar si no aplica.
-->

- {{título del documento/estándar}}: {{versión, fecha, enlace o ubicación}}

## 2. Descripción general del producto

<!-- Esta sección da contexto; no declara requisitos verificables — esos van en las secciones 6 en adelante. -->

### 2.1 Perspectiva del producto

{{contexto del sistema o producto en el que se inserta este requerimiento; sistemas con los que convive; si es parte de un sistema mayor, relación con ese sistema}}

### 2.2 Funciones del producto

{{resumen de alto nivel de lo que el requerimiento habilita, en 3-6 líneas; el detalle verificable va en Requisitos funcionales}}

### 2.3 Restricciones del producto

<!-- Sección opcional. Restricciones de negocio, de interfaces, de plataforma, de plazo o de cumplimiento normativo que limitan las opciones de implementación. Las restricciones normativas se detallan en la sección 11 (Cumplimiento normativo); aquí solo se nombran. Eliminar si no aplica. -->

- {{restricción; p. ej. presupuesto, fecha límite, compatibilidad con sistema legado, normativa aplicable (ver sección 11)}}

### 2.4 Características de los usuarios

- {{tipo de actor/usuario}}: {{rol, nivel técnico, frecuencia de uso — lo relevante para decisiones de diseño}}

### 2.5 Supuestos y dependencias

<!-- Sección opcional. Eliminar si no aplica. -->

**Funcionalidad transversal asumida como existente o provista por el proyecto base**

<!--
Sección opcional — incluir solo si el requerimiento depende de capacidades comunes a la mayoría de
aplicativos (autenticación, control de roles/permisos, notificaciones, auditoría/logging, procesamiento
de pagos, almacenamiento de archivos, búsqueda, multi-tenancy, etc.). El agente INFIERE primero si cada
una ya existe/se reutiliza (proyecto base, servicio compartido, plataforma ya en uso) o si está en el
alcance de este SRS construirla — solo pregunta si la inferencia queda ambigua (ver flow.md, paso 3).
Una capacidad marcada "Ya existe / se reutiliza" NO tiene FR-XXX propio; una marcada "En el alcance de
este SRS" sí debe tener su FR-XXX correspondiente en la sección 6. Eliminar la tabla si no aplica.
-->

| Capacidad | Supuesto | Origen |
| --------- | -------- | ------ |
| {{p. ej. Autenticación}} | {{Ya existe / se reutiliza — no está en el alcance de este SRS | Está en el alcance de este SRS}} | {{proyecto base / servicio compartido / plataforma ya en uso / se construye en este requerimiento}} |

- {{otro supuesto asumido que, de no cumplirse, cambia el alcance}}
- {{dependencia con otro sistema, equipo o requerimiento}}

### 2.6 Requisitos diferidos a futuras versiones

<!-- Sección opcional. Requisitos identificados pero fuera del alcance de esta versión — normalmente los que quedaron con Prioridad "Baja" en las secciones 6-7. Eliminar si no aplica. -->

| Requisito | Motivo del diferimiento | Versión objetivo |
| --------- | ------------------------- | ------------------ |
| {{FR-XXX / NFR-XXX}} | {{por qué no entra en esta versión}} | {{si se conoce, o «Por definir»}} |

## 3. Stack tecnológico

<!-- srs:stack-mode={{researched|decided}} -->
<!--
Marca oculta, igual criterio que la de Estado: claves y valores en inglés siempre. Refleja la
respuesta a la pregunta inicial del flujo (investigar vs. ya decidido).
-->

**Modo de resolución:** {{Investigado con /work-research | Definido por el usuario}}

<!-- Si el modo es "Investigado": -->

**Investigación:** {{enlace markdown a `research/RS-XXX-{slug}/README.md`}}

{{resumen de la recomendación: 3-5 líneas con la opción elegida y la razón principal; el detalle completo — alternativas evaluadas, trade-offs — vive en el RS-XXX enlazado, no se duplica aquí}}

<!-- Si el modo es "Definido por el usuario", tabla de decisiones por capa: -->

| Capa | Tecnología | Justificación |
| ---- | ---------- | -------------- |
| {{p. ej. Frontend}} | {{p. ej. React + TypeScript}} | {{por qué, si el usuario la dio; «decisión del equipo» si no se pidió justificación}} |
| {{p. ej. Backend}} | {{…}} | {{…}} |
| {{p. ej. Base de datos}} | {{…}} | {{…}} |
| {{p. ej. Infraestructura / despliegue}} | {{…}} | {{…}} |

**Decisiones pendientes:** {{vacío o «Ninguna» si el stack está completamente resuelto; de lo contrario, listar qué falta decidir}}

## 4. Repositorios e implementación

<!-- Repositorio(s) git donde se materializará el requerimiento: si cada uno es nuevo o existente, y si hay un proyecto base (starter, scaffold, boilerplate) del que partir cuando es nuevo. work-plan usa esta tabla para agrupar tareas por repositorio una vez existan las US. -->

| Repositorio | Tipo | Proyecto base | Notas |
| ----------- | ---- | -------------- | ----- |
| {{nombre del repositorio; p. ej. frontend-web, api-catalogo}} | {{Nuevo / Existente (con cambios)}} | {{si es Nuevo: enlace o nombre del starter/scaffold, o «Ninguno — desde cero». Si es Existente: «No aplica»}} | {{observaciones: rama base, convenciones a seguir, módulo o área del repo existente que se modifica}} |

## 5. Equipo de desarrollo

<!--
Sección opcional — incluir solo si el usuario indicó que el equipo ya está definido. Si respondió que
todavía no se conoce, dejar la tabla vacía (o eliminarla) y anotarlo en Observaciones si es relevante
para el seguimiento; no es requisito para Estado: Ready.
-->

**¿Equipo de desarrollo definido?** {{Sí | No}}

| Nombre | Email | Responsabilidad |
| ------ | ----- | ----------------- |
| {{nombre completo}} | {{email}} | {{responsabilidad; p. ej. Tech Lead, Backend, Frontend, QA, Diseño}} |

## 6. Requisitos funcionales

<!--
Id secuencial FR-001, FR-002, … Cada fila indica su categoría, prioridad y el enunciado con palabra
clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Categorías: Reglas de negocio · Casos de uso · Flujos de proceso · Procesamiento de datos · Integraciones · Interacción de usuario · Salidas del sistema
Detalle en ../../work-define/references/quality-criteria.md#rfc-2119 y #categorías-de-criterios-de-aceptación.
Prioridad: Esencial · Alta · Media · Baja — ver quality-criteria.md#prioridad. Estado: Propuesto (inferido
por el agente, aún sin confirmación explícita) · Aprobado (el usuario ya lo confirmó) — ver
quality-criteria.md#estado-por-requisito.
Estos FR-XXX son de alto nivel: se descomponen en AC-XXX de una o más US al pasar por /work-define; no se
renumeran aunque una US termine cubriendo solo una parte de un FR. Su origen, dependencias y método de
verificación NO van en esta tabla — viven en la sección 13 (Verificación y trazabilidad), para no
duplicar el identificador en dos lugares con datos que se puedan desincronizar.
-->

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| FR-001 | {{categoría}} | {{Esencial / Alta / Media / Baja}} | {{Propuesto / Aprobado}} | {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE…»}} |
| FR-002 | {{…}} | {{…}} | {{…}} | {{…}} |

## 7. Requisitos no funcionales

<!--
Misma mecánica que Requisitos funcionales, id NFR-001, NFR-002, … Categorías ISO/IEC 25010, mismo
detalle que las categorías no funcionales de work-define (ver enlace arriba): Idoneidad funcional ·
Eficiencia de rendimiento · Compatibilidad · Usabilidad · Fiabilidad · Seguridad · Mantenibilidad ·
Portabilidad. «Disponibilidad» es una subcaracterística de Fiabilidad — no crear una categoría aparte.
«No aplica» es una respuesta válida si se justifica por qué esa característica no es relevante para
este requerimiento.
Consolidar aquí TODO requisito de seguridad — no dispersarlo en Restricciones (2.3) ni en Interfaces
(9): si una restricción o interfaz tiene una implicación de seguridad verificable, se redacta como
NFR-XXX (categoría Seguridad) y desde ahí se referencia, no al revés.
-->

| ID | Categoría | Prioridad | Estado | Enunciado |
| -- | --------- | --------- | ------ | --------- |
| NFR-001 | {{característica ISO 25010}} | {{Esencial / Alta / Media / Baja}} | {{Propuesto / Aprobado}} | {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS}} |
| NFR-002 | {{…}} | {{…}} | {{…}} | {{…}} |

## 8. Reglas de negocio

<!--
Sección opcional. Incluir solo si el dominio impone restricciones, obligaciones o prohibiciones que
convenga declarar como reglas explícitas, independientes de un FR-XXX puntual. Eliminar si no aplica.
Cada regla lleva id secuencial BR-01, BR-02, … con enunciado RFC 2119 en MAYÚSCULAS.
-->

- **BR-01:** {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS}} → relacionado con {{FR-XXX}}

## 9. Interfaces externas

<!--
Desglose por tipo, por convención de ISO/IEC/IEEE 29148. Cada subsección es opcional; eliminar la que
no aplique en vez de dejarla vacía. Es existencia y propósito de la interfaz, no su contrato detallado
(endpoints, payloads, protocolos exactos) — eso lo redacta design-define (API-XX) a nivel de US o TK.
-->

### 9.1 Interfaces de usuario

<!-- Canales de interacción humana: web, móvil, CLI, voz, kiosco, etc. Si hay UI propia, el detalle de pantallas vive en la sección 12 (Diseño de interfaz); aquí solo el canal y sus lineamientos generales. -->

- {{canal}}: {{lineamientos generales — guía de estilo a seguir, accesibilidad requerida, dispositivos soportados}}

### 9.2 Interfaces de hardware

<!-- Sección opcional. Dispositivos físicos con los que interactúa el software (sensores, impresoras, POS, lectores). «No aplica» si el requerimiento no interactúa con hardware específico. -->

- {{dispositivo}}: {{naturaleza de la interacción}}

### 9.3 Interfaces de software

<!-- Sistemas, APIs o componentes de terceros con los que se integra (nombre y versión si se conoce). A nivel de existencia — el contrato detallado lo redacta design-define. -->

- {{sistema o API externa}}: {{qué se espera de la integración, a alto nivel}}

### 9.4 Interfaces de comunicaciones

<!-- Sección opcional. Protocolos de red o formatos de mensajería (REST, GraphQL, gRPC, colas, webhooks, sockets). «No aplica» si no hay requisitos de comunicación propios más allá del stack ya elegido. -->

- {{protocolo o mecanismo}}: {{propósito, con quién se comunica}}

## 10. Requisitos de datos

<!--
Sección opcional — incluir si el requerimiento crea, modifica o retiene datos propios. Formaliza la
existencia de las entidades de datos, no su modelo detallado (campos, tipos, relaciones) — eso es
design-define (MD-XX). «No aplica» si el requerimiento no maneja datos propios (p. ej. una integración
de solo lectura).
-->

| Entidad de datos | Descripción | Retención / privacidad | Volumen estimado |
| ------------------ | ------------ | ------------------------ | ------------------- |
| {{nombre de la entidad; p. ej. Factura, Perfil de proveedor}} | {{qué representa}} | {{cuánto tiempo se conserva; si contiene datos personales o sensibles}} | {{orden de magnitud esperado, si se conoce}} |

## 11. Cumplimiento normativo

<!--
Sección opcional — incluir si aplica alguna normativa, regulación o estándar externo (protección de
datos, facturación electrónica, accesibilidad, normativa del sector). «No aplica» si no hay normativa
identificada. Cada fila debe poder trazarse a un FR-XXX o NFR-XXX que la satisfaga — si no hay ninguno
todavía, es una laguna, no se deja la celda vacía sin más.
-->

| Normativa / estándar | Requisito relacionado | Cómo se cumple |
| ----------------------- | ------------------------ | ----------------- |
| {{nombre y, si aplica, artículo o cláusula}} | {{FR-XXX / NFR-XXX}} | {{mecanismo por el cual se satisface}} |

## 12. Diseño de interfaz (wireframes)

<!--
Sección opcional — incluir solo si el requerimiento involucra una interfaz de usuario propia. srs:ui-required
se infiere del objetivo funcional y los FR-XXX (solo se pregunta al usuario si la inferencia es ambigua) —
ver flow.md, paso 4. Eliminar la sección por completo (incluida la marca oculta) si no aplica — p. ej. un
servicio o API sin UI.
Cada fila enlaza a un wireframe generado con assets/wireframe-template.md, uno por pantalla, guardado en
assets/wireframes/[pantalla-slug].md. El SRS no se declara Ready mientras alguna pantalla siga
"Pendiente": las observaciones de la revisión deben quedar reflejadas aquí y en los FR-XXX afectados
antes de cerrar.
-->

<!-- srs:ui-required={{true|false}} -->

**¿Requiere diseño de interfaz?** {{Sí | No}}

<!--
Si es Sí, definir el tipo de solución antes de generar los wireframes (ver flow.md, paso 4): se infiere
del requerimiento (menciones de "app móvil", "sitio web", "panel", el actor y su contexto de uso, el
stack o repositorio ya conocidos) y solo se pregunta si queda ambiguo. Condiciona la navegación de los
wireframes, incluido el `viewBox` de cada SVG (retrato para móvil, ancho para web/escritorio).
-->

**Tipo de solución:** {{Aplicación web / App nativa (iOS) / App nativa (Android) / App híbrida / Aplicación de escritorio}}

**¿Debe ser responsiva (adaptable a distintos tamaños de pantalla)?** {{Sí | No | No aplica — app nativa de un solo dispositivo}}

| Pantalla | Wireframe | Estado de revisión | Observaciones ya incorporadas |
| -------- | --------- | --------------------- | -------------------------------- |
| {{nombre de la pantalla}} | {{enlace a `assets/wireframes/[pantalla-slug].md`}} | {{Pendiente / Revisado con cambios / Aprobado}} | {{resumen de los cambios pedidos y en qué FR-XXX quedaron reflejados; «Ninguna» si se aprobó sin cambios}} |

## 13. Verificación y trazabilidad

<!--
Una fila por cada FR-XXX/NFR-XXX (incluidos los que salieron de la revisión de wireframes). Método de
verificación: Inspección · Análisis · Demostración · Prueba — ver quality-criteria.md#métodos-de-verificación.
El agente PROPONE el método según la naturaleza del requisito y solo pregunta si es ambiguo, mismo
mecanismo que la inferencia de UI. Origen es de dónde salió el requisito (el requerimiento en bruto por
defecto; una referencia a un archivo específico de references/ si vino de una vuelta posterior). "Depende
de" es opcional — vacío o «Ninguna» si no hay dependencia entre requisitos.
Esta tabla NO registra qué US-XXX cubre cada requisito — eso vive en la sección 16 (Historias de usuario
derivadas), que se completa después del handoff y por eso no puede ir aquí.
-->

| ID | Origen | Depende de | Método de verificación | Criterio de verificación |
| -- | ------ | ----------- | -------------------------- | --------------------------- |
| FR-001 | {{`references/raw-requirement.md` u otro archivo puntual}} | {{FR-XXX / «Ninguna»}} | {{Inspección / Análisis / Demostración / Prueba}} | {{condición observable que demuestra que el requisito se cumple}} |

## 14. Riesgos

<!-- Sección opcional. Riesgos identificados sobre los requisitos, supuestos o restricciones ya cerrados — no se espera a que el stack esté resuelto para abrir esta sección, pero puede ampliarse después con riesgos técnicos una vez resuelto (sección 3). Eliminar si no se identificó ninguno. -->

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Relacionado con |
| -- | ------ | -------------- | ------- | ----------- | ------------------ |
| R-01 | {{descripción del riesgo}} | {{Alta / Media / Baja}} | {{Alto / Medio / Bajo}} | {{cómo se reduce o gestiona}} | {{FR-XXX / NFR-XXX / Stack / Supuesto}} |

## 15. Enlaces y archivos de apoyo

<!-- Archivos propios de esta carpeta del SRS — no confundir con la sección 1.4 (referencias a documentos o estándares externos). Solo enlaces a recursos ya almacenados; nunca pegar archivos, imágenes ni descripciones directamente aquí. -->

- **Requerimiento original:** {{enlace markdown a `references/[archivo]`, dentro de esta misma carpeta}}
- **Investigación de stack:** {{enlace a `research/RS-XXX-{slug}/README.md`, si se investigó}}
- **Wireframes:** {{enlace a `assets/wireframes/`, si el requerimiento tiene UI}}
- {{añadir entradas adicionales o indicar «Ninguna por ahora»}}

## 16. Historias de usuario derivadas

<!-- Se completa después del handoff a /work-define, a medida que el requerimiento se descompone. Vacía al crear el SRS. -->

| US-XXX | Título | FR-XXX cubiertos |
| ------ | ------ | ----------------- |
| {{US-XXX}} | {{título}} | {{FR-001, FR-003, …}} |

## Observaciones

- {{decisiones pendientes de stack, repositorios o proyecto base}}
- {{lagunas funcionales o no funcionales sin cerrar}}
- {{wireframes pendientes de revisión o con cambios aún sin trasladar a los FR-XXX}}
- {{requisitos sin método de verificación asignado, o de origen no identificado}}
- {{aclaraciones pendientes del usuario o de producto}}
- {{otras notas relevantes}}

## Validación

### Definition of Ready (DoR)

| Criterio DoR | Estado | Notas |
| ------------ | ------ | ----- |
| Stack tecnológico resuelto | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| Repositorios y proyecto base definidos | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| Requisitos funcionales completos y priorizados | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| Requisitos no funcionales revisados y priorizados | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación; cubre explícitamente Seguridad, Rendimiento, Fiabilidad y Disponibilidad}} |
| Interfaces externas revisadas | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación; usuario, hardware, software, comunicaciones}} |
| Requisitos de datos formalizados | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación}} |
| Cumplimiento normativo trazado | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación}} |
| Diseño de interfaz revisado | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación; No aplica si el requerimiento no tiene UI propia}} |
| Verificación y trazabilidad completas | {{Cumple / No cumple / Parcial}} | {{explicación; todo FR-XXX/NFR-XXX con método de verificación y origen}} |
| Riesgos identificados | {{Cumple / No cumple / Parcial}} | {{explicación; «Ninguno» es una respuesta válida}} |
| Alcance y fuera de alcance claros | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| Sin aclaraciones pendientes | {{Cumple / No cumple / Parcial}} | {{vacío o «Ninguna» en Observaciones; nada pendiente con usuario/producto}} |
