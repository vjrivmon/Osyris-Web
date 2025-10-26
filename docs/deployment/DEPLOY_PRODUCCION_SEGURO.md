# 🛡️ Deploy a Producción - Modo Seguro

## ⚠️ ADVERTENCIA IMPORTANTE

**NUNCA** usar el script `sync-staging-to-production.sh` porque:
- ❌ **BORRA COMPLETAMENTE la base de datos de producción**
- ❌ **Elimina todos los usuarios reales**
- ❌ **Pierde todas las invitaciones enviadas**
- ❌ **Destruye datos irreemplazables**

## ✅ DEPLOY SEGURO - MODO CORRECTO

### Script Seguro Disponible
- **Nombre**: `scripts/deploy-production-safe.sh`
- **Modo**: Seguro (no modifica base de datos)
- **Protección**: Preserva todos los datos de producción

### Características del Modo Seguro
- ✅ **Solo sincroniza código** (archivos fuente)
- ✅ **Preserva base de datos** completa
- ✅ **Mantiene usuarios reales**
- ✅ **Conserva invitaciones activas**
- ✅ **Backup automático** del código actual

## 🚀 Comandos de Deploy

### 1. Deploy Seguro (RECOMENDADO)
```bash
./scripts/deploy-production-safe.sh
```

### 2. Deploy Manual (si el script falla)
```bash
# Sincronizar código solo (excluyendo datos)
rsync -avz --progress \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    --exclude='api-osyris/node_modules' \
    --exclude='api-osyris/uploads' \
    --exclude='.env.local' \
    ./ root@116.203.98.142:/var/www/osyris/current/

# Instalar dependencias y construir
ssh root@116.203.98.142 "cd /var/www/osyris/current && npm ci && npm run build"
ssh root@116.203.98.142 "cd /var/www/osyris/current/api-osyris && npm ci"

# Reiniciar servicios (sin tocar BD)
ssh root@116.203.98.142 "cd /var/www/osyris/current && pm2 reload osyris-backend && pm2 reload osyris-frontend"
```

## 🔐 Acceso al Sistema

### Credenciales de Admin
- **Email**: `admin@grupoosyris.es`
- **Password**: `admin123`

### URLs
- **Frontend**: https://gruposcoutosyris.es
- **Backend**: https://gruposcoutosyris.es/api/health

## ⚠️ Scripts PELIGROSOS (NO USAR)

### RENOMBRADOS PARA EVITAR USO ACCIDENTAL
- `DANGEROUS_sync-staging-to-production_OLD.sh` - ❌ NO USAR
- `scripts/sync-staging-to-production.sh` - ❌ ELIMINADO

### ¿Por qué son peligrosos?
```bash
# ESTE CÓDIGO BORRA TODOS LOS DATOS REALES:
DROP DATABASE osyris_db
CREATE DATABASE osyris_db
# ❌ SE PIERDEN: usuarios, invitaciones, mensajes, etc.
```

## 📋 Checklist Pre-Deploy

### ✅ Antes del Deploy
- [ ] Backup del código actual (automático en script seguro)
- [ ] Verificar que no hay usuarios nuevos críticos
- [ ] Test en staging completado
- [ ] Variables de entorno verificadas

### ✅ Después del Deploy
- [ ] Verificar frontend: `curl https://gruposcoutosyris.es`
- [ ] Verificar backend: `curl https://gruposcoutosyris.es/api/health`
- [ ] Probar login admin
- [ ] Verificar sistema de invitaciones

## 🚨 Emergencias

### Si algo falla
```bash
# Rollback de código (si se hizo backup)
ssh root@116.203.98.142 "cd /var/www/osyris/current && pm2 reload osyris-backend osyris-frontend"

# Restaurar usuario admin (si es necesario)
ssh root@116.203.98.142 "cd /var/www/osyris/current && docker exec osyris-db psql -U osyris_user -d osyris_db -c \"UPDATE usuarios SET contraseña = '\$2b\$10\$iRhoY40GorcB/Qlp9fcTSeYXhZ2EBqFHCGJlQO1srfG27qGdhzbnS' WHERE email = 'admin@grupoosyris.es';\""
```

### Contacto de Emergencia
- **Servidor**: 116.203.98.142 (Hetzner Cloud)
- **Panel PM2**: `ssh root@116.203.98.142 "pm2 status"`
- **Logs**: `ssh root@116.203.98.142 "pm2 logs osyris-backend --lines 50"`

## 📊 Resumen

| Método | Base de Datos | Usuarios | Invitaciones | Seguridad |
|--------|---------------|----------|---------------|-----------|
| **Script Seguro** ✅ | ✅ **INTACTA** | ✅ **PRESERVADOS** | ✅ **MANTENIDAS** | 🛡️ **SEGURO** |
| Script Peligroso ❌ | ❌ **BORRADA** | ❌ **ELIMINADOS** | ❌ **PERDIDAS** | ⚠️ **PELIGROSO** |

**CONCLUSIÓN**: Siempre usar `scripts/deploy-production-safe.sh` para proteger los datos reales de producción.