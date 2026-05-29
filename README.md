# Ninja Man Remake

A modern, high-definition action-platformer remake built with Phaser 4, TypeScript, and Vite. This project uses high-quality raster images, procedural animation, responsive scaling, keyboard controls, and gamepad support.

## Features

- **Procedural Animation System**: Characters breathe, sway, squash, stretch, and react dynamically via code.
- **Macaron Aesthetic & Visual Feedback**: Dynamic glowing masks, red flashes on hurt, blue on perfect block.
- **Advanced Combat System**: 
  - **4-Hit Combos**: Timing-based combos with escalating damage.
  - **Wave Attack**: Special single button energy wave.
  - **Directional Attacks**: Launcher/Uppercut (`W + J`) and Dive Attacks (`S + J` in the air).
  - **Action Input Buffer**: Buffers jumps, attacks, dashes, and waves for up to 150ms to fire immediately after hitstuns or recoveries.
- **Fluid Movement**: Double jumping, Coyote time, an invincible horizontal Dash, and **One-Way Semisolid Platforms** (jump through from below or drop through with `S + Space`).
- **Parry System**: Hold `K` to defend. Perfect blocks mitigate damage, prevent knockback, and award bonus points.
- **Intelligent Patrol AI**: Enemies utilize Matter.js downward and forward Raycasting queries to detect cliffs and obstacle walls to automatically turn around.
- **Interactive Physics Props**: Procedurally rendered wooden crates and metal barrels that can be pushed, slide realistically, and shatter upon receiving damage. Shattering spawns 4-6 dynamic flying debris blocks with gravity/impulses and deals splash area damage to nearby enemies.
- **Impact VFX Juice**: Screenshake, particle bursts, afterimage ghost trails during dashes/combos, and elastic camera zoom during hitstops.
- **Multi-stage Progression**:
  - Sector 1: Mystical Forest
  - Sector 2: Beach Ruins
  - Sector 3: Castle Courtyard (Boss Fight)
- **Diverse Enemy AI**: Guards, Axe Brutes, Ninjas, and a massive Core Guardian Boss.

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
```
