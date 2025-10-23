# 📧 Configuración Persistente de Gmail para Envío de Emails

## 🎯 Problema Identificado

El sistema de envío de correos mediante Gmail dejaba de funcionar después de cada deploy debido a varios problemas:

### **Causas Raíz Identificadas**

1. **Variables de entorno NO persistentes en deploys**
   - El script `deploy-to-production-from-staging.sh` generaba un `.env` SIN incluir las credenciales de Gmail
   - Cada deploy sobrescribía el `.env` eliminando EMAIL_USER y EMAIL_APP_PASSWORD

2. **Orden incorrecto de carga de dotenv**
   - `dotenv.config()` se ejecutaba DESPUÉS de importar módulos
   - Los controladores se importaban antes de cargar las variables de entorno
   - Resultado: `process.env.EMAIL_USER` y `process.env.EMAIL_APP_PASSWORD` eran `undefined`

3. **PM2 cachea variables de entorno**
   - `pm2 restart` NO recarga las variables de entorno
   - Se requiere `pm2 delete` + `pm2 start` para forzar recarga

4. **Contraseña de aplicación con espacios**
   - La contraseña original `ukxq ohpt bomn bavm` causaba problemas
   - Se eliminaron los espacios: `ukxqohptbomnbavm`

---

## ✅ Solución Implementada

### **1. Actualización de `api-osyris/src/index.js`**

**Cambio crítico:** Cargar `dotenv.config()` ANTES de cualquier import de módulos.

```javascript
// 🚀 CONFIGURACIÓN DE VARIABLES DE ENTORNO (ABSOLUTAMENTE PRIMERO)
// IMPORTANTE: Esto DEBE estar antes de cualquier otro require()
const path = require('path');
const dotenv = require('dotenv');

// Cargar .env desde el directorio raíz del backend
const envPath = path.resolve(__dirname, '..', '.env');
console.log('📁 Cargando variables de entorno desde:', envPath);
dotenv.config({ path: envPath });
console.log('✅ Variables de entorno cargadas');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Configurado' : 'NO configurado');
console.log('📧 EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Configurado' : 'NO configurado');

// Ahora sí, importar el resto de módulos
const express = require('express');
const cors = require('cors');
// ...resto de imports
```

**Por qué funciona:**
- Al cargar `dotenv` PRIMERO, las variables están disponibles antes de que cualquier módulo las necesite
- `path.resolve(__dirname, '..', '.env')` asegura la ruta correcta independientemente del directorio de ejecución
- Los logs de debug permiten verificar que las credenciales se cargaron correctamente

---

### **2. Archivos `.env` y `.env.example`**

#### **`api-osyris/.env.example`**
Plantilla documentada con todas las variables necesarias:

```env
# ========================================
# 📧 CONFIGURACIÓN DE EMAIL (Gmail)
# ========================================
# Para obtener una contraseña de aplicación de Gmail:
# 1. Ve a https://myaccount.google.com/security
# 2. Activa la verificación en 2 pasos
# 3. Ve a "Contraseñas de aplicaciones"
# 4. Genera una nueva para "Correo" y "Otro dispositivo"
# 5. Usa esa contraseña aquí (sin espacios)

EMAIL_USER=tu-email@gmail.com
EMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion
```

#### **`api-osyris/.env`** (local y producción)
```env
EMAIL_USER=vicenterivasmonferrer12@gmail.com
EMAIL_APP_PASSWORD=ukxqohptbomnbavm
```

---

### **3. Actualización de Scripts de Deploy**

#### **`scripts/deploy-to-production-from-staging.sh`**

**Antes (INCORRECTO):**
```bash
cat > "$PROD_PATH/api-osyris/.env" << PRODENV
NODE_ENV=production
PORT=5000
# ❌ NO incluía EMAIL_USER ni EMAIL_APP_PASSWORD
PRODENV
```

