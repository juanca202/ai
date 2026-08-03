<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

Este es el discovery.md del FLUJO D (análisis legacy) de work-research.
Vive junto al README.md del RS:
  docs/specs/research/RS-XXX-{slug}/discovery.md

Reconstruye por ingeniería inversa, en cascada, lo que el código HACE:
  Artefactos técnicos → Casos de uso → Objetivos de usuario → Capabilities →
  Features (división + cohesión) → Reglas de negocio → (mapa a FEAT-XXX propuestos)
Reglas:
  - Describir el comportamiento ACTUAL del código, no el deseado.
  - Cada hallazgo cita evidencia (archivo y símbolo). Sin evidencia → ⚠️ Sin evidencia.
  - No proponer Features a ojo: deben pasar criterios de división y métricas de cohesión.
  - Los posibles bugs se marcan; no se convierten en criterio sin decisión del usuario.
-->

# RS-{{XXX}} · Discovery legacy — {{Nombre del código/módulo analizado}}

**Estado:** {{Draft | Ready}}
**Código en alcance:** {{rutas / módulos / entrypoints}}
**Versión analizada:** {{commit | branch | tag}}
**Creado por:** {{git config user.name}}
**Fecha:** {{YYYY-MM-DD}}

## 1. Artefactos técnicos

{{Inventario exhaustivo del código en alcance. Base de evidencia de todo lo demás.}}

| Artefacto | Tipo | Descripción (observada) | Ubicación en código | Evidencia |
| --------- | ---- | ----------------------- | ------------------- | --------- |
| {{Artefacto 1}} | {{Entidad / Endpoint / Comando / Evento / Job / Pantalla / Servicio}} | {{qué es / qué hace}} | {{ruta/archivo · símbolo}} | {{ruta HTTP / nombre de job / vista / …}} |

> Tipos: Entidad · Endpoint · Comando · Evento · Job · Pantalla · Servicio.
> Omite tipos ausentes en el alcance; no inventes. Todo ítem sin ancla → `⚠️ Sin evidencia`.

## 2. Casos de uso reconstruidos

{{Interacciones actor↔sistema derivadas de los artefactos. Cada CU cita artefactos del §1.}}

| Caso de uso | Actor | Artefactos involucrados | Flujo observado (principal + alternos/errores) | Ubicación en código |
| ----------- | ----- | ----------------------- | ---------------------------------------------- | ------------------- |
| {{CU 1}} | {{actor inferido}} | {{Artefacto 1, Artefacto 3}} | {{pasos que ejecuta el código, incluyendo ramas y validaciones}} | {{ruta/archivo · símbolo}} |

## 3. Agrupación por objetivo del usuario

{{Casos de uso agrupados por el mismo "para qué" de negocio, no por módulo técnico.}}

| Objetivo del usuario | Casos de uso incluidos | Justificación del agrupamiento |
| -------------------- | ---------------------- | ------------------------------ |
| {{Objetivo 1}} | {{CU 1, CU 2}} | {{por qué comparten el mismo propósito de usuario}} |

## 4. Capabilities

{{Capacidades de dominio derivadas de los objetivos. Nivel más amplio que un Feature.}}

| Capability | Objetivo(s) de usuario | Casos de uso | Artefactos clave | Descripción (observada) |
| ---------- | ---------------------- | ------------ | ---------------- | ----------------------- |
| {{Capability 1}} | {{Objetivo 1}} | {{CU 1, CU 2}} | {{Artefacto 1, …}} | {{área de capacidad que el código implementa}} |

## 5. Features candidatos (división desde Capabilities)

{{Recortes de cada Capability. Dividir solo si aplica ≥1 criterio; si ninguno, la Capability es un único Feature.}}

| Feature candidato | Capability padre | Criterio(s) de división | Casos de uso | Artefactos | Descripción (observada) |
| ----------------- | ---------------- | ----------------------- | ------------ | ---------- | ----------------------- |
| {{Feature 1}} | {{Capability 1}} | {{Reglas indep. / Evolución indep. / Prueba indep. / Feature flag}} | {{CU 1}} | {{…}} | {{qué hace este recorte}} |

