const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { BRANDS } = require('./carousel-config');

const W = 1080;
const H = 1350;
const IMG_H = 1012;   // 75% of card height — image section
const FOOTER_H = 80;  // fixed footer height
// Text section = H - IMG_H - FOOTER_H = 258px

function resolveMode(card) {
  const t = card.layoutType;
  if (t === 'cover' || t === 'cta' || t === 'insight' || t === 'quote') return 'dark';
  if (t === 'proof' || t === 'showcase' || t === 'split') return 'light';
  return card.index % 2 === 0 ? 'light' : 'dark';
}

function splitHeadline(text, max) {
  const byPunct = text.split(/(?<=[.!?])\s+|(?<=—)\s+/);
  if (byPunct.length >= 2) return byPunct.slice(0, max);
  const words = text.split(' ');
  if (words.length <= 3) return [text];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function extractTags(body) {
  const found = body.match(/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[a-záéíóúâêôãõç]+)?\b/g) || [];
  return [...new Set(found)].filter(w => w.length > 3 && w.split(' ').length <= 2).slice(0, 4);
}

const EDITORIAL_STYLES = new Set(['editorial_dark', 'editorial_light', 'editorial_mix', 'editorial_surprise']);

function resolveEditorialMode(imageStyle, cardIndex, layoutType) {
  if (imageStyle === 'editorial_dark') return 'dark';
  if (imageStyle === 'editorial_light') return 'light';
  if (imageStyle === 'editorial_mix') {
    if (layoutType === 'cover' || layoutType === 'cta') return 'dark';
    return cardIndex % 2 === 0 ? 'light' : 'dark';
  }
  // surprise: cover/cta dark, rest alternating starting light
  if (layoutType === 'cover' || layoutType === 'cta') return 'dark';
  return cardIndex % 2 === 0 ? 'dark' : 'light';
}

const BRAND_STATS = {
  roberts: [
    { value: '15', label: 'ANOS', desc: 'Cape Cod design-build desde 2009' },
    { value: '500+', label: 'PROJETOS', desc: 'Builds finalizados em New England' },
    { value: '4.9★', label: '397 REVIEWS', desc: 'Top-rated em cada projeto' },
    { value: '0', label: 'SUBS', desc: 'Nossa equipe, seu canteiro' },
  ],
  'all-granite': [
    { value: '20+', label: 'ANOS', desc: 'Fabricação de pedra premium' },
    { value: '10K+', label: 'PROJETOS', desc: 'Instalações concluídas' },
    { value: '4.8★', label: 'AVALIAÇÃO', desc: 'Qualidade reconhecida' },
    { value: '100%', label: 'IN-HOUSE', desc: 'Fabricação e instalação próprias' },
  ],
  'dockplus-ai': [
    { value: '5x', label: 'ROI MÉDIO', desc: 'Automação que se paga' },
    { value: '40+', label: 'CLIENTES', desc: 'Empresas atendidas' },
    { value: '72h', label: 'DEPLOY', desc: 'Da ideia ao ar' },
    { value: '0', label: 'AGÊNCIAS', desc: 'Você fala direto' },
  ],
  cheesebread: [
    { value: '100%', label: 'ARTESANAL', desc: 'Feito do zero todo dia' },
    { value: '15+', label: 'SABORES', desc: 'Pão de queijo e mais' },
    { value: '5★', label: 'REVIEWS', desc: 'Amado por Cape Cod' },
    { value: '0', label: 'ADITIVOS', desc: 'Ingredientes reais' },
  ],
  'cape-codder': [
    { value: '20+', label: 'ANOS', desc: 'Cape Cod home improvement' },
    { value: '800+', label: 'PROJETOS', desc: 'Homes renovated on the Cape' },
    { value: '4.9★', label: 'REVIEWS', desc: 'Trusted by homeowners' },
    { value: '0', label: 'MIDDLEMEN', desc: 'Direct owner communication' },
  ],
  thiagaoai: [
    { value: '1T+', label: 'PARÂMETROS', desc: 'Nos maiores modelos de IA atuais' },
    { value: '$200B', label: 'INVESTIMENTO', desc: 'Gasto global em IA em 2024' },
    { value: '10x', label: 'CRESCIMENTO', desc: 'Velocidade de adoção em 2 anos' },
    { value: '0', label: 'FRONTEIRAS', desc: 'IA não respeita geografias' },
  ],
};

