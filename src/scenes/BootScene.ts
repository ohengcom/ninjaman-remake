import Phaser from 'phaser';
import { CharacterFactory } from '../factories/CharacterFactory.js';
import {
  COLORS,
  GAME_CONFIG,
  SCENE_KEYS,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    this.createLoadingBar();
    this.loadAssets();
  }

  create(): void {
    // Build all procedural character + FX textures once.
    CharacterFactory.generateAll(this);
    this.scene.start(SCENE_KEYS.TITLE);
  }

  private createLoadingBar(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    this.cameras.main.setBackgroundColor(COLORS.DARK_HEX);

    const title = this.add.text(w / 2, h / 2 - 60, 'NINJAMAN', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '64px',
      color: COLORS.LIGHT_HEX,
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(w / 2, h / 2 - 10, 'Loading the path of the shadow...', {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: COLORS.MUTED_HEX,
    });
    subtitle.setOrigin(0.5);

    const barX = w / 2 - 200;
    const barY = h / 2 + 30;

    const box = this.add.graphics();
    box.lineStyle(2, COLORS.PRIMARY, 1);
    box.strokeRect(barX - 2, barY - 2, 404, 18);

    const fill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      fill.clear();
      fill.fillStyle(COLORS.PRIMARY, 1);
      fill.fillRect(barX, barY, 400 * value, 14);
    });

    this.load.on('complete', () => {
      title.destroy();
      subtitle.destroy();
      box.destroy();
      fill.destroy();
    });
  }

  private loadAssets(): void {
    // HD scenery
    this.load.image(TEXTURE_KEYS.BG_SKY, 'assets/hd/bg-sky.jpg');
    this.load.image(TEXTURE_KEYS.BG_MID, 'assets/hd/bg-mid.jpg');
    this.load.image(TEXTURE_KEYS.TILE_GROUND, 'assets/hd/tile-ground.jpg');
    this.load.image(TEXTURE_KEYS.TILE_PLATFORM, 'assets/hd/tile-platform.jpg');
    this.load.image(TEXTURE_KEYS.TITLE_BG, 'assets/hd/title-bg.jpg');

    // SFX (kept from original assets)
    this.load.audio(SOUND_KEYS.ATTACK, 'assets/sounds/253_ninjah_powerslash2.mp3');
    this.load.audio(SOUND_KEYS.JUMP, 'assets/sounds/251_ninjah_jump1.mp3');
    this.load.audio(SOUND_KEYS.HIT, 'assets/sounds/254_ninjah_sword_impact1.mp3');
    this.load.audio(SOUND_KEYS.ENEMY_HIT, 'assets/sounds/242_enemy_thrownimpact.mp3');
    this.load.audio(SOUND_KEYS.PLAYER_HURT, 'assets/sounds/244_ninjah_blood1.mp3');
  }
}
