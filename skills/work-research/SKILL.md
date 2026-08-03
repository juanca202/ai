---
name: work-research
description: 'Investigar y sintetizar hallazgos en un informe estructurado (RS-XXX). Skill genérico que corre varios flujos según la entrada: (1) artefacto — si hay un US-XXX, TK-XXX o WI-XXX en contexto, investigar lagunas y decisiones pendientes por tomar sobre ese artefacto; (2) migración — si hay un proyecto de origen y uno de destino, tomar los archivos de esos proyectos y generar el discovery y la preparación de validación, decidiendo si el cambio es grande (continúa work-define) o pequeño (continúa work-plan); (3) investigación libre — si no hay artefacto, investigar un tema de producto, arquitectura, técnica o cambio; (4) análisis legacy — si la entrada es código existente sin (o con insuficiente) documentación de requisitos o cobertura de pruebas, descubrir desde el código (artefactos técnicos → casos de uso → capabilities → features cohesivos → reglas de negocio) y crear por cada feature una carpeta docs/specs/features/FEAT-XXX-{slug}/ (descripción funcional, reglas de negocio, criterios de aceptación, referencias) que documenta el comportamiento ya implementado, más sus casos de prueba inferidos, para luego validar con trace-validate si ese código está cubierto por pruebas. Activar cuando el usuario pida "investiga", "research", "¿es viable?", "¿cómo funciona X?", "¿qué impacto tiene?", "¿qué alternativas existen?", "compara opciones", "necesito contexto sobre", "migrar/migración entre proyectos", "analiza este código legacy", "crea features/pruebas desde el código", "ingeniería inversa de requisitos", "documentar código heredado para probarlo", o cualquier variante que implique recopilar información antes de decidir. También activar con "/work-research" o cuando se mencione "RS-XXX". Si hay un artefacto US/TK/WI o un par origen→destino en contexto, usarlo automáticamente sin preguntar.'
license: MIT
---

# Skill: Investigación de trabajo

Skill **genérico** de investigación. Recopila información, la sintetiza y la
persiste de forma estandarizada. Corre **varios flujos** según la entrada; todos
comparten el mismo esqueleto (capturar intención → cargar contexto → investigar →
sintetizar → guardar) y la **misma salida estandarizada**.

> **Propósito:** resolver dudas y preparar el terreno antes de especificar,
> planificar o implementar. La investigación alimenta decisiones; **no** modifica
> artefactos existentes ni genera código. Tampoco genera el plan de
> implementación: ese paso lo continúan `work-define` o `work-plan`.

---

## Flujos

El flujo se determina por la **entrada** en el Paso 1. No mezclar flujos en una
misma ejecución.

| Flujo | Entrada | Qué investiga / produce | Referencia |
|-------|---------|-------------------------|------------|
| **A · Artefacto** | Un `US-XXX`, `TK-XXX` o `WI-XXX` en contexto | Lagunas y **decisiones pendientes por tomar** sobre ese artefacto antes de planificar o implementar | Paso 3A (abajo) |
| **B · Migración** | Un **proyecto origen** y uno **destino** | `discovery` (mapeo tecnológico, verificación, golden master, riesgos) y **preparación de validación**; luego dimensiona el cambio y hace *handoff* a `work-define` (grande) o `work-plan` (pequeño) | [`references/migrate/flow.md`](references/migrate/flow.md) |
| **C · Investigación libre** | Un tema, **sin artefacto** | Hallazgos de Producto, Arquitectura, Técnica o Cambio | Paso 3C (abajo) |
| **D · Análisis legacy** | **Código existente** (módulo/carpeta/repo) sin requisitos o con cobertura de pruebas inadecuada | `discovery` de ingeniería inversa (artefactos técnicos → casos de uso → capabilities → features cohesivos → reglas de negocio) y, por cada feature, una carpeta `docs/specs/features/FEAT-XXX-{slug}/` (descripción funcional, reglas de negocio, criterios de aceptación, referencias) que documenta el comportamiento ya implementado, más sus casos de prueba vía `test-define`, **inferidos desde el código**; luego `trace-validate` verifica si ese código está cubierto por pruebas | [`references/legacy/flow.md`](references/legacy/flow.md) |

> **Migración (flujo B):** la entrada es un proyecto origen y uno destino. El
> discovery y la validación los produce este skill; el plan lo continúa
> `work-define` (cambio grande) o `work-plan` (cambio pequeño).

