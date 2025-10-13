# 🚀 ROADMAP: Solución Modo Edición en Producción

## 🎯 Problema Identificado

El modo de edición **NO se activa** cuando se accede a `https://www.gruposcoutosyris.es/?editMode=true` a pesar de que el usuario está autenticado como admin.

### 🔍 Causa Raíz: Aislamiento de localStorage por Origen

**Problema Principal:** Same-Origin Policy
- `https://gruposcoutosyris.es` (sin www) → Origen A
- `https://www.gruposcoutosyris.es` (con www) → Origen B

Cuando el usuario hace login en `https://gruposcoutosyris.es`:
- ✅ `localStorage` guarda: `token`, `osyris_user`, `userRole`
- ✅ Sesión válida en ese origen

Cuando navega a `https://www.gruposcoutosyris.es/?editMode=true`:
- ❌ `localStorage` está **vacío** (diferente origen)
- ❌ `AuthContext` detecta "sin sesión"
- ❌ `canEdit = false` en `EditModeContext`
- ❌ `EditModeUrlHandler` ignora el parámetro `editMode=true`

### 🔍 Problemas Secundarios

1. **API URLs no configuradas en producción**
   - `lib/api-utils.ts:27` → Fallback a `http://localhost:5000`
   - En producción debería apuntar a `http://116.203.98.142:5000`

2. **Variable de entorno faltante**
   - `NEXT_PUBLIC_API_URL` no está configurada en `.env.production`

---

## 📋 ROADMAP DE SOLUCIÓN

### ✅ FASE 0: Diagnóstico y Verificación (15 min)

**Objetivo:** Confirmar el problema y documentar el estado actual

- [ ] **0.1. Verificar localStorage en producción**
  ```
  1. Abrir https://gruposcoutosyris.es
  2. Login como admin
  3. DevTools → Application → Local Storage
  4. Verificar: token, osyris_user existen
  5. Navegar a https://www.gruposcoutosyris.es
  6. Verificar: localStorage VACÍO
  ```

- [ ] **0.2. Verificar configuración actual del servidor**
  ```bash
  ssh root@116.203.98.142
  cat /etc/nginx/sites-available/osyris
  # Buscar configuración de www redirect
  ```

- [ ] **0.3. Verificar variables de entorno en producción**
  ```bash
  ssh root@116.203.98.142
  cat /home/osyris/Osyris-Web/.env.production
  # Verificar NEXT_PUBLIC_API_URL
  ```

**Resultado esperado:**
- Confirmación del problema de localStorage
- Documentación de configuración actual de nginx
- Lista de variables de entorno faltantes

---

### 🔧 FASE 1: Solución del Problema de Origen (30 min)

**Objetivo:** Implementar redirección 301 permanente de www → raíz

#### 📝 Opción A: Redirección en Nginx (RECOMENDADA)

**Pros:**
- ✅ Solución estándar y profesional
- ✅ SEO-friendly (301 permanente)
- ✅ Rendimiento óptimo (a nivel de servidor)
- ✅ Un solo origen para todo el sitio

**Contras:**
- ⚠️ Requiere acceso SSH al servidor
- ⚠️ Requiere reiniciar nginx

**Implementación:**

- [ ] **1.1. Conectar al servidor**
  ```bash
  ssh root@116.203.98.142
  ```

- [ ] **1.2. Backup de configuración actual**
  ```bash
  sudo cp /etc/nginx/sites-available/osyris /etc/nginx/sites-available/osyris.backup.$(date +%Y%m%d_%H%M%S)
  ```

- [ ] **1.3. Editar configuración de nginx**
  ```bash
  sudo nano /etc/nginx/sites-available/osyris
  ```

  **Agregar ANTES del bloque server principal:**
  ```nginx
  # Redirección permanente de www a dominio raíz
  server {
      listen 80;
      listen [::]:80;
      listen 443 ssl http2;
      listen [::]:443 ssl http2;

      server_name www.gruposcoutosyris.es;

      # Certificados SSL (los mismos del dominio principal)
      ssl_certificate /etc/letsencrypt/live/gruposcoutosyris.es/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/gruposcoutosyris.es/privkey.pem;

      # Redirección 301 permanente
      return 301 https://gruposcoutosyris.es$request_uri;
  }

  # Configuración principal (sin www)
  server {
      listen 443 ssl http2;
      listen [::]:443 ssl http2;

      server_name gruposcoutosyris.es;

      # ... resto de configuración ...
  }
  ```

- [ ] **1.4. Verificar sintaxis de nginx**
  ```bash
  sudo nginx -t
  ```

- [ ] **1.5. Aplicar cambios**
  ```bash
  sudo systemctl reload nginx
  ```

