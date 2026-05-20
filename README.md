# Cyber Ninja Remake

A modern, high-definition action-platformer remake built with Phaser 4, TypeScript, and Vite. This project abandons legacy SWF assets in favor of programmatically generated, scalable vector graphics with a cyber-ninja aesthetic.

## Features

- **Modern Vector Aesthetics**: Crisp, dynamic SVG graphics with neon glow effects generated procedurally via Canvas.
- **Advanced Combat System**: 
  - **4-Hit Combos**: Timing-based combos with escalating damage.
  - **Wave Attack**: Perform a motion input (`DOWN, FORWARD, SPACE`) to launch a long-range energy wave.
  - **Directional Attacks**: Launcher/Uppercut (`UP + SPACE`) and Dive Attacks (`DOWN + SPACE` in the air).
- **Fluid Movement**: Double jumping, Coyote time, and an invincible horizontal Dash/Roll. No more falling death—focus is on pure combat.
- **Parry System**: Hold `DOWN` to defend. Perfect blocks mitigate 80% damage, prevent knockback, and award bonus points.
- **Style Ranking**: Dynamic Devil May Cry-esque style rank (C, B, A, S, SSS) based on continuous combos.
- **RPG Elements**: 
  - Earn Skill Points (SP) via score milestones.
  - Spend SP in the Cyber Enhancements menu (Press `K`) to upgrade your Integrity (Health).
- **Multi-stage Progression**:
  - Sector 1: Cyber City
  - Sector 2: Tech Forest
  - Sector 3: Reactor Core (Boss Fight)
- **Diverse Enemy AI**:
  - **Guards**: Balanced patrollers.
  - **Axe Brutes**: Slow, tanky, heavy hitters.
  - **Ninjas**: Fragile but extremely fast.
  - **Core Guardian (Boss)**: Massive mechanical enemy with full-screen sweeping blade attacks.

## Controls

- `LEFT` / `RIGHT`: Run
- `UP`: Jump / Double Jump
- `DOWN` (hold): Defend/Block (Triggers Parry when hit)
- `DOUBLE TAP LEFT/RIGHT`: Invincible Dash
- `SPACE`: Attack (Spam for 4-hit combo)
- `DOWN, FORWARD, SPACE`: Wave Attack (Hadouken motion)
- `UP + SPACE` (on ground): Uppercut (Launcher)
- `DOWN + SPACE` (in air): Dive Attack
- `K`: Open/Close Skill Tree Menu
- `M`: Toggle Sound

## Installation and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The dev and build scripts generate the HD vector assets automatically.

## Build for Production

```bash
npm run build
```

## Quality Checks

```bash
npm run typecheck
npm test
```
