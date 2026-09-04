# Dependencias referenciadas por la decisión

Leer cuando el ADR o el requisito recién creado referencia una tecnología concreta que **quizá no esté
instalada** en el proyecto. Ofrecer instalarla solo **después de crear los artefactos** y con aprobación
explícita del usuario.

1. **Extraer las dependencias concretas** que la decisión implica, del `## Decisión` del ADR y del
   enunciado del requisito. Contar solo dependencias reales e instalables (p. ej. `PHPUnit`, `Playwright`,
   `GraphQL → @apollo/server`, `Prisma`), no conceptos abstractos ("arquitectura hexagonal" no es una
   dependencia). No inventar nombres de paquete: si el exacto no es claro, preguntarlo. **No incluir aquí**
   las herramientas de verificación de una fitness function (dependency-cruiser, ArchUnit, import-linter,
   NetArchTest, etc.) — esas se investigan al **proponer** el criterio y se instalan al crear su fitness
   function, en [`references/fitness-functions.md`](fitness-functions.md), para no preguntar dos veces
   por lo mismo.
2. **Comprobar si ya existen** en el proyecto, leyendo el manifiesto del ecosistema y su lockfile **de la
   raíz de arquitectura resuelta** (`<raíz-arq>`) — si la decisión es de un submódulo, el manifiesto que
   cuenta es el suyo, y ahí se instala; el del repo principal es otro proyecto:
   `package.json`, `pom.xml`/`build.gradle`, `pyproject.toml`/`requirements.txt`, `composer.json`,
   `*.csproj`, `go.mod`, `Cargo.toml`, etc. Si todas están presentes, no hay nada que ofrecer — fin.
3. **Si falta una o más, preguntar explícitamente** con la herramienta de preguntas estructuradas:

   > "La decisión referencia dependencias que no están en el proyecto: `<lista>`. ¿Quieres que las instale y configure ahora?"
   > Opciones: [Sí, instalar y configurar] / [No, solo dejar constancia]

   Una sola pregunta, opciones mutuamente excluyentes. Como un ADR nuevo nace en `Draft`, mencionar ese
   matiz si es relevante. **No instalar nada sin la aprobación explícita del usuario.**
4. **Si acepta:**
   - Instalar con el gestor del ecosistema detectado (`npm`/`pnpm`/`yarn`, `composer`, `pip`/`poetry`/`uv`,
     Maven/Gradle, `dotnet add package`, `go get`, `cargo add`, etc.), respetando el que ya use el repo.
     Preferir dependencias de desarrollo cuando sean herramientas de build/test.
   - Aplicar la **configuración mínima** necesaria para que quede operativa, sin construir la feature
     completa: eso es implementación, no alcance de un ADR ni de un estándar.
   - Mostrar los comandos ejecutados y los archivos tocados. No correr build ni despliegues por iniciativa
     propia; si la instalación requiere pasos con efectos amplios, avisar antes.
5. **Si rechaza:** dejar constancia (p. ej. en `## Consecuencias` del ADR o en la columna `Verificación`
   del CR) de que la dependencia queda pendiente, para que sea visible en una futura auditoría.

> En invocación en lote (desde `arch-discover`), agrupar: preguntar una vez por el conjunto de dependencias ausentes de todos los artefactos creados.
