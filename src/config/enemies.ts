import { EnemyType } from '../entities/Enemy.js';

export interface EnemyStats {
  health: number;
  baseDamage: number;
  moveSpeed: number;
  attackReach: number;
  attackWindup: number;
  attackCooldown: number;
  knockback: number;
}

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  guard: {
    health: 40,
    baseDamage: 10,
    moveSpeed: 40,
    attackReach: 60,
    attackWindup: 500,
    attackCooldown: 800,
    knockback: 150,
  },
  axe: {
    health: 80,
    baseDamage: 25,
    moveSpeed: 25,
    attackReach: 70,
    attackWindup: 800,
    attackCooldown: 1200,
    knockback: 50,
  },
  ninja: {
    health: 25,
    baseDamage: 8,
    moveSpeed: 120,
    attackReach: 50,
    attackWindup: 200,
    attackCooldown: 400,
    knockback: 250,
  },
  sniper: {
    health: 20,
    baseDamage: 15,
    moveSpeed: 0,
    attackReach: 600,
    attackWindup: 1000,
    attackCooldown: 2000,
    knockback: 150,
  },
};

export const BOSS_STATS = {
  health: 300,
  moveSpeed: 150,
  attackReach: 200,
  attackDamage: 30,
  attackWindup: 700,
  attackCooldown: 1000,
  idleDelay: 600,
  engageDistance: 800,
  meleeDistance: 200,
  invulnerabilityDuration: 100,
  damageMultiplier: 0.5,
} as const;
