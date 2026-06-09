import { useState, useEffect, useCallback } from "react"
import Dashboard  from "./crm/Dashboard"
import KanbanView from "./crm/KanbanView"
import LeadsTable from "./crm/LeadsTable"
import LotesPage  from "./crm/LotesPage"
import Settings   from "./crm/Settings"

// ─── Ícones SVG ──────────────────────────────────────────────────────────────

const PATHS = {
  dashboard: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  kanban:    "M6 5h2a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1zm5 0h2a1 1 0 011 1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1V6a1 1 0 011-1zm6 0h2a1 1 0 011 1v5a1 1 0 01-1 1h-2a1 1 0 01-1-1V6a1 1 0 011-1z",
  leads:     "M4 6h16M4 10h16M4 14h10",
  house:     "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  settings:  "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  menu:      "M4 6h16M4 12h16M4 18h16",
}

function Icon({ id, cls = "w-5 h-5" }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[id]} />
    </svg>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginGate({ onLogin }) {
  const [key, setKey]       = useState("")
  const [err, setErr]       = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault(); setErr(""); setLoading(true)
    try {
      const r = await fetch("/api/admin/leads", { headers: { "x-admin-key": key } })
      if (r.ok) { localStorage.setItem("ll_ak", key); onLogin(key) }
      else setErr("Chave inválida")
    } catch { setErr("Erro de conexão") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm space-y-5">
        <div>
          <div className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">Leilão Leads</div>
          <h1 className="text-white font-bold text-2xl">Painel Admin</h1>
        </div>
        <input value={key} onChange={e => setKey(e.target.value)}
          type="password" placeholder="Chave de acesso" autoFocus
          className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition placeholder-zinc-500" />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button type="submit" disabled={loading || !key}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition">
          {loading ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  )
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: "dashboard" },
  { id: "kanban",    label: "Pipeline",   icon: "kanban"    },
  { id: "leads",     label: "Leads",      icon: "leads"     },
  { id: "lotes",     label: "Lotes",      icon: "house"     },
  { id: "settings",  label: "Config",     icon: "settings"  },
]

// ─── Main CRM ─────────────────────────────────────────────────────────────────

export default function AdminCRM() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("ll_ak") || "")
  const [authed, setAuthed]     = useState(!!localStorage.getItem("ll_ak"))
  const [leads, setLeads]       = useState([])
  const [lots, setLots]         = useState([])
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState("dashboard")
  const [sideOpen, setSideOpen] = useState(false)

  const fetchLeads = useCallback(async (key) => {
    setLoading(true)
    try {
      const r = await fetch("/api/admin/leads", { headers: { "x-admin-key": key } })
      if (!r.ok) { localStorage.removeItem("ll_ak"); setAuthed(false); return }
      setLeads(await r.json())
    } finally { setLoading(false) }
  }, [])

  const fetchLots = useCallback(async (key) => {
    const r = await fetch("/api/admin/lots", { headers: { "x-admin-key": key } })
    if (r.ok) setLots(await r.json())
  }, [])

  useEffect(() => {
    if (authed && adminKey) { fetchLeads(adminKey); fetchLots(adminKey) }
  }, [authed, adminKey])

  function handleLogin(key) { setAdminKey(key); setAuthed(true) }
  function logout() { localStorage.removeItem("ll_ak"); setAdminKey(""); setAuthed(false); setLeads([]) }
  function updateLead(upd) { setLeads(prev => prev.map(l => l.id === upd.id ? upd : l)) }

  if (!authed) return <LoginGate onLogin={handleLogin} />

  const newLeads = leads.filter(l => (l.stage || "novo") === "novo").length

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar overlay (mobile) */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-40 w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200
        ${sideOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="text-amber-400 text-[10px] font-bold tracking-widest uppercase leading-none">Leilão Leads</div>
          <div className="text-white font-bold text-sm mt-0.5">CRM</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setSideOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left
                ${page === n.id ? "bg-amber-500/15 text-amber-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <Icon id={n.icon} />
              <span>{n.label}</span>
              {n.id === "kanban" && newLeads > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {newLeads}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800">
          <div className="text-zinc-600 text-xs px-3 mb-2">{leads.length} leads total</div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition text-sm">
            ← Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3 shrink-0 md:hidden">
          <button onClick={() => setSideOpen(s => !s)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition">
            <Icon id="menu" cls="w-5 h-5" />
          </button>
          <div className="text-amber-400 text-xs font-bold tracking-widest uppercase">Leilão Leads</div>
          <div className="text-white font-bold text-sm">{NAV.find(n => n.id === page)?.label}</div>
          <div className="flex-1" />
          <button onClick={() => fetchLeads(adminKey)} disabled={loading}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition text-lg">
            {loading ? "⟳" : "↺"}
          </button>
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex bg-zinc-900 border-b border-zinc-800 px-6 py-3 items-center gap-3 shrink-0">
          <h1 className="text-white font-bold">{NAV.find(n => n.id === page)?.label}</h1>
          <div className="flex-1" />
          <button onClick={() => { fetchLeads(adminKey); fetchLots(adminKey) }} disabled={loading}
            className="text-zinc-400 hover:text-white text-lg p-1.5 rounded-lg hover:bg-zinc-800 transition" title="Atualizar">
            {loading ? "⟳" : "↺"}
          </button>
          <a href="/?lot=demo" target="_blank"
            className="text-xs text-zinc-500 hover:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition">
            Ver LP ↗
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {page === "dashboard" && (
            <Dashboard leads={leads} lots={lots} adminKey={adminKey} onUpdate={updateLead} />
          )}
          {page === "kanban" && (
            <KanbanView leads={leads} adminKey={adminKey} onUpdate={updateLead} />
          )}
          {page === "leads" && (
            <LeadsTable leads={leads} lots={lots} adminKey={adminKey} onUpdate={updateLead} />
          )}
          {page === "lotes" && (
            <LotesPage lots={lots} leads={leads} adminKey={adminKey} onLotsChange={setLots} />
          )}
          {page === "settings" && (
            <Settings adminKey={adminKey} />
          )}
        </main>
      </div>
    </div>
  )
}
