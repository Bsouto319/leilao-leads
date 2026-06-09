import { useState, useMemo } from "react"
import { STAGES, fmtDate, fmtPhone, StageBadge, LeadModal } from "./shared"

const PAGE_SIZE = 20

export default function LeadsTable({ leads, lots, adminKey, onUpdate }) {
  const [search, setSearch]     = useState("")
  const [stageF, setStageF]     = useState("")
  const [lotF, setLotF]         = useState("")
  const [waF, setWaF]           = useState("")
  const [sortBy, setSortBy]     = useState("date_desc")
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let arr = [...leads]
    if (search) {
      const q = search.toLowerCase()
      arr = arr.filter(l => l.nome?.toLowerCase().includes(q) || l.whatsapp?.includes(q))
    }
    if (stageF) arr = arr.filter(l => (l.stage || "novo") === stageF)
    if (lotF)   arr = arr.filter(l => l.lot_slug === lotF)
    if (waF === "yes") arr = arr.filter(l => l.whatsapp_sent)
    if (waF === "no")  arr = arr.filter(l => !l.whatsapp_sent)
    arr.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === "date_asc")  return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === "nome")      return (a.nome||"").localeCompare(b.nome||"")
      return 0
    })
    return arr
  }, [leads, search, stageF, lotF, waF, sortBy])

  const pages     = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function clearFilters() {
    setSearch(""); setStageF(""); setLotF(""); setWaF(""); setPage(1)
  }

  function handleUpdate(updated) {
    onUpdate(updated)
    setSelected(null)
  }

  const hasFilters = search || stageF || lotF || waF

  return (
    <div className="p-6 space-y-4">
      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar nome ou WhatsApp…"
          className="bg-zinc-800 text-white rounded-xl px-4 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm w-56 placeholder-zinc-500" />

        <select value={stageF} onChange={e => { setStageF(e.target.value); setPage(1) }}
          className="bg-zinc-800 text-white rounded-xl px-3 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm">
          <option value="">Todas etapas</option>
          {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        <select value={lotF} onChange={e => { setLotF(e.target.value); setPage(1) }}
          className="bg-zinc-800 text-white rounded-xl px-3 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm max-w-[200px]">
          <option value="">Todos os lotes</option>
          {lots.map(l => <option key={l.slug} value={l.slug}>{l.title}</option>)}
        </select>

        <select value={waF} onChange={e => { setWaF(e.target.value); setPage(1) }}
          className="bg-zinc-800 text-white rounded-xl px-3 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm">
          <option value="">WhatsApp: todos</option>
          <option value="yes">WA enviado</option>
          <option value="no">WA pendente</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-zinc-800 text-white rounded-xl px-3 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm">
          <option value="date_desc">Mais recentes</option>
          <option value="date_asc">Mais antigos</option>
          <option value="nome">Nome A-Z</option>
        </select>

        {hasFilters && (
          <button onClick={clearFilters}
            className="text-zinc-400 hover:text-white text-sm px-3 py-2.5 rounded-xl hover:bg-zinc-800 transition">
            ✕ Limpar
          </button>
        )}

        <div className="ml-auto text-zinc-500 text-sm">
          {filtered.length} leads
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                <th className="text-left py-3 px-5 font-semibold">Nome</th>
                <th className="text-left py-3 px-4 font-semibold">WhatsApp</th>
                <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Lote</th>
                <th className="text-left py-3 px-4 font-semibold">Etapa</th>
                <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">Capturado</th>
                <th className="py-3 px-4 text-center font-semibold">WA</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="text-center text-zinc-600 py-12">Nenhum lead encontrado</td></tr>
              )}
              {paginated.map(l => (
                <tr key={l.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition"
                  onClick={() => setSelected(l)}>
                  <td className="py-3 px-5">
                    <div className="text-white font-semibold">{l.nome}</div>
                  </td>
                  <td className="py-3 px-4">
                    <a href={`https://wa.me/${l.whatsapp}`} target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-amber-400 hover:underline text-xs">
                      {fmtPhone(l.whatsapp)}
                    </a>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-zinc-400 text-xs max-w-[160px] truncate">
                    {l.leilao_lots?.title || l.lot_slug || "—"}
                  </td>
                  <td className="py-3 px-4"><StageBadge stage={l.stage || "novo"} /></td>
                  <td className="py-3 px-4 hidden lg:table-cell text-zinc-500 text-xs whitespace-nowrap">
                    {fmtDate(l.created_at)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {l.whatsapp_sent
                      ? <span className="text-green-400 text-xs font-bold">✓</span>
                      : <span className="text-zinc-700 text-xs">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={e => { e.stopPropagation(); setSelected(l) }}
                      className="text-zinc-500 hover:text-amber-400 text-xs px-2 py-1 rounded hover:bg-zinc-800 transition">
                      Editar →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {pages > 1 && (
          <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="text-zinc-400 hover:text-white disabled:opacity-30 text-sm transition px-3 py-1.5 rounded-lg hover:bg-zinc-800">
              ← Anterior
            </button>
            <span className="text-zinc-500 text-xs">{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="text-zinc-400 hover:text-white disabled:opacity-30 text-sm transition px-3 py-1.5 rounded-lg hover:bg-zinc-800">
              Próxima →
            </button>
          </div>
        )}
      </div>

      {selected && (
        <LeadModal lead={selected} adminKey={adminKey}
          onClose={() => setSelected(null)} onUpdate={handleUpdate} />
      )}
    </div>
  )
}
