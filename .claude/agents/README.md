# 🤖 Sistema de Agentes Osyris v2.0

## Filosofía del Sistema

**"Un ejecutor, múltiples planificadores"**

Este sistema está diseñado para:
- ✅ **Claridad**: Cada agente tiene UN rol bien definido
- ✅ **Seguridad**: Solo 1 agente puede modificar código
- ✅ **Trazabilidad**: Todas las decisiones están documentadas
- ✅ **Escalabilidad**: Fácil añadir nuevos agentes especialistas

## Arquitectura

```
                    👤 USUARIO
                       ↓
           ┌───────────────────────┐
           │  osyris-coordinator   │  🎭 Orquestador
           │  (Director)           │
           └───────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│osyris-planner│ │osyris-executor│ │  Agentes     │
│(Planificador)│ │  (Ejecutor)   │ │  Auxiliares  │
└──────────────┘ └──────────────┘ └──────────────┘
   SOLO PLANEA     SOLO EJECUTA    CONTEXTO/DEPLOY
```

## Agentes del Sistema

### 🎭 **osyris-coordinator** (ÚNICO interlocutor del Usuario)
- **Rol**: Director de orquesta
- **Responsabilidad**: Coordinar todo el equipo
- **Puede**: Tomar decisiones, aprobar planes, asignar tareas
- **No puede**: Ejecutar código, planificar implementaciones

### 📋 **osyris-planner** (Arquitecto)
- **Rol**: Diseñar planes de implementación
- **Responsabilidad**: Análisis y planificación técnica
- **Puede**: Leer código, diseñar arquitectura, proponer soluciones
- **No puede**: Ejecutar código, tomar decisiones finales

### 🎯 **osyris-executor** (ÚNICO que ejecuta)
- **Rol**: Ejecutar implementaciones
- **Responsabilidad**: Modificar código según plan aprobado
- **Puede**: Editar archivos, ejecutar comandos, hacer commits
- **No puede**: Improvisar, saltarse pasos del plan

### 🏠 **osyris-local-dev** (Asistente desarrollo)
- **Rol**: Gestionar entorno de desarrollo local
- **Responsabilidad**: Setup, Docker, PostgreSQL local
- **Puede**: Configurar entorno, resolver problemas de setup
- **No puede**: Modificar lógica de negocio

### 🚀 **osyris-deploy-agent** (Asistente deployment)
- **Rol**: Gestionar deploys a producción
- **Responsabilidad**: CI/CD, GitHub Actions, Hetzner
- **Puede**: Verificar producción, monitorizar deploys
- **No puede**: Hacer deploy sin autorización

## Workflow de Desarrollo

### Caso de Uso: "Quiero implementar nueva funcionalidad"

```
1. USUARIO: "Quiero añadir export PDF en el calendario"
   ↓
2. COORDINATOR:
   - Analiza requerimiento
   - Delega a PLANNER
   ↓
3. PLANNER:
   - Lee código relevante
   - Diseña plan detallado
   - Retorna al COORDINATOR
   ↓
4. COORDINATOR:
   - Revisa plan
   - Presenta al USUARIO
   - Espera aprobación
   ↓
5. USUARIO: "Apruebo el plan"
   ↓
6. COORDINATOR:
   - Autoriza a EXECUTOR
   - Monitorea progreso
   ↓
7. EXECUTOR:
   - Ejecuta paso a paso
   - Reporta progreso
   - Completa implementación
   ↓
8. COORDINATOR:
   - Valida resultado
   - Actualiza CLAUDE.md
   - Guarda en memoria MCP
   - Confirma al USUARIO
```

### Caso de Uso: "Hay un error en producción"

```
1. USUARIO: "El login está fallando en producción"
   ↓
2. COORDINATOR:
   - Clasifica como urgente
   - Delega análisis a PLANNER
   - Alerta a DEPLOY-AGENT
   ↓
3. PLANNER:
   - Investiga logs
   - Identifica causa
   - Propone fix rápido
   ↓
4. DEPLOY-AGENT:
   - Proporciona contexto de producción
   - Verifica estado del servidor
   ↓
5. COORDINATOR:
   - Presenta diagnóstico al USUARIO
   - Propone solución inmediata
   ↓
6. USUARIO: "Aplicar fix urgente"
   ↓
7. EXECUTOR:
   - Aplica fix
   - Ejecuta tests
   - Prepara para deploy
   ↓
8. COORDINATOR:
   - Valida fix
   - Autoriza deploy
   ↓
9. DEPLOY-AGENT:
   - Ejecuta GitHub Action
   - Monitoriza deployment
   - Verifica que funciona
   ↓
10. COORDINATOR → USUARIO:
    "✅ Fix aplicado y verificado en producción"
```

## Comunicación entre Agentes

