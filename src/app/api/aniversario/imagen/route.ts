import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const FOTOS_DIR = "/var/sftp/nora/fotos/ Aniversario Osyris definitivo"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const file = searchParams.get("file")

  if (token !== process.env.ANIVERSARIO_PASSWORD || !file) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Prevent path traversal: normalize and ensure it stays inside FOTOS_DIR
  const normalized = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, "")
  const filePath = path.join(FOTOS_DIR, normalized)

  if (!filePath.startsWith(FOTOS_DIR) || !fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  })
}
