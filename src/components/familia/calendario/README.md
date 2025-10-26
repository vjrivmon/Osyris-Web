# 🗓️ Módulo de Calendario Familiar

Componentes especializados para el sistema de calendario y confirmación de asistencia del portal familiar.

## 📁 Estructura de Archivos

```
src/components/familia/calendario/
├── index.ts                     # Exportaciones del módulo
├── README.md                    # Esta documentación
├── calendario-view.tsx          # Componente principal del calendario
├── evento-detail-modal.tsx      # Modal con detalles y confirmación
├── confirmation-badge.tsx       # Badge de estado de confirmación
└── activity-filter.tsx          # Filtros avanzados de actividades
```

## 🔌 API Endpoints

### Actividades Familiares
- `GET /api/familia/actividades/[familiarId]` - Obtener actividades de un familiar

### Confirmaciones
- `POST /api/confirmaciones/confirmar` - Confirmar asistencia a actividad
- `PUT /api/confirmaciones/modificar/[confirmacionId]` - Modificar confirmación existente

## 🎨 Componentes

### CalendarioView
Componente principal que muestra el calendario mensual y lista de actividades.

**Props:**
- `className?: string` - Clases CSS adicionales

**Features:**
- Vista mensual interactiva
- Vista de lista de próximas actividades
- Navegación entre meses
- Filtros por sección, tipo y estado
- Colores dinámicos por sección scout
- Estados de carga y vacío

### EventoDetailModal
Modal con información completa de una actividad y sistema de confirmación.

**Props:**
- `actividad: ActividadCalendario` - Datos de la actividad
- `isOpen: boolean` - Estado del modal
- `onClose: () => void` - Función para cerrar el modal

**Features:**
- Información completa del evento
- Confirmación de asistencia por scout
- Comentarios opcionales
- Integración con Google Calendar
- Descarga de archivo .ics
- Contacto con monitor responsable

### ConfirmationBadge
Componente visual para mostrar el estado de confirmación.

**Props:**
- `estado: 'confirmado' | 'pendiente' | 'no_asiste'` - Estado de la confirmación
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del badge (default: 'md')
- `showIcon?: boolean` - Mostrar icono (default: true)
- `className?: string` - Clases CSS adicionales

**Features:**
- Colores según estado (verde/amarillo/rojo)
- Iconos representativos
- Versión compacta para vistas pequeñas

### ScoutConfirmationBadge
Badge especializado que muestra el nombre del scout junto al estado.

**Props:**
- `scoutNombre: string` - Nombre del scout
- `estado: 'confirmado' | 'pendiente' | 'no_asiste'` - Estado de confirmación
- `size?: 'sm' | 'md'` - Tamaño del badge (default: 'sm')
- `className?: string` - Clases CSS adicionales

### ActivityFilter
Componente de filtros avanzados para las actividades.

**Props:**
- `filtros: ActivityFilters` - Filtros activos
- `onFiltrosChange: (filtros: ActivityFilters) => void` - Callback al cambiar filtros
- `className?: string` - Clases CSS adicionales

**Features:**
- Búsqueda por texto
- Filtro por sección
- Filtro por tipo de actividad
- Filtro por estado de confirmación
- Vista de filtros avanzados
- Indicador de filtros activos

## 🎯 Hook Personalizado

### useCalendarioFamilia
Hook principal para la gestión del calendario familiar.

**Returns:**
- `actividades: ActividadCalendario[]` - Lista de actividades
- `loading: boolean` - Estado de carga
- `error: string | null` - Error si existe
- `confirmaciones: ConfirmacionAsistencia[]` - Lista de confirmaciones
- `refetch: () => Promise<void>` - Refrescar datos
- `confirmarAsistencia: Function` - Confirmar asistencia
- `modificarConfirmacion: Function` - Modificar confirmación
- Funciones de filtrado y utilidades

**Features:**
- Cache inteligente con localStorage
- Auto-refetch configurable
- Datos de fallback para desarrollo
- Integración con backend legacy
- Gestión de errores

## 🎨 Colores por Sección

- **Castores (Colonia La Veleta):** Naranja (#FF6B35)
- **Lobatos (Manada Waingunga):** Amarillo (#FFD93D)
- **Scouts (Tropa Brownsea):** Verde (#6BCF7F)
- **Pioneros (Posta Kanhiwara):** Rojo (#E74C3C)
- **Rovers (Ruta Walhalla):** Verde botella (#2E7D32)

## 📱 Responsive Design

- **Móvil:** Calendario compacto, vista de lista principal
- **Tablet:** Calendario medio tamaño con sidebar de detalles
- **Desktop:** Calendario completo con panel lateral

## 🔧 Configuración

El módulo está configurado para trabajar con:

- Next.js 15 con App Router
- TypeScript
- Tailwind CSS + Shadcn/ui
- Auth0/JWT para autenticación
- PostgreSQL para datos

## 🚀 Uso Básico

```tsx
import { CalendarioView } from '@/components/familia/calendario'

export default function CalendarioPage() {
  return (
    <div className="container mx-auto p-4">
      <CalendarioView />
    </div>
  )
}
```

## 📋 Estados de Confirmación

- **confirmado:** El scout asistirá a la actividad ✅
- **pendiente:** Esperando respuesta del familiar ⏰
- **no_asiste:** El scout no asistirá a la actividad ❌

## 🔗 Integraciones

- **Google Calendar:** Exportación directa a calendarios Google
- **ICS Files:** Compatibilidad con otros calendarios
- **Google Maps:** Enlaces a ubicaciones
- **Email:** Contacto con monitores

## 📊 Métricas y Estadísticas

- Total de actividades
- Próximos 30 días
- Actividades pendientes de confirmar
- Actividades del fin de semana
- Confirmaciones por estado

---

**Desarrollado por:** Agente 3 - Sistema de Calendario Familiar
**Última actualización:** 24/10/2025