### Protocolo de Handoff

Todos los mensajes entre agentes siguen este formato:

```json
{
  "from": "osyris-coordinator",
  "to": "osyris-planner",
  "type": "request_plan | execute_task | report_status",
  "priority": "low | normal | high | critical",
  "payload": {
    "task_id": "TASK-001",
    "description": "...",
    "context": {},
    "deadline": null
  },
  "timestamp": "2025-10-03T14:30:00Z",
  "correlation_id": "unique-id"
}
```

### Estado Compartido (via MCP Memory)

```javascript
// Estado global accesible por todos los agentes
{
  "project": {
    "name": "Osyris Scout Management",
    "version": "1.0.0",
    "environment": "development",
    "stack": {
      "frontend": "Next.js 15",
      "backend": "Express.js",
      "database": "PostgreSQL",
      "deployment": "Hetzner Cloud"
    }
  },
  "current_tasks": [
    {
      "id": "TASK-001",
      "status": "in_progress",
      "assigned_to": "osyris-executor",
      "progress": "3/7 steps"
    }
  ],
  "recent_implementations": [
    {
      "feature": "Google OAuth",
      "date": "2025-10-02",
      "success": true
    }
  ],
  "known_issues": [],
  "technical_debt": []
}
```

## Agregar Nuevos Agentes

### Proceso para crear nuevo agente especialista:

1. **Identificar necesidad**
   - ¿Qué problema resuelve?
   - ¿Por qué los agentes actuales no lo cubren?

2. **Definir rol**
   - ¿Planifica o ejecuta?
   - ¿Qué puede/no puede hacer?
   - ¿Con quién se comunica?

3. **Crear archivo .md**
   ```
   .claude/agents/osyris-{nombre}.md
   ```

4. **Seguir template:**
   ```markdown
   # {Emoji} Osyris {Nombre} Agent

   ## Propósito

   ## Responsabilidades

   ## Workflow

   ## Comunicación con otros Agentes

   ## MCPs Utilizados

   ## Reglas
   ```

5. **Actualizar documentación**
   - Añadir a este README
   - Actualizar CLAUDE.md
   - Documentar en memoria MCP

### Ejemplo: Agente de Testing

```markdown
# 🧪 Osyris Test Engineer Agent

## Propósito
Asegurar calidad del código mediante testing exhaustivo

## Responsabilidades
- Diseñar estrategias de testing
- Revisar cobertura de tests
- Identificar casos edge
- Proponer tests automatizados

## Comunicación
- Recibe de COORDINATOR: Código a testear
- Envía a PLANNER: Estrategia de testing
- Reporta a COORDINATOR: Resultados y gaps
```

## MCPs Integrados

### filesystem
- Acceso a archivos del proyecto
- Lectura de configuraciones
- Logs del sistema

### memory (project_memory)
- Estado del proyecto
- Historial de implementaciones
- Decisiones tomadas
- Deuda técnica

### monitoring
- Logs de agentes
- Métricas de performance
- Alertas de errores

### hetzner
- Acceso al servidor de producción
- Gestión de despliegues
- Monitorización

### github
- Gestión de repositorio
- GitHub Actions
- Pull Requests

## Ventajas del Sistema

### ✅ Para el Usuario
- **Claridad**: Siempre sabe quién hace qué
- **Control**: Debe aprobar planes antes de ejecución
- **Trazabilidad**: Toda decisión está documentada
- **Confianza**: Un solo agente ejecuta = menos riesgo

### ✅ Para el Desarrollo
- **Modularidad**: Agentes intercambiables
- **Escalabilidad**: Fácil añadir especialistas
- **Mantenibilidad**: Rol claro = código claro
- **Debugging**: Logs por agente = fácil identificar problemas

### ✅ Para el Proyecto
- **Calidad**: Revisión en múltiples etapas
- **Documentación**: Auto-documenta decisiones
- **Conocimiento**: Memoria MCP = contexto persistente
- **Evolución**: Sistema crece con el proyecto

## Reglas de Oro

1. **NUNCA** más de un agente ejecuta código
2. **SIEMPRE** aprobar planes con Usuario
3. **NUNCA** saltarse el Coordinator
4. **SIEMPRE** documentar decisiones importantes
5. **NUNCA** deploy sin validación completa

## Ejemplo de Invocación

```
# ❌ INCORRECTO (Usuario llama directo a Executor)
USUARIO: @osyris-executor, añade un botón en la página

# ✅ CORRECTO (Usuario llama a Coordinator)
USUARIO: Quiero añadir un botón de "Exportar" en la página de calendario

COORDINATOR: Entendido. Voy a coordinar esta implementación...
```

---

**Versión del Sistema**: 2.0
**Última actualización**: 2025-10-03
**Autor**: Diseñado para escalabilidad y claridad
