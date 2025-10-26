"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Phone,
  Heart,
  Pill,
  FileText,
  Star,
  Users,
  MessageCircle,
  CalendarDays
} from "lucide-react"

interface Scout {
  id: string
  nombre: string
  apellidos: string
  fecha_nacimiento: string
  seccion_actual: string
  alergias: string[]
  medicacion: string[]
  observaciones_medicas: string
  contacto_emergencia: {
    nombre: string
    telefono: string
    relacion: string
    es_principal: boolean
  }[]
}

interface ScoutsVinculadosProps {
  scouts: Scout[]
  onActualizarScout: (scoutId: string, datos: Partial<Scout>) => Promise<void>
  isLoading: boolean
}

const seccionesScout = {
  "castores": { nombre: "Colonia La Veleta", edad: "5-7 años", color: "bg-orange-100 text-orange-700", icon: "🦫" },
  "manada": { nombre: "Manada Waingunga", edad: "7-10 años", color: "bg-yellow-100 text-yellow-700", icon: "🐺" },
  "tropa": { nombre: "Tropa Brownsea", edad: "10-13 años", color: "bg-green-100 text-green-700", icon: "⚜️" },
  "pioneros": { nombre: "Posta Kanhiwara", edad: "13-16 años", color: "bg-red-100 text-red-700", icon: "🏔️" },
  "rutas": { nombre: "Ruta Walhalla", edad: "16-19 años", color: "bg-blue-100 text-blue-700", icon: "🎒" }
}

const alergiasComunes = [
  "Frutos secos", "Lácteos", "Gluten", "Huevos", "Pescado", "Marisco",
  "Polen", "Ácaros", "Moho", "Picaduras de insectos", "Látex", "Otros"
]

const medicamentosComunes = [
  "Asma/Inhalador", "Epinefrina/EpiPen", "Antihistamínicos", "Insulina",
  "Analgesia", "Antibióticos", "Vitaminas", "Otros"
]

