---
name: adr-audit
description: >
  Auditar el cumplimiento de los Architecture Decision Records (ADRs de docs/adr/) y de las
  reglas de AGENTS.md contra el estado real del repositorio (Architecture Compliance Checking),
  y generar un informe priorizado en docs/adr/audits/audit-YYYY-MM-DD.md.
  Activar siempre que el usuario quiera verificar, auditar o comprobar si el código respeta las
  decisiones arquitectónicas o las reglas del proyecto — incluso si no dice "ADR" o "auditoría".
  Frases que activan este skill: "audita el cumplimiento", "¿el código respeta los ADR?",
  "verifica que seguimos las reglas de AGENTS.md", "revisa si cumplimos la arquitectura",
  "compliance de arquitectura", "qué decisiones estamos incumpliendo", "chequea las reglas del repo",
  "adr-audit", "/adr-audit". Usar también cuando el usuario sospeche que el repo se desvió de lo
  documentado y quiera un informe de brechas con acciones.
license: MIT
---

# Skill: adr-audit

Audita el **cumplimiento** de las normas arquitectónicas del proyecto contra el estado real del
código, y produce un informe de brechas priorizado. Es la variante de *Architecture Compliance
Checking*: no descubre decisiones nuevas (eso lo hace `adr-discover`) ni las documenta (eso lo hace
`adr-manage`); aquí se toman las normas **ya existentes** como el "deber ser" y se comparan contra
el "ser" del repositorio.

**Fuentes normativas (el "deber ser"):**
- `docs/adr/` — todos los ADR, priorizando los de estado `Accepted` (obligatorios). Los `Proposed`/`Draft` se listan pero no generan hallazgo con prioridad ni afectan el veredicto; los `Deprecated`/`Superseded` no generan hallazgos salvo que el código siga dependiendo de ellos.
- `AGENTS.md` (y `AGENTS.md` anidados por subcarpeta, si existen) — cada regla explícita del documento.
- `.agents/MEMORY.md` (si existe) — contexto de stack e idioma, **no** es fuente de reglas por sí mismo.

**Evidencia (el "ser"):** el código, la estructura de carpetas y los manifiestos de dependencias del repo.

**Método: inspección estática + fitness functions.** La verificación base es leer el repo con `find`,
`grep` y manifiestos. Cuando un ADR tenga una **fitness function** (chequeo automatizado de
arquitectura, en el sentido de *arquitectura evolutiva*), **ejecutarla**: su resultado es la evidencia
primaria del cumplimiento de ese ADR. No se corre el build ni la suite completa, solo los chequeos de
arquitectura detectados. Si una regla no puede confirmarse ni por inspección ni por una fitness
function, se marca *No verificable* y se anota qué evidencia haría falta — nunca inventar un veredicto.
Para cada ADR, el skill evalúa si es **apto** para una fitness function (cumplimiento objetivo y
automatizable), comprueba si ya existe y la ejecuta; si es apto pero no existe, **sugiere crearla**.

**Salida:** un único informe en `docs/adr/audits/audit-YYYY-MM-DD.md`, agrupado por prioridad
(alta / media / baja), donde cada hallazgo referencia el ADR o la regla de AGENTS.md incumplida,
lista evidencias y archivos infractores, propone una acción y fija un estado. El informe incluye
además una sección de **fitness functions**: cuáles existen y su resultado al ejecutarlas, y cuáles
faltan (ADR aptos sin fitness function) con la sugerencia de crearlas.

La plantilla canónica del informe está en `assets/audit-template.md`. **Leerla antes de redactar**
cualquier informe y respetar su estructura.

---

## Resolución de idioma

Decidir el idioma del informe y de los mensajes al usuario en este orden; detenerse en el primer paso que aplique:

1. Si en el contexto de la sesión existe una preferencia de idioma del usuario, usarla.
2. Si hay una preferencia registrada en la memoria del proyecto, usarla.
3. Si no, usar el idioma del mensaje del usuario y preguntar si desea persistir esa preferencia en la memoria del proyecto.
4. Si no se puede inferir, preguntar qué idioma prefiere; no decidir por cuenta propia.

Las rutas de archivo, nombres de ADR y salidas de comandos no se traducen.

---

## Fase 0 — Nueva auditoría o revalidación

Antes de auditar, comprobar si ya existen informes previos:

