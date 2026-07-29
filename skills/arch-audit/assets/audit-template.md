<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el informe final.

Esta plantilla es la referencia canónica del informe de auditoría de cumplimiento
(Architecture Compliance Checking). El skill arch-audit la lee antes de redactar cada informe.
La UNIDAD AUDITABLE es el CRITERIO de cumplimiento (una fila `<estándar>/CR-XXX` dentro de un estándar de
dominio técnico o funcional en docs/standards/ — que se identifica por su nombre, sin código),
agrupado por su requisito (`<estándar>/<slug-requisito>`, una agrupación legible que da contexto) y
redactado de forma medible, con RFC 2119 cuando es normativa. Se audita el cumplimiento de esos
criterios y de AGENTS.md contra el estado real del repo, citando el ADR de origen de cada criterio.
Mantener la estructura: resumen → hallazgos agrupados por prioridad → fitness functions → reglas no
verificables → decisiones sin criterio → revalidaciones (si las hay).
Un hallazgo = un criterio incumplido (`<estándar>/CR-XXX`) o una regla de AGENTS.md.

Todo el contenido hasta "## Reglas no verificables por inspección estática" (incluida la cabecera)
se escribe una sola vez, al crear el informe, y permanece inalterado en el tiempo — las
revalidaciones NO lo modifican, con una única excepción: el campo "Veredicto" de la
cabecera, que sí se actualiza en cada revalidación para reflejar el veredicto vigente y la
fecha/hora que lo confirma. Cada revalidación posterior agrega además una entrada nueva en
"## Revalidaciones" al final del documento, sin tocar nada de lo anterior.
-->

# Informe de Auditoría de Cumplimiento — {{YYYY-MM-DD}}

