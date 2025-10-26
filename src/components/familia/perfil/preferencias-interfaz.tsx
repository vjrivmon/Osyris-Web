"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  EyeOff,
  Palette,
  Type,
  Volume2,
  Bell,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Languages,
  Calendar,
  Clock,
  Accessibility,
  Zap
} from "lucide-react"

interface Preferencias {
  tema: 'claro' | 'oscuro' | 'auto'
  idioma: 'es' | 'va'
  tamano_letra: 'pequena' | 'mediana' | 'grande' | 'extra_grande'
  contraste: 'normal' | 'alto' | 'maximo'
  animaciones: 'activadas' | 'reducidas' | 'desactivadas'
  densidad: 'compacta' | 'normal' | 'espaciada'
  formato_fecha: 'DD/MM/YYYY' | 'MM/DD/YYYY'
  formato_hora: '24h' | '12h'
  notificaciones_email: 'todas' | 'importantes' | 'ninguna'
  notificaciones_push: boolean
}

interface PreferenciasInterfazProps {
  preferencias: Preferencias
  onSave: (preferencias: Partial<Preferencias>) => Promise<void>
  isLoading: boolean
}

const opcionesTamanoLetra = [
  { value: 'pequena', label: 'Pequeña', tamaño: '14px' },
  { value: 'mediana', label: 'Mediana', tamaño: '16px' },
  { value: 'grande', label: 'Grande', tamaño: '18px' },
  { value: 'extra_grande', label: 'Extra Grande', tamaño: '20px' }
]

const opcionesContraste = [
  { value: 'normal', label: 'Normal', descripcion: 'Contraste estándar' },
  { value: 'alto', label: 'Alto', descripcion: 'Mejor legibilidad' },
  { value: 'maximo', label: 'Máximo', descripcion: 'Máxima accesibilidad' }
]

const opcionesAnimaciones = [
  { value: 'activadas', label: 'Activadas', icon: Zap },
  { value: 'reducidas', label: 'Reducidas', icon: Zap },
  { value: 'desactivadas', label: 'Desactivadas', icon: Eye }
]

const opcionesDensidad = [
  { value: 'compacta', label: 'Compacta', descripcion: 'Más información en menos espacio' },
  { value: 'normal', label: 'Normal', descripcion: 'Equilibrio perfecto' },
  { value: 'espaciada', label: 'Espaciada', descripcion: 'Más espacio entre elementos' }
]

const opcionesNotificacionesEmail = [
  { value: 'todas', label: 'Todas', descripcion: 'Recibir todas las comunicaciones' },
  { value: 'importantes', label: 'Solo importantes', descripcion: 'Solo comunicaciones críticas' },
  { value: 'ninguna', label: 'Ninguna', descripcion: 'No recibir emails' }
]

