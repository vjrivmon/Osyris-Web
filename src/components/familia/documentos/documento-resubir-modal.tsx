'use client';

/**
 * Modal: DocumentoResubirModal
 *
 * Modal para subir una nueva versión de un documento.
 * Incluye:
 * - Verificación de límite 24h
 * - Instrucciones según tipo de documento
 * - Selector de archivo
 * - Opción de solicitar desbloqueo
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Clock,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Send,
  Loader2,
  Info,
  Camera,
  FileUp
} from 'lucide-react';
import { useDocumentoResubida, type LimiteSubidaResult, type TipoDocumentoConfig } from '@/hooks/useDocumentoResubida';

// Tipos
interface DocumentoParaResubir {
  id: number;
  titulo: string;
  tipo_documento: string;
  estado?: string;
  estado_revision?: string;
  archivo_nombre?: string;
  educando_id: number;
  educando_nombre?: string;
}

interface DocumentoResubirModalProps {
  isOpen: boolean;
  onClose: () => void;
  documento: DocumentoParaResubir | null;
  onSuccess?: () => void;
}

// Estados del modal
type ModalState = 'loading' | 'can_upload' | 'blocked' | 'uploading' | 'success' | 'error' | 'requesting_unlock';

export function DocumentoResubirModal({
  isOpen,
  onClose,
  documento,
  onSuccess
}: DocumentoResubirModalProps) {
  const {
    loading,
    error,
    limiteInfo,
    tipoConfig,
    verificarLimiteByTipo,
    subirDocumentoByTipo,
    solicitarDesbloqueo,
    obtenerConfigTipo,
    limpiarError,
    formatearTiempoRestante
  } = useDocumentoResubida();

  // Estado local
  const [modalState, setModalState] = useState<ModalState>('loading');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [motivoDesbloqueo, setMotivoDesbloqueo] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar información al abrir
  useEffect(() => {
    if (isOpen && documento) {
      loadInfo();
    } else {
      // Reset al cerrar
      setModalState('loading');
      setSelectedFile(null);
      setMotivoDesbloqueo('');
      setUploadProgress(0);
      setSuccessMessage('');
      limpiarError();
    }
  }, [isOpen, documento]);

  const loadInfo = async () => {
    if (!documento || !documento.educando_id) return;

    setModalState('loading');
    limpiarError();

    // Cargar límite usando educando_id y tipo (más confiable que el ID del documento)
    const [limite, config] = await Promise.all([
      verificarLimiteByTipo(documento.educando_id, documento.tipo_documento),
      obtenerConfigTipo(documento.tipo_documento)
    ]);

    if (limite) {
      setModalState(limite.puedeSubir ? 'can_upload' : 'blocked');
    } else {
      setModalState('error');
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo (PDF o imagen)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecciona un archivo PDF o imagen (JPG, PNG, WEBP)');
        return;
      }
      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  // Subir documento
  const handleUpload = async () => {
    if (!documento || !selectedFile || !documento.educando_id) return;

    setModalState('uploading');
    setUploadProgress(10);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    // Usar subirDocumentoByTipo con educandoId y tipoDocumento
    const success = await subirDocumentoByTipo(
      documento.educando_id,
      documento.tipo_documento,
      selectedFile
    );

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (success) {
      setSuccessMessage('Documento subido correctamente. El scouter lo revisará pronto.');
      setModalState('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } else {
      setModalState('error');
    }
  };

  // Solicitar desbloqueo
  const handleSolicitarDesbloqueo = async () => {
    if (!documento) return;

    setModalState('requesting_unlock');

    const solicitud = await solicitarDesbloqueo(documento.id, motivoDesbloqueo);

    if (solicitud) {
      setSuccessMessage('Solicitud enviada. El scouter de sección será notificado.');
      setModalState('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setModalState('blocked');
    }
  };

  // Renderizar contenido según estado
  const renderContent = () => {
    switch (modalState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Verificando estado del documento...</p>
          </div>
        );

      case 'can_upload':
        return renderUploadForm();

      case 'blocked':
        return renderBlockedState();

      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Subiendo documento...</p>
            <Progress value={uploadProgress} className="w-full mt-4" />
            <p className="mt-2 text-xs text-gray-400">{uploadProgress}%</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="mt-4 text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-600" />
            <p className="mt-4 text-sm text-red-700 font-medium">{error || 'Ha ocurrido un error'}</p>
            <Button variant="outline" className="mt-4" onClick={loadInfo}>
              Reintentar
            </Button>
          </div>
        );

      case 'requesting_unlock':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Enviando solicitud de desbloqueo...</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Formulario de subida
  const renderUploadForm = () => (
    <div className="space-y-4">
      {/* Instrucciones según tipo */}
      {renderInstrucciones()}

      {/* Selector de archivo */}
      <div className="space-y-2">
        <Label htmlFor="archivo">Seleccionar archivo</Label>
        <div className="flex items-center gap-2">
          <input
            id="archivo"
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('archivo')?.click()}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Formatos aceptados: PDF, JPG, PNG, WEBP. Máximo 10MB.
        </p>
      </div>

      {/* Vista previa si es imagen */}
      {selectedFile && selectedFile.type.startsWith('image/') && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Vista previa:</p>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Vista previa"
            className="max-h-48 rounded-lg border"
          />
        </div>
      )}

      {/* Info de versión actual */}
      {limiteInfo && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Versión actual: {limiteInfo.versionActual}.
            {limiteInfo.tieneVersionAnterior && ' Si el scouter rechaza esta versión, se restaurará la anterior.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Estado bloqueado (límite alcanzado)
  const renderBlockedState = () => (
    <div className="space-y-4">
      <Alert variant="destructive" className="bg-orange-50 border-orange-300">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-700">Límite de subida alcanzado</AlertTitle>
        <AlertDescription className="text-orange-600">
          Ya has subido una versión de este documento hoy.
          {limiteInfo?.tiempoRestante && (
            <span className="block mt-1">
              Podrás volver a subir en: <strong>{formatearTiempoRestante(limiteInfo.tiempoRestante)}</strong>
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Formulario de solicitud de desbloqueo */}
      <div className="space-y-2 pt-4 border-t">
        <p className="text-sm font-medium">
          ¿Necesitas subir urgentemente una corrección?
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Puedes solicitar al scouter de sección que desbloquee el documento para que puedas subir una nueva versión.
        </p>

        <Label htmlFor="motivo">Motivo (opcional)</Label>
        <Textarea
          id="motivo"
          placeholder="Explica por qué necesitas subir una nueva versión..."
          value={motivoDesbloqueo}
          onChange={(e) => setMotivoDesbloqueo(e.target.value)}
          rows={3}
        />

        <Button
          className="w-full mt-2"
          variant="outline"
          onClick={handleSolicitarDesbloqueo}
          disabled={loading}
        >
          <Send className="h-4 w-4 mr-2" />
          Solicitar desbloqueo
        </Button>
      </div>
    </div>
  );

  // Instrucciones según tipo de documento
  const renderInstrucciones = () => {
    if (!tipoConfig) return null;

    // Documentos con plantilla
    if (tipoConfig.tienePlantilla && tipoConfig.plantilla) {
      return (
        <Alert className="bg-green-50 border-green-200">
          <FileText className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Este documento tiene plantilla</AlertTitle>
          <AlertDescription className="text-green-600">
            <p className="mb-2">Descarga la plantilla, rellénala y súbela completada.</p>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => window.open(tipoConfig.plantilla!, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar plantilla
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    // Documentos que requieren foto (DNI, SIP, Cartilla)
    if (tipoConfig.requiereTutorial) {
      return (
        <Alert className="bg-purple-50 border-purple-200">
          <Camera className="h-4 w-4 text-purple-600" />
          <AlertTitle className="text-purple-700">Consejos para la foto</AlertTitle>
          <AlertDescription className="text-purple-600">
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Coloca el documento sobre una superficie plana y clara</li>
              <li>Asegúrate de tener buena iluminación, sin reflejos</li>
              <li>Captura el documento completo, sin cortar los bordes</li>
              <li>No cubras ningún dato con los dedos</li>
              <li>La imagen debe ser nítida y legible</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Subir nueva versión
          </DialogTitle>
          <DialogDescription>
            {documento?.titulo}
            {documento?.educando_nombre && (
              <span className="block text-xs mt-1">
                Para: {documento.educando_nombre}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>

        {modalState === 'can_upload' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Subir documento
            </Button>
          </DialogFooter>
        )}

        {(modalState === 'blocked' || modalState === 'error') && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DocumentoResubirModal;
