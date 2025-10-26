import { NextRequest, NextResponse } from 'next/server'

// Mock de datos de perfil para desarrollo
const mockPerfiles: Record<string, any> = {
  "1": {
    id: "1",
    nombre: "María",
    apellidos: "García López",
    email: "maria.garcia@email.com",
    telefono: "+34 600 123 456",
    telefono_secundario: "+34 600 789 012",
    relacion: "madre",
    foto_perfil: "/placeholder-avatar.jpg",
    direccion: "Calle Principal, 123 - 28080 Madrid",
    dni: "12345678A",
    fecha_nacimiento: "1985-05-15",
    ultima_actualizacion: new Date().toISOString()
  },
  "2": {
    id: "2",
    nombre: "Juan",
    apellidos: "Pérez Martínez",
    email: "juan.perez@email.com",
    telefono: "+34 600 234 567",
    telefono_secundario: "+34 600 890 123",
    relacion: "padre",
    foto_perfil: "/placeholder-avatar-2.jpg",
    direccion: "Avenida Central, 456 - 46010 Valencia",
    dni: "87654321B",
    fecha_nacimiento: "1982-08-22",
    ultima_actualizacion: new Date().toISOString()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { familiarId: string } }
) {
  try {
    const familiarId = params.familiarId

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))

    const perfil = mockPerfiles[familiarId]

    if (!perfil) {
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: perfil
    })
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}