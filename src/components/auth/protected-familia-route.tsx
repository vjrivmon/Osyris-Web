'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Shield, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedFamiliaRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallbackUrl?: string
  requireExactRole?: boolean
}

export function ProtectedFamiliaRoute({
  children,
  redirectTo = '/login',
  fallbackUrl = '/dashboard',
  requireExactRole = false
}: ProtectedFamiliaRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    const checkAuthorization = async () => {
      // Esperar a que termine la carga de autenticación
      if (authLoading) return

      try {
        setIsLoading(true)
        setErrorMessage(null)

        // Verificar si el usuario está autenticado
        if (!isAuthenticated || !user) {
          console.log('🔒 Usuario no autenticado, redirigiendo a login')
          setIsAuthorized(false)
          setErrorMessage('Debes iniciar sesión para acceder a esta sección')
          return
        }

        // Verificar rol del usuario
        const tieneRolFamilia = (user.roles || [user.rol]).includes('familia')

        if (!tieneRolFamilia) {
          console.log('🚫 Usuario no tiene rol de familia:', user.rol)
          setIsAuthorized(false)
          setErrorMessage(`Esta sección está disponible solo para familiares. Tu rol actual es: ${user.rol}`)
          return
        }

        // Verificar estado del usuario
        if (user.activo === false) {
          console.log('🚫 Usuario inactivo')
          setIsAuthorized(false)
          setErrorMessage('Tu cuenta está inactiva. Contacta con el administrador.')
          return
        }

        // Verificar si el usuario tiene hijos vinculados (importante para dashboard)
        if (typeof window !== 'undefined') {
          try {
            const response = await fetch('/api/familia/hijos', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const hijos = await response.json()
              if (hijos.length === 0) {
                console.log('⚠️ Usuario no tiene hijos vinculados')
                // Permitir acceso pero mostrar advertencia
                setErrorMessage('No tienes hijos vinculados. Contacta con el grupo scout para vincular a tus hijos.')
              }
            }
          } catch (error) {
            console.warn('No se pudo verificar hijos vinculados:', error)
            // No bloquear el acceso por este error
          }
        }

        // Si pasa todas las validaciones, autorizar
        console.log('✅ Usuario autorizado para acceder a sección familiar')
        setIsAuthorized(true)
        setErrorMessage(null)

      } catch (error) {
        console.error('Error checking authorization:', error)
        setIsAuthorized(false)
        setErrorMessage('Error al verificar permisos. Por favor, recarga la página.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [isAuthenticated, user, authLoading, requireExactRole])

  useEffect(() => {
    if (isAuthorized === false) {
      // Redirigir después de un pequeño retraso para mostrar el mensaje de error
      const timer = setTimeout(() => {
        // Guardar la URL a la que intentaba acceder para redirigir después del login
        if (typeof window !== 'undefined') {
          const currentUrl = window.location.pathname
          if (currentUrl !== redirectTo) {
            sessionStorage.setItem('redirectAfterLogin', currentUrl)
          }
        }
        router.push(redirectTo)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isAuthorized, router, redirectTo])

  // Mientras se carga la autenticación
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <div className="absolute inset-0 h-12 w-12 animate-ping bg-green-600 rounded-full opacity-20"></div>
            </div>
            <h3 className="mt-4 text-lg font-semibold">Verificando acceso</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Estamos validando tus permisos para acceder al portal de familias...
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Verificando identidad</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>Validando rol familiar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no está autorizado
  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Acceso Restringido</CardTitle>
            <CardDescription>
              Esta sección está disponible solo para familiares de scouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full"
              >
                Iniciar Sesión como Familiar
              </Button>
              
              {user && user.rol !== 'familia' && (
                <Button
                  onClick={() => router.push(fallbackUrl)}
                  variant="outline"
                  className="w-full"
                >
                  Ir a mi Panel ({user.rol})
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Necesitas ayuda?
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/contacto')}
              >
                Contactar Soporte
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>Serás redirigido automáticamente en 3 segundos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si está autorizado, mostrar el contenido
  return <>{children}</>
}

// Componente de carga específico para páginas familiares
export function FamiliaLoadingState({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-green-600 rounded-full opacity-20"></div>
          </div>
          <h3 className="mt-4 text-lg font-semibold">Portal de Familias</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {message || 'Cargando información familiar...'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook personalizado para verificar permisos de familia
export function useFamiliaAuth() {
  const { user, isAuthenticated } = useAuth()
  const [isFamilia, setIsFamilia] = useState(false)
  const [hasHijos, setHasHijos] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkFamiliaAuth = async () => {
      if (!isAuthenticated || !user) {
        setIsFamilia(false)
        setHasHijos(false)
        setLoading(false)
        return
      }

      const tieneRolFamilia = (user.roles || [user.rol]).includes('familia')
      setIsFamilia(tieneRolFamilia)

      if (tieneRolFamilia) {
        try {
          const response = await fetch('/api/familia/hijos', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const hijos = await response.json()
            setHasHijos(hijos.length > 0)
          }
        } catch (error) {
          console.error('Error checking hijos:', error)
          setHasHijos(false)
        }
      }

      setLoading(false)
    }

    checkFamiliaAuth()
  }, [isAuthenticated, user])

  return {
    isFamilia,
    hasHijos,
    loading,
    user
  }
}

// Componente wrapper para páginas específicas que requieren hijos vinculados
export function RequireHijosVinculados({ children }: { children: React.ReactNode }) {
  const { isFamilia, hasHijos, loading } = useFamiliaAuth()
  const router = useRouter()

  if (loading) {
    return <FamiliaLoadingState message="Verificando información familiar..." />
  }

  if (!isFamilia) {
    return (
      <ProtectedFamiliaRoute>
        {children}
      </ProtectedFamiliaRoute>
    )
  }

  if (!hasHijos) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-800">No hay hijos vinculados</CardTitle>
            <CardDescription>
              Aún no tienes scouts vinculados a tu cuenta familiar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Para acceder a esta funcionalidad necesitas tener al menos un scout vinculado a tu cuenta.
                Contacta con el coordinador de tu sección o el administrador del grupo para vincular a tus hijos.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/familia/dashboard')} 
                className="w-full"
              >
                Ir al Dashboard
              </Button>
              
              <Button 
                onClick={() => router.push('/contacto')} 
                variant="outline"
                className="w-full"
              >
                Contactar Administrador
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedFamiliaRoute