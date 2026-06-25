---
name: project-migrate
description: >-
  Planifica y documenta migraciones tecnológicas entre un proyecto origen y uno destino.
  Úsalo cuando el usuario quiera migrar o mover código, módulos, features o dependencias
  entre dos proyectos, o mapear/comparar sus stacks (disparadores: migrar, migración,
  migrate, migration). Produce tres documentos secuenciales en docs/specs/migrations/MG-XXX-{slug}/
  del proyecto destino — discovery.md, validation.md y plan.md. Si el destino se divide en
  varios proyectos, cada uno recibe su propia carpeta. Aplica aunque el usuario no pida
  explícitamente crear documentos de migración. Al terminar el plan, ofrece continuar
  con la implementación y, si el usuario acepta, hace handoff al skill work-implement.
---

# Migración entre proyectos

Documenta una migración entre dos proyectos en **tres pasos**:

1. **Discovery** (`discovery.md`): infiere el stack tecnológico de ambos
   proyectos y mapea las equivalencias entre origen y destino.
2. **Preparación de validación** (`validation.md` + carpeta `validation/`): a
   partir de las oportunidades de Golden Master Testing del discovery, prepara los
   casos de validación y reúne sus insumos (entradas/salidas de referencia).
3. **Plan** (`plan.md`): a partir del discovery y la validación, define el estado
   actual, la propuesta de cambio, la validación por Golden Master y el plan de
   implementación.

El usuario indica **qué** se va a migrar y de **qué proyecto origen** a **qué
proyecto destino**. Todos los archivos se generan dentro de la carpeta de la
migración en el proyecto destino.

El flujo es **secuencial y con compuertas**: no avances al siguiente paso
mientras el documento del paso anterior no esté en `Ready`.

Al terminar el plan, este skill **ofrece continuar con la implementación**: si el
usuario acepta y el `plan.md` está en `Ready`, hace *handoff* al skill
`work-implement` (ver "Continuar con la implementación" en
[references/flow.md](./references/flow.md)).

El **procedimiento detallado** de los tres pasos, el detalle del destino
fragmentado y el *handoff* viven en [references/flow.md](./references/flow.md).
Aquí queda el resumen y los punteros.

## Resolución de idioma

El idioma de los documentos generados (`discovery.md`, `validation.md`, `plan.md`) y de los mensajes al usuario se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

## Estructura de la carpeta de migración

Cada migración vive en `<destino>/docs/specs/migrations/MG-XXX-{slug}/`:

```text
docs/specs/migrations/
└── MG-XXX-{slug}/
    ├── discovery.md    # Paso 1
    ├── validation.md   # Paso 2
    ├── validation/     # recursos de validación (JSON, imágenes, Mermaid, …)
    └── plan.md         # Paso 3
```

## Entradas que necesitas del usuario

1. **Qué se va a migrar** (un módulo, una feature, dependencias, el proyecto
   completo, etc.).
2. **Proyecto origen** y **proyecto(s) destino**: idealmente las rutas a los
   repos/carpetas. El destino puede ser **uno o varios proyectos** (p. ej. un
   monolito que se fragmenta en varios servicios). Si solo te dan descripciones,
   trabaja con esa información, pero deja constancia de los supuestos.

Si falta alguno de estos datos, pídelo de forma breve antes de continuar. No
inventes rutas ni stacks.

## Destino único vs. destino fragmentado

- **Destino único**: ejecuta el flujo una sola vez y genera `discovery.md`,
  `validation.md` (con su carpeta `validation/`) y `plan.md` en ese proyecto
  destino.
- **Destino fragmentado** (el origen se reparte entre **varios** proyectos
  destino): **cada proyecto destino debe tener su propia carpeta de migración**
  con su `discovery.md`, `validation.md` y `plan.md` acotados a la porción del
  origen que recibe. Usa el **mismo `MG-XXX-{slug}`** en todos los proyectos
  (calcula `XXX` como el siguiente secuencial libre considerando el número más
  alto entre todos los `docs/specs/migrations/` involucrados). Detalle completo en
  [references/flow.md](./references/flow.md).

Cuando el destino está fragmentado, "el destino" se refiere a **cada** proyecto
destino.

