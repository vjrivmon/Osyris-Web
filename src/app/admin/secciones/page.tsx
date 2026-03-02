'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Users,
  Save,
  RefreshCw,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle,
  Flag,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { apiEndpoint } from '@/lib/api-utils'

interface Rango {
  id: number
  seccion_id: number
  edad_min: number
  edad_max: number
  activo: boolean
  seccion_nombre: string
  seccion_color: string
  seccion_icono: string
}

interface EducandoCalc {
  id: number
  nombre: string
  apellidos: string
  edad_efectiva: number
  seccion_actual_id: number
  seccion_actual_nombre: string
  seccion_nueva_id: number
  seccion_nueva_nombre: string
}

interface CalculoResult {
  movidos: EducandoCalc[]
  sinCambio: EducandoCalc[]
  pendientesRutas: EducandoCalc[]
  sinRango: Array<{ id: number; nombre: string; apellidos: string; razon: string; edad_efectiva?: number }>
  ronda: { id: number; fecha_fin: string }
}

interface TerminarResult {
  movidos: EducandoCalc[]
  pendientes_rutas: EducandoCalc[]
  sin_cambio: number
  sin_rango: Array<{ id: number; nombre: string; apellidos: string; razon: string }>
}

export default function SeccionesAdminPage() {
  const { user, token, activeRole } = useAuth()
  const { toast } = useToast()

  // State
  const [rangos, setRangos] = useState<Rango[]>([])
  const [editedRangos, setEditedRangos] = useState<Record<number, { edad_min?: number; edad_max?: number }>>({})
  const [calculo, setCalculo] = useState<CalculoResult | null>(null)
  const [loadingRangos, setLoadingRangos] = useState(false)
  const [loadingCalculo, setLoadingCalculo] = useState(false)
  const [loadingTerminar, setLoadingTerminar] = useState(false)
  const [showTerminarDialog, setShowTerminarDialog] = useState(false)
  const [showRutasDialog, setShowRutasDialog] = useState(false)
  const [terminoResult, setTerminoResult] = useState<TerminarResult | null>(null)
  const [rutasSelection, setRutasSelection] = useState<Set<number>>(new Set())
  const [savingRangos, setSavingRangos] = useState(false)

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])

  // Cargar rangos
  const fetchRangos = useCallback(async () => {
    setLoadingRangos(true)
    try {
      const res = await fetch(apiEndpoint('/api/secciones/rangos'), { headers: headers() })
      const data = await res.json()
      if (data.success) setRangos(data.data)
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudieron cargar los rangos', variant: 'destructive' })
    } finally {
      setLoadingRangos(false)
    }
  }, [headers, toast])

  // Calcular secciones
  const fetchCalculo = useCallback(async () => {
    setLoadingCalculo(true)
    try {
      const res = await fetch(apiEndpoint('/api/secciones/calcular-todos'), { headers: headers() })
      const data = await res.json()
      if (data.success) {
        setCalculo(data.data)
      }
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo calcular las secciones', variant: 'destructive' })
    } finally {
      setLoadingCalculo(false)
    }
  }, [headers, toast])

  useEffect(() => {
    if (token) {
      fetchRangos()
      fetchCalculo()
    }
  }, [token, fetchRangos, fetchCalculo])

  // Guardar cambios de rangos
  const handleSaveRangos = async () => {
    setSavingRangos(true)
    try {
      const entries = Object.entries(editedRangos)
      for (const [id, changes] of entries) {
        await fetch(apiEndpoint(`/api/secciones/rangos/${id}`), {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify(changes)
        })
      }
      toast({ title: 'Rangos actualizados', description: `${entries.length} rangos guardados correctamente` })
      setEditedRangos({})
      await fetchRangos()
      await fetchCalculo()
    } catch (err) {
      toast({ title: 'Error', description: 'Error guardando rangos', variant: 'destructive' })
    } finally {
      setSavingRangos(false)
    }
  }

  // Editar rango local
  const handleRangoChange = (id: number, field: 'edad_min' | 'edad_max', value: string) => {
    const numVal = parseInt(value)
    if (isNaN(numVal)) return
    setEditedRangos(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: numVal }
    }))
  }

  // Terminar ronda
  const handleTerminarRonda = async () => {
    if (!calculo?.ronda?.id) return
    setLoadingTerminar(true)
    setShowTerminarDialog(false)
    try {
      const res = await fetch(apiEndpoint(`/api/ronda/${calculo.ronda.id}/terminar`), {
        method: 'POST',
        headers: headers()
      })
      const data = await res.json()
      if (data.success) {
        setTerminoResult(data.data)
        toast({
          title: 'Ronda terminada',
          description: data.message
        })
        // Si hay pendientes de Rutas, mostrar diálogo
        if (data.data.pendientes_rutas?.length > 0) {
          setRutasSelection(new Set())
          setShowRutasDialog(true)
        }
        await fetchCalculo()
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Error terminando ronda', variant: 'destructive' })
    } finally {
      setLoadingTerminar(false)
    }
  }

  // Confirmar rutas
  const handleConfirmarRutas = async () => {
    if (!calculo?.ronda?.id) return
    try {
      const res = await fetch(apiEndpoint(`/api/ronda/${calculo.ronda.id}/confirmar-rutas`), {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ educandos_a_kraal: Array.from(rutasSelection) })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Confirmado', description: data.message })
        setShowRutasDialog(false)
        setTerminoResult(null)
        await fetchCalculo()
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Error confirmando rutas', variant: 'destructive' })
    }
  }

  const toggleRutasSelection = (id: number) => {
    setRutasSelection(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Permisos
  const isSuperAdmin = activeRole === 'admin' || activeRole === 'super_admin'
  const isKraalRutas = activeRole === 'scouter' && user?.seccion_nombre?.toLowerCase().includes('rutas')
  const canTerminar = isSuperAdmin || isKraalRutas
  const hasEdits = Object.keys(editedRangos).length > 0

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Gestión de Secciones</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Rangos de edad y asignación automática de educandos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchRangos(); fetchCalculo() }} disabled={loadingRangos || loadingCalculo}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refrescar
          </Button>
          {canTerminar && calculo?.ronda && (
            <Button variant="destructive" onClick={() => setShowTerminarDialog(true)} disabled={loadingTerminar}>
              <Flag className="mr-2 h-4 w-4" />
              Terminar Ronda
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de Rangos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Rangos de Edad por Sección</CardTitle>
              <CardDescription>Define qué edades corresponden a cada sección scout</CardDescription>
            </div>
            {isSuperAdmin && hasEdits && (
              <Button onClick={handleSaveRangos} disabled={savingRangos}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios ({Object.keys(editedRangos).length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingRangos ? (
            <div className="text-center py-8 text-muted-foreground">Cargando rangos...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sección</TableHead>
                    <TableHead>Edad Mínima</TableHead>
                    <TableHead>Edad Máxima</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rangos.map((rango) => {
                    const edited = editedRangos[rango.id]
                    return (
                      <TableRow key={rango.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{rango.seccion_icono}</span>
                            <span className="font-medium">{rango.seccion_nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isSuperAdmin ? (
                            <Input
                              type="number"
                              className="w-20"
                              defaultValue={rango.edad_min}
                              onChange={(e) => handleRangoChange(rango.id, 'edad_min', e.target.value)}
                            />
                          ) : (
                            <span>{rango.edad_min}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isSuperAdmin ? (
                            <Input
                              type="number"
                              className="w-20"
                              defaultValue={rango.edad_max}
                              onChange={(e) => handleRangoChange(rango.id, 'edad_max', e.target.value)}
                            />
                          ) : (
                            <span>{rango.edad_max}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {rango.activo ? (
                            <Badge className="bg-green-600">Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educandos: sección actual vs calculada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Educandos: Sección Actual vs Calculada
          </CardTitle>
          <CardDescription>
            {calculo ? (
              <>
                Ronda activa hasta {calculo.ronda?.fecha_fin ? new Date(calculo.ronda.fecha_fin).toLocaleDateString('es-ES') : 'N/D'}.
                {' '}{(calculo.movidos?.length || 0) + (calculo.pendientesRutas?.length || 0)} educandos con cambio de sección pendiente.
              </>
            ) : 'Calculando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCalculo ? (
            <div className="text-center py-8 text-muted-foreground">Calculando secciones...</div>
          ) : !calculo ? (
            <div className="text-center py-8 text-muted-foreground">No hay ronda activa configurada</div>
          ) : (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">{calculo.movidos?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Cambiarán de sección</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{calculo.sinCambio?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Sin cambio</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{calculo.pendientesRutas?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Pendientes Rutas</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{calculo.sinRango?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Sin rango</div>
                </div>
              </div>

              {/* Lista de educandos con cambio */}
              {(calculo.movidos?.length > 0 || calculo.pendientesRutas?.length > 0) && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Educando</TableHead>
                        <TableHead>Edad Efectiva</TableHead>
                        <TableHead>Sección Actual</TableHead>
                        <TableHead></TableHead>
                        <TableHead>Sección Calculada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...(calculo.movidos || []), ...(calculo.pendientesRutas || [])].map((edu) => (
                        <TableRow key={edu.id}>
                          <TableCell className="font-medium">
                            {edu.nombre} {edu.apellidos}
                          </TableCell>
                          <TableCell>{edu.edad_efectiva} años</TableCell>
                          <TableCell>
                            <Badge variant="outline">{edu.seccion_actual_nombre}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <ArrowRightLeft className="h-4 w-4 text-orange-500 inline" />
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-orange-600">{edu.seccion_nueva_nombre}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Sin rango */}
              {calculo.sinRango?.length > 0 && (
                <div className="rounded-md border border-red-200 p-4">
                  <h4 className="font-medium text-red-600 flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Educandos sin rango asignable
                  </h4>
                  <ul className="text-sm space-y-1">
                    {calculo.sinRango.map((edu) => (
                      <li key={edu.id}>
                        {edu.nombre} {edu.apellidos} — {edu.razon}
                        {edu.edad_efectiva !== undefined && ` (edad efectiva: ${edu.edad_efectiva})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo confirmar Terminar Ronda */}
      <AlertDialog open={showTerminarDialog} onOpenChange={setShowTerminarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Terminar la ronda actual?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción moverá a {calculo?.movidos?.length || 0} educandos a sus nuevas secciones
              según la edad calculada. Los educandos de Rutas no se moverán automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleTerminarRonda}>
              Terminar Ronda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo educandos de Rutas → Kraal */}
      <AlertDialog open={showRutasDialog} onOpenChange={setShowRutasDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Educandos de Rutas</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona los educandos que pasan a ser Kraal. Los no seleccionados permanecerán en Rutas.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-60 overflow-y-auto space-y-2 py-2">
            {terminoResult?.pendientes_rutas?.map((edu) => (
              <label key={edu.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={rutasSelection.has(edu.id)}
                  onCheckedChange={() => toggleRutasSelection(edu.id)}
                />
                <span className="flex-1">{edu.nombre} {edu.apellidos}</span>
                <Badge variant="outline" className="text-xs">{edu.edad_efectiva} años</Badge>
              </label>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {rutasSelection.size} seleccionados para Kraal
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarRutas}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
