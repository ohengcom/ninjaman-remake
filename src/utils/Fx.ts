import Phaser from 'phaser';
import { COLORS, HIT_STOP_MS, TEXTURE_KEYS } from './constants.js';

/**
 * Lightweight visual feedback helpers used across entities and the game scene.
 *
 * Phaser already gives us particle emitters, tweens, and tints; this module
 * just wraps the common "juice" effects we want to reuse so callers stay
 * focused on game logic rather than effect choreography.
 */
export class Fx {
  /**
   * Brief world freeze on solid hits. Pauses physics and tweens for ~70ms,
   * which dramatically improves "weight" of attacks at almost no cost.
   */
  static hitStop(scene: Phaser.Scene, ms = HIT_STOP_MS): void {
    if (scene.physics.world.isPaused) return;
    scene.physics.world.pause();
    scene.tweens.pauseAll();
    scene.time.delayedCall(ms, () => {
      if (!scene.scene.isActive()) return;
      scene.physics.world.resume();
      scene.tweens.resumeAll();
    });
  }

  /** Small puff of dust under feet on jump / land / slide. */
  static dust(scene: Phaser.Scene, x: number, y: number, qty = 6): void {
    const particles = scene.add
      .particles(x, y, TEXTURE_KEYS.DUST, {
        speed: { min: 60, max: 140 },
        angle: { min: 200, max: 340 },
        scale: { start: 1.0, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 360,
        quantity: qty,
        tint: 0xc7b8a0,
      })
      .setDepth(8);
    scene.time.delayedCall(420, () => particles.destroy());
  }

  /** Bright sparks on weapon impact (white + yellow). */
  static sparks(scene: Phaser.Scene, x: number, y: number, qty = 10): void {
    const particles = scene.add
      .particles(x, y, TEXTURE_KEYS.SPARK, {
        speed: { min: 180, max: 380 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0 },
        lifespan: 280,
        quantity: qty,
        tint: [0xffffff, COLORS.ACCENT, 0xfff5d6],
        blendMode: 'ADD',
      })
      .setDepth(20);
    scene.time.delayedCall(360, () => particles.destroy());
  }

  /** Red blood-like burst on damage. */
  static blood(scene: Phaser.Scene, x: number, y: number, qty = 12): void {
    const particles = scene.add
      .particles(x, y, TEXTURE_KEYS.PARTICLE, {
        speed: { min: 120, max: 260 },
        angle: { min: 200, max: 340 },
        scale: { start: 1.0, end: 0 },
        lifespan: 420,
        quantity: qty,
        tint: [COLORS.PRIMARY, 0xff7a90, 0xc0223c],
      })
      .setDepth(15);
    scene.time.delayedCall(500, () => particles.destroy());
  }

  /** Floating damage / pickup-value text that drifts up and fades. */
  static floatingNumber(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color = COLORS.LIGHT_HEX,
    big = false,
  ): void {
    const t = scene.add
      .text(x, y, text, {
        fontFamily: 'Georgia, serif',
        fontSize: big ? '28px' : '18px',
        color,
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(60);
    scene.tweens.add({
      targets: t,
      y: y - (big ? 80 : 50),
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  /** Quick toast banner near top of camera (e.g. "Checkpoint!"). */
  static toast(scene: Phaser.Scene, msg: string): void {
    const cam = scene.cameras.main;
    const t = scene.add
      .text(cam.width / 2, 80, msg, {
        fontFamily: 'Georgia, serif',
        fontSize: '32px',
        color: COLORS.ACCENT_HEX,
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);
    scene.tweens.add({
      targets: t,
      alpha: 0,
      y: 60,
      duration: 1400,
      ease: 'Sine.easeIn',
      onComplete: () => t.destroy(),
    });
  }
}