## Resumen de los tres pasos

El procedimiento detallado de cada paso está en
[references/flow.md](./references/flow.md). Cada documento se genera copiando su
plantilla de `assets/` y renombrándola; la plantilla indica cómo rellenarlo.

1. **Discovery (`discovery.md`)** — plantilla `assets/discovery-template.md`.
   Infiere el stack de ambos proyectos (con versión), calcula el ID `MG-XXX`,
   crea la carpeta `MG-XXX-{slug}/` y construye:
   - El **mapeo tecnológico** (Elemento, Origen, Destino, Equivalencia).
   - La estrategia de verificación existente y el **entorno del origen** (URL de
     pruebas para el MCP de Chrome).
   - Las oportunidades para Golden Master Testing y los riesgos.

   La columna **Equivalencia** clasifica cada fila:

   | Equivalencia | Significado                                   |
   | ------------ | --------------------------------------------- |
   | Directa      | Existe reemplazo casi 1:1                     |
   | Adaptación   | Existe reemplazo pero requiere cambios        |
   | Rediseño     | No existe reemplazo directo; debe rediseñarse |
   | Eliminar     | Ya no es necesario en destino                 |
   | Pendiente    | Aún no decidido                               |

2. **Preparación de validación (`validation.md`)** — plantilla
   `assets/validation-template.md`. Solo se inicia con el discovery en `Ready`.
   Para cada caso/oportunidad sigue
   [references/golden-master-testing.md](./references/golden-master-testing.md):
   crea los casos, obtén sus inputs/outputs de referencia (reutilizando artefactos
   del origen o capturando su salida) y guarda los recursos en la carpeta
   `validation/`.

3. **Plan (`plan.md`)** — plantilla `assets/plan-template.md`. Solo se crea con el
   discovery **y** la validación en `Ready`. Contiene estado actual (árbol de
   archivos origen), propuesta de cambio (árbol de archivos destino), pruebas de
   validación por Golden Master y un plan de implementación **por fases** con una
   estrategia incremental de
   [references/migration-strategies.md](./references/migration-strategies.md).

Cabecera común de los tres: título fijo, `Estado`, `Fecha` (`YYYY-MM-DD`),
`Proyecto origen`/`Proyecto destino`; `validation.md` y `plan.md` enlazan al
discovery con `[discovery.md](./discovery.md)`.

## Estados

Hay **dos planos de estado** distintos: el del **documento** y, dentro de
`validation.md`, el de **cada caso**.

**Documento (`Draft` / `Ready`)** — controla las compuertas del flujo:

- **discovery.md** → `Ready` si no hay pendientes en `Notas` y ningún elemento
  queda en equivalencia **Pendiente**; en caso contrario, `Draft`.
- **validation.md** → `Ready` si no hay casos en `Pendiente` ni pendientes en
  `Notas`; en caso contrario, `Draft`.
- **plan.md** → `Draft` mientras tenga secciones incompletas o pendientes en
  `Notas`; `Ready` cuando esté completo y listo para ejecutarse.

No se prepara la validación ni se planifica si el discovery no está en `Ready`, y
no se crea el plan hasta que discovery y validación estén ambos en `Ready`.

**Por caso (dentro de `validation.md`)** — distinto del estado del documento:

- **`Pendiente`**: faltan insumos (entradas o salidas de referencia) del caso.
- **`Listo`**: el caso tiene todos sus insumos / golden master listo.

(`work-implement` comprueba los casos en `Pendiente` antes de implementar.)

## Mapa de referencias

- [references/flow.md](./references/flow.md): procedimiento detallado de los tres
  pasos, detalle del destino fragmentado, sección "Resultado" y "Continuar con la
  implementación" (*handoff* a `work-implement`).
- [references/golden-master-testing.md](./references/golden-master-testing.md):
  procedimiento de preparación de casos de Golden Master Testing (Paso 2).
- [references/migration-strategies.md](./references/migration-strategies.md):
  estrategias de migración incremental para el plan de implementación (Paso 3).
- `assets/discovery-template.md`, `assets/validation-template.md`,
  `assets/plan-template.md`: plantillas de cada documento con sus instrucciones de
  relleno.
