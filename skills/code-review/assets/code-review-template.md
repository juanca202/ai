<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
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
**Veredicto:** {{✅ Aprobado / ❌ Rechazado / ⚠️ Incompleto}} — {{justificación en una línea}}

## Resumen

{{2-3 frases: qué se revisó, el resultado global y, si algo bloquea, qué falta para llegar a Aprobado. Sin listar aún el detalle.}}

## Intención detectada

{{Qué problema resuelve el cambio, inferido de US/WI/FT · rama · commits · descripción del PR. Si el usuario la aportó a mano, indicarlo.}}

## Hallazgos

Símbolos de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` Conforme.
Formato de cada hallazgo: `[ISO-25010: <Característica>]` + severidad + qué (ubicado) + por qué + impacto + sugerencia concreta.

### Análisis semántico (intención)

{{`✅ Conforme` con una frase que explique por qué, o lista de hallazgos.}}

- {{🔴 | 🟠 | 🟡 | 💡}} `[ISO-25010: Adecuación funcional]` {{título del hallazgo}} — **Qué:** {{problema, en archivo/símbolo}} **Por qué:** {{qué se rompe o encarece}} **Impacto:** {{alcance en el sistema}} **Sugerencia:** {{cómo quedaría mejor}}

### Arquitectura y diseño

{{`✅ Conforme` con una frase que explique por qué, o lista de hallazgos (SOLID, límites de capas, acoplamiento, duplicación, abstracción innecesaria, patrones del proyecto, fiabilidad, seguridad, desempeño, compatibilidad).}}

- {{🔴 | 🟠 | 🟡 | 💡}} `[ISO-25010: {{Característica}}]` {{título}} — **Qué:** {{…}} **Por qué:** {{…}} **Impacto:** {{…}} **Sugerencia:** {{…}}

### Dimensiones no evaluadas

{{«Ninguna» si las tres se evaluaron. Si alguna no pudo evaluarse (intención no determinable, diff inaccesible o generado), listarla con su motivo — es lo que produce el veredicto ⚠️ Incompleto.}}

### Feedback adicional

{{Comentarios contextuales: lo que está bien hecho y nitpicks `🟡`/`💡`. No abrumar; priorizar por impacto. Con `blocking-only`, omitir esta sección y decirlo en el Resumen.}}

## Próximas acciones

{{Orden de prioridad: hallazgos 🔴/🟠 sin resolver → dimensiones sin evaluar → hallazgos 🟡/💡. Si el veredicto es Aprobado y no hay pendientes: «Sin acciones pendientes».}}

1. {{acción concreta}}
2. {{…}}

## Justificaciones aceptadas

{{Solo si el usuario justificó hallazgos bloqueantes (🔴/🟠). Si no hubo: «Ninguna».}}

| Hallazgo | Severidad | Dimensión | Justificación | Aceptada por |
| -------- | --------- | --------- | ------------- | ------------ |
| {{hallazgo}} | {{🔴 / 🟠}} | {{Semántica / Arquitectura / Feedback}} | {{motivo aceptado para conservar el estado actual}} | {{usuario / rol}} |

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

<!-- code-review:fingerprint={{hash}} · base={{sha-corto}} · generado={{YYYY-MM-DD}} -->
