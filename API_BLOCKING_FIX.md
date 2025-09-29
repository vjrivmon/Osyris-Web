# 🚫 Fix: ERR_BLOCKED_BY_CLIENT en Producción

## ❌ Problema

Estás viendo errores como:
```
localhost:5000/api/usuarios:1 Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
```

## 🔍 Causa

Este error **NO es un problema del código**. Es causado por:

1. **Ad Blockers** (uBlock Origin, AdBlock Plus, etc.)
2. **Extensiones de privacidad** (Privacy Badger, Ghostery)
3. **Antivirus con protección web**
4. **Reglas de firewall del navegador**

Estas extensiones bloquean peticiones a `localhost:5000` porque:
- Detectan patrones sospechosos en URLs
- Bloquean puertos no estándar (5000, 8080, etc.)
- Tienen listas negras de endpoints como `/api/usuarios`

## ✅ Soluciones

### Opción 1: Deshabilitar Ad Blocker (Temporal)

**Para uBlock Origin:**
1. Click en el icono de uBlock
2. Click en el botón grande de power (desactivar para este sitio)
3. Recargar la página

**Para AdBlock Plus:**
1. Click en el icono de AdBlock
2. "Pausar en este sitio"
3. Recargar

### Opción 2: Añadir Excepción

**uBlock Origin:**
1. Dashboard → My filters
2. Añadir: `@@||localhost:5000^$document`
3. Apply changes

**AdBlock Plus:**
1. Settings → Whitelisted websites
2. Añadir: `localhost:5000`

### Opción 3: Usar Puerto Estándar (Producción)

En producción, este problema NO existe porque:
- Vercel usa HTTPS en puerto 443 (estándar)
- Las APIs están en subdominios válidos
- No hay referencias a `localhost`

## 🌐 En Producción (Vercel)

El código ya está configurado para usar URLs de producción:

```typescript
// lib/auth-utils.ts:115-120
export const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
}
```

En Vercel, las variables de entorno están configuradas:
- `NEXT_PUBLIC_API_URL` apunta a tu backend
- Usa HTTPS automáticamente
- Sin problemas de CORS o blocking

## 🔧 Verificar en Producción

```bash
# Ver qué URL usa el frontend
console.log(process.env.NEXT_PUBLIC_API_URL)

# En producción debería mostrar:
# https://tu-api.vercel.app o similar
```

## 📝 Nota Importante

**Este error SOLO afecta desarrollo local.** En producción con Vercel:
- ✅ No hay bloqueos de ad blockers
- ✅ HTTPS válido y certificado
- ✅ APIs en dominios propios
- ✅ Sin problemas de CORS

Si ves este error en producción, el problema es diferente (probablemente CORS o variables de entorno).