export const manifest = {
  images: [
    { key: 'ninja_sprite', url: 'assets/sprites/ninja.png' },
    { key: 'bg_forest', url: 'assets/backgrounds/bg_forest.png' },
    { key: 'bg_beach', url: 'assets/backgrounds/bg_beach.png' },
    { key: 'bg_castle', url: 'assets/backgrounds/bg_castle.png' },
  ],
  svgs: [
    { key: 'player_wave', url: 'assets/sprites/player_wave.svg', svgConfig: { width: 60, height: 60 } },
    { key: 'projectile', url: 'assets/sprites/projectile.svg', svgConfig: { width: 40, height: 20 } },
    { key: 'platform', url: 'assets/backgrounds/platform.svg', svgConfig: { width: 64, height: 64 } },
  ],
  spritesheets: [
    { key: 'ninja_sheet', url: 'assets/sprites/ninja_transparent.png', frameConfig: { frameWidth: 204, frameHeight: 1024 } }
  ]
} as const;
