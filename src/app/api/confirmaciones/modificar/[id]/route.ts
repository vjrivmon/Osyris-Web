import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// PUT /api/confirmaciones/modificar/[id] - Modificar confirmación existente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener token de autorización
    const token = request.headers.get('Authorization')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { estado, comentario } = body

    // Validar datos
    if (!estado) {
      return NextResponse.json(
        { error: 'Falta el estado' },
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
    const backendPayload = {
      asistira: estado === 'confirmado',
      comentarios: comentario || ''
    }

    // Llamar al backend real
    const response = await fetch(`${API_URL}/api/confirmaciones/${id}`, {
      method: 'PUT',
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
        { error: data.message || 'Error al modificar confirmación' },
        { status: response.status }
      )
    }

    // Devolver respuesta en formato que espera el frontend
    return NextResponse.json({
      id,
      estado,
      comentario: comentario || null,
      fechaModificacion: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en PUT /api/confirmaciones/modificar/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
