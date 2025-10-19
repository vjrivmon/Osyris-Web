# 🚀 Flujo de Deploy Rápido y Seguro - Osyris Scout Management

## 📋 Resumen del Sistema

Flujo de trabajo optimizado para implementar cambios en producción con seguridad máxima y tiempo mínimo. Sistema híbrido que combina velocidad con verificación completa.

**Tiempo Total Estimado:** ~15 minutos vs horas en desarrollo local

## 🎯 Flujo Propuesto

```
📝 Desarrollo Local → ⚡ Staging (5 min) → 🎯 Producción (2 min) → ✅ Verificación (3 min)
```

## 🛠️ Herramientas Implementadas

| Herramienta | Archivo | Tiempo | Función |
|-------------|---------|--------|---------|
| **Deploy a Staging** | `scripts/deploy-to-staging.sh` | 5 min | Crea réplica exacta de producción |
| **Deploy Ultra-Rápido** | `scripts/deploy-to-production-from-staging.sh` | 2 min | Sincroniza staging → producción |
| **Verificación Automática** | `scripts/verify-deployment.sh` | 1-2 min | Checklist completo del sistema |
| **Rollback Emergencia** | `scripts/emergency-rollback.sh` | 30 seg | Restauración instantánea |
| **Feature Flags** | `src/lib/feature-flags.ts` | - | Activar/desactivar funcionalidades |
| **Panel Control Flags** | Componente React | - | Control visual de features |

## 🚀 Flujo Detallado Paso a Paso

### Fase 1: Desarrollo Local ✅
**Tiempo:** Variable (según complejidad)

```bash
# 1. Desarrollar la funcionalidad
# 2. Testing unitario
npm test

# 3. Verificar build
npm run build

# 4. Commit de cambios
git add .
git commit -m "feat: nueva funcionalidad implementada"
```

### Fase 2: Deploy a Staging ⚡
**Tiempo:** 5 minutos

```bash
# Deploy automático a staging
./scripts/deploy-to-staging.sh
```

**¿Qué hace este script?**
- ✅ Backup automático de producción
- ✅ Creación de entorno staging réplica exacta
- ✅ Sincronización de base de datos
- ✅ Configuración de PM2 para staging
- ✅ Verificación de servicios

**Resultado:**
- 🌐 Frontend staging: `http://116.203.98.142:3001`
- 🔧 Backend staging: `http://116.203.98.142:5001`

### Fase 3: Verificación en Staging 🔍
**Tiempo:** 3 minutos

```bash
# Verificación completa de staging
./scripts/verify-deployment.sh staging

# O verificación manual
curl http://116.203.98.142:3001
curl http://116.203.98.142:5001/api/health
```

**Checklist de Verificación:**
- ✅ Frontend accesible y funcional
- ✅ API endpoints respondiendo
- ✅ Base de datos sincronizada
- ✅ Nueva funcionalidad trabajando
- ✅ Sin errores en consola

### Fase 4: Deploy a Producción 🎯
**Tiempo:** 2 minutos

```bash
# Confirmación y deploy a producción
./scripts/deploy-to-production-from-staging.sh
```

**¿Qué hace este script?**
- ✅ Backup instantáneo de producción
- ✅ Sincronización archivos staging → producción
- ✅ Restauración environment de producción
- ✅ Reinicio servicios PM2
- ✅ Creación script rollback automático

### Fase 5: Verificación Final ✅
**Tiempo:** 3 minutos

```bash
# Verificación completa de producción
./scripts/verify-deployment.sh production

# Verificación manual
curl https://gruposcoutosyris.es
curl https://gruposcoutosyris.es/api/health
```

## 🔄 Sistema de Feature Flags

### Activar Nuevas Funcionalidades

```typescript
// En código TypeScript
import { useFeatureFlag, FeatureFlagWrapper } from '@/lib/feature-flags';

// Hook para verificar flag
const isNewDashboardEnabled = useFeatureFlag('new-dashboard');

// Componente condicional
<FeatureFlagWrapper flag="advanced-calendar" fallback={<CalendarOld />}>
  <CalendarNew />
</FeatureFlagWrapper>
```

### Control Visual (solo desarrollo/staging)

```typescript
// En layout principal
import { FeatureFlagsPanel } from '@/lib/feature-flags';

function AppLayout({ children }) {
  return (
    <>
      {children}
      <FeatureFlagsPanel /> {/* Panel flotante de control */}
    </>
  );
}
```

### API para Administración

```bash
# Obtener todos los flags
curl https://gruposcoutosyris.es/api/feature-flags

# Activar/desactivar flag (solo admin)
curl -X PUT https://gruposcoutosyris.es/api/feature-flags/new-dashboard \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Verificar modo mantenimiento
curl https://gruposcoutosyris.es/api/feature-flags/maintenance/check
```

## 🚨 Rollback de Emergencia

### Opción 1: Automático (30 segundos)

```bash
# Usar el último backup automáticamente
./scripts/emergency-rollback.sh

# Usar un backup específico
./scripts/emergency-rollback.sh backup_staging_20241018_143022
```

### Opción 2: Manual en Servidor

```bash
# Conectar al servidor
ssh root@116.203.98.142

# Usar script creado automáticamente
/var/www/rollback-last-deploy.sh

# O rollback manual
cd /var/www/osyris
pm2 stop osyris-frontend osyris-backend
rm -rf current
cp -r /var/www/backups/backup_nombre current
cd current && pm2 start ...
```

## 📊 Comandos Rápidos

