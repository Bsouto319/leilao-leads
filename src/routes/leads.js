const express = require('express')
const router  = express.Router()
const db      = require('../services/supabase')
const wa      = require('../services/whatsapp')

const DEMO_LOT = {
  id: 'demo',
  slug: 'demo',
  title: 'Terreno 600m² — Residencial Bela Vista',
  description: 'Terreno plano em condomínio fechado, documentação regularizada. Infraestrutura completa: asfalto, água, luz e esgoto. Excelente para construção imediata.',
  city: 'Brasília',
  state: 'DF',
  area_m2: 600,
  price_from: 95000,
  price_to: 130000,
  auction_date: '2026-07-15',
  auction_url: null,
  photos: [
    { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80' },
    { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' },
    { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
    { url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80' },
  ],
  active: true,
  // liberado após captura
  lat: -15.7801,
  lng: -47.9292,
  full_description: 'Terreno com matrícula n° 45.872 no Cartório de Registro de Imóveis. Sem ônus ou pendências. Dimensões: 20m x 30m. Frente para rua pavimentada. Zona residencial R1 — permite construção de até 3 andares. Entorno valorizado com comércio, escolas e transporte público a 500m.',
  pdf_url: null,
}

// GET /api/lots/:slug — info pública (superficial)
router.get('/lots/:slug', async (req, res) => {
  if (req.params.slug === 'demo') {
    const { lat, lng, full_description, pdf_url, ...pub } = DEMO_LOT
    return res.json(pub)
  }
  try {
    const lot = await db.getLot(req.params.slug)
    res.json(lot)
  } catch {
    res.status(404).json({ error: 'Lote não encontrado' })
  }
})

// POST /api/leads — captura lead + desbloqueia localização/PDF + dispara WhatsApp
router.post('/leads', async (req, res) => {
  const { nome, whatsapp, lotSlug, regionInterest, priceRange } = req.body

  if (!nome?.trim() || !whatsapp?.trim() || !lotSlug) {
    return res.status(400).json({ error: 'nome, whatsapp e lotSlug são obrigatórios' })
  }

  // Valida mínimo 10 dígitos
  const digits = whatsapp.replace(/\D/g, '')
  if (digits.length < 10) {
    return res.status(400).json({ error: 'WhatsApp inválido' })
  }

  let lot
  if (lotSlug === 'demo') {
    lot = DEMO_LOT
  } else {
    try {
      lot = await db.getLotFull(lotSlug)
    } catch {
      return res.status(404).json({ error: 'Lote não encontrado' })
    }
  }

  // Salva lead (demo não persiste no banco)
  let lead = { id: null }
  if (lotSlug !== 'demo') {
    try {
      lead = await db.saveLead({ lotId: lot.id, lotSlug, nome, whatsapp: digits, regionInterest, priceRange })
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao salvar lead' })
    }
  }

  // Retorna dados desbloqueados imediatamente
  res.json({
    success: true,
    unlocked: {
      lat: lot.lat,
      lng: lot.lng,
      mapsUrl: lot.lat && lot.lng
        ? `https://www.google.com/maps?q=${lot.lat},${lot.lng}`
        : null,
      fullDescription: lot.full_description,
      pdfUrl: lot.pdf_url,
      photos: lot.photos || [],
      consultorPhone: process.env.CONSULTOR_PHONE || '',
    }
  })

  // Dispara WhatsApp em background (não bloqueia resposta)
  wa.startLeadFlow({ nome: nome.trim(), whatsapp: digits }, lot)
    .then(() => db.markWhatsappSent(lead.id))
    .catch(err => console.error('[whatsapp] erro no flow:', err.message))
})

module.exports = router
