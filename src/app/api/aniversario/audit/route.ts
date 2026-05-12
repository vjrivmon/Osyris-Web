import { NextResponse, NextRequest } from "next/server"
import { dbQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-audit-token")

  if (token !== process.env.AUDIT_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const accesos = await dbQuery<{
    id: number
    email: string
    ip: string
    evento: string
    detalle: string | null
    created_at: string
  }>(
    `SELECT id, email, ip, evento, detalle, created_at
     FROM aniversario_accesos
     ORDER BY created_at DESC
     LIMIT 500`
  )

  // Estadísticas resumidas
  const stats = await dbQuery<{ evento: string; total: string }>(
    `SELECT evento, COUNT(*) as total
     FROM aniversario_accesos
     GROUP BY evento
     ORDER BY total DESC`
  )

  const uniqueEmails = await dbQuery<{ email: string; ultimo_acceso: string; descargas: string }>(
    `SELECT email,
            MAX(created_at) as ultimo_acceso,
            COUNT(*) FILTER (WHERE evento = 'download') as descargas
     FROM aniversario_accesos
     GROUP BY email
     ORDER BY ultimo_acceso DESC`
  )

  return NextResponse.json({ accesos, stats, uniqueEmails })
}
