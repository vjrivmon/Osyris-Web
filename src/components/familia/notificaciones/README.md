# 🏕️ Sistema de Notificaciones y Comunicaciones Familiar

## 📋 Descripción General

Este sistema proporciona un centro completo de notificaciones y comunicaciones para los familiares de los scouts, con gestión de preferencias personalizables, plantillas de mensaje y comunicación directa con monitores.

## 🗂️ Estructura de Componentes

### Componentes Principales

- **`NotificationCenter`** - Panel principal con filtros avanzados y lista de notificaciones
- **`NotificationItem`** - Componente individual para cada notificación con acciones contextuales
- **`NotificationPreferences`** - Panel completo de configuración de preferencias
- **`NotificationCompose`** - Compositor de mensajes con plantillas y vista previa

### Componentes Auxiliares

- **`NotificationItemCompact`** - Versión compacta para sidebars o listas reducidas
- **`QuickMessageCompose`** - Formulario rápido para enviar mensajes simples

## 🔧 Hook Personalizado

### `useNotificacionesFamilia`

Hook principal que gestiona todo el sistema de notificaciones:

```typescript
const {
  notificaciones,
  preferencias,
  loading,
  error,
  refetch,
  marcarComoLeida,
  marcarTodasComoLeidas,
  archivarNotificacion,
  eliminarNotificacion,
  actualizarPreferencias,
  enviarMensajeMonitor,
  getContadorNoLeidas
} = useNotificacionesFamilia({
  scoutId?: number,
  autoRefetch?: boolean,
  refetchInterval?: number,
  cacheKey?: string
})
```

### Hooks Auxiliares

- **`useNotificacionesStats`** - Estadísticas de las notificaciones
- **`usePlantillasMensaje`** - Plantillas predefinidas de comunicación

## 📊 Tipos de Notificaciones

### Tipos (Prioridad)
- **`urgente`** 🚨 - Emergencias y comunicaciones críticas
- **`importante`** ⚠️ - Documentos requeridos, confirmaciones
- **`informativo`** ℹ️ - Novedades, fotos, recordatorios generales
- **`recordatorio`** 📅 - Próximos eventos y fechas importantes

### Categorías
- **`documentos`** 📄 - Autorizaciones, formularios, certificados
- **`actividades`** 🏕️ - Eventos, campamentos, salidas
- **`galeria`** 📸 - Nuevas fotos y vídeos disponibles
- **`general`** 📋 - Comunicaciones generales
- **`comunicados`** 📢 - Anuncios oficiales del grupo

### Estados
- **`no_leida`** - Notificación pendiente de lectura
- **`leida`** - Marcada como leída por el usuario
- **`archivada`** - Archivada y oculta de la vista principal

## 🔔 Sistema de Preferencias

### Canales de Comunicación

#### Email
- Urgentes: Siempre activas
- Importantes: Configurable
- Informativos: Opcional
- Resumen semanal: Activable

#### SMS
- Solo urgentes críticas
- Confirmaciones de última hora
- Cancelaciones de actividades

#### Push Web
- Urgentes e importantes
- Recordatorios de eventos
- Nuevas fotos disponibles

### Configuración de Horarios

- **Horario preferido**: 09:00 - 21:00 (configurable)
- **Fin de semana**: Configuración diferenciada
- **Modo "No Molestar"**: Solo urgencias críticas
- **Vacaciones**: Suspensión temporal con fechas

### Contactos Adicionales

- Configuración independiente por contacto
- Tipos de notificaciones por contacto
- Múltiples métodos de contacto por persona

## 📝 Plantillas de Mensaje

### Plantillas Predefinidas

1. **Ausencia justificada** - Para comunicar falta a actividades
2. **Consulta documento** - Para solicitar información sobre documentos
3. **Duda actividad próxima** - Para preguntas sobre eventos
4. **Información médica** - Para comunicar datos de salud importantes
5. **Contacto general** - Para comunicaciones generales

### Variables Dinámicas

Las plantillas soportan variables como:
- `{{nombre_scout}}` - Nombre completo del scout
- `{{fecha_actividad}}` - Fecha del evento
- `{{motivo}}` - Motivo personalizado
- `{{nombre_familiar}}` - Nombre del remitente
- Y más según la plantilla

