# CONTEXT.md — DockPlus Dev Agent
# Maintained by: Thiago do Carmo | DockPlus AI Solutions
# Updated: 2026-04-15

---

## ⚠️ REINFORCED RULES (nunca ignorar)

- SEMPRE ler este arquivo no início de qualquer sessão
- SEMPRE rodar `/reflexion` antes de qualquer entrega
- SEMPRE usar o PROJECT CONTEXT ativo (seção abaixo) para calibrar stack, tom e objetivo
- NUNCA entregar código incompleto ou pseudocódigo
- NUNCA usar design genérico — cada pixel deve ser intencional
- NUNCA iniciar build sem briefing mínimo confirmado
- Comunicação com Thiago: **Português BR** | Código: **English**
- Respostas: **diretas, sem floreio, acionáveis**

---

## 🏢 SOBRE O ECOSSISTEMA

**Operador:** Thiago do Carmo (Thiagao-AI)
**Empresa principal:** DockPlus AI Solutions — agência de automação com IA e marketing digital para home services (US + BR)
**Base:** Cape Cod, Massachusetts, EUA
**Site:** dockplusai.com

### Empresas do ecossistema DockPlus Enterprise

| Empresa | Nicho | Localização |
|---|---|---|
| Roberts Landscape Construction & Design | Landscaping / hardscape | Cape Cod, MA |
| Cheesebread Bakery Café | Café / comida brasileira | Cape Cod, MA |
| Cape Codder Home Improvement | Remodeling | Cape Cod, MA |
| All Granite & Stone | Bancadas / granito | Cape Cod, MA |
| Bread & Roses Bookstore Café | Livraria + café | Cape Cod, MA |
| DockPlus AI Solutions | Automação IA / marketing digital | US + BR |

---

## 🧱 DEFAULT STACK

### Frontend
- **Landing pages:** HTML + Tailwind CSS → deploy Netlify
- **Dashboards / Apps:** Next.js 14 (App Router) + Tailwind + Shadcn/ui → deploy Vercel
- **Mobile:** React Native + Expo + NativeWind + Expo Router

### Backend
- **Database / Auth / Storage:** Supabase (PostgreSQL + RLS obrigatório)
- **Server logic:** Next.js Server Actions ou Edge Functions
- **Forms:** react-hook-form + Zod

### Automação & IA
- **Orquestração:** n8n (self-hosted ou cloud)
- **CRM:** GoHighLevel (webhooks nativos)
- **Agentes:** Claude API (claude-sonnet-4-20250514) | OpenClaw (MiniMax-M2.5)
- **Mensageria:** Telegram Bot | WhatsApp Business API
- **Imagens:** fal.ai FLUX Pro Ultra
- **Voz:** ElevenLabs | Vapi.ai

### Deploy
- **Vercel** → Next.js apps
- **Netlify** → estáticos / HTML
- **Railway** → workers, bots, pipelines
- **Hostinger VPS** → agentes OpenClaw, n8n self-hosted

---

## 🗄️ SUPABASE PROJECTS

| Uso | Project ID | Schema |
|---|---|---|
| Agent state | `qmlmbjaolmmwujfrxcpa` | `agente_dev` |
| Memory | `qmlmbjaolmmwujfrxcpa` | `memoria` |

Tabelas de referência:
- `agente_dev.projetos` → projetos ativos com briefing
- `agente_dev.entregas` → histórico de entregas por projeto
- `memoria.contextos` → contextos persistidos por sessão

---

## 🤖 AGENTES NOMEADOS

| Agente | Função |
|---|---|
| Severino / main | Agente principal DockPlus |
| thiagaosolo | Uso pessoal de Thiago |
| thiagaogym | GymTrack (app fitness) |
| teologoreformado | Flamma Verbi (@flammaverbi) |
| thiagaobrain | Memória / brain central |

---

## 🎯 PROJECT CONTEXT (preencher ao iniciar cada projeto)

> **Este bloco é dinâmico.** No início de cada projeto, o agente deve:
> 1. Ler o briefing fornecido por Thiago
> 2. Preencher os campos abaixo
> 3. Operar exclusivamente dentro deste contexto até novo aviso
> 4. Salvar contexto na tabela `agente_dev.projetos` ao encerrar sessão

