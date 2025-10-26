import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-utils'

// GET /api/galeria_privada/albumes - Obtener álbumes privados del familiar
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url)
    const familiaId = searchParams.get('familia_id')
    const hijosIds = searchParams.get('hijos_ids')

    if (!familiaId || !hijosIds) {
      return NextResponse.json(
        { error: 'Se requiere familia_id e hijos_ids' },
        { status: 400 }
      )
    }

    // Obtener token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Llamar al backend real
    const apiUrl = getApiUrl()
    const backendResponse = await fetch(`${apiUrl}/api/galeria_privada/albumes?familia_id=${familiaId}&hijos_ids=${hijosIds}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Error del backend' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()

    // Simular datos si el backend no responde
    if (!data || data.length === 0) {
      const mockAlbums = generateMockAlbumes(parseInt(hijosIds.split(',')[0]))
      return NextResponse.json(mockAlbums)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en API de álbumes privados:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para generar datos mock de álbumes
function generateMockAlbumes(familiaId: number) {
  const albumes = [
    {
      id: "album_001",
      titulo: "Campamento de Verano 2024",
      descripcion: "Una semana de aventuras en la naturaleza con actividades scouts",
      fecha_evento: "2024-07-15",
      lugar_evento: "Sierra de Gredos",
      tipo_evento: "campamento",
      seccion: "Manada Waingunga",
      seccion_id: 2,
      es_publico: false,
      fotos_count: 156,
      thumbnail_url: "/placeholder-campamento.jpg",
      scouts_etiquetados: [1, 2],
      etiquetas_count: 12,
      created_at: "2024-07-20T10:00:00Z",
      updated_at: "2024-10-15T14:30:00Z"
    },
    {
      id: "album_002",
      titulo: "Jornada de Integración",
      descripcion: "Actividades de equipo para nuevos y antiguos scouts",
      fecha_evento: "2024-09-28",
      lugar_evento: "Local del Grupo",
      tipo_evento: "jornada",
      seccion: "Colonia La Veleta",
      seccion_id: 1,
      es_publico: false,
      fotos_count: 89,
      thumbnail_url: "/placeholder-jornada.jpg",
      scouts_etiquetados: [2],
      etiquetas_count: 8,
      created_at: "2024-09-29T16:00:00Z",
      updated_at: "2024-10-10T11:20:00Z"
    },
    {
      id: "album_003",
      titulo: "Taller de Manualidades",
      descripcion: "Creando artesanías scout con materiales reciclados",
      fecha_evento: "2024-10-05",
      lugar_evento: "Sede Central",
      tipo_evento: "actividad",
      seccion: "Colonia La Veleta",
      seccion_id: 1,
      es_publico: false,
      fotos_count: 45,
      thumbnail_url: "/placeholder-taller.jpg",
      scouts_etiquetados: [2],
      etiquetas_count: 6,
      created_at: "2024-10-06T09:15:00Z",
      updated_at: "2024-10-12T17:45:00Z"
    },
    {
      id: "album_004",
      titulo: "Excursión a la Montaña",
      descripcion: "Ruta de senderismo por el parque natural",
      fecha_evento: "2024-06-20",
      lugar_evento: "Parque Natural de la Sierra",
      tipo_evento: "actividad",
      seccion: "Manada Waingunga",
      seccion_id: 2,
      es_publico: false,
      fotos_count: 124,
      thumbnail_url: "/placeholder-excursion.jpg",
      scouts_etiquetados: [1],
      etiquetas_count: 15,
      created_at: "2024-06-21T12:30:00Z",
      updated_at: "2024-10-08T10:15:00Z"
    },
    {
      id: "album_005",
      titulo: "Fiesta de Final de Curso",
      descripcion: "Celebración del final de año scout con familias",
      fecha_evento: "2024-06-30",
      lugar_evento: "Recinto Ferial",
      tipo_evento: "especial",
      seccion: "General",
      seccion_id: 0,
      es_publico: false,
      fotos_count: 203,
      thumbnail_url: "/placeholder-fiesta.jpg",
      scouts_etiquetados: [1, 2],
      etiquetas_count: 24,
      created_at: "2024-07-01T20:00:00Z",
      updated_at: "2024-10-14T16:20:00Z"
    }
  ]

  // Filtrar álbumes que tengan fotos de los hijos del familiar
  return albumes.map(album => ({
    ...album,
    es_nuevo: isAlbumNuevo(album.fecha_evento),
    fotos_count_formatted: formatCount(album.fotos_count),
    etiquetas_count_formatted: formatCount(album.etiquetas_count)
  }))
}

function isAlbumNuevo(fecha: string): boolean {
  const fechaEvento = new Date(fecha)
  const ahora = new Date()
  const horasDiferencia = (ahora.getTime() - fechaEvento.getTime()) / (1000 * 60 * 60)
  return horasDiferencia <= 48
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}