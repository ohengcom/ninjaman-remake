import Phaser from 'phaser';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { GameScene } from './GameScene.js';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private styleText!: Phaser.GameObjects.Text;
  private fpsText: Phaser.GameObjects.Text | null = null;
  private soundText!: Phaser.GameObjects.Text;

  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private currentScore: number = 0;
  private currentLevel: number = 1;
  private gameScene!: GameScene;
  
  private skillMenuContainer!: Phaser.GameObjects.Container;
  private isSkillMenuOpen: boolean = false;
  private readonly onUpdateHealth = (health: number, max: number) => {
    this.currentHealth = health;
    this.maxHealth = max || 100;
    this.drawHealthBar();
  };
  private readonly onUpdateScore = (score: number) => {
    const diff = score - this.currentScore;
    this.currentScore = score;
    this.scoreText.setText(`SCORE: ${this.currentScore}`);
    
    if (diff > 0 && diff % 500 === 0) {
        SaveManager.addSP(1); // Give skill points for milestones
    }
    
    this.tweens.add({ targets: this.scoreText, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true });
  };
  private readonly onUpdateLevel = (level: number) => {
    this.currentLevel = level;
    let levelName = 'CITY SECTOR';
    if (level === 2) levelName = 'FOREST SECTOR';
    if (level === 3) levelName = 'CORE SECTOR';
    this.levelText.setText(`SECTOR ${level}: ${levelName}`);
  };
  private readonly onUpdateStyle = (style: string) => {
    this.styleText.setText(style);
    if (style) {
        this.styleText.setScale(2);
        this.tweens.add({ targets: this.styleText, scaleX: 1, scaleY: 1, duration: 200, ease: 'Bounce.out' });
    }
  };
  private readonly onToggleSkillMenu = () => {
     SoundManager.playMenuBlip();
     this.isSkillMenuOpen = !this.isSkillMenuOpen;
     this.skillMenuContainer.setVisible(this.isSkillMenuOpen);
     if (this.isSkillMenuOpen) {
         this.refreshMenuData();
         this.gameScene.scene.pause();
     } else {
         this.gameScene.scene.resume();
     }
  };
  private readonly onToggleSound = () => {
     SoundManager.toggle(this.currentLevel);
     this.soundText.setText(`SOUND: ${SoundManager.enabled ? 'ON' : 'OFF'}`);
     this.soundText.setColor(SoundManager.enabled ? '#00ffff' : '#aaa');
     SoundManager.playMenuBlip();
  };

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    this.currentScore = 0;

    // FPS counter in dev mode
    if (import.meta.env.DEV) {
      this.fpsText = this.add.text(20, this.cameras.main.height - 60, 'FPS: 60', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#00ff00',
      });
    }

    this.healthBar = this.add.graphics();
    this.drawHealthBar();

    this.add.text(20, 15, 'INTEGRITY', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
    });

    this.scoreText = this.add.text(w - 20, 20, `SCORE: ${this.currentScore}`, {
      fontFamily: 'Impact', fontSize: '32px', color: '#e94560',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(w / 2, 20, 'SECTOR: 1', {
      fontFamily: 'Impact', fontSize: '28px', color: '#00ffff',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0);

    this.styleText = this.add.text(w - 20, 80, '', {
      fontFamily: 'Impact', fontSize: '64px', color: '#f39c12',
      stroke: '#e94560', strokeThickness: 6, shadow: { blur: 10, color: '#f39c12', fill: true }
    }).setOrigin(1, 0);

    this.add.text(w / 2, h - 30, '[ARROWS] Move/Dash | [SPACE] Attack | [DOWN, FWD, SPACE] Wave | [DOWN] Defend | [UP+SPACE] Uppercut | [K] Skills | [M] Sound', {
      fontFamily: 'Arial', fontSize: '14px', color: '#aaa'
    }).setOrigin(0.5);

    this.soundText = this.add.text(w - 20, h - 30, 'SOUND: OFF', {
      fontFamily: 'Arial', fontSize: '16px', color: '#aaa'
    }).setOrigin(1, 0.5);

    this.createSkillMenu(w, h);

    this.gameScene = this.scene.get('GameScene') as GameScene;
    
    this.gameScene.events.on('update_health', this.onUpdateHealth);
    this.gameScene.events.on('update_score', this.onUpdateScore);
    this.gameScene.events.on('update_level', this.onUpdateLevel);
    this.gameScene.events.on('update_style', this.onUpdateStyle);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    this.input.keyboard!.on('keydown-K', this.onToggleSkillMenu);
    this.input.keyboard!.on('keydown-M', this.onToggleSound);
  }

  private drawHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x000000, 0.8);
    this.healthBar.fillRect(20, 40, 200, 20);

    const healthPercent = Math.max(0, this.currentHealth / this.maxHealth);
    const healthWidth = healthPercent * 200;
    const color = healthPercent > 0.5 ? 0x00ff00 : (healthPercent > 0.25 ? 0xffff00 : 0xff0000);
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(20, 40, healthWidth, 20);
    this.healthBar.lineStyle(2, 0xffffff, 1);
    this.healthBar.strokeRect(20, 40, 200, 20);
  }

  private refreshMenuData() {
      const sd = SaveManager.load();
      (this.skillMenuContainer.getByName('sp_text') as Phaser.GameObjects.Text).setText(`SKILL POINTS: ${sd.sp}`);
      (this.skillMenuContainer.getByName('hp_text') as Phaser.GameObjects.Text).setText(`MAX INTEGRITY: ${sd.maxHealth}`);
      
      const comboText = sd.comboLevel >= 3 ? 'MAXED (4 Hits)' : `COMBO LV ${sd.comboLevel + 1} (${sd.comboLevel + 2} Hits) - Cost: 2 SP`;
      (this.skillMenuContainer.getByName('combo_btn') as Phaser.GameObjects.Text).setText(`[CLICK] ${comboText}`);
      
      const dashText = sd.dashInvincible ? 'DASH: INVINCIBLE (MAXED)' : '[CLICK] DASH INVINCIBILITY - Cost: 3 SP';
      (this.skillMenuContainer.getByName('dash_btn') as Phaser.GameObjects.Text).setText(dashText);
  }

  private createSkillMenu(w: number, h: number) {
    this.skillMenuContainer = this.add.container(w/2, h/2);
    this.skillMenuContainer.setVisible(false);

    const bg = this.add.rectangle(0, 0, 550, 400, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(4, 0x00ffff);
    
    const title = this.add.text(0, -160, 'CYBER ENHANCEMENTS', { fontFamily: 'Impact', fontSize: '32px', color: '#00ffff' }).setOrigin(0.5);
    const spText = this.add.text(0, -110, 'SKILL POINTS: 0', { fontFamily: 'Arial', fontSize: '22px', color: '#e94560' }).setOrigin(0.5);
    spText.setName('sp_text');

    const hpText = this.add.text(0, -60, 'MAX INTEGRITY: 100', { fontFamily: 'Arial', fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    hpText.setName('hp_text');

    const upgradeHealthBtn = this.add.text(0, -20, '[CLICK] MAX INTEGRITY +20 (Cost: 1 SP)', { fontFamily: 'Arial', fontSize: '20px', color: '#00ff55' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    upgradeHealthBtn.on('pointerdown', () => {
        if (SaveManager.upgradeHealth(20, 1)) {
            SoundManager.playMenuBlip();
            this.maxHealth = SaveManager.load().maxHealth;
            this.currentHealth = this.maxHealth; // Heal fully on upgrade
            this.drawHealthBar();
            this.gameScene.upgradePlayerHealth(this.maxHealth);
            this.refreshMenuData();
        } else {
            this.tweens.add({ targets: upgradeHealthBtn, x: -10, duration: 50, yoyo: true, repeat: 3 });
        }
    });

    const upgradeComboBtn = this.add.text(0, 30, '[CLICK] COMBO LV 2', { fontFamily: 'Arial', fontSize: '20px', color: '#f39c12' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    upgradeComboBtn.setName('combo_btn');
    upgradeComboBtn.on('pointerdown', () => {
        if (SaveManager.upgradeCombo(2)) {
            SoundManager.playMenuBlip();
            this.refreshMenuData();
        } else {
            this.tweens.add({ targets: upgradeComboBtn, x: -10, duration: 50, yoyo: true, repeat: 3 });
        }
    });

    const upgradeDashBtn = this.add.text(0, 80, '[CLICK] DASH INVINCIBILITY', { fontFamily: 'Arial', fontSize: '20px', color: '#00ffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    upgradeDashBtn.setName('dash_btn');
    upgradeDashBtn.on('pointerdown', () => {
        if (SaveManager.unlockDashInvincibility(3)) {
            SoundManager.playMenuBlip();
            this.refreshMenuData();
        } else {
            this.tweens.add({ targets: upgradeDashBtn, x: -10, duration: 50, yoyo: true, repeat: 3 });
        }
    });

    const closeText = this.add.text(0, 150, 'PRESS [K] TO CLOSE', { fontFamily: 'Arial', fontSize: '16px', color: '#aaa' }).setOrigin(0.5);

    this.skillMenuContainer.add([bg, title, spText, hpText, upgradeHealthBtn, upgradeComboBtn, upgradeDashBtn, closeText]);
  }

  private cleanup() {
    if (!this.gameScene) return;

    this.gameScene.events.off('update_health', this.onUpdateHealth);
    this.gameScene.events.off('update_score', this.onUpdateScore);
    this.gameScene.events.off('update_level', this.onUpdateLevel);
    this.gameScene.events.off('update_style', this.onUpdateStyle);
    this.input.keyboard?.off('keydown-K', this.onToggleSkillMenu);
    this.input.keyboard?.off('keydown-M', this.onToggleSound);
  }

  update() {
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }
}
