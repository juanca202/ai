<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# WI-XXX: {{título corto del work item}}

- Estado: {{Draft | Ready}}
- Tipo: {{bug | refactor | deuda-técnica | dependencias | operativa}}
- Repositorio: {{obligatorio para Ready: nombre del repositorio git al que afecta el work item; inferido del repo (git remote / carpeta) o indicado por el usuario}}
- Asignado a: {{opcional: priorizar lo indicado por el usuario; si no, inferir con `git config user.name`; omitir línea si no aplica}}
- ADO Work Item: {{enlace markdown al work item de ADO — solo si se creó; omitir línea si no aplica}}

## Descripción

{{qué motiva el work item: el problema, la necesidad o el comportamiento esperado — el *qué*, no el cómo. Para un bug: qué falla y cómo se reproduce. Para un refactor / deuda técnica: qué situación se quiere mejorar y por qué. Sin diseño técnico aquí}}

## Contexto

<!-- Sección opcional. Incluir solo si la descripción no es suficiente para entender el alcance o las restricciones del dominio. Eliminar esta sección si no aplica. -->

{{información adicional sobre el dominio, restricciones del negocio, decisiones previas o cualquier contexto necesario para entender el work item}}

## Reglas de negocio

<!--
Sección opcional. Incluir solo si el dominio impone restricciones, obligaciones o prohibiciones que convenga declarar como reglas explícitas. Eliminar esta sección si no aplica.
Cada regla de negocio lleva id secuencial BR-01, BR-02, … y un enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Cuando existan, cada BR-XX debe estar verificada por al menos un AC-XXX en la sección Criterios de aceptación.
-->

- **BR-01:** {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE…» / «The system MUST NOT…»}} → verificado por {{AC-XXX}}
- **BR-02:** {{…}} → verificado por {{AC-XXX}}

## Dependencias

<!-- Inventario de lo que el work item usa o necesita dentro del alcance del work item: componentes de UI, servicios o APIs internas, modelos / entidades / DTOs, librerías de terceros. No incluir ADRs ni referencias de diseño — eso va en Referencias. -->

- {{nombre o identificador del componente, servicio, modelo, librería}} — {{descripción breve del uso}}

## Referencias

<!--
Incluir únicamente enlaces a recursos ya almacenados; nunca pegar archivos, imágenes ni descripciones directamente aquí.
Recursos válidos: mockups, wireframes, flujos, modelos, diagramas, especificaciones técnicas, ADRs.
Rutas permitidas: assets/ (recursos propios de este work item) o docs/specs/technical-docs/ o docs/adr/.
-->

- **Arquitectura:** {{enlace a ADR en `docs/adr/` si el work item depende de decisiones ya registradas; no inventar ADRs nuevos}}
- **Documentación técnica:** {{enlace a `docs/specs/technical-docs/` si aplica}}
- **Diseño:** {{enlace a Figma, wireframe o imagen de alta fidelidad; obligatorio si el work item toca UI}}

## Criterios de aceptación

<!--
Lista plana con id secuencial AC-001, AC-002, … Cada criterio indica su categoría entre paréntesis y el enunciado con palabra clave RFC 2119 en MAYÚSCULAS en el idioma de preferencia.
Categorías funcionales: Reglas de negocio · Casos de uso · Flujos de proceso · Procesamiento de datos · Integraciones · Interacción de usuario · Salidas del sistema
Categorías no funcionales (ISO/IEC 25010): Idoneidad funcional · Eficiencia de rendimiento · Compatibilidad · Usabilidad · Fiabilidad · Seguridad · Mantenibilidad · Portabilidad
-->

- **AC-001 ({{categoría}}):** {{enunciado con palabra clave RFC 2119 en MAYÚSCULAS; p. ej. «El sistema DEBE…» / «The system MUST NOT…»}}
- **AC-002 ({{categoría}}):** {{…}}

### Escenarios de comportamiento

<!-- Subsección opcional. Incluir escenarios cuando ayuden a precisar el comportamiento esperado; eliminarla si no aplica. Cada escenario cubre uno o varios AC-XXX. Palabra clave Gherkin en TODO MAYÚSCULAS en el idioma de preferencia: DADO/CUANDO/ENTONCES/Y/PERO en español; GIVEN/WHEN/THEN/AND/BUT en inglés. -->

```gherkin
Escenario: SC-01 - {{Nombre del escenario}}
{{DADO}} {{precondición}}
{{CUANDO}} {{acción}}
{{ENTONCES}} {{resultado esperado}}
```

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
Formato: `IT-XX` + una **descripción corta** de una línea (qué se implementa) — es lo único que se muestra en la herramienta de to-dos. El detalle amplía el **qué** (precisiones, referencias a recursos o código, notas) — nunca el cómo — y va en las líneas indentadas debajo; no se muestra en los to-dos.
-->

- [ ] **IT-01** — {{descripción corta en una línea: qué se implementa}}
  {{detalle opcional que amplía el qué se implementa, no el cómo: precisiones, referencias a recursos o código, notas; no se muestra en to-dos}}
- [ ] **IT-02** — {{descripción corta en una línea}}
- [ ] **IT-03** — {{descripción corta en una línea}}

## Observaciones

{{usar solo si hay ítems reales: prerrequisitos no cumplidos, información pendiente, bloqueos, decisiones por tomar. Si no hay pendientes, omitir esta sección o dejar una línea: Sin pendientes documentados}}

- {{pendiente o prerrequisito concreto}}
