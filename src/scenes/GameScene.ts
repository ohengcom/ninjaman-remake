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
import { GAME_EVENTS } from '../events.js';
import { SeededRandom } from '../utils/SeededRandom.js';
import { VfxManager } from '../managers/VfxManager.js';
import { LevelBuilder } from '../utils/LevelBuilder.js';


export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private projectiles!: Phaser.GameObjects.Group;
  private boss: Boss | null = null;
  private score: number = 0;
  private playerLight!: Phaser.GameObjects.Light;
  
  private comboCount: number = 0;
  private comboTimer: Phaser.Time.TimerEvent | null = null;
  private currentStyle: string = '';
  

  private lastSafeX: number = 200;
  private lastSafeY: number = 0;
  private currentLevel: number = 1;
  private levelCfg!: LevelConfig;
  private rng!: SeededRandom;
  private mapWidth: number = 0;
  private isTransitioning: boolean = false;

  private combatManager!: CombatManager;
  public vfxManager!: VfxManager;
  private attackTrail!: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly onPlayerAttack = (attacker: Player, type: string) => {
    this.combatManager.resolvePlayerAttack(attacker, type, this.enemies, this.boss);
    if (this.attackTrail) {
      this.attackTrail.start();
      this.time.delayedCall(150, () => {
        this.attackTrail.stop();
      });
    }
  };
  private readonly onPlayerParry = (defender: Player) => this.handleParry(defender);
  private readonly onEnemyAttack = (attacker: Enemy, dmg: number, reach: number) => this.combatManager.resolveEnemyAttack(attacker, dmg, reach, this.player);
  private readonly onBossAttack = (attacker: Boss) => this.combatManager.resolveBossAttack(attacker, this.player);
  private readonly onPlayerDead = () => this.handlePlayerDeath();
  private readonly onEnemyShoot = (attacker: Enemy, damage: number) => {
    const p = this.projectiles.get(attacker.x, attacker.y) as Projectile;
    if (p) {
      const dir = attacker.flipX ? -1 : 1;
      this.vfxManager.emitHitParticle(attacker.x + (attacker.flipX ? -30 : 30), attacker.y, 8, 'hit');
      p.fire(attacker.x + (20 * dir), attacker.y, dir, PROJECTILE_CONFIG.enemyBulletSpeed, damage, 'projectile');
      SoundManager.playShoot(this.getPan(attacker.x));
    }
  };
  private readonly onPlayerCastWave = (player: Player) => {
    SoundManager.playHadouken(this.getPan(player.x));
    const wave = this.projectiles.get(player.x, player.y) as Projectile;
    if (wave) {
      const dir = player.flipX ? -1 : 1;
      wave.fire(player.x + (30 * dir), player.y, dir, PLAYER_ATTACKS.wave.speed, PLAYER_ATTACKS.wave.damage, 'player_wave');
    }
  };
  private readonly onMatterCollisionStart = (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
    event.pairs.forEach(pair => {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;
      const objA = bodyA.gameObject;
      const objB = bodyB.gameObject;
      if (!objA || !objB) return;

      // Projectile vs Player
      if ((objA instanceof Projectile && objB instanceof Player) || (objB instanceof Projectile && objA instanceof Player)) {
        const proj = (objA instanceof Projectile) ? objA : (objB as Projectile);
        const player = (objA instanceof Player) ? objA : (objB as Player);

        if (proj.active && player.health > 0 && proj.texture.key === 'projectile') {
          const dir = proj.body!.velocity.x > 0 ? 1 : -1;

          if (player.isBlocking && Math.sign(dir) !== (player.flipX ? -1 : 1)) {
            player.health -= Math.floor(proj.damage * 0.2);
            this.events.emit(GAME_EVENTS.PLAYER_PARRY, player);
            player.setVelocityX(dir * 1.5);
          } else {
            player.takeDamage(proj.damage, dir);
            SoundManager.playDamage(this.getPan(proj.x));
            this.vfxManager.emitHitParticle(player.x, player.y, 5, 'hit');
            this.cameras.main.shake(200, 0.02);
          }
          this.events.emit(GAME_EVENTS.UPDATE_HEALTH, player.health, player.maxHealth);
          proj.hit();
        }
      }

      // Projectile vs Enemy
      if ((objA instanceof Projectile && objB instanceof Enemy) || (objB instanceof Projectile && objA instanceof Enemy)) {
        const proj = (objA instanceof Projectile) ? objA : (objB as Projectile);
        const enemy = (objA instanceof Enemy) ? objA : (objB as Enemy);

        if (proj.active && enemy.active && enemy.health > 0 && proj.texture.key === 'player_wave') {
          const dir = proj.body!.velocity.x > 0 ? 1 : -1;
          enemy.takeDamage(proj.damage, dir);
          SoundManager.playHit(this.getPan(enemy.x));
          this.vfxManager.emitHitParticle(enemy.x, enemy.y, 10, 'spark');
          proj.hit(); // Consume wave
          if (enemy.health <= 0) {
            this.addScore(SCORE_CONFIG.waveKill);
            this.incrementCombo();
          }
        }
      }

      // Projectile vs Boss
      if (this.boss && ((objA instanceof Projectile && objB instanceof Boss) || (objB instanceof Projectile && objA instanceof Boss))) {
        const proj = (objA instanceof Projectile) ? objA : (objB as Projectile);
        const boss = (objA instanceof Boss) ? objA : (objB as Boss);

        if (proj && boss && proj.active && boss.active && boss.health > 0 && proj.texture.key === 'player_wave') {
          const dir = proj.body!.velocity.x > 0 ? 1 : -1;
          boss.takeDamage(proj.damage * BOSS_STATS.damageMultiplier, dir);
          SoundManager.playHit(this.getPan(boss.x));
          this.vfxManager.emitHitParticle(boss.x, boss.y, 15, 'spark');
          proj.hit();
          this.incrementCombo();
        }
      }
    });
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

    // Restore HUD header (hidden by MainMenuScene)
    const hudHeader = document.querySelector('.hud-header') as HTMLElement;
    if (hudHeader) hudHeader.style.display = '';

    SoundManager.startBGM(this.currentLevel);
    this.combatManager = new CombatManager(this);
    this.vfxManager = new VfxManager(this);
    this.comboCount = 0;
    this.currentStyle = '';
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



    LevelBuilder.buildBackground(this, farBg, midBg, this.mapWidth);

    // Refresh HUD properly by stopping and re-launching it so events connect to the new GameScene instance
    this.scene.stop('HUDScene');
    this.scene.launch('HUDScene');

    LevelBuilder.buildPlatforms(this, this.levelCfg, this.mapWidth, this.rng);
    LevelBuilder.buildLeftWall(this);

    const saveData = SaveManager.load();
    this.player = new Player(this, this.lastSafeX, this.lastSafeY);
    this.player.maxHealth = saveData.maxHealth;
    this.player.health = saveData.maxHealth;
    this.attackTrail = this.vfxManager.createAttackTrail(this.player);
    
    // Matter physics automatically collides bodies unless collision filtering is used

    this.enemies = this.add.group({ classType: Enemy, maxSize: 30, runChildUpdate: true });
    this.projectiles = this.add.group({ classType: Projectile, maxSize: 20, runChildUpdate: true });
    
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
      
      const portal = this.add.text(this.mapWidth - 300, h - 150, '⟫ NEXT SECTOR ⟫', {
        fontFamily: 'Orbitron, Impact, sans-serif', fontSize: '28px', color: '#00d4ff',
        stroke: '#000', strokeThickness: 3,
        shadow: { blur: 12, color: 'rgba(0, 212, 255, 0.6)', fill: true, offsetX: 0, offsetY: 0 }
      }).setOrigin(0.5);
      this.tweens.add({ targets: portal, alpha: 0.2, yoyo: true, repeat: -1, duration: 800 });

    } else {
      // Boss level: spawn boss on the ground, close to player
      const bossX = Math.min(this.mapWidth - 400, 800);
      const bossY = h - 168; // ground level (h-48) minus half boss height (120)
      this.boss = new Boss(this, bossX, bossY);
      this.boss.setTarget(this.player);
      
      const bossWarning = this.add.text(bossX, 100, '⚠ CORE GUARDIAN ⚠', {
         fontFamily: 'Orbitron, Impact, sans-serif', fontSize: '40px', color: '#ff4444',
         stroke: '#000', strokeThickness: 4,
         shadow: { blur: 16, color: 'rgba(255, 68, 68, 0.7)', fill: true, offsetX: 0, offsetY: 0 }
      }).setOrigin(0.5);
      this.tweens.add({ targets: bossWarning, alpha: 0.3, yoyo: true, repeat: 5, duration: 300 });
    }

    // Enemies automatically collide with matter static bodies
    this.vfxManager.createHitParticles();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapWidth, h);
    this.matter.world.setBounds(0, 0, this.mapWidth, h * 2);

    this.vfxManager.initAtmosphere();
    this.vfxManager.createAmbientMotes(this.mapWidth, h);

    // Enable dynamic 2D lighting pipeline
    this.lights.enable();
    this.lights.setAmbientColor(0x333333);

    // Add ambient level lights
    if (this.currentLevel === 1) {
      this.lights.addLight(400, 200, 500, 0x00d4ff, 1.2);
      this.lights.addLight(1200, 200, 500, 0x00ff88, 1.0);
    } else if (this.currentLevel === 2) {
      this.lights.addLight(600, 100, 600, 0xffaa00, 1.5);
      this.lights.addLight(1800, 100, 600, 0xff4488, 1.2);
    } else {
      this.lights.addLight(400, 250, 400, 0xff3366, 1.6);
      this.lights.addLight(800, 250, 400, 0x00d4ff, 1.6);
    }

    // High tech cyan light following the player
    this.playerLight = this.lights.addLight(this.player.x, this.player.y, 250, 0x00ffff, 1.5);

    this.events.on(GAME_EVENTS.PLAYER_ATTACK, this.onPlayerAttack);
    this.events.on(GAME_EVENTS.PLAYER_PARRY, this.onPlayerParry);
    this.events.on(GAME_EVENTS.ENEMY_ATTACK, this.onEnemyAttack);
    this.events.on(GAME_EVENTS.BOSS_ATTACK, this.onBossAttack);
    this.events.on(GAME_EVENTS.PLAYER_DEAD, this.onPlayerDead);
    this.events.on(GAME_EVENTS.ENEMY_SHOOT, this.onEnemyShoot);
    this.events.on(GAME_EVENTS.PLAYER_CAST_WAVE, this.onPlayerCastWave);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    // Pause support
    this.input.keyboard!.on('keydown-ESC', this.pauseGame, this);

    this.matter.world.on('collisionstart', this.onMatterCollisionStart);

    this.time.delayedCall(10, () => {
      this.events.emit(GAME_EVENTS.UPDATE_HEALTH, this.player.health, this.player.maxHealth);
      this.events.emit(GAME_EVENTS.UPDATE_SCORE, this.score);
      this.events.emit(GAME_EVENTS.UPDATE_LEVEL, this.currentLevel);
    });
  }

  update(_time: number, _delta: number): void {
    if (this.playerLight) {
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;
    }

    if (this.player.isGrounded() && this.player.y < this.cameras.main.height - 50) {
        this.lastSafeX = this.player.x;
        this.lastSafeY = this.player.y;
    }

    if (this.player.y > this.cameras.main.height + 100 && this.player.health > 0) {
      this.resetCombo();
      this.player.takeDamage(PLAYER_DEFENSE.fallDamage, 0);
      this.events.emit(GAME_EVENTS.UPDATE_HEALTH, this.player.health, this.player.maxHealth);
      if (this.player.health > 0) {
          this.player.setPosition(this.lastSafeX, this.lastSafeY - 100);
          this.player.setVelocity(0, 0);
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
      }
    }

    if (!this.levelCfg.isBossLevel && this.player.x > this.mapWidth - 400 && !this.isTransitioning) {
       this.isTransitioning = true;
       console.log('Transitioning to next level!');
       
       // Disable physics and input to prevent camera shakes from cancelling the fadeOut
       this.matter.world.pause();
       if (this.input.keyboard) this.input.keyboard.enabled = false;
       this.player.setVelocity(0, 0);
       SaveManager.updateLevel(this.currentLevel + 1);
       SaveManager.addSP(this.levelCfg.completionSP);
       SaveManager.updateHighScore(this.score);

       // Level transition animation
       const nextLevel = getLevelConfig(this.currentLevel + 1);
       const transText = this.add.text(
         this.cameras.main.scrollX + this.cameras.main.width / 2,
         this.cameras.main.height / 2,
          `ENTERING\n${nextLevel.name}`,
          { fontFamily: 'Orbitron, Impact, sans-serif', fontSize: '42px', color: '#00d4ff', align: 'center', stroke: '#000', strokeThickness: 4, shadow: { blur: 16, color: 'rgba(0, 212, 255, 0.6)', fill: true, offsetX: 0, offsetY: 0 } }
       ).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

       this.tweens.add({ targets: transText, alpha: 1, duration: 400 });

       if (this.sys.game.config.renderType === Phaser.CANVAS) {
         this.cameras.main.fadeOut(1200, 0, 0, 0);
       } else {
         try {
           const cam = this.cameras.main;
           const wipe = cam.filters.external.addWipe(0.1, 0, 0);
           wipe.setLeftToRight();
           this.tweens.add({
             targets: wipe,
             progress: 1,
             duration: 1200,
             ease: 'Cubic.easeInOut'
           });
         } catch (e) {
           console.warn("Wipe filter failed, using fadeOut fallback:", e);
           this.cameras.main.fadeOut(1200, 0, 0, 0);
         }
       }
       
       // Use a fallback timer in case fadeOut gets cancelled by a rogue camera effect
       this.time.delayedCall(1300, () => {
         if (this.input.keyboard) this.input.keyboard.enabled = true;
         this.scene.restart({ level: this.currentLevel + 1 });
       });
    }

    if (this.levelCfg.isBossLevel && this.boss && !this.boss.active) {
       this.boss = null;
       this.matter.world.pause(); // Stop physics so boss doesn't hurt player after death
       if (this.input.keyboard) this.input.keyboard.enabled = false;
       
       this.addScore(SCORE_CONFIG.bossKill);
       SaveManager.addSP(this.levelCfg.completionSP);
       SaveManager.updateHighScore(this.score);
       this.cameras.main.shake(1000, 0.05);
       
       this.time.delayedCall(2000, () => {
          if (this.input.keyboard) this.input.keyboard.enabled = true;
          this.scene.stop('HUDScene');
          this.scene.start('GameOverScene', { score: this.score, win: true, level: this.currentLevel });
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
          this.events.emit(GAME_EVENTS.UPDATE_STYLE, style);
      }

      const multiplier = 1 + (this.comboCount * COMBO_CONFIG.multiplierPerHit);
      
      if (this.comboTimer) this.comboTimer.remove();
      this.comboTimer = this.time.delayedCall(COMBO_CONFIG.timeout, () => { this.resetCombo(); });
      
      return multiplier;
  }

  public resetCombo() {
      this.comboCount = 0;
      this.currentStyle = '';
      this.events.emit(GAME_EVENTS.UPDATE_STYLE, '');
  }

  public getComboCount() {
      return this.comboCount;
  }

  public addScore(amount: number) {
      this.score += amount;
      this.events.emit(GAME_EVENTS.UPDATE_SCORE, this.score);
  }

  public showComboPopup(x: number, y: number) {
      const popup = this.add.text(x, y, `${this.comboCount} HITS!`, {
          fontFamily: 'Inter, sans-serif', fontSize: '20px', color: '#ff6b6b', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.tweens.add({ targets: popup, y: y - 40, alpha: 0, duration: 600, onComplete: () => popup.destroy() });
  }

  public emitHitParticle(x: number, y: number, count: number, type: 'hit' | 'spark' | 'dust' = 'hit') {
      this.vfxManager.emitHitParticle(x, y, count, type as any);
  }

  /** Freeze the physics world for a few frames to add weight to hits */
  public hitstop(durationMs: number = 60) {
    this.matter.world.pause();
    this.vfxManager.hitstopFilter(durationMs);
    this.time.delayedCall(durationMs, () => {
      if (this.matter && this.matter.world) {
        this.matter.world.resume();
      }
    });
  }

  public upgradePlayerHealth(maxHealth: number) {
      this.player.maxHealth = maxHealth;
      this.player.health = maxHealth;
      this.events.emit(GAME_EVENTS.UPDATE_HEALTH, this.player.health, this.player.maxHealth);
  }

  private handleParry(defender: Player) {
      SoundManager.playParry(this.getPan(defender.x));
      this.cameras.main.shake(100, 0.01);
      this.vfxManager.showParryText(defender.x, defender.y);
      this.vfxManager.parryImpact();
      
      // Bonus points for parry
      this.addScore(SCORE_CONFIG.parryBonus);
      this.events.emit(GAME_EVENTS.UPDATE_HEALTH, this.player.health, this.player.maxHealth);
  }

  private handlePlayerDeath() {
    this.player.setVelocityX(0);
    this.cameras.main.shake(500, 0.03);
    this.vfxManager.deathFilter();
    
    // Save current score up to death
    SaveManager.addSP(SCORE_CONFIG.deathSP);
    SaveManager.updateHighScore(this.score); 
    
    this.time.delayedCall(2000, () => {
        this.scene.stop('HUDScene');
        this.scene.start('GameOverScene', { score: this.score, win: false, level: this.currentLevel });
    });
  }

  private cleanup() {
    this.events.off(GAME_EVENTS.PLAYER_ATTACK, this.onPlayerAttack);
    this.events.off(GAME_EVENTS.PLAYER_PARRY, this.onPlayerParry);
    this.events.off(GAME_EVENTS.ENEMY_ATTACK, this.onEnemyAttack);
    this.events.off(GAME_EVENTS.BOSS_ATTACK, this.onBossAttack);
    this.events.off(GAME_EVENTS.PLAYER_DEAD, this.onPlayerDead);
    this.events.off(GAME_EVENTS.ENEMY_SHOOT, this.onEnemyShoot);
    this.events.off(GAME_EVENTS.PLAYER_CAST_WAVE, this.onPlayerCastWave);
    this.matter.world.off('collisionstart', this.onMatterCollisionStart);
    this.input.keyboard?.off('keydown-ESC', this.pauseGame, this);

    SoundManager.stopBGM();

    if (this.comboTimer) {
      this.comboTimer.remove();
      this.comboTimer = null;
    }

    this.input.keyboard?.clearCaptures();
    this.time.removeAllEvents();
  }

  public getPan(sourceX: number): number {
    if (!this.player) return 0;
    const dx = sourceX - this.player.x;
    const halfWidth = this.cameras.main.width / 2;
    return Phaser.Math.Clamp(dx / halfWidth, -1, 1);
  }

  private pauseGame() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }
}
