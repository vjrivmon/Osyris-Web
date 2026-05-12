import { NextResponse, NextRequest } from "next/server"
import { dbQuery } from "@/lib/db"

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function POST(request: NextRequest) {
  const { email, token, evento, detalle } = await request.json()

  if (token !== process.env.ANIVERSARIO_PASSWORD || !email) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const allowed = ["view", "download"]
  if (!allowed.includes(evento)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const ip = getClientIp(request)

  try {
    await dbQuery(
      "INSERT INTO aniversario_accesos (email, ip, evento, detalle) VALUES ($1, $2, $3, $4)",
      [email.toLowerCase().trim(), ip, evento, detalle ?? null]
    )
  } catch {
    // No bloquear el flujo
  }

  return NextResponse.json({ ok: true })
}
