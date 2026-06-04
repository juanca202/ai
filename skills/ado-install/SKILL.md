---
name: ado-install
description: Configura el MCP local de Azure DevOps (@azure-devops/mcp) en Cursor con autenticación PAT. Pregunta la organización y el correo del usuario ADO, genera mcp.json con soporte multi-cuenta, guía almacenamiento seguro del token (Keychain en macOS, variable de usuario en Windows) y verifica la conexión. Usar cuando el usuario pida instalar, configurar o reparar el MCP de Azure DevOps, ADO MCP, dev.azure.com, PAT, o conexión a work items/repos desde Cursor. También activar cuando el usuario quiera agregar una segunda organización, cuenta adicional o usuario distinto al MCP de ADO ya instalado.
---

# ADO Install — MCP de Azure DevOps en Cursor

Configura el **servidor MCP local** (`npx @azure-devops/mcp`). **No** uses el servidor remoto (`mcp.dev.azure.com`): Cursor no soporta su OAuth con Entra ID.

Cada entrada en `mcp.json` está ligada a un par **organización + correo de usuario**. Esto permite tener varias cuentas activas al mismo tiempo, cada una con su propio PAT.

## Flujo del agente

1. **Preguntar la organización** de Azure DevOps (ej. `Fabrikam`). Solo el nombre, sin URL completa.
2. **Preguntar el correo** del usuario ADO asociado a esa organización (ej. `juan@empresa.com`). Se usa para nombrar la variable de entorno y la entrada del servidor de forma única.
3. **Detectar SO**: macOS → [macos.md](references/macos.md); Windows → [windows.md](references/windows.md).
4. **Calcular el alias** de la cuenta: `{ORG}_{ALIAS}` donde `ALIAS` es la parte del correo antes del `@`, en mayúsculas y sin caracteres especiales (ej. `FABRIKAM_MARIA`). Este alias se usa en el nombre del servidor MCP y en la variable de entorno.
5. **Indicar al usuario** que cree el PAT en Azure DevOps (con ese usuario) antes de continuar.
6. **Leer el `.cursor/mcp.json` existente** si ya hay uno, para agregar la nueva entrada sin borrar las configuraciones previas.
7. **Escribir o actualizar** `.cursor/mcp.json` con la nueva entrada (plantilla abajo).
8. **Mostrar al usuario únicamente** el Paso 1 de la guía del SO (codificar y guardar: Keychain en macOS, variable de usuario en Windows). El agente **no** debe pedir ni almacenar el PAT en el chat. **Esperar confirmación** de que el usuario completó ese paso.
9. **Automáticamente**, tras la confirmación, ejecutar los pasos del agente de la guía del SO:
   - **macOS:** export en `~/.zshrc` + LaunchAgent (Dock/Spotlight).
   - **Windows:** línea en `$PROFILE` de PowerShell.
   No mostrar estos pasos al usuario salvo que falle algo y haga falta intervención manual.
10. **Verificar internamente** con los comandos de «Verificación del agente» en la guía del SO. El agente ejecuta las comprobaciones; **no** mostrarlas al usuario. Solo informar el resultado (éxito o error con diagnóstico).
11. Pedir **reinicio completo de Cursor** (Cmd+Q / cerrar app) tras configurar variables.

## Crear PAT (usuario)

El usuario debe hacer esto manualmente **con la cuenta de correo indicada**:

1. Iniciar sesión en Azure DevOps con ese correo.
2. Ir a `https://dev.azure.com/{ORG}/_usersSettings/tokens`
3. **New Token** → scopes mínimos según necesidad:
   - Work Items → Read (Write si creará/editará)
   - Code → Read
   - Build → Read (opcional)
4. Copiar el token **en crudo** (solo se muestra una vez).

## Codificación obligatoria

`@azure-devops/mcp` con `--authentication pat` exige `PERSONAL_ACCESS_TOKEN` como **base64 de `:PAT`** (no el PAT crudo):

```bash
# macOS / Linux / Git Bash
echo -n ":PAT_EN_CRUDO" | base64
```

```powershell
# Windows PowerShell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(":PAT_EN_CRUDO"))
```

El valor base64 resultante es lo que se guarda en `ADO_PAT_{ALIAS}`.

## Nomenclatura de alias

