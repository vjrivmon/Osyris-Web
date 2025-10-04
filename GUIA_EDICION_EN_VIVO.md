# 🎨 Guía de Uso: Sistema de Edición en Vivo

## 📋 Sistemas del Proyecto (Separados)

Tu proyecto Osyris ahora tiene **3 sistemas diferentes** que funcionan de forma **independiente**:

| Sistema | URL | ¿Qué hace? | ¿Quién lo usa? |
|---------|-----|------------|----------------|
| **🏠 Páginas Públicas** | `/`, `/secciones/*`, `/contacto` | Contenido público del sitio web | Visitantes + Editores |
| **✏️ Edición en Vivo** | Botón flotante en páginas públicas | Editar contenido directamente en la página | Solo admin/editor |
| **🔧 CMS Legacy** | `/admin/*` | Panel tradicional (Archivos, Usuarios, etc.) | Solo admin |
| **📚 Aula Virtual** | `/aula-virtual/*` | Dashboard de usuario/kraal | Todos los usuarios autenticados |

---

## ✅ Cómo Usar la Edición en Vivo (NUEVO)

### Paso 1: Hacer Login
```
1. Ve a: http://localhost:3000/login
2. Usa: admin@osyris.com / Admin123!
3. Serás redirigido a /aula-virtual
```

### Paso 2: Navegar a una Página Pública
**IMPORTANTE**: El botón de edición NO aparece en `/admin` ni `/aula-virtual`.

Navega a alguna de estas páginas:
- **Home**: http://localhost:3000
- **Castores**: http://localhost:3000/secciones/castores
- **Contacto**: http://localhost:3000/contacto
- **Cualquier sección**: /secciones/manada, /secciones/tropa, etc.

### Paso 3: Buscar el Botón "Editar Página"
Busca en la **esquina superior derecha** de la página:

```
┌────────────────────────────────────────────────┐
│                                  [🌙] [✏️ Editar Página] │
│                                                │
│                                                │
│         Tu Página Pública Aquí                 │
│                                                │
└────────────────────────────────────────────────┘
```

**El botón es:**
- ✏️ Icono de lápiz
- Texto "Editar Página" (solo en desktop)
- Color blanco con borde gris
- **Position: fixed** (siempre visible al hacer scroll)
- **z-index: 9999** (siempre en primer plano)

### Paso 4: Activar Modo Edición
Haz click en el botón "✏️ Editar Página".

Deberías ver:
1. **Botón cambia a:**
   - 👁️ Icono de ojo
   - Texto "Vista Normal"
   - Borde azul
   - Punto azul pulsante

2. **Toolbar aparece en la parte inferior:**

```
┌────────────────────────────────────────────────────────┐
│                   Tu Página                             │
│                                                         │
│                                                         │
└────────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────────────┐
    │ [●] Modo Edición │ ⚠️ Sin cambios │          │
    │                   [💾 Guardar] [❌ Descartar] │
    └──────────────────────────────────────────────┘
```

### Paso 5: Editar Contenido (Próximamente)
**NOTA**: En FASE 2 actual, los componentes EditableText y EditableImage existen pero NO están integrados en las páginas.

Para la **FASE 3**, refactorizaremos páginas para usar:
```tsx
<EditableText
  contentId={1}
  identificador="hero-title"
  seccion="home"
  as="h1"
>
  Grupo Scout Osyris
</EditableText>
```

---

## 🐛 Solución de Problemas

### ❌ "No veo el botón 'Editar Página'"

**Verificar:**

1. **¿Estás en una página pública?**
   - ✅ SÍ: `/`, `/secciones/castores`, `/contacto`
   - ❌ NO: `/admin`, `/aula-virtual`

2. **¿Estás logueado como admin?**
   ```bash
   # Abre la consola del navegador (F12)
   # Ejecuta:
   console.log(localStorage.getItem('token'))
   # Debería mostrar un token JWT largo
   ```

3. **¿El usuario tiene rol admin o editor?**
   ```bash
   # En la consola del navegador:
   console.log(JSON.parse(localStorage.getItem('osyris_user')))
   # Debería mostrar: { rol: 'admin', ... }
   ```

4. **¿El componente se está renderizando?**
   ```bash
   # En la consola del navegador (React DevTools):
   # Busca: <EditModeToggle />
   # Debería estar en el árbol de componentes
   ```

### ❌ "El botón está oculto detrás de otro elemento"

**Solución aplicada:**
- EditModeToggle: `z-index: 9999`
- EditToolbar: `z-index: 9999`

