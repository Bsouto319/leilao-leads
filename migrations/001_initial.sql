-- Leilão Leads — schema isolado, prefixo leilao_
-- Rodar no Supabase SQL Editor do projeto LeadPilot

CREATE TABLE IF NOT EXISTS leilao_lots (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text        UNIQUE NOT NULL,
  title         text        NOT NULL,
  description   text,                         -- info superficial (pública)
  city          text,
  state         text,
  area_m2       numeric,
  price_from    numeric,
  price_to      numeric,
  auction_date  date,
  auction_url   text,
  -- Liberado após captura do lead:
  lat           numeric,
  lng           numeric,
  full_description text,
  pdf_url       text,
  photos        jsonb       DEFAULT '[]',
  active        boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leilao_leads (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id          uuid        REFERENCES leilao_lots(id) ON DELETE SET NULL,
  lot_slug        text,
  nome            text        NOT NULL,
  whatsapp        text        NOT NULL,
  interest_type   text,       -- 'investimento' | 'moradia' | null
  region_interest text,       -- para campanhas futuras
  price_range     text,       -- faixa de preço de interesse
  stage           text        DEFAULT 'novo',
  notas           text,
  whatsapp_sent   boolean     DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leilao_leads_lot_id  ON leilao_leads(lot_id);
CREATE INDEX IF NOT EXISTS idx_leilao_leads_whatsapp ON leilao_leads(whatsapp);
CREATE INDEX IF NOT EXISTS idx_leilao_lots_slug      ON leilao_lots(slug);

-- RLS (opcional — desabilita para uso server-side)
ALTER TABLE leilao_lots  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leilao_leads ENABLE ROW LEVEL SECURITY;

-- Política pública para lotes ativos (leitura superficial via API pública)
CREATE POLICY "lotes ativos públicos" ON leilao_lots
  FOR SELECT USING (active = true);

-- Leads: apenas server-side (service key bypassa RLS)
