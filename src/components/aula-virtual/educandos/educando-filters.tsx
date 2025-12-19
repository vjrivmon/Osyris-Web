'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { EducandoFilters as FilterType } from '@/types/educando-scouter'

interface EducandoFiltersProps {
  filters: FilterType
  onFiltersChange: (filters: Partial<FilterType>) => void
  onReset: () => void
}

export function EducandoFilters({ filters, onFiltersChange, onReset }: EducandoFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ search: searchValue })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, filters.search, onFiltersChange])

  const hasActiveFilters = filters.search || filters.genero || filters.estadoDocs !== 'todos'

  return (
    <div className="space-y-4">
      {/* Main search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o apellidos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Ordenar por</label>
            <Select
              value={`${filters.orderBy}-${filters.orderDir}`}
              onValueChange={(value) => {
                const [orderBy, orderDir] = value.split('-') as [FilterType['orderBy'], FilterType['orderDir']]
                onFiltersChange({ orderBy, orderDir })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apellidos-asc">Apellidos (A-Z)</SelectItem>
                <SelectItem value="apellidos-desc">Apellidos (Z-A)</SelectItem>
                <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="edad-asc">Edad (menor a mayor)</SelectItem>
                <SelectItem value="edad-desc">Edad (mayor a menor)</SelectItem>
                <SelectItem value="fecha_nacimiento-asc">Nacimiento (antiguos primero)</SelectItem>
                <SelectItem value="fecha_nacimiento-desc">Nacimiento (recientes primero)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Genero</label>
            <Select
              value={filters.genero || 'todos'}
              onValueChange={(value) => onFiltersChange({ genero: value === 'todos' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Estado Documentacion</label>
            <Select
              value={filters.estadoDocs || 'todos'}
              onValueChange={(value) => onFiltersChange({ estadoDocs: value as FilterType['estadoDocs'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="completos">Completos</SelectItem>
                <SelectItem value="incompletos">Incompletos</SelectItem>
                <SelectItem value="pendientes">Con pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
