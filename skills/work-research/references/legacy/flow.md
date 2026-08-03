# Flujo D — Análisis legacy (código → features y pruebas inferidas)

Procedimiento del **flujo D** de `work-research`: a partir de **código existente**
(un módulo, una carpeta o un repo) sin requisitos escritos o con **cobertura de
pruebas inadecuada**, reconstruye por ingeniería inversa lo que el código hace y, por
cada comportamiento descubierto, **crea un Feature (`FEAT-XXX`)** documentado, para
después poder cubrir ese código con pruebas.

```text
Código legacy
    │
    ▼
Inventariar artefactos técnicos ┐
    │                           │
    ▼                           │
Reconstruir Casos de Uso        │
    │                           │
    ▼                           │
Agrupar por objetivo del usuario│  Paso 1 — Discovery (discovery.md)
    │                           │  (este skill, work-research)
    ▼                           │
Generar Capabilities            │
    │                           │
    ▼                           │
Dividir en Features             │
    │                           │
    ▼                           │
Validar cohesión de Features    │
    │                           │
    ▼                           │
Descubrir Reglas de Negocio     ┘
    │
    ▼
Crear Features (FEAT-XXX)        ← docs/specs/features/FEAT-XXX-{slug}/README.md
    │                              (descripción funcional, reglas de negocio, criterios de aceptación, referencias)
    ▼
Definir Casos de Prueba          ← handoff a test-define (dentro de la misma carpeta del FEAT)
    │
    ▼
Validar cobertura                ← handoff a trace-validate (¿el código existente tiene pruebas?)
```

El `FEAT-XXX` documenta código **ya implementado**; no se implementa con
`work-implement`. Cerrar un hueco de cobertura = escribir **pruebas** sobre el código
existente, nunca código funcional.

> **Qué produce este flujo (y qué no).** Produce el `discovery.md` (artefactos
> técnicos → casos de uso → capabilities → features validados → reglas de negocio,
> cobertura existente) como archivo adicional dentro de `research/RS-XXX-{slug}/`, más
> el `README.md` (informe principal); y, por cada feature descubierto, una carpeta
> `docs/specs/features/FEAT-XXX-{slug}/` con su `README.md`.
> **No escribe código de pruebas ni de aplicación.** El último paso —definir casos de
> prueba— se ejecuta haciendo *handoff* a `test-define`; y con los TC definidos se
> puede correr `trace-validate` para verificar si el código existente ya está cubierto
> por pruebas.

> **El `FEAT-XXX` no es implementable.** Es la **especificación de código ya
> implementado**: documenta lo que el sistema hace hoy, no algo por construir. Por eso
> **no** se pasa a `work-implement` (los artefactos implementables son US/TK y WI). Su
> uso downstream es `trace-validate`: comprobar si sus `AC-XXX`/`TC-XXX` tienen
> implementación de pruebas en el repo. Cerrar un hueco de cobertura significa escribir
> **pruebas** (no código funcional) sobre el código que ya existe.

El flujo es **secuencial y con compuertas**: no se crean features hasta que el
discovery esté en `Ready`, y no se invoca `test-define` sobre un `FEAT-XXX` hasta que
ese feature esté en `Estado: Ready`.

## Principios rectores (no negociables)

1. **Fidelidad al código, no al deseo.** Se documenta el comportamiento **actual**
   que el código implementa, no el que "debería" tener. Si algo parece un bug, se
   marca como tal y se consulta con el usuario antes de convertirlo en criterio de
   aceptación (ver más abajo). Nunca se inventa comportamiento ausente.
2. **Todo hallazgo cita evidencia.** Cada artefacto, caso de uso, capability, feature
   y regla de negocio referencia el **archivo y símbolo** (función/clase/endpoint) del
   que se dedujo. Un hallazgo sin evidencia es una hipótesis, no un hallazgo: se marca
   como `⚠️ Sin evidencia` y se resuelve o descarta.
3. **Features sólidos, no abstractos.** Un Feature solo se acepta tras recorrer la
   cascada (artefactos → casos de uso → objetivos → capabilities → criterios de
   división → métricas de cohesión). Proponer Features a ojo por carpeta/módulo, sin
   esa cascada, es un anti-pattern.
4. **Separación de artefactos.** Los features y las pruebas resultantes registran
   funcionalidad **ya implementada** (aquí, inferida desde código), no trabajo por
   construir definido por negocio. Por eso viven en su propio subárbol
   `docs/specs/features/` —junto a `docs/specs/user-stories/` y `docs/specs/work-items/`,
   pero **no mezclados** con ellos— y llevan marca de procedencia.
