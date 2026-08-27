# Resolución de la integración con el gestor de proyectos

```!
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(process.cwd(), '.sdd-devkit', 'settings.json');

let pm = null;
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && settings.projectManagement) pm = settings.projectManagement;
  } catch (e) {}
}

if (!pm || pm.enabled !== true) {
  console.log('Integracion con gestor de proyectos: **DESACTIVADA**.');
  console.log('- Crear y numerar los artefactos con **ID secuencial local** (ver ../artifacts.md).');
  console.log('- No invocar ningun MCP de tracker, no ofrecer sincronizar y no preguntar por ello.');
  console.log('- No escribir el campo de vinculo al work item en el encabezado de los documentos.');
} else {
  const provider = pm.provider;
  const providerRef = { 'azure-devops': 'alm/azure-devops.md' }[provider];

  console.log('Integracion con gestor de proyectos: **ACTIVADA**.');
  console.log('- provider = ' + provider);
  console.log('- host = ' + pm.host);
  console.log('- workspace = ' + pm.workspace + '  (organizacion o subdominio)');
  console.log('- project = ' + pm.project + '  (clave del proyecto en Jira; nombre del proyecto en Azure DevOps)');

  if (providerRef) {
    console.log('');
    console.log('**Ahora DEBES leer la referencia del proveedor: ' + providerRef + '** (relativa a reference/), y seguir unicamente sus pasos.');
    console.log('Estos cuatro valores son la unica fuente de conexion: no preguntarlos al usuario ni inferirlos del MCP.');
  } else {
    console.log('');
    console.log('**No hay referencia para ese provider en reference/alm/.** Informar al usuario y continuar con ID secuencial local; no improvisar la integracion.');
  }
}
"
```

> **De dónde sale la configuración.** El bloque `projectManagement` de `.sdd-devkit/settings.json` lo
> crea `arch-init` al inicializar el harness, desactivado (`"enabled": false`). Activarlo es una
> decisión del equipo: se edita el archivo a mano. **Ningún skill lo escribe ni ofrece escribirlo**, y
> ninguno pregunta por `host`, `workspace` o `project` si el archivo no existe — con la integración
> desactivada, la numeración local es el comportamiento correcto, no una degradación.

> **`enabled: true` no garantiza que el MCP esté conectado.** Es una declaración de intención del
> repositorio; la disponibilidad de la herramienta MCP se verifica aparte, en la referencia del
> proveedor, que también define cómo degradar cuando falta.

> **Modo delegado.** Cuando el skill se ejecuta invocado por otro skill (subagente), la configuración
> ya resuelta se le pasa en la delegación: en ese modo no se vuelve a resolver.
