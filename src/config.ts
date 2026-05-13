import Phaser from 'phaser';

export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  PHYSICS: {
    GRAVITY: 1200,
    DEBUG: false,
  },
} as const;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  pixelArt: false, // We use vector art now
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GAME_CONFIG.PHYSICS.GRAVITY },
      debug: GAME_CONFIG.PHYSICS.DEBUG,
    },
  },
};