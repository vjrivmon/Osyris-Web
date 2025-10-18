# 🚀 Osyris Workflow System

Sistema completo de orquestación de agentes para desarrollo automatizado del proyecto Osyris Web, desde creación de rama hasta verificación en producción.

## 🎯 Propósito

Sistema integral que coordina 5 agentes especializados para ejecutar el ciclo completo de desarrollo:

1. **Branch Manager** - Gestión de ramas Git
2. **Feature Developer** - Desarrollo de funcionalidades
3. **Integration Tester** - Pruebas y validación
4. **Deployment Coordinator** - Despliegue a producción
5. **Production Verifier** - Verificación en vivo

## 🏗️ Arquitectura del Sistema

```
.claude/
├── .mcp.json                    # Configuración MCP completa
├── agents/                      # Agentes especializados
│   ├── osyris-workflow-orchestrator.md
│   ├── osyris-branch-manager.md
│   ├── osyris-feature-developer.md
│   ├── osyris-integration-tester.md
│   ├── osyris-deployment-coordinator.md
│   └── osyris-production-verifier.md
├── commands/                    # Comandos slash
│   ├── osyris-workflow-start.md
│   ├── coordinator-status.md
│   └── coordinator-continue.md
├── workflows/                   # Definiciones de workflows
│   ├── osyris-complete-workflow.md
│   └── workflow-coordinator.md
├── memory/                      # Persistencia de estado
│   ├── session-state.json
│   ├── agent-handoffs.json
│   └── README.md
├── config/                      # Configuración del sistema
│   └── agent-coordination.json
└── evidence/                    # Evidencia generada (creada dinámicamente)
    ├── screenshots/
    ├── videos/
    └── reports/
```

## 🚀 Comando Principal

### Iniciar Workflow Completo

```bash
/osyris-workflow-start "nombre-funcionalidad" "descripción detallada"
```

**Ejemplo:**
```bash
/osyris-workflow-start 
  "calendario-interactivo-secciones" 
  "Implementar calendario interactivo con colores por sección scout, navegación mensual y filtros"
```

## 📋 Comandos de Coordinación

### Estado del Workflow
```bash
/coordinator-status
```

### Continuar Workflow Pausado
```bash
/coordinator-continue [--force] [--from-phase phase] [--ignore-tests]
```

### Historial de Workflows
```bash
/coordinator-history
```

### Cancelar Workflow Actual
```bash
/coordinator-cancel [--rollback]
```

## 🔄 Flujo Completo de Ejecución

### 🏁 Fase 1: Preparación (2-3 min)
- **Agente**: osyris-branch-manager
- **Acciones**: Sincronizar develop, crear rama feature
- **Validación**: Entorno limpio, rama creada exitosamente

### 🛠️ Fase 2: Desarrollo (10-30 min)
- **Agente**: osyris-feature-developer
- **Acciones**: Implementar componentes, modificar API
- **Validación**: TypeScript sin errores, build exitoso

### 🧪 Fase 3: Testing (5-10 min)
- **Agente**: osyris-integration-tester
- **Acciones**: Ejecutar tests, verificar compatibilidad
- **Validación**: >80% cobertura, sin breaking changes

### 🚀 Fase 4: Despliegue (5-15 min)
- **Agente**: osyris-deployment-coordinator
- **Acciones**: Push, GitHub Actions, deploy a Hetzner
- **Validación**: Servicios corriendo en producción

### ✅ Fase 5: Verificación (5-10 min)
- **Agente**: osyris-production-verifier
- **Acciones**: Navegar a cambios, probar funcionalidad
- **Validación**: Funciona en producción, evidencia capturada

## 🔧 Configuración MCP

El sistema incluye 14 servicios MCP configurados:

### Esenciales para el Workflow
- **filesystem**: Gestión de archivos del proyecto
- **github**: Operaciones Git y GitHub Actions
- **memory**: Persistencia de estado y coordinación
- **chrome-devtools**: Verificación en producción
- **sequential-thinking**: Planificación compleja

### Servicios Adicionales
- **playwright**: Testing automatizado complementario
- **web-search**: Búsqueda de información
- **postgres**: Conexión a base de datos
- **docker**: Gestión de contenedores
- **slack**: Notificaciones (opcional)
- **puppeteer**: Automatización de navegador
- **brave-search**: Búsqueda alternativa
- **google-drive**: Almacenamiento en la nube
- **everything**: Búsqueda local de archivos

## 📊 Estado y Persistencia

### session-state.json
```json
{
  "session_id": "workflow-1739854200-abc123",
  "status": "in_progress",
  "current_phase": "integration-testing",
  "current_agent": "osyris-integration-tester",
  "workflow": "osyris-complete-workflow",
  "initiated_at": "2025-01-18T10:30:00Z",
  "current_branch": "feature/calendario-interactivo-secciones",
  "context": {
    "changes_made": [...],
    "tests_run": true,
    "deployment_status": "",
    "production_verified": false
  }
}
```

