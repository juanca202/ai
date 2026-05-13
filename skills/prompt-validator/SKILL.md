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
 
### R-1 · Usar verbos imperativos directos
 
Detectar verbos en modo no-imperativo dirigidos al agente (`puedes`, `podrías`, `deberías`, `sería bueno que`, `tendrías que`, `can you`, `could you`, `should`, `would you`).
 
- MAL: `Puedes crear un middleware`
- BIEN: `Crea un middleware`
### R-2 · Evitar lenguaje conversacional
 
Detectar fórmulas de cortesía o desiderativas dirigidas al agente (`me gustaría que`, `te pido que`, `necesito que por favor`, `quisiera`, `I'd like you to`, `please`).
 
- MAL: `Me gustaría que implementes refresh tokens`
- BIEN: `Implementa refresh tokens`
### R-3 · Usar acciones específicas
 
Detectar verbos genéricos sin objeto concreto: `mejorar`, `optimizar`, `arreglar`, `pulir`, `revisar`, `improve`, `optimize`, `fix`, `polish` cuando no van acompañados de **qué exactamente** y **cómo**.
 
- MAL: `Mejora la autenticación`
- BIEN: `Implementa refresh token con expiración automática a los 15 minutos`
### R-4 · Evitar términos subjetivos
 
Lista cerrada de términos ambiguos para un agente. Detectar (en español o inglés):
 
`limpio`, `bonito`, `elegante`, `robusto`, `escalable`, `profesional`, `moderno`, `bien hecho`, `de calidad`, `idiomático`, `clean`, `nice`, `elegant`, `robust`, `scalable`, `professional`, `modern`, `well-made`, `quality`, `idiomatic`.
 
- MAL: `Hazlo limpio y moderno`
- BIEN: `Usa componentes pequeños (<150 líneas) y separación feature-based bajo /features`
Cada término subjetivo detectado **debe** convertirse en una restricción observable concreta en la sugerencia.
 
### R-5 · Delimitar el alcance
 
Detectar instrucciones globales sin ruta, módulo o entidad concreta: `refactoriza el proyecto`, `revisa todo el código`, `actualiza el sistema`, `refactor the project`, `update everything`.
 
- MAL: `Refactoriza el proyecto`
- BIEN: `Refactoriza únicamente /features/auth`
### R-6 · Usar "NO" explícitos
 
Detectar prohibiciones tibias o sugeridas: `preferiblemente no`, `evita en lo posible`, `trata de no`, `intenta no usar`, `try not to`, `avoid if possible`, `preferably don't`.
 
- MAL: `Preferiblemente no usar Redux`
- BIEN: `No uses Redux`
### R-7 · Evitar instrucciones implícitas
 
Detectar apelaciones a estándares no especificados: `buenas prácticas`, `best practices`, `código de calidad`, `como debe ser`, `siguiendo las convenciones`, `clean code`, `SOLID` (sin más detalle), `following best practices`.
 
- MAL: `Hazlo siguiendo buenas prácticas`
- BIEN (checklist explícito):
  - Evita lógica en componentes
  - Usa hooks para estado
  - Separa dominio e infraestructura
Cada apelación implícita debe convertirse en una lista de reglas explícitas en la sugerencia (con tu mejor inferencia razonable del contexto, marcando claramente que son suposiciones a confirmar).
 
### R-8 · Una intención por frase
 
Detectar frases que mezclan múltiples objetivos con `y aprovecha para`, `y de paso`, `y también`, `mientras tanto`, `and while you're at it`, `also`, `and also optimize`.
 
- MAL: `Implementa autenticación y aprovecha para mejorar el routing y optimizar el código`
- BIEN (descompuesto):
  - `Implementa autenticación.`
  - `No modifiques routing global.`
  - `No optimices módulos no relacionados.`
### R-9 · Usar "solo / únicamente / exclusivamente"
 
Detectar instrucciones de alcance que **podrían** ser absolutas pero no llevan el cuantificador exclusivo. Aplicar **solo** cuando R-5 ya está cumplida (hay un alcance concreto) pero falta el refuerzo de exclusividad.
 
- ACEPTABLE: `Modifica archivos dentro de /auth`
- MEJOR: `Modifica únicamente archivos dentro de /auth`
Esta regla es de **refinamiento**, no de violación grave: marcarla como "mejora opcional" en el output, no como violación crítica.
 
### R-10 · Usar nombres exactos
 
Detectar sustantivos genéricos cuando el contexto permitiría un nombre específico: `un servicio`, `el componente`, `una clase`, `un método`, `a service`, `the component`, `a class`.
 
