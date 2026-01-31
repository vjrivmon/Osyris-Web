"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-utils"
import { EditUserModal } from "./edit-user-modal"

interface User {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  roles?: string[]
  estado: string
  seccion?: string
  ultimoAcceso?: string
  fechaCreacion: string
}

interface UserTableProps {
  users: User[]
  onUserUpdate?: (userId: number, updates: Partial<User>) => void
  onUserDelete?: (userId: number) => void
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}

// Mapeo de IDs de sección a nombres reales
const SECTION_NAMES: Record<number, string> = {
  1: "Castores",
  2: "Manada",
  3: "Tropa",
  4: "Pioneros",
  5: "Rutas"
}

export function UserTable({
  users,
  onUserUpdate,
  onUserDelete,
  loading = false,
  pagination,
  onPageChange
}: UserTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const { toast } = useToast()

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

  const getRoleBadge = (rol: string) => {
    const labels: Record<string, string> = {
      admin: "Admin",
      scouter: "Scouter",
      familia: "Familia",
      comite: "Comité",
      educando: "Educando"
    }

    const colors: Record<string, string> = {
      admin: "bg-red-600 hover:bg-red-700 text-white",
      scouter: "bg-green-600 hover:bg-green-700 text-white",
      familia: "bg-amber-600 hover:bg-amber-700 text-white",
      comite: "bg-blue-600 hover:bg-blue-700 text-white",
      educando: "bg-gray-600 hover:bg-gray-700 text-white"
    }

    return (
      <Badge
        variant="secondary"
        className={cn(colors[rol] || "bg-gray-500 text-white")}
      >
        {labels[rol] || rol}
      </Badge>
    )
  }

  const getRoleBadges = (user: User) => {
    const roles = user.roles && user.roles.length > 0 ? user.roles : [user.rol]
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((rol) => (
          <span key={rol}>{getRoleBadge(rol)}</span>
        ))}
      </div>
    )
  }

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      inactivo: "secondary",
      suspendido: "destructive"
    }

    const colors: Record<string, string> = {
      activo: "bg-green-100 text-green-800 border-green-200",
      inactivo: "bg-gray-100 text-gray-800 border-gray-200",
      suspendido: "bg-red-100 text-red-800 border-red-200"
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setActionLoading(userToDelete.id)

    try {
      const token = localStorage.getItem("token")
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Usuario eliminado",
          description: `${userToDelete.nombre} ${userToDelete.apellidos} ha sido eliminado exitosamente.`,
        })
        onUserDelete?.(userToDelete.id)
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo eliminar el usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleToggleStatus = async (user: User) => {
    setActionLoading(user.id)

    try {
      const newStatus = user.estado === "activo" ? "inactivo" : "activo"
      const token = localStorage.getItem("token")
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Estado actualizado",
          description: `El usuario ha sido ${newStatus === "activo" ? "activado" : "desactivado"} exitosamente.`,
        })
        onUserUpdate?.(user.id, { estado: newStatus })
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo actualizar el estado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user)
    setEditModalOpen(true)
  }

  const handleUserUpdated = (userId: number, updates: Partial<User>) => {
    onUserUpdate?.(userId, updates)
    setEditModalOpen(false)
    setUserToEdit(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const getSectionName = (seccion?: string): string | null => {
    if (!seccion) return null
    
    // Si ya es un nombre (no empieza con "Sección"), devolverlo
    if (!seccion.startsWith("Sección")) return seccion
    
    // Extraer el ID de "Sección X"
    const idMatch = seccion.match(/Sección (\d+)/)
    if (idMatch) {
      const id = parseInt(idMatch[1])
      return SECTION_NAMES[id] || seccion
    }
    
    return seccion
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Creación</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Cargando usuarios...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron usuarios</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.nombre} {user.apellidos}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadges(user)}</TableCell>
                    <TableCell>{getStatusBadge(user.estado)}</TableCell>
                    <TableCell>
                      {user.seccion ? (
                        <Badge variant="outline" className="capitalize">
                          {getSectionName(user.seccion)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.ultimoAcceso ? (
                        <div className="text-sm">
                          <div>{formatDate(user.ultimoAcceso)}</div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.ultimoAcceso).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(user.fechaCreacion)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                            disabled={user.rol === "admin"}
                          >
                            {user.estado === "activo" ? (
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

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setUserToDelete(user)
                              setDeleteDialogOpen(true)
                            }}
                            disabled={user.rol === "admin"}
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando usuarios...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg">
            {users.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                {/* Header con nombre y estado */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {user.nombre} {user.apellidos}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {getRoleBadges(user)}
                    {getStatusBadge(user.estado)}
                  </div>
                </div>

                {/* Info adicional */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sección:</span>
                    <span className="ml-1">
                      {user.seccion ? getSectionName(user.seccion) : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Creación:</span>
                    <span className="ml-1">{formatDate(user.fechaCreacion)}</span>
                  </div>
                  {user.ultimoAcceso && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Último acceso:</span>
                      <span className="ml-1">{formatDate(user.ultimoAcceso)}</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="min-h-[44px]"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px]"
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user)}
                        disabled={user.rol === "admin"}
                      >
                        {user.estado === "activo" ? (
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

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => {
                          setUserToDelete(user)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={user.rol === "admin"}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginador */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
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
                  variant={page === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
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
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <strong>{userToDelete?.nombre} {userToDelete?.apellidos}</strong>.
              Esta acción no se puede deshacer y el usuario perderá acceso completo al sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading === userToDelete?.id}
            >
              {actionLoading === userToDelete?.id ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Modal */}
      <EditUserModal
        user={userToEdit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUserUpdated={handleUserUpdated}
      />
    </>
  )
}