- [ ] **1.6. Verificar certificado SSL para www**
  ```bash
  # Si no existe certificado para www, generarlo
  sudo certbot --nginx -d www.gruposcoutosyris.es
  ```

- [ ] **1.7. Probar redirección**
  ```bash
  # Desde local
  curl -I https://www.gruposcoutosyris.es
  # Debe devolver: HTTP/2 301
  # Location: https://gruposcoutosyris.es/
  ```

**Verificación:**
- [ ] Abrir https://www.gruposcoutosyris.es
- [ ] Verificar que redirige a https://gruposcoutosyris.es
- [ ] Verificar que NO hay errores de certificado SSL
- [ ] Verificar que la URL en el navegador muestra SIN www

---

#### 📝 Opción B: Cookies con Dominio Compartido (ALTERNATIVA)

**Solo usar si Opción A no es viable**

**Pros:**
- ✅ Funciona en todos los subdominios
- ✅ No requiere configuración de servidor

**Contras:**
- ❌ Más invasivo (cambio en sistema de autenticación)
- ❌ Menos seguro que localStorage
- ❌ Requiere HTTPS estricto
- ❌ Más complejo de implementar

**NO RECOMENDADO** - Solo como último recurso

---

### 🔌 FASE 2: Configuración de API URLs en Producción (15 min)

**Objetivo:** Asegurar que las peticiones apuntan al backend correcto

- [ ] **2.1. Crear/actualizar `.env.production`**
  ```bash
  # En el servidor
  cd /home/osyris/Osyris-Web
  nano .env.production
  ```

  **Contenido:**
  ```env
  # API Backend en producción
  NEXT_PUBLIC_API_URL=http://116.203.98.142:5000

  # Otras variables necesarias
  NODE_ENV=production
  ```

- [ ] **2.2. Verificar que Next.js usa la variable**
  ```bash
  # Revisar en código
  grep -r "NEXT_PUBLIC_API_URL" .
  ```

- [ ] **2.3. Rebuild de la aplicación**
  ```bash
  # En el servidor
  cd /home/osyris/Osyris-Web
  npm run build
  ```

- [ ] **2.4. Reiniciar PM2**
  ```bash
  pm2 restart osyris-frontend
  pm2 save
  ```

**Verificación:**
- [ ] Abrir DevTools → Network en producción
- [ ] Intentar guardar un cambio en modo edición
- [ ] Verificar que las peticiones van a `http://116.203.98.142:5000/api/content/...`
- [ ] NO deben ir a `https://gruposcoutosyris.es/api/...`

---

### 🧪 FASE 3: Testing End-to-End (20 min)

**Objetivo:** Verificar que todo el flujo funciona correctamente

- [ ] **3.1. Limpiar sesiones previas**
  ```
  1. Abrir DevTools → Application → Local Storage
  2. Clear All para https://gruposcoutosyris.es
  3. Clear All para https://www.gruposcoutosyris.es (si existe)
  4. Cerrar navegador
  ```

- [ ] **3.2. Login desde panel admin**
  ```
  1. Abrir https://gruposcoutosyris.es/login
  2. Login: admin@grupoosyris.es
  3. Verificar redirección a /admin
  4. DevTools → verificar localStorage tiene token
  ```

- [ ] **3.3. Verificar redirección www**
  ```
  1. Intentar acceder a https://www.gruposcoutosyris.es
  2. Debe redirigir automáticamente a https://gruposcoutosyris.es
  3. La sesión debe mantenerse
  ```

- [ ] **3.4. Activar modo edición**
  ```
  1. En /admin, hacer clic en "Editar Contenido Web"
  2. Debe navegar a https://gruposcoutosyris.es/?editMode=true
  3. Debe redirigir a https://gruposcoutosyris.es/ (sin query param)
  4. Debe aparecer:
     - ✅ Borde rojo alrededor de la página
     - ✅ Barra flotante "Vista Normal / Modo Edición"
     - ✅ Botones "Guardar" y "Descartar"
  ```

- [ ] **3.5. Editar contenido**
  ```
  1. Hacer clic en cualquier texto editable
  2. Modificar el texto
  3. Verificar que aparece el badge de "1 cambio pendiente"
  4. Hacer clic en "Guardar Cambios"
  5. DevTools → Network → Verificar petición a:
     - URL: http://116.203.98.142:5000/api/content/{id}
     - Method: PUT
     - Status: 200
  6. Recargar página
  7. Verificar que el cambio persiste
  ```

- [ ] **3.6. Testing en diferentes navegadores**
  ```
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (si disponible)
  - [ ] Modo incógnito
  ```

---

### 🔒 FASE 4: Seguridad y Optimización (OPCIONAL - 15 min)

**Objetivo:** Mejoras adicionales de seguridad

- [ ] **4.1. HSTS Header en nginx**
  ```nginx
  # En el bloque server principal
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  ```

