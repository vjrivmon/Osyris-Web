'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, FileCheck, Loader2, AlertCircle, Tent } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { getApiUrl } from "@/lib/api-utils"
import { VerificacionCircularesCard } from "@/components/aula-virtual/verificacion-circulares-card"

interface Campamento {
  id: number
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  lugar: string
  tipo: string
}

export default function VerificacionCircularesPage() {
  const { token, user } = useAuth()
  const [campamentos, setCampamentos] = useState<Campamento[]>([])
  const [selectedCampamento, setSelectedCampamento] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar lista de campamentos
  useEffect(() => {
    const fetchCampamentos = async () => {
      if (!token) return

      try {
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/api/actividades?tipo=campamento&proximos=true`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error('Error al cargar campamentos')

        const data = await res.json()
        const camps = data.data || data || []
        setCampamentos(camps)

        // Seleccionar el primero por defecto si hay alguno
        if (camps.length > 0) {
          setSelectedCampamento(camps[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchCampamentos()
  }, [token])

  const selectedCampamentoData = campamentos.find(c => c.id === selectedCampamento)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/aula-virtual">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Verificación de Circulares
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            Revisa y verifica las circulares firmadas de los campamentos
          </p>
        </div>
      </div>

      {/* Selector de campamento */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Cargando campamentos...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="font-medium text-red-800">Error al cargar campamentos</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : campamentos.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Tent className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">No hay campamentos próximos</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Cuando se creen campamentos, podrás verificar las circulares firmadas aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selecciona un campamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCampamento?.toString() || ''}
                onValueChange={(value) => setSelectedCampamento(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[400px]">
                  <SelectValue placeholder="Selecciona un campamento" />
                </SelectTrigger>
                <SelectContent>
                  {campamentos.map((campamento) => (
                    <SelectItem key={campamento.id} value={campamento.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Tent className="h-4 w-4" />
                        <span>{campamento.titulo}</span>
                        <span className="text-muted-foreground text-xs">
                          ({new Date(campamento.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Panel de verificación */}
          {selectedCampamento && (
            <VerificacionCircularesCard
              actividadId={selectedCampamento}
              actividadTitulo={selectedCampamentoData?.titulo}
              seccionId={user?.seccion_id}
            />
          )}
        </>
      )}
    </div>
  )
}
