# VOID — into darkness

A Limbo-inspired 2D side-scrolling platformer built with **Phaser 3**. Single HTML file, no build tools — just open and play.

## Tech Stack

- **Phaser 3.80.1** (CDN) — game engine with Arcade Physics
- **Web Audio API** — procedural music & SFX
- **HTML/CSS overlay** — menus, HUD, touch controls
- **localStorage** — save system

## Features

### Mechanics
- **Wall slide & wall jump** — hold toward wall + jump
- **Dash** — press X/L to dash through danger
- **Ledge grab** — automatically grab ledges near platform edges
- **Push boxes** — push boxes onto pressure plates to open doors
- **Pull levers** — interact with levers to open doors
- **Rope swing** — grab ropes and swing across gaps
- **Vine grab** — swing on vines
- **Ice** — slippery surfaces
- **Lava** — instant death
- **Flood** — rising water, climb fast
- **Chase** — darkness pursues from behind
- **Breakable platforms** — crumble under your feet
- **Saws, spikes, pendulums, stalactites** — deadly traps
- **Shadow enemies** — patrolling hostiles
- **Pressure plates + doors** — weight-activated mechanics
- **Checkpoints** — save progress mid-level
- **Light shards** — collect for the secret ending
- **Two endings** — survive (normal) or transcend (all shards)

### Progression
- **30 levels** across 4 acts (Awakening, Descent, The Abyss, Rebirth)
- **Three difficulties** — Easy / Normal / Hard
- **RU/EN** — full bilingual support

### Audio (Procedural Web Audio API)
- Ambient arpeggio music (Am→G→F→Em)
- 14 SFX types: click, interact, lever, grab, release, door, death, jump, checkpoint, enemy, flood, chase, lightning, stalactite

### Visual
- Programmatic textures (16 types)
- Custom Phaser Graphics rendering (aura, scarf, particles, vignette)
- Dynamic torch lighting
- Dark minimalist palette, Courier New typography

### Mobile
- Touch controls with left/right/jump/interact buttons
- Pause button overlay
- Safe area support (notch handling)

### Technical
- **Save system** — localStorage saves checkpoints, deaths, best distances
- **Quality settings** — low/med/high
- **Brightness slider** — adjustable in settings
- **Music volume** — 4 levels (0/♪/♪♪/♪♪♪)
- **FAQ tab** — in-game help for all mechanics
- **Progress tab** — track completion across all 30 levels

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move | ← → or A D | ◀ ▶ |
| Jump | Space or ↑ | ▲ |
| Interact | E or Shift | E button |
| Dash | X or L | — |
| Respawn | R | — |
| Pause | ESC | ❚❚ button |
| Music | M | — |

## Play

Open `index.html` in any modern browser. Requires internet for Phaser CDN load (first time only, then cached).

**Online:** https://digerr.github.io/void-game/

**Telegram:** @voide_game_bot — tap "Играть" to launch as Mini App

## License

MIT
