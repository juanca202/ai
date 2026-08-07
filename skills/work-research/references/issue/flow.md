# Flujo · Analizar issue (reproducción → diagnóstico de pruebas → remediación)

Procedimiento del flujo **Analizar issue** de `work-research`: a partir de la **descripción de un
bug** (texto del usuario o un work item del gestor de proyectos), reconstruye **cómo
reproducirlo**, localiza la **causa raíz**, diagnostica **en qué situación está la
suite de pruebas** frente a ese escenario y propone la remediación como un ciclo
**rojo → verde**. La ejecución de esa remediación **no ocurre aquí**: se hace
*handoff* a `work-plan` (que crea un `WI` de tipo `bug-fix`) y luego a
`work-implement`.

```text
Descripción del bug  ─ o ─  Código del bug en el gestor de proyectos (MCP)
    │
    ▼
Normalizar el reporte           ┐
    │                           │
    ▼                           │
Reproducir (o definir cómo)     │  Paso 1 — Reproducción
    │                           │
    ▼                           │
Aislar la causa raíz            ┘
    │
    ▼
Inventariar las pruebas del escenario  ┐
    │                                  │  Paso 2 — Diagnóstico de pruebas
    ▼                                  │  (matriz de 3 situaciones)
Clasificar: crear / ampliar / corregir ┘
    │
    ▼
Proponer la remediación         ┐
    │                           │  Paso 3 — Remediación (propuesta)
    ▼                           │
🔴 TEST FAIL                    │
    │                           │
    ▼                           │
Corregir código                 │
    │                           │
    ▼                           │
🟢 TEST PASS                    ┘
    │
    ▼
Handoff → work-plan (WI tipo bug-fix) → work-implement
```

**Entregable:** un `WI` de tipo `bug-fix` en
`docs/specs/work-items/WI-XXX-{kebab-case}/README.md`, creado por `work-plan` a partir
del **dossier de bug** que produce este flujo con
[`assets/issue/diagnosis-template.md`](../../assets/issue/diagnosis-template.md).

**Pregunta de investigación:** «¿Por qué ocurre *<comportamiento observado>* y qué
prueba lo demuestra?». Antes de confirmarla hay que tener el **reporte normalizado**
mínimo (observado, esperado y disparador) — ver Paso 0.

> **Qué produce este flujo (y qué no).** Produce un **dossier de bug** —reproducción,
> causa raíz, diagnóstico de pruebas y plan rojo→verde— redactado con
> [`assets/issue/diagnosis-template.md`](../../assets/issue/diagnosis-template.md).
> **No escribe código de aplicación ni de pruebas, y no ejecuta el fix.** El dossier
> es el insumo del *handoff* a `work-plan`, que lo materializa como un `WI` de tipo
> `bug-fix` con su plan de implementación.

> **Excepción de salida: este flujo no crea un `RS-XXX`.** A diferencia del resto de
> flujos, aquí el artefacto entregable es el **`WI`**: el detalle del bug, el diagnóstico
> y la remediación viven en el `WI-XXX-{kebab-case}/README.md` que crea `work-plan`.
> Guardar además un RS solo si el usuario lo pide explícitamente (p. ej. la
> investigación produjo hallazgos reutilizables más allá de este bug); en ese caso se
> guarda en `docs/specs/research/RS-XXX-{slug}/` y el WI lo referencia.

## Principios rectores (no negociables)

1. **Sin reproducción no hay diagnóstico.** Si no se puede reproducir el bug ni
   definir un procedimiento determinista de reproducción, el flujo **no avanza** al
   Paso 2: se declara `No reproducible` y se pide al usuario lo que falta (datos,
   entorno, logs, versión, pasos exactos).
2. **La prueba primero, siempre.** La remediación se propone como ciclo rojo→verde:
   una prueba que **falla** demostrando el bug **antes** de tocar el código de
   producción. Un fix sin prueba que lo demuestre no es una remediación válida.
