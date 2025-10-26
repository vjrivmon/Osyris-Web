'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Settings,
  Bell,
  Mail,
  Smartphone,
  Wifi,
  Clock,
  Calendar,
  Moon,
 Sun,
  Users,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Volume2,
  VolumeX
} from "lucide-react"
import { useNotificacionesFamilia, PreferenciasNotificacion, ContactoAdicional } from '@/hooks/useNotificacionesFamilia'
import { cn } from '@/lib/utils'

interface NotificationPreferencesProps {
  className?: string
}

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const {
    preferencias,
    loadingPreferencias,
    actualizarPreferencias,
    loading
  } = useNotificacionesFamilia()

  const [tempPreferencias, setTempPreferencias] = useState<PreferenciasNotificacion | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddContactDialog, setShowAddContactDialog] = useState(false)
  const [newContact, setNewContact] = useState<Partial<ContactoAdicional>>({
    nombre: '',
    relacion: '',
    email: '',
    telefono: '',
    recibir_urgentes: false,
    recibir_importantes: false,
    recibir_informativos: false
  })

  useEffect(() => {
    if (preferencias) {
      setTempPreferencias({ ...preferencias })
    }
  }, [preferencias])

  useEffect(() => {
    if (preferencias && tempPreferencias) {
      const changed = JSON.stringify(preferencias) !== JSON.stringify(tempPreferencias)
      setHasChanges(changed)
    }
  }, [tempPreferencias, preferencias])

  const handleSave = async () => {
    if (!tempPreferencias) return

    setIsSaving(true)
    try {
      const success = await actualizarPreferencias(tempPreferencias)
      if (success) {
        setHasChanges(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (preferencias) {
      setTempPreferencias({ ...preferencias })
      setHasChanges(false)
    }
  }

  const updateTempPreferencias = (updates: Partial<PreferenciasNotificacion>) => {
    if (tempPreferencias) {
      setTempPreferencias({ ...tempPreferencias, ...updates })
    }
  }

  const addContactoAdicional = () => {
    if (!tempPreferencias || !newContact.nombre) return

    const contacto: ContactoAdicional = {
      id: Date.now(), // ID temporal
      nombre: newContact.nombre || '',
      relacion: newContact.relacion || '',
      email: newContact.email,
      telefono: newContact.telefono,
      recibir_urgentes: newContact.recibir_urgentes || false,
      recibir_importantes: newContact.recibir_importantes || false,
      recibir_informativos: newContact.recibir_informativos || false
    }

    updateTempPreferencias({
      contactos_adicionales: [...(tempPreferencias.contactos_adicionales || []), contacto]
    })

    setNewContact({
      nombre: '',
      relacion: '',
      email: '',
      telefono: '',
      recibir_urgentes: false,
      recibir_importantes: false,
      recibir_informativos: false
    })
    setShowAddContactDialog(false)
  }

  const removeContactoAdicional = (contactId: number) => {
    if (!tempPreferencias) return

    updateTempPreferencias({
      contactos_adicionales: tempPreferencias.contactos_adicionales?.filter(c => c.id !== contactId) || []
    })
  }

  const updateContactoAdicional = (contactId: number, updates: Partial<ContactoAdicional>) => {
    if (!tempPreferencias) return

    const updatedContacts = tempPreferencias.contactos_adicionales?.map(contact =>
      contact.id === contactId ? { ...contact, ...updates } : contact
    ) || []

    updateTempPreferencias({ contactos_adicionales: updatedContacts })
  }

  if (loadingPreferencias) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Cargando preferencias...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tempPreferencias) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se pudieron cargar las preferencias</h3>
            <p className="text-muted-foreground">Por favor, intenta recargar la página</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Preferencias de Notificaciones</span>
          </h2>
          <p className="text-muted-foreground">
            Configura cómo y cuándo quieres recibir las comunicaciones
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              Descartar cambios
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Pestañas de configuración */}
      <Tabs defaultValue="canales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="canales" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Canales</span>
          </TabsTrigger>
          <TabsTrigger value="horarios" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Horarios</span>
          </TabsTrigger>
          <TabsTrigger value="frecuencia" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Frecuencia</span>
          </TabsTrigger>
          <TabsTrigger value="contactos" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Contactos</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuración de canales */}
        <TabsContent value="canales" className="space-y-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Notificaciones por Email</span>
              </CardTitle>
              <CardDescription>
                Configura qué tipo de notificaciones recibir por correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir comunicaciones importantes en tu correo
                  </p>
                </div>
                <Switch
                  checked={tempPreferencias.email_habilitado}
                  onCheckedChange={(checked) => updateTempPreferencias({ email_habilitado: checked })}
                />
              </div>

              {tempPreferencias.email_habilitado && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificaciones urgentes</Label>
                        <p className="text-xs text-muted-foreground">
                          Comunicados críticos y emergencias
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferencias.email_urgentes}
                        onCheckedChange={(checked) => updateTempPreferencias({ email_urgentes: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificaciones importantes</Label>
                        <p className="text-xs text-muted-foreground">
                          Documentos requeridos, confirmaciones
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferencias.email_importantes}
                        onCheckedChange={(checked) => updateTempPreferencias({ email_importantes: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificaciones informativas</Label>
                        <p className="text-xs text-muted-foreground">
                          Novedades, fotos, recordatorios generales
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferencias.email_informativos}
                        onCheckedChange={(checked) => updateTempPreferencias({ email_informativos: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Resumen semanal</Label>
                        <p className="text-xs text-muted-foreground">
                          Recibir un resumen con todas las novedades de la semana
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferencias.email_resumen_semanal}
                        onCheckedChange={(checked) => updateTempPreferencias({ email_resumen_semanal: checked })}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Notificaciones por SMS</span>
              </CardTitle>
              <CardDescription>
                Alertas críticas por mensaje de texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar notificaciones por SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Solo para comunicaciones críticas
                  </p>
                </div>
                <Switch
                  checked={tempPreferencias.sms_habilitado}
                  onCheckedChange={(checked) => updateTempPreferencias({ sms_habilitado: checked })}
                />
              </div>

              {tempPreferencias.sms_habilitado && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Solo urgentes</Label>
                      <p className="text-xs text-muted-foreground">
                        Recibir solo mensajes de emergencia crítica
                      </p>
                    </div>
                    <Switch
                      checked={tempPreferencias.sms_solo_urgentes}
                      onCheckedChange={(checked) => updateTempPreferencias({ sms_solo_urgentes: checked })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Push Web */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5" />
                <span>Notificaciones Push Web</span>
              </CardTitle>
              <CardDescription>
                Notificaciones en tiempo real en tu navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas instantáneas mientras navegas
                  </p>
                </div>
                <Switch
                  checked={tempPreferencias.push_habilitado}
                  onCheckedChange={(checked) => updateTempPreferencias({ push_habilitado: checked })}
                />
              </div>

              {tempPreferencias.push_habilitado && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificaciones urgentes</Label>
                        <p className="text-xs text-muted-foreground">
                          Emergencias y cambios de última hora
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferencias.push_urgentes}
                        onCheckedChange={(checked) => updateTempPreferencias({ push_urgentes: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Notificaciones importantes</Label>
                        <p className="text-xs text-muted-foreground">
                          Recordatorios y confirmaciones
                        </p>
                      </div>
                      <Switch
                        checked={tempPreferencias.push_importantes}
                        onCheckedChange={(checked) => updateTempPreferencias({ push_importantes: checked })}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de horarios */}
        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Horario de Recepción</span>
              </CardTitle>
              <CardDescription>
                Define cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Horario habitual */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Label className="font-medium">Horario entre semana</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horario-inicio">Desde</Label>
                    <Input
                      id="horario-inicio"
                      type="time"
                      value={tempPreferencias.horario_inicio}
                      onChange={(e) => updateTempPreferencias({ horario_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario-fin">Hasta</Label>
                    <Input
                      id="horario-fin"
                      type="time"
                      value={tempPreferencias.horario_fin}
                      onChange={(e) => updateTempPreferencias({ horario_fin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Horario fin de semana */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <Label className="font-medium">Horario fin de semana diferente</Label>
                  </div>
                  <Switch
                    checked={tempPreferencias.fin_de_semana_diferenciado}
                    onCheckedChange={(checked) => updateTempPreferencias({ fin_de_semana_diferenciado: checked })}
                  />
                </div>

                {tempPreferencias.fin_de_semana_diferenciado && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horario-fin-semana-inicio">Desde</Label>
                      <Input
                        id="horario-fin-semana-inicio"
                        type="time"
                        value={tempPreferencias.horario_fin_semana_inicio}
                        onChange={(e) => updateTempPreferencias({ horario_fin_semana_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="horario-fin-semana-fin">Hasta</Label>
                      <Input
                        id="horario-fin-semana-fin"
                        type="time"
                        value={tempPreferencias.horario_fin_semana_fin}
                        onChange={(e) => updateTempPreferencias({ horario_fin_semana_fin: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Modo no molestar */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo "No Molestar"</Label>
                  <p className="text-sm text-muted-foreground">
                    Solo recibir notificaciones críticas y urgentes
                  </p>
                </div>
                <Switch
                  checked={tempPreferencias.modo_no_molestar}
                  onCheckedChange={(checked) => updateTempPreferencias({ modo_no_molestar: checked })}
                />
              </div>

              {/* Vacaciones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo vacaciones activo</Label>
                    <p className="text-sm text-muted-foreground">
                      Suspender temporalmente todas las notificaciones
                    </p>
                  </div>
                  <Switch
                    checked={tempPreferencias.vacaciones_activo}
                    onCheckedChange={(checked) => updateTempPreferencias({ vacaciones_activo: checked })}
                  />
                </div>

                {tempPreferencias.vacaciones_activo && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vacaciones-inicio">Fecha inicio</Label>
                      <Input
                        id="vacaciones-inicio"
                        type="date"
                        value={tempPreferencias.vacaciones_inicio?.split('T')[0] || ''}
                        onChange={(e) => updateTempPreferencias({ vacaciones_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vacaciones-fin">Fecha fin</Label>
                      <Input
                        id="vacaciones-fin"
                        type="date"
                        value={tempPreferencias.vacaciones_fin?.split('T')[0] || ''}
                        onChange={(e) => updateTempPreferencias({ vacaciones_fin: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de frecuencia */}
        <TabsContent value="frecuencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Frecuencia de Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Agrupa notificaciones para reducir interrupciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label htmlFor="frecuencia-notificaciones">Frecuencia de recepción</Label>
                <Select
                  value={tempPreferencias.frecuencia_notificaciones}
                  onValueChange={(value) => updateTempPreferencias({ frecuencia_notificaciones: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inmediatas">
                      <div className="space-y-1">
                        <div className="font-medium">Inmediatas</div>
                        <div className="text-xs text-muted-foreground">
                          Recibir cada notificación al momento (solo urgentes)
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="diario">
                      <div className="space-y-1">
                        <div className="font-medium">Resumen diario</div>
                        <div className="text-xs text-muted-foreground">
                          Agrupar notificaciones y recibir un resumen cada día
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="semanal">
                      <div className="space-y-1">
                        <div className="font-medium">Resumen semanal</div>
                        <div className="text-xs text-muted-foreground">
                          Recibir un resumen completo cada semana
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumen de configuración</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Email habilitado:</span>
                    <span className={cn(
                      "font-medium",
                      tempPreferencias.email_habilitado ? "text-green-600" : "text-gray-500"
                    )}>
                      {tempPreferencias.email_habilitado ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS habilitado:</span>
                    <span className={cn(
                      "font-medium",
                      tempPreferencias.sms_habilitado ? "text-green-600" : "text-gray-500"
                    )}>
                      {tempPreferencias.sms_habilitado ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push habilitado:</span>
                    <span className={cn(
                      "font-medium",
                      tempPreferencias.push_habilitado ? "text-green-600" : "text-gray-500"
                    )}>
                      {tempPreferencias.push_habilitado ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Horario activo:</span>
                    <span className="font-medium">
                      {tempPreferencias.horario_inicio} - {tempPreferencias.horario_fin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>No molestar:</span>
                    <span className={cn(
                      "font-medium",
                      tempPreferencias.modo_no_molestar ? "text-orange-600" : "text-gray-500"
                    )}>
                      {tempPreferencias.modo_no_molestar ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contactos adicionales */}
        <TabsContent value="contactos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Contactos Adicionales</span>
                  </CardTitle>
                  <CardDescription>
                    Otras personas que recibirán notificaciones importantes
                  </CardDescription>
                </div>
                <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir contacto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir contacto adicional</DialogTitle>
                      <DialogDescription>
                        Esta persona recibirá notificaciones según la configuración que definas
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contacto-nombre">Nombre completo</Label>
                        <Input
                          id="contacto-nombre"
                          value={newContact.nombre || ''}
                          onChange={(e) => setNewContact({ ...newContact, nombre: e.target.value })}
                          placeholder="Ej: María González"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto-relacion">Relación</Label>
                        <Input
                          id="contacto-relacion"
                          value={newContact.relacion || ''}
                          onChange={(e) => setNewContact({ ...newContact, relacion: e.target.value })}
                          placeholder="Ej: Abuela, Tío, Tutor legal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto-email">Email</Label>
                        <Input
                          id="contacto-email"
                          type="email"
                          value={newContact.email || ''}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contacto-telefono">Teléfono</Label>
                        <Input
                          id="contacto-telefono"
                          value={newContact.telefono || ''}
                          onChange={(e) => setNewContact({ ...newContact, telefono: e.target.value })}
                          placeholder="+34 600 000 000"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>Tipo de notificaciones a recibir:</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="contacto-urgentes"
                              checked={newContact.recibir_urgentes || false}
                              onCheckedChange={(checked) => setNewContact({ ...newContact, recibir_urgentes: !!checked })}
                            />
                            <Label htmlFor="contacto-urgentes" className="text-sm">
                              Notificaciones urgentes 🚨
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="contacto-importantes"
                              checked={newContact.recibir_importantes || false}
                              onCheckedChange={(checked) => setNewContact({ ...newContact, recibir_importantes: !!checked })}
                            />
                            <Label htmlFor="contacto-importantes" className="text-sm">
                              Notificaciones importantes ⚠️
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="contacto-informativas"
                              checked={newContact.recibir_informativos || false}
                              onCheckedChange={(checked) => setNewContact({ ...newContact, recibir_informativos: !!checked })}
                            />
                            <Label htmlFor="contacto-informativas" className="text-sm">
                              Notificaciones informativas ℹ️
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setShowAddContactDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={addContactoAdicional} disabled={!newContact.nombre}>
                          Añadir contacto
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tempPreferencias.contactos_adicionales?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay contactos adicionales</h3>
                  <p className="text-muted-foreground mb-4">
                    Añade a otras personas que deban recibir notificaciones importantes
                  </p>
                  <Button onClick={() => setShowAddContactDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir primer contacto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tempPreferencias.contactos_adicionales?.map((contacto) => (
                    <div key={contacto.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{contacto.nombre}</h4>
                          <p className="text-sm text-muted-foreground">{contacto.relacion}</p>
                          {contacto.email && (
                            <p className="text-sm text-blue-600">{contacto.email}</p>
                          )}
                          {contacto.telefono && (
                            <p className="text-sm text-green-600">{contacto.telefono}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeContactoAdicional(contacto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contacto.recibir_urgentes && (
                          <Badge variant="destructive" className="text-xs">Urgentes</Badge>
                        )}
                        {contacto.recibir_importantes && (
                          <Badge variant="default" className="text-xs">Importantes</Badge>
                        )}
                        {contacto.recibir_informativos && (
                          <Badge variant="secondary" className="text-xs">Informativas</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}