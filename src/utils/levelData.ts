import { GAME_CONFIG } from './constants.js';

export interface PlatformData {
  x: number;
  y: number;
  width: number;
}

export interface EnemySpawn {
  x: number;
  y: number;
}

export interface LevelData {
  name: string;
  width: number;
  groundY: number;
  spawn: { x: number; y: number };
  platforms: PlatformData[];
  enemies: EnemySpawn[];
  goalX: number;
}

const G = GAME_CONFIG.GROUND_Y;

export const LEVEL_ONE: LevelData = {
  name: 'The Outer Path',
  width: GAME_CONFIG.LEVEL_WIDTH,
  groundY: G,
  spawn: { x: 120, y: G - 100 },
  platforms: [
    { x: 600, y: G - 140, width: 220 },
    { x: 980, y: G - 240, width: 200 },
    { x: 1380, y: G - 160, width: 240 },
    { x: 1900, y: G - 280, width: 200 },
    { x: 2300, y: G - 180, width: 220 },
    { x: 2800, y: G - 260, width: 200 },
    { x: 3280, y: G - 160, width: 240 },
    { x: 3800, y: G - 240, width: 200 },
    { x: 4280, y: G - 180, width: 220 },
    { x: 4800, y: G - 280, width: 220 },
    { x: 5300, y: G - 200, width: 240 },
    { x: 5800, y: G - 260, width: 220 },
  ],
  enemies: [
    { x: 900, y: G - 60 },
    { x: 1500, y: G - 60 },
    { x: 2150, y: G - 60 },
    { x: 2700, y: G - 60 },
    { x: 3400, y: G - 60 },
    { x: 4000, y: G - 60 },
    { x: 4600, y: G - 60 },
    { x: 5200, y: G - 60 },
    { x: 5700, y: G - 60 },
    { x: 6100, y: G - 60 },
  ],
  goalX: GAME_CONFIG.LEVEL_WIDTH - 120,
};
