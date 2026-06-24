<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# TK-XXX: {{título corto de la tarea}}

Estado: {{Draft | Ready}}
Historia: {{enlace markdown al README.md de la historia US-XXX}}
Unidad de trabajo: {{obligatorio: paquete / módulo / servicio / etc.; inferido del proyecto o indicado por el usuario}}
Asignado a: {{opcional: priorizar lo indicado por el usuario; si no, inferir con `git config user.name`; omitir línea si no aplica}}
ADO Work Item: {{enlace markdown al work item de ADO — solo si se creó; omitir línea si no aplica}}

## Descripción

{{objetivo de la tarea — qué debe quedar hecho o disponible para cumplir la historia; resultado observable o entregable en pocas frases; sin confundir objetivo con diseño técnico}}

## Dependencias

<!-- Inventario de lo que la tarea usa o necesita dentro de la unidad de trabajo: componentes de UI, servicios o APIs internas, modelos / entidades / DTOs, librerías de terceros. No incluir ADRs, technical-docs ni referencias de diseño — eso va en Referencias. -->

- {{nombre o identificador del componente, servicio, modelo, librería}} — {{descripción breve del uso en esta tarea}}

## Referencias

<!--
Incluir únicamente enlaces a recursos ya almacenados; nunca pegar archivos, imágenes ni descripciones directamente aquí.
Recursos válidos: mockups, wireframes, flujos, modelos, diagramas, especificaciones técnicas, ADRs.
Rutas permitidas: assets/ (recursos propios de esta tarea) o docs/specs/technical-docs/ o docs/adr/.
-->

- **Arquitectura:** {{enlace a ADR en `docs/adr/` cuando la tarea dependa de decisiones ya registradas; no inventar ADRs nuevos}}
- **Documentación técnica:** {{enlace a `docs/specs/technical-docs/` si aplica — DTOs, ER, flujos, endpoints}}
- **Diseño:** {{enlace a Figma, wireframe o imagen de alta fidelidad; obligatorio si la tarea es de UI}}

## Plan de implementación

### Archivos afectados

<!-- Árbol con las rutas de los archivos que se crearán, modificarán o eliminarán. Usar símbolos: + creado · ~ modificado · - eliminado. -->

```text
{{unidad-de-trabajo}}/
└── src/
    ├── + {{ruta/archivo-nuevo.ext}}
    ├── ~ {{ruta/archivo-modificado.ext}}
    └── - {{ruta/archivo-eliminado.ext}}
```

### Subtareas

<!-- Pasos concretos acordados o derivados de fuentes citadas en Referencias. Si no se conocen aún, omitir esta subsección e indicar en Observaciones qué falta. -->

- [ ] {{tarea concreta — qué se implementa, no cómo}}
- [ ] {{tarea concreta}}
- [ ] {{tarea concreta}}

## Observaciones

{{usar solo si hay ítems reales: prerrequisitos no cumplidos, información pendiente, bloqueos, decisiones por tomar. Lista clara; no repetir lo ya cubierto en otras secciones. Si no hay pendientes, omitir esta sección o dejar una línea: Sin pendientes documentados}}

- {{pendiente o prerrequisito concreto}}
