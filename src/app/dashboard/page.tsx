'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Users, Tent, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener usuario del localStorage
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(userStr)
    setUser(userData)

    // Si es admin, redirigir al panel de administración
    if (userData.rol === 'admin') {
      router.replace('/admin/dashboard')
      return
    }

    // Si es comite, redirigir al panel de comite
    if (userData.rol === 'comite') {
      router.replace('/comite/dashboard')
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cargando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            ¡Bienvenido, {user?.nombre}! 🏕️
          </h1>
          <p className="text-muted-foreground">
            Panel de Scout - Grupo Scout Osyris
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Calendario</CardTitle>
                  <CardDescription>Ver actividades programadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/calendario">
                  Ver calendario
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Documentos</CardTitle>
                  <CardDescription>Acceso a documentación</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/aula-virtual/documentos">
                  Ver documentos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mi Sección</CardTitle>
                  <CardDescription>Información de mi sección</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/secciones">
                  Ver secciones
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Tent className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Actividades</CardTitle>
                  <CardDescription>Gestión de actividades</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/calendario">
                  Ver actividades
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Comunicaciones</CardTitle>
                  <CardDescription>Mensajes y notificaciones</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/aula-virtual">
                  Ver comunicaciones
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Aula Virtual</CardTitle>
                  <CardDescription>Acceso al aula virtual</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
                <Link href="/aula-virtual">
                  Ir al aula
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido al Sistema Osyris</CardTitle>
            <CardDescription>
              Desde aquí puedes acceder a todas las funcionalidades del sistema scout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Utiliza los accesos directos de arriba para navegar rápidamente a las diferentes secciones del sistema.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/calendario">Ver Calendario</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/aula-virtual">Ir al Aula Virtual</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}