> Criterios de división (basta uno): reglas independientes · evolución independiente ·
> prueba independiente · despliegue/habilitación por feature flag.
> Si ningún criterio aplica → un Feature = la Capability entera. No fragmentar por carpeta.

## 6. Validación de cohesión

{{Un Feature solo se acepta si cumple las cinco métricas. Veredicto ≠ Aceptado → reagrupar/dividir antes del mapa FEAT.}}

| Feature | Objetivo principal | Cohesión | Acoplamiento | Vocabulario | Límites | Veredicto |
| ------- | ------------------ | -------- | ------------ | ----------- | ------- | --------- |
| {{Feature 1}} | {{oración con el "para qué" único}} | {{Alta / Media / Baja}} | {{Bajo / Medio / Alto · Features acoplados}} | {{OK / Inconsistente}} | {{Claros / Difusos}} | {{Aceptado / Reagrupar / Dividir más}} |

> Métricas obligatorias: (1) un objetivo principal, (2) alta cohesión funcional,
> (3) bajo acoplamiento con otros Features, (4) vocabulario de negocio consistente,
> (5) límites claros de responsabilidad.

## 7. Reglas de negocio descubiertas

{{Validaciones, cálculos, condiciones, límites, transiciones, defaults y efectos que el código aplica — solo sobre Features aceptados.}}

| BR-XX | Feature | Regla (enunciado observado) | Tipo | Dónde se aplica | Confianza | ¿Posible bug? |
| ----- | ------- | --------------------------- | ---- | --------------- | --------- | ------------- |
| BR-01 | {{Feature 1}} | {{afirmación verificable}} | {{Validación / Cálculo / Flujo / Autorización / Persistencia}} | {{ruta/archivo · símbolo}} | {{Alta / Media / Baja}} | {{No / Sí — ver Notas}} |

> Tipo: Validación · Cálculo · Flujo · Autorización · Persistencia.
> Confianza: Alta (explícita en código) · Media · Baja (inferida indirectamente).
> Toda regla con `¿Posible bug? = Sí` debe describirse en Notas y **consultarse con
> el usuario** antes de convertirse en criterio de aceptación (preservar vs. corregir).

## 8. Cobertura de pruebas existente

{{Qué pruebas ya cubren el código en alcance; justifica dónde enfocar la regeneración.}}

| Componente / Feature | Pruebas existentes (tipo · ubicación) | Cobertura | Gap (qué falta cubrir) |
| -------------------- | ------------------------------------- | --------- | ---------------------- |
| {{Feature 1}} | {{unit/integración/e2e · ruta}} | {{Alta / Media / Baja / Nula}} | {{escenarios sin cubrir}} |

## 9. Mapa Feature → FEAT-XXX propuesto

{{Puente hacia la creación de features. Solo Features con veredicto Aceptado.
Cada fila se materializará como `docs/specs/features/FEAT-XXX-{slug}/`.}}

| Feature | Capability padre | FEAT propuesto (slug) | Casos de uso incluidos | Reglas de negocio (BR-XX) | Prioridad (según gap de cobertura) |
| ------- | ---------------- | --------------------- | ---------------------- | ------------------------- | ---------------------------------- |
| {{Feature 1}} | {{Capability 1}} | {{feat-slug}} | {{CU 1, CU 2}} | {{BR-01, BR-03}} | {{Alta / Media / Baja}} |

## Notas

<!--
Listar aquí TODO pendiente que mantenga el discovery en Draft:
  - Hallazgos ⚠️ Sin evidencia por resolver.
  - Features con veredicto Reagrupar / Dividir más.
  - Reglas con ¿Posible bug? = Sí y la decisión del usuario (preservar / corregir) o su ausencia.
  - Actores no identificados, confianza Baja por confirmar, supuestos.
Si no queda ningún pendiente, el discovery puede pasar a Ready.
-->

- {{pendiente 1}}
