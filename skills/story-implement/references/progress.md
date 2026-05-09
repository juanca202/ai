# Progress — plantilla de referencia

Este archivo documenta la **estructura mínima sugerida** para `docs/product/user-stories/US-XXX-[nombre-corto]/progress.md` cuando aún no existe en el repo del producto. Al crearlo allí, **sustituir** los marcadores `US-XXX`, `TK-001`, títulos y rutas por valores reales; **no** copiar este archivo de referencia literalmente al paquete publicado del skill.

Valores de **status** recomendados para cada tarea: `pending`, `in-progress`, `done`, `skipped` (si el usuario acuerda omitir).

---

# Progress

## user-story: US-XXX
status: in-progress
work-unit: "[opcional: unidad filtrada, p. ej. name del package.json]"
implementador-filter: "[opcional: nombre si solo aplica a ese implementador]"

### tasks

- id: TK-001
  title: Título breve de la tarea
  status: pending
  implementador-previsto: "[si consta en el TK]"
  files: []
  notes: []

- id: TK-002
  title: ...
  status: in-progress
  files:
    - src/ejemplo.ts
  notes:
    - Subpaso o decisión técnica puntual
