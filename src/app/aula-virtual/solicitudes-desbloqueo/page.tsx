'use client';

/**
 * Página: Solicitudes de Desbloqueo
 *
 * Panel para que los scouters gestionen las solicitudes
 * de familias para desbloquear el límite de 24h.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Unlock,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  MessageSquare,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useSolicitudesDesbloqueo, type SolicitudDesbloqueo } from '@/hooks/useSolicitudesDesbloqueo';
import { useAuth } from '@/hooks/useAuth';

export default function SolicitudesDesbloqueoPage() {
  const { user } = useAuth();
  const {
    solicitudes,
    pendientes,
    loading,
    error,
    cargarSolicitudes,
    aprobar,
    rechazar,
    limpiarError,
    refrescar
  } = useSolicitudesDesbloqueo();

  // Estado local
  const [tabActiva, setTabActiva] = useState('pendientes');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudDesbloqueo | null>(null);
  const [modalAbierto, setModalAbierto] = useState<'aprobar' | 'rechazar' | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Cargar solicitudes al montar
  useEffect(() => {
    if (user?.seccion_id) {
      cargarSolicitudes(user.seccion_id);
    }
  }, [user?.seccion_id]);

  // Filtrar solicitudes por estado según tab
  const solicitudesFiltradas = solicitudes.filter(s => {
    if (tabActiva === 'pendientes') return s.estado === 'pendiente';
    if (tabActiva === 'aprobadas') return s.estado === 'aprobada';
    if (tabActiva === 'rechazadas') return s.estado === 'rechazada';
    return true;
  });

  // Manejar aprobación
  const handleAprobar = async () => {
    if (!solicitudSeleccionada) return;

    setProcesando(true);
    const exito = await aprobar(solicitudSeleccionada.id, respuesta);
    setProcesando(false);

    if (exito) {
      setModalAbierto(null);
      setSolicitudSeleccionada(null);
      setRespuesta('');
    }
  };

  // Manejar rechazo
  const handleRechazar = async () => {
    if (!solicitudSeleccionada || !respuesta.trim()) return;

    setProcesando(true);
    const exito = await rechazar(solicitudSeleccionada.id, respuesta);
    setProcesando(false);

    if (exito) {
      setModalAbierto(null);
      setSolicitudSeleccionada(null);
      setRespuesta('');
    }
  };

  // Abrir modal de aprobación
  const abrirModalAprobar = (solicitud: SolicitudDesbloqueo) => {
    setSolicitudSeleccionada(solicitud);
    setRespuesta('');
    setModalAbierto('aprobar');
  };

  // Abrir modal de rechazo
  const abrirModalRechazar = (solicitud: SolicitudDesbloqueo) => {
    setSolicitudSeleccionada(solicitud);
    setRespuesta('');
    setModalAbierto('rechazar');
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar badge de estado
  const renderEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'aprobada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Aprobada</Badge>;
      case 'rechazada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Unlock className="h-6 w-6 text-blue-600" />
            Solicitudes de Desbloqueo
          </h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de familias para desbloquear documentos
          </p>
        </div>
        <Button variant="outline" onClick={refrescar} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contador de pendientes */}
      {pendientes > 0 && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-700">
            {pendientes} solicitud{pendientes !== 1 ? 'es' : ''} pendiente{pendientes !== 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-yellow-600">
            Las familias están esperando tu respuesta para poder actualizar sus documentos.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="mb-4">
          <TabsTrigger value="pendientes" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendientes
            {pendientes > 0 && (
              <Badge variant="destructive" className="ml-1">{pendientes}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprobadas" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprobadas
          </TabsTrigger>
          <TabsTrigger value="rechazadas" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rechazadas
          </TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value={tabActiva}>
          {loading && solicitudes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </CardContent>
            </Card>
          ) : solicitudesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lock className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No hay solicitudes {tabActiva !== 'todas' ? tabActiva : ''}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {solicitudesFiltradas.map((solicitud) => (
                <Card key={solicitud.id} className={
                  solicitud.estado === 'pendiente' ? 'border-yellow-200' :
                  solicitud.estado === 'aprobada' ? 'border-green-200' :
                  'border-red-200'
                }>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      {/* Info de la solicitud */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{solicitud.titulo_documento}</span>
                          {renderEstadoBadge(solicitud.estado)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {solicitud.educando_nombre} {solicitud.educando_apellidos}
                          </span>
                          <span>|</span>
                          <span>
                            Solicitado por: {solicitud.familiar_nombre} {solicitud.familiar_apellidos}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatearFecha(solicitud.fecha_solicitud)}
                        </p>

                        {solicitud.motivo && (
                          <div className="bg-gray-50 p-3 rounded-lg mt-2">
                            <p className="text-sm text-gray-600">
                              <MessageSquare className="h-3 w-3 inline mr-1" />
                              <strong>Motivo:</strong> {solicitud.motivo}
                            </p>
                          </div>
                        )}

                        {solicitud.respuesta_scouter && (
                          <div className={`p-3 rounded-lg mt-2 ${
                            solicitud.estado === 'aprobada' ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            <p className={`text-sm ${
                              solicitud.estado === 'aprobada' ? 'text-green-700' : 'text-red-700'
                            }`}>
                              <strong>Tu respuesta:</strong> {solicitud.respuesta_scouter}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      {solicitud.estado === 'pendiente' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => abrirModalAprobar(solicitud)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => abrirModalRechazar(solicitud)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Aprobación */}
      <Dialog open={modalAbierto === 'aprobar'} onOpenChange={(open) => !open && setModalAbierto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Aprobar Solicitud
            </DialogTitle>
            <DialogDescription>
              Esto permitirá al familiar subir una nueva versión del documento "{solicitudSeleccionada?.titulo_documento}" inmediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="respuesta-aprobar">Mensaje para la familia (opcional)</Label>
              <Textarea
                id="respuesta-aprobar"
                placeholder="Ej: Adelante, puedes subir la versión corregida."
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAbierto(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAprobar}
              disabled={procesando}
            >
              {procesando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rechazo */}
      <Dialog open={modalAbierto === 'rechazar'} onOpenChange={(open) => !open && setModalAbierto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Rechazar Solicitud
            </DialogTitle>
            <DialogDescription>
              Debes proporcionar un motivo para que la familia entienda por qué no puede subir una nueva versión ahora.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="respuesta-rechazar">Motivo del rechazo *</Label>
              <Textarea
                id="respuesta-rechazar"
                placeholder="Ej: El documento actual es válido. Por favor, espera a que venza para subir una nueva versión."
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={3}
                required
              />
              {!respuesta.trim() && (
                <p className="text-xs text-red-500">El motivo es obligatorio</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAbierto(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRechazar}
              disabled={procesando || !respuesta.trim()}
            >
              {procesando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
