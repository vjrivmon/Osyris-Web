'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, SlidersHorizontal, FilterX } from 'lucide-react'
import { EducandoFilters as FilterType, GrupoEdad, GRUPOS_EDAD_CONFIG } from '@/types/educando-scouter'

interface EducandoFiltersProps {
  filters: FilterType
  onFiltersChange: (filters: Partial<FilterType>) => void
  onReset: () => void
}

// Valores por defecto para los filtros
const DEFAULT_FILTERS: FilterType = {
  page: 1,
  limit: 10,
  search: '',
  orderBy: 'apellidos',
  orderDir: 'asc',
  genero: '',
  estadoDocs: 'todos',
  grupoEdad: 'todos',
  activo: 'activos'
}

export function EducandoFilters({ filters, onFiltersChange, onReset }: EducandoFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sincronizar filtros desde URL al montar el componente
  useEffect(() => {
    if (isInitialized) return

    const urlFilters: Partial<FilterType> = {}

    const search = searchParams.get('search')
    const genero = searchParams.get('genero')
    const estadoDocs = searchParams.get('estadoDocs') as FilterType['estadoDocs']
    const grupoEdad = searchParams.get('grupoEdad') as GrupoEdad
    const activo = searchParams.get('activo') as FilterType['activo']
    const orderBy = searchParams.get('orderBy') as FilterType['orderBy']
    const orderDir = searchParams.get('orderDir') as FilterType['orderDir']
    const page = searchParams.get('page')

    if (search) {
      urlFilters.search = search
      setSearchValue(search)
    }
    if (genero) urlFilters.genero = genero
    if (estadoDocs && ['todos', 'completos', 'incompletos', 'pendientes'].includes(estadoDocs)) {
      urlFilters.estadoDocs = estadoDocs
    }
    if (grupoEdad && Object.keys(GRUPOS_EDAD_CONFIG).includes(grupoEdad)) {
      urlFilters.grupoEdad = grupoEdad
    }
    if (activo && ['todos', 'activos', 'inactivos'].includes(activo)) {
      urlFilters.activo = activo
    }
    if (orderBy) urlFilters.orderBy = orderBy
    if (orderDir && ['asc', 'desc'].includes(orderDir)) urlFilters.orderDir = orderDir
    if (page) urlFilters.page = parseInt(page)

    // Si hay filtros avanzados en la URL, mostrar el panel
    if (genero || (estadoDocs && estadoDocs !== 'todos') ||
        (grupoEdad && grupoEdad !== 'todos') ||
        (activo && activo !== 'activos')) {
      setShowAdvanced(true)
    }

    if (Object.keys(urlFilters).length > 0) {
      onFiltersChange(urlFilters)
    }

    setIsInitialized(true)
  }, [searchParams, onFiltersChange, isInitialized])

  // Actualizar URL cuando cambian los filtros
  const updateUrl = useCallback((newFilters: FilterType) => {
    const params = new URLSearchParams()

    // Solo agregar parametros que no sean valores por defecto
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.genero) params.set('genero', newFilters.genero)
    if (newFilters.estadoDocs && newFilters.estadoDocs !== 'todos') {
      params.set('estadoDocs', newFilters.estadoDocs)
    }
    if (newFilters.grupoEdad && newFilters.grupoEdad !== 'todos') {
      params.set('grupoEdad', newFilters.grupoEdad)
    }
    if (newFilters.activo && newFilters.activo !== 'activos') {
      params.set('activo', newFilters.activo)
    }
    if (newFilters.orderBy && newFilters.orderBy !== 'apellidos') {
      params.set('orderBy', newFilters.orderBy)
    }
    if (newFilters.orderDir && newFilters.orderDir !== 'asc') {
      params.set('orderDir', newFilters.orderDir)
    }
    if (newFilters.page && newFilters.page > 1) {
      params.set('page', newFilters.page.toString())
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(newUrl, { scroll: false })
  }, [pathname, router])

  // Debounce para la busqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search && isInitialized) {
        const newFilters = { ...filters, search: searchValue, page: 1 }
        onFiltersChange({ search: searchValue, page: 1 })
        updateUrl(newFilters)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, filters, onFiltersChange, updateUrl, isInitialized])

  // Handler para cambios de filtros (no busqueda)
  const handleFilterChange = (key: keyof FilterType, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === 'todos' && (key === 'genero') ? '' : value,
      page: 1 // Resetear a pagina 1 al cambiar filtros
    }
    onFiltersChange({ [key]: value === 'todos' && key === 'genero' ? '' : value, page: 1 })
    updateUrl(newFilters)
  }

  // Handler para ordenacion
  const handleOrderChange = (value: string) => {
    const [orderBy, orderDir] = value.split('-') as [FilterType['orderBy'], FilterType['orderDir']]
    const newFilters = { ...filters, orderBy, orderDir }
    onFiltersChange({ orderBy, orderDir })
    updateUrl(newFilters)
  }

  // Handler para limpiar filtros
  const handleReset = () => {
    setSearchValue('')
    onReset()
    router.replace(pathname, { scroll: false })
  }

  // Calcular cuantos filtros activos hay
  const activeFiltersCount = [
    filters.search,
    filters.genero,
    filters.estadoDocs !== 'todos' ? filters.estadoDocs : null,
    filters.grupoEdad !== 'todos' ? filters.grupoEdad : null,
    filters.activo !== 'activos' ? filters.activo : null
  ].filter(Boolean).length

  const hasActiveFilters = activeFiltersCount > 0 ||
    filters.orderBy !== 'apellidos' ||
    filters.orderDir !== 'asc'

  return (
    <div className="space-y-4">
      {/* Barra de filtros principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Campo de busqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o apellidos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Botones de accion */}
        <div className="flex gap-2">
          <Button
            variant={showAdvanced ? "secondary" : "outline"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0 relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros avanzados expandibles */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg border">
          {/* Ordenar por */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
            <Select
              value={`${filters.orderBy || 'apellidos'}-${filters.orderDir || 'asc'}`}
              onValueChange={handleOrderChange}
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

          {/* Filtro de genero */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Genero</label>
            <Select
              value={filters.genero || 'todos'}
              onValueChange={(value) => handleFilterChange('genero', value)}
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

          {/* Filtro de grupo de edad */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Grupo de Edad</label>
            <Select
              value={filters.grupoEdad || 'todos'}
              onValueChange={(value) => handleFilterChange('grupoEdad', value as GrupoEdad)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las edades</SelectItem>
                <SelectItem value="5-7">5-7 años (Castores)</SelectItem>
                <SelectItem value="8-10">8-10 años (Manada)</SelectItem>
                <SelectItem value="11-13">11-13 años (Tropa)</SelectItem>
                <SelectItem value="14-16">14-16 años (Pioneros)</SelectItem>
                <SelectItem value="17-19">17-19 años (Rutas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de estado de documentacion */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Documentacion</label>
            <Select
              value={filters.estadoDocs || 'todos'}
              onValueChange={(value) => handleFilterChange('estadoDocs', value as FilterType['estadoDocs'])}
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

          {/* Filtro de estado activo/inactivo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Estado</label>
            <Select
              value={filters.activo || 'activos'}
              onValueChange={(value) => handleFilterChange('activo', value as FilterType['activo'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activos">Solo activos</SelectItem>
                <SelectItem value="inactivos">Solo inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Badges de filtros activos */}
      {activeFiltersCount > 0 && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busqueda: &ldquo;{filters.search}&rdquo;
              <button onClick={() => setSearchValue('')} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.genero && (
            <Badge variant="secondary" className="gap-1">
              Genero: {filters.genero}
              <button onClick={() => handleFilterChange('genero', '')} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.grupoEdad && filters.grupoEdad !== 'todos' && (
            <Badge variant="secondary" className="gap-1">
              Edad: {filters.grupoEdad} años
              <button onClick={() => handleFilterChange('grupoEdad', 'todos')} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.estadoDocs && filters.estadoDocs !== 'todos' && (
            <Badge variant="secondary" className="gap-1">
              Docs: {filters.estadoDocs}
              <button onClick={() => handleFilterChange('estadoDocs', 'todos')} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.activo && filters.activo !== 'activos' && (
            <Badge variant="secondary" className="gap-1">
              Estado: {filters.activo}
              <button onClick={() => handleFilterChange('activo', 'activos')} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
