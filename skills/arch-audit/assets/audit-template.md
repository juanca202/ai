<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el informe final.

Esta plantilla es la referencia canónica del informe de auditoría de cumplimiento
(Architecture Compliance Checking). El skill arch-audit la lee antes de redactar cada informe.
La UNIDAD AUDITABLE es el REQUISITO (una regla `<estándar>/<requisito>` dentro de un estándar de
dominio en docs/standards/ — que se identifica por su nombre, sin código), redactado con RFC 2119.
Se audita el cumplimiento de esos requisitos y de AGENTS.md contra el estado real del repo, citando el
ADR de origen de cada requisito. Mantener la estructura: resumen → hallazgos agrupados por prioridad →
fitness functions → reglas no verificables → decisiones sin requisito → revalidaciones (si las hay).
Un hallazgo = un requisito incumplido (`<estándar>/<requisito>`) o una regla de AGENTS.md.

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
**Alcance**: {{requisitos auditados sobre el total y estándares de dominio cubiertos + fuentes AGENTS.md — p. ej. "14 requisitos en 4 estándares (Testing, API, Persistence, Security) · 2 en Draft excluidos + AGENTS.md raíz"}}
**Método**: {{descripción corta de lo que realmente se usó — herramientas de inspección y fitness functions ejecutadas, p. ej. "grep + lectura de package.json/composer.json; agrupador scripts/arch/verify-architecture.sh ejecutado". No se corre el build ni la suite completa.}}
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
Alta = incumple un requisito MUST/REQUIRED/SHALL de un estándar Active de amplio impacto, introduce
riesgo de seguridad/integridad, o contradice una regla de AGENTS.md obligatoria/bloqueante.
Repetir el bloque siguiente por cada hallazgo. Si no hay hallazgos, escribir "Sin hallazgos.".
-->

### {{api/api-protocol | AGENTS.md §Regla}} — {{título del requisito}}

**Requisito:** {{api/api-protocol (estándar de dominio «API Standards») | N/A si es regla de AGENTS.md}}
**Fuente:** {{docs/standards/api.md → requisito «API protocol» | AGENTS.md §APIs}}
**Decisión de origen:** {{ADR-012 (docs/adr/ADR-012-graphql.md) | N/A si es regla de AGENTS.md}}
**Regla auditada (RFC 2119):** {{enunciado con su palabra clave — p. ej. "Toda API expuesta **MUST** implementarse en GraphQL"}}
**Estado:** {{✅ Cumplido | ⚠️ Parcialmente cumplido | ❌ Incumplido | ❔ No verificable}}

**Evidencias:**
- ✔ {{evidencia a favor — p. ej. "92% del código usa GraphQL"}}
- ✖ {{evidencia en contra — p. ej. "Se encontraron 3 endpoints REST nuevos"}}

**Incumplimientos:**
- `{{src/UserController.php}}` — {{qué infringe concretamente}}
- `{{src/ProductController.php}}` — {{qué infringe concretamente}}

**Acción sugerida:** 
{{acción concreta y accionable — migrar, revertir, documentar excepción en el requisito, actualizar requisito/ADR, etc.}}

## 🟡 Prioridad media

<!-- Media = incumple un requisito relevante de alcance acotado (o un SHOULD de peso), o desviación parcial sin riesgo inmediato. -->

### {{<estándar>/<requisito> | AGENTS.md §Regla}} — {{título}}

**Requisito:** {{<estándar>/<requisito> (estándar «Nombre») | N/A}}
**Fuente:** {{docs/standards/<slug>.md → requisito «…»}}
**Decisión de origen:** {{ADR-XXX | N/A}}
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

### {{<estándar>/<requisito> | AGENTS.md §Regla}} — {{título}}

**Requisito:** {{<estándar>/<requisito> (estándar «Nombre») | N/A}}
**Fuente:** {{docs/standards/<slug>.md → requisito «…»}}
**Decisión de origen:** {{ADR-XXX | N/A}}
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
que validan REQUISITOS). Dos partes: existentes (ejecutadas) y sugeridas (requisitos aptos que aún no
tienen una). Si un requisito no es apto para automatizar, no listarlo aquí.
-->

### Existentes

| Requisito | Fitness function / herramienta | Comando ejecutado | Resultado |
|-----------|-------------------------------|-------------------|-----------|
| {{api/api-protocol}} | {{dependency-cruiser: no-rest-endpoints}} | {{npx depcruise --config .dependency-cruiser.js src}} | {{❌ FAIL (2 violaciones) \| ✅ PASS \| ⚠️ No ejecutable: falta runtime}} |

{{Si hay violaciones, detallarlas bajo el hallazgo del requisito correspondiente. Si no hay fitness functions existentes, escribir "Ninguna detectada.".}}

### Sugeridas

<!--
Por cada requisito apto que NO tiene fitness function, sugerir crearla. Si todos los requisitos aptos
ya tienen una, escribir "Ninguna: todos los requisitos aptos ya están cubiertos.".
-->

**{{testing/e2e-testing}} — {{título}}**
- **Qué medir:** {{la característica arquitectónica a comprobar}}
- **Herramienta sugerida:** {{ArchUnit \| dependency-cruiser \| import-linter \| NetArchTest \| runner del framework \| script CI}}
- **Esbozo:** {{una frase de cómo sería el chequeo}}

### Requisitos no aptos para fitness function

<!-- Requisitos cuyo cumplimiento depende de criterio humano o evidencia externa; se auditan manualmente. -->
- {{<estándar>/<requisito>}} — {{por qué no es automatizable}}

## Reglas no verificables por inspección estática

<!--
Listar aquí los requisitos/reglas cuyo cumplimiento no se puede confirmar solo leyendo el repo
(p. ej. "usar cifrado en tránsito en producción"). Indicar qué evidencia externa haría falta.
Si no hay, escribir "Ninguna.".
-->
- {{<estándar>/<requisito> / regla}} — {{por qué no es verificable + evidencia que la confirmaría}}

## Decisiones sin requisito (trazabilidad)

<!--
Opcional. ADR Accepted que contienen una regla claramente enforceable pero que NO fijaron ningún
requisito (emits: []). No se auditan como norma; se sugiere emitir el requisito vía arch-manage (en el
estándar de dominio que corresponda) para que la regla sea auditable. Si no hay, omitir o "Ninguna.".
-->
- {{ADR-XXX}} — {{regla enforceable sin requisito emitido}} → sugerir emitir requisito vía `arch-manage`.

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

- {{<estándar>/<requisito> | AGENTS.md §Regla}} — {{✅ Resuelto | ❌ Nuevo incumplimiento | ⚠️ Regresión / cambio de evidencia}}: {{descripción corta del cambio, con rutas afectadas si aplica}}

{{Si no hubo ningún cambio desde la última verificación, escribir "Sin cambios respecto a la última verificación." y omitir la lista de arriba.}}
