import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';
import { BOSS_STATS } from '../config/enemies.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public stateMachine: StateMachine<Boss>;
  public health: number = BOSS_STATS.health;
  public maxHealth: number = BOSS_STATS.health;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private isInvulnerable = false;
  private phase: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body!.setSize(80, 80);
    this.body!.setOffset(20, 40);
    this.body!.immovable = true;
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.stateMachine = new StateMachine<Boss>(this);
    this.setupStates();
    this.stateMachine.setState('idle');
  }

  public setTarget(target: Phaser.Physics.Arcade.Sprite) {
    this.target = target;
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
    if (healthPercent <= 0.3 && this.phase < 3) {
      this.phase = 3;
      this.setTint(0xff0000);
      this.scene.cameras.main.shake(500, 0.03);
      this.scene.time.delayedCall(300, () => this.clearTint());
    } else if (healthPercent <= 0.5 && this.phase < 2) {
      this.phase = 2;
      this.setTint(0xff5500);
      this.scene.cameras.main.shake(400, 0.025);
      this.scene.time.delayedCall(300, () => this.clearTint());
    }
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (b) => {
          b.setTexture('boss_idle');
          b.setVelocityX(0);
          b.faceTarget(b);
          const delay = b.isEnraged ? BOSS_STATS.idleDelay * 0.4 : BOSS_STATS.idleDelay;
          b.scene.time.delayedCall(delay, () => {
            if (b.health <= 0 || !b.target) return;
            const dist = Phaser.Math.Distance.Between(b.x, b.y, b.target.x, b.target.y);
            // Always engage - Boss is aggressive
            if (dist < BOSS_STATS.meleeDistance) {
              if (b.phase >= 3 && Math.random() < 0.4) {
                b.stateMachine.setState('rush');
              } else {
                b.stateMachine.setState('windup');
              }
            } else {
              b.stateMachine.setState('chase');
            }
          });
        }
      })
      .addState({
        name: 'chase',
        onEnter: (b) => {
          b.setTexture('boss_idle');
          b.faceTarget(b);
        },
        onUpdate: (b) => {
          if (!b.target || b.health <= 0) return;
          const dist = Math.abs(b.target.x - b.x);
          const dir = Math.sign(b.target.x - b.x);
          const speed = b.isEnraged ? BOSS_STATS.moveSpeed * 1.5 : BOSS_STATS.moveSpeed;
          
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
          b.setTexture('boss_windup');
          b.faceTarget(b);
          const windup = b.isEnraged ? BOSS_STATS.attackWindup * 0.5 : BOSS_STATS.attackWindup;
          
          // Pulsing tint during windup for visual telegraph
          b.setTint(0xffaa00);
          b.scene.tweens.add({
            targets: b,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(windup / 200),
          });

          b.scene.time.delayedCall(windup, () => {
            if (b.health > 0) {
              b.stateMachine.setState('attack');
            }
          });
        },
        onExit: (b) => {
          b.clearTint();
          b.setAlpha(1);
        }
      })
      .addState({
        name: 'attack',
        onEnter: (b) => {
          b.setTexture('boss_attack');
          b.setVelocityX(0);
          b.scene.cameras.main.shake(300, 0.025);
          b.scene.events.emit('boss_attack', b);

          // Phase 2+: follow up with a second strike
          if (b.phase >= 2) {
            b.scene.time.delayedCall(350, () => {
              if (b.health <= 0) return;
              b.scene.cameras.main.shake(250, 0.02);
              b.scene.events.emit('boss_attack', b);
            });
          }

          const cooldown = b.isEnraged ? BOSS_STATS.attackCooldown * 0.5 : BOSS_STATS.attackCooldown;
          b.scene.time.delayedCall(cooldown, () => {
            if (b.health > 0) {
              b.stateMachine.setState('idle');
            }
          });
        }
      })
      .addState({
        name: 'rush',
        onEnter: (b) => {
          if (!b.target) { b.stateMachine.setState('idle'); return; }
          b.setTexture('boss_rush');
          b.setTint(0xff0000);
          const dir = Math.sign(b.target.x - b.x);
          b.setFlipX(dir < 0);

          // Brief telegraph before charging
          b.scene.time.delayedCall(400, () => {
            if (b.health <= 0) return;
            b.clearTint();
            b.setVelocityX(dir * BOSS_STATS.moveSpeed * 4);
            b.scene.cameras.main.shake(200, 0.015);

            // Stop and slam after rush
            b.scene.time.delayedCall(500, () => {
              if (b.health <= 0) return;
              b.setVelocityX(0);
              b.setTexture('boss_attack');
              b.scene.events.emit('boss_attack', b);
              b.scene.cameras.main.shake(400, 0.04);

              b.scene.time.delayedCall(800, () => {
                if (b.health > 0) b.stateMachine.setState('idle');
              });
            });
          });
        },
        onExit: (b) => {
          b.clearTint();
        }
      });
  }

  public takeDamage(amount: number, _dirX: number) {
    if (this.isInvulnerable || this.health <= 0) return;
    this.health -= amount;
    this.checkPhaseTransition();
    
    // Flash white on hit
    this.setTint(0xffffff);
    this.isInvulnerable = true;
    
    this.scene.time.delayedCall(BOSS_STATS.invulnerabilityDuration, () => {
      this.clearTint();
      this.isInvulnerable = false;
      if (this.health <= 0) {
        // Death sequence
        this.setTint(0xff0000);
        this.scene.cameras.main.shake(800, 0.05);
        this.scene.time.delayedCall(500, () => {
          this.destroy();
        });
      }
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.stateMachine.update(delta);
  }
}
