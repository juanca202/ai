# Topología del proyecto: repo único vs. multi-repo

Leer esta referencia en el **Paso 1.0** de `SKILL.md`, antes de decidir si hace falta crear un repositorio
de especificaciones. Define también cómo cambian los Pasos 1.2, 1.3, 2, 3, 4 y 5.2 cuando la solución
abarca más de un repositorio.

## 1. Determinar la topología

Preguntar es la regla, no la excepción: a diferencia de la clasificación de situación (§ 2 de
`stack-detection.md`), aquí no hay señales de código que inferir con confianza — la topología depende de
cómo el usuario organiza sus repositorios, no de lo que hay en el directorio actual. Antes de preguntar,
sí vale la pena revisar el contexto ya disponible (la descripción de la necesidad si el usuario ya la dio,
o varios directorios hermanos con su propio `.git` junto al punto de invocación) para **prellenar** la
pregunta, no para saltarla en silencio.

Preguntar con la herramienta de preguntas estructuradas: *"¿Cuántos repositorios de código componen esta
solución?"* — opciones `Uno solo` / `Más de uno (voy a necesitar un repo de especificaciones)`.

- **Uno solo** → sin cambios de comportamiento. Continuar en el Paso 1.1 tal cual, sobre el directorio
  desde el que se invocó el skill. El resto de esta referencia no aplica.
- **Más de uno** → seguir con § 2. El resto del flujo (Pasos 1.1 en adelante) pasa a operar sobre el
  **repositorio de especificaciones**, no sobre el directorio de invocación.

## 2. Crear el repositorio de especificaciones

El repositorio de especificaciones es el **proyecto principal** en una solución multi-repo: es la raíz que
recibe los artefactos que son **únicos** en toda la solución (`.agents/MEMORY.md`, `.sdd-devkit/settings.json`)
y actúa como **padre** del resto de repositorios, agregados como submódulos en su raíz. `AGENTS.md`,
`CLAUDE.md` y `README.md` **no** son únicos — cada submódulo recibe su propia copia; ver § 4.

Este repositorio es, por definición, **"Solo specs"** (`stack-detection.md § 2`): no tiene ni va a tener
código de aplicación propio — es harness y documentación. Esa clasificación no se le pregunta ni se evalúa,
es automática, y trae dos consecuencias que se aplican en todo lo que sigue: nunca pasa por el Paso 2
(conseguir stack) ni por el Paso 4 (candidatos de arquitectura / compuerta de calidad) para sí mismo, y
**nunca recibe sus propios** `docs/adr/README.md` ni `docs/standards/README.md` — ver § 6. Un submódulo, en
cambio, sí puede resultar "Solo specs" en su propio Paso 1.2 (p. ej. un submódulo que solo contiene
documentación) — ahí no es automático, se clasifica igual que cualquier repo único.

### 2.1 Nombre y ubicación

Proponer un nombre y una ubicación por defecto, y confirmarlos con el usuario (no inventar en silencio, no
abrir una pregunta de texto libre si una propuesta concreta basta):

- **Nombre por defecto:** `<nombre-de-la-solución>-specs` — el nombre de la solución sale de lo que el
  usuario ya haya descrito; si no hay nada, preguntarlo como parte de la misma tanda.
- **Ubicación por defecto:** carpeta hermana al directorio desde el que se invocó el skill (mismo nivel),
  salvo que ese directorio ya esté vacío y pensado para contener todo — en ese caso, usarlo directamente
  como raíz del repo de especificaciones en vez de crear una carpeta hermana.

Preguntar: *"¿Uso `<nombre-propuesto>` en `<ubicación-propuesta>` para el repo de especificaciones?"* —
opciones `Sí, usar esa propuesta` / `Prefiero otro nombre o ubicación` (texto libre si elige esta opción).

### 2.2 Inicializar

- Si la ruta propuesta (o la que dio el usuario) **no existe todavía**: crear el directorio y `git init`
  ahí, igual que el Paso 1.1 haría sobre un repo único.
- Si el usuario indica que el repo de especificaciones **ya existe** (lo creó de antemano, con o sin
  contenido): usarlo tal cual, sin reinicializar ni tocar su configuración existente — mismo criterio que
  el Paso 1.1 aplica a un repo único ya existente.

A partir de aquí, este repositorio es "la raíz principal" para el resto del flujo: el Paso 1.1 (si hizo
falta `git init`) ya quedó resuelto por este mismo paso: no se repite.

### 2.3 Identificar cada repositorio adicional

Por cada repositorio que la solución vaya a usar (además del de especificaciones), preguntar — agrupando
todos en la misma tanda si son varios — si **ya existe o hay que crearlo**, mismo patrón que usa el resto
del catálogo para esta distinción (p. ej. `/requirement-refine` con "nuevo o existente"):

