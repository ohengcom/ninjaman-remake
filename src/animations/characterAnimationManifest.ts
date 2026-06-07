export type FrameRange = { start: number; end: number };
export type FrameList = { frames: number[] };

export type SpriteAnimationDef = {
  key: string;
  sheet: string;
  frameRate: number;
  repeat: number;
  frames: FrameRange | FrameList;
};

export const PLAYER_ANIMATIONS: SpriteAnimationDef[] = [
  { key: 'player_idle', sheet: 'player_hero_hd', frames: { start: 0, end: 7 }, frameRate: 8, repeat: -1 },
  { key: 'player_run', sheet: 'player_hero_hd', frames: { start: 8, end: 15 }, frameRate: 14, repeat: -1 },
  { key: 'player_jump', sheet: 'player_hero_hd', frames: { start: 16, end: 21 }, frameRate: 12, repeat: 0 },
  { key: 'player_fall', sheet: 'player_hero_hd', frames: { start: 22, end: 27 }, frameRate: 10, repeat: -1 },
  { key: 'player_attack_A', sheet: 'player_hero_hd', frames: { start: 28, end: 35 }, frameRate: 24, repeat: 0 },
  { key: 'player_attack_B', sheet: 'player_hero_hd', frames: { start: 36, end: 43 }, frameRate: 24, repeat: 0 },
  { key: 'player_attack_C', sheet: 'player_hero_hd', frames: { start: 44, end: 51 }, frameRate: 26, repeat: 0 },
  { key: 'player_attack_D', sheet: 'player_hero_hd', frames: { frames: [44, 45, 46, 47, 48, 49, 50, 51, 50, 51] }, frameRate: 30, repeat: 0 },
  { key: 'player_wave_cast', sheet: 'player_hero_hd', frames: { start: 52, end: 57 }, frameRate: 18, repeat: 0 },
  { key: 'player_uppercut', sheet: 'player_hero_hd', frames: { frames: [16, 17, 18, 58, 58, 21] }, frameRate: 18, repeat: 0 },
  { key: 'player_dive', sheet: 'player_hero_hd', frames: { frames: [22, 23, 59, 59, 27] }, frameRate: 16, repeat: -1 },
  { key: 'player_guard', sheet: 'player_hero_hd', frames: { start: 60, end: 63 }, frameRate: 8, repeat: -1 },
  { key: 'player_hurt', sheet: 'player_hero_hd', frames: { frames: [59, 27] }, frameRate: 8, repeat: 0 },
  { key: 'player_attack', sheet: 'player_hero_hd', frames: { start: 28, end: 33 }, frameRate: 22, repeat: 0 },
];

export const ENEMY_ANIMATIONS: SpriteAnimationDef[] = [
  { key: 'guard_idle', sheet: 'enemy_guard_sheet', frames: { frames: [0] }, frameRate: 1, repeat: 0 },
  { key: 'guard_walk', sheet: 'enemy_guard_sheet', frames: { start: 1, end: 2 }, frameRate: 8, repeat: -1 },
  { key: 'guard_attack', sheet: 'enemy_guard_sheet', frames: { frames: [3] }, frameRate: 8, repeat: 0 },
  { key: 'guard_hurt', sheet: 'enemy_guard_sheet', frames: { frames: [4] }, frameRate: 8, repeat: 0 },
  { key: 'guard_die', sheet: 'enemy_guard_sheet', frames: { frames: [5] }, frameRate: 8, repeat: 0 },
  { key: 'axe_idle', sheet: 'enemy_axe_sheet', frames: { frames: [0] }, frameRate: 1, repeat: 0 },
  { key: 'axe_walk', sheet: 'enemy_axe_sheet', frames: { start: 1, end: 2 }, frameRate: 8, repeat: -1 },
  { key: 'axe_attack', sheet: 'enemy_axe_sheet', frames: { frames: [3] }, frameRate: 8, repeat: 0 },
  { key: 'axe_hurt', sheet: 'enemy_axe_sheet', frames: { frames: [4] }, frameRate: 8, repeat: 0 },
  { key: 'axe_die', sheet: 'enemy_axe_sheet', frames: { frames: [5] }, frameRate: 8, repeat: 0 },
  { key: 'ninja_idle', sheet: 'enemy_ninja_sheet', frames: { frames: [0] }, frameRate: 1, repeat: 0 },
  { key: 'ninja_walk', sheet: 'enemy_ninja_sheet', frames: { start: 1, end: 2 }, frameRate: 10, repeat: -1 },
  { key: 'ninja_attack', sheet: 'enemy_ninja_sheet', frames: { frames: [3] }, frameRate: 10, repeat: 0 },
  { key: 'ninja_hurt', sheet: 'enemy_ninja_sheet', frames: { frames: [4] }, frameRate: 10, repeat: 0 },
  { key: 'ninja_die', sheet: 'enemy_ninja_sheet', frames: { frames: [5] }, frameRate: 10, repeat: 0 },
  { key: 'sniper_idle', sheet: 'enemy_sniper_sheet', frames: { frames: [0] }, frameRate: 1, repeat: 0 },
  { key: 'sniper_walk', sheet: 'enemy_sniper_sheet', frames: { start: 1, end: 2 }, frameRate: 8, repeat: -1 },
  { key: 'sniper_attack', sheet: 'enemy_sniper_sheet', frames: { frames: [3] }, frameRate: 8, repeat: 0 },
  { key: 'sniper_hurt', sheet: 'enemy_sniper_sheet', frames: { frames: [4] }, frameRate: 8, repeat: 0 },
  { key: 'sniper_die', sheet: 'enemy_sniper_sheet', frames: { frames: [5] }, frameRate: 8, repeat: 0 },
  { key: 'boss_idle', sheet: 'boss_oni_sheet', frames: { frames: [0] }, frameRate: 1, repeat: 0 },
  { key: 'boss_walk', sheet: 'boss_oni_sheet', frames: { frames: [1] }, frameRate: 6, repeat: -1 },
  { key: 'boss_attack', sheet: 'boss_oni_sheet', frames: { frames: [2] }, frameRate: 8, repeat: 0 },
  { key: 'boss_rush', sheet: 'boss_oni_sheet', frames: { frames: [3] }, frameRate: 8, repeat: 0 },
  { key: 'boss_hurt', sheet: 'boss_oni_sheet', frames: { frames: [4] }, frameRate: 8, repeat: 0 },
  { key: 'boss_die', sheet: 'boss_oni_sheet', frames: { frames: [5] }, frameRate: 8, repeat: 0 },
  { key: 'enemy_run', sheet: 'enemy_guard_sheet', frames: { start: 1, end: 2 }, frameRate: 8, repeat: -1 },
  { key: 'enemy_die', sheet: 'enemy_guard_sheet', frames: { frames: [5] }, frameRate: 8, repeat: 0 },
];
