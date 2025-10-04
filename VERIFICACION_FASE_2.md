# 🔍 Verificación FASE 2 - Componentes de Edición Frontend

## ✅ Guía de Verificación Completa

### 1️⃣ Verificar Archivos Frontend Creados

#### Verificar Estructura de Directorios
```bash
# Desde el directorio raíz del proyecto
cd /home/vicente/RoadToDevOps/osyris/Osyris-Web

# Verificar que existen todos los archivos
ls -lh contexts/EditModeContext.tsx
ls -lh components/editable/EditableText.tsx
ls -lh components/editable/EditableImage.tsx
ls -lh components/editable/EditToolbar.tsx
ls -lh components/editable/EditModeToggle.tsx
ls -lh components/editable/index.ts
```

**Archivos esperados:**
- ✅ `contexts/EditModeContext.tsx` - Context global para modo edición
- ✅ `components/editable/EditableText.tsx` - Edición inline de texto
- ✅ `components/editable/EditableImage.tsx` - Upload de imágenes
- ✅ `components/editable/EditToolbar.tsx` - Barra de herramientas flotante
- ✅ `components/editable/EditModeToggle.tsx` - Botón de activación
- ✅ `components/editable/index.ts` - Exportaciones centralizadas

---

### 2️⃣ Verificar Integración en Layout

```bash
# Ver que EditModeProvider está integrado en layout.tsx
grep -A 5 "EditModeProvider" app/layout.tsx

# Ver que EditToolbar y EditModeToggle están incluidos
grep "EditToolbar\|EditModeToggle" app/layout.tsx

# Debería mostrar:
# import { EditModeProvider } from "@/contexts/EditModeContext"
# import { EditToolbar, EditModeToggle } from "@/components/editable"
# ...
# <EditModeProvider>
#   {children}
#   <EditModeToggle />
#   <EditToolbar />
# </EditModeProvider>
```

---

### 3️⃣ Verificar Exportaciones Centralizadas

```bash
# Ver exportaciones del módulo editable
cat components/editable/index.ts
```

**Exportaciones esperadas:**
```typescript
export { EditableText } from './EditableText';
export { EditableImage } from './EditableImage';
export { EditToolbar } from './EditToolbar';
export { EditModeToggle } from './EditModeToggle';
```

---

### 4️⃣ Verificar Compilación TypeScript

```bash
# Compilar el proyecto para verificar que no hay errores de TypeScript
npm run build

# O solo verificar tipos sin hacer build completo
npx tsc --noEmit
```

**Resultado esperado:**
- Sin errores de compilación
- Todas las interfaces y tipos correctamente definidos
- Imports resueltos correctamente

---

### 5️⃣ Probar Componentes en el Navegador

#### Paso 1: Iniciar el Servidor de Desarrollo

```bash
# Si no está corriendo, iniciar servidor
./scripts/dev-start.sh
```

Espera a que arranquen los servicios:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

#### Paso 2: Hacer Login con Usuario Admin

1. Abre el navegador en: http://localhost:3000/login
2. Usa las credenciales:
   - **Email:** admin@osyris.com
   - **Password:** Admin123!
3. Deberías ser redirigido al dashboard

#### Paso 3: Verificar Botón de Modo Edición

1. Una vez logueado, busca en la esquina superior derecha
2. Debería aparecer un botón flotante con:
   - Icono de lápiz (Edit3) cuando está inactivo
   - Texto "Editar Página" (en desktop)
   - Solo icono en móvil

**¿No ves el botón?**
- Verifica que el usuario tiene rol 'admin' o 'editor'
- Abre la consola del navegador (F12) y busca errores
- Revisa que useAuth está funcionando correctamente

#### Paso 4: Activar Modo Edición

1. Haz click en el botón "Editar Página"
2. El botón debería cambiar a:
   - Icono de ojo (Eye)
   - Texto "Vista Normal"
   - Borde azul
   - Punto pulsante azul
3. En la consola debería aparecer: `🔧 Modo edición: ACTIVADO`

#### Paso 5: Verificar Toolbar Flotante

Cuando actives el modo edición, debería aparecer en la parte inferior de la pantalla:

- **Barra flotante** centrada con:
  - Punto azul pulsante + "Modo Edición"
  - Separador vertical
  - Info icon + "Sin cambios" (inicialmente)
  - Separador vertical
  - Botón "Guardar" (deshabilitado)
  - Botón "Descartar" (deshabilitado)

---

### 6️⃣ Probar Edición de Texto (EditableText)

Para probar este componente, necesitas **refactorizar una página existente** para usar `<EditableText>`.

#### Ejemplo: Editar el Título de Contacto

