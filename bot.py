"""
Carousel Autoposter Bot — Telegram → fal.ai → Postforme.dev
@thiagaoai

Bot de Telegram que gera carrosseis virais para Instagram:
1. Conversa guiada: pergunta tema, tom, estilo, qtd de cards
2. Pesquisa conteudo na web via Tavily
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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
FAL_KEY = os.environ.get("FAL_KEY", "")
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
POSTFORME_API_KEY = os.environ.get("POSTFORME_API_KEY", "pfm_live_WWvtsC8mroVDc9NH7JySvo")
POSTFORME_IG_ID = os.environ.get("POSTFORME_IG_ID", "17841400194457065")
HANDLE = "@thiagaoai"

# Conversation states
TEMA, TOM, ESTILO, QTD_CARDS, CTA, CONFIRMA = range(6)

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


# ─── Handlers ─────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome message"""
    await update.message.reply_text(
        f"🚀 *Carousel Autoposter Bot*\n\n"
        f"Eu crio carrosseis virais e posto no Instagram automaticamente.\n\n"
        f"Comandos:\n"
        f"/carrossel — Criar um novo carrossel (guiado)\n"
        f"/rapido <tema> — Modo rapido (5 cards, inspiracional)\n"
        f"/estilos — Ver estilos visuais disponiveis\n"
        f"/help — Ajuda\n\n"
        f"Handle: {HANDLE}",
        parse_mode="Markdown"
    )


async def estilos_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show available visual styles"""
    text = "🎨 *Estilos Visuais Disponiveis:*\n\n"
    for key, style in ESTILOS.items():
        text += f"{style['emoji']} *{style['name']}*\n"
    text += "\nEscolha um na hora de criar o carrossel!"
    await update.message.reply_text(text, parse_mode="Markdown")


# ─── Conversation: Guided Carousel Creation ───────────────────

async def carrossel_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """FASE 1: Ask for topic"""
    await update.message.reply_text(
        "📝 *Vamos criar um carrossel!*\n\n"
        "Qual o *tema/assunto*? Me conta em uma frase.\n\n"
        "Exemplo: _Claude Code para desenvolvedores_",
        parse_mode="Markdown"
    )
    return TEMA


async def tema_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Store topic, ask for tone"""
    context.user_data["tema"] = update.message.text

    keyboard = [
        [InlineKeyboardButton(f"📚 Educativo", callback_data="tom_educativo")],
        [InlineKeyboardButton(f"🔥 Provocativo", callback_data="tom_provocativo")],
        [InlineKeyboardButton(f"💫 Inspiracional", callback_data="tom_inspiracional")],
        [InlineKeyboardButton(f"⚙️ Tecnico", callback_data="tom_tecnico")],
    ]
    await update.message.reply_text(
        f"✅ Tema: *{update.message.text}*\n\n"
        f"Qual o *tom* do carrossel?",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown"
    )
    return TOM