**Después (CORRECTO):**
```bash
cat > "$PROD_PATH/api-osyris/.env" << PRODENV
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=osyris_user
DB_PASSWORD=OsyrisDB2024!Secure
DB_NAME=osyris_db
JWT_SECRET=osyrisScoutGroup2024SecretKey!Production
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://gruposcoutosyris.es
ALLOWED_ORIGINS=https://gruposcoutosyris.es,https://www.gruposcoutosyris.es,http://116.203.98.142
STAGING_MODE=false
# Gmail Configuration
EMAIL_USER=vicenterivasmonferrer12@gmail.com
EMAIL_APP_PASSWORD=ukxqohptbomnbavm
PRODENV
```

---

### **4. Script de Configuración Automática**

#### **`scripts/set-gmail-credentials-production.sh`**

Script especializado para configurar/actualizar credenciales de Gmail en producción:

```bash
#!/bin/bash
# Configura credenciales de Gmail automáticamente
# Uso: ./scripts/set-gmail-credentials-production.sh

# Credenciales hardcoded para persistencia
EMAIL_USER="vicenterivasmonferrer12@gmail.com"
EMAIL_APP_PASSWORD="ukxqohptbomnbavm"

# 1. Crear backup del .env actual
# 2. Añadir/actualizar variables EMAIL_USER y EMAIL_APP_PASSWORD
# 3. Reiniciar backend con pm2 delete + pm2 start (forzar recarga)
# 4. Verificar que se aplicaron correctamente
```

**Características:**
- ✅ Backup automático del `.env` antes de modificarlo
- ✅ Actualiza variables existentes o las crea si no existen
- ✅ Reinicia PM2 correctamente (delete + start para forzar recarga de env)
- ✅ Verificación de que las variables se configuraron correctamente

---

### **5. Script de Deploy Completo**

#### **`scripts/deploy-production-complete.sh`**

Script wrapper que automatiza el proceso completo:

```bash
#!/bin/bash
# Deploy COMPLETO: Código + Configuración de Gmail
# Uso: ./scripts/deploy-production-complete.sh

# PASO 1: Deploy de código (deploy-to-production-from-staging.sh)
# PASO 2: Configurar credenciales de Gmail (set-gmail-credentials-production.sh)
# RESULTADO: Sistema completamente operativo con emails funcionando
```

**Ventaja:** Un solo comando para deploy completo garantizando que las credenciales siempre estén configuradas.

---

## 🔧 Comandos de Uso

### **Desarrollo Local**

1. **Configurar `.env` localmente:**
   ```bash
   cd api-osyris
   cp .env.example .env
   # Editar .env con tus credenciales de Gmail
   ```

2. **Iniciar desarrollo:**
   ```bash
   npm run dev
   ```

### **Producción**

#### **Opción 1: Deploy Completo Automatizado (RECOMENDADO)**
```bash
./scripts/deploy-production-complete.sh
```

Este comando:
1. Despliega el código a producción
2. Configura automáticamente las credenciales de Gmail
3. Reinicia los servicios correctamente
4. Verifica que todo funcione

#### **Opción 2: Solo Configurar Credenciales de Gmail**
Si ya hiciste deploy pero necesitas configurar/actualizar credenciales:

```bash
./scripts/set-gmail-credentials-production.sh
```

#### **Opción 3: Configuración Interactiva Manual**
Para configurar credenciales diferentes de las hardcoded:

```bash
ssh root@116.203.98.142
cd /var/www/osyris/current
./scripts/configure-gmail-production.sh
# El script pedirá email y contraseña interactivamente
```

---

## 🧪 Verificación de Funcionamiento

### **1. Verificar que las credenciales están configuradas**
```bash
ssh root@116.203.98.142 'grep EMAIL_ /var/www/osyris/current/api-osyris/.env'
```

**Salida esperada:**
```
EMAIL_USER=vicenterivasmonferrer12@gmail.com
EMAIL_APP_PASSWORD=ukxqohptbomnbavm
```

