# Entrevista de levantamiento: secuencia, olas y roles

Guion que gobierna **cómo se conduce la entrevista** de `requirement-refine`: en qué orden se levanta la información (la secuencia), en qué momento se pregunta cada bloque (las olas) y **a qué rol se le habla** en cada pregunta (los roles). No sustituye la mecánica de preguntas de [`flow.md`](flow.md) ni de [`../../../reference/asking.md`](../../../reference/asking.md) — tandas de hasta 3, lotes, inferir primero — sino que define **el contenido y el lenguaje** de esas preguntas.

**El problema que este guion evita:** los SRS generados por IA tienden a mezclar **requisitos** con **decisiones de diseño**, porque todas las preguntas se hacen en el mismo plano y a un interlocutor genérico. Aquí cada pregunta pertenece a un dominio, se formula en el lenguaje del rol que puede responderla, y **el agente es el único que integra** las respuestas en el documento. Un rol nunca responde por otro: si una pregunta de negocio deriva en una respuesta técnica (o viceversa), la parte fuera de dominio se anota y se reformula al rol correcto en su ola.

---

## La secuencia (columna vertebral)

Todo levantamiento recorre estas etapas, en este orden. Cada etapa alimenta secciones concretas del SRS y tiene un rol dueño; el paso de `flow.md` donde se ejecuta está en la última columna.

| # | Etapa | Qué captura | Rol dueño | Alimenta | Paso de `flow.md` |
|---|-------|-------------|-----------|----------|-------------------|
| 01 | **Idea** | El requerimiento en bruto, tal como llega | — (insumo) | `references/` | 2 |
| 02 | **Problema** | Qué duele hoy, a quién y con qué frecuencia/costo | PO | 1. Introducción | 3 (Ola 1) |
| 03 | **Objetivo de negocio** | Qué resultado de negocio se busca y cómo se mediría | PO | 1. Introducción (propósito, alcance) | 3 (Ola 1) |
| 04 | **Actores / stakeholders** | Quién usa, quién decide, quién se ve afectado | PO | 2. Descripción general (actores) | 3 (Ola 1) |
| 05 | **Proceso actual** | Cómo se resuelve hoy (manual, otro sistema, no se resuelve) | PO | 2. Descripción general | 3 (Ola 1) |
| 06 | **Resultado deseado** | Cómo se ve el proceso cuando esto exista; qué queda fuera | PO | Alcance / fuera de alcance | 3 (Ola 1) |
| 07 | **Reglas de negocio** | Restricciones del dominio independientes de la solución | PO | `BR-XX` | 3 (Ola 1) |
| 08 | **Requisitos funcionales** | Qué debe hacer el sistema (capacidades, no pantallas ni tablas) | PO | `FR-XXX` | 3 (Ola 2) |
| 09 | **Criterios de aceptación** | Cómo sabrá el negocio que cada requisito se cumplió | PO | Criterio de verificación por `FR-XXX` | 5 (Ola 2) |
| 10 | **Experiencia de usuario** | Pantallas, flujos de interacción, tipo de solución, responsividad | UX | 12. Diseño de interfaz, wireframes | 4 (Ola 2) |
| 11 | **Requisitos de calidad** | Rendimiento, seguridad, fiabilidad, usabilidad medibles | ARCH | `NFR-XXX` | 3 (Ola 2) |
| 12 | **Restricciones técnicas** | Límites impuestos: tecnología obligada, infra, presupuesto, plazos | ARCH | Restricciones; insumo de pasos 7-9 | 3 (Ola 2) |
| 13 | **Preocupaciones arquitectónicas** | Integraciones, interfaces externas, datos (entidades, retención, volumen), cumplimiento normativo | ARCH | 8-11 del SRS | 3 (Ola 2) |
| 14 | **Análisis de gaps** | Huecos: FR sin criterio, actor sin flujo, integración sin contrato | los tres | Observaciones / nuevas tandas | 12 (Ola 3) |
| 15 | **Revisión cruzada** | Contradicciones y ambigüedades entre dominios | los tres | Observaciones / nuevas tandas | 12 (Ola 3) |
| 16 | **Trazabilidad** | Origen y dependencias de cada requisito, completos | — (agente) | 13. Verificación y trazabilidad | 5 y 12 |
| 17 | **Requirement Ready** | DoR cumplida, validación externa superada | — (agente) | `Estado: Ready` | 13 |

