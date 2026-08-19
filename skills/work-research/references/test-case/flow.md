# Flujo · Analizar test case

Procedimiento del flujo **Analizar test case** de `work-research`: la entrada es un
**caso de prueba** (`TC-XXX`, local o en el gestor de proyectos) y el objetivo es
determinar si **verifica lo que dice verificar** y si la **implementación lo
satisface**. Es un flujo de auditoría: no corrige el test ni el código.

```text
TC-XXX
    │
    ▼
1. Localizar el test case          ← requisito/AC que verifica, comportamiento esperado
    │
    ▼
2. Investigar el contexto          ← US/WI/FT, AC, código, tests vecinos, ADRs
    │
    ▼
3. ¿El test case es correcto?      ← escenario, resultado esperado, casos faltantes,
    │                                comportamiento vs. implementación, falso negativo
    ▼
4. Investigar la implementación    ← código que debería satisfacerlo, flujo, dependencias
    │
    ▼
5. Concluir                        ← veredicto de la matriz + handoff
    │
    ▼
RS-XXX (README.md + analysis.md)
```

**Entregable:** un `RS-XXX` con dos archivos:

- `README.md` — informe principal, con
  [`assets/research-template.md`](../../assets/research-template.md).
- `analysis.md` — análisis detallado y veredicto, con
  [`assets/test-case/analysis-template.md`](../../assets/test-case/analysis-template.md),
  referenciado desde el `README.md`.

**Dónde vive.** El TC pertenece a un artefacto, así que el RS va en el `research/` de
ese artefacto:

| El TC cuelga de… | Carpeta del RS |
|------------------|----------------|
| `US-XXX` | `docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}/` |
| `WI-XXX` | `docs/specs/work-items/WI-XXX-{kebab-case}/research/RS-XXX-{slug}/` |
| `FT-XXX` | `docs/specs/features/FT-XXX-{slug}/research/RS-XXX-{slug}/` |
| Nada local (TC suelto o solo en el gestor de proyectos) | `docs/specs/research/RS-XXX-{slug}/` |

> **Si el artefacto padre no está en su ruta activa, buscarlo bajo `docs/specs/archive/`**
> antes de darlo por inexistente, y **nunca** recrear la carpeta en la ruta activa. Si está
> archivado, **no escribir dentro** — pero tampoco parar: auditar el `TC-XXX` de un trabajo
> ya entregado es un caso legítimo y frecuente. Se lee el padre archivado como contexto y
> el `RS-XXX` se guarda en `docs/specs/research/RS-XXX-{slug}/`, la misma fila «nada local»
> de la tabla de arriba. Decírselo al usuario al reportar la ruta. Ver
> [`work-integrate/references/archive.md`](../../../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).

**Pregunta de investigación:** «¿*<TC-XXX>* verifica realmente *<AC-XXX>*, y la
implementación lo satisface?». Confirmarla con el usuario antes de investigar.

## Principios rectores

1. **Auditar, no reparar.** Este flujo emite un **veredicto**; corregir el TC es de
   `test-define`, corregir el código es de `work-plan` → `work-implement`.
2. **El requisito manda, no el test.** La vara de medir es el `AC-XXX` o la regla de
   negocio, no lo que el test afirma hoy. Si test y requisito discrepan, el sospechoso
   por defecto es el test.
3. **Un test en verde no prueba nada por sí solo.** Hay que comprobar que **fallaría**
   si el comportamiento se rompiera. Esa pregunta —«¿podría estar pasando aunque
   exista un bug?»— es obligatoria, no opcional.
4. **Comportamiento sobre implementación.** Un test acoplado a detalles internos
   (llamadas concretas, estructura privada, orden de invocación) es frágil aunque
   pase: se señala como hallazgo.
5. **Toda afirmación cita evidencia:** archivo y símbolo del test, del código y del
   criterio.

## Paso 1 — Localizar el test case

1. **Leer el TC** (p. ej. `TC-001-user-login.md`) completo: precondiciones, pasos de
   ejecución, resultado esperado, datos de prueba, estado. Si el TC vive en el gestor
   de proyectos, leerlo por MCP —incluidos los pasos en su campo dedicado— antes de
   preguntar nada.
2. **Identificar qué requisito verifica:** el `AC-XXX` (o la regla de negocio `BR-XX`)
   al que está trazado. Si el TC no declara trazabilidad, buscarla en el artefacto
   padre y **anotar la ausencia de traza como hallazgo**.
3. **Identificar el comportamiento esperado** en una frase, con las palabras del
   requisito, no con las del test. Esa frase es la referencia contra la que se
   comparará todo lo demás.

Si no se puede establecer qué requisito verifica el TC —no hay traza y el artefacto no
lo aclara—, **detenerse** y resolverlo con el usuario: sin requisito no hay vara de
medir.

## Paso 2 — Investigar el contexto necesario

| Fuente | Qué buscar |
|--------|------------|
| **Artefacto padre** (`US`/`WI`/`FT`) | Objetivo, alcance, fuera de alcance, Observaciones |
| **Criterios de aceptación** | Enunciado exacto del `AC-XXX` que el TC dice verificar; sus condiciones y límites |
| **Código relacionado** | El módulo, servicio o componente que implementa ese comportamiento |
| **Tests existentes relacionados** | Otros TCs del mismo artefacto y las pruebas automatizadas del mismo símbolo: solapamientos, contradicciones y huecos entre ellos |
| **Documentación y ADRs** | Decisiones que condicionan el comportamiento esperado (formato, zona horaria, política de reintentos, contrato de API) |
| **Reglas de negocio** (`BR-XX`) | Condiciones que el TC debería respetar aunque el `AC-XXX` no las repita |

