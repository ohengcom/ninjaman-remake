import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity.js';

export class Enemy extends BaseEntity {
  private target?: Phaser.GameObjects.Components.Transform;
  private speed: number = 80;
  private attackRange: number = 50;
  private lastAttackTime: number = 0;
  private attackCooldown: number = 1500;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string) {
    super(scene, x, y, `${type}_0`);
    
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this.setSize(40, 60);
    this.setOffset(12, 4);

    this.createAnimations(type);
  }

  private createAnimations(type: string): void {
    const anims = this.scene.anims;

    if (!anims.exists(`${type}_idle`)) {
      anims.create({
        key: `${type}_idle`,
        frames: [0, 1, 2, 3].map(f => ({ key: `${type}_${f}` })),
        frameRate: 8,
        repeat: -1,
      });

      anims.create({
        key: `${type}_run`,
        frames: [30, 31, 32, 33, 34, 35, 36, 37, 38].map(f => ({ key: `${type}_${f}` })),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  public setTarget(target: Phaser.GameObjects.Components.Transform): void {
    this.target = target;
  }

  public update(): void {
    if (!this.target || !this.body) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, (this.target as any).x, (this.target as any).y);

    if (distance < 300 && distance > this.attackRange) {
      // Move towards target
      if ((this.target as any).x < this.x) {
        this.setVelocityX(-this.speed);
        this.setFlipX(true);
      } else {
        this.setVelocityX(this.speed);
        this.setFlipX(false);
      }
      this.play(`${this.texture.key.split('_')[0]}_run`, true);
    } else if (distance <= this.attackRange) {
      this.setVelocityX(0);
      this.play(`${this.texture.key.split('_')[0]}_idle`, true);
      this.tryAttack();
    } else {
      this.setVelocityX(0);
      this.play(`${this.texture.key.split('_')[0]}_idle`, true);
    }
  }

  private tryAttack(): void {
    const now = this.scene.time.now;
    if (now - this.lastAttackTime > this.attackCooldown) {
      this.lastAttackTime = now;
      // Attack logic could go here (e.g. animation, damage overlap check)
    }
  }
}