```typescript
// En app/contacto/page.tsx (o cualquier página)
import { EditableText } from '@/components/editable';

// Reemplaza un título estático:
// <h1>Contacto</h1>

// Por un EditableText:
<EditableText
  contentId={1}
  identificador="contacto-titulo"
  seccion="contacto"
  as="h1"
  className="text-4xl font-bold"
>
  Contacto
</EditableText>
```

#### Probar Edición:

1. Activa el modo edición
2. Pasa el mouse sobre el texto
   - Debería aparecer borde azul punteado
   - Cursor de puntero
3. Haz click en el texto
   - Debería aparecer un input/textarea
   - El texto debería estar seleccionado
4. Edita el texto
5. Presiona **Enter** o click fuera para guardar
6. El toolbar debería mostrar: "1 cambio pendiente"
7. Botón "Guardar" debería habilitarse (verde)

---

### 7️⃣ Probar Upload de Imágenes (EditableImage)

Para probar este componente, reemplaza una imagen estática por `<EditableImage>`.

#### Ejemplo: Editar Logo o Hero Image

```typescript
import { EditableImage } from '@/components/editable';

// Reemplaza:
// <img src="/images/hero.jpg" alt="Hero" />

// Por:
<EditableImage
  contentId={2}
  identificador="hero-image"
  seccion="home"
  src="/images/hero.jpg"
  alt="Hero Image"
  className="w-full h-96 object-cover"
  width={1200}
  height={400}
  maxSize={5}
/>
```

#### Probar Upload:

1. Activa el modo edición
2. Pasa el mouse sobre la imagen
   - Debería aparecer overlay negro semi-transparente
   - Icono de upload
   - Texto "Cambiar imagen"
3. Haz click en la imagen
4. Selecciona un archivo de imagen (JPG, PNG, WebP, SVG)
5. La imagen debería:
   - Mostrar preview inmediato
   - Aparecer badge azul "Nueva imagen" con botón X
   - Añadirse a cambios pendientes
6. El toolbar debería mostrar: "1 cambio pendiente"

**Validaciones automáticas:**
- Tipo de archivo: solo imágenes permitidas
- Tamaño máximo: 5MB (configurable)
- Si falla, muestra error en rojo

---

### 8️⃣ Probar Guardar Cambios

#### Escenario Completo:

1. Activa modo edición
2. Edita 2-3 textos
3. Cambia 1 imagen
4. El toolbar debería mostrar: "3 cambios pendientes" o "4 cambios pendientes"
5. Haz click en **"Guardar"**
6. Debería:
   - Mostrar "Guardando..." con spinner
   - Hacer peticiones PUT a `/api/content/{id}`
   - Mostrar notificación verde: "Cambios guardados exitosamente"
   - Limpiar los cambios pendientes
   - Toolbar vuelve a "Sin cambios"

#### Verificar en la Consola del Navegador:

```
✅ 3 cambios guardados exitosamente
```

#### Verificar en la Base de Datos:

```bash
# Conectar a PostgreSQL
docker exec -it osyris-db psql -U osyris_user -d osyris_db

# Ver versiones actualizadas
SELECT id, identificador, version, fecha_modificacion
FROM contenido_editable
WHERE id IN (1, 2, 3)
ORDER BY fecha_modificacion DESC;

# Ver historial de cambios
SELECT contenido_id, version, accion, fecha_cambio
FROM contenido_historial
ORDER BY fecha_cambio DESC
LIMIT 10;
```

---

### 9️⃣ Probar Descartar Cambios

1. Activa modo edición
2. Edita algunos textos
3. El toolbar muestra cambios pendientes
4. Haz click en **"Descartar"**
5. Aparece confirmación: "¿Estás seguro de que quieres descartar todos los cambios?"
6. Click "Aceptar"
7. Los cambios deberían:
   - Limpiarse de la memoria
   - Toolbar vuelve a "Sin cambios"
   - Los textos vuelven al valor original

---

### 🔟 Probar Advertencia de Cambios Sin Guardar

1. Activa modo edición
2. Edita algún texto (no guardes)
3. Intenta:
   - Cerrar la pestaña
   - Recargar la página (F5)
   - Navegar a otra URL
4. Debería aparecer advertencia del navegador:
   ```
   Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?
   ```

---

### 1️⃣1️⃣ Verificar Permisos y Roles

#### Test con Usuario NO Autorizado:

1. Cierra sesión
2. Haz login con un usuario 'scouter' (NO admin/editor)
3. El botón "Editar Página" **NO debería aparecer**
4. Los componentes EditableText e EditableImage deberían renderizarse como elementos estáticos normales

#### Test con Usuario Admin:

