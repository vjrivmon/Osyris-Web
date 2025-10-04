"use client";

/**
 * EditModeToggle - Botón flotante para activar/desactivar modo edición
 * Solo visible para usuarios con permisos (admin/editor)
 */

import React from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Edit3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditModeToggleProps {
  className?: string;
  position?: 'fixed' | 'relative';
}

export function EditModeToggle({
  className = '',
  position = 'fixed'
}: EditModeToggleProps) {
  const { isEditMode, canEdit, toggleEditMode, hasUnsavedChanges } = useEditMode();

  // Si el usuario no puede editar, no mostrar el botón
  if (!canEdit) {
    return null;
  }

  return (
    <button
      onClick={toggleEditMode}
      className={cn(
        position === 'fixed' && 'fixed top-20 right-6 z-[9999]',
        'bg-white dark:bg-gray-800 shadow-lg rounded-full',
        'border-2',
        isEditMode
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600',
        'px-4 py-2.5',
        'flex items-center gap-2',
        'transition-all duration-200',
        'hover:shadow-xl',
        'group',
        className
      )}
      title={isEditMode ? 'Salir del modo edición' : 'Activar modo edición'}
    >
      {/* Icono */}
      {isEditMode ? (
        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      ) : (
        <Edit3 className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
      )}

      {/* Texto */}
      <span className={cn(
        'font-medium text-sm hidden md:inline',
        isEditMode
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300'
      )}>
        {isEditMode ? 'Vista Normal' : 'Editar Página'}
      </span>

      {/* Indicador de modo activo */}
      {isEditMode && (
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      )}

      {/* Badge de cambios pendientes */}
      {hasUnsavedChanges && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
    </button>
  );
}
