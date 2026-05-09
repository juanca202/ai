---
name: story-plan
description: Documentar TK-XXX bajo una US existente y work-units; solo especificación, sin código ni tests. Usar al crear, anclar o detallar tareas.
license: MIT
---

## Subagente obligatorio

Este skill **debe** ejecutarse mediante el agente **`docs-specialist`**. No sustituir por otro agente ni por el asistente general para el trabajo cubierto por este skill. Alcance permitido: **solo documentación** (sin código de aplicación, sin compilar, empaquetar, instalar dependencias con efecto en el producto ni ejecutar pruebas). Las **reglas, plantillas y pasos** de las TK y `work-units` están en este documento; la identidad operativa, las prohibiciones de alcance y el flujo documental general corresponden al agente citado.

# Planificar tarea de historia de usuario

## Purpose

- Pedidos de **crear / añadir / anclar** un `TK-XXX` o **especificar** trabajo técnico hasta **Ready**.
- **No** usar para implementar código, migraciones, APIs, tests ni crear ADRs sin pedido explícito del usuario.

## Scope

**Incluye:**
- Crear o editar `docs/product/user-stories/US-XXX-.../TK-XXX-[kebab-case].md` según `references/task.md` (metadatos; **Descripción** = objetivo breve, sin el cómo; Dependencias; Referencias; Plan de implementación).
- **Stub Draft:** cabecera mínima, enlace a US, **Unidad de trabajo** `Por definir` si aplica; no inventar implementación.
- Mantener `docs/product/work-units.md`: crear desde `references/work-units.md` si falta; añadir o ajustar `## <unidad>` (solo nombre + párrafo de alcance) cuando la unidad sea concreta (no `Por definir`).
- Enlazar `docs/product/technical-docs/`, ADRs existentes (`docs/adr/` o `docs/product/adr/`), `glossary.md` si hay términos nuevos (solo definiciones cortas).
- Leer `README.md` de la US y **todas** las `TK-*.md` de la carpeta; alinear o resolver solapes con el usuario.

**No incluye:**

- Implementar producto en el repo.
- Crear ADRs automáticamente (solo referenciar existentes o **sugerir** al usuario que documente).
- Crear carpeta `US-XXX-...` desde cero sin `README.md` ya existente.
- Sustituir `work-units.md` por listados de TK, DTOs o technical-docs largos.

## Inputs

- Carpeta `docs/product/user-stories/US-XXX-[nombre-corto]/` con `README.md`.
- Intención: **solo anclaje (stub Draft)** vs **TK completa** (objetivo **Ready**).
- TK completa: objetivo claro; sin datos suficientes → **preguntar** o hacer **stub**; no redactar cuerpo técnico inventado.
- Unidad ambigua → confirmar antes de TK completa (stub puede llevar `Por definir`).
- Opcional: `.agent/MEMORY.md` → `preferred language:` (ver Reglas).

## Outputs

- `TK-XXX-[kebab-case].md`: título `# TK-XXX: …`; metadatos; enlace `[US-XXX](./README.md)`; **Unidad de trabajo** obligatoria; **Asignado a** solo si aplica.
- `work-units.md` según reglas de unidad.
- Si aplica: enlaces o notas en `technical-docs/`; entradas breves en `glossary.md`.
- **Nunca** copiar `references/task.md` al producto; **nunca** incluir párrafos «Qué va aquí» ni placeholders `[…]` en el TK publicado.

### Mensaje al usuario (siempre)

- **No** incluir razonamiento interno, cadenas de pensamiento ni justificaciones meta del agente; **no** narrar el trabajo en curso o ya hecho (p. ej. «leí **US-XXX**», «creé **TK-XXX**», «actualicé **work-units.md**»); solo resultados y lo que el usuario debe saber o decidir.
- Si hay **Observaciones** en el repo o **pendientes de aclarar** con el usuario: listarlos en viñetas; un bloque `TK-XXX-[nombre-corto]` + lista por tarea si hay varias.

## Rules

