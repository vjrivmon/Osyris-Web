# 🏕️ Osyris Scout Management System

**Sistema de gestión integral para el Grupo Scout Osyris - Versión 2.0**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

---

## 🌟 Descripción

Sistema completo de gestión para grupos scout con **Portal para Familias** integrado. Permite a las familias hacer seguimiento de sus educandos, confirmar asistencia a actividades, acceder a documentos y fotos, todo desde una interfaz moderna y responsive.

Desarrollado específicamente para el Grupo Scout Osyris con enfoque en **usabilidad**, **seguridad** y **comunicación familiar**.

### 🎯 Características Principales

#### 👨‍👩‍👧‍👦 Portal Familias (NUEVO)
- **Registro y autenticación** de familias con emails personalizados
- **Vinculación de educandos** mediante códigos únicos
- **Dashboard familiar** con información consolidada
- **Confirmación de asistencia** a actividades
- **Galería privada** de fotos por sección
- **Documentos compartidos** y circulares

#### 🎯 Panel Administración
- **Gestión completa de familias** y familiares
- **Invitación masiva** mediante emails automáticos
- **Importación de educandos** desde Excel
- **Estadísticas completas** de vinculación y participación
- **Gestión de confirmaciones** y asistencias

#### 🚀 Infraestructura
- **📱 Responsive Design**: Optimizado para móviles, tablets y desktop
- **🔐 Autenticación JWT**: Doble sistema (Admin + Familias)
- **🌙 Modo Oscuro**: Soporte nativo para temas claro/oscuro
- **🐳 Docker + PM2**: Deploy automatizado en producción
- **🔄 CI/CD**: GitHub Actions con deploy en 2 fases (Staging → Production)
- **🗄️ PostgreSQL 15**: Base de datos en producción y desarrollo
- **📧 Sistema de Emails**: Notificaciones automáticas con Gmail

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend (Next.js 15)
- **Framework**: Next.js 15.5.4 con App Router
- **React**: React 19.1.1 con hooks personalizados
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.x
- **TypeScript**: TypeScript 5.9.2 con tipado estricto
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Custom Hooks
- **Testing**: Jest + React Testing Library + Playwright
- **Autenticación**: Sistema dual (Admin + Familias)

#### Backend (Express.js)
- **Framework**: Express.js 4.18.2
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 15 (producción y desarrollo)
- **ORM/Query Builder**: Pool de conexiones nativo pg
- **Authentication**: JWT + bcryptjs
- **Email Service**: Nodemailer con Gmail
- **File Upload**: Multer + Sistema de archivos local
- **Testing**: Jest + Supertest

#### Infraestructura
- **Production Server**: Hetzner Cloud (116.203.98.142)
- **Process Manager**: PM2
- **Database**: PostgreSQL 15 en Docker
- **CI/CD**: GitHub Actions (2-Phase Deploy)
- **Backup**: Automático diario (9:00 AM)
- **Monitoring**: PM2 + Logs estructurados
- **MCPs**: Model Context Protocols para integración
- **Playwright**: Capturas automáticas y testing E2E
- **Memory**: Persistencia de decisiones y aprendizajes

---

## 🎉 Novedades v2.0 (Octubre 2025)

### ✅ Portal para Familias - Sistema Completo

El mayor avance de esta versión es la **implementación completa del Portal para Familias**, que permite a las familias:

#### 📝 Registro y Acceso
- Registro de familias con validación de email
- Autenticación JWT independiente del sistema admin
- Recuperación de contraseñas
- Protección de rutas específicas

#### 🔗 Vinculación de Educandos
- Sistema de códigos únicos de 8 caracteres
- Vinculación de múltiples educandos por familia
- Validación automática de códigos
- Interface intuitiva paso a paso

#### 📊 Dashboard Familiar
- Vista consolidada de todos los educandos vinculados
- Información por sección scout
- Próximas actividades
- Notificaciones importantes
- Acceso rápido a funciones principales

#### ✅ Confirmaciones de Asistencia
- Confirmación/rechazo de asistencia a actividades
- Estados: pendiente, confirmada, rechazada
- Notificaciones de recordatorio
- Historial de confirmaciones

#### 📷 Galería Privada
- Acceso a fotos de actividades de sus educandos
- Organización por fecha y sección
- Sistema de permisos seguro
- Descarga de fotos individual

#### 📄 Documentos y Circulares
- Acceso a documentos relevantes
- Circulares y comunicados
- Autorizaciones
- Descarga segura

