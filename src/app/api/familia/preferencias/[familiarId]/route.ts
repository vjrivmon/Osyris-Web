import { NextRequest, NextResponse } from 'next/server'

// Mock de preferencias para desarrollo
const mockPreferencias: Record<string, any> = {
  "1": {
    tema: "auto",
    idioma: "es",
    tamano_letra: "mediana",
    contraste: "normal",
    animaciones: "activadas",
    densidad: "normal",
    formato_fecha: "DD/MM/YYYY",
    formato_hora: "24h",
    notificaciones_email: "importantes",
    notificaciones_push: true
  },
  "2": {
    tema: "claro",
    idioma: "va",
    tamano_letra: "grande",
    contraste: "alto",
    animaciones: "reducidas",
    densidad: "espaciada",
    formato_fecha: "DD/MM/YYYY",
    formato_hora: "24h",
    notificaciones_email: "todas",
    notificaciones_push: true
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { familiarId: string } }
) {
  try {
    const familiarId = params.familiarId

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300))

    const preferencias = mockPreferencias[familiarId]

    if (!preferencias) {
      return NextResponse.json(
        { success: false, error: 'Preferencias no encontradas' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: preferencias
    })
  } catch (error) {
    console.error('Error al obtener preferencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { familiarId: string } }
) {
  try {
    const familiarId = params.familiarId
    const nuevasPreferencias = await request.json()

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 600))

    // Actualizar preferencias mock
    if (mockPreferencias[familiarId]) {
      mockPreferencias[familiarId] = { ...mockPreferencias[familiarId], ...nuevasPreferencias }
    } else {
      mockPreferencias[familiarId] = nuevasPreferencias
    }

    return NextResponse.json({
      success: true,
      data: mockPreferencias[familiarId]
    })
  } catch (error) {
    console.error('Error al actualizar preferencias:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}