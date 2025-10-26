'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
  UserPlus,
  Mail,
  Users,
  Eye,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Phone
} from 'lucide-react'
import { useAdminFamiliares, type InvitacionFamiliar } from '@/hooks/useAdminFamiliares'
import { useToast } from '@/hooks/use-toast'

interface Educando {
  id: number
  nombre: string
  apellidos: string
  seccion: string
  seccion_id: number
}

interface InvitarFamiliarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type RelationType = 'PADRE' | 'MADRE' | 'TUTOR_LEGAL' | 'ABUELO' | 'OTRO'

export function InvitarFamiliarModal({ open, onOpenChange, onSuccess }: InvitarFamiliarProps) {
  const [formData, setFormData] = useState<{
    nombre: string
    apellidos: string
    email: string
    telefono: string
    relationType: RelationType
    relationDescription: string
    mensajePersonalizado: string
    educandosSeleccionados: number[]
    enviarEmailBienvenida: boolean
    enviarInstrucciones: boolean
  }>({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    relationType: 'PADRE',
    relationDescription: '',
    mensajePersonalizado: '',
    educandosSeleccionados: [],
    enviarEmailBienvenida: true,
    enviarInstrucciones: true
  })

  const [educandos, setEducandos] = useState<Educando[]>([])
  const [loadingEducandos, setLoadingEducandos] = useState(false)
  const [previewEmail, setPreviewEmail] = useState('')
  const [activeTab, setActiveTab] = useState('datos')
  const [emailPreviewData, setEmailPreviewData] = useState<any>(null)

  const { loading, invitarFamiliar } = useAdminFamiliares()
  const { toast } = useToast()

  // Cargar educandos disponibles
  useEffect(() => {
    if (open) {
      cargarEducandos()
    }
  }, [open])

  const cargarEducandos = async () => {
    setLoadingEducandos(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
      console.error('Error cargando scouts:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los educandos",
        variant: "destructive"
      })
    } finally {
      setLoadingEducandos(false)
    }
  }

  const generateEmailPreview = () => {
    if (!formData.email || !formData.nombre) {
      setEmailPreviewData(null)
      return
    }

    const educandosSeleccionadosData = educandos.filter(educando =>
      formData.educandosSeleccionados.includes(educando.id)
    )

    setEmailPreviewData({
      to: formData.email,
      subject: "Bienvenida al Portal de Familias - Grupo Scout Osyris",
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      educandos: educandosSeleccionadosData,
      relationType: formData.relationType,
      mensajePersonalizado: formData.mensajePersonalizado,
      incluirInstrucciones: formData.enviarInstrucciones
    })
  }

  useEffect(() => {
    generateEmailPreview()
  }, [formData, educandos])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEducandoSelection = (educandoId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      educandosSeleccionados: checked
        ? [...prev.educandosSeleccionados, educandoId]
        : prev.educandosSeleccionados.filter(id => id !== educandoId)
    }))
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre es obligatorio",
        variant: "destructive"
      })
      return false
    }

    if (!formData.apellidos.trim()) {
      toast({
        title: "Error de validación",
        description: "Los apellidos son obligatorios",
        variant: "destructive"
      })
      return false
    }

    if (!formData.email.trim()) {
      toast({
        title: "Error de validación",
        description: "El email es obligatorio",
        variant: "destructive"
      })
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Error de validación",
        description: "El email no tiene un formato válido",
        variant: "destructive"
      })
      return false
    }

    if (formData.educandosSeleccionados.length === 0) {
      toast({
        title: "Error de validación",
        description: "Debes seleccionar al menos un educando para vincular",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const invitacion: InvitacionFamiliar = {
      email: formData.email,
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      telefono: formData.telefono || undefined,
      educandosIds: formData.educandosSeleccionados,
      relationType: formData.relationType,
      relationDescription: formData.relationDescription || undefined,
      mensajePersonalizado: formData.mensajePersonalizado || undefined
    }

    const success = await invitarFamiliar(invitacion)

    if (success) {
      // Resetear formulario
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        relationType: 'PADRE',
        relationDescription: '',
        mensajePersonalizado: '',
        educandosSeleccionados: [],
        enviarEmailBienvenida: true,
        enviarInstrucciones: true
      })
      setActiveTab('datos')
      setEmailPreviewData(null)

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

  const renderEmailPreview = () => {
    if (!emailPreviewData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista previa del email
          </CardTitle>
          <CardDescription>
            Así se verá el email que recibirá el familiar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Para:</Label>
              <p className="text-sm text-muted-foreground">{emailPreviewData.to}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Asunto:</Label>
              <p className="text-sm">{emailPreviewData.subject}</p>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">¡Estimado/a {emailPreviewData.nombre} {emailPreviewData.apellidos}!</h3>
                </div>

                <p>
                  Te damos la más cordial bienvenida al Portal de Familias del Grupo Scout Osyris.
                </p>

                {emailPreviewData.relationType && (
                  <p>
                    Has sido invitado/a como {getRelationTypeLabel(emailPreviewData.relationType).toLowerCase()} de:
                  </p>
                )}

                {emailPreviewData.educandos.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {emailPreviewData.educandos.map((educando: Educando) => (
                      <li key={educando.id}>
                        <strong>{educando.nombre} {educando.apellidos}</strong> - {educando.seccion}
                      </li>
                    ))}
                  </ul>
                )}

                {emailPreviewData.mensajePersonalizado && (
                  <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
                    <p className="text-sm">{emailPreviewData.mensajePersonalizado}</p>
                  </div>
                )}

                {emailPreviewData.incluirInstrucciones && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Instrucciones para activar tu cuenta:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Recibirás un email con tus credenciales de acceso temporales</li>
                      <li>Entra al portal familiar usando esas credenciales</li>
                      <li>Cambia tu contraseña por una segura y personal</li>
                      <li>Completa tu perfil y comienza a usar el portal</li>
                    </ol>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="font-medium">¿Qué puedes hacer en el portal?</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Ver el calendario de actividades de tus educandos</li>
                    <li>Recibir comunicaciones importantes del grupo</li>
                    <li>Subir y gestionar documentos necesarios</li>
                    <li>Ver fotos y eventos del grupo</li>
                    <li>Mantener contacto con los monitores</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Si tienes alguna duda o problema, no dudes en contactar con nosotros.
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Grupo Scout Osyris - contacto@osyris.es
                  </p>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>Este enlace de activación será válido por 48 horas</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitar Nuevo Familiar
          </DialogTitle>
          <DialogDescription>
            Invita a un familiar a unirse al portal familiar del Grupo Scout Osyris
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datos">Datos del Familiar</TabsTrigger>
            <TabsTrigger value="educandos">Vincular Educandos</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="datos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre del familiar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  placeholder="Apellidos del familiar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+34 600 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationType">Tipo de Relación *</Label>
                <Select
                  value={formData.relationType}
                  onValueChange={(value) => handleInputChange('relationType', value)}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensajePersonalizado">Mensaje Personalizado (Opcional)</Label>
              <Textarea
                id="mensajePersonalizado"
                value={formData.mensajePersonalizado}
                onChange={(e) => handleInputChange('mensajePersonalizado', e.target.value)}
                placeholder="Añade un mensaje personal para el familiar..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviarEmailBienvenida"
                checked={formData.enviarEmailBienvenida}
                onCheckedChange={(checked) => handleInputChange('enviarEmailBienvenida', checked)}
              />
              <Label htmlFor="enviarEmailBienvenida" className="text-sm">
                Enviar email de bienvenida con instrucciones
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviarInstrucciones"
                checked={formData.enviarInstrucciones}
                onCheckedChange={(checked) => handleInputChange('enviarInstrucciones', checked)}
              />
              <Label htmlFor="enviarInstrucciones" className="text-sm">
                Incluir instrucciones detalladas de uso
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="educandos" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Info className="h-4 w-4" />
              Selecciona los educandos que serán vinculados a este familiar
            </div>

            {loadingEducandos ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Cargando educandos...</span>
              </div>
            ) : educandos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay educandos disponibles para vincular</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {['Castores', 'Manada', 'Tropa', 'Pioneros', 'Rutas'].map((seccion) => {
                  const educandosSeccion = educandos.filter(educando => educando.seccion === seccion)
                  if (educandosSeccion.length === 0) return null

                  return (
                    <Card key={seccion}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{seccion}</CardTitle>
                        <CardDescription>
                          {educandosSeccion.length} {educandosSeccion.length === 1 ? 'educando' : 'educandos'} disponibles
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {educandosSeccion.map((educando) => (
                          <div key={educando.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`educando-${educando.id}`}
                              checked={formData.educandosSeleccionados.includes(educando.id)}
                              onCheckedChange={(checked) => handleEducandoSelection(educando.id, checked as boolean)}
                            />
                            <Label
                              htmlFor={`educando-${educando.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">{educando.nombre} {educando.apellidos}</div>
                              <div className="text-sm text-muted-foreground">{educando.seccion}</div>
                            </Label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {formData.educandosSeleccionados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Educandos Seleccionados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {educandos
                      .filter(educando => formData.educandosSeleccionados.includes(educando.id))
                      .map((educando) => (
                        <div key={educando.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{educando.nombre} {educando.apellidos}</span>
                          <Badge variant="outline">{educando.seccion}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {renderEmailPreview()}
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
          {activeTab !== 'datos' && (
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'scouts' ? 'datos' : 'scouts')}
              disabled={loading}
            >
              Anterior
            </Button>
          )}
          {activeTab !== 'preview' ? (
            <Button
              onClick={() => setActiveTab(activeTab === 'datos' ? 'scouts' : 'preview')}
              disabled={loading || (activeTab === 'datos' && (!formData.nombre || !formData.apellidos || !formData.email))}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || formData.educandosSeleccionados.length === 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando invitación...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente de botón para invitar familiar
export function InvitarFamiliarButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Invitar Familiar
      </Button>
      <InvitarFamiliarModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          // Aquí podríamos recargar la lista de familiares
          console.log('Familiar invitado exitosamente')
        }}
      />
    </>
  )
}