### 🎯 Mejoras en Administración

#### 📧 Invitación Masiva de Familias
- Sistema de emails automáticos con credenciales
- Plantillas personalizadas
- Importación desde Excel/CSV
- Tracking de invitaciones enviadas

#### 📊 Panel de Estadísticas
- Total de familias registradas
- Familiares activos
- Educandos vinculados
- Tasa de vinculación
- Gráficos interactivos

#### 👥 Gestión Completa
- CRUD de familias y familiares
- Gestión de vinculaciones
- Edición de datos
- Desactivación de cuentas
- Búsqueda y filtrado avanzado

### 🧒 Sistema de Educandos

#### 📥 Importación Masiva
- Importación desde archivos Excel
- Validación automática de datos
- Asignación a secciones
- Generación automática de códigos de vinculación

#### 🔗 Códigos de Vinculación
- Generación automática
- Códigos alfanuméricos únicos
- Sistema de expiración configurable
- Regeneración cuando sea necesario

### 🚀 Infraestructura Mejorada

#### 🔄 CI/CD con GitHub Actions
- Deploy automático en push a `main`
- **Fase 1 - Staging**: Deploy a puerto 3001 para pruebas
- **Fase 2 - Production**: Deploy a puerto 3000 tras validación
- Build optimizado sin caché
- Verificación automática de servicios

#### 🗄️ PostgreSQL 15
- Base de datos en producción y staging
- Backups automáticos diarios (9:00 AM)
- Scripts de migración
- Sincronización entre entornos

#### 📧 Sistema de Emails
- Gmail SMTP configurado
- Credenciales persistentes en servidor
- Envío de invitaciones automáticas
- Notificaciones a familias

### 🗂️ Nuevas Tablas de Base de Datos

- **familia**: Datos de familias registradas
- **familiar**: Información de familiares (padre/madre/tutor)
- **educando**: Scouts del grupo
- **familiar_educando**: Relación N:N
- **codigo_vinculacion_educando**: Códigos de vinculación
- **confirmaciones**: Confirmaciones de asistencia
- **galeria_fotos**: Fotos por sección
- **notificaciones_familia**: Notificaciones
- **documentos_familia**: Documentos compartidos

### 📱 Nuevas Rutas

#### Portal Familia
- `/familia/dashboard` - Dashboard principal
- `/familia/vinculacion` - Vincular educandos
- `/familia/calendario` - Calendario de actividades
- `/familia/galeria` - Galería privada
- `/familia/documentos` - Documentos
- `/familia/perfil` - Perfil familiar
- `/registro` - Registro de familias

#### Panel Admin
- `/admin/familiares` - Gestión de familias
- `/admin/familiares/estadisticas` - Estadísticas
- `/admin/educandos` - Gestión de educandos
- `/admin/educandos/import` - Importación masiva

---

## 📁 Estructura del Proyecto

