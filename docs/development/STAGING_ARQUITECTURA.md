# 🏗️ Arquitectura de Staging y Producción

## 📐 Diagrama de Arquitectura Completa

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          SERVIDOR HETZNER CLOUD                            │
│                         IP: 116.203.98.142                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐      │
│  │   ENTORNO STAGING            │  │   ENTORNO PRODUCCIÓN         │      │
│  │   /var/www/osyris-staging/   │  │   /var/www/osyris/           │      │
│  ├──────────────────────────────┤  ├──────────────────────────────┤      │
│  │                              │  │                              │      │
│  │  Frontend Next.js            │  │  Frontend Next.js            │      │
│  │  ├─ Puerto: 3001             │  │  ├─ Puerto: 3000             │      │
│  │  ├─ PM2: osyris-staging-     │  │  ├─ PM2: osyris-frontend     │      │
│  │  │       frontend             │  │  ├─ URL: gruposcoutosyris.es │      │
│  │  └─ next start (build)       │  │  └─ next start (build)       │      │
│  │                              │  │                              │      │
│  │  Backend Express.js          │  │  Backend Express.js          │      │
│  │  ├─ Puerto: 5001             │  │  ├─ Puerto: 5000             │      │
│  │  ├─ PM2: osyris-staging-     │  │  ├─ PM2: osyris-backend      │      │
│  │  │       backend              │  │  ├─ URL: gruposcoutosyris.es │      │
│  │  └─ NODE_ENV=staging         │  │  └─ NODE_ENV=production      │      │
│  │                              │  │                              │      │
│  │  .env.local                  │  │  .env.production             │      │
│  │  ├─ NEXT_PUBLIC_API_URL:     │  │  ├─ NEXT_PUBLIC_API_URL:     │      │
│  │  │  http://116.203.98.142:   │  │  │  https://gruposcoutosyris │      │
│  │  │  5001                     │  │  │  .es                      │      │
│  │  └─ NEXT_PUBLIC_STAGING=     │  │  └─ NODE_ENV=production      │      │
│  │     true                     │  │                              │      │
│  │                              │  │                              │      │
│  └──────────────────────────────┘  └──────────────────────────────┘      │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    PostgreSQL 15 (Docker)                        │    │
│  │                    Container: osyris-db                          │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │  ┌────────────────────────┐   ┌────────────────────────┐       │    │
│  │  │  osyris_staging_db     │   │  osyris_db             │       │    │
│  │  │  ├─ Puerto: 5432       │   │  ├─ Puerto: 5432       │       │    │
│  │  │  ├─ User: osyris_user  │   │  ├─ User: osyris_user  │       │    │
│  │  │  └─ Replica de prod    │   │  └─ Datos producción   │       │    │
│  │  └────────────────────────┘   └────────────────────────┘       │    │
│  │                                                                  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                        Sistema de Backups                        │    │
│  │                     /var/www/backups/                            │    │
│  ├──────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │  • backup_staging_YYYYMMDD_HHMMSS/        (últimos 10)         │    │
│  │  • backup_staging_YYYYMMDD_HHMMSS_db.sql.gz                     │    │
│  │  • prod_backup_before_deploy_YYYYMMDD/                          │    │
│  │  • before_rollback_YYYYMMDD/                                    │    │
│  │  • last_production_backup.txt             (referencia)          │    │
│  │                                                                  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos en Deploy

### 1️⃣ **Deploy a Staging**

```
LOCAL                    SERVIDOR
┌──────┐                ┌──────────────────────────────────────────┐
│      │                │                                          │
│ git  │──push──────────┼──> Producción (/var/www/osyris/current) │
│ push │                │         │                                │
│      │                │         │ copy                           │
│      │                │         ▼                                │
│      │                │    Staging (/var/www/osyris-staging/)   │
│      │                │         │                                │
│      │                │         ├─> Generar .env.local           │
│      │                │         │   NEXT_PUBLIC_API_URL=         │
│      │                │         │   http://116.203.98.142:5001   │
│      │                │         │                                │
│      │                │         ├─> npm run build                │
│      │                │         │   (con variables correctas)    │
│      │                │         │                                │
│      │                │         ├─> PM2 start next start         │
│      │                │         │   (puerto 3001)                │
│      │                │         │                                │
│      │                │         └─> PM2 start backend            │
│      │                │             (puerto 5001)                │
│      │                │                                          │
└──────┘                └──────────────────────────────────────────┘
```

