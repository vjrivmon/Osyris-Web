'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useEducandos } from '@/hooks/useEducandos'
import { useToast } from '@/hooks/use-toast'

export default function EditEducandoPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { loading, fetchEducandoById, updateEducando } = useEducandos()

  const educandoId = params.id as string

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    genero: 'prefiero_no_decir',
    fecha_nacimiento: '',
    dni: '',
    pasaporte: '',
    direccion: '',
    codigo_postal: '',
    municipio: '',
    telefono_casa: '',
    telefono_movil: '',
    email: '',
    seccion_id: '',
    alergias: '',
    notas_medicas: '',
    notas: '',
    activo: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos del educando
  useEffect(() => {
    const loadEducando = async () => {
      try {
        setIsLoading(true)
        const educando = await fetchEducandoById(parseInt(educandoId))

        if (educando) {
          // Formatear fecha para input type="date"
          const fechaNac = educando.fecha_nacimiento
            ? new Date(educando.fecha_nacimiento).toISOString().split('T')[0]
            : ''

          setFormData({
            nombre: educando.nombre || '',
            apellidos: educando.apellidos || '',
            genero: educando.genero || 'prefiero_no_decir',
            fecha_nacimiento: fechaNac,
            dni: educando.dni || '',
            pasaporte: educando.pasaporte || '',
            direccion: educando.direccion || '',
            codigo_postal: educando.codigo_postal || '',
            municipio: educando.municipio || '',
            telefono_casa: educando.telefono_casa || '',
            telefono_movil: educando.telefono_movil || '',
            email: educando.email || '',
            seccion_id: educando.seccion_id?.toString() || '',
            alergias: educando.alergias || '',
            notas_medicas: educando.notas_medicas || '',
            notas: educando.notas || '',
            activo: educando.activo !== false
          })
        } else {
          toast({
            title: 'Error',
            description: 'No se encontró el educando',
            variant: 'destructive'
          })
          router.push('/admin/educandos')
        }
      } catch (error) {
        console.error('Error al cargar educando:', error)
        toast({
          title: 'Error',
          description: 'No se pudo cargar el educando',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEducando()
  }, [educandoId])

  // Manejar cambios en inputs
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo al editar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validar formulario
  const validateForm = () => {
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
    if (!formData.seccion_id) {
      newErrors.seccion_id = 'Debes seleccionar una sección'
    }

    // Validar fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const fechaNac = new Date(formData.fecha_nacimiento)
      const hoy = new Date()
      if (fechaNac > hoy) {
        newErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
      }
    }

    // Validar email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Validar DNI
    if (formData.dni && !/^\d{8}[A-Za-z]$/.test(formData.dni.replace(/\s/g, ''))) {
      newErrors.dni = 'El DNI debe tener 8 dígitos y una letra'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: 'Errores en el formulario',
        description: 'Por favor, corrige los errores antes de continuar',
        variant: 'destructive'
      })
      return
    }

    try {
      const educandoData = {
        ...formData,
        seccion_id: parseInt(formData.seccion_id),
        genero: formData.genero as 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir',
        dni: formData.dni || null,
        pasaporte: formData.pasaporte || null,
        direccion: formData.direccion || null,
        codigo_postal: formData.codigo_postal || null,
        municipio: formData.municipio || null,
        telefono_casa: formData.telefono_casa || null,
        telefono_movil: formData.telefono_movil || null,
        email: formData.email || null,
        alergias: formData.alergias || null,
        notas_medicas: formData.notas_medicas || null,
        notas: formData.notas || null
      }

      await updateEducando(parseInt(educandoId), educandoData)

      toast({
        title: 'Educando actualizado',
        description: `Los datos de ${formData.nombre} ${formData.apellidos} han sido actualizados`,
      })

      router.push('/admin/educandos')
    } catch (error) {
      console.error('Error al actualizar educando:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el educando. Inténtalo de nuevo.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando educando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Educando
          </h1>
          <p className="text-muted-foreground">
            Actualiza la información de {formData.nombre} {formData.apellidos}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/educandos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Personales */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
            <CardDescription>Información básica del educando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Juan"
                  className={errors.nombre ? 'border-red-500' : ''}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-500">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">
                  Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleChange('apellidos', e.target.value)}
                  placeholder="Ej: García López"
                  className={errors.apellidos ? 'border-red-500' : ''}
                />
                {errors.apellidos && (
                  <p className="text-sm text-red-500">{errors.apellidos}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) => handleChange('genero', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                  className={errors.fecha_nacimiento ? 'border-red-500' : ''}
                />
                {errors.fecha_nacimiento && (
                  <p className="text-sm text-red-500">{errors.fecha_nacimiento}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleChange('dni', e.target.value.toUpperCase())}
                  placeholder="12345678A"
                  maxLength={9}
                  className={errors.dni ? 'border-red-500' : ''}
                />
                {errors.dni && (
                  <p className="text-sm text-red-500">{errors.dni}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasaporte">Pasaporte</Label>
                <Input
                  id="pasaporte"
                  value={formData.pasaporte}
                  onChange={(e) => handleChange('pasaporte', e.target.value.toUpperCase())}
                  placeholder="AAA123456"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección */}
        <Card>
          <CardHeader>
            <CardTitle>Sección Scout</CardTitle>
            <CardDescription>Asigna el educando a una sección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="seccion_id">
                Sección <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.seccion_id}
                onValueChange={(value) => handleChange('seccion_id', value)}
              >
                <SelectTrigger className={errors.seccion_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Castores (5-7 años)</SelectItem>
                  <SelectItem value="2">Lobatos (7-10 años)</SelectItem>
                  <SelectItem value="3">Tropa (10-13 años)</SelectItem>
                  <SelectItem value="4">Pioneros (13-16 años)</SelectItem>
                  <SelectItem value="5">Rutas (16-19 años)</SelectItem>
                </SelectContent>
              </Select>
              {errors.seccion_id && (
                <p className="text-sm text-red-500">{errors.seccion_id}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dirección y Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección y Contacto</CardTitle>
            <CardDescription>Información de contacto del educando</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Calle, número, piso, puerta..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo_postal">Código Postal</Label>
                <Input
                  id="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={(e) => handleChange('codigo_postal', e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipio">Municipio</Label>
                <Input
                  id="municipio"
                  value={formData.municipio}
                  onChange={(e) => handleChange('municipio', e.target.value)}
                  placeholder="Ciudad/Pueblo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_casa">Teléfono Fijo</Label>
                <Input
                  id="telefono_casa"
                  type="tel"
                  value={formData.telefono_casa}
                  onChange={(e) => handleChange('telefono_casa', e.target.value)}
                  placeholder="961234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_movil">Teléfono Móvil</Label>
                <Input
                  id="telefono_movil"
                  type="tel"
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
                placeholder="educando@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Médica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Médica</CardTitle>
            <CardDescription>Alergias y notas médicas importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                value={formData.alergias}
                onChange={(e) => handleChange('alergias', e.target.value)}
                placeholder="Especifica cualquier alergia o intolerancia alimentaria..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas_medicas">Notas Médicas</Label>
              <Textarea
                id="notas_medicas"
                value={formData.notas_medicas}
                onChange={(e) => handleChange('notas_medicas', e.target.value)}
                placeholder="Medicación habitual, condiciones médicas, etc..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notas Generales */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
            <CardDescription>Información adicional relevante</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                placeholder="Cualquier información adicional relevante..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/educandos')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
