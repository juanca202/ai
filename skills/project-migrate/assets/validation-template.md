<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Preparación de Validación

**Estado**: {{Draft | Ready}}
**Fecha**: {{YYYY-MM-DD}}
**Discovery**: [discovery.md](./discovery.md)
**Proyecto origen**: {{nombre / stack principal del origen}}
**Proyecto destino**: {{nombre / stack principal del destino}}

## Descripción

{{Objetivo: a partir de las oportunidades de Golden Master Testing del discovery,
preparar los casos de validación y reunir sus insumos (entradas y salidas de
referencia). Estos casos servirán para implementar las pruebas durante el plan.}}

## Casos de validación

| ID     | Componente     | Estrategia           | Fuente de datos  | Recursos              | Estado    |
| ------ | -------------- | -------------------- | ---------------- | --------------------- | --------- |
| GM-001 | InvoiceService | Comparación JSON     | Ejemplos usuario | ./validation/gm-001/  | Listo     |
| GM-002 | MonthlyReport  | Comparación PDF      | Sistema origen   | ./validation/gm-002/  | Pendiente |
| GM-003 | CustomerImport | Comparación DB State | Datos históricos | ./validation/gm-003/  | Pendiente |

Detalle por cada caso (formato simple recomendado; para APIs o UI usa las
variantes de `references/golden-master-testing.md`):

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

## Recursos de validación

Recursos extraídos y almacenados en `./validation/` para construir e implementar
las pruebas (entradas, salidas de referencia, capturas, diagramas, etc.). Pueden
ser JSON, imágenes, flujos en Mermaid, etc.

| Recurso                                  | Tipo | Caso   | Propósito                   |
| ---------------------------------------- | ---- | ------ | --------------------------- |
| ./validation/gm-001/input-happy.json     | JSON | GM-001 | Entrada del escenario feliz |
| ./validation/gm-001/expected-happy.json  | JSON | GM-001 | Salida de referencia        |

## Notas

Pendientes para completar la preparación de validación: casos en `Pendiente`
(sin insumos), preguntas abiertas al usuario y extracciones por hacer (p. ej. vía
MCP de Chrome desde la URL del ambiente de pruebas registrada en el discovery).
**Mientras exista algún caso pendiente, este documento permanece en `Draft`.**

- [ ] {{pendiente a resolver}}
