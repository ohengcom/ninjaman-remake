import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';
import { SoundManager } from '../managers/SoundManager.js';
import { PLAYER_MOVEMENT, PLAYER_ATTACKS, PLAYER_DEFENSE } from '../config/combat.js';
import { GAME_EVENTS } from '../events.js';

const PLAYER_RENDER = {
  displaySize: 200,
  bodyWidth: 34,
  bodyHeight: 96,
  bodyOffsetX: 30,
  bodyOffsetY: 23,
} as const;

export class Player extends Phaser.Physics.Matter.Sprite {
  public stateMachine: StateMachine<Player>;

  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public attackKey!: Phaser.Input.Keyboard.Key;
  public defendKey!: Phaser.Input.Keyboard.Key;
  public waveKey!: Phaser.Input.Keyboard.Key;
  private pad: Phaser.Input.Gamepad.Gamepad | null = null;
  
  public health: number = 100;
  public maxHealth: number = 100;
  public isInvulnerable: boolean = false;
  public isBlocking: boolean = false;
  public jumpCount: number = 0;

  public comboStep: number = 0;
  public lastAttackTime: number = 0;
  public lastWaveTime: number = 0;
  
  private lastTapLeftTime: number = 0;
  private lastTapRightTime: number = 0;
  private dashDir: number = 1;

