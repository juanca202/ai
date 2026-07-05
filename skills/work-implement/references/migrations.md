# Tipo de implementacion: Migracion entre proyectos

Flujo para **ejecutar en codigo** una migracion tecnologica `MG-XXX` bajo `docs/specs/migrations/`, a partir del `plan.md` ya redactado por `project-migrate`. Esta referencia se carga desde `SKILL.md` cuando la seleccion de tipo resuelve a este caso. Asume ya resueltos el mecanismo de preguntas, el idioma, la validacion de repositorio y el ritmo de confirmacion (ver `SKILL.md`).

> **Naturaleza de la migracion:** el `plan.md` esta organizado **por fases** (Fase 1, Fase 2, ...) siguiendo una **estrategia incremental** (Strangler Fig, Branch by Abstraction, arquitectura transitoria; nunca *big bang*). La validacion **no** se escribe desde cero: se ejecuta el **Golden Master Testing** ya preparado en `validation.md`, contrastando la salida del destino contra la salida de referencia (golden master).
>
> **Unidad de confirmacion:** **una fase del plan.** Se implementa una fase, se valida (Golden Master de esa fase), se actualiza `progress.md` y se pide confirmacion antes de la siguiente fase.

---

## Ubicacion de archivos

Cada migracion vive en `docs/specs/migrations/MG-XXX-{slug}/`:

| Artefacto | Ruta |
| --------- | ---- |
| Descubrimiento | `docs/specs/migrations/MG-XXX-{slug}/discovery.md` |
| Preparacion de validacion | `docs/specs/migrations/MG-XXX-{slug}/validation.md` |
| Recursos de validacion (golden master) | `docs/specs/migrations/MG-XXX-{slug}/validation/` |
| Plan de migracion | `docs/specs/migrations/MG-XXX-{slug}/plan.md` |
| Progreso | `docs/specs/migrations/MG-XXX-{slug}/progress.md` |

**Rama de trabajo:** `feature/MG-XXX-{slug}` por defecto (la migracion suele ser de larga vida; acordar con el usuario si se prefiere una rama de integracion dedicada). No asumir la rama base.

> El `{slug}` y el `MG-XXX` son los mismos que asigno `project-migrate`. Respetarlos tal cual.

---

## Informacion requerida antes de implementar

| Dato | Como obtenerlo | Si no esta disponible |
| ---- | -------------- | --------------------- |
| **Migracion a implementar** | Indicada por el usuario (`MG-XXX` o descripcion) | Preguntar cual; no asumir |
| **Carpeta de la migracion** | `docs/specs/migrations/MG-XXX-{slug}/` | Si no existe, parar: la migracion no fue planificada |
| **Destino unico o fragmentado** | Si el origen se reparte en **varios** proyectos destino, cada uno tiene su propia carpeta `MG-XXX-{slug}/` | Confirmar con el usuario que proyecto(s) destino se implementan |
| **Estrategia de migracion** | Seccion `Plan de implementacion` del `plan.md` | Leer del plan; no reinventar la estrategia |

---

## Validacion especifica

Ademas de la validacion de repositorio transversal (`SKILL.md`):

- **`plan.md` en `Ready`:** existe `docs/specs/migrations/MG-XXX-{slug}/plan.md` con `Estado: Ready`. Un plan en `Draft` **no** es ejecutable - devolver a `project-migrate`.
- **`discovery.md` y `validation.md` en `Ready`:** son pre-requisitos del plan; si alguno esta en `Draft`, el plan no estaba realmente listo. Parar y avisar.
- **Insumos de golden master presentes:** los casos de `validation.md` tienen sus entradas/salidas de referencia en `validation/`. Si un caso esta en `Pendiente`, no se puede validar esa porcion: avisar antes de implementar la fase afectada.

---

## Flujo de implementacion

### Paso 1 - Pre-requisitos y rama

1. Verificar working tree limpio; si no, parar y avisar.
2. Confirmar `plan.md` (y `discovery.md` / `validation.md`) en `Ready`. Si no, parar y devolver a `project-migrate`.
3. **Destino fragmentado:** confirmar con el usuario que proyecto destino se implementa; cada proyecto tiene su propia carpeta `MG-XXX-{slug}/`, su `plan.md` y su `progress.md`. Implementar **un destino a la vez**.
4. Resolver y hacer checkout de la rama de la migracion (crear desde la rama base acordada si no existe).
5. Leer o crear `progress.md` en la carpeta de la migracion (desde `assets/progress-template.md`). Anadir **una entrada por cada Fase** del plan con `Estado: Pending` salvo las ya `Done`.

