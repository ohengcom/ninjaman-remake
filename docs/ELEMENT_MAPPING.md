# Element Mapping: Phaser ⇄ Godot

This is the cross-reference for comparing the two parallel implementations. When you change a game element in one, find its counterpart here and mirror it in the other.

## Repository layout (post-restructure)

```
ninjaman/
├── phaser/                 # Phaser 4 + TypeScript + Vite track
│   ├── src/                #   game source
│   │   ├── config/         #     combat.ts, enemies.ts, levels.ts (centralized tuning)
│   │   ├── entities/       #     Player, Enemy, Boss, Projectile
│   │   ├── managers/       #     Combat, Save, Sound, Vfx
│   │   ├── scenes/         #     Boot, MainMenu, Game, HUD, Pause, GameOver
│   │   └── utils/          #     StateMachine, TypedEventBus, ...
│   ├── public/             #   runtime assets
│   ├── scripts/            #   art / audio generation scripts
│   ├── tests/              #   vitest unit + playwright e2e
│   └── index.html          #   Vite entry
├── godot/                  # Godot 4.6.3 + GDScript track
│   ├── scripts/
│   │   ├── autoload/       #   Balance (tuning), GameState, AudioManager
│   │   ├── utils/          #   state_machine.gd (class_name StateMachine)
│   │   ├── player/         #   player.gd
│   │   ├── enemies/        #   enemy_guard.gd, boss_oni.gd
│   │   ├── levels/         #   level_01.gd, level_builder.gd
│   │   └── ...             #   combat, hazards, pickups, ui, vfx
│   ├── scenes/             #   .tscn scenes
│   ├── assets/             #   CC0 assets
│   ├── tests/              #   run_tests.gd (headless unit tests)
│   └── vercel.json         #   Godot deploy config
├── scripts/                # export_godot_web.js (Godot web export)
├── docs/                   # GAME_DESIGN.md, ELEMENT_MAPPING.md, GODOT_MIGRATION.md, IMPROVEMENT_PLAN
├── .github/workflows/      # ci.yml (Phaser), deploy-godot.yml (Godot deploy)
├── vercel.json             # Phaser deploy config
└── package.json            # single npm workspace (root)
```

## Entity mapping

| Concept | Phaser source | Godot source | Phaser art | Godot art | Canonical name |
|---|---|---|---|---|---|
| Player | `phaser/src/entities/Player.ts` | `godot/scripts/player/player.gd` | SVG hero sheet | dungeonSprites `mHero_` | **Player** |
| Basic enemy | `Enemy.ts` (`guard`) | `enemy_guard.gd` (configured `guard`) | SVG guard | `goblin_` | **Guard** |
| Heavy enemy | `Enemy.ts` (`axe`) | `enemy_guard.gd` (`axe`) | SVG | `orc_` | **Axe Brute** |
| Fast enemy | `Enemy.ts` (`ninja`) | `enemy_guard.gd` (`ninja`) | SVG | `skeleton_` | **Ninja** |
| Ranged enemy | `Enemy.ts` (`sniper`) | _(not yet in Godot)_ | SVG | — | **Sniper** |
| Boss | `Boss.ts` | `boss_oni.gd` | SVG oni | `dragon_` | **Boss (Oni)** |
| Projectile | `Projectile.ts` | `scenes/combat/WaveProjectile.tscn` | — | — | **Wave / Bullet** |

## Systems mapping

| System | Phaser | Godot |
|---|---|---|
| Combat tuning | `phaser/src/config/combat.ts` | `godot/scripts/autoload/balance.gd` (Autoload `Balance`) |
| Enemy tuning | `phaser/src/config/enemies.ts` | `godot/scripts/autoload/balance.gd` (`ENEMIES` dict per type) |
| Boss tuning | `phaser/src/config/enemies.ts` (`BOSS_STATS`) | `godot/scripts/autoload/balance.gd` (`BOSS` const) |
| State machine (utility) | `phaser/src/utils/StateMachine.ts` (generic) | `godot/scripts/utils/state_machine.gd` (`class_name StateMachine`) |
| Player state | `Player.ts` uses StateMachine | `player.gd` hybrid: StateMachine for movement mode + concurrent timers |
| Enemy state | (inline in `Enemy.ts`) | `enemy_guard.gd` explicit StateMachine (PATROL/CHASE/WINDUP/ATTACK/HURT) |
| Boss state | (inline in `Boss.ts`) | `boss_oni.gd` explicit StateMachine (STALK/WINDUP/SWIPE/RUSH/SLAM/HURT) |
| Level data | `phaser/src/config/levels.ts` | `godot/scripts/levels/level_01.gd` |
| Level build | scene-driven | `godot/scripts/levels/level_builder.gd` |
| Audio | `phaser/src/managers/SoundManager.ts` | `godot/scripts/autoload/audio_manager.gd` |
| Save/state | `phaser/src/managers/SaveManager.ts` | `godot/scripts/autoload/game_state.gd` |
| VFX | `phaser/src/managers/VfxManager.ts` | `godot/scenes/vfx/HitVfx.tscn` |
| HUD | `HUDScene.ts` + `index.html` overlay | `godot/scenes/ui/Hud.tscn` |
| Typed events | `phaser/src/utils/TypedEventBus.ts` (wraps Phaser emitter) | GDScript `signal` (native typed) |
| Tests | Vitest (27 unit) + Playwright e2e | `godot/tests/run_tests.gd` (17 unit, headless) |

## Known divergences (to reconcile)

- **Boss identity**: Phaser = Oni warlord (SVG); Godot = `dragon_` sprite stand-in. Canonical = **Oni**; swap Godot sprite only when oni pixel art is available. See `GAME_DESIGN.md`.
- **Sniper enemy**: Phaser-only (ranged AI). Godot deferred. Documented as Phaser-only.
- **Levels**: Phaser = 3 sectors (Forest/Beach/Castle); Godot = 1 ten-screen forest ("Sector 1 extended"). Sectors 2-3 are Phaser-only for now.
- **SpriteFrames**: Godot still builds `SpriteFrames` at runtime via `_build_sprite_frames()`. Moving to editor-authored `.tres` resources is a follow-up (needs Godot Editor work).
- **AnimationTree**: Godot has an `AnimationTree` node on Player but it's inactive (`active=false`); animation is driven by `sprite.play()`. Enabling condition-based `AnimationTree` is a follow-up.
- **Boss HP**: Godot `balance.gd` uses 260 (pre-existing tuning); Phaser/GAME_DESIGN spec is 300. Align after side-by-side playtesting.

See `GAME_DESIGN.md` for the canonical numbers both tracks should target.
