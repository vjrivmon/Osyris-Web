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
  Shield,
  ShieldCheck,
  ShieldOff,
  Eye,
  Mail,
  Calendar,
  UserCheck,
  UserX,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-utils"

interface User {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
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
}

export function UserTable({
  users,
  onUserUpdate,
  onUserDelete,
  loading = false
}: UserTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { toast } = useToast()

  const getRoleBadge = (rol: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      admin: "destructive",
      scouter: "default",
      usuario: "secondary"
    }

    const colors: Record<string, string> = {
      admin: "bg-red-600 hover:bg-red-700",
      scouter: "bg-green-600 hover:bg-green-700",
      usuario: "bg-gray-600 hover:bg-gray-700"
    }

    return (
      <Badge
        variant={variants[rol] || "secondary"}
        className={cn(
          "capitalize",
          rol === "scouter" && colors.scouter,
          rol === "admin" && colors.admin
        )}
      >
        {rol}
      </Badge>
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
    // Aquí podrías abrir un modal de edición
    // Por ahora solo mostramos un toast
    toast({
      title: "Editar usuario",
      description: `Función de edición para ${user.nombre} ${user.apellidos} - En desarrollo`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <>
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
                  <TableCell>{getRoleBadge(user.rol)}</TableCell>
                  <TableCell>{getStatusBadge(user.estado)}</TableCell>
                  <TableCell>
                    {user.seccion ? (
                      <Badge variant="outline" className="capitalize">
                        {user.seccion}
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
                          className="h-8 w-8 p-0"
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
    </>
  )
}