5. **Orientado a probabilidad de prueba.** El fin último es cubrir el código con
   pruebas. Prioriza descubrir el comportamiento **verificable** (entradas → salidas,
   efectos observables) por encima de la narrativa.

## Ubicación de los artefactos

El `RS-XXX` de análisis legacy se guarda en el proyecto que contiene el código:

```text
<proyecto>/docs/specs/research/
└── RS-XXX-{slug}/
    ├── README.md        # informe principal (plantilla assets/research-template.md)
    └── discovery.md      # artefactos → CU → capabilities → features → BR
                          #   (plantilla assets/legacy/discovery-template.md)
```

Los **features** creados a partir del discovery viven **fuera** de `research/`, en su
propio subárbol `docs/specs/features/` (junto a `user-stories/` y `work-items/`):

```text
<proyecto>/docs/specs/features/
└── FEAT-XXX-{slug}/
    ├── README.md          # feature inferido (plantilla assets/legacy/feature-template.md)
    └── test-cases/
        ├── README.md       # índice de TCs
        └── TC-XXX-{slug}.md # casos de prueba inferidos (test-define)
```

- `{slug}` del RS: descripción corta del código analizado en *kebab-case* sin
  acentos, p. ej. `motor-facturacion`, `modulo-inventario-legacy`.
- `XXX` del RS: secuencial de tres dígitos sobre las carpetas `RS-XXX-*` de
  `docs/specs/research/` (mayor + 1; `001` si no hay).
- `{slug}` del FEAT: descripción corta del feature en *kebab-case*, p. ej.
  `emision-factura`, `calculo-impuestos`.
- `XXX` del FEAT: secuencial de tres dígitos sobre las carpetas `FEAT-XXX-*` de
  `docs/specs/features/` (mayor + 1; `001` si no hay). Es independiente de la numeración
  de `docs/specs/user-stories/` y `docs/specs/work-items/`.

## Entradas necesarias

1. **Qué código entra en el alcance:** rutas, módulo(s), entrypoints o el repo
   completo. Si el usuario no lo delimita, pedirlo; no inventar el alcance.
2. **Contexto del dominio (si existe):** nombre del sistema, actores conocidos,
   documentación parcial. Es opcional; su ausencia es justamente el motivo del flujo.
3. **Referencia de versión:** commit/branch o etiqueta del código analizado, para
   dejar trazabilidad de qué versión del código se documentó.

---

## Paso 1 — Discovery (`discovery.md`)

El discovery **no parte de Features**: parte del código concreto y asciende hasta
Features sólidos. Cascada obligatoria:

```text
Artefactos técnicos → Casos de uso → Objetivos de usuario → Capabilities → Features → Cohesión → Reglas de negocio
```

No saltes pasos. Un Feature inventado a ojo (por carpeta o nombre de módulo) sin
recorrer esta cascada es un anti-pattern.

### 1. Inventariar artefactos técnicos

Recorre el código en alcance y cataloga **todos** los artefactos técnicos
observables. Cada fila cita evidencia (archivo · símbolo). Tipos a cubrir (omite
solo los que no existan en el alcance, no inventes):

| Tipo | Qué buscar |
|------|------------|
| **Entidades** | Modelos, tablas, agregados, schemas, DTOs de dominio persistidos |
| **Endpoints** | Rutas HTTP/GraphQL/RPC, controllers, handlers de API |
| **Comandos** | CLI, handlers CQRS/command bus, actions disparadas por el usuario |
| **Eventos** | Domain/integration events, mensajes de cola, webhooks emitidos/consumidos |
| **Jobs** | Cron, workers, colas, tareas programadas, batch |
| **Pantallas** | Vistas, páginas, rutas de UI, formularios, menús |
| **Servicios** | Servicios de dominio/aplicación, clients externos, facades |

Tabla: **Artefacto**, **Tipo**, **Descripción (observada)**, **Ubicación en código**,
**Evidencia**. Marca `⚠️ Sin evidencia` cualquier ítem que no puedas anclar a código.

> Este inventario es la **base de evidencia**. Todo caso de uso, capability y feature
> posteriores debe trazarse a uno o más artefactos de esta tabla.

### 2. Reconstruir los casos de uso

