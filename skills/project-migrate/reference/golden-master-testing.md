# Construcción de Golden Master Tests

## Objetivo

Preparar un conjunto de casos de Golden Master que permitan verificar que el
comportamiento funcional del sistema se conserva tras la migración. Este
procedimiento se ejecuta en el paso de **Preparación de validación** y su salida
se documenta en `validation.md`; la implementación de las pruebas ocurre después,
en el plan.

## Fundamento y consideraciones

El Golden Master Testing es la misma técnica conocida como *characterization
testing* o *approval testing* (término acuñado por Michael Feathers en *Working
Effectively with Legacy Code*; también llamada snapshot/locking testing). Tener
presentes sus límites mejora la calidad de los casos:

- **Captura el comportamiento actual, no el "correcto".** El golden master
  documenta lo que el sistema hace hoy, no lo que debería hacer. Antes de
  capturar, pregunta al usuario si algún comportamiento actual es un **bug que NO
  debe preservarse**; esos casos se documentan como excepción para no "congelar"
  el error en el destino.
- **No prueba corrección, solo detecta divergencias** entre origen y destino.
- **Requiere repetibilidad.** Los valores volátiles o no deterministas (fechas,
  UUIDs, identificadores temporales, datos de auditoría) deben enmascararse o
  ignorarse (ver `ignore-fields`). Si hay que enmascarar demasiado o es muy
  complejo, el Golden Master puede volverse impráctico para ese caso; entonces
  conviene otra estrategia (p. ej. aserciones específicas).
- **Muestreo para espacios de entrada grandes.** Cuando el universo de entradas
  es muy amplio, no se enumeran todas: se toma una muestra representativa de
  escenarios (happy path, límites, errores) en lugar de cobertura exhaustiva.

## Procedimiento

Para cada componente, proceso o funcionalidad migrada, **intenta obtener
mecanismos de validación existentes antes de construir nuevos Golden Masters**.

### Paso 1. Identificar activos de validación existentes

Revisar si existen: unit tests, integration tests, E2E tests, casos UAT, scripts
de prueba, datos de prueba históricos, y ejemplos de entradas y salidas
documentadas. Si estos activos son suficientes para validar el comportamiento,
pueden reutilizarse parcial o totalmente. Apóyate en la tabla "Estrategia de
Verificación Existente" del discovery.

### Paso 2. Solicitar información al usuario

Cuando no existan mecanismos de validación suficientes, usa la herramienta de
preguntas estructuradas (`ask_user_input_v0`) para solicitar al usuario: casos de
uso principales, escenarios críticos del negocio, ejemplos reales de entradas,
ejemplos de salidas esperadas, casos límite conocidos y casos que históricamente
hayan producido errores.

Ejemplo de solicitud:

> Por favor proporcione para esta funcionalidad:
> - 3 a 10 ejemplos reales de entrada.
> - El resultado esperado para cada ejemplo.
> - Casos límite relevantes.
> - Reglas de negocio que deban preservarse exactamente.

### Paso 3. Capturar comportamiento actual

Cuando el sistema origen sea ejecutable: ejecutar los escenarios recopilados,
capturar las salidas reales del sistema origen y almacenarlas como Golden Master.

Cuando el sistema origen no sea ejecutable: utilizar documentación existente,
ejemplos proporcionados por el usuario y registros históricos disponibles.

Si el usuario indica que las entradas y salidas pueden obtenerse desde una
aplicación web y el **MCP de Chrome** está disponible, úsalo para extraerlas
siguiendo sus indicaciones (navegando a la URL del ambiente de pruebas registrada
en el discovery).

Almacena cualquier recurso extraído (entradas, salidas de referencia, capturas,
diagramas, etc.) en la carpeta `validation/` de la migración; pueden ser archivos
JSON, imágenes, flujos en Mermaid, etc. Referéncialos desde `validation.md`.

### Paso 4. Definir la comparación

Determinar qué campos deben compararse, qué diferencias son aceptables y qué
valores deben ignorarse. Ejemplos de exclusiones: fechas de generación, UUIDs,
identificadores temporales e información de auditoría.

### Paso 5. Definir el caso de Golden Master

Documenta cada caso en `validation.md` con: descripción del escenario, datos de
entrada, salida de referencia, estrategia de comparación y criterio de
aceptación. (La implementación de la prueba como tal se realiza luego, en el
plan.)

## Priorización

Si no es posible cubrir toda la funcionalidad, priorizar en este orden:

1. Procesos críticos para el negocio.
2. Funcionalidades de alta complejidad.
3. Componentes con alto riesgo de regresión.
4. Componentes sin pruebas automatizadas existentes.

## Criterio mínimo de cobertura

Para cada funcionalidad migrada se debe intentar obtener al menos: un escenario
exitoso principal, un caso límite y un caso de error o validación.

## Cómo documentarlo en `validation.md`

Los casos preparados se documentan en `validation.md` con dos partes.

### 1. Tabla resumen

| ID     | Componente     | Estrategia           | Fuente de datos  | Recursos             | Estado    |
| ------ | -------------- | -------------------- | ---------------- | -------------------- | --------- |
| GM-001 | InvoiceService | Comparación JSON     | Ejemplos usuario | ./validation/gm-001/ | Listo     |
| GM-002 | MonthlyReport  | Comparación PDF      | Sistema origen   | ./validation/gm-002/ | Pendiente |
| GM-003 | CustomerImport | Comparación DB State | Datos históricos | ./validation/gm-003/ | Pendiente |

### 2. Detalle por cada caso

Elige el formato según el tipo de componente. Los recursos referenciados
(entradas, salidas de referencia, capturas) se guardan en la carpeta
`validation/` de la migración.

#### Opción 1 — Formato simple (recomendado)

```yaml
id: GM-001
name: Cálculo de impuestos de factura
priority: High
component: InvoiceService
objective: >
  Verificar que el cálculo de impuestos conserva el mismo
  comportamiento después de la migración.
input-source:
  type: user-provided
inputs:
  - subtotal: 100
    taxRate: 12
golden-master-generation:
  source-system: LegacyInvoiceService
  execution:
    - Crear factura con subtotal 100
    - Aplicar impuesto 12%
    - Capturar respuesta JSON completa
comparison:
  type: json-structural
ignore-fields:
  - generatedAt
  - requestId
acceptance:
  exact-match: true
```

#### Opción 2 — Orientado a APIs

Útil al migrar servicios REST.

```yaml
id: GM-API-001
endpoint: POST /api/invoices/calculate
capture:
  source-environment: legacy
request:
  body:
    subtotal: 100
    taxRate: 12
golden-master:
  store-as: ./validation/gm-api-001/response.json
comparison:
  strategy: json
ignore-fields:
  - timestamp
  - correlationId
acceptance:
  differences-allowed: false
```

#### Opción 3 — Orientado a UI

Si vas a usar Playwright o Cypress.

```yaml
id: GM-UI-001
feature: Crear factura
capture:
  source-system: Legacy Web App
steps:
  - Abrir pantalla de facturas
  - Presionar "Nueva factura"
  - Ingresar subtotal 100
  - Ingresar impuesto 12%
  - Presionar Guardar
golden-master:
  capture:
    - rendered-html
    - api-response
    - database-state
comparison:
  rendered-html:
    ignore:
      - generatedAt
  database-state:
    ignore:
      - created_at
      - updated_at
```
