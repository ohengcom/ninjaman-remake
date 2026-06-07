const ASSET_VERSION = '3.7.0';
const asset = (url: string) => `${url}?v=${ASSET_VERSION}`;

export const manifest = {
  images: [
    { key: 'bg_forest', url: asset('assets/backgrounds/bg_forest.png') },
    { key: 'bg_beach', url: asset('assets/backgrounds/bg_beach.png') },
    { key: 'bg_castle', url: asset('assets/backgrounds/bg_castle.png') },
    { key: 'bg_title', url: asset('assets/backgrounds/bg_title.png') },
    { key: 'ground_tiles', url: asset('assets/backgrounds/ground_tiles.png') },
    { key: 'vfx_particles', url: asset('assets/sprites/vfx_particles.png') },
  ],
  svgs: [
    { key: 'player_wave', url: asset('assets/sprites/player_wave.svg'), svgConfig: { width: 60, height: 60 } },
    { key: 'projectile', url: asset('assets/sprites/projectile.svg'), svgConfig: { width: 40, height: 20 } },
  ],
  spritesheets: [
    // Redesigned HD hero sheet: 8 columns x 8 rows, 256px frames.
    { key: 'player_hero_hd', url: asset('assets/sprites/player_hero_hd.png'), frameConfig: { frameWidth: 256, frameHeight: 256 } },
    // Enemy types — 1020x1024 images, 6 poses in 3x2 grid => 340x512.
    { key: 'enemy_guard_sheet', url: asset('assets/sprites/enemy_guard.png'), frameConfig: { frameWidth: 340, frameHeight: 512 } },
    { key: 'enemy_axe_sheet', url: asset('assets/sprites/enemy_axe.png'), frameConfig: { frameWidth: 340, frameHeight: 512 } },
    { key: 'enemy_ninja_sheet', url: asset('assets/sprites/enemy_ninja.png'), frameConfig: { frameWidth: 340, frameHeight: 512 } },
    { key: 'enemy_sniper_sheet', url: asset('assets/sprites/enemy_sniper.png'), frameConfig: { frameWidth: 340, frameHeight: 512 } },
    // Boss — 1020x1024 image, 6 poses in 3x2 grid.
    { key: 'boss_oni_sheet', url: asset('assets/sprites/boss_oni.png'), frameConfig: { frameWidth: 340, frameHeight: 512 } },
  ],
  atlases: [
    { key: 'knight', image: asset('assets/sprites/knight.png'), atlas: asset('assets/sprites/knight.json') },
  ],
  audio: [
    { key: 'bgm_sector1', url: asset('assets/audio/bgm_level1.mp3') },
    { key: 'bgm_sector2', url: asset('assets/audio/bgm_level2.mp3') },
    { key: 'bgm_sector3', url: asset('assets/audio/bgm_level3.mp3') },
    { key: 'snd_jump', url: asset('assets/audio/SoundEffects/jump.mp3') },
    { key: 'snd_dash', url: asset('assets/audio/SoundEffects/dash.mp3') },
    { key: 'snd_swing', url: asset('assets/audio/SoundEffects/swing.mp3') },
    { key: 'snd_hit', url: asset('assets/audio/SoundEffects/hit.mp3') },
    { key: 'snd_parry', url: asset('assets/audio/SoundEffects/parry.mp3') },
    { key: 'snd_damage', url: asset('assets/audio/SoundEffects/damage.wav') },
    { key: 'snd_hadouken', url: asset('assets/audio/SoundEffects/hadouken.mp3') },
    { key: 'snd_shoot', url: asset('assets/audio/SoundEffects/shoot.wav') },
    { key: 'snd_menu_blip', url: asset('assets/audio/SoundEffects/menu_blip.mp3') },
  ]
} as const;
