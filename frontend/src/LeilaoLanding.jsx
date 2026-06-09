import React, { useState, useEffect } from "react"
import {
  defaultTenant, demoLot, themeToCssVars,
  fmtBRL, fmtBRLk, maskPhone, isValidPhone, waLink,
} from "./theme"

/* ── Ícones ── */
const PATHS = {
  area:    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18" opacity=".5"/>',
  ruler:   '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  terrain: '<path d="m3 18 5-7 4 5 3-4 6 6"/><path d="M3 21h18"/>',
  zone:    '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>',
  bed:     '<path d="M2 9V5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4M2 11h20v6M2 17v3M22 17v3M2 11a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3"/>',
  car:     '<path d="M5 13 6.5 8.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13M5 13h14v5H5zM7 18v2M17 18v2"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/>',
  pin:     '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  arrow:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
  lock:    '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check:   '<path d="M20 6 9 17l-5-5"/>',
  shield:  '<path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  doc:     '<path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M9 13h6M9 17h6"/>',
  road:    '<path d="m4 21 3-18M20 21l-3-18M12 5v2M12 11v2M12 17v2"/>',
  trend:   '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  whats:   '<path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Z"/><path d="M8.5 7.5c-.3 0-.6.1-.8.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2-1.4-.5-.6-.8-1.2-.9-1.4-.1-.2 0-.3.1-.5l.4-.5c.1-.2.1-.3.2-.5 0-.2 0-.3-.1-.4l-.7-1.6c-.1-.3-.3-.3-.5-.3Z" fill="currentColor" stroke="none"/>',
  map:     '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
  expand:  '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  user:    '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  alert:   '<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  badge:   '<path d="M12 2 4 5v6c0 5 3.4 7.8 8 9 4.6-1.2 8-4 8-9V5l-8-3Z"/>',
}
function Icon({ name, className = "", style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className={className} style={style}
      dangerouslySetInnerHTML={{ __html: PATHS[name] || "" }} />
  )
}

/* ── Imagem com skeleton ── */
function SmartImage({ src, alt, className = "", imgClass = "", blur = false }) {
  const [state, setState] = useState("loading")
  return (
    <div className={"relative overflow-hidden bg-surface-2 " + className}>
      {state === "loading" && <div className="absolute inset-0 ll-shimmer" />}
      {state === "error" ? (
        <div className="absolute inset-0 ll-stripes grid place-items-center">
          <span className="font-mono text-[10px] tracking-widest text-faint uppercase">foto do lote</span>
        </div>
      ) : (
        <img src={src} alt={alt} loading="lazy" crossOrigin="anonymous"
          onLoad={() => setState("ok")} onError={() => setState("error")}
          className={"h-full w-full object-cover transition-all duration-700 " + imgClass +
            (state === "ok" ? " opacity-100" : " opacity-0") +
            (blur ? " scale-110 blur-xl brightness-75" : "")} />
      )}
    </div>
  )
}

const Eyebrow = ({ children, className = "" }) => (
  <p className={"font-mono text-[11px] uppercase tracking-[0.28em] text-faint " + className}>{children}</p>
)

const LiveBadge = () => (
  <span className="inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-live">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-70" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
    </span>
    Leilão ao vivo
  </span>
)

