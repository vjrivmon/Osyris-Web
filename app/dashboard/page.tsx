'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect old dashboard to new admin panel
    router.replace('/admin')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirigiendo...</h1>
        <p className="text-muted-foreground">
          El panel de control se ha movido a /admin
        </p>
      </div>
    </div>
  )
}