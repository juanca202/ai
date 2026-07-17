<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Eliminar este bloque y sustituir todos los {{…}} al publicar el documento final.
-->

# ADR-XXX: {{titulo}}
 
**Estado**: {{Draft | Proposed | Accepted | Deprecated | Superseded}}
**Fecha de creación**: {{YYYY-MM-DD}}
**Última actualización**: {{YYYY-MM-DD}}
**Decisores**: {{nombres/roles}}
**Etiquetas**: {{nextjs, app-router, rsc, performance, security, etc.}}

## Contexto 

<!--
Un ADR documenta una decisión que afecta a TODO el proyecto. El contexto debe ser
general: describir el driver, la restricción o la tensión arquitectónica de forma
transversal, no un caso puntual. Puede apoyarse en ejemplos para ilustrar, pero no
debe plantearse como la resolución de un problema particular o aislado.
-->
{{problema, restricciones, drivers técnicos o de negocio — planteados a nivel de proyecto}}
 
## Decision

<!--
La decisión también debe ser general y aplicable a todo el proyecto: una regla o
lineamiento arquitectónico, no un arreglo específico. Los ejemplos sirven para
aclarar el alcance, pero la decisión no resuelve un problema concreto y único.
-->
 {{decision concreta y alcance — regla o lineamiento aplicable a todo el proyecto}}

## Alternativas consideradas (opcional)

 - Opcion A: {{pros/contras}}
 - Opcion B: {{pros/contras}}

## Consecuencias
 
### Positivas

 - {{impacto esperado}}

### Negativas / trade-offs

 - {{costos o riesgos asumidos}}

## Fitness function

<!--
Registra el chequeo automatizado que valida el cumplimiento de esta decisión (arquitectura
evolutiva). Sirve para que una auditoría (skill adr-audit) descubra y ejecute la verificación
directamente desde el ADR.

- Apto: Sí = el cumplimiento es objetivo/automatizable · No = depende de criterio humano o
  evidencia externa (dejar el resto en blanco o "N/A" y explicar en Estado).
- Estado: Creada · Pendiente (aún no implementada) · No aplica.
- Al implementarla, completar Herramienta, Ubicación y Comando; si sigue pendiente, dejarlos como TODO.
- Cuando Estado: Creada, la fitness function también queda registrada en el agrupador del proyecto
  (scripts/arch/verify-architecture.sh), que ejecuta TODAS las validaciones de arquitectura de una vez.
-->
Apto: {{Sí | No}}
Estado: {{Creada | Pendiente | No aplica}}
Herramienta: {{ArchUnit | dependency-cruiser | import-linter | NetArchTest | script CI | N/A}}
Ubicación: {{ruta del test/script que la implementa, p. ej. tests/arch/GraphQlOnlyTest.php}}
Comando: {{comando acotado individual, p. ej. npx depcruise --config .dependency-cruiser.js src}}
Agrupador: {{sh scripts/arch/verify-architecture.sh — ejecuta esta y el resto de validaciones | N/A}}

## Referencias

<!--
Las referencias NO deben apuntar a archivos de docs/specs. Las specs siguen a los ADR,
no al revés: un ADR es una decisión transversal y estable, mientras que las specs son
artefactos derivados que la aplican. Enlazar hacia specs invertiría esa dependencia.
Referenciar aquí: otros ADR, documentación general del proyecto y fuentes externas.
-->
- {{links internos/externos — otros ADR, docs generales o fuentes externas; nunca docs/specs}}
