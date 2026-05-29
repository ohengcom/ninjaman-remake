import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';
import { BOSS_STATS } from '../config/enemies.js';
import { GAME_EVENTS } from '../events.js';

export class Boss extends Phaser.Physics.Matter.Sprite {
  public stateMachine: StateMachine<Boss>;
  public health: number = BOSS_STATS.health;
  public maxHealth: number = BOSS_STATS.health;
  private target: Phaser.Physics.Matter.Sprite | null = null;
  private isInvulnerable = false;
  private phase: number = 1;
  private bossTimers: Phaser.Time.TimerEvent[] = [];

  public get baseScaleX(): number {
    return 200 / 340;
  }

  public get baseScaleY(): number {
    return 240 / 512;
  }

  private applyBossVisuals() {
    this.setScale(this.baseScaleX, this.baseScaleY);
    
    // Compute the perfect originY based on our pixel-perfect physics-visual formula (yFeet = 499, scaledHeight = 200 * baseScaleY)
    const displayHeight = 240;
    const scaledHeight = 200 * this.baseScaleY;
    const originY = 499 / 512 - scaledHeight / (2 * displayHeight);
    this.setOrigin(0.5, originY);
    
    // Boss phases color feedback
    if (this.phase === 3) {
      this.setTint(0xff4444); // Red/Enraged
      this.setTintMode(Phaser.TintModes.ADD);
    } else if (this.phase === 2) {
      this.setTint(0xffd43b); // Golden
      this.setTintMode(Phaser.TintModes.SCREEN);
    } else {
      this.clearTint(); // Natural colors in phase 1
      this.setTintMode(Phaser.TintModes.MULTIPLY);
    }
  }

  private applyBossPhysics() {
    // Scale body dimensions by the visual scale to convert from texture space to game space
    const scaledWidth = 60 * this.baseScaleX;
    const scaledHeight = 200 * this.baseScaleY;
    this.setRectangle(scaledWidth, scaledHeight);
    this.setFixedRotation();
    this.setIgnoreGravity(false); // Enable gravity so the Boss stands/falls naturally
    this.setMass(10000);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'boss_oni_sheet');
    scene.add.existing(this);

    this.applyBossPhysics();
    this.applyBossVisuals();

    this.stateMachine = new StateMachine<Boss>(this);
    this.setupStates();
    this.stateMachine.setState('idle');

