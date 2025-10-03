# ☁️ Guía Paso a Paso: Configurar Cloudflare

## 💰 Coste: GRATIS (para siempre)

---

## 📋 ¿Qué es Cloudflare?

Cloudflare proporciona:
- ✅ **DNS rápido y seguro** (gratis)
- ✅ **CDN global** (mejora velocidad)
- ✅ **Protección DDoS** (seguridad)
- ✅ **SSL/TLS** (HTTPS gratis)
- ✅ **Caché** (reduce carga del servidor)
- ✅ **Analytics** (estadísticas)

**Todo gratis en el plan Free.**

---

## 🎯 Objetivo

Configurar Cloudflare como:
1. **DNS** del dominio
2. **Proxy** entre usuarios y servidor
3. **CDN** para contenido estático
4. **Firewall** básico

---

## 🚀 Paso 1: Crear Cuenta

### 1.1 Registro

1. Ve a: **https://dash.cloudflare.com/sign-up**
2. Rellena formulario:

```
Email Address: admin@grupooosyris.es
Password: [Contraseña segura - diferente a otras]
```

3. Click **"Create Account"**

### 1.2 Verificar Email

1. Revisa tu email
2. Busca email de: `no-reply@notify.cloudflare.com`
3. Asunto: "Verify your email address for Cloudflare"
4. Click en **"Verify email address"**
5. Te redirigirá al dashboard

**⏱️ Tiempo: 2 minutos**

---

## 🌐 Paso 2: Añadir Dominio

### 2.1 Iniciar Configuración

1. En el dashboard de Cloudflare
2. Click en **"Add a Site"** (arriba a la derecha)
3. O en el centro: **"Add a domain"**

### 2.2 Introducir Dominio

**Introduce tu dominio:**
```
grupooosyris.es
```

**⚠️ IMPORTANTE:**
- Sin `www.`
- Sin `https://`
- Solo el dominio: `grupooosyris.es`

Click **"Add site"**

### 2.3 Seleccionar Plan

Verás opciones de planes:

| Plan | Precio | Características |
|------|--------|-----------------|
| **Free** | €0/mes | DNS, SSL, CDN básico |
| **Pro** | €20/mes | Optimizaciones extra |
| **Business** | €180/mes | Para empresas |

**Seleccionar:** **Free** ⭐

Click **"Continue"**

**⏱️ Tiempo: 1 minuto**

---

## 🔍 Paso 3: Escaneo de DNS

Cloudflare escaneará los registros DNS existentes.

### 3.1 Esperar Escaneo

Verás:
```
Querying grupooosyris.es nameservers...
⏳ This may take up to 60 seconds
```

**Espera 30-60 segundos.**

### 3.2 Revisar Registros

Cloudflare mostrará los registros DNS encontrados.

**Probablemente verás:**
- Algunos registros genéricos del registrador
- Registros que puedes eliminar

**NO te preocupes**, los configuraremos correctamente después.

Click **"Continue"**

**⏱️ Tiempo: 2 minutos**

---

## 🔧 Paso 4: Configurar Nameservers

Este es el paso más importante.

### 4.1 Obtener Nameservers de Cloudflare

Cloudflare te mostrará:

```
Change your nameservers

Replace your nameservers with these:

1. bob.ns.cloudflare.com
2. kate.ns.cloudflare.com

These nameservers are unique to your account.
```

**⚠️ IMPORTANTE:** Los nameservers serán diferentes para tu cuenta. Anota los tuyos.

**Copia estos nameservers**, los necesitarás en el siguiente paso.

**NO hagas click en "Done, check nameservers" todavía.**

### 4.2 Cambiar Nameservers en tu Registrador

Ahora cambiaremos los nameservers en Namecheap o DonDominio.

---

#### 📌 OPCIÓN A: Namecheap

##### Paso 4.2.1: Acceder al Panel

1. Ve a: **https://ap.www.namecheap.com**
2. Login con tus credenciales
3. Click en **"Domain List"** (menú izquierdo)
4. Verás tu dominio listado: `grupooosyris.es`

##### Paso 4.2.2: Gestionar Dominio

1. Click en **"Manage"** (botón a la derecha del dominio)
2. Verás la página de configuración del dominio

##### Paso 4.2.3: Cambiar Nameservers

