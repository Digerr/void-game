---
Task ID: 1
Agent: main
Task: Verify Supabase tables and implement leaderboard redesign v0.14.0-beta

Work Log:
- Verified all 4 Supabase tables exist: leaderboard, weekly_scores, level_records, players
- Confirmed RLS: anon key can read, service key can write for all tables
- Fixed leaderboard button: was showing "скоро откроется", now calls showLeaderboard('global')
- Fixed tab click handlers: were calling renderLB() (no data fetch), now call loadLB()
- Added weekly countdown timer: shows days/hours/minutes until Monday 00:00 UTC reset
- Added weekly rewards info bar: "top3 = скин, top10 = бейдж"
- Added 🏆 trophy button in level selection cards for viewing per-level records
- Updated version to 0.14.0-beta across all references
- Pushed to GitHub, Vercel auto-deployed successfully

Stage Summary:
- All changes deployed to production at https://void-game-ruddy.vercel.app/
- Version: 0.14.0-beta
- Key tables verified: weekly_scores (id, name, score, completed, total_stars, total_shards, achievements, week_key, updated), level_records (id auto-inc, user_id, name, level_index, best_time, stars, updated)
- Existing features already in place: new score formula, 3-tab leaderboard UI, profile with weekly rank/deaths/play time, cloud save retry, sync indicator, totalDeaths in progress, skin merge