### agent-handoffs.json
```json
{
  "handoffs": [
    {
      "agent_from": "osyris-branch-manager",
      "agent_to": "osyris-feature-developer",
      "phase_completed": "branch-preparation",
      "timestamp": "2025-01-18T10:32:00Z",
      "success_status": "success"
    }
  ]
}
```

## 🖥️ Servidor de Producción

**Configuración:**
- **IP**: 116.203.98.142
- **Frontend**: http://116.203.98.142:3000 (Next.js)
- **Backend**: http://116.203.98.142:5000 (Express.js)
- **Base de datos**: PostgreSQL en Docker
- **Gestión**: PM2 + Docker Compose

## 🎯 Resultados Esperados

### ✅ Workflow Exitoso
```
🎉 WORKFLOW COMPLETADO EXITOSAMENTE

📊 Estadísticas:
- Duración total: 47 minutos
- 5 fases completadas
- 0 errores críticos
- 100% funcionalidad verificada

🔗 Producción:
- URL: http://116.203.98.142:3000/dashboard/calendar
- Verificado: ✅ Sí
- Performance: 1.2s load time

📁 Evidencia:
- Screenshots: 5 capturas
- Videos: 1 recorrido completo
- Reporte PDF: .claude/reports/workflow-12345.pdf
```

## 🚨 Manejo de Errores

### Estrategias de Recuperación
- **Build failure**: Análisis de logs y fix automático
- **Test failure**: Identificación de tests fallidos y corrección
- **Deployment failure**: Verificación de infraestructura y re-deploy
- **Production failure**: Rollback automático y investigación

### Opciones de Recuperación
```bash
# Reanudar desde último punto exitoso
/coordinator-continue

# Forzar continuació (bajo riesgo)
/coordinator-continue --force

# Reintentar desde fase específica
/coordinator-continue --from-phase integration-testing

# Cancelar y hacer rollback
/coordinator-cancel --rollback
```

## 📈 Métricas del Sistema

### Indicadores Clave
- **Tasa de éxito**: >95% de workflows completados
- **Tiempo promedio**: 45-60 minutos por workflow
- **Tiempo de recuperación**: <5 minutos
- **Cobertura de tests**: >80% en todos los casos
- **Uptime de producción**: >99.5%

### Monitoreo en Tiempo Real
- Estado del workflow: `/coordinator-status`
- Logs detallados: `.claude/logs/`
- Evidencia visual: `.claude/evidence/`
- Historial completo: `/coordinator-history`

## 🛠️ Prerrequisitos

### Técnicos
- **Node.js 18+**: Entorno de ejecución
- **Docker**: Contenedores de base de datos
- **Git**: Control de versiones
- **Acceso a servidor**: Credenciales Hetzner

### Configuración
- **GitHub Token**: Personal Access Token con permisos
- **MCPs activos**: 14 servicios configurados
- **Repositorio limpio**: Working directory sin cambios pendientes

### Servicios Externos
- **GitHub**: Repositorio y Actions
- **Hetzner Cloud**: Servidor de producción
- **PostgreSQL**: Base de datos en Docker
- **Chrome DevTools**: Para verificación final

## 🎨 Design System Integrado

El sistema respeta el design system de Osyris:
- **Colores scout**: Castores (naranja), Manada (amarillo), etc.
- **Componentes**: Basados en Shadcn/ui personalizados
- **Tipografía**: Jerarquía clara y accesible
- **Responsive**: Mobile-first design

## 🔄 Integración con Flujo Existente

### Compatible con
- **Next.js 15**: App Router y src/ architecture
- **Express.js**: Backend API con PostgreSQL
- **Tailwind CSS**: Estilos y utilidades
- **TypeScript**: Tipado estricto
- **ESLint/Prettier**: Calidad de código

### Sin Interferencia
- **No modifica**: Scripts ni configuraciones existentes
- **Respeta**: Convenciones del proyecto
- **Integra**: Con herramientas ya existentes
- **Preserva**: Código y funcionalidades

## 📚 Documentación Adicional

- **Workflow completo**: `.claude/workflows/osyris-complete-workflow.md`
- **Coordinación**: `.claude/workflows/workflow-coordinator.md`
- **Agentes**: `.claude/agents/` (documentación individual)
- **Comandos**: `.claude/commands/` (documentación específica)

## 🎯 Casos de Uso Ideales

### ✅ Funciona Perfecto Para
- **Nuevas funcionalidades**: Componentes, páginas, endpoints
- **Mejoras iterativas**: Optimizaciones, refactoring
- **Bug fixes**: Correcciones con testing completo
- **Actualizaciones**: Dependencias, configuraciones

### ⚠️ Consideraciones
- **Cambios grandes**: Dividir en múltiples workflows
- **Migraciones de datos**: Planificación adicional
- **Cambios estructurales**: Revisión manual recomendada

---

*Sistema de desarrollo automatizado que garantiza calidad desde código hasta producción verificada.*