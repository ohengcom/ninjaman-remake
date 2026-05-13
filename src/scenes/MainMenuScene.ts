import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.image(w/2, h/2, 'bg_city_far').setScrollFactor(0);
    this.add.image(w/2, h/2, 'bg_city_mid').setScrollFactor(0);

    const title = this.add.text(w / 2, h / 2 - 100, 'CYBER NINJA', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '80px',
      color: '#e94560',
      stroke: '#1a1a2e',
      strokeThickness: 8,
      shadow: { blur: 10, color: '#e94560', fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: h / 2 - 110,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const startText = this.add.text(w / 2, h / 2 + 100, 'PRESS SPACE TO START', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('GameScene');
      });
    });
  }
}