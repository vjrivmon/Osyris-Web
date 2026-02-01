"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  Heart,
  GraduationCap,
  UserPlus,
  ArrowRight,
  Clock,
  Link as LinkIcon,
} from "lucide-react"
import { getAuthToken, makeAuthenticatedRequest, getCurrentUser } from "@/lib/auth-utils"
import { BulkInviteModal } from "@/components/admin/bulk-invite-modal"
import { VincularEducandoModal } from "@/components/admin/familiares/vincular-educando"

interface DashboardStats {
  scouters: number
  familias: number
  educandos: number
}

interface RecentActivity {
  id: number
  nombre: string
  apellidos: string
  seccion?: string
  ultimoAcceso?: string
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({ scouters: 0, familias: 0, educandos: 0 })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [userName, setUserName] = useState("")
  const [showVincularModal, setShowVincularModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
    const user = getCurrentUser()
    if (user?.nombre) {
      setUserName(user.nombre)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      // Cargar usuarios para stats y actividad reciente
      const usersResponse = await makeAuthenticatedRequest('/api/admin/users?limit=200')
      if (usersResponse?.data?.users) {
        const users = usersResponse.data.users

        // Contar solo scouters (rol = 'scouter' o 'admin')
        const scoutersCount = users.filter((u: any) =>
          u.activo && (u.rol === 'scouter' || u.rol === 'admin')
        ).length

        // Actividad reciente: últimos 5 con acceso reciente (solo scouters/admin)
        const recent = users
          .filter((u: any) => u.ultimo_acceso && (u.rol === 'scouter' || u.rol === 'admin'))
          .sort((a: any, b: any) => new Date(b.ultimo_acceso).getTime() - new Date(a.ultimo_acceso).getTime())
          .slice(0, 5)
          .map((u: any) => ({
            id: u.id,
            nombre: u.nombre,
            apellidos: u.apellidos,
            seccion: getSectionName(u.seccion_id),
            ultimoAcceso: u.ultimo_acceso
          }))

        setRecentActivity(recent)
        setStats(prev => ({ ...prev, scouters: scoutersCount }))
      }

      // Cargar stats de familias (endpoint correcto: /api/admin/familiares/estadisticas)
      const familiasResponse = await makeAuthenticatedRequest('/api/admin/familiares/estadisticas')
      if (familiasResponse?.estadisticas) {
        setStats(prev => ({
          ...prev,
          familias: familiasResponse.estadisticas.familiasActivas || 0,
          educandos: familiasResponse.estadisticas.educandosConFamilia || 0
        }))
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSectionName = (seccionId?: number): string => {
    const secciones: Record<number, string> = {
      1: 'Castores', 2: 'Lobatos', 3: 'Tropa', 4: 'Pioneros', 5: 'Rutas'
    }
    return seccionId ? secciones[seccionId] || '' : ''
  }

  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `hace ${diffMins}min`
    if (diffHours < 24) return `hace ${diffHours}h`
    if (diffDays < 7) return `hace ${diffDays}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    loadDashboardData()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Saludo simple */}
      <div>
        <h1 className="text-2xl font-semibold">
          Hola{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Grupo Scout Osyris
        </p>
      </div>

      {/* Stats - 3 números clave */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/admin/users" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 sm:p-6 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.scouters}</p>
              <p className="text-sm text-muted-foreground">Scouters</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/familiares" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 sm:p-6 text-center">
              <Heart className="h-5 w-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.familias}</p>
              <p className="text-sm text-muted-foreground">Familias</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/familiares" className="group">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 sm:p-6 text-center">
              <GraduationCap className="h-5 w-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-3xl sm:text-4xl font-bold">{stats.educandos}</p>
              <p className="text-sm text-muted-foreground">Educandos</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Acciones principales */}
      <div className="grid grid-cols-2 gap-3">
        <BulkInviteModal
          onInvitesSent={handleRefresh}
          trigger={
            <Button size="lg" className="w-full h-14 text-base">
              <UserPlus className="h-5 w-5 mr-2" />
              Invitar Usuario
            </Button>
          }
        />
        <Button
          size="lg"
          variant="outline"
          className="w-full h-14 text-base"
          onClick={() => setShowVincularModal(true)}
        >
          <LinkIcon className="h-5 w-5 mr-2" />
          Enlazar Educando
        </Button>
      </div>

      {/* Actividad reciente - Progressive Disclosure */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Actividad reciente
          </h2>
          <Link
            href="/admin/users"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-2">
            {recentActivity.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.nombre?.charAt(0)}{user.apellidos?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {user.nombre} {user.apellidos}
                    </p>
                    {user.seccion && (
                      <p className="text-xs text-muted-foreground">{user.seccion}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(user.ultimoAcceso)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No hay actividad reciente
          </p>
        )}
      </div>

      {/* Modal de Vinculación */}
      <VincularEducandoModal
        open={showVincularModal}
        onOpenChange={setShowVincularModal}
        onSuccess={() => {
          handleRefresh()
        }}
      />

    </div>
  )
}
