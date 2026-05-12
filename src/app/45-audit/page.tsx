"use client"

import { useState, useEffect, useCallback } from "react"

const SESSION_KEY = "audit45_token"

interface Acceso {
  id: number
  email: string
  ip: string
  evento: string
  detalle: string | null
  created_at: string
}

interface Stat {
  evento: string
  total: string
}

interface UniqueEmail {
  email: string
  ultimo_acceso: string
  descargas: string
}

interface AuditData {
  accesos: Acceso[]
  stats: Stat[]
  uniqueEmails: UniqueEmail[]
}

const EVENT_LABELS: Record<string, string> = {
  login: "Login OK",
  login_failed: "Login fallido",
  view: "Vista galería",
  download: "Descarga",
}

const EVENT_COLORS: Record<string, string> = {
  login: "bg-green-100 text-green-700",
  login_failed: "bg-red-100 text-red-700",
  view: "bg-blue-100 text-blue-700",
  download: "bg-amber-100 text-amber-700",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AuditPage() {
  const [password, setPassword] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [data, setData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<"log" | "personas">("log")
  const [filterEvento, setFilterEvento] = useState("")
  const [filterEmail, setFilterEmail] = useState("")

  const loadData = useCallback(async (t: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/aniversario/audit", {
        headers: { "x-audit-token": t },
      })
      if (res.ok) {
        setData(await res.json())
      } else if (res.status === 401) {
        sessionStorage.removeItem(SESSION_KEY)
        setToken(null)
        setError("Sesión expirada.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      setToken(saved)
      loadData(saved)
    }
  }, [loadData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    // Guardamos el token y disparamos la carga — la API valida
    sessionStorage.setItem(SESSION_KEY, password)
    setToken(password)
    loadData(password)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <h1 className="text-white text-lg font-semibold mb-1">45 Aniversario — Audit</h1>
          <p className="text-gray-500 text-xs mb-6">Acceso restringido</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de auditoría"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              autoFocus
              required
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  const filteredAccesos = data?.accesos.filter((a) => {
    if (filterEvento && a.evento !== filterEvento) return false
    if (filterEmail && !a.email.toLowerCase().includes(filterEmail.toLowerCase())) return false
    return true
  }) ?? []

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold">45 Aniversario — Auditoría</h1>
            <p className="text-gray-500 text-xs mt-0.5">Control de accesos</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => token && loadData(token)}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-40"
            >
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
            <button
              onClick={() => { sessionStorage.removeItem(SESSION_KEY); setToken(null) }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {loading && !data && (
          <div className="text-center text-gray-500 py-20 text-sm">Cargando…</div>
        )}

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {data.stats.map((s) => (
                <div key={s.evento} className="bg-gray-900 rounded-xl px-4 py-3">
                  <p className="text-2xl font-semibold">{s.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{EVENT_LABELS[s.evento] ?? s.evento}</p>
                </div>
              ))}
              <div className="bg-gray-900 rounded-xl px-4 py-3">
                <p className="text-2xl font-semibold">{data.uniqueEmails.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Personas únicas</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
              <button
                onClick={() => setTab("log")}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === "log" ? "bg-white text-gray-900 font-medium" : "text-gray-400 hover:text-white"}`}
              >
                Log de eventos
              </button>
              <button
                onClick={() => setTab("personas")}
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === "personas" ? "bg-white text-gray-900 font-medium" : "text-gray-400 hover:text-white"}`}
              >
                Por persona
              </button>
            </div>

            {tab === "log" && (
              <>
                {/* Filtros */}
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                    placeholder="Filtrar por email…"
                    className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 w-56"
                  />
                  <select
                    value={filterEvento}
                    onChange={(e) => setFilterEvento(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="">Todos los eventos</option>
                    {Object.entries(EVENT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 self-center">{filteredAccesos.length} registros</span>
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 text-gray-400 text-xs">
                        <th className="text-left px-4 py-3 font-medium">Fecha</th>
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Evento</th>
                        <th className="text-left px-4 py-3 font-medium">Detalle</th>
                        <th className="text-left px-4 py-3 font-medium">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredAccesos.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-900/50 transition-colors">
                          <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap text-xs">{formatDate(a.created_at)}</td>
                          <td className="px-4 py-2.5 text-white">{a.email}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_COLORS[a.evento] ?? "bg-gray-700 text-gray-300"}`}>
                              {EVENT_LABELS[a.evento] ?? a.evento}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs truncate max-w-[180px]">{a.detalle ?? "—"}</td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs">{a.ip}</td>
                        </tr>
                      ))}
                      {filteredAccesos.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-600 text-sm">Sin registros</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "personas" && (
              <div className="rounded-xl overflow-hidden border border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-gray-400 text-xs">
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Último acceso</th>
                      <th className="text-left px-4 py-3 font-medium">Descargas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {data.uniqueEmails.map((u) => (
                      <tr key={u.email} className="hover:bg-gray-900/50 transition-colors">
                        <td className="px-4 py-2.5 text-white">{u.email}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{formatDate(u.ultimo_acceso)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${Number(u.descargas) > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-800 text-gray-400"}`}>
                            {u.descargas} fotos
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
