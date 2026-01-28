'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  Search,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAdminFamiliares } from '@/hooks/useAdminFamiliares'
import { InvitarFamiliasSimple } from '@/components/admin/invitar-familias-simple'

export default function AdminFamiliaresPage() {
  const [showInvitarModal, setShowInvitarModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    loading,
    familiares,
    pagination,
    cargarFamiliares,
  } = useAdminFamiliares()

  const handleRefresh = () => {
    cargarFamiliares(1)
  }

  // Filtrar familiares por búsqueda (client-side sobre la página actual)
  const filteredFamiliares = familiares.filter(f => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      f.nombre?.toLowerCase().includes(search) ||
      f.apellidos?.toLowerCase().includes(search) ||
      f.email?.toLowerCase().includes(search)
    )
  })

  const handlePageChange = (newPage: number) => {
    cargarFamiliares(newPage)
  }

  // Generar números de página con elipsis
  const getPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | 'ellipsis')[] = [1]
    if (current > 3) pages.push('ellipsis')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('ellipsis')
    if (total > 1) pages.push(total)
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header simplificado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Gestión de Familias
          </h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total || 0} familias registradas
          </p>
        </div>
        <Button onClick={() => setShowInvitarModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invitar Familia
        </Button>
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

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} familias
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers(pagination.page, pagination.totalPages).map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-1 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <InvitarFamiliasSimple
        open={showInvitarModal}
        onOpenChange={setShowInvitarModal}
        onSuccess={() => {
          handleRefresh()
        }}
      />
    </div>
  )
}
