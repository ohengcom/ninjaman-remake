/**
 * Level data for "The Outer Path" - a multi-zone side-scroller split into
 * three biomes (bamboo forest -> garden courtyard -> castle rooftop) that
 * culminates in a boss arena. Geometry is hand-tuned for jump arcs given
 * PLAYER_CONFIG.SPEED + JUMP_FORCE in constants.ts.
 */

import { GAME_CONFIG } from './constants.js';

export type Zone = 'bamboo' | 'courtyard' | 'castle';

export interface PlatformData {
  x: number;
  y: number;
  width: number;
  /** Static (default), patrols horizontally, or falls after contact. */
  kind?: 'static' | 'moving' | 'falling';
  /** Movement bounds for `kind: 'moving'` platforms. */
  range?: number;
}

export interface WallData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EnemySpawn {
  x: number;
  y: number;
  /** Optional variant; defaults to 'grunt'. Future-proof for ranged enemies. */
  variant?: 'grunt' | 'tough';
}

export interface BarrelSpawn {
  x: number;
  y: number;
}

export interface PickupSpawn {
  x: number;
  y: number;
  kind: 'coin' | 'dango' | 'shuriken';
}

export interface CheckpointSpawn {
  x: number;
  y: number;
  label: string;
}

export interface ZoneRange {
  zone: Zone;
  startX: number;
  endX: number;
}

export interface BossSpawn {
  x: number;
  y: number;
}

export interface LevelData {
  name: string;
  width: number;
  groundY: number;
  spawn: { x: number; y: number };
  zones: ZoneRange[];
  platforms: PlatformData[];
  walls: WallData[];
  enemies: EnemySpawn[];
  barrels: BarrelSpawn[];
  pickups: PickupSpawn[];
  checkpoints: CheckpointSpawn[];
  boss: BossSpawn;
  /** Where the player wins (just past the boss). */
  goalX: number;
}

const G = GAME_CONFIG.GROUND_Y;

export const LEVEL_ONE: LevelData = {
  name: 'The Outer Path',
  width: GAME_CONFIG.LEVEL_WIDTH,
  groundY: G,
  spawn: { x: 120, y: G - 100 },
  zones: [
    { zone: 'bamboo', startX: 0, endX: 2600 },
    { zone: 'courtyard', startX: 2600, endX: 5400 },
    { zone: 'castle', startX: 5400, endX: GAME_CONFIG.LEVEL_WIDTH },
  ],
  platforms: [
    // ===== ZONE 1: bamboo forest (gentle intro) =====
    { x: 600, y: G - 140, width: 220 },
    { x: 980, y: G - 220, width: 200 },
    { x: 1340, y: G - 160, width: 240 },
    { x: 1750, y: G - 250, width: 200 },
    { x: 2150, y: G - 180, width: 220 },
    // ===== ZONE 2: garden courtyard (moving + walls) =====
    { x: 2900, y: G - 220, width: 180, kind: 'moving', range: 200 },
    { x: 3320, y: G - 160, width: 220 },
    { x: 3700, y: G - 280, width: 160, kind: 'falling' },
    { x: 3960, y: G - 280, width: 160, kind: 'falling' },
    { x: 4220, y: G - 280, width: 160, kind: 'falling' },
    { x: 4640, y: G - 200, width: 220, kind: 'moving', range: 160 },
    { x: 5060, y: G - 280, width: 200 },
    // ===== ZONE 3: castle rooftop (climbing arena) =====
    { x: 5560, y: G - 200, width: 240 },
    { x: 5960, y: G - 320, width: 200 },
    { x: 6360, y: G - 240, width: 240 },
    { x: 6800, y: G - 360, width: 220 },
    { x: 7220, y: G - 240, width: 260 },
  ],
  walls: [
    // wall-jump set in courtyard
    { x: 4380, y: G - 360, width: 24, height: 160 },
    { x: 4480, y: G - 360, width: 24, height: 160 },
    // wall-jump set on castle approach
    { x: 6160, y: G - 420, width: 24, height: 220 },
    { x: 6620, y: G - 420, width: 24, height: 220 },
  ],
  enemies: [
    { x: 900, y: G - 60 },
    { x: 1500, y: G - 60 },
    { x: 2050, y: G - 60 },
    { x: 2400, y: G - 60, variant: 'tough' },
    { x: 3100, y: G - 60 },
    { x: 3450, y: G - 60 },
    { x: 4100, y: G - 60, variant: 'tough' },
    { x: 4750, y: G - 60 },
    { x: 5200, y: G - 60 },
    { x: 5700, y: G - 60, variant: 'tough' },
    { x: 6500, y: G - 60 },
    { x: 7050, y: G - 60, variant: 'tough' },
  ],
  barrels: [
    { x: 1200, y: G - 35 },
    { x: 2700, y: G - 35 },
    { x: 3850, y: G - 35 },
    { x: 5400, y: G - 35 },
    { x: 6900, y: G - 35 },
  ],
  pickups: [
    // Coin trail rewarding exploration
    { x: 700, y: G - 200, kind: 'coin' },
    { x: 760, y: G - 200, kind: 'coin' },
    { x: 820, y: G - 200, kind: 'coin' },
    { x: 1050, y: G - 280, kind: 'coin' },
    { x: 1450, y: G - 220, kind: 'dango' },
    { x: 1850, y: G - 310, kind: 'coin' },
    { x: 2200, y: G - 240, kind: 'shuriken' },
    { x: 2950, y: G - 300, kind: 'coin' },
    { x: 3400, y: G - 220, kind: 'coin' },
    { x: 3800, y: G - 340, kind: 'coin' },
    { x: 4060, y: G - 340, kind: 'coin' },
    { x: 4320, y: G - 340, kind: 'coin' },
    { x: 4680, y: G - 260, kind: 'shuriken' },
    { x: 5100, y: G - 340, kind: 'dango' },
    { x: 5600, y: G - 260, kind: 'coin' },
    { x: 6000, y: G - 380, kind: 'coin' },
    { x: 6400, y: G - 300, kind: 'shuriken' },
    { x: 6850, y: G - 420, kind: 'dango' },
    { x: 7250, y: G - 300, kind: 'coin' },
  ],
  checkpoints: [
    { x: 2300, y: G - 50, label: 'Bamboo End' },
    { x: 5200, y: G - 50, label: 'Courtyard End' },
  ],
  boss: { x: 7700, y: G - 80 },
  goalX: GAME_CONFIG.LEVEL_WIDTH - 80,
};
