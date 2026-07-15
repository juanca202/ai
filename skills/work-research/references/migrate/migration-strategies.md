# Estrategias de migración

Guía para elegir **cómo** ejecutar la migración de forma incremental y de bajo
riesgo, en lugar de un *big bang*. Se basa en patrones establecidos de
modernización/desplazamiento de sistemas legacy (Martin Fowler; Cartwright, Horn
y Lewis, *Patterns of Legacy Displacement*). En este skill, úsala para **recomendar
el enfoque de migración** en el informe y el *handoff* (Paso 3 del flujo B): ayuda a
dimensionar el cambio y a describir cómo lo ejecutará luego `work-define` (varias US)
o `work-plan` (un WI). El plan de implementación por fases se materializa en esas
US/WI, no en este skill.

## Principios

- Preferir reemplazo **incremental** sobre *big bang*: entrega valor antes,
  permite verificar cada porción y reduce el riesgo.
- Mantener origen y destino **coexistiendo** durante la transición.
- Cuidado con la **paridad de funcionalidad** ciega: replicar 1:1 puede arrastrar
  funciones infladas u obsoletas. Confirma con el usuario qué debe conservarse y
  qué puede simplificarse o eliminarse (alinéalo con la columna `Eliminar` del
  mapeo del discovery).

## Patrones de ejecución

- **Strangler Fig**: reemplazar el sistema pieza por pieza detrás de una fachada
  o proxy que enruta cada petición al origen o al destino. Fases típicas:
  *Transform* (construir la nueva pieza), *Coexist* (origen y destino en paralelo,
  enrutando progresivamente) y *Eliminate* (retirar la pieza legacy). Ideal para
  sistemas grandes que no pueden detenerse.
- **Branch by Abstraction**: introducir una capa de abstracción sobre el
  componente a reemplazar, implementar la versión nueva detrás de esa capa y
  conmutar (idealmente con *feature flags*) cuando esté lista. Sirve para cambiar
  la implementación de un componente dentro del mismo sistema.
- **Transitional Architecture**: componentes e integraciones temporales que solo
  existen durante la transición y se retiran al terminar. Decláralos como tales
  para no dejarlos en la arquitectura objetivo.
- **Dark Launching / Canary / Feature Flags**: liberar la nueva implementación sin
  exponerla (o exponiéndola a un porcentaje creciente) para validarla antes del
  *cutover* completo.

## Validación durante el despliegue: Parallel Run + Reconciliation

Como complemento de los Golden Master (validación offline antes del cambio), el
**Parallel Running** ejecuta origen y destino **simultáneamente** con las mismas
entradas y **reconcilia** sus salidas para confirmar paridad (idealmente 100%)
antes de retirar el origen. Es especialmente útil en producción combinado con
*dark launching*. Documenta en el plan: qué se ejecuta en paralelo, cómo se
reconcilian las salidas y qué diferencias son aceptables (reutiliza las
`ignore-fields` de los casos de `validation.md`).

## Cómo usarlo en el informe y el handoff

1. Elige el patrón (o combinación) más adecuado al tamaño, criticidad y
   posibilidad de interceptar/enrutar peticiones del sistema.
2. **Describe el enfoque por fases** que sugiere ese patrón (p. ej. Transform →
   Coexist → Eliminate) en el informe (`README.md`); esas fases orientarán la
   descomposición en US (`work-define`) o la definición del WI (`work-plan`).
3. Indica qué arquitectura transitoria se necesita y cuándo se retira.
4. Menciona el mecanismo de *cutover* y, si aplica, el Parallel Run +
   Reconciliation para validar en vivo, como insumo del trabajo posterior.