### Desarrollo
```bash
# Iniciar desarrollo local
./scripts/dev-start.sh

# Testing completo
npm test

# Build verificación
npm run build

# Verificar código
npm run lint
```

### Deploy
```bash
# Deploy a staging (5 min)
./scripts/deploy-to-staging.sh

# Deploy staging → producción (2 min)
./scripts/deploy-to-production-from-staging.sh

# Verificación completa (1-2 min)
./scripts/verify-deployment.sh
./scripts/verify-deployment.sh production
./scripts/verify-deployment.sh staging
```

### Emergencia
```bash
# Rollback instantáneo (30 seg)
./scripts/emergency-rollback.sh

# Verificación post-rollback
./scripts/verify-deployment.sh production
```

### Feature Flags
```bash
# API endpoints
curl /api/feature-flags              # Todos los flags
curl /api/feature-flags/debug/info   # Info debug
curl /api/feature-flags/maintenance/check  # Modo mantenimiento
```

## 🔧 Configuración de Entornos

### Variables de Entorno

**Producción:**
```env
NODE_ENV=production
STAGING_MODE=false
FRONTEND_URL=https://gruposcoutosyris.es
```

**Staging:**
```env
NODE_ENV=staging
STAGING_MODE=true
FRONTEND_URL=http://116.203.98.142:3001
```

### Puertos y URLs

| Entorno | Frontend | Backend | API Health |
|---------|----------|---------|------------|
| **Local** | http://localhost:3000 | http://localhost:5000 | http://localhost:5000/api/health |
| **Staging** | http://116.203.98.142:3001 | http://116.203.98.142:5001 | http://116.203.98.142:5001/api/health |
| **Producción** | https://gruposcoutosyris.es | https://gruposcoutosyris.es/api | https://gruposcoutosyris.es/api/health |

## 📈 Métricas y Monitorización

### Tiempos del Flujo

| Fase | Tiempo Estimado | Tiempo Real |
|------|-----------------|-------------|
| Desarrollo | Variable | ⏱️ |
| Deploy Staging | 5 min | ⏱️ |
| Verificación Staging | 3 min | ⏱️ |
| Deploy Producción | 2 min | ⏱️ |
| Verificación Final | 3 min | ⏱️ |
| **TOTAL** | **~15 min** | **⏱️** |

### Métricas de Éxito

- ✅ **95%+** de checks pasados en verificación
- ✅ **< 30 seg** tiempo respuesta frontend
- ✅ **< 1 seg** tiempo respuesta API
- ✅ **< 85%** uso de disco
- ✅ **< 90%** uso de memoria

## 🛡️ Medidas de Seguridad

### Backups Automáticos
- **Antes de cada deploy:** Backup completo
- **Retención:** 10 backups recientes
- **Ubicación:** `/var/www/backups/`

### Rollback Inmediato
- **Tiempo:** 30 segundos
- **Automático:** Script disponible
- **Manual:** Opción de backup específico

### Validaciones
- **Health checks:** Frontend + Backend
- **Verificación SSL:** Certificado válido
- **Headers seguridad:** Configuración correcta
- **Recursos sistema:** Memoria y disco

## 📞 Procedimientos de Emergencia

### Si Falla el Deploy

1. **Parar proceso:** `Ctrl+C`
2. **Verificar estado:** `./scripts/verify-deployment.sh`
3. **Rollback automático:** `./scripts/emergency-rollback.sh`
4. **Investigar causa:** Revisar logs PM2
5. **Reintentar:** Después de corregir

### Si Falla Producción

1. **No entrar en pánico** 🚨
2. **Rollback inmediato:** `./scripts/emergency-rollback.sh`
3. **Verificar:** `./scripts/verify-deployment.sh production`
4. **Comunicar:** A usuarios si afecta
5. **Investigar:** Logs y causa raíz

### Contacto de Emergencia

- **Servidor:** root@116.203.98.142
- **Logs PM2:** `pm2 logs osyris-frontend osyris-backend`
- **Logs Sistema:** `/var/www/logs/`
- **Backups:** `/var/www/backups/`

## 🎓 Mejores Prácticas

### Antes del Deploy
- ✅ Testing unitario completo
- ✅ Build exitoso localmente
- ✅ Commits descriptivos
- ✅ Documentación actualizada

### Durante el Deploy
- ✅ Seguir el flujo establecido
- ✅ No saltarse verificaciones
- ✅ Monitorear cada paso
- ✅ Tener listo rollback

### Después del Deploy
- ✅ Verificación completa
- ✅ Monitorizar 30 min
- ✅ Comunicar cambios
- ✅ Documentar lecciones

## 🔄 Integración con GitHub Actions

Este flujo es **complementario** a GitHub Actions:

- **GitHub Actions:** Para merges a `main` (automático)
- **Flujo Rápido:** Para cambios urgentes (manual)
- **Ambos comparten:** Mismos scripts y validaciones

## 📚 Recursos Adicionales

### Documentación
- **Sistema original:** `docs/deployment/`
- **Scripts detallados:** `scripts/README.md`
- **Feature flags:** `src/lib/feature-flags.ts`

### Comandos Útiles
```bash
# Ver PM2 status
ssh root@116.203.98.142 "pm2 list"

# Ver logs en vivo
ssh root@116.203.98.142 "pm2 logs --lines 100"

# Reiniciar servicios
ssh root@116.203.98.142 "pm2 restart osyris-frontend osyris-backend"

# Ver backups disponibles
ssh root@116.203.98.142 "ls -la /var/www/backups/"
```

---

**Última Actualización:** 2024-10-18
**Versión:** 1.0.0
**Autor:** Vicente Rivas Monferrer