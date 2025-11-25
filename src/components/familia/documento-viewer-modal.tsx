'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

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

  // Extraer fileId del webViewLink
  const getFileId = (webViewLink: string) => {
    const match = webViewLink.match(/\/d\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  useEffect(() => {
    if (!isOpen || !documento) {
      setBlobUrl(null)
      setLoading(true)
      setError(null)
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
          throw new Error('Error al cargar el documento')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (err) {
        console.error('Error fetching document:', err)
        setError('No se pudo cargar el documento')
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
  }, [isOpen, documento])

  if (!documento) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        setBlobUrl(null)
        setLoading(true)
        setError(null)
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {blobUrl && !error && (
            <object
              data={blobUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <iframe
                src={blobUrl}
                className="w-full h-full border-0"
                title={documento.name}
              />
            </object>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
