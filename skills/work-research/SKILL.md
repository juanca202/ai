---
name: work-research
description: >-
  Investigar y sintetizar hallazgos en un informe estructurado (RS-XXX). Skill genérico con seis flujos según la entrada: investigación libre de un tema; decisiones pendientes de un US-XXX/TK-XXX/WI-XXX antes de planificar; análisis de un issue o bug (reproducción, causa raíz y diagnóstico de pruebas, con entregable WI de tipo bug-fix); auditoría de un caso de prueba TC-XXX; análisis de legado (descubrir features FT-XXX y sus pruebas desde código existente); y discovery de migración entre proyectos. Activar cuando el usuario pida "investiga", "research", "¿es viable?", "¿cómo funciona X?", "¿qué impacto tiene?", "compara opciones", "¿qué falta por decidir?", "hay un bug", "falla en producción", "analiza el bug #1234", "revisa este caso de prueba", "analiza este código legacy", "ingeniería inversa de requisitos", "migración entre proyectos", o mencione "RS-XXX". Si hay un artefacto o un identificador del gestor de proyectos en contexto, usarlo sin preguntar.
license: MIT
---

# Skill: Investigación de trabajo

Skill **genérico** de investigación. Recopila información, la sintetiza y la
persiste de forma estandarizada. Corre **seis flujos** según la entrada; todos
comparten el mismo esqueleto —capturar intención → cargar contexto → investigar →
sintetizar → guardar— y la **misma salida estandarizada**, con una excepción
declarada: *Analizar issue*.

> **Propósito:** resolver dudas y preparar el terreno antes de especificar,
> planificar o implementar. La investigación alimenta decisiones; **no** modifica
> artefactos existentes ni genera código. Tampoco genera el plan de
> implementación: ese paso lo continúan `work-define` o `work-plan`.

Este archivo contiene **solo lo transversal**. El procedimiento de cada flujo vive en
su propio archivo de `references/`, que se carga **únicamente** cuando ese flujo se
selecciona.

---



## Flujos

El flujo se determina por la **entrada** en el Paso 1. **No mezclar flujos** en una
misma ejecución: si la investigación revela que hace falta otro, se cierra el actual y
se ofrece el siguiente como *handoff*.


| #   | Flujo                              | Entrada                                                                   | Qué produce                                                                                                                                                                                       | Procedimiento                                                  |
| --- | ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | **Investigación libre**            | Un tema, **sin artefacto**                                                | Hallazgos y recomendación en el dominio que corresponda: Producto, Arquitectura, Técnica o Cambio                                                                                                 | `[references/free/flow.md](references/free/flow.md)`           |
| 2   | **Analizar decisiones pendientes** | Un `US-XXX`, `TK-XXX` o `WI-XXX`                                          | Lagunas del artefacto y **decisiones pendientes por tomar**, cada una con opciones, trade-offs y recomendación                                                                                    | `[references/decisions/flow.md](references/decisions/flow.md)` |
| 3   | **Analizar issue**                 | La descripción de un **defecto** o el código de un bug                    | Reproducción, causa raíz, **diagnóstico de la situación de las pruebas** y remediación como ciclo 🔴 TEST FAIL → corregir código → 🟢 TEST PASS                                                   | `[references/issue/flow.md](references/issue/flow.md)`         |
| 4   | **Analizar test case**             | Un `TC-XXX`                                                               | Auditoría del caso de prueba: si verifica realmente su requisito, si está completo, si podría pasar habiendo un bug, y si la implementación lo satisface                                          | `[references/test-case/flow.md](references/test-case/flow.md)` |
| 5   | **Analizar legado**                | **Código existente** sin requisitos o con cobertura de pruebas inadecuada | `discovery` de ingeniería inversa (artefactos técnicos → casos de uso → capabilities → features cohesivos → reglas de negocio) y, por cada feature, un `FT-XXX` con sus casos de prueba inferidos | `[references/legacy/flow.md](references/legacy/flow.md)`       |
| 6   | **Analizar migración**             | Un **proyecto origen** y uno **destino**                                  | `discovery` (mapeo tecnológico, verificación, golden master, riesgos) y **preparación de validación**; dimensiona el cambio y hace *handoff* a `work-define` (grande) o `work-plan` (pequeño)     | `[references/migrate/flow.md](references/migrate/flow.md)`     |


