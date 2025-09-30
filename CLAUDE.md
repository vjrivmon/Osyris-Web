# 🏕️ Osyris Scout Management System

## 📋 Información del Proyecto

**Sistema de gestión integral para el Grupo Scout Osyris**

- **Nombre:** Osyris Scout Management System
- **Versión:** 1.0.0
- **Autor:** Vicente Rivas Monferrer
- **Licencia:** ISC
- **Descripción:** Sistema completo de gestión para actividades, miembros, documentos y comunicaciones del Grupo Scout Osyris

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend (Next.js 15)
- **Framework:** Next.js 15.5.4 con App Router
- **Lenguaje:** TypeScript 5.9.2
- **UI Framework:** Tailwind CSS + Shadcn/ui
- **Puerto de desarrollo:** 3000
- **Estado:** React 19.1.1 con hooks personalizados

#### Backend (Express.js)
- **Framework:** Express.js 4.18.2
- **Lenguaje:** JavaScript (Node.js)
- **Base de datos:** SQLite (desarrollo) / MariaDB (producción)
- **Puerto:** 5000
- **Autenticación:** JWT + bcryptjs

## 📁 Estructura del Proyecto

```
Osyris-Web/
├── 🖥️ Frontend (Next.js)
│   ├── app/                          # App Router de Next.js
│   │   ├── dashboard/                # Panel principal por roles
│   │   │   ├── ajustes/             # Configuración usuario
│   │   │   ├── calendar/            # Calendario actividades
│   │   │   ├── communications/       # Centro mensajería
│   │   │   ├── documents/           # Gestión documentos
│   │   │   ├── inventory/           # Control inventario
│   │   │   ├── kraal/               # Panel monitores (ÚNICO PERFIL ACTIVO)
│   │   │   ├── members/             # Gestión miembros
│   │   │   └── store/               # Tienda scout
│   │   ├── secciones/               # Páginas secciones
│   │   │   ├── castores/            # Colonia La Veleta (5-7 años)
│   │   │   ├── lobatos/             # Manada Waingunga (7-10 años)
│   │   │   ├── tropa/               # Tropa Brownsea (10-13 años)
│   │   │   ├── pioneros/            # Posta Kanhiwara (13-16 años)
│   │   │   └── rutas/               # Ruta Walhalla (16-19 años)
│   │   ├── aula-virtual/            # Módulo formación online
│   │   ├── login/                   # Autenticación
│   │   ├── contacto/                # Información contacto
│   │   ├── galeria/                 # Galería fotos
│   │   └── globals.css              # Estilos globales
│   ├── components/                   # Componentes React
│   │   ├── ui/                      # Componentes Shadcn/ui
│   │   ├── aula-virtual/            # Componentes aula virtual
│   │   ├── dashboard-breadcrumb.tsx
│   │   ├── main-nav.tsx
│   │   ├── site-footer.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/                       # Custom hooks
│   ├── lib/                         # Utilidades y helpers
│   └── public/                      # Archivos estáticos
├── 🔧 Backend (Express.js)
│   └── api-osyris/
│       ├── src/
│       │   ├── config/              # Configuración BD
│       │   ├── controllers/         # Lógica negocio API
│       │   ├── middleware/          # Auth y validaciones
│       │   ├── models/              # Modelos datos
│       │   ├── routes/              # Endpoints API
│       │   ├── utils/               # Funciones auxiliares
│       │   └── index.js             # Servidor principal
│       ├── database/
│       │   └── osyris.db           # BD SQLite desarrollo
│       └── package.json
├── 🛠️ Scripts de Desarrollo
│   └── scripts/
│       ├── dev-start.sh            # Inicio desarrollo automatizado
│       ├── kill-services.sh        # Limpieza procesos
│       └── setup-dev.sh            # Configuración inicial
├── 🐳 Docker
│   ├── docker-compose.yml          # Orquestación servicios
│   └── Dockerfile                  # Imagen aplicación
└── ⚙️ Configuración
    ├── next.config.mjs             # Config Next.js
    ├── tailwind.config.ts          # Config Tailwind
    ├── tsconfig.json               # Config TypeScript
    ├── jest.config.js              # Config testing
    └── package.json                # Dependencias principales
```

## 🚀 Comandos de Desarrollo

### 🔧 Configuración Inicial
```bash
# Clonar y configurar proyecto
git clone <repository>
cd Osyris-Web

# Ejecutar configuración automática
./scripts/setup-dev.sh
```

