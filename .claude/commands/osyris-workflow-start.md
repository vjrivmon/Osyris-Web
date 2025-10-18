# /osyris-workflow-start

Inicia un ciclo completo de desarrollo automatizado para el sistema Osyris Web, coordinando 5 agentes especializados desde creación de rama hasta verificación en producción.

## Uso

```
/osyris-workflow-start "nombre-funcionalidad" "descripción detallada"
```

## Parámetros

- **nombre-funcionalidad** (requerido): Nombre corto y descriptivo de la funcionalidad a desarrollar. Se usará para nombrar la rama (formato: feature/nombre-funcionalidad).

- **descripción detallada** (requerido): Descripción completa de lo que se debe implementar, incluyendo componentes afectados, comportamiento esperado y cualquier requisito técnico específico.

## Ejemplos

### Calendario Interactivo
```
/osyris-workflow-start 
  "calendario-interactivo-secciones" 
  "Implementar calendario interactivo con colores por sección scout, navegación mensual, filtros por sección, vista de detalles de eventos y responsive design completo"
```

### Mejoras de Perfil
```
/osyris-workflow-start 
  "mejoras-perfil-usuario" 
  "Añadir foto de perfil con upload, biografía editable, enlaces a redes sociales, historial de actividades y configuración de privacidad"
```

### Sistema de Notificaciones
```
/osyris-workflow-start 
  "sistema-notificaciones" 
  "Implementar sistema de notificaciones en tiempo real con WebSocket, centro de notificaciones, preferencias de usuario y notificaciones push para móviles"
```

## Flujo Automatizado

El comando ejecuta automáticamente las siguientes fases:

### 🏁 Fase 1: Preparación (2-3 min)
- Sincroniza develop con main
- Crea rama feature/nombre-funcionalidad
- Valida entorno de desarrollo

### 🛠️ Fase 2: Desarrollo (10-30 min)
- Analiza requisitos y código existente
- Implementa componentes React/Next.js
- Crea/modifica endpoints API si es necesario
- Valida TypeScript y ESLint

### 🧪 Fase 3: Testing (5-10 min)
- Ejecuta suite completa de tests
- Verifica compatibilidad con develop
- Valida calidad de código y performance

### 🚀 Fase 4: Despliegue (5-15 min)
- Hace push a develop
- Monitoriza GitHub Actions
- Verifica despliegue en servidor Hetzner (116.203.98.142)

### ✅ Fase 5: Verificación (5-10 min)
- Navega a los cambios en producción con Chrome DevTools
- Prueba funcionalidad específica
- Captura evidencia visual (screenshots/videos)
- Valida performance y usabilidad

## Prerrequisitos

1. **Repositoritorio limpio**: Working directory sin cambios pendientes
2. **GitHub Token**: Configurado en .claude/.mcp.json
3. **Servidor producción**: Acceso a Hetzner 116.203.98.142
4. **MCPs activos**: filesystem, github, chrome-devtools, memory

## Estados Posibles

### ✅ Workflow Iniciado Exitosamente
```
🚀 OSYRIS WORKFLOW INICIADO

📋 Datos del Workflow:
- ID: workflow-1739854200-abc123
- Funcionalidad: calendario-interactivo-secciones
- Rama: feature/calendario-interactivo-secciones
- Duración estimada: 45-60 minutos

🔄 Fase Actual: branch-preparation
📍 Agente Activo: osyris-branch-manager

💻 Seguimiento en tiempo real:
/coordinator-status
```

### ⚠️ Errores Comunes

**Working directory sucio:**
```
❌ Hay cambios pendientes en el repositorio
Solución: Ejecuta git commit, git stash o git reset
```

**GitHub Token inválido:**
```
❌ Token de GitHub no configurado o inválido
Solución: Configura GITHUB_PERSONAL_ACCESS_TOKEN en .mcp.json
```

**Servidor no accesible:**
```
❌ No se puede conectar al servidor de producción
Solución: Verifica conexión y credenciales del servidor
```

## Comandos de Seguimiento

Durante la ejecución del workflow puedes usar:

- **/coordinator-status**: Ver estado actual del workflow
- **/coordinator-history**: Ver workflows completados
- **/coordinator-cancel**: Cancelar workflow actual
- **/coordinator-continue**: Reanudar workflow interrumpido

## Resultados Esperados

Al completarse exitosamente el workflow:

### 📊 Reporte Final
```
🎉 WORKFLOW COMPLETADO EXITOSAMENTE

📈 Estadísticas:
- Duración total: 47 minutos
- 5 fases completadas
- 0 errores críticos
- 100% funcionalidad verificada

🔗 Producción:
- URL: http://116.203.98.142:3000
- Changes: /dashboard/calendar
- Verificado: ✅ Sí

📁 Evidencia:
- Screenshots: 5 capturas
- Videos: 1 recorrido completo
- Reporte: .claude/reports/workflow-12345.pdf

🔗 GitHub Actions:
- Build: https://github.com/user/osyris-web/actions/runs/12345
- Deploy: Completado exitosamente
```

### 📁 Archivos Generados

- **.claude/evidence/screenshots/**: Capturas de pantalla de los cambios
- **.claude/evidence/videos/**: Videos del flujo de usuario
- **.claude/reports/**: Reporte PDF completo del workflow
- **.claude/memory/**: Registro persistente de la ejecución

## Cancelación y Recuperación

Si necesitas cancelar el workflow:

```bash
/coordinator-cancel
# Opcionalmente con rollback automático
/coordinator-cancel --rollback
```

Para reanudar un workflow interrumpido:

```bash
/coordinator-continue
# Reanuda desde el último punto completado
```

## Tips de Uso

### 📝 Descripciones Efectivas
Sé específico en la descripción:
- ✅ "Implementar calendario con colores por sección y navegación mensual"
- ❌ "Mejorar calendario"

### 🔄 Trabajos en Paralelo
Puedes iniciar múltiples workflows para funcionalidades independientes, pero:
- Cada workflow usa una rama diferente
- Solo un workflow puede estar en fase de despliegue a la vez
- El sistema gestiona colas automáticas

### 📱 Seguimiento Remoto
Recibirás notificaciones automáticas cuando:
- Una fase se completa
- Ocurre un error que requiere tu atención
- El workflow termina exitosamente

---

*Comando maestro para iniciar desarrollo automatizado de principio a fin.*