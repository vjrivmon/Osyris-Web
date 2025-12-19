'use client'
import { getApiUrl } from '@/lib/api-utils'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Badge
} from '@/components/ui/badge'
import {
  Link,
  Search,
  Users,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Info,
  Mail,
  Calendar,
  Shield
} from 'lucide-react'
import { useAdminFamiliares, type Familiar, type VinculacionEducando } from '@/hooks/useAdminFamiliares'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Educando {
  id: number
  nombre: string
  apellidos: string
  seccion: string
  seccion_id: number
  email?: string
  telefono?: string
  familiaVinculada?: {
    id: number
    nombre: string
    apellidos: string
    email: string
    relationType: string
  }
}

interface VincularEducandoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  familiarId?: number
  onSuccess?: () => void
}

type RelationType = 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'ABUELO' | 'OTRO'

export function VincularEducandoModal({ open, onOpenChange, familiarId, onSuccess }: VincularEducandoModalProps) {
  const [formData, setFormData] = useState<{
    familiarId: number
    educandoId: number
    relationType: RelationType
    relationDescription: string
    esContactoPrincipal: boolean
    enviarNotificacion: boolean
  }>({
    familiarId: familiarId || 0,
    educandoId: 0,
    relationType: 'PADRE',
    relationDescription: '',
    esContactoPrincipal: false,
    enviarNotificacion: true
  })

  const [familiares, setFamiliares] = useState<Familiar[]>([])
  const [educandos, setEducandos] = useState<Educando[]>([])
  const [educandosVinculados, setEducandosVinculados] = useState<number[]>([]) // IDs de educandos ya vinculados al familiar seleccionado
  const [loadingFamiliares, setLoadingFamiliares] = useState(false)
  const [loadingEducandos, setLoadingEducandos] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [seccionFilter, setSeccionFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('familiares')
  const [previewData, setPreviewData] = useState<any>(null)

  const { loading, vincularEducando } = useAdminFamiliares()
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      cargarFamiliares()
      cargarEducandos()
    }
  }, [open])

  const cargarFamiliares = async () => {
    setLoadingFamiliares(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/activas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setFamiliares(data.familiares)
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudieron cargar los familiares",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cargando familiares:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los familiares",
        variant: "destructive"
      })
    } finally {
      setLoadingFamiliares(false)
    }
  }

  const cargarEducandos = async () => {
    setLoadingEducandos(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/educandos/disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setEducandos(data.educandos)
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudieron cargar los educandos",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cargando educandos:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los educandos",
        variant: "destructive"
      })
    } finally {
      setLoadingEducandos(false)
    }
  }


  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFamiliarSelection = (familiarId: number) => {
    setFormData(prev => ({
      ...prev,
      familiarId
    }))

    // Cargar educandos ya vinculados a este familiar
    const familiar = familiares.find(f => f.id === familiarId)
    if (familiar) {
      const educandosIds = familiar.educandosVinculados.map(e => e.id)
      console.log(`✅ [VincularModal] Familiar seleccionado: ${familiar.nombre} ${familiar.apellidos}`)
      console.log(`📋 [VincularModal] Educandos ya vinculados (${educandosIds.length}):`, educandosIds)
      setEducandosVinculados(educandosIds)
    } else {
      setEducandosVinculados([])
    }

    generatePreview(familiarId, formData.educandoId)
  }

  const handleEducandoSelection = (educandoId: number) => {
    setFormData(prev => ({
      ...prev,
      educandoId
    }))
    generatePreview(formData.familiarId, educandoId)
  }

  const generatePreview = (famId: number, scId: number) => {
    if (famId && scId) {
      const familiar = familiares.find(f => f.id === famId)
      const scout = educandos.find(s => s.id === scId)

      if (familiar && scout) {
        setPreviewData({
          familiar,
          scout,
          relationType: formData.relationType,
          relationDescription: formData.relationDescription,
          esContactoPrincipal: formData.esContactoPrincipal
        })
      }
    } else {
      setPreviewData(null)
    }
  }

  useEffect(() => {
    if (formData.familiarId && formData.educandoId) {
      generatePreview(formData.familiarId, formData.educandoId)
    }
  }, [formData, familiares, educandos])

  const validateForm = () => {
    if (!formData.familiarId) {
      toast({
        title: "Error de validación",
        description: "Debes seleccionar un familiar",
        variant: "destructive"
      })
      return false
    }

    if (!formData.educandoId) {
      toast({
        title: "Error de validación",
        description: "Debes seleccionar un scout",
        variant: "destructive"
      })
      return false
    }

    // Verificar que el scout no ya esté vinculado a este familiar
    const familiar = familiares.find(f => f.id === formData.familiarId)
    if (familiar?.educandosVinculados.some(s => s.id === formData.educandoId)) {
      toast({
        title: "Error de validación",
        description: "Este scout ya está vinculado a este familiar",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const vinculacion: VinculacionEducando = {
      familiarId: formData.familiarId,
      educandoId: formData.educandoId,
      relationType: formData.relationType,
      relationDescription: formData.relationDescription || undefined,
      esContactoPrincipal: formData.esContactoPrincipal
    }

    const success = await vincularEducando(vinculacion)

    if (success) {
      // Resetear formulario
      setFormData({
        familiarId: familiarId || 0,
        educandoId: 0,
        relationType: 'PADRE',
        relationDescription: '',
        esContactoPrincipal: false,
        enviarNotificacion: true
      })
      setActiveTab('familiares')
      setPreviewData(null)

      onOpenChange(false)
      onSuccess?.()
    }
  }

  const getRelationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PADRE: 'Padre',
      MADRE: 'Madre',
      TUTOR_LEGAL: 'Tutor Legal',
      ABUELO: 'Abuelo/a',
      OTRO: 'Otro'
    }
    return labels[type] || type
  }

  const familiaresFiltrados = familiares.filter(familiar =>
    familiar.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    familiar.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    familiar.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const educandosFiltrados = educandos.filter(scout => {
    const matchesSearch = searchTerm === '' ||
      scout.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scout.apellidos.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeccion = seccionFilter === 'all' || scout.seccion === seccionFilter

    return matchesSearch && matchesSeccion
  })

  const renderPreview = () => {
    if (!previewData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Vista previa de vinculación
          </CardTitle>
          <CardDescription>
            Revisa los detalles de la vinculación antes de confirmar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Familiar</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-md">
                  <div className="font-medium">
                    {previewData.familiar.nombre} {previewData.familiar.apellidos}
                  </div>
                  <div className="text-sm text-gray-600">{previewData.familiar.email}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Educando</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-md">
                  <div className="font-medium">
                    {previewData.scout.nombre} {previewData.scout.apellidos}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {previewData.scout.seccion}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Tipo de Relación</Label>
              <div className="mt-1">
                <Badge variant="default">
                  {getRelationTypeLabel(previewData.relationType)}
                </Badge>
                {previewData.relationDescription && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({previewData.relationDescription})
                  </span>
                )}
              </div>
            </div>

            {previewData.esContactoPrincipal && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Contacto principal para este scout</span>
              </div>
            )}

            {formData.enviarNotificacion && (
              <div className="bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-yellow-600" />
                  <span>Se enviará una notificación por email al familiar</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Esta vinculación permitirá al familiar ver la información y actividades del scout</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular Educando a Familiar
          </DialogTitle>
          <DialogDescription>
            Crea una nueva vinculación entre un scout y un familiar existente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="familiares">Seleccionar Familiar</TabsTrigger>
            <TabsTrigger value="educandos">Seleccionar Educando</TabsTrigger>
            <TabsTrigger value="preview">Confirmar</TabsTrigger>
          </TabsList>

          <TabsContent value="familiares" className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar Familiar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingFamiliares ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Cargando familiares...</span>
              </div>
            ) : familiaresFiltrados.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No se encontraron familiares con esa búsqueda" : "No hay familiares activos"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {familiaresFiltrados.map((familiar) => (
                  <Card
                    key={familiar.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-blue-50",
                      formData.familiarId === familiar.id && "ring-2 ring-blue-500 bg-blue-50"
                    )}
                    onClick={() => handleFamiliarSelection(familiar.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {familiar.nombre} {familiar.apellidos}
                          </div>
                          <div className="text-sm text-gray-600">{familiar.email}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={familiar.estado === 'ACTIVO' ? 'default' : 'secondary'}>
                              {familiar.estado}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {familiar.educandosVinculados.length} educandos vinculados
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {formData.familiarId === familiar.id && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {formData.familiarId > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Familiar seleccionado</span>
                  </div>
                  <div className="mt-2 text-sm">
                    {familiares.find(f => f.id === formData.familiarId)?.nombre}{' '}
                    {familiares.find(f => f.id === formData.familiarId)?.apellidos}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="educandos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Buscar Educando</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filtrar por Sección</Label>
                <Select value={seccionFilter} onValueChange={setSeccionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las secciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las secciones</SelectItem>
                    <SelectItem value="Castores">Castores</SelectItem>
                    <SelectItem value="Manada">Manada</SelectItem>
                    <SelectItem value="Tropa">Tropa</SelectItem>
                    <SelectItem value="Pioneros">Pioneros</SelectItem>
                    <SelectItem value="Rutas">Rutas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingEducandos ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Cargando educandos...</span>
              </div>
            ) : educandosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || seccionFilter ? "No se encontraron educandos con los filtros" : "No hay educandos disponibles"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                {educandosFiltrados.map((scout) => {
                  const yaVinculado = educandosVinculados.includes(scout.id)

                  return (
                    <Card
                      key={scout.id}
                      className={cn(
                        "transition-colors",
                        !yaVinculado && "cursor-pointer hover:bg-green-50",
                        formData.educandoId === scout.id && "ring-2 ring-green-500 bg-green-50",
                        yaVinculado && "opacity-60 cursor-not-allowed bg-gray-50"
                      )}
                      onClick={() => !yaVinculado && handleEducandoSelection(scout.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-base">
                                {scout.nombre} {scout.apellidos}
                              </div>
                              <Badge variant="outline" className="mt-2">
                                {scout.seccion}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              {formData.educandoId === scout.id && !yaVinculado && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            {yaVinculado ? (
                              <div className="space-y-1">
                                <Badge variant="destructive" className="text-xs">
                                  Ya vinculado a este familiar
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  Este educando ya está vinculado al familiar seleccionado
                                </p>
                              </div>
                            ) : (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-300">
                                Disponible para vincular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {formData.educandoId > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Educando seleccionado</span>
                  </div>
                  <div className="mt-2 text-sm">
                    {educandos.find(s => s.id === formData.educandoId)?.nombre}{' '}
                    {educandos.find(s => s.id === formData.educandoId)?.apellidos}
                    <Badge variant="outline" className="ml-2">
                      {educandos.find(s => s.id === formData.educandoId)?.seccion}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opciones de vinculación */}
            {formData.familiarId > 0 && formData.educandoId > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Opciones de vinculación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationType">Tipo de Relación *</Label>
                    <Select
                      value={formData.relationType}
                      onValueChange={(value: any) => handleInputChange('relationType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PADRE">Padre</SelectItem>
                        <SelectItem value="MADRE">Madre</SelectItem>
                        <SelectItem value="TUTOR_LEGAL">Tutor Legal</SelectItem>
                        <SelectItem value="ABUELO">Abuelo/a</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.relationType === 'OTRO' && (
                    <div className="space-y-2">
                      <Label htmlFor="relationDescription">Descripción de la Relación</Label>
                      <Input
                        id="relationDescription"
                        value={formData.relationDescription}
                        onChange={(e) => handleInputChange('relationDescription', e.target.value)}
                        placeholder="Ej: Tío, Hermano mayor, etc."
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esContactoPrincipal"
                      checked={formData.esContactoPrincipal}
                      onCheckedChange={(checked) => handleInputChange('esContactoPrincipal', checked)}
                    />
                    <Label htmlFor="esContactoPrincipal" className="text-sm">
                      Establecer como contacto principal del scout
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enviarNotificacion"
                      checked={formData.enviarNotificacion}
                      onCheckedChange={(checked) => handleInputChange('enviarNotificacion', checked)}
                    />
                    <Label htmlFor="enviarNotificacion" className="text-sm">
                      Enviar notificación por email al familiar
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {renderPreview()}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          {activeTab !== 'familiares' && (
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'educandos' ? 'familiares' : 'educandos')}
              disabled={loading}
            >
              Anterior
            </Button>
          )}
          {activeTab !== 'preview' ? (
            <Button
              onClick={() => setActiveTab(activeTab === 'familiares' ? 'educandos' : 'preview')}
              disabled={loading || (activeTab === 'familiares' && !formData.familiarId) || (activeTab === 'educandos' && !formData.educandoId)}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.familiarId || !formData.educandoId}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Vinculando...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Vincular Educando
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente de botón para vincular scout
export function VincularEducandoButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Link className="h-4 w-4 mr-2" />
        Vincular Educando
      </Button>
      <VincularEducandoModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          console.log('Educando vinculado exitosamente')
        }}
      />
    </>
  )
}