### 💻 Desarrollo Local
```bash
# Método 1: Script automatizado (RECOMENDADO)
./scripts/dev-start.sh

# Método 2: NPM directo
npm run dev

# Método 3: Servicios separados
npm run dev:frontend    # Solo frontend (puerto 3002)
npm run dev:backend     # Solo backend (puerto 5000)
```

### 🛑 Detener Servicios
```bash
# Matar todos los procesos de desarrollo
./scripts/kill-services.sh

# O manualmente
pkill -f "next dev"
pkill -f "nodemon"
```

### 🏗️ Build y Producción
```bash
npm run build              # Build completo
npm run build:frontend     # Solo frontend
npm run build:backend      # Solo backend
```

### 🧪 Testing
```bash
npm test                   # Tests completos
npm run test:frontend      # Tests Jest (frontend)
npm run test:backend       # Tests backend
npm run test:e2e          # Tests Playwright E2E
```

### 📏 Linting y Formateo
```bash
npm run lint              # Lint completo
npm run lint:frontend     # ESLint frontend
npm run lint:backend      # Lint backend
```

### 🔧 Utilidades
```bash
npm run setup             # Configuración inicial
npm run clean             # Limpieza archivos build
npm run reset             # Reset completo desarrollo
npm run fix-deps          # Reparar dependencias
```

### 🛑 Detener Servicios
```bash
# El script dev-start.sh incluye función completa de limpieza
# No hay script separado, todo está integrado en dev-start.sh
```

## 🌐 URLs del Sistema

### Desarrollo Local
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Documentación API:** http://localhost:5000/api-docs

### Docker (Producción)
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Base de datos:** localhost:3306

## 🔐 Sistema de Roles y Permisos

### 👥 Tipos de Usuario

#### 🎖️ Comité (Administradores)
- **Acceso completo** al sistema
- Gestión de todos los usuarios
- Configuración global
- Reportes y estadísticas

#### 🏕️ Kraal/Monitores
- Gestión de **su sección** asignada
- Lista de educandos de su sección
- Actividades y comunicaciones
- Documentos sección

#### 👨‍👩‍👧‍👦 Familias
- **Seguimiento de sus hijos**
- Calendario actividades
- Comunicaciones recibidas
- Documentos relevantes

#### 🧒 Educandos
- **Panel personal**
- Sus actividades
- Progresión en especialidades
- Aula virtual (si aplica)

## 🏕️ Secciones Scout

### 🦫 Castores (5-7 años)
- **Nombre:** Colonia La Veleta
- **Colores:** Naranja y azul
- **Actividades:** Juegos y manualidades

### 🐺 Lobatos (7-10 años)
- **Nombre:** Manada Waingunga
- **Colores:** Amarillo y verde
- **Actividades:** Aventuras y especialidades

### ⚜️ Tropa (10-13 años)
- **Nombre:** Tropa Brownsea
- **Colores:** Verde
- **Sistema:** Patrullas y especialidades

### 🏔️ Pioneros (13-16 años)
- **Nombre:** Posta Kanhiwara
- **Colores:** Rojo
- **Actividades:** Proyectos y campamentos

### 🎒 Rutas (16-19 años)
- **Nombre:** Ruta Walhalla
- **Colores:** Verde botella
- **Actividades:** Travesías y servicio

## 🔌 API Endpoints

### 🔐 Autenticación
```
POST /api/auth/login           # Iniciar sesión
POST /api/auth/register        # Registro usuario
POST /api/auth/refresh         # Renovar token
POST /api/auth/logout          # Cerrar sesión
```

### 👥 Usuarios
```
GET    /api/usuarios           # Listar usuarios
GET    /api/usuarios/:id       # Usuario específico
POST   /api/usuarios           # Crear usuario
PUT    /api/usuarios/:id       # Actualizar usuario
DELETE /api/usuarios/:id       # Eliminar usuario
```

### 🏕️ Secciones
```
GET /api/secciones             # Listar secciones
GET /api/secciones/:id         # Sección específica
GET /api/secciones/:id/miembros # Miembros de sección
```

### 📅 Actividades
```
GET    /api/actividades        # Listar actividades
POST   /api/actividades        # Crear actividad
PUT    /api/actividades/:id    # Actualizar actividad
DELETE /api/actividades/:id    # Eliminar actividad
```

### 📄 Documentos
```
GET    /api/documentos         # Listar documentos
POST   /api/documentos         # Subir documento
DELETE /api/documentos/:id     # Eliminar documento
```

