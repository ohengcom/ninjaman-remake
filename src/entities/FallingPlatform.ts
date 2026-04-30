import Phaser from 'phaser';
import { PLATFORM_CONFIG, TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Static platform that crumbles {@link PLATFORM_CONFIG.FALL_DELAY_MS} after
 * the first contact. After {@link PLATFORM_CONFIG.FALL_RESPAWN_MS} it
 * respawns, ready to be triggered again.
 */
export class FallingPlatform extends Phaser.Physics.Arcade.Sprite {
  private armed = true;
  private homeX: number;
  private homeY: number;
  private platformWidth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y, TEXTURE_KEYS.TILE_PLATFORM);
    this.homeX = x;
    this.homeY = y;
    this.platformWidth = width;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 0.5);
    this.setDisplaySize(width, 28);
    this.setDepth(-5);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, 18);
    body.setOffset(0, 4);
    body.updateFromGameObject();

    this.setTint(0xb88a4a);
  }

  /** Trigger the fall sequence. Idempotent within a single contact cycle. */
  public touch(): void {
    if (!this.armed) return;
    this.armed = false;
    // Pre-fall shake
    this.scene.tweens.add({
      targets: this,
      x: this.homeX - 4,
      duration: 60,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.beginFall(),
    });
  }

  private beginFall(): void {
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = false;
    this.scene.physics.add.existing(this);
    const dynBody = this.body as Phaser.Physics.Arcade.Body;
    dynBody.setAllowGravity(true);
    dynBody.setVelocityY(80);

    this.scene.time.delayedCall(800, () => {
      this.setVisible(false);
      this.scene.time.delayedCall(PLATFORM_CONFIG.FALL_RESPAWN_MS, () => this.respawn());
    });
  }

  private respawn(): void {
    if (!this.scene) return;
    // Recreate as static at home position
    this.setPosition(this.homeX, this.homeY);
    this.setVisible(true);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 250,
    });
    // Convert back to static
    if (this.body) (this.body as Phaser.Physics.Arcade.Body).destroy?.();
    this.scene.physics.add.existing(this, true);
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(this.platformWidth, 18);
    body.setOffset(0, 4);
    body.updateFromGameObject();
    this.armed = true;
  }
}
