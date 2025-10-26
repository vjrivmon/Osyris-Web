import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { familiarId: string } }
) {
  try {
    const familiarId = params.familiarId
    const datosPerfil = await request.json()

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800))

    // Validaciones básicas
    const errores: string[] = []

    if (!datosPerfil.nombre?.trim()) {
      errores.push('El nombre es obligatorio')
    }

    if (!datosPerfil.apellidos?.trim()) {
      errores.push('Los apellidos son obligatorios')
    }

    if (!datosPerfil.email?.trim()) {
      errores.push('El email es obligatorio')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosPerfil.email)) {
      errores.push('El email no es válido')
    }

    if (!datosPerfil.telefono?.trim()) {
      errores.push('El teléfono es obligatorio')
    }

    if (!datosPerfil.relacion) {
      errores.push('La relación es obligatoria')
    }

    if (datosPerfil.dni && !/^[0-9]{8}[A-HJ-NP-TV-Z]$/.test(datosPerfil.dni)) {
      errores.push('El DNI no es válido')
    }

    if (errores.length > 0) {
      return NextResponse.json(
        { success: false, errores },
        { status: 400 }
      )
    }

    // Simulación de actualización exitosa
    console.log(`Actualizando perfil ${familiarId}:`, datosPerfil)

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        ...datosPerfil,
        id: familiarId,
        ultima_actualizacion: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}