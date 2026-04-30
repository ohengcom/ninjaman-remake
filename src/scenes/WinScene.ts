import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, SCENE_KEYS, TEXTURE_KEYS } from '../utils/constants.js';

export interface WinData {
  score: number;
  enemiesDefeated: number;
  timeMs: number;
}

export class WinScene extends Phaser.Scene {
  private result!: WinData;

  constructor() {
    super({ key: SCENE_KEYS.WIN });
  }

  init(data: WinData): void {
    this.result = data ?? { score: 0, enemiesDefeated: 0, timeMs: 0 };
  }

  create(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    const bg = this.add.image(w / 2, h / 2, TEXTURE_KEYS.TITLE_BG);
    const scale = Math.max(w / bg.width, h / bg.height);
    bg.setScale(scale);

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55);

    const title = this.add.text(w / 2, h * 0.28, 'VICTORY', {
      fontFamily: 'Georgia, serif',
      fontSize: '108px',
      color: COLORS.ACCENT_HEX,
      fontStyle: 'bold',
      stroke: COLORS.DARK_HEX,
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    const seconds = (this.result.timeMs / 1000).toFixed(1);

    const lines = [
      `Score: ${this.result.score}`,
      `Enemies Defeated: ${this.result.enemiesDefeated}`,
      `Time: ${seconds}s`,
    ];

    lines.forEach((line, i) => {
      this.add
        .text(w / 2, h * 0.48 + i * 36, line, {
          fontFamily: 'Georgia, serif',
          fontSize: '28px',
          color: COLORS.LIGHT_HEX,
        })
        .setOrigin(0.5);
    });

    const restart = this.add.text(w / 2, h * 0.82, 'Press SPACE for another run', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: COLORS.PRIMARY_HEX,
      fontStyle: 'bold',
    });
    restart.setOrigin(0.5);

    this.tweens.add({
      targets: restart,
      alpha: 0.45,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start(SCENE_KEYS.GAME);
    });
    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(SCENE_KEYS.TITLE);
    });
  }
}
