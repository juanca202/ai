<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# TK-XXX: {{título corto de la tarea}}

**Estado:** {{Draft | Ready}}
**Historia:** {{enlace markdown al README.md de la historia US-XXX}}
**Repositorio:** {{obligatorio: nombre del repositorio git al que afecta la tarea; inferido del repo (git remote / carpeta) o indicado por el usuario}}
**Asignado a:** {{opcional: priorizar lo indicado por el usuario; si no, inferir con `git config user.name`; omitir línea si no aplica}}
**Work Item ({{Sistema}}):** {{enlace markdown al work item creado en el sistema de seguimiento vinculado — solo si se creó; {{Sistema}} es el nombre corto que define el archivo de referencia del sistema (p. ej. "ADO" para references/azure-devops.md); omitir línea si no aplica}}

## Descripción

{{objetivo de la tarea — qué debe quedar hecho o disponible para cumplir la historia; resultado observable o entregable en pocas frases; sin confundir objetivo con diseño técnico}}

## Dependencias

<!-- Inventario de lo que la tarea usa o necesita dentro del alcance de la tarea: componentes de UI, servicios o APIs internas, modelos / entidades / DTOs, librerías de terceros. No incluir ADRs, technical-docs ni referencias de diseño — eso va en Referencias. -->

- {{nombre o identificador del componente, servicio, modelo, librería}} — {{descripción breve del uso en esta tarea}}

## Referencias

<!--
Incluir únicamente enlaces a recursos ya almacenados; nunca pegar archivos, imágenes ni descripciones directamente aquí.
Recursos válidos: mockups, wireframes, flujos, modelos, diagramas, especificaciones técnicas, ADRs.
Rutas permitidas: assets/ (recursos propios de esta tarea) o docs/specs/technical-docs/ o docs/adr/.
-->

- **Arquitectura:** {{enlace a ADR en `docs/adr/` cuando la tarea dependa de decisiones ya registradas; no inventar ADRs nuevos}}
- **Documentación técnica:** {{enlace a `docs/specs/technical-docs/[capability].md#<id>` si aplica — DTOs, ER, flujos, endpoints. El ancla es el id del elemento en minúsculas (`#md-01`, `#api-04`), tal como lo devuelve `design-define`; no el título convertido a slug}}
- **Diseño:** {{enlace a Figma, wireframe o imagen de alta fidelidad; obligatorio si la tarea es de UI}}

## Migración (origen → destino)

<!-- Sección opcional. Incluir solo si esta tarea ejecuta una migración entre proyectos derivada de una investigación (`research/RS-XXX-{slug}/`). Eliminar esta sección si no aplica. -->

**Investigación:** {{enlace a la investigación, típ. `../../research/RS-XXX-{slug}/README.md`}}
**Proyecto origen:** {{nombre / stack principal del origen}}
**Proyecto destino:** {{nombre / stack principal del destino}}

Esta tarea materializa parte de la migración investigada en el `RS-XXX`. Para no duplicar contexto, apóyate en sus archivos (contexto progresivo): el mapeo tecnológico, el estado del origen y los riesgos viven en su `discovery.md`; los casos de validación (Golden Master) en su `validation.md`.

- **Archivos afectados** muestra el árbol resultante en el destino; el árbol de lo que se migra en el origen vive en el `discovery.md`.
- Los **criterios de aceptación (`AC-XXX`) de la US** se validan con los casos Golden Master de `validation.md`: indica el/los `GM-XXX` que cubren cada criterio relevante para esta tarea.
- Si la migración es incremental, organiza el **Plan de implementación** por fases según la estrategia elegida.

## Archivos afectados

<!-- Árbol con las rutas de los archivos que se crearán, modificarán o eliminarán. Usar símbolos: + creado · ~ modificado · - eliminado. Frente a cada archivo, una descripción muy corta y acotada de qué se hace en él. -->

```text
{{repositorio}}/
└── src/
    ├── + {{ruta/archivo-nuevo.ext}}        # {{qué se crea aquí: muy corto}}
    ├── ~ {{ruta/archivo-modificado.ext}}   # {{qué se cambia aquí: muy corto}}
    └── - {{ruta/archivo-eliminado.ext}}    # {{por qué se elimina: muy corto}}
```

## Plan de implementación

<!--
Pasos concretos acordados o derivados de fuentes citadas en Referencias. Si no se conocen aún, omitir esta subsección e indicar en Observaciones qué falta.
Cada tarea lleva id secuencial IT-01, IT-02, … único en el ámbito del documento; renumerar si se reordenan o eliminan tareas.
Estados del checkbox durante la implementación: `[ ]` pendiente · `[~]` en progreso (solo una a la vez) · `[x]` completada.
Formato: `IT-XX` + una **descripción corta** de una línea (qué se implementa) — es lo único que se muestra en la herramienta de to-dos. El detalle amplía el **qué** (precisiones, referencias a recursos o código, notas) — nunca el cómo — y va en las líneas indentadas debajo; no se muestra en los to-dos.
-->

- [ ] **IT-01** — {{descripción corta en una línea: qué se implementa}}
  {{detalle opcional que amplía el qué se implementa, no el cómo: precisiones, referencias a recursos o código, notas; no se muestra en to-dos}}
- [ ] **IT-02** — {{descripción corta en una línea}}
- [ ] **IT-03** — {{descripción corta en una línea}}

## Observaciones

{{usar solo si hay ítems reales: prerrequisitos no cumplidos, información pendiente, bloqueos, decisiones por tomar. Lista clara; no repetir lo ya cubierto en otras secciones. Si no hay pendientes, omitir esta sección o dejar una línea: Sin pendientes documentados}}

- {{pendiente o prerrequisito concreto}}
