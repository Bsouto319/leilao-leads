import { useState, useEffect } from "react"
import LeilaoLanding from "./LeilaoLanding"
import { defaultTenant, demoLot, adaptApiLot } from "./theme"

export default function App() {
  const slug = new URLSearchParams(location.search).get("lot") || "demo"
  const [lot, setLot]       = useState(null)
  const [tenant, setTenant] = useState(defaultTenant)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug === "demo") {
      setLot(demoLot)
      setLoading(false)
      return
    }
    fetch("/api/lots/" + slug)
      .then(r => r.json())
      .then(data => {
        setLot(adaptApiLot(data))
        setLoading(false)
      })
      .catch(() => {
        setLot(demoLot)
        setLoading(false)
      })
  }, [slug])

  async function handleLead({ name, phone }) {
    const digits = phone.replace(/\D/g, "")
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: name, whatsapp: digits, lotSlug: slug }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || "Erro ao liberar acesso")

    const u = data.unlocked
    // Atualiza lote com dados desbloqueados
    setLot(prev => ({
      ...prev,
      mapsUrl: u.mapsUrl || prev.mapsUrl,
      pdfUrl:  u.pdfUrl  || prev.pdfUrl,
      photos:  u.photos?.length
        ? u.photos.map(p => p.url || p)
        : prev.photos,
    }))
    // Atualiza número do consultor se vier da API
    if (u.consultorPhone) {
      setTenant(prev => ({
        ...prev,
        lender: { ...prev.lender, whatsapp: u.consultorPhone },
      }))
    }
  }

  return (
    <LeilaoLanding
      tenant={tenant}
      lot={lot}
      loading={loading}
      onLead={handleLead}
    />
  )
}
