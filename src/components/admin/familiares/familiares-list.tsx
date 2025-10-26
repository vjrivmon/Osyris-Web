'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Link,
  FileText,
  RotateCcw
} from 'lucide-react'
import { useAdminFamiliares, type Familiar } from '@/hooks/useAdminFamiliares'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FamiliaresListProps {
  onEditFamiliar?: (familiar: Familiar) => void
  onVerFamilias?: () => void
  onInvitarFamilia?: () => void
  onVincularScouts?: () => void
  onVerDocumentos?: () => void
}

export function FamiliaresList({
  onEditFamiliar,
  onInvitarFamilia,
  onVincularScouts,
  onVerDocumentos
}: FamiliaresListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [familiarToDelete, setFamiliarToDelete] = useState<Familiar | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [seccionFilter, setSeccionFilter] = useState('all')
  const { toast } = useToast()

  const {
    loading,
    familiares,
    pagination,
    filtros,
    cargarFamiliares,
    actualizarEstadoFamiliar,
    resetearContrasena,
    eliminarFamiliar,
    desvincularEducando,
    actualizarFiltros
  } = useAdminFamiliares()

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVO: "default",
      INACTIVO: "secondary",
      PENDIENTE: "outline",
      BLOQUEADO: "destructive"
    }

    const colors: Record<string, string> = {
      ACTIVO: "bg-green-100 text-green-800 border-green-200",
      INACTIVO: "bg-gray-100 text-gray-800 border-gray-200",
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      BLOQUEADO: "bg-red-100 text-red-800 border-red-200"
    }

    return (
      <Badge
        variant={variants[estado] || "secondary"}
        className={colors[estado] || ""}
      >
        {estado}
      </Badge>
    )
  }

  const getRelationBadge = (relationType?: string) => {
    if (!relationType) return null

    const colors: Record<string, string> = {
      PADRE: "bg-blue-100 text-blue-800",
      MADRE: "bg-pink-100 text-pink-800",
      TUTOR_LEGAL: "bg-purple-100 text-purple-800",
      ABUELO: "bg-orange-100 text-orange-800",
      OTRO: "bg-gray-100 text-gray-800"
    }

    return (
      <Badge
        variant="outline"
        className={cn("text-xs", colors[relationType])}
      >
        {relationType.replace('_', ' ')}
      </Badge>
    )
  }

  const handleDeleteFamiliar = async () => {
    if (!familiarToDelete) return

    const success = await eliminarFamiliar(familiarToDelete.id)
    if (success) {
      setDeleteDialogOpen(false)
      setFamiliarToDelete(null)
    }
  }

  const handleToggleStatus = async (familiar: Familiar) => {
    const nuevoEstado = familiar.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    await actualizarEstadoFamiliar(familiar.id, nuevoEstado)
  }

  const handleResetPassword = async (familiar: Familiar) => {
    await resetearContrasena(familiar.id)
  }

  const handleDesvincularScout = async (familiarId: number, scoutId: number) => {
    const success = await desvincularEducando(familiarId, scoutId)
    if (success) {
      toast({
        title: "Scout desvinculado",
        description: "El scout ha sido desvinculado correctamente",
      })
    }
  }

  const applyFilters = () => {
    const nuevosFiltros = actualizarFiltros({
      busqueda: searchTerm,
      estado: estadoFilter === 'all' ? '' : estadoFilter,
      seccion: seccionFilter === 'all' ? '' : seccionFilter
    })
    cargarFamiliares(1, nuevosFiltros)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setEstadoFilter('all')
    setSeccionFilter('all')
    const filtrosLimpios = actualizarFiltros({
      busqueda: '',
      estado: '',
      seccion: ''
    })
    cargarFamiliares(1, filtrosLimpios)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const familiaresFiltrados = familiares.filter(familiar => {
    const matchesSearch = searchTerm === '' ||
      familiar.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      familiar.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      familiar.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      familiar.educandosVinculados.some(scout =>
        scout.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scout.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesEstado = estadoFilter === 'all' || familiar.estado === estadoFilter
    const matchesSeccion = seccionFilter === 'all' ||
      familiar.educandosVinculados.some(scout => scout.seccion === seccionFilter)

    return matchesSearch && matchesEstado && matchesSeccion
  })

  return (
    <div className="space-y-6">
      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Familiares
              </CardTitle>
              <CardDescription>
                Administra las cuentas familiares del sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onInvitarFamilia}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Familiar
              </Button>
              <Button variant="outline" onClick={onVincularScouts}>
                <Link className="h-4 w-4 mr-2" />
                Vincular Scouts
              </Button>
              <Button variant="outline" onClick={onVerDocumentos}>
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o scout..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por sección */}
            <Select value={seccionFilter} onValueChange={setSeccionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las secciones</SelectItem>
                <SelectItem value="Castores">Castores</SelectItem>
                <SelectItem value="Manada">Manada</SelectItem>
                <SelectItem value="Tropa">Tropa</SelectItem>
                <SelectItem value="Pioneros">Pioneros</SelectItem>
                <SelectItem value="Rutas">Rutas</SelectItem>
              </SelectContent>
            </Select>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button onClick={applyFilters} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Limpiar
              </Button>
              <Button variant="outline" onClick={() => cargarFamiliares()} size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {familiares.length}
              </div>
              <div className="text-sm text-blue-600">Total Familiares</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {familiares.filter(f => f.estado === 'ACTIVO').length}
              </div>
              <div className="text-sm text-green-600">Familias Activas</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {familiares.filter(f => f.estado === 'PENDIENTE').length}
              </div>
              <div className="text-sm text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {familiares.reduce((acc, f) => acc + f.documentosPendientes, 0)}
              </div>
              <div className="text-sm text-red-600">Docs. Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de familiares */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Familiar</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Scouts Vinculados</TableHead>
                  <TableHead>Relación</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Cargando familiares...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : familiaresFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || estadoFilter || seccionFilter
                            ? "No se encontraron familiares con los filtros aplicados"
                            : "No hay familiares registrados"}
                        </p>
                        {!searchTerm && !estadoFilter && !seccionFilter && onInvitarFamilia && (
                          <Button
                            onClick={onInvitarFamilia}
                            className="mt-4"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invitar Primer Familiar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  familiaresFiltrados.map((familiar) => (
                    <TableRow key={familiar.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {familiar.nombre} {familiar.apellidos}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {familiar.email}
                          </div>
                          {familiar.telefono && (
                            <div className="text-sm text-muted-foreground">
                              {familiar.telefono}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(familiar.estado)}</TableCell>
                      <TableCell>
                        {familiar.educandosVinculados.length > 0 ? (
                          <div className="space-y-1">
                            {familiar.educandosVinculados.map((scout) => (
                              <div key={scout.id} className="flex items-center gap-2">
                                <div className="text-sm">
                                  <span className="font-medium">{scout.nombre} {scout.apellidos}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {scout.seccion}
                                  </Badge>
                                  {scout.esContactoPrincipal && (
                                    <Badge variant="default" className="ml-1 text-xs">
                                      Principal
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin scouts vinculados</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRelationBadge(familiar.relationType)}
                        {familiar.relationDescription && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {familiar.relationDescription}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {familiar.documentosPendientes > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {familiar.documentosPendientes} pendientes
                            </Badge>
                          )}
                          {familiar.documentosPendientes === 0 && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              Al día
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {familiar.ultimoAcceso ? (
                          <div className="text-sm">
                            <div>{formatDate(familiar.ultimoAcceso)}</div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(familiar.ultimoAcceso).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditFamiliar?.(familiar)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleResetPassword(familiar)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Resetear Contraseña
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(familiar)}
                              disabled={familiar.estado === 'PENDIENTE'}
                            >
                              {familiar.estado === 'ACTIVO' ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>

                            {familiar.educandosVinculados.length > 1 && (
                              <DropdownMenuItem
                                onClick={() => {
                                  const principalScout = familiar.educandosVinculados.find(s => !s.esContactoPrincipal)
                                  if (principalScout) {
                                    handleDesvincularScout(familiar.id, principalScout.id)
                                  }
                                }}
                              >
                                <Link className="mr-2 h-4 w-4" />
                                Desvincular Scout
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setFamiliarToDelete(familiar)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600"
                              disabled={familiar.educandosVinculados.length > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginador */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} familiares
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cargarFamiliares(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => cargarFamiliares(page)}
                      disabled={loading}
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cargarFamiliares(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar familiar?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <strong>
                {familiarToDelete?.nombre} {familiarToDelete?.apellidos}
              </strong>. Esta acción no se puede deshacer y el familiar perderá acceso completo al sistema.
              {familiarToDelete?.educandosVinculados.length > 0 && (
                <div className="mt-2 text-red-600">
                  ⚠️ Este familiar tiene scouts vinculados. No se puede eliminar hasta desvincular todos los scouts.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFamiliar}
              className="bg-red-600 hover:bg-red-700"
              disabled={familiarToDelete?.educandosVinculados.length > 0}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}