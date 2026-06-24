---
name: work-implement
description: 'Usar al pedir implementar, desarrollar o ejecutar en codigo trabajo ya especificado, de distintos tipos. Tres tipos de implementacion: (1) tareas tecnicas (TK-XXX) bajo una historia de usuario (US-XXX); (2) work items de mantenimiento (WI-XXX) sin historia asociada — bugs, refactor, deuda tecnica, dependencias, operativas; (3) migraciones tecnologicas (MG-XXX) entre proyectos. Activar siempre que el usuario pida "implementar", "desarrollar", "ejecutar tareas", "codificar", "trabajar en el TK/WI", "ejecutar la migracion" o cualquier variante que implique escribir codigo a partir de una especificacion ya redactada, aunque no nombre el tipo. Selecciona el tipo segun el artefacto referenciado y carga su flujo desde references/. Solo se implementa trabajo en estado Ready.'
license: MIT
---

# Skill: Implementar trabajo

Guia general para **ejecutar en codigo** trabajo ya especificado, de **distintos tipos**. Cada tipo de implementacion tiene su propio flujo (ubicaciones, validaciones, unidad de confirmacion, cierre) en `references/`. El cuerpo de este `SKILL.md` contiene solo lo **transversal** a todos los tipos; el detalle de cada tipo se carga unicamente cuando se necesita.

> **Alcance (cualquier tipo):** consume especificaciones ya redactadas por los skills de planificacion (`work-plan`, `project-migrate`). **No reescribe ni reestructura** la especificacion - solo la implementa. Correcciones menores acordadas con el usuario son la unica excepcion.
>
> **Solo implementacion:** no modifica documentacion de producto (README de US, `TK-XXX`, `WI-XXX`, `discovery.md`, `validation.md`, `plan.md`, ADRs, technical-docs) - solo el `progress.md`. Si se detecta un conflicto en la documentacion que pueda afectar el resultado, **parar inmediatamente y notificar al usuario** antes de continuar.
>
> **Ritmo obligatorio - una unidad por confirmacion:** implementar una unidad, actualizar `progress.md`, ejecutar lint/build, y **esperar confirmacion explicita del usuario antes de arrancar la siguiente**. Sin excepcion. La **unidad** depende del tipo (ver tabla de seleccion).

---

## Como preguntar al usuario

Cuando este skill (o cualquiera de sus referencias) indique **preguntar, pedir, confirmar o validar** algo al usuario, hacerlo mediante la **herramienta de preguntas estructuradas** del cliente (la que renderiza opciones tappables o un selector) en lugar de redactar la pregunta como prosa libre. Reglas:

- **Opciones cortas y mutuamente excluyentes** (2-4 por pregunta) cuando la respuesta admita categorias.
- **No repreguntar** lo que ya esta respondido en el contexto de la sesion o en los documentos del repo.
- **Confirmaciones entre unidades:** una pregunta por turno con opciones claras (p. ej. `Si, continuar` / `No, detener aqui`). No avanzar antes de la respuesta.
- **Fallback:** si el cliente no expone esta herramienta, formular la pregunta en prosa con opciones enumeradas (1, 2, 3...).

Cada vez que una referencia diga *preguntar al usuario*, *validar con el usuario* o *confirmar* asume este mecanismo; no se repite alli.

---

## Resolucion de idioma

Si en el contexto de la sesion de chat existe un **idioma de preferencia del usuario**, redactar en ese idioma los mensajes al usuario y las notas de `progress.md`. Si no consta, usar el **idioma de la conversacion**. La salida y los mensajes de error de las herramientas (lint, build, tests) no se traducen; el codigo, los identificadores y los nombres de artefacto tampoco.

---

## Seleccion del tipo de implementacion

**Antes de cualquier otra cosa**, identificar que tipo de implementacion corresponde y cargar su flujo. No mezclar tipos en una misma ejecucion.

La senal que distingue los tipos es **el artefacto que el usuario referencia**.

| Tipo | Como se identifica | Unidad de confirmacion | Flujo a leer |
|------|--------------------|------------------------|--------------|
| **Tarea de historia de usuario** | El trabajo referencia una historia `US-XXX` o una tarea `TK-XXX` que cuelga de ella; el artefacto vive bajo `docs/specs/user-stories/`. | **Una `TK-XXX`** | `references/user-story-tasks.md` — **leer antes de implementar.** |
| **Work item de mantenimiento** | El trabajo referencia un `WI-XXX` (bug, refactor, deuda tecnica, dependencias, operativa) **sin historia asociada**; vive bajo `docs/specs/work-items/`. | **El `WI-XXX` completo** | `references/work-items.md` — **leer antes de implementar.** |
| **Migracion entre proyectos** | El trabajo referencia una migracion `MG-XXX` o pide ejecutar/implementar una migracion; vive bajo `docs/specs/migrations/`. | **Una fase del plan** | `references/migrations.md` — **leer antes de implementar.** |

Reglas de seleccion:

- **Identificar el artefacto -> leer su referencia -> seguir unicamente su flujo.**
- Si la referencia del usuario es ambigua (p. ej. un numero sin prefijo, o no esta claro si hay historia asociada), **preguntar al usuario** antes de continuar; no asumir el tipo ni inventar artefactos.
- Solo se implementa trabajo en **`Estado: Ready`** (la US/TK, el WI o el `plan.md` de la migracion). Si esta en `Draft`, parar y devolver a planificacion.

---

## Validacion de repositorio (transversal)

Verificar estas condiciones antes de implementar, sea cual sea el tipo. Si alguna falla, **parar** - informar al usuario y resolver primero.