```bash
ls docs/adr/audits/audit-*.md 2>/dev/null
```

- **Si no hay ninguno:** proceder directamente con una **nueva auditoría desde cero** (Fase 1).
- **Si hay uno o varios:** localizar el **más reciente por la fecha del nombre** del archivo
  (`audit-YYYY-MM-DD.md`; ordenar por esa fecha, no por fecha de sistema) y usar la
  **herramienta de preguntas estructuradas** del cliente para preguntar cómo continuar,
  **mostrando el nombre del archivo detectado**:

  > "Encontré una auditoría previa: **audit-2026-06-30.md**. ¿Cómo quieres continuar?"
  > Opciones:
  > - **Revalidar `audit-2026-06-30.md`** — vuelve a comprobar cada hallazgo previo contra el estado actual y actualiza estados.
  > - **Nueva auditoría desde cero** — audita todas las normas de nuevo, ignorando el informe anterior.

  Una sola pregunta; opciones cortas y mutuamente excluyentes. Si el cliente no expone la
  herramienta, ofrecer las mismas opciones enumeradas en prosa (1 / 2).

### Comportamiento en Revalidación

1. Leer el informe previo elegido completo.
2. Reevaluar **cada hallazgo** contra el estado actual del repo (misma inspección estática).
3. Para cada uno, actualizar `Estado` y la columna de estado de acción:
   - Incumplimiento ya no presente → marcar acción como **✅ Resuelto** y mover el hallazgo a una sección "Resueltos desde la última auditoría".
   - Sigue presente → conservar/actualizar evidencias e incumplimientos con las rutas actuales.
   - Nuevo incumplimiento de la misma regla → añadirlo.
4. Detectar además **regresiones y hallazgos nuevos** aparecidos desde el informe anterior (no limitarse a las reglas ya listadas).
5. Escribir el resultado en un archivo **nuevo** `audit-<hoy>.md` (nunca sobrescribir el anterior; el histórico se conserva). En el encabezado, `Tipo de ejecución: Revalidación de audit-YYYY-MM-DD.md`.

En una **Nueva auditoría desde cero** se ignora el histórico para el análisis y se parte de la Fase 1.

---

## Fase 1 — Recopilar las normas (el "deber ser")

1. **ADRs** — listar y leer:
   ```bash
   ls docs/adr/ADR-*.md 2>/dev/null || echo "No hay ADRs"
   ```
   De cada ADR extraer: número, título, `Estado`, la sección `## Decision` (la regla auditable) y,
   si existe, la sección `## Fitness function` (declara `Apto`, `Estado`, `Herramienta`, `Ubicación`
   y `Comando`). Si el ADR incluye reglas concretas en `## Consecuencias`, considerarlas también.

2. **AGENTS.md** — leer el/los archivo(s):
   ```bash
   find . -maxdepth 3 -iname "AGENTS.md" -not -path "*/node_modules/*" 2>/dev/null
   ```
   Descomponer el documento en **reglas atómicas y verificables**. Ignorar prosa de contexto sin
   una regla accionable. A cada regla asignarle un identificador estable con el formato
   `AGENTS.md §<sección>` (p. ej. `AGENTS.md §APIs`).

3. **Contexto de stack** — leer `.agents/MEMORY.md` si existe, para saber lenguajes/frameworks y
   afinar los patrones de búsqueda (evita falsos negativos por buscar en el lenguaje equivocado).

Construir una **lista de reglas a auditar**: cada entrada = una norma (un ADR o una regla de
AGENTS.md) con su enunciado y su prioridad tentativa (ver criterios abajo).

### Clasificar aptitud para fitness function

Para cada ADR (y regla), marcar si es **apto** para una fitness function, es decir, si su
cumplimiento es **objetivo y automatizable**:

- **Apto** — se puede escribir un chequeo determinista que pase/falle sin juicio humano. Ejemplos: "las APIs son GraphQL, no REST", "la capa de dominio no importa infraestructura", "ningún módulo excede X dependencias", "cobertura ≥ 80%", "no se usa `any`".
- **No apto** — depende de criterio humano o evidencia externa al repo. Ejemplos: "el código debe ser legible", "las decisiones se toman por consenso", "usar TLS en producción". Estos se auditan por inspección o se marcan *No verificable*; **no** se sugiere fitness function.

