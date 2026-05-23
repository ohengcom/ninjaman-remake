import Phaser from 'phaser';
import { LevelBuilder } from '../utils/LevelBuilder.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    LevelBuilder.buildStaticBackground(this, 'bg_forest', '');

    const title = this.add.text(w / 2, h / 2 - 100, 'CYBER NINJA', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '80px',
      color: '#ff6b6b',
      stroke: '#ffffff',
      strokeThickness: 6,
      shadow: { blur: 8, color: 'rgba(255, 107, 107, 0.4)', fill: true }
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
      fontFamily: 'Inter, sans-serif',
      fontSize: '28px',
      color: '#495057',
      fontStyle: 'bold'
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
        this.scene.start('GameScene', { level: 1 });
      });
    });
  }
}
