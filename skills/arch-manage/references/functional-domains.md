# Catálogo de dominios funcionales

Referencia para **clasificar un estándar** en su dominio. Leer cuando el input produce un estándar
(casos **B** y **C** de la clasificación del input) y hay que decidir el `domain` (slug).

Usar el `slug` como `domain` (= nombre del archivo/carpeta del estándar). El `name` del estándar suele
ser «\<Dominio\> Standards» (p. ej. `testing` → *Testing Standards*, `api` → *API Standards*).

| # | Dominio | `slug` (`domain`) | Propósito | Contenido típico |
|---|---|---|---|---|
| 1 | Calidad y Pruebas | `testing` | Estrategia de verificación, pirámide de pruebas, cobertura y controles automáticos (Shift-Left) | Unit / integración / E2E (Playwright, Cypress), datos de prueba (Object Mother, Builders), determinismo, umbrales de cobertura, Quality Gates (Husky, linters, SonarQube) |
| 2 | Arquitectura y Diseño | `architecture` | Proteger la estructura interna, los límites entre módulos y el acoplamiento | Reglas de capas (Clean / Hexagonal), restricciones de dependencias entre paquetes/módulos, patrones de diseño obligatorios, manejo de estado, desacoplamiento |
| 3 | Interfaces / APIs | `api` | Estandarizar los contratos de comunicación entre clientes, servicios o terceros | REST / GraphQL / gRPC, payloads JSON, errores estandarizados (RFC 9457), fechas ISO 8601, versionado de endpoints, cabeceras, paginación |
| 4 | Seguridad y Cumplimiento | `security` | Construir el software de forma segura desde el diseño (Security by Design) | Secretos / variables de entorno, authn/authz (OAuth2, JWT, claims), sanitización (XSS, SQLi), cifrado en reposo/tránsito, auditoría de dependencias vulnerables |
| 5 | Estilo de Código y Sintaxis | `coding-style` | Consistencia visual y sintáctica de la base de código entre desarrolladores | Linters (ESLint, Stylelint, Biome), formateadores (Prettier, EditorConfig), nomenclatura (camelCase, PascalCase, kebab-case), comentarios/JSDoc, manejo de excepciones/logs |
| 6 | Frontend / Experiencia de Usuario | `frontend` | Reglas específicas de la capa de presentación web o móvil | Componentes (Smart / UI), estado global vs. local, accesibilidad (WCAG), Core Web Vitals, lazy loading, uso del Design System |
| 7 | Persistencia y Datos | `persistence` | Cómo interactúa el software con motores de BD y almacenamiento | Convenciones de nombres en BD, ORM vs. SQL nativo, estrategia de migraciones, transacciones, índices, patrón repositorio |
| 8 | Infraestructura y DevOps | `devops` | Normalizar la entrega, empaquetado y ejecución en los entornos objetivo | Dockerfiles / contenedores, pipelines CI/CD (GitHub Actions, GitLab CI), releases SemVer, branching / Gitflow, variables por entorno, convención de mensajes de commit (Conventional Commits u otra) |
| 9 | Observabilidad y Monitoreo | `observability` | Visibilidad, diagnóstico y trazabilidad del comportamiento en ejecución | Logs estructurados (JSON / `stdout`), niveles de log (INFO, WARN, ERROR), métricas (Prometheus, OpenTelemetry), trazabilidad distribuida (Correlation IDs), alertas |

> **Regla de clasificación.** Preferir **siempre** uno de estos nueve dominios. **Solo si el estándar
> no encaja en ninguno**, proponer un dominio nuevo (con un `slug` kebab-case, corto y consistente con
> el estilo de la tabla) y **confirmarlo con el usuario** antes de crear el archivo. Un requisito que
> parece de dos dominios normalmente pertenece al de su *aspecto principal*: p. ej. "los linters deben
> pasar antes de merge" es `testing`/Quality Gate si es un gate de CI, o `coding-style` si es la regla
> de formato en sí — elegir según qué se está normando, no dividirlo. Una convención de mensajes de
> commit o de versionado de releases (SemVer) siempre cae en `devops`, no en `coding-style`: no es una
> regla sobre el código fuente sino sobre el flujo de entrega/versionado del repo.
