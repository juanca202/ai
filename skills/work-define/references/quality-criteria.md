# Criterios de calidad: RFC 2119 / ISO 25010 / INVEST / DoR

Referencia detallada para redactar y validar Historias de Usuario. Las secciones del `SKILL.md` apuntan aquí mediante anclas (`#rfc-2119`, `#iso-25010`, `#invest`, `#definition-of-ready-dor`).

---

## RFC 2119

Tabla de equivalencias para palabras clave normativas (en MAYÚSCULAS en el idioma de preferencia):


| Nivel (semántica RFC 2119) | Inglés (`en`)                | Español (`es`)                          |
| -------------------------- | ---------------------------- | --------------------------------------- |
| Obligación absoluta        | **MUST** / **REQUIRED**      | **DEBE** / **ES OBLIGATORIO**           |
| Prohibición absoluta       | **MUST NOT** / **SHALL NOT** | **NO DEBE** / **ESTÁ PROHIBIDO**        |
| Recomendación fuerte       | **SHOULD** / **RECOMMENDED** | **DEBERÍA** / **ES RECOMENDABLE**       |
| Desaconsejado salvo causa  | **SHOULD NOT**               | **NO DEBERÍA** / **NO ES RECOMENDABLE** |
| Permiso u opcionalidad     | **MAY** / **OPTIONAL**       | **PUEDE** / **OPCIONAL**                |


Elegir una forma por nivel y mantenerla consistente en toda la US. Si el usuario pide no usar RFC 2119, documentarlo en Observaciones; el formato Gherkin en MAYÚSCULAS se mantiene salvo petición explícita en contra.

---

## Categorías de criterios de aceptación

Cada **AC-XXX** declara su categoría entre paréntesis. Las categorías se dividen en dos grupos:

### Categorías funcionales

Usar cuando el criterio describe comportamiento observable del sistema (qué hace, no cómo rinde o se comporta ante cargas):

| Categoría | Cuándo usarla |
| --------- | ------------- |
| Reglas de negocio | Restricciones, obligaciones o prohibiciones que impone el dominio o la organización |
| Casos de uso | Flujos de interacción actor-sistema de inicio a fin |
| Flujos de proceso | Pasos secuenciales o ramificados dentro de un proceso de negocio |
| Procesamiento de datos | Cálculos, transformaciones, validaciones o reglas sobre datos |
| Integraciones | Contratos con sistemas externos, APIs, eventos o mensajería |
| Interacción de usuario | Comportamiento de la interfaz, accesibilidad, retroalimentación al usuario |
| Salidas del sistema | Documentos, reportes, notificaciones, exportaciones generadas |

### Categorías no funcionales (ISO/IEC 25010)

Usar cuando el criterio describe un atributo de calidad medible (rendimiento, seguridad, fiabilidad, etc.):

| Característica (`es`) | Característica (`en`) | Ejemplos |
| --------------------- | --------------------- | -------- |
| Idoneidad funcional | Functional suitability | Completitud de funciones, corrección, pertinencia |
| Eficiencia de rendimiento | Performance efficiency | Tiempos de respuesta, throughput, uso de recursos |
| Compatibilidad | Compatibility | Coexistencia, interoperabilidad |
| Usabilidad | Usability | Accesibilidad, aprendizaje, operabilidad |
| Fiabilidad | Reliability | Disponibilidad, tolerancia a fallos, recuperabilidad |
| Seguridad | Security | Confidencialidad, integridad, autenticación |
| Mantenibilidad | Maintainability | Modularidad, testabilidad, modificabilidad |
| Portabilidad | Portability | Adaptabilidad, instalabilidad |

Elegir la categoría de **primer nivel** que mejor encaje. Si un criterio abarca más de una, dividirlo en `AC-XXX` distintos.

---

## INVEST

Tabla con las seis dimensiones (I, N, V, E, S, T); valor de cada una: `Cumple` / `No cumple` / `Parcial` con nota. Si alguna dimensión falla, documentarlo sin disimular.

| Letra | Criterio      | Qué validar |
| ----- | ------------- | ----------- |
| **I** | Independiente | La historia puede planificarse e implementarse sin depender de otra US incompleta. |
| **N** | Negociable    | El alcance admite ajuste; no es un contrato cerrado de detalle técnico. |
| **V** | Valiosa       | Aporta valor claro al actor / negocio. |
| **E** | Estimable     | Hay información suficiente para asignar story points (Fibonacci). |
| **S** | Pequeña       | Cabe en un incremento razonable; si es grande, dividir. |
| **T** | Testeable     | Los criterios de aceptación (`AC-XXX`) permiten verificación objetiva. |

Si INVEST no es completamente valorable con la información disponible, la historia se crea con `Estado: Draft` y las lagunas documentadas en Observaciones. Las dependencias con otras US o sistemas afectan especialmente las dimensiones **I** y **E**.

---

## Definition of Ready (DoR)

Tabla con los seis criterios de la plantilla. Para cada uno: `Cumple` / `No cumple` / `Parcial` (el criterio **Referencias de UI** admite además `No aplica`).

| Criterio DoR                       | Qué exige |
| ---------------------------------- | --------- |
| Dependencias listas                | Prerrequisitos y dependencias con otras US o sistemas resueltos o confirmados. |
| Inputs/outputs claros              | Entradas y salidas funcionales bien definidas. |
| Repositorios definidos             | Repositorio(s) git al/los que afecta la historia identificados. |
| Sin decisiones técnicas pendientes | No quedan decisiones técnicas abiertas que condicionen el alcance. |
| Referencias de UI                  | Para US de UI: enlaces de diseño presentes (`No aplica` si no hay UI propia). |
| Sin aclaraciones pendientes        | Observaciones vacías o «Ninguna»; nada pendiente con usuario/producto. |

El estado **Ready** requiere todos los datos sin excepción: Criterios de aceptación completos (al menos un `AC-XXX`), DoR completado, repositorios afectados identificados y Observaciones sin pendientes abiertos.
