import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { scoutId: string } }
) {
  try {
    const scoutId = params.scoutId
    const datosScout = await request.json()

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 700))

    // Validaciones específicas para scouts
    const errores: string[] = []

    if (datosScout.fecha_nacimiento) {
      const fechaNac = new Date(datosScout.fecha_nacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNac.getFullYear()
      if (edad < 5 || edad > 20) {
        errores.push('La fecha de nacimiento no es válida para un scout')
      }
    }

    if (datosScout.alergias && !Array.isArray(datosScout.alergias)) {
      errores.push('Las alergias deben ser una lista')
    }

    if (datosScout.medicacion && !Array.isArray(datosScout.medicacion)) {
      errores.push('La medicación debe ser una lista')
    }

    if (errores.length > 0) {
      return NextResponse.json(
        { success: false, errores },
        { status: 400 }
      )
    }

    // Simulación de actualización exitosa
    console.log(`Actualizando scout ${scoutId}:`, datosScout)

    return NextResponse.json({
      success: true,
      message: 'Información del scout actualizada correctamente',
      data: {
        ...datosScout,
        id: scoutId
      }
    })
  } catch (error) {
    console.error('Error al actualizar scout:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}