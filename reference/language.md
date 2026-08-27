# Resolución de idioma de artefactos y mensajes

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');
const langNames = new Intl.DisplayNames(['es'], { type: 'language' });

let langCode = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.language) langCode = settings.language;
  } catch (e) {}
}

if (langCode) {
  console.log('El idioma para redactar los artefactos y los mensajes al usuario es: ' + langNames.of(langCode) + ' (código ISO 639-1: ' + langCode + ')');
} else {
  console.log('1. La **preferencia de idioma del usuario** que conste en el contexto de la sesión.');
  console.log('2. Si no, usar el **idioma del mensaje del usuario** y **preguntar si desea persistirlo**.');
  console.log('3. Si no se puede inferir, **preguntar al usuario** qué idioma prefiere. **No decidir el idioma por cuenta propia.**');
}
"
```

> **De dónde sale la configuración.** `.sdd-devkit/settings.json` lo crea `arch-init` al inicializar el harness, con el idioma resuelto en su clave `language`. Si el proyecto todavía no lo tiene, se aplica el procedimiento de arriba sin él.

> **Modo delegado.** Cuando el skill se ejecuta invocado por otro skill (subagente), se le debe indicar el idioma de preferencia del usuario ya resuelto. En este modo, el subagente debe omitir el proceso de inferencia y usar directamente la preferencia indicada.
