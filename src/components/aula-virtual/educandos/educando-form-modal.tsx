'use client'

import { useState, useEffect } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, User, FileText, Heart, MapPin, AlertTriangle } from 'lucide-react'
import { EducandoConDocs, CreateEducandoData } from '@/types/educando-scouter'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Secciones disponibles
const SECCIONES = [
  { id: 1, nombre: 'Castores', color: '#FF6B35' },
  { id: 2, nombre: 'Manada', color: '#FFD93D' },
  { id: 3, nombre: 'Tropa', color: '#4A90D9' },
  { id: 4, nombre: 'Pioneros', color: '#E74C3C' },
  { id: 5, nombre: 'Rutas', color: '#2E7D32' },
]

interface EducandoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educando: EducandoConDocs | null
  onSubmit: (data: CreateEducandoData) => Promise<boolean>
  seccionId?: number
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
  notas: ''
}

export function EducandoFormModal({
  open,
  onOpenChange,
  educando,
  onSubmit,
  seccionId
}: EducandoFormModalProps) {
  const [formData, setFormData] = useState<CreateEducandoData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalSeccionId, setOriginalSeccionId] = useState<number | null>(null)

  const isEditing = !!educando
  const seccionCambiada = isEditing && originalSeccionId !== null && formData.seccion_id !== originalSeccionId

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
        notas: educando.notas || ''
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

  const handleChange = (field: keyof CreateEducandoData, value: string | number) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Educando' : 'Nuevo Educando'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del educando'
              : 'Completa los datos para registrar un nuevo educando'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basicos" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basicos" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Basicos</span>
            </TabsTrigger>
            <TabsTrigger value="identificacion" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">ID</span>
            </TabsTrigger>
            <TabsTrigger value="contacto" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Contacto</span>
            </TabsTrigger>
            <TabsTrigger value="salud" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Salud</span>
            </TabsTrigger>
          </TabsList>

          {/* Datos Basicos */}
          <TabsContent value="basicos" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
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
                <Label htmlFor="apellidos">Apellidos *</Label>
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
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
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
                <Label htmlFor="genero">Genero</Label>
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
              <Label htmlFor="seccion">Seccion</Label>
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
          </TabsContent>

          {/* Identificacion */}
          <TabsContent value="identificacion" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI/NIE</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleChange('dni', e.target.value)}
                  placeholder="12345678A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasaporte">Pasaporte</Label>
                <Input
                  id="pasaporte"
                  value={formData.pasaporte}
                  onChange={(e) => handleChange('pasaporte', e.target.value)}
                  placeholder="Numero de pasaporte"
                />
              </div>
            </div>
          </TabsContent>

          {/* Contacto */}
          <TabsContent value="contacto" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* Salud */}
          <TabsContent value="salud" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                value={formData.alergias}
                onChange={(e) => handleChange('alergias', e.target.value)}
                placeholder="Describe las alergias conocidas..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas_medicas">Notas Medicas</Label>
              <Textarea
                id="notas_medicas"
                value={formData.notas_medicas}
                onChange={(e) => handleChange('notas_medicas', e.target.value)}
                placeholder="Informacion medica relevante..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Observaciones Generales</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                placeholder="Otras observaciones..."
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Crear Educando'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
