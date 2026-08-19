# Detección de secretos en el diff (referencia)

Ejecutar desde la raíz del repositorio **antes** de aceptar el staging. El agente usa el resultado solo para decidir si detener el commit; **no** debe copiar el output al chat.

## Comando

```bash
git diff --staged | grep '^+' | grep -v '^+++' | \
  grep -nEi 'password[[:space:]]*=|api[_-]?key|secret[[:space:]]*=|token[[:space:]]*=|BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|aws_access_key_id|aws_secret_access_key|-----BEGIN CERTIFICATE-----'
```

Salida esperada cuando hay hallazgos: números de línea en el diff unificado (no el valor del secreto).

> **Solo líneas añadidas.** El filtro `grep '^+'` (descartando la cabecera `+++`) es lo que hace útil la detección: sin él, el patrón casa también con líneas **eliminadas** y de contexto, y bloquearía commits que precisamente **quitan** un secreto del repo o que borran un archivo que lo mencionaba. Un ejemplo real en este plugin: el commit de promoción de `pr-create` retira `docs/audits/quality-check.md`, un informe que puede citar salidas de linter con `api_key` o `token =`; con el diff completo, ese borrado detendría el cierre sin salida posible. Lo que hay que vigilar es lo que **entra** en la historia, no lo que sale.

> **Renombrados: exigir `-M` y no bloquear por un falso positivo del archivado.** El commit del archivado de un `US-XXX`/`WI-XXX` mueve una carpeta entera de documentación (`git mv` a `docs/specs/archive/`). Si git **detecta el rename**, el diff es solo la ruta y no hay línea añadida que inspeccionar. Si **no** lo detecta —umbral de similitud, o `diff.renames` desactivado en el repo—, el contenido íntegro de cada archivo movido aparece como líneas `+`, así que un `README.md` o un `trace-report.md` que cite `token =` o `api_key` en un criterio de aceptación, en la salida de un test o en un ejemplo dispara el patrón. Ese hallazgo es **espurio**: nada nuevo entra en la historia, el archivo ya estaba versionado.
>
> Por eso, cuando el staging contiene renombrados, computar el diff con detección forzada:
>
> ```bash
> git diff --staged -M --find-renames=40%
> ```
>
> Si aun así queda un hallazgo y **todas** sus líneas provienen de rutas que aparecen como origen de un renombrado (`git diff --staged -M --name-status | grep '^R'`), **no detener**: reportarlo al usuario como falso positivo del movimiento e indicar de qué archivo procede. Detener ahí bloquearía el cierre —`work-integrate` trata la parada de este skill como un bloqueo de merge— por contenido que ya llevaba tiempo en el repositorio.

## Archivos sensibles por nombre

Detener también si el staging incluye, entre otros: `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`.

## Cómo reportar al usuario

Solo **ruta** y **línea** en el archivo del repo, p. ej. `config/.env.local:12 (valor omitido)`. Nunca incluir el contenido de la línea ni el stdout de `grep`.
