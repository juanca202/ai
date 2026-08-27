# Resolución de la política de commit y push

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');

let git = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.git) git = settings.git;
  } catch (e) {}
}

if (git) {
  const confirm = git.confirmCommit;
  const push = git.push;

  console.log('Politica de git resuelta desde .sdd-devkit/settings.json:');

  if (confirm === 'never') {
    console.log('- confirmCommit = never -> NO mostrar la propuesta de commit (ni la division en varios) ni esperar confirmacion: ejecutar el/los commits inferidos directamente. Las gates de seguridad (secretos, rama protegida) siguen aplicando igual y SI bloquean.');
  } else {
    console.log('- confirmCommit = always -> mostrar la propuesta de commit (o la division en varios) y esperar confirmacion explicita antes de ejecutar, como venia siendo el comportamiento por defecto.');
  }

  if (push === 'always') {
    console.log('- push = always -> tras completar el/los commits, ejecutar git push sin preguntar (usa el upstream existente o lo crea con -u origin <rama> si no lo tiene). Solo en invocacion directa del usuario.');
  } else if (push === 'ask') {
    console.log('- push = ask -> tras completar el/los commits, preguntar UNA sola vez si se hace push; si el usuario confirma, ejecutarlo. Solo en invocacion directa del usuario.');
  } else {
    console.log('- push = never -> no hacer push ni ofrecerlo. El/los commits quedan solo en local.');
  }
} else {
  console.log('No hay .sdd-devkit/settings.json con bloque \\'git\\'. Aplicar los valores por defecto del catalogo:');
  console.log('- **confirmCommit = always**: mostrar la propuesta y esperar confirmacion antes de cada commit (o division de commits).');
  console.log('- **push = never**: no hacer push ni ofrecerlo.');
  console.log('**No decidir estos valores por cuenta propia** ni ofrecer escribirlos: arch-init es quien crea el archivo.');
}
"
```

> **`push` no aplica en invocación delegada.** Cuando `git-commit` se ejecuta invocado por otro skill
> (`work-integrate`, `pr-create`), el commit queda **siempre local** — el invocador decide qué sigue
> (merge, PR, y en qué momento hace push). `confirmCommit` sí se resuelve igual que en invocación directa.

> **Una petición explícita del usuario gana.** Si en el turno el usuario pide algo incompatible con lo
> resuelto ("sin preguntar", "commitea directo", "no hagas push", "sube los cambios"), se respeta esa
> petición para **esa** invocación y no se modifica `settings.json`.
