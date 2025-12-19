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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Loader2, AlertCircle, Send } from 'lucide-react'
import { EducandoConDocs, DocumentoEducando, ResumenDocumentacion } from '@/types/educando-scouter'

interface SendNotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educando: EducandoConDocs | null
  onSend: (documentosFaltantes: string[], mensaje?: string) => Promise<boolean>
  fetchDocumentacion: (educandoId: number) => Promise<{
    documentos: Record<string, DocumentoEducando>
    resumen: ResumenDocumentacion
  } | null>
}

export function SendNotificationModal({
  open,
  onOpenChange,
  educando,
  onSend,
  fetchDocumentacion
}: SendNotificationModalProps) {
  const [documentacion, setDocumentacion] = useState<{
    documentos: Record<string, DocumentoEducando>
    resumen: ResumenDocumentacion
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [mensaje, setMensaje] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open && educando) {
      loadDocumentacion()
      setSelectedDocs([])
      setMensaje('')
      setSuccess(false)
    } else {
      setDocumentacion(null)
    }
  }, [open, educando?.id])

  const loadDocumentacion = async () => {
    if (!educando) return
    setLoading(true)
    try {
      const data = await fetchDocumentacion(educando.id)
      setDocumentacion(data)

      // Pre-seleccionar documentos faltantes
      if (data) {
        const faltantes = Object.values(data.documentos)
          .filter(doc => doc.estado === 'faltante' || doc.estado === 'rechazado')
          .map(doc => doc.nombre)
        setSelectedDocs(faltantes)
      }
    } catch (err) {
      console.error('Error cargando documentacion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDoc = (docNombre: string) => {
    setSelectedDocs(prev =>
      prev.includes(docNombre)
        ? prev.filter(d => d !== docNombre)
        : [...prev, docNombre]
    )
  }

  const handleSend = async () => {
    if (selectedDocs.length === 0) return

    setSending(true)
    try {
      const result = await onSend(selectedDocs, mensaje || undefined)
      if (result) {
        setSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
      }
    } finally {
      setSending(false)
    }
  }

  if (!educando) return null

  const docsFaltantesORechazados = documentacion
    ? Object.values(documentacion.documentos).filter(
        doc => doc.estado === 'faltante' || doc.estado === 'rechazado'
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            Notificar a Familia
          </DialogTitle>
          <DialogDescription>
            Enviar aviso a la familia de {educando.nombre} {educando.apellidos} sobre documentacion pendiente.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Notificacion enviada correctamente
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : docsFaltantesORechazados.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este educando no tiene documentos faltantes o rechazados.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Lista de documentos faltantes */}
            <div>
              <Label className="text-sm font-medium">Documentos a notificar:</Label>
              <div className="mt-2 space-y-2">
                {docsFaltantesORechazados.map((doc) => (
                  <div
                    key={doc.tipo}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-muted/50"
                  >
                    <Checkbox
                      id={doc.tipo}
                      checked={selectedDocs.includes(doc.nombre)}
                      onCheckedChange={() => handleToggleDoc(doc.nombre)}
                    />
                    <label
                      htmlFor={doc.tipo}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {doc.nombre}
                      {doc.estado === 'rechazado' && (
                        <span className="text-red-600 text-xs ml-2">(rechazado)</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mensaje personalizado */}
            <div>
              <Label htmlFor="mensaje" className="text-sm font-medium">
                Mensaje personalizado (opcional):
              </Label>
              <Textarea
                id="mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Aniade un mensaje personalizado para la familia..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground">
              Se enviara una notificacion a {educando.familiares_count} familiar(es) vinculado(s).
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || loading || selectedDocs.length === 0 || success}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Bell className="h-4 w-4 mr-2" />
            Enviar Aviso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
