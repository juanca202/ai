# Vocabulario de veredictos y estados — base común

Referencia transversal del plugin **SDD Devkit**. Fija cómo se nombran los veredictos y los estados en
los informes que emiten un veredicto —las tres puertas de cierre (`quality-check`, `code-review`,
`trace-validate`) y `arch-audit`— y cómo los leen sus consumidores (`work-integrate`, `pr-create`,
`work-implement`).

## La regla

Todo veredicto y todo estado tiene **tres formas**, y cada una tiene su lugar:

| Forma | Qué es | Dónde se usa |
|-------|--------|--------------|
| **Valor canónico** | Identificador estable en MAYÚSCULAS (`APPROVED`, `PASS`, `BLOCKING`…). No es idioma, es un identificador. | El razonamiento del skill, las tablas normativas de su `SKILL.md` y sus `references/`, y los artefactos que consume una máquina (`test-run.json`). |
| **Símbolo** | El emoji/carácter asociado (`✅`, `❌`, `⚠️`, `⏭️`, `⏸️`, `—`). | El informe, siempre pegado a la etiqueta. **Es el contrato entre skills.** |
| **Etiqueta** | La palabra que lee la persona. | **Solo** el informe, y **siempre redactada en el idioma resuelto** por [`language.md`](language.md). |

> **Ninguna etiqueta se fija en un idioma concreto.** Un catálogo que escribe «Aprobado» en un informe
> cuyo idioma resuelto es inglés está incumpliendo la sección «Resolución de idioma» de ese skill. La
> etiqueta se redacta al momento de escribir el informe, a partir del valor canónico.

> **Nunca al revés.** El valor canónico no se traduce, ni en el razonamiento, ni en `test-run.json`, ni
> en las tablas normativas de los `SKILL.md`. Escribir una etiqueta traducida donde va un valor canónico
> rompe el esquema o la comparación.

## Veredictos

**Hay un solo vocabulario de veredicto para todo el catálogo.** Los cuatro informes que emiten uno
—`quality-check`, `code-review`, `trace-validate` y `arch-audit`— usan estos mismos cuatro valores en la
línea `Veredicto:`. Cada uno emite el subconjunto que le aplica; ninguno inventa valores propios:

| Valor canónico | Símbolo | Lo emite | Efecto en el cierre |
|----------------|---------|----------|---------------------|
| `APPROVED` | `✅` | los cuatro | Deja pasar. |
| `REJECTED` | `❌` | los cuatro | **Bloquea.** |
| `INCOMPLETE` | `⚠️` | `quality-check`, `code-review` | **Bloquea.** No se pudo verificar todo. |
| `APPROVED_WITH_NOTES` | `⚠️` | `trace-validate`, `arch-audit` | **No bloquea**: se muestran las observaciones y se continúa. |

`arch-audit` no es una puerta de cierre —su veredicto no condiciona ningún merge—, pero lo nombra igual
que las tres puertas: un informe de auditoría se lee con el mismo vocabulario que un informe de calidad.

> **El `⚠️` es ambiguo por sí solo** — significa `INCOMPLETE` (bloquea) en `quality-check` y
> `code-review`, y `APPROVED_WITH_NOTES` (no bloquea) en `trace-validate` y `arch-audit`. Se desambigua
> por **qué informe lo emite** y por el **valor canónico de la marca oculta**, nunca por la palabra que
> lleva al lado. Un consumidor que decida leyendo la etiqueta se rompe en cuanto cambia el idioma del repo.

## Etiquetas visibles vs. identificadores ocultos

| Dónde | Idioma | Ejemplo |
|-------|--------|---------|
| **Texto visible del documento** — títulos de sección, etiquetas de campo del encabezado, celdas, leyendas, prosa | **Idioma resuelto.** Es contenido que lee una persona. | `**Veredicto:** ✅ Aprobado` · `**Estado:** Ready` |
| **Marcas ocultas y frontmatter** — comentarios HTML que otro skill parsea, claves de frontmatter | **Siempre en inglés.** Son identificadores, no contenido. | `<!-- code-review:verdict=APPROVED · mode=default -->` |

