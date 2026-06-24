<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# US-XXX: {{título corto de la historia de usuario}}

Estado: {{Draft | Ready}}
Fecha de creación: {{YYYY-MM-DD}}
Última actualización: {{YYYY-MM-DD}}
ADO Work Item: {{enlace markdown al work item de ADO — solo si se creó; omitir línea si no aplica}}

## Descripción

**COMO** {{tipo de usuario}}
**QUIERO** {{necesidad / acción}}
**PARA** {{beneficio / resultado esperado}}

## Contexto

<!-- Sección opcional. Incluir solo si la descripción no es suficiente para entender el alcance o las restricciones del dominio. Eliminar esta sección si no aplica. -->

{{información adicional sobre el dominio, restricciones del negocio, decisiones previas o cualquier contexto necesario para entender la historia}}

## Reglas de negocio

<!--
Cada regla de negocio lleva id secuencial BR-01, BR-02, … y un enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Cada BR-XX debe estar verificada por al menos un AC-XXX en la sección Criterios de aceptación.
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

## Criterios de aceptación

<!--
Lista plana con id secuencial AC-001, AC-002, … Cada criterio indica su categoría entre paréntesis y el enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Categorías funcionales: Reglas de negocio · Casos de uso · Flujos de proceso · Procesamiento de datos · Integraciones · Interacción de usuario · Salidas del sistema
Categorías no funcionales (ISO/IEC 25010): Idoneidad funcional · Eficiencia de rendimiento · Compatibilidad · Usabilidad · Fiabilidad · Seguridad · Mantenibilidad · Portabilidad
-->

- **AC-001 ({{categoría}}):** {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE…» / «The system MUST NOT…»}}
- **AC-002 ({{categoría}}):** {{…}}

### Escenarios de comportamiento

<!-- Cada escenario cubre uno o varios AC-XXX. Palabra clave Gherkin en TODO MAYÚSCULAS en el idioma de preferencia: DADO/CUANDO/ENTONCES/Y/PERO en español; GIVEN/WHEN/THEN/AND/BUT en inglés. -->

```gherkin
Escenario: SC-01 - {{Nombre del escenario}}
{{DADO}} {{precondición}}
{{CUANDO}} {{acción}}
{{ENTONCES}} {{resultado esperado}}
```

---

## Complejidad sugerida

- **Story points:** {{1 | 2 | 3 | 5 | 8 | 13}}
- **Justificación:** {{justificación breve basada en alcance, riesgo e incertidumbre}}

## Unidades de trabajo

<!-- Referencia/puntero. El registro canónico de unidades de trabajo es docs/specs/work-units.md (gestionado por work-plan); aquí solo se nombran, no se duplica su alcance. -->

- {{unidad o área 1; puede ser general — frontend, backend — o específica — micro-autenticacion, client-web}}
- {{unidad o área 2}}

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
| Unidades de trabajo definidas      | {{Cumple / No cumple / Parcial}}             | {{explicación}}                                                                |
| Sin decisiones técnicas pendientes | {{Cumple / No cumple / Parcial}}             | {{explicación}}                                                                |
| Referencias de UI                  | {{Cumple / No cumple / Parcial / No aplica}} | {{explicación}}                                                                |
| Sin aclaraciones pendientes        | {{Cumple / No cumple / Parcial}}             | {{vacío o «Ninguna» en Observaciones; nada pendiente con usuario/producto}}    |

## Observaciones

- {{prerrequisitos o dependencias aún no listas}}
- {{datos o aclaraciones pendientes del usuario o de producto}}
- {{decisiones pendientes}}
- {{otras notas relevantes}}
