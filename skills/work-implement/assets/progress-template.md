<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Progreso

## {{identificador del trabajo}}
**Tipo:** {{historia de usuario | work item}}
**Ultima actualizacion:** {{YYYY-MM-DD}}

<!--
Valores del identificador: `US-XXX` (historia) o `WI-XXX-{{slug}}` (work item).
Ubicacion y alcance por tipo (cada trabajo tiene su propio `progress.md` dentro de su carpeta):
- Historia de usuario (`US-XXX`): un `progress.md` por carpeta de la US (`docs/specs/user-stories/US-XXX-{{nombre-corto}}/progress.md`); el encabezado lleva su `US-XXX` y las unidades son sus `TK-XXX`.
- Work item de mantenimiento (`WI-XXX`): un `progress.md` por carpeta del WI (`docs/specs/work-items/WI-XXX-{{slug}}/progress.md`), específico de ese WI; el encabezado lleva su `WI-XXX` y la unidad es el `WI-XXX` completo (una sola entrada, sin sub-tareas).
-->

### Unidades

<!--
La "unidad" depende del tipo: TK para historias de usuario, el WI completo para work items.
`Cobertura de test cases` es opcional: incluirla solo si el artefacto tiene carpeta `test-cases/`; omitirla si no hay test cases.
-->

### {{TK-XXX | WI-XXX}}: {{titulo corto}}
**Estado:** {{Pending | In Progress | Done}}
**Implementador:** {{inferido de git config user.name}}
**Archivos:** []
**Notas:** []
**Cobertura de test cases:** []
**Decisiones adicionales:** []

### {{TK-XXX | WI-XXX}}: {{titulo corto}}
**Estado:** {{Pending | In Progress | Done}}
**Implementador:** {{inferido de git config user.name}}
**Archivos:**
- {{src/ruta/al/archivo.ext}}

**Notas:**
- {{subpaso, decision tecnica puntual, o resultado de validacion (golden master si el WI/US referencia una investigacion de migracion)}}

**Cobertura de test cases:**
- {{TC-XXX => prueba automatizada creada (unit/integracion/e2e), o "no automatizado: <motivo>", o "otro tipo de prueba: <TC pensado como X, cubierto con Y y por que>"}}

**Decisiones adicionales:**
- {{decision tomada en sesion de chat no documentada en la especificacion}}
