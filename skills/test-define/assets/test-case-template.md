# Plantilla de caso de prueba — IEEE 29119-4

<!--
Convención de placeholders: sustituir manualmente cada {{texto}}.
Eliminar este bloque al publicar el documento final.

Ubicación por tipo de artefacto:
  US: docs/specs/user-stories/US-XXX-{nombre}/test-cases/TC-XXX-{slug}.md
  WI: docs/specs/work-items/WI-XXX-{kebab-case}/test-cases/TC-XXX-{slug}.md

Nombre de archivo: TC-XXX-{slug}.md
  XXX  → secuencial de tres dígitos dentro del artefacto padre (001, 002, ...)
  slug → descripción corta en kebab-case del escenario (ej: login-password-incorrecto)
-->

# TC-{{XXX}} — {{Título descriptivo del escenario}}

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | TC-{{XXX}} |
| **Tipo** | {{Happy Path \| Error \| Límite}} |
| **Prioridad** | {{Alta \| Media \| Baja}} |
| **Criterio de aceptación** | {{código del criterio + título corto — debe existir en el artefacto origen}} |
| **Artefacto padre** | {{US-XXX \| WI-XXX}} |
| **Estado** | {{Draft \| Ready \| Obsolete}} |
| **Creado por** | {{nombre}} |
| **Fecha** | {{YYYY-MM-DD}} |

## Objetivo

{{Una oración que describe qué comportamiento del sistema valida este caso y por qué es relevante.}}

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

## Resultado real

> _Completar durante la ejecución del test._

{{Vacío hasta ejecutar}}

## Veredicto

{{✅ Aprobado | ❌ Rechazado | ⚠️ Aprobado con observaciones}}

## Notas / Observaciones

{{Dependencias con otros TCs, datos de entorno específicos, limitaciones conocidas, comportamientos aceptados como excepción.}}
