---
name: prompt-validator
description: Validar prompts dirigidos a agentes de IA (Claude Code, Cursor, Copilot, etc.) contra reglas de redacción efectiva. Detectar verbos no imperativos, lenguaje conversacional, acciones vagas, términos subjetivos, alcance difuso, prohibiciones implícitas, intenciones múltiples y nombres genéricos; devolver un checklist de violaciones con texto problemático, regla incumplida y sugerencia concreta, y opcionalmente una propuesta de prompt reescrito. Usar siempre que el usuario pida validar, revisar, auditar, mejorar, corregir o "pulir" un prompt antes de enviarlo a un agente, o cuando pegue un prompt y pida feedback sobre cómo está redactado.
license: MIT
---
 

# Skill: Prompt Validator
 
Validar y mejorar prompts dirigidos a agentes de IA aplicando un conjunto fijo de **11 reglas de redacción imperativa**.
 
El skill **no** ejecuta el prompt ni produce el código pedido; **solo** audita la redacción y devuelve un informe accionable.
 
---
 
## Purpose
 
Auditar un prompt recibido del usuario y devolver:
 
1. Un **checklist de violaciones** por cada regla incumplida, con: regla, fragmento problemático literal, motivo y sugerencia concreta de reemplazo.
2. Un **resumen** con el número de reglas cumplidas / evaluables.
3. Una **propuesta de prompt reescrito** que aplique todas las sugerencias.
Usar cuando el usuario pida revisar, validar, mejorar o auditar un prompt; o cuando pegue un prompt en el chat y pida feedback sobre su redacción.
 
---
 
## Scope
 
**Incluye:**
 
