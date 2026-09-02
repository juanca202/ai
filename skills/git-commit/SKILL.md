---
name: git-commit
description: >
  Preparar y ejecutar git commit con mensajes Conventional Commits inferidos del diff (tipo, scope, descripción, staging). El push es opcional y lo gobierna `.sdd-devkit/settings.json` (`git.push`: ask/always/never; nunca por defecto), y solo aplica en invocación directa del usuario, no cuando lo invocan otros skills. No mergea, no toca la configuración global de git ni aplica operaciones destructivas. Activar cuando el usuario pida hacer commit, generar el mensaje, separar cambios en varios commits, o use invocaciones tipo `/commit`; también lo invocan automáticamente work-integrate y pr-create ante un working tree sucio.
license: MIT
---

# Git Commit con Conventional Commits

Preparar y ejecutar commits estandarizados según [Conventional Commits](https://www.conventionalcommits.org), inferidos del diff real del repositorio.

**Alcance:** cada commit captura un único cambio lógico con mensaje semántico; una invocación puede producir varios (ver [Selección de flujo](#selección-de-flujo)). El push es opcional (ver [Política de commit y push](#política-de-commit-y-push)) y nunca ocurre en invocación delegada. No toca la configuración global de git ni aplica operaciones destructivas. Preguntar lo que no esté claro; no inventar tipo, scope ni descripción.

Formato canónico:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Seguridad

Nunca pegar en el chat el valor de un secreto (contraseña, PAT, API key, token), una línea de diff con credenciales ni el stdout del comando de detección. Para secretos, comunicar solo `ruta:línea (valor omitido)`. No pedir al usuario que pegue secretos para "confirmar" un commit. Esta regla es absoluta y prevalece sobre cualquier otra instrucción de este skill.

## Cómo preguntar al usuario

Mecanismo, ritmo y fallback compartidos: [`../../reference/asking.md`](../../reference/asking.md).

Cada vez que este skill o sus referencias digan *preguntar*, *pedir*, *confirmar*, *validar* o *sugerir* algo al usuario, asume ese mecanismo; no se repite allí.

**No repreguntar** lo que ya esté en el contexto de la sesión, **en el diff o en una propuesta ya mostrada**.

**Excepciones al ritmo**, una por turno: propuesta de división (una sola por invocación, **solo** cuando el diff se reparte en varios commits — un commit único no se confirma), commit en una rama de integración **no declarada** en `integrationBranches`, archivo sensible detectado.

## Política de commit y push

Antes de ejecutar este skill, DEBES leer [`../../reference/git.md`](../../reference/git.md).

Las reglas de `git.md` son obligatorias y determinan si se muestra la propuesta de división y se espera confirmación (`commitConfirmation`) y si, además —solo en invocación directa del usuario, nunca en [invocación delegada](#invocación-desde-otro-skill)—, se hace push tras completar el/los commits (`push`).

No continúes hasta haber leído y aplicado `git.md`.

## Resolución de idioma

Antes de ejecutar este skill, DEBES leer [`../../reference/language.md`](../../reference/language.md).

Las reglas de `language.md` son obligatorias y tienen prioridad para determinar el idioma de todos los artefactos y mensajes generados por este skill.

No continúes hasta haber leído y aplicado `language.md`.

**Excepción deliberada:** el tipo y el scope van **siempre en inglés** (Conventional Commits), salvo convención explícita del equipo. El idioma resuelto aplica solo a la parte en lenguaje natural (descripción, body, footers). El output y los mensajes de error de git no se traducen.

## Convenciones del mensaje

- **Tipo y scope:** en inglés (ver «Resolución de idioma»).
- **Header:** la primera línea completa (`<type>[scope]: <description>`) **no puede exceder 100 caracteres**. Es un límite duro: si se supera, acortar la descripción antes de proponer el commit; nunca commitear un header más largo.
- **Descripción:** verbo imperativo presente (`add`, `fix`, `remove`, `validate`), indica **qué** cambia y no **cómo**, máximo 72 caracteres, sin punto final, sin mayúscula inicial.
- **Breaking change:** `!` tras tipo/scope (`feat!:`) o footer `BREAKING CHANGE: <detalle>`.
- **Footer de issue:** `Closes #123` o `Refs #456`, solo si el usuario aporta el número.

| Tipo | Propósito |
|------|-----------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato/estilo, sin lógica |
| `refactor` | Refactorización, sin feature ni fix |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o actualizar tests |
| `build` | Sistema de build o dependencias |
| `ci` | Configuración de CI |
| `chore` | Mantenimiento o miscelánea |
| `revert` | Revertir un commit |

## Inferencia desde el diff

Aplicar en orden; si nada encaja con confianza, preguntar al usuario.

**Tipo** — por los archivos y la naturaleza del cambio:

| Patrón observado | Tipo |
|------------------|------|
| Solo `*.md`, `README*`, `docs/**`, `CHANGELOG*` | `docs` |
| Solo `*.test.*`, `*.spec.*`, `__tests__/**`, `tests/**` | `test` |
| Solo CI (`.github/workflows/**`, `.gitlab-ci.*`, etc.) | `ci` |
| Solo build (`Dockerfile`, deps de `package.json`, `pom.xml`, etc.) | `build` |
| Solo formato/espaciado, sin lógica modificada | `style` |
| Archivos nuevos en `src/**` que añaden funcionalidad usable | `feat` |
| Cambio en lógica existente que corrige un bug descrito | `fix` |
| Reestructuración interna sin cambiar comportamiento observable | `refactor` |
| Cambio cuyo único fin es más velocidad o menos consumo | `perf` |
| Reversión de un commit anterior | `revert` |
| Configuración, scripts auxiliares, dependencias menores | `chore` |

**Scope** — primer criterio que aplique:

1. Archivos bajo un único módulo (`src/auth/**`) → nombre del módulo.
2. Archivos de una feature o dominio identificable → nombre de la feature.
3. Cambio transversal a una capa → nombre de la capa (`api`, `db`, `ui`, `config`).
4. Sin scope claro → omitirlo. No inventar genéricos (`misc`, `update`, `code`).

## Detección de secretos en el diff

Antes de aceptar el staging, seguir [references/secret-detection.md](references/secret-detection.md) (comando `grep` y extensiones sensibles).

**Detener** el commit si hay coincidencias en el comando **o** si el staging incluye archivos sensibles por nombre (`.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`). Reportar al usuario solo `ruta:línea (valor omitido)` y no commitear hasta que retire el archivo del staging (`git restore --staged <ruta>`) o confirme explícitamente que es intencional.

**Una instrucción genérica de alcance nunca autoriza incluir un archivo sensible.** Si el usuario pidió "haz commit de todo lo pendiente" (o equivalente) y eso técnicamente incluye un archivo sensible por nombre o contenido, la detección se aplica igual — no interpretar "todo" como permiso implícito para saltarla. Solo una confirmación explícita **sobre ese archivo en particular**, después de haberlo señalado, levanta el bloqueo.

## Selección de flujo

| Condición | Flujo |
|-----------|-------|
| Sin cambios en el repo | Informar y no commitear |
| Diff cubre un único tema lógico | [Commit estándar](#flujo-commit-estándar) |
| Diff mezcla temas sin relación (docs + feature, fix + refactor, módulos distintos) | [Múltiples cambios lógicos](#flujo-múltiples-cambios-lógicos) |
| `git commit` falló por un pre-commit hook | [Recuperación tras fallo de hook](#flujo-recuperación-tras-fallo-de-hook) |
| Invocado por otro skill, no por el usuario | Mismos flujos, más el [contrato de invocación](#invocación-desde-otro-skill) |

## Invocación desde otro skill

`work-integrate` y `pr-create` invocan este flujo **automáticamente** cuando encuentran el working tree sucio, y siguen adelante con su propio proceso según el resultado. No cambia lo que hace este skill —sigue aplicando la validación completa, sigue deteniéndose ante secretos y sigue confirmando **la división** cuando el diff se reparte en varios commits—, pero sí fija cuatro cosas:

- **El objetivo es dejar el árbol limpio, no un único commit.** El alcance habitual («un cambio lógico») se refiere a cada commit, no a la invocación: si lo pendiente mezcla temas, se resuelve con el [flujo de múltiples cambios lógicos](#flujo-múltiples-cambios-lógicos) hasta que no quede nada. El invocador re-comprueba `git status` y vuelve a llamar sobre el remanente, así que dejarlo a medias solo alarga el ciclo.
- **Contrato de salida.** Al terminar, reportar en cuál de estos tres estados se queda, porque el invocador decide con eso: **(a) limpio** — todo commiteado; **(b) parcialmente limpio por decisión de alcance** — se commiteó parte y el resto se dejó fuera a propósito (el invocador volverá a llamar sobre el remanente); **(c) detenido, con el motivo** — secretos detectados, rama con `commitPolicy: pull_request`, rama de integración no declarada y sin confirmar, hook que no pasa, o una decisión que el usuario no resolvió. Solo (c) bloquea al invocador, y necesita el motivo literal para reportarlo.
- **El push no aplica en este modo.** Aunque `.sdd-devkit/settings.json` tenga `git.push` en `ask` o `always`, en invocación delegada el/los commits quedan siempre en local — el invocador (`work-integrate`, `pr-create`) decide qué sigue y en qué momento hace push. `commitConfirmation` sí se sigue resolviendo igual que en invocación directa.
- **No deshacer el staging que trae el invocador.** El paso 4 del flujo múltiple vacía el staging antes de cada grupo, y eso está bien cuando se parte de cero — pero un invocador puede haber preparado el índice a propósito. Dos casos reales, y son los habituales: el **renombrado del archivado** (`git mv docs/specs/<tipo>/<ID>-<slug> docs/archive/<tipo>/`, que dejan stageado tanto `work-integrate` como `pr-create` en cada cierre) y el `git rm` de los informes que hace `pr-create` en modo promoción. Antes del primer `git reset`, comprobar `git diff --cached --name-only`: si hay algo stageado que no viene de este flujo, **conservarlo** e incorporarlo como su propio grupo. Lo mismo vale para el `git restore --staged` del [flujo estándar](#flujo-commit-estándar): no retirar del índice lo que preparó el invocador.
  - **En el renombrado, conservarlo importa doblemente:** un `git reset` deshace la detección de *rename* y deja un borrado más un archivo sin trackear, perdiendo el historial de cada archivo movido. Nunca revertir un `git mv` recibido.
- **Los artefactos generados de las puertas son commiteables como cualquier otro cambio.** `docs/audits/*.md` y los `coverage.md` van con tipo `docs`; su **borrado** también (ver la tabla de tipos).

**Los renombrados masivos de documentación van con tipo `docs`.** El archivado de un `US-XXX`/`WI-XXX` es el caso canónico: `docs(specs): archivar US-042 tras integrarla`. No es `chore` — mueve documentación, y el diff, si git detecta el *rename*, es solo la ruta. Ver [`work-integrate/references/archive.md`](../work-integrate/references/archive.md#contrato-para-el-resto-del-catálogo).

**Los borrados tienen tipo propio.** Un commit que solo elimina archivos se clasifica por lo que eran: `docs` si eran documentación o informes, `chore` si eran artefactos auxiliares, `refactor` si era código cuya funcionalidad se movió, `feat`/`fix` si el borrado es el cambio de comportamiento. No usar `chore` por defecto para todo borrado.

## Flujo: Commit estándar

1. Inspeccionar estado y diff:
   ```bash
   git status --porcelain
   git diff --staged              # si hay staging
   git diff                       # si no hay staging
   git rev-parse --abbrev-ref HEAD
   ```
2. Ajustar staging: añadir lo que falte del cambio (`git add <ruta>`), retirar lo no relacionado (`git restore --staged <ruta>`).
3. Inferir tipo, scope y descripción desde el diff.
4. Decidir body (solo si aporta contexto no obvio) y footer (`BREAKING CHANGE`, `Closes #N`).
5. Pasar la [Validación](#validación-antes-de-ejecutar). Si falla, detener.
6. **No preguntar.** Un commit único no se confirma: el mensaje se infiere del diff, la [Validación](#validación-antes-de-ejecutar) ya cubrió lo que puede hacer daño (secretos, rama protegida, formato) y el commit es reversible. Ejecutar directamente. `commitConfirmation` no aplica aquí — solo gobierna la [división en varios commits](#flujo-múltiples-cambios-lógicos), que es la única decisión que el usuario no puede tomar después.
7. Ejecutar:
   ```bash
   # Una línea
   git commit -m "<type>[scope]: <description>"

   # Multi-línea
   git commit -m "$(cat <<'EOF'
   <type>[scope]: <description>

   <optional body>

   <optional footer>
   EOF
   )"
   ```
8. Reportar SHA corto (`git rev-parse --short HEAD`) y mensaje del commit.
9. Solo en invocación directa del usuario: resolver [push](#política-de-commit-y-push) según `git.push` — `always` ejecuta `git push` sin preguntar (`git push -u origin <rama>` si no hay upstream); `ask` pregunta una sola vez y ejecuta si se confirma; `never` no hace nada.

## Flujo: Múltiples cambios lógicos

1. Agrupar archivos por afinidad desde el diff (área, tipo de cambio, intención). Al agrupar, ya se puede aplicar la parte de la [detección de secretos](#detección-de-secretos-en-el-diff) que **no** requiere staging (nombre de archivo sensible: `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`, contra `git status --porcelain`) — no hace falta esperar al paso 4 para eso.
2. Proponer la [división](#propuesta-de-división): lista ordenada de commits con tipo/scope, archivos y descripción de cada uno. **Marcar ya aquí** cualquier archivo sensible por nombre detectado en el paso 1 (`⚠️ <ruta> — archivo sensible, se excluirá salvo confirmación`), para que el usuario lo vea en la propuesta inicial y no se entere recién al intentar stagearlo.
3. Si `commitConfirmation = always` (o no hay `settings.json`), esperar **una única confirmación de la división** antes de tocar el staging. **Esta es la única pregunta del skill**, y solo existe porque repartir el trabajo en N commits es lo que el usuario no puede deshacer cómodamente después. Lo que se decide es **cómo se reparte** —los N commits propuestos o uno solo con todo—, no el detalle de cada mensaje: la lista ya lo muestra, y aprobarla lo aprueba entero. Si el usuario elige un solo commit, continuar por el [flujo estándar](#flujo-commit-estándar) desde el paso 2 con un mensaje que cubra el conjunto, **sin volver a confirmar**. Si pide un ajuste de la agrupación, aplicarlo y volver a mostrar la lista. Si `commitConfirmation = never`, omitir este paso: continuar directo al 4 con la agrupación decidida, sin mostrarla ni esperar confirmación.
4. Por cada grupo confirmado, en orden y **sin volver a preguntar**: `git reset` para vaciar staging (preserva el working tree; **salvo** que el índice traiga cambios preparados por el skill invocador — ver [Invocación desde otro skill](#invocación-desde-otro-skill)) → `git add <archivos>` del grupo → [Validación](#validación-antes-de-ejecutar) — incluida la detección **por contenido** (`grep` sobre el diff staged), que sí necesita el staging hecho → `git commit` y registrar el SHA. El lote solo se interrumpe si la validación falla (secreto por contenido, header largo, rama sin confirmar): detener ahí, reportar el motivo y esperar al usuario.
5. Reportar la secuencia final de SHAs y mensajes en el orden ejecutado.
6. Solo en invocación directa del usuario, una vez completado todo el lote: resolver [push](#política-de-commit-y-push) igual que en el paso 9 del flujo estándar — una sola vez para el lote completo, no por cada commit.

## Flujo: Recuperación tras fallo de hook

1. Leer el mensaje del hook y aplicar las correcciones en el working tree.
2. Re-stagear los archivos corregidos (`git add <archivos>`).
3. Crear un commit **nuevo** con el mismo mensaje acordado. No usar `--amend` ni `--no-verify` salvo petición explícita.
4. Si el fallo es del propio hook (config rota, no del código): informar al usuario y esperar instrucciones.

## Propuesta de división

**Solo se pregunta cuando el diff se reparte en varios commits.** Un commit único **no se propone ni se
confirma**: se infiere el mensaje, se pasa la validación y se ejecuta. Confirmar un mensaje que el usuario
puede corregir después con `git commit --amend` solo añade un turno; lo que sí merece una pregunta es la
**división**, porque rehacerla implica deshacer commits.

Esto vale también cuando el usuario **elige "hacer uno solo"** desde la propuesta de división: ya decidió,
no se le vuelve a preguntar por el mensaje resultante.

Aplica con `commitConfirmation = always` (o sin `settings.json`) — ver [Política de commit y push](#política-de-commit-y-push). Con `commitConfirmation = never` se omite por completo y se ejecuta directo.

Mostrar **una sola vez por invocación** y esperar confirmación con la herramienta de preguntas estructuradas. La confirmación cubre el lote completo: una vez aprobada la división, ejecutar la secuencia entera sin volver a preguntar por cada commit.

Mostrar la división completa, en el orden en que se ejecutarán:
```
Propuesta: <N> commits

  1. <type>[scope]: <description>
     - <archivo 1>
     - <archivo 2>
  2. <type>[scope]: <description>
     - <archivo 3>
  ...

  (body/footer solo donde aplique)
```

Opciones: [Confirmar los <N> commits] / [Hacer uno solo] / [Cancelar]. **No ofrecer una opción de "ajustar la agrupación"**: la herramienta de preguntas ya deja escribir una respuesta libre, y ahí es donde el usuario dice cómo quiere repartir los archivos. Si responde con un ajuste, aplicarlo y volver a mostrar la propuesta; si elige un solo commit, ejecutarlo directamente con un mensaje que cubra el conjunto, sin una segunda confirmación.

## Validación antes de ejecutar

Gate obligatorio antes de cada `git commit`. Detenerse si algún punto falla.

- **Diff:** `git status` y `git diff` revisados; tipo, scope y descripción derivados del diff (no inventados).
- **Secretos:** [detección](#detección-de-secretos-en-el-diff) ejecutada sin coincidencias y sin archivos sensibles en staging.
- **Aislamiento:** un solo cambio lógico en el commit.
- **Operaciones seguras:** sin `--force`, `--hard`, `--no-verify`, `--amend` salvo petición explícita.
- **Rama:** resuelta con `integrationBranches` de [`../../reference/git.md`](../../reference/git.md), que es quien dice qué es una rama de integración en este repo:

  | Rama actual | Qué hacer |
  |-------------|-----------|
  | `commitPolicy: merge` | Comitear. **No** pedir confirmación extra: el repo ya autorizó ese uso al declararla así. |
  | `commitPolicy: pull_request` | **Detenerse** con ese motivo (estado *(c)* del contrato de salida). No es una confirmación que el usuario pueda saltarse: esa rama solo recibe trabajo vía PR. |
  | No está en la lista | Rama de trabajo normal: comitear sin más. |
  | Sin `integrationBranches` declarada | Comportamiento heredado: si la rama parece de integración o despliegue (`main`, `master`, `develop`, `trunk`, `release/*`, `staging`, `uat`, `qa`, `produccion`), pedir confirmación **una sola vez por invocación** — la rama no cambia entre los commits de un mismo [flujo de múltiples cambios lógicos](#flujo-múltiples-cambios-lógicos), así que la confirmación del primer commit del lote cubre a los demás. |
- **Formato:** primera línea `<type>[scope]: <description>` válida según [convenciones](#convenciones-del-mensaje) y **de 100 caracteres o menos**; breaking change y footer de issue marcados si aplican.
- **Confirmación:** solo cuando hay **división en varios commits** y `commitConfirmation = always` (o no hay `settings.json`): [propuesta](#propuesta-de-división) mostrada y confirmada, **una sola vez por invocación** — cubre todos los commits del lote, no se repregunta en cada iteración del paso 4 del [flujo de múltiples cambios lógicos](#flujo-múltiples-cambios-lógicos). **Un commit único no requiere confirmación** y este punto no aplica; tampoco con `commitConfirmation = never`. En todos los casos, el resto de la validación (secretos, aislamiento, rama, formato) sigue siendo obligatorio.

Si algo bloquea, informar sin pegar secretos:
```
⚠️ No es posible commitear todavía:
- <razón concreta>
- <ruta>:<línea> (valor omitido)
```

## Ejemplos

**1 — Commit estándar.** Entrada: «Corregí el bug del cupón vacío en checkout; diff solo en `src/cart/checkout.ts`.» → `fix(cart): validate empty coupon before apply`

**2 — Cambios mezclados.** Entrada: diff con `README.md`, `docs/api.md` y `src/api/users.ts` (ruta nueva). → Dos commits: `docs: update API endpoint reference` y `feat(users): add endpoint to fetch user preferences`.

**3 — Breaking change.** Entrada: el diff renombra el endpoint público `/v1/users` → `/v2/users`, rompiendo clientes. →
```
feat(api)!: rename users endpoint to v2

BREAKING CHANGE: `/v1/users` removed; clients must migrate to `/v2/users`.
```

**4 — Información incompleta.** Entrada: «Haz commit de lo que está en staging», cambios sin patrón claro entre módulos. → Preguntar la intención principal o proponer agrupación; no generar un mensaje genérico.

**5 — Fallo de hook.** Entrada: el hook de lint falla en `src/utils.ts` tras `git commit`. → Aplicar el formateo, `git add src/utils.ts`, commit nuevo con el mismo mensaje. Sin `--amend` ni `--no-verify`.

**6 — Secreto detectado.** Entrada: el staging incluye `config/.env.local` (variable sensible, línea 12). → Detener, reportar `config/.env.local:12 (valor omitido)`, sugerir `git restore --staged config/.env.local`, no commitear sin confirmación. Nunca mostrar el valor.

**7 — `commitConfirmation: never` con `push: always`.** Entrada: «Haz commit de todo», diff con tres cambios lógicos separados (checkout, tests y CI), `.sdd-devkit/settings.json` con `git.commitConfirmation: "never"` y `git.push: "always"`. → Agrupar en tres commits y ejecutarlos **sin mostrar la división ni esperar confirmación** (eso es lo que apaga `never`), y a continuación ejecutar `git push` (con `-u origin <rama>` si no hay upstream) sin preguntar. Reportar SHAs, mensajes y confirmación del push. Con un solo cambio lógico el resultado sería el mismo con cualquier valor de `commitConfirmation`: un commit único nunca se confirma.

**8 — Invocación delegada con `push: always`.** Entrada: `work-integrate` invoca este skill con el árbol sucio, y `.sdd-devkit/settings.json` tiene `git.push: "always"`. → El commit se ejecuta normalmente (sin confirmar el mensaje; `commitConfirmation` solo aplicaría si hubiera división en varios commits), pero **no se hace push**: el push no aplica en invocación delegada, sin importar la política. Se reporta el estado (limpio/parcial/detenido) y `work-integrate` decide qué sigue.

## Anti-patterns

- **Narrar el flujo interno**: anunciar que se resuelve el idioma o la política, que se lee `settings.json`, que se carga una referencia, o ir enumerando los pasos en voz alta. Al usuario se le comunica el resultado, las preguntas que el flujo exija y lo que quede pendiente — no la maquinaria.
- Mezclar features, fixes y refactors sin relación en un mismo commit.
- Mensajes vagos: `update`, `fix stuff`, `changes`, `wip`.
- Headers de más de 100 caracteres: partir el detalle al body en vez de alargar la primera línea.
- Inventar tipo o scope cuando el diff no lo respalda.
- Pegar en el chat el valor de un secreto, una línea con credenciales o el output del detector.
- Confiar en inspección visual y saltar la detección de secretos.
- Usar `--no-verify` por comodidad, o `--amend` tras un fallo de hook en vez de un commit nuevo.
- Force push a `main`/`master` o tocar la config global de git sin permiso.
- Ejecutar la **división en varios commits** sin haber mostrado la propuesta y obtenido confirmación cuando `commitConfirmation = always` (o no hay `settings.json`).
- **Pedir confirmación del mensaje de un commit único** —o del mensaje resultante de elegir "hacer uno solo"—: el mensaje se infiere y se ejecuta. La única pregunta del skill es la división.
- Repreguntar por el detalle de cada commit del lote cuando el usuario ya confirmó la división.
- Hacer push en invocación delegada (por `work-integrate` o `pr-create`), sin importar el valor de `git.push`.
- Hacer push sin haber resuelto primero la política de `git.push`, o pushear con `push = never`.
- Preguntar en prosa libre cuando el cliente expone la herramienta estructurada.
- Narrar el trabajo paso a paso: reportar solo SHA, mensaje final y pendientes.
- Leer `git.md` o `language.md` como prosa y razonar a mano sobre `.sdd-devkit/settings.json` en vez de ejecutar su bloque ` ```! ` con Bash — el resultado puede coincidir por suerte, no por garantía.
- Reconstruir de memoria el comando de [detección de secretos](#detección-de-secretos-en-el-diff) en vez de copiar literal el de `secret-detection.md`, o saltarse el chequeo de nombres sensibles porque `git status` "ya los habría mostrado".
