'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Save,
  Trash2,
  Euro,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Plus,
  Link as LinkIcon
} from "lucide-react"
import { getApiUrl } from '@/lib/api-utils'
import type { RecordatorioPredefinido } from '@/types/familia'

interface Actividad {
  id?: number
  titulo: string
  descripcion: string
  tipo: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  lugar: string
  seccion_id: number | null
  visibilidad: string
  requiere_confirmacion: boolean
  precio?: number
  // Campamento fields
  lugar_salida?: string
  hora_salida?: string
  mapa_salida_url?: string
  lugar_regreso?: string
  hora_regreso?: string
  numero_cuenta?: string
  concepto_pago?: string
  recordatorios_predefinidos?: RecordatorioPredefinido[]
  recordatorios_personalizados?: string[]
  circular_drive_id?: string
  circular_drive_url?: string
  circular_nombre?: string
  sheets_inscripciones_id?: string
}

interface Seccion {
  id: number
  nombre: string
}

interface EventoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actividad?: Actividad | null
  onSave: () => void
}

const TIPOS_EVENTO = [
  { value: 'reunion_sabado', label: 'Reunion de Sabado' },
  { value: 'campamento', label: 'Campamento' },
  { value: 'salida', label: 'Salida/Excursion' },
  { value: 'evento_especial', label: 'Evento Especial' },
  { value: 'reunion_kraal', label: 'Reunion de Kraal' },
  { value: 'consejo_grupo', label: 'Consejo de Grupo' },
  { value: 'formacion', label: 'Formacion' },
]

const VISIBILIDAD = [
  { value: 'todos', label: 'Todos (familias y kraal)' },
  { value: 'kraal', label: 'Solo Kraal' },
]

const DEFAULT_NUMERO_CUENTA = 'ES76 3159 0063 5125 0527 9113'

