'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  FileCheck,
  CheckCircle,
  Clock,
  Eye,
  ExternalLink,
  Loader2,
  AlertCircle,
  Banknote,
  X
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { useVerificacionCirculares } from "@/hooks/useVerificacionCirculares"
import { toast } from "sonner"

interface Circular {
  id: number
  actividad_id: number
  educando_id: number
  circular_firmada_drive_id: string | null
  circular_firmada_url: string | null
  fecha_subida_circular: string | null
  circular_verificada: boolean
  circular_verificada_por: number | null
  circular_verificada_fecha: string | null
  pagado: boolean
  estado: string
  educando_nombre: string
  educando_apellidos: string
  seccion_nombre: string
  seccion_id: number
  seccion_color: string
  familiar_nombre: string | null
  familiar_apellidos: string | null
  verificador_nombre: string | null
  verificador_apellidos: string | null
}

interface Props {
  actividadId: number
  actividadTitulo?: string
  seccionId?: number
}

export function VerificacionCircularesCard({ actividadId, actividadTitulo, seccionId }: Props) {
  const { circulares, estadisticas, loading, error, verificarCircular, refresh } = useVerificacionCirculares(actividadId, seccionId)
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null)
  const [verificando, setVerificando] = useState(false)

  const handleVerificar = async () => {
    if (!selectedCircular) return
    
    setVerificando(true)
    try {
      await verificarCircular(selectedCircular.id)
      toast.success('Circular verificada correctamente')
      setSelectedCircular(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al verificar')
    } finally {
      setVerificando(false)
    }
  }

  // Construir URL de preview de Google Drive
  const getDrivePreviewUrl = (driveId: string) => {
    return `https://drive.google.com/file/d/${driveId}/preview`
  }

  // Calcular porcentaje de verificadas
  const porcentajeVerificadas = estadisticas
    ? estadisticas.total_subidas > 0
      ? Math.round((estadisticas.verificadas / estadisticas.total_subidas) * 100)
      : 0
    : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Cargando circulares...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="font-medium text-red-800">Error al cargar circulares</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh} className="mt-4">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const circularesPendientes = circulares.filter(c => !c.circular_verificada)
  const circularesVerificadas = circulares.filter(c => c.circular_verificada)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                Verificación de Circulares
              </CardTitle>
              <CardDescription>
                {actividadTitulo || 'Campamento'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estadísticas */}
          {estadisticas && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {estadisticas.total_subidas}
                  </div>
                  <div className="text-xs text-muted-foreground">Subidas</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {estadisticas.verificadas}
                  </div>
                  <div className="text-xs text-muted-foreground">Verificadas</div>
                </div>
                <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {estadisticas.pendientes_verificar}
                  </div>
                  <div className="text-xs text-muted-foreground">Pendientes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-500">
                    {estadisticas.sin_subir}
                  </div>
                  <div className="text-xs text-muted-foreground">Sin subir</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso de verificación</span>
                  <span className="font-medium">{porcentajeVerificadas}%</span>
                </div>
                <Progress value={porcentajeVerificadas} className="h-2" />
              </div>
            </div>
          )}

          {/* Lista de circulares pendientes */}
          {circularesPendientes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Pendientes de verificar ({circularesPendientes.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {circularesPendientes.map((circular) => (
                  <div
                    key={circular.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {circular.educando_nombre} {circular.educando_apellidos}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge
                            variant="outline"
                            style={{ borderColor: circular.seccion_color, color: circular.seccion_color }}
                          >
                            {circular.seccion_nombre}
                          </Badge>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          <span>
                            {circular.fecha_subida_circular
                              ? formatDistanceToNow(new Date(circular.fecha_subida_circular), { addSuffix: true, locale: es })
                              : 'Fecha desconocida'}
                          </span>
                          {!circular.pagado && (
                            <>
                              <span>·</span>
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                <Banknote className="h-3 w-3 mr-1" />
                                Sin pagar
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCircular(circular)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Revisar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de circulares verificadas (colapsable) */}
          {circularesVerificadas.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Verificadas ({circularesVerificadas.length})
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {circularesVerificadas.map((circular) => (
                  <div
                    key={circular.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/10"
                  >
                    <div>
                      <p className="font-medium">
                        {circular.educando_nombre} {circular.educando_apellidos}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Verificada por {circular.verificador_nombre} {circular.verificador_apellidos}
                        {circular.circular_verificada_fecha && (
                          <> · {format(new Date(circular.circular_verificada_fecha), "d MMM yyyy, HH:mm", { locale: es })}</>
                        )}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {circulares.length === 0 && (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium">No hay circulares subidas</h3>
              <p className="text-sm text-muted-foreground">
                Las circulares aparecerán aquí cuando las familias las suban
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de preview y verificación */}
      <Dialog open={!!selectedCircular} onOpenChange={(open) => !open && setSelectedCircular(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Circular de {selectedCircular?.educando_nombre} {selectedCircular?.educando_apellidos}
            </DialogTitle>
            <DialogDescription>
              {selectedCircular?.seccion_nombre} · Subida{' '}
              {selectedCircular?.fecha_subida_circular
                ? formatDistanceToNow(new Date(selectedCircular.fecha_subida_circular), { addSuffix: true, locale: es })
                : 'fecha desconocida'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info de estado */}
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant={selectedCircular?.pagado ? "default" : "outline"} className={selectedCircular?.pagado ? "bg-green-100 text-green-700" : "text-amber-600 border-amber-300"}>
                <Banknote className="h-3 w-3 mr-1" />
                {selectedCircular?.pagado ? 'Pagado' : 'Sin pagar'}
              </Badge>
              <Badge variant="outline">
                Estado: {selectedCircular?.estado}
              </Badge>
              {selectedCircular?.familiar_nombre && (
                <span className="text-sm text-muted-foreground">
                  Subida por: {selectedCircular.familiar_nombre} {selectedCircular.familiar_apellidos}
                </span>
              )}
            </div>

            {/* Preview del documento */}
            <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {selectedCircular?.circular_firmada_drive_id ? (
                <iframe
                  src={getDrivePreviewUrl(selectedCircular.circular_firmada_drive_id)}
                  className="w-full h-[500px]"
                  title="Preview de circular"
                  allow="autoplay"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mb-4" />
                  <p>No se puede cargar el preview</p>
                </div>
              )}
            </div>

            {/* Link directo */}
            {selectedCircular?.circular_firmada_url && (
              <a
                href={selectedCircular.circular_firmada_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en Google Drive
              </a>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSelectedCircular(null)}>
              <X className="h-4 w-4 mr-1" />
              Cerrar
            </Button>
            {!selectedCircular?.circular_verificada && (
              <Button onClick={handleVerificar} disabled={verificando} className="bg-green-600 hover:bg-green-700">
                {verificando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Marcar como verificada
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