### 💬 Comunicaciones
```
GET  /api/mensajes             # Listar mensajes
POST /api/mensajes             # Enviar mensaje
PUT  /api/mensajes/:id/leido   # Marcar como leído
```

## 🗃️ Base de Datos

### Desarrollo (SQLite)
- **Archivo:** `database/osyris.db` (creado automáticamente)
- **Configuración:** Automática con tablas básicas
- **Herramientas:** DB Browser for SQLite
- **Secciones:** Insertadas automáticamente (Castores, Lobatos, Tropa, Pioneros, Rutas)

### Producción (MariaDB)
- **Host:** Configurable via Docker
- **Puerto:** 3306
- **Usuario/BD:** Configurables en `.env`

### Tablas Principales
- `usuarios` - Información usuarios y roles
- `secciones` - Secciones scout
- `actividades` - Eventos y actividades
- `documentos` - Archivos y circulares
- `mensajes` - Sistema mensajería

## 🚀 Sistema Dual de Desarrollo

### 🏠 Desarrollo Local vs ☁️ Producción Supabase

El proyecto está configurado para funcionar en **dos entornos completamente separados**:

#### 🏠 **Entorno Local (SQLite)**
- **Base de datos:** SQLite local (`/database/osyris.db`)
- **Uploads:** Sistema de archivos local (`/uploads/`)
- **Configuración:** `src/config/db.config.js`
- **Credenciales:** No se requieren claves externas
- **Uso:** Desarrollo y testing local

#### ☁️ **Entorno Producción (Supabase)**
- **Base de datos:** PostgreSQL en Supabase
- **Uploads:** Supabase Storage
- **Configuración:** `src/config/supabase.config.js`
- **Credenciales:** Variables de entorno Supabase
- **Uso:** Deploy en Vercel y producción

### 🔄 Comandos de Cambio de Entorno

#### Cambiar a desarrollo local:
```bash
# Comando Claude disponible
/local-dev
```

#### Cambiar a producción Supabase:
```bash
# Comando Claude disponible
/supabase-deploy
```

### 📝 Configuración Automática

Cada comando configura automáticamente:
- ✅ Variables de entorno correspondientes
- ✅ Archivos de configuración de BD
- ✅ Sistema de uploads apropiado
- ✅ Scripts de inicio correctos
- ✅ Dependencias necesarias

## 🛠️ Scripts de Automatización

### 🚀 dev-start.sh
**Script ÚNICO y completo de desarrollo** que:
- ✅ **MATA AUTOMÁTICAMENTE** todos los procesos previos en puertos 3000 y 5000
- ✅ **FUNCIÓN INTEGRADA de limpieza** (no necesitas script separado)
- ✅ **5 intentos de forzado** para liberar puertos ocupados
- ✅ Verifica dependencias instaladas
- ✅ Configura Next.js automáticamente
- ✅ **Inicia en puerto 3000** (frontend) y 5000 (backend)
- ✅ **Configura SQLite automáticamente** con tablas y datos básicos
- ✅ Gestión de errores y logging colorizado
- ✅ **Sin dependencias externas** - todo en un solo script

### ⚙️ setup-dev.sh
**Configuración inicial** que:
- 📦 Instala dependencias frontend y backend
- 📝 Crea configuraciones necesarias
- 📁 Prepara estructura de directorios
- 🔧 Configura permisos de scripts

## 🐳 Docker y Producción

### Desarrollo Local con Docker
```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### Servicios Docker
- **osyris-frontend** - Next.js (puerto 3000)
- **osyris-backend** - Express.js (puerto 5000)
- **osyris-db** - MariaDB (puerto 3306)

## 🔧 Configuración

### Variables de Entorno

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Osyris Scout Management
```

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=osyris_user
DB_PASSWORD=osyris_password
DB_NAME=osyris_db
JWT_SECRET=osyrisScoutGroup2024SecretKey
JWT_EXPIRES_IN=24h
```

### Next.js (next.config.mjs)
- ✅ TypeScript/ESLint ignorados en build
- ✅ Optimización webpack habilitada
- ✅ Directorio build personalizado
- ✅ Configuración para múltiples lockfiles

## 🧪 Testing

### Frontend (Jest)
```bash
npm run test:frontend         # Tests unitarios
```

### Backend
```bash
npm run test:backend          # Tests API
```

### E2E (Playwright)
```bash
npm run test:e2e             # Tests end-to-end
npx playwright install       # Instalar navegadores
```

## 📊 Monitoreo y Logs

### Desarrollo
- **Logs frontend:** Consola navegador + terminal
- **Logs backend:** Terminal nodemon
- **Directorio logs:** `./logs/` (creado automáticamente)

### Producción (Docker)
```bash
docker-compose logs osyris-frontend
docker-compose logs osyris-backend
docker-compose logs osyris-db
```

## 🔄 Workflow de Desarrollo

### 1. Configuración Inicial
```bash
git clone <repository>
cd Osyris-Web
./scripts/setup-dev.sh
```

### 2. Desarrollo Diario
```bash
# Iniciar desarrollo
./scripts/dev-start.sh

