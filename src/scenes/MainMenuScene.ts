import Phaser from 'phaser';
import { LevelBuilder } from '../utils/LevelBuilder.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    LevelBuilder.buildStaticBackground(this, 'bg_title', '');

    const hudHeader = document.querySelector('.hud-header') as HTMLElement;
    if (hudHeader) hudHeader.style.display = 'none';

    // Dramatic vignette overlay
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.4);
    vignette.fillRect(0, 0, w, h);

    // Title with anime-style glow
    const title = this.add.text(w / 2, h / 2 - 120, 'NINJA MAN', {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#00d4ff',
      strokeThickness: 4,
      shadow: { blur: 20, color: 'rgba(0, 212, 255, 0.6)', fill: true, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(w / 2, h / 2 - 55, '影の道', {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#ff6b8a',
      shadow: { blur: 12, color: 'rgba(255, 107, 138, 0.5)', fill: true, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5);

    // Floating animation for title
    this.tweens.add({
      targets: [title, subtitle],
      y: '-=8',
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start prompt with pulsing glow
    const startText = this.add.text(w / 2, h / 2 + 120, '[ PRESS SPACE TO BEGIN ]', {
      fontFamily: 'Orbitron, Inter, sans-serif',
      fontSize: '22px',
      color: '#00d4ff',
      fontStyle: 'bold',
      shadow: { blur: 8, color: 'rgba(0, 212, 255, 0.4)', fill: true, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Version/credit text
    this.add.text(w / 2, h - 40, 'v3.3 — Remake', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#666',
    }).setOrigin(0.5);

    // Start on SPACE or click
    const startGame = () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('GameScene', { level: 1 });
      });
    };

    this.input.keyboard!.once('keydown-SPACE', startGame);
    this.input.once('pointerdown', startGame);
  }
}
