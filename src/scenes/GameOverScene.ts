import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private domGameOverOverlay: HTMLElement | null = null;
  private domGameOverTitle: HTMLElement | null = null;
  private domGameOverScore: HTMLElement | null = null;
  private domBtnRestart: HTMLElement | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number, win?: boolean, level?: number }) {
    this.registry.set('score', data.score || 0);
    this.registry.set('win', data.win || false);
    this.registry.set('level', data.level || 1);
  }

  create() {
    const isWin = this.registry.get('win');
    const score = this.registry.get('score');

    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Cache and configure DOM Elements
    this.domGameOverOverlay = document.getElementById('menu-gameover-overlay');
    this.domGameOverTitle = document.getElementById('gameover-title');
    this.domGameOverScore = document.getElementById('gameover-score');
    this.domBtnRestart = document.getElementById('btn-restart-game');

    if (this.domGameOverTitle) {
      if (isWin) {
        this.domGameOverTitle.innerText = 'SECTOR SECURED';
        this.domGameOverTitle.classList.add('win');
      } else {
        this.domGameOverTitle.innerText = 'SECTOR COMPROMISED';
        this.domGameOverTitle.classList.remove('win');
      }
    }

    if (this.domGameOverScore) {
      this.domGameOverScore.innerText = score.toString();
    }

    if (this.domGameOverOverlay) {
      this.domGameOverOverlay.style.display = 'flex';
    }

    if (this.domBtnRestart) {
      this.domBtnRestart.onclick = (e) => {
        e.stopPropagation();
        this.restartGame();
      };
    }

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.restartGame();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private restartGame() {
    if (this.domGameOverOverlay) {
      this.domGameOverOverlay.style.display = 'none';
    }
    const level = this.registry.get('level') || 1;
    this.scene.start('GameScene', { level: level, score: 0 });
  }

  private cleanup() {
    if (this.domGameOverOverlay) {
      this.domGameOverOverlay.style.display = 'none';
    }
    if (this.domBtnRestart) {
      this.domBtnRestart.onclick = null;
    }
  }
}