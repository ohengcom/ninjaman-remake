export const manifest = {
  images: [
    { key: 'ninja_sprite', url: 'assets/sprites/ninja.png' },
    // Map all player states to the high-quality sprite for now (Placeholder)
    { key: 'player_idle', url: 'assets/sprites/ninja.png' },
    { key: 'player_run', url: 'assets/sprites/ninja.png' },
    { key: 'player_jump', url: 'assets/sprites/ninja.png' },
    { key: 'player_dash', url: 'assets/sprites/ninja.png' },
    { key: 'player_dive', url: 'assets/sprites/ninja.png' },
    { key: 'player_attack', url: 'assets/sprites/ninja.png' },
    { key: 'player_combo1', url: 'assets/sprites/ninja.png' },
    { key: 'player_combo2', url: 'assets/sprites/ninja.png' },
    { key: 'player_combo3', url: 'assets/sprites/ninja.png' },
    { key: 'player_combo4', url: 'assets/sprites/ninja.png' },
    { key: 'player_uppercut', url: 'assets/sprites/ninja.png' },
    { key: 'player_defend', url: 'assets/sprites/ninja.png' },
    { key: 'player_cast', url: 'assets/sprites/ninja.png' },
    
    // Background Placeholders
    { key: 'bg_forest', url: 'assets/backgrounds/bg_forest.png' },
    { key: 'bg_beach', url: 'assets/backgrounds/bg_beach.png' },
    { key: 'bg_castle', url: 'assets/backgrounds/bg_castle.png' },
  ],
  svgs: [
    { key: 'player_wave', url: 'assets/sprites/player_wave.svg', svgConfig: { width: 60, height: 60 } },
    { key: 'enemy_guard', url: 'assets/sprites/enemy_guard.svg', svgConfig: { width: 80, height: 80 } },
    { key: 'enemy_axe', url: 'assets/sprites/enemy_axe.svg', svgConfig: { width: 110, height: 80 } },
    { key: 'enemy_ninja', url: 'assets/sprites/enemy_ninja.svg', svgConfig: { width: 80, height: 80 } },
    { key: 'enemy_sniper', url: 'assets/sprites/enemy_sniper.svg', svgConfig: { width: 90, height: 80 } },
    { key: 'projectile', url: 'assets/sprites/projectile.svg', svgConfig: { width: 40, height: 20 } },
    { key: 'boss_idle', url: 'assets/sprites/boss_idle.svg', svgConfig: { width: 140, height: 120 } },
    { key: 'boss_attack', url: 'assets/sprites/boss_attack.svg', svgConfig: { width: 220, height: 120 } },
    { key: 'boss_rush', url: 'assets/sprites/boss_rush.svg', svgConfig: { width: 160, height: 120 } },
    { key: 'boss_windup', url: 'assets/sprites/boss_windup.svg', svgConfig: { width: 140, height: 120 } },
    { key: 'platform', url: 'assets/backgrounds/platform.svg', svgConfig: { width: 64, height: 64 } },
  ],
  spritesheets: [
    { key: 'player_sheet', url: 'assets/sprites/player_sheet.svg', frameConfig: { frameWidth: 120, frameHeight: 120 } },
  ]
} as const;
