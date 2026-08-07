<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.

Este es el analysis.md — archivo ADICIONAL del flujo «Analizar test case».
Vive junto al README.md (informe principal) dentro de la misma carpeta del RS:

  TC de una US:   docs/specs/user-stories/US-XXX-{nombre}/research/RS-XXX-{slug}/analysis.md
  TC de un WI:    docs/specs/work-items/WI-XXX-{kebab}/research/RS-XXX-{slug}/analysis.md
  TC de un FT:  docs/specs/features/FT-XXX-{slug}/research/RS-XXX-{slug}/analysis.md
  TC suelto:      docs/specs/research/RS-XXX-{slug}/analysis.md

El README.md se redacta con assets/research-template.md y enlaza este archivo desde
su sección «Archivos adicionales». El veredicto se resume en «Conclusión y
recomendación» del README; el detalle vive aquí.
-->

# Análisis del caso de prueba {{TC-XXX}} — {{título del TC}}

**Veredicto:** {{TC correcto · implementación correcta | TC correcto · implementación incorrecta | TC incorrecto | TC incompleto | TC acoplado a la implementación | Falso negativo | Requisito ambiguo o mal definido | Sin cobertura automatizada}}
**Caso de prueba:** {{[TC-XXX](ruta/al/TC-XXX-slug.md)}}
**Work Item ({{Sistema}}):** {{enlace markdown al work item del caso de prueba en el sistema de seguimiento vinculado — solo si el TC existe allí; {{Sistema}} es el nombre corto que define el archivo de referencia del sistema (p. ej. "ADO" para references/azure-devops.md); omitir línea si no aplica}}
**Artefacto padre:** {{US-XXX | WI-XXX | FT-XXX | N/A}}
**Requisito verificado:** {{AC-XXX | BR-XX | ⚠️ sin traza declarada}}
**Prueba automatizada:** {{`ruta/al/test › nombre del caso` | ⚠️ no existe}}
**Fecha:** {{YYYY-MM-DD}}

---

## 1. El test case

**Comportamiento esperado según el requisito**

> {{Una frase, con las palabras del AC-XXX o de la regla de negocio — no con las del test.}}

**Lo que el TC afirma verificar**

| Elemento | Contenido del TC |
|----------|------------------|
| Precondiciones | {{…}} |
| Pasos / entrada | {{…}} |
| Resultado esperado | {{…}} |
| Datos de prueba | {{…}} |

**Traza declarada:** {{`AC-XXX` | ⚠️ el TC no declara a qué requisito responde — hallazgo}}

## 2. Contexto revisado

| Fuente | Revisado | Hallazgo relevante |
|--------|----------|--------------------|
| Artefacto padre | {{ruta}} | {{…}} |
| Criterio de aceptación | {{`AC-XXX`: enunciado}} | {{…}} |
| Código relacionado | `{{ruta}}` › `{{símbolo}}` | {{…}} |
| Tests relacionados | {{TCs hermanos y pruebas del mismo símbolo}} | {{solapamiento, contradicción, hueco}} |
| Documentación / ADRs | {{ADR-XXX o «no existe»}} | {{…}} |
| Reglas de negocio | {{`BR-XX`}} | {{…}} |

<!-- «No existe» también es un hallazgo: registrarlo, no omitir la fila. -->

## 3. ¿El test case es correcto?

| # | Pregunta | Respuesta | Evidencia |
|---|----------|-----------|-----------|
| 1 | ¿El escenario corresponde realmente al requisito? | {{Sí / No}} | {{…}} |
| 2 | ¿El resultado esperado está correctamente definido? | {{Sí / No}} | {{…}} |
| 3 | ¿Falta algún caso? | {{No / Sí: …}} | {{límite, nulo, error, permisos, concurrencia…}} |
| 4 | ¿Verifica comportamiento o detalles de implementación? | {{Comportamiento / Implementación}} | {{aserción concreta}} |
| 5 | ¿Podría estar pasando aunque exista un bug? | {{No / **Sí**}} | {{aserción débil, mock que oculta, fixture que evita la rama, expectativa congelada, test en skip, error tragado}} |

> **⚠️ Falso negativo** {{— solo si la pregunta 5 es «Sí». La suite miente sobre este
> escenario: severidad alta. Indicar si el mismo patrón aparece en tests vecinos.
> Borrar este bloque si no aplica.}}

## 4. Implementación

**Código responsable:** `{{ruta/al/archivo.ext}}` › `{{símbolo}}`

**Flujo seguido**

1. {{Punto de entrada}}
2. {{Bifurcación relevante y de qué precondición depende}}
3. {{Efecto observable: retorno, persistencia, evento, respuesta}}

**Dependencias**

| Dependencia | Rol en el comportamiento | ¿Simulada en la prueba? |
|-------------|--------------------------|-------------------------|
| {{servicio, reloj, configuración, flag, estado compartido}} | {{…}} | {{Sí / No / No hay prueba}} |

**Implementación vs. comportamiento esperado**

| Condición del requisito | Esperado | Implementado | ¿Coincide? |
|-------------------------|----------|--------------|------------|
| {{…}} | {{…}} | {{…}} | {{Sí / **No** → divergencia en `{{archivo›símbolo}}`}} |

**Ejecución de la prueba automatizada:** {{resultado real observado | no ejecutada porque {{…}} | no existe}}

## 5. Veredicto y siguiente paso

**{{Veredicto}}** — {{justificación en dos o tres oraciones, apoyada en las respuestas
del punto 3 y la comparación del punto 4.}}

| Acción propuesta | Skill | Alcance |
|------------------|-------|---------|
| {{qué hacer}} | {{Analizar issue / test-define / work-plan (WI test-improvement) / work-define / trace-validate}} | {{qué entra}} |

**Hallazgos secundarios** {{— fuera del veredicto principal; omitir si no hay}}

- {{Hueco de cobertura vecino, TC hermano contradictorio, patrón de falso negativo repetido…}}

## 6. Referencias

- {{[TC-XXX](ruta) · [AC-XXX del artefacto](ruta)}}
- {{Archivos y símbolos citados}}
- {{[Work item #<id>](<url>) — si el TC vive en el gestor de proyectos}}
