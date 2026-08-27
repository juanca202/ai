<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

IDIOMA: los títulos de sección, los encabezados de columna, la leyenda y TODA etiqueta de estado,
categoría y veredicto se redactan en el IDIOMA RESUELTO (ver «Resolución de idioma» en SKILL.md).
Esta plantilla los muestra en español solo porque el repositorio del plugin está en español: son un
ejemplo de redacción, no un texto fijo. Lo que NO cambia nunca: la estructura, el orden de las
secciones, los símbolos, y los valores canónicos (PASS/FAIL/SKIPPED/PENDING/N/A,
BLOCKING/CONDITIONAL/INFORMATIVE, APPROVED/REJECTED/INCOMPLETE) allí donde el documento los pida.
Ver ../../reference/verdicts.md.
-->

# Verificaciones automatizadas — {{US-XXX-nombre-corto | WI-XXX-nombre | FT-XXX-slug | nombre del artefacto}}

**Fecha:** {{YYYY-MM-DD HH:MM}}
**Rama:** {{rama}}
**Commit:** {{sha-corto}}
**Modo:** {{default | blocking-only | only nombre-del-check | no-tests | …}}  <!-- `tests-only` no produce este informe: su único artefacto es test-run.json -->
**Estándar de testing:** {{docs/standards/testing.md — requisitos vigentes: integration-testing, contract-testing | sin estándar de testing (solo las suites fijas)}}
**Veredicto:** {{símbolo + etiqueta en el idioma resuelto: `✅` APPROVED | `❌` REJECTED | `⚠️` INCOMPLETE}}

## Resumen

{{2-3 frases: qué se ejecutó, el resultado global y, si algo bloquea, qué falta para llegar a `APPROVED`. Sin listar aún el detalle.}}

## Verificaciones

Leyenda de estados — **redactar cada etiqueta en el idioma resuelto**, en este orden y con estos símbolos:
`✅` {{PASS}} · `❌` {{FAIL}} · `⏭️` {{SKIPPED}} · `⏸️` {{PENDING}} · `—` {{N/A}} · `ℹ️` {{INFORMATIVE}}.

| # | Check      | Comando            | Categoría     | Estado         | Detalle               | Duración |
| - | ---------- | ------------------ | ------------- | -------------- | --------------------- | -------- |
| 1 | tipado     | {{comando}}          | {{BLOCKING}}    | {{✅ PASS}}       | {{0 errores}}           | {{4.1s}}   |
| 2 | linter     | {{comando}}          | {{BLOCKING}}    | {{❌ FAIL}}       | {{3 errors, 5 warnings}}| {{2.3s}}   |
| 3 | unit tests | {{comando}}          | {{BLOCKING}}    | {{✅ PASS}}       | {{142 passed, 0 failed}}| {{18.7s}}  |
| 4 | coverage   | {{comando}}          | {{BLOCKING}}    | {{✅ PASS}}       | {{87% (umbral 80%)}}    | {{19.0s}}  |
| 5 | {{integración}} | {{comando}}     | {{BLOCKING}}    | {{✅ PASS}}       | {{18 passed}}           | {{41.2s}}  |
| 6 | {{contrato}}    | {{comando}}     | {{CONDITIONAL}} | {{⏭️ SKIPPED}}    | {{config rota}}         | {{—}}      |
| 7 | build      | {{comando}}          | {{BLOCKING}}    | {{✅ PASS}}       | {{OK}}                  | {{12.4s}}  |
| 8 | e2e        | {{comando}}          | {{CONDITIONAL}} | {{— N/A}}        | {{sin config e2e}}      | {{—}}      |
| 9 | sonar      | {{comando}}          | {{INFORMATIVE}} | {{— N/A}}        | {{sin config}}          | {{—}}      |

<!-- En las celdas de Categoría y Estado, {{VALOR}} significa: escribir la ETIQUETA de ese valor
     canónico en el idioma resuelto (precedida de su símbolo cuando lo tenga). El valor canónico en sí
     NO aparece en el informe. -->

<!--
FILAS DE PRUEBAS — fijas vs configuradas (ver `SKILL.md` → Suites de prueba: fijas y configuradas):
  - FIJAS, siempre presentes: `unit tests`, `coverage` y `e2e`. Se listan aunque su estado sea
    `—` + etiqueta de `N/A`; nunca se omiten.
  - CONFIGURADAS (filas 5 y 6 del ejemplo —integración, contrato— que es ilustrativo, no una lista
    cerrada): una fila por cada clase de prueba que declare el estándar de testing del repo
    (`docs/standards/testing.md` o `docs/standards/testing/README.md`), en el orden en que el estándar
    la declara. Sin estándar de testing, o sin más requisitos que los de las fijas, estas filas
    simplemente no existen — NO inventar una suite que el estándar no declara.
El resto de checks (tipado, linter, build, sonar) no son pruebas: se incluyen solo si aplican al stack.
Los `N/A` por modificador del usuario o por no aplicar al stack pueden omitirse o marcarse con `—`
y su etiqueta; las tres fijas se listan siempre.
La columna Estado lleva SÍMBOLO + ETIQUETA EN EL IDIOMA RESUELTO, siempre de la leyenda de arriba.
Los valores canónicos (PASS/FAIL/SKIPPED/PENDING/N/A) son vocabulario interno y del test-run.json:
no aparecen en el informe, tampoco en la columna Detalle.
Un check informativo (Sonar) que falla se reporta con el estado normal `❌` + etiqueta de FAIL; lo que
lo hace informativo es su Categoría, no su Estado. El símbolo `ℹ️` solo aparece en la leyenda y en
Categoría.
-->

### Detalle de checks fallidos

{{Solo para `FAIL` o `SKIPPED`. Truncar a 10 errores por check con `… y N más`. Si no hay ninguno, una frase en el idioma resuelto equivalente a «sin checks fallidos».}}

- **{{check}}** — {{mensajes de error relevantes, parseados según la herramienta}}

## Próximas acciones

<!-- Esta sección solo aparece si hay acciones pendientes. Orden de prioridad: FAIL Bloqueantes/Condicionales en orden de ejecución → warnings de linter → Sonar → SKIPPED por config ausente/rota → recomendaciones (cobertura sin tooling; suite de prueba presente en el repo pero NO declarada en el estándar de testing, sugiriendo declararla vía `arch-manage`; ausencia de estándar de testing). Si el veredicto es `APPROVED` y no hay pendientes, una frase en el idioma resuelto equivalente a «sin acciones pendientes». Si el usuario pidió solo el informe, aquí queda todo lo que habría que corregir, con el detalle suficiente para retomarlo después. -->

1. {{acción concreta}}
2. {{…}}

<!-- quality-check:verdict={{APPROVED|REJECTED|INCOMPLETE}} · fingerprint={{hash}} · generated={{YYYY-MM-DD}} -->
<!--
Esta marca es lo ÚNICO del informe con formato fijo: se CONSERVA al publicar y es lo que leen
`work-integrate` y `pr-create` para decidir si la puerta deja pasar. Sus claves y su valor van en
inglés SIEMPRE, aunque el resto del informe esté en otro idioma. Ver ../../reference/verdicts.md.
-->
