import Phaser from 'phaser';
import { LevelConfig } from '../config/levels.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class LevelBuilder {
  public static buildBackground(scene: Phaser.Scene, farBgKey: string, mapWidth: number) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;

    // Create seamless mirrored parallax background
    const bgTemp = scene.textures.get(farBgKey).getSourceImage();
    const bgWidth = (bgTemp && (bgTemp as HTMLImageElement).width) ? (bgTemp as HTMLImageElement).width : w;
    const bgHeight = (bgTemp && (bgTemp as HTMLImageElement).height) ? (bgTemp as HTMLImageElement).height : h;
    
    const scale = h / bgHeight;
    const scaledWidth = bgWidth * scale;
    
    // Calculate how many background panels we need based on scroll factor (0.2)
    const requiredWidth = w + (mapWidth - w) * 0.2;
    const numImages = Math.max(2, Math.ceil(requiredWidth / scaledWidth));
    
    for (let i = 0; i < numImages; i++) {
        const bg = scene.add.image(scaledWidth * i, 0, farBgKey).setOrigin(0, 0).setScrollFactor(0.2);
        bg.displayHeight = h;
        bg.displayWidth = scaledWidth;
        // Mirror every alternate image to create a seamless infinite loop
        if (i % 2 === 1) bg.setFlipX(true);
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
