#!/usr/bin/env sh
# =============================================================================
# verify.sh — Agrupador de fitness functions de arquitectura
# -----------------------------------------------------------------------------
# Ejecuta TODAS las validaciones de arquitectura (fitness functions) del proyecto.
# Cada fitness function individual verifica un CRITERIO de cumplimiento (CR) de un
# estándar de dominio (docs/standards/) y vive como un script ejecutable en el directorio
# hermano `checks/`, con el nombre `<estándar>-CR-XXX.sh` (p. ej. testing-CR-001.sh).
#
# Enfoque del CR (columna `Enfoque` del estándar):
#   - `bloqueante` (por defecto): wrapper `<estándar>-CR-XXX.sh`. Si falla, el gate falla (exit 1).
#   - `warning`: wrapper `<estándar>-CR-XXX.warn.sh`. Si falla, se reporta como WARN pero NO
#     cambia el código de salida del agrupador.
#
# Este agrupador NO se edita al añadir una nueva fitness function: descubre y
# ejecuta automáticamente cada `checks/*.sh`. Para registrar una validación
# nueva, basta con dejar su wrapper en `checks/` (lo hace el skill `arch-manage`).
#
# Par de Windows: verify.ps1 (mismo directorio), que descubre y ejecuta checks/*.ps1
# con el mismo contrato. Los dos agrupadores siempre existen juntos en el proyecto.
#
# Contrato:
#   - Corre cada check, imprime PASS/FAIL/WARN por criterio (CR) y un resumen final.
#   - Sale con código 0 salvo que falle algún CR BLOQUEANTE; los CR `warning` que fallan
#     se reportan como WARN sin cambiar el código de salida. Apto como gate de CI o local.
#
# Uso:   sh scripts/arch/verify.sh
#        (o `npm run arch` / target equivalente si el repo lo cablea)
# =============================================================================
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECKS_DIR="$SCRIPT_DIR/checks"

total=0
passed=0
failed=0        # CR bloqueantes que fallaron (afectan el código de salida)
warned=0        # CR warning que fallaron (no afectan el código de salida)
failed_names=""
warned_names=""

if [ ! -d "$CHECKS_DIR" ]; then
  echo "No existe el directorio de checks: $CHECKS_DIR"
  echo "Aún no hay fitness functions de arquitectura registradas."
  exit 0
fi

# Evitar que el glob quede literal si no hay coincidencias.
found_any=0
for check in "$CHECKS_DIR"/*.sh; do
  [ -e "$check" ] || continue
  found_any=1
  name="$(basename "$check" .sh)"
  total=$((total + 1))

  # El Enfoque se deriva del sufijo del nombre: `*.warn.sh` => warning; el resto => bloqueante.
  enfoque="bloqueante"
  case "$check" in
    *.warn.sh) enfoque="warning" ;;
  esac

  printf '\n=== %s (%s) ===\n' "$name" "$enfoque"
  # Se ejecuta con `sh` para no depender del bit de ejecución.
  if sh "$check"; then
    passed=$((passed + 1))
    printf 'PASS: %s\n' "$name"
  elif [ "$enfoque" = "warning" ]; then
    warned=$((warned + 1))
    warned_names="$warned_names $name"
    printf 'WARN: %s\n' "$name"
  else
    failed=$((failed + 1))
    failed_names="$failed_names $name"
    printf 'FAIL: %s\n' "$name"
  fi
done

if [ "$found_any" -eq 0 ]; then
  echo "No hay fitness functions de arquitectura registradas en $CHECKS_DIR."
  exit 0
fi

printf '\n----- Resumen de validaciones de arquitectura -----\n'
printf 'Total: %s   PASS: %s   WARN: %s   FAIL: %s\n' "$total" "$passed" "$warned" "$failed"
if [ "$warned" -gt 0 ]; then
  printf 'Warnings (no bloquean):%s\n' "$warned_names"
fi
if [ "$failed" -gt 0 ]; then
  printf 'Fallaron (bloqueantes):%s\n' "$failed_names"
  exit 1
fi
printf 'Todas las validaciones de arquitectura bloqueantes pasaron.\n'
exit 0
