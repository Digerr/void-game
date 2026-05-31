# VOID — into darkness

A Limbo-inspired 2D side-scrolling platformer, built as a single offline HTML file. No dependencies, no server — just open and play.

## Features

### Mechanics
- **Wall slide & wall jump** — hold toward wall + jump
- **Wall run** — while wall-sliding, hold direction + jump to run along walls
- **Dash** — press X/L to dash through danger with invincibility frames
- **Ledge grab** — automatically grab ledges when falling near platform edges
- **Push boxes** — push boxes onto pressure plates to open doors
- **Pull levers** — interact with levers to open doors
- **Rope swing** — grab ropes and swing across gaps

### Progression
- **Light shards** — collect glowing shards for the secret ending
- **Two endings** — survive (normal) or transcend (all shards)
- **NG+ mode** — extra traps and harder challenges
- **Random Run** — procedurally generated levels with seeded random
- **Three difficulties** — Easy / Normal / Hardcore (one life)

### Atmosphere
- **Shadow pursuer** — a dark entity chases you in the final sections
- **Rising darkness** — outrun the void in the final run
- **Light & dark zones** — stay in the light or take damage
- **Story runes** — discover lore scattered throughout the world
- **Animated cutscenes** — canvas-based cinematic moments
- **Whisper voices** — procedural audio that responds to danger

### Audio (Procedural Web Audio API)
- Low ambient drones
- Wind noise
- Dynamic danger intensity (heartbeat near traps)
- SFX: jump, land, death, dash, lever, door, shard, checkpoint
- Whisper & musical note ambient sounds

### Visual
- Dynamic torch lighting with flickering
- Moonlight & starfield
- Parallax cityscape background
- Rain, fog, fireflies, ash particles
- Water puddles with ripple effects
- Wet footprints
- Death burst particles (color-coded by cause)
- Screen transitions between sections
- Vignette & scan lines

### Mobile
- Touch controls with adaptive feedback
- Interact button glows near interactables
- Dash button shows cooldown
- Jump button enlarges near walls
- Haptic vibration feedback
- Swipe-up jump detection

### Technical
- **Save system** — localStorage saves checkpoints, deaths, shards, best times
- **Minimap** — press TAB to toggle
- **Replay system** — watch your last moments before death
- **Achievements** — Untouched, Perseverance, Sufferer, Light Bearer, Speed Demon, Hardcore, Lorekeeper
- **Speedrun timer** — track your time
- **Quality settings** — low/med/high
- **FPS options** — 30/60

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move | ← → or A D | ◀ ▶ |
| Jump | Space or ↑ | ▲ |
| Interact | E or Shift | E button |
| Dash | X or L | X button |
| Respawn | R | — |
| Minimap | TAB | — |

## Play

Open `index.html` in any modern browser. Works offline — no server needed.

## License

MIT
