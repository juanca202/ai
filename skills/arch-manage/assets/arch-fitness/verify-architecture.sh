#!/usr/bin/env sh
# =============================================================================
# verify-architecture.sh — Agrupador de fitness functions de arquitectura
# -----------------------------------------------------------------------------
# Ejecuta TODAS las validaciones de arquitectura (fitness functions) del proyecto.
# Cada fitness function individual verifica un REQUISITO de un estándar de dominio
# (docs/standards/) y vive como un script ejecutable en el directorio hermano
# `checks/`, con el nombre `<estándar>-<requisito>.sh` (p. ej. testing-unit-testing.sh).
#
# Este agrupador NO se edita al añadir una nueva fitness function: descubre y
# ejecuta automáticamente cada `checks/*.sh`. Para registrar una validación
# nueva, basta con dejar su wrapper en `checks/` (lo hace el skill `arch-manage`).
#
# Contrato:
#   - Corre cada check, imprime PASS/FAIL por requisito y un resumen final.
#   - Sale con código 0 solo si TODAS pasan; distinto de 0 si alguna falla.
#     Apto para usarse como paso de CI o gate local.
#
# Uso:   sh scripts/arch/verify-architecture.sh
#        (o `npm run arch` / target equivalente si el repo lo cablea)
# =============================================================================
set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECKS_DIR="$SCRIPT_DIR/checks"

total=0
passed=0
failed=0
failed_names=""

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

  printf '\n=== %s ===\n' "$name"
  # Se ejecuta con `sh` para no depender del bit de ejecución.
  if sh "$check"; then
    passed=$((passed + 1))
    printf 'PASS: %s\n' "$name"
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
printf 'Total: %s   PASS: %s   FAIL: %s\n' "$total" "$passed" "$failed"
if [ "$failed" -gt 0 ]; then
  printf 'Fallaron:%s\n' "$failed_names"
  exit 1
fi
printf 'Todas las validaciones de arquitectura pasaron.\n'
exit 0
