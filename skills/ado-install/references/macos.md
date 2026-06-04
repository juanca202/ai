# Azure DevOps MCP — macOS + Cursor

Pasos para que Cursor (abierto desde Dock o Spotlight) reciba cada `ADO_PAT_{ALIAS}` de forma persistente.

## Requisitos

- Node.js 20+
- macOS con `zsh` (predeterminado)
- PAT ya creado en Azure DevOps

---

## Por cada cuenta ADO

Repetir estos pasos una vez por cada par organización+correo. Sustituir `{ALIAS}` por el alias calculado (ej. `BAYTEQDEV_JUAN`).

### Paso 1 — Codificar el PAT

```bash
echo -n ":PAT_EN_CRUDO" | base64
```

Copiar la salida. **No** guardar el PAT crudo.

### Paso 2 — Guardar en Keychain

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

Verificar (debe mostrar un número > 0, p. ej. ~117):

```bash
security find-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" -w 2>/dev/null | wc -c
```

### Paso 3 — Exportar en `~/.zshrc`

Añadir una línea por cada alias al final de `~/.zshrc`:

```bash
# Azure DevOps PAT para Cursor MCP — {ALIAS}
export ADO_PAT_{ALIAS}=$(security find-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" -w 2>/dev/null)
```

Aplicar en la terminal actual:

```bash
source ~/.zshrc
echo ${#ADO_PAT_{ALIAS}}   # debe ser > 0
```

### Paso 4 — LaunchAgent (necesario para Cursor como app gráfica)

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

> Ejemplo: alias `BAYTEQDEV_JUAN` → archivo `setenv.ado-bayteqdev-juan.plist`, label `setenv.ado-bayteqdev-juan`.

Activar sin reiniciar:

```bash
launchctl load ~/Library/LaunchAgents/setenv.ado-{alias_lower}.plist
launchctl setenv ADO_PAT_{ALIAS} "$(security find-generic-password -a "$USER" -s "ADO_PAT_{ALIAS}" -w)"
```

Verificar:

```bash
launchctl getenv ADO_PAT_{ALIAS} | wc -c   # debe ser > 0
```

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