- ✅ Botón "Editar Página" visible
- ✅ Puede activar modo edición
- ✅ Puede editar texto
- ✅ Puede subir imágenes
- ✅ Puede guardar cambios

#### Test con Usuario Editor (si existe):

- ✅ Mismo comportamiento que admin
- ✅ Todos los permisos de edición

---

### 1️⃣2️⃣ Verificar API Integration

#### Test Manual con cURL:

```bash
# 1. Hacer login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@osyris.com",
    "password": "Admin123!"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

echo "Token obtenido: ${TOKEN}"

# 2. Actualizar contenido (simulando lo que hace el componente)
curl -X PUT http://localhost:5000/api/content/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "tipo": "texto",
    "contenido": "Texto editado desde frontend",
    "metadata": {}
  }' | python3 -m json.tool

# Debería retornar:
# {
#   "success": true,
#   "message": "Contenido actualizado correctamente",
#   "newVersion": 3
# }

# 3. Upload de imagen (simulando EditableImage)
curl -X POST http://localhost:5000/api/content/upload \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "image=@/path/to/test-image.jpg"

# Debería retornar:
# {
#   "success": true,
#   "url": "/uploads/1234567890-image.jpg",
#   "filename": "1234567890-image.jpg",
#   "mimetype": "image/jpeg",
#   "size": 123456
# }
```

---

### 1️⃣3️⃣ Verificar Estado de Git

```bash
# Ver rama actual
git branch --show-current
# Debería mostrar: feature/live-content-editor

# Ver último commit
git log --oneline -1
# Debería mostrar: 7a20cd4 feat: FASE 2 - Sistema de edición en vivo (Frontend)

# Ver archivos en el último commit
git show --name-only --oneline HEAD

# Debería mostrar:
# contexts/EditModeContext.tsx
# components/editable/EditableText.tsx
# components/editable/EditableImage.tsx
# components/editable/EditToolbar.tsx
# components/editable/EditModeToggle.tsx
# components/editable/index.ts
# app/layout.tsx

# Ver diferencias con main
git diff main --stat
```

---

### 1️⃣4️⃣ Verificar Consola del Navegador

Abre DevTools (F12) y verifica que NO hay errores.

**Logs esperados (en modo desarrollo):**

```
🔧 Modo edición: ACTIVADO
```

Cuando guardas cambios:
```
✅ 3 cambios guardados exitosamente
```

Cuando descartas:
```
Cambios descartados
```

**Errores comunes a vigilar:**
- ❌ `useEditMode debe ser usado dentro de un EditModeProvider` → Layout mal configurado
- ❌ `Cannot read properties of undefined (reading 'token')` → Usuario no logueado
- ❌ `404 Not Found /api/content/...` → Backend no está corriendo
- ❌ `403 Forbidden` → Usuario no tiene permisos (rol incorrecto)

---

## 📊 Checklist de Verificación

### Archivos Frontend
- [ ] `contexts/EditModeContext.tsx` existe
- [ ] `components/editable/EditableText.tsx` existe
- [ ] `components/editable/EditableImage.tsx` existe
- [ ] `components/editable/EditToolbar.tsx` existe
- [ ] `components/editable/EditModeToggle.tsx` existe
- [ ] `components/editable/index.ts` existe con exportaciones correctas

### Integración
- [ ] `app/layout.tsx` incluye `EditModeProvider`
- [ ] `app/layout.tsx` incluye `<EditToolbar />`
- [ ] `app/layout.tsx` incluye `<EditModeToggle />`
- [ ] No hay errores de compilación TypeScript

### Funcionalidad en Navegador
- [ ] Login con admin@osyris.com funciona
- [ ] Botón "Editar Página" aparece para admin
- [ ] Botón NO aparece para usuarios sin permisos
- [ ] Click en botón activa modo edición
- [ ] Toolbar flotante aparece al activar modo edición
- [ ] EditableText permite edición inline
- [ ] EditableImage permite upload
- [ ] Cambios se añaden a pendingChanges
- [ ] Botón "Guardar" envía peticiones al backend
- [ ] Notificación de éxito aparece al guardar
- [ ] Botón "Descartar" limpia los cambios
- [ ] Advertencia de cambios sin guardar funciona

### API Integration
- [ ] Backend corriendo en localhost:5000
- [ ] PUT `/api/content/:id` funciona con autenticación
- [ ] POST `/api/content/upload` funciona
- [ ] Tokens JWT válidos
- [ ] Versionado automático en base de datos

### Git
- [ ] Branch `feature/live-content-editor` activa
- [ ] Commit de FASE 2 realizado
- [ ] Todos los archivos añadidos al commit

---

## 🚀 Siguiente Paso

