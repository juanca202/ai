<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# Plan de Migración

- Estado: {{Draft | Ready}}
- Fecha: {{YYYY-MM-DD}}
- Discovery: [discovery.md](./discovery.md)
- Proyecto origen: {{nombre / stack principal del origen}}
- Proyecto destino: {{nombre / stack principal del destino}}

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
modificados).

```text
{{proyecto-destino}}/
└── src/
    ├── {{archivo-resultante-1}}
    ├── {{archivo-resultante-2}}
    └── {{carpeta}}/
        └── {{archivo-resultante-3}}
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

### Fase 1 — {{nombre de la fase}}

- [ ] {{tarea}}
- [ ] {{tarea}}

### Fase 2 — {{nombre de la fase}}

- [ ] {{tarea}}
- [ ] {{tarea}}

### Fase N — {{nombre de la fase}}

- [ ] {{tarea}}

## Notas

Supuestos y decisiones pendientes. **Mientras existan pendientes o secciones
incompletas, el plan permanece en `Draft`.**

- [ ] {{pendiente a resolver}}
