# Game Design Spec (Canonical)

Single source of truth for game balance both tracks (Phaser & Godot) should target. Numbers below are taken from the Phaser implementation (`phaser/src/config/`), which is currently the most complete. When tuning either track, update this file first, then mirror in code.

Version: 3.11.0

## Player

| Stat | Value | Phaser key |
|---|---|---|
| Max health | 100 | `Player.maxHealth` |
| Run speed | 6.0 | `PLAYER_MOVEMENT.runSpeed` |
| Air speed | 4.5 | `PLAYER_MOVEMENT.airSpeed` |
| Jump velocity | -11.0 | `PLAYER_MOVEMENT.jumpVelocity` |
| Double jump | -10.0 | `PLAYER_MOVEMENT.doubleJumpVelocity` |
| Max jumps | 2 | `PLAYER_MOVEMENT.maxJumps` |
| Dash speed / duration | 14.0 / 180ms | `PLAYER_MOVEMENT.dash*` |
| Coyote time | 100ms | `PLAYER_MOVEMENT.coyoteTime` |
| Input buffer | 150ms | `PLAYER_MOVEMENT.actionBufferTime` |

## Player attacks

| Attack | Damage | Reach | Notes |
|---|---|---|---|
| Combo (4-hit) | 9 base, +6/step | 90 | escalating |
| Uppercut | 20 | 60 | launch -9.0 |
| Dive | 25 | 70 | down 13.0 |
| Wave | 20 | projectile 14.0 | cooldown 350ms |

## Player defense

| Stat | Value |
|---|---|
| Block damage reduction | 20% |
| Hurt stun | 300ms |
| Invulnerability after hit | 1000ms |
| Fall damage | 25 |

## Enemies

| Enemy | HP | Damage | Speed | Reach | Windup | Cooldown |
|---|---|---|---|---|---|---|
| Guard | 40 | 10 | 1.5 | 60 | 500ms | 800ms |
| Axe Brute | 80 | 25 | 1.0 | 70 | 800ms | 1200ms |
| Ninja | 25 | 8 | 3.0 | 50 | 200ms | 400ms |
| Sniper | 20 | 15 | 0 | 600 | 1000ms | 2000ms |

All enemies: chase multiplier 1.5.

## Boss (Oni)

> **Identity unified 2026-06-21**: canonical boss is **Oni Warlord**. Phaser uses SVG oni art; Godot temporarily uses `dragon_` sprite from dungeonSprites CC0 set (art-only stand-in; AI/HP/damage use Oni stats below). When hand-drawn oni pixel art is produced for Godot, swap the sprite only — no logic change needed.

| Stat | Value |
|---|---|
| HP | 300 |
| Move speed | 3.5 |
| Enraged multiplier | 1.5 |
| Rush multiplier | 4 |
| Attack damage | 30 |
| Attack reach | 200 |
| Engage distance | 800 |
| Damage taken multiplier | 0.5 |

> Note: Godot's `balance.gd` currently uses HP=260 (pre-existing Godot tuning). Align to 300 in a follow-up after playtesting both tracks side by side.

## Scoring

| Action | Points |
|---|---|
| Enemy kill | 100 |
| Wave kill | 150 |
| Parry bonus | 50 |
| Boss kill | 5000 |

## Combo / Style ranks

C (default) → B (3 hits) → A (5) → S (8) → SSS (12). Combo timeout 5000ms.

## Levels (canonical target: 3 sectors)

1. **Sector 1: Mystical Forest**
2. **Sector 2: Beach Ruins**
3. **Sector 3: Castle Courtyard** (Boss fight)

> **Alignment decision (2026-06-21)**: Godot demo = "Sector 1 extended" (10-screen forest). Phaser = full 3-sector campaign. Sectors 2-3 are **Phaser-only for now**; Godot will add them incrementally. Sniper enemy is likewise **Phaser-only** until Godot adds a ranged-attack AI (tracked as follow-up).

## Controls (both tracks)

| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A / D | Left stick / D-pad |
| Jump / Double | Space | A |
| Dash | **Shift** (unified) + double-tap A/D (Phaser bonus) | — |
| Attack | J | X |
| Defend | K | B |
| Wave | L | Y |
| Pause | Esc | Start |

> **Unified 2026-06-21**: both tracks use **Shift** as the canonical dash key. Phaser additionally keeps double-tap A/D as a legacy shortcut. Godot already uses Shift. No change needed to Godot; Phaser already binds `SHIFT` to `dashKey` (`Player.ts:78`) — confirmed aligned.

## Physics engine decision

> **Decision (2026-06-21): keep Matter.js in Phaser.**
>
> Rationale: the Phaser track already builds its entire combat system (compound bodies, sensors for attack hitboxes, one-way platforms, raycasting patrol AI, interactive physics props) on Matter.js. Switching to Arcade physics would require reimplementing sensors, one-way platforms, and crate/barrel physics with manual overlap checks — high risk, low payoff for a platformer that already runs at 60fps. Matter is "over-engineered" only in the abstract; in practice the features are in active use. Revisit only if profiling shows a real perf problem on low-end devices.
