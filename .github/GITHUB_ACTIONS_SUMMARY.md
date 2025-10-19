# ✅ GitHub Actions - Sistema Completo

## 🎯 Mejoras Implementadas

### 1. ✅ **Limpieza de Caché Completa**
Todos los workflows ahora limpian:
- `.next` (build de Next.js)
- `node_modules/.cache`
- `npm cache`
- Directorios `build`, `out`, `dist`

### 2. ✅ **Build Fresco Garantizado**
```bash
# En cada deploy:
npx next clean                    # Limpia caché Next.js
rm -rf .next                      # Elimina build anterior
npm ci --prefer-offline           # Instala dependencias frescas
npm run build                     # Build nuevo
```

### 3. ✅ **Variables de Entorno Correctas**

#### Producción:
```bash
NEXT_PUBLIC_API_URL=https://gruposcoutosyris.es/api
NODE_ENV=production
NEXT_PUBLIC_STAGING=false
```

#### Staging:
```bash
NEXT_PUBLIC_API_URL=http://116.203.98.142:5001
NODE_ENV=staging
NEXT_PUBLIC_STAGING=true
```

### 4. ✅ **Verificación Multi-Intento**
- 5 intentos para frontend
- 5 intentos para backend API
- Espera de 10s entre intentos
- Fallback a endpoints alternativos

### 5. ✅ **Logs Detallados de PM2**
```bash
# En cada deploy se muestran:
pm2 list                          # Estado de servicios
pm2 logs --lines 10               # Últimas líneas de logs
docker ps | grep osyris           # Estado de Docker
netstat -tlnp | grep ':3000'      # Verificación de puertos
```

---

## 📁 Workflows Disponibles

### 1. `deploy-develop.yml`
- **Rama:** develop → producción
- **Tiempo:** ~8-10 min
- **Uso:** Deploy completo con máxima seguridad

### 2. `deploy-hetzner.yml`
- **Rama:** main → producción
- **Tiempo:** ~5-7 min
- **Uso:** Deploy optimizado desde main estable

### 3. `deploy-to-staging.yml` ⭐ NUEVO
- **Rama:** develop → staging
- **Tiempo:** ~4-6 min
- **Uso:** Testing antes de producción

---

## 🔄 Workflow Recomendado

\`\`\`
LOCAL (develop)
    │
    │ git push origin develop
    ▼
STAGING (auto-deploy)
    │ http://116.203.98.142:3001
    │
    │ Verificar + Aprobar
    ▼
MAIN (merge develop → main)
    │
    │ auto-deploy
    ▼
PRODUCCIÓN
    │ https://gruposcoutosyris.es
\`\`\`

---

## ✅ Checklist de Calidad

Cada workflow garantiza:

- [x] Limpieza completa de caché
- [x] Build fresco sin reutilización
- [x] Variables de entorno correctas
- [x] Backup automático de BD
- [x] Verificación de servicios online
- [x] Logs detallados disponibles
- [x] Rollback automático si falla
- [x] Notificaciones en GitHub

---

## 🎓 Comandos Equivalentes

### Lo que hace el workflow automáticamente:

\`\`\`bash
# En local:
git push origin develop

# GitHub Actions ejecuta automáticamente:
1. npm cache clean --force
2. rm -rf .next node_modules
3. npm ci --prefer-offline
4. npx next clean && npm run build
5. tar -czf deploy.tar.gz (sin caché)
6. scp deploy.tar.gz root@116.203.98.142
7. ssh → cd /var/www/osyris → tar -xzf
8. rm -rf .next node_modules (en servidor)
9. npm ci (fresco en servidor)
10. export NEXT_PUBLIC_API_URL=...
11. npm run build (fresco en servidor)
12. pm2 restart osyris-frontend osyris-backend
13. Verificación multi-intento
14. Logs y reportes
\`\`\`

**Total:** ~15 comandos complejos automatizados

---

## 📊 Comparación: Scripts vs GitHub Actions

| Aspecto | Scripts Locales | GitHub Actions |
|---------|-----------------|----------------|
| **Trigger** | Manual | Automático + Manual |
| **Entorno** | Local → Servidor | GitHub → Servidor |
| **Limpieza** | ✅ Completa | ✅ Completa |
| **Logs** | Terminal | GitHub UI |
| **Notificaciones** | No | ✅ GitHub |
| **Historial** | No | ✅ GitHub |
| **Rollback** | Manual | ✅ Automático |

**Recomendación:** Usar GitHub Actions para CI/CD, scripts para desarrollo.

---

## 🚀 Listo para Producción

Sistema completamente automatizado y profesional:

✅ 3 workflows optimizados
✅ Limpieza de caché garantizada
✅ Build fresco en cada deploy
✅ Variables correctas por entorno
✅ Verificación exhaustiva
✅ Logs detallados
✅ Documentación completa

**Next steps:** Hacer push a develop y ver el workflow en acción! 🎉