Registrar qué se revisó y qué **no** existía: «no hay ADR sobre esto» también es un
hallazgo.

## Paso 3 — Determinar si el test case es correcto

Responder las cinco preguntas, **cada una con evidencia**:

| # | Pregunta | Qué mirar | Si la respuesta es «no» |
|---|----------|-----------|--------------------------|
| 1 | **¿El escenario corresponde realmente al requisito?** | Comparar precondiciones y pasos contra el enunciado del `AC-XXX` | El TC verifica otra cosa: escenario incorrecto |
| 2 | **¿El resultado esperado está correctamente definido?** | ¿Es observable, único y verificable? ¿Coincide con el requisito, no con la salida actual del sistema? | Resultado esperado mal definido o copiado del comportamiento real |
| 3 | **¿Falta algún caso?** | Límites, valor nulo/vacío, error, permisos, concurrencia, variantes del `AC-XXX` no cubiertas por ningún otro TC | TC incompleto |
| 4 | **¿Verifica comportamiento o detalles de implementación?** | Aserciones sobre estructura interna, llamadas a colaboradores, orden de invocación, campos privados | Test acoplado a la implementación |
| 5 | **¿Podría estar pasando aunque exista un bug?** | Aserción ausente o débil; aserción sobre el valor equivocado; mock que devuelve el resultado correcto en vez de ejercitar el código; fixture que nunca alcanza la rama; expectativa congelada (snapshot regenerado); test en *skip*/filtrado/fuera del glob; error tragado (`catch` sin rethrow, promesa sin `await`) | **Falso negativo** — el hallazgo más grave de este flujo |

Un «sí» a la pregunta 5 significa que la suite miente sobre ese escenario. Se registra
con severidad alta y se comprueba si el mismo patrón aparece en tests vecinos.

## Paso 4 — Investigar la implementación

1. **Encontrar el código que debería satisfacer el test:** el punto de entrada y el
   símbolo responsable del comportamiento esperado.
2. **Seguir el flujo** desde ese punto de entrada hasta el efecto observable
   (retorno, persistencia, evento, respuesta HTTP), anotando las bifurcaciones que
   dependen de las precondiciones del TC.
3. **Identificar dependencias:** colaboradores, servicios externos, configuración,
   feature flags, estado compartido, reloj. Marcar cuáles están simuladas en la prueba
   automatizada y cuáles no — ahí suelen esconderse los falsos negativos.
4. **Comparar implementación vs. comportamiento esperado**, condición por condición.
   Cuando discrepen, aislar el punto exacto de la divergencia (archivo y símbolo) y
   decidir cuál de los dos está mal: el código o el requisito.

Si existe la prueba **automatizada** correspondiente al TC, ejecutarla cuando el
entorno lo permita y contrastar el resultado real con lo que el TC afirma. Si no
existe, es un hueco de cobertura y se registra como tal.

## Paso 5 — Concluir (matriz de veredictos)

El análisis termina en **un** veredicto principal (pueden acompañarlo hallazgos
secundarios):

| Veredicto | Cuándo | Handoff |
|-----------|--------|---------|
| **TC correcto · implementación correcta** | El TC verifica el requisito y el código lo cumple | Ninguno. Si el TC no tiene prueba automatizada, `trace-validate` para confirmar la cobertura |
| **TC correcto · implementación incorrecta** | El TC está bien planteado y el código no lo satisface | Flujo **Analizar issue** de este mismo skill: hay un defecto que diagnosticar y corregir con el ciclo 🔴→🟢 |
| **TC incorrecto** | El escenario no corresponde al requisito, o el resultado esperado está mal definido (preguntas 1-2) | `test-define` para corregirlo |
| **TC incompleto** | Cubre el requisito solo en parte; faltan casos (pregunta 3) | `test-define` para ampliarlo o añadir TCs hermanos |
| **TC acoplado a la implementación** | Verifica detalles internos en lugar de comportamiento (pregunta 4) | `test-define` para reformularlo; si el arreglo es de la prueba automatizada, `work-plan` (WI `test-improvement`) |
| **Falso negativo** | El TC pasa pese a existir un defecto (pregunta 5) | **Dos** handoffs: flujo **Analizar issue** para el defecto, y `test-define` (o WI `test-improvement`) para el test que no lo detecta |
| **Requisito ambiguo o mal definido** | La discrepancia nace del `AC-XXX`, no del test ni del código | Flujo **Analizar decisiones pendientes** o `work-define`; no es un bug |
| **Sin cobertura automatizada** | El TC está bien pero nadie lo ejecuta | `trace-validate` para dimensionar el hueco y, después, escribir la prueba |

El `README.md` del RS resume el veredicto en su **Conclusión y recomendación**; el
`analysis.md` guarda el detalle (respuestas a las cinco preguntas, comparación
implementación vs. esperado, evidencia).

## Anti-patrones

- Dar por correcto un TC porque su prueba automatizada está en verde, sin comprobar
  que fallaría si el comportamiento se rompiera.
- Analizar el TC sin haber leído el `AC-XXX` que dice verificar — o inventarle una
  traza que no tiene.
- Corregir el TC o el código desde este flujo: solo se emite el veredicto.
- Confundir «TC incorrecto» con «implementación incorrecta»: hay que decidir cuál de
  los dos discrepa del requisito, y sostenerlo con evidencia.
- Registrar un falso negativo como simple «test incompleto»: la severidad es distinta.
- Omitir los tests vecinos y quedarse solo con el TC de entrada — los solapamientos y
  contradicciones entre TCs son parte del hallazgo.
- Emitir un veredicto sin citar archivo y símbolo del test, del código y del criterio.
