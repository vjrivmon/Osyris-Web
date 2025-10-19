# 🚀 Staging QuickStart - Guía Rápida

> **TL;DR:** Cómo desplegar y verificar cambios en 3 comandos

## ⚡ Comandos Esenciales

### 1️⃣ **Deploy a Staging** (~5 min)
```bash
./scripts/deploy-to-staging.sh
```

✅ Lo que hace automáticamente:
- Copia producción → staging
- Genera build con `NEXT_PUBLIC_API_URL=http://116.203.98.142:5001`
- Inicia servicios en puertos 3001/5001
- Crea BD staging con datos de producción

### 2️⃣ **Verificar Staging** (~2 min)
```bash
./scripts/verify-deployment.sh staging
```

✅ Verifica:
- Frontend accesible
- Backend respondiendo
- Endpoints funcionando
- ✨ Debe dar > 90% éxito

### 3️⃣ **Deploy a Producción** (~2 min)
```bash
./scripts/deploy-to-production-from-staging.sh
```

✅ Solo si staging está OK
✅ Requiere confirmación escribiendo `SI`
✅ Crea backup automático
✅ Restaura .env de producción

---

## 🌐 URLs

| Entorno | Frontend | Backend | Base de Datos |
|---------|----------|---------|---------------|
| **Staging** | http://116.203.98.142:3001 | http://116.203.98.142:5001 | osyris_staging_db |
| **Producción** | https://gruposcoutosyris.es | https://gruposcoutosyris.es/api | osyris_db |

---

## 🚨 Rollback de Emergencia

Si algo falla en producción:

```bash
./scripts/emergency-rollback.sh
```

⏱️ **30 segundos** para restaurar el estado anterior

---

## 🔍 Problemas Comunes

### ❌ "Connection refused" en staging

**Causa:** Build sin `NEXT_PUBLIC_API_URL` correcta

**Solución:**
```bash
./scripts/deploy-to-staging.sh  # Regenera todo
```

### ❌ "Cannot find module 'next'"

**Causa:** Faltan dependencias

**Solución:**
```bash
ssh root@116.203.98.142
cd /var/www/osyris-staging/current
npm ci --production=false
pm2 restart osyris-staging-frontend
```

### ❌ Deploy falla con errores de build

**Causa:** Errores en código

**Solución:**
```bash
npm run build  # Ver errores localmente
npm run lint   # Corregir
git add . && git commit -m "fix: build"
git push
./scripts/deploy-to-staging.sh
```

---

## 📊 Checklist Rápido

**Antes de deploy:**
- [ ] `npm test` pasa
- [ ] `npm run build` funciona
- [ ] `npm run lint` sin errores

**Deploy a staging:**
- [ ] `./scripts/deploy-to-staging.sh`
- [ ] Esperar ~5 min
- [ ] Abrir http://116.203.98.142:3001
- [ ] `./scripts/verify-deployment.sh staging`

**Deploy a producción:**
- [ ] Staging verificado OK
- [ ] `./scripts/deploy-to-production-from-staging.sh`
- [ ] Confirmar con `SI`
- [ ] `./scripts/verify-deployment.sh production`

---

## 📚 Documentación Completa

Para más detalles: [STAGING_WORKFLOW.md](./STAGING_WORKFLOW.md)

---

**Última actualización:** 2025-01-18

