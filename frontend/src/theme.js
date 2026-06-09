export const defaultTenant = {
  lender: {
    name: "Gustavo Ferreira",
    role: "Leiloeiro Oficial & Consultor de Investimentos",
    initials: "GF",
    logoUrl: null,
    whatsapp: "5561999990000",
    phoneLabel: "(61) 99999-0000",
    site: "gustavoferreira.lance.com.br",
    register: "JUCIS/DF nº 12/2021",
  },
  theme: {
    brand:    "201 164 92",
    brand2:   "224 199 142",
    profit:   "46 191 122",
    live:     "228 92 78",
    bg:       "10 10 12",
    surface:  "21 21 25",
    surface2: "29 29 34",
    line:     "45 45 52",
    ink:      "245 243 238",
    muted:    "162 161 169",
    faint:    "108 107 116",
  },
}

export function themeToCssVars(theme = defaultTenant.theme) {
  return {
    "--c-brand":     theme.brand,
    "--c-brand2":    theme.brand2,
    "--c-profit":    theme.profit,
    "--c-live":      theme.live,
    "--c-bg":        theme.bg,
    "--c-surface":   theme.surface,
    "--c-surface-2": theme.surface2,
    "--c-line":      theme.line,
    "--c-ink":       theme.ink,
    "--c-muted":     theme.muted,
    "--c-faint":     theme.faint,
  }
}

export const demoLot = {
  id: "demo",
  slug: "demo",
  code: "LOTE 12",
  type: "Terreno",
  title: "Condomínio Alpha",
  subtitle: "Setor de Mansões",
  city: "Brasília",
  state: "DF",
  region: "Park Way",
  startingBid: 145000,
  marketValue: 320000,
  auctionEndsAt: new Date(Date.now() + 1000 * 60 * (60 * (24 * 3 + 7) + 42)).toISOString(),
  modality: "Leilão Extrajudicial — 1ª Praça",
  features: [
    { key: "area",  label: "Área total",  value: "800", unit: "m²", icon: "area" },
    { key: "front", label: "Frente",      value: "20",  unit: "m",  icon: "ruler" },
    { key: "topo",  label: "Topografia",  value: "Plana",           icon: "terrain" },
    { key: "zone",  label: "Zoneamento",  value: "Residencial",     icon: "zone" },
  ],
  specs: [
    { label: "Cidade",      value: "Brasília" },
    { label: "Estado",      value: "DF" },
    { label: "Bairro",      value: "Setor de Mansões — Park Way" },
    { label: "Matrícula",   value: "nº 123.456 — 4º CRI/DF" },
    { label: "Modalidade",  value: "Leilão Extrajudicial" },
    { label: "Ocupação",    value: "Desocupado" },
  ],
  highlights: [
    { icon: "doc",   title: "Documentação regularizada", text: "Matrícula limpa, sem ônus, hipotecas ou pendências no cartório de registro." },
    { icon: "road",  title: "Infraestrutura completa",   text: "Asfalto, água, energia e esgoto já instalados na via — pronto para construir." },
    { icon: "trend", title: "Preço abaixo do mercado",   text: "Lance inicial com desconto real frente ao valor de avaliação do imóvel." },
  ],
  photos: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
    "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=900&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80",
  ],
  visibleCount: 2,
  mapsUrl: "https://maps.google.com/?q=-15.7801,-47.9292",
  pdfUrl: null,
}

// ── helpers ────────────────────────────────────────────────────────────────────
export const fmtBRL = (n) =>
  n == null || isNaN(n) ? "—" : "R$ " + Math.round(n).toLocaleString("pt-BR")

export const fmtBRLk = (n) =>
  n == null || isNaN(n) ? "—"
    : n >= 1000
    ? "R$ " + (n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil"
    : fmtBRL(n)

export const maskPhone = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d.replace(/(\d{0,2})/, "($1")
  if (d.length <= 6) return d.replace(/(\d{2})(\d{0,5})/, "($1) $2")
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
}

export const isValidPhone = (v) => {
  const d = (v || "").replace(/\D/g, "")
  return d.length === 11 && d[2] === "9"
}

export const waLink = (lender, lot) => {
  const msg = encodeURIComponent(
    `Olá! Tenho interesse no ${lot.code} — ${lot.title}, ${lot.subtitle} (${lot.city}/${lot.state}).`
  )
  return `https://wa.me/${lender.whatsapp}?text=${msg}`
}

/** Adapta o formato da API para o formato do componente */
export function adaptApiLot(apiLot) {
  if (!apiLot) return null
  return {
    id:           apiLot.id,
    slug:         apiLot.slug,
    code:         apiLot.code      || `LOTE ${apiLot.slug?.toUpperCase()}`,
    type:         apiLot.type      || "Terreno",
    title:        apiLot.title     || "Terreno em Leilão",
    subtitle:     apiLot.subtitle  || apiLot.description || "",
    city:         apiLot.city      || "—",
    state:        apiLot.state     || "—",
    region:       apiLot.region    || apiLot.city || "—",
    startingBid:  apiLot.price_from,
    marketValue:  apiLot.price_to  || (apiLot.price_from ? Math.round(apiLot.price_from * 1.5) : 0),
    auctionEndsAt: apiLot.auction_date
      ? new Date(apiLot.auction_date + "T18:00:00").toISOString()
      : new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    modality:     apiLot.modality  || "Leilão Extrajudicial",
    features: [
      { key: "area",  label: "Área total", value: String(apiLot.area_m2 || "—"), unit: "m²", icon: "area" },
      { key: "front", label: "Frente",     value: apiLot.frontage ? String(apiLot.frontage) : "—", unit: "m", icon: "ruler" },
      { key: "topo",  label: "Topografia", value: apiLot.topography || "Plana", icon: "terrain" },
      { key: "zone",  label: "Zoneamento", value: apiLot.zoning     || "Residencial", icon: "zone" },
    ],
    specs: [
      { label: "Cidade",     value: apiLot.city  || "—" },
      { label: "Estado",     value: apiLot.state || "—" },
      { label: "Bairro",     value: apiLot.region || apiLot.neighborhood || "—" },
      { label: "Matrícula",  value: apiLot.registration || "—" },
      { label: "Modalidade", value: apiLot.modality || "Leilão Extrajudicial" },
      { label: "Ocupação",   value: apiLot.occupation || "Desocupado" },
    ],
    highlights: apiLot.highlights || [
      { icon: "doc",   title: "Documentação regularizada", text: "Matrícula limpa, sem ônus, hipotecas ou pendências no cartório de registro." },
      { icon: "road",  title: "Infraestrutura completa",   text: "Asfalto, água, energia e esgoto já instalados na via — pronto para construir." },
      { icon: "trend", title: "Preço abaixo do mercado",   text: "Lance inicial com desconto real frente ao valor de avaliação do imóvel." },
    ],
    photos:       (apiLot.photos || []).map(p => p.url || p),
    visibleCount: 2,
    mapsUrl:      apiLot.lat && apiLot.lng ? `https://maps.google.com/?q=${apiLot.lat},${apiLot.lng}` : null,
    pdfUrl:       apiLot.pdf_url || null,
  }
}
