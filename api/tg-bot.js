/**
 * api/tg-bot.js — Vercel serverless webhook для @annastar_art_bot
 * Обрабатывает входящие обновления от Telegram
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('AnnaStar bot webhook');
  }

  const update = req.body;

  try {
    // Новый участник в группе
    if (update.message?.new_chat_members?.length) {
      await handleNewMembers(update.message);
    }
  } catch (err) {
    console.error('Bot error:', err);
  }

  // Telegram ждёт 200 OK
  return res.status(200).json({ ok: true });
}

async function handleNewMembers(message) {
  const chatId = message.chat.id;
  const members = message.new_chat_members.filter(m => !m.is_bot);

  for (const member of members) {
    const name = member.first_name || 'Гость';

    const text = [
      `✨ Добро пожаловать, ${escHtml(name)}!`,
      '',
      'Здесь вы найдёте авторские картины AnnaStar — живопись с кристаллами, смолой и золотом.',
      '',
      'Откройте каталог, чтобы увидеть работы и оформить заявку прямо в Telegram.',
    ].join('\n');

    await sendMessage(chatId, text, {
      inline_keyboard: [[
        {
          text: '🎨 Открыть каталог',
          url: 'https://t.me/annastar_art_bot/catalog',
        },
        {
          text: '🌐 Сайт',
          url: 'https://annastar.art',
        },
      ]],
    });
  }
}

async function sendMessage(chatId, text, keyboard) {
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    }),
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
