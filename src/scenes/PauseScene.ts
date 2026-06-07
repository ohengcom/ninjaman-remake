import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  private domPauseOverlay: HTMLElement | null = null;
  private readonly onEsc = () => this.resumeGame();

  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    this.domPauseOverlay = document.getElementById('menu-pause-overlay');
    if (this.domPauseOverlay) {
      this.domPauseOverlay.style.display = 'flex';
    }

    this.input.keyboard!.once('keydown-ESC', this.onEsc);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private resumeGame() {
    if (this.domPauseOverlay) {
      this.domPauseOverlay.style.display = 'none';
    }
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  private cleanup() {
    if (this.domPauseOverlay) {
      this.domPauseOverlay.style.display = 'none';
    }
    this.input.keyboard?.off('keydown-ESC', this.onEsc);
  }
}
