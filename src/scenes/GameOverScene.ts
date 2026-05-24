import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  // Game Over DOM Elements
  private domGameOverOverlay: HTMLElement | null = null;
  private domGameOverScore: HTMLElement | null = null;
  private domBtnRestart: HTMLElement | null = null;

  // Victory DOM Elements
  private domVictoryOverlay: HTMLElement | null = null;
  private domVictoryScore: HTMLElement | null = null;
  private domBtnVictoryRestart: HTMLElement | null = null;

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

    // Cache DOM elements
    this.domGameOverOverlay = document.getElementById('menu-gameover-overlay');
    this.domGameOverScore = document.getElementById('gameover-score');
    this.domBtnRestart = document.getElementById('btn-restart-game');

    this.domVictoryOverlay = document.getElementById('menu-victory-overlay');
    this.domVictoryScore = document.getElementById('victory-score');
    this.domBtnVictoryRestart = document.getElementById('btn-victory-restart');

    if (isWin) {
      // Configure and show Victory Overlay
      if (this.domVictoryScore) {
        this.domVictoryScore.innerText = score.toString();
      }
      if (this.domVictoryOverlay) {
        this.domVictoryOverlay.style.display = 'flex';
      }
      
      // Spawn gorgeous backdrop fireworks
      this.createVictoryVFX();
    } else {
      // Configure and show Game Over Overlay
      if (this.domGameOverScore) {
        this.domGameOverScore.innerText = score.toString();
      }
      if (this.domGameOverOverlay) {
        this.domGameOverOverlay.style.display = 'flex';
      }
    }

    // Configure restart click triggers
    if (this.domBtnRestart) {
      this.domBtnRestart.onclick = (e) => {
        e.stopPropagation();
        this.restartGame();
      };
    }
    if (this.domBtnVictoryRestart) {
      this.domBtnVictoryRestart.onclick = (e) => {
        e.stopPropagation();
        this.restartGame();
      };
    }

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.restartGame();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private createVictoryVFX() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // A beautiful background tint
    this.cameras.main.setBackgroundColor('rgba(6, 6, 12, 0.4)');

    // Create a particle emitter using the vfx_particles texture for backdrop ambient fireworks
    const emitter = this.add.particles(w / 2, h / 2, 'vfx_particles', {
      lifespan: 1400,
      speed: { min: 80, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      gravityY: 100,
      blendMode: 'ADD',
      frequency: -1, // manual emit
      quantity: 1
    });

    // Repeatedly spawn gorgeous sparkle bursts
    this.time.addEvent({
      delay: 600,
      callback: () => {
        if (!this.sys.isActive()) return;
        const rx = Phaser.Math.Between(150, w - 150);
        const ry = Phaser.Math.Between(100, h - 200);
        emitter.emitParticleAt(rx, ry, Phaser.Math.Between(15, 30));
      },
      loop: true
    });
  }

  private restartGame() {
    this.hideAllOverlays();
    const isWin = this.registry.get('win');
    if (isWin) {
      this.scene.start('MainMenuScene');
    } else {
      const level = this.registry.get('level') || 1;
      this.scene.start('GameScene', { level: level, score: 0 });
    }
  }

  private hideAllOverlays() {
    if (this.domGameOverOverlay) {
      this.domGameOverOverlay.style.display = 'none';
    }
    if (this.domVictoryOverlay) {
      this.domVictoryOverlay.style.display = 'none';
    }
  }

  private cleanup() {
    this.hideAllOverlays();
    if (this.domBtnRestart) {
      this.domBtnRestart.onclick = null;
    }
    if (this.domBtnVictoryRestart) {
      this.domBtnVictoryRestart.onclick = null;
    }
  }
}