- **Working tree limpio:** `git status --porcelain` sin cambios pendientes no resueltos.
- **Rama correcta:** estar en (o crear) la rama de trabajo del artefacto. No implementar en `main` ni en ramas de otro trabajo sin instruccion explicita. El nombre de rama lo define cada referencia segun el tipo.
- **Artefacto en `Ready`:** el artefacto a implementar existe y esta en `Estado: Ready` (lo verifica cada referencia con su regla propia).
- **Solapamiento de progreso:** leer `progress.md` si existe; respetar unidades ya en `Done`; si hay alguna `In Progress`, revisar notas y estado real antes de continuar.

Si hay conflicto:

```
WARNING No es posible continuar:
- <razon concreta>
```

---

## progress.md (transversal)

Cada tipo mantiene un `progress.md` como **unica bitacora** que este skill puede modificar (nunca la especificacion de producto). Estados validos por unidad: **`Pending`**, **`In Progress`**, **`Done`**. No usar `Skipped` ni otros valores.

- Crear desde `assets/progress-template.md` si no existe, adaptando el encabezado y las unidades al tipo (TK / WI / Fase) segun indique la referencia.
- Por cada unidad: `Pending` => `In Progress` => `Done`; anadir notas si quedan aspectos parciales.
- Registrar en `Decisiones adicionales` **toda decision tomada durante la sesion de chat** que no este ya documentada en la especificacion. Si no hubo decisiones nuevas, omitir la seccion.

| Situacion | Que hacer |
|-----------|-----------|
| Posponer una unidad | Mantener `Pending` y registrar el motivo en `Notas`. |
| Sacar una unidad del alcance | Parar; alinear con el skill de planificacion correspondiente; eliminar la entrada si ya no aplica. |
| Unidad completada | `Done`. |

---

## Documentacion de codigo segun ADR (transversal)

Antes de escribir codigo, verificar si el proyecto tiene **algun ADR que defina como documentar el codigo** (estilo de docstrings, comentarios, JSDoc/TSDoc, convenciones de encabezado de archivo, anotaciones, etc.). Los ADR suelen vivir bajo `docs/adr/` o donde el proyecto los registre.

- Si existe un ADR **vigente** sobre documentacion de codigo, **aplicarlo dentro de la misma unidad que se implementa** (la TK, el WI o la fase). La documentacion que el ADR exige es **parte del entregable de esa unidad**, no un paso posterior.
- **No diferir** esa documentacion "para otro momento", un commit aparte o una tarea futura. Una unidad cuyo codigo no cumple la documentacion que su ADR exige **no esta `Done`**.
- Esto **no contradice** la regla de no modificar la especificacion de producto: seguir un ADR significa **obedecerlo al escribir el codigo**, no editar el ADR. El ADR se respeta, no se cambia.
- Si hay varios ADR aplicables, o uno ambiguo respecto al alcance actual, **preguntar al usuario** antes de continuar en lugar de asumir.

---

## Subagentes y MCP condicionales (transversal)

| Condicion | Agente / MCP requerido |
| --------- | ---------------------- |
| La unidad genera o modifica archivos de UI (HTML, CSS, componentes) | Ejecutar bajo el agente `ui-specialist` |
| La referencia de diseno es un enlace o archivo de Figma | Usar el **MCP de Figma** para obtener el contexto del diseno antes y durante la implementacion |
| Fase final de pruebas aceptada por el usuario | Ejecutar bajo el agente **`quality-specialist`** - no escribir tests desde este skill. La **base de los tests depende del tipo** (ver referencia) |

Si la unidad no involucra UI, implementar directamente sin delegar.

---

## Mensaje al usuario

Solo resultados y lo que el usuario debe saber o decidir. No incluir razonamiento interno ni narracion del trabajo en curso ("lei el TK", "cree la rama"). Las preguntas y confirmaciones van por la herramienta de preguntas estructuradas.

---

## Mapa de referencias

| Archivo | Cuando leerlo |
|---------|---------------|
| `references/user-story-tasks.md` | Tipo = tarea de historia de usuario (`US-XXX` / `TK-XXX`). Ubicaciones, filtros, cola, ciclo TK-a-TK, flujo "TK sin US", cierre con `quality-specialist` sobre `SC-XX`/`BR-XX`, ejemplos y anti-patrones. |
| `references/work-items.md` | Tipo = work item de mantenimiento (`WI-XXX`). Documento unico combinado, validacion por criterios de aceptacion, ciclo por WI completo, cierre, ejemplos y anti-patrones. |
| `references/migrations.md` | Tipo = migracion (`MG-XXX`). Pre-requisito `plan.md` en `Ready`, ejecucion por fases, validacion por Golden Master Testing, destino fragmentado, ejemplos y anti-patrones. |
| `assets/progress-template.md` | Plantilla de `progress.md`. Adaptar encabezado y unidades al tipo. |

---

## Anti-patterns (transversales)

- Implementar mas de una unidad por turno sin confirmacion intermedia del usuario.
- Mezclar dos tipos de implementacion en una misma ejecucion.
- Codificar con working tree sucio sin avisar y pausar.
- Implementar en `main` u otra rama que no sea la del artefacto sin instruccion explicita.
- Tratar como ejecutable un artefacto que no esta en `Ready`.
- Modificar la especificacion de producto (US/TK/WI/discovery/validation/plan, ADRs, technical-docs) durante la implementacion.
- Diferir "para otro momento" la documentacion de codigo que un ADR vigente exige, o cerrar una unidad como `Done` sin esa documentacion.
- Continuar cuando se detecta un conflicto en la documentacion sin notificar al usuario primero.
- Escribir tests sin delegar a `quality-specialist`.
- Escribir un estado no definido en `progress.md`; estados validos: `Pending`, `In Progress`, `Done`.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
- Aceptar como confirmacion una respuesta ambigua sin opciones explicitas; si hay duda, repreguntar.