*"¿El repositorio `<nombre>` ya existe (local o remoto) o hay que crearlo desde cero?"* — opciones
`Ya existe` / `Hay que crearlo`.

- **Ya existe** → pedir la referencia: una URL remota, o una ruta local si ya está clonado en otro lugar
  del disco (texto libre). Aprovechar la misma respuesta para capturar, en una frase, el **rol de ese
  repositorio** dentro de la solución (p. ej. "el backend de pedidos") — se reutiliza en el Paso 2 (si
  aplica) y en la descripción de su `README.md` (§ 4.3), para no repreguntarlo.
- **Hay que crearlo** → no pedir nada más aquí; se crea vacío en el paso siguiente. Capturar igual el rol
  que va a cumplir, por la misma razón.

### 2.4 Agregar los submódulos

Para cada repositorio, desde la raíz del repo de especificaciones:

| Caso | Comandos |
| ---- | -------- |
| Ya existe, con URL remota | `git submodule add <url> <nombre>` |
| Ya existe, solo local (sin remoto todavía) | `git submodule add <ruta-local-o-relativa> <nombre>` — advertir que otros clones del repo de especificaciones no podrán descargar este submódulo hasta que se le agregue un remoto y se actualice con `git submodule set-url <nombre> <url>` |
| Hay que crearlo | `mkdir <nombre> && cd <nombre> && git init` para crear el repo vacío, luego `git submodule add <ruta-relativa> <nombre>` desde la raíz del repo de especificaciones — misma advertencia sobre remoto pendiente que el caso anterior |

Al terminar con todos, ejecutar `git submodule status` y confirmar al usuario la lista de submódulos
registrados antes de seguir. No hacer commit de `.gitmodules` ni de los submódulos — igual que el resto
del harness, el primer commit queda para `git-commit` a pedido del usuario.

## 3. Cómo cambian los pasos siguientes

El repositorio de especificaciones **no tiene código de aplicación propio** — así que nunca pasa por
clasificación de situación ni por detección/consecución de stack. Esos pasos aplican a cada **submódulo**,
uno por uno:

| Paso | Repo único | Multi-repo |
| ---- | ---------- | ---------- |
| 1.1 Repositorio git | Sobre el directorio de invocación | Ya resuelto en el § 2.2 de esta referencia; no se repite |
| 1.2 Clasificar la situación | Una vez | **Una vez por cada submódulo** — cada uno puede quedar en una situación distinta (uno "con implementación", otro "sin código", otro "Solo specs"), nunca en el repo de especificaciones (siempre "Solo specs", automático) |
| 1.3 Detectar el stack | Una vez | **Una vez por cada submódulo**, sobre su propia raíz (salvo que ese submódulo sea "Solo specs") |
| 2 (conseguir el stack) | Si 1.2 dio "sin código" | **Por cada submódulo** que 1.2 haya clasificado "sin código" (nunca si dio "Solo specs") — si son varios a la vez, agrupar sus preguntas del 2.1 en una sola tanda (una sub-pregunta por submódulo), no una tanda por submódulo. Si al identificar el repositorio en el § 2.3 el usuario ya describió su rol (p. ej. "este va a ser el backend de pedidos"), usar esa descripción para no repreguntar el 2.1 desde cero — solo completar lo que falte |
| 3 (placeholders del harness) | Sobre el directorio de invocación | `AGENTS.md`, `CLAUDE.md` y `README.md` se crean **en el repo de especificaciones y en cada submódulo** (§ 4); `.agents/MEMORY.md`, `.sdd-devkit/settings.json` y `.gitignore` solo en el repo de especificaciones; `docs/adr/README.md` + `docs/standards/README.md` siguen su propia lógica por raíz de arquitectura, **nunca** en el repo de especificaciones ni en un submódulo "Solo specs" (§ 6) |
| 4.1 / 4.2 (candidatos y compuerta de calidad) | Una vez, sobre la raíz principal | **Una vez por cada submódulo que no sea "Solo specs"**, cada uno como su propia raíz de arquitectura — ver § 5. Nunca sobre el repo de especificaciones ni sobre un submódulo "Solo specs" |
| 5.1 (documentar decisiones) | Una corrida de `arch-manage` | **Una corrida por submódulo** — cada uno con su propia serie `ADR-XXX`, igual que cualquier otra raíz de arquitectura (`../../reference/artifacts.md#raíz-de-arquitectura-adr-estándares-y-fitness-functions`) |
| 5.2 (stack en `AGENTS.md`) | Un stack, en el único `AGENTS.md` | Cada submódulo escribe su propio stack en su propio `AGENTS.md`; el `AGENTS.md` del repo de especificaciones resume con una tabla que enlaza a cada uno — ver § 7 |

