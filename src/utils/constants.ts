export const GAME_CONFIG = {
  WIDTH: 640,
  HEIGHT: 360,
  PHYSICS: {
    GRAVITY: 800,
    DEBUG: false,
  },
} as const;

export const PLAYER_CONFIG = {
  SPEED: 160,
  JUMP_FORCE: -400,
  HEALTH: 100,
  LIVES: 5,
} as const;

export const ENEMY_TYPES = {
  TONFA: 'tonfa',
  KARATE: 'karate',
  AXE: 'axe',
  SHOGUN: 'shogun',
} as const;

export const LEVELS = {
  BEACH: {
    key: 'beach',
    name: 'Beach',
    file: 'beach.xml',
    scrollWidth: 18200,
    spawn: { x: 700, y: 620 },
  },
  FOREST: {
    key: 'forest',
    name: 'Forest',
    file: 'forest.xml',
    scrollWidth: 28200,
    spawn: { x: 350, y: 1000 },
  },
} as const;
