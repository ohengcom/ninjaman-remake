import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy, EnemyType } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Projectile } from '../entities/Projectile.js';
import { CombatManager } from '../managers/CombatManager.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

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
  private mapWidth: number = 0;
  private isTransitioning: boolean = false;

  private combatManager!: CombatManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level?: number }) {
    const saveData = SaveManager.load();
    this.currentLevel = data.level || saveData.unlockedLevel;
    this.score = saveData.score || 0;
    this.isTransitioning = false;
  }

  create(): void {
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
    let farBg = 'bg_city_far';
    let midBg = 'bg_city_mid';
    this.mapWidth = 60 * 64;

    if (this.currentLevel === 1) {
      farBg = 'bg_city_far'; midBg = 'bg_city_mid'; this.mapWidth = 80 * 64;
    } else if (this.currentLevel === 2) {
      farBg = 'bg_forest_far'; midBg = 'bg_forest_mid'; this.mapWidth = 80 * 64;
    } else if (this.currentLevel === 3) {
      farBg = 'bg_core_far'; midBg = 'bg_core_mid'; this.mapWidth = 40 * 64;
    }

    this.add.image(w/2, h/2, farBg).setScrollFactor(0);
    this.add.image(w/2, h/2, midBg).setScrollFactor(0.2);

    // Refresh HUD properly by stopping and re-launching it so events connect to the new GameScene instance
    this.scene.stop('HUDScene');
    this.scene.launch('HUDScene');

    // Platforms
    const platforms = this.physics.add.staticGroup();
    const tiles = Math.floor(this.mapWidth / 64);
    
    for (let i = 0; i < tiles; i++) {
      // Create a continuous, solid floor
      platforms.create(i * 64 + 32, h - 32, 'platform');
      
      if (this.currentLevel !== 3 && i > 15 && i % 6 === 0) {
         platforms.create(i * 64 + 32, h - 160 - Math.random() * 80, 'platform');
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
    
    if (this.currentLevel < 3) {
      const types: EnemyType[] = ['guard', 'axe', 'ninja', 'sniper'];
      for (let x = 1200; x < this.mapWidth - 800; x += 600 + Math.random() * 600) {
        const type = types[Math.floor(Math.random() * types.length)];
        const yOffset = type === 'sniper' ? 350 : 250; // Snipers spawn higher up sometimes
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
      this.boss = new Boss(this, this.mapWidth - 400, h - 150);
      this.boss.setTarget(this.player);
      this.physics.add.collider(this.boss, platforms);
      
      this.add.text(this.mapWidth - 400, 100, 'WARNING: CORE GUARDIAN', {
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

    this.events.on('player_attack', (attacker: Player, type: string) => this.combatManager.resolvePlayerAttack(attacker, type, this.enemies, this.boss));
    this.events.on('player_parry', (defender: Player) => this.handleParry(defender));
    this.events.on('enemy_attack', (attacker: Enemy, dmg: number, reach: number) => this.combatManager.resolveEnemyAttack(attacker, dmg, reach, this.player));
    this.events.on('boss_attack', (attacker: Boss) => this.combatManager.resolveBossAttack(attacker, this.player));
    this.events.on('player_dead', () => this.handlePlayerDeath());
    
    this.events.on('enemy_shoot', (attacker: Enemy, damage: number) => {
        const p = this.projectiles.get(attacker.x, attacker.y) as Projectile;
        if (p) {
            const dir = attacker.flipX ? -1 : 1;
            p.fire(attacker.x + (20 * dir), attacker.y, dir, 600, damage, 'projectile');
            SoundManager.playSwing(); // Reuse swing sound for shoot
        }
    });

    // Player Hadouken
    this.events.on('player_cast_wave', (player: Player) => {
        SoundManager.playHadouken();
        const wave = this.projectiles.get(player.x, player.y) as Projectile;
        if (wave) {
            const dir = player.flipX ? -1 : 1;
            // High speed, medium damage projectile
            wave.fire(player.x + (30 * dir), player.y, dir, 800, 20, 'player_wave');
        }
    });

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
               this.addScore(150);
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
                boss.takeDamage(proj.damage * 0.5, dir);
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

  update(time: number, delta: number): void {
    if (this.player.body!.touching.down && this.player.y < this.cameras.main.height - 50) {
        this.lastSafeX = this.player.x;
        this.lastSafeY = this.player.y;
    }

    if (this.player.y > this.cameras.main.height + 100 && this.player.health > 0) {
      this.resetCombo();
      this.player.takeDamage(25, 0);
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
      if (this.player.health > 0) {
          this.player.setPosition(this.lastSafeX, this.lastSafeY - 100);
          this.player.setVelocity(0, 0);
          this.player.setTint(0xff0000);
          this.time.delayedCall(200, () => this.player.clearTint());
      }
    }

    if (this.currentLevel < 3 && this.player.x > this.mapWidth - 100 && !this.isTransitioning) {
       this.isTransitioning = true;
       this.player.setVelocityX(0);
       SaveManager.updateLevel(this.currentLevel + 1);
       SaveManager.updateScoreAndSp(this.score - SaveManager.load().score, 10); // Reward 10 SP per level
       this.scene.restart({ level: this.currentLevel + 1 });
    }

    if (this.currentLevel === 3 && this.boss && !this.boss.active) {
       this.boss = null;
       this.addScore(5000);
       SaveManager.updateScoreAndSp(this.score - SaveManager.load().score, 50); // Boss reward
       this.cameras.main.shake(1000, 0.05);
       
       this.time.delayedCall(2000, () => {
          this.scene.stop('HUDScene');
          this.scene.start('GameOverScene', { score: this.score, win: true });
       });
    }
  }

  public incrementCombo() {
      this.comboCount++;
      
      let style = 'C';
      if (this.comboCount > 15) style = 'SSS';
      else if (this.comboCount > 10) style = 'S';
      else if (this.comboCount > 7) style = 'A';
      else if (this.comboCount > 4) style = 'B';

      if (style !== this.currentStyle) {
          this.currentStyle = style;
          this.events.emit('update_style', style);
      }

      const multiplier = 1 + (this.comboCount * 0.1);
      
      if (this.comboTimer) this.comboTimer.remove();
      this.comboTimer = this.time.delayedCall(3000, () => { this.resetCombo(); });
      
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

  private handleParry(defender: Player) {
      SoundManager.playParry();
      this.cameras.main.shake(100, 0.01);
      const parryText = this.add.text(defender.x, defender.y - 40, 'PARRY!', {
          fontFamily: 'Impact', fontSize: '24px', color: '#00ffff'
      }).setOrigin(0.5);
      this.tweens.add({ targets: parryText, y: defender.y - 80, alpha: 0, duration: 600, onComplete: () => parryText.destroy() });
      
      // Bonus points for parry
      this.addScore(50);
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
  }

  private handlePlayerDeath() {
    this.player.setVelocityX(0);
    this.cameras.main.shake(500, 0.03);
    
    // Save current score up to death
    SaveManager.updateScoreAndSp(this.score - SaveManager.load().score, 5); 
    
    this.time.delayedCall(2000, () => {
        this.scene.stop('HUDScene');
        this.scene.start('GameOverScene', { score: this.score, win: false });
    });
  }
}
