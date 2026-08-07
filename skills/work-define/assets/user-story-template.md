<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# US-XXX: {{título corto de la historia de usuario}}

**Estado:** {{Draft | Ready}}
**Fecha de creación:** {{YYYY-MM-DD}}
**Última actualización:** {{YYYY-MM-DD}}
**Work Item ({{Sistema}}):** {{enlace markdown al work item del sistema de seguimiento externo — solo si se creó manualmente para esta historia; {{Sistema}} es el nombre corto del sistema (p. ej. "ADO"); omitir línea si no aplica. A diferencia de TK-XXX/WI-XXX/TC-XXX (que sí se sincronizan automáticamente cuando hay un tracker externo vinculado), ningún skill de esta suite crea o pobla este campo por su cuenta para la US — si alguien lo puebla manualmente, regla de fidelidad recomendada: la sección Criterios de aceptación va en el campo dedicado del sistema si lo expone (p. ej. Acceptance Criteria en ADO); el resto del documento (Descripción, Contexto, Fuera de alcance, Reglas de negocio, Referencias, Complejidad, Repositorios, Validación, Observaciones) va en la descripción del work item, serializado por secciones, para que la US pueda reconstruirse completa desde el work item si este .md se pierde — ninguna sección debería omitirse}}

## Descripción

**COMO** {{tipo de usuario}}
**QUIERO** {{necesidad / acción}}
**PARA** {{beneficio / resultado esperado}}

## Contexto

<!-- Sección opcional. Incluir solo si la descripción no es suficiente para entender el alcance o las restricciones del dominio. Eliminar esta sección si no aplica. -->

{{información adicional sobre el dominio, restricciones del negocio, decisiones previas o cualquier contexto necesario para entender la historia}}

## Fuera de alcance

<!-- Sección opcional. Incluir solo si ayuda a delimitar la historia declarando explícitamente qué NO se debe incluir (funcionalidad, casos o entregables que podrían asumirse pero quedan fuera). Eliminar esta sección si no aplica. -->

- {{funcionalidad, caso o entregable que queda fuera del alcance de esta historia; opcionalmente indicar dónde se aborda o por qué se excluye}}

## Reglas de negocio

<!--
Sección opcional. Incluir solo si el dominio impone restricciones, obligaciones o prohibiciones que convenga declarar como reglas explícitas. Eliminar esta sección si no aplica.
Cada regla de negocio lleva id secuencial BR-01, BR-02, … y un enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Cuando existan, cada BR-XX debe estar verificada por al menos un AC-XXX en la sección Criterios de aceptación.
-->

- **BR-01:** {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE…» / «The system MUST NOT…»}} → verificado por {{AC-XXX}}
- **BR-02:** {{…}} → verificado por {{AC-XXX}}

## Referencias

<!--
Incluir únicamente enlaces a recursos ya almacenados; nunca pegar archivos, imágenes ni descripciones directamente aquí.
Recursos válidos: mockups, wireframes, flujos, modelos, diagramas, especificaciones técnicas.
Rutas permitidas: assets/ (recursos propios de esta historia) o docs/specs/technical-docs/ (documentación técnica compartida).
-->

- **Diseño / prototipo:** {{enlace markdown al diseño o prototipo}}
- **Archivo local:** {{enlace markdown al archivo en assets/}}
- {{añadir entradas adicionales o indicar «Ninguna por ahora»}}

## Migración (origen → destino)

<!--
Sección opcional. Incluir solo si esta US es una de las historias en que se descompuso una migración grande entre proyectos, investigada por work-research (flujo «Analizar migración», `research/RS-XXX-{slug}/`) y dimensionada como cambio grande. Eliminar esta sección si no aplica.
-->

**Investigación:** {{enlace a la investigación, típ. `../../research/RS-XXX-{slug}/README.md`}}
**Proyecto origen:** {{nombre / stack principal del origen}}
**Proyecto destino:** {{nombre / stack principal del destino}}

Esta US materializa una porción de la migración investigada en el `RS-XXX` (dimensionada como cambio grande, descompuesta en varias US). Para no duplicar contexto, apóyate en sus archivos (contexto progresivo): el mapeo tecnológico, el estado del origen y los riesgos viven en su `discovery.md`; los casos de validación (Golden Master) en su `validation.md`.

- Los **criterios de aceptación (`AC-XXX`)** de esta US describen el comportamiento migrado; su validación contra los casos Golden Master (`GM-XXX` de `validation.md`) se detalla a nivel de `TK-XXX` en `work-plan` (que ya trae su propia sección Migración para ese mapeo), no aquí.
- Si la migración es incremental, indícalo en **Contexto** con la estrategia (Strangler Fig, Branch by Abstraction, Parallel Run, …) y qué fase cubre esta US específicamente.

## Criterios de aceptación

<!--
Lista plana con id secuencial AC-001, AC-002, … Cada criterio indica su categoría entre paréntesis y el enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Categorías funcionales: Reglas de negocio · Casos de uso · Flujos de proceso · Procesamiento de datos · Integraciones · Interacción de usuario · Salidas del sistema
Categorías no funcionales (ISO/IEC 25010): Idoneidad funcional · Eficiencia de rendimiento · Compatibilidad · Usabilidad · Fiabilidad · Seguridad · Mantenibilidad · Portabilidad
-->

- **AC-001 ({{categoría}}):** {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE…» / «The system MUST NOT…»}}
- **AC-002 ({{categoría}}):** {{…}}

---

## Complejidad sugerida

- **Story points:** {{1 | 2 | 3 | 5 | 8 | 13}}
- **Justificación:** {{justificación breve basada en alcance, riesgo e incertidumbre}}

## Repositorios

<!-- Nombre(s) del/los repositorio(s) git al/los que afecta la historia. Es la referencia de dónde se materializará el trabajo; work-plan la usa para agrupar las tareas por repositorio. -->

- {{repositorio 1; p. ej. frontend-web, api-catalogo, micro-autenticacion}}
- {{repositorio 2}}

## Validación

### INVEST

| Letra | Criterio      | Resultado                      | Notas         |
| ----- | ------------- | ------------------------------ | ------------- |
| **I** | Independiente | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| **N** | Negociable    | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| **V** | Valiosa       | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| **E** | Estimable     | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| **S** | Pequeña       | {{Cumple / No cumple / Parcial}} | {{explicación}} |
| **T** | Testeable     | {{Cumple / No cumple / Parcial}} | {{explicación}} |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado                                     | Notas                                                                        |
| ---------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| Dependencias listas                | {{Cumple / No cumple / Parcial}}             | {{explicación}}                                                                |
| Inputs/outputs claros              | {{Cumple / No cumple / Parcial}}             | {{explicación}}                                                                |
| Repositorios definidos             | {{Cumple / No cumple / Parcial}}             | {{explicación}}                                                                |
| Sin decisiones técnicas pendientes | {{Cumple / No cumple / Parcial}}             | {{explicación}}                                                                |
| Referencias de UI                  | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación}}                                                                |
| Sin aclaraciones pendientes        | {{Cumple / No cumple / Parcial}}             | {{vacío o «Ninguna» en Observaciones; nada pendiente con usuario/producto}}    |

## Observaciones

- {{prerrequisitos o dependencias aún no listas}}
- {{datos o aclaraciones pendientes del usuario o de producto}}
- {{decisiones pendientes}}
- {{otras notas relevantes}}
