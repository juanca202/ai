# Detección de secretos en el diff (referencia)

Ejecutar desde la raíz del repositorio **antes** de aceptar el staging. El agente usa el resultado solo para decidir si detener el commit; **no** debe copiar el output al chat.

## Comando

```bash
git diff --staged | grep '^+' | grep -v '^+++' | \
  grep -nEi 'password[[:space:]]*=|api[_-]?key|secret[[:space:]]*=|token[[:space:]]*=|BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|aws_access_key_id|aws_secret_access_key|-----BEGIN CERTIFICATE-----'
```

Salida esperada cuando hay hallazgos: números de línea en el diff unificado (no el valor del secreto).

> **Solo líneas añadidas.** El filtro `grep '^+'` (descartando la cabecera `+++`) es lo que hace útil la detección: sin él, el patrón casa también con líneas **eliminadas** y de contexto, y bloquearía commits que precisamente **quitan** un secreto del repo o que borran un archivo que lo mencionaba. Un ejemplo real en este plugin: el commit de promoción de `pr-create` retira `docs/audits/quality-check.md`, un informe que puede citar salidas de linter con `api_key` o `token =`; con el diff completo, ese borrado detendría el cierre sin salida posible. Lo que hay que vigilar es lo que **entra** en la historia, no lo que sale.

## Archivos sensibles por nombre

Detener también si el staging incluye, entre otros: `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`.

## Cómo reportar al usuario

Solo **ruta** y **línea** en el archivo del repo, p. ej. `config/.env.local:12 (valor omitido)`. Nunca incluir el contenido de la línea ni el stdout de `grep`.
