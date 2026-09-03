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

El repositorio de especificaciones es el **proyecto principal** en una solución multi-repo: recibe el
harness completo (`AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`, `README.md`
raíz, y por defecto `docs/adr/README.md` + `docs/standards/README.md` — ver § 5) y actúa como **padre** del
resto de repositorios, agregados como submódulos en su raíz.

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
  del disco (texto libre).
- **Hay que crearlo** → no pedir nada más aquí; se crea vacío en el paso siguiente.

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

El repositorio de especificaciones **no tiene código de aplicación propio** — es harness y documentación —,
así que nunca pasa por clasificación de situación ni por detección/consecución de stack. Esos pasos aplican
a cada **submódulo**, uno por uno:

| Paso | Repo único | Multi-repo |
| ---- | ---------- | ---------- |
| 1.1 Repositorio git | Sobre el directorio de invocación | Ya resuelto en el § 2.2 de esta referencia; no se repite |
| 1.2 Clasificar la situación | Una vez | **Una vez por cada submódulo** — cada uno puede quedar en una situación distinta (uno "con implementación", otro "sin código") |
| 1.3 Detectar el stack | Una vez | **Una vez por cada submódulo**, sobre su propia raíz |
| 2 (conseguir el stack) | Si 1.2 dio "sin código" | **Por cada submódulo** que 1.2 haya clasificado "sin código" — si son varios a la vez, agrupar sus preguntas del 2.1 en una sola tanda (una sub-pregunta por submódulo), no una tanda por submódulo. Si al identificar el repositorio en el § 2.3 el usuario ya describió su propósito (p. ej. "este va a ser el backend de pedidos"), usar esa descripción para no repreguntar el 2.1 desde cero — solo completar lo que falte |
| 3 (placeholders del harness) | Sobre el directorio de invocación | Sobre el repo de especificaciones (§ 2.2) — nunca sobre un submódulo; ver § 5 sobre los índices de arquitectura |
| 4.1 / 4.2 (candidatos y compuerta de calidad) | Una vez, sobre la raíz principal | **Una vez por cada submódulo**, cada uno como su propia raíz de arquitectura — ver § 4 |
| 5.1 (documentar decisiones) | Una corrida de `arch-manage` | **Una corrida por submódulo** — cada uno con su propia serie `ADR-XXX`, igual que cualquier otra raíz de arquitectura (`../../reference/artifacts.md#raíz-de-arquitectura-adr-estándares-y-fitness-functions`) |
| 5.2 (stack en `AGENTS.md`) | Un stack | Una entrada por submódulo — ver § 6 |

No preguntar la situación ni el stack "para el proyecto" en general cuando es multi-repo: siempre es "para
`<nombre-del-submódulo>`".

## 4. Candidatos de arquitectura y compuerta de calidad por submódulo

Repetir `references/adr-candidates.md` y `references/quality-gate.md` completos por cada submódulo, usando
ese submódulo como la `<raíz-arq>` que ambas referencias resuelven. No consolidar los candidatos de
distintos submódulos en una sola lista ni en una sola invocación de `arch-manage`: cada raíz de arquitectura
se documenta y se delega por separado (la nota del Paso 4.1 sobre "pasar la raíz de arquitectura a los
subagentes" aplica una vez por submódulo). El resumen del cierre (Paso 5.3) sí agrega los resultados de
todos los submódulos en un solo reporte para el usuario.

## 5. Índices de arquitectura: todos por defecto

El Paso 3 de `SKILL.md` pregunta, cuando hay submódulos, para cuáles crear además sus propios
`docs/adr/README.md` + `docs/standards/README.md`. En modo multi-repo esa pregunta cambia de sentido según
el origen de los submódulos:

- **Submódulos creados en este mismo Paso 1.0** (la solución multi-repo se está armando ahora): crear los
  índices de arquitectura para **todos** por defecto — el Paso 4 les va a generar candidatos de todas
  formas, así que excluir uno de antemano no tiene sentido. Preguntar solo si el usuario quiere **excluir**
  alguno explícitamente, no para que los seleccione uno por uno.
- **Submódulos que ya existían antes de esta corrida** (p. ej. una reejecución de `arch-init` sobre un repo
  de especificaciones que ya tenía submódulos de antes): mantener la pregunta original de opt-in — para
  cuáles crear además sus propios índices, sin asumir que todos los quieren.

## 6. Formato del stack en `AGENTS.md` (multi-repo)

`AGENTS.md` sigue siendo la única fuente del stack, pero en modo multi-repo no hay un único stack que
describir: la sección `# Stack tecnológico` documenta el repositorio de especificaciones y cada submódulo
por separado, en una tabla:

```markdown
# Stack tecnológico

| Repositorio | Stack |
| ------------ | ----- |
| `<repo-specs>` (raíz) | Repositorio de especificaciones — sin stack de aplicación propio (harness y documentación) |
| `<submódulo-1>` | Lenguaje(s), framework(s) y versión, gestor de paquetes/build, capas de testing configuradas |
| `<submódulo-2>` | … |
```

Una fila por submódulo, con el mismo nivel de detalle que el Paso 5.2 exige hoy para un repo único
(lenguaje, framework, versión, build, testing) — solo que repetido por repositorio en vez de una sola vez.

## 7. Qué no cambia

- El harness (`AGENTS.md`, `CLAUDE.md`, `.agents/MEMORY.md`, `.sdd-devkit/settings.json`) sigue siendo
  **uno solo**, en la raíz principal — nunca se duplica ni se reparte entre submódulos.
- `.sdd-devkit/settings.json` no gana ninguna clave nueva para describir la topología: `.gitmodules`, que
  git ya mantiene, es la fuente de verdad de qué submódulos existen y dónde. No duplicar esa lista en
  `settings.json` ni en ningún otro archivo del harness.
- El resto de reglas del Paso 3 (idempotencia, migración de formato, README.md raíz) aplican igual sobre
  el repo de especificaciones que sobre un repo único.
