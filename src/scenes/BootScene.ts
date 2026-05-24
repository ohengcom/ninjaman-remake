import Phaser from 'phaser';
import { manifest } from '../assets/manifest.js';
import { registerAnimations } from '../animations/AnimationDefs.js';
import { SoundManager } from '../managers/SoundManager.js';

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
    
    if ('atlases' in manifest) {
      for (const atlas of manifest.atlases) {
        this.load.atlas(atlas.key, atlas.image, atlas.atlas);
      }
    }

    if ('audio' in manifest) {
      for (const snd of manifest.audio) {
        this.load.audio(snd.key, snd.url);
      }
    }

    // Loading screen
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    // Dark background for premium feel
    this.cameras.main.setBackgroundColor('#0a0a0f');
    
    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 0.9);
    box.lineStyle(2, 0x00d4ff, 1);
    box.fillRoundedRect(w / 2 - 200, h / 2 - 30, 400, 60, 8);
    box.strokeRoundedRect(w / 2 - 200, h / 2 - 30, 400, 60, 8);
    
    const bar = this.add.graphics();
    
    const txt = this.add.text(w / 2, h / 2 - 60, 'INITIALIZING...', {
      fontFamily: 'Orbitron, sans-serif', fontSize: '18px', color: '#00d4ff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0x00d4ff, 1);
      bar.fillRoundedRect(w / 2 - 190, h / 2 - 20, 380 * v, 40, 6);
    });

    this.load.on('complete', () => {
      bar.destroy();
      box.destroy();
      txt.destroy();
    });
  }

  create(): void {
    // Bind Phaser Sound Manager globally
    SoundManager.setSoundManager(this.sound);

    // Register all animations from centralized definitions
    registerAnimations(this);
    
    this.scene.start('MainMenuScene');
  }
}