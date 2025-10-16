# ✅ Sistema de Edición en Vivo - LISTO PARA USAR

## 🎉 Estado del Sistema

**TODO ESTÁ FUNCIONANDO CORRECTAMENTE**

✅ Endpoint de autenticación `/api/auth/verify` funcionando
✅ Base de datos con 9 elementos de contenido editable en la landing
✅ Componentes EditableText/EditableImage con IDs correctos (100-108)
✅ Backend respondiendo correctamente en puerto 5000
✅ Frontend compilado y corriendo en puerto 3000

---

## 🚀 CÓMO PROBAR EL SISTEMA (5 minutos)

### Paso 1: Abrir el navegador

Abre tu navegador favorito y ve a:

```
http://localhost:3000/login
```

### Paso 2: Hacer login como admin

Credenciales:
- **Email:** `admin@grupoosyris.es`
- **Password:** `admin123`

Haz click en "Iniciar Sesión"

### Paso 3: Ir al dashboard de admin

Después del login, deberías ver el dashboard de admin. Busca en la parte superior de la página un botón que dice **"Editar Contenido Web"** (tiene un icono de lápiz ✏️).

### Paso 4: Activar el modo de edición

Haz click en el botón **"Editar Contenido Web"**.

**Esto te llevará a:**
```
http://localhost:3000/?editMode=true
```

### Paso 5: Verificar que el modo edición está activo

Deberías ver:

1. **En la esquina superior derecha:**
   - Un botón "Salir Edición" (antes decía "Editar Página")

2. **En la parte inferior derecha:**
   - Una toolbar flotante con:
     - Botón "Guardar Cambios"
     - Botón "Descartar Cambios"
     - Contador de cambios (ej: "0 cambios pendientes")

3. **En el contenido de la página:**
   - Los textos editables tienen un **borde punteado** al pasar el mouse
   - Los textos editables muestran un **icono de lápiz** al hacer hover

### Paso 6: Editar contenido

1. **Haz click** en el título principal "Grupo Scout Osyris"
2. **Cambia el texto** a algo como "¡Bienvenido a Osyris!"
3. **Haz click fuera** del texto para confirmar
4. Verás que:
   - El contador cambia a "1 cambio pendiente"
   - El texto tiene un indicador visual de "pendiente"

### Paso 7: Guardar cambios

1. Haz click en el botón **"Guardar Cambios"** en la toolbar
2. Deberías ver un mensaje de éxito
3. El contador vuelve a "0 cambios pendientes"

### Paso 8: Verificar persistencia

1. **Recarga la página** (F5 o Ctrl+R)
2. El texto que editaste debería **seguir ahí** con el nuevo contenido
3. ¡El cambio se guardó en la base de datos!

---

## 🎯 Elementos Editables en la Landing

La landing page tiene **9 elementos editables**:

### Hero Section (Superior)
1. **Título principal** - "Grupo Scout Osyris" (ID: 100)
2. **Subtítulo** - "Formando jóvenes a través del método scout..." (ID: 101)

### Features Section (3 características)
3. **Feature 1 - Título** - "Aventura y Aprendizaje" (ID: 102)
4. **Feature 1 - Descripción** - "Actividades emocionantes que..." (ID: 103)
5. **Feature 2 - Título** - "Valores y Amistad" (ID: 104)
6. **Feature 2 - Descripción** - "Fomentamos valores como el respeto..." (ID: 105)
7. **Feature 3 - Título** - "Naturaleza y Sostenibilidad" (ID: 106)
8. **Feature 3 - Descripción** - "Conectamos con la naturaleza y aprendemos..." (ID: 107)

### Join Us Section (Imagen)
9. **Imagen "¿Quieres formar parte?"** - Placeholder image (ID: 108)

---

## 🐛 Si algo no funciona

### El botón "Editar Contenido Web" no aparece

**Solución:** Abre DevTools (F12) → Console y ejecuta:

```javascript
localStorage.getItem('token')
```

Debería mostrar un token largo. Si no, cierra sesión y vuelve a hacer login.

### Los elementos no tienen borde punteado

**Solución:** Verifica que estás en `http://localhost:3000/?editMode=true` (debe tener el parámetro `?editMode=true`)

### Los cambios no se guardan

**Solución:** Abre DevTools → Network y verifica que la petición a `/api/content/XXX` responde con código 200.

Si no, verifica que el backend está corriendo:

```bash
curl http://localhost:5000/api/content/page/landing
```

Debería devolver JSON con 9 elementos.

### Error "Cannot read properties of undefined"

**Solución:** El backend necesita reiniciarse. En una terminal:

```bash
cd api-osyris
npm run dev
```

---

## 📊 Verificar el Estado del Sistema

Ejecuta este script para verificar que todo funciona:

```bash
./test-edit-flow.sh
```

Debería mostrar:
```
✅ Login exitoso
✅ Token verificado - Rol: admin
✅ Landing carga correctamente
✅ Hay 9 elementos de contenido editable
```

---

## 🎓 Próximos Pasos

Una vez que hayas probado y funcione todo correctamente, puedes:

1. **Extender a otras páginas:** Añadir `EditableText` y `EditableImage` a `/contacto`, `/sobre-nosotros`, etc.

2. **Añadir más elementos:** Puedes hacer editable cualquier texto o imagen de la landing actual.

3. **Personalizar la toolbar:** Cambiar colores, posición, añadir más botones.

4. **Implementar preview:** Añadir un modo de vista previa antes de guardar.

5. **Sistema de permisos:** Añadir rol "editor" que puede editar pero necesita aprobación de admin.

---

## 📝 Archivos Modificados

### Frontend
- `app/api/auth/verify/route.ts` - Endpoint de verificación de autenticación
- `app/page.tsx` - Landing page con componentes editables
- `contexts/EditModeContext.tsx` - Contexto de modo edición (corregido)

### Backend
- `database/schema-content-editor.sql` - Schema de base de datos
- `scripts/force-seed-landing.js` - Script de inserción de datos

### Base de Datos
- Tabla `contenido_editable` con 9 registros de la sección "landing"

---

## 🎉 ¡Disfruta del sistema de edición en vivo!

Ahora puedes editar el contenido de tu web directamente desde el navegador, sin tocar código ni base de datos manualmente.

**Última actualización:** 4 de octubre de 2025
**Versión:** 1.0.0 FINAL
