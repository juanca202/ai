<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Progreso

## {{identificador del trabajo}}
**Estado:** {{Pending | In Progress | Done}}
**Tipo:** {{historia de usuario | tarea de mantenimiento}}
**Fecha de creación:** {{YYYY-MM-DD HH:mm}}
**Ultima actualizacion:** {{YYYY-MM-DD HH:mm}}

<!--
Valores del identificador: `US-XXX-{{slug}}` (historia) o `WI-XXX-{{slug}}` (tarea de mantenimiento).
Ubicacion y alcance por tipo (cada trabajo tiene su propio `progress.md` dentro de su carpeta):
- Historia de usuario (`US-XXX`): un `progress.md` por carpeta de la US (`docs/specs/user-stories/US-XXX-{{nombre-corto}}/progress.md`); el encabezado lleva su `US-XXX` y las unidades son sus `TK-XXX`.
- Tarea de mantenimiento (`WI-XXX`): un `progress.md` por carpeta del WI (`docs/specs/work-items/WI-XXX-{{slug}}/progress.md`), específico de ese WI; el encabezado lleva su `WI-XXX` y la unidad es el `WI-XXX` completo (una sola entrada, sin sub-tareas).
-->

### Unidades

<!--
La "unidad" depende del tipo: TK para historias de usuario, el WI completo para tareas de mantenimiento.
`Cobertura de test cases` es opcional: incluirla solo si el artefacto tiene carpeta `test-cases/`; omitirla si no hay test cases.
-->

### {{TK-XXX | WI-XXX}}: {{titulo corto}}
**Estado:** {{Pending | In Progress | Done}}
**Iniciado:** {{YYYY-MM-DD HH:mm}}
**Finalizado:** {{YYYY-MM-DD HH:mm}}
**Implementador:** {{inferido de git config user.name}}

<!-- Archivos: lista de archivos tocados durante la implementación de esta unidad. Prefijar cada ruta con + (creado), ~ (modificado) o - (eliminado); el símbolo basta, no hace falta etiqueta. -->
**Archivos:** 
[]

<!-- Notas: observaciones surgidas durante la implementación de esta unidad; describirlas de forma específica y concisa. -->
**Notas:** 
[]

<!-- Decisiones adicionales: toda decisión adicional surgida en la conversación con el agente, o decisión autónoma del agente relevante para el usuario, que haya surgido durante la implementación y no estaba en la especificación original. -->
**Decisiones adicionales:** 
[]

### {{TK-XXX | WI-XXX}}: {{titulo corto}}
**Estado:** {{Pending | In Progress | Done}}
**Iniciado:** {{YYYY-MM-DD HH:mm}}
**Finalizado:** {{YYYY-MM-DD HH:mm}}
**Implementador:** {{inferido de git config user.name}}

**Archivos:**
- {{+ | ~ | -}} {{src/ruta/al/archivo.ext}}

**Notas:** 
- {{observación relevante encontrada al implementar}}

**Decisiones adicionales:**
- {{decision tomada en sesion de chat no documentada en la especificacion}}
