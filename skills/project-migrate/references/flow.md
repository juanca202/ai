# Procedimiento detallado del flujo

Procedimiento paso a paso de los tres pasos de la migración, el detalle del
destino fragmentado y el *handoff* a la implementación. Las instrucciones de
relleno de cada documento viven en sus plantillas de `assets/`; aquí se describe
**qué** producir y **cómo** decidir.

## Destino fragmentado (detalle)

Cuando el origen se reparte entre **varios** proyectos destino, **cada proyecto
destino debe tener su propia carpeta de migración** con su `discovery.md`,
`validation.md` y `plan.md` **específicos de ese proyecto**. Repite el flujo
completo por cada destino, acotando el contenido a la parte del origen que
aterriza en ese proyecto:

- El discovery de cada proyecto solo incluye los elementos del stack relevantes
  para la porción que recibe ese proyecto (y su estado `Draft`/`Ready` se evalúa
  solo sobre esos elementos).
- La validación de cada proyecto solo prepara casos de la porción que recibe.
- El plan de cada proyecto solo muestra, en sus árboles, los archivos del origen
  que se migran a ese proyecto y los archivos resultantes en él.
- Usa el **mismo `MG-XXX-{slug}`** en todos los proyectos para que la migración
  sea trazable como una sola unidad. Para evitar colisiones, calcula `XXX` como el
  siguiente secuencial libre considerando el **número más alto entre todos** los
  `docs/specs/migrations/` de los proyectos destino involucrados.

En todo este procedimiento, "el destino" se refiere a **cada** proyecto destino
cuando el destino está fragmentado.

## Paso 1 — Discovery (`discovery.md`)

### 1. Inferir el stack tecnológico de ambos proyectos

Inspecciona los archivos de manifiesto/configuración de cada proyecto para deducir
lenguaje, framework, librerías clave, herramientas de build, base de datos, etc.,
**con su versión** cuando esté disponible. Pistas habituales:

- Node/JS/TS: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `tsconfig.json`
- Python: `requirements.txt`, `pyproject.toml`, `Pipfile`, `setup.py`
- Java/Kotlin: `pom.xml`, `build.gradle`, `build.gradle.kts`
- Go: `go.mod`
- Ruby: `Gemfile`, `Gemfile.lock`
- PHP: `composer.json`
- .NET: `*.csproj`, `*.sln`
- Rust: `Cargo.toml`
- Infra/otros: `Dockerfile`, `docker-compose.yml`, archivos de CI, configs de DB

Céntrate en los elementos **relevantes para lo que se va a migrar**, no en todo el
árbol de dependencias. Anota la versión exacta cuando exista (p. ej.
`Express 4.18.2`); si no se puede determinar, indícalo como `sin versión`.

### 2. Calcular el ID secuencial `MG-XXX`

- **Destino único**: mira `<destino>/docs/specs/migrations/`, busca carpetas con el
  patrón `MG-XXX-*`, toma el número más alto y súmale 1. Si no existe ninguna,
  empieza en `001`.
- **Destino fragmentado**: calcula el siguiente secuencial libre considerando el
  número **más alto entre todos** los `docs/specs/migrations/` de los proyectos
  destino involucrados, y usa ese mismo `MG-XXX` en cada uno.
- Formatea siempre con **3 dígitos y ceros a la izquierda**: `001`, `002`, `017`…

### 3. Crear la carpeta de la migración

Crea `<destino>/docs/specs/migrations/MG-XXX-{slug}/`, donde `{slug}` es una
descripción corta de la migración en *kebab-case* (minúsculas, palabras separadas
por guiones, sin acentos ni caracteres especiales). Ejemplos:

- "Migrar capa de acceso a datos de Sequelize a Prisma" → `MG-003-acceso-datos-prisma`
- "Mover autenticación de Passport a Auth.js" → `MG-008-auth-passportjs-authjs`

