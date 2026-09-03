<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque al publicar el documento final.
Dos archivos por pantalla, en assets/wireframes/ dentro de la carpeta del SRS:
  - [pantalla-slug].md  (este documento: objetivo, componentes, estados, historial de revisión)
  - [pantalla-slug].svg (el wireframe visual, enlazado desde aquí — nunca pegado como código)
Es un mockup de baja/media fidelidad para validar alcance con el usuario antes de redactar el SRS
final — no un diseño visual definitivo ni una guía de estilo. Color de marca, tipografía real y
medidas pixel-perfect no son responsabilidad de este skill; eso lo define diseño visual/design-define
más adelante.
-->

# Wireframe: {{nombre de la pantalla}}

**SRS:** [{{SRS-XXX: título}}](../../README.md)
**Estado de revisión:** {{Pendiente | Revisado con cambios | Aprobado}}

<!-- wireframe:review-status={{pending|revised|approved}} -->
<!-- Marca oculta; claves y valores en inglés siempre, igual criterio que srs:status. -->

## Objetivo de la pantalla

{{qué le permite hacer esta pantalla al actor, en 1-2 líneas; enlazar el/los `FR-XXX` que cubre}}

**Requisitos relacionados:** {{FR-XXX, FR-XXX}}

## Estructura

<!--
El wireframe vive en un archivo SVG hermano, en el mismo directorio: assets/wireframes/[pantalla-slug].svg
Se ENLAZA aquí — nunca se pega el código SVG completo dentro de este documento (mismo criterio de
"enlazar, no pegar" que el resto del harness usa para archivos de apoyo).

Nivel de fidelidad — mockup visual, no solo cajas estructurales:
  - Proporciones razonablemente realistas de cada región (encabezado, navegación, contenido, acciones,
    pie) y de sus componentes (campos, botones, tarjetas, listas).
  - Contenido de ejemplo/placeholder (textos, etiquetas) — nunca el copy final.
  - Paleta en ESCALA DE GRISES para distinguir tipos de elemento (p. ej. gris claro para contenedores,
    gris medio para botones/inputs, gris oscuro o negro para texto) — sin colores de marca.
  - Tipografía genérica (sans-serif del sistema), sin especificar familia tipográfica real.
  - Etiquetas de texto dentro de cada componente indicando qué es (p. ej. "Botón: Guardar",
    "Campo: Correo electrónico") para que el propósito quede claro sin ambigüedad.

El viewBox se ajusta al **tipo de solución** ya definido en la sección 12 del SRS (ver flow.md, paso 4):
  - App nativa / responsivo en modo móvil: retrato angosto, p. ej. `viewBox="0 0 375 812"`.
  - Aplicación web / escritorio: horizontal ancho, p. ej. `viewBox="0 0 1280 800"`.

Una pantalla compleja se divide en varios SVG (p. ej. estado vacío / estado con datos) antes que en un
solo diagrama saturado — usar la sección Estados de la pantalla para eso, un archivo `.svg` adicional
por estado relevante (p. ej. `[pantalla-slug]-vacio.svg`).
-->

![Wireframe de {{nombre de la pantalla}}](./{{pantalla-slug}}.svg)

## Componentes clave

- {{componente}}: {{propósito y comportamiento esperado}}
- {{componente}}: {{…}}

## Estados de la pantalla

<!-- Sección opcional. Incluir solo si la pantalla tiene estados relevantes más allá del principal (vacío, error, carga, sin permisos). Cada estado con diferencias visuales significativas tiene su propio SVG (ver la nota de la sección Estructura); enlazarlo aquí. Eliminar la sección si no aplica. -->

- {{estado}}: {{qué cambia respecto a la estructura principal}} — {{enlace al SVG del estado, si difiere visualmente de la estructura principal}}

## Historial de revisión

<!-- Se completa en cada vuelta de revisión con el usuario. Cada fila registra una observación y dónde quedó resuelta. -->

| Fecha | Observación del usuario | Resuelto en |
| ----- | ------------------------- | ------------ |
| {{YYYY-MM-DD}} | {{cambio pedido, textual}} | {{«SVG actualizado» y/o `FR-XXX` actualizado/creado}} |
