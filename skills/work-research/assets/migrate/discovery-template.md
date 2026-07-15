<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

Este es un ARCHIVO ADICIONAL del flujo B (migración), no el informe principal.
Vive junto al README.md dentro de la carpeta de la investigación:
  <destino>/docs/specs/research/RS-XXX-{slug}/discovery.md
El informe principal (README.md) lo enlaza en su sección "Archivos adicionales".
-->

# Descubrimiento de Migración

**Estado**: {{Draft | Ready}}
**Investigación**: [README.md](./README.md)
**Fecha**: {{YYYY-MM-DD}}
**Proyecto origen**: {{nombre / stack principal del origen}}
**Proyecto destino**: {{nombre / stack principal del destino}}

## Descripción

{{Descripción corta del objetivo de la migración: qué se migra y para qué.}}

## Entorno del origen

- Ambiente accesible vía web: {{Sí | No}}
- URL del ambiente de pruebas: {{URL o N/A}}
- Notas de acceso: {{restricciones o requisitos de acceso, si aplica}}

## Mapeo Tecnológico

Cada fila representa un elemento tecnológico detectado en el **origen** que es
relevante para lo que se va a migrar, junto con su equivalente en el **destino**.
Si no existe equivalente, se deja una nota explícita en la columna de destino.

| Elemento tecnológico | Origen (con versión)    | Destino (equivalente o nota)    | Equivalencia |
| -------------------- | ----------------------- | ------------------------------- | ------------ |
| {{p. ej. Framework}}   | {{p. ej. Express 4.18}}   | {{p. ej. Fastify 4.x}}            | Adaptación   |
| {{p. ej. ORM}}         | {{p. ej. Sequelize 6.32}} | {{p. ej. Prisma 5.x}}             | Adaptación   |
| {{p. ej. Utilidad}}    | {{p. ej. Moment 2.29}}    | {{p. ej. date-fns 3.x}}           | Directa      |
| {{p. ej. Validación}}  | {{p. ej. Joi 17.9}}       | ⚠️ Sin equivalente identificado | Rediseño     |
| {{p. ej. Polyfill}}    | {{p. ej. core-js 3.x}}    | No necesario en destino         | Eliminar     |

## Estrategia de Verificación Existente

Documenta todo lo que puede ayudar a demostrar que la migración conserva el
comportamiento (pruebas, datos, logs, etc.) y su utilidad para la migración.

| Tipo                           | Cobertura | Ubicación           | Utilidad para la migración    |
| ------------------------------ | --------- | ------------------- | ----------------------------- |
| Unit Tests                     | Parcial   | /tests/unit         | Validar reglas de negocio     |
| Integration Tests              | Baja      | /tests/integration  | Validar APIs                  |
| E2E Tests                      | Alta      | Playwright          | Validar flujos críticos       |
| Postman Collection             | Media     | /docs/api           | Verificar contratos           |
| Datos productivos anonimizados | Alta      | BD respaldo         | Generar Golden Masters        |
| Logs históricos                | Media     | CloudWatch          | Comparación de comportamiento |

## Oportunidades para Golden Master Testing

Componentes candidatos a validarse con Golden Master Testing, según la fuente de
datos/salidas de referencia disponible y su viabilidad.

| Componente                  | Fuente disponible         | Viabilidad |
| --------------------------- | ------------------------- | ---------- |
| Motor de cálculo de tarifas | Unit tests existentes     | Alta       |
| API de cotización           | Logs de producción        | Alta       |
| Proceso de facturación      | Datos históricos          | Media      |
| Módulo de reportes          | Sin datos representativos | Baja       |

## Riesgos

Riesgos identificados para esta migración, su impacto y la mitigación prevista.

| Riesgo                  | Impacto | Mitigación |
| ----------------------- | ------- | ---------- |
| Pérdida de datos        | Alto    | Backups    |
| Diferencias funcionales | Medio   | UAT        |
| Performance             | Alto    | Pruebas    |
| Integraciones rotas     | Alto    | Mocking    |

## Notas

Pendientes que deben resolverse para poder crear el plan de migración (decisiones
abiertas, equivalencias por definir, datos faltantes, validaciones por confirmar,
supuestos a verificar). **Mientras existan pendientes en esta lista, el discovery
permanece en `Draft`.**

- [ ] {{pendiente a resolver}}
