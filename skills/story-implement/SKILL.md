---
name: story-implement
description: Usar al pedir implementar, desarrollar o ejecutar trabajo referenciado por historia de usuario o tarea.
license: MIT
---

# Skill: Implementar historia de usuario
 
Guía para **ejecutar en código** el trabajo especificado en historias `US-XXX` y tareas `TK-XXX` bajo `docs/specs/user-stories/`.
 
> **Alcance de este skill:** consume especificaciones ya redactadas por **story-plan**. No reescribe ni reestructura tareas — solo las implementa. Correcciones menores acordadas con el usuario son la única excepción. El ritmo es siempre **una tarea por confirmación**.
>
> **Solo implementación:** este skill no modifica documentación de producto — ni `README.md` de US, ni `TK-XXX`, ni ADRs, ni technical-docs a excepción de el **`progress.md`** de la carpeta de la US. Si durante la implementación se detecta un conflicto en la documentación que pueda afectar el resultado (ambigüedad, contradicción entre TKs, regla de negocio incompleta), **parar inmediatamente y notificar al usuario** antes de continuar.
 
---
 
## Agentes condicionales
 
Este skill no requiere un subagente fijo. Sin embargo, aplican las siguientes reglas según el tipo de tarea:
 
| Condición | Agente / Skill requerido |
|-----------|--------------------------|
| La tarea genera o modifica archivos de UI (HTML, CSS, componentes) | Ejecutar bajo el agente **`ui-specialist`** |
| La referencia de diseño es un enlace o archivo de Figma | Invocar además el skill **`figma-implement-design`** antes y durante la implementación de esa tarea |
 
Ambas condiciones pueden aplicar a la vez. Si la tarea no involucra UI, implementar directamente sin delegar.
 
---
 
## Ubicación de archivos
 
