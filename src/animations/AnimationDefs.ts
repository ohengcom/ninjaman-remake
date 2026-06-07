import Phaser from 'phaser';
import { ENEMY_ANIMATIONS, PLAYER_ANIMATIONS, SpriteAnimationDef } from './characterAnimationManifest.js';

function createSpriteAnimation(scene: Phaser.Scene, def: SpriteAnimationDef): void {
  scene.anims.create({
    key: def.key,
    frames: scene.anims.generateFrameNumbers(def.sheet, def.frames),
    frameRate: def.frameRate,
    repeat: def.repeat,
  });
}

/**
 * Register all game animations from the loaded sprite sheets and atlases.
 * Called once from BootScene.create().
 */
export function registerAnimations(scene: Phaser.Scene): void {
  if (scene.anims.exists('player_idle')) return;

  for (const def of [...PLAYER_ANIMATIONS, ...ENEMY_ANIMATIONS]) {
    createSpriteAnimation(scene, def);
  }
}
