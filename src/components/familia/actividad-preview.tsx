'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Euro,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Info,
  User,
  Camera,
  Tent,
  Star
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Monitor {
  id: number
  nombre: string
  apellidos: string
  foto?: string
  cargo: string
  contacto?: string
}

interface ActividadPreview {
  id: number
  titulo: string
  descripcion?: string
  fecha: string
  hora_inicio: string
  hora_fin?: string
  lugar: string
  direccion?: string
  seccion: string
  tipo: 'jornada' | 'campamento' | 'reunion' | 'taller' | 'especial' | 'excursion'
  estado: 'confirmada' | 'pendiente' | 'cancelada'
  confirmacion: 'pendiente' | 'confirmado' | 'rechazado'
  costo?: number
  incluye_material?: boolean
  requiere_autorizacion?: boolean
  monitores?: Monitor[]
  fotos?: string[]
  capacidad_maxima?: number
  inscritos?: number
  fecha_limite_confirmacion?: string
  notas?: string
  material_requerido?: string[]
  punto_encuentro?: string
  transporte?: string
}

interface ActividadPreviewProps {
  actividad: ActividadPreview
  onConfirmar?: (actividadId: number) => void
  onRechazar?: (actividadId: number) => void
  onViewDetails?: (actividadId: number) => void
  compact?: boolean
  showActions?: boolean
  className?: string
}

