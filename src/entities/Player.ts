import Phaser from 'phaser';
import { StateMachine } from '../utils/StateMachine.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stateMachine: StateMachine<Player>;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public attackKey!: Phaser.Input.Keyboard.Key;
  
  public health: number = 100;
  public maxHealth: number = 100;
  public isInvulnerable: boolean = false;
  public isBlocking: boolean = false;
  public jumpCount: number = 0;

  public comboStep: number = 0;
  public lastAttackTime: number = 0;
  
  private lastTapLeftTime: number = 0;
  private lastTapRightTime: number = 0;
  private dashDir: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body!.setSize(30, 40);
    this.body!.setOffset(25, 20);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.stateMachine = new StateMachine(this);
    this.setupStates();
    this.stateMachine.setState('idle');
  }

  private checkDashInput(): boolean {
    const time = this.scene.time.now;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      if (time - this.lastTapLeftTime < 300) { this.dashDir = -1; return true; }
      this.lastTapLeftTime = time;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      if (time - this.lastTapRightTime < 300) { this.dashDir = 1; return true; }
      this.lastTapRightTime = time;
    }
    return false;
  }

  private checkAttackInput(): string | null {
    if (!Phaser.Input.Keyboard.JustDown(this.attackKey)) return null;
    
    if (this.cursors.up.isDown) return 'attack_uppercut';
    if (!this.body!.touching.down && this.cursors.down.isDown) return 'attack_dive';
    
    // Combo logic
    const time = this.scene.time.now;
    if (time - this.lastAttackTime < 800) {
      this.comboStep = (this.comboStep + 1) % 4; // 0 to 3 for 4-hit combo
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
    if (p.cursors.down.isDown && p.body!.touching.down) {
      p.stateMachine.setState('defend');
      return true;
    }
    const attackState = p.checkAttackInput();
    if (attackState) {
      p.stateMachine.setState(attackState);
      return true;
    }
    if (Phaser.Input.Keyboard.JustDown(p.cursors.up) && p.jumpCount < 2) {
      p.stateMachine.setState('jump');
      return true;
    }
    if (!p.body!.touching.down && p.body!.velocity.y > 0 && p.stateMachine.getCurrentStateName() !== 'jump') {
      p.stateMachine.setState('fall');
      return true;
    }
    return false;
  }

  private setupStates() {
    this.stateMachine
      .addState({
        name: 'idle',
        onEnter: (p) => {
          p.setTexture('player_idle');
          p.setVelocityX(0);
          p.jumpCount = 0;
          p.isBlocking = false;
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          if (p.cursors.left.isDown || p.cursors.right.isDown) {
            p.stateMachine.setState('run');
          }
        }
      })
      .addState({
        name: 'run',
        onEnter: (p) => {
          p.setTexture('player_run');
          p.jumpCount = 0;
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          if (p.cursors.left.isDown) {
            p.setVelocityX(-400); p.setFlipX(true);
          } else if (p.cursors.right.isDown) {
            p.setVelocityX(400); p.setFlipX(false);
          } else {
            p.stateMachine.setState('idle');
          }
        }
      })
      .addState({
        name: 'dash',
        onEnter: (p) => {
          p.setTexture('player_dash');
          p.setVelocityX(p.dashDir * 800);
          p.isInvulnerable = true;
          p.scene.time.delayedCall(300, () => {
             if (p.health > 0) p.stateMachine.setState('idle');
          });
        },
        onExit: (p) => { p.isInvulnerable = false; }
      })
      .addState({
        name: 'defend',
        onEnter: (p) => {
          p.setTexture('player_defend');
          p.setVelocityX(0);
          p.isBlocking = true;
        },
        onUpdate: (p) => {
          if (!p.cursors.down.isDown) p.stateMachine.setState('idle');
        },
        onExit: (p) => { p.isBlocking = false; }
      })
      .addState({
        name: 'jump',
        onEnter: (p) => {
          p.setTexture('player_jump');
          p.setVelocityY(p.jumpCount === 0 ? -600 : -550);
          p.jumpCount++;
        },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          p.handleAirMovement();
        }
      })
      .addState({
        name: 'fall',
        onEnter: (p) => { p.setTexture('player_jump'); },
        onUpdate: (p) => {
          if (p.handleCommonTransitions(p)) return;
          p.handleAirMovement();
          if (p.body!.touching.down) p.stateMachine.setState('idle');
        }
      })
      .addState({
        name: 'attack_combo',
        onEnter: (p) => {
          p.setTexture('player_attack');
          p.setVelocityX(p.flipX ? -50 : 50); // slight forward momentum
          p.scene.cameras.main.shake(100, 0.005);
          p.scene.events.emit('player_attack', p, 'combo');
          
          p.scene.time.delayedCall(200, () => {
            if (p.health > 0) p.stateMachine.setState(p.body!.touching.down ? 'idle' : 'fall');
          });
        }
      })
      .addState({
        name: 'attack_uppercut',
        onEnter: (p) => {
          p.setTexture('player_uppercut');
          p.setVelocityY(-500); // Launcher
          p.setVelocityX(0);
          p.scene.cameras.main.shake(150, 0.01);
          p.scene.events.emit('player_attack', p, 'uppercut');
          p.scene.time.delayedCall(300, () => {
            if (p.health > 0) p.stateMachine.setState('fall');
          });
        }
      })
      .addState({
        name: 'attack_dive',
        onEnter: (p) => {
          p.setTexture('player_dive');
          p.setVelocityY(800); // Fast downward
          p.setVelocityX(p.flipX ? -300 : 300);
          p.scene.events.emit('player_attack', p, 'dive');
        },
        onUpdate: (p) => {
           if (p.body!.touching.down) {
              p.scene.cameras.main.shake(200, 0.02);
              p.scene.events.emit('player_attack', p, 'dive_land');
              p.stateMachine.setState('idle');
           }
        }
      })
      .addState({
        name: 'hurt',
        onEnter: (p) => {
          p.setTexture('player_idle');
          p.setTint(0xff0000);
          p.isInvulnerable = true;
          p.isBlocking = false;
          p.scene.cameras.main.shake(200, 0.01);
          
          p.scene.time.delayedCall(300, () => {
            p.clearTint();
            p.stateMachine.setState(p.body!.touching.down ? 'idle' : 'fall');
          });

          p.scene.time.delayedCall(1000, () => {
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
    if (this.cursors.left.isDown) {
      this.setVelocityX(-300); this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300); this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }
  }

  public takeDamage(amount: number, dirX: number) {
    if (this.isInvulnerable || this.health <= 0) return;
    
    // Parry / Defend Logic
    if (this.isBlocking && Math.sign(dirX) !== (this.flipX ? -1 : 1)) {
       // Successful block! Take reduced damage, no knockback, emit parry
       this.health -= Math.floor(amount * 0.2);
       this.scene.events.emit('player_parry', this);
       // Pushback slightly
       this.setVelocityX(dirX * 100);
       return;
    }

    this.health -= amount;
    this.setVelocityX(dirX * 250);
    this.setVelocityY(-200);
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
    
    if (this.isInvulnerable && this.stateMachine.getCurrentStateName() !== 'hurt') {
      this.setAlpha(time % 200 < 100 ? 0.5 : 1);
    }
  }
}