### Paso 2 - Presentar fases

1. Leer `discovery.md`, `validation.md` y `plan.md` completos.
2. Presentar la **estrategia de migracion** y las **fases** del `Plan de implementacion` en orden, indicando que casos de golden master de `validation.md` aplican a cada fase.
3. Senalar fases bloqueadas si algun caso de validacion sigue en `Pendiente`.
4. Mostrar la lista de fases. **No ejecutar codigo en este turno.**
5. Preguntar si continuar y **esperar confirmacion**.

### Paso 3 - Implementar fase a fase

> IMPORTANTE **Una unidad = una fase.** Se implementan las tareas de la fase, se valida con Golden Master, se actualiza `progress.md` y se pide confirmacion antes de la siguiente fase. No avanzar sin confirmacion.

Por cada fase aprobada, en el orden del plan:

1. Implementar las **tareas accionables de la fase** segun el `plan.md`, respetando la estrategia incremental (Transform / Coexist / Eliminate, o la que indique el plan).
2. Si la fase genera o modifica UI: ejecutar bajo `ui-specialist`. Si la referencia de diseno es Figma: usar el MCP de Figma.
3. Ejecutar lint/typecheck/build y la suite de tests del paquete afectado. Si algo falla, corregir antes de continuar.
4. **Validar con Golden Master:** ejecutar los casos de `validation.md` que aplican a la fase y **contrastar la salida del destino contra el golden master** de referencia (segun la estrategia de comparacion de cada caso). Si hay diferencias no justificadas, corregir antes de marcar la fase `Done`. Si una diferencia corresponde a un bug del origen marcado como excepcion en `validation.md`, no "congelarlo": dejar nota.
5. Si aplica **Parallel Run + Reconciliation**, ejecutar el destino contra el origen en vivo y reconciliar antes de cerrar la fase de *coexistencia*.
6. Actualizar el artefacto y el progreso:
   - **Al iniciar la fase:** cambiar su estado en `progress.md` a `In Progress` y **poblar la lista de to-dos del agente**: la **primera entrada es el identificador y titulo de la fase** (`MG-XXX` + fase en ejecucion), para tener siempre presente el artefacto en ejecucion, seguida de **las tareas de la fase segun el `plan.md`** (una entrada por tarea `IT-XX`, en el orden del plan). Cada entrada de tarea muestra solo la descripcion corta (`IT-XX` + linea corta), no el detalle completo.
   - **Por cada tarea de la fase completada:** marcar `[ ]` => `[x]` en la seccion correspondiente del `plan.md` y marcar su entrada en la lista de to-dos del agente como `completed`.
   - **Al cerrar la fase:** cambiar su estado en `progress.md` a `Done`, con todas las tareas de la fase ya `completed` en la lista de to-dos del agente; marcar tambien la **primera entrada (titulo de la fase) como `completed`** una vez que todas las tareas de la fase hayan finalizado; registrar `Decisiones adicionales` si hubo decisiones nuevas en la sesion.
7. **Detenerse y preguntar** (herramienta estructurada): "Fase N completada y validada. Continuo con la Fase N+1 - [titulo]?" Opciones: [Si, continuar] / [No, detener aqui].
8. Solo si confirma: siguiente fase. Si detiene, registrar nota y pasar al Paso 4.

### Paso 4 - Cierre

1. Cuando todas las fases esten `Done` (o el usuario detenga), ejecutar la **suite completa de Golden Master** y, si aplica, el **Parallel Run + Reconciliation** final antes del *cutover*. La definicion de los casos ya vive en `validation.md`; no inventar casos nuevos.
2. **Handoff:** si todas las fases del destino estan `Done`, golden master en verde, working tree limpio y commits hechos, **preguntar al usuario** (herramienta estructurada) como continuar:

   > "Implementacion completada. ¿Que quieres hacer ahora?"
   > Opciones: [Integrar el trabajo] / [Crear un PR] / [Terminar aqui]

   - **Integrar el trabajo** => hacer handoff a `work-integrate`.
   - **Crear un PR** => hacer handoff a `pr-create`.
   - **Terminar aqui** => cerrar sin handoff; el trabajo queda commiteado en la rama.

   Si el destino esta fragmentado, repetir el flujo para el siguiente proyecto destino. Si quedan fases pendientes, indicar que falta cerrar antes de ofrecer estas opciones.

