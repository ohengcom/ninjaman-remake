import Phaser from 'phaser';
import {
  BARREL_CONFIG,
  COLORS,
  ENEMY_CONFIG,
  GAME_CONFIG,
  PICKUP_CONFIG,
  PLAYER_CONFIG,
  SCENE_KEYS,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';
import {
  LEVEL_ONE,
  LevelData,
  PickupSpawn,
  Zone,
} from '../utils/levelData.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Pickup, PickupKind } from '../entities/Pickup.js';
import { Barrel } from '../entities/Barrel.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import { FallingPlatform } from '../entities/FallingPlatform.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { Shuriken } from '../entities/Shuriken.js';
import { Fx } from '../utils/Fx.js';
import type { HudUpdate } from './HudScene.js';

const ZONE_LABELS: Record<Zone, string> = {
  bamboo: 'Bamboo Forest',
  courtyard: 'Garden Courtyard',
  castle: 'Castle Rooftop',
};

/**
 * Main playable scene. Orchestrates all entities, parallax, combat resolution,
 * hit-stop, camera, pickups, checkpoints, boss flow, and the HUD event bus.
 */
export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private player!: Player;
  private boss?: Boss;

  private enemies: Enemy[] = [];
  private barrels: Barrel[] = [];
  private pickups: Pickup[] = [];
  private shurikens: Shuriken[] = [];
  private movingPlatforms: MovingPlatform[] = [];
  private fallingPlatforms: FallingPlatform[] = [];
  private checkpoints: Checkpoint[] = [];

  // Parallax layers (3 backgrounds for 3 zones)
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private bgZoneBamboo!: Phaser.GameObjects.Image;
  private bgZoneCourtyard!: Phaser.GameObjects.Image;
  private bgZoneCastle!: Phaser.GameObjects.Image;

  // Physics
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private barrelGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private movingGroup!: Phaser.Physics.Arcade.Group;
  private pickupGroup!: Phaser.Physics.Arcade.Group;
  private checkpointGroup!: Phaser.Physics.Arcade.Group;
  private shurikenGroup!: Phaser.Physics.Arcade.Group;

  // State
  private lives = PLAYER_CONFIG.STARTING_LIVES;
  private score = 0;
  private coins = 0;
  private enemiesDefeated = 0;
  private startTime = 0;
  private isPaused = false;
  private isGameOver = false;
  private hasWon = false;
  private currentZone: Zone = 'bamboo';
  private respawnPoint!: { x: number; y: number };
  private bossActive = false;
  private hudUpdateAccumulator = 0;
  private goalMarker?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    this.level = LEVEL_ONE;
    this.lives = PLAYER_CONFIG.STARTING_LIVES;
    this.score = 0;
    this.coins = 0;
    this.enemiesDefeated = 0;
    this.enemies = [];
    this.barrels = [];
    this.pickups = [];
    this.shurikens = [];
    this.movingPlatforms = [];
    this.fallingPlatforms = [];
    this.checkpoints = [];
    this.boss = undefined;
    this.bossActive = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.hasWon = false;
    this.startTime = this.time.now;
    this.currentZone = 'bamboo';
    this.respawnPoint = { x: this.level.spawn.x, y: this.level.spawn.y };

    this.physics.world.setBounds(0, 0, this.level.width, GAME_CONFIG.HEIGHT);
    this.cameras.main.setBounds(0, 0, this.level.width, GAME_CONFIG.HEIGHT);

    this.createBackground();
    this.createGround();
    this.createWalls();
    this.createPlatforms();
    this.createBarrels();
    this.createPickups();
    this.createCheckpoints();
    this.createGoal();
    this.createPlayer();
    this.createEnemies();
    this.setupCollisions();
    this.setupCamera();
    this.setupInput();
    this.startHud();

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.events.emit('hud-zone', ZONE_LABELS[this.currentZone]);
  }

  // =========================================================================
  // World construction
  // =========================================================================

  private createBackground(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    this.bgSky = this.add
      .tileSprite(0, 0, w, h, TEXTURE_KEYS.BG_SKY)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-100);

    this.bgMid = this.add
      .tileSprite(0, 0, w, h, TEXTURE_KEYS.BG_MID)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-90)
      .setAlpha(0.6);

    // Three zone-specific backgrounds, anchored to their zone.
    const placeZone = (zoneKey: Zone, texKey: string): Phaser.GameObjects.Image => {
      const zone = this.level.zones.find((z) => z.zone === zoneKey);
      if (!zone) {
        return this.add.image(0, 0, texKey).setVisible(false);
      }
      const zoneW = zone.endX - zone.startX;
      const img = this.add.image(zone.startX, 0, texKey).setOrigin(0, 0);
      const sx = zoneW / img.width;
      const sy = h / img.height;
      img.setScale(sx, sy);
      img.setScrollFactor(0.5, 0);
      img.setDepth(-80);
      img.setAlpha(0);
      return img;
    };
    this.bgZoneBamboo = placeZone('bamboo', TEXTURE_KEYS.BG_BAMBOO).setAlpha(1);
    this.bgZoneCourtyard = placeZone('courtyard', TEXTURE_KEYS.BG_COURTYARD);
    this.bgZoneCastle = placeZone('castle', TEXTURE_KEYS.BG_CASTLE);
  }

  private createGround(): void {
    const groundHeight = GAME_CONFIG.HEIGHT - this.level.groundY;

    // Repeating ground texture across the level width.
    this.add
      .tileSprite(
        0,
        this.level.groundY,
        this.level.width,
        groundHeight,
        TEXTURE_KEYS.TILE_GROUND,
      )
      .setOrigin(0, 0)
      .setDepth(-10);

    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(
      this.level.width / 2,
      this.level.groundY + groundHeight / 2,
      this.level.width,
      groundHeight,
      0x000000,
      0,
    );
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
  }

  private createWalls(): void {
    this.walls = this.physics.add.staticGroup();
    this.level.walls.forEach((wall) => {
      // Visible stone column
      this.add
        .tileSprite(wall.x, wall.y, wall.width, wall.height, TEXTURE_KEYS.TILE_STONE)
        .setOrigin(0.5, 0)
        .setDepth(-6);
      const collider = this.add.rectangle(
        wall.x,
        wall.y + wall.height / 2,
        wall.width,
        wall.height,
        0x000000,
        0,
      );
      this.physics.add.existing(collider, true);
      this.walls.add(collider);
    });
  }

  private createPlatforms(): void {
    this.movingGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    this.level.platforms.forEach((p) => {
      if (p.kind === 'moving') {
        const mp = new MovingPlatform(this, p.x, p.y, p.width, p.range ?? 200);
        this.movingPlatforms.push(mp);
        this.movingGroup.add(mp);
      } else if (p.kind === 'falling') {
        const fp = new FallingPlatform(this, p.x, p.y, p.width);
        this.fallingPlatforms.push(fp);
        this.platforms.add(fp);
      } else {
        // Static visual + collider
        this.add
          .tileSprite(p.x, p.y, p.width, 28, TEXTURE_KEYS.TILE_PLATFORM)
          .setOrigin(0.5, 0.5)
          .setDepth(-5);
        this.add
          .rectangle(p.x, p.y + 16, p.width, 6, COLORS.DARK, 0.65)
          .setOrigin(0.5, 0.5)
          .setDepth(-5);
        const collider = this.add.rectangle(p.x, p.y, p.width, 18, 0x000000, 0);
        this.physics.add.existing(collider, true);
        this.platforms.add(collider);
      }
    });
  }

  private createBarrels(): void {
    this.barrelGroup = this.physics.add.staticGroup();
    this.level.barrels.forEach((b) => {
      const barrel = new Barrel(this, b.x, b.y);
      barrel.onBreak = (br) => this.handleBarrelBreak(br);
      this.barrels.push(barrel);
      this.barrelGroup.add(barrel);
    });
  }

  private createPickups(): void {
    this.pickupGroup = this.physics.add.group({ allowGravity: false });
    this.level.pickups.forEach((s) => this.spawnPickup(s));
  }

  private spawnPickup(s: PickupSpawn | { x: number; y: number; kind: PickupKind }): Pickup {
    const p = new Pickup(this, s.x, s.y, s.kind);
    this.pickups.push(p);
    this.pickupGroup.add(p);
    return p;
  }

  private createCheckpoints(): void {
    this.checkpointGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.level.checkpoints.forEach((c) => {
      const cp = new Checkpoint(this, c.x, c.y, c.label);
      this.checkpoints.push(cp);
      this.checkpointGroup.add(cp);
    });
  }

  private createGoal(): void {
    const x = this.level.goalX;
    const y = this.level.groundY - 100;

    const container = this.add.container(x, y);
    const pole = this.add.rectangle(0, 0, 4, 200, 0x14142b, 1).setOrigin(0.5, 0);
    const banner = this.add.rectangle(28, 18, 60, 42, COLORS.PRIMARY, 1).setOrigin(0.5, 0);
    banner.setStrokeStyle(2, COLORS.ACCENT);
    const txt = this.add
      .text(28, 39, 'GOAL', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: COLORS.LIGHT_HEX,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add([pole, banner, txt]);
    container.setDepth(-1);

    this.tweens.add({
      targets: banner,
      y: '+=4',
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.goalMarker = container;
  }

  private createPlayer(): void {
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y);
    this.player.setDepth(10);

    this.player.onAttackHitbox = (rect, comboHit, dmg) =>
      this.applyPlayerAttack(rect, comboHit, dmg);
    this.player.onSlamLanding = (x, y, dmg, range) =>
      this.applyPlayerSlam(x, y, dmg, range);
    this.player.onSlideHitbox = (rect, dmg) => this.applyPlayerSlide(rect, dmg);
    this.player.onThrowShuriken = (x, y, dir) => this.spawnShuriken(x, y, dir);
    this.player.onJump = (x, y) => Fx.dust(this, x, y);
    this.player.onLand = (x, y, fellFrom) => {
      if (fellFrom > 80) Fx.dust(this, x, y, 10);
    };
    this.player.onDoubleJump = (x, y) => Fx.dust(this, x, y + 30, 8);
  }

  private createEnemies(): void {
    this.enemyGroup = this.physics.add.group();
    this.level.enemies.forEach((spawn) => {
      const enemy = new Enemy(this, spawn.x, spawn.y, spawn.variant ?? 'grunt');
      enemy.setDepth(9);
      enemy.setTarget(this.player);
      enemy.onAttackHit = (e) => this.handleEnemyAttack(e);
      enemy.onDeath = (e) => this.handleEnemyDeath(e);
      this.enemyGroup.add(enemy);
      this.enemies.push(enemy);
    });
  }

  private spawnBoss(): void {
    if (this.boss) return;
    this.boss = new Boss(this, this.level.boss.x, this.level.boss.y);
    this.boss.setTarget(this.player);
    this.boss.onMeleeHit = (b, dmg) => this.handleBossAttack(b, dmg);
    this.boss.onVolley = (b) => this.handleBossVolley(b);
    this.boss.onDeath = () => this.handleBossDeath();
    this.physics.add.collider(this.boss, this.platforms);
    this.physics.add.collider(this.boss, this.walls);
    this.bossActive = true;
    this.events.emit('hud-toast', 'WARNING - TENGU SHOGUN');
    this.cameras.main.flash(380, 233, 69, 96);
  }

  // =========================================================================
  // Collisions / damage
  // =========================================================================

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.barrelGroup);
    this.physics.add.collider(this.enemyGroup, this.platforms);
    this.physics.add.collider(this.enemyGroup, this.walls);
    this.physics.add.collider(this.enemyGroup, this.barrelGroup);

    // Moving platforms collide as solid surfaces; passenger transport handled in update.
    this.physics.add.collider(this.player, this.movingGroup);
    this.physics.add.collider(this.enemyGroup, this.movingGroup);

    // Falling platforms: trigger the fall when player lands on top.
    this.fallingPlatforms.forEach((fp) => {
      this.physics.add.collider(this.player, fp, () => {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        if (body.blocked.down || body.touching.down) fp.touch();
      });
    });

    // Pickups (overlap-only, not solid).
    this.physics.add.overlap(this.player, this.pickupGroup, (_p, pickup) => {
      this.collectPickup(pickup as Pickup);
    });

    // Checkpoints (overlap).
    this.physics.add.overlap(this.player, this.checkpointGroup, (_p, cp) => {
      this.tryActivateCheckpoint(cp as Checkpoint);
    });

    // Shurikens vs enemies (overlap).
    this.shurikenGroup = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.shurikenGroup, this.enemyGroup, (s, e) => {
      const enemy = e as Enemy;
      const shuriken = s as Shuriken;
      if (enemy.getIsDead()) return;
      enemy.takeDamage(PLAYER_CONFIG.SHURIKEN_DAMAGE);
      Fx.sparks(this, shuriken.x, shuriken.y);
      this.score += 8;
      shuriken.destroy();
    });
    this.physics.add.overlap(this.shurikenGroup, this.barrelGroup, (s, b) => {
      const barrel = b as Barrel;
      const shuriken = s as Shuriken;
      if (barrel.getIsBroken()) return;
      barrel.hit(BARREL_CONFIG.HEALTH);
      shuriken.destroy();
    });
  }

  /** Player melee attack hits enemies and barrels in `rect`. */
  private applyPlayerAttack(rect: Phaser.Geom.Rectangle, comboHit: number, dmg: number): void {
    // Slash FX
    const fx = this.add
      .image(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        TEXTURE_KEYS.SLASH_FX,
      )
      .setDepth(20)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setFlipX(this.player.getFacing() === -1)
      .setScale(0.6 + comboHit * 0.1);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      scale: 1.1 + comboHit * 0.15,
      duration: 220,
      onComplete: () => fx.destroy(),
    });

    let hitSomething = false;

    this.enemies.forEach((enemy) => {
      if (enemy.getIsDead() || !enemy.body) return;
      const eb = enemy.body as Phaser.Physics.Arcade.Body;
      const enemyRect = new Phaser.Geom.Rectangle(eb.x, eb.y, eb.width, eb.height);
      if (Phaser.Geom.Rectangle.Overlaps(rect, enemyRect)) {
        if (enemy.takeDamage(dmg)) {
          hitSomething = true;
          this.score += 10 * comboHit;
          Fx.sparks(this, eb.x + eb.width / 2, eb.y + eb.height / 2);
          Fx.floatingNumber(
            this,
            eb.x + eb.width / 2,
            eb.y,
            `${dmg}`,
            COLORS.LIGHT_HEX,
            comboHit >= 3,
          );
        }
      }
    });

    // Boss
    if (this.boss && !this.boss.getIsDead() && this.boss.body) {
      const bb = this.boss.body as Phaser.Physics.Arcade.Body;
      const bRect = new Phaser.Geom.Rectangle(bb.x, bb.y, bb.width, bb.height);
      if (Phaser.Geom.Rectangle.Overlaps(rect, bRect)) {
        if (this.boss.takeDamage(dmg)) {
          hitSomething = true;
          this.score += 15 * comboHit;
          Fx.sparks(this, bb.x + bb.width / 2, bb.y + bb.height / 2, 16);
          Fx.floatingNumber(
            this,
            bb.x + bb.width / 2,
            bb.y,
            `${dmg}`,
            COLORS.PRIMARY_HEX,
            true,
          );
        }
      }
    }

    // Barrels
    this.barrels.forEach((barrel) => {
      if (barrel.getIsBroken() || !barrel.body) return;
      const bb = barrel.body as Phaser.Physics.Arcade.StaticBody;
      const bRect = new Phaser.Geom.Rectangle(bb.x, bb.y, bb.width, bb.height);
      if (Phaser.Geom.Rectangle.Overlaps(rect, bRect)) {
        barrel.hit(dmg);
      }
    });

    if (hitSomething) {
      this.playSfx(SOUND_KEYS.HIT, 0.45);
      Fx.hitStop(this);
      const combo = this.player.getComboIndex();
      this.events.emit('hud-combo', combo);
    }
  }

  /** Slam landing AOE: damages everything within `range` of (x, y). */
  private applyPlayerSlam(x: number, y: number, dmg: number, range: number): void {
    // Visual shockwave (animate via scale; Arc doesn't auto-redraw on radius change)
    const ring = this.add
      .circle(x, y, range, COLORS.ACCENT, 0)
      .setStrokeStyle(4, COLORS.ACCENT, 1)
      .setDepth(20)
      .setScale(0.05);
    this.tweens.add({
      targets: ring,
      scale: 1,
      alpha: 0,
      duration: 360,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
    Fx.dust(this, x, y, 18);

    const targets: Array<{ x: number; y: number; takeDamage: (n: number) => boolean }> = [];
    this.enemies.forEach((e) => !e.getIsDead() && targets.push(e));
    if (this.boss && !this.boss.getIsDead()) targets.push(this.boss);

    let hitAny = false;
    targets.forEach((t) => {
      if (Phaser.Math.Distance.Between(t.x, t.y, x, y) <= range) {
        if (t.takeDamage(dmg)) {
          hitAny = true;
          Fx.sparks(this, t.x, t.y);
        }
      }
    });
    this.barrels.forEach((b) => {
      if (b.getIsBroken()) return;
      if (Phaser.Math.Distance.Between(b.x, b.y, x, y) <= range) {
        b.hit(BARREL_CONFIG.HEALTH);
      }
    });
    if (hitAny) {
      this.playSfx(SOUND_KEYS.HIT, 0.5);
      Fx.hitStop(this, 100);
    }
  }

  /** Slide tackle damages enemies in the slide rect. */
  private applyPlayerSlide(rect: Phaser.Geom.Rectangle, dmg: number): void {
    this.enemies.forEach((enemy) => {
      if (enemy.getIsDead() || !enemy.body) return;
      const eb = enemy.body as Phaser.Physics.Arcade.Body;
      const enemyRect = new Phaser.Geom.Rectangle(eb.x, eb.y, eb.width, eb.height);
      if (Phaser.Geom.Rectangle.Overlaps(rect, enemyRect)) {
        if (enemy.takeDamage(dmg)) {
          Fx.sparks(this, eb.x + eb.width / 2, eb.y + eb.height / 2);
        }
      }
    });
  }

  private spawnShuriken(x: number, y: number, dir: 1 | -1): void {
    const s = new Shuriken(this, x, y, dir);
    this.shurikens.push(s);
    this.shurikenGroup.add(s);
  }

  private handleEnemyAttack(enemy: Enemy): void {
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    if (Math.hypot(dx, dy) <= ENEMY_CONFIG.ATTACK_RANGE + 10) {
      this.player.takeDamage(ENEMY_CONFIG.ATTACK_DAMAGE);
      Fx.blood(this, this.player.x, this.player.y - 20);
    }
  }

  private handleEnemyDeath(enemy: Enemy): void {
    this.enemies = this.enemies.filter((e) => e !== enemy);
    this.enemiesDefeated += 1;
    this.score += 50;
    Fx.blood(this, enemy.x, enemy.y, 16);

    // 30% chance to drop a coin where it died
    if (Math.random() < 0.3) {
      this.spawnPickup({ x: enemy.x, y: enemy.y - 30, kind: 'coin' });
    }
  }

  private handleBossAttack(_boss: Boss, dmg: number): void {
    if (!this.boss) return;
    const dx = this.player.x - this.boss.x;
    const dy = this.player.y - this.boss.y;
    if (Math.abs(dx) <= 130 && Math.abs(dy) <= 100) {
      this.player.takeDamage(dmg);
      Fx.blood(this, this.player.x, this.player.y - 20);
    }
  }

  private handleBossVolley(boss: Boss): void {
    // Spawn 3 shurikens fanned toward player.
    const dx = this.player.x - boss.x;
    const dir: 1 | -1 = dx < 0 ? -1 : 1;
    for (let i = -1; i <= 1; i++) {
      const s = new Shuriken(this, boss.x + dir * 40, boss.y - 20 + i * 28, dir);
      const body = s.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(i * 90);
      // These hurt the player on overlap as well.
      this.physics.add.overlap(this.player, s, () => {
        if (!s.active) return;
        this.player.takeDamage(12);
        Fx.sparks(this, s.x, s.y);
        s.destroy();
      });
      this.shurikenGroup.add(s);
      this.shurikens.push(s);
    }
  }

  private handleBossDeath(): void {
    this.bossActive = false;
    this.score += 1000;
    Fx.toast(this, 'BOSS DEFEATED!');
    this.cameras.main.shake(600, 0.018);
    // Shower of coins from boss
    if (this.boss) {
      for (let i = 0; i < 8; i++) {
        const ang = Phaser.Math.DegToRad(180 + i * 18);
        const off = 60;
        this.spawnPickup({
          x: this.boss.x + Math.cos(ang) * off,
          y: this.boss.y - 20 + Math.sin(ang) * off,
          kind: i % 4 === 0 ? 'dango' : 'coin',
        });
      }
    }
  }

  private handleBarrelBreak(barrel: Barrel): void {
    this.score += 15;
    Fx.dust(this, barrel.x, barrel.y - 20, 10);
    const dropDango = Math.random() < BARREL_CONFIG.DROP_DANGO_CHANCE;
    this.spawnPickup({
      x: barrel.x,
      y: barrel.y - 40,
      kind: dropDango ? 'dango' : 'coin',
    });
    this.barrels = this.barrels.filter((b) => b !== barrel);
  }

  private collectPickup(pickup: Pickup): void {
    if (pickup.isCollected()) return;
    pickup.markCollected();

    switch (pickup.kind) {
      case 'coin':
        this.coins += 1;
        this.score += PICKUP_CONFIG.COIN_VALUE;
        Fx.floatingNumber(this, pickup.x, pickup.y, `+${PICKUP_CONFIG.COIN_VALUE}`, COLORS.ACCENT_HEX);
        break;
      case 'dango': {
        const restored = this.player.heal(PICKUP_CONFIG.DANGO_HEAL);
        Fx.floatingNumber(this, pickup.x, pickup.y, `+${restored} HP`, '#9cce6c');
        break;
      }
      case 'shuriken':
        this.player.addShuriken(PICKUP_CONFIG.SHURIKEN_REFILL);
        Fx.floatingNumber(
          this,
          pickup.x,
          pickup.y,
          `+${PICKUP_CONFIG.SHURIKEN_REFILL} shuriken`,
          COLORS.LIGHT_HEX,
        );
        break;
    }

    this.tweens.add({
      targets: pickup,
      alpha: 0,
      scale: 1.4,
      duration: 160,
      onComplete: () => pickup.destroy(),
    });
    this.pickups = this.pickups.filter((p) => p !== pickup);
  }

  private tryActivateCheckpoint(cp: Checkpoint): void {
    if (!cp.activate()) return;
    this.respawnPoint = { x: cp.x, y: cp.y - 80 };
    Fx.toast(this, `Checkpoint: ${cp.label}`);
    this.player.heal(20);
  }

  // =========================================================================
  // Camera + input + HUD
  // =========================================================================

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(160, 90);
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    const escHandler = (): void => this.togglePause();
    kb.on('keydown-ESC', escHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => kb.off('keydown-ESC', escHandler));
  }

  private togglePause(): void {
    if (this.isGameOver || this.hasWon) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.world.pause();
      this.events.emit('hud-pause');
    } else {
      this.physics.world.resume();
      this.events.emit('hud-resume');
    }
  }

  private playSfx(key: string, volume = 0.5): void {
    try {
      if (!this.cache.audio.exists(key)) return;
      this.sound.play(key, { volume });
    } catch (err) {
      console.warn('[v0] sfx play failed', err);
    }
  }

  private startHud(): void {
    if (!this.scene.isActive(SCENE_KEYS.HUD)) {
      this.scene.launch(SCENE_KEYS.HUD);
    }
    this.emitHud();
  }

  private emitHud(): void {
    const data: HudUpdate = {
      health: this.player.getHealth(),
      maxHealth: this.player.getMaxHealth(),
      lives: this.lives,
      score: this.score,
      enemiesRemaining: this.enemies.length,
      timeMs: this.time.now - this.startTime,
      coins: this.coins,
      shuriken: this.player.getShurikenCount(),
      zone: ZONE_LABELS[this.currentZone],
      bossActive: this.bossActive,
      bossHealth: this.boss?.getHealth(),
      bossMaxHealth: this.boss?.getMaxHealth(),
    };
    this.events.emit('hud-update', data);
  }

  // =========================================================================
  // Update loop
  // =========================================================================

  update(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver || this.hasWon) return;

    // Parallax: sky stays slow, mid medium. Zone backgrounds use scrollFactor.
    const cam = this.cameras.main;
    this.bgSky.tilePositionX = cam.scrollX * 0.12;
    this.bgMid.tilePositionX = cam.scrollX * 0.32;

    this.player.update(time, delta);
    this.enemies.forEach((e) => e.update(time, delta));
    this.movingPlatforms.forEach((mp) => mp.update());
    this.shurikens = this.shurikens.filter((s) => {
      if (!s.active) return false;
      s.update(time);
      return s.active;
    });

    // Magnet pickups
    this.pickups.forEach((p) => p.attractToward(this.player.x, this.player.y));

    // Carry the player on horizontal moving platforms.
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (playerBody.blocked.down || playerBody.touching.down) {
      this.movingPlatforms.forEach((mp) => {
        const onTop =
          Math.abs(this.player.y + 40 - mp.y) < 16 &&
          Math.abs(this.player.x - mp.x) < (mp.displayWidth ?? 200) / 2;
        if (onTop) this.player.x += mp.getDeltaX(delta);
      });
    }

    // Zone tracking + transitions
    this.updateZoneFromPlayerX();

    // Boss spawn trigger when player gets close.
    if (!this.boss && this.player.x > this.level.boss.x - 600) {
      this.spawnBoss();
    }
    if (this.boss) this.boss.update(time, delta);

    // Death below world
    if (this.player.y > GAME_CONFIG.HEIGHT + 200) {
      this.handlePlayerDeath();
      return;
    }
    if (this.player.getHealth() <= 0 && !this.player.getIsDead()) {
      this.handlePlayerDeath();
      return;
    }

    // Goal check (only after boss is gone)
    if (
      this.goalMarker &&
      !this.bossActive &&
      this.player.x >= this.level.goalX - 30 &&
      (!this.boss || this.boss.getIsDead())
    ) {
      this.triggerWin();
    }

    // Throttled HUD update (~10Hz)
    this.hudUpdateAccumulator += delta;
    if (this.hudUpdateAccumulator > 100) {
      this.hudUpdateAccumulator = 0;
      this.emitHud();
    }
  }

  /**
   * Detects when the player crosses a zone boundary, fades cross-zone bgs,
   * and shows a banner.
   */
  private updateZoneFromPlayerX(): void {
    const newZone = this.level.zones.find(
      (z) => this.player.x >= z.startX && this.player.x < z.endX,
    )?.zone;
    if (!newZone || newZone === this.currentZone) return;
    this.currentZone = newZone;
    this.events.emit('hud-zone', ZONE_LABELS[newZone]);
    // Cross-fade the zone backgrounds for a smooth biome transition.
    const bgFor = (z: Zone): Phaser.GameObjects.Image => {
      switch (z) {
        case 'bamboo':
          return this.bgZoneBamboo;
        case 'courtyard':
          return this.bgZoneCourtyard;
        case 'castle':
          return this.bgZoneCastle;
      }
    };
    [this.bgZoneBamboo, this.bgZoneCourtyard, this.bgZoneCastle].forEach((img) =>
      this.tweens.add({ targets: img, alpha: 0, duration: 600 }),
    );
    this.tweens.add({ targets: bgFor(newZone), alpha: 1, duration: 700 });
  }

  private handlePlayerDeath(): void {
    if (this.isGameOver) return;
    this.lives -= 1;
    this.emitHud();

    if (this.lives <= 0) {
      this.isGameOver = true;
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop(SCENE_KEYS.HUD);
        this.scene.start(SCENE_KEYS.GAME_OVER, {
          score: this.score,
          enemiesDefeated: this.enemiesDefeated,
        });
      });
      return;
    }

    // Respawn at most-recent checkpoint with full HP.
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    body?.setVelocity(0, 0);
    this.player.restoreFullHealth();
    this.cameras.main.flash(220, 233, 69, 96);
  }

  private triggerWin(): void {
    if (this.hasWon) return;
    this.hasWon = true;
    const elapsed = this.time.now - this.startTime;
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop(SCENE_KEYS.HUD);
      this.scene.start(SCENE_KEYS.WIN, {
        score: this.score + Math.max(0, 5000 - Math.floor(elapsed / 10)),
        enemiesDefeated: this.enemiesDefeated,
        timeMs: elapsed,
      });
    });
  }
}