**Fecha**: {{YYYY-MM-DD}}
**Repositorio**: {{nombre/ruta del repo o subproyecto auditado}}
**Alcance**: {{criterios auditados y estándares/requisitos de contexto cubiertos + fuentes AGENTS.md — p. ej. "14 criterios en 4 estándares (Testing, API, Persistence, Security) · 2 en Draft excluidos + AGENTS.md raíz"}}
**Método**: {{descripción corta de lo que realmente se usó — herramientas de inspección y fitness functions ejecutadas, p. ej. "grep + lectura de package.json/composer.json; runner node scripts/arch/verify.mjs ejecutado". No se corre el build ni la suite completa.}}
**Veredicto**: {{✅ Conforme | ❌ No conforme | ⚠️ Conforme con observaciones}} {{si hubo alguna revalidación, agregar aquí mismo "(revalidado YYYY-MM-DD HH:MM)" con la fecha/hora de la última entrada de ## Revalidaciones; omitir si no hubo ninguna}}

## Resumen

| Prioridad | Cumplido ✅ | Parcial ⚠️ | Incumplido ❌ | No verificable ❔ |
|-----------|:----------:|:---------:|:------------:|:-----------------:|
| 🔴 Alta   | {{n}}      | {{n}}     | {{n}}        | {{n}}             |
| 🟡 Media  | {{n}}      | {{n}}     | {{n}}        | {{n}}             |
| ⚪ Baja   | {{n}}      | {{n}}     | {{n}}        | {{n}}             |

{{1–3 frases con la lectura global de la salud arquitectónica del repo frente a sus estándares.}}

---

## 🔴 Prioridad alta

<!--
Alta = incumple un criterio MUST/REQUIRED/SHALL de un estándar Active de amplio impacto, introduce
riesgo de seguridad/integridad, o contradice una regla de AGENTS.md obligatoria/bloqueante. A igualdad
de término RFC 2119, un criterio con Enfoque bloqueante pesa más que uno warning.
Repetir el bloque siguiente por cada hallazgo. Si no hay hallazgos, escribir "Sin hallazgos.".
-->

### {{api/CR-001 | AGENTS.md §Regla}} — {{título del criterio}}

**Criterio:** {{api/CR-001 (requisito `api/api-protocol`, estándar de dominio «API Standards») | N/A si es regla de AGENTS.md}}
**Fuente:** {{docs/standards/api.md → requisito «API protocol» → CR-001 | AGENTS.md §APIs}}
**Decisión de origen:** {{ADR-012 (docs/adr/ADR-012-graphql.md) | N/A si es regla de AGENTS.md}}
**Enfoque:** {{bloqueante | warning | N/A si es regla de AGENTS.md}}
**Regla auditada (RFC 2119):** {{enunciado con su palabra clave — p. ej. "Toda API expuesta **MUST** implementarse en GraphQL"}}
**Estado:** {{✅ Cumplido | ⚠️ Parcialmente cumplido | ❌ Incumplido | ❔ No verificable}}

**Evidencias:**
- ✔ {{evidencia a favor — p. ej. "92% del código usa GraphQL"}}
- ✖ {{evidencia en contra — p. ej. "Se encontraron 3 endpoints REST nuevos"}}

**Incumplimientos:**
- `{{src/UserController.php}}` — {{qué infringe concretamente}}
- `{{src/ProductController.php}}` — {{qué infringe concretamente}}

**Acción sugerida:** 
{{acción concreta y accionable — migrar, revertir, documentar excepción en el criterio, actualizar criterio/ADR, etc.}}

## 🟡 Prioridad media

<!-- Media = incumple un criterio relevante de alcance acotado (o un SHOULD de peso), o desviación parcial sin riesgo inmediato. Un criterio warning incumplido tiende a Media/Baja. -->

### {{<estándar>/CR-XXX | AGENTS.md §Regla}} — {{título}}

**Criterio:** {{<estándar>/CR-XXX (requisito `<estándar>/<slug-requisito>`, estándar «Nombre») | N/A}}
**Fuente:** {{docs/standards/<slug>.md → requisito «…» → CR-XXX}}
**Decisión de origen:** {{ADR-XXX | N/A}}
**Enfoque:** {{bloqueante | warning | N/A}}
**Regla auditada (RFC 2119):** {{enunciado}}
**Estado:** {{✅ | ⚠️ | ❌ | ❔}}

**Evidencias:**
- ✔ {{…}}
- ✖ {{…}}

**Incumplimientos:**
- `{{ruta/archivo}}` — {{detalle}}

**Acción sugerida:** 
{{…}}

## ⚪ Prioridad baja

<!-- Baja = convenciones, estilo, un SHOULD/MAY de bajo impacto, o desviaciones tolerables. -->

### {{<estándar>/CR-XXX | AGENTS.md §Regla}} — {{título}}

**Criterio:** {{<estándar>/CR-XXX (requisito `<estándar>/<slug-requisito>`, estándar «Nombre») | N/A}}
**Fuente:** {{docs/standards/<slug>.md → requisito «…» → CR-XXX}}
**Decisión de origen:** {{ADR-XXX | N/A}}
**Enfoque:** {{bloqueante | warning | N/A}}
**Regla auditada (RFC 2119):** {{enunciado}}
**Estado:** {{✅ | ⚠️ | ❌ | ❔}}

**Evidencias:**
- ✔ {{…}}
- ✖ {{…}}

**Incumplimientos:**
- `{{ruta/archivo}}` — {{detalle}}

**Acción sugerida:** 
{{…}}

---

## Fitness functions

<!--
Sección de arquitectura evolutiva. Reportar el estado de las fitness functions (chequeos automatizados
que validan CRITERIOS, uno por CR). Dos partes: existentes (ejecutadas) y sugeridas (criterios aptos que
aún no tienen una). Si un criterio no es apto para automatizar, no listarlo aquí. Indicar también, si
existe, el runner scripts/arch/verify.<ext> (en el lenguaje del stack del repo) y su resultado conjunto
(criterios PASS / WARN / FAIL); sale con código ≠ 0 solo si falla algún CR bloqueante (un CR warning
que falla es WARN, no cambia el veredicto).
-->

### Existentes

| Criterio (CR) | Enfoque | Fitness function / herramienta | Comando ejecutado | Resultado |
|---------------|---------|-------------------------------|-------------------|-----------|
| {{api/CR-001}} | {{bloqueante \| warning}} | {{dependency-cruiser: no-rest-endpoints}} | {{npx depcruise --config .dependency-cruiser.js src}} | {{❌ FAIL (2 violaciones) \| ✅ PASS \| ⚠️ WARN \| ⚠️ No ejecutable: falta runtime}} |

{{Si hay violaciones, detallarlas bajo el hallazgo del criterio correspondiente. Si no hay fitness functions existentes, escribir "Ninguna detectada.".}}

### Sugeridas

<!--
Por cada criterio apto que NO tiene fitness function (Verificación: TODO), sugerir crearla. Si todos los
criterios aptos ya tienen una, escribir "Ninguna: todos los criterios aptos ya están cubiertos.".
-->

**{{testing/CR-003}} — {{título}}**
- **Qué medir:** {{la característica arquitectónica a comprobar}}
- **Herramienta sugerida:** {{ArchUnit \| dependency-cruiser \| import-linter \| NetArchTest \| runner del framework \| script CI}}
- **Esbozo:** {{una frase de cómo sería el chequeo}}

### Criterios no aptos para fitness function

<!-- Criterios cuyo cumplimiento depende de criterio humano o evidencia externa; se auditan manualmente. -->
- {{<estándar>/CR-XXX}} — {{por qué no es automatizable}}

## Reglas no verificables por inspección estática

<!--
Listar aquí los criterios/reglas cuyo cumplimiento no se puede confirmar solo leyendo el repo
(p. ej. "usar cifrado en tránsito en producción"). Indicar qué evidencia externa haría falta.
Si no hay, escribir "Ninguna.".
-->
- {{<estándar>/CR-XXX / regla}} — {{por qué no es verificable + evidencia que la confirmaría}}

## Decisiones sin criterio (trazabilidad)

<!--
Opcional. ADR Accepted que contienen una regla claramente enforceable pero que NO fijaron ningún
criterio (emits: []). No se auditan como norma; se sugiere emitir el criterio vía arch-manage (en el
estándar de dominio que corresponda) para que la regla sea auditable. Si no hay, omitir o "Ninguna.".
-->
- {{ADR-XXX}} — {{regla enforceable sin criterio emitido (emits: [])}} → sugerir emitir criterio vía `arch-manage`.

## Observaciones

<!--
Opcional. Notas operativas que no son un hallazgo de incumplimiento (no van bajo 🔴/🟡/⚪) ni una
decisión sin criterio, pero que la próxima auditoría o el mantenimiento del harness debería conocer.
Ejemplos: una fitness function ejecutada individualmente porque no está registrada en el archivo de
checks de su estándar (scripts/arch/checks/<slug-estándar>.<ext>); un runner o checks escritos en un
lenguaje ajeno al stack del repo; un estándar o ADR en formato antiguo (sin "**Dominio:**", sin "emits",
o con los criterios en tablas por requisito en vez de la tabla única); una dependencia que el
usuario rechazó instalar (Fase 3.5). Si no hay ninguna, omitir esta sección o escribir "Ninguna.".
-->
- {{criterio o archivo afectado}} — {{qué se observó y qué acción se sugiere, si aplica}}

---

## Revalidaciones

<!--
Esta sección solo existe si el informe fue revalidado al menos una vez. Todo lo anterior (resumen,
hallazgos, fitness functions, reglas no verificables) se escribió una sola vez al crear el informe
y no se toca en revalidaciones posteriores.

Cada revalidación agrega una entrada NUEVA al final de esta sección (nunca editar ni eliminar
entradas anteriores) mostrando solo los cambios evidenciados en esa corrida frente al estado
anterior — no repetir hallazgos sin cambios. El veredicto resultante de la última entrada se
refleja también en "Veredicto" de la cabecera, junto a la fecha/hora que lo confirma.
-->

### Revalidación — {{YYYY-MM-DD HH:MM}}

**Veredicto resultante**: {{✅ Conforme | ❌ No conforme | ⚠️ Conforme con observaciones}}

**Cambios evidenciados:**

- {{<estándar>/CR-XXX | AGENTS.md §Regla}} — {{✅ Resuelto | ❌ Nuevo incumplimiento | ⚠️ Regresión / cambio de evidencia}}: {{descripción corta del cambio, con rutas afectadas si aplica}}

{{Si no hubo ningún cambio desde la última verificación, escribir "Sin cambios respecto a la última verificación." y omitir la lista de arriba.}}
