"use client";

import { useState, useEffect } from 'react';
import { apiEndpoint } from '@/lib/api-utils';

interface ContentBlock {
  id: number;
  tipo: string;
  contenido: string;
  metadata?: any;
  version?: number;
  lastModified?: string;
}

interface ContentMap {
  [identificador: string]: ContentBlock;
}

interface UseSectionContentReturn {
  content: ContentMap;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para cargar contenido de una sección desde la API
 * @param seccion - Nombre de la sección (landing, castores, manada, etc.)
 * @returns Objeto con contenido mapeado por identificador
 */
export function useSectionContent(seccion: string): UseSectionContentReturn {
  const [content, setContent] = useState<ContentMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = apiEndpoint(`/api/content/page/${seccion}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error al cargar contenido: ${response.status}`);
      }

      const data = await response.json();

      // Mapear contenido por identificador
      const contentMap: ContentMap = {};

      if (data.content && typeof data.content === 'object') {
        Object.entries(data.content).forEach(([key, value]: [string, any]) => {
          contentMap[key] = {
            id: value.id,
            tipo: value.tipo,
            contenido: value.contenido,
            metadata: value.metadata,
            version: value.version,
            lastModified: value.lastModified
          };
        });
      }

      setContent(contentMap);
    } catch (err) {
      console.error('Error cargando contenido:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setContent({}); // Retornar vacío para que use fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [seccion]);

  return {
    content,
    isLoading,
    error,
    refetch: fetchContent
  };
}
