"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, X, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SearchFilters {
  query: string
  rol?: string
  estado?: string
  seccion?: string
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  placeholder?: string
  className?: string
  showFilters?: {
    rol: boolean
    estado: boolean
    seccion: boolean
  }
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = "Buscar usuarios...",
  className = "",
  showFilters = {
    rol: true,
    estado: true,
    seccion: true
  }
}: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    rol: "all",
    estado: "all",
    seccion: "all"
  })
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    const count = Object.values(filters).filter(value =>
      value && value !== "" && value !== "all"
    ).length
    setActiveFiltersCount(count)
  }, [filters])

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters = {
      query: "",
      rol: "all",
      estado: "all",
      seccion: "all"
    }
    setFilters(clearedFilters)
    onClear()
    onSearch(clearedFilters)
  }

  const handleInputChange = (key: keyof SearchFilters, value: string) => {
    // Convertir "all" a string vacío para el filtrado
    const filterValue = value === "all" ? "" : value
    const newFilters = { ...filters, [key]: filterValue }
    setFilters({ ...filters, [key]: value }) // Mantener "all" en el estado
    onSearch(newFilters) // Enviar "" para el filtrado
  }

  const hasActiveFilters = activeFiltersCount > 0

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        {/* Main search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => handleInputChange("query", e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.query && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => handleInputChange("query", "")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search button */}
        <Button onClick={handleSearch} className="shrink-0">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClear}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}

        {/* Advanced filters dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            {showFilters.rol && (
              <div className="p-2">
                <label className="text-sm font-medium mb-2 block">Rol</label>
                <Select
                  value={filters.rol}
                  onValueChange={(value) => handleInputChange("rol", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="scouter">Scouter</SelectItem>
                    <SelectItem value="usuario">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.estado && (
              <div className="p-2">
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={filters.estado}
                  onValueChange={(value) => handleInputChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {showFilters.seccion && (
              <div className="p-2">
                <label className="text-sm font-medium mb-2 block">Sección</label>
                <Select
                  value={filters.seccion}
                  onValueChange={(value) => handleInputChange("seccion", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las secciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las secciones</SelectItem>
                    <SelectItem value="castores">Castores</SelectItem>
                    <SelectItem value="manada">Manada</SelectItem>
                    <SelectItem value="tropa">Tropa</SelectItem>
                    <SelectItem value="pioneros">Pioneros</SelectItem>
                    <SelectItem value="rutas">Rutas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.rol && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Rol: {filters.rol}
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleInputChange("rol", "")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.estado && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Estado: {filters.estado}
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleInputChange("estado", "")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.seccion && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sección: {filters.seccion}
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 p-0 hover:bg-transparent"
                onClick={() => handleInputChange("seccion", "")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}