import {
  Users,
  Tent,
  MapPin,
  Star,
  Calendar,
  Users2,
  Briefcase,
  ClipboardList,
  LucideIcon
} from 'lucide-react'

export type TipoEvento =
  | 'reunion_sabado'
  | 'campamento'
  | 'salida'
  | 'evento_especial'
  | 'festivo'
  | 'asamblea'
  | 'consejo_grupo'
  | 'reunion_kraal'

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
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    dotColor: 'bg-blue-500',
    hexColor: '#3b82f6',
    label: 'Reunion',
    requiereInscripcion: false,
    soloKraal: false
  },
  campamento: {
    icon: Tent,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
    hexColor: '#22c55e',
    label: 'Campamento',
    requiereInscripcion: true,
    soloKraal: false
  },
  salida: {
    icon: MapPin,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
    hexColor: '#a855f7',
    label: 'Salida',
    requiereInscripcion: false,
    soloKraal: false
  },
  evento_especial: {
    icon: Star,
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    dotColor: 'bg-orange-500',
    hexColor: '#f97316',
    label: 'Evento Especial',
    requiereInscripcion: false,
    soloKraal: false
  },
  festivo: {
    icon: Calendar,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-400',
    hexColor: '#6b7280',
    label: 'Festivo',
    requiereInscripcion: false,
    soloKraal: false
  },
  asamblea: {
    icon: Users2,
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-300',
    dotColor: 'bg-indigo-500',
    hexColor: '#6366f1',
    label: 'Asamblea',
    requiereInscripcion: false,
    soloKraal: false
  },
  consejo_grupo: {
    icon: Briefcase,
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    dotColor: 'bg-slate-500',
    hexColor: '#64748b',
    label: 'Consejo',
    requiereInscripcion: false,
    soloKraal: true
  },
  reunion_kraal: {
    icon: ClipboardList,
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-300',
    dotColor: 'bg-cyan-500',
    hexColor: '#06b6d4',
    label: 'Reunion Kraal',
    requiereInscripcion: false,
    soloKraal: true
  }
}

export function getTipoEventoConfig(tipo: string): TipoEventoConfig {
  return TIPOS_EVENTO[tipo as TipoEvento] || TIPOS_EVENTO.reunion_sabado
}
