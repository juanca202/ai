# Resolución de la política de implementación

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');

let impl = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.implementation) impl = settings.implementation;
  } catch (e) {}
}

if (impl) {
  const confirm = impl.confirmByUnit;
  const tree = impl.workTree;
  const treePath = impl.workTreePath;
  const max = impl.maxParallel;
  const archive = impl.archiveMode;

  console.log('Politica de implementacion resuelta desde .sdd-devkit/settings.json:');

  if (confirm === 'never') {
    console.log('- confirmByUnit = never -> **NO pausar entre unidades**. No pedir confirmacion al terminar cada unidad: encadenar la siguiente. La confirmacion del plan de ejecucion inicial sigue siendo obligatoria.');
  } else {
    console.log('- confirmByUnit = always -> **una unidad por confirmacion**. Al terminar cada unidad, esperar confirmacion explicita del usuario antes de arrancar la siguiente.');
  }

  if (tree === 'always') {
    console.log('- workTree = always -> cada unidad se implementa en su propio git worktree. No preguntar.');
  } else if (tree === 'never') {
    console.log('- workTree = never -> trabajar siempre en el arbol principal. No crear worktrees ni ofrecerlos.');
  } else {
    console.log('- workTree = ask -> preguntar UNA sola vez, al inicio de la ejecucion, si usar worktrees; aplicar la respuesta a todas las unidades.');
  }

  console.log('- workTreePath = ' + (treePath ? treePath + ' -> raiz donde crear los worktrees (relativa a la raiz del repo si no es absoluta).' : '(sin definir) -> crear los worktrees en una ruta temporal fuera del arbol principal.'));

  if (max === -1) {
    console.log('- maxParallel = -1 -> sin limite de subagentes concurrentes.');
  } else {
    console.log('- maxParallel = ' + max + ' -> maximo ' + max + ' subagentes en paralelo. Si una ola tiene mas unidades independientes, despacharlas en lotes de ese tamano; al liberarse un cupo, entra la siguiente.');
  }

  console.log('- archiveMode = ' + archive + ' -> politica de archivado del artefacto al cerrarlo (la aplica el skill que archiva, no el que implementa): always = archivar sin preguntar; never = no archivar; ask = preguntar.');
} else {
  console.log('No hay .sdd-devkit/settings.json con bloque \\'implementation\\'. Aplicar los valores por defecto del catalogo:');
  console.log('- **confirmByUnit = always**: una unidad por confirmacion; esperar confirmacion explicita entre unidades.');
  console.log('- **workTree = ask**: preguntar una sola vez, al inicio, si usar worktrees.');
  console.log('- **workTreePath** sin definir: worktrees en una ruta temporal fuera del arbol principal.');
  console.log('- **maxParallel = 3**: hasta 3 subagentes concurrentes.');
  console.log('- **archiveMode = ask**: preguntar antes de archivar.');
  console.log('**No decidir estos valores por cuenta propia** ni ofrecer escribirlos: arch-init es quien crea el archivo.');
}
"
```

> **Una peticion explicita del usuario gana.** Si en el turno el usuario pide algo incompatible con lo
> resuelto ("de corrido", "sin preguntar", "una por una", "sin worktrees"), se respeta esa peticion para
> **esa** ejecucion y no se modifica `settings.json`.

> **Modo delegado.** Cuando el skill se ejecuta invocado por otro skill (subagente), la politica ya
> resuelta se le pasa en la delegacion: en ese modo no se vuelve a resolver ni se pregunta nada.
