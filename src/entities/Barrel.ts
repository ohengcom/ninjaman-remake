import Phaser from 'phaser';
import { BARREL_CONFIG, TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Static breakable wooden barrel. Player attacks chip away its HP and a
 * destruction emits a callback so GameScene can spawn a pickup.
 */
export class Barrel extends Phaser.Physics.Arcade.Sprite {
  private hp = BARREL_CONFIG.HEALTH;
  private isBroken = false;
  public onBreak?: (b: Barrel) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.BARREL);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
    // Scale HD JPG (~1024px) down to gameplay size.
    this.setDisplaySize(BARREL_CONFIG.WIDTH, BARREL_CONFIG.HEIGHT);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(BARREL_CONFIG.WIDTH, BARREL_CONFIG.HEIGHT);
    body.setOffset(0, 0);
    // Re-sync the static body to the sprite position after origin change.
    body.updateFromGameObject();

    this.setDepth(5);
  }

  public hit(damage: number): boolean {
    if (this.isBroken) return false;
    this.hp -= damage;
    // Shake on hit
    this.scene.tweens.add({
      targets: this,
      x: this.x - 4,
      duration: 50,
      yoyo: true,
      onComplete: () => this.setX(this.x + 4),
    });
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => this.clearTint());

    if (this.hp <= 0) this.break();
    return true;
  }

  private break(): void {
    if (this.isBroken) return;
    this.isBroken = true;
    if (this.onBreak) this.onBreak(this);
    // Visual break: scatter a few wooden chips
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0.6,
      duration: 180,
      onComplete: () => this.destroy(),
    });
  }

  public getIsBroken(): boolean {
    return this.isBroken;
  }
}
