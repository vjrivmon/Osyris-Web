# Workflow Completo de Desarrollo Osyris Web

## Descripción General

Workflow end-to-end para desarrollo, testing, despliegue y verificación en producción del sistema Osyris Web. Coordina 5 agentes especializados en secuencia para garantizar calidad y confiabilidad.

## Fases del Workflow

### 🏁 Fase 1: Preparación (Branch Manager)
**Agente:** `osyris-branch-manager`
**Duración estimada:** 2-3 minutos

**Responsabilidades:**
- Sincronizar rama develop con main
- Crear nueva rama feature/nombre-funcionalidad
- Verificar entorno de desarrollo limpio
- Configurar variables de entorno

**Comandos ejecutados:**
```bash
git status
git fetch --all
git checkout main
git pull origin main
git checkout develop
git merge main
git checkout -b feature/nombre-funcionalidad
git push -u origin feature/nombre-funcionalidad
```

**Estado en memoria:**
```json
{
  "current_branch": "feature/nombre-funcionalidad",
  "sync_status": "completed",
  "environment_ready": true
}
```

---

### 🛠️ Fase 2: Desarrollo (Feature Developer)
**Agente:** `osyris-feature-developer`
**Duración estimada:** 10-30 minutos (depende complejidad)

**Responsabilidades:**
- Analizar requisitos de la funcionalidad
- Implementar componentes React/Next.js
- Crear/modificar endpoints API si es necesario
- Mantener compatibilidad con sistema existente
- Seguir patrones de diseño Osyris

**Validaciones automáticas:**
- TypeScript sin errores
- ESLint sin advertencias críticas
- Imports resueltos correctamente
- Build local exitoso

**Estado en memoria:**
```json
{
  "changes_made": [
    "src/components/CalendarView.tsx - Created",
    "src/app/dashboard/calendar/page.tsx - Modified",
    "src/types/calendar.ts - Created"
  ],
  "typescript_errors": 0,
  "linting_issues": 0,
  "build_status": "success"
}
```

---

### 🧪 Fase 3: Integración (Integration Tester)
**Agente:** `osyris-integration-tester`
**Duración estimada:** 5-10 minutos

**Responsabilidades:**
- Ejecutar suite completa de tests
- Verificar compatibilidad con develop
- Validar calidad de código
- Comprobar performance básica

**Tests ejecutados:**
```bash
npm test                    # Tests unitarios
npm run test:frontend      # Tests frontend específicos
npm run test:backend       # Tests API
npm run test:e2e          # Tests end-to-end
npm run build             # Build de producción
```

**Criterios de éxito:**
- Todos los tests críticos pasan (>80% cobertura)
- Build exitoso sin errores
- Sin breaking changes
- Performance dentro de límites aceptables

**Estado en memoria:**
```json
{
  "tests_run": {
    "unit": { "passed": 45, "failed": 0, "skipped": 2 },
    "integration": { "passed": 23, "failed": 0, "skipped": 0 },
    "e2e": { "passed": 15, "failed": 0, "skipped": 1 }
  },
  "coverage": 87.5,
  "production_ready": true
}
```

---

### 🚀 Fase 4: Despliegue (Deployment Coordinator)
**Agente:** `osyris-deployment-coordinator-updated`
**Duración estimada:** 10-20 minutos

**Responsabilidades:**
- Hacer push de cambios a develop (no main)
- Activar workflow `deploy-develop.yml` optimizado
- Monitorizar limpieza de caché y build fresco
- Verificar despliegue en servidor Hetzner con estrategia fresca
- Validar servicios con verificación comprehensiva

**Workflow Optimizado:** `deploy-develop.yml`
- **Trigger**: Push a rama `develop`
- **Estrategia**: Build fresco garantizado sin caché
- **Limpieza**: Completa en local y servidor
- **Verificación**: 5 intentos por servicio, contenido específico

**Servidor de producción:**
- **IP:** 116.203.98.142
- **Frontend:** https://gruposcoutosyris.es (HTTPS por Cloudflare)
- **Backend:** https://gruposcoutosyris.es/api/health
- **Base de datos:** PostgreSQL en Docker

**Proceso de despliegue automático:**
```bash
# 1. Push a develop (activa workflow)
git push origin develop

# 2. GitHub Actions ejecuta deploy-develop.yml
#    - Limpia caché completa
#    - Build fresco en servidor
#    - Verificación automática

# 3. Verificación post-despliegue (automática)
curl -f https://gruposcoutosyris.es
curl -f https://gruposcoutosyris.es/api/health

# 4. Verificación de PM2 en servidor
ssh root@116.203.98.142 "pm2 list"
```

**Estado en memoria:**
```json
{
  "deployment_status": "completed",
  "workflow_type": "deploy-develop.yml",
  "build_strategy": "fresh_no_cache",
  "github_actions_url": "https://github.com/user/osyris-web/actions/runs/12345",
  "production_services": ["frontend", "backend", "database"],
  "cache_cleared": true,
  "fresh_build": true,
  "deployment_completed_at": "2025-01-18T11:45:00Z"
}
```

