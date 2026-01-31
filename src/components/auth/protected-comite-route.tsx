'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedComiteRouteProps {
  children: React.ReactNode
}

export function ProtectedComiteRoute({ children }: ProtectedComiteRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    const userRoles = user.roles || [user.rol]
    if (userRoles.includes('comite') || userRoles.includes('admin')) {
      setIsAuthorized(true)
    } else {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, user, authLoading, router])

  if (authLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-green-700" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Verificando acceso</h3>
            <p className="text-base text-gray-600 text-center mt-2">
              Comprobando permisos del panel de comité...
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Verificando identidad</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) return null

  return <>{children}</>
}

export default ProtectedComiteRoute
