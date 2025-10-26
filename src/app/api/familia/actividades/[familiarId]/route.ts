import { NextRequest, NextResponse } from "next/server"
import { getApiUrl } from "@/lib/api-utils"

// GET /api/familia/actividades/[familiarId] - Obtener actividades de un familiar
export async function GET(
  request: NextRequest,
  { params }: { params: { familiarId: string } }
) {
  try {
    // TODO: Implementar autenticación con token JWT
    // const token = request.headers.get('Authorization')
    // if (!token) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    // }

    const familiarId = params.familiarId

    // TODO: Verificar que el familiar solo pueda ver sus propias actividades
    // if (decodedToken.userId !== familiarId) {
    //   return NextResponse.json(
    //     { error: "No tienes permiso para ver estas actividades" },
    //     { status: 403 }
    //   )
    // }

    // Aquí conectaríamos con la base de datos real
    // Por ahora, devolvemos datos de ejemplo
    const actividadesEjemplo = [
      {
        id: "1",
        titulo: "Campamento de Primavera",
        descripcion: "Un campamento fin de semana con actividades de naturaleza y juegos scout",
        fechaInicio: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lugar: "Centro Scout \"El Bosque\"",
        seccion: "Manada Waingunga",
        seccion_id: 2,
        scoutIds: ["1"], // IDs de los hijos del familiar
        monitorResponsable: {
          nombre: "Ana Martínez",
          foto: "/monitores/ana.jpg",
          contacto: "ana@osyris.es"
        },
        precio: 25,
        cupoMaximo: 30,
        materialNecesario: ["Ropa de abrigo", "Botas de montaña", "Linterna", "Saco de dormir"],
        confirmaciones: {
          "1": "pendiente" // Estado por scout
        },
        tipo: "campamento",
        coordenadas: {
          lat: 40.4168,
          lng: -3.7038
        }
      }
    ]

    return NextResponse.json(actividadesEjemplo)

  } catch (error) {
    console.error("Error en GET /api/familia/actividades/[familiarId]:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