    // Notify initial health
    this.addBossTimer(scene.time.delayedCall(100, () => {
       if (!this.active || this.health <= 0) return;
       scene.events.emit(GAME_EVENTS.UPDATE_BOSS_HEALTH, this.health, this.maxHealth);
    }));
  }

  public setTarget(target: Phaser.Physics.Matter.Sprite) {
    this.target = target;
  }

  private addBossTimer(timer: Phaser.Time.TimerEvent) {
    this.bossTimers.push(timer);
  }

  private clearBossTimers() {
    for (const timer of this.bossTimers) {
      timer.remove();
    }
    this.bossTimers = [];
  }

  private get isEnraged(): boolean {
    return this.phase >= 2;
  }

  private faceTarget(b: Boss) {
    if (!b.target) return;
    b.setFlipX(b.target.x < b.x);
  }

  private checkPhaseTransition() {
    const healthPercent = this.health / this.maxHealth;
    let transitionTriggered = false;
    if (healthPercent <= 0.3 && this.phase < 3) {
      this.phase = 3;
      transitionTriggered = true;
      this.scene.cameras.main.shake(500, 0.03);
    } else if (healthPercent <= 0.5 && this.phase < 2) {
      this.phase = 2;
      transitionTriggered = true;
      this.scene.cameras.main.shake(400, 0.025);
    }

    if (transitionTriggered) {
      const gScene = this.scene as any;
      if (gScene.vfxManager) {
        gScene.vfxManager.bossPhaseTransition(this.phase);
        gScene.vfxManager.bossPhaseParticleBurst(this.x, this.y, this.phase);
      }
    }
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (b) => {
          b.play({ key: 'boss_idle', repeat: -1 }, true);
          b.setVelocityX(0);
          b.faceTarget(b);
          const delay = b.isEnraged ? BOSS_STATS.idleDelay * 0.4 : BOSS_STATS.idleDelay;
          b.stateMachine.addTimer(b.scene.time.delayedCall(delay, () => {
            if (b.health <= 0 || !b.target) return;
            const dist = Phaser.Math.Distance.Between(b.x, b.y, b.target.x, b.target.y);
            if (dist < BOSS_STATS.meleeDistance) {
              if (b.phase >= 3 && Math.random() < 0.4) {
                b.stateMachine.setState('rush');
              } else {
                b.stateMachine.setState('windup');
              }
            } else {
              b.stateMachine.setState('chase');
            }
          }));
        }
      })
      .addState({
        name: 'chase',
        onEnter: (b) => {
          b.play({ key: 'boss_walk', repeat: -1 }, true);
          b.faceTarget(b);
        },
        onUpdate: (b) => {
          if (!b.target || b.health <= 0) return;
          const dist = Math.abs(b.target.x - b.x);
          const dir = Math.sign(b.target.x - b.x);
          const speed = b.isEnraged ? BOSS_STATS.moveSpeed * BOSS_STATS.enragedMoveMultiplier : BOSS_STATS.moveSpeed;
          
          b.setFlipX(dir < 0);

          if (dist < BOSS_STATS.meleeDistance) {
            b.setVelocityX(0);
            if (b.phase >= 3 && Math.random() < 0.3) {
              b.stateMachine.setState('rush');
            } else {
              b.stateMachine.setState('windup');
            }
          } else {
            b.setVelocityX(speed * dir);
          }
        }
      })
      .addState({
        name: 'windup',
        onEnter: (b) => {
          b.setVelocityX(0);
          b.play({ key: 'boss_hurt', repeat: 0 }, true); // Use hurt frame as windup telegraph
          b.faceTarget(b);
          const windup = b.isEnraged ? BOSS_STATS.attackWindup * 0.5 : BOSS_STATS.attackWindup;
          
          // Pulsing alpha during windup for visual telegraph
          b.scene.tweens.add({
            targets: b,
            alpha: 0.6,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(windup / 200),
          });

          b.stateMachine.addTimer(b.scene.time.delayedCall(windup, () => {
            if (b.health > 0) {
              b.stateMachine.setState('attack');
            }
          }));
        },
        onExit: (b) => {
          b.setAlpha(1);
          b.applyBossVisuals();
        }
      })
      .addState({
        name: 'attack',
        onEnter: (b) => {
          b.play({ key: 'boss_attack', repeat: 0 }, true);
          b.setVelocityX(0);
          b.scene.cameras.main.shake(300, 0.025);
          b.scene.events.emit(GAME_EVENTS.BOSS_ATTACK, b);

          // Phase 2+: follow up with a second strike
          if (b.phase >= 2) {
            b.stateMachine.addTimer(b.scene.time.delayedCall(350, () => {
              if (b.health <= 0) return;
              b.scene.cameras.main.shake(250, 0.02);
              b.scene.events.emit(GAME_EVENTS.BOSS_ATTACK, b);
            }));
          }

          const cooldown = b.isEnraged ? BOSS_STATS.attackCooldown * 0.5 : BOSS_STATS.attackCooldown;
          b.stateMachine.addTimer(b.scene.time.delayedCall(cooldown, () => {
            if (b.health > 0) {
              b.stateMachine.setState('idle');
            }
          }));
        }
      })
      .addState({
        name: 'rush',
        onEnter: (b) => {
          if (!b.target) { b.stateMachine.setState('idle'); return; }
          b.play({ key: 'boss_rush', repeat: -1 }, true);
          b.setTint(0xff4444);
          const dir = Math.sign(b.target.x - b.x);
          b.setFlipX(dir < 0);

          // Brief telegraph before charging
          b.stateMachine.addTimer(b.scene.time.delayedCall(400, () => {
            if (b.health <= 0) return;
            b.applyBossVisuals();
            b.setVelocityX(dir * BOSS_STATS.moveSpeed * BOSS_STATS.rushMoveMultiplier);
            b.scene.cameras.main.shake(200, 0.015);

            // Stop and slam after rush
            b.stateMachine.addTimer(b.scene.time.delayedCall(500, () => {
              if (b.health <= 0) return;
              b.setVelocityX(0);
              b.play({ key: 'boss_attack', repeat: 0 }, true);
              b.scene.events.emit(GAME_EVENTS.BOSS_ATTACK, b);
              b.scene.cameras.main.shake(400, 0.04);

              b.stateMachine.addTimer(b.scene.time.delayedCall(800, () => {
                if (b.health > 0) b.stateMachine.setState('idle');
              }));
            }));
          }));
        },
        onExit: (b) => {
          b.applyBossVisuals();
        }
      });
  }

  public takeDamage(amount: number, _dirX: number) {
    if (this.isInvulnerable || this.health <= 0) return;
    this.health -= amount;
    this.scene.events.emit(GAME_EVENTS.UPDATE_BOSS_HEALTH, this.health, this.maxHealth);
    this.checkPhaseTransition();
    
    // Flash white on hit
    this.setTint(0xffffff);
    this.setTintMode(Phaser.TintModes.FILL);
    this.isInvulnerable = true;
    
    this.addBossTimer(this.scene.time.delayedCall(BOSS_STATS.invulnerabilityDuration, () => {
      if (!this.active) return;
      this.applyBossVisuals();
      this.isInvulnerable = false;
      if (this.health <= 0) {
        this.clearBossTimers();
        this.stateMachine.destroy();
        // Death sequence
        this.play({ key: 'boss_die', repeat: 0 }, true);
        this.scene.cameras.main.shake(800, 0.05);
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          y: this.y + 50,
          duration: 1000,
          delay: 500,
          onComplete: () => {
            this.setActive(false);
            this.setVisible(false);
          }
        });
      }
    }));
  }

  override destroy(fromScene?: boolean) {
    this.clearBossTimers();
    this.stateMachine.destroy();
    super.destroy(fromScene);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active && this.health > 0) {
      this.stateMachine.update(delta);
    }
  }
}
