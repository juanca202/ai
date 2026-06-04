---
name: git-commit
description: Preparar y ejecutar git commit con mensajes Conventional Commits inferidos del diff (tipo, scope, descripción, staging). Activar cuando el usuario pida hacer commit, generar el mensaje, separar cambios en varios commits, o use invocaciones tipo `/commit`.
license: MIT
allowed-tools: Bash
---

# Skill: Git Commit con Conventional Commits

Preparar y ejecutar commits estandarizados según [Conventional Commits](https://www.conventionalcommits.org), inferidos del diff real del repositorio.

> **Alcance:** captura un único cambio lógico con mensaje semántico. No hace push, no toca configuración global de git, no aplica operaciones destructivas. Preguntar lo que no esté claro — no inventar tipo, scope ni descripción.

Formato canónico:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## Seguridad

- Este skill **nunca** debe pegar en el chat valores de contraseñas, PAT, API keys, tokens ni líneas de diff que contengan secretos.
- La detección de secretos sirve para **bloquear** commits; al informar al usuario, usar solo **ruta** y **número de línea** (ver [Detección de secretos](#detección-de-secretos-en-el-diff)).
- No pedir al usuario que pegue secretos en el chat para “confirmar” el commit.

---

## Cómo preguntar al usuario

Usar la **herramienta de preguntas estructuradas** del cliente (opciones tappables). Reglas:

- Una pregunta por turno; máximo tres en un mismo bloque.
- Opciones cortas y mutuamente excluyentes (2–4); entrada libre solo si no hay forma de enumerar opciones.
- No repreguntar lo que ya está en el contexto, `.agents/MEMORY.md`, el diff o la propuesta ya mostrada.
- Una sola tanda al inicio para resolver ambigüedades; excepciones deliberadas por turno: propuesta de commit, commit en rama protegida, archivo sensible detectado.
- Fallback: prosa con opciones enumeradas (1, 2, 3…) si el cliente no expone la herramienta.

---

## Resolución de idioma

1. `preferred language` en `.agents/MEMORY.md` (claves legacy `language:`, `idioma:`, `Project language:` como fallback).
2. Idioma del turno del usuario.
3. Preguntar y persistir en `.agents/MEMORY.md`.

Afecta a la parte en lenguaje natural (descripción, body, footers). **Tipo y scope** permanecen en inglés salvo acuerdo explícito del equipo.

---

## Selección de flujo

| Condición | Flujo |
|-----------|-------|
| Sin cambios en el repo | Informar al usuario y no commitear |
| Diff cubre un único tema lógico | [Flujo: Commit estándar](#flujo-commit-estándar) |
| Diff mezcla temas (docs + feature, fix + refactor, módulos sin relación) | [Flujo: Múltiples cambios lógicos](#flujo-múltiples-cambios-lógicos) |
| `git commit` ya falló por un pre-commit hook | [Flujo: Recuperación tras fallo de hook](#flujo-recuperación-tras-fallo-de-hook) |

---

## Convenciones del mensaje

- **Tipo y scope:** palabras clave en inglés salvo convención explícita del equipo.
- **Descripción:** verbo imperativo presente, máximo 72 caracteres, sin punto final, sin mayúscula inicial.
- **Breaking change:** `!` tras tipo/scope (`feat!:`) o footer `BREAKING CHANGE: <detalle>`.
- **Referencias a issues:** footer `Closes #123` o `Refs #456` cuando el usuario aporte el número.

### Tipos de commit

| Tipo | Propósito |
|------|-----------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Formato/estilo (sin lógica) |
| `refactor` | Refactorización (sin feature/fix) |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o actualizar tests |
| `build` | Sistema de build / dependencias |
| `ci` | Cambios en CI / configuración |
| `chore` | Mantenimiento / miscelánea |
| `revert` | Revertir commit |

---

## Inferencia desde el diff

Aplicar en orden; si nada encaja con confianza, preguntar al usuario.

### Tipo

| Patrón observado | Tipo |
|------------------|------|
| Solo `*.md`, `README*`, `docs/**`, `CHANGELOG*` | `docs` |
| Solo `*.test.*`, `*.spec.*`, `__tests__/**`, `tests/**` | `test` |
| Solo archivos de CI (`.github/workflows/**`, `.gitlab-ci.*`, etc.) | `ci` |
| Solo archivos de build (`Dockerfile`, deps de `package.json`, `pom.xml`, etc.) | `build` |
| Solo cambios de formato/espaciado sin lógica modificada | `style` |
| Archivos nuevos bajo `src/**` que añaden funcionalidad usable por el cliente | `feat` |
| Modificación de lógica existente que corrige un comportamiento descrito como bug | `fix` |
| Reestructuración interna sin cambiar comportamiento observable | `refactor` |
| Cambios cuyo único objetivo es ejecución más rápida o menor consumo | `perf` |
| Reversión de un commit anterior | `revert` |
| Configuración, scripts auxiliares, dependencias menores | `chore` |

### Scope

1. Todos los archivos bajo un único módulo (`src/auth/**`) → scope = nombre del módulo.
2. Todos bajo una feature o dominio identificable → scope = nombre de la feature.
3. Cambio transversal a una capa (`api`, `db`, `ui`, `config`) → scope = nombre de la capa.
4. Sin scope claro → omitirlo. No inventar genéricos (`misc`, `update`, `code`).

### Descripción

Verbo imperativo presente (`add`, `fix`, `remove`, `validate`, `prevent`). Indicar **qué** cambia, no **cómo** se implementó. Máximo 72 caracteres. Sin punto final. Sin mayúscula inicial.

---

## Detección de secretos en el diff

Antes de aceptar el staging, seguir [references/secret-detection.md](references/secret-detection.md) (comando `grep` y lista de extensiones sensibles).

Si hay coincidencias en el comando, **o** si el staging incluye archivos sensibles por nombre (`.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`, etc.): **detener** y reportar al usuario **solo** `ruta:línea` con la aclaración `(valor omitido)` — sin citar el contenido de la línea ni el stdout del comando. No commitear hasta que el usuario retire el archivo del staging (`git restore --staged <ruta>`) o confirme explícitamente que es intencional.

---

## Flujo: Commit estándar

1. Inspeccionar estado y diff:
   ```bash
   git status --porcelain
   git diff --staged   # si hay staging
   git diff            # si no hay staging
   git rev-parse --abbrev-ref HEAD
   ```
2. Ajustar staging: añadir archivos faltantes del cambio (`git add <ruta>`); retirar no relacionados (`git restore --staged <ruta>`).
3. Inferir tipo, scope y descripción desde el diff.
4. Decidir body (solo si aporta contexto no obvio) y footer (`BREAKING CHANGE`, `Closes #N`).
5. Ejecutar [Validación antes de ejecutar](#validación-antes-de-ejecutar). Si falla, detener.
6. Mostrar [Propuesta de commit](#propuesta-de-commit) y esperar confirmación.
7. Ejecutar el commit:
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
8. Reportar SHA corto (`git rev-parse --short HEAD`) y mensaje del commit creado.

---

## Flujo: Múltiples cambios lógicos

1. Agrupar archivos por afinidad desde el diff (área, tipo de cambio, intención).
2. Proponer al usuario la lista ordenada de commits planeados: tipo/scope, archivos, descripción tentativa.
3. Esperar confirmación o ajustes antes de tocar staging.
4. Por cada grupo confirmado, en orden:
   1. `git reset` (preserva el working tree) para vaciar staging.
   2. `git add <archivos>` del grupo.
   3. Ejecutar [Validación antes de ejecutar](#validación-antes-de-ejecutar).
   4. Mostrar [Propuesta de commit](#propuesta-de-commit) y esperar confirmación.
   5. `git commit -m "..."` y registrar el SHA.
5. Reportar la secuencia final de SHAs y mensajes en el orden ejecutado.

---

## Flujo: Recuperación tras fallo de hook

1. Leer el mensaje del hook; aplicar las correcciones en el working tree.
2. Re-stagear los archivos corregidos: `git add <archivos>`.
3. Crear un commit nuevo con el mismo mensaje acordado — no `--amend` salvo petición explícita.
4. No usar `--no-verify` salvo petición explícita.
5. Si el problema es del propio hook (config rota, no del código): informar al usuario y esperar instrucciones.

---

## Propuesta de commit

Mostrar antes de ejecutar `git commit` y esperar confirmación mediante la herramienta de preguntas estructuradas:

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

---

## Validación antes de ejecutar

- Sin secretos en staging (ejecutar [Detección de secretos](#detección-de-secretos-en-el-diff)).
- Un solo cambio lógico por commit.
- Sin `--force`, `--hard`, `--no-verify`, `--amend` salvo petición explícita.
- Rama segura, o usuario confirmó commit directo en `main`/`master`/`develop`/`release/*`.

Si hay conflicto:
```
⚠️ No es posible commitear todavía:
- <razón concreta>
- <ruta>:<línea> (valor omitido) — sin pegar secretos
```

---

## Checklist antes de ejecutar `git commit`

**Información:**
- [ ] `git status` y `git diff` revisados completos
- [ ] Tipo, scope y descripción derivados del diff, no inventados
- [ ] Rama actual conocida
- [ ] Idioma de preferencia determinado
- [ ] Intención clara: un commit único vs. separación en varios

**Validación:**
- [ ] Detección de secretos ejecutada sin coincidencias
- [ ] Un solo cambio lógico por commit
- [ ] Sin `--force`, `--hard`, `--no-verify`, `--amend` salvo petición explícita
- [ ] Rama segura o usuario confirmó

**Formato:**
- [ ] Primera línea `<type>[scope]: <description>` válida
- [ ] Descripción: imperativo presente, máximo 72 chars, sin punto, sin mayúscula inicial
- [ ] Body separado por línea en blanco si existe
- [ ] Breaking change marcado correctamente si aplica
- [ ] Referencia a issue si el usuario la aportó

**Confirmación:**
- [ ] Propuesta mostrada y confirmación recibida

---

## Ejemplos

**Ejemplo 1 — Commit estándar**
- *Entrada:* «Acabo de corregir el bug del cupón vacío en el checkout; diff solo en `src/cart/checkout.ts`.»
- *Salida:* `git commit -m "fix(cart): validate empty coupon before apply"`

**Ejemplo 2 — Cambios mezclados**
- *Entrada:* Diff incluye `README.md`, `docs/api.md` y `src/api/users.ts` con una ruta nueva.
- *Salida:* Dos commits: `docs: update API endpoint reference` y `feat(users): add endpoint to fetch user preferences`.

**Ejemplo 3 — Breaking change**
- *Entrada:* Diff renombra endpoint público `/v1/users` → `/v2/users` rompiendo clientes existentes.
- *Salida:*
  ```
  feat(api)!: rename users endpoint to v2

  BREAKING CHANGE: `/v1/users` removed; clients must migrate to `/v2/users`.
  ```

**Ejemplo 4 — Información incompleta**
- *Entrada:* «Haz commit de lo que está en staging.» Cambios cruzan varios módulos sin patrón claro.
- *Comportamiento:* Preguntar la intención principal o proponer agrupación. No generar mensaje genérico.

**Ejemplo 5 — Fallo de hook**
- *Entrada:* Hook de lint falla en `src/utils.ts` tras `git commit`.
- *Comportamiento:* Aplicar el formateo, `git add src/utils.ts`, commit nuevo con el mismo mensaje. Sin `--amend` ni `--no-verify`.

**Ejemplo 6 — Secreto detectado**
- *Entrada:* Diff staged incluye `config/.env.local` (variable de entorno sensible, línea 12).
- *Comportamiento:* Detener, reportar `config/.env.local:12 (valor omitido)`. Sugerir `git restore --staged config/.env.local`. No commitear sin confirmación explícita. No mostrar el valor de la variable en el chat.

---

## Anti-patterns

- Commit que mezcla features, fixes y refactors sin relación.
- Mensajes vagos (`update`, `fix stuff`, `changes`, `wip`).
- Inventar tipo o scope cuando el diff no lo respalda.
- Incluir archivos sensibles (`.env`, claves) sin detección y confirmación.
- Mostrar en el chat el valor de un secreto, una línea de diff con credenciales o el output del comando de detección.
- Saltar la detección de secretos confiando en inspección visual.
- Saltar hooks con `--no-verify` por comodidad.
- Usar `--amend` tras fallo de hook en lugar de crear un commit nuevo.
- Force push a `main` / `master`.
- Modificar configuración global de git sin permiso explícito.
- Ejecutar `git commit` sin mostrar la propuesta y esperar confirmación.
- Lanzar preguntas como prosa libre cuando el cliente expone la herramienta estructurada.
- Narrar el trabajo al usuario — reportar solo SHA, mensaje final y pendientes.