/* ── Countdown ── */
function useCountdown(endsAt) {
  const calc = (end) => {
    const ms = Math.max(0, new Date(end).getTime() - Date.now())
    return {
      d: Math.floor(ms / 86400000),
      h: Math.floor((ms % 86400000) / 3600000),
      m: Math.floor((ms % 3600000) / 60000),
      s: Math.floor((ms % 60000) / 1000),
      urgent: ms < 86400000,
    }
  }
  const [t, setT] = useState(() => calc(endsAt))
  useEffect(() => {
    const id = setInterval(() => setT(calc(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])
  return t
}
function Countdown({ endsAt }) {
  const { d, h, m, s, urgent } = useCountdown(endsAt)
  const cells = [{ v: d, l: "dias" }, { v: h, l: "hrs" }, { v: m, l: "min" }, { v: s, l: "seg" }]
  return (
    <div className="flex items-stretch gap-1.5">
      {cells.map((c, i) => (
        <div key={i} className="flex flex-1 flex-col items-center rounded-xl border border-line bg-surface-2/70 px-2 py-2">
          <span className={"font-mono tabular-nums text-2xl font-bold leading-none sm:text-3xl " + (urgent ? "text-live" : "text-ink")}>
            {String(c.v).padStart(2, "0")}
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-faint">{c.l}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Card de investimento ── */
function InvestmentCard({ lot }) {
  const profit = lot.marketValue - lot.startingBid
  const pct    = Math.round((profit / lot.marketValue) * 100)
  const fill   = Math.round((lot.startingBid / lot.marketValue) * 100)
  return (
    <div className="rounded-2xl border border-profit/25 bg-gradient-to-b from-profit/[0.07] to-transparent p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Icon name="trend" className="h-4 w-4 text-profit" />
        <Eyebrow className="text-profit/80">Potencial de valorização</Eyebrow>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted">Lucro estimado</p>
          <p className="whitespace-nowrap font-display text-4xl font-semibold leading-none text-profit sm:text-5xl">{fmtBRL(profit)}</p>
        </div>
        <div className="rounded-lg bg-profit/15 px-2.5 py-1.5 text-right">
          <p className="font-mono text-lg font-bold leading-none text-profit">−{pct}%</p>
          <p className="mt-0.5 text-[10px] text-profit/80">abaixo do mercado</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: fill + "%" }} />
          <div className="absolute inset-y-0 rounded-full bg-profit" style={{ left: fill + "%", right: 0 }} />
        </div>
        <div className="mt-2.5 flex justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full bg-brand" />Lance {fmtBRLk(lot.startingBid)}</span>
          <span className="flex items-center gap-1.5 text-muted">Avaliação {fmtBRLk(lot.marketValue)}</span>
        </div>
      </div>
    </div>
  )
}

const FeatureGrid = ({ features }) => (
  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
    {features.map((f) => (
      <div key={f.key} className="group rounded-xl border border-line bg-surface p-4 transition-colors duration-300 hover:border-brand/40">
        <Icon name={f.icon} className="h-5 w-5 text-brand transition-transform duration-300 group-hover:scale-110" />
        <p className="mt-3 text-lg font-bold text-ink">
          {f.value}{f.unit ? <span className="ml-0.5 text-sm font-medium text-muted">{f.unit}</span> : null}
        </p>
        <p className="mt-0.5 text-xs text-muted">{f.label}</p>
      </div>
    ))}
  </div>
)

const SpecList = ({ specs }) => (
  <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
    {specs.map((s, i) => (
      <div key={i} className="flex items-center justify-between gap-4 px-4 py-3.5">
        <dt className="text-sm text-muted">{s.label}</dt>
        <dd className="text-right text-sm font-semibold text-ink">{s.value}</dd>
      </div>
    ))}
  </dl>
)

function PhotoGallery({ photos, visibleCount, unlocked, onUnlock }) {
  const total = photos.length
  const shown = photos.slice(0, 5)
  const isLocked = (i) => !unlocked && i >= visibleCount
  return (
    <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 sm:grid-rows-2">
      {shown.map((src, i) => {
        const big = i === 0
        return (
          <div key={i} className={"group relative overflow-hidden rounded-2xl " + (big ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square")}>
            <SmartImage src={src} alt={"Foto " + (i + 1)} className="h-full w-full" blur={isLocked(i)}
              imgClass={isLocked(i) ? "" : "transition-transform duration-700 group-hover:scale-105"} />
            {isLocked(i) ? (
              <button onClick={onUnlock} className="absolute inset-0 grid place-items-center bg-bg/40 backdrop-blur-[2px]">
                <span className="flex flex-col items-center gap-1.5 px-2 text-center">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-brand/40 bg-bg/70 text-brand"><Icon name="lock" className="h-4 w-4" /></span>
                  {big && <span className="mt-1 max-w-[16rem] text-xs font-medium text-ink/90">Cadastre-se para liberar as fotos reais do lote</span>}
                </span>
              </button>
            ) : (
              <span className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-bg/55 text-ink opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"><Icon name="expand" className="h-3.5 w-3.5" /></span>
            )}
            {big && <span className="absolute left-3 top-3 rounded-full bg-bg/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur">{total} fotos</span>}
          </div>
        )
      })}
    </div>
  )
}

const HighlightCards = ({ highlights }) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {highlights.map((h, i) => (
      <div key={i} className="group rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand"><Icon name={h.icon} className="h-5 w-5" /></span>
        <h3 className="mt-4 text-base font-bold text-ink">{h.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{h.text}</p>
      </div>
    ))}
  </div>
)

/* ── Formulário ── */
function Field({ label, icon, valid, show, error, children }) {
  const border = show ? (valid ? "border-profit/60" : "border-live/60") : "border-line focus-within:border-brand"
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label} <span className="text-brand">*</span></span>
      <span className={"ll-input-wrap " + border}>
        <Icon name={icon} className="h-4 w-4 shrink-0 text-faint" />
        {children}
        {show && (valid ? <Icon name="check" className="h-4 w-4 shrink-0 text-profit" /> : <Icon name="alert" className="h-4 w-4 shrink-0 text-live" />)}
      </span>
      {show && !valid && <span className="mt-1.5 flex items-center gap-1 text-xs text-live"><Icon name="alert" className="h-3 w-3" />{error}</span>}
    </label>
  )
}

function LeadForm({ lot, onSubmit }) {
  const [name, setName]       = useState("")
  const [phone, setPhone]     = useState("")
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr]         = useState(null)
  const nameOk  = name.trim().length >= 3
  const phoneOk = isValidPhone(phone)
  const formOk  = nameOk && phoneOk
  const benefits = [
    { icon: "pin",   text: "Localização exata no Google Maps" },
    { icon: "map",   text: "Todas as fotos reais do lote" },
    { icon: "doc",   text: "PDF com matrícula e laudo completo" },
    { icon: "whats", text: "Atendimento imediato no WhatsApp" },
  ]
  async function submit(e) {
    e.preventDefault()
    setTouched({ name: true, phone: true })
    if (!formOk || submitting) return
    setSubmitting(true); setErr(null)
    try {
      await onSubmit({ name: name.trim(), phone })
    } catch (_) {
      setErr("Não foi possível liberar agora. Tente novamente.")
      setSubmitting(false)
    }
  }
  return (
    <div className="overflow-hidden rounded-3xl border border-brand/30 bg-surface shadow-2xl shadow-black/40">
      <div className="relative border-b border-dashed border-line bg-gradient-to-b from-brand/[0.10] to-transparent px-6 pb-7 pt-6 sm:px-8">
        <span className="absolute -left-3 bottom-[-12px] h-6 w-6 rounded-full bg-bg" />
        <span className="absolute -right-3 bottom-[-12px] h-6 w-6 rounded-full bg-bg" />
        <div className="flex items-center justify-between">
          <Eyebrow className="text-brand/80">Passe de acesso</Eyebrow>
          <Icon name="badge" className="h-5 w-5 text-brand/70" />
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">Libere os detalhes do {lot.code}</h3>
        <p className="mt-1.5 text-sm text-muted">Preencha abaixo e acesse <span className="text-ink">gratuitamente</span> tudo sobre este lote.</p>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-ink/90">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/12 text-brand"><Icon name={b.icon} className="h-3.5 w-3.5" /></span>{b.text}
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={submit} className="space-y-4 px-6 py-6 sm:px-8" noValidate>
        <Field label="Nome completo" icon="user" valid={nameOk} show={touched.name} error="Informe seu nome completo.">
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="Ex.: Maria Oliveira" autoComplete="name" className="ll-input" />
        </Field>
        <Field label="WhatsApp com DDD" icon="whats" valid={phoneOk} show={touched.phone} error="Número inválido — use DDD + 9 dígitos.">
          <input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="(61) 99999-0000" inputMode="numeric" autoComplete="tel" className="ll-input" />
        </Field>
        <button type="submit" disabled={submitting}
          className="ll-cta group relative mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-base font-bold text-bg transition-all duration-300 hover:brightness-110 active:scale-[.98] disabled:opacity-80">
          {submitting ? <><span className="ll-spinner" /> Liberando acesso…</> : <>Quero ver a localização <Icon name="arrow" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" /></>}
        </button>
        {err && <p className="text-center text-xs text-live">{err}</p>}
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-faint">
          <Icon name="shield" className="h-3.5 w-3.5" /> Seus dados são usados só para este contato. Sem spam — conforme a LGPD.
        </p>
      </form>
    </div>
  )
}

function SuccessPanel({ lot, lender, lead }) {
  const hasWpp = lender.whatsapp && lender.whatsapp !== "5561999990000"
  const links = [
    lot.mapsUrl && { icon: "pin",   label: "Abrir no Google Maps",    sub: "Localização exata do lote",     href: lot.mapsUrl,            primary: true },
    lot.pdfUrl  && { icon: "doc",   label: "Baixar PDF completo",      sub: "Matrícula, laudo e edital",    href: lot.pdfUrl },
    hasWpp      && { icon: "whats", label: "Falar com " + lender.name.split(" ")[0], sub: "Atendimento imediato", href: waLink(lender, lot) },
  ].filter(Boolean)

  return (
    <div className="ll-reveal overflow-hidden rounded-3xl border border-profit/35 bg-surface shadow-2xl shadow-black/40">
      <div className="flex flex-col items-center border-b border-line bg-gradient-to-b from-profit/[0.12] to-transparent px-6 pb-7 pt-8 text-center">
        <span className="ll-pop grid h-16 w-16 place-items-center rounded-full bg-profit text-bg">
          <Icon name="check" className="h-8 w-8" style={{ strokeWidth: 2.4 }} />
        </span>
        <h3 className="mt-4 font-display text-3xl font-semibold text-ink">Acesso liberado!</h3>
        <p className="mt-1.5 max-w-sm text-sm text-muted">
          {lead?.name ? lead.name.split(" ")[0] + ", enviamos" : "Enviamos"} os detalhes agora no seu WhatsApp. Os links exclusivos também estão aqui 👇
        </p>
      </div>
      <div className="space-y-2.5 p-5 sm:p-6">
        {links.map((l, i) => (
          <a key={i} href={l.href} target="_blank" rel="noopener noreferrer"
            className={"group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 " + (l.primary ? "border-brand/40 bg-brand/10 hover:bg-brand/15" : "border-line bg-surface-2 hover:border-brand/30")}>
            <span className={"grid h-10 w-10 shrink-0 place-items-center rounded-xl " + (l.primary ? "bg-brand text-bg" : "bg-surface text-brand")}>
              <Icon name={l.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">{l.label}</span>
              <span className="block text-xs text-muted">{l.sub}</span>
            </span>
            <Icon name="chevron" className="h-4 w-4 shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        ))}
      </div>
    </div>
  )
}

/* ── Header / Footer ── */
function Header({ lender, scrolled }) {
  return (
    <header className={"fixed inset-x-0 top-0 z-40 transition-all duration-300 " + (scrolled ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {lender.logoUrl
            ? <img src={lender.logoUrl} alt={lender.name} className="h-9 w-auto" />
            : <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand/30 bg-brand/10 font-display text-base font-bold text-brand">{lender.initials}</span>}
          <span className="leading-tight">
            <span className="block text-sm font-bold text-ink">{lender.name}</span>
            <span className="hidden text-[11px] text-muted sm:block">{lender.role}</span>
          </span>
        </div>
        <a href={"https://wa.me/" + lender.whatsapp} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-brand/40 sm:px-4">
          <Icon name="whats" className="h-4 w-4 text-profit" /><span className="hidden sm:inline">Atendimento</span>
        </a>
      </div>
    </header>
  )
}

const Footer = ({ lender }) => (
  <footer className="mt-16 border-t border-line">
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand/30 bg-brand/10 font-display text-base font-bold text-brand">{lender.initials}</span>
          <div><p className="text-sm font-bold text-ink">{lender.name}</p><p className="text-xs text-muted">{lender.role}</p></div>
        </div>
        <a href={"https://wa.me/" + lender.whatsapp} target="_blank" rel="noopener noreferrer"
          className="inline-flex w-max items-center gap-2 rounded-full bg-profit/15 px-4 py-2.5 text-sm font-semibold text-profit transition hover:bg-profit/20">
          <Icon name="whats" className="h-4 w-4" /> {lender.phoneLabel}
        </a>
      </div>
      <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>Leiloeiro: {lender.register} · {lender.site}</p>
        <p>© {new Date().getFullYear()} {lender.name}. Imagens ilustrativas. Consulte o edital oficial.</p>
      </div>
    </div>
  </footer>
)

/* ── Skeleton ── */
const Sk = ({ className = "" }) => <div className={"ll-shimmer rounded-xl " + className} />
const SkeletonPage = () => (
  <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <Sk className="h-5 w-40" /><Sk className="mt-4 h-12 w-3/4" /><Sk className="mt-3 h-6 w-1/2" />
        <div className="mt-6 grid grid-cols-4 gap-2">{Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-20" />)}</div>
        <Sk className="mt-6 h-32 w-full rounded-2xl" />
      </div>
      <div>
        <Sk className="aspect-[4/3] w-full rounded-2xl" />
        <div className="mt-2 grid grid-cols-3 gap-2">{Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="aspect-square rounded-xl" />)}</div>
      </div>
    </div>
  </div>
)

/* ══════════════════════════ COMPONENTE PRINCIPAL ══════════════════════════ */
export default function LeilaoLanding({ tenant = defaultTenant, lot = null, loading, onLead }) {
  const lender   = tenant.lender
  const isLoading = loading != null ? loading : !lot
  const [unlocked, setUnlocked] = useState(false)
  const [lead, setLead]         = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (lot) document.title = `${lot.code} — ${lot.title}, ${lot.city}/${lot.state}`
  }, [lot])

  const scrollToForm = () => {
    const el = document.getElementById("acesso")
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" })
  }

  async function handleSubmit(data) {
    if (onLead) await onLead(data)
    setLead(data)
    setUnlocked(true)
    setTimeout(scrollToForm, 80)
  }

  const cssVars = themeToCssVars(tenant.theme)

  return (
    <div className="ll-root min-h-screen bg-bg font-sans text-ink antialiased" style={cssVars}>
      <Header lender={lender} scrolled={scrolled} />

      {isLoading || !lot ? (
        <SkeletonPage />
      ) : (
        <main className="pt-20">
          {/* HERO */}
          <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
            <div className="grid items-start gap-8 lg:grid-cols-[1.04fr_.96fr]">
              <div className="ll-up">
                <div className="flex flex-wrap items-center gap-2.5">
                  <LiveBadge />
                  <span className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{lot.type}</span>
                  <span className="rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">{lot.code}</span>
                </div>
                <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] text-ink sm:text-6xl">{lot.title}<span className="text-brand">.</span></h1>
                <p className="mt-2 font-display text-2xl text-muted sm:text-3xl">{lot.subtitle}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted"><Icon name="pin" className="h-4 w-4 text-brand" /> {lot.region} · {lot.city}/{lot.state}</p>
                <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-faint">Lance inicial</p>
                    <p className="whitespace-nowrap font-display text-4xl font-semibold text-brand sm:text-5xl">{fmtBRL(lot.startingBid)}</p>
                  </div>
                  <p className="pb-1 text-sm text-muted">avaliado em <span className="text-ink line-through decoration-faint/60">{fmtBRL(lot.marketValue)}</span></p>
                </div>
                <div className="mt-6"><FeatureGrid features={lot.features} /></div>
                <button onClick={scrollToForm} className="group mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-base font-bold text-bg transition-all duration-300 hover:brightness-110 active:scale-[.98] sm:w-auto">
                  Liberar localização e fotos <Icon name="arrow" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="mt-2.5 text-center text-xs text-faint sm:text-left">Grátis · acesso imediato no WhatsApp</p>
              </div>
              <div className="ll-up ll-delay space-y-4">
                <PhotoGallery photos={lot.photos} visibleCount={lot.visibleCount} unlocked={unlocked} onUnlock={scrollToForm} />
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-center gap-2"><Icon name="clock" className="h-4 w-4 text-live" /><Eyebrow>Encerra em</Eyebrow></div>
                  <div className="mt-3"><Countdown endsAt={lot.auctionEndsAt} /></div>
                </div>
                <InvestmentCard lot={lot} />
              </div>
            </div>
          </section>

          {/* POR QUE VALE */}
          <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
            <div className="mb-5"><Eyebrow className="text-brand/80">Análise do lote</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">Por que vale o lance</h2></div>
            <HighlightCards highlights={lot.highlights} />
          </section>

          {/* FICHA TÉCNICA */}
          <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
            <div className="mb-5"><Eyebrow className="text-brand/80">Ficha técnica</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">Informações do lote</h2></div>
            <div className="grid gap-4 lg:grid-cols-2">
              <SpecList specs={lot.specs} />
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-line bg-surface p-5">
                  <Eyebrow>Modalidade</Eyebrow>
                  <p className="mt-2 text-lg font-semibold text-ink">{lot.modality}</p>
                  <p className="mt-1 text-sm text-muted">Lances pela plataforma oficial do leiloeiro. Habilitação prévia obrigatória.</p>
                </div>
                <div className="flex flex-1 items-center gap-4 rounded-2xl border border-profit/25 bg-profit/[0.06] p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-profit/15 text-profit"><Icon name="trend" className="h-6 w-6" /></span>
                  <div>
                    <p className="text-sm text-muted">Comprando no lance inicial você economiza</p>
                    <p className="whitespace-nowrap font-display text-3xl font-semibold text-profit">{fmtBRL(lot.marketValue - lot.startingBid)} <span className="text-lg">(−{Math.round(((lot.marketValue - lot.startingBid) / lot.marketValue) * 100)}%)</span></p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ACESSO */}
          <section id="acesso" className="mx-auto mt-16 max-w-6xl scroll-mt-24 px-4 sm:px-6">
            <div className="grid items-center gap-8 lg:grid-cols-[.92fr_1.08fr]">
              <div className="ll-up">
                <Eyebrow className="text-brand/80">Acesso exclusivo</Eyebrow>
                <h2 className="mt-2 font-display text-4xl font-semibold leading-[1.02] text-ink sm:text-5xl">A poucos cliques de <span className="text-brand">arrematar</span> abaixo do mercado.</h2>
                <p className="mt-4 max-w-md text-muted">O cadastro é gratuito e leva 15 segundos — sem compromisso de lance.</p>
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-brand/30 bg-brand/10 font-display text-base font-bold text-brand">{lender.initials}</span>
                  <div className="text-sm"><p className="font-semibold text-ink">{lender.name}</p><p className="text-muted">{lender.register}</p></div>
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-profit/12 px-2.5 py-1 text-xs font-semibold text-profit"><Icon name="shield" className="h-3.5 w-3.5" />Verificado</span>
                </div>
              </div>
              <div>{unlocked ? <SuccessPanel lot={lot} lender={lender} lead={lead} /> : <LeadForm lot={lot} onSubmit={handleSubmit} />}</div>
            </div>
          </section>
        </main>
      )}
      <Footer lender={lender} />
    </div>
  )
}