  private inputBuffer: { key: string, time: number }[] = [];
  private static readonly BUFFER_TIMEOUT = PLAYER_MOVEMENT.motionBufferTimeout;
  private static readonly GROUND_CONTACT_GRACE = 120;
  private lastGroundedTime: number = 0;
  private lastGroundContactTime: number = 0;
  private lastJumpInputTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'knight');
    scene.add.existing(this);

    this.applyRenderSize();

    this.setFixedRotation();

    // Set keys to A, S, D, W, SPACE
    this.cursors = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    }) as any;

    this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.defendKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.waveKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // Gamepad support
    if (scene.input.gamepad) {
      scene.input.gamepad.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
        this.pad = pad;
      });
      if (scene.input.gamepad.total > 0) {
        this.pad = scene.input.gamepad.getPad(0);
      }
    }

    this.stateMachine = new StateMachine<Player>(this);
    this.setupStates();
    this.stateMachine.setState('idle');
  }

  private recordInput(key: string) {
    const time = this.scene.time.now;
    this.inputBuffer.push({ key, time });
    // Keep buffer small
    if (this.inputBuffer.length > 10) {
       this.inputBuffer.shift();
    }
  }

  private checkMotionInput(sequence: string[]): boolean {
     if (this.inputBuffer.length < sequence.length) return false;
     
     const time = this.scene.time.now;
     // Filter out old inputs
     const recentInputs = this.inputBuffer.filter(i => time - i.time < Player.BUFFER_TIMEOUT);
     if (recentInputs.length < sequence.length) return false;

     let seqIndex = sequence.length - 1;
     for (let i = recentInputs.length - 1; i >= 0; i--) {
        const input = recentInputs[i]!;
        if (input.key === sequence[seqIndex]) {
           seqIndex--;
           if (seqIndex < 0) {
              this.inputBuffer = []; // Consume buffer
              return true;
           }
        }
     }
     return false;
  }

  private checkDashInput(): boolean {
    const time = this.scene.time.now;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      if (time - this.lastTapLeftTime < PLAYER_MOVEMENT.doubleTapWindow) { this.dashDir = -1; return true; }
      this.lastTapLeftTime = time;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      if (time - this.lastTapRightTime < PLAYER_MOVEMENT.doubleTapWindow) { this.dashDir = 1; return true; }
      this.lastTapRightTime = time;
    }
    return false;
  }

  private checkAttackInput(): string | null {
    const time = this.scene.time.now;

    // Direct check for Wave Key (L) for one-button special move
    if (Phaser.Input.Keyboard.JustDown(this.waveKey) || (this.pad && this.pad.X)) {
      if (time - this.lastWaveTime > PLAYER_ATTACKS.wave.cooldown) {
        this.lastWaveTime = time;
        return 'attack_wave';
      }
    }

    if (!this.isAttackJustDown()) return null;

    // Check for Hadouken motion: Down -> Forward -> Attack
    const forwardKey = this.flipX ? 'left' : 'right';
    if (time - this.lastWaveTime > PLAYER_ATTACKS.wave.cooldown && this.checkMotionInput(['down', forwardKey])) {
        this.lastWaveTime = time;
        return 'attack_wave';
    }
    
    if (this.isUpDown()) return 'attack_uppercut';
    if (!this.isGrounded() && this.isDownDown()) return 'attack_dive';
    
    // Combo logic: Always enable full 4-stage combo now that upgrade menu is removed
    const maxComboHits = 4;

    if (time - this.lastAttackTime < PLAYER_MOVEMENT.comboWindow) {
      this.comboStep = (this.comboStep + 1) % maxComboHits;
    } else {
      this.comboStep = 0;
    }
    this.lastAttackTime = time;
    return 'attack_combo';
  }

  private handleCommonTransitions(p: Player) {
    const canGroundAction = p.isGroundedOrCoyote();

    if (p.checkDashInput() && canGroundAction) {
      p.stateMachine.setState('dash');
      return true;
    }
    if (p.isDefendDown() && canGroundAction) {
      p.stateMachine.setState('defend');
      return true;
    }
    const attackState = p.checkAttackInput();
    if (attackState) {
      p.stateMachine.setState(attackState);
      return true;
    }
    // Jump with independent Space key, allow single & double jumps
    if (Phaser.Input.Keyboard.JustDown(p.cursors.space) || (p.pad && p.pad.A && p.pad.A)) {
       p.lastJumpInputTime = p.scene.time.now;
    }
    
    const now = p.scene.time.now;
    const hasJumpBuffer = (now - p.lastJumpInputTime < PLAYER_MOVEMENT.jumpBufferTime);

    if (hasJumpBuffer) {
      const isGroundedOrCoyote = p.isGroundedOrCoyote();
      if (isGroundedOrCoyote && p.jumpCount === 0) {
        p.lastJumpInputTime = 0; // Consume jump buffer
        p.stateMachine.setState('jump');
        return true;
      } else if (p.jumpCount < PLAYER_MOVEMENT.maxJumps && !isGroundedOrCoyote) {
        // Only allow double jump if we are not grounded to prevent consuming both jumps instantly
        p.lastJumpInputTime = 0;
        p.stateMachine.setState('jump');
        return true;
      }
    }
    if (!p.isGrounded() && p.body!.velocity.y > 0) {
      p.stateMachine.setState('fall');
      return true;
    }
    return false;
  }

  public isGrounded(): boolean {
      return this.scene.time.now - this.lastGroundContactTime < Player.GROUND_CONTACT_GRACE;
  }

  public notifyGroundContact(): void {
    this.lastGroundContactTime = this.scene.time.now;
  }

  private isGroundedOrCoyote(): boolean {
    return this.isGrounded() || (this.scene.time.now - this.lastGroundedTime < PLAYER_MOVEMENT.coyoteTime);
  }

  private canApplyMovement(): boolean {
    const state = this.stateMachine.getCurrentStateName();
    return state !== 'dash'
      && state !== 'defend'
      && state !== 'hurt'
      && !state.startsWith('attack_')
      && this.health > 0;
  }

  private applyBufferedMovement() {
    if (!this.canApplyMovement()) return;

    const speed = this.isGroundedOrCoyote() ? PLAYER_MOVEMENT.runSpeed : PLAYER_MOVEMENT.airSpeed;
    if (this.isLeftDown()) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (this.isRightDown()) {
      this.setVelocityX(speed);
      this.setFlipX(false);
    }
  }

  public applySquash(_sx: number, _sy: number, _dur: number) {
    // Visual squash is now driven procedurally in preUpdate
  }

  public playAnimation(animKey: string) {
    this.play(animKey, true);
  }

  private applyRenderSize() {
    const baseScale = PLAYER_RENDER.displaySize / 79;
    this.setScale(baseScale, baseScale);
    this.setRectangle(PLAYER_RENDER.bodyWidth, PLAYER_RENDER.bodyHeight, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.01,
    });
    this.setFriction(0, 0, 0);
    this.setFrictionAir(0.01);
    this.setOrigin(0.35, 0.8);
  }

  public getBodyHalfHeight(): number {
    return PLAYER_RENDER.bodyHeight / 2;
  }

  destroy(fromScene?: boolean) {
    this.stateMachine.destroy();
    super.destroy(fromScene);
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (p) => {
          p.playAnimation('player_idle');
          p.setVelocityX(0);
          p.jumpCount = 0;
          p.isBlocking = false;
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          if (p.isLeftDown() || p.isRightDown()) {
            p.stateMachine.setState('run');
          }
        }
      })
      .addState({
        name: 'run',
        onEnter: (p) => {
          p.playAnimation('player_run');
          p.jumpCount = 0;
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          if (p.isLeftDown()) {
            p.setVelocityX(-PLAYER_MOVEMENT.runSpeed); p.setFlipX(true);
          } else if (p.isRightDown()) {
            p.setVelocityX(PLAYER_MOVEMENT.runSpeed); p.setFlipX(false);
          } else {
            p.stateMachine.setState('idle');
          }
        }
      })
      .addState({
        name: 'dash',
        onEnter: (p) => {
          SoundManager.playDash((p.scene as any).getPan?.(p.x) ?? 0);
          p.playAnimation('player_run');
          p.setVelocityX(p.dashDir * PLAYER_MOVEMENT.dashSpeed);
          
          // Dash grants invincibility frames by default now that upgrade menu is removed
          p.isInvulnerable = true;

          p.stateMachine.addTimer(p.scene.time.delayedCall(PLAYER_MOVEMENT.dashDuration, () => {
             if (p.health > 0 && p.active && p.stateMachine.getCurrentStateName() === 'dash') p.stateMachine.setState('idle');
          }));
        },
        onExit: (p) => { p.isInvulnerable = false; }
      })
      .addState({
        name: 'defend',
        onEnter: (p) => {
          p.playAnimation('player_idle');
          p.setVelocityX(0);
          p.isBlocking = true;
        },
        onUpdate: (p) => {
          if (!p.isDefendDown()) p.stateMachine.setState('idle');
        },
        onExit: (p) => { p.isBlocking = false; }
      })
      .addState({
        name: 'jump',
        onEnter: (p) => {
          SoundManager.playJump((p.scene as any).getPan?.(p.x) ?? 0);
          p.playAnimation('player_jump');
          p.setVelocityY(p.jumpCount === 0 ? PLAYER_MOVEMENT.jumpVelocity : PLAYER_MOVEMENT.doubleJumpVelocity);
          p.jumpCount++;
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          p.handleAirMovement();
          if (p.isGrounded() && p.body!.velocity.y >= 0) {
            p.stateMachine.setState('idle');
          }
        }
      })
      .addState({
        name: 'fall',
        onEnter: (p) => { p.playAnimation('player_fall'); },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          p.handleAirMovement();
          if (p.isGrounded() && p.body!.velocity.y >= 0) {
            p.stateMachine.setState('idle');
          }
        }
      })
      .addState({
        name: 'attack_combo',
        onEnter: (p) => {
          const comboAnims = ['player_attack_A', 'player_attack_B', 'player_attack_C', 'player_attack_A'];
          const comboMomentum = [
            PLAYER_ATTACKS.combo.forwardMomentum,
            PLAYER_ATTACKS.combo.forwardMomentum * 0.5,
            PLAYER_ATTACKS.combo.forwardMomentum * 1.5,
            PLAYER_ATTACKS.combo.forwardMomentum * 2,
          ];
          const comboRecovery = [
            PLAYER_ATTACKS.combo.recovery,
            PLAYER_ATTACKS.combo.recovery,
            PLAYER_ATTACKS.combo.recovery * 1.2,
            PLAYER_ATTACKS.combo.recovery * 1.8,
          ];
          const comboShake: [number, number][] = [
            [80, 0.004],
            [100, 0.006],
            [120, 0.008],
            [180, 0.015],
          ];

          const step = p.comboStep;
          const animKey = comboAnims[step] ?? 'player_attack';
          const momentum = comboMomentum[step] ?? PLAYER_ATTACKS.combo.forwardMomentum;
          const recovery = comboRecovery[step] ?? PLAYER_ATTACKS.combo.recovery;
          const [shakeDur, shakeIntensity] = comboShake[step] ?? [100, 0.005];

          p.playAnimation(animKey);
          p.setVelocityX(p.flipX ? -momentum : momentum);

          if (step === 3 && !p.isGrounded()) {
            p.setVelocityY(-4.5); // Fixed velocity Y to negative for upwards
          }

          p.scene.cameras.main.shake(shakeDur, shakeIntensity);
          p.scene.events.emit(GAME_EVENTS.PLAYER_ATTACK, p, 'combo');
          
          p.stateMachine.addTimer(p.scene.time.delayedCall(recovery, () => {
            if (p.health > 0 && p.active && p.stateMachine.getCurrentStateName() === 'attack_combo') {
              p.stateMachine.setState(p.isGrounded() ? 'idle' : 'fall');
            }
          }));
        },
        onUpdate: (p) => {
          if (Phaser.Input.Keyboard.JustDown(p.waveKey) || (p.pad && p.pad.X)) {
            const time = p.scene.time.now;
            if (time - p.lastWaveTime > PLAYER_ATTACKS.wave.cooldown) {
              p.lastWaveTime = time;
              p.stateMachine.setState('attack_wave');
            }
          }
        }
      })
      .addState({
        name: 'attack_wave',
        onEnter: (p) => {
          p.playAnimation('player_attack');
          p.setVelocityX(0);
          p.scene.cameras.main.shake(100, 0.005);
          p.scene.events.emit(GAME_EVENTS.PLAYER_CAST_WAVE, p);
          
          p.stateMachine.addTimer(p.scene.time.delayedCall(300, () => {
             if (p.health > 0 && p.active && p.stateMachine.getCurrentStateName() === 'attack_wave') {
               p.stateMachine.setState(p.isGrounded() ? 'idle' : 'fall');
             }
          }));
        }
      })
      .addState({
        name: 'attack_uppercut',
        onEnter: (p) => {
          p.playAnimation('player_jump');
          p.setVelocityY(PLAYER_ATTACKS.uppercut.launchVelocity);
          p.setVelocityX(0);
          p.scene.cameras.main.shake(150, 0.01);
          p.scene.events.emit(GAME_EVENTS.PLAYER_ATTACK, p, 'uppercut');
          
          p.stateMachine.addTimer(p.scene.time.delayedCall(PLAYER_ATTACKS.uppercut.recovery, () => {
            if (p.health > 0) p.stateMachine.setState('fall');
          }));
        }
      })
      .addState({
        name: 'attack_dive',
        onEnter: (p) => {
          p.playAnimation('player_fall');
          p.setVelocityY(PLAYER_ATTACKS.dive.downVelocity);
          p.setVelocityX(p.flipX ? -PLAYER_ATTACKS.dive.forwardVelocity : PLAYER_ATTACKS.dive.forwardVelocity);
          p.scene.events.emit(GAME_EVENTS.PLAYER_ATTACK, p, 'dive');
        },
        onUpdate: (p) => {
           if (p.isGrounded()) {
              p.scene.cameras.main.shake(200, 0.02);
              p.scene.events.emit(GAME_EVENTS.PLAYER_ATTACK, p, 'dive_land');
              p.stateMachine.setState('idle');
           }
        }
      })
      .addState({
        name: 'hurt',
        onEnter: (p) => {
          p.playAnimation('player_hurt');
          p.setTint(0xff6b6b);
          p.setTintMode(Phaser.TintModes.ADD);
          p.isInvulnerable = true;
          p.isBlocking = false;
          p.scene.cameras.main.shake(200, 0.01);
          
          p.stateMachine.addTimer(p.scene.time.delayedCall(PLAYER_DEFENSE.hurtStunDuration, () => {
            if (!p.active || p.health <= 0 || p.stateMachine.getCurrentStateName() !== 'hurt') return;
            p.clearTint();
            p.setTintMode(Phaser.TintModes.MULTIPLY);
            p.stateMachine.setState(p.isGrounded() ? 'idle' : 'fall');
          }));

          p.stateMachine.addTimer(p.scene.time.delayedCall(PLAYER_DEFENSE.invulnerabilityDuration, () => {
            if (!p.active || p.health <= 0) return;
            p.isInvulnerable = false;
            p.setAlpha(1);
          }));
        },
        onUpdate: (p) => {
          if (p.isInvulnerable && p.stateMachine.getCurrentStateName() !== 'hurt') {
            p.setAlpha(p.scene.time.now % 200 < 100 ? 0.5 : 1);
          }
        }
      });
  }

  private handleAirMovement() {
    if (this.isLeftDown()) {
      this.setVelocityX(-PLAYER_MOVEMENT.airSpeed); this.setFlipX(true);
    } else if (this.isRightDown()) {
      this.setVelocityX(PLAYER_MOVEMENT.airSpeed); this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }
  }

  private isLeftDown(): boolean {
    if (this.cursors.left.isDown) return true;
    if (this.pad && (this.pad.leftStick.x < -0.3 || this.pad.left)) return true;
    return false;
  }

  private isRightDown(): boolean {
    if (this.cursors.right.isDown) return true;
    if (this.pad && (this.pad.leftStick.x > 0.3 || this.pad.right)) return true;
    return false;
  }

  private isUpDown(): boolean {
    if (this.cursors.up.isDown) return true;
    if (this.pad && (this.pad.leftStick.y < -0.3 || this.pad.up)) return true;
    return false;
  }

  private isDownDown(): boolean {
    if (this.cursors.down.isDown) return true;
    if (this.pad && (this.pad.leftStick.y > 0.3 || this.pad.down)) return true;
    return false;
  }

  private isAttackJustDown(): boolean {
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) return true;
    if (this.pad && this.pad.A) return true;
    return false;
  }

  private isDefendDown(): boolean {
    if (this.defendKey.isDown) return true;
    if (this.pad && this.pad.B) return true;
    return false;
  }

  public takeDamage(amount: number, dirX: number) {
    if (this.isInvulnerable || this.health <= 0) return;
    
    if (this.isBlocking && Math.sign(dirX) !== (this.flipX ? -1 : 1)) {
       this.health -= Math.floor(amount * PLAYER_DEFENSE.blockDamageReduction);
       this.scene.events.emit(GAME_EVENTS.PLAYER_PARRY, this);
       this.setVelocityX(dirX * PLAYER_DEFENSE.blockPushback);
       return;
    }

    this.health -= amount;
    this.setVelocityX(dirX * PLAYER_DEFENSE.hurtKnockbackX);
    this.setVelocityY(PLAYER_DEFENSE.hurtKnockbackY);
    if (this.health <= 0) {
      this.setTint(0x868e96);
      this.setTintMode(Phaser.TintModes.MULTIPLY);
      this.scene.events.emit(GAME_EVENTS.PLAYER_DEAD);
    } else {
      this.stateMachine.setState('hurt');
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.stateMachine.update(delta);

    if (this.isGrounded()) {
      this.lastGroundedTime = time;
    }
    this.applyBufferedMovement();
    
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) this.recordInput('down');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.recordInput('left');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.recordInput('right');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.recordInput('up');

    if (this.isInvulnerable && this.stateMachine.getCurrentStateName() !== 'hurt') {
      this.setAlpha(time % 200 < 100 ? 0.5 : 1);
    }

    if (this.health <= 0) {
      // dead state handling if needed
    }
  }
}
