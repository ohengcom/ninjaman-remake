import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity.js';
import {
  BOSS_CONFIG,
  COLORS,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';

type BossState = 'idle' | 'chase' | 'attack' | 'dash';
type BossPhase = 1 | 2 | 3;

/**
 * Endgame boss with three escalating phases:
 *   - Phase 1 (HP > 66%): walk and slash on contact.
 *   - Phase 2 (33% < HP <= 66%): adds a fast horizontal dash attack.
 *   - Phase 3 (HP <= 33%): adds a shuriken volley callback so the GameScene
 *     can spawn projectiles aimed at the player.
 *
 * Boss scenes commonly suffer from "AI tick drift" - we keep this clean by
 * only switching state at well-defined cooldown boundaries.
 */
export class Boss extends BaseEntity {
  private target?: Phaser.GameObjects.Sprite;
  private bossState: BossState = 'idle';
  private nextAttackAt = 0;
  private nextDashAt = 0;
  private nextVolleyAt = 0;
  private animTimer = 0;
  private runFrameToggle = false;
  private dashing = false;
  private dashEndAt = 0;

  public onMeleeHit?: (boss: Boss, dmg: number) => void;
  public onVolley?: (boss: Boss) => void;
  public onDeath?: (boss: Boss) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.BOSS_IDLE, BOSS_CONFIG.MAX_HEALTH);
    this.setCollideWorldBounds(true);
    this.setSize(BOSS_CONFIG.HITBOX.width, BOSS_CONFIG.HITBOX.height);
    this.setOffset(BOSS_CONFIG.HITBOX.offsetX, BOSS_CONFIG.HITBOX.offsetY);
    this.setOrigin(0.5, 0.5);
    this.setMaxVelocity(BOSS_CONFIG.DASH_SPEED, 1500);
    this.setDepth(11);

    // Slight bobbing entrance pulse
    scene.tweens.add({
      targets: this,
      scale: 1.02,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Initial cooldowns staggered so the boss doesn't open with a dash.
    this.nextAttackAt = scene.time.now + 1200;
    this.nextDashAt = scene.time.now + 4000;
    this.nextVolleyAt = scene.time.now + 6000;
  }

  public setTarget(t: Phaser.GameObjects.Sprite): void {
    this.target = t;
  }

  public getPhase(): BossPhase {
    const pct = this.getHealthPct();
    if (pct > 0.66) return 1;
    if (pct > 0.33) return 2;
    return 3;
  }

  public update(_time: number, deltaMs: number): void {
    if (this.isDead || !this.target) return;
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const now = this.scene.time.now;
    const phase = this.getPhase();

    if (this.dashing) {
      if (now >= this.dashEndAt) {
        this.dashing = false;
        body.setVelocityX(0);
        this.bossState = 'chase';
      }
    } else if (dist < BOSS_CONFIG.ATTACK_RANGE && Math.abs(dy) < 110) {
      this.bossState = 'attack';
      body.setVelocityX(0);
      this.setFlipX(dx < 0);
      if (now >= this.nextAttackAt) {
        this.beginMelee();
        this.nextAttackAt = now + BOSS_CONFIG.ATTACK_COOLDOWN_MS;
      }
    } else if (dist < BOSS_CONFIG.AGGRO_RANGE) {
      // Phase 2+ may switch to dash if cooldown ready
      if (phase >= 2 && now >= this.nextDashAt && Math.abs(dy) < 90) {
        this.beginDash(dx);
        this.nextDashAt = now + BOSS_CONFIG.DASH_COOLDOWN_MS;
      } else {
        this.bossState = 'chase';
        const dir = dx < 0 ? -1 : 1;
        body.setVelocityX(BOSS_CONFIG.SPEED * dir);
        this.setFlipX(dir < 0);
      }

      // Phase 3 volley
      if (phase === 3 && now >= this.nextVolleyAt) {
        this.nextVolleyAt = now + BOSS_CONFIG.VOLLEY_COOLDOWN_MS;
        if (this.onVolley) this.onVolley(this);
      }
    } else {
      this.bossState = 'idle';
      body.setVelocityX(0);
    }

    this.animTimer += deltaMs;
    this.advanceAnimation();
  }

  private beginMelee(): void {
    this.bossState = 'attack';
    if (this.onMeleeHit) this.onMeleeHit(this, BOSS_CONFIG.ATTACK_DAMAGE);
  }

  private beginDash(dx: number): void {
    this.dashing = true;
    this.bossState = 'dash';
    const dir = dx < 0 ? -1 : 1;
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) body.setVelocityX(BOSS_CONFIG.DASH_SPEED * dir);
    this.setFlipX(dir < 0);
    this.dashEndAt = this.scene.time.now + 700;
    if (this.onMeleeHit) {
      // Hand off contact damage check to scene every dash impact
      this.onMeleeHit(this, BOSS_CONFIG.DASH_DAMAGE);
    }
  }

  private advanceAnimation(): void {
    let key: string = TEXTURE_KEYS.BOSS_IDLE;
    switch (this.bossState) {
      case 'idle':
        key = TEXTURE_KEYS.BOSS_IDLE;
        break;
      case 'chase': {
        if (this.animTimer > 140) {
          this.animTimer = 0;
          this.runFrameToggle = !this.runFrameToggle;
        }
        key = this.runFrameToggle ? TEXTURE_KEYS.BOSS_RUN_2 : TEXTURE_KEYS.BOSS_RUN_1;
        break;
      }
      case 'attack':
        key = TEXTURE_KEYS.BOSS_ATTACK;
        break;
      case 'dash':
        key = TEXTURE_KEYS.BOSS_DASH;
        break;
    }
    if (this.texture.key !== key && this.scene.textures.exists(key)) {
      this.setTexture(key);
    }
  }

  public takeDamage(amount: number, invulnerabilityMs = 120): boolean {
    const took = super.takeDamage(amount, invulnerabilityMs);
    if (took) {
      try {
        if (this.scene.cache.audio.exists(SOUND_KEYS.ENEMY_HIT)) {
          this.scene.sound.play(SOUND_KEYS.ENEMY_HIT, { volume: 0.5 });
        }
      } catch {
        /* swallow */
      }
      // Subtle stagger
      const body = this.body as Phaser.Physics.Arcade.Body | null;
      if (body && this.target) {
        const dir = this.x < this.target.x ? -1 : 1;
        body.setVelocityX(60 * dir);
      }
    }
    return took;
  }

  protected die(): void {
    super.die();
    // Big death flash
    this.scene.cameras.main.flash(500, 233, 69, 96);
    if (this.onDeath) this.onDeath(this);
  }

  public getColor(): number {
    return COLORS.BOSS_HEALTH_FILL;
  }
}
