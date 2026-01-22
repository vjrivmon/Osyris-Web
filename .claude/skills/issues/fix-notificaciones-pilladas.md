# CRIT-002: Fix Notificaciones Quedan "Pilladas"

## Descripción del Problema

Las notificaciones del sistema se quedan "pilladas" (stuck) - no se actualizan en tiempo real, muestran datos antiguos, y el usuario tiene que refrescar manualmente la página varias veces para ver cambios.

## Causa Raíz

1. **Cache agresivo en localStorage** con TTL de 2 minutos que no se invalida correctamente
2. **Fallback a datos estáticos** hardcodeados cuando hay error de red
3. **No hay mecanismo de invalidación** tras acciones del usuario
4. **Estado React desincronizado** con los datos del servidor

## Archivos a Modificar

### Frontend
1. `src/hooks/useNotificacionesFamilia.ts`
2. `src/components/familia/notificaciones/notification-center.tsx`
3. `src/lib/api-utils.ts` (si existe cache aquí)

### Backend (verificar)
4. `api-osyris/src/controllers/notificaciones.controller.js`
5. `api-osyris/src/routes/notificaciones.routes.js`

## Implementación

### Paso 1: Reducir TTL del Cache

Modificar `src/hooks/useNotificacionesFamilia.ts`:

```typescript
// Cambiar de:
const CACHE_TTL = 120000; // 2 minutos

// A:
const CACHE_TTL = 30000; // 30 segundos

// Agregar versión para forzar invalidación
const CACHE_VERSION = 'v2';
const CACHE_KEY = `notificaciones_familia_${CACHE_VERSION}`;
```

### Paso 2: Eliminar Fallback a Datos Estáticos

```typescript
// Buscar y eliminar código similar a:
const FALLBACK_NOTIFICATIONS = [
  { id: 1, titulo: 'Bienvenido', ... },
  ...
];

// Si hay error, NO usar fallback estático
catch (error) {
  // MAL: setNotificaciones(FALLBACK_NOTIFICATIONS);

  // BIEN: Mostrar error y lista vacía
  setError('Error al cargar notificaciones');
  setNotificaciones([]);
}
```

### Paso 3: Agregar Invalidación Manual del Cache

```typescript
// En useNotificacionesFamilia.ts

// Función para invalidar cache
const invalidateCache = useCallback(() => {
  localStorage.removeItem(CACHE_KEY);
  setNotificaciones([]);
  setLastFetch(null);
}, []);

// Función para forzar refresh
const forceRefresh = useCallback(async () => {
  invalidateCache();
  await fetchNotificaciones();
}, [invalidateCache, fetchNotificaciones]);

// Retornar función
return {
  notificaciones,
  loading,
  error,
  refetch: forceRefresh,
  invalidateCache,
};
```

### Paso 4: Invalidar Cache Tras Acciones del Usuario

```typescript
// En notification-center.tsx o donde se marquen como leídas

const handleMarkAsRead = async (notificationId: number) => {
  try {
    await api.put(`/notificaciones/${notificationId}/leer`);

    // IMPORTANTE: Invalidar cache inmediatamente
    invalidateCache();

    // Refetch para obtener datos actualizados
    await refetch();

    toast.success('Notificación marcada como leída');
  } catch (error) {
    toast.error('Error al marcar notificación');
  }
};
```

### Paso 5: Agregar Polling Opcional

```typescript
// En useNotificacionesFamilia.ts

// Polling cada 30 segundos cuando el componente está montado
useEffect(() => {
  const pollInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchNotificaciones();
    }
  }, 30000);

  return () => clearInterval(pollInterval);
}, [fetchNotificaciones]);

// Refetch cuando la ventana vuelve a estar visible
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      forceRefresh();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [forceRefresh]);
```

### Paso 6: Agregar Botón de Refresh Manual

```typescript
// En notification-center.tsx

<div className="flex items-center justify-between">
  <h3 className="font-semibold">Notificaciones</h3>
  <Button
    variant="ghost"
    size="sm"
    onClick={refetch}
    disabled={loading}
  >
    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
  </Button>
</div>
```

### Paso 7: Mejorar Estados de Loading

```typescript
// Estados más granulares
const [isInitialLoading, setIsInitialLoading] = useState(true);
const [isRefreshing, setIsRefreshing] = useState(false);

// En fetch
const fetchNotificaciones = async () => {
  if (notificaciones.length === 0) {
    setIsInitialLoading(true);
  } else {
    setIsRefreshing(true);
  }

  try {
    // ... fetch logic
  } finally {
    setIsInitialLoading(false);
    setIsRefreshing(false);
  }
};

// En UI
{isInitialLoading ? (
  <Skeleton className="h-20" />
) : (
  <NotificationList
    notifications={notificaciones}
    isRefreshing={isRefreshing}
  />
)}
```

## Criterios de Completitud

- [ ] Cache TTL reducido a 30 segundos
- [ ] Eliminado fallback a datos estáticos
- [ ] Función de invalidación de cache implementada
- [ ] Cache se invalida tras marcar notificación como leída
- [ ] Botón de refresh manual visible y funcional
- [ ] Polling implementado (cada 30s cuando visible)
- [ ] Refetch al volver a la pestaña
- [ ] Notificaciones se actualizan en <30 segundos
- [ ] Build pasa sin errores
- [ ] No hay errores en consola del navegador

## Comandos de Verificación

```bash
# Build
npm run build

# Tests relacionados
npm run test -- --grep "notificaciones"

# Verificar en navegador
# 1. Abrir panel de notificaciones
# 2. En otra pestaña, crear notificación via API
# 3. Verificar que aparece en <30 segundos sin refresh manual
```

## Tests E2E

Crear o modificar `tests/e2e/notificaciones.spec.ts`:

```typescript
test('notificaciones se actualizan automáticamente', async ({ page }) => {
  // Login como familia
  await page.goto('/familia/dashboard');

  // Abrir panel de notificaciones
  await page.click('[data-testid="notification-bell"]');

  // Contar notificaciones iniciales
  const initialCount = await page.locator('[data-testid="notification-item"]').count();

  // Crear notificación via API (en otra ventana/fetch)
  await page.evaluate(async () => {
    await fetch('/api/notificaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'Test', mensaje: 'Test notification' })
    });
  });

  // Esperar actualización (máximo 35 segundos)
  await page.waitForFunction(
    (expected) => {
      const items = document.querySelectorAll('[data-testid="notification-item"]');
      return items.length > expected;
    },
    initialCount,
    { timeout: 35000 }
  );

  // Verificar nueva notificación presente
  const newCount = await page.locator('[data-testid="notification-item"]').count();
  expect(newCount).toBeGreaterThan(initialCount);
});
```

## Debugging

### Ver estado del cache en consola
```javascript
// En DevTools Console
localStorage.getItem('notificaciones_familia_v2')
```

### Limpiar cache manualmente
```javascript
localStorage.removeItem('notificaciones_familia_v2')
```

### Verificar polling
```javascript
// En DevTools Network tab, filtrar por /notificaciones
// Debería ver requests cada ~30 segundos
```

## Rollback

Si hay problemas:
1. Revertir cambios en los archivos modificados
2. El cache en localStorage se regenerará automáticamente

## Notas Adicionales

- Considerar implementar WebSocket para tiempo real en el futuro
- Este fix no afecta a notificaciones del admin (sistema diferente)
- Después del fix, monitorear uso de red por el polling
