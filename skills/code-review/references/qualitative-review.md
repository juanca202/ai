# Referencia: Revisión cualitativa estilo senior

Esta referencia detalla **cómo** evaluar las [tres dimensiones](../SKILL.md#las-tres-dimensiones) de la revisión cualitativa. Se carga desde `SKILL.md` en el Paso 3. Asume ya resueltos el diff bajo revisión, el contexto del sistema (patrones del repo, límites de capas) y la intención del cambio.

> **Sin ejecución de herramientas.** Las tres dimensiones se evalúan **leyendo** el diff y su contexto. No se corren pruebas, linter ni build: ese plano es del skill [`quality-check`](../../quality-check/SKILL.md).

> **Mentalidad:** eres un ingeniero senior revisando el PR de un compañero al que aprecias. Quieres que el código entre, pero bien. No eres un linter: razonas sobre intención, diseño e impacto en el sistema, y cuando algo está bien, lo dices.

---

## Modelo de calidad: ISO/IEC 25010

La revisión cualitativa usa **ISO/IEC 25010** como marco de referencia para clasificar y priorizar hallazgos. En lugar de revisar "a ojo de buen cubero", cada hallazgo se mapea a una característica de calidad del modelo, lo que da consistencia, trazabilidad y vocabulario compartido.

Las características relevantes para code review son:

| Característica | Sub-características clave | Qué buscar en el diff |
|----------------|--------------------------|----------------------|
| **Adecuación funcional** | Completitud, corrección, adecuación | El código hace exactamente lo pedido, ni más ni menos. Cubre todos los criterios. |
| **Mantenibilidad** | Modularidad, reusabilidad, analizabilidad, modificabilidad, testabilidad | SOLID, Clean Architecture, acoplamiento, duplicación, legibilidad, calidad y pertinencia de las pruebas incluidas en el diff (no su ejecución). |
| **Fiabilidad** | Madurez, tolerancia a fallos, recuperabilidad | Manejo de errores, casos borde, reintentos, estados inconsistentes. |
| **Seguridad** | Confidencialidad, integridad, autenticidad, no repudio | Inyección, exposición de datos sensibles, autenticación/autorización, validación de entradas. |
| **Eficiencia en el desempeño** | Comportamiento temporal, uso de recursos, capacidad | Complejidad algorítmica innecesaria, N+1, falta de paginación, recursos no liberados. |
| **Compatibilidad** | Coexistencia, interoperabilidad | Cambios de contrato (API, eventos, esquemas) que rompen otros módulos o versiones. |

> **Cómo usar el modelo:** al redactar un hallazgo, indica la característica afectada. Esto prioriza el análisis (Adecuación funcional y Seguridad son casi siempre 🔴/🟠; Eficiencia puede ser 🟡 si el impacto es bajo) y facilita la trazabilidad del informe. No busques cubrir cada característica por obligación — evalúa solo las que el diff toca.

**Formato de hallazgo con característica ISO/IEC 25010:**
```
[ISO-25010: <Característica>] 🔴/🟠/🟡/💡 <Título del hallazgo>
Qué: ...
Por qué: ...
Impacto: ...
Sugerencia: ...
```

---

## Contenido

1. [Dimensión 1 — Análisis semántico (intención)](#dimensión-1--análisis-semántico-intención)
2. [Dimensión 2 — Arquitectura, diseño y calidad del producto](#dimensión-2--arquitectura-diseño-y-calidad-del-producto)
3. [Dimensión 3 — Feedback estilo senior](#dimensión-3--feedback-estilo-senior)
4. [Calibración de severidad](#calibración-de-severidad)
5. [Ejemplos de feedback (bueno vs malo)](#ejemplos-de-feedback-bueno-vs-malo)

---

## Dimensión 1 — Análisis semántico (intención)

**Objetivo:** confirmar que el código resuelve *el problema correcto*, no solo que "funciona".

Los hallazgos de esta dimensión se etiquetan como `[ISO-25010: Adecuación funcional]`.

Pasos:

1. **Reconstruir la intención** desde las fuentes disponibles, en este orden: criterios de aceptación de la US (`AC-XXX`) en el `README.md`; descripción del TK; nombre de la rama; mensajes de commit del rango; descripción del PR si existe.
2. **Mapear diff ↔ intención:** para cada parte relevante del cambio, ¿a qué objetivo responde? Para cada objetivo declarado, ¿está cubierto en el diff?
3. **Buscar desajustes (mismatch):**
   - El código resuelve un problema **distinto** o **más amplio** del pedido (scope creep silencioso).
   - Un criterio de aceptación o regla de negocio **sin cubrir**.
   - **Efectos colaterales** no buscados (toca un flujo ajeno, cambia un contrato público sin necesidad).
   - Lógica que **contradice su nombre/intención** (una función `validateX` que además persiste, un `getY` con efectos).
   - Casos borde implícitos en la intención que el código ignora (nulos, vacíos, concurrencia, errores).

Señales de buen estado: el diff cubre exactamente los `AC-XXX`, sin lógica de más, y los casos borde del dominio están contemplados.

---

## Dimensión 2 — Arquitectura, diseño y calidad del producto

**Objetivo:** que el cambio sea mantenible y coherente con el sistema, no solo localmente correcto. Las siguientes secciones se organizan por las características de **ISO/IEC 25010** más relevantes para code review. Evalúa únicamente las que el diff toca.

### Mantenibilidad — SOLID (con criterio, no como checklist ciega)
- **S** — ¿una clase/función tiene una sola razón para cambiar? Banderas: nombres con "y"/"Manager"/"Helper" que esconden múltiples responsabilidades.
- **O** — ¿se extiende sin modificar lo existente? Un `switch`/`if` por tipo que crece con cada caso nuevo pide polimorfismo o estrategia.
- **L** — ¿las subclases/implementaciones respetan el contrato del tipo base (no lanzan donde no deben, no debilitan postcondiciones)?
- **I** — ¿las interfaces son específicas, o se obliga a implementar métodos que no se usan?
- **D** — ¿el código de alto nivel depende de **abstracciones**, no de detalles concretos?

### Mantenibilidad — Límites de Clean Architecture / capas
- **Dirección de dependencias:** dominio/casos de uso **no** dependen de infraestructura, frameworks ni UI. Si una entidad importa el ORM o el cliente HTTP, es bandera.
- **Fugas de capa:** detalles de persistencia/transporte que se filtran al dominio (DTOs como entidades, anotaciones de framework en el núcleo).
- **Ubicación correcta:** la lógica de negocio vive en el dominio/caso de uso, no en el controlador ni en el repositorio.

### Mantenibilidad — Acoplamiento, duplicación, abstracción
- **Acoplamiento:** ¿este módulo conoce demasiado de otro? ¿un cambio aquí obliga a cambios en cascada? ¿dependencias circulares?
- **Duplicación:** lógica copiada que debió extraerse. Distinguir duplicación **real** (misma razón de cambio) de coincidencia superficial — no toda repetición es deuda.
- **Abstracción innecesaria:** capas, genéricos, factories o wrappers que **no pagan su coste**; indirección que solo añade saltos para leer. Una abstracción con un solo uso y sin variación prevista suele sobrar (regla de "no abstraigas hasta el tercer caso", con criterio).

### Mantenibilidad — Patrones del proyecto
- Contrastar contra el **estilo ya existente** en el repo: estructura de carpetas, convenciones de naming, manejo de errores, forma de inyectar dependencias, librerías ya adoptadas.
- Una solución técnicamente correcta pero **ajena al patrón del repo** introduce inconsistencia (deuda cognitiva). Señalarlo y proponer alinear, salvo que el cambio mejore deliberadamente el patrón (entonces, ¿es consistente en todo el diff?).

### Fiabilidad — Manejo de errores y casos borde
- ¿Los errores se capturan en el nivel correcto y se propagan con contexto útil?
- ¿Hay caminos felices sin rama de error correspondiente (excepciones no capturadas, promesas sin `.catch`, errores silenciados)?
- ¿Se contemplan los casos borde implícitos del dominio: nulos/undefined, colecciones vacías, concurrencia, timeouts, reintentos?
- ¿Los estados del sistema pueden quedar inconsistentes si una operación falla a mitad (transaccionalidad, rollback)?

### Seguridad — Vulnerabilidades y exposición
- **Validación de entradas:** ¿toda entrada externa (HTTP, eventos, archivos) se valida antes de usarse? Banderas: inyección SQL/NoSQL, XSS, path traversal, desserialización insegura.
- **Datos sensibles:** ¿se loguean contraseñas, tokens, PII? ¿se exponen en respuestas más de lo necesario?
- **Autenticación y autorización:** ¿se verifica que el actor tiene permiso antes de ejecutar la operación? ¿hay endpoints o métodos que asumen identidad sin verificarla?
- **Secretos en código:** ¿hay credenciales, API keys o URLs de entorno hardcodeadas en el diff?

### Eficiencia en el desempeño — Complejidad y recursos
- ¿Hay consultas N+1 (bucle que dispara una query por iteración)?
- ¿Operaciones O(n²) o peores donde el dominio puede crecer significativamente?
- ¿Recursos (conexiones, streams, handles) que se abren pero no se cierran?
- ¿Falta de paginación en listados que pueden crecer sin límite?
- Evaluar solo si el diff toca código de acceso a datos, procesamiento en lote o rutas de alto tráfico; no inflar hallazgos de rendimiento en lógica de dominio simple.

### Compatibilidad — Contratos e interoperabilidad
- ¿El diff cambia un contrato público (firma de API REST/gRPC, schema de evento, esquema de BD compartido) de forma que rompe consumidores existentes?
- ¿Se depreca algo sin periodo de migración o sin versionar?
- ¿Los cambios son retrocompatibles o requieren coordinación de despliegue con otros servicios?

---

## Dimensión 3 — Feedback estilo senior

Cada hallazgo se redacta siguiendo el formato canónico definido en la sección [Modelo de calidad: ISO/IEC 25010](#modelo-de-calidad-isoiec-25010):

```
[ISO-25010: <Característica>] 🔴/🟠/🟡/💡 <Título>
Qué: el problema, ubicado (archivo/símbolo).
Por qué: qué se rompe, encarece o arriesga a futuro. Obligatorio.
Impacto: alcance en el sistema (local, módulo, contrato público, datos).
Sugerencia: cómo quedaría mejor; idealmente un esbozo breve.
```

La característica ISO/IEC 25010 se hereda de la dimensión donde se detectó el hallazgo (Dimensión 1 → Adecuación funcional; Dimensión 2 → la característica de la subsección correspondiente).

Principios de tono:
- Habla del **código**, no de la persona ("esta función…", no "tú…").
- **Reconoce lo bueno** explícitamente; un PR sólido merece decirlo.
- **Prioriza por impacto.** Primero lo bloqueante; los nitpicks van al final marcados como tales (🟡/💡) para no ahogar la señal.
- Ofrece el **porqué** para que el autor aprenda y pueda decidir, no solo obedecer.
- Si hay duda legítima de diseño, **pregunta** en vez de afirmar ("¿se consideró X? si el caso Y no aplica, ignóralo").

---

## Calibración de severidad

| Severidad | Regla práctica | Características ISO/IEC 25010 típicas |
|-----------|----------------|---------------------------------------|
| 🔴 **Crítico** | Si entra así, el sistema hace lo incorrecto, se rompe, o el diseño impedirá cambios necesarios pronto. Mismatch intención↔implementación; violación de límites que invierte dependencias del dominio; acoplamiento que bloquea la evolución; vulnerabilidad de seguridad explotable; estado inconsistente ante fallo. | Adecuación funcional, Seguridad, Fiabilidad |
| 🟠 **Mayor** | No rompe hoy, pero es deuda real que costará caro: violación SOLID con impacto, duplicación significativa, abstracción innecesaria costosa, divergencia fuerte del patrón del repo; N+1 en ruta crítica; cambio de contrato sin versionado. | Mantenibilidad, Eficiencia en el desempeño, Compatibilidad |
| 🟡 **Menor** | Mejora la calidad sin riesgo sistémico: naming, legibilidad, duplicación pequeña, micro-inconsistencias, caso borde de baja probabilidad. | Mantenibilidad (analizabilidad) |
| 💡 **Sugerencia** | Opcional: alternativa de estilo, idea a futuro, "nice to have". | Cualquiera |

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