```
osyris/
├── 🌐 Osyris-Web/              # Frontend Next.js 15
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (dashboard)/        # Rutas protegidas del dashboard
│   │   │   ├── scouts/         # Gestión de scouts
│   │   │   ├── activities/     # Planificación de actividades
│   │   │   ├── groups/         # Gestión de grupos scout
│   │   │   └── badges/         # Sistema de insignias
│   │   ├── auth/               # Autenticación
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Homepage
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── scouts/             # Componentes específicos de scouts
│   │   ├── forms/              # Formularios con React Hook Form
│   │   └── layout/             # Componentes de layout
│   ├── lib/                    # Utilidades y configuración
│   │   ├── utils.ts            # Utilidades generales
│   │   ├── api.ts              # Cliente API
│   │   └── types.ts            # Definiciones TypeScript
│   └── 🔧 api-osyris/          # Backend Express.js
│       ├── src/
│       │   ├── controllers/    # Controladores de API
│       │   ├── models/         # Modelos de datos
│       │   ├── routes/         # Rutas de API
│       │   ├── middleware/     # Middleware de autenticación
│       │   ├── services/       # Servicios (Google Drive, etc.)
│       │   └── utils/          # Utilidades del backend
│       ├── database/           # Archivos de base de datos
│       └── __tests__/          # Tests del backend
├── 🤖 .claude/                 # Configuración Claude Code IA
│   ├── agents/                 # Agentes especializados
│   │   ├── osyris-decision-orchestrator.md
│   │   ├── osyris-frontend-developer.md
│   │   ├── osyris-backend-developer.md
│   │   ├── osyris-ui-ux-analyzer.md
│   │   └── osyris-test-engineer.md
│   ├── commands/               # Comandos automatizados
│   │   ├── dev-start.md        # Inicio de desarrollo
│   │   ├── new-feature.md      # Creación de features
│   │   ├── smart-commit.md     # Commits inteligentes
│   │   ├── ui-analyze.md       # Análisis de UI
│   │   └── run-tests.md        # Suite de tests
│   ├── .mcp.json              # Configuración MCPs
│   └── settings.local.json     # Configuración y hooks
├── 🔧 scripts/                 # Scripts de automatización
│   ├── setup-dev.sh           # Setup completo de desarrollo
│   ├── clean.sh               # Limpieza de archivos temporales
│   ├── reset-dev.sh           # Reset completo del entorno
│   └── backup.sh              # Backup inteligente del proyecto
├── 📊 test-reports/            # Reportes de testing (generado)
├── 🎨 ui-analysis-*/           # Análisis de UI (generado)
├── 📦 package.json             # Scripts del proyecto root
└── 📖 README.md               # Este archivo
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js**: 18+ (recomendado 20+)
- **npm**: 9+ o **pnpm**: 8+
- **Git**: Para control de versiones
- **MySQL**: Opcional (se usa SQLite en desarrollo)

### Instalación Automática

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/osyris.git
cd osyris

# 2. Setup automático completo
./scripts/setup-dev.sh

# 3. Iniciar desarrollo con IA
/dev-start
```

### Instalación Manual

```bash
# Dependencias del proyecto
npm install

# Frontend
cd Osyris-Web
npm install

# Backend
cd api-osyris
npm install
cd ../..

# Playwright para E2E testing
npx playwright install

# Iniciar desarrollo
npm run dev
```

### URLs de Desarrollo
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

---

## 🎮 Flujo de Desarrollo

### 1. Crear Nueva Feature
```bash
# Usar comando inteligente
/new-feature

# O manualmente
git checkout -b feature/OSYR-123-scout-registration
```

### 2. Desarrollo con IA
```bash
# Iniciar agentes especializados según necesidad
# El Decision Orchestrator coordinará automáticamente

# Para UI/Frontend
claude-code task "Implementar formulario de registro de scout" --agent=osyris-frontend-developer

# Para Backend/API
claude-code task "Crear endpoint de registro con validación" --agent=osyris-backend-developer

# Para análisis de UI
/ui-analyze
```

### 3. Testing Continuo
```bash
# Suite completa
/run-tests

# Tests específicos
/run-tests unit          # Solo unitarios
/run-tests e2e           # Solo end-to-end
/run-tests performance   # Solo performance
```

### 4. Commits Inteligentes
```bash
# Análisis automático y conventional commits
/smart-commit

# O manualmente
git add .
git commit -m "feat(scout): add registration form with validation"
```

### 5. Análisis de Calidad
```bash
# Capturar y analizar interfaz
/ui-analyze

# Verificar cobertura y calidad
npm run lint
npm run type-check
```

---

## 🧪 Testing y Calidad

### Estrategia de Testing

#### Tests Unitarios
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **Cobertura**: Objetivo 80%+

#### Tests de Integración
- API endpoints con base de datos real
- Flujos de autenticación completos
- Integración frontend-backend

#### Tests E2E
- Playwright para simulación de usuario real
- Flujos críticos de gestión scout
- Testing cross-browser y responsive

#### Performance Testing
- Core Web Vitals monitoring
- Lighthouse audits automáticos
- Bundle size analysis

### Ejecutar Tests

```bash
# Suite completa con reportes
/run-tests

# Tests específicos
npm run test:frontend      # Solo frontend
npm run test:backend       # Solo backend
npm run test:e2e          # Solo E2E
npm run test:coverage     # Con análisis de cobertura
```

---

## 🎨 Análisis de UI/UX

### Capacidades de Análisis

#### Screenshots Automáticos
- Multi-dispositivo (móvil, tablet, desktop)
- Estados diferentes (loading, error, success)
- Comparación temporal

#### Métricas de Accesibilidad
- Cumplimiento WCAG 2.1 AA
- Contrast ratios automáticos
- Keyboard navigation testing

#### Performance Visual
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### Uso del Análisis

