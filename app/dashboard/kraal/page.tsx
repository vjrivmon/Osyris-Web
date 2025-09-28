"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function KraalDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir inmediatamente al aula virtual
    router.replace("/aula-virtual")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirigiendo al Aula Virtual...</h2>
        <p className="text-muted-foreground">Serás redirigido automáticamente.</p>
      </div>
    </div>
  )
}