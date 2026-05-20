import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load Player high-quality Ninja Sprite
    this.load.image('ninja_sprite', 'assets/sprites/ninja.png');
    // Map all player states to the high-quality sprite for now
    this.load.image('player_idle', 'assets/sprites/ninja.png');
    this.load.image('player_run', 'assets/sprites/ninja.png');
    this.load.image('player_jump', 'assets/sprites/ninja.png');
    this.load.image('player_dash', 'assets/sprites/ninja.png');
    this.load.image('player_dive', 'assets/sprites/ninja.png');
    this.load.image('player_attack', 'assets/sprites/ninja.png');
    this.load.image('player_combo1', 'assets/sprites/ninja.png');
    this.load.image('player_combo2', 'assets/sprites/ninja.png');
    this.load.image('player_combo3', 'assets/sprites/ninja.png');
    this.load.image('player_combo4', 'assets/sprites/ninja.png');
    this.load.image('player_uppercut', 'assets/sprites/ninja.png');
    this.load.image('player_defend', 'assets/sprites/ninja.png');
    this.load.image('player_cast', 'assets/sprites/ninja.png');
    this.load.svg('player_wave', 'assets/sprites/player_wave.svg?v=2');
    
    this.load.svg('enemy_guard', 'assets/sprites/enemy_guard.svg?v=2');
    this.load.svg('enemy_axe', 'assets/sprites/enemy_axe.svg?v=2');
    this.load.svg('enemy_ninja', 'assets/sprites/enemy_ninja.svg?v=2');
    this.load.svg('enemy_sniper', 'assets/sprites/enemy_sniper.svg?v=2');
    this.load.svg('projectile', 'assets/sprites/projectile.svg?v=2');
    this.load.svg('boss_idle', 'assets/sprites/boss_idle.svg?v=2');
    this.load.svg('boss_attack', 'assets/sprites/boss_attack.svg?v=2');
    this.load.svg('boss_rush', 'assets/sprites/boss_rush.svg?v=2');
    this.load.svg('boss_windup', 'assets/sprites/boss_windup.svg?v=2');
    
    this.load.image('bg_forest', 'assets/backgrounds/bg_forest.png');
    this.load.image('bg_beach', 'assets/backgrounds/bg_beach.png');
    this.load.image('bg_castle', 'assets/backgrounds/bg_castle.png');
    this.load.svg('platform', 'assets/backgrounds/platform.svg?v=2');

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x151515, 0.8);
    box.lineStyle(2, 0xe5c158, 1);
    box.fillRect(w / 2 - 160, h / 2 - 25, 320, 50);
    box.strokeRect(w / 2 - 160, h / 2 - 25, 320, 50);
    
    const txt = this.add.text(w / 2, h / 2 - 50, 'Loading Sacred Ink...', {
      fontFamily: 'serif', fontSize: '20px', color: '#e5c158', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0xe5c158, 1);
      bar.fillRect(w / 2 - 150, h / 2 - 15, 300 * v, 30);
    });

    this.load.on('complete', () => {
      bar.destroy();
      box.destroy();
      txt.destroy();
    });
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}