'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  UserPlus,
  Link,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  GraduationCap
} from 'lucide-react'
import { useAdminFamiliares } from '@/hooks/useAdminFamiliares'
import { InvitarFamiliasSimple } from '@/components/admin/invitar-familias-simple'
import { VincularEducandoModal } from '@/components/admin/familiares/vincular-educando'
import { TablaRelaciones } from '@/components/admin/familiares/tabla-relaciones'
import { useToast } from '@/hooks/use-toast'

export default function AdminFamiliaresPage() {
  const [showInvitarModal, setShowInvitarModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [vinculacionRefreshTrigger, setVinculacionRefreshTrigger] = useState(0)

  const {
    loading,
    familiares,
    estadisticas,
    cargarFamiliares,
    cargarEstadisticas,
  } = useAdminFamiliares()

  const { toast } = useToast()

  useEffect(() => {
    cargarFamiliares()
    cargarEstadisticas()
  }, [])

  const handleRefresh = () => {
    cargarFamiliares()
    cargarEstadisticas()
    setVinculacionRefreshTrigger(prev => prev + 1)
  }

  // Filtrar familiares por búsqueda
  const filteredFamiliares = familiares.filter(f => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      f.nombre?.toLowerCase().includes(search) ||
      f.apellidos?.toLowerCase().includes(search) ||
      f.email?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Gestión de Familias
          </h1>
          <p className="text-muted-foreground mt-1">
            {estadisticas?.totalFamilias || 0} familias registradas
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowInvitarModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Familia
          </Button>
          <Button variant="outline" onClick={() => setShowVincularModal(true)}>
            <Link className="h-4 w-4 mr-2" />
            Vincular Educando
          </Button>
        </div>
      </div>

      {/* Stats rápidas - 3 cards en fila */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{estadisticas?.totalFamilias || 0}</p>
              <p className="text-sm text-muted-foreground">Familias totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{estadisticas?.familiasActivas || 0}</p>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{estadisticas?.educandosConFamilia || 0}</p>
              <p className="text-sm text-muted-foreground">Educandos vinculados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellidos o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de familias con sus educandos */}
      <Card>
        <CardHeader>
          <CardTitle>Familias y Vinculaciones</CardTitle>
          <CardDescription>
            Lista de familias registradas y sus educandos vinculados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFamiliares.length > 0 ? (
            <div className="space-y-4">
              {filteredFamiliares.map((familiar) => (
                <div
                  key={familiar.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">
                          {familiar.nombre} {familiar.apellidos}
                        </h3>
                        <Badge variant={familiar.estado === 'ACTIVO' ? 'default' : 'secondary'}>
                          {familiar.estado === 'ACTIVO' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Activo</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Pendiente</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {familiar.email}
                      </p>
                    </div>

                    {/* Educandos vinculados */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{familiar.educandosVinculados?.length || 0}</span>
                        <span className="text-muted-foreground hidden sm:inline">educandos</span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de educandos si hay */}
                  {familiar.educandosVinculados && familiar.educandosVinculados.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {familiar.educandosVinculados.map((educando: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {educando.nombre || educando.nombre_completo || `Educando ${idx + 1}`}
                            {educando.seccion && ` - ${educando.seccion}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No se encontraron resultados' : 'No hay familias registradas'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Invita a la primera familia para comenzar'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowInvitarModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invitar Primera Familia
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de relaciones (vinculaciones detalladas) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Detalle de Vinculaciones
              </CardTitle>
              <CardDescription>
                Relaciones entre familiares y educandos
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowVincularModal(true)}>
              <Link className="h-4 w-4 mr-2" />
              Nueva Vinculación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TablaRelaciones onRefresh={handleRefresh} refreshTrigger={vinculacionRefreshTrigger} />
        </CardContent>
      </Card>

      {/* Modales */}
      <InvitarFamiliasSimple
        open={showInvitarModal}
        onOpenChange={setShowInvitarModal}
        onSuccess={() => {
          handleRefresh()
        }}
      />

      <VincularEducandoModal
        open={showVincularModal}
        onOpenChange={setShowVincularModal}
        onSuccess={() => {
          handleRefresh()
          toast({
            title: "Vinculación exitosa",
            description: "El educando ha sido vinculado correctamente",
          })
        }}
      />
    </div>
  )
}
