import Phaser from 'phaser';
import { COLORS, GAME_CONFIG, SCENE_KEYS } from '../utils/constants.js';

export interface GameOverData {
  score: number;
  enemiesDefeated: number;
}

export class GameOverScene extends Phaser.Scene {
  private data!: GameOverData;

  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: GameOverData): void {
    this.data = data ?? { score: 0, enemiesDefeated: 0 };
  }

  create(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.72);

    const title = this.add.text(w / 2, h * 0.3, 'GAME OVER', {
      fontFamily: 'Georgia, serif',
      fontSize: '96px',
      color: COLORS.PRIMARY_HEX,
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, 'rgba(0,0,0,0.6)', 8, true, true);

    this.add
      .text(w / 2, h * 0.46, `Score: ${this.data.score}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '32px',
        color: COLORS.LIGHT_HEX,
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.52, `Enemies Defeated: ${this.data.enemiesDefeated}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        color: COLORS.ACCENT_HEX,
      })
      .setOrigin(0.5);

    const restart = this.add.text(w / 2, h * 0.7, 'Press SPACE to retry', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: COLORS.LIGHT_HEX,
    });
    restart.setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.76, 'Press ESC for title', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: COLORS.MUTED_HEX,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: restart,
      alpha: 0.4,
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
