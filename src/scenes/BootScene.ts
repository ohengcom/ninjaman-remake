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

    // Load normal maps for character spritesheets and atlas to enable 2D dynamic lights
    this.load.image('knight_n', 'assets/sprites/knight_n.png');
    this.load.image('player_hero_n', 'assets/sprites/player_hero_n.png');
    this.load.image('enemy_guard_sheet_n', 'assets/sprites/enemy_guard_n.png');
    this.load.image('enemy_axe_sheet_n', 'assets/sprites/enemy_axe_n.png');
    this.load.image('enemy_ninja_sheet_n', 'assets/sprites/enemy_ninja_n.png');
    this.load.image('enemy_sniper_sheet_n', 'assets/sprites/enemy_sniper_n.png');
    this.load.image('boss_oni_sheet_n', 'assets/sprites/boss_oni_n.png');

    // Loading screen
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    // Dark background for premium feel
    this.cameras.main.setBackgroundColor('#040408');
    
    // Gorgeous cybernetic grid background
    const bgGrid = this.add.graphics();
    bgGrid.lineStyle(1, 0x00d4ff, 0.06);
    for (let x = 0; x < w; x += 40) {
      bgGrid.lineBetween(x, 0, x, h);
    }
    for (let y = 0; y < h; y += 40) {
      bgGrid.lineBetween(0, y, w, y);
    }

    // Interactive retro scanlines
    const scanline = this.add.graphics();
    scanline.lineStyle(1, 0x00d4ff, 0.08);
    for (let y = 0; y < h; y += 4) {
      scanline.lineBetween(0, y, w, y);
    }

    // Glassmorphic terminal panel
    const panel = this.add.graphics();
    panel.fillStyle(0x0a0a15, 0.85);
    panel.lineStyle(2, 0x00d4ff, 0.8);
    panel.fillRoundedRect(w / 2 - 250, h / 2 - 100, 500, 200, 16);
    panel.strokeRoundedRect(w / 2 - 250, h / 2 - 100, 500, 200, 16);
    
    // Subtle pink secondary accent ring
    panel.lineStyle(1, 0xff4488, 0.4);
    panel.strokeRoundedRect(w / 2 - 244, h / 2 - 94, 488, 188, 12);

    // Glowing Neon Title
    const title = this.add.text(w / 2 - 200, h / 2 - 60, 'SYSTEM BOOT SEQUENCE', {
      fontFamily: 'Orbitron, sans-serif', fontSize: '20px', color: '#00d4ff', fontStyle: 'bold',
      shadow: { blur: 12, color: '#00d4ff', fill: true }
    }).setOrigin(0, 0.5);

    // Floating Glowing percentage counter
    const pctText = this.add.text(w / 2 + 200, h / 2 - 60, '0%', {
      fontFamily: 'Orbitron, sans-serif', fontSize: '20px', color: '#ff4488', fontStyle: 'bold',
      shadow: { blur: 10, color: '#ff4488', fill: true }
    }).setOrigin(1, 0.5);

    // Micro-description dynamic tech message
    const statusText = this.add.text(w / 2 - 200, h / 2 + 50, 'INITIALIZING CYBER LINK...', {
      fontFamily: 'Orbitron, Inter, sans-serif', fontSize: '12px', color: '#6c7086'
    }).setOrigin(0, 0.5);

    // Sleek progress bar container
    const barOutline = this.add.graphics();
    barOutline.lineStyle(2, 0x00d4ff, 0.4);
    barOutline.strokeRoundedRect(w / 2 - 200, h / 2 - 10, 400, 24, 6);

    const barFill = this.add.graphics();

    this.load.on('progress', (v: number) => {
      barFill.clear();
      
      // Cyberpunk neon cyan bar fill
      barFill.fillStyle(0x00d4ff, 0.9);
      barFill.fillRoundedRect(w / 2 - 196, h / 2 - 6, 392 * v, 16, 4);
      
      // Add glowing neon pink slider node at current progress point
      if (v > 0) {
        barFill.fillStyle(0xff4488, 1);
        barFill.fillCircle(w / 2 - 196 + 392 * v, h / 2 + 2, 8);
      }
      
      pctText.setText(`${Math.floor(v * 100)}%`);
      
      // Update dynamic cyberpunk tech messages based on progress
      if (v < 0.2) {
        statusText.setText('PARSING MANIFEST NODES...');
      } else if (v < 0.4) {
        statusText.setText('DECOMPRESSING CYBER SPRITES...');
      } else if (v < 0.6) {
        statusText.setText('SYNCHRONIZING AUDIO CHANNELS...');
      } else if (v < 0.8) {
        statusText.setText('CONSTRUCTING SHADOW STAGES...');
      } else {
        statusText.setText('ESTABLISHING SECURE CONNECTION...');
      }
    });

    this.load.on('complete', () => {
      bgGrid.destroy();
      scanline.destroy();
      panel.destroy();
      title.destroy();
      pctText.destroy();
      statusText.destroy();
      barOutline.destroy();
      barFill.destroy();
    });
  }

  create(): void {
    // Bind Phaser Sound Manager globally
    SoundManager.setSoundManager(this.sound);

    // Attach normal maps to their corresponding textures
    const textureKeys = ['knight', 'player_hero', 'enemy_guard_sheet', 'enemy_axe_sheet', 'enemy_ninja_sheet', 'enemy_sniper_sheet', 'boss_oni_sheet'];
    for (const key of textureKeys) {
      try {
        const tex = this.textures.get(key);
        const normKey = key === 'knight' ? 'knight_n' : (key === 'player_hero' ? 'player_hero_n' : `${key}_n`);
        const normTex = this.textures.get(normKey);
        if (tex && normTex) {
          (tex as any).addNormalMap(normTex.getSourceImage());
        }
      } catch (e) {
        console.warn(`Failed to attach normal map for texture: ${key}`, e);
      }
    }

    // Register all animations from centralized definitions
    registerAnimations(this);
    
    this.scene.start('MainMenuScene');
  }
}