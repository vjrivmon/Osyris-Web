'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Tent,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  ExternalLink,
  Euro,
  HelpCircle,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getApiUrl } from '@/lib/api-utils'
import type {
  ProximoCampamento,
  InscripcionCampamento,
  ScoutSinConfirmar
} from '@/hooks/useDashboardScouter'

interface ProximoCampamentoCardProps {
  data: ProximoCampamento | null
  expanded: boolean
  onToggleExpand: () => void
  loading?: boolean
  className?: string
}

export function ProximoCampamentoCard({
  data,
  expanded,
  onToggleExpand,
  loading,
  className
}: ProximoCampamentoCardProps) {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'pendientes' | 'completados' | 'no_asisten' | 'sin_inscribir'>('todos')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    if (!data?.actividad.id) return

    setShareDialogOpen(true)
    setShareLoading(true)
    setCopied(false)

    try {
      const token = localStorage.getItem('token')
      // Primero intentar obtener token existente
      let response = await fetch(`${getApiUrl()}/api/actividades/${data.actividad.id}/enlace`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      let result = await response.json()

      if (result.success && result.data.enlace_token) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        setShareLink(`${baseUrl}/inscripcion/campamento/${result.data.enlace_token}`)
      } else {
        // Generar nuevo token
        response = await fetch(`${getApiUrl()}/api/actividades/${data.actividad.id}/generar-enlace`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        result = await response.json()

        if (result.success && result.data.enlace_token) {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
          setShareLink(`${baseUrl}/inscripcion/campamento/${result.data.enlace_token}`)
        }
      }
    } catch (err) {
      console.error('Error obteniendo enlace de inscripcion:', err)
    } finally {
      setShareLoading(false)
    }
  }, [data?.actividad.id])

  const handleCopy = useCallback(async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback para navegadores sin clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareLink])

  const handleWhatsApp = useCallback(() => {
    if (!shareLink || !data) return
    const mensaje = `Hola familias! Ya podeis inscribir a vuestros hijos al ${data.actividad.titulo}. Clicad aqui: ${shareLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }, [shareLink, data])

  if (!data) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tent className="h-5 w-5 text-emerald-600" />
            Proximo Campamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No hay campamentos programados proximamente
          </div>
        </CardContent>
      </Card>
    )
  }

  const { actividad, estadisticas, inscripciones, educandos_sin_inscribir } = data
  const fechaInicio = new Date(actividad.fecha_inicio)
  const fechaFin = actividad.fecha_fin ? new Date(actividad.fecha_fin) : null

  const formatFecha = (fecha: Date) =>
    fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })

  // Filtrar inscripciones
  const inscripcionesFiltradas = inscripciones?.filter(i => {
    switch (activeFilter) {
      case 'pendientes':
        return i.asistira && (!i.circular_firmada_drive_id || !i.justificante_pago_drive_id)
      case 'completados':
        return i.asistira && i.circular_firmada_drive_id && i.justificante_pago_drive_id
      case 'no_asisten':
        return !i.asistira || i.estado === 'no_asiste'
      case 'sin_inscribir':
        return false // Se muestra lista separada
      default:
        return true
    }
  }) || []

  // Calcular totales para filtros
  const totalPendientes = inscripciones?.filter(
    i => i.asistira && (!i.circular_firmada_drive_id || !i.justificante_pago_drive_id)
  ).length || 0
  const totalCompletados = inscripciones?.filter(
    i => i.asistira && i.circular_firmada_drive_id && i.justificante_pago_drive_id
  ).length || 0
  const totalNoAsisten = inscripciones?.filter(
    i => !i.asistira || i.estado === 'no_asiste'
  ).length || 0
  const totalSinInscribir = educandos_sin_inscribir?.length || estadisticas.sinResponder || 0

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tent className="h-5 w-5 text-emerald-600" />
            Proximo Campamento
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
        </div>
      </CardHeader>

      {/* Dialog de compartir enlace */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-emerald-600" />
              Compartir enlace de inscripcion
            </DialogTitle>
            <DialogDescription>
              Comparte este enlace con las familias para que inscriban a sus hijos en <strong>{actividad.titulo}</strong>.
            </DialogDescription>
          </DialogHeader>

          {shareLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-muted-foreground">Generando enlace...</span>
            </div>
          ) : shareLink ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareLink}
                  className="text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {copied && (
                <p className="text-sm text-green-600 font-medium">Enlace copiado al portapapeles</p>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopy}
                  className="w-full gap-2"
                  variant={copied ? "outline" : "default"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar enlace
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full gap-2 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  Compartir por WhatsApp
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Las familias que reciban este enlace podran inscribir a sus hijos directamente.
                Si no tienen sesion iniciada, se les pedira que inicien sesion primero.
              </p>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No se pudo generar el enlace. Intentalo de nuevo.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CardContent className="space-y-4">
        {/* Info del campamento */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-foreground">{actividad.titulo}</h3>
            {actividad.precio && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                <Euro className="h-3 w-3 mr-1" />
                {actividad.precio}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatFecha(fechaInicio)}
              {fechaFin && ` - ${formatFecha(fechaFin)}`}
            </span>
            {actividad.lugar && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {actividad.lugar}
              </span>
            )}
          </div>

          {/* Link a circular */}
          {actividad.circular_drive_url && (
            <a
              href={actividad.circular_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <FileText className="h-4 w-4" />
              Ver circular
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Estadisticas principales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-2xl font-bold">{estadisticas.inscritos}</span>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-300">Inscritos</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-2xl font-bold">{estadisticas.pagados}</span>
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-300">Pagados</span>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-2xl font-bold">{totalSinInscribir}</span>
            </div>
            <span className="text-xs text-yellow-700 dark:text-yellow-300">Sin responder</span>
          </div>
        </div>

        {/* Estadisticas de documentos */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-purple-500 dark:text-purple-400" />
              <span className="font-semibold text-purple-600 dark:text-purple-400">{estadisticas.circularesSubidas}</span>
            </div>
            <span className="text-muted-foreground">Circulares</span>
          </div>

          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CreditCard className="h-3 w-3 text-green-500 dark:text-green-400" />
              <span className="font-semibold text-green-600 dark:text-green-400">{estadisticas.justificantesSubidos}</span>
            </div>
            <span className="text-muted-foreground">Justificantes</span>
          </div>

          <div className="p-2 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-500 dark:text-red-400" />
              <span className="font-semibold text-red-600 dark:text-red-400">{estadisticas.noAsisten}</span>
            </div>
            <span className="text-muted-foreground">No asisten</span>
          </div>
        </div>

        {/* Lista expandible */}
        {expanded && (inscripciones || educandos_sin_inscribir) && (
          <div className="border-t pt-4 space-y-3">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={activeFilter === 'todos'}
                onClick={() => setActiveFilter('todos')}
                label={`Todos (${inscripciones?.length || 0})`}
              />
              <FilterButton
                active={activeFilter === 'sin_inscribir'}
                onClick={() => setActiveFilter('sin_inscribir')}
                label={`Sin responder (${totalSinInscribir})`}
                variant="yellow"
              />
              <FilterButton
                active={activeFilter === 'pendientes'}
                onClick={() => setActiveFilter('pendientes')}
                label={`Docs. pendientes (${totalPendientes})`}
                variant="orange"
              />
              <FilterButton
                active={activeFilter === 'completados'}
                onClick={() => setActiveFilter('completados')}
                label={`Completos (${totalCompletados})`}
                variant="green"
              />
              <FilterButton
                active={activeFilter === 'no_asisten'}
                onClick={() => setActiveFilter('no_asisten')}
                label={`No asisten (${totalNoAsisten})`}
                variant="red"
              />
            </div>

            {/* Lista */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {activeFilter === 'sin_inscribir' ? (
                // Mostrar educandos sin inscribir
                educandos_sin_inscribir && educandos_sin_inscribir.length > 0 ? (
                  educandos_sin_inscribir.map(educando => (
                    <EducandoSinInscribirItem key={educando.id} educando={educando} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Todos los educandos han respondido
                  </p>
                )
              ) : inscripcionesFiltradas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay inscripciones en esta categoria
                </p>
              ) : (
                inscripcionesFiltradas.map(inscripcion => (
                  <InscripcionItem key={inscripcion.id} inscripcion={inscripcion} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Boton expandir */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Cargando...</span>
          ) : expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar lista
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Ver lista completa
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  variant = 'default'
}: {
  active: boolean
  onClick: () => void
  label: string
  variant?: 'default' | 'yellow' | 'orange' | 'green' | 'red'
}) {
  const variantStyles = {
    default: active
      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
    yellow: active
      ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    orange: active
      ? 'bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    green: active
      ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200'
      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50',
    red: active
      ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
        variantStyles[variant]
      )}
    >
      {label}
    </button>
  )
}

function EducandoSinInscribirItem({ educando }: { educando: ScoutSinConfirmar }) {
  return (
    <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-yellow-500" />
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
          {educando.nombre} {educando.apellidos}
        </p>
      </div>
      <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300">
        Sin responder
      </Badge>
    </div>
  )
}

function InscripcionItem({ inscripcion }: { inscripcion: InscripcionCampamento }) {
  const tieneCircular = !!inscripcion.circular_firmada_drive_id
  const tieneJustificante = !!inscripcion.justificante_pago_drive_id
  const noAsiste = !inscripcion.asistira || inscripcion.estado === 'no_asiste'

  if (noAsiste) {
    return (
      <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {inscripcion.educando_nombre} {inscripcion.educando_apellidos}
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300">
          No asiste
        </Badge>
      </div>
    )
  }

  const isComplete = tieneCircular && tieneJustificante

  return (
    <div className={cn(
      'p-3 border rounded-lg',
      isComplete ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-card'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <p className="text-sm font-medium">
            {inscripcion.educando_nombre} {inscripcion.educando_apellidos}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            inscripcion.pagado
              ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
          )}
        >
          {inscripcion.pagado ? 'Pagado' : 'Sin pagar'}
        </Badge>
      </div>

      <div className="flex gap-3 text-xs">
        <div className={cn(
          'flex items-center gap-1',
          tieneCircular ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}>
          <FileText className="h-3 w-3" />
          {tieneCircular ? 'Circular OK' : 'Sin circular'}
        </div>
        <div className={cn(
          'flex items-center gap-1',
          tieneJustificante ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        )}>
          <CreditCard className="h-3 w-3" />
          {tieneJustificante ? 'Justificante OK' : 'Sin justificante'}
        </div>
      </div>
    </div>
  )
}
