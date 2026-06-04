import { EnemyType } from '../entities/Enemy.js';

export interface LevelConfig {
  id: number;
  /** Level number (1-indexed), used for theming */
  levelNumber: number;
  name: string;
  farBg: string;
  midBg: string;
  mapTiles: number;
  /** Tile size in pixels */
  tileSize: number;
  /** Whether to generate elevated platforms */
  hasPlatforms: boolean;
  /** Platform generation start tile index */
  platformStartTile: number;
  /** Platform generation interval (every N tiles) */
  platformInterval: number;
  /** Enemy types available in this level */
  enemyTypes: EnemyType[];
  /** Minimum X for first enemy spawn */
  enemyStartX: number;
  /** Spacing range between enemies [min, max] */
  enemySpacing: [number, number];
  /** Whether this level has a boss instead of a portal */
  isBossLevel: boolean;
  /** SP reward for completing this level */
  completionSP: number;
}

export const LEVELS: readonly LevelConfig[] = [
  {
    id: 1,
    levelNumber: 1,
    name: 'MYSTICAL FOREST',
    farBg: 'bg_forest',
    midBg: '',
    mapTiles: 48,
    tileSize: 64,
    hasPlatforms: true,
    platformStartTile: 8,
    platformInterval: 7,
    enemyTypes: ['guard', 'ninja'],
    enemyStartX: 520,
    enemySpacing: [260, 420],
    isBossLevel: false,
    completionSP: 10,
  },
  {
    id: 2,
    levelNumber: 2,
    name: 'SERENE BEACH',
    farBg: 'bg_beach',
    midBg: '',
    mapTiles: 80,
    tileSize: 64,
    hasPlatforms: true,
    platformStartTile: 12,
    platformInterval: 5,
    enemyTypes: ['guard', 'axe', 'ninja', 'sniper'],
    enemyStartX: 520,
    enemySpacing: [240, 420],
    isBossLevel: false,
    completionSP: 15,
  },
  {
    id: 3,
    levelNumber: 3,
    name: 'ANCIENT CASTLE',
    farBg: 'bg_castle',
    midBg: '',
    mapTiles: 30,
    tileSize: 64,
    hasPlatforms: true,
    platformStartTile: 5,
    platformInterval: 8,
    enemyTypes: [],
    enemyStartX: 0,
    enemySpacing: [0, 0],
    isBossLevel: true,
    completionSP: 50,
  },
] as const;

export function getLevelConfig(level: number): LevelConfig {
  const index = Math.min(Math.max(Math.floor(level), 1), LEVELS.length) - 1;
  return LEVELS[index]!;
}

export const MAX_LEVEL = LEVELS.length;
