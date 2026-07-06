---
name: alm-install
description: Instala, configura o repara el MCP local de una herramienta ALM (Application Lifecycle Management) en Cursor con autenticación por token. Soporta Azure DevOps (ADO, @azure-devops/mcp) y Jira (mcp-atlassian). Lo primero que hace es preguntar con la herramienta de preguntas estructuradas qué herramienta instalar (ADO o Jira); luego detecta si la integración ya existe y, de existir, prueba que esté bien configurada e informa su estado; si no existe, ejecuta el flujo de instalación correspondiente. Usar cuando el usuario pida instalar, configurar, reparar o verificar el MCP de Azure DevOps o de Jira, ADO MCP, Jira MCP, dev.azure.com, *.atlassian.net, PAT o API token, o agregar una cuenta/organización adicional a una integración ya existente.
---

# ALM Install — MCP de Azure DevOps o Jira en Cursor

Skill genérico para conectar una herramienta ALM al MCP **local** de Cursor con autenticación por token. Soporta dos plataformas, cada una con su propio flujo en `references/`:

- **Azure DevOps (ADO)** → [references/ado/install.md](references/ado/install.md)
- **Jira** → [references/jira/install.md](references/jira/install.md)

Ambos flujos comparten la misma filosofía: MCP **local** (no remoto/OAuth), token guardado de forma segura fuera del chat (Keychain en macOS, variable de usuario en Windows), soporte multi-cuenta y verificación del agente antes de reiniciar Cursor.

## Flujo del agente

### Paso 1 — Preguntar qué instalar (obligatorio)

**Antes de cualquier otra acción**, usar la **herramienta de preguntas estructuradas** (AskUserQuestion) para preguntar qué herramienta ALM se quiere instalar. Opciones:

- **Azure DevOps (ADO)** — work items, repos y pipelines de `dev.azure.com`.
- **Jira** — issues y proyectos de `*.atlassian.net`.

No asumir la plataforma aunque el usuario haya nombrado una; confirmar con la pregunta salvo que ya la haya indicado de forma inequívoca en su mensaje.

### Paso 2 — Detectar si la integración ya existe

Según la plataforma elegida, revisar la configuración MCP de Cursor. Buscar en **ambos** archivos si existen:

- Proyecto: `.cursor/mcp.json`
- Global: `~/.cursor/mcp.json`

Cómo identificar una entrada existente de cada plataforma dentro de `mcpServers`:

- **ADO:** alguna entrada cuyos `args` contengan `@azure-devops/mcp`.
- **Jira:** alguna entrada cuyos `args` contengan `mcp-atlassian`, o cuyo `env` incluya `JIRA_URL` / `JIRA_API_TOKEN`.

Si el archivo existe pero **no es JSON válido**, tratarlo como en el flujo de instalación (respaldar y avisar, no sobrescribir a ciegas).

### Paso 3a — Si YA existe: probar y reportar estado

**No reinstalar.** Ejecutar la verificación del agente de la plataforma para comprobar que la integración está bien configurada:

- **ADO:** sección «Verificación del agente» de [references/ado/macos.md](references/ado/macos.md) o [references/ado/windows.md](references/ado/windows.md).
- **Jira:** sección «Verificación del agente» de [references/jira/macos.md](references/jira/macos.md) o [references/jira/windows.md](references/jira/windows.md).

La prueba valida, para cada cuenta encontrada: que la variable/secreto exista, y que la API responda **JSON real** (HTTP 200 con `"value"`/`"count"` en ADO, o el objeto de usuario en `myself` de Jira). Un HTTP 200 con HTML de login = token inválido, **no** cuenta como éxito.

Informar al usuario el **estado por cuenta** de forma clara, por ejemplo:

- ✅ *Conectada y funcional* — token válido, API responde JSON.
- ⚠️ *Configurada pero con problema* — indicar la causa (token expirado/inválido, org/site incorrecto, variable no visible) y ofrecer reparar (rotar token o corregir la entrada).
- ➕ Si el usuario quería **agregar otra cuenta/organización** distinta, continuar con el flujo de instalación para esa cuenta nueva (Paso 3b) sin tocar las existentes.

### Paso 3b — Si NO existe: instalar

Cargar el flujo de la plataforma elegida y seguirlo de principio a fin:

- **ADO** → [references/ado/install.md](references/ado/install.md)
- **Jira** → [references/jira/install.md](references/jira/install.md)

Cada flujo detecta el SO (macOS/Windows), calcula identificadores, guía el almacenamiento seguro del token (solo ese paso se muestra al usuario), escribe/actualiza `mcp.json`, verifica internamente y pide reiniciar Cursor.

## Reglas transversales

- **Nunca** pedir ni almacenar el token en el chat. El token se guarda solo en Keychain (macOS) o variable de usuario (Windows).
- **Fusionar, no reemplazar:** al escribir `mcp.json`, conservar todas las entradas previas (de ADO, Jira u otros MCP).
- **MCP local únicamente:** no configurar servidores remotos/OAuth; Cursor no los soporta de forma fiable.
- **HTTP 200 no basta:** validar que la respuesta sea JSON real, no una página de login.
- Multi-cuenta: cada par (organización/site + correo) es una entrada independiente con su propia clave de servidor y variable de token.
