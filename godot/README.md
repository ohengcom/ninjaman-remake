# Ninja Man Godot Prototype

A complete 2D pixel-art action platformer demo built with Godot 4.6.3, featuring CC0 assets, full audio integration, tilemap terrain, and polished gameplay.

**Live Demo**: https://ninjaman-remake-psi.vercel.app

## Features

### Visual & Level Design
- **TileMap Terrain**: 16×16 pixel blocks from fourSeasonsPlatformer_ tileset (grass, stone, leaf, dungeon brick)
- **Parallax Backgrounds**: 3-layer scrolling backdrop (sky, silhouette hills, tree line)
- **Extended Level**: 10 screens (11,520 pixels) with vertical platforming, floating islands, and branching paths
- **Decorations**: Trees, bushes, animated grass tufts, crates, signs, pillars
- **Boss Arena**: Brick wall backdrop for final encounter

### Gameplay Systems
- **Player Mechanics**: Double jump, dash with invulnerability, sword melee, wave projectile
- **Collectibles**: 13 coins (50 pts each), 3 hearts (35 HP heal)
- **Hazards**: 4 fire traps with animated flames and PointLight2D glow
- **Checkpoints**: 3 savepoints that preserve health on death
- **Enemy AI**: Guards, axe brutes, ninjas with patrol/chase/attack states
- **Boss Fight**: Multi-phase oni dragon with rush, swipe, and slam attacks

### Audio Integration
- **Music**: Title screen, level, boss battle, victory (CC0 by Juhani Junkala)
- **Sound Effects**: 20 gameplay sounds (jump, dash, attack, hit, hurt, death, coin, etc.)
- **AudioManager**: Dual-player music crossfade, SFX pooling, hit-stop with depth counting

### Polish
- **Pixel Fonts**: Kenney fonts for all UI text
- **Animations**: Sword swing overlay, enemy death sequences, coin/heart collection
- **Camera**: Smooth tracking with lookahead, screen shake, boundary limits
- **HUD**: Health bar, score, coin counter, checkpoints, pause menu

## Controls

- **A / D**: Move left/right
- **Space**: Jump / Double jump
- **Shift**: Dash
- **J**: Sword attack
- **L**: Wave projectile
- **Esc**: Pause

## Building

### Prerequisites
- Node.js 18+
- Godot 4.6.3 (automatically downloaded by build script)

### Web Export
```bash
npm run build:godot:web
```

Output: `build/web/index.html`

### Local Testing
Open the Godot project:
```bash
godot godot/project.godot
```

Press F5 to run.

## Project Structure

```
godot/
├── assets/
│   ├── audio/           # Music and SFX (CC0)
│   ├── fonts/           # Kenney pixel fonts (CC0)
│   ├── tiles/           # fourSeasonsPlatformer_ tileset (CC0)
│   ├── characters/      # dungeonSprites_ character set (CC0)
│   └── CREDITS.md       # Full asset attribution
├── scenes/
│   ├── Main.tscn        # Entry point
│   ├── levels/          # Level01 scene
│   ├── player/          # Player scene
│   ├── enemies/         # Enemy and boss scenes
│   ├── pickups/         # Coin and heart scenes
│   ├── hazards/         # Fire hazard scene
│   ├── ui/              # HUD and menu scenes
│   └── vfx/             # Hit effect scene
└── scripts/
    ├── autoload/        # AudioManager, GameState
    ├── levels/          # level_01.gd, level_builder.gd
    ├── player/          # player.gd
    ├── enemies/         # enemy_guard.gd, boss_oni.gd
    ├── pickups/         # coin.gd, heart.gd
    ├── hazards/         # fire_hazard.gd
    └── ui/              # hud.gd, main_menu.gd
```

## Asset Credits

All assets are CC0 (public domain). Attribution not required but provided in `godot/assets/CREDITS.md`:

- **fourSeasonsPlatformer_ Tileset v2.0** by Kevin's Mom's House / analogstudios_
- **dungeonSprites_** by Kevin's Mom's House / analogstudios_
- **5 Chiptunes (Action)** by Juhani Junkala
- **512 Sound Effects (8-bit style)** by Juhani Junkala
- **Kenney Fonts** by Kenney (kenney.nl)

## Technical Highlights

### ForestLevelBuilder
- Programmatic TileSet construction with multi-cell atlas tiles
- Greedy block placement algorithm for terrain fill
- Collision helper functions (solid rects, one-way platforms)
- Parallax layer generation with sprite regions

### AudioManager
- Dual AudioStreamPlayer for seamless music crossfade
- 10-player SFX pool with automatic fallback
- Hit-stop effect with depth counting to prevent time-scale lock
- Runtime asset loading with ResourceLoader.exists() validation

### Level Design
- Cell-based coordinates (48px cells = 16px tiles × 3 scale)
- Ground segments with automated fill-down
- Floating islands and leaf platforms
- Brick wall backdrop layer with pattern variants
- Camera limits: 0-11520 horizontal, -200 to 900 vertical

## Version History

- **v3.10.0** (Current): Full pixel-art demo with CC0 assets, complete audio, 10-screen level
- **v3.9.0**: dungeonSprites_ character set integration
- **v3.8.0**: Initial Godot 4.6.3 migration

## License

Code: ISC
Assets: CC0 (public domain) - see `godot/assets/CREDITS.md`
