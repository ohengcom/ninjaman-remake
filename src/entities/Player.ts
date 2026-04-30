import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity.js';
import { PLAYER_CONFIG } from '../utils/constants.js';

export class Player extends BaseEntity {
  private isAttacking: boolean = false;
  private isDefending: boolean = false;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey: Phaser.Input.Keyboard.Key;
  private defendKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ninja_0');
    
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setSize(40, 60);
    this.setOffset(12, 4);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.defendKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.createAnimations();
  }

  private createAnimations(): void {
    const anims = this.scene.anims;

    if (!anims.exists('player_idle')) {
      anims.create({
        key: 'player_idle',
        frames: [0, 1, 2, 3].map(f => ({ key: `ninja_${f}` })),
        frameRate: 8,
        repeat: -1,
      });

      anims.create({
        key: 'player_run',
        frames: [30, 31, 32, 33, 34, 35, 36, 37, 38].map(f => ({ key: `ninja_${f}` })),
        frameRate: 12,
        repeat: -1,
      });

      anims.create({
        key: 'player_attack',
        frames: [725, 726, 727, 728, 729, 730].map(f => ({ key: `ninja_${f}` })),
        frameRate: 15,
        repeat: 0,
      });

      anims.create({
        key: 'player_jump',
        frames: [162, 163, 164].map(f => ({ key: `ninja_${f}` })),
        frameRate: 10,
        repeat: 0,
      });

      anims.create({
        key: 'player_defend',
        frames: [116, 117, 118].map(f => ({ key: `ninja_${f}` })),
        frameRate: 10,
        repeat: 0,
      });
    }
  }

  public update(): void {
    this.handleInput();
  }

  private handleInput(): void {
    const onGround = this.body!.touching.down;

    if (this.isAttacking) return;

    // Defend
    if (this.defendKey.isDown) {
      this.isDefending = true;
      this.setVelocityX(0);
      this.play('player_defend', true);
      return;
    } else {
      this.isDefending = false;
    }

    // Movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-PLAYER_CONFIG.SPEED);
      this.setFlipX(true);
      if (onGround) this.play('player_run', true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(PLAYER_CONFIG.SPEED);
      this.setFlipX(false);
      if (onGround) this.play('player_run', true);
    } else {
      this.setVelocityX(0);
      if (onGround) this.play('player_idle', true);
    }

    // Jump
    if (this.cursors.up.isDown && onGround) {
      this.setVelocityY(PLAYER_CONFIG.JUMP_FORCE);
      this.play('player_jump', true);
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.performAttack();
    }
  }

  private performAttack(): void {
    this.isAttacking = true;
    this.setVelocityX(0);
    this.play('player_attack', true);
    this.scene.sound.play('attack');
    
    this.once('animationcomplete', () => {
      this.isAttacking = false;
    });
  }

  public getIsAttacking(): boolean {
    return this.isAttacking;
  }

  public getIsDefending(): boolean {
    return this.isDefending;
  }
}
