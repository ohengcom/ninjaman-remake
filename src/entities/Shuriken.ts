import Phaser from 'phaser';
import { PLAYER_CONFIG, TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Player-thrown projectile. Spins as it travels, dies on world bounds, on
 * lifetime expiry, or after the first enemy hit. Damage is applied externally
 * by GameScene through the {@link onHitEnemy} callback so this class stays
 * decoupled from gameplay rules.
 */
export class Shuriken extends Phaser.Physics.Arcade.Sprite {
  private dieAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number, dir: 1 | -1) {
    super(scene, x, y, TEXTURE_KEYS.SHURIKEN);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(dir * PLAYER_CONFIG.SHURIKEN_SPEED);
    // Slight gravity arc for feel
    body.setVelocityY(-60);
    body.setSize(20, 20);

    this.setDepth(15);
    this.setScale(0.8);
    this.dieAt = scene.time.now + 1500;

    // Spin
    scene.tweens.add({
      targets: this,
      rotation: dir * Math.PI * 4,
      duration: 1500,
      ease: 'Linear',
    });
  }

  public update(time: number): void {
    if (time >= this.dieAt) {
      this.destroy();
      return;
    }
    // Drift from gravity-like effect
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) body.setVelocityY(body.velocity.y + 4);
  }
}