export function EventoFormModal({ open, onOpenChange, actividad, onSave }: EventoFormModalProps) {
  const [loading, setSaving] = useState(false)
  const [uploadingCircular, setUploadingCircular] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [recordatoriosPredefinidos, setRecordatoriosPredefinidos] = useState<RecordatorioPredefinido[]>([])
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Actividad>({
    titulo: '',
    descripcion: '',
    tipo: 'reunion_sabado',
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '16:30',
    hora_fin: '18:30',
    lugar: 'Colegio Patronato Juventud Obrera',
    seccion_id: null,
    visibilidad: 'todos',
    requiere_confirmacion: true,
    precio: undefined,
    // Campamento defaults
    lugar_salida: '',
    hora_salida: '',
    mapa_salida_url: '',
    lugar_regreso: '',
    hora_regreso: '',
    numero_cuenta: DEFAULT_NUMERO_CUENTA,
    concepto_pago: '',
    recordatorios_predefinidos: [],
    recordatorios_personalizados: [],
    circular_drive_id: '',
    circular_drive_url: '',
    circular_nombre: ''
  })

  useEffect(() => {
    fetchSecciones()
    fetchRecordatoriosPredefinidos()
  }, [])

  useEffect(() => {
    if (actividad) {
      // Merge recordatorios predefinidos del API con los valores guardados en la actividad
      const mergedRecordatorios = recordatoriosPredefinidos.length > 0
        ? recordatoriosPredefinidos.map(rec => {
            const savedRec = (actividad.recordatorios_predefinidos || []).find(
              (r: RecordatorioPredefinido) => r.id === rec.id
            )
            return savedRec ? { ...rec, activo: savedRec.activo } : rec
          })
        : actividad.recordatorios_predefinidos || []

      setFormData({
        ...actividad,
        fecha_inicio: actividad.fecha_inicio?.split('T')[0] || '',
        fecha_fin: actividad.fecha_fin?.split('T')[0] || '',
        numero_cuenta: actividad.numero_cuenta || DEFAULT_NUMERO_CUENTA,
        recordatorios_predefinidos: mergedRecordatorios,
        recordatorios_personalizados: actividad.recordatorios_personalizados || []
      })
    } else {
      // Reset form for new activity
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'reunion_sabado',
        fecha_inicio: '',
        fecha_fin: '',
        hora_inicio: '16:30',
        hora_fin: '18:30',
        lugar: 'Colegio Patronato Juventud Obrera',
        seccion_id: null,
        visibilidad: 'todos',
        requiere_confirmacion: true,
        precio: undefined,
        lugar_salida: '',
        hora_salida: '',
        mapa_salida_url: '',
        lugar_regreso: '',
        hora_regreso: '',
        numero_cuenta: DEFAULT_NUMERO_CUENTA,
        concepto_pago: '',
        recordatorios_predefinidos: recordatoriosPredefinidos,
        recordatorios_personalizados: [],
        circular_drive_id: '',
        circular_drive_url: '',
        circular_nombre: ''
      })
    }
  }, [actividad, open, recordatoriosPredefinidos])

  const fetchSecciones = async () => {
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/secciones`)
      if (response.ok) {
        const data = await response.json()
        setSecciones(data.data || [])
      }
    } catch (error) {
      console.error('Error cargando secciones:', error)
    }
  }

  const fetchRecordatoriosPredefinidos = async () => {
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/actividades/campamento/recordatorios`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecordatoriosPredefinidos(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error cargando recordatorios:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const url = actividad?.id
        ? `${apiUrl}/api/actividades/${actividad.id}`
        : `${apiUrl}/api/actividades`

      const method = actividad?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.message || 'Error al guardar la actividad')
      }
    } catch (error) {
      console.error('Error guardando actividad:', error)
      alert('Error al guardar la actividad')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    if (!actividad?.id) return
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!actividad?.id) return

    setShowDeleteConfirm(false)
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/actividades/${actividad.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        onSave()
        onOpenChange(false)
      } else {
        const data = await response.json().catch(() => ({}))
        alert(data.message || 'Error al eliminar la actividad')
      }
    } catch (error) {
      console.error('Error eliminando actividad:', error)
      alert('Error al eliminar la actividad')
    } finally {
      setSaving(false)
    }
  }

  // Handlers para circular
  const handleCircularUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !actividad?.id) return

    setUploadingCircular(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch(`${apiUrl}/api/actividades/${actividad.id}/circular`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          circular_drive_id: data.data.fileId,
          circular_drive_url: data.data.fileUrl,
          circular_nombre: data.data.fileName
        }))
        alert('Circular subida correctamente')
      } else {
        const error = await response.json()
        alert(error.message || 'Error al subir circular')
      }
    } catch (error) {
      console.error('Error subiendo circular:', error)
      alert('Error al subir circular')
    } finally {
      setUploadingCircular(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCircularDelete = async () => {
    if (!actividad?.id || !formData.circular_drive_id) return

    if (!confirm('¿Estas seguro de que quieres eliminar la circular?')) return

    setUploadingCircular(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/actividades/${actividad.id}/circular`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          circular_drive_id: '',
          circular_drive_url: '',
          circular_nombre: ''
        }))
        alert('Circular eliminada')
      } else {
        alert('Error al eliminar circular')
      }
    } catch (error) {
      console.error('Error eliminando circular:', error)
      alert('Error al eliminar circular')
    } finally {
      setUploadingCircular(false)
    }
  }

  // Handler para recordatorios predefinidos
  const toggleRecordatorioPredefinido = (id: string) => {
    setFormData(prev => ({
      ...prev,
      recordatorios_predefinidos: (prev.recordatorios_predefinidos || []).map(r =>
        r.id === id ? { ...r, activo: !r.activo } : r
      )
    }))
  }

  // Handler para agregar recordatorio personalizado
  const agregarRecordatorioPersonalizado = () => {
    if (!nuevoRecordatorio.trim()) return

    setFormData(prev => ({
      ...prev,
      recordatorios_personalizados: [...(prev.recordatorios_personalizados || []), nuevoRecordatorio.trim()]
    }))
    setNuevoRecordatorio('')
  }

  // Handler para eliminar recordatorio personalizado
  const eliminarRecordatorioPersonalizado = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recordatorios_personalizados: (prev.recordatorios_personalizados || []).filter((_, i) => i !== index)
    }))
  }

  const isCampamento = formData.tipo === 'campamento'

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {actividad?.id ? 'Editar Actividad' : 'Nueva Actividad'}
          </DialogTitle>
          <DialogDescription>
            {actividad?.id
              ? 'Modifica los datos de la actividad'
              : 'Crea una nueva actividad para el calendario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className={`grid w-full ${isCampamento ? 'grid-cols-5' : 'grid-cols-1'}`}>
              <TabsTrigger value="basico">Informacion Basica</TabsTrigger>
              {isCampamento && (
                <>
                  <TabsTrigger value="logistica">Logistica</TabsTrigger>
                  <TabsTrigger value="pago">Pago</TabsTrigger>
                  <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
                  <TabsTrigger value="circular">Circular</TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Tab: Informacion Basica */}
            <TabsContent value="basico" className="space-y-4 mt-4">
              {/* Titulo */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Titulo *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Campamento de Navidad"
                  required
                />
              </div>

              {/* Tipo y Seccion */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de evento *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_EVENTO.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seccion</Label>
                  <Select
                    value={formData.seccion_id?.toString() || 'todas'}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      seccion_id: value === 'todas' ? null : parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las secciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las secciones</SelectItem>
                      {secciones.map(seccion => (
                        <SelectItem key={seccion.id} value={seccion.id.toString()}>
                          {seccion.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha inicio *</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value, fecha_fin: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha fin</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                </div>
              </div>

              {/* Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora inicio *</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_fin">Hora fin</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                  />
                </div>
              </div>

              {/* Lugar */}
              <div className="space-y-2">
                <Label htmlFor="lugar" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Lugar *
                </Label>
                <Input
                  id="lugar"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  placeholder="Ej: Albergue de montana"
                  required
                />
              </div>

              {/* Descripcion */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripcion</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripcion de la actividad..."
                  rows={3}
                />
              </div>

              {/* Visibilidad y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visibilidad</Label>
                  <Select
                    value={formData.visibilidad}
                    onValueChange={(value) => setFormData({ ...formData, visibilidad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILIDAD.map(vis => (
                        <SelectItem key={vis.value} value={vis.value}>
                          {vis.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isCampamento && (
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio (EUR)</Label>
                    <Input
                      id="precio"
                      type="number"
                      value={formData.precio || ''}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: Logistica (solo campamentos) */}
            {isCampamento && (
              <TabsContent value="logistica" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-green-700">Salida</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="lugar_salida">Lugar de salida</Label>
                      <Input
                        id="lugar_salida"
                        value={formData.lugar_salida}
                        onChange={(e) => setFormData({ ...formData, lugar_salida: e.target.value })}
                        placeholder="Ej: Metro Machado, salida 2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hora_salida">Hora de salida</Label>
                      <Input
                        id="hora_salida"
                        type="time"
                        value={formData.hora_salida}
                        onChange={(e) => setFormData({ ...formData, hora_salida: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mapa_salida_url" className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        URL Mapa (Google Maps)
                      </Label>
                      <Input
                        id="mapa_salida_url"
                        type="url"
                        value={formData.mapa_salida_url}
                        onChange={(e) => setFormData({ ...formData, mapa_salida_url: e.target.value })}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-blue-700">Regreso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="lugar_regreso">Lugar de regreso</Label>
                      <Input
                        id="lugar_regreso"
                        value={formData.lugar_regreso}
                        onChange={(e) => setFormData({ ...formData, lugar_regreso: e.target.value })}
                        placeholder="Ej: Metro Machado, salida 2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hora_regreso">Hora de regreso</Label>
                      <Input
                        id="hora_regreso"
                        type="time"
                        value={formData.hora_regreso}
                        onChange={(e) => setFormData({ ...formData, hora_regreso: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Tab: Pago (solo campamentos) */}
            {isCampamento && (
              <TabsContent value="pago" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Euro className="h-5 w-5" />
                      Datos de Pago
                    </CardTitle>
                    <CardDescription>
                      Informacion para el pago del campamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="numero_cuenta">Numero de cuenta (IBAN)</Label>
                      <Input
                        id="numero_cuenta"
                        value={formData.numero_cuenta}
                        onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                        placeholder="ES00 0000 0000 0000 0000 0000"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Por defecto: {DEFAULT_NUMERO_CUENTA}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="concepto_pago">Concepto del pago</Label>
                      <Textarea
                        id="concepto_pago"
                        value={formData.concepto_pago}
                        onChange={(e) => setFormData({ ...formData, concepto_pago: e.target.value })}
                        placeholder="Ej: Campamento Navidad 2024 - Nombre Educando"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Tab: Recordatorios (solo campamentos) */}
            {isCampamento && (
              <TabsContent value="recordatorios" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recordatorios Predefinidos</CardTitle>
                    <CardDescription>
                      Selecciona los recordatorios que aplican a este campamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(formData.recordatorios_predefinidos && formData.recordatorios_predefinidos.length > 0
                      ? formData.recordatorios_predefinidos
                      : recordatoriosPredefinidos
                    ).map((recordatorio) => (
                      <div key={recordatorio.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`rec-${recordatorio.id}`}
                          checked={recordatorio.activo}
                          onCheckedChange={() => toggleRecordatorioPredefinido(recordatorio.id)}
                        />
                        <label
                          htmlFor={`rec-${recordatorio.id}`}
                          className="text-sm cursor-pointer leading-relaxed"
                        >
                          {recordatorio.texto}
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recordatorios Personalizados</CardTitle>
                    <CardDescription>
                      Agrega recordatorios especificos para este campamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Lista de personalizados */}
                    {(formData.recordatorios_personalizados || []).map((texto, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <span className="flex-1 text-sm">{texto}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarRecordatorioPersonalizado(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Agregar nuevo */}
                    <div className="flex gap-2">
                      <Input
                        value={nuevoRecordatorio}
                        onChange={(e) => setNuevoRecordatorio(e.target.value)}
                        placeholder="Nuevo recordatorio..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            agregarRecordatorioPersonalizado()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={agregarRecordatorioPersonalizado}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Tab: Circular (solo campamentos) */}
            {isCampamento && (
              <TabsContent value="circular" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-5 w-5" />
                      Circular / Autorizacion
                    </CardTitle>
                    <CardDescription>
                      Sube la circular que las familias deberan firmar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.circular_drive_id ? (
                      // Circular ya subida
                      <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">Circular subida</p>
                              <p className="text-sm text-green-600">{formData.circular_nombre}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {formData.circular_drive_url && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(formData.circular_drive_url, '_blank')}
                              >
                                Ver
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleCircularDelete}
                              disabled={uploadingCircular}
                            >
                              {uploadingCircular ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Sin circular - mostrar upload
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleCircularUpload}
                          className="hidden"
                          id="circular-upload"
                          disabled={uploadingCircular || !actividad?.id}
                        />
                        <label htmlFor="circular-upload" className="cursor-pointer">
                          {uploadingCircular ? (
                            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-3 animate-spin" />
                          ) : (
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          )}
                          <p className="text-sm font-medium">
                            {uploadingCircular ? 'Subiendo...' : 'Haz clic para subir la circular'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Solo archivos PDF (max 15MB)
                          </p>
                        </label>
                        {!actividad?.id && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-700 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              Guarda la actividad primero para poder subir la circular
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="flex justify-between mt-6">
            {actividad?.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {actividad?.id ? 'Guardar cambios' : 'Crear actividad'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

    </Dialog>

      {/* Dialogo de confirmacion para eliminar */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar Actividad
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              ¿Estas seguro de que quieres eliminar <span className="font-semibold">"{formData.titulo || 'esta actividad'}"</span>?
              <br /><br />
              Esta accion no se puede deshacer y se eliminaran todas las confirmaciones e inscripciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Si, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
