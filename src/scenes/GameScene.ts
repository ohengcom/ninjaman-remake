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
  public physicsProps!: Phaser.GameObjects.Group;
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
  private isHitstopping: boolean = false;

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
      this.handleOneWayCollisions(pair);
      if (!pair.isActive) return;

      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;
      const objA = bodyA.gameObject;
      const objB = bodyB.gameObject;

      // Projectile vs Physics Prop
      if (objA && objB && ((objA instanceof Projectile && objB.getData && objB.getData('isDestructible')) || (objB instanceof Projectile && objA.getData && objA.getData('isDestructible')))) {
        const proj = (objA instanceof Projectile) ? objA : (objB as Projectile);
        const prop = (objA instanceof Projectile) ? objB : objA;
        if (proj.active && proj.texture.key === 'player_wave') {
          proj.hit();
          this.damagePhysicsProp(prop, proj.damage, proj.body!.velocity.x > 0 ? 1 : -1);
        }
      }

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
  private readonly onMatterCollisionActive = (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
    event.pairs.forEach(pair => {
      this.handleOneWayCollisions(pair);
      if (!pair.isActive) return;

      this.updatePlayerGroundContact(pair.bodyA, pair.bodyB);
      this.updatePlayerGroundContact(pair.bodyB, pair.bodyA);
    });
  };

  private updatePlayerGroundContact(playerBody: MatterJS.BodyType, otherBody: MatterJS.BodyType) {
    const obj = playerBody.gameObject;
    if (!(obj instanceof Player)) return;
    if (!otherBody.isStatic) return;

    const otherY = otherBody.position.y;
    const playerBottom = playerBody.bounds.max.y;
    const otherTop = otherBody.bounds.min.y;
    const isStandingOnTop = playerBody.position.y < otherY && playerBottom <= otherTop + 8;
    if (isStandingOnTop) {
      const otherObj = otherBody.gameObject;
      const isOneWay = otherObj && typeof (otherObj as any).getData === 'function' && (otherObj as any).getData('isOneWay');
      obj.notifyGroundContact(!!isOneWay);
    }
  }

  private handleOneWayCollisions(pair: MatterJS.ICollisionPair) {
    const bodyA = pair.bodyA as any;
    const bodyB = pair.bodyB as any;
    const objA = bodyA.gameObject;
    const objB = bodyB.gameObject;

    // Check if one body is Player and the other is a one-way platform
    const isPlayerA = objA instanceof Player;
    const isPlayerB = objB instanceof Player;
    if (!isPlayerA && !isPlayerB) return;

    const player = isPlayerA ? (objA as Player) : (objB as Player);
    const playerBody = isPlayerA ? bodyA : bodyB;
    const platBody = isPlayerA ? bodyB : bodyA;
    const platObj = platBody.gameObject;

    if (!platObj || typeof (platObj as any).getData !== 'function' || !(platObj as any).getData('isOneWay')) return;

    // Condition 1: Player is dropping through
    if (player.isDroppingThrough) {
      pair.isActive = false;
      return;
    }

    // Condition 2: Player is moving upwards
    if (playerBody.velocity.y < -0.1) {
      pair.isActive = false;
      return;
    }

    // Condition 3: Player's feet are below the platform top surface (give it a small tolerance)
    const playerBottom = playerBody.bounds.max.y;
    const platTop = platBody.bounds.min.y;
    if (playerBottom > platTop + 4) {
      pair.isActive = false;
    }
  }

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
    // Ensure camera is fully visible before fade-in (prevents black screen on scene.restart)
    this.cameras.main.setAlpha(1);
    // Clear any lingering fade/flash effects from the previous scene
    try { this.cameras.main.resetFX(); } catch(e) {}
    // Now fade in from black — this explicitly starts at black overlay and fades to clear
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
    const groundTop = h - 48;
    const playerHalfHeight = 48; // PLAYER_RENDER.bodyHeight / 2
    this.lastSafeX = 200;
    this.lastSafeY = groundTop - playerHalfHeight;
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

    this.physicsProps = this.add.group();
    LevelBuilder.buildPlatforms(this, this.levelCfg, this.mapWidth, this.rng);
    LevelBuilder.buildLeftWall(this);

    const saveData = SaveManager.load();
    this.player = new Player(this, this.lastSafeX, this.lastSafeY);
    this.player.setPosition(this.lastSafeX, groundTop - this.player.getBodyHalfHeight());
    this.player.maxHealth = saveData.maxHealth;
    this.player.health = saveData.maxHealth;
    this.attackTrail = this.vfxManager.createAttackTrail(this.player);
    
    // Matter physics automatically collides bodies unless collision filtering is used

    this.enemies = this.add.group({ classType: Enemy, maxSize: 30, runChildUpdate: true });
    this.projectiles = this.add.group({ classType: Projectile, maxSize: 20, runChildUpdate: true });
    
    // Spawn dynamic wooden crates & barrels scattered on the ground!
    if (!this.levelCfg.isBossLevel) {
       for (let x = 600; x < this.mapWidth - 800; x += 300 + this.rng.next() * 500) {
          const isCrate = this.rng.next() < 0.6;
          const propY = groundTop - (isCrate ? 25 : 30);
          const frame = isCrate ? 'crate' : 'barrel';
          const prop = this.add.image(x, propY, 'deco_atlas', frame);
          
          const body = this.matter.add.gameObject(prop, {
            friction: 0.1,
            frictionAir: 0.02,
            restitution: 0.05,
            density: 0.01
          });
          (body as any).setFixedRotation(true);
          prop.setData('isDestructible', true);
          prop.setData('health', isCrate ? 15 : 30);
          prop.setData('type', frame);
          this.physicsProps.add(prop);
       }
    }
    
    if (!this.levelCfg.isBossLevel) {
      const types: EnemyType[] = [...this.levelCfg.enemyTypes];
      const [minSpacing, maxSpacing] = this.levelCfg.enemySpacing;
      for (let x = this.levelCfg.enemyStartX; x < this.mapWidth - 800; x += minSpacing + this.rng.next() * (maxSpacing - minSpacing)) {
        const type = this.rng.pick(types);
        const enemy = this.enemies.get(x, groundTop - 90, type) as Enemy;
        if (enemy) {
            enemy.spawnOnGround(x, groundTop, type);
            enemy.setTarget(this.player);
        }
      }
      
      const transitionX = this.mapWidth - 650;
      const portal = this.add.text(transitionX - 80, h - 170, '⟫ NEXT SECTOR ⟫', {
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
    this.matter.world.on('collisionactive', this.onMatterCollisionActive);

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

    if (!this.levelCfg.isBossLevel && this.player.x > this.mapWidth - 650 && !this.isTransitioning) {
       this.isTransitioning = true;
       console.log('Transitioning to next level!');
       
       // Freeze input only, do NOT pause matter.world (avoids delayedCall stall)
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

       // Fade to black then restart — use timer as primary (not fade event which can be cancelled)
       this.cameras.main.fadeOut(1000, 0, 0, 0);
       
       this.time.delayedCall(1100, () => {
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

  /** Freeze the physics world for a few frames to add weight to hits.
   * NOTE: We deliberately do NOT pause/resume Matter.world here.
   * matter.world.pause() interferes with state-machine timers and level transitions.
   * The visual "hitstop" effect is achieved via the VFX only (camera shake).
   */
  public hitstop(_durationMs: number = 60) {
    if (this.isHitstopping) return;
    this.isHitstopping = true;
    this.vfxManager.hitstopFilter(_durationMs);
    this.time.delayedCall(_durationMs, () => {
      this.isHitstopping = false;
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
    this.matter.world.off('collisionactive', this.onMatterCollisionActive);
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

  public damagePhysicsProp(prop: any, damage: number, dirX: number) {
    if (!prop || !prop.active || !prop.getData('isDestructible')) return;
    
    let hp = prop.getData('health') - damage;
    prop.setData('health', hp);
    
    // Trigger visual hit feedback: flash the prop white
    this.tweens.add({
      targets: prop,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 1
    });

    // Apply physics impulse (push) by directly modifying Matter body forces
    const body = prop.body as MatterJS.BodyType;
    if (body) {
      body.force.x += dirX * 0.04;
      body.force.y += -0.015;
    }

    if (hp <= 0) {
      this.explodePhysicsProp(prop, dirX);
    } else {
      SoundManager.playHit(this.getPan(prop.x));
    }
  }

  public explodePhysicsProp(prop: any, _dirX: number) {
    if (!prop || !prop.active) return;
    
    const px = prop.x;
    const py = prop.y;
    const type = prop.getData('type') || 'crate';
    
    // Deactivate and remove from tracking group
    prop.setActive(false);
    prop.setVisible(false);
    this.physicsProps.remove(prop);
    
    // Remove Matter body
    this.matter.world.remove(prop.body);
    
    // Play explosion/damage sound
    SoundManager.playDamage(this.getPan(px));
    
    // Camera shake
    this.cameras.main.shake(200, 0.02);
    
    // VFX Particle blast
    this.vfxManager.emitHitParticle(px, py, 15, 'spark');
    this.vfxManager.emitHitParticle(px, py, 15, 'dust');
    
    // Spawn 4-6 small dynamic blocks with physics impulse to fly as debris in all directions
    const numDebris = 4 + Math.floor(Math.random() * 3);
    const debrisColor = type === 'crate' ? 0x8b5a2b : 0x4a4a4a; // Brown for wood crate, gray/dark for metal barrel
    
    for (let i = 0; i < numDebris; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 2; // Bias upwards
      
      const debrisSize = 6 + Math.floor(Math.random() * 6);
      const debrisObj = this.add.rectangle(px + (Math.random() - 0.5) * 15, py + (Math.random() - 0.5) * 15, debrisSize, debrisSize, debrisColor, 1);
      
      // Make it a dynamic matter body
      const debBody = this.matter.add.gameObject(debrisObj, {
        friction: 0.1,
        frictionAir: 0.01,
        restitution: 0.3,
        density: 0.005
      });
      
      (debBody as any).setVelocity(dx, dy);
      (debBody as any).setAngularVelocity((Math.random() - 0.5) * 0.3);
      
      this.tweens.add({
        targets: debrisObj,
        alpha: 0,
        delay: 800 + Math.random() * 400,
        duration: 300,
        onComplete: () => {
          this.matter.world.remove(debBody);
          debrisObj.destroy();
        }
      });
    }

    // Splash Damage to nearby enemies
    const splashRadius = 120;
    const splashDamage = type === 'barrel' ? 30 : 15;
    
    this.enemies.getChildren().forEach((child: any) => {
      if (child && child.active && child.health > 0) {
        const dist = Phaser.Math.Distance.Between(px, py, child.x, child.y);
        if (dist <= splashRadius) {
          const enemyDir = child.x > px ? 1 : -1;
          child.takeDamage(splashDamage, enemyDir);
          this.vfxManager.emitHitParticle(child.x, child.y, 8, 'hit');
          this.vfxManager.hitFlashFilter(child);
        }
      }
    });

    // Destroy original game object
    prop.destroy();
  }

  private pauseGame() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }
}
