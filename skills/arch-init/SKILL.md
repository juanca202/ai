---
name: arch-init
description: >-
  Identifica el punto de partida de un proyecto (sin código / con código base / con implementación) e inicializa lo que falte de su harness multi-agente: repo git —o, si la solución abarca varios repositorios, un repo de especificaciones que los agrega como submódulos—, placeholders `AGENTS.md`/`CLAUDE.md`/`.agents/MEMORY.md`/`.sdd-devkit/settings.json`/`docs/adr/README.md`/`docs/standards/README.md`/`README.md` (raíz, con descripción del proyecto), el stack tecnológico (investigando con `work-research` si hace falta), candidatos de ADR/estándares (vía `arch-discover` si ya hay implementación, por repositorio si es multi-repo) y la compuerta de calidad (vía `quality-check`). Cierra actualizando el stack y sugiriendo `work-define` o `work-plan`. Activar al pedir inicializar, bootstrapear o preparar uno o varios repos de una misma solución para agentes, configurar su harness, crear `AGENTS.md`/`CLAUDE.md`/`MEMORY.md` desde cero, o mencionar "arch-init", "/arch-init", "inicializa el harness".
license: MIT
---

# Skill: Inicialización del harness de agentes (arch-init)

Inicializa, en un proyecto **en cualquier punto de partida**, las primeras instrucciones persistentes y compatibles con múltiples agentes: repositorio git, los archivos base del harness (`AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`, `docs/adr/README.md`, `docs/standards/README.md`, `README.md` de la raíz), un stack tecnológico definido, una compuerta de calidad mínima y las decisiones relevantes documentadas como ADR/estándares.

