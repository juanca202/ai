# WI-001: Script de validación determinista de formato para agent skills

**Estado:** Ready

<!-- wi:status=Ready -->
**Tipo:** operational-change

**Repositorio:** sdd-devkit
**Asignado a:** juanca202

## Descripción

El catálogo tiene 16 skills empaquetados como plugin de Claude Code, con convenciones de formato documentadas en `AGENTS.md` (frontmatter `name`/`description`/`license`, tamaño orientativo de `SKILL.md`) y con una convención de enlaces relativos (`../../reference/<archivo>.md`) que sostiene todo el mecanismo de "puntero, no copia" del catálogo. Hoy nada de eso se verifica de forma automática: se comprueba a mano, y la investigación previa (ver Referencias) midió directamente sobre los 16 `SKILL.md` que **6 de 16 ya exceden el tope propio de `description`** (1000 caracteres) y **2 de 16 exceden las ~500 líneas orientativas** — la revisión manual no está atrapando las propias reglas del proyecto. Además, los renombrados de archivos y encabezados hechos en el catálogo durante trabajo reciente mostraron que los enlaces relativos y las anclas `#...` citadas entre archivos son fáciles de dejar rotas sin que nada lo señale.

Se necesita un script ejecutable (`node scripts/validate-skills.js`) que aplique estas comprobaciones sobre todos los `SKILL.md` del catálogo y reporte hallazgos con severidad, para poder correrlo antes de cerrar cualquier cambio sobre `skills/` o `reference/`.

## Dependencias

- Ninguna librería externa. El repo no tiene `package.json`; el script debe usar solo módulos nativos de Node.js (`fs`, `path`), igual que `hooks/events/artifact-events.js`.

## Referencias

- **Investigación:** [RS-002 — Validaciones deterministas de formato para agent skills](../../research/RS-002-validaciones-formato-skills/README.md) — fuente de los límites de plataforma vs. proyecto, y de la especificación de las 4 capas de chequeo que este WI implementa.

## Criterios de aceptación

- **AC-001 (Idoneidad funcional):** el script DEBE recorrer todos los `skills/*/SKILL.md` del repositorio sin necesitar argumentos.
- **AC-002 (Idoneidad funcional):** el script DEBE extraer el frontmatter de cada `SKILL.md` soportando tanto `campo: valor` en una línea como bloques `>`, `>-`, `|`, `|-` multilínea; si el bloque `---`/`---` inicial no está bien formado o no parsea, DEBE reportarlo como `ERROR` de sintaxis para ese skill y continuar con el resto.
- **AC-003 (Idoneidad funcional):** para cada skill, el script DEBE validar (capa "Convenciones del proyecto", severidad `ERROR`):
  - `name` presente, coincide exactamente con el nombre de la carpeta, cumple `^[a-z0-9]+(-[a-z0-9]+)*$` y tiene menos de 64 caracteres;
  - `description` presente y con 1000 caracteres o menos;
  - `license` presente con el valor exacto `MIT`.
- **AC-004 (Idoneidad funcional):** el script DEBE reportar como `WARNING` (no bloqueante):
  - `SKILL.md` con más de 500 líneas;
  - `description` entre 1001 y 1536 caracteres (todavía dentro del límite de plataforma, pero fuera de la convención del proyecto).
- **AC-005 (Idoneidad funcional):** el script DEBE reportar como `ERROR` si `description` supera los 1536 caracteres (límite duro de plataforma).
- **AC-006 (Idoneidad funcional):** el script DEBE resolver, para `SKILL.md` y para cada archivo en su `references/` (si existe), todos los enlaces markdown relativos `[texto](ruta)` o `[texto](ruta#ancla)` que apunten a otro archivo del repositorio, y reportar `ERROR` si la ruta no existe en disco. Enlaces externos (`http://`, `https://`) quedan fuera de este chequeo.
- **AC-007 (Idoneidad funcional):** cuando un enlace relativo incluye `#ancla`, el script DEBE verificar que esa ancla corresponda a un encabezado real (`#`/`##`/`###`...) del archivo destino, aplicando el mismo algoritmo de slugificación que usa GitHub (minúsculas, quitar puntuación, espacios a guiones), y reportar `ERROR` si no hay coincidencia.
- **AC-008 (Idoneidad funcional):** el script DEBE imprimir un reporte agrupado por skill, listando cada hallazgo con su severidad (`ERROR`/`WARNING`) y una descripción concreta (qué campo, qué archivo, qué línea si aplica).
- **AC-009 (Fiabilidad):** el proceso DEBE terminar con código de salida `1` si hay al menos un `ERROR` en cualquier skill, y `0` si el resultado son solo `WARNING` o no hay hallazgos.
- **AC-010 (Mantenibilidad):** el script NO DEBE requerir dependencias de `npm` ni un `package.json` para ejecutarse — solo `node scripts/validate-skills.js` desde la raíz del repo.

## Archivos afectados

```text
sdd-devkit/
└── scripts/
    └── + validate-skills.js   # script de validación (frontmatter, tamaño, enlaces/anclas) sobre skills/*/SKILL.md
```

## Plan de implementación

- [x] **IT-01** — Recorrer `skills/*/SKILL.md` y extraer su frontmatter (parser propio, sin dependencias) soportando valores en línea y bloques `>`/`>-`/`|`/`|-`.
  Reutilizar como referencia el enfoque ya validado en la investigación RS-002 (parseo línea a línea del bloque entre `---`).
- [x] **IT-02** — Implementar los chequeos de la capa "Convenciones del proyecto" (AC-003): `name` (formato, longitud, coincidencia con la carpeta), `description` (≤ 1000), `license` (`MIT`).
- [x] **IT-03** — Implementar los chequeos de la capa "Señales blandas" (AC-004) y el límite duro de plataforma (AC-005) sobre `description`.
- [x] **IT-04** — Implementar la resolución de enlaces relativos y anclas (AC-006, AC-007) sobre `SKILL.md` y los archivos de su carpeta `references/`, con slugificación de encabezados estilo GitHub.
- [x] **IT-05** — Implementar el reporte agrupado por skill y el código de salida según severidad (AC-008, AC-009).
- [x] **IT-06** — Correr el script sobre el catálogo actual del repo y confirmar que reproduce los hallazgos ya conocidos por la investigación (6 skills con `description` > 1000, 2 con más de 500 líneas) sin falsos positivos ni negativos.
