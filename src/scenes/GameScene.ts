import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy, EnemyType } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Projectile } from '../entities/Projectile.js';
import { CombatManager } from '../managers/CombatManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { getLevelConfig, LevelConfig } from '../config/levels.js';
import { COMBO_CONFIG, SCORE_CONFIG, PLAYER_ATTACKS, PROJECTILE_CONFIG, PLAYER_DEFENSE } from '../config/combat.js';
import { BOSS_STATS } from '../config/enemies.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private boss: Boss | null = null;
  private score: number = 0;
  
  private comboCount: number = 0;
  private comboTimer: Phaser.Time.TimerEvent | null = null;
  private currentStyle: string = '';
  
  private hitParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private lastSafeX: number = 200;
  private lastSafeY: number = 0;
  private currentLevel: number = 1;
  private levelCfg!: LevelConfig;
  private rng!: SeededRandom;
  private mapWidth: number = 0;
  private isTransitioning: boolean = false;

  private combatManager!: CombatManager;
  private readonly onPlayerAttack = (attacker: Player, type: string) => this.combatManager.resolvePlayerAttack(attacker, type, this.enemies, this.boss);
  private readonly onPlayerParry = (defender: Player) => this.handleParry(defender);
  private readonly onEnemyAttack = (attacker: Enemy, dmg: number, reach: number) => this.combatManager.resolveEnemyAttack(attacker, dmg, reach, this.player);
  private readonly onBossAttack = (attacker: Boss) => this.combatManager.resolveBossAttack(attacker, this.player);
  private readonly onPlayerDead = () => this.handlePlayerDeath();
  private readonly onEnemyShoot = (attacker: Enemy, damage: number) => {
    const p = this.projectiles.get(attacker.x, attacker.y) as Projectile;
    if (p) {
      const dir = attacker.flipX ? -1 : 1;
      p.fire(attacker.x + (20 * dir), attacker.y, dir, PROJECTILE_CONFIG.enemyBulletSpeed, damage, 'projectile');
      SoundManager.playSwing();
    }
  };
  private readonly onPlayerCastWave = (player: Player) => {
    SoundManager.playHadouken();
    const wave = this.projectiles.get(player.x, player.y) as Projectile;
    if (wave) {
      const dir = player.flipX ? -1 : 1;
      wave.fire(player.x + (30 * dir), player.y, dir, PLAYER_ATTACKS.wave.speed, PLAYER_ATTACKS.wave.damage, 'player_wave');
    }
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level?: number }) {
    const saveData = SaveManager.load();
    this.currentLevel = data.level || saveData.unlockedLevel;
    this.score = 0;
    this.isTransitioning = false;
  }

  create(): void {
    this.cameras.main.fadeIn(800, 0, 0, 0);
    SoundManager.startBGM(this.currentLevel);
    this.combatManager = new CombatManager(this);
    this.comboCount = 0;
    this.currentStyle = '';
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.lastSafeX = 200;
    this.lastSafeY = h - 250;
    this.boss = null;
    this.isTransitioning = false;

    // Level configs
    this.levelCfg = getLevelConfig(this.currentLevel);
    this.rng = new SeededRandom(this.currentLevel * 12345);
    const farBg = this.levelCfg.farBg;
    const midBg = this.levelCfg.midBg;
    this.mapWidth = this.levelCfg.mapTiles * this.levelCfg.tileSize;

    this.add.image(w/2, h/2, farBg).setScrollFactor(0);
    this.add.image(w/2, h/2, midBg).setScrollFactor(0.2);

    // Refresh HUD properly by stopping and re-launching it so events connect to the new GameScene instance
    this.scene.stop('HUDScene');
    this.scene.launch('HUDScene');

    // Platforms
    const platforms = this.physics.add.staticGroup();
    const tiles = Math.floor(this.mapWidth / this.levelCfg.tileSize);
    
    for (let i = 0; i < tiles; i++) {
      // Create a continuous, solid floor
      platforms.create(i * this.levelCfg.tileSize + 32, h - 32, 'platform');
      
      if (this.levelCfg.hasPlatforms && i > this.levelCfg.platformStartTile && i % this.levelCfg.platformInterval === 0) {
         platforms.create(i * this.levelCfg.tileSize + 32, h - 160 - this.rng.next() * 80, 'platform');
      }
    }

    const leftWall = this.add.rectangle(-32, h/2, 64, h * 2).setOrigin(0.5);
    this.physics.add.existing(leftWall, true);

    const saveData = SaveManager.load();
    this.player = new Player(this, this.lastSafeX, this.lastSafeY);
    this.player.maxHealth = saveData.maxHealth;
    this.player.health = saveData.maxHealth;
    
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.player, leftWall);

    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: 30, runChildUpdate: true });
    this.projectiles = this.physics.add.group({ classType: Projectile, maxSize: 20, runChildUpdate: true });
    
    if (!this.levelCfg.isBossLevel) {
      const types: EnemyType[] = [...this.levelCfg.enemyTypes];
      const [minSpacing, maxSpacing] = this.levelCfg.enemySpacing;
      for (let x = this.levelCfg.enemyStartX; x < this.mapWidth - 800; x += minSpacing + this.rng.next() * (maxSpacing - minSpacing)) {
        const type = this.rng.pick(types);
        const yOffset = type === 'sniper' ? 350 : 250;
        const enemy = this.enemies.get(x, h - yOffset, type) as Enemy;
        if (enemy) {
            enemy.spawn(x, h - yOffset, type);
            enemy.setTarget(this.player);
        }
      }
      
      const portal = this.add.text(this.mapWidth - 300, h - 150, '=> NEXT SECTOR =>', {
        fontFamily: 'Impact', fontSize: '32px', color: '#00ffff'
      }).setOrigin(0.5);
      this.tweens.add({ targets: portal, alpha: 0.2, yoyo: true, repeat: -1, duration: 800 });

    } else {
      // Boss level: spawn boss closer to player for immediate encounter
      const bossX = Math.min(this.mapWidth - 400, 800);
      this.boss = new Boss(this, bossX, h - 150);
      this.boss.setTarget(this.player);
      this.physics.add.collider(this.boss, platforms);
      
      this.add.text(bossX, 100, 'WARNING: CORE GUARDIAN', {
         fontFamily: 'Impact', fontSize: '48px', color: '#ff0055'
      }).setOrigin(0.5);
    }

    this.physics.add.collider(this.enemies, platforms);

    this.hitParticles = this.add.particles(0, 0, 'platform', {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      tint: [ 0xffffff, 0x00ffff, 0xe94560 ],
      blendMode: 'ADD',
      lifespan: 400,
      gravityY: 500,
      emitting: false
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapWidth, h);
    this.physics.world.setBounds(0, 0, this.mapWidth, h * 2);

    // PostFX: cyberpunk atmosphere
    this.cameras.main.filters.internal.addGlow(0xe94560, 4, 0, 1, undefined, 4, 10);
    this.cameras.main.filters.internal.addVignette(0.5, 0.5, 0.9, 0.4);

    // Ambient floating particles (data motes)
    this.add.particles(w / 2, h / 2, 'platform', {
      x: { min: 0, max: this.mapWidth },
      y: { min: 0, max: h },
      scale: { start: 0.02, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [0x00ffff, 0xe94560, 0xffffff],
      blendMode: 'ADD',
      lifespan: { min: 3000, max: 6000 },
      speed: { min: 10, max: 40 },
      angle: { min: 250, max: 290 },
      frequency: 200,
      quantity: 1,
    }).setScrollFactor(0.5);

    this.events.on('player_attack', this.onPlayerAttack);
    this.events.on('player_parry', this.onPlayerParry);
    this.events.on('enemy_attack', this.onEnemyAttack);
    this.events.on('boss_attack', this.onBossAttack);
    this.events.on('player_dead', this.onPlayerDead);
    this.events.on('enemy_shoot', this.onEnemyShoot);
    this.events.on('player_cast_wave', this.onPlayerCastWave);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    // Pause support
    this.input.keyboard!.on('keydown-ESC', this.pauseGame, this);
    this.input.keyboard!.on('keydown-P', this.pauseGame, this);

    this.physics.add.overlap(this.projectiles, this.player, (playerObj, projObj) => {
        const proj = projObj as Projectile;
        const player = playerObj as Player;
        if (proj.active && player.health > 0 && proj.texture.key === 'projectile') {
            const dir = proj.body!.velocity.x > 0 ? 1 : -1;
            
            if (player.isBlocking && Math.sign(dir) !== (player.flipX ? -1 : 1)) {
                 player.health -= Math.floor(proj.damage * 0.2);
                 this.events.emit('player_parry', player);
                 player.setVelocityX(dir * 50);
            } else {
                 player.takeDamage(proj.damage, dir);
                 SoundManager.playDamage();
                 this.emitHitParticle(player.x, player.y, 5);
                 this.cameras.main.shake(200, 0.02);
            }
            this.events.emit('update_health', player.health, player.maxHealth);
            proj.hit();
        }
    });

    // Player wave hitting enemies
    this.physics.add.overlap(this.projectiles, this.enemies, (projObj, enemyObj) => {
        const proj = projObj as Projectile;
        const enemy = enemyObj as Enemy;
        if (proj.active && enemy.active && enemy.health > 0 && proj.texture.key === 'player_wave') {
            const dir = proj.body!.velocity.x > 0 ? 1 : -1;
            enemy.takeDamage(proj.damage, dir);
            SoundManager.playHit();
            this.emitHitParticle(enemy.x, enemy.y, 10);
            proj.hit(); // Consume wave
            if (enemy.health <= 0) {
               this.addScore(SCORE_CONFIG.waveKill);
               this.incrementCombo();
            }
        }
    });

    // Player wave hitting Boss
    if (this.boss) {
        this.physics.add.overlap(this.projectiles, this.boss, (projObj, bossObj) => {
            const proj = projObj as Projectile;
            const boss = bossObj as Boss;
            if (proj.active && boss.active && boss.health > 0 && proj.texture.key === 'player_wave') {
                const dir = proj.body!.velocity.x > 0 ? 1 : -1;
                boss.takeDamage(proj.damage * BOSS_STATS.damageMultiplier, dir);
                SoundManager.playHit();
                this.emitHitParticle(boss.x, boss.y, 15);
                proj.hit();
                this.incrementCombo();
            }
        });
    }

    this.time.delayedCall(10, () => {
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
      this.events.emit('update_score', this.score);
      this.events.emit('update_level', this.currentLevel);
    });
  }

  update(_time: number, _delta: number): void {
    if (this.player.body!.touching.down && this.player.y < this.cameras.main.height - 50) {
        this.lastSafeX = this.player.x;
        this.lastSafeY = this.player.y;
    }

    if (this.player.y > this.cameras.main.height + 100 && this.player.health > 0) {
      this.resetCombo();
      this.player.takeDamage(PLAYER_DEFENSE.fallDamage, 0);
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
      if (this.player.health > 0) {
          this.player.setPosition(this.lastSafeX, this.lastSafeY - 100);
          this.player.setVelocity(0, 0);
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
      }
    }

    if (!this.levelCfg.isBossLevel && this.player.x > this.mapWidth - 100 && !this.isTransitioning) {
       this.isTransitioning = true;
       this.player.setVelocityX(0);
       SaveManager.updateLevel(this.currentLevel + 1);
       SaveManager.addSP(this.levelCfg.completionSP);
       SaveManager.updateHighScore(this.score);

       // Level transition animation
       const nextLevel = getLevelConfig(this.currentLevel + 1);
       const transText = this.add.text(
         this.cameras.main.scrollX + this.cameras.main.width / 2,
         this.cameras.main.height / 2,
         `ENTERING\n${nextLevel.name}`,
         { fontFamily: 'Impact', fontSize: '48px', color: '#00ffff', align: 'center', stroke: '#000', strokeThickness: 6 }
       ).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

       this.tweens.add({ targets: transText, alpha: 1, duration: 400 });
       this.cameras.main.fadeOut(1200, 0, 0, 0);
       this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
         this.scene.restart({ level: this.currentLevel + 1 });
       });
    }

    if (this.levelCfg.isBossLevel && this.boss && !this.boss.active) {
       this.boss = null;
       this.addScore(SCORE_CONFIG.bossKill);
       SaveManager.addSP(this.levelCfg.completionSP);
       SaveManager.updateHighScore(this.score);
       this.cameras.main.shake(1000, 0.05);
       
       this.time.delayedCall(2000, () => {
          this.scene.stop('HUDScene');
          this.scene.start('GameOverScene', { score: this.score, win: true });
       });
    }
  }

  public incrementCombo() {
      this.comboCount++;
      
      let style: string = COMBO_CONFIG.defaultStyle;
      for (const threshold of COMBO_CONFIG.thresholds) {
        if (this.comboCount > threshold.count) style = threshold.style;
      }

      if (style !== this.currentStyle) {
          this.currentStyle = style;
          this.events.emit('update_style', style);
      }

      const multiplier = 1 + (this.comboCount * COMBO_CONFIG.multiplierPerHit);
      
      if (this.comboTimer) this.comboTimer.remove();
      this.comboTimer = this.time.delayedCall(COMBO_CONFIG.timeout, () => { this.resetCombo(); });
      
      return multiplier;
  }

  public resetCombo() {
      this.comboCount = 0;
      this.currentStyle = '';
      this.events.emit('update_style', '');
  }

  public getComboCount() {
      return this.comboCount;
  }

  public addScore(amount: number) {
      this.score += amount;
      this.events.emit('update_score', this.score);
  }

  public showComboPopup(x: number, y: number) {
      const popup = this.add.text(x, y, `${this.comboCount} HITS!`, {
          fontFamily: 'Impact', fontSize: '20px', color: '#e94560'
      }).setOrigin(0.5);
      this.tweens.add({ targets: popup, y: y - 40, alpha: 0, duration: 600, onComplete: () => popup.destroy() });
  }

  public emitHitParticle(x: number, y: number, count: number) {
      this.hitParticles.emitParticleAt(x, y, count);
  }

  /** Freeze the game for a few frames to add weight to hits */
  public hitstop(durationMs: number = 60) {
    this.physics.world.pause();
    // Use real-time setTimeout since scene timers are affected by timeScale
    setTimeout(() => {
      if (this.physics && this.physics.world) {
        this.physics.world.resume();
      }
    }, durationMs);
  }

  public upgradePlayerHealth(maxHealth: number) {
      this.player.maxHealth = maxHealth;
      this.player.health = maxHealth;
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
  }

  private handleParry(defender: Player) {
      SoundManager.playParry();
      this.cameras.main.shake(100, 0.01);
      const parryText = this.add.text(defender.x, defender.y - 40, 'PARRY!', {
          fontFamily: 'Impact', fontSize: '24px', color: '#00ffff'
      }).setOrigin(0.5);
      this.tweens.add({ targets: parryText, y: defender.y - 80, alpha: 0, duration: 600, onComplete: () => parryText.destroy() });
      
      // Bonus points for parry
      this.addScore(SCORE_CONFIG.parryBonus);
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
  }

  private handlePlayerDeath() {
    this.player.setVelocityX(0);
    this.cameras.main.shake(500, 0.03);
    
    // Save current score up to death
    SaveManager.addSP(SCORE_CONFIG.deathSP);
    SaveManager.updateHighScore(this.score); 
    
    this.time.delayedCall(2000, () => {
        this.scene.stop('HUDScene');
        this.scene.start('GameOverScene', { score: this.score, win: false });
    });
  }

  private cleanup() {
    this.events.off('player_attack', this.onPlayerAttack);
    this.events.off('player_parry', this.onPlayerParry);
    this.events.off('enemy_attack', this.onEnemyAttack);
    this.events.off('boss_attack', this.onBossAttack);
    this.events.off('player_dead', this.onPlayerDead);
    this.events.off('enemy_shoot', this.onEnemyShoot);
    this.events.off('player_cast_wave', this.onPlayerCastWave);
    this.input.keyboard?.off('keydown-ESC', this.pauseGame, this);
    this.input.keyboard?.off('keydown-P', this.pauseGame, this);

    SoundManager.stopBGM();

    if (this.comboTimer) {
      this.comboTimer.remove();
      this.comboTimer = null;
    }

    this.time.removeAllEvents();
  }

  private pauseGame() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }
}
