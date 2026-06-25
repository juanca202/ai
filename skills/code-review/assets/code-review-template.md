<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Code Review — {{US-XXX-nombre-corto | repositorio · rama}}

Fecha: {{YYYY-MM-DD HH:MM}}
Repositorio: {{nombre o ruta}}
Rama: {{rama}} · Commit: {{sha-corto}}
Working tree: {{limpio | sucio (N archivos modificados)}}
Modo: {{default | checks-only | qualitative-only | only nombre-del-check | …}}
Historia: {{US-XXX-nombre-corto (Enlazada al archivo de la historia) | — (fuera de US)}}
Veredicto: {{✅ Apto | ❌ No apto | ⚠️ Incompleto}}

## Resumen

{{2-3 frases: qué se revisó, el resultado global y, si algo bloquea, qué falta para llegar a Apto. Sin listar aún el detalle.}}

## 1. Verificaciones automatizadas

Símbolos de estado: `✅` PASS · `❌` FAIL · `⏭️` SKIPPED · `—` N/A · `ℹ️` informativo (Sonar).

| # | Check      | Comando            | Categoría     | Estado | Detalle               | Duración |
| - | ---------- | ------------------ | ------------- | ------ | --------------------- | -------- |
| 1 | tipado     | {{comando}}          | {{Bloqueante}}  | {{✅}}    | {{0 errores}}           | {{4.1s}}   |
| 2 | linter     | {{comando}}          | {{Bloqueante}}  | {{❌}}    | {{3 errors, 5 warnings}}| {{2.3s}}   |
| 3 | unit tests | {{comando}}          | {{Bloqueante}}  | {{✅}}    | {{142 passed, 0 failed}}| {{18.7s}}  |
| 4 | coverage   | {{comando}}          | {{Bloqueante}}  | {{✅}}    | {{87% (umbral 80%)}}    | {{19.0s}}  |
| 5 | build      | {{comando}}          | {{Bloqueante}}  | {{✅}}    | {{OK}}                  | {{12.4s}}  |
| 6 | e2e        | {{comando}}          | {{Condicional}} | {{⏭️}}    | {{config rota}}         | {{—}}      |
| 7 | sonar      | {{comando}}          | {{Informativo}} | {{—}}    | {{N/A (sin config)}}    | {{—}}      |

{{Incluir solo las filas de checks que aplican al stack. Los `N/A` por modificador del usuario o por no aplicar al stack pueden omitirse o marcarse `—`.}}

### Detalle de checks fallidos

{{Solo para FAIL o SKIPPED. Truncar a 10 errores por check con `… y N más`. Si no hay ninguno: «Sin checks fallidos».}}

- **{{check}}** — {{mensajes de error relevantes, parseados según la herramienta}}

## 2. Revisión cualitativa

{{Si la etapa automatizada no se superó (quedó algún FAIL sin corregir): escribir «No ejecutada — la etapa automatizada no se superó.» y omitir el resto de esta sección.}}
{{Si se omitió por modificador `checks-only`: escribir «No ejecutada — omitida por modificador `checks-only`.» (motivo distinto al fallo automatizado) y omitir el resto. Con `only nombre-del-check`: «No ejecutada — omitida por modificador `only nombre-del-check`.»}}

Símbolos de severidad: `🔴` Crítico · `🟠` Mayor · `🟡` Menor · `💡` Sugerencia · `✅` dimensión conforme.

**Intención detectada:** {{qué problema resuelve el cambio, inferido de US/TK/WI · rama · commits}}

### Análisis semántico

{{`✅ conforme` o lista de hallazgos. Cada hallazgo: severidad + qué + por qué + impacto + sugerencia concreta.}}

- {{🔴 | 🟠 | 🟡 | 💡}} {{hallazgo}} — **Por qué:** {{qué se rompe o encarece}} **Impacto:** {{alcance en el sistema}} **Sugerencia concreta:** {{cómo quedaría mejor}}

### Arquitectura y diseño

{{`✅ conforme` o lista de hallazgos (SOLID, límites de capas, acoplamiento, duplicación, abstracción innecesaria, patrones del proyecto).}}

- {{🔴 | 🟠 | 🟡 | 💡}} {{hallazgo}} — **Por qué:** {{…}} **Impacto:** {{…}} **Sugerencia concreta:** {{…}}

### Feedback adicional

{{Comentarios contextuales: lo que está bien hecho y nitpicks `🟡`/`💡`. No abrumar; priorizar por impacto.}}

## Próximas acciones

{{Orden de prioridad: hallazgos 🔴/🟠 sin resolver → FAIL Bloqueantes/Condicionales → warnings de linter → Sonar → SKIPPED por config ausente/rota → hallazgos 🟡/💡. Si el veredicto es Apto y no hay pendientes: «Sin acciones pendientes».}}

1. {{acción concreta}}
2. {{…}}

## Justificaciones aceptadas

{{Solo si el usuario justificó hallazgos bloqueantes (🔴/🟠) de cualquiera de las tres dimensiones. Si no hubo: «Ninguna».}}

| Hallazgo | Severidad | Dimensión | Justificación | Aceptada por |
| -------- | --------- | --------- | ------------- | ------------ |
| {{hallazgo}} | {{🔴 | 🟠}} | {{Semántica | Arquitectura | Feedback}} | {{motivo aceptado para conservar el estado actual}} | {{usuario / rol}} |
