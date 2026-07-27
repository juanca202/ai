# Verificación de dependencias de las normas auditadas

Leer en la Fase 3.5. Cubre cómo extraer, comprobar, preguntar e instalar (o dejar constancia de) las
dependencias concretas que implican los estándares/ADR auditados — el *cuándo* de esta fase (nueva
auditoría vs. revalidación) ya está resuelto en `SKILL.md`; esto es solo el *cómo*.

1. **Extraer las dependencias concretas** que implica cada norma auditada (priorizando los criterios
   de estándares `Active` y sus ADR de origen), a partir de la `Descripción` del criterio / `## Decisión`
   (y contexto). Contar solo dependencias reales e instalables (p. ej. `PHPUnit`, `Playwright`,
   `GraphQL → @apollo/server`, `Prisma`, `Spring Web`), no conceptos abstractos ("arquitectura
   hexagonal" no es una dependencia).
2. **Comprobar si ya existen**, leyendo el manifiesto del ecosistema y su lockfile: `package.json`,
   `pom.xml`/`build.gradle`, `pyproject.toml`/`requirements.txt`, `*.csproj`, `go.mod`, `Cargo.toml`, etc.
3. **Si falta una o más, notificar al usuario y preguntar explícitamente** con la herramienta de
   preguntas estructuradas, agrupando todas las dependencias faltantes detectadas en la auditoría
   (una sola pregunta, no una por norma):

   > "Las normas auditadas referencian dependencias que no están instaladas o configuradas en el
   > proyecto: `<lista>`. ¿Quieres que las instale y configure ahora?"
   > Opciones: [Sí, instalar y configurar] / [No, solo dejarlo señalado en el informe]

   **No instalar ni configurar nada sin la aprobación explícita del usuario.**

4. **Si acepta:**
   - Instalar con el gestor del ecosistema detectado (`npm`/`pnpm`/`yarn`, `pip`/`poetry`/`uv`,
     Maven/Gradle, `dotnet add package`, `go get`, `cargo add`, etc.), respetando el que ya use el repo.
   - Aplicar la **configuración mínima** necesaria para que quede operativa (archivo de config, entrada
     en el manifiesto, wiring básico), sin construir la feature completa.
   - Mostrar los comandos ejecutados y los archivos tocados. No correr build ni despliegues por
     iniciativa propia.
   - Continuar a la Fase 4 dejando constancia de lo instalado en el resumen final.

5. **Si rechaza:** dejar constancia de la dependencia faltante — en una nueva auditoría, como
   incumplimiento adicional del criterio si corresponde o en `## Observaciones` / `## Reglas no
   verificables por inspección estática`; en una revalidación, como parte de los cambios evidenciados
   en la entrada de `## Revalidaciones` — para que sea visible en una futura verificación.
