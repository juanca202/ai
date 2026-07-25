<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

Este es el README.md — el INFORME PRINCIPAL de la investigación. Vive en:
  Con artefacto (flujo A):
    US/TK: docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}/README.md
    WI:    docs/specs/work-items/WI-XXX-{kebab-case}/research/RS-XXX-{slug}/README.md
  Sin artefacto (flujos B y C):
    docs/specs/research/RS-XXX-{slug}/README.md   (migración: en el proyecto destino)

Nombre de carpeta: RS-XXX-{slug}
  XXX  → secuencial de tres dígitos dentro de la carpeta base (001, 002, ...)
  slug → descripción corta del tema en kebab-case
         Ej.: RS-001-viabilidad-redis-cache, RS-002-orm-sequelize-a-prisma

Archivos adicionales (solo si el flujo los define, en la misma carpeta):
  Flujo B (migración): discovery.md, validation.md y carpeta validation/
-->

# RS-{{XXX}} — {{Título descriptivo de la investigación}}

**Estado:** {{Draft | Ready}}
**Flujo:** {{Artefacto | Migración | Investigación libre}}
**Artefacto referenciado:** {{US-XXX | TK-XXX | WI-XXX | N/A}}
**Creado por:** {{git config user.name}}
**Fecha:** {{YYYY-MM-DD}}

## Pregunta de investigación

{{Formulación precisa de lo que se quería averiguar. Una o dos oraciones. En una
migración: qué se migra y de qué proyecto origen a qué proyecto destino.}}

## Contexto

{{Si hay artefacto referenciado: resumen del objetivo, criterios o restricciones
que motivaron esta investigación. Si es migración: origen, destino y alcance de lo
que se migra. Si es investigación independiente: contexto del problema.}}

## Hallazgos

{{Resultados concretos organizados por subtema. Datos, comparaciones, limitaciones
o condiciones encontradas. Citar fuentes en línea o al final.}}

### {{Subtema 1}}

{{...}}

### {{Subtema 2 (si aplica)}}

{{...}}

## Decisiones pendientes / opciones evaluadas

<!--
Sección opcional. Úsala sobre todo en el flujo A (lagunas y decisiones pendientes
por tomar). Para cada disyuntiva: opciones consideradas, trade-offs y la opción
recomendada con su justificación. Omitir si no aplica.
-->

- **{{Decisión 1}}** — opciones: {{A / B}}; recomendación: {{opción}} porque {{...}}

## Conclusión y recomendación

{{Respuesta directa a la pregunta de investigación. Recomendación accionable: qué
hacer, qué evitar, qué decidir. Si la investigación es inconclusa, indicar qué
información adicional se necesita.}}

## Archivos adicionales

<!--
Solo si el flujo genera archivos de apoyo en esta misma carpeta. En una migración
(flujo B): enlaces a discovery.md y validation.md. Omitir esta sección si no hay.
-->

- {{[discovery.md](./discovery.md) — mapeo tecnológico, verificación, golden master, riesgos}}
- {{[validation.md](./validation.md) — casos de validación (Golden Master) y sus recursos}}

## Impacto en el artefacto / próximo paso

{{Si hay artefacto (flujo A): qué decisiones, criterios o secciones del US/WI se
ven afectados por estos hallazgos.

Si es migración (flujo B): el dimensionamiento del cambio (grande / pequeño) y el
handoff recomendado — cambio grande → work-define (varias US); cambio pequeño →
work-plan (un WI). El discovery y la validación son la referencia de ese siguiente
paso.

Si es investigación independiente (flujo C): N/A — investigación independiente.}}

## Fuentes

- {{[Título de la fuente](URL)}}
