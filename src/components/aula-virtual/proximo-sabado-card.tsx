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
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getApiUrl } from '@/lib/api-utils'
import type {
  ProximoSabado,
  ConfirmacionSabado,
  ScoutSinConfirmar
} from '@/hooks/useDashboardScouter'

interface ProximoSabadoCardProps {
  data: ProximoSabado | null
  expanded: boolean
  onToggleExpand: () => void
  loading?: boolean
  className?: string
}

export function ProximoSabadoCard({
  data,
  expanded,
  onToggleExpand,
  loading,
  className
}: ProximoSabadoCardProps) {
  const [activeTab, setActiveTab] = useState<'confirmados' | 'no_asisten' | 'pendientes'>('confirmados')
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
      // Intentar obtener token existente
      let response = await fetch(`${getApiUrl()}/api/actividades/${data.actividad.id}/enlace`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      let result = await response.json()

      if (result.success && result.data.enlace_token) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        setShareLink(`${baseUrl}/confirmacion/sabado/${result.data.enlace_token}`)
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
          setShareLink(`${baseUrl}/confirmacion/sabado/${result.data.enlace_token}`)
        }
      }
    } catch (err) {
      console.error('Error obteniendo enlace de confirmacion:', err)
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
    const fecha = new Date(data.actividad.fecha_inicio)
    const fechaStr = fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    const mensaje = `Hola familias! Confirmad la asistencia de vuestros hijos a la reunion del ${fechaStr}. Clicad aqui: ${shareLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }, [shareLink, data])

  if (!data) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Proximo Sabado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No hay reuniones de sabado programadas
          </div>
        </CardContent>
      </Card>
    )
  }

  const { actividad, estadisticas, confirmaciones, scouts_sin_confirmar } = data
  const fecha = new Date(actividad.fecha_inicio)
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  const confirmados = confirmaciones?.filter(c => c.asistira) || []
  const noAsisten = confirmaciones?.filter(c => !c.asistira) || []
  const pendientes = scouts_sin_confirmar || []

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Proximo Sabado
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
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
              <Share2 className="h-5 w-5 text-blue-600" />
              Compartir enlace de confirmacion
            </DialogTitle>
            <DialogDescription>
              Comparte este enlace con las familias para que confirmen la asistencia de sus hijos a <strong>{actividad.titulo}</strong>.
            </DialogDescription>
          </DialogHeader>

          {shareLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
                Las familias que reciban este enlace podran confirmar la asistencia de sus hijos directamente.
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
        {/* Info de la actividad */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{actividad.titulo}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {fechaFormateada}
            </span>
            {actividad.hora_inicio && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {actividad.hora_inicio.slice(0, 5)}
                {actividad.hora_fin && ` - ${actividad.hora_fin.slice(0, 5)}`}
              </span>
            )}
            {actividad.lugar && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {actividad.lugar}
              </span>
            )}
          </div>
        </div>

        {/* Estadisticas */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
          <button
            onClick={() => expanded && setActiveTab('confirmados')}
            className={cn(
              'text-center p-2 rounded-md transition-colors',
              expanded && activeTab === 'confirmados' && 'bg-card shadow-sm'
            )}
          >
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{estadisticas.confirmados}</span>
            </div>
            <span className="text-xs text-muted-foreground">Asisten</span>
          </button>

          <button
            onClick={() => expanded && setActiveTab('no_asisten')}
            className={cn(
              'text-center p-2 rounded-md border-x border-border transition-colors',
              expanded && activeTab === 'no_asisten' && 'bg-card shadow-sm'
            )}
          >
            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{estadisticas.noAsisten}</span>
            </div>
            <span className="text-xs text-muted-foreground">No asisten</span>
          </button>

          <button
            onClick={() => expanded && setActiveTab('pendientes')}
            className={cn(
              'text-center p-2 rounded-md transition-colors',
              expanded && activeTab === 'pendientes' && 'bg-card shadow-sm'
            )}
          >
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{estadisticas.pendientes}</span>
            </div>
            <span className="text-xs text-muted-foreground">Pendientes</span>
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="w-full">
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            {estadisticas.confirmados > 0 && (
              <div
                className="bg-green-500 transition-all duration-300"
                style={{
                  width: `${(estadisticas.confirmados / estadisticas.total) * 100}%`
                }}
              />
            )}
            {estadisticas.noAsisten > 0 && (
              <div
                className="bg-red-500 transition-all duration-300"
                style={{
                  width: `${(estadisticas.noAsisten / estadisticas.total) * 100}%`
                }}
              />
            )}
            {estadisticas.pendientes > 0 && (
              <div
                className="bg-yellow-400 transition-all duration-300"
                style={{
                  width: `${(estadisticas.pendientes / estadisticas.total) * 100}%`
                }}
              />
            )}
          </div>
        </div>

        {/* Lista expandible */}
        {expanded && confirmaciones && (
          <div className="border-t pt-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {activeTab === 'confirmados' && (
                <>
                  {confirmados.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No hay confirmaciones todavia
                    </p>
                  ) : (
                    confirmados.map(c => (
                      <ConfirmacionItem key={c.id} confirmacion={c} />
                    ))
                  )}
                </>
              )}

              {activeTab === 'no_asisten' && (
                <>
                  {noAsisten.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Todos asisten
                    </p>
                  ) : (
                    noAsisten.map(c => (
                      <ConfirmacionItem key={c.id} confirmacion={c} />
                    ))
                  )}
                </>
              )}

              {activeTab === 'pendientes' && (
                <>
                  {pendientes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Todos han confirmado
                    </p>
                  ) : (
                    pendientes.map(scout => (
                      <ScoutPendienteItem key={scout.id} scout={scout} />
                    ))
                  )}
                </>
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

function ConfirmacionItem({ confirmacion }: { confirmacion: ConfirmacionSabado }) {
  const fecha = new Date(confirmacion.confirmado_en)

  return (
    <div className="flex items-center justify-between p-2 bg-card border rounded-lg">
      <div className="flex items-center gap-2">
        {confirmacion.asistira ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <div>
          <p className="text-sm font-medium">
            {confirmacion.educando_nombre} {confirmacion.educando_apellidos}
          </p>
          {confirmacion.comentarios && (
            <p className="text-xs text-muted-foreground">{confirmacion.comentarios}</p>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  )
}

function ScoutPendienteItem({ scout }: { scout: ScoutSinConfirmar }) {
  return (
    <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
          {scout.nombre} {scout.apellidos}
        </p>
      </div>
      <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300">
        Sin confirmar
      </Badge>
    </div>
  )
}
