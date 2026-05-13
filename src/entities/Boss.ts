import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public stateMachine: StateMachine<Boss>;
  public health: number = 300;
  public maxHealth: number = 300;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private isInvulnerable = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body!.setSize(80, 80);
    this.body!.setOffset(20, 40);
    this.body!.immovable = true; // Boss is heavy

    this.stateMachine = new StateMachine(this);
    this.setupStates();
    this.stateMachine.setState('idle');
  }

  public setTarget(target: Phaser.Physics.Arcade.Sprite) {
    this.target = target;
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (b) => {
          b.setTexture('boss_idle');
          b.setVelocityX(0);
          b.scene.time.delayedCall(2000, () => {
            if (b.health > 0 && b.target && !b.target.getData('isDead')) {
               const dist = Phaser.Math.Distance.Between(b.x, b.y, b.target.x, b.target.y);
               if (dist < 500) {
                 b.stateMachine.setState('attack');
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
          
          if (dist < 200) {
            b.stateMachine.setState('attack');
          } else {
            b.setVelocityX(50 * dir); // Very slow lumbering move
            b.setFlipX(dir < 0);
          }
        }
      })
      .addState({
        name: 'attack',
        onEnter: (b) => {
          b.setVelocityX(0);
          b.setTint(0xff0055);
          
          b.scene.time.delayedCall(1000, () => { // 1 sec windup
             if (b.health > 0) {
                 b.setTexture('boss_attack');
                 b.clearTint();
                 b.scene.cameras.main.shake(300, 0.02);
                 b.scene.events.emit('boss_attack', b);
                 
                 b.scene.time.delayedCall(1500, () => { // Long cooldown
                     if (b.health > 0) {
                       b.setTexture('boss_idle');
                       b.stateMachine.setState('idle');
                     }
                 });
             }
          });
        }
      });
  }

  public takeDamage(amount: number, dirX: number) {
    if (this.isInvulnerable || this.health <= 0) return;
    this.health -= amount;
    
    // Boss doesn't get knocked back easily
    this.setTint(0xffffff);
    this.isInvulnerable = true;
    
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
      this.isInvulnerable = false;
      if (this.health <= 0) {
        this.destroy(); // Boss dies
      }
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.stateMachine.update(delta);
  }
}