# Debug — {{título corto del defecto}}

**Estado:** {{Draft | Ready}}  
**Severidad:** {{Crítica | Alta | Media | Baja}} — {{a quién y a qué afecta}}  
**Reproducibilidad:** {{Siempre | Intermitente ({{frecuencia}}) | No reproducible}}  
**Repositorio:** `{{nombre del repo afectado}}`  
**Relacionado:** {{US-XXX | WI-XXX | FT-XXX | N/A}}  
**Work Item ({{Sistema}}):** {{enlace markdown al work item en el sistema de seguimiento vinculado; {{Sistema}} es el nombre corto del archivo de referencia (p. ej. "ADO" para references/azure-devops.md). Omitir la línea si el bug se reportó solo en conversación}}  
**Fecha:** {{YYYY-MM-DD}}  
**Creado por:** {{git config user.name}}

## Problema

{{Dos o tres frases: qué hace hoy el sistema, qué debería hacer y con qué entrada o
evento exacto se dispara. Indicar de dónde sale ese «debería» — AC-XXX, regla de
negocio, contrato o expectativa del usuario. Si el reporte venía del gestor de
proyectos, resumir lo que aportó y señalar qué se completó por investigación.}}

**Entorno:** {{entorno, versión/commit, configuración y feature flags relevantes}}
**Primera aparición:** {{fecha, versión o commit (`git blame`) | Desconocida}}

## Reproducción

**Veredicto:** {{Reproducida y verificada | Definida, no verificada | No reproducible}}

**Precondiciones:** {{estado de datos y fixtures, configuración, flags, permisos, zona horaria, locale}}

1. {{Paso 1 — acción exacta}}
2. {{Paso 2}}

**Obtenido:** {{lo que ocurre}} · **Esperado:** {{lo que debería ocurrir}}

**Evidencia:** {{traza/stack, log, consulta o captura, con referencia a archivo y línea}}

{{Si el bug no es determinista: fuente de no-determinismo — reloj, semilla, concurrencia,
orden de ejecución, dependencia externa — y cómo se controlará en la prueba. Omitir si es
determinista.}}

## Causa raíz

**Categoría:** {{Defecto de lógica | Contrato roto | Estado/concurrencia | Integración | Requisito mal especificado}}
**Localización:** `{{ruta/al/archivo.ext}}` › `{{símbolo}}` {{(líneas ~NN-NN)}}

{{Por qué el código produce el comportamiento observado: qué condición, qué valor, qué
rama. Concreto y verificable. Marcar con `⚠️ Hipótesis` cualquier afirmación sin
evidencia directa.}}

```
{{fragmento mínimo que evidencia el defecto}}
```

**Alcance de la regresión:** {{qué otros llamadores o módulos usan el símbolo afectado}}

> {{Si la categoría es «Requisito mal especificado»: el código hace lo especificado y lo
> especificado está mal. Este flujo se detiene aquí — handoff a `work-define`, no a un
> bug-fix. Borrar esta nota si no aplica.}}

## Situación de las pruebas

Una línea **por nivel de prueba** afectado (unitaria, integración, e2e, contrato):

- **{{Unitaria}}** — {{`ruta/test.spec.ts › nombre del caso` | ninguna}} → **{{1 · no existe test para el escenario | 2 · existe pero no cubre la condición | 3 · existe y pasa incorrectamente}}** → {{crear | ampliar/modificar | corregir}}

**Búsqueda realizada:** {{cómo se buscó — por símbolo, ruta espejo, caso de uso, TC-XXX del artefacto — para justificar un veredicto de «no existe test»}}

**Por qué la prueba actual no lo detecta** {{— solo casos 2 y 3. Motivo y línea concreta:
aserción ausente o débil, aserción sobre el valor equivocado, mock que oculta el defecto,
fixture que evita la rama, expectativa congelada, prueba en skip o fuera del glob, error
tragado.}}

**Nivel elegido para demostrar el bug:** {{el más bajo que lo reproduce de forma determinista + por qué no se manifiesta más abajo}}

> **⚠️ Falso negativo de la suite** {{— solo si algún nivel resultó caso 3. Una prueba en
> verde sobre código roto es un hallazgo de mayor severidad que el propio bug. Indicar si
> el mismo patrón aparece en otras pruebas (candidato a WI `test-improvement`, fuera del
> alcance de este bug-fix). Borrar si no aplica.}}

## Corrección

Orden obligatorio — 🔴 la prueba falla, después el fix, después 🟢:

1. **🔴 {{Crear | Ampliar | Corregir}} la prueba** en `{{ruta/al/test}}` ({{unitaria | integración | e2e | contrato}}),
  caso «{{debería … cuando …}}», con {{entrada/fixture que activa la condición del bug}}.
   Debe fallar con el código actual: esperado `{{X}}`, obtenido `{{Y}}`.
   {{Casos 2 y 3: qué se amplía o corrige exactamente y por qué eso cierra el hueco.}}
2. **Corregir** `{{ruta/al/archivo.ext}}` › `{{símbolo}}`: {{cambio mínimo sobre la causa raíz}}.
  Descartado: {{alternativa y por qué}}. Efectos colaterales: {{llamadores, cambio de
   contrato, migración de datos, compatibilidad}}.
3. **🟢 Verificar** que la prueba pasa y que la suite completa sigue en verde, sin regresiones.
  {{Si aplicó el caso 3: revirtiendo el fix, la prueba corregida debe volver a fallar.}}

En términos prácticos:

```
{{comportamiento actual}}   →   {{comportamiento corregido}}
```

> La prueba debe fallar **por la razón correcta** —no por un error de compilación, import
> o setup—; si pasa desde el principio, no demuestra el bug. El fix es el cambio **mínimo**
> sobre la causa raíz: sin refactor oportunista, lo demás va a Fuera de alcance.

## Reglas de negocio

- **BR-01** — {{regla}} ({{fuente: usuario, documento, código}}) → verificada por {{AC-XXX}}

## Criterios de aceptación

- **AC-001** — {{Dado {{contexto}}, cuando {{acción}}, entonces {{resultado esperado}}}}
- **AC-002** — {{…}}

## Fuera de alcance

- {{Escenario vecino sin prueba detectado durante la búsqueda → candidato a WI `test-improvement`}}
- {{Refactor o deuda observada → candidato a WI `refactor`}}

## Riesgos

- {{Riesgo del cambio + mitigación; qué vigilar tras el despliegue}}

## Archivos afectados

- `{{ruta/al/archivo.ext}}` — {{qué se corrige}}
- `{{ruta/al/test}}` — {{qué prueba se añade o ajusta}}

## Referencias

- {{[Work item del bug #](url) — si vino del gestor de proyectos}}
- {{[US-XXX / WI-XXX / FT-XXX](ruta) — artefacto relacionado}}
- {{Archivos y símbolos citados; commits relevantes}}