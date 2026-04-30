/**
 * Centralized configuration & string keys for the game.
 *
 * These constants drive movement physics, gameplay tuning, level zones,
 * and the texture / sound / scene cache lookups. Keeping them all here
 * makes it easy to tweak feel without hunting through entity files.
 */

export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  GROUND_Y: 620,
  /** Total horizontal length of the level. */
  LEVEL_WIDTH: 8000,
  PHYSICS: {
    GRAVITY: 1500,
    DEBUG: false,
  },
} as const;

export const PLAYER_CONFIG = {
  SPEED: 260,
  JUMP_FORCE: -700,
  WALL_JUMP_X: 320,
  WALL_JUMP_Y: -620,
  MAX_HEALTH: 100,
  STARTING_LIVES: 3,
  STARTING_SHURIKEN: 5,
  ATTACK_DAMAGE: 22,
  ATTACK_RANGE: 96,
  ATTACK_COOLDOWN_MS: 280,
  /** Window after a hit during which the next J press extends the combo. */
  COMBO_WINDOW_MS: 520,
  /** Damage multiplier per combo hit (hit 1, 2, 3). */
  COMBO_DAMAGE_MULT: [1, 1.15, 1.6] as const,
  COMBO_KNOCKBACK: [180, 220, 360] as const,
  /** Slide and aerial-slam tuning. */
  SLIDE_SPEED: 460,
  SLIDE_DURATION_MS: 380,
  SLIDE_COOLDOWN_MS: 800,
  SLIDE_DAMAGE: 14,
  SLAM_FALL_SPEED: 1100,
  SLAM_AOE_RANGE: 140,
  SLAM_DAMAGE: 28,
  /** Shuriken projectile. */
  SHURIKEN_SPEED: 720,
  SHURIKEN_COOLDOWN_MS: 220,
  SHURIKEN_DAMAGE: 16,
  INVULNERABILITY_MS: 800,
  HITBOX: { width: 44, height: 80, offsetX: 26, offsetY: 16 },
  HITBOX_SLIDE: { width: 56, height: 36, offsetX: 20, offsetY: 60 },
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

export const BOSS_CONFIG = {
  SPEED: 130,
  DASH_SPEED: 460,
  MAX_HEALTH: 320,
  CONTACT_DAMAGE: 18,
  ATTACK_DAMAGE: 22,
  DASH_DAMAGE: 28,
  ATTACK_RANGE: 110,
  AGGRO_RANGE: 1200,
  ATTACK_COOLDOWN_MS: 1100,
  DASH_COOLDOWN_MS: 3500,
  VOLLEY_COOLDOWN_MS: 4200,
  HITBOX: { width: 70, height: 130, offsetX: 41, offsetY: 26 },
} as const;

export const BARREL_CONFIG = {
  HEALTH: 50,
  WIDTH: 56,
  HEIGHT: 70,
  /** Probability that a destroyed barrel drops a heal vs. a coin. */
  DROP_DANGO_CHANCE: 0.35,
} as const;

export const PICKUP_CONFIG = {
  COIN_VALUE: 25,
  DANGO_HEAL: 30,
  SHURIKEN_REFILL: 3,
  MAGNET_RANGE: 110,
  MAGNET_PULL: 480,
} as const;

export const PLATFORM_CONFIG = {
  MOVING_SPEED: 80,
  /** Falling platform delay in ms after first contact. */
  FALL_DELAY_MS: 420,
  FALL_RESPAWN_MS: 3200,
} as const;

/** Hit-stop duration in ms applied on landing damage to enemies/boss. */
export const HIT_STOP_MS = 70;

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
  BOSS_HEALTH_FILL: 0xff3366,
  COIN: 0xf2b134,
  DANGO_PINK: 0xf7a8b8,
  DANGO_WHITE: 0xfaf3e0,
  DANGO_GREEN: 0x9cce6c,
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
  // Backgrounds (one per zone)
  BG_SKY: 'bg-sky',
  BG_BAMBOO: 'bg-bamboo',
  BG_COURTYARD: 'bg-courtyard',
  BG_CASTLE: 'bg-castle',
  BG_MID: 'bg-mid',
  // Tiles
  TILE_GROUND: 'tile-ground',
  TILE_PLATFORM: 'tile-platform',
  TILE_STONE: 'tile-stone',
  TITLE_BG: 'title-bg',
  // Player frames
  NINJA_IDLE: 'ninja-idle',
  NINJA_RUN_1: 'ninja-run-1',
  NINJA_RUN_2: 'ninja-run-2',
  NINJA_JUMP: 'ninja-jump',
  NINJA_FALL: 'ninja-fall',
  NINJA_ATTACK_1: 'ninja-attack-1',
  NINJA_ATTACK_2: 'ninja-attack-2',
  NINJA_ATTACK_3: 'ninja-attack-3',
  NINJA_DEFEND: 'ninja-defend',
  NINJA_SLIDE: 'ninja-slide',
  NINJA_SLAM: 'ninja-slam',
  NINJA_THROW: 'ninja-throw',
  NINJA_WALL: 'ninja-wall',
  // Enemy frames
  ENEMY_IDLE: 'enemy-idle',
  ENEMY_RUN_1: 'enemy-run-1',
  ENEMY_RUN_2: 'enemy-run-2',
  ENEMY_ATTACK: 'enemy-attack',
  // Boss frames
  BOSS_IDLE: 'boss-idle',
  BOSS_RUN_1: 'boss-run-1',
  BOSS_RUN_2: 'boss-run-2',
  BOSS_ATTACK: 'boss-attack',
  BOSS_DASH: 'boss-dash',
  // Props (drawn procedurally to avoid alpha-key issues)
  COIN: 'prop-coin-tex',
  DANGO: 'prop-dango-tex',
  SHURIKEN: 'prop-shuriken-tex',
  BARREL: 'prop-barrel-tex',
  CHECKPOINT_OFF: 'flag-off',
  CHECKPOINT_ON: 'flag-on',
  // Effects
  SLASH_FX: 'slash-fx',
  PARTICLE: 'particle',
  DUST: 'dust',
  SPARK: 'spark',
} as const;

export const SOUND_KEYS = {
  ATTACK: 'sfx-attack',
  JUMP: 'sfx-jump',
  HIT: 'sfx-hit',
  ENEMY_HIT: 'sfx-enemy-hit',
  PLAYER_HURT: 'sfx-player-hurt',
} as const;
