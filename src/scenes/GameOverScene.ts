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

  init(data: { score: number, win?: boolean }) {
    this.registry.set('score', data.score || 0);
    this.registry.set('win', data.win || false);
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const isWin = this.registry.get('win');

    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.add.text(w / 2, h / 2 - 100, isWin ? 'MISSION ACCOMPLISHED' : 'SYSTEM FAILURE', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '80px',
      color: isWin ? '#00ffff' : '#ff0000',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    const score = this.registry.get('score');
    this.add.text(w / 2, h / 2 + 20, `FINAL SCORE: ${score}`, {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 120, 'PRESS SPACE TO REBOOT', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene', { level: 1, score: 0 });
    });
  }
}