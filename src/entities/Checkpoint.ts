import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Stone lantern checkpoint. Activates on overlap, glowing afterwards. The
 * GameScene reads its position to set the player respawn point and triggers
 * a "Checkpoint!" toast through the Fx helper.
 */
export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
  public readonly label: string;
  private activated = false;

  constructor(scene: Phaser.Scene, x: number, y: number, label: string) {
    super(scene, x, y, TEXTURE_KEYS.CHECKPOINT_OFF);
    this.label = label;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(72, 110);
    this.setDepth(2);
  }

  public activate(): boolean {
    if (this.activated) return false;
    this.activated = true;
    this.setTexture(TEXTURE_KEYS.CHECKPOINT_ON);
    // Glowing pulse
    this.scene.tweens.add({
      targets: this,
      scale: 1.08,
      duration: 360,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
    });
    return true;
  }

  public isActivated(): boolean {
    return this.activated;
  }
}
