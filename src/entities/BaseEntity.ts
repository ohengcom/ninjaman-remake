import Phaser from 'phaser';

export class BaseEntity extends Phaser.Physics.Arcade.Sprite {
  protected health: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  protected die(): void {
    this.destroy();
  }
}
