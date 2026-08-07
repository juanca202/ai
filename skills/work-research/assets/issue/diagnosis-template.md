<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

DOSSIER DE BUG — salida del flujo «Analizar issue» de work-research.

Este documento NO se guarda como un RS. Es el insumo del handoff a `work-plan`,
que lo materializa como un WI de tipo bug-fix:
  docs/specs/work-items/WI-XXX-{kebab-case}/README.md

Mapeo dossier → WI (ver references/issue/flow.md § Paso 4):
  1. Reporte + observado/esperado ...... Descripción (el requerimiento del WI)
  2-3. Reproducción + causa raíz ....... Contexto
  4. Diagnóstico de pruebas ............ Contexto › «Situación de las pruebas»
  5. Ciclo 🔴 → fix → 🟢 ............... Plan de implementación (IT-XX, en ese orden)
     + archivo/símbolo del fix y del test → Archivos afectados
  6. Criterios de aceptación propuestos  Criterios de aceptación (work-plan los
     REESCRIBE a su formato: categoría + palabra clave RFC 2119 en mayúsculas)
  7. Riesgos ........................... Observaciones
  8. Fuera de alcance .................. Fuera de alcance
  9. Reglas de negocio confirmadas ..... Reglas de negocio (work-plan anota la
     trazabilidad «BR-XX → verificado por AC-XXX»)
  10. Referencias ...................... Referencias

Solo si el usuario pide además persistir la investigación (hallazgos reutilizables
más allá de este bug), guardar un RS en docs/specs/research/RS-XXX-{slug}/ con
assets/research-template.md y referenciarlo desde el WI.
-->

# Dossier de bug — {{Título corto del defecto}}

**Estado del diagnóstico:** {{Draft | Ready}}
**Work Item ({{Sistema}}):** {{enlace markdown al work item del bug en el sistema de seguimiento vinculado — solo si el defecto ya existe allí; {{Sistema}} es el nombre corto que define el archivo de referencia del sistema (p. ej. "ADO" para references/azure-devops.md); omitir línea si el bug se reportó solo en conversación}}
**Artefacto relacionado:** {{US-XXX | WI-XXX | FT-XXX | N/A}}
**Repositorio:** {{nombre del repo afectado}}
**Severidad / impacto:** {{Crítica | Alta | Media | Baja}} — {{a quién y a qué afecta}}
**Reproducibilidad:** {{Siempre | Intermitente ({{frecuencia}}) | No reproducible}}
**Creado por:** {{git config user.name}}
**Fecha:** {{YYYY-MM-DD}}

---

## 1. Reporte normalizado

| Campo | Valor |
|-------|-------|
| **Comportamiento observado** | {{Qué hace hoy el sistema}} |
| **Comportamiento esperado** | {{Qué debería hacer, y de dónde sale ese «debería»: AC-XXX, regla de negocio, contrato, expectativa del usuario}} |
| **Entrada / disparador** | {{Datos, request, acción o evento exacto que lo provoca}} |
| **Entorno y versión** | {{entorno, versión/commit, configuración relevante, feature flags}} |
| **Primera aparición** | {{fecha, versión o commit ({{git blame}}) | Desconocida}} |

> {{Si el reporte venía del gestor de proyectos: resumir aquí lo aportado por el work item
> (pasos, adjuntos, comentarios) y señalar qué se completó por investigación.}}

## 2. Reproducción

**Veredicto:** {{Reproducida y verificada | Definida, no verificada | No reproducible}}

**Precondiciones**

- {{Estado de datos / fixtures necesarios}}
- {{Configuración, flags, permisos, zona horaria, locale}}

**Pasos**

1. {{Paso 1 — acción exacta}}
2. {{Paso 2}}
3. {{…}}

**Resultado obtenido:** {{lo que ocurre}}
**Resultado esperado:** {{lo que debería ocurrir}}

**Fuentes de no-determinismo** {{— si aplica; reloj, semilla, concurrencia, orden de
ejecución, dependencia externa — y cómo se controlarán en la prueba. Omitir si el bug
es determinista.}}

**Evidencia:** {{traza/stack, log, consulta, captura; con referencia a archivo y línea}}

## 3. Causa raíz

**Categoría:** {{Defecto de lógica | Contrato roto | Estado/concurrencia | Integración | Requisito mal especificado}}

**Localización:** `{{ruta/al/archivo.ext}}` › `{{símbolo}}` {{(líneas ~NN-NN)}}

{{Explicación de por qué el código produce el comportamiento observado. Concreta y
verificable: qué condición, qué valor, qué rama. Marcar con `⚠️ Hipótesis` cualquier
afirmación sin evidencia directa.}}

**Alcance de la regresión:** {{qué otros llamadores/módulos usan el símbolo afectado}}

> {{Si la categoría es «Requisito mal especificado»: el código hace lo especificado y
> lo especificado está mal. Este flujo se detiene aquí — handoff a `work-define`, no
> a un bug-fix. Borrar esta nota si no aplica.}}

## 4. Diagnóstico de pruebas

Una fila **por nivel de prueba** afectado (unitaria, integración, e2e, contrato).

