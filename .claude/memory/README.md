# Sistema de Memoria Persistente del Workflow

## Archivos

### session-state.json
Estado actual de la sesión de trabajo. Contiene:
- Información de la sesión actual
- Fase del workflow en curso
- Historial de agentes ejecutados
- Contexto de cambios realizados
- Estado de verificaciones

### agent-handoffs.json
Registro de transferencias entre agentes. Cada entrada contiene:
- Agente origen
- Agente destino  
- Timestamp
- Contexto transferido
- Estado de finalización

Este sistema asegura que cada agente sabe exactamente dónde dejó el trabajo anterior.