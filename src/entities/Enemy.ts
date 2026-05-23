import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';
import { ENEMY_STATS } from '../config/enemies.js';

export type EnemyType = 'guard' | 'axe' | 'ninja' | 'sniper';
type TargetSprite = Phaser.Physics.Arcade.Sprite & { health?: number };

const ENEMY_TINTS = {
  guard: 0xd0bfff,
  axe: 0xffc078,
  ninja: 0xadb5bd,
  sniper: 0x8ce99a,
} as const;

const ENEMY_RENDER_CONFIGS = {
  guard: { displaySize: 100, bodyWidth: 320, bodyHeight: 500, bodyOffsetX: 350, bodyOffsetY: 280 },
  axe: { displaySize: 120, bodyWidth: 380, bodyHeight: 560, bodyOffsetX: 320, bodyOffsetY: 240 },
  ninja: { displaySize: 90, bodyWidth: 300, bodyHeight: 480, bodyOffsetX: 360, bodyOffsetY: 300 },
  sniper: { displaySize: 100, bodyWidth: 320, bodyHeight: 500, bodyOffsetX: 350, bodyOffsetY: 280 },
} as const;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public stateMachine: StateMachine<Enemy>;
  public enemyType: EnemyType;
  public health: number = 15;
  public baseDamage: number = 10;
  
  private patrolDir: number = 1;
  private patrolTimer: number = 0;
  private target: TargetSprite | null = null;
  private isInvulnerable = false;
  
  private moveSpeed: number = 50;
  private attackReach: number = 60;
  private attackWindup: number = 500;
  private attackCooldown: number = 800;
  protected currentVisualState: string = 'idle';
  private applyEnemyRender() {
    const cfg = ENEMY_RENDER_CONFIGS[this.enemyType];
    this.setDisplaySize(cfg.displaySize, cfg.displaySize);
    this.body!.setSize(cfg.bodyWidth, cfg.bodyHeight);
    this.body!.setOffset(cfg.bodyOffsetX, cfg.bodyOffsetY);
    this.setTint(ENEMY_TINTS[this.enemyType]);
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
  }

  public play(key: any, ..._args: any[]): this {
    const keyStr = typeof key === 'string' ? key : (key?.key || '');
    this.currentVisualState = keyStr;
    this.applyEnemyRender();
    return this;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'guard') {
    super(scene, x, y, 'ninja_sprite');
    this.enemyType = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.configureType(type);
    this.applyEnemyRender();

    this.stateMachine = new StateMachine<Enemy>(this);
    this.setupStates();
    this.stateMachine.setState('patrol');
  }

  public spawn(x: number, y: number, type: EnemyType) {
    this.enemyType = type;
    this.setTexture('ninja_sprite');
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.enableBody(true, x, y, true, true);
    
    this.configureType(type);
    this.applyEnemyRender();
    this.isInvulnerable = false;
    this.patrolDir = 1;
    this.stateMachine.setState('patrol');
  }

  private configureType(type: EnemyType) {
    const stats = ENEMY_STATS[type];
    this.health = stats.health;
    this.baseDamage = stats.baseDamage;
    this.moveSpeed = stats.moveSpeed;
    this.attackReach = stats.attackReach;
    this.attackWindup = stats.attackWindup;
    this.attackCooldown = stats.attackCooldown;
  }

  public setTarget(target: TargetSprite) {
    this.target = target;
  }

  private getWalkAnim() {
    if (this.enemyType === 'ninja') return 'enemy_ninja_run_anim';
    if (this.enemyType === 'sniper') return 'enemy_sniper_idle_anim';
    return `enemy_${this.enemyType}_walk_anim`;
  }

  private getAttackAnim() {
    if (this.enemyType === 'sniper') return 'enemy_sniper_shoot_anim';
    return `enemy_${this.enemyType}_attack_anim`;
  }

  private getWindupAnim() {
    if (this.enemyType === 'axe') return 'enemy_axe_windup_anim';
    return null;
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'patrol',
        onEnter: (e) => {
          e.patrolTimer = e.scene.time.now + 2000;
          e.play({ key: e.getWalkAnim(), repeat: -1 }, true);
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
        onEnter: (e) => {
           e.play({ key: e.getWalkAnim(), repeat: -1 }, true);
        },
        onUpdate: (e) => {
          if (!e.active) return;
          if (!e.target || !e.target.active || (e.target.health ?? 1) <= 0) {
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

          const windupAnim = e.getWindupAnim();
          if (windupAnim) {
            e.play(windupAnim);
          } else {
            // For others, if no distinct windup anim, we could tint or just play attack but wait.
            // Let's just play attack animation directly or a specific frame
            e.play(e.getAttackAnim());
          }

          // Show laser sight for sniper
          let laser: Phaser.GameObjects.Line | null = null;
          if (e.enemyType === 'sniper' && e.target) {
             const dir = e.flipX ? -1 : 1;
             laser = e.scene.add.line(0, 0, e.x, e.y, e.x + (e.attackReach * dir), e.y, 0xff6b6b, 0.5).setOrigin(0);
          }

          (e as any)._currentLaser = laser; // store for cleanup

          e.stateMachine.addTimer(e.scene.time.delayedCall(e.attackWindup, () => {
             if (laser) {
                 laser.destroy();
                 (e as any)._currentLaser = null;
             }

             if (e.active && e.health > 0) {
                 if (windupAnim) {
                   e.play(e.getAttackAnim());
                 }

                 if (e.enemyType === 'sniper') {
                     e.scene.events.emit('enemy_shoot', e, e.baseDamage);
                 } else {
                     e.scene.events.emit('enemy_attack', e, e.baseDamage, e.attackReach);
                 }

                 e.stateMachine.addTimer(e.scene.time.delayedCall(e.attackCooldown, () => {
                     if (e.active && e.health > 0) e.stateMachine.setState('chase');
                 }));
             }
          }));
        },
        onExit: (e) => {
            if ((e as any)._currentLaser) {
                (e as any)._currentLaser.destroy();
                (e as any)._currentLaser = null;
            }
        }
      })
      .addState({
        name: 'hurt',
        onEnter: (e) => {
          e.setTint(0xff0000);
          e.isInvulnerable = true;

          e.stateMachine.addTimer(e.scene.time.delayedCall(150, () => {
            if (!e.active) return;
            e.clearTint();
            e.isInvulnerable = false;
            if (e.health > 0) {
              e.stateMachine.setState('chase');
            } else {
              e.disableBody(true, true);
            }
          }));
        }
      });  }

  public takeDamage(amount: number, dirX: number) {
    if (this.isInvulnerable || this.health <= 0 || !this.active) return;
    this.health -= amount;
    // Heavy enemies get knocked back less
    const kb = ENEMY_STATS[this.enemyType].knockback;
    this.setVelocityX(dirX * kb);
    this.setVelocityY(-150);
    this.stateMachine.setState('hurt');
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active) {
      this.stateMachine.update(delta);

      // Procedural Animation System
      const cfg = ENEMY_RENDER_CONFIGS[this.enemyType];
      const baseScaleX = cfg.displaySize / 1024;
      const baseScaleY = cfg.displaySize / 1024;

      if (this.health <= 0) {
        this.setAngle(this.flipX ? -90 : 90);
        this.setScale(baseScaleX, baseScaleY);
      } else {
        const stateName = this.stateMachine.getCurrentStateName();
        let sx = 1.0;
        let sy = 1.0;
        let angle = 0;

        if (stateName === 'hurt') {
          // Hurt: flash red & severe shake
          sx = 0.88;
          sy = 1.15;
          angle = Math.sin(time * 0.08) * 12;
          this.x += Math.sin(time * 0.15) * 1.5;
        } else if (stateName === 'attack') {
          // Attack: lunge slash
          sx = 1.12;
          sy = 0.90;
          angle = this.flipX ? -15 : 15;
        } else if (this.currentVisualState.includes('walk') || this.currentVisualState.includes('run')) {
          // Movement sway
          const speedFactor = this.enemyType === 'ninja' ? 0.024 : 0.016;
          const sway = Math.sin(time * speedFactor) * 7;
          angle = sway + (this.flipX ? 4 : -4);
          
          const bounce = Math.abs(Math.sin(time * speedFactor)) * 0.05;
          sx = 1.04 - bounce;
          sy = 0.96 + bounce;
        } else if (this.currentVisualState.includes('windup')) {
          // Axe windup
          const pulse = Math.sin(time * 0.03) * 0.08;
          sx = 1.0 + pulse;
          sy = 1.0 - pulse;
          angle = Math.sin(time * 0.05) * 5;
        } else {
          // Idle breathing
          const speedFactor = this.enemyType === 'ninja' ? 0.014 : 0.010;
          const breathe = Math.sin(time * speedFactor) * 0.03;
          sx = 1.0 - breathe;
          sy = 1.0 + breathe;
        }

        this.setScale(baseScaleX * sx, baseScaleY * sy);
        this.setAngle(angle);
      }
    }
  }
}
