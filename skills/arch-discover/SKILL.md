---
name: arch-discover
description: Inspeccionar un proyecto existente para descubrir decisiones arquitectónicas implícitas y las reglas/convenciones vivas que están en vigor, y proponer los ADR y estándares candidatos que las documentarían. Usar cuando el usuario quiera auditar un repositorio en busca de decisiones o normas no documentadas, pida "descubrir ADRs", "descubrir estándares", "qué decisiones arquitectónicas tiene este proyecto", "qué convenciones sigue el código", "analiza la arquitectura del proyecto" o cualquier variante que implique explorar el código/estructura para inferir arquitectura relevante que merezca documentarse. Activar también cuando el usuario llegue a un proyecto nuevo y quiera entender qué decisiones y reglas ya existen, aunque no mencione explícitamente "ADR" o "estándar".
license: MIT
---

# Skill: Descubrir arquitectura en un proyecto existente

Analiza la estructura y el código de un repositorio para identificar **arquitectura implícita** —
elecciones de tecnología, patrones, convenciones o compromisos que están vivos en el código pero
nunca se documentaron formalmente.

Cada hallazgo se traduce en artefactos de dos tipos (ver el skill `arch-manage` para la distinción completa):

- Un **ADR** — la *decisión* histórica: por qué se eligió algo. Todo hallazgo relevante produce un ADR candidato.
- Un **requisito** dentro de un **estándar de dominio** — la *regla viva* que el código sigue hoy (`docs/standards/`). El estándar es **amplio** (un **dominio técnico o funcional** entero: *Testing Standards*, *API Standards*…; un aspecto de arquitectura, no un dominio de negocio/DDD) y agrupa varios requisitos; cada requisito se redacta con RFC 2119/8174 (MUST/SHOULD/MAY…). Un hallazgo que es una norma continua y verificable propone **un requisito**, dentro del estándar de dominio que le corresponde (agrupándolo con otros del mismo dominio). La unidad verificable fina —el **criterio de cumplimiento** (`CR-XXX`) medible dentro del requisito— la formaliza `arch-manage` al crear el artefacto; en descubrimiento basta con proponer el requisito y su regla.

Ejemplo: detectar "unit tests con PHPUnit" y "e2e con Playwright" son **dos decisiones** (dos ADR),
pero **un solo estándar de dominio** *Testing Standards* con **dos requisitos** («Unit testing»,
«E2E testing»). En cambio detectar "hubo una migración de Webpack a Vite" es una decisión histórica
(**ADR** sin criterio de cumplimiento): no hay una norma continua que cumplir, solo un hecho.

El output es una **lista priorizada de candidatos**, agrupando los requisitos por estándar de dominio.
El usuario decide cuáles documentar; el skill luego invoca `arch-manage` para cada uno aprobado, que
crea el ADR y —cuando aplique— añade su requisito al estándar de dominio (creándolo o ampliándolo).

---

## Fase 1 — Orientación inicial

Antes de inspeccionar, determinar el alcance:

1. **Leer `.agents/MEMORY.md`** (si existe) para entender el stack y contexto ya conocido.
2. **Leer `docs/adr/` y `docs/standards/`** para listar los artefactos ya existentes — nunca proponer un candidato que duplique un ADR o estándar existente (en cualquier estado).
3. Si el usuario no indicó ruta, asumir raíz del repositorio actual.

---

## Fase 2 — Inspección del proyecto

Explorar en este orden, acumulando señales:

### 2a. Estructura de carpetas
```bash
find . -maxdepth 3 -type d | grep -v node_modules | grep -v .git | grep -v __pycache__
```
Inferir: monorepo vs monolito, separación por capas/dominios, presencia de módulos, microservicios, etc.

### 2b. Manifiestos de dependencias
Leer **todos** los que apliquen según el stack detectado:

| Ecosistema | Archivos a leer |
|---|---|
| Node / JS / TS | `package.json`, `package-lock.json`, `tsconfig.json` |
| Python | `pyproject.toml`, `requirements.txt`, `setup.cfg`, `Pipfile` |
| JVM | `pom.xml`, `build.gradle`, `build.gradle.kts` |
| .NET | `*.csproj`, `*.sln` |
| Rust | `Cargo.toml` |
| Go | `go.mod` |

Señales clave a extraer:
- Framework web principal (Express, FastAPI, Spring, etc.)
- ORM / cliente de base de datos
- Bus de mensajes / queue
- Herramientas de test
- Bundler / transpilador
- Librerías de autenticación / autorización
- Clientes de servicios cloud

### 2c. Código fuente — patrones arquitectónicos
Buscar evidencia de patrones en el código:

