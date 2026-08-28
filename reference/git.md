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

let branch = null;
try {
  branch = require('child_process').execSync('git branch --show-current', {stdio: ['ignore','pipe','ignore']}).toString().trim() || null;
} catch (e) {}

const reportBranches = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    console.log('- integrationBranches: **sin declarar**. El repo no dice cuales son sus ramas de integracion, asi que cuando un flujo necesite una hay que **preguntarla al usuario** (no adivinar main ni develop) y pedir confirmacion antes de comitear sobre ella.');
    return;
  }
  const names = list.map(b => b.name + ' (' + b.commitPolicy + ')').join(' · ');
  console.log('- integrationBranches: ' + names);
  const current = branch ? list.find(b => b.name === branch) : null;
  if (!branch) {
    console.log('  No se pudo determinar la rama actual. Resolverla antes de decidir.');
  } else if (!current) {
    console.log('  Rama actual **' + branch + '**: NO es rama de integracion. Un flujo que exija una debe resolverla contra la lista: si hay una sola con commitPolicy=merge, usar esa (checkout previo); si hay varias, preguntar entre ellas; nunca proponer una que no este en la lista.');
  } else if (current.commitPolicy === 'merge') {
    console.log('  Rama actual **' + branch + '** = merge -> **comitear y mergear aqui directamente. NO preguntar cual es la rama de integracion ni pedir confirmacion extra por ser rama protegida**: el repo ya lo declaro.');
  } else {
    const alts = list.filter(b => b.commitPolicy === 'merge').map(b => b.name);
    console.log('  Rama actual **' + branch + '** = pull_request -> **NO comitear ni mergear aqui**. Solo se integra via pull request. Ofrecer al usuario exactamente dos salidas: (a) cambiar a una rama con commitPolicy=merge' + (alts.length ? ' (' + alts.join(', ') + ')' : ' (no hay ninguna declarada)') + ', o (b) terminar aqui sin tocar nada. No hay tercera opcion ni se pide confirmacion para saltarselo.');
  }
};

if (git) {
  const confirm = git.commitConfirmation;
  const push = git.push;

  console.log('Politica de git resuelta desde .sdd-devkit/settings.json:');

  if (confirm === 'never') {
    console.log('- commitConfirmation = never -> NO mostrar la division en varios commits ni esperar confirmacion: ejecutar los commits inferidos directamente. Las gates de seguridad (secretos, rama protegida) siguen aplicando igual y SI bloquean.');
  } else {
    console.log('- commitConfirmation = always -> mostrar la division en varios commits y esperar confirmacion explicita antes de ejecutar el lote.');
  }
  console.log('- En ambos casos, un commit UNICO no se propone ni se confirma: se infiere el mensaje, se pasa la validacion y se ejecuta. commitConfirmation solo gobierna la division.');

  if (push === 'always') {
    console.log('- push = always -> tras completar el/los commits, ejecutar git push sin preguntar (usa el upstream existente o lo crea con -u origin <rama> si no lo tiene). Solo en invocacion directa del usuario.');
  } else if (push === 'ask') {
    console.log('- push = ask -> tras completar el/los commits, preguntar UNA sola vez si se hace push; si el usuario confirma, ejecutarlo. Solo en invocacion directa del usuario.');
  } else {
    console.log('- push = never -> no hacer push ni ofrecerlo. El/los commits quedan solo en local.');
  }

  reportBranches(git.integrationBranches);
} else {
  console.log('No hay .sdd-devkit/settings.json con bloque \\'git\\'. Aplicar los valores por defecto del catalogo:');
  console.log('- **commitConfirmation = always**: mostrar la division en varios commits y esperar confirmacion antes de ejecutar el lote. Un commit unico se ejecuta sin confirmar.');
  console.log('- **push = never**: no hacer push ni ofrecerlo.');
  console.log('- **integrationBranches sin declarar**: preguntar al usuario cual es la rama de integracion cuando un flujo la necesite, y pedir confirmacion antes de comitear sobre ella.');
  console.log('**No decidir estos valores por cuenta propia** ni ofrecer escribirlos: arch-init es quien crea el archivo.');
}
"
```

> **`integrationBranches` sustituye a la adivinanza y a la pregunta.** Es la lista declarada de ramas de
> integración o despliegue del repositorio. Cuando existe, **ningún skill pregunta cuál es la rama de
> integración ni propone `main`/`develop` por su cuenta**: la lista manda. Y `commitPolicy` decide qué se
> puede hacer sobre cada una:
>
> | `commitPolicy` | Qué significa |
> |----------------|---------------|
> | `merge` | Admite **merge y commit en local** sobre ella. **No** se pide la confirmación extra de «rama protegida»: el repo ya autorizó ese uso al declararla así. |
> | `pull_request` | **No se comitea ni se mergea en local sobre ella.** Solo entra trabajo vía pull request. Un flujo que necesite escribir ahí ofrece dos salidas —cambiar a una rama `merge`, o terminar— y ninguna de las dos es «confirmar y seguir». |
>
> Una rama que **no** está en la lista no es rama de integración: no recibe trato especial, y un flujo que
> exija una la resuelve contra la lista, nunca inventándola.

> **`push` no aplica en invocación delegada.** Cuando `git-commit` se ejecuta invocado por otro skill
> (`work-integrate`, `pr-create`), el commit queda **siempre local** — el invocador decide qué sigue
> (merge, PR, y en qué momento hace push). `commitConfirmation` sí se resuelve igual que en invocación directa.

> **Una petición explícita del usuario gana.** Si en el turno el usuario pide algo incompatible con lo
> resuelto ("sin preguntar", "commitea directo", "no hagas push", "sube los cambios"), se respeta esa
> petición para **esa** invocación y no se modifica `settings.json`.
