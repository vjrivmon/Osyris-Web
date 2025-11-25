"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User, Bell, CheckCircle, XCircle, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NotificacionFamilia {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  categoria?: string
  leida: boolean
  fecha_creacion: string
  metadata?: {
    tipo?: string
    motivo_rechazo?: string
  }
}

export default function FamiliaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionFamilia[]>([]);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleLogout = () => {
    localStorage.removeItem("osyris_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Cargar notificaciones
  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/api/notificaciones-familia?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNotificaciones(data.data || []);
            setContadorNoLeidas(data.data?.filter((n: NotificacionFamilia) => !n.leida).length || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching notificaciones:', err);
      }
    };

    fetchNotificaciones();
    // Refrescar cada 2 minutos
    const interval = setInterval(fetchNotificaciones, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const marcarComoLeida = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/api/notificaciones-familia/${id}/leida`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setContadorNoLeidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marcando como leída:', err);
    }
  };

  const getNotificacionIcon = (notif: NotificacionFamilia) => {
    if (notif.metadata?.tipo === 'documento_aprobado') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (notif.metadata?.tipo === 'documento_rechazado') {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (notif.categoria === 'documento') {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    return <Bell className="h-4 w-4 text-amber-600" />;
  };

  const getNotificacionBgColor = (notif: NotificacionFamilia) => {
    if (notif.metadata?.tipo === 'documento_aprobado') return 'bg-green-100';
    if (notif.metadata?.tipo === 'documento_rechazado') return 'bg-red-100';
    return 'bg-amber-100';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex items-center justify-between py-3 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-osyris.png"
              alt="Logo Grupo Scout Osyris"
              className="h-8 w-8 rounded-full border-2 border-primary"
            />
            <h1 className="text-lg font-semibold">Portal Familias</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notificaciones */}
            <Popover open={notificacionesOpen} onOpenChange={setNotificacionesOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {contadorNoLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {contadorNoLeidas > 9 ? '9+' : contadorNoLeidas}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b flex items-center justify-between">
                  <h4 className="font-semibold">Notificaciones</h4>
                  {contadorNoLeidas > 0 && (
                    <Badge variant="secondary">{contadorNoLeidas} nuevas</Badge>
                  )}
                </div>
                <ScrollArea className="h-[350px]">
                  {notificaciones.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notificaciones.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 hover:bg-accent cursor-pointer transition-colors ${!notif.leida ? 'bg-blue-50/50' : ''}`}
                          onClick={() => {
                            if (!notif.leida) marcarComoLeida(notif.id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getNotificacionBgColor(notif)}`}>
                              {getNotificacionIcon(notif)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{notif.titulo}</p>
                                {!notif.leida && (
                                  <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notif.mensaje}
                              </p>
                              {notif.metadata?.motivo_rechazo && (
                                <div className="mt-1 p-2 bg-red-50 rounded text-xs text-red-700 border border-red-200">
                                  <strong>Motivo:</strong> {notif.metadata.motivo_rechazo}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.fecha_creacion), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/familia/perfil">
                <User className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
              className="md:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            <button
              onClick={() => setShowLogoutDialog(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Estás a punto de cerrar tu sesión en la plataforma del Grupo Scout Osyris.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowLogoutDialog(false);
                      handleLogout();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cerrar sesión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
