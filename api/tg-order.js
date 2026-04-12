/**
 * api/tg-order.js — Vercel serverless function
 * Принимает заявку из TMA и отправляет уведомление в Telegram
 */

export default async function handler(req, res) {
  // CORS — разрешаем только с нашего домена
  res.setHeader('Access-Control-Allow-Origin', 'https://annastar.art');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, comment, work_title, work_id } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const lines = [
    '🎨 <b>Новая заявка с сайта AnnaStar</b>',
    '',
    `👤 <b>Имя:</b> ${escHtml(name)}`,
    `📱 <b>Телефон:</b> ${escHtml(phone)}`,
  ];

  if (work_title) lines.push(`🖼 <b>Работа:</b> ${escHtml(work_title)}`);
  if (comment)    lines.push(`💬 <b>Комментарий:</b> ${escHtml(comment)}`);

  const text = lines.join('\n');

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
      }
    );

    if (!tgRes.ok) {
      const err = await tgRes.text();
      console.error('Telegram API error:', err);
      return res.status(502).json({ error: 'Telegram error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('fetch failed:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
