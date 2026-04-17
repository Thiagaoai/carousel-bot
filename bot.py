"""
Carousel Autoposter Bot — Telegram → Replicate/fal.ai → Postforme.dev
@thiagaoai — DockPlus AI Solutions

Flow:
1. /novo → user sends brief
2. Bot creates prompts, shows for approval
3. User approves → images generated (Replicate primary, fal.ai fallback)
4. Cards built, preview sent to Telegram
5. User approves → posted to Instagram via PostForMe
"""

import os
import json
import logging
import asyncio
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup, InputMediaPhoto
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
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
FAL_KEY = os.environ.get("FAL_KEY", "")
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
POSTFORME_API_KEY = os.environ.get("POSTFORME_API_KEY", "")
POSTFORME_IG_ID = os.environ.get("POSTFORME_IG_ID", "")
HANDLE = os.environ.get("HANDLE", "@thiagaoai")
PORT = int(os.environ.get("PORT", "8443"))
RAILWAY_PUBLIC_DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")

# Conversation states
BRIEF, APPROVE_PROMPT, APPROVE_IMAGES, EDIT_CAPTION = range(4)

ESTILOS = {
    "aquarela": {"name": "Aquarela + Tech", "prompt_suffix": "watercolor painting style, soft flowing colors, artistic brushstrokes, ethereal dreamy atmosphere"},
    "cinematico": {"name": "Cinematico", "prompt_suffix": "cinematic photography, golden hour lighting, photorealistic, dramatic composition, 8k detailed"},
    "anime": {"name": "Anime", "prompt_suffix": "anime art style, vibrant colors, dynamic composition, studio ghibli inspired"},
    "3d_pixar": {"name": "3D Pixar", "prompt_suffix": "3D render pixar disney style, warm lighting, soft shadows, octane render"},
    "dark_tech": {"name": "Dark Tech", "prompt_suffix": "dark moody tech aesthetic, glowing neon circuits, cyberpunk atmosphere"},
}

# ─── post_init: register webhook with Telegram ───────────────
async def post_init(application: Application) -> None:
    if RAILWAY_PUBLIC_DOMAIN:
        webhook_url = f"https://{RAILWAY_PUBLIC_DOMAIN}"
        logger.info(f"📡 Registering webhook: {webhook_url}")
        await application.bot.set_webhook(
            url=webhook_url,
            allowed_updates=Update.ALL_TYPES,
            drop_pending_updates=True,
        )
        info = await application.bot.get_webhook_info()
        logger.info(f"📡 Webhook registered: url={info.url} pending={info.pending_update_count}")


# ─── Handlers ─────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"✅ /start from {update.effective_user.id} ({update.effective_user.first_name})")
    await update.message.reply_text(
        f"🚀 *Carousel Autoposter Bot*\n\n"
        f"/novo — Criar carrossel\n"
        f"/status — Status das APIs\n"
        f"/help — Ajuda\n\n"
        f"Handle: {HANDLE}",
        parse_mode="Markdown"
    )

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📖 *Fluxo:*\n"
        "1. /novo → manda o brief\n"
        "2. Aprova prompts\n"
        "3. Imagens geradas com IA\n"
        "4. Preview no Telegram\n"
        "5. Aprova → posta no Instagram",
        parse_mode="Markdown"
    )

async def status_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    checks = {
        "Replicate": "✅" if REPLICATE_API_TOKEN else "❌",
        "fal.ai": "✅" if FAL_KEY else "⚠️",
        "Perplexity": "✅" if PERPLEXITY_API_KEY else "⚠️",
        "PostForMe": "✅" if POSTFORME_API_KEY else "❌",
        "IG ID": "✅" if POSTFORME_IG_ID else "❌",
    }
    text = "🔧 *APIs:*\n" + "\n".join(f"{v} {k}" for k, v in checks.items())
    await update.message.reply_text(text, parse_mode="Markdown")


# ─── STEP 1: /novo → receive brief ───────────────────────────

async def novo_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"✅ /novo from {update.effective_user.id}")
    await update.message.reply_text(
        "📝 *Novo Carrossel*\n\nManda o brief em uma frase.\n\n"
        "Ex: _kitchen countertop transformation for premium homes in Cape Cod_",
        parse_mode="Markdown"
    )
    return BRIEF

async def brief_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    brief = update.message.text
    context.user_data["brief"] = brief
    logger.info(f"📩 Brief: {brief}")

    msg = await update.message.reply_text("⏳ Pesquisando e criando prompts...")

    researcher = ContentResearcher(api_key=TAVILY_API_KEY, perplexity_key=PERPLEXITY_API_KEY)
    research_data = await researcher.research(brief, "inspiracional", 5)
    context.user_data["research_data"] = research_data
    context.user_data["estilo"] = "cinematico"

    cards_text = "\n".join(f"• {c.get('headline', '').split(chr(10))[0]}" for c in research_data.get("cards", [])[:5])
    caption_preview = research_data.get("caption", "")[:150]

    await msg.edit_text(
        f"📋 *Prompts: {brief}*\n\n{cards_text}\n\n_{caption_preview}..._\n\nAprovar?",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("✅ Gerar imagens", callback_data="prompt_approve"),
             InlineKeyboardButton("❌ Cancelar", callback_data="prompt_cancel")],
            [InlineKeyboardButton("🎬 Cinematico", callback_data="style_cinematico"),
             InlineKeyboardButton("🎨 Aquarela", callback_data="style_aquarela"),
             InlineKeyboardButton("💻 Dark", callback_data="style_dark_tech")],
        ])
    )
    return APPROVE_PROMPT


# ─── STEP 2: approve prompts → generate images ───────────────