Registrar la aptitud de cada ADR — se usa en la Fase 2B y en la sección de fitness functions del informe.

---

## Fase 2 — Verificar contra el repo (el "ser")

Para cada regla, reunir evidencia **a favor y en contra**. Esta fase incluye ejecutar la fitness
function del ADR cuando exista (Fase 2B): su resultado es la evidencia primaria y la inspección
estática lo complementa localizando los archivos infractores. Elegir la técnica de inspección según
el tipo de regla:

| Tipo de regla | Cómo verificar (ejemplos) |
|---|---|
| Tecnología obligatoria/prohibida (p. ej. "usar GraphQL, no REST") | `grep -rn` de patrones de la tecnología permitida y de la prohibida; contar ocurrencias y ubicarlas |
| Estructura / capas (p. ej. "Controller → Service → Repository") | `find` de carpetas esperadas; detectar archivos que saltan capas |
| Convención de nombres/ubicación | `grep`/`find` sobre rutas y nombres de archivo |
| Dependencia permitida/prohibida | Leer manifiestos (`package.json`, `pom.xml`, `pyproject.toml`, `*.csproj`, `go.mod`, `Cargo.toml`) |
| Prohibiciones de código (p. ej. "no usar `any`", "no `console.log`") | `grep -rn` del antipatrón |
| Límites de módulo / imports | `grep -rn` de imports que cruzan fronteras no permitidas |

Guías de verificación:
- **Cuantificar cuando sea posible:** "92% del código usa GraphQL; 3 endpoints REST nuevos". Los porcentajes y conteos hacen el hallazgo accionable.
- **Recolectar rutas exactas** de los archivos infractores — son la parte más útil del informe.
- **No correr el build ni la suite completa.** La única ejecución permitida son las fitness functions detectadas (Fase 2B). Si una regla solo se puede confirmar mirando un entorno externo (p. ej. "TLS en producción"), marcarla **❔ No verificable** y anotar qué evidencia haría falta.
- **No inventar incumplimientos.** Si no hay evidencia en contra, el estado es ✅ Cumplido.

### Estados de cada regla

- **✅ Cumplido** — sin evidencia en contra (o la fitness function pasa).
- **⚠️ Parcialmente cumplido** — mayoría cumple pero hay excepciones (como el ejemplo de ADR-012).
- **❌ Incumplido** — la regla no se respeta o hay infracciones sustanciales (o la fitness function falla).
- **❔ No verificable** — no se puede determinar por inspección estática ni con una fitness function ejecutable.

### Prioridad de cada hallazgo

Asignar prioridad al **incumplimiento** (no a la regla en abstracto):

- **🔴 Alta** — rompe un ADR `Accepted` de amplio impacto, introduce riesgo de seguridad/integridad, o infringe una regla de AGENTS.md marcada como obligatoria/bloqueante.
- **🟡 Media** — decisión relevante de alcance acotado, o desviación parcial sin riesgo inmediato.
- **⚪ Baja** — convenciones, estilo o impacto menor; desviaciones tolerables.

Una regla en estado ✅ Cumplido no genera hallazgo con prioridad, pero cuenta en el resumen ejecutivo.

---

## Fase 2B — Fitness functions

Para cada ADR **apto** (marcado en la Fase 1), determinar si ya existe una fitness function y, si
existe, ejecutarla para validar el cumplimiento.

### 1. Detectar fitness functions existentes

**Primero, leer la sección `## Fitness function` del propio ADR** (la escribe `adr-manage`). Es la
fuente más fiable: si declara `Estado: Creada` con `Ubicación` y `Comando`, usar ese comando
directamente. Si declara `Estado: Pendiente`, el ADR es apto pero aún no tiene fitness function →
va a las sugerencias (paso 3). Si declara `Apto: No` / `No aplica`, no automatizarlo.

Si la sección no existe o está incompleta (ADR antiguos, creados antes de esta convención), caer al
**rastreo heurístico** por señales del stack:

