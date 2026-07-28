# Catálogo de dominios funcionales

Leer al clasificar un candidato en la Fase 3, sección "Categorías / dominios típicos a buscar". Estos
son los **dominios funcionales canónicos** — los mismos nueve que usa `arch-manage`
(`references/functional-domains.md` de ese skill es la copia canónica; esta es la misma lista adaptada
con columnas para descubrimiento). Al proponer un candidato, clasificar su estándar en uno de ellos y
**proponer un dominio nuevo solo si no encaja en ninguno**.

| Dominio funcional (`slug`) | Ejemplos de señales | Requisitos que suele agrupar |
|---|---|---|
| **Calidad y pruebas** (`testing`) | Herramienta unit/e2e, cobertura, mocking, Quality Gates | unit testing, e2e testing, umbral de cobertura |
| **Arquitectura y diseño** (`architecture`) | Capas (controller/service/repo), DDD, hexagonal, CQRS, límites de módulo | límites de capa, imports permitidos, desacoplamiento |
| **Interfaces / APIs** (`api`) | REST vs GraphQL vs tRPC, versioning, formato de errores | protocolo obligatorio, versioning, payloads/errores |
| **Seguridad** (`security`) | JWT vs sesiones, OAuth, refresh tokens, cifrado, secretos | mecanismo de auth, manejo de secretos, sanitización |
| **Estilo de código** (`coding-style`) | ESLint/Prettier/Biome, EditorConfig, TypeScript strict, convenciones de nombres | reglas de linter/formato, nomenclatura, JSDoc |
| **Frontend / UX** (`frontend`) | Estado global vs local, SSR vs CSR, design system, WCAG | gestión de estado, design system, accesibilidad |
| **Persistencia y datos** (`persistence`) | Elección de BD, ORM vs query builder, migraciones, índices | ORM obligatorio, estrategia de migraciones, patrón repositorio |
| **Infraestructura y DevOps** (`devops`) | Dockerfiles, pipeline CI/CD, deploy, feature flags, versión de runtime, SemVer, Conventional Commits u otra convención de mensajes de commit | gates de pipeline, estrategia de deploy/branching, variables por entorno, convención de mensajes de commit |
| **Observabilidad** (`observability`) | Logger, estrategia de errores, tracing, métricas | logger obligatorio, formato de logs, Correlation IDs |

**Agrupar por dominio:** varios candidatos del mismo dominio se consolidan en **un** estándar. P. ej.
"unit tests con PHPUnit" + "e2e con Playwright" + "cobertura ≥ 80%" → un estándar *Testing Standards*
con tres requisitos, no tres estándares distintos.

**Desempate — convenciones de commits/versionado:** una convención de mensajes de commit (Conventional
Commits u otra) o de versionado de releases (SemVer) siempre clasifica en **Infraestructura y DevOps**
(`devops`), no en Estilo de código (`coding-style`) — aunque toque "convenciones", no es una regla sobre
el código fuente en sí sino sobre el flujo de entrega/versionado del repo.
