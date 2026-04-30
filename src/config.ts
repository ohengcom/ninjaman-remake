import Phaser from 'phaser';
import { GAME_CONFIG } from './utils/constants.js';

export function createGameConfig(scenes: Phaser.Types.Scenes.SceneType[]): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    pixelArt: false,
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
    scene: scenes,
    render: {
      antialias: true,
      antialiasGL: true,
      powerPreference: 'high-performance',
    },
  };
}