> **Análisis legacy (flujo D):** la entrada es código ya escrito. El objetivo es
> **reconstruir** los requisitos que ese código **ya implementa** —no diseñar nuevos—.
> Un `FEAT-XXX` es la **especificación de algo ya implementado**, no un artefacto
> implementable: no genera código funcional. Su valor es servir de base para que
> `trace-validate` verifique si el código existente está **cubierto por pruebas** y
> revele los huecos de cobertura. Cada feature descubierto se materializa como un
> `FEAT-XXX` en `docs/specs/features/`. Los features y sus casos de prueba son **inferidos**
> (no definidos por negocio) y por eso viven en su propio subárbol `docs/specs/features/`,
> junto a `user-stories/` y `work-items/` pero **no mezclados** con ellos. Los artefactos
> **implementables** siguen siendo US/TK y WI.

---

## Salida estandarizada (todos los flujos)

Toda investigación genera **una carpeta** `research/RS-XXX-{slug}/` con un
`README.md` como **informe principal**. Puede referenciar **archivos adicionales**
dentro de la misma carpeta si el flujo lo define (p. ej. el flujo B añade
`discovery.md`, `validation.md` y una carpeta `validation/`).

**Dónde vive la carpeta `research/`** (se mantiene el criterio actual):

- **Con artefacto vinculado** (flujo A) → dentro de la carpeta del artefacto:
  - `US-XXX`/`TK-XXX` → `docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}/`
  - `WI-XXX` → `docs/specs/work-items/WI-XXX-{kebab-case}/research/RS-XXX-{slug}/`
- **Sin artefacto vinculado** (flujos B, C y D) → `docs/specs/research/RS-XXX-{slug}/`
  (para la migración, en el **proyecto destino**; para el análisis legacy, en el
  proyecto que contiene el código analizado).

El `README.md` se redacta con `assets/research-template.md`. Los archivos
adicionales del flujo B usan las plantillas de `assets/migrate/`; el `discovery.md`
del flujo D usa `assets/legacy/discovery-template.md`.

> **Salida adicional del flujo D (fuera de `research/`).** El análisis legacy, además
> del `RS-XXX` (informe + `discovery.md`), **crea features**: por cada feature
> descubierto, una carpeta `docs/specs/features/FEAT-XXX-{slug}/` con un `README.md`
> (descripción funcional, reglas de negocio `BR-XX`, criterios de aceptación `AC-XXX`, referencias)
> a partir de `assets/legacy/feature-template.md`, y sus casos de prueba en
> `docs/specs/features/FEAT-XXX-{slug}/test-cases/` vía `test-define`. Estos viven en su
> propio subárbol `docs/specs/features/` —junto a `user-stories/` y `work-items/` pero
> **no mezclados** con ellos— para distinguir que fueron **inferidos desde el código**, no
> definidos por negocio. La numeración `FEAT-XXX`/`TC-XXX` es **independiente** de la de
> `docs/specs/user-stories/` y `docs/specs/work-items/`.

---

## Cómo preguntar al usuario

Toda pregunta va por la **herramienta de preguntas estructuradas** (opciones
tappables), no como prosa libre. Si el cliente no la expone, formular en prosa con
opciones enumeradas. Si el **MCP de Chrome** no está disponible (flujo B), pedir al
usuario que aporte los insumos manualmente en lugar de detenerse.

---

## Modo de ejecución

Si este skill es invocado **dentro de una sesión activa de `work-implement`** (el
agente principal está ejecutando una TK o un WI), ejecutar la investigación como
**subagente o tarea delegada**:

- Lanzar la investigación usando la herramienta de subagente/tarea del cliente.
- El subagente ejecuta el flujo de forma autónoma.
- Al terminar, **solo devuelve al agente principal**: ruta del RS guardado +
  resumen ejecutivo de 2-3 oraciones.
- El agente principal continúa sin interrumpir el flujo de la sesión.

Si no hay sesión de implementación activa, ejecutar de forma interactiva con el
usuario (flujo normal).

---

## Resolución de idioma

Redactar el informe y los mensajes al usuario en el idioma del mensaje de entrada.
Si hay artefacto o proyecto vinculado, usar el idioma de ese contexto. Ante
conflicto, preguntar.

---

## Paso 1 — Capturar la intención y elegir el flujo

Determinar el flujo a partir de la entrada:

