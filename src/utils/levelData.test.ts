import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from './constants.js';
import { LEVEL_ONE } from './levelData.js';

describe('LEVEL_ONE', () => {
  it('matches the configured level width', () => {
    expect(LEVEL_ONE.width).toBe(GAME_CONFIG.LEVEL_WIDTH);
  });

  it('places the spawn inside the level bounds', () => {
    expect(LEVEL_ONE.spawn.x).toBeGreaterThan(0);
    expect(LEVEL_ONE.spawn.x).toBeLessThan(LEVEL_ONE.width);
    expect(LEVEL_ONE.spawn.y).toBeGreaterThan(0);
    expect(LEVEL_ONE.spawn.y).toBeLessThan(GAME_CONFIG.HEIGHT);
  });

  it('places the goal near the right edge of the level', () => {
    expect(LEVEL_ONE.goalX).toBeGreaterThan(LEVEL_ONE.width / 2);
    expect(LEVEL_ONE.goalX).toBeLessThanOrEqual(LEVEL_ONE.width);
  });

  it('all platforms are inside the level horizontally', () => {
    for (const p of LEVEL_ONE.platforms) {
      expect(p.x - p.width / 2).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width / 2).toBeLessThanOrEqual(LEVEL_ONE.width);
      expect(p.width).toBeGreaterThan(0);
    }
  });

  it('all platforms sit above the ground line', () => {
    for (const p of LEVEL_ONE.platforms) {
      expect(p.y).toBeLessThan(LEVEL_ONE.groundY);
      expect(p.y).toBeGreaterThan(0);
    }
  });

  it('spawns at least one enemy', () => {
    expect(LEVEL_ONE.enemies.length).toBeGreaterThan(0);
  });

  it('all enemies spawn inside the level on the ground', () => {
    for (const e of LEVEL_ONE.enemies) {
      expect(e.x).toBeGreaterThan(0);
      expect(e.x).toBeLessThan(LEVEL_ONE.width);
      expect(e.y).toBeLessThan(GAME_CONFIG.HEIGHT);
    }
  });
});