# Trabajar en código...

# Detener al finalizar
./scripts/kill-services.sh
```

### 3. Antes de Commit
```bash
npm run lint                 # Verificar código
npm test                     # Ejecutar tests
npm run build               # Verificar build
```

## 🚨 Resolución de Problemas

### Error: Puerto Ocupado
```bash
# Ejecutar script de limpieza
./scripts/kill-services.sh

# O manualmente
lsof -ti:3002,5000 | xargs kill -9
```

### Error: Dependencias
```bash
# Limpiar y reinstalar
rm -rf node_modules api-osyris/node_modules
npm run fix-deps
```

### Error: Base de Datos
```bash
# Recrear BD SQLite
rm api-osyris/database/osyris.db
npm run dev:backend          # Se recreará automáticamente
```

### Error: Build
```bash
# Limpiar build
npm run clean
rm -rf build/ .next/
npm run build
```

## 📝 Notas para Claude Code

### Comandos Esenciales
- `./scripts/dev-start.sh` - **Iniciar desarrollo completo** (incluye limpieza automática)
- `npm run lint` - **Verificar código**
- `npm test` - **Ejecutar tests**

### Estructura Importante
- **Frontend:** App Router de Next.js en `/app`
- **Backend:** Express.js en `/api-osyris`
- **Componentes:** Shadcn/ui en `/components/ui`
- **Scripts:** Automatización en `/scripts`

### Tecnologías Clave
- Next.js 15 con TypeScript
- Express.js con SQLite/MariaDB
- Tailwind CSS + Shadcn/ui
- JWT para autenticación
- Docker para producción

### Puertos
- **3000** - Frontend desarrollo
- **5000** - Backend API
- **3306** - Base de datos (Docker)

## 🎨 Design System y UX/UI

### Documentación de Diseño
- **Design System:** Documentado en `DESIGN_SYSTEM.md`
- **Filosofía:** Profesional, accesible y scout-identity
- **Componentes:** Basados en Shadcn/ui con personalización scout
- **Responsividad:** Mobile-first con breakpoints optimizados

### Mejoras Implementadas (Rama: eliminación-datos-mock)

#### 🚪 **Sistema de Logout Mejorado**
- **Pop-up de confirmación:** AlertDialog con descripción clara
- **Responsivo:** Texto en desktop, solo icono en móvil
- **UX:** Confirmación antes de acción destructiva
- **Ubicación:** `app/dashboard/layout.tsx:107-140`

#### 🧭 **Navegación Aula Virtual Corregida**
- **Problema resuelto:** INICIO ya no queda siempre activo
- **Lógica mejorada:** Detección precisa de ruta activa
- **Archivo:** `components/aula-virtual/sidebar.tsx:85-87`

#### 📅 **Calendario Profesional**
- **Componente nuevo:** `components/ui/calendar-view.tsx`
- **Características:**
  - Vista mensual interactiva
  - Colores por sección scout
  - Sidebar con detalles de eventos
  - Navegación entre meses
  - Responsive design completo
- **Landing page:** Calendario funcional en `/calendario`

#### 🎯 **Perfiles Simplificados**
- **Solo Kraal activo:** Eliminados familias, comité, educandos
- **Login simplificado:** Sin tab de información
- **Backend actualizado:** Roles restringidos a 'scouter'
- **Base de datos:** Schema actualizado para solo kraal

#### 📊 **Reporte de Usabilidad**
- **Puntuación:** 7.5/10
- **Fortalezas:** Navegación sólida, diseño responsivo, UX clara
- **Mejoras:** Navegación corregida, calendario implementado
- **Accesibilidad:** WCAG 2.1 AA en desarrollo

### Patrones de Código Establecidos

#### 🎨 **Componentes UI**
```typescript
// Botón con confirmación
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost">Acción</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Título</AlertDialogTitle>
      <AlertDialogDescription>Descripción</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleAction}>Confirmar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### 🎯 **Navegación Activa**
