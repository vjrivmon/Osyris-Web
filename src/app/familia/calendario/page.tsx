'use client'

import { useState, useEffect } from 'react'
import { CalendarioView } from '@/components/familia/calendario/calendario-view'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FamiliaCalendarioPage() {
  // Leer hijo seleccionado de sessionStorage
  const [hijoSeleccionado, setHijoSeleccionado] = useState<number | undefined>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('hijoSeleccionado')
      return saved ? parseInt(saved, 10) : undefined
    }
    return undefined
  })

  // Sincronizar con sessionStorage por si cambia en otra pestaña/componente
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = sessionStorage.getItem('hijoSeleccionado')
      if (saved) {
        setHijoSeleccionado(parseInt(saved, 10))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Volver */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/familia/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>

      {/* Calendario completo con todos los eventos de la ronda */}
      <CalendarioView hijoSeleccionado={hijoSeleccionado} />
    </div>
  )
}