### 4. Construir el mapeo tecnológico

Para cada elemento tecnológico relevante detectado en el **origen**, busca su
equivalente en el **destino**:

- Si el destino ya usa una tecnología que cumple la misma función, esa es la
  equivalencia (con su versión si la tienes).
- Si no encuentras equivalente en el destino, escribe explícitamente una nota,
  p. ej. `⚠️ Sin equivalente identificado`.

La tabla tiene cuatro columnas: **Elemento tecnológico**, **Origen (con
versión)**, **Destino (equivalente o nota)** y **Equivalencia**.

La columna **Equivalencia** clasifica cada fila con uno de estos valores:

| Equivalencia | Significado                                   |
| ------------ | --------------------------------------------- |
| Directa      | Existe reemplazo casi 1:1                     |
| Adaptación   | Existe reemplazo pero requiere cambios        |
| Rediseño     | No existe reemplazo directo; debe rediseñarse |
| Eliminar     | Ya no es necesario en destino                 |
| Pendiente    | Aún no decidido                               |

### 5. Documentar la estrategia de verificación existente

Inventaría todo lo que pueda ayudar a demostrar que la migración conserva el
comportamiento (pruebas unitarias, de integración, E2E, colecciones de API, datos
productivos anonimizados, logs históricos, etc.) en una tabla de cuatro columnas:
**Tipo**, **Cobertura**, **Ubicación** y **Utilidad para la migración**. Esta
información alimenta la preparación de validación (Golden Master) del Paso 2.

Registra también el **entorno del origen**: si el app origen tiene un ambiente
accesible vía web y su **URL** (la del ambiente de pruebas). Esa URL permite
luego, en la preparación de validación, extraer insumos con el **MCP de Chrome**.

### 6. Identificar oportunidades para Golden Master Testing

A partir de la estrategia de verificación, identifica qué componentes son
candidatos a validarse con Golden Master Testing en una tabla de tres columnas:
**Componente**, **Fuente disponible** (de dónde salen las salidas de referencia,
p. ej. unit tests, logs de producción, datos históricos) y **Viabilidad** (p. ej.
Alta/Media/Baja según haya o no datos representativos).

### 7. Identificar riesgos

Lista los riesgos de la migración en una tabla de tres columnas: **Riesgo**,
**Impacto** y **Mitigación**. Estima el impacto (p. ej. Alto/Medio/Bajo) e indica
una mitigación concreta para cada riesgo (p. ej. backups, UAT, pruebas, mocking de
integraciones).

### 8. Cerrar lagunas con preguntas estructuradas

Antes de fijar el estado, intenta resolver cualquier **laguna** del discovery
(stack sin identificar, equivalencias en `Pendiente`, viabilidad de Golden Master
sin confirmar, datos o supuestos faltantes, etc.) usando la herramienta de
preguntas estructuradas (`ask_user_input_v0`) para obtener respuestas del usuario.
El objetivo de este proceso es dejar el discovery en **`Ready`**.

> **Fallback de herramientas.** Si `ask_user_input_v0` (o la herramienta de
> preguntas estructuradas) no está disponible, pregunta en prosa con las opciones
> enumeradas. Si el **MCP de Chrome** no está disponible, pide al usuario que
> aporte los insumos manualmente (capturas, datos de referencia) en lugar de
> detenerte. Este fallback aplica a todos los usos de estas herramientas en este
> skill.

Si tras este proceso de *grilling* **no** se logran resolver todas las lagunas, el
discovery queda en **`Draft`** y en `Notas` se especifica **todo lo que falta por
resolver antes de pasar a `Ready`**.

### 9. Determinar el estado

En `Notas` se listan **todos los pendientes que deben resolverse para poder crear
el plan de migración**. El estado depende de si quedan pendientes:

- **Ready**: no hay pendientes en `Notas` y ningún elemento queda con equivalencia
  **Pendiente** (todas las filas tienen una resolución decidida: Directa,
  Adaptación, Rediseño o Eliminar).