export function ScoutsVinculados({ scouts, onActualizarScout, isLoading }: ScoutsVinculadosProps) {
  const [scoutEditando, setScoutEditando] = useState<string | null>(null)
  const [datosEditando, setDatosEditando] = useState<Partial<Scout>>({})
  const [nuevaAlergia, setNuevaAlergia] = useState("")
  const [nuevoMedicamento, setNuevoMedicamento] = useState("")
  const [showAlert, setShowAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const getIniciales = (nombre: string, apellidos: string) => {
    return (nombre[0] + apellidos[0]).toUpperCase()
  }

  const handleEditarScout = (scout: Scout) => {
    setScoutEditando(scout.id)
    setDatosEditando({ ...scout })
  }

  const handleGuardarScout = async () => {
    if (!scoutEditando) return

    try {
      await onActualizarScout(scoutEditando, datosEditando)
      setScoutEditando(null)
      setDatosEditando({})
      setShowAlert({ type: 'success', message: 'Información actualizada correctamente' })
      setTimeout(() => setShowAlert(null), 3000)
    } catch (error) {
      setShowAlert({ type: 'error', message: 'Error al actualizar la información' })
      setTimeout(() => setShowAlert(null), 3000)
    }
  }

  const handleCancelarEdicion = () => {
    setScoutEditando(null)
    setDatosEditando({})
  }

  const handleAgregarAlergia = () => {
    if (nuevaAlergia.trim() && scoutEditando) {
      setDatosEditando(prev => ({
        ...prev,
        alergias: [...(prev.alergias || []), nuevaAlergia.trim()]
      }))
      setNuevaAlergia("")
    }
  }

  const handleEliminarAlergia = (index: number) => {
    setDatosEditando(prev => ({
      ...prev,
      alergias: prev.alergias?.filter((_, i) => i !== index) || []
    }))
  }

  const handleAgregarMedicamento = () => {
    if (nuevoMedicamento.trim() && scoutEditando) {
      setDatosEditando(prev => ({
        ...prev,
        medicacion: [...(prev.medicacion || []), nuevoMedicamento.trim()]
      }))
      setNuevoMedicamento("")
    }
  }

  const handleEliminarMedicamento = (index: number) => {
    setDatosEditando(prev => ({
      ...prev,
      medicacion: prev.medicacion?.filter((_, i) => i !== index) || []
    }))
  }

  const tieneInformacionMedica = (scout: Partial<Scout>) => {
    return (scout.alergias && scout.alergias.length > 0) ||
           (scout.medicacion && scout.medicacion.length > 0) ||
           (scout.observaciones_medicas && scout.observaciones_medicas.length > 0)
  }

  if (scouts.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes scouts vinculados</h3>
        <p className="text-gray-500 mb-6">
          Contacta con el monitor de tu sección para vincular a tus hijos/as
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Vinculación
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerta de estado */}
      {showAlert && (
        <Alert className={showAlert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {showAlert.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={showAlert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {showAlert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de scouts */}
      <div className="space-y-4">
        {scouts.map((scout) => {
          const seccionInfo = seccionesScout[scout.seccion_actual as keyof typeof seccionesScout]
          const editando = scoutEditando === scout.id
          const datos = editando ? datosEditando : scout

          return (
            <Card key={scout.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className={`text-xl ${seccionInfo.color}`}>
                        {getIniciales(scout.nombre, scout.apellidos)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {scout.nombre} {scout.apellidos}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={seccionInfo.color}>
                          {seccionInfo.icon} {seccionInfo.nombre}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {calcularEdad(scout.fecha_nacimiento)} años
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar Monitor
                    </Button>
                    <Button size="sm" variant="outline">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Ver Calendario
                    </Button>
                    {!editando ? (
                      <Button
                        size="sm"
                        onClick={() => handleEditarScout(scout)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleGuardarScout} disabled={isLoading}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelarEdicion}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Información médica */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Alergias */}
                  <Card className="border-l-4 border-l-orange-400">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-orange-500" />
                        Alergias
                        {tieneInformacionMedica(datos) && (
                          <AlertTriangle className="h-4 w-4 ml-2 text-orange-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {editando ? (
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <Input
                              value={nuevaAlergia}
                              onChange={(e) => setNuevaAlergia(e.target.value)}
                              placeholder="Nueva alergia"
                              onKeyPress={(e) => e.key === 'Enter' && handleAgregarAlergia()}
                            />
                            <Button size="sm" onClick={handleAgregarAlergia}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {alergiasComunes.map((alergia) => (
                              <Button
                                key={alergia}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (!datos.alergias?.includes(alergia)) {
                                    setDatosEditando(prev => ({
                                      ...prev,
                                      alergias: [...(prev.alergias || []), alergia]
                                    }))
                                  }
                                }}
                                disabled={datos.alergias?.includes(alergia)}
                              >
                                +{alergia}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        {datos.alergias?.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin alergias registradas</p>
                        ) : (
                          datos.alergias?.map((alergia, index) => (
                            <div key={index} className="flex items-center justify-between bg-orange-50 p-2 rounded">
                              <span className="text-sm">{alergia}</span>
                              {editando && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEliminarAlergia(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medicación */}
                  <Card className="border-l-4 border-l-blue-400">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <Pill className="h-4 w-4 mr-2 text-blue-500" />
                        Medicación
                        {datos.medicacion && datos.medicacion.length > 0 && (
                          <AlertTriangle className="h-4 w-4 ml-2 text-blue-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {editando ? (
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <Input
                              value={nuevoMedicamento}
                              onChange={(e) => setNuevoMedicamento(e.target.value)}
                              placeholder="Nuevo medicamento"
                              onKeyPress={(e) => e.key === 'Enter' && handleAgregarMedicamento()}
                            />
                            <Button size="sm" onClick={handleAgregarMedicamento}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {medicamentosComunes.map((med) => (
                              <Button
                                key={med}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (!datos.medicacion?.includes(med)) {
                                    setDatosEditando(prev => ({
                                      ...prev,
                                      medicacion: [...(prev.medicacion || []), med]
                                    }))
                                  }
                                }}
                                disabled={datos.medicacion?.includes(med)}
                              >
                                +{med}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        {datos.medicacion?.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin medicación registrada</p>
                        ) : (
                          datos.medicacion?.map((med, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                              <span className="text-sm">{med}</span>
                              {editando && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEliminarMedicamento(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observaciones médicas */}
                  <Card className="border-l-4 border-l-green-400">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                        Observaciones Médicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editando ? (
                        <Textarea
                          value={datos.observaciones_medicas || ""}
                          onChange={(e) => setDatosEditando(prev => ({
                            ...prev,
                            observaciones_medicas: e.target.value
                          }))}
                          placeholder="Instrucciones importantes para monitores..."
                          className="min-h-[100px]"
                        />
                      ) : (
                        <div className="text-sm">
                          {datos.observaciones_medicas ? (
                            <p className="bg-green-50 p-3 rounded">{datos.observaciones_medicas}</p>
                          ) : (
                            <p className="text-gray-500">Sin observaciones médicas</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Contactos de emergencia */}
                <div>
                  <h4 className="text-lg font-medium mb-4 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactos de Emergencia
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {datos.contacto_emergencia?.map((contacto, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{contacto.nombre}</p>
                              <p className="text-sm text-gray-600">{contacto.relacion}</p>
                              <p className="text-sm text-blue-600">{contacto.telefono}</p>
                            </div>
                            {contacto.es_principal && (
                              <Badge variant="default" className="bg-green-600">
                                Principal
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botón para solicitar vinculación */}
      <div className="text-center pt-6">
        <Button variant="outline" className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Vinculación de Nuevo Scout
        </Button>
      </div>
    </div>
  )
}