3. **Toda afirmación cita evidencia.** Causa raíz, prueba existente, condición no
   cubierta: cada una referencia **archivo y símbolo** (función/clase/endpoint/test).
   Sin evidencia es una hipótesis: se marca `⚠️ Hipótesis` y se verifica o descarta.
4. **Un bug, un diagnóstico.** Si la investigación revela que el reporte contiene
   varios bugs independientes, se separan y se propone un WI por cada uno. No
   mezclar causas raíz distintas en un mismo ciclo rojo→verde.
5. **No arreglar el síntoma.** La corrección propuesta ataca la causa raíz
   localizada, no la manifestación. Si solo cabe un paliativo, decirlo explícitamente
   y registrarlo como deuda.

---

## Paso 0 — Obtener el reporte del bug

La entrada puede venir de dos sitios:

| Entrada | Qué hacer |
|---------|-----------|
| **Descripción en prosa** del usuario | Normalizarla al formato de reporte (abajo). Lo que falte, preguntarlo. |
| **Código/ID de un bug** del gestor de proyectos (p. ej. `#4821`, `BUG-4821`) | Resolver la vinculación siguiendo «Entrada desde el gestor de proyectos» de `SKILL.md` y **leer el work item vía MCP** (título, descripción, pasos de reproducción, severidad, entorno, adjuntos, comentarios). Ver [`references/azure-devops.md`](../azure-devops.md) para Azure DevOps. |

**Reporte normalizado** — mínimo para continuar:

| Campo | Obligatorio | Si falta |
|-------|-------------|----------|
| Comportamiento observado | Sí | Preguntar; sin esto no hay bug que investigar |
| Comportamiento esperado | Sí | Preguntar; si el usuario no lo sabe, derivarlo de los `AC-XXX` / reglas de negocio del artefacto relacionado y confirmarlo |
| Pasos / entrada que lo dispara | Sí | Preguntar; si no hay pasos, buscar la traza (logs, stack trace, request) |
| Entorno y versión | Deseable | Registrar como `Desconocido` y marcar el riesgo de no poder reproducir |
| Frecuencia (siempre / intermitente) | Deseable | Preguntar; un bug intermitente cambia la estrategia de prueba (ver Paso 2) |
| Severidad / impacto | Deseable | Inferir del comportamiento y confirmar |
| Artefacto relacionado (`US`/`WI`/`FT`) | No | Si existe, cargarlo: sus `AC-XXX` y `TC-XXX` son la referencia de «esperado» |

Con el reporte normalizado, **confirmar la pregunta de investigación** con el usuario
antes de continuar (Paso 1 de `SKILL.md`): «¿Por qué ocurre *<comportamiento
observado>* y qué prueba lo demuestra?».

---

## Paso 1 — Reproducción y causa raíz

1. **Delimitar la superficie.** Localizar en el repo el punto de entrada implicado
   (endpoint, comando, handler, componente) y el camino hasta el efecto observado.
2. **Definir la reproducción determinista.** Escribir el procedimiento mínimo que
   dispara el bug: precondiciones (estado, datos, configuración, feature flags),
   entrada exacta, resultado observado vs. esperado. Debe ser **repetible**: si
   depende de azar, concurrencia, reloj o datos de producción, identificar esa
   dependencia y cómo se controlaría en una prueba (fijar semilla, reloj falso,
   fixture).
3. **Verificar la reproducción** cuando el entorno lo permita (ejecutar el caso,
   depurar, leer logs/trazas). Si no es posible ejecutarla, marcar la reproducción
   como `Definida, no verificada` y decirlo explícitamente.
4. **Aislar la causa raíz.** Reducir al punto exacto del código donde el
   comportamiento diverge de lo esperado; citar archivo y símbolo. Distinguir:
   - **Defecto de lógica** (condición, cálculo, orden de operaciones)
   - **Contrato roto** (tipo, nulo, formato, encoding, zona horaria)
   - **Estado/concurrencia** (carrera, caché sucia, transacción)
   - **Integración** (dependencia externa, versión, configuración)
   - **Requisito mal especificado** (el código hace lo especificado; lo especificado
     está mal) → esto **no** es un bug de código: hacer *handoff* a `work-define` en
     lugar de proponer un fix.
