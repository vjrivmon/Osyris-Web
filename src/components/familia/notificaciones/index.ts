// Exportación principal del sistema de notificaciones familiares

export { NotificationCenter } from './notification-center'
export { NotificationItem, NotificationItemCompact } from './notification-item'
export { NotificationPreferences } from './notification-preferences'
export { NotificationCompose, QuickMessageCompose } from './notification-compose'

// Reexportar tipos y hooks para facilitar el uso
export {
  useNotificacionesFamilia,
  useNotificacionesStats,
  usePlantillasMensaje,
  type NotificacionFamilia,
  type PreferenciasNotificacion,
  type PlantillaMensaje,
  type ContactoAdicional,
  type TipoNotificacion,
  type PrioridadNotificacion,
  type CategoriaNotificacion,
  type EstadoNotificacion
} from '@/hooks/useNotificacionesFamilia'