- **Draft**: hay al menos un pendiente en `Notas`, algún elemento está en
  **Pendiente**, o la información del discovery aún está incompleta.

> **No se prepara la validación (Paso 2) ni se planifica (Paso 3) si el discovery
> no está en `Ready`.**

### 10. Escribir `discovery.md`

Copia la plantilla `assets/discovery-template.md` dentro de la carpeta creada,
**renómbrala a `discovery.md`** y rellénala siguiendo la propia plantilla. Puntos
clave: título fijo `# Descubrimiento de Migración`; `Estado` `Draft`/`Ready` según
la regla anterior; `Fecha` de hoy en `YYYY-MM-DD`; el `Entorno del origen` (URL de
pruebas si existe); las cuatro tablas (mapeo tecnológico, estrategia de
verificación, oportunidades de Golden Master, riesgos); y en `Notas` todos los
pendientes que deben resolverse para poder crear el plan (si hay pendientes, el
discovery queda en `Draft`).

Ruta final: `<destino>/docs/specs/migrations/MG-XXX-{slug}/discovery.md`

## Paso 2 — Preparación de validación (`validation.md`)

Solo se inicia cuando el discovery está en **`Ready`**. Para cada
caso/oportunidad sigue el procedimiento de [golden-master-testing.md](./golden-master-testing.md).

**1. Crear los casos de validación.** A partir de la tabla "Oportunidades para
Golden Master Testing" del discovery, define uno o varios casos por componente.

**2. Obtener inputs y outputs de cada caso, o marcarlo como pendiente.** Para cada
caso intenta obtener sus entradas y salidas de referencia, en este orden de
preferencia:

