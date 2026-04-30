import Phaser from 'phaser';
import { CharacterFactory } from '../factories/CharacterFactory.js';
import {
  COLORS,
  GAME_CONFIG,
  SCENE_KEYS,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';

/**
 * Loads HD scenery (3 zone backgrounds + 3 tile sets), prop JPGs (color-keyed
 * to transparent), and SFX, then generates procedural ninja/enemy/boss/FX
 * textures via {@link CharacterFactory} before handing off to TitleScene.
 *
 * The color-key step lets us ship richer art than pure-procedural drawing
 * without paying the bandwidth cost of true PNGs (JPG with magenta key is
 * ~4x smaller than equivalent PNG with alpha).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    this.createLoadingBar();
    this.loadAssets();
  }

  create(): void {
    // Generate procedural textures first so factory keys exist as a fallback.
    CharacterFactory.generateAll(this);
    // Then upgrade the prop textures to HD by color-keying out the magenta
    // background of the JPGs we shipped. If a JPG is missing or fails, the
    // procedural texture remains in place.
    this.upgradePropToHD('prop-coin-raw', TEXTURE_KEYS.COIN);
    this.upgradePropToHD('prop-dango-raw', TEXTURE_KEYS.DANGO);
    this.upgradePropToHD('prop-shuriken-raw', TEXTURE_KEYS.SHURIKEN);
    this.upgradePropToHD('prop-barrel-raw', TEXTURE_KEYS.BARREL);

    this.scene.start(SCENE_KEYS.TITLE);
  }

  private createLoadingBar(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    this.cameras.main.setBackgroundColor(COLORS.DARK_HEX);

    const title = this.add
      .text(w / 2, h / 2 - 60, 'NINJAMAN', {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '64px',
        color: COLORS.LIGHT_HEX,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(w / 2, h / 2 - 10, 'Loading the path of the shadow...', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: COLORS.MUTED_HEX,
      })
      .setOrigin(0.5);

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
    // ===== HD scenery (3 biome backgrounds + reusable mid-layer + tiles) =====
    this.load.image(TEXTURE_KEYS.BG_SKY, 'assets/hd/bg-sky.jpg');
    this.load.image(TEXTURE_KEYS.BG_MID, 'assets/hd/bg-mid.jpg');
    this.load.image(TEXTURE_KEYS.BG_BAMBOO, 'assets/hd/bg-bamboo.jpg');
    this.load.image(TEXTURE_KEYS.BG_COURTYARD, 'assets/hd/bg-courtyard.jpg');
    this.load.image(TEXTURE_KEYS.BG_CASTLE, 'assets/hd/bg-castle.jpg');
    this.load.image(TEXTURE_KEYS.TITLE_BG, 'assets/hd/title-bg.jpg');
    this.load.image(TEXTURE_KEYS.TILE_GROUND, 'assets/hd/tile-ground.jpg');
    this.load.image(TEXTURE_KEYS.TILE_PLATFORM, 'assets/hd/tile-platform.jpg');
    this.load.image(TEXTURE_KEYS.TILE_STONE, 'assets/hd/tile-stone.jpg');

    // ===== Prop JPGs (magenta-keyed in create()) =====
    this.load.image('prop-coin-raw', 'assets/hd/prop-coin.jpg');
    this.load.image('prop-dango-raw', 'assets/hd/prop-dango.jpg');
    this.load.image('prop-shuriken-raw', 'assets/hd/prop-shuriken.jpg');
    this.load.image('prop-barrel-raw', 'assets/hd/prop-barrel.jpg');

    // ===== Existing SFX =====
    this.load.audio(SOUND_KEYS.ATTACK, 'assets/sounds/253_ninjah_powerslash2.mp3');
    this.load.audio(SOUND_KEYS.JUMP, 'assets/sounds/251_ninjah_jump1.mp3');
    this.load.audio(SOUND_KEYS.HIT, 'assets/sounds/254_ninjah_sword_impact1.mp3');
    this.load.audio(SOUND_KEYS.ENEMY_HIT, 'assets/sounds/242_enemy_thrownimpact.mp3');
    this.load.audio(SOUND_KEYS.PLAYER_HURT, 'assets/sounds/244_ninjah_blood1.mp3');
  }

  /**
   * Convert pure magenta (#FF00FF, with tolerance) of a JPG into transparent
   * alpha and replace the existing procedural texture at `destKey`.
   */
  private upgradePropToHD(srcKey: string, destKey: string): void {
    if (!this.textures.exists(srcKey)) return;
    const src = this.textures.get(srcKey).getSourceImage() as HTMLImageElement;
    if (!src || !src.width) return;
    const w = src.width;
    const h = src.height;

    // Replace existing destination texture (procedural fallback) with our HD one.
    if (this.textures.exists(destKey)) this.textures.remove(destKey);
    const canvas = this.textures.createCanvas(destKey, w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();
    ctx.drawImage(src, 0, 0);
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // High-magenta with tolerance for JPG compression artifacts.
      if (r > 180 && g < 90 && b > 180) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(img, 0, 0);
    canvas.refresh();
    // Free the raw key so we don't double-cache.
    this.textures.remove(srcKey);
  }
}
