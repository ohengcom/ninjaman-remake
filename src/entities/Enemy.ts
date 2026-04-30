import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity.js';
import {
  COLORS,
  ENEMY_CONFIG,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';

type EnemyState = 'idle' | 'chase' | 'attack';
export type EnemyVariant = 'grunt' | 'tough';

/**
 * Patrol/chase ground enemy. The {@link EnemyVariant} scales HP, speed, and
 * tint so we can sprinkle slightly stronger versions late in the level
 * without coding a second class.
 */
export class Enemy extends BaseEntity {
  private target?: Phaser.GameObjects.Sprite;
  private nextAttackAt = 0;
  private enemyAiState: EnemyState = 'idle';
  private animTimer = 0;
  private runFrameToggle = false;
  public readonly variant: EnemyVariant;

  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;

  public onAttackHit?: (enemy: Enemy) => void;
  public onDeath?: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, variant: EnemyVariant = 'grunt') {
    const hp = variant === 'tough' ? ENEMY_CONFIG.MAX_HEALTH * 1.8 : ENEMY_CONFIG.MAX_HEALTH;
    super(scene, x, y, TEXTURE_KEYS.ENEMY_IDLE, hp);
    this.variant = variant;

    this.setCollideWorldBounds(true);
    this.setSize(ENEMY_CONFIG.HITBOX.width, ENEMY_CONFIG.HITBOX.height);
    this.setOffset(ENEMY_CONFIG.HITBOX.offsetX, ENEMY_CONFIG.HITBOX.offsetY);
    this.setOrigin(0.5, 0.5);
    const speed = variant === 'tough' ? ENEMY_CONFIG.SPEED * 1.25 : ENEMY_CONFIG.SPEED;
    this.setMaxVelocity(speed, 1500);

    if (variant === 'tough') {
      this.setTint(0xffaa70);
      this.setScale(1.12);
    }

    this.healthBarBg = scene.add
      .rectangle(x, y - 70, 60, 6, COLORS.HEALTH_BG)
      .setOrigin(0.5)
      .setDepth(50);
    this.healthBarFill = scene.add
      .rectangle(x, y - 70, 60, 6, COLORS.ENEMY_HEALTH_FILL)
      .setOrigin(0.5)
      .setDepth(51);
  }

  public setTarget(target: Phaser.GameObjects.Sprite): void {
    this.target = target;
  }

  public update(_time: number, deltaMs: number): void {
    if (this.isDead) return;

    this.healthBarBg.setPosition(this.x, this.y - 70);
    this.healthBarFill.setPosition(
      this.x - 30 + (this.getHealthPct() * 60) / 2,
      this.y - 70,
    );
    this.healthBarFill.setSize(this.getHealthPct() * 60, 6);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body || !this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const now = this.scene.time.now;
    const speed = this.variant === 'tough' ? ENEMY_CONFIG.SPEED * 1.25 : ENEMY_CONFIG.SPEED;

    if (dist < ENEMY_CONFIG.ATTACK_RANGE && Math.abs(dy) < 80) {
      this.enemyAiState = 'attack';
      body.setVelocityX(0);
      this.setFlipX(dx < 0);
      if (now >= this.nextAttackAt) {
        this.performAttack();
        this.nextAttackAt = now + ENEMY_CONFIG.ATTACK_COOLDOWN_MS;
      }
    } else if (dist < ENEMY_CONFIG.AGGRO_RANGE) {
      this.enemyAiState = 'chase';
      const dir = dx < 0 ? -1 : 1;
      body.setVelocityX(speed * dir);
      this.setFlipX(dir < 0);
    } else {
      this.enemyAiState = 'idle';
      body.setVelocityX(0);
    }

    this.animTimer += deltaMs;
    this.advanceAnimation();
  }

  private advanceAnimation(): void {
    switch (this.enemyAiState) {
      case 'idle':
        if (this.texture.key !== TEXTURE_KEYS.ENEMY_IDLE) {
          this.setTexture(TEXTURE_KEYS.ENEMY_IDLE);
        }
        break;
      case 'chase': {
        if (this.animTimer > 130) {
          this.animTimer = 0;
          this.runFrameToggle = !this.runFrameToggle;
        }
        const k = this.runFrameToggle
          ? TEXTURE_KEYS.ENEMY_RUN_2
          : TEXTURE_KEYS.ENEMY_RUN_1;
        if (this.texture.key !== k) this.setTexture(k);
        break;
      }
      case 'attack':
        if (this.texture.key !== TEXTURE_KEYS.ENEMY_ATTACK) {
          this.setTexture(TEXTURE_KEYS.ENEMY_ATTACK);
        }
        break;
    }
  }

  private performAttack(): void {
    if (this.onAttackHit) this.onAttackHit(this);
  }

  public takeDamage(amount: number, invulnerabilityMs = 200): boolean {
    const took = super.takeDamage(amount, invulnerabilityMs);
    if (took) {
      try {
        if (this.scene.cache.audio.exists(SOUND_KEYS.ENEMY_HIT)) {
          this.scene.sound.play(SOUND_KEYS.ENEMY_HIT, { volume: 0.4 });
        }
      } catch (err) {
        console.warn('[v0] enemy hit sfx failed', err);
      }
      const body = this.body as Phaser.Physics.Arcade.Body | null;
      if (body && this.target) {
        const dir = this.x < this.target.x ? -1 : 1;
        body.setVelocityX(220 * dir);
        body.setVelocityY(-200);
      }
    }
    return took;
  }

  protected die(): void {
    super.die();
    this.healthBarBg.destroy();
    this.healthBarFill.destroy();
    if (this.onDeath) this.onDeath(this);
  }
}
