"""
Carousel Autoposter Bot — Telegram → fal.ai → Postforme.dev
@thiagaoai — DockPlus AI Solutions

Bot de Telegram que gera carrosseis virais para Instagram:
1. Conversa guiada: pergunta tema, tom, estilo, qtd de cards
2. Pesquisa conteudo na web via Tavily/Perplexity
3. Gera imagens com fal.ai (aquarela, cinematico, anime, 3D, ultra-realista)
4. Monta cards 1080x1350 (4:5) com Playwright
5. Mostra preview no Telegram pra aprovacao
6. Posta no Instagram via postforme.dev
"""

import os
import json
import logging
import asyncio
from typing import Optional
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup,
    InputMediaPhoto
)
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, ConversationHandler, ContextTypes, filters
)

from card_engine import CardEngine
from image_gen import ImageGenerator
from content_research import ContentResearcher
from poster import PostformeClient

# ─── Config ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
FAL_KEY = os.environ.get("FAL_KEY", "")
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
POSTFORME_API_KEY = os.environ.get("POSTFORME_API_KEY", "")
POSTFORME_IG_ID = os.environ.get("POSTFORME_IG_ID", "")
HANDLE = os.environ.get("HANDLE", "@thiagaoai")
PORT = int(os.environ.get("PORT", "8080"))

# Allowed Telegram user IDs (comma-separated in env)
ALLOWED_USERS_RAW = os.environ.get("ALLOWED_USERS", "")
ALLOWED_USERS = set()
if ALLOWED_USERS_RAW:
    ALLOWED_USERS = {int(uid.strip()) for uid in ALLOWED_USERS_RAW.split(",") if uid.strip()}

# Conversation states
TEMA, TOM, ESTILO, QTD_CARDS, CTA, CONFIRMA, EDIT_CAPTION = range(7)

# ─── Estilo visual options ────────────────────────────────────
ESTILOS = {
    "aquarela": {
        "name": "Aquarela + Tech",
        "prompt_suffix": "watercolor painting style, soft flowing colors, artistic brushstrokes, ethereal dreamy atmosphere, teal mint lavender palette",
        "emoji": "🎨"
    },
    "cinematico": {
        "name": "Cinematico Ultra-Realista",
        "prompt_suffix": "cinematic photography, golden hour lighting, photorealistic, dramatic composition, anamorphic lens flare, 8k detailed",
        "emoji": "🎬"
    },
    "anime": {
        "name": "Anime / Manga",
        "prompt_suffix": "anime art style, vibrant colors, dynamic composition, studio ghibli inspired, detailed anime illustration, cel shading",
        "emoji": "⛩️"
    },
    "3d_pixar": {
        "name": "3D Pixar / Disney",
        "prompt_suffix": "3D render pixar disney style, warm lighting, soft shadows, friendly character design, octane render, subsurface scattering",
        "emoji": "✨"
    },
    "dark_tech": {
        "name": "Dark Tech / Terminal",
        "prompt_suffix": "dark moody tech aesthetic, glowing neon circuits, terminal screen in dark room, electric blue amber lighting, cyberpunk atmosphere",
        "emoji": "💻"
    },
}

TONS = {
    "educativo": "Ensina com dados e exemplos praticos",
    "provocativo": "Desafia o leitor, polemico, direto",
    "inspiracional": "Visionario, motivacional, empoderador",
    "tecnico": "Foco em features, comandos, specs",
}


# ─── Railway domain detection ─────────────────────────────────
RAILWAY_PUBLIC_DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "carousel-bot-secret-2026")


# ─── Access control ───────────────────────────────────────────
def check_access(update: Update) -> bool:
    if not ALLOWED_USERS:
        return True
    user_id = update.effective_user.id if update.effective_user else None
    return user_id in ALLOWED_USERS


