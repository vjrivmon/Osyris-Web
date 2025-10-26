'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Eye,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react'
import { useEducandos } from '@/hooks/useEducandos'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function EducandosPage() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    loading,
    educandos,
    estadisticas,
    pagination,
    fetchEducandos,
    fetchEstadisticas,
    deactivateEducando,
    reactivateEducando,
    deleteEducando
  } = useEducandos()

  // Estados
  const [searchTerm, setSearchTerm] = useState('')
  const [seccionFilter, setSeccionFilter] = useState<string>('all')
  const [activoFilter, setActivoFilter] = useState<string>('all')
  const [generoFilter, setGeneroFilter] = useState<string>('all')
  const [educandoToDelete, setEducandoToDelete] = useState<number | null>(null)
  const [educandoToDeactivate, setEducandoToDeactivate] = useState<number | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await fetchEducandos()
    await fetchEstadisticas()
  }

  // Aplicar filtros
  const handleFilter = () => {
    const filters: any = {}

    if (searchTerm) filters.search = searchTerm
    if (seccionFilter !== 'all') filters.seccion_id = parseInt(seccionFilter)
    if (activoFilter !== 'all') filters.activo = activoFilter === 'activo'
    if (generoFilter !== 'all') filters.genero = generoFilter

    fetchEducandos(filters)
  }

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    setSeccionFilter('all')
    setActivoFilter('all')
    setGeneroFilter('all')
    fetchEducandos()
  }

  // Acciones
  const handleEdit = (id: number) => {
    router.push(`/admin/educandos/${id}`)
  }

  const handleView = (id: number) => {
    router.push(`/admin/educandos/${id}`)
  }

  const handleDeactivate = async () => {
    if (!educandoToDeactivate) return
    await deactivateEducando(educandoToDeactivate)
    setEducandoToDeactivate(null)
    await loadData()
  }

  const handleReactivate = async (id: number) => {
    await reactivateEducando(id)
    await loadData()
  }

  const handleDelete = async () => {
    if (!educandoToDelete) return
    await deleteEducando(educandoToDelete)
    setEducandoToDelete(null)
    await loadData()
  }

  const getSeccionColor = (color?: string) => {
    if (!color) return 'bg-gray-500'
    return `bg-[${color}]`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Educandos</h1>
          <p className="text-muted-foreground">
            Administra los educandos del grupo scout
          </p>
        </div>
        <Button onClick={() => router.push('/admin/educandos/nuevo')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Educando
        </Button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Educandos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Educandos en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.activos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Educandos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {estadisticas.inactivos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Educandos inactivos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Secciones</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadisticas.por_seccion?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Secciones con educandos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, DNI, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sección</label>
              <Select value={seccionFilter} onValueChange={setSeccionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las secciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  <SelectItem value="1">Castores (5-7 años)</SelectItem>
                  <SelectItem value="2">Lobatos (7-10 años)</SelectItem>
                  <SelectItem value="3">Tropa (10-13 años)</SelectItem>
                  <SelectItem value="4">Pioneros (13-16 años)</SelectItem>
                  <SelectItem value="5">Rutas (16-19 años)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={activoFilter} onValueChange={setActivoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Género</label>
              <Select value={generoFilter} onValueChange={setGeneroFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los géneros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los géneros</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleFilter} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Educandos</CardTitle>
          <CardDescription>
            Total: {pagination.total} educandos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : educandos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron educandos
                    </TableCell>
                  </TableRow>
                ) : (
                  educandos.map((educando) => (
                    <TableRow key={educando.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{educando.nombre} {educando.apellidos}</div>
                          {educando.alergias && (
                            <span className="text-xs text-red-600">⚠️ Alergias</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{educando.dni || '-'}</TableCell>
                      <TableCell>{educando.edad || '-'} años</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("border-2")}
                          style={{ borderColor: educando.seccion_color || '#gray' }}
                        >
                          {educando.seccion_nombre || 'Sin sección'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {educando.telefono_movil || educando.telefono_casa || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {educando.activo ? (
                          <Badge variant="default" className="bg-green-600">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(educando.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(educando.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {educando.activo ? (
                              <DropdownMenuItem
                                onClick={() => setEducandoToDeactivate(educando.id)}
                                className="text-yellow-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Desactivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleReactivate(educando.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setEducandoToDelete(educando.id)}
                              className="text-red-600"
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
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para desactivar */}
      <AlertDialog open={!!educandoToDeactivate} onOpenChange={() => setEducandoToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar educando?</AlertDialogTitle>
            <AlertDialogDescription>
              El educando será marcado como inactivo pero no se eliminará del sistema.
              Podrás reactivarlo en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!educandoToDelete} onOpenChange={() => setEducandoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar educando permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El educando será eliminado permanentemente
              del sistema junto con todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
