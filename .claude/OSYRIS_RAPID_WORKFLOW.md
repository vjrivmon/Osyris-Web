# 🏕️ Osyris Rapid Development Workflow

## Sistema Completo de Desarrollo → Producción Automatizado

Este sistema te permite trabajar en local con PostgreSQL (idéntico a producción) y deployar automáticamente a Hetzner con un solo comando.

---

## 🚀 Quick Start (3 pasos)

### 1️⃣ Desarrollo Local
```bash
/dev-local
```
✅ PostgreSQL Docker (puerto 5432)
✅ Backend corriendo (puerto 5000)
✅ Frontend corriendo (puerto 3000)
✅ Navegador abierto automáticamente

### 2️⃣ Verificar Sistema
```bash
/check-health
```
✅ Todos los servicios funcionando
✅ Base de datos conectada
✅ API respondiendo
✅ Frontend cargando

### 3️⃣ Deploy a Producción
```bash
/safe-deploy
```
✅ Tests automáticos
✅ Build verificado
✅ Commit conventional
✅ Push a GitHub
✅ Deploy automático a Hetzner
✅ Verificación post-deploy

---

## 📋 Comandos Disponibles

### `/dev-local`
**Inicia entorno de desarrollo completo**

- Levanta PostgreSQL en Docker
- Configura base de datos con tablas iniciales
- Inicia backend (Express.js)
- Inicia frontend (Next.js)
- Abre navegador en http://localhost:3000

**Uso**: Cuando empiezas a trabajar cada día

---

### `/check-health`
**Verifica estado completo del sistema**

- ✅ Docker corriendo
- ✅ PostgreSQL activo y con datos
- ✅ Backend respondiendo (puerto 5000)
- ✅ Frontend funcionando (puerto 3000)
- ✅ API endpoints accesibles

**Uso**: Antes de hacer cambios o después de problemas

---

### `/safe-deploy`
**Deploy completo a producción con CI/CD**

1. Verifica salud del sistema local
2. Ejecuta tests automáticamente
3. Build del frontend
4. Analiza cambios y sugiere commit type
5. Crea commit con conventional commits
6. Push a GitHub
7. **GitHub Actions se activa automáticamente**:
   - Tests en CI
   - Build en CI
   - Deploy a Hetzner vía SSH
   - Restart servicios con PM2
   - Health checks post-deploy
8. Verifica que producción responde

**Uso**: Cuando quieres subir tus cambios a producción

---

## 🔄 Workflow Diario

```
┌─────────────────────────────────────────────────┐
│  1. INICIO DEL DÍA                              │
│  /dev-local                                     │
│  → PostgreSQL Docker + Backend + Frontend       │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  2. DESARROLLO                                  │
│  - Editar código                                │
│  - Ver cambios en http://localhost:3000         │
│  - Hot reload automático                        │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  3. VERIFICACIÓN                                │
│  /check-health                                  │
│  → Confirma que todo funciona                   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  4. DEPLOY PRODUCCIÓN                           │
│  /safe-deploy                                   │
│  → Tests → Build → Commit → Push → CI/CD        │
│  → Deploy automático a Hetzner                  │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  5. VERIFICAR EN PRODUCCIÓN                     │
│  https://grupooosyris.es                        │
│  → Ver cambios live                             │
└─────────────────────────────────────────────────┘
```

---

## 🐳 PostgreSQL Local (idéntico a producción)

### Conexión Local
```bash
Host: localhost
Port: 5432
User: osyris_user
Password: osyris_pass_2024
Database: osyris_db
```

### Acceso directo
```bash
docker exec -it osyris-postgres psql -U osyris_user -d osyris_db
```

### Tablas Iniciales
- `usuarios` - Usuarios del sistema
- `secciones` - Secciones scout (Castores, Lobatos, etc.)
- `actividades` - Eventos y actividades
- `documentos` - Archivos y circulares

---

## 🎯 Agentes Especializados

### `osyris-local-dev`
**Uso**: Problemas con desarrollo local o PostgreSQL

Invoca con:
```
"Usa el agente osyris-local-dev para resolver esto"
```

Resuelve:
- ❌ PostgreSQL no conecta
- ❌ Puertos ocupados
- ❌ Base de datos vacía
- ❌ Variables de entorno faltantes

---

### `osyris-deploy-agent`
**Uso**: Deployments y CI/CD

Invoca con:
```
"Usa el agente osyris-deploy-agent para deployar"
```

