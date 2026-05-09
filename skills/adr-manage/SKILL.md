---
name: adr-manage
description: Crear o actualizar un ADR (Architecture Decision Record) en docs/adr/. Usar cuando el usuario quiera documentar, registrar o actualizar una decisión arquitectónica. Activar también cuando el usuario mencione "ADR", "decision record", "registrar decisión", "documentar arquitectura", o cuando deba cambiar el estado de un ADR existente (Draft a Accepted, marcar como Superseded, etc.).
license: MIT
---

# Skill: Crea o actualiza ADRs

Guía para **crear o actualizar** Architecture Decision Records.
 
> **Alcance de un ADR:** Los ADRs se limitan a **registrar la decisión arquitectónica** y su justificación. Pueden incluir **ejemplos**, **diagramas** o **referencias** internas o externas de apoyo (links a documentación, RFCs, PRs, otros ADRs, etc.), pero **no desarrollan la implementación**. La implementación y las instrucciones operativas para la IA son responsabilidad de los skills.
 
La plantilla canónica está en `references/adr-template.md` (léela antes de escribir cualquier ADR).
 
---
 
## Subagente requerido
 
**Este skill debe ejecutarse obligatoriamente bajo el subagente `docs-specialist`.** No ejecutar directamente sin delegar a ese subagente.
 
---
 
## Ubicación de archivos
 
| Artefacto | Ruta |
|-----------|------|
| ADRs | `docs/adr/ADR-XXX-<slug>.md` |
| Índice | `docs/adr/README.md` |
 
---
 
## Convenciones de nombre de archivo
 
- Formato: `ADR-XXX-<slug>.md`
- `XXX`: número de 3 dígitos con cero a la izquierda (`001`, `012`, `123`)
- `slug`: minúsculas, kebab-case, corto y descriptivo (ej. `auth-strategy`, `db-engine-selection`)
---
 
## Metadatos obligatorios
 
| Campo                  | Regla                                                                          |
|------------------------|--------------------------------------------------------------------------------|
| `Estado`               | Uno de: `Draft` · `Proposed` · `Accepted` · `Deprecated` · `Superseded`       |
| `Fecha de creación`    | Fecha real de creación — **nunca** se modifica después                         |
| `Última actualización` | Fecha de hoy en **toda** escritura al archivo (creación o edición)             |
| `Decisores`            | Nombres o roles de quienes tomaron la decisión                                 |
| `Etiquetas`                 | Palabras clave relevantes (tecnología, dominio, etc.)                          |
 
---
 
## Información requerida antes de redactar
 
Antes de escribir cualquier ADR, el agente debe tener clara la siguiente información. **No inventar nada** — si algún dato no es explícito, preguntar al usuario.
 
| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Problema o tensión arquitectónica** | Del contexto o descripción del usuario | Preguntar al usuario |
| **Decisión concreta** | Del contexto o descripción del usuario | Preguntar al usuario |
| **Decisores** | Indicado por el usuario | **Preguntar explícitamente** antes de cerrar el ADR |
| **Alternativas consideradas** | Solo si el usuario las mencionó explícitamente | No incluir la sección si el usuario no las mencionó |
| **Stack tecnológico** | Inferir del repositorio actual (package.json, pom.xml, build files, etc.) | Preguntar al usuario |
| **ADRs previos o documentos relacionados** | Revisar `docs/adr/` y contexto del usuario | Preguntar si hay referencias relevantes que citar |
 
> Si el ADR está en estado **Draft** o **Proposed**, igual se requiere conocer el problema y la decisión tentativa — un ADR sin decisión definida no tiene sentido aunque sea borrador.

## Validación de conflictos
 
Antes de redactar cualquier ADR nuevo, verificar que no entre en conflicto con ADRs existentes en `docs/adr/`.
 
