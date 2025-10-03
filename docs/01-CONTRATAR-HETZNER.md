# 🖥️ Guía Paso a Paso: Contratar Hetzner Cloud

## 💰 Coste: €5.83/mes (~€70/año)

---

## 📋 Antes de Empezar

Necesitarás:
- ✅ Tarjeta de crédito/débito
- ✅ DNI o Pasaporte (verificación de identidad)
- ✅ Email válido
- ✅ 20-30 minutos de tiempo

---

## 🚀 Paso 1: Crear Cuenta en Hetzner

### 1.1 Acceder al Registro

1. Ve a: **https://accounts.hetzner.com/signUp**
2. Verás un formulario de registro

### 1.2 Completar Formulario

Rellena los siguientes campos:

| Campo | Qué Introducir |
|-------|----------------|
| **First Name** | Tu nombre |
| **Last Name** | Tus apellidos |
| **Email Address** | Email del grupo scout (ej: `admin@grupooosyris.es`) |
| **Password** | Contraseña segura (mínimo 10 caracteres) |
| **Confirm Password** | Repetir contraseña |

**Ejemplo:**
```
First Name: Vicente
Last Name: Rivas Monferrer
Email: admin@grupooosyris.es
Password: OsyrisScout2025!SecurePass
```

3. **Marcar checkbox:** "I have read and agree to the Terms and Conditions"
4. Click **"Sign Up"**

### 1.3 Verificar Email

1. Revisa tu bandeja de entrada
2. Busca email de: `noreply@hetzner.com`
3. Asunto: "Please verify your email address"
4. Click en el enlace de verificación
5. Te redirigirá a Hetzner Cloud Console

**⏱️ Tiempo estimado:** 5 minutos

---

## 🔐 Paso 2: Verificación de Identidad

Hetzner requiere verificar tu identidad para prevenir fraude.

### 2.1 Método de Verificación

Cuando intentes crear un proyecto o servidor, te pedirá verificación.

**Opciones disponibles:**
1. **DNI/Pasaporte** (más rápido - recomendado)
2. **Factura de servicios** (luz, agua, teléfono)
3. **Extracto bancario**

### 2.2 Verificación con DNI (Recomendado)

1. Click en **"Verify Account"**
2. Seleccionar: **"ID Document"**
3. **Subir foto del DNI:**
   - Foto frontal clara
   - Todos los datos legibles
   - Formato: JPG, PNG, PDF
   - Tamaño máximo: 5MB

4. **Introducir datos:**
   - Número de documento
   - Fecha de nacimiento
   - País

5. Click **"Submit"**

### 2.3 Esperar Aprobación

- **Tiempo de verificación:** 1-24 horas (usualmente 1-4 horas)
- **Estado:** Verás "Verification Pending" en el dashboard
- **Email:** Te llegará email cuando se apruebe

**💡 Consejo:** Hazlo en horario laboral europeo (9:00-18:00 CET) para verificación más rápida.

**⏱️ Tiempo estimado:** 1-4 horas (espera)

---

## 🎯 Paso 3: Crear Proyecto

Una vez verificada tu cuenta:

### 3.1 Acceder a Cloud Console

1. Ve a: **https://console.hetzner.cloud**
2. Login con tu email y contraseña
3. Verás el dashboard principal

### 3.2 Crear Nuevo Proyecto

1. Click en **"+ New Project"** (esquina superior derecha)
2. **Project Name:** `Osyris Scout` (o el nombre que prefieras)
3. Click **"Add Project"**

**⏱️ Tiempo estimado:** 1 minuto

---

## 🖥️ Paso 4: Crear Servidor (VPS)

### 4.1 Iniciar Creación

1. Estando en el proyecto "Osyris Scout"
2. Click en **"Add Server"**
3. Se abrirá el configurador de servidor

### 4.2 Configurar Servidor

#### 📍 **Paso 4.2.1: Ubicación**

**Seleccionar:** Nuremberg, Germany (NBG1)

**¿Por qué Nuremberg?**
- ✅ Más cercano a España
- ✅ Baja latencia
- ✅ Datacenter moderno
- ✅ Precio igual que otras ubicaciones

**Otras opciones (si prefieres):**
- Helsinki, Finland (HEL1) - Más alejado pero buen datacenter
- Falkenstein, Germany (FSN1) - Alternativa alemana

---

#### 💿 **Paso 4.2.2: Imagen del Sistema**

1. En la sección **"Image"**
2. **Tipo:** Operating System
3. **Sistema:** Ubuntu
4. **Versión:** **24.04 LTS** ⭐ (más reciente y estable)

**NO seleccionar:**
- ❌ Debian (usamos Ubuntu)
- ❌ Versiones antiguas de Ubuntu
- ❌ Docker o aplicaciones preinstaladas

---

#### ⚙️ **Paso 4.2.3: Tipo de Servidor**

