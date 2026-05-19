import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { GameScene } from '../scenes/GameScene.js';
import { SoundManager } from './SoundManager.js';

export class CombatManager {
  private scene: GameScene;

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  public resolvePlayerAttack(attacker: Player, type: string, enemies: Phaser.Physics.Arcade.Group, boss: Boss | null) {
    let reach = 80;
    let baseDamage = 15;

    if (type === 'uppercut') { reach = 60; baseDamage = 20; }
    if (type === 'dive') { reach = 70; baseDamage = 25; }
    if (type === 'combo') { baseDamage = 10 + (attacker.comboStep * 5); } // scales up to 25

    const dir = attacker.flipX ? -1 : 1;
    const attackRect = new Phaser.Geom.Rectangle(dir > 0 ? attacker.x : attacker.x - reach, attacker.y - attacker.height / 2, reach, attacker.height);

    let hitAnything = false;

    enemies.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      // Object pooling: ignore inactive or dead enemies
      if (!enemy.active || enemy.health <= 0) return;
      const enemyRect = new Phaser.Geom.Rectangle(enemy.body!.x, enemy.body!.y, enemy.body!.width, enemy.body!.height);

      if (Phaser.Geom.Rectangle.Overlaps(attackRect, enemyRect)) {
        enemy.takeDamage(baseDamage, dir);
        hitAnything = true;
        this.scene.emitHitParticle(enemy.x, enemy.y, 15);
        if (enemy.health <= 0) {
          this.scene.addScore(Math.floor(100 * this.scene.incrementCombo()));
        }
      }
    });

    if (boss && boss.active && boss.health > 0) {
      const bossRect = new Phaser.Geom.Rectangle(boss.body!.x, boss.body!.y, boss.body!.width, boss.body!.height);
      if (Phaser.Geom.Rectangle.Overlaps(attackRect, bossRect)) {
        boss.takeDamage(baseDamage * 0.5, dir);
        hitAnything = true;
        this.scene.emitHitParticle(boss.x, boss.y, 25);
        this.scene.incrementCombo();
      }
    }

    if (hitAnything) {
      SoundManager.playHit();
      this.scene.cameras.main.shake(150, 0.015);
      if (this.scene.getComboCount() > 1) {
        this.scene.showComboPopup(attacker.x + (50 * dir), attacker.y - 40);
      }
    } else if (type !== 'dive_land') {
      SoundManager.playSwing();
    }
  }

  public resolveEnemyAttack(attacker: Enemy, damage: number, reach: number, player: Player) {
    if (!attacker.active || attacker.health <= 0) return;
    const dir = attacker.flipX ? -1 : 1;
    const attackRect = new Phaser.Geom.Rectangle(dir > 0 ? attacker.x : attacker.x - reach, attacker.y - attacker.height / 2, reach, attacker.height);
    const playerRect = new Phaser.Geom.Rectangle(player.body!.x, player.body!.y, player.body!.width, player.body!.height);

    if (Phaser.Geom.Rectangle.Overlaps(attackRect, playerRect)) {
      this.scene.resetCombo();
      player.takeDamage(damage, dir);
      this.scene.events.emit('update_health', player.health, player.maxHealth);
      if (!player.isBlocking) {
        SoundManager.playDamage();
        this.scene.emitHitParticle(player.x, player.y, 5);
        this.scene.cameras.main.shake(200, 0.02);
      } else {
        // Assume taken care of by parry event, but if not a perfect block, it's a chip block
      }
    }
  }

  public resolveBossAttack(attacker: Boss, player: Player) {
    if (!attacker.active || attacker.health <= 0) return;
    const reach = 200;
    const dir = attacker.flipX ? -1 : 1;
    const attackRect = new Phaser.Geom.Rectangle(dir > 0 ? attacker.x : attacker.x - reach, attacker.y - attacker.height / 2, reach, attacker.height);
    const playerRect = new Phaser.Geom.Rectangle(player.body!.x, player.body!.y, player.body!.width, player.body!.height);

    if (Phaser.Geom.Rectangle.Overlaps(attackRect, playerRect)) {
      this.scene.resetCombo();
      player.takeDamage(30, dir);
      this.scene.events.emit('update_health', player.health, player.maxHealth);
      if (!player.isBlocking) {
        SoundManager.playDamage();
        this.scene.emitHitParticle(player.x, player.y, 20);
        this.scene.cameras.main.shake(300, 0.04);
      }
    }
  }
}
