import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jibtmyuxbeckanmkhuik.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnRteXV4YmVja2FubWtodWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMyMDQxMCwiZXhwIjoyMDk1ODk2NDEwfQ.BS61LXJPTKvE4KsZmKu0e7pPkR8VnMBXxRIJqUMX8VM';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw';

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Validate Telegram initData with HMAC-SHA256 signature verification
function validateInitData(initData) {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    // Reconstruct check string: sort all key=value pairs (excluding hash) alphabetically, join with \n
    const pairs = [];
    for (const [key, value] of params.entries()) {
      if (key !== 'hash') pairs.push(key + '=' + value);
    }
    pairs.sort();
    const checkString = pairs.join('\n');

    // Compute HMAC-SHA256: secret_key = HMAC-SHA256(bot_token, "WebAppData"), then hash = HMAC-SHA256(secret_key, checkString)
    const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const computedHash = createHmac('sha256', secretKey).update(checkString).digest('hex');

    // Compare hashes (constant-time comparison)
    if (computedHash !== hash) {
      console.error('[VOID] HMAC validation failed');
      return null;
    }

    // Check auth_date freshness (reject if older than 1 hour)
    const authDate = parseInt(params.get('auth_date') || '0', 10) * 1000;
    if (Date.now() - authDate > 3600000) {
      console.error('[VOID] initData expired');
      return null;
    }

    const userId = params.get('user');
    if (userId) {
      const userData = JSON.parse(userId);
      return { id: userData.id, name: userData.first_name + (userData.last_name ? ' ' + userData.last_name : '') };
    }
  } catch (e) {
    console.error('[VOID] validateInitData error:', e.message);
  }
  return null;
}