```bash
# Análisis completo
/ui-analyze

# Análisis específico
/ui-analyze --pages dashboard
/ui-analyze --compare-with previous-version
```

---

## 🔧 Scripts de Automatización

### Gestión del Entorno

```bash
# Setup completo de desarrollo
./scripts/setup-dev.sh

# Limpieza de archivos temporales
./scripts/clean.sh

# Reset completo del entorno
./scripts/reset-dev.sh

# Backup inteligente del proyecto
./scripts/backup.sh
```

### Scripts npm Disponibles

```bash
# Desarrollo
npm run dev                # Frontend + Backend en paralelo
npm run dev:frontend       # Solo frontend (puerto 3001)
npm run dev:backend        # Solo backend (puerto 3000)

# Build
npm run build              # Build completo
npm run build:frontend     # Solo frontend
npm run build:backend      # Solo backend

# Testing
npm run test               # Todos los tests
npm run test:unit          # Tests unitarios
npm run test:integration   # Tests de integración
npm run test:e2e          # Tests end-to-end
npm run test:watch         # Tests en modo watch

# Calidad
npm run lint               # Linting completo
npm run type-check         # Verificación de tipos
npm run format             # Formateo con Prettier

# Utilidades
npm run clean              # Limpieza básica
npm run reset              # Reset completo
npm run backup             # Backup del proyecto
```

---

## 🌐 API Reference

### Endpoints Principales

#### Autenticación
```http
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
```

#### Gestión de Scouts
```http
GET    /api/scouts              # Listar scouts
GET    /api/scouts/:id          # Obtener scout específico
POST   /api/scouts              # Crear nuevo scout
PUT    /api/scouts/:id          # Actualizar scout
DELETE /api/scouts/:id          # Eliminar scout
```

#### Gestión de Actividades
```http
GET    /api/activities          # Listar actividades
POST   /api/activities          # Crear actividad
PUT    /api/activities/:id      # Actualizar actividad
DELETE /api/activities/:id      # Eliminar actividad
```

#### Sistema de Insignias
```http
GET    /api/badges              # Listar insignias disponibles
POST   /api/scouts/:id/badges   # Asignar insignia a scout
GET    /api/scouts/:id/badges   # Obtener insignias del scout
```

### Documentación Completa
- **Swagger UI**: http://localhost:3000/api-docs
- **Postman Collection**: `docs/api/osyris-api.postman_collection.json`

---

## 🔐 Seguridad y Autenticación

### Implementación de Seguridad

#### JWT Authentication
- Tokens seguros con expiración configurable
- Refresh token mechanism
- Role-based access control

#### Validación de Datos
- Joi para validación de entrada
- Sanitización automática
- SQL injection prevention

#### Configuración Segura
- Variables de entorno para secrets
- CORS configurado apropiadamente
- Rate limiting en endpoints críticos

### Roles de Usuario
- **Coordinator**: Acceso completo al sistema
- **Leader**: Gestión de su grupo asignado
- **Assistant**: Acceso limitado de solo lectura
- **Scout**: Acceso a su perfil personal

---

## 🌍 Integración con Google Drive

### Funcionalidades
- **Upload de archivos**: Documentos y fotos de actividades
- **Organización automática**: Carpetas por grupo y actividad
- **Sincronización**: Backup automático de datos importantes
- **Compartir**: Enlaces seguros para padres y scouts

### Configuración
```env
# .env configuration
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token
```

---

## 📊 Monitoreo y Analytics

### Métricas Incluidas
- **Performance**: Core Web Vitals en tiempo real
- **Usage**: Páginas más visitadas y flujos de usuario
- **Errors**: Tracking automático de errores
- **API**: Métricas de respuesta y disponibilidad

### Herramientas
- **Lighthouse**: Auditorías automáticas de performance
- **Playwright**: Monitoreo visual de cambios
- **Error Tracking**: Logs estructurados con context

---

## 🚀 Deployment

### Ambientes Disponibles
- **Development**: Local con hot reload
- **Staging**: Preview de cambios pre-producción
- **Production**: Ambiente final para usuarios

### Configuración de Producción

#### Frontend (Next.js)
```bash
# Build optimizado
npm run build:frontend

# Variables de entorno
NEXT_PUBLIC_API_URL=https://api.osyris.com
NEXT_PUBLIC_ENV=production
```

#### Backend (Express.js)
```bash
# Configuración de producción
NODE_ENV=production
DB_HOST=production-mysql-host
JWT_SECRET=super-secure-secret
```

