import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity.js';
import {
  PLAYER_CONFIG,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';

export type PlayerState =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'attack'
  | 'defend'
  | 'slide'
  | 'slam'
  | 'throw'
  | 'wall'
  | 'hurt';

/**
 * Player ninja with full action moveset:
 *   - Run + jump + double-jump (1 mid-air jump)
 *   - 3-hit melee combo (J)
 *   - Block (K) reduces incoming damage
 *   - Slide (S+J on ground) for low hitbox + dash damage
 *   - Aerial slam (S+J in air) AOE landing
 *   - Wall jump (jump while sliding against a wall mid-air)
 *   - Shuriken throw (L) consuming ammo
 *
 * Public callbacks let GameScene react without coupling combat rules into
 * this class — Player only knows what *it* did.
 */
export class Player extends BaseEntity {
  // ===== Inputs =====
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keyK!: Phaser.Input.Keyboard.Key;
  private keyL!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  // ===== State =====
  private playerState: PlayerState = 'idle';
  private isAttacking = false;
  private attackEndTime = 0;
  private nextAttackAvailable = 0;
  private isDefending = false;

  // Combo tracking
  private comboIndex = 0;            // 0 = ready, 1..3 = which hit just landed
  private lastComboTime = 0;
  private comboBuffered = false;     // J pressed during recovery -> queue next hit

  // Slide
  private isSliding = false;
  private slideEndAt = 0;
  private nextSlideAt = 0;

  // Slam
  private isSlamming = false;

  // Throw
  private isThrowing = false;
  private throwEndAt = 0;
  private nextShurikenAt = 0;
  private shurikenCount = PLAYER_CONFIG.STARTING_SHURIKEN;

  // Jump
  private jumpsRemaining = 1;        // 1 = double jump available
  private wasOnGround = true;
  private wallSlide: 0 | 1 | -1 = 0; // 0 = none, 1 = right wall, -1 = left wall

  // Animation timing
  private animTimer = 0;
  private runFrameToggle = false;

  // ===== Callbacks for GameScene =====
  public onAttackHitbox?: (rect: Phaser.Geom.Rectangle, comboHit: number, dmg: number) => void;
  public onSlamLanding?: (x: number, y: number, dmg: number, range: number) => void;
  public onSlideHitbox?: (rect: Phaser.Geom.Rectangle, dmg: number) => void;
  public onThrowShuriken?: (x: number, y: number, dir: 1 | -1) => void;
  public onJump?: (x: number, y: number) => void;
  public onLand?: (x: number, y: number, fromHeight: number) => void;
  public onDoubleJump?: (x: number, y: number) => void;

  private peakJumpY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEYS.NINJA_IDLE, PLAYER_CONFIG.MAX_HEALTH);
    this.setCollideWorldBounds(true);
    this.applyStandingHitbox();
    this.setOrigin(0.5, 0.5);
    this.setMaxVelocity(PLAYER_CONFIG.SPEED * 1.8, 1500);
    this.setupInput();
  }

  private applyStandingHitbox(): void {
    this.setSize(PLAYER_CONFIG.HITBOX.width, PLAYER_CONFIG.HITBOX.height);
    this.setOffset(PLAYER_CONFIG.HITBOX.offsetX, PLAYER_CONFIG.HITBOX.offsetY);
  }

  private applySlideHitbox(): void {
    this.setSize(PLAYER_CONFIG.HITBOX_SLIDE.width, PLAYER_CONFIG.HITBOX_SLIDE.height);
    this.setOffset(PLAYER_CONFIG.HITBOX_SLIDE.offsetX, PLAYER_CONFIG.HITBOX_SLIDE.offsetY);
  }

  private setupInput(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) throw new Error('Keyboard input not available');
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyJ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = kb.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.keyL = kb.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    kb.addCapture('UP,DOWN,LEFT,RIGHT,SPACE,W,A,S,D,J,K,L');
  }

  private playSfx(key: string, volume = 0.5): void {
    try {
      if (!this.scene.cache.audio.exists(key)) return;
      this.scene.sound.play(key, { volume });
    } catch (err) {
      console.warn('[v0] sfx play failed for', key, err);
    }
  }

  // =================================================================
  // UPDATE
  // =================================================================
  public update(_time: number, deltaMs: number): void {
    if (this.isDead) return;

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    const onGround = body.blocked.down || body.touching.down;
    const now = this.scene.time.now;

    // Track jump apex / landing for FX
    if (!onGround) {
      this.peakJumpY = Math.min(this.peakJumpY, this.y);
    }
    if (onGround && !this.wasOnGround) {
      const fellFrom = this.peakJumpY;
      const fallDist = this.y - fellFrom;
      if (this.onLand) this.onLand(this.x, this.y + 40, fallDist);
      if (this.isSlamming) this.endSlam();
      this.peakJumpY = this.y;
      this.jumpsRemaining = 1;
    }
    if (!onGround && this.wasOnGround) this.peakJumpY = this.y;
    this.wasOnGround = onGround;

    // ====== Wall slide detection ======
    this.wallSlide = 0;
    if (!onGround && body.velocity.y > 0) {
      if (body.blocked.right || body.touching.right) this.wallSlide = 1;
      if (body.blocked.left || body.touching.left) this.wallSlide = -1;
    }
    if (this.wallSlide !== 0 && body.velocity.y > 80) {
      // Slow fall when sliding against wall
      body.setVelocityY(80);
      this.jumpsRemaining = 1; // refresh on wall touch for wall-jump
    }

    // ====== Time-based state expiry ======
    if (this.isAttacking && now >= this.attackEndTime) {
      this.isAttacking = false;
      // If buffered combo press, immediately fire the next hit.
      if (this.comboBuffered && now < this.lastComboTime + PLAYER_CONFIG.COMBO_WINDOW_MS) {
        this.comboBuffered = false;
        this.beginAttack(now);
      } else if (now > this.lastComboTime + PLAYER_CONFIG.COMBO_WINDOW_MS) {
        this.comboIndex = 0;
      }
    }
    if (this.isSliding && now >= this.slideEndAt) this.endSlide();
    if (this.isThrowing && now >= this.throwEndAt) this.isThrowing = false;

    // ====== Input edges ======
    const left = this.cursors.left?.isDown || this.keyA.isDown;
    const right = this.cursors.right?.isDown || this.keyD.isDown;
    const down = this.cursors.down?.isDown || this.keyS.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up as Phaser.Input.Keyboard.Key) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace);
    const jPressed = Phaser.Input.Keyboard.JustDown(this.keyJ);
    const lPressed = Phaser.Input.Keyboard.JustDown(this.keyL);

    // ====== Defend (hold K) ======
    const wantDefend = this.keyK.isDown && !this.isAttacking && !this.isSliding && !this.isSlamming && !this.isThrowing;
    this.isDefending = wantDefend;

    // ====== Movement ======
    if (this.isSliding) {
      // Locked velocity from beginSlide
    } else if (this.isSlamming) {
      body.setVelocityX(0);
      body.setVelocityY(PLAYER_CONFIG.SLAM_FALL_SPEED);
    } else if (this.isThrowing && onGround) {
      body.setVelocityX(0);
    } else if (this.isDefending) {
      body.setVelocityX(0);
    } else if (this.isAttacking && onGround) {
      body.setVelocityX(0);
    } else {
      if (left && !right) {
        body.setVelocityX(-PLAYER_CONFIG.SPEED);
        this.setFlipX(true);
      } else if (right && !left) {
        body.setVelocityX(PLAYER_CONFIG.SPEED);
        this.setFlipX(false);
      } else {
        body.setVelocityX(0);
      }
    }

    // ====== Slide trigger (down + J on ground while running) ======
    if (
      jPressed &&
      onGround &&
      down &&
      !this.isSliding &&
      now >= this.nextSlideAt &&
      !this.isAttacking
    ) {
      this.beginSlide();
    } else if (
      // ====== Aerial slam trigger (down + J in air) ======
      jPressed &&
      !onGround &&
      down &&
      !this.isSlamming
    ) {
      this.beginSlam();
    } else if (jPressed && !this.isAttacking && !this.isSliding && !this.isSlamming && !this.isDefending) {
      // ====== Regular attack (with combo extension) ======
      if (now >= this.nextAttackAvailable) {
        this.beginAttack(now);
      } else {
        // Buffer for combo string
        this.comboBuffered = true;
      }
    }

    // ====== Jump (regular + double + wall) ======
    if (jumpPressed && !this.isSliding && !this.isSlamming) {
      if (onGround) {
        this.doJump(body);
      } else if (this.wallSlide !== 0) {
        // Wall jump
        body.setVelocityX(-this.wallSlide * PLAYER_CONFIG.WALL_JUMP_X);
        body.setVelocityY(PLAYER_CONFIG.WALL_JUMP_Y);
        this.setFlipX(this.wallSlide === 1);
        this.playSfx(SOUND_KEYS.JUMP, 0.4);
        if (this.onDoubleJump) this.onDoubleJump(this.x, this.y);
        this.peakJumpY = this.y;
      } else if (this.jumpsRemaining > 0) {
        // Double jump
        this.jumpsRemaining -= 1;
        body.setVelocityY(PLAYER_CONFIG.JUMP_FORCE * 0.85);
        this.playSfx(SOUND_KEYS.JUMP, 0.35);
        if (this.onDoubleJump) this.onDoubleJump(this.x, this.y);
      }
    }

    // ====== Throw shuriken (L) ======
    if (
      lPressed &&
      !this.isAttacking &&
      !this.isSliding &&
      !this.isSlamming &&
      !this.isDefending &&
      now >= this.nextShurikenAt &&
      this.shurikenCount > 0
    ) {
      this.beginThrow(now);
    }

    // ====== Resolve display state ======
    let next: PlayerState;
    if (this.isSlamming) next = 'slam';
    else if (this.isSliding) next = 'slide';
    else if (this.isThrowing) next = 'throw';
    else if (this.isDefending) next = 'defend';
    else if (this.isAttacking) next = 'attack';
    else if (this.wallSlide !== 0) next = 'wall';
    else if (!onGround) next = body.velocity.y < -10 ? 'jump' : 'fall';
    else if (Math.abs(body.velocity.x) > 5) next = 'run';
    else next = 'idle';
    this.applyState(next);

    this.animTimer += deltaMs;
    this.advanceAnimation();
  }

  // =================================================================
  // ACTIONS
  // =================================================================
  private doJump(body: Phaser.Physics.Arcade.Body): void {
    body.setVelocityY(PLAYER_CONFIG.JUMP_FORCE);
    this.playSfx(SOUND_KEYS.JUMP, 0.4);
    if (this.onJump) this.onJump(this.x, this.y + 40);
    this.peakJumpY = this.y;
  }

  private beginAttack(now: number): void {
    this.isAttacking = true;
    // Step combo
    if (this.comboIndex >= 3 || now > this.lastComboTime + PLAYER_CONFIG.COMBO_WINDOW_MS) {
      this.comboIndex = 1;
    } else {
      this.comboIndex += 1;
    }
    this.lastComboTime = now;
    this.comboBuffered = false;

    const idx = this.comboIndex - 1;
    const dmg = Math.round(
      PLAYER_CONFIG.ATTACK_DAMAGE * PLAYER_CONFIG.COMBO_DAMAGE_MULT[idx],
    );
    this.attackEndTime = now + PLAYER_CONFIG.ATTACK_COOLDOWN_MS;
    this.nextAttackAvailable = now + PLAYER_CONFIG.ATTACK_COOLDOWN_MS - 60;
    this.animTimer = 0;
    this.playSfx(SOUND_KEYS.ATTACK, 0.55);

    if (this.onAttackHitbox) {
      const facing: 1 | -1 = this.flipX ? -1 : 1;
      const range = PLAYER_CONFIG.ATTACK_RANGE + (idx === 2 ? 30 : 0);
      const rect = new Phaser.Geom.Rectangle(
        facing === 1 ? this.x : this.x - range,
        this.y - 50,
        range,
        90,
      );
      this.onAttackHitbox(rect, this.comboIndex, dmg);
    }
  }

  private beginSlide(): void {
    this.isSliding = true;
    this.slideEndAt = this.scene.time.now + PLAYER_CONFIG.SLIDE_DURATION_MS;
    this.nextSlideAt = this.scene.time.now + PLAYER_CONFIG.SLIDE_COOLDOWN_MS;
    this.animTimer = 0;
    this.applySlideHitbox();
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      const dir = this.flipX ? -1 : 1;
      body.setVelocityX(PLAYER_CONFIG.SLIDE_SPEED * dir);
    }
    if (this.onSlideHitbox) {
      const facing: 1 | -1 = this.flipX ? -1 : 1;
      const w = 80;
      const rect = new Phaser.Geom.Rectangle(
        facing === 1 ? this.x : this.x - w,
        this.y + 10,
        w,
        50,
      );
      this.onSlideHitbox(rect, PLAYER_CONFIG.SLIDE_DAMAGE);
    }
  }

  private endSlide(): void {
    this.isSliding = false;
    this.applyStandingHitbox();
  }

  private beginSlam(): void {
    this.isSlamming = true;
    this.animTimer = 0;
  }

  private endSlam(): void {
    this.isSlamming = false;
    if (this.onSlamLanding) {
      this.onSlamLanding(
        this.x,
        this.y + 40,
        PLAYER_CONFIG.SLAM_DAMAGE,
        PLAYER_CONFIG.SLAM_AOE_RANGE,
      );
    }
    this.scene.cameras.main.shake(180, 0.012);
  }

  private beginThrow(now: number): void {
    this.isThrowing = true;
    this.throwEndAt = now + 220;
    this.nextShurikenAt = now + PLAYER_CONFIG.SHURIKEN_COOLDOWN_MS;
    this.shurikenCount -= 1;
    this.animTimer = 0;
    this.playSfx(SOUND_KEYS.ATTACK, 0.4);
    if (this.onThrowShuriken) {
      const dir: 1 | -1 = this.flipX ? -1 : 1;
      const ox = dir === 1 ? 30 : -30;
      this.onThrowShuriken(this.x + ox, this.y - 12, dir);
    }
  }

  // =================================================================
  // ANIMATION
  // =================================================================
  private applyState(next: PlayerState): void {
    if (this.playerState !== next) {
      this.playerState = next;
      this.animTimer = 0;
    }
  }

  private advanceAnimation(): void {
    let key: string = TEXTURE_KEYS.NINJA_IDLE;
    switch (this.playerState) {
      case 'idle':
        key = TEXTURE_KEYS.NINJA_IDLE;
        break;
      case 'run': {
        if (this.animTimer > 110) {
          this.animTimer = 0;
          this.runFrameToggle = !this.runFrameToggle;
        }
        key = this.runFrameToggle ? TEXTURE_KEYS.NINJA_RUN_2 : TEXTURE_KEYS.NINJA_RUN_1;
        break;
      }
      case 'jump':
        key = TEXTURE_KEYS.NINJA_JUMP;
        break;
      case 'fall':
        key = TEXTURE_KEYS.NINJA_FALL;
        break;
      case 'attack':
        if (this.comboIndex >= 3) key = TEXTURE_KEYS.NINJA_ATTACK_3;
        else if (this.comboIndex === 2) key = TEXTURE_KEYS.NINJA_ATTACK_2;
        else key = TEXTURE_KEYS.NINJA_ATTACK_1;
        break;
      case 'defend':
        key = TEXTURE_KEYS.NINJA_DEFEND;
        break;
      case 'slide':
        key = TEXTURE_KEYS.NINJA_SLIDE;
        break;
      case 'slam':
        key = TEXTURE_KEYS.NINJA_SLAM;
        break;
      case 'throw':
        key = TEXTURE_KEYS.NINJA_THROW;
        break;
      case 'wall':
        key = TEXTURE_KEYS.NINJA_WALL;
        break;
      case 'hurt':
        key = TEXTURE_KEYS.NINJA_IDLE;
        break;
    }
    this.safeSetTexture(key);
  }

  private safeSetTexture(key: string): void {
    if (this.texture.key === key) return;
    if (!this.scene.textures.exists(key)) return;
    this.setTexture(key);
  }

  // =================================================================
  // PUBLIC API
  // =================================================================
  public takeDamage(amount: number, invulnerabilityMs?: number): boolean {
    const final = this.isDefending ? Math.ceil(amount * 0.25) : amount;
    const took = super.takeDamage(
      final,
      invulnerabilityMs ?? PLAYER_CONFIG.INVULNERABILITY_MS,
    );
    if (took) {
      this.playSfx(SOUND_KEYS.PLAYER_HURT, 0.4);
      const body = this.body as Phaser.Physics.Arcade.Body | null;
      if (body) {
        body.setVelocityY(-220);
        body.setVelocityX(this.flipX ? 180 : -180);
      }
      this.scene.cameras.main.shake(120, 0.006);
      // Cancel any in-progress attack/slide so player can react
      this.isAttacking = false;
      this.isSliding = false;
      this.applyStandingHitbox();
    }
    return took;
  }

  public addShuriken(n: number): void {
    this.shurikenCount = Math.min(99, this.shurikenCount + n);
  }

  public getShurikenCount(): number {
    return this.shurikenCount;
  }

  public getComboIndex(): number {
    // Display 0 if window expired
    if (this.scene.time.now > this.lastComboTime + PLAYER_CONFIG.COMBO_WINDOW_MS) {
      return 0;
    }
    return this.comboIndex;
  }

  public getIsAttacking(): boolean {
    return this.isAttacking;
  }

  public getIsDefending(): boolean {
    return this.isDefending;
  }

  public getIsSliding(): boolean {
    return this.isSliding;
  }

  public getIsSlamming(): boolean {
    return this.isSlamming;
  }

  public getFacing(): 1 | -1 {
    return this.flipX ? -1 : 1;
  }
}
