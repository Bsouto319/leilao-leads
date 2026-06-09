import { useState } from "react"
import { fmtBRL, fmtDate } from "./shared"

function LotCard({ lot, leads, onClick }) {
  const lotLeads = leads.filter(l => l.lot_slug === lot.slug)
  const fechados = lotLeads.filter(l => l.stage === "fechado").length
  const lp = `${window.location.origin}/?lot=${lot.slug}`

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Thumb */}
      <div className="h-36 bg-zinc-800 overflow-hidden relative">
        {lot.photos?.[0]?.url || lot.photos?.[0] ? (
          <img src={lot.photos[0]?.url || lot.photos[0]} alt={lot.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-700 text-4xl">🏡</div>
        )}
        <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${lot.active ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-400"}`}>
          {lot.active ? "Ativo" : "Inativo"}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-bold leading-snug">{lot.title}</h3>
          <p className="text-zinc-500 text-xs">{lot.city}/{lot.state} · {lot.area_m2 ? `${lot.area_m2}m²` : ""}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-800 rounded-lg p-2">
            <div className="text-zinc-500">Lance mín.</div>
            <div className="text-amber-400 font-bold">{fmtBRL(lot.price_from)}</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2">
            <div className="text-zinc-500">Leilão</div>
            <div className="text-white font-medium">
              {lot.auction_date ? new Date(lot.auction_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
            </div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2">
            <div className="text-zinc-500">Leads</div>
            <div className="text-blue-400 font-bold">{lotLeads.length}</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-2">
            <div className="text-zinc-500">Fechados</div>
            <div className="text-green-400 font-bold">{fechados}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onClick(lot)}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-xl text-xs transition">
            Editar
          </button>
          <a href={lp} target="_blank" rel="noreferrer"
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 rounded-xl text-xs transition text-center">
            Ver LP ↗
          </a>
        </div>
      </div>
    </div>
  )
}

const BLANK = {
  slug: "", title: "", description: "", city: "", state: "DF",
  area_m2: "", price_from: "", price_to: "", auction_date: "",
  auction_url: "", lat: "", lng: "", pdf_url: "",
  full_description: "", photos_raw: "", active: true,
}

function LotForm({ lot, adminKey, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    ...BLANK,
    ...lot,
    photos_raw: lot?.photos
      ? lot.photos.map(p => p.url || p).join("\n")
      : "",
  }))
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState("")

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.slug || !form.title) { setErr("Slug e título são obrigatórios"); return }
    setSaving(true); setErr("")
    const photos = form.photos_raw
      .split("\n").map(s => s.trim()).filter(Boolean)
      .map(url => ({ url }))

    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      title: form.title,
      description: form.description,
      full_description: form.full_description,
      city: form.city,
      state: form.state,
      area_m2: form.area_m2 ? Number(form.area_m2) : null,
      price_from: form.price_from ? Number(form.price_from) : null,
      price_to: form.price_to ? Number(form.price_to) : null,
      auction_date: form.auction_date || null,
      auction_url: form.auction_url || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      pdf_url: form.pdf_url || null,
      photos,
      active: form.active,
    }

    try {
      const r = await fetch("/api/admin/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(payload),
      })
      if (!r.ok) { const d = await r.json(); setErr(d.error || "Erro ao salvar"); return }
      onSave(await r.json())
      onClose()
    } catch (e) { setErr("Erro de conexão") }
    finally { setSaving(false) }
  }

  const F = ({ label, children }) => (
    <div>
      <label className="text-zinc-400 text-xs font-bold uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
    </div>
  )

  const input = (k, props = {}) => (
    <input value={form[k] ?? ""} onChange={e => set(k, e.target.value)}
      className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2.5 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm placeholder-zinc-600"
      {...props} />
  )

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-white font-bold text-lg">{lot?.id ? "Editar Lote" : "Novo Lote"}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition text-xl">×</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <F label="Slug (URL)">
            {input("slug", { placeholder: "ex: terreno-plano-brasilia" })}
            <p className="text-zinc-600 text-xs mt-1">Usado na LP: /?lot=<strong>{form.slug || "slug"}</strong></p>
          </F>
          <F label="Título">{input("title", { placeholder: "Terreno 600m² Residencial Bela Vista" })}</F>

          <F label="Cidade">{input("city", { placeholder: "Brasília" })}</F>
          <F label="Estado">{input("state", { placeholder: "DF" })}</F>

          <F label="Área (m²)">{input("area_m2", { type:"number", placeholder:"600" })}</F>
          <F label="Preço mercado (R$)">{input("price_to", { type:"number", placeholder:"150000" })}</F>

          <F label="Lance mínimo (R$)">{input("price_from", { type:"number", placeholder:"95000" })}</F>
          <F label="Data do leilão">{input("auction_date", { type:"date" })}</F>

          <F label="URL do leilão">{input("auction_url", { placeholder: "https://leilao.com.br/..." })}</F>
          <F label="URL do PDF">{input("pdf_url", { placeholder: "https://..." })}</F>

          <F label="Latitude">{input("lat", { placeholder: "-15.7801" })}</F>
          <F label="Longitude">{input("lng", { placeholder: "-47.9292" })}</F>

          <div className="md:col-span-2">
            <F label="Descrição curta">
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={2} placeholder="Visível antes do cadastro..."
                className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm placeholder-zinc-600 resize-none" />
            </F>
          </div>

          <div className="md:col-span-2">
            <F label="Descrição completa (desbloqueada após cadastro)">
              <textarea value={form.full_description} onChange={e => set("full_description", e.target.value)}
                rows={4} placeholder="Matrícula, dimensões, zoneamento, infraestrutura..."
                className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm placeholder-zinc-600 resize-none" />
            </F>
          </div>

          <div className="md:col-span-2">
            <F label="Fotos (uma URL por linha)">
              <textarea value={form.photos_raw} onChange={e => set("photos_raw", e.target.value)}
                rows={4} placeholder={"https://exemplo.com/foto1.jpg\nhttps://exemplo.com/foto2.jpg"}
                className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:border-amber-500 transition text-sm placeholder-zinc-600 resize-none font-mono text-xs" />
            </F>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button type="button" onClick={() => set("active", !form.active)}
              className={`relative w-11 h-6 rounded-full transition ${form.active ? "bg-green-500" : "bg-zinc-700"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-5" : ""}`} />
            </button>
            <span className="text-zinc-300 text-sm">{form.active ? "Lote ativo (visível na LP)" : "Lote inativo (oculto)"}</span>
          </div>

          {err && <div className="md:col-span-2 text-red-400 text-sm bg-red-900/20 rounded-xl px-4 py-3">{err}</div>}

          <div className="md:col-span-2 flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition font-medium">Cancelar</button>
            <button onClick={save} disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition">
              {saving ? "Salvando…" : "Salvar Lote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LotesPage({ lots, leads, adminKey, onLotsChange }) {
  const [editLot, setEditLot]   = useState(null)
  const [creating, setCreating] = useState(false)

  function handleSave(saved) {
    const exists = lots.find(l => l.id === saved.id || l.slug === saved.slug)
    if (exists) onLotsChange(lots.map(l => (l.slug === saved.slug ? saved : l)))
    else         onLotsChange([saved, ...lots])
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Lotes em Leilão</h2>
          <p className="text-zinc-500 text-sm">{lots.length} lote{lots.length !== 1 ? "s" : ""} cadastrado{lots.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition">
          + Novo Lote
        </button>
      </div>

      {lots.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <div className="text-6xl mb-4">🏡</div>
          <div className="text-lg font-medium text-zinc-500 mb-2">Nenhum lote cadastrado</div>
          <button onClick={() => setCreating(true)} className="text-amber-400 hover:underline text-sm">Criar primeiro lote →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {lots.map(l => (
            <LotCard key={l.id || l.slug} lot={l} leads={leads} onClick={setEditLot} />
          ))}
        </div>
      )}

      {(creating || editLot) && (
        <LotForm
          lot={editLot}
          adminKey={adminKey}
          onSave={handleSave}
          onClose={() => { setCreating(false); setEditLot(null) }} />
      )}
    </div>
  )
}
