import {
  Users,
  Tent,
  MapPin,
  Star,
  Calendar,
  Users2,
  Briefcase,
  UserCog,
  GraduationCap,
  Mountain,
  CalendarDays,
  LucideIcon
} from 'lucide-react'

export type TipoEvento =
  | 'reunion_sabado'
  | 'reunion'
  | 'campamento'
  | 'salida'
  | 'excursion'
  | 'evento_especial'
  | 'evento'
  | 'actividad'
  | 'jornada'
  | 'festivo'
  | 'asamblea'
  | 'consejo_grupo'
  | 'reunion_kraal'
  | 'formacion'
  | 'otro'

export interface TipoEventoConfig {
  icon: LucideIcon
  color: string
  bgColor: string
  textColor: string
  borderColor: string
  dotColor: string
  hexColor: string
  label: string
  requiereInscripcion: boolean
  soloKraal: boolean
}

export const TIPOS_EVENTO: Record<TipoEvento, TipoEventoConfig> = {
  reunion_sabado: {
    icon: Users,
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
    dotColor: 'bg-blue-500',
    hexColor: '#3b82f6',
    label: 'Reunion',
    requiereInscripcion: false,
    soloKraal: false
  },
  reunion: {
    icon: Users,
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
    dotColor: 'bg-blue-500',
    hexColor: '#3b82f6',
    label: 'Reunion',
    requiereInscripcion: false,
    soloKraal: false
  },
  campamento: {
    icon: Tent,
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-300 dark:border-green-700',
    dotColor: 'bg-green-500',
    hexColor: '#22c55e',
    label: 'Campamento',
    requiereInscripcion: true,
    soloKraal: false
  },
  salida: {
    icon: MapPin,
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
    dotColor: 'bg-purple-500',
    hexColor: '#a855f7',
    label: 'Salida',
    requiereInscripcion: false,
    soloKraal: false
  },
  excursion: {
    icon: Mountain,
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
    dotColor: 'bg-purple-500',
    hexColor: '#a855f7',
    label: 'Excursion',
    requiereInscripcion: false,
    soloKraal: false
  },
  evento_especial: {
    icon: Star,
    color: 'orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-700',
    dotColor: 'bg-orange-500',
    hexColor: '#f97316',
    label: 'Evento Especial',
    requiereInscripcion: false,
    soloKraal: false
  },
  evento: {
    icon: Star,
    color: 'orange',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-700',
    dotColor: 'bg-orange-500',
    hexColor: '#f97316',
    label: 'Evento',
    requiereInscripcion: false,
    soloKraal: false
  },
  actividad: {
    icon: CalendarDays,
    color: 'teal',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-300 dark:border-teal-700',
    dotColor: 'bg-teal-500',
    hexColor: '#14b8a6',
    label: 'Actividad',
    requiereInscripcion: false,
    soloKraal: false
  },
  jornada: {
    icon: CalendarDays,
    color: 'teal',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-300 dark:border-teal-700',
    dotColor: 'bg-teal-500',
    hexColor: '#14b8a6',
    label: 'Jornada',
    requiereInscripcion: false,
    soloKraal: false
  },
  festivo: {
    icon: Calendar,
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-600 dark:text-gray-300',
    borderColor: 'border-gray-300 dark:border-gray-600',
    dotColor: 'bg-gray-400',
    hexColor: '#6b7280',
    label: 'Festivo',
    requiereInscripcion: false,
    soloKraal: false
  },
  asamblea: {
    icon: Users2,
    color: 'indigo',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    dotColor: 'bg-indigo-500',
    hexColor: '#6366f1',
    label: 'Asamblea',
    requiereInscripcion: false,
    soloKraal: false
  },
  consejo_grupo: {
    icon: Briefcase,
    color: 'slate',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-300 dark:border-slate-600',
    dotColor: 'bg-slate-500',
    hexColor: '#64748b',
    label: 'Consejo',
    requiereInscripcion: false,
    soloKraal: true
  },
  reunion_kraal: {
    icon: UserCog,
    color: 'violet',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    textColor: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-300 dark:border-violet-700',
    dotColor: 'bg-violet-500',
    hexColor: '#8B5CF6',
    label: 'Reunion Kraal',
    requiereInscripcion: false,
    soloKraal: true
  },
  formacion: {
    icon: GraduationCap,
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    dotColor: 'bg-yellow-500',
    hexColor: '#eab308',
    label: 'Formacion',
    requiereInscripcion: false,
    soloKraal: false
  },
  otro: {
    icon: Calendar,
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-300 dark:border-gray-600',
    dotColor: 'bg-gray-500',
    hexColor: '#6b7280',
    label: 'Otro',
    requiereInscripcion: false,
    soloKraal: false
  }
}

export function getTipoEventoConfig(tipo: string): TipoEventoConfig {
  return TIPOS_EVENTO[tipo as TipoEvento] || TIPOS_EVENTO.reunion_sabado
}
