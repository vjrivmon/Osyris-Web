'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Bell,
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Trash2,
  Filter,
  Search,
  Archive,
  RefreshCw,
  Settings,
  X,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Info,
  AlertCircle
} from "lucide-react"
import { useNotificacionesFamilia, useNotificacionesStats, TipoNotificacion, CategoriaNotificacion, PrioridadNotificacion, EstadoNotificacion } from '@/hooks/useNotificacionesFamilia'
import { cn } from '@/lib/utils'
import { NotificationItem } from './notification-item'

interface NotificationCenterProps {
  scoutId?: number
  className?: string
}

export function NotificationCenter({ scoutId, className }: NotificationCenterProps) {
  const {
    notificaciones,
    loading,
    error,
    refetch,
    marcarComoLeida,
    marcarTodasComoLeidas,
    archivarNotificacion,
    eliminarNotificacion,
    getContadorNoLeidas
  } = useNotificacionesFamilia({ scoutId })

  const stats = useNotificacionesStats(scoutId)

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoNotificacion | 'todos'>('todos')
  const [filtroTipo, setFiltroTipo] = useState<TipoNotificacion | 'todos'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaNotificacion | 'todos'>('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadNotificacion | 'todos'>('todos')
  const [sortBy, setSortBy] = useState<'fecha' | 'prioridad' | 'tipo'>('fecha')
  const [selectedNotificaciones, setSelectedNotificaciones] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Contador de no leídas actualizado
  const [noLeidasCount, setNoLeidasCount] = useState(0)

  useEffect(() => {
    const updateCounter = async () => {
      const count = await getContadorNoLeidas()
      setNoLeidasCount(count)
    }
    updateCounter()
  }, [notificaciones, getContadorNoLeidas])

  // Notificaciones filtradas y ordenadas
  const notificacionesFiltradas = useMemo(() => {
    let filtradas = [...notificaciones]

    // Filtro por búsqueda
    if (searchTerm) {
      filtradas = filtradas.filter(notif =>
        notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.scout_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.remitente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtros específicos
    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter(notif => notif.estado === filtroEstado)
    }
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(notif => notif.tipo === filtroTipo)
    }
    if (filtroCategoria !== 'todos') {
      filtradas = filtradas.filter(notif => notif.categoria === filtroCategoria)
    }
    if (filtroPrioridad !== 'todos') {
      filtradas = filtradas.filter(notif => notif.prioridad === filtroPrioridad)
    }

    // Ordenamiento
    filtradas.sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        case 'prioridad':
          const prioridadOrder = { alta: 3, normal: 2, baja: 1 }
          return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad]
        case 'tipo':
          const tipoOrder = { urgente: 4, importante: 3, informativo: 2, recordatorio: 1 }
          return tipoOrder[b.tipo] - tipoOrder[a.tipo]
        default:
          return 0
      }
    })

    return filtradas
  }, [notificaciones, searchTerm, filtroEstado, filtroTipo, filtroCategoria, filtroPrioridad, sortBy])

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleSelectAll = () => {
    if (selectedNotificaciones.length === notificacionesFiltradas.length) {
      setSelectedNotificaciones([])
    } else {
      setSelectedNotificaciones(notificacionesFiltradas.map(n => n.id))
    }
  }

  const handleMarcarSeleccionadasComoLeidas = async () => {
    for (const id of selectedNotificaciones) {
      await marcarComoLeida(id)
    }
    setSelectedNotificaciones([])
  }

  const handleArchivarSeleccionadas = async () => {
    for (const id of selectedNotificaciones) {
      await archivarNotificacion(id)
    }
    setSelectedNotificaciones([])
  }

  const handleEliminarSeleccionadas = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar las notificaciones seleccionadas? Esta acción no se puede deshacer.')) {
      for (const id of selectedNotificaciones) {
        await eliminarNotificacion(id)
      }
      setSelectedNotificaciones([])
    }
  }

  const toggleSeleccion = (notificacionId: number) => {
    setSelectedNotificaciones(prev =>
      prev.includes(notificacionId)
        ? prev.filter(id => id !== notificacionId)
        : [...prev, notificacionId]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFiltroEstado('todos')
    setFiltroTipo('todos')
    setFiltroCategoria('todos')
    setFiltroPrioridad('todos')
    setSortBy('fecha')
  }

  const hasActiveFilters = searchTerm || filtroEstado !== 'todos' || filtroTipo !== 'todos' ||
                           filtroCategoria !== 'todos' || filtroPrioridad !== 'todos'

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar notificaciones</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Bell className="h-8 w-8" />
            <span>Centro de Notificaciones</span>
            {noLeidasCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {noLeidasCount} nuevas
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {scoutId
              ? `Notificaciones de ${notificaciones.find(n => n.scout_id === scoutId)?.scout_nombre || 'scout'}`
              : 'Todas las comunicaciones de tus hijos'
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Nuevo Mensaje
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.noLeidas}</div>
            <div className="text-xs text-muted-foreground">No leídas</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.urgentes}</div>
            <div className="text-xs text-muted-foreground">Urgentes</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.importantes}</div>
            <div className="text-xs text-muted-foreground">Importantes</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.documentos}</div>
            <div className="text-xs text-muted-foreground">Documentos</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.actividades}</div>
            <div className="text-xs text-muted-foreground">Actividades</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.galeria}</div>
            <div className="text-xs text-muted-foreground">Galería</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.archivadas}</div>
            <div className="text-xs text-muted-foreground">Archivadas</div>
          </div>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros y Búsqueda</span>
              {hasActiveFilters && (
                <Badge variant="secondary">
                  Activos
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={filtroEstado} onValueChange={(value) => setFiltroEstado(value as EstadoNotificacion | 'todos')}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="no_leida">No leídas</SelectItem>
                  <SelectItem value="leida">Leídas</SelectItem>
                  <SelectItem value="archivada">Archivadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as TipoNotificacion | 'todos')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="urgente">🚨 Urgente</SelectItem>
                  <SelectItem value="importante">⚠️ Importante</SelectItem>
                  <SelectItem value="informativo">ℹ️ Informativo</SelectItem>
                  <SelectItem value="recordatorio">📅 Recordatorio</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroCategoria} onValueChange={(value) => setFiltroCategoria(value as CategoriaNotificacion | 'todos')}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  <SelectItem value="documentos">📄 Documentos</SelectItem>
                  <SelectItem value="actividades">🏕️ Actividades</SelectItem>
                  <SelectItem value="galeria">📸 Galería</SelectItem>
                  <SelectItem value="general">📋 General</SelectItem>
                  <SelectItem value="comunicados">📢 Comunicados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroPrioridad} onValueChange={(value) => setFiltroPrioridad(value as PrioridadNotificacion | 'todos')}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las prioridades</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                  <SelectItem value="normal">🟡 Normal</SelectItem>
                  <SelectItem value="baja">🟢 Baja</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'fecha' | 'prioridad' | 'tipo')}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fecha">🕐 Fecha</SelectItem>
                  <SelectItem value="prioridad">⚡ Prioridad</SelectItem>
                  <SelectItem value="tipo">📝 Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Acciones masivas */}
      {selectedNotificaciones.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedNotificaciones.length === notificacionesFiltradas.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedNotificaciones.length} seleccionadas
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleMarcarSeleccionadasComoLeidas}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar leídas
                </Button>
                <Button size="sm" variant="outline" onClick={handleArchivarSeleccionadas}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archivar
                </Button>
                <Button size="sm" variant="destructive" onClick={handleEliminarSeleccionadas}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de notificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Notificaciones ({notificacionesFiltradas.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={notificacionesFiltradas.length === 0}
              >
                {selectedNotificaciones.length === notificacionesFiltradas.length ? (
                  <CheckSquare className="h-4 w-4 mr-2" />
                ) : (
                  <Square className="h-4 w-4 mr-2" />
                )}
                Seleccionar todas
              </Button>
              {stats.noLeidas > 0 && (
                <Button size="sm" variant="outline" onClick={marcarTodasComoLeidas}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Cargando notificaciones...</p>
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? 'No hay notificaciones con esos filtros' : 'No hay notificaciones'}
              </h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'Intenta ajustar los filtros para ver más resultados'
                  : 'Tu bandeja de notificaciones está vacía'
                }
              </p>
              {hasActiveFilters && (
                <Button className="mt-4" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {notificacionesFiltradas.map((notificacion) => (
                <div key={notificacion.id} className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedNotificaciones.includes(notificacion.id)}
                    onCheckedChange={() => toggleSeleccion(notificacion.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <NotificationItem
                      notification={notificacion}
                      onMarkAsRead={marcarComoLeida}
                      onArchive={archivarNotificacion}
                      onDelete={eliminarNotificacion}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}