1. Busca la sección **"Nameservers"**
2. Por defecto estará en: `Namecheap BasicDNS`
3. Click en el dropdown
4. Seleccionar: **"Custom DNS"**

##### Paso 4.2.4: Introducir Nameservers de Cloudflare

Verás dos campos:
```
Nameserver 1: [campo vacío]
Nameserver 2: [campo vacío]
```

**Introduce los nameservers de Cloudflare:**
```
Nameserver 1: bob.ns.cloudflare.com
Nameserver 2: kate.ns.cloudflare.com
```

**(Reemplaza con los tuyos de Cloudflare)**

##### Paso 4.2.5: Guardar

1. Click en el **✓ (check)** verde
2. Verás mensaje: "Nameservers updated successfully"

**⏱️ Tiempo: 5 minutos**

---

#### 📌 OPCIÓN B: DonDominio

##### Paso 4.2.1: Acceder al Panel

1. Ve a: **https://www.dondominio.com/panel**
2. Login con tus credenciales
3. En el menú, click **"Dominios"**
4. Verás tu dominio: `grupooosyris.es`

##### Paso 4.2.2: Gestionar Dominio

1. Click en el dominio `grupooosyris.es`
2. O click en **"Gestionar"** / icono de configuración

##### Paso 4.2.3: Cambiar DNS

1. Busca la sección **"Servidores DNS"** o **"Nameservers"**
2. Click en **"Modificar"** o **"Editar"**

##### Paso 4.2.4: Introducir Nameservers

Verás campos:
```
DNS 1: [actual]
DNS 2: [actual]
```

**Cambiar a los de Cloudflare:**
```
DNS 1: bob.ns.cloudflare.com
DNS 2: kate.ns.cloudflare.com
```

**(Reemplaza con los tuyos de Cloudflare)**

##### Paso 4.2.5: Guardar

1. Click en **"Guardar"** o **"Actualizar"**
2. Confirmar cambios
3. Verás mensaje de confirmación

**⏱️ Tiempo: 5 minutos**

---

### 4.3 Volver a Cloudflare

1. Vuelve a la pestaña de Cloudflare
2. Click en **"Done, check nameservers"**

Verás:
```
Checking nameservers...
⏳ This can take up to 24 hours
```

### 4.4 Esperar Propagación

**Tiempo de propagación DNS:**
- **Mínimo:** 5-15 minutos
- **Típico:** 1-4 horas
- **Máximo:** 24-48 horas

**No cierres la pestaña**, pero puedes seguir con otros pasos.

**⏱️ Tiempo de espera: 15 minutos - 4 horas**

---

## ✅ Paso 5: Verificar Propagación

### 5.1 Verificar en Terminal

```bash
# Verificar nameservers
dig grupooosyris.es NS +short

# Debería mostrar:
# bob.ns.cloudflare.com
# kate.ns.cloudflare.com
```

### 5.2 Verificar en Web

1. Ve a: **https://www.whatsmydns.net**
2. Introduce: `grupooosyris.es`
3. Tipo: `NS`
4. Click **"Search"**

**Verás propagación global:**
- ✅ Verde: Propagado
- ⏳ Amarillo: En progreso
- ❌ Rojo: No propagado

**Espera hasta que la mayoría estén en verde.**

### 5.3 Confirmación en Cloudflare

Cuando se complete, recibirás email:
```
Asunto: Cloudflare is now protecting grupooosyris.es

Your site is now active on a Cloudflare Free plan.
```

**En el dashboard verás:**
```
✅ Status: Active
```

**⏱️ Tiempo: Variable (15 min - 4 horas)**

---

## 🌐 Paso 6: Configurar Registros DNS

Una vez activo en Cloudflare, configuraremos los registros DNS.

### 6.1 Acceder a DNS

1. En Cloudflare Dashboard
2. Seleccionar dominio: `grupooosyris.es`
3. Click en **"DNS"** (menú lateral izquierdo)
4. Tab **"Records"**

### 6.2 Eliminar Registros Existentes (Opcional)

Si hay registros que no necesitas, elimínalos:
- Click en los tres puntos `⋮`
- Click **"Delete"**

**Conserva solo si sabes qué hacen.**

### 6.3 Añadir Registro A para Raíz

