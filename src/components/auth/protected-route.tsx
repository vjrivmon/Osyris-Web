'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Loader2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'kraal' | 'jefe_seccion' | 'familia' | 'educando' | 'comite';
  allowedRoles?: string[];
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
 *
 * Soporta:
 * - requiredRole: rol exacto requerido (legacy, compatibilidad)
 * - allowedRoles: array de roles permitidos (nuevo sistema IAM)
 * - superadmin siempre tiene acceso total
 */
export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, token, isLoading, authReady, isAuthenticated, sessionExpired } = useAuth();
  const router = useRouter();

  // Verificar si el usuario tiene acceso
  const hasAccess = (): boolean => {
    if (!user) return false;

    const userRoles = user.roles || [user.rol];

    // superadmin siempre tiene acceso total
    if (userRoles.includes('superadmin')) return true;

    // Si se especifican allowedRoles, verificar contra ellos
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.some(role => userRoles.includes(role));
    }

    // Fallback a requiredRole (compatibilidad)
    if (requiredRole) {
      return userRoles.includes(requiredRole);
    }

    // Sin restriccion de rol
    return true;
  };

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

    // Si no tiene acceso
    if (!hasAccess()) {
      console.log(`[ProtectedRoute] Acceso denegado. Rol: ${user?.rol}, Roles: ${user?.roles}`);
      router.push(redirectTo);
    }
  }, [authReady, isAuthenticated, token, user?.rol, requiredRole, allowedRoles, router, redirectTo]);

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

  // Si no tiene acceso, mostrar acceso denegado
  if (!hasAccess()) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
