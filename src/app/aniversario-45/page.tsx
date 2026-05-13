"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"

interface Foto {
  filename: string
  thumb: string
  full: string
}

const SESSION_KEY = "aniversario45_token"
const EMAIL_KEY = "aniversario45_email"

// Contraseña estructurada: 1981 + cinco * patronato
// Segmentos: [4 chars][sep "+"][5 chars][sep "*"][9 chars]
const SEG1_LEN = 4   // 1981
const SEG2_LEN = 5   // cinco
const SEG3_LEN = 9   // patronato
const SEP1 = "+"
const SEP2 = "*"

const HINTS = [
  { dots: SEG1_LEN, label: "Año en que nació el Osyris" },
  { sep: SEP1 },
  { dots: SEG2_LEN, label: "En letras: cuántas secciones hay en el Osyris" },
  { sep: SEP2 },
  { dots: SEG3_LEN, label: "Rima con pato, lugar de reuniones de los sábados" },
]

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

// Devuelve el valor del input distribuido en segmentos visuales
function buildDisplayParts(value: string) {
  // value es la contraseña completa conforme se va construyendo
  // seg1: chars 0..3, sep1: "+", seg2: chars 4..8, sep2: "*", seg3: chars 9..17
  const seg1 = value.slice(0, SEG1_LEN)
  const seg2 = value.slice(SEG1_LEN, SEG1_LEN + SEG2_LEN)
  const seg3 = value.slice(SEG1_LEN + SEG2_LEN, SEG1_LEN + SEG2_LEN + SEG3_LEN)
  return { seg1, seg2, seg3 }
}

