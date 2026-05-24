import Phaser from 'phaser';
import { LevelConfig } from '../config/levels.js';
import { SeededRandom } from '../utils/SeededRandom.js';

/** Level theme colors for procedural decoration */
const LEVEL_THEMES: Record<number, { groundColor: number; platformColor: number; groundTopColor: number; accentColor: number }> = {
  1: { groundColor: 0x3d2b1f, platformColor: 0x5a3d2b, groundTopColor: 0x4a7c3f, accentColor: 0x6b8f5e },
  2: { groundColor: 0x8b7355, platformColor: 0x9c8565, groundTopColor: 0xc2b280, accentColor: 0xe8d5a3 },
  3: { groundColor: 0x3a3a4a, platformColor: 0x4a4a5a, groundTopColor: 0x5a5a6a, accentColor: 0x7a5a3a },
};

export class LevelBuilder {
  private static getTextureSize(scene: Phaser.Scene, key: string, fallbackWidth: number, fallbackHeight: number) {
    const source = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
    return {
      width: source?.width || fallbackWidth,
      height: source?.height || fallbackHeight,
    };
  }

  public static buildBackground(scene: Phaser.Scene, farBgKey: string, midBgKey: string, mapWidth: number) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;

    const renderLayer = (key: string, scrollFactor: number) => {
      if (!key) return;

      const texture = LevelBuilder.getTextureSize(scene, key, w, h);
      const requiredWidth = w + (mapWidth - w) * scrollFactor;
      const scale = Math.max(requiredWidth / texture.width, h / texture.height);
      const scaledWidth = texture.width * scale;
      const scaledHeight = texture.height * scale;
      const y = h - scaledHeight;

      scene.add.image(0, y, key)
        .setOrigin(0, 0)
        .setScrollFactor(scrollFactor)
        .setDisplaySize(scaledWidth, scaledHeight);
    };

