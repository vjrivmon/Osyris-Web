# /coordinator-continue

Reanuda un workflow de Osyris Web que fue pausado, interrumpido o que encontró un error recuperable, continuando desde el último punto exitoso.

## Uso

```
/coordinator-continue [opciones]
```

## Opciones

- **--force**: Continúa ignorando advertencias o errores no críticos
- **--from-phase**: Especifica fase desde la cual continuar (default: última fase completada)
- **--ignore-tests**: Continúa aunque haya tests fallidos (no recomendado para producción)
- **--retry-failed**: Reintenta la fase que falló con diferentes parámetros

## Escenarios de Uso

### 1. Reanudar Workflow Pausado

```
/coordinator-continue
```

**Ejemplo de salida:**
```
🔄 REANUDANDO OSYRIS WORKFLOW

📍 Último Estado Conocido:
├── ID: workflow-1739854200-abc123
├── Fase completada: feature-development
├── Siguiente fase: integration-testing
├── Pausado hace: 5 minutos
└── Motivo: Esperando confirmación manual

🔄 Continuando desde: integration-testing
📍 Agente a invocar: osyris-integration-tester
⏱️ Tiempo estimado restante: 25 minutos

✅ Workflow reanudado exitosamente

💻 Seguimiento en tiempo real:
/coordinator-status
```

### 2. Continuar Ignoring Tests Fallidos

```
/coordinator-continue --ignore-tests
```

**Ejemplo de salida:**
```
⚠️ CONTINUANDO CON TESTS FALLIDOS

🚨 Advertencia: Se ignorarán 2 tests fallidos
├── Test 1: CalendarView.should_render_events_correctly
├── Test 2: API.activities.by_section_timeout
└── Impacto: Riesgo medio en producción

🔄 Continuando a fase: deployment
📍 Agente: osyris-deployment-coordinator
⚠️ Se marcará como deployment con advertencias

✅ Workflow continuado (con advertencias)

📝 Nota: Se recomienda ejecutar fix manual post-deployment
```

### 3. Reintentar Desde Fase Específica

```
/coordinator-continue --from-phase integration-testing --retry-failed
```

**Ejemplo de salida:**
```
🔄 REINTENTANDO DESDE FASE ESPECÍFICA

📍 Reiniciando desde: integration-testing
🔧 Modo: retry-failed (parámetros ajustados)
⏱️ Tiempo estimado: 15 minutos

🛠️ Ajustes aplicados:
├── Test timeout: 30s → 60s
├── Database pool: 5 → 10 conexiones
├── Build cache: limpiado
└── Dependencies: reinstaladas

🔄 Ejecutando fase: integration-testing
📍 Agente: osyris-integration-tester

✅ Reintento iniciado
```

### 4. Continuar Después de Error Crítico

```
/coordinator-continue --force
```

**Ejemplo de salida:**
```
🚨 CONTINUANDO DESPUÉS DE ERROR CRÍTICO

⚠️ MODO FORCE ACTIVADO
├── Último error: deployment_failure
├── Causa: Docker container no inició
├── Rollback ejecutado: ✅ Sí
└── Estado anterior: estable (commit xyz789)

🔄 Estrategia: Desplegar versión anterior + aplicar fixes
├── Versión a desplegar: xyz789 (estable)
├── Fixes a aplicar: [corrección de configuración]
└── Validación adicional: enhanced

⚠️ Este modo omite algunas validaciones de seguridad

✅ Continuando forzadamente (bajo responsabilidad del usuario)

📊 Recomendación: Monitorear producción estrechamente
```

## Estados Previos Requeridos

### ✅ Workflow Pausado Válido
- workflow_status: "paused"
- última_fase_completada: definida
- error_no_crítico: true o esperando_confirmación: true

### ⚠️ Workflow con Error Recuperable
- workflow_status: "error"
- error_type: "recoverable"
- rollback_ejecutado: true (si es deployment)

### ❌ Estados No Continuables
- workflow_status: "idle" (nada que continuar)
- workflow_status: "completed" (ya finalizado)
- error_type: "critical" sin rollback (requiere manual)

## Proceso de Continuación

### 1. Validación del Estado
```javascript
// Verificación de estado actual
const session = loadSessionState()
if (!canContinue(session)) {
  throw new Error("Workflow no se puede continuar en estado actual")
}
```

### 2. Recuperación de Contexto
```javascript
// Restaurar contexto completo
const context = {
  session_id: session.session_id,
  last_completed_phase: session.phase_progress.last_completed,
  current_branch: session.current_branch,
  changes_made: session.context.changes_made,
  error_context: session.error_context
}
```

### 3. Invocación del Agente Apropiado
```javascript
// Determinar siguiente agente
const nextAgent = getNextAgent(session.current_phase, options.from_phase)
await invokeAgent(nextAgent, context, options)
```

### 4. Actualización de Estado
```javascript
// Actualizar memoria persistente
session.status = "in_progress"
session.updated_at = new Date().toISOString()
session.continued_from = session.current_phase
saveSessionState(session)
```

## Validaciones de Seguridad

### ✅ Antes de Continuar

1. **Estado del repositorio**: Working directory limpio
2. **Rama correcta**: Debe estar en la rama del workflow
3. **Conexión a servicios**: GitHub y servidor accesibles
4. **Memoria consistente**: Archivos de estado válidos

### ⚠️ Con Modo --force

1. **Advertencia clara**: Usuario confirma riesgos
2. **Backup automático**: Estado actual respaldado
3. **Rollback ready**: Estrategia de rollback preparada
4. **Monitorización intensiva**: Seguimiento continuo

## Errores Comunes y Soluciones

### ❌ "No se puede continuar workflow en estado actual"
**Causa**: El workflow está en un estado no continuable
**Solución**: 
- Si está completed: iniciar nuevo workflow
- Si está idle: no hay nada que continuar
- Si tiene error crítico: revisar manualmente

### ❌ "Rama actual no coincide con workflow"
**Causa**: Se cambió de rama durante la pausa
**Solución**: 
```bash
git checkout feature/nombre-funcionalidad-del-workflow
/coordinator-continue
```

### ❌ "Servicios no disponibles"
**Causa**: GitHub o servidor no accesibles
**Solución**: Verificar conexión y credenciales

### ❌ "Memoria persistente corrupta"
**Causa**: Archivos de estado dañados
**Solución**: 
```bash
rm .claude/memory/session-state.json
# El sistema intentará recuperar desde git history
```

## Comandos Relacionados

- **/coordinator-status**: Ver estado actual antes de continuar
- **/coordinator-cancel**: Cancelar en lugar de continuar
- **/coordinator-history**: Ver workflows anteriores
- **/osyris-workflow-start**: Iniciar nuevo workflow si no se puede continuar

## Tips de Uso

### 🔄 Antes de Continuar
Siempre ejecuta `/coordinator-status` para entender el estado actual.

### ⚠️ Modo --force
Usa `--force` solo cuando entiendes los riesgos y tienes un plan de rollback.

### 📱 Monitorización
Después de continuar, monitorea con `/coordinator-status` cada 5-10 minutos.

### 🔧 Errores Recurrentes
Si un workflow falla consistentemente en la misma fase, considera una revisión manual del proceso.

---

*Herramienta de recuperación para reanudar workflows interrumpidos con máxima seguridad.*