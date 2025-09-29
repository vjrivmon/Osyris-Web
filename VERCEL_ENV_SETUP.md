# 🚀 Configuración de Variables de Entorno en Vercel

## ⚙️ Variables Requeridas para Producción

Debes configurar estas variables en el **Dashboard de Vercel** → Tu Proyecto → Settings → Environment Variables

### 1. Variables del Frontend (Next.js)

```env
# API Backend URL
NEXT_PUBLIC_API_URL=https://osyris-api.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nwkopngnziocsczqkjra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a29wbmduemlvY3NjenFranJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTM5MzQsImV4cCI6MjA3NDY2OTkzNH0.lCitPUKcSqOBAMYiWnyLUwSvNFYEK-ExpYLRzOdXE9U

# App Configuration
NEXT_PUBLIC_APP_NAME=Osyris Scout Management
```

### 2. Variables del Backend (API)

**IMPORTANTE:** Si despliegas el backend por separado en Vercel, configura:

```env
# Environment
NODE_ENV=production
DATABASE_TYPE=supabase

# Supabase Configuration
SUPABASE_URL=https://nwkopngnziocsczqkjra.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a29wbmduemlvY3NjenFranJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTM5MzQsImV4cCI6MjA3NDY2OTkzNH0.lCitPUKcSqOBAMYiWnyLUwSvNFYEK-ExpYLRzOdXE9U
SUPABASE_SERVICE_KEY=<TU_SERVICE_KEY_DE_SUPABASE>

# JWT Configuration
JWT_SECRET=osyrisScoutGroup2024SecretKey
JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=https://osyris-web.vercel.app,http://localhost:3000
```

## 📋 Pasos para Configurar en Vercel

### Opción 1: Via Dashboard Web

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto "Osyris-Web"
3. Ve a **Settings** → **Environment Variables**
4. Añade cada variable una por una:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://osyris-api.vercel.app`
   - Environment: Marca **Production**, **Preview**, **Development**
5. Click en **Save**
6. Repite para cada variable

### Opción 2: Via Vercel CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Configurar variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_APP_NAME production

# Para el backend (si aplica)
vercel env add NODE_ENV production
vercel env add DATABASE_TYPE production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_KEY production
vercel env add JWT_SECRET production
vercel env add ALLOWED_ORIGINS production
```

## 🔑 Obtener SUPABASE_SERVICE_KEY

1. Ve a tu proyecto en https://supabase.com
2. Settings → API
3. Copia el **service_role key** (NO LA ANON KEY)
4. ⚠️ **NUNCA** expongas esta clave en el frontend

## ✅ Verificación Post-Deploy

Después de configurar las variables:

1. **Redeploy** el proyecto para que tome las nuevas variables
2. Verifica la consola de Vercel Logs que muestra:
   ```
   ☁️ Using Supabase upload controller (Production)
   ✅ Conexión a Supabase establecida correctamente
   ```

3. Prueba estas funcionalidades:
   - ✅ Login de usuarios
   - ✅ Carga de imágenes
   - ✅ Gestión de páginas
   - ✅ CRUD de usuarios

## 🚨 Troubleshooting

### Error: "Module not found"
- Verifica que todos los archivos estén en el repositorio git
- Haz `git status` y commitea archivos faltantes

### Error: "Database connection failed"
- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` estén correctos
- Revisa que el schema de Supabase esté aplicado

### Error: "CORS policy"
- Añade el dominio de producción a `ALLOWED_ORIGINS`
- Formato: `https://tu-app.vercel.app,http://localhost:3000`

## 📊 Arquitectura de Deploy

```
┌─────────────────────────────────────────┐
│   Frontend (Vercel)                     │
│   → Next.js 15                          │
│   → Variables: NEXT_PUBLIC_*            │
│   → URL: osyris-web.vercel.app          │
└─────────────┬───────────────────────────┘
              │
              │ API Calls
              ↓
┌─────────────────────────────────────────┐
│   Backend API (Vercel Function)         │
│   → Express.js                          │
│   → Variables: NODE_ENV, SUPABASE_*     │
│   → URL: osyris-api.vercel.app          │
└─────────────┬───────────────────────────┘
              │
              │ Database Queries
              ↓
┌─────────────────────────────────────────┐
│   Supabase (PostgreSQL + Storage)      │
│   → Tables: usuarios, paginas, etc.    │
│   → Storage: Buckets para uploads      │
└─────────────────────────────────────────┘
```

## 🎯 Próximos Pasos

1. ✅ Configurar variables en Vercel
2. ✅ Hacer redeploy del proyecto
3. ✅ Verificar logs de deployment
4. ✅ Probar todas las funcionalidades
5. ✅ Configurar dominio custom (opcional)