### Docker Support
```bash
# Build containers
docker-compose build

# Start production
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🤝 Contribución

### Guías de Contribución

#### Para Desarrolladores
1. **Fork** el repositorio
2. **Crear feature branch**: `/new-feature` o `git checkout -b feature/OSYR-123-nueva-funcionalidad`
3. **Desarrollar** siguiendo las convenciones establecidas
4. **Testing**: Ejecutar `/run-tests` antes de commit
5. **Commit**: Usar `/smart-commit` para conventional commits
6. **Pull Request**: Incluir descripción detallada y screenshots

#### Para UI/UX
1. **Analizar** interfaz actual con `/ui-analyze`
2. **Proponer** mejoras basadas en métricas
3. **Implementar** cambios siguiendo design system
4. **Validar** con tests de accesibilidad

#### Estándares de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Configuración extendida de Next.js
- **Prettier**: Formateo automático
- **Conventional Commits**: Para mensajes de commit
- **Testing**: Cobertura mínima 80%

### Code Review Process
1. **Automated checks**: Tests, lint, type-check
2. **Performance review**: Bundle size, Core Web Vitals
3. **Accessibility review**: WCAG compliance
4. **Security review**: Vulnerability scanning
5. **Manual review**: Code quality y arquitectura

---

## 🎯 Roadmap

### Versión 1.0 (Actual)
- ✅ Sistema básico de gestión de scouts
- ✅ Autenticación y autorización
- ✅ Dashboard administrativo
- ✅ Sistema de agentes IA
- ✅ Testing automatizado
- ✅ Análisis de UI automático

### Versión 1.1 (Q1 2025)
- 📋 Sistema avanzado de insignias y progresión
- 📱 Progressive Web App (PWA)
- 🔔 Sistema de notificaciones push
- 📊 Reportes y analytics avanzados
- 🌍 Integración completa con Google Workspace

### Versión 1.2 (Q2 2025)
- 🎪 Gestión de campamentos y eventos grandes
- 💰 Sistema de pagos integrado
- 📱 App móvil nativa (React Native)
- 🤖 IA para recomendaciones personalizadas
- 🔄 Sincronización offline

### Versión 2.0 (Q3 2025)
- 🌐 Multi-tenancy para múltiples grupos scout
- 🎮 Gamificación del sistema de progresión
- 📺 Streaming y videoconferencias integradas
- 🛡️ Cumplimiento total GDPR y protección de menores
- 🎨 Customización completa de branding

---

## 📞 Soporte y Contacto

### Desarrollo y Bugs
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/osyris/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/osyris/discussions)
- **Email**: desarrollo@osyris.scout

### Para el Grupo Scout
- **Manual de Usuario**: `docs/user-manual.md`
- **Videos Tutoriales**: [YouTube Channel](https://youtube.com/osyris-scout)
- **Soporte**: soporte@osyris.scout
- **WhatsApp**: +34 XXX XXX XXX

### Comunidad
- **Discord**: [Únete a nuestro Discord](https://discord.gg/osyris)
- **Telegram**: [Canal de Novedades](https://t.me/osyris_updates)

---

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia ISC - ver el archivo [LICENSE](LICENSE) para más detalles.

### Uso Comercial
Este software está disponible para uso por parte de grupos scout y organizaciones educativas sin fines de lucro. Para uso comercial, contactar con el equipo de desarrollo.

---

## 🙏 Agradecimientos

### Equipo de Desarrollo
- **Vicente Rivas Monferrer** - Lead Developer & IA Integration
- **Grupo Scout Osyris** - Product Owners & Testing
- **Claude AI** - Agentes especializados y automatización

### Tecnologías Open Source
- [Next.js](https://nextjs.org/) - Framework React de producción
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI modernos
- [Playwright](https://playwright.dev/) - Testing E2E confiable
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first

### Inspiración Scout
*"Estar preparado"* - Lema Scout que guía nuestro enfoque en automatización y calidad.

---

<div align="center">

**Hecho con ❤️ para el Grupo Scout Osyris**

[🌟 Star este proyecto](https://github.com/tu-usuario/osyris) • [🐛 Reportar Bug](https://github.com/tu-usuario/osyris/issues) • [💡 Sugerir Feature](https://github.com/tu-usuario/osyris/discussions)

**🏕️ Por el escultismo digital del futuro 🏕️**

</div>