/**
 * Hook para gestionar el formulario de contacto
 * Osyris Scout Management System
 */

import { useState, useCallback } from 'react';
import { getApiUrl } from '@/lib/api-utils';

interface ContactFormData {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

interface ContactFormErrors {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
}

interface SubmitResponse {
  success: boolean;
  message: string;
  details?: {
    savedToSheets: boolean;
    adminNotified: boolean;
    confirmationSent: boolean;
  };
  error?: string;
  errors?: string[];
  retryAfter?: number;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  errors: ContactFormErrors;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
  successMessage: string;
  handleChange: (field: keyof ContactFormData, value: string) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

const initialFormData: ContactFormData = {
  nombre: '',
  email: '',
  asunto: '',
  mensaje: ''
};

/**
 * Valida los datos del formulario en el cliente
 */
function validateForm(data: ContactFormData): ContactFormErrors {
  const errors: ContactFormErrors = {};

  // Nombre: 2-100 caracteres
  if (!data.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  // Email: formato válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'El email no es válido';
  }

  // Asunto: 3-200 caracteres
  if (!data.asunto.trim()) {
    errors.asunto = 'El asunto es obligatorio';
  } else if (data.asunto.trim().length < 3) {
    errors.asunto = 'El asunto debe tener al menos 3 caracteres';
  } else if (data.asunto.length > 200) {
    errors.asunto = 'El asunto no puede exceder 200 caracteres';
  }

  // Mensaje: 10-5000 caracteres
  if (!data.mensaje.trim()) {
    errors.mensaje = 'El mensaje es obligatorio';
  } else if (data.mensaje.trim().length < 10) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  } else if (data.mensaje.length > 5000) {
    errors.mensaje = 'El mensaje no puede exceder 5000 caracteres';
  }

  return errors;
}

/**
 * Hook para gestionar el formulario de contacto
 */
export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Limpiar estados de éxito/error
    if (isSuccess) setIsSuccess(false);
    if (isError) setIsError(false);
  }, [errors, isSuccess, isError]);

  const handleSubmit = useCallback(async () => {
    // Validar formulario
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setErrorMessage('');

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: SubmitResponse = await response.json();

      if (!response.ok) {
        // Manejar rate limiting
        if (response.status === 429) {
          const retryMinutes = Math.ceil((data.retryAfter || 600) / 60);
          throw new Error(`Has enviado demasiados mensajes. Espera ${retryMinutes} minutos.`);
        }

        // Manejar errores de validación
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.join('. '));
        }

        throw new Error(data.message || 'Error al enviar el mensaje');
      }

      // Éxito
      setIsSuccess(true);
      setSuccessMessage(data.message || 'Tu mensaje ha sido enviado correctamente.');
      setFormData(initialFormData);
      setErrors({});

    } catch (error) {
      setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage('');
    setSuccessMessage('');
  }, []);

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    successMessage,
    handleChange,
    handleSubmit,
    resetForm
  };
}

export default useContactForm;