| Nivel | Prueba(s) encontrada(s) | Situación | Acción |
|-------|-------------------------|-----------|--------|
| {{Unitaria}} | {{`ruta/test.spec.ts › nombre del caso` | — ninguna}} | {{1 · No existe test para el escenario / 2 · Existe pero no cubre la condición / 3 · Existe y pasa incorrectamente}} | {{Crear test / Ampliar-modificar test / Corregir el test}} |
| {{Integración}} | {{…}} | {{…}} | {{…}} |

**Búsqueda realizada:** {{cómo se buscó — por símbolo, por ruta espejo, por caso de
uso, por los TC-XXX del artefacto — para justificar un veredicto de «no existe test»}}

### Por qué la prueba actual no detecta el bug {{— solo casos 2 y 3}}

- **`{{ruta/test›caso}}`** — {{motivo: aserción ausente o débil / aserción sobre el
  valor equivocado / mock que oculta el defecto / fixture que evita la condición /
  expectativa congelada sobre el comportamiento erróneo / prueba no ejecutada
  (skip, filtro, glob) / error tragado}}. Evidencia: {{línea o fragmento}}.

> **⚠️ Falso negativo de la suite** {{— solo si algún nivel resultó caso 3. Una prueba
> en verde sobre código roto es un hallazgo de mayor severidad que el propio bug.
> Indicar si el mismo patrón aparece en otras pruebas (candidato a WI de tipo
> `test-improvement`, fuera del alcance de este bug-fix). Borrar si no aplica.}}

### Nivel elegido para demostrar el bug

{{Nivel + justificación: el más bajo que reproduce el defecto de forma determinista.
Si se sube de nivel, explicar por qué no se manifiesta abajo.}}

## 5. Remediación propuesta — ciclo rojo → verde

```text
🔴 TEST FAIL  →  Corregir código  →  🟢 TEST PASS
```

### 🔴 Paso 1 — Prueba que falla

| Campo | Valor |
|-------|-------|
| **Acción** | {{Crear test | Ampliar/modificar test | Corregir el test}} |
| **Archivo** | `{{ruta/al/test}}` {{(nuevo | existente)}} |
| **Nivel** | {{unitaria | integración | e2e | contrato}} |
| **Nombre del caso** | {{«debería … cuando …»}} |
| **Entrada / fixture** | {{datos exactos que activan la condición del bug}} |
| **Aserción** | {{qué se afirma sobre el resultado}} |
| **Fallo esperado** | {{esperado `X`, obtenido `Y` — el mensaje concreto con el que debe fallar}} |
| **Qué cambia respecto a la prueba actual** | {{solo casos 2 y 3: qué se amplía o corrige y por qué eso cierra el hueco. N/A en el caso 1}} |

> La prueba **debe fallar con el código actual y por la razón correcta** — no por un
> error de compilación, de import o de setup. Si pasa desde el principio, no demuestra
> el bug: rehacerla.

### Paso 2 — Corregir código

| Campo | Valor |
|-------|-------|
| **Archivo y símbolo** | `{{ruta/al/archivo.ext}}` › `{{símbolo}}` |
| **Cambio** | {{descripción del cambio mínimo sobre la causa raíz}} |
| **Alternativas descartadas** | {{opción y por qué se descartó}} |
| **Efectos colaterales previstos** | {{llamadores afectados, cambio de contrato, migración de datos, compatibilidad}} |

> Cambio **mínimo** sobre la causa raíz. Sin refactor oportunista: lo demás va a
> Observaciones como WI aparte.

### 🟢 Paso 3 — Prueba en verde

- [ ] La prueba nueva/ajustada pasa.
- [ ] La suite completa sigue en verde (sin regresiones).
- [ ] {{Solo si aplicó el caso 3:}} revirtiendo el fix, la prueba corregida **vuelve a
      fallar** — verificación anti-falso-negativo.
- [ ] {{Verificación manual del escenario reproducido en el punto 2, si aplica.}}

## 6. Criterios de aceptación propuestos

<!--
Verificables, uno por condición corregida. Alimentan la sección «Criterios de
aceptación» del WI, pero NO se copian tal cual: work-plan los reescribe al formato
de su plantilla (categoría + palabra clave RFC 2119 en mayúsculas).
-->

- **AC-001** — {{Dado {{contexto}}, cuando {{acción}}, entonces {{resultado esperado}}}}
- **AC-002** — {{…}}

## 7. Riesgos

- {{Riesgo del cambio + mitigación}}
- {{Qué vigilar tras el despliegue}}

## 8. Fuera de alcance / cobertura pendiente

<!-- Hallazgos reales del diagnóstico que NO entran en este bug-fix. -->

- {{Escenario vecino sin prueba detectado durante la búsqueda → candidato a WI `test-improvement`}}
- {{Refactor o deuda observada → candidato a WI `refactor`}}

## 9. Reglas de negocio confirmadas

<!-- Solo las que se aclararon o confirmaron durante el análisis. Omitir si ninguna. -->

- **BR-01** — {{regla}} ({{fuente: usuario, documento, código}}) → verificada por {{AC-XXX}}

> Cada `BR-XX` debe quedar enlazada a al menos un `AC-XXX` del punto 6: el WI no puede
> pasar a `Ready` con una regla sin criterio que la verifique.

## 10. Referencias

- {{[Work item del bug #<id>](<url>) — si vino del gestor de proyectos}}
- {{[US-XXX / WI-XXX / FT-XXX](ruta) — artefacto relacionado}}
- {{Archivos y símbolos citados; commits relevantes}}
