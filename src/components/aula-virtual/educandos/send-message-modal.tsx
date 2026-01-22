'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mail,
  Send,
  Loader2,
  Users,
  User,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getApiUrl } from '@/lib/api-utils'
import { EducandoConDocs } from '@/types/educando-scouter'

interface SendMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educandos: EducandoConDocs[]
  preselectedEducandoIds?: number[]
  onSuccess?: () => void
}

type DestinatarioTipo = 'seccion' | 'seleccionados' | 'individual'
type Prioridad = 'alta' | 'normal' | 'baja'

export function SendMessageModal({
  open,
  onOpenChange,
  educandos,
  preselectedEducandoIds = [],
  onSuccess
}: SendMessageModalProps) {
  const { token } = useAuth()

  // Estados del formulario
  const [destinatarioTipo, setDestinatarioTipo] = useState<DestinatarioTipo>('seccion')
  const [educandosSeleccionados, setEducandosSeleccionados] = useState<number[]>([])
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('normal')

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Inicializar educandos preseleccionados
  useEffect(() => {
    if (preselectedEducandoIds.length > 0) {
      setEducandosSeleccionados(preselectedEducandoIds)
      setDestinatarioTipo(preselectedEducandoIds.length === 1 ? 'individual' : 'seleccionados')
    }
  }, [preselectedEducandoIds])

  // Reset al abrir/cerrar
  useEffect(() => {
    if (open) {
      setError(null)
      setSuccess(null)
    } else {
      // Reset completo al cerrar
      setAsunto('')
      setMensaje('')
      setPrioridad('normal')
      setDestinatarioTipo('seccion')
      setEducandosSeleccionados([])
      setError(null)
      setSuccess(null)
    }
  }, [open])

  // Filtrar educandos con familia vinculada
  const educandosConFamilia = educandos.filter(e => e.tiene_familia_vinculada)

  // Toggle seleccion de educando
  const toggleEducando = (educandoId: number) => {
    setEducandosSeleccionados(prev =>
      prev.includes(educandoId)
        ? prev.filter(id => id !== educandoId)
        : [...prev, educandoId]
    )
  }

  // Seleccionar todos
  const seleccionarTodos = () => {
    const todosIds = educandosConFamilia.map(e => e.id)
    setEducandosSeleccionados(
      educandosSeleccionados.length === todosIds.length ? [] : todosIds
    )
  }

  // Validacion del formulario
  const validarFormulario = (): string | null => {
    if (!asunto.trim()) {
      return 'El asunto es requerido'
    }
    if (asunto.length < 3) {
      return 'El asunto debe tener al menos 3 caracteres'
    }
    if (!mensaje.trim()) {
      return 'El mensaje es requerido'
    }
    if (mensaje.length < 10) {
      return 'El mensaje debe tener al menos 10 caracteres'
    }
    if (destinatarioTipo !== 'seccion' && educandosSeleccionados.length === 0) {
      return 'Debes seleccionar al menos un educando'
    }
    return null
  }

  // Enviar mensaje
  const handleEnviar = async () => {
    const validationError = validarFormulario()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const apiUrl = getApiUrl()
      let endpoint: string
      let body: object

      switch (destinatarioTipo) {
        case 'seccion':
          endpoint = `${apiUrl}/api/mensajes-scouter/seccion`
          body = { asunto, mensaje, prioridad }
          break
        case 'individual':
          endpoint = `${apiUrl}/api/mensajes-scouter/educando`
          body = { educando_id: educandosSeleccionados[0], asunto, mensaje, prioridad }
          break
        case 'seleccionados':
          endpoint = `${apiUrl}/api/mensajes-scouter/educandos`
          body = { educando_ids: educandosSeleccionados, asunto, mensaje, prioridad }
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al enviar el mensaje')
      }

      setSuccess(result.message || `Mensaje enviado a ${result.data?.enviados || 0} familias`)

      // Llamar callback de exito
      if (onSuccess) {
        onSuccess()
      }

      // Cerrar modal despues de 2 segundos
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)

    } catch (err) {
      console.error('Error enviando mensaje:', err)
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  const seccionNombre = educandos.length > 0 && educandos[0].seccion_nombre
    ? educandos[0].seccion_nombre
    : 'tu seccion'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enviar Mensaje a Familias
          </DialogTitle>
          <DialogDescription>
            Envia un mensaje a las familias de los educandos de {seccionNombre}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Alertas de error/exito */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Tipo de destinatario */}
          <div className="space-y-3">
            <Label>Enviar a:</Label>
            <RadioGroup
              value={destinatarioTipo}
              onValueChange={(value) => setDestinatarioTipo(value as DestinatarioTipo)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="seccion" id="seccion" />
                <Label htmlFor="seccion" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Toda la seccion</p>
                    <p className="text-xs text-muted-foreground">
                      {educandosConFamilia.length} familias
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="seleccionados" id="seleccionados" />
                <Label htmlFor="seleccionados" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Users className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Seleccionados</p>
                    <p className="text-xs text-muted-foreground">
                      Elige educandos
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer flex-1">
                  <User className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Individual</p>
                    <p className="text-xs text-muted-foreground">
                      Un educando
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Selector de educandos (para seleccionados/individual) */}
          {destinatarioTipo !== 'seccion' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  {destinatarioTipo === 'individual' ? 'Selecciona un educando:' : 'Selecciona educandos:'}
                </Label>
                {destinatarioTipo === 'seleccionados' && (
                  <Button variant="outline" size="sm" onClick={seleccionarTodos}>
                    {educandosSeleccionados.length === educandosConFamilia.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </Button>
                )}
              </div>

              {educandosConFamilia.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay educandos con familias vinculadas en esta seccion
                  </AlertDescription>
                </Alert>
              ) : destinatarioTipo === 'individual' ? (
                <Select
                  value={educandosSeleccionados[0]?.toString() || ''}
                  onValueChange={(value) => setEducandosSeleccionados([parseInt(value)])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un educando" />
                  </SelectTrigger>
                  <SelectContent>
                    {educandosConFamilia.map((educando) => (
                      <SelectItem key={educando.id} value={educando.id.toString()}>
                        {educando.nombre} {educando.apellidos}
                        <span className="text-muted-foreground ml-2">
                          ({educando.familiares_count} familiares)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <ScrollArea className="h-48 border rounded-lg p-2">
                  <div className="space-y-2">
                    {educandosConFamilia.map((educando) => (
                      <div
                        key={educando.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleEducando(educando.id)}
                      >
                        <Checkbox
                          checked={educandosSeleccionados.includes(educando.id)}
                          onCheckedChange={() => toggleEducando(educando.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {educando.nombre} {educando.apellidos}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {educando.familiares_count} familiares vinculados
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {destinatarioTipo === 'seleccionados' && educandosSeleccionados.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {educandosSeleccionados.map((id) => {
                    const educando = educandos.find(e => e.id === id)
                    return educando ? (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {educando.nombre} {educando.apellidos}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => toggleEducando(id)}
                        />
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          )}

          {/* Asunto */}
          <div className="space-y-2">
            <Label htmlFor="asunto">Asunto *</Label>
            <Input
              id="asunto"
              placeholder="Escribe el asunto del mensaje..."
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              maxLength={255}
              disabled={loading || !!success}
            />
            <p className="text-xs text-muted-foreground text-right">
              {asunto.length}/255 caracteres
            </p>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje *</Label>
            <Textarea
              id="mensaje"
              placeholder="Escribe el contenido del mensaje..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={5}
              maxLength={5000}
              disabled={loading || !!success}
            />
            <p className="text-xs text-muted-foreground text-right">
              {mensaje.length}/5000 caracteres
            </p>
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select
              value={prioridad}
              onValueChange={(value) => setPrioridad(value as Prioridad)}
              disabled={loading || !!success}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Baja
                  </span>
                </SelectItem>
                <SelectItem value="normal">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Normal
                  </span>
                </SelectItem>
                <SelectItem value="alta">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Alta
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnviar}
            disabled={loading || !!success}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