Una vez verificado todo, puedes proceder a la **FASE 3** que incluye:
- Refactorizar páginas existentes para usar EditableText y EditableImage
- Implementar EditableList para listas dinámicas
- Crear página de ejemplo completamente editable (ej: Contacto)
- Probar edición en vivo en producción (staging)

---

## ⚠️ Notas Importantes

1. **Los componentes son client components** - Todos usan `"use client"` por necesitar hooks
2. **EditModeProvider debe envolver toda la app** - Va en el layout raíz
3. **Se requiere autenticación** - Usuario debe tener rol admin o editor
4. **Cambios son pendientes hasta guardar** - Se almacenan en memoria (Map)
5. **Advertencia de cambios sin guardar** - beforeunload protege contra pérdida de datos

---

## 🐛 Solución de Problemas

### El botón "Editar Página" no aparece

```bash
# 1. Verifica que el usuario tiene permisos
docker exec -it osyris-db psql -U osyris_user -d osyris_db -c "
  SELECT email, rol FROM usuarios WHERE email = 'admin@osyris.com';
"
# Debería mostrar rol = 'admin'

# 2. Verifica en la consola del navegador
# Debería ver: user = { rol: 'admin', ... }

# 3. Verifica que useAuth funciona
# Añade console.log en EditModeToggle:
# console.log('canEdit:', canEdit, 'user:', user);
```

### Error: "useEditMode debe ser usado dentro de un EditModeProvider"

```bash
# Verifica que app/layout.tsx tiene el Provider
grep -A 10 "EditModeProvider" app/layout.tsx

# Debería envolver {children}
# <EditModeProvider>
#   {children}
# </EditModeProvider>
```

### El toolbar no muestra cambios pendientes

```typescript
// En la consola del navegador:
// Verifica el contexto manualmente
const { pendingChanges } = useEditMode();
console.log('Pending changes:', pendingChanges);
console.log('Size:', pendingChanges.size);

// Verifica que addPendingChange se llama
// Añade console.log en EditableText handleSave:
console.log('Adding pending change:', change);
```

### Error al guardar: 401 Unauthorized

```bash
# Verifica que el token es válido
# En la consola del navegador:
console.log('Token:', localStorage.getItem('token'));

# Haz login de nuevo
# El token expira después de 24 horas
```

### Error al subir imagen: 500 Internal Server Error

```bash
# Verifica logs del backend
# En la terminal donde corre ./scripts/dev-start.sh
# Busca errores relacionados con multer o upload

# Verifica que el directorio uploads existe
ls -la api-osyris/uploads/

# Si no existe, créalo:
mkdir -p api-osyris/uploads
```

### La imagen no se muestra después de subir

```bash
# 1. Verifica que la imagen se subió
ls -lh api-osyris/uploads/

# 2. Verifica la URL devuelta por el backend
# En Network tab del navegador, busca la respuesta de /upload
# Debería retornar: { url: '/uploads/filename.jpg' }

# 3. Verifica que Express.js sirve archivos estáticos
grep "express.static.*uploads" api-osyris/src/index.js

# Debería mostrar:
# app.use('/uploads', express.static('uploads'));
```

### El servidor no compila (errores TypeScript)

```bash
# Ver errores específicos
npx tsc --noEmit

# Problemas comunes:
# - Falta type PendingChange en EditModeContext
# - Imports incorrectos de @/components/editable
# - Tipo de user en useAuth no incluye 'rol'

# Limpiar y reconstruir
npm run clean
npm install
npm run build
```

---

## 🎯 Resumen Visual de Funcionalidad

```
┌─────────────────────────────────────────────────────────┐
│  🏕️ Osyris Scout Management                            │
│                                       [👤 Admin ▼]      │
│                                       [✏️ Editar]   ← Botón Toggle
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  Bienvenido a Osyris  ← EditableText        │       │
│  │  (hover → borde azul punteado)              │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  [Imagen Hero]  ← EditableImage             │       │
│  │  (hover → overlay "Cambiar imagen")         │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↓
                   (Usuario edita)
                           ↓
┌──────────────────────────────────────────────────────────┐
│                    Toolbar Flotante                      │
│  [●] Modo Edición | ⚠️ 2 cambios pendientes |           │
│                      [💾 Guardar] [❌ Descartar]         │
└──────────────────────────────────────────────────────────┘
                           ↓
                   (Usuario guarda)
                           ↓
               [✅ Cambios guardados]
                           ↓
               PUT /api/content/1
               PUT /api/content/2
                           ↓
                  PostgreSQL updated
                  Version +1
                  History saved
```

---

**¿Preguntas?** Revisa este documento paso a paso y comprueba cada sección. Si encuentras algún problema, consulta la sección de Solución de Problemas.
