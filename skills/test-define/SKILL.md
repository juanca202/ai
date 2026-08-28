---
name: test-define
description: 'Crear casos de prueba (TC-XXX) a partir de los criterios de aceptación de cualquier artefacto de especificación que los tenga con identificador codificado: una historia de usuario (US-XXX), un work item (WI-XXX), un feature ya implementado (FT-XXX) o cualquier otro documento de especificación cuyos criterios estén numerados o codificados (AC-001, 1.1, R-3, etc.), siguiendo el estándar IEEE 29119-4. Activar cuando el usuario pida "definir test cases", "crear casos de prueba", "generar TCs", "pruebas para la US/WI/FT", "pruebas para este spec/documento", "documentar pruebas", "casos de prueba para los criterios de aceptación", o cualquier variante que implique producir documentación de prueba a partir de requisitos ya especificados. También activar cuando el usuario mencione "test-define" o "/test-define". Si el artefacto está archivado en docs/archive/, se detiene: es trabajo cerrado y hay que desarchivarlo antes.'
license: MIT
---

# Skill: Definir casos de prueba

Genera **casos de prueba documentados** (`TC-XXX`) a partir de los criterios de aceptación de un artefacto ya especificado, siguiendo la estructura IEEE 29119-4. Como guía de cobertura mínima, cada criterio se analiza desde tres perspectivas —**happy path**, **error** y **límite**—, generando los TCs que el criterio requiera (una perspectiva puede omitirse si no aplica; ver Paso 3).

