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
Descubrir Features          ┐
    │                       │
    ▼                       │  Paso 1 — Discovery (discovery.md)
Descubrir Casos de Uso      │  (este skill, work-research)
    │                       │
    ▼                       │
Descubrir Reglas de Negocio ┘
    │
    ▼
Crear Features (FEAT-XXX)        ← docs/features/FEAT-XXX-{slug}/README.md
    │                              (objetivo, reglas de negocio, criterios de aceptación, referencias)
    ▼
Definir Casos de Prueba          ← handoff a test-define (dentro de la misma carpeta del FEAT)
    │
    ▼
Validar cobertura                ← handoff a trace-validate (¿el código existente tiene pruebas?)
```

El `FEAT-XXX` documenta código **ya implementado**; no se implementa con
`work-implement`. Cerrar un hueco de cobertura = escribir **pruebas** sobre el código
existente, nunca código funcional.

> **Qué produce este flujo (y qué no).** Produce el `discovery.md` (features, casos
> de uso, reglas de negocio, cobertura existente) como archivo adicional dentro de
> `research/RS-XXX-{slug}/`, más el `README.md` (informe principal); y, por cada
> feature descubierto, una carpeta `docs/features/FEAT-XXX-{slug}/` con su `README.md`.
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
2. **Todo hallazgo cita evidencia.** Cada feature, caso de uso y regla de negocio
   referencia el **archivo y símbolo** (función/clase/endpoint) del que se dedujo.
   Un hallazgo sin evidencia es una hipótesis, no un hallazgo: se marca como
   `⚠️ Sin evidencia` y se resuelve o descarta.
3. **Separación de artefactos.** Los features y las pruebas resultantes son
   **inferidos** desde código, no definidos por negocio. Por eso viven bajo
   `docs/features/` (no en `docs/specs/**`) y llevan marca de procedencia.
4. **Orientado a probabilidad de prueba.** El fin último es cubrir el código con
   pruebas. Prioriza descubrir el comportamiento **verificable** (entradas → salidas,
   efectos observables) por encima de la narrativa.

## Ubicación de los artefactos

El `RS-XXX` de análisis legacy se guarda en el proyecto que contiene el código:

```text
<proyecto>/docs/specs/research/
└── RS-XXX-{slug}/
    ├── README.md        # informe principal (plantilla assets/research-template.md)
    └── discovery.md      # features → casos de uso → reglas de negocio
                          #   (plantilla assets/legacy/discovery-template.md)
```

Los **features** creados a partir del discovery viven **fuera** de `research/`, bajo
`docs/features/` (raíz separada de `docs/specs/`):

```text
<proyecto>/docs/features/
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
  `docs/features/` (mayor + 1; `001` si no hay). Es independiente de la numeración de
  `docs/specs/`.

## Entradas necesarias

1. **Qué código entra en el alcance:** rutas, módulo(s), entrypoints o el repo
   completo. Si el usuario no lo delimita, pedirlo; no inventar el alcance.
2. **Contexto del dominio (si existe):** nombre del sistema, actores conocidos,
   documentación parcial. Es opcional; su ausencia es justamente el motivo del flujo.
3. **Referencia de versión:** commit/branch o etiqueta del código analizado, para
   dejar trazabilidad de qué versión del código se documentó.

---

## Paso 1 — Discovery (`discovery.md`)

### 1. Descubrir Features

Recorre el código en alcance e identifica las **features**: capacidades funcionales
de alto nivel que el sistema ofrece (p. ej. "emisión de facturas", "cálculo de
impuestos", "gestión de usuarios"). Pistas: agrupaciones por carpeta/módulo,
controladores/endpoints, comandos CLI, jobs, menús de UI, servicios de dominio.

Tabla: **Feature**, **Descripción (qué hace, observado)**, **Ubicación en código**
(archivos/símbolos), **Evidencia** (endpoint, función, ruta de UI). Marca
`⚠️ Sin evidencia` cualquier feature que no puedas anclar a código concreto.

### 2. Descubrir Casos de Uso

Por cada feature, deriva los **casos de uso**: interacciones concretas actor↔sistema
con un objetivo (p. ej. "El cajero emite una factura para una venta"). Los casos de
uso **alimentan los criterios de aceptación** del feature al que pertenecen.

Tabla: **Caso de uso**, **Actor** (inferido de roles/permisos/entrypoints),
**Feature**, **Flujo observado** (pasos principales que hace el código, incluyendo
ramas y validaciones), **Ubicación en código**. Distingue flujo principal de flujos
alternativos/errores cuando el código los maneje explícitamente.

### 3. Descubrir Reglas de Negocio

Extrae las **reglas de negocio** (`BR-XX`) que el código aplica: validaciones,
cálculos, condiciones, límites, transiciones de estado, valores por defecto,
efectos secundarios. Cada regla debe ser una afirmación verificable anclada a
código.

Tabla: **BR-XX**, **Regla (enunciado observado)**, **Tipo** (Validación / Cálculo /
Flujo / Autorización / Persistencia), **Dónde se aplica** (archivo/símbolo),
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

### 4. Inventariar la cobertura de pruebas existente

Registra qué pruebas existen ya sobre el código en alcance para no duplicar y para
enfocar el esfuerzo donde falta. Tabla: **Componente / Feature**, **Pruebas
existentes** (unit/integración/e2e y ubicación), **Cobertura** (Alta/Media/Baja/
Nula), **Gap** (qué queda sin cubrir). Este inventario justifica qué features vale la
pena documentar y cubrir primero.

### 5. Mapa Feature → FEAT-XXX

Consolida el puente hacia el Paso 2: por cada feature, el **FEAT propuesto** (slug),
los **casos de uso** que agrupa y las **BR-XX** que lo gobiernan. Es el insumo directo
de la creación de features.

### 6. Cerrar lagunas y fijar el estado

Antes de fijar el estado, resuelve las **lagunas** (features/reglas
`⚠️ Sin evidencia`, confianza Baja, posibles bugs sin decisión del usuario, actores
no identificados) con la herramienta de preguntas estructuradas. Objetivo: dejar el
discovery en **`Ready`**.

- **Ready**: sin hallazgos `⚠️ Sin evidencia`, sin posibles bugs sin decidir, y el
  mapa Feature → FEAT completo.
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

Solo con el discovery en **`Ready`** y confirmado por el usuario. Por cada feature del
mapa (Paso 1.5), crea una carpeta `docs/features/FEAT-XXX-{slug}/` con un `README.md`
a partir de `assets/legacy/feature-template.md`:

1. **Numeración.** Calcula el siguiente `FEAT-XXX` leyendo **solo** las carpetas
   `FEAT-XXX-*` de `docs/features/` (mayor + 1; `001` si no hay). Independiente de
   `docs/specs/`.
2. **Contenido del `README.md`:**
   - **Objetivo:** qué capacidad ofrece el feature, descrita desde lo que hace el
     código.
   - **Reglas de negocio (`BR-XX`):** las reglas del discovery asociadas al feature,
     con enunciado RFC 2119. Las marcadas como posible bug entran según la decisión
     del Paso 1.3 (como regla/criterio si se preserva; como Observación si se corrige).
   - **Criterios de aceptación (`AC-XXX`):** derivados de los casos de uso y las
     reglas de negocio, redactando el comportamiento **real** del código en RFC 2119.
     Cada `BR-XX` debe quedar verificada por al menos un `AC-XXX`.
   - **Referencias:** enlaces al `RS-XXX/discovery.md` del que nació el feature (y a
     otras investigaciones `RS-XXX` usadas en su implementación, si las hay), más
     documentación técnica, referencias visuales (mockups/diagramas) o bibliografía
     relevante. La evidencia en código (archivo · símbolo), las pruebas existentes y
     el estado de cobertura **no** se duplican aquí: viven en el discovery
     (`RS-XXX/discovery.md`, Pasos 1.1–1.4).
   - **Procedencia:** marca "Inferido desde código (RS-XXX · commit/branch)".
3. **Estado.** `Ready` si todos los `AC-XXX` tienen identificador y enunciado RFC 2119
   y no quedan lagunas; en caso contrario `Draft` con los pendientes en Observaciones.
   Solo los features en `Ready` pasan al Paso 3.

---

## Paso 3 — Definir Casos de Prueba (*handoff* a `test-define`)

Por cada `FEAT-XXX` en **`Estado: Ready`**, invoca `test-define`:

1. Genera los `TC-XXX` a partir de los `AC-XXX` del feature, siguiendo el flujo normal
   de `test-define` (perspectivas happy/error/límite como cobertura mínima).
2. **Destino:** los TCs se guardan **dentro de la misma carpeta del feature**, en
   `docs/features/FEAT-XXX-{slug}/test-cases/`, con su índice `README.md`, igual que
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
   puede crear un `WI-XXX` de mantenimiento (deuda técnica de pruebas) que referencie
   el `FEAT-XXX` — esa es una decisión del usuario, no un paso automático de este flujo.

---

## Resultado

Al terminar, indica al usuario:

- La carpeta `research/RS-XXX-{slug}/` creada, con `README.md` y `discovery.md`, y su
  estado (`Draft`/`Ready`) con una línea de por qué.
- Los features creados en `docs/features/` (IDs `FEAT-XXX` y títulos) y sus casos de
  prueba en cada `test-cases/`, recordando que son **inferidos desde código**
  (procedencia marcada) y viven separados de `docs/specs/`.
- El resultado de `trace-validate` sobre cada feature: qué comportamiento del código ya
  está cubierto por pruebas y qué huecos quedan. El próximo paso sugerido es **escribir
  las pruebas faltantes** sobre el código existente (no código funcional); el `FEAT-XXX`
  no se implementa con `work-implement`.
- Si el discovery quedó en `Draft`, recuerda que los features no se crean hasta
  resolver sus pendientes.
