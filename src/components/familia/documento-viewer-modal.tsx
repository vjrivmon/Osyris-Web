'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw, Download, FileText } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface DocumentoViewerModalProps {
  isOpen: boolean
  onClose: () => void
  documento: {
    name: string
    webViewLink?: string
    id?: string
  } | null
}

export function DocumentoViewerModal({ isOpen, onClose, documento }: DocumentoViewerModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [isPdf, setIsPdf] = useState(true)
  const [mimeType, setMimeType] = useState<string>('')

  const handleRetry = useCallback(() => {
    setError(null)
    setLoading(true)
    setBlobUrl(null)
    setIsPdf(true)
    setRetryKey(prev => prev + 1)
  }, [])

  // Extraer fileId de diferentes formatos de URL
  const getFileId = (url: string) => {
    // Formato webViewLink: /d/ID/
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return match[1]

    // Formato download: ?id=ID o &id=ID
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (match) return match[1]

    return null
  }

  useEffect(() => {
    if (!isOpen || !documento) {
      setBlobUrl(null)
      setLoading(true)
      setError(null)
      setIsPdf(true)
      setMimeType('')
      return
    }

    const fetchDocument = async () => {
      const fileId = documento.id || getFileId(documento.webViewLink || '')
      if (!fileId) {
        setError('No se pudo obtener el ID del archivo')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/drive/file/${fileId}/preview`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          // Intentar leer el mensaje de error del servidor
          try {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Error al cargar el documento')
          } catch {
            throw new Error('Error al cargar el documento')
          }
        }

        // Verificar que el content-type sea PDF o similar
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          // El servidor devolvió JSON en lugar de un archivo
          const errorData = await response.json()
          throw new Error(errorData.message || 'El servidor no pudo obtener el documento')
        }

        const blob = await response.blob()

        // Verificar que el blob tenga contenido
        if (blob.size === 0) {
          throw new Error('El documento está vacío')
        }

        // Verificar el tipo de contenido
        const blobType = blob.type || contentType || ''
        setMimeType(blobType)

        // Determinar si es PDF o imagen
        const isPdfFile = blobType.includes('pdf')
        const isImage = blobType.includes('image/')
        setIsPdf(isPdfFile || isImage)

        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (err) {
        console.error('Error fetching document:', err)
        setError(err instanceof Error ? err.message : 'No se pudo cargar el documento')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [isOpen, documento, retryKey])

  if (!documento) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
        setLoading(true)
        setError(null)
        setIsPdf(true)
        setMimeType('')
      }
      onClose()
    }}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg truncate pr-4">{documento.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Cargando documento...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 p-4">
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Volver a cargar
              </Button>
            </div>
          )}

          {blobUrl && !error && isPdf && (
            <object
              data={blobUrl}
              type={mimeType.includes('image/') ? mimeType : 'application/pdf'}
              className="w-full h-full"
            >
              {mimeType.includes('image/') ? (
                <img src={blobUrl} alt={documento.name} className="max-w-full max-h-full object-contain mx-auto" />
              ) : (
                <iframe
                  src={blobUrl}
                  className="w-full h-full border-0"
                  title={documento.name}
                />
              )}
            </object>
          )}

          {blobUrl && !error && !isPdf && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-4">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-2">
                Este archivo no se puede previsualizar directamente
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Tipo: {mimeType || 'Desconocido'}
              </p>
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = blobUrl
                  link.download = documento.name
                  link.click()
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