A partir de los artefactos, deriva las **interacciones concretas actor↔sistema** con
un objetivo (p. ej. "El cajero emite una factura para una venta"). No inventes actores
ni flujos: infiérelos de roles, permisos, entrypoints y pantallas.

Tabla: **Caso de uso**, **Actor**, **Artefactos involucrados** (IDs/nombres del
inventario), **Flujo observado** (pasos principales + ramas/errores que el código
maneja), **Ubicación en código**. Distingue flujo principal de alternos/errores
cuando el código los maneje explícitamente.

### 3. Agrupar casos de uso por objetivo del usuario

Agrupa los casos de uso que persiguen el **mismo objetivo de usuario** (el "para qué",
no el "cómo técnico"). Un objetivo es una intención de negocio observable (p. ej.
"cobrar una venta", "dar de alta un usuario"), no un módulo técnico.

Tabla: **Objetivo del usuario**, **Casos de uso incluidos**, **Justificación del
agrupamiento** (por qué comparten el mismo "para qué").

### 4. Generar Capabilities

Por cada grupo de objetivo (o por fusión justificada de varios objetivos afines),
propón una **Capability**: capacidad del sistema al nivel de dominio (alineada con el
concepto de capability de `design-define` / `docs/specs/technical-docs/`). Una
Capability es más amplia que un Feature: agrupa comportamientos que el negocio
reconoce como una misma área (p. ej. "Facturación", "Autenticación").

Tabla: **Capability**, **Objetivo(s) de usuario**, **Casos de uso**, **Artefactos
clave**, **Descripción (observada)**.

### 5. Dividir cada Capability en Features

Parte cada Capability en **Features** candidatos. Un Feature es un recorte de la
Capability que merece su propio `FEAT-XXX`. **Divide** cuando se cumpla **al menos
uno** de estos criterios (anota cuál aplica):

| Criterio de división | Señal en el código |
|----------------------|--------------------|
| **Reglas independientes** | Conjunto de validaciones/cálculos/estados que no se mezclan con el resto de la Capability |
| **Evolución independiente** | Cambia con frecuencia distinta, vive en módulo/paquete propio, o tiene dueño técnico distinto |
| **Prueba independiente** | Se puede cubrir con un suite de pruebas sin arrastrar el resto de la Capability |
| **Despliegue / feature flag** | Se habilita o desactiva por flag, config, permiso o rollout independiente |

Si **ningún** criterio aplica, la Capability **es** un único Feature (no fragmentes
por carpeta ni por gusto). Si varios criterios empujan a cortes distintos, prioriza
el que produzca Features con mejor cohesión en el paso siguiente.

Tabla: **Feature candidato**, **Capability padre**, **Criterio(s) de división**,
**Casos de uso**, **Artefactos**, **Descripción (observada)**.

### 6. Validar cohesión de cada Feature

Antes de aceptar un Feature candidato, calcula (cualitativamente, con evidencia) sus
**métricas de cohesión**. Un Feature solo pasa a "aceptado" si cumple **todas**:

| Métrica | Pregunta de validación | Umbral |
|---------|------------------------|--------|
| **Un objetivo principal** | ¿Se puede enunciar en una oración el "para qué" único? | Obligatorio; si hay dos objetivos, dividir o fusionar mal |
| **Alta cohesión funcional** | ¿Los casos de uso y artefactos colaboran al mismo propósito? | Sin piezas huérfanas ni "cajón de sastre" |
| **Bajo acoplamiento** | ¿Puede entenderse/probarse sin arrastrar otros Features? ¿Las dependencias son explícitas y mínimas? | Acoplamiento fuerte → reagrupar o marcar dependencia |
| **Vocabulario de negocio consistente** | ¿Usa los mismos términos de dominio (entidades, estados) sin sinonimia confusa? | Un léxico; sinonimias injustificadas → renombrar o dividir |
| **Límites claros de responsabilidad** | ¿Queda explícito qué hace y qué queda fuera (otros Features)? | Frontera enunciable; solapes → resolver en Notas |

Tabla: **Feature**, **Objetivo principal**, **Cohesión** (Alta/Media/Baja),
**Acoplamiento** (Bajo/Medio/Alto · Features acoplados), **Vocabulario** (OK /
Inconsistente), **Límites** (Claros / Difusos), **Veredicto** (Aceptado /
Reagrupar / Dividir más).

Los Features con veredicto distinto de **Aceptado** no entran al mapa FEAT ni se
crean en el Paso 2 hasta reagruparlos o dividirlos. Documenta la decisión en Notas.

### 7. Descubrir Reglas de Negocio

