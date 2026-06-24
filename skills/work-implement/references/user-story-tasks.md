# Tipo de implementacion: Tarea de historia de usuario

Flujo para **ejecutar en codigo** las tareas tecnicas `TK-XXX` de una historia de usuario `US-XXX` bajo `docs/specs/user-stories/`. Esta referencia se carga desde `SKILL.md` cuando la seleccion de tipo resuelve a este caso. Asume ya resueltos el mecanismo de preguntas, el idioma, la validacion de repositorio y el ritmo de confirmacion (ver `SKILL.md`).

> **Unidad de confirmacion:** **una `TK-XXX` por turno.** Al terminar cada TK, detenerse y preguntar si continuar con la siguiente. Sin excepcion, aunque el usuario haya aprobado la cola completa.

---

## Ubicacion de archivos

| Artefacto | Ruta |
| --------- | ---- |
| Historia de usuario | `docs/specs/user-stories/US-XXX-[nombre-corto]/README.md` |
| Tareas | `docs/specs/user-stories/US-XXX-[nombre-corto]/TK-XXX-[nombre].md` |
| Progreso | `docs/specs/user-stories/US-XXX-[nombre-corto]/progress.md` |
| Unidades de trabajo | `docs/specs/work-units.md` |
| Glosario | `docs/specs/glossary.md` |

**Rama de trabajo:** `feature/US-XXX-[nombre-corto]` (el segmento tras `feature/` coincide con la carpeta de la US).

---

## Informacion requerida antes de implementar

| Dato | Como obtenerlo | Si no esta disponible |
| ---- | -------------- | --------------------- |
| **US padre** | Indicada por el usuario o inferida de la ruta | Preguntar a que `US-XXX` pertenece; no implementar hasta tenerla |
| **Alcance** | Del mensaje: toda la US, una lista de TK, o un TK concreto | Preguntar si hay ambiguedad |
| **Unidad de trabajo** | Campo `Unidad de trabajo` de cada TK; complementar con `work-units.md` | Preguntar al usuario; no asumir |
| **Rama de la US** | `feature/US-XXX-[nombre-corto]` | Crear con `git checkout -b ...` desde la rama base acordada |
| **Usuario asignado** | Campo `Asignado a` del TK; si no: `git config user.name` | Aplicar como filtro salvo instruccion explicita |

> Si el usuario indica una lista concreta de TK, un implementador distinto o pide implementar sin filtro, esa instruccion explicita prevalece sobre los filtros automaticos.

---

## Validacion especifica

Ademas de la validacion de repositorio transversal (`SKILL.md`):

- **US padre con README.md:** la carpeta de la US existe y tiene `README.md` con metadato `Estado: Ready`.
- **TK en estado Ready:** solo encolar tareas con `Estado: Ready`. Las `Draft` o `Done` en `progress.md` no son ejecutables por defecto.

---

## Flujo de implementacion

### Paso 1 - Preparar repositorio y rama

1. Verificar working tree limpio; si no, parar y avisar.
2. Resolver nombre de rama: `feature/US-XXX-[nombre-corto]`.
3. `git checkout feature/US-XXX-[nombre-corto]` si existe; si no, `git checkout -b feature/US-XXX-[nombre-corto]` desde la rama base acordada (no asumir `main`/`develop`).
4. Leer o crear `progress.md` (desde `assets/progress-template.md`). Al crearlo, anadir **una entrada por cada TK del alcance** con `Estado: Pending` salvo las ya `Done`.

### Paso 2 - Filtrar y presentar cola

1. Leer `README.md` de la US y todos los `TK-*.md` del alcance indicado.
2. Consultar `docs/specs/work-units.md` si el alcance de alguna unidad no es claro.
3. Construir dos listas:
   - **Implementables:** TK `Ready` que pasen los filtros de unidad y usuario asignado, no marcadas como `Done` en `progress.md`.
   - **Excluidas:** el resto, con su estado entre parentesis - p. ej. `TK-002 - Ajuste de permisos (Draft)`.
4. Mostrar ambas listas en orden numerico. **No ejecutar codigo en este turno.**
5. Preguntar si continuar y **esperar confirmacion** antes de implementar.

### Paso 3 - Implementar tarea a tarea

> IMPORTANTE **Regla de oro - una TK por turno.** Al terminar cada TK, detenerse y preguntar si continuar. Esta regla no tiene excepciones, aunque el usuario haya aprobado la cola completa en el Paso 2.

Por cada tarea aprobada, en orden numerico salvo dependencias obvias en el texto:

1. Implementar segun la especificacion del TK.
2. Si genera o modifica UI: ejecutar bajo `ui-specialist`. Si la referencia de diseno es Figma: usar el MCP de Figma.
3. Al terminar, ejecutar lint/typecheck/build del paquete afectado. Si falla, corregir antes de continuar. **No** ejecutar suites de tests en esta fase.
4. Actualizar `progress.md`: `Pending` => `In Progress` => `Done`; registrar `Decisiones adicionales` si hubo decisiones nuevas en la sesion.
5. **Detenerse y preguntar** (herramienta estructurada): "TK-XXX completada. Continuo con TK-YYY - [titulo]?" Opciones: [Si, continuar] / [No, detener aqui].
6. Solo si el usuario confirma: pasar a la siguiente TK. Si detiene, registrar nota y pasar al Paso 4.

