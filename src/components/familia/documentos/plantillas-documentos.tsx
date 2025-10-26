'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  File,
  FileDown,
  Printer,
  Share2,
  Info,
  BookOpen,
  HelpCircle,
  Star,
  TrendingUp,
  Calendar,
  User,
  Shield,
  Camera,
  Heart,
  Edit
} from "lucide-react"
import { PlantillaDocumento } from '@/hooks/useDocumentosFamilia'

interface PlantillasDocumentosProps {
  plantillas: PlantillaDocumento[] | null
  onDownloadPlantilla: (plantillaId: string) => Promise<void>
  onPreviewPlantilla?: (plantillaId: string) => Promise<string>
  loading?: boolean
}

interface PlantillaCardProps {
  plantilla: PlantillaDocumento
  onDownload: (plantillaId: string) => Promise<void>
  onPreview?: (plantillaId: string) => Promise<string>
  showFullDescription?: boolean
}

// Categorías de plantillas
const CATEGORIAS_PLANTILLAS = [
  { value: 'todos', label: 'Todas las Plantillas', icon: FileText },
  { value: 'autorizaciones', label: 'Autorizaciones', icon: Shield },
  { value: 'medicos', label: 'Documentos Médicos', icon: Heart },
  { value: 'inscripcion', label: 'Inscripción', icon: Edit },
  { value: 'identificacion', label: 'Identificación', icon: User },
  { value: 'actividades', label: 'Actividades', icon: Calendar }
]

// Estadísticas de uso (simuladas)
const ESTADISTICAS_PLANTILLAS = {
  autorizacion_medica: { descargas: 1250, popularidad: 95 },
  seguro_accidentes: { descargas: 980, popularidad: 88 },
  ficha_alergias: { descargas: 750, popularidad: 82 },
  autorizacion_imagen: { descargas: 620, popularidad: 76 },
  autorizacion_transporte: { descargas: 580, popularidad: 74 }
}

