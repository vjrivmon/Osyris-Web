"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/admin/search-bar"
import { UserTable } from "@/components/admin/user-table"
import { InvitacionesPanel } from "@/components/admin/invitaciones-panel"
import { FamiliasResumenCard } from "@/components/admin/familias-resumen-card"
import {
  Users,
  RefreshCw,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken, makeAuthenticatedRequest } from "@/lib/auth-utils"

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

interface ApiUser {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  activo: boolean
  seccion_id?: number
  ultimo_acceso?: string
  fecha_registro: string
}

// Mapeo de IDs de sección a nombres
const SECCIONES_MAP: Record<number, string> = {
  1: 'Castores',
  2: 'Lobatos',
  3: 'Tropa',
  4: 'Pioneros',
  5: 'Rutas',
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // Estado para usuarios
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Filtros de busqueda
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    rol: "",
    seccion_id: ""
  })

  useEffect(() => {
    loadUsers()
  }, [])

  // Cargar usuarios con filtros y paginacion
  const loadUsers = async (filters = searchFilters, page = usersPagination.page) => {
    setUsersLoading(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const params = new URLSearchParams({
        page: page.toString(),
        limit: usersPagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        )
      })

      const response = await makeAuthenticatedRequest(`/api/admin/users?${params}`)
      if (response) {
        const mappedUsers: User[] = response.data.users.map((apiUser: ApiUser) => ({
          id: apiUser.id,
          email: apiUser.email,
          nombre: apiUser.nombre,
          apellidos: apiUser.apellidos,
          rol: apiUser.rol,
          estado: apiUser.activo ? "activo" : "inactivo",
          seccion: apiUser.seccion_id ? SECCIONES_MAP[apiUser.seccion_id] || `Seccion ${apiUser.seccion_id}` : undefined,
          ultimoAcceso: apiUser.ultimo_acceso,
          fechaCreacion: apiUser.fecha_registro
        }))

        setUsers(mappedUsers)
        setUsersPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setUsersLoading(false)
      setIsLoading(false)
    }
  }

  // Manejar busqueda
  const handleSearch = (filters: any) => {
    setSearchFilters(filters)
    setUsersPagination(prev => ({ ...prev, page: 1 }))
    loadUsers(filters)
  }

  // Limpiar busqueda
  const handleClearSearch = () => {
    const clearedFilters = {
      query: "",
      rol: "",
      seccion_id: ""
    }
    setSearchFilters(clearedFilters)
    setUsersPagination(prev => ({ ...prev, page: 1 }))
    loadUsers(clearedFilters)
  }

  // Manejar actualizacion de usuario
  const handleUserUpdate = (userId: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ))
  }

  // Manejar eliminacion de usuario
  const handleUserDelete = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }

  // Manejar cambio de pagina
  const handlePageChange = (page: number) => {
    setUsersPagination(prev => ({ ...prev, page }))
    loadUsers(searchFilters, page)
  }

  // Refrescar todo
  const handleRefreshAll = () => {
    loadUsers()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administracion</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Gestiona usuarios, invitaciones y familias del sistema
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Grid principal: Invitaciones + Familias */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InvitacionesPanel onRefresh={handleRefreshAll} />
        <FamiliasResumenCard />
      </div>

      {/* Gestion de Usuarios - Tabla completa */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Gestion de Usuarios</CardTitle>
                <CardDescription>
                  Administra todos los usuarios del sistema
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="w-fit">
              {usersPagination.total} usuarios
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Buscar usuarios por nombre o email..."
          />
          <UserTable
            users={users}
            onUserUpdate={handleUserUpdate}
            onUserDelete={handleUserDelete}
            loading={usersLoading}
            pagination={usersPagination}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
