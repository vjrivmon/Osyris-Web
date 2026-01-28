'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FamiliaPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay sesión de familia
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user') || localStorage.getItem('osyris_user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.rol === 'familia' && user.activo) {
          // Usuario familia autenticado → dashboard
          router.replace('/familia/dashboard')
          return
        }
      } catch {
        // Token inválido
      }
    }

    // No autenticado o rol incorrecto → login
    router.replace('/login')
  }, [router])

  // Pantalla de carga mientras redirige
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
