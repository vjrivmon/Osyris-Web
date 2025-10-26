'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Send,
  MessageSquare,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  User,
  Users,
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Zap
} from "lucide-react"
import { useNotificacionesFamilia, usePlantillasMensaje, CategoriaNotificacion, TipoNotificacion, PlantillaMensaje } from '@/hooks/useNotificacionesFamilia'
import { useFamiliaData } from '@/hooks/useFamiliaData'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NotificationComposeProps {
  scoutId?: number
  onMessageSent?: () => void
  className?: string
}

interface MessagePreview {
  to: string
  subject: string
  content: string
  urgency: TipoNotificacion
  category: CategoriaNotificacion
}

export function NotificationCompose({ scoutId, onMessageSent, className }: NotificationComposeProps) {
  const { hijos } = useFamiliaData()
  const { enviarMensajeMonitor, loading } = useNotificacionesFamilia({ scoutId })
  const { plantillas, loading: loadingPlantillas } = usePlantillasMensaje()

  // Estados del formulario
  const [activeTab, setActiveTab] = useState('compose')
  const [selectedScout, setSelectedScout] = useState<number | undefined>(scoutId)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [urgency, setUrgency] = useState<TipoNotificacion>('informativo')
  const [category, setCategory] = useState<CategoriaNotificacion>('general')
  const [isSending, setIsSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedScout, setExpandedScout] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<CategoriaNotificacion | 'todos'>('todos')

  // Estados de plantillas
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaMensaje | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})

  // Estados de mensajes enviados
  const [sentMessages, setSentMessages] = useState<any[]>([])
  const [showSentMessages, setShowSentMessages] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Hijos filtrados
  const filteredHijos = hijos?.filter(hijo => {
    const matchesSearch = !searchTerm ||
      hijo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hijo.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hijo.seccion.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  }) || []

  // Plantillas filtradas
  const filteredTemplates = plantillas?.filter(plantilla => {
    const matchesSearch = !searchTerm ||
      plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantilla.asunto.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'todos' || plantilla.categoria === filterCategory

    return matchesSearch && matchesCategory
  }) || []

  // Handlers
  const handleSend = async () => {
    if (!selectedScout || !subject.trim() || !content.trim()) {
      return
    }

    setIsSending(true)
    try {
      const result = await enviarMensajeMonitor({
        scout_id: selectedScout,
        asunto: subject,
        contenido: content,
        categoria: category,
        urgencia: urgency
      })

      if (result.success) {
        // Reset form
        setSubject('')
        setContent('')
        setSelectedScout(scoutId)
        setUrgency('informativo')
        setCategory('general')
        setSelectedTemplate(null)
        setTemplateVariables({})

        // Add to sent messages
        const selectedScoutData = hijos?.find(h => h.id === selectedScout)
        const newMessage = {
          id: Date.now(),
          to: `${selectedScoutData?.nombre} ${selectedScoutData?.apellidos}`,
          subject,
          content,
          urgency,
          category,
          sentAt: new Date().toISOString(),
          status: 'sent'
        }
        setSentMessages([newMessage, ...sentMessages])

        onMessageSent?.()
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleTemplateSelect = (template: PlantillaMensaje) => {
    setSelectedTemplate(template)
    setSubject(template.asunto)
    setContent(template.contenido)
    setCategory(template.categoria)

    // Inicializar variables de la plantilla
    const variables: Record<string, string> = {}
    template.variables.forEach(variable => {
      variables[variable] = ''
    })
    setTemplateVariables(variables)

    // Cambiar a la pestaña de redacción
    setActiveTab('compose')
  }

  const handleVariableChange = (variable: string, value: string) => {
    setTemplateVariables(prev => ({ ...prev, [variable]: value }))

    // Reemplazar variable en el contenido
    const newContent = content.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    setContent(newContent)

    // Reemplazar variable en el asunto
    const newSubject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    setSubject(newSubject)
  }

  const generatePreview = (): MessagePreview | null => {
    if (!selectedScout || !subject.trim() || !content.trim()) {
      return null
    }

    const selectedScoutData = hijos?.find(h => h.id === selectedScout)
    return {
      to: `${selectedScoutData?.nombre} ${selectedScoutData?.apellidos}`,
      subject,
      content,
      urgency,
      category
    }
  }

  const getUrgencyIcon = (urgency: TipoNotificacion) => {
    switch (urgency) {
      case 'urgente': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'importante': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'informativo': return <Info className="h-4 w-4 text-blue-500" />
      case 'recordatorio': return <Clock className="h-4 w-4 text-green-500" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: CategoriaNotificacion) => {
    switch (category) {
      case 'documentos': return <FileText className="h-4 w-4" />
      case 'actividades': return <Calendar className="h-4 w-4" />
      case 'galeria': return <Star className="h-4 w-4" />
      case 'comunicados': return <Send className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getUrgencyLabel = (urgency: TipoNotificacion) => {
    switch (urgency) {
      case 'urgente': return '🚨 Urgente'
      case 'importante': return '⚠️ Importante'
      case 'informativo': return 'ℹ️ Informativo'
      case 'recordatorio': return '📅 Recordatorio'
      default: return urgency
    }
  }

  const getCategoryLabel = (category: CategoriaNotificacion) => {
    switch (category) {
      case 'documentos': return '📄 Documentos'
      case 'actividades': return '🏕️ Actividades'
      case 'galeria': return '📸 Galería'
      case 'comunicados': return '📢 Comunicados'
      case 'general': return '📋 General'
      default: return category
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Send className="h-6 w-6" />
            <span>Enviar Mensaje</span>
          </h2>
          <p className="text-muted-foreground">
            {scoutId
              ? `Contactar al monitor de ${hijos?.find(h => h.id === scoutId)?.nombre}`
              : 'Enviar mensaje a los monitores de tus hijos'
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowSentMessages(!showSentMessages)}>
            <Eye className="h-4 w-4 mr-2" />
            Mensajes enviados ({sentMessages.length})
          </Button>
        </div>
      </div>

      {/* Mensajes enviados */}
      {showSentMessages && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Historial de mensajes enviados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No has enviado ningún mensaje todavía</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{message.to}</span>
                        <Badge variant="outline">{message.category}</Badge>
                        <Badge variant={message.urgency === 'urgente' ? 'destructive' : 'secondary'}>
                          {message.urgency}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.sentAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{message.subject}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Panel principal */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose" className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Redactar</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Plantillas</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Vista previa</span>
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de redacción */}
            <TabsContent value="compose" className="space-y-6">
              {/* Selección de scout */}
              {!scoutId && (
                <div className="space-y-3">
                  <Label>Seleccionar scout</Label>
                  {searchTerm && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o sección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredHijos.map((hijo) => (
                      <div
                        key={hijo.id}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                          selectedScout === hijo.id && "bg-blue-50 border-blue-200"
                        )}
                        onClick={() => setSelectedScout(hijo.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-700">
                              {hijo.nombre.charAt(0)}{hijo.apellidos.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{hijo.nombre} {hijo.apellidos}</p>
                            <p className="text-xs text-muted-foreground">{hijo.seccion}</p>
                          </div>
                        </div>
                        {hijo.monitor_asignado && (
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{hijo.monitor_asignado.nombre}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario de mensaje */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Tipo de mensaje</Label>
                    <Select value={urgency} onValueChange={(value) => setUrgency(value as TipoNotificacion)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informativo">
                          <div className="flex items-center space-x-2">
                            <Info className="h-4 w-4 text-blue-500" />
                            <span>ℹ️ Informativo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="importante">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span>⚠️ Importante</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="urgente">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span>🚨 Urgente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="recordatorio">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span>📅 Recordatorio</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as CategoriaNotificacion)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>📋 General</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="actividades">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>🏕️ Actividades</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="documentos">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>📄 Documentos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="galeria">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>📸 Galería</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="comunicados">
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>📢 Comunicados</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    placeholder="Escribe el asunto del mensaje..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Mensaje</Label>
                  <Textarea
                    ref={textareaRef}
                    id="content"
                    placeholder="Escribe tu mensaje aquí..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{content.length} caracteres</span>
                    <span>Se enviará al monitor de {hijos?.find(h => h.id === selectedScout)?.nombre}</span>
                  </div>
                </div>

                {/* Variables de plantilla si hay una seleccionada */}
                {selectedTemplate && selectedTemplate.variables.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Edit className="h-4 w-4" />
                        <span>Variables de la plantilla</span>
                      </h4>
                      <div className="space-y-3">
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable} className="space-y-1">
                            <Label htmlFor={`var-${variable}`} className="text-sm">
                              {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Label>
                            <Input
                              id={`var-${variable}`}
                              placeholder={`{{${variable}}}`}
                              value={templateVariables[variable] || ''}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botones de acción */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    {selectedTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(null)
                          setTemplateVariables({})
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar plantilla
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => setShowPreview(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Vista previa
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={!selectedScout || !subject.trim() || !content.trim() || isSending}
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pestaña de plantillas */}
            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-4">
                {/* Filtros de plantillas */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar plantillas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as CategoriaNotificacion | 'todos')}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las categorías</SelectItem>
                      <SelectItem value="general">📋 General</SelectItem>
                      <SelectItem value="actividades">🏕️ Actividades</SelectItem>
                      <SelectItem value="documentos">📄 Documentos</SelectItem>
                      <SelectItem value="galeria">📸 Galería</SelectItem>
                      <SelectItem value="comunicados">📢 Comunicados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de plantillas */}
                {loadingPlantillas ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Cargando plantillas...</p>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay plantillas</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterCategory !== 'todos'
                        ? 'No hay plantillas que coincidan con los filtros'
                        : 'No hay plantillas disponibles'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedTemplate?.id === template.id && "ring-2 ring-blue-500 bg-blue-50"
                        )}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{template.nombre}</h3>
                              <p className="text-sm text-muted-foreground">{template.asunto}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(template.categoria)}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {template.contenido}
                          </p>
                          {template.variables.length > 0 && (
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Edit className="h-3 w-3" />
                              <span>{template.variables.length} variables:</span>
                              <span className="text-blue-600">
                                {template.variables.map(v => `{{${v}}}`).join(', ')}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Pestaña de vista previa */}
            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4">
                {generatePreview() ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <span>Vista previa del mensaje</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metadatos */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Para: {generatePreview()?.to}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getUrgencyIcon(generatePreview()!.urgency)}
                          <span>{getUrgencyLabel(generatePreview()!.urgency)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(generatePreview()!.category)}
                          <span>{getCategoryLabel(generatePreview()!.category)}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Contenido del mensaje */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Asunto:</Label>
                          <p className="font-semibold text-lg">{generatePreview()?.subject}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Mensaje:</Label>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="whitespace-pre-wrap">{generatePreview()?.content}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Información de envío */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Info className="h-4 w-4" />
                          <span>Información de envío</span>
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• El mensaje se enviará al monitor responsable del scout</li>
                          <li>• Recibirás una confirmación cuando el monitor lo lea</li>
                          <li>• Podrás ver este mensaje en tu historial de comunicaciones</li>
                          <li>• El monitor podrá responder directamente a este mensaje</li>
                        </ul>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setActiveTab('compose')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar mensaje
                        </Button>
                        <Button onClick={handleSend} disabled={isSending}>
                          {isSending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar mensaje
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center">
                        <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Vista previa no disponible</h3>
                        <p className="text-muted-foreground mb-4">
                          Completa los campos del mensaje para ver la vista previa
                        </p>
                        <Button onClick={() => setActiveTab('compose')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Ir a redacción
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente compacto para enviar mensajes rápidos
export function QuickMessageCompose({
  scoutId,
  onMessageSent,
  className
}: {
  scoutId: number
  onMessageSent?: () => void
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [urgency, setUrgency] = useState<TipoNotificacion>('informativo')
  const [isSending, setIsSending] = useState(false)

  const { enviarMensajeMonitor } = useNotificacionesFamilia({ scoutId })
  const { hijos } = useFamiliaData()

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return

    setIsSending(true)
    try {
      const result = await enviarMensajeMonitor({
        scout_id: scoutId,
        asunto: subject,
        contenido: content,
        categoria: 'general',
        urgencia: urgency
      })

      if (result.success) {
        setSubject('')
        setContent('')
        setUrgency('informativo')
        setIsExpanded(false)
        onMessageSent?.()
      }
    } finally {
      setIsSending(false)
    }
  }

  const scoutData = hijos?.find(h => h.id === scoutId)

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {!isExpanded ? (
          <Button
            onClick={() => setIsExpanded(true)}
            className="w-full"
            variant="outline"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar mensaje a {scoutData?.monitor_asignado?.nombre}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Mensaje rápido</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              <Select value={urgency} onValueChange={(value) => setUrgency(value as TipoNotificacion)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informativo">ℹ️ Informativo</SelectItem>
                  <SelectItem value="importante">⚠️ Importante</SelectItem>
                  <SelectItem value="urgente">🚨 Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Asunto breve..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <Textarea
                placeholder="Tu mensaje..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsExpanded(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!subject.trim() || !content.trim() || isSending}
                size="sm"
              >
                {isSending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}