import Phaser from 'phaser';

export class AnimationFactory {
  static createPlayerAnimations(anims: Phaser.Animations.AnimationManager) {
    // We assume player_sheet is 4x4 (16 frames)
    // Frame 0-3: Idle
    anims.create({
      key: 'player_idle_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Frame 4-7: Run
    anims.create({
      key: 'player_run_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 4, end: 7 }),
      frameRate: 12,
      repeat: -1
    });

    // Frame 8: Jump, Frame 9: Fall
    anims.create({
      key: 'player_jump_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 8, end: 8 }),
      frameRate: 1,
      repeat: 0
    });
    
    anims.create({
      key: 'player_fall_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 9, end: 9 }),
      frameRate: 1,
      repeat: 0
    });

    // Frame 10-12: Attack Combo
    anims.create({
      key: 'player_attack_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 10, end: 12 }),
      frameRate: 15,
      repeat: 0
    });

    // Frame 13: Dash
    anims.create({
      key: 'player_dash_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 13, end: 13 }),
      frameRate: 1,
      repeat: 0
    });

    // Frame 14: Defend
    anims.create({
      key: 'player_defend_anim',
      frames: anims.generateFrameNumbers('player_sheet', { start: 14, end: 14 }),
      frameRate: 1,
      repeat: 0
    });
  }
}
