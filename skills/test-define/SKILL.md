---
name: test-define
description: 'Crear casos de prueba (TC-XXX) a partir de los criterios de aceptación (AC-XXX) de una historia de usuario (US-XXX), un work item (WI-XXX) o un feature de funcionalidad ya implementada (FEAT-XXX), siguiendo el estándar IEEE 29119-4. Activar cuando el usuario pida "definir test cases", "crear casos de prueba", "generar TCs", "pruebas para la US/WI/FEAT", "documentar pruebas", "casos de prueba para los criterios de aceptación", o cualquier variante que implique producir documentación de prueba a partir de requisitos ya especificados. También activar cuando el usuario mencione "test-define" o "/test-define".'
license: MIT
---

# Skill: Definir casos de prueba

Genera **casos de prueba documentados** (`TC-XXX`) a partir de los criterios de aceptación (`AC-XXX`) de un artefacto ya especificado (`US-XXX`, `WI-XXX` o `FEAT-XXX`), siguiendo la estructura IEEE 29119-4. Como guía de cobertura mínima, cada criterio se analiza desde tres perspectivas —**happy path**, **error** y **límite**—, generando los TCs que el criterio requiera (una perspectiva puede omitirse si no aplica; ver Paso 3).

> **Solo documentación de prueba:** este skill produce archivos `TC-XXX-{slug}.md` más un índice `test-cases/README.md`. No implementa código de prueba ni ejecuta tests. La única modificación permitida sobre el artefacto origen (US/WI/FEAT) es agregar, bajo cada criterio de aceptación, la lista de casos de prueba que lo cubren (ver Paso 5); no altera ningún otro contenido del artefacto ni otros archivos existentes.

---

## Cómo preguntar al usuario

Toda pregunta al usuario va por la **herramienta de preguntas estructuradas** (opciones tappables), no como prosa libre. Reglas:

- Opciones cortas y mutuamente excluyentes (2-4 por pregunta).
- No repreguntar lo que ya conste en el artefacto o en la conversación.
- Si el cliente no expone la herramienta, formular en prosa con opciones enumeradas.

---

## Resolución de idioma

Redactar los TCs y los mensajes al usuario en el idioma del artefacto origen. Si hay conflicto o ambigüedad, preguntar al usuario antes de generar.

---

## Selección del artefacto

El usuario indica un `US-XXX`, un `WI-XXX` o un `FEAT-XXX`. Si el identificador es ambiguo (sin prefijo, o no está claro el tipo), **preguntar** antes de continuar.

