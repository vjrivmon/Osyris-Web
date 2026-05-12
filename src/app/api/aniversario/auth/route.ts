import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()
  const expected = process.env.ANIVERSARIO_PASSWORD

  if (!expected) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 })
  }

  if (password === expected) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