const FONT_MAP = {
  'Playfair Display': 'Playfair+Display:ital,wght@0,700;0,800;1,700;1,800',
  'Poppins': 'Poppins:wght@400;600;700;800',
  'Montserrat': 'Montserrat:wght@400;600;700;800',
  'Raleway': 'Raleway:wght@400;600;700;800',
  'JetBrains Mono': 'JetBrains+Mono:wght@400;600;700;800',
  'Merriweather': 'Merriweather:ital,wght@0,700;0,900;1,700;1,900',
  'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600',
  'Inter': 'Inter:wght@300;400;500;600',
};

const SERIF_BRANDS = new Set(['roberts', 'cheesebread', 'thiagaoai']);

class CarouselRenderer {
  async render({ request, storyboard, images, jobDir }) {
    const cardsDir = path.join(jobDir, 'cards');
    fs.mkdirSync(cardsDir, { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const result = [];

    try {
      for (const card of storyboard) {
        const img = images.find(e => e.index === card.index);
        const out = path.join(cardsDir, `card-${card.index}.png`);
        const html = this.buildHtml(request, card, img ? img.imagePath : null, storyboard.length);
        await page.setContent(html, { waitUntil: 'networkidle' });
        await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
        result.push({ index: card.index, path: out });
      }
    } finally {
      await browser.close();
    }

    return result;
  }

  buildHtml(request, card, imagePath, total) {
    const brand = BRANDS[request.company];
    const mode = resolveMode(card);
    const dark = mode === 'dark';

    const P = brand.colors.primary;
    const A = brand.colors.accent;

    const BG_DARK = '#101820';
    const BG_LIGHT = '#F5F0EB';
    const bg = dark ? BG_DARK : BG_LIGHT;
    const fg = dark ? '#F7F8FB' : '#101820';
    const fgSub = dark ? 'rgba(247,248,251,0.62)' : 'rgba(16,24,32,0.60)';
    const eyebrowColor = dark ? 'rgba(247,248,251,0.45)' : 'rgba(16,24,32,0.45)';
    const tagBorder = dark ? 'rgba(247,248,251,0.22)' : 'rgba(16,24,32,0.20)';
    const tagColor = dark ? 'rgba(247,248,251,0.72)' : 'rgba(16,24,32,0.62)';
    const footerColor = dark ? 'rgba(247,248,251,0.32)' : 'rgba(16,24,32,0.32)';
    const borderClr = dark ? 'rgba(247,248,251,0.08)' : 'rgba(16,24,32,0.10)';

    const imgUri = imagePath ? this.toDataUri(imagePath) : null;
    const siteUrl = (request.siteProfile && request.siteProfile.siteUrl) || brand.siteUrl || '';
    const displayUrl = siteUrl.replace(/^https?:\/\/(www\.)?/, '').toUpperCase();

    const hFont = SERIF_BRANDS.has(request.company) ? 'Playfair Display' : brand.font;
    const bFont = brand.font || 'Poppins';

    const isEditorial = EDITORIAL_STYLES.has(request.imageStyle);
    const isFullBleed = card.layoutType === 'cover' || card.layoutType === 'cta';
    const isStats = card.layoutType === 'proof';

    const e = s => String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const sentences = card.body.split(/(?<=[.!?])\s+/).filter(Boolean).map(s => s.trim());
    const tags = extractTags(card.body);

    const makeHl = (parts, baseColor, emColor) =>
      parts.map((p, i) => {
        const isLast = i === parts.length - 1 && parts.length > 1;
        return `<div class="hl-line" style="color:${isLast ? emColor : baseColor};${isLast ? 'font-style:italic' : ''}">${e(p)}</div>`;
      }).join('');

    // Fullbleed: up to 3 parts, white + accent
    const hlFB  = makeHl(splitHeadline(card.headline, 3), '#F7F8FB', A);
    // Photo-dominant bottom (fits in 258px): 2 parts max, theme colors
    const hlPD  = makeHl(splitHeadline(card.headline, 2), fg, dark ? A : P);
    // Text-only / stats: up to 3 parts, theme colors
    const hlTxt = makeHl(splitHeadline(card.headline, 3), fg, dark ? A : P);

    const tagsHtml = tags.length
      ? `<div class="tags">${tags.map(t => `<span class="tag" style="border-color:${tagBorder};color:${tagColor}">${e(t)}</span>`).join('')}</div>`
      : '';

    const ctaHtml = card.cta
      ? `<div class="cta-btn" style="background:${P}">${e(card.cta)}</div>`
      : '';

    const bodyHtml = sentences.slice(0, 2)
      .map(s => `<p class="body-p" style="color:${fgSub}">${e(s)}</p>`).join('');

    const stats = BRAND_STATS[request.company] || BRAND_STATS.roberts;
    const statsHtml = `<div class="stats-grid">
      ${stats.map(s => `
        <div class="stat-box" style="background:rgba(16,24,32,0.05)">
          <div class="stat-num" style="color:${P};font-family:'${hFont}',Georgia,serif">${e(s.value)}</div>
          <div class="stat-lbl" style="color:${eyebrowColor}">${e(s.label)}</div>
          <div class="stat-desc" style="color:${fgSub}">${e(s.desc)}</div>
        </div>`).join('')}
    </div>`;

    const brandWords = brand.shortName.split(' ');
    const logoMain = brandWords[0].toUpperCase();
    const logoSub  = brandWords.slice(1).join(' ');

    // Logo block — white for overlaid header, themed for bg header
    const logoBlock = (nameColor, subColor) => `
      <div class="logo">
        <div class="logo-mark" style="background:${P}">■</div>
        <div class="logo-text">
          <span class="logo-main" style="color:${nameColor}">${e(logoMain)}</span>
          ${logoSub ? `<span class="logo-sub" style="color:${subColor}">${e(logoSub)}</span>` : ''}
        </div>
      </div>`;

    // Header floating over image (white text)
    const hdrOver = `
      <header class="hdr-over">
        ${logoBlock('#F7F8FB', A)}
        <div class="counter" style="color:rgba(247,248,251,0.55)">${String(card.index).padStart(2,'0')} / ${String(total).padStart(2,'0')}</div>
      </header>`;

    // Header on bg color
    const hdrBg = `
      <header class="hdr-bg" style="color:${fg}">
        ${logoBlock(fg, A)}
        <div class="counter" style="color:${eyebrowColor}">${String(card.index).padStart(2,'0')} / ${String(total).padStart(2,'0')}</div>
      </header>`;

    const footerBg = `
      <footer class="ftr" style="color:${footerColor};border-top-color:${borderClr};background:${bg}">
        <span>${e(card.eyebrow || brand.shortName)}</span>
        <span>${displayUrl}</span>
      </footer>`;

    const footerFB = `
      <footer class="ftr" style="color:rgba(247,248,251,0.38);border-top-color:transparent">
        <span>${e(card.eyebrow || brand.shortName)}</span>
        <span>${displayUrl}</span>
      </footer>`;

    const ebOver = card.eyebrow
      ? `<div class="eyebrow" style="color:rgba(247,248,251,0.55)">— ${e(card.eyebrow)}</div>` : '';
    const ebBg = card.eyebrow
      ? `<div class="eyebrow" style="color:${eyebrowColor}">— ${e(card.eyebrow)}</div>` : '';

    // ── LAYOUT 6: Editorial (text-only, wireframe globe, typography) ─────────
    if (isEditorial) {
      const edMode = resolveEditorialMode(request.imageStyle, card.index, card.layoutType);
      const edDark = edMode === 'dark';

      const edBg      = edDark ? '#0A0B14' : '#F5F2EE';
      const edFg      = edDark ? '#F0F0F0' : '#1A1A1A';
      const edFgSub   = edDark ? 'rgba(240,240,240,0.70)' : 'rgba(26,26,26,0.66)';
      const edMuted   = edDark ? 'rgba(240,240,240,0.38)' : 'rgba(26,26,26,0.36)';
      const edAccent  = edDark ? '#9B72F6' : '#3B3BCB';
      const edBorder  = edDark ? 'rgba(240,240,240,0.12)' : 'rgba(26,26,26,0.10)';
      const edTagBdr  = edDark ? 'rgba(240,240,240,0.22)' : 'rgba(26,26,26,0.18)';
      const globeClr  = edDark ? '#7C3AED' : '#1A1A2E';
      const globeOp   = edDark ? '0.38' : '0.10';

      const edHlParts = splitHeadline(card.headline, 3);
      const edHl = edHlParts.map((part, i) => {
        const isLast = i === edHlParts.length - 1 && edHlParts.length > 1;
        const color = isLast ? edAccent : edFg;
        const style = isLast
          ? `color:${color};font-style:italic;font-weight:400`
          : `color:${color};font-weight:300`;
        return `<div class="ed-hl-line" style="${style}">${e(part)}</div>`;
      }).join('');

      const edTags = extractTags(card.body).slice(0, 4);
      const edTagsHtml = edTags.length
        ? `<div class="ed-tags">${edTags.map(t => `<span class="ed-tag" style="border-color:${edTagBdr};color:${edFgSub}">${e(t.toUpperCase())}</span>`).join('')}</div>`
        : '';

      const edEyebrow = (card.eyebrow || brand.shortName).toUpperCase();
      const edTopicShort = (request.newsHeadline || request.topic || brand.shortName).replace(/\s+/g, ' ').trim().slice(0, 22);
      const edBodyText = sentences.slice(0, 2).join(' ');

      const globe = this.wireframeGlobe(globeClr);

      return this.wrap('Cormorant Garamond', 'Inter', `
        <div class="ed-card" style="background:${edBg}">
          <svg class="ed-globe" viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" style="opacity:${globeOp}">
            ${globe}
          </svg>

          <div class="ed-hdr">
            <span class="ed-handle" style="color:${edMuted}">${e(request.instagramHandle || '@thiagaoai')}</span>
            <span class="ed-counter" style="color:${edMuted}">${String(card.index).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span>
          </div>
          <div class="ed-sep" style="background:${edBorder}"></div>

          <div class="ed-content">

            <div class="ed-top">
              <div class="ed-eyebrow" style="color:${edMuted}">${e(edEyebrow)}</div>
              <div class="ed-hl">${edHl}</div>
            </div>

            <div class="ed-bottom">
              <p class="ed-body" style="color:${edFgSub}">${e(edBodyText)}</p>
              ${edTagsHtml}
            </div>

          </div>

          <div class="ed-footer-sep" style="background:${edBorder}"></div>
          <div class="ed-footer" style="color:${edMuted}">
            <span>ED.${String(card.index).padStart(2,'0')} · ${e(edEyebrow)}</span>
            <span>${e(edTopicShort)}</span>
          </div>
        </div>`);
    }

    // ── LAYOUT 1: Fullbleed image (cover / CTA) ──────────────────────────────
    if (isFullBleed && imgUri) {
      return this.wrap(hFont, bFont, `
        <div class="card" style="background-image:url('${imgUri}');background-size:cover;background-position:center">
          <div class="fb-grad"></div>
          ${hdrOver}
          <div class="fb-body">
            ${ebOver}
            <div class="hl fb-hl">${hlFB}</div>
            ${sentences.length ? `<p class="fb-p" style="color:rgba(247,248,251,0.75)">${e(sentences[0])}</p>` : ''}
            ${ctaHtml || tagsHtml}
          </div>
          ${footerFB}
        </div>`);
    }

    // ── LAYOUT 2: Fullbleed gradient (cover / CTA, no image) ─────────────────
    if (isFullBleed) {
      return this.wrap(hFont, bFont, `
        <div class="card" style="background:radial-gradient(ellipse at 20% 28%,${P}99 0%,transparent 52%),linear-gradient(145deg,${BG_DARK},#0E1620)">
          ${hdrOver}
          <div class="txt-center">
            ${ebOver}
            <div class="hl txt-hl">${hlFB}</div>
            ${bodyHtml}
            ${ctaHtml}
          </div>
          ${footerFB}
        </div>`);
    }

    // ── LAYOUT 3: Stats grid (proof — no dominant image) ─────────────────────
    if (isStats) {
      return this.wrap(hFont, bFont, `
        <div class="card" style="background:${BG_LIGHT}">
          ${hdrBg}
          <div class="stats-section">
            ${ebBg}
            <div class="hl stats-hl">${hlTxt}</div>
            ${statsHtml}
          </div>
          ${footerBg}
        </div>`);
    }

    // ── LAYOUT 4: Photo Dominant — 3/4 image · 1/4 text ─────────────────────
    if (imgUri) {
      const gradRgb = dark ? '16,24,32' : '245,240,235';
      return this.wrap(hFont, bFont, `
        <div class="card pd" style="background:${bg}">
          <div class="pd-img" style="background-image:url('${imgUri}')">
            <div class="pd-grad" style="background:linear-gradient(to bottom,rgba(16,24,32,.28) 0%,transparent 30%,transparent 58%,rgba(${gradRgb},1) 100%)"></div>
            ${hdrOver}
          </div>
          <div class="pd-text">
            ${ebBg}
            <div class="hl pd-hl">${hlPD}</div>
            ${tagsHtml || ctaHtml}
          </div>
          ${footerBg}
        </div>`);
    }

    // ── LAYOUT 5: Text only ───────────────────────────────────────────────────
    return this.wrap(hFont, bFont, `
      <div class="card" style="background:${bg}">
        ${hdrBg}
        <div class="txt-center">
          ${ebBg}
          <div class="hl txt-hl">${hlTxt}</div>
          ${bodyHtml}
          ${tagsHtml}
          ${ctaHtml}
        </div>
        ${footerBg}
      </div>`);
  }

  wrap(hFont, bFont, cardInner) {
    return `<!DOCTYPE html><html lang="pt-BR">
<head><meta charset="utf-8"/>
${this.fontLinks(hFont, bFont)}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;font-family:'${bFont}',system-ui,sans-serif}

/* BASE */
.card{position:relative;width:${W}px;height:${H}px;display:flex;flex-direction:column;overflow:hidden}

/* HEADER — overlay (over image) */
.hdr-over{
  position:absolute;top:0;left:0;right:0;z-index:20;
  display:flex;align-items:center;justify-content:space-between;
  padding:46px 54px 0;
}
/* HEADER — on bg color */
.hdr-bg{
  position:relative;z-index:10;flex-shrink:0;
  display:flex;align-items:center;justify-content:space-between;
  padding:46px 54px 0;
}
.logo{display:flex;align-items:center;gap:14px}
.logo-mark{width:42px;height:42px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:900}
.logo-text{display:flex;flex-direction:column;line-height:1.1;gap:3px}
.logo-main{font-size:22px;font-weight:800;letter-spacing:.13em}
.logo-sub{font-size:14px;font-weight:400;letter-spacing:.07em;font-style:italic}
.counter{font-size:19px;font-weight:600;letter-spacing:.06em}

/* EYEBROW */
.eyebrow{font-size:16px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:20px}

/* HEADLINE */
.hl{font-family:'${hFont}',Georgia,serif}
.hl-line{letter-spacing:-.03em;font-weight:800}
.fb-hl .hl-line{font-size:118px;line-height:.88}
.txt-hl .hl-line{font-size:104px;line-height:.89}
.stats-hl .hl-line{font-size:98px;line-height:.89}
.pd-hl .hl-line{font-size:74px;line-height:.91}

/* BODY */
.body-p{font-size:28px;line-height:1.44;margin-top:20px}
.fb-p{font-size:26px;line-height:1.42;margin-top:18px}

/* TAGS */
.tags{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.tag{padding:10px 26px;border-radius:999px;border:1px solid;font-size:16px;font-weight:700;letter-spacing:.10em;text-transform:uppercase}

/* CTA */
.cta-btn{display:inline-flex;margin-top:30px;padding:20px 46px;border-radius:999px;color:white;font-size:26px;font-weight:800;letter-spacing:.02em}

/* FOOTER */
.ftr{
  flex-shrink:0;height:${FOOTER_H}px;
  display:flex;justify-content:space-between;align-items:center;
  padding:0 54px;
  font-size:14px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  border-top:1px solid;
}

/* ══ LAYOUT 1 & 2: Fullbleed ══ */
.fb-grad{
  position:absolute;inset:0;pointer-events:none;z-index:1;
  background:linear-gradient(175deg,rgba(16,24,32,.12) 0%,rgba(16,24,32,.05) 26%,rgba(16,24,32,.68) 60%,rgba(16,24,32,.97) 100%)
}
.fb-body{
  position:relative;z-index:5;flex:1;
  padding:0 58px 40px;
  display:flex;flex-direction:column;justify-content:flex-end;
  margin-top:100px;
}

/* ══ LAYOUT 3: Stats ══ */
.stats-section{flex:1;padding:28px 54px 16px;display:flex;flex-direction:column;justify-content:center}
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px}
.stat-box{border-radius:16px;padding:32px 28px}
.stat-num{font-size:90px;font-weight:800;line-height:1;font-style:italic}
.stat-lbl{font-size:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-top:10px}
.stat-desc{font-size:17px;margin-top:6px;line-height:1.35}

/* ══ LAYOUT 4: Photo Dominant 3/4 + 1/4 ══ */
.pd{flex-direction:column}
.pd-img{
  flex:0 0 ${IMG_H}px;position:relative;
  background-size:cover;background-position:center;
}
.pd-grad{position:absolute;inset:0;pointer-events:none}
.pd-text{
  flex:1;padding:18px 58px 12px;
  display:flex;flex-direction:column;justify-content:center;
}

/* ══ LAYOUT 5: Text only ══ */
.txt-center{flex:1;padding:28px 58px 16px;display:flex;flex-direction:column;justify-content:center}

/* ══ LAYOUT 6: Editorial — Architectural Digest style ══ */
.ed-card{position:relative;width:${W}px;height:${H}px;display:flex;flex-direction:column;overflow:hidden}
.ed-globe{position:absolute;right:-90px;top:-90px;width:580px;height:580px;z-index:0;pointer-events:none;flex-shrink:0}
.ed-hdr{position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:68px 88px 0;flex-shrink:0}
.ed-handle{font-family:'Inter',sans-serif;font-size:13px;font-weight:500;letter-spacing:.20em;text-transform:uppercase}
.ed-counter{font-family:'Inter',sans-serif;font-size:13px;font-weight:400;letter-spacing:.12em}
.ed-sep{height:1px;margin:28px 88px 0;flex-shrink:0;position:relative;z-index:10}
.ed-content{position:relative;z-index:10;flex:1;padding:52px 88px 0;display:flex;flex-direction:column;justify-content:space-between}
.ed-top{flex-shrink:0}
.ed-eyebrow{display:inline-block;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;letter-spacing:.30em;text-transform:uppercase;margin-bottom:44px;border-bottom:1.5px solid currentColor;padding-bottom:10px}
.ed-hl{display:flex;flex-direction:column}
.ed-hl-line{font-family:'Cormorant Garamond',Georgia,serif;font-size:76px;line-height:.93;letter-spacing:-.01em}
.ed-bottom{flex-shrink:0;padding-bottom:8px}
.ed-body{font-family:'Inter',sans-serif;font-size:38px;font-weight:400;line-height:1.50;margin-bottom:36px}
.ed-tags{display:flex;gap:14px;flex-wrap:wrap}
.ed-tag{font-family:'Inter',sans-serif;padding:10px 28px;border-radius:999px;border:1px solid;font-size:13px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
.ed-footer-sep{height:1px;margin:28px 88px 0;flex-shrink:0;position:relative;z-index:10}
.ed-footer{position:relative;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:18px 88px 54px;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:.16em;flex-shrink:0;text-transform:uppercase}
</style>
</head>
<body>${cardInner}</body>
</html>`;
  }

  fontLinks(hf, bf) {
    const fonts = [...new Set([hf, bf].filter(f => FONT_MAP[f]))];
    return fonts
      .map(f => `<link href="https://fonts.googleapis.com/css2?family=${FONT_MAP[f]}&display=swap" rel="stylesheet"/>`)
      .join('\n');
  }

  wireframeGlobe(color) {
    const s = `stroke="${color}" fill="none"`;
    return [
      `<circle cx="260" cy="260" r="252" ${s} stroke-width="1.2"/>`,
      `<ellipse cx="260" cy="105" rx="138" ry="36" ${s} stroke-width="0.8"/>`,
      `<ellipse cx="260" cy="175" rx="210" ry="56" ${s} stroke-width="0.8"/>`,
      `<ellipse cx="260" cy="260" rx="252" ry="76" ${s} stroke-width="0.8"/>`,
      `<ellipse cx="260" cy="345" rx="210" ry="56" ${s} stroke-width="0.8"/>`,
      `<ellipse cx="260" cy="415" rx="138" ry="36" ${s} stroke-width="0.8"/>`,
      `<ellipse cx="260" cy="260" rx="76" ry="252" ${s} stroke-width="0.8"/>`,
      `<ellipse cx="260" cy="260" rx="200" ry="252" ${s} stroke-width="0.8" transform="rotate(36 260 260)"/>`,
      `<ellipse cx="260" cy="260" rx="200" ry="252" ${s} stroke-width="0.8" transform="rotate(-36 260 260)"/>`,
      `<ellipse cx="260" cy="260" rx="200" ry="252" ${s} stroke-width="0.8" transform="rotate(72 260 260)"/>`,
      `<ellipse cx="260" cy="260" rx="200" ry="252" ${s} stroke-width="0.8" transform="rotate(-72 260 260)"/>`,
    ].join('\n');
  }

  toDataUri(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.svg' ? 'image/svg+xml' : 'image/png';
    return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
  }
}

module.exports = { CarouselRenderer };
