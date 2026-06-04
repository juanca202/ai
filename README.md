# @juanca202/ai

Skills y agentes del equipo para Cursor y otros asistentes de código.

## Instalación

### En un proyecto (recomendado para equipos)

Desde la raíz del repositorio:

```bash
npx skills add https://github.com/juanca202/ai -y --copy
```

Los skills quedan en `.agents/skills/` y se pueden versionar con el proyecto.

### Global (todos los proyectos)

```bash
npx skills add https://github.com/juanca202/ai -g -y --copy -a cursor -s '*'
```

| Flag | Motivo |
|------|--------|
| `-g` | Instala en el directorio del usuario (`~/.agents/skills/` y, para Cursor, `~/.cursor/skills/`) |
| `-y` | Sin prompts interactivos |
| `--copy` | Copia archivos (más fiable que symlinks en macOS/Windows) |
| `-a cursor` | Solo Cursor; evita agentes que no soportan instalación global |
| `-s '*'` | Todos los skills del paquete |

**No uses** `--all` ni `--agent '*'` con `-g`: el CLI intenta instalar también en **PromptScript**, que no admite skills globales y muestra errores del tipo:

```text
PromptScript does not support global skill installation
```

Ese mensaje no significa que la instalación falló por completo. Si ves rutas `~/.agents/skills/<nombre>/`, Cursor ya tiene los skills. Comprueba con:

```bash
ls ~/.agents/skills
npx skills ls -g
```

### Si apareció "Failed to install 12"

Suele ser **12 skills × agente PromptScript**. Los demás agentes (incluido el directorio universal `~/.agents/skills/`) suelen haberse instalado bien. Para reinstalar sin ese ruido:

```bash
npx skills add https://github.com/juanca202/ai -g -y --copy -a cursor -s '*'
```

### Instalación manual (alternativa)

```bash
mkdir -p ~/.agents/skills
for d in ado-install adr-discover adr-manage code-review git-commit git-pr \
  project-create prompt-validator story-define story-implement story-integrate story-plan; do
  cp -R skills/"$d" ~/.agents/skills/
done
```

## Skills incluidos

| Skill | Uso |
|-------|-----|
| `ado-install` | MCP de Azure DevOps en Cursor |
| `adr-discover` / `adr-manage` | ADRs |
| `code-review` | Checks TS/Node antes de merge |
| `git-commit` / `git-pr` | Commits y pull requests |
| `project-create` | Proyectos desde plantillas |
| `prompt-validator` | Revisión de prompts |
| `story-define` / `story-plan` / `story-implement` / `story-integrate` | Flujo de historias de usuario |