- MAL: `Crea un servicio`
- BIEN: `Crea AuthService`
Si el prompt no contiene el contexto suficiente para sugerir un nombre exacto, marcar la sugerencia como `Crea <Nombre>Service` y pedir al usuario que rellene el nombre.
 
### R-11 · Usar formato checklist para listas de tareas
 
Detectar prompts que enumeran ≥2 acciones en una sola línea separadas por comas o `y` sin formato de lista.
 
- MAL: `Implementa middleware auth, hook useAuth y redirect a /login`
- BIEN:
  ```
  Implementa:
  - middleware auth
  - hook useAuth
  - redirect a /login
  ```
 
---
 
## Ejecución del análisis
 
Para cada prompt recibido, el agente debe:
 
1. **Leer el prompt completo** y separarlo en frases u oraciones.
2. **Aplicar las 11 reglas en orden**, frase por frase. Una misma frase puede incumplir varias reglas (p. ej. `Me gustaría que mejores el código de forma elegante` incumple R-1, R-2, R-3 y R-4).
3. **Citar literalmente** el fragmento problemático en cada violación. No parafrasear el fragmento original; sí parafrasear/reescribir en la sugerencia.
4. **Producir la sugerencia más concreta posible**. Si falta contexto (p. ej. para nombrar `AuthService`), proponer un placeholder explícito y pedir confirmación.
5. **Generar el prompt reescrito** integrando todas las sugerencias, manteniendo la intención original del usuario. No añadir requisitos nuevos que el prompt no contemplaba.
6. **Conservar el idioma** del prompt original en el prompt reescrito.
---
 
## Anti-patterns
 
Evitar al ejecutar este skill:
 
- **Cumplir el prompt** en lugar de auditarlo (p. ej. el usuario pega `Crea un middleware` y el agente crea el middleware).
- **Inventar violaciones** que no están en las 11 reglas (no es un skill de estilo libre).
- **Marcar como violación** algo que solo es opcional (R-9 es refinamiento, no fallo).
- **Reescribir la intención** del prompt en la propuesta final (añadir features, cambiar el stack, decidir por el usuario decisiones de arquitectura no implicadas).
- **Parafrasear el fragmento problemático**: debe citarse literal, entre comillas, para que el usuario lo localice en su prompt.
- **Devolver solo la propuesta reescrita** sin el checklist de violaciones (perdería valor pedagógico). Excepción: el usuario lo pide explícitamente.
- **Omitir la versión reescrita** salvo si el usuario lo pidió.
- **Auditar un prompt cuyo texto no se ha recibido literal** (no inferir, pedir).
- **Mezclar idiomas** en el prompt reescrito si el original era monolingüe.
---
 
## Notes
 
### Cómo contar "reglas evaluables"
 
No todas las 11 reglas aplican a todos los prompts. P. ej. R-11 (formato checklist) solo aplica si el prompt enumera ≥2 acciones. En el resumen:
 
- **Evaluables (N)** = reglas que aplican al prompt (entre 1 y 11).
- **Cumplidas (X)** = evaluables sin violación.
- **Violaciones (Y)** = N − X.
R-9 cuenta como evaluable solo si R-5 ya está cumplida con un alcance concreto.
 
### Severidad
 
Las violaciones no tienen niveles formales, pero el orden de presentación en el output sigue el orden de las reglas (R-1 → R-11), no severidad. R-9 se etiqueta como "mejora opcional" para distinguirla del resto.
 
### Idioma
 
Las listas de términos detectables incluyen variantes en **español e inglés**. Si el prompt llega en otro idioma, traducir mentalmente los patrones y aplicar las reglas conceptuales (verbo imperativo, ausencia de cortesía, etc.).
 
### Prompts muy cortos
 
Para prompts ≤10 palabras (p. ej. `arregla esto`), priorizar R-3 (acción específica) y R-5 (alcance) en las sugerencias; las demás reglas pueden ser N/A.
 
### Cuándo pedir contexto adicional
 
Pedir contexto al usuario **solo** si:
 
- El prompt referencia archivos, módulos o nombres que el agente no puede ver y la sugerencia depende de ellos (R-10).
- El prompt apela a "buenas prácticas" (R-7) y el stack/dominio cambia radicalmente lo que esas prácticas son (p. ej. React vs Quarkus).
- El prompt llega indirectamente (captura, "el de ayer") y no se tiene el texto literal.
En el resto de casos, auditar con lo recibido y marcar suposiciones en las sugerencias.
 