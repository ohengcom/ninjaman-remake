import Phaser from 'phaser';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { GameScene } from './GameScene.js';

export class HUDScene extends Phaser.Scene {
  private fpsText: Phaser.GameObjects.Text | null = null;

  private currentHealth: number = 100;
  private maxHealth: number = 100;
  private currentScore: number = 0;
  private currentLevel: number = 1;
  private gameScene!: GameScene;

  // DOM Elements
  private domIntegrityBar: HTMLElement | null = null;
  private domHpNumeric: HTMLElement | null = null;
  private domSectorDisplay: HTMLElement | null = null;
  private domScoreValue: HTMLElement | null = null;
  private domStyleMeter: HTMLElement | null = null;
  private domStyleLetter: HTMLElement | null = null;
  private domSoundStatus: HTMLElement | null = null;
  private domSoundToggle: HTMLElement | null = null;

  private readonly onUpdateHealth = (health: number, max: number) => {
    this.currentHealth = health;
    this.maxHealth = max || 100;
    this.updateDOMHealth();
  };

  private readonly onUpdateScore = (score: number) => {
    this.currentScore = score;
    
    if (this.domScoreValue) {
      this.domScoreValue.innerText = this.currentScore.toString();
    }
  };

  private readonly onUpdateLevel = (level: number) => {
    this.currentLevel = level;
    // @ts-ignore
    import('../config/levels.js').then((module) => {
        const levelCfg = module.getLevelConfig(level);
        if (this.domSectorDisplay) {
          this.domSectorDisplay.innerText = `SECTOR ${level}: ${levelCfg.name}`;
        }
    });
  };

  private readonly onUpdateStyle = (style: string) => {
    if (!this.domStyleMeter || !this.domStyleLetter) return;
    
    if (style) {
      this.domStyleMeter.classList.add('active');
      this.domStyleLetter.innerText = style;
      
      // Reset classes
      this.domStyleLetter.className = 'style-rank-letter';
      
      const sLower = style.toLowerCase();
      if (sLower === 'c') this.domStyleLetter.classList.add('rank-c');
      else if (sLower === 'b') this.domStyleLetter.classList.add('rank-b');
      else if (sLower === 'a') this.domStyleLetter.classList.add('rank-a');
      else if (sLower === 's') this.domStyleLetter.classList.add('rank-s');
      else if (sLower.includes('ss')) this.domStyleLetter.classList.add('rank-sss');
    } else {
      this.domStyleMeter.classList.remove('active');
    }
  };

  private readonly onToggleSound = () => {
    SoundManager.toggle(this.currentLevel);
    this.updateSoundDisplay();
    SoundManager.playMenuBlip();
  };

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    this.currentScore = 0;

    // Cache DOM Elements
    this.domIntegrityBar = document.getElementById('hud-integrity-bar');
    this.domHpNumeric = document.getElementById('hud-hp-numeric');
    this.domSectorDisplay = document.getElementById('hud-sector-display');
    this.domScoreValue = document.getElementById('hud-score-value');
    this.domStyleMeter = document.getElementById('hud-style-meter');
    this.domStyleLetter = document.getElementById('hud-style-letter');
    this.domSoundStatus = document.getElementById('hud-sound-status');
    this.domSoundToggle = document.getElementById('hud-sound-toggle');

    // Register global listener for DOM sound toggle
    (window as any).toggleHUDGameSound = () => {
      this.onToggleSound();
    };

    // Set initial display
    const sd = SaveManager.load();
    this.maxHealth = sd.maxHealth;
    this.currentHealth = sd.maxHealth;
    this.updateDOMHealth();
    this.updateSoundDisplay();
    this.onUpdateLevel(this.currentLevel);

    if (this.domScoreValue) {
      this.domScoreValue.innerText = '0';
    }

    // FPS counter in dev mode
    if (import.meta.env.DEV) {
      this.fpsText = this.add.text(20, this.cameras.main.height - 30, 'FPS: 60', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#00ff00',
      });
    }

    this.gameScene = this.scene.get('GameScene') as GameScene;
    
    this.gameScene.events.on('update_health', this.onUpdateHealth);
    this.gameScene.events.on('update_score', this.onUpdateScore);
    this.gameScene.events.on('update_level', this.onUpdateLevel);
    this.gameScene.events.on('update_style', this.onUpdateStyle);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    this.input.keyboard!.on('keydown-Y', this.onToggleSound);
  }

  private updateDOMHealth() {
    if (this.domHpNumeric) {
      this.domHpNumeric.innerText = `${Math.max(0, Math.ceil(this.currentHealth))} / ${this.maxHealth}`;
    }
    if (this.domIntegrityBar) {
      const pct = Math.max(0, this.currentHealth / this.maxHealth);
      this.domIntegrityBar.style.width = `${pct * 100}%`;
      
      // Critical state blinking
      if (pct <= 0.3) {
        this.domIntegrityBar.classList.add('critical-hp');
      } else {
        this.domIntegrityBar.classList.remove('critical-hp');
      }
    }
  }

  private updateSoundDisplay() {
    if (this.domSoundStatus) {
      this.domSoundStatus.innerText = SoundManager.enabled ? 'ON' : 'OFF';
    }
    if (this.domSoundToggle) {
      if (SoundManager.enabled) {
        this.domSoundToggle.classList.add('on');
      } else {
        this.domSoundToggle.classList.remove('on');
      }
    }
  }

  private cleanup() {
    // Clear global function
    (window as any).toggleHUDGameSound = undefined;

    if (!this.gameScene) return;
    this.gameScene.events.off('update_health', this.onUpdateHealth);
    this.gameScene.events.off('update_score', this.onUpdateScore);
    this.gameScene.events.off('update_level', this.onUpdateLevel);
    this.gameScene.events.off('update_style', this.onUpdateStyle);
    this.input.keyboard?.off('keydown-Y', this.onToggleSound);
  }

  update() {
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }
  }
}