# ─── Shared pipeline function ─────────────────────────────────
async def run_pipeline(chat_id: int, context: ContextTypes.DEFAULT_TYPE, status_message=None):
    """Execute the full carousel generation pipeline."""
    data = context.user_data
    tema = data["tema"]
    tom = data["tom"]
    estilo = data["estilo"]
    qtd = data["qtd_cards"]
    cta = data["cta"]

    async def update_status(text):
        if status_message:
            try:
                await status_message.edit_text(text, parse_mode="Markdown")
            except Exception:
                pass

    await update_status("⏳ *Gerando seu carrossel...*\n\n1/4 🔍 Pesquisando conteudo...")

    try:
        # ─── FASE 2: Research ─────────────────────────────
        researcher = ContentResearcher(
            api_key=TAVILY_API_KEY,
            perplexity_key=PERPLEXITY_API_KEY
        )
        research_data = await researcher.research(tema, tom, qtd)

        await update_status(
            "⏳ *Gerando seu carrossel...*\n\n"
            "✅ Pesquisa concluida\n"
            "2/4 🎨 Gerando imagens com IA..."
        )

        # ─── FASE 3: Generate AI images ──────────────────
        img_gen = ImageGenerator(fal_key=FAL_KEY, replicate_token=REPLICATE_API_TOKEN)
        image_paths = await img_gen.generate_batch(
            research_data["image_prompts"],
            style=estilo,
            style_suffix=ESTILOS[estilo]["prompt_suffix"]
        )

        await update_status(
            "⏳ *Gerando seu carrossel...*\n\n"
            "✅ Pesquisa concluida\n"
            "✅ Imagens geradas\n"
            "3/4 🖼️ Montando cards..."
        )

        # ─── FASE 4: Build cards ─────────────────────────
        engine = CardEngine(handle=HANDLE)
        card_paths = await engine.generate_cards(
            cards_data=research_data["cards"],
            bg_images=image_paths,
            total=qtd,
            cta_text=cta
        )

        await update_status(
            "⏳ *Gerando seu carrossel...*\n\n"
            "✅ Pesquisa concluida\n"
            "✅ Imagens geradas\n"
            "✅ Cards montados\n"
            "4/4 ✍️ Finalizando..."
        )

        # ─── FASE 5: Caption ─────────────────────────────
        caption = research_data["caption"]

        # ─── FASE 6: Send preview to Telegram ────────────
        media_group = []
        for i, path in enumerate(card_paths):
            with open(path, "rb") as f:
                img_bytes = f.read()
            if i == 0:
                media_group.append(InputMediaPhoto(
                    media=img_bytes,
                    caption=f"🖼️ Preview do carrossel ({len(card_paths)} cards)"
                ))
            else:
                media_group.append(InputMediaPhoto(media=img_bytes))

        await context.bot.send_media_group(chat_id=chat_id, media=media_group)

        await context.bot.send_message(
            chat_id=chat_id,
            text=f"📝 *Caption:*\n\n{caption}",
            parse_mode="Markdown"
        )

        # Store for post action
        context.user_data["card_paths"] = card_paths
        context.user_data["caption"] = caption

        keyboard = [
            [
                InlineKeyboardButton("✅ Postar agora!", callback_data="post_sim"),
                InlineKeyboardButton("❌ Descartar", callback_data="post_nao"),
            ],
            [
                InlineKeyboardButton("🔄 Regenerar imagens", callback_data="post_regen"),
                InlineKeyboardButton("✏️ Editar caption", callback_data="post_edit"),
            ]
        ]

        await context.bot.send_message(
            chat_id=chat_id,
            text="*O que quer fazer?*",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        await context.bot.send_message(
            chat_id=chat_id,
            text=f"❌ Erro no pipeline: {str(e)[:300]}\n\nTente novamente com /carrossel"
        )


# ─── Handlers ─────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not check_access(update):
        await update.message.reply_text("⛔ Acesso negado.")
        return

    await update.message.reply_text(
        f"🚀 *Carousel Autoposter Bot*\n\n"
        f"Eu crio carrosseis virais e posto no Instagram automaticamente.\n\n"
        f"*Comandos:*\n"
        f"/carrossel — Criar novo carrossel (guiado)\n"
        f"/rapido <tema> — Modo rapido (5 cards)\n"
        f"/estilos — Estilos visuais disponiveis\n"
        f"/status — Status das APIs\n"
        f"/help — Ajuda\n\n"
        f"Handle: {HANDLE}",
        parse_mode="Markdown"
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not check_access(update):
        return
    await update.message.reply_text(
        "📖 *Como usar:*\n\n"
        "*Modo guiado:*\n"
        "1. /carrossel\n"
        "2. Escolha tema, tom, estilo, qtd cards, CTA\n"
        "3. Confirme e aguarde\n"
        "4. Aprove ou descarte o preview\n\n"
        "*Modo rapido:*\n"
        "/rapido IA para pequenas empresas\n"
        "(5 cards, inspiracional, cinematico)\n\n"
        "*Dicas:*\n"
        "- Temas especificos geram conteudo melhor\n"
        "- Use /estilos pra ver as opcoes visuais\n"
        "- Depois do preview, voce pode editar o caption",
        parse_mode="Markdown"
    )


async def estilos_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not check_access(update):
        return
    text = "🎨 *Estilos Visuais Disponiveis:*\n\n"
    for key, style in ESTILOS.items():
        text += f"{style['emoji']} *{style['name']}*\n"
    text += "\nEscolha um na hora de criar o carrossel!"
    await update.message.reply_text(text, parse_mode="Markdown")


async def status_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not check_access(update):
        return
    checks = {
        "Telegram": "✅" if TELEGRAM_TOKEN else "❌",
        "fal.ai (imagens)": "✅" if FAL_KEY else "❌",
        "Replicate (fallback)": "✅" if REPLICATE_API_TOKEN else "⚠️ opcional",
        "Tavily (pesquisa)": "✅" if TAVILY_API_KEY else "⚠️",
        "Perplexity (pesquisa)": "✅" if PERPLEXITY_API_KEY else "⚠️",
        "PostForMe (Instagram)": "✅" if POSTFORME_API_KEY else "❌",
        "Instagram ID": "✅" if POSTFORME_IG_ID else "❌",
    }
    text = "🔧 *Status das APIs:*\n\n"
    for name, status in checks.items():
        text += f"{status} {name}\n"

    research = "Tavily" if TAVILY_API_KEY else ("Perplexity" if PERPLEXITY_API_KEY else "Template")
    text += f"\n📡 Pesquisa via: *{research}*"
    text += f"\n🎨 Imagens via: *{'fal.ai' if FAL_KEY else ('Replicate' if REPLICATE_API_TOKEN else 'Placeholder')}*"

    await update.message.reply_text(text, parse_mode="Markdown")


# ─── Conversation: Guided Carousel Creation ───────────────────

async def carrossel_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not check_access(update):
        await update.message.reply_text("⛔ Acesso negado.")
        return ConversationHandler.END

    await update.message.reply_text(
        "📝 *Vamos criar um carrossel!*\n\n"
        "Qual o *tema/assunto*? Me conta em uma frase.\n\n"
        "Exemplo: _Claude Code para desenvolvedores_",
        parse_mode="Markdown"
    )
    return TEMA


async def tema_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["tema"] = update.message.text

    keyboard = [
        [InlineKeyboardButton("📚 Educativo", callback_data="tom_educativo")],
        [InlineKeyboardButton("🔥 Provocativo", callback_data="tom_provocativo")],
        [InlineKeyboardButton("💫 Inspiracional", callback_data="tom_inspiracional")],
        [InlineKeyboardButton("⚙️ Tecnico", callback_data="tom_tecnico")],
    ]
    await update.message.reply_text(
        f"✅ Tema: *{update.message.text}*\n\n"
        f"Qual o *tom* do carrossel?",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
    return TOM


async def tom_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    tom = query.data.replace("tom_", "")
    context.user_data["tom"] = tom

    keyboard = []
    for key, style in ESTILOS.items():
        keyboard.append([InlineKeyboardButton(
            f"{style['emoji']} {style['name']}", callback_data=f"estilo_{key}"
        )])

    await query.edit_message_text(
        f"✅ Tom: *{tom.capitalize()}*\n\n"
        f"Qual *estilo visual* para as imagens?",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
    return ESTILO


async def estilo_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    estilo = query.data.replace("estilo_", "")
    context.user_data["estilo"] = estilo

    keyboard = [
        [InlineKeyboardButton("5 cards (rapido)", callback_data="qtd_5")],
        [InlineKeyboardButton("7 cards (completo)", callback_data="qtd_7")],
        [InlineKeyboardButton("10 cards (guia)", callback_data="qtd_10")],
    ]

    await query.edit_message_text(
        f"✅ Estilo: *{ESTILOS[estilo]['name']}*\n\n"
        f"Quantos *cards*?",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
    return QTD_CARDS


async def qtd_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    qtd = int(query.data.replace("qtd_", ""))
    context.user_data["qtd_cards"] = qtd

    keyboard = [
        [InlineKeyboardButton("SALVA E COMPARTILHA", callback_data="cta_salva")],
        [InlineKeyboardButton("MANDA UM DM", callback_data="cta_dm")],
        [InlineKeyboardButton("LINK NA BIO", callback_data="cta_bio")],
        [InlineKeyboardButton("COMENTA 'EU QUERO'", callback_data="cta_comenta")],
    ]

    await query.edit_message_text(
        f"✅ Cards: *{qtd}*\n\n"
        f"Qual o *CTA* do ultimo card?",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
    return CTA


async def cta_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    cta_map = {
        "cta_salva": "SALVA E COMPARTILHA",
        "cta_dm": "MANDA UM DM",
        "cta_bio": "LINK NA BIO",
        "cta_comenta": "COMENTA 'EU QUERO'",
    }
    cta = cta_map.get(query.data, "SALVA E COMPARTILHA")
    context.user_data["cta"] = cta

    data = context.user_data
    summary = (
        f"📋 *Resumo do Carrossel:*\n\n"
        f"📌 Tema: *{data['tema']}*\n"
        f"🎭 Tom: *{data['tom'].capitalize()}*\n"
        f"🎨 Estilo: *{ESTILOS[data['estilo']]['name']}*\n"
        f"📊 Cards: *{data['qtd_cards']}*\n"
        f"🎯 CTA: *{cta}*\n"
        f"👤 Handle: *{HANDLE}*\n\n"
        f"Confirma?"
    )

    keyboard = [
        [
            InlineKeyboardButton("✅ Gerar!", callback_data="confirma_sim"),
            InlineKeyboardButton("❌ Cancelar", callback_data="confirma_nao"),
        ]
    ]

    await query.edit_message_text(
        summary,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
    return CONFIRMA


async def confirma_gerar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "confirma_nao":
        await query.edit_message_text("❌ Cancelado. Use /carrossel pra comecar de novo.")
        return ConversationHandler.END

    status_msg = await query.edit_message_text(
        "⏳ *Iniciando pipeline...*", parse_mode="Markdown"
    )

    await run_pipeline(query.message.chat_id, context, status_message=status_msg)
    return ConversationHandler.END


# ─── Post approval handler ────────────────────────────────────

async def post_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "post_nao":
        await query.edit_message_text("❌ Descartado. Use /carrossel pra criar outro.")
        return

    if query.data == "post_edit":
        await query.edit_message_text(
            "✏️ Me manda o novo caption como mensagem de texto.\n"
            "Depois eu mostro os botoes de novo."
        )
        context.user_data["awaiting_caption_edit"] = True
        return

    if query.data == "post_regen":
        await query.edit_message_text("🔄 Use /carrossel pra gerar com novo estilo.")
        return

    if query.data == "post_sim":
        await query.edit_message_text("📤 *Postando no Instagram...*", parse_mode="Markdown")

        try:
            card_paths = context.user_data.get("card_paths", [])
            caption = context.user_data.get("caption", "")

            if not card_paths:
                await context.bot.send_message(
                    chat_id=query.message.chat_id,
                    text="❌ Nenhum card encontrado. Gere novamente com /carrossel"
                )
                return

            poster = PostformeClient(
                api_key=POSTFORME_API_KEY,
                ig_id=POSTFORME_IG_ID
            )
            result = await poster.post_carousel(card_paths, caption)

            if result:
                await context.bot.send_message(
                    chat_id=query.message.chat_id,
                    text=(
                        f"✅ *CARROSSEL POSTADO!*\n\n"
                        f"📌 Tema: {context.user_data.get('tema', 'N/A')}\n"
                        f"📊 Cards: {len(card_paths)}\n"
                        f"🎨 Estilo: {ESTILOS.get(context.user_data.get('estilo', ''), {}).get('name', 'N/A')}\n"
                        f"📱 Plataforma: Instagram\n"
                        f"👤 Handle: {HANDLE}\n\n"
                        f"🎉 Vai bombar!"
                    ),
                    parse_mode="Markdown"
                )
            else:
                await context.bot.send_message(
                    chat_id=query.message.chat_id,
                    text="❌ Falha na postagem. Verifique as credenciais do postforme.dev"
                )

        except Exception as e:
            logger.error(f"Post error: {e}", exc_info=True)
            await context.bot.send_message(
                chat_id=query.message.chat_id,
                text=f"❌ Erro ao postar: {str(e)[:200]}"
            )


# ─── Caption edit handler ─────────────────────────────────────

async def caption_edit_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle edited caption text messages."""
    if not context.user_data.get("awaiting_caption_edit"):
        return

    context.user_data["awaiting_caption_edit"] = False
    context.user_data["caption"] = update.message.text

    keyboard = [
        [
            InlineKeyboardButton("✅ Postar agora!", callback_data="post_sim"),
            InlineKeyboardButton("❌ Descartar", callback_data="post_nao"),
        ]
    ]

    await update.message.reply_text(
        f"✅ Caption atualizado!\n\n"
        f"📝 *Novo caption:*\n{update.message.text[:500]}",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )


# ─── Quick mode ───────────────────────────────────────────────

async def rapido(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not check_access(update):
        await update.message.reply_text("⛔ Acesso negado.")
        return

    if not context.args:
        await update.message.reply_text(
            "Uso: /rapido <tema>\n"
            "Exemplo: /rapido Claude Code para devs"
        )
        return

    tema = " ".join(context.args)
    context.user_data.update({
        "tema": tema,
        "tom": "inspiracional",
        "estilo": "cinematico",
        "qtd_cards": 5,
        "cta": "SALVA E COMPARTILHA",
    })

    status_msg = await update.message.reply_text(
        f"⚡ *Modo rapido!*\n\n"
        f"Tema: {tema}\n"
        f"5 cards, inspiracional, cinematico\n\n"
        f"Gerando...",
        parse_mode="Markdown"
    )

    await run_pipeline(update.message.chat_id, context, status_message=status_msg)


# ─── Error handler ────────────────────────────────────────────

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    """Log errors."""
    logger.error(f"Exception while handling update: {context.error}", exc_info=context.error)


# ─── Main ─────────────────────────────────────────────────────

def main():
    if not TELEGRAM_TOKEN:
        print("❌ TELEGRAM_TOKEN not set!")
        print("   Set it in Railway environment variables.")
        return

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    # Conversation handler for guided carousel creation
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("carrossel", carrossel_start)],
        states={
            TEMA: [MessageHandler(filters.TEXT & ~filters.COMMAND, tema_received)],
            TOM: [CallbackQueryHandler(tom_selected, pattern="^tom_")],
            ESTILO: [CallbackQueryHandler(estilo_selected, pattern="^estilo_")],
            QTD_CARDS: [CallbackQueryHandler(qtd_selected, pattern="^qtd_")],
            CTA: [CallbackQueryHandler(cta_selected, pattern="^cta_")],
            CONFIRMA: [CallbackQueryHandler(confirma_gerar, pattern="^confirma_")],
        },
        fallbacks=[CommandHandler("cancel", lambda u, c: ConversationHandler.END)],
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("estilos", estilos_cmd))
    app.add_handler(CommandHandler("status", status_cmd))
    app.add_handler(CommandHandler("rapido", rapido))
    app.add_handler(conv_handler)
    app.add_handler(CallbackQueryHandler(post_action, pattern="^post_"))
    app.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND,
        caption_edit_handler
    ))
    app.add_error_handler(error_handler)

    if RAILWAY_PUBLIC_DOMAIN:
        # ─── Webhook mode (Railway) ──────────────────────
        webhook_url = f"https://{RAILWAY_PUBLIC_DOMAIN}/webhook"
        logger.info(f"🤖 Starting WEBHOOK mode: {webhook_url} on port {PORT}")
        app.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path="/webhook",
            webhook_url=webhook_url,
            drop_pending_updates=True,
        )
    else:
        # ─── Polling mode (local dev) ────────────────────
        logger.info(f"🤖 Starting POLLING mode. Handle: {HANDLE}")
        app.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
        )


if __name__ == "__main__":
    main()