export function ActividadPreview({
  actividad,
  onConfirmar,
  onRechazar,
  onViewDetails,
  compact = false,
  showActions = true,
  className
}: ActividadPreviewProps) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'jornada': return <Tent className="h-4 w-4" />
      case 'campamento': return <Tent className="h-4 w-4" />
      case 'reunion': return <Users className="h-4 w-4" />
      case 'taller': return <Calendar className="h-4 w-4" />
      case 'especial': return <Star className="h-4 w-4" />
      case 'excursion': return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'jornada': return 'bg-green-100 text-green-700'
      case 'campamento': return 'bg-blue-100 text-blue-700'
      case 'reunion': return 'bg-purple-100 text-purple-700'
      case 'taller': return 'bg-yellow-100 text-yellow-700'
      case 'especial': return 'bg-red-100 text-red-700'
      case 'excursion': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-700'
      case 'pendiente': return 'bg-yellow-100 text-yellow-700'
      case 'cancelada': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getConfirmacionColor = (confirmacion: string) => {
    switch (confirmacion) {
      case 'confirmado': return 'bg-green-100 text-green-700 border-green-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rechazado': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConfirmacionIcon = (confirmacion: string) => {
    switch (confirmacion) {
      case 'confirmado': return <CheckCircle className="h-4 w-4" />
      case 'pendiente': return <AlertTriangle className="h-4 w-4" />
      case 'rechazado': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const handleConfirmar = async () => {
    setLoading(true)
    try {
      await onConfirmar?.(actividad.id)
    } finally {
      setLoading(false)
    }
  }

  const handleRechazar = async () => {
    setLoading(true)
    try {
      await onRechazar?.(actividad.id)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = () => {
    onViewDetails?.(actividad.id)
  }

  const estaProximaPorVencer = () => {
    if (!actividad.fecha_limite_confirmacion) return false
    const fechaLimite = new Date(actividad.fecha_limite_confirmacion)
    const hoy = new Date()
    const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diasRestantes <= 3 && diasRestantes >= 0
  }

  const diasParaConfirmar = () => {
    if (!actividad.fecha_limite_confirmacion) return null
    const fechaLimite = new Date(actividad.fecha_limite_confirmacion)
    const hoy = new Date()
    return Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (compact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-sm">{actividad.titulo}</h3>
                <Badge variant="outline" className="text-xs">
                  {actividad.seccion}
                </Badge>
              </div>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(actividad.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{actividad.hora_inicio}</span>
                </div>
                {actividad.costo && (
                  <span className="font-medium">€{actividad.costo}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getConfirmacionColor(actividad.confirmacion)}>
                {getConfirmacionIcon(actividad.confirmacion)}
                <span className="ml-1">
                  {actividad.confirmacion === 'confirmado' ? 'Confirmado' :
                   actividad.confirmacion === 'pendiente' ? 'Pendiente' : 'Rechazado'}
                </span>
              </Badge>
              
              {showActions && actividad.confirmacion === 'pendiente' && (
                <div className="flex space-x-1">
                  <Button size="sm" onClick={handleConfirmar} disabled={loading}>
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRechazar} disabled={loading}>
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
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
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={cn("p-2 rounded-lg", getTipoColor(actividad.tipo))}>
                {getTipoIcon(actividad.tipo)}
              </div>
              <div>
                <CardTitle className="text-lg">{actividad.titulo}</CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{actividad.seccion}</Badge>
                  <Badge className={getEstadoColor(actividad.estado)}>
                    {actividad.estado === 'confirmada' ? 'Confirmada' :
                     actividad.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            
            {actividad.descripcion && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {actividad.descripcion}
              </p>
            )}
          </div>
          
          <Badge className={getConfirmacionColor(actividad.confirmacion)}>
            {getConfirmacionIcon(actividad.confirmacion)}
            <span className="ml-1">
              {actividad.confirmacion === 'confirmado' ? 'Confirmado ✅' :
               actividad.confirmacion === 'pendiente' ? 'Pendiente ⏰' : 'Rechazado ❌'}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Fecha</p>
              <p className="text-muted-foreground">
                {new Date(actividad.fecha).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Hora</p>
              <p className="text-muted-foreground">
                {actividad.hora_inicio}
                {actividad.hora_fin && ` - ${actividad.hora_fin}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Lugar</p>
              <p className="text-muted-foreground truncate">{actividad.lugar}</p>
            </div>
          </div>
          
          {actividad.costo !== undefined && (
            <div className="flex items-center space-x-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Costo</p>
                <p className="text-muted-foreground">€{actividad.costo}</p>
              </div>
            </div>
          )}
        </div>

        {/* Alerta de fecha límite */}
        {actividad.confirmacion === 'pendiente' && actividad.fecha_limite_confirmacion && (
          <div className={cn(
            "p-3 rounded-lg border",
            estaProximaPorVencer() 
              ? "bg-red-50 border-red-200 text-red-700" 
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          )}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {estaProximaPorVencer() 
                  ? `¡Últimos días para confirmar! Faltan ${diasParaConfirmar()} días`
                  : `Tienes hasta el ${new Date(actividad.fecha_limite_confirmacion).toLocaleDateString('es-ES')} para confirmar`
                }
              </span>
            </div>
          </div>
        )}

        {/* Información adicional expandible */}
        {(actividad.monitores || actividad.material_requerido || actividad.notas) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground"
            >
              <Info className="h-4 w-4 mr-2" />
              {expanded ? 'Menos información' : 'Más información'}
            </Button>
            
            {expanded && (
              <div className="mt-3 space-y-3 text-sm">
                {actividad.monitores && actividad.monitores.length > 0 && (
                  <div>
                    <p className="font-medium mb-2 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Monitores responsables</span>
                    </p>
                    <div className="space-y-2">
                      {actividad.monitores.map((monitor) => (
                        <div key={monitor.id} className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={monitor.foto} alt={monitor.nombre} />
                            <AvatarFallback>
                              {monitor.nombre.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{monitor.nombre} {monitor.apellidos}</p>
                            <p className="text-xs text-muted-foreground">{monitor.cargo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {actividad.material_requerido && actividad.material_requerido.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Material requerido</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {actividad.material_requerido.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {actividad.notas && (
                  <div>
                    <p className="font-medium mb-2">Notas importantes</p>
                    <p className="text-muted-foreground">{actividad.notas}</p>
                  </div>
                )}

                {actividad.fotos && actividad.fotos.length > 0 && (
                  <div>
                    <p className="font-medium mb-2 flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Fotos de actividades anteriores</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {actividad.fotos.slice(0, 8).map((foto, index) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                          <Image
                            src={foto}
                            alt={`Foto ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 25vw, 10vw"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex space-x-2">
              {actividad.confirmacion === 'pendiente' ? (
                <>
                  <Button 
                    onClick={handleConfirmar} 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Asistencia
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRechazar}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    No puedo asistir
                  </Button>
                </>
              ) : actividad.confirmacion === 'confirmado' ? (
                <Button 
                  variant="outline" 
                  onClick={handleRechazar}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar confirmación
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirmar} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar ahora
                </Button>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewDetails}
            >
              Ver detalles completos
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para lista de actividades
export function ActividadList({
  actividades,
  onConfirmar,
  onRechazar,
  onViewDetails,
  maxItems,
  compact = false
}: {
  actividades: ActividadPreview[]
  onConfirmar?: (actividadId: number) => void
  onRechazar?: (actividadId: number) => void
  onViewDetails?: (actividadId: number) => void
  maxItems?: number
  compact?: boolean
}) {
  const actividadesFiltradas = maxItems ? actividades.slice(0, maxItems) : actividades

  if (actividadesFiltradas.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay actividades próximas</h3>
        <p className="text-muted-foreground">
          Pronto se añadirán nuevas actividades al calendario
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {actividadesFiltradas.map((actividad) => (
        <ActividadPreview
          key={actividad.id}
          actividad={actividad}
          onConfirmar={onConfirmar}
          onRechazar={onRechazar}
          onViewDetails={onViewDetails}
          compact={compact}
        />
      ))}
    </div>
  )
}