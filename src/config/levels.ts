import { EnemyType } from '../entities/Enemy.js';

export interface LevelConfig {
  id: number;
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
    name: 'CITY SECTOR',
    farBg: 'bg_city_far',
    midBg: 'bg_city_mid',
    mapTiles: 80,
    tileSize: 64,
    hasPlatforms: true,
    platformStartTile: 15,
    platformInterval: 6,
    enemyTypes: ['guard', 'axe', 'ninja', 'sniper'],
    enemyStartX: 1200,
    enemySpacing: [600, 1200],
    isBossLevel: false,
    completionSP: 10,
  },
  {
    id: 2,
    name: 'FOREST SECTOR',
    farBg: 'bg_forest_far',
    midBg: 'bg_forest_mid',
    mapTiles: 80,
    tileSize: 64,
    hasPlatforms: true,
    platformStartTile: 15,
    platformInterval: 6,
    enemyTypes: ['guard', 'axe', 'ninja', 'sniper'],
    enemyStartX: 1200,
    enemySpacing: [600, 1200],
    isBossLevel: false,
    completionSP: 10,
  },
  {
    id: 3,
    name: 'CORE SECTOR',
    farBg: 'bg_core_far',
    midBg: 'bg_core_mid',
    mapTiles: 40,
    tileSize: 64,
    hasPlatforms: false,
    platformStartTile: 0,
    platformInterval: 0,
    enemyTypes: [],
    enemyStartX: 0,
    enemySpacing: [0, 0],
    isBossLevel: true,
    completionSP: 50,
  },
] as const;

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[level - 1] ?? LEVELS[0]!;
}
