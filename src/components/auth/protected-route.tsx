'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Loader2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'scouter' | 'coordinador' | 'padre' | 'educando' | 'familia';
  redirectTo?: string;
}

/**
 * Componente de pantalla de carga
 */
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente de mensaje de sesion expirada
 */
function SessionExpiredMessage({ onRedirect }: { onRedirect: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRedirect, 3000);
    return () => clearTimeout(timer);
  }, [onRedirect]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Clock className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sesion expirada</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Tu sesion ha expirado. Seras redirigido al login en unos segundos.
          </p>
          <Button onClick={onRedirect}>Ir a login ahora</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente de acceso denegado
 */
function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-sm text-muted-foreground text-center">
            No tienes permisos para acceder a esta seccion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * ProtectedRoute - Componente que protege rutas basandose en autenticacion
 *
 * IMPORTANTE: Este componente usa AuthContext para sincronizarse con el estado
 * de autenticacion. NO lee localStorage directamente para evitar race conditions
 * despues del login.
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, token, isLoading, authReady, isAuthenticated, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que auth este listo antes de tomar decisiones
    if (!authReady) {
      console.log('[ProtectedRoute] Esperando a que authReady sea true...');
      return;
    }

    // Si no hay sesion, redirigir a login
    if (!isAuthenticated || !token) {
      console.log('[ProtectedRoute] No autenticado, redirigiendo a login');
      router.push(redirectTo);
      return;
    }

    // Si hay rol requerido y no coincide
    if (requiredRole && user?.rol !== requiredRole) {
      console.log(`[ProtectedRoute] Rol requerido: ${requiredRole}, rol actual: ${user?.rol}`);
      router.push(redirectTo);
    }
  }, [authReady, isAuthenticated, token, user?.rol, requiredRole, router, redirectTo]);

  // Mostrar loading mientras auth no esta listo
  if (!authReady || isLoading) {
    return <LoadingScreen message="Verificando sesion..." />;
  }

  // Mostrar mensaje si sesion expiro
  if (sessionExpired) {
    return <SessionExpiredMessage onRedirect={() => router.push('/login')} />;
  }

  // Si no autenticado, mostrar loading (se esta redirigiendo)
  if (!isAuthenticated || !token) {
    return <LoadingScreen message="Redirigiendo a login..." />;
  }

  // Si hay rol requerido y no coincide, mostrar acceso denegado
  if (requiredRole && user?.rol !== requiredRole) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
