'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react'
import { useAdminFamiliares, type EstadisticasFamiliares } from '@/hooks/useAdminFamiliares'
import { useToast } from '@/hooks/use-toast'

export default function AdminFamiliaresEstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasFamiliares | null>(null)
  const [loading, setLoading] = useState(false)

  const { cargarEstadisticas } = useAdminFamiliares()
  const { toast } = useToast()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      await cargarEstadisticas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = () => {
    if (!estadisticas) return

    // Crear CSV de estadísticas
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Total Familias', estadisticas.totalFamilias.toString()],
      ['Familias Activas', estadisticas.familiasActivas.toString()],
      ['Familias Pendientes', estadisticas.familiasPendientes.toString()],
      ['Educandos con Familia', estadisticas.educandosConFamilia.toString()],
      ['Documentos Pendientes', estadisticas.documentosPendientes.toString()],
      ['Documentos Aprobados', estadisticas.documentosAprobados.toString()],
      ['Uso Últimos 30 Días', estadisticas.usoUltimos30Dias.toString()],
      ['Familias sin Acceso 60+ Días', estadisticas.familiasSinAcceso60Dias.toString()],
      [],
      ['Estadísticas por Sección'],
      ['Sección', 'Total Educandos', 'Educandos con Familia', 'Familias Activas'],
      ...estadisticas.estadisticasPorSeccion.map(seccion => [
        seccion.seccion,
        seccion.totalEducandos.toString(),
        seccion.educandosConFamilia.toString(),
        seccion.familiasActivas.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    // Descargar archivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estadisticas-familias-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Exportación completada",
      description: "Las estadísticas se han exportado correctamente",
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas de Familias</h1>
          <p className="text-muted-foreground">
            Métricas y reportes del uso del portal familiar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={cargarDatos} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>
          <Button onClick={exportarCSV} disabled={!estadisticas}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando estadísticas...</span>
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Familias</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas?.totalFamilias || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Familias registradas en el sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Activación</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {estadisticas?.totalFamilias ?
                    Math.round((estadisticas.familiasActivas / estadisticas.totalFamilias) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas?.familiasActivas || 0} de {estadisticas?.totalFamilias || 0} familias activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Procesados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(estadisticas?.documentosAprobados || 0) + (estadisticas?.documentosPendientes || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas?.documentosPendientes || 0} pendientes de aprobación
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas?.usoUltimos30Dias || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Familias activas últimos 30 días
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas por sección */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas por Sección
              </CardTitle>
              <CardDescription>
                Participación familiar y uso del portal por sección scout
              </CardDescription>
            </CardHeader>
            <CardContent>
              {estadisticas?.estadisticasPorSeccion ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sección</TableHead>
                      <TableHead>Total Educandos</TableHead>
                      <TableHead>Educandos con Familia</TableHead>
                      <TableHead>Porcentaje</TableHead>
                      <TableHead>Familias Activas</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estadisticas.estadisticasPorSeccion.map((seccion) => {
                      const porcentaje = seccion.totalEducandos > 0
                        ? Math.round((seccion.educandosConFamilia / seccion.totalEducandos) * 100)
                        : 0

                      return (
                        <TableRow key={seccion.seccion}>
                          <TableCell className="font-medium">{seccion.seccion}</TableCell>
                          <TableCell>{seccion.totalEducandos}</TableCell>
                          <TableCell>{seccion.educandosConFamilia}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    porcentaje >= 80 ? "bg-green-600" :
                                    porcentaje >= 50 ? "bg-yellow-600" : "bg-red-600"
                                  )}
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{porcentaje}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{seccion.familiasActivas}</TableCell>
                          <TableCell>
                            <Badge variant={porcentaje >= 80 ? 'default' : porcentaje >= 50 ? 'secondary' : 'destructive'}>
                              {porcentaje >= 80 ? 'Excelente' : porcentaje >= 50 ? 'Regular' : 'Mejorar'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métricas de uso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Adopción del Portal</CardTitle>
                <CardDescription>
                  Progreso de adopción del portal familiar por sección
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas?.estadisticasPorSeccion.map((seccion) => {
                    const porcentaje = seccion.totalEducandos > 0
                      ? Math.round((seccion.educandosConFamilia / seccion.totalEducandos) * 100)
                      : 0

                    return (
                      <div key={seccion.seccion} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{seccion.seccion}</span>
                          <span className="text-sm">{porcentaje}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              porcentaje >= 80 ? "bg-green-600" :
                              porcentaje >= 50 ? "bg-yellow-600" : "bg-red-600"
                            )}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Actividad</CardTitle>
                <CardDescription>
                  Indicadores clave de uso y participación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Familias Activas</span>
                    <Badge variant="default" className="bg-green-600">
                      {estadisticas?.familiasActivas || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Uso Últimos 30 Días</span>
                    <Badge variant="default" className="bg-blue-600">
                      {estadisticas?.usoUltimos30Dias || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">Pendientes de Activación</span>
                    <Badge variant="default" className="bg-yellow-600">
                      {estadisticas?.familiasPendientes || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Sin Acceso 60+ Días</span>
                    <Badge variant="destructive">
                      {estadisticas?.familiasSinAcceso60Dias || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estadísticas de Documentos
              </CardTitle>
              <CardDescription>
                Estado de procesamiento de documentos familiares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {estadisticas?.documentosPendientes || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Documentos Pendientes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {estadisticas?.documentosAprobados || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Documentos Aprobados</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {estadisticas?.documentosPendientes && estadisticas?.documentosAprobados ?
                          Math.round((estadisticas.documentosAprobados / (estadisticas.documentosPendientes + estadisticas.documentosAprobados)) * 100) : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Tasa de Aprobación</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}