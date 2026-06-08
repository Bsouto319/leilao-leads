const express = require('express')
const router  = express.Router()
const db      = require('../services/supabase')
const wa      = require('../services/whatsapp')

// GET /api/lots/:slug — info pública (superficial)
router.get('/lots/:slug', async (req, res) => {
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
  try {
    lot = await db.getLotFull(lotSlug)
  } catch {
    return res.status(404).json({ error: 'Lote não encontrado' })
  }

  // Salva lead
  let lead
  try {
    lead = await db.saveLead({ lotId: lot.id, lotSlug, nome, whatsapp: digits, regionInterest, priceRange })
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao salvar lead' })
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
    }
  })

  // Dispara WhatsApp em background (não bloqueia resposta)
  wa.startLeadFlow({ nome: nome.trim(), whatsapp: digits }, lot)
    .then(() => db.markWhatsappSent(lead.id))
    .catch(err => console.error('[whatsapp] erro no flow:', err.message))
})

module.exports = router