No preguntar la situación ni el stack "para el proyecto" en general cuando es multi-repo: siempre es "para
`<nombre-del-submódulo>`".

## 4. `AGENTS.md`, `CLAUDE.md` y `README.md`: uno por repositorio

A diferencia de `.agents/MEMORY.md` y `.sdd-devkit/settings.json` (únicos, solo en el repo de
especificaciones — § 8), estos tres archivos **no son artefactos únicos de la solución**: cada repositorio
—el de especificaciones y cada submódulo— tiene su propio código, su propio estilo y potencialmente su
propio stack, y un agente que trabaje directamente dentro de un submódulo (sin pasar por el repo de
especificaciones) necesita encontrar ahí sus propias instrucciones. Por eso el Paso 3 los crea **en la raíz
principal y en cada submódulo**, no solo en la raíz principal.

Antes de escribir el `AGENTS.md` de un submódulo, resolver primero para ese submódulo el punto 4-5 del
Paso 3 (si recibe o no sus propios índices de arquitectura, § 6) — la plantilla de abajo depende de esa
respuesta.

### 4.1 `AGENTS.md` de la raíz principal (repo de especificaciones)

Copiar `assets/agents-template.md`, pero **sin** las líneas de `docs/adr/README.md` ni
`docs/standards/README.md` de Fuentes de contexto — este repositorio es siempre "Solo specs" (§ 1) y nunca
recibe esos dos índices (§ 6), así que apuntar a ellos dejaría un enlace roto; el resto de Fuentes de
contexto (`.agents/MEMORY.md`, `README.md`) sí queda local, a diferencia de un submódulo. La sección
`# Stack tecnológico` también difiere de un repo único — ver § 7.

### 4.2 `AGENTS.md` de cada submódulo

Copiar `assets/agents-submodule-template.md` (no el de la raíz principal — la sección **Fuentes de
contexto** difiere porque este repositorio no tiene su propio `.agents/MEMORY.md` ni, salvo que haya
recibido índices propios, su propio `docs/adr/`):

- `@../.agents/MEMORY.md` — siempre apunta al repo de especificaciones; un submódulo nunca tiene su propio
  `MEMORY.md`.
- `docs/adr/README.md` / `docs/standards/README.md` — ruta **local** (`docs/adr/README.md`) si este
  submódulo recibió sus propios índices en el Paso 3, puntos 4-5; ruta al **padre**
  (`../docs/adr/README.md` / `../docs/standards/README.md`) si no los recibió.
- `README.md` — siempre local (§ 4.3).
- `@../README.md` — enlace de vuelta a la descripción de la solución completa, en el repo de
  especificaciones.

La sección `# Stack tecnológico` de un `AGENTS.md` de submódulo es la **única fuente del stack de ese
repositorio** — mismo formato de un repo único (no la tabla-resumen que usa la raíz principal), y se
completa en el Paso 5.2 de ese mismo submódulo.

### 4.3 `CLAUDE.md` de cada repositorio

Idéntico en todos: copiar `assets/claude-template.md` tal cual (`@AGENTS.md`). No cambia entre raíz
principal y submódulo porque el include es relativo al propio archivo — siempre apunta al `AGENTS.md`
local de ese mismo repositorio.

### 4.4 `README.md` de cada repositorio

Misma regla que el Paso 3.4 (1-2 párrafos, cerca del inicio, sin plantilla de secciones fija), aplicada por
repositorio:

- **Repo de especificaciones:** describe la solución completa.
- **Cada submódulo:** describe **ese repositorio específico** — su rol dentro de la solución. Si el usuario
  ya lo describió al identificar el repositorio (§ 2.3) o al capturar la necesidad en el Paso 2.1, usar esa
  descripción en vez de volver a preguntar; solo abrir la pregunta abierta del 3.4 si no alcanza para
  redactarla con confianza.

### 4.5 Idempotencia y migración por repositorio

