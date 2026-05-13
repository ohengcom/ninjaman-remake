import Phaser from 'phaser';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private styleText!: Phaser.GameObjects.Text;

  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private currentScore: number = 0;
  private skillPoints: number = 0;
  
  private skillMenuContainer!: Phaser.GameObjects.Container;
  private isSkillMenuOpen: boolean = false;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.healthBar = this.add.graphics();
    this.drawHealthBar();

    this.healthText = this.add.text(20, 15, 'INTEGRITY', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
    });

    this.scoreText = this.add.text(w - 20, 20, 'SCORE: 0', {
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

    this.add.text(w / 2, h - 30, '[DOUBLE TAP ARROWS] Dash | [DOWN] Defend | [UP+SPACE] Uppercut | [K] Skills', {
      fontFamily: 'Arial', fontSize: '16px', color: '#aaa'
    }).setOrigin(0.5);

    this.createSkillMenu(w, h);

    const gameScene = this.scene.get('GameScene');
    
    gameScene.events.on('update_health', (health: number, max: number) => {
      this.currentHealth = health;
      this.maxHealth = max || 100;
      this.drawHealthBar();
    });

    gameScene.events.on('update_score', (score: number) => {
      const diff = score - this.currentScore;
      this.currentScore = score;
      this.scoreText.setText(`SCORE: ${this.currentScore}`);
      
      if (diff > 0 && diff % 500 === 0) {
          this.skillPoints++; // Give skill points for milestones
      }
      
      this.tweens.add({ targets: this.scoreText, scaleX: 1.2, scaleY: 1.2, duration: 100, yoyo: true });
    });

    gameScene.events.on('update_level', (level: number) => {
      let levelName = 'CITY SECTOR';
      if (level === 2) levelName = 'FOREST SECTOR';
      if (level === 3) levelName = 'CORE SECTOR';
      this.levelText.setText(`SECTOR ${level}: ${levelName}`);
    });

    gameScene.events.on('update_style', (style: string) => {
      this.styleText.setText(style);
      if (style) {
          this.styleText.setScale(2);
          this.tweens.add({ targets: this.styleText, scaleX: 1, scaleY: 1, duration: 200, ease: 'Bounce.out' });
      }
    });

    this.input.keyboard!.on('keydown-K', () => {
       this.isSkillMenuOpen = !this.isSkillMenuOpen;
       this.skillMenuContainer.setVisible(this.isSkillMenuOpen);
       if (this.isSkillMenuOpen) {
           (this.skillMenuContainer.getByName('sp_text') as Phaser.GameObjects.Text).setText(`SKILL POINTS: ${this.skillPoints}`);
           gameScene.scene.pause();
       } else {
           gameScene.scene.resume();
       }
    });
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

  private createSkillMenu(w: number, h: number) {
    this.skillMenuContainer = this.add.container(w/2, h/2);
    this.skillMenuContainer.setVisible(false);

    const bg = this.add.rectangle(0, 0, 400, 300, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(4, 0x00ffff);
    
    const title = this.add.text(0, -120, 'CYBER ENHANCEMENTS', { fontFamily: 'Impact', fontSize: '32px', color: '#00ffff' }).setOrigin(0.5);
    const spText = this.add.text(0, -80, 'SKILL POINTS: 0', { fontFamily: 'Arial', fontSize: '20px', color: '#e94560' }).setOrigin(0.5);
    spText.setName('sp_text');

    const upgradeHealthBtn = this.add.text(0, 0, '[1] MAX INTEGRITY +20 (Cost: 1 SP)', { fontFamily: 'Arial', fontSize: '18px', color: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    upgradeHealthBtn.on('pointerdown', () => {
        if (this.skillPoints > 0) {
            this.skillPoints--;
            this.maxHealth += 20;
            this.currentHealth = this.maxHealth;
            spText.setText(`SKILL POINTS: ${this.skillPoints}`);
            this.drawHealthBar();
            const gameScene = this.scene.get('GameScene');
            (gameScene as any).player.maxHealth = this.maxHealth;
            (gameScene as any).player.health = this.currentHealth;
        }
    });

    const closeText = this.add.text(0, 100, 'PRESS [K] TO CLOSE', { fontFamily: 'Arial', fontSize: '16px', color: '#aaa' }).setOrigin(0.5);

    this.skillMenuContainer.add([bg, title, spText, upgradeHealthBtn, closeText]);
  }
}