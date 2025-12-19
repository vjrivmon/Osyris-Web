'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
} from '@/components/ui/alert-dialog'
import {
  Pencil,
  Bell,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  User
} from 'lucide-react'
import { EducandoConDocs, EducandoUtils, DocumentoEducando, ResumenDocumentacion } from '@/types/educando-scouter'

interface EducandoDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educando: EducandoConDocs | null
  onEdit: (educando: EducandoConDocs) => void
  onDeactivate: (id: number) => Promise<boolean>
  onNotify: (educando: EducandoConDocs) => void
  fetchDocumentacion: (educandoId: number) => Promise<{
    documentos: Record<string, DocumentoEducando>
    resumen: ResumenDocumentacion
  } | null>
}

export function EducandoDetailModal({
  open,
  onOpenChange,
  educando,
  onEdit,
  onDeactivate,
  onNotify,
  fetchDocumentacion
}: EducandoDetailModalProps) {
  const [documentacion, setDocumentacion] = useState<{
    documentos: Record<string, DocumentoEducando>
    resumen: ResumenDocumentacion
  } | null>(null)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  useEffect(() => {
    if (open && educando) {
      loadDocumentacion()
    } else {
      setDocumentacion(null)
    }
  }, [open, educando?.id])

  const loadDocumentacion = async () => {
    if (!educando) return
    setLoadingDocs(true)
    try {
      const data = await fetchDocumentacion(educando.id)
      setDocumentacion(data)
    } catch (err) {
      console.error('Error cargando documentacion:', err)
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleDeactivate = async () => {
    if (!educando) return
    setDeactivating(true)
    try {
      await onDeactivate(educando.id)
    } finally {
      setDeactivating(false)
    }
  }

  if (!educando) return null

  const iniciales = EducandoUtils.getIniciales(educando)
  const avatarColor = EducandoUtils.getAvatarColor(educando.nombre)
  const puedeNotificar = EducandoUtils.puedeNotificar(educando)

  const getDocIcon = (estado: string) => {
    switch (estado) {
      case 'subido':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pendiente_revision':
        return <Clock className="h-4 w-4 text-amber-600" />
      case 'rechazado':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getDocBadge = (estado: string) => {
    switch (estado) {
      case 'subido':
        return <Badge className="bg-green-100 text-green-800">Subido</Badge>
      case 'pendiente_revision':
        return <Badge className="bg-amber-100 text-amber-800">Pendiente</Badge>
      case 'rechazado':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
      default:
        return <Badge variant="outline">Faltante</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${avatarColor}`}
            >
              {iniciales}
            </div>
            <div>
              <span>{educando.nombre} {educando.apellidos}</span>
              <p className="text-sm font-normal text-muted-foreground">
                {educando.edad} años - {educando.seccion_nombre}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Acciones rapidas */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(educando)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              {puedeNotificar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNotify(educando)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notificar Familia
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <UserX className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar educando?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estas seguro de que deseas eliminar a {educando.nombre} {educando.apellidos}?
                      El educando no aparecera en las listas activas ni en la lista de eliminados pero sus datos se conservaran en el Drive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeactivate}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deactivating}
                    >
                      {deactivating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Desactivar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator />

            {/* Datos basicos */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos Personales
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Fecha de nacimiento</span>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(educando.fecha_nacimiento).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Genero</span>
                  <p className="font-medium capitalize">{educando.genero || 'No especificado'}</p>
                </div>
                {educando.dni && (
                  <div>
                    <span className="text-muted-foreground">DNI</span>
                    <p className="font-medium">{educando.dni}</p>
                  </div>
                )}
                {educando.pasaporte && (
                  <div>
                    <span className="text-muted-foreground">Pasaporte</span>
                    <p className="font-medium">{educando.pasaporte}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto */}
            {(educando.telefono_movil || educando.telefono_casa || educando.email || educando.direccion) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contacto
                  </h4>
                  <div className="space-y-2 text-sm">
                    {educando.telefono_movil && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {educando.telefono_movil}
                      </p>
                    )}
                    {educando.telefono_casa && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {educando.telefono_casa} (fijo)
                      </p>
                    )}
                    {educando.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {educando.email}
                      </p>
                    )}
                    {educando.direccion && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {educando.direccion}
                        {educando.codigo_postal && `, ${educando.codigo_postal}`}
                        {educando.municipio && ` - ${educando.municipio}`}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Salud */}
            {(educando.alergias || educando.notas_medicas) && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Informacion de Salud
                  </h4>
                  <div className="space-y-2 text-sm">
                    {educando.alergias && (
                      <div>
                        <span className="text-muted-foreground">Alergias:</span>
                        <p className="mt-1 p-2 bg-red-50 rounded text-red-800">{educando.alergias}</p>
                      </div>
                    )}
                    {educando.notas_medicas && (
                      <div>
                        <span className="text-muted-foreground">Notas medicas:</span>
                        <p className="mt-1 p-2 bg-muted rounded">{educando.notas_medicas}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Familia */}
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Familia Vinculada</h4>
              {educando.tiene_familia_vinculada ? (
                <Badge className="bg-green-100 text-green-800">
                  {educando.familiares_count} familiar(es) vinculado(s)
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Sin familia vinculada. El administrador debe vincular a la familia.
                </p>
              )}
            </div>

            {/* Documentacion */}
            <Separator />
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Estado de Documentacion
              </h4>

              {loadingDocs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : documentacion ? (
                <div className="space-y-3">
                  {/* Resumen */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {documentacion.resumen.completos} completos
                    </span>
                    {documentacion.resumen.pendientes > 0 && (
                      <span className="text-amber-600 font-medium">
                        {documentacion.resumen.pendientes} pendientes
                      </span>
                    )}
                    {documentacion.resumen.faltantes > 0 && (
                      <span className="text-red-600 font-medium">
                        {documentacion.resumen.faltantes} faltantes
                      </span>
                    )}
                  </div>

                  {/* Lista de documentos */}
                  <div className="space-y-2">
                    {Object.values(documentacion.documentos).map((doc) => (
                      <div
                        key={doc.tipo}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          {getDocIcon(doc.estado)}
                          <span className="text-sm">{doc.nombre}</span>
                          {doc.obligatorio && (
                            <span className="text-xs text-muted-foreground">(requerido)</span>
                          )}
                        </div>
                        {getDocBadge(doc.estado)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {educando.docs_completos}/{educando.docs_total} documentos completos
                </p>
              )}
            </div>

            {/* Notas */}
            {educando.notas && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Observaciones</h4>
                  <p className="text-sm text-muted-foreground p-2 bg-muted rounded">
                    {educando.notas}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
