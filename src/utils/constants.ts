export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  GROUND_Y: 620,
  LEVEL_WIDTH: 6400,
  PHYSICS: {
    GRAVITY: 1500,
    DEBUG: false,
  },
} as const;

export const PLAYER_CONFIG = {
  SPEED: 240,
  JUMP_FORCE: -680,
  MAX_HEALTH: 100,
  STARTING_LIVES: 3,
  ATTACK_DAMAGE: 25,
  ATTACK_RANGE: 90,
  ATTACK_COOLDOWN_MS: 350,
  INVULNERABILITY_MS: 800,
  HITBOX: { width: 44, height: 80, offsetX: 26, offsetY: 16 },
} as const;

export const ENEMY_CONFIG = {
  SPEED: 110,
  MAX_HEALTH: 50,
  ATTACK_DAMAGE: 12,
  ATTACK_RANGE: 60,
  AGGRO_RANGE: 360,
  ATTACK_COOLDOWN_MS: 900,
  HITBOX: { width: 44, height: 80, offsetX: 26, offsetY: 16 },
} as const;

export const COLORS = {
  PRIMARY: 0xe94560,
  PRIMARY_HEX: '#e94560',
  ACCENT: 0xf2b134,
  ACCENT_HEX: '#f2b134',
  DARK: 0x14142b,
  DARK_HEX: '#14142b',
  LIGHT: 0xf6f5f5,
  LIGHT_HEX: '#f6f5f5',
  MUTED: 0x6b6b8d,
  MUTED_HEX: '#6b6b8d',
  HEALTH_BG: 0x331a22,
  HEALTH_FILL: 0xe94560,
  ENEMY_HEALTH_FILL: 0xc94f4f,
} as const;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  GAME: 'GameScene',
  HUD: 'HudScene',
  GAME_OVER: 'GameOverScene',
  WIN: 'WinScene',
} as const;

export const TEXTURE_KEYS = {
  BG_SKY: 'bg-sky',
  BG_MID: 'bg-mid',
  TILE_GROUND: 'tile-ground',
  TILE_PLATFORM: 'tile-platform',
  TITLE_BG: 'title-bg',
  // Procedural ninja frames
  NINJA_IDLE: 'ninja-idle',
  NINJA_RUN_1: 'ninja-run-1',
  NINJA_RUN_2: 'ninja-run-2',
  NINJA_JUMP: 'ninja-jump',
  NINJA_ATTACK_1: 'ninja-attack-1',
  NINJA_ATTACK_2: 'ninja-attack-2',
  NINJA_DEFEND: 'ninja-defend',
  // Procedural enemy frames
  ENEMY_IDLE: 'enemy-idle',
  ENEMY_RUN_1: 'enemy-run-1',
  ENEMY_RUN_2: 'enemy-run-2',
  ENEMY_ATTACK: 'enemy-attack',
  // Effects
  SLASH_FX: 'slash-fx',
  PARTICLE: 'particle',
} as const;

export const SOUND_KEYS = {
  ATTACK: 'sfx-attack',
  JUMP: 'sfx-jump',
  HIT: 'sfx-hit',
  ENEMY_HIT: 'sfx-enemy-hit',
  PLAYER_HURT: 'sfx-player-hurt',
} as const;
