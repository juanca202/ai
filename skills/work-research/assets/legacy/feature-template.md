<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

Este es el README.md de un FEATURE (FT-XXX): el registro de una funcionalidad
YA IMPLEMENTADA. No es trabajo por construir. Puede nacer de dos formas:
  - inferido de código legado por el flujo «Analizar legado» de work-research; o
  - documentando funcionalidad existente que se quiere registrar (no necesariamente legacy).
En ambos casos el contenido y el uso downstream son idénticos. Vive en:
  docs/specs/features/FT-XXX-{slug}/README.md

Sus casos de prueba se generan con test-define y viven en la MISMA carpeta:
  docs/specs/features/FT-XXX-{slug}/test-cases/

Reglas de contenido:
  - Describe el comportamiento REAL ya implementado, no el deseado.
  - Cada regla de negocio (BR-XX) y criterio de aceptación (AC-XXX) se deduce de la
    funcionalidad existente. Si nació de un análisis legacy, la evidencia en código
    (archivo · símbolo) vive en el discovery (RS-XXX), no en este README. Referencias
    es para investigaciones (el discovery del que nació el feature y/o otras RS-XXX),
    documentación técnica, referencias visuales y bibliografía.
  - Estado: Ready solo si todos los AC-XXX tienen código de identificación y enunciado
    RFC 2119; test-define exige Ready + AC-XXX para generar los TCs.
-->

# FT-XXX: {{título corto del feature}}

**Estado:** {{Draft | Ready}}
**Procedencia:** {{Funcionalidad ya implementada. Origen: "inferido de código legacy (RS-XXX · commit/branch)" | "registro de funcionalidad existente"}}
**Work Item ({{Sistema}}):** {{enlace markdown al work item del feature en el sistema de seguimiento vinculado — solo si se creó manualmente; {{Sistema}} es el nombre corto que define el archivo de referencia del sistema (p. ej. "ADO" para references/azure-devops.md); omitir línea si no aplica. Ningún skill de esta suite crea o pobla este campo por su cuenta para un FT; si existe, `test-define` lo usa para vincular sus TC al feature padre}}
**Fecha de creación:** {{YYYY-MM-DD}}
**Última actualización:** {{YYYY-MM-DD}}

## Descripción funcional

<!--
Describe el comportamiento REAL ya implementado, centrado en lo observable (no en la
implementación interna). Debe dejar claro el alcance: qué hace el feature y qué queda
fuera. Incluir Capability padre y objetivo principal (validados en el discovery) cuando
el feature nace del flujo «Analizar legado». Incluir actores o módulo solo si ayudan a delimitar ese
alcance.
-->

**Capability:** {{nombre de la capability padre, o «N/A» si no aplica}}

{{Qué hace este feature: capacidad y comportamientos observables que ofrece. Un
objetivo principal enunciable en una oración.}}

{{Qué no hace / fuera de alcance: comportamientos cercanos que no cubre, límites
explícitos o responsabilidades de otros features/módulos.}}

## Reglas de negocio

<!--
Reglas que la funcionalidad ya implementada APLICA (validaciones, cálculos, condiciones, límites, transiciones, defaults, efectos).
Id secuencial BR-01, BR-02, … y enunciado con palabra clave RFC 2119 en MAYÚSCULAS.
Cada BR-XX debe estar verificada por al menos un AC-XXX. Si nació de un análisis legacy y
una regla proviene de un comportamiento marcado como posible bug en el discovery, indicar
la decisión tomada (preservar / corregir) entre corchetes.
-->

- **BR-01:** {{enunciado RFC 2119; p. ej. «El sistema DEBE…»}} → verificado por {{AC-XXX}}
- **BR-02:** {{…}} → verificado por {{AC-XXX}}

## Criterios de aceptación

<!--
Lista plana con id secuencial AC-001, AC-002, … Cada criterio indica su categoría entre
paréntesis y el enunciado con palabra clave RFC 2119 en MAYÚSCULAS. Describen el
comportamiento REAL ya implementado (son la especificación que las pruebas van a fijar).
Categorías funcionales: Reglas de negocio · Casos de uso · Flujos de proceso · Procesamiento de datos · Integraciones · Interacción de usuario · Salidas del sistema
Categorías no funcionales (ISO/IEC 25010): Idoneidad funcional · Eficiencia de rendimiento · Compatibilidad · Usabilidad · Fiabilidad · Seguridad · Mantenibilidad · Portabilidad
-->

- **AC-001 ({{categoría}}):** {{enunciado RFC 2119 en MAYÚSCULAS que fija el comportamiento observado}}
- **AC-002 ({{categoría}}):** {{…}}

## Referencias

<!--
Incluir únicamente enlaces a recursos ya almacenados; nunca pegar archivos, imágenes ni descripciones directamente aquí.
Recursos válidos: investigaciones (RS-XXX) —incluido el discovery del que nació el feature—, documentación técnica, referencias visuales (mockups, wireframes, diagramas), bibliografía (URLs de la web).
Rutas permitidas: assets/ (recursos propios de este feature) o docs/specs/technical-docs/ (documentación técnica compartida).
La evidencia en código (archivo · símbolo) y las pruebas existentes NO van aquí: viven en el discovery (RS-XXX) citado; enlázalo abajo en «Investigación / discovery».
-->

- **Investigación / discovery:** {{enlace(s) markdown al RS-XXX/discovery.md del que nació el feature y/o a otras investigaciones (RS-XXX) usadas en su implementación, o «Ninguna»}}
- **Documentación técnica:** {{enlace markdown a la especificación o doc técnica relacionada, o «Ninguna»}}
- **Referencias visuales:** {{enlace markdown a mockup, diagrama o flujo, o «Ninguna»}}
- **Bibliografía:** {{enlace markdown a fuente web relevante, o «Ninguna»}}
- {{añadir entradas adicionales o indicar «Ninguna por ahora»}}

## Observaciones

- {{comportamientos marcados como posible bug y su decisión (preservar/corregir)}}
- {{supuestos, lagunas o aclaraciones pendientes que mantienen el feature en Draft}}
- {{otras notas relevantes}}
