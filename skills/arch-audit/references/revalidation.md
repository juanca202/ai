# Comportamiento en Revalidación

Leer en la Fase 0 cuando el usuario elige **Revalidar** un informe previo. El informe original
(resumen, hallazgos, fitness functions, reglas no verificables) se preserva **tal cual se creó la
primera vez** — una revalidación nunca reescribe, reordena ni elimina ese contenido. Los cambios de
cada revalidación se documentan aparte.

1. Leer el informe previo elegido completo, incluida su sección `## Revalidaciones` si ya existe.
   El **estado de referencia** para comparar no es solo el informe original: es el informe original
   **ajustado** por los cambios acumulados en todas las entradas de `## Revalidaciones` previas (p.
   ej. un hallazgo marcado `RESOLVED` en una revalidación anterior ya no cuenta como incumplimiento
   vigente al comparar).
2. Repetir la recopilación y verificación contra el estado actual del repo, reutilizando las mismas
   fases que una auditoría nueva, sin modificar nada de lo ya escrito en el documento:
   - **Fase 1** — detectar criterios de cumplimiento (`CR-XXX`) (o estándares de dominio) o reglas de `AGENTS.md` **nuevos** desde la última verificación.
   - **Fase 2** — reevaluar cada regla/hallazgo ya documentado contra el estado actual.
   - **Fase 2B** — re-ejecutar las fitness functions existentes y las creadas desde la última verificación.
   - **Fase 3.5** — reverificar las dependencias de los estándares/ADR auditados (ver esa fase); su
     resultado se trata como un cambio evidenciado más, no se pregunta ni se escribe por separado.
3. Identificar **solo los cambios evidenciados** en esta corrida frente al estado de referencia (paso 1):
   - Incumplimiento ya no presente → cambio `RESOLVED` (`✅`).
   - Sigue presente pero con evidencia nueva relevante → registrar el cambio de evidencia.
   - Nuevo incumplimiento (`NEW_VIOLATION`, `❌`) o regresión (`REGRESSION`, `⚠️`), de una regla ya auditada o de una nueva → registrarlo.
   - Dependencia que faltaba y ya fue instalada, sigue faltando, o aparece una nueva (Fase 3.5) → registrarlo.
   - Si no hubo ningún cambio desde la última verificación, la entrada lo indica explícitamente
     ("Sin cambios respecto a la última verificación.") en vez de listar hallazgos sin novedad.
4. Calcular fecha y hora de esta ejecución:
   ```bash
   date "+%F %H:%M"
   ```
5. Calcular el **veredicto resultante** de esta revalidación, considerando el estado combinado
   (estado de referencia del paso 1 + cambios evidenciados en los pasos 2-3).
6. **Añadir al final del mismo archivo** (nunca crear un archivo nuevo ni sobrescribir lo anterior)
   una **única** entrada nueva en `## Revalidaciones`, con la fecha/hora, el veredicto resultante y
   todos los cambios evidenciados (incluida la verificación de dependencias), siguiendo la estructura
   de `assets/audit-template.md`.
7. Actualizar el campo `Veredicto` de la **cabecera** de ese mismo archivo: conservar el
   veredicto vigente y agregar junto a él `(revalidado YYYY-MM-DD HH:MM)` con la fecha/hora de esta
   revalidación. Es el único dato del contenido original que una revalidación sí actualiza.