### **2. Verificar logs del backend**
```bash
ssh root@116.203.98.142 'pm2 logs osyris-backend --lines 50 | grep -E "EMAIL_|Variables de entorno"'
```

**Salida esperada:**
```
📁 Cargando variables de entorno desde: /var/www/osyris/current/api-osyris/.env
✅ Variables de entorno cargadas
📧 EMAIL_USER: Configurado
📧 EMAIL_APP_PASSWORD: Configurado
```

### **3. Probar envío de email real**
```bash
ssh root@116.203.98.142
cd /var/www/osyris/current/api-osyris
node -e "const dotenv = require('dotenv'); dotenv.config(); const { sendWelcomeEmail } = require('./src/utils/email'); sendWelcomeEmail('tu-email@gmail.com', 'Test').then(() => console.log('✅ Email enviado')).catch(e => console.error('❌ Error:', e));"
```

### **4. Verificar desde la aplicación web**
1. Accede a: https://gruposcoutosyris.es/dashboard/kraal
2. Haz clic en "Invitar Usuario"
3. Rellena el formulario y envía
4. Verifica que el email llegue correctamente

---

## 🔍 Troubleshooting

### **Problema: Sigue diciendo "Credenciales de email no configuradas"**

**Diagnóstico:**
```bash
ssh root@116.203.98.142
cd /var/www/osyris/current/api-osyris

# Verificar que el archivo .env existe y tiene las credenciales
cat .env | grep EMAIL_

# Verificar que Node.js puede cargar el .env
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER);"
```

**Solución:**
1. Ejecutar `./scripts/set-gmail-credentials-production.sh`
2. Si persiste, revisar que el código de `api-osyris/src/index.js` tiene `dotenv.config()` ANTES de todos los imports

---

### **Problema: PM2 no recarga las variables de entorno**

**Diagnóstico:**
```bash
ssh root@116.203.98.142 'pm2 show osyris-backend | grep -E "env|cwd"'
```

**Solución:**
```bash
ssh root@116.203.98.142
cd /var/www/osyris/current/api-osyris
pm2 delete osyris-backend
pm2 start src/index.js --name osyris-backend
pm2 save
```

**Importante:** `pm2 restart` NO recarga variables de entorno. Debes hacer `pm2 delete` + `pm2 start`.

---

### **Problema: Error "Invalid login credentials"**

**Diagnóstico:**
- Contraseña incorrecta o ha expirado
- Contraseña tiene espacios (debe ser sin espacios)

**Solución:**
1. Verificar la contraseña en Gmail:
   - Ve a https://myaccount.google.com/apppasswords
   - Genera una nueva contraseña de aplicación
   - Copia sin espacios: `ukxqohptbomnbavm` (no `ukxq ohpt bomn bavm`)

2. Actualizar en producción:
   ```bash
   ssh root@116.203.98.142
   nano /var/www/osyris/current/api-osyris/.env
   # Editar EMAIL_APP_PASSWORD
   cd /var/www/osyris/current/api-osyris
   pm2 delete osyris-backend
   pm2 start src/index.js --name osyris-backend
   pm2 save
   ```

---

### **Problema: Base de datos se resetea después de deploy**

**Diagnóstico:**
```bash
# Verificar si hay scripts de seed ejecutándose
grep -r "seed\|init.*db" scripts/
grep -r "DROP TABLE\|TRUNCATE" api-osyris/src/
```

**Hallazgo:** NO hay procesos automáticos que reseteen la BD. El problema era SOLO con las credenciales de Gmail.

**Verificación:**
- El archivo `api-osyris/src/db/init.js` SOLO se ejecuta si se llama directamente (no durante imports)
- Los scripts de deploy NO ejecutan comandos de seed o reset de BD
- La base de datos PostgreSQL es persistente y NO se modifica en deploys

---

