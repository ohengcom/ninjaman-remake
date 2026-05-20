import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load Modern Vector SVGs
    this.load.svg('player_idle', 'assets/sprites/player_idle.svg');
    this.load.svg('player_run', 'assets/sprites/player_run.svg');
    this.load.svg('player_jump', 'assets/sprites/player_jump.svg');
    this.load.svg('player_attack', 'assets/sprites/player_attack.svg');
    this.load.svg('player_combo1', 'assets/sprites/player_combo1.svg');
    this.load.svg('player_combo2', 'assets/sprites/player_combo2.svg');
    this.load.svg('player_combo3', 'assets/sprites/player_combo3.svg');
    this.load.svg('player_combo4', 'assets/sprites/player_combo4.svg');
    this.load.svg('player_dash', 'assets/sprites/player_dash.svg');
    this.load.svg('player_defend', 'assets/sprites/player_defend.svg');
    this.load.svg('player_uppercut', 'assets/sprites/player_uppercut.svg');
    this.load.svg('player_dive', 'assets/sprites/player_dive.svg');
    this.load.svg('player_cast', 'assets/sprites/player_cast.svg');
    this.load.svg('player_wave', 'assets/sprites/player_wave.svg');
    
    this.load.svg('enemy_guard', 'assets/sprites/enemy_guard.svg');
    this.load.svg('enemy_axe', 'assets/sprites/enemy_axe.svg');
    this.load.svg('enemy_ninja', 'assets/sprites/enemy_ninja.svg');
    this.load.svg('enemy_sniper', 'assets/sprites/enemy_sniper.svg');
    this.load.svg('projectile', 'assets/sprites/projectile.svg');
    this.load.svg('boss_idle', 'assets/sprites/boss_idle.svg');
    this.load.svg('boss_attack', 'assets/sprites/boss_attack.svg');
    this.load.svg('boss_rush', 'assets/sprites/boss_rush.svg');
    this.load.svg('boss_windup', 'assets/sprites/boss_windup.svg');
    
    this.load.svg('bg_city_far', 'assets/backgrounds/bg_city_far.svg');
    this.load.svg('bg_city_mid', 'assets/backgrounds/bg_city_mid.svg');
    this.load.svg('bg_forest_far', 'assets/backgrounds/bg_forest_far.svg');
    this.load.svg('bg_forest_mid', 'assets/backgrounds/bg_forest_mid.svg');
    this.load.svg('bg_core_far', 'assets/backgrounds/bg_core_far.svg');
    this.load.svg('bg_core_mid', 'assets/backgrounds/bg_core_mid.svg');
    this.load.svg('platform', 'assets/backgrounds/platform.svg');

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w / 2 - 160, h / 2 - 25, 320, 50);
    
    const txt = this.add.text(w / 2, h / 2 - 50, 'Loading Cyberspace...', {
      fontFamily: 'Arial', fontSize: '20px', color: '#e94560',
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0xe94560, 1);
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