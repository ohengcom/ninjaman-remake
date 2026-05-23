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
    
    if ('atlases' in manifest) {
      for (const atlas of manifest.atlases) {
        this.load.atlas(atlas.key, atlas.image, atlas.atlas);
      }
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
    // Player animations (knight atlas)
    this.anims.create({ key: 'player_idle', frames: [{ key: 'knight', frame: 'guard/frame0001' }], frameRate: 1, repeat: 0 });
    this.anims.create({ key: 'player_run', frames: this.anims.generateFrameNames('knight', { prefix: 'run/frame', start: 0, end: 7, zeroPad: 4 }), frameRate: 15, repeat: -1 });
    this.anims.create({ key: 'player_jump', frames: this.anims.generateFrameNames('knight', { prefix: 'jump_loop/frame', start: 0, end: 1, zeroPad: 4 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'player_fall', frames: this.anims.generateFrameNames('knight', { prefix: 'fall_loop/frame', start: 0, end: 1, zeroPad: 4 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'player_attack_A', frames: this.anims.generateFrameNames('knight', { prefix: 'attack_A/frame', start: 0, end: 12, zeroPad: 4 }), frameRate: 20, repeat: 0 });
    this.anims.create({ key: 'player_attack_B', frames: this.anims.generateFrameNames('knight', { prefix: 'attack_B/frame', start: 0, end: 9, zeroPad: 4 }), frameRate: 20, repeat: 0 });
    this.anims.create({ key: 'player_attack_C', frames: this.anims.generateFrameNames('knight', { prefix: 'attack_C/frame', start: 0, end: 12, zeroPad: 4 }), frameRate: 20, repeat: 0 });
    this.anims.create({ key: 'player_hurt', frames: [{ key: 'knight', frame: 'guard/frame0001' }], frameRate: 10, repeat: 0 });

    // Enemy animations (zombie atlas)
    this.anims.create({ key: 'enemy_run', frames: this.anims.generateFrameNames('zombie', { prefix: 'walk_', start: 0, end: 8, zeroPad: 3 }), frameRate: 12, repeat: -1 });
    this.anims.create({ key: 'enemy_die', frames: this.anims.generateFrameNames('zombie', { prefix: 'Death_', start: 0, end: 5, zeroPad: 3 }), frameRate: 10, repeat: 0 });

    this.scene.start('MainMenuScene');
  }
}