# Azure DevOps MCP — macOS + Cursor

Pasos para que Cursor (abierto desde Dock o Spotlight) reciba cada `ADO_PAT_{ALIAS}` de forma persistente.

## Requisitos

- Node.js 20+
- macOS con `zsh` (predeterminado)
- PAT ya creado en Azure DevOps

---

## Por cada cuenta ADO

Repetir estos pasos una vez por cada par organización+correo. Sustituir `{ALIAS}` por el alias calculado (ej. `FABRIKAM_MARIA`).

### Paso 1 — Codificar y guardar en Keychain (usuario)

El agente **muestra solo este paso** al usuario y espera confirmación antes de continuar. **No** mostrar comandos de codificación aparte ni pasos de verificación.

**Primera vez:**

```bash
security add-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" \
  -w "$(echo -n ':PAT_EN_CRUDO' | base64)" -U
```

**Rotar token existente:**

```bash
security delete-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" 2>/dev/null
security add-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" \
  -w "$(echo -n ':PAT_EN_CRUDO' | base64)" -U
```

> Sustituir `:PAT_EN_CRUDO` por el token tal como lo copió de Azure DevOps (incluyendo los dos puntos iniciales en el comando). El PAT **no** debe pegarse en el chat.

---

### Pasos 2 y 3 — Automáticos (agente)

Tras la confirmación del usuario, el agente **ejecuta** estos pasos sin pedir intervención adicional. Antes de continuar, el agente **verifica** internamente que el Keychain responde (ver sección «Verificación del agente»).

#### Paso 2 — Exportar en `~/.zshrc`

Añadir al final de `~/.zshrc` (si la línea no existe ya):

```bash
# Azure DevOps PAT para Cursor MCP — {ALIAS}
export ADO_PAT_{ALIAS}=$(security find-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" -w 2>/dev/null)
```

Aplicar en la sesión actual:

```bash
source ~/.zshrc
```

#### Paso 3 — LaunchAgent (necesario para Cursor como app gráfica)

Cursor no hereda variables de `~/.zshrc` cuando se abre desde el Dock o Spotlight. El LaunchAgent inyecta cada variable en el entorno de usuario al iniciar sesión.

Crear `~/Library/LaunchAgents/setenv.ado-{alias_lower}.plist` (un archivo por alias):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>setenv.ado-{alias_lower}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-c</string>
    <string>launchctl setenv ADO_PAT_{ALIAS} "$(security find-generic-password -a $USER -s ADO_PAT_{ALIAS} -w 2>/dev/null)"</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
```

> Ejemplo: alias `FABRIKAM_MARIA` → archivo `setenv.ado-fabrikam-maria.plist`, label `setenv.ado-fabrikam-maria`.

Activar sin reiniciar:

```bash
launchctl load ~/Library/LaunchAgents/setenv.ado-{alias_lower}.plist
launchctl setenv ADO_PAT_{ALIAS} "$(security find-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" -w)"
```

---

## Verificación del agente

El agente ejecuta estas comprobaciones **antes** de pedir reiniciar Cursor. **No** mostrar estos comandos al usuario salvo que falle algo y haga falta diagnosticar.

```bash
# Keychain accesible
security find-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" -w 2>/dev/null | wc -c   # > 0

# Variable en shell
echo ${#ADO_PAT_{ALIAS}}   # > 0

# LaunchAgent activo
launchctl getenv ADO_PAT_{ALIAS} | wc -c   # > 0

# API Azure DevOps
VAR="ADO_PAT_{ALIAS}"
PAT_B64="${!VAR:-$(security find-generic-password -a "$USER" -s "$VAR" -w 2>/dev/null)}"
curl -s -o /dev/null -w "HTTP %{http_code}\n" \
  -H "Authorization: Basic $PAT_B64" \
  "https://dev.azure.com/{ORG}/_apis/projects?api-version=7.1&\$top=1"
# Esperado: HTTP 200
```

Si alguna comprobación falla, el agente diagnostica y corrige antes de continuar.

---

## Reiniciar Cursor

1. Cerrar con **Cmd+Q** (no solo la ventana).
2. Reabrir Cursor.
3. **Settings → MCP** → cada servidor `ado-{org}-{user}` debe aparecer **Connected**.

---

## Desinstalar / rotar token

```bash
# Descargar y eliminar el LaunchAgent de esa cuenta
launchctl unload ~/Library/LaunchAgents/setenv.ado-{alias_lower}.plist 2>/dev/null
rm ~/Library/LaunchAgents/setenv.ado-{alias_lower}.plist

# Eliminar del Keychain
security delete-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}"

# Quitar la línea correspondiente de ~/.zshrc manualmente
```

Revocar el PAT en: `https://dev.azure.com/{ORG}/_usersSettings/tokens` (con el usuario de esa cuenta).
