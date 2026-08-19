# Flujo · Analizar migración (origen → destino)

Procedimiento del flujo **Analizar migración** de `work-research`: a partir de un **proyecto
origen** y uno **destino**, produce el **discovery** y la **preparación de
validación**, dimensiona el cambio y hace *handoff* a `work-define` o `work-plan`.

> **Qué produce este flujo (y qué no).** Produce el `discovery.md` y el
> `validation.md` (con su carpeta `validation/`) como archivos adicionales dentro
> de la carpeta `research/RS-XXX-{slug}/`, más el `README.md` (informe principal).
> **No genera el plan de implementación:** eso lo continúan `work-define` (si el
> cambio es grande) o `work-plan` (si es pequeño). La migración vive como una
> investigación `RS-XXX`.

**Entregable:** un `RS-XXX` en el **proyecto destino** con `README.md` (informe
principal, [`assets/research-template.md`](../../assets/research-template.md)),
`discovery.md` ([`assets/migrate/discovery-template.md`](../../assets/migrate/discovery-template.md))
y `validation.md` ([`assets/migrate/validation-template.md`](../../assets/migrate/validation-template.md)),
más la carpeta `validation/` si se almacenan recursos.

**Pregunta de investigación:** el objetivo de la migración — qué se migra y de qué
origen a qué destino. Confirmarlo con el usuario antes de investigar.

> **Este flujo reserva su `RS-XXX` al empezar.** El `discovery.md` y el `validation.md`
> se escriben durante la investigación, así que la carpeta `research/RS-XXX-{slug}/` se
> crea antes del Paso 1 —no en el Paso 5 de `SKILL.md`—. Los estados (`Draft` /
> `Ready`) se fijan al cerrar cada archivo.

El flujo es **secuencial y con compuertas**: no se prepara la validación hasta que
el discovery esté en `Ready`, y no se hace *handoff* hasta que discovery **y**
validación estén en `Ready`.

## Principios rectores

1. **Verificar antes de mover.** Sin una estrategia de verificación del comportamiento
   actual del origen, la migración no se puede validar: el discovery no llega a `Ready`.
2. **El comportamiento observable manda.** Lo que se migra es el comportamiento, no la
   estructura: los casos de Golden Master fijan la vara, no el parecido del código.
3. **Nada se infiere de los nombres.** Stack, versiones y dependencias se leen de los
   manifiestos de **ambos** proyectos, no del nombre del repo ni de la memoria.
4. **Dimensionar es parte del trabajo.** El *handoff* correcto (varias US o un solo WI)
   depende del dimensionamiento; entregarlo sin dimensionar deja la decisión huérfana.
5. **Este flujo no planifica.** Produce discovery y validación; el plan lo crean
   `work-define` o `work-plan`.

## Ubicación de la carpeta

La investigación de migración se guarda en el **proyecto destino**:

```text
<destino>/docs/specs/research/
└── RS-XXX-{slug}/
    ├── README.md        # informe principal (plantilla assets/research-template.md)
    ├── discovery.md      # Paso 1  (plantilla assets/migrate/discovery-template.md)
    ├── validation.md     # Paso 2  (plantilla assets/migrate/validation-template.md)
    └── validation/       # recursos de validación (JSON, imágenes, Mermaid, …)
```

- `{slug}`: descripción corta de la migración en *kebab-case* (sin acentos), p. ej.
  `orm-sequelize-a-prisma`, `auth-passportjs-a-authjs`.
- `XXX`: secuencial de tres dígitos, calculado sobre las carpetas `RS-XXX-*`
  existentes en `<destino>/docs/specs/research/` **y en
  `<destino>/docs/specs/archive/research/`** (mayor + 1 entre las dos; `001` si no hay
  ninguna). Archivar una investigación **no libera su número**. Ver
  [`work-integrate/references/archive.md`](../../../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).

## Destino fragmentado

Cuando el origen se reparte entre **varios** proyectos destino, **cada proyecto
destino tiene su propia carpeta** `RS-XXX-{slug}/` con su `discovery.md`,
`validation.md` y `README.md`, acotados a la porción del origen que recibe. Usa el
**mismo `{slug}`** en todos para trazabilidad; calcula `XXX` como el siguiente libre
considerando el número **más alto entre todos** los `docs/specs/research/` —y sus
`docs/specs/archive/research/`— de los destinos involucrados. En este documento "el
destino" se refiere a **cada** proyecto destino cuando está fragmentado.

## Entradas necesarias

1. **Qué se va a migrar** (un módulo, una feature, dependencias, el proyecto
   completo).
2. **Proyecto origen** y **proyecto(s) destino**: idealmente las rutas a los repos.
   El destino puede ser uno o varios. Si solo hay descripciones, trabajar con eso y
   dejar constancia de los supuestos. No inventar rutas ni stacks.

---

## Paso 1 — Discovery (`discovery.md`)

### 1. Inferir el stack de ambos proyectos

