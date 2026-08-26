# Compuerta de calidad (pruebas)

Leer esta referencia en el **Paso 4.2** de `SKILL.md`. El objetivo es dejar una compuerta de pruebas mínima pero **útil** — nunca agregar una capa de testing que no ayude a validar el proyecto en cuestión.

## 1. Diagnóstico de lo existente

Antes de sugerir nada, buscar configuración de pruebas ya presente: archivos de config (`jest.config.*`, `vitest.config.*`, `pytest.ini`/`pyproject.toml` con `[tool.pytest...]`, `phpunit.xml`, `*.csproj` con paquetes de test, `cypress.config.*`, `playwright.config.*`), carpetas (`__tests__/`, `tests/`, `spec/`), y scripts declarados (`test` en `package.json`, target `test` en `Makefile`/CI).

- **No existe nada** → se **crea** la compuerta desde cero (§ 2 en adelante).
- **Ya existe algo** → se **amplía**: diagnosticar qué capas cubre hoy (unit / integración / E2E / API) y ofrecer solo las capas que falten y que aporten valor real.

## 2. Qué se suele validar por stack (consultar `quality-check`)

`arch-init` no mantiene su propio catálogo de qué validar por stack — ese catálogo ya existe en el skill `quality-check`, en su `references/stacks.md`, tabla "Aplicabilidad por stack" (Tipado / Linter / Unit tests / Coverage / Suites configuradas / Build / E2E / Sonar × Node+TS / Node JS / Java-Kotlin / Python / Go / Rust / .NET), con cada check marcado **Bloqueante**, **Condicional**, **N/A** o **Informativo** — salvo la fila «Suites configuradas», que no lleva categoría por ecosistema porque la fija el estándar de testing. Leer esa tabla para la fila del stack de este proyecto:

- **Bloqueante** → falta configurarlo es un hueco real de la compuerta; se ofrece siempre (§ 4).
- **Condicional** → aplica solo bajo ciertas condiciones (tipo de proyecto, si tiene UI, si expone API, etc.); usar § 3 de esta referencia para decidir si aplica aquí — la tabla de `quality-check` no distingue por tipo de proyecto, `arch-init` sí.
- **N/A** → no aplica a este stack; no ofrecerlo.
- **Informativo** → no bloquea ni condiciona nada; puede mencionarse pero no forma parte de la compuerta mínima.
- **Suites configuradas** → la fila que la tabla deja sin categoría por ecosistema (integración, contrato, rendimiento…). **Su categoría no la fija el stack, sino el estándar de testing** del repo: `quality-check` las ejecuta solo si `docs/standards/testing.md` las declara (ver [Suites de prueba](../../quality-check/SKILL.md#suites-de-prueba-fijas-y-configuradas)). En una inicialización, si el proyecto necesita una de estas capas, lo que falta no es tooling suelto sino **declararla como requisito del estándar** vía `arch-manage` — además de configurarla (§ 4).

Esta consulta es de lectura — `arch-init` no ejecuta los checks de `quality-check` (esos corren sobre código ya implementado; en una inicialización todavía no hay nada que verificar), solo usa su tabla como checklist de qué le falta a la compuerta.

Toda compuerta de calidad incluye pruebas unitarias, sin excepción (es Bloqueante en la tabla de `quality-check` para todo stack con tests). Framework por defecto según el stack detectado/seleccionado — `quality-check/references/stacks.md` marca que el check aplica, pero no prescribe cuál usar; esta tabla lo completa:

| Stack | Framework de unit testing por defecto |
| ----- | -------------------------------------- |
| Node/TS (general) | Vitest (o Jest si el proyecto ya lo usa) |
| React / Vue / frontend JS | Vitest + Testing Library (o Jest + Testing Library) |
| Python | pytest |
| Java / Kotlin | JUnit 5 |
| Go | `go test` (stdlib) |
| Ruby | RSpec o Minitest (seguir lo que ya tenga el proyecto) |
| PHP | PHPUnit |
| .NET | xUnit |
| Rust | `cargo test` (stdlib) |

Si el usuario ya tiene preferencia declarada (en `.agents/MEMORY.md`, en el manifiesto del proyecto, o porque lo indicó en el Paso 2), respetarla sobre esta tabla.

## 3. Cuándo sugerir capas adicionales (matiz por tipo de proyecto)

La tabla de `quality-check` marca E2E como Condicional para la mayoría de stacks sin decir cuándo — esta sección es el matiz que le falta: no ofrecer todas las capas siempre, solo las que un proyecto de ese tipo realmente necesita para validar sus implementaciones.

| Tipo de proyecto | Capas adicionales a sugerir | Herramientas típicas |
| ----------------- | ---------------------------- | --------------------- |
| API / backend con endpoints HTTP | API testing (contrato + integración de endpoints) | Supertest (Node), pytest + httpx/requests (Python), RestAssured (Java/Kotlin), `net/http/httptest` (Go) |
| Aplicación web con UI (SPA, SSR, full-stack) | E2E de los flujos críticos de usuario | Playwright o Cypress |
| Aplicación móvil | E2E de los flujos críticos | Detox (React Native), Espresso (Android), XCUITest (iOS), `integration_test` (Flutter) |
| CLI / librería / paquete | Normalmente solo unit (+ integración si orquesta procesos o I/O externo) | — |
| Servicio con integraciones externas (DB, cola, cache) | Integración con dependencias reales o contenedores efímeros | Testcontainers, contenedores docker-compose para test |

No sugerir E2E a una librería sin UI ni endpoints, ni sugerir API testing a un proyecto sin API, aunque `quality-check` marque esos checks como Condicional para el stack. Ante duda sobre si una capa aporta valor, preguntar al usuario en vez de asumir.

## 4. Cómo preguntar

Usar la herramienta de preguntas estructuradas, una sola tanda:

1. *"Unit tests es la base de la compuerta de calidad. ¿Confirmas que se configure con `<framework por defecto>`?"* → `Sí, usar ese` / `Prefiero otro framework` (texto libre si elige esta opción).
2. Si el tipo de proyecto sugiere capas adicionales (según § 3): *"Además de unit tests, este proyecto se beneficiaría de `<capas sugeridas>`. ¿Cuáles quieres incluir?"* (selección múltiple, incluir siempre la opción `Ninguna adicional por ahora`).

## 5. Configurar la compuerta

Por cada capa aceptada:

1. Instalar las dependencias necesarias con el gestor de paquetes del stack.
2. Crear el archivo de configuración mínimo si el framework lo requiere.
3. Crear **un test de ejemplo** que realmente ejecute algo del proyecto (no un `expect(true).toBe(true)`) — si el proyecto es una base limpia sin lógica propia todavía, un test sobre el punto de entrada/health-check es suficiente.
4. Declarar/actualizar el script de ejecución (`npm test`, `pytest`, `go test ./...`, etc.) y, si el proyecto tiene CI, dejar anotado (sin modificar el pipeline sin permiso) que falta engancharlo.

## 6. Validar que la compuerta quedó sólida

Antes de pasar al Paso 5, ejecutar la suite de pruebas configurada y confirmar que corre sin errores de configuración (no hace falta que cubra funcionalidad todavía si el proyecto es una base limpia — solo que **corre**). Si falla por un problema de configuración, resolverlo antes de continuar; si falla por una razón que excede el alcance de este skill, informar al usuario y preguntar cómo proceder antes de avanzar al Paso 5.
