import { describe, expect, it } from 'vitest';
import {
  COLORS,
  ENEMY_CONFIG,
  GAME_CONFIG,
  PLAYER_CONFIG,
  SCENE_KEYS,
} from './constants.js';

describe('GAME_CONFIG', () => {
  it('uses a 16:9 base resolution', () => {
    expect(GAME_CONFIG.WIDTH / GAME_CONFIG.HEIGHT).toBeCloseTo(16 / 9, 2);
  });

  it('places the ground inside the visible area', () => {
    expect(GAME_CONFIG.GROUND_Y).toBeGreaterThan(0);
    expect(GAME_CONFIG.GROUND_Y).toBeLessThan(GAME_CONFIG.HEIGHT);
  });

  it('has a level wider than the viewport', () => {
    expect(GAME_CONFIG.LEVEL_WIDTH).toBeGreaterThan(GAME_CONFIG.WIDTH);
  });

  it('uses positive gravity', () => {
    expect(GAME_CONFIG.PHYSICS.GRAVITY).toBeGreaterThan(0);
  });
});

describe('PLAYER_CONFIG', () => {
  it('has positive movement values', () => {
    expect(PLAYER_CONFIG.SPEED).toBeGreaterThan(0);
    expect(PLAYER_CONFIG.MAX_HEALTH).toBeGreaterThan(0);
    expect(PLAYER_CONFIG.STARTING_LIVES).toBeGreaterThan(0);
  });

  it('uses a negative jump force (upward in Phaser physics)', () => {
    expect(PLAYER_CONFIG.JUMP_FORCE).toBeLessThan(0);
  });

  it('attack range exceeds the hitbox width to allow striking enemies', () => {
    expect(PLAYER_CONFIG.ATTACK_RANGE).toBeGreaterThan(PLAYER_CONFIG.HITBOX.width);
  });
});

describe('ENEMY_CONFIG', () => {
  it('aggro range is greater than attack range', () => {
    expect(ENEMY_CONFIG.AGGRO_RANGE).toBeGreaterThan(ENEMY_CONFIG.ATTACK_RANGE);
  });

  it('enemy is slower than player to keep gameplay fair', () => {
    expect(ENEMY_CONFIG.SPEED).toBeLessThan(PLAYER_CONFIG.SPEED);
  });
});

describe('SCENE_KEYS', () => {
  it('has unique scene keys', () => {
    const keys = Object.values(SCENE_KEYS);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('COLORS', () => {
  it('exposes hex strings beginning with #', () => {
    expect(COLORS.PRIMARY_HEX).toMatch(/^#[0-9a-f]{6}$/i);
    expect(COLORS.DARK_HEX).toMatch(/^#[0-9a-f]{6}$/i);
    expect(COLORS.LIGHT_HEX).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('numeric and hex variants of the same color are consistent', () => {
    const numericAsHex = '#' + COLORS.PRIMARY.toString(16).padStart(6, '0');
    expect(numericAsHex.toLowerCase()).toBe(COLORS.PRIMARY_HEX.toLowerCase());
  });
});
