---
name: work-research
description: 'Investigar un tema técnico o de producto y sintetizar los hallazgos en un informe estructurado (RS-XXX). Cubre cuatro dominios: Producto (qué construir), Arquitectura (cómo estructurarlo), Técnica (viabilidad e implementación), Cambio (impacto, migración, refactor). Activar cuando el usuario pida "investiga", "research", "¿es viable?", "¿cómo funciona X?", "¿qué impacto tiene?", "¿qué alternativas existen?", "compara opciones", "necesito contexto sobre", o cualquier variante que implique recopilar información antes de tomar una decisión de producto, arquitectura, técnica o cambio. También activar con "/work-research" o cuando se mencione "RS-XXX". Si hay un artefacto US/WI/MG en contexto, usarlo automáticamente sin preguntar.'
---

# Skill: Investigación de trabajo

Investiga un tema, sintetiza los hallazgos y — si la investigación está vinculada a un artefacto existente (`US-XXX`, `WI-XXX` o `MG-XXX`) — los persiste en `research/RS-XXX-{slug}.md` dentro de la carpeta del artefacto.

> **Propósito:** resolver dudas antes de especificar, planificar o implementar. La investigación alimenta decisiones; no modifica artefactos existentes ni genera código.

---

## Cómo preguntar al usuario

Toda pregunta va por la **herramienta de preguntas estructuradas** (opciones tappables), no como prosa libre. Si el cliente no la expone, formular en prosa con opciones enumeradas.

---

## Modo de ejecución

Si este skill es invocado **dentro de una sesión activa de `work-implement`** (el agente principal está ejecutando una TK, WI o fase de migración), ejecutar la investigación como **subagente o tarea delegada**:

- Lanzar la investigación usando la herramienta de subagente/tarea disponible en el cliente.
- El subagente ejecuta los Pasos 1 al 5 de forma autónoma.
- Al terminar, el subagente **solo devuelve el resultado al agente principal**: ruta del RS guardado + resumen ejecutivo de 2-3 oraciones.
- El agente principal continúa la implementación con ese contexto sin interrumpir el flujo de la sesión.

Si no hay sesión de implementación activa, ejecutar de forma interactiva directamente con el usuario (flujo normal).

---

## Resolución de idioma

Redactar el informe y los mensajes al usuario en el idioma del mensaje de entrada. Si hay artefacto vinculado, usar el idioma de ese artefacto. Ante conflicto, preguntar.

---

## Paso 1 — Capturar la intención

### Si el usuario no proporcionó tema

Preguntar con la herramienta estructurada:

1. **¿Qué quieres investigar?** (texto libre o selección de dominio)
2. **¿Está vinculado a algún artefacto?** Opciones: [Historia de usuario (US)] / [Mantenimiento (WI)] / [Migración (MG)] / [No, es independiente]

### Si el usuario proporcionó un tema

Inferir automáticamente:

1. **Dominio predominante** — clasificar el tema en uno o más de los cuatro dominios (ver tabla). Si el mensaje contiene varios dominios, listarlos y confirmar con el usuario cuál es el foco principal antes de continuar.
2. **Artefacto vinculado** — detectar si el mensaje menciona o implica un `US-XXX`, `WI-XXX` o `MG-XXX`. Si se detecta uno, cargarlo como contexto sin preguntar. Si hay ambigüedad (número sin prefijo, referencia vaga), preguntar.
3. **Clarificación de lagunas** — antes de formular la pregunta de investigación, identificar si el tema tiene vacíos que impedirían una investigación de calidad: alcance impreciso, contexto técnico faltante, restricciones no mencionadas, o múltiples interpretaciones posibles. Si se detectan lagunas, usar la herramienta de preguntas estructuradas para resolverlas (máximo 2-3 preguntas por ronda; omitir las que ya consten en el artefacto o en la conversación). Solo avanzar cuando el alcance sea lo suficientemente claro.
4. **Pregunta de investigación** — formular en una oración concisa qué se quiere averiguar. Mostrarla al usuario usando la herramienta estructurada con opciones: [Confirmar / Ajustar pregunta / Cancelar]. No investigar hasta recibir confirmación.

### Tabla de dominios

