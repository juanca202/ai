# Resolución de la política de verificación (puertas de cierre)

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');

let verification = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.verification) verification = settings.verification;
  } catch (e) {}
}

const GATES = [
  { key: 'qualityCheck', skill: 'quality-check', appliesFix: true },
  { key: 'codeReview', skill: 'code-review', appliesFix: true },
  { key: 'requirementCoverage', skill: 'trace-validate', appliesFix: false },
];

const describeGate = (key, skill, appliesFix, gate) => {
  gate = gate || {};
  if (gate.enabled === false) {
    console.log('- ' + key + '.enabled = false -> NO ejecutar ' + skill + ' ni ofrecerlo en el cierre de work-integrate. La puerta queda OMITIDA: no bloquea el merge, pero tampoco cuenta como aprobada.');
    return;
  }
  console.log('- ' + key + '.enabled = true -> ejecutar ' + skill + ' antes del merge en work-integrate. Su veredicto manda: solo APPROVED (o APPROVED_WITH_NOTES en trace-validate) deja continuar.');
  if (!appliesFix) {
    console.log('  ' + key + '.confirmFix no tiene efecto: trace-validate no corrige por si mismo, solo reporta y delega la ejecucion de pruebas en quality-check.');
    return;
  }
  if (gate.confirmFix === 'never') {
    console.log('  ' + key + '.confirmFix = never -> NO pedir confirmacion en ' + skill + ': aplicar la correccion directamente en cuanto haya un fallo/hallazgo accionable, y seguir el resto del flujo de correccion tal cual esta descrito (delegacion, reinicio de la corrida/revision, etc).');
  } else {
    console.log('  ' + key + '.confirmFix = always -> pedir confirmacion antes de corregir en ' + skill + ' (o preguntar si se corrige o se entrega solo el informe/hallazgos), como comportamiento por defecto. Sin autorizacion explicita, no se corrige nada.');
  }
};

if (verification) {
  console.log('Politica de verificacion resuelta desde .sdd-devkit/settings.json:');
  GATES.forEach(g => describeGate(g.key, g.skill, g.appliesFix, verification[g.key]));
  console.log('');
  if (verification.handoff === 'always') {
    console.log('- handoff = always -> tras un veredicto de cierre que deja pasar (todas las puertas activas en APPROVED/APPROVED_WITH_NOTES), continuar automaticamente hacia work-integrate sin preguntar.');
  } else {
    console.log('- handoff = ask -> tras un veredicto de cierre que deja pasar, preguntar si se continua hacia work-integrate antes de invocarlo.');
  }
} else {
  console.log('No hay .sdd-devkit/settings.json con bloque \\'verification\\'. Aplicar el valor por defecto del catalogo:');
  console.log('- **enabled = true** y **confirmFix = always** para las tres puertas (quality-check, code-review, trace-validate).');
  console.log('- **handoff = ask**.');
  console.log('**No decidir estos valores por cuenta propia** ni ofrecer escribirlos: arch-init es quien crea el archivo.');
}
"
```

> **Qué gobierna cada puerta.** `qualityCheck` es `quality-check`; `codeReview` es `code-review`;
> `requirementCoverage` es `trace-validate`. Cada una tiene dos ejes independientes: `enabled` decide si
> la puerta **corre** antes del merge en `work-integrate` (no si aprueba — el veredicto sigue mandando
> igual, y `REJECTED`/`INCOMPLETE` bloquean); `confirmFix` decide, cuando la puerta encuentra algo
> corregible, si se **pide confirmación** primero (`always`) o se **corrige directo sin preguntar**
> (`never`). `requirementCoverage.confirmFix` existe en el schema por simetría con las otras dos, pero no
> tiene efecto: `trace-validate` no aplica correcciones por sí mismo, solo reporta y delega la ejecución
> de pruebas en `quality-check`, ya de forma automática.

> **Esto no relaja las demás condiciones del merge.** Working tree limpio, unidades en `Done`, rama base
> resoluble, delta distinto de cero y el resto de la validación previa de `work-integrate` siguen
> aplicando igual.

> **Omitida ≠ aprobada.** Una puerta con `enabled: false` deja el merge sin esa evidencia. No bloquea,
> pero **debe reportarse explícitamente** como omitida, con el motivo (`policy`), en el resumen del cierre
> y en el mensaje de merge. Nunca se omite en silencio ni se lista como aprobada.

> **Dependencia entre puertas.** `trace-validate` reutiliza el `test-run.json` que produce
> `quality-check`. Si `qualityCheck.enabled` es `false` y `requirementCoverage.enabled` es `true`, no hay
> caché que reutilizar: `trace-validate` invocará `quality-check` en modo `tests-only` por su cuenta, que
> es su comportamiento normal cuando no hay corrida fresca. Omitir `quality-check` no evita, por tanto,
> que se ejecuten pruebas si la tercera puerta sigue activa.

> **`handoff` gobierna si se pregunta antes de pasar a `work-integrate`, no las puertas en sí.** Con
> `always`, un cierre de verificación sin bloqueantes invoca `work-integrate` directamente; con `ask`
> (por defecto), se presenta la opción y se espera la confirmación del usuario, como venía siendo el
> comportamiento por defecto.

> **`pr-create` no usa este bloque.** Sus puertas se rigen por su propio flujo: un PR es un artefacto
> público y su contrato de puertas es independiente del de la integración local.

> **Una petición explícita del usuario gana.** Si en el turno el usuario pide algo incompatible con lo
> resuelto ("sáltate el code review", "corre las tres igual", "corrige sin preguntar", "primero
> pregúntame", "solo quiero el informe"), se respeta esa petición para **esa** invocación y no se
> modifica `settings.json`.
