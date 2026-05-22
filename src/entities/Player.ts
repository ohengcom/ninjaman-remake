import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';
import { SoundManager } from '../managers/SoundManager.js';
import { PLAYER_MOVEMENT, PLAYER_ATTACKS, PLAYER_DEFENSE } from '../config/combat.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
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
  private lastGroundedTime: number = 0;
  private lastJumpInputTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle_sheet');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(120, 120);
    this.setCollideWorldBounds(true);
    this.body!.setSize(30, 40);
    this.body!.setOffset(this.width / 2 - 15, this.height / 2 - 20);

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
    if (!this.body!.touching.down && this.isDownDown()) return 'attack_dive';
    
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
    if (p.checkDashInput() && p.body!.touching.down) {
      p.stateMachine.setState('dash');
      return true;
    }
    if (p.isDefendDown() && p.body!.touching.down) {
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
      const isGroundedOrCoyote = p.body!.touching.down || (now - p.lastGroundedTime < PLAYER_MOVEMENT.coyoteTime);
      if (isGroundedOrCoyote && p.jumpCount === 0) {
        p.lastJumpInputTime = 0; // Consume jump buffer
        p.stateMachine.setState('jump');
        return true;
      } else if (p.jumpCount < PLAYER_MOVEMENT.maxJumps && !isGroundedOrCoyote) {
        // Only allow double jump if we are not grounded to prevent consuming both jumps instantly
        if (Phaser.Input.Keyboard.JustDown(p.cursors.space)) {
           p.lastJumpInputTime = 0;
           p.stateMachine.setState('jump');
           return true;
        }
      }
    }
    if (!p.body!.touching.down && p.body!.velocity.y > 0) {
      p.stateMachine.setState('fall');
      return true;
    }
    return false;
  }

  public applySquash(_sx: number, _sy: number, _dur: number) {
      // Disabled due to Arcade Physics body scaling bug causing floor clipping
      // this.scene.tweens.killTweensOf(this);
      // this.setScale(1); // Reset to base scale before applying new squash
      // this.scene.tweens.add({
      //     targets: this,
      //     scaleX: sx,
      //     scaleY: sy,
      //     duration: dur,
      //     yoyo: true,
      //     onComplete: () => this.setScale(1) // Guarantee it returns to normal
      // });
  }

  public playAnimation(animKey: string) {
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey);
    }
    this.setDisplaySize(120, 120);
    this.body!.setSize(30, 40);
    this.body!.setOffset(this.width / 2 - 15, this.height / 2 - 20);
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (p) => {
          p.playAnimation('player_idle_anim');
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
          p.playAnimation('player_run_anim');
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
          p.playAnimation('player_dash_anim');
          p.setVelocityX(p.dashDir * PLAYER_MOVEMENT.dashSpeed);
          
          // Dash grants invincibility frames by default now that upgrade menu is removed
          p.isInvulnerable = true;

          p.scene.time.delayedCall(PLAYER_MOVEMENT.dashDuration, () => {
             if (p.health > 0) p.stateMachine.setState('idle');
          });
        },
        onExit: (p) => { p.isInvulnerable = false; }
      })
      .addState({
        name: 'defend',
        onEnter: (p) => {
          p.playAnimation('player_defend_anim');
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
          p.playAnimation('player_jump_anim');
          p.setVelocityY(p.jumpCount === 0 ? PLAYER_MOVEMENT.jumpVelocity : PLAYER_MOVEMENT.doubleJumpVelocity);
          p.jumpCount++;
          
          p.applySquash(0.7, 1.3, 150);
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          p.handleAirMovement();
          if (p.body!.touching.down) {
            p.applySquash(1.4, 0.6, 100);
            p.stateMachine.setState('idle');
          }
        }
      })
      .addState({
        name: 'fall',
        onEnter: (p) => { p.playAnimation('player_fall_anim'); },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          p.handleAirMovement();
          if (p.body!.touching.down) {
            p.applySquash(1.4, 0.6, 100);
            p.stateMachine.setState('idle');
          }
        }
      })
      .addState({
        name: 'attack_combo',
        onEnter: (p) => {
          // Each combo step has a distinct animation and feel
          const comboAnims = ['player_combo1_anim', 'player_combo2_anim', 'player_combo3_anim', 'player_combo4_anim'];
          const comboMomentum = [
            PLAYER_ATTACKS.combo.forwardMomentum,       // step 0: quick jab forward
            PLAYER_ATTACKS.combo.forwardMomentum * 0.5, // step 1: upward slash, less forward
            PLAYER_ATTACKS.combo.forwardMomentum * 1.5, // step 2: spinning, more forward
            PLAYER_ATTACKS.combo.forwardMomentum * 2,   // step 3: heavy slam, big lunge
          ];
          const comboRecovery = [
            PLAYER_ATTACKS.combo.recovery,         // step 0: fast
            PLAYER_ATTACKS.combo.recovery,         // step 1: fast
            PLAYER_ATTACKS.combo.recovery * 1.2,   // step 2: slightly slower
            PLAYER_ATTACKS.combo.recovery * 1.8,   // step 3: heavy, slow recovery
          ];
          const comboShake: [number, number][] = [
            [80, 0.004],   // step 0: light
            [100, 0.006],  // step 1: medium
            [120, 0.008],  // step 2: strong
            [180, 0.015],  // step 3: heavy impact
          ];

          const step = p.comboStep;
          const animKey = comboAnims[step] ?? 'player_combo1_anim';
          const momentum = comboMomentum[step] ?? PLAYER_ATTACKS.combo.forwardMomentum;
          const recovery = comboRecovery[step] ?? PLAYER_ATTACKS.combo.recovery;
          const [shakeDur, shakeIntensity] = comboShake[step] ?? [100, 0.005];

          p.playAnimation(animKey);
          p.setVelocityX(p.flipX ? -momentum : momentum);

          // Step 3 (heavy slam) also pushes down slightly for impact feel
          if (step === 3 && !p.body!.touching.down) {
            p.setVelocityY(200);
          }

          p.scene.cameras.main.shake(shakeDur, shakeIntensity);
          p.scene.events.emit('player_attack', p, 'combo');
          
          p.scene.time.delayedCall(recovery, () => {
            if (p.health > 0) p.stateMachine.setState(p.body!.touching.down ? 'idle' : 'fall');
          });
        },
        onUpdate: (p) => {
          // Special Cancel: Allow canceling active combo hits into wave attack instantly
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
          p.playAnimation('player_wave_anim');
          p.setVelocityX(0);
          p.scene.cameras.main.shake(100, 0.005);
          p.scene.events.emit('player_cast_wave', p);
          
          p.applySquash(1.2, 0.9, 150);

          p.scene.time.delayedCall(300, () => {
             if (p.health > 0) p.stateMachine.setState(p.body!.touching.down ? 'idle' : 'fall');
          });
        }
      })
      .addState({
        name: 'attack_uppercut',
        onEnter: (p) => {
          p.playAnimation('player_uppercut_anim');
          p.setVelocityY(PLAYER_ATTACKS.uppercut.launchVelocity); // Launcher
          p.setVelocityX(0);
          p.scene.cameras.main.shake(150, 0.01);
          p.scene.events.emit('player_attack', p, 'uppercut');
          
          p.applySquash(0.6, 1.4, 150);

          p.stateMachine.addTimer(p.scene.time.delayedCall(PLAYER_ATTACKS.uppercut.recovery, () => {
            if (p.health > 0) p.stateMachine.setState('fall');
          }));
        }
      })
      .addState({
        name: 'attack_dive',
        onEnter: (p) => {
          p.playAnimation('player_dive_anim');
          p.setVelocityY(PLAYER_ATTACKS.dive.downVelocity); // Fast downward
          p.setVelocityX(p.flipX ? -PLAYER_ATTACKS.dive.forwardVelocity : PLAYER_ATTACKS.dive.forwardVelocity);
          p.scene.events.emit('player_attack', p, 'dive');
          
          p.applySquash(0.6, 1.4, 150);
        },
        onUpdate: (p) => {
           if (p.body!.touching.down) {
              p.scene.cameras.main.shake(200, 0.02);
              p.scene.events.emit('player_attack', p, 'dive_land');
              
              p.applySquash(1.5, 0.5, 100);

              p.stateMachine.setState('idle');
           }
        }
      })
      .addState({
        name: 'hurt',
        onEnter: (p) => {
          p.playAnimation('player_hurt_anim');
          p.setTint(0xff0000);
          p.isInvulnerable = true;
          p.isBlocking = false;
          p.scene.cameras.main.shake(200, 0.01);
          
          p.scene.time.delayedCall(PLAYER_DEFENSE.hurtStunDuration, () => {
            p.clearTint();
            p.stateMachine.setState(p.body!.touching.down ? 'idle' : 'fall');
          });

          p.scene.time.delayedCall(PLAYER_DEFENSE.invulnerabilityDuration, () => {
            p.isInvulnerable = false;
            p.setAlpha(1);
          });
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

  /** Gamepad-aware input helpers */
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
    
    // Parry / Defend Logic
    if (this.isBlocking && Math.sign(dirX) !== (this.flipX ? -1 : 1)) {
       // Successful block! Take reduced damage, no knockback, emit parry
       this.health -= Math.floor(amount * PLAYER_DEFENSE.blockDamageReduction);
       this.scene.events.emit('player_parry', this);
       // Pushback slightly
       this.setVelocityX(dirX * PLAYER_DEFENSE.blockPushback);
       return;
    }

    this.health -= amount;
    this.setVelocityX(dirX * PLAYER_DEFENSE.hurtKnockbackX);
    this.setVelocityY(PLAYER_DEFENSE.hurtKnockbackY);
    if (this.health <= 0) {
      this.setTint(0x555555);
      this.scene.events.emit('player_dead');
    } else {
      this.stateMachine.setState('hurt');
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.stateMachine.update(delta);

    // Track last grounded time for coyote time
    if (this.body!.touching.down) {
      this.lastGroundedTime = time;
    }
    
    // Record inputs for motion detection
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) this.recordInput('down');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) this.recordInput('left');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) this.recordInput('right');
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.recordInput('up');

    if (this.isInvulnerable && this.stateMachine.getCurrentStateName() !== 'hurt') {
      this.setAlpha(time % 200 < 100 ? 0.5 : 1);
    }
  }
}
