import Phaser from 'phaser';

/**
 * Register all game animations from the loaded sprite sheets and atlases.
 * Called once from BootScene.create().
 */
export function registerAnimations(scene: Phaser.Scene): void {
  if (scene.anims.exists('player_idle')) return;

  // ─── Redesigned HD hero animations (256px spritesheet frames) ───
  scene.anims.create({ key: 'player_idle', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'player_run', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 8, end: 15 }), frameRate: 14, repeat: -1 });
  scene.anims.create({ key: 'player_jump', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 16, end: 21 }), frameRate: 12, repeat: 0 });
  scene.anims.create({ key: 'player_fall', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 22, end: 27 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: 'player_attack_A', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 28, end: 35 }), frameRate: 24, repeat: 0 });
  scene.anims.create({ key: 'player_attack_B', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 36, end: 43 }), frameRate: 24, repeat: 0 });
  scene.anims.create({ key: 'player_attack_C', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 44, end: 51 }), frameRate: 26, repeat: 0 });
  scene.anims.create({ key: 'player_attack_D', frames: scene.anims.generateFrameNumbers('player_hero_hd', { frames: [44, 45, 46, 47, 48, 49, 50, 51, 50, 51] }), frameRate: 30, repeat: 0 });
  scene.anims.create({ key: 'player_wave_cast', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 52, end: 57 }), frameRate: 18, repeat: 0 });
  scene.anims.create({ key: 'player_uppercut', frames: scene.anims.generateFrameNumbers('player_hero_hd', { frames: [16, 17, 18, 58, 58, 21] }), frameRate: 18, repeat: 0 });
  scene.anims.create({ key: 'player_dive', frames: scene.anims.generateFrameNumbers('player_hero_hd', { frames: [22, 23, 59, 59, 27] }), frameRate: 16, repeat: -1 });
  scene.anims.create({ key: 'player_guard', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 52, end: 54 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: 'player_hurt', frames: scene.anims.generateFrameNumbers('player_hero_hd', { frames: [59, 27] }), frameRate: 8, repeat: 0 });
  scene.anims.create({ key: 'player_attack', frames: scene.anims.generateFrameNumbers('player_hero_hd', { start: 28, end: 33 }), frameRate: 22, repeat: 0 });

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
