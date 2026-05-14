---
name: git-commit
description: Preparar y ejecutar git commit con mensajes Conventional Commits inferidos del diff (tipo, scope, descripción, staging). Activar cuando el usuario pida hacer commit, generar el mensaje, separar cambios en varios commits, o use invocaciones tipo `/commit`.
license: MIT
allowed-tools: Bash
---

# Skill: Git Commit con Conventional Commits

Preparar y ejecutar commits estandarizados según [Conventional Commits](https://www.conventionalcommits.org), inferidos del diff real del repositorio.

> **Alcance de un commit:** Un commit captura **un único cambio lógico** con un mensaje semántico (tipo, scope opcional, descripción; body/footer si procede). No empujar a remoto, no tocar la configuración global de git, no aplicar operaciones destructivas. Preguntar al usuario lo que no esté claro — no inventar tipo, scope ni descripción.

Formato canónico del mensaje:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## Selección de flujo

Antes de redactar el mensaje, elegir el flujo aplicable según el estado del repo:

| Condición | Flujo |
|-----------|-------|
| `git status` reporta sin cambios | Detener: informar al usuario y no commitear |
| El diff cubre un único tema lógico | [Flujo: Commit estándar](#flujo-commit-estándar-un-cambio-lógico) |
| El diff mezcla temas (docs + feature, fix + refactor, módulos sin relación) | [Flujo: Múltiples cambios lógicos mezclados](#flujo-múltiples-cambios-lógicos-mezclados) |
| `git commit` ya falló por un pre-commit hook | [Flujo: Recuperación tras fallo de hook](#flujo-recuperación-tras-fallo-de-hook) |

---

## Ubicación de archivos

| Artefacto | Ruta |
|-----------|------|
| Repositorio de trabajo | Directorio actual (`pwd`) |
| Preferencia de idioma | `docs/MEMORY.md` (raíz del repo) — línea `preferred language: <ISO 639-1>` |
| Archivos sensibles vetados en staging | `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`, archivos con credenciales o tokens |

---

## Convenciones del mensaje

- **Formato:** `<type>[scope]: <description>` en la primera línea; body y footers opcionales, separados por línea en blanco.
- **Tipo y scope:** palabras clave convencionales en inglés (`feat`, `fix`, `docs`, etc.) salvo convención explícita del equipo.
- **Descripción:** verbo en imperativo presente, **máximo 72 caracteres**, sin punto final, sin mayúscula inicial.
- **Cambios breaking:** `!` tras tipo/scope (`feat!:`) o footer `BREAKING CHANGE: <detalle>`.
- **Referencias a issues:** footer `Closes #123` o `Refs #456` cuando el usuario aporte el número.
- **Idioma del texto natural** (descripción, body, footers): resuelto por [Idioma del mensaje](#idioma-del-mensaje); tipo y scope permanecen en inglés.

---

## Inferencia desde el diff

Reglas concretas para deducir tipo, scope y descripción a partir del diff. Aplicar en orden; si nada encaja con confianza, preguntar al usuario.

### Tipo

Detectar el primer patrón que aplique en el diff:

| Patrón observado | Tipo |
|------------------|------|
| Solo `*.md`, `README*`, `docs/**`, `CHANGELOG*` | `docs` |
| Solo `*.test.*`, `*.spec.*`, `__tests__/**`, `tests/**` | `test` |
| Solo `.github/workflows/**`, `.gitlab-ci.*`, `.circleci/**`, `Jenkinsfile`, `azure-pipelines.*` | `ci` |
| Solo `Dockerfile`, `package.json` deps, `pom.xml`, `build.gradle`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pyproject.toml` | `build` |
| Solo cambios de formato, espaciado, comillas, sin lógica modificada | `style` |
| Archivos nuevos bajo `src/**` que añaden funcionalidad usable por el cliente | `feat` |
| Modificación de lógica existente que corrige un comportamiento descrito como bug | `fix` |
| Reestructuración interna sin cambiar comportamiento observable (mover, renombrar, extraer) | `refactor` |
| Cambios cuyo único objetivo es ejecución más rápida o menor consumo | `perf` |
| Reversión de un commit anterior (`git revert`) | `revert` |
| Configuración, scripts auxiliares, dependencias menores que no encajan arriba | `chore` |

Lista completa con propósito: [Tipos de commit (referencia)](#tipos-de-commit-referencia).

### Scope

Elegir el primer criterio que aplique:

1. Si todos los archivos cambian bajo un único módulo o paquete (`src/auth/**`, `internal/billing/**`): **scope = nombre de ese módulo** (`auth`, `billing`).
2. Si todos los archivos pertenecen a una feature o dominio identificable por nombre: **scope = nombre de la feature**.
3. Si el cambio cruza módulos pero corresponde a una capa transversal (`api`, `db`, `ui`, `config`): **scope = nombre de la capa**.
4. Si no hay un scope claro: **omitirlo**. No inventar uno genérico (`misc`, `update`, `code`).

### Descripción

- Verbo en imperativo presente (`add`, `fix`, `remove`, `rename`, `validate`, `prevent`). No usar pasado (`added`, `fixed`).
- Indicar **qué** cambia, no **cómo** se implementó. Bien: `fix(cart): validate empty coupon before apply`. Mal: `fix(cart): add if-check in validateCoupon`.
- Máximo 72 caracteres en la primera línea. Sin punto final. Sin mayúscula inicial.

### Detección de secretos en el diff

Ejecutar antes de aceptar el staging:

```bash
git diff --staged | grep -nEi 'password[[:space:]]*=|api[_-]?key|secret[[:space:]]*=|token[[:space:]]*=|BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|aws_access_key_id|aws_secret_access_key|-----BEGIN CERTIFICATE-----'
```

Si hay coincidencias, **o** si el staging incluye archivos con extensión `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`: **detener** y reportar al usuario los archivos y líneas detectadas. No commitear hasta que el usuario los retire (`git restore --staged <ruta>`) o confirme explícitamente que el archivo es intencionalmente público.

---

## Información requerida antes de commitear

Antes de redactar o ejecutar cualquier commit, el agente debe tener clara esta información. **No inventar nada** — si algún dato no es explícito, preguntar al usuario.

| Dato | Cómo obtenerlo | Si no está disponible |
|------|----------------|-----------------------|
| **Estado del repo** | `git status --porcelain` | Sin cambios: informar al usuario y detener |
| **Diff** | `git diff --staged` si hay staging; si no, `git diff` | Sin cambios reales: no hay nada que commitear |
| **Rama actual** | `git rev-parse --abbrev-ref HEAD` | — |
| **Tipo, scope, descripción** | Aplicar [Inferencia desde el diff](#inferencia-desde-el-diff) | Proponer y permitir override del usuario; si ninguna regla aplica, preguntar |
| **Agrupación de archivos** | Inferida del diff por afinidad lógica | Si hay temas mezclados, pasar a [Flujo: Múltiples cambios lógicos mezclados](#flujo-múltiples-cambios-lógicos-mezclados) |
| **Idioma de preferencia** | (1) idioma del turno actual; (2) `docs/MEMORY.md` → `preferred language: <ISO>` | Preguntar y persistir en `docs/MEMORY.md` con la línea `preferred language: <código>` |

> Leer el diff completo antes de redactar el mensaje. No describir cambios que no estén en el diff. No omitir cambios visibles que alteren el sentido del commit.

---

## Validación antes de ejecutar

Antes de ejecutar `git commit`, verificar las siguientes condiciones. Si alguna falla, **no commitear** — informar al usuario y resolver primero.

**¿Qué verificar?**
- **Sin secretos en staging:** ejecutar [Detección de secretos en el diff](#detección-de-secretos-en-el-diff). Si hay coincidencias, detener.
- **Un solo cambio lógico:** si el staging mezcla temas, cambiar a [Flujo: Múltiples cambios lógicos mezclados](#flujo-múltiples-cambios-lógicos-mezclados).
- **Tipo coherente con el diff:** el tipo refleja realmente lo que cambió. No usar `chore` para enmascarar features ni `feat` para puro refactor.
- **Sin operaciones destructivas implícitas:** no aplicar `--force`, `--hard`, `reset` duro, `--amend` ni `--no-verify` salvo petición explícita del usuario.
- **Rama de destino segura:** si la rama actual es `main`, `master`, `develop` o `release/*`, confirmar con el usuario antes de commitear directo. Nunca force push a esas ramas.

**Si hay conflicto:**
```
⚠️ No es posible commitear todavía:
- <razón concreta>
- <archivo, línea o detalle del problema>
```

---

## Flujo: Commit estándar (un cambio lógico)

Aplica cuando el diff cubre un único cambio coherente.

1. **Inspeccionar el estado y el diff:**
   ```bash
   git status --porcelain
   git diff --staged   # si hay algo en staging
   git diff            # si no hay nada en staging
   git rev-parse --abbrev-ref HEAD
   ```
2. **Ajustar staging:**
   - Si todo el staging pertenece al cambio: continuar.
   - Si faltan archivos del cambio: `git add <ruta1> <ruta2>` o patrón concreto (`git add src/cart/*.ts`).
   - Si hay archivos no relacionados en staging: removerlos con `git restore --staged <ruta>`.
3. **Inferir tipo, scope y descripción** aplicando [Inferencia desde el diff](#inferencia-desde-el-diff).
4. **Decidir body y footer:**
   - **Body:** incluir solo si aporta contexto no obvio del diff (motivo, contexto del bug, decisión técnica).
   - **Footer:** incluir `BREAKING CHANGE: <detalle>` si aplica, y `Closes #N` / `Refs #N` si el usuario aportó el número.
5. **Ejecutar [Validación antes de ejecutar](#validación-antes-de-ejecutar).** Si falla, detener y reportar.
6. **Mostrar [Propuesta de commit](#propuesta-de-commit)** al usuario y esperar confirmación o ajustes.
7. **Ejecutar el commit** una vez confirmado:
   ```bash
   # Mensaje de una línea
   git commit -m "<type>[scope]: <description>"

   # Mensaje multi-línea (body o footer)
   git commit -m "$(cat <<'EOF'
   <type>[scope]: <description>

   <optional body>

   <optional footer>
   EOF
   )"
   ```
8. **Reportar al usuario** el SHA corto (`git rev-parse --short HEAD`) y el mensaje del commit creado.

---

## Flujo: Múltiples cambios lógicos mezclados

Aplica cuando el diff cubre más de un tema (p. ej. docs + feature, fix + refactor, módulos sin relación).

1. **Agrupar archivos por afinidad** desde el diff: por área (`src/auth/**` vs `docs/**`), por tipo de cambio (`fix` vs `feat`) o por intención.
2. **Proponer al usuario** la lista ordenada de commits planeados, indicando para cada uno:
   - Tipo y scope sugeridos (aplicando [Inferencia desde el diff](#inferencia-desde-el-diff)).
   - Archivos incluidos.
   - Descripción tentativa.
3. **Esperar confirmación o ajustes** del usuario antes de tocar staging.
4. **Por cada grupo confirmado, en orden:**
   1. Vaciar staging si arrastra archivos de otros grupos: `git reset` (preserva el working tree).
   2. Añadir solo los archivos del grupo: `git add <archivos>`.
   3. Ejecutar [Validación antes de ejecutar](#validación-antes-de-ejecutar).
   4. Mostrar [Propuesta de commit](#propuesta-de-commit) y esperar confirmación.
   5. Ejecutar `git commit -m "..."` y registrar el SHA.
5. **Reportar al usuario** la secuencia final de SHAs y mensajes creados, en el orden ejecutado.

---

## Flujo: Recuperación tras fallo de hook

Aplica cuando un pre-commit hook (linter, formateador, test) bloquea el commit.

1. **Leer el mensaje del hook** y aplicar las correcciones necesarias en el working tree (no sobre un commit ya fallido).
2. **Re-stagear** los archivos corregidos: `git add <archivos>`.
3. **Crear un commit nuevo** con el mismo mensaje acordado — **no `--amend`** salvo petición explícita del usuario.
4. **No usar `--no-verify`** para saltar el hook salvo petición explícita del usuario.
5. Si el problema es del propio hook (config rota, no del código): informar al usuario y esperar instrucciones. No parchear silenciosamente la configuración.

---

## Propuesta de commit

Antes de ejecutar `git commit`, mostrar al usuario:

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

Confirma o ajusta tipo/scope/descripción antes de ejecutar.
```

Esperar respuesta del usuario. **No ejecutar `git commit`** hasta recibir confirmación explícita (`ok`, `dale`, `procede`, `sí`, equivalente). Si el usuario pide ajustes, aplicarlos y volver a mostrar la propuesta.

---

## Checklist antes de ejecutar `git commit`

**Información:**
- [ ] `git status` y `git diff` revisados completos
- [ ] Tipo, scope y descripción derivados de [Inferencia desde el diff](#inferencia-desde-el-diff), no inventados
- [ ] Rama actual conocida (`git rev-parse --abbrev-ref HEAD`)
- [ ] Idioma de preferencia determinado y `docs/MEMORY.md` actualizado si fue necesario
- [ ] Intención clara: un commit único vs. separación en varios

**Validación:**
- [ ] [Detección de secretos](#detección-de-secretos-en-el-diff) ejecutada sin coincidencias
- [ ] Un solo cambio lógico por commit
- [ ] Sin `--force`, `--hard`, `--no-verify`, `--amend` salvo petición explícita
- [ ] Rama segura, o usuario confirmó commit directo en `main`/`master`/`develop`/`release/*`

**Formato del mensaje:**
- [ ] Primera línea: `<type>[scope]: <description>` válido
- [ ] Tipo y scope en inglés (palabras clave convencionales)
- [ ] Descripción en imperativo presente, máximo 72 chars, sin punto final, sin mayúscula inicial
- [ ] Body separado por línea en blanco si existe
- [ ] Breaking change marcado con `!` o footer `BREAKING CHANGE:` si aplica
- [ ] Referencia a issue (`Closes #X` / `Refs #X`) si el usuario la aportó

**Confirmación:**
- [ ] [Propuesta de commit](#propuesta-de-commit) mostrada y confirmación recibida

---

## Ejemplos

**Ejemplo 1 — Commit estándar**

- *Entrada:* «Acabo de corregir el bug del cupón vacío en el checkout; diff solo en `src/cart/checkout.ts`.»
- *Salida:*
  ```bash
  git add src/cart/checkout.ts
  git commit -m "fix(cart): validate empty coupon before apply"
  ```

**Ejemplo 2 — Cambios mezclados**

- *Entrada:* Diff incluye `README.md`, `docs/api.md` y `src/api/users.ts` con una ruta nueva.
- *Salida:* Proponer dos commits:
  1. `docs: update API endpoint reference` — solo archivos de documentación.
  2. `feat(users): add endpoint to fetch user preferences` — solo el código.

**Ejemplo 3 — Breaking change**

- *Entrada:* Diff renombra un endpoint público de `/v1/users` a `/v2/users` rompiendo clientes existentes.
- *Salida:*
  ```
  feat(api)!: rename users endpoint to v2

  BREAKING CHANGE: `/v1/users` removed; clients must migrate to `/v2/users`.
  ```

**Ejemplo 4 — Información incompleta**

- *Entrada:* «Haz commit de lo que está en staging.»
- *Comportamiento:* Revisar el diff. Si ninguna regla de [Scope](#scope) encaja porque los cambios cruzan varios módulos sin patrón, preguntar al usuario por la intención principal o proponer agrupación. No generar un mensaje genérico.

**Ejemplo 5 — Fallo de hook**

- *Entrada:* Tras `git commit`, el hook de lint falla con un error de formato en `src/utils.ts`.
- *Comportamiento:* Aplicar el formateo, `git add src/utils.ts`, crear un commit nuevo con el mismo mensaje. No usar `--amend` ni `--no-verify`.

**Ejemplo 6 — Secreto detectado**

- *Entrada:* Diff staged incluye `config/.env.local` con `DB_PASSWORD=hunter2`.
- *Comportamiento:* Detener antes de commitear. Reportar al usuario el archivo y la línea detectados. Sugerir `git restore --staged config/.env.local` y añadir el patrón a `.gitignore`. No commitear hasta confirmación explícita del usuario.

---

## Anti-patterns

- Commit gigante que mezcla features, fixes y refactors sin relación.
- Mensajes vagos (`update`, `fix stuff`, `changes`, `wip`) sin tipo o scope alineados al diff.
- Inventar tipo o scope cuando el diff no lo respalda (p. ej. `feat` para un cambio que es solo `chore`).
- Incluir archivos sensibles (`.env`, claves) porque «ya estaban en el directorio».
- Saltar [Detección de secretos](#detección-de-secretos-en-el-diff) y confiar en inspección visual del diff.
- Saltar hooks con `--no-verify` por comodidad.
- Usar `git commit --amend` tras un fallo de hook cuando la regla es crear un commit nuevo.
- Hacer force push a `main` / `master`.
- Modificar la configuración global de git sin permiso explícito.
- Ejecutar `git commit` sin mostrar la [Propuesta de commit](#propuesta-de-commit) y esperar confirmación.
- Narrar el trabajo realizado al usuario («leí el diff», «hice add», «escribí el mensaje»). Reportar solo el resultado final (SHA + mensaje) y los pendientes.

---

## Notas

### Tipos de commit (referencia)

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

### Cambios breaking

Dos formas equivalentes:

```
# 1. Signo de exclamación tras type/scope
feat!: remove deprecated endpoint

# 2. Footer BREAKING CHANGE
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

### Idioma del mensaje

Resolver en este orden, deteniéndose en el primer paso que aplique:

1. Inferir del idioma del turno actual del usuario.
2. Leer `docs/MEMORY.md` y buscar la línea `preferred language: <código ISO 639-1>` (ej. `es`, `en`).
3. Si no existe el archivo o no hay esa línea: **preguntar al usuario** qué idioma prefiere y persistir la respuesta creando o actualizando `docs/MEMORY.md` con la línea `preferred language: <código>`.

Solo afecta a la parte en lenguaje natural (descripción, body, footers). **Tipo y `scope`** siguen siendo palabras clave convencionales en inglés salvo acuerdo explícito del equipo.

### Mensaje al usuario

Solo resultados: SHA del commit (`git rev-parse --short HEAD`), mensaje final, y lo que el usuario debe saber o decidir. No incluir razonamiento interno, narración paso a paso ni descripciones del trabajo en curso. Si hay pendientes o decisiones por tomar (separación de commits, idioma sin definir, archivo sensible detectado), listarlos en viñetas claras agrupadas por commit.