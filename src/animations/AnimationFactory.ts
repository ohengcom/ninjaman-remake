import Phaser from 'phaser';

const ANIM_DEFS = [
  { key: 'player_idle_anim', sheet: 'player_idle_sheet', frames: 6, rate: 8, repeat: -1 },
  { key: 'player_run_anim', sheet: 'player_run_sheet', frames: 8, rate: 12, repeat: -1 },
  { key: 'player_jump_anim', sheet: 'player_jump_sheet', frames: 3, rate: 10, repeat: 0 },
  { key: 'player_fall_anim', sheet: 'player_fall_sheet', frames: 3, rate: 8, repeat: 0 },
  { key: 'player_dash_anim', sheet: 'player_dash_sheet', frames: 4, rate: 14, repeat: 0 },
  { key: 'player_defend_anim', sheet: 'player_defend_sheet', frames: 3, rate: 10, repeat: 0 },
  { key: 'player_combo1_anim', sheet: 'player_combo1_sheet', frames: 4, rate: 16, repeat: 0 },
  { key: 'player_combo2_anim', sheet: 'player_combo2_sheet', frames: 4, rate: 16, repeat: 0 },
  { key: 'player_combo3_anim', sheet: 'player_combo3_sheet', frames: 4, rate: 16, repeat: 0 },
  { key: 'player_combo4_anim', sheet: 'player_combo4_sheet', frames: 4, rate: 16, repeat: 0 },
  { key: 'player_wave_anim', sheet: 'player_wave_sheet', frames: 4, rate: 12, repeat: 0 },
  { key: 'player_uppercut_anim', sheet: 'player_uppercut_sheet', frames: 4, rate: 14, repeat: 0 },
  { key: 'player_dive_anim', sheet: 'player_dive_sheet', frames: 4, rate: 14, repeat: 0 },
  { key: 'player_hurt_anim', sheet: 'player_hurt_sheet', frames: 3, rate: 10, repeat: 0 },
] as const;

const ENEMY_ANIM_DEFS = [
  { key: 'enemy_guard_walk_anim', sheet: 'enemy_guard_sheet', frames: 6, rate: 8, repeat: -1 },
  { key: 'enemy_guard_attack_anim', sheet: 'enemy_guard_attack_sheet', frames: 4, rate: 10, repeat: 0 },
  { key: 'enemy_axe_walk_anim', sheet: 'enemy_axe_sheet', frames: 6, rate: 6, repeat: -1 },
  { key: 'enemy_axe_windup_anim', sheet: 'enemy_axe_windup_sheet', frames: 3, rate: 6, repeat: 0 },
  { key: 'enemy_axe_attack_anim', sheet: 'enemy_axe_attack_sheet', frames: 4, rate: 8, repeat: 0 },
  { key: 'enemy_ninja_run_anim', sheet: 'enemy_ninja_sheet', frames: 6, rate: 12, repeat: -1 },
  { key: 'enemy_ninja_attack_anim', sheet: 'enemy_ninja_attack_sheet', frames: 3, rate: 14, repeat: 0 },
  { key: 'enemy_sniper_idle_anim', sheet: 'enemy_sniper_sheet', frames: 4, rate: 6, repeat: -1 },
  { key: 'enemy_sniper_shoot_anim', sheet: 'enemy_sniper_shoot_sheet', frames: 3, rate: 10, repeat: 0 },
] as const;

const BOSS_ANIM_DEFS = [
  { key: 'boss_idle_anim', sheet: 'boss_idle_sheet', frames: 6, rate: 8, repeat: -1 },
  { key: 'boss_walk_anim', sheet: 'boss_walk_sheet', frames: 6, rate: 8, repeat: -1 },
  { key: 'boss_windup_anim', sheet: 'boss_windup_sheet', frames: 4, rate: 8, repeat: 0 },
  { key: 'boss_attack_anim', sheet: 'boss_attack_sheet', frames: 4, rate: 10, repeat: 0 },
  { key: 'boss_rush_anim', sheet: 'boss_rush_sheet', frames: 4, rate: 12, repeat: -1 },
] as const;

export class AnimationFactory {
  static createPlayerAnimations(anims: Phaser.Animations.AnimationManager) {
    for (const def of ANIM_DEFS) {
      anims.create({
        key: def.key,
        frames: anims.generateFrameNumbers(def.sheet, { start: 0, end: def.frames - 1 }),
        frameRate: def.rate,
        repeat: def.repeat,
      });
    }
  }

  static createEnemyAnimations(anims: Phaser.Animations.AnimationManager) {
    for (const def of ENEMY_ANIM_DEFS) {
      anims.create({
        key: def.key,
        frames: anims.generateFrameNumbers(def.sheet, { start: 0, end: def.frames - 1 }),
        frameRate: def.rate,
        repeat: def.repeat,
      });
    }
  }

  static createBossAnimations(anims: Phaser.Animations.AnimationManager) {
    for (const def of BOSS_ANIM_DEFS) {
      anims.create({
        key: def.key,
        frames: anims.generateFrameNumbers(def.sheet, { start: 0, end: def.frames - 1 }),
        frameRate: def.rate,
        repeat: def.repeat,
      });
    }
  }
}
