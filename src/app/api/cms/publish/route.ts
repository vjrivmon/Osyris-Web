import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { cmsCollections } from "@/lib/cms-collections"

const GITHUB_TOKEN = process.env.GITHUB_CMS_TOKEN
const GITHUB_OWNER = process.env.GITHUB_REPO_OWNER ?? "vjrivmon"
const GITHUB_REPO = process.env.GITHUB_REPO_NAME ?? "Osyris-Web"
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH ?? "main"

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_CMS_TOKEN no configurado en el servidor" },
      { status: 503 }
    )
  }

  const { collection, content } = await req.json()
  if (!collection || typeof content !== "string") {
    return NextResponse.json({ error: "Faltan campos: collection, content" }, { status: 400 })
  }

  const col = cmsCollections.find(c => c.id === collection)
  if (!col) {
    return NextResponse.json({ error: "Coleccion desconocida" }, { status: 404 })
  }

  const contentPath = `content/${col.file}`
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  }
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`

  try {
    // 1. Obtener el SHA del archivo actual en la rama base
    const fileRes = await fetch(`${apiBase}/contents/${contentPath}?ref=${BASE_BRANCH}`, { headers })
    let fileSha: string | undefined
    if (fileRes.ok) {
      const fileData = await fileRes.json()
      fileSha = fileData.sha
    }

    // 2. Crear rama de trabajo cms/edit-<collection>-<timestamp>
    const branchName = `cms/edit-${collection}-${Date.now()}`

    const refRes = await fetch(`${apiBase}/git/refs/heads/${BASE_BRANCH}`, { headers })
    if (!refRes.ok) throw new Error("No se pudo obtener la referencia de la rama base")
    const { object: { sha: baseSha } } = await refRes.json()

    const createBranchRes = await fetch(`${apiBase}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
    })
    if (!createBranchRes.ok) throw new Error("No se pudo crear la rama")

    // 3. Crear o actualizar el archivo en la rama
    const encoded = Buffer.from(content, "utf-8").toString("base64")
    const updateBody: Record<string, unknown> = {
      message: `cms: actualizar ${collection} via editor`,
      content: encoded,
      branch: branchName,
    }
    if (fileSha) updateBody.sha = fileSha

    const updateRes = await fetch(`${apiBase}/contents/${contentPath}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updateBody),
    })
    if (!updateRes.ok) {
      const errText = await updateRes.text()
      throw new Error(`Error al actualizar archivo: ${errText}`)
    }

    // 4. Abrir PR con diff legible de cambios
    let diffLines = ""
    try {
      const currentRes = await fetch(`${apiBase}/contents/${contentPath}?ref=${BASE_BRANCH}`, { headers })
      if (currentRes.ok) {
        const currentData = await currentRes.json()
        const currentContent = Buffer.from(currentData.content, "base64").toString("utf-8")
        const oldObj = JSON.parse(currentContent)
        const newObj = JSON.parse(content)
        const changes: string[] = []
        const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
        for (const key of allKeys) {
          const oldVal = JSON.stringify(oldObj[key] ?? null)
          const newVal = JSON.stringify(newObj[key] ?? null)
          if (oldVal !== newVal) {
            const oldPreview = oldVal.length > 120 ? oldVal.slice(0, 120) + "…" : oldVal
            const newPreview = newVal.length > 120 ? newVal.slice(0, 120) + "…" : newVal
            changes.push(`| \`${key}\` | ${oldPreview} | ${newPreview} |`)
          }
        }
        if (changes.length > 0) {
          diffLines = `\n\n### Campos modificados\n\n| Campo | Antes | Después |\n|---|---|---|\n${changes.join("\n")}`
        }
      }
    } catch {
      // si no se puede calcular el diff, se omite
    }

    const prRes = await fetch(`${apiBase}/pulls`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `[CMS] Actualizar ${col.label}`,
        body: `Cambios en la colección **${col.label}** editados desde el CMS Osyris.\n\nArchivo: \`${contentPath}\`${diffLines}`,
        head: branchName,
        base: BASE_BRANCH,
      }),
    })

    if (!prRes.ok) {
      const errText = await prRes.text()
      throw new Error(`Error al crear PR: ${errText}`)
    }

    const prData = await prRes.json()
    return NextResponse.json({
      ok: true,
      pr_number: prData.number,
      pr_url: prData.html_url,
      branch: branchName,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
