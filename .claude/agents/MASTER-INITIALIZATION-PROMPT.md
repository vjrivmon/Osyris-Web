# 🚀 MASTER AGENT INITIALIZATION PROMPT

## 🎯 OBJETIVO PRINCIPAL
Inicializar todos los agentes especializados de forma coordinada para resolver los problemas críticos del admin panel de Osyris de manera sistemática y eficiente.

---

## 📋 PROMPT MAESTRO PARA CLAUDE

```
CONTEXTO: Sistema Osyris Scout Management con problemas críticos en admin panel que requieren especialistas coordinados.

TAREA CRÍTICA: Inicializar 4 agentes especializados para resolver:
1. Subida de archivos no funciona correctamente
2. Usuarios creados no aparecen en /admin/users
3. Flujo completo de edición de páginas roto
4. Problemas de integración entre frontend-backend-database

INSTRUCCIONES DE INICIALIZACIÓN:

🔧 AGENTE 1: FILE UPLOAD SPECIALIST
- Leer archivo: /home/vicente/RoadToDevOps/osyris/Osyris-Web/.claude/agents/file-upload-specialist.md
- FOCO: Reparar flujo completo de subida de archivos
- DEBUGGING: Verificar que uploads se guarden físicamente en /uploads/ y metadata en BD
- TEST: Subir archivo real y verificar persistencia en admin panel

🔧 AGENTE 2: USER MANAGEMENT SPECIALIST
- Leer archivo: /home/vicente/RoadToDevOps/osyris/Osyris-Web/.claude/agents/user-management-specialist.md
- FOCO: Solucionar por qué usuarios no aparecen en http://localhost:3000/admin/users
- DEBUGGING: Verificar API calls, token auth, y rendering de datos reales
- TEST: Crear usuario y verificar que aparezca inmediatamente en la interfaz

🔧 AGENTE 3: PAGE EDITOR SPECIALIST
- Leer archivo: /home/vicente/RoadToDevOps/osyris/Osyris-Web/.claude/agents/page-editor-specialist.md
- FOCO: Implementar flujo completo: admin selecciona→modifica→previsualiza→guarda→ve cambios en landing
- DEBUGGING: Crear interfaz de edición con vista previa real
- TEST: Modificar una página y verificar cambios en la landing

🔧 AGENTE 4: DATABASE INTEGRATION SPECIALIST
- Leer archivo: /home/vicente/RoadToDevOps/osyris/Osyris-Web/.claude/agents/database-integration-specialist.md
- FOCO: Asegurar integridad total entre frontend-backend-SQLite
- DEBUGGING: Validar schemas, conexiones, y transacciones
- TEST: Verificar que todos los CRUD operations sean persistentes

COORDINACIÓN ENTRE AGENTES:
- Trabajar en paralelo usando Task tool con múltiples agentes
- Cada agente debe reportar hallazgos específicos de su área
- Priorizar problemas que afecten a múltiples agentes
- Documentar todas las correcciones en archivos .claude/

CRITERIOS DE ÉXITO:
✅ Admin puede subir archivos y verlos en la lista inmediatamente
✅ Admin puede crear usuarios y aparecen en /admin/users
✅ Admin puede editar páginas con vista previa y ver cambios en landing
✅ Todas las operaciones persisten correctamente en SQLite
✅ No hay mock data - todo es integración real

COMANDO DE EJECUCIÓN:
Ejecutar todos los agentes con: ./scripts/dev-start.sh && <activar 4 agentes en paralelo>
```

---

## 🔥 PROMPT OPTIMIZADO DE UNA LÍNEA

Para máxima eficiencia, usa este comando único:

```
OSYRIS ADMIN CRISIS: Inicializar 4 agentes especializados en paralelo para reparar: (1) File Upload Specialist - arreglar subida real de archivos con persistencia BD, (2) User Management Specialist - solucionar por qué usuarios no aparecen en /admin/users, (3) Page Editor Specialist - implementar flujo completo edición→vista previa→guardado→landing, (4) Database Integration Specialist - validar integridad frontend-backend-SQLite. OBJETIVO: Admin funcional 100% con datos reales, sin mocks. Leer specs en .claude/agents/ y trabajar coordinadamente.
```

---

## 🎯 SECUENCIA DE ACTIVACIÓN RECOMENDADA

### FASE 1: DIAGNÓSTICO (5 minutos)
```bash
Task tool → 4 agentes en paralelo para análisis inicial
- Cada agente identifica problemas específicos de su área
- Reportar hallazgos críticos inmediatamente
```

### FASE 2: REPARACIÓN (15 minutos)
```bash
Trabajo coordinado basado en prioridades:
1. Database Integration (base para todos)
2. User Management + File Upload (paralelo)
3. Page Editor (depende de los anteriores)
```

### FASE 3: TESTING (10 minutos)
```bash
Testing integral de flujos completos:
- Upload de archivo real → verificar en BD
- Creación de usuario → verificar en /admin/users
- Edición de página → verificar en landing
- Validación de persistencia de datos
```

### FASE 4: OPTIMIZACIÓN (5 minutos)
```bash
Refinamiento final:
- Performance tuning
- UX improvements
- Error handling robustness
```

---

## 🔧 COMANDOS DE SOPORTE

```bash
# Verificar estado del sistema
./scripts/dev-start.sh

# Verificar base de datos
sqlite3 api-osyris/database/osyris.db ".tables"

# Testing endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/usuarios
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/uploads
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/paginas

# Verificar archivos físicos
ls -la uploads/
```

## 💡 TIPS DE OPTIMIZACIÓN
- Usar Task tool para paralelización máxima
- Documentar cada fix en .claude/ para persistencia
- Priorizar problemas que bloqueen otros agentes
- Testing continuo durante desarrollo, no al final