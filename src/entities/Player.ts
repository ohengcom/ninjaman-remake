import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity.js';
import {
  PLAYER_CONFIG,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';

export type PlayerState = 'idle' | 'run' | 'jump' | 'attack' | 'defend' | 'hurt';

export class Player extends BaseEntity {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;

  private state: PlayerState = 'idle';
  private isAttacking = false;
  private attackEndTime = 0;
  private nextAttackAvailable = 0;
  private isDefending = false;

  private animTimer = 0;
  private runFrameToggle = false;
  private attackFrameToggle = false;

  // External listeners can subscribe to these.
  public onAttackHitbox?: (
    rect: Phaser.Geom.Rectangle,
    facing: 1 | -1,
  ) => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.NINJA_IDLE, PLAYER_CONFIG.MAX_HEALTH);

    this.setCollideWorldBounds(true);
    this.setSize(
      PLAYER_CONFIG.HITBOX.width,
      PLAYER_CONFIG.HITBOX.height,
    );
    this.setOffset(
      PLAYER_CONFIG.HITBOX.offsetX,
      PLAYER_CONFIG.HITBOX.offsetY,
    );
    this.setOrigin(0.5, 0.5);
    this.setMaxVelocity(PLAYER_CONFIG.SPEED, 1500);

    this.setupInput();
  }

  private setupInput(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) throw new Error('Keyboard input not available');
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyJ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = kb.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  public update(_time: number, deltaMs: number): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    const onGround = body.blocked.down || body.touching.down;
    const now = this.scene.time.now;

    // End attack window
    if (this.isAttacking && now >= this.attackEndTime) {
      this.isAttacking = false;
    }

    // Defend
    const wantDefend = this.keyK.isDown;
    if (wantDefend && !this.isAttacking) {
      this.isDefending = true;
      body.setVelocityX(0);
      this.applyState('defend');
      this.animTimer += deltaMs;
      return;
    } else {
      this.isDefending = false;
    }

    // Movement input
    const left = this.cursors.left?.isDown || this.keyA.isDown;
    const right = this.cursors.right?.isDown || this.keyD.isDown;
    const jump = this.cursors.up?.isDown || this.keyW.isDown || this.cursors.space?.isDown;

    if (!this.isAttacking) {
      if (left) {
        body.setVelocityX(-PLAYER_CONFIG.SPEED);
        this.setFlipX(true);
      } else if (right) {
        body.setVelocityX(PLAYER_CONFIG.SPEED);
        this.setFlipX(false);
      } else {
        body.setVelocityX(0);
      }

      if (jump && onGround) {
        body.setVelocityY(PLAYER_CONFIG.JUMP_FORCE);
        this.scene.sound.play(SOUND_KEYS.JUMP, { volume: 0.4 });
      }
    } else {
      // While attacking, kill horizontal momentum on ground
      if (onGround) body.setVelocityX(0);
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.keyJ) && now >= this.nextAttackAvailable && !this.isAttacking) {
      this.beginAttack(now);
    }

    // Resolve display state
    if (this.isAttacking) {
      this.applyState('attack');
    } else if (!onGround) {
      this.applyState('jump');
    } else if (Math.abs(body.velocity.x) > 5) {
      this.applyState('run');
    } else {
      this.applyState('idle');
    }

    this.animTimer += deltaMs;
    this.advanceAnimation();
  }

  private beginAttack(now: number): void {
    this.isAttacking = true;
    this.attackEndTime = now + PLAYER_CONFIG.ATTACK_COOLDOWN_MS;
    this.nextAttackAvailable = now + PLAYER_CONFIG.ATTACK_COOLDOWN_MS + 80;
    this.animTimer = 0;
    this.attackFrameToggle = false;
    this.scene.sound.play(SOUND_KEYS.ATTACK, { volume: 0.55 });

    // Emit attack hitbox
    if (this.onAttackHitbox) {
      const facing: 1 | -1 = this.flipX ? -1 : 1;
      const range = PLAYER_CONFIG.ATTACK_RANGE;
      const rect = new Phaser.Geom.Rectangle(
        facing === 1 ? this.x : this.x - range,
        this.y - 50,
        range,
        90,
      );
      this.onAttackHitbox(rect, facing);
    }
  }

  private applyState(next: PlayerState): void {
    if (this.state !== next) {
      this.state = next;
      this.animTimer = 0;
    }
  }

  private advanceAnimation(): void {
    switch (this.state) {
      case 'idle':
        if (this.texture.key !== TEXTURE_KEYS.NINJA_IDLE) {
          this.setTexture(TEXTURE_KEYS.NINJA_IDLE);
        }
        break;
      case 'run': {
        if (this.animTimer > 110) {
          this.animTimer = 0;
          this.runFrameToggle = !this.runFrameToggle;
        }
        const k = this.runFrameToggle ? TEXTURE_KEYS.NINJA_RUN_2 : TEXTURE_KEYS.NINJA_RUN_1;
        if (this.texture.key !== k) this.setTexture(k);
        break;
      }
      case 'jump':
        if (this.texture.key !== TEXTURE_KEYS.NINJA_JUMP) {
          this.setTexture(TEXTURE_KEYS.NINJA_JUMP);
        }
        break;
      case 'attack': {
        if (this.animTimer > 90) {
          this.animTimer = 0;
          this.attackFrameToggle = !this.attackFrameToggle;
        }
        const k = this.attackFrameToggle
          ? TEXTURE_KEYS.NINJA_ATTACK_2
          : TEXTURE_KEYS.NINJA_ATTACK_1;
        if (this.texture.key !== k) this.setTexture(k);
        break;
      }
      case 'defend':
        if (this.texture.key !== TEXTURE_KEYS.NINJA_DEFEND) {
          this.setTexture(TEXTURE_KEYS.NINJA_DEFEND);
        }
        break;
      case 'hurt':
        if (this.texture.key !== TEXTURE_KEYS.NINJA_IDLE) {
          this.setTexture(TEXTURE_KEYS.NINJA_IDLE);
        }
        break;
    }
  }

  public takeDamage(amount: number, invulnerabilityMs?: number): boolean {
    // Defending halves damage
    const final = this.isDefending ? Math.ceil(amount * 0.25) : amount;
    const took = super.takeDamage(
      final,
      invulnerabilityMs ?? PLAYER_CONFIG.INVULNERABILITY_MS,
    );
    if (took) {
      this.scene.sound.play(SOUND_KEYS.PLAYER_HURT, { volume: 0.4 });
      // Knockback
      const body = this.body as Phaser.Physics.Arcade.Body | null;
      if (body) {
        body.setVelocityY(-220);
        body.setVelocityX(this.flipX ? 180 : -180);
      }
      this.scene.cameras.main.shake(120, 0.006);
    }
    return took;
  }

  public getIsAttacking(): boolean {
    return this.isAttacking;
  }

  public getIsDefending(): boolean {
    return this.isDefending;
  }

  public getFacing(): 1 | -1 {
    return this.flipX ? -1 : 1;
  }
}
