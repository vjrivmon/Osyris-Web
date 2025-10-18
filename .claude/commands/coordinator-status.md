# /coordinator-status

Muestra el estado actual del workflow activo del sistema Osyris Web, incluyendo progreso de fases, agente actual, métricas y capacidad de reanudación.

## Uso

```
/coordinator-status
```

## Salida del Comando

### 🔄 Workflow en Progreso

```
🔄 OSYRIS WORKFLOW STATUS

📊 Información General:
├── ID: workflow-1739854200-abc123
├── Estado: in_progress  
├── Iniciado: 2025-01-18T10:30:00Z (hace 12 min)
├── Duración estimada: 45-60 min
└── Progreso: ████████░░ 60%

🎯 Funcionalidad:
├── Nombre: calendario-interactivo-secciones
├── Rama actual: feature/calendario-interactivo-secciones
├── Descripción: Implementar calendario con colores por sección scout
└── Agente actual: osyris-integration-tester

📋 Progreso por Fases:
✅ Fase 1: branch-preparation (Completada - 2 min)
   └── Agente: osyris-branch-manager
✅ Fase 2: feature-development (Completada - 18 min)  
   └── Agente: osyris-feature-developer
🔄 Fase 3: integration-testing (En progreso - 8 min)
   └── Agente: osyris-integration-tester
⏳ Fase 4: deployment (Pendiente)
⏳ Fase 5: production-verification (Pendiente)

📈 Métricas Actuales:
├── Tests ejecutados: 38/42
├── Cobertura: 85% (objetivo: 80%)
├── Build status: ✅ Exitoso
├── Errores TypeScript: 0
└── Archivos modificados: 7

🔗 Recursos:
├── GitHub: https://github.com/user/osyris-web/branches
├── Producción: http://116.203.98.142:3000 (no accesible aún)
└── Evidence: .claude/evidence/temporal/

⚡ Acciones Disponibles:
/coordinator-continue    # Reanudar si está pausado
/coordinator-cancel      # Cancelar workflow actual
/coordinator-history     # Ver historial completo
```

### ⏸️ Workflow Pausado

```
⏸️ OSYRIS WORKFLOW PAUSADO

📋 Detalles de Pausa:
├── Motivo: Esperando confirmación de usuario
├── Fase actual: integration-testing  
├── Agente: osyris-integration-tester
├── Pausado desde: 2025-01-18T10:48:00Z (hace 5 min)
└── Timeout: 10 minutos restantes

⚠️ Requiere Atención:
Se detectaron 2 tests con comportamiento inesperado:

1. 🧪 Test: CalendarView.should_render_events_correctly
   ❌ Error: Expected 3 events, found 2
   🔧 Sugerencia: Verificar mock data en test setup

2. 🧪 Test: API.activities.by_section  
   ❌ Error: Timeout en respuesta de API
   🔧 Sugerencia: Verificar conexión a base de datos de test

🔄 Opciones:
/coordinator-continue --ignore-tests    # Continuar ignorando tests fallidos
/coordinator-continue --fix-tests       # Intentar fix automático
/coordinator-cancel                     # Cancelar y revisar manualmente
```

### ✅ Workflow Completado

```
✅ OSYRIS WORKFLOW COMPLETADO

🎉 Resultado Final:
├── Estado: success
├── Completado: 2025-01-18T11:17:00Z
├── Duración total: 47 minutos
└── Todas las fases: completadas exitosamente

📊 Estadísticas Finales:
├── Tests: 42 pasaron, 0 fallaron
├── Cobertura: 89.5%
├── Build: ✅ Sin errores
├── Deploy: ✅ Completado
└── Verificación: ✅ Funciona en producción

🔗 Producción Verificada:
├── URL: http://116.203.98.142:3000/dashboard/calendar
├── Cambios visibles: ✅ Sí
├── Performance: 1.2s load time
└── Evidencia: 5 screenshots + 1 video

📁 Archivos Generados:
├── Reporte: .claude/reports/workflow-1739854200.pdf
├── Evidencia: .claude/evidence/calendario-interactivo/
├── Logs: .claude/logs/workflow-1739854200.json
└── Memory: .claude/memory/session-state.json

🔄 Siguiente Workflow:
Puedes iniciar un nuevo workflow con:
/osyris-workflow-start "nueva-funcionalidad" "descripción"
```

