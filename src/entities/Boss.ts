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

  private checkPhaseTransition() {
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent <= 0.3 && this.phase < 3) {
      this.phase = 3;
      this.setTint(0xff0000);
      this.scene.cameras.main.shake(500, 0.03);
      this.scene.time.delayedCall(200, () => this.clearTint());
    } else if (healthPercent <= 0.5 && this.phase < 2) {
      this.phase = 2;
      this.setTint(0xff5500);
      this.scene.cameras.main.shake(400, 0.025);
      this.scene.time.delayedCall(200, () => this.clearTint());
    }
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (b) => {
          b.setTexture('boss_idle');
          b.setVelocityX(0);
          const delay = b.isEnraged ? BOSS_STATS.idleDelay * 0.5 : BOSS_STATS.idleDelay;
          b.scene.time.delayedCall(delay, () => {
            if (b.health > 0 && b.target && !b.target.getData('isDead')) {
               const dist = Phaser.Math.Distance.Between(b.x, b.y, b.target.x, b.target.y);
               if (dist < BOSS_STATS.engageDistance) {
                 // Phase 3: alternate between slam and rush
                 if (b.phase >= 3 && Math.random() < 0.4) {
                   b.stateMachine.setState('rush');
                 } else {
                   b.stateMachine.setState('attack');
                 }
               } else {
                 b.stateMachine.setState('move');
               }
            }
          });
        }
      })
      .addState({
        name: 'move',
        onUpdate: (b) => {
          if (!b.target) return;
          const dist = Math.abs(b.target.x - b.x);
          const dir = Math.sign(b.target.x - b.x);
          const speed = b.isEnraged ? BOSS_STATS.moveSpeed * 2 : BOSS_STATS.moveSpeed;
          
          if (dist < BOSS_STATS.meleeDistance) {
            b.stateMachine.setState('attack');
          } else {
            b.setVelocityX(speed * dir);
            b.setFlipX(dir < 0);
          }
        }
      })
      .addState({
        name: 'attack',
        onEnter: (b) => {
          b.setVelocityX(0);
          b.setTint(0xff0055);
          const windup = b.isEnraged ? BOSS_STATS.attackWindup * 0.6 : BOSS_STATS.attackWindup;
          const cooldown = b.isEnraged ? BOSS_STATS.attackCooldown * 0.6 : BOSS_STATS.attackCooldown;
          
          b.scene.time.delayedCall(windup, () => {
             if (b.health > 0) {
                 b.setTexture('boss_attack');
                 b.clearTint();
                 b.scene.cameras.main.shake(300, 0.02);
                 b.scene.events.emit('boss_attack', b);

                 // Phase 2+: double strike
                 if (b.phase >= 2) {
                   b.scene.time.delayedCall(400, () => {
                     if (b.health > 0) {
                       b.scene.cameras.main.shake(300, 0.025);
                       b.scene.events.emit('boss_attack', b);
                     }
                   });
                 }
                 
                 b.scene.time.delayedCall(cooldown, () => {
                     if (b.health > 0) {
                       b.setTexture('boss_idle');
                       b.stateMachine.setState('idle');
                     }
                 });
             }
          });
        }
      })
      .addState({
        name: 'rush',
        onEnter: (b) => {
          if (!b.target) { b.stateMachine.setState('idle'); return; }
          b.setTint(0xff0000);
          const dir = Math.sign(b.target.x - b.x);
          b.setFlipX(dir < 0);

          // Charge warning
          b.scene.time.delayedCall(500, () => {
            if (b.health <= 0) return;
            b.clearTint();
            b.setVelocityX(dir * BOSS_STATS.moveSpeed * 5);
            b.scene.cameras.main.shake(200, 0.015);

            // Stop after a short rush
            b.scene.time.delayedCall(600, () => {
              if (b.health <= 0) return;
              b.setVelocityX(0);
              b.scene.events.emit('boss_attack', b);
              b.scene.cameras.main.shake(400, 0.04);

              b.scene.time.delayedCall(1000, () => {
                if (b.health > 0) b.stateMachine.setState('idle');
              });
            });
          });
        }
      });
  }

  public takeDamage(amount: number, _dirX: number) {
    if (this.isInvulnerable || this.health <= 0) return;
    this.health -= amount;
    this.checkPhaseTransition();
    
    this.setTint(0xffffff);
    this.isInvulnerable = true;
    
    this.scene.time.delayedCall(BOSS_STATS.invulnerabilityDuration, () => {
      this.clearTint();
      this.isInvulnerable = false;
      if (this.health <= 0) {
        this.destroy();
      }
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.stateMachine.update(delta);
  }
}