## 📚 Documentación Relacionada

- **Configuración de Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Documentación nodemailer:** https://nodemailer.com/about/
- **PM2 Environment Variables:** https://pm2.keymetrics.io/docs/usage/environment/
- **dotenv Documentation:** https://github.com/motdotla/dotenv

---

## ✅ Checklist de Configuración

### **Primera Vez (Setup Inicial)**
- [ ] Crear contraseña de aplicación de Gmail
- [ ] Configurar `api-osyris/.env` localmente
- [ ] Probar envío de emails en local
- [ ] Ejecutar `./scripts/set-gmail-credentials-production.sh` en producción
- [ ] Verificar logs en producción
- [ ] Probar envío de email real desde la app

### **Cada Deploy**
- [ ] Ejecutar `./scripts/deploy-production-complete.sh` (recomendado)
- O, si usas otro método:
  - [ ] Hacer deploy de código
  - [ ] Ejecutar `./scripts/set-gmail-credentials-production.sh`
- [ ] Verificar que el backend inició correctamente (`pm2 status`)
- [ ] Verificar logs (`pm2 logs osyris-backend --lines 30`)
- [ ] Probar funcionalidad de emails desde la app

---

## 🎓 Lecciones Aprendidas

1. **Variables de entorno deben cargarse ANTES de imports**
   - dotenv.config() DEBE ser lo primero que se ejecute
   - Ningún módulo debe importarse antes de cargar variables

2. **PM2 cachea variables de entorno**
   - `pm2 restart` NO recarga el `.env`
   - Se requiere `pm2 delete` + `pm2 start` para recarga completa

3. **Los scripts de deploy deben ser idempotentes**
   - Incluir TODAS las variables necesarias en el `.env` generado
   - No asumir que variables previas persistirán

4. **Contraseñas de aplicación de Gmail no deben tener espacios**
   - Copiar sin espacios: `ukxqohptbomnbavm`
   - Los espacios son solo visuales en la interfaz de Google

5. **Logging es crítico para debugging**
   - Logs de "Variables cargadas" ayudan a verificar el proceso
   - PM2 logs permiten diagnóstico remoto efectivo

---

## 🔐 Seguridad

### **Consideraciones de Seguridad**

1. **El archivo `.env` está en `.gitignore`**
   - ✅ NO se sube al repositorio
   - ✅ Las credenciales NO están en el código

2. **Los scripts de deploy tienen credenciales hardcoded**
   - ⚠️ Solo el usuario con acceso al servidor puede ejecutarlos
   - ⚠️ Considera usar variables de entorno de CI/CD para mayor seguridad

3. **Alternativa más segura (opcional):**
   ```bash
   # En lugar de hardcodear en scripts, usar variables de entorno
   export OSYRIS_EMAIL_USER="vicenterivasmonferrer12@gmail.com"
   export OSYRIS_EMAIL_PASSWORD="ukxqohptbomnbavm"
   ./scripts/deploy-production-complete.sh
   ```

---

## 📝 Conclusión

**Problema Resuelto:**
✅ Las credenciales de Gmail ahora persisten después de cada deploy
✅ El sistema de envío de emails funciona correctamente
✅ Los scripts están automatizados y son idempotentes
✅ El código está optimizado con carga temprana de variables de entorno

**Estado Actual:**
- **Local:** ✅ Funcionando
- **Producción:** ✅ Funcionando
- **Scripts automatizados:** ✅ Implementados y probados

**Próximos Pasos (Opcional):**
- [ ] Implementar rotación automática de contraseñas de aplicación
- [ ] Configurar alertas si el envío de emails falla
- [ ] Añadir rate limiting para envío de emails
- [ ] Implementar cola de emails con reintentos automáticos

---

**Documento creado:** 2025-10-23
**Última actualización:** 2025-10-23
**Autor:** Vicente Rivas Monferrer
**Estado:** ✅ Completado y Verificado

