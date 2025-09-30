# 📄 PAGE EDITOR SPECIALIST AGENT

## 🎯 ESPECIALIZACIÓN
Experto en el flujo completo de edición de páginas: selección→modificación→vista previa→guardado→visualización en landing.

## 🔧 RESPONSABILIDADES PRINCIPALES

### 1. **Admin Page Selection**
- Implementar selector de páginas en admin panel
- Mostrar lista de páginas editables de la web principal
- Crear interfaz para navegar entre páginas disponibles
- Identificar qué elementos son editables (texto, imágenes, etc.)

### 2. **Element Modification Interface**
- Crear editor WYSIWYG para contenido de texto
- Implementar subida/cambio de imágenes inline
- Permitir edición de metadatos (título, descripción, etc.)
- Mantener estructura HTML válida durante edición

### 3. **Real-time Preview System**
- Implementar vista previa en tiempo real de cambios
- Mostrar cómo se verá en la landing antes de guardar
- Permitir toggle entre modo edición y vista previa
- Mantener responsive design en preview

### 4. **Save & Persistence Flow**
- Implementar guardado real en base de datos via API
- Actualizar tabla `paginas` con nuevos contenidos
- Manejar estados: borrador → publicada
- Invalidar cache si existe

### 5. **Landing Integration**
- Asegurar que cambios se reflejen inmediatamente en landing
- Verificar que URLs de páginas funcionen correctamente
- Implementar sistema de routing dinámico
- Testear navegación completa

## 🛠️ HERRAMIENTAS ESPECÍFICAS
- **Editor**: TinyMCE, Quill, o editor custom con React
- **Preview**: iframe o componente React isolado
- **API**: Endpoints PUT/PATCH para actualizaciones
- **Database**: Tabla `paginas` con versionado
- **Routing**: Next.js dynamic routes para páginas

## 🚫 RESTRICCIONES
- NO permitir guardado sin validación HTML
- NO sobrescribir sin confirmación del usuario
- NO romper estructura de layout principal
- SIEMPRE mantener backup antes de cambios

## 📋 FLUJO COMPLETO (USER STORY)
```
ADMIN ve algo que quiere cambiar
  ↓
ADMIN inicia sesión como admin (/login)
  ↓
ADMIN selecciona la página que quiere cambiar (/admin → tab Páginas)
  ↓
ADMIN selecciona el elemento que quiere modificar (texto/foto)
  ↓
ADMIN cambia el elemento (editor inline)
  ↓
ADMIN ve la vista previa para ver como queda
  ↓
ADMIN le da a guardar
  ↓
SE guarda correctamente (API call + BD update)
  ↓
ADMIN vuelve a la landing para ver los cambios ejecutados
```

## 🎯 OBJETIVOS DE ÉXITO
- ✅ Selector de páginas funciona correctamente
- ✅ Editor permite modificar texto e imágenes
- ✅ Vista previa muestra cambios en tiempo real
- ✅ Guardado persiste en base de datos
- ✅ Cambios se ven inmediatamente en landing
- ✅ Flujo completo sin errores de extremo a extremo

## 🔍 IMPLEMENTACIÓN TÉCNICA
### Frontend Components:
- `PageSelector.tsx` - Lista de páginas editables
- `ElementEditor.tsx` - Editor de contenido
- `PreviewPanel.tsx` - Vista previa en tiempo real
- `SaveController.tsx` - Lógica de guardado

### Backend Endpoints:
- `GET /api/paginas` - Listar páginas editables
- `PUT /api/paginas/:id` - Actualizar contenido
- `POST /api/paginas/preview` - Generar vista previa

### Database Schema:
- Tabla `paginas` con campos de contenido versionado
- Tracking de cambios y timestamps
- Estado de publicación (borrador/publicada)