### 2️⃣ **Verificación de Staging**

```
BROWSER                STAGING FRONTEND           STAGING BACKEND
┌────────┐            ┌──────────────┐           ┌──────────────┐
│        │            │              │           │              │
│ Usuario│──GET────►  │ :3001        │──API────► │ :5001        │
│        │            │              │  call    │              │
│        │            │ getApiUrl()  │           │              │
│        │            │ detecta:     │           │              │
│        │            │ 116.203...   │           │              │
│        │   ◄────200─│ → :5001      │  ◄────OK──│              │
│        │            │              │           │              │
└────────┘            └──────────────┘           └──────────────┘
```

### 3️⃣ **Deploy Staging → Producción**

```
STAGING                              PRODUCCIÓN
┌──────────────────────┐            ┌──────────────────────┐
│                      │            │                      │
│ Archivos validados   │──rsync────►│ /var/www/osyris/     │
│ Build optimizada     │            │                      │
│ .env.local (staging) │            │ ✗ ELIMINAR           │
│                      │            │ ✓ CREAR .env.prod    │
│                      │            │   NEXT_PUBLIC_API_   │
│                      │            │   URL=https://...    │
│                      │            │                      │
│ BD staging           │──dump─────►│ BD producción        │
│ (si hay cambios)     │            │ (con verificación)   │
│                      │            │                      │
└──────────────────────┘            └──────────────────────┘
```

## 🔐 Variables de Entorno por Capa

### **Staging**

#### Frontend (`/var/www/osyris-staging/current/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://116.203.98.142:5001
API_BASE_URL=http://116.203.98.142:5001
NODE_ENV=staging
NEXT_PUBLIC_APP_NAME=Osyris Scout Management - Staging
NEXT_PUBLIC_STAGING=true
```

#### Backend (`/var/www/osyris-staging/current/api-osyris/.env`)
```env
NODE_ENV=staging
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=osyris_user
DB_PASSWORD=OsyrisDB2024!Secure
DB_NAME=osyris_staging_db
JWT_SECRET=osyrisScoutGroup2024SecretKey!Staging
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://116.203.98.142:3001
ALLOWED_ORIGINS=http://116.203.98.142:3001,http://localhost:3001
STAGING_MODE=true
```

### **Producción**

#### Frontend (`/var/www/osyris/current/.env.production`)
```env
NEXT_PUBLIC_API_URL=https://gruposcoutosyris.es
API_BASE_URL=https://gruposcoutosyris.es
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Osyris Scout Management
```

#### Backend (`/var/www/osyris/current/api-osyris/.env`)
```env
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
```

## 🔍 Detección de Entorno en Código

### `src/lib/api-utils.ts`

```typescript
export function getApiUrl(): string {
  // 1. PRIORIDAD: variables de entorno
  const serverEnvApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (serverEnvApiUrl) {
    return serverEnvApiUrl.replace(/\/$/, '');
  }

  // 2. En servidor (SSR/SSG), usar localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  // 3. Detección automática por hostname
  const { hostname, protocol } = window.location;

  // Localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // Producción
  if (hostname.includes('gruposcoutosyris.es')) {
    return `${protocol}://gruposcoutosyris.es`;
  }

  // ⚡ STAGING (IP del servidor)
  if (hostname === '116.203.98.142') {
    return `${protocol}://116.203.98.142:5001`;
  }

  // Fallback
  return `${protocol}://${hostname}:5000`;
}
```

### **Comportamiento por Entorno**

| Entorno | `window.location.hostname` | `getApiUrl()` retorna |
|---------|---------------------------|-----------------------|
| **Local** | `localhost` | `http://localhost:5000` |
| **Staging** | `116.203.98.142` | `http://116.203.98.142:5001` |
| **Producción** | `gruposcoutosyris.es` | `https://gruposcoutosyris.es` |

