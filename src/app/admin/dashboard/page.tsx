"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricsCard } from "@/components/admin/metrics-card"
import { ActivityChart } from "@/components/admin/activity-chart"
import { SearchBar } from "@/components/admin/search-bar"
import { UserTable } from "@/components/admin/user-table"
import { QuickAddModal } from "@/components/admin/quick-add-modal"
import {
  Users,
  Activity,
  MessageSquare,
  TrendingUp,
  Eye,
  AlertCircle,
  Bell,
  Plus,
  RefreshCw,
  BarChart3
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken, makeAuthenticatedRequest } from "@/lib/auth-utils"

interface MetricsData {
  totalUsuarios: number
  usuariosActivosHoy: number
  totalActividades: number
  totalMensajes: number
  engagementRate: number
}

interface ActivityData {
  date: string
  usuarios: number
  actividades: number
  mensajes: number
}

interface PopularPage {
  page: string
  title: string
  visits: number
  uniqueVisitors: number
}

interface Alert {
  id: string
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: string
  read: boolean
}

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

export default function AdminCRMDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  // Estados para métricas
  const [metrics, setMetrics] = useState<MetricsData>({
    totalUsuarios: 0,
    usuariosActivosHoy: 0,
    totalActividades: 0,
    totalMensajes: 0,
    engagementRate: 0
  })

  // Estado para actividad
  const [activityData, setActivityData] = useState<ActivityData[]>([])

  // Estado para páginas populares
  const [popularPages, setPopularPages] = useState<PopularPage[]>([])

  // Estado para alertas
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Estado para usuarios
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 5,
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
    loadDashboardData()
  }, [])

  // Cargar todos los datos del dashboard
  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadMetrics(),
        loadActivityData(),
        loadPopularPages(),
        loadAlerts(),
        loadUsers()
      ])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar métricas principales
  const loadMetrics = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await makeAuthenticatedRequest('/api/admin/metrics/summary')
      if (response) {
        setMetrics(response.data)
      }
    } catch (error) {
      console.error("Error loading metrics:", error)
    }
  }

  // Cargar datos de actividad
  const loadActivityData = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await makeAuthenticatedRequest('/api/admin/metrics/activity')
      if (response) {
        setActivityData(response.data)
      }
    } catch (error) {
      console.error("Error loading activity data:", error)
    }
  }

  // Cargar páginas populares
  const loadPopularPages = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await makeAuthenticatedRequest('/api/admin/pages/popular')
      if (response) {
        setPopularPages(response.data)
      }
    } catch (error) {
      console.error("Error loading popular pages:", error)
    }
  }

  // Cargar alertas
  const loadAlerts = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await makeAuthenticatedRequest('/api/admin/alerts')
      if (response) {
        setAlerts(response.data)
      }
    } catch (error) {
      console.error("Error loading alerts:", error)
    }
  }

  // Cargar usuarios con filtros
  const loadUsers = async (filters = searchFilters) => {
    setUsersLoading(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const params = new URLSearchParams({
        page: usersPagination.page.toString(),
        limit: usersPagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        )
      })

      const response = await makeAuthenticatedRequest(`/api/admin/users?${params}`)
      if (response) {
        setUsers(response.data.users)
        setUsersPagination(response.data.pagination)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Manejar búsqueda
  const handleSearch = (filters: any) => {
    setSearchFilters(filters)
    setUsersPagination(prev => ({ ...prev, page: 1 }))
    loadUsers(filters)
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
    setUsersPagination(prev => ({ ...prev, page: 1 }))
    loadUsers(clearedFilters)
  }

  // Manejar adición de usuario
  const handleUserAdded = (newUser: any) => {
    toast({
      title: "Usuario agregado",
      description: "El usuario ha sido agregado a la lista",
    })
    loadUsers(searchFilters)
    loadMetrics()
  }

  // Manejar actualización de usuario
  const handleUserUpdate = (userId: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ))
    loadMetrics()
  }

  // Manejar eliminación de usuario
  const handleUserDelete = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
    loadMetrics()
  }

  // Obtener icono para tipo de alerta
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  // Obtener color para tipo de alerta
  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard CRM</h1>
          <p className="text-muted-foreground">
            Panel de administración y gestión de usuarios
          </p>
        </div>
        <div className="flex gap-2">
          <QuickAddModal onUserAdded={handleUserAdded} />
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Usuarios"
          value={metrics.totalUsuarios}
          description="Usuarios registrados"
          icon={Users}
          trend={{ value: 12.5, direction: "up" }}
        />
        <MetricsCard
          title="Usuarios Activos Hoy"
          value={metrics.usuariosActivosHoy}
          description="Últimas 24 horas"
          icon={Activity}
          trend={{ value: 8.2, direction: "up" }}
        />
        <MetricsCard
          title="Actividades Totales"
          value={metrics.totalActividades}
          description="En el sistema"
          icon={BarChart3}
          trend={{ value: 5.1, direction: "up" }}
        />
        <MetricsCard
          title="Engagement"
          value={`${metrics.engagementRate}%`}
          description="Usuarios activos semana"
          icon={TrendingUp}
          trend={{ value: 2.3, direction: "up" }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de actividad - 2 columnas */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityChart data={activityData} />

          {/* Gestión de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </span>
                <Badge variant="outline">
                  {usersPagination.total} usuarios
                </Badge>
              </CardTitle>
              <CardDescription>
                Administra los usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Buscar usuarios..."
              />
              <UserTable
                users={users}
                onUserUpdate={handleUserUpdate}
                onUserDelete={handleUserDelete}
                loading={usersLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar derecha - 1 columna */}
        <div className="space-y-6">
          {/* Páginas más visitadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Páginas Populares
              </CardTitle>
              <CardDescription>
                Páginas más visitadas esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{page.title}</p>
                        <p className="text-xs text-muted-foreground">{page.page}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{page.visits}</p>
                      <p className="text-xs text-muted-foreground">
                        {page.uniqueVisitors} únicos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas del Sistema
              </CardTitle>
              <CardDescription>
                Notificaciones y alertas importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay alertas activas
                  </p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start gap-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}