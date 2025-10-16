# 🚀 GUÍA DE DESPLIEGUE EN VERCEL

## ✅ Pre-requisitos completados

- [x] ✅ **Supabase configurado** - Base de datos PostgreSQL lista
- [x] ✅ **Storage configurado** - Bucket `osyris_files` con políticas
- [x] ✅ **Datos migrados** - 20 páginas, 5 secciones, usuarios
- [x] ✅ **Sistema dual funcionando** - Supabase en producción

## 🔧 Variables de entorno para Vercel

### 📋 **Variables que debes configurar en Vercel Dashboard:**

```env
# Backend API (configurar en Vercel)
SUPABASE_URL=https://nwkopngnziocsczqkjra.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a29wbmduemlvY3NjenFranJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTM5MzQsImV4cCI6MjA3NDY2OTkzNH0.lCitPUKcSqOBAMYiWnyLUwSvNFYEK-ExpYLRzOdXE9U
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a29wbmduemlvY3NjenFranJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MzkzNCwiZXhwIjoyMDc0NjY5OTM0fQ.yiLUu-VjhMRj5TfczHvGYLDdy1I4H86vXTAkTpzVpAE

# Configuración de la aplicación
DATABASE_TYPE=supabase
STORAGE_TYPE=supabase
NODE_ENV=production
JWT_SECRET=osyrisScoutGroup2024SecretKey
JWT_EXPIRES_IN=24h

# Frontend URLs
NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://nwkopngnziocsczqkjra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a29wbmduemlvY3NjenFranJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTM5MzQsImV4cCI6MjA3NDY2OTkzNH0.lCitPUKcSqOBAMYiWnyLUwSvNFYEK-ExpYLRzOdXE9U
```

## 🗃️ **Ajuste final en Supabase**

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Añadir columna faltante
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS orden_menu INTEGER DEFAULT 0;

-- Verificar datos
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_paginas FROM paginas;
SELECT COUNT(*) as total_secciones FROM secciones;
```

## 🚀 **Pasos para desplegar:**

### 1. **Conectar repositorio a Vercel**
- Ve a [vercel.com](https://vercel.com)
- Import repository
- Selecciona Next.js framework

### 2. **Configurar variables de entorno**
- En Vercel Dashboard → Settings → Environment Variables
- Añade todas las variables de arriba

### 3. **Verificar build**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. **Deploy**
- Click "Deploy"
- Vercel detectará automáticamente Next.js

## 🔐 **Credenciales de admin:**

```
Email: admin@grupoosyris.es
Password: admin123
```

## ✅ **Sistema completamente migrado a Supabase**

El sistema ya está funcionando con:
- ✅ **Base de datos:** PostgreSQL en Supabase
- ✅ **Storage:** Supabase Storage con políticas configuradas
- ✅ **Autenticación:** JWT con bcrypt funcionando
- ✅ **APIs:** Todos los endpoints funcionando
- ✅ **Frontend:** Next.js listo para producción

¡Tu sistema Osyris está listo para producción! 🎉