| Ecosistema | Herramientas / señales típicas |
|---|---|
| JVM (Java/Kotlin) | ArchUnit (`import com.tngtech.archunit`), tests `*ArchTest`, `*ArchitectureTest` |
| JS/TS | `dependency-cruiser` (`.dependency-cruiser.js`), `ts-arch`, reglas ESLint de `import/no-restricted-paths`, `eslint-plugin-boundaries` |
| .NET | `NetArchTest`, `ArchUnitNET` |
| Python | `import-linter` (`.importlinter`), `pytest-arch` |
| Cualquiera | scripts en `scripts/`, `tools/`, `arch/` con nombres como `check-architecture`, `fitness`, `compliance`; jobs de CI (`.github/workflows/*`, `.gitlab-ci.yml`, `azure-pipelines.yml`) con pasos de arquitectura |

```bash
# Rastreo genérico de fitness functions / chequeos de arquitectura
grep -rniE "archunit|dependency-cruiser|import-linter|netarchtest|ts-arch|fitness|arch.?test|boundaries" \
  . --include="*.*" -l 2>/dev/null | grep -viE "node_modules|/.git/" | head -40
find . -type f \( -iname "*archtest*" -o -iname "*fitness*" -o -iname ".dependency-cruiser*" -o -iname ".importlinter" \) \
  -not -path "*/node_modules/*" 2>/dev/null
```

Mapear cada fitness function encontrada al ADR que valida (por el nombre, comentarios, o la regla que comprueba). Un ADR puede no tener ninguna, tener una, o varias.

### 2. Ejecutar las fitness functions detectadas

Ejecutar **solo** el chequeo de arquitectura, no la suite completa, usando el comando más acotado disponible:

- Preferir el comando documentado en el `README`, `package.json` (script `arch`/`fitness`/`depcruise`), `Makefile` o el propio ADR.
- Ejemplos: `npx depcruise --config .dependency-cruiser.js src`, `mvn -Dtest=*ArchTest test`, `lint-imports`, `pytest -k arch`.
- Si el comando exacto es ambiguo o requiere instalar dependencias pesadas, **preguntar al usuario** con la herramienta de preguntas estructuradas antes de ejecutarlo, mostrando el comando propuesto. No ejecutar nada destructivo ni que modifique el repo.
- Capturar: comando corrido, resultado (**PASS / FAIL**), y las líneas relevantes de la salida (violaciones concretas con sus rutas). Si falla por entorno (falta un runtime/dependencia), registrar **No ejecutable** con el motivo, no marcarlo como incumplimiento.

Alimentar el resultado al estado del ADR en la Fase 2 (PASS → refuerza ✅; FAIL → ❌/⚠️ con las violaciones como `Incumplimientos`).

### 3. ADR aptos SIN fitness function

Si un ADR es **apto** pero no tiene fitness function, añadirlo a la lista de **sugerencias**. Para cada uno proponer:
- **Qué medir** — la característica arquitectónica a comprobar (la `## Decision` del ADR).
- **Herramienta sugerida** — según el stack (tabla de arriba).
- **Esbozo** — una frase de cómo sería el chequeo (p. ej. "regla dependency-cruiser: prohibir imports desde `src/api/**` que no sean del esquema GraphQL").

Esto no crea la fitness function (eso es otra tarea); solo la **recomienda** en el informe. Sugerir
además dejar constancia en el ADR: actualizar su sección `## Fitness function` (vía `adr-manage`)
con `Estado: Pendiente` y el esbozo, para que la próxima auditoría la descubra sin heurística.

---

## Fase 3 — Redactar el informe

1. Calcular la fecha de hoy:
   ```bash
   date +%F
   ```
2. Asegurar el directorio: `docs/adr/audits/` (crearlo si no existe).
3. Leer `assets/audit-template.md` y redactar `docs/adr/audits/audit-<hoy>.md` siguiendo su estructura:
   - Encabezado con fecha, alcance, método, fuentes normativas y tipo de ejecución.
     - **Alcance:** ser específico — indicar cuántos ADR se auditaron sobre el total y el desglose por estado de los excluidos, más las fuentes de AGENTS.md consideradas. Ejemplo: `10/12 · 1 Draft, 1 Superseded excluidos + AGENTS.md raíz`.
     - **Método:** no es un texto fijo — describir en una frase corta qué se usó realmente en esta auditoría: las técnicas de inspección aplicadas (p. ej. `grep`, lectura de manifiestos) y las fitness functions ejecutadas. Aclarar que no se corre el build ni la suite completa.
   - **Resumen ejecutivo** con la tabla de conteos por prioridad y estado, y un veredicto general.
   - Hallazgos **agrupados por prioridad** (alta → media → baja). Por cada hallazgo: la regla/ADR incumplido, `Estado`, `Evidencias` (✔ a favor / ✖ en contra), `Incumplimientos` (rutas de archivos), y `Acción sugerida`. Si el ADR tiene fitness function, incluir en `Evidencias` el resultado de ejecutarla (PASS/FAIL + comando).
   - **Fitness functions**: una sub-tabla de las **existentes** (ADR, herramienta, comando, resultado PASS/FAIL/No ejecutable) y una lista de las **sugeridas** (ADR apto sin fitness function → qué medir, herramienta y esbozo).
   - **Resumen de acciones** en tabla, cada una con su estado (⬜ Pendiente por defecto; en revalidación arrastrar y actualizar los estados previos). Incluir aquí las sugerencias de creación de fitness functions como acciones.
   - Sección de reglas **No verificables**.
