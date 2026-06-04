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

    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.48);
    vignette.fillRect(0, 0, w, h);

    const title = this.add.text(w / 2, h / 2 - 120, 'NINJA MAN', {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#e94560',
      strokeThickness: 4,
      shadow: { blur: 20, color: 'rgba(233, 69, 96, 0.55)', fill: true, offsetX: 0, offsetY: 0 },
    }).setOrigin(0.5);

    const subtitle = this.add.text(w / 2, h / 2 - 55, 'PATH OF SHADOW', {
      fontFamily: 'serif',
      fontSize: '28px',
      color: '#f8f1e4',
      shadow: { blur: 12, color: 'rgba(248, 241, 228, 0.35)', fill: true, offsetX: 0, offsetY: 0 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [title, subtitle],
      y: '-=8',
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const startText = this.add.text(w / 2, h / 2 + 120, '[ PRESS SPACE TO BEGIN ]', {
      fontFamily: 'Orbitron, Inter, sans-serif',
      fontSize: '22px',
      color: '#f8f1e4',
      fontStyle: 'bold',
      shadow: { blur: 8, color: 'rgba(233, 69, 96, 0.55)', fill: true, offsetX: 0, offsetY: 0 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(w / 2, h - 40, 'v3.6.0 - Prototype', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#d9d0c0',
    }).setOrigin(0.5);

    const startGame = async () => {
      this.input.keyboard?.off('keydown-SPACE', startGame);
      this.input.off('pointerdown', startGame);

      try {
        if (!this.scene.get('GameScene')) {
          const [
            { GameScene },
            { HUDScene },
            { GameOverScene },
            { PauseScene },
          ] = await Promise.all([
            import('./GameScene.js'),
            import('./HUDScene.js'),
            import('./GameOverScene.js'),
            import('./PauseScene.js'),
          ]);
          this.scene.add('GameScene', GameScene, false);
          this.scene.add('HUDScene', HUDScene, false);
          this.scene.add('GameOverScene', GameOverScene, false);
          this.scene.add('PauseScene', PauseScene, false);
        }
      } catch (err) {
        console.error('LAZY LOAD SCENES FAILED:', err);
      }

      if (this.sys.game.config.renderType === Phaser.CANVAS) {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', { level: 1 });
        });
      } else {
        try {
          const cam = this.cameras.main;
          const wipe = cam.filters.external.addWipe(0.15, 0, 0);
          wipe.setTopToBottom();
          wipe.setWipeEffect();

          this.tweens.add({
            targets: wipe,
            progress: 1,
            duration: 800,
            ease: 'Quad.easeIn',
            onComplete: () => {
              this.scene.start('GameScene', { level: 1 });
            },
          });
        } catch (e) {
          console.warn('Wipe filter failed on MainMenuScene, falling back to fade:', e);
          this.cameras.main.fadeOut(800, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene', { level: 1 });
          });
        }
      }
    };

    this.input.keyboard!.once('keydown-SPACE', startGame);
    this.input.once('pointerdown', startGame);
  }
}
