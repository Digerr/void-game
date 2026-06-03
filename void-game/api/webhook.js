import { createClient } from '@supabase/supabase-js';

const GAME_URL = 'https://void-game-ruddy.vercel.app/';
const CHANNEL_ID = '@void_game_official';
const SUPPORT_CHANNEL_ID = process.env.SUPPORT_CHANNEL_ID || '-1003857849729'; // VOID - SUPPORT (private)
const VERSION = '0.19.0';

// Reply Keyboard — постоянное меню кнопок
const REPLY_KEYBOARD = {
  keyboard: [
    [{ text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }],
    [{ text: '📊 Статистика' }, { text: '🏆 Рейтинг' }],
    [{ text: '📅 Неделя' }, { text: '🐛 Баг' }],
    [{ text: '❓ Помощь' }]
  ],
  resize_keyboard: true,
  one_time_keyboard: false
};

// Bot commands for / menu
const BOT_COMMANDS = [
  { command: 'start', description: 'Начать игру' },
  { command: 'play', description: 'Открыть VOID' },
  { command: 'help', description: 'Управление и советы' },
  { command: 'stats', description: 'Моя статистика' },
  { command: 'leaderboard', description: 'Мировой рейтинг' },
  { command: 'weekly', description: 'Рейтинг недели' },
  { command: 'news', description: 'Обновления игры' },
  { command: 'bug', description: 'Сообщить о баге' }
];

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jibtmyuxbeckanmkhuik.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnRteXV4YmVja2FubWtodWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMyMDQxMCwiZXhwIjoyMDk1ODk2NDEwfQ.BS61LXJPTKvE4KsZmKu0e7pPkR8VnMBXxRIJqUMX8VM';

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Get current week key
function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek) + start.getDay() / 7);
  return now.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

// Format time (seconds → m:ss or just seconds)
function fmtTime(sec) {
  if (!sec || sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
  return `${s}с`;
}

// Format days since date
function daysSince(dateStr) {
  if (!dateStr) return '?';
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / 86400000);
}

// Medal emoji by rank
function medal(r) {
  if (r === 1) return '🥇';
  if (r === 2) return '🥈';
  if (r === 3) return '🥉';
  return `${r}. `;
}