Cada flujo se identifica **por su nombre**, nunca por su número de fila: el orden de la
tabla es de lectura, no un identificador.

Los cuatro flujos de análisis se solapan en sus señales de entrada; los criterios de
desempate están en [Desempates](#desempates), dentro del Paso 1.

---



## Salida estandarizada

Toda investigación genera **una carpeta** `research/RS-XXX-{slug}/` con un
`README.md` como **informe principal**, redactado con
`[assets/research-template.md](assets/research-template.md)`. Puede contener
**archivos adicionales** en la misma carpeta si el flujo los define, siempre
referenciados desde el `README.md`.

**Dónde vive la carpeta** `research/`**:**


| Caso                                    | Ubicación                                                                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artefacto vinculado `US-XXX` / `TK-XXX` | `docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}/`                                                                                   |
| Artefacto vinculado `WI-XXX`            | `docs/specs/work-items/WI-XXX-{kebab-case}/research/RS-XXX-{slug}/`                                                                                 |
| Artefacto vinculado `FT-XXX`            | `docs/specs/features/FT-XXX-{slug}/research/RS-XXX-{slug}/`                                                                                         |
| Sin artefacto vinculado                 | `docs/specs/research/RS-XXX-{slug}/` (en la migración, en el **proyecto destino**; en el análisis de legado, en el proyecto que contiene el código) |

> **Artefacto archivado.** Si la carpeta de un `US-XXX`/`TK-XXX`/`WI-XXX`/`RS-XXX` no aparece en su ruta activa, buscarla bajo `docs/specs/archive/` (`archive/user-stories/`, `archive/work-items/`, `archive/research/`) antes de darla por inexistente: `work-integrate` y `pr-create` la mueven ahí al cerrar el trabajo. **Nunca** recrearla en la ruta activa. Lo que se haga con el hallazgo depende de dónde escriba el flujo:
>
> - **Flujos que escribirían el `RS-XXX` dentro del `research/` del artefacto** — solo *Analizar decisiones pendientes*: **parar y avisar**. Un trabajo cerrado no tiene decisiones pendientes que resolver, y retomarlo exige desarchivarlo, decisión del usuario.
> - **Flujos que lo leen como contexto y escriben fuera** (*Analizar issue*, que produce un dossier y un `WI-XXX` nuevo; *Investigación libre*): **continuar**. Leer un artefacto archivado es siempre legítimo — investigar un bug de algo ya entregado es el caso normal.
> - ***Analizar test case*** **cambia de grupo según el padre:** con padre activo escribe en su `research/`; con padre **archivado** no escribe dentro pero **tampoco para** — lee el padre como contexto y guarda el `RS-XXX` en `docs/specs/research/`, la ruta que su propia tabla ya reserva para un TC sin padre local. Auditar el caso de prueba de un trabajo entregado es legítimo y frecuente; ver [`references/test-case/flow.md`](references/test-case/flow.md).
>
> Ver [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).


**Archivos adicionales por flujo:**


| Flujo              | Archivos adicionales                                    | Plantillas                                                                                                                                                       |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analizar test case | `analysis.md`                                           | `[assets/test-case/analysis-template.md](assets/test-case/analysis-template.md)`                                                                                 |
| Analizar legado    | `discovery.md`                                          | `[assets/legacy/discovery-template.md](assets/legacy/discovery-template.md)`                                                                                     |
| Analizar migración | `discovery.md`, `validation.md` y carpeta `validation/` | `[assets/migrate/discovery-template.md](assets/migrate/discovery-template.md)`, `[assets/migrate/validation-template.md](assets/migrate/validation-template.md)` |




### Salidas fuera de `research/`

- **Analizar legado** crea además, por cada feature descubierto, una carpeta
`docs/specs/features/FT-XXX-{slug}/` con su `README.md`
(`[assets/legacy/feature-template.md](assets/legacy/feature-template.md)`) y sus
casos de prueba vía `test-define`, en su propio subárbol y con numeración
independiente. Condiciones y doctrina en
`[references/legacy/flow.md](references/legacy/flow.md)`.
- **Analizar issue** es la **única excepción a la salida estandarizada: no crea un**
`RS-XXX`**.** Su entregable es el `WI` de tipo `bug-fix` que crea `work-plan` en
`docs/specs/work-items/WI-XXX-{kebab-case}/README.md`. Este skill produce el
**dossier de bug** con
`[assets/issue/diagnosis-template.md](assets/issue/diagnosis-template.md)`, lo
presenta y lo pasa como insumo del *handoff*. Solo si el usuario lo pide
explícitamente se guarda además un `RS-XXX` en `docs/specs/research/`.

---



## Entrada desde el gestor de proyectos (condicional)

El repositorio puede estar vinculado a un gestor de proyectos / sistema de seguimiento
de trabajo (Azure DevOps, Jira u otro). Cuando lo está, **cualquier artefacto que el
usuario pase por su código o URL** —no solo un bug— se lee vía MCP y **enruta al flujo
que corresponda a su tipo**. Para `work-research` la integración es de **solo
lectura**: trae contexto; no crea ni modifica work items.

Este skill solo resuelve **si** hay vinculación y **qué** referencia cargar; todo el
detalle propio de cada sistema (herramienta MCP, nombres de campos, tipos de work item,
configuración de conexión) vive exclusivamente en su archivo de `references/`.

1. **Detectar** la vinculación leyendo `.agents/MEMORY.md` (raíz del repo): buscar la
  señal `work_item_tracking: <sistema>` con valor no vacío (p. ej. `azure_devops`).
2. **Si NO hay señal** → el repo no usa un gestor externo. Trabajar con lo que aporte
  el usuario y con el repo; **no** leer ninguna referencia de gestor.
3. **Si hay señal** → cargar `references/<sistema>.md` (p. ej.
  `[references/azure-devops.md](references/azure-devops.md)` para
   `work_item_tracking: azure_devops`) y seguir **únicamente** sus pasos para obtener el
   artefacto. Si no existe archivo de referencia para ese sistema, o su MCP no está
   conectado, informarlo y continuar con la información que aporte el usuario —
   **nunca detener la investigación por esto**.

**Enrutado por tipo de artefacto** (los nombres exactos de cada tipo los define el
archivo de referencia del sistema):


| Lo que se pasa                                   | Flujo                                                       |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Historia de usuario / feature / épica → `US-XXX` | **Analizar decisiones pendientes**                          |
| Tarea → `TK-XXX`                                 | **Analizar decisiones pendientes**                          |
| Work item de mantenimiento → `WI-XXX`            | **Analizar decisiones pendientes**                          |
| **Bug** / defecto / incidencia                   | **Analizar issue**                                          |
| **Test case** / caso de prueba                   | **Analizar test case**                                      |
| Cualquier otro tipo                              | Preguntar al usuario qué espera de él antes de elegir flujo |


> Si el artefacto existe **a la vez** en el gestor y en el repo, leer ambos: el
> documento local es la especificación; el work item aporta estado, comentarios,
> adjuntos y decisiones que nunca llegaron al documento. Si discrepan, señalarlo como
> hallazgo en lugar de elegir uno por cuenta propia.

---



## Cómo preguntar al usuario

Toda pregunta va por la **herramienta de preguntas estructuradas** (opciones
tappables), no como prosa libre. Si el cliente no la expone, formular en prosa con
opciones enumeradas. Si una herramienta necesaria no está disponible (el MCP del
gestor de proyectos, el MCP de Chrome en una migración), pedir al usuario que aporte
los insumos manualmente en lugar de detenerse.

No preguntar lo que ya consta en el artefacto, en el work item del gestor o en la
conversación. Máximo 2-3 preguntas por ronda.

---



## Modo de ejecución

Si este skill es invocado **dentro de una sesión activa de** `work-implement` (el
agente principal está ejecutando una TK o un WI), ejecutar la investigación como
**subagente o tarea delegada**:

- Lanzar la investigación usando la herramienta de subagente/tarea del cliente.
- El subagente ejecuta el flujo de forma autónoma.
- Al terminar, **solo devuelve al agente principal**: ruta del RS guardado + resumen
ejecutivo de 2-3 oraciones. En *Analizar issue* no hay RS: devuelve el resumen del
diagnóstico y, si el *handoff* ya se ejecutó, la ruta del `WI` creado.
- El agente principal continúa sin interrumpir el flujo de la sesión.

Si no hay sesión de implementación activa, ejecutar de forma interactiva con el
usuario (flujo normal).

---



## Resolución de idioma

Redactar el informe y los mensajes al usuario en el idioma del mensaje de entrada.
Si hay artefacto o proyecto vinculado, usar el idioma de ese contexto. Ante
conflicto, preguntar.

---



## Paso 1 — Capturar la intención y elegir el flujo

Evaluar la entrada **en este orden** y quedarse con la primera coincidencia:

1. **¿Es un identificador del gestor de proyectos** (`#4821`, una URL del gestor, un
  código con prefijo propio del sistema)? → resolver la vinculación
   ([Entrada desde el gestor de proyectos](#entrada-desde-el-gestor-de-proyectos-condicional)),
   **leer el work item por MCP** y enrutar según su tipo con la tabla de esa sección.
   Leer antes de preguntar: lo que ya está en el work item no se pregunta.
2. **¿Es un caso de prueba** (`TC-XXX`, "revisa este test", "¿este caso de prueba está
  bien?", "¿el test cubre esto?")? → **Analizar test case**.
3. **¿Describe un comportamiento defectuoso** —algo que el sistema hace y no debería, o
  deja de hacer— o un bug reportado? Señales: "hay un bug", "falla", "error en
   producción", "no funciona X", "¿por qué devuelve Y?", un stack trace, una captura de
   error. → **Analizar issue**. Tiene prioridad aunque haya un `US`/`WI` en contexto:
   ese artefacto pasa a ser la referencia del *comportamiento esperado*, no el objeto de
   la investigación.
4. **¿Hay un artefacto** `US-XXX` **/** `TK-XXX` **/** `WI-XXX` **/** `FT-XXX` mencionado o
  implícito? → **Analizar decisiones pendientes**. Cargarlo como contexto sin
   preguntar; si hay ambigüedad (número sin prefijo, referencia vaga), preguntar. Un
   `FT-XXX` documenta código ya implementado: sobre él las «decisiones pendientes»
   suelen ser de cobertura o de especificación incompleta, no de diseño.
5. **¿La entrada es código existente que hay que "documentar hacia atrás"** —descubrir
  qué hace y crear features y pruebas desde él porque no tiene requisitos escritos o su
   cobertura es inadecuada? Señales: "analiza este código", "ingeniería inversa", "no
   tenemos requisitos/pruebas de este módulo". → **Analizar legado**. Si no está claro
   qué código entra en el alcance, pedirlo; no inventar comportamiento ausente.
6. **¿Hay un proyecto origen y uno destino** (migrar código, features o dependencias
  entre dos proyectos)? → **Analizar migración**. Si falta identificar alguno de los
   dos, pedirlo; no inventar rutas ni stacks.
7. **Si nada de lo anterior aplica** → **Investigación libre**.

Una vez elegido el flujo, **cargar su archivo de** `references/` y seguirlo. No leer
las referencias de los demás flujos.

### Desempates

Cuando una entrada dispara dos reglas, manda el **objeto de la duda**, no el orden de
la lista:


| Ambigüedad                               | Criterio                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test case vs. issue**                  | Si lo dudoso es **la prueba** —si está bien planteada, si cubre lo que dice, si pasa cuando no debería— es *test case*. Si lo dudoso es **el comportamiento del sistema** y la prueba solo es la evidencia, es *issue*.                          |
| **Legado vs. issue**                     | *Legado* parte de código **sin requisitos** y documenta lo que hace; *issue* parte de un **defecto conocido**. Si al documentar aparece un bug, se ofrece *issue* como segunda ejecución, no se mezcla.                                          |
| **Legado vs. migración**                 | Manda el objetivo: **mover** el código a otro proyecto es *migración* aunque el origen sea legado (su discovery ya cubre la verificación de comportamiento); *legado* solo si el objetivo es **documentarlo y cubrirlo con pruebas** donde está. |
| **Libre vs. legado**                     | Leer código para **responder una pregunta** es *investigación libre*. Solo es *legado* si el objetivo es **producir** `FT-XXX` y sus pruebas.                                                                                                    |
| **Cualquiera vs. decisiones pendientes** | Un artefacto en contexto no gana por sí solo: si la entrada describe un defecto, una prueba dudosa o una migración, ese artefacto es **contexto**, no el objeto de la investigación.                                                             |


En cualquier flujo, antes de investigar:

- **Clarificar lagunas de alcance.** Si la entrada tiene vacíos que impedirían una
investigación de calidad (alcance impreciso, contexto faltante, restricciones no
mencionadas), resolverlos con la herramienta de preguntas estructuradas.
- **Formular la pregunta de investigación** en una oración concisa y confirmarla:
opciones [Confirmar / Ajustar / Cancelar]. No investigar hasta recibir confirmación.
Qué forma toma la pregunta según el flujo:

  | Flujo                          | La pregunta es…                                                                                                               |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
  | Investigación libre            | El tema, acotado a un dominio                                                                                                 |
  | Analizar decisiones pendientes | «¿Qué falta decidir o aclarar en para poder planificarlo/implementarlo?»                                                      |
  | Analizar issue                 | «¿Por qué ocurre y qué prueba lo demuestra?» — requiere antes el reporte normalizado mínimo (observado, esperado, disparador) |
  | Analizar test case             | «¿ verifica realmente , y la implementación lo satisface?»                                                                    |
  | Analizar legado                | «¿Qué hace hoy *<código en alcance>* y qué features y reglas implementa?»                                                     |
  | Analizar migración             | El objetivo de la migración: qué se migra y de qué origen a qué destino                                                       |


---



## Paso 2 — Cargar contexto

Qué leer y en qué orden lo define el archivo de referencia del flujo elegido. Reglas
comunes a todos:

- **Leer antes de investigar.** Nunca investigar sobre un artefacto sin haberlo abierto.
- **No duplicar investigaciones previas.** Revisar el `research/` correspondiente —y, si
la base es `docs/specs/research/`, también `docs/specs/archive/research/`—; si ya hay un
RS sobre el mismo tema, mostrarlo al usuario y partir de él.
- **Verificar contra el repo, no contra la memoria.** Stack, versiones y estructura se
comprueban en los manifiestos y el código.
- **Registrar lo que no existe.** «No hay ADR sobre esto», «no hay pruebas de este
módulo» son hallazgos, no omisiones.

---



## Paso 2.5 — Inspeccionar referencias visuales (imágenes y Figma)

Si el usuario proporcionó referencias (imágenes, capturas, enlaces a Figma) —en el
mensaje o dentro del artefacto cargado— inspeccionarlas **antes** de investigar:

1. **Abrir e inspeccionar cada referencia en detalle** (layouts, componentes,
  estados, anotaciones), no de forma superficial.
2. **Detectar lagunas** (estado no cubierto, medida no definida, comportamiento no
  anotado, texto ilegible). No asumir ni rellenar por cuenta propia.
3. **Resolver cada laguna** con la herramienta de preguntas estructuradas antes de
  continuar. No avanzar al Paso 3 con dudas pendientes.
4. Si un enlace de Figma no es accesible, pedir capturas o exportación.

---



## Paso 3 — Investigar

Ejecutar el procedimiento del archivo de referencia del flujo elegido, usando búsqueda
web, documentación oficial, repositorios públicos e inspección directa del código
cuando corresponda.

### Calidad de las fuentes (todos los flujos)

- Priorizar documentación oficial, RFC, papers, repositorios activos.
- Indicar la fecha de la fuente cuando la vigencia importa (versiones, APIs, precios).
- Si la información es contradictoria o incierta, **decirlo explícitamente** en lugar
de sintetizar como si fuera certeza.
- Todo hallazgo sobre el código cita **archivo y símbolo**. Un hallazgo sin evidencia
es una hipótesis: se marca como tal y se verifica o se descarta.

---



## Paso 4 — Sintetizar y presentar

1. Redactar el `README.md` con `assets/research-template.md`. Si no hay artefacto
  vinculado, marcar la sección **Impacto en el artefacto** como
   `N/A — investigación independiente`.
2. Redactar los archivos adicionales que defina el flujo, con sus plantillas (ver
  [Salida estandarizada](#salida-estandarizada)).
3. Presentar el informe en el chat con un resumen ejecutivo de 2-3 oraciones.
4. Preguntar (herramienta estructurada): "¿La investigación responde tu pregunta?"
  Opciones: [Sí, guardar resultado] / [Profundizar en un subtema] / [Descartar].
  - **Sí** → Paso 5, guardar con `Estado: Ready` —o `Draft` si el flujo declara
  pendientes abiertos; su referencia dice cuándo aplica.
  - **Profundizar** → investigación adicional y volver al inicio de este paso.
  - **Descartar** → no guardar; el skill termina.

> **Analizar issue:** no aplican ni el `README.md` del RS ni el Paso 5. Este flujo
> presenta su dossier y hace *handoff* con su propio cierre — ver
> `[references/issue/flow.md](references/issue/flow.md)`.

---



## Paso 5 — Guardar el informe

1. Determinar la **carpeta base** —la que contendrá las carpetas `RS-XXX-`*— según
  haya artefacto vinculado o no (ver [Salida estandarizada](#salida-estandarizada)):
   `<carpeta-del-artefacto>/research/` si lo hay, `docs/specs/research/` si no. La base
   ya incluye el segmento `research/`: no anidarlo dos veces. Si el artefacto vinculado
   resultó estar archivado, aquí ya no se llega: la regla de artefacto archivado obligó a
   parar antes.
2. Determinar el siguiente `RS-XXX` leyendo las carpetas `RS-XXX-*` existentes en esa
  base y tomando el mayor número + 1. Empezar en `001` si no hay ninguna.
   - **Si la base es `docs/specs/research/`, escanear también `docs/specs/archive/research/`**
     y tomar el mayor de las dos. `work-integrate` y `pr-create` archivan ahí las
     investigaciones sueltas que se quedan sin artefacto activo que las referencie; su
     número **sigue ocupado**, y mirar solo la ruta activa haría retroceder el contador y
     reemitir un `RS-XXX` ya usado. Ver
     [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).
3. Construir el `{slug}`: descripción corta del tema en kebab-case (p. ej.
  `viabilidad-redis-cache`, `impacto-refactor-pagos`, `orm-sequelize-a-prisma`).
4. Crear `<base>/RS-XXX-{slug}/` y escribir dentro el `README.md` con su estado
  (`Ready`, o `Draft` si quedan pendientes declarados). Añadir los archivos
   adicionales del flujo, referenciados desde el `README.md`.
5. Informar la ruta exacta donde se guardó.

> **Flujos que reservan el** `RS-XXX` **antes de presentar.** *Analizar legado* y *Analizar
> migración* necesitan la carpeta creada para escribir su `discovery.md` mientras
> investigan. En ellos, los puntos 1-4 de este paso se ejecutan **al inicio del flujo**
> y aquí solo se confirma el estado final y se informa la ruta; su referencia manda
> sobre este orden. Si el usuario **descarta** la investigación en el Paso 4, borrar la
> carpeta reservada para no dejarla huérfana ni quemar el secuencial.

---



## Numeración y nomenclatura

- **Secuencial** `XXX`**:** tres dígitos, por carpeta base de destino. Leer las carpetas
`RS-XXX-*` existentes y tomar el siguiente número. Cuando la base es
`docs/specs/research/`, el escaneo incluye `docs/specs/archive/research/`: archivar no
libera el número.
- **Slug:** kebab-case, descriptivo del tema. Máximo 5 palabras.
- **Un RS por pregunta de investigación.** Si la sesión produce varias, generar un RS
por cada una con su propio secuencial. *Excepción:* una migración con **varios
proyectos destino** escribe un RS en cada uno, con el **mismo** `{slug}` y un
secuencial común (ver `[references/migrate/flow.md](references/migrate/flow.md)`) —
sigue siendo una sola pregunta de investigación.
- **No aplica a *Analizar issue***, que no genera un `RS` (ver
[Salida estandarizada](#salida-estandarizada)).

---



## Handoffs

Este skill **alimenta** otros skills pero no los invoca automáticamente salvo donde se
indica. El detalle de cada *handoff* vive en el archivo de referencia de su flujo;
aquí queda el mapa general.


| Flujo                                       | Handoff                                                                                                                                                                                                                                                              | Cómo pasar el contexto                                                                                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Investigación libre**                     | `arch-manage`, `work-define` o `work-plan` según la conclusión                                                                                                                                                                                                               | El RS alimenta la sección «Contexto» del ADR o se referencia en el artefacto creado                                                                                                                                           |
| **Analizar decisiones pendientes**          | `work-define` (US) o `work-plan` (TK/WI)                                                                                                                                                                                                                             | El RS se referencia; el artefacto lo actualiza su skill dueño                                                                                                                                                                 |
| **Analizar issue**                          | `work-plan` (WI tipo `bug-fix`) → `work-implement`                                                                                                                                                                                                                   | Pasar el **dossier de bug** completo; el mapeo a las secciones del WI está en `[references/issue/flow.md](references/issue/flow.md)`. Si el bug ya existe en el gestor, pasar su ID y URL para **reutilizarlo** y no duplicar |
| **Analizar test case**                      | Según el veredicto: **Analizar issue** (defecto de código), `test-define` (corregir o ampliar el TC), `work-plan` (WI `test-improvement`), **Analizar decisiones pendientes** o `work-define` (requisito ambiguo o mal definido), o `trace-validate` (sin cobertura) | El `analysis.md` del RS es la referencia; la matriz de veredictos está en `[references/test-case/flow.md](references/test-case/flow.md)`                                                                                      |
| **Analizar legado**                         | Este mismo skill (crear los `FT-XXX`) → `test-define` (sus `TC-XXX`) → `trace-validate` (cobertura del código existente) → `work-implement` tipo **feature** (automatizar los `TC-XXX`)                                                                              | El `discovery.md` es la referencia; todo con procedencia «inferido desde código». Un `FT` no produce funcionalidad nueva: solo se escriben **pruebas**                                                                        |
| **Analizar migración**                      | `work-define` (cambio grande, varias US) o `work-plan` (cambio pequeño, un WI)                                                                                                                                                                                       | El `discovery.md` y el `validation.md` son la referencia; el criterio de dimensionamiento está en `[references/migrate/flow.md](references/migrate/flow.md)`                                                                  |
| **Analizar legado que detecta un bug real** | Este mismo skill, flujo **Analizar issue**                                                                                                                                                                                                                           | En vez de congelar el comportamiento defectuoso como `AC-XXX` del `FT`, abrir su diagnóstico                                                                                                                                  |


Cuando otro skill reciba un RS como insumo, leerlo desde
`research/RS-XXX-{slug}/README.md` (y sus archivos adicionales) antes de ejecutar su
propio flujo.

Al cerrar, ofrecer al usuario el *handoff* correspondiente con la referencia al RS
generado (en *Analizar issue*, con el dossier de bug).

---



## Mapa de referencias


| Necesitas…                                                                                                          | Archivo                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Procedimiento de **Investigación libre** (dominios, conclusión, handoffs)                                           | `[references/free/flow.md](references/free/flow.md)`                                                                                                             |
| Procedimiento de **Analizar decisiones pendientes** (lagunas vs. decisiones, recomendación)                         | `[references/decisions/flow.md](references/decisions/flow.md)`                                                                                                   |
| Procedimiento de **Analizar issue** (reproducción, matriz de diagnóstico de pruebas, ciclo rojo→verde, mapeo al WI) | `[references/issue/flow.md](references/issue/flow.md)`                                                                                                           |
| Procedimiento de **Analizar test case** (las cinco preguntas, implementación, matriz de veredictos)                 | `[references/test-case/flow.md](references/test-case/flow.md)`                                                                                                   |
| Procedimiento de **Analizar legado** (artefactos → CU → capabilities → features → BR, crear `FT-XXX`)               | `[references/legacy/flow.md](references/legacy/flow.md)`                                                                                                         |
| Procedimiento de **Analizar migración** (discovery, validación, dimensionamiento y handoff)                         | `[references/migrate/flow.md](references/migrate/flow.md)`                                                                                                       |
| Preparación de casos de Golden Master (migración)                                                                   | `[references/migrate/golden-master-testing.md](references/migrate/golden-master-testing.md)`                                                                     |
| Estrategias de migración incremental                                                                                | `[references/migrate/migration-strategies.md](references/migrate/migration-strategies.md)`                                                                       |
| Leer un artefacto del gestor de proyectos vía MCP y enrutarlo                                                       | `references/<sistema>.md` (p. ej. `[references/azure-devops.md](references/azure-devops.md)`) — solo si `.agents/MEMORY.md` declara `work_item_tracking`         |
| Plantilla del `README.md` (informe principal)                                                                       | `[assets/research-template.md](assets/research-template.md)`                                                                                                     |
| Plantilla del `analysis.md` (Analizar test case)                                                                    | `[assets/test-case/analysis-template.md](assets/test-case/analysis-template.md)`                                                                                 |
| Plantilla del dossier de bug (Analizar issue) y su mapeo al `WI`                                                    | `[assets/issue/diagnosis-template.md](assets/issue/diagnosis-template.md)`                                                                                       |
| Plantillas del análisis de legado (`discovery.md`, `FT-XXX`)                                                        | `[assets/legacy/discovery-template.md](assets/legacy/discovery-template.md)`, `[assets/legacy/feature-template.md](assets/legacy/feature-template.md)`           |
| Plantillas de la migración (`discovery.md`, `validation.md`)                                                        | `[assets/migrate/discovery-template.md](assets/migrate/discovery-template.md)`, `[assets/migrate/validation-template.md](assets/migrate/validation-template.md)` |


---



## Anti-patterns

Transversales a todos los flujos. Los específicos de cada uno viven en su archivo de
referencia.

- Investigar sin formular y confirmar antes la pregunta de investigación.
- **Mezclar dos flujos en una misma ejecución** en lugar de cerrar uno y ofrecer el
otro como *handoff*.
- Cargar los archivos de referencia de flujos que no se han seleccionado.
- Elegir *Investigación libre* por descarte sin haber comprobado antes si la entrada
era un artefacto, un issue, un test case, código legado o una migración.
- Preguntar al usuario datos que ya constan en el artefacto o en el work item del
gestor de proyectos cuando su MCP está disponible.
- Crear o modificar work items en el gestor de proyectos desde este skill: aquí solo
se lee.
- Presentar hallazgos sin indicar fuente o fecha cuando la vigencia importa.
- Sintetizar información contradictoria como si fuera consenso.
- Afirmar algo sobre el código sin citar archivo y símbolo.
- Modificar el artefacto vinculado (README de US/WI, TK, TC) durante la investigación.
- **Generar el plan de implementación aquí:** los flujos producen discovery,
diagnóstico o veredicto; el plan lo crean `work-define` o `work-plan`.
- Escribir código de aplicación o de pruebas: eso es `work-implement`.
- Guardar el RS sin haber presentado antes el informe al usuario.
- Reutilizar un número de secuencia ya existente en la carpeta base.
- Guardar el informe como un archivo suelto en vez de la carpeta
`research/RS-XXX-{slug}/README.md`.
- Pasar por alto imágenes o enlaces de Figma referenciados sin inspeccionarlos.
- Lanzar preguntas como prosa libre cuando el cliente expone herramienta estructurada.

