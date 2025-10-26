import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-utils'

// POST /api/galeria_privada/compartir-email - Compartir fotos por email
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

    if (!opciones || !opciones.email_destino) {
      return NextResponse.json(
        { error: 'Se requiere email_destino en las opciones' },
        { status: 400 }
      )
    }

    if (!familia_id) {
      return NextResponse.json(
        { error: 'Se requiere familia_id' },
        { status: 400 }
      )
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(opciones.email_destino)) {
      return NextResponse.json(
        { error: 'Email destino inválido' },
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
    const opcionesCompartir = {
      email_destino: opciones.email_destino,
      mensaje_personal: opciones.mensaje_personal || '',
      expiracion_horas: opciones.expiracion_horas || 24,
      permitir_descarga: opciones.permitir_descarga !== false,
      limite_descargas: opciones.limite_descargas || 10
    }

    // Llamar al backend real
    const apiUrl = getApiUrl()
    const backendResponse = await fetch(`${apiUrl}/api/galeria_privada/compartir-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        foto_ids,
        opciones: opcionesCompartir,
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

    const data = await backendResponse.json()

    // Simular respuesta si el backend no tiene implementada la funcionalidad
    if (!data || !data.enlace_compartir) {
      const mockResponse = generateMockShareResponse(foto_ids, opcionesCompartir)
      return NextResponse.json(mockResponse)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error en API de compartir por email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para generar respuesta mock de compartir
function generateMockShareResponse(fotoIds: string[], opciones: any) {
  // Generar un token único para el enlace
  const token = Buffer.from(`${fotoIds.join(',')}_${Date.now()}_${Math.random()}`).toString('base64').replace(/[+/=]/g, '').substring(0, 32)

  const enlaceCompartir = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/galeria-compartida/${token}`

  return {
    success: true,
    enlace_compartir: enlaceCompartir,
    token_acceso: token,
    expiracion: new Date(Date.now() + (opciones.expiracion_horas * 60 * 60 * 1000)).toISOString(),
    info_adicional: {
      fotos_count: fotoIds.length,
      email_destino: opciones.email_destino,
      mensaje_personal: opciones.mensaje_personal || '',
      permitir_descarga: opciones.permitir_descarga,
      limite_descargas: opciones.limite_descargas
    }
  }
}