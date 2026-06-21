# Ninja Man Remake

A Phaser 4, TypeScript, and Vite action-platformer prototype with Matter.js physics, responsive scaling, keyboard controls, gamepad support, and an SVG-rendered sprite pipeline for current placeholder production art.

Current version: `3.11.0`

This repository ships **two parallel, independently deployed web builds** for side-by-side comparison:

- **Phaser build** (`phaser/`): Phaser 4 + TypeScript + Vite. Deployed from the repo root → `ninjaman-remake.vercel.app`.
- **Godot build** (`godot/`): Godot 4.6.3 + GDScript pixel-art demo with CC0 assets → `ninjaman-godot.vercel.app`.

See `DEPLOYMENT.md` for the dual-deployment setup, `docs/GAME_DESIGN.md` for the canonical balance spec, and `docs/ELEMENT_MAPPING.md` for the Phaser⇄Godot element cross-reference.

## Features

- **Data-driven Animation Registry**: Character animation keys, frame ranges, frame rates, and repeat modes live in `src/animations/characterAnimationManifest.ts`.
- **SVG-rendered Character Sheets**: Player, enemy, and boss sprites are generated through Playwright/Chromium SVG rendering for smoother anti-aliased placeholder art.
- **Asset Cache Busting**: `src/assets/manifest.ts` appends the project asset version to every loaded URL.
- **Action Game Visual Feedback**: Dynamic glowing masks, red flashes on hurt, blue on perfect block, particles, hitstop, screenshake, and dash afterimages.
- **Advanced Combat System**: 
  - **4-Hit Combos**: Timing-based combos with escalating damage.
  - **Wave Attack**: Special single button energy wave.
  - **Directional Attacks**: Launcher/Uppercut (`W + J`) and Dive Attacks (`S + J` in the air).
  - **Action Input Buffer**: Buffers jumps, attacks, dashes, and waves for up to 150ms to fire immediately after hitstuns or recoveries.
- **Fluid Movement**: Double jumping, coyote time, an invincible horizontal dash, and reachable one-way semisolid platforms (jump through from below or drop through with `S + Space`).
- **Parry System**: Hold `K` to defend. Perfect blocks mitigate damage, prevent knockback, and award bonus points.
- **Intelligent Patrol AI**: Enemies utilize Matter.js downward and forward Raycasting queries to detect cliffs and obstacle walls to automatically turn around.
- **Interactive Physics Props**: Procedurally rendered wooden crates and metal barrels that can be pushed, slide realistically, and shatter upon receiving damage. Shattering spawns 4-6 dynamic flying debris blocks with gravity/impulses and deals splash area damage to nearby enemies.
- **Impact VFX Juice**: Screenshake, particle bursts, afterimage ghost trails during dashes/combos, and elastic camera zoom during hitstops.
- **Multi-stage Progression**:
  - Sector 1: Mystical Forest
  - Sector 2: Beach Ruins
  - Sector 3: Castle Courtyard (Boss Fight)
- **Diverse Enemy AI**: Guards, axe brutes, ninjas, snipers, and an oni boss.

## Asset Pipeline

Current art is generated and checked in so the game can run without external art tools.

```bash
npm run build:player-art
npm run build:art
```

- `build:player-art` regenerates `phaser/public/assets/sprites/player_hero_hd.png` from `phaser/scripts/generate_player_hero.js`.
- `build:art` regenerates backgrounds, the player sheet, enemy sheets, and boss sheet.
- `phaser/src/assets/manifest.ts` is the single source for runtime asset loading and cache-busted URLs.
- `phaser/src/animations/characterAnimationManifest.ts` is the single source for sprite animation ranges.

## Controls

- `A` / `D`: Run
- `W`: Up modifier / uppercut aim
- `S`: Down modifier
- `SPACE`: Jump / Double Jump
- `S + SPACE` (on floating platforms): Drop through semisolid platform
- `K` (hold): Defend/Block (Triggers Parry when hit)
- `DOUBLE TAP A/D`: Invincible Dash
- `J`: Attack (Spam for 4-hit combo)
- `L`: Wave Attack
- `W + J` (on ground): Uppercut (Launcher)
- `S + J` (in air): Dive Attack

### Gamepad

- Left stick / D-pad: Move and directional modifiers
- `A`: Jump / Double Jump
- `X`: Attack
- `B`: Defend / Block
- `Y`: Wave Attack

## Installation and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
npm run test:visual
```

## Repository Hygiene

- Generated runtime assets under `public/assets` are kept only when they are loaded by the current manifest or scripts.
- Temporary Playwright output, scratch debugging files, `dist`, and `node_modules` are ignored.
- Legacy SWF imports, old packed atlases, and unused placeholder character sheets were removed in `3.8.0`.
- **Godot 4.6.3 Prototype (v3.10.0)**: A complete pixel-art demo under `godot/` with:
  - CC0 fourSeasonsPlatformer_ tileset (terrain, objects, backgrounds)
  - CC0 dungeonSprites_ characters (player, enemies, boss)
  - CC0 audio (Juhani Junkala music + SFX)
  - CC0 Kenney pixel fonts
  - 8-10 screen forest level with parallax, coins, hearts, fire hazards, checkpoints
  - Full AudioManager system with music crossfade and SFX pooling
  - Boss encounter with dynamic music switching
  - Sword overlay attack animations
  - Web export preset and Vercel deployment config
  - All credits in `godot/assets/CREDITS.md`

## Godot Prototype Features

- **Tilemap Terrain**: TileMapLayer with grass/stone/leaf blocks from fourSeasonsPlatformer_ tileset
- **Parallax Backgrounds**: 3-layer scrolling (sky, hills, trees) using Parallax2D nodes
- **Extended Level**: 10 screens (11,520 px) with vertical platforming and branching paths
- **Collectibles & Hazards**: Coins (13), hearts (3), fire hazards (4) with glow effects
- **Checkpoint System**: 3 checkpoints with health preservation on respawn
- **Complete Audio**: Title/level/boss/victory music + 20 gameplay SFX
- **Visual Polish**: Pixel fonts, death animations, sword swing overlay, camera shake
- **Controls**: A/D move, Space jump, Shift dash, J melee, L wave, Esc pause

Build the Godot web export locally (output: `godot/build/web/`):
```bash
npm run build:godot:web
```

> On Windows the Godot CLI may hang at 98%. In that case export from the Godot Editor (Project > Export > Web) or rely on the GitHub Action, which builds on Linux. See `DEPLOYMENT.md`.
