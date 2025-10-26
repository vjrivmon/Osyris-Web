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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  UserPlus,
  Mail,
  Users,
  Eye,
  Send,
  CheckCircle2,
  Phone,
  User
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

export function InvitarFamiliarModal({ open, onOpenChange, onSuccess }: InvitarFamiliarProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    relationType: 'PADRE' as const,
    educandosSeleccionados: [] as number[],
    mensajePersonalizado: ''
  })

  const [educandos, setEducandos] = useState<Educando[]>([])
  const [loadingEducandos, setLoadingEducandos] = useState(false)
  const [accordionValue, setAccordionValue] = useState<string[]>(['datos'])

  const { loading, invitarFamiliar } = useAdminFamiliares()
  const { toast } = useToast()

  // Cargar educandos
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
      }
    } catch (error) {
      console.error('Error cargando educandos:', error)
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

  const toggleEducando = (educandoId: number) => {
    setFormData(prev => ({
      ...prev,
      educandosSeleccionados: prev.educandosSeleccionados.includes(educandoId)
        ? prev.educandosSeleccionados.filter(id => id !== educandoId)
        : [...prev.educandosSeleccionados, educandoId]
    }))
  }

  const validateForm = () => {
    if (!formData.nombre || !formData.apellidos || !formData.email) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, apellidos y email",
        variant: "destructive"
      })
      return false
    }

    if (!formData.educandosSeleccionados.length) {
      toast({
        title: "Selecciona educandos",
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
        educandosSeleccionados: [],
        mensajePersonalizado: ''
      })
      setAccordionValue(['datos'])
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

  // Agrupar educandos por sección
  const educandosPorSeccion = educandos.reduce((acc, educando) => {
    if (!acc[educando.seccion]) {
      acc[educando.seccion] = []
    }
    acc[educando.seccion].push(educando)
    return acc
  }, {} as Record<string, Educando[]>)

  const educandosSeleccionadosData = educandos.filter(e => formData.educandosSeleccionados.includes(e.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitar Nuevo Familiar
          </DialogTitle>
          <DialogDescription>
            Invita a un familiar a unirse al portal familiar del Grupo Scout Osyris
          </DialogDescription>
        </DialogHeader>

        <Accordion type="multiple" value={accordionValue} onValueChange={setAccordionValue} className="w-full">
          {/* Sección 1: Datos del Familiar */}
          <AccordionItem value="datos">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Datos del Familiar</span>
                {formData.nombre && formData.email && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 ml-2" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Ej: Irene"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange('apellidos', e.target.value)}
                      placeholder="Ej: Medina García"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="ejemplo@gmail.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="666 123 456"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationType">Tipo de Relación *</Label>
                  <Select value={formData.relationType} onValueChange={(value: any) => handleInputChange('relationType', value)}>
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
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sección 2: Vincular Educandos */}
          <AccordionItem value="educandos">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Vincular Educandos</span>
                {formData.educandosSeleccionados.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {formData.educandosSeleccionados.length} seleccionados
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Selecciona los educandos que serán vinculados a este familiar
                </p>

                {loadingEducandos ? (
                  <div className="text-center py-4">Cargando educandos...</div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {Object.entries(educandosPorSeccion).map(([seccion, educandosSeccion]) => (
                      <div key={seccion} className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          {seccion}
                          <Badge variant="outline" className="text-xs">
                            {educandosSeccion.length} educandos
                          </Badge>
                        </h4>
                        <div className="space-y-1 pl-4 border-l-2">
                          {educandosSeccion.map((educando) => (
                            <div
                              key={educando.id}
                              className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                              onClick={() => toggleEducando(educando.id)}
                            >
                              <Checkbox
                                id={`educando-${educando.id}`}
                                checked={formData.educandosSeleccionados.includes(educando.id)}
                                onCheckedChange={() => toggleEducando(educando.id)}
                              />
                              <Label
                                htmlFor={`educando-${educando.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                {educando.nombre} {educando.apellidos}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sección 3: Vista Previa */}
          <AccordionItem value="preview">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Vista previa del email</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                  <div>
                    <strong>Para:</strong> {formData.email || 'ejemplo@gmail.com'}
                  </div>
                  <div>
                    <strong>Asunto:</strong> Bienvenida al Portal de Familias - Grupo Scout Osyris
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <p>¡Estimado/a {formData.nombre || '[Nombre]'} {formData.apellidos || '[Apellidos]'}!</p>
                    <p>Te damos la más cordial bienvenida al Portal de Familias del Grupo Scout Osyris.</p>
                    {educandosSeleccionadosData.length > 0 && (
                      <div>
                        <p className="font-medium">Has sido invitado/a como {getRelationTypeLabel(formData.relationType).toLowerCase()} de:</p>
                        <ul className="list-disc list-inside pl-4">
                          {educandosSeleccionadosData.map(e => (
                            <li key={e.id}>{e.nombre} {e.apellidos} - {e.seccion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-3">
                      <p className="font-medium">Instrucciones para activar tu cuenta:</p>
                      <ol className="list-decimal list-inside pl-4 space-y-1">
                        <li>Recibirás un email con tus credenciales de acceso temporales</li>
                        <li>Entra al portal familiar usando esas credenciales</li>
                        <li>Cambia tu contraseña por una segura y personal</li>
                        <li>Completa tu perfil y comienza a usar el portal</li>
                      </ol>
                    </div>
                    {formData.mensajePersonalizado && (
                      <div className="border-t pt-3 mt-3">
                        <p className="font-medium">Mensaje del administrador:</p>
                        <p className="italic">{formData.mensajePersonalizado}</p>
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs mt-4">
                      Este enlace de activación será válido por 48 horas.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje Personalizado (Opcional)</Label>
                  <Textarea
                    id="mensaje"
                    value={formData.mensajePersonalizado}
                    onChange={(e) => handleInputChange('mensajePersonalizado', e.target.value)}
                    placeholder="Añade un mensaje personalizado que aparecerá en el email..."
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.nombre || !formData.email || formData.educandosSeleccionados.length === 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Invitación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