Los criterios de [Idempotencia / reejecución](../SKILL.md#idempotencia--reejecución) y
[3.1 Migración de formato](../SKILL.md#31-migración-de-formato) del `SKILL.md` se aplican **por
repositorio**: un submódulo puede ya tener su propio `AGENTS.md`/`CLAUDE.md`/`README.md` (escrito a mano o
por otra herramienta) sin que eso diga nada sobre el estado del repo de especificaciones, y viceversa —
comparar cada copia contra la plantilla que le corresponde (`agents-template.md` en la raíz,
`agents-submodule-template.md` en cada submódulo) y aplicar la migración de cada una por separado, aunque
se agrupen todas en la misma tanda de confirmación (regla general del punto 6 de 3.1).

## 5. Candidatos de arquitectura y compuerta de calidad por submódulo

Repetir `references/adr-candidates.md` y `references/quality-gate.md` completos por cada submódulo, usando
ese submódulo como la `<raíz-arq>` que ambas referencias resuelven. No consolidar los candidatos de
distintos submódulos en una sola lista ni en una sola invocación de `arch-manage`: cada raíz de arquitectura
se documenta y se delega por separado (la nota del Paso 4.1 sobre "pasar la raíz de arquitectura a los
subagentes" aplica una vez por submódulo). El resumen del cierre (Paso 5.3) sí agrega los resultados de
todos los submódulos en un solo reporte para el usuario.

## 6. Índices de arquitectura: todos por defecto, salvo "Solo specs"

**El repositorio de especificaciones nunca recibe `docs/adr/README.md` ni `docs/standards/README.md`
propios** — es "Solo specs" por definición (§ 1), no hay código ahí que una decisión de arquitectura pueda
describir. Esto no se pregunta ni admite opt-in: es automático, sin excepción.

Para los **submódulos**, el Paso 3 de `SKILL.md` pregunta para cuáles (de los que no sean "Solo specs")
crear además sus propios `docs/adr/README.md` + `docs/standards/README.md`. En modo multi-repo esa pregunta
cambia de sentido según el origen del submódulo:

- **Submódulos creados en este mismo Paso 1.0** (la solución multi-repo se está armando ahora) que **no**
  resultaron "Solo specs" en su propio Paso 1.2: crear los índices de arquitectura para **todos** por
  defecto — el Paso 4 les va a generar candidatos de todas formas, así que excluir uno de antemano no tiene
  sentido. Preguntar solo si el usuario quiere **excluir** alguno explícitamente, no para que los
  seleccione uno por uno.
- **Submódulos que ya existían antes de esta corrida** (p. ej. una reejecución de `arch-init` sobre un repo
  de especificaciones que ya tenía submódulos de antes) que no sean "Solo specs": mantener la pregunta
  original de opt-in — para cuáles crear además sus propios índices, sin asumir que todos los quieren.
- **Cualquier submódulo clasificado "Solo specs"** (en cualquiera de los dos casos anteriores): nunca recibe
  índices propios, ni se le pregunta — mismo criterio automático que el repositorio de especificaciones.

Esta decisión se resuelve **antes** de escribir el `AGENTS.md` de cada submódulo (§ 4.2), porque su
sección Fuentes de contexto depende de ella.

## 7. Formato del stack en `AGENTS.md` (multi-repo)

Cada repositorio es dueño de su propio stack (§ 4.2), así que el `AGENTS.md` del repo de especificaciones
no repite el detalle — resume con una tabla que enlaza al `AGENTS.md` de cada submódulo:

```markdown
# Stack tecnológico

Repositorio de especificaciones — sin stack de aplicación propio (harness y documentación). Stack de cada
repositorio de la solución:

| Repositorio | Stack | Detalle |
| ------------ | ----- | ------- |
| `<submódulo-1>` | Resumen de una línea (lenguaje/framework principal) | [`<submódulo-1>/AGENTS.md`](<submódulo-1>/AGENTS.md#stack-tecnológico) |
| `<submódulo-2>` | … | [`<submódulo-2>/AGENTS.md`](<submódulo-2>/AGENTS.md#stack-tecnológico) |
```

El `AGENTS.md` de cada submódulo, en cambio, escribe su `# Stack tecnológico` con el mismo detalle que un
repo único (lenguaje, framework, versión, build, testing) — es la fuente real, no un resumen. Un submódulo
clasificado "Solo specs" es la excepción: no tiene stack que escribir, así que su `# Stack tecnológico`
queda en `No aplica — repositorio de solo especificaciones`, igual que un repo único "Solo specs" — la tabla
del repositorio de especificaciones puede seguir enlazándolo, mostrando ese mismo texto como resumen.

## 8. Qué sigue siendo único

- **`.agents/MEMORY.md`** y **`.sdd-devkit/settings.json`** viven **solo** en el repo de especificaciones —
  nunca se crean, ni se duplican, dentro de un submódulo. Preferencias y configuración del plugin son de la
  solución completa, no de un repositorio individual.
- El repositorio de especificaciones es siempre **"Solo specs"** (§ 1): nunca pasa por el Paso 2 ni por el
  Paso 4, y nunca recibe sus propios `docs/adr/README.md` ni `docs/standards/README.md` (§ 6) — esto no
  cambia según cómo se haya armado la solución multi-repo, es inherente a lo que es ese repositorio.
- `.sdd-devkit/settings.json` no gana ninguna clave nueva para describir la topología: `.gitmodules`, que
  git ya mantiene, es la fuente de verdad de qué submódulos existen y dónde. No duplicar esa lista en
  `settings.json` ni en ningún otro archivo del harness.
- El resto de reglas del Paso 3 (idempotencia, migración de formato) aplican igual sobre cada repositorio
  que sobre un repo único — ver § 4.5.
