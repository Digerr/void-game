const GAME_URL = 'https://void-game-ruddy.vercel.app/v2.5.0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok' });
  }

  const update = req.body;
  
  if (!update || !update.message) {
    return res.status(200).json({ ok: true });
  }

  const msg = update.message;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw';

  // Handle /start and /play commands
  if (text === '/start' || text === '/play' || text.startsWith('/start ') || text.startsWith('/play ')) {
    const reply = {
      chat_id: chatId,
      text: '🌑 *VOID — Исследуй Пустоту*\n\nМрачный платформер во тьме. 20 уровней, нить-верёвка, лидерборд.\n\nНажми кнопку ниже чтобы начать →',
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: '▶ ИГРАТЬ',
            web_app: { url: GAME_URL }
          }
        ]]
      }
    };

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reply)
    });

    return res.status(200).json({ ok: true });
  }

  // Handle /help
  if (text === '/help') {
    const helpText = {
      chat_id: chatId,
      text: '🎮 *Управление VOID*\n\n◀▶ — движение\n⬆ — прыжок\n⚡ — рывок (dash)\n✋ — взаимодействие\n↗ — нить (на уровнях с якорями)\n\n💡 Приседай на краю для coyote jump\n💡 Упор в стену = медленное скольжение',
      parse_mode: 'Markdown'
    };

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(helpText)
    });

    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
