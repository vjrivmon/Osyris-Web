'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  User,
  FileText,
  Heart,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardList,
  HelpCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { EducandoConDocs, CreateEducandoData } from '@/types/educando-scouter'
import { DiagnosticInfo } from '@/hooks/useEducandosScouter'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Secciones disponibles
const SECCIONES = [
  { id: 1, nombre: 'Castores', color: '#FF6B35' },
  { id: 2, nombre: 'Manada', color: '#FFD93D' },
  { id: 3, nombre: 'Tropa', color: '#4A90D9' },
  { id: 4, nombre: 'Pioneros', color: '#E74C3C' },
  { id: 5, nombre: 'Rutas', color: '#2E7D32' },
]

// Definicion de campos por seccion para el contador
const FIELD_SECTIONS = {
  basicos: {
    required: ['nombre', 'apellidos', 'fecha_nacimiento'],
    optional: ['seccion_id', 'genero']
  },
  contacto: {
    required: [],
    optional: ['direccion', 'codigo_postal', 'municipio', 'telefono_casa', 'telefono_movil', 'email']
  },
  documentacion: {
    required: [],
    optional: ['dni', 'pasaporte']
  },
  medico: {
    required: [],
    optional: ['alergias', 'notas_medicas']
  },
  otros: {
    required: [],
    optional: ['notas']
  }
} as const

// Componente de tooltip para campos de formulario
interface FieldTooltipProps {
  content: string
  label?: string
}

function FieldTooltip({ content, label }: FieldTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-1"
          aria-label={label ? `Informacion sobre ${label}` : 'Mas informacion'}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface EducandoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educando: EducandoConDocs | null
  onSubmit: (data: CreateEducandoData) => Promise<boolean>
  seccionId?: number
  diagnosticInfo?: DiagnosticInfo
}

const initialFormData: CreateEducandoData = {
  nombre: '',
  apellidos: '',
  fecha_nacimiento: '',
  seccion_id: 0,
  genero: 'prefiero_no_decir',
  dni: '',
  pasaporte: '',
  direccion: '',
  codigo_postal: '',
  municipio: '',
  telefono_casa: '',
  telefono_movil: '',
  email: '',
  alergias: '',
  notas_medicas: '',
  notas: '',
  autorizacion_imagenes: null
}

