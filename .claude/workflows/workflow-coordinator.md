# Workflow Coordinator System

**Propósito:** Sistema central de coordinación que gestiona la ejecución del workflow completo, transferencia entre agentes y manejo de errores.

## Arquitectura del Sistema

### Componentes Principales

1. **Orquestador Maestro** (`osyris-workflow-orchestrator`)
   - Inicia y coordina todo el workflow
   - Mantiene estado global persistente
   - Gestiona transferencias entre agentes
   - Maneja recuperación de errores

2. **Agentes Especializados** (5 agentes)
   - Cada uno responsable de una fase específica
   - Reciben contexto del agente anterior
   - Actualizan memoria persistente
   - Transferen control al siguiente agente

3. **Sistema de Memoria** (archivos JSON)
   - `session-state.json`: Estado general del workflow
   - `agent-handoffs.json`: Registro de transferencias
   - Directorio de evidencia y reportes

4. **Protocolo de Comunicación**
   - Estructura JSON estandarizada
   - Campos requeridos para cada transferencia
   - Validación automática de datos

## Flujo de Coordinación

### 1. Iniciación del Workflow

```
Usuario: /osyris-workflow-start "feature-name" "description"

Orquestador:
├── Genera session_id único
├── Inicializa session-state.json
├── Valida prerequisitos
└── Invoca primer agente
```

### 2. Ejecución por Fases

```
Para cada fase en workflow_phases:
  1. Verificar dependencias completadas
  2. Invocar agente específico
  3. Esperar finalización con timeout
  4. Validar criterios de éxito
  5. Actualizar memoria persistente
  6. Registrar handoff
  7. Transferir al siguiente agente
```

### 3. Manejo de Errores

```
Si ocurre error en fase actual:
  1. Capturar detalles del error
  2. Determinar estrategia de recuperación
  3. Ejecutar estrategia (reintento, rollback, etc.)
  4. Si no se puede recuperar:
     - Detener workflow
     - Informar al usuario
     - Ofrecer opciones de continuación manual
```

### 4. Finalización

```
Última fase completada:
├── Consolidar todos los resultados
├── Generar reporte final
├── Limpiar memoria temporal
├── Archivar evidencia
└── Notificar usuario con resumen completo
```

## Protocolo de Transferencia (Handoff)

### Estructura JSON

```json
{
  "handoff_id": "uuid-v4",
  "agent_from": "osyris-branch-manager",
  "agent_to": "osyris-feature-developer", 
  "phase_completed": "branch-preparation",
  "workflow_session_id": "session-uuid",
  "timestamp": "2025-01-18T10:30:00Z",
  "success_status": "success",
  "outputs_produced": {
    "current_branch": "feature/calendar-interactive",
    "sync_status": "completed",
    "environment_ready": true
  },
  "context_for_next": {
    "working_branch": "feature/calendar-interactive",
    "base_branch": "develop",
    "environment_status": "clean"
  },
  "error_details_if_any": null,
  "execution_time_seconds": 120,
  "resources_used": {
    "git_operations": 5,
    "files_modified": 0,
    "tests_run": 0
  }
}
```

### Validación Automática

El sistema valida que cada handoff contenga:
- ✅ ID único de handoff
- ✅ Agentes origen y destino válidos
- ✅ Timestamp en formato ISO
- ✅ Success status definido
- ✅ Outputs requeridos presentes
- ✅ Contexto para siguiente agente
- ✅ Duración de ejecución registrada

## Estados del Workflow

### session-state.json Structure