    // Far background behind mid background
    renderLayer(farBgKey, 0.1);
    renderLayer(midBgKey, 0.3);
  }

  public static buildStaticBackground(scene: Phaser.Scene, farBgKey: string, midBgKey: string) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;

    if (farBgKey) {
      const texture = LevelBuilder.getTextureSize(scene, farBgKey, w, h);
      const scale = Math.max(w / texture.width, h / texture.height);
      scene.add.image(0, 0, farBgKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(texture.width * scale, texture.height * scale);
    }
    if (midBgKey) {
      const texture = LevelBuilder.getTextureSize(scene, midBgKey, w, h);
      const scale = Math.max(w / texture.width, h / texture.height);
      scene.add.image(0, 0, midBgKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(texture.width * scale, texture.height * scale);
    }
  }

  public static buildPlatforms(scene: Phaser.Scene, levelCfg: LevelConfig, mapWidth: number, rng: SeededRandom): { platforms: Phaser.Physics.Arcade.StaticGroup, floor: Phaser.GameObjects.Rectangle } {
    const h = scene.cameras.main.height;
    const levelNum = levelCfg.levelNumber ?? 1;
    const theme = LEVEL_THEMES[levelNum] || LEVEL_THEMES[1]!;
    const tileSize = levelCfg.tileSize;
    const tiles = Math.floor(mapWidth / tileSize);
    const platforms = scene.physics.add.staticGroup();

    // ─── VISIBLE GROUND ───
    // Create a visible, textured ground strip at the bottom of the level
    const groundHeight = 48;
    
    // Ground body (for main ground surface)
    const groundGraphics = scene.add.graphics();
    
    // Draw ground segments across the map
    for (let x = 0; x < mapWidth; x += tileSize) {
      // Main ground body
      groundGraphics.fillStyle(theme.groundColor, 1);
      groundGraphics.fillRect(x, h - groundHeight, tileSize, groundHeight);
      
      // Ground top surface (grass/stone/sand strip)
      groundGraphics.fillStyle(theme.groundTopColor, 1);
      groundGraphics.fillRect(x, h - groundHeight, tileSize, 6);
      
      // Surface detail highlights
      groundGraphics.fillStyle(theme.accentColor, 0.3);
      groundGraphics.fillRect(x, h - groundHeight + 6, tileSize, 2);
      
      // Subtle dirt texture lines
      if (rng.next() > 0.5) {
        groundGraphics.fillStyle(0x000000, 0.1);
        groundGraphics.fillRect(x + rng.next() * (tileSize - 10), h - groundHeight + 12, 8 + rng.next() * 12, 2);
      }
    }
    
    // Invisible physics floor (single continuous body prevents seam-sticking)
    const floor = scene.add.rectangle(mapWidth / 2, h - 32, mapWidth, 32, 0x000000, 0);
    floor.setVisible(false);
    scene.physics.add.existing(floor, true);

    // ─── VISIBLE PLATFORMS ───
    if (levelCfg.hasPlatforms) {
      for (let i = 0; i < tiles; i++) {
        if (i > levelCfg.platformStartTile && i % levelCfg.platformInterval === 0) {
          const px = i * tileSize + 32;
          const py = h - 160 - rng.next() * 80;
          const platWidth = 120 + rng.next() * 60;
          const platHeight = 24;
          
          // Draw visible platform
          const plat = scene.add.graphics();
          
          // Platform body
          plat.fillStyle(theme.platformColor, 1);
          plat.fillRoundedRect(px - platWidth / 2, py - platHeight / 2, platWidth, platHeight, 4);
          
          // Platform top highlight
          plat.fillStyle(theme.groundTopColor, 1);
          plat.fillRoundedRect(px - platWidth / 2, py - platHeight / 2, platWidth, 5, { tl: 4, tr: 4, bl: 0, br: 0 });
          
          // Bottom shadow
          plat.fillStyle(0x000000, 0.2);
          plat.fillRect(px - platWidth / 2 + 4, py + platHeight / 2 - 4, platWidth - 8, 4);
          
          // Platform edge decorations
          plat.fillStyle(theme.accentColor, 0.5);
          plat.fillRect(px - platWidth / 2, py - platHeight / 2, 3, platHeight);
          plat.fillRect(px + platWidth / 2 - 3, py - platHeight / 2, 3, platHeight);

          // Physics body for platform (invisible rectangle collider)
          const platBody = platforms.create(px, py, 'platform') as Phaser.Physics.Arcade.Sprite;
          platBody.setVisible(false);
          platBody.setDisplaySize(platWidth, platHeight);
          platBody.refreshBody();
        }
      }
    }

    // ─── ENVIRONMENT DECORATIONS ───
    LevelBuilder.addDecorations(scene, levelCfg, mapWidth, rng, theme);

    return { platforms, floor };
  }

  /** Add atmospheric decorations based on level theme */
  private static addDecorations(
    scene: Phaser.Scene,
    levelCfg: LevelConfig,
    mapWidth: number,
    rng: SeededRandom,
    _theme: { groundColor: number; platformColor: number; groundTopColor: number; accentColor: number }
  ) {
    const h = scene.cameras.main.height;
    const groundTop = h - 48;
    const levelNum = levelCfg.levelNumber ?? 1;

    for (let x = 100; x < mapWidth - 200; x += 200 + rng.next() * 300) {
      const decoType = rng.next();
      
      if (levelNum === 1) {
        // Forest: trees, bushes, mushrooms
        if (decoType < 0.3) {
          // Tree trunk
          const treeH = 80 + rng.next() * 120;
          const g = scene.add.graphics();
          g.fillStyle(0x4a3520, 1);
          g.fillRect(x - 8, groundTop - treeH, 16, treeH);
          // Canopy
          g.fillStyle(0x2d5a1e, 0.8);
          g.fillCircle(x, groundTop - treeH - 20, 35 + rng.next() * 20);
          g.fillStyle(0x3a7a28, 0.6);
          g.fillCircle(x - 15, groundTop - treeH - 10, 25);
          g.fillCircle(x + 15, groundTop - treeH - 5, 20);
          g.setScrollFactor(0.95); // Slight parallax
          g.setDepth(-1);
        } else if (decoType < 0.5) {
          // Glowing mushroom
          const g = scene.add.graphics();
          g.fillStyle(0x6a4fbf, 0.7);
          g.fillCircle(x, groundTop - 12, 8 + rng.next() * 6);
          g.fillStyle(0x8b6fcf, 0.5);
          g.fillCircle(x, groundTop - 15, 5);
          g.fillStyle(0x5a3520, 1);
          g.fillRect(x - 2, groundTop - 6, 4, 6);
          g.setDepth(-1);
        }
      } else if (levelNum === 2) {
        // Beach: rocks, shells, driftwood
        if (decoType < 0.3) {
          const g = scene.add.graphics();
          g.fillStyle(0x8a7b6a, 0.7);
          const rockW = 20 + rng.next() * 30;
          const rockH = 10 + rng.next() * 15;
          g.fillEllipse(x, groundTop - rockH / 2, rockW, rockH);
          g.setDepth(-1);
        }
      } else if (levelNum === 3) {
        // Castle: pillars, banners, torches
        if (decoType < 0.25) {
          // Stone pillar
          const pillarH = 100 + rng.next() * 60;
          const g = scene.add.graphics();
          g.fillStyle(0x4a4a5a, 1);
          g.fillRect(x - 12, groundTop - pillarH, 24, pillarH);
          // Pillar cap
          g.fillStyle(0x5a5a6a, 1);
          g.fillRect(x - 16, groundTop - pillarH - 8, 32, 8);
          g.fillRect(x - 16, groundTop, 32, 8);
          // Torch flame at top
          g.fillStyle(0xff8c00, 0.8);
          g.fillCircle(x, groundTop - pillarH - 16, 8);
          g.fillStyle(0xffcc00, 0.5);
          g.fillCircle(x, groundTop - pillarH - 20, 5);
          g.setScrollFactor(0.95);
          g.setDepth(-1);
        }
      }
    }
  }

  public static buildLeftWall(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
    const h = scene.cameras.main.height;
    const leftWall = scene.add.rectangle(-32, h/2, 64, h * 2).setOrigin(0.5);
    scene.physics.add.existing(leftWall, true);
    return leftWall;
  }
}
