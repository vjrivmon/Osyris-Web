'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  User,
  Calendar,
  FileText,
  Shield,
  Camera,
  Award,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Heart,
  Activity
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DocumentoEstado {
  tipo: string
  estado: 'completo' | 'pendiente' | 'vencido' | 'no_aplica'
  fecha_vencimiento?: string
  archivo_url?: string
}

interface EspecialidadProgreso {
  nombre: string
  nivel: number
  max_nivel: number
  completado: boolean
  descripcion: string
}

interface ScoutHijo {
  id: number
  nombre: string
  apellidos: string
  apodo?: string
  fecha_nacimiento: string
  seccion: string
  seccion_id: number
  edad: number
  foto?: string
  email?: string
  telefono?: string
  direccion?: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  fecha_ingreso: string
  documentos: DocumentoEstado[]
  especialidades?: EspecialidadProgreso[]
  progreso_general?: number
  ultima_actividad?: string
  proxima_actividad?: string
  monitor_asignado?: {
    nombre: string
    apellidos: string
    foto?: string
    contacto?: string
  }
  contacto_emergencia?: {
    nombre: string
    relacion: string
    telefono: string
  }
  notas_medicas?: string
  alergias?: string[]
  habilidades_especiales?: string[]
}

interface ScoutInfoCardProps {
  scout: ScoutHijo
  onViewDetails?: (scoutId: number) => void
  onEditDocuments?: (scoutId: number) => void
  onViewGallery?: (scoutId: number) => void
  onViewActivities?: (scoutId: number) => void
  compact?: boolean
  showActions?: boolean
  className?: string
}

