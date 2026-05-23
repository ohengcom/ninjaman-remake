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

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0xe9ecef, 0.9);
    box.lineStyle(1.5, 0x74c0fc, 1);
    box.fillRect(w / 2 - 160, h / 2 - 25, 320, 50);
    box.strokeRect(w / 2 - 160, h / 2 - 25, 320, 50);
    
    const txt = this.add.text(w / 2, h / 2 - 50, 'Synchronizing Core...', {
      fontFamily: 'Inter, sans-serif', fontSize: '20px', color: '#495057', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0x74c0fc, 1);
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