Sobre los Features **aceptados**, extrae las **reglas de negocio** (`BR-XX`) que el
código aplica: validaciones, cálculos, condiciones, límites, transiciones de estado,
valores por defecto, efectos secundarios. Cada regla debe ser una afirmación
verificable anclada a código y asociada a un Feature.

Tabla: **BR-XX**, **Feature**, **Regla (enunciado observado)**, **Tipo** (Validación /
Cálculo / Flujo / Autorización / Persistencia), **Dónde se aplica** (archivo/símbolo),
**Confianza** (Alta / Media / Baja según cuán explícita esté en el código),
**¿Posible bug?** (Sí/No — ver abajo).

> **Bugs vs. comportamiento a preservar.** El código puede contener comportamiento
> erróneo. Cuando una regla observada parezca un bug (cálculo incorrecto, validación
> ausente, caso no manejado), **no** la conviertas silenciosamente en criterio de
> aceptación: márcala `¿Posible bug? = Sí`, descríbela en `Notas` y **consúltalo con
> el usuario** con la herramienta de preguntas estructuradas: ¿se preserva el
> comportamiento actual (para no romper nada al agregar pruebas) o se documenta como
> defecto a corregir? La respuesta determina si la regla entra como criterio o como
> observación/pendiente en el feature.

### 8. Inventariar la cobertura de pruebas existente

Registra qué pruebas existen ya sobre el código en alcance para no duplicar y para
enfocar el esfuerzo donde falta. Tabla: **Componente / Feature**, **Pruebas
existentes** (unit/integración/e2e y ubicación), **Cobertura** (Alta/Media/Baja/
Nula), **Gap** (qué queda sin cubrir). Este inventario justifica qué features vale la
pena documentar y cubrir primero.

### 9. Mapa Feature → FEAT-XXX

Consolida el puente hacia el Paso 2: por cada Feature **aceptado**, el **FEAT
propuesto** (slug), la **Capability padre**, los **casos de uso** que agrupa y las
**BR-XX** que lo gobiernan. Es el insumo directo de la creación de features.

### 10. Cerrar lagunas y fijar el estado

Antes de fijar el estado, resuelve las **lagunas** (artefactos/casos/features/reglas
`⚠️ Sin evidencia`, Features no aceptados, confianza Baja, posibles bugs sin decisión
del usuario, actores no identificados) con la herramienta de preguntas estructuradas.
Objetivo: dejar el discovery en **`Ready`**.

- **Ready**: sin hallazgos `⚠️ Sin evidencia`, todos los Features candidatos con
  veredicto **Aceptado**, sin posibles bugs sin decidir, y el mapa Feature → FEAT
  completo.
- **Draft**: hay pendientes; se listan todos en `Notas`. **No se crean features
  mientras el discovery esté en `Draft`.**

Copia `assets/legacy/discovery-template.md`, **renómbrala a `discovery.md`** dentro
de `research/RS-XXX-{slug}/` y rellénala. Luego redacta el `README.md` (informe
principal) con `assets/research-template.md`, enlazando `discovery.md` en "Archivos
adicionales" y marcando "Impacto en el artefacto / próximo paso" como el plan de
creación de features + pruebas.

> Presenta el informe y el discovery al usuario (Paso 4 del SKILL) y obtén su
> confirmación **antes** de crear los features.

---

## Paso 2 — Crear los Features (`FEAT-XXX`)

Solo con el discovery en **`Ready`** y confirmado por el usuario. Por cada Feature
**aceptado** del mapa (Paso 1.9), crea una carpeta `docs/specs/features/FEAT-XXX-{slug}/`
con un `README.md` a partir de `assets/legacy/feature-template.md`:

1. **Numeración.** Calcula el siguiente `FEAT-XXX` leyendo **solo** las carpetas
   `FEAT-XXX-*` de `docs/specs/features/` (mayor + 1; `001` si no hay). Independiente de
   la numeración de `user-stories/` y `work-items/`.
