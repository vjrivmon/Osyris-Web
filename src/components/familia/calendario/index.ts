// Componentes del calendario familiar

// Tipos y configuraciones
export * from './tipos-evento'

// Componentes de tipo de evento
export { TipoEventoBadge, TipoEventoDot } from './tipo-evento-badge'

// Componentes de asistencia
export {
  AsistenciaCounter,
  AsistenciaProgress,
  AsistenciaCard
} from './asistencia-counter'

// Componentes de confirmacion
export { ConfirmationBadge, ScoutConfirmationBadge } from './confirmation-badge'
export {
  ConfirmacionReunionForm,
  ConfirmacionReunionCompact
} from './confirmacion-reunion-form'

// Componentes de inscripcion a campamentos
export { InscripcionCampamentoForm } from './inscripcion-campamento-form'
export type { InscripcionDatos } from './inscripcion-campamento-form'

// Componentes de documentos
export {
  DocumentoCampamentoCard,
  DocumentosCampamentoList,
  DocumentacionRequerida
} from './documento-campamento-card'

// Componentes del calendario
export {
  EventoCalendarCell,
  EventoCalendarCellMultiple,
  DiaCalendario
} from './evento-calendar-cell'

// Vista principal del calendario
export { CalendarioView } from './calendario-view'

// Modal de detalle de evento
export { EventoDetailModal } from './evento-detail-modal'

// Filtro de actividades
export { ActivityFilter } from './activity-filter'