# Detección de secretos en el diff (referencia)

Ejecutar desde la raíz del repositorio **antes** de aceptar el staging. El agente usa el resultado solo para decidir si detener el commit; **no** debe copiar el output al chat.

## Comando

```bash
git diff --staged | grep -nEi 'password[[:space:]]*=|api[_-]?key|secret[[:space:]]*=|token[[:space:]]*=|BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|aws_access_key_id|aws_secret_access_key|-----BEGIN CERTIFICATE-----'
```

Salida esperada cuando hay hallazgos: números de línea en el diff unificado (no el valor del secreto).

## Archivos sensibles por nombre

Detener también si el staging incluye, entre otros: `.env*`, `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`.

## Cómo reportar al usuario

Solo **ruta** y **línea** en el archivo del repo, p. ej. `config/.env.local:12 (valor omitido)`. Nunca incluir el contenido de la línea ni el stdout de `grep`.
