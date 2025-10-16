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
- **Base de datos:** PostgreSQL 15 (desarrollo y producción)
- **Puerto:** 5000
- **Autenticación:** JWT + bcryptjs

## 📁 Estructura del Proyecto

```
Osyris-Web/
├── 🖥️ Frontend (Next.js 15 con src/)
│   ├── src/                         # Directorio fuente principal
│   │   ├── app/                    # App Router de Next.js
│   │   │   ├── dashboard/          # Panel principal por roles
│   │   │   │   ├── ajustes/       # Configuración usuario
│   │   │   │   ├── calendar/      # Calendario actividades
│   │   │   │   ├── communications/ # Centro mensajería
│   │   │   │   ├── documents/     # Gestión documentos
│   │   │   │   ├── inventory/     # Control inventario
│   │   │   │   ├── kraal/         # Panel monitores (ÚNICO PERFIL ACTIVO)
│   │   │   │   ├── members/       # Gestión miembros
│   │   │   │   └── store/         # Tienda scout
│   │   │   ├── secciones/         # Páginas secciones
│   │   │   │   ├── castores/      # Colonia La Veleta (5-7 años)
│   │   │   │   ├── manada/        # Manada Waingunga (7-10 años)
│   │   │   │   ├── tropa/         # Tropa Brownsea (10-13 años)
│   │   │   │   ├── pioneros/      # Posta Kanhiwara (13-16 años)
│   │   │   │   └── rutas/         # Ruta Walhalla (16-19 años)
│   │   │   ├── aula-virtual/       # Módulo formación online
│   │   │   ├── login/              # Autenticación
│   │   │   ├── contacto/           # Información contacto
│   │   │   ├── galeria/            # Galería fotos
│   │   │   └── globals.css         # Estilos globales
│   │   ├── components/             # Componentes React
│   │   │   ├── ui/                # Componentes Shadcn/ui
│   │   │   ├── aula-virtual/      # Componentes aula virtual
│   │   │   ├── admin/              # Componentes admin
│   │   │   ├── auth/               # Componentes autenticación
│   │   │   ├── main-nav.tsx        # Navegación principal
│   │   │   ├── site-footer.tsx     # Pie de página
│   │   │   └── theme-provider.tsx  # Proveedor tema
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useAuth.ts          # Hook autenticación
│   │   │   ├── use-mobile.tsx      # Hook responsive
│   │   │   ├── use-toast.ts        # Hook notificaciones
│   │   │   └── useSectionContent.ts # Hook contenido secciones
│   │   ├── lib/                    # Utilidades y helpers
│   │   │   ├── api-utils.ts        # Utilidades API
│   │   │   ├── auth-utils.ts       # Utilidades auth
│   │   │   ├── dev-session-clear.ts # Limpieza sesión desarrollo
│   │   │   ├── page-connector.ts   # Conector páginas
│   │   │   └── utils.ts            # Utilidades generales
│   │   ├── contexts/               # Contextos React
│   │   │   ├── AuthContext.tsx     # Contexto autenticación
│   │   │   └── EditModeContext.tsx # Contexto modo edición
│   │   └── styles/                 # Estilos
│   │       └── globals.css         # Estilos globales
│   └── public/                      # Archivos estáticos
├── 📚 Documentación Organizada
│   └── docs/                        # Documentación consolidada
│       ├── development/            # Guías desarrollo
│       │   ├── restructure-system.md # Sistema reestructuración
│       │   ├── GUIA_EDICION_EN_VIVO.md # Guía edición
│       │   └── DONDE_VER_LOS_CAMBIOS.md # Cambios recientes
│       ├── deployment/             # Documentación deploy
│       │   ├── MIGRATION_TO_HETZNER.md # Migración producción
│       │   ├── PRODUCTION_MAINTENANCE.md # Mantenimiento
│       │   └── README_DEPLOYMENT.md # Guía deploy
│       └── archive/                 # Documentación histórica
│           ├── CHANGELOG-2025-10-03.md # Changelog histórico
│           └── [otros documentos archivados]
├── 🤖 Sistema de Agentes
│   └── .claude/agents/             # Agentes especializados
│       ├── infrastructure/         # Agentes infraestructura
│       │   ├── osyris-backup-agent.md
│       │   ├── osyris-cleanup-agent.md
│       │   ├── osyris-gitignore-agent.md
│       │   ├── osyris-restructure-agent.md
│       │   └── osyris-restructure-orchestrator.md
│       ├── universal/              # Agentes universales
│       │   ├── osyris-docs-agent.md
│       │   └── osyris-imports-agent.md
│       └── testing/                # Agentes testing
│           └── osyris-testing-agent.md
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
│       │   └── init.sql            # Scripts inicialización PostgreSQL
│       └── package.json
├── 🛠️ Scripts de Desarrollo
│   └── scripts/
│       ├── dev-start.sh            # Inicio desarrollo automatizado
│       └── setup-dev.sh            # Configuración inicial
├── 🐳 Docker
│   ├── docker-compose.yml          # Orquestación servicios
│   └── Dockerfile                  # Imagen aplicación
├── 📝 Logs
│   └── logs/                       # Logs del sistema
└── ⚙️ Configuración
    ├── next.config.mjs             # Config Next.js
    ├── tailwind.config.ts          # Config Tailwind
    ├── tsconfig.json               # Config TypeScript
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

### Docker (Desarrollo y Producción)
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Base de datos PostgreSQL:** localhost:5432

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

### PostgreSQL 15 (Desarrollo y Producción)

**Configuración idéntica** en local y producción para paridad completa:

#### Desarrollo Local (Docker)
- **Imagen:** postgres:15-alpine
- **Host:** localhost
- **Puerto:** 5432
- **Usuario:** osyris_user
- **Password:** osyris_password
- **Base de datos:** osyris_db
- **Herramientas:** pgAdmin, DBeaver, psql

#### Producción (Hetzner Cloud)
- **Servidor:** 116.203.98.142
- **Container:** osyris-db (Docker)
- **Puerto:** 5432
- **Backup automático:** Diario a las 9:00 AM
- **Retención:** 2 backups más recientes

### Tablas Principales
- `usuarios` - Información usuarios y roles
- `secciones` - Secciones scout
- `actividades` - Eventos y actividades
- `documentos` - Archivos y circulares
- `mensajes` - Sistema mensajería
- `paginas_estaticas` - Contenido web editable

## 🐳 Infraestructura y Despliegue

### Entornos

#### 🏠 **Desarrollo Local**
- **Base de datos:** PostgreSQL 15 en Docker (`postgres:15-alpine`)
- **Uploads:** Sistema de archivos local (`/uploads/`)
- **Configuración:** `api-osyris/src/config/db.config.js`
- **Puerto BD:** 5432
- **Inicio:** `./scripts/dev-start.sh` o `npm run dev`

#### ☁️ **Producción (Hetzner Cloud)**
- **Servidor:** 116.203.98.142
- **Base de datos:** PostgreSQL 15 en Docker (container: osyris-db)
- **Gestor procesos:** PM2
- **Puerto Frontend:** 3000 (Next.js)
- **Puerto Backend:** 5000 (Express.js)
- **Puerto BD:** 5432 (PostgreSQL)
- **CI/CD:** GitHub Actions → Deploy automático
- **Backups:** Automáticos diarios 9:00 AM (2 más recientes)

## 🛠️ Scripts de Automatización

### 🚀 dev-start.sh
**Script ÚNICO y completo de desarrollo** que:
- ✅ **MATA AUTOMÁTICAMENTE** todos los procesos previos en puertos 3000 y 5000
- ✅ **FUNCIÓN INTEGRADA de limpieza** (no necesitas script separado)
- ✅ **5 intentos de forzado** para liberar puertos ocupados
- ✅ Verifica dependencias instaladas
- ✅ **Inicia PostgreSQL en Docker** si no está corriendo
- ✅ **Inicia en puerto 3000** (frontend) y 5000 (backend)
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
- **osyris-db** - PostgreSQL 15 (puerto 5432)

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
DB_PORT=5432
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
- **Frontend:** App Router de Next.js en `/src/app`
- **Componentes:** Componentes React en `/src/components`
- **Hooks:** Custom hooks en `/src/hooks`
- **Contextos:** Contextos React en `/src/contexts`
- **Utils:** Utilidades en `/src/lib`
- **Backend:** Express.js en `/api-osyris`
- **Documentación:** Organizada en `/docs`
- **Agentes:** Sistema de agentes en `/.claude/agents`

### Tecnologías Clave
- Next.js 15 con TypeScript y arquitectura `src/`
- Express.js con PostgreSQL
- Tailwind CSS + Shadcn/ui
- JWT para autenticación
- Docker para producción
- Sistema de 115 agentes especializados

### Puertos
- **3000** - Frontend desarrollo
- **5000** - Backend API
- **5432** - Base de datos PostgreSQL (Docker)

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
- **Ubicación:** `src/components/ui/dynamic-section-page.tsx`
- **Comportamiento:** Carga SOLO datos estáticos locales
- **Razón:** El contenido original y correcto está hardcoded en el componente

#### ✅ Configuración Actual (Correcta)
```typescript
// src/components/ui/dynamic-section-page.tsx:34-48
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
1. **Editar:** `src/components/ui/dynamic-section-page.tsx`
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
| Secciones Scout | `src/components/ui/dynamic-section-page.tsx` | ❌ No |
| Contacto | Base de datos | ✅ Sí |
| Sobre Nosotros | Base de datos | ✅ Sí |
| Calendario | Base de datos | ✅ Sí |
| Galería | Base de datos | ✅ Sí |

