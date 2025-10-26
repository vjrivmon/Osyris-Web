'use client'

import { useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  User,
  Phone,
  Mail,
  ExternalLink,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useCalendarioFamilia, ActividadCalendario } from '@/hooks/useCalendarioFamilia'
import { ConfirmationBadge, ScoutConfirmationBadge } from './confirmation-badge'
import { useFamiliaData } from '@/hooks/useFamiliaData'

interface EventoDetailModalProps {
  actividad: ActividadCalendario
  isOpen: boolean
  onClose: () => void
}

export function EventoDetailModal({ actividad, isOpen, onClose }: EventoDetailModalProps) {
  const { hijos } = useFamiliaData()
  const { confirmarAsistencia, generarICS } = useCalendarioFamilia()

  const [confirmaciones, setConfirmaciones] = useState<Record<string, 'confirmado' | 'no_asiste'>>({})
  const [comentarios, setComentarios] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Colores por sección
  const coloresSeccion = {
    'Colonia La Veleta': '#FF6B35',
    'Manada Waingunga': '#FFD93D',
    'Tropa Brownsea': '#6BCF7F',
    'Posta Kanhiwara': '#E74C3C',
    'Ruta Walhalla': '#2E7D32'
  }

  // Hijos que participan en esta actividad
  const hijosParticipantes = hijos?.filter(hijo => actividad.scoutIds.includes(hijo.id.toString())) || []

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

  const descargarICS = () => {
    const icsContent = generarICS(actividad)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${actividad.titulo.replace(/[^a-z0-9]/gi, '_')}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const abrirGoogleMaps = () => {
    const query = encodeURIComponent(actividad.lugar)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const abrirGoogleCalendar = () => {
    const fechaInicio = actividad.fechaInicio.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const fechaFin = actividad.fechaFin.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const titulo = encodeURIComponent(actividad.titulo)
    const descripcion = encodeURIComponent(actividad.descripcion)
    const lugar = encodeURIComponent(actividad.lugar)

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaInicio}/${fechaFin}&details=${descripcion}&location=${lugar}`
    window.open(url, '_blank')
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {actividad.titulo}
              </DialogTitle>
              <div className="flex items-center space-x-3 mb-4">
                <Badge
                  variant="outline"
                  style={{
                    borderColor: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion],
                    color: coloresSeccion[actividad.seccion as keyof typeof coloresSeccion]
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

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={abrirGoogleCalendar}
                className="whitespace-nowrap"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={descargarICS}
                className="whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                .ics
              </Button>
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
                      {actividad.fechaInicio.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {actividad.fechaFin.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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

            {/* Monitor responsable */}
            <div>
              <h4 className="font-medium mb-3">Monitor Responsable</h4>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={actividad.monitorResponsable.foto} />
                  <AvatarFallback>
                    {actividad.monitorResponsable.nombre.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{actividad.monitorResponsable.nombre}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{actividad.monitorResponsable.contacto}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </div>

            {/* Confirmaciones por scout */}
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Confirmación de Asistencia
              </h4>

              <div className="space-y-4">
                {hijosParticipantes.map(hijo => {
                  const confirmacionActual = confirmaciones[hijo.id.toString()] ||
                                           actividad.confirmaciones[hijo.id.toString()]
                  const isConfirmed = confirmacionActual === 'confirmado'
                  const isRejected = confirmacionActual === 'no_asiste'

                  return (
                    <div key={hijo.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={hijo.foto} />
                            <AvatarFallback>
                              {hijo.nombre.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{hijo.nombre} {hijo.apellidos}</p>
                            <p className="text-sm text-gray-600">{hijo.seccion}</p>
                          </div>
                        </div>

                        <ConfirmationBadge
                          estado={isConfirmed ? 'confirmado' : isRejected ? 'no_asiste' : 'pendiente'}
                        />
                      </div>

                      {!isConfirmed && !isRejected && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`comentarios-${hijo.id}`}>Comentarios (opcional)</Label>
                            <Textarea
                              id={`comentarios-${hijo.id}`}
                              placeholder="Algún comentario o información adicional..."
                              value={comentarios[hijo.id.toString()] || ''}
                              onChange={(e) => setComentarios(prev => ({
                                ...prev,
                                [hijo.id.toString()]: e.target.value
                              }))}
                              className="mt-1"
                              rows={2}
                            />
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleConfirmacion(hijo.id.toString(), 'confirmado')}
                              disabled={isSubmitting}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Sí, asistiré
                            </Button>
                            <Button
                              onClick={() => handleConfirmacion(hijo.id.toString(), 'no_asiste')}
                              disabled={isSubmitting}
                              variant="outline"
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              No podré asistir
                            </Button>
                          </div>
                        </div>
                      )}

                      {(isConfirmed || isRejected) && (
                        <Alert>
                          <AlertDescription>
                            {isConfirmed ? '✅' : '❌'} Has {isConfirmed ? 'confirmado' : 'cancelado'} la asistencia para esta actividad.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )
                })}

                {hijosParticipantes.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Ninguno de tus hijos participa en esta actividad
                    </p>
                  </div>
                )}
              </div>
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

            {/* Información importante */}
            {diasRestantes.text === 'Hoy' || diasRestantes.text === 'Mañana' ||
             (diasRestantes.text.includes('días') && parseInt(diasRestantes.text) <= 3) && (
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