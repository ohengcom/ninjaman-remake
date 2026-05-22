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
}