- Análisis de prompts en español o inglés dirigidos a agentes de código (Claude Code, Cursor, Copilot, Cline, etc.).
- Detección de las 11 violaciones tipificadas en [Rules](#rules).
- Sugerencia concreta de reemplazo para cada violación detectada.
- Generación de un prompt reescrito final que integre todas las sugerencias.
**No incluye:**
 
- Ejecutar o cumplir el prompt (no escribir el código, middleware, refactor, etc. que el prompt pide).
- Evaluar la *corrección técnica* del contenido del prompt (si la solución pedida tiene sentido en el stack del usuario). El skill audita **redacción**, no **arquitectura**.
- Reglas distintas de las 11 listadas (estilo de redacción literaria, ortografía, gramática general).
- Validar prompts para imagen, audio o tareas no-código (el skill está calibrado a prompts de desarrollo).
---
 
## Inputs
 
Para ejecutar bien el skill, el agente necesita:
 
- **Obligatorio:** el **texto del prompt** a auditar, completo y literal.
- **Opcional:**
  - Lenguaje/stack del proyecto (ayuda a juzgar si un nombre es "exacto" o genérico, p. ej. `AuthService` vs `un servicio`).
  - Si el usuario quiere **solo el checklist** o **también el prompt reescrito** (por defecto: ambos).
  - Si el prompt es **un fragmento** de uno mayor o **independiente** (un fragmento puede legítimamente referirse a contexto ya establecido).
Si el prompt llega como captura, imagen o referencia indirecta (p. ej. "el prompt que te pasé ayer"), **pedir** el texto literal antes de auditar. No inventar el contenido.
 
---
 
## Outputs
 
El skill **siempre** responde con esta estructura, en el idioma del prompt auditado:
 
```
## Análisis del prompt
 
**Prompt analizado:**
> [transcripción literal del prompt]
 
### Resumen
- Reglas evaluables: N/11
- Cumple: X/N
- Violaciones detectadas: Y
 
### Violaciones
 
#### [R-N · Nombre de la regla]
- **Texto problemático:** "<fragmento literal>"
- **Por qué incumple:** <explicación breve, 1 línea>
- **Sugerencia:** "<reemplazo concreto>"
 
[... una entrada por cada violación ...]
 
### Prompt reescrito (propuesta)
 
> [prompt completo aplicando todas las sugerencias]
```
 
Si el prompt **no tiene violaciones**, omitir la sección "Violaciones" y devolver:
 
```
### Resultado
Cumple las 11 reglas evaluables. Sin sugerencias.
```
 
Si el usuario pidió **solo checklist** o **solo prompt reescrito**, devolver únicamente esa sección.
 
---
 
## Rules
 
Las 11 reglas de auditoría. Cada una incluye el patrón a detectar y ejemplos MAL → BIEN.
 
### R-1 · Usar imperativo directo (sin cortesía ni atenuación)
 
Detectar dos sub-patrones que suavizan el mando hacia el agente. Ambos comparten el mismo fix (reescribir a imperativo directo) y un mismo fragmento puede activar ambos.
 
**Patrón A — Atenuación verbal:** verbos en modo no-imperativo dirigidos al agente.
 
- `puedes`, `podrías`, `deberías`, `sería bueno que`, `tendrías que`, `can you`, `could you`, `should`, `would you`
**Patrón B — Envoltura desiderativa o de cortesía:** wrappers que expresan deseo, pedido suave o agradecimiento anticipado.
 
- `me gustaría que`, `te pido que`, `necesito que por favor`, `quisiera`, `I'd like you to`, `please`, `if you could`
Ejemplos:
 
- MAL: `Puedes crear un middleware` (A)
- MAL: `Me gustaría que implementes refresh tokens` (B)
- MAL: `Me gustaría que pudieras crear un middleware` (A + B)
- BIEN: `Crea un middleware` / `Implementa refresh tokens`
En el output, si co-disparan los dos sub-patrones sobre el mismo fragmento, listar bajo una sola entrada R-1 indicando cuál(es) aplica(n) en "Por qué incumple".
 
### R-2 · Usar acciones específicas
 
Detectar verbos genéricos sin objeto concreto: `mejorar`, `optimizar`, `arreglar`, `pulir`, `revisar`, `improve`, `optimize`, `fix`, `polish` cuando no van acompañados de **qué exactamente** y **cómo**.
 
- MAL: `Mejora la autenticación`
- BIEN: `Implementa refresh token con expiración automática a los 15 minutos`
### R-3 · Evitar términos subjetivos
 
Lista cerrada de términos ambiguos para un agente. Detectar (en español o inglés):
 
`limpio`, `bonito`, `elegante`, `robusto`, `escalable`, `profesional`, `moderno`, `bien hecho`, `de calidad`, `idiomático`, `clean`, `nice`, `elegant`, `robust`, `scalable`, `professional`, `modern`, `well-made`, `quality`, `idiomatic`.
 
- MAL: `Hazlo limpio y moderno`
- BIEN: `Usa componentes pequeños (<150 líneas) y separación feature-based bajo /features`
Cada término subjetivo detectado **debe** convertirse en una restricción observable concreta en la sugerencia.
 
### R-4 · Delimitar el alcance
 
Detectar instrucciones globales sin ruta, módulo o entidad concreta: `refactoriza el proyecto`, `revisa todo el código`, `actualiza el sistema`, `refactor the project`, `update everything`.
 
- MAL: `Refactoriza el proyecto`
- BIEN: `Refactoriza únicamente /features/auth`
**Refinamiento opcional — cuantificador exclusivo:** si el alcance ya está delimitado pero no lleva cuantificador exclusivo, proponer agregarlo (`solo`, `únicamente`, `exclusivamente`) para reforzar que nada fuera de ese alcance debe modificarse.
 
- ACEPTABLE: `Modifica archivos dentro de /auth`
- MEJOR: `Modifica únicamente archivos dentro de /auth`
Este refinamiento se marca como "mejora opcional" debajo de R-4 en el output y **no cuenta como violación separada** en el contador.
 
### R-5 · Usar "NO" explícitos
 
Detectar prohibiciones tibias o sugeridas: `preferiblemente no`, `evita en lo posible`, `trata de no`, `intenta no usar`, `try not to`, `avoid if possible`, `preferably don't`.
 
- MAL: `Preferiblemente no usar Redux`
- BIEN: `No uses Redux`
### R-6 · Evitar instrucciones implícitas
 
Detectar apelaciones a estándares no especificados: `buenas prácticas`, `best practices`, `código de calidad`, `como debe ser`, `siguiendo las convenciones`, `clean code`, `SOLID` (sin más detalle), `following best practices`.
 
- MAL: `Hazlo siguiendo buenas prácticas`
- BIEN (checklist explícito):
  - Evita lógica en componentes
  - Usa hooks para estado
  - Separa dominio e infraestructura
Cada apelación implícita debe convertirse en una lista de reglas explícitas en la sugerencia (con la mejor inferencia razonable del contexto, marcando claramente que son suposiciones a confirmar).
 
### R-7 · Una intención por frase
 
Detectar frases que mezclan múltiples objetivos con `y aprovecha para`, `y de paso`, `y también`, `mientras tanto`, `and while you're at it`, `also`, `and also optimize`.
 
- MAL: `Implementa autenticación y aprovecha para mejorar el routing y optimizar el código`
- BIEN (descompuesto):
  - `Implementa autenticación.`
  - `No modifiques routing global.`
  - `No optimices módulos no relacionados.`
### R-8 · Usar nombres exactos para artefactos nuevos
 
Detectar sustantivos genéricos para artefactos que el prompt pide **crear desde cero**, cuando el contexto permitiría un nombre específico.
 
**Triggers (los tres deben cumplirse):**
 
- Verbo de **creación pura**: `crea`, `construye`, `genera`, `make`, `build`, `generate`.
- Objeto abstracto sin nombre: `un servicio`, `el componente`, `una clase`, `un método`, `a service`, `the component`, `a class`.
- El contexto **no** sugiere que el artefacto ya existe (el prompt habla de algo nuevo a producir, no de modificar lo existente).
Ejemplos:
 
- MAL: `Crea un servicio`
- BIEN: `Crea AuthService`
Si el prompt no contiene contexto suficiente para sugerir un nombre exacto, marcar la sugerencia como `Crea <Nombre>Service` y pedir al usuario que rellene el nombre.
 
**Diferencia con R-10 (contexto real):**
 
- **R-8** aplica cuando el artefacto **es nuevo** y necesita un nombre. Verbo de creación pura + contexto greenfield.
- **R-10** aplica cuando el artefacto **ya existe** y el prompt debería referenciarlo en vez de pedir crear uno paralelo. Verbo de modificación, o verbo ambiguo + evidencia de código preexistente.
Si el verbo y el contexto son ambiguos sobre si el artefacto es nuevo o existente, **prefiere R-10** con placeholder + nota cruzada a R-8.
 
### R-9 · Usar formato checklist para listas de tareas
 
Detectar prompts que enumeran ≥2 acciones en una sola línea separadas por comas o `y` sin formato de lista.
 
- MAL: `Implementa middleware auth, hook useAuth y redirect a /login`
- BIEN:
  ```
  Implementa:
  - middleware auth
  - hook useAuth
  - redirect a /login
  ```
 
### R-10 · Dale contexto real, no solo intención
 
Detectar prompts que describen una **intención abstracta** sobre código existente sin **anclar la solicitud a artefactos concretos** (archivos, rutas, métodos, clases, símbolos, líneas).
 
**Por qué importa:** las alucinaciones aparecen cuando el modelo "imagina" el código faltante. Sin anclaje, el agente inventa nombres de funciones, firmas, rutas y ubicaciones en lugar de reutilizar lo que ya existe en el repo.
 
**Triggers por verbo:**
 
- **Verbos de modificación** (siempre disparan R-10 si no hay anchor): `modifica`, `extiende`, `arregla`, `corrige`, `refactoriza`, `migra`, `actualiza`, `modify`, `extend`, `fix`, `refactor`, `migrate`, `update`. No puedes modificar lo que no existe; sin anchor el agente alucina la ubicación.
- **Verbos ambiguos** (disparan R-10 cuando el contexto sugiere proyecto existente; si es greenfield, aplica R-8): `implementa`, `agrega`, `implement`, `add`.
- Descripciones de objetivo (`para pagos`, `para autenticación`, `for payments`) sin indicar dónde vive el código relevante ni qué se extiende.
**Anclajes válidos (cualquiera de estos satisface la regla):**
 
- ruta de archivo (`src/services/PaymentService.ts`)
- método existente (`processPayment()`)
- clase o símbolo concreto del proyecto
- línea concreta cuando el cambio es local (`src/auth/AuthController.ts:47`)
- patrón análogo ya implementado a imitar (`siguiendo el patrón de register()`)
Ejemplos:
 
- MAL: `Modifica el login`
- BIEN: `Modifica login() en src/auth/AuthController.ts reutilizando el patrón de register()`
- MAL: `Crea un servicio para pagos` (contexto: el proyecto ya tiene PaymentService)
- BIEN: `Extiende processPayment() en src/services/PaymentService.ts`
- MAL: `Agrega validación al formulario`
- BIEN: `En src/forms/UserForm.tsx, agrega validación al campo email reutilizando validateEmail() de src/utils/validators.ts`
**Cuándo NO aplica R-10:**
 
- Verbos de creación pura (`crea`, `construye`) Y contexto claramente greenfield → aplica R-8.
- Si el contexto del chat deja claro que no existe artefacto previo a referenciar.
Si el agente que audita no tiene visibilidad sobre el proyecto del usuario, debe proponer la sugerencia con placeholders explícitos (`<archivo>`, `<método existente>`, `<línea>`) y pedir al usuario que rellene las referencias concretas.
 
### R-11 · Justificar el cambio con evidencia
 
Detectar prompts que ordenan un cambio sobre código existente **sin indicar por qué** el cambio es necesario, qué comportamiento actual está mal, o qué decisión/requisito lo motiva.
 
**Por qué importa:** sin justificación, el agente ejecuta la instrucción literal pero no puede tomar decisiones colaterales razonables (qué tocar y qué no tocar alrededor, qué tests proteger, cómo resolver ambigüedades). El "porque" le da al agente el criterio para juzgar el alcance real del cambio.
 
**Triggers:**
 
- Verbos de modificación (`modifica`, `cambia`, `actualiza`, `arregla`, `corrige`, `refactoriza`, `migra`, `modify`, `change`, `update`, `fix`, `refactor`, `migrate`) sobre un símbolo concreto, **sin** cláusula causal:
  - `porque <X>`, `ya que <X>`, `dado que <X>`, `because <X>`, `since <X>`, `to fix <X>`, `para resolver <X>`
  - referencia a comportamiento actual incorrecto, requisito de negocio, ticket, ADR o decisión documentada
- Solicitudes de "arreglar" / "corregir" sin describir síntoma observado vs. comportamiento esperado.
Ejemplos:
 
- MAL: `Modifica login()`
- BIEN: `Modifica login() en src/auth/AuthController.ts porque actualmente no valida el refresh token y permite sesiones expiradas`
- MAL: `Arregla el cálculo del descuento`
- BIEN: `Arregla calculateDiscount() en src/pricing/Discount.ts porque está aplicando el porcentaje sobre el precio con impuestos; debería aplicarse sobre el precio base (ver ADR-007)`
- MAL: `Refactoriza UserRepository`
- BIEN: `Refactoriza UserRepository en src/data/UserRepository.ts para extraer la lógica de paginación a un helper, porque se repite en OrderRepository y ProductRepository`
**Cuándo NO aplica R-11:**
 
- Cambios triviales no cargados de lógica de negocio (añadir un log, un import, un comentario, formateo).
- Adición de features greenfield donde no hay "comportamiento actual" a justificar (entonces aplican R-2 y R-8, no R-11).
- Tareas puramente mecánicas (renombrado masivo, migración 1-a-1) donde el "porque" es evidente por el verbo.
**Diferencia con R-2 (acciones específicas) y R-10 (contexto real):**
 
- **R-2** exige decir **qué** hacer técnicamente (`mejora` → `implementa refresh con expiración 15 min`).
- **R-10** exige decir **dónde** está el código existente sobre el que se trabaja (`un servicio` → `PaymentService.ts, processPayment()`).
- **R-11** exige decir **por qué** el cambio es necesario (`Modifica login()` → `... porque no valida refresh token`).
Un prompt puede cumplir R-2 y R-10 pero fallar R-11: `Modifica login() en AuthController.ts para usar JWT en vez de session cookies` cumple R-2 y R-10, falla R-11 si "para usar JWT" es la acción y no la motivación (no responde *por qué* hay que cambiar de session a JWT).
 
---
 
## Ejecución del análisis
 
Para cada prompt recibido, el agente debe:
 
1. **Leer el prompt completo** y separarlo en frases u oraciones.
2. **Aplicar las 11 reglas en orden**, frase por frase. Una misma frase puede incumplir varias reglas (p. ej. `Me gustaría que mejores el código de forma elegante` incumple R-1 cortesía + atenuación, R-2 acción vaga y R-3 término subjetivo).
3. **Citar literalmente** el fragmento problemático en cada violación. No parafrasear el fragmento original; sí parafrasear/reescribir en la sugerencia.
4. **Producir la sugerencia más concreta posible**. Si falta contexto (p. ej. para nombrar `AuthService`), proponer un placeholder explícito y pedir confirmación.
5. **Generar el prompt reescrito** integrando todas las sugerencias, manteniendo la intención original del usuario. No añadir requisitos nuevos que el prompt no contemplaba.
6. **Conservar el idioma** del prompt original en el prompt reescrito.
---
 
## Anti-patterns
 
Evitar al ejecutar este skill:
 
- **Cumplir el prompt** en lugar de auditarlo (p. ej. el usuario pega `Crea un middleware` y el agente crea el middleware).
- **Inventar violaciones** que no están en las 11 reglas (no es un skill de estilo libre).
- **Marcar como violación principal** el refinamiento opcional de R-4 (cuantificador exclusivo) cuando solo es una mejora, no un fallo.
- **Disparar R-8 y R-10 a la vez** sobre el mismo fragmento sin disambiguar. Si el contexto es claro, escoge una; si es ambiguo, prefiere R-10 con placeholder + nota cruzada a R-8.
- **Reescribir la intención** del prompt en la propuesta final (añadir features, cambiar el stack, decidir por el usuario decisiones de arquitectura no implicadas).
- **Parafrasear el fragmento problemático**: debe citarse literal, entre comillas, para que el usuario lo localice en su prompt.
- **Devolver solo la propuesta reescrita** sin el checklist de violaciones (perdería valor pedagógico). Excepción: el usuario lo pide explícitamente.
- **Omitir la versión reescrita** salvo si el usuario lo pidió.
- **Auditar un prompt cuyo texto no se ha recibido literal** (no inferir, pedir).
- **Mezclar idiomas** en el prompt reescrito si el original era monolingüe.
---
 
## Notes
 
### Cómo contar "reglas evaluables"
 
No todas las 11 reglas aplican a todos los prompts. P. ej. R-9 (formato checklist) solo aplica si el prompt enumera ≥2 acciones. En el resumen:
 
- **Evaluables (N)** = reglas que aplican al prompt (entre 1 y 11).
- **Cumplidas (X)** = evaluables sin violación.
- **Violaciones (Y)** = N − X.
**Condiciones especiales de evaluabilidad:**
 
- **R-4 refinamiento opcional** (cuantificador exclusivo) no cuenta como violación separada; si dispara, se anota como "mejora opcional" debajo de R-4 sin afectar el contador.
- **R-8** cuenta como evaluable solo si el prompt usa un verbo de creación pura y el contexto sugiere greenfield. Si el contexto es claramente "modificar lo existente", R-8 no aplica.
- **R-10** cuenta como evaluable salvo que el contexto deje claro que el prompt es para un proyecto greenfield sin código previo a referenciar.
- **R-11** cuenta como evaluable solo si el prompt pide un cambio sobre código existente con impacto en lógica de negocio o contratos públicos; no aplica a cambios triviales (logs, imports, formato) ni a features greenfield.
### Severidad
 
Las violaciones no tienen niveles formales, pero el orden de presentación en el output sigue el orden de las reglas (R-1 → R-11), no severidad. El refinamiento opcional de R-4 se etiqueta como "mejora opcional" para distinguirlo del resto.
 
### Idioma
 
Las listas de términos detectables incluyen variantes en **español e inglés**. Si el prompt llega en otro idioma, traducir mentalmente los patrones y aplicar las reglas conceptuales (verbo imperativo, ausencia de cortesía, etc.).
 
### Prompts muy cortos
 
Para prompts ≤10 palabras (p. ej. `arregla esto`), priorizar R-2 (acción específica) y R-4 (alcance) en las sugerencias; las demás reglas pueden ser N/A.
 
### Cuándo pedir contexto adicional
 
Pedir contexto al usuario **solo** si:
 
- El prompt pide crear un artefacto nuevo cuyo nombre depende del dominio del proyecto y el agente no lo conoce (R-8).
- El prompt describe una intención abstracta sobre código que probablemente ya existe en el proyecto, y la sugerencia necesita la ruta/método concreto para anclar el prompt (R-10). Si el usuario no puede o no quiere proporcionar el anclaje, dejar la sugerencia con placeholders explícitos (`<archivo>`, `<método>`) y avanzar.
- El prompt pide un cambio sobre código existente sin justificarlo y el motivo no es evidente del contexto (R-11). Pedir al usuario qué comportamiento actual está mal o qué requisito motiva el cambio.
- El prompt apela a "buenas prácticas" (R-6) y el stack/dominio cambia radicalmente lo que esas prácticas son (p. ej. React vs Quarkus).
- El prompt llega indirectamente (captura, "el de ayer") y no se tiene el texto literal.
En el resto de casos, auditar con lo recibido y marcar suposiciones en las sugerencias.
 