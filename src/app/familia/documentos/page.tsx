'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function FamiliaDocumentosPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al dashboard después de 2 segundos
    const timeout = setTimeout(() => {
      router.push('/familia/dashboard')
    }, 2000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Página no disponible</h2>
          <p className="text-muted-foreground mb-4">
            Esta funcionalidad no está activa actualmente.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirigiendo al inicio...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