### Paso 4 - Cierre

1. Cuando no queden tareas pendientes (o el usuario detenga), ofrecer la fase de pruebas: delegar a **`quality-specialist`** para escribir tests basados en los **`AC-XXX`** del `README.md`.
2. Si acepta: invocar `quality-specialist` con el contexto de la US, la rama `feature/US-XXX-*` y los TK en `Done`. No escribir tests desde este skill.
3. Si rechaza: registrar nota en `progress.md`.
4. **Handoff:** si todo el alcance esta en `Done`, working tree limpio y commits hechos, sugerir `pr-create` (si revisan por PR) o `work-integrate` (merge local). Si quedan TK pendientes, indicar que falta cerrar.

---

## Flujo: TK indicada sin US explicita

Un `TK-XXX` siempre vive bajo la carpeta de una US. Si el usuario indica solo el numero de tarea:

1. **Preguntar** a que `US-XXX` pertenece antes de continuar.
2. **Validar** que `TK-XXX-[nombre].md` existe dentro de `docs/specs/user-stories/US-XXX-[nombre-corto]/`.
3. Si no pertenece o no se encuentra, **parar** e informar:

```
WARNING No es posible continuar con la implementacion:
- TK-XXX no pertenece a US-XXX o no se encontro en su carpeta.
- Verificar el numero de tarea y la historia indicada antes de continuar.
```

4. **No** implementar hasta confirmar la relacion TK => US.

---

## Checklist

**Repositorio:** working tree limpio; rama `feature/US-XXX-[nombre-corto]` activa o creada; `progress.md` leido o creado.

**Cola:** `README.md` y todos los `TK-*.md` del alcance leidos; `work-units.md` consultado si hizo falta; listas presentadas; confirmacion recibida antes del primer cambio de codigo.

**Por cada tarea:** TK `Ready`; no `Done` en `progress.md`; UI bajo `ui-specialist`; Figma via MCP; lint/build ejecutado; `progress.md` a `Done`; decisiones de sesion registradas; **confirmacion explicita antes de la siguiente TK**.

**Cierre:** usuario preguntado por la fase de pruebas; si acepta, tests delegados a `quality-specialist` sobre `AC-XXX`.

---

## Ejemplos

**Ejemplo 1 - US completa con filtro de unidad**
- *Entrada:* "Implementa lo Ready de la US-042; estoy en el paquete `@acme/web-app`."
- *Salida:* checkout a `feature/US-042-*`; cola de Ready y excluidas; tras confirmacion, implementa **solo la primera TK Ready**, lint/build, actualiza `progress.md`, y **pausa para preguntar si continuar**.

**Ejemplo 2 - TK sin US**
- *Entrada:* "Implementa TK-003."
- *Comportamiento:* Preguntar a que US pertenece; validar el archivo; continuar o parar con error.

**Ejemplo 3 - TK en Draft**
- *Entrada:* "Ejecuta TK-005 de la US-042" y TK-005 esta en Draft.
- *Salida:* `TK-005 (Draft)` en excluidas; no se implementa hasta que este Ready.

**Ejemplo 4 - "implementar todo de corrido"**
- *Entrada:* "Implementa todas las tareas de una vez sin preguntar."
- *Comportamiento:* Informar que el skill opera con **una TK por confirmacion** y no es posible omitir las pausas. Ofrecer continuar con el flujo estandar.

---

## Anti-patterns (especificos del tipo)

- Arrancar la siguiente TK sin confirmacion explicita (aunque la cola este aprobada).
- Omitir el mensaje de cola e ir directo al codigo.
- Tratar tareas en Draft como ejecutables.
- Ejecutar suites de tests durante el ciclo sin que el usuario acepte la fase final.
- Ignorar `progress.md` o usar identificadores distintos a `TK-XXX`.
- Implementar UI sin `ui-specialist`, o UI con referencia Figma sin el MCP de Figma.

---

## Handoffs del ciclo

Posicion: **implementacion** - entre `work-plan` e `work-integrate`.

| | |
|--|--|
| **Entrada** | US `Ready`; TK del alcance `Ready`; rama `feature/US-XXX-*` activa o creada desde la rama base. |
| **Salida** | Codigo commiteado; `progress.md` con cada TK del alcance en `Done`; working tree limpio. |
| **Siguiente paso** | `git-commit` => `pr-create` (opcional) => `work-integrate`. Nota: `work-integrate` ejecutara `code-review` y exigira veredicto Apto antes de integrar. |
| **Regreso desde plan** | TK en Draft o conflicto tecnico => volver a `work-plan`. |
