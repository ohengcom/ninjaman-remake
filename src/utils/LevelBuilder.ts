import Phaser from 'phaser';
import { LevelConfig } from '../config/levels.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class LevelBuilder {
  private static getTextureSize(scene: Phaser.Scene, key: string, fallbackWidth: number, fallbackHeight: number) {
    const source = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
    return {
      width: source?.width || fallbackWidth,
      height: source?.height || fallbackHeight,
    };
  }

  private static addCoverImage(scene: Phaser.Scene, key: string, x: number, y: number, width: number, height: number, scrollFactor: number) {
    const texture = LevelBuilder.getTextureSize(scene, key, width, height);
    const scale = Math.max(width / texture.width, height / texture.height);
    const displayWidth = texture.width * scale;
    const displayHeight = texture.height * scale;

    return scene.add.image(x, y, key)
      .setOrigin(0, 0)
      .setScrollFactor(scrollFactor)
      .setDisplaySize(displayWidth, displayHeight);
  }

  public static buildBackground(scene: Phaser.Scene, farBgKey: string, midBgKey: string, mapWidth: number) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;

    const renderLayer = (key: string, scrollFactor: number) => {
      if (!key) return;

      const texture = LevelBuilder.getTextureSize(scene, key, w, h);
      const scale = Math.max(w / texture.width, h / texture.height);
      const scaledWidth = texture.width * scale;
      const scaledHeight = texture.height * scale;
      const y = (h - scaledHeight) / 2;

      const requiredWidth = w + (mapWidth - w) * scrollFactor;
      const numImages = Math.max(2, Math.ceil(requiredWidth / scaledWidth) + 1);

      for (let i = 0; i < numImages; i++) {
        scene.add.image(scaledWidth * i, y, key)
          .setOrigin(0, 0)
          .setScrollFactor(scrollFactor)
          .setDisplaySize(scaledWidth, scaledHeight);
      }
    };

    // Far background behind mid background
    renderLayer(farBgKey, 0.1);
    renderLayer(midBgKey, 0.3);
  }

  public static buildStaticBackground(scene: Phaser.Scene, farBgKey: string, midBgKey: string) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;

    if (farBgKey) {
      LevelBuilder.addCoverImage(scene, farBgKey, 0, 0, w, h, 0);
    }
    if (midBgKey) {
      LevelBuilder.addCoverImage(scene, midBgKey, 0, 0, w, h, 0);
    }
  }

  public static buildPlatforms(scene: Phaser.Scene, levelCfg: LevelConfig, mapWidth: number, rng: SeededRandom): Phaser.Physics.Arcade.StaticGroup {
    const h = scene.cameras.main.height;
    const platforms = scene.physics.add.staticGroup();
    const tiles = Math.floor(mapWidth / levelCfg.tileSize);
    
    for (let i = 0; i < tiles; i++) {
      // Create a continuous, solid floor
      platforms.create(i * levelCfg.tileSize + 32, h - 32, 'platform');
      
      if (levelCfg.hasPlatforms && i > levelCfg.platformStartTile && i % levelCfg.platformInterval === 0) {
         platforms.create(i * levelCfg.tileSize + 32, h - 160 - rng.next() * 80, 'platform');
      }
    }

    return platforms;
  }

  public static buildLeftWall(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
    const h = scene.cameras.main.height;
    const leftWall = scene.add.rectangle(-32, h/2, 64, h * 2).setOrigin(0.5);
    scene.physics.add.existing(leftWall, true);
    return leftWall;
  }
}
