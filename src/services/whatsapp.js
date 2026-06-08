const axios = require('axios')

const BASE   = process.env.UAZAPI_URL   || 'https://btechsoutoshop.uazapi.com'
const TOKEN  = process.env.UAZAPI_TOKEN
const INSTANCE = process.env.UAZAPI_INSTANCE

function formatNumber(whatsapp) {
  const digits = whatsapp.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

async function sendText(whatsapp, text) {
  const number = formatNumber(whatsapp)
  await axios.post(
    `${BASE}/message/sendText/${INSTANCE}`,
    { number, text },
    { headers: { token: TOKEN }, timeout: 10000 }
  )
}

async function sendLocation(whatsapp, lat, lng, name, address) {
  const number = formatNumber(whatsapp)
  await axios.post(
    `${BASE}/message/sendLocation/${INSTANCE}`,
    { number, lat, lng, name: name || '', address: address || '' },
    { headers: { token: TOKEN }, timeout: 10000 }
  )
}

async function sendImage(whatsapp, imageUrl, caption) {
  const number = formatNumber(whatsapp)
  await axios.post(
    `${BASE}/message/sendImage/${INSTANCE}`,
    { number, image: imageUrl, caption: caption || '' },
    { headers: { token: TOKEN }, timeout: 15000 }
  )
}

async function startLeadFlow(lead, lot) {
  const { nome, whatsapp } = lead

  // 1. Boas-vindas + localização
  await sendText(whatsapp,
    `Olá, *${nome}*! 👋\n\nObrigado pelo seu interesse no lote *${lot.title}* em *${lot.city} - ${lot.state}*.\n\nAqui está a localização exata:`
  )

  if (lot.lat && lot.lng) {
    await sleep(1000)
    await sendLocation(whatsapp, lot.lat, lot.lng, lot.title, `${lot.city}, ${lot.state}`)
  }

  // 2. Fotos do lote
  if (lot.photos && lot.photos.length > 0) {
    await sleep(1500)
    for (const photo of lot.photos.slice(0, 3)) {
      await sendImage(whatsapp, photo.url, photo.caption || lot.title).catch(() => {})
      await sleep(800)
    }
  }

  // 3. PDF com detalhes
  if (lot.pdf_url) {
    await sleep(1000)
    await sendText(whatsapp,
      `📄 *Detalhes completos do lote:*\n${lot.pdf_url}\n\n_(Clique para baixar o PDF com todas as informações)_`
    )
  }

  // 4. Qualificação
  await sleep(2000)
  await sendText(whatsapp,
    `Para te atender melhor, me conta:\n\n🏠 *Esse terreno seria para Investimento ou Moradia?*\n\nResponda *1* para Investimento\nResponda *2* para Moradia`
  )
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

module.exports = { sendText, sendLocation, sendImage, startLeadFlow }
