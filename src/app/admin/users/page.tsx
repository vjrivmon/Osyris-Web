"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-utils"

// Importar componentes
import { SearchBar } from "@/components/admin/search-bar"
import { UserTable } from "@/components/admin/user-table"
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

      // Mapear 'query' a 'search' para el backend
      const apiFilters = {
        search: filters.query || '',
        rol: filters.rol || '',
        estado: filters.estado || '',
        seccion: filters.seccion || ''
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort: "ultimo_acceso",
        order: "desc",
        ...Object.fromEntries(
          Object.entries(apiFilters).filter(([_, value]) => value !== "")
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
        <BulkInviteModal
          onInvitesSent={() => {
            loadUsers(searchFilters, pagination.page)
          }}
          trigger={
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar Usuarios
            </Button>
          }
        />
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} usuarios
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
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
                      onClick={() => handlePageChange(page as number)}
                      disabled={isLoading}
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
                  disabled={pagination.page === pagination.totalPages || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}