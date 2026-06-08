const express = require('express')
const router  = express.Router()
const db      = require('../services/supabase')

function auth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.adminKey || ''
  if (!key || key !== (process.env.ADMIN_KEY || '')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

router.use(auth)

// GET /api/admin/leads?lotSlug=&stage=
router.get('/leads', async (req, res) => {
  try {
    const leads = await db.getLeads({ lotSlug: req.query.lotSlug, stage: req.query.stage })
    res.json(leads)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/leads/:id
router.patch('/leads/:id', async (req, res) => {
  try {
    await db.updateLeadStage(req.params.id, req.body.stage, req.body.notas)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/lots
router.get('/lots', async (req, res) => {
  try {
    res.json(await db.getLots())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/lots — criar ou atualizar lote (upsert por slug)
router.post('/lots', async (req, res) => {
  try {
    const lot = await db.upsertLot(req.body)
    res.json(lot)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