2. **Contenido del `README.md`:**
   - **Descripción funcional:** qué hace el feature (comportamiento observable ya
     implementado) y qué no hace / queda fuera de alcance. Incluye la **Capability
     padre** y el objetivo principal validados en el discovery.
   - **Reglas de negocio (`BR-XX`):** las reglas del discovery asociadas al feature,
     con enunciado RFC 2119. Las marcadas como posible bug entran según la decisión
     del Paso 1.7 (como regla/criterio si se preserva; como Observación si se corrige).
   - **Criterios de aceptación (`AC-XXX`):** derivados de los casos de uso y las
     reglas de negocio, redactando el comportamiento **real** del código en RFC 2119.
     Cada `BR-XX` debe quedar verificada por al menos un `AC-XXX`.
   - **Referencias:** enlaces al `RS-XXX/discovery.md` del que nació el feature (y a
     otras investigaciones `RS-XXX` usadas en su implementación, si las hay), más
     documentación técnica, referencias visuales (mockups/diagramas) o bibliografía
     relevante. La evidencia en código (archivo · símbolo), el inventario de
     artefactos, las métricas de cohesión, las pruebas existentes y el estado de
     cobertura **no** se duplican aquí: viven en el discovery (`RS-XXX/discovery.md`).
   - **Procedencia:** marca "Inferido desde código (RS-XXX · commit/branch)".
3. **Estado.** `Ready` si todos los `AC-XXX` tienen identificador y enunciado RFC 2119,
   **cada `BR-XX` declarada queda verificada por al menos un `AC-XXX`** (ninguna `BR-XX`
   sin su `AC-XXX` correspondiente — ver bullet **Criterios de aceptación** arriba) y no
   quedan lagunas; en caso contrario `Draft` con los pendientes en Observaciones. Solo los
   features en `Ready` pasan al Paso 3.

---

## Paso 3 — Definir Casos de Prueba (*handoff* a `test-define`)

Por cada `FEAT-XXX` en **`Estado: Ready`**, invoca `test-define`:

1. Genera los `TC-XXX` a partir de los `AC-XXX` del feature, siguiendo el flujo normal
   de `test-define` (perspectivas happy/error/límite como cobertura mínima).
2. **Destino:** los TCs se guardan **dentro de la misma carpeta del feature**, en
   `docs/specs/features/FEAT-XXX-{slug}/test-cases/`, con su índice `README.md`, igual que
   ocurre con una US o un WI.
3. Los TCs describen el comportamiento **actual** del código (son la red de seguridad
   para cubrirlo). Cuando un TC valide un comportamiento marcado como posible bug
   preservado, anotarlo para trazabilidad.

> `test-define` reconoce `FEAT-XXX` como artefacto de origen (ver su sección "Feature
> (FEAT-XXX)"): lee los `AC-XXX` del `README.md` del feature y guarda los TCs bajo su
> carpeta `test-cases/`.

## Paso 4 — Validar cobertura (*handoff* a `trace-validate`)

Con los `TC-XXX` definidos, invoca `trace-validate` sobre el `FEAT-XXX` para verificar
si el código existente está cubierto por pruebas:

1. `trace-validate` lee los `AC-XXX` del `README.md` del feature y sus `TC-XXX`, y los
   cruza contra los artefactos de prueba del repo (unit/integración/e2e).
2. Emite un veredicto de cobertura por criterio. Un criterio **No cubierto** significa
   que ese comportamiento ya implementado **no tiene pruebas** que lo respalden —un
   hueco a cerrar—, no que falte código funcional.
3. **Cerrar los huecos es escribir pruebas, no funcionalidad.** El `FEAT-XXX` no pasa a
   `work-implement`; las pruebas faltantes se escriben sobre el código que ya existe.
   Si el equipo quiere formalizar ese trabajo de cobertura como una unidad rastreable,
   puede crear una tarea de mantenimiento (`WI-XXX`) (deuda técnica de pruebas) que referencie
   el `FEAT-XXX` — esa es una decisión del usuario, no un paso automático de este flujo.

---

## Resultado

Al terminar, indica al usuario:

- La carpeta `research/RS-XXX-{slug}/` creada, con `README.md` y `discovery.md`, y su
  estado (`Draft`/`Ready`) con una línea de por qué.
- Los features creados en `docs/specs/features/` (IDs `FEAT-XXX` y títulos) y sus casos de
  prueba en cada `test-cases/`, recordando que son **inferidos desde código**
  (procedencia marcada) y viven en su propio subárbol, separados de las historias y
  work items.
- El resultado de `trace-validate` sobre cada feature: qué comportamiento del código ya
  está cubierto por pruebas y qué huecos quedan. El próximo paso sugerido es **escribir
  las pruebas faltantes** sobre el código existente (no código funcional); el `FEAT-XXX`
  no se implementa con `work-implement`.
- Si el discovery quedó en `Draft`, recuerda que los features no se crean hasta
  resolver sus pendientes.
