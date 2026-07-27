# =============================================================================
# verify.ps1 — Agrupador de fitness functions de arquitectura (Windows)
# -----------------------------------------------------------------------------
# Par de Windows/PowerShell de verify.sh (mismo directorio), con el MISMO contrato.
# Ejecuta TODAS las validaciones de arquitectura (fitness functions) del proyecto.
# Cada fitness function individual verifica un CRITERIO de cumplimiento (CR) de un
# estándar de dominio (docs/standards/) y vive como un script ejecutable en el directorio
# hermano `checks/`, con el nombre `<estándar>-CR-XXX.ps1` (p. ej. testing-CR-001.ps1).
#
# Enfoque del CR (columna `Enfoque` del estándar):
#   - `bloqueante` (por defecto): wrapper `<estándar>-CR-XXX.ps1`. Si falla, el gate falla (exit 1).
#   - `warning`: wrapper `<estándar>-CR-XXX.warn.ps1`. Si falla, se reporta como WARN pero NO
#     cambia el código de salida del agrupador.
#
# Este agrupador NO se edita al añadir una nueva fitness function: descubre y
# ejecuta automáticamente cada `checks/*.ps1`. Para registrar una validación
# nueva, basta con dejar su wrapper en `checks/` (lo hace el skill `arch-manage`,
# junto a su pareja `.sh` para macOS/Linux).
#
# Contrato (idéntico al de verify.sh):
#   - Corre cada check, imprime PASS/FAIL/WARN por criterio (CR) y un resumen final.
#   - Sale con código 0 salvo que falle algún CR BLOQUEANTE; los CR `warning` que fallan
#     se reportan como WARN sin cambiar el código de salida. Apto como gate de CI o local.
#
# Uso:   powershell -File scripts/arch/verify.ps1
#        (o, con PowerShell 7+:  pwsh scripts/arch/verify.ps1)
#        (o `npm run arch:win` / target equivalente si el repo lo cablea)
#
# Nota de implementación: cada check se ejecuta como PROCESO HIJO (spawneando
# powershell/pwsh -File), nunca con el operador `&` dentro de este mismo proceso.
# Si un wrapper llama a `exit`, un `&` en el mismo proceso tumbaría este agrupador
# entero a mitad de la corrida; como proceso hijo, `exit` solo termina el check.
# Es el equivalente de `sh "$check"` en verify.sh (que también aísla cada check
# en su propio proceso).
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ChecksDir = Join-Path $ScriptDir 'checks'

# Mismo host que está corriendo este agrupador (pwsh en PowerShell 7+, powershell
# en Windows PowerShell 5.1), para invocar cada check como proceso hijo real.
$ShellExe = if ($PSVersionTable.PSEdition -eq 'Core') { 'pwsh' } else { 'powershell' }

$total = 0
$passed = 0
$failed = 0          # CR bloqueantes que fallaron (afectan el código de salida)
$warned = 0           # CR warning que fallaron (no afectan el código de salida)
$failedNames = @()
$warnedNames = @()

if (-not (Test-Path -LiteralPath $ChecksDir -PathType Container)) {
    Write-Output "No existe el directorio de checks: $ChecksDir"
    Write-Output "Aun no hay fitness functions de arquitectura registradas."
    exit 0
}

$checks = @(Get-ChildItem -LiteralPath $ChecksDir -Filter '*.ps1' -File -ErrorAction SilentlyContinue | Sort-Object Name)

if ($checks.Count -eq 0) {
    Write-Output "No hay fitness functions de arquitectura registradas en $ChecksDir."
    exit 0
}

foreach ($check in $checks) {
    # El Enfoque se deriva del sufijo del nombre: `*.warn.ps1` => warning; el resto => bloqueante.
    $name = $check.BaseName
    $total++

    $enfoque = 'bloqueante'
    if ($check.Name -like '*.warn.ps1') {
        $enfoque = 'warning'
    }

    Write-Output ''
    Write-Output "=== $name ($enfoque) ==="

    # Proceso hijo real (ver nota de implementación arriba): `exit` dentro del check
    # solo termina este proceso hijo, no el agrupador.
    & $ShellExe -NoProfile -ExecutionPolicy Bypass -File $check.FullName
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        $passed++
        Write-Output "PASS: $name"
    } elseif ($enfoque -eq 'warning') {
        $warned++
        $warnedNames += $name
        Write-Output "WARN: $name"
    } else {
        $failed++
        $failedNames += $name
        Write-Output "FAIL: $name"
    }
}

Write-Output ''
Write-Output '----- Resumen de validaciones de arquitectura -----'
Write-Output "Total: $total   PASS: $passed   WARN: $warned   FAIL: $failed"

if ($warned -gt 0) {
    Write-Output "Warnings (no bloquean): $($warnedNames -join ' ')"
}

if ($failed -gt 0) {
    Write-Output "Fallaron (bloqueantes): $($failedNames -join ' ')"
    exit 1
}

Write-Output 'Todas las validaciones de arquitectura bloqueantes pasaron.'
exit 0