Este sistema está diseñado para ser una solución completa de gestión para grupos scout, con enfoque en facilidad de uso, escalabilidad, mantenimiento y experiencia de usuario profesional.

---

## 🎭 Sistema de Reestructuración de Agentes

### Descripción

Sistema especializado de 8 agentes + 1 orquestador maestro para reestructurar el proyecto con precisión quirúrgica hacia una arquitectura modular con directorio `src/`.

### Agentes del Sistema

1. **osyris-backup-agent** - Backup completo y rama de trabajo segura
2. **osyris-gitignore-agent** - Actualización de .gitignore con reglas completas
3. **osyris-cleanup-agent** - Eliminación de archivos duplicados y data
4. **osyris-restructure-agent** - Movimiento de código a src/
5. **osyris-docs-agent** - Consolidación de documentación en docs/
6. **osyris-imports-agent** - Actualización inteligente de imports
7. **osyris-testing-agent** - Validación de build, tests y calidad
8. **osyris-deploy-agent** - Preparación de commit estructurado
9. **osyris-restructure-orchestrator** - Coordinación de todo el sistema

### Arquitectura de Ejecución

```
FASE 1 (Secuencial): backup → gitignore → cleanup
FASE 2 (Paralelo): restructure + docs
FASE 3 (Secuencial): imports → testing
FASE 4 (Aprobación): Resumen → Usuario aprueba → commit
```