| Artefacto | Ruta |
|-----------|------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Tareas | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[nombre].md` |
| Progreso | `docs/specs/user-stories/US-XXX-[nombre-corto]/progress.md` |
| Unidades de trabajo | `docs/specs/work-units.md` |
| Glosario | `docs/specs/glossary.md` |
 
---
 
## Información requerida antes de implementar
 
| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **US padre** | Indicada por el usuario o inferida de la ruta | Si solo se indica `TK-XXX` sin US ni ruta: preguntar a qué `US-XXX` pertenece y no implementar hasta tenerla |
| **Alcance** | Del mensaje del usuario: toda la US, una lista de TK, o un TK concreto | Preguntar si hay ambigüedad |
| **Unidad de trabajo** | Campo `Unidad de trabajo` de cada TK; complementar con `docs/specs/work-units.md` si el alcance no es claro | Preguntar al usuario; no asumir |
| **Working tree limpio** | `git status --porcelain` | Si hay cambios pendientes no resueltos: parar y avisar al usuario antes de continuar |
| **Rama de la US** | `feature/US-XXX-[nombre-corto]`, donde el segmento tras `feature/` coincide con el nombre de la carpeta de la US | Crear con `git checkout -b feature/US-XXX-[nombre-corto]` desde la base acordada |
| **Usuario asignado** | Campo `Asignado a` del TK; si no está: `git config user.name` | Aplicar como filtro salvo instrucción explícita en contrario del usuario |
 
> Si el usuario indica una lista concreta de TK, un implementador distinto o pide implementar todas las tareas sin filtro, esa instrucción explícita prevalece sobre los filtros automáticos de unidad y usuario.
 
---
 
## Validación antes de implementar
 
Antes de tocar código, verificar las siguientes condiciones. Si alguna falla, **parar** — informar al usuario y resolver primero.
 
**¿Qué verificar?**
- **Working tree limpio:** `git status --porcelain` sin cambios pendientes no resueltos.
- **Rama correcta:** estar en la rama `feature/US-XXX-[nombre-corto]` (o crearla). No implementar en `main` ni en ramas de otras historias sin instrucción explícita.
- **US padre con README.md:** la carpeta de la US existe y tiene `README.md`.
- **TK en estado Ready:** solo encolar tareas cuyo metadato `Estado` sea `Ready`. Las tareas en `Draft` o marcadas como `Skipped` en `progress.md` no son ejecutables por defecto.
- **Solapamiento de progreso:** leer `progress.md` si existe; respetar tareas ya en `Done`; si hay alguna `In Progress`, revisar notas y estado real antes de continuar.
**Si hay conflicto:**
```
⚠️ No es posible continuar:
- <razón concreta>
```
 
---
 
## Flujo de implementación
 
### Paso 1 — Preparar repositorio y rama
 
1. Verificar working tree limpio; si no, parar y avisar.
2. Resolver nombre de rama: `feature/US-XXX-[nombre-corto]` (el segmento tras `feature/` debe coincidir con la carpeta de la US).
3. `git checkout feature/US-XXX-[nombre-corto]` si la rama existe; si no, `git checkout -b feature/US-XXX-[nombre-corto]` desde la base acordada.
4. Leer o crear `progress.md` (desde `references/progress-template.md` si no existe; no publicar el archivo de referencia tal cual).
### Paso 2 — Filtrar y presentar cola
 
1. Leer `README.md` de la US y todos los `TK-*.md` del alcance indicado.
2. Consultar `docs/specs/work-units.md` si el alcance de alguna unidad no es claro.
3. Construir dos listas:
   - **Implementables:** TK con `Estado: Ready` que pasen los filtros de unidad y usuario asignado, no marcadas como `Done` o `Skipped` en `progress.md`.
   - **Excluidas:** el resto, con su estado entre paréntesis al final — p. ej. `TK-002 — Ajuste de permisos (Draft)`, `TK-004 — Exportación CSV (Skipped)`.
4. Mostrar ambas listas al usuario en orden numérico. **No ejecutar código en este turno.**
5. Preguntar explícitamente si se desea continuar y **esperar confirmación** antes de implementar.
### Paso 3 — Implementar tarea a tarea
 
Por cada tarea aprobada, en orden numérico salvo dependencias obvias en el texto:
 
1. Implementar según la especificación del TK.
2. Si la tarea genera o modifica archivos de UI: ejecutar bajo el agente `ui-specialist`. Si además la referencia de diseño es un enlace o archivo de Figma: invocar `figma-implement-design` antes y durante la implementación.
3. Al terminar la implementación de la tarea, ejecutar lint, typecheck o build del paquete o unidad afectada para validar que el código compila sin errores. Si falla, corregir antes de continuar. **No** ejecutar suites de tests unitarios ni E2E en esta fase.
4. Actualizar `progress.md`: `Pending` → `In Progress` → `Done`; añadir notas si quedan aspectos parciales.
5. Preguntar al usuario si desea continuar con la siguiente tarea. **No arrancar la siguiente sin confirmación.**
### Paso 4 — Cierre
 
1. Cuando no queden tareas pendientes en el alcance acordado (o el usuario detenga la ejecución), ofrecer la fase de pruebas: implementar tests unitarios y/o E2E basados en los criterios del `README.md` y los TK ejecutados.
2. Si el usuario rechaza, registrar nota en `progress.md`.
---
 
## Flujo: TK indicada sin US explícita
 
Un `TK-XXX` siempre vive bajo la carpeta de una US. Si el usuario indica solo el número de tarea sin mencionar la US:
 
1. **Preguntar** a qué `US-XXX` pertenece la tarea antes de continuar.
2. Una vez recibida la US, **validar** que el archivo `TK-XXX-[nombre].md` existe dentro de la carpeta `docs/specs/user-stories/US-XXX-[nombre-corto]/`.
3. Si la tarea no pertenece a esa US o el archivo no se encuentra: **parar** e informar al usuario con el motivo concreto:
```
⚠️ No es posible continuar con la implementación:
- TK-XXX no pertenece a US-XXX o no se encontró en su carpeta.
- Motivo: <archivo no encontrado / TK en carpeta de otra US>
- Verificar el número de tarea y la historia indicada antes de continuar.
```
 
4. **No** implementar hasta que la relación TK → US esté confirmada.
---
 
## Checklist antes de implementar
 
**Repositorio:**
- [ ] Working tree limpio (`git status --porcelain` sin cambios pendientes)
- [ ] Rama `feature/US-XXX-[nombre-corto]` activa o creada
- [ ] `progress.md` leído o creado
**Cola:**
- [ ] `README.md` de la US leído
- [ ] Todos los `TK-*.md` del alcance leídos
- [ ] `work-units.md` consultado si algún alcance de unidad no era claro
- [ ] Lista de implementables y excluidas presentada al usuario
- [ ] Confirmación del usuario recibida antes del primer cambio de código
**Por cada tarea:**
- [ ] TK con `Estado: Ready`
- [ ] No marcada como `Done` o `Skipped` en `progress.md`
- [ ] Si la tarea genera o modifica UI: ejecutado bajo `ui-specialist`
- [ ] Si la referencia de diseño es Figma: `figma-implement-design` invocado
- [ ] Lint/build ejecutado tras la implementación
- [ ] `progress.md` actualizado
- [ ] Confirmación del usuario antes de la siguiente tarea
---
 
## Ejemplos
 
**Ejemplo 1 — US completa con filtro de unidad**
 
- *Entrada:* «Implementa lo Ready de la US-042; estoy en el paquete `@acme/web-app`.»
- *Salida:* Rama limpia y checkout a `feature/US-042-[nombre-corto]`; mensaje con TK Ready del paquete en cola y excluidas con `(Draft)` / `(Skipped)`; tras confirmación, implementa la primera Ready, ejecuta lint/build, actualiza `progress.md`, pregunta por la siguiente. Sin tests hasta el cierre.
**Ejemplo 2 — TK indicada sin US**
 
- *Entrada:* «Implementa TK-003.»
- *Comportamiento:* El agente pregunta a qué `US-XXX` pertenece. El usuario responde «US-042». El agente valida que `TK-003-[nombre].md` existe dentro de `docs/specs/user-stories/US-042-[nombre-corto]/`. Si existe, continúa con el flujo normal. Si no existe o pertenece a otra US, para con el mensaje de error estructurado indicando el motivo.
**Ejemplo 3 — TK en Draft**
 
- *Entrada:* «Ejecuta TK-005 de la US-042» y TK-005 está en Draft.
- *Salida:* Lista de excluidas: `TK-005 — … (Draft)`; cola de implementables sin TK-005. No implementa TK-005 hasta que su estado sea Ready.
**Ejemplo 4 — Confirmación entre tareas**
 
- *Entrada:* Hay tres TK Ready aprobadas.
- *Comportamiento:* El agente implementa TK-001, actualiza `progress.md`, ejecuta lint, pregunta «¿Continúo con TK-002?». No avanza sin respuesta afirmativa.
---
 
## Anti-patterns
 
- Codificar con working tree sucio sin avisar y pausar.
- Implementar en `main` u otra rama que no sea `feature/US-XXX-[nombre-corto]` de esa US sin instrucción explícita.
- Omitir el mensaje de cola y confirmación e ir directo al código.
- Tratar tareas en Draft como ejecutables por defecto.
- Arrancar la siguiente TK sin confirmación del usuario.
- Ejecutar tests unitarios o E2E durante el ciclo de tareas sin que el usuario haya aceptado la fase final de pruebas.
- Ignorar `progress.md` o usar identificadores distintos a `TK-XXX` en el progreso.
- Implementar archivos de UI sin usar el agente `ui-specialist`.
- Implementar UI con referencia Figma sin invocar `figma-implement-design`.
- Modificar `README.md` de la US, archivos `TK-XXX`, ADRs o `technical-docs/` durante la implementación (`progress.md` excluido); ante cualquier necesidad de cambio en esos artefactos, parar y notificar al usuario.
- Continuar la implementación cuando se detecta un conflicto en la documentación que pueda afectar el resultado; siempre parar y notificar primero.
- Usar `glossary.md` como technical-docs o listado de implementación.
---
 
## Notas
 
### Orden de implementación
 
Respetar orden numérico `TK-001`, `TK-002`, … salvo dependencias obvias descritas en el texto de las tareas. Si hay conflicto de orden, preguntar al usuario antes de implementar.
 
### Relación con otros skills
 
- **story-plan** especifica el formato y contenido de los TK; este skill los consume.
- **story-define** define la US y sus criterios; este skill los usa como referencia para la fase de pruebas.
- **figma-implement-design** es obligatorio para tareas de UI con referencia Figma.

