import Phaser from 'phaser';

export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  PHYSICS: {
    MATTER_GRAVITY_Y: 1,
    DEBUG: false,
  },
} as const;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'phaser-game-canvas-container',
  backgroundColor: '#f5f7fa',
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    powerPreference: 'high-performance',
  },
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
      gravity: { x: 0, y: GAME_CONFIG.PHYSICS.MATTER_GRAVITY_Y },
      debug: GAME_CONFIG.PHYSICS.DEBUG,
    },
  },
};
