<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el informe final.

Esta plantilla es la referencia canónica del informe de auditoría de cumplimiento
(Architecture Compliance Checking). El skill adr-audit la lee antes de redactar cada
informe. Mantener la estructura: resumen → hallazgos agrupados por prioridad → resumen
de acciones. Un hallazgo = una regla incumplida (un ADR-XXX o una regla de AGENTS.md).
-->

# Informe de Auditoría de Cumplimiento — {{YYYY-MM-DD}}

**Fecha**: {{YYYY-MM-DD}}
**Repositorio**: {{nombre/ruta del repo o subproyecto auditado}}
**Alcance**: {{ADR auditados sobre el total y desglose por estado + fuentes AGENTS.md — p. ej. "10/12 · 1 Draft, 1 Superseded excluidos + AGENTS.md raíz"}}
**Método**: {{descripción corta de lo que realmente se usó en esta auditoría — herramientas de inspección y fitness functions ejecutadas, p. ej. "grep + lectura de package.json/pom.xml; fitness function dependency-cruiser ejecutada". No se corre el build ni la suite completa.}}
**Tipo de ejecución**: {{Nueva auditoría desde cero | Revalidación de audit-YYYY-MM-DD.md}}

## Resumen ejecutivo

| Prioridad | Cumplido ✅ | Parcial ⚠️ | Incumplido ❌ | No verificable ❔ |
|-----------|:----------:|:---------:|:------------:|:-----------------:|
| 🔴 Alta   | {{n}}      | {{n}}     | {{n}}        | {{n}}             |
| 🟡 Media  | {{n}}      | {{n}}     | {{n}}        | {{n}}             |
| ⚪ Baja   | {{n}}      | {{n}}     | {{n}}        | {{n}}             |

Veredicto general: {{Conforme | Conforme con observaciones | No conforme}}
{{1–3 frases con la lectura global de la salud arquitectónica del repo frente a sus normas.}}

---

## 🔴 Prioridad alta

<!--
Alta = el incumplimiento rompe una decisión Accepted de amplio impacto, introduce riesgo
de seguridad/integridad, o contradice una regla explícita marcada como obligatoria/bloqueante.
Repetir el bloque siguiente por cada hallazgo. Si no hay hallazgos, escribir "Sin hallazgos.".
-->

### {{ADR-012 | AGENTS.md §Regla}} — {{título de la regla o decisión}}

Fuente: {{docs/adr/ADR-012-graphql.md | AGENTS.md §APIs}}
Regla auditada: {{enunciado de la decisión/regla en una frase}}
Estado: {{✅ Cumplido | ⚠️ Parcialmente cumplido | ❌ Incumplido | ❔ No verificable}}

Evidencias:
- ✔ {{evidencia a favor — p. ej. "92% del código usa GraphQL"}}
- ✖ {{evidencia en contra — p. ej. "Se encontraron 3 endpoints REST nuevos"}}

Incumplimientos:
- `{{src/UserController.php}}` — {{qué infringe concretamente}}
- `{{src/ProductController.php}}` — {{qué infringe concretamente}}

Acción sugerida: {{acción concreta y accionable — migrar, revertir, documentar excepción, crear/actualizar ADR, etc.}}

---

## 🟡 Prioridad media

<!-- Media = decisión relevante con alcance acotado, o desviación parcial sin riesgo inmediato. -->

### {{ADR-XXX | AGENTS.md §Regla}} — {{título}}

Fuente: {{ruta}}
Regla auditada: {{enunciado}}
Estado: {{✅ | ⚠️ | ❌ | ❔}}

Evidencias:
- ✔ {{…}}
- ✖ {{…}}

Incumplimientos:
- `{{ruta/archivo}}` — {{detalle}}

Acción sugerida: {{…}}

---

## ⚪ Prioridad baja

<!-- Baja = convenciones, estilo, impacto menor, o desviaciones tolerables. -->

### {{ADR-XXX | AGENTS.md §Regla}} — {{título}}

Fuente: {{ruta}}
Regla auditada: {{enunciado}}
Estado: {{✅ | ⚠️ | ❌ | ❔}}

Evidencias:
- ✔ {{…}}
- ✖ {{…}}

Incumplimientos:
- `{{ruta/archivo}}` — {{detalle}}

Acción sugerida: {{…}}

---

## Fitness functions

<!--
Sección de arquitectura evolutiva. Reportar el estado de las fitness functions (chequeos
automatizados que validan los ADR). Dos partes: existentes (ejecutadas) y sugeridas (ADR
aptos que aún no tienen una). Si un ADR no es apto para automatizar, no listarlo aquí.
-->

### Existentes (ejecutadas)

| ADR | Fitness function / herramienta | Comando ejecutado | Resultado |
|-----|-------------------------------|-------------------|-----------|
| {{ADR-012}} | {{dependency-cruiser: no-rest-endpoints}} | {{npx depcruise --config .dependency-cruiser.js src}} | {{❌ FAIL (2 violaciones) \| ✅ PASS \| ⚠️ No ejecutable: falta runtime}} |

{{Si hay violaciones, detallarlas bajo el hallazgo del ADR correspondiente. Si no hay fitness functions existentes, escribir "Ninguna detectada.".}}

### Sugeridas (ADR apto sin fitness function)

<!--
Por cada ADR apto que NO tiene fitness function, sugerir crearla. Si todos los ADR aptos ya
tienen una, escribir "Ninguna: todos los ADR aptos ya están cubiertos.".
-->

**{{ADR-007}} — {{título}}**
- Qué medir: {{la característica arquitectónica a comprobar}}
- Herramienta sugerida: {{ArchUnit \| dependency-cruiser \| import-linter \| NetArchTest \| script CI}}
- Esbozo: {{una frase de cómo sería el chequeo}}

### ADR no aptos para fitness function

<!-- ADR cuyo cumplimiento depende de criterio humano o evidencia externa; se auditan manualmente. -->
- {{ADR-XXX}} — {{por qué no es automatizable}}

---

## Resumen de acciones

| # | Prioridad | Regla | Acción sugerida | Estado |
|---|-----------|-------|-----------------|--------|
| 1 | 🔴 Alta   | {{ADR-012}} | {{acción}} | {{⬜ Pendiente}} |
| 2 | 🟡 Media  | {{ADR-XXX}} | {{acción}} | {{⬜ Pendiente}} |
| 3 | ⚪ Baja   | {{AGENTS.md §X}} | {{acción}} | {{⬜ Pendiente}} |

<!--
Estados de acción sugeridos: ⬜ Pendiente · 🔄 En progreso · ✅ Resuelto · 🚫 No aplica (excepción aceptada).
En una revalidación, arrastrar los estados de la auditoría anterior y actualizarlos según la evidencia nueva.
-->

## Reglas no verificables por inspección estática

<!--
Listar aquí las reglas/ADR cuyo cumplimiento no se puede confirmar solo leyendo el repo
(p. ej. "usar cifrado en tránsito en producción"). Indicar qué evidencia externa haría falta.
Si no hay, escribir "Ninguna.".
-->
- {{ADR-XXX / regla}} — {{por qué no es verificable + evidencia que la confirmaría}}
