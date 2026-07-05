---
name: adr-manage
description: >
  Crear o actualizar Architecture Decision Records (ADRs) en docs/adr/.
  Activar siempre que el usuario quiera documentar, registrar, actualizar o cambiar
  el estado de una decisión arquitectónica — incluso si no usa la palabra "ADR".
  Frases que activan este skill: "registrar decisión", "documentar por qué usamos X",
  "dejar constancia de esta elección técnica", "decision record", "cambiar ADR a Accepted",
  "marcar como Superseded", "crear ADR", "actualizar ADR", "nuevo ADR", "ADR-XXX".
  Usar también cuando el usuario describa una tensión arquitectónica que deba quedar documentada.
license: MIT
---

# Skill: adr-manage

Crea y actualiza Architecture Decision Records siguiendo el flujo de este documento.

> **Alcance de un ADR:** registrar la decisión y su justificación — no la implementación.
> Puede incluir ejemplos, diagramas y referencias externas de apoyo.
>
> **Narrativa general, no puntual:** un ADR documenta una decisión que afecta a **todo el proyecto**.
> Por eso el `## Contexto` y la `## Decision` deben redactarse de forma general (una regla,
> driver o lineamiento arquitectónico transversal), no como la resolución de un problema
> específico o aislado. Los ejemplos son bienvenidos para ilustrar, pero no deben convertir
> al ADR en la solución de un caso particular.

La plantilla canónica está en `assets/adr-template.md`. Leerla antes de redactar cualquier ADR.

---

## Resolución de idioma

El idioma del ADR y de los mensajes al usuario se decide en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si no, usar el idioma del mensaje del usuario y **preguntar al usuario si desea persistir su preferencia de idioma en la memoria**.
3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere y, tras su respuesta, **preguntar si desea persistir su preferencia de idioma en la memoria**; no decidir el idioma por cuenta propia.

---

## Información requerida antes de redactar

Recopilar en **una sola tanda de preguntas** al inicio usando la herramienta de opciones tappables del cliente (máx. 3 preguntas por bloque; opciones cortas y mutuamente excluyentes). No inventar datos — si no están en contexto, preguntar.

| Dato | Fuente preferida | Si no está |
|------|-----------------|------------|
| Problema / tensión arquitectónica | Descripción del usuario | Preguntar |
| Decisión concreta | Descripción del usuario | Preguntar |
| Decisores | Indicado por el usuario | Preguntar siempre |
| Stack tecnológico | `package.json`, `pom.xml`, etc. | Preguntar |
| Alternativas consideradas | Solo si el usuario las mencionó | Omitir la sección si no las mencionó |
| ADRs o docs relacionados | `docs/adr/` + contexto | Preguntar si hay referencias a citar |

> ADRs en estado **Draft** o **Proposed** también requieren problema y decisión tentativa.

---

## Validación de conflictos (solo al crear)

Antes de redactar un ADR nuevo:

1. Leer títulos y sección `## Decision` de todos los ADRs existentes en `docs/adr/`
2. Si hay conflicto (misma tecnología/componente ya `Accepted`, contradicción directa, o duplicación de alcance):
   - **No redactar**; informar al usuario con enlace(s) al ADR en conflicto
   - Sugerir: (a) actualizar el existente, (b) crear nuevo marcando el anterior como `Superseded`, o (c) ajustar el alcance

---

## Flujo: Crear ADR nuevo

1. **Número secuencial** — listar `docs/adr/ADR-*.md`, tomar el más alto + 1; si no hay ninguno, empezar en `001`. Nunca pedir el número al usuario. Si se crean varios ADR en una misma tanda (p. ej. invocado por `adr-discover` para varios candidatos), recalcular el número releyendo los archivos ya escritos antes de cada nuevo ADR, para evitar colisiones de numeración.
2. **Nombre de archivo** — `ADR-XXX-<slug>.md` (minúsculas, kebab-case, corto)
3. **Recopilar información faltante** (ver tabla anterior)
4. **Escribir el ADR** desde `assets/adr-template.md`:
   - `Fecha de creación` = hoy; `Última actualización` = hoy
   - Estado por defecto: `Draft`
5. **Actualizar `docs/adr/README.md`**:
   - Si no existe, crearlo con encabezado y lista vacía
   - Añadir `- [ADR-XXX: Título](ADR-XXX-slug.md)` en orden ascendente
   - Nunca reordenar ni eliminar entradas existentes
6. **Confirmar** mostrando ruta del ADR y la línea añadida al README

---

## Flujo: Actualizar ADR existente

1. Identificar el archivo por número, slug o título
2. Leer el contenido completo antes de editar
3. Aplicar los cambios; actualizar `Última actualización` a hoy; **nunca** tocar `Fecha de creación`
4. Si el nuevo estado es `Superseded`: agregar en `## Referencias`:
   ```
   - Superseded by: [ADR-XXX: Título](ADR-XXX-slug.md)
   ```
   Si el usuario no indicó el ADR reemplazante, preguntar antes de guardar.
   Si el nuevo estado es `Deprecated`: marcar `Estado: Deprecated`, actualizar `Última actualización` a hoy y registrar en `## Referencias` el motivo de la obsolescencia; si otro ADR lo reemplaza, enlazarlo con ruta relativa `[ADR-XXX: Título](ADR-XXX-slug.md)`.
5. Actualizar `docs/adr/README.md` si el título cambió
6. **Confirmar** mostrando los campos modificados

---

## Convenciones de metadatos

| Campo | Regla |
|-------|-------|
| `Estado` | `Draft` · `Proposed` · `Accepted` · `Deprecated` · `Superseded` |
| `Fecha de creación` | Fecha real de creación — nunca modificar |
| `Última actualización` | Fecha de hoy en cada escritura |
| `Decisores` | Nombres o roles |
| `Etiquetas` | Palabras clave (tecnología, dominio) |

---

## Referencias

- [Architecture Decision Records](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions — Cognitect](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)