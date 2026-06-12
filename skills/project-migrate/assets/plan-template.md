# MG-XXX — Plan de migración: <Descripción corta de la migración>

> Plan de migración. Se construye a partir del `discovery.md` de esta misma
> carpeta. Rellena cada sección con la información concreta de la migración.

## Cabecera

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| ID               | MG-XXX                                  |
| Migración        | <qué se va a migrar>                    |
| Fecha            | YYYY-MM-DD                              |
| Discovery        | ./discovery.md                          |
| Proyecto origen  | <nombre / stack principal del origen>   |
| Proyecto destino | <nombre / stack principal del destino>  |

## 1. Estado actual

Descripción de cómo está hoy lo que se va a migrar. Incluye el árbol con las
**rutas de los archivos que se van a migrar** en el proyecto origen.

```text
<proyecto-origen>/
└── src/
    ├── <archivo-a-migrar-1>
    ├── <archivo-a-migrar-2>
    └── <carpeta>/
        └── <archivo-a-migrar-3>
```

<Notas sobre responsabilidades actuales, acoplamientos o dependencias relevantes.>

## 2. Propuesta de cambio

Descripción del estado objetivo tras la migración. Incluye el árbol con las
**rutas de los archivos resultantes** en el proyecto destino (nuevos o
modificados).

```text
<proyecto-destino>/
└── src/
    ├── <archivo-resultante-1>
    ├── <archivo-resultante-2>
    └── <carpeta>/
        └── <archivo-resultante-3>
```

<Notas sobre el mapeo origen → destino, cambios de estructura, renombrados o
archivos que se fusionan o se dividen.>

## 3. Pruebas de validación

Cómo se verifica que el comportamiento se conserva tras la migración.

### 3.1 Pruebas de paridad

Comparan la salida del comportamiento **origen** vs. **destino** ante las mismas
entradas, para confirmar que son equivalentes.

- <Caso/entrada a comparar y resultado esperado idéntico en ambos lados>
- <…>

### 3.2 Golden Master Testing

Se captura la salida actual (origen) como referencia ("golden master") y se
contrasta contra la salida del destino para detectar regresiones.

- Generación del golden master: <cómo y dónde se captura la salida de referencia>
- Conjunto de entradas: <datos/escenarios usados para generar las salidas>
- Comparación: <cómo se compara la salida del destino contra el golden master>

## 4. Plan de implementación

Pasos para ejecutar la migración. Pueden agruparse por fases.

### Fase 1 — <nombre de la fase>

- [ ] <tarea>
- [ ] <tarea>

### Fase 2 — <nombre de la fase>

- [ ] <tarea>
- [ ] <tarea>

### Fase N — <nombre de la fase>

- [ ] <tarea>

## Notas

<Riesgos, supuestos, rollback y decisiones pendientes.>