export function ScoutInfoCard({
  scout,
  onViewDetails,
  onEditDocuments,
  onViewGallery,
  onViewActivities,
  compact = false,
  showActions = true,
  className
}: ScoutInfoCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-700'
      case 'inactivo': return 'bg-gray-100 text-gray-700'
      case 'suspendido': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDocumentoIcon = (tipo: string) => {
    switch (tipo) {
      case 'autorizacion_medica': return <Shield className="h-3 w-3" />
      case 'ficha_medica': return <Activity className="h-3 w-3" />
      case 'dni': return <FileText className="h-3 w-3" />
      case 'foto': return <Camera className="h-3 w-3" />
      case 'seguro': return <Shield className="h-3 w-3" />
      default: return <FileText className="h-3 w-3" />
    }
  }

  const getDocumentoEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completo': return 'bg-green-50 text-green-700 border-green-200'
      case 'pendiente': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'vencido': return 'bg-red-50 text-red-700 border-red-200'
      case 'no_aplica': return 'bg-gray-50 text-gray-500 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getDocumentoEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'completo': return '✅ Completo'
      case 'pendiente': return '⏰ Pendiente'
      case 'vencido': return '❌ Vencido'
      case 'no_aplica': return 'N/A'
      default: return 'Desconocido'
    }
  }

  const getDocumentosCriticos = () => {
    return scout.documentos.filter(doc => 
      doc.estado === 'vencido' || doc.estado === 'pendiente'
    )
  }

  const getDocumentosCompletos = () => {
    return scout.documentos.filter(doc => doc.estado === 'completo').length
  }

  const getProgresoDocumentos = () => {
    const total = scout.documentos.filter(doc => doc.estado !== 'no_aplica').length
    const completos = getDocumentosCompletos()
    return total > 0 ? (completos / total) * 100 : 100
  }

  const getSeccionEmoji = (seccion: string) => {
    switch (seccion.toLowerCase()) {
      case 'colonia la veleta':
      case 'castores': return '🦫'
      case 'manada waingunga':
      case 'manada': return '🐺'
      case 'tropa brownsea':
      case 'tropa': return '⚜️'
      case 'posta kanhiwara':
      case 'pioneros': return '🏔️'
      case 'ruta walhalla':
      case 'rutas': return '🎒'
      default: return '🏕️'
    }
  }

  const calculateEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const documentosCriticos = getDocumentosCriticos()
  const tieneDocumentosCriticos = documentosCriticos.length > 0

  if (compact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={scout.foto} alt={scout.nombre} />
              <AvatarFallback className="text-lg font-semibold bg-green-100 text-green-700">
                {scout.nombre.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold truncate">
                  {scout.nombre} {scout.apellidos}
                </h3>
                <span className="text-lg">{getSeccionEmoji(scout.seccion)}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <span>{scout.seccion}</span>
                <span>{calculateEdad(scout.fecha_nacimiento)} años</span>
                <Badge 
                  variant="outline" 
                  className={getDocumentoEstadoColor(
                    tieneDocumentosCriticos ? 'pendiente' : 'completo'
                  )}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {getDocumentosCompletos()}/{scout.documentos.length}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getEstadoColor(scout.estado)}>
                {scout.estado === 'activo' ? 'Activo' : 
                 scout.estado === 'inactivo' ? 'Inactivo' : 'Suspendido'}
              </Badge>
              
              {tieneDocumentosCriticos && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {documentosCriticos.length}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={scout.foto} alt={scout.nombre} />
              <AvatarFallback className="text-xl font-semibold bg-green-100 text-green-700">
                {scout.nombre.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-xl">
                  {scout.nombre} {scout.apellidos}
                </CardTitle>
                {scout.apodo && (
                  <Badge variant="secondary">"{scout.apodo}"</Badge>
                )}
                <span className="text-2xl">{getSeccionEmoji(scout.seccion)}</span>
              </div>
              
              <CardDescription className="flex items-center space-x-3">
                <span>{scout.seccion}</span>
                <span>•</span>
                <span>{calculateEdad(scout.fecha_nacimiento)} años</span>
                <span>•</span>
                <span>Ingreso: {new Date(scout.fecha_ingreso).getFullYear()}</span>
              </CardDescription>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getEstadoColor(scout.estado)}>
                  {scout.estado === 'activo' ? 'Activo ✅' : 
                   scout.estado === 'inactivo' ? 'Inactivo ⏸️' : 'Suspendido ⛔'}
                </Badge>
                
                {tieneDocumentosCriticos && (
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {documentosCriticos.length} documento{documentosCriticos.length > 1 ? 's' : ''} crítico{documentosCriticos.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Progreso General</div>
            <div className="flex items-center space-x-2">
              <Progress value={scout.progreso_general || 0} className="w-20" />
              <span className="text-sm font-medium">{scout.progreso_general || 0}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estado de Documentos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Estado de Documentos</span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Ocultar' : 'Ver detalles'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {getDocumentosCompletos()} de {scout.documentos.length} documentos completos
            </span>
            <span className="text-sm font-medium">
              {Math.round(getProgresoDocumentos())}%
            </span>
          </div>
          
          <Progress value={getProgresoDocumentos()} className="mb-3" />
          
          {expanded && (
            <div className="space-y-2">
              {scout.documentos.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    {getDocumentoIcon(doc.tipo)}
                    <span className="text-sm font-medium capitalize">
                      {doc.tipo.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getDocumentoEstadoColor(doc.estado)}>
                      {getDocumentoEstadoLabel(doc.estado)}
                    </Badge>
                    
                    {doc.fecha_vencimiento && (
                      <span className="text-xs text-muted-foreground">
                        Vence: {new Date(doc.fecha_vencimiento).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximas Actividades */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {scout.ultima_actividad && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Última actividad</p>
                <p className="text-muted-foreground">{scout.ultima_actividad}</p>
              </div>
            </div>
          )}
          
          {scout.proxima_actividad && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Próxima actividad</p>
                <p className="text-muted-foreground">{scout.proxima_actividad}</p>
              </div>
            </div>
          )}
        </div>

        {/* Monitor Asignado */}
        {scout.monitor_asignado && (
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={scout.monitor_asignado.foto} alt={scout.monitor_asignado.nombre} />
              <AvatarFallback>
                {scout.monitor_asignado.nombre.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">Monitor asignado</p>
              <p className="text-sm text-muted-foreground">
                {scout.monitor_asignado.nombre} {scout.monitor_asignado.apellidos}
              </p>
            </div>
            {scout.monitor_asignado.contacto && (
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Información Médica */}
        {(scout.notas_medicas || scout.alergias) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Información Médica Importante</span>
            </div>
            {scout.alergias && scout.alergias.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-red-700 mb-1">Alergias:</p>
                <div className="flex flex-wrap gap-1">
                  {scout.alergias.map((alergia, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {alergia}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {scout.notas_medicas && (
              <p className="text-sm text-red-700">{scout.notas_medicas}</p>
            )}
          </div>
        )}

        {/* Especialidades (si existen) */}
        {scout.especialidades && scout.especialidades.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Especialidades en Progreso</span>
            </h4>
            <div className="space-y-2">
              {scout.especialidades.slice(0, 3).map((especialidad, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{especialidad.nombre}</p>
                    <p className="text-xs text-muted-foreground">{especialidad.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Progress 
                        value={(especialidad.nivel / especialidad.max_nivel) * 100} 
                        className="w-16"
                      />
                      <span className="text-xs font-medium">
                        {especialidad.nivel}/{especialidad.max_nivel}
                      </span>
                    </div>
                    {especialidad.completado && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        {showActions && (
          <div className="flex space-x-2 pt-3 border-t">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/familia/calendario?scout=${scout.id}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Ver Actividades
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEditDocuments?.(scout.id)}
            >
              <Link href={`/familia/documentos?scout=${scout.id}`}>
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewGallery?.(scout.id)}
            >
              <Link href={`/familia/galeria?scout=${scout.id}`}>
                <Camera className="h-4 w-4 mr-2" />
                Galería
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewDetails?.(scout.id)}
            >
              Ver Perfil
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para lista de scouts
export function ScoutList({
  scouts,
  onViewDetails,
  onEditDocuments,
  onViewGallery,
  onViewActivities,
  compact = false
}: {
  scouts: ScoutHijo[]
  onViewDetails?: (scoutId: number) => void
  onEditDocuments?: (scoutId: number) => void
  onViewGallery?: (scoutId: number) => void
  onViewActivities?: (scoutId: number) => void
  compact?: boolean
}) {
  if (scouts.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay scouts vinculados</h3>
        <p className="text-muted-foreground">
          Contacta con el grupo scout para vincular a tus hijos
        </p>
      </div>
    )
  }

  return (
    <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
      {scouts.map((scout) => (
        <ScoutInfoCard
          key={scout.id}
          scout={scout}
          onViewDetails={onViewDetails}
          onEditDocuments={onEditDocuments}
          onViewGallery={onViewGallery}
          onViewActivities={onViewActivities}
          compact={compact}
        />
      ))}
    </div>
  )
}