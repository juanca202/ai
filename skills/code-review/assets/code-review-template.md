<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Code Review — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Alcance del diff:** {{rama vs base, incluidos los cambios sin commitear | solo cambios sin commitear (`working-tree`) | rutas de `scope`}} — {{N archivos, +X/−Y líneas}}
**Modo:** {{default | blocking-only | working-tree | scope … | base … }}
**Veredicto:** {{✅ Aprobado | ❌ Rechazado | ⚠️ Incompleto}}

## Resumen

{{2-3 frases: qué se revisó, el resultado global y, si algo bloquea, qué falta para llegar a Aprobado. Sin listar aún el detalle.}}

## Intención detectada

{{Qué problema resuelve el cambio, inferido de US/WI/FT · rama · commits · descripción del PR. Si el usuario la aportó a mano, indicarlo.}}

## Hallazgos

Símbolos de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` dimensión conforme.
Formato de cada hallazgo: `[ISO-25010: <Característica>]` + severidad + qué (ubicado) + por qué + impacto + sugerencia concreta.

### Análisis semántico (intención)

{{`✅ conforme` con una frase que explique por qué, o lista de hallazgos.}}

- {{🔴 | 🟠 | 🟡 | 💡}} `[ISO-25010: Adecuación funcional]` {{título del hallazgo}} — **Qué:** {{problema, en archivo/símbolo}} **Por qué:** {{qué se rompe o encarece}} **Impacto:** {{alcance en el sistema}} **Sugerencia:** {{cómo quedaría mejor}}

### Arquitectura y diseño

{{`✅ conforme` con una frase que explique por qué, o lista de hallazgos (SOLID, límites de capas, acoplamiento, duplicación, abstracción innecesaria, patrones del proyecto, fiabilidad, seguridad, desempeño, compatibilidad).}}

- {{🔴 | 🟠 | 🟡 | 💡}} `[ISO-25010: {{Característica}}]` {{título}} — **Qué:** {{…}} **Por qué:** {{…}} **Impacto:** {{…}} **Sugerencia:** {{…}}

### Dimensiones no evaluadas

{{«Ninguna» si las tres se evaluaron. Si alguna no pudo evaluarse (intención no determinable, diff inaccesible o generado), listarla con su motivo — es lo que produce el veredicto ⚠️ Incompleto.}}

### Feedback adicional

{{Comentarios contextuales: lo que está bien hecho y nitpicks `🟡`/`💡`. No abrumar; priorizar por impacto. Con `blocking-only`, omitir esta sección y decirlo en el Resumen.}}

## Veredicto

**{{✅ Aprobado | ❌ Rechazado | ⚠️ Incompleto}}** — {{justificación en una línea: qué hallazgo o qué dimensión sin evaluar lo determina}}

## Próximas acciones

{{Orden de prioridad: hallazgos 🔴/🟠 sin resolver → dimensiones sin evaluar → hallazgos 🟡/💡. Si el veredicto es Aprobado y no hay pendientes: «Sin acciones pendientes».}}

1. {{acción concreta}}
2. {{…}}

## Justificaciones aceptadas

{{Solo si el usuario justificó hallazgos bloqueantes (🔴/🟠). Si no hubo: «Ninguna».}}

| Hallazgo | Severidad | Dimensión | Justificación | Aceptada por |
| -------- | --------- | --------- | ------------- | ------------ |
| {{hallazgo}} | {{🔴 | 🟠}} | {{Semántica | Arquitectura | Feedback}} | {{motivo aceptado para conservar el estado actual}} | {{usuario / rol}} |

## Otras puertas del cierre

{{Este informe cubre solo el plano cualitativo. Indicar el estado de las otras dos puertas, o que están pendientes.}}

| Puerta | Artefacto | Veredicto |
| ------ | --------- | --------- |
| Verificaciones automatizadas (`quality-check`) | `docs/specs/quality-check.md` | {{✅ / ❌ / ⚠️ / pendiente}} |
| Trazabilidad (`trace-validate`) | `trace-report.md` del trabajo | {{✅ / ❌ / ⚠️ / pendiente}} |
