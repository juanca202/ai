---
name: work-research
description: 'Investigar y sintetizar hallazgos en un informe estructurado (RS-XXX). Skill genérico que corre varios flujos según la entrada: (1) artefacto — si hay un US-XXX, TK-XXX o WI-XXX en contexto, investigar lagunas y decisiones pendientes por tomar sobre ese artefacto; (2) migración — si hay un proyecto de origen y uno de destino, tomar los archivos de esos proyectos y generar el discovery y la preparación de validación, decidiendo si el cambio es grande (continúa work-define) o pequeño (continúa work-plan); (3) investigación libre — si no hay artefacto, investigar un tema de producto, arquitectura, técnica o cambio. Activar cuando el usuario pida "investiga", "research", "¿es viable?", "¿cómo funciona X?", "¿qué impacto tiene?", "¿qué alternativas existen?", "compara opciones", "necesito contexto sobre", "migrar/migración entre proyectos", o cualquier variante que implique recopilar información antes de decidir. También activar con "/work-research" o cuando se mencione "RS-XXX". Si hay un artefacto US/TK/WI o un par origen→destino en contexto, usarlo automáticamente sin preguntar.'
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

> **Migración (flujo B):** la entrada es un proyecto origen y uno destino. El
> discovery y la validación los produce este skill; el plan lo continúa
> `work-define` (cambio grande) o `work-plan` (cambio pequeño).

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
- **Sin artefacto vinculado** (flujos B y C) → `docs/specs/research/RS-XXX-{slug}/`
  (para la migración, en el **proyecto destino**).

El `README.md` se redacta con `assets/research-template.md`. Los archivos
adicionales del flujo B usan las plantillas de `assets/migrate/`.

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
3. **Si no hay artefacto ni par origen→destino** → **Flujo C** (investigación
   libre). Clasificar el tema en uno o más dominios (Producto, Arquitectura,
   Técnica, Cambio); si hay varios, confirmar el foco principal.

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
   `validation.md`) con las plantillas de `assets/migrate/`.
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
| Decisión de arquitectura | `engineering:architecture` (ADR) | El RS alimenta la sección "Contexto" del ADR |
| Técnica de implementación concreta | `work-plan` → `work-implement` | El RS se referencia en el TK o WI |

Cuando otro skill reciba un RS como insumo, leerlo desde
`research/RS-XXX-{slug}/README.md` (y sus archivos adicionales) antes de ejecutar
su propio flujo.

Al cerrar, si el flujo lo sugiere, ofrecer al usuario el *handoff* correspondiente
con la referencia al RS generado. En el flujo B, **ofrecer explícitamente** el
*handoff* según el dimensionamiento del cambio (grande → `work-define`; pequeño →
`work-plan`).

---

## Mapa de referencias

| Necesitas… | Archivo |
|------------|---------|
| Flujo B (migración): discovery, preparación de validación, dimensionamiento y handoff | [`references/migrate/flow.md`](references/migrate/flow.md) |
| Procedimiento de preparación de casos de Golden Master (flujo B) | [`references/migrate/golden-master-testing.md`](references/migrate/golden-master-testing.md) |
| Estrategias de migración incremental (para recomendar el enfoque en el handoff) | [`references/migrate/migration-strategies.md`](references/migrate/migration-strategies.md) |
| Plantilla del `README.md` (informe principal, todos los flujos) | [`assets/research-template.md`](assets/research-template.md) |
| Plantillas de archivos adicionales del flujo B | [`assets/migrate/discovery-template.md`](assets/migrate/discovery-template.md), [`assets/migrate/validation-template.md`](assets/migrate/validation-template.md) |

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
