# Resolución de la política de corrección en las puertas de calidad

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');

let qg = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.qualityGates) qg = settings.qualityGates;
  } catch (e) {}
}

const describe = (name, value) => {
  if (value === 'never') {
    console.log('- ' + name + ' = never -> NO pedir confirmacion: aplicar la correccion directamente en cuanto haya un fallo/hallazgo accionable, y seguir el resto del flujo de correccion tal cual esta descrito (delegacion, reinicio de la corrida/revision, etc).');
  } else {
    console.log('- ' + name + ' = always -> pedir confirmacion antes de corregir (o preguntar si se corrige o se entrega solo el informe/hallazgos), como viene siendo el comportamiento por defecto. Sin autorizacion explicita, no se corrige nada.');
  }
};

if (qg) {
  console.log('Politica de correccion en puertas de calidad, resuelta desde .sdd-devkit/settings.json:');
  describe('qualityCheckConfirmFix', qg.qualityCheckConfirmFix);
  describe('codeReviewConfirmFix', qg.codeReviewConfirmFix);
} else {
  console.log('No hay .sdd-devkit/settings.json con bloque \\'qualityGates\\'. Aplicar el valor por defecto del catalogo:');
  console.log('- **always** para ambas puertas: pedir confirmacion antes de corregir cualquier fallo o hallazgo.');
  console.log('**No decidir este valor por cuenta propia** ni ofrecer escribirlo: arch-init es quien crea el archivo.');
}
"
```

> **Qué gobierna cada clave.** `qualityCheckConfirmFix` es de `quality-check`; `codeReviewConfirmFix` es de
> `code-review`. **No es un interruptor de si la puerta corre** — la puerta (los checks, la revisión)
> siempre se ejecuta igual; esto solo decide si, al encontrar algo que corregir, se **pide confirmación**
> primero (`always`) o se **corrige directo sin preguntar** (`never`).

> **Lo que NO cambia.** `never` solo salta la pregunta de *si* se corrige — nunca las gates de seguridad
> ni de alcance ya descritas en cada skill (secretos, rama protegida, límites de la delegación en
> `work-implement`, corrección no aplicada, etc.). Tampoco cambia *quién* corrige (delegación en
> `work-implement` cuando aplica) ni el resto del contrato de cada flujo.

> **trace-validate no tiene este ajuste.** No aplica correcciones por sí mismo — solo reporta y delega la
> ejecución de pruebas en `quality-check`, ya de forma automática — así que no hay nada que este bloque
> gobierne para ese skill.

> **Una petición explícita del usuario gana.** Si en el turno el usuario pide algo incompatible con lo
> resuelto ("corrige sin preguntar", "primero pregúntame", "solo quiero el informe"), se respeta esa
> petición para **esa** invocación y no se modifica `settings.json`.