```typescript
// Patrón para detectar rutas activas
const isActive = item.href === "/base-route"
  ? pathname === "/base-route"
  : pathname === item.href || pathname.startsWith(item.href + "/")
```

#### 📱 **Responsive Design**
```typescript
// Patrón de botones responsivos
<div className="hidden md:block">
  <Button showText={true}>Texto Desktop</Button>
</div>
<div className="md:hidden">
  <Button showText={false}>Solo Icono Móvil</Button>
</div>
```

## 🔧 **Comandos Actualizados**

### Comandos Esenciales
- `./scripts/dev-start.sh` - **Iniciar desarrollo completo** (puerto 3000 frontend)
- `npm run lint` - **Verificar código**
- `npm test` - **Ejecutar tests**

## ⚠️ **IMPORTANTE: Páginas de Secciones Scout**

### Contenido Estático vs Base de Datos

**Las páginas de secciones (castores, manada, tropa, pioneros, rutas) NO usan contenido dinámico de base de datos.**

#### 📄 Archivo de Contenido
- **Ubicación:** `components/ui/dynamic-section-page.tsx`
- **Comportamiento:** Carga SOLO datos estáticos locales
- **Razón:** El contenido original y correcto está hardcoded en el componente

#### ✅ Configuración Actual (Correcta)
```typescript
// components/ui/dynamic-section-page.tsx:34-48
const loadSectionData = async () => {
  // ⚠️ IMPORTANTE: Las páginas de secciones usan SOLO datos estáticos locales
  // NO se cargan desde base de datos para mantener el contenido correcto y original
  const fallbackData = getFallbackData(sectionSlug)
  setSectionData(fallbackData)
  setIsUsingFallback(true)
}
```

#### ❌ Configuración Anterior (Problemática)
- Intentaba cargar desde Supabase con `fetchPageWithConnection()`
- Mostraba contenido incorrecto/desactualizado de la base de datos
- Causaba errores cuando faltaban propiedades como `colors`

#### 📝 Estructura de Datos
Cada sección tiene definido en `dynamic-section-page.tsx` (líneas 69-240):
- **name**: Nombre corto (ej: "Castores", "Manada")
- **fullName**: Nombre completo (ej: "Colonia La Veleta", "Manada Waingunga")
- **slug**: Identificador de ruta (ej: "castores", "manada")
- **emoji**: Icono de la sección
- **motto**: Lema scout de la sección
- **ageRange**: Rango de edad
- **colors**: Colores gradiente (from, to, accent)
- **description**: Descripción breve
- **details**: Detalles adicionales
- **frame**: Marco simbólico
- **activities**: Lista de actividades (icon, title, description)
- **methodology**: Metodología educativa (title, description)
- **team**: Equipo de monitores (name, role, photo)
- **navigation**: Enlaces de navegación (prev, next)

#### 🔄 Si Necesitas Cambiar Contenido de Secciones
1. **Editar:** `components/ui/dynamic-section-page.tsx`
2. **Buscar:** El objeto `fallbackSections` (línea ~69)
3. **Modificar:** El contenido de la sección deseada
4. **Recargar:** El navegador recompilará automáticamente

#### 🚫 NO Hacer
- No cambiar `loadSectionData()` para cargar desde base de datos
- No eliminar la llamada a `getFallbackData()`
- No usar `fetchPageWithConnection()` para secciones
- No intentar "migrar" el contenido a Supabase

#### ✅ Sí Hacer
- Mantener el contenido hardcoded en el componente
- Actualizar directamente en `fallbackSections`
- Usar la base de datos SOLO para otras páginas (contacto, calendario, etc.)

### 🗄️ Diferenciación de Contenido

| Página | Fuente de Datos | Editable desde Admin |
|--------|-----------------|---------------------|
| Secciones Scout | `dynamic-section-page.tsx` | ❌ No |
| Contacto | Base de datos | ✅ Sí |
| Sobre Nosotros | Base de datos | ✅ Sí |
| Calendario | Base de datos | ✅ Sí |
| Galería | Base de datos | ✅ Sí |

Este sistema está diseñado para ser una solución completa de gestión para grupos scout, con enfoque en facilidad de uso, escalabilidad, mantenimiento y experiencia de usuario profesional.