**¿Qué se considera conflicto?**
- Otra decisión sobre el mismo componente, tecnología o patrón arquitectónico que ya está `Accepted`
- Una decisión que contradice o invalida directamente un ADR en estado `Accepted` o `Proposed`
- Una duplicación de alcance con un ADR existente, aunque la decisión sea diferente
**Proceso:**
1. Leer los títulos y sección `## Decision` de todos los ADRs existentes en `docs/adr/`
2. Comparar el alcance y la decisión propuesta contra los ADRs existentes
3. Si hay conflicto:
   - **No redactar el ADR**
   - Informar al usuario indicando el conflicto de forma clara
   - Incluir enlace(s) a los ADRs en conflicto:
     ```
     ⚠️ Esta decisión entra en conflicto con ADR(s) existentes:
     - [ADR-001: Título](docs/adr/ADR-001-slug.md) — <razón del conflicto>
     ```
   - Sugerir al usuario si prefiere: (a) actualizar el ADR existente, (b) crear un nuevo ADR que lo reemplace marcando el anterior como `Superseded`, o (c) ajustar el alcance para que no haya conflicto
4. Si no hay conflicto, continuar con el flujo de creación
---
 
## Flujo: Crear un ADR nuevo
 
1. **Inferir el número secuencial**
   - Listar archivos en `docs/adr/` con el patrón `ADR-*.md`
   - Tomar el número más alto y sumar 1
   - Si no hay ninguno, empezar en `ADR-001`
   - Si el usuario no indica número, **inferirlo siempre** de la secuencia — nunca preguntar por él
2. **Construir el nombre de archivo**
   - Aplicar las convenciones de nombre: minúsculas, kebab-case, corto y descriptivo
3. **Recopilar información necesaria** (preguntar al usuario lo que falte)
   - Título claro
   - Decisores
   - Etiquetas relevantes
   - Contexto, decisión y consecuencias
   - Estado inicial (por defecto: `Draft`)
4. **Escribir el ADR** usando la plantilla de `references/adr-template.md`
   - `Fecha de creación` = hoy
   - `Última actualización` = hoy
5. **Actualizar `docs/adr/README.md`**
   - Si no existe, crearlo con encabezado y lista vacía
   - Añadir el nuevo enlace manteniendo el orden ascendente por número:
     ```markdown
     - [ADR-001: Título del ADR](ADR-001-slug.md)
     ```
   - **Nunca** reordenar ni eliminar entradas existentes
6. **Confirmar** mostrando la ruta del ADR creado y la línea añadida al README
---
 
## Flujo: Actualizar un ADR existente
 
1. **Identificar el archivo** — por número, slug o título
2. **Leer el contenido actual** completo antes de editar
3. **Aplicar los cambios** solicitados por el usuario
4. **Reglas invariantes en toda actualización:**
   - Actualizar `Última actualización` a la fecha de hoy
   - **Nunca** modificar `Fecha de creación`
5. **Regla especial para estado `Superseded`:**
   - Es obligatorio agregar en `## Referencias` la referencia al ADR reemplazante:
     ```
     - Superseded by: [ADR-XXX: Título](docs/adr/ADR-XXX-slug.md)
     ```
   - Si el usuario no proporcionó el ADR reemplazante, **preguntar antes de guardar**
6. **Actualizar `docs/adr/README.md`** si el título del ADR cambió
7. **Confirmar** mostrando los campos modificados
---
 
## Checklist antes de escribir
 
- [ ] Subagente `docs-specialist` activo
- [ ] Plantilla leída desde `references/adr-template.md`
- [ ] Información requerida completa (problema, decisión, decisores, stack) — nada inventado
- [ ] Número inferido de la secuencia en `docs/adr/` (nunca pedirlo al usuario)
- [ ] Slug en minúsculas y kebab-case
- [ ] `Fecha de creación` y `Última actualización` = hoy (creación) / solo `Última actualización` = hoy (edición)
- [ ] Metadatos obligatorios completos: Estado, Fecha de creación, Última actualización, Decisores
- [ ] Si `Estado = Superseded`: referencia al ADR reemplazante en `## Referencias`
- [ ] `docs/adr/README.md` actualizado con el nuevo enlace en orden
- [ ] El ADR registra la decisión y su justificación — **no desarrolla la implementación** ni instrucciones operativas para la IA
---

### Referencias

- [Architecture Decision Records (ADR)](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