**IMPORTANTE:** Seleccionar el tipo correcto.

| Plan | vCPU | RAM | Disco | Precio/mes | Recomendado |
|------|------|-----|-------|------------|-------------|
| CX22 | 2 | 4 GB | 40 GB | €5.83 | ✅ **SÍ** |
| CPX11 | 2 | 2 GB | 40 GB | €4.75 | ⚠️ Poco RAM |
| CX32 | 4 | 8 GB | 80 GB | €11.66 | 💸 Excesivo |

**Seleccionar:** **CX22** (Shared vCPU)

**¿Por qué CX22?**
- ✅ 4GB RAM suficiente para Docker + PostgreSQL + Next.js
- ✅ 2 vCPU adecuado para tráfico medio
- ✅ 40GB disco suficiente
- ✅ Mejor relación calidad-precio

---

#### 🌐 **Paso 4.2.4: Networking**

**Configuración:**
- **IPv4:** ✅ Incluido (no hace falta añadir)
- **IPv6:** ✅ Incluido (opcional, déjalo activo)
- **Private Networks:** ❌ NO añadir
- **Firewalls:** ❌ NO añadir (lo configuraremos por scripts)

---

#### 💾 **Paso 4.2.5: Volúmenes Adicionales**

**NO añadir volúmenes.**

Los 40GB del disco incluido son suficientes para:
- Sistema operativo
- Docker
- Base de datos
- Aplicación
- Backups temporales

---

#### 🔑 **Paso 4.2.6: SSH Key (IMPORTANTE)**

**Este es el paso más importante para la seguridad.**

##### Opción A: Crear SSH Key Nueva (Recomendado)

**En tu máquina local (Linux/Mac/Windows WSL):**

```bash
# Abrir terminal
# Ejecutar:
ssh-keygen -t ed25519 -C "osyris-server-access"

# Te preguntará:
# Enter file in which to save the key:
# Responder: /home/TU_USUARIO/.ssh/osyris_server

# Enter passphrase (empty for no passphrase):
# Responder: [Introduce contraseña segura] (RECOMENDADO)
# Ejemplo: OsyrisSSH2025!Secure

# Confirmar passphrase
```

**Resultado:**
- ✅ Clave privada: `~/.ssh/osyris_server`
- ✅ Clave pública: `~/.ssh/osyris_server.pub`

**Copiar la clave pública:**
```bash
cat ~/.ssh/osyris_server.pub
```

**Saldrá algo como:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBcD5x... osyris-server-access
```

**Copiar TODO el texto** (desde `ssh-ed25519` hasta `osyris-server-access`)

##### Opción B: Usar SSH Key Existente

Si ya tienes una SSH key:
```bash
cat ~/.ssh/id_rsa.pub
# o
cat ~/.ssh/id_ed25519.pub
```

##### Añadir SSH Key a Hetzner

1. En el configurador del servidor, sección **"SSH keys"**
2. Click **"+ Add SSH Key"**
3. **Name:** `osyris-server-key`
4. **Public Key:** Pegar la clave pública copiada anteriormente
5. Click **"Add SSH Key"**
6. **Marcar el checkbox** de la key que acabas de crear

**⚠️ IMPORTANTE:** Guarda la clave privada (`osyris_server`) de forma segura. Sin ella NO podrás acceder al servidor.

---

#### 🔥 **Paso 4.2.7: Firewalls**

**NO seleccionar ningún firewall.**

Lo configuraremos mediante scripts por seguridad.

---

#### 📦 **Paso 4.2.8: Backups**

**NO activar backups de Hetzner** (cuestan extra).

Usaremos nuestro propio sistema de backups automatizado (gratis).

---

#### 📛 **Paso 4.2.9: Nombre del Servidor**

**Name:** `osyris-production`

Este nombre aparecerá en el dashboard y en los comandos.

---

#### 🏷️ **Paso 4.2.10: Labels (Opcional)**

Puedes añadir etiquetas para organizar:

**Ejemplos:**
- `environment: production`
- `project: osyris`
- `managed-by: scouts`

---

### 4.3 Revisar y Crear

#### Resumen de Configuración

Antes de crear, verifica:

```
✅ Location: Nuremberg (NBG1)
✅ Image: Ubuntu 24.04 LTS
✅ Type: CX22 (2 vCPU, 4GB RAM)
✅ SSH Key: osyris-server-key (añadida)
✅ Name: osyris-production
```

#### Coste Mensual

Verás en la parte inferior derecha:

**Precio:** €5.83/mes (~€70/año)

#### Crear Servidor

1. Click en **"Create & Buy now"**
2. **Confirmación de pago:** Si es tu primer servidor, te pedirá método de pago
3. **Añadir tarjeta:** Introduce datos de tu tarjeta
4. Click **"Confirm"**

### 4.4 Servidor Creándose

Verás una pantalla de progreso:

```
Setting up your server...
⏳ Deploying (20-60 seconds)
```

**Espera 1-2 minutos.**

---

## ✅ Paso 5: Obtener Información del Servidor

### 5.1 Servidor Creado

Cuando termine, verás:

```
✅ Running
```

### 5.2 Datos Importantes

En la vista del servidor, anota estos datos:

#### 📍 Dirección IP

**IPv4:** (ejemplo: `95.217.123.45`)

**Copiar esta IP**, la necesitarás para:
- Conectar por SSH
- Configurar DNS
- Scripts de despliegue

#### 🔐 Acceso SSH

**Usuario inicial:** `root`
**SSH Key:** La que creaste anteriormente

### 5.3 Probar Conexión SSH

Desde tu terminal local:

```bash
ssh -i ~/.ssh/osyris_server root@TU_IP_SERVIDOR