async def prompt_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data.startswith("style_"):
        context.user_data["estilo"] = query.data.replace("style_", "")
        await query.answer(f"Estilo: {context.user_data['estilo']}")
        return APPROVE_PROMPT

    if query.data == "prompt_cancel":
        await query.edit_message_text("❌ Cancelado.")
        return ConversationHandler.END

    # Generate images
    estilo = context.user_data.get("estilo", "cinematico")
    research = context.user_data.get("research_data", {})

    await query.edit_message_text(f"⏳ Gerando imagens ({ESTILOS[estilo]['name']})... 1-2 min")

    try:
        img_gen = ImageGenerator(fal_key=FAL_KEY, replicate_token=REPLICATE_API_TOKEN)
        image_paths = await img_gen.generate_batch(
            research.get("image_prompts", []),
            style=estilo,
            style_suffix=ESTILOS[estilo]["prompt_suffix"],
            provider="replicate"
        )

        engine = CardEngine(handle=HANDLE)
        card_paths = await engine.generate_cards(
            cards_data=research.get("cards", []),
            bg_images=image_paths,
            total=len(research.get("cards", [])),
            cta_text="SALVA E COMPARTILHA"
        )

        media = []
        for i, path in enumerate(card_paths):
            with open(path, "rb") as f:
                data = f.read()
            cap = f"🖼️ Preview ({len(card_paths)} cards)" if i == 0 else None
            media.append(InputMediaPhoto(media=data, caption=cap))

        await context.bot.send_media_group(chat_id=query.message.chat_id, media=media)

        caption = research.get("caption", "")
        context.user_data["card_paths"] = card_paths
        context.user_data["caption"] = caption

        await context.bot.send_message(chat_id=query.message.chat_id,
            text=f"📝 *Caption:*\n\n{caption}", parse_mode="Markdown")

        await context.bot.send_message(chat_id=query.message.chat_id,
            text="Postar no Instagram?", reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("✅ Postar", callback_data="post_approve"),
                 InlineKeyboardButton("❌ Descartar", callback_data="post_discard")],
                [InlineKeyboardButton("✏️ Editar caption", callback_data="post_edit")]
            ]))
        return APPROVE_IMAGES

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        await context.bot.send_message(chat_id=query.message.chat_id,
            text=f"❌ Erro: {str(e)[:300]}\n\n/novo pra tentar de novo")
        return ConversationHandler.END


# ─── STEP 3: approve images → post to Instagram ──────────────

async def images_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "post_discard":
        await query.edit_message_text("❌ Descartado.")
        return ConversationHandler.END

    if query.data == "post_edit":
        await query.edit_message_text("✏️ Manda o novo caption:")
        return EDIT_CAPTION

    if query.data == "post_approve":
        await query.edit_message_text("📤 Postando no Instagram...")
        try:
            poster = PostformeClient(api_key=POSTFORME_API_KEY, ig_id=POSTFORME_IG_ID)
            result = await poster.post_carousel(
                context.user_data.get("card_paths", []),
                context.user_data.get("caption", "")
            )
            if result:
                await context.bot.send_message(chat_id=query.message.chat_id,
                    text=f"✅ *POSTADO!* 🎉\n{context.user_data.get('brief', '')}", parse_mode="Markdown")
            else:
                await context.bot.send_message(chat_id=query.message.chat_id, text="❌ Falha no PostForMe")
        except Exception as e:
            logger.error(f"Post error: {e}", exc_info=True)
            await context.bot.send_message(chat_id=query.message.chat_id, text=f"❌ {str(e)[:200]}")
        return ConversationHandler.END

    return APPROVE_IMAGES

async def caption_edit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["caption"] = update.message.text
    await update.message.reply_text("✅ Caption atualizado. Postar?", reply_markup=InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ Postar", callback_data="post_approve"),
         InlineKeyboardButton("❌ Descartar", callback_data="post_discard")]
    ]))
    return APPROVE_IMAGES


# ─── Error handler ────────────────────────────────────────────

async def error_handler(update, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Error: {context.error}", exc_info=context.error)


# ─── Main ─────────────────────────────────────────────────────

def main():
    if not TELEGRAM_TOKEN:
        print("❌ TELEGRAM_TOKEN not set")
        return

    app = (
        Application.builder()
        .token(TELEGRAM_TOKEN)
        .post_init(post_init)
        .build()
    )

    # Log every update
    app.add_handler(MessageHandler(filters.ALL, lambda u, c: logger.info(
        f"📩 UPDATE: {u.effective_user.id if u.effective_user else '?'} → "
        f"{u.message.text if u.message else 'callback'}"
    )), group=-1)

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("status", status_cmd))

    conv = ConversationHandler(
        entry_points=[CommandHandler("novo", novo_start)],
        states={
            BRIEF: [MessageHandler(filters.TEXT & ~filters.COMMAND, brief_received)],
            APPROVE_PROMPT: [CallbackQueryHandler(prompt_action, pattern="^(prompt_|style_)")],
            APPROVE_IMAGES: [CallbackQueryHandler(images_action, pattern="^post_")],
            EDIT_CAPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, caption_edit)],
        },
        fallbacks=[CommandHandler("cancel", lambda u, c: ConversationHandler.END)],
        per_message=False,
    )
    app.add_handler(conv)
    app.add_error_handler(error_handler)

    if RAILWAY_PUBLIC_DOMAIN:
        # WEBHOOK mode — post_init registers the webhook with Telegram
        logger.info(f"🤖 WEBHOOK on https://{RAILWAY_PUBLIC_DOMAIN} port={PORT}")
        app.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            webhook_url=f"https://{RAILWAY_PUBLIC_DOMAIN}",
        )
    else:
        logger.info("🤖 POLLING mode")
        app.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)


if __name__ == "__main__":
    main()
