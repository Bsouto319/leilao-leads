import { useState, useEffect, useCallback } from "react"

const STAGES = [
  { id: "novo",        label: "Novos",       col: "blue"   },
  { id: "contatado",   label: "Contatado",   col: "violet" },
  { id: "qualificado", label: "Qualificado", col: "amber"  },
  { id: "fechado",     label: "Fechado",     col: "green"  },
  { id: "perdido",     label: "Perdido",     col: "red"    },
]

const COL = {
  blue:   { bg: "bg-blue-950/40",   border: "border-blue-900",   badge: "bg-blue-600",   head: "text-blue-400"   },
  violet: { bg: "bg-violet-950/40", border: "border-violet-900", badge: "bg-violet-600", head: "text-violet-400" },
  amber:  { bg: "bg-amber-950/40",  border: "border-amber-900",  badge: "bg-amber-600",  head: "text-amber-400"  },
  green:  { bg: "bg-green-950/40",  border: "border-green-900",  badge: "bg-green-600",  head: "text-green-400"  },
  red:    { bg: "bg-red-950/40",    border: "border-red-900",    badge: "bg-red-700",    head: "text-red-400"    },
}

function fmtDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

function fmtPhone(d = "") {
  const n = d.replace(/\D/g, "")
  if (n.length === 13) return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,9)}-${n.slice(9)}`
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
  return d || "—"
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginGate({ onLogin }) {
  const [key, setKey] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr("")
    setLoading(true)
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
        <input
          value={key} onChange={e => setKey(e.target.value)}
          type="password" placeholder="Chave de acesso" autoFocus
          className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition placeholder-zinc-500"
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button type="submit" disabled={loading || !key}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition">
          {loading ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function LeadCard({ lead, onClick }) {
  const lot = lead.leilao_lots?.title || lead.lot_slug || "—"
  return (
    <button onClick={onClick}
      className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 space-y-2 transition">
      <div className="flex items-start justify-between gap-2">
        <span className="text-white font-semibold text-sm leading-snug">{lead.nome}</span>
        {lead.whatsapp_sent && (
          <span className="shrink-0 text-[10px] bg-green-900/80 text-green-400 px-1.5 py-0.5 rounded-full font-bold">WA ✓</span>
        )}
      </div>
      <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-amber-400 text-xs hover:underline block">
        {fmtPhone(lead.whatsapp)}
      </a>
      <div className="text-zinc-500 text-xs truncate">{lot}</div>
      <div className="text-zinc-600 text-[11px]">{fmtDate(lead.created_at)}</div>
      {lead.notas && (
        <div className="text-zinc-400 text-xs bg-zinc-800 rounded-lg px-2 py-1 line-clamp-2">{lead.notas}</div>
      )}
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function LeadModal({ lead, adminKey, onClose, onUpdate }) {
  const [stage, setStage] = useState(lead.stage || "novo")
  const [notas, setNotas] = useState(lead.notas || "")
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ stage, notas }),
      })
      if (r.ok) { onUpdate({ ...lead, stage, notas }); onClose() }
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">{lead.nome}</h2>
            <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noreferrer"
              className="text-amber-400 text-sm hover:underline">
              {fmtPhone(lead.whatsapp)}
            </a>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition">×</button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-zinc-800 rounded-xl p-3">
            <div className="text-zinc-500 text-xs mb-0.5">Lote</div>
            <div className="text-white font-medium truncate">{lead.leilao_lots?.title || lead.lot_slug || "—"}</div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3">
            <div className="text-zinc-500 text-xs mb-0.5">Capturado</div>
            <div className="text-white font-medium text-xs">{fmtDate(lead.created_at)}</div>
          </div>
          {lead.region_interest && (
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs mb-0.5">Região</div>
              <div className="text-white font-medium">{lead.region_interest}</div>
            </div>
          )}
          {lead.price_range && (
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs mb-0.5">Faixa de preço</div>
              <div className="text-white font-medium">{lead.price_range}</div>
            </div>
          )}
          <div className="bg-zinc-800 rounded-xl p-3">
            <div className="text-zinc-500 text-xs mb-0.5">WhatsApp enviado</div>
            <div className={`font-bold text-sm ${lead.whatsapp_sent ? "text-green-400" : "text-zinc-500"}`}>
              {lead.whatsapp_sent ? "Sim ✓" : "Não"}
            </div>
          </div>
        </div>

        {/* Stage */}
        <div>
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Etapa</div>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(s => (
              <button key={s.id} onClick={() => setStage(s.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  stage === s.id ? `${COL[s.col].badge} text-white` : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Notas</div>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            rows={3} placeholder="Observações sobre o lead…"
            className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition placeholder-zinc-600 resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition text-sm font-medium">
            Cancelar
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-2.5 rounded-xl transition text-sm">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminCRM() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem("ll_ak") || "")
  const [authed, setAuthed]     = useState(!!localStorage.getItem("ll_ak"))
  const [leads, setLeads]       = useState([])
  const [lots, setLots]         = useState([])
  const [filter, setFilter]     = useState("")
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)

  const fetchLeads = useCallback(async (key, slug) => {
    setLoading(true)
    try {
      const qs = slug ? `?lotSlug=${slug}` : ""
      const r = await fetch(`/api/admin/leads${qs}`, { headers: { "x-admin-key": key } })
      if (!r.ok) { localStorage.removeItem("ll_ak"); setAuthed(false); return }
      setLeads(await r.json())
    } finally { setLoading(false) }
  }, [])

  const fetchLots = useCallback(async (key) => {
    const r = await fetch("/api/admin/lots", { headers: { "x-admin-key": key } })
    if (r.ok) setLots(await r.json())
  }, [])

  useEffect(() => {
    if (authed && adminKey) {
      fetchLeads(adminKey, filter)
      fetchLots(adminKey)
    }
  }, [authed, adminKey, filter, fetchLeads, fetchLots])

  function handleLogin(key) { setAdminKey(key); setAuthed(true) }
  function logout() { localStorage.removeItem("ll_ak"); setAdminKey(""); setAuthed(false); setLeads([]) }
  function handleUpdate(updated) { setLeads(prev => prev.map(l => l.id === updated.id ? updated : l)) }

  if (!authed) return <LoginGate onLogin={handleLogin} />

  const byStage = Object.fromEntries(
    STAGES.map(s => [s.id, leads.filter(l => (l.stage || "novo") === s.id)])
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-5 py-3 flex items-center gap-3 shrink-0">
        <div>
          <div className="text-amber-400 text-[10px] font-bold tracking-widest uppercase leading-none">Leilão Leads</div>
          <div className="text-white font-bold text-sm">
            CRM
            <span className="ml-2 text-zinc-500 font-normal">{leads.length} leads</span>
          </div>
        </div>
        <div className="flex-1" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-amber-500 max-w-[180px] truncate">
          <option value="">Todos os lotes</option>
          {lots.map(l => <option key={l.slug} value={l.slug}>{l.title}</option>)}
        </select>
        <button onClick={() => fetchLeads(adminKey, filter)} disabled={loading}
          className="text-zinc-400 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition"
          title="Atualizar">
          {loading ? "⟳" : "↺"}
        </button>
        <button onClick={logout}
          className="text-zinc-500 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition">
          Sair
        </button>
      </header>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 h-full" style={{ minWidth: "max-content" }}>
          {STAGES.map(s => {
            const c = COL[s.col]
            const cards = byStage[s.id] || []
            return (
              <div key={s.id}
                className={`w-60 flex flex-col rounded-2xl border ${c.border} ${c.bg}`}
                style={{ minHeight: "calc(100vh - 160px)" }}>
                <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
                  <span className={`font-semibold text-sm ${c.head}`}>{s.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${c.badge}`}>{cards.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {loading && cards.length === 0 && (
                    <div className="text-zinc-700 text-xs text-center py-8">Carregando…</div>
                  )}
                  {!loading && cards.length === 0 && (
                    <div className="text-zinc-800 text-xs text-center py-8">Vazio</div>
                  )}
                  {cards.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => setSelected(lead)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <LeadModal
          lead={selected}
          adminKey={adminKey}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
