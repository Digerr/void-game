# VOID — во тьму

A Limbo-inspired 2D side-scrolling platformer built as a **Telegram Mini App**. Dark minimalist world, precise controls, atmospheric visuals — all in a single HTML file with no build tools.

**Current version:** 2.9.0

## Tech Stack

- **PixiJS 8.9.2** (CDN) — GPU-accelerated 2D rendering
- **Matter.js** (CDN) — 2D physics engine
- **Supabase** — cloud leaderboard, player profiles
- **Telegram WebApp SDK** — Mini App integration, haptic feedback
- **Web Audio API** — procedural music & SFX
- **HTML/CSS overlay** — menus, HUD, touch controls
- **localStorage** — offline save system

## Features

### Mechanics
- **Wall slide & wall jump** — hold toward wall + jump
- **Dash** — press X/L to dash through danger
- **Ledge grab** — automatically grab ledges near platform edges
- **Push boxes** — push boxes onto pressure plates to open doors
- **Pull levers** — interact with levers to open doors
- **Thread climb** — grab threads and climb or swing across gaps
- **Ice** — slippery surfaces with reduced friction
- **Springs** — bounce pads for high jumps
- **Portals** — teleport between linked portals
- **Wind zones** — push the player in a direction
- **Moving platforms** — ride horizontally or vertically moving platforms
- **Falling platforms** — crumble after stepping on them
- **Pursuing Darkness** — wall of darkness chasing the player
- **Gravity zones** — reverse gravity in specific areas
- **Saws, spikes, pendulums** — deadly traps
- **Shadow enemies** — patrolling hostiles
- **Pressure plates + doors** — weight-activated mechanics
- **Checkpoints** — save progress mid-level

### Progression
- **30 levels** across 6 acts:
  - Act I — Пробуждение (Awakening)
  - Act II — Глубины (Depths)
  - Act III — Нити (Threads)
  - Act IV — Пустота (Void)
  - Act V — Возрождение (Rebirth)
  - Act VI — Исход (Exodus)
- **Star rating** — 1–3 stars per level based on completion time
- **Rank system** — S / A / B / C / D rank based on total performance
- **RU/EN** — full bilingual support

### Skins
8 unlockable character skins:
- **пустота** — default
- **рассвет** — complete Act I
- **бездна** — complete Act II
- **искра** — complete Act III
- **теневой** — complete Act IV
- **возрождение** — complete Act V
- **исход** — complete Act VI
- **призрак** — get 3 stars on all levels

### Achievements
13 achievements to unlock: first step, wall crawler, thread master, dash king, no death, speedrun, explorer, halfway, void master, perfectionist, dark escape, light bearer, gravity master.

### Leaderboard
- Global leaderboard powered by **Supabase**
- View top players by total time and stars
- See your own rank

### Daily Challenge
- Unique challenge every day with special modifiers
- Compete for the best time on a fixed seed

### Audio
- Ambient arpeggio music per act theme
- SFX: click, interact, lever, grab, release, door, death, jump, checkpoint, enemy, chase, lightning, stalactite, and more

### Visual
- Per-act themed backgrounds with parallax layers, stars, and moon
- Dynamic torch/light system with fog and vignette
- Programmatic textures (no external assets)
- Act intro cutscenes with particle effects
- Dark minimalist palette, Courier New typography

### Mobile
- Touch controls with left/right/jump/dash/interact/thread buttons
- Pause button overlay
- Safe area support (notch handling)
- Haptic feedback via Telegram API

### Technical
- **Save system** — localStorage saves progress, stars, deaths, best times
- **No-cache headers** — aggressive cache busting for Telegram WebView
- **Versioned URLs** — `/v2.9` style paths with Vercel rewrites
- **Auto-update** — detects new version and reloads automatically
- **FAQ tab** — in-game help for all mechanics
- **Profile** — view stats, rank, achievements, unlocked skins

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move | ← → or A D | ◀ ▶ |
| Jump | Space or ↑ | ▲ |
| Interact | E or Shift | E button |
| Dash | X or L | ○ dash |
| Thread climb | W or ↑ near thread | ○ thread |
| Respawn | R | — |
| Pause | ESC | ❚❚ button |

## Deployment

- **Vercel** auto-deploys from `main` branch
- Root directory: `void-game/`
- `vercel.json` handles URL rewrites and no-cache headers
- Telegram bot: @voide_game_bot

## Play

**Telegram:** @voide_game_bot — tap "Играть" to launch as Mini App

**Local:** Open `void-game/index.html` in any modern browser. Requires internet for CDN libraries (first load only).

## License

MIT
