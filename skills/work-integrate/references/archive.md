# Archivado del artefacto de trabajo

Procedimiento **compartido** por `work-integrate` (merge local) y `pr-create` (PR de
implementación): cuando el trabajo ya está cerrado y verificado, su carpeta de
especificación se mueve a `docs/archive/` **dentro de la rama del trabajo**, de
modo que el archivado viaje en el mismo merge/PR que el código.

---

## Cuándo se archiva

**Todas** estas condiciones, sin excepción — y aun cumplidas todas, lo que sigue depende de
[`implementation.archiveMode`](#política-implementationarchivemode):

1. El `progress.md` del trabajo tiene **todas** sus unidades en `Done`.
2. **Todas** las puertas de calidad que aplican al flujo quedaron en `APPROVED`:
   `quality-check`, `code-review` y `trace-validate` (`APPROVED_WITH_NOTES` de
   `trace-validate` cuenta como aprobado), más la **Definition of Done** en `pr-create`
   cuando existe `docs/policies/definition-of-done.md`.
3. El tipo de trabajo es **`US-XXX` o `WI-XXX`** (ver [Qué no se archiva](#qué-no-se-archiva)).
4. **No queda ninguna comprobación previa que pueda abortar el flujo sin integrar.** En
   `work-integrate` eso significa que el **delta** `<base>..HEAD` ya se verificó > 0: si la
   rama ya estaba integrada, el flujo para ahí y no se archiva ni se commitea nada. En
   `pr-create` el equivalente es la comprobación del rango del Paso 3, que ocurre mucho
   antes.

Si alguna falla, **no se archiva**.

- En `work-integrate` esto no llega a ocurrir: el flujo ya se detuvo antes por esa misma razón (el `progress.md` se valida en su paso 4, las puertas en el paso 6, el delta en el paso 7).
- En `pr-create` el `progress.md` **no** se valida en el pre-flight, así que se lee en el propio paso de archivado. Si no está completo en `Done`, se **omite el archivado y se avisa** — el PR se crea igual: las puertas pasaron y no es ese el momento de bloquearlo.

**Orden.** El archivado ocurre **después** de la última puerta y **antes** del commit
final que deja el árbol limpio. No al revés: `trace-validate` escribe el `trace-report.md`
dentro de la carpeta del trabajo, así que mover antes lo dejaría escribiendo en una ruta
que ya no existe, o generando una carpeta huérfana en el origen.

---

## Qué no se archiva

| Caso | Motivo |
|------|--------|
| Ramas `test/` sobre un `FT-XXX` | El feature sigue vivo: la automatización de sus `TC-XXX` cierra una ejecución, no el artefacto. |
| Ramas `test/` sobre un `US-XXX`/`WI-XXX` | El trabajo funcional puede seguir abierto: el flujo solo verificó las unidades `TC-XXX` de esa ejecución, no el `progress.md` completo. Que el skill resuelva un `US-XXX` para `trace-validate` **no** habilita el archivado. |
| PR de **promoción** (`pr-create`) | No trae trabajo nuevo: cada `US`/`WI` que viaja en él ya se archivó al integrarse. |
| Un trabajo cuya carpeta ya está bajo `docs/archive/` | Ya archivado. Se detecta, se informa y se continúa sin tocar nada — no es un error. |

---

## Política (`implementation.archiveMode`)

Cumplidas las condiciones de arriba y descartados los casos de [Qué no se archiva](#qué-no-se-archiva),
lo que sigue depende de `implementation.archiveMode` (ver [`../../../reference/implementation.md`](../../../reference/implementation.md)):

| `archiveMode` | Qué hace el skill |
|----------------|--------------------|
| `ask` (por defecto) | **Pregunta** — ver [Confirmación del usuario](#confirmación-del-usuario-obligatoria-con-ask) — y solo mueve algo si el usuario confirma. |
| `always` | **Archiva directo, sin preguntar.** Ejecuta el procedimiento completo (carpeta del trabajo + investigaciones huérfanas) y lo reporta al cierre, igual que si el usuario hubiera confirmado. |
| `never` | **No archiva ni pregunta.** El paso se salta en silencio — no es una negativa que haya que anotar como «omitido por el usuario», es la política del repo. Se anota igual en el reporte del cierre, con motivo `policy`. |

Las secciones siguientes describen el flujo con `ask`; con `always` se salta la pregunta y se
va directo al procedimiento, y con `never` se salta el paso entero.

## Confirmación del usuario (obligatoria con `ask`)

**Con `archiveMode: ask` el archivado nunca es automático.** El skill **pregunta**, y solo mueve
algo si el usuario lo confirma. Archivar reorganiza el árbol de especificaciones del repo y
cambia la ruta de un artefacto que otras cosas referencian: por defecto es una decisión del
usuario, no una consecuencia mecánica de que las puertas hayan pasado.

> **Solo se pregunta cuando el archivado aplica.** En una rama `test/`, en un PR de
> promoción o con el trabajo ya archivado no hay nada que ofrecer: el paso se salta sin
> molestar al usuario. Preguntar por algo que no se iba a hacer es tan defectuoso como
> archivar sin preguntar.

**Cómo se pregunta.** Con la herramienta de preguntas estructuradas del cliente —el mismo
mecanismo que el resto del flujo; `work-integrate` lo define en su sección *Cómo preguntar
al usuario* y `pr-create` usa el equivalente de su cliente—, **mostrando antes qué se
movería exactamente**: la carpeta y, si las hay, las investigaciones sueltas que quedaron
huérfanas. El usuario no puede decidir sobre un movimiento que no ve.

`
Las puertas pasaron y US-042 está en Done. ¿Archivo el artefacto antes de integrar?

  docs/specs/user-stories/US-042-exportacion-csv/
  → docs/archive/user-stories/US-042-exportacion-csv/

  Investigaciones sueltas sin referencias activas:
    RS-003-formatos-csv → docs/archive/research/
`

La respuesta es **binaria**: se archiva todo lo mostrado, o no se archiva nada. Las
investigaciones huérfanas no se ofrecen por separado — van dentro de lo que el usuario ve
antes de decidir, y por eso se listan en la pregunta.

| Respuesta | Efecto |
|-----------|--------|
| **Sí, archivar** | Se ejecuta el procedimiento completo: carpeta del trabajo + investigaciones huérfanas listadas. |
| **No archivar** | No se mueve nada. **El flujo continúa con normalidad** — merge o PR siguen adelante. |

**Negarse no bloquea nada.** El archivado es una consecuencia deseable del cierre, no una
condición suya: un «no» se anota en el reporte y el trabajo se integra igual. Nunca
re-preguntar en la misma ejecución ni insistir tras una negativa.

**Sin canal de respuesta** (sesión desatendida o programada, o cualquier entorno donde no
se pueda preguntar): **no archivar** y decirlo en el reporte. Ante la ausencia de respuesta
se toma la opción que no mueve nada — un archivado no deseado obliga a deshacer un `git mv`
ya integrado, mientras que uno pendiente se resuelve corriendo el skill de nuevo.

Confirmado el archivado, el resto del procedimiento **sí** es automático: no se vuelve a
preguntar por cada investigación ni por cada enlace a reparar. Y en cualquier caso se
**reporta** el desenlace al final.

### Consecuencia: estar en la ruta activa ya no significa «abierto»

Al ser opcional, un trabajo **cerrado e integrado** puede quedarse indefinidamente en
`docs/specs/user-stories/` o `docs/specs/work-items/` porque nadie confirmó archivarlo. De
ahí una asimetría que conviene tener presente al leer la [Regla 1](#regla-1--fallback-de-lectura):

- Encontrar la carpeta **bajo `docs/archive/`** sigue siendo prueba suficiente de que
  el trabajo está cerrado. Esa dirección no cambia.
- **No** encontrarla ahí ya **no** prueba lo contrario. Un `US-XXX` en la ruta activa puede
  estar abierto o cerrado-sin-archivar; quien necesite saberlo mira su `progress.md` y su
  historial, no su ubicación.

Ningún skill debe inferir «este trabajo sigue abierto» solo de que su carpeta esté en la
ruta activa. Las guardas que paran ante un artefacto archivado siguen siendo correctas —
simplemente no cubren el caso del trabajo cerrado que no se archivó, y eso es aceptable: el
coste de no pararse ahí es bajo comparado con obligar a archivar.

---

## Destinos

`docs/archive/` es el valor por defecto de `specification.archivePath`
(`.sdd-devkit/settings.json`) — ver [`../../../reference/artifacts.md`](../../../reference/artifacts.md).
**Resolverlo primero**: si el repo declaró un valor distinto, sustituirlo por ese valor en la
columna Destino y en el resto de esta sección.

| Artefacto | Origen | Destino |
|-----------|--------|---------|
| Historia de usuario | `docs/specs/user-stories/US-XXX-{nombre-corto}/` | `docs/archive/user-stories/US-XXX-{nombre-corto}/` |
| Tarea de mantenimiento | `docs/specs/work-items/WI-XXX-{kebab-case}/` | `docs/archive/work-items/WI-XXX-{kebab-case}/` |
| Investigación suelta enlazada | `docs/specs/research/RS-XXX-{slug}/` | `docs/archive/research/RS-XXX-{slug}/` |

La carpeta se mueve **completa y tal cual**: `README.md`, los `TK-XXX-*.md`, `progress.md`,
`trace-report.md`, `test-cases/` y el `research/` **interno** del artefacto. No se
renombra, no se aplana, no se comprime, no se borra nada de dentro.

> Las investigaciones que viven **dentro** del artefacto
> (`docs/specs/user-stories/US-XXX-.../research/RS-XXX-{slug}/`) viajan con la carpeta:
> no requieren tratamiento aparte. La sección siguiente es **solo** para los `RS-XXX`
> sueltos de `docs/specs/research/`.

---

## Procedimiento

### 1 — Mover la carpeta del trabajo

Con `<archive>` = `specification.archivePath` resuelto (por defecto `docs/archive/`):

`bash
mkdir -p <archive>/<user-stories|work-items>
test ! -e "<archive>/<subcarpeta>/<ID>-<slug>" \
  || { echo "el destino ya existe"; exit 1; }
git mv "docs/specs/<subcarpeta>/<ID>-<slug>" "<archive>/<subcarpeta>/<ID>-<slug>"
`

- **`git mv`, no `mv`**: deja el renombrado ya stageado y git lo detecta como *rename*,
  preservando el historial del archivo. Un `mv` a secas aparecería como borrado + alta.
- **El guard del destino no es adorno.** Si ya existe una carpeta con ese identificador en
  el archivo, `git mv` la sobrescribiría o fallaría a medias. Parar e informar: es señal
  de un identificador duplicado o de un archivado previo incompleto, y ninguna de las dos
  se resuelve pisando archivos.
- Si el origen no existe pero **sí** el destino → ya estaba archivado: informar y seguir.

### 2 — Archivar las investigaciones sueltas que quedan huérfanas

Un `RS-XXX` de `docs/specs/research/` es **compartible**: puede estar enlazado desde varios
artefactos. Solo se archiva el que se queda sin ningún artefacto **activo** que lo
referencie.

1. **Recolectar candidatos:** buscar identificadores `RS-XXX` en los archivos del trabajo
   —ya en su ruta de archive— y quedarse con los que resuelven a una carpeta existente en
   `docs/specs/research/`.
2. **Para cada candidato, contar referencias vivas:** buscar ese `RS-XXX` en `docs/specs/`
   **excluyendo** `<archive>` y `docs/specs/research/<el propio RS>/`.
3. **Decidir:**
   - **0 referencias vivas** → huérfano: `git mv` a `<archive>/research/RS-XXX-{slug}/`,
     con el mismo guard de destino del paso 1.
   - **≥ 1 referencia viva** → se queda donde está. Listarlo en el reporte con quién lo
     referencia; no es un problema que haya que resolver.

> **Ante la duda, no archivar.** Dejar un `RS` activo de más es inocuo; archivar uno que
> otro trabajo abierto todavía enlaza rompe ese enlace en su rama. Si la referencia es
> ambigua (texto libre que menciona el identificador sin enlazarlo), cuenta como viva.

### 3 — Reparar los enlaces afectados

El movimiento cambia la profundidad de la ruta en un nivel, así que los enlaces relativos
se rompen en las dos direcciones. Revisar y corregir:

- **Salientes** — enlaces **dentro** de la carpeta movida que apuntan **fuera** de ella
  (p. ej. `../../research/RS-001-...`, `../../../docs/policies/...`): añadir el nivel que
  falta. Los enlaces internos a la propia carpeta no cambian.
- **Entrantes** — referencias desde artefactos que **siguen activos** hacia el trabajo
  recién archivado: repuntarlas a `docs/archive/...`. Si un artefacto activo depende
  de forma sustantiva del archivado, mencionarlo en el reporte; no es motivo para revertir
  el archivado.

Si el repo usa enlaces absolutos desde la raíz (`docs/specs/...`), aplica lo mismo:
actualizar el prefijo.

### 4 — Dejar el árbol limpio

El `git mv` deja el renombrado **stageado pero sin commitear**. No commitear por cuenta
propia: el paso de re-comprobación del working tree que ya tiene cada flujo detecta la
salida de `git status --porcelain` e **invoca `git-commit`**, que agrupa el archivado como
el cambio lógico que es (junto con los artefactos de las puertas, o aparte, según decida).

Si `git-commit` no está disponible o se detiene sin dejar el árbol limpio, aplica el mismo
criterio que el resto del flujo: parar e informar. **No** ejecutar `git add`/`git commit`
directos como sustituto, ni revertir el `git mv`.

---

## Reporte al usuario

Al cerrar el flujo, incluir:

`
📦 Archivado
   docs/specs/user-stories/US-042-exportacion-csv/
   → docs/archive/user-stories/US-042-exportacion-csv/
   Investigaciones sueltas:
     RS-003-formatos-csv → archivada (sin referencias activas)
     RS-007-limites-export → se queda (referenciada por US-051)
`

Si no hubo investigaciones sueltas, omitir ese bloque en vez de escribir «ninguna».

Si no se archivó — el usuario no confirmó (`ask`), o la política es `never` —, el bloque dice
qué no se hizo y por qué, sin dramatizarlo:

`
📦 Archivado: omitido
   US-042 se queda en docs/specs/user-stories/ (no confirmado por el usuario).
`

`
📦 Archivado: omitido
   US-042 se queda en docs/specs/user-stories/ (implementation.archiveMode: never).
`

Y si no se pudo preguntar: «omitido — sin canal de respuesta para confirmar».

---

## Contrato para el resto del catálogo

Archivar mueve carpetas que **otros skills resuelven por ruta**. Esta sección es la fuente
única de las dos reglas que todos ellos aplican; cada skill la enuncia en su propio flujo,
y aquí vive el porqué. Las dos son independientes y ninguna sustituye a la otra.

> **`docs/archive/` en las dos reglas siguientes es el default de `specification.archivePath`**
> (ver [Destinos](#destinos)). Todo skill que aplique la Regla 1 o la Regla 2 resuelve primero
> `specification.archivePath` y sustituye ese valor por `docs/archive/` si el repo declaró
> uno distinto — no vuelve a preguntarlo ni a asumir el literal.

### Regla 1 — Fallback de lectura

**Quien busque la carpeta de un `US-XXX`, `WI-XXX` o `RS-XXX` y no la encuentre en la ruta
activa, debe mirar en `docs/archive/` antes de darla por inexistente.**

`
docs/specs/user-stories/US-042-…/   →  docs/archive/user-stories/US-042-…/
docs/specs/work-items/WI-007-…/     →  docs/archive/work-items/WI-007-…/
docs/specs/research/RS-003-…/       →  docs/archive/research/RS-003-…/
`

Lo que se encuentra ahí es un trabajo **cerrado**. **Leerlo es siempre legítimo**: sirve
como consulta, contexto e historial, y un flujo que solo necesita mirarlo —para entender el
comportamiento esperado, citar un criterio o comparar alcances— continúa con normalidad.

Lo que no es legítimo es **escribir dentro**. Un skill que iba a añadir un `TK-XXX`, un
`TC-XXX`, editar el `README.md` o regenerar el `progress.md` **para y avisa** en vez de
escribir: «`US-042` está archivado; para retomarlo hay que desarchivarlo primero.»
Desarchivar es mover la carpeta de vuelta — decisión del usuario, no de ningún skill.

> **Nunca crear la carpeta en la ruta activa porque «no estaba».** Es el fallo más caro de
> todos: deja dos carpetas con el mismo identificador, la nueva vacía o a medias, y el
> guard de destino del [paso 1](#1--mover-la-carpeta-del-trabajo) lo descubre semanas
> después, bloqueando un merge por un error cometido mucho antes.

#### Las dos únicas excepciones a la prohibición de escribir

No hay más; cualquier otra escritura dentro de `docs/archive/` es un defecto.

| Quién | Qué puede escribir | Por qué |
|-------|--------------------|---------|
| **`trace-validate`** | Su `trace-report.md`, dentro de la carpeta del artefacto | Es un **derivado** del artefacto, no trabajo nuevo, y revalidar la cobertura de un trabajo ya integrado tiene que seguir siendo posible. Se guarda junto a lo que traza o deja de tener sentido. |
| **`work-implement` en [modo corrección](../../work-implement/SKILL.md#modo-correccion-delegado-desde-quality-check)** | **Nada dentro de la carpeta.** Continúa el flujo en vez de parar, pero la nota de retrabajo va al informe de `quality-check` | La corrección delegada llega **en la fase de cierre**, con el archivado ya commiteado: encontrarse el artefacto archivado es lo normal, no un error. Parar ahí bloquearía el cierre que la corrección venía a desbloquear. |

La segunda no es en rigor una excepción a *escribir* —sigue sin escribir— sino a **parar**.
Se enuncia aquí porque es donde se busca.

> **Ojo con el efecto sobre `trace-validate`.** Su `SPEC_FINGERPRINT` se calcula sobre la
> carpeta del artefacto, y el `git mv` del archivado **cambia las rutas** que entran en ese
> hash. El `trace-report.md` previo queda marcado como no fresco y se regenera **una vez**
> tras archivar; a partir de ahí la clave vuelve a ser estable en la nueva ruta. Es un coste
> conocido y acotado, no una corrupción.

### Regla 2 — Los IDs archivados siguen ocupados

**Todo escaneo de «siguiente número libre» o «este ID está disponible» cubre la ruta activa
y `docs/archive/`.** Un identificador no se libera al archivarse: `US-042` sigue
siendo `US-042` para siempre.

Sin esto, el contador **retrocede** en cuanto se archiva el trabajo con el número más alto:
el siguiente `work-define` reemite `US-042`, y a partir de ahí hay dos artefactos distintos
con el mismo ID —uno en el archivo, otro activo— y todo lo que los referencia (commits,
ramas, work items del gestor, `trace-report.md`) queda ambiguo.

Aplica a **todos** los contadores, no solo a los globales:

| Contador | Dónde se escanea | Skill |
|----------|------------------|-------|
| `US-XXX` | `docs/specs/user-stories/` **+** `docs/archive/user-stories/` | `work-define` |
| `WI-XXX` | `docs/specs/work-items/` **+** `docs/archive/work-items/` | `work-plan` |
| `RS-XXX` | `docs/specs/research/` **+** `docs/archive/research/`, y el `research/` del artefacto | `work-research` |
| `TK-XXX` | El `US-XXX-…/` del padre | `work-plan` |
| `TC-XXX` | El `test-cases/` del padre | `test-define` |

`TK` y `TC` son **por artefacto padre**, así que su riesgo no es reemitir un número, y
tampoco se resuelve escaneando el archivo: si el padre está archivado, la **Regla 1 ya
obligó a parar** y no hay nada que numerar. El fallo que hay que evitar es el contrario —
dar por vacía una ruta activa sin haber comprobado el archivo, **restablecer la numeración
en `001`** y crear una carpeta fantasma. Las dos reglas van juntas justamente por esto.

---

## Anti-patrones

- Archivar **antes** de que pasen las puertas, o antes de que `trace-validate` escriba su
  `trace-report.md` dentro de la carpeta.
- **Archivar sin preguntar con `archiveMode: ask`**, o dar la confirmación por supuesta porque
  las puertas pasaron.
- **Preguntar igual con `archiveMode: always` o `never`.** La política ya resolvió la
  pregunta; volver a hacerla la ignora.
- Insistir tras una negativa, o volver a preguntar en la misma ejecución.
- **Tratar un «no archivar» como un bloqueo**: el merge o el PR siguen adelante igual.
- Preguntar **sin mostrar antes** qué carpeta y qué investigaciones se moverían.
- Archivar por defecto cuando no hay quien responda: sin respuesta, no se mueve nada.
- Usar `mv` en vez de `git mv`, perdiendo la detección de *rename*.
- Sobrescribir un destino existente en `docs/archive/` en lugar de parar.
- Archivar un `RS-XXX` suelto sin comprobar que ningún artefacto activo lo referencia.
- Archivar en una rama `test/`, o en un PR de promoción.
- Mover la carpeta **después** del merge o del push: el archivado debe viajar en el mismo
  commit range que el código, no quedarse en la rama base como un cambio suelto.
- Commitear el `git mv` por cuenta propia en vez de dejar que lo recoja `git-commit`.
- Borrar, aplanar o comprimir el contenido de la carpeta al archivarla.
