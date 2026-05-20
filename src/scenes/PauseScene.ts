import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);

    this.add.text(w / 2, h / 2 - 60, 'PAUSED', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '64px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 20, 'Press ESC or P to resume', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-ESC', () => this.resumeGame());
    this.input.keyboard!.once('keydown-P', () => this.resumeGame());
  }

  private resumeGame() {
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