export function EducandoFormModal({
  open,
  onOpenChange,
  educando,
  onSubmit,
  seccionId,
  diagnosticInfo
}: EducandoFormModalProps) {
  const [formData, setFormData] = useState<CreateEducandoData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalSeccionId, setOriginalSeccionId] = useState<number | null>(null)

  const isEditing = !!educando
  const seccionCambiada = isEditing && originalSeccionId !== null && formData.seccion_id !== originalSeccionId

  // Determinar si el boton debe estar deshabilitado por falta de seccion
  const cannotSubmitDueToSection = diagnosticInfo && !diagnosticInfo.canSubmit && !isEditing

  // Logging en desarrollo para debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && open) {
      console.log('🔍 [EducandoFormModal] Estado:', {
        isEditing,
        seccionId,
        diagnosticInfo,
        cannotSubmitDueToSection
      })
    }
  }, [open, isEditing, seccionId, diagnosticInfo, cannotSubmitDueToSection])

  // Calcular campos completados por seccion
  const sectionCompletionStatus = useMemo(() => {
    const checkFieldFilled = (field: string) => {
      const value = formData[field as keyof CreateEducandoData]
      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'number') return value !== 0
      if (typeof value === 'boolean') return true // Boolean fields are "filled" when set to true or false
      if (value === null) return false // Null means not specified
      return false
    }

    const calculateSection = (section: keyof typeof FIELD_SECTIONS) => {
      const { required, optional } = FIELD_SECTIONS[section]
      const allFields = [...required, ...optional]
      const filledCount = allFields.filter(checkFieldFilled).length
      const requiredFilled = required.filter(checkFieldFilled).length
      return {
        filled: filledCount,
        total: allFields.length,
        requiredFilled,
        requiredTotal: required.length,
        isComplete: requiredFilled === required.length && filledCount > 0
      }
    }

    return {
      basicos: calculateSection('basicos'),
      contacto: calculateSection('contacto'),
      documentacion: calculateSection('documentacion'),
      medico: calculateSection('medico'),
      otros: calculateSection('otros')
    }
  }, [formData])

  // Calcular total de campos completados
  const totalCompletion = useMemo(() => {
    const allSections = Object.values(sectionCompletionStatus)
    const totalFilled = allSections.reduce((sum, s) => sum + s.filled, 0)
    const totalFields = allSections.reduce((sum, s) => sum + s.total, 0)
    const requiredFilled = allSections.reduce((sum, s) => sum + s.requiredFilled, 0)
    const requiredTotal = allSections.reduce((sum, s) => sum + s.requiredTotal, 0)
    return { totalFilled, totalFields, requiredFilled, requiredTotal }
  }, [sectionCompletionStatus])

  // Populate form when editing
  useEffect(() => {
    if (educando) {
      setFormData({
        nombre: educando.nombre,
        apellidos: educando.apellidos,
        fecha_nacimiento: educando.fecha_nacimiento?.split('T')[0] || '',
        seccion_id: educando.seccion_id,
        genero: educando.genero as CreateEducandoData['genero'],
        dni: educando.dni || '',
        pasaporte: educando.pasaporte || '',
        direccion: educando.direccion || '',
        codigo_postal: educando.codigo_postal || '',
        municipio: educando.municipio || '',
        telefono_casa: educando.telefono_casa || '',
        telefono_movil: educando.telefono_movil || '',
        email: educando.email || '',
        alergias: educando.alergias || '',
        notas_medicas: educando.notas_medicas || '',
        notas: educando.notas || '',
        autorizacion_imagenes: educando.autorizacion_imagenes ?? null
      })
      setOriginalSeccionId(educando.seccion_id)
    } else {
      setFormData({
        ...initialFormData,
        seccion_id: seccionId || 0
      })
      setOriginalSeccionId(null)
    }
    setErrors({})
  }, [educando, seccionId, open])

  const handleChange = (field: keyof CreateEducandoData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios'
    }
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const success = await onSubmit(formData)
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // Componente para mostrar estado de completado de seccion
  const SectionBadge = ({ section }: { section: keyof typeof sectionCompletionStatus }) => {
    const status = sectionCompletionStatus[section]
    if (status.filled === 0) {
      return (
        <Badge variant="outline" className="ml-2 text-xs font-normal text-muted-foreground">
          0/{status.total}
        </Badge>
      )
    }
    if (status.filled === status.total) {
      return (
        <Badge variant="default" className="ml-2 text-xs font-normal bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {status.filled}/{status.total}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="ml-2 text-xs font-normal">
        {status.filled}/{status.total}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Educando' : 'Nuevo Educando'}
            {diagnosticInfo?.sectionName && !isEditing && (
              <Badge variant="secondary" className="ml-2 font-normal">
                <Info className="h-3 w-3 mr-1" />
                {diagnosticInfo.sectionName}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del educando'
              : 'Completa los datos para registrar un nuevo educando'}
          </DialogDescription>
        </DialogHeader>

        {/* Alerta si no puede enviar el formulario por falta de seccion */}
        {cannotSubmitDueToSection && diagnosticInfo?.blockReason && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No se puede crear el educando</AlertTitle>
            <AlertDescription>
              {diagnosticInfo.blockReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Indicador de carga de seccion */}
        {diagnosticInfo?.isLoading && (
          <Alert className="mt-2 border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Cargando informacion de tu seccion...
            </AlertDescription>
          </Alert>
        )}

        {/* Contador de progreso */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-2 text-sm">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Completado:</span>
            <span className="font-medium">
              {totalCompletion.totalFilled} de {totalCompletion.totalFields} campos
            </span>
          </div>
          <div className="flex items-center gap-2">
            {totalCompletion.requiredFilled === totalCompletion.requiredTotal ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Obligatorios completos
              </Badge>
            ) : (
              <Badge variant="destructive">
                <Circle className="h-3 w-3 mr-1" />
                {totalCompletion.requiredFilled}/{totalCompletion.requiredTotal} obligatorios
              </Badge>
            )}
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["basicos"]} className="w-full">
          {/* SECCION: Datos Basicos (siempre visible por defecto) */}
          <AccordionItem value="basicos" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">Datos basicos</span>
                <span className="text-xs text-destructive ml-1">*</span>
                <SectionBadge section="basicos" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">
                      Nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Nombre del educando"
                      className={errors.nombre ? 'border-red-500' : ''}
                    />
                    {errors.nombre && (
                      <p className="text-xs text-red-500">{errors.nombre}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos">
                      Apellidos <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleChange('apellidos', e.target.value)}
                      placeholder="Apellidos del educando"
                      className={errors.apellidos ? 'border-red-500' : ''}
                    />
                    {errors.apellidos && (
                      <p className="text-xs text-red-500">{errors.apellidos}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">
                      Fecha de Nacimiento <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                      className={errors.fecha_nacimiento ? 'border-red-500' : ''}
                    />
                    {errors.fecha_nacimiento && (
                      <p className="text-xs text-red-500">{errors.fecha_nacimiento}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="genero">Genero</Label>
                      <FieldTooltip
                        content="Esta informacion se utiliza para organizar alojamientos en campamentos y actividades"
                        label="Genero"
                      />
                    </div>
                    <Select
                      value={formData.genero}
                      onValueChange={(value) => handleChange('genero', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar genero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selector de Seccion */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="seccion">Seccion</Label>
                    <FieldTooltip
                      content="Grupo al que pertenece el educando segun su edad: Castores (5-7), Manada (7-10), Tropa (10-13), Pioneros (13-16), Rutas (16-19)"
                      label="Seccion"
                    />
                  </div>
                  <Select
                    value={formData.seccion_id.toString()}
                    onValueChange={(value) => handleChange('seccion_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar seccion" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECCIONES.map((seccion) => (
                        <SelectItem key={seccion.id} value={seccion.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: seccion.color }}
                            />
                            {seccion.nombre}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advertencia si cambia la seccion */}
                {seccionCambiada && (
                  <Alert className="border-amber-500 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Al cambiar de seccion, la carpeta de documentos del educando se movera automaticamente a la nueva seccion en Google Drive.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECCION: Contacto */}
          <AccordionItem value="contacto" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium">Contacto y direccion</span>
                <SectionBadge section="contacto" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="direccion">Direccion</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Calle, numero, piso..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo_postal">Codigo Postal</Label>
                    <Input
                      id="codigo_postal"
                      value={formData.codigo_postal}
                      onChange={(e) => handleChange('codigo_postal', e.target.value)}
                      placeholder="46000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio</Label>
                    <Input
                      id="municipio"
                      value={formData.municipio}
                      onChange={(e) => handleChange('municipio', e.target.value)}
                      placeholder="Valencia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono_casa">Telefono Fijo</Label>
                    <Input
                      id="telefono_casa"
                      value={formData.telefono_casa}
                      onChange={(e) => handleChange('telefono_casa', e.target.value)}
                      placeholder="963123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono_movil">Telefono Movil</Label>
                    <Input
                      id="telefono_movil"
                      value={formData.telefono_movil}
                      onChange={(e) => handleChange('telefono_movil', e.target.value)}
                      placeholder="612345678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="educando@email.com"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECCION: Documentacion */}
          <AccordionItem value="documentacion" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-amber-500" />
                <span className="font-medium">Documentacion</span>
                <SectionBadge section="documentacion" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="dni">DNI/NIE</Label>
                      <FieldTooltip
                        content="Documento Nacional de Identidad o Numero de Identificacion de Extranjero del educando"
                        label="DNI/NIE"
                      />
                    </div>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => handleChange('dni', e.target.value)}
                      placeholder="12345678A"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="pasaporte">Pasaporte</Label>
                      <FieldTooltip
                        content="Solo necesario si el educando no tiene DNI espanol. Utilizar el numero de pasaporte vigente"
                        label="Pasaporte"
                      />
                    </div>
                    <Input
                      id="pasaporte"
                      value={formData.pasaporte}
                      onChange={(e) => handleChange('pasaporte', e.target.value)}
                      placeholder="Numero de pasaporte"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECCION: Medico */}
          <AccordionItem value="medico" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span className="font-medium">Informacion medica</span>
                <SectionBadge section="medico" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="alergias">Alergias</Label>
                    <FieldTooltip
                      content="Alergias alimentarias, medicamentosas, ambientales u otras que debamos conocer para la seguridad del educando"
                      label="Alergias"
                    />
                  </div>
                  <Textarea
                    id="alergias"
                    value={formData.alergias}
                    onChange={(e) => handleChange('alergias', e.target.value)}
                    placeholder="Describe las alergias conocidas..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="notas_medicas">Notas Medicas</Label>
                    <FieldTooltip
                      content="Medicacion actual, tratamientos en curso, condiciones cronicas u otra informacion medica importante para los monitores"
                      label="Notas Medicas"
                    />
                  </div>
                  <Textarea
                    id="notas_medicas"
                    value={formData.notas_medicas}
                    onChange={(e) => handleChange('notas_medicas', e.target.value)}
                    placeholder="Informacion medica relevante..."
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECCION: Otros */}
          <AccordionItem value="otros" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">Observaciones</span>
                <SectionBadge section="otros" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="notas">Observaciones Generales</Label>
                    <FieldTooltip
                      content="Cualquier otra informacion relevante sobre el educando que los monitores deban conocer"
                      label="Observaciones Generales"
                    />
                  </div>
                  <Textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => handleChange('notas', e.target.value)}
                    placeholder="Otras observaciones relevantes..."
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          {cannotSubmitDueToSection && diagnosticInfo?.blockReason ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block w-full sm:w-auto">
                    <Button disabled className="pointer-events-none w-full">
                      {isEditing ? 'Guardar Cambios' : 'Crear Educando'}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{diagnosticInfo.blockReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || totalCompletion.requiredFilled < totalCompletion.requiredTotal}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Crear Educando'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
