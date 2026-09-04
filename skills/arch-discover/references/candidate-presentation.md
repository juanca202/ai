# Formato de presentación de candidatos

Leer en la Fase 4, antes de mostrarle la lista al usuario. El formato agrupa los candidatos por
prioridad (🔴 alta / 🟡 media / ⚪ baja) y, dentro de cada uno, indica a qué estándar de dominio
aportaría un requisito.

**Título del estándar vs. nombre del dominio — no son lo mismo.** El **dominio** (p. ej. «Arquitectura
y diseño», slug `architecture`) es la clasificación interna del catálogo
([`functional-domains.md`](functional-domains.md)) — la que se usa para agrupar
candidatos y decidir si van al mismo estándar. El **título del estándar** que se muestra en la lista
(p. ej. «Testing Standards», «Architecture / Modularidad») es solo un nombre ilustrativo/legible; el
título real del archivo `docs/standards/<slug>.md` lo decide `arch-manage` al crearlo, y no tiene que
coincidir textualmente con el nombre en español del dominio. Por eso cada línea del ejemplo abajo anota
también el **dominio** (`slug`) entre paréntesis, para no confundir ambas cosas.

```
## Arquitectura descubierta

Los candidatos se agrupan por el estándar de dominio al que aportarían un requisito.

### 🔴 Alta prioridad (amplio impacto)

**[C-01] Testing con PHPUnit + Playwright** → estándar de dominio **Testing Standards** (dominio `testing`)
- Evidencia: `phpunit.xml`, `tests/unit/`; `playwright.config.ts`, `tests/e2e/`
- Decisiones (ADR): 1) unit tests con PHPUnit · 2) e2e con Playwright
- Requisitos (RFC 2119): «Unit testing» — *unit tests MUST usar PHPUnit*; «E2E testing» — *e2e MUST usar Playwright*
- Ya documentado: no

**[C-02] Arquitectura en capas (Controller → Service → Repository)** → estándar **Architecture / Modularidad** (dominio `architecture`)
- Evidencia: `src/controllers/`, `src/services/`, `src/repositories/`
- Decisión (ADR): separación en capas
- Requisito (RFC 2119): «Límites de capa» — *el dominio MUST NOT importar infraestructura*
- Ya documentado: no

### 🟡 Media prioridad (alcance acotado)

**[C-03] Uso de Prisma como ORM** → solo ADR (sin requisito continuo evidente; dominio `persistence`)
- Evidencia: `@prisma/client` en `package.json`, carpeta `prisma/`
- Decisión (ADR): Prisma frente a TypeORM/Drizzle/Sequelize
- Requisito: no (elección de herramienta sin una regla continua clara)
- Ya documentado: no

### ⚪ Baja prioridad (convenciones menores)

**[C-04] ESLint + Prettier** → estándar de dominio **Code Quality** (dominio `coding-style`)
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
