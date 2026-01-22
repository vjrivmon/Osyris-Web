# Claude Code Hooks - Osyris Web

Este directorio contiene scripts de automatización que se ejecutan en diferentes momentos del ciclo de vida de Claude Code para el proyecto Osyris Web.

## Estructura

```
hooks/
├── scripts/
│   ├── session-init.sh      # Se ejecuta al iniciar sesión
│   ├── pre-tool-validate.sh # Se ejecuta antes de Bash (seguridad)
│   ├── post-tool-format.sh  # Se ejecuta después de Edit/Write
│   ├── test-runner.sh       # Verificaciones automáticas
│   └── ralph-hook.sh        # Stop hook para Ralph Loops
└── README.md
```

## Hooks Configurados

### SessionStart - `session-init.sh`

Se ejecuta al iniciar una sesión de Claude Code.

**Funciones:**
- Carga variables de entorno desde `.env` y `.env.local`
- Verifica dependencias de Node.js (frontend y backend)
- Verifica estado de Docker/PostgreSQL
- Muestra información de Git (rama, cambios pendientes)
- Lista worktrees activos
- Muestra comandos disponibles

### PreToolUse (Bash) - `pre-tool-validate.sh`

Se ejecuta antes de cada comando Bash para validar seguridad.

**Funciones:**
- Bloquea comandos peligrosos (`rm -rf /`, fork bombs, etc.)
- Previene force push a main/master
- Advierte sobre operaciones en archivos de producción
- Advierte sobre migraciones de base de datos
- Valida comandos de Docker

### PostToolUse (Edit|Write) - `post-tool-format.sh`

Se ejecuta después de editar o crear archivos.

**Funciones:**
- Formatea archivos TypeScript/JavaScript con Prettier
- Formatea archivos JSON con jq
- Formatea archivos CSS/SCSS
- Verifica sintaxis de scripts Shell

### Stop - `ralph-hook.sh`

Se ejecuta cuando Claude termina su trabajo. Gestiona el Ralph Loop.

**Funciones:**
- Detecta si hay un Ralph Loop activo
- Ejecuta verificaciones (build, test, playwright)
- Si pasa: marca como completado y sugiere deploy
- Si falla: reinyecta prompt para continuar iterando
- Máximo 30 iteraciones de seguridad
- Guarda logs de sesión

## Ralph Loop System

El sistema Ralph Loop permite iteraciones automáticas hasta completar una tarea:

### Archivos de Control
- `.claude/ralph-active` - Flag que indica loop activo
- `.claude/PROMPT.md` - Prompt a reinyectar en cada iteración
- `.claude/COMPLETE` - Flag para indicar tarea completada
- `.claude/RALPH_SUCCESS` - Marker de éxito post-verificaciones
- `.claude/.ralph-iteration` - Contador de iteraciones

### Flujo
```
INICIO → Verificar ralph-active
              ↓
         SI ACTIVO → Leer PROMPT.md → Reinyectar (exit 2)
              ↓
         SI COMPLETE → Ejecutar verificaciones
              ↓
         PASAN → Limpiar flags → Crear RALPH_SUCCESS
              ↓
         FALLAN → Reactivar loop
```

## Configuración

Los hooks se configuran en `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/session-init.sh"
      }]
    }],
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/pre-tool-validate.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/post-tool-format.sh"
      }]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/scripts/ralph-hook.sh"
      }]
    }]
  }
}
```

## Variables Disponibles

| Variable | Descripción |
|----------|-------------|
| `$CLAUDE_PROJECT_DIR` | Directorio raíz del proyecto |
| `$TOOL_INPUT` | Input de la herramienta (para Pre/Post) |
| `$TOOL_OUTPUT` | Output de la herramienta (para Post) |
| `$CLAUDE_ENV_FILE` | Archivo para persistir variables |

## Debugging

Para depurar hooks:

```bash
# Ejecutar manualmente
TOOL_INPUT='{"command": "ls"}' bash scripts/pre-tool-validate.sh

# Ver logs
tail -f .claude/logs/ralph-*.md
```

## Desactivar Hooks

Para desactivar temporalmente los hooks, crear `.claude/settings.local.json`:

```json
{
  "hooks": {}
}
```