```bash
# Detectar estructura de capas
find src -type d | head -30

# Buscar patrones de diseño comunes
grep -r "Repository\|Service\|Controller\|Handler\|UseCase\|Interactor" src --include="*.ts" --include="*.py" --include="*.java" -l 2>/dev/null | head -20

# Detectar uso de inyección de dependencias
grep -r "inject\|Injectable\|@Autowired\|provide\|container" src -l 2>/dev/null | head -10
```

### 2d. Artefactos existentes
```bash
ls docs/adr/*.md docs/standards/*.md 2>/dev/null || echo "No hay ADRs ni estándares"
```
Para cada uno, leer solo lo clave (`## Decisión` de los ADR; el `title`/`domain` y los requisitos `## <…>` de los estándares); no cargar el documento completo si hay muchos.

---

## Fase 3 — Identificación de candidatos

Para cada señal encontrada, evaluar si amerita documentarse usando estos criterios:

**Incluir como candidato si:**
- Es una elección no obvia entre varias alternativas reales (ej: Redux vs Zustand, REST vs GraphQL)
- Tiene consecuencias que afectan a múltiples partes del sistema
- Sería costoso revertir sin una razón documentada
- Un desarrollador nuevo podría cuestionarla razonablemente

**Excluir si:**
- Ya está cubierta por un ADR o por un requisito de estándar existente
- Es la opción por defecto obvia del stack (ej: usar Jest en un proyecto CRA)
- Es una decisión de implementación, no arquitectónica

### Clasificar cada candidato: ¿fija un requisito? ¿de qué dominio técnico/funcional?

Por cada candidato, además de la decisión (ADR), determinar si hay una **regla viva** que documentar como **requisito** dentro de un **estándar de dominio**:

- **Decisión + requisito** — el código sigue hoy una norma continua y verificable (p. ej. "las APIs son GraphQL", "el dominio no importa infraestructura", "unit tests con PHPUnit"). Proponer el ADR **y** el requisito, indicando **a qué estándar de dominio pertenece** (agrupándolo con otros candidatos del mismo dominio bajo un solo estándar).
- **Solo decisión (ADR)** — una elección histórica o puntual sin una regla continua que cumplir (una migración ya ejecutada, la adopción inicial de un runtime). Proponer solo el ADR.

**Agrupar por dominio:** varios candidatos del mismo dominio se consolidan en **un** estándar. P. ej. "unit tests con PHPUnit" + "e2e con Playwright" + "cobertura ≥ 80%" → un estándar *Testing Standards* con tres requisitos.

### Categorías / dominios típicos a buscar

Estos son los **dominios funcionales canónicos** (los mismos que usa `arch-manage`; el `slug` es el `domain` del estándar). Al proponer un candidato, clasificar su estándar en uno de ellos y **proponer un dominio nuevo solo si no encaja en ninguno**.

| Dominio funcional (`slug`) | Ejemplos de señales | Requisitos que suele agrupar |
|---|---|---|
| **Calidad y pruebas** (`testing`) | Herramienta unit/e2e, cobertura, mocking, Quality Gates | unit testing, e2e testing, umbral de cobertura |
| **Arquitectura y diseño** (`architecture`) | Capas (controller/service/repo), DDD, hexagonal, CQRS, límites de módulo | límites de capa, imports permitidos, desacoplamiento |
| **Interfaces / APIs** (`api`) | REST vs GraphQL vs tRPC, versioning, formato de errores | protocolo obligatorio, versioning, payloads/errores |
| **Seguridad** (`security`) | JWT vs sesiones, OAuth, refresh tokens, cifrado, secretos | mecanismo de auth, manejo de secretos, sanitización |
| **Estilo de código** (`coding-style`) | ESLint/Prettier/Biome, EditorConfig, TypeScript strict, convenciones de nombres | reglas de linter/formato, nomenclatura, JSDoc |
| **Frontend / UX** (`frontend`) | Estado global vs local, SSR vs CSR, design system, WCAG | gestión de estado, design system, accesibilidad |
| **Persistencia y datos** (`persistence`) | Elección de BD, ORM vs query builder, migraciones, índices | ORM obligatorio, estrategia de migraciones, patrón repositorio |
| **Infraestructura y DevOps** (`devops`) | Dockerfiles, pipeline CI/CD, deploy, feature flags, versión de runtime, SemVer | gates de pipeline, estrategia de deploy/branching, variables por entorno |
| **Observabilidad** (`observability`) | Logger, estrategia de errores, tracing, métricas | logger obligatorio, formato de logs, Correlation IDs |

---

## Fase 4 — Presentación de candidatos

Mostrar la lista al usuario en este formato:

