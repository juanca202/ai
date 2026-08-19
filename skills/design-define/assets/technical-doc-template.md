<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
Un documento por capability. Los elementos llevan id secuencial por tipo (MD-XX, API-XX, FL-XX, DG-XX),
estable en el tiempo: no renumerar aunque se eliminen elementos (marcar como Obsoleto en su lugar).
Cada elemento va precedido de su ancla explícita en la línea anterior al ###, con el id en minúsculas
y sin el nombre: la etiqueta <a> de HTML con id="{{id-en-minusculas}}". Esa ancla (#md-01, #api-04,
#fl-02, #dg-01) es la referencia que consumen US/TK/WI; ver references/element-standards.md.
Las secciones Modelos de datos / APIs / Flujos / Diagramas son opcionales: incluir solo las que la capability necesite.
-->

# Capability: {{nombre de la capability}}

**Fecha de creación:** {{YYYY-MM-DD}}
**Última actualización:** {{YYYY-MM-DD}}

## Propósito

{{una o dos frases: qué cubre esta capability y qué queda fuera de su alcance}}

## Modelos de datos

<!-- Un elemento por modelo/entidad/DTO. Formato detallado en references/element-standards.md del skill design-define. -->

<a id="md-01"></a>
### MD-01: {{nombre del modelo}}

{{descripción breve del modelo y su rol en la capability}}

| Campo | Tipo | Requerido | Descripción | Validaciones / restricciones |
| ----- | ---- | --------- | ----------- | ---------------------------- |
| {{campo}} | {{tipo}} | {{Sí/No}} | {{qué representa}} | {{formato, rango, unicidad, valores permitidos; «—» si no hay}} |

**Relaciones:** {{relaciones con otros modelos (MD-XX de esta u otra capability) o «Ninguna»}}

```mermaid
erDiagram
  {{diagrama ER solo si hay dos o más modelos relacionados; omitir el bloque si no aporta}}
```

## APIs / Endpoints

<a id="api-01"></a>
### API-01: {{operación en verbo — p. ej. Crear factura}}

- **Método y ruta:** `{{POST /api/v1/recurso}}`
- **Autenticación:** {{mecanismo y permisos/roles requeridos, o «Pública»}}
- **Descripción:** {{qué hace y cuándo se usa}}

**Request**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
| --------- | --------- | ---- | --------- | ----------- |
| {{nombre}} | {{path / query / header / body}} | {{tipo o MD-XX}} | {{Sí/No}} | {{…}} |

```json
{{ejemplo de request body; omitir el bloque si no hay body}}
```

**Responses**

| Código | Condición | Cuerpo |
| ------ | --------- | ------ |
| {{200/201}} | {{caso de éxito}} | {{tipo o MD-XX}} |
| {{4XX}} | {{condición de error}} | {{estructura de error estándar del proyecto}} |

```json
{{ejemplo de response de éxito}}
```

## Flujos / Procesos

<a id="fl-01"></a>
### FL-01: {{nombre del flujo}}

- **Disparador:** {{qué inicia el flujo: acción de usuario, evento, programación}}
- **Actores / componentes:** {{quiénes participan}}
- **Resultado:** {{estado final esperado}}

```mermaid
{{sequenceDiagram o flowchart según convenga; ver element-standards.md}}
```

**Pasos**

1. {{paso con actor/componente explícito}}
2. {{…}}

**Manejo de errores**

| Paso | Error posible | Comportamiento esperado |
| ---- | ------------- | ----------------------- |
| {{n}} | {{condición}} | {{reintento, compensación, mensaje, aborto}} |

## Diagramas

<!-- Diagramas estructurales o de arquitectura de la capability: clases, contexto (C4 nivel 1), contenedores (C4 nivel 2), componentes (C4 nivel 3), despliegue, estados. Formato detallado en references/element-standards.md del skill design-define. -->

<a id="dg-01"></a>
### DG-01: {{nombre del diagrama — p. ej. Diagrama de clases del dominio, Contexto de la capability}}

- **Tipo:** {{Clases | Contexto (C4) | Contenedores (C4) | Componentes (C4) | Despliegue | Estados | Otro}}
- **Alcance:** {{qué parte de la capability cubre y qué queda fuera}}

```mermaid
{{classDiagram, C4Context, C4Container, C4Component, stateDiagram-v2… según el tipo; ver element-standards.md}}
```

**Notas**

- {{decisión o aclaración que el diagrama no expresa por sí solo; citar elementos por id (MD-XX, API-XX, FL-XX) cuando aplique; omitir la lista si no hay notas}}

## Observaciones

<!-- Lagunas abiertas, decisiones pendientes, datos por confirmar. Si no hay nada: «Sin pendientes documentados». -->

- {{pendiente concreto, indicando el elemento afectado (MD-XX / API-XX / FL-XX / DG-XX)}}
