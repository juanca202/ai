<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
IDIOMA: los títulos de sección, los encabezados de columna, la leyenda y TODA etiqueta de veredicto,
severidad y estado de dimensión se redactan en el IDIOMA RESUELTO (ver «Resolución de idioma» en
SKILL.md). Esta plantilla los muestra en español solo porque el repositorio del plugin está en
español: son un ejemplo de redacción, no un texto fijo. Lo que NO cambia nunca: la estructura, el
orden, los símbolos y los valores canónicos (APPROVED/REJECTED/INCOMPLETE, COMPLIANT/NOT_ASSESSED,
CRITICAL/MAJOR/MINOR/SUGGESTION). Ver ../../reference/verdicts.md.
Excepción: la marca de pie del final (code-review:fingerprint) SÍ se conserva en el documento
publicado — es la clave de frescura que lee el Paso 0 de la próxima revisión.
-->

# Code Review — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Alcance del diff:** {{rama vs base, incluidos los cambios sin commitear | solo cambios sin commitear (`working-tree`) | rutas de `scope`}} — {{N archivos, +X/−Y líneas}}
**Modo:** {{default / blocking-only}}
**Base del diff:** {{rama base}} @ {{sha-corto}}
**Veredicto:** {{símbolo + etiqueta en el idioma resuelto: `✅` APPROVED / `❌` REJECTED / `⚠️` INCOMPLETE}} — {{justificación en una línea}}

## Resumen

{{2-3 frases: qué se revisó, el resultado global y, si algo bloquea, qué falta para llegar a `APPROVED`. Sin listar aún el detalle.}}

## Intención detectada

{{Qué problema resuelve el cambio, inferido de US/WI/FT · rama · commits · descripción del PR. Si el usuario la aportó a mano, indicarlo.}}

## Hallazgos

Leyenda de severidad — **redactar cada etiqueta en el idioma resuelto**, con estos símbolos:
`🔴` {{CRITICAL}} · `🟠` {{MAJOR}} · `🟡` {{MINOR}} · `💡` {{SUGGESTION}} · `✅` {{COMPLIANT}}.
Formato de cada hallazgo: `[ISO-25010: <Característica>]` + severidad + qué (ubicado) + por qué + impacto + sugerencia concreta.

### Análisis semántico (intención)

{{`✅` + etiqueta de `COMPLIANT` con una frase que explique por qué, o lista de hallazgos.}}

- {{🔴 | 🟠 | 🟡 | 💡}} `[ISO-25010: Adecuación funcional]` {{título del hallazgo}} — **Qué:** {{problema, en archivo/símbolo}} **Por qué:** {{qué se rompe o encarece}} **Impacto:** {{alcance en el sistema}} **Sugerencia:** {{cómo quedaría mejor}}

### Arquitectura y diseño

{{`✅` + etiqueta de `COMPLIANT` con una frase que explique por qué, o lista de hallazgos (SOLID, límites de capas, acoplamiento, duplicación, abstracción innecesaria, patrones del proyecto, fiabilidad, seguridad, desempeño, compatibilidad).}}

- {{🔴 | 🟠 | 🟡 | 💡}} `[ISO-25010: {{Característica}}]` {{título}} — **Qué:** {{…}} **Por qué:** {{…}} **Impacto:** {{…}} **Sugerencia:** {{…}}

### Dimensiones no evaluadas

{{Si las tres se evaluaron, una palabra en el idioma resuelto equivalente a «ninguna». Si alguna quedó en `NOT_ASSESSED` (intención no determinable, diff inaccesible o generado), listarla con su motivo — es lo que produce el veredicto `INCOMPLETE`.}}

### Feedback adicional

{{Comentarios contextuales: lo que está bien hecho y nitpicks `🟡`/`💡`. No abrumar; priorizar por impacto. Con `blocking-only`, omitir esta sección y decirlo en el Resumen.}}

## Próximas acciones

{{Orden de prioridad: hallazgos 🔴/🟠 sin resolver → dimensiones sin evaluar → hallazgos 🟡/💡. Si el veredicto es Aprobado y no hay pendientes: «una frase en el idioma resuelto equivalente a «sin acciones pendientes»».}}

1. {{acción concreta}}
2. {{…}}

## Justificaciones aceptadas

{{Solo si el usuario justificó hallazgos bloqueantes (`🔴`/`🟠`). Si no hubo, una palabra en el idioma resuelto equivalente a «ninguna».}}

| Hallazgo | Severidad | Dimensión | Justificación | Aceptada por |
| -------- | --------- | --------- | ------------- | ------------ |
| {{hallazgo}} | {{🔴 / 🟠}} | {{dimensión: semántica / arquitectura / feedback, en el idioma resuelto}} | {{motivo aceptado para conservar el estado actual}} | {{usuario / rol}} |

<!--
Dentro de una tabla, las opciones de un placeholder se separan con / en vez de con | (un pipe sin
escapar partiría la celda). Fuera de tablas se mantiene la convención {{a | b | c}} del resto del repo.
-->

<!--
Marca de frescura: NO eliminar al publicar. La lee el Paso 0 de la próxima invocación para decidir
si el informe sigue vigente. `fingerprint` es el canónico de la tubería (el mismo de quality-check
y trace-validate); `base` es el commit corto de la rama base del diff. Ambos, con el valor vigente
tras la última corrección si la hubo. Solo se graba en el informe vigente de la rama —una revisión
acotada (working-tree/scope) no escribe este archivo—.
-->

<!-- code-review:verdict={{APPROVED|REJECTED|INCOMPLETE}} · mode={{default|blocking-only}} · fingerprint={{hash}} · base={{sha-corto}} · generated={{YYYY-MM-DD}} -->
