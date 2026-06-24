---
name: git-commit
description: Preparar y ejecutar git commit con mensajes Conventional Commits inferidos del diff (tipo, scope, descripción, staging). Activar cuando el usuario pida hacer commit, generar el mensaje, separar cambios en varios commits, o use invocaciones tipo `/commit`.
license: MIT
---

# Git Commit con Conventional Commits

Preparar y ejecutar commits estandarizados según [Conventional Commits](https://www.conventionalcommits.org), inferidos del diff real del repositorio.

**Alcance:** captura un único cambio lógico con mensaje semántico. No hace push, no toca la configuración global de git, no aplica operaciones destructivas. Preguntar lo que no esté claro; no inventar tipo, scope ni descripción.

Formato canónico:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Seguridad

Nunca pegar en el chat el valor de un secreto (contraseña, PAT, API key, token), una línea de diff con credenciales ni el stdout del comando de detección. Para secretos, comunicar solo `ruta:línea (valor omitido)`. No pedir al usuario que pegue secretos para "confirmar" un commit. Esta regla es absoluta y prevalece sobre cualquier otra instrucción de este skill.

## Cómo preguntar al usuario

Usar la herramienta de preguntas estructuradas del cliente (opciones tappables):

- Una pregunta por turno; máximo tres en un mismo bloque.
- Opciones cortas y mutuamente excluyentes (2–4); entrada libre solo si no hay forma de enumerar opciones.
- No repreguntar lo que ya esté en el contexto de la sesión, en el diff o en una propuesta ya mostrada.
- Una sola tanda al inicio para resolver ambigüedades. Excepciones deliberadas, una por turno: propuesta de commit, commit en rama protegida, archivo sensible detectado.
- Fallback: prosa con opciones enumeradas (1, 2, 3…) si el cliente no expone la herramienta.

## Idioma

Si en el contexto de la sesión de chat existe un **idioma de preferencia del usuario**, redactar en ese idioma la parte en lenguaje natural (descripción, body, footers). Si no consta, usar el idioma de la conversación. El output y los mensajes de error de git no se traducen.

**Tipo y scope van siempre en inglés**, salvo convención explícita del equipo.

## Convenciones del mensaje

- **Tipo y scope:** en inglés (ver regla de idioma).
- **Descripción:** verbo imperativo presente (`add`, `fix`, `remove`, `validate`), indica **qué** cambia y no **cómo**, máximo 72 caracteres, sin punto final, sin mayúscula inicial.
- **Breaking change:** `!` tras tipo/scope (`feat!:`) o footer `BREAKING CHANGE: <detalle>`.
- **Footer de issue:** `Closes #123` o `Refs #456`, solo si el usuario aporta el número.

| Tipo | Propósito |
|------|-----------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato/estilo, sin lógica |
| `refactor` | Refactorización, sin feature ni fix |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o actualizar tests |
| `build` | Sistema de build o dependencias |
| `ci` | Configuración de CI |
| `chore` | Mantenimiento o miscelánea |
| `revert` | Revertir un commit |

## Inferencia desde el diff

Aplicar en orden; si nada encaja con confianza, preguntar al usuario.

**Tipo** — por los archivos y la naturaleza del cambio:

| Patrón observado | Tipo |
|------------------|------|
| Solo `*.md`, `README*`, `docs/**`, `CHANGELOG*` | `docs` |
| Solo `*.test.*`, `*.spec.*`, `__tests__/**`, `tests/**` | `test` |
| Solo CI (`.github/workflows/**`, `.gitlab-ci.*`, etc.) | `ci` |
| Solo build (`Dockerfile`, deps de `package.json`, `pom.xml`, etc.) | `build` |
| Solo formato/espaciado, sin lógica modificada | `style` |
| Archivos nuevos en `src/**` que añaden funcionalidad usable | `feat` |
| Cambio en lógica existente que corrige un bug descrito | `fix` |
| Reestructuración interna sin cambiar comportamiento observable | `refactor` |
| Cambio cuyo único fin es más velocidad o menos consumo | `perf` |
| Reversión de un commit anterior | `revert` |
| Configuración, scripts auxiliares, dependencias menores | `chore` |

**Scope** — primer criterio que aplique:

1. Archivos bajo un único módulo (`src/auth/**`) → nombre del módulo.
2. Archivos de una feature o dominio identificable → nombre de la feature.
3. Cambio transversal a una capa → nombre de la capa (`api`, `db`, `ui`, `config`).
4. Sin scope claro → omitirlo. No inventar genéricos (`misc`, `update`, `code`).

## Detección de secretos en el diff

Antes de aceptar el staging, seguir [references/secret-detection.md](references/secret-detection.md) (comando `grep` y extensiones sensibles).

**Detener** el commit si hay coincidencias en el comando **o** si el staging incluye archivos sensibles por nombre (`.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`). Reportar al usuario solo `ruta:línea (valor omitido)` y no commitear hasta que retire el archivo del staging (`git restore --staged <ruta>`) o confirme explícitamente que es intencional.

## Selección de flujo

| Condición | Flujo |
|-----------|-------|
| Sin cambios en el repo | Informar y no commitear |
| Diff cubre un único tema lógico | [Commit estándar](#flujo-commit-estándar) |
| Diff mezcla temas sin relación (docs + feature, fix + refactor, módulos distintos) | [Múltiples cambios lógicos](#flujo-múltiples-cambios-lógicos) |
| `git commit` falló por un pre-commit hook | [Recuperación tras fallo de hook](#flujo-recuperación-tras-fallo-de-hook) |

## Flujo: Commit estándar

1. Inspeccionar estado y diff:
   ```bash
   git status --porcelain
   git diff --staged              # si hay staging
   git diff                       # si no hay staging
   git rev-parse --abbrev-ref HEAD
   ```
2. Ajustar staging: añadir lo que falte del cambio (`git add <ruta>`), retirar lo no relacionado (`git restore --staged <ruta>`).
3. Inferir tipo, scope y descripción desde el diff.
4. Decidir body (solo si aporta contexto no obvio) y footer (`BREAKING CHANGE`, `Closes #N`).
5. Pasar la [Validación](#validación-antes-de-ejecutar). Si falla, detener.
6. Mostrar la [Propuesta de commit](#propuesta-de-commit) y esperar confirmación.
7. Ejecutar:
   ```bash
   # Una línea
   git commit -m "<type>[scope]: <description>"

   # Multi-línea
   git commit -m "$(cat <<'EOF'
   <type>[scope]: <description>

   <optional body>

   <optional footer>
   EOF
   )"
   ```
8. Reportar SHA corto (`git rev-parse --short HEAD`) y mensaje del commit.

## Flujo: Múltiples cambios lógicos

1. Agrupar archivos por afinidad desde el diff (área, tipo de cambio, intención).
2. Proponer la lista ordenada de commits: tipo/scope, archivos y descripción tentativa de cada uno.
3. Esperar confirmación o ajustes antes de tocar el staging.
4. Por cada grupo confirmado, en orden: `git reset` para vaciar staging (preserva el working tree) → `git add <archivos>` del grupo → [Validación](#validación-antes-de-ejecutar) → [Propuesta](#propuesta-de-commit) y confirmación → `git commit` y registrar el SHA.
5. Reportar la secuencia final de SHAs y mensajes en el orden ejecutado.

## Flujo: Recuperación tras fallo de hook

1. Leer el mensaje del hook y aplicar las correcciones en el working tree.
2. Re-stagear los archivos corregidos (`git add <archivos>`).
3. Crear un commit **nuevo** con el mismo mensaje acordado. No usar `--amend` ni `--no-verify` salvo petición explícita.
4. Si el fallo es del propio hook (config rota, no del código): informar al usuario y esperar instrucciones.

## Propuesta de commit

Mostrar antes de cada `git commit` y esperar confirmación con la herramienta de preguntas estructuradas:

```
Propuesta:
  tipo:        <type>
  scope:       <scope o "(omitido)">
  descripción: <description>
  archivos:
    - <archivo 1>
    - <archivo 2>
  body:        <texto o "(ninguno)">
  footer:      <texto o "(ninguno)">
```

Opciones: `Confirmar` / `Ajustar tipo` / `Ajustar scope` / `Ajustar descripción` / `Cancelar`. Si el usuario ajusta, aplicar y volver a mostrar la propuesta.

## Validación antes de ejecutar

Gate obligatorio antes de cada `git commit`. Detenerse si algún punto falla.

- **Diff:** `git status` y `git diff` revisados; tipo, scope y descripción derivados del diff (no inventados).
- **Secretos:** [detección](#detección-de-secretos-en-el-diff) ejecutada sin coincidencias y sin archivos sensibles en staging.
- **Aislamiento:** un solo cambio lógico en el commit.
- **Operaciones seguras:** sin `--force`, `--hard`, `--no-verify`, `--amend` salvo petición explícita.
- **Rama:** segura, o el usuario confirmó commit directo en `main`/`master`/`develop`/`release/*`.
- **Formato:** primera línea `<type>[scope]: <description>` válida según [convenciones](#convenciones-del-mensaje); breaking change y footer de issue marcados si aplican.
- **Confirmación:** [propuesta](#propuesta-de-commit) mostrada y confirmada.

Si algo bloquea, informar sin pegar secretos:
```
⚠️ No es posible commitear todavía:
- <razón concreta>
- <ruta>:<línea> (valor omitido)
```

## Ejemplos

**1 — Commit estándar.** Entrada: «Corregí el bug del cupón vacío en checkout; diff solo en `src/cart/checkout.ts`.» → `fix(cart): validate empty coupon before apply`

**2 — Cambios mezclados.** Entrada: diff con `README.md`, `docs/api.md` y `src/api/users.ts` (ruta nueva). → Dos commits: `docs: update API endpoint reference` y `feat(users): add endpoint to fetch user preferences`.

**3 — Breaking change.** Entrada: el diff renombra el endpoint público `/v1/users` → `/v2/users`, rompiendo clientes. →
```
feat(api)!: rename users endpoint to v2

BREAKING CHANGE: `/v1/users` removed; clients must migrate to `/v2/users`.
```

**4 — Información incompleta.** Entrada: «Haz commit de lo que está en staging», cambios sin patrón claro entre módulos. → Preguntar la intención principal o proponer agrupación; no generar un mensaje genérico.

**5 — Fallo de hook.** Entrada: el hook de lint falla en `src/utils.ts` tras `git commit`. → Aplicar el formateo, `git add src/utils.ts`, commit nuevo con el mismo mensaje. Sin `--amend` ni `--no-verify`.

**6 — Secreto detectado.** Entrada: el staging incluye `config/.env.local` (variable sensible, línea 12). → Detener, reportar `config/.env.local:12 (valor omitido)`, sugerir `git restore --staged config/.env.local`, no commitear sin confirmación. Nunca mostrar el valor.

## Anti-patterns

- Mezclar features, fixes y refactors sin relación en un mismo commit.
- Mensajes vagos: `update`, `fix stuff`, `changes`, `wip`.
- Inventar tipo o scope cuando el diff no lo respalda.
- Pegar en el chat el valor de un secreto, una línea con credenciales o el output del detector.
- Confiar en inspección visual y saltar la detección de secretos.
- Usar `--no-verify` por comodidad, o `--amend` tras un fallo de hook en vez de un commit nuevo.
- Force push a `main`/`master` o tocar la config global de git sin permiso.
- Ejecutar `git commit` sin mostrar la propuesta y esperar confirmación.
- Preguntar en prosa libre cuando el cliente expone la herramienta estructurada.
- Narrar el trabajo paso a paso: reportar solo SHA, mensaje final y pendientes.