export function PreferenciasInterfaz({ preferencias, onSave, isLoading }: PreferenciasInterfazProps) {
  const [datosPreferencias, setDatosPreferencias] = useState<Preferencias>(preferencias)
  const [guardado, setGuardado] = useState(false)
  const [vistaPreviaActiva, setVistaPreviaActiva] = useState(false)

  const handleGuardar = async () => {
    try {
      await onSave(datosPreferencias)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (error) {
      console.error("Error al guardar preferencias:", error)
    }
  }

  const handleCambiarPreferencia = (clave: keyof Preferencias, valor: any) => {
    setDatosPreferencias(prev => ({ ...prev, [clave]: valor }))
  }

  const restablecerPorDefecto = () => {
    setDatosPreferencias({
      tema: 'auto',
      idioma: 'es',
      tamano_letra: 'mediana',
      contraste: 'normal',
      animaciones: 'activadas',
      densidad: 'normal',
      formato_fecha: 'DD/MM/YYYY',
      formato_hora: '24h',
      notificaciones_email: 'importantes',
      notificaciones_push: true
    })
  }

  const getClaseTema = () => {
    switch (datosPreferencias.tema) {
      case 'oscuro': return 'bg-gray-900 text-white'
      case 'claro': return 'bg-white text-gray-900 border border-gray-200'
      default: return 'bg-gradient-to-br from-white to-gray-100 text-gray-900'
    }
  }

  const getClaseContraste = () => {
    switch (datosPreferencias.contraste) {
      case 'maximo': return 'contrast-[1.5]'
      case 'alto': return 'contrast-[1.2]'
      default: return 'contrast-100'
    }
  }

  const getClaseTamanoLetra = () => {
    const tamanos = {
      pequena: 'text-sm',
      mediana: 'text-base',
      grande: 'text-lg',
      extra_grande: 'text-xl'
    }
    return tamanos[datosPreferencias.tamano_letra]
  }

  return (
    <div className="space-y-6">
      {/* Alerta de estado */}
      {guardado && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✅ Tus preferencias han sido guardadas correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Vista previa */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Configuración de Preferencias</h3>
          <p className="text-sm text-gray-600">Personaliza tu experiencia en la plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVistaPreviaActiva(!vistaPreviaActiva)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {vistaPreviaActiva ? 'Ocultar' : 'Ver'} Vista Previa
          </Button>
          <Button variant="outline" size="sm" onClick={restablecerPorDefecto}>
            Restablecer por Defecto
          </Button>
        </div>
      </div>

      {/* Vista previa */}
      {vistaPreviaActiva && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Vista Previa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-6 rounded-lg ${getClaseTema()} ${getClaseContraste()}`}
                 style={{ fontSize: opcionesTamanoLetra.find(t => t.value === datosPreferencias.tamano_letra)?.tamaño }}>
              <h4 className="font-bold mb-2">Ejemplo de Contenido</h4>
              <p className="mb-3">
                Este es un ejemplo de cómo se verá el contenido con tus preferencias actuales.
              </p>
              <div className="flex space-x-2">
                <Button size="sm">Botón Primario</Button>
                <Button size="sm" variant="outline">Botón Secundario</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza el aspecto visual de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tema */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tema Visual</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={datosPreferencias.tema === 'claro' ? 'default' : 'outline'}
                  className="flex flex-col items-center space-y-2 h-20"
                  onClick={() => handleCambiarPreferencia('tema', 'claro')}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Claro</span>
                </Button>
                <Button
                  variant={datosPreferencias.tema === 'oscuro' ? 'default' : 'outline'}
                  className="flex flex-col items-center space-y-2 h-20"
                  onClick={() => handleCambiarPreferencia('tema', 'oscuro')}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Oscuro</span>
                </Button>
                <Button
                  variant={datosPreferencias.tema === 'auto' ? 'default' : 'outline'}
                  className="flex flex-col items-center space-y-2 h-20"
                  onClick={() => handleCambiarPreferencia('tema', 'auto')}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">Automático</span>
                </Button>
              </div>
            </div>

            {/* Tamaño de letra */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tamaño de Letra</Label>
              <Select
                value={datosPreferencias.tamano_letra}
                onValueChange={(value: Preferencias['tamano_letra']) => handleCambiarPreferencia('tamano_letra', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcionesTamanoLetra.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{opcion.label}</span>
                        <span style={{ fontSize: opcion.tamaño }} className="ml-2 text-gray-500">
                          Aa
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contraste */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Contraste</Label>
              <div className="space-y-2">
                {opcionesContraste.map((opcion) => (
                  <div key={opcion.value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => handleCambiarPreferencia('contraste', opcion.value)}>
                    <div>
                      <p className="font-medium">{opcion.label}</p>
                      <p className="text-sm text-gray-500">{opcion.descripcion}</p>
                    </div>
                    {datosPreferencias.contraste === opcion.value && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Animaciones */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Animaciones</Label>
              <div className="grid grid-cols-3 gap-3">
                {opcionesAnimaciones.map((opcion) => {
                  const Icon = opcion.icon
                  return (
                    <Button
                      key={opcion.value}
                      variant={datosPreferencias.animaciones === opcion.value ? 'default' : 'outline'}
                      className="flex flex-col items-center space-y-2 h-20"
                      onClick={() => handleCambiarPreferencia('animaciones', opcion.value)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{opcion.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accesibilidad y Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Accessibility className="h-5 w-5 mr-2" />
              Accesibilidad y Layout
            </CardTitle>
            <CardDescription>
              Configura la accesibilidad y distribución de elementos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Densidad */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Densidad de Información</Label>
              <div className="space-y-2">
                {opcionesDensidad.map((opcion) => (
                  <div key={opcion.value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => handleCambiarPreferencia('densidad', opcion.value)}>
                    <div>
                      <p className="font-medium">{opcion.label}</p>
                      <p className="text-sm text-gray-500">{opcion.descripcion}</p>
                    </div>
                    {datosPreferencias.densidad === opcion.value && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Configuración regional */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Configuración Regional</Label>

              {/* Idioma */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Languages className="h-4 w-4 mr-2" />
                  Idioma
                </Label>
                <Select
                  value={datosPreferencias.idioma}
                  onValueChange={(value: Preferencias['idioma']) => handleCambiarPreferencia('idioma', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="va">Valencià</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Formato de fecha */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Formato de Fecha
                </Label>
                <Select
                  value={datosPreferencias.formato_fecha}
                  onValueChange={(value: Preferencias['formato_fecha']) => handleCambiarPreferencia('formato_fecha', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (24/10/2025)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (10/24/2025)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Formato de hora */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Formato de Hora
                </Label>
                <Select
                  value={datosPreferencias.formato_hora}
                  onValueChange={(value: Preferencias['formato_hora']) => handleCambiarPreferencia('formato_hora', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas (14:30)</SelectItem>
                    <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo quieres recibir las comunicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notificaciones Email */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <Label className="font-medium">Notificaciones por Email</Label>
                </div>
                <div className="space-y-2">
                  {opcionesNotificacionesEmail.map((opcion) => (
                    <div key={opcion.value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                         onClick={() => handleCambiarPreferencia('notificaciones_email', opcion.value)}>
                      <div>
                        <p className="font-medium">{opcion.label}</p>
                        <p className="text-sm text-gray-500">{opcion.descripcion}</p>
                      </div>
                      {datosPreferencias.notificaciones_email === opcion.value && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notificaciones Push */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <Label className="font-medium">Notificaciones Push</Label>
                  </div>
                  <Switch
                    checked={datosPreferencias.notificaciones_push}
                    onCheckedChange={(checked) => handleCambiarPreferencia('notificaciones_push', checked)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones instantáneas en tu dispositivo móvil
                </p>
                {datosPreferencias.notificaciones_push && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✅ Las notificaciones push están activadas. Recibirás alertas importantes en tiempo real.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={restablecerPorDefecto} disabled={isLoading}>
          Restablecer Valores
        </Button>
        <Button onClick={handleGuardar} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              Guardar Preferencias
            </>
          )}
        </Button>
      </div>
    </div>
  )
}