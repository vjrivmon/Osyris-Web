# /ralph-loop

Inicia o gestiona un Ralph Wiggum Loop - sistema de verificación iterativa automática que ejecuta build, tests y Playwright hasta que todo pase o se alcance el límite de iteraciones.

## Uso

```
/ralph-loop <acción> [argumentos]
```

## Acciones

- **start** `<task-file>`: Iniciar nuevo loop con archivo de tarea
- **stop**: Detener loop actual y guardar estado
- **status**: Ver estado del loop activo
- **resume**: Reanudar loop pausado

## Iniciar Loop

### Desde archivo de tarea
```
/ralph-loop start .claude/tasks/CRIT-001.md
```

### Interactivamente
```
/ralph-loop start
```
Preguntará qué tarea ejecutar.

## Flujo del Ralph Loop

```
┌─────────────────────────────────────────────────────────┐
│                   RALPH LOOP FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  START                                                   │
│    │                                                     │
│    ▼                                                     │
│  ┌─────────────────┐                                    │
│  │ Leer PROMPT.md  │                                    │
│  └────────┬────────┘                                    │
│           │                                              │
│           ▼                                              │
│  ┌─────────────────┐                                    │
│  │  Implementar    │                                    │
│  │  siguiente paso │                                    │
│  └────────┬────────┘                                    │
│           │                                              │
│           ▼                                              │
│  ┌─────────────────┐     ┌─────────────────┐           │
│  │ ¿COMPLETE?      │─NO─▶│ Claude termina  │           │
│  │                 │     │ ralph-hook.sh   │           │
│  └────────┬────────┘     │ reinyecta       │           │
│           │YES           └────────┬────────┘           │
│           ▼                       │                     │
│  ┌─────────────────┐              │                     │
│  │ Build + Tests   │◀─────────────┘                     │
│  │ + Playwright    │                                    │
│  └────────┬────────┘                                    │
│           │                                              │
│       ┌───┴───┐                                         │
│       │       │                                          │
│      PASS    FAIL                                        │
│       │       │                                          │
│       ▼       ▼                                          │
│  ┌─────────┐ ┌─────────────┐                           │
│  │ SUCCESS │ │ Reactivar   │                           │
│  │ Deploy  │ │ loop        │                           │
│  └─────────┘ └─────────────┘                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Archivos de Control

| Archivo | Descripción |
|---------|-------------|
| `.claude/ralph-active` | Flag que indica loop activo |
| `.claude/PROMPT.md` | Tarea a reinyectar |
| `.claude/COMPLETE` | Flag para indicar tarea completada |
| `.claude/RALPH_SUCCESS` | Marker de éxito post-verificaciones |
| `.claude/.ralph-iteration` | Contador de iteraciones |
| `.claude/.ralph-errors` | Tracking de errores repetidos |

## Límites de Seguridad

- **Máximo 30 iteraciones**: Se pausa automáticamente
- **Error repetido 3+ veces**: Se pausa para intervención
- **Timeout por iteración**: 5 minutos máximo

## Ejemplos

### Iniciar loop para fix
```
/ralph-loop start

> ¿Qué tarea deseas ejecutar?
> 1. CRIT-001 - Error sección asignada
> 2. CRIT-002 - Notificaciones pilladas
> 3. Crear nueva tarea

> Selección: 1
```

Resultado:
```
🚀 RALPH LOOP INICIADO

📋 Tarea: CRIT-001 - Error sección asignada
📁 Archivo de prompt: .claude/PROMPT.md
🔄 Flag activo: .claude/ralph-active

⚠️ IMPORTANTE:
- El loop continuará automáticamente después de cada respuesta
- Para detener: /ralph-loop stop
- Para ver estado: /ralph-loop status

💡 Tip: Abre otra terminal para monitorear el progreso

📊 Iteración: 1/30
Ejecutando primera iteración...
```

### Ver estado del loop
```
/ralph-loop status
```

Resultado:
```
═══════════════════════════════════════════════════════════
              RALPH LOOP STATUS
═══════════════════════════════════════════════════════════

🔄 Estado: ACTIVO
📊 Iteración: 7/30
📋 Tarea: CRIT-001

📈 Progreso:
- Criterios completados: 3/5
- Última acción: Actualizado educando.controller.js
- Próximo paso: Ejecutar migración SQL

⏱️ Tiempo transcurrido: 12 minutos

🔧 Último error (si hubo):
  - Build: ✅
  - Tests: ⚠️ 1 failing
  - E2E: No ejecutado

═══════════════════════════════════════════════════════════
```

### Detener loop
```
/ralph-loop stop
```

Resultado:
```
🛑 RALPH LOOP DETENIDO

📊 Resumen de Sesión:
- Iteraciones completadas: 7
- Criterios logrados: 3/5
- Log guardado en: .claude/logs/ralph-session-20260122-163500.md

📋 Estado guardado:
- Prompt backup: .claude/PROMPT.md.backup
- Puedes reanudar con: /ralph-loop resume

💡 Para ver el log completo:
cat .claude/logs/ralph-session-20260122-163500.md
```

### Reanudar loop pausado
```
/ralph-loop resume
```

## Crear PROMPT.md Manualmente

Si necesitas crear un prompt personalizado:

```markdown
# 🔄 RALPH LOOP - [Nombre de la tarea]

## Tarea
[Descripción detallada de lo que hay que hacer]

## Criterios de Completitud
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Build pasa sin errores
- [ ] Tests pasan

## Archivos Afectados
- `ruta/archivo1.ts`
- `ruta/archivo2.js`

## Instrucciones de Loop

1. **Verificar Estado Actual**
   - ¿Qué criterios ya están completados?
   - ¿Hay errores pendientes?

2. **Identificar Siguiente Paso**
   - ¿Cuál es el criterio más prioritario?
   - ¿Qué necesito hacer?

3. **Ejecutar**
   - Implementar cambio
   - Hacer commit

4. **Validar**
   - ¿El criterio se cumple?
   - ¿Se introdujeron errores?

5. **Decidir**
   - Si TODO completo: `touch .claude/COMPLETE`
   - Si pendiente: continuar al siguiente

## 📊 Progreso Actual
- Criterios completados: 0/X
- Última acción: [ninguna]
- Próximo paso: [primer criterio]
```

## Integración con Worktrees

Ralph Loop funciona tanto en el directorio principal como en worktrees:

```bash
# En directorio principal
/ralph-loop start

# En worktree
cd trees/CRIT-001
/ralph-loop start
```

## Comandos Relacionados

- **/osyris-fix-issue**: Crea worktree y activa Ralph automáticamente
- **/osyris-deploy-now**: Deploy tras Ralph exitoso
- **/coordinator-status**: Estado general del sistema

## Debugging

### Ver logs del hook
```bash
cat .claude/logs/ralph-*.md | tail -100
```

### Verificar estado de archivos
```bash
ls -la .claude/ralph-active .claude/COMPLETE .claude/PROMPT.md 2>/dev/null
```

### Forzar reinicio
```bash
rm -f .claude/ralph-active .claude/COMPLETE .claude/.ralph-iteration
```

## Tips

### Optimizar iteraciones
- Sé específico en los criterios de completitud
- Divide tareas grandes en subtareas
- Incluye tests específicos en los criterios

### Monitorear en tiempo real
```bash
# En otra terminal
watch -n 5 'cat .claude/.ralph-iteration 2>/dev/null; echo ""; tail -5 .claude/PROMPT.md 2>/dev/null'
```

### Cancelar de emergencia
```bash
rm .claude/ralph-active
```

---

*Sistema de verificación iterativa automática inspirado en el loop de Ralph Wiggum.*