Si sigue oculto, verifica que no haya elementos con z-index superior a 9999.

### ❌ "Hago click pero no pasa nada"

**Verificar en consola del navegador (F12):**
```javascript
// Debería ver estos logs:
🔧 Modo edición: ACTIVADO
```

Si no aparecen, hay un error. Busca errores en rojo en la consola.

---

## 📊 Diferencias: CMS Legacy vs Edición en Vivo

| Característica | CMS Legacy (`/admin`) | Edición en Vivo (Nuevo) |
|----------------|----------------------|-------------------------|
| **Interfaz** | Panel con tabs | Botón flotante en página |
| **Edición** | En textarea separado | Directamente en la página (WYSIWYG) |
| **Vista previa** | Requiere cambiar de tab | Vista en tiempo real |
| **UX** | Tradicional | Moderna, intuitiva |
| **Autosave** | No | Sí (pendingChanges Map) |
| **Versiones** | Sí (en BD) | Sí (en BD) |
| **Imágenes** | Upload desde panel | Upload inline |
| **Rutas** | `/admin/pages` | `/` + botón flotante |

---

## 🎯 Próximos Pasos (FASE 3)

Para **completar** el sistema de edición en vivo:

### 1. Refactorizar Página de Ejemplo
```bash
# Editar: app/page.tsx o app/contacto/page.tsx
# Reemplazar texto estático por EditableText
```

### 2. Ejemplo de Refactorización
**Antes:**
```tsx
<h1 className="text-4xl font-bold">
  Grupo Scout Osyris
</h1>
```

**Después:**
```tsx
<EditableText
  contentId={1}
  identificador="hero-title"
  seccion="home"
  as="h1"
  className="text-4xl font-bold"
>
  Grupo Scout Osyris
</EditableText>
```

### 3. Crear EditableList
Para listas dinámicas (actividades, testimonios, etc.)

### 4. Probar End-to-End
- Editar texto
- Subir imagen
- Guardar cambios
- Verificar en base de datos
- Ver historial de versiones

---

## 🔍 Debug: Verificar Estado del Sistema

### Backend API
```bash
# Verificar que el backend está corriendo
curl http://localhost:5000/api/content/page/castores | jq

# Debería retornar:
# {
#   "success": true,
#   "seccion": "castores",
#   "content": { ... },
#   "total": 13
# }
```

### Frontend React
```bash
# Abrir DevTools (F12) > Console
# Verificar que EditModeProvider está activo:

import { useEditMode } from '@/contexts/EditModeContext'
const { canEdit, isEditMode } = useEditMode()
console.log({ canEdit, isEditMode })

# Debería mostrar:
# { canEdit: true, isEditMode: false }  (si eres admin)
```

### Base de Datos
```bash
# Conectar a PostgreSQL
docker exec -it osyris-db psql -U osyris_user -d osyris_db

# Ver contenido migrado
SELECT seccion, COUNT(*) FROM contenido_editable GROUP BY seccion;

# Debería mostrar:
# seccion   | count
#-----------+-------
# castores  |    13
# manada    |    13
# tropa     |    13
# pioneros  |    13
# rutas     |    13
```

---

## 📞 Soporte

Si el botón "Editar Página" no aparece después de seguir esta guía:

1. **Verificar logs del servidor** (terminal donde corre `./scripts/dev-start.sh`)
2. **Verificar consola del navegador** (F12 > Console)
3. **Verificar React DevTools** (extensión Chrome/Firefox)
4. **Leer `VERIFICACION_FASE_2.md`** para más detalles técnicos

---

## 🎉 Resumen

**Para usar el sistema de edición en vivo:**

1. ✅ Login como admin
2. ✅ Ve a una página pública (NO /admin, NO /aula-virtual)
3. ✅ Busca el botón flotante "✏️ Editar Página" (top-right)
4. ✅ Click para activar modo edición
5. ✅ Verás el toolbar en la parte inferior

**El botón NUNCA aparecerá en:**
- ❌ `/admin` (tiene su propio sistema CMS)
- ❌ `/aula-virtual` (dashboard de usuario)

**El botón SIEMPRE aparecerá en:**
- ✅ `/` (home)
- ✅ `/secciones/castores, manada, tropa, pioneros, rutas`
- ✅ `/contacto`
- ✅ Cualquier página pública

---

**Última actualización:** Commit 36cc44c - "feat: separar sistema de edición en vivo del CMS legacy"
