'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  FileText,
  Eye,
  PenTool
} from 'lucide-react'
import { useCalendarioFamilia, ActividadCalendario } from '@/hooks/useCalendarioFamilia'
import { ConfirmationBadge } from './confirmation-badge'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { useInscripcionCampamento } from '@/hooks/useInscripcionCampamento'
import { getApiUrl } from '@/lib/api-utils'
import { CircularDigitalWizard } from '@/components/familia/circular-digital/CircularDigitalWizard'

interface EventoDetailModalProps {
  actividad: ActividadCalendario
  isOpen: boolean
  onClose: () => void
  hijoSeleccionado?: number
}

// Componente para mostrar documentos enviados de un campamento
function DocumentosEnviadosSection({
  educandoId,
  actividadId
}: {
  educandoId: number
  actividadId: string | number
}) {
  const { inscripcion, loading } = useInscripcionCampamento({
    actividadId: typeof actividadId === 'string' ? parseInt(actividadId) : actividadId,
    educandoId,
    autoFetch: true
  })

  const handleVerDocumento = async (tipo: 'circular' | 'justificante') => {
    const driveId = tipo === 'circular'
      ? inscripcion?.circular_firmada_drive_id
      : inscripcion?.justificante_pago_drive_id

    if (driveId) {
      window.open(`https://drive.google.com/file/d/${driveId}/view`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="mt-6 pt-4 border-t animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-lg"></div>
          <div className="h-16 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!inscripcion) {
    return null
  }

  const tieneCircular = !!inscripcion.circular_firmada_drive_id
  const tieneJustificante = !!inscripcion.justificante_pago_drive_id

  if (!tieneCircular && !tieneJustificante) {
    return null
  }

  return (
    <div className="mt-6 pt-4 border-t">
      <h4 className="font-medium mb-3 flex items-center text-sm">
        <FileText className="h-4 w-4 mr-2 text-blue-500" />
        Documentos Enviados
      </h4>

      <div className="space-y-2">
        {/* Circular Firmada */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${tieneCircular ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileText className={`h-4 w-4 ${tieneCircular ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-medium text-sm">Circular Firmada</p>
              <p className={`text-xs ${tieneCircular ? 'text-green-600' : 'text-yellow-600'}`}>
                {tieneCircular ? 'Subido' : 'Pendiente'}
              </p>
            </div>
          </div>
          {tieneCircular && (
            <Button variant="ghost" size="sm" onClick={() => handleVerDocumento('circular')}>
              <Eye className="h-4 w-4 mr-1" /> Ver
            </Button>
          )}
        </div>

        {/* Justificante de Pago */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${tieneJustificante ? 'bg-green-100' : 'bg-gray-100'}`}>
              <DollarSign className={`h-4 w-4 ${tieneJustificante ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-medium text-sm">Justificante de Pago</p>
              <p className={`text-xs ${tieneJustificante ? 'text-green-600' : 'text-yellow-600'}`}>
                {tieneJustificante ? 'Subido' : 'Pendiente'}
              </p>
            </div>
          </div>
          {tieneJustificante && (
            <Button variant="ghost" size="sm" onClick={() => handleVerDocumento('justificante')}>
              <Eye className="h-4 w-4 mr-1" /> Ver
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook para detectar si una actividad tiene circular vinculada
function useCircularCheck(actividadId: string | number, educandoId: number) {
  const [circularInfo, setCircularInfo] = useState<{
    hasCircular: boolean
    circularId?: number
    estado?: string
    titulo?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCircular = async () => {
      try {
        const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
        const res = await fetch(
          `${getApiUrl()}/api/circulares/check-actividad/${actividadId}?educandoId=${educandoId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await res.json()
        if (data.success) {
          setCircularInfo(data.data)
        }
      } catch {
        // Silently fail — no circular detection
      } finally {
        setLoading(false)
      }
    }
    checkCircular()
  }, [actividadId, educandoId])

  return { circularInfo, loading }
}

// Componente para el contenido de confirmación de un hijo
function HijoConfirmacionContent({
  hijo,
  actividad,
  confirmaciones,
  comentarios,
  isSubmitting,
  onConfirmacion,
  onComentarioChange
}: {
  hijo: any
  actividad: ActividadCalendario
  confirmaciones: Record<string, 'confirmado' | 'no_asiste'>
  comentarios: Record<string, string>
  isSubmitting: boolean
  onConfirmacion: (scoutId: string, estado: 'confirmado' | 'no_asiste') => void
  onComentarioChange: (scoutId: string, value: string) => void
}) {
  const confirmacionActual = confirmaciones[hijo.id.toString()] ||
                             actividad.confirmaciones[hijo.id.toString()]
  const isConfirmed = confirmacionActual === 'confirmado'
  const isRejected = confirmacionActual === 'no_asiste'

  // Detectar si la actividad tiene circular vinculada
  const { circularInfo, loading: circularLoading } = useCircularCheck(actividad.id, hijo.id)
  const [showWizard, setShowWizard] = useState(false)

  const hasCircular = circularInfo?.hasCircular === true
  const circularFirmada = hasCircular && circularInfo?.estado &&
    ['firmada', 'pdf_generado', 'archivada'].includes(circularInfo.estado)

  // Si el wizard está abierto, mostrar solo el wizard
  if (showWizard && hasCircular) {
    return (
      <div className="space-y-4">
        <CircularDigitalWizard
          actividadId={typeof actividad.id === 'string' ? parseInt(actividad.id) : actividad.id}
          educandoId={hijo.id}
          onComplete={() => setShowWizard(false)}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header del hijo */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={hijo.foto} />
            <AvatarFallback className="text-lg">
              {hijo.nombre.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{hijo.nombre} {hijo.apellidos}</p>
            <p className="text-sm text-gray-600">{hijo.seccion}</p>
          </div>
        </div>
        {hasCircular ? (
          circularFirmada ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              ✅ Autorización firmada
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
              📋 Pendiente de firma
            </Badge>
          )
        ) : (
          <ConfirmationBadge
            estado={isConfirmed ? 'confirmado' : isRejected ? 'no_asiste' : 'pendiente'}
          />
        )}
      </div>

      {/* Sección de autorización digital si tiene circular */}
      {!circularLoading && hasCircular && (
        <div className="space-y-3">
          {circularFirmada ? (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                ✅ La autorización para esta actividad ya ha sido firmada digitalmente.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="p-4 border-2 border-amber-300 bg-amber-50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <p className="font-medium text-amber-800">
                  Esta actividad requiere autorización digital
                </p>
              </div>
              <p className="text-sm text-amber-700">
                Debes firmar la circular de autorización para que {hijo.nombre} pueda participar.
              </p>
              <Button
                onClick={() => setShowWizard(true)}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Firmar autorización
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Formulario de confirmación normal (solo si NO tiene circular) */}
      {!hasCircular && !isConfirmed && !isRejected && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div>
            <Label htmlFor={`comentarios-${hijo.id}`}>Comentarios (opcional)</Label>
            <Textarea
              id={`comentarios-${hijo.id}`}
              placeholder="Algún comentario o información adicional..."
              value={comentarios[hijo.id.toString()] || ''}
              onChange={(e) => onComentarioChange(hijo.id.toString(), e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => onConfirmacion(hijo.id.toString(), 'no_asiste')}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              No podré asistir
            </Button>
            <Button
              onClick={() => onConfirmacion(hijo.id.toString(), 'confirmado')}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Sí, asistiré
            </Button>
          </div>
        </div>
      )}

      {/* Estado confirmado/rechazado (solo si NO tiene circular) */}
      {!hasCircular && (isConfirmed || isRejected) && (
        <div className="space-y-4">
          <Alert className={isConfirmed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className={isConfirmed ? 'text-green-800' : 'text-red-800'}>
              {isConfirmed ? '✅' : '❌'} Has {isConfirmed ? 'confirmado' : 'cancelado'} la asistencia para esta actividad.
            </AlertDescription>
          </Alert>

          {/* Opción para modificar respuesta */}
          <div className="p-4 border rounded-lg space-y-3">
            <p className="text-sm text-gray-500">¿Necesitas cambiar tu respuesta?</p>
            <div>
              <Label htmlFor={`comentarios-edit-${hijo.id}`}>
                {isConfirmed ? "Motivo de cancelación" : "Comentario (opcional)"}
              </Label>
              <Textarea
                id={`comentarios-edit-${hijo.id}`}
                placeholder={isConfirmed ? "Indica el motivo por el que no podrás asistir..." : "Añade un comentario opcional..."}
                value={comentarios[hijo.id.toString()] || ''}
                onChange={(e) => onComentarioChange(hijo.id.toString(), e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="flex space-x-3">
              {isConfirmed ? (
                <Button
                  onClick={() => onConfirmacion(hijo.id.toString(), 'no_asiste')}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar asistencia
                </Button>
              ) : (
                <Button
                  onClick={() => onConfirmacion(hijo.id.toString(), 'confirmado')}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ahora sí asistiré
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documentos enviados (solo para campamentos) */}
      {actividad.tipo === 'campamento' && (
        <DocumentosEnviadosSection
          educandoId={hijo.id}
          actividadId={actividad.id}
        />
      )}
    </div>
  )
}

export function EventoDetailModal({ actividad, isOpen, onClose, hijoSeleccionado }: EventoDetailModalProps) {
  const { hijos } = useFamiliaData()
  const { confirmarAsistencia } = useCalendarioFamilia()

  const [confirmaciones, setConfirmaciones] = useState<Record<string, 'confirmado' | 'no_asiste'>>({})
  const [comentarios, setComentarios] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Hijos que participan en esta actividad
  const hijosParticipantes = useMemo(() =>
    hijos?.filter(hijo => actividad.scoutIds.includes(hijo.id.toString())) || [],
    [hijos, actividad.scoutIds]
  )

  // Tab activa - inicializada con el hijo seleccionado o el primero
  const [tabActiva, setTabActiva] = useState<string>('')

  // Inicializar tab activa cuando cambie el hijo seleccionado o los participantes
  useEffect(() => {
    if (hijosParticipantes.length > 0) {
      // Intentar usar el hijo seleccionado
      if (hijoSeleccionado) {
        const hijoEncontrado = hijosParticipantes.find(h => h.id === hijoSeleccionado)
        if (hijoEncontrado) {
          setTabActiva(hijoEncontrado.id.toString())
          return
        }
      }

      // Intentar leer de sessionStorage
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('hijoSeleccionado')
        if (saved) {
          const hijoEncontrado = hijosParticipantes.find(h => h.id === parseInt(saved, 10))
          if (hijoEncontrado) {
            setTabActiva(hijoEncontrado.id.toString())
            return
          }
        }
      }

      // Fallback al primero
      setTabActiva(hijosParticipantes[0].id.toString())
    }
  }, [hijoSeleccionado, hijosParticipantes])

  // Colores por sección
  const coloresSeccion: Record<string, string> = {
    'Colonia La Veleta': '#FF6B35',
    'Manada Waingunga': '#FFD93D',
    'Tropa Brownsea': '#6BCF7F',
    'Posta Kanhiwara': '#E74C3C',
    'Ruta Walhalla': '#2E7D32'
  }

  const handleConfirmacion = async (scoutId: string, estado: 'confirmado' | 'no_asiste') => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const comentario = comentarios[scoutId] || ''
      const exito = await confirmarAsistencia(actividad.id, scoutId, estado, comentario)

      if (exito) {
        setConfirmaciones(prev => ({ ...prev, [scoutId]: estado }))
        setSubmitMessage({
          type: 'success',
          text: `Asistencia ${estado === 'confirmado' ? 'confirmada' : 'cancelada'} correctamente`
        })
      } else {
        setSubmitMessage({
          type: 'error',
          text: 'Error al procesar la confirmación. Inténtalo de nuevo.'
        })
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Error inesperado. Inténtalo de nuevo.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComentarioChange = (scoutId: string, value: string) => {
    setComentarios(prev => ({ ...prev, [scoutId]: value }))
  }

  const abrirGoogleMaps = () => {
    const query = encodeURIComponent(actividad.lugar)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const calcularDiasRestantes = () => {
    const ahora = new Date()
    const diferencia = actividad.fechaInicio.getTime() - ahora.getTime()
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))

    if (dias < 0) return { text: 'Finalizada', color: 'text-gray-500' }
    if (dias === 0) return { text: 'Hoy', color: 'text-red-600 font-bold' }
    if (dias === 1) return { text: 'Mañana', color: 'text-orange-600 font-bold' }
    if (dias <= 7) return { text: `En ${dias} días`, color: 'text-yellow-600' }
    return { text: `En ${dias} días`, color: 'text-blue-600' }
  }

  const diasRestantes = calcularDiasRestantes()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {actividad.titulo}
              </DialogTitle>
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: coloresSeccion[actividad.seccion] || '#666',
                    color: coloresSeccion[actividad.seccion] || '#666'
                  }}
                >
                  {actividad.seccion}
                </Badge>
                <Badge variant="secondary">
                  {actividad.tipo}
                </Badge>
                <div className={`flex items-center space-x-1 ${diasRestantes.color}`}>
                  <Clock className="h-4 w-4" />
                  <span>{diasRestantes.text}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogDescription className="text-base text-gray-600">
            {actividad.descripcion}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles de fecha y lugar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p className="text-sm text-gray-600">
                      {actividad.fechaInicio.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Horario</p>
                    <p className="text-sm text-gray-600">
                      {actividad.hora_inicio
                        ? `${actividad.hora_inicio.substring(0, 5)}${actividad.hora_fin ? ` - ${actividad.hora_fin.substring(0, 5)}` : ''}`
                        : `${actividad.fechaInicio.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - ${actividad.fechaFin.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Lugar</p>
                    <p className="text-sm text-gray-600">{actividad.lugar}</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={abrirGoogleMaps}
                      className="p-0 h-auto text-xs"
                    >
                      Ver en mapa
                    </Button>
                  </div>
                </div>

                {actividad.precio && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Costo</p>
                      <p className="text-sm text-gray-600">€{actividad.precio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Material necesario */}
            {actividad.materialNecesario && actividad.materialNecesario.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  Material Necesario
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {actividad.materialNecesario.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Confirmaciones por scout con Tabs */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Confirmación de Asistencia
              </h4>

              {hijosParticipantes.length > 0 ? (
                hijosParticipantes.length === 1 ? (
                  // Solo un hijo - no usar tabs
                  <HijoConfirmacionContent
                    hijo={hijosParticipantes[0]}
                    actividad={actividad}
                    confirmaciones={confirmaciones}
                    comentarios={comentarios}
                    isSubmitting={isSubmitting}
                    onConfirmacion={handleConfirmacion}
                    onComentarioChange={handleComentarioChange}
                  />
                ) : (
                  // Múltiples hijos - usar tabs
                  <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
                    <TabsList className="w-full grid mb-4" style={{ gridTemplateColumns: `repeat(${hijosParticipantes.length}, 1fr)` }}>
                      {hijosParticipantes.map(hijo => {
                        const estado = confirmaciones[hijo.id.toString()] ||
                                       actividad.confirmaciones[hijo.id.toString()] ||
                                       'pendiente'
                        return (
                          <TabsTrigger
                            key={hijo.id}
                            value={hijo.id.toString()}
                            className="flex items-center gap-2 relative"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={hijo.foto} />
                              <AvatarFallback className="text-xs">
                                {hijo.nombre.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline truncate max-w-[80px]">{hijo.nombre}</span>
                            {/* Indicador de estado */}
                            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              estado === 'confirmado' ? 'bg-green-500' :
                              estado === 'no_asiste' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                          </TabsTrigger>
                        )
                      })}
                    </TabsList>

                    {hijosParticipantes.map(hijo => (
                      <TabsContent key={hijo.id} value={hijo.id.toString()} className="mt-0">
                        <HijoConfirmacionContent
                          hijo={hijo}
                          actividad={actividad}
                          confirmaciones={confirmaciones}
                          comentarios={comentarios}
                          isSubmitting={isSubmitting}
                          onConfirmacion={handleConfirmacion}
                          onComentarioChange={handleComentarioChange}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                )
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Ninguno de tus hijos participa en esta actividad
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar con información adicional */}
          <div className="space-y-6">
            {/* Resumen rápido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Resumen Rápido</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participantes:</span>
                  <span className="font-medium">{hijosParticipantes.length}</span>
                </div>
                {actividad.cupoMaximo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cupo máximo:</span>
                    <span className="font-medium">{actividad.cupoMaximo}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">
                    {Math.round((actividad.fechaFin.getTime() - actividad.fechaInicio.getTime()) / (1000 * 60 * 60))}h
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de confirmaciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-blue-800">Estado de Confirmaciones</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Confirmados:</span>
                  <span className="font-medium text-blue-800">
                    {Object.values(actividad.confirmaciones).filter(c => c === 'confirmado').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Pendientes:</span>
                  <span className="font-medium text-blue-800">
                    {Object.values(actividad.confirmaciones).filter(c => c === 'pendiente' || !c).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">No asisten:</span>
                  <span className="font-medium text-blue-800">
                    {Object.values(actividad.confirmaciones).filter(c => c === 'no_asiste').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Información importante para actividades próximas */}
            {(diasRestantes.text === 'Hoy' || diasRestantes.text === 'Mañana' ||
             (diasRestantes.text.includes('días') && parseInt(diasRestantes.text) <= 3)) && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Recordatorio:</strong> Esta actividad está próxima.
                  Asegúrate de tener listo el material necesario.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Mensaje de estado */}
        {submitMessage && (
          <div className="mt-4">
            <Alert variant={submitMessage.type === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                {submitMessage.text}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
