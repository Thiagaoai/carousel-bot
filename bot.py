"""
Carousel Autoposter Bot — Telegram → Replicate/fal.ai → Postforme.dev
@thiagaoai — DockPlus AI Solutions

Fluxo:
1. Usuario manda o brief/tema do carrossel
2. Bot cria prompt e mostra pra aprovacao
3. Apos aprovacao, gera imagens (Replicate primary, fal.ai fallback)
4. Monta cards 1080x1350 e manda preview no Telegram
5. Apos aprovacao, posta no Instagram via postforme.dev
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

RAILWAY_PUBLIC_DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")

# Conversation states
BRIEF, APPROVE_PROMPT, APPROVE_IMAGES, EDIT_CAPTION = range(4)

# ─── Estilo visual options ────────────────────────────────────
ESTILOS = {
    "aquarela": {
        "name": "Aquarela + Tech",
        "prompt_suffix": "watercolor painting style, soft flowing colors, artistic brushstrokes, ethereal dreamy atmosphere, teal mint lavender palette",
    },
    "cinematico": {
        "name": "Cinematico Ultra-Realista",
        "prompt_suffix": "cinematic photography, golden hour lighting, photorealistic, dramatic composition, anamorphic lens flare, 8k detailed",
    },
    "anime": {
        "name": "Anime / Manga",
        "prompt_suffix": "anime art style, vibrant colors, dynamic composition, studio ghibli inspired, detailed anime illustration, cel shading",
    },
    "3d_pixar": {
        "name": "3D Pixar / Disney",
        "prompt_suffix": "3D render pixar disney style, warm lighting, soft shadows, friendly character design, octane render, subsurface scattering",
    },
    "dark_tech": {
        "name": "Dark Tech / Terminal",
        "prompt_suffix": "dark moody tech aesthetic, glowing neon circuits, terminal screen in dark room, electric blue amber lighting, cyberpunk atmosphere",
    },
}


# ─── Handlers ─────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"📩 /start from user {update.effective_user.id}")
    await update.message.reply_text(
        "🚀 *Carousel Autoposter Bot*\n\n"
        "Eu crio carrosseis virais e posto no Instagram.\n\n"
        "*Como usar:*\n"
        "/novo — Criar carrossel (manda o brief)\n"
        "/status — Status das APIs\n"
        "/help — Ajuda\n\n"
        f"Handle: {HANDLE}",
        parse_mode="Markdown"
    )


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 *Fluxo do carrossel:*\n\n"
        "1. /novo → voce manda o tema/brief\n"
        "2. Eu crio os prompts e mostro pra aprovacao\n"
        "3. Voce aprova → eu gero as imagens com IA\n"
        "4. Monto os cards e mando preview\n"
        "5. Voce aprova → eu posto no Instagram\n\n"
        "*Exemplo de brief:*\n"
        "_kitchen countertop transformation for premium homes in Cape Cod_\n\n"
        "*Dicas:*\n"
        "- Briefs especificos geram conteudo melhor\n"
        "- Inclua o nicho e a regiao se possivel",
        parse_mode="Markdown"
    )


async def status_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    checks = {
        "Telegram": "✅" if TELEGRAM_TOKEN else "❌",
        "Replicate (imagens)": "✅" if REPLICATE_API_TOKEN else "❌",
        "fal.ai (fallback)": "✅" if FAL_KEY else "⚠️",
        "Perplexity (pesquisa)": "✅" if PERPLEXITY_API_KEY else "⚠️",
        "PostForMe (Instagram)": "✅" if POSTFORME_API_KEY else "❌",
        "Instagram ID": "✅" if POSTFORME_IG_ID else "❌",
    }
    text = "🔧 *Status das APIs:*\n\n"
    for name, status in checks.items():
        text += f"{status} {name}\n"
    await update.message.reply_text(text, parse_mode="Markdown")


# ─── STEP 1: Receive brief ───────────────────────────────────

async def novo_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"📩 /novo from user {update.effective_user.id}")
    await update.message.reply_text(
        "📝 *Novo Carrossel*\n\n"
        "Manda o *brief/tema* do carrossel em uma frase.\n\n"
        "Exemplo:\n"
        "_kitchen countertop transformation for premium homes in Cape Cod_",
        parse_mode="Markdown"
    )
    return BRIEF


async def brief_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """STEP 2: Receive brief, research, create prompts, show for approval."""
    brief = update.message.text
    context.user_data["brief"] = brief
    logger.info(f"📩 Brief received: {brief}")

    status_msg = await update.message.reply_text(
        "⏳ Pesquisando e criando prompts...",
    )

    # Research the topic
    researcher = ContentResearcher(
        api_key=TAVILY_API_KEY,
        perplexity_key=PERPLEXITY_API_KEY
    )
    research_data = await researcher.research(brief, "inspiracional", 5)
    context.user_data["research_data"] = research_data

    # Build prompt summary for approval
    prompts_text = ""
    for i, prompt in enumerate(research_data["image_prompts"][:5]):
        prompts_text += f"*Card {i+1}:* {prompt[:120]}\n\n"

    cards_text = ""
    for i, card in enumerate(research_data["cards"][:5]):
        cards_text += f"*{i+1}. {card.get('headline', '').split(chr(10))[0]}*\n"

    caption_preview = research_data.get("caption", "")[:200]

    await status_msg.edit_text(
        f"📋 *Prompts para: {brief}*\n\n"
        f"*Headlines:*\n{cards_text}\n"
        f"*Image Prompts:*\n{prompts_text}"
        f"*Caption preview:*\n_{caption_preview}..._\n\n"
        f"Aprovar estes prompts?",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [
                InlineKeyboardButton("✅ Aprovar e gerar imagens", callback_data="prompt_approve"),
                InlineKeyboardButton("❌ Cancelar", callback_data="prompt_cancel"),
            ],
            [
                InlineKeyboardButton("🎨 Aquarela", callback_data="style_aquarela"),
                InlineKeyboardButton("🎬 Cinematico", callback_data="style_cinematico"),
                InlineKeyboardButton("⛩️ Anime", callback_data="style_anime"),
            ],
            [
                InlineKeyboardButton("✨ 3D Pixar", callback_data="style_3d_pixar"),
                InlineKeyboardButton("💻 Dark Tech", callback_data="style_dark_tech"),
            ],
        ])
    )
    # Default style
    context.user_data["estilo"] = "cinematico"
    return APPROVE_PROMPT


# ─── STEP 3: Approve prompts, generate images ────────────────

async def prompt_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    # Handle style selection
    if query.data.startswith("style_"):
        estilo = query.data.replace("style_", "")
        context.user_data["estilo"] = estilo
        nome = ESTILOS.get(estilo, {}).get("name", estilo)
        await query.edit_message_reply_markup(
            reply_markup=InlineKeyboardMarkup([
                [
                    InlineKeyboardButton(f"✅ Gerar com {nome}", callback_data="prompt_approve"),
                    InlineKeyboardButton("❌ Cancelar", callback_data="prompt_cancel"),
                ],
                [
                    InlineKeyboardButton("🎨 Aquarela" + (" ✓" if estilo == "aquarela" else ""), callback_data="style_aquarela"),
                    InlineKeyboardButton("🎬 Cinematico" + (" ✓" if estilo == "cinematico" else ""), callback_data="style_cinematico"),
                    InlineKeyboardButton("⛩️ Anime" + (" ✓" if estilo == "anime" else ""), callback_data="style_anime"),
                ],
                [
                    InlineKeyboardButton("✨ 3D Pixar" + (" ✓" if estilo == "3d_pixar" else ""), callback_data="style_3d_pixar"),
                    InlineKeyboardButton("💻 Dark Tech" + (" ✓" if estilo == "dark_tech" else ""), callback_data="style_dark_tech"),
                ],
            ])
        )
        return APPROVE_PROMPT

    if query.data == "prompt_cancel":
        await query.edit_message_text("❌ Cancelado. Use /novo pra comecar de novo.")
        return ConversationHandler.END

    # prompt_approve — generate images
    estilo = context.user_data.get("estilo", "cinematico")
    style_suffix = ESTILOS.get(estilo, {}).get("prompt_suffix", "")
    research_data = context.user_data.get("research_data", {})
    brief = context.user_data.get("brief", "")

    await query.edit_message_text(
        f"⏳ *Gerando imagens...*\n\n"
        f"Estilo: {ESTILOS.get(estilo, {}).get('name', estilo)}\n"
        f"API: {'Replicate' if REPLICATE_API_TOKEN else 'fal.ai'}\n"
        f"Cards: {len(research_data.get('image_prompts', []))}\n\n"
        f"Isso pode levar 1-2 minutos...",
        parse_mode="Markdown"
    )

    try:
        # Generate images (Replicate primary, fal.ai fallback)
        img_gen = ImageGenerator(
            fal_key=FAL_KEY,
            replicate_token=REPLICATE_API_TOKEN
        )
        image_paths = await img_gen.generate_batch(
            research_data.get("image_prompts", []),
            style=estilo,
            style_suffix=style_suffix,
            provider="replicate"  # Replicate is primary now
        )

        # Build cards
        engine = CardEngine(handle=HANDLE)
        card_paths = await engine.generate_cards(
            cards_data=research_data.get("cards", []),
            bg_images=image_paths,
            total=len(research_data.get("cards", [])),
            cta_text="SALVA E COMPARTILHA"
        )

        # Send preview to Telegram
        media_group = []
        for i, path in enumerate(card_paths):
            with open(path, "rb") as f:
                img_bytes = f.read()
            if i == 0:
                media_group.append(InputMediaPhoto(
                    media=img_bytes,
                    caption=f"🖼️ Preview: {brief} ({len(card_paths)} cards)"
                ))
            else:
                media_group.append(InputMediaPhoto(media=img_bytes))

        await context.bot.send_media_group(
            chat_id=query.message.chat_id,
            media=media_group
        )

        # Show caption
        caption = research_data.get("caption", "")
        context.user_data["card_paths"] = card_paths
        context.user_data["caption"] = caption

        await context.bot.send_message(
            chat_id=query.message.chat_id,
            text=f"📝 *Caption:*\n\n{caption}",
            parse_mode="Markdown"
        )

        # Approval buttons
        await context.bot.send_message(
            chat_id=query.message.chat_id,
            text="*Aprovar e postar no Instagram?*",
            reply_markup=InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("✅ Postar no Instagram", callback_data="post_approve"),
                    InlineKeyboardButton("❌ Descartar", callback_data="post_discard"),
                ],
                [
                    InlineKeyboardButton("✏️ Editar caption", callback_data="post_edit_caption"),
                    InlineKeyboardButton("🔄 Regenerar imagens", callback_data="post_regen"),
                ],
            ]),
            parse_mode="Markdown"
        )
        return APPROVE_IMAGES

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        await context.bot.send_message(
            chat_id=query.message.chat_id,
            text=f"❌ Erro gerando imagens: {str(e)[:300]}\n\nUse /novo pra tentar de novo."
        )
        return ConversationHandler.END


# ─── STEP 4: Approve images, post to Instagram ───────────────

async def images_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "post_discard":
        await query.edit_message_text("❌ Descartado. Use /novo pra criar outro.")
        return ConversationHandler.END

    if query.data == "post_regen":
        await query.edit_message_text("🔄 Use /novo pra gerar com novos prompts.")
        return ConversationHandler.END

    if query.data == "post_edit_caption":
        await query.edit_message_text("✏️ Manda o novo caption como mensagem:")
        return EDIT_CAPTION

    if query.data == "post_approve":
        await query.edit_message_text("📤 *Postando no Instagram...*", parse_mode="Markdown")

        card_paths = context.user_data.get("card_paths", [])
        caption = context.user_data.get("caption", "")

        if not card_paths:
            await context.bot.send_message(
                chat_id=query.message.chat_id,
                text="❌ Nenhum card. Use /novo."
            )
            return ConversationHandler.END

        try:
            poster = PostformeClient(
                api_key=POSTFORME_API_KEY,
                ig_id=POSTFORME_IG_ID
            )
            result = await poster.post_carousel(card_paths, caption)

            if result:
                brief = context.user_data.get("brief", "N/A")
                await context.bot.send_message(
                    chat_id=query.message.chat_id,
                    text=(
                        f"✅ *CARROSSEL POSTADO!*\n\n"
                        f"📌 Brief: {brief}\n"
                        f"📊 Cards: {len(card_paths)}\n"
                        f"📱 Instagram via PostForMe\n"
                        f"👤 Handle: {HANDLE}\n\n"
                        f"🎉 Vai bombar!"
                    ),
                    parse_mode="Markdown"
                )
            else:
                await context.bot.send_message(
                    chat_id=query.message.chat_id,
                    text="❌ Falha na postagem. Verifique as credenciais do PostForMe."
                )
        except Exception as e:
            logger.error(f"Post error: {e}", exc_info=True)
            await context.bot.send_message(
                chat_id=query.message.chat_id,
                text=f"❌ Erro ao postar: {str(e)[:200]}"
            )

        return ConversationHandler.END

    return APPROVE_IMAGES


# ─── Caption edit ─────────────────────────────────────────────

async def caption_edit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["caption"] = update.message.text

    await update.message.reply_text(
        f"✅ Caption atualizado!\n\n"
        f"📝 {update.message.text[:300]}\n\n"
        f"Postar agora?",
        reply_markup=InlineKeyboardMarkup([
            [
                InlineKeyboardButton("✅ Postar no Instagram", callback_data="post_approve"),
                InlineKeyboardButton("❌ Descartar", callback_data="post_discard"),
            ]
        ]),
        parse_mode="Markdown"
    )
    return APPROVE_IMAGES


# ─── Error handler ────────────────────────────────────────────

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Exception: {context.error}", exc_info=context.error)


# ─── Main ─────────────────────────────────────────────────────

def main():
    if not TELEGRAM_TOKEN:
        print("❌ TELEGRAM_TOKEN not set!")
        return

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    # Log all updates
    app.add_handler(MessageHandler(filters.ALL, lambda u, c: logger.info(
        f"📩 msg from {u.effective_user.id if u.effective_user else '?'}: "
        f"{u.message.text if u.message else '(no text)'}"
    )), group=-1)

    # Commands
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("status", status_cmd))

    # Main flow: /novo → brief → approve prompts → approve images → post
    conv = ConversationHandler(
        entry_points=[CommandHandler("novo", novo_start)],
        states={
            BRIEF: [MessageHandler(filters.TEXT & ~filters.COMMAND, brief_received)],
            APPROVE_PROMPT: [CallbackQueryHandler(prompt_action, pattern="^(prompt_|style_)")],
            APPROVE_IMAGES: [CallbackQueryHandler(images_action, pattern="^post_")],
            EDIT_CAPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, caption_edit)],
        },
        fallbacks=[
            CommandHandler("cancel", lambda u, c: ConversationHandler.END),
            CommandHandler("novo", novo_start),
        ],
        per_message=False,
    )
    app.add_handler(conv)
    app.add_error_handler(error_handler)

    # Webhook (Railway) or Polling (local)
    if RAILWAY_PUBLIC_DOMAIN:
        webhook_url = f"https://{RAILWAY_PUBLIC_DOMAIN}/webhook"
        logger.info(f"🤖 WEBHOOK mode: {webhook_url} port={PORT}")
        app.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path="/webhook",
            webhook_url=webhook_url,
            drop_pending_updates=True,
            allowed_updates=Update.ALL_TYPES,
        )
    else:
        logger.info(f"🤖 POLLING mode")
        app.run_polling(
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
        )


if __name__ == "__main__":
    main()
