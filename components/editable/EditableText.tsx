"use client";

/**
 * EditableText - Componente para edición inline de texto
 * Muestra texto normal, pero permite editarlo cuando el modo edición está activo
 */

import React, { useState, useRef, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  // Identificación
  contentId: number;
  identificador: string;
  seccion?: string;

  // Contenido
  children: string;
  defaultValue?: string;

  // Tipo de elemento HTML
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

  // Estilos
  className?: string;
  editClassName?: string;

  // Callbacks
  onSave?: (newContent: string) => void;
  onCancel?: () => void;

  // Configuración
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export function EditableText({
  contentId,
  identificador,
  seccion,
  children,
  defaultValue,
  as: Component = 'p',
  className = '',
  editClassName = '',
  onSave,
  onCancel,
  multiline = false,
  maxLength,
  placeholder = 'Escribe aquí...'
}: EditableTextProps) {
  const { isEditMode, canEdit, addPendingChange } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(children || defaultValue || '');
  const [originalValue, setOriginalValue] = useState(children || defaultValue || '');
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Actualizar valor cuando cambian los children
  useEffect(() => {
    setValue(children || defaultValue || '');
    setOriginalValue(children || defaultValue || '');
  }, [children, defaultValue]);

  // Focus automático al entrar en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Seleccionar todo el texto
      inputRef.current.select();
    }
  }, [isEditing]);

  // Salir del modo edición si se desactiva el modo general
  useEffect(() => {
    if (!isEditMode && isEditing) {
      handleCancel();
    }
  }, [isEditMode]);

  // Handlers
  const handleStartEdit = () => {
    if (!isEditMode || !canEdit) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (value === originalValue) {
      // No hay cambios
      setIsEditing(false);
      return;
    }

    // Añadir cambio pendiente
    addPendingChange({
      id: `${seccion || 'page'}-${identificador}`,
      contentId,
      tipo: 'texto',
      contenido: value,
      metadata: {},
      timestamp: Date.now()
    });

    // Callback externo
    if (onSave) {
      onSave(value);
    }

    setOriginalValue(value);
    setIsEditing(false);

    console.log(`✏️ Cambio pendiente: ${identificador} = "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
  };

  const handleCancel = () => {
    setValue(originalValue);
    setIsEditing(false);

    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter guarda en modo multiline
      e.preventDefault();
      handleSave();
    }
  };

  // Si está en modo edición y editando
  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            className={cn(
              'w-full p-2 border-2 border-blue-500 rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-blue-300',
              'bg-white dark:bg-gray-800',
              'text-inherit font-inherit',
              'resize-y min-h-[100px]',
              editClassName
            )}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            className={cn(
              'w-full p-2 border-2 border-blue-500 rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-blue-300',
              'bg-white dark:bg-gray-800',
              'text-inherit font-inherit',
              editClassName
            )}
          />
        )}

        {/* Botones de acción */}
        <div className="absolute -right-2 -top-2 flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border">
          <button
            onClick={handleSave}
            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
            title="Guardar (Enter o Ctrl+Enter)"
          >
            <Check className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
            title="Cancelar (Escape)"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>

        {/* Contador de caracteres */}
        {maxLength && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {value.length} / {maxLength}
          </div>
        )}

        {/* Ayuda */}
        <div className="text-xs text-gray-500 mt-1">
          {multiline ? 'Ctrl+Enter para guardar, Escape para cancelar' : 'Enter para guardar, Escape para cancelar'}
        </div>
      </div>
    );
  }

  // Modo normal (no editando)
  return (
    <Component
      onClick={handleStartEdit}
      className={cn(
        className,
        isEditMode && canEdit && 'cursor-pointer',
        isEditMode && canEdit && 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-blue-400',
        isEditMode && canEdit && 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
        isEditMode && canEdit && 'transition-all duration-200',
        isEditMode && canEdit && 'relative group'
      )}
    >
      {value || placeholder}

      {/* Indicador de edición */}
      {isEditMode && canEdit && (
        <span className="absolute -right-6 -top-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="w-4 h-4 text-blue-500" />
        </span>
      )}
    </Component>
  );
}
