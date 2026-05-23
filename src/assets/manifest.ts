export const manifest = {
  images: [
    { key: 'bg_forest', url: 'assets/backgrounds/bg_forest.png?v=3' },
    { key: 'bg_beach', url: 'assets/backgrounds/bg_beach.png?v=3' },
    { key: 'bg_castle', url: 'assets/backgrounds/bg_castle.png?v=3' },
    { key: 'bg_title', url: 'assets/backgrounds/bg_title.png?v=3' },
  ],
  svgs: [
    { key: 'player_wave', url: 'assets/sprites/player_wave.svg?v=3', svgConfig: { width: 60, height: 60 } },
    { key: 'projectile', url: 'assets/sprites/projectile.svg?v=3', svgConfig: { width: 40, height: 20 } },
    { key: 'platform', url: 'assets/backgrounds/platform.svg?v=3', svgConfig: { width: 64, height: 64 } }
  ],
  spritesheets: [
    { key: 'player_sprite', url: 'assets/sprites/player.png?v=1', frameConfig: { frameWidth: 48, frameHeight: 48 } },
    { key: 'enemy_sprite', url: 'assets/sprites/enemy.png?v=1', frameConfig: { frameWidth: 37, frameHeight: 45 } }
  ],
  atlases: [
    { key: 'knight', image: 'assets/sprites/knight.png', atlas: 'assets/sprites/knight.json' },
    { key: 'zombie', image: 'assets/sprites/zombie.png', atlas: 'assets/sprites/zombie.json' }
  ]
} as const;
