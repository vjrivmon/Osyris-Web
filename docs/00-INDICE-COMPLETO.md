# 📚 Índice Completo: Migración Osyris Scout a Hetzner

## 🎯 Objetivo

Migrar Osyris Scout desde Vercel a infraestructura propia en Hetzner Cloud con:
- Control total del servidor
- Sin límites de colaboradores
- Coste fijo predecible (~€82/año)
- Mejor rendimiento
- Datos en Europa (RGPD compliant)

---

## 💰 Resumen de Costes

| Servicio | Coste Mensual | Coste Anual | Estado |
|----------|---------------|-------------|--------|
| **Hetzner VPS CX22** | €5.83 | ~€70 | 💳 Pago |
| **Dominio .es** | ~€1 | ~€12 | 💳 Pago |
| **Cloudflare** | €0 | €0 | ✅ Gratis |
| **SSL (Let's Encrypt)** | €0 | €0 | ✅ Gratis |
| **TOTAL** | **~€7** | **~€82** | |

**Comparación con Vercel:**
- Vercel Team: $20/mes/usuario = Mínimo $240/año para 2 usuarios
- **Ahorro:** ~$158/año (~€145/año)

---

## 📋 Requisitos Previos

Antes de empezar necesitas:

- [ ] Tarjeta de crédito/débito válida
- [ ] DNI o Pasaporte (verificación Hetzner)
- [ ] Email válido del grupo scout
- [ ] Terminal con SSH (Linux/Mac/Windows WSL)
- [ ] Conocimientos básicos de terminal
- [ ] Backup de datos de Supabase
- [ ] 4-6 horas de tiempo total

---

## 🗺️ Roadmap Completo

### Fase 1: Contratación de Servicios (1-2 horas)
```
┌─────────────────┐
│  Paso 1         │  → Contratar Hetzner VPS (30 min + espera verificación)
│  Paso 2         │  → Registrar Dominio (15 min)
│  Paso 3         │  → Configurar Cloudflare (45 min + espera DNS)
└─────────────────┘
```

### Fase 2: Configuración del Servidor (1-2 horas)
```
┌─────────────────┐
│  Paso 4         │  → Configuración inicial servidor (30 min)
│  Paso 5         │  → Instalar Docker y stack (30 min)
│  Paso 6         │  → Configurar Nginx + SSL (30 min)
└─────────────────┘
```

### Fase 3: Despliegue de Aplicación (1-2 horas)
```
┌─────────────────┐
│  Paso 7         │  → Configurar variables de entorno (15 min)
│  Paso 8         │  → Desplegar con Docker Compose (30 min)
│  Paso 9         │  → Migrar datos desde Supabase (30 min)
│  Paso 10        │  → Verificar funcionamiento (15 min)
└─────────────────┘
```

### Fase 4: Finalización (30 min)
```
┌─────────────────┐
│  Paso 11        │  → Configurar backups automáticos (15 min)
│  Paso 12        │  → Activar proxy de Cloudflare (5 min)
│  Paso 13        │  → Pruebas finales (10 min)
└─────────────────┘
```

---

## 📖 Guías Disponibles

### 🌟 Guías Rápidas

1. **[QUICKSTART.md](../scripts/deployment/QUICKSTART.md)**
   - Resumen en 5 pasos
   - 2-3 horas
   - Para usuarios con experiencia

### 📘 Guías Paso a Paso (Web)

Estas guías te ayudan a contratar los servicios desde la web:

1. **[01-CONTRATAR-HETZNER.md](./01-CONTRATAR-HETZNER.md)** ⭐
   - ✅ Crear cuenta Hetzner
   - ✅ Verificación de identidad
   - ✅ Crear proyecto y servidor VPS
   - ✅ Configurar SSH keys
   - ⏱️ 30 min + espera verificación (1-4 horas)

2. **[02-CONTRATAR-DOMINIO.md](./02-CONTRATAR-DOMINIO.md)** ⭐
   - ✅ Elegir nombre de dominio
   - ✅ Comparativa Namecheap vs DonDominio
   - ✅ Proceso de registro completo
   - ⏱️ 10-15 minutos

3. **[03-CONFIGURAR-CLOUDFLARE.md](./03-CONFIGURAR-CLOUDFLARE.md)** ⭐
   - ✅ Crear cuenta Cloudflare
   - ✅ Añadir dominio
   - ✅ Cambiar nameservers
   - ✅ Configurar DNS
   - ✅ Optimizaciones iniciales
   - ⏱️ 45 min + espera DNS (1-4 horas)

### 🔧 Guías Técnicas (Servidor)

4. **[MIGRATION_TO_HETZNER.md](../MIGRATION_TO_HETZNER.md)**
   - 📖 Guía completa y detallada
   - 11 secciones paso a paso
   - Incluye troubleshooting
   - Para todos los niveles

5. **[PRODUCTION_MAINTENANCE.md](../PRODUCTION_MAINTENANCE.md)**
   - 🛠️ Manual de mantenimiento
   - Comandos esenciales
   - Monitoreo del sistema
   - Troubleshooting avanzado

6. **[Scripts de Deployment](../scripts/deployment/README.md)**
   - 🤖 6 scripts automatizados
   - Configuración servidor
   - Instalación Docker
   - Nginx + SSL
   - Backups automáticos

---

## 🚀 ¿Por Dónde Empezar?

### Opción A: Rápida (Experiencia Previa)

```bash
# 1. Lee el QUICKSTART
cat scripts/deployment/QUICKSTART.md

# 2. Contrata servicios (web)
# - Sigue: 01-CONTRATAR-HETZNER.md
# - Sigue: 02-CONTRATAR-DOMINIO.md
# - Sigue: 03-CONFIGURAR-CLOUDFLARE.md

# 3. Ejecuta scripts en orden
ssh root@TU_IP
bash 01-server-setup.sh
# ... etc
```

### Opción B: Detallada (Primera Vez)

```bash
# 1. Lee la guía completa
cat MIGRATION_TO_HETZNER.md

# 2. Lee las guías web en orden
cat docs/01-CONTRATAR-HETZNER.md
cat docs/02-CONTRATAR-DOMINIO.md
cat docs/03-CONFIGURAR-CLOUDFLARE.md

# 3. Sigue paso a paso cada sección
# 4. Usa scripts cuando corresponda
```

---

## 📂 Estructura de Documentación

```
Osyris-Web/
├── 📖 MIGRATION_TO_HETZNER.md          # Guía técnica completa
├── 📖 PRODUCTION_MAINTENANCE.md        # Manual de mantenimiento
├── 📖 CLAUDE.md                        # Documentación del proyecto
├── 📖 DESIGN_SYSTEM.md                 # Sistema de diseño
│
├── 📁 docs/                            # Guías paso a paso (web)
│   ├── 00-INDICE-COMPLETO.md          # Este archivo
│   ├── 01-CONTRATAR-HETZNER.md        # ⭐ Hetzner VPS
│   ├── 02-CONTRATAR-DOMINIO.md        # ⭐ Dominio
│   └── 03-CONFIGURAR-CLOUDFLARE.md    # ⭐ Cloudflare
│
├── 📁 scripts/deployment/              # Scripts automatizados
│   ├── README.md                      # Documentación scripts
│   ├── QUICKSTART.md                  # ⭐ Guía rápida 5 pasos
│   ├── 01-server-setup.sh             # Configuración servidor
│   ├── 02-install-docker.sh           # Instalación Docker
│   ├── 03-configure-nginx.sh          # Nginx + SSL
│   ├── 04-backup-system.sh            # Sistema backup
│   ├── 05-restore-backup.sh           # Restaurar backup
│   └── 06-setup-cron.sh               # Backups automáticos
│
├── 🐳 docker-compose.prod.yml          # Configuración Docker
├── 🐳 Dockerfile.prod                  # Dockerfile frontend
├── 🐳 api-osyris/Dockerfile.prod       # Dockerfile backend
└── ⚙️ .env.production.example          # Variables de entorno
```

---

## 🎯 Checklist de Progreso

### Fase 1: Servicios Web ✅

- [ ] **Hetzner VPS**
  - [ ] Cuenta creada
  - [ ] Identidad verificada
  - [ ] Servidor CX22 creado
  - [ ] SSH key configurada
  - [ ] IP pública anotada
  - [ ] Conexión SSH probada

- [ ] **Dominio**
  - [ ] Nombre elegido
  - [ ] Dominio registrado
  - [ ] Datos guardados de forma segura
  - [ ] Renovación automática activada

- [ ] **Cloudflare**
  - [ ] Cuenta creada
  - [ ] Dominio añadido
  - [ ] Nameservers cambiados
  - [ ] DNS propagado
  - [ ] Registros A configurados
  - [ ] Optimizaciones básicas configuradas

### Fase 2: Configuración Servidor 🔧

- [ ] **Seguridad Básica**
  - [ ] Usuario no-root creado
  - [ ] SSH asegurado
  - [ ] Firewall UFW configurado
  - [ ] Fail2Ban instalado

- [ ] **Software Base**
  - [ ] Docker instalado
  - [ ] Docker Compose instalado
  - [ ] Nginx instalado
  - [ ] Certbot instalado

### Fase 3: Aplicación 🚀

- [ ] **Nginx + SSL**
  - [ ] Nginx configurado
  - [ ] Certificado SSL obtenido
  - [ ] HTTPS funcionando
  - [ ] Redirecciones configuradas

- [ ] **Despliegue**
  - [ ] Código copiado al servidor
  - [ ] Variables de entorno configuradas
  - [ ] Docker Compose levantado
  - [ ] Servicios funcionando

- [ ] **Migración Datos**
  - [ ] Datos exportados desde Supabase
  - [ ] Base de datos importada
  - [ ] Archivos uploads copiados
  - [ ] Verificación de datos

### Fase 4: Finalización ✨

- [ ] **Backups**
  - [ ] Sistema de backup configurado
  - [ ] Cron configurado
  - [ ] Backup de prueba realizado
  - [ ] Verificación de backups

- [ ] **Cloudflare Final**
  - [ ] Proxy activado (naranja)
  - [ ] SSL/TLS en Full (strict)
  - [ ] Optimizaciones finales

- [ ] **Pruebas**
  - [ ] Login funciona
  - [ ] API funciona
  - [ ] Uploads funcionan
  - [ ] Rendimiento verificado

- [ ] **Documentación**
  - [ ] Credenciales guardadas
  - [ ] Información documentada
  - [ ] Equipo informado

---

## ⏱️ Estimación de Tiempos

| Fase | Tiempo Mínimo | Tiempo Típico | Tiempo Máximo |
|------|---------------|---------------|---------------|
| **Contratación servicios** | 1 hora | 2-4 horas* | 26 horas* |
| **Configuración servidor** | 45 min | 1.5 horas | 3 horas |
| **Despliegue aplicación** | 45 min | 1.5 horas | 3 horas |
| **Migración datos** | 20 min | 45 min | 2 horas |
| **Finalización** | 20 min | 45 min | 1 hora |
| **TOTAL** | **3.5 horas** | **6-8 horas** | **35 horas** |

*Incluye tiempos de espera (verificación Hetzner, propagación DNS)

**Tiempo real de trabajo:** 3-4 horas
**Tiempo con esperas:** 6-8 horas (repartido en 1-2 días)

---

## 🆘 Soporte y Ayuda

### Documentación Interna

1. Busca en `MIGRATION_TO_HETZNER.md` (sección Troubleshooting)
2. Consulta `PRODUCTION_MAINTENANCE.md` (problemas comunes)
3. Revisa logs del servidor

### Proveedores

| Servicio | Soporte | Contacto |
|----------|---------|----------|
| **Hetzner** | Email | support@hetzner.com |
| **Namecheap** | Chat/Email | namecheap.com/support |
| **DonDominio** | Tel/Email/Chat | +34 900 854 000 |
| **Cloudflare** | Docs/Community | community.cloudflare.com |

### Community

- Hetzner Community: https://community.hetzner.com
- Cloudflare Community: https://community.cloudflare.com
- Docker Forums: https://forums.docker.com

---

## 💡 Consejos Generales

### Antes de Empezar

1. **Lee toda la documentación** antes de contratar servicios
2. **Prepara backup completo** de Supabase
3. **Anota todas las credenciales** en un lugar seguro
4. **Planifica un día completo** para la migración
5. **Informa al equipo** de posible downtime

### Durante la Migración

1. **No te saltes pasos** aunque parezcan opcionales
2. **Verifica cada paso** antes de continuar
3. **Guarda logs** de errores que encuentres
4. **Haz capturas de pantalla** de configuraciones importantes
5. **No elimines nada** de Vercel/Supabase hasta verificar

### Después de la Migración

1. **Monitorea logs** durante las primeras 24 horas
2. **Prueba todas las funcionalidades** exhaustivamente
3. **Configura backups automáticos** inmediatamente
4. **Documenta cambios** realizados
5. **Mantén credenciales actualizadas** y seguras

---

## 🎉 ¿Qué Sigue Después?

Una vez completada la migración:

### Inmediato (Primer Día)
- [ ] Verificar que todo funciona correctamente
- [ ] Monitorear logs en busca de errores
- [ ] Realizar backup manual completo
- [ ] Actualizar DNS en otros servicios si aplica

### Primera Semana
- [ ] Monitorear métricas de rendimiento
- [ ] Verificar backups automáticos funcionan
- [ ] Optimizar configuraciones según uso real
- [ ] Documentar cualquier problema encontrado

### Primer Mes
- [ ] Revisar costes reales vs estimados
- [ ] Ajustar recursos si es necesario
- [ ] Configurar monitoreo avanzado (opcional)
- [ ] Evaluar necesidad de escalado

### Mantenimiento Continuo
- [ ] Actualizaciones de seguridad mensuales
- [ ] Verificación de backups mensual
- [ ] Revisión de logs semanal
- [ ] Optimización de base de datos mensual

---

## 📊 Métricas de Éxito

Sabrás que la migración fue exitosa cuando:

- ✅ Todos los servicios responden correctamente
- ✅ Usuarios pueden acceder sin problemas
- ✅ API responde en < 200ms
- ✅ No hay errores en logs
- ✅ Backups automáticos funcionan
- ✅ SSL/TLS configurado correctamente (A+ en SSL Labs)
- ✅ Cloudflare está proxying correctamente
- ✅ Costes mensuales están dentro de €6-8

---

## 🔗 Enlaces Útiles

### Documentación Oficial
- Hetzner Docs: https://docs.hetzner.com
- Docker Docs: https://docs.docker.com
- Nginx Docs: https://nginx.org/en/docs
- Cloudflare Docs: https://developers.cloudflare.com
- Let's Encrypt: https://letsencrypt.org/docs

### Herramientas
- DNS Checker: https://www.whatsmydns.net
- SSL Test: https://www.ssllabs.com/ssltest
- Speed Test: https://www.webpagetest.org
- Uptime Monitor: https://uptimerobot.com (gratis)

---

## 📝 Notas Finales

Esta migración te dará:
- 💰 **Control de costes**: Precio fijo predecible
- 🚀 **Mejor rendimiento**: Servidor dedicado
- 🔧 **Flexibilidad total**: Sin límites de proveedor
- 🔒 **Privacidad**: Datos en Europa
- 📚 **Aprendizaje**: Experiencia DevOps valiosa

**¡Mucho éxito con tu migración!** 🎉

---

*Última actualización: 30 Septiembre 2025*
*Versión: 1.0*