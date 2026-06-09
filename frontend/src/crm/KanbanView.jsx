import { useState } from "react"
import { STAGES, COL, fmtDate, fmtPhone, StageBadge, LeadModal } from "./shared"

function LeadCard({ lead, onClick }) {
  const lot = lead.leilao_lots?.title || lead.lot_slug || "—"
  return (
    <button onClick={onClick}
      className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 space-y-2 transition group">
      <div className="flex items-start justify-between gap-2">
        <span className="text-white font-semibold text-sm leading-snug">{lead.nome}</span>
        {lead.whatsapp_sent && (
          <span className="shrink-0 text-[10px] bg-green-900/80 text-green-400 px-1.5 py-0.5 rounded-full font-bold">WA✓</span>
        )}
      </div>
      <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-amber-400 text-xs hover:underline block">
        {fmtPhone(lead.whatsapp)}
      </a>
      <div className="text-zinc-500 text-xs truncate">{lot}</div>
      {lead.notas && (
        <div className="text-zinc-400 text-[11px] bg-zinc-800 rounded-lg px-2 py-1 line-clamp-2">{lead.notas}</div>
      )}
      <div className="text-zinc-600 text-[11px]">{fmtDate(lead.created_at)}</div>
    </button>
  )
}

export default function KanbanView({ leads, adminKey, onUpdate }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState("")

  const filtered = filter
    ? leads.filter(l => (l.stage || "novo") === filter || filter === "")
    : leads

  const byStage = Object.fromEntries(
    STAGES.map(s => [s.id, filtered.filter(l => (l.stage || "novo") === s.id)])
  )

  return (
    <div className="flex flex-col h-full">
      {/* Filtro rápido */}
      <div className="px-6 pt-4 pb-2 flex gap-2 flex-wrap">
        <button onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!filter ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
          Todos ({leads.length})
        </button>
        {STAGES.map(s => {
          const cnt = leads.filter(l => (l.stage||"novo") === s.id).length
          if (cnt === 0) return null
          return (
            <button key={s.id} onClick={() => setFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === s.id ? `${COL[s.col].badge} text-white` : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>
              {s.label} ({cnt})
            </button>
          )
        })}
      </div>

      {/* Colunas */}
      <div className="flex-1 overflow-x-auto p-4 pt-2">
        <div className="flex gap-3 h-full" style={{ minWidth: "max-content" }}>
          {STAGES.map(s => {
            const c = COL[s.col]
            const cards = byStage[s.id] || []
            return (
              <div key={s.id} className={`w-60 flex flex-col rounded-2xl border ${c.border} ${c.bg}`}
                style={{ minHeight: "calc(100vh - 200px)" }}>
                <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
                  <span className={`font-semibold text-sm ${c.head}`}>{s.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${c.badge}`}>{cards.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {cards.length === 0 && (
                    <div className="text-zinc-800 text-xs text-center py-10">Vazio</div>
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
        <LeadModal lead={selected} adminKey={adminKey}
          onClose={() => setSelected(null)}
          onUpdate={updated => { onUpdate(updated); setSelected(null) }} />
      )}
    </div>
  )
}
