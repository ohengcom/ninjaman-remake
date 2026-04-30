import Phaser from 'phaser';

export abstract class BaseEntity extends Phaser.Physics.Arcade.Sprite {
  protected maxHealth: number;
  protected currentHealth: number;
  protected isDead = false;
  protected invulnerableUntil = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    maxHealth: number,
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }

  public getHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getHealthPct(): number {
    return Phaser.Math.Clamp(this.currentHealth / this.maxHealth, 0, 1);
  }

  public takeDamage(amount: number, invulnerabilityMs = 0): boolean {
    if (this.isDead) return false;
    if (this.scene.time.now < this.invulnerableUntil) return false;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.invulnerableUntil = this.scene.time.now + invulnerabilityMs;

    // Hit flash
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (!this.scene) return;
      this.clearTint();
      this.setTint(0xffaaaa);
      this.scene.time.delayedCall(120, () => this.clearTint());
    });

    if (this.currentHealth <= 0) {
      this.die();
    }
    return true;
  }

  protected die(): void {
    this.isDead = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 250,
      onComplete: () => this.destroy(),
    });
  }

  public getIsDead(): boolean {
    return this.isDead;
  }
}