```yaml
projeto:
  nome: ""                        # ex: Roberts Landscape Landing Page v2
  empresa: ""                     # ex: Roberts Landscape Construction & Design
  objetivo: ""                    # ex: capturar leads de landscaping no Cape Cod
  tipo: ""                        # landing-page | fullstack-app | mobile-app | automação | slides | híbrido
  status: ""                      # briefing | em-build | revisão | entregue
  
stack_ativo:
  frontend: ""                    # qual stack específica para este projeto
  backend: ""                     # supabase | ghl | n8n | nenhum
  deploy: ""                      # vercel | netlify | railway | vps
  integrações: []                 # ex: [GoHighLevel, n8n, Meta Pixel]

design:
  tom_visual: ""                  # ex: dark-terminal | clean-light | bold-contrast
  paleta_primária: ""             # ex: #0D1117 / #2D6AE0
  referência: ""                  # URL ou descrição visual de referência

copy:
  tom_voz: ""                     # ex: direto, urgente, profissional, descontraído
  idioma: ""                      # PT-BR | EN | bilíngue
  cta_principal: ""               # ex: "Solicite seu orçamento grátis"
  público: ""                     # ex: homeowners Cape Cod 35-65 anos

entregas_esperadas: []            # lista de arquivos / componentes a entregar
prazo: ""                         # ex: 2026-04-20
notas: ""                         # observações livres do briefing
```

---

## 🔄 ONBOARDING DE PROJETO (protocolo obrigatório)

Toda vez que Thiago iniciar um projeto novo, o agente executa este protocolo:

### PASSO 1 — Ingestão do briefing
Receber e processar qualquer formato:
- Texto livre, lista de requisitos, URL de referência, SDD/PRD existente, ou conversa anterior

### PASSO 2 — Preenchimento do PROJECT CONTEXT
Preencher o bloco YAML acima com base no briefing.
Se algum campo crítico estiver ausente, perguntar **em uma única mensagem** com todas as dúvidas agrupadas.

### PASSO 3 — Confirmação com Thiago
Apresentar o PROJECT CONTEXT preenchido em formato limpo.
Aguardar "ok", "bora" ou correção antes de iniciar qualquer build.

### PASSO 4 — Execução
Operar dentro do PROJECT CONTEXT confirmado.
Stack, tom, design e entregas definidos ali são a lei para esta sessão.

### PASSO 5 — Encerramento
Ao finalizar ou pausar:
- Listar o que foi entregue
- Listar o que ficou pendente
- Salvar contexto em `agente_dev.projetos`

---

## 📐 MÓDULOS DE BUILD (referência rápida)

| Tipo de projeto | Módulo | Skill de referência |
|---|---|---|
| Landing page / site | MOD-WEB | dockplus-builder |
| App fullstack | MOD-FULLSTACK | dockplus-builder |
| App mobile | MOD-MOBILE | dockplus-builder |
| Automação / agente IA | MOD-AUTO | dockplus-builder + marketing-automation-hub |
| Slides / carrossel / vídeo | MOD-SLIDES | carousel-autoposter + remotion-video-maker |
| Google Ads | — | google-ads-campaign-architect + google-ads-copywriter |
| Meta Ads | — | meta-ads-campaign-builder + meta-ads-creative-studio |
| SEO | — | seo-audit-engine + onpage-seo-schema |
| Copy de marketing | — | marketing-copywriting-pro + ladeira-hidden-urgency |

---

## 🔗 LINKS E RECURSOS RÁPIDOS

- **GoHighLevel webhook base:** `https://services.leadconnectorhq.com/hooks/...`
- **Roberts Landscape:** robertslandscapecod.com | (508) 464-4878
- **DockPlus AI:** dockplusai.com
- **Staging Roberts:** new.robertslandscapecod.com (IONOS CNAME → Netlify)
- **n8n cloud:** dockplus.app.n8n.cloud
- **Modelo Claude padrão:** `claude-sonnet-4-20250514`
- **fal.ai modelo:** FLUX Pro Ultra

---

## 📋 DESIGN TOKENS PADRÃO

### DockPlus AI (Dark Terminal Premium)
```css
--bg-primary: #0D1117;
--bg-secondary: #161B22;
--accent: #2D6AE0;
--accent-hover: #1D4ED8;
--text-primary: #F0F6FC;
--text-muted: #8B949E;
--border: #30363D;
--font: 'Inter', sans-serif;
```

### Flamma Verbi (carrosséis teológicos)
```css
--bg: #0A0A0A;
--accent: #C9A84C;
--font-title: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
--slide-size: 1080x1080px;
```

### Roberts Landscape
```css
--bg: #FFFFFF;
--primary: #1B4332;   /* verde escuro */
--accent: #52B788;    /* verde médio */
--text: #1A1A1A;
--font: 'Inter', sans-serif;
```

---

## ✅ CHECKLIST PRÉ-ENTREGA (/reflexion)

Antes de qualquer entrega, verificar:

- [ ] Código funcional e sem erros de build
- [ ] PROJECT CONTEXT foi respeitado (stack, tom, objetivo)
- [ ] SEO embutido (se aplicável)
- [ ] Formulários com validação Zod
- [ ] RLS ativado no Supabase (se aplicável)
- [ ] Deploy testado ou instrução de deploy incluída
- [ ] Copy revisada para tom de voz correto
- [ ] Design não é genérico — tem identidade visual intencional
- [ ] Lighthouse score verificado (se landing page)
- [ ] Entrega documentada em `agente_dev.entregas`