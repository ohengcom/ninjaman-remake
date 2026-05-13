import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy, EnemyType } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
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

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(data: { level?: number; score?: number }) {
    this.currentLevel = data.level || 1;
    this.score = data.score || 0;
  }

  create(): void {
    this.comboCount = 0;
    this.currentStyle = '';
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.lastSafeY = h - 250;
    this.boss = null;

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

    if (this.currentLevel === 1) {
       this.scene.launch('HUDScene');
    }

    // Platforms
    const platforms = this.physics.add.staticGroup();
    const tiles = Math.floor(this.mapWidth / 64);
    
    for (let i = 0; i < tiles; i++) {
      if (this.currentLevel !== 3) {
         if (i > 15 && i < 17) continue;
         if (i > 30 && i < 32) continue;
         if (i > 50 && i < 53) continue;
      }
      platforms.create(i * 64 + 32, h - 32, 'platform');
      
      if (this.currentLevel !== 3 && i > 15 && i % 6 === 0) {
         platforms.create(i * 64 + 32, h - 160 - Math.random() * 80, 'platform');
      }
    }

    const leftWall = this.add.rectangle(-32, h/2, 64, h * 2).setOrigin(0.5);
    this.physics.add.existing(leftWall, true);

    this.player = new Player(this, this.lastSafeX, this.lastSafeY);
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.player, leftWall);

    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    
    if (this.currentLevel < 3) {
      const types: EnemyType[] = ['guard', 'axe', 'ninja'];
      for (let x = 1200; x < this.mapWidth - 800; x += 600 + Math.random() * 600) {
        const type = types[Math.floor(Math.random() * types.length)];
        const enemy = new Enemy(this, x, h - 250, type);
        enemy.setTarget(this.player);
        this.enemies.add(enemy);
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

    this.events.on('player_attack', (attacker: Player, type: string) => this.resolvePlayerAttack(attacker, type));
    this.events.on('player_parry', (defender: Player) => this.handleParry(defender));
    this.events.on('enemy_attack', (attacker: Enemy, dmg: number, reach: number) => this.resolveEnemyAttack(attacker, dmg, reach));
    this.events.on('boss_attack', (attacker: Boss) => this.resolveBossAttack(attacker));
    this.events.on('player_dead', () => this.handlePlayerDeath());

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

    if (this.currentLevel < 3 && this.player.x > this.mapWidth - 100) {
       this.player.setVelocityX(0);
       this.scene.restart({ level: this.currentLevel + 1, score: this.score });
    }

    if (this.currentLevel === 3 && this.boss && !this.boss.active) {
       this.boss = null;
       this.score += 5000;
       this.events.emit('update_score', this.score);
       this.cameras.main.shake(1000, 0.05);
       
       this.time.delayedCall(2000, () => {
          this.scene.stop('HUDScene');
          this.scene.start('GameOverScene', { score: this.score, win: true });
       });
    }
  }

  private incrementCombo() {
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

  private resetCombo() {
      this.comboCount = 0;
      this.currentStyle = '';
      this.events.emit('update_style', '');
  }

  private handleParry(defender: Player) {
      this.cameras.main.shake(100, 0.01);
      const parryText = this.add.text(defender.x, defender.y - 40, 'PARRY!', {
          fontFamily: 'Impact', fontSize: '24px', color: '#00ffff'
      }).setOrigin(0.5);
      this.tweens.add({ targets: parryText, y: defender.y - 80, alpha: 0, duration: 600, onComplete: () => parryText.destroy() });
      
      // Bonus points for parry
      this.score += 50;
      this.events.emit('update_score', this.score);
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
  }

  private resolvePlayerAttack(attacker: Player, type: string) {
    let reach = 80;
    let baseDamage = 15;
    
    if (type === 'uppercut') { reach = 60; baseDamage = 20; }
    if (type === 'dive') { reach = 70; baseDamage = 25; }
    if (type === 'combo') { baseDamage = 10 + (attacker.comboStep * 5); } // scales up to 25

    const dir = attacker.flipX ? -1 : 1;
    const attackRect = new Phaser.Geom.Rectangle(dir > 0 ? attacker.x : attacker.x - reach, attacker.y - attacker.height / 2, reach, attacker.height);

    let hitAnything = false;

    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      if (enemy.health <= 0) return;
      const enemyRect = new Phaser.Geom.Rectangle(enemy.body!.x, enemy.body!.y, enemy.body!.width, enemy.body!.height);

      if (Phaser.Geom.Rectangle.Overlaps(attackRect, enemyRect)) {
        enemy.takeDamage(baseDamage, dir);
        hitAnything = true;
        this.hitParticles.emitParticleAt(enemy.x, enemy.y, 15);
        if (enemy.health <= 0) this.score += Math.floor(100 * this.incrementCombo());
      }
    });

    if (this.boss && this.boss.active && this.boss.health > 0) {
       const bossRect = new Phaser.Geom.Rectangle(this.boss.body!.x, this.boss.body!.y, this.boss.body!.width, this.boss.body!.height);
       if (Phaser.Geom.Rectangle.Overlaps(attackRect, bossRect)) {
          this.boss.takeDamage(baseDamage * 0.5, dir); 
          hitAnything = true;
          this.hitParticles.emitParticleAt(this.boss.x, this.boss.y, 25);
          this.incrementCombo();
       }
    }

    if (hitAnything) {
        this.cameras.main.shake(150, 0.015);
        this.events.emit('update_score', this.score);
        if (this.comboCount > 1) {
            const popup = this.add.text(attacker.x + (50 * dir), attacker.y - 40, \`\${this.comboCount} HITS!\`, {
                fontFamily: 'Impact', fontSize: '20px', color: '#e94560'
            }).setOrigin(0.5);
            this.tweens.add({ targets: popup, y: attacker.y - 80, alpha: 0, duration: 600, onComplete: () => popup.destroy() });
        }
    }
  }

  private resolveEnemyAttack(attacker: Enemy, damage: number, reach: number) {
    if (attacker.health <= 0) return;
    const dir = attacker.flipX ? -1 : 1;
    const attackRect = new Phaser.Geom.Rectangle(dir > 0 ? attacker.x : attacker.x - reach, attacker.y - attacker.height / 2, reach, attacker.height);
    const playerRect = new Phaser.Geom.Rectangle(this.player.body!.x, this.player.body!.y, this.player.body!.width, this.player.body!.height);

    if (Phaser.Geom.Rectangle.Overlaps(attackRect, playerRect)) {
      this.resetCombo(); 
      this.player.takeDamage(damage, dir); 
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
      if (!this.player.isBlocking) {
          this.hitParticles.emitParticleAt(this.player.x, this.player.y, 5);
          this.cameras.main.shake(200, 0.02);
      }
    }
  }

  private resolveBossAttack(attacker: Boss) {
    if (attacker.health <= 0) return;
    const reach = 200; 
    const dir = attacker.flipX ? -1 : 1;
    const attackRect = new Phaser.Geom.Rectangle(dir > 0 ? attacker.x : attacker.x - reach, attacker.y - attacker.height / 2, reach, attacker.height);
    const playerRect = new Phaser.Geom.Rectangle(this.player.body!.x, this.player.body!.y, this.player.body!.width, this.player.body!.height);

    if (Phaser.Geom.Rectangle.Overlaps(attackRect, playerRect)) {
      this.resetCombo();
      this.player.takeDamage(30, dir); 
      this.events.emit('update_health', this.player.health, this.player.maxHealth);
      if (!this.player.isBlocking) {
          this.hitParticles.emitParticleAt(this.player.x, this.player.y, 20);
          this.cameras.main.shake(300, 0.04);
      }
    }
  }

  private handlePlayerDeath() {
    this.player.setVelocityX(0);
    this.cameras.main.shake(500, 0.03);
    
    this.time.delayedCall(2000, () => {
        this.scene.stop('HUDScene');
        this.scene.start('GameOverScene', { score: this.score, win: false });
    });
  }
}