---

## Checklist

**Repositorio:** working tree limpio; rama de la migracion activa o creada; `progress.md` leido o creado.

**Pre-requisitos:** `plan.md`, `discovery.md` y `validation.md` en `Ready`; casos de golden master con sus insumos en `validation/`; destino (unico o fragmentado) confirmado.

**Por cada fase:** tareas implementadas segun el plan; estrategia incremental respetada; UI bajo `ui-specialist`; Figma via MCP; lint/build ejecutado; **golden master validado** (destino vs referencia); Parallel Run/Reconciliation si aplica; `progress.md` a `Done`; decisiones de sesion registradas; **confirmacion explicita antes de la siguiente fase**.

**Cierre:** suite completa de golden master ejecutada; cutover solo tras validacion en verde.

---

## Ejemplos

**Ejemplo 1 - Migracion por fases**
- *Entrada:* "Implementa la migracion MG-003 (acceso a datos de Sequelize a Prisma)."
- *Salida:* verifica `plan.md` en `Ready`; checkout a `feature/MG-003-*`; presenta estrategia (Strangler Fig) y fases; tras confirmacion implementa **solo la Fase 1**, valida con golden master de los casos de esa fase, actualiza `progress.md`, y **pausa para preguntar si continuar con la Fase 2**.

**Ejemplo 2 - Plan en Draft**
- *Entrada:* "Ejecuta MG-008" pero su `plan.md` esta en `Draft` (o falta `validation.md`).
- *Comportamiento:* parar y avisar: la migracion no esta lista para implementar; devolver a `project-migrate` para dejar discovery/validation/plan en `Ready`.

**Ejemplo 3 - Destino fragmentado**
- *Entrada:* "Implementa MG-005, el monolito se parte en `api` y `workers`."
- *Comportamiento:* confirmar que proyecto destino se implementa primero; cada uno tiene su carpeta `MG-005-{slug}/` y su `plan.md`. Implementar `api` fase a fase; al cerrarlo, repetir para `workers`.

**Ejemplo 4 - Caso de validacion pendiente**
- *Entrada:* "Implementa la Fase 2 de MG-003" pero un caso de golden master de esa fase esta en `Pendiente`.
- *Comportamiento:* avisar que esa fase no se puede validar completa; resolver el insumo (volver a `project-migrate` / `validation.md`) antes de marcar la fase `Done`.

---

## Anti-patterns (especificos del tipo)

- Implementar la migracion en *big bang* en vez de seguir la estrategia incremental del `plan.md`.
- Implementar mas de una fase sin validar y confirmar entre ellas.
- Marcar una fase `Done` sin ejecutar el **Golden Master** de sus casos.
- Inventar casos de prueba en vez de usar los de `validation.md`; "congelar" un bug del origen marcado como excepcion.
- Implementar con `plan.md`, `discovery.md` o `validation.md` en `Draft`.
- Mezclar dos proyectos destino fragmentados en una misma ejecucion.
- Hacer *cutover* antes de tener el golden master en verde (y el Parallel Run reconciliado, si aplica).

---

## Handoffs del ciclo

Posicion: **implementacion** - consume el `plan.md` de `project-migrate`.

| | |
|--|--|
| **Entrada** | `MG-XXX` con `discovery.md`, `validation.md` y `plan.md` en `Ready`; insumos de golden master en `validation/`; rama de la migracion activa o creada. |
| **Salida** | Codigo commiteado; `progress.md` con todas las fases del destino en `Done`; golden master en verde; working tree limpio. |
| **Siguiente paso** | `git-commit` => `pr-create` (opcional) => `work-integrate`. Nota: `work-integrate` ejecutara `code-review` y exigira veredicto Apto antes de integrar. Destino fragmentado: repetir por cada proyecto destino. |
| **Regreso desde plan** | Plan en `Draft`, casos de validacion pendientes o estrategia inviable => volver a `project-migrate`. |
