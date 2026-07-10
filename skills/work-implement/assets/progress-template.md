<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Progreso

## {{identificador del trabajo}}
**Tipo:** {{historia de usuario | work item | migracion}}
**Ultima actualizacion:** {{YYYY-MM-DD}}

> **Valores del identificador:** `US-XXX` (historia), `Work items de mantenimiento` (WI compartido) o `MG-XXX-{{slug}}` (migración; p. ej. `MG-005-api-legacy`).
> **Ubicacion y alcance por tipo:**
> - **Historia de usuario** (`US-XXX`): un `progress.md` por carpeta de la US (`docs/specs/user-stories/US-XXX-{{nombre-corto}}/progress.md`); el encabezado lleva su `US-XXX` y las unidades son sus `TK-XXX`.
> - **Work item de mantenimiento** (`WI-XXX`): `progress.md` **compartido** (`docs/specs/work-items/progress.md`) que lista **varios WI**; el encabezado usa `Work items de mantenimiento` y cada unidad es un `WI-XXX` completo.
> - **Migracion** (`MG-XXX-{{slug}}`): un `progress.md` por carpeta de la migracion (`docs/specs/migrations/MG-XXX-{{slug}}/progress.md`); el encabezado lleva su `MG-XXX-{{slug}}` y las unidades son sus `Fase N`. Destino fragmentado: un `progress.md` por proyecto destino.

### Unidades
{{La "unidad" depende del tipo: TK para historias de usuario, el WI completo para work items, una Fase para migraciones.}}
{{`Cobertura de test cases` es opcional: incluirla solo si el artefacto tiene carpeta `test-cases/`; omitirla si no hay test cases.}}

- {{TK-XXX | WI-XXX | Fase N}}: {{titulo corto}}
  Estado: {{Pending | In Progress | Done}}
  Implementador: "{{inferido de git config user.name}}"
  Archivos: []
  Notas: []
  Cobertura de test cases: []
  Decisiones adicionales: []

- {{TK-XXX | WI-XXX | Fase N}}: {{titulo corto}}
  Estado: {{Pending | In Progress | Done}}
  Implementador: "{{inferido de git config user.name}}"
  Archivos:
    - {{src/ruta/al/archivo.ext}}
  Notas:
    - {{subpaso, decision tecnica puntual, o resultado de validacion (golden master) en migraciones}}
  Cobertura de test cases:
    - {{TC-XXX => prueba automatizada creada (unit/integracion/e2e), o "no automatizado: <motivo>", o "otro tipo de prueba: <TC pensado como X, cubierto con Y y por que>"}}
  Decisiones adicionales:
    - {{decision tomada en sesion de chat no documentada en la especificacion}}