| Dominio | Señales típicas en el mensaje | Qué produce |
|---------|------------------------------|-------------|
| **Producto** | "¿qué construir?", "¿qué quiere el usuario?", "benchmarking de competidores", "¿qué features tiene X?", "viabilidad de negocio" | Hallazgos sobre requisitos, mercado o comportamiento de usuarios |
| **Arquitectura** | "¿cómo estructurarlo?", "¿qué patrón usar?", "¿monolito o microservicio?", "¿dónde vive esta lógica?", "ADR" | Comparativa de patrones, recomendación de diseño |
| **Técnica** | "¿es viable?", "¿cómo funciona X?", "¿qué librería usar?", "¿rendimiento de?", "¿tiene soporte para?" | Evaluación técnica, comparativa de herramientas, prueba de concepto documental |
| **Cambio** | "¿qué impacto tiene?", "¿cómo migrar?", "¿qué se rompe si?", "refactor de", "¿compatibilidad hacia atrás?" | Análisis de impacto, riesgos, plan de migración a alto nivel |

---

## Paso 2 — Cargar contexto del artefacto

Si hay artefacto vinculado, leerlo **antes** de investigar:

| Tipo | Archivo a leer | Qué extraer |
|------|---------------|-------------|
| `US-XXX` | `docs/specs/user-stories/US-XXX-{nombre}/README.md` | Objetivo, criterios de aceptación (`AC-XXX`), reglas de negocio, restricciones |
| `WI-XXX` | `docs/specs/work-items/WI-XXX-{kebab-case}/README.md` | Requerimiento, criterios de aceptación, plan de implementación actual |
| `MG-XXX` | `docs/specs/migrations/MG-XXX-{slug}/discovery.md` + `plan.md` | Contexto del origen/destino, estrategia, restricciones ya identificadas |

Si el artefacto no existe o no está en `Estado: Ready` o `Draft`, avisar al usuario e investigar de todas formas con el contexto disponible — la investigación no depende del estado del artefacto.

Verificar también si ya existen investigaciones previas en la carpeta `research/` del artefacto para no duplicar trabajo. Mostrarlas al usuario si las hay.

---

## Paso 2.5 — Inspeccionar referencias visuales (imágenes y Figma)

Si el usuario proporcionó referencias (imágenes adjuntas, capturas, enlaces a Figma u otros archivos de diseño) — ya sea en el mensaje o dentro del artefacto vinculado cargado en el Paso 2 — inspeccionarlas antes de investigar:

1. **Abrir e inspeccionar cada referencia en detalle** — leer la imagen o el archivo de Figma (layouts, componentes, estados, anotaciones, specs de diseño), no de forma superficial.
2. **Detectar lagunas** — si al inspeccionar surge cualquier duda, ambigüedad o falta de detalle necesario para especificar, planificar o implementar (p. ej. estado no cubierto, medida no definida, comportamiento no anotado, texto ilegible, componente sin especificar), no asumir ni rellenar por cuenta propia.
3. **No dejar pasar nada sin resolver** — usar la herramienta de preguntas estructuradas para aclarar cada laguna detectada antes de continuar. No avanzar al Paso 3 con dudas pendientes sobre las referencias.
4. Si el enlace de Figma no es accesible directamente, informarlo al usuario y pedir capturas o exportación del contenido relevante.

---

## Paso 3 — Investigar

Ejecutar la investigación según el dominio identificado. Usar búsqueda web, documentación oficial, repositorios públicos y cualquier recurso disponible.

### Por dominio

**Producto**
- Benchmarking: ¿cómo resuelve el mismo problema la competencia o herramientas similares?
- Análisis de necesidades: ¿qué problema real resuelve? ¿para quién?
- Restricciones de negocio o regulatorias relevantes.

**Arquitectura**
- Patrones aplicables y sus trade-offs (escalabilidad, acoplamiento, complejidad).
- Ejemplos de uso en sistemas similares.
- Compatibilidad con la arquitectura existente del proyecto (si hay contexto del artefacto).
- Recomendación justificada.

**Técnica**
- Viabilidad: ¿es técnicamente posible con el stack actual?
- Evaluación de opciones: comparativa de librerías, APIs, servicios (rendimiento, madurez, licencia, comunidad).
- Limitaciones conocidas, bugs relevantes, roadmap del proyecto.
- Si hay un TC-XXX o criterio de aceptación relevante, contrastar los hallazgos contra él.

**Cambio**
- Superficie de impacto: archivos, módulos, contratos, dependientes afectados.
- Riesgos y breaking changes.
- Estrategia de migración o refactor a alto nivel.
- Criterio de rollback si aplica.

### Calidad de las fuentes

- Priorizar documentación oficial, RFC, papers, repositorios activos.
- Indicar fecha de la fuente cuando la vigencia importa (versiones, APIs, precios).
- Si la información encontrada es contradictoria o incierta, decirlo explícitamente en lugar de sintetizar como si fuera certeza.