Inspecciona los manifiestos/configuración de cada proyecto para deducir lenguaje,
framework, librerías clave, build, base de datos, etc., **con versión** cuando
exista. Pistas: `package.json`/`tsconfig.json` (Node/TS), `requirements.txt`/
`pyproject.toml` (Python), `pom.xml`/`build.gradle` (Java/Kotlin), `go.mod` (Go),
`Gemfile` (Ruby), `composer.json` (PHP), `*.csproj` (.NET), `Cargo.toml` (Rust),
`Dockerfile`/CI/config de DB (infra). Céntrate en lo **relevante para lo que se
migra**. Anota la versión exacta; si no se determina, `sin versión`.

### 2. Construir el mapeo tecnológico

Para cada elemento relevante del **origen**, busca su equivalente en el **destino**.
Si el destino ya usa algo que cumple la función, esa es la equivalencia (con
versión); si no, escribe `⚠️ Sin equivalente identificado`. Tabla de cuatro
columnas: **Elemento**, **Origen (con versión)**, **Destino (equivalente o nota)**,
**Equivalencia**.

| Equivalencia | Significado |
| ------------ | ----------- |
| Directa | Existe reemplazo casi 1:1 |
| Adaptación | Existe reemplazo pero requiere cambios |
| Rediseño | No existe reemplazo directo; debe rediseñarse |
| Eliminar | Ya no es necesario en destino |
| Pendiente | Aún no decidido |

### 3. Documentar la estrategia de verificación existente

Inventaría todo lo que pueda demostrar que la migración conserva el comportamiento
(unit/integración/E2E, colecciones de API, datos productivos anonimizados, logs)
en una tabla: **Tipo**, **Cobertura**, **Ubicación**, **Utilidad para la
migración**. Registra también el **entorno del origen**: si tiene un ambiente
accesible vía web y su **URL** de pruebas (permite extraer insumos con el **MCP de
Chrome** en el Paso 2).

### 4. Identificar oportunidades de Golden Master Testing

Qué componentes son candidatos a validarse con Golden Master, en una tabla:
**Componente**, **Fuente disponible** (unit tests, logs de producción, datos
históricos) y **Viabilidad** (Alta/Media/Baja).

### 5. Identificar riesgos

Tabla: **Riesgo**, **Impacto** (Alto/Medio/Bajo) y **Mitigación** concreta
(backups, UAT, pruebas, mocking de integraciones).

### 6. Cerrar lagunas con preguntas estructuradas

Antes de fijar el estado, intenta resolver cualquier **laguna** del discovery
(stack sin identificar, equivalencias en `Pendiente`, viabilidad de Golden Master
sin confirmar, supuestos faltantes) con la herramienta de preguntas estructuradas.
El objetivo es dejar el discovery en **`Ready`**. Si no se resuelven todas, queda en
**`Draft`** y en `Notas` se listan todos los pendientes.

### 7. Determinar el estado y escribir `discovery.md`

- **Ready**: sin pendientes en `Notas` y ninguna equivalencia en **Pendiente**.
- **Draft**: hay pendientes en `Notas`, alguna equivalencia **Pendiente**, o
  información incompleta.

Copia `assets/migrate/discovery-template.md`, **renómbrala a `discovery.md`** dentro
de la carpeta `research/RS-XXX-{slug}/` y rellénala siguiendo la plantilla.

> **No se prepara la validación (Paso 2) ni se hace el handoff (Paso 3) si el
> discovery no está en `Ready`.**

---

## Paso 2 — Preparación de validación (`validation.md`)

Solo empieza con el discovery en **`Ready`**. Para cada caso/oportunidad sigue
[golden-master-testing.md](./golden-master-testing.md).

1. **Crear los casos de validación** a partir de la tabla "Oportunidades para
   Golden Master Testing" del discovery (uno o varios por componente).
2. **Obtener inputs/outputs de cada caso, o marcarlo pendiente.** Orden de
   preferencia: (a) reutilizar artefactos de validación existentes del origen (unit,
   integración, E2E, UAT, datos históricos, ejemplos documentados); (b) capturar la
   salida del sistema origen cuando sea ejecutable. Cada caso tiene su propio
   `Estado` (**`Pendiente`** = faltan insumos; **`Listo`** = golden master listo),
   distinto del estado del documento.

   > El Golden Master captura el comportamiento **actual**, que puede incluir
   > errores. Antes de fijar una salida de referencia, confirma con el usuario si
   > algún comportamiento actual es un **bug que NO debe preservarse**; documéntalo
   > como excepción para no "congelar" el error en el destino.

3. **Resolver los casos pendientes al final.** Usa la herramienta de preguntas
   estructuradas para obtener los recursos que faltan. Si el usuario indica cómo
   levantar la información desde el ambiente de pruebas del origen y el discovery
   registró su **URL** (y el **MCP de Chrome** está disponible), navega a esa URL
   para resolver los pendientes.
