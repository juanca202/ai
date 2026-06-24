# US-XXX: <título corto de la historia de usuario>

- Estado: Draft | Ready
- Fecha de creación: YYYY-MM-DD
- Última actualización: YYYY-MM-DD

## Descripción

**COMO** <tipo de usuario>
**QUIERO** <necesidad / acción>
**PARA** <beneficio / resultado esperado>

## Referencias

- **Diseño / prototipo:** [<nombre descriptivo>](<url>)
- **Archivo local:** [<nombre descriptivo>](assets/<nombre-del-archivo.ext>)
- <añadir entradas adicionales o indicar «Ninguna por ahora»>

## Criterios de aceptación

### Reglas de negocio

- **BR-01** — <enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia; p. ej. «El sistema DEBE…» / «The system MUST NOT…»>
- **BR-02** — <…>

### Requisitos no funcionales <Incluir solo si es necesario>

Cada NFR indica su **característica ISO/IEC 25010** (en el idioma de preferencia) y el enunciado con palabra clave **RFC 2119** en MAYÚSCULAS.

Características: Idoneidad funcional / Functional suitability · Eficiencia de rendimiento / Performance efficiency · Compatibilidad / Compatibility · Usabilidad / Usability · Fiabilidad / Reliability · Seguridad / Security · Mantenibilidad / Maintainability · Portabilidad / Portability.

- **NFR-01** — **[<característica ISO 25010>]** <enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE responder en menos de 200 ms» / «The system MUST NOT expose PII in logs»>
- **NFR-02** — **[<característica ISO 25010>]** <…>

### Escenarios de comportamiento

Cada escenario lleva id secuencial **SC-01**, **SC-02**, … en la línea `Escenario: SC-XX - <nombre>`. Palabra clave Gherkin en TODO MAYÚSCULAS en el idioma de preferencia: DADO/CUANDO/ENTONCES/Y/PERO en español; GIVEN/WHEN/THEN/AND/BUT en inglés.

```gherkin
Escenario: SC-01 - <Nombre del escenario>
<DADO> <precondición>
<CUANDO> <acción>
<ENTONCES> <resultado esperado>
```

## Complejidad sugerida

- **Story points:** <1 / 2 / 3 / 5 / 8 / 13>
- **Justificación:** <justificación breve basada en alcance, riesgo e incertidumbre>

## Unidades de trabajo

- <unidad o área 1; puede ser general — frontend, backend — o específica — micro-autenticacion, client-web>
- <unidad o área 2>

## Validación

### INVEST

| Letra | Criterio      | Resultado                      | Notas         |
| ----- | ------------- | ------------------------------ | ------------- |
| **I** | Independiente | <Cumple / No cumple / Parcial> | <explicación> |
| **N** | Negociable    | <Cumple / No cumple / Parcial> | <explicación> |
| **V** | Valiosa       | <Cumple / No cumple / Parcial> | <explicación> |
| **E** | Estimable     | <Cumple / No cumple / Parcial> | <explicación> |
| **S** | Pequeña       | <Cumple / No cumple / Parcial> | <explicación> |
| **T** | Testeable     | <Cumple / No cumple / Parcial> | <explicación> |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado                                     | Notas                                                                        |
| ---------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| Dependencias listas                | <Cumple / No cumple / Parcial>             | <explicación>                                                                |
| Inputs/outputs claros              | <Cumple / No cumple / Parcial>             | <explicación>                                                                |
| Unidades de trabajo definidas      | <Cumple / No cumple / Parcial>             | <explicación>                                                                |
| Sin decisiones técnicas pendientes | <Cumple / No cumple / Parcial>             | <explicación>                                                                |
| Referencias de UI                  | <Cumple / No cumple / Parcial / No aplica> | <explicación>                                                                |
| Sin aclaraciones pendientes        | <Cumple / No cumple / Parcial>             | <vacío o «Ninguna» en Observaciones; nada pendiente con usuario/producto>    |

## Observaciones

- <prerrequisitos o dependencias aún no listas>
- <datos o aclaraciones pendientes del usuario o de producto>
- <decisiones pendientes>
- <otras notas relevantes>