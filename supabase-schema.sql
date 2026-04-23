-- ============================================
-- Reels Video Pipeline — Supabase Schema
-- Project: qmlmbjaolmmwujfrxcpa
-- Run with service_role key
-- ============================================

-- Schema: agente_dev (agent state — extends existing)
CREATE SCHEMA IF NOT EXISTS agente_dev;

-- Projects table (from masterplan, adapted for video pipeline)
CREATE TABLE IF NOT EXISTS agente_dev.projetos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  industry    TEXT,
  brand_colors JSONB,          -- {"primary":"#2D5016","secondary":"#8B7355","accent":"#F5A623"}
  brand_font  TEXT,
  status      TEXT DEFAULT 'active',  -- active | paused | delivered
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Sessions table (from masterplan)
CREATE TABLE IF NOT EXISTS agente_dev.sessoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  UUID REFERENCES agente_dev.projetos(id),
  agente      TEXT NOT NULL,           -- 'video-producer' | 'copy' | 'deploy'
  summary     TEXT,
  decisions   JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Videos table (NEW — core pipeline table)
CREATE TABLE IF NOT EXISTS agente_dev.videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa       TEXT NOT NULL,           -- 'roberts' | 'cheesebread' | etc
  tier          INT NOT NULL,            -- 1=HeyGen | 2=fal.ai | 3=Remotion
  tipo          TEXT NOT NULL,           -- 'before-after' | 'testimonial' | etc
  tema          TEXT,                    -- free text theme
  custo         DECIMAL(10,2) DEFAULT 0,
  duracao_sec   INT,                     -- video duration in seconds
  file_path     TEXT,                    -- local file path
  file_size_mb  DECIMAL(5,1),
  postforme_id  TEXT,                    -- PostForMe upload ID
  instagram_url TEXT,                    -- published Instagram URL
  caption       TEXT,
  status        TEXT DEFAULT 'draft',    -- draft | rendered | posted | failed
  error_msg     TEXT,                    -- error details if failed
  created_at    TIMESTAMPTZ DEFAULT now(),
  posted_at     TIMESTAMPTZ
);

-- Budget log table (NEW — cost tracking)
CREATE TABLE IF NOT EXISTS agente_dev.budget_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes         TEXT NOT NULL,             -- '2026-04'
  empresa     TEXT NOT NULL,
  tier        INT NOT NULL,
  custo       DECIMAL(10,2) NOT NULL,
  video_id    UUID REFERENCES agente_dev.videos(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Carousel jobs table (NEW - Telegram carousel workflow)
CREATE TABLE IF NOT EXISTS agente_dev.carousel_jobs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa            TEXT NOT NULL,
  instagram_handle   TEXT NOT NULL,
  research_context   TEXT,
  source_urls        JSONB DEFAULT '[]'::jsonb,
  news_headline      TEXT,
  news_summary       TEXT,
  editorial_angle    TEXT,
  research_provider  TEXT,
  site_profile       JSONB,
  content_type       TEXT NOT NULL,
  image_style        TEXT NOT NULL,
  card_count         INT NOT NULL CHECK (card_count IN (3, 5, 7)),
  topic              TEXT,
  initial_request    TEXT,
  status             TEXT DEFAULT 'draft',
  storyboard         JSONB DEFAULT '[]'::jsonb,
  images             JSONB DEFAULT '[]'::jsonb,
  cards              JSONB DEFAULT '[]'::jsonb,
  caption            TEXT,
  output_dir         TEXT,
  preview_message_id BIGINT,
  postforme_id       TEXT,
  instagram_url      TEXT,
  error_msg          TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS research_context TEXT;
ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS source_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS news_headline TEXT;
ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS news_summary TEXT;
ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS editorial_angle TEXT;
ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS research_provider TEXT;
ALTER TABLE agente_dev.carousel_jobs ADD COLUMN IF NOT EXISTS site_profile JSONB;

-- ============================================
-- Schema: memoria (agent memory)
-- ============================================
CREATE SCHEMA IF NOT EXISTS memoria;

CREATE TABLE IF NOT EXISTS memoria.memoria_temporaria_claude (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente      TEXT NOT NULL,             -- 'pipeline' | 'video-producer' | etc
  tipo        TEXT NOT NULL,             -- 'decision' | 'pattern' | 'error' | 'delivery'
  conteudo    TEXT NOT NULL,
  projeto_id  UUID,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memoria.memoria_permanente (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente      TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  conteudo    TEXT NOT NULL,
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Seed: 5 DockPlus companies
-- ============================================
INSERT INTO agente_dev.projetos (slug, client_name, industry, brand_colors, brand_font, status)
VALUES
  ('roberts', 'Roberts Landscape Construction & Design', 'Landscaping / Hardscape',
   '{"primary":"#2D5016","secondary":"#8B7355","accent":"#F5A623"}', 'Poppins Bold', 'active'),
  ('cheesebread', 'Cheesebread Bakery Café', 'Bakery / Brazilian Cafe',
   '{"primary":"#D4A574","secondary":"#8B6F47","accent":"#FFE5CC"}', 'Playfair Display', 'active'),
  ('cape-codder', 'Cape Codder Home Improvement', 'Home Remodeling',
   '{"primary":"#0055A8","secondary":"#F8A100","accent":"#E8E8E8"}', 'Montserrat', 'active'),
  ('all-granite', 'All Granite & Stone', 'Countertops / Stone Fabrication',
   '{"primary":"#4A4A4A","secondary":"#8B8B8B","accent":"#D4AF37"}', 'Raleway', 'active'),
  ('dockplus-ai', 'DockPlus AI Solutions', 'AI Automation Agency',
   '{"primary":"#1E1E2E","secondary":"#00FF00","accent":"#00FFFF"}', 'JetBrains Mono', 'active'),
  ('thiagaoai', 'Thiago do Carmo', 'Entrepreneurship / AI / Leadership',
   '{"primary":"#101820","secondary":"#1F5C4C","accent":"#D1A954"}', 'Merriweather', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_videos_empresa ON agente_dev.videos(empresa);
CREATE INDEX IF NOT EXISTS idx_videos_status ON agente_dev.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created ON agente_dev.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_mes ON agente_dev.budget_log(mes);
CREATE INDEX IF NOT EXISTS idx_budget_empresa ON agente_dev.budget_log(empresa);
CREATE INDEX IF NOT EXISTS idx_carousel_jobs_status ON agente_dev.carousel_jobs(status);
CREATE INDEX IF NOT EXISTS idx_carousel_jobs_empresa ON agente_dev.carousel_jobs(empresa);
CREATE INDEX IF NOT EXISTS idx_memoria_temp_agente ON memoria.memoria_temporaria_claude(agente);

-- ============================================
-- Views (convenience)
-- ============================================
CREATE OR REPLACE VIEW agente_dev.budget_dashboard AS
SELECT
  mes,
  empresa,
  tier,
  COUNT(*) as video_count,
  SUM(custo) as total_cost
FROM agente_dev.budget_log
GROUP BY mes, empresa, tier
ORDER BY mes DESC, empresa, tier;

CREATE OR REPLACE VIEW agente_dev.monthly_summary AS
SELECT
  mes,
  COUNT(*) as total_videos,
  SUM(custo) as total_spent,
  200.00 - SUM(custo) as remaining,
  ROUND((SUM(custo) / 200.00) * 100, 1) as utilization_pct
FROM agente_dev.budget_log
GROUP BY mes
ORDER BY mes DESC;
