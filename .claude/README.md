# 🏕️ OSYRIS SPECIALIZED AGENTS SYSTEM

## 📋 DIRECTORIO DE AGENTES

### 🚀 AGENTE MAESTRO
- **Archivo**: `/agents/MASTER-INITIALIZATION-PROMPT.md`
- **Función**: Coordinar e inicializar todos los agentes especializados
- **Uso**: Prompt único para activar sistema completo

### 🔧 AGENTES ESPECIALIZADOS

#### 1. 📁 FILE UPLOAD SPECIALIST
- **Archivo**: `/agents/file-upload-specialist.md`
- **Responsabilidad**: Flujo completo de subida de archivos
- **Alcance**: Frontend drag&drop → Backend multer → BD SQLite → Storage físico

#### 2. 👥 USER MANAGEMENT SPECIALIST
- **Archivo**: `/agents/user-management-specialist.md`
- **Responsabilidad**: Gestión completa de usuarios
- **Alcance**: Creación → Validación → Persistencia → Visualización en admin

#### 3. 📄 PAGE EDITOR SPECIALIST
- **Archivo**: `/agents/page-editor-specialist.md`
- **Responsabilidad**: Edición de páginas con vista previa
- **Alcance**: Selección → Modificación → Preview → Guardado → Landing

#### 4. 🗄️ DATABASE INTEGRATION SPECIALIST
- **Archivo**: `/agents/database-integration-specialist.md`
- **Responsabilidad**: Integridad de base de datos
- **Alcance**: Schemas → Conexiones → Transacciones → Optimización

---

## 🎯 PROBLEMAS CRÍTICOS IDENTIFICADOS

### ❌ PROBLEMA 1: Flujo de Subida de Archivos
- **Síntoma**: Subidas "falsas" o no persistentes
- **Causa**: Desconexión frontend-backend-storage
- **Agente**: File Upload Specialist

### ❌ PROBLEMA 2: Usuarios No Aparecen
- **Síntoma**: http://localhost:3000/admin/users vacío
- **Causa**: API calls incorrectas o problemas de rendering
- **Agente**: User Management Specialist

### ❌ PROBLEMA 3: Edición de Páginas Incompleta
- **Síntoma**: No hay flujo completo admin→landing
- **Causa**: Falta sistema de edición con vista previa
- **Agente**: Page Editor Specialist

### ❌ PROBLEMA 4: Integridad de Datos
- **Síntoma**: Inconsistencias frontend-backend-BD
- **Causa**: Validaciones y esquemas incorrectos
- **Agente**: Database Integration Specialist

---

## 🚀 QUICK START

### Método 1: Prompt Único (RECOMENDADO)
```
OSYRIS ADMIN CRISIS: Inicializar 4 agentes especializados en paralelo para reparar: (1) File Upload Specialist - arreglar subida real de archivos con persistencia BD, (2) User Management Specialist - solucionar por qué usuarios no aparecen en /admin/users, (3) Page Editor Specialist - implementar flujo completo edición→vista previa→guardado→landing, (4) Database Integration Specialist - validar integridad frontend-backend-SQLite. OBJETIVO: Admin funcional 100% con datos reales, sin mocks. Leer specs en .claude/agents/ y trabajar coordinadamente.
```

### Método 2: Activación Manual por Fases
```bash
# FASE 1: Diagnóstico
Task tool → Database Integration Specialist
Task tool → User Management Specialist
Task tool → File Upload Specialist
Task tool → Page Editor Specialist

# FASE 2: Coordinación
Trabajar según prioridades identificadas

# FASE 3: Testing integral
Verificar flujos completos end-to-end
```

---

## 📊 MÉTRICAS DE ÉXITO

### ✅ CRITERIOS DE FINALIZACIÓN
- [ ] Admin puede subir archivos y verlos inmediatamente en lista
- [ ] Admin puede crear usuarios y aparecen en /admin/users
- [ ] Admin puede editar páginas con vista previa funcional
- [ ] Cambios en admin se reflejan inmediatamente en landing
- [ ] Toda la información es real (BD SQLite), no mock data
- [ ] Flujo completo: login → editar → guardar → ver en web

### 🔍 TESTING CHECKLIST
- [ ] Upload de imagen PNG funciona 100%
- [ ] Creación de usuario aparece en lista admin
- [ ] Edición de página se guarda en BD
- [ ] Vista previa muestra cambios reales
- [ ] Landing refleja modificaciones hechas en admin
- [ ] No hay errores 404, 500, o conexión

---

## 🛠️ STACK TECNOLÓGICO

### Frontend (Next.js 15)
- React 19.1.1 con hooks
- Tailwind CSS + Shadcn/ui
- TypeScript 5.9.2
- Puerto: 3000

### Backend (Express.js)
- Node.js con Express 4.18.2
- Multer para uploads
- JWT + bcryptjs
- Puerto: 5000

### Database
- SQLite (desarrollo)
- Tablas: usuarios, paginas, documentos
- WAL mode para performance

### Storage
- Sistema de archivos local: `/uploads/`
- URLs públicas: `/uploads/{folder}/{file}`

---

## 📝 NOTAS DE DESARROLLO

### Comandos Útiles
```bash
# Iniciar sistema completo
./scripts/dev-start.sh

# Verificar base de datos
sqlite3 api-osyris/database/osyris.db ".tables"

# Testing API
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/usuarios

# Ver uploads
ls -la uploads/
```

### Directorios Críticos
- `/app/admin/` - Panel administrativo frontend
- `/api-osyris/src/` - Backend API
- `/uploads/` - Archivos subidos
- `/.claude/agents/` - Documentación de agentes

---

## 🔄 FLUJO DE TRABAJO RECOMENDADO

1. **Leer este README** para contexto completo
2. **Usar MASTER-INITIALIZATION-PROMPT** para activar agentes
3. **Trabajar en paralelo** con Task tool
4. **Documentar fixes** en archivos .claude/
5. **Testing continuo** durante desarrollo
6. **Validación final** con criterios de éxito

---

*Creado para optimizar el desarrollo del sistema Osyris Scout Management*