> **Requisito único sobre el artefacto:** que sus criterios de aceptación tengan un **identificador codificado y único** dentro del documento. El **formato del identificador es indiferente** (`AC-001`, `1.1`, `2.4`, `R-3`, `CA-07`…) y el artefacto **no necesita pertenecer a este plugin**: puede ser una US/WI/FT del repo o cualquier otro documento de especificación, sea cual sea su origen, herramienta o formato. Ver [Selección del artefacto](#selección-del-artefacto) y Paso 1.

> **Solo documentación de prueba:** este skill produce archivos `TC-XXX-{slug}.md` más un índice `test-cases/README.md`. No implementa código de prueba ni ejecuta tests. La única modificación permitida sobre el artefacto origen es agregar, bajo cada criterio de aceptación, la lista de casos de prueba que lo cubren (ver Paso 5); no altera ningún otro contenido del artefacto ni otros archivos existentes.

## Mapa de referencias

Carga el archivo correspondiente cuando vayas a ejecutar la tarea; el detalle íntegro vive en `references/`.

| Necesitas… | Archivo |
| ---------- | ------- |
| Integración condicional con un gestor de proyectos: detalle específico de cada proveedor (creación de work items, campos, IDs, vinculación al artefacto padre) | `references/<proveedor>.md` (p. ej. [`references/azure-devops.md`](references/azure-devops.md) para Azure DevOps) — leer solo si la integración está activa (ver [Resolución de la integración con el gestor de proyectos](#resolución-de-la-integración-con-el-gestor-de-proyectos)) |
| Estructura del archivo de un caso de prueba | [`assets/test-case-template.md`](assets/test-case-template.md) |


### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`../../reference/language.md`](../../reference/language.md): **Idioma** — resolución obligatoria del idioma de artefactos y mensajes. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/asking.md`](../../reference/asking.md): **Preguntas** — mecanismo estructurado, ritmo, fallback. *Antes de la primera pregunta.*
- [`../../reference/planning.md`](../../reference/planning.md): **Casos de prueba** — de ahí sale `askDetails`, que decide si este skill entrevista o aplica valores por defecto. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*
- [`../../reference/project-management.md`](../../reference/project-management.md): **Gestor de proyectos** — si la integración está activa, proveedor y datos de conexión. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/alm/azure-devops.md`](../../reference/alm/azure-devops.md): **Azure DevOps** — MCP, URL, límites, sincronización. *Solo si el `provider` resuelto es `azure-devops`.*

---

## Cómo preguntar al usuario

Mecanismo, ritmo y fallback compartidos: [`../../reference/asking.md`](../../reference/asking.md).

Cada vez que este skill o sus referencias digan *preguntar*, *pedir*, *confirmar*, *validar* o *sugerir* algo al usuario, asume ese mecanismo; no se repite allí.

No repreguntar lo que ya conste en el artefacto origen.

---

## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada:** redactar los TC **en el idioma del artefacto origen** — un TC que no hable el idioma de los criterios que traza se lee mal junto a ellos. Si hay conflicto con el idioma resuelto o ambigüedad, preguntar al usuario antes de generar.

---

## Política de definición de casos de prueba

Antes de ejecutar este skill, DEBES leer [`../../reference/planning.md`](../../reference/planning.md).

De ese bloque, este skill consume **`specification.testCases.askDetails`** (el `mode` lo consumen
`work-define` y `work-plan` para decidir si invocan este skill; aquí ya es irrelevante):

| `askDetails` | Comportamiento |
|--------------|----------------|
| `true` | **Hacer la entrevista de clarificación** del [Paso 2](#paso-2--entrevista-de-clarificación) antes de generar los TC. |
| `false` | **No preguntar nada**: aplicar los [valores por defecto](#valores-por-defecto-askdetails-false) y dejar constancia de los supuestos en los propios TC. |

`askDetails` se aplica igual venga este skill invocado por la planificación o directamente por el usuario.
**No afecta al alcance:** con cualquier valor, los TC cubren **todos** los criterios de aceptación.

---

## Resolución de la integración con el gestor de proyectos

Antes de ejecutar este skill, DEBES leer [`../../reference/project-management.md`](../../reference/project-management.md).

Las reglas de `project-management.md` son obligatorias y tienen prioridad para determinar si hay integración con un gestor de proyectos, con qué proveedor y con qué datos de conexión.

No continúes hasta haber leído y aplicado `project-management.md`.

**Delta de este skill:**

- **Desactivada** → continuar con la numeración local secuencial (ver [Numeración y nombres de archivo](#numeración-y-nombres-de-archivo)); no leer ninguna referencia de proveedor.
- **Activada** → además de la referencia compartida del proveedor, cargar `references/<proveedor>.md` de este skill (p. ej. [`references/azure-devops.md`](references/azure-devops.md)) y seguir **únicamente** sus pasos antes de guardar cualquier archivo local (Paso 4). Algunos proveedores exigen resolver una jerarquía propia (un plan y una suite de pruebas) antes de crear el work item del caso de prueba; esos pasos viven íntegramente en esa referencia. Si este skill no tiene referencia para ese proveedor, informar al usuario y continuar con numeración local secuencial.

Todo el detalle propio de cada proveedor (herramienta MCP, campos, tipo de work item, límites de formato) vive exclusivamente en esos archivos.

**Regla de fidelidad (transversal a cualquier sistema):** toda la información del TC debe quedar representada en el work item externo — los pasos de ejecución en un campo dedicado si el sistema lo expone, el resto en la descripción si no lo expone. Ninguna sección del `.md` puede omitirse al sincronizar; el objetivo es poder reconstruir el TC completo a partir del work item si el archivo local se perdiera. Qué campo usa cada sistema para qué sección es detalle de su archivo de referencia.

---

## Selección del artefacto

El usuario indica un artefacto: puede ser un identificador conocido del repo (`US-XXX`, `WI-XXX`, `FT-XXX`) **o una ruta/nombre de cualquier otro documento** de especificación. La única condición para procesarlo es la del Paso 1: que tenga criterios de aceptación con identificador codificado. Si el artefacto es ambiguo (varios candidatos, o no está clara la ruta), **preguntar** antes de continuar.

| Tipo | Ubicación del artefacto | Ubicación de los TCs |
|------|------------------------|----------------------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-{nombre}/README.md` | `docs/specs/user-stories/US-XXX-{nombre}/test-cases/` |
| Work item | `docs/specs/work-items/WI-XXX-{kebab-case}/README.md` | `docs/specs/work-items/WI-XXX-{kebab-case}/test-cases/` |
| Feature (funcionalidad ya implementada) | `docs/specs/features/FT-XXX-{slug}/README.md` | `docs/specs/features/FT-XXX-{slug}/test-cases/` |
| **Cualquier otro artefacto** de especificación, sea cual sea su origen o formato | La ruta que indique el usuario (buscarla en el repo si solo da un nombre) | `test-cases/` dentro de la carpeta que contiene el artefacto; si el artefacto es un archivo suelto, `test-cases/` junto a él. Confirmar la ruta con el usuario antes de escribir. |

> La carpeta `test-cases/` se crea si no existe; el archivo del artefacto permanece donde está.

> **Artefacto archivado.** Si un `US-XXX`/`WI-XXX` no aparece en su ruta activa, buscarlo bajo `docs/archive/user-stories/` o `docs/archive/work-items/` antes de darlo por inexistente — `work-integrate` y `pr-create` pueden moverlo ahí al cerrar el trabajo, si el usuario lo confirma. Si está archivado, **parar y avisar**: definir casos de prueba nuevos para un trabajo ya cerrado requiere desarchivarlo primero, y eso lo decide el usuario. **Nunca** crear la carpeta en la ruta activa por no haberla encontrado: además de duplicar el identificador, la numeración de TCs del [Paso 3](#numeración-y-nombres-de-archivo) reiniciaría en `001` ignorando los TCs que ya existen en el archivo. Ver [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).

### Feature (`FT-XXX`) — funcionalidad ya implementada

Un `FT-XXX` es el registro de una funcionalidad **ya implementada**, que vive en
`docs/specs/features/`. Puede nacer del flujo «Analizar legado» de `work-research` —feature
inferido de código— o documentar funcionalidad existente en general; en ambos casos
`test-define` lo trata **igual** que una US o un WI: lee los criterios de la sección
**Criterios de aceptación** del `README.md` —con el identificador que usen, normalmente `AC-XXX`—
y verifica el estado si el artefacto lo declara (`Estado: Ready`), sigue el
flujo normal (entrevista, perspectivas happy/error/límite, índice, trazabilidad del Paso
5) y guarda los TCs bajo `docs/specs/features/FT-XXX-{slug}/test-cases/`. Particularidad: los
criterios del feature describen el comportamiento **ya implementado**, así que los TCs son
la **red de seguridad** para cubrirlo; cuando un TC valide un comportamiento que el
discovery marcó como posible bug preservado, anotarlo para trazabilidad.

---

## Paso 1 — Leer y extraer criterios

1. **Ubicar y leer el artefacto completo**, sea cual sea su formato. Localizar la sección de criterios de aceptación: normalmente titulada «Criterios de aceptación» / «Acceptance Criteria», pero puede llamarse «Requisitos», «Requirements», «Comportamiento esperado» o similar. En artefactos del repo:
   - **US / WI / FT:** el `README.md` del artefacto; los criterios están en la sección **Criterios de aceptación**.
   - **Cualquier otro artefacto:** la sección equivalente dentro del documento indicado por el usuario. Si hay dudas sobre cuál sección contiene los criterios, preguntar en vez de asumir.
2. **Verificar el estado del artefacto — solo si el artefacto declara un campo de estado** (`Estado:` / `Status:`). Es un campo propio de los artefactos de este plugin; **su ausencia no es un motivo para parar** y no debe pedirse al usuario que lo agregue.
   - Sin campo de estado → continuar (el artefacto es externo al plugin).
   - `Estado: Ready` → continuar.
   - `Estado: Draft` → parar: el artefacto no está listo para producir TCs.
   - `Estado: Obsolete` → parar: el artefacto fue descartado; no generar TCs sobre él.
   - Cualquier otro estado → parar e informar: "El artefacto tiene estado [X], que no es soportado. Solo se procesan artefactos en estado `Ready`."
3. Si no hay criterios de aceptación definidos (sección ausente o vacía), **parar** e indicar que el artefacto necesita criterios antes de poder generar TCs.
4. **Verificar que cada criterio tenga un identificador codificado y único dentro del documento.** El requisito es la **existencia** del identificador, **no su formato**: `AC-001`, `AC-1`, `1.1`, `2.4`, `R-3`, `CA-07` y equivalentes son todos válidos mientras identifiquen unívocamente al criterio. **No exigir el formato `AC-XXX`** ni rechazar un artefacto por no seguir las convenciones de este plugin.
   - Registrar el **esquema de identificación detectado** (p. ej. «numérico jerárquico `N.M`») y **usarlo tal cual** en todo el resto del flujo: los TCs referencian el identificador **verbatim**, sin renombrarlo ni normalizarlo.
   - Si el documento numera los criterios de forma implícita (lista ordenada sin código escrito, viñetas sin marca), eso **no** cuenta como identificador codificado: aplica el error de abajo.
   - Si uno o más criterios carecen de identificador, **parar** e informar al usuario:

   ```
   ERROR Trazabilidad incompleta:
   Los siguientes criterios no tienen identificador: [lista].
   Cada criterio de aceptación debe tener un identificador único (en el formato que use
   el documento) antes de generar TCs.
   Agrégalos en el artefacto y reinicia el proceso.
   ```

   No continuar hasta que todos los criterios tengan identificador. No asignar identificadores automáticamente.
5. Listar los criterios encontrados (con su identificador tal como aparece y su título) y pedir confirmación al usuario antes de continuar.

---

## Paso 2 — Entrevista de clarificación

> **Este paso entero se salta con `specification.testCases.askDetails: false`** — ver [Política de
> definición de casos de prueba](#política-de-definición-de-casos-de-prueba). En ese caso, aplicar los
> [valores por defecto](#valores-por-defecto-askdetails-false) y pasar directamente al Paso 3.

Antes de generar ningún TC, resolver las dudas que puedan afectar la calidad de los casos. Las preguntas a continuación son el conjunto estándar; **omitir las que ya estén respondidas en el artefacto o en la conversación** para no interrogar innecesariamente al usuario.

> **El alcance no se pregunta: son siempre TODOS los criterios de aceptación del artefacto.** Es el
> comportamiento por defecto y no admite una pregunta de confirmación — un criterio sin TC es un hueco de
> cobertura que `trace-validate` reportará después, así que cubrirlos todos es lo que el usuario espera al
> pedir casos de prueba. **Solo** se genera un subconjunto si el usuario lo **pide explícitamente** («solo
> AC-002», «únicamente los criterios de pago»); en ese caso se respeta su selección y se anota en el índice
> qué criterios quedaron sin TC. No ofrecer «¿todos o un subconjunto?»: la respuesta ya está decidida.

Preguntar usando la herramienta de preguntas estructuradas sobre:

1. **Entorno de referencia**: ¿desarrollo, staging o producción? Afecta URLs, datos de prueba y configuraciones.
2. **Roles de usuario involucrados**: si el artefacto no los especifica, listar los inferidos y confirmar.
3. **Datos de prueba**: ¿hay juegos de datos ya definidos o se proponen dentro del TC? Opciones: [Ya existen] / [Proponer en el TC].
4. **Escenarios de error críticos**: ¿el negocio prioriza algún error específico que el artefacto no detalla?

No avanzar al Paso 3 hasta recibir respuesta a las preguntas que apliquen.

### Valores por defecto (`askDetails: false`)

Con `askDetails: false` **no se pregunta ninguna de las cuatro**: se resuelven en este orden — primero lo
que diga el artefacto, y solo si calla, el valor por defecto. Lo que salga de un valor por defecto (no del
artefacto) se **marca como supuesto** en el TC que lo use, para que quien lo ejecute sepa qué no estaba
especificado.

| Pregunta | Se resuelve así |
|----------|-----------------|
| **Entorno de referencia** | El que declare el artefacto; si no declara ninguno, **desarrollo**. Es el entorno donde se ejecutan las pruebas de una funcionalidad aún no implementada, y el único que se puede asumir sin riesgo: dar por hecho staging o producción llevaría a TCs con URLs y datos que nadie autorizó. |
| **Roles de usuario involucrados** | Los que se **infieran del artefacto** (de los criterios, la narrativa o las precondiciones). Si no se infiere ninguno, redactar el TC sin rol específico en vez de inventar uno. |
| **Datos de prueba** | **Proponerlos dentro del TC**, marcados `[propuesto]` como ya exige el Paso 4. Nunca dar por existente un juego de datos que el artefacto no nombra. |
| **Escenarios de error críticos** | Los que el **artefacto detalle**, más los que se deriven de las perspectivas de error y límite del Paso 3. No inventar prioridades de negocio que nadie escribió. |

Si al aplicar un valor por defecto se detecta una **ambigüedad que haría el TC incorrecto** —no meramente
incompleto—, sí se pregunta: `askDetails: false` suprime la entrevista estándar, no la obligación de no
escribir un caso de prueba que se sabe erróneo.

---

## Paso 3 — Generar casos de prueba

Por cada criterio del artefacto —**todos**, salvo que el usuario haya pedido explícitamente un subconjunto—, analizar cuántos TCs son necesarios según la información del artefacto, lo resuelto en el Paso 2 (entrevista o valores por defecto) y la complejidad del escenario. No hay un número fijo: un criterio simple puede requerir un solo TC; uno complejo puede necesitar varios. Las tres perspectivas sirven como guía de cobertura mínima, no como límite:

| Perspectiva | Qué cubre | Ejemplo de slug |
|-------------|-----------|-----------------|
| **Happy path** | Flujo exitoso con datos válidos; el criterio se cumple completamente. | `login-credenciales-validas-happy` |
| **Error** | Entrada inválida, permiso denegado, servicio caído, o cualquier desvío que el sistema debe manejar con un error controlado. | `login-password-incorrecto-error` |
| **Límite** | Valores en el borde del dominio: máximo/mínimo permitido, longitud exacta, fecha límite, concurrencia, campo vacío. | `nombre-255-caracteres-limite` |

Si dentro de una perspectiva hay múltiples escenarios distintos que vale la pena distinguir (p. ej., dos tipos de error con comportamientos diferentes), crear un TC por escenario en lugar de agruparlos. Si una perspectiva no aplica al criterio, omitirla sin necesidad de justificar salvo que sea evidente que debería existir y se descarta por alguna razón concreta.

### Numeración y nombres de archivo

> Reglas comunes de identificadores y secuenciales: [`../../reference/artifacts.md`](../../reference/artifacts.md). Lo específico de los TC:

- **Sin tracker externo vinculado**: el secuencial `XXX` (tres dígitos: 001, 002, …) es por artefacto padre, siguiendo el orden criterio-a-criterio (happy → error → límite). Si la carpeta `test-cases/` ya existe con TCs previos, leer los archivos presentes, determinar el número más alto y continuar desde el siguiente. El escaneo se hace sobre el `test-cases/` del padre **realmente resuelto**, no sobre una ruta activa que se dé por vacía sin haberla comprobado: si el padre no aparece ahí, la regla de artefacto archivado ya obligó a parar (ver [Selección del artefacto](#selección-del-artefacto)). Reiniciar en `001` dentro de una carpeta recién creada porque «no había nada» duplicaría identificadores.
- **Con la integración activa**: `XXX` es el identificador que asigna ese proveedor al work item «Test Case» creado; su formato exacto (numérico, con o sin padding, etc.) lo define el archivo de referencia del proveedor. Ver [Resolución de la integración con el gestor de proyectos](#resolución-de-la-integración-con-el-gestor-de-proyectos).
- No regenerar TCs ya existentes salvo instrucción explícita del usuario.
- Nombre de archivo: `TC-XXX-{slug}.md`, donde el slug sigue el patrón `{criterio-resumido}-{perspectiva}` (ver columna Ejemplo arriba). Un TC por archivo.
- El nombre completo del archivo (`TC-XXX-{slug}.md`) y, si hay un tracker externo vinculado, el título usado al crear el work item deben respetar cualquier límite de longitud propio de ese sistema (ver su archivo de referencia); si el título GWT completo lo supera, usar una versión abreviada como título del work item y conservar el título completo en el encabezado del TC (`# TC-{{XXX}} — ...`).

### Estructura de cada TC

Usar `assets/test-case-template.md` para todos los campos. Reglas de llenado:

- **Artefacto padre:** el identificador del artefacto del que salen los criterios (`US-XXX`, `WI-XXX`, `FT-XXX`) o, si es externo al plugin, su identificador o su ruta. Es lo que permite reencontrar el origen de un TC leído en aislamiento; no dejarlo vacío.
- **Estado:** `Ready` al crearlo, salvo indicación contraria del usuario. Ver [Flujo: actualizar TCs existentes](#flujo-actualizar-tcs-existentes) para cuándo pasa a `Draft` u `Obsolete`.
- **Perspectiva:** registrar la perspectiva de cobertura del caso (`Happy Path`, `Error` o `Límite`), coherente con el sufijo del slug del archivo. No confundir con el o los tipos de prueba del campo Tipo de prueba (Unit/Integration/E2E…).
- **Título descriptivo:** redactarlo en formato Given–When–Then (GWT), **respetando el idioma del artefacto origen**: en español usar `Dado {{contexto/precondición}}, Cuando {{acción/evento}}, Entonces {{resultado esperado}}`; en inglés usar `Given {{context/precondition}}, When {{action/event}}, Then {{expected result}}`. Debe describir el escenario concreto que valida el TC, coherente con las precondiciones, los pasos y el resultado esperado final.
- **Criterio de aceptación:** referenciar el identificador del criterio **exactamente como aparece en el artefacto origen** (`AC-012`, `1.3`, `R-3`…). **No normalizar ni reescribir** el identificador a otro formato: el vínculo de trazabilidad debe ser buscable literalmente en el artefacto. Este campo no puede estar vacío ni ser genérico.
- **Tipo de prueba:** declarar la **intención de diseño** del caso, no su estado de ejecución. Como los TC se escriben **antes de implementar**, el valor es `Manual` (no se automatiza, requiere ejecución humana por diseño) **o** uno o varios tipos de entre `Unit`, `Integration`, `API Test`, `Visual Test`, `E2E`, separados por coma y ordenados de menor a mayor nivel (p. ej. `Unit, E2E`) — ver la tabla siguiente para inferirlos. `Manual` no se combina con tipos. Este campo es la fuente que consume `trace-validate` para distinguir "manual por diseño" de "pendiente de automatizar"; no dejarlo vacío. Ante la duda entre `Manual` y automatizable, o sobre qué tipo(s) asignar, preguntar al usuario.
  - Para determinar el o los tipos de prueba (cuando el valor no es `Manual`), recorrer esta tabla de arriba hacia abajo **evaluando cada fila de forma independiente** — a diferencia de una tabla de decisión que se detiene en la primera coincidencia, aquí se **acumulan todos los tipos cuya pregunta aplique**: un mismo TC puede necesitar más de un tipo (p. ej. una API que conviene cubrir tanto a nivel de unidad como end-to-end).

    | Pregunta | ¿Aplica? → agrega |
    |----------|--------------------|
    | ¿Puede probarse de forma aislada, sin dependencias externas ni servicios reales? | Unit |
    | ¿Necesita verificar la interacción real entre dos o más componentes/servicios (DB, colas, otros servicios)? | Integration |
    | ¿Solo verifica el contrato de un endpoint (request/response), sin recorrer la lógica interna completa? | API Test |
    | ¿Solo valida la apariencia visual (layout, estilos, snapshots)? | Visual Test |
    | ¿Debe validar la experiencia completa del usuario de punta a punta? | E2E |

    El valor final del campo es la lista de tipos marcados como aplicables, escrita de menor a mayor nivel según el orden de la tabla (`Unit, Integration, API Test, Visual Test, E2E`). Si ninguna pregunta aplica, reconsiderar si el caso es en realidad `Manual`. Para los TC `Manual` no aplica ningún tipo (el campo queda solo en `Manual`).
- **Work Item (<sistema>):** enlace markdown al work item creado — solo si el TC se creó vía el tracker vinculado (etiqueta y formato exactos en su archivo de referencia, p. ej. `Work Item (ADO)` en `references/azure-devops.md`); omitir la línea si no aplica.
- **Prioridad:** derivar del impacto del criterio en el negocio: Alta si el criterio es bloqueante o afecta seguridad/datos; Media si es funcional importante; Baja si es edge case o cosmético. Si no hay suficiente contexto, preguntar al usuario.
- **Creado por:** usar `git config user.name` del repositorio. Si no está disponible, dejar el campo vacío.
- **Precondiciones:** ser específico — incluir estado del sistema, datos existentes y permisos requeridos.
- **Datos de prueba:** usar los confirmados en el Paso 2 o, con `askDetails: false`, los propuestos según los [valores por defecto](#valores-por-defecto-askdetails-false); si se proponen, marcarlos con `[propuesto]`.
- **Pasos:** acciones atómicas y observables; cada fila incluye actor + acción + resultado esperado del paso.
- **Resultado esperado final:** estado observable del sistema (UI, código HTTP, mensaje, evento publicado), no estado interno.

---

## Paso 4 — Guardar y reportar

1. Crear la carpeta `test-cases/` si no existe. Si la integración con el gestor de proyectos está activa (ver [Resolución de la integración con el gestor de proyectos](#resolución-de-la-integración-con-el-gestor-de-proyectos)), los work items ya deben estar creados y sus identificadores resueltos antes de este paso.
2. Escribir cada `TC-XXX-{slug}.md` en la ruta correcta según la tabla de Selección del artefacto. Guardar cada TC con `Estado: Ready` salvo que el usuario indique lo contrario.
3. Crear o actualizar el índice `test-cases/README.md` con una tabla que liste **todos** los TCs de la carpeta (los recién creados más los que ya existieran), ordenados por número de TC. La tabla lleva estas columnas:

   | TC | Perspectiva | Tipo de prueba | Estado | Prioridad | Criterio de aceptación |
   |----|-------------|----------------|--------|-----------|------------------------|
   | [TC-001](./TC-001-{slug}.md) | Happy Path | Unit, E2E | Ready | Alta | AC-001 |

   Reglas del índice:
   - **TC:** ID enlazado por ruta relativa a su archivo `TC-XXX-{slug}.md`.
   - **Perspectiva**, **Tipo de prueba**, **Estado** y **Prioridad:** copiar el valor tal como quedó en el encabezado del TC (Tipo de prueba se copia tal cual, con todos los tipos separados por coma si son varios).
   - **La columna `Estado` no es opcional:** `work-implement` construye su matriz de alcance desde este índice y filtra por ella (`Ready` se automatiza, `Draft` vuelve a `test-define`, `Obsolete` se descarta), y `trace-validate` la usa para decidir si un TC cuenta como cobertura plena. Sin esa columna, el consumidor tendría que abrir los TCs uno a uno.
   - **Criterio de aceptación:** mostrar **solo el identificador** tal como aparece en el artefacto (`AC-001`, `1.1`, …), sin el título. (En el encabezado del TC sí va identificador **+ título corto**; el índice se queda en el identificador para que la columna sea legible y comparable.)
   - Regenerar el índice completo en cada corrida para reflejar el estado actual de la carpeta; redactarlo en el idioma del artefacto origen.
4. Mostrar al usuario un resumen:
   - Criterios procesados.
   - TCs generados: ID · título · perspectiva.
   - TCs omitidos con justificación.
5. Preguntar si el usuario acepta el resultado:
   - **Acepta** → cerrar; el skill termina. Sugerir como siguiente paso `work-implement` (tipo `TC-XXX`/`FT-XXX`) para automatizar los TCs en `Ready`, y `trace-validate` para el veredicto de cobertura.
   - **Ajuste puntual** (campo incorrecto, dato de prueba erróneo) → aplicar la corrección y volver a este paso para confirmar.
   - **Cambio estructural** (nuevos criterios, redefinición del alcance) → reiniciar desde el Paso 1.

---

## Paso 5 — Actualizar el artefacto origen con la trazabilidad

Una vez guardados y aceptados los TCs, editar el artefacto origen (el `README.md` de la US, del WI o del FT, **o el archivo del artefacto externo procesado**) para dejar registrada la trazabilidad directa: bajo cada criterio de aceptación, agregar la lista de los casos de prueba que lo cubren.

> Si el artefacto no pertenece al repo (documento externo, spec de otra herramienta, archivo de solo lectura), **pedir confirmación al usuario antes de modificarlo**; si no autoriza la edición, omitir este paso y reportar la trazabilidad en el resumen y en el índice `test-cases/README.md`.

Reglas:

- La **única** modificación permitida sobre el artefacto es agregar esta línea de trazabilidad. No reescribir, reordenar ni alterar el texto de los criterios ni ninguna otra sección.
- Para cada criterio, inmediatamente debajo de su enunciado, agregar una línea `Casos de prueba:` con los TCs que lo referencian, enlazados por ruta relativa a la carpeta `test-cases/`. Separar múltiples TCs con ` · `. Respetar el estilo y la indentación del documento origen (si los criterios son ítems de una lista anidada, la línea va al mismo nivel del ítem).
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

## Flujo: actualizar TCs existentes

El flujo de los Pasos 1–5 **crea** casos de prueba. Pero tres skills devuelven aquí el control para **corregir o ampliar un TC que ya existe** —`work-implement` cuando al automatizar descubre que el TC está mal (`references/test-cases.md`), y `work-research` cuando el análisis de un caso de prueba concluye que la especificación es la que falla—, y ese camino necesita su propio procedimiento: regenerar desde cero perdería el identificador, que es el vínculo de trazabilidad que sostienen el índice, la línea `Casos de prueba:` del artefacto y todos los `coverage.md`.

1. **Localizar el TC** por su identificador dentro de `test-cases/` del artefacto padre. Si el **padre** no está en su ruta activa, buscarlo bajo `docs/archive/` como en [Selección del artefacto](#selección-del-artefacto): si está archivado, **parar y avisar** — editar un TC de un trabajo ya cerrado es escribir dentro del archivo, y eso exige desarchivarlo primero. Es el caso más frecuente al llegar aquí desde una escalada de `work-implement` en modo corrección. Si el TC no aparece, parar y preguntar: no crear uno nuevo con ese ID.
2. **Entender el cambio pedido.** Quien delega debe traer el motivo (paso ambiguo, dato de prueba irreal, resultado esperado que contradice el comportamiento correcto, criterio que quedó sin cubrir). Si no viene, pedirlo; no deducirlo del código, que es circular.
3. **Aplicar el cambio conservando el identificador y el archivo.** Se editan los campos afectados; **nunca** se renumera, ni se renombra el archivo, ni se crea un TC nuevo para sustituirlo.
4. **Ajustar el `Estado`** según el desenlace:

   | Situación | `Estado` resultante |
   |-----------|---------------------|
   | El TC se corrige y queda listo para automatizar | `Ready` |
   | El TC necesita una decisión de producto que aún no está tomada | `Draft` — cuenta como cobertura **Parcial** en `trace-validate` |
   | El comportamiento que validaba ya no existe, o el criterio se eliminó | `Obsolete` — deja de contar como cobertura, pero **el archivo se conserva**: su fila sigue en la matriz de trazabilidad por auditoría |

   Es el **único** punto del plugin que emite `Draft` u `Obsolete` en un TC. Todo lo demás (el filtro de alcance de `work-implement`, la derivación de estados de `trace-validate`) los **consume**.
5. **Si el cambio añade o quita TCs de un criterio**, regenerar el índice `test-cases/README.md` (Paso 4.3) y resincronizar la línea `Casos de prueba:` del artefacto origen (Paso 5). Un TC que pasa a `Obsolete` se retira de esa línea aunque su archivo permanezca.
6. **Reportar** qué TCs cambiaron, con qué estado quedaron, y recordar que la validación de cobertura la emite `trace-validate` — que además detectará el cambio, porque su `SPEC_FINGERPRINT` cubre la carpeta del artefacto.

> **Qué no hace este flujo:** no escribe ni ajusta el código de la prueba automatizada (eso es `work-implement`), ni decide si el que estaba mal era el TC o el código de producción — esa decisión viene tomada por quien delega.

---

## Handoffs del ciclo

Posición: **definición de pruebas** — después de que el artefacto tenga criterios de aceptación, antes de automatizarlos.

| | |
|--|--|
| **Entrada** | Un artefacto con criterios de aceptación **identificados**: `US-XXX` o `WI-XXX` en `Ready` (de `work-define` / `work-plan`), un `FT-XXX` (del flujo «Analizar legado» de `work-research`), o cualquier documento externo con criterios codificados. |
| **Salida** | `test-cases/` junto al artefacto, con un `TC-XXX-{slug}.md` por caso, su índice `test-cases/README.md`, y la línea `Casos de prueba:` bajo cada criterio del artefacto origen. |
| **Siguiente paso** | **`work-implement`** en su tipo `TC-XXX` / `FT-XXX`, que automatiza los TCs en `Ready` bajo el subagente `quality-specialist`. Después, **`trace-validate`** para el veredicto de cobertura. |
| **Vuelta desde `work-implement`** | Al automatizar se descubre que el TC está mal especificado → [Flujo: actualizar TCs existentes](#flujo-actualizar-tcs-existentes). |
| **Vuelta desde `work-research`** | El análisis de un caso de prueba concluye que falla la especificación y no el código → mismo flujo de actualización. |
| **Escalada** | El artefacto no tiene criterios, o los tiene sin identificador → devolver a `work-define` (US), `work-plan` (WI) o al flujo «Analizar legado» de `work-research` (FT). No inventar criterios aquí. |

---

## Trazabilidad

Cada TC referencia exactamente un criterio de aceptación en el campo **Criterio de aceptación** del encabezado. Un TC sin ese campo completo es inválido.

La trazabilidad inversa (de un criterio a sus TCs) se obtiene buscando el identificador del criterio —en el formato del artefacto origen— en los archivos de la carpeta `test-cases/` del artefacto. La trazabilidad directa (de un criterio a sus TCs) queda registrada en el propio artefacto origen mediante la línea `Casos de prueba:` que se agrega en el Paso 5.

---

## Anti-patterns

- Generar TCs sin haber completado la entrevista del Paso 2 (incluso si parece obvio) **cuando `askDetails` es `true`**.
- **Hacer la entrevista del Paso 2 con `askDetails: false`**, aunque las respuestas parezcan valiosas: ese valor es la instrucción de no preguntar. Lo que se hace en su lugar es aplicar los valores por defecto y **marcar los supuestos** en los TC, no callarlos.
- Confundir `askDetails` con el alcance: `false` suprime las preguntas de clarificación, **no** reduce los criterios cubiertos.
- Crear un TC que cubra más de un criterio de aceptación.
- **Preguntar al usuario si quiere cubrir todos los criterios o solo algunos.** Por defecto se cubren **todos**; un subconjunto solo se genera cuando el usuario lo pidió por su cuenta, sin que el skill se lo ofrezca.
- **Dejar un criterio sin TC en una corrida de alcance completo** — aunque parezca trivial, redundante o difícil de probar. Si de verdad no admite un caso de prueba, generar igual el TC y dejar constancia del motivo, en vez de omitirlo en silencio.
- Omitir una perspectiva que evidentemente debería existir sin dejar constancia del motivo (una perspectiva que no aplica al criterio puede omitirse sin justificación; ver Paso 3).
- Dejar el campo **Criterio de aceptación** vacío o con un valor genérico ("criterio 1").
- Reutilizar un número de secuencia ya existente en `test-cases/`.
- Dejar el índice `test-cases/README.md` desactualizado tras crear o regenerar TCs (debe reflejar siempre todos los TCs de la carpeta).
- Regenerar TCs existentes sin instrucción explícita del usuario. Cuando otro skill devuelve el control para corregir uno, el camino es el [flujo de actualización](#flujo-actualizar-tcs-existentes): se edita conservando el identificador, no se rehace.
- **Renumerar o sustituir un TC por otro con ID nuevo** al corregirlo: rompe el índice, la línea `Casos de prueba:` del artefacto y todos los `coverage.md` que lo citaban.
- **Borrar el archivo de un TC que dejó de aplicar** en lugar de marcarlo `Obsolete`: la fila se conserva por trazabilidad, aunque ya no cuente como cobertura.
- Modificar el artefacto origen más allá de agregar la línea `Casos de prueba:` bajo cada criterio en el Paso 5; cualquier otro cambio al texto de los criterios o a otras secciones está prohibido.
- **Rechazar un artefacto por no seguir las convenciones de este plugin** (nombre `US-XXX`/`WI-XXX`/`FT-XXX`, ubicación en `docs/specs/`, campo `Estado:`, identificadores en formato `AC-XXX`). El único requisito es que los criterios tengan identificador codificado; el formato es indiferente.
- **Renombrar o normalizar los identificadores de criterio** del artefacto origen (p. ej. convertir `1.1` en `AC-001`) al escribir los TCs o el índice: se referencian verbatim.
- Pedir al usuario que agregue un campo `Estado:` a un artefacto que no pertenece al plugin.
- Escribir código de prueba (Jest, Cypress, etc.); ese trabajo corresponde a `work-implement` (tipos `TC-XXX` / `FT-XXX`, ejecutados bajo `quality-specialist`).
- Continuar si el artefacto **declara** un estado distinto de `Ready`, o si no tiene criterios de aceptación.
- Asignar identificadores de criterio automáticamente; si faltan, parar y pedirle al usuario que los agregue en el artefacto.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta de preguntas estructuradas.
- Crear el archivo TC local con ID secuencial cuando el repo tiene un tracker externo vinculado y su herramienta MCP está disponible — siempre crear el work item en el tracker primero y usar su identificador (ver el archivo de referencia del sistema).
- Omitir el campo `Work Item (<sistema>)` en el encabezado del TC cuando fue creado vía MCP.
- Ignorar los límites de formato (p. ej. longitud de título) que imponga el sistema vinculado; ver su archivo de referencia.