```json
{
  "session_id": "workflow-1739854200-abc123",
  "status": "in_progress",
  "current_phase": "feature-development",
  "current_agent": "osyris-feature-developer",
  "workflow": "osyris-complete-workflow",
  "initiated_by": "user-request",
  "initiated_at": "2025-01-18T10:30:00Z",
  "updated_at": "2025-01-18T10:45:00Z",
  "estimated_completion": "2025-01-18T11:15:00Z",
  "current_branch": "feature/calendar-interactive",
  "target_branch": "develop",
  "agents_history": [
    {
      "agent": "osyris-workflow-orchestrator",
      "action": "workflow_initiated",
      "timestamp": "2025-01-18T10:30:00Z"
    },
    {
      "agent": "osyris-branch-manager", 
      "action": "phase_completed",
      "phase": "branch-preparation",
      "timestamp": "2025-01-18T10:32:00Z"
    }
  ],
  "context": {
    "feature_name": "calendar-interactive",
    "feature_description": "Implement calendar with section colors",
    "last_commit": "abc123def456",
    "changes_made": [],
    "tests_run": false,
    "deployment_status": "",
    "production_verified": false,
    "error_count": 0,
    "rollback_executed": false
  },
  "phase_progress": {
    "branch-preparation": {
      "status": "completed",
      "completed_at": "2025-01-18T10:32:00Z",
      "duration_seconds": 120
    },
    "feature-development": {
      "status": "in_progress", 
      "started_at": "2025-01-18T10:32:00Z"
    },
    "integration-testing": {
      "status": "pending"
    },
    "deployment": {
      "status": "pending"
    },
    "production-verification": {
      "status": "pending"
    }
  }
}
```

## Sistema de Recuperación

### Estrategias por Tipo de Error

#### Build Failure
```json
{
  "strategy": "analyze_logs_and_fix_code",
  "max_retries": 2,
  "actions": [
    "capture_build_logs",
    "analyze_syntax_errors", 
    "suggest_specific_fixes",
    "retry_build"
  ]
}
```

#### Test Failure
```json
{
  "strategy": "identify_failing_tests_and_fix",
  "max_retries": 3,
  "actions": [
    "run_specific_failing_test",
    "analyze_test_output",
    "identify_root_cause",
    "implement_fix",
    "retry_test_suite"
  ]
}
```

#### Deployment Failure
```json
{
  "strategy": "check_infrastructure_and_redeploy",
  "max_retries": 2,
  "actions": [
    "check_server_connectivity",
    "verify_docker_containers",
    "check_database_connection",
    "restart_services",
    "retry_deployment"
  ]
}
```

### Rollback Automático

Si ocurre error crítico en producción:
1. **Detectar** el fallo inmediatamente
2. **Ejecutar** rollback a versión anterior estable
3. **Notificar** al usuario con detalles
4. **Investigar** causa raíz
5. **Preparar** nuevo intento con fixes

## Comandos de Coordinación

### Estado del Workflow
```bash
/coordinator-status
# Muestra estado actual del workflow activo
```

### Reanudar Workflow
```bash
/coordinator-continue
# Reanuda workflow interrumpido desde último punto
```

### Cancelar Workflow
```bash
/coordinator-cancel
# Detiene workflow actual con opción de rollback
```

### Ver Historial
```bash
/coordinator-history
# Muestra workflows completados previamente
```

## Monitorización y Logging

### Logs Detallados

Cada agente genera logs estructurados:
```json
{
  "timestamp": "2025-01-18T10:30:15Z",
  "agent": "osyris-branch-manager",
  "level": "INFO",
  "action": "git_command",
  "details": {
    "command": "git checkout develop",
    "result": "success",
    "duration_ms": 250
  }
}
```

### Métricas del Sistema

- **Tiempo total del workflow**: 30-60 minutos
- **Tiempo por fase**: Variable según complejidad
- **Tasa de éxito**: >95% (objetivo)
- **Tiempo de recuperación**: <5 minutos
- **Uso de recursos**: CPU, memoria, red

## Configuración y Personalización

### Variables Configurables

```json
{
  "timeouts": {
    "phase_execution": "30m",
    "agent_response": "5m",
    "deployment_verification": "10m"
  },
  "thresholds": {
    "test_coverage": 80,
    "build_time_seconds": 300,
    "deployment_time_seconds": 600
  },
  "notifications": {
    "slack_enabled": false,
    "email_enabled": false,
    "console_enabled": true
  }
}
```

### Adaptabilidad

El sistema puede adaptarse para:
- **Proyectos más pequeños**: Omitir fases no críticas
- **Proyectos críticos**: Añadir validaciones adicionales
- **Equipos grandes**: Integrar con sistemas de CI/CD existentes
- **Regulaciones estrictas**: Añadir auditoría y compliance

---

*Sistema nervioso central que garantiza coordinación perfecta entre todos los agentes del workflow.*