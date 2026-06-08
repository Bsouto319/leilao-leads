const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service key — bypassa RLS
)

async function getLot(slug) {
  const { data, error } = await supabase
    .from('leilao_lots')
    .select('id,slug,title,description,city,state,area_m2,price_from,price_to,auction_date,auction_url,photos,active')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error) throw new Error(error.message)
  return data
}

async function getLotFull(slug) {
  const { data, error } = await supabase
    .from('leilao_lots')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error) throw new Error(error.message)
  return data
}

async function saveLead({ lotId, lotSlug, nome, whatsapp, regionInterest, priceRange }) {
  const { data, error } = await supabase
    .from('leilao_leads')
    .insert({
      lot_id: lotId || null,
      lot_slug: lotSlug,
      nome: nome.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      region_interest: regionInterest || null,
      price_range: priceRange || null,
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data
}

async function markWhatsappSent(leadId) {
  await supabase.from('leilao_leads').update({ whatsapp_sent: true }).eq('id', leadId)
}

async function updateLeadStage(leadId, stage, notas) {
  const update = { stage, updated_at: new Date().toISOString() }
  if (notas !== undefined) update.notas = notas
  const { error } = await supabase.from('leilao_leads').update(update).eq('id', leadId)
  if (error) throw new Error(error.message)
}

async function getLeads(filters = {}) {
  let q = supabase.from('leilao_leads').select('*,leilao_lots(title,city,state)').order('created_at', { ascending: false })
  if (filters.lotSlug) q = q.eq('lot_slug', filters.lotSlug)
  if (filters.stage)   q = q.eq('stage', filters.stage)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data
}

async function getLots() {
  const { data, error } = await supabase.from('leilao_lots').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function upsertLot(payload) {
  const { data, error } = await supabase
    .from('leilao_lots')
    .upsert(payload, { onConflict: 'slug' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

module.exports = { getLot, getLotFull, saveLead, markWhatsappSent, updateLeadStage, getLeads, getLots, upsertLot }