---

## Paso 4 — Sintetizar y presentar

1. Redactar el informe usando `assets/research-template.md` como estructura base. Si no hay artefacto vinculado, marcar la sección **Impacto en el artefacto** como `N/A — investigación independiente`.
2. Presentar el informe en el chat con un resumen ejecutivo de 2-3 oraciones al inicio.
3. Preguntar al usuario (herramienta estructurada): "¿La investigación responde tu pregunta?" Opciones: [Sí, guardar resultado] / [Profundizar en un subtema] / [Descartar].
   - **Sí, guardar resultado** → continuar al Paso 5 y guardar con `Estado: Ready`.
   - **Profundizar** → el usuario indica el subtema; ejecutar investigación adicional y volver al inicio de este paso.
   - **Descartar** → no guardar; el skill termina.

---

## Paso 5 — Guardar el informe

### Si hay artefacto vinculado

1. Determinar la ruta de destino:
   - `US-XXX` → `docs/specs/user-stories/US-XXX-{nombre}/research/`
   - `WI-XXX` → `docs/specs/work-items/WI-XXX-{kebab-case}/research/`
   - `MG-XXX` → `docs/specs/migrations/MG-XXX-{slug}/research/`
2. Crear la carpeta `research/` si no existe.
3. Determinar el siguiente número disponible leyendo los archivos `RS-XXX-*.md` existentes en esa carpeta. Empezar en `001` si no hay ninguno.
4. Construir el slug: descripción corta del tema en kebab-case (p. ej. `viabilidad-redis-cache`, `impacto-refactor-pagos`).
5. Guardar como `RS-XXX-{slug}.md` con `Estado: Ready` (el usuario ya confirmó la investigación en el Paso 4).
6. Informar la ruta exacta donde se guardó.

### Si no hay artefacto vinculado

Guardar directamente en `docs/specs/research/RS-XXX-{slug}.md` (el usuario ya confirmó en el Paso 4). Determinar el siguiente número leyendo los archivos `RS-XXX-*.md` en `docs/specs/research/` y tomando el mayor número + 1. Empezar en `001` si la carpeta no existe o está vacía. Crear la carpeta si no existe.

---

## Numeración y nomenclatura

- **Secuencial `XXX`:** tres dígitos, por carpeta de destino. Leer los RS existentes en esa carpeta y tomar el siguiente número.
- **Slug:** kebab-case, descriptivo del tema, no del artefacto (el artefacto ya está en la ruta). Máximo 5 palabras.
- **Un RS por pregunta de investigación.** Si la sesión produce múltiples preguntas, generar un RS por cada una con su propio secuencial.

---

## Anti-patterns

- Investigar sin formular primero la pregunta de investigación y confirmarla con el usuario.
- Presentar hallazgos sin indicar la fuente o la fecha cuando la vigencia importa.
- Sintetizar información contradictoria como si fuera consenso; señalar la contradicción explícitamente.
- Modificar el artefacto vinculado (README de US, README del WI, plan.md) durante la investigación.
- Guardar el RS sin haber presentado antes el informe al usuario para su revisión.
- Reutilizar un número de secuencia ya existente en la carpeta `research/`.
- Asumir el artefacto vinculado sin haberlo leído; si no existe, avisar y continuar sin él.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
- Pasar por alto imágenes o enlaces de Figma referenciados sin inspeccionarlos, dejando lagunas sin resolver.

---

## Handoffs

Este skill **alimenta** otros skills pero no los invoca automáticamente:

| Después de RS sobre... | Skill natural siguiente | Cómo pasar el contexto |
|------------------------|------------------------|------------------------|
| Viabilidad de una feature o diseño | `work-define` (crear/actualizar US) | Pasar el `RS-XXX` como referencia en el README de la US |
| Decisión de arquitectura | `engineering:architecture` (ADR) | El RS alimenta la sección "Contexto" del ADR |
| Impacto de un refactor o migración | `work-plan` (WI) o `project-migrate` (MG) | El RS informa la sección de "Dependencias" o "Riesgos" |
| Técnica de implementación concreta | `work-plan` → `work-implement` | El RS se referencia en el TK o WI correspondiente |

Cuando otro skill reciba un RS como insumo, leerlo desde `research/RS-XXX-{slug}.md` antes de ejecutar su propio flujo.

Al cerrar, si el dominio lo sugiere, ofrecer al usuario el handoff correspondiente con la referencia al RS generado.
