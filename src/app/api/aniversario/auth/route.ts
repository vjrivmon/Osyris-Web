import { NextResponse, NextRequest } from "next/server"
import { dbQuery } from "@/lib/db"

async function logAcceso(email: string, ip: string, evento: string, detalle?: string) {
  try {
    await dbQuery(
      "INSERT INTO aniversario_accesos (email, ip, evento, detalle) VALUES ($1, $2, $3, $4)",
      [email.toLowerCase().trim(), ip, evento, detalle ?? null]
    )
  } catch {
    // No bloquear el flujo si falla el log
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  const expected = process.env.ANIVERSARIO_PASSWORD

  if (!expected) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 })
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 })
  }

  const ip = getClientIp(request)

  if (password === expected) {
    await logAcceso(email, ip, "login")
    return NextResponse.json({ ok: true })
  }

  await logAcceso(email, ip, "login_failed")
  return NextResponse.json({ ok: false }, { status: 401 })
}
