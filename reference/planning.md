# Resolución de la política de definición de casos de prueba

`specification.testCases` es un **objeto** con dos claves independientes:

| Clave | Quién la lee | Qué decide |
|-------|--------------|------------|
| `mode` (`ask` · `always` · `never`) | `work-define`, `work-plan`, `test-define` | **Si se ofrece o invoca `test-define`** al cerrar la planificación (`work-define`/`work-plan`); y, dentro de `test-define`, **si se pide aceptación final del resultado** (Paso 4.5) — con `always` no se pregunta, se da por aceptado. |
| `askDetails` (`true` · `false`) | `test-define` | **Si `test-define` hace su entrevista de clarificación** (entorno, roles, datos de prueba, escenarios de error) o aplica sus valores por defecto. |

Son independientes: `mode` gobierna la **oferta de invocación** y la **aceptación final**; `askDetails` gobierna la **entrevista de clarificación** del Paso 2 — también cuando lo invoca el usuario directamente, sin pasar por la planificación. `test-define` lee ambas claves siempre, venga o no invocado por la planificación.

> **Extracción de criterios (Paso 1) sin confirmación.** Independientemente de `mode` y `askDetails`, `test-define` ya no pide confirmar la lista de criterios de aceptación extraídos antes de generar los TC: el alcance por defecto es siempre **todos** los criterios (ver `test-define/SKILL.md`, Paso 1 y Paso 2).

> **Ejecutar este bloque con Bash — no leerlo como prosa ni reimplementar su lógica a mano.** Es un
> script, no una explicación: correrlo y usar literalmente lo que imprime como la política ya resuelta.
> Razonar a mano sobre `.sdd-devkit/settings.json` en su lugar —aunque se llegue a la misma
> conclusión— reintroduce el margen de error de interpretación que el script existe para eliminar.

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');

let specification = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.specification) specification = settings.specification;
  } catch (e) {}
}

if (specification) {
  const tcRaw = specification.testCases;
  const tc = tcRaw && tcRaw.mode;
  const askDetails = tcRaw ? tcRaw.askDetails : undefined;
  console.log('Politica de planificacion resuelta desde .sdd-devkit/settings.json:');
  if (tc === 'always') {
    console.log('- testCases.mode = always -> al cerrar la planificacion, invocar /test-define automaticamente, SIN preguntar.');
    console.log('  - work-define: al dejar la historia en Ready. Sigue ofreciendo /work-plan para las tareas.');
    console.log('  - work-plan: al dejar las tareas del alcance en Ready, sobre el artefacto padre (la US, o el propio WI). Sigue ofreciendo /work-implement.');
    console.log('  - test-define: al terminar de generar los TC (Paso 4.5), NO pregunta si se acepta el resultado -> lo da por aceptado y cierra directamente.');
  } else if (tc === 'never') {
    console.log('- testCases.mode = never -> NO sugerir ni invocar /test-define en ningun momento de la planificacion.');
    console.log('  - work-define: ofrecer unicamente /work-plan para las tareas.');
    console.log('  - work-plan: ofrecer unicamente /work-implement.');
  } else {
    console.log('- testCases.mode = ask -> preguntar si se definen los casos de prueba, e invocar /test-define solo si el usuario acepta.');
    console.log('  - work-define: opcion [Definir casos de prueba] junto a [Planificar tareas], al dejar la historia en Ready.');
    console.log('  - work-plan: opcion [Definir casos de prueba] junto a [Implementar], al dejar las tareas en Ready.');
  }
  console.log('');
  if (askDetails === false) {
    console.log('- testCases.askDetails = false -> cuando test-define se ejecute, NO hace su entrevista de clarificacion: aplica sus valores por defecto (entorno, roles, datos de prueba, escenarios de error) y anota los supuestos en los TC. Esto lo consume test-define, no la planificacion.');
  } else {
    console.log('- testCases.askDetails = true -> test-define hace su entrevista de clarificacion antes de generar los TC. Esto lo consume test-define, no la planificacion.');
  }
  console.log('');
  console.log('EN LOS TRES VALORES DE mode, antes de ofrecer o invocar nada: comprobar si el artefacto padre ya tiene test-cases/ con al menos un TC-XXX. Si ya los tiene, NO volver a ofrecerlo ni invocarlo — puede haberlos creado work-define en su propio cierre.');
} else {
  console.log('No hay .sdd-devkit/settings.json con bloque \\'specification\\'. Aplicar el valor por defecto del catalogo:');
  console.log('- **testCases.mode = ask**: preguntar si se definen los casos de prueba al cerrar la planificacion, tanto en work-define como en work-plan.');
  console.log('- **testCases.askDetails = true**: test-define hace su entrevista de clarificacion antes de generar los TC.');
  console.log('**No decidir este valor por cuenta propia** ni ofrecer escribirlo: arch-init es quien crea el archivo.');
}
"
```

> **`mode` gobierna la oferta de `test-define` y, con `always`, también su aceptación final (Paso 4.5).**
> El resto de próximos pasos de cada skill no cambia con este bloque: `work-define` sigue sugiriendo
> `/work-plan` para las tareas y `work-plan` sigue sugiriendo `/work-implement`, igual en los tres valores.
> Dentro de `test-define`, `ask` y `never` mantienen la pregunta de aceptación del Paso 4.5 tal cual estaba.

> **`askDetails` no lo consume la planificación.** `work-define` y `work-plan` lo ignoran; es `test-define`
> quien lo lee al arrancar, venga invocado por la planificación o directamente por el usuario. Un
> `askDetails: false` **no** reduce el alcance: los TC siguen cubriendo **todos** los criterios de
> aceptación — lo único que desaparece son las preguntas de clarificación.

> **Dos momentos, una sola vez.** Los `TC-XXX` cuelgan del **artefacto padre** (la US, o el propio `WI`),
> no de una `TK`. Por eso los dos skills miran la misma carpeta `test-cases/` y **el que llegue segundo no
> repite la oferta**: si `work-define` ya los creó al dejar la US en Ready, `work-plan` no vuelve a
> ofrecerlos ni los invoca, ni siquiera con `always`. La comprobación previa —¿existe `test-cases/` con al
> menos un `TC-XXX`?— es obligatoria en los tres valores.

> **`always` no crea los `TC-XXX` aquí.** Sigue siendo `test-define` quien los redacta y con sus propias
> reglas; este bloque solo decide si el skill lo invoca sin preguntar o pregunta primero.

> **No bloquea la implementación.** Que no haya casos de prueba no impide cerrar la planificación ni
> pasar a `work-implement`: ese skill tiene su propia comprobación de `test-cases/` y decide ahí qué
> hacer. Este bloque solo gobierna si la planificación los **ofrece**.

> **Una petición explícita del usuario gana.** Si en el turno el usuario pide algo incompatible con lo
> resuelto ("no definas casos de prueba todavía", "define los TCs ya"), se respeta esa petición para
> **esa** invocación y no se modifica `settings.json`.

> **Esta resolución es interna: no se narra.** Leer y aplicar este bloque es fontanería del skill, no
> trabajo que el usuario haya pedido. **No anunciarlo** («voy a resolver el idioma y la política», «ya leí
> la configuración», «ahora identifico el artefacto»), ni describir los pasos del flujo mientras se
> ejecutan. Lo que se le dice al usuario es el **resultado** —lo que se produjo, lo que debe decidir y lo
> que queda pendiente—, más las preguntas que el propio flujo exija. Si un valor resuelto cambia lo que el
> usuario va a ver, se menciona **al reportar**, no al resolverlo.