4. **Nunca sobrescribir** un informe anterior: el nombre lleva la fecha para conservar el histórico. Si ya existe un `audit-<hoy>.md` del mismo día, actualizarlo (no duplicar).

### Formato de un hallazgo (referencia)

```
### ADR-012 — Uso de GraphQL para la capa de API
Fuente: docs/adr/ADR-012-graphql.md
Regla auditada: Toda API expuesta debe implementarse en GraphQL, no REST.
Estado: ⚠️ Parcialmente cumplido

Evidencias:
- ✔ 92% del código usa GraphQL
- ✖ Se encontraron 3 endpoints REST nuevos

Incumplimientos:
- src/UserController.php — expone rutas REST (`GET /users`)
- src/ProductController.php — expone rutas REST (`POST /products`)

Acción sugerida: Migrar los 3 endpoints a resolvers GraphQL, o registrar un ADR de excepción si REST es intencional aquí.
```

---

## Fase 4 — Confirmar

Al terminar, mostrar al usuario:
- Ruta del informe generado (`docs/adr/audits/audit-<hoy>.md`).
- El veredicto general y el conteo de hallazgos por prioridad (p. ej. "🔴 2 · 🟡 3 · ⚪ 1").
- Resumen de fitness functions: cuántas se ejecutaron (PASS/FAIL) y cuántas se sugiere crear.
- Si fue revalidación: cuántos hallazgos previos quedaron resueltos y cuántos nuevos aparecieron.

Ofrecer, sin ejecutarlo salvo que el usuario lo pida, el siguiente paso lógico: documentar
excepciones con `adr-manage`, crear las fitness functions sugeridas, o planificar la remediación de
los hallazgos de alta prioridad.

---

## Notas de comportamiento

- **Auditar, no arreglar.** Este skill diagnostica y propone; no modifica código de la aplicación ni "corrige" incumplimientos por iniciativa propia. Tampoco crea las fitness functions: las **sugiere**.
- **Ejecución acotada.** Solo se ejecutan las fitness functions / chequeos de arquitectura detectados, con comandos de solo lectura. Nunca correr scripts de propósito desconocido, ni comandos que instalen, desplieguen o modifiquen el repo; ante la duda, preguntar antes de ejecutar.
- **Rutas reales, no ejemplos.** Los `src/UserController.php` del ejemplo son ilustrativos; en el informe deben ir siempre rutas verdaderas del repo auditado.
- **No inventar reglas ni veredictos.** Solo se auditan normas que existan en `docs/adr/` o `AGENTS.md`. Ante evidencia ambigua, preferir ⚠️ o ❔ y explicar la duda, en vez de afirmar un incumplimiento.
- **Priorizar señal sobre volumen.** Mejor pocos hallazgos sólidos y bien evidenciados que una lista larga de detalles triviales.
- **Sin ADR ni AGENTS.md:** si no hay ninguna fuente normativa, informarlo y sugerir `adr-discover` (para descubrir decisiones) o crear un `AGENTS.md`; no fabricar un informe vacío de reglas inventadas.

---

## Referencias

- [Architecture Decision Records](https://github.com/joelparkerhenderson/architecture-decision-record)
- *Building Evolutionary Architectures* (Ford, Parsons, Kua) — concepto de fitness functions.
- Skills relacionados en este repositorio: `adr-manage` (crear/actualizar ADR), `adr-discover` (descubrir decisiones implícitas).
