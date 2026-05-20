import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load Modern Vector SVGs
    this.load.svg('player_idle', 'assets/sprites/player_idle.svg?v=2');
    this.load.svg('player_run', 'assets/sprites/player_run.svg?v=2');
    this.load.svg('player_jump', 'assets/sprites/player_jump.svg?v=2');
    this.load.svg('player_attack', 'assets/sprites/player_attack.svg?v=2');
    this.load.svg('player_combo1', 'assets/sprites/player_combo1.svg?v=2');
    this.load.svg('player_combo2', 'assets/sprites/player_combo2.svg?v=2');
    this.load.svg('player_combo3', 'assets/sprites/player_combo3.svg?v=2');
    this.load.svg('player_combo4', 'assets/sprites/player_combo4.svg?v=2');
    this.load.svg('player_dash', 'assets/sprites/player_dash.svg?v=2');
    this.load.svg('player_defend', 'assets/sprites/player_defend.svg?v=2');
    this.load.svg('player_uppercut', 'assets/sprites/player_uppercut.svg?v=2');
    this.load.svg('player_dive', 'assets/sprites/player_dive.svg?v=2');
    this.load.svg('player_cast', 'assets/sprites/player_cast.svg?v=2');
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
    
    this.load.svg('bg_city_far', 'assets/backgrounds/bg_city_far.svg?v=2');
    this.load.svg('bg_city_mid', 'assets/backgrounds/bg_city_mid.svg?v=2');
    this.load.svg('bg_forest_far', 'assets/backgrounds/bg_forest_far.svg?v=2');
    this.load.svg('bg_forest_mid', 'assets/backgrounds/bg_forest_mid.svg?v=2');
    this.load.svg('bg_core_far', 'assets/backgrounds/bg_core_far.svg?v=2');
    this.load.svg('bg_core_mid', 'assets/backgrounds/bg_core_mid.svg?v=2');
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