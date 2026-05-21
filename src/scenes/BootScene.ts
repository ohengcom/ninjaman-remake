import Phaser from 'phaser';
import { manifest } from '../assets/manifest.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load assets from centralized manifest
    for (const img of manifest.images) {
      this.load.image(img.key, img.url);
    }
    
    for (const svg of manifest.svgs) {
      this.load.svg(svg.key, svg.url, { width: svg.svgConfig.width, height: svg.svgConfig.height });
    }

    if ('spritesheets' in manifest) {
      for (const sheet of manifest.spritesheets) {
        this.load.spritesheet(sheet.key, sheet.url, sheet.frameConfig);
      }
    }

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x151515, 0.8);
    box.lineStyle(2, 0xe5c158, 1);
    box.fillRect(w / 2 - 160, h / 2 - 25, 320, 50);
    box.strokeRect(w / 2 - 160, h / 2 - 25, 320, 50);
    
    const txt = this.add.text(w / 2, h / 2 - 50, 'Loading Sacred Ink...', {
      fontFamily: 'serif', fontSize: '20px', color: '#e5c158', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0xe5c158, 1);
      bar.fillRect(w / 2 - 150, h / 2 - 15, 300 * v, 30);
    });

    this.load.on('complete', () => {
      bar.destroy();
      box.destroy();
      txt.destroy();
    });
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}