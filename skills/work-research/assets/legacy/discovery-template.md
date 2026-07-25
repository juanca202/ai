<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

Este es el discovery.md del FLUJO D (análisis legacy) de work-research.
Vive junto al README.md del RS:
  docs/specs/research/RS-XXX-{slug}/discovery.md

Reconstruye por ingeniería inversa, en cascada, lo que el código HACE:
  Features → Casos de uso → Reglas de negocio → (mapa a FEAT-XXX propuestos)
Reglas:
  - Describir el comportamiento ACTUAL del código, no el deseado.
  - Cada hallazgo cita evidencia (archivo y símbolo). Sin evidencia → ⚠️ Sin evidencia.
  - Los posibles bugs se marcan; no se convierten en criterio sin decisión del usuario.
-->

# RS-{{XXX}} · Discovery legacy — {{Nombre del código/módulo analizado}}

**Estado:** {{Draft | Ready}}
**Código en alcance:** {{rutas / módulos / entrypoints}}
**Versión analizada:** {{commit | branch | tag}}
**Creado por:** {{git config user.name}}
**Fecha:** {{YYYY-MM-DD}}

## 1. Features descubiertas

{{Capacidades funcionales de alto nivel que ofrece el código.}}

| Feature | Descripción (observada) | Ubicación en código | Evidencia |
| ------- | ----------------------- | ------------------- | --------- |
| {{Feature 1}} | {{qué hace, tal como está implementado}} | {{ruta/archivo · símbolo}} | {{endpoint / función / ruta UI}} |

## 2. Casos de uso descubiertos

{{Interacciones actor↔sistema con un objetivo. Cada caso de uso es candidato a una historia de usuario.}}

| Caso de uso | Actor | Feature | Flujo observado (principal + alternos/errores) | Ubicación en código |
| ----------- | ----- | ------- | ---------------------------------------------- | ------------------- |
| {{CU 1}} | {{actor inferido}} | {{Feature}} | {{pasos que ejecuta el código, incluyendo ramas y validaciones}} | {{ruta/archivo · símbolo}} |

## 3. Reglas de negocio descubiertas

{{Validaciones, cálculos, condiciones, límites, transiciones, defaults y efectos que el código aplica.}}

| BR-XX | Regla (enunciado observado) | Tipo | Dónde se aplica | Confianza | ¿Posible bug? |
| ----- | --------------------------- | ---- | --------------- | --------- | ------------- |
| BR-01 | {{afirmación verificable}} | {{Validación / Cálculo / Flujo / Autorización / Persistencia}} | {{ruta/archivo · símbolo}} | {{Alta / Media / Baja}} | {{No / Sí — ver Notas}} |

> Tipo: Validación · Cálculo · Flujo · Autorización · Persistencia.
> Confianza: Alta (explícita en código) · Media · Baja (inferida indirectamente).
> Toda regla con `¿Posible bug? = Sí` debe describirse en Notas y **consultarse con
> el usuario** antes de convertirse en criterio de aceptación (preservar vs. corregir).

## 4. Cobertura de pruebas existente

{{Qué pruebas ya cubren el código en alcance; justifica dónde enfocar la regeneración.}}

| Componente / Caso de uso | Pruebas existentes (tipo · ubicación) | Cobertura | Gap (qué falta cubrir) |
| ------------------------ | ------------------------------------- | --------- | ---------------------- |
| {{CU 1}} | {{unit/integración/e2e · ruta}} | {{Alta / Media / Baja / Nula}} | {{escenarios sin cubrir}} |

## 5. Mapa Feature → FEAT-XXX propuesto

{{Puente hacia la creación de features. Una fila por feature descubierto: se
materializará como una carpeta `docs/features/FEAT-XXX-{slug}/`. Los casos de uso
alimentan sus criterios de aceptación y las reglas de negocio sus BR-XX.}}

| Feature | FEAT propuesto (slug) | Casos de uso incluidos | Reglas de negocio (BR-XX) | Prioridad (según gap de cobertura) |
| ------- | --------------------- | ---------------------- | ------------------------- | ---------------------------------- |
| {{Feature 1}} | {{feat-slug}} | {{CU 1, CU 2}} | {{BR-01, BR-03}} | {{Alta / Media / Baja}} |

## Notas

<!--
Listar aquí TODO pendiente que mantenga el discovery en Draft:
  - Hallazgos ⚠️ Sin evidencia por resolver.
  - Reglas con ¿Posible bug? = Sí y la decisión del usuario (preservar / corregir) o su ausencia.
  - Actores no identificados, confianza Baja por confirmar, supuestos.
Si no queda ningún pendiente, el discovery puede pasar a Ready.
-->

- {{pendiente 1}}
