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

  private currentVisualState: string = 'idle';
  private maskGraphics!: Phaser.GameObjects.Graphics;
  private borderGraphics!: Phaser.GameObjects.Graphics;

  private applyBossRender() {
    this.setDisplaySize(220, 220);
    
    // Circular mask
    if (!this.maskGraphics) {
      this.maskGraphics = this.scene.make.graphics({}, false);
      this.maskGraphics.fillStyle(0xffffff);
      this.maskGraphics.fillCircle(0, 0, 220 * 0.44);
      
      const mask = this.maskGraphics.createGeometryMask();
      this.setMask(mask);
    }

    this.body!.setSize(372, 558);
    this.body!.setOffset(325, 465);
    
    // Boss phases color feedback
    if (this.phase === 2) {
      this.setTint(0xffd43b); // Golden
    } else if (this.phase === 3) {
      this.setTint(0xff6b6b); // Red/Enraged
    } else {
      this.setTint(0xffd43b); // Default glowing gold
    }
  }

  destroy(fromScene?: boolean) {
    if (this.maskGraphics) this.maskGraphics.destroy();
    if (this.borderGraphics) this.borderGraphics.destroy();
    super.destroy(fromScene);
  }

  public play(key: any, ..._args: any[]): this {
    const keyStr = typeof key === 'string' ? key : (key?.key || '');
    this.currentVisualState = keyStr;
    this.applyBossRender();
    return this;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ninja_sprite');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body!.immovable = true;
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.applyBossRender();

    // Create glowing border graphics
    this.borderGraphics = scene.add.graphics();
    this.borderGraphics.setDepth(this.depth + 1);

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
      this.setTint(0xff6b6b);
      this.scene.cameras.main.shake(500, 0.03);
      this.scene.time.delayedCall(300, () => this.clearTint());
    } else if (healthPercent <= 0.5 && this.phase < 2) {
      this.phase = 2;
      this.setTint(0xffd43b);
      this.scene.cameras.main.shake(400, 0.025);
      this.scene.time.delayedCall(300, () => this.clearTint());
    }
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (b) => {
          b.play({ key: 'boss_idle_anim', repeat: -1 }, true);
          b.setVelocityX(0);
          b.faceTarget(b);
          const delay = b.isEnraged ? BOSS_STATS.idleDelay * 0.4 : BOSS_STATS.idleDelay;
          b.stateMachine.addTimer(b.scene.time.delayedCall(delay, () => {
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
          }));
        }
      })
      .addState({
        name: 'chase',
        onEnter: (b) => {
          b.play({ key: 'boss_walk_anim', repeat: -1 }, true);
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
          b.play('boss_windup_anim');
          b.faceTarget(b);
          const windup = b.isEnraged ? BOSS_STATS.attackWindup * 0.5 : BOSS_STATS.attackWindup;
          
          // Pulsing tint during windup for visual telegraph
          b.setTint(0xffd43b);
          b.scene.tweens.add({
            targets: b,
            alpha: 0.7,
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
          b.clearTint();
          b.setAlpha(1);
        }
      })
      .addState({
        name: 'attack',
        onEnter: (b) => {
          b.play('boss_attack_anim');
          b.setVelocityX(0);
          b.scene.cameras.main.shake(300, 0.025);
          b.scene.events.emit('boss_attack', b);

          // Phase 2+: follow up with a second strike
          if (b.phase >= 2) {
            b.stateMachine.addTimer(b.scene.time.delayedCall(350, () => {
              if (b.health <= 0) return;
              b.scene.cameras.main.shake(250, 0.02);
              b.scene.events.emit('boss_attack', b);
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
          b.play({ key: 'boss_rush_anim', repeat: -1 }, true);
          b.setTint(0xff6b6b);
          const dir = Math.sign(b.target.x - b.x);
          b.setFlipX(dir < 0);

          // Brief telegraph before charging
          b.stateMachine.addTimer(b.scene.time.delayedCall(400, () => {
            if (b.health <= 0) return;
            b.clearTint();
            b.setVelocityX(dir * BOSS_STATS.moveSpeed * 4);
            b.scene.cameras.main.shake(200, 0.015);

            // Stop and slam after rush
            b.stateMachine.addTimer(b.scene.time.delayedCall(500, () => {
              if (b.health <= 0) return;
              b.setVelocityX(0);
              b.play('boss_attack_anim');
              b.scene.events.emit('boss_attack', b);
              b.scene.cameras.main.shake(400, 0.04);

              b.stateMachine.addTimer(b.scene.time.delayedCall(800, () => {
                if (b.health > 0) b.stateMachine.setState('idle');
              }));
            }));
          }));
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
      this.applyBossRender(); // Re-apply default golden/phase tint instead of clearing
      this.isInvulnerable = false;
      if (this.health <= 0) {
        // Death sequence
        this.setTint(0xff6b6b);
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

    // Procedural Animation System
    const baseScaleX = 220 / 1024;
    const baseScaleY = 220 / 1024;

    if (this.health <= 0) {
      this.setAngle(this.flipX ? -90 : 90);
      this.setScale(baseScaleX, baseScaleY);
    } else {
      const anim = this.currentVisualState;
      let sx = 1.0;
      let sy = 1.0;
      let angle = 0;

      if (anim.includes('idle')) {
        // Slow heavy breathing
        const breathe = Math.sin(time * 0.006) * 0.04;
        sx = 1.0 - breathe;
        sy = 1.0 + breathe;
      } else if (anim.includes('walk') || this.body!.velocity.x !== 0) {
        // Giant heavy sway walk
        const sway = Math.sin(time * 0.01) * 6;
        angle = sway + (this.flipX ? 4 : -4);
        
        const bounce = Math.abs(Math.sin(time * 0.01)) * 0.06;
        sx = 1.06 - bounce;
        sy = 0.94 + bounce;
      } else if (anim.includes('windup')) {
        // Aggressive pulsing windup
        const pulse = Math.sin(time * 0.04) * 0.09;
        sx = 1.0 - pulse;
        sy = 1.0 + pulse;
        angle = Math.sin(time * 0.06) * 6;
      } else if (anim.includes('rush')) {
        // Aerodynamic charge lean
        sx = 1.22;
        sy = 0.82;
        angle = this.flipX ? -25 : 25;
      } else if (anim.includes('attack')) {
        // Slam lunge stretch
        sx = 1.15;
        sy = 0.85;
        angle = this.flipX ? -15 : 15;
      }

      // Flash gold/enraged tint on windup or phase changes
      if (anim.includes('windup') && Math.floor(time / 100) % 2 === 0) {
        this.setTint(0xffffff); // Telegraph flash
      } else {
        this.applyBossRender();
      }

      this.setScale(baseScaleX * sx, baseScaleY * sy);
      this.setAngle(angle);

      // Update circular mask & glowing border coordinates smoothly
      if (this.maskGraphics) {
        this.maskGraphics.setPosition(this.x, this.y);
      }

      if (this.borderGraphics) {
        this.borderGraphics.clear();
        if (this.active && this.health > 0) {
          this.borderGraphics.setPosition(this.x, this.y);
          
          // Massive glowing golden/red ring for Boss
          const color = this.phase === 3 ? 0xff6b6b : 0xffd43b;
          
          // Thick outer ring
          this.borderGraphics.lineStyle(4.0, color, 0.9);
          this.borderGraphics.strokeCircle(0, 0, 220 * 0.44);
          
          // Second inner ring
          this.borderGraphics.lineStyle(1.5, color, 0.5);
          this.borderGraphics.strokeCircle(0, 0, 220 * 0.40);
        }
      }
    }
  }
}
