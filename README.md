# Ninja Man Remake

A modern, high-definition action-platformer remake built with Phaser 4, TypeScript, and Vite. This project abandons legacy assets in favor of high-quality raster images powered by a state-of-the-art **Procedural Animation System** with a premium Macaron-aesthetic filter.

## Features

- **Procedural Animation System**: Characters breathe, sway, squash, stretch, and react dynamically via code.
- **Macaron Aesthetic & Visual Feedback**: Dynamic glowing masks, red flashes on hurt, blue on perfect block.
- **Advanced Combat System**: 
  - **4-Hit Combos**: Timing-based combos with escalating damage.
  - **Wave Attack**: Special single button energy wave.
  - **Directional Attacks**: Launcher/Uppercut (`W + J`) and Dive Attacks (`S + J` in the air).
- **Fluid Movement**: Double jumping, Coyote time, and an invincible horizontal Dash.
- **Parry System**: Hold `K` to defend. Perfect blocks mitigate damage, prevent knockback, and award bonus points.
- **Multi-stage Progression**:
  - Sector 1: Mystical Forest
  - Sector 2: Beach Ruins
  - Sector 3: Castle Courtyard (Boss Fight)
- **Diverse Enemy AI**: Guards, Axe Brutes, Ninjas, and a massive Core Guardian Boss.

## Controls

- `A` / `D`: Run
- `W`: Jump / Double Jump
- `S` (tap): Crouch/Drop
- `K` (hold): Defend/Block (Triggers Parry when hit)
- `DOUBLE TAP A/D`: Invincible Dash
- `J`: Attack (Spam for 4-hit combo)
- `L`: Wave Attack
- `W + J` (on ground): Uppercut (Launcher)
- `S + J` (in air): Dive Attack

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
