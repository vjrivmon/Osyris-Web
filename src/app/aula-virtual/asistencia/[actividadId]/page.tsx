'use client'

/**
 * Control de Asistencia In-Situ
 * Issue #6
 * 
 * Página mobile-first para pasar lista en campamentos y salidas
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Check,
  X,
  CreditCard,
  Users,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  Clock,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { useAsistenciaCampamento } from "@/hooks/useAsistenciaCampamento"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function AsistenciaPage() {
  const params = useParams()
  const actividadId = Number(params.actividadId)
  
  const {
    educandos,
    actividad,
    estadisticas,
    loading,
    error,
    marcarLlegada,
    marcarSIP,
    marcarNoAsiste,
    actualizarObservaciones,
    refresh
  } = useAsistenciaCampamento(actividadId)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEducando, setSelectedEducando] = useState<number | null>(null)
  const [observacionesDialogOpen, setObservacionesDialogOpen] = useState(false)
  const [observacionesText, setObservacionesText] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filtrar educandos por búsqueda
  const educandosFiltrados = educandos.filter(e => 
    `${e.educando_nombre} ${e.educando_apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Agrupar por sección
  const educandosPorSeccion = educandosFiltrados.reduce((acc, e) => {
    const seccion = e.seccion_nombre || 'Sin sección'
    if (!acc[seccion]) acc[seccion] = { educandos: [], color: e.seccion_color }
    acc[seccion].educandos.push(e)
    return acc
  }, {} as Record<string, { educandos: typeof educandos, color: string }>)

  const handleMarcarLlegada = async (educandoId: number, llegado: boolean) => {
    setActionLoading(`llegada-${educandoId}`)
    try {
      await marcarLlegada(educandoId, llegado)
      toast.success(llegado ? '✓ Llegada registrada' : 'Llegada desmarcada')
    } catch {
      toast.error('Error al registrar llegada')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarcarSIP = async (educandoId: number, entregado: boolean) => {
    setActionLoading(`sip-${educandoId}`)
    try {
      await marcarSIP(educandoId, entregado)
      toast.success(entregado ? '✓ SIP registrado' : 'SIP desmarcado')
    } catch {
      toast.error('Error al registrar SIP')
    } finally {
      setActionLoading(null)
    }
  }

  const handleGuardarObservaciones = async () => {
    if (!selectedEducando) return
    try {
      await actualizarObservaciones(selectedEducando, observacionesText)
      toast.success('Observaciones guardadas')
      setObservacionesDialogOpen(false)
    } catch {
      toast.error('Error al guardar observaciones')
    }
  }

  const abrirObservaciones = (educandoId: number, observaciones: string | null) => {
    setSelectedEducando(educandoId)
    setObservacionesText(observaciones || '')
    setObservacionesDialogOpen(true)
  }

  // Calcular progreso
  const progreso = estadisticas 
    ? Math.round((estadisticas.completos / estadisticas.total_inscritos) * 100) || 0
    : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando lista de asistencia...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refresh}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="pb-24"> {/* Padding bottom for fixed stats bar */}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/aula-virtual">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{actividad?.titulo || 'Control de Asistencia'}</h1>
            {actividad?.fecha && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(actividad.fecha), "EEEE d 'de' MMMM", { locale: es })}
              </p>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar educando..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de educandos por sección */}
      <div className="p-4 space-y-6">
        {Object.entries(educandosPorSeccion).map(([seccion, data]) => (
          <div key={seccion}>
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.color || '#888' }}
              />
              <h2 className="font-semibold">{seccion}</h2>
              <Badge variant="outline" className="ml-auto">
                {data.educandos.filter(e => e.ha_llegado).length}/{data.educandos.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {data.educandos.map((educando) => (
                <Card 
                  key={educando.educando_id}
                  className={`transition-colors ${
                    educando.ha_llegado && educando.sip_entregado 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200' 
                      : educando.ha_llegado 
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200'
                        : ''
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Nombre */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {educando.educando_nombre} {educando.educando_apellidos}
                        </p>
                        {educando.hora_llegada && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(educando.hora_llegada), 'HH:mm')}
                          </p>
                        )}
                      </div>

                      {/* Botones de acción - Touch-friendly (44x44 mínimo) */}
                      <div className="flex items-center gap-2">
                        {/* Observaciones */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-11 w-11 ${educando.observaciones ? 'text-blue-600' : 'text-muted-foreground'}`}
                          onClick={() => abrirObservaciones(educando.educando_id, educando.observaciones)}
                        >
                          <MessageSquare className="h-5 w-5" />
                        </Button>

                        {/* SIP */}
                        <Button
                          variant={educando.sip_entregado ? 'default' : 'outline'}
                          size="icon"
                          className={`h-11 w-11 ${educando.sip_entregado ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => handleMarcarSIP(educando.educando_id, !educando.sip_entregado)}
                          disabled={actionLoading === `sip-${educando.educando_id}`}
                        >
                          {actionLoading === `sip-${educando.educando_id}` ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <CreditCard className="h-5 w-5" />
                          )}
                        </Button>

                        {/* Llegada */}
                        <Button
                          variant={educando.ha_llegado ? 'default' : 'outline'}
                          size="icon"
                          className={`h-11 w-11 ${educando.ha_llegado ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          onClick={() => handleMarcarLlegada(educando.educando_id, !educando.ha_llegado)}
                          disabled={actionLoading === `llegada-${educando.educando_id}`}
                        >
                          {actionLoading === `llegada-${educando.educando_id}` ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : educando.ha_llegado ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {educandosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron educandos' : 'No hay inscripciones para esta actividad'}
            </p>
          </div>
        )}
      </div>

      {/* Barra de estadísticas fija abajo */}
      {estadisticas && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">
                {estadisticas.completos}/{estadisticas.total_inscritos} completos
              </span>
            </div>
            <Progress value={progreso} className="h-2 mb-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{estadisticas.han_llegado}</p>
                <p className="text-xs text-muted-foreground">Han llegado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.sip_entregados}</p>
                <p className="text-xs text-muted-foreground">SIP entregado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {estadisticas.total_inscritos - estadisticas.han_llegado}
                </p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de observaciones */}
      <Dialog open={observacionesDialogOpen} onOpenChange={setObservacionesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observaciones</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Añadir observaciones..."
            value={observacionesText}
            onChange={(e) => setObservacionesText(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setObservacionesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarObservaciones}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
