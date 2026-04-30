import Phaser from 'phaser';
import {
  COLORS,
  ENEMY_CONFIG,
  GAME_CONFIG,
  PLAYER_CONFIG,
  SCENE_KEYS,
  SOUND_KEYS,
  TEXTURE_KEYS,
} from '../utils/constants.js';
import { LEVEL_ONE, LevelData } from '../utils/levelData.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import type { HudUpdate } from './HudScene.js';

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private player!: Player;
  private enemies: Enemy[] = [];

  // Layers
  private skyLayer!: Phaser.GameObjects.TileSprite;
  private midLayer!: Phaser.GameObjects.TileSprite;
  private groundLayer!: Phaser.GameObjects.TileSprite;

  // Physics groups
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;

  // State
  private lives = PLAYER_CONFIG.STARTING_LIVES;
  private score = 0;
  private enemiesDefeated = 0;
  private startTime = 0;
  private isPaused = false;
  private isGameOver = false;
  private hasWon = false;
  private goalMarker?: Phaser.GameObjects.Container;
  private hudUpdateAccumulator = 0;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  create(): void {
    this.level = LEVEL_ONE;

    // Reset state
    this.lives = PLAYER_CONFIG.STARTING_LIVES;
    this.score = 0;
    this.enemiesDefeated = 0;
    this.enemies = [];
    this.isPaused = false;
    this.isGameOver = false;
    this.hasWon = false;
    this.startTime = this.time.now;

    this.physics.world.setBounds(0, 0, this.level.width, GAME_CONFIG.HEIGHT);
    this.cameras.main.setBounds(0, 0, this.level.width, GAME_CONFIG.HEIGHT);

    this.createBackground();
    this.createGround();
    this.createPlatforms();
    this.createGoal();
    this.createPlayer();
    this.createEnemies();
    this.setupCollisions();
    this.setupCamera();
    this.setupInput();
    this.startHud();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ====================== Build world ======================

  private createBackground(): void {
    const w = GAME_CONFIG.WIDTH;
    const h = GAME_CONFIG.HEIGHT;

    this.skyLayer = this.add
      .tileSprite(0, 0, w, h, TEXTURE_KEYS.BG_SKY)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-100);

    this.midLayer = this.add
      .tileSprite(0, 0, w, h, TEXTURE_KEYS.BG_MID)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-90)
      .setAlpha(0.92);
  }

  private createGround(): void {
    const groundHeight = GAME_CONFIG.HEIGHT - this.level.groundY;
    // Render as a TileSprite spanning the level width (independent of camera).
    this.groundLayer = this.add
      .tileSprite(
        0,
        this.level.groundY,
        this.level.width,
        groundHeight,
        TEXTURE_KEYS.TILE_GROUND,
      )
      .setOrigin(0, 0)
      .setDepth(-10);

    // Static body for ground (full-width strip).
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

  private createPlatforms(): void {
    this.level.platforms.forEach((p) => {
      // Visual platform (HD wood texture, scaled to fit width).
      const sprite = this.add
        .tileSprite(p.x, p.y, p.width, 28, TEXTURE_KEYS.TILE_PLATFORM)
        .setOrigin(0.5, 0.5)
        .setDepth(-5);
      // Add a darker wood underside trim
      this.add
        .rectangle(p.x, p.y + 16, p.width, 6, COLORS.DARK, 0.65)
        .setOrigin(0.5, 0.5)
        .setDepth(-5);
      // Static physics body matching visual.
      const collider = this.add.rectangle(p.x, p.y, p.width, 18, 0x000000, 0);
      this.physics.add.existing(collider, true);
      this.platforms.add(collider);
      void sprite;
    });
  }

  private createGoal(): void {
    const x = this.level.goalX;
    const y = this.level.groundY - 100;

    const container = this.add.container(x, y);

    // Banner pole
    const pole = this.add.rectangle(0, 0, 4, 200, 0x14142b, 1).setOrigin(0.5, 0);
    // Banner
    const banner = this.add.rectangle(28, 18, 60, 42, COLORS.PRIMARY, 1).setOrigin(0.5, 0);
    banner.setStrokeStyle(2, COLORS.ACCENT);
    // Banner text
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

    // Bobbing tween
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
    this.player.onAttackHitbox = (rect, _facing) => this.applyPlayerAttack(rect);
  }

  private createEnemies(): void {
    this.enemyGroup = this.physics.add.group();
    this.level.enemies.forEach((spawn) => {
      const enemy = new Enemy(this, spawn.x, spawn.y);
      enemy.setDepth(9);
      enemy.setTarget(this.player);
      enemy.onAttackHit = (e) => this.handleEnemyAttack(e);
      enemy.onDeath = (e) => this.handleEnemyDeath(e);
      this.enemyGroup.add(enemy);
      this.enemies.push(enemy);
    });
  }

  // ====================== Collisions / damage ======================

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemyGroup, this.platforms);
  }

  private applyPlayerAttack(hitbox: Phaser.Geom.Rectangle): void {
    // Slash FX
    const fx = this.add
      .image(
        hitbox.x + hitbox.width / 2,
        hitbox.y + hitbox.height / 2,
        TEXTURE_KEYS.SLASH_FX,
      )
      .setDepth(20)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setFlipX(this.player.getFacing() === -1)
      .setScale(0.6);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      scale: 1.1,
      duration: 220,
      onComplete: () => fx.destroy(),
    });

    // Damage enemies whose body intersects the hitbox
    this.enemies.forEach((enemy) => {
      if (enemy.getIsDead() || !enemy.body) return;
      const eb = enemy.body as Phaser.Physics.Arcade.Body;
      const enemyRect = new Phaser.Geom.Rectangle(eb.x, eb.y, eb.width, eb.height);
      if (Phaser.Geom.Rectangle.Overlaps(hitbox, enemyRect)) {
        enemy.takeDamage(PLAYER_CONFIG.ATTACK_DAMAGE);
        this.score += 10;
      }
    });
  }

  private handleEnemyAttack(enemy: Enemy): void {
    // Quick proximity check; player has invuln frames
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    if (Math.hypot(dx, dy) <= ENEMY_CONFIG.ATTACK_RANGE + 10) {
      this.player.takeDamage(ENEMY_CONFIG.ATTACK_DAMAGE);
      this.sound.play(SOUND_KEYS.HIT, { volume: 0.3 });
    }
  }

  private handleEnemyDeath(enemy: Enemy): void {
    this.enemies = this.enemies.filter((e) => e !== enemy);
    this.enemiesDefeated += 1;
    this.score += 50;

    // Particle burst on death
    const particles = this.add.particles(enemy.x, enemy.y, TEXTURE_KEYS.PARTICLE, {
      speed: { min: -200, max: 200 },
      scale: { start: 1.4, end: 0 },
      lifespan: 500,
      quantity: 14,
      tint: [0xe94560, 0xf2b134, 0xffffff],
      blendMode: 'ADD',
    });
    this.time.delayedCall(500, () => particles.destroy());
  }

  // ====================== Camera ======================

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);
  }

  // ====================== Input / pause ======================

  private setupInput(): void {
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
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

  // ====================== HUD ======================

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
    };
    this.events.emit('hud-update', data);
  }

  // ====================== Update loop ======================

  update(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver || this.hasWon) return;

    // Parallax scroll based on camera scrollX
    const cam = this.cameras.main;
    this.skyLayer.tilePositionX = cam.scrollX * 0.12;
    this.midLayer.tilePositionX = cam.scrollX * 0.32;

    this.player.update(time, delta);
    this.enemies.forEach((e) => e.update(time, delta));

    // Death below world
    if (this.player.y > GAME_CONFIG.HEIGHT + 200) {
      this.handlePlayerDeath();
    }

    // Health 0
    if (this.player.getHealth() <= 0 && !this.player.getIsDead()) {
      this.handlePlayerDeath();
    }

    // Goal check
    if (this.goalMarker && this.player.x >= this.level.goalX - 30) {
      this.triggerWin();
    }

    // Throttle HUD updates to ~10Hz
    this.hudUpdateAccumulator += delta;
    if (this.hudUpdateAccumulator > 100) {
      this.hudUpdateAccumulator = 0;
      this.emitHud();
    }
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
    } else {
      // Respawn at last spawn point with full HP
      this.player.setPosition(this.level.spawn.x, this.level.spawn.y);
      const body = this.player.body as Phaser.Physics.Arcade.Body | null;
      body?.setVelocity(0, 0);
      // Restore HP via re-creating: simpler—just heal by triggering takeDamage(-N)
      // BaseEntity doesn't have a heal method, so we use a small workaround.
      (this.player as unknown as { currentHealth: number }).currentHealth =
        PLAYER_CONFIG.MAX_HEALTH;
      this.cameras.main.flash(200, 233, 69, 96);
    }
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
