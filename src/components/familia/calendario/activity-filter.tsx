'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, Search, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityFilters {
  tipo: string
  confirmacion: string
  busqueda: string
}

interface ActivityFilterProps {
  filtros: Omit<ActivityFilters, 'busqueda'>
  onFiltrosChange: (filtros: Omit<ActivityFilters, 'busqueda'>) => void
  className?: string
}

export function ActivityFilter({ filtros, onFiltrosChange, className }: ActivityFilterProps) {
  const [busqueda, setBusqueda] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const tiposActividad = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'reunion_sabado', label: 'Reuniones de Sábado' },
    { value: 'salida', label: 'Salidas' },
    { value: 'campamento', label: 'Campamentos' },
    { value: 'evento_especial', label: 'Eventos' }
  ]

  const estadosConfirmacion = [
    { value: 'todos', label: 'Todas las confirmaciones' },
    { value: 'pendientes', label: 'Pendientes de confirmar' },
    { value: 'confirmadas', label: 'Confirmadas' }
  ]

  const handleFilterChange = (key: keyof ActivityFilters, value: string) => {
    onFiltrosChange({
      ...filtros,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltrosChange({
      tipo: 'todos',
      confirmacion: 'todos'
    })
    setBusqueda('')
  }

  const hasActiveFilters = filtros.tipo !== 'todos' ||
                          filtros.confirmacion !== 'todos' ||
                          busqueda.trim() !== ''

  const activeFiltersCount = [
    filtros.tipo !== 'todos',
    filtros.confirmacion !== 'todos',
    busqueda.trim() !== ''
  ].filter(Boolean).length

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium">Filtros</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} activos
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronDown className={cn(
                'h-4 w-4 mr-1 transition-transform',
                showAdvanced && 'rotate-180'
              )} />
              {showAdvanced ? 'Menos' : 'Más'} filtros
            </Button>
          </div>
        </div>

        {/* Filtros principales */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar actividades..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro rápido de confirmación */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-48 justify-between">
                {estadosConfirmacion.find(e => e.value === filtros.confirmacion)?.label || 'Confirmación'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {estadosConfirmacion.map(estado => (
                <DropdownMenuItem
                  key={estado.value}
                  onClick={() => handleFilterChange('confirmacion', estado.value)}
                  className={cn(
                    'cursor-pointer',
                    filtros.confirmacion === estado.value && 'bg-gray-100'
                  )}
                >
                  {estado.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Filtro de tipo de actividad */}
              <Select
                value={filtros.tipo}
                onValueChange={(value) => handleFilterChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de actividad" />
                </SelectTrigger>
                <SelectContent>
                  {tiposActividad.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>
        )}

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filtros.tipo !== 'todos' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Tipo: {tiposActividad.find(t => t.value === filtros.tipo)?.label}</span>
                  <button
                    onClick={() => handleFilterChange('tipo', 'todos')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filtros.confirmacion !== 'todos' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Estado: {estadosConfirmacion.find(e => e.value === filtros.confirmacion)?.label}</span>
                  <button
                    onClick={() => handleFilterChange('confirmacion', 'todos')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {busqueda.trim() !== '' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Búsqueda: "{busqueda}"</span>
                  <button
                    onClick={() => setBusqueda('')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}