| Tipo | Ubicación del artefacto | Ubicación de los TCs |
|------|------------------------|----------------------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-{nombre}/README.md` | `docs/specs/user-stories/US-XXX-{nombre}/test-cases/` |
| Work item | `docs/specs/work-items/WI-XXX-{kebab-case}/README.md` | `docs/specs/work-items/WI-XXX-{kebab-case}/test-cases/` |
| Feature (funcionalidad ya implementada) | `docs/specs/features/FEAT-XXX-{slug}/README.md` | `docs/specs/features/FEAT-XXX-{slug}/test-cases/` |

> Para WI y FEAT, la carpeta `test-cases/` se crea dentro de la carpeta del artefacto (`WI-XXX-{kebab-case}/` o `FEAT-XXX-{slug}/`) si no existe; el `README.md` del artefacto permanece donde está.

### Feature (`FEAT-XXX`) — funcionalidad ya implementada

Un `FEAT-XXX` es el registro de una funcionalidad **ya implementada**, que vive en
`docs/specs/features/`. Puede nacer del flujo D (análisis legacy) de `work-research` —feature
inferido de código— o documentar funcionalidad existente en general; en ambos casos
`test-define` lo trata **igual** que una US o un WI: lee sus `AC-XXX` de la sección
**Criterios de aceptación** del `README.md` (que debe estar en `Estado: Ready`), sigue el
flujo normal (entrevista, perspectivas happy/error/límite, índice, trazabilidad del Paso
5) y guarda los TCs bajo `docs/specs/features/FEAT-XXX-{slug}/test-cases/`. Particularidad: los
criterios del feature describen el comportamiento **ya implementado**, así que los TCs son
la **red de seguridad** para cubrirlo; cuando un TC valide un comportamiento que el
discovery marcó como posible bug preservado, anotarlo para trazabilidad.

---

## Paso 1 — Leer y extraer criterios

1. Leer el artefacto completo.
   - **US:** `README.md` de la historia. Los criterios son los bloques `AC-XXX` en la sección Criterios de aceptación.
   - **WI:** el `README.md` del WI (`WI-XXX-{kebab-case}/README.md`). Los criterios son los ítems de la sección **Criterios de aceptación**.
   - **FEAT:** el `README.md` del feature (`docs/specs/features/FEAT-XXX-{slug}/README.md`). Los criterios son los `AC-XXX` de la sección **Criterios de aceptación**; describen el comportamiento de una funcionalidad ya implementada.
2. Verificar el estado del artefacto:
   - `Estado: Ready` → continuar.
   - `Estado: Draft` → parar: el artefacto no está listo para producir TCs.
   - `Estado: Obsolete` → parar: el artefacto fue descartado; no generar TCs sobre él.
   - Cualquier otro estado → parar e informar: "El artefacto tiene estado [X], que no es soportado. Solo se procesan artefactos en estado `Ready`."
3. Si no hay criterios de aceptación definidos (sección ausente o vacía), **parar** e indicar que el artefacto necesita criterios antes de poder generar TCs.
4. Verificar que **cada criterio tenga su código de identificación `AC-XXX`** (formato único válido, tanto en US como en WI). Si uno o más criterios carecen de código, **parar** e informar al usuario:

   ```
   ERROR Trazabilidad incompleta:
   Los siguientes criterios no tienen código identificador: [lista].
   Cada criterio de aceptación debe tener un código único antes de generar TCs.
   Agrégalos en el artefacto y reinicia el proceso.
   ```

   No continuar hasta que todos los criterios tengan código. No asignar códigos automáticamente.
5. Listar los criterios encontrados (con su identificador y título) y pedir confirmación al usuario antes de continuar.

---

## Paso 2 — Entrevista de clarificación

Antes de generar ningún TC, resolver las dudas que puedan afectar la calidad de los casos. Las preguntas a continuación son el conjunto estándar; **omitir las que ya estén respondidas en el artefacto o en la conversación** para no interrogar innecesariamente al usuario.

Preguntar usando la herramienta de preguntas estructuradas sobre:

1. **Alcance**: ¿TCs para todos los criterios o para un subconjunto? Opciones: [Todos] / [Seleccionar criterios].
2. **Entorno de referencia**: ¿desarrollo, staging o producción? Afecta URLs, datos de prueba y configuraciones.
3. **Roles de usuario involucrados**: si el artefacto no los especifica, listar los inferidos y confirmar.
4. **Datos de prueba**: ¿hay juegos de datos ya definidos o se proponen dentro del TC? Opciones: [Ya existen] / [Proponer en el TC].
5. **Escenarios de error críticos**: ¿el negocio prioriza algún error específico que el artefacto no detalla?

No avanzar al Paso 3 hasta recibir respuesta a las preguntas que apliquen.

---

## Paso 3 — Generar casos de prueba

Por cada criterio en el alcance, analizar cuántos TCs son necesarios según la información del artefacto, las respuestas del usuario en la entrevista y la complejidad del escenario. No hay un número fijo: un criterio simple puede requerir un solo TC; uno complejo puede necesitar varios. Las tres perspectivas sirven como guía de cobertura mínima, no como límite:

| Perspectiva | Qué cubre | Ejemplo de slug |
|-------------|-----------|-----------------|
| **Happy path** | Flujo exitoso con datos válidos; el criterio se cumple completamente. | `login-credenciales-validas-happy` |
| **Error** | Entrada inválida, permiso denegado, servicio caído, o cualquier desvío que el sistema debe manejar con un error controlado. | `login-password-incorrecto-error` |
| **Límite** | Valores en el borde del dominio: máximo/mínimo permitido, longitud exacta, fecha límite, concurrencia, campo vacío. | `nombre-255-caracteres-limite` |

Si dentro de una perspectiva hay múltiples escenarios distintos que vale la pena distinguir (p. ej., dos tipos de error con comportamientos diferentes), crear un TC por escenario en lugar de agruparlos. Si una perspectiva no aplica al criterio, omitirla sin necesidad de justificar salvo que sea evidente que debería existir y se descarta por alguna razón concreta.

### Numeración y nombres de archivo

- El secuencial `XXX` (tres dígitos: 001, 002, …) es por artefacto padre, siguiendo el orden criterio-a-criterio (happy → error → límite).
- Si la carpeta `test-cases/` ya existe con TCs previos, leer los archivos presentes, determinar el número más alto y continuar desde el siguiente. No regenerar TCs ya existentes salvo instrucción explícita del usuario.
- Nombre de archivo: `TC-XXX-{slug}.md`, donde el slug sigue el patrón `{criterio-resumido}-{perspectiva}` (ver columna Ejemplo arriba). Un TC por archivo.

### Estructura de cada TC

Usar `assets/test-case-template.md` para todos los campos. Reglas de llenado:

- **Perspectiva:** registrar la perspectiva de cobertura del caso (`Happy Path`, `Error` o `Límite`), coherente con el sufijo del slug del archivo. No confundir con el tipo de prueba sugerido del campo Automatización (Unit/Integration/E2E…).
- **Título descriptivo:** redactarlo en formato Given–When–Then (GWT), **respetando el idioma del artefacto origen**: en español usar `Dado {{contexto/precondición}}, Cuando {{acción/evento}}, Entonces {{resultado esperado}}`; en inglés usar `Given {{context/precondition}}, When {{action/event}}, Then {{expected result}}`. Debe describir el escenario concreto que valida el TC, coherente con las precondiciones, los pasos y el resultado esperado final.
- **Criterio de aceptación:** referenciar el identificador `AC-XXX` (mismo formato en US y WI; si el artefacto origen usaba otro formato, normalizarlo a `AC-XXX` según el Paso 1). Este campo no puede estar vacío ni ser genérico — es el vínculo de trazabilidad.
- **Automatización:** declarar la **intención de diseño** del caso, no su estado de ejecución. Como los TC se escriben **antes de implementar**, solo hay dos valores posibles: `Manual` (no se automatiza, requiere ejecución humana por diseño) o `Automatizable` (debe automatizarse). Este campo es la fuente que consume `trace-validate` para distinguir "manual por diseño" de "pendiente de automatizar"; no dejarlo vacío. Ante la duda entre Manual y Automatizable, preguntar al usuario.
  - Para `Automatizable`, agregar entre paréntesis el **tipo de prueba sugerido** junto a la etiqueta (p. ej. `Automatizable (Integration)`). Inferir el tipo recorriendo esta tabla de arriba hacia abajo y tomando la **primera** respuesta afirmativa:

    | Pregunta | Sí | No |
    |----------|----|----|
    | ¿Puede probarse sin interfaz? | Unit / Integration | Continuar |
    | ¿Necesita verificar varios servicios? | Integration | Continuar |
    | ¿Debe validar la experiencia completa del usuario? | E2E | Continuar |
    | ¿Solo verifica un endpoint? | API Test | Continuar |
    | ¿Solo valida la apariencia? | Visual Test | Otro tipo |

    Para los TC `Manual` no aplica tipo sugerido (omitir el paréntesis).
- **Prioridad:** derivar del impacto del criterio en el negocio: Alta si el criterio es bloqueante o afecta seguridad/datos; Media si es funcional importante; Baja si es edge case o cosmético. Si no hay suficiente contexto, preguntar al usuario.
- **Creado por:** usar `git config user.name` del repositorio. Si no está disponible, dejar el campo vacío.
- **Precondiciones:** ser específico — incluir estado del sistema, datos existentes y permisos requeridos.
- **Datos de prueba:** usar los confirmados en el Paso 2; si se proponen, marcarlos con `[propuesto]`.
- **Pasos:** acciones atómicas y observables; cada fila incluye actor + acción + resultado esperado del paso.
- **Resultado esperado final:** estado observable del sistema (UI, código HTTP, mensaje, evento publicado), no estado interno.

---

## Paso 4 — Guardar y reportar

1. Crear la carpeta `test-cases/` si no existe.
2. Escribir cada `TC-XXX-{slug}.md` en la ruta correcta según la tabla de Selección del artefacto. Guardar cada TC con `Estado: Ready` salvo que el usuario indique lo contrario.
3. Crear o actualizar el índice `test-cases/README.md` con una tabla que liste **todos** los TCs de la carpeta (los recién creados más los que ya existieran), ordenados por número de TC. La tabla lleva estas columnas:

   | TC | Perspectiva | Automatización | Prioridad | Criterio de aceptación |
   |----|-------------|----------------|-----------|------------------------|
   | [TC-001](./TC-001-{slug}.md) | Happy Path | Automatizable (Integration) | Alta | AC-001 |

   Reglas del índice:
   - **TC:** ID enlazado por ruta relativa a su archivo `TC-XXX-{slug}.md`.
   - **Perspectiva**, **Automatización** y **Prioridad:** copiar el valor tal como quedó en el encabezado del TC (Automatización incluye el tipo entre paréntesis si aplica).
   - **Criterio de aceptación:** mostrar **solo el código** `AC-XXX`, sin el título.
   - Regenerar el índice completo en cada corrida para reflejar el estado actual de la carpeta; redactarlo en el idioma del artefacto origen.
4. Mostrar al usuario un resumen:
   - Criterios procesados.
   - TCs generados: ID · título · perspectiva.
   - TCs omitidos con justificación.
4. Preguntar si el usuario acepta el resultado:
   - **Acepta** → cerrar; el skill termina.
   - **Ajuste puntual** (campo incorrecto, dato de prueba erróneo) → aplicar la corrección y volver a este paso para confirmar.
   - **Cambio estructural** (nuevos criterios, redefinición del alcance) → reiniciar desde el Paso 1.

---

## Paso 5 — Actualizar el artefacto origen con la trazabilidad

Una vez guardados y aceptados los TCs, editar el artefacto origen (el `README.md` de la US, del WI `WI-XXX-{kebab-case}/README.md`, o del feature `docs/specs/features/FEAT-XXX-{slug}/README.md`) para dejar registrada la trazabilidad directa: bajo cada criterio de aceptación, agregar la lista de los casos de prueba que lo cubren.

Reglas:

- La **única** modificación permitida sobre el artefacto es agregar esta línea de trazabilidad. No reescribir, reordenar ni alterar el texto de los criterios ni ninguna otra sección.
- Para cada criterio, inmediatamente debajo de su enunciado, agregar una línea `Casos de prueba:` con los TCs que lo referencian, enlazados por ruta relativa a la carpeta `test-cases/`. Separar múltiples TCs con ` · `.
- El texto del enlace es el ID del TC (`TC-XXX`); el destino es el archivo `TC-XXX-{slug}.md` correspondiente.
- Si un criterio no tiene TCs (perspectiva omitida por completo), no agregar la línea o dejarla como `Casos de prueba: —` según convenga a la legibilidad.
- Si el criterio ya tenía una línea `Casos de prueba:` de una corrida anterior, reemplazarla por la lista completa y actualizada (no duplicar).

Formato (ejemplo):

```
AC-008 (Observabilidad): El logging estructurado con Pino está activo y registra al menos el inicio del servidor y los errores de autenticación.
Casos de prueba: [TC-019](./test-cases/TC-019-log-arranque-servidor-happy.md) · [TC-020](./test-cases/TC-020-log-error-autenticacion-error.md)
```

Tras editar, informar al usuario qué criterios quedaron enlazados con qué TCs.

---

## Trazabilidad

Cada TC referencia exactamente un criterio de aceptación en el campo **Criterio de aceptación** del encabezado. Un TC sin ese campo completo es inválido.

La trazabilidad inversa (de un criterio a sus TCs) se obtiene buscando el identificador del criterio (`AC-XXX`) en los archivos de la carpeta `test-cases/` del artefacto. La trazabilidad directa (de un criterio a sus TCs) queda registrada en el propio artefacto origen mediante la línea `Casos de prueba:` que se agrega en el Paso 5.

---

## Anti-patterns

- Generar TCs sin haber completado la entrevista del Paso 2 (incluso si parece obvio).
- Crear un TC que cubra más de un criterio de aceptación.
- Omitir una perspectiva que evidentemente debería existir sin dejar constancia del motivo (una perspectiva que no aplica al criterio puede omitirse sin justificación; ver Paso 3).
- Dejar el campo **Criterio de aceptación** vacío o con un valor genérico ("criterio 1").
- Reutilizar un número de secuencia ya existente en `test-cases/`.
- Dejar el índice `test-cases/README.md` desactualizado tras crear o regenerar TCs (debe reflejar siempre todos los TCs de la carpeta).
- Regenerar TCs existentes sin instrucción explícita del usuario.
- Modificar el artefacto origen (README de la US, del WI o del FEAT) más allá de agregar la línea `Casos de prueba:` bajo cada criterio en el Paso 5; cualquier otro cambio al texto de los criterios o a otras secciones está prohibido.
- Escribir código de prueba (Jest, Cypress, etc.); ese trabajo corresponde a `quality-specialist`.
- Continuar si el artefacto no está en `Estado: Ready` o no tiene criterios de aceptación.
- Asignar códigos de criterio automáticamente; si faltan, parar y pedirle al usuario que los agregue en el artefacto.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.