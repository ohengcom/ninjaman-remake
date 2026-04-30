import Phaser from 'phaser';
import { PICKUP_CONFIG, TEXTURE_KEYS } from '../utils/constants.js';

export type PickupKind = 'coin' | 'dango' | 'shuriken';

/**
 * Floating collectable. Once the player gets close enough it homes toward
 * them (magnet behaviour) before being consumed by the GameScene's overlap
 * handler.
 */
export class Pickup extends Phaser.Physics.Arcade.Sprite {
  public readonly kind: PickupKind;
  private homeY: number;
  private bobTween?: Phaser.Tweens.Tween;
  private collected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PickupKind) {
    const tex =
      kind === 'coin'
        ? TEXTURE_KEYS.COIN
        : kind === 'dango'
          ? TEXTURE_KEYS.DANGO
          : TEXTURE_KEYS.SHURIKEN;
    super(scene, x, y, tex);
    this.kind = kind;
    this.homeY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(this.width, this.height);
    body.setImmovable(true);

    this.setDepth(8);

    // Idle bob
    this.bobTween = scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    if (kind === 'coin') {
      // Slow spin via scaleX wiggle to imply rotation
      scene.tweens.add({
        targets: this,
        scaleX: 0.6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (kind === 'shuriken') {
      scene.tweens.add({
        targets: this,
        rotation: Math.PI * 2,
        duration: 1800,
        repeat: -1,
        ease: 'Linear',
      });
    }
  }

  /** Pull toward the player when within MAGNET_RANGE. */
  public attractToward(px: number, py: number): void {
    if (this.collected) return;
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > PICKUP_CONFIG.MAGNET_RANGE) return;

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    if (this.bobTween && this.bobTween.isPlaying()) {
      this.bobTween.stop();
    }

    const t = 1 - dist / PICKUP_CONFIG.MAGNET_RANGE;
    body.setVelocityX((dx / dist) * PICKUP_CONFIG.MAGNET_PULL * t);
    body.setVelocityY((dy / dist) * PICKUP_CONFIG.MAGNET_PULL * t);
  }

  /** Mark as collected so we ignore double-fires while waiting for destroy. */
  public markCollected(): void {
    this.collected = true;
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public getHomeY(): number {
    return this.homeY;
  }
}