> **La etiqueta visible nunca es el ancla de parseo.** `**Veredicto:**` se llamará `**Verdict:**` en un repo
> en inglés y `**Verdикт:**` en otro idioma: comparar contra ella se rompe en cuanto cambia el idioma del
> repo. Lo que se compara es siempre la **marca oculta**, cuyas claves y valores son estables.

## Cómo lo lee un consumidor

`work-integrate`, `pr-create` y cualquier otro skill que compruebe una puerta **leen la marca oculta del
pie del informe**, no la línea visible del veredicto:

```
<!-- quality-check:verdict=APPROVED · fingerprint=<hash> · generated=YYYY-MM-DD -->
<!-- code-review:verdict=APPROVED · mode=default · fingerprint=<hash> · base=<sha-corto> · generated=YYYY-MM-DD -->
<!-- trace-validate:verdict=APPROVED_WITH_NOTES · fingerprint=<hash> · spec=<hash> · generated=YYYY-MM-DD -->
<!-- arch-audit:verdict=APPROVED · generated=YYYY-MM-DD -->
```

- `verdict=APPROVED` → deja pasar.
- `verdict=REJECTED` → bloquea, siempre.
- `verdict=INCOMPLETE` → bloquea (solo lo emiten `quality-check` y `code-review`).
- `verdict=APPROVED_WITH_NOTES` → **no** bloquea (lo emiten `trace-validate` y `arch-audit`): se muestran
  las observaciones y se continúa.

El valor canónico de la marca es **inequívoco por sí solo**, a diferencia del símbolo `⚠️`, que significa
cosas opuestas según el informe. La marca se **conserva** al publicar el informe: es lo único del
documento que sobrevive con formato fijo.

**Nunca comparar contra la etiqueta visible.** Ni contra «Aprobado», ni contra «Approved», ni el símbolo.

## Estados dentro del informe

Cada puerta define su propio juego de estados en su `SKILL.md` — cobertura, categoría de check,
resultado de ejecución, severidad de hallazgo—, pero todos siguen la misma regla de tres formas: el
skill razona en **valor canónico**, la celda del informe lleva **símbolo + etiqueta en el idioma
resuelto**, y la leyenda al inicio del informe ata una cosa con la otra en ese mismo idioma.

Los estados que **no** tienen símbolo propio (p. ej. las categorías `BLOCKING` / `CONDITIONAL` de
`quality-check`) llevan en la celda solo la etiqueta en el idioma resuelto; su valor canónico vive en el
`SKILL.md` y en la leyenda. Como ningún skill los lee desde fuera del informe, la leyenda basta.

## Lo que no se traduce nunca

Todo esto son **identificadores**, no contenido:

- El `result` de `.sdd-devkit/test-run.json`: `PASS` · `FAIL` · `SKIPPED` · `N/A`, y el resto de sus claves.
- Las claves y los valores de `.sdd-devkit/settings.json`.
- Las **marcas ocultas** de los artefactos y todas sus claves (`verdict`, `status`, `testType`,
  `fingerprint`, `spec`, `base`, `mode`, `generated`…).
- Los **valores** de los campos de estado, aunque su etiqueta visible sí se traduzca:
  `Draft` / `Ready` / `Obsolete` en un TC, `Pending` / `In Progress` / `Done` en `progress.md`,
  `Unit` / `Integration` / `API Test` / `Visual Test` / `E2E` / `Manual` como tipo de prueba.
- Los nombres de los modificadores de invocación y los identificadores de suite.
- Los identificadores de artefacto (`US-XXX`, `TK-XXX`, `WI-XXX`, `TC-XXX`, `FT-XXX`, `ADR-XXX`,
  `AC-XXX`, `BR-XX`, `CR-XXX`, `RS-XXX`) y los nombres de skill.

Y al revés: **sí** se traducen las etiquetas visibles de esos mismos campos —`**Estado:**`,
`**Tipo de prueba:**`, `**Veredicto:**`, `**Fecha:**`— y todos los títulos de sección, porque son texto
que lee una persona.
