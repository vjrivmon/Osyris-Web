import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// POST /api/confirmaciones/confirmar - Confirmar asistencia a actividad
export async function POST(request: NextRequest) {
  try {
    // Obtener token de autorización
    const token = request.headers.get('Authorization')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { actividadId, scoutId, estado, comentario } = body

    // Validar datos
    if (!actividadId || !scoutId || !estado) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      )
    }

    if (!['confirmado', 'no_asiste'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    // Convertir estructura de datos para el backend
    // Frontend usa: estado = 'confirmado' | 'no_asiste'
    // Backend espera: asistira = true | false
    const backendPayload = {
      actividad_id: actividadId,
      scout_id: scoutId,
      asistira: estado === 'confirmado',
      comentarios: comentario || ''
    }

    // Llamar al backend real
    const response = await fetch(`${API_URL}/api/confirmaciones/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error del backend:', data)
      return NextResponse.json(
        { error: data.message || 'Error al guardar confirmación' },
        { status: response.status }
      )
    }

    // Devolver respuesta en formato que espera el frontend
    return NextResponse.json({
      id: data.data?.id,
      actividadId,
      scoutId,
      estado,
      comentario: comentario || null,
      fechaConfirmacion: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en POST /api/confirmaciones/confirmar:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}