async def tom_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Store tone, ask for visual style"""
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
    """Store style, ask for card count"""
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
    """Store count, ask for CTA"""
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
    """Store CTA, show summary and confirm"""
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
    """User confirmed — start the full pipeline"""
    query = update.callback_query
    await query.answer()

    if query.data == "confirma_nao":
        await query.edit_message_text("❌ Cancelado. Use /carrossel pra comecar de novo.")
        return ConversationHandler.END

    data = context.user_data
    tema = data["tema"]
    tom = data["tom"]
    estilo = data["estilo"]
    qtd = data["qtd_cards"]
    cta = data["cta"]

    await query.edit_message_text("⏳ *Gerando seu carrossel...*\n\n1/4 🔍 Pesquisando conteudo...", parse_mode="Markdown")

    try:
        # ─── FASE 2: Research ─────────────────────────────
        researcher = ContentResearcher(api_key=TAVILY_API_KEY)
        research_data = await researcher.research(tema, tom, qtd)

        await query.edit_message_text(
            "⏳ *Gerando seu carrossel...*\n\n"
            "✅ Pesquisa concluida\n"
            "2/4 🎨 Gerando imagens com IA...",
            parse_mode="Markdown"
        )

        # ─── FASE 3: Generate AI images ──────────────────
        img_gen = ImageGenerator(fal_key=FAL_KEY, replicate_token=REPLICATE_API_TOKEN)
        image_paths = await img_gen.generate_batch(
            research_data["image_prompts"],
            style=estilo,
            style_suffix=ESTILOS[estilo]["prompt_suffix"]
        )

        await query.edit_message_text(
            "⏳ *Gerando seu carrossel...*\n\n"
            "✅ Pesquisa concluida\n"
            "✅ Imagens geradas\n"
            "3/4 🖼️ Montando cards...",
            parse_mode="Markdown"
        )

        # ─── FASE 4: Build cards ─────────────────────────
        engine = CardEngine(handle=HANDLE)
        card_paths = await engine.generate_cards(
            cards_data=research_data["cards"],
            bg_images=image_paths,
            total=qtd,
            cta_text=cta
        )

        await query.edit_message_text(
            "⏳ *Gerando seu carrossel...*\n\n"
            "✅ Pesquisa concluida\n"
            "✅ Imagens geradas\n"
            "✅ Cards montados\n"
            "4/4 ✍️ Escrevendo caption...",
            parse_mode="Markdown"
        )

        # ─── FASE 5: Generate caption ────────────────────
        caption = research_data["caption"]

        # ─── FASE 6: Send preview to Telegram ────────────
        media_group = []
        for i, path in enumerate(card_paths):
            with open(path, "rb") as f:
                if i == 0:
                    media_group.append(InputMediaPhoto(
                        media=f.read(),
                        caption=f"🖼️ Preview do carrossel ({len(card_paths)} cards)"
                    ))
                else:
                    media_group.append(InputMediaPhoto(media=f.read()))

        await context.bot.send_media_group(
            chat_id=query.message.chat_id,
            media=media_group
        )

        # Send caption preview
        await context.bot.send_message(
            chat_id=query.message.chat_id,
            text=f"📝 *Caption:*\n\n{caption}",
            parse_mode="Markdown"
        )

        # Approval buttons
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
            chat_id=query.message.chat_id,
            text="*O que quer fazer?*",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode="Markdown"
        )

    except Exception as e:
        logger.error(f"Error generating carousel: {e}", exc_info=True)
        await query.edit_message_text(f"❌ Erro: {str(e)[:200]}\n\nTente novamente com /carrossel")

    return ConversationHandler.END


# ─── Post approval handler ────────────────────────────────────

async def post_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle post approval/rejection"""
    query = update.callback_query
    await query.answer()

    if query.data == "post_nao":
        await query.edit_message_text("❌ Descartado. Use /carrossel pra criar outro.")
        return

    if query.data == "post_edit":
        await query.edit_message_text("✏️ Me manda o novo caption como mensagem de texto:")
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


# ─── Quick mode ───────────────────────────────────────────────

async def rapido(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Quick mode: /rapido <tema>"""
    if not context.args:
        await update.message.reply_text("Uso: /rapido <tema>\nExemplo: /rapido Claude Code para devs")
        return

    tema = " ".join(context.args)
    context.user_data.update({
        "tema": tema,
        "tom": "inspiracional",
        "estilo": "cinematico",
        "qtd_cards": 5,
        "cta": "SALVA E COMPARTILHA",
    })

    await update.message.reply_text(
        f"⚡ *Modo rapido!*\n\n"
        f"Tema: {tema}\n"
        f"5 cards, inspiracional, cinematico\n\n"
        f"Gerando...",
        parse_mode="Markdown"
    )

    # Trigger the same pipeline
    # (reuse confirma_gerar logic inline)
    # For simplicity, we create a mock callback query scenario
    # In production, extract pipeline to shared function


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
    app.add_handler(CommandHandler("estilos", estilos_cmd))
    app.add_handler(CommandHandler("rapido", rapido))
    app.add_handler(conv_handler)
    app.add_handler(CallbackQueryHandler(post_action, pattern="^post_"))

    print(f"🤖 Carousel Bot rodando! Handle: {HANDLE}")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