> **Etapa 09 — alcance.** En el SRS, los «criterios de aceptación» son los **criterios de verificación** de cada `FR-XXX`/`NFR-XXX` (términos observables y medibles, ver [`quality-criteria.md#verificabilidad`](quality-criteria.md#verificabilidad)). Los `AC-XXX` granulares por historia de usuario **no se crean aquí** — son de `work-define`, después del handoff.

La secuencia es de **contenido**, no un cuestionario rígido: si el requerimiento en bruto ya cubre una etapa, se registra y no se repregunta (regla de `flow.md`); si una respuesta reabre una etapa anterior, se vuelve a ella antes de avanzar. Lo que no se altera es la dirección general: **nunca** levantar restricciones técnicas antes de entender el problema, ni pedir pantallas antes de conocer los requisitos funcionales.

---

## Las tres olas

Las etapas se agrupan en tres olas de entrevista. Cada ola tiene participantes definidos; dentro de una ola, las tandas de preguntas se agrupan **por rol** (una tanda no mezcla preguntas de dominios distintos).

```
OLA 1 — DISCOVERY      (etapas 02-07)
PO → problema, objetivo de negocio, actores, proceso actual,
     resultado deseado, reglas de negocio

OLA 2 — DEFINITION     (etapas 08-13)
PO   → requisitos funcionales y sus criterios de verificación
UX   → experiencia de usuario, pantallas, tipo de solución
ARCH → requisitos de calidad, restricciones técnicas,
       integraciones, datos, cumplimiento normativo

OLA 3 — VALIDATION     (etapas 14-16)
PO + UX + ARCH → detectar gaps, contradicciones, ambigüedades
                 y decisiones pendientes sobre el documento completo
```

- **Ola 1** es solo PO: no se menciona tecnología, pantallas ni arquitectura, aunque el usuario las traiga — se anotan y se difieren a la Ola 2 (con la única excepción de duda funcional-técnica de `flow.md`, que se resuelve puntualmente).
- **Ola 2** ordena sus bloques PO → UX → ARCH (mismo orden funcional-primero del flujo). El bloque ARCH de esta ola cubre las etapas 11-13; la resolución completa del stack, repositorios y proyecto base sigue siendo de los pasos 7-9 de `flow.md`, alimentada por lo que aquí se levante.
- **Ola 3** no levanta información nueva: revisa lo levantado. Sus hallazgos se convierten en nuevas tandas dirigidas al rol dueño de cada hueco.

---

## Los roles

Tres roles responden la entrevista: **Product Owner (PO)**, **UI/UX** y **Arquitecto de software (ARCH)**. En la práctica puede ser la misma persona quien responda por los tres; los roles siguen aplicando — definen **qué se le pregunta con qué sombrero puesto y en qué lenguaje**, no cuántas personas hay.

| Rol | Dominio (solo esto responde) | Lenguaje de sus preguntas |
|-----|------------------------------|----------------------------|
| **PO** | Problema, negocio, actores, procesos, reglas, capacidades funcionales, criterios de aceptación | Negocio: procesos, clientes, costos, resultados. Sin jerga técnica ni de diseño. |
| **UX** | Flujos de interacción, pantallas, navegación, contexto de uso, accesibilidad, responsividad | Experiencia: qué ve y hace el usuario, en qué dispositivo, en qué situación. Sin implementación. |
| **ARCH** | Atributos de calidad, restricciones técnicas, integraciones, datos, normativa, riesgos técnicos | Técnico: sistemas, contratos, volúmenes, umbrales, dependencias. |

**Cada pregunta, en el lenguaje de su rol.** El mismo hueco se pregunta distinto según a quién va dirigido:

- A un PO **no** se le pregunta *«¿la API de notificaciones es síncrona o asíncrona?»* sino *«cuando se aprueba una solicitud, ¿el cliente debe enterarse al instante o basta con que le llegue en unos minutos?»* — la respuesta de negocio le da al agente el dato para derivar el requisito.
- A UX **no** se le pregunta *«¿qué componente usamos para la lista?»* sino *«cuando el repartidor abre la app en la calle, ¿qué es lo primero que necesita ver?»*.
- A ARCH sí se le pregunta en técnico: *«¿el ERP expone API REST o el intercambio es por archivos? ¿qué volumen diario de registros?»*.

**Frontera dura entre roles:** una pregunta de un dominio nunca se le formula a otro rol «para avanzar». Si el usuario, respondiendo como PO, dicta una decisión técnica espontánea, el agente la registra como **candidata** y la confirma en el bloque ARCH de la Ola 2 — no la escribe directo al SRS como restricción.

**El agente integra; los roles no redactan.** Las respuestas son insumo: el agente las traduce a `FR-XXX`/`NFR-XXX`/`BR-XX` con RFC 2119, categorías y prioridad, mantiene la trazabilidad (etapa 16: cada requisito con su origen — qué rol, qué respuesta) y resuelve en qué sección del SRS vive cada cosa.

---

## Requisitos vs. decisiones de diseño

Regla transversal de redacción, verificada de nuevo en la Ola 3:

- Un **requisito** declara **qué** debe lograr el sistema y **cómo se verifica** (resultado + umbral). Un enunciado que nombra una tecnología, librería, pantalla concreta o estructura interna es una **decisión de diseño** — no va en `FR-XXX`/`NFR-XXX`, **salvo que esa tecnología sea explícitamente una restricción** impuesta (mandato del cliente, integración obligada, estándar corporativo): entonces va en **Restricciones** (o como `NFR-XXX` de compatibilidad), con su porqué.
- *«El sistema MUST notificar al cliente en menos de 1 minuto tras la aprobación»* es requisito; *«usar WebSockets con Socket.io»* es diseño. *«El backend MUST integrarse con el ERP SAP existente»* es restricción legítima — el sistema con el que se integra no es opcional.
- Los wireframes de UX son **apoyo de entendimiento** (baja fidelidad, ver paso 4 de `flow.md`), no especificación visual final: el detalle de diseño llega después, fuera de este skill.

---

## Ola 3 en detalle (paso 12 de `flow.md`)

Con el `README.md` ya redactado:

1. **Análisis de gaps (etapa 14)** — el agente recorre el documento buscando huecos estructurales: `FR-XXX` sin criterio de verificación, actor declarado que ningún requisito atiende, pantalla sin `FR-XXX` que la respalde (o al revés), integración mencionada sin interfaz externa, dato personal sin entrada de cumplimiento normativo, `NFR-XXX` sin umbral medible.
2. **Revisión cruzada (etapa 15)** — contradicciones **entre dominios**: lo que dijo el PO vs. lo que implican los wireframes vs. lo que impuso ARCH (p. ej. «tiempo real» del PO contra un intercambio por archivos nocturno del ERP; un flujo UX que requiere un dato que ningún requisito de datos captura). Cada contradicción o ambigüedad se lista con los roles involucrados.
3. **Validación externa con subagente sin contexto** — lanzar un **subagente limpio, sin el contexto de la sesión** (solo puede leer la carpeta del SRS: `README.md`, `references/`, `assets/`), con el encargo de responder: *¿este documento contiene todo lo necesario para que un equipo que no participó en la entrevista lo implemente sin volver a preguntar?* Debe reportar: información faltante, enunciados ambiguos o no verificables, mezclas de requisito con decisión de diseño, e inconsistencias internas. Al no arrastrar la conversación, no puede «rellenar» huecos con lo que se habló pero no se escribió — que es exactamente lo que se quiere detectar.
4. **Resolver los hallazgos** — consolidar los de 1-3 (deduplicados) y, si los hay, convertirlos en tandas de preguntas **dirigidas al rol dueño de cada hueco**, en su lenguaje (mismo mecanismo del paso 3). Aplicar las respuestas al documento y repetir la validación externa solo si los cambios fueron sustanciales.
5. **Sin hallazgos pendientes** → etapa 17: evaluar la DoR ([`quality-criteria.md#definition-of-ready-dor-del-srs`](quality-criteria.md#definition-of-ready-dor-del-srs)) y promover a `Ready` si se cumple. Hallazgos que el usuario decida no resolver quedan en **Observaciones** y mantienen el SRS en `Draft`.
