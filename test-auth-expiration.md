# Test Plan - Sistema de Expiración de Autenticación

## ✅ Cambios Implementados

### 1. **Expiración de Sesión** (`lib/auth-utils.ts`)
- ✅ Añadida propiedad `expiresAt` al UserData
- ✅ Sesiones expiran después de 24 horas
- ✅ Función `isSessionExpired()` verifica expiración
- ✅ `getAuthToken()` valida y limpia sesiones expiradas automáticamente
- ✅ `setAuthData()` guarda timestamp de expiración

### 2. **Validación Mejorada** (`hooks/useAuth.ts`)
- ✅ Verificación de expiración antes de validar token
- ✅ Limpieza automática con `clearAuthData()` si sesión expirada
- ✅ Manejo de errores de conexión con backend
- ✅ Limpieza de sesión si backend no responde o rechaza token

### 3. **Modo Desarrollo** (`lib/dev-session-clear.ts`)
- ✅ Variable de entorno `NEXT_PUBLIC_AUTO_CLEAR_SESSION_ON_DEV=true`
- ✅ Limpieza automática de sesiones obsoletas al reiniciar servidor
- ✅ Solo activo en `NODE_ENV=development`
- ✅ Componente `DevSessionInit` inicializa la gestión

## 🧪 Pruebas a Realizar

### Test 1: Sesión Expirada (Manual)
```javascript
// En consola del navegador:
1. Abrir http://localhost:3000
2. Hacer login como admin
3. Abrir DevTools → Application → Local Storage
4. Modificar el campo 'expiresAt' en 'osyris_user' a una fecha pasada
5. Recargar la página
6. ✅ ESPERADO: La sesión debe limpiarse y redirigir a login
```

### Test 2: Sesión sin ExpiresAt (Legacy)
```javascript
// En consola del navegador:
1. Hacer login
2. En DevTools → Application → Local Storage
3. Editar 'osyris_user' y eliminar el campo 'expiresAt'
4. Recargar la página
5. ✅ ESPERADO: La sesión se limpia (sesión legacy sin expiración)
```

### Test 3: Reinicio de Servidor (Desarrollo)
```bash
1. Hacer login en http://localhost:3000
2. En terminal: Ctrl+C para parar el servidor
3. Ejecutar: npm run dev
4. Abrir http://localhost:3000
5. ✅ ESPERADO: Si backend está limpio, la sesión se invalida
```

### Test 4: Backend No Disponible
```bash
1. Hacer login
2. Parar el backend (pero dejar el frontend corriendo)
3. Recargar la página
4. ✅ ESPERADO: Error de conexión → limpia sesión → redirect login
```

### Test 5: Token Inválido
```javascript
// En consola del navegador:
1. Hacer login
2. DevTools → Application → Local Storage
3. Modificar el valor de 'token' a algo inválido
4. Recargar la página
5. ✅ ESPERADO: Backend rechaza token → limpia sesión
```

## 🔍 Verificación en Consola

Mensajes esperados en la consola del navegador:

### Sesión Válida:
```
✅ Session stored, expires at: [fecha]
```

### Sesión Expirada:
```
⚠️ Session expired, clearing...
🔒 Session expired or invalid, clearing auth data
```

### Sesión Legacy (sin expiresAt):
```
⚠️ Session without expiration date, clearing...
🔒 Session expired or invalid, clearing auth data
```

### Backend Rechaza Token:
```
⚠️ Invalid token or unauthorized, clearing session
```

### Error de Conexión:
```
❌ Failed to connect to auth server: [error]
```

## 📊 Estado Actual

### Archivos Modificados:
1. ✅ `lib/auth-utils.ts` - Sistema de expiración
2. ✅ `hooks/useAuth.ts` - Validación mejorada
3. ✅ `lib/dev-session-clear.ts` - Modo desarrollo
4. ✅ `components/dev-session-init.tsx` - Inicialización
5. ✅ `app/layout.tsx` - Integración
6. ✅ `.env.local` - Variable de configuración

### Compatibilidad:
- ✅ **Local (desarrollo)**: Limpieza automática habilitada
- ✅ **Producción**: Persistencia de sesión 24h (sin auto-limpieza)
- ✅ **Sesiones antiguas**: Se invalidan automáticamente

## 🚀 Siguiente Paso

Probar manualmente en el navegador y verificar comportamiento correcto.
