'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'scouter' | 'coordinador' | 'padre' | 'educando';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('osyris_user');
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(savedUser);

        // Verificar si el usuario tiene el rol requerido
        if (requiredRole && userData.rol !== requiredRole) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('osyris_user');
        localStorage.removeItem('token');
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  useEffect(() => {
    if (isAuthorized === false) {
      router.push(redirectTo);
    }
  }, [isAuthorized, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Verificando permisos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-sm text-muted-foreground text-center">
              No tienes permisos para acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}