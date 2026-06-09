import { useMemo } from "react"
import { STAGES, fmtBRL, fmtDate, StageBadge, LeadModal } from "./shared"
import { useState } from "react"

function MetricCard({ label, value, sub, color = "amber" }) {
  const colors = { amber:"text-amber-400", green:"text-green-400", blue:"text-blue-400", violet:"text-violet-400", red:"text-red-400" }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
      {sub && <div className="text-zinc-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

function FunnelBar({ stage, count, max }) {
  const c = { blue:"bg-blue-600", violet:"bg-violet-600", amber:"bg-amber-500", orange:"bg-orange-600", green:"bg-green-600", red:"bg-red-700" }
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-zinc-400 shrink-0 text-right">{stage.label}</div>
      <div className="flex-1 bg-zinc-800 rounded-full h-6 overflow-hidden">
        <div className={`h-full rounded-full ${c[stage.col]} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 text-right text-white text-sm font-bold shrink-0">{count}</div>
    </div>
  )
}

function LotRow({ lot, leads }) {
  const lotLeads  = leads.filter(l => l.lot_slug === lot.slug)
  const total     = lotLeads.length
  const qualif    = lotLeads.filter(l => ["qualificado","proposta","fechado"].includes(l.stage)).length
  const fechados  = lotLeads.filter(l => l.stage === "fechado").length
  const pctQualif = total > 0 ? Math.round((qualif / total) * 100) : 0
  const pctFechado = total > 0 ? Math.round((fechados / total) * 100) : 0

  return (
    <tr className="border-t border-zinc-800 hover:bg-zinc-800/40 transition">
      <td className="py-3 px-4">
        <div className="text-white font-medium text-sm">{lot.title}</div>
        <div className="text-zinc-500 text-xs">{lot.city}/{lot.state} · {lot.area_m2}m²</div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-white font-bold">{total}</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={`text-sm font-bold ${pctQualif >= 30 ? "text-amber-400" : "text-zinc-400"}`}>{pctQualif}%</span>
      </td>
      <td className="py-3 px-4 text-center">
        <span className={`text-sm font-bold ${pctFechado >= 10 ? "text-green-400" : "text-zinc-400"}`}>{pctFechado}%</span>
      </td>
      <td className="py-3 px-4 text-right text-zinc-400 text-sm">
        {lot.price_from ? fmtBRL(lot.price_from) : "—"}
      </td>
    </tr>
  )
}

export default function Dashboard({ leads, lots, adminKey, onUpdate }) {
  const [selected, setSelected] = useState(null)

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d
  }, [])

  const metrics = useMemo(() => {
    const total     = leads.length
    const todayLeads = leads.filter(l => new Date(l.created_at) >= today).length
    const emNegoc   = leads.filter(l => ["qualificado","proposta"].includes(l.stage)).length
    const fechados  = leads.filter(l => l.stage === "fechado").length
    const perdidos  = leads.filter(l => l.stage === "perdido").length
    const conversao = total > 0 ? Math.round((fechados / total) * 100) : 0
    const waSent    = leads.filter(l => l.whatsapp_sent).length
    const waPct     = total > 0 ? Math.round((waSent / total) * 100) : 0

    // pipeline: leads qualificados × preço médio do lote
    let pipeline = 0
    leads.filter(l => ["qualificado","proposta"].includes(l.stage)).forEach(l => {
      const lot = lots.find(x => x.slug === l.lot_slug)
      if (lot?.price_from) pipeline += lot.price_from
    })

    return { total, todayLeads, emNegoc, fechados, perdidos, conversao, waSent, waPct, pipeline }
  }, [leads, lots, today])

  const byStage = useMemo(() =>
    Object.fromEntries(STAGES.map(s => [s.id, leads.filter(l => (l.stage||"novo") === s.id).length]))
  , [leads])

  const maxStage = Math.max(...Object.values(byStage), 1)

  const recentLeads = useMemo(() =>
    [...leads].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8)
  , [leads])

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total de Leads" value={metrics.total} sub={`${metrics.todayLeads} hoje`} color="blue" />
        <MetricCard label="Em Negociação" value={metrics.emNegoc} sub="qualificados + proposta" color="amber" />
        <MetricCard label="Conversão" value={`${metrics.conversao}%`} sub={`${metrics.fechados} fechados`} color="green" />
        <MetricCard label="Pipeline de Valor" value={fmtBRL(metrics.pipeline)} sub="qualificados × preço do lote" color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil visual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Funil de Vendas</h3>
          <div className="space-y-3">
            {STAGES.map(s => (
              <FunnelBar key={s.id} stage={s} count={byStage[s.id] || 0} max={maxStage} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-4 text-xs text-zinc-500">
            <span>WA enviados: <strong className="text-white">{metrics.waSent}</strong> ({metrics.waPct}%)</span>
            <span>Perdidos: <strong className="text-red-400">{metrics.perdidos}</strong></span>
          </div>
        </div>

        {/* Performance por lote */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Performance por Lote</h3>
          {lots.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-8">Nenhum lote cadastrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-xs">
                    <th className="text-left pb-3 px-4">Lote</th>
                    <th className="text-center pb-3 px-4">Leads</th>
                    <th className="text-center pb-3 px-4">Qualif.</th>
                    <th className="text-center pb-3 px-4">Fech.</th>
                    <th className="text-right pb-3 px-4">Lance mín.</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map(l => <LotRow key={l.slug} lot={l} leads={leads} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Leads recentes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Leads Recentes</h3>
        {recentLeads.length === 0 ? (
          <div className="text-zinc-600 text-sm text-center py-8">Nenhum lead ainda</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-left pb-3 pr-4">Nome</th>
                  <th className="text-left pb-3 pr-4">Lote</th>
                  <th className="text-left pb-3 pr-4">Etapa</th>
                  <th className="text-left pb-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map(l => (
                  <tr key={l.id} onClick={() => setSelected(l)}
                    className="border-t border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition">
                    <td className="py-2.5 pr-4">
                      <div className="text-white font-medium">{l.nome}</div>
                      <div className="text-zinc-500 text-xs">
                        {l.whatsapp ? l.whatsapp.replace(/^55/, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : "—"}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-zinc-400 text-xs max-w-[140px] truncate">
                      {l.leilao_lots?.title || l.lot_slug || "—"}
                    </td>
                    <td className="py-2.5 pr-4"><StageBadge stage={l.stage || "novo"} /></td>
                    <td className="py-2.5 text-zinc-500 text-xs whitespace-nowrap">{fmtDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <LeadModal lead={selected} adminKey={adminKey}
          onClose={() => setSelected(null)}
          onUpdate={updated => { onUpdate(updated); setSelected(null) }} />
      )}
    </div>
  )
}
