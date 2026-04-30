import Phaser from 'phaser';
import { GAME_CONFIG, LEVELS, ENEMY_TYPES } from '../utils/constants.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { LevelLoader, MapObject } from '../utils/LevelLoader.js';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private mapObjects: MapObject[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.loadLevel();
    this.setupPlayer();
    this.setupEnemies();
    this.setupCamera();
    this.setupCollisions();
    
    // Spawn some initial enemies
    this.spawnEnemies();
  }

  update(): void {
    if (this.player) {
      this.player.update();
    }
    
    this.enemies.getChildren().forEach(enemy => {
      (enemy as Enemy).update();
    });
  }

  private loadLevel(): void {
    const xmlData = this.cache.text.get('beach_xml');
    if (xmlData) {
      this.mapObjects = LevelLoader.parseXML(xmlData);
      this.buildLevel();
    } else {
      console.warn('Level XML data not found!');
      this.add.rectangle(0, 0, LEVELS.BEACH.scrollWidth, GAME_CONFIG.HEIGHT, 0x333333).setOrigin(0, 0);
    }
  }

  private buildLevel(): void {
    const scrollWidth = LEVELS.BEACH.scrollWidth;
    this.physics.world.setBounds(0, 0, scrollWidth, GAME_CONFIG.HEIGHT);

    this.mapObjects.forEach(obj => {
      if (obj.type === 'solid' || obj.type === 'door') {
        const rect = this.add.rectangle(obj.x, obj.y, obj.size.w, obj.size.h, 0x666666, 0.5);
        rect.setOrigin(0, 0);
        this.physics.add.existing(rect, true);
      } else if (obj.type === 'bg') {
        const rect = this.add.rectangle(obj.x, obj.y, obj.size.w, obj.size.h, 0x444444, 0.3);
        rect.setOrigin(0, 0);
      }
    });
  }

  private setupPlayer(): void {
    this.player = new Player(
      this,
      LEVELS.BEACH.spawn.x,
      LEVELS.BEACH.spawn.y
    );
  }

  private setupEnemies(): void {
    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true
    });
  }

  private spawnEnemies(): void {
    const spawnPoints = [
      { x: 1200, y: 620 },
      { x: 1800, y: 620 },
      { x: 2500, y: 620 }
    ];

    spawnPoints.forEach(point => {
      const enemy = new Enemy(this, point.x, point.y, ENEMY_TYPES.TONFA);
      enemy.setTarget(this.player);
      this.enemies.add(enemy);
    });
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, LEVELS.BEACH.scrollWidth, GAME_CONFIG.HEIGHT);
  }

  private setupCollisions(): void {
    const staticObjects = this.children.list.filter(
      child => child instanceof Phaser.GameObjects.Rectangle && (child as any).body?.static
    );
    
    this.physics.add.collider(this.player, staticObjects);
    this.physics.add.collider(this.enemies, staticObjects);

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private handlePlayerEnemyOverlap(
    _player: any,
    enemy: any
  ): void {
    const p = _player as Player;
    const e = enemy as Enemy;

    if (p.getIsAttacking()) {
      e.takeDamage(20);
    } else if (!p.getIsDefending()) {
      p.takeDamage(1); // Smaller damage for overlap
    }
  }
}