1. **¿Hay un artefacto `US-XXX` / `TK-XXX` / `WI-XXX`** mencionado o implícito? →
   **Flujo A**. Cargarlo como contexto sin preguntar. Si hay ambigüedad (número sin
   prefijo, referencia vaga), preguntar.
2. **¿Hay un proyecto origen y uno destino** (migrar/mover código, features o
   dependencias entre dos proyectos)? → **Flujo B**. Si falta identificar alguno de
   los dos proyectos, pedirlo antes de continuar; no inventar rutas ni stacks.
3. **¿La entrada es código existente que hay que "documentar hacia atrás"** —
   descubrir qué hace y crear features (`FEAT-XXX`) y pruebas desde él porque no
   tiene requisitos escritos o su cobertura de pruebas es inadecuada? → **Flujo D**
   (análisis legacy). Señales: "analiza este código", "crea features/pruebas desde
   el código", "ingeniería inversa", "no tenemos requisitos/pruebas de este
   módulo". Si no está claro qué código entra en el alcance (rutas, módulo, repo),
   pedirlo antes de continuar; no inventar comportamiento que no esté en el código.
4. **Si no hay artefacto, ni par origen→destino, ni código a documentar hacia
   atrás** → **Flujo C** (investigación libre). Clasificar el tema en uno o más
   dominios (Producto, Arquitectura, Técnica, Cambio); si hay varios, confirmar el
   foco principal.

En cualquier flujo, antes de investigar:

- **Clarificar lagunas de alcance.** Si el tema/entrada tiene vacíos que impedirían
  una investigación de calidad (alcance impreciso, contexto faltante, restricciones
  no mencionadas), resolverlos con la herramienta de preguntas estructuradas
  (máximo 2-3 por ronda; omitir lo que ya conste en el artefacto o la conversación).
- **Formular la pregunta de investigación** en una oración concisa y confirmarla:
  opciones [Confirmar / Ajustar / Cancelar]. No investigar hasta recibir
  confirmación. (En el flujo B, la "pregunta" es el objetivo de la migración: qué se
  migra y de qué origen a qué destino.)

### Dominios (flujo C)

| Dominio | Señales típicas | Qué produce |
|---------|-----------------|-------------|
| **Producto** | "¿qué construir?", "benchmarking", "¿qué features tiene X?", viabilidad de negocio | Hallazgos sobre requisitos, mercado o usuarios |
| **Arquitectura** | "¿cómo estructurarlo?", "¿qué patrón?", "¿monolito o microservicio?", "ADR" | Comparativa de patrones, recomendación de diseño |
| **Técnica** | "¿es viable?", "¿cómo funciona X?", "¿qué librería?", "¿rendimiento?" | Evaluación técnica, comparativa de herramientas |
| **Cambio** | "¿qué impacto?", "¿qué se rompe si?", "refactor de", "¿compatibilidad?" | Análisis de impacto, riesgos, enfoque de cambio a alto nivel |

---

## Paso 2 — Cargar contexto

**Flujo A (artefacto).** Leer el artefacto **antes** de investigar:

| Tipo | Archivo a leer | Qué extraer |
|------|----------------|-------------|
| `US-XXX` | `docs/specs/user-stories/US-XXX-{nombre}/README.md` | Objetivo, criterios `AC-XXX`, reglas de negocio, restricciones, Observaciones |
| `TK-XXX` | El `TK-XXX-{kebab}.md` bajo la carpeta de su `US-XXX` | Objetivo técnico, dependencias, decisiones abiertas |
| `WI-XXX` | `docs/specs/work-items/WI-XXX-{kebab-case}/README.md` | Requerimiento, criterios, plan de implementación actual, Observaciones |

Verificar si ya existen investigaciones previas en `research/` del artefacto para
no duplicar; mostrarlas al usuario si las hay.

**Flujo B (migración).** Inspeccionar los archivos de manifiesto/configuración de
**ambos** proyectos (origen y destino) para inferir su stack. Detalle en
[`references/migrate/flow.md`](references/migrate/flow.md).

**Flujo D (análisis legacy).** Delimitar el código en alcance (rutas, módulos,
entrypoints) y leerlo para entender qué hace: puntos de entrada, dominio, flujos y
pruebas ya existentes. Verificar si ya hay features previos en `docs/specs/features/` para
continuar la numeración `FEAT-XXX` y no duplicar. Detalle en
[`references/legacy/flow.md`](references/legacy/flow.md).

