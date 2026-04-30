import Phaser from 'phaser';
import { PLATFORM_CONFIG, TEXTURE_KEYS } from '../utils/constants.js';

/**
 * Horizontally patrolling kinematic platform. Uses an Arcade DYNAMIC body with
 * gravity disabled so the player can ride it (Arcade physics doesn't auto
 * carry passengers, the GameScene update applies a small position delta when
 * the player is grounded on top).
 */
export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  private originX: number;
  private range: number;
  private speed: number;
  private dir: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, range = 200) {
    super(scene, x, y, TEXTURE_KEYS.TILE_PLATFORM);
    this.originX = x;
    this.range = range;
    this.speed = PLATFORM_CONFIG.MOVING_SPEED;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(width, 18);
    body.setOffset(0, 4);

    this.setDisplaySize(width, 28);
    this.setOrigin(0.5, 0.5);
    this.setDepth(-5);
    body.setVelocityX(this.speed);
  }

  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    if (this.x > this.originX + this.range) {
      this.dir = -1;
      body.setVelocityX(-this.speed);
    } else if (this.x < this.originX - this.range) {
      this.dir = 1;
      body.setVelocityX(this.speed);
    }
  }

  public getDeltaX(deltaMs: number): number {
    return this.dir * this.speed * (deltaMs / 1000);
  }
}