// HTML-escape user-provided text
function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Send a Telegram message with HTML parse mode
async function sendMsg(token, chatId, text, extra = {}) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML', ...extra };
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Set bot commands menu (for / autocomplete)
async function setBotCommands(token) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands: BOT_COMMANDS })
    });
  } catch (e) {
    console.error('[VOID] setMyCommands error:', e);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok' });
  }

  const update = req.body;

  // ── Inline query: @voide_game_bot in any chat ──
  if (update.inline_query) {
    const iq = update.inline_query;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw';
    const iqUserId = iq.from?.id;
    const iqUserName = esc(iq.from?.first_name || iq.from?.username || 'Игрок');

    // Try to fetch user's stats from Supabase for personalized results
    let playerStats = null;
    let playerRank = -1;
    if (iqUserId) {
      try {
        const sb = getSupabase();
        const playerId = 'tg_' + iqUserId;
        const { data: lbData } = await sb.from('leaderboard').select('*').eq('id', playerId).single();
        if (lbData) {
          const { count } = await sb.from('leaderboard').select('*', { count: 'exact', head: true }).gt('score', lbData.score);
          playerRank = (count || 0) + 1;
          playerStats = lbData;
        }
      } catch (e) {
        console.error('[VOID] inline stats error:', e);
      }
    }

    const results = [];

    // Result 1: 🎮 Game — works in ALL chats (including private 1-on-1)
    // NOTE: game type ONLY supports type, id, game_short_name — no extra fields!
    results.push({
      type: 'game',
      id: 'void_game',
      game_short_name: 'void'
    });

    // Result 2: 📊 Моя статистика (personalized or generic)
    if (playerStats) {
      results.push({
        type: 'article',
        id: 'void_stats',
        title: `📊 ${iqUserName} — #${playerRank} в мире`,
        description: `Уровни: ${playerStats.completed}/60 · ⭐${playerStats.total_stars} · Очки: ${playerStats.score}`,
        input_message_content: {
          message_text:
            `📊 <b>Статистика ${iqUserName}</b> в VOID\n\n` +
            `🏆 Ранг: <b>#${playerRank}</b>\n` +
            `📊 Уровни: ${playerStats.completed}/60\n` +
            `⭐ Звёзды: ${playerStats.total_stars}/180\n` +
            `💎 Осколки: ${playerStats.total_shards || 0}\n` +
            `✨ Идеальные: ${playerStats.perfect_levels || 0}\n` +
            `🏅 Ачивки: ${playerStats.achievements_count || 0}\n` +
            `⏳ Время: ${fmtTime(playerStats.total_time)}\n` +
            `🔢 Очки: <b>${playerStats.score}</b>`,
          parse_mode: 'HTML'
        },
        reply_markup: {
          inline_keyboard: [[
            { text: '▶ ИГРАТЬ', url: GAME_URL }
          ]]
        }
      });

      // Result 3: ⚔️ Вызов! (challenge others)
      results.push({
        type: 'article',
        id: 'void_challenge',
        title: '⚔️ Бросить вызов!',
        description: `Мой результат: #${playerRank} с ${playerStats.score} очками. Побьёшь?`,
        input_message_content: {
          message_text:
            `⚔️ <b>Вызов в VOID!</b>\n\n` +
            `${iqUserName} бросает вызов!\n\n` +
            `🏆 Ранг: <b>#${playerRank}</b>\n` +
            `📊 Уровни: ${playerStats.completed}/60\n` +
            `⭐ Звёзды: ${playerStats.total_stars}/180\n` +
            `🔢 Очки: <b>${playerStats.score}</b>\n\n` +
            `Сможешь побить? 👇`,
          parse_mode: 'HTML'
        },
        reply_markup: {
          inline_keyboard: [[
            { text: '⚔️ Принять вызов!', url: GAME_URL }
          ]]
        }
      });
    } else {
      // No stats yet — show generic stats option
      results.push({
        type: 'article',
        id: 'void_stats',
        title: '📊 Моя статистика VOID',
        description: 'Ты ещё не играл. Начни и попади в рейтинг!',
        input_message_content: {
          message_text: '🌑 <b>VOID — во тьму</b>\n\nТы ещё не играл в VOID!\nПройди уровни и попади в мировой рейтинг 🏆',
          parse_mode: 'HTML'
        },
        reply_markup: {
          inline_keyboard: [[
            { text: '▶ ИГРАТЬ', url: GAME_URL }
          ]]
        }
      });
    }

    // Result 4: 🏆 Топ-10
    results.push({
      type: 'article',
      id: 'void_top',
      title: '🏆 Мировой рейтинг',
      description: 'Топ-10 лучших игроков VOID',
      input_message_content: {
        message_text: '🏆 <b>Мировой рейтинг VOID</b>\n\nСмотри кто лучший → /leaderboard в @voide_game_bot',
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [[
          { text: '▶ ИГРАТЬ', url: GAME_URL }
        ]]
      }
    });

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerInlineQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inline_query_id: iq.id,
        results,
        cache_time: 15
      })
    });
    return res.status(200).json({ ok: true });
  }

  // ── Callback query: game "Play" button pressed ──
  if (update.callback_query) {
    const cb = update.callback_query;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw';

    if (cb.game_short_name === 'void') {
      // Answer with game URL — Telegram opens it as a game
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: cb.id,
          url: GAME_URL
        })
      });
    } else {
      // Generic callback acknowledgment
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: cb.id
        })
      });
    }
    return res.status(200).json({ ok: true });
  }

  // Handle my_chat_member updates (bot added/removed from chats)
  if (update.my_chat_member) {
    const chat = update.my_chat_member.chat;
    const newStatus = update.my_chat_member.new_chat_member?.status;
    const oldStatus = update.my_chat_member.old_chat_member?.status;
    console.log('[VOID] my_chat_member:', chat.id, chat.title, chat.type, oldStatus, '→', newStatus);

    // Bot was added to a group/channel — send welcome with ИГРАТЬ button
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw';
    if (newStatus === 'administrator' || newStatus === 'member') {
      if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
        await sendMsg(BOT_TOKEN, chat.id,
          '🌑 <b>VOID — во тьму</b>\n\nПлатформер о памяти, которое забыло себя.\n60 уровней · 12 актов · магнитный шарф · паркур\n\nНажми кнопку ниже чтобы начать →',
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '▶ ИГРАТЬ', url: GAME_URL }
              ]]
            }
          }
        );
      }
    }
    return res.status(200).json({ ok: true });
  }

  if (!update || (!update.message && !update.channel_post)) {
    return res.status(200).json({ ok: true });
  }

  // In channels, messages come as channel_post instead of message
  const msg = update.message || update.channel_post;
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const rawText = (msg.text || '').trim();

  // Map keyboard button labels to commands
  const BTN_MAP = {
    '📊 Статистика': '/stats',
    '🏆 Рейтинг': '/leaderboard',
    '📅 Неделя': '/weekly',
    '🐛 Баг': '/bug',
    '❓ Помощь': '/help'
  };

  // Strip @botname suffix from commands in groups (e.g. /start@voide_game_bot → /start)
  const strippedText = rawText.replace(/@(voide_game_bot)\b/gi, '');
  const text = BTN_MAP[strippedText] || strippedText;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw';

  const isGroupChat = msg.chat?.type === 'group' || msg.chat?.type === 'supergroup' || msg.chat?.type === 'channel';

  // ── /start and /play ──
  if (text === '/start' || text === '/play' || text.startsWith('/start ') || text.startsWith('/play ')) {
    // Register bot commands on first /start
    await setBotCommands(BOT_TOKEN);

    // In groups/channels: use URL button (web_app only works in private chats)
    if (isGroupChat) {
      await sendMsg(BOT_TOKEN, chatId,
        `🌑 <b>VOID — во тьму</b>\n\nПлатформер о памяти, которое забыло себя. 60 уровней, 12 актов, магнитный шарф, паркур.\n\nНажми ▶ ИГРАТЬ чтобы начать →`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '▶ ИГРАТЬ', url: GAME_URL }
            ]]
          }
        }
      );
    } else {
      await sendMsg(BOT_TOKEN, chatId,
        `🌑 <b>VOID — во тьму</b>\n\nПлатформер о памяти, которое забыло себя. 60 уровней, 12 актов, магнитный шарф, паркур.\n\nv${VERSION}\n\nНажми ▶ ИГРАТЬ чтобы начать →`,
        {
          reply_markup: REPLY_KEYBOARD
        }
      );
    }
    return res.status(200).json({ ok: true });
  }

  // ── Keyboard button: ▶ ИГРАТЬ (when text arrives, offer inline button) ──
  if (rawText === '▶ ИГРАТЬ') {
    await sendMsg(BOT_TOKEN, chatId,
      `🌑 <b>VOID — во тьму</b>\n\nНажми кнопку ▶ ИГРАТЬ ниже чтобы запустить игру!`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
          ]]
        }
      }
    );
    return res.status(200).json({ ok: true });
  }

  // ── /help ──
  if (text === '/help') {
    await sendMsg(BOT_TOKEN, chatId,
      '🎮 <b>Управление VOID</b>\n\n' +
      '◀▶ — движение\n' +
      '⬆ — прыжок\n' +
      '⚡ — рывок (dash)\n' +
      '✋ — взаимодействие\n' +
      '↗ — магнитный шарф\n\n' +
      '💡 Приседай на краю для coyote jump\n' +
      '💡 Упор в стену = медленное скольжение\n\n' +
      '📊 /stats — моя статистика\n' +
      '🏆 /leaderboard — мировой рейтинг\n' +
      '📅 /weekly — рейтинг недели\n' +
      '📰 /news — обновления\n' +
      '🐛 /bug — сообщить о баге'
    );
    return res.status(200).json({ ok: true });
  }

  // ── /stats — личная статистика ──
  if (text === '/stats') {
    if (!userId) {
      await sendMsg(BOT_TOKEN, chatId, '❌ Не удалось определить твой аккаунт.');
      return res.status(200).json({ ok: true });
    }

    const sb = getSupabase();
    const playerId = 'tg_' + userId;

    const { data: playerData } = await sb.from('players').select('*').eq('id', playerId).single();
    const { data: lbData } = await sb.from('leaderboard').select('*').eq('id', playerId).single();

    if (!lbData) {
      await sendMsg(BOT_TOKEN, chatId,
        '🌑 <b>Твоя статистика</b>\n\nТы ещё не играл в VOID или не прошёл ни одного уровня.\n\nНажми кнопку чтобы начать →',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
            ]]
          }
        }
      );
      return res.status(200).json({ ok: true });
    }

    // Get global rank
    const { count } = await sb.from('leaderboard').select('*', { count: 'exact', head: true }).gt('score', lbData.score);
    const rank = (count || 0) + 1;

    // Get weekly rank
    const weekKey = getWeekKey();
    let weeklyRank = -1;
    try {
      const { data: myWeekly } = await sb.from('weekly_scores').select('score').eq('id', playerId + '_' + weekKey).single();
      if (myWeekly) {
        const { count: weeklyAbove } = await sb.from('weekly_scores')
          .select('*', { count: 'exact', head: true })
          .eq('week_key', weekKey)
          .gt('score', myWeekly.score);
        weeklyRank = (weeklyAbove || 0) + 1;
      }
    } catch (e) {}

    const days = daysSince(playerData?.created);
    const bestRank = playerData?.best_rank || rank;
    const name = esc(lbData.name);

    const statsText =
      `🌑 <b>Статистика ${name}</b>\n\n` +
      `🏆 Ранг: <b>#${rank}</b> ${rank === bestRank ? '⭐ лучший' : '(лучший #'+bestRank+')'}\n` +
      `📅 Недельный ранг: ${weeklyRank > 0 ? '#'+weeklyRank : 'нет'}\n` +
      `⏱ Дней в пустоте: <b>${days}</b>\n\n` +
      `📊 <b>Прогресс:</b>\n` +
      `• Уровни: ${lbData.completed}/60\n` +
      `• ⭐ Звёзды: ${lbData.total_stars}/180\n` +
      `• 💎 Осколки: ${lbData.total_shards || 0}\n` +
      `• ✨ Идеальные (3★): ${lbData.perfect_levels || 0}\n` +
      `• 🏅 Достижения: ${lbData.achievements_count || 0}\n` +
      `• ⚔️ Испытания: ${lbData.challenge_wins || 0}\n` +
      `• ⏳ Общее время: ${fmtTime(lbData.total_time)}\n\n` +
      `🔢 Очки: <b>${lbData.score}</b>`;

    await sendMsg(BOT_TOKEN, chatId, statsText, {
      reply_markup: {
        inline_keyboard: [[
          { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
        ]]
      }
    });
    return res.status(200).json({ ok: true });
  }

  // ── /leaderboard — глобальный топ-10 ──
  if (text === '/leaderboard' || text === '/top') {
    const sb = getSupabase();

    const { data, error } = await sb
      .from('leaderboard')
      .select('name, score, completed, total_stars')
      .order('score', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      await sendMsg(BOT_TOKEN, chatId, '🏆 <b>Мировой рейтинг</b>\n\nПока нет ни одного игрока. Стань первым!');
      return res.status(200).json({ ok: true });
    }

    let lbText = '🏆 <b>Мировой рейтинг VOID</b>\n\n';
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const name = esc(p.name || '???');
      lbText += `${medal(i + 1)} ${name} — <b>${p.score}</b> (${p.completed} ур., ⭐${p.total_stars})\n`;
    }

    // If requesting user is outside top-10, show their rank
    if (userId) {
      const playerId = 'tg_' + userId;
      const { data: myData } = await sb.from('leaderboard').select('score').eq('id', playerId).single();
      if (myData) {
        const { count: myAbove } = await sb.from('leaderboard').select('*', { count: 'exact', head: true }).gt('score', myData.score);
        const myRank = (myAbove || 0) + 1;
        if (myRank > 10) {
          lbText += `\n. . .\n${medal(myRank)} <b>Ты</b> — <b>${myData.score}</b>`;
        }
      }
    }

    lbText += '\n\n📅 /weekly — рейтинг недели\n🎮 /stats — моя статистика';

    await sendMsg(BOT_TOKEN, chatId, lbText);
    return res.status(200).json({ ok: true });
  }

  // ── /weekly — недельный топ-10 ──
  if (text === '/weekly') {
    const sb = getSupabase();
    const weekKey = getWeekKey();

    const { data, error } = await sb
      .from('weekly_scores')
      .select('name, score, completed, total_stars')
      .eq('week_key', weekKey)
      .order('score', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      await sendMsg(BOT_TOKEN, chatId,
        '📅 <b>Рейтинг недели</b>\n\nНа этой неделе пока нет результатов. Играй и попадай в топ!',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
            ]]
          }
        }
      );
      return res.status(200).json({ ok: true });
    }

    // Time until next Monday 00:00 UTC
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + (8 - nextMonday.getUTCDay()) % 7);
    nextMonday.setUTCHours(0, 0, 0, 0);
    if (nextMonday <= now) nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    const diffMs = nextMonday - now;
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);

    let wText = `📅 <b>Рейтинг недели ${esc(weekKey)}</b>\n\n`;
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      const name = esc(p.name || '???');
      const reward = i < 3 ? ' 🎨' : (i < 10 ? ' 🏷' : '');
      wText += `${medal(i + 1)} ${name} — <b>${p.score}</b>${reward}\n`;
    }

    wText += `\n⏳ До сброса: ${diffDays}д ${diffHrs}ч\n`;
    wText += '🎨 Топ-3: эксклюзивный скин\n';
    wText += '🏷 Топ-10: уникальный бейдж';

    await sendMsg(BOT_TOKEN, chatId, wText, {
      reply_markup: {
        inline_keyboard: [[
          { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
        ]]
      }
    });
    return res.status(200).json({ ok: true });
  }

  // ── /bug — сообщить о баге ──
  if (text === '/bug') {
    await sendMsg(BOT_TOKEN, chatId,
      '🐛 <b>Сообщить о проблеме</b>\n\n' +
      'Напиши описание бага или проблемы прямо сюда — я передам разработчику.\n\n' +
      'Что указать:\n' +
      '• Что случилось\n' +
      '• На каком уровне\n' +
      '• Что ожидал vs что произошло\n\n' +
      'Просто напиши текст — и я его отправлю!'
    );
    return res.status(200).json({ ok: true });
  }

  // ── /news — обновления игры ──
  if (text === '/news') {
    const newsText =
      `📰 <b>Обновления VOID</b>\n\n` +
      `🔶 <b>v${VERSION}</b> — текущая\n` +
      '• 6 новых погодных эффектов (акты 7-12)\n' +
      '• 16 новых достижений (46 всего)\n' +
      '• Расширенная статистика победы\n' +
      '• Прогресс актов в профиле\n' +
      '• Рекорд смертей и попыток на уровень\n' +
      '• Пригласить друга\n' +
      '• Фиксы 4 багов в уровнях\n\n' +
      '🔹 <b>v0.13.0-beta</b>\n' +
      '• Фикс физики шарфа (маятник)\n' +
      '• Настройка параметров swing/constraint\n\n' +
      '🔸 <b>v0.12.0-beta</b>\n' +
      '• Облачные сохранения (TG CloudStorage)\n' +
      '• Система достижений\n' +
      '• Испытания (Challenges)\n' +
      '• Осколки (Shards)\n\n' +
      '⬇️ <b>Более ранние версии</b>\n' +
      '• 60 уровней, 12 актов\n' +
      '• Скины, лор, катсцены\n' +
      '• Фонарик, шарф, dash, wall-jump';

    await sendMsg(BOT_TOKEN, chatId, newsText, {
      reply_markup: {
        inline_keyboard: [[
          { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
        ]]
      }
    });
    return res.status(200).json({ ok: true });
  }

  // ── Unknown command ──
  if (text.startsWith('/')) {
    await sendMsg(BOT_TOKEN, chatId,
      '❓ Неизвестная команда. Доступные:\n\n' +
      '/start — начать игру\n' +
      '/help — управление\n' +
      '/stats — моя статистика\n' +
      '/leaderboard — мировой рейтинг\n' +
      '/weekly — рейтинг недели\n' +
      '/news — обновления\n' +
      '/bug — сообщить о баге'
    );
    return res.status(200).json({ ok: true });
  }

  // ── Free-text message → bug report / feedback ──
  if (text && chatId === userId) {
    // Only in private chat — forward to channel as bug report
    const userName = msg.from?.username ? '@' + msg.from.username : esc(msg.from?.first_name || 'Аноним');
    const reportText =
      `🐛 <b>Баг-репорт</b>\n` +
      `👤 ${userName}\n` +
      `💬 ${esc(text)}`;

    await sendMsg(BOT_TOKEN, SUPPORT_CHANNEL_ID, reportText);

    await sendMsg(BOT_TOKEN, chatId,
      '✅ Спасибо! Передал разработчику. Если нужно дополнить — просто напиши ещё.',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '▶ ИГРАТЬ', web_app: { url: GAME_URL } }
          ]]
        }
      }
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