```
## Arquitectura descubierta

Los candidatos se agrupan por el estándar de dominio al que aportarían un requisito.

### 🔴 Alta prioridad (amplio impacto)

**[C-01] Testing con PHPUnit + Playwright** → estándar de dominio **Testing Standards**
- Evidencia: `phpunit.xml`, `tests/unit/`; `playwright.config.ts`, `tests/e2e/`
- Decisiones (ADR): 1) unit tests con PHPUnit · 2) e2e con Playwright
- Requisitos (RFC 2119): «Unit testing» — *unit tests MUST usar PHPUnit*; «E2E testing» — *e2e MUST usar Playwright*
- Ya documentado: no

**[C-02] Arquitectura en capas (Controller → Service → Repository)** → estándar **Architecture / Modularidad**
- Evidencia: `src/controllers/`, `src/services/`, `src/repositories/`
- Decisión (ADR): separación en capas
- Requisito (RFC 2119): «Límites de capa» — *el dominio MUST NOT importar infraestructura*
- Ya documentado: no

### 🟡 Media prioridad (alcance acotado)

**[C-03] Uso de Prisma como ORM** → solo ADR (sin requisito continuo evidente)
- Evidencia: `@prisma/client` en `package.json`, carpeta `prisma/`
- Decisión (ADR): Prisma frente a TypeORM/Drizzle/Sequelize
- Requisito: no (elección de herramienta sin una regla continua clara)
- Ya documentado: no

### ⚪ Baja prioridad (convenciones menores)

**[C-04] ESLint + Prettier** → estándar de dominio **Code Quality**
- Evidencia: `.eslintrc.js`, `.prettierrc`
- Decisión (ADR): estándar de calidad de código
- Requisito (RFC 2119): «Lint y formato» — *el código MUST pasar lint y formato antes de merge*
- Ya documentado: no

---
Total: X candidatos (agrupados en N estándares de dominio). ¿Cuáles quieres documentar?
```

Tras mostrar la lista, preguntar con la **herramienta de preguntas estructuradas**:

> "¿Cuáles quieres documentar?"
> Opciones: [Todos] / [Solo los de alta prioridad] / [Elegir algunos]
>
> - Si elige **Elegir algunos**: pedir que indique los códigos (p. ej. `C-01, C-03`) o un rango (`C-01 a C-04`).

---

## Fase 5 — Creación de los artefactos aprobados

Por cada candidato aprobado por el usuario:

1. Invocar el skill `arch-manage` pasando como contexto:
   - El título sugerido de la decisión
   - La evidencia encontrada (como contexto para el `## Contexto` del ADR)
   - La decisión inferida
   - **Si fija un requisito:** el enunciado de la regla en lenguaje RFC 2119 y **el estándar de dominio** al que pertenece (para que `arch-manage` cree o amplíe ese estándar)
   - Las alternativas implícitas detectadas (si las hay)
   - Los **Decisores** y el **idioma**, acordados una sola vez para todo el lote, de modo que `arch-manage` no vuelva a preguntar lo mismo por cada artefacto

2. Dejar que `arch-manage` ejecute su flujo completo: crea el ADR y, cuando corresponda, añade el requisito al estándar de dominio (creándolo o ampliándolo), formaliza sus **criterios de cumplimiento** (`CR-XXX`) con su `Enfoque` (bloqueante/warning), enlaza `emits` (a nivel de CR) / `source_adrs` y evalúa la fitness function de cada criterio.

3. **Agrupar por dominio en el lote:** procesar juntos los candidatos del mismo dominio para que sus requisitos caigan en el **mismo** estándar (no crear un estándar por candidato).

4. Una vez creado cada artefacto, continuar con el siguiente candidato aprobado.

---

## Notas de comportamiento

- **No inventar decisiones ni reglas.** Si la evidencia es ambigua, mencionar la incertidumbre en "Evidencia" y marcarlo como baja prioridad.
- **No proponer artefactos triviales.** "Usamos Git" no es un ADR.
- **No repetir trabajo.** Si ya existe un ADR o un requisito de estándar que cubre el hallazgo, omitir el candidato y mencionarlo en un pie de página: "X hallazgos omitidos por estar ya documentados."
- **Distinguir decisión de regla, y agrupar por dominio.** No todo ADR fija un requisito; proponer requisito solo cuando hay una norma continua y verificable. Consolidar los requisitos del mismo dominio en un solo estándar (no un estándar por regla).
- **Priorizar calidad sobre cantidad.** Mejor 4 candidatos sólidos que 12 rellenos.
- **Idioma:** usar la preferencia del contexto de la sesión; si no hay, la registrada en la memoria del proyecto; si tampoco, el idioma del mensaje del usuario.
