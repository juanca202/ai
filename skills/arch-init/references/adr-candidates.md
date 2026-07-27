# Candidatos de ADR/estándar desde las decisiones de arch-init

Leer esta referencia en el **Paso 4.1** de `SKILL.md` (se vuelve a usar, sin releer, en el Paso 5.1). No inventa un catálogo genérico de "problemas típicos": usa el mismo modelo de **dominios funcionales** y de **decisión → requisito** que `arch-manage` y `arch-discover` ya definen.

## 1. Dominios funcionales canónicos

Los mismos 9 que usa `arch-manage` (`references/functional-domains.md`) y `arch-discover` — clasificar cada candidato en uno de ellos; proponer un dominio nuevo solo si de verdad no encaja:

| Dominio (`slug`) | Cuándo aplica a una decisión de arch-init |
| ------------------ | ------------------------------------------- |
| **Calidad y pruebas** (`testing`) | Framework de unit tests, E2E, API testing, cobertura mínima — Paso 4.2 completo. |
| **Arquitectura y diseño** (`architecture`) | Elección de patrón/estructura al hacer scaffolding (p. ej. arquitectura hexagonal, monorepo vs. monolito) si se decidió explícitamente. |
| **Interfaces / APIs** (`api`) | Framework HTTP, protocolo (REST/GraphQL/tRPC) si el tipo de proyecto es API/backend. |
| **Seguridad** (`security`) | Mecanismo de autenticación/autorización si se decidió como parte del stack inicial. |
| **Estilo de código** (`coding-style`) | Linter/formatter si el scaffold o la investigación del Paso 2 lo definió explícitamente (no el default silencioso del template). |
| **Frontend / UX** (`frontend`) | Framework de UI, gestión de estado, si el tipo de proyecto es frontend/full-stack. |
| **Persistencia y datos** (`persistence`) | Base de datos u ORM si se decidió como parte del stack inicial. |
| **Infraestructura y DevOps** (`devops`) | Runtime/versión, gestor de paquetes, si hubo una elección real entre opciones. |
| **Observabilidad** (`observability`) | Normalmente no aplica todavía en un proyecto recién inicializado; omitir salvo que el Paso 2 la haya decidido explícitamente. |

## 2. Construir la lista de candidatos

La fuente de los candidatos depende de la situación identificada en el Paso 1.2 — son dos caminos distintos, y **solo uno de ellos** alimenta la lista consolidada que llega al Paso 5.1:

### Con implementación → delegar en `arch-discover` completo; no vuelve a esta lista

Si el Paso 1.2 clasificó "con implementación", el Paso 4.1 delega en un **subagente** que ejecuta el skill `arch-discover` **completo** sobre el repo — sus cinco fases, incluida la Fase 5. `arch-discover` inspecciona el código, agrupa por dominio funcional, **presenta sus candidatos al usuario** y, para los que se aprueban, **los crea por su cuenta** invocando `/arch-manage` en su propia Fase 5 (con el mismo criterio de exclusión de candidatos triviales que usa siempre). `arch-init` no repite esa presentación, no vuelve a inspeccionar el código, y **no vuelve a delegar esos candidatos en `arch-manage`** — ya quedaron creados. Lo único que se retiene de esta ejecución es un resumen (qué se creó, con sus rutas) para el cierre (Paso 5.3); **no se agrega nada de aquí** a la lista consolidada del § 3.

### Con código base / sin código → construir desde las decisiones que tomó `arch-init` mismo

Si no hubo `arch-discover` (situación "con código base" o "sin código", tras el Paso 2 si aplicó), no hay nada que "descubrir" en código que todavía no existe o que es puro scaffold por defecto: los candidatos salen de las decisiones que **arch-init tomó en esta misma ejecución**, y **estos sí** alimentan la lista consolidada del § 3:

1. **Del Paso 1.3 o del Paso 2** (según cuál haya aplicado): el stack elegido/detectado — lenguaje, framework principal, y cualquier librería clave que haya implicado comparar alternativas reales (no el resto de dependencias transitivas). Si vino de una investigación con `work-research` (Paso 2.2), ya se cuenta con "Alternativas consideradas" listas del informe (`RS-XXX`). Si el stack vino del Paso 1.3 (detectado, "con código base") no hay alternativas de primera mano — no inventarlas; documentar igual como ADR con `emits: []` si el usuario lo quiere, o dejarlo pasar si es la elección obvia y trivial de un scaffold.
2. **Del Paso 4.2** (en **cualquier** situación, incluida "con implementación"): el framework de unit testing y, si se aceptaron, las capas adicionales (E2E, API testing) — esto se consolida en **un solo candidato** de dominio `testing`, con un requisito por capa (igual que el ejemplo canónico de `arch-discover`: "unit tests con X" + "e2e con Y" → un estándar *Testing Standards* con dos requisitos). Este candidato **sí** entra a la lista consolidada del § 3 aunque la situación haya sido "con implementación", porque es una decisión que toma `arch-init` en el 4.2, no algo que `arch-discover` pudiera haber minado del código existente.

No proponer candidatos triviales (la elección obvia por defecto de un scaffold sin comparación real) — mismo criterio de exclusión que `arch-discover`.

## 3. Presentar y delegar

Esta presentación cubre **únicamente** los candidatos de la rama "con código base"/"sin código" del § 2 más el de la compuerta de calidad (4.2) — nunca los de `arch-discover`, que ya quedaron resueltos por su propia Fase 5. Si la situación fue "con implementación" y el 4.2 no agregó nada nuevo, la lista queda vacía: saltar directo al Paso 5.2 sin preguntar (ver `SKILL.md` § 5.1).

1. Mostrar la lista de candidatos del § 2 (rama stack, si aplica, más el de compuerta de calidad) agrupados por dominio, con la decisión, el dominio y —si existen— las alternativas consideradas.
2. Preguntar con la herramienta de preguntas estructuradas (selección múltiple): *"¿Cuáles quieres documentar como ADR/estándar?"*, opciones = cada candidato + `Ninguno por ahora`.
3. Antes de delegar, resolver **una sola vez para todo el lote** (no repetir por candidato): **decisores** (preguntar) e **idioma** (ya resuelto en la sección de Resolución de idioma de `SKILL.md`).
4. Delegar en un **subagente** que ejecute **`/arch-manage`**, agrupando los candidatos **por dominio** (varios candidatos del mismo dominio en una sola invocación, para que caigan en el mismo estándar), pasando: decisión, contexto/alternativas ya conocidas, dominio, decisores e idioma. Esperar la respuesta antes de continuar al Paso 5.2. Este paso ocurre en el **Paso 5.1** de `SKILL.md`.
