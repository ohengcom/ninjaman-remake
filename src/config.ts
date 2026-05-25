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
  parent: 'phaser-game-canvas-container',
  backgroundColor: '#f5f7fa',
  pixelArt: false, // We use vector art now
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    gamepad: true,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1 },
      debug: GAME_CONFIG.PHYSICS.DEBUG,
    },
  },
};