export default function Aniversario45Page() {
  const [email, setEmail] = useState("")
  // rawInput: solo los chars del usuario sin los separadores
  const [rawInput, setRawInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fotos, setFotos] = useState<Foto[]>([])
  const [total, setTotal] = useState(0)
  const [lightbox, setLightbox] = useState<Foto | null>(null)
  const [fotosLoading, setFotosLoading] = useState(false)
  const [viewLogged, setViewLogged] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Construir contraseña completa con separadores para el campo visual
  const { seg1, seg2, seg3 } = buildDisplayParts(rawInput)
  const fullPassword = seg1 + (seg1.length > 0 || seg2.length > 0 || seg3.length > 0 ? SEP1 : "") + seg2 + (seg2.length > 0 || seg3.length > 0 ? SEP2 : "") + seg3

  // El input interno siempre construye "seg1+seg2*seg3"
  const displayValue = (() => {
    let v = seg1
    if (seg1.length === SEG1_LEN || seg2.length > 0) v += SEP1
    v += seg2
    if (seg2.length === SEG2_LEN || seg3.length > 0) v += SEP2
    v += seg3
    return v
  })()

  const loadFotos = useCallback(async (t: string) => {
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
      loadFotos(savedToken)
    }
  }, [loadFotos])

  useEffect(() => {
    if (token && sessionEmail && !viewLogged) {
      logEvento(sessionEmail, token, "view")
      setViewLogged(true)
    }
  }, [token, sessionEmail, viewLogged])

  // Manejar input: el usuario escribe libre, nosotros extraemos solo los chars de usuario
  // (ignoramos los separadores que ya inyectamos) y los distribuimos en segmentos
  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    // Extraer solo los chars que no son separadores, distribuir en segmentos
    const raw = val.replace(/[+*]/g, "")
    const maxLen = SEG1_LEN + SEG2_LEN + SEG3_LEN
    setRawInput(raw.slice(0, maxLen))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const password = `${seg1}${SEP1}${seg2}${SEP2}${seg3}`

    if (rawInput.length < SEG1_LEN + SEG2_LEN + SEG3_LEN) {
      setError("Completa todos los campos de la contraseña.")
      return
    }

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
        loadFotos(password)
      } else if (res.status === 500) {
        setError("La galería aún no está configurada. Vuelve pronto.")
      } else if (res.status === 400) {
        setError("Introduce un email válido.")
      } else {
        setError("Alguna respuesta no es correcta. Inténtalo de nuevo.")
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
    setRawInput("")
    setEmail("")
    setViewLogged(false)
  }

  function handleDownload(foto: Foto) {
    if (sessionEmail && token) {
      logEvento(sessionEmail, token, "download", foto.filename)
    }
  }

  // Calcular progreso de cada segmento para colorear los dots del hint
  const seg1Progress = seg1.length
  const seg2Progress = seg2.length
  const seg3Progress = seg3.length

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex flex-col">
        <MainNav />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo-45-aniversario.png"
                alt="45 Aniversario Grupo Scout Osyris"
                width={120}
                height={120}
                className="select-none"
                priority
              />
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-[#1b3d2a]">Fotos del 45 Aniversario</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
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

                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>

                  {/* Campo visual con dots + input invisible encima */}
                  <div
                    className="relative rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-[#1b3d2a]/30 focus-within:border-[#1b3d2a] cursor-text"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {/* Input invisible — captura el teclado */}
                    <input
                      ref={inputRef}
                      id="password"
                      type="text"
                      inputMode="text"
                      value={displayValue}
                      onChange={handlePasswordChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />

                    {/* Visualización: dots o texto según showPassword */}
                    <div className="flex items-center px-3 py-2.5 pr-10 min-h-[42px] gap-[3px]">
                      {showPassword ? (
                        // Texto plano con separadores
                        <span className="text-sm font-mono tracking-widest text-gray-800 select-none">
                          {displayValue || <span className="text-gray-300">····+·····*·········</span>}
                        </span>
                      ) : (
                        // Dots con separadores que se van llenando
                        <>
                          {Array.from({ length: SEG1_LEN }).map((_, i) => (
                            <span key={`s1-${i}`} className={`w-[7px] h-[7px] rounded-full shrink-0 transition-colors ${i < seg1Progress ? "bg-gray-800" : "bg-gray-300"}`} />
                          ))}
                          <span className={`text-xs font-bold mx-0.5 transition-colors ${seg1Progress > 0 ? "text-gray-800" : "text-gray-300"}`}>+</span>
                          {Array.from({ length: SEG2_LEN }).map((_, i) => (
                            <span key={`s2-${i}`} className={`w-[7px] h-[7px] rounded-full shrink-0 transition-colors ${i < seg2Progress ? "bg-gray-800" : "bg-gray-300"}`} />
                          ))}
                          <span className={`text-xs font-bold mx-0.5 transition-colors ${seg2Progress > 0 ? "text-gray-800" : "text-gray-300"}`}>*</span>
                          {Array.from({ length: SEG3_LEN }).map((_, i) => (
                            <span key={`s3-${i}`} className={`w-[7px] h-[7px] rounded-full shrink-0 transition-colors ${i < seg3Progress ? "bg-gray-800" : "bg-gray-300"}`} />
                          ))}
                        </>
                      )}
                    </div>

                    {/* Ojo */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Pistas con iconos */}
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Año en que nació el Osyris
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                      En letras: cuántas secciones hay en el Osyris
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      Rima con pato, lugar de reuniones de los sábados
                    </div>
                    <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">Todo en minúsculas, sin espacios</p>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || rawInput.length < SEG1_LEN + SEG2_LEN + SEG3_LEN}
                  className="w-full py-2.5 rounded-lg bg-[#1b3d2a] text-white text-sm font-medium hover:bg-[#244f37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Comprobando..." : "Ver fotos"}
                </button>
              </form>
            </div>
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
              {fotosLoading ? "Cargando..." : total > 0 ? `${total} ${total === 1 ? "foto" : "fotos"}` : ""}
            </p>
          </div>
        </div>

        {fotosLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!fotosLoading && fotos.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-300 rounded-lg animate-pulse" style={{ animationDelay: `${(i * 80) % 800}ms` }} />
            ))}
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
