"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"

interface Foto {
  filename: string
  thumb: string
  full: string
}

const SESSION_KEY = "aniversario45_token"
const EMAIL_KEY = "aniversario45_email"

async function logEvento(email: string, token: string, evento: "view" | "download", detalle?: string) {
  try {
    await fetch("/api/aniversario/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, evento, detalle }),
    })
  } catch {
    // silencioso
  }
}

export default function Aniversario45Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [total, setTotal] = useState(0)
  const [lightbox, setLightbox] = useState<Foto | null>(null)
  const [fotosLoading, setFotosLoading] = useState(false)
  const [viewLogged, setViewLogged] = useState(false)

  const loadFotos = useCallback(async (t: string, em: string) => {
    setFotosLoading(true)
    try {
      const res = await fetch(`/api/aniversario/fotos?token=${encodeURIComponent(t)}`)
      if (res.ok) {
        const data = await res.json()
        setFotos(data.fotos)
        setTotal(data.total)
      }
    } finally {
      setFotosLoading(false)
    }
  }, [])

  useEffect(() => {
    const savedToken = sessionStorage.getItem(SESSION_KEY)
    const savedEmail = sessionStorage.getItem(EMAIL_KEY)
    if (savedToken && savedEmail) {
      setToken(savedToken)
      setSessionEmail(savedEmail)
      loadFotos(savedToken, savedEmail)
    }
  }, [loadFotos])

  // Registrar "view" una sola vez al entrar a la galería
  useEffect(() => {
    if (token && sessionEmail && !viewLogged) {
      logEvento(sessionEmail, token, "view")
      setViewLogged(true)
    }
  }, [token, sessionEmail, viewLogged])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/aniversario/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        sessionStorage.setItem(SESSION_KEY, password)
        sessionStorage.setItem(EMAIL_KEY, email)
        setToken(password)
        setSessionEmail(email)
        loadFotos(password, email)
      } else if (res.status === 500) {
        setError("La galería aún no está configurada. Vuelve pronto.")
      } else if (res.status === 400) {
        setError("Introduce un email válido.")
      } else {
        setError("Contraseña incorrecta.")
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(EMAIL_KEY)
    setToken(null)
    setSessionEmail(null)
    setFotos([])
    setPassword("")
    setEmail("")
    setViewLogged(false)
  }

  function handleDownload(foto: Foto) {
    if (sessionEmail && token) {
      logEvento(sessionEmail, token, "download", foto.filename)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex flex-col">
        <MainNav />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1b3d2a] mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-[#1b3d2a]">45 Aniversario</h1>
              <p className="text-sm text-gray-500 mt-1">Grupo Scout Osyris</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-600 mb-6 text-center">
                Introduce tu correo y la contraseña para acceder a las fotos.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3d2a]/30 focus:border-[#1b3d2a]"
                    placeholder="tu@correo.es"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3d2a]/30 focus:border-[#1b3d2a]"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-600 text-center">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !password || !email}
                  className="w-full py-2.5 rounded-lg bg-[#1b3d2a] text-white text-sm font-medium hover:bg-[#244f37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Comprobando..." : "Ver fotos"}
                </button>
              </form>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              La contraseña fue enviada por el grupo a las familias.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <MainNav />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1b3d2a]">45 Aniversario</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {fotosLoading ? "Cargando..." : total > 0 ? `${total} fotos` : "Preparando la galería…"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {fotosLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!fotosLoading && fotos.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <svg className="mx-auto mb-4 opacity-40" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <p className="text-sm">Las fotos se publicarán pronto.</p>
          </div>
        )}

        {!fotosLoading && fotos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {fotos.map((foto) => (
              <button
                key={foto.filename}
                onClick={() => setLightbox(foto)}
                className="aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1b3d2a]"
              >
                <Image
                  src={foto.thumb}
                  alt={foto.filename}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </main>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <a
            href={lightbox.full}
            download={lightbox.filename}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); handleDownload(lightbox) }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar
          </a>
          <img
            src={lightbox.full}
            alt={lightbox.filename}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
