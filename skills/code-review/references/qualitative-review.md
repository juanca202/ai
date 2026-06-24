# Referencia: Revisión cualitativa estilo senior

Esta referencia detalla **cómo** ejecutar las tres dimensiones de la [revisión cualitativa](../SKILL.md#revisión-cualitativa-análisis-senior). Se carga desde `SKILL.md` en el Paso 3. Asume ya resueltos el stack, el diff bajo revisión y la intención del cambio.

> **Mentalidad:** eres un ingeniero senior revisando el PR de un compañero al que aprecias. Quieres que el código entre, pero bien. No eres un linter: razonas sobre intención, diseño e impacto en el sistema, y cuando algo está bien, lo dices.

## Contenido

1. [Dimensión 1 — Análisis semántico (intención)](#dimensión-1--análisis-semántico-intención)
2. [Dimensión 2 — Arquitectura y diseño](#dimensión-2--arquitectura-y-diseño)
3. [Dimensión 3 — Feedback estilo senior](#dimensión-3--feedback-estilo-senior)
4. [Calibración de severidad](#calibración-de-severidad)
5. [Ejemplos de feedback (bueno vs malo)](#ejemplos-de-feedback-bueno-vs-malo)

---

## Dimensión 1 — Análisis semántico (intención)

**Objetivo:** confirmar que el código resuelve *el problema correcto*, no solo que "funciona".

Pasos:

1. **Reconstruir la intención** desde las fuentes disponibles, en este orden: criterios de aceptación de la US (`SC-XX`) y reglas de negocio (`BR-XX`) en el `README.md`; descripción del TK; nombre de la rama; mensajes de commit del rango; descripción del PR si existe.
2. **Mapear diff ↔ intención:** para cada parte relevante del cambio, ¿a qué objetivo responde? Para cada objetivo declarado, ¿está cubierto en el diff?
3. **Buscar desajustes (mismatch):**
   - El código resuelve un problema **distinto** o **más amplio** del pedido (scope creep silencioso).
   - Un criterio de aceptación o regla de negocio **sin cubrir**.
   - **Efectos colaterales** no buscados (toca un flujo ajeno, cambia un contrato público sin necesidad).
   - Lógica que **contradice su nombre/intención** (una función `validateX` que además persiste, un `getY` con efectos).
   - Casos borde implícitos en la intención que el código ignora (nulos, vacíos, concurrencia, errores).

Señales de buen estado: el diff cubre exactamente los `SC-XX`/`BR-XX`, sin lógica de más, y los casos borde del dominio están contemplados.

---

## Dimensión 2 — Arquitectura y diseño

**Objetivo:** que el cambio sea mantenible y coherente con el sistema, no solo localmente correcto.

### SOLID (con criterio, no como checklist ciega)
- **S** — ¿una clase/función tiene una sola razón para cambiar? Banderas: nombres con "y"/"Manager"/"Helper" que esconden múltiples responsabilidades.
- **O** — ¿se extiende sin modificar lo existente? Un `switch`/`if` por tipo que crece con cada caso nuevo pide polimorfismo o estrategia.
- **L** — ¿las subclases/implementaciones respetan el contrato del tipo base (no lanzan donde no deben, no debilitan postcondiciones)?
- **I** — ¿las interfaces son específicas, o se obliga a implementar métodos que no se usan?
- **D** — ¿el código de alto nivel depende de **abstracciones**, no de detalles concretos?

### Límites de Clean Architecture / capas
- **Dirección de dependencias:** dominio/casos de uso **no** dependen de infraestructura, frameworks ni UI. Si una entidad importa el ORM o el cliente HTTP, es bandera.
- **Fugas de capa:** detalles de persistencia/transporte que se filtran al dominio (DTOs como entidades, anotaciones de framework en el núcleo).
- **Ubicación correcta:** la lógica de negocio vive en el dominio/caso de uso, no en el controlador ni en el repositorio.

### Acoplamiento, duplicación, abstracción
- **Acoplamiento:** ¿este módulo conoce demasiado de otro? ¿un cambio aquí obliga a cambios en cascada? ¿dependencias circulares?
- **Duplicación:** lógica copiada que debió extraerse. Distinguir duplicación **real** (misma razón de cambio) de coincidencia superficial — no toda repetición es deuda.
- **Abstracción innecesaria:** capas, genéricos, factories o wrappers que **no pagan su coste**; indirección que solo añade saltos para leer. Una abstracción con un solo uso y sin variación prevista suele sobrar (regla de "no abstraigas hasta el tercer caso", con criterio).

### Patrones del proyecto
- Contrastar contra el **estilo ya existente** en el repo: estructura de carpetas, convenciones de naming, manejo de errores, forma de inyectar dependencias, librerías ya adoptadas.
- Una solución técnicamente correcta pero **ajena al patrón del repo** introduce inconsistencia (deuda cognitiva). Señalarlo y proponer alinear, salvo que el cambio mejore deliberadamente el patrón (entonces, ¿es consistente en todo el diff?).

---

## Dimensión 3 — Feedback estilo senior

Cada hallazgo se redacta con esta anatomía:

- **Qué** — el problema, ubicado (archivo/símbolo).
- **Por qué** — qué se rompe, encarece o arriesga a futuro. El *porqué* es obligatorio.
- **Impacto** — alcance en el sistema (local, módulo, contrato público, datos).
- **Sugerencia concreta** — cómo quedaría mejor; idealmente un esbozo breve, no solo "mejóralo".

Principios de tono:
- Habla del **código**, no de la persona ("esta función…", no "tú…").
- **Reconoce lo bueno** explícitamente; un PR sólido merece decirlo.
- **Prioriza por impacto.** Primero lo bloqueante; los nitpicks van al final marcados como tales (🟡/💡) para no ahogar la señal.
- Ofrece el **porqué** para que el autor aprenda y pueda decidir, no solo obedecer.
- Si hay duda legítima de diseño, **pregunta** en vez de afirmar ("¿se consideró X? si el caso Y no aplica, ignóralo").

---

## Calibración de severidad

| Severidad | Regla práctica |
|-----------|----------------|
| 🔴 **Crítico** | Si entra así, el sistema hace lo incorrecto, se rompe, o el diseño impedirá cambios necesarios pronto. Mismatch intención↔implementación; violación de límites que invierte dependencias del dominio; acoplamiento que bloquea la evolución. |
| 🟠 **Mayor** | No rompe hoy, pero es deuda real que costará caro: violación SOLID con impacto, duplicación significativa, abstracción innecesaria costosa, divergencia fuerte del patrón del repo. |
| 🟡 **Menor** | Mejora la calidad sin riesgo sistémico: naming, legibilidad, duplicación pequeña, micro-inconsistencias. |
| 💡 **Sugerencia** | Opcional: alternativa de estilo, idea a futuro, "nice to have". |

Ante la duda entre dos niveles, decide por el **impacto en el sistema**, no por lo molesto que te resulte. No infles ni minimices.

---

## Ejemplos de feedback (bueno vs malo)

**Ejemplo 1 — mismatch de intención**
- ❌ Malo: "El código está mal, no hace lo que pide la historia."
- ✅ Bueno: "🔴 La `US-042` pide aplicar el descuento solo a usuarios `premium` (`BR-03`), pero `applyDiscount()` lo aplica a todos. **Por qué:** incumple la regla de negocio y afectaría facturación. **Impacto:** cálculo de precio para todos los usuarios. **Sugerencia:** condicionar con `if (user.tier === 'premium')` antes de aplicar, o mover la decisión al caso de uso que ya conoce el `tier`."

**Ejemplo 2 — violación de capas**
- ❌ Malo: "Esto rompe Clean Architecture."
- ✅ Bueno: "🟠 `OrderEntity` (dominio) importa `PrismaClient`. **Por qué:** invierte la dirección de dependencias — el dominio queda atado a la infraestructura y no es testeable de forma aislada. **Impacto:** todo el módulo de pedidos. **Sugerencia:** definir un puerto `OrderRepository` en el dominio y dejar la implementación Prisma en infraestructura, siguiendo el patrón ya usado en `UserRepository`."

**Ejemplo 3 — abstracción innecesaria**
- ❌ Malo: "Sobra una capa."
- ✅ Bueno: "🟡 `StringUtilsFactory` crea una sola instancia de `StringUtils` sin variación. **Por qué:** añade indirección sin beneficio (un solo uso, sin polimorfismo previsto). **Impacto:** legibilidad. **Sugerencia:** usar `StringUtils` directamente; si más adelante hay variantes, introducir la factory entonces."

**Ejemplo 4 — reconocer lo bueno**
- ✅ "El manejo de errores con `Result<T>` es consistente con el resto del repo y cubre los casos vacíos — buen trabajo. Sin hallazgos en esta dimensión."
