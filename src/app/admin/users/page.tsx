"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
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

  // Cambiar de página
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    loadUsers(searchFilters, newPage)
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Administra los usuarios del sistema
          </p>
        </div>
        <BulkInviteModal
          onInvitesSent={() => {
            loadUsers(searchFilters, pagination.page)
          }}
          trigger={
            <Button className="w-full sm:w-auto min-h-[44px]">
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar Usuarios
            </Button>
          }
        />
      </div>

      {/* Búsqueda + Tabla + Paginación */}
      <div className="space-y-4">
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder="Buscar usuarios por nombre, email o rol..."
        />

        <UserTable
          users={users}
          onUserUpdate={handleUserUpdate}
          onUserDelete={handleUserDelete}
          loading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}