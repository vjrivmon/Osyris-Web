import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const FOTOS_DIR = "/mnt/storagebox/fotos-45-aniversario"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const file = searchParams.get("file")
  const size = searchParams.get("size") ?? "thumb"

  if (token !== process.env.ANIVERSARIO_PASSWORD || !file) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Prevent path traversal
  const safe = path.basename(file)
  const subdir = size === "full" ? "originales" : "thumbnails"
  let filePath = path.join(FOTOS_DIR, subdir, safe)

  // Fall back to originales if thumbnails don't exist
  if (!fs.existsSync(filePath)) {
    filePath = path.join(FOTOS_DIR, "originales", safe)
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const ext = path.extname(safe).toLowerCase()
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
