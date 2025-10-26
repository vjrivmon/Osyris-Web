import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-utils'

// POST /api/galeria_privada/descargar-varias - Descargar múltiples fotos en ZIP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { foto_ids, opciones, familia_id } = body

    if (!foto_ids || !Array.isArray(foto_ids) || foto_ids.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de foto_ids' },
        { status: 400 }
      )
    }

    if (!familia_id) {
      return NextResponse.json(
        { error: 'Se requiere familia_id' },
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

    // Opciones por defecto
    const opcionesDescarga = {
      formato: opciones.formato || 'original',
      calidad: opciones.calidad || 90,
      incluir_metadata: opciones.incluir_metadata !== false,
      renombrar_archivos: opciones.renombrar_archivos !== false
    }

    // Llamar al backend real
    const apiUrl = getApiUrl()
    const backendResponse = await fetch(`${apiUrl}/api/galeria_privada/descargar-varias`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        foto_ids,
        opciones: opcionesDescarga,
        familia_id
      })
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Error del backend' },
        { status: backendResponse.status }
      )
    }

    // Obtener el blob del ZIP
    const zipBlob = await backendResponse.blob()

    // Configurar headers para la descarga
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="fotos_osyris_${new Date().toISOString().split('T')[0]}.zip"`)
    headers.set('Cache-Control', 'no-cache')

    // Devolver el blob directamente
    return new NextResponse(zipBlob, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error en API de descarga múltiple:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}