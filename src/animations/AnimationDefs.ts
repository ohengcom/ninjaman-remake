import Phaser from 'phaser';

/**
 * Register all game animations from the loaded sprite sheets and atlases.
 * Called once from BootScene.create().
 */
export function registerAnimations(scene: Phaser.Scene): void {
  // ─── Player animations (knight atlas - kept for rich attack animations) ───
  scene.anims.create({ key: 'player_idle', frames: [{ key: 'knight', frame: 'guard/frame0001' }], frameRate: 1, repeat: 0 });
  scene.anims.create({ key: 'player_run', frames: scene.anims.generateFrameNames('knight', { prefix: 'run/frame', start: 0, end: 7, zeroPad: 4 }), frameRate: 15, repeat: -1 });
  scene.anims.create({ key: 'player_jump', frames: scene.anims.generateFrameNames('knight', { prefix: 'jump_loop/frame', start: 0, end: 1, zeroPad: 4 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: 'player_fall', frames: scene.anims.generateFrameNames('knight', { prefix: 'fall_loop/frame', start: 0, end: 1, zeroPad: 4 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: 'player_attack_A', frames: scene.anims.generateFrameNames('knight', { prefix: 'attack_A/frame', start: 0, end: 12, zeroPad: 4 }), frameRate: 20, repeat: 0 });
  scene.anims.create({ key: 'player_attack_B', frames: scene.anims.generateFrameNames('knight', { prefix: 'attack_B/frame', start: 0, end: 9, zeroPad: 4 }), frameRate: 20, repeat: 0 });
  scene.anims.create({ key: 'player_attack_C', frames: scene.anims.generateFrameNames('knight', { prefix: 'attack_C/frame', start: 0, end: 12, zeroPad: 4 }), frameRate: 20, repeat: 0 });
  scene.anims.create({ key: 'player_hurt', frames: [{ key: 'knight', frame: 'guard/frame0001' }], frameRate: 10, repeat: 0 });
  // Alias for generic player_attack used by wave state
  scene.anims.create({ key: 'player_attack', frames: scene.anims.generateFrameNames('knight', { prefix: 'attack_A/frame', start: 0, end: 5, zeroPad: 4 }), frameRate: 20, repeat: 0 });

  // ─── Guard enemy animations (enemy_guard_sheet spritesheet: 6 frames) ───
  scene.anims.create({ key: 'guard_idle', frames: [{ key: 'enemy_guard_sheet', frame: 0 }], frameRate: 1, repeat: 0 });
  scene.anims.create({ key: 'guard_walk', frames: scene.anims.generateFrameNumbers('enemy_guard_sheet', { start: 1, end: 2 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'guard_attack', frames: [{ key: 'enemy_guard_sheet', frame: 3 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'guard_hurt', frames: [{ key: 'enemy_guard_sheet', frame: 4 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'guard_die', frames: [{ key: 'enemy_guard_sheet', frame: 5 }], frameRate: 8, repeat: 0 });

  // ─── Axe enemy animations ───
  scene.anims.create({ key: 'axe_idle', frames: [{ key: 'enemy_axe_sheet', frame: 0 }], frameRate: 1, repeat: 0 });
  scene.anims.create({ key: 'axe_walk', frames: scene.anims.generateFrameNumbers('enemy_axe_sheet', { start: 1, end: 2 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'axe_attack', frames: [{ key: 'enemy_axe_sheet', frame: 3 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'axe_hurt', frames: [{ key: 'enemy_axe_sheet', frame: 4 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'axe_die', frames: [{ key: 'enemy_axe_sheet', frame: 5 }], frameRate: 8, repeat: 0 });

  // ─── Ninja enemy animations ───
  scene.anims.create({ key: 'ninja_idle', frames: [{ key: 'enemy_ninja_sheet', frame: 0 }], frameRate: 1, repeat: 0 });
  scene.anims.create({ key: 'ninja_walk', frames: scene.anims.generateFrameNumbers('enemy_ninja_sheet', { start: 1, end: 2 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: 'ninja_attack', frames: [{ key: 'enemy_ninja_sheet', frame: 3 }], frameRate: 10, repeat: 0 });
  scene.anims.create({ key: 'ninja_hurt', frames: [{ key: 'enemy_ninja_sheet', frame: 4 }], frameRate: 10, repeat: 0 });
  scene.anims.create({ key: 'ninja_die', frames: [{ key: 'enemy_ninja_sheet', frame: 5 }], frameRate: 10, repeat: 0 });

  // ─── Sniper enemy animations ───
  scene.anims.create({ key: 'sniper_idle', frames: [{ key: 'enemy_sniper_sheet', frame: 0 }], frameRate: 1, repeat: 0 });
  scene.anims.create({ key: 'sniper_walk', frames: scene.anims.generateFrameNumbers('enemy_sniper_sheet', { start: 1, end: 2 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'sniper_attack', frames: [{ key: 'enemy_sniper_sheet', frame: 3 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'sniper_hurt', frames: [{ key: 'enemy_sniper_sheet', frame: 4 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'sniper_die', frames: [{ key: 'enemy_sniper_sheet', frame: 5 }], frameRate: 8, repeat: 0 });

  // ─── Boss animations (boss_oni_sheet: 6 frames) ───
  scene.anims.create({ key: 'boss_idle', frames: [{ key: 'boss_oni_sheet', frame: 0 }], frameRate: 1, repeat: 0 });
  scene.anims.create({ key: 'boss_walk', frames: [{ key: 'boss_oni_sheet', frame: 1 }], frameRate: 6, repeat: -1 });
  scene.anims.create({ key: 'boss_attack', frames: [{ key: 'boss_oni_sheet', frame: 2 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'boss_rush', frames: [{ key: 'boss_oni_sheet', frame: 3 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'boss_hurt', frames: [{ key: 'boss_oni_sheet', frame: 4 }], frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'boss_die', frames: [{ key: 'boss_oni_sheet', frame: 5 }], frameRate: 8, repeat: 0 });

  // ─── Legacy compatibility aliases ───
  // These map old animation keys to new ones so existing code doesn't break during migration
  scene.anims.create({ key: 'enemy_run', frames: scene.anims.generateFrameNumbers('enemy_guard_sheet', { start: 1, end: 2 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'enemy_die', frames: [{ key: 'enemy_guard_sheet', frame: 5 }], frameRate: 8, repeat: 0 });
}