**Flujo C.** No hay artefacto que cargar; pasar al Paso 2.5 y al 3C.

---

## Paso 2.5 — Inspeccionar referencias visuales (imágenes y Figma)

Si el usuario proporcionó referencias (imágenes, capturas, enlaces a Figma) —en el
mensaje o dentro del artefacto cargado— inspeccionarlas **antes** de investigar:

1. **Abrir e inspeccionar cada referencia en detalle** (layouts, componentes,
   estados, anotaciones), no de forma superficial.
2. **Detectar lagunas** (estado no cubierto, medida no definida, comportamiento no
   anotado, texto ilegible). No asumir ni rellenar por cuenta propia.
3. **Resolver cada laguna** con la herramienta de preguntas estructuradas antes de
   continuar. No avanzar al Paso 3 con dudas pendientes.
4. Si un enlace de Figma no es accesible, pedir capturas o exportación.

---

## Paso 3 — Investigar

Usar búsqueda web, documentación oficial, repositorios públicos, y —en el flujo
B— la inspección directa de ambos proyectos.

### Paso 3A — Artefacto: lagunas y decisiones pendientes

El objetivo es **cerrar lo que impide planificar o implementar** el artefacto:

- **Lagunas del artefacto:** criterios ambiguos, reglas de negocio sin definir,
  dependencias no confirmadas, Observaciones abiertas.
- **Decisiones pendientes por tomar:** disyuntivas técnicas o de producto que el
  artefacto deja sin resolver (qué librería, qué patrón, qué enfoque). Para cada
  una: investigar las opciones, sus trade-offs, y **recomendar** una con
  justificación.
- Contrastar los hallazgos contra los criterios de aceptación (`AC-XXX`) y —si
  existen— los casos de prueba del artefacto.

### Paso 3B — Migración

Ver [`references/migrate/flow.md`](references/migrate/flow.md): produce el
`discovery` (mapeo tecnológico, estrategia de verificación, oportunidades de Golden
Master, riesgos) y la **preparación de validación**, y **dimensiona el cambio**
para decidir el *handoff*.

### Paso 3C — Investigación libre por dominio

**Producto:** benchmarking, análisis de necesidades, restricciones de negocio o
regulatorias. **Arquitectura:** patrones aplicables y trade-offs, ejemplos,
compatibilidad con lo existente, recomendación. **Técnica:** viabilidad con el
stack actual, comparativa de opciones (rendimiento, madurez, licencia, comunidad),
limitaciones conocidas. **Cambio:** superficie de impacto, riesgos y breaking
changes, enfoque de cambio a alto nivel, criterio de rollback.

### Paso 3D — Análisis legacy (ingeniería inversa)

Ver [`references/legacy/flow.md`](references/legacy/flow.md). Reconstruye desde el
código, en cascada: **artefactos técnicos → casos de uso → objetivos de usuario →
capabilities → features (criterios de división + métricas de cohesión) → reglas de
negocio**, y lo consolida en un `discovery.md`. Describe el comportamiento **actual**
del código (incluidos posibles bugs, marcados como tales), **no** el deseado; cita la
evidencia (archivo y símbolo) de cada hallazgo y no inventa comportamiento ausente.
Registra dónde falta cobertura de pruebas. Con el discovery en `Ready`, **crea por
cada feature aceptado** una carpeta `docs/specs/features/FEAT-XXX-{slug}/README.md`
(descripción funcional, reglas de negocio, criterios de aceptación, referencias) con
`assets/legacy/feature-template.md`, y luego hace *handoff* a `test-define` para
generar sus casos de prueba dentro de la misma carpeta. Todo bajo `docs/specs/features/`,
con marca de procedencia "inferido desde código". El `FEAT-XXX` es la **especificación
de código ya implementado**, no un artefacto implementable: cerrado el feature, el
siguiente paso es `trace-validate` para verificar si ese código está cubierto por
pruebas (no se pasa a `work-implement`).

### Calidad de las fuentes (todos los flujos)

- Priorizar documentación oficial, RFC, papers, repositorios activos.
- Indicar la fecha de la fuente cuando la vigencia importa (versiones, APIs,
  precios).
- Si la información es contradictoria o incierta, **decirlo explícitamente** en
  lugar de sintetizar como si fuera certeza.

---

## Paso 4 — Sintetizar y presentar

