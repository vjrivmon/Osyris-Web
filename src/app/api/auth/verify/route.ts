import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getApiUrl } from '@/lib/api-utils'

// Forzar que esta ruta sea dinámica para evitar errores de static generation
export const dynamic = 'force-dynamic'

/**
 * Ruta de verificación de autenticación
 * Verifica el token del usuario y retorna información del usuario autenticado
 * El token viene en el header Authorization desde el frontend
 */
export async function GET(request: Request) {
  try {
    // El token viene en el header Authorization
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Proxy al backend para verificar el token usando URL dinámica
    const backendUrl = getApiUrl()

    const response = await fetch(`${backendUrl}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Si el backend no responde o el token es inválido
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const responseData = await response.json()

    // El backend devuelve: { success, data: { usuario: {...} } }
    const userData = responseData.data?.usuario || responseData.usuario || responseData

    return NextResponse.json({
      user: {
        id: userData.id,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        seccion: userData.seccion,
      }
    })

  } catch (error) {
    console.error('Error verifying auth:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