function PlantillaCard({
  plantilla,
  onDownload,
  onPreview,
  showFullDescription = false
}: PlantillaCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Configuración de iconos por tipo
  const getIconByTipo = (tipo: string) => {
    const icons = {
      autorizacion_medica: Shield,
      seguro_accidentes: Shield,
      autorizacion_imagen: Camera,
      autorizacion_transporte: File,
      ficha_alergias: Heart,
      informe_medico: FileText,
      inscripcion: Edit,
      dni: User,
      foto_carnet: Camera,
      otro: File
    }
    return icons[tipo as keyof typeof icons] || File
  }

  // Configuración de colores por formato
  const getFormatColor = (formato: string) => {
    const colors = {
      docx: 'text-blue-600 bg-blue-50 border-blue-200',
      pdf: 'text-red-600 bg-red-50 border-red-200',
      odt: 'text-green-600 bg-green-50 border-green-200'
    }
    return colors[formato as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  // Estadísticas de la plantilla
  const estadisticas = ESTADISTICAS_PLANTILLAS[plantilla.tipo as keyof typeof ESTADISTICAS_PLANTILLAS]

  const Icon = getIconByTipo(plantilla.tipo)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await onDownload(plantilla.id)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePreview = async () => {
    if (onPreview) {
      await onPreview(plantilla.id)
    }
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">{plantilla.titulo}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {showFullDescription
                  ? plantilla.descripcion
                  : plantilla.descripcion.length > 80
                    ? plantilla.descripcion.substring(0, 80) + '...'
                    : plantilla.descripcion
                }
              </CardDescription>
            </div>
          </div>
          <Badge className={getFormatColor(plantilla.formato)}>
            {plantilla.formato.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Campos del formulario */}
        {plantilla.campos && plantilla.campos.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Campos incluidos:</p>
            <div className="flex flex-wrap gap-1">
              {plantilla.campos.slice(0, 4).map((campo, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {campo.nombre}
                  {campo.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </Badge>
              ))}
              {plantilla.campos.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{plantilla.campos.length - 4} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Estadísticas de uso */}
        {estadisticas && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Download className="h-3 w-3" />
                <span>{estadisticas.descargas} descargas</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{estadisticas.popularidad}% popular</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(estadisticas.popularidad / 20)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {plantilla.instrucciones && plantilla.instrucciones.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              {showInstructions ? 'Ocultar' : 'Ver'} instrucciones
            </Button>
            {showInstructions && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Instrucciones:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {plantilla.instrucciones.map((instruccion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{instruccion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" />
                Descargar
              </>
            )}
          </Button>
          {onPreview && (
            <Button size="sm" variant="outline" onClick={handlePreview}>
              <Eye className="h-3 w-3 mr-1" />
              Vista previa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function PlantillasDocumentos({
  plantillas,
  onDownloadPlantilla,
  onPreviewPlantilla,
  loading = false
}: PlantillasDocumentosProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [formatoFiltro, setFormatoFiltro] = useState('todos')
  const [sortBy, setSortBy] = useState('popularidad')

  // Filtrar plantillas
  const plantillasFiltradas = plantillas?.filter(plantilla => {
    // Búsqueda
    const cumpleBusqueda = searchQuery === '' ||
      plantilla.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plantilla.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plantilla.tipo.toLowerCase().includes(searchQuery.toLowerCase())

    // Categoría
    const cumpleCategoria = categoriaFiltro === 'todos' ||
      (categoriaFiltro === 'autorizaciones' && plantilla.tipo.includes('autorizacion')) ||
      (categoriaFiltro === 'medicos' && (plantilla.tipo.includes('medico') || plantilla.tipo.includes('alergia'))) ||
      (categoriaFiltro === 'inscripcion' && plantilla.tipo === 'inscripcion') ||
      (categoriaFiltro === 'identificacion' && (plantilla.tipo === 'dni' || plantilla.tipo === 'foto_carnet')) ||
      (categoriaFiltro === 'actividades' && plantilla.tipo.includes('transporte'))

    // Formato
    const cumpleFormato = formatoFiltro === 'todos' || plantilla.formato === formatoFiltro

    return cumpleBusqueda && cumpleCategoria && cumpleFormato
  }) || []

  // Ordenar plantillas
  const plantillasOrdenadas = [...plantillasFiltradas].sort((a, b) => {
    switch (sortBy) {
      case 'popularidad':
        const statsA = ESTADISTICAS_PLANTILLAS[a.tipo as keyof typeof ESTADISTICAS_PLANTILLAS]
        const statsB = ESTADISTICAS_PLANTILLAS[b.tipo as keyof typeof ESTADISTICAS_PLANTILLAS]
        return (statsB?.popularidad || 0) - (statsA?.popularidad || 0)
      case 'descargas':
        const downloadsA = ESTADISTICAS_PLANTILLAS[a.tipo as keyof typeof ESTADISTICAS_PLANTILLAS]
        const downloadsB = ESTADISTICAS_PLANTILLAS[b.tipo as keyof typeof ESTADISTICAS_PLANTILLAS]
        return (downloadsB?.descargas || 0) - (downloadsA?.descargas || 0)
      case 'alfabetico':
        return a.titulo.localeCompare(b.titulo)
      case 'recientes':
        return 0 // Simular orden por fecha (no implementado)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Plantillas de Documentos
        </h2>
        <p className="text-muted-foreground">
          Descarga plantillas predefinidas para facilitar la documentación de tus hijos
        </p>
      </div>

      {/* Guía rápida */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5" />
            Guía Rápida de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <p className="font-medium text-blue-800">Selecciona</p>
                <p className="text-blue-700">Elige la plantilla que necesitas</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <p className="font-medium text-blue-800">Descarga</p>
                <p className="text-blue-700">Obtén el archivo en tu dispositivo</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <p className="font-medium text-blue-800">Completa</p>
                <p className="text-blue-700">Rellena la información requerida</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <p className="font-medium text-blue-800">Sube</p>
                <p className="text-blue-700">Adjunta el documento completado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_PLANTILLAS.map((categoria) => (
                <SelectItem key={categoria.value} value={categoria.value}>
                  <div className="flex items-center gap-2">
                    <categoria.icon className="h-4 w-4" />
                    {categoria.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={formatoFiltro} onValueChange={setFormatoFiltro}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="odt">ODT</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularidad">Popularidad</SelectItem>
              <SelectItem value="descargas">Descargas</SelectItem>
              <SelectItem value="alfabetico">Alfabético</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{plantillas?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Plantillas totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {plantillas?.filter(p => p.formato === 'docx').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Editables (DOCX)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {plantillas?.filter(p => p.tipo.includes('autorizacion')).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Autorizaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(ESTADISTICAS_PLANTILLAS).reduce((sum, stats) => sum + stats.descargas, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total descargas</p>
          </CardContent>
        </Card>
      </div>

      {/* Plantillas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando plantillas...</p>
        </div>
      ) : plantillasOrdenadas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillasOrdenadas.map((plantilla) => (
            <PlantillaCard
              key={plantilla.id}
              plantilla={plantilla}
              onDownload={onDownloadPlantilla}
              onPreview={onPreviewPlantilla}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron plantillas</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoriaFiltro !== 'todos' || formatoFiltro !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay plantillas disponibles en este momento'
              }
            </p>
            {(searchQuery || categoriaFiltro !== 'todos' || formatoFiltro !== 'todos') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setCategoriaFiltro('todos')
                  setFormatoFiltro('todos')
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sección de ayuda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-5 w-5" />
            ¿Necesitas ayuda?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium">Formatos de archivo:</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">DOCX</Badge>
                  <span>Editable en Microsoft Word</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">PDF</Badge>
                  <span>Formulario imprimible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">ODT</Badge>
                  <span>Compatible con OpenOffice/LibreOffice</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Consejos útiles:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Guarda una copia de los documentos completados</li>
                <li>• Usa letra clara y legible al completar formularios</li>
                <li>• Revisa que todos los campos obligatorios estén completos</li>
                <li>• Escanea o fotografía los documentos en alta calidad</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Contactar soporte
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Guía en PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Más información
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente compacto para selección rápida de plantillas
export function PlantillaQuickSelect({
  plantillas,
  onDownloadPlantilla,
  selectedTipo
}: {
  plantillas: PlantillaDocumento[] | null
  onDownloadPlantilla: (plantillaId: string) => Promise<void>
  selectedTipo?: string
}) {
  const plantillaFiltrada = plantillas?.find(p => p.tipo === selectedTipo)

  if (!plantillaFiltrada) return null

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Plantilla recomendada</p>
              <p className="text-sm text-blue-700">{plantillaFiltrada.titulo}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => onDownloadPlantilla(plantillaFiltrada.id)}>
            <Download className="h-3 w-3 mr-1" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}