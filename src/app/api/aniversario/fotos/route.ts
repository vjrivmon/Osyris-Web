import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const FOTOS_DIR = "/var/sftp/nora/fotos"
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])

function collectImages(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sub = collectImages(path.join(dir, entry.name))
      files.push(...sub.map((f) => path.join(entry.name, f)))
    } else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entry.name)
    }
  }
  return files
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (token !== process.env.ANIVERSARIO_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  if (!fs.existsSync(FOTOS_DIR)) {
    return NextResponse.json({ fotos: [], total: 0 })
  }

  const files = collectImages(FOTOS_DIR)
  files.sort()

  const fotos = files.map((relativePath) => {
    const encoded = encodeURIComponent(relativePath)
    const tokenEnc = encodeURIComponent(token!)
    const thumb = `/api/aniversario/imagen?file=${encoded}&token=${tokenEnc}&size=thumb`
    const full = `/api/aniversario/imagen?file=${encoded}&token=${tokenEnc}&size=full`
    return { filename: relativePath, thumb, full }
  })

  return NextResponse.json({ fotos, total: fotos.length })
}
