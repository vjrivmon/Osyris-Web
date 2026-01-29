'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedComiteRoute } from '@/components/auth/protected-comite-route'
import { useDashboardComite, type CampamentoResumen, type SeccionStats } from '@/hooks/useDashboardComite'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Users,
  UserX,
  Clock,
  Download,
  LogOut,
  AlertTriangle,
  Tent,
  MapPin,
  CalendarDays,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

function DashboardComiteContent() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const {
    campamentos,
    detalle,
    loading,
    loadingDetalle,
    error,
    fetchCampamentos,
    fetchDetalle,
    exportCSV
  } = useDashboardComite()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dietasExpanded, setDietasExpanded] = useState(false)

  useEffect(() => {
    fetchCampamentos()
  }, [fetchCampamentos])

  const handleSelectCampamento = (camp: CampamentoResumen) => {
    setSelectedId(camp.id)
    setDietasExpanded(false)
    fetchDetalle(camp.id)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    })
  }

  const getSeccionColor = (color: string | null) => {
    if (!color) return 'bg-gray-200'
    // Map hex to tailwind bg classes or use inline style
    return color
  }

  const maxInscritos = detalle?.por_seccion
    ? Math.max(...detalle.por_seccion.map(s => Number(s.inscritos)), 1)
    : 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - stack vertical en movil para touch targets grandes */}
      <header className="bg-white border-b-2 border-green-700 shadow-sm">
        <div className="container mx-auto px-4 py-5 max-w-5xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Panel Comite y Cocina
              </h1>
              {user && (
                <p className="text-lg text-gray-600 mt-1">
                  {user.nombre} {user.apellidos}
                </p>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base min-h-[48px] py-3 px-6 border-2 border-gray-300 hover:border-red-400 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* Error */}
        {error && (
          <Alert variant="destructive" className="text-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Selector de campamento */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Selecciona un campamento
          </h2>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : campamentos.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Tent className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg text-gray-600">
                  No hay campamentos proximos programados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campamentos.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => handleSelectCampamento(camp)}
                  className={`text-left w-full rounded-xl border-2 p-5 transition-all
                    ${selectedId === camp.id
                      ? 'border-green-700 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {camp.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-base text-gray-600">
                        <CalendarDays className="h-5 w-5 flex-shrink-0" />
                        <span>{formatDate(camp.fecha_inicio)}</span>
                        {camp.fecha_fin && (
                          <>
                            <span>-</span>
                            <span>{formatDate(camp.fecha_fin)}</span>
                          </>
                        )}
                      </div>
                      {camp.lugar && (
                        <div className="flex items-center gap-2 mt-1 text-base text-gray-600">
                          <MapPin className="h-5 w-5 flex-shrink-0" />
                          <span>{camp.lugar}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1 font-bold">
                      {camp.total_inscritos}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Detalle del campamento seleccionado */}
        {selectedId && (
          <>
            {loadingDetalle ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-48" />
              </div>
            ) : detalle ? (
              <>
                {/* Stats globales */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Resumen de asistencia
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-green-200 bg-green-50">
                      <CardContent className="py-6 px-6 text-center">
                        <Users className="h-8 w-8 text-green-700 mx-auto mb-2" />
                        <p className="text-5xl font-bold text-green-800">
                          {Number(detalle.stats_global.inscritos) + Number(detalle.stats_global.pendientes)}
                        </p>
                        <p className="text-lg text-green-700 mt-1 font-medium">
                          Total inscritos
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-red-200 bg-red-50">
                      <CardContent className="py-6 px-6 text-center">
                        <UserX className="h-8 w-8 text-red-700 mx-auto mb-2" />
                        <p className="text-5xl font-bold text-red-800">
                          {detalle.stats_global.no_asisten}
                        </p>
                        <p className="text-lg text-red-700 mt-1 font-medium">
                          No asisten
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-amber-200 bg-amber-50">
                      <CardContent className="py-6 px-6 text-center">
                        <Clock className="h-8 w-8 text-amber-700 mx-auto mb-2" />
                        <p className="text-5xl font-bold text-amber-800">
                          {detalle.stats_global.pendientes}
                        </p>
                        <p className="text-lg text-amber-700 mt-1 font-medium">
                          Pendientes
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Desglose por seccion */}
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Por seccion
                  </h2>
                  <Card>
                    <CardContent className="py-6 px-6 space-y-5">
                      {detalle.por_seccion.map((sec: SeccionStats) => (
                        <div key={sec.seccion_id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: sec.color_principal || '#9ca3af' }}
                              />
                              <span className="text-lg font-medium text-gray-900">
                                {sec.nombre}
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              {sec.inscritos}
                            </span>
                          </div>
                          <Progress
                            value={(Number(sec.inscritos) / maxInscritos) * 100}
                            className="h-4"
                          />
                        </div>
                      ))}
                      {detalle.por_seccion.length === 0 && (
                        <p className="text-lg text-gray-500 text-center py-4">
                          Sin inscripciones registradas
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Alergias y dietas */}
                <section>
                  {detalle.dietas.total_con_restricciones > 0 ? (
                    <>
                      <button
                        onClick={() => setDietasExpanded(!dietasExpanded)}
                        className="w-full"
                      >
                        <Alert className="border-2 border-amber-400 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors">
                          <AlertTriangle className="h-6 w-6 text-amber-700" />
                          <AlertTitle className="text-xl font-semibold text-amber-900 flex items-center justify-between">
                            <span>
                              {detalle.dietas.total_con_restricciones} educandos con restricciones alimentarias
                            </span>
                            {dietasExpanded
                              ? <ChevronUp className="h-6 w-6" />
                              : <ChevronDown className="h-6 w-6" />
                            }
                          </AlertTitle>
                          <AlertDescription className="text-lg text-amber-800">
                            Pulsa para {dietasExpanded ? 'ocultar' : 'ver'} el detalle de alergias, intolerancias y dietas especiales
                          </AlertDescription>
                        </Alert>
                      </button>

                      {dietasExpanded && (() => {
                        const uniquePersons = [
                          ...detalle.dietas.con_alergias,
                          ...detalle.dietas.con_intolerancias,
                          ...detalle.dietas.con_dieta_especial,
                          ...detalle.dietas.con_medicacion
                        ].filter((person, index, self) =>
                          index === self.findIndex(p =>
                            p.nombre === person.nombre && p.apellidos === person.apellidos
                          )
                        )

                        return (
                          <>
                            {/* Mobile: cards apiladas (mas legible para 50+) */}
                            <div className="mt-4 space-y-3 md:hidden">
                              {uniquePersons.map((person, idx) => (
                                <Card key={idx} className="border-2">
                                  <CardContent className="py-4 px-5">
                                    <p className="text-lg font-bold text-gray-900">
                                      {person.nombre} {person.apellidos}
                                    </p>
                                    <p className="text-base text-gray-600 mb-3">{person.seccion_nombre}</p>
                                    <div className="space-y-2 text-base">
                                      {person.alergias && (
                                        <div>
                                          <span className="font-semibold text-red-800">Alergias: </span>
                                          <span className="text-gray-900">{person.alergias}</span>
                                        </div>
                                      )}
                                      {person.intolerancias && (
                                        <div>
                                          <span className="font-semibold text-amber-800">Intolerancias: </span>
                                          <span className="text-gray-900">{person.intolerancias}</span>
                                        </div>
                                      )}
                                      {person.dieta_especial && (
                                        <div>
                                          <span className="font-semibold text-blue-800">Dieta: </span>
                                          <span className="text-gray-900">{person.dieta_especial}</span>
                                        </div>
                                      )}
                                      {person.medicacion && (
                                        <div>
                                          <span className="font-semibold text-purple-800">Medicacion: </span>
                                          <span className="text-gray-900">{person.medicacion}</span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            {/* Desktop: tabla horizontal */}
                            <Card className="mt-4 border-2 hidden md:block">
                              <CardContent className="py-4 px-0 overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-base font-semibold pl-6">Nombre</TableHead>
                                      <TableHead className="text-base font-semibold">Seccion</TableHead>
                                      <TableHead className="text-base font-semibold">Alergias</TableHead>
                                      <TableHead className="text-base font-semibold">Intolerancias</TableHead>
                                      <TableHead className="text-base font-semibold">Dieta</TableHead>
                                      <TableHead className="text-base font-semibold pr-6">Medicacion</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {uniquePersons.map((person, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="text-base pl-6 font-medium">
                                          {person.nombre} {person.apellidos}
                                        </TableCell>
                                        <TableCell className="text-base">{person.seccion_nombre}</TableCell>
                                        <TableCell className="text-base">
                                          {person.alergias || '-'}
                                        </TableCell>
                                        <TableCell className="text-base">
                                          {person.intolerancias || '-'}
                                        </TableCell>
                                        <TableCell className="text-base">
                                          {person.dieta_especial || '-'}
                                        </TableCell>
                                        <TableCell className="text-base pr-6">
                                          {person.medicacion || '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          </>
                        )
                      })()}
                    </>
                  ) : (
                    <Alert className="border-2 border-green-300 bg-green-50">
                      <Users className="h-5 w-5 text-green-700" />
                      <AlertTitle className="text-lg font-semibold text-green-900">
                        Sin restricciones alimentarias
                      </AlertTitle>
                      <AlertDescription className="text-base text-green-800">
                        Ningun educando inscrito ha indicado alergias, intolerancias o dietas especiales.
                      </AlertDescription>
                    </Alert>
                  )}
                </section>

                {/* Boton exportar */}
                <section className="pb-8">
                  <Button
                    onClick={() => exportCSV(selectedId)}
                    size="lg"
                    className="w-full md:w-auto text-lg py-6 px-8 bg-green-700 hover:bg-green-800 text-white font-semibold"
                  >
                    <Download className="h-6 w-6 mr-3" />
                    Descargar listado completo (CSV)
                  </Button>
                  <p className="text-base text-gray-500 mt-2">
                    Descarga un archivo compatible con Excel con todos los inscritos y sus datos alimentarios
                  </p>
                </section>
              </>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}

export default function ComiteDashboardPage() {
  return (
    <ProtectedComiteRoute>
      <DashboardComiteContent />
    </ProtectedComiteRoute>
  )
}
