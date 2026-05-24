export const manifest = {
  images: [
    { key: 'bg_forest', url: 'assets/backgrounds/bg_forest.png' },
    { key: 'bg_beach', url: 'assets/backgrounds/bg_beach.png' },
    { key: 'bg_castle', url: 'assets/backgrounds/bg_castle.png' },
    { key: 'bg_title', url: 'assets/backgrounds/bg_title.png' },
    { key: 'ground_tiles', url: 'assets/backgrounds/ground_tiles.png' },
    { key: 'vfx_particles', url: 'assets/sprites/vfx_particles.png' },
  ],
  svgs: [
    { key: 'player_wave', url: 'assets/sprites/player_wave.svg', svgConfig: { width: 60, height: 60 } },
    { key: 'projectile', url: 'assets/sprites/projectile.svg', svgConfig: { width: 40, height: 20 } },
  ],
  spritesheets: [
    // Player hero — 1024x1024 image, 8 poses in roughly 4x2 grid => 256x512 per frame
    { key: 'player_hero', url: 'assets/sprites/player_hero.png', frameConfig: { frameWidth: 256, frameHeight: 512 } },
    // Enemy types — 1024x1024 images, 6 poses in 3x2 grid => ~341x512, use 340x512
    { key: 'enemy_guard_sheet', url: 'assets/sprites/enemy_guard.png', frameConfig: { frameWidth: 340, frameHeight: 512 } },
    { key: 'enemy_axe_sheet', url: 'assets/sprites/enemy_axe.png', frameConfig: { frameWidth: 340, frameHeight: 512 } },
    { key: 'enemy_ninja_sheet', url: 'assets/sprites/enemy_ninja.png', frameConfig: { frameWidth: 340, frameHeight: 512 } },
    { key: 'enemy_sniper_sheet', url: 'assets/sprites/enemy_sniper.png', frameConfig: { frameWidth: 340, frameHeight: 512 } },
    // Boss — 1024x1024 image, 6 poses in 3x2 grid
    { key: 'boss_oni_sheet', url: 'assets/sprites/boss_oni.png', frameConfig: { frameWidth: 340, frameHeight: 512 } },
  ],
  atlases: [
    { key: 'knight', image: 'assets/sprites/knight.png', atlas: 'assets/sprites/knight.json' },
  ],
  audio: [
    { key: 'bgm_sector1', url: 'assets/audio/bgm_level1.mp3' },
    { key: 'bgm_sector2', url: 'assets/audio/bgm_level2.mp3' },
    { key: 'bgm_sector3', url: 'assets/audio/bgm_level3.mp3' },
    { key: 'snd_jump', url: 'assets/audio/SoundEffects/jump.mp3' },
    { key: 'snd_dash', url: 'assets/audio/SoundEffects/dash.mp3' },
    { key: 'snd_swing', url: 'assets/audio/SoundEffects/swing.mp3' },
    { key: 'snd_hit', url: 'assets/audio/SoundEffects/hit.mp3' },
    { key: 'snd_parry', url: 'assets/audio/SoundEffects/parry.mp3' },
    { key: 'snd_damage', url: 'assets/audio/SoundEffects/damage.wav' },
    { key: 'snd_hadouken', url: 'assets/audio/SoundEffects/hadouken.mp3' },
    { key: 'snd_shoot', url: 'assets/audio/SoundEffects/shoot.wav' },
    { key: 'snd_menu_blip', url: 'assets/audio/SoundEffects/menu_blip.mp3' },
  ]
} as const;
