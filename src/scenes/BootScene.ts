import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingBar();
    this.loadAssets();
  }

  create(): void {
    this.scene.start('GameScene');
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xe94560, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  private loadAssets(): void {
    // Load player frames (only the ones used in animations for now)
    const ninjaFrames = [
      ...this.range(0, 3),    // idle
      ...this.range(30, 38),  // run
      ...this.range(116, 118),// defend
      ...this.range(162, 164),// jump
      ...this.range(725, 730) // attack
    ];

    ninjaFrames.forEach(f => {
      this.load.image(`ninja_${f}`, `assets/sprites/ninja/${f + 1}.png`);
    });

    // Load enemy frames (using similar logic for tonfa)
    const tonfaFrames = [...this.range(0, 3), ...this.range(30, 38)];
    tonfaFrames.forEach(f => {
      this.load.image(`tonfa_${f}`, `assets/sprites/tonfa/${f + 1}.png`);
    });

    // Load level data
    this.load.text('beach_xml', 'assets/maps/beach.xml');

    // Load sounds
    this.load.audio('attack', 'assets/sounds/237_attack.mp3.mp3');
    this.load.audio('jump', 'assets/sounds/251_ninjah_jump1.mp3');
    this.load.audio('hit', 'assets/sounds/242_enemy_thrownimpact.mp3');
  }

  private range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
