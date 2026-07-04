<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Plan de Migración

Estado: {{Draft | Ready}}
Fecha: {{YYYY-MM-DD}}
Discovery: [discovery.md](./discovery.md)
Proyecto origen: {{nombre / stack principal del origen}}
Proyecto destino: {{nombre / stack principal del destino}}

## 1. Estado actual

Descripción de cómo está hoy lo que se va a migrar. Incluye el árbol con las
**rutas de los archivos que se van a migrar** en el proyecto origen.

```text
{{proyecto-origen}}/
└── src/
    ├── {{archivo-a-migrar-1}}
    ├── {{archivo-a-migrar-2}}
    └── {{carpeta}}/
        └── {{archivo-a-migrar-3}}
```

{{Notas sobre responsabilidades actuales, acoplamientos o dependencias relevantes.}}

## 2. Propuesta de cambio

Descripción del estado objetivo tras la migración. Incluye el árbol con las
**rutas de los archivos resultantes** en el proyecto destino (nuevos o
modificados). Frente a cada archivo, una descripción muy corta y acotada de qué
se hace en él.

```text
{{proyecto-destino}}/
└── src/
    ├── {{archivo-resultante-1}}        # {{qué se hace aquí: muy corto}}
    ├── {{archivo-resultante-2}}        # {{qué se hace aquí: muy corto}}
    └── {{carpeta}}/
        └── {{archivo-resultante-3}}    # {{qué se hace aquí: muy corto}}
```

{{Notas sobre el mapeo origen → destino, cambios de estructura, renombrados o
archivos que se fusionan o se dividen.}}

## 3. Pruebas de validación (Golden Master Testing)

La validación se realiza con la técnica de **Golden Master Testing**:
implementación de los casos ya preparados en [validation.md](./validation.md),
contrastando la salida del destino contra la salida de referencia (golden master)
según la estrategia de comparación de cada caso. Cobertura mínima por
funcionalidad: un escenario exitoso principal, un caso límite y un caso de error
o validación.

| Caso   | Componente     | Implementado en          | Criterio de aceptación |
| ------ | -------------- | ------------------------ | ---------------------- |
| GM-001 | InvoiceService | {{ubicación de la prueba}} | {{referencia o resumen}} |
| GM-002 | MonthlyReport  | {{ubicación de la prueba}} | {{referencia o resumen}} |

## 4. Plan de implementación

Estrategia de migración: {{Strangler Fig | Branch by Abstraction | Parallel Run |
otra}} — {{por qué se eligió}}.

Pasos para ejecutar la migración, agrupados por fases según la estrategia.

<!--
Cada tarea lleva id secuencial IT-01, IT-02, … único en el ámbito del `plan.md` (correlativo a través de todas las fases); renumerar si se reordenan o eliminan tareas.
Formato: `IT-XX` + una **descripción corta** de una línea (qué se implementa) — es lo único que se muestra en la herramienta de to-dos. El detalle amplía el **qué** (precisiones, referencias a recursos o código, notas) — nunca el cómo — y va en las líneas indentadas debajo; no se muestra en los to-dos.
-->

### Fase 1 — {{nombre de la fase}}

- [ ] **IT-01** — {{descripción corta en una línea: qué se implementa}}
  {{detalle opcional que amplía el qué se implementa, no el cómo: precisiones, referencias a recursos o código, notas; no se muestra en to-dos}}
- [ ] **IT-02** — {{descripción corta en una línea}}

### Fase 2 — {{nombre de la fase}}

- [ ] **IT-03** — {{descripción corta en una línea}}
- [ ] **IT-04** — {{descripción corta en una línea}}

### Fase N — {{nombre de la fase}}

- [ ] **IT-05** — {{descripción corta en una línea}}

## Observaciones

Supuestos y decisiones pendientes. **Mientras existan pendientes o secciones
incompletas, el plan permanece en `Draft`.**

- [ ] {{pendiente a resolver}}
