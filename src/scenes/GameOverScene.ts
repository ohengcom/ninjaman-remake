import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    const gameOverText = this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#e94560',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5, 0.5);

    const restartText = this.add.text(width / 2, height / 2 + 50, 'Press SPACE to restart', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });
    restartText.setOrigin(0.5, 0.5);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
