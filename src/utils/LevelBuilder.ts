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

  public static buildPlatforms(scene: Phaser.Scene, levelCfg: LevelConfig, mapWidth: number, rng: SeededRandom) {
    // Generate the procedural decoration atlas first so all crate/barrel/deco frames are immediately ready
    LevelBuilder.generateDecoAtlas(scene);

    const h = scene.cameras.main.height;
    const levelNum = levelCfg.levelNumber ?? 1;
    const theme = LEVEL_THEMES[levelNum] || LEVEL_THEMES[1]!;
    const tileSize = levelCfg.tileSize;
    const tiles = Math.floor(mapWidth / tileSize);

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

      // Ground top surface reads as terrain thickness, not a floating line.
      groundGraphics.fillStyle(theme.groundTopColor, 1);
      groundGraphics.fillRoundedRect(x, h - groundHeight, tileSize, 10, { tl: 3, tr: 3, bl: 0, br: 0 });

      if (rng.next() > 0.55) {
        groundGraphics.fillStyle(theme.accentColor, 0.18);
        groundGraphics.fillEllipse(x + rng.next() * tileSize, h - 22 - rng.next() * 12, 12 + rng.next() * 18, 4 + rng.next() * 4);
      }
    }
    
    // Invisible physics floor (single continuous body prevents seam-sticking)
    const floor = scene.add.rectangle(mapWidth / 2, h - 32, mapWidth, 32, 0x000000, 0);
    floor.setVisible(false);
    scene.matter.add.gameObject(floor, { isStatic: true, friction: 0, frictionStatic: 0, frictionAir: 0 });

    // ─── VISIBLE PLATFORMS ───
    if (levelCfg.hasPlatforms) {
      for (let i = 0; i < tiles; i++) {
        if (i > levelCfg.platformStartTile && i % levelCfg.platformInterval === 0) {
          const px = i * tileSize + 32;
          const py = h - 160 - rng.next() * 80;
          const platWidth = 120 + rng.next() * 60;
          const platHeight = 32;
          
          // Draw visible platform
          const plat = scene.add.graphics();
          
          // Platform body with visible thickness so it reads as a real jumpable ledge.
          plat.fillStyle(theme.platformColor, 1);
          plat.fillRoundedRect(px - platWidth / 2, py - platHeight / 2, platWidth, platHeight, 7);

          plat.fillStyle(0x000000, 0.16);
          plat.fillRoundedRect(px - platWidth / 2 + 6, py + platHeight / 2 - 10, platWidth - 12, 8, 4);

          // Platform top cap
          plat.fillStyle(theme.groundTopColor, 1);
          plat.fillRoundedRect(px - platWidth / 2, py - platHeight / 2, platWidth, 9, { tl: 7, tr: 7, bl: 0, br: 0 });

          plat.fillStyle(theme.accentColor, 0.28);
          for (let d = 0; d < 3; d++) {
            const dx = px - platWidth / 2 + 18 + rng.next() * (platWidth - 36);
            plat.fillEllipse(dx, py - 1 + rng.next() * 8, 20 + rng.next() * 24, 4);
          }

          // Physics body for platform (invisible rectangle collider)
          const platBody = scene.add.rectangle(px, py, platWidth, platHeight, 0x000000, 0);
          platBody.setData('isOneWay', true);
          scene.matter.add.gameObject(platBody, { isStatic: true, friction: 0, frictionStatic: 0, frictionAir: 0 });

          // 40% chance to spawn a dynamic physics crate or barrel on top of the platform!
          const propRoll = rng.next();
          if (propRoll < 0.4) {
            const isCrate = propRoll < 0.25;
            const propX = px + (rng.next() - 0.5) * (platWidth - 40);
            const propY = py - platHeight / 2 - (isCrate ? 25 : 30);
            const frame = isCrate ? 'crate' : 'barrel';
            const prop = scene.add.image(propX, propY, 'deco_atlas', frame);
            
            // Register as a dynamic Matter body!
            const body = scene.matter.add.gameObject(prop, {
              friction: 0.1,
              frictionAir: 0.02,
              restitution: 0.05,
              density: 0.01 // lighter weight so they can be pushed or launched!
            });
            (body as any).setFixedRotation(true); // Keep them upright for cleaner look
            
            prop.setData('isDestructible', true);
            prop.setData('health', isCrate ? 15 : 30); // crate is fragile, barrel is sturdier
            prop.setData('type', frame);
            
            // Add to the scene's physicsProps group for tracking!
            const gScene = scene as any;
            if (gScene.physicsProps) {
              gScene.physicsProps.add(prop);
            }
          }
        }
      }
    }

    // ─── ENVIRONMENT DECORATIONS ───
    LevelBuilder.addDecorations(scene, levelCfg, mapWidth, rng, theme);

    return;
  }

  /** Generate high-performance decoration texture atlas procedurally on startup */
  public static generateDecoAtlas(scene: Phaser.Scene) {
    if (scene.textures.exists('deco_atlas')) return;

    // Create a RenderTexture to draw our assets
    const rt = scene.make.renderTexture({ width: 512, height: 256 }, false);
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Draw Tree (frame tree: x=0, y=0, w=100, h=200)
    const treeH = 150;
    g.fillStyle(0x4a3520, 1);
    g.fillRect(50 - 8, 200 - treeH, 16, treeH);
    g.fillStyle(0x2d5a1e, 0.8);
    g.fillCircle(50, 200 - treeH - 20, 35);
    g.fillStyle(0x3a7a28, 0.6);
    g.fillCircle(50 - 15, 200 - treeH - 10, 25);
    g.fillCircle(50 + 15, 200 - treeH - 5, 20);
    rt.draw(g, 0, 0);
    g.clear();

    // Draw Mushroom (frame mushroom: x=120, y=0, w=40, h=40)
    g.fillStyle(0x6a4fbf, 0.7);
    g.fillCircle(140, 20, 8);
    g.fillStyle(0x8b6fcf, 0.5);
    g.fillCircle(140, 17, 5);
    g.fillStyle(0x5a3520, 1);
    g.fillRect(140 - 2, 24, 4, 16);
    rt.draw(g, 0, 0);
    g.clear();

    // Draw Rock (frame rock: x=180, y=0, w=60, h=40)
    g.fillStyle(0x8a7b6a, 0.7);
    g.fillEllipse(210, 20, 40, 20);
    rt.draw(g, 0, 0);
    g.clear();

    // Draw Pillar (frame pillar: x=260, y=0, w=50, h=200)
    const pillarH = 150;
    g.fillStyle(0x4a4a5a, 1);
    g.fillRect(285 - 12, 200 - pillarH, 24, pillarH);
    g.fillStyle(0x5a5a6a, 1);
    g.fillRect(285 - 16, 200 - pillarH - 8, 32, 8);
    g.fillRect(285 - 16, 200 - 8, 32, 8);
    g.fillStyle(0xff8c00, 0.8);
    g.fillCircle(285, 200 - pillarH - 16, 8);
    g.fillStyle(0xffcc00, 0.5);
    g.fillCircle(285, 200 - pillarH - 20, 5);
    rt.draw(g, 0, 0);
    g.clear();

    // Draw Crate (frame crate: x=320, y=0, w=50, h=50)
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(320, 0, 50, 50);
    g.lineStyle(3, 0x5c3a21, 1);
    g.strokeRect(320, 0, 50, 50);
    g.lineBetween(320, 0, 370, 50);
    g.lineBetween(370, 0, 320, 50);
    rt.draw(g, 0, 0);
    g.clear();

    // Draw Barrel (frame barrel: x=380, y=0, w=40, h=60)
    g.fillStyle(0x4b5320, 1);
    g.fillRect(380, 0, 40, 60);
    g.fillStyle(0x353a1a, 1);
    g.fillRect(380, 0, 40, 5);
    g.fillRect(380, 55, 40, 5);
    g.fillStyle(0x282c14, 1);
    g.fillRect(380, 15, 40, 6);
    g.fillRect(380, 38, 40, 6);
    g.fillStyle(0xff4500, 1);
    g.fillRect(380, 27, 40, 5);
    rt.draw(g, 0, 0);
    g.clear();

    g.destroy();

    // Export RenderTexture to texture manager
    const texture = scene.textures.addRenderTexture('deco_atlas', rt);
    // Add frames
    if (texture) {
      texture.add('tree', 0, 0, 0, 100, 200);
      texture.add('mushroom', 0, 120, 0, 40, 40);
      texture.add('rock', 0, 180, 0, 60, 40);
      texture.add('pillar', 0, 260, 0, 50, 200);
      texture.add('crate', 0, 320, 0, 50, 50);
      texture.add('barrel', 0, 380, 0, 40, 60);
    }
  }

  /** Add atmospheric decorations based on level theme using SpriteGPULayer */
  private static addDecorations(
    scene: Phaser.Scene,
    levelCfg: LevelConfig,
    mapWidth: number,
    rng: SeededRandom,
    _theme: { groundColor: number; platformColor: number; groundTopColor: number; accentColor: number }
  ) {
    LevelBuilder.generateDecoAtlas(scene);

    const h = scene.cameras.main.height;
    const groundTop = h - 48;
    const levelNum = levelCfg.levelNumber ?? 1;

    // If WebGL, use SpriteGPULayer for maximum performance
    const isWebGL = scene.sys.game.config.renderType !== Phaser.CANVAS;

    if (isWebGL) {
      try {
        const decoLayer = (scene.add as any).spriteGPULayer('deco_atlas', 200);
        if (typeof decoLayer.setScrollFactor === 'function') {
          decoLayer.setScrollFactor(0.95);
        }
        if (typeof decoLayer.setDepth === 'function') {
          decoLayer.setDepth(-1);
        }

        for (let x = 100; x < mapWidth - 200; x += 200 + rng.next() * 300) {
          const decoType = rng.next();
          const member: any = { x: x, scaleX: 0.8 + rng.next() * 0.4, alpha: 0.85 };
          member.scaleY = member.scaleX;

          if (levelNum === 1) {
            if (decoType < 0.4) {
              member.frame = 'tree';
              member.y = groundTop - 100; // Origin is center
              decoLayer.addMember(member);
            } else if (decoType < 0.7) {
              member.frame = 'mushroom';
              member.y = groundTop - 20;
              decoLayer.addMember(member);
            }
          } else if (levelNum === 2) {
            if (decoType < 0.4) {
              member.frame = 'rock';
              member.y = groundTop - 15;
              decoLayer.addMember(member);
            }
          } else if (levelNum === 3) {
            if (decoType < 0.35) {
              member.frame = 'pillar';
              member.y = groundTop - 100;
              decoLayer.addMember(member);
            }
          }
        }
        return;
      } catch (e) {
        console.warn("Failed to use SpriteGPULayer, falling back to standard sprites:", e);
      }
    }

    // Fallback: standard sprites using the deco_atlas (works on both Canvas and WebGL)
    for (let x = 100; x < mapWidth - 200; x += 200 + rng.next() * 300) {
      const decoType = rng.next();
      let frame = '';
      let y = groundTop;

      if (levelNum === 1) {
        if (decoType < 0.4) {
          frame = 'tree';
          y = groundTop - 200;
        } else if (decoType < 0.7) {
          frame = 'mushroom';
          y = groundTop - 40;
        }
      } else if (levelNum === 2) {
        if (decoType < 0.4) {
          frame = 'rock';
          y = groundTop - 40;
        }
      } else if (levelNum === 3) {
        if (decoType < 0.35) {
          frame = 'pillar';
          y = groundTop - 200;
        }
      }

      if (frame) {
        const sprite = scene.add.sprite(x, y, 'deco_atlas', frame).setOrigin(0, 0);
        sprite.setScrollFactor(0.95);
        sprite.setDepth(-1);
        const scale = 0.8 + rng.next() * 0.4;
        sprite.setScale(scale);
        sprite.y = groundTop - (sprite.displayHeight);
      }
    }
  }

  public static buildLeftWall(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
    const h = scene.cameras.main.height;
    const leftWall = scene.add.rectangle(-32, h/2, 64, h * 2).setOrigin(0.5);
    scene.matter.add.gameObject(leftWall, { isStatic: true, friction: 0, frictionStatic: 0, frictionAir: 0 });
    return leftWall;
  }
}
