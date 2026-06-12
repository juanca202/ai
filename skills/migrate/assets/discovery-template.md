# MG-XXX — <Descripción corta de la migración>

> Documento de descubrimiento (discovery) de la migración.
> Rellena la cabecera y la tabla de equivalencias. El **Estado** se decide
> según la regla descrita al final del documento.

## Cabecera

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| ID               | MG-XXX                                  |
| Migración        | <qué se va a migrar>                    |
| Fecha            | YYYY-MM-DD                              |
| Estado           | Draft \| Ready                          |
| Proyecto origen  | <nombre / stack principal del origen>   |
| Proyecto destino | <nombre / stack principal del destino>  |

## Equivalencias de stack

Cada fila representa un elemento tecnológico detectado en el **origen** que es
relevante para lo que se va a migrar, junto con su equivalente en el **destino**.
Si no existe equivalente, se deja una nota explícita en la columna de destino.

| Elemento tecnológico | Origen (con versión)        | Destino (equivalente o nota)            |
| -------------------- | --------------------------- | --------------------------------------- |
| <p. ej. Framework>   | <p. ej. Express 4.18>       | <p. ej. Fastify 4.x>                    |
| <p. ej. ORM>         | <p. ej. Sequelize 6.32>     | <p. ej. Prisma 5.x>                    |
| <p. ej. Validación>  | <p. ej. Joi 17.9>           | ⚠️ Sin equivalente identificado         |

## Regla de estado

- **Ready**: todos los elementos del origen tienen un equivalente identificado
  en el destino (ninguna fila contiene "Sin equivalente identificado").
- **Draft**: al menos un elemento del origen no tiene equivalente identificado
  en el destino, o la información del stack aún está incompleta.

## Notas

<Observaciones, decisiones pendientes, riesgos o supuestos sobre las equivalencias.>