1. Redactar el `README.md` con `assets/research-template.md`. Si no hay artefacto
   vinculado, marcar la sección **Impacto en el artefacto** como
   `N/A — investigación independiente`.
2. En el flujo B, redactar además los archivos adicionales (`discovery.md`,
   `validation.md`) con las plantillas de `assets/migrate/`. En el flujo D, redactar
   el `discovery.md` de ingeniería inversa con la plantilla de `assets/legacy/`.
3. Presentar el informe en el chat con un resumen ejecutivo de 2-3 oraciones.
4. Preguntar (herramienta estructurada): "¿La investigación responde tu pregunta?"
   Opciones: [Sí, guardar resultado] / [Profundizar en un subtema] / [Descartar].
   - **Sí** → Paso 5, guardar con `Estado: Ready`.
   - **Profundizar** → investigación adicional y volver al inicio de este paso.
   - **Descartar** → no guardar; el skill termina.

---

## Paso 5 — Guardar el informe

1. Determinar la carpeta base según haya artefacto o no (ver
   [Salida estandarizada](#salida-estandarizada-todos-los-flujos)).
2. Determinar el siguiente `RS-XXX` leyendo las carpetas `RS-XXX-*` existentes en
   esa base y tomando el mayor número + 1. Empezar en `001` si no hay ninguna.
3. Construir el `{slug}`: descripción corta del tema en kebab-case (p. ej.
   `viabilidad-redis-cache`, `impacto-refactor-pagos`, `orm-sequelize-a-prisma`).
4. Crear la carpeta `research/RS-XXX-{slug}/` y escribir el `README.md`
   (informe principal) con `Estado: Ready`. Añadir los archivos adicionales que el
   flujo defina, referenciados desde el `README.md`.
5. Informar la ruta exacta donde se guardó.

---

## Numeración y nomenclatura

- **Secuencial `XXX`:** tres dígitos, por carpeta base de destino. Leer las carpetas
  `RS-XXX-*` existentes y tomar el siguiente número.
- **Slug:** kebab-case, descriptivo del tema. Máximo 5 palabras.
- **Un RS por pregunta de investigación / migración.** Si la sesión produce varias,
  generar un RS por cada una con su propio secuencial.

---

## Handoffs

Este skill **alimenta** otros skills pero no los invoca automáticamente salvo
donde se indica.

| Después de un RS sobre... | Skill siguiente | Cómo pasar el contexto |
|---------------------------|-----------------|------------------------|
| Lagunas/decisiones de un `US`/`TK`/`WI` | `work-define` (US) o `work-plan` (TK/WI) | El RS se referencia y actualiza el artefacto en su skill dueño |
| **Migración (flujo B), cambio grande** | `work-define` | Crear varias US a partir del discovery/validación; el RS es la referencia. Ver criterio de dimensionamiento en [`references/migrate/flow.md`](references/migrate/flow.md) |
| **Migración (flujo B), cambio pequeño** | `work-plan` (WI) | Crear un `WI-XXX` a partir del discovery/validación; el RS es la referencia |
| **Análisis legacy (flujo D): crear features** | Este mismo skill (Paso 3D / [`references/legacy/flow.md`](references/legacy/flow.md)) | Por cada feature descubierto, crear `docs/specs/features/FEAT-XXX-{slug}/README.md` (descripción funcional, reglas de negocio, criterios de aceptación, referencias) con procedencia "inferido desde código"; el discovery es la referencia |
| **Análisis legacy (flujo D): definir pruebas** | `test-define` | Tras cada `FEAT-XXX` en `Ready`, generar sus `TC-XXX` en `docs/specs/features/FEAT-XXX-{slug}/test-cases/` |
| **Análisis legacy (flujo D): validar cobertura** | `trace-validate` | Sobre el `FEAT-XXX`, verificar si sus `AC-XXX`/`TC-XXX` tienen implementación de pruebas en el repo y revelar los huecos de cobertura del código existente. El `FEAT` no se implementa: solo escribir las **pruebas** faltantes, nunca código funcional |
| Decisión de arquitectura | `engineering:architecture` (ADR) | El RS alimenta la sección "Contexto" del ADR |
| Técnica de implementación concreta | `work-plan` → `work-implement` | El RS se referencia en el TK o WI |

Cuando otro skill reciba un RS como insumo, leerlo desde
`research/RS-XXX-{slug}/README.md` (y sus archivos adicionales) antes de ejecutar
su propio flujo.

Al cerrar, si el flujo lo sugiere, ofrecer al usuario el *handoff* correspondiente
con la referencia al RS generado. En el flujo B, **ofrecer explícitamente** el
*handoff* según el dimensionamiento del cambio (grande → `work-define`; pequeño →
`work-plan`). En el flujo D, **ofrecer explícitamente** —una vez el discovery esté
en `Ready`— crear un `FEAT-XXX` por feature descubierto en `docs/specs/features/`; tras
cada feature en `Ready`, el *handoff* a `test-define` (definir sus casos de prueba en
la carpeta del feature); y, con los TC definidos, el *handoff* a `trace-validate` para
verificar si el código existente está cubierto por esas pruebas. Todo con procedencia
"inferido desde código"; ver [`references/legacy/flow.md`](references/legacy/flow.md).

---

## Mapa de referencias

| Necesitas… | Archivo |
|------------|---------|
| Flujo B (migración): discovery, preparación de validación, dimensionamiento y handoff | [`references/migrate/flow.md`](references/migrate/flow.md) |
| Procedimiento de preparación de casos de Golden Master (flujo B) | [`references/migrate/golden-master-testing.md`](references/migrate/golden-master-testing.md) |
| Estrategias de migración incremental (para recomendar el enfoque en el handoff) | [`references/migrate/migration-strategies.md`](references/migrate/migration-strategies.md) |
| Flujo D (análisis legacy): descubrir desde código (artefactos → CU → capabilities → features cohesivos → BR), crear `FEAT-XXX` y *handoff* a test-define | [`references/legacy/flow.md`](references/legacy/flow.md) |
| Plantilla del `README.md` (informe principal, todos los flujos) | [`assets/research-template.md`](assets/research-template.md) |
| Plantillas de archivos adicionales del flujo B | [`assets/migrate/discovery-template.md`](assets/migrate/discovery-template.md), [`assets/migrate/validation-template.md`](assets/migrate/validation-template.md) |
| Plantilla del `discovery.md` del flujo D | [`assets/legacy/discovery-template.md`](assets/legacy/discovery-template.md) |
| Plantilla del `README.md` de un feature (`FEAT-XXX`) del flujo D | [`assets/legacy/feature-template.md`](assets/legacy/feature-template.md) |

---

## Anti-patterns

- Investigar sin formular y confirmar antes la pregunta de investigación.
- Mezclar dos flujos en una misma ejecución.
- Presentar hallazgos sin indicar fuente o fecha cuando la vigencia importa.
- Sintetizar información contradictoria como si fuera consenso.
- Modificar el artefacto vinculado (README de US/WI, TK) durante la investigación.
- **Generar el plan de implementación aquí:** el flujo B produce discovery y
  validación y hace *handoff*; el plan lo crean `work-define` o `work-plan`.
- Guardar el RS sin haber presentado antes el informe al usuario.
- Reutilizar un número de secuencia ya existente en la carpeta base.
- Guardar el informe como un archivo suelto en vez de la carpeta
  `research/RS-XXX-{slug}/README.md`.
- Pasar por alto imágenes o enlaces de Figma referenciados sin inspeccionarlos.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta
  estructurada.
- **(Flujo D)** Crear historias de usuario (`US-XXX`) desde el código: el flujo D
  **no** genera historias; cada feature descubierto se materializa como un `FEAT-XXX`.
- **(Flujo D)** Guardar los features o sus casos de prueba mezclados con los definidos por
  negocio (en `docs/specs/user-stories/` o `docs/specs/work-items/`) en vez de en su propio
  subárbol `docs/specs/features/`.
- **(Flujo D)** Redactar features o reglas de negocio con comportamiento **deseado**
  o inventado en lugar del comportamiento **real** que implementa el código; o no
  citar la evidencia (archivo/símbolo) de cada hallazgo.
- **(Flujo D)** "Congelar" como criterio de aceptación un comportamiento que en
  realidad es un bug, sin marcarlo como tal y consultarlo con el usuario.
- **(Flujo D)** Omitir la marca de procedencia "inferido desde código" en los
  `FEAT-XXX` y sus TCs.
- **(Flujo D)** Proponer Features a ojo (por carpeta, módulo o nombre) sin recorrer la
  cascada artefactos → casos de uso → objetivos → capabilities → criterios de división
  → métricas de cohesión; o crear un `FEAT-XXX` cuyo Feature no tenga veredicto
  **Aceptado** en el discovery.