- [ ] **4.2. Rate limiting en API**
  ```nginx
  # Proteger endpoints de edición
  location /api/content {
      limit_req zone=api_limit burst=5 nodelay;
      proxy_pass http://localhost:5000;
  }
  ```

- [ ] **4.3. Monitoreo de logs**
  ```bash
  # Configurar logrotate para logs de edición
  sudo nano /etc/logrotate.d/osyris-cms
  ```

---

## 📊 Checklist Final de Verificación

### ✅ Antes del Deploy

- [ ] Backup de configuración nginx realizado
- [ ] `.env.production` configurado con `NEXT_PUBLIC_API_URL`
- [ ] Testing en local exitoso
- [ ] Plan de rollback preparado

### ✅ Después del Deploy

- [ ] Redirección www → raíz funciona (301)
- [ ] Certificado SSL válido para ambos dominios
- [ ] localStorage persiste correctamente
- [ ] Modo edición se activa con `?editMode=true`
- [ ] Cambios se guardan en la base de datos
- [ ] DevTools muestra peticiones a backend correcto
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs de nginx
- [ ] No hay errores en logs de PM2

---

## 🚨 Plan de Rollback

Si algo sale mal:

1. **Restaurar nginx:**
   ```bash
   sudo cp /etc/nginx/sites-available/osyris.backup.YYYYMMDD_HHMMSS /etc/nginx/sites-available/osyris
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **Restaurar aplicación:**
   ```bash
   cd /home/osyris/Osyris-Web
   git reset --hard HEAD~1
   npm run build
   pm2 restart osyris-frontend
   ```

3. **Verificar logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   pm2 logs osyris-frontend --lines 100
   ```

---

## 📚 Referencias Técnicas

### Archivos Clave

- **Frontend:**
  - [lib/api-utils.ts](lib/api-utils.ts:5-28) - Configuración de URLs de API
  - [lib/auth-utils.ts](lib/auth-utils.ts:27-92) - Gestión de localStorage y sesiones
  - [contexts/EditModeContext.tsx](contexts/EditModeContext.tsx:86-120) - Lógica de modo edición
  - [contexts/AuthContext.tsx](contexts/AuthContext.tsx) - Autenticación global

- **Backend:**
  - [api-osyris/src/routes/content.routes.js](api-osyris/src/routes/content.routes.js) - Endpoints de edición
  - [api-osyris/src/controllers/content.controller.js](api-osyris/src/controllers/content.controller.js) - Lógica de guardado

- **Servidor:**
  - `/etc/nginx/sites-available/osyris` - Configuración nginx
  - `/home/osyris/Osyris-Web/.env.production` - Variables de entorno

### Comandos Útiles

```bash
# Ver logs en tiempo real
pm2 logs osyris-frontend --lines 50

# Estado de PM2
pm2 status

# Reiniciar servicio
pm2 restart osyris-frontend

# Ver configuración nginx activa
nginx -T | grep server_name

# Verificar certificados SSL
certbot certificates

# Test de redirección
curl -I https://www.gruposcoutosyris.es
```

---

## 🎯 Estimación de Tiempo

| Fase | Tiempo | Criticidad |
|------|--------|------------|
| Fase 0: Diagnóstico | 15 min | Alta |
| Fase 1: Redirección nginx | 30 min | **CRÍTICA** |
| Fase 2: API URLs | 15 min | **CRÍTICA** |
| Fase 3: Testing | 20 min | Alta |
| Fase 4: Seguridad | 15 min | Baja |
| **TOTAL** | **1h 35min** | - |

---

## ✅ Resultado Esperado

Después de implementar este roadmap:

1. ✅ Usuario navega a https://www.gruposcoutosyris.es
2. ✅ Automáticamente redirige a https://gruposcoutosyris.es (301)
3. ✅ Login en /admin guarda sesión en localStorage
4. ✅ Clic en "Editar Contenido Web" abre /?editMode=true
5. ✅ Modo edición se activa automáticamente
6. ✅ Aparece borde rojo y barra de herramientas
7. ✅ Cambios se guardan en http://116.203.98.142:5000/api/content/
8. ✅ Cambios persisten después de recargar
9. ✅ **TODO FUNCIONA CORRECTAMENTE** 🎉

---

## 🔗 Próximos Pasos

Después de completar este roadmap:

1. [ ] Documentar el proceso en el README del proyecto
2. [ ] Actualizar instrucciones de deployment
3. [ ] Crear script de health check para modo edición
4. [ ] Implementar analytics de uso del modo edición
5. [ ] Considerar migrar de localStorage a cookies (largo plazo)

---

**Fecha de creación:** 2025-10-08
**Autor:** Claude Code Assistant
**Estado:** ⏳ Pendiente de implementación
