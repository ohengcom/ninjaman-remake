import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, SCENE_KEYS, TEXTURE_KEYS } from '../utils/constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.TITLE });
  }

  create(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    // Backdrop
    const bg = this.add.image(w / 2, h / 2, TEXTURE_KEYS.TITLE_BG);
    const scale = Math.max(w / bg.width, h / bg.height);
    bg.setScale(scale);

    // Subtle dark vignette overlay for legibility
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.45);
    overlay.fillRect(0, 0, w, h);

    // Title
    const title = this.add.text(w / 2, h * 0.32, 'NINJAMAN', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '120px',
      color: COLORS.LIGHT_HEX,
      fontStyle: 'bold',
      stroke: COLORS.DARK_HEX,
      strokeThickness: 6,
    });
    title.setOrigin(0.5);
    title.setShadow(0, 6, 'rgba(233, 69, 96, 0.55)', 18, true, true);

    const subtitle = this.add.text(w / 2, h * 0.32 + 90, 'A modern remake', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: COLORS.ACCENT_HEX,
      fontStyle: 'italic',
    });
    subtitle.setOrigin(0.5);

    // Controls panel
    const controls = [
      'WASD or Arrows  -  Move and Jump',
      'J  -  Slash',
      'K  -  Guard',
      'ESC  -  Pause',
    ];
    controls.forEach((line, i) => {
      const t = this.add.text(w / 2, h * 0.55 + i * 28, line, {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: COLORS.LIGHT_HEX,
      });
      t.setOrigin(0.5);
      t.setAlpha(0.85);
    });

    // Start prompt (blinking)
    const start = this.add.text(w / 2, h * 0.85, 'Press SPACE or click to begin', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: COLORS.PRIMARY_HEX,
      fontStyle: 'bold',
    });
    start.setOrigin(0.5);

    this.tweens.add({
      targets: start,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Footer
    this.add
      .text(w - 16, h - 16, 'v2.0', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: COLORS.MUTED_HEX,
      })
      .setOrigin(1);

    // Input
    const begin = (): void => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENE_KEYS.GAME);
      });
    };

    this.input.keyboard?.once('keydown-SPACE', begin);
    this.input.keyboard?.once('keydown-ENTER', begin);
    this.input.once('pointerdown', begin);
  }
}