5. **Determinar la regresión.** Si se puede, identificar desde cuándo existe
   (`git log`/`git blame` del símbolo implicado). Un bug de regresión suele indicar
   que la situación de pruebas es el caso 2 o 3 de la matriz.

**Compuerta:** sin causa raíz localizada con evidencia, no se propone remediación.
Se entrega el diagnóstico parcial y se acuerda con el usuario cómo seguir.

---

## Paso 2 — Diagnóstico de pruebas (la matriz)

Buscar en la suite **todas** las pruebas que cubren —o deberían cubrir— el escenario
del bug: por símbolo implicado, por ruta de archivo espejo (`src/x` → `tests/x`), por
nombre del caso de uso y por los `TC-XXX` del artefacto relacionado si lo hay.

Clasificar el escenario en **una** de estas tres situaciones:

| # | Situación | Cómo se reconoce | Acción |
|---|-----------|------------------|--------|
| **1** | **No existe test para el escenario** | Ninguna prueba ejercita la ruta/condición del bug | **Crear test** |
| **2** | **Existe test pero no cubre la condición que produce el bug** | Hay prueba del mismo símbolo o caso de uso, pero con otras entradas, otro estado o sin la variante que falla | **Ampliar/modificar test** |
| **3** | **Existe test que debería detectar el bug pero pasa incorrectamente** | La prueba cubre el escenario y aun así está en verde | **Corregir el test** |

**Cómo confirmar el caso 3** (el más delicado — una prueba en verde sobre código roto
es un falso negativo). Revisar, en este orden:

- **Aserción ausente o débil** — no se afirma nada sobre el resultado relevante, o se
  afirma algo trivialmente cierto (`toBeDefined`, comparar contra el propio resultado).
- **Aserción sobre el valor equivocado** — se verifica un campo que no cambia.
- **Mock que oculta el defecto** — el doble de prueba devuelve el resultado correcto
  en lugar de ejercitar la unidad que falla, o el mock no refleja el contrato real.
- **Fixture que evita la condición** — los datos de prueba nunca alcanzan la rama
  defectuosa (valor nulo, límite, colección vacía, zona horaria).
- **Expectativa congelada sobre el comportamiento erróneo** — la prueba fue escrita
  contra el bug (snapshot regenerado, «valor esperado» copiado de la salida real).
