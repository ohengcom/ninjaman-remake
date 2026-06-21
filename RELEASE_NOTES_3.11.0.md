# Ninja Man Remake v3.11.0 - Release Summary

**Release Date**: 2026-06-21
**Major Update**: Dual-track architecture restructure + cross-engine best-practice adoption

## Overview

Restructured the repository into two parallel, symmetric tracks (`phaser/` + `godot/`) with independent Vercel deployments, and adopted each engine's best practices into the other. This release focuses on engineering quality and maintainability rather than new gameplay.

## Breaking: Repository restructure

The Phaser source tree moved from the repo root into `phaser/`, mirroring the existing `godot/` layout. Both tracks now sit side-by-side with symmetric structure.

```
phaser/   ← was: src/, public/, tests/, scripts/, index.html (root)
godot/    ← unchanged internally
```

Config files (`package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`) stay at the root as the single npm workspace, with paths updated to point into `phaser/`.

## Dual-track deployment

Two independent Vercel projects serve both builds for side-by-side comparison:

| | Phaser | Godot |
|---|---|---|
| Vercel project root | `.` | `godot` |
| Config | `vercel.json` | `godot/vercel.json` |
| Build | Vercel runs `npm run build` → `dist/` | GitHub Action exports → `godot/build/web/` |
| Artifacts in git | No | No (41MB build output untracked) |

- **`build/web/` (41MB) removed from git tracking** — `.gitignore` now ignores `build/`.
- **`vercel.godot.json` / `vercel.phaser.json` deleted** — replaced by per-track `vercel.json` (root + `godot/`).
- **`.github/workflows/deploy-godot.yml`** — builds Godot web export on Ubuntu (works around the Windows CLI 98% hang) and deploys prebuilt output to Vercel.
- **5 conflicting deployment docs merged** into a single `DEPLOYMENT.md`.

## Godot: centralized balance + state machines

Adopted Phaser's engineering patterns into Godot (P0 from the architecture review):

- **`godot/scripts/autoload/balance.gd`** (Autoload `Balance`) — single source of truth for all tuning: `PLAYER`, `ENEMIES` (per-type dict), `BOSS`, `SCORE`, `GRAVITY`. Mirrors `phaser/src/config/combat.ts` + `enemies.ts`. Replaces scattered `const` declarations across `player.gd` / `enemy_guard.gd` / `boss_oni.gd`.
- **`godot/scripts/utils/state_machine.gd`** (`class_name StateMachine`) — reusable FSM with on_enter/on_update/on_exit callbacks, transition guards, and transition callbacks. Mirrors `phaser/src/utils/StateMachine.ts`.
- **`enemy_guard.gd`** rewritten to use explicit `StateMachine` (PATROL/CHASE/WINDUP/ATTACK/HURT) instead of ad-hoc timer branches.
- **`boss_oni.gd`** rewritten to use explicit `StateMachine` (STALK/WINDUP/SWIPE/RUSH/SLAM/HURT).
- **`player.gd`** uses a hybrid model: `StateMachine` for movement-mode selection (ground/air/attack/hurt/dash/dead) + concurrent timers for sub-state (preserves original feel where dash/hurt/attack overlap).
- **`godot/tests/run_tests.gd`** — 17 headless unit tests for `StateMachine` (no external test framework; runs via `godot --headless --script`). All pass.
- **`godot/project.godot`** — added `config/version="3.11.0"`; registered `Balance` autoload.

## Phaser: typed event bus

Adopted Godot's typed-signal pattern into Phaser (P0):

- **`phaser/src/utils/TypedEventBus.ts`** — type-safe wrapper around `Phaser.Events.EventEmitter`. The existing `GameEventMap` type (defined but unused in `events.ts`) is now enforced at compile time on `emit`/`on`/`once`/`off`. Mirrors GDScript `signal` signatures.
- **`phaser/src/utils/TypedEventBus.test.ts`** — 5 unit tests. Total Phaser tests: 27 (was 22).

## Documentation

- **`DEPLOYMENT.md`** (new) — single source of truth for the dual Vercel deployment, replacing 5 overlapping/conflicting docs (`DEPLOYMENT_STATUS`, `GODOT_BUILD_ISSUE`, `PROJECT_STATUS`, `SWITCH_TO_GODOT`, `VERCEL_DEPLOYMENT_GUIDE` — all deleted).
- **`docs/GAME_DESIGN.md`** updated:
  - Boss identity unified to **Oni** (Godot `dragon_` is an art-only stand-in).
  - Level alignment decision: Godot = "Sector 1 extended"; Sectors 2-3 + Sniper enemy are Phaser-only for now.
  - Dash unified to **Shift** (both tracks already aligned; Phaser keeps double-tap as legacy).
  - Physics decision: **keep Matter.js** in Phaser (features in active use; switching to Arcade is high-risk/low-payoff).
- **`docs/ELEMENT_MAPPING.md`** updated with full Phaser⇄Godot element cross-reference, reflecting the new `balance.gd` / `StateMachine` / `TypedEventBus` / tests.

## Version alignment

All version references unified to `3.11.0`:
- `package.json` / `package-lock.json`
- `godot/project.godot` (`config/version`)
- `phaser/src/assets/manifest.ts` (`ASSET_VERSION` — was lagging at 3.9.0)
- `README.md`, `docs/GAME_DESIGN.md`

## Verification

- Phaser: `npm run typecheck` ✅, `npm test` ✅ (27 passed), `npm run build` ✅
- Godot: project import (headless editor) ✅ zero parse errors, `run_tests.gd` ✅ (17 passed)

## Known follow-ups (deferred, documented in `docs/ELEMENT_MAPPING.md`)

- Godot `SpriteFrames` → editor-authored `.tres` resources (needs Godot Editor work).
- Godot `AnimationTree` currently inactive; enabling condition-based animation is a follow-up.
- Phaser `Player.ts` (723 lines) split into body/combat/animation components — deferred (high-risk refactor, no runtime feel regression acceptable without manual playtest).
- Phaser TileMap via Tiled `.tmx` — deferred (needs map authoring).
- Godot Sniper ranged AI — deferred (documented Phaser-only).
- Boss HP: Godot 260 vs spec 300 — align after side-by-side playtesting.

## File statistics

- ~100 files changed (relocations via `git mv` preserve history)
- +362 / -2637 lines net (mostly from untracking the 41MB `build/web/` and deleting redundant docs)

## Version history

- **v3.11.0** (2026-06-21): Dual-track restructure + cross-engine best-practice adoption
- **v3.10.0** (2026-06-12): Full pixel-art Godot demo with CC0 assets, 10-screen level
- **v3.9.0** (2026-05-28): dungeonSprites character set integration
- **v3.8.0** (2026-05-20): Initial Godot 4.6.3 migration
