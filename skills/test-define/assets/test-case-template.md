# Plantilla de caso de prueba — IEEE 29119-4

<!--
Convención de placeholders: sustituir manualmente cada {{texto}}.
Eliminar este bloque al publicar el documento final.

Ubicación por tipo de artefacto:
  US:   docs/specs/user-stories/US-XXX-{nombre}/test-cases/TC-XXX-{slug}.md
  WI:   docs/specs/work-items/WI-XXX-{kebab-case}/test-cases/TC-XXX-{slug}.md
  FT: docs/specs/features/FT-XXX-{slug}/test-cases/TC-XXX-{slug}.md
  Otro artefacto de especificación (cualquier origen o formato):
        {carpeta-del-artefacto}/test-cases/TC-XXX-{slug}.md

Nombre de archivo: TC-XXX-{slug}.md
  XXX  → secuencial de tres dígitos dentro del artefacto padre (001, 002, ...) sin tracker externo vinculado;
         o el identificador que asigne el sistema externo vinculado, según el formato de su archivo de referencia (p. ej. ID numérico sin padding en Azure DevOps — ver references/azure-devops.md)
  slug → descripción corta en kebab-case del escenario (ej: login-password-incorrecto)

El nombre del archivo y, si hay un tracker externo vinculado, el título usado al crear el work item deben respetar cualquier límite de longitud propio de ese sistema (ver su archivo de referencia).
-->

# TC-{{XXX}} — Dado {{contexto/precondición}}, Cuando {{acción/evento}}, Entonces {{resultado esperado}}

**Perspectiva:** {{Happy Path | Error | Límite}}
**Tipo de prueba:** {{Manual | Tipo[, Tipo…]}}  <!-- intención de diseño. Tipo ∈ {Unit | Integration | API Test | Visual Test | E2E}; uno o varios separados por coma, en ESE orden (de menor a mayor nivel; p. ej. Unit, E2E). Manual solo cuando el caso no se automatiza por diseño; no se combina con tipos. -->
**Prioridad:** {{Alta | Media | Baja}}
**Criterio de aceptación:** {{identificador del criterio tal como aparece en el artefacto origen (AC-XXX, 1.1, R-3, …) + título corto — no normalizar el formato; debe existir literalmente en el artefacto}}
**Artefacto padre:** {{US-XXX | WI-XXX | FT-XXX | identificador o ruta del artefacto externo}}
**Work Item ({{Sistema}}):** {{enlace markdown al work item creado en el sistema vinculado — solo si se creó vía MCP; {{Sistema}} es el nombre corto que define el archivo de referencia del sistema (p. ej. "ADO" para references/azure-devops.md); omitir línea si no aplica}}
**Estado:** {{Draft | Ready | Obsolete}}
**Creado por:** {{nombre}}
**Fecha:** {{YYYY-MM-DD}}

## Precondiciones

- {{Estado del sistema antes de ejecutar el caso. Incluir: datos existentes, usuarios autenticados, configuración de entorno, permisos requeridos.}}

## Datos de prueba

| Campo | Valor | Notas |
|-------|-------|-------|
| {{campo}} | {{valor}} | {{restricción o formato esperado}} |

> Si no aplican datos de prueba específicos, escribir "N/A".

## Pasos de ejecución

| # | Actor | Acción | Resultado esperado del paso |
|---|-------|--------|-----------------------------|
| 1 | {{usuario / sistema}} | {{acción concreta}} | {{qué debe ocurrir después de este paso}} |
| 2 | {{usuario / sistema}} | {{acción concreta}} | {{qué debe ocurrir después de este paso}} |

## Resultado esperado final

{{Descripción del estado observable del sistema una vez ejecutados todos los pasos: respuesta de la UI, código HTTP, mensaje, registro en base de datos, evento publicado, etc.}}

## Observaciones

{{Dependencias con otros TCs, datos de entorno específicos, limitaciones conocidas, comportamientos aceptados como excepción.}}
