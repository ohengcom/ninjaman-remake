import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';
import { ENEMY_STATS } from '../config/enemies.js';
import { GAME_EVENTS } from '../events.js';

export type EnemyType = 'guard' | 'axe' | 'ninja' | 'sniper';
type TargetSprite = Phaser.Physics.Matter.Sprite & { health?: number };

/** Maps each enemy type to its sprite sheet texture key */
const ENEMY_TEXTURES: Record<EnemyType, string> = {
  guard: 'enemy_guard_sheet',
  axe: 'enemy_axe_sheet',
  ninja: 'enemy_ninja_sheet',
  sniper: 'enemy_sniper_sheet',
};

const ENEMY_RENDER_CONFIGS = {
  guard:  { displayWidth: 130, displayHeight: 190, bodyWidth: 42, bodyHeight: 110, bodyOffsetX: 0, bodyOffsetY: 0 },
  axe:    { displayWidth: 140, displayHeight: 200, bodyWidth: 46, bodyHeight: 120, bodyOffsetX: 0, bodyOffsetY: 0 },
  ninja:  { displayWidth: 130, displayHeight: 190, bodyWidth: 40, bodyHeight: 108, bodyOffsetX: 0, bodyOffsetY: 0 },
  sniper: { displayWidth: 130, displayHeight: 190, bodyWidth: 40, bodyHeight: 108, bodyOffsetX: 0, bodyOffsetY: 0 },
} as const;

const ENEMY_GROUND_CLEARANCE = 2;

export class Enemy extends Phaser.Physics.Matter.Sprite {
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
  private currentLaser: Phaser.GameObjects.Line | null = null;

  public get baseScaleX(): number {
    const cfg = ENEMY_RENDER_CONFIGS[this.enemyType];
    return cfg.displayWidth / 340;
  }

  public get baseScaleY(): number {
    const cfg = ENEMY_RENDER_CONFIGS[this.enemyType];
    return cfg.displayHeight / 512;
  }