### Invocación

```bash
@osyris-restructure-orchestrator
```

### Mejoras Conseguidas

Después de ejecutar el sistema:

- ✅ **Arquitectura modular** con `src/`
- ✅ **Documentación organizada** en `docs/`
- ✅ **Repositorio limpio** (sin duplicados ni data)
- ✅ **Reducción de tamaño** > 10MB
- ✅ **Imports actualizados** (~500+)
- ✅ **Build exitoso**
- ✅ **Score de calidad** > 95%

### Documentación Completa

Guía completa disponible en: `docs/development/restructure-system.md`

### Estado Actual del Proyecto (2025-10-16)

#### ✅ **Reestructuración Completada Exitosamente**
- **Commit hash:** `813b89f` - feat: reestructuración completa del proyecto a arquitectura src/ modular
- **Archivos afectados:** 326 archivos modificados
- **Reducción de tamaño:** > 10MB eliminados
- **Calidad:** Build exitoso, sin errores TypeScript

#### 🏗️ **Nueva Arquitectura src/ Implementada**
```
src/
├── app/           # 35 páginas Next.js movidas
├── components/    # 78 componentes React movidos
├── hooks/         # 5 custom hooks movidos
├── lib/           # 5 utilidades movidas
├── contexts/      # 2 contextos React movidos
└── styles/        # 1 archivo de estilos movido
```

#### 📚 **Documentación Consolidada**
- **docs/development/** - 3 guías de desarrollo activas
- **docs/deployment/** - 3 guías de deploy
- **docs/archive/** - 14 documentos históricos archivados

#### 🤖 **Sistema de Agentes Especializados**
- **Total:** 115 agentes en el ecosistema
- **Infraestructura:** 5 agentes especializados
- **Universales:** 2 agentes
- **Testing:** 1 agente
- **Todos registrados** en `.claude/agents/agents.json`

#### 🧹 **Limpieza y Optimización**
- **Archivos eliminados:** 200+ archivos duplicados/obsoletos
- **.gitignore actualizado** con reglas completas
- **Imports actualizados** (~500+ referencias)
- **Tailwind config adaptado** a nueva estructura

### Características de Seguridad

- Backup automático antes de cambios
- Rama de trabajo dedicada
- Rollback disponible en cualquier momento
- Validación en cada paso
- Aprobación explícita del usuario antes del commit
- NO push automático (el usuario lo hace manualmente)

### Tiempo de Ejecución

- **Total**: ~2 minutos
- Preparación: ~16s
- Reestructuración: ~12s (paralelo)
- Validación: ~80s (incluye build)

### Agentes Registrados en agents.json

Todos los agentes están registrados en `.claude/agents/agents.json`:
- **Categoría infrastructure**: 5 agentes
- **Categoría universal**: 2 agentes
- **Categoría testing**: 1 agente

**Total sistema**: 8 agentes especializados + 1 orquestador = **115 agentes totales** en el ecosistema