---

### ✅ Fase 5: Verificación (Production Verifier)
**Agente:** `osyris-production-verifier`
**Duración estimada:** 5-10 minutos

**Responsabilidades:**
- Navegar directamente a los cambios implementados
- Probar funcionalidad específica con Chrome DevTools
- Capturar evidencia visual (screenshots/videos)
- Validar performance y usabilidad

**URLs de verificación:**
- Production: http://116.203.98.142:3000
- Cambio específico: http://116.203.98.142:3000/dashboard/calendar

**Validaciones técnicas:**
- Componentes cargan correctamente
- Estilos CSS aplicados adecuadamente
- Llamadas API responden
- Performance aceptable (<2s load time)
- Responsive design funcional

**Estado final en memoria:**
```json
{
  "production_verified": true,
  "verification_completed_at": "2025-01-18T11:40:00Z",
  "evidence_captured": {
    "screenshots": 5,
    "videos": 1,
    "performance_metrics": {
      "load_time": "1.2s",
      "interaction_time": "180ms"
    }
  },
  "workflow_completed": true
}
```

---

## Comando de Inicio

### /osyris-workflow-start
Inicia el ciclo completo de desarrollo.

**Sintaxis:**
```
/osyris-workflow-start "nombre-funcionalidad" "descripción detallada de los cambios"
```

**Ejemplo completo:**
```
/osyris-workflow-start 
  "calendario-interactivo-secciones" 
  "Implementar calendario interactivo con colores por sección scout, navegación mensual, filtros por sección y vista de detalles de eventos"
```

---

## Coordinación de Agentes

### Transferencia de Contexto

Cada agente:
1. **Recibe** el estado actual del workflow
2. **Ejecuta** sus responsabilidades específicas
3. **Actualiza** la memoria persistente con sus resultados
4. **Transfiere** el control al siguiente agente con contexto completo

### Archivos de Memoria

- **session-state.json**: Estado general del workflow
- **agent-handoffs.json**: Registro de transferencias
- **workflow-evidence/**: Evidencia visual y reportes

### Recuperación de Errores

Si un agente falla:
- Se registra el error con detalle
- Se ofrece opciones de recuperación
- Se puede reanudar desde el punto de fallo
- El orquestador mantiene el contexto completo

---

## Ejemplo de Ejecución Completa

### Input del Usuario:
```
/osyris-workflow-start 
  "mejora-perfil-usuario" 
  "Añadir foto de perfil, biografía y enlace a redes sociales al perfil de usuario"
```

### Ejecución Automática:

**🏁 Fase 1 (2 min):**
- ✅ Sincronizado develop con main
- ✅ Creada rama feature/mejora-perfil-usuario
- ✅ Entorno validado

**🛠️ Fase 2 (15 min):**
- ✅ Analizado impacto en componentes de perfil
- ✅ Creado componente ProfilePhoto.tsx
- ✅ Modificado UserProfileView.tsx
- ✅ Añadidos endpoints para upload de fotos
- ✅ TypeScript sin errores

**🧪 Fase 3 (8 min):**
- ✅ Tests unitarios: 42 pasaron, 0 fallaron
- ✅ Tests de API: 18 pasaron, 0 fallaron
- ✅ Build exitoso
- ✅ 89% cobertura de código

**🚀 Fase 4 (12 min):**
- ✅ Push a develop completado
- ✅ GitHub Actions ejecutado exitosamente
- ✅ Despliegue en producción completado
- ✅ Servicios validados en 116.203.98.142

**✅ Fase 5 (7 min):**
- ✅ Navegado a http://116.203.98.142:3000/dashboard/profile
- ✅ Foto de perfil subida correctamente
- ✅ Biografía guardada y mostrada
- ✅ Redes sociales configuradas
- ✅ 5 capturas de pantalla tomadas
- ✅ Video del flujo completo generado

### Reporte Final:
```
🎉 WORKFLOW COMPLETADO EXITOSAMENTE

📊 Estadísticas:
- Duración total: 44 minutos
- 5 fases completadas
- 0 errores críticos
- 100% funcionalidad verificada

🔗 Links:
- Producción: http://116.203.98.142:3000/dashboard/profile
- GitHub Actions: https://github.com/user/osyris-web/actions/runs/12345

📁 Evidencia:
- 5 screenshots en .claude/evidence/screenshots/
- 1 video en .claude/evidence/videos/
- Reporte completo en .claude/reports/workflow-12345.pdf
```

---

## Requisitos Previos

1. **GitHub Token:** Configurado en .mcp.json
2. **Entorno local:** Node.js, Docker funcionando
3. **Acceso a servidor:** Credenciales Hetzner válidas
4. **Chrome DevTools:** MCP instalado y funcionando
5. **Permisos:** Acceso de escritura en repositorio

---

*Workflow completo garantizando calidad desde desarrollo hasta producción validada.*