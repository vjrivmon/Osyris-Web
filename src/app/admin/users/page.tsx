"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-utils"

// Importar los nuevos componentes
import { SearchBar } from "@/components/admin/search-bar"
import { UserTable } from "@/components/admin/user-table"
import { QuickAddModal } from "@/components/admin/quick-add-modal"
import { BulkInviteModal } from "@/components/admin/bulk-invite-modal"

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

interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  message?: string
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Filtros de búsqueda
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    rol: "",
    estado: "",
    seccion: ""
  })

  useEffect(() => {
    loadUsers()
  }, [])

  // Cargar usuarios con filtros
  const loadUsers = async (filters = searchFilters, page = 1) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "No hay token de autenticación",
          variant: "destructive",
        })
        return
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        )
      })

      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/admin/users?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      const result: UsersResponse = await response.json()

      if (result.success) {
        // Mapear los datos del backend al formato esperado por el componente
        const mappedUsers = result.data.users.map((user: any) => ({
          ...user,
          estado: user.activo ? "activo" : "inactivo",
          fechaCreacion: user.fecha_registro,
          ultimoAcceso: user.ultimo_acceso
        }))
        setUsers(mappedUsers)
        setPagination(result.data.pagination)
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = (filters: any) => {
    setSearchFilters(filters)
    loadUsers(filters, 1)
  }

  // Limpiar búsqueda
  const handleClearSearch = () => {
    const clearedFilters = {
      query: "",
      rol: "",
      estado: "",
      seccion: ""
    }
    setSearchFilters(clearedFilters)
    loadUsers(clearedFilters, 1)
  }

  // Manejar adición de usuario
  const handleUserAdded = (newUser: any) => {
    toast({
      title: "Usuario agregado",
      description: "El usuario ha sido agregado exitosamente",
    })
    loadUsers(searchFilters, pagination.page)
  }

  // Manejar actualización de usuario
  const handleUserUpdate = (userId: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ))
    toast({
      title: "Usuario actualizado",
      description: "Los cambios han sido guardados exitosamente",
    })
  }

  // Manejar eliminación de usuario
  const handleUserDelete = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado exitosamente",
    })

    // Recargar si la página actual queda vacía
    if (users.length === 1 && pagination.page > 1) {
      loadUsers(searchFilters, pagination.page - 1)
    } else {
      loadUsers(searchFilters, pagination.page)
    }
  }

  // Cambiar de página
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    loadUsers(searchFilters, newPage)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra todos los usuarios del sistema Osyris
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickAddModal onUserAdded={handleUserAdded} />
          <BulkInviteModal onInvitesSent={() => {
            loadUsers(searchFilters, pagination.page)
          }} />
          <Button variant="outline" onClick={() => loadUsers(searchFilters, pagination.page)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Usuarios</span>
            </div>
            <div className="text-2xl font-bold mt-2">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">Activos</Badge>
              <span className="text-sm font-medium">Usuarios Activos</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {users.filter(u => u.estado === 'activo').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Admin</Badge>
              <span className="text-sm font-medium">Administradores</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {users.filter(u => u.rol === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">Scouter</Badge>
              <span className="text-sm font-medium">Scouters</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {users.filter(u => u.rol === 'scouter').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Usuarios
            </span>
            <Badge variant="outline">
              {pagination.total} usuarios
            </Badge>
          </CardTitle>
          <CardDescription>
            Administra, edita y gestiona los permisos de los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Buscar usuarios por nombre, email o rol..."
          />

          {/* Tabla de usuarios */}
          <UserTable
            users={users}
            onUserUpdate={handleUserUpdate}
            onUserDelete={handleUserDelete}
            loading={isLoading}
          />

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} usuarios
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}