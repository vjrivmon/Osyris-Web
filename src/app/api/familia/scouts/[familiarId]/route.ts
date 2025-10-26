import { NextRequest, NextResponse } from 'next/server'

// Mock de datos de scouts para desarrollo
const mockScouts: Record<string, any[]> = {
  "1": [
    {
      id: "1",
      nombre: "Carlos",
      apellidos: "García Pérez",
      fecha_nacimiento: "2015-03-10",
      seccion_actual: "manada",
      alergias: ["Frutos secos", "Lácteos"],
      medicacion: ["Inhalador para asma"],
      observaciones_medicas: "Usar inhalador antes de ejercicio intenso. Epinefrina en caso de reacción alérgica grave.",
      contacto_emergencia: [
        {
          nombre: "Abuela María",
          telefono: "+34 600 999 888",
          relacion: "Abuela materna",
          es_principal: false
        }
      ]
    },
    {
      id: "2",
      nombre: "Lucía",
      apellidos: "García Pérez",
      fecha_nacimiento: "2018-11-22",
      seccion_actual: "castores",
      alergias: ["Ninguna"],
      medicacion: [],
      observaciones_medicas: "",
      contacto_emergencia: [
        {
          nombre: "Tío Roberto",
          telefono: "+34 600 777 666",
          relacion: "Tío paterno",
          es_principal: false
        }
      ]
    }
  ],
  "2": [
    {
      id: "3",
      nombre: "Sofía",
      apellidos: "Pérez García",
      fecha_nacimiento: "2013-07-08",
      seccion_actual: "tropa",
      alergias: ["Gluten"],
      medicacion: [],
      observaciones_medicas: "Dieta sin gluten estricta. Evitar contaminación cruzada en alimentos.",
      contacto_emergencia: [
        {
          nombre: "Tía Ana",
          telefono: "+34 600 555 444",
          relacion: "Tía materna",
          es_principal: false
        }
      ]
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { familiarId: string } }
) {
  try {
    const familiarId = params.familiarId

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400))

    const scouts = mockScouts[familiarId] || []

    return NextResponse.json({
      success: true,
      data: scouts
    })
  } catch (error) {
    console.error('Error al obtener scouts:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}