# Reemplazar TU_IP_SERVIDOR con la IP real
# Ejemplo:
ssh -i ~/.ssh/osyris_server root@95.217.123.45
```

**Si es la primera vez:**
```
The authenticity of host '95.217.123.45' can't be established.
ED25519 key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)?
```

**Responder:** `yes`

**Si usaste passphrase en la SSH key:**
```
Enter passphrase for key '/home/usuario/.ssh/osyris_server':
```

**Introducir la passphrase** que estableciste.

**Si conecta correctamente:**
```
Welcome to Ubuntu 24.04 LTS
root@osyris-production:~#
```

**🎉 ¡Servidor funcionando!**

---

## 📝 Resumen de Datos a Guardar

Guarda esta información de forma segura (usa un gestor de contraseñas):

```
═══════════════════════════════════════
HETZNER VPS - OSYRIS SCOUT
═══════════════════════════════════════

Email Hetzner: admin@grupooosyris.es
Password Hetzner: [tu contraseña]

Proyecto: Osyris Scout
Servidor: osyris-production

IP Pública: [tu IP]
Usuario root: root
SSH Key: ~/.ssh/osyris_server
SSH Key Passphrase: [tu passphrase]

Ubicación: Nuremberg (NBG1)
Plan: CX22 (2 vCPU, 4GB RAM, 40GB)
Coste: €5.83/mes (~€70/año)

Fecha de creación: [fecha]
═══════════════════════════════════════
```

**💾 Recomendación:** Guarda esto en:
- 1Password
- Bitwarden
- LastPass
- KeePass
- O un archivo encriptado

---

## 🎯 Próximos Pasos

Ahora que tienes el servidor:

1. ✅ **Servidor Hetzner creado**
2. ⏭️ **Siguiente:** Registrar dominio (ver `02-CONTRATAR-DOMINIO.md`)
3. ⏭️ **Después:** Configurar Cloudflare (ver `03-CONFIGURAR-CLOUDFLARE.md`)

---

## 🆘 Troubleshooting

### Problema: No me deja crear servidor (verificación pendiente)

**Solución:** Espera a que se verifique tu cuenta (1-24 horas)

---

### Problema: No puedo conectar por SSH

```bash
# Verificar permisos de la clave
chmod 600 ~/.ssh/osyris_server

# Verificar que estás usando la clave correcta
ssh -i ~/.ssh/osyris_server -v root@TU_IP
```

**Si sale "Permission denied (publickey)":**
- Verifica que añadiste la clave pública correcta en Hetzner
- Verifica que la IP es correcta

---

### Problema: "Too many authentication failures"

```bash
# Especificar solo esta clave
ssh -i ~/.ssh/osyris_server -o IdentitiesOnly=yes root@TU_IP
```

---

### Problema: Tarjeta rechazada

**Causas comunes:**
- Tarjeta no tiene pagos internacionales activados
- Tarjeta prepago no permitida
- Límite de la tarjeta excedido

**Solución:**
- Contacta con tu banco
- Usa otra tarjeta
- Prueba con PayPal (si está disponible)

---

## 📞 Soporte Hetzner

- **Email:** support@hetzner.com
- **Docs:** https://docs.hetzner.com/cloud/
- **Status:** https://status.hetzner.com/
- **Community:** https://community.hetzner.com/

---

## 💡 Consejos Adicionales

### Reducir Costes

Si solo quieres probar:
- Puedes empezar con **CX22** (€5.83/mes)
- Hetzner factura **por horas** (€0.008/hora)
- Puedes **eliminar el servidor** cuando quieras
- Solo pagas por el tiempo que esté activo

### Aumentar Recursos Después

Si necesitas más recursos:
1. Apagar servidor
2. Resize en el dashboard
3. Cambiar a CX32 (4 vCPU, 8GB RAM)
4. Reiniciar servidor

**Sin downtime:**
- No se pierden datos
- IP se mantiene igual
- Solo cambias el plan

---

**⏱️ Tiempo total: 30 minutos + 1-4 horas (verificación)**

---

*Última actualización: 30 Septiembre 2025*