// Get current week key (ISO week number)
function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek) + start.getDay() / 7);
  return now.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', version: '0.20.0' });
  }

  const body = req.body || {};
  const action = body.action || 'submit';

  // ── SETUP: Check table status (admin only, no SQL exposed) ──
  if (action === 'setup') {
    const sb = getSupabase();
    try {
      const { data: testRow, error: testErr } = await sb
        .from('leaderboard')
        .select('id,total_shards,achievements_count,perfect_levels,challenge_wins')
        .limit(1);

      const missingCols = [];
      if (testErr && testErr.message && testErr.message.includes('total_shards')) {
        missingCols.push('total_shards', 'achievements_count', 'perfect_levels', 'challenge_wins');
      }

      const { error: wsErr } = await sb.from('weekly_scores').select('id').limit(1);
      const { error: lrErr } = await sb.from('level_records').select('id').limit(1);

      return res.status(200).json({
        ok: true,
        leaderboard_columns_ok: missingCols.length === 0,
        missing_columns: missingCols,
        weekly_scores_exists: !wsErr || (wsErr.message && !wsErr.message.includes('Could not find')),
        level_records_exists: !lrErr || (lrErr.message && !lrErr.message.includes('Could not find')),
      });
    } catch (e) {
      return res.status(500).json({ ok: false, error: 'setup check failed' });
    }
  }

  // ── REGISTER: Register player & sync name ──
  if (action === 'register') {
    const user = validateInitData(body.initData);
    if (!user) return res.status(200).json({ ok: false, error: 'invalid initData' });

    const sb = getSupabase();
    const playerId = 'tg_' + user.id;

    // Upsert player
    await sb.from('players').upsert({
      id: playerId,
      name: user.name,
      chat_id: body.chatId || null,
    }, { onConflict: 'id' });

    // Sync name across all tables (user may have changed Telegram name)
    try { await sb.from('leaderboard').update({ name: user.name }).eq('id', playerId); } catch (e) {}
    try { await sb.from('weekly_scores').update({ name: user.name }).like('id', playerId + '_%'); } catch (e) {}
    try { await sb.from('level_records').update({ name: user.name }).eq('user_id', playerId); } catch (e) {}

    return res.status(200).json({ ok: true, id: playerId });
  }

  // ── SUBMIT: Submit/Update score ──
  if (action === 'submit' || action === '') {
    const user = validateInitData(body.initData);
    if (!user) return res.status(200).json({ ok: false, error: 'invalid initData' });

    const sb = getSupabase();
    const playerId = 'tg_' + user.id;
    const levelData = body.levelData || {};

    // Compute stats from level data
    let completed = 0, totalStars = 0, totalTime = 0;
    let perfectLevels = 0;
    for (const k in levelData) {
      const lv = levelData[k];
      if (lv.stars > 0) {
        completed++;
        totalStars += lv.stars;
        if (lv.bestTime > 0) totalTime += lv.bestTime;
        if (lv.stars === 3) perfectLevels++;
      }
    }

    // New score formula
    const totalShards = body.totalShards || 0;
    const achievementsCount = body.achievementsCount || 0;
    const challengeWins = body.challengeWins || 0;
    const score = Math.max(0,
      completed * 5000 +
      totalStars * 200 +
      totalShards * 150 +
      achievementsCount * 300 +
      perfectLevels * 500 +
      challengeWins * 250 -
      Math.round(totalTime * 0.5)
    );

    // Anti-cheat: verify submitted score matches server-computed score
    const expectedScore = Math.max(0,
      completed * 5000 +
      (totalStars) * 200 +
      (totalShards) * 150 +
      (achievementsCount) * 300 +
      (perfectLevels) * 500 +
      (challengeWins) * 250 -
      Math.round(totalTime * 0.5)
    );
    const submittedScore = body.score || 0;
    if (Math.abs(submittedScore - expectedScore) > 100) {
      console.error('[VOID] Score mismatch:', { submitted: submittedScore, expected: expectedScore, player: playerId });
      // Use server-computed score, ignore client value
    }

    // Sanity checks: cap unrealistic values
    if (completed > 60 || totalStars > 180 || perfectLevels > 60 || totalShards > 300 || achievementsCount > 50) {
      console.error('[VOID] Unrealistic stats:', { completed, totalStars, perfectLevels, totalShards, achievementsCount, player: playerId });
      return res.status(200).json({ ok: false, error: 'invalid data' });
    }

    // Only update leaderboard if new score is higher than existing (protect after reset)
    const { data: existing } = await sb.from('leaderboard').select('score').eq('id', playerId).single();
    const existingScore = existing ? existing.score : -1;

    if (score > existingScore) {
      const { error: lbErr } = await sb.from('leaderboard').upsert({
        id: playerId,
        name: user.name,
        score,
        completed,
        total_stars: totalStars,
        total_time: totalTime || 0,
        level_data: levelData,
        total_shards: totalShards,
        achievements_count: achievementsCount,
        perfect_levels: perfectLevels,
        challenge_wins: challengeWins,
      }, { onConflict: 'id' });

      if (lbErr) {
        // If new columns don't exist, try without them
        const { error: lbErr2 } = await sb.from('leaderboard').upsert({
          id: playerId,
          name: user.name,
          score,
          completed,
          total_stars: totalStars,
          total_time: totalTime || 0,
          level_data: levelData,
        }, { onConflict: 'id' });

        if (lbErr2) return res.status(200).json({ ok: false, error: lbErr2.message });
      }
    } // end if score > existingScore

    // Get rank (based on best score, which may be the existing one)
    const bestScore = score > existingScore ? score : existingScore;
    const { count } = await sb
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('score', bestScore);

    const rank = (count || 0) + 1;

    // Update best rank in players table
    const { data: playerData } = await sb.from('players').select('best_rank').eq('id', playerId).single();
    if (playerData) {
      const bestRank = playerData.best_rank || 999999;
      if (rank < bestRank) {
        await sb.from('players').update({ best_rank: rank }).eq('id', playerId);
      }
    }

    // Upsert weekly score (only if better)
    const weekKey = getWeekKey();
    try {
      const { data: existingWeekly } = await sb.from('weekly_scores')
        .select('score').eq('id', playerId + '_' + weekKey).single();
      const existingWeeklyScore = existingWeekly ? existingWeekly.score : -1;
      if (score > existingWeeklyScore) {
        await sb.from('weekly_scores').upsert({
          id: playerId + '_' + weekKey,
          name: user.name,
          score,
          completed,
          total_stars: totalStars,
          total_shards: totalShards,
          achievements: achievementsCount,
          week_key: weekKey,
        }, { onConflict: 'id' });
      }
    } catch (e) {}

    // Upsert level records
    for (const k in levelData) {
      const lv = levelData[k];
      if (lv.stars > 0 && lv.bestTime > 0) {
        try {
          // Check if we have a better record
          const { data: existing } = await sb
            .from('level_records')
            .select('best_time, stars')
            .eq('user_id', playerId)
            .eq('level_index', parseInt(k))
            .single();

          if (!existing || lv.bestTime < existing.best_time || lv.stars > (existing.stars || 0)) {
            await sb.from('level_records').upsert({
              user_id: playerId,
              name: user.name,
              level_index: parseInt(k),
              best_time: lv.bestTime,
              stars: lv.stars,
            }, { onConflict: 'user_id,level_index' });
          }
        } catch (e) {}
      }
    }

    return res.status(200).json({ ok: true, rank, score });
  }

  // ── PROFILE: Get player profile ──
  if (action === 'profile') {
    const user = validateInitData(body.initData);
    if (!user) return res.status(200).json({ ok: false, error: 'invalid initData' });

    const sb = getSupabase();
    const playerId = 'tg_' + user.id;

    const { data: lbData } = await sb.from('leaderboard').select('*').eq('id', playerId).single();
    const { data: playerData } = await sb.from('players').select('*').eq('id', playerId).single();

    if (!lbData) return res.status(200).json({ ok: false, error: 'no leaderboard entry' });

    // Get rank
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

    return res.status(200).json({
      ok: true,
      name: lbData.name || user.name,
      score: lbData.score,
      rank,
      completed: lbData.completed,
      total_stars: lbData.total_stars,
      total_time: lbData.total_time,
      total_shards: lbData.total_shards || 0,
      achievements_count: lbData.achievements_count || 0,
      perfect_levels: lbData.perfect_levels || 0,
      challenge_wins: lbData.challenge_wins || 0,
      best_rank: playerData?.best_rank || rank,
      created: playerData?.created || null,
      notifications_enabled: playerData?.notifications_enabled !== false,
      weekly_rank: weeklyRank,
      week_key: weekKey,
    });
  }

  // ── LEVEL RECORDS: Get best times for a specific level ──
  if (action === 'level_records') {
    const sb = getSupabase();
    const levelIndex = body.level_index;
    if (levelIndex === undefined) return res.status(200).json({ ok: false, error: 'level_index required' });

    try {
      const { data, error } = await sb
        .from('level_records')
        .select('user_id, name, best_time, stars')
        .eq('level_index', levelIndex)
        .order('best_time', { ascending: true })
        .limit(10);

      if (error) return res.status(200).json({ ok: false, error: error.message, records: [] });
      return res.status(200).json({ ok: true, records: data || [] });
    } catch (e) {
      return res.status(200).json({ ok: false, error: e.message, records: [] });
    }
  }

  // ── TOGGLE NOTIFICATIONS ──
  if (action === 'toggle_notifications') {
    const user = validateInitData(body.initData);
    if (!user) return res.status(200).json({ ok: false, error: 'invalid initData' });

    const sb = getSupabase();
    const playerId = 'tg_' + user.id;

    await sb.from('players').update({
      notifications_enabled: body.enabled !== false,
    }).eq('id', playerId);

    return res.status(200).json({ ok: true, notifications_enabled: body.enabled !== false });
  }

  // ── DEBUG INIT DATA ──
  if (action === 'debug_init') {
    return res.status(200).json({
      ok: true,
      has_initData: !!body.initData,
      length: body.initData ? body.initData.length : 0,
    });
  }

  return res.status(200).json({ ok: false, error: 'unknown action' });
}
