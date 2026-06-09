import { useState } from "react"

export const STAGES = [
  { id: "novo",        label: "Novo",         col: "blue"   },
  { id: "contatado",   label: "Contatado",    col: "violet" },
  { id: "qualificado", label: "Qualificado",  col: "amber"  },
  { id: "proposta",    label: "Em Proposta",  col: "orange" },
  { id: "fechado",     label: "Fechado",      col: "green"  },
  { id: "perdido",     label: "Perdido",      col: "red"    },
]

export const COL = {
  blue:   { bg:"bg-blue-950/40",   border:"border-blue-900",   badge:"bg-blue-600",   head:"text-blue-400"   },
  violet: { bg:"bg-violet-950/40", border:"border-violet-900", badge:"bg-violet-600", head:"text-violet-400" },
  amber:  { bg:"bg-amber-950/40",  border:"border-amber-900",  badge:"bg-amber-500",  head:"text-amber-400"  },
  orange: { bg:"bg-orange-950/40", border:"border-orange-900", badge:"bg-orange-600", head:"text-orange-400" },
  green:  { bg:"bg-green-950/40",  border:"border-green-900",  badge:"bg-green-600",  head:"text-green-400"  },
  red:    { bg:"bg-red-950/40",    border:"border-red-900",    badge:"bg-red-700",    head:"text-red-400"    },
}

export const WA_TEMPLATES = [
  { label: "Boas-vindas",    text: (n, l) => `Olá ${n}! 👋 Vi que você se cadastrou para o lote *${l}*. Sou seu consultor — posso tirar suas dúvidas agora?` },
  { label: "Leilão próximo", text: (n, l) => `Olá ${n}! O leilão do *${l}* está se aproximando. Precisa de ajuda com documentação ou financiamento?` },
  { label: "Follow-up",      text: (n)    => `Olá ${n}, tudo bem? Queria saber se ainda tem interesse em adquirir um terreno. Temos novas oportunidades! 🏡` },
  { label: "Proposta",       text: (n, l) => `Olá ${n}! Preparei uma proposta exclusiva para o *${l}*. Posso te enviar os detalhes?` },
]

export function fmtDate(iso, short = false) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (short) return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit" })
  return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" })
}

export function fmtPhone(d = "") {
  const n = d.replace(/\D/g, "")
  if (n.length === 13) return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,9)}-${n.slice(9)}`
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`
  return d || "—"
}

export function fmtBRL(n) {
  if (!n && n !== 0) return "—"
  return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL", maximumFractionDigits:0 }).format(n)
}

export function StageBadge({ stage }) {
  const s = STAGES.find(x => x.id === stage) || STAGES[0]
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${COL[s.col].badge}`}>{s.label}</span>
}

// ─── Lead Modal ───────────────────────────────────────────────────────────────

export function LeadModal({ lead, adminKey, onClose, onUpdate }) {
  const [stage, setStage]       = useState(lead.stage || "novo")
  const [notas, setNotas]       = useState(lead.notas || "")
  const [followUp, setFollowUp] = useState("")
  const [tpl, setTpl]           = useState(null)
  const [saving, setSaving]     = useState(false)

  const lot   = lead.leilao_lots
  const lotLabel = lot?.title || lead.lot_slug || "lote"

  async function save() {
    setSaving(true)
    const extra = followUp ? `\n📅 Retorno: ${new Date(followUp).toLocaleString("pt-BR")}` : ""
    const finalNotas = notas + extra
    try {
      const r = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ stage, notas: finalNotas }),
      })
      if (r.ok) { onUpdate({ ...lead, stage, notas: finalNotas }); onClose() }
    } finally { setSaving(false) }
  }

  const waText = tpl != null ? WA_TEMPLATES[tpl].text(lead.nome, lotLabel) : ""

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-y-auto max-h-[92vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-white font-bold text-xl leading-tight">{lead.nome}</h2>
            <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noreferrer"
              className="text-amber-400 text-sm hover:underline mt-0.5 block">
              {fmtPhone(lead.whatsapp)}
            </a>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {lead.whatsapp_sent && <span className="text-[11px] bg-green-900/80 text-green-400 px-2 py-0.5 rounded-full font-bold">WA ✓</span>}
            <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition text-xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {lot && (
              <div className="col-span-2 bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-xs">Lote</div>
                <div className="text-white font-semibold">{lot.title}</div>
                {lot.city && <div className="text-zinc-400 text-xs">{lot.city}/{lot.state}</div>}
              </div>
            )}
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs">Capturado</div>
              <div className="text-white text-xs font-medium">{fmtDate(lead.created_at)}</div>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <div className="text-zinc-500 text-xs">Atualizado</div>
              <div className="text-white text-xs font-medium">{fmtDate(lead.updated_at)}</div>
            </div>
            {lead.region_interest && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-xs">Região</div>
                <div className="text-white text-sm font-medium">{lead.region_interest}</div>
              </div>
            )}
            {lead.price_range && (
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-xs">Faixa de preço</div>
                <div className="text-white text-sm font-medium">{lead.price_range}</div>
              </div>
            )}
          </div>

          {/* WhatsApp templates */}
          <div>
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Mensagem WhatsApp</div>
            <div className="flex gap-2 flex-wrap mb-2">
              {WA_TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setTpl(tpl === i ? null : i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    tpl === i ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
            {tpl != null && (
              <div className="bg-zinc-800 rounded-xl p-3 text-sm text-zinc-300 mb-2">{waText}</div>
            )}
            <a href={`https://wa.me/${lead.whatsapp}${tpl != null ? "?text=" + encodeURIComponent(waText) : ""}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-700 hover:bg-green-600 rounded-xl text-white text-sm font-bold transition">
              💬 Abrir WhatsApp
            </a>
          </div>

          {/* Stage */}
          <div>
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Etapa do Funil</div>
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

          {/* Follow-up */}
          <div>
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Agendar Retorno</div>
            <input type="datetime-local" value={followUp} onChange={e => setFollowUp(e.target.value)}
              className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm" />
          </div>

          {/* Notas */}
          <div>
            <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Notas & Histórico</div>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              rows={4} placeholder="Objeções, interesses, histórico de contato..."
              className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition placeholder-zinc-600 resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition text-sm font-medium">Cancelar</button>
            <button onClick={save} disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition">
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