4. **Guardar casos y recursos.** Los recursos extraídos (entradas, salidas de
   referencia, capturas, diagramas) se almacenan en `validation/` dentro de la
   carpeta `RS-XXX-{slug}/` y se referencian desde `validation.md`. Cobertura mínima
   por caso: un escenario exitoso, un caso límite y un caso de error/validación.
5. **Estado de `validation.md`.** **Ready** si no hay casos en `Pendiente` ni
   pendientes en `Notas`; **Draft** en caso contrario.

Copia `assets/migrate/validation-template.md`, **renómbrala a `validation.md`** y
rellénala. Enlaza el discovery con `[discovery.md](./discovery.md)`.

---

## Paso 3 — Dimensionar el cambio y hacer *handoff*

Solo cuando **discovery** y **validación** están en **`Ready`**. Este skill **no**
crea el plan de implementación; decide **quién lo continúa** según el tamaño del
cambio.

### 1. Redactar el informe principal (`README.md`)

Con `assets/research-template.md`: pregunta de investigación (qué se migra,
origen→destino), contexto, hallazgos clave del discovery, riesgos, y en
**"Impacto en el artefacto / próximo paso"** el dimensionamiento y el handoff
recomendado. Enlaza `discovery.md` y `validation.md` en "Archivos adicionales".

### 2. Dimensionar el cambio (¿grande o pequeño?)

Evalúa el tamaño y la complejidad de la migración a partir del discovery. Señales
de **cambio grande** (→ `work-define`, varias US):

- Muchos elementos en el mapeo, o varios con equivalencia **Rediseño**.
- Afecta múltiples módulos, contratos o dependientes; o el destino está
  **fragmentado** en varios proyectos.
- Requiere una estrategia incremental por fases (Strangler Fig, Branch by
  Abstraction, arquitectura transitoria — ver
  [migration-strategies.md](./migration-strategies.md)) que conviene descomponer en
  varias unidades de trabajo.

Señales de **cambio pequeño** (→ `work-plan`, un `WI-XXX`):

- Pocos elementos, mayormente equivalencia **Directa** o **Adaptación**.
- Superficie de impacto acotada a un módulo o dependencia, sin fragmentación.
- Se puede ejecutar como una sola unidad de mantenimiento autocontenida.

Ante duda, **preguntar al usuario** con la herramienta estructurada mostrando el
dimensionamiento propuesto y su justificación.

### 3. Ofrecer el *handoff*

Presenta la recomendación y ofrece continuar (herramienta estructurada):

- **Cambio grande → `work-define`.** Crear varias US que descompongan la migración;
  cada US se planifica luego con `work-plan` (TK) y se implementa con
  `work-implement`. La migración incremental (fases/estrategia) se materializa como
  las US/TK correspondientes.
- **Cambio pequeño → `work-plan`.** Crear una tarea de mantenimiento (`WI-XXX`) que ejecute la
  migración como una unidad; se implementa con `work-implement`.

En ambos casos el `RS-XXX` (con su `discovery.md` y `validation.md`) es la
**referencia** del trabajo que se cree. Los casos de Golden Master del
`validation.md` son el insumo de validación de las pruebas de esas US/WI.

> **Destino fragmentado:** dimensiona y ofrece el handoff **por cada** proyecto
> destino (cada uno tiene su propio `RS-XXX-{slug}/`). Distintos destinos pueden
> resultar en handoffs distintos (uno grande → `work-define`, otro pequeño →
> `work-plan`).

---

## Resultado

Al terminar, indica al usuario la carpeta `research/RS-XXX-{slug}/` creada en el
proyecto destino, el `RS-XXX` asignado y los archivos generados (`README.md`,
`discovery.md`, `validation.md`, más `validation/` si se almacenaron recursos).
Menciona el estado (`Draft`/`Ready`) del discovery y la validación y, en una línea,
por qué quedaron así. Si alguno quedó en `Draft`, recuerda que el handoff no se
ofrece hasta resolver sus pendientes. Si el destino está fragmentado, lista la
carpeta creada en **cada** proyecto destino con su estado y su handoff recomendado.

---

## Anti-patrones

- Empezar el discovery sin haber identificado **ambos** proyectos (origen y destino), o
  inventar rutas, stacks o versiones que no se leyeron de sus manifiestos.
- Preparar la validación con el discovery aún en `Draft`, u ofrecer el *handoff* con
  discovery o validación sin cerrar.
- Guardar el `RS-XXX` en el proyecto **origen** en vez del destino.
- Producir el plan de implementación aquí en lugar de hacer *handoff* a `work-define` o
  `work-plan`.
- Entregar el *handoff* sin dimensionar el cambio, o dimensionarlo sin justificar el
  criterio aplicado.
- Definir casos de Golden Master que comparan estructura interna en lugar de
  comportamiento observable.
- En destino fragmentado: crear un único `RS-XXX` para todos los destinos, o usar slugs
  distintos entre ellos.
- Mover código durante la investigación: este flujo no modifica ninguno de los dos
  proyectos.