1. **Reutilizar artefactos de validación existentes en el origen**: unit tests,
   integration tests, E2E, casos UAT, scripts de prueba, datos históricos y
   ejemplos de entradas/salidas documentadas (ver la "Estrategia de Verificación
   Existente" del discovery).
2. Capturar la salida del sistema origen cuando sea ejecutable.

Cada caso tiene su propio `Estado`, **distinto** del estado del documento
(`Draft`/`Ready`). Los estados **por caso** son:

- **`Pendiente`**: faltan insumos (entradas o salidas de referencia) para el caso.
- **`Listo`**: el caso tiene todos sus insumos / golden master listo.

Si para un caso no logras obtener todos sus insumos, márcalo con `Estado:
Pendiente` y anota en `Notas` qué falta para resolverlo. Cuando un caso reúne
todos sus insumos, su `Estado` pasa a `Listo`. (`work-implement` comprueba los
casos en `Pendiente` antes de implementar.)

El Golden Master captura el comportamiento **actual**, que puede incluir errores.
Antes de fijar una salida de referencia, confirma con el usuario si algún
comportamiento actual es un **bug que NO debe preservarse**; documenta esos casos
como excepción para no "congelar" el error en el destino.

**3. Resolver los casos pendientes al final del levantamiento.** Cuando hayas
recorrido todos los casos, usa la herramienta de preguntas estructuradas
(`ask_user_input_v0`) para obtener del usuario las respuestas y los recursos
necesarios para resolver los casos en `Pendiente`.

- Si el usuario indica **cómo levantar la información desde el ambiente de pruebas
  del app origen** y el discovery registró su **URL web** (y el **MCP de Chrome**
  está disponible), navega a esa URL para obtener la información y resolver los
  pendientes del caso.

**4. Guardar casos y recursos.** Guarda los casos en `validation.md`. Cualquier
recurso que extraigas (entradas, salidas de referencia, capturas, diagramas, etc.)
se almacena en la carpeta `validation/` dentro de la carpeta de la migración;
pueden ser archivos JSON, imágenes, flujos en Mermaid, etc. Referéncialos desde
`validation.md`. Cobertura mínima por caso: un escenario exitoso principal, un caso
límite y un caso de error o validación.

**5. Determinar el estado de `validation.md`.**

- **Ready**: no hay casos pendientes por resolver (todos tienen sus insumos listos)
  y no quedan pendientes en `Notas`.
- **Draft**: hay al menos un caso en `Pendiente` o pendientes en `Notas`.

Para escribir el archivo, copia la plantilla `assets/validation-template.md`,
**renómbrala a `validation.md`** y rellénala siguiendo la propia plantilla. Puntos
clave: título fijo `# Preparación de Validación`; `Estado` `Draft`/`Ready` según la
regla anterior; `Fecha` de hoy; `Discovery` como enlace relativo
(`[discovery.md](./discovery.md)`). El cuerpo lleva la tabla resumen de casos (ID,
Componente, Estrategia, Fuente de datos, Recursos, Estado), un bloque de detalle
por cada caso y la lista de recursos almacenados en `validation/`.

Ruta final: `<destino>/docs/specs/migrations/MG-XXX-{slug}/validation.md`

## Paso 3 — Plan de migración (`plan.md`)

El plan solo se crea cuando el discovery está en **`Ready`** (sin pendientes en
`Notas`) y la preparación de validación (`validation.md`) está en **`Ready`** (sin
casos pendientes). Si alguno está en `Draft`, primero hay que resolver sus
pendientes; indícaselo al usuario y no generes el plan todavía.

Crea el plan **en la misma carpeta** `MG-XXX-{slug}/`. Copia la plantilla
`assets/plan-template.md`, **renómbrala a `plan.md`** y rellénala apoyándote en el
`discovery.md` y el `validation.md`. Puntos clave de cabecera: título fijo
`# Plan de Migración`; `Estado` `Draft` mientras tenga secciones incompletas o
pendientes en `Notas`, `Ready` cuando esté completo y listo para ejecutarse;
`Fecha` de hoy; `Discovery` como enlace relativo (`[discovery.md](./discovery.md)`).

El cuerpo del plan debe contener:

### 1. Estado actual

Cómo está hoy lo que se va a migrar. Incluye un **árbol con las rutas de los
archivos que se van a migrar** en el proyecto origen (bloque de código `text`).

### 2. Propuesta de cambio

El estado objetivo. Incluye un **árbol con las rutas de los archivos resultantes**
en el proyecto destino (nuevos o modificados), de forma que se vea el mapeo origen
→ destino.

### 3. Pruebas de validación (Golden Master Testing)

La validación se realiza con la técnica de **Golden Master Testing**: la
implementación de los casos ya preparados en `validation.md`, contrastando la
salida del destino contra la salida de referencia (golden master) según la
estrategia de comparación de cada caso. Cobertura mínima por funcionalidad: un
escenario exitoso principal, un caso límite y un caso de error o validación.

Aquí se planifica **cómo y cuándo se implementan y ejecutan** esas pruebas; la
definición de los casos y sus insumos ya vive en `validation.md`.

### 4. Plan de implementación

Los pasos para ejecutar la migración, agrupados **por fases** (Fase 1, Fase 2, …),
con tareas accionables en cada una. Elige una **estrategia de migración
incremental** (evita el *big bang*) siguiendo
[migration-strategies.md](./migration-strategies.md) —p. ej. Strangler Fig
(Transform → Coexist → Eliminate), Branch by Abstraction o arquitectura
transitoria— y estructura las fases según esa estrategia. Si aplica, incluye un
**Parallel Run + Reconciliation** para validar el destino contra el origen en vivo
antes del *cutover*.

Ruta final: `<destino>/docs/specs/migrations/MG-XXX-{slug}/plan.md`

## Resultado

Al terminar, indica al usuario la carpeta de la migración, el ID asignado y los
archivos generados (`discovery.md`, `validation.md` y `plan.md`), más la carpeta
`validation/` si se almacenaron recursos. Menciona el estado (`Draft` o `Ready`)
del discovery y de la validación, y en una línea por qué quedaron así. Si alguno
quedó en `Draft`, recuerda que el plan no se genera hasta resolver sus pendientes.

Si el destino está **fragmentado**, lista la carpeta `MG-XXX-{slug}/` creada en
**cada** proyecto destino con sus respectivos `discovery.md`, `validation.md` y
`plan.md`, e indica el estado del discovery de cada uno.

## Continuar con la implementación (opcional)

Una vez generado y reportado el plan, **ofrece continuar con la implementación** de
la migración. Este paso es un *handoff* al skill `work-implement`; no escribas
código desde este skill.

**Condición previa.** Solo ofrece continuar si `plan.md` está en **`Ready`** (en
destino fragmentado, solo respecto de los proyectos cuyo `plan.md` quedó en
`Ready`). Si el plan está en `Draft`, no ofrezcas la implementación: indica que
primero deben resolverse los pendientes del plan, porque `work-implement` solo
implementa trabajo en `Ready`.

**Cómo preguntar.** Usa la herramienta de preguntas estructuradas
(`ask_user_input_v0`) con opciones cortas y mutuamente excluyentes, p. ej.:

- *¿Deseas continuar con la implementación de esta migración ahora?* →
  `Sí, implementar` / `No, solo el plan`.

**Si la respuesta es afirmativa.** La implementación corre a cargo del skill
**`work-implement`**, que detecta el tipo de trabajo por el artefacto referenciado:
como aquí se trata de una migración `MG-XXX`, seguirá su flujo de migración y
ejecutará **por fases**, con validación por Golden Master Testing y una unidad por
confirmación. El cómo arrancarlo depende de si el destino es único o fragmentado.

### Destino único

Hay un solo `plan.md`. Carga y sigue `work-implement` pasándole como referencia la
migración recién creada (el `MG-XXX-{slug}` y la ruta de su `plan.md`).

### Destino fragmentado

Hay un `plan.md` por proyecto destino (considera solo los que estén en `Ready`).
**Todos** los proyectos destino se van a implementar; lo que se decide es **cómo
ejecutar sus planes**. Pregunta con la herramienta de preguntas estructuradas
(`ask_user_input_v0`):

- *¿Cómo quieres ejecutar los planes de los proyectos destino?* →
  `Secuencial por prioridad` / `En paralelo con tareas`.

**Si elige secuencial por prioridad.** Ordena los proyectos destino por prioridad
—según lo indique el plan o el propio usuario— e implementa **cada uno** con
`work-implement`, **uno tras otro en ese orden**: no inicies el siguiente hasta
terminar el anterior. Se ejecutan todos; lo que cambia es el orden, sin paralelismo
entre planes.

**Si elige en paralelo con tareas.** Usa **la herramienta de tareas** para
orquestar la ejecución: crea **una tarea por cada `plan.md` en `Ready`** (una por
proyecto destino) y delega cada tarea a `work-implement`. Antes de lanzarlas,
determina si **hay dependencias entre los planes** (p. ej. un proyecto que debe
migrarse antes porque otro lo consume); si el discovery/plan no lo deja claro,
pregúntaselo al usuario.

- **Sin dependencias entre los planes:** las tareas pueden ejecutarse **en
  paralelo**.
- **Con dependencias:** secuencia las tareas respetando el orden de dependencia;
  las independientes entre sí pueden seguir ejecutándose en paralelo.

En cualquier caso, cada proyecto destino es una ejecución de `work-implement`
independiente, por fases y con una unidad por confirmación: el paralelismo es
**entre planes** de distintos proyectos, nunca dentro de un mismo plan ni
mezclando proyectos en una misma unidad de confirmación.

**Si la respuesta es negativa.** Cierra aquí: el plan queda listo para
implementarse más adelante con `work-implement` cuando el usuario lo decida.