### ❌ Workflow con Errores

```
❌ OSYRIS WORKFLOW CON ERRORES

🚨 Estado Crítico:
├── Workflow: workflow-1739854200-abc123
├── Fase fallida: deployment
├── Agente: osyris-deployment-coordinator
├── Error: deployment_failure
└── Timestamp: 2025-01-18T11:05:00Z

🔍 Detalles del Error:
├── Tipo: infraestructura
├── Código: DOCKER_CONTAINER_FAILED
├── Mensaje: Container osyris-backend failed to start
├── Logs disponibles: docker logs osyris-backend
└── Impacto: Alto - servicio no disponible en producción

🔧 Intentos de Recuperación:
├── Intento 1: Reinicio automático (❌ Falló)
├── Intento 2: Rebuild container (❌ Falló)  
├── Intento 3: Rollback automático (⏳ En progreso)
└── Estado rollback: 50% completado

⚡ Acciones Requeridas:
1. 📋 Revisar logs del servidor: ssh user@116.203.98.142 'docker logs osyris-backend'
2. 🔧 Investigar causa raíz manualmente
3. 🚀 Reintentar deployment con fixes: /coordinator-continue
4. 🔄 O cancelar y revisar: /coordinator-cancel

📊 Contexto del Error:
├── Commit desplegado: abc123def456789
├── GitHub Actions: https://github.com/user/osyris-web/actions/runs/12345
├── Ambiente: producción (Hetzner)
├── Servicios afectados: backend API
└── Usuarios impactados: Todos (alta prioridad)
```

### 📭 Sin Workflow Activo

```
📭 SIN WORKFLOW ACTIVO

🔄 Estado: idle
├── Último workflow: Ninguno
├── Session activa: No
└── Sistema listo para iniciar nuevo workflow

📊 Historial Reciente:
├── workflow-1739854200: completado ✓ (hace 2 horas)
├── workflow-1739851000: completado ✓ (hace 5 horas)
├── workflow-1739847000: falló ✗ (hace 8 horas)
└── workflow-1739843000: completado ✓ (hace 12 horas)

🚀 Iniciar Nuevo Workflow:
/osyris-workflow-start "nombre-funcionalidad" "descripción detallada"

📈 Estadísticas del Sistema:
├── Total workflows: 24
├── Tasa éxito: 91.7% (22/24)
├── Tiempo promedio: 52 minutos
└── Último despliegue: hace 2 horas

🔧 Configuración:
├── GitHub Token: ✅ Configurado
├── Servidor producción: ✅ Conectado
├── MCPs activos: 8/8
└── Memoria persistente: ✅ Funcionando
```

## Detalles Técnicos

### Estados Posibles del Workflow

- **idle**: Sin workflow activo
- **in_progress**: Workflow ejecutándose
- **paused**: Esperando intervención del usuario
- **error**: Error requiere atención manual
- **completed**: Workflow finalizado exitosamente
- **cancelled**: Cancelado por el usuario
- **rolling_back**: Rollback automático en progreso

### Fases del Workflow

1. **branch-preparation**: Creación y sincronización de ramas
2. **feature-development**: Implementación de la funcionalidad
3. **integration-testing**: Pruebas y validación
4. **deployment**: Despliegue a producción
5. **production-verification**: Verificación en vivo

### Métricas Disponibles

- **Duración**: Tiempo transcurrido y estimado
- **Progreso**: Porcentaje de fases completadas
- **Tests**: Número ejecutados y tasa de éxito
- **Cobertura**: Porcentaje de código cubierto
- **Build**: Estado de compilación
- **Performance**: Métricas de rendimiento
- **Erreos**: Conteo y tipo de errores

### Información de Recursos

- **GitHub**: URL del repositorio y acciones
- **Producción**: URLs y estado de servicios
- **Evidencia**: Ubicación de archivos generados
- **Logs**: Ubicación de logs detallados

## Integración con otros Comandos

El comando `/coordinator-status` se integra con:

- **/coordinator-continue**: Reanuda workflow pausado
- **/coordinator-cancel**: Detiene workflow actual
- **/coordinator-history**: Muestra historial completo
- **/osyris-workflow-start**: Inicia nuevo workflow

---

*Ventana en tiempo real al estado completo del sistema de desarrollo Osyris.*