  private applyEnemyRender() {
    this.setScale(this.baseScaleX, this.baseScaleY);
    const cfg = ENEMY_RENDER_CONFIGS[this.enemyType];

    this.setOrigin(0.5, 0.9);
    this.setRectangle(cfg.bodyWidth, cfg.bodyHeight, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0.02,
    });
    this.setFixedRotation();
    this.setIgnoreGravity(false);
  }

  /** Get the animation key for this enemy type */
  private animKey(action: 'idle' | 'walk' | 'attack' | 'hurt' | 'die'): string {
    return `${this.enemyType}_${action}`;
  }

  destroy(fromScene?: boolean) {
    if (this.currentLaser) {
      this.currentLaser.destroy();
      this.currentLaser = null;
    }
    super.destroy(fromScene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'guard') {
    super(scene.matter.world, x, y, ENEMY_TEXTURES[type]);
    this.enemyType = type;
    scene.add.existing(this);

    this.configureType(type);
    this.applyEnemyRender();

    this.stateMachine = new StateMachine<Enemy>(this);
    this.setupStates();
    this.stateMachine.setState('patrol');
  }

  public spawn(x: number, y: number, type: EnemyType) {
    this.enemyType = type;
    this.setTexture(ENEMY_TEXTURES[type]);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    this.configureType(type);
    this.applyEnemyRender();

    this.isInvulnerable = false;
    this.patrolDir = 1;
    this.clearTint();
    this.setTintMode(Phaser.TintModes.MULTIPLY);
    this.setAlpha(1);
    this.stateMachine.setState('patrol');
  }

  public spawnOnGround(x: number, groundTop: number, type: EnemyType) {
    this.spawn(x, groundTop - this.getBodyHalfHeight() - ENEMY_GROUND_CLEARANCE, type);
  }

  private getBodyHalfHeight(): number {
    const cfg = ENEMY_RENDER_CONFIGS[this.enemyType];
    return cfg.bodyHeight / 2;
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

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'patrol',
        onEnter: (e) => {
          e.patrolTimer = e.scene.time.now + 2000;
          e.play({ key: e.animKey('walk'), repeat: -1 }, true);
        },
        onUpdate: (e) => {
          if (!e.active) return;
          if (e.enemyType === 'sniper') {
             // Snipers don't patrol, play idle
             e.play({ key: e.animKey('idle'), repeat: 0 }, true);
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
           e.play({ key: e.animKey('walk'), repeat: -1 }, true);
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
          // Play attack animation
          e.play({ key: e.animKey('attack'), repeat: 0 }, true);

          const backDir = e.flipX ? 1 : -1;
          const originalX = e.x;
          const originalY = e.y;

          // ─── Archer/Sniper Bow Draw Tension Tween ───
          if (e.enemyType === 'sniper') {
             // Slowly scale Y up and pull back horizontally to simulate drawing the bowstring
             e.scene.tweens.add({
                targets: e,
                scaleY: e.baseScaleY * 1.08,
                x: originalX + (12 * backDir),
                duration: e.attackWindup - 50,
                ease: 'Quad.easeOut'
             });
          }

          // ─── Axe Berserker Overhead Jump-Windup ───
          if (e.enemyType === 'axe') {
             // Leap slightly into the air to add momentum to the chop
             e.scene.tweens.add({
                targets: e,
                y: originalY - 18,
                duration: e.attackWindup,
                yoyo: true,
                ease: 'Quad.easeInOut'
             });
          }

          e.stateMachine.addTimer(e.scene.time.delayedCall(e.attackWindup, () => {
             e.setAlpha(1); // Ensure opacity resets

             if (e.active && e.health > 0) {
                  if (e.enemyType === 'sniper') {
                       e.scene.events.emit(GAME_EVENTS.ENEMY_SHOOT, e, e.baseDamage);
                      
                      // Elastic recoil snap upon releasing the bowstring
                      e.scene.tweens.add({
                         targets: e,
                         scaleY: e.baseScaleY,
                         x: { from: e.x - (8 * backDir), to: originalX },
                         duration: 250,
                         ease: 'Elastic.easeOut'
                      });
                  } else if (e.enemyType === 'guard') {
                      // Heavy Guard lunges forward during swing
                      const forwardDir = e.flipX ? -1 : 1;
                      e.scene.tweens.add({
                         targets: e,
                         x: e.x + (20 * forwardDir),
                         duration: 150,
                         yoyo: true,
                         ease: 'Cubic.easeOut'
                      });
                      e.scene.events.emit(GAME_EVENTS.ENEMY_ATTACK, e, e.baseDamage, e.attackReach);
                  } else if (e.enemyType === 'ninja') {
                      // Nimble Shadow Ninja strikes with a lightning-fast dash
                      const forwardDir = e.flipX ? -1 : 1;
                      e.scene.tweens.add({
                         targets: e,
                         x: e.x + (35 * forwardDir),
                         duration: 120,
                         yoyo: true,
                         ease: 'Quart.easeOut'
                      });
                      e.scene.events.emit(GAME_EVENTS.ENEMY_ATTACK, e, e.baseDamage, e.attackReach);
                  } else if (e.enemyType === 'axe') {
                      // Axe slam registers and shakes the camera on landing
                      e.scene.cameras.main.shake(120, 0.015);
                      e.scene.events.emit(GAME_EVENTS.ENEMY_ATTACK, e, e.baseDamage, e.attackReach);
                  }

                  e.stateMachine.addTimer(e.scene.time.delayedCall(e.attackCooldown, () => {
                      if (e.active && e.health > 0) e.stateMachine.setState('chase');
                  }));
             }
          }));
        },
        onExit: (e) => {
            e.setAlpha(1);
            e.scaleY = e.baseScaleY;
        }
      })
      .addState({
        name: 'hurt',
        onEnter: (e) => {
          e.play({ key: e.animKey('hurt'), repeat: 0 }, true);
           e.setTint(0xff4444);
          e.setTintMode(Phaser.TintModes.ADD);
          e.isInvulnerable = true;

          e.stateMachine.addTimer(e.scene.time.delayedCall(200, () => {
            if (!e.active) return;
             e.clearTint();
            e.setTintMode(Phaser.TintModes.MULTIPLY);
            e.isInvulnerable = false;
            if (e.health > 0) {
              e.stateMachine.setState('chase');
            } else {
              e.stateMachine.setState('dying');
            }
          }));
        }
      })
      .addState({
        name: 'dying',
        onEnter: (e) => {
          e.play({ key: e.animKey('die'), repeat: 0 }, true);
          e.setVelocityX(0);
          e.setVelocityY(0);
          // Fade out and disable after death animation
          e.scene.tweens.add({
            targets: e,
            alpha: 0,
            duration: 600,
            delay: 200,
            onComplete: () => {
              e.scene.matter.world.remove(e.body as MatterJS.BodyType);
              e.setActive(false);
              e.setVisible(false);
              e.setAlpha(1); // Reset for reuse from pool
            }
          });
        }
      });
  }

  public takeDamage(amount: number, dirX: number) {
    if (this.isInvulnerable || this.health <= 0 || !this.active) return;
    this.health -= amount;
    // Heavy enemies get knocked back less
    const kb = ENEMY_STATS[this.enemyType].knockback;
    this.setVelocityX(dirX * kb);
    this.setVelocityY(-3.5);
    this.stateMachine.setState('hurt');
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.active) {
      this.stateMachine.update(delta);
    }
  }
}