## 📊 Matriz de Procesos PM2

```
┌─────────────────────────┬──────────┬───────┬─────────────────────────┐
│ Nombre                  │ Puerto   │ Modo  │ Path                    │
├─────────────────────────┼──────────┼───────┼─────────────────────────┤
│ osyris-frontend         │ 3000     │ prod  │ /var/www/osyris/current │
│ osyris-backend          │ 5000     │ prod  │ /var/www/osyris/current │
│ osyris-staging-frontend │ 3001     │ stage │ /var/www/osyris-staging │
│ osyris-staging-backend  │ 5001     │ stage │ /var/www/osyris-staging │
└─────────────────────────┴──────────┴───────┴─────────────────────────┘
```

Comando para ver:
```bash
ssh root@116.203.98.142 "pm2 list"
```

## 🔄 Ciclo de Vida de una Build

### **Build Time (npm run build)**

```
1. Leer .env.local
   ├─ NEXT_PUBLIC_API_URL=http://116.203.98.142:5001
   └─ Inyectar en código compilado

2. Compilar TypeScript
   ├─ src/ → .next/
   └─ Todos los NEXT_PUBLIC_* quedan hardcoded

3. Generar static assets
   ├─ _next/static/
   └─ Listos para servir
```

### **Runtime (npx next start)**

```
1. Iniciar servidor Next.js
   ├─ Puerto: 3001 (staging) o 3000 (prod)
   └─ NO lee NEXT_PUBLIC_* (ya compilado)

2. Servir páginas
   ├─ SSR con datos hardcoded
   └─ CSR ejecuta getApiUrl() que usa valores de build

3. API calls
   ├─ getApiUrl() retorna valor de build
   └─ Fetch a backend correcto
```

### ⚠️ **Por qué `next dev` NO funciona en staging**

```
next dev:
├─ Lee código fuente directamente
├─ Recompila en cada cambio
└─ Ignora variables de entorno de build
   (porque no hay build)

next start:
├─ Sirve build pre-compilada
├─ Variables NEXT_PUBLIC_* ya inyectadas
└─ Rendimiento optimizado
```

## 🛠️ Scripts y sus Responsabilidades

```
deploy-to-staging.sh
├─ Copia producción → staging
├─ Genera .env.local
├─ npm run build (con NEXT_PUBLIC_API_URL)
├─ Inicia PM2 con next start
└─ Crea BD staging

deploy-to-production-from-staging.sh
├─ Backup producción
├─ rsync staging → producción
├─ Restaura .env.production
├─ Sincroniza BD
└─ Reinicia PM2

verify-deployment.sh
├─ Verifica URLs
├─ Prueba endpoints
├─ Valida servicios PM2
└─ Genera reporte

emergency-rollback.sh
├─ Detiene servicios
├─ Restaura backup
├─ Restaura BD
└─ Reinicia servicios
```

## 📈 Tiempos de Ejecución

```
┌──────────────────────────────┬──────────┬─────────────────┐
│ Operación                    │ Tiempo   │ Crítica         │
├──────────────────────────────┼──────────┼─────────────────┤
│ Deploy a staging             │ ~5 min   │ No              │
│ Verificar staging            │ ~2 min   │ No              │
│ Deploy staging → prod        │ ~2 min   │ Sí              │
│ Verificar producción         │ ~2 min   │ Sí              │
│ Rollback de emergencia       │ ~30 seg  │ Sí (crítico)    │
└──────────────────────────────┴──────────┴─────────────────┘
```

**Total workflow normal:** ~11 minutos
**Rollback en emergencia:** 30 segundos

---

**Última actualización:** 2025-01-18
**Versión:** 1.0.0