- **Prueba que no se ejecuta** — está marcada como *skip*/*only*, filtrada por tag,
  fuera del glob de la suite o en un proyecto que el CI no corre.
- **Error tragado** — `try/catch` sin rethrow, aserción dentro de un callback que no
  se invoca, promesa sin `await`.

> Un caso 3 confirmado es un **hallazgo aparte y de mayor severidad** que el propio
> bug: significa que la suite miente. Registrarlo como tal en el dossier y, si el
> mismo patrón aparece en otras pruebas, señalarlo (candidato a `WI` de tipo
> `test-improvement`, no lo arregla este flujo).

**Situaciones combinadas.** Si el escenario toca varios niveles (p. ej. no hay prueba
unitaria —caso 1— y además la de integración pasa incorrectamente —caso 3—),
registrar **una fila por nivel de prueba** con su propia acción. La matriz se aplica
por nivel (unitaria, integración, e2e, contrato), no una sola vez.

**Elegir el nivel de la prueba que demostrará el bug.** Preferir el nivel **más bajo**
que reproduzca el defecto de forma determinista; subir de nivel solo si el bug no se
manifiesta ahí (p. ej. es de integración o de contrato). Para bugs intermitentes,
hacer la prueba determinista controlando la fuente de no-determinismo (reloj, semilla,
orden de concurrencia); si no se puede, decirlo y proponer la alternativa (prueba de
estrés/propiedad) marcando su limitación.

---

## Paso 3 — Proponer la remediación (ciclo rojo → verde)

La propuesta se estructura **siempre** en este orden. Es el plan de implementación
que heredará el `WI`:

```text
🔴 TEST FAIL
   Crear / ampliar / corregir la prueba según la matriz del Paso 2,
   de modo que falle demostrando el bug con el código actual.
   Verificar que falla por la razón correcta (mensaje esperado vs. obtenido),
   no por un error de compilación o de setup.
        │
        ▼
   Corregir código
   Cambio mínimo sobre la causa raíz localizada en el Paso 1.
   Sin refactor oportunista: lo demás va a un WI aparte.
        │
        ▼
🟢 TEST PASS
   La prueba nueva/ajustada pasa Y el resto de la suite sigue en verde.
   Sin regresiones.
```

Para cada paso del ciclo, el dossier debe dejar concretado:

| Paso | Qué especificar |
|------|-----------------|
| 🔴 **TEST FAIL** | Archivo de prueba (existente o nuevo), nivel, nombre del caso, entrada/fixture, aserción que debe fallar, **mensaje de fallo esperado**. Si es caso 2 o 3, qué se amplía o corrige exactamente y por qué la prueba actual no detectaba el bug. |
| **Corregir código** | Archivo y símbolo a modificar, naturaleza del cambio, alternativas descartadas, efectos colaterales previstos, migración de datos o cambio de contrato si aplica. |
| 🟢 **TEST PASS** | Criterio de cierre: la prueba pasa, la suite completa pasa, y —si el caso 3 aplicó— la prueba corregida **también falla** si se revierte el fix (verificación anti-falso-negativo). |

Añadir además:

- **Criterios de aceptación** del WI, derivados del comportamiento esperado
  (verificables, uno por condición corregida).
- **Riesgos y alcance de la regresión**: qué más usa el símbolo corregido.
- **Cobertura pendiente**: escenarios vecinos sin prueba que el diagnóstico reveló
  pero que quedan **fuera** de este WI (candidatos a `test-improvement`).

---

## Paso 4 — Presentar y hacer *handoff*

1. Redactar el dossier con
   [`assets/issue/diagnosis-template.md`](../../assets/issue/diagnosis-template.md) y
   presentarlo en el chat con un resumen de 2-3 oraciones (causa raíz + situación de
   pruebas + qué se propone).
2. Preguntar con la herramienta estructurada: «¿El diagnóstico es correcto?»
   Opciones: `[Sí, crear el WI de corrección]` / `[Profundizar]` / `[Descartar]`.
3. **Sí** → *handoff* a `work-plan` (tipo de plan: tarea de mantenimiento,
   `Tipo: bug-fix`) pasando el dossier completo. El mapeo a las secciones del WI:

| Sección del dossier | Sección del `WI-XXX/README.md` |
|---------------------|-------------------------------|
| Reporte normalizado + comportamiento observado/esperado | **Descripción** (el requerimiento del WI) |
| Reproducción, causa raíz, evidencia, regresión | **Contexto** |
| Diagnóstico de pruebas (matriz) | **Contexto** (subsección «Situación de las pruebas») |
| Comportamiento esperado por condición (`AC-XXX` propuestos) | **Criterios de aceptación** |
| Reglas de negocio confirmadas durante el análisis | **Reglas de negocio** |
| Archivo/símbolo de la corrección y de la prueba | **Archivos afectados** |
| Dependencias del fix (servicio, versión, migración de datos) | **Dependencias** |
| Ciclo 🔴 → fix → 🟢 | **Plan de implementación** (un `IT-XX` por paso, en ese orden) |
| Cobertura pendiente / refactors detectados | **Fuera de alcance** |
| Riesgos, hipótesis sin verificar, decisiones abiertas | **Observaciones** |
| Work item del bug, artefacto relacionado, archivos citados | **Referencias** |

> **El formato de los `AC-XXX` lo impone `work-plan`, no el dossier.** El dossier los
> propone en forma «Dado / cuando / entonces»; la plantilla del WI exige categoría y
> palabra clave RFC 2119 en mayúsculas. `work-plan` los **reescribe** a su formato y
> anota la trazabilidad `BR-XX → verificado por AC-XXX` que su checklist exige. No dar
> por copiables los criterios tal como salen del dossier.

4. Con el WI en `Ready`, el *handoff* siguiente es `work-implement`, que ejecuta el
   ciclo en el orden del plan: **la prueba en rojo primero**.

> **El flujo «Analizar issue» no genera `TC-XXX`.** La prueba que demuestra el bug queda especificada
> en el paso 🔴 del plan de implementación (`IT-XX`) y la escribe `work-implement`; no
> se delega a `test-define`. Solo tiene sentido invocar `test-define` sobre el WI si el
> usuario quiere documentar casos de prueba formales del escenario más allá del fix —
> es una decisión suya, no un paso del flujo.
>
> **Cuándo usar `trace-validate` en vez de un WI `test-improvement`:** si el
> diagnóstico revela que el falso negativo (caso 3) o el hueco de cobertura afecta a
> **un artefacto con `AC-XXX`/`TC-XXX` documentados**, `trace-validate` es la vía —
> comprueba sistemáticamente qué criterios carecen de prueba real. Si el hueco está en
> código sin artefacto documentado, va como WI de tipo `test-improvement`.

> **Si el repo tiene gestor de proyectos vinculado y el bug ya existe allí:** no crear un work item
> duplicado. Al hacer el *handoff*, pasar el identificador y la URL del bug para que
> `work-plan` reutilice ese ID (y su referencia en el encabezado del WI) en lugar de
> crear uno nuevo. Detalle en [`references/azure-devops.md`](../azure-devops.md).

---

## Cuándo **no** aplica este flujo

| Situación | Flujo correcto |
|-----------|----------------|
| El código hace lo especificado y lo especificado está mal | `work-define` (corregir la US/criterios), no un bug-fix |
| No hay reporte de un comportamiento defectuoso, sino código sin documentar ni probar | Flujo **Analizar legado** |
| El «bug» es una carencia funcional (falta una capacidad) | `work-define` (nueva US) o `work-plan` (WI de otro tipo) |
| Solo se quiere mejorar la suite sin un defecto detrás | `work-plan`, WI de tipo `test-improvement` |
| Incidente en producción que requiere mitigación inmediata | `engineering:incident-response`; este flujo entra después, para el fix definitivo |

> **Ruta inversa (legado → issue).** Si el flujo **Analizar legado** detecta que un
> comportamiento del código es en realidad un bug —en vez de congelarlo como criterio
> de aceptación—, ofrecer al usuario abrir ese defecto con este flujo: el `FT`
> documenta lo que el código hace hoy; el diagnóstico propone corregirlo.

---

## Anti-patrones

- Proponer el fix **antes** de tener una prueba que demuestre el bug (saltarse el 🔴).
- Declarar la situación de pruebas sin haber buscado las pruebas existentes del
  símbolo y del caso de uso — asumir el caso 1 por no haber mirado.
- Clasificar como caso 2 lo que es un caso 3: si la prueba **sí** cubre el escenario y
  está en verde, el hallazgo es un falso negativo de la suite y debe registrarse como tal.
- Corregir la prueba (caso 3) ajustando el valor esperado a la salida actual del
  código roto — eso congela el bug, no lo detecta.
- Escribir la prueba de forma que pase desde el principio: si no falla con el código
  actual, no demuestra el bug.
- Mezclar el fix con refactors, renombrados o mejoras de estilo en el mismo cambio.
- Cerrar en 🟢 verificando solo la prueba nueva sin correr el resto de la suite.
- Crear un `RS-XXX` para el bug en lugar del `WI`: el entregable de este flujo es el WI.
- Crear el WI directamente desde este skill en vez de hacer *handoff* a `work-plan`.
- Escribir código de prueba o de producción dentro de este flujo — `work-research`
  investiga; `work-implement` implementa.
- Duplicar en el gestor de proyectos un bug que ya existe allí, en lugar de reutilizar su ID.
- Dar por reproducido un bug intermitente sin identificar la fuente de
  no-determinismo ni cómo se controlará en la prueba.