| Correo               | Org        | Alias          | Variable de env        | Clave servidor MCP  |
| -------------------- | ---------- | -------------- | ---------------------- | ------------------- |
| maria@fabrikam.com   | Fabrikam   | FABRIKAM_MARIA | ADO_PAT_FABRIKAM_MARIA | ado-fabrikam-maria  |
| carlos@cliente.com   | ClienteOrg | CLIENTEORG_CARLOS | ADO_PAT_CLIENTEORG_CARLOS | ado-clienteorg-carlos |

Reglas del alias:
- `{ORG en mayúsculas}_{PARTE_ANTES_DE_@_en_mayúsculas}`
- Reemplazar `-`, `.` y otros caracteres no alfanuméricos por `_`.

## Plantilla `.cursor/mcp.json` (multi-cuenta)

Cada cuenta es una entrada independiente. Cuando se agrega una segunda cuenta, **conservar** las entradas previas:

```json
{
  "mcpServers": {
    "ado-{ORG_LOWER}-{USER_ALIAS_LOWER}": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "{ORG}", "--authentication", "pat"],
      "env": {
        "PERSONAL_ACCESS_TOKEN": "${env:ADO_PAT_{ALIAS}}"
      }
    }
  }
}
```

**Ejemplo con dos cuentas:**

```json
{
  "mcpServers": {
    "ado-fabrikam-maria": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "Fabrikam", "--authentication", "pat"],
      "env": {
        "PERSONAL_ACCESS_TOKEN": "${env:ADO_PAT_FABRIKAM_MARIA}"
      }
    },
    "ado-clienteorg-carlos": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "ClienteOrg", "--authentication", "pat"],
      "env": {
        "PERSONAL_ACCESS_TOKEN": "${env:ADO_PAT_CLIENTEORG_CARLOS}"
      }
    }
  }
}
```

- No commitear secretos inline; usar siempre `${env:ADO_PAT_{ALIAS}}`.
- No ejecutar remoto y local a la vez.
- Cada servidor MCP aparecerá por separado en **Settings → MCP** de Cursor.

## Verificación

La verificación previa al reinicio la ejecuta el agente (ver «Verificación del agente» en [macos.md](references/macos.md) o [windows.md](references/windows.md)). **No** mostrar esos comandos al usuario.

Tras reiniciar Cursor, comprobar **Settings → MCP** → servidor `ado-{ORG_LOWER}-{USER_ALIAS_LOWER}` en verde.

**Prueba funcional en chat:** listar proyectos o work items de `{ORG}` usando el servidor `ado-{ORG_LOWER}-{USER_ALIAS_LOWER}`.

## Errores frecuentes

| Síntoma                                     | Causa                                     | Acción                                          |
| ------------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `PERSONAL_ACCESS_TOKEN is not set or empty` | Variable `ADO_PAT_{ALIAS}` no visible     | Verificar nombre exacto del alias y reiniciar   |
| HTTP 302 / sign-in                          | PAT crudo en lugar de base64              | Recodificar y volver a guardar                  |
| MCP remoto falla                            | Cursor + OAuth remoto                     | Usar solo MCP local                             |
| Funciona en terminal, no en Cursor          | App abierta sin env de usuario            | Ver guía del SO                                 |
| Segunda cuenta no aparece en MCP            | Entrada borrada al actualizar mcp.json    | Asegurarse de fusionar, no reemplazar           |

## Referencias por plataforma

- **macOS:** almacenamiento en Keychain + LaunchAgent + `.zshrc` → [macos.md](references/macos.md)
- **Windows:** variable de usuario persistente → [windows.md](references/windows.md)

> En ambas plataformas, repetir el proceso de almacenamiento por cada variable `ADO_PAT_{ALIAS}` que se agregue.

## Seguridad

- Nunca pegar el PAT en chat, commits ni `mcp.json`.
- Cada PAT está ligado a un correo específico; un PAT de una cuenta **no** funciona en otra organización distinta donde ese usuario no tiene acceso.
- Si se expone un PAT, revocar en `https://dev.azure.com/{ORG}/_usersSettings/tokens` con el usuario correspondiente y regenerar solo ese token.
- Al rotar un PAT, actualizar únicamente la variable `ADO_PAT_{ALIAS}` afectada; las demás cuentas no se ven afectadas.
