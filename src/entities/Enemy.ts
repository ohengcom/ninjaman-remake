import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';

export type EnemyType = 'guard' | 'axe' | 'ninja' | 'sniper';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public stateMachine: StateMachine<Enemy>;
  public enemyType: EnemyType;
  public health: number = 15;
  public baseDamage: number = 10;
  
  private patrolDir: number = 1;
  private patrolTimer: number = 0;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private isInvulnerable = false;
  
  private moveSpeed: number = 50;
  private attackReach: number = 60;
  private attackWindup: number = 500;
  private attackCooldown: number = 800;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'guard') {
    super(scene, x, y, `enemy_${type}`);
    this.enemyType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body!.setSize(40, 40);
    this.body!.setOffset(20, 20);

    this.configureType(type);

    this.stateMachine = new StateMachine(this);
    this.setupStates();
    this.stateMachine.setState('patrol');
  }

  public spawn(x: number, y: number, type: EnemyType) {
    this.enemyType = type;
    this.setTexture(`enemy_${type}`);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.enableBody(true, x, y, true, true);
    
    this.configureType(type);
    this.isInvulnerable = false;
    this.patrolDir = 1;
    this.stateMachine.setState('patrol');
  }

  private configureType(type: EnemyType) {
    if (type === 'guard') {
      this.health = 15;
      this.baseDamage = 10;
      this.moveSpeed = 40;
      this.attackReach = 60;
      this.attackWindup = 500;
      this.attackCooldown = 800;
    } else if (type === 'axe') {
      this.health = 30; // Tanky
      this.baseDamage = 25; // High damage
      this.moveSpeed = 25; // Slow
      this.attackReach = 70;
      this.attackWindup = 800; // Slow windup
      this.attackCooldown = 1200;
    } else if (type === 'ninja') {
      this.health = 10; // Fragile
      this.baseDamage = 5; // Low damage
      this.moveSpeed = 120; // Fast
      this.attackReach = 50;
      this.attackWindup = 200; // Fast attack
      this.attackCooldown = 400;
    } else if (type === 'sniper') {
      this.health = 10;
      this.baseDamage = 15;
      this.moveSpeed = 0; // Stationary
      this.attackReach = 600; // Very long range
      this.attackWindup = 1000; // Slow aim
      this.attackCooldown = 2000;
    }
  }

  public setTarget(target: Phaser.Physics.Arcade.Sprite) {
    this.target = target;
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'patrol',
        onEnter: (e) => {
          e.patrolTimer = e.scene.time.now + 2000;
        },
        onUpdate: (e) => {
          if (!e.active) return;
          if (e.enemyType === 'sniper') {
             // Snipers don't patrol, just look for target
             if (e.target && e.target.active && Phaser.Math.Distance.Between(e.x, e.y, e.target.x, e.target.y) < e.attackReach) {
               e.stateMachine.setState('chase');
             }
             return;
          }

          if (e.scene.time.now > e.patrolTimer) {
            e.patrolDir *= -1;
            e.patrolTimer = e.scene.time.now + 2000 + Math.random() * 2000;
          }
          
          e.setVelocityX(e.moveSpeed * e.patrolDir);
          e.setFlipX(e.patrolDir < 0);

          if (e.target && e.target.active && Phaser.Math.Distance.Between(e.x, e.y, e.target.x, e.target.y) < 300) {
            e.stateMachine.setState('chase');
          }
        }
      })
      .addState({
        name: 'chase',
        onUpdate: (e) => {
          if (!e.active) return;
          if (!e.target || !e.target.active || (e.target as any).health <= 0) {
            e.stateMachine.setState('patrol');
            return;
          }

          const dist = Math.abs(e.target.x - e.x);
          const dir = Math.sign(e.target.x - e.x);
          
          e.setFlipX(dir < 0);

          if (dist > e.attackReach + 100) {
             e.stateMachine.setState('patrol');
          } else if (dist <= e.attackReach) {
             if (e.enemyType === 'sniper' || dist < e.attackReach) {
                e.stateMachine.setState('attack');
             }
          } else if (e.enemyType !== 'sniper') {
            e.setVelocityX((e.moveSpeed * 1.5) * dir);
          }
        }
      })
      .addState({
        name: 'attack',
        onEnter: (e) => {
          e.setVelocityX(0);
          e.setTint(0xffaa00);
          
          // Show laser sight for sniper
          let laser: Phaser.GameObjects.Line | null = null;
          if (e.enemyType === 'sniper' && e.target) {
             const dir = e.flipX ? -1 : 1;
             laser = e.scene.add.line(0, 0, e.x, e.y, e.x + (e.attackReach * dir), e.y, 0xff0055, 0.5).setOrigin(0);
          }

          e.scene.time.delayedCall(e.attackWindup, () => {
             if (laser) laser.destroy();
             
             if (e.active && e.health > 0) {
                 e.clearTint();
                 
                 if (e.enemyType === 'sniper') {
                     e.scene.events.emit('enemy_shoot', e, e.baseDamage);
                 } else {
                     e.scene.events.emit('enemy_attack', e, e.baseDamage, e.attackReach);
                 }

                 e.scene.time.delayedCall(e.attackCooldown, () => {
                     if (e.active && e.health > 0) e.stateMachine.setState('chase');
                 });
             }
          });
        },
        onExit: (e) => {
            e.clearTint();
        }
      })
      .addState({
        name: 'hurt',
        onEnter: (e) => {
          e.setTint(0xffffff);
          e.isInvulnerable = true;
          
          e.scene.time.delayedCall(150, () => {
            if (!e.active) return;
            e.clearTint();
            e.isInvulnerable = false;
            if (e.health > 0) {
              e.stateMachine.setState('chase');
            } else {
              e.disableBody(true, true);
            }
          });
        }
      });
  }

  public takeDamage(amount: number, dirX: number) {
    if (this.isInvulnerable || this.health <= 0 || !this.active) return;
    this.health -= amount;
    // Heavy enemies get knocked back less
    const kb = this.enemyType === 'axe' ? 50 : (this.enemyType === 'ninja' ? 250 : 150);
    this.setVelocityX(dirX * kb);
    this.setVelocityY(-150);
    this.stateMachine.setState('hurt');
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active) {
      this.stateMachine.update(delta);
    }
  }
}