# Azure DevOps MCP — Windows + Cursor

Pasos para que Cursor reciba cada `ADO_PAT_{ALIAS}` de forma persistente tras reiniciar el equipo.

## Requisitos

- Node.js 20+
- Windows 10/11
- PowerShell 5.1+ o PowerShell 7+
- PAT ya creado en Azure DevOps

---

## Por cada cuenta ADO

Repetir estos pasos una vez por cada par organización+correo. Sustituir `{ALIAS}` por el alias calculado (ej. `BAYTEQDEV_JUAN`).

### Paso 1 — Codificar el PAT

En **PowerShell**, sustituir `PAT_EN_CRUDO`:

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(":PAT_EN_CRUDO"))
```

Copiar la salida base64. **No** guardar el PAT crudo en archivos de texto.

### Paso 2 — Guardar como variable de usuario persistente

```powershell
$base64Pat = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(":PAT_EN_CRUDO"))
[System.Environment]::SetEnvironmentVariable("ADO_PAT_{ALIAS}", $base64Pat, "User")
```

Verificar:

```powershell
[Environment]::GetEnvironmentVariable("ADO_PAT_{ALIAS}", "User").Length  # debe ser > 0
```

> Las variables de usuario en Windows persisten en el registro y son heredadas por Cursor al abrirse después de cerrar y reabrir sesión. No se necesita paso adicional para apps gráficas (a diferencia de macOS).

### Paso 3 — Perfil de PowerShell (opcional, para terminales)

Para que nuevas ventanas de PowerShell también tengan la variable disponible:

```powershell
# Crear perfil si no existe
if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -ItemType File -Force }
```

Añadir a `$PROFILE`:

```powershell
$env:ADO_PAT_{ALIAS} = [Environment]::GetEnvironmentVariable("ADO_PAT_{ALIAS}", "User")
```

---

## Reiniciar Cursor

1. Cerrar Cursor por completo (Archivo → Salir o desde bandeja).
2. Cerrar sesión de Windows y volver a entrar (o reiniciar el equipo) para que Cursor herede las variables de usuario actualizadas.
3. Reabrir Cursor.
4. **Settings → MCP** → cada servidor `ado-{org}-{user}` debe aparecer **Connected**.

> Si no se quiere cerrar sesión, lanzar Cursor desde una ventana de PowerShell donde se haya seteado `$env:ADO_PAT_{ALIAS}` manualmente (solo válido para esa sesión).

---

## Verificación API

```powershell
$pat = [Environment]::GetEnvironmentVariable("ADO_PAT_{ALIAS}", "User")
$headers = @{ Authorization = "Basic $pat" }
(Invoke-WebRequest -Uri "https://dev.azure.com/{ORG}/_apis/projects?api-version=7.1&`$top=1" -Headers $headers).StatusCode
```

Esperado: `200`.

---

## Desinstalar / rotar token

```powershell
# Eliminar la variable de usuario
[Environment]::SetEnvironmentVariable("ADO_PAT_{ALIAS}", $null, "User")

# Quitar línea de $PROFILE si se añadió
```

Revocar el PAT en: `https://dev.azure.com/{ORG}/_usersSettings/tokens` (con el usuario de esa cuenta).