Gestiona:
- ✅ Deploy a Hetzner
- ✅ GitHub Actions pipeline
- ✅ Verificación post-deploy
- ✅ Rollback si falla

---

## 🔒 Seguridad y Hooks

### Git Push Bloqueado
```bash
git push  # ❌ Bloqueado
```
**Usar**: `/safe-deploy` en su lugar

### Conventional Commits
Formato automático:
```
feat(frontend): add login page
fix(backend): resolve auth bug
docs: update README
chore(deps): update packages
```

### Hooks Activos
- ✅ Pre-commit: Verifica formato
- ✅ Pre-push: Bloqueado (usar /safe-deploy)
- ✅ Post-edit: Muestra archivos modificados
- ✅ On-stop: Resumen de sesión

---

## 🚀 GitHub Actions Pipeline

### Triggers
- Push to `main` → Deploy a producción
- Push to `develop` → Deploy a staging
- Push to `feature/*` → Solo tests

### Workflow
```yaml
1. Test Job (~2 min):
   ✅ Install dependencies
   ✅ Run tests
   ✅ Build frontend

2. Deploy Job (~3 min):
   ✅ SSH a Hetzner
   ✅ Upload código
   ✅ Install deps producción
   ✅ Build frontend
   ✅ Restart PM2 services

3. Verify Job (~30 seg):
   ✅ Health check API
   ✅ Health check Frontend
   ✅ Deployment summary
```

### Monitoreo
https://github.com/tu-usuario/osyris/actions

---

## 📊 URLs del Sistema

### Local (Desarrollo)
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:5000
- 🐘 PostgreSQL: localhost:5432

### Producción (Hetzner)
- 🌐 Frontend: https://grupooosyris.es
- 🔧 API: https://api.grupooosyris.es

---

## 🔧 Troubleshooting

### "Puerto ocupado"
```bash
lsof -ti:5000,3000,5432 | xargs -r kill -9
/dev-local
```

### "PostgreSQL no conecta"
```bash
docker stop osyris-postgres
docker rm osyris-postgres
/dev-local  # Recreará todo
```

### "Deploy falla"
```bash
# Verificar GitHub Actions
https://github.com/usuario/osyris/actions

# Ver logs
ssh root@hetzner "pm2 logs osyris-backend"
```

### "Frontend no carga en producción"
```bash
# SSH al servidor
ssh root@hetzner
pm2 restart osyris-frontend
pm2 logs osyris-frontend
```

---

## 🎯 Secrets de GitHub (Configuración única)

Ir a: `Settings → Secrets and variables → Actions`

Crear estos secrets:
```
HETZNER_HOST=tu-servidor.hetzner.cloud
HETZNER_SSH_KEY=<tu-private-ssh-key>
DB_HOST=localhost
DB_PORT=5432
DB_USER=osyris_prod
DB_PASSWORD=<password-seguro>
DB_NAME=osyris_production
JWT_SECRET=<jwt-secret-produccion>
```

---

## ⚡ Ventajas del Sistema

### ✅ Desarrollo Rápido
- Setup en 1 comando
- PostgreSQL idéntico a prod
- Hot reload automático

### ✅ Deploy Seguro
- Tests automáticos
- Build verificado
- Rollback si falla

### ✅ CI/CD Completo
- GitHub Actions automático
- Deploy a Hetzner en ~5 min
- Verificación post-deploy

### ✅ Sin Sorpresas
- Mismo stack local y producción
- PostgreSQL en ambos
- Conventional commits enforced

---

## 📝 Notas Importantes

1. **Siempre usa `/dev-local`** para desarrollo
   - No usar SQLite (incompatible con producción)
   - PostgreSQL Docker = producción

2. **Nunca hagas `git push` directo**
   - Usar `/safe-deploy`
   - Activa CI/CD automático

3. **Conventional commits obligatorios**
   - `feat:`, `fix:`, `docs:`, etc.
   - Sugerencias automáticas

4. **Verifica antes de deploy**
   - `/check-health` → todo OK
   - Tests pasando
   - Build exitoso

---

## 🆘 Ayuda Rápida

```bash
# Empezar a trabajar
/dev-local

# Verificar que todo funciona
/check-health

# Deployar a producción
/safe-deploy

# Problema con PostgreSQL
# Usar agente: osyris-local-dev

# Problema con deploy
# Usar agente: osyris-deploy-agent
```

---

**🏕️ Sistema creado para Grupo Scout Osyris**
**Desarrollo rápido → Producción segura → Deploy automático**