## 🚀 Uso Básico

### En una página

```typescript
import { NotificationCenter, NotificationCompose, NotificationPreferences } from '@/components/familia/notificaciones'

export default function NotificacionesPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="compose">Enviar Mensaje</TabsTrigger>
          <TabsTrigger value="preferences">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="compose">
          <NotificationCompose />
        </TabsContent>

        <TabsContent value="preferences">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Para un scout específico

```typescript
<NotificationCenter scoutId={123} />
<NotificationCompose scoutId={123} />
```

## 🔌 Integración con API

El sistema está diseñado para funcionar con los siguientes endpoints de API:

- `GET /api/notificaciones_familia/listar` - Obtener notificaciones
- `POST /api/notificaciones_familia/marcar-leida/:id` - Marcar como leída
- `POST /api/notificaciones_familia/archivar/:id` - Archivar notificación
- `DELETE /api/notificaciones_familia/eliminar/:id` - Eliminar notificación
- `POST /api/notificaciones_familia/enviar-mensaje` - Enviar mensaje a monitor
- `PUT /api/notificaciones_familia/actualizar-preferencias` - Actualizar preferencias

## 🎨 Diseño y UX

### Características de Diseño

- **Responsive**: Adaptado para móvil, tablet y desktop
- **Accesible**: WCAG 2.1 AA compatible
- **Intuitivo**: Navegación clara y acciones evidentes
- **Profesional**: Diseño coherente con el sistema scout

### Interacciones

- **Click en notificación**: Marca como leída y expande contenido
- **Selección múltiple**: Para acciones masivas
- **Filtros en tiempo real**: Búsqueda instantánea
- **Drag and drop**: No implementado (planeado para futuro)

## 📱 Responsive Design

### Mobile (< 768px)
- Lista compacta de notificaciones
- Filtros en panel lateral colapsable
- Acciones en menú desplegable
- Navegación por tabs verticales

### Tablet (768px - 1024px)
- Vista de dos columnas
- Panel lateral con filtros visibles
- Acciones rápidas disponibles
- Navegación horizontal

### Desktop (> 1024px)
- Vista completa de tres columnas
- Panel lateral persistente
- Todas las acciones visibles
- Atajos de teclado disponibles

## 🔐 Seguridad y Privacidad

- **Validación de permisos**: Solo se muestran notificaciones de los propios hijos
- **Sanitización de contenido**: Prevención XSS en mensajes
- **Cifrado de datos**: Comunicaciones seguras con la API
- **Control de acceso**: Verificación de identidad en cada acción

## 🛠️ Mantenimiento

### Logs y Monitoreo

- Errores de carga registrados
- Tiempos de respuesta medidos
- Uso de características analizado
- Feedback del usuario recolectado

### Rendimiento

- Cache inteligente de datos
- Lazy loading de contenido
- Optimización de imágenes
- Minificación de assets

## 📈 Métricas de Éxito

### Indicadores Clave

- **Tasa de lectura**: Porcentaje de notificaciones leídas
- **Tiempo de respuesta**: Velocidad de acciones del usuario
- **Uso de plantillas**: Frecuencia de uso de plantillas
- **Satisfacción**: Feedback de usuarios familiares

### Objetivos

- 95% de notificaciones leídas en primeras 24h
- Tiempo de carga < 2 segundos
- 80% de usuarios con preferencias configuradas
- 4.5/5 de satisfacción del usuario

---

## 🏕️ Integración Scout Osyris

Este sistema está diseñado específicamente para las necesidades del Grupo Scout Osyris, integrándose perfectamente con:

- **Gestión de miembros**: Información de scouts y secciones
- **Calendario de actividades**: Recordatorios automáticos
- **Galería de fotos**: Notificaciones de nuevo contenido
- **Gestión de documentos**: Alertas de vencimiento
- **Sistema de roles**: Permisos por tipo de usuario

El sistema respeta la filosofía scout de comunicación clara, responsable y respetuosa entre familias y monitores.