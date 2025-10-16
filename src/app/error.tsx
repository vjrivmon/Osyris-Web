"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Algo ha ido mal</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  )
}