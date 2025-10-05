"use client";

/**
 * EditableImage - Componente para edición de imágenes
 * Permite cambiar imágenes mediante upload
 */

import React, { useState, useRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiUrl, apiEndpoint } from '@/lib/api-utils';

interface EditableImageProps {
  // Identificación
  contentId: number;
  identificador: string;
  seccion?: string;

  // Imagen (puede venir como src o children)
  src?: string;
  alt: string;
  children?: React.ReactNode; // URL de imagen desde API

  // Estilos
  className?: string;
  width?: number;
  height?: number;

  // Callbacks
  onUpload?: (newUrl: string) => void;
  onError?: (error: string) => void;

  // Configuración
  maxSize?: number; // En MB
  allowedTypes?: string[];
}

export function EditableImage({
  contentId,
  identificador,
  seccion,
  src,
  alt,
  children,
  className = '',
  width,
  height,
  onUpload,
  onError,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
}: EditableImageProps) {
  const { isEditMode, canEdit, addPendingChange } = useEditMode();

  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener src: prioridad a children (desde API) sobre prop src (fallback)
  const rawImageSrc = (children?.toString() || src || '') as string;

  // Si la imagen viene de uploads (path relativo), usar la URL del backend
  const imageSrc = rawImageSrc.startsWith('/uploads/')
    ? `${getApiUrl()}${rawImageSrc}`
    : rawImageSrc;

  // Validar archivo
  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Permitidos: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    // Validar tamaño
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      return `El archivo es demasiado grande. Máximo ${maxSize}MB (actual: ${sizeInMB.toFixed(2)}MB)`;
    }

    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onError) onError(validationError);
      return;
    }

    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    await uploadFile(file);
  };

  // Subir archivo al servidor
  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      // Obtener token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('image', file);

      // Subir
      const url = apiEndpoint('/api/content/upload');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir imagen');
      }

      const data = await response.json();
      const newUrl = data.url;

      // Añadir cambio pendiente
      addPendingChange({
        id: `${seccion || 'page'}-${identificador}`,
        contentId,
        tipo: 'imagen',
        contenido: newUrl,
        metadata: {
          alt,
          filename: data.filename,
          size: data.size,
          mimetype: data.mimetype
        },
        timestamp: Date.now()
      });

      // Callback
      if (onUpload) {
        onUpload(newUrl);
      }

      console.log(`🖼️ Imagen subida: ${identificador} = ${newUrl}`);

    } catch (error: any) {
      const errorMsg = error.message || 'Error al subir imagen';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      console.error('Error al subir imagen:', error);

    } finally {
      setIsUploading(false);
    }
  };

  // Manejar click en cambiar imagen
  const handleChangeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Cancelar preview
  const handleCancelPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // URL de la imagen a mostrar (preview > imageSrc desde API/children > src fallback)
  const displaySrc = preview || imageSrc;

  return (
    <div className={cn('relative group', className)}>
      {/* Imagen */}
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-all duration-200',
          isEditMode && canEdit && 'hover:opacity-80',
          preview && 'ring-2 ring-blue-500',
          className
        )}
      />

      {/* Overlay de edición */}
      {isEditMode && canEdit && (
        <div className={cn(
          'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200',
          'flex items-center justify-center',
          'cursor-pointer'
        )}
        onClick={handleChangeClick}
        >
          <div className="text-white text-center">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">
              {isUploading ? 'Subiendo...' : 'Cambiar imagen'}
            </div>
            <div className="text-xs opacity-75">
              Max {maxSize}MB
            </div>
          </div>
        </div>
      )}

      {/* Input de archivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={!isEditMode || !canEdit || isUploading}
      />

      {/* Indicador de preview/cambio pendiente */}
      {preview && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
          <ImageIcon className="w-3 h-3" />
          Nueva imagen
          <button
            onClick={handleCancelPreview}
            className="hover:bg-blue-600 rounded-full p-0.5 transition-colors"
            title="Cancelar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Indicador de carga */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm">Subiendo imagen...</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white px-3 py-2 rounded text-xs">
          <div className="flex items-start gap-2">
            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="hover:bg-red-600 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Indicador de modo edición */}
      {isEditMode && canEdit && !isUploading && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-500 text-white p-1.5 rounded-full">
            <Upload className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
