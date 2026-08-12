<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Progreso

## {{identificador del trabajo}}
**Estado:** {{Pending | In Progress | Done}}
**Tipo:** {{historia de usuario | tarea de mantenimiento | casos de prueba | feature}}
**Fecha de creación:** {{YYYY-MM-DD HH:mm}}
**Ultima actualizacion:** {{YYYY-MM-DD HH:mm}}

<!--
Valores del identificador: `US-XXX-{{slug}}` (historia), `WI-XXX-{{slug}}` (tarea de mantenimiento) o `FT-XXX-{{slug}}` (feature).
Ubicacion y alcance por tipo (cada trabajo tiene su propio `progress.md` dentro de su carpeta):
- Historia de usuario (`US-XXX`): un `progress.md` por carpeta de la US (`docs/specs/user-stories/US-XXX-{{nombre-corto}}/progress.md`); el encabezado lleva su `US-XXX` y las unidades son sus `TK-XXX`.
- Tarea de mantenimiento (`WI-XXX`): un `progress.md` por carpeta del WI (`docs/specs/work-items/WI-XXX-{{slug}}/progress.md`), específico de ese WI; el encabezado lleva su `WI-XXX` y la unidad es el `WI-XXX` completo (una sola entrada, sin sub-tareas).
- Feature (`FT-XXX`): un `progress.md` por carpeta del feature (`docs/specs/features/FT-XXX-{{slug}}/progress.md`); el encabezado lleva su `FT-XXX` y la unidad es el `FT-XXX` completo (una sola entrada que cubre todos sus `TC-XXX`).
- Casos de prueba (`TC-XXX`) sueltos: el `progress.md` vive en la carpeta del **artefacto padre** que los contiene (US, WI o FT); el encabezado lleva el ID de ese padre y hay **una unidad por cada `TC-XXX`** del alcance.
-->

### Unidades

<!--
La "unidad" depende del tipo: TK para historias de usuario, el WI completo para tareas de mantenimiento, el FT completo para un feature, y cada TC para casos de prueba sueltos.
`Cobertura de test cases` es opcional: incluirla solo si el artefacto tiene carpeta `test-cases/`; omitirla si no hay test cases. En los tipos `TC-XXX` / `FT-XXX` es obligatoria.
-->

### {{TK-XXX | WI-XXX | TC-XXX | FT-XXX}}: {{titulo corto}}
**Estado:** {{Pending | In Progress | Done}}
**Iniciado:** {{YYYY-MM-DD HH:mm}}
**Finalizado:** {{YYYY-MM-DD HH:mm}}
**Implementador:** {{inferido de git config user.name}} / {{agente que implementa: Claude | Cursor | Codex | …}}

<!-- Archivos: lista de archivos tocados durante la implementación de esta unidad. Prefijar cada ruta con + (creado), ~ (modificado) o - (eliminado); el símbolo basta, no hace falta etiqueta. -->
**Archivos:** 
[]

<!-- Notas: observaciones surgidas durante la implementación de esta unidad; describirlas de forma específica y concisa. -->
**Notas:** 
[]

<!-- Decisiones adicionales: toda decisión adicional surgida en la conversación con el agente, o decisión autónoma del agente relevante para el usuario, que haya surgido durante la implementación y no estaba en la especificación original. -->
**Decisiones adicionales:** 
[]

<!-- Cobertura de test cases: solo observaciones puntuales — TC-XXX que no se pudieron automatizar (con motivo), TC cubiertos con un tipo de prueba distinto al documentado, AC-XXX sin ningun TC, y discrepancias entre el TC y el codigo con la decision tomada. Omitir la seccion si el artefacto no tiene test cases; obligatoria en los tipos TC-XXX / FT-XXX. -->
**Cobertura de test cases:** 
[]

### {{TK-XXX | WI-XXX | TC-XXX | FT-XXX}}: {{titulo corto}}
**Estado:** {{Pending | In Progress | Done}}
**Iniciado:** {{YYYY-MM-DD HH:mm}}
**Finalizado:** {{YYYY-MM-DD HH:mm}}
**Implementador:** juanca202 / Claude

**Archivos:**
- {{+ | ~ | -}} {{src/ruta/al/archivo.ext}}

**Notas:** 
- {{observación relevante encontrada al implementar}}

**Decisiones adicionales:**
- {{decision tomada en sesion de chat no documentada en la especificacion}}

**Cobertura de test cases:**
- {{TC-XXX no automatizado — motivo}}
- {{TC-XXX cubierto como Integration aunque el TC indica Unit — motivo}}
- {{AC-XXX sin test cases definidos}}