> **Completa siempre lo que falta.** El punto de partida que identifica el Paso 1 — sin código, con código base, o con implementación — solo decide **cómo** se llega a cada pieza (p. ej. un stack ya detectado salta el Paso 2). El resultado al cerrar es siempre el mismo checklist completo, sin importar de dónde partió.
>
> **Alcance:** este skill **bootstrapea** el harness — es el primer paso de SDD Devkit, antes de que exista nada que `arch-discover`, `arch-manage`, `arch-audit` o `quality-check` puedan leer, auditar o revisar. No reemplaza a `work-define` / `work-plan` / `work-implement` (historias y tareas) ni reimplementa la lógica de esos skills — los invoca cuando corresponde. Se ejecuta normalmente **una vez** por proyecto; volver a ejecutarlo sobre uno ya inicializado solo completa lo que falte (ver [Idempotencia](#idempotencia--reejecución)).
>
> **Orden con compuertas:** no se avanza de paso mientras el anterior no esté resuelto. La sección `# Stack tecnológico` de `AGENTS.md` se deja con su comentario de plantilla hasta el cierre (Paso 5) — no se rellena antes, aunque el stack ya se conozca desde el Paso 1 o el Paso 2.

## Relación con el resto de SDD Devkit

`arch-init` es el único punto de entrada que **crea** `AGENTS.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`, `docs/adr/README.md`, `docs/standards/README.md` y el `README.md` de la raíz desde cero — el resto de skills de arquitectura los dan por existentes (o toleran que estén vacíos):

| Skill | Qué asume/hace, y cómo se relaciona con `arch-init` |
| ----- | ----------------------------------------------------- |
| `arch-manage` | Crea/actualiza ADRs y estándares de dominio. `arch-init` lo invoca en el Paso 5 con los candidatos que se aceptaron en el Paso 4 — nunca redacta un ADR/estándar por su cuenta. |
| `arch-discover` | Infiere ADR/estándares candidatos **del código ya existente** y los crea por su cuenta (su Fase 5 invoca `arch-manage`). `arch-init` lo invoca **completo** en el Paso 4.1 cuando el punto de partida es "con implementación" — no reimplementa esa inspección ni repite su creación de artefactos. |
| `arch-audit` | Audita `docs/standards/` y `AGENTS.md` contra el repo — de `AGENTS.md` toma también el contexto de stack (`# Stack tecnológico`). `arch-init` es lo que le da a `arch-audit` algo que auditar la primera vez. |
| `quality-check` | Sabe qué se suele validar por stack — tipado, linter, unit tests, coverage, build, e2e, sonar (`quality-check/references/stacks.md`) — más las suites de prueba que declare el **estándar de testing** del repo, que son las únicas no fijas ([Suites de prueba](../quality-check/SKILL.md#suites-de-prueba-fijas-y-configuradas)). `arch-init` lo **consulta** en el Paso 4 para saber qué le falta a la compuerta de calidad; no ejecuta la corrida completa (esa corre sobre código ya implementado, no aplica en una inicialización). |
| `work-define` / `work-plan` | Reciben el handoff que `arch-init` ofrece al cerrar (Paso 5). |

---

## Cómo preguntar al usuario

Mecanismo, ritmo y fallback compartidos: [`../../reference/asking.md`](../../reference/asking.md).

Cada vez que este skill o sus referencias digan *preguntar*, *pedir*, *confirmar*, *validar* o *sugerir* algo al usuario, asume ese mecanismo; no se repite allí.

**Ritmo propio: una tanda por paso**, no una sola al inicio. Este flujo tiene cinco pasos con preguntas en cada uno; agrupar las de un mismo paso en un solo bloque, sin tope fijo de preguntas por bloque. En modo multi-repo, "un paso" se entiende por submódulo cuando el paso se repite por submódulo (Pasos 1.2, 1.3, 2, 4): agrupar en una tanda las preguntas de varios submódulos que compartan el mismo paso, no una tanda por submódulo.

**Selección múltiple** donde el paso lo indique explícitamente: capas de testing y candidatos de ADR.

---

## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada: este skill crea el archivo donde `language.md` lee el idioma.** El idioma resuelto se **persiste** en la clave `language` de `.sdd-devkit/settings.json` al crearlo (Paso 3); a partir de ahí lo lee todo el catálogo.

---

## Mapa del harness

| Archivo | Contenido | Se crea en |
| ------- | --------- | ---------- |
| `AGENTS.md` | Fuentes de contexto + reglas generales + sección `Stack tecnológico` | Paso 3 (stub) → Paso 5 (stack definitivo) |
| `CLAUDE.md` | Solo `@AGENTS.md`, por compatibilidad | Paso 3 |
| `.agents/MEMORY.md` | Memoria persistente (preferencias y reglas operativas — **no** el stack, eso vive solo en `AGENTS.md`) | Paso 3 (stub) |
| `.sdd-devkit/settings.json` | Configuración del plugin conforme a [`schemas/settings.schema.json`](../../schemas/settings.schema.json); **persiste el idioma** en la clave `language` | Paso 3 |
| `README.md` (raíz) | Descripción de qué hace el proyecto, 1-2 párrafos | Paso 3 (agregada/actualizada — sin plantilla de secciones fija) |
| `docs/adr/README.md` | Índice de ADRs vigentes | Paso 3 (stub) → Paso 5 (poblado por `arch-manage`) |
| `docs/standards/README.md` | Índice de estándares vigentes | Paso 3 (stub) → Paso 5 (poblado por `arch-manage`) |

Los **siete archivos del harness** que **ya existan** en el proyecto se revisan en el Paso 3. Los primeros seis (`AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`, `docs/adr/README.md`, `docs/standards/README.md`) se llevan al formato de su plantilla (ver [3.1 Migración de formato](#31-migración-de-formato)) — no admiten variantes de formato, porque el resto del catálogo lee sus secciones por título. `README.md` es el séptimo, pero **no tiene una plantilla de secciones fija**: es un artefacto libre del proyecto, y su única regla de conformidad es tener, cerca del inicio, la descripción de qué hace el proyecto en 1-2 párrafos, sin que `arch-init` toque el resto de su contenido — ver [3.4 README.md raíz — descripción del proyecto](#34-readmemd-raíz--descripción-del-proyecto).

> **Raíz de los índices de arquitectura.** Los cinco primeros archivos (incluido `README.md`) son del
> **harness** y viven siempre en la raíz del repositorio principal. Los dos índices (`docs/adr/README.md`,
> `docs/standards/README.md`) son artefactos de **arquitectura**: pertenecen a la raíz del repositorio cuyo código documentan (ver
> [`../../reference/artifacts.md`](../../reference/artifacts.md#raíz-de-arquitectura-adr-estándares-y-fitness-functions)).
> La raíz principal **siempre** los recibe (`AGENTS.md` los referencia). **Si el proyecto tiene submódulos
> o repositorios anidados**, preguntar en el Paso 3 para cuáles de ellos crear **además** los suyos — cada
> raíz lleva su propia serie `ADR-XXX`. No crearlos en un submódulo sin preguntar, ni asumir que un
> submódulo comparte los del padre.
>
> **Proyecto de un solo repo vs. multi-repo.** "Repositorio principal" arriba no es siempre el directorio
> desde el que se invocó el skill: si la solución abarca **más de un repositorio**, el Paso 1.0 crea un
> **repositorio de especificaciones** que pasa a ser el principal (el harness completo vive ahí) y agrega
> el resto de repos como submódulos en su raíz — ver [`references/multi-repo.md`](references/multi-repo.md).
> Con un solo repo, nada de esto aplica y el comportamiento es el descrito arriba sin cambios.

---

## Paso 1 — Identificar el punto de partida

Leer `references/stack-detection.md` completo antes de este paso.

### 1.0 Topología del proyecto (repo único vs. multi-repo)

Leer `references/multi-repo.md` completo antes de continuar. Antes de resolver el repositorio git, decidir
si la solución abarca **uno** o **más de un** repositorio: preguntar al usuario — no hay señal de código
que lo infiera con confianza, a diferencia de la clasificación del 1.2.

- **Uno solo** → sin cambios de comportamiento. Continuar en el 1.1 sobre el directorio de invocación.
- **Más de uno** → crear (o usar, si ya existe) un **repositorio de especificaciones** que pasa a ser la
  raíz principal para todo el resto del flujo, y agregar cada repositorio adicional como submódulo en su
  raíz. El detalle completo — cómo preguntar nombre/ubicación, cómo distinguir repos existentes de nuevos,
  los comandos de `git submodule`, y cómo se repiten los Pasos 1.2, 1.3, 2, 4 y 5.2 por cada submódulo —
  vive en `references/multi-repo.md`. El 1.1 de abajo queda resuelto por este mismo paso; no se repite.

### 1.1 Repositorio git

- `git rev-parse --is-inside-work-tree`. Si falla, ejecutar `git init` e informar que se creó el repositorio (sin hacer commit todavía — el primer commit queda a criterio del usuario, p. ej. vía `git-commit` después del Paso 3).
- Si ya es un repo git, no tocar la configuración existente (remoto, ramas, hooks).
- **Multi-repo:** este paso ya se resolvió al crear/usar el repositorio de especificaciones en el 1.0; no
  se repite aquí.

### 1.2 Clasificar la situación

Aplicar las señales de `references/stack-detection.md § 2` para ubicar el proyecto en **una** de tres situaciones:

| Situación | Qué implica |
| --------- | ------------ |
| **Sin código** | No hay manifiestos de ningún stack ni código fuente propio. |
| **Con código base** | Hay un stack detectable (manifiestos / resultado de un scaffold) pero sin lógica de negocio propia todavía. |
| **Con implementación** | Hay características de negocio ya implementadas (módulos, rutas, componentes o tests con lógica propia; `docs/specs/` con contenido). |

Si el resultado es ambiguo, preguntar al usuario en vez de asumir. Esta clasificación decide si el Paso 2 hace falta (solo **Sin código**) y cómo se identifican los candidatos de arquitectura en el Paso 4.

**Multi-repo:** esta clasificación se aplica **una vez por cada submódulo** (nunca al repositorio de especificaciones, que no tiene código de aplicación propio) — cada uno puede quedar en una situación distinta. Ver `references/multi-repo.md § 3`.

### 1.3 Detectar el stack tecnológico

Buscar los manifiestos de `references/stack-detection.md § 1`. **Con código base** y **Con implementación** siempre tienen stack detectable — registrar internamente lenguaje(s), framework(s) y versiones (se usan en el cierre, Paso 5). **Sin código** no tiene nada que detectar: el Paso 2 es obligatorio.

**Multi-repo:** igual que el 1.2, esta detección corre **una vez por cada submódulo**, sobre su propia raíz.

---

## Paso 2 — Conseguir el stack

**Solo si el Paso 1.2 clasificó "Sin código".** En cualquier otro caso, saltar directo al Paso 3.

**Multi-repo:** este paso se ejecuta por cada submódulo que el 1.2 haya clasificado "sin código". Si son
varios a la vez, agrupar sus preguntas del 2.1 en una sola tanda (una sub-pregunta por submódulo) en vez de
una tanda por submódulo, y reutilizar el propósito que el usuario ya describió al identificar ese repo en
el 1.0 en vez de repreguntarlo desde cero. Ver `references/multi-repo.md § 3`.

### 2.1 Preguntar qué se quiere desarrollar

No arrancar con una categoría cerrada de "tipo de proyecto" ni con una pregunta de preferencia de stack por separado. Preguntar primero, en lenguaje abierto: *"¿Qué quieres desarrollar?"* — pedir que describa la necesidad: qué problema resuelve, para quién, y cualquier restricción o preferencia que ya tenga en mente (integraciones con algo existente, rendimiento esperado, quién lo va a mantener, plazos). Es una respuesta de **texto libre**; si el cliente expone la herramienta de preguntas estructuradas, usarla igual con una opción de entrada libre en vez de forzar categorías.

De la respuesta, extraer (sin volver a preguntar por separado): el **tipo de proyecto** (se infiere, no se pregunta aparte), cualquier **preferencia de stack** ya mencionada, y las **restricciones** relevantes (integraciones, rendimiento, equipo, plazos, licenciamiento).

Si la respuesta es demasiado vaga para decidir nada (p. ej. "una app"), repreguntar **una sola vez** pidiendo más detalle — no avanzar con una necesidad ambigua.

### 2.2 Sugerir directo o investigar primero

Con la necesidad ya capturada, decidir cómo se llega al stack:

- **El usuario ya mencionó una preferencia de stack explícita** en el 2.1 → usarla directamente. Saltar a 2.3.
- **No hay preferencia, pero la necesidad es común y el criterio es claro** (stack bien establecido para ese tipo de proyecto, sin restricciones inusuales) → sugerir directamente 1-2 opciones con una justificación breve (1-2 líneas, atada a la necesidad descrita) y presentarlas con la herramienta de preguntas estructuradas: opciones = cada stack sugerido, más `Quiero que investigues más opciones` y `Tengo otra preferencia` (texto libre). No hace falta un subagente para este caso.
- **Hay trade-offs no triviales, restricciones específicas que cambian la respuesta obvia, o el usuario pide explícitamente que se investigue** → delegar en un **subagente** que ejecute el skill **`work-research`** (dominio **Técnica**, investigación **independiente** — no hay `US`/`WI`/`MG` todavía) con una pregunta construida a partir de la necesidad capturada (el problema y sus restricciones, no una categoría genérica), p. ej. *"¿Qué stack tecnológico es más adecuado para <necesidad descrita, con sus restricciones>?"*. Pedirle explícitamente que, para **cada opción**, incluya los **comandos exactos de instalación/scaffolding** — no solo la comparación teórica. `work-research` guarda su informe en `docs/specs/research/RS-XXX-{slug}/README.md`; esperar su resultado y presentar las opciones al usuario (una por stack, más `Ninguna, decido yo`).

Ante la duda entre sugerir directo o investigar, preferir investigar: una sugerencia sin respaldo en un stack con opciones reñidas cuesta más corregir después que un `RS-XXX` de más.

Si durante 2.1 o 2.2 hace falta alguna aclaración adicional del usuario para poder decidir, preguntarla en el momento — no acumular ambigüedades para más adelante.

### 2.3 Instalar el stack elegido

1. Ejecutar los comandos de scaffolding/instalación de la opción elegida (de la investigación del 2.2, o indicados por el usuario si dio su propia preferencia).
2. Verificar que la instalación quedó operativa (p. ej. `npm run build`, un comando de arranque en modo check, o el equivalente del stack) antes de continuar.
3. Registrar internamente el stack definitivo (lenguaje, framework, versión, herramientas de build) — **todavía no se escribe en `AGENTS.md`**, eso ocurre en el Paso 5.

---

## Paso 3 — Placeholders del harness

Antes de escribir cualquier archivo, verificar si ya existe y aplicar [Idempotencia / reejecución](#idempotencia--reejecución): un archivo del harness que ya exista **nunca se deja con un formato distinto al de su plantilla**. Lo que sigue describe el caso en que el archivo **no** existe.

**Multi-repo:** todo este paso opera **sobre el repositorio de especificaciones** (la raíz principal
resuelta en el 1.0) — nunca sobre un submódulo. El punto 5 (índices de arquitectura) es la única
excepción, y ya contempla submódulos; ver la nota ahí y `references/multi-repo.md § 5`.

1. **`AGENTS.md`** — copiar `assets/agents-template.md` tal cual (fuentes de contexto, el comentario de `# Reglas generales` y la sección `# Stack tecnológico` con su comentario, sin rellenar el stack).
2. **`CLAUDE.md`** — copiar `assets/claude-template.md` tal cual.
3. **`.agents/MEMORY.md`** — copiar `assets/memory-template.md` tal cual.
4. **`docs/adr/README.md`** — copiar `assets/adr-index-template.md` tal cual.
5. **`docs/standards/README.md`** — copiar `assets/standards-index-template.md` tal cual.
   Los puntos 4 y 5 se escriben en la **raíz de arquitectura**. La raíz principal **siempre** los recibe
   —`AGENTS.md` los referencia y sin ellos el puntero queda roto—; en un repo sin submódulos ahí acaba la
   historia y no hay nada que preguntar. **Si hay submódulos o repositorios anidados**, el criterio depende
   de su origen: si se **crearon en el Paso 1.0 de esta misma corrida** (proyecto multi-repo recién armado),
   crear los índices para **todos** por defecto — el Paso 4 les va a generar candidatos de todas formas —,
   preguntando solo si el usuario quiere **excluir** alguno explícitamente. Si en cambio **ya existían de
   antes** (p. ej. una reejecución sobre un repo de especificaciones con submódulos previos), mantener la
   pregunta de opt-in original — una sola vez, con la herramienta de preguntas estructuradas — **para
   cuáles de ellos** crear además sus propios índices. Cada raíz elegida recibe su propio par
   `docs/adr/README.md` + `docs/standards/README.md`, con su serie `ADR-XXX` independiente. Este bootstrap
   es la **única** excepción a la regla de «una raíz por invocación» del catálogo. Ver
   `references/multi-repo.md § 5`.
6. **`.sdd-devkit/settings.json`** — copiar `assets/settings-template.json`, reemplazando `<código>` en `language` por el idioma resuelto en [Resolución de idioma](#resolución-de-idioma) (ISO 639-1). El resto de claves son la **configuración mínima obligatoria** del schema y se escriben con los valores de la plantilla; no preguntarlas aquí ni ofrecer configurarlas — el usuario las ajusta editando el archivo.

> **Este archivo es JSON validado por schema, no markdown.** Debe cumplir [`schemas/settings.schema.json`](../../schemas/settings.schema.json): las **6** claves de primer nivel (`language`, `specification`, `implementation`, `verification`, `git`, `projectManagement`) son **obligatorias** — la lista viva es la de `required` en el schema, no esta enumeración. `$schema` es opcional (ruta al schema para el editor; ningún skill la resuelve). Fuera de esa, el schema **no admite propiedades adicionales** y `language` solo acepta los códigos de su `enum`. Cuando `projectManagement` queda en `"enabled": false`, el schema **no exige** el resto de sus claves: dejarlas fuera. `specification` es distinto: `basePath`, `archivePath` y `testCases` son obligatorios siempre; solo `trackingUrl` se omite cuando `trackingEnabled` es `false`. `testCases` es un **objeto** que exige `mode` (`ask`/`always`/`never`) y `askDetails` (booleano), ambos obligatorios.

7. **`.gitignore`** — asegurar que incluye `.sdd-devkit/.env`. Ahí vive `SDD_DEVKIT_ACCESS_TOKEN` (hooks y CLI); no se versiona. Si `.gitignore` no existe, crearlo con esa línea; si existe y no la tiene, añadirla. **No** crear el archivo `.env`.
8. **`README.md` (raíz)** — asegurar que incluya, cerca del inicio del archivo, una descripción de **qué hace el proyecto** en **máximo 1-2 párrafos**. Es el séptimo archivo del harness, pero no sigue la migración por plantilla completa del punto 3.1 — ver [3.4](#34-readmemd-raíz--descripción-del-proyecto).

### Idempotencia / reejecución

Un proyecto existente puede ya tener alguno de los siete archivos del harness, escrito a mano o por otra herramienta. **Ninguno de ellos se deja como estaba si no cumple su propia regla de conformidad.** Para los seis con plantilla fija (`AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`, `docs/adr/README.md`, `docs/standards/README.md`), el harness solo funciona si tienen la estructura que el resto del catálogo espera leer (secciones, títulos y marcadores de las plantillas de `assets/`); comparar su estructura contra la plantilla correspondiente y aplicar una de estas tres salidas:

| Estado del archivo existente | Qué hacer |
| ---------------------------- | --------- |
| **Ya conforme** — tiene todas las secciones de la plantilla, con sus títulos y en su orden | No tocar. Continuar como si ya estuviera creado. |
| **Formato divergente** — es reconociblemente el mismo archivo (mismo propósito) pero le faltan secciones, tiene otros títulos, otro orden, o perdió los comentarios-marcador | **Migrar al formato de la plantilla** (ver 3.1). |
| **Contenido ajeno** — el archivo existe con un propósito distinto al del harness y no hay nada que migrar | No sobrescribir. Mostrar el contenido actual y preguntar si fusionar, reemplazar o dejar como está. |

`README.md`, el séptimo, no tiene plantilla de secciones ni pasa por esta tabla: su conformidad se decide solo por si ya trae, o no, una descripción vigente del proyecto — ver [3.4](#34-readmemd-raíz--descripción-del-proyecto).

> **`.sdd-devkit/settings.json` no se migra, se completa.** Si ya existe, **nunca** se sobrescribe: conservar los valores del usuario y limitarse a **agregar las claves obligatorias que falten** con los valores de la plantilla. Si le falta `language`, escribir ahí el idioma resuelto. Si tiene valores que el schema rechaza, no corregirlos por cuenta propia: informarlo en el cierre (Paso 5.3) y dejar el archivo como está.

### 3.1 Migración de formato

Migrar significa **imponer la estructura de la plantilla sin perder contenido del usuario**:

1. **Estructura desde la plantilla:** partir de la plantilla de `assets/` — sus secciones, títulos exactos, orden y comentarios-marcador (los `<!-- ... -->` que `arch-manage` usa como punto de inserción en los índices). Restaurar todo marcador que falte.
2. **Reubicar el contenido propio:** mover cada bloque del archivo original a la sección equivalente de la plantilla. Ejemplos: reglas generales sueltas en un `AGENTS.md` artesanal → bajo `# Reglas generales`; descripción del stack encontrada en `AGENTS.md` → bajo `# Stack tecnológico`, **pero** ver la regla de la sección 3.2; preferencias en un `MEMORY.md` propio → bajo `## Preferencias`; entradas de ADR/estándares ya listadas en un índice → como líneas en el formato que indica el marcador (`- [ADR-XXX: Título](ADR-XXX-slug.md)` / `- [Nombre del estándar](<slug>.md)`), ordenadas por identificador.
3. **Normalizar sin reescribir:** ajustar formato (nivel de encabezado, viñetas, sintaxis de enlaces e `@`-includes, orden de entradas), no la redacción del usuario. No resumir, reformular ni traducir su texto.
4. **Contenido sin sección equivalente:** conservarlo. Si no encaja en ninguna sección de la plantilla, dejarlo al final del archivo bajo un encabezado propio en lugar de descartarlo, y mencionarlo al presentar el diff.
5. **Confirmar antes de escribir:** mostrar el **diff** de la migración (o el antes/después si el diff es corto) y pedir confirmación explícita. Si el usuario declina, dejar el archivo intacto y registrar que ese archivo no está en formato del harness — informarlo en el cierre (Paso 5.3), porque el resto del catálogo puede no leerlo bien.
6. **Una sola tanda:** agrupar todas las migraciones detectadas en un único bloque de confirmación, no una pregunta por archivo.

### 3.2 Excepción del stack durante la migración

Si el `AGENTS.md` existente ya describía el stack, ese contenido se **preserva** al migrar (va bajo `# Stack tecnológico`, reemplazando el comentario de la plantilla) — no se borra para volver a poner el placeholder. Lo que sigue prohibido es **redactar o completar** ese stack aquí: si la sección queda con el comentario de la plantilla porque el archivo original no decía nada del stack, se rellena en el Paso 5.2 y en ningún otro momento.

### 3.3 Harness ya completo

Si los siete archivos existen y **todos** están conformes (los seis con plantilla fija ya migrados si hacía falta, y `README.md` con su descripción vigente), informar que el proyecto ya está inicializado y preguntar si se desea continuar igualmente para revisar/completar el resto (Paso 4 en adelante) o terminar aquí.

### 3.4 README.md raíz — descripción del proyecto

A diferencia de los otros seis archivos del harness, `README.md` no tiene una plantilla de secciones fija: es un artefacto libre del proyecto, no una plantilla del catálogo. `arch-init` solo garantiza que tenga, cerca del inicio, una descripción de **qué hace el proyecto** — no toca el resto de su contenido (instalación, badges, licencia, contribución, tabla de contenidos, etc.), ni le impone secciones.

1. **De dónde sale la descripción:**
   - **Sin código:** la necesidad capturada en el [Paso 2.1](#21-preguntar-qué-se-quiere-desarrollar) — qué problema resuelve y para quién.
   - **Con código base** o **con implementación:** inferirla del contenido existente (README previo, campo `description` de `package.json`/`pyproject.toml`/manifiesto equivalente, `docs/specs/` si ya hay historias) o de lo observado en el código durante el Paso 1 / Paso 4.1. Si no hay evidencia suficiente para redactarla con confianza, preguntar al usuario con una sola pregunta abierta (mismo estilo que el Paso 2.1): *"¿Qué hace este proyecto, en pocas palabras?"*.
2. **Si `README.md` no existe:** crearlo con un título (nombre del repo) y la descripción, en 1-2 párrafos.
3. **Si ya existe:**
   - Si ya trae una descripción vigente del propósito del proyecto (aunque no esté bajo un encabezado con ese nombre), no tocarla.
   - Si no la tiene, o quedó claramente desactualizada frente a lo detectado, proponer agregarla/actualizarla cerca del inicio del archivo — mostrando el fragmento a insertar, no un diff del archivo completo — y pedir confirmación antes de escribir, con el mismo criterio de "mostrar antes de escribir" que la migración del harness (3.1, punto 5). Si en el mismo Paso 3 hay además migraciones de formato pendientes (3.1), agrupar esta propuesta en la **misma tanda** de confirmación en vez de preguntar aparte.
4. **Límite duro: 1-2 párrafos.** No agregar instalación, lista de features, badges, tabla de contenidos ni roadmap — eso, si el proyecto lo necesita, lo agrega el usuario o queda fuera del alcance de `arch-init`.

---

## Paso 4 — Candidatos de arquitectura y compuerta de calidad

### 4.1 Identificar candidatos de ADR/estándares

Leer `references/adr-candidates.md` completo antes de este paso.

**Multi-repo:** el 4.1 y el 4.2 se repiten **completos, uno por cada submódulo**, usando ese submódulo como
la raíz de arquitectura de esa corrida — nunca se consolida el resultado de varios submódulos en una sola
lista ni en una sola invocación de `arch-manage`. Ver `references/multi-repo.md § 4`.

> **Pasar la raíz de arquitectura a los subagentes.** El bootstrap del Paso 3 pudo crear índices en varias
> raíces, pero el descubrimiento y la creación de artefactos operan sobre **una**. Indicar explícitamente en
> la instrucción del subagente qué `<raíz-arq>` cubre —por defecto la principal; si el usuario eligió
> submódulos en el Paso 3, preguntar cuál se documenta ahora— para que `arch-discover`/`arch-manage` **no
> la vuelvan a preguntar** ni acaben escribiendo en otra raíz. Cubrir otra raíz es otra corrida.

- **Con implementación** (Paso 1.2) → delegar en un **subagente** que ejecute el skill **`arch-discover`** **completo** sobre la raíz de arquitectura indicada — sus cinco fases, incluida la Fase 5, en la que `arch-discover` mismo crea los artefactos aprobados invocando `/arch-manage` por su cuenta. `arch-discover` presenta sus candidatos al usuario, los agrupa por dominio funcional y los delega en `arch-manage` sin intervención de `arch-init` — **no** repetir esa presentación aquí, ni volver a delegarlos en `arch-manage` en el Paso 5.1: `arch-discover` ya es dueño de esa lista de principio a fin. Lo único que se retiene de esta ejecución es un resumen (cuántos ADR/estándares creó, con sus rutas) para reportarlo en el cierre (Paso 5.3) — **no** se agrega nada de esto a la lista consolidada del Paso 4.1/5.1.
- **Con código base** o **Sin código** (tras el Paso 2) → no hay nada que "descubrir" en código que todavía no existe: el candidato es la **decisión de stack** tomada en el Paso 1.3 o el Paso 2 (con sus alternativas, si vinieron de una investigación), clasificada por dominio funcional según `adr-candidates.md § 1`.

La lista consolidada que llega al Paso 5.1 se arma solo con la rama "con código base"/"sin código" de arriba (cuando aplica) más lo que aporte el 4.2 — nunca con los candidatos de `arch-discover`, que ya quedaron resueltos por su propia Fase 5. No delegar nada en `arch-manage` todavía desde aquí; eso ocurre en el Paso 5.1.

### 4.2 Compuerta de calidad

Leer `references/quality-gate.md` completo antes de este paso.

1. **Diagnóstico:** revisar si ya existe configuración de pruebas (config, carpetas, scripts de test).
2. **Qué se suele validar:** consultar el skill **`quality-check`** — específicamente su `references/stacks.md`, tabla "Aplicabilidad por stack" — para saber qué checks son **Bloqueantes** (típicamente tipado si aplica, linter, unit tests, coverage, build) y cuáles **Condicionales** (típicamente E2E, y linter/tipado en algunos stacks) para el stack de este proyecto. Las demás clases de prueba —integración, contrato, rendimiento…— **no** son checks del stack: son **suites configuradas**, y salen del estándar de testing del repo, no de esa tabla (ver [Suites de prueba](../quality-check/SKILL.md#suites-de-prueba-fijas-y-configuradas)); si el proyecto las necesita, lo que falta es declararlas en `docs/standards/testing.md` vía `arch-manage`. `arch-init` no ejecuta la corrida completa — esa corre sobre código ya implementado, no aplica en una inicialización —, solo usa esa tabla como checklist de qué falta configurar.
3. **Completar lo que falte:** para cada check **Bloqueante** ausente, y cada **Condicional** relevante según el tipo de proyecto (`quality-gate.md § 3` — nunca sugerir una capa que no ayude a validar este proyecto en particular, p. ej. E2E a una librería sin UI ni endpoints), preguntar al usuario y, si acepta, instalar/configurar lo necesario: dependencias, config mínima, un test de ejemplo real (no un placeholder vacío), y el script de ejecución.
4. **Validar:** ejecutar la suite configurada y confirmar que corre sin errores de configuración antes de avanzar. Si falla por algo fuera del alcance de este skill, informar y preguntar cómo proceder.
5. El framework y las capas configuradas se suman como candidato de dominio `testing` a la lista del 4.1 (un requisito por capa aceptada, igual que el ejemplo canónico de `arch-discover`).

---

## Paso 5 — Cierre

### 5.1 Documentar las decisiones aceptadas

Presentar la lista consolidada de candidatos agrupada por dominio funcional, con la herramienta de preguntas estructuradas en **selección múltiple** (incluir siempre `Ninguno por ahora`). Esta lista es la decisión de stack del 4.1 (**solo** si la situación fue "con código base" o "sin código" — si fue "con implementación", esos candidatos ya los gestionó `arch-discover` en su propia Fase 5 y **no** se repiten aquí) más lo añadido en el 4.2. Si la lista queda vacía (p. ej. situación "con implementación" y la compuerta de calidad ya estaba completa), saltar directo al 5.2 sin preguntar. Si el usuario acepta algo: resolver los **decisores** una sola vez para todo el lote (`adr-candidates.md § 3`) y delegar en un **subagente** que ejecute **`/arch-manage`**, agrupando los candidatos aceptados **por dominio** en la misma invocación y pasándole la **raíz de arquitectura** ya resuelta (ver la nota del Paso 4.1) para que no la vuelva a preguntar. `arch-manage` crea los ADR y, cuando corresponda, los requisitos en el estándar de dominio, actualizando ambos índices por su cuenta. Esperar su respuesta antes de continuar.

**Multi-repo:** una corrida de 5.1 **por cada submódulo** (misma raíz de arquitectura que su propio 4.1/4.2), nunca una lista ni una invocación de `arch-manage` consolidada entre submódulos.

### 5.2 Actualizar el stack

Reemplazar el comentario bajo `# Stack tecnológico` en `AGENTS.md` con el stack definitivo — lenguaje(s), framework(s) y versión, gestor de paquetes/build, y las capas de testing configuradas en el 4.2. **`AGENTS.md` es la única fuente del stack** — no se repite en `.agents/MEMORY.md` (ese archivo no lleva sección de stack; ver plantilla). Este es el **único** momento del flujo en que se escribe esa sección.

**Multi-repo:** no hay un único stack que escribir — la sección documenta, en una tabla, el repositorio de
especificaciones (sin stack de aplicación propio) y cada submódulo con su stack definitivo, mismo nivel de
detalle que un repo único. Formato exacto en `references/multi-repo.md § 6`.

### 5.3 Confirmar y sugerir el siguiente paso

Confirmar al usuario que el harness inicial quedó listo, resumiendo: **topología** (repo único, o repo de especificaciones + submódulos con sus rutas), punto de partida (situación del Paso 1.2 — por submódulo si es multi-repo), repositorio git (creado o ya existía), archivos del harness creados, **archivos migrados al formato de plantilla** y los que el usuario prefirió dejar fuera de formato (Paso 3.1), **un `.sdd-devkit/settings.json` preexistente cuyos valores el schema rechaza** (Paso 3, si se detectó), stack definitivo (por submódulo si aplica), compuerta de calidad configurada (por submódulo si aplica), y — si aplica — los ADR/estándares creados con sus rutas, agrupados por raíz de arquitectura: los del Paso 5.1 y, si la situación fue "con implementación", también los que creó `arch-discover` en su propia Fase 5 (retenidos del Paso 4.1).

Después, ofrecer el siguiente paso natural con la herramienta de preguntas estructuradas — **es una sugerencia, no un paso bloqueante**: *"¿Quieres continuar con...?"* opciones: `Escribir la primera historia de usuario (work-define)` / `Planificar tareas técnicas o de mantenimiento (work-plan)` / `Nada por ahora`.

No confirmar el cierre antes de que `AGENTS.md` tenga el stack ya escrito.

---

## Mapa de referencias

| Archivo | Cuándo leerlo |
| ------- | -------------- |
| `references/multi-repo.md` | Paso 1.0 — cómo decidir repo único vs. multi-repo, crear el repositorio de especificaciones, agregar submódulos, y cómo se repiten los Pasos 1.2, 1.3, 2, 4 y 5.2 por cada uno. |
| `references/stack-detection.md` | Paso 1 — manifiestos por ecosistema y la clasificación en las tres situaciones (sin código / con código base / con implementación). |
| `references/quality-gate.md` | Paso 4.2 — cómo interpretar la tabla de `quality-check` por stack, y cuándo sugerir E2E/API testing según el tipo de proyecto. |
| `references/adr-candidates.md` | Paso 4.1 y 5.1 — cómo convertir la decisión de stack (o los candidatos de `arch-discover`) y la compuerta de calidad en candidatos por dominio funcional, y cómo delegarlos en `arch-manage`. |
| `assets/agents-template.md` | Paso 3 — plantilla de `AGENTS.md`. |
| `assets/claude-template.md` | Paso 3 — plantilla de `CLAUDE.md`. |
| `assets/memory-template.md` | Paso 3 — plantilla de `.agents/MEMORY.md`. |
| `assets/adr-index-template.md` | Paso 3 — plantilla de `docs/adr/README.md`. |
| `assets/standards-index-template.md` | Paso 3 — plantilla de `docs/standards/README.md`. |
| `assets/settings-template.json` | Paso 3 — plantilla de `.sdd-devkit/settings.json`. |


### Referencias compartidas del plugin

Reglas transversales del catálogo; viven en la raíz del plugin, no en este skill.

- [`../../reference/language.md`](../../reference/language.md): **Idioma** — resolución obligatoria del idioma de artefactos y mensajes. *Lectura obligatoria antes de ejecutar el skill.*
- [`../../reference/asking.md`](../../reference/asking.md): **Preguntas** — mecanismo estructurado, ritmo, fallback. *Antes de la primera pregunta.*
- [`../../reference/artifacts.md`](../../reference/artifacts.md): **Artefactos** — rutas del harness, identificadores, archivado. *Al resolver una ruta o calcular un ID.*

---

## Anti-patterns

- **Narrar el flujo interno**: anunciar que se resuelve el idioma o la política, que se lee `settings.json`, que se carga una referencia, o ir enumerando los pasos en voz alta. Al usuario se le comunica el resultado, las preguntas que el flujo exija y lo que quede pendiente — no la maquinaria.
- Rellenar `# Stack tecnológico` en `AGENTS.md` antes del Paso 5, aunque el stack ya se conozca desde el Paso 1 o el Paso 2.
- Escribir el stack (o duplicarlo) en `.agents/MEMORY.md` — ese archivo no lleva sección de stack; `AGENTS.md` es la única fuente.
- Dar por bueno un archivo del harness que ya existía solo porque existe, sin comparar su estructura contra la plantilla de `assets/` (Paso 3).
- Migrar el formato **reescribiendo** la redacción del usuario — resumir, reformular o traducir su texto en vez de solo reubicarlo y normalizar el formato.
- Descartar contenido del archivo original porque no encaja en ninguna sección de la plantilla, en vez de conservarlo al final.
- Migrar sin restaurar los comentarios-marcador de los índices (`docs/adr/README.md`, `docs/standards/README.md`) — sin ellos `arch-manage` no tiene punto de inserción.
- Crear los índices de arquitectura de un submódulo sin preguntar, o dar por hecho que un submódulo comparte los del repo principal — cada raíz de arquitectura lleva los suyos y su propia serie `ADR-XXX`.
- Sacar `AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md` o `.sdd-devkit/settings.json` de la raíz principal para meterlos en un submódulo: el harness es uno solo, solo los índices de arquitectura son por raíz.
- Inferir la topología (repo único vs. multi-repo) del contenido del directorio en vez de preguntarla en el Paso 1.0 — a diferencia de la situación del 1.2, no hay señal de código que la determine con confianza.
- Ejecutar el Paso 1.1 (`git init`) tanto sobre el directorio de invocación como sobre el repositorio de especificaciones recién creado en modo multi-repo — el 1.0 ya lo resuelve una sola vez.
- Clasificar la situación (1.2) o detectar/conseguir el stack (1.3/2) "para el proyecto" en general cuando es multi-repo, en vez de una vez por cada submódulo.
- Crear `AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md` o `.sdd-devkit/settings.json` dentro de un submódulo en vez de en el repositorio de especificaciones — el Paso 3 opera siempre sobre la raíz principal.
- Consolidar los candidatos de ADR/estándares (Paso 4) o la compuerta de calidad de varios submódulos en una sola lista o una sola invocación de `arch-manage` — cada submódulo es su propia raíz de arquitectura y se documenta por separado.
- Escribir un único stack en `AGENTS.md` cuando el proyecto es multi-repo, en vez de la tabla por repositorio de `references/multi-repo.md § 6`.
- Duplicar la lista de submódulos en `.sdd-devkit/settings.json` o en cualquier otro archivo del harness — `.gitmodules` ya es la fuente de verdad.
- Agregar un repositorio como submódulo sin antes preguntar si ya existe (local o remoto) o si hay que crearlo desde cero.
- Borrar el stack que un `AGENTS.md` existente ya describía para dejar el comentario de la plantilla, o al contrario redactar el stack durante la migración en vez de en el Paso 5.2.
- Escribir la migración sin mostrar el diff y obtener confirmación, o preguntar archivo por archivo en vez de agrupar todas las migraciones en una sola tanda.
- Sobrescribir un `AGENTS.md`/`CLAUDE.md`/etc. existente con contenido propio del usuario sin preguntar primero.
- **Sobrescribir un `.sdd-devkit/settings.json` que ya existía** en vez de conservar sus valores y agregar solo las claves obligatorias que falten (Paso 3).
- Escribir en `.sdd-devkit/settings.json` claves que el schema no declara (`$schema` incluido) o el resto de claves de un bloque que quedó en `"enabled": false` — `additionalProperties: false` rechaza el archivo.
- Preguntar al usuario por `implementation`, `verification`, `git`, `projectManagement` o `specification` en el Paso 3: solo `language` se resuelve; el resto sale de la plantilla y el usuario lo ajusta editando el archivo.
- Ejecutar el Paso 2 (conseguir el stack) cuando el Paso 1.2 ya clasificó "con código base" o "con implementación".
- Clasificar la situación del Paso 1.2 sin evidencia clara, en vez de preguntar ante la ambigüedad.
- Preguntar "tipo de proyecto" como categoría cerrada o "¿tienes preferencia de stack?" como pregunta aparte, en vez de capturar la necesidad en el 2.1 y extraer de ahí tipo/preferencia/restricciones.
- Sugerir o investigar un stack sin haber capturado antes la necesidad real (2.1) — avanzar con una descripción vaga ("una app") sin repreguntar.
- Investigar el stack (2.2) sin pedirle al subagente los comandos de instalación de cada opción.
- Reimplementar en el Paso 4.1 la inspección de código que ya hace `arch-discover`, en vez de delegarle esa identificación cuando el punto de partida es "con implementación".
- Volver a presentar o delegar en `/arch-manage` los candidatos que `arch-discover` ya creó por su cuenta en su propia Fase 5 — es trabajo duplicado y puede generar un ADR casi-idéntico; el Paso 5.1 solo agrupa lo que **no** pasó por `arch-discover`.
- Reinventar en el Paso 4.2 un catálogo propio de qué validar por stack en vez de consultar `quality-check/references/stacks.md`.
- Ejecutar la corrida completa de `quality-check` sobre el repo — ese skill corre sobre código ya implementado, no en una inicialización sin nada que verificar.
- Sugerir E2E, API testing u otras capas que no aportan valor de validación al tipo de proyecto.
- Cerrar el Paso 4.2 sin ejecutar la suite de pruebas al menos una vez para confirmar que corre.
- Delegar en `/arch-manage` sin que el usuario haya aceptado explícitamente al menos un candidato, o sin agrupar por dominio los candidatos que comparten estándar.
- Confirmar el cierre antes de actualizar el stack definitivo en `AGENTS.md`.
- Forzar el handoff a `work-define`/`work-plan` en el 5.3 en vez de ofrecerlo como sugerencia que el usuario puede declinar.
- Hacer commit automático del harness sin que el usuario lo pida (queda para `git-commit`, fuera de este skill).
- Lanzar preguntas como prosa libre cuando el cliente expone la herramienta de preguntas estructuradas.
- Escribir más de 1-2 párrafos de descripción en el `README.md` raíz, o agregarle secciones que el usuario no pidió (instalación, features, badges, tabla de contenidos, roadmap).
- Sobrescribir, reordenar o reformular el resto del `README.md` raíz al agregar/actualizar la descripción — solo se toca ese fragmento.
- Inventar la descripción del `README.md` raíz sin evidencia (README/manifiesto previos, código, o la necesidad del Paso 2.1) en vez de preguntarle al usuario en una sola pregunta abierta.
- Tratar el `README.md` raíz como uno de los seis archivos con plantilla fija: exigirle secciones, títulos u orden que su regla de conformidad (3.4) no pide.

---

## Ejemplos

**Ejemplo 1 — Sin código, necesidad con restricciones que ameritan investigar**

Carpeta vacía salvo un `README.md` con solo el título del repo, sin descripción. Paso 1: no hay repo git → `git init`; sin manifiestos → situación "sin código". Paso 2.1: a "¿qué quieres desarrollar?" el usuario responde "una API para gestionar pedidos de un e-commerce, con picos fuertes de tráfico en fechas de descuentos" — sin preferencia de stack. Paso 2.2: la restricción de picos de tráfico no es trivial → se decide investigar; el subagente de `work-research` compara Node/Fastify, Python/FastAPI y Go con foco en throughput, con comandos de instalación para cada uno; el usuario elige Fastify + TypeScript. Paso 2.3: se ejecuta el scaffold. Paso 3: se crean los seis archivos del harness con plantilla fija (incluido `.sdd-devkit/settings.json` con `"language": "es"`); el `README.md` preexistente no tenía descripción, así que se propone agregarle el párrafo redactado a partir de la necesidad capturada en 2.1 y, confirmado, se inserta cerca del inicio sin tocar el resto del archivo. Paso 4.1: como no hay implementación todavía, el único candidato es "Fastify + TypeScript" (dominio `api`, con las alternativas del `RS-XXX`). Paso 4.2: se consulta `quality-check/references/stacks.md` para Node+TS (tipado, linter, unit, coverage y build son bloqueantes); no hay nada configurado → se sugiere Vitest (unit) y, por tratarse de una API, Supertest (API testing); el usuario acepta ambos y se configuran. Se suma "Vitest + Supertest" (dominio `testing`) a la lista. Paso 5.1: el usuario acepta documentar ambos candidatos → subagente `/arch-manage` crea los ADR y los estándares de dominio `api` y `testing`. Paso 5.2: se escribe el stack en `AGENTS.md`. Paso 5.3: se confirma el cierre y se ofrece continuar con `work-define`; el usuario acepta.

**Ejemplo 2 — Con implementación, delegando en arch-discover**

Repo git con historial de dos años, `package.json` con NestJS + Prisma, `docs/specs/user-stories/` con 40 historias. Paso 1: repo ya existe; stack detectado (NestJS/Prisma); situación "con implementación" → se salta el Paso 2. Paso 3: `AGENTS.md`, `.agents/MEMORY.md` y `.sdd-devkit/settings.json` no existían → se crean desde plantilla. Paso 4.1: se delega en un subagente que corre `arch-discover` **completo**; encuentra y presenta candidatos como "por qué Prisma" y "arquitectura en capas", el usuario acepta 3, y el propio `arch-discover` los crea invocando `arch-manage` en su Fase 5 — `arch-init` no vuelve a presentarlos ni a delegarlos. Paso 4.2: ya hay Jest configurado con buena cobertura de unit (bloqueantes cubiertos según `quality-check/references/stacks.md`); falta E2E para los flujos de checkout → se sugiere y el usuario acepta agregar Playwright, que se suma como candidato de dominio `testing`. Paso 5.1: la lista consolidada tiene solo el candidato de Playwright (los 3 de `arch-discover` ya quedaron creados) → se documenta y `/arch-manage` lo crea. Paso 5.2: stack definitivo (NestJS x.y, Prisma x.y, Jest + Playwright) se escribe en `AGENTS.md`. Paso 5.3: se confirma el cierre reportando los 3 ADR/estándares que creó `arch-discover` más el de Playwright, y se ofrece continuar con `work-plan` (hay deuda técnica pendiente); el usuario prefiere `Nada por ahora`.

**Ejemplo 3 — Con código base, sugerencia directa sin investigar**

Carpeta con un scaffold de Astro recién generado (`npm create astro@latest`), sin posts ni contenido propio. Paso 1: repo existe; `package.json` detecta Astro → situación "con código base" → se salta el Paso 2 (el stack ya está decidido por el scaffold). Paso 3: se crean los seis archivos del harness con plantilla fija; el scaffold generó un `README.md` genérico ("Astro starter") sin describir el proyecto real, así que se pregunta en una sola pregunta abierta qué hace el sitio y se actualiza la descripción cerca del inicio. Paso 4.1: el candidato es "Astro" (dominio `frontend`), sin alternativas registradas porque no hubo Paso 2. Paso 4.2: `quality-check/references/stacks.md` para Node+TS marca unit/build como bloqueantes; se sugiere Vitest; el usuario acepta. Paso 5: se documenta lo aceptado, se escribe el stack, se confirma el cierre y se ofrece `work-define`.

**Ejemplo 4 — Reejecución sobre un harness ya inicializado**

El usuario vuelve a pedir `arch-init` sobre un proyecto donde ya corrió antes. Paso 3 detecta que los siete archivos ya existen y están conformes (los seis con sus plantillas, `README.md` con su descripción) → informa que el harness ya está inicializado y pregunta si continuar para revisar/completar. El usuario confirma porque quiere agregar la compuerta E2E que no se configuró la primera vez → el skill retoma directamente en el Paso 4.2, sin tocar los archivos ya creados.

**Ejemplo 5 — Proyecto existente con documentos del harness en otro formato**

Monorepo Django con historial propio. Ya tiene un `CLAUDE.md` de 60 líneas escrito a mano (reglas de estilo, comandos de test, una nota sobre migraciones), un `docs/adr/README.md` con una tabla de tres ADRs, un `README.md` con instalación y badges pero sin ningún párrafo que diga qué hace el proyecto, y ningún `AGENTS.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json` ni `docs/standards/README.md`. Paso 1: repo existe; stack Django detectado; situación "con implementación" → se salta el Paso 2.

Paso 3 compara cada archivo existente contra su plantilla:

- `CLAUDE.md` → **contenido ajeno** respecto a la plantilla (que es solo `@AGENTS.md`), pero su contenido sí es material de `AGENTS.md`. Se propone: crear `AGENTS.md` con la plantilla, reubicar las reglas de estilo y los comandos de test bajo `# Reglas generales`, dejar la nota sobre migraciones al final bajo su propio encabezado (no hay sección equivalente), y reducir `CLAUDE.md` a `@AGENTS.md`. El `# Stack tecnológico` de `AGENTS.md` queda con el comentario de la plantilla — el `CLAUDE.md` original no describía el stack, así que se rellenará en el Paso 5.2.
- `docs/adr/README.md` → **formato divergente**: falta el encabezado y el comentario-marcador, y las entradas están en tabla. Se propone reescribir con el título y el párrafo de la plantilla, restaurar el marcador y convertir las tres filas en líneas `- [ADR-XXX: Título](ADR-XXX-slug.md)` ordenadas por identificador, conservando los títulos tal como los escribió el usuario.
- `README.md` → no sigue esta comparación por plantilla (3.4): como no trae ninguna descripción del proyecto, se infiere una de lo detectado en el código Django y se propone insertarla cerca del inicio, sin tocar la instalación ni los badges existentes.
- Los cuatro archivos del harness que faltan (`AGENTS.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`, `docs/standards/README.md`) se crean desde plantilla, sin preguntar — `.sdd-devkit/settings.json` con el idioma resuelto en su clave `language` y el resto de valores de la plantilla.

Las dos migraciones y la propuesta de descripción del `README.md` se presentan en **una sola tanda**; el usuario acepta la del índice de ADRs y la descripción del `README.md`, y declina la de `CLAUDE.md` porque quiere reubicar él mismo esas reglas. `CLAUDE.md` queda intacto y `AGENTS.md` se crea igual desde plantilla (es una creación, no una migración) — solo sin las reglas heredadas. Se registra que `CLAUDE.md` queda fuera de formato para reportarlo en el 5.3, advirtiendo que sus reglas no las verá el resto del catálogo, que lee `AGENTS.md`. El flujo continúa en el Paso 4.

**Ejemplo 6 — Multi-repo: repositorio de especificaciones nuevo con dos submódulos**

El usuario invoca `/arch-init` desde una carpeta vacía y explica que la solución tendrá un backend y un frontend en repos separados; el backend ya existe en GitHub, el frontend hay que crearlo desde cero. Paso 1.0: a "¿cuántos repositorios de código componen esta solución?" el usuario confirma "más de uno". Se propone `pedidos-specs` como nombre del repo de especificaciones en la carpeta actual (ya estaba vacía y pensada para agrupar todo); el usuario acepta. Se ejecuta `git init` ahí. Para el backend, ya existe → se pide la URL y se agrega con `git submodule add https://github.com/…/pedidos-api backend`; para el frontend, hay que crearlo → se inicializa un repo vacío en `frontend/` y se agrega con `git submodule add ./frontend frontend`, advirtiendo que no tiene remoto todavía. `git submodule status` confirma ambos registrados.

Paso 1.1 ya quedó resuelto por el 1.0. Paso 1.2/1.3 corren por submódulo: `backend` tiene `package.json` con NestJS y varias rutas de negocio → "con implementación"; `frontend` está vacío → "sin código". Paso 2 (solo para `frontend`, en una tanda): a "¿qué quieres desarrollar en `frontend`?" el usuario ya había dicho "una SPA que consume el backend de pedidos" al identificar el repo en el 1.0, así que solo se completa con restricciones adicionales; se sugiere React + Vite y el usuario acepta, se ejecuta el scaffold.

Paso 3: se crean los siete archivos del harness en la raíz de `pedidos-specs`. Como `backend` y `frontend` se crearon en este mismo Paso 1.0, se proponen índices de arquitectura para ambos por defecto; el usuario no excluye ninguno → `docs/adr/README.md` + `docs/standards/README.md` se crean en `backend/` y en `frontend/`, cada uno con su propia serie `ADR-XXX`.

Paso 4, una vez por submódulo: para `backend` ("con implementación") se delega en un subagente que corre `arch-discover` completo sobre `backend/` como raíz de arquitectura — encuentra y crea 2 ADR por su cuenta; su compuerta de calidad ya tenía Jest, se completa con Supertest para los endpoints. Para `frontend` ("sin código", scaffold recién instalado) el candidato es "React + Vite" (dominio `frontend`); su compuerta de calidad no tenía nada → se configura Vitest + Testing Library. Paso 5.1: dos corridas de `arch-manage`, una por raíz — la de `frontend` documenta el candidato de stack y el de testing; la de `backend` no repite lo que ya creó `arch-discover`, solo agrega el candidato de Supertest. Paso 5.2: `AGENTS.md` en `pedidos-specs` queda con la tabla de tres filas — `pedidos-specs` (raíz, sin stack propio), `backend` (NestJS, Jest + Supertest) y `frontend` (React + Vite, Vitest + Testing Library). Paso 5.3: se confirma el cierre resumiendo la topología (repo de especificaciones + 2 submódulos), la situación y el stack de cada uno, y los ADR/estándares creados por raíz; se ofrece continuar con `work-define`.

---

## Handoffs

| Después de `arch-init`... | Skill natural siguiente | Contexto que pasa |
| -------------------------- | ------------------------ | -------------------- |
| Harness inicializado, listo para escribir requisitos | `work-define` | El stack y las convenciones ya viven en `AGENTS.md`/`docs/standards/`. Ofrecido explícitamente en el Paso 5.3. |
| Harness inicializado, hay trabajo técnico que planificar | `work-plan` | Ofrecido explícitamente en el Paso 5.3. |
| Se necesita investigar algo más allá del stack inicial | `work-research` | Puede referenciar el `RS-XXX` generado en el Paso 2.2. |
| Se quieren agregar más ADR/estándares después del cierre | `arch-manage` | Los índices `docs/adr/README.md` y `docs/standards/README.md` ya existen y se amplían, no se recrean. |
| Verificar cumplimiento de lo documentado | `arch-audit` | Lee `AGENTS.md` (incluido el stack) y `docs/standards/`. |
| Primer commit del harness | `git-commit` | El working tree recién creado por este skill. |
