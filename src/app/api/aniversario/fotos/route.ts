import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const FOTOS_DIR = "/var/sftp/nora/fotos"
const THUMBNAILS_DIR = path.join(FOTOS_DIR, "thumbnails")
const ORIGINALES_DIR = path.join(FOTOS_DIR, "originales")

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (token !== process.env.ANIVERSARIO_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  if (!fs.existsSync(FOTOS_DIR)) {
    return NextResponse.json({ fotos: [], total: 0 })
  }

  // Busca en thumbnails, luego originales, luego directamente en la raíz
  const dir = fs.existsSync(THUMBNAILS_DIR) ? THUMBNAILS_DIR
    : fs.existsSync(ORIGINALES_DIR) ? ORIGINALES_DIR
    : FOTOS_DIR

  let files: string[] = []
  try {
    files = fs.readdirSync(dir).filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
  } catch {
    return NextResponse.json({ fotos: [], total: 0 })
  }

  files.sort()

  const fotos = files.map((filename) => {
    const thumb = `/api/aniversario/imagen?file=${encodeURIComponent(filename)}&token=${encodeURIComponent(token)}&size=thumb`
    const full = `/api/aniversario/imagen?file=${encodeURIComponent(filename)}&token=${encodeURIComponent(token)}&size=full`
    return { filename, thumb, full }
  })

  return NextResponse.json({ fotos, total: fotos.length })
}