**Este es el registro principal para tu dominio.**

Click **"Add record"**

**Configuración:**
```
Type: A
Name: @
IPv4 address: [TU_IP_HETZNER]
Proxy status: 🔴 DNS only (gris/desactivado)
TTL: Auto
```

**Ejemplo:**
```
Type: A
Name: @
IPv4 address: 95.217.123.45
Proxy status: 🔴 DNS only
TTL: Auto
```

**⚠️ IMPORTANTE:**
- **Proxy status: DNS only (gris)** - Temporalmente para obtener SSL
- Lo cambiaremos a "Proxied" después

Click **"Save"**

### 6.4 Añadir Registro A para WWW

Para que `www.grupooosyris.es` también funcione.

Click **"Add record"**

**Configuración:**
```
Type: A
Name: www
IPv4 address: [TU_IP_HETZNER]
Proxy status: 🔴 DNS only (gris/desactivado)
TTL: Auto
```

Click **"Save"**

### 6.5 Verificar Registros

Deberías tener:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | 95.217.123.45 | 🔴 DNS only |
| A | www | 95.217.123.45 | 🔴 DNS only |

**⏱️ Tiempo: 5 minutos**

---

## 🔍 Paso 7: Verificar DNS

### 7.1 Esperar Propagación (5-10 minutos)

```bash
# Verificar dominio raíz
dig grupooosyris.es +short
# Debe mostrar: 95.217.123.45 (tu IP)

# Verificar www
dig www.grupooosyris.es +short
# Debe mostrar: 95.217.123.45 (tu IP)
```

### 7.2 Probar en Navegador

**NO funcionará todavía** (porque el servidor no está configurado), pero puedes probar:

```bash
curl -I http://grupooosyris.es
```

**Es normal que de error** por ahora. Solo verificamos que DNS resuelve.

**⏱️ Tiempo: 10 minutos**

---

## ⚙️ Paso 8: Configuraciones Iniciales de Cloudflare

Mientras esperamos, configuremos algunas opciones.

### 8.1 SSL/TLS (IMPORTANTE)

1. Click en **"SSL/TLS"** (menú lateral)
2. En **Overview**:
   - **Encryption mode:** Seleccionar **"Full (strict)"**
   - **⚠️ Cambiar DESPUÉS de obtener certificado SSL en el servidor**
   - **Por ahora:** Dejar en **"Flexible"** o **"Full"**

### 8.2 Speed → Optimization

1. Click en **"Speed"** (menú lateral)
2. Tab **"Optimization"**

**Configuraciones recomendadas:**

| Opción | Estado | Descripción |
|--------|--------|-------------|
| **Auto Minify** | ✅ Activar HTML, CSS, JS | Reduce tamaño archivos |
| **Brotli** | ✅ Activar | Compresión avanzada |
| **Early Hints** | ✅ Activar | Mejora velocidad carga |
| **Rocket Loader** | ❌ Desactivar | Puede causar problemas con Next.js |

### 8.3 Caching → Configuration

1. Click en **"Caching"** (menú lateral)
2. Tab **"Configuration"**

**Configuraciones recomendadas:**

| Opción | Valor | Descripción |
|--------|-------|-------------|
| **Caching Level** | Standard | Caché básico |
| **Browser Cache TTL** | 4 hours | Tiempo de caché en navegador |

### 8.4 Security → Settings

1. Click en **"Security"** (menú lateral)
2. Tab **"Settings"**

**Configuraciones recomendadas:**

| Opción | Estado | Descripción |
|--------|--------|-------------|
| **Security Level** | Medium | Balance seguridad/usabilidad |
| **Challenge Passage** | 30 minutes | Tiempo de validación |
| **Bot Fight Mode** | ✅ Activar | Protección bots básica |

**⏱️ Tiempo: 10 minutos**

---

## 📝 Resumen de Configuración

Guarda esta información:

```
═══════════════════════════════════════
CLOUDFLARE - OSYRIS SCOUT
═══════════════════════════════════════

Email: admin@grupooosyris.es
Password: [tu contraseña]

Dashboard: https://dash.cloudflare.com

Dominio: grupooosyris.es
Status: ✅ Active

Nameservers:
- bob.ns.cloudflare.com
- kate.ns.cloudflare.com

Plan: Free (€0/mes)

DNS Records:
- A @ → 95.217.123.45 (DNS only)
- A www → 95.217.123.45 (DNS only)

Fecha activación: [fecha]
═══════════════════════════════════════

IMPORTANTE:
- Proxy status: DNS only (gris) ← TEMPORAL
- Cambiar a Proxied (naranja) DESPUÉS de obtener SSL
- SSL/TLS: Full (strict) ← Configurar DESPUÉS de SSL
═══════════════════════════════════════
```

---

## ⚠️ Recordatorios Importantes

### 🔴 Proxy Status: DNS Only (Temporal)

**Estado actual:** 🔴 DNS only (gris)

**¿Por qué?**
- Para obtener certificado SSL de Let's Encrypt
- Let's Encrypt necesita verificar el dominio directamente

**¿Cuándo cambiar?**
- DESPUÉS de ejecutar `certbot` en el servidor
- Una vez tengas el certificado SSL instalado

**Cómo cambiar:**
1. Cloudflare Dashboard → DNS → Records
2. Click en el icono de nube gris
3. Se pondrá naranja 🟠 (Proxied)

### 🔒 SSL/TLS Mode

**Estado actual:** Flexible o Full

**Cambiar a:** Full (strict)

**¿Cuándo?**
- DESPUÉS de tener SSL en el servidor
- Verifica que HTTPS funciona en el servidor

**Cómo cambiar:**
1. Cloudflare Dashboard → SSL/TLS
2. Encryption mode: **Full (strict)**

---

## 🎯 Próximos Pasos

Ahora que tienes todo configurado:

1. ✅ **Servidor Hetzner creado**
2. ✅ **Dominio registrado**
3. ✅ **Cloudflare configurado**
4. ✅ **DNS propagado**
5. ⏭️ **Siguiente:** Desplegar aplicación en el servidor

---

## 🆘 Troubleshooting

### Problema: DNS no propaga después de 24 horas

**Verificar:**
```bash
dig grupooosyris.es NS +short
```

**Si no muestra nameservers de Cloudflare:**
- Verificar que cambiaste correctamente en el registrador
- Verificar que el dominio no está bloqueado
- Contactar soporte del registrador

---

### Problema: Nameservers no se pueden cambiar

**Causas:**
- Dominio recién registrado (espera 60 min)
- Dominio en periodo de transferencia
- Dominio bloqueado

**Solución:**
- Espera 1 hora después del registro
- Contacta soporte del registrador

---

### Problema: "Too many redirects" al acceder

**Causa:** SSL/TLS configurado incorrectamente

**Solución:**
1. Cloudflare → SSL/TLS
2. Cambiar a "Flexible" temporalmente
3. Una vez funcionando, cambiar a "Full (strict)"

---

## 📞 Soporte Cloudflare

- **Docs:** https://developers.cloudflare.com/
- **Community:** https://community.cloudflare.com/
- **Status:** https://www.cloudflarestatus.com/
- **Email:** Solo en planes de pago

**Plan Free:** Solo documentación y community

---

## 💡 Consejos Adicionales

### Analytics

Cloudflare proporciona analytics gratis:
1. Dashboard → Analytics
2. Verás: Tráfico, requests, ancho de banda, threats bloqueados

### Page Rules (Avanzado)

En el futuro puedes configurar reglas:
- Cache personalizado
- Redirecciones
- Bypass para ciertas URLs

**Plan Free:** 3 page rules gratis

### Firewall Rules

En Security → WAF puedes añadir reglas personalizadas.

**Plan Free:** 5 reglas gratis

---

## ✅ Checklist Final

Antes de continuar, verifica:

- [ ] Cuenta Cloudflare creada
- [ ] Dominio añadido a Cloudflare
- [ ] Nameservers cambiados en registrador
- [ ] DNS propagado (dig muestra IP correcta)
- [ ] Registros A configurados (@ y www)
- [ ] Proxy status en "DNS only" (gris)
- [ ] SSL/TLS en "Flexible" o "Full" (no strict todavía)
- [ ] Información guardada de forma segura

---

**⏱️ Tiempo total: 30-45 minutos + espera propagación DNS (1-4 horas)**

---

*Última actualización: 30 Septiembre 2025*