- **Idioma:** (1) idioma del turno del usuario; (2) si existe `.agent/MEMORY.md`, usar `preferred language:`; (3) si no, **preguntar** y crear/actualizar `.agent/MEMORY.md` con `preferred language: <ISO 639-1>`. Redactar TK en ese idioma; identificadores técnicos según código/equipo.
- **Antes de crear o ampliar:** leer `README.md` de la US y todas las `TK-*.md` de la carpeta.
- **TK completa (no stub):** sin ambigüedad; contexto técnico citado o descrito; solo ADRs **existentes**; **unidad definida** (no `Por definir`). Falta decisión → sugerir ADR al usuario; **no** crear el archivo ADR.
- **ADR:** `docs/adr/` = transversal/base; `docs/product/adr/` = producto. Rutas relativas desde el TK: ajustar profundidad al repo (ej. `../../../../docs/adr/...`, `../../adr/...`).
- **Archivo:** `TK-XXX-[nombre-descriptivo].md`; `XXX` secuencial **por historia**; sufijo kebab-case minúsculas.
- **Stub Draft:** `Estado: Draft`; **Prioridad** acordada o **Media** por defecto; unidad puede ser `Por definir`; **Descripción** = objetivo breve acordado; Plan vacío o ausente si no hay pasos; **Observaciones** = pendientes reales, sin relleno genérico.
- **work-units.md:** según `references/work-units.md`; por unidad: `## nombre` + párrafo de alcance; **no** listar TK ni DTOs.
- **Secciones del TK:** **Descripción** = qué lograr. **Dependencias** = solo piezas de la **unidad de trabajo** (componentes, servicios, modelos, libs). **Referencias** = ADR, technical-docs, diseño. **Plan de implementación** = cómo. **No** duplicar la US; enlazar `./README.md`.
- **Estado Ready:** `Estado: Ready` **solo** si **Observaciones** no tiene aclaraciones, prerrequisitos abiertos ni información pendiente; si hay alguno → `Draft` hasta integrar lo acordado en el cuerpo y vaciar/omitir pendientes en **Observaciones**.
- **Contenido publicado:** solo hechos acordados o verificables; incertidumbre → **Observaciones** o pregunta al usuario; tono imperativo y verificable; evitar «podría», «quizá», «tal vez» en texto que parezca definitivo.
- **Asignado a:** priorizar usuario; si no indicado y aporta valor, `git config user.name`; si no, omitir la línea.

## Pasos

1. Confirmar carpeta US y leer `README.md`.
2. Listar y leer `TK-*.md`; detectar solapes; resolver con usuario o texto antes de marcar **Ready**.
3. Elegir flujo:
   - **Solo anclaje** → paso 4 (stub); actualizar `work-units.md` solo si la unidad del stub **no** es `Por definir`.
   - **TK completa** → paso 5.
4. **Stub:** siguiente `TK-XXX`; crear archivo con `Estado: Draft`, **Prioridad** (Media por defecto si el usuario no indica), enlace a US, unidad `Por definir` o conocida, descripción mínima, Plan vacío si no hay pasos, **Observaciones** con pendientes reales. Si unidad ≠ `Por definir`, aplicar paso 6. **Parar** aquí (no pasos 5–10 salvo paso 6 puntual).
5. **Unidad (TK completa):** inferir del repo o **preguntar**; sin unidad concreta **no** publicar TK completa.
6. **work-units.md:** crear si falta (desde `references/work-units.md`); si unidad concreta y no existe sección `## <nombre>`, añadirla con alcance (preguntar si el alcance no está claro). Stub con `Por definir` → no obligatorio nueva sección hasta definir unidad.
7. **TK completa:** validar Reglas; si incompleto o ambiguo → **preguntar**; **no** redactar detalle hasta cumplir.
8. Siguiente `TK-XXX` y nombre `TK-XXX-[kebab-case].md`.
9. Redactar TK (estructura `references/task.md`); enlazar technical-docs y ADR existentes; actualizar technical-docs/glossary si hace falta; **no** crear ADRs; lagunas → **Observaciones**.
10. **Checklist (TK no stub):** coherencia con US y otras TK; referencias y criterios verificables; unidad en `work-units.md` si no es `Por definir`; sin código nuevo en el repo.

## Ejemplos

- **Stub:** «Solo hueco TK-003, sin diseño técnico» → `TK-003-....md`, `Draft`, `Por definir`, cuerpo mínimo; `work-units.md` sin cambio de unidad obligatorio.
- **Completa:** «Diálogo X con Material y repo Y; US con criterios; ADR en docs/product/adr» → TK `Ready` o `Draft` según pendientes; unidad concreta; `work-units.md` si la unidad es nueva; referencias a ADR/technical-docs; sin código.
- **Incompleta:** «TK-005 para API Z» sin contratos → **preguntar** endpoints/DTOs; no TK completo genérico; ofrecer stub si solo reservan ID.

## Anti-patterns

- Implementar features, migraciones o tests mientras se redacta el TK.
- Crear ADR nuevo sin pedido explícito del usuario.
- **Ready** en stub sin criterios ni contexto técnico.
- **Ready** con pendientes en **Observaciones**.
- Ignorar TK existentes; duplicar o contradecir alcance.
- Meter listas de tareas o DTOs largos en `work-units.md`.
- Inventar ER, flujos o integraciones en lugar de preguntar.
- Usar `glossary.md` como especificación técnica o sustituto de ADR.
- Rellenar secciones con ejemplos o supuestos; pendientes sin listar en **Observaciones**.
- Omitir **Observaciones** cuando hay pendientes reales.

## Notes

- US = funcional (`README.md`); TK = implementación descrita y criterios de desarrollo.
- Ajustar rutas relativas a `technical-docs/` y ADRs si la estructura del repo difiere.
- Stub = reservar ID y vínculo; completar después y pasar a **Ready** cumpliendo Reglas.
- Si el usuario pide **ejecutar** el trabajo documentado → **story-implement** u otro flujo acordado; **no** mezclar con este skill.
