# Plantilla de investigación — RS-XXX

<!--
Convención de placeholders: sustituir manualmente cada {{texto}}.
Eliminar este bloque al publicar el documento final.

Ubicación por tipo de artefacto:
  US: docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}.md
  WI: docs/specs/work-items/WI-XXX-{kebab-case}/research/RS-XXX-{slug}.md
  MG: docs/specs/migrations/MG-XXX-{slug}/research/RS-XXX-{slug}.md
  Sin artefacto: presentar en chat; guardar solo si el usuario lo solicita.

Nombre de archivo: RS-XXX-{slug}.md
  XXX  → secuencial de tres dígitos dentro del artefacto padre (001, 002, ...)
         Si no hay artefacto padre, usar secuencial global en docs/specs/research/.
  slug → descripción corta en kebab-case del tema investigado.
         Ejemplo: RS-001-viabilidad-redis-cache, RS-002-impacto-refactor-pagos
-->

# RS-{{XXX}} — {{Título descriptivo de la investigación}}

**Estado**: {{Draft | Ready}}
**Dominio**: {{Producto | Arquitectura | Técnica | Cambio}}
**Artefacto referenciado**: {{US-XXX | WI-XXX | MG-XXX | N/A}}
**Creado por**: {{git config user.name}}
**Fecha**: {{YYYY-MM-DD}}

## Pregunta de investigación

{{Formulación precisa de lo que se quería averiguar. Una o dos oraciones.}}

## Contexto del artefacto

{{Si hay artefacto referenciado: resumen del objetivo, criterios relevantes o plan que motivaron esta investigación. Si no hay artefacto, describir el contexto del problema.}}

> Si no aplica artefacto: "Investigación independiente."

## Hallazgos

{{Resultados concretos organizados por subtema. Incluir datos, comparaciones, limitaciones o condiciones encontradas. Citar fuentes en línea con el texto o al final.}}

### {{Subtema 1}}

{{...}}

### {{Subtema 2 (si aplica)}}

{{...}}

## Conclusión y recomendación

{{Respuesta directa a la pregunta de investigación. Recomendación accionable: qué hacer, qué evitar, qué decidir. Si la investigación es inconclusa, indicar qué información adicional se necesita.}}

## Impacto en el artefacto

{{Si hay artefacto: qué decisiones, criterios o secciones del US/WI/MG se ven afectados por estos hallazgos. Si no hay artefacto, omitir esta sección.}}

## Fuentes

- {{[Título de la fuente](URL)}}
