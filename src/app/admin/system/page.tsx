"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Database,
  Server,
  Settings,
  CheckCircle,
  AlertCircle,
  Activity,
  HardDrive,
  Users,
  FileText,
  Upload,
  Trash2,
  RotateCcw,
  Download,
  Shield,
  Clock,
  Info,
  Loader2
} from "lucide-react"

interface SystemStats {
  database: {
    status: string
    tables: number
    size: string
    lastBackup?: string
  }
  storage: {
    used: number
    total: number
    percentage: number
    uploads: number
  }
  users: {
    total: number
    active: number
    admins: number
  }
  pages: {
    total: number
    published: number
    drafts: number
  }
  performance: {
    uptime: string
    memoryUsage: number
    responseTime: number
  }
}

export default function AdminSystem() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadSystemStats()
    const interval = setInterval(loadSystemStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    const userData = localStorage.getItem('osyris_user')
    if (userData) {
      const user = JSON.parse(userData)
      return user.token
    }
    return null
  }

  const loadSystemStats = async () => {
    try {
      setIsLoading(true)

      const token = getAuthToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Simular carga de estadísticas del sistema
      // En una implementación real, esto vendría de endpoints del backend
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockStats: SystemStats = {
        database: {
          status: 'connected',
          tables: 8,
          size: '2.4 MB',
          lastBackup: new Date().toISOString()
        },
        storage: {
          used: 156,
          total: 1024,
          percentage: Math.round((156 / 1024) * 100),
          uploads: 23
        },
        users: {
          total: 12,
          active: 10,
          admins: 2
        },
        pages: {
          total: 15,
          published: 12,
          drafts: 3
        },
        performance: {
          uptime: "3 días, 14 horas",
          memoryUsage: 45,
          responseTime: 120
        }
      }

      setSystemStats(mockStats)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error al cargar estadísticas del sistema:', error)
      toast({
        title: '❌ Error al cargar estadísticas',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const performSystemAction = async (action: string) => {
    try {
      setIsLoading(true)

      const token = getAuthToken()
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Simular acción del sistema
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: '✅ Acción completada',
        description: `${action} ejecutado correctamente`,
      })

      // Recargar estadísticas después de la acción
      await loadSystemStats()
    } catch (error) {
      console.error(`Error en ${action}:`, error)
      toast({
        title: '❌ Error en la acción',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-200 dark:border-red-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Sistema y Configuración
          </h1>
          <p className="text-red-600 dark:text-red-400 mt-2">
            Monitoreo y gestión del estado del sistema
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}</span>
          </div>
        </div>
        <Button
          onClick={loadSystemStats}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>

      {systemStats ? (
        <>
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base de Datos</p>
                    <p className="text-2xl font-bold text-red-600">{systemStats.database.tables}</p>
                    <p className="text-xs text-muted-foreground">Tablas activas</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusIcon(systemStats.database.status)}
                    <span className="text-xs text-muted-foreground mt-1">{systemStats.database.size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Almacenamiento</p>
                    <p className="text-2xl font-bold text-red-600">{systemStats.storage.percentage}%</p>
                    <p className="text-xs text-muted-foreground">{systemStats.storage.uploads} archivos</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <HardDrive className="h-6 w-6 text-red-500" />
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatBytes(systemStats.storage.used * 1024 * 1024)} / {formatBytes(systemStats.storage.total * 1024 * 1024)}
                    </span>
                  </div>
                </div>
                <Progress value={systemStats.storage.percentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuarios</p>
                    <p className="text-2xl font-bold text-red-600">{systemStats.users.total}</p>
                    <p className="text-xs text-muted-foreground">{systemStats.users.active} activos</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Users className="h-6 w-6 text-red-500" />
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {systemStats.users.admins} Admin
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Páginas</p>
                    <p className="text-2xl font-bold text-red-600">{systemStats.pages.total}</p>
                    <p className="text-xs text-muted-foreground">{systemStats.pages.published} publicadas</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <FileText className="h-6 w-6 text-red-500" />
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {systemStats.pages.drafts} Borrador
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed System Info */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* System Health */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">🩺 Estado del Sistema</CardTitle>
                <CardDescription>Monitoreo en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Base de datos SQLite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline" className="text-green-600">Conectada</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">API Backend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline" className="text-green-600">Operativo</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Tiempo de actividad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-600">{systemStats.performance.uptime}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Uso de memoria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-600">{systemStats.performance.memoryUsage}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Actions */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">⚙️ Acciones del Sistema</CardTitle>
                <CardDescription>Herramientas de mantenimiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  onClick={() => performSystemAction('Backup de base de datos')}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Crear Backup de DB
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  onClick={() => performSystemAction('Limpieza de caché')}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Caché del Sistema
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  onClick={() => performSystemAction('Optimización de base de datos')}
                  disabled={isLoading}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Optimizar Base de Datos
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  onClick={() => performSystemAction('Verificación de integridad')}
                  disabled={isLoading}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Integridad
                </Button>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">Modo de Desarrollo</p>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                    Estas acciones son simuladas en el entorno de desarrollo
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-100">📊 Métricas de Rendimiento</CardTitle>
              <CardDescription>Estadísticas detalladas del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{systemStats.performance.responseTime}ms</p>
                  <p className="text-sm text-muted-foreground">Tiempo de respuesta</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{systemStats.database.tables}</p>
                  <p className="text-sm text-muted-foreground">Tablas DB</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{systemStats.storage.uploads}</p>
                  <p className="text-sm text-muted-foreground">Archivos subidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{systemStats.users.active}</p>
                  <p className="text-sm text-muted-foreground">Usuarios activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="ml-2 text-muted-foreground">Cargando estadísticas del sistema...</span>
        </div>
      )}
    </div>
  )
}